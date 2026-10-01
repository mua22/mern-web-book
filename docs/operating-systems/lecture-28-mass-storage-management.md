---
title: "28. Mass Storage Management"
tags:
  - CSC323
  - Operating Systems
  - Mass Storage
  - Disk Scheduling
  - SSD
---

# 28. Mass Storage Management

Every page fault traced through Lecture 25's page-fault handling sequence ends with the
same step: "schedule a disk read." That single step was treated as a black box — now it's
time to open it. This lecture looks at what a hard disk actually is physically, why its
access time has three separate components that all have to be paid on every access, how
flash-based storage sidesteps some of those costs while introducing its own, and how the
**order** in which the OS services pending disk requests can change total head movement by
several times over, for the exact same set of requests.

## In This Lecture

- The physical structure of a hard disk, and the three components of disk access time
- **Volatile vs. non-volatile memory**, and how SSD performance characteristics differ from
  a mechanical disk's
- Why **disk scheduling** matters: seek time dominates, so request order matters
- **FCFS**, **SSTF**, **SCAN**, and **C-SCAN**, worked against one shared example
- Why **NVM/SSD scheduling** is a fundamentally different problem from head-movement
  minimization

## Hard Disk Structure and Access Time

A hard disk stores data on one or more spinning **platters**, each with its own
read/write **head** riding just above the surface. Each platter surface is divided into
concentric **tracks**, and each track is divided into **sectors** — the smallest unit the
disk can read or write. Reading any particular sector requires three physically distinct
delays, all of which must happen in sequence:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The three components of hard-disk access time</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Seek time</span>
<span class="db-node-sub">Moving the read/write head to the correct track</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Rotational latency</span>
<span class="db-node-sub">Waiting for the platter to spin the right sector under the head</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Transfer time</span>
<span class="db-node-sub">Actually reading the sector's bits as they pass under the head</span>
</div>
</div>
</div>

**Worked example.** Take a disk spinning at 7,200 RPM, with an average seek time of 4 ms
and a transfer rate of 125 MB/s, reading a single 4 KB block:

- **Seek time**: given as 4 ms.
- **Rotational latency**: one full revolution takes 60,000 ms / 7,200 = 8.33 ms; on
  average, the disk only has to wait for *half* a revolution to bring the target sector
  under the head, so average rotational latency is 8.33 / 2 ≈ 4.17 ms.
- **Transfer time**: 4,096 bytes / 125,000,000 bytes/s ≈ 0.033 ms.

**Total access time = 4 + 4.17 + 0.033 ≈ 8.2 ms**

!!! note "This is exactly the number Lecture 25 used"
    Lecture 25's EAT worked example used an 8 ms page-fault service time without
    justifying it — this is where that figure actually comes from. A page fault's cost is
    dominated almost entirely by this one disk access, which is also exactly why the EAT
    formula punished even a tiny fault rate so severely: 8.2 ms is roughly forty thousand
    times slower than a 200 ns memory access.

## Volatile and Non-Volatile Memory

**RAM** is **volatile**: its contents are lost the instant power is removed, which is
precisely why every byte a running process touches still has to be backed by something
that survives a power-off — a hard disk, or increasingly, flash-based storage. **Flash
memory**, **SSDs**, and other forms of **non-volatile memory (NVM)** retain their contents
with no power applied at all, which is what lets them serve as persistent storage in the
first place.

Performance-wise, the two technologies diverge sharply. An SSD has **no moving parts** —
no spinning platter, no physically moving head — so it pays **neither seek time nor
rotational latency**; any block can be reached in roughly the same, very small amount of
time, regardless of where it physically sits. But SSDs trade the mechanical bottleneck for
a different one entirely: flash cells support only a **limited number of write-erase
cycles** before they wear out, which is why SSD controllers perform **wear leveling** —
spreading writes evenly across all the cells on the device — to stop any one region from
being worn out and failing long before the rest of the drive.

## Disk Scheduling

For a mechanical hard disk, **seek time dominates** total access time — in the worked
example above, it was roughly half the entire access, and it's the one component that
depends heavily on *where the head currently is* versus *where it needs to go next*. This
makes the **order** in which pending requests are serviced matter enormously: service them
in a bad order, and the head bounces wildly across the disk; service them well, and total
head movement shrinks dramatically for the exact same set of requests.

- **FCFS (First-Come, First-Served)** — service requests in the order they arrived. Simple,
  fair in the sense of never reordering anyone, but makes no attempt to minimize head
  movement at all.
- **SSTF (Shortest Seek Time First)** — always service whichever pending request is
  **closest** to the head's current position. Minimizes movement greedily, step by step,
  but can **starve** a request that happens to sit far from wherever the head currently is,
  if closer requests keep arriving.
- **SCAN (the "elevator algorithm")** — sweep across the disk in one direction, servicing
  every request the head passes along the way, all the way to the end of the disk; then
  reverse direction and sweep back, exactly like an elevator that visits every floor on its
  way up before coming back down.
- **C-SCAN (Circular SCAN)** — sweeps in one direction only, servicing requests along the
  way; upon reaching the end of the disk, it jumps back to the beginning **without
  servicing any requests on the return trip**, then sweeps forward again. This sacrifices
  some total head movement compared to SCAN, in exchange for far more **uniform** wait
  times — no request ever waits through two full sweeps in a row the way one can under
  SCAN, right after the head passes it going the "wrong" way.

### Worked Example

A disk has 200 cylinders, numbered 0 to 199. The head is currently at cylinder **53**, and
the pending request queue, in arrival order, is:

**98, 183, 37, 122, 14, 124, 65, 67**

**FCFS** — service in arrival order:

**53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67**

| Move | Distance |
|---|---|
| 53 → 98 | 45 |
| 98 → 183 | 85 |
| 183 → 37 | 146 |
| 37 → 122 | 85 |
| 122 → 14 | 108 |
| 14 → 124 | 110 |
| 124 → 65 | 59 |
| 65 → 67 | 2 |

**Total FCFS movement: 640 cylinders.**

**SSTF** — always jump to the closest remaining request:

**53 → 65 → 67 → 37 → 14 → 98 → 122 → 124 → 183**

| Move | Distance |
|---|---|
| 53 → 65 | 12 |
| 65 → 67 | 2 |
| 67 → 37 | 30 |
| 37 → 14 | 23 |
| 14 → 98 | 84 |
| 98 → 122 | 24 |
| 122 → 124 | 2 |
| 124 → 183 | 59 |

**Total SSTF movement: 236 cylinders** — dramatically less than FCFS, for the identical
set of requests.

**SCAN** — sweeping upward (toward higher cylinder numbers) first, all the way to the end
of the disk, then reversing:

**53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 37 → 14**

| Move | Distance |
|---|---|
| 53 → 65 | 12 |
| 65 → 67 | 2 |
| 67 → 98 | 31 |
| 98 → 122 | 24 |
| 122 → 124 | 2 |
| 124 → 183 | 59 |
| 183 → 199 (end of disk) | 16 |
| 199 → 37 | 162 |
| 37 → 14 | 23 |

**Total SCAN movement: 331 cylinders.**

**C-SCAN** — sweeping upward only, jumping back to cylinder 0 without servicing on the
return, then continuing upward from 0:

**53 → 65 → 67 → 98 → 122 → 124 → 183 → 199 → 0 → 14 → 37**

| Move | Distance |
|---|---|
| 53 → 65 | 12 |
| 65 → 67 | 2 |
| 67 → 98 | 31 |
| 98 → 122 | 24 |
| 122 → 124 | 2 |
| 124 → 183 | 59 |
| 183 → 199 (end of disk) | 16 |
| 199 → 0 (return jump, no service) | 199 |
| 0 → 14 | 14 |
| 14 → 37 | 23 |

**Total C-SCAN movement: 382 cylinders.**

<div class="db-relation" markdown>
<div class="db-relation-name">Head movement comparison — same request queue, same starting position</div>

| Algorithm | Total head movement (cylinders) |
|---|---|
| FCFS | 640 |
| SCAN | 331 |
| C-SCAN | 382 |
| SSTF | **236** |

</div>

SSTF wins on raw total movement here, as it usually does — but note that C-SCAN moves
*more* than SCAN overall, despite being the one specifically designed for fairness. That
is the trade-off stated above made concrete: C-SCAN spends extra movement on its
unserviced return jump specifically to guarantee every request waits roughly the same
amount of time, rather than to minimize total movement.

!!! warning "SSTF's starvation risk doesn't show up in a single snapshot"
    This worked example only shows one queue, serviced once, so SSTF's weakness never
    triggers — but imagine a steady stream of new requests arriving near cylinder 53 while
    one lone request sits at cylinder 199. SSTF will happily keep servicing the nearby
    stream of requests indefinitely, and the far-away request can wait a very long time
    simply because something closer always keeps winning the "shortest seek" comparison.

## NVM Scheduling

None of the four algorithms above are solving a seek-time problem for flash-based storage,
because flash has no seek time to minimize in the first place — any block can be reached in
roughly uniform time, with no mechanical arm to position. **NVM scheduling** is therefore a
genuinely different problem, focused instead on:

- **Write amplification** — a single logical write can force the controller to rewrite a
  much larger physical region, because flash can only be erased in large blocks; scheduling
  decisions that reduce how often this happens matter far more than head-movement order
  ever did.
- **Parallelism across flash channels** — an SSD is typically built from many independent
  flash chips wired to separate channels, so scheduling can dispatch multiple requests
  **simultaneously** across channels, something a single mechanical head could never do.

The mental model shifts entirely: a hard disk scheduler's job is minimizing *where the head
has to go next*; an NVM scheduler's job is minimizing *wear* and maximizing *how much work
happens in parallel* — the same high-level goal (serve pending I/O requests efficiently),
solved against a completely different set of physical constraints.

## Key Takeaways

- Hard-disk access time has three components — **seek time**, **rotational latency**, and
  **transfer time** — and the worked example above showed they combine to roughly 8.2 ms
  for a typical 7,200 RPM disk, the same figure Lecture 25 used as its page-fault service
  time.
- **RAM is volatile**; **flash/SSD/NVM is non-volatile**. SSDs pay no seek or rotational
  cost, but must manage **limited write-erase cycles** through **wear leveling**.
- Because seek time dominates mechanical disk access, **request order matters a great
  deal**: the same eight-request queue cost **640 cylinders under FCFS**, but only **236
  under SSTF**, with **SCAN (331)** and **C-SCAN (382)** trading some total movement for
  far more uniform wait times.
- **SSTF** minimizes movement greedily but can **starve** far-away requests; **SCAN** and
  **C-SCAN** bound worst-case waiting by sweeping systematically, with C-SCAN's unserviced
  return jump buying even more uniform fairness at the cost of extra total movement.
- **NVM/SSD scheduling** is a different problem altogether — no seek time to minimize, but
  **write amplification** and **parallelism across flash channels** to manage instead.

This lecture closed out the memory hierarchy's lower half: how data actually gets on and
off physical storage. The next lecture turns from the mechanics of a single device to how
an operating system manages storage devices as a whole.
Continue to [Lecture 29 — Storage Device Management](lecture-29-storage-device-management.md).
