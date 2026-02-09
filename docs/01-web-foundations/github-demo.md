# 🌱 Introduction to Git & GitHub (Beginner Guide)

This chapter introduces the basics of **Git**, **GitHub**, and **GitHub Desktop**. You’ll learn how version control works and how to manage your code like a professional developer.

---

## 📌 What is Git?

**Git** is a **version control system**.  
It helps you track changes in your code over time.

### Why use Git?
- Save your work history
- Go back to older versions
- Work in teams without overwriting each other’s code

### Basic Git Commands

```bash
git init        # Start a new Git repository
git status      # Check file changes
git add .       # Stage all files
git commit -m "message"   # Save changes
```

---

## 🌐 What is GitHub?

**GitHub** is an online platform where you store your Git repositories.

### What GitHub is used for:
- Store your projects online
- Share code with others
- Collaborate in teams
- Showcase your portfolio

---

## 🖥️ What is GitHub Desktop?

**GitHub Desktop** is a graphical app that lets you use Git **without typing commands**.

With GitHub Desktop you can:
- Commit changes
- Push to GitHub
- Pull updates
- Create branches
- Resolve conflicts visually

---

## 🔄 Core Git Concepts

### ✅ Commit
A **commit** saves your changes with a message.

> Think of it as taking a snapshot of your code.

**In GitHub Desktop:**
1. Select files
2. Write a message
3. Click **Commit to main**

---

### ⬆️ Push
**Push** sends your local commits to GitHub (online).

**In GitHub Desktop:**  
Click **Push origin**

---

### ⬇️ Pull
**Pull** brings the latest changes from GitHub to your computer.

**In GitHub Desktop:**  
Click **Fetch origin → Pull**

---

### 🔍 Fetch
**Fetch** checks if new updates exist (without downloading them yet).

**In GitHub Desktop:**  
Click **Fetch origin**

---

## 🌿 Branching (Working on New Features Safely)

A **branch** is a separate version of your project.

Use branches to:
- Add features
- Fix bugs
- Experiment safely

### Common Branch Names
- `main` → main project
- `feature-login`
- `bug-fix-header`

### In GitHub Desktop:
1. Click **Current Branch**
2. Click **New Branch**
3. Name your branch
4. Click **Create Branch**

---

## 🔀 Merging Branches

When your feature is ready, you **merge** it into `main`.

**In GitHub Desktop:**
1. Switch to `main`
2. Click **Branch → Merge into Current Branch**
3. Select your feature branch

---

## 🧭 Typical Workflow (Using GitHub Desktop)

```text
1. Create / Open Repository
2. Make changes
3. Commit
4. Push to GitHub
5. Pull updates from others
6. Create branches for new features
```

---

## 🧠 Summary

| Tool / Term | Purpose |
|------------|--------|
| Git | Tracks code history |
| GitHub | Stores code online |
| GitHub Desktop | Easy Git interface |
| Commit | Save changes |
| Push | Upload to GitHub |
| Pull | Download updates |
| Fetch | Check for updates |
| Branch | Separate feature version |

---

## 🚀 Practice Task

1. Create a GitHub account  
2. Install GitHub Desktop  
3. Create a new repository  
4. Add a file: `index.html`  
5. Commit & Push  
6. Create a new branch and modify the file  
