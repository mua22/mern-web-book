---
title: "11. Scheduling Algorithms: SJF, SRTF, and Round Robin"
tags:
  - CSC323
  - Operating Systems
  - CPU Scheduling
  - SJF
  - Round Robin
  - Priority Scheduling
---

# 11. Scheduling Algorithms: SJF, SRTF, and Round Robin

Lecture 10 ended on an uncomfortable fact: First-Come, First-Served can produce an average
waiting time more than twelve times worse than the exact same workload in a different
arrival order, purely because FCFS has no way to notice that a short process is stuck
behind a long one. This lecture fixes that, twice over — once with an algorithm that
provably minimizes average waiting time, and once with a completely different algorithm
that abandons optimality for fairness instead. By the end, you'll have three genuinely
different philosophies of scheduling to compare, which is exactly what sets up Lecture 12's
answer: real systems don't pick one of these — they combine them.

## In This Lecture

- **Shortest-Job-First (SJF)**: why it's provably optimal, and the catch that keeps it from
  being used exactly as described
- **Shortest-Remaining-Time-First (SRTF)**: SJF's preemptive version, and a worked example
  showing a preemption actually happen
- **Round Robin**: fair time-slicing, worked through multiple rounds, and how the time
  quantum's size changes everything
- **Priority scheduling**, the starvation problem it creates, and aging as the fix
- How priority scheduling and Round Robin compare — and why real schedulers usually need
  both

## Shortest-Job-First (SJF)

**SJF** schedules whichever ready process has the **shortest next CPU burst**. Like FCFS,
it is normally described as non-preemptive: once a process starts running, it keeps the
CPU until it finishes, but every time the CPU becomes free, the scheduler picks the
shortest burst among whoever is ready *at that moment* — not simply the next process in
arrival order.

!!! note "SJF is provably optimal for minimizing average waiting time"
    Among all non-preemptive scheduling algorithms, for a fixed, known set of CPU burst
    lengths, SJF gives the minimum possible average waiting time. The intuition: every time
    you run a short job before a long one instead of after it, you shorten the wait of
    everything behind the long job by the long job's entire length, while only lengthening
    the long job's own wait by the short job's length — a trade that's always worth making,
    which is exactly why sorting shortest-first is optimal.

**The catch.** SJF needs to know each process's *next* CPU burst length *before* running
it — and in general, the OS cannot know that in advance. The practical fix is to
**estimate** the next burst from the lengths of a process's *previous* bursts, most
commonly using **exponential averaging**:

**τ(n+1) = α · t(n) + (1 − α) · τ(n)**

where t(n) is the process's actual, just-measured n-th burst length, τ(n) was the
*previous* estimate, and α (between 0 and 1) controls how heavily the most recent
burst is weighted against the accumulated history. In practice, "SJF" almost always means
"scheduling by *estimated* next burst," not by some impossible perfect knowledge of the
future.

### Worked Example: Non-Preemptive SJF

| Process | Arrival Time | Burst Time |
|---|---|---|
| P1 | 0 | 7 |
| P2 | 2 | 4 |
| P3 | 4 | 1 |
| P4 | 5 | 4 |

At t=0, only P1 has arrived, so the scheduler has no choice — it runs P1 for its full
burst of 7, finishing at t=7. By t=7, P2, P3, and P4 have all arrived, so the scheduler
picks the shortest burst among them: P3 (burst 1) beats P2 and P4 (burst 4 each). P3 runs
from t=7 to t=8. At t=8, only P2 and P4 remain, tied at burst 4 — ties are broken by
earlier arrival time, so P2 (arrived at t=2) runs before P4 (arrived at t=5): P2 from
t=8 to t=12, then P4 from t=12 to t=16.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: non-preemptive SJF</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 7;">P1</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 1;">P3</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4;">P2</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4;">P4</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 7;">0</span>
<span style="flex-grow: 1;">7</span>
<span style="flex-grow: 4;">8</span>
<span style="flex-grow: 4;">12</span>
<span>16</span>
</div>
</div>
</div>

| Process | Arrival | Burst | Start | Completion | Waiting Time | Turnaround Time |
|---|---|---|---|---|---|---|
| P1 | 0 | 7 | 0 | 7 | 0 | 7 |
| P3 | 4 | 1 | 7 | 8 | 7-4=3 | 8-4=4 |
| P2 | 2 | 4 | 8 | 12 | 8-2=6 | 12-2=10 |
| P4 | 5 | 4 | 12 | 16 | 12-5=7 | 16-5=11 |

**Average waiting time = (0 + 3 + 6 + 7) / 4 = 16 / 4 = 4**

**Average turnaround time = (7 + 4 + 10 + 11) / 4 = 32 / 4 = 8**

An average waiting time of 4, against FCFS's worse showings in Lecture 10, is exactly the
payoff SJF's optimality promises — but notice P4 still waits 7 units purely because it had
the bad luck to tie with P2 and lose the tiebreak; even an optimal *average* can still treat
one specific process worse than another.

## Shortest-Remaining-Time-First (SRTF)

**SRTF** is SJF's preemptive cousin: instead of committing to a process once it starts, the
scheduler re-evaluates *every time a new process arrives*. If the new arrival's burst is
shorter than the **remaining** time of whichever process is currently running, the running
process is preempted immediately and the new, shorter process takes over. SRTF is what
"SJF" means whenever preemption is allowed — the non-preemptive version only ever had the
chance to choose shortest-first *at the moments the CPU happened to be free already*; SRTF
can act on that information the instant it becomes available.

### Worked Example: SRTF, and the Preemption It Causes

To see preemption actually happen, and to see exactly how much it can help, run a new
process set through both non-preemptive SJF and SRTF side by side:

| Process | Arrival Time | Burst Time |
|---|---|---|
| P1 | 0 | 8 |
| P2 | 1 | 4 |
| P3 | 2 | 9 |
| P4 | 3 | 5 |

**Non-preemptive SJF first, for comparison.** At t=0 only P1 has arrived, so it runs to
completion regardless of what arrives later — non-preemptive means no amount of "but a
shorter job just showed up" can interrupt it. P1 runs 0 → 8. At t=8, P2 (burst 4), P3
(burst 9), and P4 (burst 5) have all arrived; shortest is P2, which runs 8 → 12. Next
shortest remaining is P4 (5), running 12 → 17; then P3 (9), running 17 → 26.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: non-preemptive SJF (no preemption possible)</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 8;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4;">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 5;">P4</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 9;">P3</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 8;">0</span>
<span style="flex-grow: 4;">8</span>
<span style="flex-grow: 5;">12</span>
<span style="flex-grow: 9;">17</span>
<span>26</span>
</div>
</div>
</div>

| Process | Arrival | Burst | Start | Completion | Waiting Time | Turnaround Time |
|---|---|---|---|---|---|---|
| P1 | 0 | 8 | 0 | 8 | 0 | 8 |
| P2 | 1 | 4 | 8 | 12 | 7 | 11 |
| P4 | 3 | 5 | 12 | 17 | 9 | 14 |
| P3 | 2 | 9 | 17 | 26 | 15 | 24 |

**Average waiting time (SJF) = (0 + 7 + 9 + 15) / 4 = 31 / 4 = 7.75**

**Now SRTF, same four processes.** At t=0, P1 (remaining 8) is the only option and
starts. At t=1, P2 arrives with burst 4 — compare to P1's *remaining* time, 8-1=7. Since
4 < 7, **P2 preempts P1**, and P2 takes the CPU. P2 runs uninterrupted from t=1 to
t=5 (neither P3's arrival at t=2, remaining 9, nor P4's at t=3, remaining 5, is ever
shorter than P2's own shrinking remainder) and completes at t=5. At t=5, the choice is
between P1 (remaining 7), P3 (remaining 9), and P4 (remaining 5) — P4 is shortest, and runs
uninterrupted 5 → 10, completing. At t=10, only P1 (remaining 7) and P3 (remaining 9)
are left; P1 is shorter, runs 10 → 17, completing. Finally P3 runs alone, 17 → 26.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: SRTF — P1 is preempted by P2 at t = 1</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 1;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4;">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 5;">P4</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 7;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 9;">P3</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 1;">0</span>
<span style="flex-grow: 4;">1</span>
<span style="flex-grow: 5;">5</span>
<span style="flex-grow: 7;">10</span>
<span style="flex-grow: 9;">17</span>
<span>26</span>
</div>
</div>
</div>

| Process | Arrival | Burst | Completion | Turnaround (C-A) | Waiting (TAT − Burst) |
|---|---|---|---|---|---|
| P1 | 0 | 8 | 17 | 17 | 17-8=9 |
| P2 | 1 | 4 | 5 | 4 | 4-4=0 |
| P4 | 3 | 5 | 10 | 7 | 7-5=2 |
| P3 | 2 | 9 | 26 | 24 | 24-9=15 |

**Average waiting time (SRTF) = (9 + 0 + 2 + 15) / 4 = 26 / 4 = 6.5**

SRTF's 6.5 beats non-preemptive SJF's 7.75 on the *exact same workload* — the preemption at
t=1 let P2 (burst 4) finish almost immediately instead of waiting behind P1's remaining 7
units, and that single decision is strictly better for the average even though P1 itself
ends up finishing later than it would have otherwise. This is the general relationship
between the two: **SRTF's average waiting time is always less than or equal to
non-preemptive SJF's**, for the same arrival/burst data, because SRTF can always choose to
act on information the moment it arrives, while non-preemptive SJF can only act on it the
next time the CPU happens to be free.

## Round Robin (RR)

Round Robin abandons "shortest first" entirely in favor of **fairness**: every process in
the ready queue gets a fixed-length turn, called a **time quantum** (commonly 10–100 ms in
real systems), and if it hasn't finished by the end of its quantum, it's preempted and sent
to the *back* of the ready queue to wait for its next turn. No process can be skipped
indefinitely, no matter how long other processes' bursts are — the opposite failure mode
from FCFS's convoy effect.

### Worked Example: Round Robin with Quantum = 4

Three processes, all arriving at t=0:

| Process | Burst Time |
|---|---|
| P1 | 10 |
| P2 | 5 |
| P3 | 8 |

Ready queue starts as `[P1, P2, P3]`. Each process runs for min(remaining, 4),
then — if anything remains — goes to the back of the queue.

- t=0: run **P1** for min(10,4)=4. P1's remainder drops to 6. Queue: `[P2, P3, P1]`.
- t=4: run **P2** for min(5,4)=4. Remainder 1. Queue: `[P3, P1, P2]`.
- t=8: run **P3** for min(8,4)=4. Remainder 4. Queue: `[P1, P2, P3]`.
- t=12: run **P1** for min(6,4)=4. Remainder 2. Queue: `[P2, P3, P1]`.
- t=16: run **P2** for min(1,4)=1. Remainder 0 — **P2 completes** at t=17.
- t=17: run **P3** for min(4,4)=4. Remainder 0 — **P3 completes** at t=21.
- t=21: run **P1** for min(2,4)=2. Remainder 0 — **P1 completes** at t=23.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: Round Robin, quantum = 4, three rounds</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4;">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4;">P3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4;">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 1;">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4;">P3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 2;">P1</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 4;">0</span>
<span style="flex-grow: 4;">4</span>
<span style="flex-grow: 4;">8</span>
<span style="flex-grow: 4;">12</span>
<span style="flex-grow: 1;">16</span>
<span style="flex-grow: 4;">17</span>
<span style="flex-grow: 2;">21</span>
<span>23</span>
</div>
</div>
</div>

| Process | Burst | Completion | Turnaround | Waiting (TAT − Burst) |
|---|---|---|---|---|
| P1 | 10 | 23 | 23 | 23-10=13 |
| P2 | 5 | 17 | 17 | 17-5=12 |
| P3 | 8 | 21 | 21 | 21-8=13 |

**Average waiting time = (13 + 12 + 13) / 3 = 38 / 3 ≈ 12.67**

**Average turnaround time = (23 + 17 + 21) / 3 = 61 / 3 ≈ 20.33**

Every process got CPU time within the first 12 units despite P1's long 10-unit total burst
— exactly the fairness guarantee FCFS couldn't offer.

### Choosing the Time Quantum

The quantum's size controls everything about how Round Robin behaves:

- **Too large**, and Round Robin degenerates toward FCFS — if the quantum exceeds every
  process's burst length, each process finishes in a single turn and the convoy effect
  reappears exactly as in Lecture 10.
- **Too small**, and the overhead of constant context switching (Lecture 10's *dispatch
  latency*, paid on every single preemption) starts to dominate — the CPU spends more time
  switching between processes than actually running any of them.

!!! tip "A practical rule of thumb"
    A well-chosen quantum should be large enough that roughly **80% of CPU bursts** are
    shorter than it — most processes then finish in a single turn (behaving almost like
    SJF for the common case), while the rare long process is still kept from monopolizing
    the CPU for more than one quantum at a time.

## Priority Scheduling

**Priority scheduling** assigns every process a priority number, and always runs the
highest-priority ready process next (by convention in this course, and in Silberschatz-
style notation generally, a *smaller* number means a *higher* priority). SJF is, in fact,
a special case of priority scheduling where the priority is simply the (estimated) next
CPU burst length — shorter burst, higher priority.

### Worked Example: Priority Scheduling and Starvation

Four processes, all arriving at t=0 (lower number = higher priority):

| Process | Burst Time | Priority |
|---|---|---|
| P1 | 4 | 3 |
| P2 | 3 | 1 |
| P3 | 2 | 4 |
| P4 | 1 | 2 |

Run order follows priority directly: P2 (1), then P4 (2), then P1 (3), then P3 (4).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Gantt chart: priority scheduling (lower number = higher priority)</p>
<div class="os-gantt" markdown>
<div class="os-gantt-row">
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 3;">P2</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 1;">P4</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4;">P1</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 2;">P3</div>
</div>
<div class="os-gantt-ticks">
<span style="flex-grow: 3;">0</span>
<span style="flex-grow: 1;">3</span>
<span style="flex-grow: 4;">4</span>
<span style="flex-grow: 2;">8</span>
<span>10</span>
</div>
</div>
</div>

| Process | Priority | Start | Completion | Waiting Time |
|---|---|---|---|---|
| P2 | 1 | 0 | 3 | 0 |
| P4 | 2 | 3 | 4 | 3 |
| P1 | 3 | 4 | 8 | 4 |
| P3 | 4 | 8 | 10 | 8 |

**Average waiting time = (0 + 3 + 4 + 8) / 4 = 15 / 4 = 3.75**

P3 — last priority — waits 8 full time units despite having been ready since t=0, purely
because three higher-priority processes kept cutting ahead of it. Now imagine a steady
stream of new high-priority processes continuing to arrive: P3 could in principle wait
**forever**, never once being the highest-priority ready process at the moment the CPU
frees up. This is **starvation** — a direct consequence of priority scheduling having no
built-in guarantee that a low-priority process's wait is ever bounded, unlike FCFS or Round
Robin.

**Aging** is the standard fix: periodically increase the priority of every process that has
been waiting, the longer it waits. Eventually, even P3's priority climbs high enough that
it becomes the highest-priority ready process and finally runs — aging guarantees that
every process's effective priority eventually catches up, turning an unbounded wait into a
bounded one.

## Priority Scheduling vs. Round Robin

Laid side by side, Round Robin and priority scheduling optimize for opposite things:

| | Priority Scheduling | Round Robin |
|---|---|---|
| Respects importance | Yes — a genuinely urgent process runs first | No — every process is treated identically |
| Starvation risk | Yes, without aging | No — the queue always moves forward |
| Fairness | No | Yes |
| Needs extra machinery to be safe | Aging | None |

Neither is strictly better — a system that only ever ran Round Robin would treat a critical
system task exactly the same as a background print job, and a system that only ever ran
priority scheduling (without aging) could leave a low-priority process waiting
indefinitely. Most real operating systems don't choose one or the other; they combine
*both* ideas — priority between groups of processes, Round Robin fairness within a group —
which is exactly the **multilevel queue** structure Lecture 12 introduces next.

## Key Takeaways

- **SJF** provably minimizes average waiting time among non-preemptive algorithms, but
  needs burst lengths it can only *estimate*, typically via exponential averaging.
- **SRTF**, SJF's preemptive version, can act on a shorter arrival immediately — the worked
  example's preemption of P1 by P2 at t=1 dropped average waiting time from 7.75 (SJF) to
  6.5 (SRTF) on the identical workload.
- **Round Robin** guarantees fairness through a fixed time quantum; too large a quantum
  degenerates toward FCFS, too small a quantum lets context-switch overhead dominate — the
  80%-of-bursts rule of thumb balances the two.
- **Priority scheduling** can starve low-priority processes indefinitely; **aging**
  guarantees every process's wait is eventually bounded by gradually raising the priority
  of whoever has been waiting.
- Priority scheduling respects importance but risks starvation; Round Robin is fair but
  blind to importance — real schedulers combine both, which is where Lecture 12 picks up.

Continue to
[Lecture 12 — Scheduling Algorithms: Multilevel Queues and Real-World Systems](lecture-12-scheduling-algorithms-multilevel-queues-and-real-world-systems.md).
