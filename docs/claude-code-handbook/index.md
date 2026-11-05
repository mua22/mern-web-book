---
title: "Claude Code Handbook"
tags:
  - Claude Code
  - AI Coding
  - Student Guide
---

# Claude Code Handbook

**A companion for students learning to build real software with an AI coding agent.**

This is not a transcript of a video series and it is not a replacement for one. It is the book
you keep open *next to* the videos: it explains each idea a second time in different words,
shows a different worked example you can run, warns you about the mistakes students actually make,
and fills in topics the videos do not have time for (permissions, hooks, security, troubleshooting).

!!! tip "Who this is for"
    You can write some JavaScript and have used a terminal. You have heard that AI agents can write
    code, and you want to use one **responsibly** — to move faster *and* still understand what ships.

## How the book follows the video series

The nine parts below follow the same order as the nine sections of the Claude Code video series, so
you can watch a lesson, then read the matching chapter.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/series-map.svg"
</div>

| Part | Topic | Chapters |
|---|---|---|
| 1 | Orientation | [Start here](01-start-here.md) |
| 2 | Claude Code fundamentals | [Coding agents](02-coding-agents-explained.md) · [Install](03-install-and-first-session.md) · [Memory](04-project-memory.md) · [Prompting & plan mode](05-prompting-and-plan-mode.md) · [Context & cost](06-context-and-cost.md) · [MCP & skills](07-mcp-and-skills.md) · [Safety nets](08-checkpoints-subagents-review.md) · [Permissions & hooks](09-permissions-and-hooks.md) · [Future](10-future-of-engineering.md) |
| 3 | Plan a real project | [Idea to scope](11-idea-to-scope.md) · [Stack & plan](12-stack-and-plan.md) · [Project setup](13-project-setup.md) |
| 4 | Authentication, security, testing | [Authentication](14-authentication.md) · [Forms, validation, roles](15-login-validation-roles.md) · [Audits & E2E](16-audit-and-e2e.md) |
| 5–6 | Building features | [CRUD](17-building-crud.md) · [Lists, details, safe output](18-lists-details-xss.md) |
| 7 | AI features | [AI features, jobs, metrics](19-ai-features.md) |
| 8 | Email | [Email integration](20-email-integration.md) |
| 9 | Ship it | [Production](21-shipping-to-production.md) · [Claude in GitHub & final thoughts](22-claude-in-github-and-final-thoughts.md) |
| — | Appendices | [Cheat sheet](appendix-a-cheat-sheet.md) · [Troubleshooting](appendix-b-troubleshooting.md) · [Glossary](appendix-c-glossary.md) · [Prompt library](appendix-d-prompt-library.md) · [Exercises](appendix-e-exercises.md) |

## One running example: *Shelf*

Every chapter uses the same small project so ideas build on each other: **Shelf**, a reading-list
REST API (add books, track *to-read / reading / done*, rate finished books). It was chosen because it is
small enough to read in ten minutes yet real enough to need validation, tests, authentication,
background jobs, an AI feature, email, and deployment.

- **Zero dependencies** — plain Node 20+ built-ins, so nothing to install.
- **47 automated tests** — `npm test` is green, and chapters tell you which test proves which idea.
- **Claude configuration included** — a real `CLAUDE.md`, a skill, a subagent, hooks, permissions and an MCP server.

[Download Shelf (zip)](downloads/shelf.zip){ .md-button .md-button--primary }

```bash
unzip shelf.zip && cd shelf
npm test      # 47 passing tests
npm start     # API on http://localhost:3000
```

## How to use each chapter

Every chapter has the same shape, so you always know where to look:

1. **Video map** — which lessons it pairs with.
2. **The idea in plain words** — the concept without jargon.
3. **Worked example** — real, tested Shelf code or configuration.
4. **Common mistakes** — what trips students up.
5. **Check yourself** — a short checklist before you move on.

!!! warning "Your output will differ — that is normal"
    Language models are non-deterministic. Ask the same question twice and you may get two different
    (both reasonable) answers. Do not chase identical output. Learn the *workflow*: break work into
    small steps, read every diff, and recover from mistakes.

## Conventions

- `code font` is something you type or a file name.
- Prompts you can give Claude are shown in a quoted block, like this:

> Add a `GET /stats` endpoint that returns counts by status. Follow the pattern in `src/app.js`. Add a test first.

!!! note "About versions"
    Claude Code changes quickly. Menus, model names and commands evolve. Where a detail is likely to
    drift, the chapter says so and points you to the official documentation. The *ideas* — agent loop,
    context, memory, permissions, review — stay stable.
