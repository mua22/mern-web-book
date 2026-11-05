---
title: "Appendix A. Cheat Sheet"
tags:
  - Reference
  - Cheat Sheet
---

# Appendix A. Cheat Sheet

A one-page reminder. Details are in the chapters named in the right-hand column.

!!! note "Commands change"
    Claude Code is updated often. If a command here behaves differently, run `/help` or check the official documentation; the *ideas* will not have changed.

## Everyday commands

| You want to… | Do this | Chapter |
|---|---|---|
| Start a session in a project | `cd project` then `claude` | [3](03-install-and-first-session.md) |
| Ask a one-off question and exit | `claude -p "question"` | [3](03-install-and-first-session.md) |
| See what is filling the context | `/context` | [6](06-context-and-cost.md) |
| Start fresh, unrelated task | `/clear` | [6](06-context-and-cost.md) |
| Shrink a long conversation | `/compact` | [6](06-context-and-cost.md) |
| See usage and cost | `/cost`, `/usage` | [6](06-context-and-cost.md) |
| Create/refresh project memory | `/init`, then edit `CLAUDE.md` | [4](04-project-memory.md) |
| Plan without editing | Plan mode (cycle with `Shift+Tab`) | [5](05-prompting-and-plan-mode.md) |
| Undo recent agent work | Rewind to a checkpoint (`Esc` twice / `/rewind`) | [8](08-checkpoints-subagents-review.md) |
| Manage tools and servers | `/mcp` | [7](07-mcp-and-skills.md) |
| Manage rules | `/permissions` | [9](09-permissions-and-hooks.md) |
| Run a long agent in the background | `Ctrl+B` | [16](16-audit-and-e2e.md) |

## Where things live

```text
CLAUDE.md                     project memory (commit it)
.claude/settings.json         shared permissions + hooks (commit it)
.claude/settings.local.json   just for you (git-ignored)
.claude/skills/<name>/SKILL.md   a reusable procedure
.claude/agents/<name>.md      a subagent
.mcp.json                     MCP servers for this project
~/.claude/                    your personal settings, skills, memory
```

## Prompt anatomy

**Goal** · **Where** (files/patterns to follow) · **Constraints** · **How to know it's done** (tests, output)

## The working loop

1. Plan (plan mode) → 2. Small step → 3. Run tests → 4. Read the diff → 5. Commit → repeat

## Permission quick rules

- Allow: read-only and reversible (`npm test`, `git diff`)
- Deny: destructive or outward-facing (`rm -rf`, `git push`, deploys, payments)
- Ask: everything else, until you trust it

## HTTP status codes used by Shelf

| Code | Meaning |
|---|---|
| 200/201/204 | OK / created / deleted |
| 202 | Accepted for background work |
| 400 | Malformed JSON |
| 401 | Missing or unknown key |
| 403 | Known user, wrong role |
| 404 | Missing, or not yours |
| 422 | Validation failed |
| 429 | Rate limited (see `Retry-After`) |
| 501 | Feature not configured |

## Before you merge, always ask

- [ ] Did I read every changed line?
- [ ] Do tests cover the new behaviour, and could they fail?
- [ ] Any secrets, new dependencies or unescaped output?
- [ ] Would I be comfortable explaining this to a teammate?
