# Shelf — project memory for Claude

Shelf is a small reading-list REST API with a tiny web page. Node 20+, ES modules, **zero runtime dependencies**.

## Commands
- `npm test` — runs the whole suite (node:test). Run it after every change.
- `npm start` — API on :3000; configuration comes from environment variables (see `.env.example`)
- `npm run mcp` — stdio MCP server exposing the store as tools
- `node e2e/smoke.e2e.mjs` — browser end-to-end test (needs Playwright; not part of `npm test`)

## Layout
- `src/config.js` — the ONLY place that reads `process.env`; validates and fails fast
- `src/validate.js` — all input validation; return `{ ok, value | errors }`, never throw. Shared with the browser
- `src/store.js` — the only code that touches data; no HTTP knowledge; delete is a soft delete
- `src/auth.js` — API keys -> `{ owner, role }`; roles are `member` and `admin`
- `src/security.js` — escapeHtml, card rendering, CSP headers, RateLimiter
- `src/jobs.js` — in-process job queue (retry with backoff, dead-letter list)
- `src/ai.js` — AI helpers; the model call is injected as a function so tests never hit the network
- `src/mailer.js` — outbound mail interface, inbound webhook signature + parsing
- `src/app.js` — routing + HTTP mapping only; no business rules here
- `web/` — static client; `ui.js` is pure functions (unit-testable), `app.js` touches the DOM
- `test/` — one test file per area; API tests start the server on port 0
- `project/` — scope, requirements, MVP, tech-stack decisions, plan

## Conventions
- Status codes: 201 create, 204 delete, 400 malformed JSON, 401 no/unknown key, 403 wrong role, 404 missing OR not yours, 422 validation, 429 rate limited, 501 AI not configured
- Never return 403 for another user's book: return 404 so ids do not leak
- Validation errors are arrays of short human-readable strings
- Every dynamic value that becomes HTML goes through `escapeHtml`
- Business rules live in `validate.js` or `store.js`, never in `app.js`
- New behaviour needs a test first; do not change existing tests to make them pass
- AI output is untrusted: validate it and fall back to a safe default; never fail the user's request because the AI failed

## Subagents
- `reviewer` — read-only review of the current diff against these conventions
- `security-auditor` — fresh-eyes security audit (read-only)
- `e2e-writer` — writes and runs browser tests; use it for any E2E work

## Do not
- Add dependencies without asking
- Edit `data.json` (runtime data, git-ignored)
- Commit `.env` or anything that looks like a real key
