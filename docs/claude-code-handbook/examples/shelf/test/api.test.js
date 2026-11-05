import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { BookStore } from "../src/store.js";

let server, base;
const call = async (path, opts = {}) => {
  const res = await fetch(base + path, {
    ...opts,
    headers: { "content-type": "application/json" },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
};

before(async () => {
  server = createApp(new BookStore());
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

test("health check", async () => {
  assert.deepEqual((await call("/health")).body, { ok: true });
});

test("create, read, update, delete lifecycle", async () => {
  const created = await call("/books", { method: "POST", body: { title: "Dune", author: "Frank Herbert", pages: 412 } });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, "to-read");
  const id = created.body.id;

  assert.equal((await call(`/books/${id}`)).body.title, "Dune");

  const done = await call(`/books/${id}`, { method: "PATCH", body: { status: "done", rating: 5 } });
  assert.equal(done.status, 200);
  assert.equal(done.body.rating, 5);

  assert.equal((await call(`/books/${id}`, { method: "DELETE" })).status, 204);
  assert.equal((await call(`/books/${id}`)).status, 404);
});

test("validation errors return 422 with messages", async () => {
  const r = await call("/books", { method: "POST", body: { title: "" } });
  assert.equal(r.status, 422);
  assert.ok(r.body.errors.length >= 1);
});

test("PATCH cannot add a rating to an unfinished book", async () => {
  const { body: b } = await call("/books", { method: "POST", body: { title: "Emma", author: "Jane Austen" } });
  const r = await call(`/books/${b.id}`, { method: "PATCH", body: { rating: 3 } });
  assert.equal(r.status, 422);
});

test("moving a book out of done drops the rating", async () => {
  const { body: b } = await call("/books", { method: "POST", body: { title: "Ulysses", author: "James Joyce", status: "done", rating: 2 } });
  const r = await call(`/books/${b.id}`, { method: "PATCH", body: { status: "reading" } });
  assert.equal(r.body.rating, undefined);
});

test("filter, search and sort", async () => {
  await call("/books", { method: "POST", body: { title: "Zebra Tales", author: "A. Writer", status: "done", rating: 5 } });
  await call("/books", { method: "POST", body: { title: "Alpha Notes", author: "B. Writer", status: "done", rating: 3 } });
  const done = (await call("/books?status=done&sort=title")).body.map((b) => b.title);
  assert.deepEqual(done, [...done].sort((a, b) => a.localeCompare(b)));
  const hit = (await call("/books?q=zebra")).body;
  assert.equal(hit.length, 1);
});

test("stats summarise the shelf", async () => {
  const s = (await call("/stats")).body;
  assert.ok(s.total >= 3);
  assert.equal(typeof s.byStatus.done, "number");
});

test("bad JSON gives 400 and unknown route gives 404", async () => {
  const res = await fetch(base + "/books", { method: "POST", headers: { "content-type": "application/json" }, body: "{oops" });
  assert.equal(res.status, 400);
  assert.equal((await call("/nope")).status, 404);
});
