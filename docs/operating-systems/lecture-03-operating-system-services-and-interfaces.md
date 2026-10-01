---
title: "3. Operating System Services and Interfaces"
tags:
  - CSC323
  - Operating Systems
  - System Calls
  - User Interfaces
---

# 3. Operating System Services and Interfaces

Whenever a program opens a file, prints a line of output, asks for more memory, or starts
another program, it is not doing any of that directly to the hardware — it is asking the
operating system to do it, through one narrow, carefully controlled doorway. This lecture is
about that doorway and everything that surrounds it: the services every OS provides, the
interfaces through which humans and programs reach those services, and the precise mechanics
of the **system call** — the only legitimate way a user program can ever get the kernel to
act on its behalf.

## In This Lecture

- The services every operating system provides, grouped by who benefits most: the user, or
  the system's own efficient operation
- User interfaces — command-line shells, graphical interfaces, and touch-based mobile
  interfaces — and why experienced users still reach for the command line
- What a **system call** actually is, and how control physically moves from a user program
  into the kernel and back again
- The three general methods an OS uses to pass parameters into a system call
- The major categories of system calls, illustrated with real examples: `fork()`, `exec()`,
  `open()`, `read()`

## Operating System Services

An operating system provides a set of services, useful both to the user running programs
and to the system managing itself. They split naturally into two groups.

**Services that make the system convenient for the user:**

| Service | What it means |
|---|---|
| Program execution | Load a program into memory, run it, and end its execution — normally, or abnormally if it signals an error |
| I/O operations | Since users cannot control I/O devices directly (for both efficiency and protection), the OS must provide a means to perform I/O involving files and devices |
| File-system manipulation | Read, write, create, delete, search, and list files and directories, and manage permissions on them |
| Communications | Exchange information between processes, on the same computer or across a network, via shared memory or message passing |
| Error detection | Constantly watch for CPU/memory hardware errors, I/O device failures, and user-program errors (division by zero, out-of-bounds access), and take correct, consistent action when they occur |

**Services that keep the system itself running efficiently — rarely visible to the user
directly, but essential when many users or programs share one machine:**

| Service | What it means |
|---|---|
| Resource allocation | When multiple jobs run concurrently, allocate CPU cycles, memory, storage, and I/O devices among them |
| Accounting | Track which users and programs use which resources, and how much, for monitoring or billing |
| Protection and security | *Protection* controls which processes or users may access which resources; *security* defends the system against outsiders attempting unauthorized access |

!!! note "Protection vs. security — a distinction worth keeping precise"
    These two terms are often used loosely as synonyms, but they describe different
    concerns. **Protection** is about controlling access *within* a trusted system —
    stopping one legitimate process from reading another's memory without permission.
    **Security** is about defending the system *from the outside* — authentication, defending
    against intrusion, and similar concerns. A system can have excellent protection and still
    be breached through weak security, or vice versa.

## User and Operating-System Interfaces

A service is only useful if there is a way to reach it. Three broad interface styles cover
almost every way people (and, indirectly, programs) interact with an OS.

### Command-Line Interface (CLI)

A **command-line interface**, or **shell**, lets a user type commands directly as text, which
are then executed — either by code built directly into the shell itself, or (far more common
on UNIX-family systems) by invoking a separate program that implements the command. `bash`
and `zsh` are classic examples: almost every command they run — `ls`, `grep`, `cat` — is a
genuinely separate executable, not shell-internal code; the shell's job is mostly to parse
what you typed and launch the right program with the right arguments.

### Graphical User Interface (GUI)

A **graphical user interface** replaces typed commands with a mouse-and-window-driven
system: icons, windows, and menus that a user points at, clicks, and drags, rather than types.
Popularized commercially by the early Macintosh (building on research originally done at
Xerox PARC), the GUI remains the default interface for most desktop and laptop operating
systems today.

### Mobile Interfaces

Smartphones and tablets replace both the keyboard-and-shell and the mouse-and-windows models
with a **touch interface**: taps, swipes, and pinches on a screen that is also the entire
display, with no separate pointing device at all. Touch interfaces have to solve problems
neither CLI nor traditional GUI ever had to — targets have to be large enough to tap
accurately with a finger, and screen space is far more limited — which is why mobile OS
design is treated as a genuinely distinct interface category rather than just "a GUI on a
small screen."

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three interface styles</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">CLI</span>
<span class="db-node-sub">Typed commands; precise, scriptable, composable</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">GUI</span>
<span class="db-node-sub">Mouse-driven windows, icons, and menus</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Mobile / Touch</span>
<span class="db-node-sub">Taps and gestures on the display itself</span>
</div>
</div>
</div>

### Choice of Interface

Which interface a person prefers is partly individual taste, and partly the task at hand —
most desktop systems provide both a shell and a GUI precisely because neither one suits
every situation. What is worth explaining explicitly is *why* experienced users, including
professional system administrators and developers, routinely choose the CLI even when a GUI
for the same task exists:

- **Scriptability** — a sequence of shell commands can be saved as a script and re-run
  exactly, automated on a schedule, or chained together with pipes; a sequence of mouse
  clicks generally cannot.
- **Precision** — a command plus its exact flags leaves no ambiguity about what will happen;
  navigating several layers of menus to find the equivalent option can vary across versions
  of the same software and is easy to get subtly wrong.
- **Remote accessibility** — a shell works perfectly over a slow or low-bandwidth remote
  connection (SSH into a server with no display at all), where a full GUI would be
  impractical or simply unavailable.

!!! tip "The CLI's real advantage is repeatability, not speed"
    A single command typed once is not obviously faster than a single click. The CLI wins
    decisively the moment a task needs to happen more than once, or needs to happen
    identically every time — which is most of what system administration and development
    actually involve.

## System Calls

A **system call** is the programming interface through which a user program requests a
service from the operating system — the literal implementation of the "doorway" this lecture
opened with. System calls are most often invoked from C or C++ programs through a small
wrapper function in a standard library, though some very low-level tasks still require
assembly-language instructions to issue the call directly.

### How a System Call Transfers Control

A system call is not an ordinary function call — it has to cross the protection boundary
between user mode and kernel mode that Lecture 1 described, and that crossing happens in a
precise sequence:

1. The user program calls a library wrapper (for example, `read()` in C), which places a
   **system-call number** identifying the requested service into an agreed-upon register.
2. The wrapper executes a dedicated **trap instruction** — a deliberate software interrupt.
3. The hardware switches the mode bit from user mode to kernel mode, saving the user
   program's state so it can resume later.
4. Control passes to a fixed OS entry point — the **system-call dispatcher** — which reads the
   system-call number out of the register and uses it to index into a **system-call table**:
   an array of pointers to kernel routines, conceptually identical to Lecture 2's interrupt
   vector, just one layer up, dedicated specifically to system calls.
5. The matching kernel routine executes, with the OS validating every parameter it was handed
   before trusting it — recall from Lecture 1 that user-mode code is never assumed to behave.
6. The kernel sets a return value, the hardware switches the mode bit back to user mode, and
   control resumes in the user program, immediately after the instruction that trapped.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The system call trap sequence</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">User process</span>
<span class="db-node-sub">Calls read(); syscall number placed in a register</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Trap instruction</span>
<span class="db-node-sub">Mode bit flips: user mode → kernel mode</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Kernel dispatcher</span>
<span class="db-node-sub">Looks up the syscall table; runs the matching routine</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Return to user process</span>
<span class="db-node-sub">Mode bit flips back; execution resumes after the trap</span>
</div>
</div>
</div>

!!! warning "A system call is a round trip, not a free function call"
    Every system call pays for two mode switches and the cost of the kernel actually doing
    the work — it is dramatically more expensive than an ordinary function call within one
    program. This is exactly why reading a file one byte at a time via repeated `read()`
    calls is slow in practice, while reading it in large buffered chunks is fast: fewer round
    trips through this entire sequence.

### Passing Parameters to System Calls

A system call almost always needs *parameters* — which file to open, what to write, how
many bytes to read — and operating systems use three general methods to pass them:

1. **In registers** — the simplest method, directly placing each parameter value into a
   register before the trap. It is limited by how many registers exist and how large a value
   each one can hold, so it cannot handle an arbitrary number of parameters or large,
   variable-length data.
2. **In a block (table) in memory, with its address passed in a register** — rather than the
   parameters themselves, a single register carries the *address* of a block in memory that
   holds all of them. This removes the limit on the number or size of parameters entirely,
   and is the approach Linux and Solaris use.
3. **On the stack** — the calling program pushes parameters onto its own stack, and the OS
   pops them off from there. This also supports an arbitrary number of parameters, at the
   cost of extra stack bookkeeping on both sides.

!!! note "The OS still checks every parameter, however it arrives"
    None of these three methods are, by themselves, a security guarantee — a register value,
    a memory address, or a stack entry can all be wrong, malicious, or simply invalid. The
    kernel routine on the other end validates whatever it receives before acting on it,
    exactly as Lecture 1's protection discussion requires.

### System Call Types and Examples

System calls fall into a handful of broad categories, each covering a different kind of
service:

| Category | Purpose | UNIX/Linux examples |
|---|---|---|
| Process control | Create or terminate a process, load and execute a program, get/set process attributes, wait for an event, allocate memory | `fork()`, `exec()`, `exit()`, `wait()` |
| File management | Create, delete, open, close, read, write, or reposition within a file; get/set file attributes | `open()`, `read()`, `write()`, `close()` |
| Device management | Request or release a device, read/write to it, get/set its attributes, attach or detach it logically | `ioctl()` |
| Information maintenance | Get or set the system time/date, get/set process, file, or device attributes | `getpid()`, `alarm()` |
| Communications | Create or destroy a communication connection, send/receive messages, transfer status information | `pipe()`, `shmget()`, `mmap()` |
| Protection | Control access to resources, get/set permissions on files or processes | `chmod()`, `chown()`, `umask()` |

**Worked example: what a shell does when you type `ls -l`.** Running a single command at a
shell prompt actually triggers at least two of the process-control system calls above,
working together:

```c
pid_t pid = fork();        /* create a near-duplicate child process */

if (pid == 0) {
    /* child: replace this process's own memory image with /bin/ls */
    execlp("ls", "ls", "-l", NULL);
} else {
    /* parent (the shell): wait for the child to finish before showing a new prompt */
    wait(NULL);
}
```

`fork()` creates a new process that starts out as a near-identical copy of the shell itself
(same code, same open files, a separate copy of memory). `execlp()`, called only inside the
child, then discards that copy's memory image entirely and replaces it with the `ls` program,
which runs and produces the directory listing. The parent shell, meanwhile, calls `wait()` so
it pauses — rather than printing a new prompt immediately — until the child process finishes.
Every command you have ever typed at a UNIX-family shell follows this exact `fork()` +
`exec()` + `wait()` pattern underneath.

## Key Takeaways

- OS services split into those that make the system **convenient for the user** (program
  execution, I/O, file-system manipulation, communications, error detection) and those that
  keep the **system itself running efficiently** (resource allocation, accounting,
  protection and security).
- **CLI**, **GUI**, and **mobile/touch** interfaces each suit different tasks; power users
  favor the CLI for its **scriptability**, **precision**, and ability to work over a remote,
  low-bandwidth connection.
- A **system call** crosses the user-mode/kernel-mode boundary through a **trap**: a
  system-call number identifies the request, a dispatcher looks it up in a **system-call
  table**, and control returns to the user program only once the kernel routine finishes.
- Parameters reach a system call through one of three methods: **in registers**, **in a
  memory block whose address is passed in a register**, or **on the stack** — and the kernel
  validates them regardless of which method delivered them.
- System calls group into **process control**, **file management**, **device management**,
  **information maintenance**, **communications**, and **protection** — and a single typed
  command like `ls -l` already exercises several of them, via `fork()`, `exec()`, and
  `wait()`.

Next: **[Lecture 4 — Operating System Structure and Design](lecture-04-operating-system-structure-and-design.md)**.
