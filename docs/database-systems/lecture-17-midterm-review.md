---
title: "17. Midterm Review"
tags:
  - CSC270
  - Review
  - Midterm
  - Relational Model
  - ER Modeling
---

# 17. Midterm Review

This week is midterm exam week — there is no new topic to learn today. Instead, this
chapter is a **checkpoint**: a consolidated tour of everything covered in Lectures 1–16,
from "what is a database, really?" through mapping an EER model down to relational
schemas. Four units got you here — Foundations, the Relational Model, Relational Algebra
and Calculus, and Data Modeling with ER/EER — and the exam draws from all four. Use this
lecture to check which ideas feel solid and which need another look before you sit down to
write.

## Concept Map

Each unit hands the next one a vocabulary it assumes fluency with. Unit 1 gives you the
DBMS itself and its architecture; Unit 2 gives you the mathematical object every query
operates on (the relation); Unit 3 gives you the formal languages that query it; Unit 4
gives you the design process that decides what relations should even exist in the first
place — which is exactly where normalization (Lecture 18 onward) picks up.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Lectures 1–16, four units</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Unit 1: Foundations (L1–4)</span>
<span class="db-node-sub">What a DBMS is, the database approach, DDL/DML, three-schema architecture, data independence</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Unit 2: Relational Model (L5–6)</span>
<span class="db-node-sub">Relations, attributes, domains, keys, integrity constraints</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Unit 3: Algebra &amp; Calculus (L7–10)</span>
<span class="db-node-sub">SELECT/PROJECT, joins, division, aggregation, TRC/DRC</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Unit 4: ER &amp; EER Modeling (L11–16)</span>
<span class="db-node-sub">Conceptual design, ER, EER, mapping to relational schemas</span>
</div>
</div>
</div>

Notice the direction of dependency: you cannot write a correct relational-algebra
expression (Unit 3) without first knowing exactly what a relation is and which attribute is
the key (Unit 2), and you cannot design a *good* set of relations (Unit 4) without
understanding what makes a relation queryable and constrainable in the first place (Units
2–3). Nothing here is re-taught after this point — only re-applied, starting with
normalization in Lecture 18.

## Unit 1: Foundations of Database Systems (Lectures 1–4)

A DBMS exists to solve the problems of the older **file-based approach** — data
duplicated across programs, formats tightly coupled to whichever application wrote them,
and no shared enforcement of correctness ([Lecture 1](lecture-01-introduction-to-databases-and-information-systems.md)).
The **database approach** ([Lecture 2](lecture-02-the-database-approach.md)) centralizes
data and metadata behind one DBMS, which every application shares through **data
definition** and **data manipulation languages** ([Lecture 3](lecture-03-database-languages-and-functions.md)).
The payoff for that centralization is **data independence** — application programs keep
working even when storage details change — and the DBMS delivers it through the
**three-schema architecture** ([Lecture 4](lecture-04-database-architecture-and-data-independence.md)):

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three-schema architecture, recap</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">External level</span>
<span class="db-node-sub">Many user views — each application sees only the part of the data it needs</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Conceptual level</span>
<span class="db-node-sub">One community-wide logical structure — entities, relationships, constraints, independent of any single application</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Internal level</span>
<span class="db-node-sub">Physical storage — file organization, indexes, access paths</span>
</div>
</div>
</div>

The **external–conceptual mapping** is what buys **logical data independence** (the
conceptual schema can gain a new entity without breaking existing external views), and the
**conceptual–internal mapping** buys **physical data independence** (you can rebuild an
index or switch storage engines without touching the conceptual schema, or any application
built on it). If a question asks "why didn't this application break when we added an index,"
the three-schema architecture is the answer.

## Unit 2: The Relational Model (Lectures 5–6)

A **relation** is a named set of tuples over a fixed set of named attributes — a *set*,
which is why no relation can ever contain duplicate tuples, and why tuple/attribute order is
formally irrelevant ([Lecture 5](lecture-05-the-relational-model.md)). Every value stored
must be **atomic**: no repeating groups, no nested tables — a rule that looks like a minor
technicality here, but becomes the entire definition of **First Normal Form** starting
Lecture 19.

The key vocabulary nests strictly inside itself:

| Term | Definition |
|---|---|
| **Superkey** | Any attribute set that uniquely identifies a tuple — may carry extra, unnecessary attributes |
| **Candidate key** | A *minimal* superkey — remove any one attribute and uniqueness breaks |
| **Primary key** | The candidate key the designer chooses to actually identify tuples |
| **Alternate key** | Every candidate key that was *not* chosen as primary |
| **Foreign key** | An attribute set in one relation that reproduces another relation's primary key, encoding a relationship |

Once a schema exists, **integrity constraints** are what keep it honest on every write
([Lecture 6](lecture-06-integrity-constraints.md)): a **domain constraint** checks one
value against its declared domain; **entity integrity** forbids `NULL` in any primary-key
component; **referential integrity** requires every non-`NULL` foreign key value to match
an existing key in the referenced relation (enforced on delete/update via `RESTRICT`,
`CASCADE`, or `SET NULL`); and **general constraints** capture organization-specific
business rules the relational model has no built-in vocabulary for.

## Unit 3: Relational Algebra and Calculus (Lectures 7–10)

Relational algebra is a **procedural** query language — you specify a sequence of
operators, and because every operator's output is itself a relation (the **closure
property**), operators nest freely: `π staffNo, name (σ salary>20000 (Staff))`.

| Family | Operators | Lecture |
|---|---|---|
| Unary | SELECT (σ) filters rows, PROJECT (π) filters columns | 7 |
| Set | UNION (∪), INTERSECTION (∩), DIFFERENCE (−) — require union-compatibility; CARTESIAN PRODUCT (×) — no compatibility needed | 7 |
| Join / Division | Theta-join, equijoin, natural join (⋈), outer joins, DIVISION (÷) | 8 |
| Aggregation | Aggregate functions (`SUM`, `COUNT`, `AVG`, ...), `GROUP BY`-style grouping | 9 |

**Relational calculus** answers the same questions **declaratively**: you state the
*properties* the result must satisfy, using tuple variables (Tuple Relational Calculus) or
domain variables (Domain Relational Calculus), and leave "how to compute it" to the DBMS
([Lecture 10](lecture-10-relational-calculus.md)). Both languages are equivalent in
expressive power (Codd's theorem, restricted to *safe* expressions) — SQL is, underneath,
mostly algebra with calculus-flavored syntax.

| | Relational Algebra | Relational Calculus |
|---|---|---|
| Paradigm | Procedural — specify *how*: the exact sequence of operators | Declarative — specify *what*: the property the result must satisfy |
| Notation | Operator expressions: σ, π, ⋈, ÷, ∪, ∩, − | Logic formulas with quantifiers: ∃ (TRC/DRC), ∀, ∧, ∨, ¬ |
| Variables | None — operates directly on named relations | Tuple variables (TRC) range over tuples; domain variables (DRC) range over single attribute values |
| Best when... | You want to trace a query step by step, or reason about how a DBMS's optimizer will execute it | You want to state a condition without committing to an evaluation order — closer to how SQL reads |
| Risk to watch for | None inherent — every algebra expression is automatically "safe" | An unrestricted formula (e.g. heavy use of ¬) can describe an *infinite* result; only **safe** expressions are legal |
| Division (÷) equivalent | A dedicated operator | Expressed with nested ∀/∃ quantification — noticeably harder to write correctly by hand |

!!! tip "If you can write the algebra, the calculus follows"
    The fastest way to check a TRC formula by hand is to first write the algebra expression
    you already trust, then translate operator by operator: σ becomes a conjunct inside the
    formula, π becomes which attributes of the tuple variable you project out, and a join
    becomes an existentially-quantified tuple variable ranging over the second relation.

## Unit 4: Data Modeling — ER and EER (Lectures 11–16)

Before any relation gets written down, a designer builds a **conceptual data model** —
independent of any DBMS — then maps it down to a **logical** (relational) model
([Lecture 11](lecture-11-data-modeling-and-database-design.md)). The **Entity-Relationship
(ER) model** gives that conceptual stage its vocabulary: entity types, relationship types,
attributes, and **structural constraints** — cardinality and participation
([Lecture 12](lecture-12-the-entity-relationship-model.md)) — while
[Lecture 13](lecture-13-er-modeling-issues-and-problems.md) covers the recurring mistakes
(misidentifying an attribute as an entity, redundant relationships, ambiguous naming) that
make real ER diagrams go wrong.

The **Enhanced ER (EER) model** adds the constructs plain ER cannot express: **superclass/
subclass hierarchies** with inheritance, **specialization** and **generalization**,
**aggregation**, **composition**, and **categorization** (union types) —
[Lecture 14](lecture-14-the-enhanced-er-model.md), applied end-to-end in a full
[case study](lecture-15-eer-modeling-a-case-study.md). Every EER construct eventually has to
become relations, and [Lecture 16](lecture-16-mapping-eer-models-to-relational-schemas.md)
is the rulebook for that translation: strong and weak entities, 1:1/1:N/M:N relationships,
multivalued attributes, and — hardest of all — specialization/generalization itself.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Structural constraint legend, recap</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs" markdown><li class="db-pk">branchNo</li><li>street</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">employs (total)</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs" markdown>
<li class="db-pk">staffNo</li>
<li class="db-fk">branchNo</li>
</ul>
</div>
</div>
</div>

A `1` / `N` badge pair is the **cardinality ratio**; whether a line is drawn to mean "every
instance must participate" (**total**) or "some instances may not" (**partial**) is the
**participation constraint** — and the two are independent of each other, which is exactly
why the cheat-sheet below keeps them in separate rows.

### ER/EER Constraint Cheat-Sheet

| Term | Meaning | Worked example |
|---|---|---|
| **Cardinality ratio** | The maximum number of relationship instances one entity can participate in: 1:1, 1:N, or M:N | One `Branch` employs many `Staff` → 1:N |
| **Total participation** | *Every* instance of the entity must participate in the relationship | Every `Staff` row must have some `branchNo` — total participation of Staff in *employs* |
| **Partial participation** | *Some* instances may not participate at all | Not every `Client` has booked a `Viewing` yet — partial participation of Client in *books* |
| **Disjoint constraint** | An entity instance may belong to **at most one** subclass of a specialization | A `Staff` member is either `Manager` or `Assistant`, never both — disjoint (`d`) |
| **Overlapping constraint** | An entity instance **may** belong to more than one subclass at once | A `Person` could be both a `Student` and an `Employee` — overlapping (`o`) |
| **Total specialization** | Every superclass instance **must** belong to at least one subclass | Every `Staff` row must be a `Manager`, `Supervisor`, or `Assistant` — total |
| **Partial specialization** | Some superclass instances may belong to **no** subclass | A `Vehicle` may just be a plain `Vehicle`, with no `Car`/`Truck` subtype recorded yet — partial |

Mapping a specialization down to relations (Lecture 16) comes down to picking one of three
strategies, and the exam favors questions that ask you to pick the *right* one for a given
disjoint/overlapping and total/partial combination:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Mapping specialization/generalization to relations — three options</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Option A — one relation, type attribute</span>
<span class="db-node-sub">Single Staff(staffNo, ..., staffType, bonus, trainingLevel) relation; unused subclass attributes are NULL per row. Best for: disjoint + total, few subclasses, few subclass-specific attributes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Option B — one relation per subclass only</span>
<span class="db-node-sub">Manager(staffNo, ..., bonus), Assistant(staffNo, ..., trainingLevel) — no separate Staff relation. Best for: disjoint + total only (every instance lands in exactly one subclass table)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Option C — superclass + one relation per subclass</span>
<span class="db-node-sub">Staff(staffNo, name, position, salary, branchNo); Manager(staffNo, bonus); Assistant(staffNo, trainingLevel) — staffNo is both PK and FK. Best for: overlapping, or partial specialization</span>
</div>
</div>
</div>

!!! warning "Option B silently breaks under partial specialization"
    Option B has no relation to hold a `Staff` row that belongs to *no* subclass yet — if
    specialization is **partial**, that instance has nowhere to live. Option C always works
    regardless of disjoint/overlapping or total/partial, which is why it's the "safe
    default" most textbooks fall back to when in doubt — at the cost of an extra join to
    reassemble a full picture of one staff member.

## When to Use Relational Algebra vs. Relational Calculus

Restating the Unit 3 comparison as a direct decision rule, since exam questions often phrase
it as "which would you reach for":

- **Reach for algebra** when you're asked to show a step-by-step derivation, when you need
  to reason about intermediate relations (what does the Cartesian product look like *before*
  the SELECT that turns it into a join?), or when translating directly into an execution
  plan.
- **Reach for calculus** when you're asked to state a condition concisely without committing
  to an order of operations — "find every client such that no property they'd accept is
  currently vacant" reads far more naturally as a quantified formula than as a nested
  algebra expression.
- **Both are equally correct** for anything expressible safely in either — this is exactly
  what Codd's theorem guarantees, so "which one is right" is rarely the question; "which one
  is asked for" is.

## Self-Test

**Question 1.** Write the relational algebra expression to find the names of every staff
member who works at branch `B003` and earns more than 15,000.

> **Answer:** `π name (σ branchNo='B003' ∧ salary>15000 (Staff))`. SELECT (σ) must run
> first, while `branchNo` and `salary` are still present to filter on; PROJECT (π) narrows
> the result to `name` only afterward.

**Question 2.** Write the tuple relational calculus (TRC) expression equivalent to
Question 1.

> **Answer:** `{ S.name | Staff(S) ∧ S.branchNo = 'B003' ∧ S.salary > 15000 }` — read as
> "the set of `name` values for every tuple `S` in `Staff` such that `S`'s branch is `B003`
> and `S`'s salary exceeds 15000."

**Question 3.** What is the difference between a candidate key and the primary key of a
relation?

> **Answer:** A relation may have several candidate keys — minimal attribute sets that each
> independently guarantee uniqueness. The primary key is simply the one candidate key the
> designer *chooses* to be the relation's main identifier; every other candidate key becomes
> an alternate key. There is no structural difference between them until that choice is made.

**Question 4.** `Branch` row `B003` is deleted while three `PropertyForRent` rows still
reference it through `branchNo`. What happens under `ON DELETE RESTRICT`? Under
`ON DELETE CASCADE`?

> **Answer:** Under `RESTRICT`, the delete is refused outright as long as any
> `PropertyForRent` row still references `B003` — the DBMS forces the properties to be
> reassigned or deleted first. Under `CASCADE`, the delete succeeds and automatically
> removes all three referencing `PropertyForRent` rows too.

**Question 5.** A `Staff` specialization has subclasses `Manager` (extra attribute `bonus`)
and `Assistant` (extra attribute `trainingLevel`), constrained disjoint and total. Using
mapping Option C (superclass plus one relation per subclass), write the resulting relation
schemas.

> **Answer:**
> `Staff(`<u>`staffNo`</u>`, name, position, salary, branchNo)`
> `Manager(`<u>`staffNo`</u>`, bonus)` — `staffNo` is both primary key and a foreign key referencing `Staff`
> `Assistant(`<u>`staffNo`</u>`, trainingLevel)` — same pattern
> Even though the specialization is disjoint and total (Option B would also have worked
> here), Option C is always a safe, general-purpose choice.

**Question 6.** What real-world question does the DIVISION (÷) operator answer that a plain
SELECT/JOIN combination struggles to express directly?

> **Answer:** DIVISION answers "for-every" queries — e.g., "find every client who has
> viewed **every** property managed by branch `B003`." It divides one relation (client,
> property pairs actually viewed) by another (every property managed by B003) and returns
> exactly the clients whose viewed-set is a superset of the divisor — a genuinely different
> shape of question than "find rows matching *some* condition."

**Question 7.** Why must relational calculus expressions be restricted to *safe*
expressions?

> **Answer:** An unrestricted formula — heavy use of negation (¬) over an attribute with no
> bound on its domain, for instance "every tuple `S` such that `S.name` is **not** `'Ann
> Beech'`" — can describe an infinite result relation, since the calculus has no way to know
> the query author meant "not Ann Beech, among staff who exist" rather than "not Ann Beech,
> among all conceivable strings." Safety restricts formulas to only ever range over values
> that actually appear in the database.

**Question 8.** Distinguish disjoint vs. overlapping, and total vs. partial specialization,
in one sentence each.

> **Answer:** *Disjoint* means an entity instance can belong to at most one subclass;
> *overlapping* means it may belong to several at once. *Total* specialization means every
> superclass instance must belong to some subclass; *partial* specialization means some
> instances may belong to none. The two pairs are independent — a specialization can be any
> of the four combinations (disjoint+total, disjoint+partial, overlapping+total,
> overlapping+partial).

## Key Takeaways

- Units 1–4 build strictly on each other: the DBMS and its architecture (Unit 1) host the
  relational model (Unit 2), which relational algebra and calculus query (Unit 3), which the
  ER/EER design process (Unit 4) exists to populate correctly in the first place.
- The **three-schema architecture** — external, conceptual, internal — is the mechanism
  behind **data independence**; know which mapping buys which kind (logical vs. physical).
- The key hierarchy nests: **candidate key** ⊇ **primary key** (one choice among candidates);
  **superkey** ⊇ **candidate key** (minimality is what separates them).
- **Relational algebra** is procedural (how); **relational calculus** is declarative (what);
  both are equally expressive over *safe* expressions.
- **Structural constraints** — cardinality ratio and participation — describe plain ER
  relationships; **disjoint/overlapping** and **total/partial specialization** are the
  extra vocabulary EER adds specifically for superclass/subclass hierarchies.
- Mapping EER to relations almost always comes down to choosing among three strategies for
  specialization — and Option C (superclass + one relation per subclass) is the one that
  never breaks, regardless of the constraint combination.
- If any self-test question above felt shaky, revisit that lecture before the exam —
  Lecture 18 onward (normalization) assumes every idea here is already second nature,
  especially functional dependencies' close relationship to keys.
