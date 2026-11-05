// A minimal MCP server (stdio transport, JSON-RPC 2.0, newline-delimited) that exposes the
// Shelf store to Claude as tools. No SDK: the protocol is small enough to read in one sitting.
import { createInterface } from "node:readline";
import { BookStore } from "../src/store.js";
import { validateBook } from "../src/validate.js";

const store = new BookStore(process.env.SHELF_DATA ?? "data.json");

const tools = [
  {
    name: "list_books",
    description: "List books on the shelf. Optional filters: status (to-read|reading|done), q (search text).",
    inputSchema: {
      type: "object",
      properties: { status: { type: "string", enum: ["to-read", "reading", "done"] }, q: { type: "string" } },
    },
    run: (args) => store.list(args),
  },
  {
    name: "add_book",
    description: "Add a book. Requires title and author; optional pages, status.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        pages: { type: "integer" },
        status: { type: "string", enum: ["to-read", "reading", "done"] },
      },
      required: ["title", "author"],
    },
    run: (args) => {
      const v = validateBook(args);
      if (!v.ok) throw new Error(v.errors.join("; "));
      return store.create(v.value);
    },
  },
  { name: "shelf_stats", description: "Counts by status, pages read, average rating.", inputSchema: { type: "object", properties: {} }, run: () => store.stats() },
];

const reply = (id, result) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
const fail = (id, code, message) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return fail(null, -32700, "parse error");
  }
  const { id, method, params } = msg;
  if (id === undefined) return; // notifications (e.g. notifications/initialized) need no reply

  switch (method) {
    case "initialize":
      return reply(id, {
        protocolVersion: params?.protocolVersion ?? "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "shelf", version: "1.0.0" },
      });
    case "tools/list":
      return reply(id, { tools: tools.map(({ run, ...t }) => t) });
    case "tools/call": {
      const tool = tools.find((t) => t.name === params?.name);
      if (!tool) return fail(id, -32602, `unknown tool ${params?.name}`);
      try {
        const out = tool.run(params.arguments ?? {});
        return reply(id, { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
      } catch (e) {
        return reply(id, { isError: true, content: [{ type: "text", text: e.message }] });
      }
    }
    case "ping":
      return reply(id, {});
    default:
      return fail(id, -32601, `method not found: ${method}`);
  }
});
