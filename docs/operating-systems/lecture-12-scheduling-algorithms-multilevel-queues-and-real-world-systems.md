---
title: "12. Scheduling Algorithms: Multilevel Queues and Real-World Systems"
tags:
  - CSC323
  - Operating Systems
  - CPU Scheduling
  - Multilevel Feedback Queue
  - Linux CFS
---

# 12. Scheduling Algorithms: Multilevel Queues and Real-World Systems

Lecture 11 ended with an unresolved tension: priority scheduling respects importance but
can starve a low-priority process; Round Robin is fair but blind to importance, treating a
background batch job exactly like an interactive process a human is staring at. Neither
algorithm, used alone, is what a real desktop or server operating system actually runs.
This lecture shows how production schedulers resolve the tension — by combining several
simpler algorithms into one layered structure — and closes the unit by looking at what two
real operating systems, Linux and Windows, actually do.

## In This Lecture

- **Multilevel queue** scheduling: partitioning the ready queue by process type
- **Multilevel feedback queue** scheduling: letting processes move between queues based on
  observed behavior, and why that approximates SJF without knowing burst lengths in advance
- How **thread scheduling** connects back to Lecture 9's multithreading models via
  **contention scope**
- Linux's **Completely Fair Scheduler (CFS)** and a brief look at Windows' scheduler

## Multilevel Queue Scheduling

A **multilevel queue** scheduler splits the single ready queue into several **separate**
queues, grouped by process type — commonly a queue for interactive, **foreground**
processes and a different queue for CPU-bound **background** (batch) processes. Each queue
can run its *own* scheduling algorithm internally (the foreground queue might use Round
Robin, for responsiveness; the background queue might use FCFS, since nobody is watching it
in real time), and a separate policy decides how the CPU is shared *between* the queues —
usually either a **fixed priority** (always service the foreground queue first, and only
run the background queue when the foreground queue is completely empty) or **time
slicing** between queues (e.g., 80% of CPU time to foreground, 20% to background,
regardless of how full each queue currently is).

<div class="db-diagram" markdown>
<p class="db-diagram-label">A multilevel queue, foreground vs. background</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Foreground queue</span> <span class="db-node-sub">— interactive processes, scheduled with Round Robin; serviced first (or given the larger time slice)</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Background queue</span> <span class="db-node-sub">— CPU-bound batch processes, scheduled with FCFS; runs only when foreground is empty (or given the smaller time slice)</span></div>
</div>
</div>

Multilevel queue scheduling is simple and lets each class of process be scheduled
appropriately, but it has one structural weakness: a process assigned to a queue stays in
that queue for its entire lifetime. A process that was classified as "background" at
creation time is stuck there even if its actual behavior turns out to look nothing like a
batch job.

## Multilevel Feedback Queue Scheduling

A **multilevel feedback queue (MLFQ)** fixes exactly that weakness by letting processes
**move between queues** based on how they actually behave, observed at run time rather than
assumed at creation time. The usual arrangement stacks several queues by priority, each
with its own (typically larger) time quantum the lower it sits, and applies two simple
rules:

- A process that **uses its entire time quantum** without blocking is behaving like a
  CPU-bound process — it gets **demoted** to the next, lower-priority queue, which has a
  *longer* quantum (fewer context switches, since this process doesn't seem to need to be
  checked on frequently).
  - A process that **blocks on I/O before its quantum expires** is behaving like an
  I/O-bound, interactive process — it **stays in its current queue** (or is moved back up to
  a higher one), so that the next time it's ready, it gets serviced quickly.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Multilevel feedback queue: three levels, demotion on a full quantum</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Q0 — highest priority</span>
<span class="db-node-sub">Round Robin, quantum = 4</span>
</div>
<div class="db-arrow"><span class="db-arrow-label">quantum fully used → demote</span></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Q1 — medium priority</span>
<span class="db-node-sub">Round Robin, quantum = 8</span>
</div>
<div class="db-arrow"><span class="db-arrow-label">quantum fully used → demote</span></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Q2 — lowest priority</span>
<span class="db-node-sub">FCFS, runs to completion or I/O block</span>
</div>
</div>
</div>

### Worked Example: One Process Moving Down the Queues

Suppose this three-level MLFQ (Q0, quantum 4; Q1, quantum 8; Q2, FCFS) receives one
CPU-bound process, P, with a single burst of 20, and every queue is otherwise empty. P
enters at the top, Q0:

- In **Q0**, P runs for the full quantum, 4 units (t=0 → 4), without blocking —
  remaining burst 20-4=16. Quantum fully used → **demoted to Q1**.
- In **Q1**, P runs for the full quantum, 8 units (t=4 → 12) — remaining
  16-8=8. Quantum fully used again → **demoted to Q2**.
- In **Q2** (FCFS — no quantum to expire), P simply runs to completion: its remaining 8
  units, t=12 → 20.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: one CPU-bound process sinking from Q0 to Q2</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4;">P (Q0)</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 8;">P (Q1)</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 8;">P (Q2)</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 4;">0</span>
<span style="flex-grow: 8;">4</span>
<span style="flex-grow: 8;">12</span>
<span>20</span>
</div>
</div>
</div>

Had P instead been a short, interactive process with a burst of only 3, it would have
finished entirely within its very first Q0 turn — never demoted at all, completing at
t=3 without ever waiting behind P's remaining 17 units of work. That's the key property:
**MLFQ never needs to know a process's burst length in advance** the way SJF does — it
simply watches whether a process keeps using its *entire* quantum, and demotes it when it
does. A genuinely short process is, by definition, unlikely to ever use a full quantum
before finishing or blocking, so it naturally stays near the top, getting serviced quickly
— while a genuinely long, CPU-bound process naturally sinks toward the bottom, where longer
quanta mean fewer wasted context switches. The result **approximates SJF's behavior**
(favor short jobs) using only information the scheduler can actually observe, which is why
MLFQ is considered the most general scheduling approach, and the one most real-world
systems are built around in some form.

!!! note "MLFQ is defined by its rules, not by one fixed configuration"
    The number of queues, each queue's quantum, and the exact promotion/demotion rules are
    all parameters a specific operating system chooses — there is no single canonical MLFQ.
    What makes an algorithm "an MLFQ" is simply the *shape* of the idea: multiple priority
    levels, and movement between them driven by observed behavior rather than a fixed,
    permanent classification.

## Thread Scheduling and Contention Scope

[Lecture 9](lecture-09-multicore-programming-and-multithreading-models.md) distinguished
**user threads**, managed by a thread library, from **kernel threads**, scheduled directly
by the OS. That distinction has a direct consequence for *which* scheduler actually decides
when a thread runs, called its **contention scope**:

- **Process-contention scope (PCS)** — under the many-to-one or many-to-many models, the
  *thread library* itself decides which of a process's own user threads runs next, on
  whichever kernel thread(s) that process has. Threads only compete against *other threads
  in the same process*.
- **System-contention scope (SCS)** — under the one-to-one model, the kernel schedules
  every thread directly, so a thread competes for the CPU against *every other thread on
  the system*, regardless of which process it belongs to.

The Pthreads API exposes this choice directly through `pthread_attr_setscope()`, which
takes either `PTHREAD_SCOPE_PROCESS` (PCS) or `PTHREAD_SCOPE_SYSTEM` (SCS) — though, as
Lecture 9 noted, Linux's one-to-one model makes SCS the only scope that actually matches
its underlying kernel threading, so the distinction matters far more on systems that
genuinely support many-to-many scheduling.

## Real-World Scheduling: Linux's CFS

Linux's default scheduler since kernel 2.6.23, the **Completely Fair Scheduler (CFS)**,
abandons fixed time quanta and priority numbers in favor of one running number per task:
**virtual runtime (vruntime)**, which tracks how much CPU time a task has *already*
received, weighted by its priority. CFS's entire scheduling rule is just: **always run the
ready task with the smallest vruntime**. A task that has run less than others (smaller
vruntime) is, by definition, "owed" more CPU time to stay fair, so it's the one that runs
next; the moment it runs, its vruntime climbs, and eventually some other task becomes the
one with the smallest vruntime instead.

A simplified trace with three equal-priority tasks, each getting a small slice of 2 time
units whenever it's chosen, with all vruntimes starting at 0, shows the rule in action:

| Decision | Vruntimes before (A, B, C) | Task chosen (smallest vruntime) | Vruntimes after |
|---|---|---|---|
| 1 | 0, 0, 0 | A (tie, chosen first) | 2, 0, 0 |
| 2 | 2, 0, 0 | B | 2, 2, 0 |
| 3 | 2, 2, 0 | C | 2, 2, 2 |
| 4 | 2, 2, 2 | A (tie again) | 4, 2, 2 |

With equal priority, CFS's min-vruntime rule converges to exactly the same round-robin
rotation Lecture 11 already covered — each task runs, falls behind no one, and gets picked
again once everyone else catches up. The real payoff shows up once priorities (Linux calls
them **nice values**) differ: a higher-priority task's vruntime is scaled to grow *more
slowly* per unit of actual CPU time it receives, so it reaches the "smallest vruntime"
threshold again sooner and gets scheduled more often — all without CFS ever needing a
separate queue per priority level, a fixed quantum, or any of MLFQ's explicit demotion
rules. This single running number is what lets CFS approximate an *ideal*, perfectly fair
division of the CPU proportional to priority, across any number of tasks.

## Real-World Scheduling: Windows

Windows uses a **priority-based, preemptive scheduler** with 32 priority levels, organized
into priority classes a process belongs to and relative priorities within that class for
each of its threads. Structurally it behaves like a multilevel-feedback-queue system:
threads at higher priority levels preempt lower ones, and Windows dynamically *boosts* the
priority of a thread that just finished waiting on I/O (rewarding interactive,
I/O-bound behavior, exactly as MLFQ's "stay near the top if you block before your quantum
expires" rule does) while *decaying* that boost back down over time as the thread
continues to run — the same underlying idea as MLFQ's demotion rule, implemented through
dynamic priority adjustment rather than literally moving a thread between separate queue
data structures.

## Key Takeaways

- **Multilevel queue** scheduling partitions the ready queue by process type, each with its
  own algorithm, but permanently fixes which queue a process belongs to.
- **Multilevel feedback queue** scheduling lets processes move between queues based on
  observed behavior — using a full quantum demotes a process toward longer-quantum, lower-
  priority queues, while blocking early keeps it near the top — which approximates SJF
  without ever needing to know burst lengths in advance, and is the most general,
  widely-used scheduling approach in practice.
- **Contention scope** connects back to Lecture 9's multithreading models: process-
  contention scope (PCS) under many-to-one/many-to-many, system-contention scope (SCS)
  under one-to-one, selectable in Pthreads via `pthread_attr_setscope()`.
- Linux's **CFS** replaces quanta and priority queues with a single number, **vruntime**,
  always running the ready task with the smallest value — approximating ideal fair sharing
  directly.
- **Windows** runs a 32-level, priority-based preemptive scheduler that boosts a thread's
  priority after I/O waits and decays it with continued CPU use — the same underlying idea
  as MLFQ's demotion rule, applied through dynamic priority rather than separate queues.

This closes the CPU scheduling unit. Every algorithm in it assumed processes simply take
turns on the CPU safely — but preemption, as Lecture 10 warned, can interrupt a process in
the middle of updating shared data. Continue to
[Lecture 13 — Race Conditions and the Critical Section Problem](lecture-13-race-conditions-and-the-critical-section-problem.md),
where that assumption finally gets examined.
