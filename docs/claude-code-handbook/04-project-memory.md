---
title: "4. Project Memory (CLAUDE.md)"
tags:
  - Memory
  - CLAUDE.md
---

# 4. Project Memory (`CLAUDE.md`)

!!! abstract "Video map"
    Section 2 — Creating Project Memory

## The problem: every session starts blank

When you start a new Claude Code session it knows nothing about your project: not the folder layout,
not your libraries, not how you like code written, not which command runs the tests. Either you
re-explain every time or Claude re-discovers it by reading files — which costs time and money.

The fix is a plain-text file Claude reads at the start of **every** session: **`CLAUDE.md`**.

## What goes in it

Think of it as the onboarding note you would give a new teammate on day one. Good entries are things that
are **true across tasks** and **not obvious from the code**:

| Section | Example |
|---|---|
| Commands | `npm test` runs the suite; run it after every change |
| Layout | `validate.js` = rules, `store.js` = data, `app.js` = HTTP only |
| Conventions | Status codes: 201 create, 204 delete, 422 validation |
| Rules and "don'ts" | Do not add dependencies; never edit `data.json` |
| Gotchas | API tests start the server on port `0` |

Here is the real file from the Shelf project — every line earns its place:

```markdown
--8<-- "docs/claude-code-handbook/examples/shelf/CLAUDE.md"
```

## Create one with `/init`

Run `/init` and Claude explores your project and writes a first draft. Two important truths about it:

1. **The output differs every time** (models are non-deterministic). Do not treat the draft as sacred.
2. **You must review and trim it.** A draft written by an agent often includes obvious things and misses your real rules.

Then commit the file so teammates (and CI) share it.

!!! tip "Let Claude update it for you"
    When Claude makes the same mistake twice, say: *"Add a rule to CLAUDE.md so you do not do that again."*
    Teaching the file is faster than repeating yourself in every prompt.

## Keep it small — it is loaded every time

`CLAUDE.md` is sent with **every** request. That makes it powerful and expensive in the same breath:

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/memory-loading.svg"
</div>

- Short, specific instructions beat long essays — models follow a handful of clear rules better than fifty vague ones.
- Delete outdated lines. A stale rule is worse than no rule.
- Move *task-specific* playbooks into **skills** ([chapter 7](07-mcp-and-skills.md)), which load only when needed.

??? info "Where memory files can live"
    - **Project root** `./CLAUDE.md` — shared with the team, checked into git. The most common choice.
    - **Your home folder** `~/.claude/CLAUDE.md` — your personal preferences across all projects.
    - **Sub-folders** — a `CLAUDE.md` inside `server/` applies when Claude works in that part of the code.

    The exact lookup rules can evolve; check the official docs. You can also reference other files from a memory file.

## Memory vs. instruction vs. enforcement

A common confusion: `CLAUDE.md` is **guidance**, not a lock. Claude usually follows it, but nothing *forces* it to.

| Need | Use |
|---|---|
| "Please prefer X" | `CLAUDE.md` |
| "Always run tests after editing" (must happen) | A **hook** ([chapter 9](09-permissions-and-hooks.md)) |
| "Never read or run Y" | A **permission deny rule** ([chapter 9](09-permissions-and-hooks.md)) |

## Worked example — memory in action

1. Delete `CLAUDE.md` from a *copy* of Shelf and start Claude. Ask: *"Add a `GET /books/:id/exists` route."*
   Notice what it guesses (maybe it edits tests, maybe it adds a dependency, maybe it puts logic in the wrong file).
2. Restore `CLAUDE.md` and ask the same thing in a fresh session. Compare: it should write a test first, keep rules out of `app.js`, and run `npm test`.
3. Note which lines of `CLAUDE.md` changed its behaviour. Those are the high-value lines. Keep those; trim the rest.

This experiment is the best way to *feel* why memory matters.

## Commit with Claude

Once a change is reviewed, you can also ask Claude to make the commit:

> commit

Claude inspects the diff, writes a descriptive message, and runs `git commit`. This is slower than typing
the git commands yourself because it must work out what changed (it uses tokens), but the messages are
consistent and well written. A commit after every reviewed step is your safety net ([chapter 8](08-checkpoints-subagents-review.md)).

## Common mistakes

- **Pasting the entire architecture into it.** It balloons the context for every prompt.
- **Writing wishes instead of rules** ("write good code"). Rules must be checkable: "Run `npm test` after every change."
- **Never pruning.** Review the file monthly; remove what is outdated.
- **Assuming it is enforced.** It is a strong hint. Use hooks/permissions for must-haves.
- **Committing secrets into it.** The file is shared; never put keys or passwords in it.

## Check yourself

- [ ] I can explain why memory exists and what it costs.
- [ ] I ran `/init` and then edited the result down to what is *true and non-obvious*.
- [ ] I committed `CLAUDE.md`.
- [ ] I know which rules belong in `CLAUDE.md`, which need a hook, and which need a deny rule.
