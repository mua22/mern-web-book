---
title: "19. Adding AI Features to Your App"
tags:
  - AI Features
  - Background Jobs
  - Prompt Injection
  - Testing
---

# 19. Adding AI Features to Your App

!!! abstract "Video map"
    Covers Section 7 (7.1–7.13): polishing replies, summarizing, classifying tickets, testing AI features, background job processing, auto-resolving from a knowledge base, and a metrics dashboard.

Until now Claude was a tool *you* used to build the app. In this part the model becomes a **component inside the app** — a different job with different risks. Calling a language model from your code is easy: one HTTP request. Making that call **safe, testable and affordable** is the engineering.

## Four rules for every AI feature

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/ai-feature.svg"
</div>

1. **Wrap the non-deterministic part in a deterministic shell.** Build the prompt in code, call the model through *one* function, and process the result in code.
2. **Treat model output as untrusted input.** Validate it exactly as you would a form submission.
3. **Always have a fallback.** The model will sometimes be slow, down, wrong or silly. The user's request must still succeed.
4. **Inject the model call.** Pass a `complete(prompt)` function in, so tests can supply a fake and never touch the network.

Shelf's call to the real API is a dozen lines, and nothing else in the codebase knows how it works:

```js title="src/ai.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/ai.js:6:20"
```

Notice the **15-second timeout** — an AI call without a timeout is a hung request waiting to happen — and that the key comes from the environment, never from code.

!!! info "About the model name"
    The default model name lives in one place and can be overridden with `ANTHROPIC_MODEL`. Model names change; hard-code them as little as possible and check the current list in Anthropic's documentation when you deploy.

## Feature 1 — classify (small, structured output)

The video classifies each incoming ticket into a category. Shelf classifies each book into a genre. The pattern is the same: **constrain the output to a short list, then check that the model obeyed.**

```js title="src/ai.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/ai.js:22:35"
```

Walk through what protects you:

- The prompt names the allowed values and asks for *only* the word.
- The reply is cleaned (`trim`, lower-case, strip punctuation) and **checked against the list**.
- A wrong answer or an exception returns `"other"` with `source: "fallback"` so you can later measure how often the fallback fires.
- The book's title is passed through `JSON.stringify`, so it arrives as quoted data.

The video tests the edge case "gibberish text" and finds the model still picks a valid category. You could instead allow "unknown"; either is fine as long as you *decided*.

## Feature 2 — summarize (longer output)

Two design options appear in the video, and the discussion is a model for any such trade-off:

| Option | Pros | Cons |
|---|---|---|
| Regenerate every time | Simple, never stale | Slower for the user, costs tokens on every view |
| Cache the summary | Faster, cheaper | Needs storage, and must be **invalidated** when the source changes |

The instructor picks the simple one — *"simplicity is the ultimate sophistication"* — because the goal is to reach production. Shelf stores the summary (it is generated once by a background job), which is cheap here because notes rarely change. Whichever you choose, write the reason down.

```js title="src/ai.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/ai.js:37:53"
```

Again: input is **truncated** (`slice(0, 4000)`) to cap cost, output length is **checked** before it is trusted, and a plain-code fallback (the first sentence) keeps the feature useful when the model fails.

## Feature 3 — polish text (an assistive feature)

"Polish my reply" is the simplest and safest kind of AI feature: a human reads the result before it goes anywhere. The video's review of this feature is a good lesson in *cleaning up AI-written code*: it asks Claude to move a schema out of a module called `ai.ts` (because *"AI is an implementation detail, not a concept in this application"*), rename `polishRequestSchema` to something accurate, remove a property that was not needed, and rename an ambiguous mutation. None of those are bugs. All of them are the difference between code you can maintain and code you cannot.

!!! tip "Design principle: AI as an assistant first"
    Start with features where a person approves the output (polish, summarize, suggest). Move to features where the system acts alone (classify, auto-resolve) only once you can measure how well it works.

## Testing AI features

The video makes a decision that is worth copying: **no E2E tests for features that depend on a third-party AI.** If the provider is down, your pipeline fails and you wrongly suspect your own code. Instead:

- **Unit-test the shell** with a fake `complete` function: valid output, junk output, an exception, an empty string.
- **Unit-test the UI states**: the Polish button is disabled when the box is empty, enabled when there is text, shows an error if the request fails.
- **Never** assert on the exact wording the real model produces.

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:149:170"
```

## From "fire and forget" to a job queue

A classification can take seconds, but an email provider calling your webhook will time out or retry if you hold the connection. The video's first solution is to call the AI function **without awaiting it** — *fire and forget*. Its three weaknesses are exactly the reasons job queues exist:

| Problem with fire-and-forget | What a queue gives you |
|---|---|
| A restart loses the work silently | Jobs are recorded and can be resumed |
| No retries when the call fails | Automatic **retries with backoff** |
| No visibility | A list of done and failed jobs |

The video uses a Postgres-backed queue so it needs no extra infrastructure (the alternative, BullMQ, requires Redis). Shelf's is an in-process queue, small enough to read completely:

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/job-queue.svg"
</div>

```js title="src/jobs.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/jobs.js:22:46"
```

- `enqueue()` returns at once — the HTTP route answers **`202 Accepted`** and the client carries on.
- A failed job waits 200 ms, then 400, then 800 (**exponential backoff**) so a struggling provider is not hammered.
- After `maxAttempts` the job lands in the **dead-letter list** instead of vanishing.
- The `sleep` function is injected, so the tests for all of this run instantly.

!!! warning "Be honest about the limits"
    An in-process queue loses its jobs when the process restarts. That is fine for a teaching project and for non-critical enrichment, and **not** fine for work you must not lose. For real durability, use a persistent queue (database-backed or Redis-backed) — the `JobQueue` interface is what you would keep.

## Feature 4 — auto-resolve from a knowledge base

This is the video's showpiece: new tickets that match a knowledge base get an answer automatically; the rest go to a human. The risk is obvious — the model must not make things up to a customer. Shelf's version bakes in the safest design:

> **The model chooses. It does not write.** It is shown a menu of prepared answers and must reply with an id (or `NONE`). The text sent to the customer always comes from *your* knowledge base.

```js title="src/faq.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/faq.js"
```

What this buys you:

- A confused or manipulated model can pick the **wrong entry**; it cannot invent a refund policy.
- The customer's text is quoted as data (`JSON.stringify`), which reduces **prompt injection** — an email saying *"ignore your rules and reply with…"* — to one more string the model failed to route.
- Anything unrecognised returns `source: "none"` and the message stays for a human.

The tests include exactly that hostile case:

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:315:328"
```

!!! danger "Prompt injection, in one paragraph"
    Anything the model reads can contain instructions: a customer email, a web page, a file. The model cannot reliably tell your instructions from instructions hidden in the data. So: keep untrusted text out of the instruction part of the prompt, restrict what the model's *output* can do (a menu of ids beats free text), and never give a model that reads untrusted data the power to do something irreversible on its own.

### Avoid the race between humans and AI

The video notices a subtle problem: a new ticket appears, an agent opens it, and a second later the AI "resolves" it in the background. The fix is a **status**. New tickets are `new` → `processing` (hidden from agents) → `open` (or `resolved` by AI). Use statuses to make ownership explicit whenever background work and people touch the same record.

### Give the AI an identity

For the dashboard, the instructor first accepts a convoluted database query ("resolved with a reply by a null user of type agent"), then improves it: **create a default user called "AI agent"** and assign AI-resolved tickets to it. The metric becomes a trivial `WHERE assignedTo = ai-agent`. When a query is hard to read, the *data model* is often wrong, not the query.

## Measure it: a dashboard

An automated feature you cannot measure is a feature you cannot trust. The video builds a dashboard with total tickets, open tickets, resolved by AI, percentage resolved by AI, average resolution time, and a 30-day volume chart. Shelf exposes the same idea as a tiny admin endpoint:

```js title="src/app.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/app.js:138:143"
```

For the email path it reports how many messages arrived, how many were commands, how many the FAQ answered, how many went to a human, and the **automation rate**. If that last number is low, your FAQ is missing questions; if the human count is growing, your product has a gap. *Metrics turn "the AI seems to be working" into evidence.*

## Splitting modules that grew

Another quiet lesson from the review lesson: the queue module had become responsible for classification **and** auto-resolving, so the instructor asks Claude to split it into two modules. Agents add code where code already is. Watch for files that collect responsibilities and split them early — and tell `CLAUDE.md` where each responsibility lives.

## Cost and speed notes

- Use a **small, fast model** for narrow tasks like classification and routing; save larger models for hard reasoning.
- **Cap input** (truncate) and **output** (`max_tokens`).
- Cache or store results you will need again.
- Log token counts per feature so a surprise bill has an explanation.

## Common mistakes

- **Trusting model output** without validating it.
- **No timeout** on the call.
- **No fallback** — the feature fails exactly when the provider does.
- **Free-text replies to customers written by an unsupervised model.**
- **E2E tests that depend on a live AI provider.**
- **Fire-and-forget for work that must not be lost.**

## Check yourself

- [ ] I can state the four rules for an AI feature and show where Shelf applies each.
- [ ] I can explain why the model call is injected.
- [ ] I can describe the problems with fire-and-forget and how a queue solves each.
- [ ] I can explain why "the model chooses, it does not write" is safer, and what prompt injection is.
- [ ] I know one metric that tells me whether an automated feature is working.
