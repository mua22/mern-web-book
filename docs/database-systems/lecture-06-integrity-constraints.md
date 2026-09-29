---
title: "6. Integrity Constraints"
tags:
  - CSC270
  - Integrity Constraints
  - Referential Integrity
  - Relational Model
---

# 6. Integrity Constraints

A schema tells the DBMS *what shape* the data must take — which attributes exist, which
domains they draw from. It says nothing, on its own, about whether a particular row makes
*sense*. Nothing in [Lecture 5](lecture-05-the-relational-model.md)'s schema stops someone
from inserting a staff member with no ID, a salary of −5,000, or a property assigned to a
branch that doesn't exist. **Integrity constraints** are the rules that close that gap —
and, crucially, they are rules the *DBMS itself* enforces on every write, not rules your
application code has to remember to check. This lecture covers the four constraint
categories every relational database relies on, and how a DBMS actually enforces the one
that causes the most real-world design decisions: referential integrity.

We continue with the property rental agency from Lecture 5, extending it with two more
relations — `PropertyForRent` and `PrivateOwner` — so there is enough cross-referencing
structure to make referential integrity concrete.

## In This Lecture

- Domain constraints: keeping individual values legal
- Entity integrity: why no primary key component may ever be `NULL`
- Referential integrity: keeping foreign keys honest
- General constraints: encoding business rules the model doesn't know about
- How these four categories fit together as "integrity constraints" collectively
- How a DBMS actually *enforces* referential integrity — including what happens on delete
  and update: `CASCADE`, `RESTRICT`, `SET NULL`

## The Extended Schema

<div class="db-relation" markdown>
<div class="db-relation-name">PrivateOwner (<u>ownerNo</u>, name, telNo)</div>

| ownerNo | name | telNo |
|---|---|---|
| CO46 | Joe Keogh | 021-234-5678 |
| CO87 | Carol Farrel | 021-556-7890 |
| CO40 | Tina Murphy | 042-234-1122 |
| CO93 | Tony Shaw | 042-556-9988 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">PropertyForRent (<u>propertyNo</u>, street, city, type, rooms, rent, ownerNo, staffNo, branchNo)</div>

| propertyNo | street | city | type | rooms | rent | ownerNo | staffNo | branchNo |
|---|---|---|---|---|---|---|---|---|
| PA14 | 16 Holhead St | Lahore | House | 6 | 22000 | CO46 | SG14 | B003 |
| PL94 | 6 Lawrence St | Islamabad | Flat | 4 | 15000 | CO87 | SA9 | B007 |
| PG4 | 6 Lawrence St | Lahore | House | 5 | 35000 | CO40 | SG14 | B003 |
| PG36 | 2 Manor Rd | Lahore | Flat | 3 | 24500 | CO93 | SG37 | B003 |
| PG16 | 5 Novar Dr | Islamabad | House | 6 | 45000 | CO93 | SA9 | B007 |
| PG21 | 18 Dale Rd | Karachi | Flat | 4 | 28000 | CO87 | SL21 | B005 |

</div>

`PropertyForRent` carries **three** foreign keys at once — `ownerNo` into `PrivateOwner`,
`staffNo` into `Staff`, and `branchNo` into `Branch` — which makes it the perfect relation
for testing every integrity rule below.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three foreign keys converging on PropertyForRent</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">PrivateOwner</div>
<ul class="db-entity-attrs"><li class="db-pk">ownerNo</li><li>name</li><li>telNo</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">owns</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">PropertyForRent</div>
<ul class="db-entity-attrs">
<li class="db-pk">propertyNo</li>
<li>street</li>
<li>rent</li>
<li class="db-fk">ownerNo</li>
<li class="db-fk">staffNo</li>
<li class="db-fk">branchNo</li>
</ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">managed by</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>name</li><li class="db-fk">branchNo</li></ul>
</div>
</div>
</div>

## Domain Constraints

A **domain constraint** restricts the legal values of a single attribute to its declared
domain — the most basic integrity rule, and the one closest to a plain data type. `rooms`
must be a positive integer; `rent` must be a positive number; `type` must be one of a small
enumerated set (`House`, `Flat`) rather than any arbitrary string.

```text
CREATE TABLE PropertyForRent (
    propertyNo  VARCHAR(5)  NOT NULL,
    rooms       SMALLINT    NOT NULL CHECK (rooms > 0),
    rent        DECIMAL(8,2) NOT NULL CHECK (rent > 0),
    type        VARCHAR(5)  NOT NULL CHECK (type IN ('House', 'Flat')),
    ...
);
```

A row attempting `rooms = -2` or `type = 'Cabin'` is rejected outright by the DBMS before it
is ever stored — the constraint is checked at the *domain* level, independent of any other
row or table.

!!! note "Domain constraints vs. general constraints"
    A domain constraint only ever looks at **one value in isolation** against its declared
    domain. "Rent must be positive" is a domain constraint. "Rent must be at least 80% of
    the average rent for that property's city" needs to compare against *other rows* — that
    graduates to a **general constraint**, covered later in this lecture.

## Entity Integrity

**Entity integrity** states a single, absolute rule: **no attribute participating in a
relation's primary key may hold a `NULL` value.**

The reasoning is structural, not stylistic: a primary key's entire job is to uniquely
identify a tuple. `NULL` means "unknown" or "not applicable" — and if the very value meant
to identify a row is itself unknown, that row cannot reliably be distinguished from any
other row that is *also* missing its identifying value. A relation with two `NULL`-keyed
tuples has, in effect, lost the ability to tell them apart.

<div class="db-relation" markdown>
<div class="db-relation-name">Attempted insert into Staff — rejected by entity integrity</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| *(NULL)* | Zara Malik | Assistant | 11000 | B005 |

</div>

The DBMS refuses this row outright. This is precisely why `staffNo` is declared
`PRIMARY KEY` (which implies `NOT NULL` automatically in every mainstream SQL engine) rather
than merely `UNIQUE` — `UNIQUE` alone still permits `NULL`.

For a **composite** primary key, the rule is stricter than it might first appear: **every**
component attribute must be non-`NULL`, not just at least one. In `Viewing(`<u>`clientNo,
propertyNo`</u>`, viewDate, comment)` — introduced fully in Lecture 8 — a tuple with a known
`clientNo` but a `NULL` `propertyNo` still violates entity integrity, because the *pair*
`(clientNo, propertyNo)` is what identifies the tuple, and one missing half is enough to
break that.

!!! tip "Non-key attributes can still be NULL"
    Entity integrity says nothing about `Staff.position` or `PropertyForRent.rooms` being
    `NULL` — a newly hired staff member awaiting a title assignment, or a property whose
    room count hasn't been confirmed yet, may legitimately have `NULL` there. The rule is
    narrowly about the primary key, because *that's* the attribute whose entire purpose is
    identification.

## Referential Integrity

**Referential integrity** states that if a foreign key exists in a relation, its value must
either:

1. Match a candidate key value that **currently exists** in the referenced relation, or
2. Be **wholly `NULL`**.

Applied to `PropertyForRent.staffNo` referencing `Staff.staffNo`: every non-`NULL` value
appearing in the `staffNo` column of `PropertyForRent` must appear as some `staffNo` value in
`Staff`. A property is allowed to have *no* staff member assigned yet (`staffNo = NULL`), but
it is never allowed to claim an assignment to a staff member who doesn't exist.

<div class="db-relation" markdown>
<div class="db-relation-name">Attempted insert into PropertyForRent — rejected by referential integrity</div>

| propertyNo | street | city | type | rooms | rent | ownerNo | staffNo | branchNo |
|---|---|---|---|---|---|---|---|---|
| PG55 | 9 Castle Rd | Lahore | Flat | 3 | 19000 | CO46 | SX99 | B003 |

</div>

`SX99` does not appear anywhere in `Staff.staffNo` — no such employee exists — so this
insert is rejected. Contrast with a legal insert that simply leaves the assignment open:

<div class="db-relation" markdown>
<div class="db-relation-name">Accepted insert — foreign key left wholly NULL</div>

| propertyNo | street | city | type | rooms | rent | ownerNo | staffNo | branchNo |
|---|---|---|---|---|---|---|---|---|
| PG55 | 9 Castle Rd | Lahore | Flat | 3 | 19000 | CO46 | *(NULL)* | B003 |

</div>

This succeeds: `staffNo = NULL` doesn't claim any relationship at all, so there is nothing
to be inconsistent with.

!!! warning "Composite foreign keys must be NULL as a whole, or not at all"
    If a foreign key spans more than one attribute, "wholly NULL" means *every* component is
    `NULL` — a foreign key that is `NULL` in one column but has a real value in another is
    itself a referential integrity violation (this is sometimes distinguished as needing the
    foreign key to obey full participation rules; most textbooks, including Connolly &
    Begg, treat "partially NULL" composite foreign keys as disallowed).

**Self-referencing** foreign keys are a legal special case: a relation's foreign key can
reference *its own* primary key. `Branch(`<u>`branchNo`</u>`, street, city, postcode, mgrStaffNo)`
could hold `mgrStaffNo` as a foreign key into `Staff`, and `Staff` in turn already references
`Branch` — two relations can reference each other, and a relation can even reference itself
(an `Staff.supervisorStaffNo` column referencing `Staff.staffNo` to represent "who manages
whom" is the classic example).

## General Constraints

**General constraints** (sometimes called *business rules* or *semantic integrity
constraints*) are rules specific to an organization's data that go beyond domain, entity,
and referential integrity — the relational model has no built-in vocabulary for them, so
they must be stated and enforced explicitly.

Examples drawn from the rental agency:

- No member of staff can manage more than 100 properties at a time.
- A manager's salary must be greater than the salary of every assistant at the same branch.
- A property's rent must fall between PKR 5,000 and PKR 100,000.
- A member of staff cannot handle a viewing for a property they themselves manage under a
  conflict-of-interest policy.

```text
ALTER TABLE PropertyForRent
    ADD CONSTRAINT chk_rent_range CHECK (rent BETWEEN 5000 AND 100000);
```

Some general constraints (a simple `CHECK` on one table, like the rent range above) are easy
for the DBMS to enforce directly. Others ("a manager's salary exceeds every assistant's at
the same branch") compare across many rows and often end up enforced through triggers,
stored procedures, or application logic instead — but they remain integrity constraints
either way, because violating them makes the data wrong, not merely unusual.

## Integrity Constraints in Relational Databases, Together

<div class="db-diagram" markdown>
<p class="db-diagram-label">The four constraint categories, narrowest to broadest scope</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Domain constraint</span>
<span class="db-node-sub">One attribute's value against its declared domain — e.g. rent &gt; 0</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Entity integrity</span>
<span class="db-node-sub">No primary key component may be NULL</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Referential integrity</span>
<span class="db-node-sub">Every non-NULL foreign key value must match an existing referenced key</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">General constraint</span>
<span class="db-node-sub">Organization-specific business rule, spanning any number of attributes or rows</span>
</div>
</div>
</div>

All four exist for the same underlying reason: a relational database's usefulness depends
entirely on the guarantee that what's stored reflects reality. A query result is only
trustworthy if the DBMS refused every write that would have made it false.

## Enforcement of Integrity Constraints

Domain constraints and entity integrity are enforced the same way in essentially every
DBMS: the offending `INSERT` or `UPDATE` is rejected outright, with an error returned to the
caller. Referential integrity is more interesting, because a violation can be triggered from
**either side** of the relationship, and the DBMS needs a policy for each direction.

**On insert/update of the referencing table** (e.g., inserting into `PropertyForRent` with a
bad `staffNo`): always rejected, as shown above — there is no reasonable alternative.

**On delete or update of the referenced table's key** (e.g., deleting `Staff` row `SG14`,
who currently manages properties `PA14` and `PG4`) is where a DBMS offers a genuine policy
choice, declared per foreign key at schema design time:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Deleting a Staff row referenced by PropertyForRent.staffNo — three referential actions</p>
<div class="db-flow" markdown>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">RESTRICT (or NO ACTION)</span>
<span class="db-node-sub">Refuse the delete while any PropertyForRent row still references SG14</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">CASCADE</span>
<span class="db-node-sub">Delete SG14, then automatically delete every PropertyForRent row that referenced them</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">SET NULL</span>
<span class="db-node-sub">Delete SG14, then set staffNo to NULL on every property that referenced them</span>
</div>
</div>
</div>

- **`RESTRICT`** (equivalently `NO ACTION` in most engines) — the delete or key-changing
  update is refused as long as any referencing row still exists. This is the safest default:
  deleting `SG14` while `PA14` and `PG4` still list them as manager fails, forcing whoever
  issued the delete to deal with those properties first (reassign them, or delete them too).
- **`CASCADE`** — the DBMS automatically propagates the deletion: removing `SG14` from
  `Staff` also removes every `PropertyForRent` row whose `staffNo` was `SG14`. Powerful, and
  dangerous if applied where it shouldn't be — cascading a `Branch` deletion, for instance,
  could silently wipe out every `Staff` and `PropertyForRent` row tied to that branch in one
  statement.
- **`SET NULL`** — the referencing rows are kept, but their foreign key is cleared to
  `NULL`. Deleting `SG14` leaves `PA14` and `PG4` in place, now simply unassigned
  (`staffNo = NULL`) until a new staff member takes them over. This is only legal, of
  course, if the foreign key column is allowed to be `NULL` in the first place — a foreign
  key declared `NOT NULL` cannot use this option.

```text
CREATE TABLE PropertyForRent (
    ...
    staffNo   VARCHAR(5),
    branchNo  VARCHAR(4) NOT NULL,
    FOREIGN KEY (staffNo)  REFERENCES Staff(staffNo)  ON DELETE SET NULL,
    FOREIGN KEY (branchNo) REFERENCES Branch(branchNo) ON DELETE RESTRICT
);
```

Notice the two foreign keys above deliberately use *different* policies: losing the assigned
staff member is recoverable (the property just becomes unassigned), so `SET NULL` is
reasonable; but a property genuinely cannot exist without belonging to *some* branch, so
`branchNo` is `NOT NULL` and uses `RESTRICT` to force a deliberate decision (reassign the
properties, or delete them) before a branch can be removed. The same three options
(`RESTRICT`/`CASCADE`/`SET NULL`) apply symmetrically to updating a referenced primary key
value, not only to deleting it — an `ON UPDATE CASCADE` on `Branch.branchNo` would
automatically update every `Staff.branchNo` and `PropertyForRent.branchNo` that referenced
the old value, keeping them all pointed at the (renumbered) branch.

!!! tip "Choosing a referential action is a design decision, not a default"
    There is no universally correct choice between `RESTRICT`, `CASCADE`, and `SET NULL` —
    it depends entirely on what the relationship *means*. Ask: "if the referenced row
    disappears, does the referencing row still make sense on its own?" A `Viewing` record
    makes no sense without the `Client` who did the viewing (favor `CASCADE` or `RESTRICT`);
    a `PropertyForRent` row still makes sense without an assigned staff member (favor
    `SET NULL`). Getting this wrong is a common, expensive real-world bug — either silent
    data loss from an over-eager `CASCADE`, or a frustrating wall of `RESTRICT` errors when
    `SET NULL` would have been the sensible choice.

## Key Takeaways

- **Domain constraints** restrict a single attribute's value to its declared, legal domain.
- **Entity integrity**: no attribute that is part of a primary key — single or composite —
  may ever be `NULL`, because the primary key's job is identification.
- **Referential integrity**: every non-`NULL` foreign key value must match an existing
  candidate key value in the referenced relation; a foreign key may instead be wholly
  `NULL` to represent "no relationship yet."
- **General constraints** capture organization-specific business rules that the relational
  model has no built-in vocabulary for, and are enforced through `CHECK` constraints,
  triggers, or application logic depending on their complexity.
- Referential integrity is enforced differently depending on direction: inserts/updates on
  the referencing side that would break it are always rejected, but deletes/updates on the
  *referenced* side offer a policy choice — `RESTRICT`, `CASCADE`, or `SET NULL` — declared
  per foreign key and chosen based on what the relationship actually means.

With the model's structure (Lecture 5) and its correctness rules (this lecture) both in
place, [Lecture 7 — Relational Algebra: Unary and Set Operations](lecture-07-relational-algebra-unary-and-set-operations.md)
starts actually *querying* this data.
