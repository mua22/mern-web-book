---
title: "Appendix D. Prompt Library"
tags:
  - Prompts
  - Reference
---

# Appendix D. Prompt Library

Starting points, not magic words. Replace the bracketed parts, and always add the files and the "done when" that fit your project.

## Understanding

```text
Explain how [feature] works. Read the relevant code first, then describe
the flow step by step with file names. Don't change anything.
```

```text
Draw the request path for [endpoint] from the router to storage as a numbered list.
Mention where validation and authorization happen.
```

## Planning

```text
I want to [goal]. Don't write code yet. Ask me every question you need
answered, then propose a plan in small steps that each end with passing tests.
```

```text
Review project/plan.md against project/requirements.md. List missing
dependencies, steps that are too large to review, and anything out of order.
```

## Building

```text
Implement [small feature]. Follow the pattern in [file]. Write the failing
tests first, then the code. Stop when `npm test` passes and show me the diff.
```

```text
Add [field] to [model]. Update validation, storage, the API and the tests.
List every file you changed and why.
```

## Fixing

```text
This fails: [exact command]. Output: [paste]. I expected [x].
Find the root cause before changing anything and explain it in two sentences.
```

```text
The test `[name]` fails. Decide whether the test or the code is wrong,
give evidence, and only then fix the right one. Do not weaken the assertion.
```

## Reviewing

```text
Review the current diff for correctness, security, missing tests and
violations of CLAUDE.md. Most severe first. file:line — problem — fix.
```

```text
Use the security-auditor agent on src/ and web/. Then triage the report:
which findings are real, which are judgement calls, which are noise?
```

## Refactoring

```text
[Pattern] is duplicated in [files]. Extract one helper, use it everywhere,
and change no behaviour. Run the tests before and after.
```

## Learning

```text
Explain this diff as if I were a first-year student. Then ask me three
questions to check I understood it.
```

```text
What would I need to know to catch it if this change were wrong?
```

## Working with data and secrets

```text
Show me the migration SQL before applying it. Do not run it yet.
```

```text
Check the repository for anything that looks like a real secret
(keys, tokens, passwords). Report file and line only — do not print the values.
```

## Habits that make every prompt better

- Name the files and the pattern to follow.
- Say what is **out of scope**.
- State how you will know it worked.
- Ask for the **plan** first when the change is not small.
- One task per prompt.
