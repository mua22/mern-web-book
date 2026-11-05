// End-to-end smoke test: drives the real web client in a real browser against a real server.
// Setup (once):  npm i -D playwright && npx playwright install chromium
// Run:           node e2e/smoke.e2e.mjs        (not part of `npm test` — it needs a browser)
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createApp } from "../src/app.js";
import { BookStore } from "../src/store.js";

const server = createApp(new BookStore());
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const dialogs = [];
page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); }); // an alert() would mean XSS got through

let passed = 0;
const step = async (name, fn) => { await fn(); passed++; console.log(`  ok  ${name}`); };

try {
  await page.goto(base);

  await step("empty state is shown for a new shelf", async () => {
    await page.waitForSelector("li.empty");
    assert.match(await page.textContent("li.empty"), /No books yet/);
  });

  await step("invalid form shows field errors and sends no request", async () => {
    let posted = false;
    page.on("request", (r) => { if (r.method() === "POST") posted = true; });
    await page.click("button");
    assert.match(await page.textContent("#err-title"), /required/);
    assert.match(await page.textContent("#err-author"), /required/);
    assert.equal(posted, false);
  });

  await step("a valid book is added and listed", async () => {
    await page.fill("input[name=title]", "Dune");
    await page.fill("input[name=author]", "Frank Herbert");
    await page.click("button");
    await page.waitForSelector("li.book");
    assert.match(await page.textContent("li.book"), /Dune/);
    assert.equal(await page.textContent("#err-title"), "");
  });

  await step("hostile input is rendered as text, never executed", async () => {
    await page.fill("input[name=title]", "<img src=x onerror=alert(1)>");
    await page.fill("input[name=author]", "Eve");
    await page.click("button");
    await page.waitForFunction(() => document.querySelectorAll("li.book").length === 2);
    assert.ok((await page.textContent("#list")).includes("<img src=x onerror=alert(1)>"));
    assert.equal(await page.locator("#list img").count(), 0);
    assert.deepEqual(dialogs, []);
  });

  await step("server-side rule still protects when the client is bypassed", async () => {
    const res = await page.evaluate(async () => (await fetch("/books", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "x", author: "y", rating: 5 }) })).status);
    assert.equal(res, 422); // rating on an unfinished book
  });

  console.log(`\n${passed} e2e steps passed`);
} finally {
  await browser.close();
  server.close();
}
