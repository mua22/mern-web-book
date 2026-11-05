// A small book store. Memory by default; pass a file path to persist as JSON.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

export class BookStore {
  #books = new Map();
  #file;

  constructor(file = null) {
    this.#file = file;
    if (file && existsSync(file)) {
      for (const b of JSON.parse(readFileSync(file, "utf8"))) this.#books.set(b.id, b);
    }
  }

  #save() {
    if (this.#file) writeFileSync(this.#file, JSON.stringify([...this.#books.values()], null, 2));
  }

  /** Filtered + sorted list (no paging). `owner` limits results to one user's books. */
  list({ status, q, sort = "created", owner } = {}) {
    let items = [...this.#books.values()].filter((b) => !b.deletedAt); // soft-deleted books are hidden
    if (owner) items = items.filter((b) => b.owner === owner);
    if (status) items = items.filter((b) => b.status === status);
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(needle));
    }
    const by = {
      created: (a, b) => a.createdAt.localeCompare(b.createdAt),
      title: (a, b) => a.title.localeCompare(b.title),
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    }[sort];
    return by ? items.sort(by) : items;
  }

  /** Same filters as list(), plus limit/offset. Returns the page and the unpaged total. */
  query({ limit = 20, offset = 0, ...filters } = {}) {
    const all = this.list(filters);
    const lim = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);
    const off = Math.max(Number.parseInt(offset, 10) || 0, 0);
    return { items: all.slice(off, off + lim), total: all.length, limit: lim, offset: off };
  }

  get(id) {
    const b = this.#books.get(id);
    return b && !b.deletedAt ? b : null;
  }

  create(data) {
    const book = {
      id: randomUUID(),
      status: "to-read",
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.#books.set(book.id, book);
    this.#save();
    return book;
  }

  update(id, patch) {
    const current = this.get(id);
    if (!current) return null;
    const next = { ...current, ...patch };
    // Moving a book out of "done" drops its rating.
    if (next.status !== "done") delete next.rating;
    this.#books.set(id, next);
    this.#save();
    return next;
  }

  /** Soft delete: the row stays (so history and references survive) but disappears from every query. */
  remove(id) {
    const current = this.get(id);
    if (!current) return false;
    this.#books.set(id, { ...current, deletedAt: new Date().toISOString() });
    this.#save();
    return true;
  }

  /** Books that were soft-deleted, for an admin "trash" view or a restore tool. */
  deleted() {
    return [...this.#books.values()].filter((b) => b.deletedAt);
  }

  stats({ owner } = {}) {
    const all = this.list({ owner });
    const rated = all.filter((b) => b.rating);
    return {
      total: all.length,
      byStatus: Object.fromEntries(
        ["to-read", "reading", "done"].map((s) => [s, all.filter((b) => b.status === s).length]),
      ),
      pagesRead: all.filter((b) => b.status === "done").reduce((n, b) => n + (b.pages ?? 0), 0),
      averageRating: rated.length
        ? Math.round((rated.reduce((n, b) => n + b.rating, 0) / rated.length) * 100) / 100
        : null,
    };
  }
}
