---
title: "12. The Entity-Relationship Model"
tags:
  - CSC270
  - ER Model
  - Entity Types
  - Cardinality
---

# 12. The Entity-Relationship Model

Lecture 11 set up the three-level design process — conceptual, logical, relational schema —
but left the conceptual level itself completely undefined. This lecture fills that gap with
the **Entity-Relationship (ER) model**: the notation this course, and the vast majority of
real database design work, uses to capture "what are the things, and how do they connect?"
before a single table is created. Every ER diagram you draw for the rest of this course, and
every one your future job will ask you to review, is built from exactly the handful of
building blocks introduced here — get the vocabulary precise now, because two of its terms
(cardinality and participation) are very easy to mix up, and mixing them up produces designs
that look right but enforce the wrong business rules.

We continue the property rental agency world from Lectures 5–11, and introduce two new
entity types — `PrivateOwner` and `Room` — purely to illustrate concepts this lecture needs.

## In This Lecture

- Entity types and entity occurrences
- Relationship types and relationship occurrences
- The five attribute categories: simple, composite, single-valued, multi-valued, and derived
- Strong entity types vs. weak entity types, and how a weak entity's key differs from a
  composite key
- Attributes that belong to a relationship itself, not to either participating entity
- **Structural constraints**: how cardinality and participation combine to fully constrain a
  relationship
- **Cardinality constraints** — 1:1, 1:N, and M:N — and how to read them off a diagram
- **Participation constraints** — mandatory (total) vs. optional (partial) — and why they are
  a genuinely different constraint from cardinality, not a restatement of it

## Introduction to the ER Model

The **Entity-Relationship model** represents an organization's data as **entities** (the
things worth tracking), **relationships** (meaningful associations between those things),
and **attributes** (properties of either). It was introduced by Peter Chen in 1976
specifically to give conceptual modeling — Lecture 11's top level — a precise, drawable
notation that business stakeholders and database designers could both read.

<div class="db-diagram" markdown>
<p class="db-diagram-label">An entity type — the basic building block</p>
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

## Entity Types

An **entity type** is a group of objects with the same properties, which the organization
has decided are significant enough to track independently — `Staff`, `Branch`, and
`PropertyForRent` are all entity types in the rental agency's world. An **entity occurrence**
(sometimes "entity instance") is one uniquely identifiable member of an entity type — the
specific staff member `SL21, John White` is one occurrence of the `Staff` entity type.

!!! note "Entity type vs. relation — same box, different lifecycle"
    An entity type looks a lot like the relation it will eventually become (Lecture 11's
    mapping), and often shares its name, but the two live at different levels: the entity
    type `Branch` is a conceptual, technology-free idea that exists the moment the business
    decides branches matter; the `Branch` *relation* is what Lecture 11 called the logical
    mapping of that idea, complete with a chosen primary key and (eventually) concrete data
    types. Confusing the two is harmless in casual conversation, but keep them distinct when
    reasoning about *why* a design looks the way it does.

## Relationship Types

A **relationship type** is a meaningful association among entity types. A **relationship
occurrence** is one specific, uniquely identifiable association involving exactly one
occurrence from each participating entity type — "`SL21` works at `B005`" is one occurrence
of the `Has` relationship type between `Staff` and `Branch`.

Most relationships in this course are **binary** — they connect exactly two entity types,
like `Has` connecting `Branch` and `Staff`. A relationship connecting an entity type to
*itself* is called **recursive** (or **unary**); a relationship connecting three entity
types at once is **ternary**. These are less common but do occur — "a `Staff` member
`Supervises` another `Staff` member" is a classic recursive relationship, since both
participating occurrences come from the same entity type, `Staff`.

## Attributes

An **attribute** is a property of an entity type (or, as shown later, of a relationship
type). Every attribute falls into categories along two independent dimensions — how
divisible its value is, and how many values it can hold per occurrence — plus one further
category for values that aren't stored at all, only computed.

<div class="db-diagram" markdown>
<p class="db-diagram-label">PrivateOwner — an entity type showing every attribute category</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">PrivateOwner</div>
<ul class="db-entity-attrs">
<li class="db-pk">ownerNo</li>
<li>name</li>
<li>address</li>
<li class="db-multi">telNo</li>
<li>numberOfProperties (derived)</li>
</ul>
</div>
</div>
</div>

- **Simple (atomic) attribute** — cannot be meaningfully subdivided further. `ownerNo` is
  simple: splitting it into pieces produces nothing individually useful.
- **Composite attribute** — *can* be divided into smaller sub-parts that are each meaningful
  on their own. `name` is composite (first name, last name); `address` is composite (street,
  city, postcode) — exactly the three columns `Branch` has always had since Lecture 5, now
  named as what they conceptually are: pieces of one composite `address` attribute.
- **Single-valued attribute** — holds exactly one value per entity occurrence. `ownerNo` is
  single-valued: one owner has exactly one owner number.
- **Multi-valued attribute** — can hold *more than one* value per occurrence. `telNo` is
  multi-valued if an owner may list several phone numbers; Chen's notation marks this with
  curly braces, `telNo {}`, which is exactly the marker this course's `.db-multi` diagrams
  render automatically, as shown above.
- **Derived attribute** — its value is *computed* from other attributes rather than stored
  directly. `numberOfProperties` is derived: it's always just `COUNT` of the matching rows
  in `PropertyForRent` (Lecture 9's aggregate operator, ℱ, is precisely how you'd compute
  it), so storing it separately would create exactly the kind of redundancy Lecture 11
  warned about — it can go stale the moment a property is added or removed without the
  derived value being recalculated.

!!! warning "A multi-valued attribute cannot be stored as one column"
    Recall Lecture 5's atomicity rule: a relation's attribute must hold a single, indivisible
    value. `telNo {}` violates that the moment an owner has two phone numbers — which is
    exactly why mapping a multi-valued attribute to the relational model (Lecture 11) does
    *not* produce one column, but a whole new relation, `OwnerTelNo(ownerNo, telNo)`, with
    one row per phone number. The ER diagram is allowed to say "multi-valued"; the relational
    schema it maps to never is.

## Strong and Weak Entity Types

Every entity type introduced so far — `Branch`, `Staff`, `PropertyForRent`, `PrivateOwner` —
is a **strong entity type**: it has independent existence, and its own attribute (or
attribute set) is, by itself, enough to uniquely identify every occurrence. `Branch` doesn't
need any other entity type to exist or to be identified.

A **weak entity type** (also called a *dependent* entity type) is different in both
respects: its existence *depends* on some other entity type (its **owner** or **identifying**
entity type), and its own key attribute is only a **partial key** — unique *within* one
owner occurrence, but not necessarily unique across the whole entity type. Introduce `Room`
as a weak entity, dependent on `PropertyForRent`:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Room is a weak entity — it cannot exist without a PropertyForRent</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">PropertyForRent</div>
<ul class="db-entity-attrs">
<li class="db-pk">propertyNo</li>
<li>street</li>
<li>type</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Has</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity-weak" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Room</div>
<ul class="db-entity-attrs">
<li class="db-pk">roomNo</li>
<li>roomType</li>
<li>roomSize</li>
<li class="db-fk">propertyNo</li>
</ul>
</div>
</div>
</div>
</div>

`roomNo` values like `1`, `2`, `3` repeat across *every* property — they only distinguish
rooms *within* one property. `Room`'s true, fully-unique identifier is the **composite**
`(propertyNo, roomNo)`: the owner entity's key, plus the weak entity's own partial key. If
`PropertyForRent` `PA14` is deleted, every `Room` occurrence belonging to it must be deleted
too — that existence dependency is the defining feature of a weak entity, and it's why a
weak entity is drawn with a double-bordered box.

!!! warning "Don't confuse a weak entity's partial key with an ordinary composite key"
    Lecture 5 already showed a composite primary key: `Viewing(`<u>`clientNo, propertyNo`</u>`,
    viewDate, comment)`. That composite key combines the keys of *two independent, strong*
    entities (`Client` and `PropertyForRent`) meeting in an M:N relationship — `Viewing`
    itself is *not* a weak entity; both `Client` and `PropertyForRent` exist perfectly well
    without it. `Room`'s key is a different situation entirely: `roomNo` alone identifies
    nothing on its own, and `Room` cannot exist without its one specific owning
    `PropertyForRent`. Same-looking composite key, structurally different reason for it —
    this distinction is a frequent source of ER modeling mistakes, so check *which* case
    you're in before drawing the double border.

## Attributes on Relationships

Attributes don't only belong to entity types — a relationship type can carry its own
attributes, describing a fact that only makes sense for the *pairing*, not for either
participant alone. The rental agency's `Viewing` relationship, connecting `Client` and
`PropertyForRent`, is the running example: *when* a client viewed a property, and any
comment they left, describe the specific viewing event, not the client and not the property
in isolation.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Client and PropertyForRent, related by Views (an M:N relationship)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Client</div>
<ul class="db-entity-attrs">
<li class="db-pk">clientNo</li>
<li>name</li>
<li>prefType</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Views</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">M</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">PropertyForRent</div>
<ul class="db-entity-attrs">
<li class="db-pk">propertyNo</li>
<li>street</li>
<li>type</li>
</ul>
</div>
</div>
</div>

`Views` itself carries two attributes:

| Attribute of Views | Meaning |
|---|---|
| `viewDate` | The date this specific client viewed this specific property |
| `comment` | Feedback left after that specific viewing |

Neither attribute belongs to `Client` (a client has many `viewDate`s, one per property
viewed) nor to `PropertyForRent` (a property has many `viewDate`s, one per client who viewed
it) — each only makes sense attached to one specific *pairing*. This is precisely why, when
an M:N relationship carries its own attributes, mapping it to the relational model
(Lecture 11) always produces a brand-new relation for the relationship itself — exactly the
`Viewing(clientNo, propertyNo, viewDate, comment)` relation Lecture 5 already introduced.
The conceptual relationship attribute and the eventual relation's non-key columns are the
same information, one level apart.

## Structural Constraints

Drawing `M` and `N` next to the `Views` diamond above communicates *how many* occurrences
can pair up — but it says nothing about whether pairing up is *required*. A complete
description of a relationship's shape needs **both** pieces, together called its
**structural constraints**, usually written as a `(min, max)` pair for each participating
entity type:

- **max** — the maximum number of relationship occurrences an entity occurrence can
  participate in. This is what **cardinality constraints** describe.
- **min** — the minimum number of relationship occurrences an entity occurrence *must*
  participate in (0 or 1, in almost every practical case). This is what **participation
  constraints** describe.

The next two sections take each half in turn — treat them as genuinely separate questions
about a relationship, because a common mistake is to assume "1:N" already implies mandatory
participation on the "1" side. It does not; the two constraints are independent.

## Cardinality Constraints

**Cardinality** describes the *maximum* number of relationship occurrences an entity may
participate in — the `M`/`N`/`1` labels you've already seen throughout this course. There
are three shapes, all binary relationships, all already familiar from the rental agency's
domain.

### One-to-One (1:1)

Every occurrence on each side is associated with **at most one** occurrence on the other
side. A `Staff` member manages at most one `Branch`, and a `Branch` is managed by at most one
`Staff` member:

<div class="db-diagram" markdown>
<p class="db-diagram-label">1:1 relationship — Staff Manages Branch</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs">
<li class="db-pk">staffNo</li>
<li>name</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Manages</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">1</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs">
<li class="db-pk">branchNo</li>
<li>street</li>
</ul>
</div>
</div>
</div>

### One-to-Many (1:N)

One occurrence on one side can be associated with **many** occurrences on the other, but
each of those many is associated with only **one** occurrence back. One `Branch` employs
many `Staff`, but each `Staff` member works at exactly one `Branch`:

<div class="db-diagram" markdown>
<p class="db-diagram-label">1:N relationship — Branch Has Staff</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs">
<li class="db-pk">branchNo</li>
<li>street</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Has</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs">
<li class="db-pk">staffNo</li>
<li>name</li>
<li class="db-fk">branchNo</li>
</ul>
</div>
</div>
</div>

### Many-to-Many (M:N)

Occurrences on **either** side can be associated with many occurrences on the other. Many
`Client`s can view many `PropertyForRent` listings, and each property can be viewed by many
different clients — the `Views` relationship shown earlier under "Attributes on
Relationships" is exactly this case, with badges `M` and `N` rather than `1` and `N`.

!!! tip "Reading cardinality off a diagram: 'look across', not 'look down'"
    To read the cardinality on the `Staff` side of `Branch`–`Has`–`Staff`, look at the badge
    drawn *next to Staff* (`N`) — it answers "how many `Staff` occurrences can one `Branch`
    occurrence connect to?" It is easy to accidentally read the wrong badge; always ask "for
    *one* occurrence of the entity on the *other* side, how many occurrences of *this* side
    can it relate to?"

## Participation Constraints

**Participation** describes whether an entity occurrence is *required* to take part in a
relationship at all — the **min** half of the structural constraint. There are exactly two
possibilities:

- **Mandatory (total) participation** — every occurrence of the entity type *must* appear in
  at least one occurrence of the relationship; `min = 1` (occasionally higher). Drawn, in
  formal Chen-style diagrams, with a double line from entity to relationship.
- **Optional (partial) participation** — an occurrence of the entity type is allowed to
  appear in *zero* occurrences of the relationship; `min = 0`. Drawn with a single line.

Revisit `Branch`–`Has`–`Staff` with participation now made explicit, one side mandatory and
the other optional:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Participation: Staff is mandatory in Has (1,1); Branch is optional (0,*)</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs">
<li class="db-pk">branchNo</li>
<li>street</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Has</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs">
<li class="db-pk">staffNo</li>
<li>name</li>
<li class="db-fk">branchNo</li>
</ul>
</div>
</div>
</div>

- **`Staff`'s participation is mandatory: `(1,1)`.** Every staff member must work at exactly
  one branch — `Staff.branchNo` (Lecture 5's foreign key) is never `NULL`. A staff row that
  belongs to no branch at all is not a valid business fact in this design.
- **`Branch`'s participation is optional: `(0,*)`.** A newly opened branch may legitimately
  have zero staff assigned yet — `Branch` does not require even one matching `Staff` row to
  be a valid occurrence.

!!! warning "Cardinality and participation are independent — don't conflate them"
    It is tempting to read "1:N" and assume the "1" side is automatically mandatory. It is
    not. `Staff`'s cardinality on this relationship (its badge reads `1`, meaning each branch
    connects to at most... no — reread carefully: the `1` badge sits next to `Branch`,
    meaning *one branch* per staff member, and separately, `Staff`'s *participation* is
    mandatory. These are two separate questions about two separate things: cardinality asks
    "how many can there be?" (the `1`/`N`/`M` badges); participation asks "must there be at
    least one?" (mandatory vs. optional). A relationship needs *both* answered, for *each*
    side, to be fully specified — that's exactly why they're both listed together as one
    `(min, max)` pair.

## Key Takeaways

- The **ER model** represents an organization's data as **entity types** (things),
  **relationship types** (associations between things), and **attributes** (properties) —
  the standard notation for Lecture 11's conceptual level.
- Attributes divide along two axes plus one extra category: **simple vs. composite**
  (divisible or not), **single-valued vs. multi-valued** (one value or several), and
  **derived** (computed, never stored).
- A **strong entity type** has independent existence and a key that identifies it alone; a
  **weak entity type** depends on an owner entity and has only a **partial key**, unique
  only in combination with the owner's key — a genuinely different situation from an
  ordinary composite key shared by two independent strong entities.
- A relationship type can carry its own **attributes** when a fact belongs to the *pairing*,
  not to either participant — exactly why an M:N relationship with attributes maps to its
  own relation (Lecture 11), such as `Viewing(clientNo, propertyNo, viewDate, comment)`.
- **Structural constraints** combine two independent halves: **cardinality** (the maximum —
  1:1, 1:N, or M:N) and **participation** (the minimum — mandatory/total vs.
  optional/partial), usually written together as a `(min, max)` pair per entity per
  relationship.
- Cardinality answers "how many can there be?"; participation answers "must there be at
  least one?" — treating these as the same question is one of the most common ER modeling
  mistakes, and this lecture's `Branch`–`Has`–`Staff` example was built specifically to make
  the two answers differ (mandatory `Staff`, optional `Branch`) so the distinction is
  unmissable.

Every relation you've queried since Lecture 5, and every relationship you've just learned to
draw, will get formally mapped end-to-end once this unit covers the complete ER-to-relational
mapping algorithm and the Enhanced ER model's extensions (specialization, generalization,
aggregation) in the lectures that follow.
