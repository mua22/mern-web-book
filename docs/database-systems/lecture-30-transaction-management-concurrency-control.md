---
title: "30. Transaction Management: Concurrency Control"
tags:
  - CSC270
  - Concurrency Control
  - Locking
  - Isolation Levels
  - Transaction Management
---

# 30. Transaction Management: Concurrency Control

[Lecture 29](lecture-29-database-transactions-and-acid-properties.md) named **Isolation**
as one of the four ACID properties and deferred the details. This lecture delivers them.
A production DBMS runs hundreds of transactions at once, interleaving their operations for
performance — but interleaved execution, left unchecked, produces wrong answers in ways
that are easy to miss until they've already corrupted real data. **Concurrency control** is
the DBMS machinery that allows transactions to run concurrently while still guaranteeing
each one gets the same result it would have gotten running completely alone.

## In This Lecture

- Why concurrent execution needs control at all: four concrete anomalies
- Serial vs. concurrent schedules, and serializability
- Lock-based concurrency control: shared and exclusive locks, and lock compatibility
- Two-Phase Locking (2PL): the growing and shrinking phases, and why it guarantees
  serializability
- Deadlocks: a concrete example, and detection/prevention strategies
- The SQL standard's four isolation levels, and which anomalies each one prevents

## The Need for Concurrency Control

Running transactions one at a time, start to finish, would trivially guarantee correctness
— but it would also mean every user waits in a single queue behind everyone else, which no
real system can afford. So a DBMS **interleaves** the operations of multiple transactions,
executing a few steps of one, then a few steps of another, switching back and forth (or
running them genuinely in parallel across CPU cores). This is essential for throughput, but
it opens the door to four well-known anomalies if nothing constrains *how* the interleaving
happens.

### Lost Update

A **lost update** occurs when two transactions both read the same value, both compute a new
value based on what they read, and the second transaction's write silently overwrites the
first's — even though both should have taken effect.

Take a savings account `A101` with balance 1000. `T1` deposits 100; `T2` deposits 50. Run
serially, in either order, the final balance must be 1150. Interleaved without control:

<div class="db-relation" markdown>
<div class="db-relation-name">Interleaved schedule producing a lost update</div>

| Time | T1 | T2 | balance |
|---|---|---|---|
| t1 | READ balance → 1000 | | 1000 |
| t2 | | READ balance → 1000 | 1000 |
| t3 | | WRITE balance = 1000+50 = 1050 | 1050 |
| t4 | | COMMIT | 1050 |
| t5 | WRITE balance = 1000+100 = 1100 | | 1100 |
| t6 | COMMIT | | 1100 |

</div>

The final balance is **1100** — T1 read the *original* 1000 at t1, before T2's deposit ever
happened, and its write at t5 has no idea T2 changed anything in between. T2's +50 deposit
is completely gone from the final value, even though T2 committed successfully. The correct
answer, 1150, never appears anywhere.

### Dirty Read

A **dirty read** occurs when a transaction reads a value written by another transaction
that has **not yet committed** — and that other transaction later rolls back, meaning the
value read never actually existed as far as the database is concerned.

<div class="db-relation" markdown>
<div class="db-relation-name">Interleaved schedule producing a dirty read</div>

| Time | T1 | T2 | balance |
|---|---|---|---|
| t1 | WRITE balance = 1000+100 = 1100 *(uncommitted)* | | 1100 |
| t2 | | READ balance → 1100 | 1100 |
| t3 | | *(uses 1100 in further calculation)* | 1100 |
| t4 | ROLLBACK *(deposit reversed)* | | 1000 |

</div>

T2 read and acted on **1100** — a value that, once T1 rolled back, never became a real,
committed fact about this account. Anything T2 computed or displayed from that read is now
based on data that formally never existed.

### Unrepeatable (Non-Repeatable) Read

A **non-repeatable read** occurs when a transaction reads the same row twice and gets two
*different* values, because another transaction committed a change to that row in between
the two reads.

<div class="db-relation" markdown>
<div class="db-relation-name">Interleaved schedule producing a non-repeatable read</div>

| Time | T1 | T2 | balance |
|---|---|---|---|
| t1 | READ balance → 1000 | | 1000 |
| t2 | | WRITE balance = 1000+100 = 1100 | 1100 |
| t3 | | COMMIT | 1100 |
| t4 | READ balance → 1100 *(same transaction, different value!)* | | 1100 |

</div>

T1 read the same row twice within a single transaction and got two different answers, purely
because T2 committed a change in the gap between those two reads — unlike a dirty read, the
value T2 wrote here *is* legitimately committed; the problem is only that T1's own view of
the data changed mid-transaction.

### Phantom Read

A **phantom read** occurs when a transaction re-runs the same *query* (not just a single row
lookup) and finds a **different set of rows**, because another transaction inserted or
deleted rows matching the query's condition in between.

<div class="db-relation" markdown>
<div class="db-relation-name">Interleaved schedule producing a phantom read</div>

| Time | T1 | T2 |
|---|---|---|
| t1 | `SELECT * FROM Account WHERE balance > 5000` → 3 rows | |
| t2 | | `INSERT INTO Account VALUES ('A999', 9000)` |
| t3 | | COMMIT |
| t4 | *(same query re-run)* → 4 rows | |

</div>

No row T1 already saw was changed — the anomaly is an entirely new row **appearing** inside
the range T1's query cares about, which a simple row-level lock (below) cannot prevent,
because there was no existing row to lock at t1.

## Serial and Concurrent Schedules, and Serializability

A **schedule** is the actual sequence in which the operations of one or more transactions
are executed. A **serial schedule** runs every transaction's operations completely, one
transaction at a time, with zero interleaving — guaranteed correct, but with no concurrency
benefit. A **concurrent (interleaved) schedule** interleaves operations from multiple
transactions, as every example above did.

A concurrent schedule is called **serializable** if its effect on the database is
*equivalent* to some serial schedule of the same transactions — even though it interleaved
operations for speed, it produces exactly the outcome one of the serial orderings would
have produced. (Testing this precisely uses **conflict serializability**: two operations
"conflict" if they access the same data item and at least one is a write; a schedule is
conflict-serializable if its conflicting operations can be reordered, without changing their
relative order, into a valid serial schedule.) All four anomalies above are exactly the
signature of a schedule that is **not** serializable — none of them corresponds to *any*
serial ordering of T1 and T2.

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Serial schedule</span>
<span class="db-node-sub">T1 fully completes, then T2 fully completes (or vice versa) — always correct, no overlap</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Serializable concurrent schedule</span>
<span class="db-node-sub">Operations interleaved for speed, but the result matches some serial ordering — the goal</span>
</div>
</div>

The lost-update, dirty-read, and non-repeatable-read schedules above are all concurrent
schedules that are **not** serializable — none of them match what either "T1 then T2" or "T2
then T1" would have produced. The DBMS's job is to permit interleaving *only* when the
result is still serializable — and locking is the classic mechanism for guaranteeing that.

## Lock-Based Concurrency Control

The most common way a DBMS enforces serializability is by requiring a transaction to
acquire a **lock** on a data item before touching it, and holding that lock until it is safe
to release. Two lock types cover the vast majority of use cases:

- **Shared lock (S-lock / read lock)** — acquired to *read* a data item. Multiple
  transactions may hold a shared lock on the same item simultaneously, since concurrent
  reads don't conflict with each other.
- **Exclusive lock (X-lock / write lock)** — acquired to *write* a data item. Only one
  transaction may hold an exclusive lock on an item at a time, and no other transaction may
  hold *any* lock (shared or exclusive) on that item while it's held.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Lock compatibility matrix</p>
<div class="db-relation" markdown>

| Requested \ Held by another transaction | Shared (S) | Exclusive (X) |
|---|---|---|
| **Shared (S)** | Compatible — both proceed | Must wait |
| **Exclusive (X)** | Must wait | Must wait |

</div>
</div>

Badges for quick reference in later diagrams: <span class="db-badge db-badge-teal">S</span>
shared, <span class="db-badge db-badge-orange">X</span> exclusive.

## Two-Phase Locking (2PL)

Simply requiring locks before access is not, by itself, enough to guarantee
serializability — a transaction that releases a lock early and re-acquires another later can
still produce a non-serializable schedule. **Two-Phase Locking (2PL)** adds one crucial rule:
every transaction is divided into exactly two phases, and once it starts releasing locks, it
may never acquire another.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two-Phase Locking: growing phase, then shrinking phase</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Growing Phase</span>
<span class="db-node-sub">The transaction may acquire new locks. It may NOT release any lock yet.</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Lock Point</span>
<span class="db-node-sub">The instant the transaction holds its maximum number of locks — the boundary between the two phases</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Shrinking Phase</span>
<span class="db-node-sub">The transaction may release locks. It may NOT acquire any new lock from here on.</span>
</div>
</div>
</div>

Once a transaction releases even one lock, it has entered the shrinking phase and is
forbidden from acquiring any further lock — that one-way boundary is what rules out the
lost-update interleaving. Applying 2PL to the earlier lost-update example:

<div class="db-relation" markdown>
<div class="db-relation-name">2PL preventing the lost update</div>

| Time | T1 | T2 | balance |
|---|---|---|---|
| t1 | Acquire X-lock(balance) | | — |
| t2 | READ balance → 1000 | *(BLOCKED — requests X-lock, must wait)* | 1000 |
| t3 | WRITE balance = 1100 | *waiting* | 1100 |
| t4 | COMMIT, release X-lock | *waiting* | 1100 |
| t5 | | Acquire X-lock(balance) | — |
| t6 | | READ balance → 1100 | 1100 |
| t7 | | WRITE balance = 1100+50 = 1150 | 1150 |
| t8 | | COMMIT, release X-lock | 1150 |

</div>

T2's request for the exclusive lock at t2 cannot be granted while T1 still holds it — T2
simply waits until t5. The final balance is now **1150**, matching a genuine serial
execution, at the cost of T2 briefly waiting rather than running fully in parallel. That
trade — some waiting, in exchange for a guaranteed-correct result — is the whole point of
2PL.

!!! tip "2PL guarantees serializability, not deadlock-freedom"
    2PL is provably sufficient to guarantee every schedule it produces is serializable. It
    says nothing about **when** a waiting transaction gets its lock — and, as the next
    section shows, two transactions can end up waiting on each other forever.

## Deadlocks

A **deadlock** occurs when two (or more) transactions each hold a lock the other needs, and
each is waiting for the other to release it — neither can ever proceed.

<div class="db-diagram" markdown>
<p class="db-diagram-label">A concrete deadlock between T1 and T2</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">T1</span>
<span class="db-node-sub">Holds X-lock(A101). Now requests X-lock(A205) — held by T2. T1 waits.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">T2</span>
<span class="db-node-sub">Holds X-lock(A205). Now requests X-lock(A101) — held by T1. T2 waits.</span>
</div>
</div>
</div>

```text
T1: X-lock(A101)              T2: X-lock(A205)
T1: ... requests X-lock(A205) T2: ... requests X-lock(A101)
    -> BLOCKED, waits on T2       -> BLOCKED, waits on T1
```

Each transaction is waiting on the other, and neither will ever release its first lock
because neither can move past its second lock request — a genuine cycle with no way out on
its own.

Two general strategies address this:

- **Deadlock detection** — the DBMS periodically builds a **wait-for graph** (a node per
  transaction, an edge `Ti → Tj` when `Ti` is waiting on a lock `Tj` holds) and checks it
  for cycles. Finding a cycle *is* finding a deadlock; the DBMS resolves it by choosing a
  **victim** transaction to abort and roll back, releasing its locks so the others can
  proceed.
- **Deadlock prevention** — avoid the possibility entirely, for example by ordering lock
  requests (every transaction must request locks in the same global order across all
  transactions, so a cycle can never form) or using timeouts (a transaction waiting longer
  than a threshold is assumed deadlocked and aborted, even without proving a cycle exists).

!!! warning "Detection always costs a rollback; prevention costs concurrency"
    Detection is simple to reason about but means some transaction's work is thrown away
    and retried every time a deadlock actually occurs. Prevention avoids that cost but can
    force transactions to request locks in a less natural order than the application logic
    would otherwise use, sometimes serializing work that didn't strictly need to be
    serialized. Most production DBMSs use detection with a short timeout, since real
    deadlocks are rare relative to the overhead of strict prevention.

## Isolation Levels

Full serializability, enforced with strict 2PL, is the strongest possible guarantee — but
it is also the most restrictive on concurrency, since it holds locks for a transaction's
entire duration. The SQL standard defines four **isolation levels**, each permitting more
concurrency (and more of the anomalies above) than the one below it, so applications can
choose the weakest level that's still safe for what they're doing.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Isolation levels, weakest to strongest</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Read Uncommitted</span>
<span class="db-node-sub">Weakest — may read another transaction's uncommitted writes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Read Committed</span>
<span class="db-node-sub">Only ever reads committed data — but a re-read within the same transaction can still change</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Repeatable Read</span>
<span class="db-node-sub">Re-reading the same row within a transaction always returns the same value</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Serializable</span>
<span class="db-node-sub">Strongest — behaves exactly as if every transaction ran alone, one at a time</span>
</div>
</div>
</div>

## Read Phenomena: Which Level Prevents Which Anomaly

<div class="db-relation" markdown>
<div class="db-relation-name">Isolation levels vs. anomalies prevented</div>

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|---|---|---|---|
| **Read Uncommitted** | Possible | Possible | Possible |
| **Read Committed** | Prevented | Possible | Possible |
| **Repeatable Read** | Prevented | Prevented | Possible |
| **Serializable** | Prevented | Prevented | Prevented |

</div>

Reading the table by column tells the real story: **dirty reads** are cheap to rule out (just
never read another transaction's uncommitted write) and every level above the weakest does
so; **non-repeatable reads** need locks held on rows already read, for the whole
transaction, which is why only Repeatable Read and above prevent them; **phantom reads**
need locks on an entire *range* of potential rows, not just the ones that already existed at
query time, which only true Serializable isolation guarantees.

!!! note "Lost update isn't in this table on purpose"
    The SQL standard's isolation-level definitions are phrased in terms of dirty,
    non-repeatable, and phantom reads specifically — lost update is prevented as a side
    effect of the locking (or an equivalent mechanism) each level uses to prevent those
    three, rather than being named as its own row. Under 2PL specifically, Repeatable Read
    and Serializable both hold write locks long enough to rule the lost-update schedule
    from earlier in this lecture out entirely.

## Transaction Isolation and Consistency

Isolation and Consistency are easy to conflate but answer different questions. Consistency
([Lecture 29](lecture-29-database-transactions-and-acid-properties.md)) asks whether a
*single* transaction's final state obeys every integrity constraint. Isolation asks whether
*concurrently running* transactions interfere with each other's intermediate, in-progress
work. A schema can be perfectly consistent and still suffer a lost update if isolation is
too weak — the balance in this lecture's lost-update example never violated any `CHECK`
constraint at any point; the row was simply wrong because two transactions stepped on each
other. Choosing an isolation level is therefore an explicit trade-off an application makes,
row by row and transaction by transaction, between correctness guarantees and how much
concurrent throughput the DBMS can deliver.

## Key Takeaways

- Uncontrolled interleaving produces four concrete anomalies: **lost update**, **dirty
  read**, **non-repeatable read**, and **phantom read** — each was demonstrated here with a
  numbered, traceable schedule.
- A schedule is **serializable** if its result matches some serial execution of the same
  transactions — the correctness bar concurrency control exists to guarantee.
- **Shared locks** permit concurrent reads; **exclusive locks** are exclusive of everything;
  **Two-Phase Locking (2PL)** — a growing phase that only acquires locks, then a shrinking
  phase that only releases them — guarantees serializability, and was shown directly fixing
  the earlier lost-update schedule.
- **Deadlock** occurs when transactions wait on each other in a cycle; DBMSs resolve it by
  **detection** (wait-for graph, abort a victim) or **prevention** (ordered lock requests,
  timeouts).
- The SQL standard's four **isolation levels** — Read Uncommitted, Read Committed,
  Repeatable Read, Serializable — trade off concurrency against which of the dirty/
  non-repeatable/phantom read anomalies they prevent, summarized in the comparison table
  above.

[Lecture 31](lecture-31-failure-and-recovery-in-transaction-management.md) turns to the
other half of what a transaction manager guarantees: what happens when the hardware itself
fails mid-transaction, and how Durability survives it.
