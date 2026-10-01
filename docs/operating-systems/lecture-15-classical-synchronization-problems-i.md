---
title: "15. Classical Synchronization Problems I"
tags:
  - CSC323
  - Operating Systems
  - Synchronization
  - Producer-Consumer
  - Readers-Writers
---

# 15. Classical Synchronization Problems I

Lecture 14 handed over a full toolbox — hardware instructions, mutex locks, semaphores, and
monitors — but a toolbox is only useful once you've used it on something real. This lecture
and the next apply semaphores to the handful of synchronization problems every operating
systems course treats as a shared benchmark: compact enough to fit in a lecture, yet rich
enough to expose exactly the subtleties — operation *order*, starvation, deadlock — that
real kernel code has to get right. We start with two: the **bounded-buffer
(producer-consumer) problem**, a direct model of I/O buffering between a device and the
kernel, and the **readers-writers problem**, a direct model of concurrent access to a file,
a table, or any shared record.

## In This Lecture

- The bounded-buffer problem's setup, and *why* it needs three separate semaphores rather
  than one
- The full producer and consumer pseudocode, built from `wait()`/`signal()`
- Why the *order* of acquiring semaphores is not a stylistic choice — getting it backward
  deadlocks the system
- The readers-writers problem's setup, and the "first" readers-writers variant's
  reader-preference behavior (and the starvation it risks)
- The semaphore-based solution, using a protected `read_count` alongside a `rw_mutex`

## The Bounded-Buffer (Producer-Consumer) Problem

A fixed-size buffer holds up to `N` items. One or more **producer** processes generate items
and insert them into the buffer; one or more **consumer** processes remove items and use
them. Three distinct things can go wrong if access isn't coordinated:

- A producer must not insert into a buffer that is already full.
- A consumer must not remove from a buffer that is already empty.
- Two processes manipulating the buffer's internal bookkeeping (its insertion/removal index)
  at the same instant can corrupt it — exactly Lecture 13's race condition, now with a
  circular buffer's index in place of a simple counter.

Those are three separate concerns, and the standard solution uses three separate
semaphores, one per concern:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three semaphores, three separate jobs</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">empty</span>
<span class="db-node-sub">Counting semaphore, init N — counts free slots</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">full</span>
<span class="db-node-sub">Counting semaphore, init 0 — counts filled slots</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">mutex</span>
<span class="db-node-sub">Binary semaphore, init 1 — protects the buffer index itself</span>
</div>
</div>
</div>

### Producer and Consumer Pseudocode

```c
semaphore empty = N;   /* free slots       */
semaphore full  = 0;   /* filled slots     */
semaphore mutex = 1;   /* buffer index lock */

/* Producer */
do {
    /* produce an item into next_produced */

    wait(empty);
    wait(mutex);

        /* add next_produced to the buffer */

    signal(mutex);
    signal(full);
} while (true);

/* Consumer */
do {
    wait(full);
    wait(mutex);

        /* remove an item from the buffer into next_consumed */

    signal(mutex);
    signal(empty);

    /* consume the item in next_consumed */
} while (true);
```

Each process waits on the **counting** semaphore first (`empty` for the producer, `full` for
the consumer) and only *then* acquires `mutex` to touch the buffer's shared index. On the way
out, it releases `mutex` first and signals the counting semaphore second.

### Why the Order Matters

<div class="db-diagram" markdown>
<p class="db-diagram-label">Correct order — the counting semaphore is never acquired while holding mutex</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">wait(empty) / wait(full)</span>
<span class="db-node-sub">May block — but mutex is NOT held yet</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">wait(mutex)</span>
<span class="db-node-sub">Enter the brief critical section</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">signal(mutex) → signal(full) / signal(empty)</span>
<span class="db-node-sub">Release mutex first, then update the count</span>
</div>
</div>
</div>

!!! warning "Swap the order and the system deadlocks"
    Suppose the producer instead acquired `mutex` *before* the counting semaphore:

    ```c
    /* WRONG order */
    wait(mutex);
    wait(empty);
        /* add item */
    signal(empty);
    signal(mutex);
    ```

    Now imagine the buffer is completely full (`empty == 0`). The producer acquires `mutex`
    successfully, then calls `wait(empty)` — which blocks, because there are no free slots.
    Critically, the producer is now blocked **while still holding `mutex`**. The consumer,
    which needs `mutex` to remove an item and eventually call `signal(empty)`, can never
    acquire it — `mutex` is held by a process that is never going to release it, because the
    only thing that could unblock that process is the very `signal(empty)` the consumer is
    now unable to reach. Both processes wait forever, each for something only the other
    could have provided. This is a deadlock, caused entirely by acquiring the two semaphores
    in the wrong order.

    The correct version avoids this because a process that must block on `empty` or `full`
    does so **before** ever touching `mutex` — so if the producer blocks, it is never holding
    the lock the consumer needs to make progress and eventually wake it back up.

Hand-tracing the correct version confirms this: if the buffer is full, the producer blocks
on `wait(empty)` without `mutex`; the consumer can freely acquire `mutex`, remove an item,
release `mutex`, and call `signal(empty)`, which wakes the waiting producer. The symmetric
case (empty buffer, consumer blocked on `wait(full)`) resolves the same way. Neither process
is ever stuck holding `mutex` while waiting on a counting semaphore that only the *other*
process can signal.

## The Readers-Writers Problem

A shared data object — a file, a database record, an in-memory table — is accessed by two
kinds of processes. **Readers** only read the data and never modify it; **writers** modify
it (and may read it too). Multiple readers may safely access the object **simultaneously**,
since reading in parallel causes no conflict between them. A writer, however, needs
**exclusive** access: no other reader or writer may touch the object while a writer is
writing.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Shared access for readers, exclusive access for a writer</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Readers (any number)</span>
<span class="db-node-sub">May all access the shared data at the same time</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Writer (at most one)</span>
<span class="db-node-sub">Needs the shared data completely to itself — no readers, no other writers</span>
</div>
</div>
</div>

This lecture covers the **first readers-writers problem**: no reader should be kept waiting
unless a writer has *already* obtained permission to use the shared object. In other words,
readers are given priority — as long as at least one reader is active, every newly arriving
reader is let in immediately, even if a writer is already waiting its turn.

!!! note "Reader preference vs. writer preference — a genuine tradeoff, not a bug"
    The *first* readers-writers problem, solved below, favors readers. A *second* variant
    flips the priority: once a writer is waiting, no new reader is allowed to start, so that
    writers are never starved by an endless stream of readers. Neither variant is
    universally "correct" — each protects one class of process from starvation at the cost
    of risking starvation for the other. A real system picks based on which failure mode it
    can tolerate less.

### The Semaphore-Based Solution

```c
int read_count = 0;       /* number of readers currently reading       */
semaphore mutex   = 1;    /* protects read_count itself                */
semaphore rw_mutex = 1;   /* exclusive access for a writer; held by the
                              "first in / last out" reader on behalf of
                              every reader currently active             */

/* Writer */
do {
    wait(rw_mutex);

        /* writing is performed */

    signal(rw_mutex);
} while (true);

/* Reader */
do {
    wait(mutex);
        read_count++;
        if (read_count == 1) {
            wait(rw_mutex);     /* first reader locks out writers */
        }
    signal(mutex);

        /* reading is performed */

    wait(mutex);
        read_count--;
        if (read_count == 0) {
            signal(rw_mutex);   /* last reader lets a waiting writer in */
        }
    signal(mutex);
} while (true);
```

A writer treats `rw_mutex` exactly like an ordinary mutual-exclusion lock — simple, by
design. Readers are the subtler half: `read_count` is itself shared data, incremented and
decremented by potentially many readers concurrently, so it needs its own protection —
`mutex` — or updating it would reproduce Lecture 13's race condition on `read_count` itself.

The key idea is that **only the first reader to arrive** (the one that pushes `read_count`
from `0` to `1`) actually acquires `rw_mutex`, locking out writers on behalf of every reader
that follows. Every subsequent concurrent reader simply increments `read_count` and goes
straight to reading — it never touches `rw_mutex` at all, which is exactly what allows all
of them to read genuinely in parallel. Symmetrically, **only the last reader to leave** (the
one that brings `read_count` back down to `0`) releases `rw_mutex`, re-opening the door for
a writer that may have been waiting.

## Key Takeaways

- The bounded-buffer problem needs three semaphores doing three separate jobs: `empty` and
  `full` (counting semaphores tracking free and filled slots) and `mutex` (a binary
  semaphore protecting the shared buffer index).
- **Order matters**: a counting semaphore (`empty`/`full`) must always be acquired *before*
  `mutex`, never after — reversing the order lets a blocked process hold `mutex` forever,
  deadlocking the system.
- The **first readers-writers problem** gives priority to readers: a reader is only ever
  made to wait if a writer already has the data, which can starve a writer under a steady
  stream of readers — the tradeoff a writer-preference variant exists to fix instead.
- The semaphore solution protects `read_count` with its own `mutex`, and uses `rw_mutex` as
  the single lock that only the first arriving reader acquires and only the last departing
  reader releases — letting every reader in between run fully in parallel.

[Lecture 16](lecture-16-classical-synchronization-problems-ii.md) closes out the classical
problems with the Dining Philosophers Problem — a case specifically chosen because its most
natural solution *deadlocks*, setting up the Deadlocks unit that follows.
