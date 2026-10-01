---
title: Operating Systems (CSC323) — Overview
description: >-
  A 32-lecture Operating Systems textbook — process management, CPU scheduling,
  synchronization, deadlocks, memory management, and file systems — with worked
  examples and native diagrams, free to read online.
tags:
  - CSC323
  - Overview
---

# Operating Systems (CSC323)

**Credit hours:** 3 (2 lecture + 1 lab) · **Pre-requisite:** None
**Audience:** BS Computer Science, 4th semester

Operating Systems takes you underneath every program you've ever run: what actually happens
when you double-click an app, how dozens of processes share one CPU without stepping on each
other, why two threads touching the same variable can corrupt your data, and how a 16 GB
laptop convinces a program it has gigabytes of memory all to itself. You'll build a precise
mental model of processes and threads, trace real CPU scheduling algorithms by hand, prove
synchronization code is correct (or find the race condition that isn't), detect and avoid
deadlocks with the Banker's Algorithm, and follow a memory address from a C variable all the
way down to a physical RAM cell through paging and virtual memory.

This book assumes no prior systems programming experience. Every algorithm is traced through
a concrete worked example before any code appears, and diagrams carry as much of the
explanation as the prose does.

## Course objectives

- Address the purpose, services, and implementation design of operating systems.
- Describe the process concept, and how processes are synchronized, scheduled, and managed in the presence of deadlocks.
- Discuss the techniques of primary and virtual memory management.
- Explain the structure of file systems, storage, and I/O devices.
- Describe security and protection issues in computer systems and their management within an OS.

## What you will be able to do (Course Learning Outcomes)

| CLO | You will be able to... | Bloom's level |
|---|---|---|
| CLO-1 | Describe the purpose, types, services, and structuring techniques of various operating systems | Understanding |
| CLO-2 | Analyze the effectiveness of process and thread management mechanisms, including scheduling algorithms and concurrency control | Analyzing |
| CLO-3 | Apply synchronization and deadlock handling techniques to solve critical section problems and manage process coordination | Applying |
| CLO-4 | Analyze memory and storage management strategies to evaluate their impact on system performance and resource utilization | Analyzing |
| CLO-5 *(lab)* | Apply system commands and shell scripting techniques to perform basic process, file, and memory management operations in a UNIX/Linux environment | Applying |
| CLO-6 *(lab)* | Implement solutions for process scheduling, synchronization, memory allocation, and file management | Applying |

## How the book is organized

The 32 lectures are grouped into 8 units.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Course progression</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Foundations</span>
<span class="db-node-sub">Units 1–2 · what an OS is, processes, threads, IPC</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Coordination</span>
<span class="db-node-sub">Units 3–6 · scheduling, synchronization, deadlocks</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Resources</span>
<span class="db-node-sub">Units 7–8 · memory, storage, and file systems</span>
</div>
</div>
</div>

| Unit | Topic | Lectures |
|---|---|---|
| 1 | [Foundations of Operating Systems](lecture-01-introduction-to-operating-systems.md) | 1–5 |
| 2 | [Process Management, IPC, and Threads](lecture-06-process-concept-and-process-states.md) | 6–9 |
| 3 | [CPU Scheduling](lecture-10-cpu-scheduling-concepts-and-fcfs.md) | 10–12 |
| 4 | [Process Synchronization](lecture-13-race-conditions-and-the-critical-section-problem.md) | 13–16 |
| 5 | [Midterm Review](lecture-17-midterm-review.md) | 17–18 |
| 6 | [Deadlocks](lecture-19-deadlocks-characterization-and-the-resource-allocation-graph.md) | 19–21 |
| 7 | [Memory Management](lecture-22-memory-management-fundamentals.md) | 22–27 |
| 8 | [Storage and File Systems](lecture-28-mass-storage-management.md) | 28–32 |

## Assessment

Four quizzes and four assignments build toward the theory component, a midterm (lectures 17–18
are dedicated review and practice lectures) worth 25%, and a comprehensive final exam worth
50%. The lab component is assessed separately, applying these concepts hands-on in a
UNIX/Linux environment.

## Recommended books

- *Operating System Concepts*, 10th ed. — Abraham Silberschatz, Peter B. Galvin & Greg Gagne (Wiley, 2021)
- *Operating Systems: Internals and Design Principles*, 9th ed. — William Stallings (Pearson, 2017)
- *Modern Operating Systems*, 4th ed. — Andrew S. Tanenbaum & Herbert Bos (Pearson, 2014)

---

Ready? Start with **[Lecture 1 — Introduction to Operating Systems](lecture-01-introduction-to-operating-systems.md)**.
