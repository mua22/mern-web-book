---
title: "17. Midterm Review"
tags:
  - CSC323
  - Review
  - Midterm
  - CPU Scheduling
  - Synchronization
---

# 17. Midterm Review

This week is midterm exam week — there is no new topic to learn today. Instead, this
chapter is a **checkpoint**: a condensed tour of everything covered in Lectures 1–16, from
what an operating system actually *is* through the classical synchronization problems that
make concurrent code so easy to get subtly wrong. Four units got you here — OS Structure
and Design, Process Management with IPC and Threads, CPU Scheduling, and Process
Synchronization — and the exam draws from all four. Use this lecture to check which ideas
feel solid and which need another pass before you sit down to write.

## In This Lecture

- Consolidate your understanding of OS structure, the process concept, and the role of the
  kernel
- Compare every CPU scheduling algorithm covered so far, side by side, in one table
- Review the synchronization tools used to protect shared data, and when each one applies
- Revisit the classical synchronization problems and what each one is designed to test
- Self-test your recall with a short, answer-free quiz before the exam

## Concept Map

Each unit hands the next one a vocabulary it assumes fluency with. Unit 1 gives you the
operating system itself and the boundary between user mode and kernel mode; Unit 2 gives
you the process — the thing the OS actually schedules and synchronizes; Unit 3 decides
*which* ready process gets the CPU next; Unit 4 is what keeps processes that share data
from corrupting it while they wait their turn.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Lectures 1–16, four units</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Unit 1: OS Structure & Design</span>
<span class="db-node-sub">What an OS does, kernel designs, system calls, user/kernel mode</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Unit 2: Processes, IPC & Threads</span>
<span class="db-node-sub">Process states, the PCB, context switches, shared memory vs. message passing, threading models</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Unit 3: CPU Scheduling</span>
<span class="db-node-sub">Scheduling criteria, FCFS, SJF, Priority, Round Robin, multilevel queues</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Unit 4: Process Synchronization</span>
<span class="db-node-sub">Critical sections, semaphores, monitors, Producer-Consumer, Readers-Writers, Dining Philosophers</span>
</div>
</div>
</div>

Notice the dependency runs in one direction: you cannot reason about scheduling (Unit 3)
without first knowing what a process *is* and what state it can be in (Unit 2), and you
cannot reason about synchronization (Unit 4) without accepting that scheduling means
processes genuinely do interleave in ways you don't fully control. Nothing here is re-taught
after this point — only re-applied, starting with deadlocks in Lecture 19.

## Unit 1: OS Structure & Design — What You Must Remember

An operating system is the layer of software that manages hardware on behalf of every
running program, exposing a controlled set of **system calls** as the only legal way for a
user program to request a privileged operation. The **mode bit** is what makes this
enforceable: user mode restricts what an instruction stream is allowed to touch directly,
and only a trap into kernel mode — triggered by a system call, an interrupt, or an
exception — lets the CPU execute privileged instructions on the program's behalf.

Kernel designs trade off isolation against communication cost, and this trade-off is exactly
what distinguishes them:

| Kernel design | How it's organized | Trade-off |
|---|---|---|
| Monolithic | Nearly everything (drivers, file system, scheduler) runs in one kernel address space | Fast — one function call, no context switch — but one bad driver can crash the entire system |
| Layered | Strict layers, each built only on the layer below it | Easier to debug and reason about; still one address space |
| Microkernel | Only the bare minimum (IPC, basic scheduling, memory management) runs in kernel mode; everything else runs as a user-mode server | Most crash-resilient — a failing server can be restarted — but every service request now costs a message, not a function call |
| Hybrid | A small trusted core plus selected subsystems still running in kernel mode for speed | Most real production OSes (Windows, macOS/XNU, modern Linux with loadable modules) land here, not at either pure extreme |

!!! tip "If an exam question says 'crashes the whole system,' think monolithic"
    The fastest way to tell these apart on an exam is to ask what happens when one component
    fails. A monolithic kernel's components share one address space and one fault domain —
    a bug anywhere can bring down everything. A microkernel's servers are isolated processes;
    a crash is contained and often recoverable.

## Unit 2: Processes, IPC & Threads — What You Must Remember

A **process** is a program in execution, tracked by the OS through its **Process Control
Block (PCB)** — process state, program counter, CPU registers, memory limits, and I/O
status. A process moves between five states (new, ready, running, waiting, terminated), and
every transition between them is driven by the scheduler, an interrupt, or an I/O event — a
process never changes its own state unilaterally.

A **thread** is the actual unit the CPU executes; a process is the container that owns the
address space one or more threads share. Switching between threads of the *same* process is
far cheaper than switching between processes, because the address space, open files, and
most of the PCB don't need to change — only the per-thread register set and stack pointer
do.

<div class="db-diagram" markdown>
<p class="db-diagram-label">IPC: two fundamentally different strategies</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Shared memory</span>
<span class="db-node-sub">Processes read/write a region both can see directly — fast, but every access must be synchronized by the programmer (Unit 4's entire subject)</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Message passing</span>
<span class="db-node-sub">Processes exchange explicit send()/receive() messages through the kernel — slower (a kernel trap per message), but synchronization comes nearly for free</span>
</div>
</div>
</div>

Threading models describe how user-level threads map onto kernel-schedulable threads:
**many-to-one** multiplexes many user threads onto a single kernel thread (cheap to create,
but one blocking system call freezes every thread, and true parallelism across cores is
impossible since the kernel only ever sees one schedulable entity); **one-to-one** maps each
user thread to its own kernel thread (true parallelism, at the cost of a kernel-level
context switch per thread); **many-to-many** multiplexes many user threads onto a smaller or
equal pool of kernel threads, trying to capture the cheapness of the first model and the
parallelism of the second.

## Unit 3: CPU Scheduling — What You Must Remember

The scheduler's job is to pick which **ready** process gets the CPU next, judged against
several criteria at once: CPU utilization, throughput, turnaround time, waiting time, and
response time — and these criteria often pull in different directions, which is exactly why
no single algorithm dominates every workload.

| Algorithm | Preemptive? | Avg. Wait Time Optimality | Starvation Risk | Real-World Use |
|---|---|---|---|---|
| FCFS | No | Poor — one long job at the front causes a convoy effect for everyone behind it | None (strict first-in, first-out order) | Simple batch queues; almost never used alone |
| SJF (non-preemptive) | No | Optimal among non-preemptive algorithms, for a fixed, known batch of jobs | High — a long job can be pushed back indefinitely by a steady stream of shorter arrivals | Batch systems where burst times can be estimated in advance |
| SRTF (preemptive SJF) | Yes | Optimal overall — the lowest achievable average waiting time | High — same risk as SJF, sharpened by constant preemption | Rare in practice; mainly a theoretical lower bound to compare against |
| Priority Scheduling | Either | Not inherently optimal — entirely dependent on how priorities are assigned | High for low-priority processes, unless mitigated by **aging** | The underlying mechanism inside most general-purpose schedulers |
| Round Robin | Yes | Moderate — governed almost entirely by the time-quantum size | None — every process cycles through the ready queue in turn | Time-sharing and interactive systems; the default fairness building block |
| Multilevel Queue | Usually | Depends on the fixed priority given to each queue | Possible for lower queues if higher-priority queues never empty out | Separating batch workloads from interactive ones |
| Multilevel Feedback Queue | Yes | Good in practice — adapts to a process's observed CPU-vs-I/O behavior | Low — processes can migrate toward higher-priority queues over time | Closest conceptual model to real general-purpose OS schedulers |

!!! note "The quantum size is Round Robin's entire personality"
    A time quantum that's too large makes Round Robin degrade toward FCFS behavior (each
    process nearly runs to completion before preemption). A quantum that's too small makes
    context-switch overhead dominate actual useful work. The "right" quantum is a tuning
    problem, not a fixed constant — this is precisely why multilevel feedback queues exist:
    they let the *system* adapt the effective quantum per process instead of fixing one
    value for everyone.

## Unit 4: Process Synchronization — What You Must Remember

A **race condition** occurs when the outcome of concurrent execution depends on the precise
timing of interleaved operations on shared data. The **critical-section problem** asks for
a protocol around the shared-data access that guarantees three properties simultaneously:
**mutual exclusion** (only one process in its critical section at a time), **progress** (if
no process is in its critical section, one of the processes wanting in must eventually be
allowed to enter — the decision can't stall forever), and **bounded waiting** (a process
cannot be made to wait an unbounded number of turns while others repeatedly cut in line).

**Semaphores** generalize the lock into an integer, manipulated only through `wait()`
(decrement, block if the result would go negative) and `signal()` (increment, wake a waiting
process if one exists) — a **binary semaphore** behaves like a mutex lock; a **counting
semaphore** controls access to a pool of several identical resources. **Monitors** package a
lock together with the shared data and the only operations allowed to touch it, so the
programmer cannot forget to call `wait()`/`signal()` in the right place — the compiler
enforces it structurally instead.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The three classical synchronization problems, condensed</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Producer–Consumer</span>
<span class="db-node-sub">Bounded buffer; tests coordinating a count (empty/full slots) alongside mutual exclusion over the buffer itself</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Readers–Writers</span>
<span class="db-node-sub">Many readers may overlap safely; a writer needs total exclusivity — tests asymmetric access rules</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Dining Philosophers</span>
<span class="db-node-sub">Circular resource acquisition (forks); tests exactly the kind of cyclic waiting that causes deadlock</span>
</div>
</div>
</div>

!!! note "Dining Philosophers is a preview, not just a puzzle"
    Each philosopher trying to pick up both neighboring forks is a direct, physical model of
    a circular-wait: every philosopher holds one resource while waiting for another, held by
    the next philosopher around the table. If every philosopher picks up their left fork
    first, the table can deadlock completely. Lecture 19 names this pattern formally and
    gives you a vocabulary — hold-and-wait, circular wait — for exactly what goes wrong here.

## Key Takeaways

- The four units build on each other in one direction: structure and processes (Units 1–2)
  are *what* the scheduler (Unit 3) chooses among, and scheduling is *why* synchronization
  (Unit 4) is necessary at all — interleaving is a real, unavoidable consequence of letting
  a scheduler pick when each process runs.
- **Kernel design** is a trade-off between speed (monolithic) and fault isolation
  (microkernel); most real systems are hybrids.
- **Threads** share an address space and are cheaper to switch between than processes;
  **many-to-one** threading cannot achieve parallelism on a multicore machine no matter how
  many user threads exist, because the kernel only ever schedules one of them at a time.
- No scheduling algorithm wins on every criterion at once — know the preemption,
  optimality, and starvation trade-offs in the table above cold.
- The **critical-section problem**'s three requirements — mutual exclusion, progress,
  bounded waiting — are the yardstick every synchronization tool (locks, semaphores,
  monitors) is judged against.
- The three classical problems each isolate a different failure mode: counting shared
  slots (Producer–Consumer), asymmetric access (Readers–Writers), and circular waiting
  (Dining Philosophers) — the last of which is exactly where deadlock, starting Lecture 19,
  picks up.

## Self-Test

!!! tip "Check yourself"
    These questions have no answers printed below them on purpose — they're for
    self-assessment before the exam, not for re-reading a solution. Work through each one on
    paper; if you get stuck, that's the lecture to revisit.

1. Why does a microkernel improve fault isolation over a monolithic kernel, and what does it
   give up in exchange?
2. State the three requirements a correct critical-section solution must satisfy, and
   explain, in one sentence each, what would go wrong if one of them were violated.
3. A single CPU system has four processes with the arrival and burst times below. Compute
   the Gantt chart and the **average waiting time** under non-preemptive SJF.

    | Process | Arrival Time | Burst Time |
    |---|---|---|
    | P1 | 0 | 6 |
    | P2 | 2 | 2 |
    | P3 | 4 | 1 |
    | P4 | 5 | 4 |

4. Why can Round Robin's performance degrade toward FCFS if the time quantum is too large,
   and toward excessive overhead if it is too small?
5. A binary semaphore `mutex` is initialized to 1. Three processes each execute `wait(mutex)`
   in quick succession, with no corresponding `signal(mutex)` call in between. What is the
   state of each of the three processes, and what is the final value of `mutex`?
6. Explain, using your own words, how the Dining Philosophers problem models hold-and-wait
   and circular wait at the same time.
7. Distinguish a process from a thread in terms of what each one owns, and explain why a
   context switch between two threads of the same process is cheaper than a context switch
   between two unrelated processes.
8. Why is non-preemptive SJF described as "optimal among non-preemptive algorithms" rather
   than simply "optimal"? What algorithm, if any, beats it — and at what cost?

Lecture 18 turns this review into deliberate practice: four fully worked problems built to
mirror exactly the kind of question this midterm — and the final — will ask. Head there next:
[Lecture 18: Problem-Solving Workshop: Scheduling and Synchronization](lecture-18-problem-solving-workshop-scheduling-and-synchronization.md).
