// Outbound mail behind a tiny interface, plus inbound-email handling for a webhook.
import { createHmac, timingSafeEqual } from "node:crypto";

/** Records messages in memory: used in tests and local development. */
export class MemoryMailer {
  sent = [];
  async send(message) {
    this.sent.push({ ...message, at: new Date().toISOString() });
    return { id: `mem-${this.sent.length}` };
  }
}

/** Generic JSON-over-HTTPS provider mailer (shape matches most "send mail" APIs). */
export class HttpMailer {
  constructor({ url, apiKey, from, fetchImpl = fetch }) {
    Object.assign(this, { url, apiKey, from, fetchImpl });
  }
  async send({ to, subject, text }) {
    const res = await this.fetchImpl(this.url, {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ from: this.from, to, subject, text }),
    });
    if (!res.ok) throw new Error(`mail provider ${res.status}`);
    return { id: res.headers.get("x-message-id") ?? "unknown" };
  }
}

/** HMAC-SHA256 signature check so only your mail provider can call the webhook. */
export function verifySignature(secret, rawBody, signatureHex) {
  if (!secret || typeof signatureHex !== "string") return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let given;
  try {
    given = Buffer.from(signatureHex, "hex");
  } catch {
    return false;
  }
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Turn an inbound email into a command. Supported subjects:
 *   "add: Title by Author"   -> { action: "add", title, author }
 *   "done: <id>"             -> { action: "done", id }
 */
export function parseInbound(email) {
  const subject = String(email?.subject ?? "").trim();
  const add = /^add:\s*(.+?)\s+by\s+(.+)$/i.exec(subject);
  if (add) return { action: "add", title: add[1].trim(), author: add[2].trim() };
  const done = /^done:\s*([\w-]+)$/i.exec(subject);
  if (done) return { action: "done", id: done[1] };
  return { action: "unknown" };
}
