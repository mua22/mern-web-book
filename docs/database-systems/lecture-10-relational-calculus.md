---
title: "10. Relational Calculus"
tags:
  - CSC270
  - Relational Calculus
  - Tuple Relational Calculus
  - Domain Relational Calculus
---

# 10. Relational Calculus

Every relational-algebra expression you've written since Lecture 7 is a **recipe**: select
these rows, then project these columns, then join with that relation, then aggregate. You
specify *how* to compute the answer, one operator at a time, in a particular order.
**Relational calculus** answers the exact same questions in a completely different style: you
describe *what* the answer must look like — its defining properties — and leave *how* to
compute it entirely unspecified. This lecture introduces both flavors of relational calculus,
shows that they say the same things TRC/DRC can express and the algebra can express (Codd's
theorem), and — for every example — walks the identical query through calculus and algebra
side by side, so you can see the same answer arrived at two ways.

We continue the property rental agency database, now including `Client` and `Viewing`, first
flagged back in Lecture 5.

## In This Lecture

- Relational calculus as a **declarative** query language, contrasted with algebra's
  **procedural** style
- Codd's theorem: algebra, tuple calculus, and domain calculus all have equivalent
  expressive power
- Tuple Relational Calculus (TRC): tuple variables, and writing queries as `{T | F(T)}`
- Domain Relational Calculus (DRC): domain variables, one per attribute
- Quantifiers: existential (∃) and universal (∀), and how ∀ is written using ¬∃¬
- Comparing the identical query written in TRC, in DRC, and in the relational algebra you
  already know from Lectures 7–9
- Safety of expressions: why some syntactically valid calculus formulas are meaningless

## Introduction to Relational Calculus

Relational algebra (Lectures 7–9) is **procedural**: an expression like
`π name (σ salary > 20000 (Staff))` names an explicit sequence of steps — filter first, then
project — and a different ordering of the same operators can even change what's convenient
to compute, even though it can't change the final answer. **Relational calculus** is
**declarative**: instead of steps, you write down a *description* of what a qualifying tuple
looks like, and leave every "how" decision (which order to check things, which index to use)
to the DBMS's query optimizer.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two languages, one expressive power — Codd's theorem</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Relational Algebra</span>
<span class="db-node-sub">Procedural — an explicit sequence of operators</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Tuple Relational Calculus</span>
<span class="db-node-sub">Declarative — describes a qualifying tuple</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Domain Relational Calculus</span>
<span class="db-node-sub">Declarative — describes qualifying attribute values</span>
</div>
</div>
</div>

!!! note "Codd's theorem"
    E. F. Codd proved that relational algebra and relational calculus (restricted to *safe*
    expressions — see the end of this lecture) have **exactly the same expressive power**:
    any query expressible in one is expressible in the other, and vice versa. This equal
    footing is why textbooks and exams treat "write this query in algebra" and "write this
    query in calculus" as two views of the same underlying question — never as two different
    problems. SQL, which you meet properly in Unit 6, is itself calculus-flavored: you write
    `WHERE salary > 20000`, a *description*, not a step-by-step procedure.

Both calculus dialects come from **predicate calculus** (first-order logic): a query is a
formula that is either true or false for a given tuple (or set of values), and the query's
result is the set of everything for which the formula evaluates true.

## Tuple Relational Calculus (TRC) and Tuple Variables

**Tuple Relational Calculus** queries have the general form:

```text
{ T | F(T) }
```

read as *"the set of all tuples T such that formula F(T) is true."* `T` is a **tuple
variable** — it ranges over an entire relation, one whole row at a time, and its individual
attribute values are accessed with dot notation, `T.salary`, `T.name`, exactly like a `struct`
field in a program.

For reference, here is the running `Staff` relation once again:

<div class="db-relation" markdown>
<div class="db-relation-name">Staff (<u>staffNo</u>, name, position, salary, branchNo)</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SL21 | John White | Manager | 30000 | B005 |
| SG37 | Ann Beech | Assistant | 12000 | B003 |
| SG14 | David Ford | Supervisor | 18000 | B003 |
| SA9 | Mary Howe | Assistant | 9000 | B007 |
| SL41 | Julie Lee | Manager | 22000 | B005 |

</div>

### Example A — Selection and Projection

"Find the names and salaries of staff earning more than 20000":

```text
TRC:     { S.name, S.salary | Staff(S) ∧ S.salary > 20000 }
Algebra: π name, salary (σ salary > 20000 (Staff))
```

`Staff(S)` restricts `S` to range only over tuples of the `Staff` relation — every valid TRC
formula that mentions a tuple variable must include exactly this kind of "range" condition,
or the query is meaningless (more on this under Safety, below). Trace both by hand: only
John White (30000) and Julie Lee (22000) satisfy `salary > 20000`.

<div class="db-relation" markdown>
<div class="db-relation-name">Result — both expressions above</div>

| name | salary |
|---|---|
| John White | 30000 |
| Julie Lee | 22000 |

</div>

### Example B — Selecting Whole Tuples

When you want entire rows back rather than a subset of columns, the tuple variable itself is
the target of the set-builder, not its attributes. "Find all staff who work at branch B003":

```text
TRC:     { S | Staff(S) ∧ S.branchNo = 'B003' }
Algebra: σ branchNo = 'B003' (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result — both expressions above</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SG37 | Ann Beech | Assistant | 12000 | B003 |
| SG14 | David Ford | Supervisor | 18000 | B003 |

</div>

## Domain Relational Calculus (DRC) and Domain Variables

**Domain Relational Calculus** takes the same idea one level more granular: instead of one
variable per *tuple*, DRC uses one variable per **attribute value** — a **domain variable**.
A DRC query has the form:

```text
{ x1, x2, ..., xn | F(x1, x2, ..., xn) }
```

where each `xi` ranges over the domain of one attribute. Any domain variable that appears in
the result must be free; every other domain variable needed to state a relation membership
must be **existentially quantified** with ∃.

Rewriting Example A in DRC — only `name` and `salary` appear in the result, so the other
three attributes (`staffNo`, `position`, `branchNo`) need existentially quantified variables
just to state "this combination of five values is a row of `Staff`":

```text
DRC:     { name, salary | ∃sNo, pos, bNo (Staff(sNo, name, pos, salary, bNo) ∧ salary > 20000) }
Algebra: π name, salary (σ salary > 20000 (Staff))
```

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">TRC — one variable, dot notation</div>

```text
{ S.name, S.salary |
  Staff(S) ∧ S.salary > 20000 }
```

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">DRC — one variable per attribute</div>

```text
{ name, salary |
  ∃sNo, pos, bNo
  (Staff(sNo, name, pos, salary, bNo)
   ∧ salary > 20000) }
```

</div>
</div>

Both formulas describe the identical set of (name, salary) pairs, and both are equivalent to
the same algebra expression above — this is Codd's theorem made concrete: three notations,
one answer.

!!! tip "Why TRC usually reads more naturally"
    Notice how much shorter the TRC version is: one tuple variable `S` and dot notation
    (`S.salary`) versus five separate domain variables, three of which exist purely to
    "pad out" the relation membership test. TRC scales better as relations grow wider; DRC's
    appeal is that it maps almost directly onto Query-by-Example (QBE) style visual query
    tools, where you fill in a grid one column at a time.

## Existential Quantification Across Relations

Calculus becomes genuinely more expressive than a single `σ`/`π` pair once a query needs to
reach into a *second* relation to decide whether the first relation's tuple qualifies —
exactly the situation a join handles in algebra. Bring in `Client` and `Viewing`:

<div class="db-relation" markdown>
<div class="db-relation-name">Client (<u>clientNo</u>, name, telNo, prefType, maxRent)</div>

| clientNo | name | telNo | prefType | maxRent |
|---|---|---|---|---|
| CR76 | John Kay | 0300-1234567 | Flat | 30000 |
| CR56 | Aline Stewart | 0321-9876543 | Flat | 27000 |
| CR74 | Mike Ritchie | 0333-4567890 | House | 45000 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Viewing (<u>clientNo, propertyNo</u>, viewDate, comment)</div>

| clientNo | propertyNo | viewDate | comment |
|---|---|---|---|
| CR76 | PA14 | 2026-05-10 | too small |
| CR56 | PG4 | 2026-05-12 | — |
| CR56 | PG36 | 2026-05-13 | too remote |
| CR74 | PG21 | 2026-05-15 | — |
| CR74 | PG4 | 2026-05-16 | — |
| CR74 | PG36 | 2026-05-17 | — |

</div>

Recall `PropertyForRent` from Lecture 9 — `PG4`, `PG36`, and `PG21` are all in Lahore
(branch `B003`); `PA14` is in Islamabad and `PL94` is in Karachi.

### Example C — "Find the names of clients who have viewed a property in Lahore"

```text
TRC:
{ C.name | Client(C) ∧
    (∃V)(Viewing(V) ∧ V.clientNo = C.clientNo ∧
      (∃P)(PropertyForRent(P) ∧ P.propertyNo = V.propertyNo ∧ P.city = 'Lahore')) }

Algebra:
π name ( Client ⋈ ( Viewing ⋈ (σ city = 'Lahore' (PropertyForRent)) ) )
```

Read the TRC line by line: `C` ranges over `Client`; for `C` to qualify, there must
**exist** *some* viewing `V` belonging to that same client (`V.clientNo = C.clientNo`) whose
property `P` (again, must **exist**) is in Lahore. Every ∃ introduces exactly one "somewhere
out there, at least one match" check.

Trace it against the data: the Lahore properties are `{PG4, PG36, PG21}`. `CR56` (Aline
Stewart) viewed `PG4` and `PG36` — both Lahore, so she qualifies. `CR74` (Mike Ritchie)
viewed `PG21`, `PG4`, and `PG36` — all three Lahore, so he qualifies too. `CR76` (John Kay)
viewed only `PA14`, in Islamabad — he does not qualify.

<div class="db-relation" markdown>
<div class="db-relation-name">Result — both expressions above</div>

| name |
|---|
| Aline Stewart |
| Mike Ritchie |

</div>

The algebra side computes the same answer procedurally: filter `PropertyForRent` down to
Lahore rows first, join that against `Viewing` on `propertyNo` to find which clients viewed
one, then join against `Client` on `clientNo` to recover their names. The calculus side
never specifies that order — it just states the defining condition and lets the DBMS decide
how to evaluate it.

## Universal Quantification

Existential quantification (∃) asks "does at least one match exist?" Its logical partner,
**universal quantification** (∀), asks "does *every* one match?" — the natural way to state
questions like "clients who have viewed **every** property a branch manages."

Relational calculus has no separate ∀ symbol in its most common presentation — instead, ∀ is
expressed using the logical identity `∀x (P(x)) ≡ ¬∃x (¬P(x))`: "every x satisfies P" means
exactly "there is no x that fails P."

### Example D — "Find the names of clients who have viewed every property managed by branch B003"

Branch B003's properties are `{PG4, PG36, PG21}`. Written with the double-negation pattern:

```text
TRC:
{ C.name | Client(C) ∧
    ¬(∃P)(PropertyForRent(P) ∧ P.branchNo = 'B003' ∧
      ¬(∃V)(Viewing(V) ∧ V.clientNo = C.clientNo ∧ V.propertyNo = P.propertyNo)) }
```

Read the negations from the outside in: "there is **no** B003 property `P` such that
`C` has **not** viewed it" — i.e., every B003 property has been viewed by `C`.

Check each client by hand. `CR74` (Mike Ritchie) viewed `PG21`, `PG4`, and `PG36` — all
three B003 properties — so no unviewed B003 property exists for him; he qualifies. `CR56`
(Aline Stewart) viewed `PG4` and `PG36`, but never `PG21` — that missing viewing is exactly
the counter-example the inner ∃ finds, so she fails. `CR76` (John Kay) viewed none of the
three, so he fails immediately.

<div class="db-relation" markdown>
<div class="db-relation-name">Result — Example D</div>

| name |
|---|
| Mike Ritchie |

</div>

!!! note "The algebra equivalent: division"
    This "for every" pattern is exactly what relational algebra's **division** operator
    (÷) was built for: `π clientNo, propertyNo (Viewing) ÷ π propertyNo (σ branchNo = 'B003' (PropertyForRent))`
    returns every `clientNo` that is paired with *all* B003 property numbers in `Viewing`.
    Divide `{(CR76,PA14), (CR56,PG4), (CR56,PG36), (CR74,PG21), (CR74,PG4), (CR74,PG36)}` by
    `{PG4, PG36, PG21}` and only `CR74` has all three — the same single-row answer as the
    TRC formula above, reached by an entirely different mechanical process.

## Tuple vs. Domain Relational Calculus — Side by Side

The table below collects every example from this lecture, so you can compare all three
notations for the same queries at a glance.

| Query (plain English) | TRC | DRC pattern | Algebra |
|---|---|---|---|
| Staff earning > 20000, name & salary | `{S.name, S.salary \| Staff(S) ∧ S.salary > 20000}` | `{name, sal \| ∃sNo,pos,bNo (Staff(sNo,name,pos,sal,bNo) ∧ sal > 20000)}` | `π name,salary (σ salary>20000 (Staff))` |
| All staff at branch B003 | `{S \| Staff(S) ∧ S.branchNo = 'B003'}` | `{sNo,name,pos,sal,bNo \| Staff(sNo,name,pos,sal,bNo) ∧ bNo='B003'}` | `σ branchNo='B003' (Staff)` |
| Clients who viewed a Lahore property | uses nested ∃ across `Client`, `Viewing`, `PropertyForRent` | same structure, one domain variable per attribute of all three relations | nested joins, filtered first with σ |
| Clients who viewed every B003 property | uses `¬∃¬` (universal quantification) | same, with domain variables throughout | division (÷) |

Structurally, TRC and DRC never disagree about *which* tuples qualify — Codd's theorem
guarantees that. What differs is bookkeeping: TRC groups a whole row behind one variable,
DRC spells out every attribute as its own variable, and both compile down to the same
algebra a real DBMS actually executes.

## Safety of Expressions

Not every syntactically valid calculus formula defines a sensible, finite query. Consider:

```text
{ S | ¬Staff(S) }
```

Read literally, this asks for "every tuple that is *not* in `Staff`" — which includes every
possible combination of a `staffNo`, a `name`, a `position`, a `salary`, and a `branchNo`
value that could ever exist, an infinite set. A formula whose result could be infinite, or
whose truth depends on values outside any relation actually named in the formula, is called
**unsafe**. A calculus formula is **safe** only when its result is guaranteed finite and
drawn entirely from the domains of the relations mentioned in it — every ∃-quantified
variable in this lecture's examples ranges over an explicitly named relation
(`Staff(S)`, `Viewing(V)`, `PropertyForRent(P)`) for exactly this reason.

!!! warning "Codd's theorem only covers safe expressions"
    The equivalence between algebra and calculus (Codd's theorem, stated earlier) holds for
    the *safe* subset of calculus formulas. Every relational-algebra expression translates
    to a safe calculus formula, but a careless calculus formula — like the negation example
    above — may have no algebra equivalent at all, simply because it doesn't define a valid
    relation. When you write calculus queries, always make sure every quantified variable is
    tied back to a real, named relation.

## Key Takeaways

- Relational calculus is **declarative** ("what the answer looks like") in contrast to
  algebra's **procedural** style ("the steps to compute it") — Codd's theorem guarantees they
  have equal expressive power over safe expressions.
- **Tuple Relational Calculus (TRC)** queries have the form `{T | F(T)}`, where `T` is a
  tuple variable accessed with dot notation (`T.salary`).
- **Domain Relational Calculus (DRC)** queries use one domain variable per attribute value,
  existentially quantifying every attribute not present in the result.
- **Existential quantification (∃)** asks "does at least one match exist"; **universal
  quantification (∀)** asks "does every one match," and is written using the identity
  `∀x(P(x)) ≡ ¬∃x(¬P(x))` since most calculus presentations provide only ∃ directly.
  Universal quantification corresponds to relational algebra's **division** operator.
- Every worked example in this lecture was traced by hand against the same property rental
  data and shown to produce identical results in TRC, DRC, and relational algebra.
- A calculus formula is **safe** only when its result is finite and every variable is tied
  to a named relation — unsafe formulas like `{S | ¬Staff(S)}` have no valid result and no
  algebra equivalent.

Relational algebra and calculus are how you *ask* a database a question. The next unit turns
to a different problem entirely: designing the database's structure in the first place, so
that the right questions even have sensible answers to ask. Continue to
[Lecture 11 — Data Modeling and Database Design](lecture-11-data-modeling-and-database-design.md).
