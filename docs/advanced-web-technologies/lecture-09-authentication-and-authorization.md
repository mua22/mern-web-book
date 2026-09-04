---
title: "Lecture 9: Application Security: Authentication and Authorization"
tags:
  - Security
  - Authentication
  - Authorization
  - JWT
  - Sessions
  - RBAC
---

# Lecture 9: Application Security: Authentication and Authorization

In CSC336 you learned to build login systems that work. This lecture asks a harder
question: how do they hold up when someone is actively trying to break them? You will
revisit authentication and authorization at production depth — comparing stateful
sessions against stateless tokens, hardening how you store secrets and hashes, and
formalizing *who is allowed to do what* with proper access-control models.

## In This Lecture

- Distinguish authentication from authorization precisely, and compare stateful sessions
  with stateless tokens
- Implement server-side session storage backed by Redis
- Understand JWT structure, signing, expiry, and refresh tokens, and where to safely
  store them client-side
- Apply Role-Based Access Control (RBAC) and survey other access-control models (DAC,
  MAC, ABAC)
- Hash and salt passwords correctly with bcrypt, enforce password policies, and
  understand multi-factor authentication (MFA)

## Authentication vs. Authorization, Revisited

**Authentication** answers "who are you?" — verifying an identity, typically via a
password, a token, or a biometric factor. **Authorization** answers "what are you
allowed to do?" — deciding whether an already-authenticated identity may perform a
specific action on a specific resource. These are separate concerns, and conflating
them is a common source of vulnerabilities: a system can authenticate a user correctly
and *still* let them access another user's data because authorization was never
checked.

!!! note
    A useful mental model: authentication happens once (or periodically, via
    re-verification), producing an identity. Authorization happens on *every* request,
    checking that identity against the specific thing being requested.

Every authentication scheme needs a way to remember "this request came from an
already-verified identity" without re-checking a password on every single HTTP call
(HTTP itself is stateless). There are two fundamentally different strategies for this,
and the rest of the lecture builds on the distinction between them:

- **Stateful sessions** — the server stores session data and hands the client an opaque
  reference (a session ID) to look it up.
- **Stateless tokens** — the server hands the client a signed, self-contained credential
  (a JWT) that carries its own claims and needs no server-side lookup to verify.

```mermaid
flowchart TD
    A[Client sends credentials] --> B{Authentication scheme}
    B -->|Stateful| C[Server creates session<br/>stores it in Redis/DB]
    C --> D[Client gets opaque session ID<br/>in a cookie]
    D --> E[Every request: server looks up<br/>session ID in the store]
    B -->|Stateless| F[Server signs a JWT<br/>with claims embedded]
    F --> G[Client stores JWT<br/>httpOnly cookie or localStorage]
    G --> H[Every request: server verifies<br/>signature, no DB lookup needed]
```

## Session-Based Authentication and Server-Side Session Stores

In a session-based scheme, the server is the sole source of truth. After a successful
login, the server creates a **session** — a record of who the user is and what state
belongs to them — and stores it server-side, keyed by a randomly generated **session
ID**. That ID is sent to the browser, almost always in an `httpOnly` cookie, and the
browser automatically re-sends it on every subsequent request. The server looks the ID
up in its session store to reconstitute "who is this."

The naive default — Express's in-memory `MemoryStore` — keeps sessions in the Node
process's own memory. This works for local development but fails in production for two
reasons: memory is lost on every restart or deploy, and it cannot be shared across
multiple server instances behind a load balancer. The standard production fix is a
**Redis-backed session store**: Redis is an in-memory key-value data store, fast enough
to look up a session on every request, and — unlike the Node process's own heap — it is
external, shared, and persists across restarts and multiple app instances.

```javascript
const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");

const app = express();

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

app.use(
  session({
    store: new RedisStore({ client: redisClient, prefix: "sess:" }),
    secret: process.env.SESSION_SECRET, // signs the session-ID cookie
    resave: false,             // don't re-save unchanged sessions
    saveUninitialized: false,  // don't create a session until something is stored
    cookie: {
      httpOnly: true,   // JavaScript cannot read this cookie
      secure: true,     // only sent over HTTPS
      sameSite: "lax",  // mitigates CSRF (see Lecture 11)
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

app.post("/login", async (req, res) => {
  const user = await verifyCredentials(req.body.email, req.body.password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  req.session.userId = user.id; // Redis now holds this session
  res.json({ message: "Logged in" });
});
```

!!! danger "Never ship `MemoryStore` to production"
    Express literally logs a warning that `MemoryStore` is "not designed for a
    production environment" — it leaks memory, loses every session on restart, and
    cannot be shared across horizontally scaled instances. Always swap in a real store
    (Redis, MongoDB, PostgreSQL) before deploying.

Because the session lives entirely on the server, **revocation is trivial**: deleting
the Redis key immediately invalidates that session everywhere, which is exactly what
you want for a "log out of all devices" or "force-expire compromised sessions" feature.
This is the single biggest practical advantage sessions have over tokens.

## Token-Based Authentication and JWT

A **JSON Web Token (JWT)** is a compact, self-contained credential the server issues
once and the client presents on every subsequent request — no server-side session
lookup required. This statelessness is what makes JWTs attractive for APIs consumed by
multiple client types (web, mobile, third-party) and for horizontally scaled systems
where you'd rather not hit a shared store on every request.

### Structure: header.payload.signature

A JWT is three Base64URL-encoded segments joined by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NmZhMSIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcxOTk5OTk5OX0.4f8a1e9c2b7d...
└──────────── header ────────────┘ └───────────────── payload ─────────────────┘ └── signature ──┘
```

- **Header** — metadata: the signing algorithm (e.g. `HS256`, `RS256`) and token type.
- **Payload** — the **claims**: data about the subject, such as `sub` (user ID),
  `role`, `iat` (issued-at), and `exp` (expiry). The payload is only *encoded*, not
  encrypted — anyone can decode and read it, so never put secrets or sensitive personal
  data in it.
- **Signature** — computed over the header and payload using a secret (HMAC, `HS256`)
  or a private key (asymmetric, `RS256`). It proves the token wasn't tampered with; it
  does not hide the payload's contents.

!!! danger "A JWT is signed, not encrypted"
    Anyone can paste a JWT into jwt.io and read every claim inside it. The signature
    only guarantees *integrity* (nobody altered it) — never store passwords, credit
    card numbers, or other secrets in the payload.

### Signing, Expiry, and Refresh Tokens

```javascript
const jwt = require("jsonwebtoken");

// Issue a short-lived access token
const accessToken = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

// Verify it on protected routes
function requireAuth(req, res, next) {
  const token = req.cookies.accessToken; // see storage discussion below
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
```

A short `expiresIn` limits the damage a stolen token can do, but it also means users
would be forced to re-login every 15 minutes — unacceptable for usability. The standard
fix is a **refresh token**: a long-lived, separately stored credential (often days or
weeks) whose *only* job is to obtain new access tokens. When the short-lived access
token expires, the client silently calls a `/refresh` endpoint with the refresh token
to get a new access token, without asking the user to log in again.

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server

    C->>S: POST /login (credentials)
    S-->>C: access token (15 min) + refresh token (7 days)
    Note over C: Access token expires after 15 min
    C->>S: GET /api/data (expired access token)
    S-->>C: 401 Unauthorized
    C->>S: POST /refresh (refresh token)
    S->>S: Verify refresh token,<br/>check it isn't revoked
    S-->>C: new access token
    C->>S: GET /api/data (new access token)
    S-->>C: 200 OK
```

!!! tip
    Because refresh tokens are long-lived and powerful, store a record of *issued*
    refresh tokens server-side (even in a stateless-token system) so you can revoke
    them — for example, in a `revoked_tokens` table or a Redis set — and rotate them
    (issue a new one, invalidate the old one) on every use.

### Secure Token Storage: httpOnly Cookies vs. localStorage

Where the client keeps the JWT matters as much as how the server issues it.

| | `httpOnly` cookie | `localStorage` |
|---|---|---|
| Readable by JavaScript | No | Yes |
| Vulnerable to XSS theft | No (script can't read it) | Yes (any injected script can read and exfiltrate it) |
| Sent automatically by browser | Yes, on every matching request | No — you must attach it manually to each request |
| Vulnerable to CSRF | Yes, unless mitigated (`SameSite`, anti-CSRF token) | No (not sent automatically) |
| Works across subdomains/APIs easily | Only within cookie domain rules | Yes, attach to any request manually |

There is no universally "correct" answer — it's a genuine trade-off between two attack
classes covered in depth in Lecture 11 (XSS and CSRF):

- Storing the JWT in an **httpOnly cookie** protects it from being stolen via
  Cross-Site Scripting (a malicious script cannot read an httpOnly cookie), but exposes
  the app to Cross-Site Request Forgery unless you add `SameSite` cookie attributes
  and/or anti-CSRF tokens.
- Storing the JWT in **`localStorage`** avoids CSRF risk (it isn't sent automatically),
  but if an attacker manages to inject any JavaScript into your page via XSS, they can
  read it directly and exfiltrate it — arguably the more dangerous failure mode, since
  it lets the attacker impersonate the user entirely, from anywhere.

!!! danger "The industry-recommended default"
    For most applications, prefer an `httpOnly`, `secure`, `SameSite=strict`-or-`lax`
    cookie for token storage, combined with rigorous XSS defenses (Lecture 11) and CSRF
    protection where needed. Avoid `localStorage` for anything as sensitive as an
    access token unless you have a specific reason (e.g. a fully separate API domain
    with no cookie support) and compensating XSS controls.

## Access-Control Models

Once you know *who* the user is, you need a systematic way to decide *what* they can
do. Several formal **access-control models** exist:

- **DAC (Discretionary Access Control)** — resource owners decide who else can access
  their resource (e.g. file-sharing permissions you set yourself). Flexible, but hard
  to audit at scale.
- **MAC (Mandatory Access Control)** — access is governed by centrally defined
  security labels/classifications that individual users cannot override (common in
  government/military systems, e.g. "Top Secret" clearance levels).
- **RBAC (Role-Based Access Control)** — permissions are attached to **roles**
  (`admin`, `editor`, `viewer`), and users are assigned one or more roles. This is the
  model most web applications use, because it scales well: you manage a handful of
  roles instead of per-user permission lists.
- **ABAC (Attribute-Based Access Control)** — access decisions are computed from
  **attributes** of the user, the resource, and the environment (e.g. "allow if
  `user.department == resource.department` AND `time is business hours`"). More
  flexible and fine-grained than RBAC, but more complex to reason about and audit.

### Implementing RBAC in Express

```javascript
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

app.delete(
  "/api/users/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).end();
  }
);
```

!!! note
    Notice the two middleware functions are separate and composed: `requireAuth`
    establishes *who* the user is (authentication); `requireRole` decides *whether*
    that identity may proceed (authorization). Keeping them as distinct, chainable
    middleware is good practice — never merge identity verification and permission
    checking into one function.

## Password Hashing and Multi-Factor Authentication

Passwords must never be stored in plaintext or with reversible encryption — if your
database is ever breached, plaintext passwords are an immediate, catastrophic
compromise of every user account (and, because people reuse passwords, of accounts on
other sites too). Instead, store a **hash**: the one-way output of a cryptographic hash
function, from which the original password cannot practically be recovered.

**bcrypt** is the standard choice for password hashing on the web. Unlike general-purpose
hash functions (SHA-256, MD5), bcrypt is deliberately slow and includes a **work
factor** (cost/rounds) you can tune upward as hardware gets faster, keeping brute-force
attacks expensive even years later. It also automatically generates and embeds a
**salt** — random data mixed into the input before hashing — so that two users with the
identical password get completely different hashes, defeating precomputed
**rainbow-table** attacks.

```javascript
const bcrypt = require("bcrypt");

async function registerUser(email, plainPassword) {
  const saltRounds = 12; // higher = slower to compute = more resistant to brute force
  const passwordHash = await bcrypt.hash(plainPassword, saltRounds);
  await User.create({ email, passwordHash });
}

async function verifyCredentials(email, plainPassword) {
  const user = await User.findOne({ email });
  if (!user) return null;
  const matches = await bcrypt.compare(plainPassword, user.passwordHash);
  return matches ? user : null;
}
```

!!! danger "Never roll your own hashing"
    Never use plain SHA-256/MD5 for passwords (they're designed to be *fast*, which
    is exactly wrong for password hashing — it makes brute-forcing cheap), and never
    write your own salting scheme. Use a vetted library: bcrypt, scrypt, or Argon2.

**Password policies** reduce the odds of weak, guessable, or reused passwords: a
minimum length (prefer length over forced complexity — modern guidance, e.g. NIST
SP 800-63B, favors long passphrases over "must contain a symbol"), checks against
known-breached password lists, and rate-limiting login attempts to slow brute-force
guessing (covered further in Lecture 12).

**Multi-factor authentication (MFA)** requires proving identity with two or more
independent factors, typically drawn from:

- **Something you know** — a password or PIN
- **Something you have** — a phone (SMS/push notification), a hardware key (FIDO2/
  WebAuthn), or a Time-based One-Time Password (TOTP) app like Google Authenticator
- **Something you are** — a biometric factor (fingerprint, face recognition)

Even if an attacker steals a password (via phishing, a data breach, or credential
stuffing), MFA blocks them from completing login without the second factor. TOTP is a
common, low-friction implementation: the server and the user's authenticator app share
a secret, and both independently compute a 6-digit code that changes every 30 seconds.

!!! tip
    You don't need to implement MFA from scratch. Libraries like `speakeasy` or
    `otplib` handle TOTP secret generation and verification; for WebAuthn/FIDO2,
    `@simplewebauthn/server` handles the much more complex hardware-key protocol.

## Try It Yourself

1. Build a small Express app with Redis-backed sessions (`express-session` +
   `connect-redis`). Add a `/login` route that sets `req.session.userId`, a `/me` route
   that reads it back, and a `/logout` route that calls `req.session.destroy()`. Verify
   in `redis-cli` (`KEYS sess:*`) that a key disappears after logout.
2. Implement JWT access + refresh tokens: a `/login` route issuing both, a `/refresh`
   route that exchanges a valid refresh token for a new access token, and a
   `requireAuth` middleware. Then add `requireRole("admin")` to one route and confirm a
   non-admin user gets a `403`.

## Key Takeaways

- Authentication verifies identity; authorization decides what that identity may do —
  keep the two checks separate in your code.
- Session-based auth is stateful (server stores everything, revocation is instant);
  JWTs are stateless (self-contained, no lookup needed, but harder to revoke early).
- A JWT's payload is readable by anyone — the signature guarantees integrity, not
  secrecy. Never put secrets in it.
- Short-lived access tokens plus long-lived refresh tokens balance security with
  usability; store refresh-token state server-side so you can revoke it.
- `httpOnly` cookies resist XSS token theft but need CSRF protection; `localStorage`
  avoids CSRF but is fully exposed to any successful XSS.
- RBAC (roles → permissions) is the standard web access-control model; DAC, MAC, and
  ABAC solve the same problem with different trade-offs.
- Always hash passwords with bcrypt (or scrypt/Argon2) using a proper salt and work
  factor — never store plaintext or use fast general-purpose hashes.
- MFA adds a second independent proof of identity, blocking attackers who have only
  stolen a password.
