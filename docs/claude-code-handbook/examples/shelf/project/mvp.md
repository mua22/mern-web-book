# Shelf — MVP (version 1)

The rule: **the smallest version that solves the problem and that I can review and test properly.**
Time is limited, and every feature needs review, tests and maintenance even when code is cheap to generate.

## In version 1
- CRUD for books, with validation and the rating rule
- Search, filter, sort, pagination
- API-key authentication, two roles, private shelves
- Stats endpoint
- A minimal web page (add + list)
- Security basics: escaped output, rate limiting, signed webhooks
- Background job + AI genre/summary with safe fallback
- Add/finish a book by email
- Docker image, CI, health check

## Parked for later (not v1)
| Idea | Why parked |
|---|---|
| CSV import | Nice, but nobody is blocked without it |
| Public sharing | Needs a privacy model — a project of its own |
| Reminders | Needs scheduling infrastructure |
| Recommendations | Needs data we do not have yet |
| Mobile app | The web page and API cover v1 |
