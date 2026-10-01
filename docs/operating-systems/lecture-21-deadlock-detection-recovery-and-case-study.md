---
title: "21. Deadlock Detection, Recovery, and Case Study"
tags:
  - CSC323
  - Operating Systems
  - Deadlocks
  - Windows
---

# 21. Deadlock Detection, Recovery, and Case Study

Lecture 20 showed how to keep a system safely away from deadlock in the first place, using
the Banker's Algorithm to reject any resource request that would push the system into an
unsafe state. That guarantee has a price: every process must declare, in advance, the
maximum amount of every resource it could ever request — information an operating system
often simply does not have. Most real systems — Windows very much included — do not try to
avoid deadlock at all. They let it become *possible*, and instead answer a different pair
of questions: **how do we tell a deadlock has actually happened**, and **what do we do about
it once it has?** That is this lecture's subject, closing out the deadlock unit with a look
at how one real, widely used operating system actually handles the problem in practice.

## In This Lecture

- Building a **wait-for graph** from a Resource-Allocation Graph and detecting deadlock as a
  cycle, for the single-instance-per-resource-type case
- The multi-instance **Detection Algorithm** — Available, Allocation, and Request matrices —
  and exactly how it mirrors the Banker's Algorithm's safety check from Lecture 20
- The real trade-off in **when to run** the detection algorithm: overhead vs. how long
  deadlocked processes sit stuck
- **Recovery by process termination** — abort-all vs. abort-one-at-a-time, and the cost
  factors that decide which process to pick
- **Recovery by resource preemption** — victim selection, rollback, and the starvation risk
- Case Study: how **Windows** handles synchronization without any system-wide deadlock
  detection at all

## Why Detection and Recovery, Not Just Avoidance?

Avoidance (Lecture 20) and prevention both work by refusing to let a dangerous state ever
occur. Detection and recovery take the opposite stance: let the system run freely, with no
extra bookkeeping on every single resource request, and only pay a cost *if and when* a
deadlock actually forms. This trades a constant, guaranteed overhead (checking every request
against the safety algorithm) for an occasional, larger one (periodically checking for cycles,
and cleaning up if one is found). For a system where deadlocks are rare, that trade is often
the right one.

!!! note "This approach assumes the OS allows unsafe states"
    If a system runs with no avoidance or prevention algorithm at all, unsafe states — and
    therefore deadlocks — are allowed to occur. Detection and recovery exist specifically for
    that situation: catching the problem after the fact rather than preventing it before.

## Detecting Deadlock: Single Instance of Each Resource Type

When every resource type has exactly **one** instance, detecting deadlock reduces to a clean,
cheap graph problem.

### From Resource-Allocation Graph to Wait-For Graph

Recall the Resource-Allocation Graph (RAG) from the deadlock-characterization lecture: it has
two kinds of nodes (processes and resources) and two kinds of edges (a *request* edge
Pi → Rj, and an *assignment* edge Rj → Pi). A **wait-for graph** simplifies this picture by
removing the resource nodes entirely: draw a direct edge **Pi → Pj** whenever Pi is waiting
for a resource that is currently held by Pj. Because every resource type has only one
instance, this collapse is always unambiguous — "Pi waits for a resource held by Pj" has
exactly one Pj to point to.

**Worked example.** Three processes, P1, P2, P3, each holding one resource the next process
in line is waiting for:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Wait-for graph — a cycle means deadlock</p>
<div class="db-flow" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">P1</span>
<span class="db-node-sub">Waiting for a resource held by P2</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">P2</span>
<span class="db-node-sub">Waiting for a resource held by P3</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">P3</span>
<span class="db-node-sub">Waiting for a resource held by P1</span>
</div>
</div>
</div>

Read the arrows: P1 → P2 → P3 → **P1** again. That closes a cycle, and in a single-instance
wait-for graph, a cycle is not just evidence of deadlock — it is a complete proof of it. None
of P1, P2, or P3 can ever make progress: each is waiting on the next, and the chain loops back
on itself with no external process able to break it.

### Detecting the Cycle

The OS (or a dedicated detection routine) periodically builds this graph from its current
bookkeeping of who holds what and who is waiting for what, and runs a cycle-detection search
(a straightforward depth-first search works, costing roughly `O(n²)` edge checks for `n`
processes). No cycle means no deadlock — every process can, eventually, finish. Any cycle
found means every process on that cycle is deadlocked.

!!! tip "A cycle is both necessary and sufficient here"
    This clean equivalence — deadlock **if and only if** a cycle exists — only holds because
    each resource type has a single instance. The moment a resource type can have multiple
    instances (two printers, say), a cycle in the *graph* no longer guarantees deadlock, because
    one of the processes on the cycle might be able to proceed using a *different* instance of
    the same resource type. That is exactly why multiple instances need a different, more
    careful algorithm — covered next.

## Detecting Deadlock: Multiple Instances of a Resource Type

### Data Structures: Available, Allocation, and Request

With multiple instances per resource type, the detection algorithm reuses almost exactly the
same data-structure shape as the Banker's Algorithm's safety check from Lecture 20 — which is
well worth noticing explicitly, because it means you already understand most of this
algorithm:

| Structure | Shape | Meaning |
|---|---|---|
| `Available` | vector, length *m* | Instances of each resource type currently free |
| `Allocation` | matrix, *n* × *m* | Instances of each resource type currently held by each process |
| `Request` | matrix, *n* × *m* | Instances of each resource type each process is **currently** requesting |

The one real difference from the Banker's Algorithm is what the second matrix means. The
Banker's Algorithm needed `Max` (a process's *declared maximum possible* future demand) to
compute `Need = Max − Allocation`. The Detection Algorithm has no such promise to work with —
there is no `Max` here, because a system running without avoidance never asked processes to
declare one. Instead, `Request` records only what a process is *actually, currently* blocked
waiting for, right now. Everything else — the `Work` vector that grows as processes are
provisionally allowed to finish, the comparison `Request(i) ≤ Work`, the way finishing a
process releases its `Allocation(i)` back into `Work` — is the identical mechanical idea as
the Banker's safety algorithm, just checking real current requests instead of a hypothetical
worst case.

### The Detection Algorithm

1. **Initialize** `Work = Available`. For every process `i`, set `Finish[i] = false` — unless
   `Allocation(i)` is already all zeros, in which case `Finish[i] = true` immediately (a
   process holding nothing cannot be part of a deadlock).
2. **Find** an index `i` such that `Finish[i] = false` **and** `Request(i) ≤ Work`
   (component-wise). If no such `i` exists, go to step 4.
3. Having found such an `i`: set `Work = Work + Allocation(i)` and `Finish[i] = true` — this
   process can obtain what it's asking for, run to completion, and release everything it
   holds. Go back to step 2.
4. **Stop.** If `Finish[i] = false` for some process `i`, the system is in a **deadlocked
   state**, and specifically, every process with `Finish[i] = false` is deadlocked.

This is line-for-line the Banker's safety algorithm's loop, with `Request` standing in for
`Need`. The only new idea is step 4's conclusion: instead of "every process finished, so the
state is safe," an unfinished process here means an *actual*, present-tense deadlock — not a
hypothetical risk.

### Worked Example

Three resource types — A, B, C — with four processes, P0–P3. The system is fully committed
right now: `Available = (0, 0, 0)`.

<div class="db-relation" markdown>
<div class="db-relation-name">Allocation and Request — current state</div>

| Process | Allocation (A, B, C) | Request (A, B, C) |
|---|---|---|
| P0 | (1, 0, 2) | (0, 0, 0) |
| P1 | (2, 1, 1) | (4, 0, 0) |
| P2 | (2, 1, 2) | (1, 0, 1) |
| P3 | (1, 1, 0) | (0, 2, 0) |

</div>

(As a sanity check: the column totals of `Allocation` are `(6, 3, 5)` — add `Available =
(0,0,0)` and the system's total resource counts are `A = 6`, `B = 3`, `C = 5`, exactly
accounted for.)

Run the algorithm:

- **Initialize.** `Work = (0, 0, 0)`. All of `Finish[P0..P3] = false`.
- **Round 1.** Check each unfinished process's `Request` against `Work = (0,0,0)`:
    - P0: `(0,0,0) ≤ (0,0,0)` ✓ — select P0.
    - `Work = (0,0,0) + Allocation(P0) = (0,0,0) + (1,0,2) = (1, 0, 2)`. `Finish[P0] = true`.
- **Round 2.** `Work = (1, 0, 2)`:
    - P1: `(4,0,0) ≤ (1,0,2)`? `4 > 1` on the A component — **no**.
    - P2: `(1,0,1) ≤ (1,0,2)`? `1≤1, 0≤0, 1≤2` — ✓ — select P2.
    - `Work = (1,0,2) + Allocation(P2) = (1,0,2) + (2,1,2) = (3, 1, 4)`. `Finish[P2] = true`.
- **Round 3.** `Work = (3, 1, 4)`:
    - P1: `(4,0,0) ≤ (3,1,4)`? `4 > 3` on the A component — no.
    - P3: `(0,2,0) ≤ (3,1,4)`? `2 > 1` on the B component — no.
    - No process found. **Stop.**

`Finish[P0] = true`, `Finish[P2] = true` — those two finish cleanly. `Finish[P1] = false`,
`Finish[P3] = false` — **P1 and P3 are deadlocked**. Notice this is a genuine conclusion, not
a guess: no matter what order you tried the remaining checks in, `Work` is frozen at
`(3, 1, 4)` forever once P0 and P2 are done, since neither P1 nor P3 can ever finish to feed
anything more back into it. P0 and P2 were never part of the deadlock at all — they simply
ran to completion before the detection algorithm was even asked the question.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Outcome of the detection algorithm</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">P0, P2 — Finish = true</span>
<span class="db-node-sub">Requests satisfied in order P0 → P2; not deadlocked</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">P1, P3 — Finish = false</span>
<span class="db-node-sub">Requests can never be satisfied with the remaining Work; deadlocked</span>
</div>
</div>
</div>

## When and How Often to Run the Detection Algorithm

Running the detection algorithm costs CPU time — `O(m·n²)` in the worst case, for `m`
resource types and `n` processes — so running it after *every single* resource request, the
way the Banker's Algorithm must, is usually overkill. Two practical policies dominate in
practice:

- **Run it on a fixed schedule** — e.g., once every `N` minutes. Simple and predictable, but
  the choice of `N` is a direct trade-off: a short interval catches deadlocks quickly but
  spends more CPU time checking for something that is usually not there; a long interval
  wastes less CPU but lets deadlocked processes — and every resource they're holding hostage
  — sit frozen for longer between checks.
- **Run it when there's a symptom** — most commonly, when CPU utilization drops below some
  threshold (say, 40%). A sudden, sustained drop in utilization is exactly what you would
  expect if a growing number of processes are blocked waiting on each other instead of doing
  useful work, so it's a cheap, indirect signal that something might be worth checking for
  directly.

!!! tip "There's no universally correct interval"
    The right choice depends entirely on how expensive a deadlocked process is to leave stuck
    (a background batch job can wait; a process holding a lock needed by an interactive
    front-end cannot) against how expensive the detection algorithm itself is on that
    particular system (how many processes and resource types there are to check). This is a
    genuine systems-engineering trade-off, not a fixed rule.

## Recovering From Deadlock

Detecting a deadlock only tells you it exists — the system still has to get itself out of it.
There are two broad strategies.

### Process Termination

The blunt-force option: kill one or more of the deadlocked processes to break the cycle.

- **Abort all deadlocked processes at once.** Simple, and guaranteed to clear the deadlock
  immediately — but wasteful, since some of those processes might have been only one step
  away from finishing and releasing what they held, and all of that partial work is thrown
  away.
- **Abort one process at a time**, re-running the detection algorithm after each kill to check
  whether the cycle is now broken, stopping as soon as it is. This does less unnecessary
  damage, at the cost of repeatedly re-running detection.

Picking *which* process to abort first, in the one-at-a-time approach, is itself a decision
made by weighing several factors — effectively a victim-selection cost function:

- **Priority** — low-priority processes are generally cheaper to sacrifice than high-priority ones.
- **How long it has run, and how much more it needs to run to finish** — a process that just
  started has lost little work if killed; one close to finishing has lost much more.
- **Resources already held** — killing a process holding many resources frees more of the
  deadlock at once, but at greater cost if that work is thrown away.
- **Resources it would still need to finish** — a process that needs very few more resources
  might be close to finishing on its own, making it a poor choice to kill.

### Resource Preemption

A gentler alternative to killing anything: forcibly take a resource away from one of the
deadlocked processes and give it to another, breaking the cycle without ending any process
outright. Three sub-problems have to be solved to make this work:

1. **Select a victim resource** — using a similar cost function to process termination (which
   resource's removal costs the least to undo).
2. **Roll back the affected process** — since snatching a resource away mid-use leaves that
   process in an inconsistent state, it must be rolled back to some earlier point — ideally the
   most recent *safe* state it was in before the deadlock formed, rather than restarted from
   scratch.
3. **Prevent starvation** — if the same process is repeatedly chosen as the victim every time
   preemption runs, it may never make progress at all, even though it is never actually the
   one that gets killed. The standard fix: include the number of times a process has already
   been picked as a victim inside the cost function, and cap it — a process can only be
   selected as the victim a **bounded number of times** before some other tie-breaking rule
   forces a different choice.

!!! warning "Rollback is only cheap if the system already tracks safe checkpoints"
    Rolling a process back to "some earlier state" is easy to say and hard to do well — it
    requires the OS (or the application) to have been recording checkpoints the process can
    actually be restored to. Without that bookkeeping, "rollback" degenerates into "restart
    from the beginning," which is exactly as wasteful as the abort-all strategy above.

## Case Study: Synchronization and Deadlock Handling in Windows

Windows takes a deliberately hands-off position on deadlock. It does **not** run any
system-wide deadlock detection, and it does not implement deadlock avoidance or prevention at
the operating-system level either. What it provides instead is a set of well-built
**synchronization primitives** and leaves the responsibility for avoiding deadlock entirely
to the application developer:

- **Dispatcher objects** — kernel objects such as mutexes, semaphores, and events that threads
  wait on via calls like `WaitForSingleObject` and `WaitForMultipleObjects`. These give an
  application the building blocks to coordinate access to shared resources, but Windows itself
  makes no attempt to check whether the way an application *uses* them can ever form a cycle.
- **Critical sections** — a lighter-weight, user-mode mutual-exclusion primitive for
  synchronizing threads within a single process, faster than a kernel-mode mutex precisely
  because it usually never has to cross into the kernel at all.
- **Timeout parameters on wait calls** — the one concrete, pragmatic mitigation Windows does
  offer. A thread calling `WaitForSingleObject` can pass a timeout instead of waiting forever;
  if the wait expires, the thread gets control back and can decide what to do — retry, give up,
  report an error — rather than being stuck in a deadlock indefinitely. This doesn't *detect* a
  deadlock in any formal sense, but it stops a careless design from freezing a thread
  permanently.

!!! note "Why this is a reasonable design choice, not a shortcut"
    System-wide deadlock detection has real runtime cost, and avoidance algorithms like the
    Banker's Algorithm require every process to declare its maximum resource needs up front —
    information general-purpose desktop and server applications essentially never provide.
    Rather than pay that cost for a guarantee most applications don't need, Windows gives
    developers fast, flexible primitives and the tools (timeouts chief among them) to defend
    against deadlock themselves, at the application level, where the actual resource-usage
    pattern is best understood.

## Key Takeaways

- With a **single instance** per resource type, collapse the Resource-Allocation Graph into a
  **wait-for graph** (Pi → Pj if Pi waits for a resource held by Pj) — a **cycle** is both
  necessary and sufficient proof of deadlock.
- With **multiple instances** per resource type, the **Detection Algorithm** uses `Available`,
  `Allocation`, and `Request` matrices and runs exactly like the Banker's Algorithm's safety
  check, with `Request` (what's actually being asked for right now) standing in for `Need`.
  Processes left with `Finish[i] = false` are deadlocked.
- When to run detection is a genuine trade-off between overhead and how long deadlocked
  processes sit stuck — common policies are a **fixed interval** or a **CPU-utilization
  threshold** trigger.
- **Recovery by termination** can abort all deadlocked processes at once (simple, wasteful) or
  one at a time with re-detection after each (less wasteful, more overhead), choosing the
  victim by priority, runtime so far, resources held, and resources still needed.
- **Recovery by resource preemption** selects a victim resource and rolls its process back to
  a safe state, but risks **starvation** if the same process is always chosen — fixed by
  bounding how many times any one process can be picked as a victim.
- **Windows** does not run system-wide deadlock detection or avoidance; it provides
  synchronization primitives (dispatcher objects, critical sections) and a pragmatic escape
  hatch (wait timeouts), leaving deadlock avoidance to the application developer.

With deadlocks fully covered — characterization, avoidance, detection, and recovery — the
course now turns to the other half of the operating system's resource-management job: memory.
Continue to
[Lecture 22 — Memory Management Fundamentals](lecture-22-memory-management-fundamentals.md).
