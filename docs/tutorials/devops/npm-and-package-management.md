---
title: "Tutorial: npm and Package Management"
tags:
  - npm
  - Node.js
  - Package Management
  - DevOps
---

# npm and Package Management

Every real Node.js project — every Express API, every React app, every tool in this
course from here on — depends on code other people have already written: a web
framework, a template engine, a test runner. **npm** (Node Package Manager) is how you
install that code, track exactly which versions your project depends on, and give
anyone else who clones your repository a way to install the exact same thing. It comes
bundled with Node.js, so if you completed
[MERN Environment Setup](environment-setup.md), you already have it — this tutorial is
about actually understanding what it's doing, not just running commands you were told to
run.

**Prerequisites:** [MERN Environment Setup](environment-setup.md) (Node.js and npm
installed) and basic comfort with a terminal. No prior npm knowledge assumed.

## In This Tutorial

- What npm actually is, and the three things it manages: packages, versions, and scripts
- `package.json`: the one file that describes your entire project to npm
- Installing packages — regular dependencies vs. `devDependencies` vs. global installs
- Semantic versioning, and what `^` and `~` in a version number actually mean
- `package-lock.json`, and why it matters even though you never edit it by hand
- npm scripts: turning a long terminal command into `npm run dev`
- `npx`: running a package's command without installing it at all
- Updating, removing, and auditing packages safely

---

## Part 1: What npm Actually Manages

npm does three related but distinct jobs:

1. **Packages** — reusable code other people published, that your project can depend on
   (Express, nodemon, EJS, literally hundreds of thousands of others).
2. **Versions** — exactly which version of each package your project uses, and rules
   for which future versions are safe to upgrade to automatically.
3. **Scripts** — named shortcuts for commands you'd otherwise have to type, type, and
   type again (`npm run dev` instead of `node --watch server.js`, for example).

Everything in this tutorial is really just npm doing one of those three jobs.

## Part 2: `package.json` — Your Project's ID Card

Every npm-managed project has exactly one `package.json` file at its root. Create one
with:

```bash
mkdir my-npm-project
cd my-npm-project
npm init -y
```

`npm init` normally asks you a series of questions (package name, version, description,
entry point, license, ...) and writes your answers into `package.json`. The `-y` flag
skips every question and accepts the defaults — fine for following along here, but for a
real project, run `npm init` without `-y` at least once so you deliberately set the name
and description.

The result looks like this:

```json
{
  "name": "my-npm-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

A few fields worth knowing immediately:

- **`name`** and **`version`** — identify your package. If you never plan to publish
  this to npm's public registry, these barely matter beyond existing.
- **`main`** — the file `require("my-npm-project")` would load, if someone depended on
  this package. For an application (not a library) you're building yourself, you'll
  rarely touch this.
- **`scripts`** — named commands, covered fully in Part 6. This is the field you'll edit
  most.

!!! note "`package.json` is the source of truth; `node_modules` is not"
    `package.json` is small, text-based, and the file you commit to Git. The
    `node_modules` folder — where the actual installed code lives — can be hundreds of
    megabytes and is always regenerated from `package.json` (and `package-lock.json`,
    Part 5). Every Node project's `.gitignore` should contain a line that just says
    `node_modules`. Never commit it.

## Part 3: Installing Packages

### Regular dependencies

```bash
npm install express
```

This does three things: downloads `express` (and everything *it* depends on) into
`node_modules/`, and adds a line to `package.json` under `"dependencies"`:

```json
"dependencies": {
  "express": "^5.1.0"
}
```

`express` is now something your project needs to **run** — if you deployed this project
without it, your code calling `require("express")` would crash.

### Dev dependencies

Some packages are only useful while you're *developing* — a test runner, a linter, a
tool like `nodemon` that restarts your server on file changes. You'd never need them on
a real production server, only on your own machine. Flag these with `--save-dev` (or the
shorthand `-D`):

```bash
npm install -D nodemon
```

This lands under a separate `"devDependencies"` field instead:

```json
"devDependencies": {
  "nodemon": "^3.1.0"
}
```

The distinction matters once a project gets deployed: running `npm install
--omit=dev` in production installs only `dependencies`, skipping every dev tool that
server will never use.

### Global installs

```bash
npm install -g <package>
```

A global install puts a package somewhere on your system `PATH` instead of inside one
project's `node_modules` — useful for command-line *tools* you want available
everywhere (like `nodemon` itself, before `npx` — Part 7 — made global tool installs
mostly unnecessary). Global installs are **not** tracked in any project's
`package.json`, which is exactly why relying on them is risky: a teammate who clones
your repository has no way to know a global install was ever required.

!!! warning "Prefer local installs almost always"
    If a package is something your *code* needs (`require`d anywhere), it belongs in
    `dependencies` or `devDependencies` — a local, per-project install that
    `package.json` records and anyone else can reproduce with one command
    (`npm install`, no arguments). Reach for a global install only for a handful of
    general-purpose CLI tools you personally want everywhere, and even then, `npx`
    (Part 7) is usually the better choice.

## Part 4: Semantic Versioning

Package versions follow **semantic versioning** (semver): `MAJOR.MINOR.PATCH`, e.g.
`5.1.0`.

- **MAJOR** — incremented for breaking changes. Upgrading safely requires reading what
  changed.
- **MINOR** — incremented for new features that don't break existing code.
- **PATCH** — incremented for bug fixes that don't change behavior anyone relies on.

The symbol npm writes in front of a version in `package.json` controls which future
versions `npm install` (run later, with no package name) is allowed to pick:

| Prefix | Example | Means |
|---|---|---|
| `^` (default) | `^5.1.0` | Any `5.x.x` — MINOR and PATCH upgrades allowed, MAJOR locked |
| `~` | `~5.1.0` | Any `5.1.x` — only PATCH upgrades allowed |
| none | `5.1.0` | That exact version, nothing else |

`^` is npm's default for a reason — it's usually safe to accept new features and bug
fixes automatically, since semver *promises* a MINOR/PATCH bump never breaks your code.
That promise is only as good as the package author's discipline, though, which is
exactly why `package-lock.json` (next) exists as a safety net.

## Part 5: `package-lock.json`

`^5.1.0` is a *range*, not one specific version — which means two different installs, on
two different days, could resolve to two different actual versions (`5.1.0` today,
`5.3.2` next month), even with an identical `package.json`. That's a real problem: you
want "it works on my machine" to mean "it works on every machine."

`package-lock.json` solves this by recording the **exact** version of every package
(including every package *those* packages depend on, all the way down) that was actually
installed. It's generated automatically — you never hand-edit it — and:

- **Always commit it to Git.** It's the only thing guaranteeing a teammate's
  `npm install` produces the identical `node_modules` tree yours did.
- Running plain `npm install` respects the lock file and won't silently bump versions.
- Running `npm update` deliberately upgrades packages within their allowed range *and*
  updates the lock file to match.
- `npm ci` (short for "clean install") deletes `node_modules` and reinstalls strictly
  from the lock file, refusing to proceed if `package.json` and the lock file have
  drifted out of sync. This is what you want in CI pipelines and production deploys —
  predictable, not "whatever the ranges currently resolve to."

## Part 6: npm Scripts

The `"scripts"` field in `package.json` turns any terminal command into a short, memorable
name:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
}
```

Run any of them with `npm run <name>`:

```bash
npm run dev
```

Two names get a shortcut without the word `run`: `npm start` and `npm test` (but every
other script name still needs `npm run name`, e.g. `npm run dev`, not `npm dev`).

Scripts can also chain together with `pre`/`post` prefixes — npm automatically runs
`prebuild` before `build`, and `postbuild` right after it, with no extra wiring:

```json
"scripts": {
  "prebuild": "rimraf dist",
  "build": "webpack",
  "postbuild": "echo Build complete!"
}
```

!!! tip "Scripts can call packages that aren't installed globally"
    Inside a script string, npm automatically adds `node_modules/.bin` to the `PATH` —
    so `"dev": "nodemon server.js"` works even though `nodemon` was installed *locally*
    (Part 3), with nothing global required. This is the main reason local, per-project
    tool installs are almost always the right call.

## Part 7: `npx` — Run a Package Without Installing It

Sometimes you want to run a package's command line tool exactly **once** — to scaffold a
new project, say — without permanently installing anything. `npx` downloads the package
temporarily (or uses it if already installed locally), runs it, and leaves nothing
behind:

```bash
npx create-react-app my-app
```

If `create-react-app` is already installed locally in the current project, `npx` uses
that copy instead of fetching anything. This is also why modern setup instructions favor
`npx` over `npm install -g` for one-off tools — no global clutter, and you're always
running a version you explicitly asked for, not whatever global version happened to be
installed six months ago.

## Part 8: Updating, Removing, and Auditing

```bash
npm outdated          # lists installed packages that have newer versions available
npm update             # upgrades packages within the ranges package.json allows
npm uninstall express  # removes a package, and deletes its line from package.json
npm audit               # checks installed packages against known security vulnerabilities
npm audit fix           # attempts to automatically upgrade to patched versions
```

`npm outdated` is worth running periodically on a real project — it's easy to forget a
dependency exists until something breaks. `npm audit` is worth running after *every*
`npm install`, since a brand-new vulnerability can be found in a package you installed
safely months ago.

## Try It Yourself

1. Run `npm init -y` in an empty folder, then open the resulting `package.json` and
   change `"main"` to `"app.js"` by hand — confirm npm doesn't complain; it's just a
   plain JSON file.
2. Install `express` as a regular dependency and `nodemon` as a dev dependency in the
   same project. Open `package.json` and confirm each landed under the correct field.
3. Add a `"dev"` script that runs `nodemon app.js`, then run it with `npm run dev`
   (create an empty `app.js` first so there's something to run).
4. Delete your `node_modules` folder entirely, then run `npm install` with no arguments
   and watch it get rebuilt from `package.json` and `package-lock.json` alone — proof
   that neither file ever needed `node_modules` to exist in the repository.
5. Run `npm outdated` in a project that's a few months old (or one of your course
   projects) and see what, if anything, has newer versions available.

## Key Takeaways

- npm manages three things: installed **packages**, the **versions** allowed for each,
  and named **scripts**.
- `package.json` is the file you commit and hand-edit; `node_modules` is always
  regenerated from it and never committed.
- `dependencies` are needed to run your code; `devDependencies` are only needed while
  developing it — the distinction matters once something gets deployed.
- `^1.2.3` allows MINOR/PATCH upgrades, `~1.2.3` allows only PATCH upgrades, and a bare
  `1.2.3` allows neither — `package-lock.json` then pins the *exact* version actually
  installed, so every machine gets the identical `node_modules` tree.
- `npm run <script-name>` runs anything defined under `"scripts"` in `package.json`
  (`start` and `test` drop the word `run`); scripts can use locally-installed tools
  directly, with no global install required.
- `npx <package>` runs a package's CLI once without installing it permanently — the
  modern default for one-off tools and project scaffolding.
