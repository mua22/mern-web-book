---
title: "11. Data Modeling and Database Design"
tags:
  - CSC270
  - Data Modeling
  - Database Design
  - ER Model
---

# 11. Data Modeling and Database Design

So far, this course has assumed the tables already exist — Lectures 5–10 taught you how to
query, filter, join, and summarize a `Staff`/`Branch`/`PropertyForRent` schema that simply
appeared, fully formed, in Lecture 5. In practice, nobody hands you that schema. Someone has
to sit down with a rental agency's actual staff, listen to how they talk about their business
("a branch employs staff," "a client views properties," "an owner can list several
properties"), and turn that fuzzy conversation into precise tables, columns, and keys — without
getting lost in either extreme, guessing at technical details too early or staying so vague
the design never becomes buildable. That disciplined process is **database design**, and the
tool that keeps it disciplined is **data modeling**. This lecture is the bridge between
"how do I query a database" (Units 1–3, done) and "how do I design one" (the rest of Unit 4,
starting next lecture) — it sets up the three-level process every later ER lecture assumes you
already understand.

## In This Lecture

- Why data modeling comes *before* building anything, not after
- **Conceptual data models** — capturing meaning, independent of any technology
- **Logical data models** — adding relational structure, still independent of any specific
  DBMS product
- **Relational database design** as the specific instance of this process this course focuses on
- Mapping a conceptual model to a logical model
- Mapping a logical model down to a concrete relational schema
- Practical considerations that separate a good relational design from a merely working one

## Data Modeling

A **data model** is a collection of concepts and notations for describing data, its
relationships, and the constraints that must hold on it — a shared vocabulary that lets a
designer, a client, and eventually a DBMS all agree on exactly what "a branch" or "a
viewing" means, before a single line of SQL is written. **Data modeling** is the activity of
building one.

Why not just start writing `CREATE TABLE` statements directly? Because tables are a
*technology-specific* answer to a *business* question, and business questions are far easier
to get wrong when you're simultaneously fighting with column names, data types, and foreign
key syntax. Separating "what does this business actually need to record?" from "how do we
implement that in a relational DBMS?" lets you get the *meaning* right first, cheaply, on a
whiteboard or in a diagram — and only then commit to the much more expensive, much harder to
change, physical implementation.

!!! note "The cost of getting this wrong compounds"
    A missing requirement caught during modeling costs a conversation and a redrawn diagram.
    The same missing requirement caught after the database is in production, with real data
    and real applications depending on its shape, can cost a multi-week migration. Every
    later lecture in this unit exists because that asymmetry is real.

Data modeling operates at three distinct levels of abstraction, each answering a different
question and aimed at a different audience:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three levels of data modeling, and what each one answers</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Conceptual model</span>
<span class="db-node-sub">"What are the things, and how do they relate?" — technology-independent, for business stakeholders</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Logical model</span>
<span class="db-node-sub">"What tables, columns, and keys does this need?" — DBMS-product-independent, for designers</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Relational schema</span>
<span class="db-node-sub">"What does CREATE TABLE actually say?" — concrete data types and DBMS-specific detail, for implementers</span>
</div>
</div>
</div>

## Conceptual Data Models

A **conceptual data model** is a technology-independent description of an organization's
data: the significant *things* it needs to track (entities), the *connections* between them
(relationships), and the *properties* of each thing (attributes) — with absolutely no
mention of tables, columns, data types, or which DBMS will eventually run it. The
**Entity-Relationship (ER) model**, the subject of the very next lecture, is the standard
notation for building conceptual models.

Stated in plain English, a conceptual model for the rental agency's world says things like:
"a branch employs several staff," "a client may view several properties, and a property may
be viewed by several clients," "each property is owned by exactly one private owner." Notice
none of that sentence commits to a table structure yet — it is pure business meaning,
equally valid whether the agency eventually implements it in a relational DBMS, a
spreadsheet, or (in the early 1970s) a hierarchical database.

!!! tip "A conceptual model should survive a change of DBMS unchanged"
    If moving from PostgreSQL to Oracle — or even from a relational DBMS to a document store
    — forces you to redraw your conceptual model, the model was capturing implementation
    detail, not business meaning. "A branch employs staff" is true regardless of what
    software eventually stores that fact; that's precisely the test for whether something
    belongs at the conceptual level.

## Logical Data Models

A **logical data model** takes the entities, relationships, and attributes from the
conceptual model and organizes them according to the rules of a particular *family* of
data model — relational, hierarchical, network, or object-oriented — while still remaining
independent of any one DBMS *product*. This course works entirely within the **relational**
family (Lecture 5), so from here on, "logical model" means: a complete set of relation
schemas — names, attributes, primary keys, foreign keys — with no data types, no storage
details, and no vendor-specific syntax attached yet.

A logical model answers "what relations do we need, and how do they reference each other?"
without yet answering "is `salary` a `DECIMAL(8,2)` or an `INT`?" or "should `branchNo` have
an index?" Those are physical, DBMS-specific concerns, deliberately deferred to the next
level down.

## Relational Database Design

**Relational database design** is the name for this entire process *when the target logical
model is, specifically, the relational model* — which, for this course, it always is. It is
the disciplined path from "a rental agency wants a database" to "a validated set of relation
schemas that correctly represent the agency's data, obey the relational integrity rules from
Lecture 6, and will not fall apart under normal use." Three properties define a *good*
relational design, and the rest of this course (ER modeling now, normalization in Unit 5,
transactions in Unit 8) is really just successive elaboration of how to guarantee them:

- **Correctness** — the design faithfully represents every entity, relationship, and business
  rule the organization actually has, no more and no less.
- **Non-redundancy** — the same fact is not stored in more than one place, so it can never
  drift out of sync with itself (the entire motivation for normalization, Unit 5).
- **Robustness under real use** — the design supports the queries, transactions, and volume
  of data the organization will actually throw at it, not just the neat example used to
  explain it.

!!! warning "Relational database design is not the same as 'writing SQL'"
    It is entirely possible to write syntactically perfect `CREATE TABLE` statements that
    represent the business *incorrectly* — for example, storing a property's `ownerNo` as a
    column of `PropertyForRent` but also duplicating the owner's `name` and `address` there
    "for convenience." SQL syntax will accept this without complaint; relational database
    design is the discipline that catches it anyway, because it asks "is this correct and
    non-redundant?" before it asks "does this compile?"

## Mapping Conceptual Model to Logical Model

Turning a conceptual (ER) model into a logical (relational) model follows a small set of
systematic rules — the full, precise version of these rules, covering every cardinality
case, is the subject of dedicated lectures later in this unit. The shape of the process,
previewed here so the rest of Unit 4 has context to build on:

- Every **strong entity type** becomes a **relation**, with the entity's identifying
  attribute becoming that relation's primary key.
- Every **simple attribute** of the entity becomes a **column** of that relation.
- Every **relationship type** becomes either a **foreign key** placed on one side of the
  relationship (for 1:1 and 1:N relationships) or an entirely **new relation** representing
  the relationship itself (for M:N relationships) — the precise rule depends on the
  relationship's cardinality, covered fully once cardinality itself is defined in
  [Lecture 12](lecture-12-the-entity-relationship-model.md).

Concretely, for this course's running example, the conceptual entity `Branch` — "a thing
with a branch number, a street, a city, and a postcode" — maps directly onto the logical
relation you have already been using since Lecture 5:

<div class="db-grid-2" markdown>
<div class="db-diagram" markdown>
<p class="db-diagram-label">Conceptual — an ER entity type</p>
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
</div>
</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Logical — the mapped relation</div>

| branchNo | street | city | postcode |
|---|---|---|---|
| B003 | 163 Main St | Lahore | 54000 |
| B005 | 22 Deer Rd | Karachi | 74200 |

</div>
</div>

Nothing was lost in this mapping — every attribute of the entity became a column, and the
entity's identifying attribute became the primary key — but nothing was added either: still
no data type for `postcode`, no index, no storage engine. That is exactly the boundary
between "logical" and what comes next.

## Mapping Logical Model to Relational Schema

The final step takes a logical model — abstract relation schemas — and turns it into a
concrete **relational schema**: the actual, implementable structure a specific DBMS will
run, with every remaining decision filled in. This is where you decide:

- **Concrete data types** for every attribute — is `salary` a `DECIMAL(8,2)`, an `INTEGER`,
  or a `NUMERIC`? Is `postcode` text (since postal codes can have leading structure that
  arithmetic would destroy) or a number?
- **Column-level constraints** — `NOT NULL`, `CHECK` constraints enforcing domain rules
  (Lecture 6's domain constraints made concrete, e.g. `CHECK (salary > 0)`).
- **Indexing strategy** — which columns need an index to make expected queries fast (almost
  always: primary keys and foreign keys, at minimum).
- **Naming conventions and DBMS-specific syntax** — the exact `CREATE TABLE` dialect of the
  target product (PostgreSQL, MySQL, SQL Server, …).

<div class="db-relation" markdown>
<div class="db-relation-name">Relational schema — the same Branch relation, one level more concrete</div>

```text
CREATE TABLE Branch (
    branchNo  CHAR(4)      NOT NULL,
    street    VARCHAR(40)  NOT NULL,
    city      VARCHAR(30)  NOT NULL,
    postcode  CHAR(5)      NOT NULL,
    PRIMARY KEY (branchNo)
);
```

</div>

Connolly's textbook calls this final translation step **physical database design** — the
name signals that, unlike the logical model, this step is allowed (even expected) to differ
between DBMS products, and to trade some conceptual purity for real-world performance (an
idea revisited when denormalization is discussed in Unit 5).

!!! note "Nothing here changes what the data *means*"
    Every decision in this section — data types, indexes, constraint syntax — changes how
    the data is *stored and enforced*, never what it *means*. A well-run design process
    should never need to revisit the conceptual model because of something discovered while
    picking data types; if it does, that's a sign a business rule was missed earlier, not a
    normal part of this step.

## Relational Database Design Considerations

A relational schema can be syntactically flawless and still be a poor design. Before
treating any schema as finished, check it against these practical considerations — each one
previews a topic this course returns to in far more depth later:

| Consideration | Question to ask | Where this is covered in depth |
|---|---|---|
| **Redundancy** | Is any fact stored in more than one place? | Normalization, Unit 5 |
| **Update anomalies** | Can inserting, updating, or deleting one row corrupt or lose other facts? | Normalization, Unit 5 |
| **Appropriate keys** | Is the primary key stable and minimal (Lecture 5's candidate-key test)? | Lecture 5 |
| **Referential integrity** | Does every foreign key correctly reference a real, enforced primary key? | Lecture 6 |
| **Growth and volume** | Will this design still perform acceptably at 100x the current data volume? | Physical design, Unit 6 |
| **Security and access** | Should every user see every column (e.g., `salary`)? | Views and security, Unit 6 |
| **Naming consistency** | Are attribute names (`branchNo` vs `branch_id` vs `BranchNumber`) consistent across every relation that shares a domain? | Ongoing discipline, all units |

!!! tip "A cheap sanity check: read the schema aloud as sentences"
    For every relation, read its name and attributes as a sentence: "A `Branch` has a
    `branchNo`, a `street`, a `city`, and a `postcode`." If the sentence sounds natural and
    every attribute clearly belongs to that one thing, the relation is probably well-formed.
    If you find yourself saying "...and also the name and address of whoever manages it"
    for a relation that isn't `Staff`, that's redundancy trying to sneak in — exactly what
    Unit 5's normalization theory formalizes and eliminates.

## Key Takeaways

- **Data modeling** builds a shared, precise vocabulary for an organization's data *before*
  any technology commitment is made — separating "what does the business need?" from "how do
  we implement it?"
- A **conceptual model** is technology-independent (entities, relationships, attributes); a
  **logical model** adds relational structure but stays DBMS-product-independent; a
  **relational schema** commits to concrete data types, constraints, and DBMS-specific syntax.
- **Relational database design** is this entire process aimed specifically at the relational
  model, judged by three properties: correctness, non-redundancy, and robustness under real
  use — not merely "does the SQL compile."
- Mapping conceptual → logical follows systematic rules (entity → relation, attribute →
  column, relationship → foreign key or new relation depending on cardinality) — the full
  rule set is built out across the rest of this unit, starting with cardinality in
  Lecture 12.
- Mapping logical → relational schema adds data types, constraints, and indexing — decisions
  that affect performance and enforcement, never the underlying business meaning.
- A syntactically correct schema can still be a poor design — always check it against
  redundancy, update anomalies, key quality, referential integrity, growth, and security
  before calling it finished.

With the three-level process in place, the rest of this unit builds the conceptual level in
full: entities, relationships, attributes, and the structural constraints that make an ER
diagram precise enough to map into relations. Continue to
[Lecture 12 — The Entity-Relationship Model](lecture-12-the-entity-relationship-model.md).
