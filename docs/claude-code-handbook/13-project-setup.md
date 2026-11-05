---
title: "13. Setting Up the Project"
tags:
  - Setup
  - Configuration
  - Database
  - Notifications
---

# 13. Setting Up the Project

!!! abstract "Video map"
    Covers Section 3, lessons 3.7–3.10: setting up the project, setting up the database (PostgreSQL), setting up the ORM (Prisma), and push notifications when Claude needs you.

Phase 0 of any plan is **the boring foundation**: folders, configuration, a database, a health check, version control. It is the best place to practise a habit that pays off all project long — *let the agent do the typing, but decide the structure yourself and verify the result runs.*

## The setup checklist

| Step | Done when |
|---|---|
| Repository + `.gitignore` | `git status` shows no secrets or generated files |
| Folder layout | You can explain every top-level folder |
| `CLAUDE.md` | Commands, layout and rules are written down ([chapter 4](04-project-memory.md)) |
| Configuration | One module reads the environment, validates it, fails fast |
| Data layer | Behind an interface you can swap |
| Health check | `GET /health` returns `ok` |
| First test | `npm test` runs and passes |

## Configuration: read once, fail fast

Almost every deployment problem is a configuration problem, so give it one home. Shelf's whole configuration lives in a single file:

```js title="src/config.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/config.js"
```

Three ideas to copy into any project:

1. **One place reads `process.env`.** Everything else receives a plain `cfg` object. That makes the rest of the code easy to test — pass any config you like.
2. **Collect *all* errors, then throw once.** Fixing one error per restart is miserable. Run it and you see:

    ```text
    Invalid configuration:
     - SHELF_KEYS is required in production
     - EMAIL_WEBHOOK_SECRET is required in production
    ```

3. **Be strictest in production.** An open API is fine on your laptop and a disaster online, so production refuses to start without keys and a webhook secret. The behaviour is covered by tests in `test/features.test.js`.

### `.env.example`, never `.env`

Real secrets live in a file you do not commit. What you *do* commit is a template that documents every variable:

```text title=".env.example"
--8<-- "docs/claude-code-handbook/examples/shelf/.env.example:1:11"
```

!!! danger "Secrets and AI tools"
    Never paste real keys into a prompt, a `CLAUDE.md`, or a file the agent might read and quote back. Shelf's own settings file *denies* reading `data.json` for the same reason. Treat anything the agent reads as something that may appear in a transcript. If a key ever leaks, **rotate it** — deleting the message does not help.

## The data layer: databases and ORMs

The video project sets up **PostgreSQL** (a relational database) and **Prisma** (an ORM — a library that maps database tables to objects and keeps the schema in code). The workflow is worth understanding even though Shelf uses a file:

1. Run the database (locally, usually in a container).
2. Describe your tables in a **schema file**.
3. Generate a **migration** — a versioned SQL change — and apply it.
4. Use the generated client in your code instead of hand-written SQL.

```text
Prompt that works well here:
"Set up PostgreSQL via Docker Compose and Prisma. Create a schema for
the models in project/requirements.md. Generate the first migration.
Show me the schema and the migration SQL before applying anything."
```

The last sentence matters: schema and migration changes affect data, so **review before you run.**

### What Shelf does instead — and why it still teaches the lesson

Shelf keeps books in a JSON file, but behind a small interface (`list`, `get`, `create`, `update`, `remove`, `stats`). Everything else in the app talks to that interface only. The day you need a real database you write one new class and the rest of the app, and its tests, do not change.

!!! tip "The seam is the skill"
    Whether the box behind the interface is a file, SQLite or PostgreSQL is a detail. The valuable decision is *drawing the line* so that detail can change. Ask the agent: "Which parts of my code know how data is stored? Can we reduce that to one module?"

### Database safety rules for agent-assisted work

- Point development at a **throwaway** database, never production.
- Review every migration; prefer additive changes (add a column) over destructive ones (drop a column).
- Add destructive commands to your permission **deny** list ([chapter 9](09-permissions-and-hooks.md)).
- Keep seed data in a script, so a broken database is a two-minute reset.

## Push notifications: let Claude tap your shoulder

Long tasks make you wander off. The video shows setting up a phone notification for when Claude finishes or needs an answer. The mechanism is a **hook** on the `Notification` event, which fires when Claude is waiting for you:

```json title=".claude/settings.json (excerpt)"
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          { "type": "command", "command": "node scripts/notify.js \"Claude needs you\"" }
        ]
      }
    ]
  }
}
```

What `scripts/notify.js` does is up to you: a desktop notification, a message to a chat channel, or a push through a service like ntfy. Two cautions:

- A notification script that sends text to an **external service** sends whatever you give it. Send a fixed message like the one above, not the contents of the conversation.
- Keep the hook fast and quiet — a hook that fails or hangs gets in your way. See [chapter 9](09-permissions-and-hooks.md#hooks) for the hook lifecycle.

## The first verified run

Setup is not finished when files exist; it is finished when you have *seen it run.*

```bash
npm test                      # all green
node src/server.js            # "Shelf API on http://localhost:3000"
curl localhost:3000/health    # {"status":"ok"}
```

Then commit. From here on, every phase ends the same way.

## Common mistakes

- **Letting the agent invent a folder structure you cannot explain.** Decide it, write it in `CLAUDE.md`, and it will follow it.
- **Reading environment variables all over the code.** One module, then pass config in.
- **Committing `.env`.** Add it to `.gitignore` in the very first commit.
- **Running migrations without reading them.**

## Check yourself

- [ ] I can explain why configuration is validated at startup and not when first used.
- [ ] My project has a committed `.env.example` and an ignored `.env`.
- [ ] I can describe schema → migration → client for an ORM.
- [ ] I know which hook event triggers a "Claude needs you" notification.
- [ ] I have seen my project start, pass its tests, and answer a health check.
