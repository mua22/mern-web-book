---
title: "7. Relational Algebra: Unary and Set Operations"
tags:
  - CSC270
  - Relational Algebra
  - SELECT
  - PROJECT
  - Set Operations
---

# 7. Relational Algebra: Unary and Set Operations

You now know what a valid relation looks like ([Lecture 5](lecture-05-the-relational-model.md))
and what keeps it correct ([Lecture 6](lecture-06-integrity-constraints.md)). This lecture
starts *asking it questions*. **Relational algebra** is the formal query language the
relational model comes with — every operator takes one or two relations as input and
produces a brand-new relation as output, which is precisely why these operators can be
chained together into arbitrarily complex queries. SQL, which you'll start writing in a
later unit, is really just relational algebra (plus relational calculus ideas) wearing a
more English-like syntax — understanding the algebra first means SQL will feel like
translation, not memorization.

We continue with the property rental agency's `Branch`, `Staff`, `PrivateOwner`, and
`PropertyForRent` relations from Lectures 5–6, and introduce one new relation, `Client`, to
give the set operations and Cartesian product something realistic to combine.

<div class="db-relation" markdown>
<div class="db-relation-name">Client (<u>clientNo</u>, name, telNo, prefType, maxRent)</div>

| clientNo | name | telNo | prefType | maxRent |
|---|---|---|---|---|
| CR56 | Aline Stewart | 042-121-1121 | Flat | 25000 |
| CR62 | Mike Ritchie | 042-123-4599 | House | 30000 |
| CR76 | John Kay | 021-987-1212 | Flat | 20000 |

</div>

## In This Lecture

- What relational algebra is, and its defining **closure property**
- **SELECT** (σ) — filtering tuples by a predicate
- **PROJECT** (π) — filtering attributes (columns)
- Composing SELECT and PROJECT together
- **Set operations** — UNION (∪), INTERSECTION (∩), SET DIFFERENCE (−) — and the
  union-compatibility rule that governs when they're legal
- **CARTESIAN PRODUCT** (×) — combining every tuple of one relation with every tuple of
  another

## Introduction to Relational Algebra

**Relational algebra** is a **procedural** query language: every query is written as a
sequence of operations applied, step by step, to relations, where you specify *how* to
derive the answer (this relation, filtered this way, then combined with that relation) —
in contrast to a **declarative** language like SQL, where you mostly state *what* you want
and leave the "how" to the DBMS's query optimizer. Studying the algebra first is exactly
what lets you understand *what SQL is doing internally*, and later, why one SQL query can
run dramatically faster than another logically-equivalent one.

Every relational algebra operator obeys the same contract:

```text
operator(relation(s)) -> relation
```

This is the **closure property**: because every operator's *output* is itself a valid
relation (same rules from Lecture 5 — a set of tuples, atomic values, and so on), that
output can immediately be fed as *input* into another operator. Closure is what makes the
algebra genuinely algebraic — like ordinary arithmetic, where `(3 + 4) * 2` nests operations
because `+` produces a number that `*` can consume, relational algebra lets you nest
`π(σ(Staff))` because `σ` produces a relation that `π` can consume. Every example in this
lecture and the next builds on that one fact.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Closure: an operator's output feeds directly into the next operator</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Staff (relation)</span>
<span class="db-node-sub">5 tuples, 5 attributes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">σ salary&gt;20000 (Staff)</span>
<span class="db-node-sub">still a relation — 2 tuples, 5 attributes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">π staffNo, name ( ... )</span>
<span class="db-node-sub">still a relation — 2 tuples, 2 attributes</span>
</div>
</div>
</div>

The operators split into two families, covered across this lecture and the next:

| Family | Operators | Covered in |
|---|---|---|
| **Unary** (one input relation) | SELECT (σ), PROJECT (π) | This lecture |
| **Set** (two union-compatible input relations) | UNION (∪), INTERSECTION (∩), DIFFERENCE (−) | This lecture |
| Cartesian PRODUCT (two input relations, any schema) | × | This lecture |
| **Join / Division** (two input relations, related through a common attribute) | ⋈, θ-join, ÷ | [Lecture 8](lecture-08-join-and-division-operations.md) |

## SELECT (σ) — Filtering Rows

**SELECT**, written σ (sigma), extracts the subset of tuples from a relation that satisfy a
given predicate — it filters *rows*, keeping every attribute (all columns) of the tuples
that pass.

```text
σ <predicate> (RelationName)
```

**Query:** find every staff member earning more than 20,000.

```text
σ salary>20000 (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Input: Staff</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SL21 | John White | Manager | 30000 | B005 |
| SG37 | Ann Beech | Assistant | 12000 | B003 |
| SG14 | David Ford | Supervisor | 18000 | B003 |
| SA9 | Mary Howe | Assistant | 9000 | B007 |
| SL41 | Julie Lee | Manager | 22000 | B005 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Output: σ salary&gt;20000 (Staff)</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SL21 | John White | Manager | 30000 | B005 |
| SL41 | Julie Lee | Manager | 22000 | B005 |

</div>

Tracing it by hand: 30000 > 20000 ✓, 12000 > 20000 ✗, 18000 > 20000 ✗, 9000 > 20000 ✗,
22000 > 20000 ✓ — exactly the two rows kept above. SELECT never adds, drops, or changes an
attribute; the output relation has the *same degree* (5) as the input, only fewer (or
equal) tuples.

Predicates combine comparison operators (`=`, `≠`, `<`, `>`, `≤`, `≥`) with the logical
connectives **∧** (AND), **∨** (OR), and **¬** (NOT), exactly like a Boolean expression in
any programming language.

**Query:** find every staff member at branch `B003` earning more than 15,000.

```text
σ branchNo='B003' ∧ salary>15000 (Staff)
```

Tracing it: `SL21` → branch B005, fails the first condition. `SG37` → branch B003 ✓, salary
12000, fails the second. `SG14` → branch B003 ✓, salary 18000 > 15000 ✓ — **kept**. `SA9` →
branch B007, fails. `SL41` → branch B005, fails. Result: `{SG14}` only.

<div class="db-relation" markdown>
<div class="db-relation-name">Output: σ branchNo='B003' ∧ salary&gt;15000 (Staff)</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SG14 | David Ford | Supervisor | 18000 | B003 |

</div>

!!! tip "SELECT here is not the SQL SELECT"
    This is the single most common point of confusion for students moving between algebra
    and SQL: relational-algebra **SELECT (σ)** corresponds to SQL's `WHERE` clause (row
    filtering). SQL's own `SELECT` keyword actually corresponds to relational algebra's
    **PROJECT (π)** — choosing *columns*. `SELECT staffNo, name FROM Staff WHERE
    salary > 20000` is really `π staffNo, name (σ salary>20000 (Staff))` underneath, in
    exactly that order of operations.

## PROJECT (π) — Filtering Columns

**PROJECT**, written π (pi), extracts a subset of *attributes* (columns) from a relation,
discarding the rest — keeping every tuple that passes (all rows), narrowed to fewer columns.

```text
π <attribute list> (RelationName)
```

**Query:** list just the name and salary of every staff member.

```text
π name, salary (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Output: π name, salary (Staff)</div>

| name | salary |
|---|---|
| John White | 30000 |
| Ann Beech | 12000 |
| David Ford | 18000 |
| Mary Howe | 9000 |
| Julie Lee | 22000 |

</div>

Because a relation can never contain duplicate tuples (Lecture 5's second property),
PROJECT **automatically removes any duplicate rows** that result from dropping columns.

**Query:** which distinct property types does the agency rent?

```text
π type (PropertyForRent)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Input: PropertyForRent (relevant columns only, for reference)</div>

| propertyNo | type |
|---|---|
| PA14 | House |
| PL94 | Flat |
| PG4 | House |
| PG36 | Flat |
| PG16 | House |
| PG21 | Flat |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Output: π type (PropertyForRent)</div>

| type |
|---|
| House |
| Flat |

</div>

Six input tuples collapse to **two** output tuples — `House` appears three times and `Flat`
appears three times in the source data, but the projected relation, being a true set, keeps
each distinct value exactly once. This duplicate-elimination step is exactly why, in SQL,
you sometimes need `SELECT DISTINCT` to get algebra-faithful behavior: plain SQL `SELECT`
does *not* remove duplicates by default, one of the few places SQL deliberately diverges
from the pure algebra.

## Composing SELECT and PROJECT

Closure means you can nest these two freely, and most real queries need both.

**Query:** list just the staff number and name of every staff member earning more than
20,000.

```text
π staffNo, name (σ salary>20000 (Staff))
```

Read inside-out: first σ filters `Staff` down to the two high earners found earlier
(`SL21`, `SL41`), *then* π narrows those two rows down to just `staffNo` and `name`.

<div class="db-relation" markdown>
<div class="db-relation-name">Output: π staffNo, name (σ salary&gt;20000 (Staff))</div>

| staffNo | name |
|---|---|
| SL21 | John White |
| SL41 | Julie Lee |

</div>

!!! warning "Order matters for what's still available — not for what the query can express"
    `π staffNo, name (σ salary>20000 (Staff))` works because σ runs first, while `salary`
    is still present to filter on. Flip the order to `σ salary>20000 (π staffNo, name
    (Staff))` and it **fails outright** — by the time σ runs, `salary` has already been
    projected away, so the predicate has nothing to compare against. This is exactly why
    the inside-out reading habit matters: always identify what each nested operator needs
    available *at the moment it runs*.

## Set Operations

Relational algebra borrows three operators directly from set theory — **UNION** (∪),
**INTERSECTION** (∩), and **SET DIFFERENCE** (−) — because a relation *is* a set of tuples.
All three take exactly two relations and require them to be **union-compatible** first.

### Union-Compatibility

Two relations $R$ and $S$ are **union-compatible** (also called *type-compatible*) when:

1. They have the **same degree** — the same number of attributes.
2. Each corresponding pair of attributes is drawn from the **same domain** (the $i$-th
   attribute of $R$ and the $i$-th attribute of $S$ must hold comparable kinds of values —
   attribute *names* don't have to match, but their domains do).

`π staffNo (Staff)` and `π clientNo (Client)` are union-compatible: both are degree-1
relations, both drawn from a domain of short alphanumeric identifier codes — even though one
column is literally named `staffNo` and the other `clientNo`. By contrast, `Staff` (degree
5: staffNo, name, position, salary, branchNo) and `Branch` (degree 4: branchNo, street,
city, postcode) are **not** union-compatible — different degree, and even attribute-by
attribute the domains don't line up (`salary`, a number, against `postcode`, a string).
Attempting `Staff ∪ Branch` is simply not a legal expression.

### UNION (∪)

$R \cup S$ returns every tuple that appears in $R$, in $S$, or in both — duplicates
collapsed to one, as always.

**Query:** find the staff number of every staff member who works at branch `B003`, *or*
earns more than 20,000 (or both).

```text
π staffNo (σ branchNo='B003' (Staff)) ∪ π staffNo (σ salary>20000 (Staff))
```

<div class="db-relation" markdown>
<div class="db-relation-name">π staffNo (σ branchNo='B003' (Staff))</div>

| staffNo |
|---|
| SG37 |
| SG14 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">π staffNo (σ salary&gt;20000 (Staff))</div>

| staffNo |
|---|
| SL21 |
| SL41 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Output: UNION of the two relations above</div>

| staffNo |
|---|
| SG37 |
| SG14 |
| SL21 |
| SL41 |

</div>

No overlap between the two input sets here, so the union is simply all four rows combined —
`{SG37, SG14} ∪ {SL21, SL41} = {SG37, SG14, SL21, SL41}`.

### INTERSECTION (∩)

$R \cap S$ returns only the tuples that appear in **both** $R$ and $S$.

**Query:** find the staff number of every staff member who works at branch `B003` **and**
earns more than 15,000.

```text
π staffNo (σ branchNo='B003' (Staff)) ∩ π staffNo (σ salary>15000 (Staff))
```

`π staffNo (σ branchNo='B003' (Staff))` = `{SG37, SG14}` (unchanged from above).
`π staffNo (σ salary>15000 (Staff))`: 30000>15000 ✓ (SL21), 12000>15000 ✗ (SG37),
18000>15000 ✓ (SG14), 9000>15000 ✗ (SA9), 22000>15000 ✓ (SL41) → `{SL21, SG14, SL41}`.

<div class="db-relation" markdown>
<div class="db-relation-name">Output: {SG37, SG14} ∩ {SL21, SG14, SL41}</div>

| staffNo |
|---|
| SG14 |

</div>

Only `SG14` appears in *both* input sets — `SG37` is a B003 employee but doesn't clear the
15,000 salary bar, and `SL21`/`SL41` clear the salary bar but don't work at B003.

### SET DIFFERENCE (−)

$R - S$ returns every tuple that is in $R$ **but not** in $S$ — order matters here, unlike
UNION and INTERSECTION, since $R - S$ and $S - R$ generally give different answers.

**Query:** find the staff number of every staff member who works at branch `B003` but does
**not** earn more than 15,000.

```text
π staffNo (σ branchNo='B003' (Staff)) − π staffNo (σ salary>15000 (Staff))
```

`{SG37, SG14} − {SL21, SG14, SL41}`: keep every element of the left set that does **not**
appear in the right set. `SG37` is not in `{SL21, SG14, SL41}` → keep. `SG14` **is** in that
set → remove.

<div class="db-relation" markdown>
<div class="db-relation-name">Output: {SG37, SG14} − {SL21, SG14, SL41}</div>

| staffNo |
|---|
| SG37 |

</div>

Only `SG37` remains — the B003 employee whose salary (12,000) does *not* exceed 15,000.

!!! note "Sanity-check identity"
    For any two sets, $(R \cap S)$ and $(R - S)$ together always reconstruct $R$ exactly,
    with no overlap: here `{SG14}` (the intersection) plus `{SG37}` (the difference) gives
    back `{SG37, SG14}` — the original B003 staff set. This identity is a useful way to
    double-check your own by-hand tracing of INTERSECTION and DIFFERENCE queries built from
    the same two inputs.

## CARTESIAN PRODUCT (×)

$R \times S$ combines **every** tuple of $R$ with **every** tuple of $S$, producing a
relation whose degree is the sum of the two input degrees, and whose cardinality is the
*product* of the two input cardinalities. Unlike the set operators, the two input relations
do **not** need to be union-compatible — they can have completely unrelated schemas.

**Query:** list every possible (client, Lahore property) pairing, as a starting point for
"which properties should we suggest to which clients?"

```text
π clientNo (Client) × π propertyNo (σ city='Lahore' (PropertyForRent))
```

`π clientNo (Client)` = `{CR56, CR62, CR76}` (3 tuples). `σ city='Lahore'
(PropertyForRent)` keeps `PA14`, `PG4`, `PG36` (checking each: PA14 Lahore ✓, PL94
Islamabad ✗, PG4 Lahore ✓, PG36 Lahore ✓, PG16 Islamabad ✗, PG21 Karachi ✗), so
`π propertyNo (...)` = `{PA14, PG4, PG36}` (3 tuples).

<div class="db-relation" markdown>
<div class="db-relation-name">Output: 3 clients × 3 Lahore properties = 9 tuples</div>

| clientNo | propertyNo |
|---|---|
| CR56 | PA14 |
| CR56 | PG4 |
| CR56 | PG36 |
| CR62 | PA14 |
| CR62 | PG4 |
| CR62 | PG36 |
| CR76 | PA14 |
| CR76 | PG4 |
| CR76 | PG36 |

</div>

Every one of the $3 \times 3 = 9$ possible pairings is present, with no filtering applied
at all — including plainly unhelpful pairs, like pairing `CR76` (whose `maxRent` is 20,000)
with `PG4` (rent 35,000), which nothing here rules out. This is exactly the limitation that
motivates Lecture 8: a raw Cartesian product is rarely the answer you actually want — you
almost always want it *combined with a SELECT* that keeps only the pairs satisfying some
condition across both relations (e.g., "the property's branch matches the client's preferred
branch"). That combination — Cartesian product followed by a selection on a matching
condition — is precisely what the **join** operators formalize, next.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Where Lecture 8 picks up</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">R × S</span>
<span class="db-node-sub">every possible pairing — usually far too many rows to be useful on its own</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">σ &lt;matching predicate&gt; (R × S)</span>
<span class="db-node-sub">keep only pairs that satisfy a condition across both relations</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">= a JOIN</span>
<span class="db-node-sub">exactly what Lecture 8 formalizes as its own named operator</span>
</div>
</div>
</div>

## Key Takeaways

- Relational algebra is a **procedural** query language: every operator takes relation(s)
  and produces a relation, which is the **closure property** that lets operators nest
  arbitrarily deeply.
- **SELECT (σ)** filters rows by a predicate; **PROJECT (π)** filters columns and
  automatically removes any resulting duplicate tuples.
- SQL's `SELECT`/`WHERE` split maps onto algebra's π/σ almost exactly backwards from the
  naming — don't let the shared word "SELECT" mislead you.
- **UNION (∪)**, **INTERSECTION (∩)**, and **SET DIFFERENCE (−)** require the two input
  relations to be **union-compatible**: same degree, corresponding attributes from the same
  domain.
- **CARTESIAN PRODUCT (×)** needs no compatibility at all — it pairs every tuple of one
  relation with every tuple of the other, producing (rows₁ × rows₂) tuples of combined
  degree — and is almost always followed by a SELECT to keep only the meaningful pairings,
  which is exactly the idea Lecture 8's join operators formalize.

Continue to [Lecture 8 — Join and Division Operations](lecture-08-join-and-division-operations.md),
where Cartesian product plus a matching condition becomes a first-class operator in its own
right.
