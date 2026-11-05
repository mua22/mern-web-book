---
title: "15. Forms, Validation, Styling and Roles"
tags:
  - Validation
  - Forms
  - Roles
  - UI
---

# 15. Forms, Validation, Styling and Roles

!!! abstract "Video map"
    Covers Section 4, lessons 4.7–4.12: building the login page, reviewing it, implementing form validation, adding a utility-CSS framework, adding a component library, and role-based access.

From here the videos say it themselves: *things start to move faster.* Once the foundation exists and `CLAUDE.md` describes it, a UI feature is a short prompt and a review. This chapter gathers the lessons that are about **how to work**, with Shelf's web page as the running example.

## A routine for every UI feature

1. **Clear the context** if the previous task was unrelated (`/clear`; see [chapter 6](06-context-and-cost.md)). Check with `/context` — the video starts the login page at 20% used and still clears, because backend history is noise for a front-end task.
2. **Describe behaviour, not code**: what the user sees and does, including the unhappy paths.
3. **Run it and try it yourself** — wrong input, empty input, the happy path.
4. **Review the diff** file by file. Ask the agent to explain anything you cannot.
5. **Update memory** if something new is now a convention.
6. **Commit** with a message that says what changed.

```text
Build the "add a book" form on the web page.
Fields: title, author (required); status, pages, rating (optional).
Show an error under the field that is wrong, in red, with a short message.
Do not send a request while the form is invalid.
Reuse the validation in src/validate.js — do not write new rules.
```

That last line is the interesting one.

## Validation belongs in two places

| | Client-side | Server-side |
|---|---|---|
| Purpose | **Convenience** — instant feedback | **Security and correctness** — the real gate |
| Can be bypassed? | Yes, trivially | No |
| Needed? | Nice to have | **Always** |

Anyone can skip your form and call the API directly, so the server must validate regardless. But writing the rules twice invites them to drift apart. Shelf avoids that: the browser imports **the very same `validateBook`** as the server.

```js title="web/ui.js"
--8<-- "docs/claude-code-handbook/examples/shelf/web/ui.js:1:21"
```

The video achieves the same with a shared schema (a Zod schema used by the form library and the API). The principle: **one source of truth for the rules.**

!!! warning "Show errors where the problem is"
    The video replaces the browser's native, generic pop-up with a red border and a message below the field. Besides looking better, it is more accessible and easier to test, because the message is real text on the page (`#err-title` in the E2E test).

### Proving that the client is not the only line of defence

Shelf's browser test deliberately bypasses the form and calls the API directly with an invalid book, then asserts the server answers `422`:

```js title="e2e/smoke.e2e.mjs"
--8<-- "docs/claude-code-handbook/examples/shelf/e2e/smoke.e2e.mjs:57:60"
```

## Loading, error and empty states

A list has not three states but four: *loading*, *error*, *empty*, and *has data*. Beginners build only the last. Shelf maps all of them in one small function, so it is trivially unit-testable:

```js title="web/ui.js"
--8<-- "docs/claude-code-handbook/examples/shelf/web/ui.js:28:37"
```

Placeholder rows ("skeletons") while data loads keep the layout from jumping — a polish item the videos add after the list works.

## Styling: utility classes and component libraries

Two decisions about CSS came up in the series:

- **Utility-first CSS (Tailwind).** Instead of inventing class names (`login-card`, `login-container`) and growing a stylesheet nobody dares edit, you compose small single-purpose classes in the markup. *Trade-off:* markup gets long, and some people dislike that. It is a preference, not a rule.
- **Component libraries (shadcn/ui and similar).** After adding Tailwind the video notices the same long class list repeated on every input. The remedy is a **shared component**: one `Input`, one `Button`, styled once, used everywhere.

The rule of thumb you can apply to any stack is the third time you copy the same block, *extract it.* And afterwards, tell the agent: add a line to `CLAUDE.md` — "use the shared `Input` component; do not hand-style inputs." The video does exactly this, and also practises restraint: it **removes** a note about the component library from the memory file because "this was just part of our setup" and would not help future sessions. Keep memory lean.

## Role-based access

Authentication says who you are. **Roles** say what you may do. Shelf has two: `member` and `admin`. The admin-only area is a few lines in the router:

```js title="src/app.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/app.js:134:136"
```

Pay attention to the status codes:

| Situation | Status |
|---|---|
| No key / unknown key | `401 Unauthorized` — *I don't know who you are* |
| Known user, wrong role | `403 Forbidden` — *I know you, and no* |
| Someone else's book | `404 Not Found` — *no such thing, as far as you can tell* |

On the front end, the video protects routes with a wrapper that redirects visitors without the required role. Remember that **hiding a button is not access control** — the server must refuse the request independently. A role check that exists only in the UI is decoration.

!!! tip "Prompt for role-based features"
    "Add a Users page visible only to admins. Enforce it on the server first (return 403), then hide the link in the UI for other roles. Add a test for each role."

## Common mistakes

- **Validating only in the browser.**
- **Duplicated rules** that drift apart over time.
- **Building only the "data" state** of a list.
- **Role checks only in the UI.**
- **Letting memory grow** with setup trivia. Memory is for conventions that will matter again.

## Check yourself

- [ ] I can explain why validation is needed on both sides, and how to share one set of rules.
- [ ] I know the four states of a data view and have handled all four.
- [ ] I can tell 401, 403 and 404 apart and give a case for each.
- [ ] I extracted repeated markup into a shared component and recorded the convention.
