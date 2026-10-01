---
title: "1. Introduction to Operating Systems"
tags:
  - CSC323
  - Operating Systems
  - Interrupts
  - Dual-Mode Execution
---

# 1. Introduction to Operating Systems

Before you ever open a browser, a code editor, or a game, something else is already
running — has been running since the moment the machine powered on, and will keep running
long after you close everything else. That program manages every other program, mediates
every request for memory, every keystroke, every byte written to disk, and every attempt
one program makes to talk to another. It is the **operating system**, and this course is
about exactly how it pulls that off. This lecture starts at the very beginning: what an OS
actually is, how the hardware underneath it is organized around *interrupts* rather than
constant checking, what shapes — single-processor, multiprocessor, clustered — a computer
system can take, and how the OS keeps a CPU busy and protected at the same time.

## In This Lecture

- What an operating system is, from two very different vantage points: the user at the
  keyboard, and the system itself, managing hardware and competing programs
- How a computer system is organized around **interrupts**, and why interrupt-driven
  operation replaced the alternative of constantly polling every device
- The building blocks of I/O: device controllers, and what direct memory access (DMA) buys you
- Computer system architectures — single-processor, multiprocessor, and clustered systems —
  and why an organization picks one over another
- How an OS keeps the CPU busy and responsive (**multiprogramming** and **multitasking**),
  and the **dual-mode** (and modern **multimode**) execution model that stops a misbehaving
  program from taking the whole machine down with it

## What Is an Operating System?

An **operating system** is the one program that runs at all times on a computer, sitting
between the user's programs and the hardware, controlling and coordinating the use of that
hardware among the various programs competing for it. Every other program — your browser, a
compiler, a game — is a *user program*, and every one of them depends on the OS to get
anything done, because none of them is allowed to touch the hardware directly.

There are two genuinely different, equally valid ways to answer "what does an OS do?",
depending on whose perspective you take.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two views of the same operating system</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">User view</span>
<span class="db-node-sub">Make the computer convenient and pleasant to use — maximize ease of use, not necessarily efficiency</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">System view</span>
<span class="db-node-sub">Allocate scarce hardware resources fairly and safely among every competing program</span>
</div>
</div>
</div>

**The user view.** Most people experience an OS through a laptop, phone, or workstation
built around one user sitting at one keyboard, mouse, or touchscreen. From that seat, the OS
is judged almost entirely on *convenience* and *ease of use* — how quickly it responds, how
intuitive its interface is — with raw hardware efficiency barely entering the picture. This
view does not generalize everywhere, though: an embedded OS inside a microwave, a car's
engine controller, or an ATM has effectively no human "user" interacting with it at all; it
just runs, silently and continuously, with no visible interface to judge convenience by.

**The system view.** From the hardware's side, the OS looks completely different: it is a
**resource allocator**. A computer system has many resources — CPU time, memory space,
file-storage space, I/O devices — that multiple programs may need at the same instant, and
the OS's job is to decide who gets what, when, and for how long, managing conflicting
requests for efficient and fair resource use. Closely related, the OS is also a **control
program**: it manages the execution of every user program specifically to prevent errors and
improper use of the computer — making sure one misbehaving program cannot corrupt another's
memory, monopolize the CPU forever, or crash the machine for everyone else.

!!! note "No single definition fits every OS"
    There is no universally agreed, precise definition of "operating system" beyond "the one
    program always running on the computer" — general-purpose OSes are not even precisely
    defined. This is fine in practice: whether something counts as "part of the OS" matters
    far less than understanding the *services* it provides and the *protection* it enforces,
    which the rest of this course covers in detail.

## Computer System Organization

Strip away the applications and even the OS itself, and a modern computer system is, at
its core, one or more CPUs and a number of **device controllers** connected through a
common bus that provides access to shared memory. Each device controller is in charge of a
specific type of device — a disk, a network card, a keyboard — and the CPU and these
controllers can execute concurrently, competing for memory cycles. For this to work
correctly, something has to keep the CPU and every device synchronized, without the CPU
wasting all its time just watching devices for changes. That something is the **interrupt**.

### Interrupts and Interrupt-Driven I/O

Imagine the alternative first: if the CPU had no way of being *notified* when a device
finished something, its only option would be **polling** — running a loop that repeatedly
checks a device's status register, over and over, until it reports "ready." For a disk or
network card, which is enormously slower than the CPU, that loop would burn an almost
unbounded number of CPU cycles doing nothing useful at all.

**Interrupt-driven I/O** flips this relationship around entirely: instead of the CPU asking
devices "are you done yet?", a device tells the CPU "I'm done" by asserting an
*interrupt-request* signal on a line the CPU's control unit checks after executing every
single instruction. The CPU can therefore spend its time running other work and only react
the instant something actually needs its attention.

<div class="db-diagram" markdown>
<p class="db-diagram-label">One interrupt-driven I/O cycle</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Device finishes</span>
<span class="db-node-sub">e.g. a disk read completes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Interrupt signal raised</span>
<span class="db-node-sub">Controller asserts the interrupt-request line</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">CPU consults interrupt vector</span>
<span class="db-node-sub">Looks up the fixed address of the matching handler</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Handler runs, then returns</span>
<span class="db-node-sub">Interrupted program resumes exactly where it left off</span>
</div>
</div>
</div>

When the interrupt line is asserted, the CPU stops what it is doing, saves enough state to
resume later, and transfers control to a fixed location that holds the start of an
**interrupt service routine (ISR)**. That fixed location is found through the **interrupt
vector**: a table of addresses, one per interrupt type, that lets the hardware jump straight
to the correct handler rather than searching for it. Lecture 2 covers this table, and the
distinction between hardware and software interrupts, in much more depth — for now, the key
idea is simply that interrupts let the CPU react instead of constantly ask.

### I/O Structure

A **device controller** is the piece of hardware responsible for operating a particular
class of device. It maintains its own local buffer and a small set of special-purpose
registers, and it is the controller — not the CPU directly — that moves data between the
device itself (a spinning disk platter, a network cable) and its own local buffer.

For a slow device like a keyboard, having the CPU handle every single byte transferred is
no real burden. For a fast device like a disk or a network interface, it would be ruinously
wasteful: the CPU would spend most of its time babysitting a data transfer instead of doing
useful computation. **Direct memory access (DMA)** solves this by offloading the actual data
movement to a dedicated DMA controller, which transfers an entire block of data directly
between the device and main memory *without* the CPU's involvement in moving each byte — the
CPU is interrupted only once, when the whole block transfer is complete, rather than once per
byte.

!!! tip "DMA is why a large file copy doesn't freeze your CPU"
    Without DMA, reading a large file would tie up the CPU in a tight byte-by-byte copy loop
    for the entire duration of the transfer. With DMA, the CPU issues one request, walks away
    to do something else entirely, and only gets interrupted once the whole block has
    arrived — this is exactly why your machine stays responsive while a large download or
    disk copy runs in the background.

## Computer System Architecture

Not every computer is built the same way underneath. Three broad architectures matter for
an OS course, because each one changes what the OS has to manage.

### Single-Processor Systems

The simplest and historically most common case: one general-purpose CPU executing the
system's main instruction stream. Many single-processor systems also contain **special
purpose processors** — a disk controller's own tiny processor, or a graphics processor —
but these execute a very limited instruction set and are dedicated to one task; they do not
run user programs and are not considered "the" processor for scheduling purposes.

### Multiprocessor Systems

A **multiprocessor system** (also called *parallel* or *tightly coupled*) has two or more
CPUs in close communication, typically sharing the same bus, clock, memory, and peripheral
devices. Organizations invest in multiple processors for three concrete reasons:

- **Increased throughput** — adding more processors lets more work complete in the same
  wall-clock time, although speedup is never perfectly linear in the processor count, since
  coordinating N processors introduces overhead that a single processor never pays.
- **Economy of scale** — one multiprocessor machine sharing peripherals, storage, and power
  supplies costs less, in total, than buying and operating N separate single-processor
  machines with equivalent power.
- **Increased reliability** — with functionality distributed across several processors, the
  failure of one does not halt the whole system; it can continue, usually at reduced
  capacity, a property called **graceful degradation** or **fault tolerance**.

Multiprocessor systems come in two flavors: **asymmetric multiprocessing**, where each
processor is assigned a specific, fixed task in a master/slave relationship (the master
schedules and allocates work to the slaves), and **symmetric multiprocessing (SMP)**, where
every processor is a peer, performing all tasks within the OS equally — SMP is the
overwhelmingly dominant design today, including the multicore chips in ordinary laptops and
phones.

### Clustered Systems

A **clustered system** gathers two or more individual, complete computer systems — each
with its own CPU(s), memory, and OS — and couples them together, typically over a local-area
network or a faster dedicated interconnect. The defining property is **loose coupling**:
unlike a multiprocessor system's tightly shared bus and memory, each node in a cluster is a
largely independent computer that cooperates with the others. Clusters usually share storage
via a **storage-area network (SAN)**, so that any node can access any disk, which is what
lets them provide **high availability**: if one node fails, another can take over the work
(and the storage) it was handling. Clustering arrangements are **asymmetric** (one node sits
in hot standby, monitoring the active server, ready to take over) or **symmetric** (several
nodes all run applications simultaneously while monitoring each other), and clusters also
provide a performance benefit through **load balancing**, distributing work across nodes.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Single-processor vs. multiprocessor vs. clustered</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Single-processor</span>
<span class="db-node-sub">One general-purpose CPU, plus special-purpose controllers that never run user programs</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Multiprocessor</span>
<span class="db-node-sub">Tightly coupled — several CPUs share one bus, clock, memory, and peripherals</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Clustered</span>
<span class="db-node-sub">Loosely coupled — independent computers, each with its own OS, sharing storage over a SAN</span>
</div>
</div>
</div>

!!! warning "Multiprocessor and clustered are not the same thing"
    It is tempting to lump these together as "more than one computer," but the distinction
    examiners (and real system architects) care about is *coupling*: a multiprocessor
    system's CPUs share one memory and one OS instance directly over a shared bus; a
    cluster's nodes each run their own OS and communicate over a network, sharing only
    storage (via a SAN) and cooperating at a much coarser grain.

## Operating System Operations

### Multiprogramming and Multitasking

The earliest systems ran exactly one job, start to finish, before loading the next — and
whenever that job needed to wait for I/O, the CPU sat completely idle, which is wasteful.
**Multiprogramming** fixes this by keeping several jobs in memory at once, forming a *job
pool* the OS can choose from: the instant the running job has to wait (for a disk read, for
example), the OS simply switches the CPU to a different job from the pool, so the CPU is
almost never idle. Multiprogramming was originally a batch-processing idea — it says nothing
about whether a human is waiting for a response.

**Multitasking** (also called **timesharing**) is the logical extension of multiprogramming
toward interactivity: the CPU switches between jobs so frequently that users can interact
with each program while it runs, creating the illusion that many programs execute
simultaneously, even on hardware with far fewer CPUs than running programs. A program loaded
into memory and executing is called a **process**; multiple processes share a timesharing
system's CPU through rapid switching, and response time is expected to stay short enough —
typically well under a second — that the illusion holds.

!!! note "Two different goals, often confused"
    Multiprogramming's goal is **CPU utilization**: never let the CPU sit idle if there is
    any work it could be doing. Multitasking's goal is **responsiveness**: make the system
    feel interactive to a human. Multitasking is built *on top of* multiprogramming's
    job-switching idea, but the two solve different problems, and a system can have one
    without emphasizing the other.

### Dual-Mode Execution

Letting several independent programs share one CPU creates an obvious danger: what stops
one program, by accident or on purpose, from overwriting the OS itself, or another program's
memory, or hogging every device forever? A software policy alone cannot guarantee this — it
needs **hardware support**, and that support is **dual-mode execution**.

The hardware provides (at minimum) two modes of operation: **user mode** and **kernel mode**
(also called *supervisor*, *system*, or *privileged* mode), tracked by a single hardware
**mode bit** — conventionally `0` for kernel mode and `1` for user mode. This bit lets the
hardware tell, at every instant, whether the currently executing code is a trusted part of
the OS or an ordinary user program, and therefore whether a given instruction is even allowed
to execute.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Dual-mode execution: user mode and kernel mode</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">User mode (bit = 1)</span>
<span class="db-node-sub">Ordinary program; privileged instructions are forbidden</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Trap (mode bit → 0)</span>
<span class="db-node-sub">A system call, or an illegal instruction, forces a switch</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Kernel mode (bit = 0)</span>
<span class="db-node-sub">OS code runs; privileged instructions are now allowed</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Return (mode bit → 1)</span>
<span class="db-node-sub">Control passes back to the user program, in user mode again</span>
</div>
</div>
</div>

At boot time, the hardware starts in kernel mode, and the OS is loaded while still in kernel
mode; once user processes begin, the mode bit flips to user mode. Any **trap** or
**interrupt** — whether a hardware signal or software-generated — switches the mode bit back
to kernel mode immediately, which is precisely why the OS always regains control in kernel
mode no matter what caused the switch, and why the OS deliberately switches the mode bit to
user mode right before it hands control to a user program.

**Privileged instructions** — controlling I/O devices, managing the timer, handling
interrupts, modifying memory-protection settings — are only executable while the mode bit
says kernel mode. If a user-mode program attempts one anyway, the hardware itself refuses
and traps into the OS as an illegal instruction, rather than letting the attempt succeed.
This is the entire basis of OS protection: a user program is never trusted to behave, so the
hardware simply makes the dangerous instructions physically unreachable from user mode. The
only sanctioned doorway through which a user program can ask the OS to perform a privileged
action on its behalf is the **system call**, which executes a deliberate trap instruction —
Lecture 3 covers exactly how that doorway works.

### Multimode Execution

Dual mode was sufficient when "trusted OS" and "untrusted program" were the only two
categories that mattered. Modern hardware, driven largely by virtualization, extends the
same idea into **multimode execution**: a third privilege level sits between kernel mode and
user mode (or, depending on the hardware, below kernel mode entirely) reserved for a
**hypervisor** — the software that manages one or more guest operating systems running as
virtual machines. Hardware extensions such as Intel VT-x or AMD-V let the hypervisor trap
privileged instructions issued by a *guest* kernel without that guest kernel ever realizing
it isn't running directly on bare metal.

!!! tip "Think of it as more rings, not a different idea"
    It helps to picture privilege as a set of concentric rings rather than a strict two-way
    split: user programs in the outermost ring, an OS kernel one ring in, and — on virtualized
    hardware — a hypervisor one ring further in still. The mechanism is identical to dual
    mode's mode bit; multimode just adds more distinct levels to it as the kinds of software
    sharing one physical machine have grown more sophisticated.

## Key Takeaways

- An OS has two faces: the **user view** (convenience and ease of use) and the **system
  view** (the OS as a **resource allocator** and **control program**) — and some systems,
  like embedded controllers, have essentially no user view at all.
- **Interrupts** let the CPU react to devices instead of wasting cycles **polling** them; the
  CPU consults an **interrupt vector** to jump straight to the correct handler.
- **Device controllers** move data to/from their own local buffers; **DMA** lets large
  transfers happen without the CPU babysitting every byte, interrupting it only once per
  block.
- **Single-processor**, **multiprocessor** (tightly coupled, shared memory/bus), and
  **clustered** (loosely coupled, shared storage via a SAN) systems trade off cost,
  throughput, and reliability differently.
- **Multiprogramming** keeps the CPU busy by switching between a pool of jobs;
  **multitasking/timesharing** switches fast enough to feel interactive to a human user.
- **Dual-mode execution** (a hardware **mode bit** distinguishing user mode from kernel mode)
  is what actually enforces OS protection — privileged instructions simply cannot execute in
  user mode — and **multimode** execution extends the same idea to support hypervisors and
  virtualization.

Next: **[Lecture 2 — Computing Environments and Interrupts](lecture-02-computing-environments-and-interrupts.md)**.
