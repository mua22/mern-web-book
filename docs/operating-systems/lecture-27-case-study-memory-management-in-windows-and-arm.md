---
title: "27. Case Study: Memory Management in Windows and ARM"
tags:
  - CSC323
  - Operating Systems
  - Windows
  - ARM
  - Case Study
---

# 27. Case Study: Memory Management in Windows and ARM

Lectures 25 and 26 built the theory of virtual memory, demand paging, and page replacement
from first principles — but theory is only half the story until it's checked against what
real systems actually do with it. This lecture is deliberately brief: a grounded look at
how one mainstream desktop operating system (Windows) and one dominant hardware
architecture (ARM) apply the ideas from the last two lectures, plus one ARM-specific
feature — TrustZone — that extends memory protection into territory the earlier theory
lectures only hinted at.

## In This Lecture

- How Windows combines demand paging with **clustering** to exploit locality of reference
- The **working-set trimming** Windows performs under memory pressure
- The conceptual difference between **reserving** and **committing** virtual memory
- How ARM's MMU and page-table design reflect its dominance in memory-constrained devices
- **TrustZone**: ARM's hardware-enforced secure/normal world isolation

## Memory Management in Windows

Windows uses demand paging as its baseline strategy, exactly as Lecture 25 described — but
it doesn't bring in just the one page that faulted. Windows pages are typically brought in
with **clustering**: when a fault occurs, the memory manager loads not only the faulting
page but **several pages around it** in one disk operation. This is a direct bet on
**locality of reference** — the same principle that justifies demand paging in the first
place — on the assumption that if a process just touched one page, it is likely to touch
its neighbors very soon too, so paying for one slightly larger disk read now is cheaper
than paying for several small ones later.

On the eviction side, Windows manages memory per-process using a **working-set** approach,
echoing Lecture 26's working-set model directly: each process has a working set of pages
the memory manager tries to keep resident. Under memory pressure, Windows **trims**
working sets — removing pages from processes (typically ones that haven't been referenced
recently) to free frames for processes that need them more urgently right now, rather than
treating every process's memory demand as equally important at every moment.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Windows memory management, conceptually</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Page fault occurs</span>
<span class="db-node-sub">Demand paging, as in Lecture 25</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Clustering</span>
<span class="db-node-sub">Load the faulting page plus nearby pages in one disk read</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Working-set trimming</span>
<span class="db-node-sub">Under memory pressure, pages are removed from working sets to free frames elsewhere</span>
</div>
</div>
</div>

Windows also exposes virtual memory to applications through an API built around a
deliberate two-step distinction: **reserving** a range of virtual addresses commits no
physical memory at all — it just guarantees the address range won't be handed out to
anything else — while separately **committing** that range is what actually guarantees
physical memory (or backing page-file space) will be available when it's touched. This
mirrors Lecture 25's core idea precisely: a large *reserved* address range costs nothing
until pages within it are actually committed and used, letting an application claim room
to grow (say, for a data structure that might expand significantly) without paying for
memory it may never touch.

## Memory Management on ARM

ARM's **Memory Management Unit (MMU)** performs the same job as the MMU in any paging
system from Lecture 24 onward — translating virtual addresses to physical ones through
page tables — but ARM's widespread use in **mobile and embedded devices**, where memory is
far more constrained than on a typical desktop, makes **multi-level page tables** even more
essential than they are on x86. A flat, single-level page table sized for a large address
space would itself consume memory an embedded device simply cannot spare; breaking the
table into multiple levels, where entire branches can be left unallocated until actually
needed, keeps page-table overhead itself proportional to how much address space a process
is genuinely using — the same multi-level philosophy covered in Lecture 24, now serving a
hardware context where the savings matter even more.

!!! note "Same translation idea, tighter budget"
    The conceptual job of ARM's MMU and page-table format is the same translation problem
    x86 solves — multiple page-table levels, a translation lookaside buffer to cache
    results, and permission bits per page. The emphasis is different: ARM's dominance in
    phones, tablets, and embedded systems makes every byte spent on page-table overhead
    a byte not available for the applications those devices actually run.

### TrustZone: Security Through Memory Isolation

**TrustZone** is an ARM-specific security feature that puts a hardware boundary directly
inside the memory system. It splits a system into two **worlds**:

<div class="db-diagram" markdown>
<p class="db-diagram-label">TrustZone — two worlds, hardware-enforced</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Secure world</span>
<span class="db-node-sub">Runs sensitive code and holds sensitive data — key storage, authentication, trusted boot</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Normal world</span>
<span class="db-node-sub">Runs the ordinary OS and applications — cannot access secure-world memory at all</span>
</div>
</div>
</div>

The isolation between the two worlds is enforced **in hardware**, at the memory system
itself, not merely by an operating system's software access checks. This is precisely the
same underlying goal as the protection mechanisms introduced much earlier in this course:
preventing one piece of software from reaching into memory it has no business touching.
TrustZone simply raises the stakes of that guarantee to the hardware level, so that even a
fully compromised normal-world OS still cannot read or tamper with whatever the secure
world is protecting.

## Key Takeaways

- **Windows** pairs demand paging with **clustering** (loading neighboring pages
  speculatively, betting on locality of reference) and manages eviction through
  **working-set trimming** under memory pressure.
- Windows's virtual memory API conceptually separates **reserving** address ranges (free)
  from **committing** them (which actually guarantees backing memory) — letting
  applications claim room to grow without paying for it upfront.
- **ARM's MMU** performs the same translation role as any paging hardware, but its
  dominance in memory-constrained mobile and embedded devices makes **multi-level page
  tables** even more essential than on desktop-class x86 systems.
- **TrustZone** splits an ARM system into a **secure world** and a **normal world**, with
  hardware-enforced memory isolation between them — the same protection goal introduced
  earlier in this course, now backed directly by the hardware.

With the theory of Lectures 25-26 now checked against two real systems, the course turns
to the other half of the memory hierarchy's story: what happens below RAM, on the disks
and flash devices that back every page this unit has discussed.
Continue to [Lecture 28 — Mass Storage Management](lecture-28-mass-storage-management.md).
