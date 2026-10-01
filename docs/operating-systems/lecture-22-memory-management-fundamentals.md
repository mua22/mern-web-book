---
title: "22. Memory Management Fundamentals"
tags:
  - CSC323
  - Operating Systems
  - Memory Management
  - Address Binding
---

# 22. Memory Management Fundamentals

Every process you've studied so far — in the scheduling unit, in the deadlock unit — needs
somewhere to actually live while the CPU runs it: its instructions, its stack, its heap, all
have to sit in physical memory (RAM) at some set of real addresses. A single-user machine
running one program at a time could get away with simple, sloppy memory habits. A modern OS
running dozens of processes at once, on a fixed and always-too-small amount of physical RAM,
cannot. This lecture is about the foundational question underneath everything the next three
lectures build on: how does an operating system let many processes share one pool of physical
memory, safely, while each program's own code still refers to its data using addresses that
mean nothing until the OS maps them onto real hardware?

## In This Lecture

- Why physical memory sharing needs active management, and the hardware (**base and limit
  registers**) that enforces protection between processes
- **Address binding** — compile-time, load-time, and execution-time — and what each one fixes
  and when
- **Logical vs. physical addresses**, the **MMU**, and the **relocation register** — worked
  through with an actual numeric example
- **Dynamic loading** (load a routine only when it's called) and **dynamic linking** (defer
  linking a library until execution time), contrasted with static linking
- A brief look at how **Windows** resolves and loads DLLs at run time

## Background: Why Memory Needs Managing

Physical memory is a single, finite, shared resource — a machine with 16 GB of RAM has
exactly 16 GB of RAM, whether it's running one program or fifty. The operating system itself
occupies some of it permanently (usually at the very bottom, in low memory, or the very top).
Every user process needs a correctly sized slice of what's left, and — critically — **no
process should be able to read or write memory that belongs to another process, or to the
OS**, whether by a bug or by design. Delivering both of those guarantees at once —
efficient sharing, and airtight isolation — is memory management's whole job, and it needs
hardware help to do it fast enough to matter.

## Memory Management Hardware: Base and Limit Registers

The simplest working solution is a pair of special CPU registers, maintained per running
process: a **base register** holding the smallest legal physical address a process may touch,
and a **limit register** holding the size of that process's address range.

<div class="db-diagram" markdown>
<p class="db-diagram-label">One process's addressable range within physical memory</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Operating system</span> <span class="db-node-sub">Reserved, low memory</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Other processes</span> <span class="db-node-sub">Not reachable by this process at all</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Process P — base = 300000</span> <span class="db-node-sub">Valid range: base ≤ address &lt; base + limit</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">base + limit = 420000</span> <span class="db-node-sub">limit = 120000 — the size of P's slice</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Free / other processes</span> <span class="db-node-sub">Everything above P's range</span></div>
</div>
</div>

**Memory protection** is enforced directly by hardware, not by software that could be skipped
or buggy: every single address the CPU generates is compared against the base and limit
registers of the process currently running, *before* that address is allowed to reach memory
at all.

<div class="db-relation" markdown>
<div class="db-relation-name">Base/limit registers for process P in the diagram above</div>

| Register | Value |
|---|---|
| base | 300000 |
| limit | 120000 |
| Valid range | 300000 ≤ address &lt; 420000 |

</div>

If a generated address falls outside `[base, base + limit)` — say, address `299999` (just
below base) or `420500` (past the limit) — the hardware comparator catches it immediately and
**traps to the operating system** instead of letting the access through. The OS then
typically terminates the offending process with a fatal "addressing error," exactly the
origin of the segmentation-fault class of crashes. Only the OS itself, running in privileged
(kernel) mode, is permitted to load new values into the base and limit registers — an ordinary
user process can never move or enlarge its own window into memory.

!!! note "This is a minimum, not the whole story"
    Base and limit registers are the simplest possible scheme — exactly one contiguous region
    per process. Lecture 23 and Lecture 24 build two much more capable (and much more widely
    used) memory-management schemes, segmentation and paging, on top of these same underlying
    protection ideas.

## Address Binding

A program's instructions and data refer to memory locations by **symbolic names** at first (a
variable, a label) and ultimately need **binding** to actual addresses before the CPU can use
them. That binding can happen at any of three different points in a program's life, and
*when* it happens determines what the OS is, and isn't, still free to do afterward.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Address binding across a program's lifecycle</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Compile</span>
<span class="db-node-sub">Source → object code</span>
<span class="db-badge db-badge-teal">Compile-time binding: absolute addresses fixed here</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Link</span>
<span class="db-node-sub">Object modules + libraries → one executable</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Load</span>
<span class="db-node-sub">Executable → process in memory</span>
<span class="db-badge db-badge-orange">Load-time binding: addresses fixed here, if not already fixed</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Execute</span>
<span class="db-node-sub">Process runs, can even be relocated mid-run</span>
<span class="db-badge db-badge-purple">Execution-time binding: addresses can still change, with MMU support</span>
</div>
</div>
</div>

- **Compile-time binding.** If, at compile time, it's already known exactly where in memory a
  program will be loaded, the compiler can generate **absolute addresses** directly. This is
  the most rigid option: if the intended load location ever changes, the program must be
  **recompiled** from scratch. Rare in modern general-purpose systems, but still seen in some
  small embedded systems where a program's memory location never varies.
- **Load-time binding.** If the eventual load address isn't known at compile time, the
  compiler instead generates **relocatable addresses** — symbolic offsets rather than final
  ones — and the final absolute addresses are computed once, when the program is **loaded**
  into memory. This avoids recompilation, but once loaded, the program cannot be moved again
  without reloading it.
- **Execution-time (run-time) binding.** Binding is deferred all the way until the program is
  actually **running**, and addresses may keep changing even after execution has started —
  for instance, if the OS needs to move a process to a different region of physical memory to
  make room for something else. This is by far the most flexible option, but it requires
  dedicated **hardware support** — specifically, the MMU described next — because address
  translation now has to happen on every single memory reference, not just once at load time.

## Logical vs. Physical Address Spaces

Execution-time binding only works because the CPU and the memory unit are allowed to disagree
about what an address even *is*.

- A **logical address** (also called a **virtual address**) is the address the **CPU
  generates** while a program runs — the address the program itself believes it's using.
- A **physical address** is the address that actually reaches the **memory unit** — the real
  location in physical RAM.

Under compile-time and load-time binding, these two happen to be identical. Under
execution-time binding, they are deliberately **not** the same, and translating one into the
other on every memory access is the job of a piece of hardware called the
**Memory-Management Unit (MMU)**.

### The Relocation Register

The simplest MMU design extends the base-register idea from earlier into a dedicated
**relocation register**. Every logical address the CPU generates is translated into a
physical address by one addition:

```
physical address = logical address + relocation register's value
```

**Worked example.** Suppose a process's relocation register holds `14000` (meaning the OS has
decided to physically load this process starting at address `14000`). The *program itself* —
compiled as if it would start at address `0` — generates the logical address `346` when it
wants to read one of its own local variables.

```
physical address = 346 + 14000 = 14346
```

The CPU never needed to know the number `14346` at all; it generated `346` exactly as its
compiled code dictates, and the MMU transparently added the relocation offset on the way to
memory. The user program, in effect, never sees a physical address — only the operating
system, which sets the relocation register, knows where the process actually lives.

!!! tip "Relocation registers are the simplest form of execution-time binding"
    This is intentionally the smallest possible MMU: one register, one addition. Lecture 24's
    paging hardware is a far more capable MMU built on exactly the same core idea — translate
    every logical address through a small piece of fast hardware before it reaches memory —
    just with a *table* of offsets instead of a single relocation value.

## Dynamic Loading

Not every routine in a program needs to be in memory from the moment the program starts.
**Dynamic loading** keeps a routine on disk, in relocatable form, until the moment it is
*actually called* for the first time — only then does a small stub load it into memory and
transfer control to it.

The textbook example is error-handling code: a routine that formats and reports a rare
failure condition might account for a meaningful share of a program's total code size, yet
run only on the (hopefully) rare occasion that error actually occurs. Loading it unconditionally
at startup wastes memory for the entire, overwhelmingly common case where it's never needed at
all. With dynamic loading, that routine's memory cost is paid only if and when the error path
is actually taken.

## Dynamic Linking and Shared Libraries

**Static linking** copies the complete machine code of every library routine a program calls
directly into that program's own executable file, at compile/link time. It's simple, and once
linked, the executable is fully self-contained — but if a hundred different installed programs
all call the same standard library function, that function's code is physically duplicated a
hundred times, once inside each executable, wasting both **disk space** (a hundred copies on
disk) and, more importantly, **RAM** (if all hundred programs happen to run at once, the
system holds a hundred separate copies of identical code in memory simultaneously).

**Dynamic linking** postpones linking a library routine until **execution time** instead. The
executable does not contain the library's code at all — only a small **stub**, a tiny piece of
code that, the first time that routine is actually called, locates the appropriate library
already present in memory (or loads it from disk if it isn't there yet) and patches itself to
call directly into it from then on.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Static linking vs. dynamic linking</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Static linking</span>
<span class="db-node-sub">Library code copied into every executable at link time — simple, but duplicated on disk and in RAM across every program that uses it</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Dynamic linking</span>
<span class="db-node-sub">A small stub resolves and loads the real library routine at execution time — one in-memory copy can be shared by every running program that needs it</span>
</div>
</div>
</div>

The direct payoff of dynamic linking is **shared libraries**: because the library's code is
loaded separately from any one program, the operating system can keep exactly **one** physical
copy of it in memory and let every process that needs it map that same copy into its own
address space, rather than holding one private copy per process. It also means a library can
be **upgraded** (a bug fix, a security patch) without recompiling or relinking every program
that depends on it — every program picks up the new version the next time it loads the
library, since the stub resolves it fresh.

## Windows Example: DLL Loading

Windows' implementation of dynamic linking is the **Dynamic Link Library (DLL)** — a `.dll`
file holding compiled, shared code that one or more running programs can call into. When a
Windows program references a function from a DLL, the loader resolves that reference at run
time: it locates the DLL (searching a defined set of directories), maps the DLL's code into
the calling process's address space if it isn't mapped already, and resolves the function
address the program actually jumps to.

Crucially, if several different programs are running at the same time and all depend on the
same DLL (a common C runtime library, for instance), Windows keeps only **one physical copy**
of that DLL's code resident in memory, and every one of those processes maps its own view onto
that same shared copy — precisely the RAM-sharing benefit dynamic linking promises in general,
realized concretely in one real, mainstream operating system.

!!! note "A DLL's code is shared; its data usually is not"
    What's shared across processes is the DLL's **code** (the instructions are identical for
    every caller, so one copy suffices). Each process still gets its **own** private copy of
    any writable data the DLL uses, since one program's state inside a shared library must
    never leak into — or be corrupted by — another program using the very same library.

## Key Takeaways

- Physical memory is shared among many processes at once; **base and limit registers** define
  each process's valid address range, and the hardware traps to the OS on any access outside
  it — enforcing protection without relying on software to behave.
- **Address binding** can happen at **compile time** (fixed addresses, requires recompiling to
  move), **load time** (fixed once loaded), or **execution time** (addresses can change while
  running, requiring MMU hardware support).
- The **logical address** the CPU generates and the **physical address** the memory unit sees
  can differ; the **MMU** translates between them, and the simplest MMU is a single
  **relocation register** added to every logical address.
- **Dynamic loading** defers loading a routine until it is actually called, saving memory for
  rarely used code paths like error handlers.
- **Dynamic linking** defers linking a library until execution time via a small stub, enabling
  **shared libraries** — one in-memory copy of library code shared by every process that needs
  it — in contrast to **static linking**, which duplicates library code into every executable.
- **Windows DLLs** are a real-world instance of dynamic linking: one physical copy of a DLL's
  code can be mapped into, and shared by, every running program that depends on it.

With the vocabulary for how addresses work in place, the next lecture puts it to use:
how memory is actually carved up and handed out to processes in practice. Continue to
[Lecture 23 — Contiguous Memory Allocation and Segmentation](lecture-23-contiguous-memory-allocation-and-segmentation.md).
