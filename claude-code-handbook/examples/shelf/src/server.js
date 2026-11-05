import { createApp } from "./app.js";
import { BookStore } from "./store.js";
import { loadConfig } from "./config.js";
import { RateLimiter } from "./security.js";
import { JobQueue } from "./jobs.js";
import { anthropicComplete } from "./ai.js";
import { MemoryMailer, HttpMailer } from "./mailer.js";

let cfg;
try {
  cfg = loadConfig();
} catch (err) {
  console.error(err.message); // fail fast, with every problem listed at once
  process.exit(1);
}

const app = createApp(new BookStore(cfg.dataFile), {
  keys: cfg.keys, // empty = open API (local dev only; production refuses to start like that)
  limiter: new RateLimiter({ limit: cfg.rateLimit, windowMs: 60_000 }),
  jobs: new JobQueue(),
  complete: cfg.anthropicKey ? anthropicComplete({ apiKey: cfg.anthropicKey }) : undefined,
  mailer: cfg.mail ? new HttpMailer(cfg.mail) : new MemoryMailer(),
  emailSecret: cfg.emailSecret,
  // One structured line per unexpected error. Swap this function for Sentry's captureException in production.
  onError: (err, ctx) => console.error(JSON.stringify({ level: "error", message: err.message, stack: err.stack, ...ctx })),
});

const server = app.listen(cfg.port, () => console.log(`Shelf API on http://localhost:${cfg.port}`));

// Graceful shutdown: let in-flight requests finish when the platform sends SIGTERM.
process.on("SIGTERM", () => server.close(() => process.exit(0)));
