---
title: "8. Introduction to Threads and Concurrency"
tags:
  - CSC323
  - Operating Systems
  - Threads
  - Concurrency
  - Parallelism
  - Amdahl's Law
---

# 8. Introduction to Threads and Concurrency

Lecture 6 described a process as the unit the OS creates, schedules, and tracks — complete
with its own private memory, its own PCB, its own place in the process-state diagram. That
picture is accurate, but it's also, in a sense, too coarse. A modern web browser renders a
page, plays a video, and responds to your typing all at what feels like the same time,
without spawning a brand-new, fully isolated process for each of those jobs. It does this
with **threads** — a second, finer-grained unit of execution living *inside* a single
process. This lecture introduces what a thread actually is, why threads exist at all, how
they compare to the full processes Lecture 6 covered, the genuinely different ideas of
concurrency and parallelism, and Amdahl's Law — the formula that tells you exactly how much
benefit you can expect from throwing more CPU cores at a problem.

## In This Lecture

- What a **thread** is, and exactly what it shares with its sibling threads vs. what it keeps
  private
- **Why threads exist**: responsiveness, resource sharing, economy, and scalability
- **Processes vs. threads**, compared directly
- **Concurrency vs. parallelism** — a frequently confused but genuinely different distinction
- **Amdahl's Law**: the formula bounding how much speedup more cores can actually deliver

## What Is a Thread?

A **thread** is a lightweight unit of execution within a process. Like a process, a thread
has its own program counter (tracking which instruction it's executing), its own set of CPU
registers, and its own stack (its own local variables and call history) — everything it needs
to be independently scheduled and run.

Unlike a process, a thread does **not** get its own private copy of everything else. All the
threads belonging to the same process share that process's code (text section), its global
data, its heap, and its open files. Picture a single process as a house, and its threads as
several people living in it: each person has their own bedroom (their own stack, their own
registers — private, personal space) but they all share the same kitchen, the same living
room, and the same front door (the process's code, data, and open files).

<div class="db-diagram" markdown>
<p class="db-diagram-label">One process, three threads — what's shared vs. what's private</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Shared across all threads</span>
<span class="db-node-sub">Code (text section), global data, heap, open files</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Private to each thread</span>
<span class="db-node-sub">Program counter, CPU registers, its own stack</span>
</div>
</div>
</div>

## Why Threads?

If a process can already do work, why introduce a second, smaller unit of execution inside
it? Four reasons, all of which show up constantly in real software:

- **Responsiveness** — a program can keep responding to the user even while part of it is
  busy. A word processor can keep accepting keystrokes and redrawing the cursor on one
  thread while a second thread runs a slow spell-check in the background, rather than
  freezing the whole application until the spell-check finishes.
- **Resource sharing** — threads of the same process automatically share memory and files
  without any special effort, which is both simpler and cheaper than the deliberate IPC
  mechanisms Lecture 7 needed for separate processes to exchange data.
- **Economy** — creating a thread, and switching the CPU between two threads of the same
  process, is considerably cheaper than creating a whole new process or context-switching
  between two separate processes, because there's no need to set up (or swap) a private
  address space, PCB-level memory tables, or a fresh set of open-file structures.
- **Scalability** — on a machine with multiple CPU cores, the threads of a single process can
  genuinely run at the same time on different cores, letting one program take direct
  advantage of hardware that a single-threaded program never could.

## Processes vs. Threads

<div class="db-relation" markdown>
<div class="db-relation-name">Processes vs. threads, compared</div>

| | Process | Thread |
|---|---|---|
| Address space | Its own, isolated from every other process | Shared with every other thread in the same process |
| Creation cost | Heavier — new memory tables, new PCB, new file structures | Lighter — reuses the parent process's existing structures |
| Context-switch cost | Heavier — may involve switching memory mappings | Lighter — registers and stack pointer change, address space does not |
| Communication with siblings | Requires IPC (shared memory or message passing, Lecture 7) | Direct — simply read or write the same shared memory |
| Failure isolation | A crashing process does not directly corrupt another process's memory | A misbehaving thread *can* corrupt data shared with its sibling threads, since there's no OS-enforced boundary between them |

</div>

!!! warning "Shared memory between threads is a double-edged sword"
    The same property that makes threads cheap and convenient — direct, unmediated access to
    shared data — is exactly what makes them dangerous without careful coordination. Two
    threads of the same process reading and writing the same shared variable at the same
    time face precisely the synchronization problem Lecture 7 flagged for shared-memory IPC,
    except now it's the *default*, not an opt-in choice — which is why a later unit of this
    course is devoted entirely to keeping concurrent access to shared data correct.

## Concurrency vs. Parallelism

These two words are used almost interchangeably in casual speech, but they describe two
genuinely different situations, and the difference matters once you start reasoning about
performance.

- **Concurrency** means multiple tasks are *making progress* over some interval of time,
  without necessarily running at the exact same instant. On a single-core CPU, two threads
  can be concurrent by rapidly interleaving — the scheduler runs a slice of thread A, then a
  slice of thread B, then back to A — so that, over any reasonably long interval, both appear
  to be progressing, even though only one instruction from only one thread is ever actually
  executing at any single point in time.
- **Parallelism** means multiple tasks are running **literally at the same instant**, which
  requires multiple physical execution units — multiple CPU cores, for instance — each
  actually executing a different thread's instructions simultaneously.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Concurrency (interleaved on one core) vs. parallelism (simultaneous on two cores)</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Concurrency — one core</span>
<span class="db-node-sub">Thread A, then Thread B, then Thread A again — interleaved, never truly simultaneous</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Parallelism — two cores</span>
<span class="db-node-sub">Thread A on Core 1 and Thread B on Core 2, genuinely executing at the same instant</span>
</div>
</div>
</div>

!!! tip "Every parallel system is concurrent, but not every concurrent system is parallel"
    A single-core machine running a multithreaded program is concurrent — many threads are
    all making progress — but it is never truly parallel, because there is only one core to
    execute on. A multicore machine *can* be genuinely parallel, but only if the scheduler
    actually places different threads on different cores at the same moment; if it doesn't
    (or if there's only one runnable thread at a time), the same multicore machine is merely
    concurrent too. Parallelism requires the hardware to support it; concurrency is purely a
    property of how the software is structured and scheduled.

## Amdahl's Law

Once a program has multiple threads that genuinely can run in parallel, the obvious next
question is: how much faster does adding more cores actually make it? **Amdahl's Law**
answers that question, and the answer is less generous than intuition suggests, because
essentially every real program has *some* portion that must run serially — one thread at a
time, no matter how many cores are available (setup code, a final step that combines every
thread's partial result, access to some resource that can't be split up).

Amdahl's Law states the maximum possible speedup as:

```text
                  1
speedup  ≤  ─────────────
            S + (1 − S)/N
```

where **S** is the fraction of the program that must run serially, **(1 − S)** is the
fraction that can be parallelized, and **N** is the number of processor cores available.

**Worked example.** Suppose a program is 40% serial — `S = 0.4`, and the remaining 60% can
be split across as many cores as you have. Work out the speedup at a few values of N:

<div class="db-relation" markdown>
<div class="db-relation-name">Speedup for a program that is 40% serial (S = 0.4)</div>

| Cores (N) | Calculation | Speedup |
|---|---|---|
| 2 | 1 / (0.4 + 0.6/2) = 1 / (0.4 + 0.3) | **1.43×** |
| 4 | 1 / (0.4 + 0.6/4) = 1 / (0.4 + 0.15) | **1.82×** |
| 8 | 1 / (0.4 + 0.6/8) = 1 / (0.4 + 0.075) | **2.11×** |
| ∞ | 1 / (0.4 + 0.6/∞) = 1 / 0.4 | **2.5×** |

</div>

Notice how little is gained between N = 4 and N = 8 (1.82× to 2.11×), and that even with an
*infinite* number of cores, the speedup never exceeds **2.5×** — because as N grows, the
parallel term `(1 − S)/N` shrinks toward zero, leaving the speedup bound entirely by the
serial fraction: `1/S`. With 40% of the program forced to run one instruction at a time no
matter what, nothing — no amount of additional hardware — can ever push the overall speedup
past `1/0.4 = 2.5`.

!!! note "The headline example from the lecture plan: 25% serial caps you at 4×"
    The same formula, run with `S = 0.25`, gives a maximum possible speedup of `1/0.25 = 4×`
    as `N → ∞` — no matter whether you add 8 cores, 64 cores, or 1,000 cores. This is Amdahl's
    Law's central, slightly humbling lesson: the serial portion of a program, however small,
    sets a hard ceiling on parallel speedup that more hardware alone can never break through.
    The only way past that ceiling is to reduce `S` itself — redesigning the algorithm so less
    of it is forced to run serially in the first place.

!!! warning "Amdahl's Law is why 'just add more cores' eventually stops working"
    It's tempting to assume doubling the number of cores roughly doubles performance. Amdahl's
    Law shows that assumption breaks down fast once any serial portion exists at all — the
    worked example above gained only another 0.29× speedup going from 4 cores all the way to
    infinity. Identifying and shrinking a program's serial fraction is usually a far more
    productive investment than buying more cores for a program that already has a
    significant one.

## Key Takeaways

- A **thread** is a lightweight unit of execution inside a process, with its own program
  counter, registers, and stack, but sharing its process's code, data, heap, and open files
  with every sibling thread.
- Threads exist for **responsiveness**, **resource sharing**, **economy** (cheaper to create
  and switch than a full process), and **scalability** across multiple cores.
- **Processes** give strong isolation at a heavier cost; **threads** are cheap and share
  memory directly, which is convenient but removes the OS-enforced boundary that kept
  processes from corrupting each other.
- **Concurrency** is multiple tasks making progress, possibly interleaved on one core;
  **parallelism** is multiple tasks executing at the literal same instant on multiple cores —
  every parallel system is concurrent, but not every concurrent system is parallel.
- **Amdahl's Law**, `speedup ≤ 1 / (S + (1−S)/N)`, bounds the maximum possible speedup from
  parallelizing a program by its serial fraction `S` — a program that's 40% serial can never
  exceed a 2.5× speedup, no matter how many cores are thrown at it.

Next: **[Lecture 9 — Multicore Programming and Multithreading Models](lecture-09-multicore-programming-and-multithreading-models.md)**.
