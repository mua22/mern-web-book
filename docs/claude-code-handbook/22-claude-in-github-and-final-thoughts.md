---
title: "22. Claude in GitHub, and Final Thoughts"
tags:
  - GitHub Actions
  - Pull Requests
  - Workflow
---

# 22. Claude in GitHub, and Final Thoughts

!!! abstract "Video map"
    Covers Section 9, lessons 9.9–9.12: Claude Code GitHub Actions, fixing GitHub issues, creating pull requests, and the closing thoughts of the series.

The last step turns Claude Code from a tool on your laptop into a **member of the team's workflow**: someone writes an issue, Claude proposes a fix as a pull request, a human reviews it, and merging triggers a deployment.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/claude-actions.svg"
</div>

## Setting it up

The video's steps, in order:

1. **Install the GitHub CLI (`gh`) and log in** (`gh auth login`). Choose HTTPS for simplicity or SSH if you already use it (Claude can walk you through SSH setup if you ask).
2. **Run the install command from inside Claude Code** (the series uses `/install-github-app`). Pick the repository.
3. **Grant the GitHub App its permissions**: read access to actions and metadata; read/write to code, issues, pull requests, checks, discussions and workflows. Install it on **only the repositories you need.**
4. **Choose the workflows** to add. Two are offered: *automated review of new pull requests*, and *respond when someone mentions Claude in an issue or comment.*
5. **Authorise** with your Claude account or API key. The setup itself arrives as a pull request. Review it and merge it.

Shelf contains the "mention" workflow so you can read exactly what gets installed:

```yaml title=".github/workflows/claude.yml"
--8<-- "docs/claude-code-handbook/examples/shelf/.github/workflows/claude.yml"
```

Read it as a policy:

- It runs **only** when a comment or issue mentions `@claude`. Not on every event.
- Its `permissions:` are an explicit, minimal list.
- The key comes from a repository **secret**, never from the file.
- Claude reads the repository's `CLAUDE.md`, which is why project memory ([chapter 4](04-project-memory.md)) matters even more here — in CI nobody is available to answer its questions.

!!! danger "Who is allowed to trigger it?"
    A workflow that runs an agent with write access is a powerful thing to expose. Keep the repository's permissions tight, limit who can trigger the action, never let it run on pull requests from untrusted forks with your secrets, and remember that **issue text is untrusted input** (see prompt injection in [chapter 19](19-ai-features.md)). Review what the action does the first few times.

## Workflow 1 — an issue becomes a pull request

The video fixes a real production bug without opening an editor:

1. Open an issue: a clear title, steps to see it, and what *should* happen. (*"AI agent appears on the user list. It shouldn't, because it can be deleted by accident."*)
2. Mention Claude in the issue. In some teams a product manager writes the issue and a developer assigns or mentions Claude — that is a process choice.
3. After a minute or so Claude works **on a branch in the cloud** and posts a summary of what it changed and why.
4. Open the pull request (the form is pre-filled).
5. **Review the diff yourself.** Leave comments; Claude can address them.
6. Merge. The deployment pipeline does the rest, and you verify the fix on the live site.

The written issue is the prompt. Everything you learned about [good prompts](05-prompting-and-plan-mode.md) applies: say where, what is wrong, and what done looks like.

## Workflow 2 — local change, one-prompt pull request

When you are working locally, a pull request is a chain of chores: commit, pull/rebase, push, open the PR, write the description. The video replaces the chain with one prompt — *"create a PR"* — and gets a correctly populated pull request in about half a minute. Notice the earlier step in that lesson: Claude misread the problem and the instructor corrected it with a precise instruction ("render the category label defined in constants instead of this expression"). Fast delivery does not remove the need for review.

!!! note "Permissions apply here too"
    In Shelf's `.claude/settings.json`, `git push` is **denied**. That is deliberate: a policy that lets the agent push will not need your approval step. Decide per project which side you want. (A pull request on a branch is a reviewable step; pushing straight to `main` is not.)

## Automatic review: is it worth it?

The review workflow comments on every new pull request. The instructor's own conclusion is balanced: it is useful, but asking Claude to implement a change and then review its own work *every time* spends tokens for a modest benefit, so you may want to disable it or limit it to certain branches. A good compromise is to use it for **pull requests written by people**, and rely on your own review plus the fresh-eyes subagents ([chapter 16](16-audit-and-e2e.md)) for agent-written changes.

## The whole loop

Put every chapter together and the workflow looks like this:

1. **Idea → scope → requirements → MVP → stack → plan** (chapters 11–12), recorded in the repository.
2. **Setup** with configuration that fails fast (13).
3. **Small, reviewed, tested steps** with memory, plan mode and context hygiene (4–6, 17).
4. **Safety nets**: permissions, hooks, checkpoints, subagents (8–9, 16).
5. **Security and tests** built in early (14–16, 18).
6. **AI features** with injected calls, validation and fallbacks (19).
7. **Integrations** debugged one hop at a time (20).
8. **Production** with error tracking, containers and CI (21).
9. **Maintenance** by issue → pull request → review → deploy (this chapter).

## Final thoughts

The closing lesson of the series makes five points that deserve to be the last words of this book too.

**Ship, then improve.** There is no perfect, complete application. The series deliberately skips some tests and certainly leaves undiscovered bugs. Draw a line, deploy, put it in front of real users and iterate on what you learn. Waiting for perfect means never shipping.

**Clean code matters more than ever.** When you can generate hundreds of lines in seconds, mess can pile up as quickly. Speed gained on the way in is lost on the way out if features get harder to add and bugs harder to find. Keep refactoring while the tests are green.

**Fundamentals matter more than ever.** An agent does not excuse you from understanding code. You must be able to read it, judge it, and tell good from bad in review. A power saw makes the carpenter faster, but the carpenter must still know how to measure and build. *The tool amplifies the skill; it does not replace it.*

**You do not have to learn everything.** Claude Code changed several times while the series was being recorded, and it will keep changing. Nobody can keep up with every feature of every tool. You don't need to know every button in the car to drive from A to B. A strong foundation beats an exhaustive memory of release notes.

**Share what helped you.** The instructor's closing request is to tell a colleague. Ours is similar: if a chapter helped, teach it to a classmate — teaching is the fastest way to find the gaps in your own understanding.

## Where to go next

- Rebuild Shelf from the plan in `project/plan.md` using your own prompts, then compare.
- Work through the [exercises](appendix-e-exercises.md), especially the capstone.
- Keep the [cheat sheet](appendix-a-cheat-sheet.md) and [prompt library](appendix-d-prompt-library.md) open while you work.
- Read the official Claude Code documentation regularly; it changes faster than any book.

## Check yourself

- [ ] I can describe the issue → branch → pull request → review → merge loop and where a human decides.
- [ ] I know which permissions the GitHub App needs and why I install it on selected repositories only.
- [ ] I can explain why automatic review of agent-written code may not be worth the tokens.
- [ ] I can state the five closing points in my own words — and I have a plan to ship something.

*Now go ship something.*
