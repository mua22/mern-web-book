---
title: "16. Classical Synchronization Problems II"
tags:
  - CSC323
  - Operating Systems
  - Synchronization
  - Deadlock
  - Dining Philosophers
---

# 16. Classical Synchronization Problems II

Lecture 15 closed with the readers-writers problem, whose "first" variant can starve a
writer under heavy read traffic — unfortunate, but the system as a whole never actually
grinds to a halt. The **Dining Philosophers Problem** is chosen for this course specifically
*because* its most natural, seemingly obvious solution does not just risk unfairness — it
can **deadlock** outright, every single process stuck forever. That makes it the perfect
bridge into the Deadlocks unit immediately following this one. We'll see exactly why the
naive approach fails, fix it two different ways, and close with a short, practical look at
how two real operating systems — Windows and Linux — actually implement the primitives from
Lecture 14 underneath their respective APIs.

## In This Lecture

- The Dining Philosophers Problem's setup, and what it's really a model of
- The naive solution, and a precise trace of exactly how it can deadlock
- An asymmetric fix that breaks the circular-wait pattern without any extra bookkeeping
- The monitor-based solution — `state[]` and `test()` — and why it expresses the problem's
  real constraint more cleanly than raw semaphores can
- A short case study: Windows dispatcher objects and `WaitForSingleObject()`, and Linux
  futexes and pthreads

## The Dining Philosophers Problem

Five philosophers sit at a circular table. Between each adjacent pair sits exactly one
fork, for five forks total. Each philosopher alternates between **thinking** (needs
nothing) and **eating** (needs *both* forks adjacent to them — left and right — picked up
one at a time). After eating, a philosopher puts both forks back down and returns to
thinking.

<div class="os-svg-diagram" markdown>
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Five philosophers seated in a circle around a table, with one fork placed on the table between each adjacent pair of philosophers">
  <circle cx="200" cy="200" r="150" fill="none" stroke="var(--cu-border-soft)" stroke-width="1" stroke-dasharray="4 5" />
  <circle cx="200" cy="200" r="60" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5" />
  <text x="200" y="196" text-anchor="middle" font-size="13" fill="var(--cu-muted)">Shared</text>
  <text x="200" y="212" text-anchor="middle" font-size="13" fill="var(--cu-muted)">table</text>

  <!-- forks -->
  <g stroke="#B9720E" stroke-width="2.5" fill="var(--cu-surface)">
    <rect x="104" y="73" width="26" height="26" rx="4" transform="rotate(45 117 86)" />
    <rect x="53"  y="230" width="26" height="26" rx="4" transform="rotate(-18 66 243)" />
    <rect x="187" y="327" width="26" height="26" rx="4" transform="rotate(0 200 340)" />
    <rect x="320" y="230" width="26" height="26" rx="4" transform="rotate(18 333 243)" />
    <rect x="269" y="73" width="26" height="26" rx="4" transform="rotate(-45 282 86)" />
  </g>
  <g font-size="12" font-weight="600" fill="var(--cu-text)" text-anchor="middle">
    <text x="117" y="90">F0</text>
    <text x="66" y="247">F1</text>
    <text x="200" y="344">F2</text>
    <text x="333" y="247">F3</text>
    <text x="282" y="90">F4</text>
  </g>

  <!-- philosophers -->
  <g stroke="#12B394" stroke-width="3" fill="var(--cu-surface)">
    <circle cx="200" cy="60"  r="32" />
    <circle cx="67"  cy="157" r="32" />
    <circle cx="118" cy="313" r="32" />
    <circle cx="282" cy="313" r="32" />
    <circle cx="333" cy="157" r="32" />
  </g>
  <g font-size="14" font-weight="700" fill="var(--cu-text)" text-anchor="middle">
    <text x="200" y="65">P0</text>
    <text x="67"  y="162">P1</text>
    <text x="118" y="318">P2</text>
    <text x="282" y="318">P3</text>
    <text x="333" y="162">P4</text>
  </g>
</svg>
</div>

The setup is a clean model of a very general OS problem: several processes contending for a
**fixed pool of shared resources**, where each process needs **more than one resource at
once** to make progress. A fork could just as easily be a lock, a tape drive, or a memory
buffer — the dining table is a dressed-up resource-allocation graph, which is exactly why
this problem belongs right before the Deadlocks unit.

### The Naive Solution — and Its Deadlock

Model each fork as a binary semaphore, `fork[5]`, all initialized to `1`. Philosopher `i`
(forks numbered so philosopher `i` sits between `fork[i]` and `fork[(i+1) % 5]`):

```c
semaphore fork[5] = {1, 1, 1, 1, 1};

/* Philosopher i */
do {
    wait(fork[i]);              /* pick up left fork  */
    wait(fork[(i + 1) % 5]);    /* pick up right fork */

        /* eat */

    signal(fork[i]);
    signal(fork[(i + 1) % 5]);

    /* think */
} while (true);
```

!!! warning "All five picking up their left fork at once deadlocks the table"
    Suppose all five philosophers become hungry at roughly the same moment, and each one
    executes `wait(fork[i])` — picking up their *left* fork — before any of them reaches
    `wait(fork[(i + 1) % 5])`. Every fork is now held: philosopher `i` holds `fork[i]`.
    Every philosopher then tries to pick up their *right* fork — which is precisely the
    *left* fork of their neighbor, already held by that neighbor. All five block forever on
    `wait()`: `P0` waits on the fork held by `P1`, `P1` waits on the fork held by `P2`, …,
    `P4` waits on the fork held by `P0` — a complete cycle, in which every process holds one
    resource and waits indefinitely for one more that will never be released. This is a
    textbook **circular-wait deadlock**, and circular wait is literally one of the four
    conditions the Deadlocks unit names as necessary for deadlock to occur at all.

### Fix 1: Breaking the Symmetry

One correct fix needs no extra bookkeeping at all — just break the symmetry in the order
forks are picked up. Odd-numbered philosophers pick up left-then-right, as in the naive
version; even-numbered philosophers pick up **right-then-left** instead:

```c
/* Philosopher i */
do {
    if (i % 2 == 0) {
        wait(fork[(i + 1) % 5]);   /* right first */
        wait(fork[i]);             /* then left   */
    } else {
        wait(fork[i]);             /* left first  */
        wait(fork[(i + 1) % 5]);   /* then right  */
    }

        /* eat */

    signal(fork[i]);
    signal(fork[(i + 1) % 5]);

    /* think */
} while (true);
```

The deadlock above depended on *every* philosopher reaching for forks in the same rotational
direction, so that each one successfully grabs exactly one fork and then blocks on the next
— a perfect, symmetric cycle. Reversing the order for half the philosophers destroys that
symmetry: somewhere around the table, two *adjacent* philosophers now reach for the **same**
fork as their *first* choice (rather than one wanting it first and the other wanting it
second). Because acquiring a fork is atomic, only one of those two can actually win it — the
other comes away holding **nothing at all**. A philosopher holding nothing can never be a
link in a circular-wait chain, which is exactly what breaks the cycle.

Tracing the worst case for five philosophers (everyone hungry at once) confirms this: `P0`
and `P1` both reach for `fork[1]` first — one wins it, the other blocks holding nothing;
`P2` and `P3` both reach for `fork[3]` first — same resolution. Whichever of `P1`/`P3` wins
its first fork goes on to acquire its second fork uncontested (the philosopher who *would*
have contested it is still blocked, holding nothing) and eats; once it finishes and releases
both forks, the philosophers it was blocking can proceed in turn. Every philosopher
eventually eats — no cycle of mutual, unresolvable waiting can form.

### Fix 2: The Monitor's Solution

A monitor can express the problem's real constraint — *a philosopher may pick up its forks
only if neither neighbor is currently eating* — directly, with an explicit state for each
philosopher and a helper procedure that checks both neighbors atomically:

```c
monitor DiningPhilosophers {
    enum {THINKING, HUNGRY, EATING} state[5];
    condition self[5];

    void pickup(int i) {
        state[i] = HUNGRY;
        test(i);
        if (state[i] != EATING) {
            self[i].wait();
        }
    }

    void putdown(int i) {
        state[i] = THINKING;
        test((i + 4) % 5);   /* left neighbor  */
        test((i + 1) % 5);   /* right neighbor */
    }

    void test(int i) {
        if (state[(i + 4) % 5] != EATING &&
            state[i]            == HUNGRY &&
            state[(i + 1) % 5]  != EATING) {
            state[i] = EATING;
            self[i].signal();
        }
    }

    initialization_code() {
        for (int i = 0; i < 5; i++) {
            state[i] = THINKING;
        }
    }
}
```

A philosopher calls `pickup(i)` when hungry and `putdown(i)` when finished eating — never
touching individual forks directly. `test(i)` is the heart of the solution: it moves
philosopher `i` into `EATING` *only if* both neighbors are not currently eating, and this
check-and-update happens as one atomic step because the monitor itself guarantees mutual
exclusion — no other philosopher's `pickup()`, `putdown()`, or `test()` can run
concurrently and race against it. When philosopher `i` finishes and calls `putdown(i)`, it
re-checks both neighbors via `test()`, so a neighbor that was waiting because `i` was eating
gets woken the instant it is safe for them to start.

!!! note "This is exactly where a monitor earns its keep"
    A pure-semaphore solution to Dining Philosophers that is *both* deadlock-free *and*
    lets as many non-conflicting philosophers eat simultaneously as possible is notoriously
    fiddly to get right — the asymmetric fix above avoids deadlock but doesn't by itself
    express "wake a neighbor the instant it becomes safe." The monitor version expresses
    that exact rule in a few lines, because it can bundle arbitrary state (`state[]`) with
    an atomic check-and-act procedure (`test()`) — precisely the capability raw semaphores,
    which only expose a single integer and two operations, don't give you directly.

## Synchronization in Windows and Linux

### Windows: Dispatcher Objects

Windows exposes mutexes, semaphores, and events through a common abstraction called a
**dispatcher object**. Every dispatcher object has a signaled or non-signaled state, and a
single family of wait functions works uniformly across all of them:

```c
HANDLE hMutex = CreateMutex(NULL, FALSE, NULL);

WaitForSingleObject(hMutex, INFINITE);   /* blocks until hMutex is signaled */

    /* critical section */

ReleaseMutex(hMutex);                     /* signals hMutex again */
```

`WaitForSingleObject()` blocks the calling thread until the given object becomes signaled
(a free mutex, a posted semaphore, a set event) or a timeout elapses;
`WaitForMultipleObjects()` extends this to wait on several dispatcher objects at once,
either for any one or for all of them to become signaled.

### Linux: Futexes and pthreads

Linux's key primitive is the **futex** ("fast userspace mutex"), and its key performance
insight is this: acquiring an *uncontended* lock is handled **entirely in user space**, via
a single atomic `compare_and_swap`-style instruction, with no system call at all. The
kernel is only involved — through the `futex()` system call — when there is **actual
contention**: when a thread genuinely needs to block waiting for the lock, or needs to wake
a thread that is already blocked. This matters because the overwhelming majority of lock
acquisitions in real programs *are* uncontended, and a system call costs orders of magnitude
more than one user-space atomic instruction — paying that cost on every single acquisition,
contended or not, would be an enormous waste. Standard **pthreads** (POSIX threads) mutexes,
semaphores (`sem_wait()`/`sem_post()`), and condition variables
(`pthread_cond_wait()`/`pthread_cond_signal()`) are the usual application-facing API on
Linux, and the C library's `pthread_mutex` implementation is itself built on top of a futex.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Same idea, two real implementations</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Windows</span>
<span class="db-node-sub">Dispatcher objects (mutex, semaphore, event) + WaitForSingleObject()/WaitForMultipleObjects()</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Linux</span>
<span class="db-node-sub">Futexes — user-space fast path, kernel only on contention — underneath pthread mutexes, semaphores, condition variables</span>
</div>
</div>
</div>

## Key Takeaways

- The **Dining Philosophers Problem** models processes contending for a fixed pool of
  resources where each process needs *more than one* resource simultaneously.
- The naive "left fork, then right fork" solution can deadlock: if every philosopher grabs
  their left fork at once, a complete circular-wait cycle forms and none can ever get a
  second fork.
- An **asymmetric fork-ordering** fix breaks that symmetry with no extra state: it
  guarantees that somewhere around the table, two neighbors contest the *same* fork as their
  first choice, and the loser holds nothing — which a circular-wait cycle cannot form around.
- The **monitor-based solution** expresses the real constraint — eat only if neither
  neighbor is eating — directly, using a `state[]` array and an atomic `test()` procedure,
  something raw semaphores express only with considerably more care.
- **Windows** unifies synchronization objects under dispatcher objects and
  `WaitForSingleObject()`; **Linux** optimizes the common, uncontended case with **futexes**,
  trapping into the kernel only when there's real contention — the same hardware-backed
  atomicity from Lecture 14, specialized for real-world performance.

[Lecture 17](lecture-17-midterm-review.md) is a midterm review, consolidating everything
from process concepts through this unit's classical synchronization problems before the
course moves on to deadlocks.
