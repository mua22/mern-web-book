---
title: "13. Race Conditions and the Critical Section Problem"
tags:
  - CSC323
  - Operating Systems
  - Race Conditions
  - Critical Section
  - Synchronization
---

# 13. Race Conditions and the Critical Section Problem

So far, a process has been treated as a self-contained story: it runs, it is scheduled,
it waits for I/O, it eventually finishes — all without asking what *other* processes are
doing at the same time. That assumption quietly breaks the moment two or more processes
(or threads within one process) read and write the **same piece of shared memory**
concurrently. The correctness of the result can then depend on something the programmer
never controls directly: the exact, unpredictable order in which the CPU happened to
interleave their instructions. This lecture names that failure precisely — a **race
condition** — and then formalizes the problem every synchronization tool in the next few
lectures exists to solve: the **critical section problem**.

## In This Lecture

- What a race condition is, precisely, and why "it usually works" is not the same claim as
  "it is correct"
- A worked example at the assembly-instruction level, showing how two processes updating one
  shared variable can produce two *different* final answers depending only on timing
- A formal statement of the critical section problem and the three requirements any correct
  solution must satisfy: **mutual exclusion**, **progress**, and **bounded waiting**
- Why simply disabling interrupts during a critical section is a crude, incomplete fix
- **Peterson's solution** — a software-only algorithm for two processes — walked through and
  checked against all three requirements
- A subtle but critical caveat: why Peterson's solution can still fail on real modern
  hardware without an explicit memory barrier

## Race Conditions

A **race condition** occurs when two or more processes access and manipulate the same
shared data concurrently, and the final outcome of that data depends on the particular
*order* in which their individual instructions happen to be scheduled. If every possible
interleaving produces the same final result, there is no race — the outcome is determined,
regardless of timing. A race condition exists precisely when *at least two* interleavings
are possible and they disagree.

### A Worked Example: The Shared Counter

Picture a producer-consumer pair sharing a bounded buffer and a single shared integer,
`counter`, that always holds the number of items currently sitting in the buffer. The
producer increments it after adding an item; the consumer decrements it after removing one.
In a high-level language this looks harmless and atomic:

```c
counter++;   /* producer, after inserting an item   */
counter--;   /* consumer, after removing an item     */
```

Neither statement is actually one step. A typical CPU has no single instruction that reads
a memory location, modifies it, and writes it back all at once for an ordinary variable —
each statement compiles to three separate machine instructions, and a preemptible,
multiprogrammed OS is free to interrupt either process **between** any of them:

```text
; producer executing counter++
register1 = counter        ; load
register1 = register1 + 1  ; increment
counter   = register1      ; store

; consumer executing counter--
register2 = counter        ; load
register2 = register2 - 1  ; decrement
counter   = register2      ; store
```

`register1` and `register2` are private to each process (held in distinct CPU registers or
saved in each process's own context); `counter` is the one thing both processes actually
share.

### Two Interleavings, Two Different Answers

Suppose `counter` starts at `5`. If the scheduler happens to run the producer's three
instructions fully before the consumer's three (or vice versa), nothing goes wrong — the net
effect of one increment and one decrement is zero, and `counter` ends back at `5`.

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Interleaving A — no overlap, correct result</div>

| Step | Instruction | Effect |
|---|---|---|
| 1 | Producer: `register1 = counter` | `register1 = 5` |
| 2 | Producer: `register1 = register1 + 1` | `register1 = 6` |
| 3 | Producer: `counter = register1` | `counter = 6` |
| 4 | Consumer: `register2 = counter` | `register2 = 6` |
| 5 | Consumer: `register2 = register2 - 1` | `register2 = 5` |
| 6 | Consumer: `counter = register2` | `counter = 5` |

**Final `counter = 5`** — correct.

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Interleaving B — overlapped, wrong result</div>

| Step | Instruction | Effect |
|---|---|---|
| 1 | Producer: `register1 = counter` | `register1 = 5` |
| 2 | Consumer: `register2 = counter` | `register2 = 5` |
| 3 | Producer: `register1 = register1 + 1` | `register1 = 6` |
| 4 | Consumer: `register2 = register2 - 1` | `register2 = 4` |
| 5 | Producer: `counter = register1` | `counter = 6` |
| 6 | Consumer: `counter = register2` | `counter = 4` |

**Final `counter = 4`** — wrong; should be `5`.

</div>
</div>

Nothing about the *program* changed between these two traces — same code, same starting
value, same two logical operations (one increment, one decrement). Only the **order** in
which the scheduler happened to interleave six individual machine instructions changed, and
that alone changed the answer from `5` to `4`. In Interleaving B, the consumer's decrement
is effectively lost: both processes read the same stale value of `5` before either had
written back its update, so whichever write happens last simply overwrites the other's work.
This is exactly what defines a race condition — the result *races* against timing that the
program itself does not control.

!!! warning "A race condition is a timing bug, not a logic bug"
    Reading the producer's code and the consumer's code separately reveals nothing wrong —
    each is individually correct. The bug only exists in the *combination*, under *specific*
    interleavings, which may be rare enough that a program runs correctly thousands of times
    in testing and then fails once in production under heavier load or on a different CPU.
    This is precisely why race conditions are notorious: they are easy to introduce and
    extremely hard to catch by inspection or by ordinary testing alone.

## The Critical Section Problem

The segment of code in which a process accesses data shared with at least one other process
is called its **critical section**. The **critical section problem** is the problem of
designing a protocol that processes can use to cooperate safely when each has a critical
section to execute — no process may be allowed to run its critical section concurrently with
another process's critical section, if those sections touch the same shared data.

Every process that has a critical section is assumed to follow this general shape:

```text
do {
    entry section
        critical section
    exit section
        remainder section
} while (true);
```

- **Entry section** — code that requests permission to enter the critical section.
- **Critical section** — the actual access to shared data.
- **Exit section** — code that releases that permission.
- **Remainder section** — everything else the process does, where no sharing conflict exists.

A correct solution fills in the entry and exit sections so that three requirements hold
simultaneously, no matter how the scheduler interleaves the processes:

1. **Mutual exclusion** — if a process is executing in its critical section, no other
   process may be executing in *its own* critical section (for the same shared resource) at
   the same time.
2. **Progress** — if no process is currently in its critical section, and some process
   *wants* to enter, the decision of which process enters next cannot be postponed
   indefinitely. Only processes that are themselves trying to enter their critical section
   may participate in that decision — a process sitting idle in its remainder section is not
   allowed to block anyone else's turn.
3. **Bounded waiting** — there exists a limit on the number of times *other* processes are
   allowed to enter their critical sections after a given process has requested entry and
   before that request is granted. This is what rules out **starvation**: no process may be
   made to wait forever while others repeatedly cut in line.

!!! note "Three independent requirements, three independent failure modes"
    Violating mutual exclusion reproduces exactly the race condition traced above. Violating
    progress can leave every process stuck in a decision no one is empowered to make — a
    kind of deadlock. Violating bounded waiting allows one unlucky process to be passed over
    indefinitely even though the system as a whole keeps making progress — starvation. A
    solution must defend against all three; satisfying only one or two is not enough.

## Interrupt-Based Solution

The crudest possible fix is to disable interrupts for the duration of the critical section:

```text
disable_interrupts();
    critical section
enable_interrupts();
```

On a single CPU with no interrupts arriving, there is no timer tick to trigger a context
switch and no other process can be scheduled in — mutual exclusion holds trivially, by
brute force. This "works," but it is a poor general solution for two reasons:

- **It does not work on a multiprocessor.** Disabling interrupts affects only the CPU core
  that executed the instruction. Any other core is completely unaffected and can schedule a
  different process straight into the same critical section at the same instant.
- **It hands every process a dangerous amount of power.** A process that disables interrupts
  and then crashes, loops forever, or — worse — simply never re-enables them (whether through
  a bug or malicious intent) can freeze timer ticks, I/O completions, and scheduling for the
  *entire machine*, not just its own critical section. No other process, and not even the OS
  scheduler itself, runs again until interrupts are re-enabled.

Even setting those two problems aside, disabling interrupts is a blunt instrument: it blocks
*every* interrupt, including timers and I/O completions that have nothing to do with the
specific shared resource being protected, hurting the system's overall responsiveness. This
motivates looking for a solution built entirely out of ordinary reads and writes to shared
memory — no special privilege required.

## Peterson's Solution

**Peterson's solution** is a classic software-only algorithm for two processes, `P0` and
`P1` (write `Pi` for either one and `Pj` for the other). It uses two shared variables:

```c
int turn;        /* whose turn it is to enter, when both want in */
boolean flag[2];  /* flag[i] == true means Pi wants to enter      */
```

The code executed by process `Pi` is:

```c
flag[i] = true;
turn = j;
while (flag[j] && turn == j) {
    /* busy wait */
}

/* critical section */

flag[i] = false;

/* remainder section */
```

Read it as two statements of intent: `flag[i] = true` says "I want to enter"; `turn = j`
says "but I will politely let you go first, if you also want in right now." The `while`
condition then says: keep waiting only while the other process also wants in **and** it is
genuinely the other process's turn.

### Proof of Mutual Exclusion

Suppose, for contradiction, that both `Pi` and `Pj` are inside their critical sections at
the same time. For `Pi` to have passed its `while` loop, either `flag[j]` was `false` or
`turn` was not `j` — but since `Pj` is also in its critical section, `Pj` must have set
`flag[j] = true` before entering and not yet reset it, so `flag[j]` is `true`. That forces
`turn == i` to be what let `Pi` through. By the symmetric argument, `Pj` getting through
forces `turn == j`. `turn` is a single shared integer — it cannot simultaneously equal both
`i` and `j`. Contradiction. Mutual exclusion holds.

### Proof of Progress

A process sitting in its remainder section has `flag` set to `false` and therefore cannot
block anyone — the `while` condition for the other process evaluates `flag[j]` to `false`
and lets it straight through. If only one process currently wants to enter, its own `while`
condition is false immediately (the other's flag is `false`), so it proceeds without delay.
If both want in, `turn` holds exactly one value, and whichever process that value favors
proceeds — the decision is never postponed indefinitely, because `turn` is always set to a
definite value the instant both processes attempt entry.

### Proof of Bounded Waiting

Each time `Pi` attempts entry, it sets `turn = j`, explicitly deferring to the other
process. If `Pi` exits its critical section, resets `flag[i]`, and later tries to re-enter
while `Pj` is still waiting, `Pi`'s new attempt again sets `turn = j` — which is exactly the
condition that lets the already-waiting `Pj` proceed next. A process can therefore be
overtaken by the other at most once before its own entry is granted: after any one
intervening entry by the other process, that process's *next* attempt sets `turn` back in
this process's favor. No process can be skipped an unbounded number of times.

!!! tip "Peterson's solution needs no hardware support at all"
    Every operation above — reading a boolean, writing a boolean, reading and writing an
    integer — is something any CPU could do with ordinary load/store instructions decades
    before specialized atomic instructions existed. That is exactly what makes it an elegant
    *proof of possibility*: mutual exclusion does not strictly require special hardware. It
    is also exactly what makes the next section's warning so important.

## Peterson's Solution Revisited: Memory Barriers

!!! warning "Peterson's solution can fail on real modern hardware"
    The proof above silently assumes that once `Pi` writes `flag[i] = true` and `turn = j`,
    those writes are immediately visible to `Pj` before `Pj` evaluates its own `while`
    condition. Modern compilers and CPUs do not guarantee that ordering by default. A
    compiler is free to reorder independent-looking instructions for performance as long as
    the reordering is invisible to a *single* thread's own sequential view of its own code.
    Out-of-order execution and per-core store buffers mean a CPU can likewise delay a write
    becoming visible to other cores well after the instruction that issued it has retired.

    If the write to `flag[i]` (or to `turn`) is reordered — by the compiler or by the CPU —
    to happen *after* the read of `flag[j]` in the `while` condition, both processes can each
    observe the *other's* flag as still `false` and both enter the critical section at the
    same time, exactly as if no synchronization existed at all. The algorithm's logic on
    paper is correct; the algorithm's logic *as actually executed by the hardware* may not
    be, unless the ordering is forced.

The fix is an explicit **memory barrier** (or *fence*): an instruction that forces every
memory operation issued before it, by this process, to become globally visible before any
memory operation issued after it is allowed to execute or be observed by others.

```c
flag[i] = true;
turn = j;
memory_barrier();              /* force the two writes above to be visible first */
while (flag[j] && turn == j) {
    /* busy wait */
}
```

This is the main reason textbook presentations of Peterson's solution are best understood as
a *pedagogical proof of concept* — demonstrating that pure software, with no special
instructions, can satisfy all three requirements — rather than as code you would actually
ship. Real systems never implement mutual exclusion with a hand-written Peterson loop; they
build on hardware instructions specifically designed to carry the correct ordering and
atomicity guarantees built in, which is exactly where [Lecture 14](lecture-14-synchronization-tools-mutex-locks-semaphores-and-monitors.md)
picks up.

## Key Takeaways

- A **race condition** happens when the final result of concurrent access to shared data
  depends on the timing of instruction interleaving — the shared-counter example showed the
  *same* code producing `5` under one interleaving and `4` under another.
- The **critical section problem** requires any solution to guarantee **mutual exclusion**,
  **progress**, and **bounded waiting** — three independent properties, each with its own
  failure mode (a race, a stalled decision, or starvation).
- **Disabling interrupts** gives trivial mutual exclusion on a single CPU but fails outright
  on multiprocessors and hands any process the power to freeze the entire machine.
- **Peterson's solution** solves the two-process case with nothing but ordinary shared
  variables, and its three correctness properties can each be argued directly from the code.
- On real hardware, Peterson's solution needs an explicit **memory barrier** to stop the
  compiler or CPU from reordering its writes past its reads — without one, the algorithm's
  guarantees can silently collapse.

[Lecture 14](lecture-14-synchronization-tools-mutex-locks-semaphores-and-monitors.md) moves
from this software-only, reordering-sensitive world to the hardware-backed tools —
`test_and_set()`, `compare_and_swap()`, mutex locks, semaphores, and monitors — that real
operating systems actually use.
