---
title: "9. Multicore Programming and Multithreading Models"
tags:
  - CSC323
  - Operating Systems
  - Multicore Programming
  - Multithreading Models
  - Pthreads
---

# 9. Multicore Programming and Multithreading Models

[Lecture 8](lecture-08-introduction-to-threads-and-concurrency.md) introduced the thread as
a lighter-weight unit of execution living inside a process, and showed *why* you'd want
several of them — a web server handling one client per thread, a word processor keeping its
UI responsive while it spell-checks in the background. That lecture's examples all worked
even on a machine with a single CPU core: threads bought you responsiveness and a cleaner
program structure through **interleaving**, one core rapidly switching between threads so
closely in time it looks simultaneous. This lecture is about what changes once the hardware
actually has more than one core — multiple threads genuinely running **at the same instant**,
not just interleaved — and about the different ways an operating system can connect the
threads a programmer creates to the cores that actually execute them.

## In This Lecture

- Five concrete challenges that multicore hardware introduces for programmers, beyond what
  single-core concurrency already demanded
- **User threads** vs. **kernel threads**, and why the relationship between them matters
- The three multithreading models — **many-to-one**, **one-to-one**, and **many-to-many** —
  and the tradeoffs each one makes
- Where Pthreads, Windows threads, and Java threads fit into that picture

## Multicore Programming Challenges

A single-core system running multiple threads only ever *interleaves* them — at any given
instant, exactly one instruction from exactly one thread is executing, and the illusion of
simultaneity comes entirely from how fast the core switches between them. A **multicore**
system breaks that assumption: with N cores, up to N threads can execute truly
simultaneously, each making independent forward progress at the same moment in real time.
That sounds like a pure win — more cores, more work done per second — but it only pays off
if the programmer's code is actually structured to take advantage of it, and restructuring
sequential logic into genuinely concurrent logic raises five distinct problems.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Five challenges multicore programming adds on top of single-core concurrency</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Identifying tasks</span> <span class="db-node-sub">— finding pieces of the program that can genuinely run independently of each other, rather than one long sequential chain</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Balance</span> <span class="db-node-sub">— giving each core roughly equal-value work, so no core finishes early and sits idle while another is still grinding</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Data splitting</span> <span class="db-node-sub">— dividing the data a task operates on into pieces that different cores can safely process at once</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Data dependency</span> <span class="db-node-sub">— one task's output feeds directly into another task's input, which puts a hard limit on how much of the work can actually run in parallel</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Testing and debugging</span> <span class="db-node-sub">— genuinely simultaneous execution produces far more possible interleavings of events than a single core's interleaving ever could</span></div>
</div>
</div>

**Identifying tasks.** The first step is architectural, not algorithmic: look at the
program and find pieces of work that don't depend on one another's results, and could
therefore be handed to different cores. A program that resizes 10,000 independent image
files is full of this kind of task — resizing image #342 has nothing to do with resizing
image #7,891. A program that computes a running total by reading a file line by line and
accumulating a sum, by contrast, offers almost nothing to split — each step genuinely needs
the previous step's result.

**Balance.** Finding independent tasks isn't enough if they're wildly different sizes.
Splitting a workload into one task that takes 10 seconds and three tasks that take 1 second
each, then handing one task to each of four cores, leaves three cores idle for 9 seconds
waiting on the fourth — the program runs only as fast as its single slowest piece. Balance
means dividing the *value* of the work evenly, not just the *count* of tasks.

**Data splitting.** Just as the tasks themselves must be divided, the data those tasks
operate on must be divided safely alongside them. Processing a large array across four
cores by giving each core a contiguous quarter of the array is safe, because no two cores
touch the same elements; giving every core a pointer to the *whole* array and trusting them
not to collide is how you end up needing the synchronization tools covered starting in
[Lecture 13](lecture-13-race-conditions-and-the-critical-section-problem.md).

**Data dependency.** Some tasks cannot be split cleanly no matter how the data is divided,
because one task's *output* is another task's *input*. If step B needs the number step A
just computed, B cannot start until A finishes — the two are serialized, however many idle
cores are sitting around. Real programs are usually a mix: wide stretches of independent
work punctuated by dependency points that briefly force everything back onto one chain,
and the dependency points set a hard ceiling on the speedup more cores can ever deliver.

**Testing and debugging.** A single core's concurrency bugs are already hard to reproduce,
because they depend on exactly when a context switch happens to land. True parallelism
multiplies this: with threads genuinely running at the same instant on different cores,
the number of possible relative orderings of their operations explodes, and a bug that
depended on one specific, rare ordering of events might show up once in ten thousand runs
on the developer's machine and never again until it corrupts a customer's data in
production. This is exactly the motivation for the formal synchronization tools the next
unit introduces — "just be careful" does not scale to this many possible interleavings.

!!! warning "More cores are not a free performance upgrade"
    A program that was written as one long sequential chain of dependent steps runs no
    faster on a 16-core machine than on a 1-core machine — extra cores only help the parts
    of the problem that were actually restructured to be independent. Identifying tasks,
    balancing them, and respecting data dependencies is *work the programmer has to do*;
    the hardware cannot discover parallelism that was never designed into the program.

## Multithreading Models

Lecture 8 drew the picture of a process containing several threads, but left one detail
unexamined: *who actually schedules those threads onto the CPU?* The answer splits threads
into two kinds that live at two different levels:

- A **user thread** is managed entirely by a **thread library** running in user space (e.g.
  Pthreads) — the operating system kernel doesn't necessarily know these threads exist as
  separate entities at all.
- A **kernel thread** is managed directly by the operating system kernel, which is the only
  thing that can actually schedule work onto a physical core.

Because user threads are what the programmer creates and kernel threads are what the
hardware actually runs, there has to be some **mapping** between the two — and that mapping
is exactly what a *multithreading model* defines. There are three of them.

### Many-to-One

Many user threads map onto a **single** kernel thread. The thread library does all the
scheduling of user threads in user space, and the kernel sees the whole process as just one
schedulable entity, completely unaware that it internally contains several threads.

- **Advantage:** thread creation and context switching between user threads stay entirely
  in user space, with no kernel involvement — both operations are very fast.
- **Disadvantage:** if one user thread makes a blocking system call (e.g. waiting on disk
  I/O), the single underlying kernel thread blocks, which blocks the *entire process* —
  every other user thread inside it stops too, even though they had nothing to do with the
  blocking call.
- **Disadvantage:** because there is only ever one kernel thread, the kernel can schedule
  at most one of this process's threads at a time — **no true parallelism**, even on a
  machine with many idle cores.

### One-to-One

Each user thread maps to its **own**, dedicated kernel thread.

- **Advantage:** true parallelism — the kernel can schedule several of this process's
  threads onto several cores at the same instant, and one thread blocking on I/O never
  affects any other thread.
- **Disadvantage:** every thread creation requires creating a corresponding kernel thread,
  which is comparatively expensive, and many implementations cap how many kernel threads
  a single process may create.

!!! note "This is what Linux and Windows actually use"
    Despite the overhead, the one-to-one model's simplicity and guaranteed parallelism won
    out in practice — both Linux (via the NPTL implementation) and Windows map every user
    thread directly onto its own kernel thread.

### Many-to-Many

Many user threads are multiplexed onto a **smaller or equal** number of kernel threads —
not forced down to exactly one (many-to-one's bottleneck), and not forced up to one-per-user-
thread (one-to-one's overhead) either.

- **Advantage:** a programmer can create as many user threads as the problem calls for
  without paying one-to-one's full kernel-thread cost for each of them, *and* the kernel
  can still run several of that process's threads in parallel, since more than one kernel
  thread is available to schedule them onto.
- **Advantage:** if one user thread blocks on a system call, the thread library can move a
  *different* ready user thread onto a kernel thread that's now free, so the whole process
  doesn't stall the way it does under many-to-one.
- **Disadvantage:** this flexibility is bought with real implementation complexity — the
  thread library and the kernel scheduler both need to cooperate (historically via
  mechanisms like Solaris's scheduler activations) to decide which user thread rides which
  kernel thread at any given moment, which is considerably harder to build correctly than
  either of the other two models.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The three multithreading models, compared</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Many-to-One</span>
<span class="db-node-sub">Many user threads → 1 kernel thread. Cheapest to create/switch; one blocking call stalls everything; zero parallelism on multicore.</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">One-to-One</span>
<span class="db-node-sub">1 user thread → 1 kernel thread each. True parallelism; costlier creation; often a cap on thread count. Used by Linux and Windows.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Many-to-Many</span>
<span class="db-node-sub">Many user threads → fewer-or-equal kernel threads. Best of both — but the most complex model to implement correctly.</span>
</div>
</div>
</div>

| | Many-to-One | One-to-One | Many-to-Many |
|---|---|---|---|
| Creation / switch cost | Very low (user space only) | Higher (kernel involved every time) | Low-to-moderate |
| Parallelism on multicore | None | Full | Full (bounded by kernel thread count) |
| One thread blocks on I/O | Entire process blocks | Only that thread blocks | Thread library can migrate another ready thread in |
| Implementation complexity | Simple | Simple | Hard — needs library/kernel cooperation |

!!! tip "The question to ask when you see a new threading model"
    Whichever model you're reading about, ask two questions: *"if one thread makes a
    blocking system call, what else stops?"* and *"if I have 8 idle cores, can this process
    actually use more than one of them at once?"* Those two questions alone distinguish all
    three models cleanly.

## Multithreading Libraries

A **multithreading library** is what a programmer actually calls to create and manage
threads — and which multithreading model backs that library depends on the operating
system underneath it.

- **Pthreads** — the POSIX standard for thread creation and synchronization, specified as a
  set of C APIs (`pthread_create`, `pthread_join`, and the mutex/condition-variable
  primitives covered starting in Lecture 14), not an implementation. Depending on the
  operating system implementing it, Pthreads can sit on top of any of the three models —
  in practice, on Linux, it's one-to-one.
- **Windows threads** — kernel-level by design, matching Windows' own one-to-one model
  directly; there is no separate "user-level" Windows thread to distinguish from its
  kernel thread.
- **Java threads** — managed by the JVM, but a JVM thread is not an independent fourth
  model; it is ultimately implemented using whatever threading model the host operating
  system provides (typically via Pthreads on Linux, or native Windows threads on Windows),
  so a Java thread's real scheduling behavior inherits the host OS's model underneath it.

A minimal Pthreads example shows the shape every C thread program shares — create some
threads, each running a function, then wait for them to finish:

```c
#include <pthread.h>
#include <stdio.h>

void *print_hello(void *arg) {
    long id = (long) arg;
    printf("Hello from thread %ld\n", id);
    return NULL;
}

int main(void) {
    pthread_t threads[4];

    for (long i = 0; i < 4; i++)
        pthread_create(&threads[i], NULL, print_hello, (void *) i);

    for (int i = 0; i < 4; i++)
        pthread_join(threads[i], NULL);

    return 0;
}
```

`pthread_create()` spawns a new thread running `print_hello`, passing it one argument;
`pthread_join()` blocks the calling thread until the specified thread finishes — without
it, `main()` could reach `return 0` and tear the process down before the four threads ever
got to print anything.

## Key Takeaways

- Multicore hardware turns threads from an *interleaving* illusion into *genuine*
  simultaneous execution, which only pays off if the programmer has done the work of
  **identifying independent tasks**, **balancing** them, **splitting data** safely, tracking
  **data dependencies**, and accepting that **testing and debugging** is fundamentally
  harder once interleavings are no longer limited to one core's worth of switching.
- A **user thread** is managed by a thread library in user space; a **kernel thread** is
  scheduled directly by the OS — the **multithreading model** is the mapping between them.
- **Many-to-one** is cheap but blocks entirely on one thread's blocking call and gets no
  multicore parallelism; **one-to-one** (Linux, Windows) gets full parallelism at a higher
  creation cost; **many-to-many** tries to get both, at the price of real implementation
  complexity.
- **Pthreads**, **Windows threads**, and **Java threads** are libraries, not models — each
  one's actual scheduling behavior is inherited from whichever model the underlying OS
  implements.

With threads and their underlying models in place, the next three lectures turn to the
question every multiprogrammed OS has to answer constantly: *of everything ready to run
right now, what runs next?* Continue to
[Lecture 10 — CPU Scheduling: Concepts and FCFS](lecture-10-cpu-scheduling-concepts-and-fcfs.md).
