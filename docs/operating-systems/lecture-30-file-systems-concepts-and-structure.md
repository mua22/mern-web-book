---
title: "30. File Systems: Concepts and Structure"
tags:
  - CSC323
  - Operating Systems
  - File Systems
  - Directories
---

# 30. File Systems: Concepts and Structure

Lecture 29 prepared a disk to be used — it now has a boot block, free-space information, and
an empty root directory. None of that, by itself, is a "file system" yet; it's just the
foundation one is built on. This lecture introduces the file system properly: the **file**
itself as the basic unit the OS deals in, the operations the OS lets a program perform on
one, the two fundamentally different ways a program can be allowed to access a file's
contents, and the directory structures that let a disk hold more than one file without chaos
breaking out. By the end, we connect all of it back to the layered implementation that turns
a simple `read()` call into an actual disk access — the same system-call boundary Lecture 3
introduced at the very start of this course.

## In This Lecture

- The file concept: what a file abstracts away, and the attributes every file carries
- File operations, and specifically *why* `open()` and `close()` exist as separate
  bookkeeping steps
- Access methods: sequential access vs. direct (random) access
- Directory structures: single-level, two-level, and tree-structured, and what problem each
  one solves that the previous one didn't
- The layered file-system implementation, from application code down to the physical device

## The File Concept

A **file** is the operating system's basic unit of logical storage: a named collection of
related information, recorded on secondary storage. The file is a deliberate abstraction —
to the application programmer, a file is just a name and a stream (or a set) of bytes; the
messy physical reality underneath — which specific disk blocks hold that data, whether those
blocks are contiguous or scattered across the disk, which blocks are still free — is hidden
entirely behind the file system. A program that wants to store a document never has to think
in terms of sectors, tracks, or spare-block pools; it thinks in terms of a file name and the
bytes it writes to or reads from that name.

### File Attributes

Every file carries a set of attributes, maintained by the file system rather than by the
file's own contents:

| Attribute | What it records |
|---|---|
| Name | The human-readable name the file is identified by within its directory |
| Identifier (inode number) | A unique number the file system itself uses internally to identify the file, independent of its name |
| Type | What kind of file this is (where the file system or OS distinguishes types at all) |
| Size | The file's current size, in bytes |
| Protection | Who is allowed to read, write, or execute the file (the full subject of Lecture 31) |
| Timestamps | When the file was created, last modified, and last accessed |

!!! note "A file's name and its identity are not the same thing"
    The **name** is for humans; the **identifier** (often an inode number, on UNIX-like file
    systems) is what the file system actually uses to locate the file's data and attributes.
    This is exactly why a file can be renamed without disturbing anything that has it open,
    and why two different directory entries (hard links) can point at the very same
    underlying file — the identifier, not the name, is the file's true identity.

### File Operations

The operating system provides a small set of system calls to manipulate files:

- **Create** — allocate space for a new file and add an entry for it to a directory.
- **Write** — append (or overwrite) data at the current position within the file.
- **Read** — retrieve data starting at the current position within the file.
- **Reposition within a file (seek)** — move the file's current position without
  transferring any data, so the next read or write happens somewhere other than
  immediately after the last one.
- **Delete** — remove the file's directory entry and release the space it occupied.
- **Truncate** — erase a file's contents while keeping all of its attributes, resetting its
  length to zero.

Two more operations are usually listed alongside these — **open** and **close** — but they
are a different kind of operation entirely: pure bookkeeping, not data transfer.

!!! tip "Why bother with open() and close() at all?"
    Every one of the operations above needs the file system to first search the relevant
    directory structure for the file's entry, confirm the caller is permitted to access it,
    and set up in-memory bookkeeping (the file's current position, its attributes, buffers
    for pending data) before anything can actually happen. Doing *all of that* again on
    every single `read()` or `write()` call would be enormously wasteful, especially for a
    program issuing thousands of small reads to the same file. Instead, `open()` does that
    search-and-setup work exactly **once**, creates an entry in an in-memory **open-file
    table**, and hands the calling program back a cheap **handle** (a file descriptor) that
    every subsequent read or write can use directly, with no directory search required.
    `close()` simply tears that bookkeeping down again once the program is done, freeing the
    open-file-table entry for reuse.

## Access Methods

A file system also has to decide how a program is allowed to move through a file's data —
and most systems support (at least) two distinct models.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Sequential vs. direct access</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Sequential access</span>
<span class="db-node-sub">Read (or write) records in order, one after another, exactly like reading a tape — the file's own traditional model</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Direct (random) access</span>
<span class="db-node-sub">Jump straight to any block of the file by its block number, with no need to pass through the blocks before it</span>
</div>
</div>
</div>

**Sequential access** is the older, simpler model: each read picks up exactly where the
previous one left off, and each write appends to the end of what has been written so far —
the same discipline a magnetic tape drive physically requires, which is where the model
originates. It works well for files that are naturally processed start-to-finish, like a log
file or a video stream.

**Direct access**, by contrast, lets a program request block *N* of a file directly, without
reading blocks `0` through `N-1` first. This is essential for database-style usage: a
database engine locating one specific record by its known block number (rather than scanning
every record before it to find it) depends entirely on direct access being available — the
same indexed-lookup performance idea that a course on databases would explore in far more
depth, but the underlying capability it depends on is exactly this file-system access method.

!!! note "Sequential access is still possible on a direct-access file"
    Supporting direct access does not take sequential access away — a file system built for
    direct access can always be read sequentially simply by requesting blocks `0, 1, 2, ...`
    in order. The reverse is not true: a strictly sequential-access medium cannot efficiently
    jump to an arbitrary block, which is exactly why direct access is the harder capability to
    provide and the one that matters for database-style workloads.

## Directory Structure

A file system rarely holds just one file — it needs a **directory structure** to organize
many files (often thousands, held by many different users) in a way that keeps their names
distinct and their organization sensible. This structure evolved in stages, each one solving
a problem the previous stage left unsolved.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The evolution of directory structure</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Single-Level Directory</span> <span class="db-node-sub">— one directory for the entire disk; every file, from every user, needs a globally unique name</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Two-Level Directory</span> <span class="db-node-sub">— one directory per user; solves naming conflicts *between* users, but not within one user's own files</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Tree-Structured Directory</span> <span class="db-node-sub">— directories nest arbitrarily deep; files are named by a full path, and every process has a current directory</span></div>
</div>
</div>

### Single-Level Directory

The simplest possible scheme: **one directory holds every file on the entire system**, for
every user. It is trivial to implement, but it does not scale past a single user at all —
every file name must be unique across the *entire* disk, so if two users each happen to want
to create a file called `notes.txt`, one of them loses. There is also no way to group related
files together; everything lives in one flat, undifferentiated list.

### Two-Level Directory

The next step gives **each user their own directory**, with one master directory above them
mapping user names to their individual directories. This immediately fixes the
cross-user naming conflict — two users can each have their own `notes.txt`, because the full
identity of a file is now implicitly `(user, filename)`, not just `filename` alone. What it
does *not* fix is organization *within* one user's own files: a single user with hundreds of
files is still stuck with one flat list, with no way to group a semester's worth of
coursework separately from a personal photo collection.

### Tree-Structured Directory

The structure essentially every file system uses today lets directories contain other
directories, to any depth, forming a **tree**. A file (or directory) is identified by a
**path** — the sequence of directory names leading from some starting point down to that
file — and every process maintains a notion of its own **current directory**, which lets a
**relative path** (`notes/week3.txt`) stand in for the full **absolute path**
(`/home/amina/notes/week3.txt`) in everyday use. This solves both of the earlier problems at
once: two files can share a name as long as they live in different directories anywhere in
the tree, and a user can organize their own files into as many nested groupings as they like.

!!! warning "Tree-structured directories still need a deletion policy"
    Deleting a directory that still contains files (or further sub-directories) raises a
    choice every tree-structured file system has to make explicitly: refuse the deletion
    until the directory is empty, or recursively delete everything beneath it. Getting this
    wrong — silently deleting an entire subtree a user expected to be protected — is exactly
    the kind of file-system design mistake that causes real, unrecoverable data loss.

## File-System Structure

Internally, an operating system implements all of the above as a stack of layers, each one
built on the services of the layer directly beneath it and hiding its own details from the
layer above:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The layered file-system implementation</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Application Programs</span> <span class="db-node-sub">— issue system calls like open(), read(), write() on file names</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Logical File System</span> <span class="db-node-sub">— manages directory structure, file metadata, and protection; translates a file name into its identifier</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">File-Organization Module</span> <span class="db-node-sub">— translates logical block numbers (within a file) into physical block numbers (on the device)</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Basic File System</span> <span class="db-node-sub">— issues generic commands to the appropriate device driver to read/write physical blocks</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">I/O Control</span> <span class="db-node-sub">— device drivers and interrupt handlers that actually move data between main memory and the device controller</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Devices</span> <span class="db-node-sub">— the physical disk, SSD, or other storage hardware</span></div>
</div>
</div>

### From a `read()` Call to Real Disk I/O

Lecture 3 introduced the system call as the formal boundary between an application and the
kernel — a `read()` call is exactly where that boundary gets exercised in the file-system
context, and tracing it through the layers above shows why each one exists:

1. The application calls `read()` on a file handle it already obtained from `open()`.
2. The **logical file system** looks up the open-file-table entry the handle refers to, uses
   it to confirm the caller's permissions, and determines which logical blocks of the file
   satisfy the request.
3. The **file-organization module** translates those logical block numbers into the actual
   physical block numbers the data lives at on the device — the layer that knows about the
   file's allocation structure.
4. The **basic file system** issues a generic command ("read physical block *P*") down to the
   appropriate device driver, without caring what file, or even what file system, that block
   belongs to.
5. **I/O control** — the device driver and its interrupt handler — carries out the actual
   transfer between the device controller and main memory, and signals completion back up
   the stack.

Each layer only ever talks to the one immediately above or below it, which is exactly why a
completely different file system (say, one built for flash storage instead of spinning
disks) can be dropped in underneath the same logical file system and application code
without either one ever needing to change.

## Key Takeaways

- A **file** is the OS's basic logical unit of storage — a named collection of data that
  hides the physical scattering of disk blocks behind a small set of **attributes** (name,
  identifier, type, size, protection, timestamps).
- File **operations** include create, write, read, reposition, delete, and truncate; **open**
  and **close** are separate bookkeeping operations that set up and tear down an in-memory
  open-file-table entry exactly once, instead of repeating a directory search on every single
  read or write.
- **Sequential access** reads a file in order, like a tape; **direct (random) access** jumps
  straight to any block by number — essential for database-style workloads that rely on fast,
  non-sequential lookups.
- Directory structures evolved from **single-level** (one directory, global naming
  conflicts), to **two-level** (one directory per user, conflicts solved *between* users), to
  **tree-structured** (arbitrary nesting, path-based naming, a current-directory concept) —
  the structure virtually every modern file system uses.
- A file system is implemented as **layers** — application programs, logical file system,
  file-organization module, basic file system, I/O control, and devices — and a single
  `read()` system call (Lecture 3) passes down through every one of them on its way to an
  actual disk access.

With the concepts and structure of a file system established, the next lecture goes one
level deeper into two of its most important subsystems: how directories are actually
implemented internally, and how a file system decides who is allowed to do what to a file.
Continue to
[Lecture 31 — File Systems: Directories, Protection, and Memory-Mapped Files](lecture-31-file-systems-directories-protection-and-memory-mapped-files.md).
