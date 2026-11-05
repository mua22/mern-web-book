# Shelf — implementation plan

Order matters: later features depend on earlier ones. Each phase ends green (`npm test`) and committed.

| Phase | Deliver | Depends on |
|---|---|---|
| 0 | Project setup: layout, health check, config, `.env.example`, git, `CLAUDE.md` | — |
| 1 | Validation + store + CRUD routes + tests | 0 |
| 2 | Pagination, search, sort, stats | 1 |
| 3 | Authentication, owner scoping, roles | 1 |
| 4 | Security hardening: escaped HTML, rate limiting, body limits | 3 |
| 5 | Web page (shared validator) + E2E happy path | 1–4 |
| 6 | Background jobs + AI genre/summary with fallback | 1, 4 |
| 7 | Email: signed inbound webhook + outbound mailer | 1, 3 |
| 8 | Production: config validation, Docker, CI, deploy, smoke test | all |
| 9 | Claude in CI: `@claude` on issues → pull request | 8 |

## Notes from reviewing this plan
- I moved **security before the UI**: it is cheaper to design in than to retrofit.
- User management UI is *not* in v1 — keys are provisioned by an admin through config. If I never hire, I never need it.
- The plan is a living document: reorder it when business priorities change.
