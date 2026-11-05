---
title: "18. Lists, Detail Pages and Safe Output"
tags:
  - Pagination
  - Sorting
  - Webhooks
  - XSS
  - Security
---

# 18. Lists, Detail Pages and Safe Output

!!! abstract "Video map"
    Covers Section 6 (6.1–6.19): receiving tickets by email webhook, E2E tests for the webhook, listing, sorting and paginating, ticket details, assigning, replying, reviews and extracting shared interfaces, and preventing cross-site scripting.

This is the section where the video says the earlier investment "pays off": because the first features were clean and `CLAUDE.md` describes them, new features arrive fast. It is also the section where the instructor finds a security bug he *missed* — which is the most useful lesson in it.

## Work that arrives from outside

The video's first feature is a webhook: a customer emails the support address, an email service forwards it to your server as an HTTP request, and the server turns it into a ticket. Any endpoint like that has three jobs to get right:

1. **Prove the sender is who they claim.** Anyone can post to a public URL.
2. **Validate the content.** It is untrusted input, even from a "trusted" provider.
3. **Be idempotent.** Providers retry. The video checks for an existing open ticket from the same sender with the same subject, and returns that instead of creating a duplicate.

Shelf's analogue is the email webhook: a message such as `add: Emma by Jane Austen` creates a book. Authenticity is a **signature** — an HMAC of the exact request bytes using a secret shared with the provider — checked in constant time. Here are the tests that pin the behaviour down:

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:219:225"
```

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:227:247"
```

(Part 8 returns to email and shows the whole round trip with a real provider.)

### Test the webhook thoroughly, once

The video asks its test-writer subagent for E2E tests of the webhook and gets 22 in four groups: **authentication** (missing secret, wrong secret), **validation**, **ticket creation**, and **threading** (no duplicates). That grouping is a good template for any endpoint:

| Group | Questions |
|---|---|
| Authentication | Does it reject missing and wrong credentials? |
| Validation | Does it reject malformed input with a clear error? |
| Happy path | Does it do the thing and return the right shape? |
| Repeats and edge cases | What if it is called twice? With an empty body? Very large? |

The video also hits a snag here — the suggested command to run the tests fails with "script not found" — and its response is the right one: open a separate terminal, read the actual error, and fix the cause rather than asking the agent to guess.

## Listing: filter, sort, paginate

A list that works with ten rows breaks at ten thousand. Three features make a list usable, and each has a *where does it happen?* decision:

| Feature | Do it on the server when… | Do it on the client when… |
|---|---|---|
| Sorting | The data is paginated (client only has one page) | The whole set is already loaded |
| Filtering/search | The data is large | It is small |
| Pagination | Always, once data can grow | Never alone |

The video uses **TanStack Table**, a *headless* table library: it supplies the logic for sorting, filtering and paging but leaves the markup to you. Wherever the logic runs, the contract is the same, and Shelf's is easy to read:

- `?limit=20&offset=40` — the page; the server clamps `limit` to 1–100.
- `?sort=title|rating|created` — whitelisted values only.
- `?status=reading&q=dune` — filters.
- The **total count** travels in a response header (`x-total-count`), so the client can render "page 3 of 12" without a second request.

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:72:81"
```

Note the last assertion: asking for `limit=9999` still returns at most 100. **Never let a client choose an unbounded page size.** Whitelisting sort fields matters for the same reason — an unchecked `sort` parameter that goes straight into a query is an injection risk.

!!! tip "Incremental prompts"
    The video adds sorting, then pagination, as separate small prompts ("add sorting to the tickets table using TanStack Table", then "add pagination"), because the earlier conversation is still in context. Small, additive steps are easy to review and easy to roll back.

## Detail pages, assignment and replies

These features are mostly repetition of patterns you have now seen, which is the point. A few judgment calls are worth noting:

- **Clear the context before a new page.** The video clears when the window is nearly full and again before replies, and then *adds detail to the prompt* — "show the reply thread below the message, with a form to submit new replies" — because a fresh context knows nothing.
- **Read the plan before approving it.** On the reply feature the instructor spots a problem in the proposed data model *before any code exists*. Plan mode ([chapter 5](05-prompting-and-plan-mode.md)) is exactly for that.
- **Assignment is a relationship.** Assigning a ticket means a foreign key to a user; clearing it sets that to null (the video tests `PATCH` with `assignedToId: null`). Combine it with the soft delete from [chapter 17](17-building-crud.md) and an assigned ticket never loses its agent record.
- **Extract shared interfaces.** The review lessons pull common types (a ticket, a reply, a user) into one shared module that server and client import. Same principle as Shelf sharing `validateBook` — one definition, no drift.

## The bug the instructor missed: cross-site scripting

The most valuable lesson in this section is a confession. While reviewing, the instructor notices a line that renders an HTML email body using React's `dangerouslySetInnerHTML`. That is a **cross-site scripting (XSS)** hole.

> **XSS:** an attacker gets *their* script to run in *your* user's browser, usually by planting it in data your site later displays. The script then acts as the victim: reads their session, performs actions, redirects them.

The demonstration is simple. Anyone can email your support address; the email's HTML becomes the ticket body; an `<img src=x onerror=…>` in it executes when an agent opens the ticket. The attacker is a stranger, and the victim is your admin.

The video's fix is to **sanitize** the HTML with a library (DOMPurify) before inserting it. Shelf demonstrates the other and usually better approach — **escape by default**:

```js title="src/security.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/security.js:3:6"
```

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:88:99"
```

| Approach | When to use |
|---|---|
| **Escape** (`<` → `&lt;`) — treat the value as text | Nearly always. Titles, names, notes, emails |
| **Sanitize** (parse HTML and strip dangerous parts) | When you *must* display rich HTML from outside |
| **CSP header** | As a second wall: even if something slips through, scripts cannot run |

Shelf uses the first and the third together, and the browser test in [chapter 16](16-audit-and-e2e.md) proves a hostile title shows up as visible text and never as an element.

!!! warning "Why small tasks matter"
    The instructor traces the missed bug to a commit that touched about 35 files — too big to review properly. Keep each change small enough that you can really read it. It is easier to hold an agent to small tasks than to hold yourself to reading large diffs.

## Common mistakes

- **Trusting a webhook because the URL is secret.**
- **Creating a duplicate on every retry.**
- **Unbounded `limit` or unchecked `sort`.**
- **Rendering stored HTML without escaping or sanitizing.**
- **Approving a plan or a diff you did not read.**

## Check yourself

- [ ] I can list the three jobs of a webhook endpoint and test each.
- [ ] I can say when sorting and filtering belong on the server.
- [ ] I can explain XSS and show the difference between escaping and sanitizing.
- [ ] I keep my changes small enough to review.
