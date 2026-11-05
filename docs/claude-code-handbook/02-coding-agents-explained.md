---
title: "2. Coding Agents, Explained"
tags:
  - Agents
  - Fundamentals
---

# 2. Coding Agents, Explained

!!! abstract "Video map"
    Section 2 — Introduction · What is Claude Code

## From chat to agent

Most people first meet AI as a **chat assistant**: you ask, it answers with text, you copy the text
into your project, run it, and report back what broke. A **coding agent** removes the copy-paste:
it can read your files, edit them, run commands, and look at the results itself.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/chat-vs-agent.svg"
</div>

The difference is *tools*. A chat model can only produce words. An agent has tools — read a file, search
the project, edit a file, run a shell command, use git — and a loop that decides which to use next.

## The agent loop

Almost every coding agent works the same way:

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/agent-loop.svg"
</div>

1. **Gather context** — read the relevant files, search for usages, check what already exists.
2. **Act** — edit files or run commands.
3. **Verify** — run the tests, the linter, or the app and read the output.
4. **Repeat or report** — if verification fails, loop again; if it passes, summarise what changed.

This is why a good prompt names *how to verify*. Without a check, the agent can only guess whether it is done.

## Why it lives in the terminal

Claude Code runs in your terminal, so it is **editor-agnostic**: it works the same with VS Code,
JetBrains IDEs, Neovim or no editor at all. It also integrates with popular editors so you can see
diffs inline. Because it runs *where your code runs*, it can use the same commands you use — `npm test`,
`git diff`, `node src/server.js`.

## What you can do with it

| Task | Example request |
|---|---|
| Explore unfamiliar code | "Explain how requests flow from `server.js` to the data file." |
| Write or change code | "Add pagination to `GET /books`. Follow the existing style." |
| Debug | "`npm test` fails in `api.test.js` — find the cause and fix it." |
| Write tests | "Add tests for the rating rule in `validate.js`." |
| Refactor | "Move the status-code mapping out of `app.js`." |
| Git workflow | "Commit these changes with a clear message." |

## Is this the end of software engineering?

No — and the reason is worth understanding. Think about a carpenter and a power saw. The saw did not
remove the carpenter; it made one part of the job faster. A carpenter still measures, designs, chooses
materials, and assembles. **Typing code is one part of engineering.** The rest — understanding the problem,
choosing the design, spotting mistakes, testing, deploying, maintaining — is still yours, and becomes *more*
important because you are now evaluating code you did not type.

!!! warning "You still need to understand code"
    An agent does not let you skip learning to program. You must review output, notice when it is on the
    wrong track, and know when it is faster to write three lines yourself than to describe them.

## Why this works at companies, not only for hobbyists

Agents are not just for weekend experiments. The repeated, mechanical parts of engineering — forms with
validation, CRUD endpoints, boilerplate configuration, writing the hundredth test — are exactly what an agent does well.
That frees you to spend time on the parts that need judgement.

## Try it: spot the tools

Open any project and ask Claude Code a question that *requires* looking at files:

> Which file validates incoming book data, and what are the validation rules?

Watch the output. You should see it **search and read files** before answering. Those are tool calls — the "gather context" step of the loop.

## Common mistakes

- **Expecting magic from vague goals.** "Make it better" gives the loop nothing to verify against.
- **Thinking the agent remembers earlier sessions.** It does not, unless you store knowledge in a file ([chapter 4](04-project-memory.md)).
- **Trusting without running.** The agent saying "done" is a claim, not evidence. Run the tests.

## Check yourself

- [ ] I can explain the difference between a chat assistant and an agent in two sentences.
- [ ] I can name the four steps of the agent loop.
- [ ] I can list four tools an agent uses.
- [ ] I understand why a good prompt includes how to verify the result.
