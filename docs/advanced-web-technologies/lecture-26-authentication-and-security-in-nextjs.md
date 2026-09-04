---
title: "Lecture 26: Authentication and Security in Next.js"
tags:
  - Authentication
  - NextAuth
  - Auth.js
  - Security
  - Middleware
  - CSRF
---

# Lecture 26: Authentication and Security in Next.js

Almost every production application needs to know who is using it and restrict what they
can see or do. This lecture covers how authentication works in the App Router — from
choosing a strategy, to wiring up Auth.js, to protecting every layer of a Next.js
application, to the web-security fundamentals a professional frontend developer is
expected to get right.

## In This Lecture

- Compare authentication approaches: session-based, JWT-based, and third-party providers
- Set up NextAuth.js / Auth.js: providers, callbacks, sessions, and adapters
- Protect pages, layouts, route handlers, and Server Actions; enforce access with
  middleware and render role-based UI
- Securely handle environment variables and defend against XSS, CSRF, CORS, and
  missing security headers

## Authentication Approaches

**Authentication** answers "who is this user?"; **authorization** answers "what is this
user allowed to do?" Next.js doesn't prescribe one authentication mechanism — you choose
based on your architecture, and three approaches cover almost every real application.

### Session-Based Authentication

The server creates a **session** on login, stores it (in memory, a database, or Redis),
and gives the browser an opaque **session ID** in an `httpOnly` cookie. On each request,
the server looks up the session by that ID.

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server
    participant D as Session Store

    B->>S: POST /login (credentials)
    S->>D: Create session, store user id
    D-->>S: session_id = "abc123"
    S-->>B: Set-Cookie: session_id=abc123; HttpOnly; Secure
    B->>S: GET /dashboard (Cookie: session_id=abc123)
    S->>D: Look up session "abc123"
    D-->>S: { userId: 42 }
    S-->>B: Authorized response
```

Sessions are easy to revoke instantly (just delete the row) and keep no sensitive data
in the browser, but they require a shared, centralized store — which conflicts with pure
stateless horizontal scaling unless that store (e.g., Redis) is itself shared across all
instances, as you saw in Lecture 1.

### JWT-Based Authentication

A **JSON Web Token (JWT)** is a signed, self-contained token: it carries the user's
claims (id, role, expiry) directly inside itself, cryptographically signed by the server
so it can't be tampered with. The server validates the signature on each request without
needing to look anything up in a database.

```text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiIsInJvbGUiOiJhZG1pbiJ9.4a8f...signature
   ↑ header (algorithm)      ↑ payload (claims)              ↑ signature
```

JWTs are naturally stateless and scale horizontally with no shared store, but they are
harder to revoke early (a compromised token is valid until it expires, unless you add a
denylist — which reintroduces state) and, if stored insecurely, are a common XSS target.

!!! warning "Never store a JWT in `localStorage`"
    `localStorage` is readable by any JavaScript running on the page — including an
    attacker's script injected via XSS. Store tokens in an `httpOnly` cookie instead,
    which client-side JavaScript cannot read at all, dramatically reducing the impact of
    an XSS bug.

### Third-Party Providers (OAuth / OIDC)

Rather than handling passwords yourself at all, you can delegate authentication to a
**third-party provider** (Google, GitHub, Microsoft) using **OAuth 2.0** and **OpenID
Connect (OIDC)**. The user authenticates with the provider directly; your application
never sees their password, and receives a token proving their identity.

| Approach | State on server | Revocation | Best for |
|---|---|---|---|
| Session-based | Stateful (session store) | Instant | Apps that need instant logout/ban, single server or shared store |
| JWT-based | Stateless | Delayed (until expiry, unless denylisted) | Horizontally-scaled APIs, microservices |
| Third-party (OAuth/OIDC) | Delegated to provider | Depends on provider | Reducing password-handling liability, faster user onboarding |

In practice, most Next.js applications use a library that supports all three underneath
one API — which is exactly what Auth.js provides.

## NextAuth.js / Auth.js

**Auth.js** (the framework-agnostic successor to NextAuth.js, still commonly called
"NextAuth" for the Next.js integration) is the standard authentication library for
Next.js. It handles the OAuth handshake, session/JWT management, CSRF protection on the
auth endpoints, and cookie configuration for you.

### Installation and Configuration

```bash
npm install next-auth@beta
```

```tsx
// auth.ts (project root)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await verifyUserCredentials(credentials);
        return user ?? null; // returning null rejects the sign-in
      },
    }),
  ],
  session: { strategy: "jwt" }, // or "database" with an adapter
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role; // persist custom claims into the token
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string; // expose claims to the client
      return session;
    },
  },
});
```

```tsx
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

**Providers** define *how* a user proves their identity (GitHub OAuth, Google OAuth,
email/password via `Credentials`). **Callbacks** (`jwt`, `session`, `signIn`) let you
customize the token and session objects — most commonly to attach a role or permissions
list so you don't have to re-query the database on every request. **Adapters** connect
Auth.js to a database (Prisma, MongoDB, Drizzle) so sessions and user records can be
persisted rather than kept purely in a JWT:

```tsx
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const { handlers, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "database" }, // sessions now live in MongoDB
  // ...providers, callbacks
});
```

### Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js App
    participant NA as Auth.js
    participant P as OAuth Provider (GitHub)

    U->>App: Click "Sign in with GitHub"
    App->>NA: signIn("github")
    NA->>P: Redirect to GitHub authorization page
    U->>P: Approve access
    P-->>NA: Redirect back with authorization code
    NA->>P: Exchange code for access token
    P-->>NA: Access token + user profile
    NA->>NA: Create session / sign JWT
    NA-->>App: Set-Cookie (session token)
    App-->>U: Redirect to dashboard, now authenticated
```

### Reading the Session

```tsx
// Server Component
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return <p>Please sign in.</p>;
  return <p>Welcome, {session.user.name}</p>;
}
```

```tsx
// Client Component — needs the SessionProvider from next-auth/react in providers.tsx
"use client";
import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return <span>…</span>;
  if (!session) return null;
  return <button onClick={() => signOut()}>Sign out ({session.user.email})</button>;
}
```

## Protecting Pages, Layouts, Route Handlers, and Server Actions

Every layer of a Next.js application that can be reached directly needs its own check —
protecting a page's UI does **not** protect the Route Handler or Server Action it calls,
since those can be invoked independently.

```tsx
// Protecting a Server Component page
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <SettingsForm user={session.user} />;
}
```

```tsx
// Protecting a whole route group with a shared layout
// app/(protected)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  return <>{children}</>;
}
```

```tsx
// Protecting a Route Handler
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getPrivateData(session.user.id));
}
```

```tsx
// Protecting a Server Action — never trust the client to only call this when signed in
"use server";
import { auth } from "@/auth";

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "admin") throw new Error("Forbidden");
  await db.post.delete({ where: { id: postId } });
}
```

!!! warning "Client-side checks are UX, not security"
    Hiding a "Delete" button for non-admins in the UI is good user experience, but it
    stops nothing — anyone can call your Server Action or Route Handler directly with
    a tool like `curl`. **Every** Server Action and Route Handler must independently
    verify the session and role; never rely solely on a page-level or component-level
    check.

### Middleware-Based Route Protection

**Middleware** runs before a request reaches any route, making it the right place to
enforce authentication for whole sections of a site in one place, and to redirect
unauthenticated users before any page code runs.

```tsx
// middleware.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### Role-Based UI Rendering

Once a role is attached to the session (via the `jwt`/`session` callbacks shown above),
render conditionally on it — while still enforcing the same check server-side wherever
the underlying action happens:

```tsx
export default async function AdminPanelLink() {
  const session = await auth();
  if (session?.user.role !== "admin") return null;
  return <Link href="/admin">Admin Panel</Link>;
}
```

## Environment Variables: Server-Only Secrets vs. `NEXT_PUBLIC_`

Next.js draws a hard line between two kinds of environment variables, and confusing them
is one of the most common security mistakes in a Next.js codebase.

| Prefix | Bundled into client JS? | Use for |
|---|---|---|
| *(none)* — e.g. `DATABASE_URL`, `AUTH_GITHUB_SECRET` | No — server-only | Database credentials, API secrets, signing keys |
| `NEXT_PUBLIC_*` — e.g. `NEXT_PUBLIC_ANALYTICS_ID` | **Yes** — inlined into the browser bundle at build time | Values that are genuinely safe for anyone to read: a public analytics ID, a public API base URL |

!!! warning "`NEXT_PUBLIC_` variables are not secret, ever"
    Anything prefixed `NEXT_PUBLIC_` is embedded directly into the JavaScript shipped to
    every visitor's browser and is trivially readable via browser devtools. Never put an
    API secret, database URL, or signing key behind that prefix — if it must stay secret,
    it must have no `NEXT_PUBLIC_` prefix and must only be read inside Server Components,
    Route Handlers, Server Actions, or `middleware.ts`.

```bash
# .env.local — never commit this file
DATABASE_URL=postgres://user:pass@host/db      # server-only, safe
AUTH_SECRET=super-long-random-string           # server-only, safe
NEXT_PUBLIC_APP_NAME=MyApp                     # bundled to the client — fine, not secret
```

## XSS, CSRF, CORS, and Secure Headers

**Cross-Site Scripting (XSS)** is an attack where an attacker gets their own JavaScript
to run inside your page — typically by injecting it through unsanitized user input that
gets rendered as HTML. React escapes text content by default, so `{userInput}` is safe,
but `dangerouslySetInnerHTML` bypasses that protection entirely:

```tsx
// Dangerous unless html has been through a sanitizer (e.g. DOMPurify)
<div dangerouslySetInnerHTML={{ __html: userSuppliedHtml }} />
```

**Cross-Site Request Forgery (CSRF)** tricks a logged-in user's browser into submitting
an unwanted request to your site (e.g., an `<img>` or hidden form on an attacker's page
that POSTs to your `/api/transfer-funds`), relying on the browser automatically attaching
the session cookie. Auth.js's built-in endpoints already include CSRF tokens; for your
own state-changing Route Handlers, defend with `SameSite` cookies and by checking the
request's origin:

```tsx
// A cookie set with SameSite=Lax/Strict is not sent on cross-site form submissions
// next-auth sets this automatically for its session cookie; do the same for your own:
response.cookies.set("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
});
```

**Cross-Origin Resource Sharing (CORS)** governs which *other* origins are allowed to
call your API from browser JavaScript. By default, browsers block cross-origin requests;
you opt specific origins in explicitly, rather than opening everything:

```tsx
// app/api/public-data/route.ts
export async function GET() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://trusted-partner.com",
    },
  });
}
```

!!! warning "Never set `Access-Control-Allow-Origin: *` on an authenticated endpoint"
    A wildcard CORS origin combined with credentialed requests (cookies) lets **any**
    website read responses from your authenticated API on a logged-in user's behalf.
    Wildcards are only acceptable for genuinely public, unauthenticated endpoints.

Finally, **secure headers** reduce the blast radius of the vulnerabilities above. Set
them centrally in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" }, // blocks clickjacking via <iframe>
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};
```

## Try It Yourself

1. Set up Auth.js with the GitHub provider and a `Credentials` provider side by side.
   Add a `role` claim via the `jwt`/`session` callbacks, then build a `/dashboard` page
   restricted to signed-in users and an `/admin` link visible only to `role === "admin"`.
2. Add `middleware.ts` that redirects unauthenticated visitors away from `/dashboard/*`
   to `/login?callbackUrl=...`, and write a Server Action that independently re-checks
   the session — demonstrate (by calling it directly, bypassing the UI) that it still
   rejects an unauthenticated caller.

## Key Takeaways

- **Session-based** auth is stateful and instantly revocable; **JWT-based** auth is
  stateless and scales horizontally but is harder to revoke early; **OAuth/OIDC**
  providers delegate password handling to a trusted third party.
- **Auth.js** (NextAuth.js) wraps all three behind one API: **providers** define how
  users sign in, **callbacks** customize the token/session, **adapters** persist
  sessions/users to a database.
- Protect **every layer independently** — pages, layouts, Route Handlers, and Server
  Actions each need their own session/role check; a hidden button is not a security
  control.
- **Middleware** is the right place to enforce route-level authentication and redirect
  unauthenticated users before any page code runs.
- Only `NEXT_PUBLIC_`-prefixed environment variables are ever sent to the browser —
  never prefix a secret with it.
- Defend against **XSS** by avoiding `dangerouslySetInnerHTML` with unsanitized input,
  **CSRF** with `SameSite` cookies and origin checks, and **CORS** by allow-listing
  specific origins rather than using a wildcard on authenticated endpoints.
- Set security headers (`Content-Security-Policy`, `X-Frame-Options`,
  `X-Content-Type-Options`) centrally in `next.config.js`.
