# Shelf — clarified requirements

These came from asking an AI to *interview* the scope document and then answering each question myself.
(The decisions are mine; the questions were the AI's.)

| # | Question the AI raised | Decision |
|---|---|---|
| 1 | What statuses exist? | `to-read`, `reading`, `done` — nothing else |
| 2 | Can any book have a rating? | **No.** Only `done` books; moving a book out of `done` drops the rating |
| 3 | Who are the users? | A closed system: keys are issued by an admin. **No public sign-up.** |
| 4 | Roles? | Exactly two: `member` (own books) and `admin` (read-only view of all books) |
| 5 | Can a user see another user's book by guessing an id? | **No.** Return `404`, never `403`, so ids do not leak |
| 6 | Error format for scripts? | JSON; `422` with an `errors` array of short messages for validation |
| 7 | How big can a list get? | Paginate: default 20, max 100, total in a response header |
| 8 | What happens when the AI is down? | Never fail the user's request: fall back and log |
| 9 | What happens if an inbound email is forged? | Reject unless the HMAC signature verifies |
| 10 | Data storage for v1? | A JSON file behind a `BookStore` interface — swap to a database later |

## Ticket-style statuses and fields

```text
Book { id, title, author, status, pages?, rating?, notes?, genre?, notesSummary?, owner, createdAt }
```

`genre` and `notesSummary` are written only by the AI job, never by the user.
