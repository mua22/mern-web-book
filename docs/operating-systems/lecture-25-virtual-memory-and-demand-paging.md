---
title: "25. Virtual Memory and Demand Paging"
tags:
  - CSC323
  - Operating Systems
  - Virtual Memory
  - Demand Paging
  - Page Faults
---

# 25. Virtual Memory and Demand Paging

Every paging scheme discussed so far has quietly assumed something expensive: that a
process's *entire* logical address space is resident in physical memory before the process
can run. Load the whole program, every page of it, before the CPU executes even one
instruction. That assumption wastes an enormous amount of memory, because most programs
spend most of their time touching a small, localized subset of their own code and data — a
text editor rarely executes its "export to PDF" routine, and a compiler rarely runs its
error-formatting code. **Virtual memory** is the idea that breaks this assumption apart:
separate a program's logical address space from physical memory so completely that a
process can run with only *part* of itself actually loaded. The rest of this lecture works
out exactly how that separation is implemented, what it costs when it goes wrong, and one
genuinely elegant trick — copy-on-write — that squeezes it for an almost-free win on one of
the most common operations in any operating system.

## In This Lecture

- What virtual memory is, and the three concrete benefits it buys an operating system
- **Demand paging**: loading a page only when it is first referenced, never speculatively
- The full step-by-step **page-fault handling** sequence, from CPU reference to restarted
  instruction
- **Effective Access Time (EAT)** with page faults, and why even a tiny fault rate can
  devastate performance
- **Copy-on-write (COW)**: how `fork()` avoids copying an address space it may never need

## Virtual Memory: Background and Benefits

**Virtual memory** separates a process's logical address space — the addresses its
instructions actually reference — from the physical memory frames that back it. The
process behaves as though it owns a large, contiguous, private address space; in reality,
at any given moment, only some of that space has a physical frame behind it. The
hardware's paging mechanism (the page table from the previous lectures) is exactly the
translation layer that makes this illusion work, with one addition: a page table entry can
now be marked **invalid** — "this page exists logically, but has no frame assigned to it
right now."

<div class="db-diagram" markdown>
<p class="db-diagram-label">Virtual memory: a large logical address space, a smaller physical reality</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Logical address space</span>
<span class="db-node-sub">The full program, as the process believes it exists — can be far larger than physical RAM</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Physical memory</span>
<span class="db-node-sub">Only the pages actually in use right now occupy a real frame</span>
</div>
</div>
</div>

This separation buys three concrete benefits, none of which were available when a process
had to be fully resident:

- **A program can be larger than physical memory.** Nothing requires the whole address
  space to fit in RAM at once — only the portion actively being used needs a frame, so a
  program's logical size is no longer bounded by how much physical memory the machine
  happens to have.
- **More programs can run simultaneously.** Because each process only occupies frames for
  its *active* portion rather than its entire address space, far more processes fit in the
  same physical memory at once — directly improving the degree of multiprogramming the
  scheduler has to work with.
- **Less I/O is needed to load or swap a program.** Since a process doesn't have to be
  loaded in full before it runs, and doesn't have to be swapped out in full to make room
  for another, the disk I/O spent moving programs in and out of memory drops sharply.

!!! note "Virtual memory is an illusion maintained cooperatively"
    The process itself never needs to know which of its pages are currently resident. It
    just references addresses; the hardware and the OS conspire, invisibly, to make sure
    the right physical frame is behind every reference that's actually allowed to succeed —
    and to intervene, via the page-fault mechanism below, whenever it isn't there yet.

## Demand Paging

If a process doesn't need its whole address space resident to run, the natural next
question is: *which* pages should be loaded, and when? **Demand paging** answers this as
aggressively as possible: load a page **only when it is first referenced**, never in
advance, never speculatively.

Under **pure demand paging**, a process is started with **zero pages in memory**. The very
first instruction fetch is, by construction, a reference to a page that isn't resident —
which immediately triggers a page fault, pulls that one page in, and lets execution
continue. Every other page the process ever touches is loaded the exact same way, one fault
at a time, purely in response to the process actually needing it. Pages the process never
ends up touching during its entire run are never loaded at all — not a wasted byte of I/O
or memory is spent on them.

!!! tip "Why 'pure' demand paging starts with nothing resident"
    It would be entirely possible to load a *few* pages eagerly — the first page containing
    the entry point, say — and treat the rest as demand-paged. Real systems sometimes do
    exactly this. "Pure" demand paging is the strict, extreme version used to reason about
    the mechanism cleanly: absolutely nothing is loaded until a reference proves it's
    needed, and the page-fault mechanism alone is responsible for bringing in every single
    page the process ever uses.

## Page-Fault Handling

A **page fault** is the hardware trap generated when a running process references a page
whose page table entry is marked invalid. Handling one correctly, start to finish, is a
precise sequence — get any step wrong and either the process resumes incorrectly or a
legitimate program is killed for no reason.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Page-fault handling, step by step</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">1. CPU references a page</span>
<span class="db-node-sub">Logical address generated by the running instruction</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">2. Page table marks it invalid</span>
<span class="db-node-sub">No frame currently backs this page — hardware traps to the OS</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">3. OS checks: valid reference, or illegal?</span>
<span class="db-node-sub">Was this address ever a legitimate part of the process's address space?</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">3a. Illegal access → abort the process</span>
<span class="db-node-sub">The reference was never valid — e.g. a stray pointer outside the address space</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">3b. Valid, just not yet loaded → continue</span>
<span class="db-node-sub">The page genuinely belongs to the process; it's just never been brought in</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">4. Find a free frame</span>
<span class="db-node-sub">From the free-frame list, or by running a page-replacement algorithm (Lecture 26) if none are free</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">5. Schedule a disk read</span>
<span class="db-node-sub">Read the page's contents in from backing store into the chosen frame</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">6. Update the page table</span>
<span class="db-node-sub">Mark the entry valid, and record which frame now holds it</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">7. Restart the faulting instruction</span>
<span class="db-node-sub">Re-execute from the very instruction that faulted — this time, the reference succeeds</span>
</div>
</div>
</div>

Step 3's branch is the single most important decision in the whole sequence. A page fault
is not automatically an error — it is the *expected*, routine mechanism by which every page
of a demand-paged process gets loaded in the first place. Only when the OS determines the
referenced address was never part of the process's address space at all (step 3a) does the
fault turn into a fatal error, typically reported to the user as a segmentation violation.

!!! warning "Step 7 restarts the instruction, not just the memory reference"
    The CPU does not resume mid-instruction. The entire faulting instruction — including any
    of its earlier operand fetches that already succeeded — is re-executed from the start.
    This only works because nothing about the instruction has any side effect until it
    completes, so repeating it is always safe.

## Performance of Demand Paging: Effective Access Time

Demand paging's benefit is cheap startup and lower memory pressure; its cost is that some
fraction of memory references now trigger a page fault, and a page fault means waiting on
a disk. The **effective access time (EAT)** quantifies exactly how much that cost matters:

**EAT = (1 − p) × memory access time + p × page fault service time**

where p is the **page fault rate** — the fraction of memory references that fault — and
the **page fault service time** is dominated by disk I/O: the seek, rotational latency, and
transfer time that Lecture 28 breaks down in full.

**Worked example.** Suppose memory access time is 200 ns, and the average page-fault
service time is 8 ms (8,000,000 ns) — a number that looks small written as "8
milliseconds," but is forty thousand times slower than a single memory access. Compute EAT
at a page-fault rate of p = 0.001 (one reference in a thousand faults):

**EAT = (1 − 0.001) × 200 + 0.001 × 8,000,000**

**EAT = 0.999 × 200 + 0.001 × 8,000,000 = 199.8 + 8,000 = 8,199.8 ns**

That's roughly **8.2 microseconds** — about **41 times slower** than the fault-free 200
ns baseline, even though **999 out of every 1,000 references never fault at all**. A fault
rate of one-tenth of one percent is already enough to devastate performance, purely
because the penalty for the rare faulting reference is so many orders of magnitude larger
than the cost of an ordinary one.

The sensitivity only gets starker at smaller fault rates. At p = 0.0001 (one in ten
thousand):

**EAT = 0.9999 × 200 + 0.0001 × 8,000,000 = 199.98 + 800 = 999.98 ns**

Still roughly **5 times slower** than 200 ns — from a fault rate ten times lower than
the example above.

<div class="db-relation" markdown>
<div class="db-relation-name">EAT at ma = 200 ns, pf = 8 ms, for a range of fault rates</div>

| Page fault rate p | EAT | Slowdown vs. fault-free (200 ns) |
|---|---|---|
| 0 (no faults) | 200 ns | 1× |
| 0.0001 (1 in 10,000) | ≈ 1,000 ns | ≈ 5× |
| 0.001 (1 in 1,000) | ≈ 8,200 ns | ≈ 41× |

</div>

!!! warning "This is why keeping the fault rate near zero is non-negotiable"
    If an OS wants demand paging to cost close to nothing in practice, the page fault rate
    has to be kept extremely low — ideally a tiny fraction of a percent. This is precisely
    the pressure that motivates Lecture 26's page-replacement algorithms: a bad replacement
    choice raises the fault rate, and the EAT formula above shows exactly how savagely that
    gets punished.

## Copy-on-Write (COW)

`fork()` is one of the most frequently executed system calls on any Unix-like system, and
historically it had an expensive, literal interpretation: duplicate the entire parent
process's address space into a brand-new set of frames for the child. For a large process,
that's a lot of copying — and very often, wasted copying.

**Copy-on-write** avoids the waste by delaying the copy until it's actually needed. When
`fork()` creates a child process, the parent and child initially **share the exact same
physical pages**, with every shared page marked **read-only**. Both processes can read
their (identical) memory freely, because reading a shared page is no different whether it's
shared or not. Only when *either* process attempts to **write** to one of these shared
pages does a protection fault occur — and only then does the OS step in, copy that *one*
page into a new frame, and let the write proceed against the private copy.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Copy-on-write: share first, copy only on a write</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">fork() creates the child</span>
<span class="db-node-sub">Parent and child share every physical page, all marked read-only</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Both processes run and read freely</span>
<span class="db-node-sub">No copying has happened yet — reads need no privacy</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">One process writes to a shared page</span>
<span class="db-node-sub">Read-only protection triggers a fault — the OS copies just that one page</span>
</div>
</div>
</div>

Why this is a huge win: `fork()` is extremely often followed almost immediately by
`exec()` — the child forks only to then replace its entire address space with a different
program altogether. Under copy-on-write, that sequence never copies anything at all: the
child shares the parent's pages for the brief interval before `exec()` discards that
address space wholesale, so the "full copy" that naive `fork()` would have performed was
pure wasted work from the very start. Copy-on-write makes the common `fork()` +
`exec()` pattern cost almost nothing, instead of the price of duplicating an entire
process.

!!! note "Which pages actually get copied?"
    Only the handful of pages either process happens to write to before the sharing ends
    (by one of them exiting, or by `exec()` discarding the address space) are ever
    duplicated. A long-running parent-and-child pair that both write heavily to shared data
    will eventually see most of their address space copied anyway — copy-on-write doesn't
    eliminate copying in general, it just stops paying for copies that would never have been
    needed.

## Key Takeaways

- **Virtual memory** separates a process's logical address space from physical memory,
  letting a process run with only part of itself resident — enabling programs larger than
  physical memory, more concurrent processes, and less program-loading I/O.
- **Pure demand paging** starts a process with zero resident pages and loads every page
  exactly once, in response to the reference that first needs it.
- **Page-fault handling** is a precise sequence: trap on an invalid reference, distinguish
  a genuinely invalid access (abort) from a valid-but-unloaded one, find a frame, read the
  page in, update the page table, and restart the faulting instruction from the beginning.
- **EAT** with page faults shows how brutally a small fault rate degrades performance,
  because page-fault service time (disk-bound) is orders of magnitude larger than memory
  access time — p = 0.001 alone produced a 41× slowdown in the worked example above.
- **Copy-on-write** lets `fork()` share pages read-only instead of copying immediately,
  copying a page only on the first write to it — which is why `fork()` immediately followed
  by `exec()`, the common case, effectively costs no copying at all.

The EAT calculation above made one thing obvious: a page-replacement algorithm's whole job
is to keep the fault rate as low as possible. Lecture 26 picks up exactly there, comparing
the algorithms operating systems actually use to decide which resident page to evict when a
fault occurs and no frame is free.
Continue to [Lecture 26 — Page Replacement Algorithms](lecture-26-page-replacement-algorithms.md).
