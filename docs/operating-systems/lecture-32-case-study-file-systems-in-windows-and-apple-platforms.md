---
title: "32. Case Study: File Systems in Windows and Apple Platforms"
tags:
  - CSC323
  - Operating Systems
  - File Systems
  - Course Review
  - Capstone
---

# 32. Case Study: File Systems in Windows and Apple Platforms

Every file-system idea this course has built up — files as a named abstraction over disk
blocks, tree-structured directories, owner/group/other permissions, journaling for crash
safety — is not a theoretical exercise. It is, almost unchanged, how the file system on the
computer you are reading this on actually works. This lecture closes the storage unit by
looking at two real, production file systems side by side: **NTFS**, the file system behind
every modern Windows installation, and **APFS**, the file system behind every modern Mac,
iPhone, and iPad. Both solve the exact problems the last three lectures raised — just with
different concrete engineering choices, worth understanding precisely because the choices
differ.

This is also the **last lecture of the entire course**. After the case study, this lecture
closes with a full recap of all thirty-two lectures — every unit, tied together through one
running example — rather than introducing anything new.

## In This Lecture

- NTFS basics: the Master File Table, journaling for crash consistency, and ACL-based
  permissions
- APFS basics: copy-on-write, space sharing across volumes, and native snapshots and
  encryption
- A direct, dimension-by-dimension comparison of NTFS and APFS
- A complete course recap — all thirty-two lectures, seven units, one running example
  followed end to end
- Where the ideas in this course lead next, and a closing note now that the course is
  complete

## Windows File System: NTFS

**NTFS (New Technology File System)** has been the default file system on Windows since
Windows NT, and it answers Lecture 30's "how is file metadata actually stored?" question
with an unusually elegant structure.

### The Master File Table

NTFS organizes almost everything around a single database-like structure called the
**Master File Table (MFT)**. Every file on an NTFS volume — and, notably, every piece of
file-system *metadata* too, including the MFT's own bookkeeping about itself — is
represented as one record in this table. Each MFT record holds a file's attributes (name,
timestamps, security descriptor, and a map of which disk clusters hold its data).

<div class="db-diagram" markdown>
<p class="db-diagram-label">The Master File Table — everything is a record</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">MFT Record</span>
<span class="db-node-sub">Holds a file's name, timestamps, security descriptor, and pointers to its data clusters</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Small file: stored entirely within its own record</span>
<span class="db-node-sub">A file small enough to fit in the record's remaining space needs no separate data clusters at all — it is "resident" data</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Large file: record points out to data clusters</span>
<span class="db-node-sub">The record holds only the map; the actual bytes live in clusters elsewhere on the volume</span>
</div>
</div>
</div>

The detail worth noticing is the middle case: a file small enough to fit inside the leftover
space of its own MFT record is stored **entirely within that record** — no separate data
cluster is ever allocated for it. A directory full of tiny configuration files can, in
effect, live almost entirely inside the MFT itself, with no extra disk seek required to reach
their contents.

### Journaling

NTFS is a **journaling file system**: before it modifies its own metadata structures (the
MFT, directory entries, free-space bitmaps), it first writes a short record of the change it
is *about* to make into a separate log area, the **journal**, and only afterward performs the
actual modification. If the system crashes partway through a metadata update, NTFS does not
need to scan the entire volume looking for inconsistencies on the next boot — it simply
replays (or rolls back) whatever the journal says was in progress, bringing the volume back
to a consistent state in a fraction of a second instead of the slow full-disk check older,
non-journaling file systems required.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Journaling: log the intent, then act</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Write intent to journal</span>
<span class="db-node-sub">"About to update these metadata structures"</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Perform the actual update</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Mark the journal entry complete</span>
<span class="db-node-sub">A crash before this point means: replay or roll back on next boot, never a full scan</span>
</div>
</div>
</div>

### Permissions via ACLs

NTFS enforces file protection with full **access control lists (ACLs)** attached to every
file and directory — exactly the **access-list** protection model
[Lecture 31](lecture-31-file-systems-directories-protection-and-memory-mapped-files.md)
introduced as the flexible-but-potentially-unwieldy alternative to the compact owner/group/
other scheme. Each entry in an NTFS ACL names a specific user or group and the specific
operations they are permitted (or explicitly denied), which is considerably more expressive
than three fixed `rwx` buckets — at the cost of exactly the administrative overhead Lecture
31 warned a growing access list accumulates.

## Apple File System: APFS

**APFS (Apple File System)** is the modern default file system across macOS, iOS, iPadOS,
tvOS, and watchOS, replacing the older HFS+. It was designed from scratch around flash
storage and makes different trade-offs from NTFS at almost every point.

### Copy-on-Write

APFS is built around **copy-on-write (COW)** at the file-system level — the same core idea
Lecture 25's `fork()` discussion introduced for duplicating a process's memory, now applied
to an entire volume's worth of data instead of one process's address space. When a file (or
an entire snapshot of the volume, covered next) is "copied," APFS does not actually
duplicate its data blocks up front. It instead lets the copy and the original **share** the
same underlying blocks, and only allocates a genuinely new block the moment either side is
actually modified — the identical lazy-duplication principle, now protecting file data
instead of process memory pages.

### Space Sharing Across Volumes

Older partitioning schemes gave each volume a fixed size, decided at creation time — growing
one volume meant shrinking another, often requiring a disruptive repartition. APFS instead
lets multiple volumes share space dynamically from one underlying physical **container**:
every volume in the container can grow or shrink as needed, drawing from the same shared
pool of free space, with no volume's size rigidly fixed in advance.

<div class="db-diagram" markdown>
<p class="db-diagram-label">APFS space sharing vs. fixed-size partitioning</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Older partitioning</span>
<span class="db-node-sub">Each volume's size is fixed at creation; growing one means shrinking another</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">APFS container</span>
<span class="db-node-sub">Multiple volumes share one pool of free space dynamically; no volume's size is rigidly fixed</span>
</div>
</div>
</div>

### Snapshots and Encryption

Because of its copy-on-write foundation, APFS can take a **snapshot** — a complete,
point-in-time, read-only copy of an entire volume — almost instantly and at almost no extra
disk cost: the snapshot simply shares every block with the live volume at the moment it was
taken, and only consumes additional space as the live volume's data subsequently diverges
from it, block by block, through the same copy-on-write mechanism. This is precisely the
mechanism behind Time Machine-style backups on macOS, where the system can hold many
historical snapshots of a volume without needing to store a full, separate copy of the data
for each one. APFS also natively supports strong, full-volume and per-file encryption,
built in as a first-class feature rather than bolted on afterward.

## NTFS vs. APFS at a Glance

<div class="db-diagram" markdown>
<p class="db-diagram-label">NTFS and APFS, dimension by dimension</p>

**Journaling approach**

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">NTFS</span>
<span class="db-node-sub">Logs metadata-change intent before acting; replays/rolls back the journal after a crash — no full-disk check</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">APFS</span>
<span class="db-node-sub">Copy-on-write means an in-progress update never overwrites committed data in place, so there is little to "replay" at all</span>
</div>
</div>

**Space allocation model**

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">NTFS</span>
<span class="db-node-sub">Each volume has a size set when the partition is created</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">APFS</span>
<span class="db-node-sub">Multiple volumes dynamically share free space from one physical container</span>
</div>
</div>

**Snapshot support**

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">NTFS</span>
<span class="db-node-sub">Supported (Volume Shadow Copy), layered on top of the base file system rather than native to it</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">APFS</span>
<span class="db-node-sub">Native, instant, and space-efficient by design, directly because of its copy-on-write foundation</span>
</div>
</div>

**Typical use context**

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">NTFS</span>
<span class="db-node-sub">Windows desktops, laptops, and servers; fine-grained ACL permissions for shared, multi-user environments</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">APFS</span>
<span class="db-node-sub">Apple desktops and mobile devices; flash-optimized, snapshot-friendly, built-in encryption by default</span>
</div>
</div>

</div>

!!! note "Different defaults, same underlying problems"
    NTFS's ACLs and APFS's owner/group/other-plus-extensions both answer Lecture 31's
    protection question; NTFS's journal and APFS's copy-on-write both answer the same crash-
    consistency problem from two different directions. Neither design is "wrong" — they
    reflect different priorities (fine-grained enterprise permission management vs. flash-
    optimized, snapshot-native simplicity) built on top of the exact same concepts this course
    spent four lectures establishing.

## Key Takeaways

Thirty-one lectures ago, this course opened by asking what an operating system actually *is*
and why a computer needs one at all. Every lecture since has been building, piece by piece,
toward a single working answer to that question. This closing section doesn't introduce
anything new — it walks back across all seven units of the course, one tight recap at a
time, following a single running example through every stage a real program goes through on
a real system: launched, scheduled, synchronized, protected from deadlock, paged into memory,
and finally saved safely to disk.

### The Running Example

Throughout this recap, one scenario recurs: **Ayesha opens a text editor to edit and save a
large report.** It is small enough to hold in your head in full, and rich enough that every
unit of this course had something genuine to say about it.

### Unit 1 — OS Foundations and Structure

The moment Ayesha launches the editor, the operating system creates a new process for it,
and every single thing that process does from then on — opening the report, allocating
memory, eventually saving — happens through a **system call**, the formal, protected
boundary between an ordinary program and the kernel that Lecture 3 introduced. The OS itself
is structured in layers (or modules, or a microkernel's set of cooperating servers,
depending on the design this course surveyed) specifically so that a request like "open this
file" can be handled safely without the editor ever touching hardware, or another process's
memory, directly.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 1 — every request crosses the system-call boundary</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Editor (user mode)</span>
<span class="db-node-sub">Calls open(), read(), write() — never touches hardware directly</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">System call boundary</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Kernel (kernel mode)</span>
<span class="db-node-sub">Services the request on the process's behalf</span>
</div>
</div>
</div>

### Unit 2 — Process Management and Threads

The editor doesn't do everything on its single main thread — it spins up a background
**autosave thread** that periodically saves the report without freezing the editing window.
Both the main thread and the autosave thread share the same process's address space and open
files, which is exactly the distinguishing feature of threads this unit established: cheaper
to create and switch between than a whole new process, precisely because so much context is
already shared.

### Unit 3 — CPU Scheduling

Ayesha's editor is never the only thing running — a browser, a music player, and a dozen
background services are all runnable at the same moment. The **CPU scheduler** decides, many
times a second, which of them actually gets the processor next, using whichever scheduling
policy this unit covered (round robin, priority-based, multilevel) to keep every process,
including the editor's own main and autosave threads, making visible progress without any
one of them starving the others.

### Unit 4 — Process Synchronization

The main thread and the autosave thread both need to touch the exact same in-memory copy of
the report. Without coordination, the autosave thread could read the buffer mid-edit and
save a half-typed sentence, or worse, the two threads could corrupt the buffer entirely by
writing to it at the same instant. A **lock** (a mutex or semaphore, this unit's core tool)
around every access to the shared buffer is what prevents that race — exactly the critical-
section discipline this unit built from first principles.

### Unit 5 — Deadlocks

Suppose the autosave thread acquires the buffer lock first and then needs a second lock to
write to the application's log file, while at the same moment the main thread acquires the
log lock first and then needs the buffer lock. Neither thread can proceed, and neither will
ever release what it's holding — a **deadlock**, built from exactly the four necessary
conditions this unit identified. The fix this unit taught is just as direct: enforce a
single, consistent order in which *any* thread acquires these two locks, and the circular
wait that deadlock depends on becomes structurally impossible.

### Unit 6 — Memory Management

The report's text, and the editor's own program code, do not all sit in physical RAM the
instant the editor launches — they are **demand-paged** in, one page at a time, only as each
page is actually touched, exactly as this unit's virtual-memory material described. If
Ayesha opens a second window on the same report, the OS does not duplicate every one of its
pages immediately; it uses **copy-on-write** to let both windows share the same physical
pages until one of them actually modifies its own copy, at which point — and only then — a
real, separate page is allocated.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 6 — demand paging and copy-on-write, in one window's lifetime</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Page first touched</span>
<span class="db-node-sub">Page fault — the OS brings it into a physical frame on demand</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Second window opened on the same report</span>
<span class="db-node-sub">Copy-on-write: both windows share the same physical pages, unmodified</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Either window edits its own copy</span>
<span class="db-node-sub">Only now does a genuinely separate physical page get allocated</span>
</div>
</div>
</div>

### Unit 7 — Storage and File Systems

Finally, Ayesha presses "Save." That one keystroke turns into a `write()` system call that
descends through the layered file-system implementation — the logical file system, the
file-organization module, the basic file system, and I/O control — introduced in
[Lecture 30](lecture-30-file-systems-concepts-and-structure.md), checked the entire way
against the report file's `rwx` permissions from
[Lecture 31](lecture-31-file-systems-directories-protection-and-memory-mapped-files.md), and
committed to disk through this lecture's NTFS journal or APFS copy-on-write mechanism —
guaranteeing that even a crash one instant after the save completes cannot leave the report
corrupted or half-written.

### The Whole Course, as One Thread

Laid end to end, Ayesha's single editing session touched every unit of this course in one
unbroken line — this is the concept map the rest of the course has been building toward:

<div class="db-diagram" markdown>
<p class="db-diagram-label">One saved document's entire journey through this course</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 1 — OS Foundations &amp; Structure</span> <span class="db-node-sub">The editor process exists and acts only through system calls into the kernel</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 2 — Process Management &amp; Threads</span> <span class="db-node-sub">A background autosave thread shares the editor's address space</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 3 — CPU Scheduling</span> <span class="db-node-sub">The scheduler interleaves the editor with every other running program</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 4 — Synchronization</span> <span class="db-node-sub">A lock keeps the main and autosave threads from racing on the shared buffer</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 5 — Deadlocks</span> <span class="db-node-sub">Consistent lock ordering keeps two cooperating threads from freezing each other permanently</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 6 — Memory Management</span> <span class="db-node-sub">The report's pages are demand-paged in, and shared copy-on-write across windows</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Unit 7 — Storage &amp; File Systems</span> <span class="db-node-sub">The save itself passes through the file-system layers and lands, journaled or copy-on-write, on disk</span></div>
</div>
</div>

Notice what each unit actually contributed: Unit 1 gave you the *vocabulary and boundary* —
processes, system calls, kernel vs. user mode — that every later unit assumes; Units 2–3 gave
you the *execution model* — how many things run, and in what order, on one CPU; Units 4–5
made concurrent execution *safe*, first by coordinating shared access and then by ruling out
the specific failure mode (deadlock) that naive coordination can introduce; Unit 6 gave every
process the *illusion of more memory than physically exists*, safely and efficiently; and
Unit 7 made sure that everything a process produces actually *survives* — on disk, correctly,
even across a crash. None of these units stands alone — demand paging (Unit 6) with no
synchronization (Unit 4) protecting the pages it serves is just as fragile as a perfectly
scheduled process (Unit 3) whose saved file (Unit 7) a crash can still corrupt.

### Where This Leads Next

This course deliberately stayed within a single machine, running a single instance of one
operating system. Several natural directions extend everything you've learned here:

- **Distributed operating systems** — what happens when processes on entirely different
  machines need to synchronize, share files, or survive one machine's outright failure (this
  needs its own versions of synchronization and deadlock detection, across a network that can
  partially fail).
- **Virtualization and containers** — running multiple, isolated "guest" operating systems
  (or lightweight process groups) on top of one physical machine, which depends directly on
  this course's memory-management and protection material, pushed one level further.
- **Security and advanced protection** — this course's owner/group/other and ACL models are
  the starting point for far deeper topics: capability-based systems, sandboxing, and formal
  models of what a compromised process can and cannot be allowed to do.
- **Real-time operating systems** — environments where a scheduling decision isn't just about
  fairness or throughput, but about hard deadlines that must never be missed, demanding a
  fundamentally different take on this course's CPU-scheduling unit.

### Course Complete

You started this course with a question about what, exactly, an operating system is for, and
by this lecture you've built a complete, working answer: how it structures itself and talks
to the programs running on it, how it manages one or many processes and the threads inside
them, how it decides what runs when, how it keeps concurrent access safe and deadlock-free,
how it gives every process the illusion of abundant private memory, and finally, how it
turns that memory back into data that genuinely survives on disk. That last piece is not a
footnote — it's the guarantee that makes every other unit's work actually matter once the
power goes off.

None of this stops mattering once the exam is over. Every piece of software you run, build,
or debug from here forward — a mobile app, a web server, a database engine — sits on top of
an operating system doing exactly the things this course spent a semester explaining. The
specific kernel or platform you end up working with may differ from the exact examples here,
but the underlying questions will not: is this process isolated correctly, is this shared
resource synchronized safely, is memory being used efficiently, and is every write to disk
actually going to survive. That's the habit of mind this course was built to give you —
congratulations on completing Operating Systems (CSC323).
