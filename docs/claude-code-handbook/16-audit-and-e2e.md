---
title: "16. Security Audits and End-to-End Tests"
tags:
  - Security
  - Subagents
  - Testing
  - E2E
  - Troubleshooting
---

# 16. Security Audits and End-to-End Tests

!!! abstract "Video map"
    Covers Section 4, lessons 4.13–4.20: creating a security-audit agent, running the audit, troubleshooting startup problems, setting up Playwright, reviewing the setup, creating a testing agent, writing and reviewing E2E tests.

Part 4 ends with two habits that separate hobby projects from dependable ones: **review the work with fresh eyes**, and **test it automatically so it keeps working.**

## Fresh eyes: why the builder should not be the reviewer

If you wrote a piece of code and then reviewed it, you would be biased — you would gloss over problems and justify your choices. A model that wrote the code in the current conversation has the same weakness: its context is full of its own reasoning. A **subagent** starts clean, with only the rules you give it ([chapter 8](08-checkpoints-subagents-review.md)).

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/review-loop.svg"
</div>

Shelf's auditor is a short file that is deliberately **read-only** (`tools: Read, Grep, Glob`):

```markdown title=".claude/agents/security-auditor.md"
--8<-- "docs/claude-code-handbook/examples/shelf/.claude/agents/security-auditor.md"
```

Notice what it does:

- It declares a **checklist** (authentication, authorization, input, output, secrets, abuse) so every audit covers the same ground.
- It demands **severity levels** and an *exploit sentence* for each finding. "How could someone use this?" filters out vague worries.
- It forbids editing. Finding problems and fixing them are separate steps, and you stay in the loop between them.

### Run it in the background

An audit can take minutes. In the terminal you can send a running agent to the **background** (the video uses `Ctrl+B`) and carry on with other work. Parallel work is a real advantage of agents — but only if the tasks do not touch the same files.

### Triage the findings; do not obey them

The video's audit returned critical, high and medium findings — for example an **example secret** in `.env.example` that someone might deploy unchanged, and **missing rate limiting** on login. Handle a report like this:

1. **Sort**: which are real? Reproduce critical ones before fixing.
2. **Decide**: some findings are trade-offs (a limit of N requests per window is a judgement; the video picks a number it can defend).
3. **Fix in small steps**, each with a test.
4. **Commit** — "Improve security" — and re-audit if the change was large.

!!! warning "An AI audit is a second opinion, not a certificate"
    Models miss things and sometimes invent problems. Use the audit to find issues you would not have looked for, not to prove you have none.

### What the fixes look like in Shelf

Rate limiting, constant-time comparison, escaped output and signed webhooks all exist because of this kind of review. The limiter is small enough to read in a minute and is tested without any real clock:

```js title="src/security.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/security.js:22:43"
```

(The `now` function is injectable, so a test can "move time" instead of sleeping.)

## When the app will not start

The video devotes a lesson to a problem that will happen to you: the server runs but the client does not, and the terminal says nothing useful. The techniques are general:

1. **Reproduce in your own terminal**, outside the agent. You see all the output.
2. **Read the first error, not the last.** Later errors are often consequences.
3. **Check the boring things**: is the port already taken? Is a stale process still running? Did an environment variable change?
4. **Reduce**: start each half separately to learn which one is broken.
5. **Restart cleanly** — in the video, signing out, signing back in and restarting the tools made it work.

The full tree is in [Appendix B](appendix-b-troubleshooting.md). And remember to *tell* the agent exactly what you saw ("the client exits silently, the server is on port 3000") instead of "it doesn't work."

## Automated tests: why E2E

You have already seen unit and API tests. **End-to-end (E2E)** tests drive a real browser against a real running app, the way a user would.

| Test type | Speed | What it catches |
|---|---|---|
| Unit | Milliseconds | A rule is wrong |
| API / integration | Tens of ms | Two parts disagree |
| **E2E** | Seconds | The whole journey is broken |

E2E tests are the slowest and the most fragile, so write **few** of them, for the journeys that matter, and keep everything else as fast tests. Shelf's smoke test covers one story: empty list → invalid form → add a book → hostile input is rendered inert → the server still rejects bad data.

```js title="e2e/smoke.e2e.mjs"
--8<-- "docs/claude-code-handbook/examples/shelf/e2e/smoke.e2e.mjs:38:55"
```

Run it with `node e2e/smoke.e2e.mjs` after the one-time Playwright install shown at the top of the file.

### Test the setup, not just the tests

The video's setup lesson makes decisions you should copy:

- A **separate test database** (and a throwaway data file in Shelf) — E2E tests must never touch real data.
- **Rate limiting disabled outside production**, driven by an environment variable, or your own tests lock themselves out.
- **Global setup/teardown** to seed known users and clean up.
- **Test artifacts (traces, reports) in `.gitignore`.**
- Updating **project memory** with the test commands, ports and folders.

## A testing agent keeps the details out of your way

Writing E2E tests is fiddly, and failing runs can eat hours. The video moves the know-how into a **test-writer subagent** and leaves `CLAUDE.md` with just one line: *"use the e2e-writer agent for Playwright tests."* Shelf's version:

```markdown title=".claude/agents/e2e-writer.md"
--8<-- "docs/claude-code-handbook/examples/shelf/.claude/agents/e2e-writer.md"
```

Two rules in it are worth stealing: *"decide whether the **test** or the **app** is wrong before changing anything,"* and *"never use fixed sleeps."* Together they prevent the two classic failures of AI-written tests — rewriting a test until it passes while hiding a real bug, and flaky timing.

### Reviewing AI-written tests

When the agent writes tests, read them like production code:

- **Does each test assert something meaningful?** (e.g. the alert text *and* that you are still on the login page)
- **Are helpers clear?** A `login(page, user)` helper keeps tests readable.
- **Can the test fail?** Break the code on purpose and watch it go red.
- **Does it clean up after itself?**

## Common mistakes

- **Reviewing with the same session that wrote the code.**
- **Treating the audit report as a to-do list** instead of triaging it.
- **Too many E2E tests**, slow and flaky.
- **Tests that share the development database.**
- **Letting the agent "fix" a failing test by weakening it.**

## Check yourself

- [ ] I can explain why a subagent gives a better review than the session that wrote the code.
- [ ] I wrote a read-only auditor agent with a checklist and severity levels.
- [ ] I triaged findings instead of applying them blindly.
- [ ] I can say which behaviours belong in unit tests and which in E2E.
- [ ] I ran an E2E test and broke the app on purpose to see it fail.
