---
title: Web Dev Book
---

<div class="wdb-hero">
  <h1>The Web Dev Book</h1>
  <p>
    A free, lecture-by-lecture online textbook built from the official COMSATS course plans
    for <strong>Web Technologies (CSC336)</strong> and
    <strong>Advanced Web Technologies (CSC337)</strong> — from your very first
    <code>&lt;h1&gt;</code> to shipping a production Next.js application on Vercel.
  </p>
</div>

<div class="wdb-grid">
  <div class="wdb-card">
    <span class="wdb-badge">CSC336 · SEMESTER 5</span>
    <h3>Web Technologies</h3>
    <p>
      Start here if you're new to web development. HTML, CSS, modern JavaScript, a
      server-side API with a database, and your first React app — 32 lectures, explained
      simply with plenty of examples.
    </p>
    <a class="wdb-card-link" href="web-technologies/" aria-label="Open Web Technologies (CSC336)"></a>
  </div>
  <div class="wdb-card">
    <span class="wdb-badge">CSC337 · SEMESTER 6</span>
    <h3>Advanced Web Technologies</h3>
    <p>
      For students who've completed CSC336. Enterprise architecture, API design,
      authentication and OWASP security, caching and scalability, and production-grade
      Next.js — 32 lectures.
    </p>
    <a class="wdb-card-link" href="advanced-web-technologies/" aria-label="Open Advanced Web Technologies (CSC337)"></a>
  </div>
</div>

## How this book is organized

Each course is split into **7 units** (matching the official course description form), and
every unit is a group of **lectures** — one chapter per lecture, exactly as taught in class.

```mermaid
flowchart LR
    A["CSC336<br/>Web Technologies"] --> A1["7 Units"] --> A2["32 Lecture Chapters"]
    B["CSC337<br/>Advanced Web Technologies"] --> B1["7 Units"] --> B2["32 Lecture Chapters"]
    A2 --> C["You, building real projects"]
    B2 --> C
```

Every chapter follows the same shape, so you always know what to expect:

| Section | What you'll find there |
|---|---|
| **In this lecture** | A short preview of what you're about to learn and why it matters |
| **Explanation + examples** | Plain-language explanations with runnable code samples |
| **Diagrams** | Mermaid diagrams for architectures, flows, and sequences where a picture helps |
| **Try it yourself** | A small hands-on exercise to reinforce the lecture |
| **Key takeaways** | A quick recap you can revise from before a quiz or exam |

## Where to start

- **New to web development?** Begin at [Web Technologies → Lecture 1](web-technologies/lecture-01-introduction-to-web-development.md).
- **Finished CSC336 already?** Jump into [Advanced Web Technologies → Lecture 1](advanced-web-technologies/lecture-01-course-overview-and-enterprise-architecture.md).
- **Looking for a specific topic?** Use the search bar at the top of the page, or browse the [tag index](tags.md).

## Downloads, Demos, and Tutorials

<div class="wdb-grid">
  <div class="wdb-card">
    <span class="wdb-badge">PDF · PRESENTATION-READY</span>
    <h3>Lecture Slides</h3>
    <p>
      Full slide decks for CSC336 Lectures 1–10, one slide per PDF page — use full-screen
      view for a proper presentation, or print them for offline study.
    </p>
    <a class="wdb-card-link" href="downloads/#csc336-lecture-slides-lectures-110" aria-label="Open Lecture Slides"></a>
  </div>
  <div class="wdb-card">
    <span class="wdb-badge">STANDALONE · TOOL-FOCUSED</span>
    <h3>Tutorials</h3>
    <p>
      Self-contained, beginner-to-intermediate walkthroughs that sit alongside the lecture
      chapters — environment setup, layout patterns, Git and GitHub, and more.
    </p>
    <a class="wdb-card-link" href="tutorials/" aria-label="Open Tutorials"></a>
  </div>
  <div class="wdb-card">
    <span class="wdb-badge">RUNNABLE · HTML/CSS/JS</span>
    <h3>Demos</h3>
    <p>
      A companion repository of small, self-contained demos and mini projects, one folder
      per topic, that go with these chapters — open <code>index.html</code> and run.
    </p>
    <a class="wdb-card-link" href="demos/" aria-label="Open Demos"></a>
  </div>
  <div class="wdb-card">
    <span class="wdb-badge">CDF · LECTURE PLAN</span>
    <h3>Course Documents</h3>
    <p>
      Official CSC336 and CSC337 Course Description Forms and lecture-wise plan PDFs, plus
      legacy slide decks from earlier course offerings, kept here for reference.
    </p>
    <a class="wdb-card-link" href="downloads/" aria-label="Open Downloads"></a>
  </div>
</div>
