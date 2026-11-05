---
title: "5. Prompting and Plan Mode"
tags:
  - Prompting
  - Plan Mode
  - Review
---

# 5. Prompting and Plan Mode

!!! abstract "Video map"
    Section 2 — Effective Prompting · Using the Plan Mode

Two skills do more for your results than any setting: **writing a clear request** and **reviewing what comes back**.

## Anatomy of a good prompt

A coding agent is not a person you must be polite to; it is a tool that does what you ask. So be *specific*, *short* and *checkable*.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/prompt-anatomy.svg"
</div>

| Ingredient | Why it matters | Weak | Strong |
|---|---|---|---|
| **Goal** | Defines success | "Improve the API" | "Add a `/stats` endpoint returning counts by status" |
| **Context** | Points at what exists | (nothing) | "`@src/store.js` already has `list()`" |
| **Constraints** | Prevents surprises | (nothing) | "No new dependencies; keep rules out of `app.js`" |
| **Done when** | Lets the agent verify | "Make it work" | "`npm test` passes and there is a new test" |

!!! tip "Drop the pleasantries"
    "Hey Claude, could you please kindly help me…" adds tokens, not quality. Write the request the way you would write a ticket.

### Give context with `@`

Type `@` and a path to attach a file: `@src/validate.js`. If the file is already open in your editor, Claude often sees it automatically.
Within one conversation it also remembers files it has read, so you do not have to repeat them.

### Say what *not* to do

Agents love to be helpful by doing *extra*: creating additional endpoints, adding libraries, reformatting unrelated files. Add a line such as
"Change only what is needed for this task" — and verify in the diff that it listened.

## Fix the cause, not the symptom

The most valuable review skill is noticing a *plausible but shallow* fix. Here is a real moment from building Shelf.

The rule is: **only finished books can carry a rating.** The first version of `validateBook` checked it like this:

```javascript
const status = out.status ?? body.status;
if ("rating" in out && status !== undefined && status !== "done") { /* error */ }
```

A test then showed that creating a book with a rating but **no status** was *accepted* — because `status` was `undefined`, so the check was skipped.
Two possible fixes:

| Fix | What it does | Verdict |
|---|---|---|
| **Symptom:** add `if (!body.status && body.rating) …` in the route handler | Patches this one path | Duplicates the rule in the wrong layer; the next path will miss it |
| **Cause:** treat a missing status on *create* as the default `"to-read"` inside the validator | One rule, in one place | ✔ Correct |

The fix that shipped:

```javascript
// On create, a missing status means the default "to-read"; on partial updates it is unknown here.
const status = out.status ?? (partial ? undefined : "to-read");
```

When Claude gives a first fix, ask yourself: **does this treat the problem or hide it?** Then steer with a follow-up:

> That works for this route, but the rule belongs in `validate.js` so every entry point gets it. Move it there.

## Work in small steps

Ask for **one thing at a time**, review the diff, then commit. If you ask for ten things, you will get a ten-file diff you cannot review honestly — the "vibe-coding trap". Small steps also teach Claude your *patterns*: when the first endpoint follows your style, the second one usually copies it.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/review-loop.svg"
</div>

!!! warning "Commit *before* the next prompt"
    A clean commit between prompts lets you see exactly what the *next* change did (`git diff`) and undo it cleanly.

## Plan mode: think first, edit later

For anything bigger than a few lines, switch to **plan mode** (`Shift + Tab` until the mode label says *plan*). In plan mode Claude may **read and search** but **may not edit**. It explores the code and returns a written plan for you to approve.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/plan-mode.svg"
</div>

### Worked example — planning pagination for Shelf

Prompt (in plan mode):

> Add `limit` and `offset` paging to `GET /books`. Return the total count in a response header. Keep rules out of `app.js`. Write tests first.

A good plan looks something like this (yours will differ):

```text
Plan
1. store.js: add query({limit, offset, ...filters}) that calls list() then slices; clamp limit to 1..100.
2. app.js: call store.query() for GET /books; send total in the `x-total-count` header.
3. Tests: paging window, default limit, clamping, header value.
Verify: npm test; GET /books?limit=2&offset=2.
```

**How to review a plan** — ask four questions before approving:

1. Does it touch only the files it should? (Here: `store.js`, `app.js`, tests.)
2. Is each step small enough to review?
3. Does it include **how to verify**?
4. Is anything surprising — a new dependency, a rewrite, a renamed file?

If not, reply in plan mode: *"Also clamp negative offsets to 0, and keep the response a plain array so existing clients still work."* Claude revises the plan **without touching code.**

When the plan is right you choose how to proceed — typically **approve and auto-accept edits**, or approve with **manual** edit approval, or ask for changes. If the work is unrelated to the earlier conversation you can also start with a **fresh context** to save tokens.

The finished implementation is small and reviewable:

```javascript
--8<-- "docs/claude-code-handbook/examples/shelf/src/store.js:37:43"
```

…and the test that proves it:

```javascript
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:72:81"
```

!!! note "Which mode when?"
    **Normal** — you approve each edit; best when learning or on risky code.
    **Accept edits** — fewer prompts; fine when the task is small and you will review the diff after.
    **Plan** — new features and anything touching several files. Costs a little time, saves a lot of rework.

## After the change: verify like an engineer

1. **Run it.** Did the behaviour actually change? (`curl` the endpoint.)
2. **Run the tests.**
3. **Read the diff**, file by file. Ask Claude to explain anything you do not understand.
4. **Look for the *extra*** — files or lines you did not ask for.

## Common mistakes

- **One giant prompt** ("build the whole backend"). You cannot review it, and patterns drift across files.
- **Accepting the first fix** because the symptom disappeared.
- **Skipping plan mode on multi-file work**, then discovering the agent rewired something you did not want touched.
- **Vague success criteria**, so "done" is whatever the agent decides.
- **Not committing between steps.**

## Check yourself

- [ ] I can write a prompt with goal, context, constraints and a verification step.
- [ ] I can explain "fix the cause, not the symptom" using the rating example.
- [ ] I used plan mode for a multi-file change and reviewed the plan with the four questions.
- [ ] I committed after each reviewed step.
