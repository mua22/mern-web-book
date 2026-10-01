---
title: "29. Storage Device Management"
tags:
  - CSC323
  - Operating Systems
  - Storage Management
  - Disks
---

# 29. Storage Device Management

A brand-new disk, fresh out of the factory, is nearly useless to an operating system. It is
a spinning platter (or a block of flash cells) with no notion of files, no notion of a
"first" location to start reading from, and no record of which physical cells, if any, are
too damaged to trust. Before any file system can store a single byte on it, the disk has to
be prepared in layers — first so the controller can address individual sectors reliably at
all, then so an operating system can lay a file system down on top of that addressing. This
lecture walks through exactly that preparation: formatting a disk, the bootstrap process
that a formatted disk makes possible, how disks quietly survive their own physical defects,
and how the OS carves out space on disk to extend RAM when real memory runs short — tying
directly back to the demand-paging material from Lectures 25–26.

## In This Lecture

- Low-level (physical) formatting vs. logical formatting, and what each one actually writes
  to the disk
- The boot block and the full bootstrap chain, from power-on to a running OS
- How disks handle bad blocks — and why this is almost invisible to the OS on modern hardware
- Swap-space management: what swap space is for, where it can live, and why it is allocated
  differently from ordinary file storage

## Formatting a Disk

A disk has to be formatted twice, at two different levels, before it is useful — and the
two are easy to confuse because both are casually called "formatting."

### Low-Level (Physical) Formatting

**Low-level formatting**, also called **physical formatting**, divides a raw disk into
**sectors** that the disk controller can read and write, writing a header and a trailer
around each sector's data area. The header and trailer record a **sector number** and a
piece of **error-correcting code (ECC)**, which the controller later uses to detect — and
often repair — corrupted data automatically whenever that sector is read back.

!!! note "You will almost never do this yourself"
    Decades ago, buying a new hard disk meant running a low-level format program before it
    could be used at all. Today, manufacturers perform low-level formatting at the factory,
    as part of the manufacturing and testing process. End users and system administrators
    only encounter it through specialized diagnostic or recovery tools, and only when a disk
    is already behaving abnormally.

### Logical Formatting

**Logical formatting** is the step an operating system performs to actually make a disk
usable as a volume: it writes the initial file-system data structures onto the already
physically formatted disk. For a typical file system, this means laying down, at minimum:

- A **boot block**, reserved at a fixed, known location so firmware can always find it.
- **Free-space information**, recording which blocks on the volume are available for new
  data (a bitmap or a free list, depending on the file system).
- An **initial, empty root directory**, the one directory every other file and directory on
  the volume will eventually be reachable from.

This is the step most people actually mean when they say "format this drive" — reformatting
a USB stick from FAT32 to NTFS, for instance, is a logical format, not a physical one, and
it is dramatically faster precisely because the physical sector boundaries underneath are
left untouched.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two formatting steps, two different jobs</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Low-level (physical) formatting</span>
<span class="db-node-sub">Divides the disk into addressable sectors with ECC — done at the factory, rarely by end users</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Logical formatting</span>
<span class="db-node-sub">Writes a boot block, free-space info, and an empty root directory — what "formatting a drive" usually means today</span>
</div>
</div>
</div>

## The Boot Block and the Bootstrap Process

A disk that holds the operating system itself needs one more thing: a way to actually start
that operating system running, before any operating system is yet loaded. This is the
**bootstrap problem** — and it is solved by keeping the very first program the computer runs
tiny, dumb, and permanently located somewhere the hardware already knows to look.

The **bootstrap loader** is a small program whose only job is to locate the real operating
system kernel, load it into memory, and jump to its starting address. It is stored in a
reserved, fixed area at the start of a bootable disk called the **boot block**. Keeping the
bootstrap loader physically separate from the rest of the file system means the firmware
never has to understand file-system structures at all — it just reads one fixed location.

A disk (or partition) that contains a boot block is called a **boot disk** or **system
disk**.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The full bootstrap chain, from power-on to a running OS</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Firmware (BIOS / UEFI)</span>
<span class="db-node-sub">Runs automatically at power-on; knows only one thing — where the boot block is</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Boot Block / Bootstrap Loader</span>
<span class="db-node-sub">Tiny fixed program; locates the real OS kernel image on disk</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">OS Kernel Loaded</span>
<span class="db-node-sub">The bootstrap loader reads the kernel image into memory and transfers control to it</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">OS Takes Over</span>
<span class="db-node-sub">Kernel initializes drivers, memory management, and scheduling; the system is now "up"</span>
</div>
</div>
</div>

Each link in this chain exists because the one before it is deliberately kept as simple as
possible:

- **Firmware** is burned into read-only (or flash) memory on the motherboard itself, so it
  survives even a completely empty or corrupted disk. Its entire job at boot time is to run
  a power-on self-test and then read one small, fixed region of the designated boot device.
- The **boot block/bootloader** is small enough to fit in that fixed region and simple enough
  not to need a working file system to run — it typically understands just enough about the
  disk's layout to find the kernel image by its known location, not by searching a full
  directory tree.
- The **OS kernel**, once loaded, is finally a fully capable program — it can initialize
  device drivers, set up virtual memory, and start the scheduler, none of which the tiny
  bootstrap loader itself was ever equipped to do.

!!! tip "Why not have the firmware load the OS directly?"
    Firmware is written once, flashed onto the motherboard, and rarely updated — it has to
    work with *any* operating system a user might install, from any vendor, in any file
    system format. Splitting the job lets the firmware stay completely generic ("read this
    one fixed block and run whatever is there") while the bootloader, which *is* specific to
    one OS and file system, handles everything beyond that. Change operating systems, and
    only the boot block needs to change — the firmware never does.

## Bad Blocks

Disks are mechanical or electrical devices, and both kinds eventually develop physically
damaged sectors — a scratch on a platter, or a flash cell that has simply worn out after too
many writes. These are called **bad blocks**, and a well-designed storage system has to keep
operating despite them.

Modern disks handle this almost entirely in hardware. The disk controller maintains a
reserved **spare-sector pool** set aside specifically for this purpose. The first time a
sector is found to be unreadable, or fails its ECC check too often, the controller
transparently **remaps** the logical block number that used to point there onto one of the
spare sectors instead, and updates its internal mapping table accordingly. From the
operating system's point of view, nothing changed — the same logical block number still
works, and the OS never needs to know a remap even happened.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Hardware bad-block remapping, invisible to the OS</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">OS requests logical block 4,102</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Controller finds the physical sector behind it is damaged</span>
<span class="db-node-sub">Detected via a failed ECC check or an outright read error</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Controller silently remaps 4,102 to a spare sector</span>
<span class="db-node-sub">The OS's request still succeeds, against the same logical block number</span>
</div>
</div>
</div>

This was not always the case. Older, simpler disk systems — and some low-level utilities
even today — had no spare-sector pool at all, and instead had to track bad blocks in
software: a dedicated bad-block list was maintained, either by the operating system or by a
formatting utility, and the file system had to be told explicitly to avoid allocating any
file data to those specific blocks. A sector going bad on a disk like this could mean real
data loss, since nothing beneath the OS was watching out for it.

!!! warning "Spare sectors are a mitigation, not a guarantee"
    Hardware remapping handles sectors failing *one at a time*, gracefully, as a disk ages.
    It does not protect against the drive failing wholesale, nor does a nearly-exhausted
    spare-sector pool continue working forever — a disk reporting a rapidly growing
    reallocated-sector count is a strong signal it is approaching end of life, regardless of
    how invisible each individual remap has been so far.

## Swap-Space Management

**Lectures 25–26**, on demand paging and page replacement, established that physical RAM can
hold only a limited number of pages at once, and that the operating system must have
somewhere to put a page that is evicted to make room for another.
**Swap space** is exactly that somewhere: a reserved area of secondary storage the OS uses to
hold pages (and, on some systems, entire processes) that do not currently fit in physical
memory. Swap space is what makes a system's *usable* memory larger than its *physical* RAM,
at the cost of disk-speed access on a miss instead of RAM-speed access.

Swap space can be implemented in one of two places:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Where swap space can live</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">A raw disk partition</span>
<span class="db-node-sub">Managed directly by the OS's own swap-space storage manager, bypassing the file system entirely — faster, since there is no file-system overhead on every swap I/O</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">A regular file inside a file system</span>
<span class="db-node-sub">A normal file (e.g. a Windows pagefile) that the OS treats as swap space — more flexible: it can be resized, moved, or removed using ordinary file operations</span>
</div>
</div>
</div>

Whichever location is chosen, swap I/O performance matters enormously — a page fault that
has to wait on a slow swap read stalls the process (and often other processes scheduled
behind it) far more visibly than almost any other kind of disk access. For that reason, swap
space is typically allocated in **large, fixed-size chunks**, rather than let fragment
across the disk the way ordinary file storage is allowed to. Large, contiguous, uniformly
sized swap extents keep the access pattern simple and predictable for the swap manager,
which can then address a swapped-out page with simple arithmetic instead of walking a
file-system's block-allocation structures on every single page-in and page-out.

!!! note "Swap space is a direct consequence of Lecture 25–26's material, not a separate topic"
    Everything this section describes exists purely to support demand paging and page
    replacement: a page a process still needs, but that memory pressure forced out of RAM,
    has to go *somewhere* that can be read back in quickly on the next page fault. Swap space
    is that somewhere — storage management and memory management meet directly at this one
    point.

## Key Takeaways

- **Low-level (physical) formatting** divides a disk into addressable sectors with ECC, done
  at the factory; **logical formatting** writes a boot block, free-space information, and an
  empty root directory, and is what most people mean by "formatting a drive" today.
- The **bootstrap chain** keeps each stage as simple as possible: firmware reads one fixed
  location (the **boot block**), the bootstrap loader there locates and loads the real OS
  kernel, and only then does the kernel take over and bring up the rest of the system.
- Modern disks mostly hide **bad blocks** from the OS, transparently remapping damaged
  logical blocks onto a reserved spare-sector pool; older or simpler systems had to track bad
  blocks explicitly in software instead.
- **Swap space** extends usable memory beyond physical RAM by holding pages evicted under
  memory pressure, can live on a raw partition (faster) or inside a regular file (more
  flexible), and is allocated in large fixed-size chunks because swap I/O performance is
  critical to overall system responsiveness.

With storage devices themselves prepared and managed, the next lecture turns to what actually
gets built on top of them: the file concept itself, how files are organized, and how a
directory structure organizes many files at once. Continue to
[Lecture 30 — File Systems: Concepts and Structure](lecture-30-file-systems-concepts-and-structure.md).
