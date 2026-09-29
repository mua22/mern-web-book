---
title: "18. Normalization: Purpose and Concepts"
tags:
  - CSC270
  - Normalization
  - Functional Dependencies
  - Database Design
---

# 18. Normalization: Purpose and Concepts

The midterm marked a turning point: Units 1–4 gave you the vocabulary and the design
*process* for building a database — Entity-Relationship modeling ([Lecture 11](lecture-11-data-modeling-and-database-design.md)
onward), producing a set of relations mapped out of an EER model
([Lecture 16](lecture-16-mapping-eer-models-to-relational-schemas.md)). This unit asks the
question a good designer always asks next: **how do you know those relations are actually
good?** Two designers can look at the same requirements, draw defensible ER diagrams, and
still end up with relations that behave completely differently under real use — one
redundancy-free, the other quietly corrupting itself on ordinary inserts and deletes.
**Normalization** is the formal, mechanical procedure that tells you which one you built,
and — critically — how to fix the bad one without guesswork.

## In This Lecture

- What normalization is *for*, precisely — not "make it neat," but eliminate specific,
  provable problems
- Why normalization happens **after** ER modeling, as validation and refinement, not as a
  replacement for it
- **Data redundancy** — a concrete, worked example of a poorly designed relation
- The three **update anomalies** — insertion, deletion, modification — each with its own
  failure mode
- **Functional dependencies**: the formal notation (`X → Y`) that makes "good design"
  checkable instead of a matter of taste
- **Decomposition**, and the two properties any decomposition must satisfy: **lossless-join**
  and **dependency-preservation**
- The overall shape of the normalization process — 1NF through BCNF/4NF — that the next
  three lectures work through in full

## Purpose of Normalization

**Normalization** is a formal technique for analyzing a relation based on its **functional
dependencies** — the constraints that already exist among its attributes — and
systematically decomposing it into smaller relations that are provably free of certain
kinds of redundancy and the anomalies that redundancy causes. It is not a stylistic
preference for "smaller tables"; it is a mechanical test with a precise pass/fail answer at
each stage (1NF, 2NF, 3NF, BCNF, ...), and a well-defined procedure for fixing a relation
that fails.

!!! note "Normalization is validation, not the design itself"
    Normalization does not tell you *what* entities or relationships your database needs —
    that is exactly what ER/EER modeling (Unit 4) is for. What it tells you is whether the
    relations you already derived are well-structured, and gives you a mechanical way to
    repair them if they aren't.

## Normalization in Database Design

Normalization sits **after** conceptual and logical design in the overall process, as a
refinement step — not because it's less important, but because it needs relations to
already exist before it can check them:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Where normalization fits in the design process</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">ER / EER modeling</span>
<span class="db-node-sub">Lectures 11–16 — entities, relationships, constraints</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Mapping to draft relations</span>
<span class="db-node-sub">Lecture 16 — mechanical translation to Relation(attr1, attr2, ...)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Normalization</span>
<span class="db-node-sub">This unit — validate against functional dependencies, decompose if needed</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Physical design</span>
<span class="db-node-sub">Unit 6 — indexes, storage, views</span>
</div>
</div>
</div>

Two designers building the same system from the same requirements can produce different
draft relations — one might merge everything a report needs into one wide table; another
might already split things sensibly. Normalization gives both designers the same mechanical
test, so "which design is better" stops being a matter of taste and becomes a checkable
fact about functional dependencies.

!!! tip "Bottom-up vs. top-down, and why this course does both"
    Some textbooks present normalization as a *bottom-up* design method in its own right:
    start from a single "universal relation" containing every attribute in the system, and
    normalize your way down to a good schema, without ever drawing an ER diagram. This
    course uses the more common practice instead — ER/EER modeling *top-down* first
    (Unit 4), then normalization as a *validation and refinement* pass on the result. Both
    routes use exactly the same normal-form rules; they differ only in where you start.

## Data Redundancy

To make "redundancy" concrete instead of abstract, consider a single relation a rushed
designer might propose to record customer orders and the products on them — every order
detail line, flattened into one wide table:

<div class="db-relation" markdown>
<div class="db-relation-name">Order (orderNo, orderDate, custNo, custName, custAddress, productNo, productName, unitPrice, qty) — a single, unnormalized relation</div>

| orderNo | orderDate | custNo | custName | custAddress | productNo | productName | unitPrice | qty |
|---|---|---|---|---|---|---|---|---|
| O100 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore | P01 | Widget | 9.99 | 3 |
| O100 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore | P02 | Gadget | 24.99 | 1 |
| O101 | 2026-08-02 | C002 | Tom Kelly | 5 Oak Ave, Karachi | P01 | Widget | 9.99 | 2 |
| O102 | 2026-08-03 | C001 | Ann Beech | 12 Elm St, Lahore | P03 | Sprocket | 4.50 | 10 |

</div>

Nothing here is *wrong* in the sense of violating a domain or referential-integrity rule —
every value is legal, every row is a real order line. But look at what's repeated: `Ann
Beech`'s name and address appear in **three separate rows** (once per order she's placed),
and `Widget`'s name and price appear in **two separate rows** (once per order that includes
it). None of that repetition adds information — it's the *same fact* about the same
customer or the same product, stored redundantly because this one relation is trying to
describe three different kinds of things (orders, customers, and products) at once.

!!! warning "Redundancy is a symptom, not the disease"
    The real problem isn't wasted disk space — modern storage is cheap. The real problem is
    that redundant copies of the *same fact* can drift out of sync with each other, and
    nothing in this relation's structure stops that from happening. That drift is exactly
    what the three update anomalies below describe.

## Update Anomalies

A relation with this kind of redundancy is vulnerable to three distinct failure modes, each
tied to a different SQL operation.

### Insertion Anomaly

Suppose the agency signs up a new product, `P04` ("Cog"), that hasn't been ordered by
anyone yet. There is **no way to insert this fact** into the `Order` relation above,
because every row requires an `orderNo` — and there is no order to attach it to. The
product's existence cannot be recorded until *someone places an order for it*, which is
backwards: a product should be able to exist in the catalog before its first sale.

Symmetrically, a brand-new customer who hasn't placed an order yet cannot be recorded
either — `custName` and `custAddress` only exist attached to an `orderNo`.

### Deletion Anomaly

Suppose order `O101` — Tom Kelly's only order — is cancelled and its row deleted. Deleting
that single row doesn't just remove the fact "an order was placed"; it silently erases the
**only record this database had of Tom Kelly's existence at all** — his name and address
vanish along with the order, because they were never stored anywhere else.

<div class="db-relation" markdown>
<div class="db-relation-name">Deleting O101 destroys Tom Kelly's customer record as an unintended side effect</div>

| orderNo | orderDate | custNo | custName | custAddress | productNo | productName | unitPrice | qty |
|---|---|---|---|---|---|---|---|---|
| ~~O101~~ | ~~2026-08-02~~ | ~~C002~~ | ~~Tom Kelly~~ | ~~5 Oak Ave, Karachi~~ | ~~P01~~ | ~~Widget~~ | ~~9.99~~ | ~~2~~ |

</div>

### Modification (Update) Anomaly

Suppose `Widget` (`P01`)'s price changes from `9.99` to `11.49`. That single fact is
currently stored in **two** rows (`O100`'s and `O101`'s line for `P01`). Updating only one
of them — easy to do by accident, especially through application code that updates "the
row the user is looking at" — leaves the relation **internally inconsistent**: the same
product now has two different prices depending on which row you query.

<div class="db-relation" markdown>
<div class="db-relation-name">Modification anomaly — Widget's price updated in one row only</div>

| orderNo | productNo | productName | unitPrice |
|---|---|---|---|
| O100 | P01 | Widget | **11.49** |
| O101 | P01 | Widget | **9.99** *(stale — should also be 11.49)* |

</div>

All three anomalies trace back to the same root cause: **this one relation is forcing facts
about three different kinds of things — orders, customers, and products — to live and die
together**, when in reality they don't.

## Functional Dependencies

Everything above was described informally ("a product's name depends on which product it
is"). **Functional dependencies (FDs)** give that informal idea a precise, checkable
notation.

!!! note "Definition"
    Given a relation $R$ and two attribute sets $X, Y \subseteq R$, $Y$ is **functionally
    dependent** on $X$ — written $X \rightarrow Y$, read "$X$ functionally determines $Y$"
    — if, for every legal value the relation can ever take, each value of $X$ is associated
    with **exactly one** value of $Y$. Equivalently: if two tuples agree on $X$, they must
    agree on $Y$ too. $X$ is called the **determinant**.

Reading the FDs actually present in the `Order` relation above:

- `orderNo → orderDate` — each order has exactly one date.
- `orderNo → custNo` — each order was placed by exactly one customer.
- `custNo → custName` and `custNo → custAddress` — each customer has one name, one address.
- `productNo → productName` and `productNo → unitPrice` — each product has one name and
  one price (an assumption this course keeps for simplicity: unitPrice is a fixed catalog
  price, not negotiated per order).
- `{orderNo, productNo} → qty` — the quantity ordered depends on **both** which order and
  which product — knowing only one of the two doesn't determine a quantity.

!!! tip "An FD is a statement about the schema, not about today's data"
    `custNo → custName` says "no customer number is ever associated with two different
    names," a rule the *business* guarantees (each customer is exactly one person or
    organization). It is not merely "true by coincidence in the four rows shown above" —
    a functional dependency must hold for every possible legal instance of the relation, not
    just the sample data. This is exactly why FDs come from understanding the real-world
    rules the data must obey, not from staring at a handful of example rows.

## Functional Dependency and Normalization

Functional dependencies are the **theoretical foundation the entire normalization process
rests on**. Every normal form from this point forward — 1NF through BCNF and 4NF — is
defined purely in terms of which FDs hold in a relation and how they relate to that
relation's keys:

- **1NF** is about atomicity (Lecture 5's rule), independent of FDs.
- **2NF** asks: does every non-key attribute depend on the **whole** key, or only part of
  it (a *partial* dependency)?
- **3NF** asks: does every non-key attribute depend **directly** on the key, or only
  through another non-key attribute (a *transitive* dependency)?
- **BCNF** asks the sharpest version of the same question: is **every** determinant in the
  relation a superkey, with no exceptions?

Without functional dependencies, "well-designed" would stay a matter of taste. With them,
it becomes something you can *prove*.

## Decomposition of Relations

**Decomposition** is the act of replacing one relation with two or more relations whose
attributes, together, cover the same information — done specifically to remove the
partial or transitive dependencies that cause anomalies. A preview of where the `Order`
example above is headed (worked in full, step by step, in [Lecture 19](lecture-19-the-normalization-process-1nf-2nf-3nf.md)):

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Customer (<u>custNo</u>, custName, custAddress)</div>

| custNo | custName | custAddress |
|---|---|---|
| C001 | Ann Beech | 12 Elm St, Lahore |
| C002 | Tom Kelly | 5 Oak Ave, Karachi |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Product (<u>productNo</u>, productName, unitPrice)</div>

| productNo | productName | unitPrice |
|---|---|---|
| P01 | Widget | 9.99 |
| P02 | Gadget | 24.99 |
| P03 | Sprocket | 4.50 |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Order (<u>orderNo</u>, orderDate, custNo)</div>

| orderNo | orderDate | custNo |
|---|---|---|
| O100 | 2026-08-01 | C001 |
| O101 | 2026-08-02 | C002 |
| O102 | 2026-08-03 | C001 |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">OrderLine (<u>orderNo, productNo</u>, qty)</div>

| orderNo | productNo | qty |
|---|---|---|
| O100 | P01 | 3 |
| O100 | P02 | 1 |
| O101 | P01 | 2 |
| O102 | P03 | 10 |

</div>
</div>

Every one of the three anomalies above disappears: `P04` can be inserted into `Product`
with no order at all; deleting `O101` removes only that order, leaving `Customer` row `C002`
intact; and `Widget`'s price lives in exactly **one** row of `Product`, so there is nowhere
for it to go out of sync.

## Lossless-Join Property

Splitting one relation into several is only safe if you can always get the original
information back. A decomposition of $R$ into $R_1, R_2, \ldots, R_n$ has the
**lossless-join property** if the **natural join** of $R_1 \bowtie R_2 \bowtie \cdots \bowtie
R_n$ reconstructs **exactly** $R$ — no rows lost, and, just as important, no *extra*,
spurious rows gained that were never in the original data.

Joining `Customer ⋈ Order ⋈ OrderLine ⋈ Product` (matching on `custNo`, `orderNo`, and
`productNo` respectively) reproduces the original flattened `Order` relation shown at the
start of this lecture, row for row. A decomposition that *failed* this property would be
far more dangerous than the anomalies it was meant to fix — it would silently invent
combinations of data that never actually occurred.

!!! danger "The classic way to lose losslessness: split on the wrong attribute"
    If `Order` had instead been split into `(orderNo, custNo, productNo)` and
    `(productNo, productName, unitPrice, qty)` — dividing the attributes without regard to
    which FDs justify the split — rejoining them on `productNo` alone would produce every
    combination of order and quantity for a given product, most of which never actually
    happened. A correct decomposition is always guided by functional dependencies, never by
    an arbitrary attribute split.

## Dependency-Preservation Property

A decomposition has the **dependency-preservation property** if every functional
dependency from the original relation's FD set can still be **checked directly** on the
decomposed relations, without needing to join them back together first. This matters
practically: a dependency that can only be verified after a join is a dependency the DBMS
cannot enforce cheaply with a simple key constraint on one table.

In the `Order` decomposition above, `custNo → custName` is checkable directly on `Customer`
alone (declare `custNo` its primary key, and the DBMS enforces it automatically), and
`{orderNo, productNo} → qty` is checkable directly on `OrderLine`. Every original FD
survives onto exactly one of the decomposed relations — this decomposition is both lossless
and dependency-preserving. (Lecture 20 shows that this second property is not always
achievable simultaneously with the strictest normal form, BCNF — a genuine trade-off, not
just a matter of trying harder.)

## Normalization Process

Putting the pieces together, normalization proceeds through a fixed sequence of
increasingly strict normal forms, each one removing a specific category of dependency
problem that the previous form still permitted:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The normalization process, staged — detailed across Lectures 19–21</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Unnormalized (UNF)</span>
<span class="db-node-sub">May contain repeating groups / non-atomic values</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">1NF</span>
<span class="db-node-sub">Atomic values, no repeating groups (Lecture 19)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">2NF</span>
<span class="db-node-sub">No partial dependency on a composite key (Lecture 19)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">3NF</span>
<span class="db-node-sub">No transitive dependency (Lecture 19)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">BCNF</span>
<span class="db-node-sub">Every determinant is a superkey (Lecture 20–21)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">4NF</span>
<span class="db-node-sub">No non-trivial multi-valued dependency (Lecture 22)</span>
</div>
</div>
</div>

Each stage is strictly stronger than the one before it — every relation in 3NF is
automatically in 2NF and 1NF, but not every relation in 3NF is in BCNF. In practice, almost
every real-world relational schema targets **3NF** (a good balance of redundancy-freedom
and practical performance) or, where the extra guarantee is worth it, **BCNF**; 4NF is
reserved for the specific, less common case of multi-valued dependencies (Lecture 22).

!!! tip "You will normalize on paper before you ever type CREATE TABLE"
    Every relation in the diagram above is checked the same way: identify its functional
    dependencies from the business rules (not from sample data), identify its candidate
    key(s), and ask whether every non-key attribute depends on the *whole* key, *only* the
    key, and *nothing else*. Lecture 19 turns that question into a step-by-step procedure,
    worked through one running example from start to finish.

## Key Takeaways

- **Normalization** is a formal, FD-driven technique for validating and refining relations
  produced during ER/EER design — it happens *after* conceptual design, as a check, not a
  replacement for it.
- **Redundancy** — the same fact stored in more than one place — is the root cause behind
  all three **update anomalies**: **insertion** (can't record a fact without an unrelated
  fact existing first), **deletion** (removing one fact accidentally destroys another), and
  **modification** (the same fact updated in one copy but not another, going out of sync).
- A **functional dependency** $X \rightarrow Y$ formalizes "$X$ determines $Y$" precisely
  enough to check mechanically — every subsequent normal form is defined in terms of FDs
  and keys.
- **Decomposition** splits a relation to remove anomalies, but must satisfy the
  **lossless-join property** (the natural join reconstructs the original exactly) and,
  ideally, **dependency-preservation** (every original FD is still checkable without a join).
- The normalization process is a fixed, increasingly strict sequence: **UNF → 1NF → 2NF →
  3NF → BCNF → 4NF**, each stage removing one specific category of dependency problem.

Continue to [Lecture 19 — The Normalization Process: 1NF, 2NF, 3NF](lecture-19-the-normalization-process-1nf-2nf-3nf.md),
which takes the `Order` relation from this lecture back to its rawest, unnormalized form
and walks it through every stage above, one anomaly-removing decomposition at a time.
