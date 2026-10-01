---
title: "31. File Systems: Directories, Protection, and Memory-Mapped Files"
tags:
  - CSC323
  - Operating Systems
  - File Systems
  - File Protection
---

# 31. File Systems: Directories, Protection, and Memory-Mapped Files

Lecture 30 established the tree-structured directory as the shape virtually every file
system uses — but a tree's *shape* says nothing about how a single directory's contents are
actually stored and searched internally, nor about who should be allowed to touch a file
once it exists. This lecture closes both gaps, then introduces a technique that quietly
blurs the line between "file I/O" and "ordinary memory access" altogether: memory-mapped
files, which route a file's contents through the exact same demand-paging machinery Lecture
25 built for regular program memory.

## In This Lecture

- Directory implementation: linear lists vs. hash tables, and why real file systems overwhelmingly choose the latter
- File protection: access lists vs. the condensed owner/group/other permission model UNIX-like
  systems actually use
- Reading and constructing concrete `rwx` permission strings and their numeric `chmod`-style
  equivalents
- Memory-mapped files: what `mmap()`-style mapping does, why it is often faster and simpler
  than explicit `read()`/`write()`, and when to reach for it

## Directory Implementation

A directory is, underneath its tree-structured appearance, just another data structure that
has to be searched every time a file is created, opened, renamed, or deleted. Two
implementations dominate in practice.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Directory implementation: linear list vs. hash table</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Linear list</span>
<span class="db-node-sub">A simple list of file names with pointers to their data blocks — easy to implement, but every lookup, creation, or deletion scans the whole list: O(n)</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Hash table</span>
<span class="db-node-sub">A hash of the file name selects (almost directly) its entry — near O(1) average-case lookup, the structure real file systems actually use</span>
</div>
</div>
</div>

A **linear list** of file names, each paired with a pointer to the file's data blocks (or
its inode), is the most straightforward way to implement a directory — but a linear list has
to be scanned from the start, on every single operation, to find a match or to confirm a
name is not already taken. For a directory with a handful of files this is unnoticeable; for
a directory with tens of thousands of entries, every `create()` call degrades toward
scanning the entire list just to check the new name doesn't collide with an existing one.

A **hash table** fixes this directly: the file name is run through a hash function that
produces (close to) the position of its entry immediately, turning a lookup, insertion, or
deletion into a near-constant-time operation on average, regardless of how many files the
directory holds. This is the approach real file systems use at scale. The caveat is the
usual one for any hash-based structure: **collisions** — two different file names hashing to
the same slot — have to be resolved (commonly by chaining entries together at that slot), and
a poorly sized or poorly distributed hash table can degrade back toward linear-list behavior
in the worst case.

!!! note "This is the same trade-off a course on data structures already covers in depth"
    A directory's lookup problem — many keys, frequent membership tests, frequent insertions
    and deletions — is exactly the problem hash tables were built to solve, and the same
    O(1)-average-but-O(n)-worst-case trade-off applies here as it does anywhere else a hash
    table is used.

## File Protection

Once a file exists inside a directory, the file system has to decide who, exactly, is
allowed to do what to it. Two broad approaches exist.

### Access Lists

An **access list** attaches to each file an explicit list of exactly which users (or groups)
may perform exactly which operations on it — one entry per user, each entry naming its own
permitted operations. This is maximally flexible: a file can be shared with precisely the
five specific people who need it, with a different permission for each of them if required.
The flexibility has a cost, though — a file shared across a large, changing population of
users can accumulate an unwieldy, hard-to-audit list, and every new user who needs access
means another entry to add (and, eventually, remove again).

### The Condensed Owner/Group/Other Scheme

Real UNIX-like systems (Linux, macOS, and the file systems they rely on) use a far more
compact scheme instead: every file carries exactly **three** sets of permission bits, one
each for its **owner**, its **group**, and **everyone else (other)** — no per-user list at
all.

Each of the three sets carries the same three bits:

- **r (read)** — permission to read the file's contents (or list a directory's entries).
- **w (write)** — permission to modify the file's contents (or create/delete entries within
  a directory).
- **x (execute)** — permission to run the file as a program (or to enter/traverse a
  directory).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Reading a permission string: rwxr-xr--</p>
<div class="os-regs" markdown>
<div class="os-reg" markdown>
<span class="db-node-title">Owner — rwx</span>
<span class="db-node-sub">read, write, execute all granted</span>
</div>
<div class="os-reg" markdown>
<span class="db-node-title">Group — r-x</span>
<span class="db-node-sub">read and execute granted; write denied</span>
</div>
<div class="os-reg" markdown>
<span class="db-node-title">Other — r--</span>
<span class="db-node-sub">read only; write and execute both denied</span>
</div>
</div>
</div>

Reading `rwxr-xr--` left to right, in groups of three: the **owner** gets `rwx` (full
access); the **group** gets `r-x` (can read and execute, but not modify); **other** gets
`r--` (read-only, nothing else). A `-` in any position simply means that particular
permission is denied for that set.

### The Numeric (chmod-style) Form

Because three bits map naturally onto three binary digits, each `rwx` triplet is also
commonly written as a single octal digit — `r=4`, `w=2`, `x=1`, summed together for whichever
permissions are actually granted. `rwxr-xr--` becomes:

| Set | Bits | Sum |
|---|---|---|
| Owner | r(4) + w(2) + x(1) | **7** |
| Group | r(4) + x(1) | **5** |
| Other | r(4) | **4** |

Which gives the familiar three-digit form, `754` — exactly the kind of value a `chmod 754
report.sh` command sets directly, in one step, instead of writing out the full symbolic
string.

!!! tip "A quick way to sanity-check a numeric mode"
    Any single digit from 0–7 is just a 3-bit number: break it into read (4), write (2), and
    execute (1), and check which bits are actually set. `6` is `4 + 2` — read and write, no
    execute (common for a plain data file owned by a user who needn't ever run it); `5` is
    `4 + 1` — read and execute, no write (common for a shared, non-editable script); `0` means
    no permission at all is granted to that set.

!!! warning "Owner/group/other is strictly less expressive than a full access list"
    Collapsing arbitrary per-user permissions down to exactly three fixed sets is precisely
    what makes this scheme compact — and precisely what limits it. If a file genuinely needs
    five specific, unrelated users to each have a *different* permission, three fixed buckets
    cannot express that directly; real systems that need finer-grained control layer an
    actual access-control list (an ACL) back on top of this base scheme, exactly the model
    Lecture 32's look at NTFS permissions returns to.

## Memory-Mapped Files

Everything so far has assumed a program touches a file's data through explicit `read()` and
`write()` calls, each one an explicit request that copies data between the file and a buffer
the program supplies. **Memory-mapped files** offer a different way entirely: a system call
in the `mmap()` family maps a file's contents directly into a region of the calling process's
**virtual address space**. Once that mapping exists, ordinary memory operations — dereferencing
a pointer to read a value, assigning through a pointer to change one — transparently *become*
file I/O, with no explicit `read()` or `write()` call involved at all.

<div class="db-diagram" markdown>
<p class="db-diagram-label">mmap() vs. explicit read()/write()</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Explicit read()/write()</span>
<span class="db-node-sub">Kernel copies data from the page cache into a user-supplied buffer, and back again on write — an extra copy each way</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Memory-mapped file (mmap())</span>
<span class="db-node-sub">The file's pages ARE the process's memory pages; a pointer dereference reads/writes the page cache directly — no separate buffer, no extra copy</span>
</div>
</div>
</div>

This works by hooking into the exact same **demand-paging** machinery Lecture 25 introduced
for ordinary program memory. Mapping a file does not immediately read any of its contents
into memory — it only reserves the address range and records what each page of that range
corresponds to on disk. The *first* access to any page of the mapping triggers a page fault,
exactly like a demand-paged program page that has never been touched, and the OS satisfies
that fault by bringing the needed page in from the file (through the existing page cache)
rather than from a program's own backing store. Every later access to that same page is then
a plain, fast memory access, with no further I/O at all, until the page is eventually evicted
under memory pressure — the identical lifecycle any other demand-paged page goes through.

### Why This Is Often Faster and Simpler

Two things make memory-mapped files attractive over explicit `read()`/`write()`:

- **No extra buffer-copying.** An explicit `read()` call typically copies data from the
  kernel's page cache into a buffer the calling program supplies — one copy. A memory-mapped
  file skips that copy entirely: the mapped pages *are* the page-cache pages, and the
  program's pointer accesses go straight to them.
- **Reuse of machinery the OS already has.** Lazy loading, caching of recently used pages,
  and eviction under memory pressure are all already implemented, correctly and efficiently,
  by the demand-paging system. A memory-mapped file gets all of that for free, rather than
  needing its own, separately written caching logic layered on top of explicit reads.

### A Concrete Use Case

A program that needs fast, read-only access to a large data file — say, a multi-gigabyte
lookup table it consults constantly but never modifies — is a natural fit: mapping the file
once lets the program treat it as if it were simply a very large in-memory array, with the
OS silently handling which parts are actually resident at any given moment. Memory mapping is
also the standard mechanism by which two or more *processes* share memory in the first
place: if two unrelated processes each map the *same* file, both ends up pointing at the same
underlying physical pages, and a write one process makes through its mapping is immediately
visible to the other — a shared-memory channel built entirely out of the file system's own
machinery, with no separate shared-memory API required.

!!! note "Memory mapping does not bypass protection"
    A memory-mapped file still respects the owner/group/other permissions described earlier
    in this lecture — a process can only map a file for writing if it already had write
    permission on that file to begin with. Memory mapping changes *how* access happens, not
    *whether* it is allowed.

## Key Takeaways

- **Directory implementation** is usually a **hash table** in practice (near-O(1) average
  lookup), not the simpler but O(n) **linear list** — the same hashing trade-offs that apply
  to any hash-based structure, collisions included.
- **File protection** ranges from fully flexible but unwieldy **access lists** to the compact
  **owner/group/other**, `rwx`-per-set scheme real UNIX-like systems actually use — a string
  like `rwxr-xr--` decodes directly into a numeric mode like `754`.
- **Memory-mapped files** map a file's contents directly into a process's virtual address
  space, so ordinary pointer reads and writes transparently become file I/O, serviced lazily
  through the same demand-paging machinery that handles regular program pages.
- Memory mapping is often faster than explicit `read()`/`write()` because it avoids an extra
  buffer copy and reuses the OS's existing page-cache and eviction logic — and it doubles as
  a natural mechanism for processes to share memory by mapping the same file.

Directories and protection round out everything a general-purpose file system needs. The
final lecture of this course steps back to see these ideas at work in two real, widely used
systems — Windows and Apple's platforms — and closes out the entire course. Continue to
[Lecture 32 — Case Study: File Systems in Windows and Apple Platforms](lecture-32-case-study-file-systems-in-windows-and-apple-platforms.md).
