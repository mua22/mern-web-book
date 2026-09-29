---
title: "13. ER Modeling: Issues and Problems"
tags:
  - CSC270
  - ER Modeling
  - Fan Traps
  - Database Design
---

# 13. ER Modeling: Issues and Problems

Drawing an ER diagram from a blank page looks mechanical once you've seen a few examples:
find the nouns, find the verbs, find the adjectives, draw some boxes and diamonds. In
practice it almost never goes that smoothly. Real requirements are written in ordinary
language by people who were not thinking about entities and attributes when they wrote
them, and the same real-world fact can often be modeled two or three *different* — and
each individually defensible — ways. This lecture is about the judgment calls a designer
actually has to make: when something should be an entity versus an attribute, how to spot
a relationship that's hiding extra structure, and two specific, well-documented traps —
**fan traps** and **chasm traps** — that produce ER diagrams which *look* correct but quietly
lose information the business needs back.

We stay with the property rental agency running through this course (`Branch`, `Staff`,
`PropertyForRent`, `PrivateOwner`, `Client`, `Viewing` — introduced in
[Lecture 5](lecture-05-the-relational-model.md) and extended in
[Lecture 6](lecture-06-integrity-constraints.md)) so every issue below has a concrete,
already-familiar schema to point at.

## In This Lecture

- Choosing entity types versus attributes — the single most common beginner confusion
- Choosing relationship types, and spotting one that's hiding a missing entity
- Choosing attributes: simple, composite, single-valued, multi-valued, derived
- Identifying keys when more than one candidate key exists
- Naming conventions that keep a growing schema readable
- Handling complex relationships: ternary relationships, and relationships with their own
  attributes
- Structural constraints revisited, with the full multiplicity notation
- Avoiding redundancy in a design
- A first look at generalization and specialization (expanded fully in
  [Lecture 14](lecture-14-the-enhanced-er-model.md))
- Two classic, named ER modeling errors: **fan traps** and **chasm traps**

## Choosing Entity Types vs. Attributes

This is the confusion almost every student runs into first: *should "position" be an
attribute of `Staff`, or should `Position` be its own entity type?* Both diagrams below are
syntactically valid ER diagrams. Only one of them is right for a given set of requirements.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Option A — position as a plain attribute</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>name</li><li>position</li><li>salary</li></ul>
</div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Option B — Position promoted to its own entity type</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>name</li><li class="db-fk">positionCode</li><li>salary</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Holds</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">N</span><span class="db-badge db-badge-orange">1</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Position</div>
<ul class="db-entity-attrs"><li class="db-pk">positionCode</li><li>title</li><li>payScaleMin</li><li>payScaleMax</li></ul>
</div>
</div>
</div>

Four questions decide it, and they generalize to *every* attribute-vs-entity decision you'll
ever face:

1. **Does the candidate have attributes of its own that the business cares about?** If
   `Position` only ever needs a short label (`"Manager"`, `"Supervisor"`, `"Assistant"`),
   Option A is fine. If the business also tracks a pay-scale range and a department per
   position, those facts have nowhere to live in Option A without repeating them on every
   `Staff` row that shares a position — that repetition is the signal to promote it.
2. **Is it independently meaningful — does it participate in relationships with *other*
   entity types**, not just `Staff`? If `PositionRequiresCertification(positionCode,
   certificationId)` needs to exist, `Position` has to be an entity so that relationship has
   somewhere to attach.
3. **Can more than one instance apply to the same real-world thing?** An attribute holds
   exactly one value (or, if multi-valued, a small repeated set) per entity occurrence — if
   the "thing" genuinely needs its own identity, lifecycle, and history independent of the
   entity currently pointing at it, it is an entity.
4. **Would leaving it as an attribute duplicate the same fact across many rows?** This is
   the practical test: if updating "Manager" everywhere it appears in the pay-scale table
   means touching dozens of `Staff` rows instead of one `Position` row, the design has a
   redundancy problem baked in from the entity-vs-attribute decision itself.

!!! tip "The general rule of thumb"
    If a candidate needs its **own attributes**, its **own relationships**, or is naturally
    **shared/referenced by many occurrences** of another entity, model it as an entity
    type. If it is a single, atomic (or small, fixed multi-valued) fact that only ever
    describes *one* entity and has no independent existence, keep it as an attribute.

The same reasoning runs in both directions. `city` on `Branch` looks like a plain attribute
— and for a small agency, it is. But if the business later needs to store a city's
population, its regional tax rate, or track *multiple* branches per city as a reporting
unit, `City` graduates into its own entity type with `Branch` referencing it by foreign key.
There is no permanently correct answer independent of the requirements — the decision has
to be re-checked whenever the requirements grow.

## Choosing Relationship Types

A relationship type is usually named from a **verb phrase** connecting two entity types
(`Staff` *Manages* `PropertyForRent`, `PrivateOwner` *Owns* `PropertyForRent`). Three
recurring issues show up when choosing them:

- **Redundant naming direction.** Name the relationship once, in one clear direction
  (`Staff Manages PropertyForRent`, not also `PropertyForRent IsManagedBy Staff` as a
  *second*, separate relationship type — that's the same fact modeled twice, covered under
  Redundancy below).
- **A relationship that's secretly hiding an entity.** If a "relationship" between two
  entity types needs its own attributes that describe neither participant individually, that
  is usually a sign the relationship has enough substance to deserve its own identity — see
  *Handling Complex Relationships* below.
- **The wrong degree.** A relationship connects two entity types (**binary**, by far the
  most common), one entity type to itself (**unary** / recursive — e.g. `Staff Supervises
  Staff`), or three or more entity types at once (**ternary** and higher, covered next). A
  common mistake is force-fitting what is genuinely a three-way fact into two binary
  relationships, which — as the fan trap section shows — can silently lose information.

## Choosing Attributes

Once an entity type is settled, each of its attributes needs its own small classification,
because the classification changes how it's eventually mapped to a relational schema
(fully worked out in [Lecture 16](lecture-16-mapping-eer-models-to-relational-schemas.md)):

| Kind | Meaning | Example on `Client` |
|---|---|---|
| **Simple** | Cannot be meaningfully broken down further | `telNo` |
| **Composite** | Made of sub-parts the business sometimes needs separately | `name` → `firstName` + `lastName` |
| **Single-valued** | Exactly one value per entity occurrence | `dateRegistered` |
| **Multi-valued** | Can legitimately hold several values at once | `preferredContactTimes {}` |
| **Derived** | Computed from other stored attributes, not stored itself | `age`, derived from `dateOfBirth` |

<div class="db-diagram" markdown>
<p class="db-diagram-label">Client — mixing attribute kinds on one entity</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Client</div>
<ul class="db-entity-attrs">
<li class="db-pk">clientNo</li>
<li>firstName</li>
<li>lastName</li>
<li>telNo</li>
<li class="db-multi">preferredContactTimes</li>
<li>dateOfBirth</li>
</ul>
</div>
</div>
</div>

!!! note "Derived attributes usually aren't drawn or stored at all"
    `age` is real information the business cares about, but storing it directly is a design
    mistake — it goes stale the moment time passes without an update. Most ER diagrams either
    omit derived attributes entirely (computing `age` from `dateOfBirth` in a query instead)
    or mark them distinctly precisely so nobody accidentally maps them to a stored column
    during Lecture 16's mapping step.

## Identifying Keys

An entity type can have more than one attribute (or attribute combination) capable of
uniquely identifying it — each one is a **candidate key**. `Staff` might have both `staffNo`
(the internal ID) and `cnic` (national ID number) as candidate keys, each independently
unique. Choosing which candidate key becomes the **primary key** follows practical
guidelines, not a hard rule:

- Prefer the candidate key that **never changes** over an entity's lifetime — `cnic` is
  stable, but a *badge number* that gets reissued on transfer is not.
- Prefer the **shorter, simpler** candidate key when several qualify — a single-attribute
  key over a composite one, all else equal.
- Prefer a key with **no `NULL`-able components**, ever — a candidate key that can go
  unknown for some occurrences (an unconfirmed `email` at registration time, say) cannot
  become the primary key, because entity integrity ([Lecture 6](lecture-06-integrity-constraints.md))
  forbids `NULL` primary key components.
- The **remaining, unchosen candidate keys don't disappear** — they stay in the schema as
  *alternate keys*, usually enforced with a `UNIQUE` constraint rather than `PRIMARY KEY`.

## Naming Conventions

A schema with a dozen entity types and fifty attributes is only as usable as its names.
Two failure modes recur constantly in real projects:

- **Synonyms** — the same real-world concept named differently in different places
  (`clientNo` in one table, `custId` in another, both meaning "client identifier"). This
  makes every join and every new developer's onboarding harder than it needs to be.
- **Homonyms** — the *same* name reused for two genuinely different concepts (`type` meaning
  "House or Flat" on `PropertyForRent`, but `type` meaning "Full-time or Part-time" on
  `Staff`). Reading a query in isolation, `type` gives no clue which one it is.

!!! tip "A practical naming standard, applied consistently across this course's schema"
    Entity type names: singular, `PascalCase` (`Staff`, not `staffs`). Attribute names:
    `camelCase`, prefixed with a short recognizable stem where it disambiguates
    (`staffNo`, `branchNo`, `propertyNo` — every foreign key carries the *same* name as the
    primary key it references, exactly as `PropertyForRent.staffNo` already does in
    Lecture 6, which is precisely what makes a foreign key immediately recognizable on
    sight).

## Handling Complex Relationships

### Ternary Relationships

A **ternary relationship** connects three entity types in a single relationship, and it is
*not* generally the same thing as three separate binary relationships between the same
pairs — collapsing a genuine three-way fact into pairwise binary relationships can lose the
combination information entirely (this is exactly the mechanism behind the fan trap,
covered below).

Consider `Registers`: a `Client` registers interest with a specific `Staff` member, *at* a
specific `Branch`, on a given date. The fact being recorded is the *combination* of all
three — which staff member, at which branch, handled which client's registration.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Registers — a ternary relationship with its own attribute</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Client</div>
<ul class="db-entity-attrs"><li class="db-pk">clientNo</li><li>firstName</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Registers</div>
<div class="db-relate-line"></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>name</li></ul>
</div>
</div>
<p class="db-diagram-label" style="margin-top:0.8rem;">...also connected to a third participant</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs"><li class="db-pk">branchNo</li><li>city</li></ul>
</div>
</div>
</div>

The relationship itself carries an attribute, `dateRegistered`, that belongs to the
*combination* of `(Client, Staff, Branch)` — not to any single participant. Two binary
relationships (`Client Registers-With Staff` and `Client Registers-At Branch`) would let you
record *that* a client registered with some staff member and *that* they registered at some
branch, but would no longer guarantee those two facts describe the *same* registration
event if a client interacts with the agency more than once.

### Relationships with Attributes

`Viewing`, already used since [Lecture 6](lecture-06-integrity-constraints.md), is the
clearest example already in this course's schema: a `Client` views a `PropertyForRent`, and
the relationship itself carries `viewDate` and `comment` — facts about *that specific
viewing event*, not about the client or the property in isolation. When a relationship needs
its own attributes like this, it is mapped to its own relation during Lecture 16, exactly the
way `Viewing(`<u>`clientNo, propertyNo`</u>`, viewDate, comment)` already appears in this
course's schema.

## Structural Constraints Revisited

[Lecture 12](lecture-12-the-entity-relationship-model.md) introduced cardinality (`1`, `N`)
and participation (mandatory/optional) as two separate ideas. Combined, they're usually
written as a **multiplicity** pair `(min, max)`:

| Multiplicity | Meaning | DreamHome example |
|---|---|---|
| `(0,1)` | Optional, at most one | A `PropertyForRent` may have `staffNo = NULL` — 0 or 1 assigned staff member |
| `(1,1)` | Mandatory, exactly one | Every `PropertyForRent` must belong to exactly one `Branch` |
| `(0,*)` | Optional, many allowed | A `Staff` member may currently manage zero properties |
| `(1,*)` | Mandatory, at least one, many allowed | A `PrivateOwner` in the system must own at least one property |

<div class="db-diagram" markdown>
<p class="db-diagram-label">Multiplicity marked on both ends of Owns</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">PrivateOwner</div>
<ul class="db-entity-attrs"><li class="db-pk">ownerNo</li><li>name</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Owns</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">(1,*)</span><span class="db-badge db-badge-orange">(1,1)</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">PropertyForRent</div>
<ul class="db-entity-attrs"><li class="db-pk">propertyNo</li><li>street</li></ul>
</div>
</div>
</div>

Reading this diagram: each `PrivateOwner` owns **(1,*)** properties — at least one, since an
owner with zero properties has no reason to be in the database — while each
`PropertyForRent` has **(1,1)** owner: exactly one, always, never optional. Getting these two
numbers wrong in either direction is a real, common design bug — writing `(0,1)` on the
owner side, for instance, would incorrectly claim a property can legally have no owner at
all.

## Avoiding Redundancy

A relationship is **redundant** if it conveys a fact that is already fully derivable by
following a *different* path already present in the model. The test — sometimes called the
"look-across rule" applied transitively — is: *if I delete this relationship, can I still
answer the same question by tracing through other relationships?* If yes, it was redundant.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Redundant: PropertyForRent LocatedIn Branch duplicates a path that already exists</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">PrivateOwner</div>
<ul class="db-entity-attrs"><li class="db-pk">ownerNo</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Owns</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">PropertyForRent</div>
<ul class="db-entity-attrs"><li class="db-pk">propertyNo</li><li class="db-fk">branchNo</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Registers (redundant)</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-teal">1</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Branch</div>
<ul class="db-entity-attrs"><li class="db-pk">branchNo</li></ul>
</div>
</div>
</div>

If `PropertyForRent` already carries `branchNo` directly, and separately `PrivateOwner
Registers-With Branch` while `PrivateOwner Owns PropertyForRent`, then "which branch handles
property P's paperwork" can already be answered straight from `PropertyForRent.branchNo` —
a third relationship claiming owners register with branches (when every owner's branch is
already implied by the properties they own) adds nothing but a second, possibly
inconsistent, place for the same fact to live. The fix is simply to delete the redundant
relationship, not to keep both "in sync" by hand.

!!! warning "Redundancy is not the same as a normal, useful relationship"
    Two relationships that happen to connect overlapping entity types are not automatically
    redundant — `Staff Manages PropertyForRent` and `PrivateOwner Owns PropertyForRent` both
    involve `PropertyForRent`, but neither is derivable from the other; a property's manager
    and its owner are independent facts. Redundancy specifically means the *same* fact is
    representable two different ways.

## A First Taste of Generalization and Specialization

Some entity types are naturally special cases of a broader one. `Staff` at a growing agency
might need to distinguish `SalesPersonnel` (who need `salesArea` and `carAllowance`) from
`Manager` (who needs `bonus`) — both are still `Staff`, sharing `staffNo`, `name`, `position`,
and `salary`, but each also needs attributes the *other* doesn't.

<div class="db-diagram" markdown>
<p class="db-diagram-label">A preview — full treatment in Lecture 14</p>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff (superclass)</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>name</li><li>position</li><li>salary</li></ul>
</div>
<div class="db-grid-2" markdown>
<div class="db-entity" markdown><div class="db-entity-name">SalesPersonnel</div><ul class="db-entity-attrs"><li>salesArea</li><li>carAllowance</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Manager</div><ul class="db-entity-attrs"><li>bonus</li></ul></div>
</div>
</div>

Plain ER modeling, as covered so far, has no clean way to express "every `SalesPersonnel`
*is* a `Staff` member, automatically inheriting everything `Staff` has." Forcing it into
plain ER means either cramming `salesArea`, `carAllowance`, and `bonus` all onto one `Staff`
entity (leaving most of them `NULL` for most rows — a strong hint something's wrong, exactly
per the entity-vs-attribute test earlier in this lecture) or duplicating the shared attributes
across two unrelated entity types. Neither is satisfying. This gap is precisely what the
**Enhanced ER Model** — specialization, generalization, and inheritance — exists to close,
and it is the entire subject of [Lecture 14](lecture-14-the-enhanced-er-model.md).

## Common ER Modeling Errors: Fan Traps and Chasm Traps

Connolly & Begg give two specific, named errors a special place in ER modeling literature
because both produce a diagram that is *structurally valid* — nothing about it looks wrong
on paper — yet silently makes some legitimate business question unanswerable.

!!! warning "Fan trap: two one-to-many relationships fanning out from the same entity"
    A **fan trap** occurs when a model has two or more `1:N` relationships radiating out
    from a *single* entity type, and a question needs to relate occurrences on the "many"
    side of one relationship to occurrences on the "many" side of the other. The diagram
    below looks perfectly reasonable — until you try to answer "which properties does staff
    member SG14 manage?"

    <div class="db-diagram" markdown>
    <p class="db-diagram-label">Fan trap: Branch is the "one" side of two unrelated 1:N relationships</p>
    <div class="db-erd" markdown>
    <div class="db-entity" markdown><div class="db-entity-name">Staff</div><ul class="db-entity-attrs"><li class="db-pk">staffNo</li></ul></div>
    <div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Has</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-teal">1</span></div></div>
    <div class="db-entity" markdown><div class="db-entity-name">Branch</div><ul class="db-entity-attrs"><li class="db-pk">branchNo</li></ul></div>
    <div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Has</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">N</span></div></div>
    <div class="db-entity" markdown><div class="db-entity-name">PropertyForRent</div><ul class="db-entity-attrs"><li class="db-pk">propertyNo</li></ul></div>
    </div>
    </div>

    Knowing that branch B003 has staff `{SG14, SG37}` and properties `{PA14, PG4, PG36}`
    doesn't tell you *which* staff member manages *which* property — that information simply
    doesn't exist anywhere in this diagram. The fix is exactly what
    [Lecture 6](lecture-06-integrity-constraints.md) already does: add a **direct**
    relationship, `Staff Manages PropertyForRent`, so `PropertyForRent.staffNo` points
    straight at the responsible staff member instead of forcing a guess through `Branch`.

!!! warning "Chasm trap: a path exists on paper, but breaks for some occurrences"
    A **chasm trap** occurs when a model implies a relationship between entity types along a
    path that includes an *optional* (partial-participation) relationship — so the path
    exists for *some* occurrences but is genuinely missing for others.

    <div class="db-diagram" markdown>
    <p class="db-diagram-label">Chasm trap: some branches have no staff currently overseeing any property</p>
    <div class="db-erd" markdown>
    <div class="db-entity" markdown><div class="db-entity-name">Branch</div><ul class="db-entity-attrs"><li class="db-pk">branchNo</li></ul></div>
    <div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Has</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">1</span><span class="db-badge db-badge-orange">(0,N)</span></div></div>
    <div class="db-entity" markdown><div class="db-entity-name">Staff</div><ul class="db-entity-attrs"><li class="db-pk">staffNo</li></ul></div>
    <div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">Oversees</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-teal">(0,N)</span><span class="db-badge db-badge-orange">1</span></div></div>
    <div class="db-entity" markdown><div class="db-entity-name">PropertyForRent</div><ul class="db-entity-attrs"><li class="db-pk">propertyNo</li></ul></div>
    </div>
    </div>

    "Which properties belong to Branch B009?" cannot always be answered by walking
    `Branch → Staff → PropertyForRent`: if B009's staff all currently have `(0,N)` = zero
    properties under `Oversees`, or B009 itself currently has zero staff, the path from
    `Branch` to `PropertyForRent` disappears entirely for that branch, even though B009 very
    plausibly still has properties waiting to be assigned. The `(0,*)` optional minimum on
    *both* legs of the path is exactly what creates the gap. The fix mirrors the fan trap's:
    add a **direct** relationship connecting `Branch` and `PropertyForRent` so the fact
    doesn't depend on an intermediate optional hop.

!!! note "Both traps share one root cause and one fix"
    A fan trap comes from two `1:N` relationships *fanning out* of a shared entity; a chasm
    trap comes from a `1:N` (or optional) relationship *chain* with a gap partway through.
    Both are diagnosed the same way — write down a real question the business needs
    answered, and check whether the diagram's existing paths can actually answer it — and
    both are fixed the same way: add the missing **direct** relationship between the two
    entity types that actually need to be connected.

## Key Takeaways

- Promote an attribute to its own entity type when it needs its own attributes, its own
  relationships, or is shared by many occurrences of the entity currently describing it.
- A relationship needing its own attributes (`Viewing`, `Registers`) is a sign it deserves
  first-class treatment, sometimes as a full **ternary** relationship rather than a pair of
  binary ones — collapsing a three-way fact into two binary relationships can lose the
  combination information.
- Multiplicity is written as a `(min, max)` pair on each end of a relationship — get both
  numbers right in both directions, not just the "many" side.
- Redundant relationships duplicate a fact already derivable via another path in the
  diagram; the fix is to remove the duplicate, not to try to keep two copies in sync.
- **Fan traps** (two `1:N` relationships fanning from one entity) and **chasm traps** (a
  path broken by an optional relationship along the way) both look valid on paper but make
  a real business question unanswerable — both are fixed by adding the missing direct
  relationship.
- Plain ER modeling has no clean way to express "this entity type is a special case of that
  one" — that gap motivates [Lecture 14 — The Enhanced ER Model](lecture-14-the-enhanced-er-model.md).
