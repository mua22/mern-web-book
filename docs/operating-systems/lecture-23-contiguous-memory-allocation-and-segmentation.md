---
title: "23. Contiguous Memory Allocation and Segmentation"
tags:
  - CSC323
  - Operating Systems
  - Memory Management
  - Segmentation
  - Fragmentation
---

# 23. Contiguous Memory Allocation and Segmentation

Lecture 22 established the vocabulary — base and limit registers, address binding, the MMU —
but left one very practical question unanswered: when a new process needs memory, which
*actual* chunk of physical RAM does the OS actually hand it? This lecture works through the
classic answer — **contiguous allocation**, where a process's entire address space sits in
one unbroken block of physical memory — the specific strategies used to pick which block, the
two kinds of wasted space that result, and finally a first step away from "one unbroken block"
altogether: **segmentation**, which lets a program's memory layout match how a programmer
actually thinks about a program, rather than forcing everything into one flat address range.

## In This Lecture

- **Fixed partitioning (MFT)** vs. **dynamic partitioning (MVT)** — two ways to divide memory
  among processes
- The three classic **allocation strategies** for dynamic partitioning — First-Fit, Best-Fit,
  Worst-Fit — worked through one shared example to see exactly how and why they diverge
- **Internal vs. external fragmentation**, and **compaction** as external fragmentation's cure
- **Segmentation**: a program as a collection of logically distinct, independently sized
  segments, matching a programmer's own mental model
- The **segment table** and the protection bits that make segmentation hardware enforceable

## Contiguous Memory Allocation

Under **contiguous allocation**, each process occupies a single, continuous range of physical
addresses — exactly the base/limit model from Lecture 22. The two historical approaches to
deciding the *size* and *location* of that range differ in whether partitions are fixed in
advance or carved out on demand.

### Fixed Partitioning (MFT)

**MFT — Multiprogramming with a Fixed number of Tasks** — divides memory into a fixed set of
partitions **once, at boot time**, and assigns exactly one process to each partition.

<div class="db-diagram" markdown>
<p class="db-diagram-label">MFT — fixed partitions, decided once at boot</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Partition 1 (200 KB)</span> <span class="db-node-sub">Process A — uses 140 KB, 60 KB wasted inside the partition</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Partition 2 (200 KB)</span> <span class="db-node-sub">Process B — uses 195 KB</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Partition 3 (200 KB)</span> <span class="db-node-sub">Empty — waiting for the next process ≤ 200 KB</span></div>
</div>
</div>

It's simple to implement and simple to reason about — but every partition is a fixed size
decided in advance, so a process smaller than its partition wastes whatever space is left
over, and a process larger than every available partition simply cannot run at all, no matter
how much *total* free memory the system has.

### Dynamic Partitioning (MVT)

**MVT — Multiprogramming with a Variable number of Tasks** — fixes the waste problem above by
sizing each partition **exactly** to the process it's loaded for, carved out of a pool of free
memory ("holes") as processes arrive, and returned to that pool when they finish.

<div class="db-diagram" markdown>
<p class="db-diagram-label">MVT — partitions sized exactly to each process, carved from free "holes"</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Process A — 140 KB</span> <span class="db-node-sub">Allocated exactly the size it needs</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Hole — 60 KB</span> <span class="db-node-sub">Free, available for the next process that fits</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Process B — 195 KB</span> <span class="db-node-sub">Allocated exactly the size it needs</span></div>
</div>
</div>

No space is wasted *inside* a partition under MVT — but as processes of varying sizes come and
go, the free memory left behind fragments into a scattered set of holes of different sizes,
which is exactly where the allocation strategies below come in: given a request and a list of
holes, *which* hole should the OS pick?

## Allocation Strategies for Dynamic Partitioning

### First-Fit, Best-Fit, Worst-Fit

- **First-Fit** — scan the hole list (in address order) and allocate from the **first** hole
  that's big enough. Fast — it can stop searching the instant it finds a fit.
- **Best-Fit** — search the *entire* hole list and allocate from the **smallest** hole that's
  still big enough. This minimizes the wasted space left behind by any one allocation, but
  that very property tends to leave behind a trail of tiny, often-unusable leftover slivers —
  and because it must check every hole to be sure it found the smallest adequate one, it's
  slower to search than First-Fit.
- **Worst-Fit** — allocate from the **largest** hole available. The idea is that the leftover
  fragment, cut from the biggest hole, is more likely to still be a *useful* size for a future
  request — but it burns through the system's large holes quickly, which can leave nothing but
  small holes for a later request that genuinely needs a big one.

### Worked Example

Start from the same list of free holes, in address order, for all three strategies, and apply
the same sequence of three allocation requests — watch each strategy's own evolving hole list
to see exactly where their choices start to diverge.

<div class="db-relation" markdown>
<div class="db-relation-name">Starting free-hole list (address order)</div>

| Hole | H1 | H2 | H3 | H4 | H5 |
|---|---|---|---|---|---|
| Size | 150 KB | 350 KB | 90 KB | 500 KB | 220 KB |

</div>

Requests arrive in this order: **R1 = 130 KB**, **R2 = 300 KB**, **R3 = 200 KB**.

<div class="db-relation" markdown>
<div class="db-relation-name">First-Fit — first adequate hole, scanning in address order</div>

| Request | Scan finds | Allocated from | Leftover hole |
|---|---|---|---|
| R1 = 130 KB | H1 (150) is the first ≥ 130 | H1 | 150 − 130 = **20 KB** |
| R2 = 300 KB | H1′ (20) too small; H2 (350) is next ≥ 300 | H2 | 350 − 300 = **50 KB** |
| R3 = 200 KB | H1′, H2′, H3 all too small; H4 (500) is next ≥ 200 | H4 | 500 − 200 = **300 KB** |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Best-Fit — smallest adequate hole, searching the whole list each time</div>

| Request | Adequate holes | Smallest chosen | Allocated from | Leftover hole |
|---|---|---|---|---|
| R1 = 130 KB | 150, 350, 500, 220 (90 excluded) | 150 | H1 | **20 KB** |
| R2 = 300 KB | 350, 500 | 350 | H2 | **50 KB** |
| R3 = 200 KB | 500, 220 | 220 | **H5** | **20 KB** |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Worst-Fit — largest hole available each time</div>

| Request | Largest hole | Allocated from | Leftover hole |
|---|---|---|---|
| R1 = 130 KB | 500 | **H4** | 500 − 130 = **370 KB** |
| R2 = 300 KB | 370 (the leftover of H4) | **H4 (again)** | 370 − 300 = **70 KB** |
| R3 = 200 KB | 350 | **H2** | 350 − 200 = **150 KB** |

</div>

Lay the three outcomes side by side and the divergence is unmistakable by the third request:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Where each strategy allocated R3 = 200 KB from</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">First-Fit → H4</span><span class="db-node-sub">First hole in scan order big enough — 500 KB</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Best-Fit → H5</span><span class="db-node-sub">Smallest adequate hole — 220 KB, tightest leftover (20 KB)</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Worst-Fit → H2</span><span class="db-node-sub">Largest hole remaining — 350 KB, largest leftover (150 KB)</span></div>
</div>
</div>

Notice that for R1 and R2, First-Fit and Best-Fit happened to agree (the smallest adequate
hole was, by coincidence, also the first one First-Fit's scan reached) — but Worst-Fit
diverged from both immediately, by design, since it deliberately avoids the smallest adequate
hole every time. By R3, every strategy's own history of earlier allocations has reshaped its
hole list differently enough that all three strategies disagree. This is exactly why the three
strategies are not interchangeable: the *order* in which holes get consumed, and the *size* of
what's left behind, compounds differently over a real sequence of requests.

!!! note "No strategy is universally 'best'"
    First-Fit is usually the fastest and a reasonable default. Best-Fit minimizes waste on any
    single allocation but tends to accumulate many tiny, unusable slivers over time. Worst-Fit
    tries to keep leftover fragments usefully large, at the cost of exhausting big holes
    quickly when a later request actually needs one. Real allocators are chosen based on the
    expected request-size distribution of the workload, not a universal ranking.

## Fragmentation

Both fixed and dynamic partitioning waste memory — just in structurally different ways.

- **Internal fragmentation** — allocated memory is slightly (or not so slightly) **larger**
  than what was actually requested, and the extra space sits wasted *inside* the allocated
  partition, unusable by anyone else. This is inherent to **fixed partitioning**: a process
  smaller than its partition always leaves the difference stranded inside its own partition's
  boundary.
- **External fragmentation** — enough **total** free memory exists to satisfy a request, but
  it is scattered across holes that are each individually too small, with no single hole big
  enough on its own. This is inherent to **dynamic partitioning**: as processes of varying
  sizes come and go, the holes left behind are an uncontrolled byproduct of history, not a
  deliberate size.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Internal vs. external fragmentation</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Internal fragmentation</span><span class="db-node-sub">Wasted space INSIDE one allocated partition — fixed partitioning (MFT)</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">External fragmentation</span><span class="db-node-sub">Enough total free memory exists, but scattered in holes too small individually — dynamic partitioning (MVT)</span></div>
</div>
</div>

**Compaction** addresses external fragmentation directly: shuffle every allocated block
together toward one end of memory, consolidating every scattered hole into one single large
block at the other end. It is **expensive** — every byte of every relocated process has to be
physically copied — and it is only even *possible* in the first place if every process can be
relocated freely while running, which means it requires **execution-time (dynamic) binding**
and the relocation-register-style MMU support from Lecture 22. Under compile-time or load-time
binding, a process's addresses are already fixed and cannot simply be moved to a new physical
location without breaking it.

## Non-Contiguous Allocation: Segmentation

Contiguous allocation — fixed or dynamic — still treats a whole process as one indivisible
block. **Segmentation** breaks that assumption: it views a program the way a programmer
actually thinks about it, as a **collection of logically distinct segments** — code, stack,
heap, and so on — each with its own name (or number), and each sized naturally for what it
actually contains, rather than forced to fit into one flat address space.

### Basic Method

Each segment is a complete logical unit in its own right: a `Code` segment holding
instructions, a `Stack` segment growing and shrinking as functions are called and return, a
`Heap` segment for dynamically allocated data, perhaps separate segments for distinct library
modules. A logical address under segmentation is really a pair, **(segment number, offset
within that segment)** — not a single flat number.

### The User's View of Memory

From the programmer's side, this isn't an abstraction forced on them after the fact — it
matches how they already organize a program conceptually. The system maintains this view as a
**segmentation table**:

<div class="db-relation" markdown>
<div class="db-relation-name">Segment table for one process</div>

| Segment | Base | Limit |
|---|---|---|
| 0 — Code | 4300 | 1200 |
| 1 — Heap | 6700 | 2500 |
| 2 — Stack | 9400 | 1000 |
| 3 — Shared library | 12100 | 1800 |

</div>

A logical address `(2, 150)` — "150 bytes into the Stack segment" — is translated by adding
the offset to that segment's base: `9400 + 150 = 9550`, exactly as long as `150` does not
exceed segment 2's limit of `1000`.

### Segmentation Hardware

The hardware that makes this work is, conceptually, a small array of **(base, limit)** pairs —
one per segment, forming the segment table itself — plus a set of **protection bits** attached
to each individual segment, not to the process as a whole. A `Code` segment, for instance, is
typically marked **read/execute-only**: the hardware will trap an attempt to *write* to it,
catching an entire category of bugs (and attacks) that would otherwise silently corrupt a
running program's own instructions. A `Stack` or `Heap` segment, by contrast, is marked
**read/write** but not executable, which is exactly the protection that stops many classic
buffer-overflow attacks from being able to run injected code off the stack.

!!! tip "Segmentation protection is finer-grained than base/limit alone"
    Lecture 22's single base/limit pair protects a process from every *other* process, but
    treats everything inside that one process identically. Segmentation's per-segment
    protection bits add a second, finer layer: protecting a process even from **itself** —
    stopping its own code from accidentally overwriting its own instructions, for instance.

## Key Takeaways

- **Fixed partitioning (MFT)** divides memory into fixed-size partitions set once at boot —
  simple, but wastes memory (**internal fragmentation**) whenever a process is smaller than
  its partition.
- **Dynamic partitioning (MVT)** sizes each partition exactly to the process loading into it,
  carved from a pool of free holes — eliminating internal fragmentation, but introducing
  **external fragmentation** as holes of assorted, uncontrolled sizes accumulate over time.
- **First-Fit** (first adequate hole, fast), **Best-Fit** (smallest adequate hole, minimizes
  per-allocation waste but leaves tiny unusable slivers, slower to search), and **Worst-Fit**
  (largest hole, keeps leftovers usefully sized but burns through big holes fast) can all pick
  **different** holes for the same request sequence, as the worked example showed directly.
- **Compaction** consolidates scattered holes into one large block, but is expensive and only
  possible when processes can be relocated while running — i.e., under **execution-time
  binding**.
- **Segmentation** organizes a program as a collection of logically distinct, independently
  sized segments (code, heap, stack, …), matching how a programmer actually thinks about their
  program; a **segment table** (base, limit, and per-segment protection bits) is the hardware
  structure that makes this enforceable.

Segmentation solves fragmentation's *shape* problem by letting pieces vary in size — but
variable-sized pieces are exactly what produces external fragmentation in the first place.
The next lecture introduces the alternative that avoids that trade-off entirely, by making
every piece of memory the *same* fixed size. Continue to
[Lecture 24 — Paging: Method and Hardware Support](lecture-24-paging-method-and-hardware-support.md).
