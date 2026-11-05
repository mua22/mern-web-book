---
title: "3. Install and Your First Session"
tags:
  - Setup
  - Terminal
  - Permissions
---

# 3. Install and Your First Session

!!! abstract "Video map"
    Section 2 — Installing Claude Code · Using Claude Code · Running the App

## Step 1 — choose how you will pay

Claude Code needs an Anthropic account. You have two ways to pay, and the choice affects how you track usage later:

| | **Subscription** (Pro / Max) | **API (pay as you go)** |
|---|---|---|
| Billing | Fixed monthly fee | Per token used |
| Limits | A usage allowance that resets | None except your budget |
| Risk | You may hit the limit mid-task | A long session can cost more than expected |
| Check usage with | `/usage` | `/cost` |
| Good for | Learning, daily work | Automation, CI, teams with budgets |

!!! tip "Start small, watch usage"
    A free tier is enough to try it, but you will outgrow it quickly. If you choose the API, set a
    spending limit in the console and check `/cost` often while you learn. [Chapter 6](06-context-and-cost.md) explains what drives cost.

## Step 2 — install

Installation commands change, so copy them from the official docs page for your operating system
rather than from a book. In general, there is a one-line command for macOS/Linux/WSL and one each for
Windows PowerShell and Windows CMD. After it finishes, **read the output carefully**:

!!! warning "The PATH warning"
    If the installer says Claude is *not in your PATH* and prints a command, run that command. Otherwise
    typing `claude` fails with *command not found* even though the install succeeded.

Check the install:

```bash
claude --version
```

## Step 3 — open a project and start

Always start Claude **inside the project folder**, because that is the folder it can read and edit.

```bash
cd shelf          # the example project for this book
claude
```

The first run asks you to pick a colour theme and log in (with your Claude account for a subscription,
or your Anthropic Console account for the API). You then land in an interactive prompt.

??? tip "Where to run it: terminal or editor?"
    You can run `claude` in any terminal. If you use VS Code, run it in the *integrated* terminal for
    inline diffs. Many people move that terminal to the side panel so prompts stay visible while the code is open next to it.

## The four special characters

At the prompt, a few characters change behaviour:

| Type | Meaning | Example |
|---|---|---|
| `?` | Show shortcuts | `?` |
| `!` | **Bash mode** — run a shell command directly | `! npm test` |
| `@` | **Reference a file** (Tab to complete the path) | `@src/validate.js` |
| `/` | **Slash commands** — built-in controls | `/model`, `/context` |

Some keys worth learning on day one:

| Key | What it does |
|---|---|
| `Shift + Tab` | Cycle modes: normal → *accept edits* → **plan mode** |
| `Esc` | Interrupt what Claude is doing |
| `Esc Esc` | Open **rewind** to undo ([chapter 8](08-checkpoints-subagents-review.md)) |
| `Ctrl + B` | Send a long-running task to the background |
| `Ctrl + L` | Clear the text you are typing |
| `Shift + Enter` | New line in your prompt (run `/terminal-setup` once to enable) |

## Slash commands you will use first

| Command | Purpose |
|---|---|
| `/help` | List everything |
| `/init` | Generate a `CLAUDE.md` memory file ([chapter 4](04-project-memory.md)) |
| `/model` | Choose the model (larger = more capable, slower, costlier) |
| `/context` | Show what fills the context window ([chapter 6](06-context-and-cost.md)) |
| `/compact` · `/clear` | Summarise or reset the conversation |
| `/mcp` · `/agents` | Manage external tools and subagents ([chapter 7](07-mcp-and-skills.md)) |
| `/permissions` | Review what Claude may do without asking ([chapter 9](09-permissions-and-hooks.md)) |

Press `Tab` to auto-complete a command name — you rarely type the whole thing.

## Running your project: two ways

Your project has a start command. You can run it two different ways, and each has a use.

=== "Direct (fast)"

    ```text
    ! npm test
    ```
    The `!` runs the command immediately with no model involved. **Use it for commands you already know.** It costs nothing.

=== "By prompt (smart)"

    ```text
    run the tests and tell me what fails
    ```
    Claude first works out *which* command to run, then runs it — and if it fails (a missing dependency, say) it can fix the problem and retry.
    It is slower and uses tokens, but it recovers from errors on its own.

Rule of thumb: **known command → `!`; fuzzy goal or "make it work" → prompt.**

## Permissions: the first time you meet them

The first time Claude wants to use a tool — run a command, edit a file — it asks. You usually see three choices:

1. **Yes, once** — allow this single call.
2. **Yes, and don't ask again** — allow this *kind* of call from now on.
3. **No** — refuse (and optionally tell Claude what to do instead).

Read the *description* under the command: long commands are hard to parse, and the short description explains what they do.

!!! warning "Safe vs risky"
    Choose "don't ask again" for **read-only and routine** commands (`npm test`, `git status`, `git diff`).
    Keep asking for anything that deletes, publishes, spends money, or changes things outside the project.
    [Chapter 9](09-permissions-and-hooks.md) shows how to write these rules down so you are not clicking every time.

## Worked example — your first Shelf session

Start Claude in the `shelf` folder and try these three prompts, one at a time:

```text
! npm test
```
> Direct, free. You should see all 47 tests pass.

> Explain the project layout in five bullet points, and tell me which file I would edit to add a new validation rule.

> Run the server in the background and call `GET /health`. Tell me the response.

For the last prompt Claude should start `npm start` (as a **background task** — check with `/tasks`),
call the health endpoint, and report `{"ok":true}`. Stop it afterwards with the key shown in `/tasks`.

## Common mistakes

- **Launching Claude in the wrong folder** (your home directory). It then "sees" everything; always `cd` into the project first.
- **Approving everything blindly** because the prompts get tiresome. Fix that with permission rules, not by clicking *yes* without reading.
- **Forgetting installed tools need a restart.** New MCP servers and skills appear only after you exit and start again (use `claude --resume` to continue the last conversation).
- **Using the prompt for everything.** Known commands cost money via a prompt and are free with `!`.

## Check yourself

- [ ] `claude --version` works in a fresh terminal.
- [ ] I started Claude from inside the `shelf` folder.
- [ ] I ran `! npm test` and saw 47 passing.
- [ ] I can explain when to use `!` and when to use a prompt.
- [ ] I know the three permission choices and which commands I would *never* auto-approve.
