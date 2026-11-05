---
title: "10. The Future of Software Engineering"
tags:
  - Career
  - Opinion
---

# 10. The Future of Software Engineering

!!! abstract "Video map"
    Section 2 — Future of Software Engineering

You have finished the fundamentals. Before building bigger things, a short chapter on the question every student asks:
**"Will I still have a job?"**

## What is changing — and what is not

| Changing | Staying |
|---|---|
| Who types the first draft of routine code | Deciding *what* to build and *why* |
| Time spent on boilerplate, config, wiring | Understanding the problem and the users |
| The tools: editors → IDEs → CI → agents | Judgement: design trade-offs, risk, security |
| How fast one person can ship | Responsibility for correctness and maintenance |

Tooling has changed many times: from text editors to IDEs, from copying files to a server to automated pipelines, from raw SQL to ORMs.
Each shift removed a layer of drudgery and **raised** the level at which engineers work. Agents look like the next such shift.

## The two bad reactions

1. **"AI will do it all; I don't need to learn."** Then you cannot tell good output from bad. Reviewing code well requires *more* fundamentals, not fewer.
2. **"AI code is spaghetti; I won't touch it."** Bad code has always existed — long before AI. The answer to bad code is **review, tests and refactoring**, and that applies to human code too.

The productive position sits between them: **use the tool, and stay responsible for the result.**

## Skills that gain value

- **Reading code** quickly and critically.
- **Breaking problems down** into small, verifiable steps (this is exactly how you prompt well).
- **Testing** — tests are how you trust output you did not write (see [chapter 16](16-audit-and-e2e.md)).
- **System design** — structure, boundaries, data models, failure modes.
- **Security awareness** — knowing what to distrust.
- **Communication** — turning a fuzzy business need into a precise request.

!!! tip "A habit worth building"
    After every task, ask: *"What would I have to know to catch this if it were wrong?"* That question tells you exactly what to study next.

## A practical stance for students

- **Learn the fundamentals deliberately**, even when the agent could do it. Write some code by hand every week.
- **Build in public with your own projects**, not only tutorial copies.
- **Keep a portfolio of reviewed work** — projects with tests, a README, and commits that show your thinking.
- **Be the person who can explain every line** in a pull request, regardless of who typed it.

## What's next

The remaining parts use Claude Code to take an idea all the way to a deployed product: planning ([Part 3](11-idea-to-scope.md)), building and testing, adding AI features, integrating email, and shipping.
Everything you learned here — small steps, memory, plan mode, context hygiene, checkpoints, review — is what keeps that larger project under control.

## Check yourself

- [ ] I can explain, with the carpenter analogy, why agents do not remove the need for engineers.
- [ ] I can name three skills that become *more* valuable with agents.
- [ ] I have a plan to keep practising fundamentals alongside agent-assisted work.
