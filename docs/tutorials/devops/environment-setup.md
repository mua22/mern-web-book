---
title: "Tutorial: MERN Environment Setup"
tags:
  - Environment Setup
  - VS Code
  - Node.js
  - npm
  - nodemon
  - MongoDB
  - Git
---

# MERN Environment Setup: From a Blank Computer to Ready-to-Code

Before you write a single line of this course's code, you need a small set of tools
installed and working together. This tutorial assumes you have never installed a
developer tool before, and walks through every piece you'll need for the MERN stack: a
code editor, Node.js and npm, nodemon, MongoDB, and Git. By the end, you'll have a
complete, verified setup and know exactly what each piece is for.

If a step ever silently "doesn't work," the most common cause is skipping a restart of
your terminal (or your whole computer) after an installer finishes — several tools below
only become available on your system's `PATH` after that.

## In This Tutorial

- Install Visual Studio Code and the extensions you'll actually use in this course
- Install Node.js and npm, and understand what each one does
- Install and use nodemon to auto-restart your server while you develop
- Set up MongoDB — either in the cloud (Atlas) or locally — and a way to browse your data
- Install Git and GitHub Desktop (the *how to use them* part is a separate tutorial)
- Run a final checklist to confirm every tool is correctly installed

---

## Part 1: A Code Editor — Visual Studio Code

### What Is a Code Editor, and Why VS Code?

A **code editor** is the application you'll spend most of your time in — it's like a word
processor, but built for writing code: syntax highlighting (color-coded keywords), error
detection, a built-in terminal, and thousands of optional add-ons called **extensions**.
**Visual Studio Code** (VS Code) is free, made by Microsoft, and by far the most widely
used editor for web development — most tutorials, including this book, assume you're
using it.

### Installing VS Code

1. Go to [code.visualstudio.com](https://code.visualstudio.com/) and click the download
   button for your operating system (Windows, macOS, or Linux).
2. Run the installer. On Windows, make sure **"Add to PATH"** is checked during
   installation (it is checked by default) — this lets you type `code` in a terminal to
   open VS Code directly.
3. Launch VS Code once to confirm it opens.

### Opening a Project Folder

In VS Code, you almost always work with a **folder** (your project), not individual
files. Use **File > Open Folder** and pick (or create) an empty folder for a project —
you'll do this for every project in this course.

### Essential Extensions

Open the **Extensions** panel (the four-squares icon on the left sidebar, or
`Ctrl+Shift+X` / `Cmd+Shift+X`), search for each name below, and click **Install**.

| Extension | Why you need it |
|---|---|
| [Prettier – Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) | Automatically reformats your code (indentation, quotes, spacing) to a consistent style every time you save |
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) | Underlines JavaScript mistakes and bad practices as you type, before you even run the code |
| [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) | Right-click any HTML file and "Open with Live Server" — auto-refreshes your browser every time you save, for plain HTML/CSS/JS pages |
| [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) | Shows who changed each line and when, right inside the editor; a richer view of Git history than the command line |
| [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag) | Renaming an opening HTML/JSX tag (e.g. `<div>` to `<section>`) automatically renames its matching closing tag |
| [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense) | Autocompletes file paths as you type `import`/`src`/`href` values, so you stop mistyping filenames |
| [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) | Autocomplete, linting, and hover previews for Tailwind utility classes (used later in Module 4) |
| [MongoDB for VS Code](https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode) | Connect to your MongoDB database and browse/query your data without leaving the editor |
| [Thunder Client](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client) | A lightweight, built-in alternative to Postman for testing the REST APIs you'll build later in this course |
| [DotENV](https://marketplace.visualstudio.com/items?itemName=mikestead.dotenv) | Adds proper syntax highlighting for `.env` files (used to store secrets/config, covered in later lectures) |
| [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) | Catches typos in your variable names, strings, and comments |
| [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme) | Purely cosmetic — gives each file type a distinct icon in the sidebar, making projects easier to scan visually |

!!! tip "You don't need all of these on day one"
    Prettier, ESLint, and Live Server are worth installing immediately since you'll use
    them from Lecture 1. The rest (Tailwind IntelliSense, MongoDB for VS Code, Thunder
    Client, DotENV) are only useful once you reach the topic they support — it's fine to
    install them later, when you actually need them.

### A Few Editor Settings Worth Turning On

Open Settings (`Ctrl+,` / `Cmd+,`), use the search box, and enable:

- **Format On Save** (search "format on save") — automatically runs Prettier every time
  you save a file, so you never have to format manually.
- **Editor: Default Formatter** — set this to "Prettier - Code formatter" so VS Code
  knows which extension to use for formatting.

---

## Part 2: Node.js and npm

### What Are Node.js and npm?

**Node.js** is a runtime that lets you run JavaScript *outside* a browser — directly on
your computer, which is what makes it possible to write a whole web server in
JavaScript (you'll do this starting in Unit 5). **npm** (Node Package Manager) is
installed automatically alongside Node.js; it's how you download and manage the
thousands of free, reusable packages (like Express, Mongoose, and React) the rest of
this course depends on.

### Installing Node.js

1. Go to [nodejs.org](https://nodejs.org/) and download the **LTS** (Long-Term Support)
   version — not "Current." LTS is the stable version recommended for almost everyone,
   including every project in this course.
2. Run the installer, accepting the defaults (this also installs npm automatically).
3. **Restart your terminal** (close and reopen it, or restart VS Code) so it picks up the
   new installation.

### Verifying the Install

Open a terminal (in VS Code: **Terminal > New Terminal**) and run:

```bash
node -v
npm -v
```

You should see version numbers printed (e.g. `v20.11.0` and `10.2.4`) — the exact numbers
don't matter much, but both commands must produce *some* version, not an error like
`command not found`.

!!! warning "\"node is not recognized\" or \"command not found\""
    This means Node wasn't added to your system's `PATH`. First, just restart your
    terminal — this fixes it most of the time. If it still fails, re-run the Node.js
    installer and make sure any "Add to PATH" option is checked, then restart your
    computer.

### A Note on Node Version Managers

If you ever need to switch between different Node.js versions for different projects,
tools like [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) or
[nvm-windows](https://github.com/coreybutler/nvm-windows) let you install and switch
between several versions. You do not need this for this course — a single LTS install is
enough — but it's worth knowing the tool exists for later.

---

## Part 3: nodemon

### What Is nodemon, and Why You Need It

Normally, running a Node.js server means typing `node app.js`, and every time you change
a file, you have to stop the server (`Ctrl+C`) and run that command again to see your
change. **nodemon** ("node monitor") watches your project's files and automatically
restarts the server for you the instant you save a change — a small tool that saves an
enormous number of manual restarts over a semester.

### Installing nodemon

You can install nodemon **globally** (available in any project, useful while you're
still learning):

```bash
npm install -g nodemon
nodemon -v
```

In a real project later in this course, you'll more often install it as a
**dev dependency** of that specific project instead (so everyone on a team uses the same
version):

```bash
npm install --save-dev nodemon
```

### Using nodemon

Instead of:

```bash
node app.js
```

run:

```bash
nodemon app.js
```

Leave that terminal running while you work — edit and save `app.js`, and you'll see
nodemon print a restart message and reload your server automatically. Later, when you
have a real `package.json`, you'll typically wire this up as a script:

```json
{
  "scripts": {
    "dev": "nodemon app.js"
  }
}
```

so you can just run `npm run dev`.

---

## Part 4: MongoDB

### What Is MongoDB?

**MongoDB** is the database this course uses (the "M" in MERN) — a **NoSQL** database
that stores data as flexible, JSON-like documents rather than rigid spreadsheet-style
tables. You have two ways to get a MongoDB database to connect to: run one **in the
cloud** (no installation at all), or install one **locally** on your own machine. For a
first-time setup, the cloud option is genuinely easier and is what this tutorial
recommends.

### Option A: MongoDB Atlas (Cloud) — Recommended for Beginners

[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) is MongoDB's official
free, hosted database service.

1. Go to the link above and create a free account.
2. Create a new **Project**, then click **Build a Database** and choose the **M0 (Free)**
   tier. Pick any cloud provider/region close to you and click **Create**.
3. Under **Security > Database Access**, create a database user with a username and
   password (write these down — you'll need them in the connection string).
4. Under **Security > Network Access**, click **Add IP Address**, then
   **Allow Access from Anywhere** (`0.0.0.0/0`). This is fine for a student/learning
   project; a real production app would restrict this to specific known IP addresses.
5. Go back to your cluster, click **Connect > Drivers**, and copy the connection string —
   it looks like `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`.
   Replace `<username>`/`<password>` with the database user you created in step 3.

Keep that connection string somewhere safe — you'll use it with Mongoose starting in
Lecture 22 to connect your Node.js application to this database.

!!! danger "Never commit a connection string to Git"
    A connection string contains a real username and password. Always store it in a
    `.env` file (which you'll learn to keep out of Git via `.gitignore`) — never paste it
    directly into a source file that gets committed and pushed to a public repository.

### Option B: Installing MongoDB Locally

If you'd rather run MongoDB on your own machine (useful for working fully offline):

=== "Windows"

    1. Download the **MongoDB Community Server** MSI installer from
       [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).
    2. Run it, choosing **Complete** setup, and leave **"Install MongoDB as a Service"**
       checked — this makes MongoDB start automatically in the background whenever you
       turn on your computer, so you don't have to start it manually.
    3. It will be reachable at `mongodb://localhost:27017` once installed.

=== "macOS"

    Using [Homebrew](https://brew.sh/):

    ```bash
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
    ```

    This also runs MongoDB as a background service at `mongodb://localhost:27017`.

Verify a local install with the MongoDB Shell:

```bash
mongosh
```

If it connects and shows a `test>` prompt, MongoDB is running. Type `exit` to leave.

### MongoDB Compass and the VS Code Extension

Whichever option you chose, you'll want a way to actually *see* your data, not just
query it blindly. [MongoDB Compass](https://www.mongodb.com/try/download/compass) is
MongoDB's official free GUI — install it and paste in your connection string (Atlas) or
`mongodb://localhost:27017` (local) to browse your databases, collections, and documents
visually. The **MongoDB for VS Code** extension from Part 1 does the same thing without
leaving your editor.

---

## Part 5: Git and GitHub Desktop

Version control is essential from day one — every assignment and project in this course
should be tracked in Git and pushed to GitHub.

### Installing Git

Download and install Git from [git-scm.com](https://git-scm.com/) (accept the installer
defaults). Verify it with:

```bash
git --version
```

### Installing GitHub Desktop

Download and install [GitHub Desktop](https://desktop.github.com/), then sign in with
your GitHub account (create a free account at [github.com](https://github.com) first, if
you don't have one).

### Learning to Use Them

Installing Git and GitHub Desktop is the last item on *this* checklist — actually
**using** them (making commits, branching, connecting to GitHub, and creating your first
repository step by step with GitHub Desktop) is covered in full in the
[Git and GitHub tutorial](git-and-github.md). Read that next.

---

## Verify Your Full Setup

Run each command below in a terminal. If every one prints a version number (not an
error), your environment is ready for this course.

| Tool | Command | 
|---|---|
| Node.js | `node -v` |
| npm | `npm -v` |
| nodemon | `nodemon -v` |
| Git | `git --version` |
| MongoDB (local only) | `mongosh --version` |

For MongoDB Atlas (cloud) users: instead of a command, confirm you can log in to
[cloud.mongodb.com](https://cloud.mongodb.com/) and see your cluster listed as active.

## Try It Yourself

1. Create a new empty folder and open it in VS Code. Create a file called `app.js`
   containing a single line: `console.log("Environment ready!");`. Open a VS Code
   terminal and run it with `node app.js` — you should see the message printed.
2. Install nodemon in that same folder as a dev dependency
   (`npm init -y` first, to create a `package.json`, then
   `npm install --save-dev nodemon`). Run `npx nodemon app.js`, then edit and save
   `app.js` while it's running — watch nodemon detect the change and restart on its own.
3. Open MongoDB Compass (or the MongoDB VS Code extension) and connect to your database
   (Atlas or local). You won't have any real data yet — just confirm the connection
   succeeds.

## Key Takeaways

- **VS Code** is the editor this course uses; a handful of extensions (Prettier, ESLint,
  Live Server to start) make everyday work noticeably smoother.
- **Node.js** runs JavaScript outside the browser; **npm** comes bundled with it and
  manages the packages this course's projects depend on.
- **nodemon** auto-restarts your server on file changes, so you stop manually stopping
  and restarting it yourself during development.
- **MongoDB** can be a free cloud database via **Atlas** (no local install, recommended
  for getting started fast) or installed **locally**; either way, **Compass** or the
  MongoDB VS Code extension lets you see your data.
- **Git** and **GitHub Desktop** just need to be installed here — the
  [Git and GitHub tutorial](git-and-github.md) covers how to actually use them, including
  a full step-by-step first-repository, commit, and push walkthrough.
