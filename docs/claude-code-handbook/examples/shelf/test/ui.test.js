import { test } from "node:test";
import assert from "node:assert/strict";
import { formErrors, renderRow, renderState, renderSkeleton } from "../web/ui.js";

test("formErrors maps validator messages onto fields and ignores empty optionals", () => {
  assert.deepEqual(formErrors({ title: "Dune", author: "FH", pages: "" }), {});
  const e = formErrors({ title: "", author: "FH", pages: "abc" });
  assert.match(e.pages, /invalid "pages"/);
  assert.ok(e.title); // empty title is dropped, so the "required" rule reports it
});

test("renderRow escapes every dynamic value (stored XSS)", () => {
  const html = renderRow({ id: '"><x', title: "<img src=x onerror=1>", author: "<b>", status: "done", rating: 4 });
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes("<b>"));
  assert.ok(html.includes("★★★★"));
  assert.ok(html.includes("&lt;img"));
});

test("renderState covers loading, error, empty and data", () => {
  assert.equal(renderState({ loading: true }), renderSkeleton());
  assert.match(renderState({ error: "<boom>" }), /role="alert">&lt;boom&gt;/);
  assert.match(renderState({ books: [] }), /No books yet/);
  assert.match(renderState({ books: [{ id: "1", title: "A", author: "B", status: "to-read" }] }), /class="book"/);
});
