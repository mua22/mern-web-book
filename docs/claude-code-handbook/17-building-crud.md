---
title: "17. Building CRUD Features"
tags:
  - CRUD
  - Testing
  - Refactoring
  - Soft Delete
---

# 17. Building CRUD Features

!!! abstract "Video map"
    Covers Section 5 (5.1–5.16): listing, creating, editing and deleting users; React Query; loading skeletons; component/unit tests; reviewing and refactoring; E2E tests; and why clean code still matters.

CRUD — **C**reate, **R**ead, **U**pdate, **D**elete — is the bread and butter of most applications. The video builds it for "users"; Shelf builds it for books. The domain is different, the *workflow with the agent* is identical, and that workflow is what this chapter is about.

## The rhythm of one feature

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/tdd-loop.svg"
</div>

For each of list → create → edit → delete, the video follows the same cycle:

1. **Plan mode** with a detailed prompt (see [chapter 5](05-prompting-and-plan-mode.md)).
2. **Implement**; let the agent run the tests it wrote.
3. **Try it by hand** in the browser or with `curl`.
4. **Review the backend**, then **review the frontend**, as separate sittings.
5. **Fix and refactor** what the review turned up.
6. **Commit** one feature at a time.

Notice the context decisions too. Editing users is closely related to creating them, so the video deliberately does **not** clear the context — everything the agent just learned is relevant. Starting an unrelated feature gets a `/clear`. That is the judgment from [chapter 6](06-context-and-cost.md) in action.

## Prompt size grows as the project grows

Early in the project, prompts need detail because there are no patterns to copy. Later, once the first feature exists and `CLAUDE.md` describes conventions, the same agent can follow the pattern from a few words. Compare:

| When | Prompt |
|---|---|
| First list page | "Add a page listing users in a table: name, email, role. Sort by name. Show a skeleton while loading and an error message if the request fails. Admin only." |
| Third feature | "Add the ability to delete users." |

This is the payoff of the time spent on memory and on **reviewing earlier code**. Inconsistent first features teach the agent inconsistent habits; clean ones are copied.

## Read: lists, caching and loading states

The video introduces **React Query** for fetching server data on the client: it caches results, tracks loading and error states for you, and refetches when data changes. If you do not use React, the same ideas hold in any client:

- Server data is **not** your component's state; it is a cache of someone else's truth.
- After a change (create, edit, delete), **invalidate** the cached list so it refreshes.
- Show *loading* (a skeleton), *error*, *empty* and *data* — [chapter 15](15-login-validation-roles.md) shows all four in one function.

In Shelf the read side is one method on the store plus a router branch:

```js title="src/store.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/store.js:20:43"
```

## Create and update: the rules live in one place

Both operations share a validator and differ only in whether fields are required. Shelf's `PATCH` handler has a subtle but important step — it validates the **merged** result, because "rating requires status = done" depends on the final state, not just the changed fields:

```js title="src/app.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/app.js:168:178"
```

That bug was real: the first version of Shelf let you PATCH a rating onto a "to-read" book. A test (`PATCH cannot add a rating to an unfinished book`) found it. This is the clearest argument for tests you can give a newcomer — the agent wrote code that *looked* right.

The video makes a parallel point on the front end: the create and edit forms are the **same component** with a mode switch, and the schema for each is derived from a shared definition — "the only difference is the password." Duplicate forms become inconsistent forms.

## Delete: think before you remove

Deleting looks trivial and is where data-integrity problems hide. The video raises two issues:

1. **History.** If tickets are assigned to an agent and you delete the agent, what happens to those tickets? The answer is usually a **soft delete**: mark the row as deleted and hide it, but keep it.
2. **Access.** A deleted user must lose access *immediately*. With database sessions that is automatic; with a long-lived signed token it is not, because the token stays valid until it expires — one more reason the session decision in [chapter 14](14-authentication.md) matters.

Shelf does the same with books. `remove()` stamps `deletedAt`, and every read path filters on it:

```js title="src/store.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/store.js:73:85"
```

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:292:304"
```

!!! tip "Design questions to ask before any delete"
    *What else points at this?* · *Can it be undone?* · *Does a regulation require true erasure?* (Then you need a real purge too.) · *Who is allowed to do it?* · *Should the UI ask first?* (The video adds a confirmation dialog.)

## Which kind of test for which job

The series draws a clear line, and it is worth memorising:

| Test | What it proves | How many |
|---|---|---|
| **Unit / component** | One piece behaves correctly in isolation: validation, rendering, error states | Many — fast and cheap |
| **API / integration** | Routes, rules and storage agree | Plenty |
| **E2E** | The real pieces work *together* | **A few**, for happy paths |

Component tests do not call the real backend, so alone they cannot tell you the pieces fit. E2E tests can, but they are slow and fragile, so the video's rule is: *cover every case with fast tests, then add a few targeted E2E tests for the main journeys.*

## Review is where you earn your keep

Two review sessions per feature (backend, frontend) might feel slow. Look at what the video's reviews catch: a long expression for formatting errors repeated in several handlers, magic strings that should be an enum, a needlessly complicated pattern the agent copied from earlier code. Each is a small thing that becomes a big mess in a year.

Use the agent to help review, but ask it for *reasons*: "Why did you define this enum that way? It looks overly complicated." Sometimes the answer is "it matches an existing pattern" — then the question is whether the pattern should change everywhere. Decide, then update `CLAUDE.md` so the choice sticks.

### Refactor with a safety net

Refactoring is changing structure without changing behaviour. With a green test suite it is cheap and safe, which is exactly what agents are good at:

```text
The error-formatting expression is duplicated in four handlers.
Extract one helper, use it in all four, and do not change behaviour.
Run npm test before and after and show me both results.
```

## Why clean code still matters

The section ends with an argument students will hear: *"AI writes and debugs the code anyway, so who cares what it looks like?"* The video's answer, in plain terms:

- **Working is not the same as maintainable.** Code that passes tests today still has to be understood, changed and extended.
- **Mess compounds.** The agent reads your code to decide how to write more of it. Tangled code in, tangled code out — and each session needs more context to understand it.
- **You are accountable.** The pull request has your name on it.
- **The real work is thinking** — understanding requirements, designing for change, controlling complexity. The code is the output.

## Common mistakes

- **Treating the first feature as throwaway.** It becomes the template for the rest.
- **Skipping review because the tests pass.**
- **Hard-deleting data something else references.**
- **Too many E2E tests; too few unit tests.**
- **Not updating `CLAUDE.md` after deciding a convention.**

## Check yourself

- [ ] I can explain the build → try → review → refactor → commit rhythm.
- [ ] I know when not to clear the context between features.
- [ ] I can define soft delete and give a case where a hard delete is correct.
- [ ] I can say which behaviours deserve unit tests and which deserve E2E.
- [ ] I refactored duplicated code with tests green before and after.
