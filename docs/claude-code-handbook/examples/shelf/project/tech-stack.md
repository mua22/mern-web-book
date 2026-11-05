# Shelf — tech stack and decisions

| Concern | Choice | Why (and what I gave up) |
|---|---|---|
| Runtime | Node 20+ ES modules | Built-ins cover everything v1 needs |
| HTTP | `node:http` | Zero dependencies; ~150 lines. *Gave up:* middleware ecosystem — switch to a framework if routing grows |
| Validation | One hand-written `validateBook` shared by server and browser | A single source of truth. *Gave up:* schema-library features |
| Storage | JSON file behind `BookStore` | Simple and inspectable. *Gave up:* concurrency and scale — the interface lets us move to a database |
| Auth | **API keys** → `{owner, role}` | Fits scripts and an internal tool. *Gave up:* browser-friendly cookie sessions |
| Tests | `node:test` + one browser E2E | No framework to install; E2E only for the happy path |
| AI | Anthropic Messages API via an **injected function** | Tests never hit the network; the model is configurable |
| Email | Provider behind a `send()` interface + signed inbound webhook | Swap providers without touching routes |
| Packaging | Docker (node:22-alpine, non-root, healthcheck) | Same image locally and in production |
| CI | GitHub Actions | Tests on every push; image smoke test on `main` |

## Decision log
- **API keys vs. sessions vs. JWT:** keys were chosen because clients are scripts and an internal UI; a public browser app would warrant database sessions (revocable, cookie-based).
- **404 not 403 for other people's books:** do not reveal that an id exists.
- **No public registration:** accounts are provisioned (a key per person); this removes a whole class of abuse.
