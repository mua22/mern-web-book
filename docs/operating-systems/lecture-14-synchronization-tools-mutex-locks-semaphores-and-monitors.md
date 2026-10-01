---
title: "14. Synchronization Tools: Mutex Locks, Semaphores, and Monitors"
tags:
  - CSC323
  - Operating Systems
  - Synchronization
  - Semaphores
  - Monitors
---

# 14. Synchronization Tools: Mutex Locks, Semaphores, and Monitors

Lecture 13 ended on an uncomfortable note: Peterson's solution, built entirely out of
ordinary shared reads and writes, is subtle enough that it needs a careful three-part proof
to trust — and even then, it can be silently broken by compiler or CPU reordering unless an
explicit memory barrier is added. Production operating systems do not take that risk. They
build synchronization on top of **hardware instructions specifically designed to execute as
one indivisible step**, and then wrap those primitives in progressively higher-level tools
so that application and kernel code almost never has to write a Peterson-style busy loop by
hand again. This lecture climbs that ladder: hardware instructions, then mutex locks, then
semaphores, then monitors.

## In This Lecture

- Two hardware instructions, `test_and_set()` and `compare_and_swap()`, and the one property
  that lets them succeed where Peterson's solution struggled: hardware-guaranteed atomicity
- Atomic variables, briefly, as a convenient layer built on top of those instructions
- **Mutex locks**: `acquire()`/`release()`, spinlocks, and when busy-waiting is genuinely the
  right engineering choice
- **Semaphores**: `wait()`/`signal()`, counting vs. binary semaphores, and a second job
  semaphores do that a plain mutex cannot — enforcing a required *order* between two
  processes' events
- Why a correct semaphore implementation must avoid busy-waiting too, by blocking the caller
- **Monitors**: automatic mutual exclusion plus condition variables, and exactly how a
  condition variable's `wait()`/`signal()` differs in meaning from a semaphore's

## Hardware Support: Atomic Instructions

The core problem with Peterson's solution is that *nothing* in it is atomic — every read and
every write is a separate, interruptible step, which is exactly why reordering can break it.
Modern CPUs provide instructions that the hardware itself guarantees execute as a single,
uninterruptible unit: no other core can observe, or interleave with, any intermediate state
partway through.

### `test_and_set()`

Conceptually, `test_and_set()` reads a boolean, unconditionally sets it to `true`, and
returns the value it had *before* the write — all as one atomic hardware step:

```c
boolean test_and_set(boolean *target) {
    boolean rv = *target;
    *target = true;
    return rv;
}
```

Because the read-and-write pair cannot be split by any other process, a correct mutual
exclusion lock falls out almost immediately:

```c
boolean lock = false;

void acquire_lock() {
    while (test_and_set(&lock)) {
        /* busy wait */
    }
}

void release_lock() {
    lock = false;
}
```

At most one caller can ever see `test_and_set()` return `false` for a given "session" of the
lock: the very act of checking the old value and setting it to `true` is indivisible, so the
first caller to execute it flips `lock` to `true` and gets `false` back (entry granted);
every other caller sees `lock` already `true`, gets `true` back, and keeps spinning.

### `compare_and_swap()`

`compare_and_swap()` (CAS) is a more general atomic instruction: it compares a memory
location against an expected value, and only if they match does it overwrite the location
with a new value — again, all in one indivisible step:

```c
int compare_and_swap(int *value, int expected, int new_value) {
    int temp = *value;
    if (temp == expected) {
        *value = new_value;
    }
    return temp;
}
```

A lock built from CAS looks very similar to the `test_and_set()` version:

```c
int lock = 0; /* 0 = free, 1 = held */

void acquire_lock() {
    while (compare_and_swap(&lock, 0, 1) != 0) {
        /* busy wait */
    }
}

void release_lock() {
    lock = 0;
}
```

A caller only succeeds in acquiring the lock when it is the one whose CAS call actually
found `lock == 0` and swapped in `1`; any caller that loses the race sees the swap fail (the
returned old value is `1`, not `0`) and loops again.

### Atomic Variables

Many systems also expose simple **atomic variables** — integers or counters with operations
like `atomic_inc()` — built directly on top of `compare_and_swap()`, typically as a
retry loop:

```c
void atomic_inc(int *v) {
    int old;
    do {
        old = *v;
    } while (compare_and_swap(v, old, old + 1) != old);
}
```

An atomic counter is useful exactly when the only thing being protected is a single number
(a reference count, a request counter) — it avoids the overhead of a full lock for an
operation that hardware can already do atomically on its own.

## Mutex Locks

A **mutex lock** (short for *mutual exclusion lock*) is the simplest synchronization tool: a
lock object with two operations, `acquire()` and `release()`, used to bracket a critical
section.

```c
acquire();
    /* critical section */
release();
```

The implementations above are **spinlocks** — if `acquire()` cannot get in immediately, it
busy-waits, repeatedly re-checking rather than yielding the CPU. Busy-waiting wastes CPU
cycles, but it is a genuinely reasonable choice, not just a crude fallback, when:

- the critical section is **short**, so the expected wait is brief;
- the system is a **multiprocessor**, so some *other* core is actively running the lock
  holder and is likely to finish soon; and
- the cost of **blocking and later waking the process** (a full context switch, possibly
  moving it off and back onto a CPU) would exceed the cost of simply spinning for that brief
  wait.

When any of these doesn't hold — long critical sections, or a single CPU where spinning
simply burns the one core that could otherwise be running the lock holder — a lock that
*blocks* the caller instead of spinning is the better design, which is exactly what a
correctly implemented semaphore provides.

## Semaphores

A **semaphore** `S` is an integer variable accessed only through two atomic operations,
traditionally called `wait()` (or `P`) and `signal()` (or `V`):

```c
wait(S) {
    while (S <= 0) {
        /* busy-wait, naive version shown for clarity */
    }
    S--;
}

signal(S) {
    S++;
}
```

- A **counting semaphore** can range over any integer value and is used to track how many
  instances of a resource are currently available (file handles, buffer slots, and so on).
- A **binary semaphore** is restricted to the values `0` and `1` and is used purely for
  mutual exclusion — functionally equivalent to a mutex lock.

### Semaphores Do More Than Mutual Exclusion: Event Ordering

A mutex only ever answers one question: *"is someone else in here right now?"* A semaphore
can answer a different, more general question: *"has a specific event already happened?"* —
which lets two unrelated processes enforce a required order between their actions, not just
exclude each other from a shared resource.

```c
semaphore sync = 0;

/* Process A */
statement_a1;
signal(sync);

/* Process B */
wait(sync);
statement_b1;
```

Because `sync` starts at `0`, `wait(sync)` in Process B cannot return until `sync` has been
incremented — which only happens after Process A executes `signal(sync)`, which only happens
after `statement_a1` has completed. No matter which process the scheduler happens to run
first, `statement_a1` is now guaranteed to finish before `statement_b1` begins. This
"A happens before B" guarantee has no equivalent built from a plain mutex alone.

## Implementing Semaphores Without Busy-Waiting

The naive `wait()` shown above busy-waits, which has exactly the drawback described for
spinlocks above when the wait could be long. A correct, production-quality semaphore
implementation instead **blocks the calling process** and places it on a waiting queue
associated with that semaphore, rather than spinning:

```c
typedef struct {
    int value;
    struct process *waiting_queue;
} semaphore;

void wait(semaphore *S) {
    S->value--;
    if (S->value < 0) {
        add_to_queue(S->waiting_queue, current_process);
        block(current_process);   /* removed from the CPU entirely, not spinning */
    }
}

void signal(semaphore *S) {
    S->value++;
    if (S->value <= 0) {
        struct process *P = remove_from_queue(S->waiting_queue);
        wakeup(P);                 /* P returns to the ready queue */
    }
}
```

Here `S->value` is allowed to go negative; its magnitude then counts how many processes are
currently blocked, waiting for a `signal()`. The `wait()`/`signal()` bodies themselves must
still execute atomically — achieved with `test_and_set()`/`compare_and_swap()`, or by
briefly disabling interrupts just for these few fixed instructions. That briefly revisits
Lecture 13's crude interrupt-disabling trick, but safely this time: the disabled window is a
handful of instructions with a known, bounded length, not an arbitrary, unbounded user-level
critical section.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three tools, three levels of abstraction</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Mutex Lock</span>
<span class="db-node-sub">acquire()/release() — pure mutual exclusion, busy-waits by default</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Semaphore</span>
<span class="db-node-sub">wait()/signal() on an integer — mutual exclusion AND event ordering; blocks instead of spinning</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Monitor</span>
<span class="db-node-sub">Shared data + procedures bundled together — mutual exclusion is automatic</span>
</div>
</div>
</div>

## Monitors

A **monitor** is a higher-level, language-provided construct: it bundles a module's shared
data together with the procedures that operate on it, and the compiler or runtime
*automatically* guarantees that at most one process is ever actively executing inside the
monitor at a time — the programmer never writes an `acquire()`/`release()` pair at all.

```c
monitor BoundedBuffer {
    int buffer[N];
    int count;

    condition not_full;
    condition not_empty;

    void insert(int item) {
        if (count == N) {
            not_full.wait();
        }
        /* place item into buffer */
        count++;
        not_empty.signal();
    }

    int remove() {
        if (count == 0) {
            not_empty.wait();
        }
        /* take an item out of buffer */
        count--;
        not_full.signal();
        return item;
    }
}
```

A process calling `insert()` or `remove()` is automatically the only one active inside
`BoundedBuffer` at that moment — the monitor's built-in mutual exclusion covers it for free.
What the monitor *cannot* do on its own is let a process wait for some condition on the
shared data to become true (the buffer is full; the buffer is empty) — that is exactly what
**condition variables** are for.

### Condition Variables vs. Semaphore Operations

A condition variable supports `wait()` and `signal()` too, but the names hide a genuinely
different meaning from a semaphore's `wait()`/`signal()`.

!!! warning "A condition variable has no memory; a semaphore does"
    - **Semaphore `signal()`** always increments the semaphore's internal count, even if no
      process is currently waiting. A *later* `wait()` call will find that incremented value
      and return immediately — the semaphore "remembers" that a signal happened.
    - **Condition variable `signal()`** wakes one waiting process *if one happens to be
      waiting at that exact moment*. If no process is waiting when `signal()` is called, the
      signal has **no effect at all** and is simply lost — nothing is remembered, and a
      process that calls `wait()` on that condition afterward blocks exactly as if the
      earlier `signal()` had never happened.

    There is a second difference just as important: a process calling a condition variable's
    `wait()` must **release the monitor's mutual-exclusion lock** while it sleeps — otherwise
    no other process could ever enter the monitor to call the `signal()` that would wake it,
    and the system would deadlock on itself. The monitor re-acquires that lock automatically
    for the waiting process once it is woken.

This is exactly why the order of operations inside `insert()`/`remove()` above matters:
`count == N` is checked (and `not_full.wait()` is only called) *before* the item is placed,
and the corresponding `signal()` is issued only *after* the shared state has actually
changed — a pattern every classical synchronization problem in the next two lectures
repeats.

## Key Takeaways

- `test_and_set()` and `compare_and_swap()` are **hardware-guaranteed atomic** instructions —
  the thing Peterson's solution has no way to guarantee for its plain reads and writes — and
  a correct mutual-exclusion lock can be built from either in a few lines.
- A **mutex lock** is the simplest synchronization tool, busy-waiting (a spinlock) by
  default — reasonable for short critical sections on a multiprocessor, wasteful otherwise.
- A **semaphore**'s `wait()`/`signal()` does two distinct jobs: ordinary mutual exclusion
  (as a binary semaphore) and **event ordering** between processes (as a counting
  semaphore initialized to `0`) — a capability a plain mutex does not have.
- A correct semaphore implementation **blocks** the caller on a waiting queue instead of
  busy-waiting, which is why semaphores scale to long waits where spinlocks do not.
- A **monitor** bundles shared data with its operations and provides mutual exclusion
  automatically; its **condition variables** let a process wait for application-specific
  conditions, but `signal()` on a condition variable is *lost* if no one is waiting — unlike
  a semaphore's `signal()`, which is always remembered.

[Lecture 15](lecture-15-classical-synchronization-problems-i.md) puts semaphores to work on
two of the most famous problems in operating systems: the bounded-buffer
(producer-consumer) problem and the readers-writers problem.
