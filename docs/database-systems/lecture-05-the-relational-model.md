---
title: "5. The Relational Model"
tags:
  - CSC270
  - Relational Model
  - Keys
  - Database Schema
---

# 5. The Relational Model

Every database you will design in this course, and almost every one you will ever query on
the job, rests on one deceptively simple idea from 1970: store data as **tables**, and let
a small set of mathematical rules — not the order you typed things in, not how a
particular DBMS happens to store bytes on disk — define what a valid table looks like and
how tables relate to each other. That idea is the **relational model**, and this lecture
builds its vocabulary precisely, because every later lecture (algebra, ER design,
normalization, SQL) is really just an elaboration of the handful of terms defined here.

To make the ideas concrete, this lecture introduces a small **property rental agency**
database — branches, staff, and the properties they manage — that we will reuse and extend
across Lectures 5 through 8, so you build real familiarity with it instead of relearning a
new example every lecture.

## In This Lecture

- What the relational model is, and why E. F. Codd proposed it
- The formal notion of a **relation**, and how it differs from an everyday "table"
- How a mathematical relation differs from a database relation
- The properties every valid relation must have
- Attributes, domains, and why domains matter more than they first appear to
- The full family of relational keys: superkey, candidate key, primary key, foreign key,
  alternate key
- What a relational database schema is
- The standard shorthand notation for writing down a relation's schema

## Overview of the Relational Model

The **relational model** represents a database as a collection of **relations** — informally,
tables — where each relation holds data about one kind of thing (branches, staff, properties)
and relationships between things are represented *by shared data values*, not by physical
pointers or nesting. It was proposed by **E. F. Codd** in his 1970 paper "A Relational Model
of Data for Large Shared Data Banks," replacing earlier hierarchical and network models that
forced application programmers to navigate data through rigid, hand-coded paths.

!!! note "Why the relational model won"
    Before 1970, if you wanted to find "every property managed by branch B003," you had to
    already know the physical path from branch records to property records, hard-coded into
    your program. Codd's insight was that a table plus a shared key value (`branchNo`) is
    enough to answer that question *declaratively* — you say *what* you want, and a query
    language figures out *how* to get it. That separation of "what" from "how" is the
    foundation Lecture 7's relational algebra and, eventually, SQL are built on.

Here is the running example for this lecture and the next three. A property rental agency
tracks its branches, the staff who work at each branch, and the properties each branch has
for rent:

<div class="db-relation" markdown>
<div class="db-relation-name">Branch (<u>branchNo</u>, street, city, postcode)</div>

| branchNo | street | city | postcode |
|---|---|---|---|
| B003 | 163 Main St | Lahore | 54000 |
| B005 | 22 Deer Rd | Karachi | 74200 |
| B007 | 16 Argyll St | Islamabad | 44000 |

</div>

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

Two tables, one obvious connection: every `Staff` row's `branchNo` value matches a
`Branch` row's `branchNo` value. That single repeated column is the *entire* mechanism the
relational model uses to represent "this employee works at this branch" — no pointers, no
nesting, just matching values. Formalizing exactly what makes this legal is the rest of the
lecture.

## The Notion of a Relation

A **relation** is a table of values, organized into rows and named columns. Every relation
has:

- A **name**, unique within the database (`Staff`, `Branch`).
- A fixed set of **attributes** (columns), each with a name and a domain of legal values.
- Zero or more **tuples** (rows), each holding one value per attribute.

In the `Staff` relation above, `staffNo`, `name`, `position`, `salary`, and `branchNo` are
attributes; the row `(SL21, John White, Manager, 30000, B005)` is a single tuple. The
**degree** of a relation is its number of attributes (`Staff` has degree 5); the
**cardinality** of a relation is its current number of tuples (`Staff` currently has
cardinality 5). Cardinality changes constantly as rows are inserted or deleted — degree
almost never does, because changing it means altering the table's structure itself.

!!! tip "Table, relation, or relvar?"
    In casual conversation "table," "relation," and even "entity" get used almost
    interchangeably, and for this course that's fine. Precisely, a **relation** is really
    a *value* — a particular set of tuples at one instant — while what you actually create
    with `CREATE TABLE` is a **relation variable** (relvar) whose value changes over time as
    rows are added or removed. The `Staff` relation shown above is one snapshot of the
    `Staff` relvar; tomorrow, after a hire, it will be a different relation holding one more
    tuple, even though it is still "the `Staff` table."

## Mathematical Relations vs. Database Relations

The word "relation" is borrowed directly from set theory, and it's worth being precise about
how the two uses relate — because database relations quietly *tighten* several rules that
plain mathematical relations don't enforce.

In mathematics, given sets $D_1, D_2, \ldots, D_n$, their **Cartesian product**
$D_1 \times D_2 \times \cdots \times D_n$ is the set of all possible ordered $n$-tuples
$(d_1, d_2, \ldots, d_n)$ where $d_i \in D_i$. A mathematical **relation** on these $n$ sets
is simply *any subset* of that Cartesian product.

| | Mathematical relation | Database relation |
|---|---|---|
| Tuple order | Significant — $(1,2) \neq (2,1)$ as a defining property of an ordered tuple | Irrelevant — a relation is a *set* of tuples, sets have no order |
| Column identity | By **position** only (the 1st component, the 2nd component) | By **name** (`branchNo`, `salary`) — position is an implementation detail |
| Duplicate tuples | Allowed, since it's built from an ordered Cartesian product, and a "subset" can be revisited conceptually as a *bag* in some treatments | **Never** allowed — a relation is a true mathematical set, and sets cannot contain the same element twice |
| Component values | Any value from the source set, including further tuples (nested) | Must be **atomic** — a single, indivisible value per attribute (see below) |

A database relation is best understood as a mathematical relation with extra business
discipline bolted on: it borrows "subset of a Cartesian product of domains," but then adds
*named* attributes, forbids duplicate rows, and requires every stored value to be atomic.
Those extra rules are exactly the "Relation Properties" spelled out next.

## Relation Properties

Every valid database relation, at every instant, must satisfy four properties. These are not
stylistic preferences — a table that violates any one of them is not, formally, a relation.

1. **The relation has a name distinct from all other relations in the schema.**
2. **No duplicate tuples.** Because a relation is a mathematical *set* of tuples, and sets
   cannot contain the same element twice, `Staff` can never hold two entirely identical
   rows. (In practice, a primary key — introduced below — guarantees this automatically,
   since no two tuples can share a primary key value.)
3. **Tuple order is irrelevant.** `Branch` displayed with `B007` first and `B003` last is
   *the same relation* as the one shown above — a relation is a set, and sets have no
   inherent order. Any ordering you see in a query result comes from an explicit `ORDER BY`
   clause, not from the relation itself.
4. **Attribute order is irrelevant** (in the pure theory — real SQL implementations do
   fix a column order for display and for positional access, but conceptually the
   relational model identifies a value by its attribute *name*, `branchNo`, not by "the
   fourth column"). `Staff(staffNo, name, position, salary, branchNo)` and
   `Staff(branchNo, staffNo, salary, name, position)` describe the identical relation.
5. **Each attribute value is atomic.** Every cell holds a single, indivisible value drawn
   from its attribute's domain — never a list, a set, or a nested table. A `Staff` tuple
   cannot store "assistant, supervisor" as one multi-valued `position` cell; that would
   require a repeating group, which the relational model disallows at the relation level.
   (This exact rule reappears, formalized, as **First Normal Form** in Lecture 18.)

!!! warning "Atomicity is stricter than it sounds"
    `telNo: "042-121-1121, 042-121-1122"` looks harmless as a single text string, but it
    violates atomicity in spirit: the DBMS cannot search, index, or constrain "one of this
    client's phone numbers" without parsing the string yourself first. The relational fix is
    a separate `ClientPhone(clientNo, telNo)` relation with one tuple per number — trading
    one wide column for one extra table, which is exactly the kind of trade-off
    normalization (Unit 5) teaches you to reason about formally.

## Attributes and Domains

An **attribute** is a named column of a relation, representing one property of the thing the
relation describes (`salary` is an attribute of `Staff`). A **domain** is the set of all
values that are legal for a given attribute to hold — think of a domain as a named,
reusable data type with business meaning attached.

<div class="db-relation" markdown>
<div class="db-relation-name">Domain definitions used by Staff and Branch</div>

| Domain name | Meaning | Example legal values |
|---|---|---|
| StaffNumbers | valid staff identifiers | SL21, SG37, SG14 |
| StaffNames | person names | John White, Ann Beech |
| StaffPositions | valid job titles | Manager, Supervisor, Assistant |
| Salaries | salary in PKR, 8,500 – 40,000 | 9000, 12000, 30000 |
| BranchNumbers | valid branch identifiers | B003, B005, B007 |

</div>

Two attributes can share the same domain even with different names — both `Staff.branchNo`
and `Branch.branchNo` draw from the `BranchNumbers` domain, and it is exactly that shared
domain that makes comparing them (and therefore joining the two tables, Lecture 8)
meaningful in the first place. A domain is more than "the data type is `VARCHAR(4)`" — it
also carries the *business* rule ("must be one of our three real branch codes"), which is
why domain constraints get their own treatment in Lecture 6.

## Relational Keys

Keys are how the relational model identifies tuples uniquely and links relations together.
There are five terms here, and they nest inside one another — learn them in this order.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The key hierarchy, from broadest to most specific</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Superkey</span>
<span class="db-node-sub">Any attribute set that uniquely identifies a tuple — may contain extra, unnecessary attributes</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Candidate key</span>
<span class="db-node-sub">A minimal superkey — remove any one attribute and uniqueness breaks</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Primary key</span>
<span class="db-node-sub">The candidate key the designer chooses to actually identify tuples</span>
</div>
</div>
</div>

- **Superkey** — an attribute, or set of attributes, that uniquely identifies every tuple in
  a relation. `{staffNo}` is a superkey of `Staff`; so is `{staffNo, name}`, and so is
  `{staffNo, name, salary}` — adding attributes to a superkey can never break uniqueness, it
  can only ever add redundant information.
- **Candidate key** — a superkey that is also **minimal**: no attribute can be removed from
  it without destroying the uniqueness guarantee. `{staffNo}` alone is a candidate key of
  `Staff` (no smaller subset works, and removing `staffNo` from `{staffNo, name}` leaves
  just `{name}`, which is *not* guaranteed unique — two different staff members could share
  a name). `{staffNo, name}` is a superkey but **not** a candidate key, precisely because it
  isn't minimal.
- **Primary key** — the candidate key a database designer *chooses* to be the relation's
  main identifier. A relation may have several candidate keys (e.g., both `staffNo` and a
  national ID number might uniquely identify a staff member) but exactly **one** is
  designated primary. By convention, the primary key is written **underlined** in schema
  notation, as you already saw above: `Staff(`<u>`staffNo`</u>`, name, position, salary, branchNo)`.
- **Alternate key** — every candidate key that was *not* chosen as the primary key. If both
  `staffNo` and a national ID number uniquely identify staff, and `staffNo` is chosen as
  primary, the national ID number is an alternate key — still unique, still enforceable, just
  not the one the schema leads with.
- **Foreign key** — an attribute (or attribute set) in one relation that reproduces the
  primary key of another relation (or, occasionally, the same relation), used to represent a
  relationship between the two. `Staff.branchNo` is a foreign key referencing
  `Branch.branchNo`: it is how the `Staff` relation records *which branch* each employee
  works at, without duplicating the branch's street address, city, and postcode into every
  staff row.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Staff references Branch via a foreign key</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs">
<li class="db-pk">branchNo</li>
<li>street</li>
<li>city</li>
<li>postcode</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">employs</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs">
<li class="db-pk">staffNo</li>
<li>name</li>
<li>position</li>
<li>salary</li>
<li class="db-fk">branchNo</li>
</ul>
</div>
</div>
</div>

Notice `branchNo` is marked as a plain (non-underlined) attribute inside `Branch` — there
it's the primary key — but as *italic* inside `Staff`, marking it as a foreign key: the same
domain of values, playing two different structural roles depending on which relation it
appears in.

!!! tip "A quick test for candidate keys"
    Ask two questions about any attribute set $K$ in relation $R$: (1) **Uniqueness** — can
    two distinct tuples in $R$ ever share the same value(s) for $K$? If yes, $K$ is not even
    a superkey. (2) **Minimality** — if you drop any single attribute from $K$, does
    uniqueness still hold? If yes, $K$ was not minimal, so it was not a candidate key to
    begin with — only the smaller set is. Apply both tests to `{propertyNo}` versus
    `{propertyNo, street}` in a `PropertyForRent` relation and you'll see immediately why
    only the first is a candidate key.

## Relational Database Schema

A single relation describes one kind of thing. A **relational database schema** is the
complete structural description of a whole database: the set of all relation schemas
(names, attributes, domains, primary/foreign keys) together with all the integrity
constraints that must hold across them (formalized fully in Lecture 6). The schema is the
*design* — it changes rarely, deliberately, and usually only through `ALTER TABLE`. The
actual rows sitting in the tables at any moment are the **database instance** (or
**extension**) — they change constantly, every time a row is inserted, updated, or deleted.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Schema vs. instance</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Schema (intension)</span>
<span class="db-node-sub">Relation names, attributes, domains, keys — the design, changes rarely</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Instance (extension)</span>
<span class="db-node-sub">The actual tuples present right now — changes on every insert/update/delete</span>
</div>
</div>
</div>

The rental agency's schema so far — two relation schemas plus one referential link between
them — is small on purpose; by Lecture 8 it will grow to include `PropertyForRent`,
`PrivateOwner`, and `Client` as well, giving the relational-algebra examples something
richer to query.

## Representing Relational Database Schemas

Throughout this course (and in almost every database textbook and technical spec you will
ever read), a relation schema is written in one compact line:

```text
RelationName (attribute1, attribute2, ..., attributeN)
```

with the primary key **underlined**, and foreign keys usually marked in some visually
distinct way (italics, or an explicit note) when the diagram allows it. The two relations
introduced in this lecture, written this way:

```text
Branch (branchNo, street, city, postcode)
Staff  (staffNo, name, position, salary, branchNo)
```

(imagine `branchNo` and `staffNo` underlined in each line above — this course's `.db-relation`
diagrams render that underline directly, as you saw earlier). When a foreign key needs to be
called out explicitly, textbooks commonly add a line beneath the schema:

```text
Staff (staffNo, name, position, salary, branchNo)
    Foreign Key branchNo references Branch(branchNo)
```

This shorthand is worth memorizing cold: you will read and write it constantly starting in
Lecture 7, where every relational-algebra expression operates on relations named exactly
this way, and again in Unit 4 when you translate an ER diagram into a set of relation
schemas.

!!! note "Composite primary keys underline as a group"
    Not every primary key is a single attribute. A relation like
    `Viewing (`<u>`clientNo, propertyNo`</u>`, viewDate, comment)` — introduced in Lecture 8 — has a
    **composite** primary key: neither `clientNo` alone nor `propertyNo` alone is unique
    (one client views many properties, one property is viewed by many clients), but the
    *pair* is. Convention underlines the whole pair together, exactly as shown, to signal
    "these attributes are only unique in combination."

## Key Takeaways

- The **relational model** represents data as named, independent tables (relations) linked
  purely through shared attribute values — no pointers, no nesting.
- A **relation** is a named set of tuples over a fixed set of named attributes; its
  **degree** is its attribute count, its **cardinality** is its current tuple count.
- A database relation tightens the mathematical notion of "subset of a Cartesian product":
  no duplicate tuples, no meaningful tuple or attribute order, every value atomic.
- **Domains** define the legal values for an attribute and are what make comparing two
  attributes (and later, joining two relations) meaningful.
- The key hierarchy nests: every **candidate key** is a minimal **superkey**; the **primary
  key** is the candidate key chosen to identify tuples; unchosen candidate keys are
  **alternate keys**; a **foreign key** reproduces another relation's primary key to encode
  a relationship.
- A **relational database schema** is the full structural design (all relation schemas plus
  integrity constraints); the actual rows present at any moment are the **instance**.
- Schemas are written `Relation(attr1, attr2, ...)` with the primary key underlined — learn
  this notation now, since every later lecture assumes fluency with it.

Continue to [Lecture 6 — Integrity Constraints](lecture-06-integrity-constraints.md), where
the rules hinted at here (entity integrity from primary keys, referential integrity from
foreign keys) are made precise and enforceable.
