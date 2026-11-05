---
title: "Appendix B. Troubleshooting"
tags:
  - Troubleshooting
  - Reference
---

# Appendix B. Troubleshooting

Start with the tree, then look up the symptom.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/troubleshooting-tree.svg"
</div>

## General method

1. **Read the first error**, not the last. Later errors are usually consequences.
2. **Reproduce it yourself** in a normal terminal, outside the agent, so you see all of the output.
3. **Shrink the problem**: run one half, one test, one command.
4. **Change one thing at a time.**
5. **Tell the agent exactly what you saw** — the command, the full error, what you expected.

## Installation and startup

| Symptom | Likely cause | What to try |
|---|---|---|
| `claude: command not found` | Install folder not on `PATH` | Open a new terminal; re-check the installer's last message |
| Login loop or auth error | Expired or wrong account | Sign out and in again; confirm the account/plan |
| Interactive installer "hangs" inside Claude | The program waits for keyboard input | Run it in your own terminal, not through the agent |
| Server runs but client does not start, silently | Stale process, busy port, or terminal issue | Run each half in your own terminal; check the port; restart cleanly |
| `EADDRINUSE` | Port already used | Stop the old process or change `PORT` |

## While working with the agent

| Symptom | Likely cause | What to try |
|---|---|---|
| Answers get worse or forgetful | Context is full or cluttered | `/context`, then `/compact` or `/clear` and restate the task |
| It ignores a convention | Not in `CLAUDE.md`, or file too long | Add one concrete line; trim the file |
| It edits files you did not expect | Prompt too broad | Use plan mode; name the files; say "do not touch anything else" |
| Costs climb quickly | Long sessions, big outputs, many tools | `/cost`; clear between tasks; use a smaller model for easy work |
| Constant permission prompts | No rules written down | Add allow rules for read-only commands ([chapter 9](09-permissions-and-hooks.md)) |
| A tool or MCP server is missing | Not configured, or failed to start | `/mcp`; run the server command yourself and read its error |
| Hook seems to do nothing | Wrong matcher or command fails silently | Run the hook command by hand; check the matcher text |
| It "fixes" a failing test by editing the test | Pressure to go green | Say so in `CLAUDE.md`; review test diffs separately |

## Tests

| Symptom | Likely cause | What to try |
|---|---|---|
| Test passes alone, fails in a suite | Shared state between tests | Isolate data per test; use random ports and temp files |
| E2E test fails randomly | Timing assumptions | Wait for a visible condition, never a fixed sleep |
| E2E test locks itself out | Rate limiting active in tests | Disable it outside production via an env var |
| Tests touch real data | Wrong database/file | Use a throwaway database; deny access to real data files |
| `node --test test/` fails on Windows | Directory argument not supported | Run `node --test` with no argument |

## Authentication and security

| Symptom | Likely cause | What to try |
|---|---|---|
| Always `401` | Missing/incorrect header or key | Check `x-api-key`; check the key spec has no spaces |
| `403` where `404` expected | Authorization leaks existence | Return `404` for resources the user may not know about |
| Webhook always `401` | Signature computed over different bytes | Sign the **raw** request body, not re-serialised JSON |
| Rendered text shows `&lt;` | Escaped twice | Escape once, at the last moment before output |

## Deployment

| Symptom | Likely cause | What to try |
|---|---|---|
| Container exits immediately | Production config validation failed | Read the startup log; it lists every missing variable |
| Health check failing | Wrong port or host binding | Confirm the server listens on `PORT` |
| Works locally, not in CI | Hidden dependency on your machine | Run the same commands in a clean checkout |
| Site not updating after deploy | Cache or wrong branch | Hard refresh; check which branch/commit was published |

## When to start over

If you have spent more than a few attempts, **rewind to the last checkpoint** or `git restore` the files, `/clear`, and give the agent a better prompt informed by what you learned. A clean restart with a good prompt is almost always faster than a tenth patch on a confused session.
