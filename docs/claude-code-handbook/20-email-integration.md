---
title: "20. Email Integration"
tags:
  - Email
  - Webhooks
  - Tunnelling
  - Troubleshooting
---

# 20. Email Integration

!!! abstract "Video map"
    Covers Section 8 (8.1–8.6): setting up an email provider (SendGrid), tunnelling a local server with ngrok, receiving emails, troubleshooting the integration, and sending emails.

This is "where everything comes together": a customer emails you, your application receives the message, acts on it, and answers by email. It is also the first time your code has to cooperate with systems you do not control — DNS, a mail provider, the public internet — so **most of the work is configuration and debugging, not code.** That is why this section is mostly a troubleshooting story.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/email-flow.svg"
</div>

## How the round trip works

**Receiving**

1. A customer sends mail to `anything@yourdomain.com`.
2. Your domain's **MX record** (a DNS entry that says "mail for this domain is delivered *there*") points to the email provider.
3. The provider receives the message and, following an *inbound rule* you configured, **POSTs it to your webhook URL.**
4. Your webhook verifies the request, parses it, and creates a ticket (video) or a book (Shelf).

**Sending**

1. Your app calls the provider's API (or SMTP relay) with a message.
2. The provider delivers it from a **verified sender identity** — an address you proved you own.

## Choosing a provider

The video uses SendGrid because it is long-established and has a free tier. The ideas apply to Mailgun, Postmark, Amazon SES and others. What matters when choosing:

| Question | Why it matters |
|---|---|
| Does it support **inbound** parsing, or only sending? | Not all do |
| Can it **sign** the webhook, or only send a secret in the URL? | Decides how you authenticate it |
| Is there an **event log**? | You will need to trace missing mail (the video notes this is critical in production) |
| Free tier and rate limits | Matters for development |

!!! warning "Follow the provider's current documentation"
    Dashboards and settings move around, and some services have been acquired, renamed or retired since any tutorial was recorded. Use the provider's current guide for exact screens and DNS records; use this chapter for the *shape* of the integration.

## Develop against a public URL: tunnelling

A provider on the internet cannot reach `localhost`. A **tunnel** (ngrok and similar tools) gives your local port a temporary public address:

```bash
ngrok http 3000
# Forwarding  https://example-name.ngrok-free.app  ->  http://localhost:3000
```

Use that address for the provider's inbound rule. Habits that save time:

- **Check the tunnel with your own browser first** (`/health`), before blaming the provider.
- **The address changes** whenever the tunnel restarts on the free plan, and then the provider's rule points to nothing.
- **A tunnel exposes your dev server to the world.** Keep secrets out of it, require the webhook signature, and close it when you are done.

## Authenticating the webhook

Anyone can POST to a public URL, so the endpoint must prove the request came from the provider. There are two common schemes, and the provider decides which you can use:

| Scheme | How it works | Strength |
|---|---|---|
| **Shared secret in the URL** (`?secret=…`) | Provider cannot set custom headers, so the secret rides in the query string | Weaker: URLs end up in logs |
| **Signed body (HMAC)** | Provider signs the exact bytes; you recompute the signature | Stronger: proves integrity too |

The video uses the first because its provider cannot send custom headers. Shelf demonstrates the second, which you should prefer when available. Two details matter: compute the signature over the **raw bytes** you received (not re-serialised JSON), and compare in **constant time**.

```js title="src/mailer.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/mailer.js:29:54"
```

Then parsing: the provider's payload is a different shape from your API's. The video notes that inbound mail arrives as form data, so a parsing step is needed before validation. Keep this translation in one small function (`parseInbound`) so it is easy to test:

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:212:225"
```

And the whole round trip — bad signature rejected, valid message acted on, reply sent, then a second message finishing the book:

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:227:247"
```

## Sending: an interface, then a provider

Sending needs a **verified sender** and an **API key**. Keep the provider behind an interface so the rest of the app never imports a vendor library. Shelf has two implementations: `MemoryMailer`, which records messages (tests and local development), and `HttpMailer`, which posts JSON to a provider.

```js title="src/mailer.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/mailer.js:4:27"
```

In the video the finished flow is tested with a real message: a customer question that the knowledge base can answer comes back as a signed reply from the support address, and the ticket shows as resolved with both the question and the automated answer.

!!! note "Do sending in the background"
    A slow mail provider should not slow your webhook. Put the send on the job queue from [chapter 19](19-ai-features.md) so it retries on failure.

## Troubleshooting the integration

The video's debugging session is a template for any integration. The email never appears, and the instructor works outwards from the app:

1. **Run the server in your own terminal** so you can see its logs (the agent's terminal hides them).
2. **Send again and watch the log.** Nothing arrives → the request never reached you. That narrows it to the network path.
3. **Test the public URL by hand** (`/health` through the tunnel). *It fails* — because the server had restarted and the tunnel had crashed.
4. **Restart the tunnel, get the new URL, update the provider's rule.** (The provider would not let the old rule be edited, so it had to be recreated.)
5. **Send again.** Now a different problem shows up in the logs: the app expects a record (the AI agent's user) with a particular id that had been changed after the migration. Fix the data.
6. **Verify the result** end to end.

The lesson is the order: **app → tunnel → provider → DNS**, one hop at a time, checking each with a command you can run yourself. The troubleshooting tree in [Appendix B](appendix-b-troubleshooting.md) puts this into a diagram.

### A checklist for "my webhook is never called"

- [ ] Does the public URL answer `/health` from a browser?
- [ ] Is the exact path in the provider's rule the one your server routes?
- [ ] Does the provider's log say it *attempted* delivery? What status did it get?
- [ ] Is the secret or signature configured identically on both sides?
- [ ] Is DNS (MX) correct? (It can take time to propagate.)
- [ ] Is a firewall or the tunnel blocking large bodies?

## Idempotency and retries

Providers retry when you respond slowly or with an error. Make the handler safe to run twice: look for an existing record before creating one (the video checks for an existing open ticket with the same sender and subject), and return quickly — do slow work in a job.

## Common mistakes

- **Using a secret in the URL and logging full URLs.**
- **Verifying a re-serialised body** instead of the raw bytes.
- **Forgetting the tunnel address changes.**
- **Doing slow work before responding to the provider.**
- **Sending from an unverified address** (mail lands in spam or is rejected).
- **No event log**, so no way to trace missing messages.

## Check yourself

- [ ] I can explain what an MX record does and how an inbound email reaches my server.
- [ ] I can say why a tunnel is needed and what its risks are.
- [ ] I can authenticate a webhook with a signature and explain why the raw body is signed.
- [ ] I can follow the app → tunnel → provider → DNS order when mail does not arrive.
