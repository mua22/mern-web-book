---
title: "29. Database Transactions and ACID Properties"
tags:
  - CSC270
  - Transactions
  - ACID
  - Transaction Management
---

# 29. Database Transactions and ACID Properties

Every lecture so far has treated a single `INSERT`, `UPDATE`, or query in isolation — one
statement, one effect. Real applications rarely work that way. Transferring money between
two bank accounts, booking a property viewing while updating a client's record, or
enrolling a student in a course while decrementing available seats — each of these is
really *several* database operations that only make sense **together**. This lecture opens
Unit 8 by defining exactly what a transaction is, the states it moves through, and the four
properties — **ACID** — that a DBMS guarantees for every transaction it runs, no matter what
goes wrong in the middle of it.

## In This Lecture

- What a database transaction is, formally, and why single statements aren't enough
- Transaction processing: how the DBMS treats a transaction as a single unit
- Transaction states, and the full state-transition diagram
- The four ACID properties: Atomicity, Consistency, Isolation, Durability
- A worked bank-transfer example showing what breaks if atomicity is violated
- Transaction management: the DBMS subsystem responsible for all of this

## What Is a Database Transaction?

A **transaction** is a logical unit of work — a sequence of one or more read and write
operations on a database that must be treated as a single, indivisible action. Either every
operation in the transaction completes and its effects are recorded permanently, or none of
them are: there is no valid outcome where the database ends up "half-updated."

Consider transferring PKR 10,000 from account `A101` to account `A205`. Expressed as SQL,
that's two separate statements:

```text
UPDATE Account SET balance = balance - 10000 WHERE accountNo = 'A101';
UPDATE Account SET balance = balance + 10000 WHERE accountNo = 'A205';
```

To the database *engine*, these are two independent write operations. To the *business*,
they are one event: "a transfer happened." If the first `UPDATE` runs and the second never
does — because the application crashes, the connection drops, or the server loses power
between the two statements — PKR 10,000 has vanished from the bank's books entirely. A
transaction is the mechanism that lets the application tell the DBMS: *treat these
statements as one unit; never let the database rest in a state where only some of them
happened.*

```text
BEGIN TRANSACTION;
    UPDATE Account SET balance = balance - 10000 WHERE accountNo = 'A101';
    UPDATE Account SET balance = balance + 10000 WHERE accountNo = 'A205';
COMMIT;
```

!!! note "A transaction can be a single statement too"
    Most DBMSs treat every standalone SQL statement as an implicit one-statement
    transaction, auto-committed the instant it succeeds. The explicit `BEGIN
    TRANSACTION` / `COMMIT` block above is what lets *multiple* statements share that
    same all-or-nothing guarantee — that's the whole reason transactions exist as a
    concept distinct from "a statement."

## Transaction Processing

**Transaction processing** is the general term for how a DBMS accepts, executes, and
finalizes transactions submitted by one or many concurrent users. A transaction-processing
system must guarantee, for every transaction it runs, that the transaction's effect on the
database is exactly as if it had run alone, start to finish, with nothing else interfering
— even though, in reality, hundreds of other transactions may be executing on the same
tables at the same instant (the subject of [Lecture 30](lecture-30-transaction-management-concurrency-control.md)),
and even though the hardware underneath can fail mid-transaction (the subject of
[Lecture 31](lecture-31-failure-and-recovery-in-transaction-management.md)).

A transaction ends in exactly one of two ways:

- **Commit** — every operation succeeded; the DBMS makes all of the transaction's changes
  permanent.
- **Abort (rollback)** — something prevented successful completion; the DBMS undoes any
  partial changes already made, returning the database to the state it was in before the
  transaction began.

## Transaction States

Every transaction moves through a well-defined sequence of states from the moment it starts
to the moment it finishes, and the DBMS tracks exactly which state a transaction is
currently in.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Transaction states — the successful path</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Active</span>
<span class="db-node-sub">Executing its read/write operations</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Partially Committed</span>
<span class="db-node-sub">Final operation executed; not yet made durable</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Committed</span>
<span class="db-node-sub">Effects permanently recorded — durable, visible to others</span>
</div>
</div>
</div>

- **Active** — the initial state. The transaction is executing; most of its lifetime is
  spent here, issuing reads and writes.
- **Partially Committed** — reached the instant the *final* statement has executed, but
  before the DBMS has finished writing everything to stable storage. This is a brief,
  internal state — the transaction *believes* it has succeeded, but the DBMS hasn't yet
  guaranteed durability.
- **Committed** — the DBMS has confirmed every change is safely and permanently recorded.
  Once committed, a transaction's effects survive any later crash (Durability, below).

Not every transaction reaches Committed. A transaction can fail at any point along the way:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Transaction states — the failure path</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Active</span>
<span class="db-node-sub">Executing its read/write operations</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Failed</span>
<span class="db-node-sub">Normal execution can no longer proceed — a constraint violation, deadlock, or crash</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Aborted (Terminated)</span>
<span class="db-node-sub">DBMS has rolled back every effect; database restored to its pre-transaction state</span>
</div>
</div>
</div>

- **Failed** — reached when the DBMS determines normal execution cannot continue: a
  violated `CHECK` or referential-integrity constraint from
  [Lecture 6](lecture-06-integrity-constraints.md), a deadlock (Lecture 30), or a system
  crash mid-transaction.
- **Aborted** (also called **Terminated**) — the DBMS has finished rolling back every
  change the transaction had already made, restoring the database to exactly the state it
  was in before the transaction started. From here the transaction is over; the
  application may choose to resubmit it as a brand-new transaction, but the failed one
  itself never resumes.

Note that **Partially Committed** can also transition to **Failed** rather than
**Committed** — if the DBMS itself discovers, while finalizing a partially committed
transaction (for instance, while flushing to disk), that it cannot guarantee durability,
it moves to Failed and then Aborted instead, exactly like a failure caught earlier.

!!! tip "Active is the only state a transaction can be forced out of by something else"
    A transaction can move itself from Active to Partially Committed (by finishing its own
    work) or the DBMS can force it from Active to Failed (because of a constraint
    violation, a deadlock victim selection, or a crash) — but Committed and Aborted are
    always final. Once a transaction commits, nothing — not even a later crash — is allowed
    to undo it; that guarantee is Durability, covered next.

## The ACID Properties

**ACID** is the acronym for the four properties every transaction is guaranteed to have in
a correctly implemented DBMS: **Atomicity, Consistency, Isolation,** and **Durability**.
Together they are the precise technical definition of "a transaction behaved correctly,"
and every mechanism in this unit — locking, logging, checkpointing — exists to deliver one
or more of these four guarantees.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The four ACID properties</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Atomicity</span>
<span class="db-node-sub">All of a transaction's operations happen, or none do — no partial effect is ever left behind</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Consistency</span>
<span class="db-node-sub">A transaction takes the database from one valid state to another, never violating an integrity constraint</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Isolation</span>
<span class="db-node-sub">Concurrent transactions don't see each other's incomplete, in-progress effects</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Durability</span>
<span class="db-node-sub">Once committed, a transaction's effects survive any later crash</span>
</div>
</div>
</div>

### Atomicity

**Atomicity** is the "all-or-nothing" property: a transaction's operations are treated as a
single, indivisible unit. Either every operation in the transaction is applied to the
database, or, if any operation cannot complete, the DBMS undoes every operation that *did*
already run, as if the transaction had never started at all.

Atomicity is exactly what the bank-transfer example needs, and exactly what plain SQL
statements running outside a transaction cannot provide on their own — the next section
traces it through in full.

### Consistency

**Consistency** means a transaction, run to completion, takes the database from one valid
state to another valid state — it never leaves the database violating any of the domain,
entity, referential, or general constraints from [Lecture 6](lecture-06-integrity-constraints.md).
If a transaction's final operation would leave a foreign key dangling, a `NOT NULL` column
empty, or a `CHECK` constraint like `rent > 0` broken, the DBMS rejects that operation and
the transaction fails rather than commit an inconsistent state.

!!! note "Consistency is a joint responsibility"
    A DBMS enforces the constraints it *knows about* — the ones declared in the schema. It
    cannot, on its own, know that "a transfer must debit one account by exactly what it
    credits another." That specific business rule is the *application's* responsibility to
    encode correctly inside the transaction; the DBMS's contribution to Consistency is
    guaranteeing that whatever the transaction does, it cannot commit while violating a
    declared constraint. Atomicity and Consistency work together here: atomicity ensures
    the debit and credit either both happen or neither does, and Consistency ensures neither
    half, alone, is allowed to leave a constraint broken.

### Isolation

**Isolation** means that concurrently executing transactions do not interfere with one
another — each transaction should behave as though it were the only one running against the
database, even when many are actually executing at the same time for performance. Without
isolation, one transaction could read another's half-finished work and act on data that
technically never existed as a committed value. Isolation is a large enough topic — with
several distinct *levels* of guarantee, and specific anomalies each level does or doesn't
prevent — that it gets its own full treatment in
[Lecture 30](lecture-30-transaction-management-concurrency-control.md).

### Durability

**Durability** means that once a transaction commits, its effects are permanent — they
survive any subsequent failure, including a total power loss or an operating-system crash
the instant after the commit was acknowledged. A committed transfer must still show up in
both account balances even if the server crashes one millisecond later. Durability is
delivered by writing a **log** of every change to stable storage before (or as part of)
confirming the commit, so that even a total loss of memory can be recovered from — the
mechanics of exactly how are [Lecture 31](lecture-31-failure-and-recovery-in-transaction-management.md)'s
subject in full.

## Why Transactions Matter: The Bank Transfer, Traced

Return to the PKR 10,000 transfer from `A101` to `A205`, and trace it through the state
diagram above under two outcomes.

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Outcome 1 — both statements succeed</div>

| Step | Operation | State |
|---|---|---|
| 1 | `BEGIN TRANSACTION` | Active |
| 2 | Debit `A101` by 10,000 | Active |
| 3 | Credit `A205` by 10,000 | Active |
| 4 | Final operation done | Partially Committed |
| 5 | Log flushed to disk | Committed |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Outcome 2 — crash after the debit, before the credit</div>

| Step | Operation | State |
|---|---|---|
| 1 | `BEGIN TRANSACTION` | Active |
| 2 | Debit `A101` by 10,000 | Active |
| 3 | *(system crash)* | Failed |
| 4 | Recovery manager undoes step 2 | Aborted |
| 5 | `A101` restored to original balance | *(transaction over)* |

</div>
</div>

Without atomicity, Outcome 2 would leave `A101` debited and `A205` never credited — PKR
10,000 simply gone, with no record of where it went. **With** atomicity, the DBMS's recovery
manager (Lecture 31) detects the incomplete transaction on restart, reverses the debit using
the log, and the bank's books are exactly as if the transfer had never been attempted. The
customer can safely retry; nothing was lost, and nothing was double-counted.

!!! warning "Isolation without atomicity would still be broken"
    Even a system with perfect isolation between concurrent transactions would still fail
    the bank-transfer test if it lacked atomicity — isolation only says other transactions
    can't observe the messy middle of *this* transfer; it says nothing about whether *this*
    transfer itself gets fully applied or fully reversed. All four ACID properties are
    independently necessary; none can substitute for another.

## Transaction Management in the DBMS

**Transaction management** is the DBMS subsystem responsible for coordinating everything
this lecture has described: tracking every transaction's state, enforcing atomicity and
consistency on commit or abort, working with the **concurrency control** subsystem to
deliver isolation ([Lecture 30](lecture-30-transaction-management-concurrency-control.md)),
and working with the **recovery manager** to deliver durability
([Lecture 31](lecture-31-failure-and-recovery-in-transaction-management.md)). It sits
beneath every SQL statement an application issues — application developers write `BEGIN`,
`COMMIT`, and `ROLLBACK` and trust the transaction manager to guarantee ACID underneath,
without having to hand-write any of the locking or logging machinery themselves.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Transaction management's two supporting subsystems</p>
<div class="db-flow" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Transaction Manager</span>
<span class="db-node-sub">Tracks transaction state; enforces commit/abort semantics</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Concurrency Control</span>
<span class="db-node-sub">Delivers Isolation — Lecture 30</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Recovery Manager</span>
<span class="db-node-sub">Delivers Durability — Lecture 31</span>
</div>
</div>
</div>

## Key Takeaways

- A **transaction** is a logical unit of work — one or more read/write operations that must
  succeed or fail as a whole.
- A transaction moves through well-defined **states**: Active, Partially Committed, and
  either Committed or (via Failed) Aborted — never resting in an in-between state visible
  to the outside world.
- **ACID** — Atomicity, Consistency, Isolation, Durability — is the precise definition of a
  correctly executed transaction, and every mechanism in this unit exists to deliver one of
  these four guarantees.
- **Atomicity** is "all or nothing"; **Consistency** ties directly back to Lecture 6's
  integrity constraints; **Isolation** and **Durability** are large enough topics to earn
  their own lectures next.
- The bank-transfer trace showed concretely what atomicity prevents: without it, a crash
  between the debit and the credit would silently destroy money; with it, the incomplete
  transfer is fully reversed and nothing is lost.
- **Transaction management** is the DBMS subsystem tying all of this together, coordinating
  with concurrency control and the recovery manager to deliver the full ACID guarantee.

Isolation was mentioned here only by name — [Lecture 30](lecture-30-transaction-management-concurrency-control.md)
opens it up fully: what goes wrong without it, and exactly how a DBMS enforces it.
