---
title: "21. Shipping to Production"
tags:
  - Deployment
  - Docker
  - Monitoring
  - Production
---

# 21. Shipping to Production

!!! abstract "Video map"
    Covers Section 9, lessons 9.1–9.8: logging errors with Sentry, polishing the UI, preparing for production, dockerizing, deploying, seeding the production database, and configuring the email provider in production.

An application on your laptop is a draft. **Production** is where real people use it, errors cost something, and you cannot watch the terminal. This chapter is the list of things that change when you cross that line.

<div class="cu-svg-diagram" markdown>
--8<-- "docs/claude-code-handbook/diagrams/ci-cd.svg"
</div>

## 1. Know when something breaks: error tracking

In development an error goes to your console. In production nobody is watching the console, so you need a tool that **captures errors, groups duplicates, notifies you, and keeps enough detail to fix them.** The video uses Sentry (create a project, install the SDK on both server and client, set alert rules such as "notify me on a new high-priority issue" or "more than N occurrences per minute"), and verifies it the right way: **throw a deliberate error on purpose** (server and client), confirm it shows up in the dashboard, then remove the test endpoint.

Shelf has the same structure without a vendor: every unexpected error (5xx) is passed to one `onError` hook, and the client sees only a generic message. In `server.js` the hook prints one structured line; swapping it for an error tracker's capture call is a one-line change.

```js title="src/app.js"
--8<-- "docs/claude-code-handbook/examples/shelf/src/app.js:195:201"
```

```js title="test/features.test.js"
--8<-- "docs/claude-code-handbook/examples/shelf/test/features.test.js:353:373"
```

The test pins down three rules worth remembering:

- the **secret inside the error message never reaches the client**;
- the **5xx is reported** (with method and path);
- **4xx are not reported** — a mistyped URL is not an incident, and noisy alerts get ignored.

!!! tip "Test your alerting"
    An error tracker you have never seen fire is a guess. Trigger one deliberately before you rely on it.

## 2. Polish — with a skill, not a mood

Before shipping, the video gives the plain default theme a more distinctive look using a **front-end design skill** installed into the project (skills from [chapter 7](07-mcp-and-skills.md) in a practical role). Installing it is interactive, so it is done in a terminal of your own. Points to take from it:

- The result took 5–10 minutes because a *design* instruction replaced a hundred micro-decisions about colours and classes.
- Because the skill lives in the project, **everyone who works on it gets the same guidance.**
- Review the visual result in **both light and dark** themes and on a **narrow screen**; those are where polish usually fails.

Polish is a legitimate pre-launch step, but it comes **after** the features work and are tested.

## 3. One server, one port, one URL

In development the video has two processes: a front-end dev server (port 5173) and an API (port 3000). For production the plan changes: **build the front end into static files and have the API server serve them.** One server, one port, one address — fewer moving parts and simpler hosting. Shelf already works that way: a strict allow-list of static files is served by the same process as the API.

The prompt that starts this is short because of the context you gave it:

```text
Prepare this app for deployment to Railway. Serve the built client from
the Express server, add a production start script, run database migrations
on start, and list the manual steps I must do myself.
```

Naming the **platform** matters: the agent tailors ports, build commands and environment variables to it. And asking for "the manual steps I must do myself" turns invisible assumptions (create a database, set variables) into a checklist.

## 4. Production configuration

Production needs different settings from development, and mistakes here cause both outages and security holes. Shelf's `loadConfig` ([chapter 13](13-project-setup.md)) refuses to start in production without API keys and a webhook secret and prints **every** problem at once. A checklist to adapt:

- [ ] `NODE_ENV=production`
- [ ] Every secret is set in the platform's variables, **not in the repository**
- [ ] The public URL is configured with the right scheme (`https://`) — the video loses time to a login error ("invalid base URL") caused by a missing `https://` in one variable
- [ ] Allowed origins (CORS / trusted origins) match the real URL exactly
- [ ] The platform's **port** is respected (the video's first deploy fails to load until the service port is corrected)
- [ ] A **health check** endpoint exists

## 5. Docker: the same box everywhere

A **container image** packages your app with everything it needs; a container is one running copy. If it runs on your machine, the same image runs on any host. Shelf's `Dockerfile` is short because it has no dependencies to install:

```dockerfile title="Dockerfile"
--8<-- "docs/claude-code-handbook/examples/shelf/Dockerfile"
```

What to notice:

- **Small base image** (`alpine`) — faster to build and ship.
- **Runs as an unprivileged user** — if the app is compromised, the attacker is not root.
- **Only the needed folders are copied** (`src`, `web`), and a `.dockerignore` keeps tests, secrets and junk out of the image.
- **A volume** for data, so the container itself stays disposable.
- **A `HEALTHCHECK`** the platform can use to decide whether the container is ready.

Build and run it locally before deploying; that is the cheapest rehearsal of production:

```bash
docker build -t shelf .
docker run --rm -p 3000:3000 -e SHELF_KEYS=dev:me:admin -e EMAIL_WEBHOOK_SECRET=dev-only shelf
curl localhost:3000/health
```

!!! note "An honest note about the example"
    The Shelf image is built and smoke-tested by the CI workflow in this book's repository (next section). The author's machine used to write this book did not have a running Docker daemon, so the commands above are the documented procedure, and the CI job is what proves them.

After verifying, stop the container and, if you are short on disk, remove the image — the video does exactly this.

## 6. Continuous integration

A CI workflow runs your tests on a clean machine on every push, so "works on my machine" stops being an excuse. Shelf's workflow tests on two Node versions, then builds the image and smoke-tests it:

```yaml title=".github/workflows/ci.yml"
--8<-- "docs/claude-code-handbook/examples/shelf/.github/workflows/ci.yml"
```

The smoke test passes throwaway values for the two settings production insists on — a nice demonstration that the fail-fast configuration is working.

## 7. Deploying

The video deploys to Railway: push the code to a GitHub repository, create a project, add a **PostgreSQL** service, add a **service from the repository**, copy every variable from `.env` into the platform's variables (taking the database URL from the database service), generate a public domain, and fix the port. The same sequence applies to most platforms:

| Step | Check |
|---|---|
| Code in a repository | The platform builds from it |
| Database provisioned | Connection string passed as a variable |
| Variables set | Nothing missing (the config validator will tell you) |
| Domain generated | Open it; `/health` answers |
| Logs open | You can see startup output |

### Seeding production

A fresh production database is empty — there is no admin to log in with. The video installs the platform's CLI, logs in, links the local folder to the project and service, and runs the seed command **against the production environment**. It fails first ("database not reachable") because the command used an internal address from outside, and the instructor has to use the platform's tooling to run it in the right place. Two cautions:

- **Be certain which environment a command targets** before pressing Enter. Add a banner such as "Seeding PRODUCTION…" to destructive scripts, and make seed scripts **idempotent** (check whether the admin already exists, as the video's script does).
- **Never put real admin credentials in the repository.** Read them from the platform's variables.

### Reconfigure external services for production

The email provider's *development* rule pointed at a tunnel. In production, delete it and create a new rule pointing to the **production URL** with the **production secret**. Then test with a real email, and look in the provider's activity log and in your inbox. The video notes the lack of a log of incoming messages as something a serious system must solve — plan for it.

## 8. After launch

- Watch the error tracker and the logs for the first day.
- Know how to **roll back**: redeploy the previous image or revert the commit.
- Keep a short **runbook**: how to deploy, restart, rotate a key, restore data.
- Back up the database, and **test a restore** once.

## Common mistakes

- **Shipping without error tracking.**
- **Different configuration between dev and prod** nobody wrote down.
- **A seed script that is not safe to run twice.**
- **Testing the deployment only in a browser.** Check the logs too.
- **Leaving the development webhook rule in place.**
- **No rollback plan.**

## Check yourself

- [ ] I triggered a deliberate error and saw it in my tracker (or my `onError` hook).
- [ ] I can explain why we serve the built front end from the API server in production.
- [ ] I read my Dockerfile line by line and can justify each line.
- [ ] My CI runs tests on a clean machine.
- [ ] I have a checklist for configuration, seeding, and reconfiguring external services.
