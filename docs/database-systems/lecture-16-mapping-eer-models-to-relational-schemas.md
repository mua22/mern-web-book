---
title: "16. Mapping EER Models to Relational Schemas"
tags:
  - CSC270
  - EER Model
  - Relational Mapping
  - Database Design
---

# 16. Mapping EER Models to Relational Schemas

Every lecture since [Lecture 12](lecture-12-the-entity-relationship-model.md) has been about
*drawing* correct diagrams — entities, relationships, specialization, aggregation. None of it
directly runs on a DBMS. A relational database only understands relations, primary keys, and
foreign keys ([Lecture 5](lecture-05-the-relational-model.md)); an EER diagram has to be
**mapped** down into that vocabulary before it becomes a real schema. This lecture is that
mapping, rule by rule, covering every construct introduced across
[Lecture 12](lecture-12-the-entity-relationship-model.md),
[Lecture 14](lecture-14-the-enhanced-er-model.md), and
[Lecture 15](lecture-15-eer-modeling-a-case-study.md) — this is the lecture where all three
diagrams finally turn into `Relation(attr1, attr2, ...)` schemas you could hand straight to
`CREATE TABLE`.

## In This Lecture

- The overall mapping process, as an ordered sequence of rules
- Mapping strong entity types
- Mapping weak entity types (composite keys that include the owner's key)
- Mapping 1:1, 1:N, and M:N relationships
- Mapping multi-valued attributes
- Mapping specialization/generalization — three competing strategies, and how to choose
- Mapping categorization (union types)
- Mapping aggregation
- Mapping EER constraints — disjoint/overlapping, total/partial, multiplicity — into
  `CHECK` constraints, `NOT NULL`, and their real limits

<div class="db-diagram" markdown>
<p class="db-diagram-label">The mapping process, applied in order</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">1. Strong entity types</span><span class="db-node-sub">One relation per entity type, its identifier as primary key</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">2. Weak entity types</span><span class="db-node-sub">Composite key: partial key + owner's entire primary key</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">3. Relationships (1:1, 1:N, M:N)</span><span class="db-node-sub">Foreign key placement, or a new relation for M:N</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">4. Multi-valued attributes</span><span class="db-node-sub">Always become their own relation</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">5. Specialization / generalization</span><span class="db-node-sub">Choose a strategy — several are viable</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">6. Categorization and aggregation</span><span class="db-node-sub">Both reduce to relations already produced by steps 1-5</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">7. Constraints</span><span class="db-node-sub">NOT NULL, CHECK, and their declarative limits</span></div>
</div>
</div>

## Rule 1: Mapping Strong Entity Types

For each strong entity type, create one relation. Every simple attribute becomes a column;
the entity's identifier becomes the primary key.

<div class="db-relation" markdown>
<div class="db-relation-name">Branch (<u>branchNo</u>, street, city, postcode)</div>

| branchNo | street | city | postcode |
|---|---|---|---|
| B003 | 163 Main St | Lahore | 54000 |

</div>

Nothing more is needed — a strong entity type's independent existence and single-attribute
(or composite, but self-contained) identifier map directly onto a relation's defining
properties.

## Rule 2: Mapping Weak Entity Types

A weak entity type's primary key is **not** just its own partial key — it must include the
**entire primary key of its owner**, because the weak entity cannot be identified without
knowing which owner it belongs to (established in
[Lecture 15](lecture-15-eer-modeling-a-case-study.md)'s treatment of `Bed`, owned by `Ward`).

<div class="db-relation" markdown>
<div class="db-relation-name">Bed (<u>wardNo, bedNo</u>, status) — wardNo is both part of the primary key AND a foreign key</div>

| wardNo | bedNo | status |
|---|---|---|
| W1 | 1 | Occupied |
| W1 | 2 | Free |
| W2 | 1 | Occupied |

</div>

```text
CREATE TABLE Bed (
    wardNo   VARCHAR(4)  NOT NULL,
    bedNo    SMALLINT    NOT NULL,
    status   VARCHAR(10) NOT NULL,
    PRIMARY KEY (wardNo, bedNo),
    FOREIGN KEY (wardNo) REFERENCES Ward(wardNo) ON DELETE CASCADE
);
```

!!! note "Why ON DELETE CASCADE shows up here specifically"
    `Bed` is not just referencing `Ward` — it is *existence-dependent* on it, exactly the way
    a weak entity is defined. Deleting a ward should delete its beds automatically, which is
    precisely what `ON DELETE CASCADE` does (contrast with the `RESTRICT`/`SET NULL`
    discussion in [Lecture 6](lecture-06-integrity-constraints.md), where the property being
    modeled was much weaker — a `PropertyForRent` row survives fine without its assigned
    staff member).

## Rule 3: Mapping 1:1 Relationships

For a `1:1` relationship, no new relation is needed — the foreign key goes on **one** of the
two existing relations. Which one depends on participation: put the foreign key on the side
with **mandatory (total) participation**, since that side is guaranteed to always have a
value to store.

`Department HeadedBy Doctor` (from Lecture 15): every department must have exactly one head
(`(1,1)` — total), but not every doctor heads a department (`(0,1)` — partial). The foreign
key goes on `Department`:

<div class="db-relation" markdown>
<div class="db-relation-name">Department (<u>deptNo</u>, name, location, *headDoctorNo*)</div>

| deptNo | name | location | headDoctorNo |
|---|---|---|---|
| D01 | Cardiology | Block C | S014 |

</div>

!!! tip "When both sides are total"
    If both sides of a `1:1` relationship have mandatory participation, the foreign key can
    go on *either* side — or, in some designs, the two relations are simply merged into one,
    since a strict `1:1` mandatory-both-sides relationship means the two entity types always
    co-occur in lockstep. Which relation gets the FK in that case is a matter of convenience,
    not correctness.

## Rule 4: Mapping 1:N Relationships

For a `1:N` relationship, the foreign key always goes on the relation representing the
**many** side, referencing the primary key of the relation on the **one** side. No new
relation is created.

<div class="db-relation" markdown>
<div class="db-relation-name">Staff (<u>staffNo</u>, cnic, name, address, dateJoined, *deptNo*)</div>

| staffNo | cnic | name | deptNo |
|---|---|---|---|
| S014 | 35202-... | Dr. Amina Raza | D01 |
| S027 | 37405-... | Bilal Ahmed (Nurse) | D01 |

</div>

Every `Staff` row carries exactly one `deptNo`, matching the "many staff, one department"
shape of `WorksIn` directly — this is the same rule already used, without naming it, back in
[Lecture 5](lecture-05-the-relational-model.md) and
[Lecture 6](lecture-06-integrity-constraints.md) for `PropertyForRent.branchNo`.

## Rule 5: Mapping M:N Relationships

An `M:N` relationship **always requires a brand-new relation**, because neither side's
primary key alone is enough to identify one occurrence of the relationship — a single
`Nurse` can be linked to several `Ward`s, and a single `Ward` to several `Nurse`s, so
neither `Nurse` nor `Ward` can hold the other's key as an ordinary foreign key without
either repeating rows or losing information.

<div class="db-diagram" markdown>
<p class="db-diagram-label">AssignedTo — an M:N relationship between Nurse and Ward</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Nurse</div><ul class="db-entity-attrs"><li class="db-pk">staffNo</li></ul></div>
<div class="db-relate" markdown><div class="db-relate-line"></div><div class="db-relate-name">AssignedTo</div><div class="db-relate-line"></div><div class="db-relate-card"><span class="db-badge db-badge-orange">N</span><span class="db-badge db-badge-orange">N</span></div></div>
<div class="db-entity" markdown><div class="db-entity-name">Ward</div><ul class="db-entity-attrs"><li class="db-pk">wardNo</li></ul></div>
</div>
</div>

The new relation's primary key is the **combination** of both sides' foreign keys:

<div class="db-relation" markdown>
<div class="db-relation-name">NurseWardAssignment (<u>staffNo, wardNo</u>)</div>

| staffNo | wardNo |
|---|---|
| S027 | W1 |
| S027 | W2 |
| S041 | W1 |

</div>

```text
CREATE TABLE NurseWardAssignment (
    staffNo  VARCHAR(6) NOT NULL,
    wardNo   VARCHAR(4) NOT NULL,
    PRIMARY KEY (staffNo, wardNo),
    FOREIGN KEY (staffNo) REFERENCES Staff(staffNo),
    FOREIGN KEY (wardNo)  REFERENCES Ward(wardNo)
);
```

!!! note "This is exactly why relationships with attributes became entities in Lecture 13"
    An `M:N` relationship's new relation is a perfect place to also store attributes *of the
    relationship itself* (`Viewing(`<u>`clientNo, propertyNo`</u>`, viewDate, comment)` in
    Lecture 6 already does this) — mapping and modeling converge here: whether you called it
    "a relationship with attributes" while diagramming, or "the M:N relationship's own
    relation" while mapping, you land on the identical relational structure either way.

## Rule 6: Mapping Multi-Valued Attributes

A multi-valued attribute can never be stored as an ordinary column — a single column holds
one value. It **always** becomes its own relation, with a composite primary key of the
owning entity's key plus the attribute itself (or a surrogate, if the value alone isn't
unique per owner).

<div class="db-relation" markdown>
<div class="db-relation-name">PatientPhone (<u>patientNo, phoneNumber</u>)</div>

| patientNo | phoneNumber |
|---|---|
| P0142 | 0300-1234567 |
| P0142 | 021-34567890 |
| P0198 | 0333-9876543 |

</div>

This mirrors Rule 2's weak-entity pattern almost exactly — `phoneNumber` is, in effect, being
treated the same way a weak entity's partial key is: meaningless without `patientNo` beside
it.

## Rule 7: Mapping Specialization and Generalization

Specialization is where mapping stops being mechanical and starts being a genuine design
decision — Connolly & Begg (and most textbooks) present **three** viable strategies, and the
right one depends on the disjoint/overlapping and total/partial constraints established in
[Lecture 14](lecture-14-the-enhanced-er-model.md).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Recall: Staff specialized into four roles — disjoint, total (Lecture 15)</p>
<div class="db-entity" markdown>
<div class="db-entity-name">Staff</div>
<ul class="db-entity-attrs"><li class="db-pk">staffNo</li><li>cnic</li><li>name</li></ul>
</div>
<div class="db-grid-3" markdown>
<div class="db-entity" markdown><div class="db-entity-name">Doctor</div><ul class="db-entity-attrs"><li>licenseNo</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Nurse</div><ul class="db-entity-attrs"><li>shift</li></ul></div>
<div class="db-entity" markdown><div class="db-entity-name">Technician</div><ul class="db-entity-attrs"><li>labSpecialty</li></ul></div>
</div>
</div>

**Strategy A — one relation per subclass only (superclass table dropped).** Every subclass
relation carries the *full* inherited attribute set, duplicated:

<div class="db-relation" markdown>
<div class="db-relation-name">Doctor (<u>staffNo</u>, cnic, name, licenseNo, consultationFee)</div>

| staffNo | cnic | name | licenseNo | consultationFee |
|---|---|---|---|---|
| S014 | 35202-... | Dr. Amina Raza | PMC-4471 | 2500 |

</div>

**Strategy B — one relation per subclass, plus one for the superclass (the usual default).**
The superclass relation holds shared attributes; each subclass relation holds only its own
extra attributes, with its primary key **also serving as a foreign key** back to the
superclass:

<div class="db-relation" markdown>
<div class="db-relation-name">Staff (<u>staffNo</u>, cnic, name, dateJoined, deptNo)</div>

| staffNo | cnic | name |
|---|---|---|
| S014 | 35202-... | Dr. Amina Raza |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Doctor (<u>staffNo</u>, licenseNo, consultationFee) — staffNo is PK *and* FK into Staff</div>

| staffNo | licenseNo | consultationFee |
|---|---|---|
| S014 | PMC-4471 | 2500 |

</div>

**Strategy C — a single relation with a type discriminator column.** Every subclass's
attributes are folded into one wide table, left `NULL` wherever they don't apply, plus one
extra column recording which subclass a row actually is:

<div class="db-relation" markdown>
<div class="db-relation-name">Staff (<u>staffNo</u>, cnic, name, staffType, licenseNo, shift, labSpecialty, officeRole)</div>

| staffNo | name | staffType | licenseNo | shift | labSpecialty |
|---|---|---|---|---|---|
| S014 | Dr. Amina Raza | Doctor | PMC-4471 | *(NULL)* | *(NULL)* |
| S027 | Bilal Ahmed | Nurse | *(NULL)* | Night | *(NULL)* |

</div>

| Strategy | Works well when | Trade-off |
|---|---|---|
| **A** — subclass-only | Disjoint **and** total (every occurrence is exactly one subclass — no "plain superclass" rows ever needed) | Shared attributes duplicated across tables; querying "all staff regardless of role" needs a `UNION` |
| **B** — superclass + subclasses | **Any** combination of constraints — the general-purpose default | One extra join needed to retrieve a subclass occurrence's full attribute set |
| **C** — single table + discriminator | Disjoint, and subclass-specific attribute sets are small | Many `NULL` columns as the number/size of subclasses grows — the "attribute overload" problem Lecture 14 warned about, reappearing at the relational level |

For the hospital case study's **two-level** hierarchy (`Staff → Doctor → {Consultant,
Resident}`, plus `Staff → Nurse`, `Technician`, `Administrator`), Strategy B is the right
choice specifically *because* it is the only one of the three that composes cleanly across
multiple levels without modification:

<div class="db-relation" markdown>
<div class="db-relation-name">Consultant (<u>staffNo</u>, yearsOfExperience, officeRoomNo) — staffNo is FK into Doctor, which is FK into Staff</div>

| staffNo | yearsOfExperience | officeRoomNo |
|---|---|---|
| S014 | 12 | C-204 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Resident (<u>staffNo</u>, rotationEndDate, *supervisingConsultantNo*)</div>

| staffNo | rotationEndDate | supervisingConsultantNo |
|---|---|---|
| S099 | 2027-01-15 | S014 |

</div>

`Resident.supervisingConsultantNo` is a foreign key into `Consultant.staffNo` — not into
`Staff.staffNo` — because the requirement was specifically "supervised by one of the
**consultants**," and Strategy B's per-level relations let the foreign key target exactly the
right level of the hierarchy.

## Rule 8: Mapping Categorization (Union Types)

A category's members are drawn from the union of *unrelated* superclasses that don't share a
natural common parent — `RegisteredOwner = UNION(Person, Bank, Company)` from
[Lecture 14](lecture-14-the-enhanced-er-model.md). Because the superclasses' primary keys
aren't even the same type (`cnic` vs. `bankCode` vs. `regNo`), the category needs its **own,
independent surrogate key**, and each superclass gets an optional foreign key pointing at it.

<div class="db-relation" markdown>
<div class="db-relation-name">RegisteredOwner (<u>ownerNo</u>, ownerSince)</div>

| ownerNo | ownerSince |
|---|---|
| RO-001 | 2019-03-01 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Person (<u>cnic</u>, name, *ownerNo*)</div>

| cnic | name | ownerNo |
|---|---|---|
| 35202-1234567-1 | Hina Tariq | RO-001 |

</div>

`Person.ownerNo` is nullable — most `Person` rows are not vehicle owners at all — mirroring
exactly the "put the FK on the side that may or may not participate" logic from Rule 3's
`1:1` mapping. `Bank` and `Company` each get the identical treatment: their own nullable
`ownerNo` foreign key into `RegisteredOwner`.

## Rule 9: Mapping Aggregation

Aggregation turns out to need **no new mapping machinery of its own** — it reduces entirely
to relations already produced by the earlier rules. The aggregated relationship becomes a
relation exactly per Rules 1–6 (as an entity, if it already carried attributes, exactly as
`Admission` did back in Lecture 15), and the aggregate's *outer* relationship — the one
connecting the aggregate to a third entity type — becomes nothing more than one additional
foreign key column on that same relation.

<div class="db-relation" markdown>
<div class="db-relation-name">Admission (<u>admissionNo</u>, admissionDate, dischargeDate, reasonForAdmission, *patientNo*, *wardNo*, *bedNo*, *attendingDoctorNo*)</div>

| admissionNo | admissionDate | dischargeDate | patientNo | wardNo | bedNo | attendingDoctorNo |
|---|---|---|---|---|---|---|
| A-1042 | 2026-02-10 | 2026-02-14 | P0142 | W1 | 2 | S014 |

</div>

```text
CREATE TABLE Admission (
    admissionNo        VARCHAR(8)  NOT NULL,
    admissionDate       DATE        NOT NULL,
    dischargeDate        DATE,
    reasonForAdmission  VARCHAR(200),
    patientNo           VARCHAR(6)  NOT NULL,
    wardNo               VARCHAR(4)  NOT NULL,
    bedNo                SMALLINT    NOT NULL,
    attendingDoctorNo    VARCHAR(6)  NOT NULL,
    PRIMARY KEY (admissionNo),
    FOREIGN KEY (patientNo) REFERENCES Patient(patientNo),
    FOREIGN KEY (wardNo, bedNo) REFERENCES Bed(wardNo, bedNo),
    FOREIGN KEY (attendingDoctorNo) REFERENCES Doctor(staffNo)
);
```

Notice `attendingDoctorNo` is a completely ordinary foreign key by the time mapping is done —
the fact that it originated from an *aggregated* relationship (rather than a plain one) only
mattered during modeling. This is a genuinely reassuring result: aggregation is a conceptual
tool for *thinking clearly* about what a relationship is really about (Lecture 14's whole
motivation), but it leaves no special trace in the final relational schema beyond an ordinary
foreign key.

## Rule 10: Mapping EER Constraints to the Relational Schema

Structural information from the EER diagram has to survive the trip into the relational
schema too, though not always with full declarative strength.

**Mandatory participation `(1, ...)` → `NOT NULL`.** If a `PropertyForRent` must always
belong to a branch, `branchNo NOT NULL` enforces it directly (already used since
[Lecture 6](lecture-06-integrity-constraints.md)).

**Disjoint specialization, with Strategy C → `CHECK` on the discriminator.**

```text
ALTER TABLE Staff
    ADD CONSTRAINT chk_staff_type
    CHECK (staffType IN ('Doctor', 'Nurse', 'Technician', 'Administrator'));
```

**Disjoint specialization, with Strategy B → no single declarative constraint.** Nothing in
plain SQL directly says "a `staffNo` appears in at most one of `Doctor`, `Nurse`,
`Technician`, `Administrator`" — the primary-key-as-foreign-key pattern *allows* it to appear
in more than one, which would silently violate disjointness. Enforcing it takes a trigger, or
occasionally a shared discriminator column on `Staff` checked against whichever subclass
table a given `staffNo` is inserted into.

!!! warning "Minimum cardinality of `1` or more is a real, common gap"
    A foreign key naturally enforces "at most one" on the referencing side and "referenced
    value must exist" on the target — but it has **no built-in way** to enforce "this
    referenced row must be pointed at by *at least* one row." Nothing stops a `Department`
    from being inserted with zero `Staff` rows ever assigned to it, even if the business rule
    is "every department must have at least one staff member." Enforcing a true minimum
    cardinality of `(1, *)` on the "one" side of a `1:N` relationship generally requires a
    trigger or application-level check — the relational model's declarative constraints are
    genuinely weaker here than the EER diagram's multiplicity notation promises, and this gap
    is worth remembering the next time a diagram's `(1,*)` looks like it's "already handled"
    just because a foreign key exists somewhere nearby.

## Summary: Every EER Construct, Mapped

| EER construct (introduced in) | Relational mapping |
|---|---|
| Strong entity type (Lecture 12) | One relation; identifier → primary key |
| Weak entity type (Lecture 15) | One relation; composite key = partial key + owner's entire key |
| `1:1` relationship (Lecture 12) | FK on the mandatory-participation side; no new relation |
| `1:N` relationship (Lecture 12) | FK on the "many" side; no new relation |
| `M:N` relationship (Lecture 12) | New relation; PK = combination of both sides' keys |
| Multi-valued attribute (Lecture 13) | New relation; PK = owner's key + the attribute |
| Relationship with attributes (Lecture 13) | New relation exactly as the `M:N` rule, holding the extra attributes |
| Specialization / generalization (Lecture 14) | Strategy A, B, or C — chosen from the disjoint/overlapping and total/partial constraints |
| Aggregation (Lecture 14) | The aggregate maps via the rules above; the outer relationship becomes one ordinary FK |
| Composition (Lecture 14) | Same as `1:N`, plus `ON DELETE CASCADE` on the FK |
| Categorization / union type (Lecture 14) | New relation with a surrogate key; each superclass gets a nullable FK into it |

## Key Takeaways

- Mapping proceeds in a fixed order — strong entities, then weak entities, then
  relationships, then multi-valued attributes, then specialization, then categorization and
  aggregation, then constraints — because later rules routinely depend on relations the
  earlier rules already produced.
- `1:1` and `1:N` relationships never need a new relation, only correct foreign-key
  placement; `M:N` relationships and multi-valued attributes always need one.
- Specialization has three mapping strategies with genuinely different trade-offs — Strategy
  B (superclass plus one relation per subclass) is the safest general default and the only
  one that composes cleanly across multi-level hierarchies like Lecture 15's
  `Staff → Doctor → {Consultant, Resident}`.
- Categorization needs its own surrogate key precisely because its superclasses don't share
  compatible primary keys.
- Aggregation and composition both resolve entirely into ordinary relations and foreign keys
  once mapped — aggregation is a *modeling* tool, and leaves no special construct behind in
  the finished schema.
- Not every EER constraint survives the trip to SQL with full strength — mandatory
  participation and disjointness (with the right strategy) map cleanly, but a true minimum
  cardinality of "at least one" generally cannot be enforced by a plain foreign key alone.

This closes the ER/EER unit: [Lecture 13](lecture-13-er-modeling-issues-and-problems.md)
sharpened plain ER modeling, [Lecture 14](lecture-14-the-enhanced-er-model.md) extended it
with specialization, aggregation, and categorization,
[Lecture 15](lecture-15-eer-modeling-a-case-study.md) applied all of it to a full case study,
and this lecture has turned every one of those diagrams into schemas a real DBMS can create
and enforce.
