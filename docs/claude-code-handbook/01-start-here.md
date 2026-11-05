---
title: "1. Start Here"
tags:
  - Orientation
  - Study Skills
---

# 1. Start Here

!!! abstract "Video map"
    Section 1 — Welcome · Prerequisites · Course Structure · Source Code · How to Take This Course

Before any commands, it helps to know what you are signing up for, what you should already know,
and how to study so that the skills actually stick.

## What you are learning

You are learning **software engineering with an AI agent**, not "how to press a button that makes an app."
The agent writes much of the first draft. *You* decide what to build, break it into steps, review every
change, test it, and decide when it is good enough. The tool is Claude Code; the skills transfer to any
coding agent.

!!! quote "A useful mental model"
    Think of the agent as a very fast junior colleague who has read a lot, never gets tired, and
    sometimes confidently does the wrong thing. You are the senior engineer: you set direction, check
    the work, and own the result.

## Prerequisites — a self-check

You do not need any AI experience. You do need these basics:

| Skill | Quick test | If it is weak |
|---|---|---|
| JavaScript basics | Can you explain `map`, `async/await`, and an ES module `import`? | Revisit the [JavaScript tutorials](../tutorials/index.md) |
| HTML/CSS | Can you build a page with a form and style it? | Do the HTML & CSS tutorials |
| Terminal | Can you `cd`, run `node file.js`, and read an error? | Practise in a scratch folder |
| Git | Can you `git add`, `git commit`, and `git diff`? | Do the quick Git drill below |
| HTTP/APIs | Can you say what `GET`, `POST` and `404` mean? | Read the REST lecture first |

??? example "Quick Git drill (5 minutes)"
    ```bash
    mkdir git-drill && cd git-drill
    git init
    echo "hello" > a.txt
    git add a.txt && git commit -m "first"
    echo "world" >> a.txt
    git diff            # see the change
    git restore a.txt   # undo it
    ```
    Git matters more with an agent than without one: **a commit is your safety net before every risky step.**

## The shape of the whole journey

The video series, and this book, move in nine stages:

1. **Orientation** — you are here.
2. **Fundamentals** — what an agent is, how to install it, memory, prompting, context, extensions, safety nets.
3. **Planning** — turn an idea into scope, requirements, an MVP, a stack, and a plan.
4. **Authentication & testing** — protect the app and prove it works.
5. **CRUD features** — create, read, update and delete, with tests and reviews.
6. **Core features** — lists, filters, details, replies, security hardening.
7. **AI features** — use an LLM *inside* your product, safely.
8. **Email integration** — receive and send mail.
9. **Production** — monitor, containerise, deploy, and let an agent help in CI.

## How to study so it sticks

!!! tip "Do, don't watch"
    Reading or watching alone teaches you little. Keep an editor and a terminal open and repeat each
    step. Skills built with your hands last; skills built by watching fade in a week.

1. **Watch a lesson to the end** (they are short), then read the matching chapter.
2. **Repeat it on your machine** — in your own project, not only the instructor's.
3. **Read every line the AI wrote.** If you cannot explain a line, ask Claude to explain it, or rewrite it.
4. **Commit after each good step.** Small commits make mistakes cheap.
5. **Do not skip lessons that "sound familiar".** Later steps quietly depend on earlier ones.
6. **Keep a learning log** — three lines per session: what I asked, what went wrong, what I would do differently.

## Two repositories, two purposes

The video series uses a small starter project for the fundamentals and a larger "help desk" application
for the second half. **This book uses its own project (Shelf)** for every example, so you practise the
*skills* on fresh ground instead of copying the series line by line. If you can do it on Shelf and on the
series project, you understand it.

## Common mistakes

- **Treating it as a spectator sport.** Passive watching is the number-one reason people say "it did not work for me."
- **Comparing output to the video.** Models are non-deterministic; match the *workflow*, not the characters.
- **Skipping the planning chapters** because they contain no code. They prevent the most expensive mistakes.
- **No Git history.** Without commits you cannot compare or undo.

## Check yourself

- [ ] I can describe in one sentence what I am learning (engineering *with* an agent).
- [ ] I have Node 20+, Git and a terminal working.
- [ ] I downloaded the Shelf project and `npm test` passes.
- [ ] I have a notes file to log what I learn.

??? question "Why not just let the AI build everything?"
    Because someone must judge the result. Generated code can be subtly wrong, insecure, or unmaintainable.
    The less you understand, the less you can tell. Speed without review produces fast, confident bugs.
