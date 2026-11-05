---
name: add-endpoint
description: Add a new REST endpoint to the Shelf API following project conventions. Use when the user asks for a new route, query parameter, or resource action.
---

# Add an endpoint to Shelf

Follow these steps in order. Stop and report if a step fails.

1. **Clarify** the route, method, request shape, and success/error status codes. If any is
   ambiguous, ask before coding.
2. **Write the test first** in `test/api.test.js` (happy path, validation failure, not-found).
   Run `npm test` and confirm the new test fails for the right reason.
3. **Business rules** go in `src/validate.js` (input rules) or `src/store.js` (data rules).
   `src/app.js` only parses the request and maps results to status codes.
4. **Implement** the smallest change that makes the test pass.
5. **Run `npm test`** — the whole suite must be green.
6. **Report**: files changed, the new route, and one example `curl` command.

Never add dependencies, and never edit existing tests to make them pass.
