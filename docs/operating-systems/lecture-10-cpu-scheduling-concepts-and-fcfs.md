---
title: "10. CPU Scheduling: Concepts and FCFS"
tags:
  - CSC323
  - Operating Systems
  - CPU Scheduling
  - FCFS
  - Convoy Effect
---

# 10. CPU Scheduling: Concepts and FCFS

Every process you've met so far — in [Lecture 6](lecture-06-process-concept-and-process-states.md)'s
process states, in [Lecture 8](lecture-08-introduction-to-threads-and-concurrency.md)'s
threads — spends its life bouncing between two states: actually using the CPU, and waiting
for something else (usually I/O) to finish. A **multiprogrammed** operating system keeps
several processes in memory at once specifically so that, the instant one process stops
needing the CPU, another one that's ready can start immediately — the CPU is simply too
valuable a resource to ever sit idle while useful work is waiting. **CPU scheduling** is the
set of policies that decide, every time the CPU becomes free, exactly *which* ready process
gets it next. This lecture builds the vocabulary every scheduling algorithm is described
with, then works through the simplest possible policy — First-Come, First-Served — in
enough numeric detail to expose its biggest weakness.

## In This Lecture

- Why CPU scheduling exists: maximizing CPU utilization by always having something ready
  to run
- The **CPU burst / I/O burst** cycle, and how its typical shape drives scheduling theory
- The **CPU scheduler** vs. the **dispatcher** — selecting a process vs. actually switching
  to it
- **Preemptive** vs. **non-preemptive** scheduling
- The five standard **scheduling criteria**: utilization, throughput, turnaround time,
  waiting time, response time
- **First-Come, First-Served (FCFS)** scheduling, worked through a full numeric example —
  and the **convoy effect** it exposes

## Why CPU Scheduling Exists

A single CPU can run exactly one process's instructions at any given instant. The whole
point of **multiprogramming** is to keep several processes in memory simultaneously so
that when the currently running process needs to wait — almost always for I/O, which is
orders of magnitude slower than the CPU itself — the operating system can immediately switch
the CPU to a *different* process that's ready to run, instead of leaving the CPU idle while
the first process waits. CPU scheduling is the policy layer that decides, among every
process sitting in the **ready queue**, which one gets the CPU next. Done well, the CPU is
almost never idle while there's ready work sitting in the queue; done poorly, the CPU sits
idle constantly even though the system is full of processes that would happily use it.

## The CPU Burst / I/O Burst Cycle

A running process's life alternates between two kinds of activity:

- A **CPU burst** — a stretch of time spent executing instructions, using the CPU and
  nothing else.
- An **I/O burst** — a stretch of time spent waiting on an I/O operation (reading a file,
  waiting on a network response), during which the process cannot use the CPU at all.

<div class="db-diagram" markdown>
<p class="db-diagram-label">A process's execution as alternating bursts</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">CPU burst</span>
<span class="db-node-sub">Executing instructions</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">I/O burst</span>
<span class="db-node-sub">Waiting on disk / network</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">CPU burst</span>
<span class="db-node-sub">Executing instructions</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">I/O burst</span>
<span class="db-node-sub">Waiting on disk / network</span>
</div>
</div>
</div>

A process alternates between these two kinds of bursts until it terminates, and every CPU
scheduling algorithm is, at its core, a policy about which process's *next CPU burst* gets
to run. The **distribution** of CPU burst lengths across real programs has a very
characteristic, heavily skewed shape: a huge number of short bursts (a program checking a
condition, updating one variable, then immediately issuing another I/O request), and a
small number of much longer bursts (a program doing genuinely CPU-bound computation, like
compressing a file). This skew is not a minor detail — Lecture 11's entire justification for
**Shortest-Job-First** scheduling rests on it: if most bursts really are short, then a
policy that favors short bursts helps nearly everyone, at the cost of making the rare long
burst wait a bit longer.

!!! note "I/O-bound vs. CPU-bound processes"
    A process dominated by many short CPU bursts separated by I/O waits is called
    **I/O-bound**; a process dominated by long CPU bursts with only occasional, infrequent
    I/O is **CPU-bound**. A healthy scheduling policy needs to treat both kinds of process
    well, which turns out to be harder than it sounds — favor CPU-bound processes and
    I/O-bound ones feel sluggish; favor I/O-bound processes and CPU-bound ones never finish.

## The CPU Scheduler and the Dispatcher

Two distinct pieces of OS code cooperate every time the CPU changes hands:

- The **CPU scheduler** (also called the *short-term scheduler*) is the decision-maker — it
  looks at the ready queue and selects which process runs next, according to whatever
  scheduling algorithm is in effect.
- The **dispatcher** is the mechanism — once the scheduler has *decided*, the dispatcher
  actually performs the **context switch**: saving the old process's CPU state, loading the
  new process's CPU state, and switching the CPU into user mode at the new process's next
  instruction.

The time the dispatcher spends performing this switch — pure bookkeeping overhead that does
no useful work for either process — is called **dispatch latency**. Every context switch,
however the scheduler chose it, pays this cost, which is exactly why Lecture 11's discussion
of Round Robin's time-quantum size treats *too many* context switches as a real performance
problem, not just an abstract inefficiency.

## Preemptive vs. Non-Preemptive Scheduling

A scheduling algorithm is **non-preemptive** if, once a process is given the CPU, it keeps
the CPU until it either voluntarily gives it up (by blocking on I/O) or terminates — the
scheduler can only make a new decision at those moments. A scheduling algorithm is
**preemptive** if the operating system can forcibly take the CPU away from a running
process before it's finished or blocked — for instance, because a higher-priority process
just became ready, or because a fixed time slice expired.

Preemption sounds strictly better — why *wouldn't* you want the flexibility to interrupt a
process? — but it introduces a real cost that single-core concurrency warned about all the
way back in Lecture 9's "testing and debugging" challenge: a process can be preempted at
*any* point in its execution, including in the middle of updating a piece of data that's
shared with another process. If that data is left half-updated when the preemption happens,
and the process that runs next reads or modifies that same data, the result can be
corrupted in a way that's extremely hard to reproduce. This is exactly the problem the
upcoming synchronization unit (starting at
[Lecture 13](lecture-13-race-conditions-and-the-critical-section-problem.md)) exists to
solve — preemptive scheduling is what makes synchronization necessary in the first place,
not an optional add-on to it.

## Scheduling Criteria

Comparing scheduling algorithms needs precise, agreed-upon measurements. These five are
the standard ones, and are frequently confused with each other — read each definition
carefully, especially the last two.

- **CPU utilization** — the percentage of time the CPU is doing useful work rather than
  sitting idle. Higher is better; a heavily loaded real system aims for something like
  90–100%.
- **Throughput** — the number of processes *completed* per unit of time. Higher is better.
- **Turnaround time (TAT)** — the total time from when a process *arrives* in the system to
  when it *finishes*, including every bit of time spent waiting in the ready queue, running
  on the CPU, and waiting on I/O. **TAT = completion time − arrival time.**
- **Waiting time** — the total time a process spends sitting in the ready queue, *not*
  running and *not* doing I/O — purely waiting for its turn at the CPU. Waiting time is
  turnaround time minus every bit of time actually spent running or doing I/O; for the
  single-CPU-burst examples in this unit, that simplifies to
  **waiting time = turnaround time − burst time.**
- **Response time** — the time from when a process *arrives* (or, for an already-running
  interactive process, from when a request is submitted) to when it produces its *first*
  output — not when it finishes, just when it starts visibly responding. For an interactive
  system, response time is what the user actually perceives as "snappy" or "sluggish."

!!! warning "Waiting time and turnaround time are not the same number"
    Turnaround time counts *everything* from arrival to completion — the full lifetime.
    Waiting time counts only the ready-queue portion of that lifetime. A process with a
    long CPU burst can have a *short* waiting time (if it starts immediately) and still a
    *long* turnaround time (because the burst itself takes a while) — the two numbers
    measure genuinely different things, and every worked example in this unit reports both.

## First-Come, First-Served (FCFS)

**FCFS** is the simplest possible scheduling algorithm: whichever process arrives in the
ready queue *first* gets the CPU first, and keeps it until it finishes (FCFS is
non-preemptive). It's implemented with nothing more than a plain FIFO queue — easy to
understand, easy to implement, and, as the worked example below shows, capable of
performing quite badly.

### Worked Example: FCFS Scheduling

Consider four processes arriving at the times shown, with the CPU burst lengths given:

| Process | Arrival Time | Burst Time |
|---|---|---|
| P1 | 0 | 20 |
| P2 | 1 | 4 |
| P3 | 2 | 2 |
| P4 | 3 | 1 |

All four processes are ready to run well before P1 finishes, so FCFS simply runs them in
the order they arrived: P1, then P2, then P3, then P4.

- **P1** starts the instant it arrives, at t=0, and runs for its full burst of 20, finishing
  at t=20.
- **P2** arrived at t=1 but the CPU is busy with P1 until t=20; P2 starts at t=20 and
  runs for 4, finishing at t=24.
- **P3** arrived at t=2, starts at t=24, runs for 2, finishes at t=26.
- **P4** arrived at t=3, starts at t=26, runs for 1, finishes at t=27.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: FCFS schedule, arrival order P1, P2, P3, P4</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 20;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4;">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 2;">P3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 1;">P4</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 20;">0</span>
<span style="flex-grow: 4;">20</span>
<span style="flex-grow: 2;">24</span>
<span style="flex-grow: 1;">26</span>
<span>27</span>
</div>
</div>
</div>

Waiting time is start time minus arrival time; turnaround time is completion time minus
arrival time:

| Process | Arrival | Burst | Start | Completion | Waiting Time | Turnaround Time |
|---|---|---|---|---|---|---|
| P1 | 0 | 20 | 0 | 20 | 0-0=0 | 20-0=20 |
| P2 | 1 | 4 | 20 | 24 | 20-1=19 | 24-1=23 |
| P3 | 2 | 2 | 24 | 26 | 24-2=22 | 26-2=24 |
| P4 | 3 | 1 | 26 | 27 | 26-3=23 | 27-3=24 |

**Average waiting time = (0 + 19 + 22 + 23) / 4 = 64 / 4 = 16**

**Average turnaround time = (20 + 23 + 24 + 24) / 4 = 91 / 4 = 22.75**

Notice how badly P2, P3, and P4 fare — each of them has a tiny burst (4, 2, and 1 units),
yet each waits roughly twenty units purely because they had the misfortune of arriving
just after a long process. This is the **convoy effect**: one long CPU-bound process holds
the CPU, and a whole convoy of short processes piles up behind it in the ready queue, each
one waiting far longer than its own burst would ever justify — much like a slow truck on a
single-lane road backing up every car behind it, however briefly each car itself needs the
road.

### The Convoy Effect, Made Concrete

To see just how much the *arrival order* alone — not the total amount of work, which is
identical — can swing these averages, run the exact same four burst lengths through FCFS
again, but suppose they had arrived in the opposite order: shortest burst first, longest
burst last.

| Process | Arrival Time | Burst Time |
|---|---|---|
| Q1 | 0 | 1 |
| Q2 | 1 | 2 |
| Q3 | 2 | 4 |
| Q4 | 3 | 20 |

- **Q1** starts at t=0, runs 1, finishes at t=1.
- **Q2** arrived at t=1, starts at t=1, runs 2, finishes at t=3.
- **Q3** arrived at t=2, starts at t=3, runs 4, finishes at t=7.
- **Q4** arrived at t=3, starts at t=7, runs 20, finishes at t=27.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: same four burst lengths, short-to-long arrival order</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 1;">Q1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 2;">Q2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4;">Q3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 20;">Q4</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 1;">0</span>
<span style="flex-grow: 2;">1</span>
<span style="flex-grow: 4;">3</span>
<span style="flex-grow: 20;">7</span>
<span>27</span>
</div>
</div>
</div>

| Process | Arrival | Burst | Start | Completion | Waiting Time | Turnaround Time |
|---|---|---|---|---|---|---|
| Q1 | 0 | 1 | 0 | 1 | 0 | 1 |
| Q2 | 1 | 2 | 1 | 3 | 0 | 2 |
| Q3 | 2 | 4 | 3 | 7 | 1 | 5 |
| Q4 | 3 | 20 | 7 | 27 | 4 | 24 |

**Average waiting time = (0 + 0 + 1 + 4) / 4 = 5 / 4 = 1.25**

Same four burst lengths (1, 2, 4, 20 in both scenarios), same total work, same final
completion time (t=27 either way) — and yet average waiting time fell from **16** to
**1.25** purely by changing which process happened to arrive first. FCFS's performance is
entirely at the mercy of arrival order, and it has no mechanism whatsoever to notice that a
newly-arrived process is short and let it cut ahead of a long one already running — because
FCFS is non-preemptive, once the long process starts, nothing can interrupt it. That single
observation — rewarding short bursts dramatically lowers average waiting time — is exactly
what motivates Lecture 11's Shortest-Job-First algorithm.

!!! tip "FCFS's one genuine advantage"
    Despite the convoy effect, FCFS is never unfair in a different sense: no process can be
    starved forever, because the queue only ever moves forward. Every later algorithm in
    this unit trades away some of that simplicity to fix the convoy effect, and several of
    them (Lecture 11's priority scheduling in particular) trade away the starvation
    guarantee to do it.

## Key Takeaways

- CPU scheduling exists to maximize **CPU utilization** in a multiprogrammed system — always
  having something ready to run the instant the CPU frees up.
- Processes alternate between **CPU bursts** and **I/O bursts**; burst-length distributions
  are skewed toward many short bursts and few long ones, which later motivates
  Shortest-Job-First.
- The **CPU scheduler** decides which process runs next; the **dispatcher** performs the
  actual context switch, at a real cost called **dispatch latency**.
- **Non-preemptive** scheduling never interrupts a running process; **preemptive**
  scheduling can — at the cost of needing synchronization around any data a preempted
  process might have left half-updated.
- The five **scheduling criteria** — utilization, throughput, turnaround time, waiting time,
  and response time — are the standard vocabulary every algorithm in this unit is judged by.
- **FCFS** is simple and starvation-free, but entirely at the mercy of arrival order, which
  produces the **convoy effect**: a single long process can inflate the waiting time of
  every short process stuck behind it, as the worked example's swing from an average
  waiting time of 16 down to 1.25 — using the exact same burst lengths — demonstrates.

Continue to
[Lecture 11 — Scheduling Algorithms: SJF, SRTF, and Round Robin](lecture-11-scheduling-algorithms-sjf-srtf-and-round-robin.md),
where the convoy effect gets fixed — and a new tradeoff takes its place.
