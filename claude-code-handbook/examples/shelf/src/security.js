// Small, dependency-free security helpers.

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape text for safe inclusion in HTML element content or quoted attributes. */
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);

/** Render a book as an HTML card. Every dynamic value is escaped; scripts are blocked by CSP. */
export function renderCard(book) {
  return `<!doctype html><meta charset="utf-8"><title>${escapeHtml(book.title)}</title>
<article class="card"><h1>${escapeHtml(book.title)}</h1><p>by ${escapeHtml(book.author)}</p>
<p>Status: ${escapeHtml(book.status)}${book.rating ? ` · ${"★".repeat(book.rating)}` : ""}</p></article>`;
}

export const CARD_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'",
  "x-content-type-options": "nosniff",
};

/** Fixed-window rate limiter: `limit` requests per `windowMs` per key. */
export class RateLimiter {
  #hits = new Map();
  constructor({ limit = 60, windowMs = 60_000, now = () => Date.now() } = {}) {
    Object.assign(this, { limit, windowMs, now });
  }
  /** @returns {{ allowed: boolean, remaining: number, retryAfterSec: number }} */
  check(key) {
    const t = this.now();
    let w = this.#hits.get(key);
    if (!w || t - w.start >= this.windowMs) {
      w = { start: t, count: 0 };
      this.#hits.set(key, w);
    }
    w.count += 1;
    const allowed = w.count <= this.limit;
    return {
      allowed,
      remaining: Math.max(0, this.limit - w.count),
      retryAfterSec: Math.ceil((w.start + this.windowMs - t) / 1000),
    };
  }
}
