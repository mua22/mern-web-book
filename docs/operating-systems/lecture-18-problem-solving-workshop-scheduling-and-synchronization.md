---
title: "18. Problem-Solving Workshop: Scheduling and Synchronization"
tags:
  - CSC323
  - Review
  - CPU Scheduling
  - Synchronization
  - Practice Problems
---

# 18. Problem-Solving Workshop: Scheduling and Synchronization

The official course plan allocates this slot to midterm exam week, with no new topic
assigned. Rather than leave it empty, this chapter turns it into exactly what you need most
right before (or right after) that exam: deliberate practice. Below are four fully worked
problems, each built to mirror the shape of a real exam question — a Gantt-chart scheduling
comparison, a Peterson's-solution trace, a buggy semaphore program you have to diagnose and
fix, and a short conceptual question on threading. Work each problem yourself before reading
the solution underneath it; the value here is in the attempt, not the answer.

## In This Lecture

- Practice applying two CPU scheduling algorithms to the same input and comparing the
  results
- Practice tracing a software mutual-exclusion solution through a specific interleaving,
  statement by statement
- Practice diagnosing a semaphore ordering bug that causes deadlock, not just a wrong answer
- Reinforce why a many-to-one threading model cannot deliver parallelism, no matter how many
  threads it creates

## Problem 1: Comparing SJF and Round Robin

Four processes arrive at a single-CPU system as follows:

| Process | Arrival Time | Burst Time |
|---|---|---|
| P1 | 0 | 8 |
| P2 | 1 | 4 |
| P3 | 2 | 9 |
| P4 | 3 | 5 |

Compute the Gantt chart, waiting time, and turnaround time for **(a)** non-preemptive SJF
and **(b)** Round Robin with time quantum `q = 4`. Then compare the two results.

### Solution

**(a) Non-preemptive SJF.** At each decision point, pick the shortest burst among processes
that have already arrived and haven't run yet — and once a process starts, it runs to
completion.

- `t = 0`: only P1 has arrived. Run P1 (0–8).
- `t = 8`: P2 (burst 4), P3 (burst 9), and P4 (burst 5) have all arrived. Shortest is P2.
  Run P2 (8–12).
- `t = 12`: P3 (9) and P4 (5) remain. Shortest is P4. Run P4 (12–17).
- `t = 17`: only P3 remains. Run P3 (17–26).

<div class="os-gantt" markdown>
<div class="os-gantt-row" markdown>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 8">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 5">P4</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 9">P3</div>
</div>
<div class="os-gantt-ticks" markdown>
<span style="flex-grow: 8">0</span>
<span style="flex-grow: 4">8</span>
<span style="flex-grow: 5">12</span>
<span style="flex-grow: 9">17</span>
<span style="flex-grow: 1">26</span>
</div>
</div>

| Process | Completion | Turnaround (Completion − Arrival) | Waiting (Turnaround − Burst) |
|---|---|---|---|
| P1 | 8 | 8 − 0 = 8 | 8 − 8 = 0 |
| P2 | 12 | 12 − 1 = 11 | 11 − 4 = 7 |
| P4 | 17 | 17 − 3 = 14 | 14 − 5 = 9 |
| P3 | 26 | 26 − 2 = 24 | 24 − 9 = 15 |

Average waiting time = (0 + 7 + 9 + 15) / 4 = **7.75**. Average turnaround time =
(8 + 11 + 14 + 24) / 4 = **14.25**.

**(b) Round Robin, q = 4.** Convention: when a running process is preempted at the end of
its quantum, any process that arrived *during* that quantum is enqueued before the
preempted process is placed back at the tail.

- `0–4`: P1 runs (8 remaining → 4 remaining). P2, P3, P4 all arrive during this slice.
  Queue becomes `[P2, P3, P4, P1]`.
- `4–8`: P2 runs its full remaining burst (4 → 0). **P2 completes at 8.** Queue: `[P3, P4, P1]`.
- `8–12`: P3 runs (9 remaining → 5 remaining). Queue: `[P4, P1, P3]`.
- `12–16`: P4 runs (5 remaining → 1 remaining). Queue: `[P1, P3, P4]`.
- `16–20`: P1 runs its last 4 units (4 → 0). **P1 completes at 20.** Queue: `[P3, P4]`.
- `20–24`: P3 runs (5 remaining → 1 remaining). Queue: `[P4, P3]`.
- `24–25`: P4 runs its last 1 unit (1 → 0). **P4 completes at 25.** Queue: `[P3]`.
- `25–26`: P3 runs its last 1 unit (1 → 0). **P3 completes at 26.**

<div class="os-gantt" markdown>
<div class="os-gantt-row" markdown>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4">P1</div>
<div class="os-gantt-bar os-gantt-bar-b" style="flex-grow: 4">P2</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4">P3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4">P4</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 4">P1</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 4">P3</div>
<div class="os-gantt-bar os-gantt-bar-a" style="flex-grow: 1">P4</div>
<div class="os-gantt-bar os-gantt-bar-c" style="flex-grow: 1">P3</div>
</div>
<div class="os-gantt-ticks" markdown>
<span style="flex-grow: 4">0</span>
<span style="flex-grow: 4">4</span>
<span style="flex-grow: 4">8</span>
<span style="flex-grow: 4">12</span>
<span style="flex-grow: 4">16</span>
<span style="flex-grow: 4">20</span>
<span style="flex-grow: 1">24</span>
<span style="flex-grow: 1">25</span>
<span style="flex-grow: 1">26</span>
</div>
</div>

| Process | Completion | Turnaround | Waiting |
|---|---|---|---|
| P1 | 20 | 20 − 0 = 20 | 20 − 8 = 12 |
| P2 | 8 | 8 − 1 = 7 | 7 − 4 = 3 |
| P3 | 26 | 26 − 2 = 24 | 24 − 9 = 15 |
| P4 | 25 | 25 − 3 = 22 | 22 − 5 = 17 |

Average waiting time = (12 + 3 + 15 + 17) / 4 = **11.75**. Average turnaround time =
(20 + 7 + 24 + 22) / 4 = **18.25**.

**Comparison.** SJF wins decisively on both averages (7.75 vs. 11.75 waiting;
14.25 vs. 18.25 turnaround) — exactly as the theory in Lecture 17's table predicts, since
non-preemptive SJF is optimal for average waiting time. But SJF bought that average by
making P3 (the longest job) wait through almost the entire schedule without running at all
until `t = 17`. Round Robin's worse average comes with a different property SJF cannot
offer: every process gets its *first* slice of CPU time within one quantum of becoming
ready — P4, for instance, starts running at `t = 12` under Round Robin but has to wait until
`t = 12` under SJF too in this particular input, while P3 starts at `t = 17` under SJF but
as early as `t = 8` under Round Robin. Lower average waiting time and good responsiveness
are genuinely different goals, and this is exactly why no single algorithm wins on every
criterion in Lecture 17's comparison table.

## Problem 2: Tracing Peterson's Solution

Two processes, P0 and P1, share `flag[0]`, `flag[1]` (both initially `false`) and `turn`.
Each process `i` (with `j` as the other process) runs:

```text
flag[i] = true;
turn = j;
while (flag[j] && turn == j) { /* busy-wait */ }
    // critical section
flag[i] = false;
```

Trace the following interleaving and determine whether mutual exclusion holds:

1. P0 executes `flag[0] = true`
2. P1 executes `flag[1] = true`
3. P0 executes `turn = 1`
4. P1 executes `turn = 0`
5. P0 evaluates its `while` condition
6. P1 evaluates its `while` condition
7. P0 enters and finishes its critical section, then executes `flag[0] = false`
8. P1 re-evaluates its `while` condition

### Solution

| Step | Action | `flag[0]` | `flag[1]` | `turn` | Effect |
|---|---|---|---|---|---|
| 1 | P0: `flag[0] = true` | true | false | — | P0 declares intent to enter |
| 2 | P1: `flag[1] = true` | true | true | — | P1 declares intent to enter |
| 3 | P0: `turn = 1` | true | true | 1 | P0 politely yields priority to P1 |
| 4 | P1: `turn = 0` | true | true | **0** | P1's write happens *after* P0's — `turn` ends up `0`, overwriting step 3 |
| 5 | P0: checks `flag[1] && turn == 1` | true | true | 0 | `flag[1]` is true, but `turn == 1` is **false** (turn is 0) → condition is false → **P0 does not wait** |
| 6 | P1: checks `flag[0] && turn == 0` | true | true | 0 | `flag[0]` is true **and** `turn == 0` is true → condition is true → **P1 busy-waits** |
| 7 | P0 runs its critical section, then `flag[0] = false` | **false** | true | 0 | P0's turn in the critical section is over |
| 8 | P1 re-checks `flag[0] && turn == 0` | false | true | 0 | `flag[0]` is now false → condition is false → **P1 exits the loop and enters** |

**Mutual exclusion holds.** The decisive moment is step 4: both processes wrote to the
single shared variable `turn`, but only the *last* write survives, and in this interleaving
that was P1's write of `0`. Because `turn` ends up `0`, P0's own wait condition (which only
blocks it when `turn == 1`) is false, so P0 proceeds immediately — while P1's wait condition
(which only blocks it when `turn == 0`) is true, so P1 is correctly forced to wait. P1 is
released the instant P0 clears `flag[0]`, which also demonstrates **progress**: the waiting
process is never left blocked forever once the critical section becomes free.

!!! note "Change the order of steps 3 and 4 and the outcome flips"
    If P1 had written `turn = 0` *before* P0 wrote `turn = 1`, the final value of `turn`
    would be `1` instead, and P1 would be the one to proceed first while P0 waits. Peterson's
    solution doesn't fix who goes first — it guarantees that *exactly one* of them does,
    determined entirely by whichever write to `turn` happens last.

## Problem 3: Fixing a Buggy Bounded Buffer

A bounded buffer of `N` slots is protected by three semaphores: `mutex` (binary, initially
1), `empty` (counting, initially `N`), and `full` (counting, initially 0). A programmer
wrote the producer as follows. Find the bug and explain why it causes **deadlock**, not just
an occasional wrong value.

```text
// Buggy producer
wait(mutex);
wait(empty);
    ... add item to buffer ...
signal(full);
signal(mutex);
```

### Solution

**The bug is the order of the two `wait()` calls.** `mutex` is acquired *before* `empty`,
when it must always be acquired *after* a counting semaphore that might block:

```text
// Corrected producer
wait(empty);
wait(mutex);
    ... add item to buffer ...
signal(mutex);
signal(full);
```

**Why the buggy order deadlocks.** Suppose the buffer is completely full (`empty` has
reached 0). The producer calls `wait(mutex)` first and acquires it successfully — nothing
has taken `mutex` away yet. It then calls `wait(empty)`, and since `empty == 0`, the
producer blocks *while still holding `mutex`*. Now consider the consumer, whose job is to
remove an item and call `signal(empty)` — but the consumer's own code also needs `wait(mutex)`
before it can touch the buffer. `mutex` is held by the blocked producer, so the consumer
blocks too, waiting on `mutex`. The producer is waiting on `empty`, which only the consumer
can signal, and the consumer is waiting on `mutex`, which only the producer can release —
a circular wait between exactly two processes, each holding a resource (a semaphore) the
other needs. Neither can ever make progress: this is a genuine deadlock, not merely a race
condition that sometimes produces a wrong value.

!!! warning "The rule, stated generally"
    Always acquire a semaphore that might block indefinitely (`empty`, `full`) **before**
    acquiring the mutual-exclusion lock (`mutex`) that another process needs in order to
    eventually unblock you. Acquiring them in the opposite order lets a process hold the
    lock while sleeping — exactly the setup Lecture 19's hold-and-wait condition describes.

## Problem 4 (Conceptual): Many-to-One Threading and Parallelism

Explain why a many-to-one threading model cannot achieve parallelism on a multicore system,
even though it may support thousands of user-level threads.

### Solution

In the many-to-one model, the thread library multiplexes every user-level thread onto
exactly **one** kernel-level thread — the kernel schedules that single kernel thread, and
has no visibility at all into the user-level threads layered on top of it. Parallelism
means multiple instruction streams executing *simultaneously* on separate cores, and the
kernel can only hand out cores to entities it actually schedules. Since the kernel sees only
one schedulable entity for the entire process, no matter how many user-level threads that
process has created internally, at most one core can ever be in use by that process at any
instant — the other cores sit idle regardless of how much independent work those user
threads could otherwise do concurrently. This is also why a single blocking system call from
any one user thread freezes every other user thread in the same process: the one kernel
thread they all depend on is now blocked too.

## Key Takeaways

- **SJF minimizes average waiting time; Round Robin maximizes fairness and responsiveness.**
  Neither property implies the other, and a real exam question comparing two algorithms on
  the same input is usually testing exactly this trade-off, not just arithmetic.
- Tracing Peterson's solution statement-by-statement, rather than reasoning about it
  abstractly, is the reliable way to verify mutual exclusion — the shared `turn` variable's
  *last* writer is always the deciding fact.
- A semaphore-ordering bug (mutex before empty/full) causes **deadlock**, because it lets a
  process sleep while still holding the lock the process that could wake it needs.
- A many-to-one threading model's ceiling is fixed by the kernel's view, not the
  application's: one kernel-schedulable entity means at most one core in use, no matter the
  user-thread count.

Lecture 19 names the pattern Problem 3 above fell into — a circular wait where each process
holds something the other needs — and gives it formal treatment:
[Lecture 19: Deadlocks: Characterization and the Resource-Allocation Graph](lecture-19-deadlocks-characterization-and-the-resource-allocation-graph.md).
