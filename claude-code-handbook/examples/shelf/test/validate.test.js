import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBook } from "../src/validate.js";

test("accepts a minimal valid book and trims strings", () => {
  const r = validateBook({ title: "  Dune ", author: "Frank Herbert" });
  assert.equal(r.ok, true);
  assert.equal(r.value.title, "Dune");
});

test("requires title and author on create", () => {
  const r = validateBook({});
  assert.equal(r.ok, false);
  assert.deepEqual(r.errors, ['"title" is required', '"author" is required']);
});

test("partial mode does not require fields", () => {
  assert.equal(validateBook({ pages: 300 }, { partial: true }).ok, true);
});

test("rejects unknown fields and bad types", () => {
  const r = validateBook({ title: "A", author: "B", pages: "12", isbn: "x" });
  assert.equal(r.ok, false);
  assert.ok(r.errors.includes('unknown field "isbn"'));
  assert.ok(r.errors.includes('invalid "pages"'));
});

test("rating only allowed for finished books", () => {
  assert.equal(validateBook({ title: "A", author: "B", rating: 4 }).ok, false);
  assert.equal(validateBook({ title: "A", author: "B", status: "done", rating: 4 }).ok, true);
});

test("rejects non-object bodies", () => {
  assert.equal(validateBook(null).ok, false);
  assert.equal(validateBook([]).ok, false);
});
