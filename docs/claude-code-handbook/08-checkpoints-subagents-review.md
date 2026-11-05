---
title: "8. Safety Nets: Checkpoints, Subagents, Review"
tags:
  - Checkpoints
  - Subagents
  - Code Review
---

# 8. Safety Nets: Checkpoints, Subagents and AI Review

!!! abstract "Video map"
    Section 2 — Checkpointing · Creating Subagents · AI Code Review

Working with an agent means sometimes it will take a wrong turn. Skilled users are not people whose agent never errs;
they are people who can **undo cheaply, keep noisy work out of the way, and review critically.** This chapter gives you all three.

## 1. Checkpoints — an undo button for the project

Every time Claude edits a file with its editing tools, Claude Code quietly saves a snapshot first. You do nothing; it just happens.
To go back, press **`Esc` twice** or run **`/rewind`**. You see your conversation as a list of steps; pick the point you want to return to, then choose what to restore:

| Restore… | When |
|---|---|
| **Code and conversation** | The whole attempt was a dead end; you want to re-try the prompt from scratch |
| **Conversation only** | The code is fine, but the chat has gone off-topic |
| **Code only** | You like the discussion but not the edits |
| **Nothing** | You opened it by accident |

After rewinding, your earlier prompt is placed back in the input box so you can **edit it and try again** — perfect for exploring alternatives:
rewind, ask for "three design options," pick one, and if you dislike the result, rewind again and pick another.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/checkpoints.svg"
</div>

### The limits you must know

!!! warning "Checkpoints are not Git"
    1. They track only changes made by Claude's **file-editing tools**. If Claude runs a *shell command* that deletes or moves a file, or installs a package, that is **not** undone.
    2. They only exist for the **current session**. Start Claude in another terminal and there is nothing to rewind to.
    3. They are local and temporary. **Git is the permanent record.**

Use both: **checkpoints for quick experiments between commits, Git commits for anything worth keeping.**

??? example "Exercise: break something on purpose"
    In a scratch copy of Shelf, ask Claude: *"Rewrite `src/validate.js` to use a different style."* Look at the result, then `Esc Esc` and restore **code and conversation**.
    Run `git status` — the working tree should be clean. Repeat, but this time ask Claude to `rm` a file with a command; try to rewind, and observe what is **not** restored. That is the lesson.

## 2. Subagents — specialists with their own context

So far you have talked to **one** agent that does everything inside **one** context window. That is fine until a task produces a lot of *noise*: a test run with hundreds of lines, a long documentation page, a huge search result.
All of that raw output lands in your window even though you only needed a one-line answer ("3 tests failed").

A **subagent** is a separate Claude instance with **its own context window, its own system prompt, and its own set of tools.** The main agent hands it a job; the subagent does the heavy lifting in *its* context and returns **only a summary**.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/subagents.svg"
</div>

Claude Code already uses built-in subagents behind the scenes — for exploring code, planning, and running commands — which is part of why your main conversation stays tidy. You can also create your own. See what exists with `/agents`.

### Anatomy of a custom subagent

A subagent is a Markdown file in `.claude/agents/`. The frontmatter says who it is and what it may use; the body is its system prompt.

```markdown
--8<-- "docs/claude-code-handbook/examples/shelf/.claude/agents/reviewer.md"
```

Look at the design choices:

- **`tools: Read, Grep, Glob, Bash`** — it can read and run commands but has **no `Edit`/`Write`**. A reviewer that cannot change your code is safer *and* more focused.
- **A `description` that says when to use it** — Claude uses this to decide whether to delegate on its own.
- **A concrete checklist** tied to *this* project's rules (layering, validation, status codes, tests, safety).
- **An output format** — short, ranked, with `file:line`. Without one, reviewers ramble.

Create one with `/agents` (choose project vs personal, let Claude draft it, pick tools and a model) or write the file yourself. Then call it by name:

> Use the reviewer subagent to review my changes.

Long jobs can be sent to the background with `Ctrl + B`; check them with `/tasks`. When the subagent finishes, only its report returns to your conversation.

!!! tip "Good jobs for a subagent"
    Running the whole test suite and summarising failures · exploring an unfamiliar part of a large codebase · reading a long log · reviewing a diff with fresh eyes (it has *not* seen your reasoning, so it is less biased toward your solution).

## 3. AI code review — and how to read it

A reviewer agent will find real problems. It will also suggest things you should **decline.** Your job is *triage*, not obedience. Here is an **illustrative** review of a Shelf change (written for this book to show the thinking — your run will differ):

```text
1. src/app.js:88  — rating rule duplicated in the PATCH handler; belongs in validate.js
2. src/store.js:41 — offset is not clamped to ≥ 0 (negative offset slices from the end)
3. src/mailer.js:23 — signature compare uses ===; use a constant-time comparison
4. src/store.js:15 — list() could cache the sorted array for speed
5. src/app.js:12  — Consider replacing the hand-rolled router with a framework
```

Triage each item with three questions: **Is it a real bug or risk? How likely is it to matter here? What does the fix cost in complexity?**

| # | Verdict | Reasoning |
|---|---|---|
| 1 | **Accept** | Real duplication in the wrong layer; cheap fix |
| 2 | **Accept** | Real bug; one-line clamp; add a test |
| 3 | **Accept** | Security-relevant (timing attacks), tiny fix |
| 4 | **Decline** | Premature optimisation: a personal reading list holds hundreds of books, not millions. Caching adds complexity for no measurable gain |
| 5 | **Decline** | A rewrite is out of scope and unrequested. Park it |

!!! quote "Premature optimisation"
    Making code faster *before* you know it is slow makes it harder to read for a benefit you cannot measure.
    When a reviewer suggests a performance trick, ask "have we seen it be slow?" If not, decline.

### Watch for "helpful extras"

Reviewers — and fixers — also sometimes change things you did not ask for. After applying fixes, **read the diff for surprises**: a swapped ID generator, a renamed variable, a dependency added "for convenience." When Claude fixes the three accepted items, check that it touched *only* those lines. If it did something extra, ask it to revert that part.

!!! note "Review is a loop, not a verdict"
    Run the reviewer → triage → fix only the accepted items → run tests → commit. Re-run the reviewer after larger changes. Keep the project's rules in the reviewer's checklist so it grows with your conventions.

## Common mistakes

- **Treating checkpoints as a replacement for Git.** They are an undo button, not history.
- **Assuming a shell command can be rewound.** It cannot.
- **A subagent with too many tools** (or none of the right ones). Match tools to the job; read-only for reviewers.
- **No output format** for the subagent, so you get essays.
- **Applying every review suggestion.** More changes means more risk; accept what is real and valuable.
- **Not reading the diff after fixes** and missing unrelated edits.

## Check yourself

- [ ] I rewound a session and restored both code and conversation.
- [ ] I can list three things checkpoints do **not** cover.
- [ ] I created or read a subagent file and can explain why the reviewer has no edit tools.
- [ ] I triaged a review into accept / decline with a reason for each.
- [ ] After fixes I read the full diff for unrequested changes.
