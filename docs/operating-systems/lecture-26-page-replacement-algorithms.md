---
title: "26. Page Replacement Algorithms"
tags:
  - CSC323
  - Operating Systems
  - Page Replacement
  - FIFO
  - LRU
  - Thrashing
---

# 26. Page Replacement Algorithms

Lecture 25's EAT calculation delivered an uncomfortable fact: a page fault rate of just
one-tenth of one percent was already enough to make memory access forty times slower on
average. That number was handed over as a given — but it depends entirely on one decision
the OS makes over and over, every time memory is full and a new page needs a frame: *which
resident page gets evicted?* Choose badly, and pages the process needs again almost
immediately get thrown out, driving the fault rate up and EAT down with it. Choose well,
and the fault rate stays low. This lecture is a tour of the algorithms that make that
choice, built around one shared example so every algorithm can be compared on exactly the
same footing.

## In This Lecture

- Why page replacement is necessary, and the role of the dirty (modify) bit
- **Reference strings**: the standard way to evaluate and compare replacement algorithms
- **FIFO**, worked in full, plus **Belady's Anomaly** — more frames causing *more* faults
- **Optimal (OPT/MIN)** replacement — provably best, and provably unusable in practice
- **LRU**, its implementation costs, and the **Second-Chance (Clock)** algorithm that
  approximates it cheaply
- **MFU/LFU** in brief, and **thrashing** — what happens when none of this is enough

## Why Page Replacement Is Needed

Demand paging (Lecture 25) works beautifully right up until physical memory fills up. When
a page fault occurs and **no frame is free**, the OS cannot simply "find" an empty frame —
it must choose an existing **resident** page, evict it, and reuse its frame for the newly
faulted page. If the evicted page was modified since it was loaded — tracked by a per-page
**dirty bit** (also called the **modify bit**) — it must first be written back to disk
before its frame can be reused; a page that was never written to can simply be discarded,
since an identical copy still exists on disk.

Every algorithm below is really answering one question: **of all the pages currently
resident, which one is safest to evict right now?**

## Reference Strings: A Common Basis for Comparison

A **reference string** is simply the sequence of page numbers a process references over
time, stripped of everything else (which instruction, which exact address) except the page
number. Reference strings are the standard way to evaluate and compare page-replacement
algorithms, because they let every algorithm be run against *identical* input and judged
purely on how many times it faults.

Every algorithm in this lecture is evaluated against the same **reference string**, with
the same number of frames, specifically so the results can be compared directly:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The reference string used throughout this lecture</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2</span>
<span class="db-node-sub">13 page references, 3 frames available</span>
</div>
</div>
</div>

## FIFO Page Replacement

**First-In-First-Out (FIFO)** evicts whichever resident page has been in memory the
**longest**, with no regard to how recently or how often it was actually used. It is the
simplest possible policy to implement — a queue of resident pages, oldest at the front.

<div class="db-relation" markdown>
<div class="db-relation-name">FIFO trace — reference string 7,0,1,2,0,3,0,4,2,3,0,3,2, 3 frames</div>

| Reference | Frames after (oldest → newest) | Fault? | Evicted |
|---|---|---|---|
| 7 | 7, –, – | Fault | — |
| 0 | 7, 0, – | Fault | — |
| 1 | 7, 0, 1 | Fault | — |
| 2 | 0, 1, 2 | Fault | 7 |
| 0 | 0, 1, 2 | — | — |
| 3 | 1, 2, 3 | Fault | 0 |
| 0 | 2, 3, 0 | Fault | 1 |
| 4 | 3, 0, 4 | Fault | 2 |
| 2 | 0, 4, 2 | Fault | 3 |
| 3 | 4, 2, 3 | Fault | 0 |
| 0 | 2, 3, 0 | Fault | 4 |
| 3 | 2, 3, 0 | — | — |
| 2 | 2, 3, 0 | — | — |

</div>

**Total FIFO faults: 10 out of 13 references.**

!!! tip "Belady's Anomaly: more memory making things worse"
    Intuition says giving a process *more* frames should never hurt — more room to keep
    pages resident can only reduce faults, or at worst leave them unchanged. FIFO is the
    counter-example: it is possible to construct a reference string where **adding a
    frame increases the fault count**, a result known as **Belady's Anomaly**. Using the
    classic illustrative string `1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5` (a different string,
    chosen specifically to expose this effect) against FIFO:

    | Frames | Page faults |
    |---|---|
    | 3 | 9 |
    | 4 | **10** |

    Four frames — strictly more memory than three — produces *one more* fault, not fewer.
    This is surprising precisely because it violates the natural assumption that more
    resources can only help; it is also a large part of why FIFO is rarely used alone in
    serious production systems, and why **stack algorithms** like LRU (which are
    mathematically guaranteed never to exhibit this anomaly) are generally preferred.

## Optimal Page Replacement (OPT / MIN)

**Optimal replacement** evicts whichever resident page will **not be used again for the
longest time in the future** (or, if a page will never be referenced again at all, that
page is evicted first). It is provably the best possible replacement policy for a given
reference string — no algorithm can produce fewer faults than OPT on the same input.

<div class="db-relation" markdown>
<div class="db-relation-name">OPT trace — same reference string, 3 frames</div>

| Reference | Frames after | Fault? | Evicted (reason) |
|---|---|---|---|
| 7 | 7, –, – | Fault | — |
| 0 | 7, 0, – | Fault | — |
| 1 | 7, 0, 1 | Fault | — |
| 2 | 0, 1, 2 | Fault | 7 (never referenced again) |
| 0 | 0, 1, 2 | — | — |
| 3 | 0, 2, 3 | Fault | 1 (never referenced again) |
| 0 | 0, 2, 3 | — | — |
| 4 | 2, 3, 4 | Fault | 0 (next used at position 11 — farthest away) |
| 2 | 2, 3, 4 | — | — |
| 3 | 2, 3, 4 | — | — |
| 0 | 2, 3, 0 | Fault | 4 (never referenced again) |
| 3 | 2, 3, 0 | — | — |
| 2 | 2, 3, 0 | — | — |

</div>

**Total OPT faults: 7 out of 13 references** — the best any algorithm could do against
this exact string with 3 frames, and noticeably fewer than FIFO's 10.

!!! warning "OPT is a lower bound, not an implementable algorithm"
    Computing the optimal choice requires knowing **every future reference in advance** —
    information no real operating system has while a process is actually running. OPT
    exists purely as a theoretical yardstick: every practical algorithm is judged by how
    close it gets to OPT's fault count on the same workload, not by whether it can ever
    equal it in a real system.

## LRU (Least Recently Used)

**LRU** evicts whichever resident page was **least recently used** — unused for the
longest time *in the past*. It approximates OPT by betting that the immediate past is a
good predictor of the immediate future: a page nobody has touched in a while is a
reasonable guess for a page nobody is about to touch again soon.

<div class="db-relation" markdown>
<div class="db-relation-name">LRU trace — same reference string, 3 frames</div>

| Reference | Frames after (LRU → MRU) | Fault? | Evicted |
|---|---|---|---|
| 7 | 7 | Fault | — |
| 0 | 7, 0 | Fault | — |
| 1 | 7, 0, 1 | Fault | — |
| 2 | 0, 1, 2 | Fault | 7 |
| 0 | 1, 2, 0 | — | — |
| 3 | 2, 0, 3 | Fault | 1 |
| 0 | 2, 3, 0 | — | — |
| 4 | 3, 0, 4 | Fault | 2 |
| 2 | 0, 4, 2 | Fault | 3 |
| 3 | 4, 2, 3 | Fault | 0 |
| 0 | 2, 3, 0 | Fault | 4 |
| 3 | 2, 0, 3 | — | — |
| 2 | 0, 3, 2 | — | — |

</div>

**Total LRU faults: 9 out of 13 references** — one better than FIFO (10), and one worse
than the theoretical optimum OPT (7), exactly the ordering theory predicts: OPT ≤ LRU
≤ FIFO for this reference string.

Implementing true LRU requires knowing, precisely, when every resident page was last
touched. Two approaches make this exact:

- **Counters** — timestamp every memory reference, and store the timestamp of the most
  recent access to each page; eviction scans for the smallest timestamp.
- **A stack of page numbers** — move a page to the top of the stack on every reference;
  the page at the bottom is always the least recently used one.

!!! warning "True LRU is too expensive for most hardware"
    Both approaches demand hardware support on *every single memory reference* — updating
    a timestamp or restructuring a stack cannot be allowed to slow down ordinary memory
    access, yet that is exactly what true LRU asks for. In practice, this cost is
    considered too high to implement exactly, which is precisely the gap the Second-Chance
    algorithm below is designed to close cheaply.

## Second-Chance (Clock) Algorithm

The **Second-Chance algorithm** (commonly called the **Clock algorithm**, after the shape
of its data structure) approximates LRU using only a single **reference bit** per frame —
far cheaper than a timestamp or a stack. Frames are arranged in a circle with a **clock
hand** pointing at the next candidate for eviction.

- Whenever a page is **referenced**, its reference bit is set to 1 (this costs nothing
  extra beyond the reference itself).
- On a fault, the hand examines the frame it currently points to:
    - If that frame's reference bit is **1**, the page is given a **second chance**: clear
      the bit to 0, and advance the hand to the next frame — without evicting it.
    - If that frame's reference bit is **0**, that page is evicted immediately, the new
      page takes its place (with its reference bit set to 1), and the hand advances past
      it.

<div class="db-relation" markdown>
<div class="db-relation-name">Clock trace — same reference string, 3 frames (slot: page:bit)</div>

| Reference | Slot 0 | Slot 1 | Slot 2 | Fault? | Evicted |
|---|---|---|---|---|---|
| 7 | 7:1 | – | – | Fault | — |
| 0 | 7:1 | 0:1 | – | Fault | — |
| 1 | 7:1 | 0:1 | 1:1 | Fault | — |
| 2 | 2:1 | 0:0 | 1:0 | Fault | 7 |
| 0 | 2:1 | 0:1 | 1:0 | — | — |
| 3 | 2:1 | 0:0 | 3:1 | Fault | 1 |
| 0 | 2:1 | 0:1 | 3:1 | — | — |
| 4 | 4:1 | 0:0 | 3:0 | Fault | 2 |
| 2 | 4:1 | 2:1 | 3:0 | Fault | 0 |
| 3 | 4:1 | 2:1 | 3:1 | — | — |
| 0 | 4:0 | 2:0 | 0:1 | Fault | 3 |
| 3 | 3:1 | 2:0 | 0:1 | Fault | 4 |
| 2 | 3:1 | 2:1 | 0:1 | — | — |

</div>

**Total Clock faults: 9 out of 13 references** — matching LRU exactly on this reference
string, at a fraction of the bookkeeping cost, which is exactly the trade-off Second-Chance
is designed to offer.

## MFU and LFU (Brief)

Two further counting-based policies occasionally appear, each tracking how *often* a page
has been referenced rather than how recently:

- **LFU (Least Frequently Used)** evicts the page with the smallest reference count. Its
  weakness: a page that was referenced heavily during an early burst keeps a high count
  forever, even long after the process has moved on and stopped needing it — the count
  never forgets, so a once-popular page can wrongly survive.
- **MFU (Most Frequently Used)** evicts the page with the *largest* reference count, on
  the reasoning that a page already used heavily is "done" and unlikely to be needed again.
  This rationale is weaker than LFU's, and MFU is correspondingly far less common in
  practice.

Both are mentioned here mainly to round out the taxonomy — neither sees the widespread
real-world use that LRU and its Clock approximation do.

## Thrashing

Even a good replacement algorithm cannot save a process that simply does not have enough
frames for what it is actively doing. **Thrashing** is the precise name for this failure: a
process spends **more time paging than executing**, because its allocated frames are too
few to hold its **working set** — the set of pages it is actively referencing right now.

The danger compounds at the system level, not just the process level:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The thrashing feedback loop</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">CPU utilization looks low</span>
<span class="db-node-sub">The OS sees idle CPU and interprets it as "room for more work"</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">OS admits more processes</span>
<span class="db-node-sub">Hoping to raise CPU utilization by increasing the degree of multiprogramming</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Each process gets even fewer frames</span>
<span class="db-node-sub">The same physical memory is now divided among more processes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Faulting increases sharply</span>
<span class="db-node-sub">No process holds enough of its working set resident anymore</span>
</div>
<div class="db-arrow"><span class="db-arrow-label">CPU utilization drops further — the loop repeats, each lap worse than the last</span></div>
</div>
</div>

The result is a collapse, not a gentle slowdown: CPU utilization can fall even as the
system *adds* processes trying to raise it, because every process is now spending nearly
all its time waiting on page faults instead of computing anything at all.

!!! note "The working-set model is the standard fix"
    Rather than admitting processes until memory happens to run out, the **working-set
    model** tracks each process's actively-referenced page set directly and only allows a
    process to run when its working set can actually fit in the frames it's been given.
    The OS admits new processes only when the *collective* working sets of everything
    already running still leave room — directly preventing the spiral above instead of
    reacting to it after the fact.

## Key Takeaways

- Page replacement is needed whenever a fault occurs with **no free frame**; a **dirty
  (modify) bit** determines whether the evicted page must be written back to disk first.
- A **reference string** is the standard tool for comparing replacement algorithms; this
  lecture used the **same string, `7,0,1,2,0,3,0,4,2,3,0,3,2`, with 3 frames, for every
  algorithm**, so their fault counts are directly comparable: **FIFO = 10, LRU = 9, Clock =
  9, OPT = 7**.
- **FIFO** evicts the oldest resident page regardless of use, and can suffer **Belady's
  Anomaly** — more frames producing more faults, as shown with the classic
  `1,2,3,4,1,2,5,1,2,3,4,5` string (9 faults at 3 frames, 10 at 4).
- **OPT** is provably optimal but requires knowing the future, making it a theoretical
  lower bound only; **LRU** approximates OPT using the past, at a real implementation cost
  that **Second-Chance (Clock)** approximates cheaply with a single reference bit per
  frame.
- **Thrashing** — a process paging more than it executes — can collapse system-wide CPU
  utilization as the OS keeps admitting processes trying to fix the very problem it is
  causing; the **working-set model** is the standard defense.

The algorithms in this lecture are the general theory; Lecture 27 grounds that theory in
how two real, very different systems — Windows and ARM — actually manage memory in
practice.
Continue to [Lecture 27 — Case Study: Memory Management in Windows and ARM](lecture-27-case-study-memory-management-in-windows-and-arm.md).
