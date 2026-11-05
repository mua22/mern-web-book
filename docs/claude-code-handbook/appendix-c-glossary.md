---
title: "Appendix C. Glossary"
tags:
  - Reference
  - Glossary
---

# Appendix C. Glossary

Short, plain definitions. Terms are alphabetical.

**Agent (coding agent)** — A program that uses a language model in a loop: it decides on an action (read a file, run a command), sees the result, and decides the next action until the task is done. See [chapter 2](02-coding-agents-explained.md).

**API key** — A secret string that identifies a caller to a service. Treat it like a password.

**Authentication** — Proving *who* you are. **Authorization** — deciding *what* you may do.

**Checkpoint** — A saved state of your files and conversation that you can rewind to. See [chapter 8](08-checkpoints-subagents-review.md).

**CI/CD** — Continuous integration / delivery: automatic tests and deployment on every change.

**`CLAUDE.md`** — A file in your project that Claude reads at the start of every session: your commands, layout and rules.

**Context window** — The amount of text (measured in tokens) the model can consider at once: your conversation, files it read, tool results.

**CRUD** — Create, Read, Update, Delete: the four basic data operations.

**CSP (Content Security Policy)** — A response header that tells the browser which scripts and resources may run; a second line of defence against XSS.

**Dead-letter list** — Where a background job goes after it has failed every retry, so a human can inspect it.

**E2E (end-to-end) test** — A test that drives the real application through a real browser, like a user.

**Escaping** — Replacing characters like `<` with harmless text (`&lt;`) so data cannot be interpreted as code.

**Hook** — A command that Claude Code runs automatically at a defined moment (before/after a tool call, on notification…). See [chapter 9](09-permissions-and-hooks.md).

**HMAC** — A signature made from a message and a shared secret; used to prove that a webhook really came from the provider.

**Idempotent** — Doing it twice has the same effect as doing it once. Essential for webhooks and retries.

**JWT (JSON Web Token)** — A signed token holding claims about a user; the server can check it without a database lookup, but cannot easily revoke it.

**MCP (Model Context Protocol)** — An open standard for connecting an AI application to tools and data sources. See [chapter 7](07-mcp-and-skills.md).

**Migration** — A versioned change to a database schema.

**MVP** — Minimum viable product: the smallest version that really solves the problem.

**ORM** — Object-relational mapper: a library that lets you work with database rows as objects.

**Plan mode** — A Claude Code mode in which the agent can read and propose but not edit. See [chapter 5](05-prompting-and-plan-mode.md).

**Permission rule** — An allow/deny/ask rule for a tool call, stored in `settings.json`.

**Prompt injection** — Text in data the agent reads (a web page, an issue, a file) that tries to give the agent instructions. Treat fetched content as data, not orders.

**Rate limiting** — Restricting how many requests a caller may make in a period.

**Refactoring** — Changing code structure without changing behaviour.

**Skill** — A folder with a `SKILL.md` describing a reusable procedure that Claude loads when relevant.

**Soft delete** — Marking a record as deleted (`deletedAt`) instead of removing it.

**Subagent** — A helper agent with its own fresh context, instructions and tool limits, used for focused jobs such as review or testing.

**Token** — A chunk of text (roughly three-quarters of a word) that models read and write; the unit of context size and cost.

**Webhook** — An HTTP request that a service sends to your server when something happens (e.g. an email arrived).

**XSS (cross-site scripting)** — An attack where a stranger's script runs in your user's browser because untrusted data was displayed as HTML.
