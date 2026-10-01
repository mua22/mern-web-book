---
title: "6. Process Concept and Process States"
tags:
  - CSC323
  - Operating Systems
  - Processes
  - Process Control Block
  - Process States
---

# 6. Process Concept and Process States

A program sitting on disk — a compiled executable, a `.py` file, an `.exe` — is completely
inert. It cannot do anything by itself; it's just bytes. The moment you run it, the operating
system takes that inert program and turns it into something alive: something with its own
memory, its own place in line for the CPU, its own state that changes from one instant to the
next. That living thing is a **process**, and the distinction between "a program" and "a
process" is one of the most important ideas in this entire course — nearly everything an
operating system does, from scheduling to memory management to protection, is really about
managing processes. This lecture introduces the process concept properly, the states a
process moves through during its life, the data structure the OS uses to keep track of it,
and the operations — creation and termination — that bring a process into existence and
eventually end it.

## In This Lecture

- The **process concept**: why a process is not the same thing as a program
- The **process state diagram**: New, Ready, Running, Waiting, and Terminated, and exactly
  what moves a process between them
- The **Process Control Block (PCB)**: what the OS stores about every process, and why
- **Process scheduling**: scheduling queues and what a **context switch** actually costs
- **Process creation** with `fork()`, `exec()`, and `wait()`
- **Process termination**, including the zombie vs. orphan process distinction

## The Process Concept

A **process** is a program *in execution*. That sounds like a small distinction from "a
program," but it is not — a program is a static set of instructions and data sitting on
disk, while a process is a dynamic entity: instructions actively being fetched and executed,
a program counter tracking exactly which instruction is next, a stack growing and shrinking
as functions are called and return, and a region of memory holding whatever values the
program has computed so far.

!!! tip "A recipe vs. the act of cooking"
    A program is like a recipe card: a fixed, passive set of instructions that doesn't change
    no matter how many times you read it. A process is like actually *cooking* from that
    recipe — a specific person, at a specific stove, at a specific point in the instructions
    (maybe step 4 of 9), with specific ingredients already measured out on the counter (the
    process's own memory and data). Two people can cook from the exact same recipe card at
    the same time, in two different kitchens, at two different steps, using two different
    sets of ingredients — exactly the way two processes can run from the exact same program
    on disk (open two windows of the same text editor) while being two entirely separate,
    independently-tracked processes as far as the OS is concerned.

A process, as the OS sees it, is made up of several distinct parts:

- **Text (code) section** — the program's actual machine instructions.
- **Program counter and CPU registers** — the process's current position in its own
  instructions and whatever values its computation currently depends on.
- **Stack** — temporary data: function parameters, return addresses, local variables, growing
  and shrinking as functions are entered and exited.
- **Data section** — the program's global variables.
- **Heap** — memory dynamically allocated while the process runs (what `malloc()` or `new`
  hand out).

Running the *same* executable twice — two terminal windows both running a shell, say —
produces two processes, each with its own stack, its own heap, its own program counter, and
its own notion of "where am I right now." They happen to share the same underlying program,
but they are, from the moment each is launched, completely independent as far as the
operating system is concerned.

## Process States

Over its lifetime, a process doesn't just run continuously from start to finish. It moves
through a well-defined set of **states**, and the operating system is constantly tracking
which state every process is currently in.

- **New** — the process is being created; the OS is setting up the bookkeeping it needs
  (covered below, under the PCB) but the process hasn't yet been admitted to compete for the
  CPU.
- **Ready** — the process has everything it needs to run and is simply waiting for the CPU
  scheduler to pick it.
- **Running** — the process's instructions are actually being executed by the CPU right now.
  On a single-core machine, at most one process is ever in this state at a time.
- **Waiting** (also called **Blocked**) — the process cannot proceed until some event occurs
  — most commonly, an I/O operation it requested (reading a file, waiting on network data)
  hasn't completed yet.
- **Terminated** — the process has finished executing (or was forcibly ended) and is being
  removed from the system.

<div class="os-svg-diagram" markdown>
<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="osstate-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <circle cx="70" cy="70" r="55" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="2"/>
  <text x="70" y="75" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="var(--cu-text)">New</text>
  <circle cx="320" cy="70" r="55" fill="#12B394" stroke="#12B394" stroke-width="2"/>
  <text x="320" y="75" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="#06110D">Ready</text>
  <circle cx="570" cy="70" r="55" fill="#6C4FF5" stroke="#6C4FF5" stroke-width="2"/>
  <text x="570" y="75" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">Running</text>
  <circle cx="570" cy="260" r="55" fill="var(--cu-surface-alt)" stroke="var(--cu-border-soft)" stroke-width="2"/>
  <text x="570" y="265" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="15" fill="var(--cu-text)">Terminated</text>
  <circle cx="320" cy="260" r="55" fill="#B9720E" stroke="#B9720E" stroke-width="2"/>
  <text x="320" y="265" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF">Waiting</text>
  <line x1="125" y1="70" x2="258" y2="70" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#osstate-arrow)"/>
  <text x="192" y="58" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">admitted</text>
  <line x1="378" y1="70" x2="508" y2="70" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#osstate-arrow)"/>
  <text x="443" y="58" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">scheduler dispatch</text>
  <line x1="320" y1="125" x2="320" y2="205" stroke="var(--cu-muted)" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#osstate-arrow)"/>
  <text x="255" y="168" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="var(--cu-faint)">interrupt /</text>
  <text x="255" y="182" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="11" fill="var(--cu-faint)">time slice expired</text>
  <line x1="545" y1="123" x2="400" y2="222" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#osstate-arrow)"/>
  <text x="500" y="195" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">I/O or event wait</text>
  <line x1="375" y1="222" x2="517" y2="123" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#osstate-arrow)"/>
  <text x="440" y="240" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">I/O or event complete</text>
  <line x1="570" y1="125" x2="570" y2="205" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#osstate-arrow)"/>
  <text x="615" y="168" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="var(--cu-muted)">exit</text>
</svg>
</div>

Walking through each transition by name:

- **Admitted** — New → Ready. The OS finishes setting up the process's bookkeeping and adds
  it to the ready queue, where it now competes for CPU time.
- **Scheduler dispatch** — Ready → Running. The CPU scheduler picks this process (by whatever
  scheduling policy is in effect — a topic for a later lecture) and hands it the CPU.
- **Interrupt / time-slice expired** — Running → Ready. The process is forced off the CPU
  without having finished — either its allotted time slice ran out under a preemptive
  scheduler, or a higher-priority process needs to run. The process itself didn't choose to
  stop; it's simply paused and put back in line.
- **I/O or event wait** — Running → Waiting. The process itself requests something it can't
  have immediately — reading from disk, waiting for a network packet, waiting for user input
  — and voluntarily gives up the CPU until that event happens.
- **I/O or event complete** — Waiting → Ready. Whatever the process was blocked on has now
  happened; it's ready to run again, but must still wait its turn for the scheduler.
- **Exit** — Running → Terminated. The process finishes its last instruction (or is forcibly
  killed), and the OS begins reclaiming its resources.

!!! warning "A waiting process can't go straight back to Running"
    It's a common mix-up to draw an arrow directly from Waiting back to Running. That's
    wrong: when an I/O operation completes, the process only becomes eligible to run again —
    it moves to Ready and must still be selected by the scheduler like every other ready
    process. On a busy system, a process can sit in Ready for a while even after the event
    it was waiting for has already happened.

## The Process Control Block (PCB)

For every process it manages, the OS maintains a data structure called the **Process Control
Block (PCB)** (also called a *task control block*) — essentially the process's complete
identity card, holding everything the OS needs to pause the process, resume it later exactly
where it left off, and make scheduling decisions about it.

<div class="db-relation" markdown>
<div class="db-relation-name">Process Control Block — fields and purpose</div>

| Field | What it stores | Why the OS needs it |
|---|---|---|
| Process state | New, Ready, Running, Waiting, or Terminated | Tells the OS what to do with this process next |
| Process ID (PID) | A unique identifier for this process | Lets the OS (and other processes) refer to this exact process unambiguously |
| Program counter | The address of the next instruction to execute | Lets execution resume at exactly the right place after being paused |
| CPU registers | The contents of every general-purpose and status register | Must be restored exactly as they were, or the resumed computation would be wrong |
| CPU-scheduling information | Priority, pointers to scheduling queues, scheduling parameters | Lets the scheduler decide which Ready process runs next |
| Memory-management information | Base/limit registers, page tables, or segment tables | Tells the OS exactly which memory belongs to this process |
| Accounting information | CPU time used, time limits, process owner | Used for billing, limits, and performance monitoring |
| I/O status information | List of open files, list of allocated I/O devices | Lets the OS track what resources this process is currently using |

</div>

The PCB is the reason a process can be paused mid-instruction and resumed later as if nothing
happened: every piece of information needed to reconstruct its exact state is sitting in its
PCB, maintained by the OS, independent of whatever is currently loaded in the actual CPU.

## Process Scheduling

With potentially hundreds of processes on a system and only a handful of CPU cores, the OS
needs to organize processes so the scheduler can efficiently find the right one to run next.
It does this with **scheduling queues**:

- **Job queue** — every process in the system, in every state, from the moment it's created
  until it terminates.
- **Ready queue** — specifically the processes currently in the Ready state, waiting for a
  turn on the CPU.
- **Device queues** — one per I/O device, holding the processes currently waiting for that
  specific device to become available or finish an operation.

A process moves between these queues constantly over its lifetime — the Ready queue when it
can run, a specific device queue while it's waiting on that device's I/O, and back to the
Ready queue once that I/O completes — exactly tracing the Ready ↔ Waiting cycle in the state
diagram above.

### Context Switching

When the scheduler decides to take the CPU away from one process and give it to another, the
OS performs a **context switch**: it saves the current process's entire CPU state (program
counter, registers — everything the PCB tracks) into that process's PCB, then loads the
*next* process's previously-saved state from *its* PCB back into the CPU.

!!! warning "A context switch is pure overhead — no useful work happens during one"
    This is worth stating plainly: while the OS is busy saving one process's state and
    loading another's, **neither process is making progress**. Every microsecond spent on a
    context switch is a microsecond the CPU isn't running any application's actual code. This
    is exactly why operating systems work hard to make context switches fast, and why
    switching contexts too frequently (as a badly-tuned scheduler might) can hurt overall
    system throughput even though each individual switch looks "fair."

## Process Operations

A process's life has two bookends: how it comes into existence, and how it ends.

### Process Creation

A running process can create new processes — the creating process is the **parent**, and the
new one is its **child**, forming a tree of processes going all the way back to whatever
process the OS started first when it booted. Two operations, most associated with Unix-style
systems, do the actual work:

- **`fork()`** — creates a new process that is (initially) a near-identical copy of the
  calling process: same code, same data, same open files, a separate copy of memory. After
  `fork()` returns, there are now *two* processes running the same program from the same
  point, distinguishable only by `fork()`'s return value (zero in the child, the child's PID
  in the parent).
- **`exec()`** — replaces the calling process's entire memory image (code, data, stack) with
  a *new* program. The process itself continues to exist with the same PID, but it is now
  running completely different code from the start.
- **`wait()`** — lets a parent process pause itself until one of its children finishes
  executing, so it can find out how that child terminated before continuing.

The common pattern — a shell launching a new program — chains all three together: `fork()` a
child, have that child immediately `exec()` the program the user asked for, while the parent
calls `wait()` to pause until the child finishes.

```c
pid_t pid = fork();

if (pid == 0) {
    /* Child process: replace this process's own image with /bin/ls */
    execlp("ls", "ls", "-l", NULL);
    /* exec() only returns here if it failed */
    perror("exec failed");
} else if (pid > 0) {
    /* Parent process: wait for the child to finish */
    int status;
    wait(&status);
    printf("Child finished.\n");
} else {
    perror("fork failed");
}
```

<div class="db-diagram" markdown>
<p class="db-diagram-label">fork → exec → wait, traced through parent and child</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Parent calls fork()</span>
<span class="db-node-sub">Child process created as a near-copy</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Child calls exec()</span>
<span class="db-node-sub">Child's memory image replaced with the new program</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Parent calls wait()</span>
<span class="db-node-sub">Parent blocks until the child terminates</span>
</div>
</div>
</div>

!!! note "fork() doesn't run new code — exec() does"
    A very common point of confusion: `fork()` by itself does **not** let a process run a
    different program. It only duplicates the *current* process. If the child never calls
    `exec()`, it simply keeps running the exact same code the parent was running, just as an
    independent process. `exec()` is the operation that actually swaps in a new program —
    that's why the two are almost always used together when the goal is "run a different
    program as a child process."

### Process Termination

A process ends, normally, by calling `exit()` — it finishes its last instruction and asks the
OS to reclaim its resources. A process can also be ended abnormally by `abort()`, typically
because it hit an unrecoverable error or because its parent (or the OS) decided to kill it.

When a parent terminates, some operating systems practice **cascading termination**: if the
parent cannot continue, none of its children are allowed to continue unsupervised either, so
the OS terminates them as well, all the way down that branch of the process tree.

Two specific, easily-confused situations come up around termination:

- A **zombie process** has already finished executing — it called `exit()`, and the OS has
  reclaimed its memory and other resources — but its entry still exists in the process table
  because its parent hasn't yet called `wait()` to collect its exit status. A zombie is, in a
  very literal sense, a corpse: done running, but not yet fully removed from the system's
  bookkeeping.
- An **orphan process** is the opposite situation: its *parent* terminated first, while the
  child was still running. Rather than leave the child parentless, the OS typically
  **reparents** it to a designated process — on Unix-like systems, usually `init`, PID 1 —
  which exists partly to adopt orphans and eventually call `wait()` on their behalf so they
  don't linger as zombies forever.

<div class="db-grid-2" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Zombie</span>
<span class="db-node-sub">Child has exited; parent hasn't called wait() yet to collect its status</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Orphan</span>
<span class="db-node-sub">Parent terminated first; child is reparented, typically to init (PID 1)</span>
</div>
</div>

!!! tip "Zombie vs. orphan — which process is the problem?"
    If you're trying to keep the two straight: a **zombie** is a problem with the *child*
    being stuck in limbo because the *parent* hasn't cleaned up after it. An **orphan** is a
    problem with the *parent* being gone while the *child* is still very much alive. They're
    phrased as a mirror image of each other for exactly that reason — one names the dead one
    the system hasn't buried, the other names the living one that lost its guardian.

## Key Takeaways

- A **process** is a program in execution — a dynamic entity with its own memory, program
  counter, and stack — not the same thing as the static program file it was launched from.
- A process moves through the states **New, Ready, Running, Waiting, Terminated**, driven by
  specific transitions: admitted, scheduler dispatch, interrupt/time-slice expiry, I/O or
  event wait, I/O or event completion, and exit.
- The **PCB** is the OS's per-process record of everything needed to pause and later resume
  that exact process — state, program counter, registers, scheduling info, memory info,
  accounting info, and I/O status.
- **Scheduling queues** (job queue, ready queue, device queues) organize processes by state;
  a **context switch** moves the CPU from one process to another and is pure overhead — no
  process makes progress during the switch itself.
- `fork()` duplicates a process, `exec()` replaces a process's program image, and `wait()`
  lets a parent block until a child finishes — the standard building blocks of process
  creation.
- A **zombie** has exited but hasn't been reaped by `wait()`; an **orphan**'s parent died
  first, so it's reparented (typically to `init`, PID 1).

Next: **[Lecture 7 — Inter-Process Communication](lecture-07-inter-process-communication.md)**.
