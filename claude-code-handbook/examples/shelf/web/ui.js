// Pure UI helpers: no DOM access, so they are unit-testable in Node and reusable in the browser.
// The browser imports the *same* validator as the server: one source of truth for the rules.
import { validateBook } from "../src/validate.js";
import { escapeHtml } from "../src/security.js";

/** Client-side validation for instant feedback. The server still re-validates everything. */
export function formErrors(values) {
  const body = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === "" || v == null) continue; // empty optional inputs are simply absent
    body[k] = k === "pages" || k === "rating" ? Number(v) : v;
  }
  const r = validateBook(body);
  if (r.ok) return {};
  const errors = {};
  for (const msg of r.errors) {
    const field = /"(\w+)"/.exec(msg)?.[1] ?? "form";
    errors[field] ??= msg;
  }
  return errors;
}

export const renderRow = (b) =>
  `<li class="book" data-id="${escapeHtml(b.id)}"><strong>${escapeHtml(b.title)}</strong>` +
  ` <span class="by">by ${escapeHtml(b.author)}</span>` +
  ` <span class="tag">${escapeHtml(b.status)}</span>${b.rating ? ` <span class="stars">${"★".repeat(b.rating)}</span>` : ""}</li>`;

/** Placeholder rows shown while data loads, so the layout does not jump. */
export const renderSkeleton = (n = 3) => Array.from({ length: n }, () => '<li class="skeleton" aria-hidden="true"></li>').join("");

/** One function maps the three states of any data view (loading / error / data) to markup. */
export function renderState({ loading = false, error = null, books = [] } = {}) {
  if (loading) return renderSkeleton();
  if (error) return `<li class="error" role="alert">${escapeHtml(error)}</li>`;
  if (!books.length) return '<li class="empty">No books yet. Add your first one above.</li>';
  return books.map(renderRow).join("");
}
