// Read configuration from environment variables once, validate it, and fail fast with a clear message.
import { parseKeys } from "./auth.js";

const int = (v, name, errors, { min = 1, fallback } = {}) => {
  if (v === undefined || v === "") return fallback;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) errors.push(`${name} must be an integer >= ${min} (got "${v}")`);
  return n;
};

export function loadConfig(env = process.env) {
  const errors = [];
  const production = env.NODE_ENV === "production";

  const cfg = {
    production,
    port: int(env.PORT, "PORT", errors, { min: 0, fallback: 3000 }),
    dataFile: env.SHELF_DATA || "data.json",
    keys: parseKeys(env.SHELF_KEYS),
    rateLimit: int(env.RATE_LIMIT, "RATE_LIMIT", errors, { fallback: 120 }),
    anthropicKey: env.ANTHROPIC_API_KEY || null,
    mail: env.MAIL_URL ? { url: env.MAIL_URL, apiKey: env.MAIL_API_KEY, from: env.MAIL_FROM } : null,
    emailSecret: env.EMAIL_WEBHOOK_SECRET || null,
  };

  if (env.SHELF_KEYS && cfg.keys.size === 0) errors.push("SHELF_KEYS is set but contains no valid key:owner[:role] pairs");
  if (cfg.mail && (!cfg.mail.apiKey || !cfg.mail.from)) errors.push("MAIL_URL needs MAIL_API_KEY and MAIL_FROM");
  if (production) {
    // An open API or an unsigned webhook is fine on a laptop and a disaster on the internet.
    if (cfg.keys.size === 0) errors.push("SHELF_KEYS is required in production");
    if (!cfg.emailSecret) errors.push("EMAIL_WEBHOOK_SECRET is required in production");
  }

  if (errors.length) throw new Error(`Invalid configuration:\n - ${errors.join("\n - ")}`);
  return cfg;
}
