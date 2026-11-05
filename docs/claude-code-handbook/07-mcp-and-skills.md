---
title: "7. Extending Claude: MCP and Skills"
tags:
  - MCP
  - Skills
  - Tools
---

# 7. Extending Claude: MCP and Skills

!!! abstract "Video map"
    Section 2 — Model Context Protocol · Adding Tools · Creating Skills · Adding Skills

Out of the box Claude has built-in tools (read, edit, search, run commands). You can extend it in two very different ways. Confusing them is the most common beginner mistake, so let's separate them clearly.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/extension-map.svg"
</div>

| | **MCP server** | **Skill** |
|---|---|---|
| Gives Claude… | **Access** to something (a service, a database, a browser) | **Know-how** for a task (steps, format, conventions) |
| It is… | A running program | A Markdown file |
| Example | "Talk to GitHub / a database / my app" | "How we add an endpoint here" |
| Context cost | Tool descriptions load **always** | Short description loads always; full text only **when used** |

## Part A — MCP, the Model Context Protocol

### The problem it solves

Suppose every AI tool had to write custom code to talk to GitHub, Slack, Postgres, and hundreds of other services — and re-do it
whenever an API changes. That does not scale, and only the AI vendor could add integrations.

**MCP** splits the problem in two, using a standard message format:

- An **MCP server** wraps one external system. It knows that system's quirks (auth, message formats). If the service changes, only the server updates.
- An **MCP client** lives inside the host app (Claude Code). It knows nothing about GitHub or Postgres — only how to ask *any* server **"what tools do you have?"** and **"call this one."**

It is the same idea as a web browser: one HTTP client can talk to every website, so it needs no custom code per site.

### What really travels over the wire

An MCP server over *stdio* is just a program that reads JSON lines on its input and writes JSON lines on its output. Here is a genuine
exchange with the Shelf MCP server included in this book (shortened for readability):

```text
→ {"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}
← {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"shelf","version":"1.0.0"}}}

→ {"jsonrpc":"2.0","id":2,"method":"tools/list"}
← {"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"list_books","description":"List books on the shelf. …","inputSchema":{…}}, {"name":"add_book", …}, {"name":"shelf_stats", …}]}}

→ {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add_book","arguments":{"title":"Emma","author":"Jane Austen","pages":474}}}
← {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"{ \"id\": \"455ecd2b-…\", \"status\": \"to-read\", \"title\": \"Emma\", … }"}]}}
```

That is the whole idea: **initialise → list tools → call a tool.** When Claude Code starts, it does the first two steps with every registered server, so the
tool *names and descriptions* become part of the context. Later, when you ask for something, Claude picks the right tool and calls it.

### Build one yourself — the Shelf MCP server

The server is about 70 lines with no SDK. Its three tools wrap the same `BookStore` the HTTP API uses, and it **reuses the same validator**, so rules cannot drift between the two doors into your data.

```javascript
--8<-- "docs/claude-code-handbook/examples/shelf/mcp/shelf-mcp.js:9:39"
```

Register it so Claude can use it. The project-level file `.mcp.json` is shared with your team:

```json
--8<-- "docs/claude-code-handbook/examples/shelf/.mcp.json"
```

You can also add servers from the command line (`claude mcp add …`) and list them with `/mcp`. **Restart Claude after adding one** — the tools are discovered at startup.

Now try it:

> Using the shelf tools, add "Cosmos" by Carl Sagan, then show me the stats.

Claude should call `add_book` and `shelf_stats`. You will be asked for permission the first time for each tool.

??? tip "Test an MCP server without Claude"
    Because the protocol is plain JSON lines, you can test with a pipe — and the project does exactly that in `test/mcp.test.js`
    (spawn the process, send `initialize`, `tools/list`, `tools/call`, assert the replies). Testing a server alone is far easier than debugging it through an agent.

### Choose servers sparingly

!!! warning "Every server costs context"
    Each connected server adds its tools' names, descriptions and schemas to **every** request. Many servers mean higher cost, more clutter, and more tools for Claude to choose between (and choose wrong).
    Add only what you will use this week; remove the rest. Use `/context` to see the "MCP tools" slice.

Popular servers include ones for GitHub, Slack, databases, browser automation, documents and error monitoring. A particularly useful category for students is a **documentation server**: models are trained up to a cutoff date, so they sometimes suggest APIs that were renamed or removed. A server that fetches *current* docs for a library fixes that class of error — instruct Claude to use it (or put that instruction in `CLAUDE.md` so you do not repeat yourself).

!!! danger "Treat third-party servers like third-party code"
    An MCP server runs on your machine with your permissions and feeds text into your agent's context. Install servers only from sources you trust,
    read what they request, and never put real secrets into shared config files. Keep API keys in environment variables.

## Part B — Skills

A **skill** is a Markdown file of instructions that teaches Claude *how* to do a recurring job. If you notice yourself typing the same instructions again and again — "when deploying, run the tests, then build, then…" — that is a skill waiting to be written.

### Anatomy

A skill lives at `.claude/skills/<name>/SKILL.md`: **one folder per skill**, and the file must be named `SKILL.md`. The top of the file (the *frontmatter*) has a `name` and a `description`; the body is the instructions.

```markdown
--8<-- "docs/claude-code-handbook/examples/shelf/.claude/skills/add-endpoint/SKILL.md"
```

Notice what makes it good:

- A **trigger-rich description** — it tells Claude *when* to use it ("new route, query parameter, resource action").
- **Numbered steps in order**, with a stop condition ("stop and report if a step fails").
- **Hard rules** at the end (never add dependencies; never edit tests to turn them green).
- It points at things that exist in the project (`test/api.test.js`, `src/validate.js`).

### How skills load — and why that matters

At startup Claude loads only each skill's **name and short description** (a few dozen tokens). The **full body** is loaded only when the skill is used.
That is why skills are the right home for long procedures that would bloat `CLAUDE.md` (which is loaded every time).

The skill's name also becomes a slash command: type `/add-endpoint` to run it, or just describe the task and let Claude pick it by its description.

### Making one

You can write the file by hand, or ask Claude: *"Create a skill called `add-endpoint` for adding routes to this project."* If it creates the file in the wrong place, move it:

```text
.claude/skills/add-endpoint/SKILL.md      ✔ one folder per skill, file named SKILL.md
.claude/skills/add-endpoint.md            ✘ wrong shape — Claude will not find it
```

Claude's first draft is usually generic or partly invented. **Review and tighten it** against your real commands and conventions. Then restart Claude (resume your session with `claude --resume`) and check it appears in `/skills`.

Skills in `.claude/skills/` inside the project are shared through git. Personal ones go in your home folder's `.claude/skills/`.

### Using skills other people wrote

There are public collections of ready-made skills, for example for front-end design, documents, or testing. Browse them like you would a package registry — and apply the same caution: **read a skill before installing it.** It is instructions your agent will follow.

## Skill, MCP, subagent or hook?

| You want… | Reach for |
|---|---|
| Claude to *reach* GitHub, a DB, a browser | **MCP server** |
| Claude to follow *your procedure* for a task | **Skill** |
| A messy job done **off to the side** (long searches, test output) | **Subagent** ([chapter 8](08-checkpoints-subagents-review.md)) |
| Something to happen **every time, automatically** (format, test, block) | **Hook** ([chapter 9](09-permissions-and-hooks.md)) |
| Short, always-true project facts | **`CLAUDE.md`** ([chapter 4](04-project-memory.md)) |

## Common mistakes

- **Mixing up skills and MCP.** If you want a *procedure*, write a skill. If you want a *connection*, use an MCP server.
- **Wrong file layout** for a skill (no folder, or not `SKILL.md`).
- **Forgetting to restart** after adding a server or skill.
- **A vague skill description**, so Claude never picks it.
- **Installing a dozen MCP servers** and wondering why everything is slow and costly.
- **Putting secrets in `.mcp.json`.** It is committed. Use environment variables.

## Check yourself

- [ ] I can explain MCP with the browser/website analogy.
- [ ] I piped JSON into the Shelf MCP server and saw `initialize`, `tools/list` and `tools/call` work.
- [ ] I registered the server with Claude and used one of its tools.
- [ ] I wrote (or reviewed) a skill with a clear description and ordered steps.
- [ ] I can say, for a given need, whether it is an MCP server, a skill, a subagent, or a hook.
