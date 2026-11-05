---
title: "11. From Idea to Scope"
tags:
  - Planning
  - Requirements
  - MVP
---

# 11. From Idea to Scope

!!! abstract "Video map"
    Covers Section 3, lessons 3.1–3.4: introduction to the project, defining the scope, clarifying requirements, defining the MVP.

Part 2 taught you the tool. From here on you use it on something bigger than a demo. The most common reason bigger projects go wrong has nothing to do with code: **nobody decided what they were building.** An agent will happily build whatever you describe — including a vague, bloated, contradictory description.

So we start before any code, with three documents.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/project-funnel.svg"
</div>

## Document 1 — the scope

The scope is a brain-dump: the problem, the proposed solution, and every feature you can think of, unfiltered. Its job is to get the idea *out of your head and into text* so it can be questioned.

Shelf's scope (full file: [`project/scope.md`](examples/shelf/project/scope.md)):

```markdown
--8<-- "docs/claude-code-handbook/examples/shelf/project/scope.md:3:9"
```

Notice that the scope also lists **open questions**. Writing down what you do not know is part of the exercise.

!!! tip "Let the AI help you write it, but you own it"
    A good prompt: *"Here is my idea in a few sentences. Draft a project scope with problem, solution and feature list. Ask me questions where my idea is vague."* Then edit the result. If you cannot defend a line in your own scope, delete it.

## Document 2 — the clarified requirements

A scope is full of holes. The next step turns it into decisions, and here the agent is most useful as an **interviewer** rather than a builder:

```text
Read project/scope.md. Do not write any code.
Interview me: list every ambiguity, missing rule, and edge case that
would force a developer to guess. Group them and number them.
```

Then you answer each one. The result is a table of questions and *your* decisions:

| # | Question the AI raised | Decision |
|---|---|---|
| 2 | Can any book have a rating? | **No.** Only `done` books |
| 3 | Who are the users? | Closed system, **no public sign-up** |
| 5 | Can a user see another user's book by guessing an id? | **No** — return `404`, not `403` |

The full table is in [`project/requirements.md`](examples/shelf/project/requirements.md). Look at how each answer prevents a future argument, bug or security hole. Every one of those decisions later became a **test** (see the "rating rule" and the "other people's books are 404" tests in the Shelf code).

### Questions worth asking about any project

- **Who** are the users, and how do they get an account?
- **What are the states** of the main thing, and what moves it between them?
- **What must never happen?** (data leaks, double charges, lost work)
- **What happens when a dependency fails?** (payments, email, the AI itself)
- **How big can it get?** (ten rows or ten million?)
- **What does an error look like** to the person or program that causes it?

## Document 3 — the MVP

MVP means *minimum viable product*: the smallest version that genuinely solves the problem. Two things are true at once in the age of coding agents:

1. Writing code got cheap, so it is tempting to build everything.
2. **Reviewing, testing, running and maintaining** code did not get cheap, and your time is still limited.

Every feature you add is a feature you must review and keep working. Cut aggressively.

A useful way to cut — sort every feature into one of three buckets:

| Bucket | Question | Shelf example |
|---|---|---|
| **Must** | Is the product pointless without it? | CRUD, status, the rating rule |
| **Should** | Does it clearly increase value, and is it cheap to do well? | Search, pagination, stats |
| **Later** | Nice idea, but nobody is blocked without it | CSV import, public sharing, recommendations |

Shelf's decision is recorded in [`project/mvp.md`](examples/shelf/project/mvp.md) together with a reason for each parked idea.

!!! warning "Common mistake: an MVP that is a smaller version of everything"
    A real MVP is *fewer features done properly*, not every feature done badly. If your MVP list is longer than a page, it is not an MVP yet.

## The role the AI plays in each step

| Step | The AI is a… | You are the… |
|---|---|---|
| Scope | Drafting partner | Author |
| Requirements | Interviewer | Decision-maker |
| MVP | Devil's advocate ("is this needed?") | Editor |

At no point is it the one who decides. That is the thread running through this whole book.

## Common mistakes

- **Starting to build "to see what happens."** Cheap code makes this tempting; it makes expensive rewrites.
- **Accepting the AI's first scope.** It is a competent average, not your product.
- **Leaving decisions unrecorded.** If a decision lives only in a chat, it will be forgotten or re-litigated. Put it in a file in the repo — where Claude can read it in every session.

## Check yourself

- [ ] I can explain the difference between scope, requirements and MVP.
- [ ] I wrote a scope for my own project idea, including open questions.
- [ ] I ran an "interview me" prompt and recorded my decisions in a file.
- [ ] My MVP fits on one page and every parked idea has a reason.
