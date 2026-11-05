---
title: "9. Permissions and Hooks"
tags:
  - Permissions
  - Hooks
  - Security
  - Settings
---

# 9. Permissions and Hooks *(extra chapter)*

!!! abstract "Video map"
    Extends Section 2 — the videos show approving permission prompts by hand; this chapter shows how to make those decisions **repeatable and safe**, and how to make things happen **automatically**.

Two features turn Claude Code from "an assistant I babysit" into "an assistant working inside rules I set":

- **Permissions** decide what Claude *may* do — and what it must never do.
- **Hooks** make something *always* happen at a particular moment.

## Why this matters

Clicking "yes" on every prompt is slow, and clicking "yes, always" on everything is risky. The answer is to write your decisions down in a settings file, once.

## Permissions

### The decision order

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/permission-flow.svg"
</div>

For each tool call Claude Code checks, in order: **deny rules** → **allow rules** → **ask you.** A deny rule always wins. Rules are matched against the tool and its arguments, e.g. `Bash(npm test)` or `Read(./data.json)`.

### Where the settings live

| File | Scope | Shared? |
|---|---|---|
| `~/.claude/settings.json` | All your projects | No (personal) |
| `.claude/settings.json` | This project | **Yes** — commit it |
| `.claude/settings.local.json` | This project, just you | No (git-ignored) |

### The Shelf policy

```json
--8<-- "docs/claude-code-handbook/examples/shelf/.claude/settings.json"
```

Read it as a policy:

- **Allowed without asking:** `npm test`, any `npm run …` script, `git diff`, `git status` — all read-only or project-local.
- **Denied outright:** reading `data.json` (runtime data), `rm -rf`, and `git push` (publishing is a human decision).
- Everything else still **asks**.

!!! tip "A good starting rule"
    *Allow* what is **read-only or reversible**. *Deny* what is **destructive or outward-facing** (deleting, pushing, deploying, paying). *Ask* about the rest while you build trust.

Use `/permissions` to view and edit the rules interactively.

### A note on the "dangerous" modes

Claude Code has modes that skip permission prompts. They exist for isolated sandboxes and CI runners — not for your laptop with your files and credentials.
**Do not use them on a machine that holds anything you care about** unless you fully understand the blast radius.

## Hooks

A **hook** is a shell command Claude Code runs **at a fixed point in its lifecycle** — for example, after every file edit. This is different from an instruction in `CLAUDE.md`: an instruction is a *request* the model might forget; a hook is **deterministic code that always runs.**

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/hooks-lifecycle.svg"
</div>

| Event (typical) | When it fires | Typical use |
|---|---|---|
| `PreToolUse` | Before a tool runs | Block dangerous commands; protect files |
| `PostToolUse` | After a tool succeeds | Auto-format, run tests, lint |
| `UserPromptSubmit` | When you send a prompt | Add context, log, validate |
| `Stop` | When Claude finishes a turn | Final check, notify |

The Shelf project uses one:

```json
"hooks": {
  "PostToolUse": [
    { "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npm test --silent" }] }
  ]
}
```

*Meaning:* after Claude uses `Edit` or `Write`, run the test suite. If a test now fails, Claude sees the failure and can fix it **in the same turn** — you never get handed broken code that "looked done."

!!! example "Blocking with a `PreToolUse` hook"
    A pre-hook receives details of the pending call. If it exits with a **blocking status** (documented as exit code `2`), the call is stopped and Claude is told why, so it adapts.
    Use this for rules you can express in code: "never touch `migrations/`," "never run `curl | sh`."

### Hooks vs. memory vs. permissions

| Need | Use | Why |
|---|---|---|
| "I'd like tests run" | `CLAUDE.md` | A preference |
| "Tests **must** run after every edit" | **Hook** | Deterministic |
| "Claude must **never** read `.env`" | **Deny rule** | Enforced by the tool layer |
| "Prefer this naming style" | `CLAUDE.md` | A preference |

### Hook hygiene

- **Keep them fast.** A hook that takes 30 seconds after every edit will make everything crawl. Run a focused subset, or only on specific paths.
- **Quiet output.** Use silent flags so success doesn't flood the context.
- **Be careful what runs.** A hook is a command executing on your machine automatically. Review hooks in a repository you clone **before** trusting it.
- **Exact event and field names can change.** Confirm against the current official hooks documentation.

## Security habits that go with them

1. **Never commit secrets.** Keep keys in environment variables or a secrets manager; add `.env` and `data.json` to `.gitignore`; deny `Read` on them.
2. **Treat everything the agent reads as untrusted.** A web page, a README, or an MCP tool result can contain text that *looks like instructions*. This is called **prompt injection.** Claude is trained to resist it, but you should not rely on that alone — which is another reason to keep destructive actions behind a permission prompt.
3. **Least privilege.** Give subagents only the tools they need ([chapter 8](08-checkpoints-subagents-review.md)).
4. **Review before you publish.** Pushing, deploying and spending money are human decisions — Shelf denies `git push` for exactly this reason.

## Common mistakes

- **"Allow all" to stop the prompts.** Write specific rules instead.
- **Putting must-haves in `CLAUDE.md`** and being surprised when they are skipped.
- **A slow hook** that makes every edit painful.
- **Overlapping rules** where an allow and a deny conflict — remember: deny wins.
- **Committing `settings.local.json`** (it is for your personal overrides).

## Check yourself

- [ ] I can state the permission decision order and which rule wins on a conflict.
- [ ] I wrote a project `settings.json` with allow and deny rules for my own project.
- [ ] I added a `PostToolUse` hook that runs my tests and watched it catch a broken edit.
- [ ] I can decide, for a new rule, whether it belongs in `CLAUDE.md`, a hook, or a deny rule.
