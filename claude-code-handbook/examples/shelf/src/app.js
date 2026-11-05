import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { validateBook } from "./validate.js";
import { authenticate } from "./auth.js";
import { renderCard, CARD_HEADERS } from "./security.js";
import { parseInbound, verifySignature } from "./mailer.js";
import { classifyGenre, summarizeNotes } from "./ai.js";
import { answerFromFaq } from "./faq.js";

const JS = "text/javascript; charset=utf-8";
// Only these exact URLs are served. No directory listing, no path joining => no path traversal.
const STATIC = {
  "/": ["../web/index.html", "text/html; charset=utf-8"],
  "/web/app.js": ["../web/app.js", JS],
  "/web/ui.js": ["../web/ui.js", JS],
  "/src/validate.js": ["./validate.js", JS],
  "/src/security.js": ["./security.js", JS],
};

const json = (res, status, body, headers = {}) => {
  res.writeHead(status, { "content-type": "application/json", ...headers });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 100_000) throw Object.assign(new Error("payload too large"), { status: 413 });
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const parseJson = (raw) => {
  try {
    return JSON.parse(raw || "null");
  } catch {
    throw Object.assign(new Error("malformed JSON"), { status: 400 });
  }
};

/**
 * @param store   BookStore
 * @param options { keys?: Map<key, owner>, limiter?: RateLimiter, jobs?: JobQueue, complete?: fn,
 *                  mailer?: { send }, emailSecret?: string, emailOwner?: string, onError?: (err, ctx) => void }
 */
export function createApp(store, options = {}) {
  const { keys, limiter, jobs, complete, mailer, emailSecret, emailOwner = "email", onError = () => {} } = options;
  // Simple in-memory counters: enough to see whether the AI-assisted email path is paying off.
  const metrics = { emailsReceived: 0, commandsHandled: 0, answeredByFaq: 0, handedToHuman: 0 };

  if (jobs && complete) {
    // Registered once: enrich a book with an AI genre and summary of its notes.
    jobs.handlers.enrich = async ({ id }) => {
      const book = store.get(id);
      if (!book) throw new Error("book vanished");
      const { genre } = await classifyGenre(complete, book);
      const patch = { genre };
      if (book.notes) patch.notesSummary = (await summarizeNotes(complete, book.notes)).summary;
      return store.update(id, patch);
    };
  }

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const parts = url.pathname.split("/").filter(Boolean); // ["books", ":id", "card"]
      const method = req.method;

      if (parts[0] === "health") return json(res, 200, { ok: true });

      // ---- the small web client: a strict allow-list of public static files ----
      if (method === "GET" && STATIC[url.pathname]) {
        const [file, type] = STATIC[url.pathname];
        res.writeHead(200, { "content-type": type, "x-content-type-options": "nosniff" });
        return res.end(await readFile(new URL(file, import.meta.url)));
      }

      // ---- inbound email webhook: authenticated by signature, not by API key ----
      if (parts[0] === "webhooks" && parts[1] === "email" && method === "POST") {
        const raw = await readBody(req);
        if (!verifySignature(emailSecret, raw, req.headers["x-signature"])) {
          return json(res, 401, { error: "bad signature" });
        }
        const email = parseJson(raw);
        const cmd = parseInbound(email);
        metrics.emailsReceived += 1;
        if (cmd.action !== "unknown") metrics.commandsHandled += 1;
        let reply = "Sorry, I did not understand. Use 'add: Title by Author' or 'done: <id>'.";
        if (cmd.action === "add") {
          const v = validateBook({ title: cmd.title, author: cmd.author });
          if (v.ok) {
            const book = store.create({ ...v.value, owner: emailOwner });
            reply = `Added "${book.title}" (id ${book.id}).`;
          } else reply = `Could not add: ${v.errors.join("; ")}`;
        } else if (cmd.action === "done") {
          const book = store.get(cmd.id);
          if (book && book.owner === emailOwner) {
            store.update(cmd.id, { status: "done" });
            reply = `Marked "${book.title}" as done.`;
          } else reply = "No such book.";
        }
        if (cmd.action === "unknown") {
          // Not a command: try to answer from the FAQ; otherwise leave it for a human.
          const question = [email?.subject, email?.text].filter(Boolean).join(" - ");
          const faq = await answerFromFaq(complete, question);
          if (faq.answer) {
            reply = faq.answer;
            cmd.action = "faq";
            metrics.answeredByFaq += 1;
          } else metrics.handedToHuman += 1;
        }
        if (mailer && email?.from) await mailer.send({ to: email.from, subject: `Re: ${email.subject ?? ""}`, text: reply });
        return json(res, 200, { action: cmd.action, reply });
      }

      // ---- authentication (when keys are configured) ----
      let owner, role;
      if (keys && keys.size) {
        const identity = authenticate(keys, req.headers);
        if (!identity) return json(res, 401, { error: "missing or invalid API key" }); // who are you?
        ({ owner, role } = identity);
      }

      // ---- rate limiting per owner (or per client address) ----
      if (limiter) {
        const r = limiter.check(owner ?? req.socket.remoteAddress ?? "anon");
        if (!r.allowed) return json(res, 429, { error: "too many requests" }, { "retry-after": String(r.retryAfterSec) });
      }

      // ---- admin-only area: authenticated but not allowed => 403 (different from 401) ----
      if (parts[0] === "admin") {
        if (role !== "admin") return json(res, 403, { error: "admin only" });
        if (parts[1] === "books" && method === "GET") return json(res, 200, store.list({}));
        if (parts[1] === "stats" && method === "GET") return json(res, 200, store.stats({}));
        if (parts[1] === "metrics" && method === "GET") {
          const handled = metrics.commandsHandled + metrics.answeredByFaq;
          const rate = metrics.emailsReceived ? Math.round((handled / metrics.emailsReceived) * 100) : null;
          return json(res, 200, { ...metrics, automationRatePercent: rate });
        }
        return json(res, 404, { error: "not found" });
      }

      if (parts[0] === "stats" && method === "GET") return json(res, 200, store.stats({ owner }));
      if (parts[0] !== "books") return json(res, 404, { error: "not found" });

      if (parts.length === 1) {
        if (method === "GET") {
          const q = Object.fromEntries(url.searchParams);
          const page = store.query({ ...q, owner });
          return json(res, 200, page.items, { "x-total-count": String(page.total) });
        }
        if (method === "POST") {
          const v = validateBook(parseJson(await readBody(req)));
          if (!v.ok) return json(res, 422, { errors: v.errors });
          return json(res, 201, store.create({ ...v.value, ...(owner ? { owner } : {}) }));
        }
      }

      if (parts.length >= 2) {
        const id = parts[1];
        const book = store.get(id);
        // Same 404 for "missing" and "someone else's": never reveal that another user's id exists.
        if (!book || (owner && book.owner !== owner)) return json(res, 404, { error: "book not found" });

        if (parts.length === 2) {
          if (method === "GET") return json(res, 200, book);
          if (method === "PATCH") {
            const v = validateBook(parseJson(await readBody(req)), { partial: true });
            if (!v.ok) return json(res, 422, { errors: v.errors });
            // A rating needs the final status, so validate the merged result too.
            const { id: _id, createdAt: _c, owner: _o, genre: _g, notesSummary: _n, ...editable } = book;
            const merged = validateBook({ ...editable, ...v.value }, { partial: false });
            if (!merged.ok) return json(res, 422, { errors: merged.errors });
            return json(res, 200, store.update(id, v.value));
          }
          if (method === "DELETE") {
            store.remove(id);
            res.writeHead(204).end();
            return;
          }
        }
        if (parts.length === 3 && parts[2] === "card" && method === "GET") {
          res.writeHead(200, CARD_HEADERS);
          return res.end(renderCard(book));
        }
        if (parts.length === 3 && parts[2] === "enrich" && method === "POST") {
          if (!jobs || !complete) return json(res, 501, { error: "AI features are not configured" });
          return json(res, 202, { jobId: jobs.enqueue("enrich", { id }) });
        }
      }
      return json(res, 405, { error: "method not allowed" });
    } catch (err) {
      const status = err.status ?? 500;
      // Unexpected failures (5xx) are reported to a hook: console in dev, an error tracker in production.
      // The client only ever sees a generic message, never a stack trace or internal detail.
      if (status >= 500) onError(err, { method: req.method, path: req.url });
      return json(res, status, { error: err.status ? err.message : "internal error" });
    }
  });
}
