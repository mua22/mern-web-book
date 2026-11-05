import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("MCP server handshake, list tools, call tools", async () => {
  const data = join(mkdtempSync(join(tmpdir(), "shelf-")), "data.json");
  const child = spawn(process.execPath, ["mcp/shelf-mcp.js"], { env: { ...process.env, SHELF_DATA: data } });
  const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
  const rpc = async (id, method, params) => {
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    return JSON.parse((await lines.next()).value);
  };

  const init = await rpc(1, "initialize", { protocolVersion: "2024-11-05" });
  assert.equal(init.result.serverInfo.name, "shelf");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  const list = await rpc(2, "tools/list");
  assert.deepEqual(list.result.tools.map((t) => t.name), ["list_books", "add_book", "shelf_stats"]);

  const add = await rpc(3, "tools/call", { name: "add_book", arguments: { title: "Dune", author: "Frank Herbert" } });
  assert.match(add.result.content[0].text, /Dune/);

  const bad = await rpc(4, "tools/call", { name: "add_book", arguments: { title: "" } });
  assert.equal(bad.result.isError, true);

  const stats = await rpc(5, "tools/call", { name: "shelf_stats", arguments: {} });
  assert.equal(JSON.parse(stats.result.content[0].text).total, 1);

  child.kill();
});
