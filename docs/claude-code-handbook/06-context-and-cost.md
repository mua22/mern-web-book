---
title: "6. Context Window and Cost"
tags:
  - Context
  - Tokens
  - Cost
---

# 6. The Context Window and Cost

!!! abstract "Video map"
    Section 2 — Managing the Context · Tracking Cost and Usage

If you understand only one mechanism inside Claude Code, make it this one. It explains **quality**
(why long sessions get worse), **speed**, and **cost** (why one long session can drain your plan).

## What the context window is

The **context window** is Claude's working memory: everything it can "see" at one moment. It holds the
conversation so far, the files it has read, command output, your `CLAUDE.md`, and the descriptions of its tools.
It has a fixed size, measured in **tokens**.

!!! info "What is a token?"
    A token is a chunk of text — roughly **three-quarters of a word** in English. Models do not read letters or words;
    they read tokens. A 200,000-token window is very roughly 150,000 words of everything combined.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/context-window.svg"
</div>

Some parts of the window are **always there** (system instructions, tool definitions, `CLAUDE.md`).
Others **grow as you work** (messages, file contents, tool results). When the window fills:

- quality drops — the model forgets earlier details or contradicts itself;
- speed drops — every request re-sends everything;
- cost rises — more input tokens per message.

## See it with `/context`

Run `/context` at any time. You get a breakdown by category: system prompt, system tools, MCP tools, memory files,
skills, and messages, with a percentage of the window used. Make it a habit to glance at it **before** a long task.

??? example "Exercise: measure it yourself (5 minutes)"
    1. Start Claude in `shelf`, run `/context`, note the percentage.
    2. Ask: *"Read every file in `src/` and `test/` and summarise the project."* Run `/context` again.
    3. Run `/compact`, then `/context` once more.
    4. Run `/clear`, then `/context` a last time.

    Write the four numbers down. You will see messages grow, `/compact` shrink them, and `/clear` reset them — but never to zero,
    because system prompt, tools and memory always remain.

## Three tools for managing it

| Command | What it does | Use it when |
|---|---|---|
| `/clear` | Wipes the conversation; starts fresh | You switch to a **completely unrelated** task |
| `/compact` | Replaces history with a summary | You continue **related** work but the window is filling |
| Auto-compact | Claude summarises automatically near the limit | Safety net — don't rely on it |

!!! tip "The golden habit"
    **New task → `/clear`.** Carrying yesterday's unrelated conversation into today's task is the single biggest waste of context.
    You can also tell `/compact` what matters: *"/compact keep the decisions about the validation rules."*

## Why context equals cost

Each time you send a message, the model receives **the system instructions, your `CLAUDE.md`, and the entire conversation history** again.
A long conversation therefore means **more input tokens on every single request**, not just the new message.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/memory-loading.svg"
</div>

So the cost levers are the same as the context habits:

| Lever | Effect |
|---|---|
| `/clear` between unrelated tasks | Biggest saving |
| `/compact` during related work | Shrinks history |
| Lean `CLAUDE.md` | Saves tokens on every request |
| Only the MCP servers you need | Each server's tool descriptions live in context |
| Subagents for noisy work | Raw test/log output stays out of your main window ([chapter 8](08-checkpoints-subagents-review.md)) |
| Smaller model for simple tasks | Lower price per token |

## Tracking usage

- **API users:** `/cost` shows what the current session has spent.
- **Subscription users:** `/usage` shows how much of your session and weekly allowance is used. (`/cost` is not meaningful on a flat-fee plan.)

!!! warning "Watch the first week"
    People new to agents are surprised how fast a plan or a budget disappears. Check usage after your first few long sessions
    and adjust habits before it becomes a problem.

## Worked example — keeping a Shelf session lean

Suppose you finish "add pagination" and next want to "add an email webhook." These are unrelated.

```text
# 1. Make sure the first task is committed
! git status
commit
# 2. Reset the conversation
/clear
# 3. Start the new task with only what it needs
@src/mailer.js  Add a signature-verified POST /webhooks/email endpoint. Plan first.
```

What you did: preserved the finished work in git (permanent), threw away the conversation (disposable),
and gave the new task a clean, small context that contains only the file it needs.

## Common mistakes

- **Never clearing.** One conversation for a whole week of unrelated work.
- **Pasting huge logs into the chat.** Point Claude at the file, or let a subagent summarise it.
- **Installing many MCP servers "just in case".** Each one adds always-on tool descriptions.
- **Ignoring `/context` until quality collapses.** Look early.
- **Confusing `/compact` with saving.** A summary can drop detail. Decisions that matter belong in a file (`CLAUDE.md`, a plan document) or a commit.

## Check yourself

- [ ] I can define *context window* and *token* in my own words.
- [ ] I ran the `/context` → `/compact` → `/clear` experiment and recorded the numbers.
- [ ] I can explain why a long conversation costs more per message.
- [ ] I know the difference between `/cost` and `/usage` and which one applies to me.
- [ ] I `/clear` when I switch tasks.
