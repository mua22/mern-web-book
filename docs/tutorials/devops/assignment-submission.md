---
title: "Tutorial: Submitting Coursework via GitHub"
tags:
  - Git
  - GitHub
  - Assignments
  - Submission
  - Course Workflow
---

# Submitting Assignments and Labs via GitHub

For this course, there is no separate upload portal. **Your GitHub repository *is* your
submission system.** You will create one repository at the start of the semester, do
every assignment, lab, and exam inside a specific folder in that repository, and
"submitting" simply means committing your work and pushing it to GitHub before the
deadline. This tutorial explains exactly how that works, so there's no ambiguity about
what counts as a valid, on-time submission.

This tutorial assumes you've already completed the
[MERN Environment Setup](environment-setup.md) and
[Git and GitHub](git-and-github.md) tutorials — it builds directly on the commit/push
workflow taught there.

## In This Tutorial

- Create the one repository you'll use for the entire semester
- Set up the exact folder structure your work is expected to live in
- Understand what actually counts as "submitting" something
- Keep practice/experimental work separate from graded work
- Make sure your repository is public and easy to identify
- Walk through a complete example submission, and a pre-submission checklist

---

## Part 1: Create Your Coursework Repository

Do this **once**, at the start of the semester — this same repository will hold every
assignment, lab, and exam you submit all term.

1. Go to [github.com](https://github.com), sign in, and click **New repository** (the
   green button, or the **+** menu in the top-right corner).
2. **Name it clearly.** Use a name that identifies you and the course at a glance, since
   your instructor will be looking at a long list of repository links from the whole
   class — for example `csc336-webtech-<your-roll-number>` or
   `<your-name>-web-technologies`.
3. **Set visibility to Public.** This is required — see the warning below.
4. Check **Add a README file**, then click **Create repository**.
5. Clone it to your computer (via GitHub Desktop's **Clone a repository from the
   Internet**, or `git clone <url>` from the terminal — see the
   [Git and GitHub tutorial](git-and-github.md#cloning-an-existing-repository) if you
   need a refresher).

!!! danger "Your repository must be Public, not Private"
    A **private** repository is only visible to you (and anyone you individually add as
    a collaborator). Your instructor will *not* be added as a collaborator to every
    student's repository — instead, everyone's repository must be **public**, so it can
    be opened and reviewed from just the link, by anyone, with no extra steps.

    If you accidentally created a private repository, fix it without starting over: on
    your repository's page, go to **Settings > General**, scroll to the **Danger Zone**,
    click **Change visibility**, and switch it to **Public**.

## Part 2: The Required Folder Structure

Inside your repository, create exactly these folders:

```text
your-repo/
├── assignment-1/
├── assignment-2/
├── assignment-3/
├── assignment-4/
├── lab-1/
├── lab-2/
├── lab-3/
├── lab-4/
├── midterm-lab-exam/
├── final-exam/
├── practice/
└── README.md
```

| Folder | What goes here |
|---|---|
| `assignment-1` through `assignment-4` | Each of the four graded assignments — only that assignment's files |
| `lab-1` through `lab-4` | Each of the four graded lab tasks — only that lab's files |
| `midterm-lab-exam` | Your midterm lab exam submission |
| `final-exam` | Your final exam submission |
| `practice` | Anything else — code-along exercises, experiments, half-finished ideas, things you're just trying out |

!!! warning "Practice work does not belong in a graded folder"
    Only put files inside `assignment-N`, `lab-N`, `midterm-lab-exam`, or `final-exam` if
    they are the actual, finished submission for that specific piece of work. Everything
    else — practice, drafts, unrelated experiments — goes in `practice/` instead. Mixing
    unrelated files into a graded folder makes it unclear what you actually intended to
    submit.

### Creating Empty Folders in Git

If you create all these folders on day one (recommended, so the structure is obvious
from the start), you'll notice something odd: Git does not track completely empty
folders — a folder with nothing in it simply won't show up after you commit and push.
The standard fix is to put a tiny placeholder file inside each empty folder, for example
a one-line `README.md`:

```bash
echo "# Assignment 1" > assignment-1/README.md
echo "# Assignment 2" > assignment-2/README.md
echo "# Lab 1" > lab-1/README.md
# ...and so on for every folder
```

Once you add real files to a folder later, you can leave that placeholder file in place
or delete it — either is fine.

## Part 3: What Counts as "Submitting"

There is no separate submit button. Your submission for a given assignment/lab/exam is
whatever files exist in that folder, in your **pushed** repository, at the deadline. Two
words matter enormously here:

- **Committed** means Git has recorded a snapshot on your computer.
- **Pushed** means that snapshot has actually been uploaded to GitHub.

A commit that only exists on your laptop is invisible to your instructor — **only what
has been pushed to GitHub counts.** Your usual workflow for each piece of work will be:

1. Do your work inside the correct folder (e.g. `assignment-2/`).
2. Stage and commit it with a clear message, e.g. `Submit Assignment 2`.
3. **Push** to GitHub.
4. Open your repository on github.com in a browser and confirm the files are actually
   there, inside the right folder, before you consider yourself done.

!!! tip "Push early, not at 11:59"
    GitHub records the exact time of every push, so a late push is a late submission —
    there's no ambiguity, but there's also no leniency for "my internet was slow." Push
    well before the deadline, not in the last few minutes. A slow connection, a GitHub
    outage, or a forgotten push are the most common ways students accidentally submit
    late even though they finished the work on time.

## Part 4: A Complete Example — Submitting Assignment 1

=== "Using GitHub Desktop"

    1. Open your coursework repository in GitHub Desktop (it should already be there if
       you cloned it in Part 1).
    2. Copy your finished files into the `assignment-1` folder using File Explorer /
       Finder, or save them there directly from your code editor.
    3. Switch to GitHub Desktop — the **Changes** tab will list every new/changed file
       inside `assignment-1`.
    4. Type a summary such as `Submit Assignment 1` in the box at the bottom-left, and
       click **Commit to main**.
    5. Click **Push origin** at the top.
    6. Open your repository on github.com, click into the `assignment-1` folder, and
       confirm your files are there.

=== "Using the command line"

    ```bash
    cd path/to/your-repo

    # copy or save your finished files into assignment-1/ first, then:
    git add assignment-1/
    git commit -m "Submit Assignment 1"
    git push
    ```

    Then open your repository on github.com, click into the `assignment-1` folder, and
    confirm your files are there.

You'll repeat this same pattern — work in the right folder, commit with a clear message,
push, verify on github.com — for every assignment, lab, and exam all semester.

## Part 5: Before You Submit — Checklist

Run through this every time, before a deadline:

- [ ] My repository's visibility is **Public** (check **Settings > General** if unsure).
- [ ] My files are inside the **correct folder** for this submission (not in `practice/`,
      not loose in the repository root).
- [ ] I haven't left unrelated practice/scratch files inside the graded folder.
- [ ] My commit message clearly describes what was submitted (e.g. `Submit Lab 3`, not
      `update` or `fix`).
- [ ] I actually **pushed** — I opened github.com in a browser and can see my files
      there, not just in GitHub Desktop or my local terminal.
- [ ] This all happened **before** the deadline, with time to spare.

!!! note "Submitting your repository link"
    Doing the work above keeps your repository itself up to date and correct at all
    times. Your instructor will separately let you know how and when to submit the link
    to your repository (for example, a form or a message) — that link only needs to be
    sent once, since the same repository is reused for the entire semester.

## Try It Yourself

1. Create your coursework repository now, following Part 1, and set it to Public.
2. Create all eleven folders from Part 2, each with a placeholder `README.md` so they
   appear in your repository, and push the result.
3. Open your repository on github.com in a browser and confirm you can see all eleven
   folders and the placeholder files inside each one.

## Key Takeaways

- One repository, created once, holds your entire semester's work — not a new repository
  per assignment.
- The repository **must be Public** so it can be reviewed from just the link.
- Work goes in a specific folder per assignment/lab/exam; anything else goes in
  `practice/`, never mixed into a graded folder.
- Submitting = **commit, then push** — a commit that was never pushed does not count, and
  GitHub's recorded push time is what determines whether you were on time.
- Always verify on github.com itself, in a browser, that your files actually made it —
  don't just trust your local editor or Git client.
