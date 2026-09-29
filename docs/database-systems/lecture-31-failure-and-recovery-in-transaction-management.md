---
title: "31. Failure and Recovery in Transaction Management"
tags:
  - CSC270
  - Recovery
  - Write-Ahead Logging
  - Checkpointing
  - Transaction Management
---

# 31. Failure and Recovery in Transaction Management

[Lecture 29](lecture-29-database-transactions-and-acid-properties.md) promised that a
committed transaction's effects survive any later crash — **Durability** — and
[Lecture 30](lecture-30-transaction-management-concurrency-control.md) covered how the DBMS
keeps concurrent transactions from interfering with each other. This lecture closes the loop:
what actually happens when the power fails, the OS crashes, or a disk dies mid-transaction,
and how the **recovery manager** puts the database back into a correct state afterward —
committed work intact, uncommitted work fully undone — using nothing but a log and the data
files themselves.

## In This Lecture

- Types of transaction failure: logical error, system crash, media failure
- Why system failures and media failures need fundamentally different recovery strategies
- The recovery manager's job, precisely stated
- Log-based recovery and the write-ahead logging (WAL) protocol
- Undo and redo: what each one reverses, and why both are necessary
- Checkpointing, and why recovery can't simply replay the entire log from the beginning
- Rollback vs. rollforward
- A full worked crash-recovery walkthrough, traced entry by entry

## Types of Transaction Failure

Not every failure is the same kind of problem, and the recovery manager must be able to tell
them apart.

- **Transaction failure (logical error)** — the transaction itself cannot complete: a
  constraint violation, a deadlock victim selection (Lecture 30), a division by zero in
  application logic, or the application explicitly issuing `ROLLBACK`. The DBMS and
  hardware are both fine; only this one transaction needs undoing.
- **System crash** — the DBMS process, operating system, or machine stops running
  unexpectedly (power loss, OS panic, hardware fault) — but the **disk remains intact**.
  Everything held in volatile memory (RAM) at the moment of the crash — including any data
  not yet flushed to disk — is lost, but the disk's existing contents survive.
- **Media (disk) failure** — the storage device itself is damaged or destroyed: a failed
  hard drive, corrupted storage, or physical destruction. Unlike a system crash, the data
  *on disk* is no longer trustworthy or accessible at all.

## System Failure vs. Media Failure

These last two failure types look superficially similar ("the database went down") but
demand entirely different recovery strategies, because they lose different things.

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">System failure</span>
<span class="db-node-sub">Volatile memory (RAM) is lost. Disk is intact. Recovery replays the log against the existing disk data — no backup needed.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Media failure</span>
<span class="db-node-sub">The disk itself is lost or corrupted. Recovery must restore from the most recent backup, then apply the log to bring it forward to the point of failure.</span>
</div>
</div>

A system failure is recoverable purely from the transaction log, because the log and the
data files both live on the (still-intact) disk. A media failure destroys the disk itself,
so the log that would have described how to fix things is potentially gone too — which is
exactly why regular, verified backups (stored on separate media) are non-negotiable, not
optional insurance.

!!! warning "A backup you have never restored is not a backup"
    Teams routinely discover, only during an actual media failure, that their backup files
    were silently incomplete, corrupted, or simply never being written by the scheduled job
    they assumed was running. The only way to trust a backup is to periodically *actually
    restore it* — on a test system, not the production one — and confirm the restored
    database is complete and consistent. A recovery plan that has never been rehearsed is a
    hope, not a plan.

## Recovery Concepts

The **recovery manager** is the DBMS subsystem responsible for restoring the database to a
correct, consistent state after any of the failures above — concretely, it must guarantee
that **Atomicity** and **Durability** both hold despite the failure: every transaction that
had committed before the failure must still show its effects afterward, and every
transaction that had *not* committed must show none of its effects at all, exactly as if it
had never run.

To do this without needing to trust *anything* held only in volatile memory at the moment of
a crash, the recovery manager relies on a **log** — a sequential, append-only record of
every change made to the database — written to stable storage independently of the data
files themselves.

## Log-Based Recovery and Write-Ahead Logging

**Log-based recovery** records every database write as a **log record** before, or as part
of, applying that write — so the log always contains enough information to redo or undo any
change, even one whose effect on the actual data file was lost in a crash. Each log record
typically captures: the transaction ID, the data item changed, its old value (for undo),
and its new value (for redo).

The **write-ahead logging (WAL) protocol** states the one rule that makes this reliable: a
log record describing a change **must be written to stable storage before the data page it
describes is written to disk.**

<div class="db-diagram" markdown>
<p class="db-diagram-label">Write-ahead logging: the log always goes first</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">1. Log record written</span>
<span class="db-node-sub">Old value, new value, transaction ID — flushed to stable storage</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">2. Data page written</span>
<span class="db-node-sub">The actual table/index page is updated on disk — only after step 1</span>
</div>
</div>
</div>

The reasoning is direct: if the *data page* were written first and the crash happened before
the *log record* was written, there would be no record anywhere of what changed or how to
undo it — an uncommitted change could become permanent by accident, with no way to detect or
reverse it. Writing the log first guarantees the opposite failure mode is the only possible
one: at worst, the log describes a change that never made it to the data page, which is
exactly what the **redo** step (below) exists to fix.

## Undo and Redo

Recovery from a system crash works by replaying the log against the (intact) data files,
using two complementary operations:

- **Undo** — reverses the effect of a transaction that had **not committed** at the time of
  the crash, using each log record's *old value* to restore the data item to what it was
  before that transaction touched it. Every uncommitted transaction active at the moment of
  the crash must be fully undone — Atomicity demands it leaves no partial trace.
- **Redo** — reapplies the effect of a transaction that **had committed**, using each log
  record's *new value*, to guarantee its change is actually present on disk — because WAL
  only guarantees the log record was written before the crash, not that the corresponding
  data page write had also completed. Durability demands every committed transaction's
  effect survives, even if the data page write itself never finished before the crash.

!!! tip "Redo is idempotent on purpose"
    Reapplying a redo record that had, in fact, already made it to disk before the crash
    causes no harm — it just writes the same new value again. This matters because the
    recovery manager generally can't tell, for certain, exactly which committed writes made
    it to disk and which didn't; redoing *all* of them, whether or not each one was strictly
    necessary, is simpler and just as correct as trying to redo only the ones that need it.

## Checkpointing

Naively, recovering from a crash would mean replaying the **entire** log from the very
first transaction the database ever ran — which grows more expensive, without bound, the
longer the database has been in service. **Checkpointing** solves this: periodically, the
DBMS flushes every modified (dirty) data page from memory to disk and writes a special
**checkpoint** record to the log, marking the point at which everything before it is
*guaranteed* to already be safely on disk.

<div class="db-diagram" markdown>
<p class="db-diagram-label">What a checkpoint buys recovery</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Flush all dirty pages to disk</span>
<span class="db-node-sub">Every change committed before this instant is now durably on disk</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Write CHECKPOINT record to the log</span>
<span class="db-node-sub">Marks the boundary: nothing before this point needs to be replayed</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">On a later crash, recovery starts HERE</span>
<span class="db-node-sub">Not from the beginning of the log — only from the last checkpoint forward</span>
</div>
</div>
</div>

After a checkpoint, recovery from any later crash only needs to examine log records written
**after** the most recent checkpoint — everything before it is already known to be safely
on disk and needs no further attention. This is the entire reason checkpointing exists: it
bounds the amount of log a recovery has to replay, no matter how long the database has been
running.

## Rollback and Rollforward

Two more terms describe the same undo/redo mechanics from a slightly different angle,
common in vendor documentation:

- **Rollback** — undoing a transaction's changes, either because the transaction itself
  aborted during normal operation, or because recovery determined it was still uncommitted
  at the time of a crash. Mechanically identical to the "undo" operation above.
- **Rollforward** — reapplying committed changes from a log (or a backup plus its log) to
  bring a database forward to a target point in time — mechanically identical to "redo,"
  and the specific term used when restoring from a backup after a **media** failure:
  restore the last full backup, then rollforward through the log to reach the exact moment
  of failure.

## Database Recovery Procedures: A Worked Walkthrough

Put every piece together. Four transactions run against a small `Accounts` table holding
values `A`, `B`, `C`, `D`, `E`. A checkpoint occurs partway through, and the system crashes
partway through the transactions that follow it.

<div class="db-relation" markdown>
<div class="db-relation-name">The log, in order, up to the crash</div>

| # | Log record | Note |
|---|---|---|
| 1 | `[T1 START]` | |
| 2 | `[T1, write A, old=100, new=200]` | |
| 3 | `[T1, write B, old=50, new=150]` | |
| 4 | `[T1 COMMIT]` | T1 fully committed |
| 5 | **`[CHECKPOINT]`** | All dirty pages flushed; disk now matches the log through record 4 |
| 6 | `[T2 START]` | |
| 7 | `[T2, write C, old=10, new=20]` | |
| 8 | `[T2 COMMIT]` | T2 fully committed, after the checkpoint |
| 9 | `[T3 START]` | |
| 10 | `[T3, write D, old=5, new=99]` | |
| 11 | `[T4 START]` | |
| 12 | `[T4, write E, old=1, new=2]` | |
| 13 | `[T4 COMMIT]` | T4 fully committed, after the checkpoint |
| — | **CRASH** | System failure — RAM lost, disk intact. T3 never issued COMMIT. |

</div>

**Step 1 — where recovery starts.** Because of the checkpoint at record 5, recovery does
**not** need to look at records 1–4 at all: T1 committed *before* the checkpoint, so its
changes to `A` and `B` are already guaranteed to be safely on disk. Recovery begins its
analysis at record 5 and reads forward.

**Step 2 — classify every transaction active at or after the checkpoint.**

<div class="db-relation" markdown>
<div class="db-relation-name">Analysis pass — transaction outcomes</div>

| Transaction | Outcome by crash time | Action |
|---|---|---|
| T1 | Committed *before* checkpoint | None needed — already durable |
| T2 | Committed *after* checkpoint | **Redo** |
| T3 | Never committed | **Undo** |
| T4 | Committed *after* checkpoint | **Redo** |

</div>

**Step 3 — redo every committed transaction found after the checkpoint**, using each
record's new value, whether or not it strictly needed reapplying:

```text
REDO: C = 20   (from record 7, T2)
REDO: E = 2    (from record 12, T4)
```

**Step 4 — undo every transaction that never committed**, using each record's old value,
walking backward through *that transaction's own* records:

```text
UNDO: D = 5    (from record 10, T3 — restores D to its value before T3 touched it)
```

**Result:** after recovery, `A=200, B=150` (from T1, untouched since they predate the
checkpoint), `C=20` (T2, redone), `D=5` (T3, undone back to its original value), `E=2` (T4,
redone). This is *exactly* the state the database would be in if T1, T2, and T4 had each run
to completion and T3 had never run at all — which is precisely what Atomicity and Durability
together require.

!!! note "Why T3 is undone even though it wrote to the log"
    Having a log record for T3's write to `D` does not mean that write is entitled to
    survive — it only means the recovery manager has enough information to know what to
    *undo*. A log record's old-value field exists specifically so that an uncommitted
    transaction's writes can be reversed with certainty, not guessed at.

## Key Takeaways

- Failures split into **transaction failure** (one transaction's logic breaks),
  **system crash** (RAM lost, disk intact), and **media failure** (the disk itself is
  gone) — each needs a different recovery response.
- The **recovery manager**'s job is to guarantee Atomicity and Durability survive any
  failure, using a **log** written independently of the data files.
- The **write-ahead logging (WAL) protocol** requires the log record for a change to reach
  stable storage before the data page itself does — the foundation every other recovery
  guarantee is built on.
- **Undo** reverses uncommitted transactions using old values; **redo** reapplies committed
  transactions' new values (safely, since redo is idempotent) — both are necessary, and
  they answer opposite questions.
- **Checkpointing** periodically flushes dirty pages and marks a log boundary, so recovery
  only ever needs to replay the log *from the last checkpoint forward*, not from the
  beginning of time.
- The worked walkthrough traced a real crash: T1 (committed before the checkpoint) needed
  no action, T2 and T4 (committed after the checkpoint) were **redone**, and T3 (never
  committed) was **undone** — landing the database in exactly the state a correct serial
  execution would have produced.

This closes Unit 8's mechanics. [Lecture 32](lecture-32-course-review.md) steps back and
ties the whole course — from Lecture 1's first definition of a database through this
lecture's recovery procedures — into one connected picture.
