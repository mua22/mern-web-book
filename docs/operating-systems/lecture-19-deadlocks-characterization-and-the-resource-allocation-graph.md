---
title: "19. Deadlocks: Characterization and the Resource-Allocation Graph"
tags:
  - CSC323
  - Operating Systems
  - Deadlocks
  - Resource-Allocation Graph
---

# 19. Deadlocks: Characterization and the Resource-Allocation Graph

Picture two cars meeting on a narrow bridge wide enough for only one. Each driver, quite
reasonably, waits for the other to back up first — and if neither does, both sit there
forever, each one's progress depending on an action only the *other* driver can take. No
single driver did anything wrong in isolation; the problem only exists because of how their
two waits depend on each other. This is a **deadlock**, and operating systems create exactly
this situation constantly, just with resources instead of cars: a process holding a printer
while waiting for a scanner, and another process holding that scanner while waiting for the
printer. Lecture 18 already showed you a deadlock in a semaphore program; this lecture gives
the phenomenon a precise, general definition and a diagram you can use to spot it on sight.

## In This Lecture

- Define deadlock precisely, with both a real-world analogy and a concrete system example
- State the four necessary conditions for deadlock, and why all four must hold at once
- Read and draw a Resource-Allocation Graph (RAG): processes, resource types, instances,
  request edges, and assignment edges
- Distinguish when a cycle in a RAG *guarantees* deadlock from when it is merely a warning
  sign

## The Deadlock Problem

A set of processes is **deadlocked** when every process in the set is waiting for an event —
almost always, the release of a resource — that only another process *in that same set* can
cause. Because every process in the set is waiting on another member of the set, none of
them can ever trigger the event any of the others need, and the whole set is stuck
permanently, not just slowly.

**A concrete system example.** Suppose process `P1` holds resource `R1` and is waiting to
acquire `R2`, while process `P2` holds `R2` and is waiting to acquire `R1`. `P1` cannot
proceed until `P2` releases `R2`, and `P2` cannot proceed until `P1` releases `R1` — but
neither process will ever release the resource it holds, because releasing happens only
after a process finishes using it, and finishing is exactly what each process cannot do
while blocked. This two-process, two-resource case is the smallest possible deadlock, and
it is the example this lecture's diagrams build on directly.

!!! note "Deadlock is not the same as starvation"
    A starved process is merely unlucky — it is still possible, in principle, for the
    scheduler to eventually favor it (which is exactly what **aging**, from Lecture 17's
    scheduling unit, is designed to guarantee). A deadlocked process has no such possibility:
    no scheduling decision, however generous, can free it, because the resource it's waiting
    for will never be released by anyone. Deadlock requires outside intervention (Lecture 21)
    or must be avoided in advance (Lecture 20); it cannot resolve itself.

## The Four Necessary Conditions

Deadlock can occur only if **all four** of the following conditions hold *simultaneously*.
Break any single one of them, and deadlock becomes structurally impossible — which is
exactly the strategy deadlock *prevention* uses, and exactly why it's worth memorizing these
four individually rather than as one blurred idea.

1. **Mutual exclusion.** At least one resource involved must be held in a non-shareable
   mode — only one process can use that resource instance at a time. A printer is
   non-shareable in this sense; a read-only file mapped by several readers at once is not.
2. **Hold-and-wait.** A process must be holding at least one resource while simultaneously
   waiting to acquire additional resources held by other processes. In the example above,
   `P1` holds `R1` *while* waiting for `R2` — it does not release `R1` first.
3. **No preemption.** Resources cannot be forcibly taken away from the process holding
   them; a resource can only be released voluntarily, by the process that holds it, once
   that process has finished using it.
4. **Circular wait.** There must exist a cycle of processes `P1, P2, ..., Pn` where `P1` is
   waiting for a resource held by `P2`, `P2` is waiting for a resource held by `P3`, and so
   on, until `Pn` is waiting for a resource held by `P1` — closing the loop.

!!! warning "These are necessary conditions, not independent triggers"
    Satisfying three of the four conditions guarantees nothing — deadlock requires the
    fourth as well. A system with mutual exclusion, hold-and-wait, and no preemption but
    *no* circular wait is not deadlocked; some process can always eventually get what it
    needs. This is precisely why circular wait is the condition the Resource-Allocation
    Graph is built to detect directly.

## The Resource-Allocation Graph

A **Resource-Allocation Graph (RAG)** is a directed graph that makes a system's current
holdings and pending requests visible at a glance:

- A **process** is drawn as a circle, labeled `P1`, `P2`, and so on.
- A **resource type** is drawn as a rectangle, labeled `R1`, `R2`, and so on, with one small
  dot inside it for *each available instance* of that resource type — a rectangle with two
  dots represents a resource type that has two interchangeable instances.
- A **request edge** is a dashed arrow from a process to a resource type, meaning that
  process is currently waiting to acquire one instance of that resource type.
- An **assignment edge** is a solid arrow from a resource type to a process, meaning one
  instance of that resource type is currently allocated to that process.

Drawing the two-process example from earlier — `P1` holds `R1` and requests `R2`; `P2` holds
`R2` and requests `R1` — with a single instance of each resource type produces this graph:

<div class="os-svg-diagram" markdown>
<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="rag-arrow-1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <circle cx="100" cy="80" r="35" fill="var(--cu-surface)" stroke="#6C4FF5" stroke-width="2.5"/>
  <text x="100" y="86" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">P1</text>
  <circle cx="480" cy="80" r="35" fill="var(--cu-surface)" stroke="#6C4FF5" stroke-width="2.5"/>
  <text x="480" y="86" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">P2</text>
  <rect x="255" y="45" width="70" height="70" rx="6" fill="var(--cu-surface)" stroke="#B9720E" stroke-width="2.5"/>
  <text x="290" y="35" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="14" fill="var(--cu-text)">R1</text>
  <circle cx="290" cy="80" r="5" fill="#B9720E"/>
  <rect x="255" y="210" width="70" height="70" rx="6" fill="var(--cu-surface)" stroke="#B9720E" stroke-width="2.5"/>
  <text x="290" y="200" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="14" fill="var(--cu-text)">R2</text>
  <circle cx="290" cy="245" r="5" fill="#B9720E"/>
  <line x1="135" y1="80" x2="248" y2="80" stroke="var(--cu-muted)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rag-arrow-1)"/>
  <line x1="325" y1="80" x2="445" y2="80" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#rag-arrow-1)"/>
  <line x1="480" y1="115" x2="330" y2="230" stroke="var(--cu-muted)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rag-arrow-1)"/>
  <line x1="255" y1="230" x2="115" y2="115" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#rag-arrow-1)"/>
  <text x="300" y="305" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">Dashed = request edge · Solid = assignment edge</text>
</svg>
</div>

Reading the graph: the solid edge from `R1` to `P2` means `R1` is currently assigned to
`P2`; the dashed edge from `P1` to `R1` means `P1` is waiting for `R1`. Following the arrows
all the way around — `P1 → R1 → P2 → R2 → P1` — traces a complete cycle, which is the
graph's visual signature of a circular wait.

## Interpreting Cycles in a RAG

A cycle in a Resource-Allocation Graph is always a bad sign, but *how* bad depends entirely
on how many instances each resource type involved in the cycle has.

### Case 1: Every resource type in the cycle has exactly one instance

Here, a cycle **guarantees** deadlock. The graph drawn above is exactly this case — `R1` and
`R2` each have a single dot, meaning a single instance. Every process in the cycle is
waiting for a resource held by the very next process in the cycle, and because each of
those resources has only one instance, no third process can possibly intervene and free one
up — the instance that `P1` needs is held by `P2` and by nobody else, period. There is no
path to progress for anyone in the cycle, so deadlock is certain.

### Case 2: Some resource type in the cycle has more than one instance

Here, a cycle is **necessary but not sufficient** for deadlock — it's a warning, not a
verdict. Extend the earlier example: suppose `R1` now has **two** instances instead of one,
and a third process, `P3`, holds the second instance of `R1` but isn't waiting for anything
at all.

<div class="os-svg-diagram" markdown>
<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="rag-arrow-2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <circle cx="90" cy="75" r="32" fill="var(--cu-surface)" stroke="#6C4FF5" stroke-width="2.5"/>
  <text x="90" y="81" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">P1</text>
  <circle cx="520" cy="75" r="32" fill="var(--cu-surface)" stroke="#6C4FF5" stroke-width="2.5"/>
  <text x="520" y="81" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">P2</text>
  <circle cx="520" cy="300" r="32" fill="var(--cu-surface)" stroke="#6C4FF5" stroke-width="2.5"/>
  <text x="520" y="306" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">P3</text>
  <rect x="255" y="40" width="100" height="80" rx="6" fill="var(--cu-surface)" stroke="#B9720E" stroke-width="2.5"/>
  <text x="305" y="30" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="14" fill="var(--cu-text)">R1 (2 instances)</text>
  <circle cx="288" cy="80" r="5" fill="#B9720E"/>
  <circle cx="322" cy="80" r="5" fill="#B9720E"/>
  <rect x="265" y="225" width="70" height="70" rx="6" fill="var(--cu-surface)" stroke="#B9720E" stroke-width="2.5"/>
  <text x="300" y="215" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="14" fill="var(--cu-text)">R2</text>
  <circle cx="300" cy="260" r="5" fill="#B9720E"/>
  <line x1="255" y1="85" x2="125" y2="80" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#rag-arrow-2)"/>
  <line x1="105" y1="105" x2="265" y2="235" stroke="var(--cu-muted)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rag-arrow-2)"/>
  <line x1="320" y1="260" x2="500" y2="100" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#rag-arrow-2)"/>
  <line x1="520" y1="107" x2="350" y2="75" stroke="var(--cu-muted)" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#rag-arrow-2)"/>
  <line x1="340" y1="105" x2="505" y2="275" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#rag-arrow-2)"/>
  <text x="300" y="360" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">Dashed = request edge · Solid = assignment edge</text>
</svg>
</div>

Trace the cycle: `P1` holds one instance of `R1` and requests `R2`; `R2` is assigned to
`P2`; `P2` requests `R1`; one instance of `R1` is assigned back to `P1`, closing the loop
`P1 → R2 → P2 → R1 → P1`. The cycle genuinely exists. But `R1`'s **second** instance is
assigned to `P3`, and `P3` is not waiting for anything — it's free to run to completion and
release its instance of `R1` at any time. The moment it does, that freed instance can be
handed to `P2`, which immediately satisfies `P2`'s request, lets `P2` finish, and releases
`R2` for `P1` — the entire cycle unwinds with no deadlock at all. The cycle was real; the
deadlock was not, because an instance outside the cycle's immediate dependency could break
it.

!!! tip "The exam-ready version of this distinction"
    Count the instances of every resource type that appears in the cycle. If every single
    one has exactly one instance, stop — the cycle alone proves deadlock. If any resource
    type in the cycle has two or more instances, you cannot conclude deadlock from the cycle
    alone; you must check whether some instance of that resource type is held by a process
    *outside* the cycle that is capable of finishing and releasing it.

## Key Takeaways

- **Deadlock** is a set of processes each waiting for an event only another process in that
  same set can cause — unlike starvation, it cannot resolve itself through scheduling alone.
- The **four necessary conditions** — mutual exclusion, hold-and-wait, no preemption,
  circular wait — must **all** hold at once; breaking any single one makes deadlock
  structurally impossible, which is the basis of deadlock prevention.
- A **Resource-Allocation Graph** draws processes as circles, resource types as rectangles
  with one dot per instance, requests as dashed process→resource edges, and assignments as
  solid resource→process edges.
- A cycle where **every** resource type involved has a single instance **guarantees**
  deadlock; a cycle involving a resource type with **multiple instances** is only a warning
  sign — necessary, but not sufficient, since an uninvolved process holding another instance
  may still be able to break it.

Deadlock prevention attacks one of the four conditions directly, which costs real
flexibility in how resources can be used. Lecture 20 takes the opposite strategy —
**avoidance** — allowing all four conditions to remain possible while never actually letting
the system enter an unsafe state, built around the Banker's Algorithm:
[Lecture 20: Deadlock Avoidance and the Banker's Algorithm](lecture-20-deadlock-avoidance-and-the-bankers-algorithm.md).
