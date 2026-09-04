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
