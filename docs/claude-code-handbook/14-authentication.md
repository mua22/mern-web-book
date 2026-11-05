---
title: "14. Authentication and Sessions"
tags:
  - Authentication
  - Sessions
  - Security
---

# 14. Authentication and Sessions

!!! abstract "Video map"
    Covers Section 4, lessons 4.1–4.6: choosing an authentication strategy, choosing a session strategy, setting up an auth library, reviewing the setup, and seeding the first admin instead of allowing public registration.

Authentication is where "the AI wrote it and it seems to work" is most dangerous. A login form that works is easy; one that is *secure* depends on decisions the code cannot show you. This chapter is about those decisions.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/auth-flow.svg"
</div>

## Two words people mix up

- **Authentication** — *who are you?* (prove your identity)
- **Authorization** — *what are you allowed to do?* (permissions, roles)

Shelf separates them in code: `authenticate()` produces an identity, and each route then decides what that identity may do.

## Decision 1 — build it or buy it?

| | Managed service (Auth0, Clerk, …) | Library in your app (Better Auth, Lucia, Passport, …) | Hand-rolled |
|---|---|---|---|
| Speed | Fastest | Fast | Slow |
| Control | Least | High | Total |
| Cost | Per user, forever | Free | Your time |
| Risk | Vendor lock-in | You operate it | **You own every mistake** |

The course picks an in-app library because it wants you to understand sessions, tokens, hashing and roles — and notes that moving *to* a managed service later is easy, while the reverse is hard. A sensible rule for real projects: **never hand-roll password handling or session logic**; choose a well-maintained library or a managed service and spend your effort on *using it correctly*.

!!! tip "Let the library teach the agent"
    Some libraries publish instructions designed for AI assistants (the video installs one for the auth library it picks). Look for "AI" or "skills" sections in docs; they steer the agent away from outdated patterns. Run interactive installers yourself in a terminal — an agent cannot answer a prompt that waits for keyboard input.

## Decision 2 — how does the server remember you?

After login the server must recognise you on the next request. Two common designs:

| | Database sessions | Signed tokens (JWT) |
|---|---|---|
| State lives | On the server (a table) | Inside the token the client holds |
| Log a user out | Delete the row — **instant** | Wait for expiry, or keep a deny-list (which is state again) |
| Change a role | Effective immediately | Stale until the token expires |
| Cost per request | One lookup | Signature check only |
| Best for | Most web apps | Stateless services, service-to-service calls |

For a customer-support style tool where revoking access immediately matters, **database sessions** win. The key lesson from the video: the decision depends on *your situation*, not on what is fashionable — and the agent will not weigh it for you unless you ask it to.

## Shelf's answer: API keys

Shelf's clients are scripts and a small internal page, so it uses **API keys** that map to `{ owner, role }`. The recorded reasoning is in the decision log: sessions or JWT would be the right call for a public browser app.

```js title="src/auth.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/auth.js:5:32"
```

Details worth noticing:

- **Constant-time comparison** (`timingSafeEqual`) so an attacker cannot learn a key character by character from response times.
- **No early exit** in the loop — the same reason.
- **Unknown or missing key → `null`**, which the router turns into `401`.
- **Roles come from the server's configuration**, never from anything the client sends.

The two rules that matter most are verified by tests (`test/features.test.js`):

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:42:70"
```

## No public registration

Setting up the library gives you a sign-up endpoint for free. The video's project is an internal customer-support tool, so an open sign-up is a **hole**: anyone could register and read customers' data. The fix is a design decision, not a code trick:

1. Disable public sign-up.
2. Create the first admin with a **seed script** that reads its email and password from environment variables.
3. Let that admin create other users later.

Shelf reaches the same goal differently — there is no sign-up at all; an operator provisions keys in `SHELF_KEYS` (see [chapter 13](13-project-setup.md)). Both designs answer the question *"who is allowed to have an account?"* explicitly, which is the point.

## Reviewing what the agent set up

After the library is configured, spend ten minutes looking at:

- **The database tables it created** — users, sessions, accounts. Can you say what each column is for?
- **The config file** — session lifetime, cookie flags, which fields users can set.
- **Environment variables** — are the example values obviously fake? A copy-pasted example secret that ships to production is a classic vulnerability (the video's later security audit flags exactly this).
- **Extra fields you added** (such as `role`) — can a client set them during sign-up? It must not.

Then commit: *"Set up authentication"*. Small commits make the next review smaller.

## Common mistakes

- **Choosing auth by tutorial popularity** instead of by who your users are.
- **Trusting the client for the role.** Roles live on the server.
- **Different errors for "unknown user" and "wrong password."** Use one message, so attackers cannot discover which emails exist.
- **Leaving example secrets in place.**
- **Using `403` for other people's data.** Prefer `404` so ids do not leak.

## Check yourself

- [ ] I can state the difference between authentication and authorization.
- [ ] I can compare database sessions with JWTs and pick one for a given project.
- [ ] I can explain why Shelf compares keys in constant time.
- [ ] I know why public registration was removed, and how the first admin is created.
