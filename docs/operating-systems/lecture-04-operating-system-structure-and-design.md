---
title: "4. Operating System Structure and Design"
tags:
  - CSC323
  - Operating Systems
  - OS Structure
  - Kernel Design
---

# 4. Operating System Structure and Design

Lecture 3 catalogued the services an OS has to provide. It said nothing about how to
actually *build* something that provides all of them — a question real operating systems
have answered in strikingly different ways over the last five decades. This lecture looks
at that design problem: the single distinction that makes an OS's internals changeable
without constant rewriting, and the major structural approaches — monolithic, layered,
microkernel, modular, and hybrid — that real systems like Linux, Windows, and macOS are
actually built from.

## In This Lecture

- **Mechanism vs. policy**: a foundational OS design distinction, and why separating them
  matters in practice
- The **monolithic** structure — simple and fast, but fragile
- The **layered** approach, and the strict ordering constraints it imposes
- The **microkernel** — pushing almost everything out of the kernel into user-space services
- The **modular** approach — loadable kernel modules, the design most real systems actually
  use today
- **Hybrid systems** — how real-world operating systems mix these approaches pragmatically
- A side-by-side comparison of all four core structures

## Design and Implementation Challenges

There is no single "correct" way to structure an operating system — the right structure
depends heavily on what the system has to do (general-purpose desktop, embedded controller,
real-time industrial system), and the goals and specifications set at the very start of a
project shape everything that follows, because the earliest structural decisions are also
the hardest to change later, once thousands of other things have been built on top of them.

### Mechanism vs. Policy

One distinction, more than any other, determines whether an OS design ages well: separating
**mechanism** from **policy**.

- **Mechanism** is *how* something gets done — the actual machinery that makes an action
  possible at all. A hardware timer that can interrupt the CPU after a fixed interval is a
  mechanism; so is a memory-protection scheme that can mark a page as read-only.
- **Policy** is *what* gets done, and *when* — the decision made using that machinery. Which
  process the scheduler picks to run next is a policy decision, implemented by whatever
  scheduling algorithm is currently in effect; how long a time slice lasts is also a policy
  decision.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Mechanism vs. policy</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Mechanism — how</span>
<span class="db-node-sub">A timer that can interrupt the CPU; a lock primitive; a page-protection bit</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Policy — what, when</span>
<span class="db-node-sub">Which process runs next; how long its time slice is; who gets write access</span>
</div>
</div>
</div>

Why bother separating them? Because policies change constantly — across installations,
across users, across time — while a correctly built mechanism should not need to change at
all. A general, flexible timer mechanism can support round-robin scheduling today and a
priority-based policy tomorrow without being touched; only the policy code built on top of
it changes. Mix mechanism and policy together in the same piece of code, and every policy
change risks breaking the underlying machinery it depends on.

!!! tip "A mnemonic worth keeping"
    Mechanism is the engine; policy is the steering. You can swap out the driver's decisions
    — turn left here, slow down there — endlessly, without ever touching how the engine
    itself converts fuel into motion. An OS that keeps these cleanly separated can change its
    scheduling policy, its page-replacement policy, or its admission policy without
    rewriting the hardware-facing code underneath any of them.

## Operating System Structures

Given the same set of required services, five broad structural approaches describe almost
every real operating system built since the 1970s.

### Monolithic Structure

The earliest, and still conceptually simplest, approach puts everything — process
scheduling, memory management, the file system, device drivers — into one program, running
together in a single address space. Early MS-DOS was written this way largely out of
necessity: limited hardware space forced most functionality into the smallest footprint
possible, with no particular effort to separate interfaces or levels of functionality.
Original UNIX was only slightly more organized, splitting into two broad parts: the
**kernel** (everything below the system-call interface and above the physical hardware —
scheduling, file systems, memory management, reachable only through system calls) and
**system programs** running on top of it, but the kernel's own internals remained one large,
undivided body of code.

The monolithic approach is **fast**, because there is no boundary to cross between
subsystems — one piece of kernel code can call another directly, with no messaging or mode
switching involved beyond the usual system-call entry. It is also **fragile**: with no
isolation between subsystems, a bug anywhere in the kernel — a faulty device driver, a bad
pointer in the file system — can corrupt memory belonging to a completely unrelated part of
the kernel, or crash the entire machine. MS-DOS carried this risk to an extreme: because
application programs could access basic I/O routines directly, with nothing enforcing a
real boundary, a single misbehaving application could bring down the whole system.

### Layered Approach

The **layered approach** organizes the OS into a stack of layers, numbered from `0` at the
bottom (the hardware itself) to `N` at the top (the user interface), where **each layer may
use only the services of the layers strictly below it** — never a layer above, and (in the
strictest form) never a layer more than one below.

<div class="db-diagram" markdown>
<p class="db-diagram-label">A layered operating system (bottom-to-top dependency only)</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 6 — User programs / shell</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 5 — System-call interface</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 4 — File systems</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 3 — I/O and device drivers</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 2 — Process / CPU scheduling</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 1 — Memory management</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Layer 0 — Hardware</span>
</div>
</div>
</div>

This buys real simplicity in construction and debugging: you implement and fully debug
layer 0 first, in isolation, with no concern yet for anything above it; once it is correct,
you build layer 1 on top, trusting layer 0 completely; and so on upward. If a bug appears
while testing layer `k`, it must be in layer `k` itself, since every layer below it has
already been verified — debugging never has to consider the whole system at once. Each
layer also hides its own data structures and operations from everything above it, a clean
form of information hiding.

The cost is **overhead and rigidity**: a request originating at the top layer has to filter
down through every intermediate layer to reach the hardware, and each layer along the way
may do its own processing — far less direct than a monolithic system, where the equivalent
code could just call the hardware-facing routine straight away. Layering also demands
careful up-front planning, since a layer genuinely cannot use anything above it; discovering
partway through that layer 3 actually needs something layer 5 provides means redesigning the
stack, not just adding a function call.

### Microkernel

The **microkernel** approach takes the opposite strategy from monolithic design: strip the
kernel down to the smallest possible core — typically just minimal process and memory
management, plus a **message-passing** communication facility — and move everything else
(file systems, device drivers, networking) out into separate processes running in user
space, communicating with the kernel and with each other purely through messages. Mach,
which underlies parts of the modern macOS/iOS kernel, is the textbook example.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Monolithic vs. microkernel placement of services</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Monolithic</span>
<span class="db-node-sub">Scheduler, file system, drivers, and networking all run inside one kernel address space</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Microkernel</span>
<span class="db-node-sub">A tiny kernel (scheduling + IPC only) with file system, drivers, and networking each a separate user-space service, reached by message passing</span>
</div>
</div>
</div>

Shrinking the kernel this aggressively pays off in several ways: it is **easier to extend**
(adding a new service means writing a new user-space program, not touching the kernel at
all), **easier to port** to new hardware (far less privileged code has to be rewritten), and
**more reliable** (a bug in a user-space file-system service can crash and restart that one
service without taking the whole OS down with it, unlike a bug in a monolithic kernel's file
system code). The cost is **performance**: what used to be a single function call inside one
monolithic kernel becomes a round trip of message passing between user-space processes,
multiplying the number of context switches a single request requires.

### Modular Approach

Most OSes shipped today — Linux and Solaris among them — use a **modular** design built
around **loadable kernel modules**. Each core piece of kernel functionality (a particular
file system, a device driver, a network protocol) is written as a separate module with a
known interface, and modules can be loaded into the running kernel as needed — at boot, or
dynamically afterward, without recompiling or even rebooting the kernel.

This resembles the layered approach's idea of separating functionality into distinct pieces,
but without the layered approach's strict one-directional ordering: any module can call any
other module it needs directly, sidestepping the layered design's constant worry about which
layer a given piece of functionality is "allowed" to sit in. It also resembles the
microkernel's idea of keeping components separate and independently loadable, but without
paying the microkernel's message-passing performance tax — modules run inside the kernel's
own address space and can call each other's functions directly, just like a monolithic
kernel's internals, while still being added or removed independently.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Modular design — a small core plus independently loadable modules</p>
<div class="db-flow" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Core kernel</span>
<span class="db-node-sub">Scheduling, memory management, the module loader itself</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Loadable modules</span>
<span class="db-node-sub">Device drivers, file systems, network protocols — added or removed at runtime</span>
</div>
</div>
</div>

### Hybrid Systems

In practice, almost no production OS is a pure example of any single structure above — most
real systems are **hybrid**, mixing approaches wherever it is pragmatic to do so:

- **macOS and iOS** build on the **XNU** kernel, which combines a Mach *microkernel* core
  (basic scheduling, memory management, and IPC) with BSD UNIX-derived components —
  networking, the file system, the process model — that run together in kernel space, closer
  to a monolithic style, for performance, on top of a loadable extension mechanism for
  additional driver-level functionality.
- **Windows** (the NT kernel family) is layered in parts of its design, but several
  subsystems that a strict layered design would push above the kernel boundary were pulled
  into kernel space for performance reasons, alongside extensive support for loadable
  drivers.
- **Linux** is monolithic at its core, for speed, but relies heavily on loadable kernel
  modules for drivers, file systems, and more — a pragmatic blend of monolithic and modular
  design in one kernel.

The pattern across all three: a pure microkernel is elegant but slow; a pure monolithic
kernel is fast but fragile and hard to extend safely; so real engineering teams pick whatever
mixture delivers acceptable performance without sacrificing too much maintainability —
which is exactly why "which structure does Linux use?" does not have a one-word answer.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three real hybrid systems</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">macOS / iOS (XNU)</span>
<span class="db-node-sub">Mach microkernel core + monolithic-style BSD components</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Windows (NT)</span>
<span class="db-node-sub">Partly layered, with performance-critical subsystems pulled into the kernel</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Linux</span>
<span class="db-node-sub">Monolithic core, extended almost entirely through loadable modules</span>
</div>
</div>
</div>

## Comparing the Four Structures

| | Monolithic | Layered | Microkernel | Modular |
|---|---|---|---|---|
| **Coupling** | Tight — one address space, no internal boundaries | Strict, one-directional — a layer depends only on the layer below it | Loose — kernel and services communicate only via message passing | Loose but direct — modules call each other's interfaces within one address space |
| **Performance** | Fastest — no cross-boundary overhead | Moderate — a request filters through every intervening layer | Slowest — message passing and extra context switches for what used to be one call | Fast — near-monolithic, since modules share the kernel's address space |
| **Extensibility** | Poor — adding or changing functionality risks the whole kernel | Moderate — constrained by strict layer ordering, decided up front | Excellent — a new service is just a new user-space program | Excellent — modules load and unload without rebuilding the kernel |
| **Fault isolation** | Poor — a bug anywhere can corrupt the whole kernel | Moderate — a bug is confined to the layer under test, once lower layers are verified | Excellent — a failing user-space service can often restart without a full crash | Poor to moderate — modules still run in kernel space, so a bad module can still crash it |
| **Real-world examples** | Early MS-DOS, original UNIX | Early layered research systems (e.g. THE OS) | Mach (underlies parts of macOS/iOS) | Linux, Solaris |

!!! warning "Four clean categories, almost no clean real-world examples"
    This table describes four idealized structures precisely because almost no shipping OS
    matches any single row exactly — Linux, Windows, and macOS are all, in practice,
    **hybrids** that borrow traits from several rows at once. Use the table to reason about
    *trade-offs* (what do you gain and lose by leaning monolithic vs. microkernel?), not as a
    strict classification of any specific real system.

## Key Takeaways

- Separating **mechanism** (how something is done) from **policy** (what is decided) lets an
  OS change its policies — scheduling, memory allocation — without rewriting the
  machinery those policies rely on.
- A **monolithic** kernel is fast but fragile: no internal boundaries means one bug can
  corrupt the whole system.
- A **layered** OS is easy to build and debug one layer at a time, at the cost of strict
  ordering constraints and the overhead of filtering every request through every layer.
- A **microkernel** pushes almost everything into user-space services reached by message
  passing — more robust and extensible, but slower due to the added context switches.
- A **modular** kernel (Linux, Solaris) loads independent kernel modules at runtime,
  combining the layered/microkernel idea of separate components with near-monolithic
  performance, since modules share the kernel's own address space.
- Virtually every real OS — macOS/iOS, Windows, Linux included — is a **hybrid** that mixes
  these approaches pragmatically, rather than a pure example of any single structure.

Next: **[Lecture 5 — Security and Protection: An Introduction](lecture-05-security-and-protection-an-introduction.md)**.
