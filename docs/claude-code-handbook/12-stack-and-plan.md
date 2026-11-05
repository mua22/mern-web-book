---
title: "12. Choosing a Stack and Making a Plan"
tags:
  - Tech Stack
  - Planning
  - Architecture
---

# 12. Choosing a Stack and Making a Plan

!!! abstract "Video map"
    Covers Section 3, lessons 3.5–3.6: choosing the tech stack, creating an implementation plan.

With the *what* settled, two decisions remain before code: **which tools** and **in what order.** Both are cheap to change now and expensive to change later — which is exactly why the agent should help you think, not decide.

## Choosing a stack

A stack is the set of technologies a project is built from: language, web framework, database, test tools, hosting. Beginners usually ask "what is the best stack?" There is no such thing. There is only the best fit for *these requirements and this team.*

### A decision table beats a debate

Ask the agent for options, but require **trade-offs**, not recommendations:

```text
For the requirements in project/requirements.md, propose a tech stack.
For each choice give: the option, one alternative, what I gain, and
what I give up. Prefer boring, well-documented technology. Do not write code.
```

Then record *your* choice and its cost. Here is Shelf's, from [`project/tech-stack.md`](examples/shelf/project/tech-stack.md):

| Concern | Choice | Why (and what I gave up) |
|---|---|---|
| HTTP | `node:http` | Zero dependencies. *Gave up:* the middleware ecosystem |
| Storage | JSON file behind `BookStore` | Inspectable and simple. *Gave up:* concurrency and scale |
| Auth | API keys → `{owner, role}` | Fits scripts. *Gave up:* cookie sessions |
| AI | Anthropic API via an **injected function** | Tests never touch the network |

!!! info "Why Shelf looks different from the video project"
    The video series builds a larger stack with a React front end, a relational database and a managed auth library. That is the right answer for *that* project. Shelf deliberately uses almost nothing so you can read every line, and every "gave up" above names the moment you would upgrade. **The method is the lesson, not the technology list.**

### Criteria that actually matter

1. **Does the agent know it well?** Popular, stable libraries with lots of public examples are where models are strongest. Obscure or brand-new tools produce more mistakes.
2. **Can *you* review it?** Pick technology you can read and debug, or are willing to learn.
3. **Is it boring?** Boring means documented, hirable and unlikely to vanish.
4. **How hard is it to leave?** Put volatile choices (database, email provider, AI vendor) behind a small interface — Shelf's `BookStore`, `Mailer` and injected `complete` function.
5. **Does it match the deployment target?** Check where it will run *before* you pick it.

!!! tip "Use current documentation"
    Models learn from a snapshot of the internet. For anything that changes quickly, point the agent at the real docs — through an MCP documentation server (see [chapter 7](07-mcp-and-skills.md)) or by pasting the relevant page. "Use the current docs for version X" prevents a lot of outdated code.

## Making an implementation plan

A plan answers: *what do we build, in what order, and how will we know each step works?*

### Rules for a good order

- **Foundations first.** Things others depend on come first (configuration, data model, auth).
- **Vertical slices.** Prefer "one feature working end to end" over "all the database, then all the API, then all the UI."
- **Risk early.** Do the scary, uncertain thing (a third-party integration, a security model) while you still have time to change course.
- **Every phase ends green.** Tests pass and the work is committed. No phase leaves the project broken.

Shelf's plan ([`project/plan.md`](examples/shelf/project/plan.md)):

```markdown
--8<-- "docs/claude-code-handbook/examples/shelf/project/plan.md:5:16"
```

### The plan is a conversation, not a contract

Review it like a design, using plan mode ([chapter 5](05-prompting-and-plan-mode.md)):

```text
Review project/plan.md against requirements.md.
Point out missing dependencies, steps that are too big to review
in one sitting, and anything out of order. Don't edit the file.
```

Shelf's plan changed after review: security moved **before** the web page, because retrofitting it later costs more than designing it in. And one item was deliberately *removed* — a user-management screen — because keys are provisioned through configuration and nobody asked for it.

## Turning the plan into work Claude can follow

Save the plan in the repo and refer to it by name:

```text
Implement phase 2 of project/plan.md. Follow CLAUDE.md.
Add tests first for each new behaviour. Stop when npm test passes
and show me the diff.
```

Each prompt names **one phase**, points at the source of truth, states the stopping condition, and asks for a reviewable result. This is the [prompt anatomy](05-prompting-and-plan-mode.md) applied at project scale.

## Common mistakes

- **Choosing technology because it is exciting.** Excitement does not review code.
- **No "gave up" column.** If you cannot name what you traded away, you did not choose — you defaulted.
- **A plan with huge steps.** "Build the backend" cannot be reviewed. "Add pagination" can.
- **Never updating the plan.** When reality changes, change the file.

## Check yourself

- [ ] I can list five criteria for choosing a technology and apply them to my project.
- [ ] I recorded a stack decision with the cost of each choice.
- [ ] My plan has phases that each end with passing tests and a commit.
- [ ] I reviewed my plan with the agent in plan mode and changed something because of it.
