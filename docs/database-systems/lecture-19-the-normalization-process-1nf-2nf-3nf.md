---
title: "19. The Normalization Process: 1NF, 2NF, 3NF"
tags:
  - CSC270
  - Normalization
  - First Normal Form
  - Second Normal Form
  - Third Normal Form
---

# 19. The Normalization Process: 1NF, 2NF, 3NF

[Lecture 18](lecture-18-normalization-purpose-and-concepts.md) established *why*
normalization matters and introduced its vocabulary — functional dependencies, partial and
transitive dependency, lossless-join. This lecture turns that vocabulary into a repeatable
procedure and applies it, start to finish, to **one running example**: a single
unnormalized order-tracking table, carried through First, Second, and Third Normal Form
until it becomes a clean, anomaly-free set of relations. Work through every step by hand —
this is the single most important worked example in the entire normalization unit, and
every later lecture (BCNF, 4NF) assumes you can reproduce it.

## In This Lecture

- **First Normal Form (1NF)** — atomic values, no repeating groups
- **Second Normal Form (2NF)** — no partial dependency on a composite key
- **Third Normal Form (3NF)** — no transitive dependency
- One running example, converted step by step: **UNF → 1NF → 2NF → 3NF**
- A second, shorter worked example to reinforce the pattern
- **Testing for normal forms** — the checklist to apply to *any* relation, not just the
  running example

## The Running Example: An Unnormalized Order Table

A sales system needs to record customer orders, and each order can include several
products. A first, naive attempt stores **one row per order**, with the product details for
that order packed into a repeating group inside the row:

<div class="db-relation" markdown>
<div class="db-relation-name">Order (unnormalized — one row per order, product lines repeat within the row)</div>

| orderNo | orderDate | custNo | custName | custAddress | { productNo, productName, unitPrice, qty } |
|---|---|---|---|---|---|
| O100 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore | { (P01, Widget, 9.99, 3), (P02, Gadget, 24.99, 1) } |
| O101 | 2026-08-02 | C002 | Tom Kelly | 5 Oak Ave, Karachi | { (P01, Widget, 9.99, 2) } |
| O102 | 2026-08-03 | C001 | Ann Beech | 12 Elm St, Lahore | { (P03, Sprocket, 4.50, 10) } |

</div>

Order `O100`'s single row is trying to hold **two** product lines inside one cell — exactly
the "repeating group" Lecture 5 ruled out when it required every attribute value to be
**atomic**. This table is not yet a valid relation at all; it is **Unnormalized Form
(UNF)**, the raw, pre-relational starting point every normalization exercise begins from.

The functional dependencies that hold, stated informally before any structure is imposed:

- `orderNo → orderDate, custNo` (each order has one date and one customer)
- `custNo → custName, custAddress` (each customer has one name and address)
- `productNo → productName, unitPrice` (each product has one name and one catalog price)
- an order's quantity of a product depends on **both** which order and which product

## First Normal Form (1NF)

!!! note "Definition"
    A relation is in **First Normal Form (1NF)** if every attribute holds a single,
    **atomic** value — no repeating groups, no nested tables, no multi-valued cells. This
    is not an extra rule normalization invents; it is simply Lecture 5's definition of a
    valid relation, restated as the first checkpoint.

### Conversion to 1NF

The repeating group must be **flattened**: give each product line its own row, and repeat
the order-level attributes (`orderDate`, `custNo`, `custName`, `custAddress`) across every
line that belongs to the same order. Since a single `orderNo` value no longer identifies one
row uniquely — `O100` now spans two rows — the primary key must grow to a **composite key**:
`{orderNo, productNo}` is the smallest attribute set that uniquely identifies each row.

<div class="db-relation" markdown>
<div class="db-relation-name">Order (<u>orderNo, productNo</u>, orderDate, custNo, custName, custAddress, productName, unitPrice, qty) — 1NF</div>

| orderNo | productNo | orderDate | custNo | custName | custAddress | productName | unitPrice | qty |
|---|---|---|---|---|---|---|---|---|
| O100 | P01 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore | Widget | 9.99 | 3 |
| O100 | P02 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore | Gadget | 24.99 | 1 |
| O101 | P01 | 2026-08-02 | C002 | Tom Kelly | 5 Oak Ave, Karachi | Widget | 9.99 | 2 |
| O102 | P03 | 2026-08-03 | C001 | Ann Beech | 12 Elm St, Lahore | Sprocket | 4.50 | 10 |

</div>

Every attribute now holds one atomic value, and there are no repeating groups — this **is**
a valid relation, and it satisfies 1NF. But look at what flattening bought us: `orderDate`,
`custNo`, `custName`, and `custAddress` are now repeated across both of `O100`'s rows, and
`productName`/`unitPrice` for `Widget` (`P01`) are repeated across `O100` and `O101`. 1NF
fixed the *structural* problem (non-atomic values); it did nothing about the *redundancy*
problem from Lecture 18 — that requires 2NF and 3NF.

## Second Normal Form (2NF)

!!! note "Definition"
    A relation is in **Second Normal Form (2NF)** if it is already in 1NF, and **every
    non-key attribute is fully functionally dependent on the whole primary key — not on
    only part of it**. A **partial dependency** exists when a non-key attribute depends on
    a proper subset of a composite key. (2NF only has anything to check when the primary key
    is composite; a relation with a single-attribute key is automatically in 2NF once it's
    in 1NF.)

### Testing the 1NF Relation for Partial Dependencies

The primary key of the 1NF relation above is the composite `{orderNo, productNo}`. Check
each non-key attribute against *both* halves of that key individually:

| Non-key attribute | Depends on `orderNo` alone? | Depends on `productNo` alone? | Depends on the *whole* key? |
|---|---|---|---|
| `orderDate` | Yes (`orderNo → orderDate`) | No | **Partial** — only needs `orderNo` |
| `custNo` | Yes (`orderNo → custNo`) | No | **Partial** — only needs `orderNo` |
| `custName` | Yes (via `custNo`) | No | **Partial** |
| `custAddress` | Yes (via `custNo`) | No | **Partial** |
| `productName` | No | Yes (`productNo → productName`) | **Partial** — only needs `productNo` |
| `unitPrice` | No | Yes (`productNo → unitPrice`) | **Partial** |
| `qty` | No | No | **Full** — genuinely needs *both* `orderNo` and `productNo` |

Six of the seven non-key attributes are partially dependent on the key — only `qty` needs
both halves. This relation **violates 2NF**.

### Conversion to 2NF

Every partially-dependent attribute must move into a relation keyed by whichever part of
the composite key actually determines it. Attributes depending on `orderNo` alone move to
an `Order` relation; attributes depending on `productNo` alone move to a `Product`
relation; `qty`, which genuinely needs the full composite key, stays behind in a
line-items relation that still carries both `orderNo` and `productNo` as a foreign key
pair:

<div class="db-grid-3" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Order (<u>orderNo</u>, orderDate, custNo, custName, custAddress)</div>

| orderNo | orderDate | custNo | custName | custAddress |
|---|---|---|---|---|
| O100 | 2026-08-01 | C001 | Ann Beech | 12 Elm St, Lahore |
| O101 | 2026-08-02 | C002 | Tom Kelly | 5 Oak Ave, Karachi |
| O102 | 2026-08-03 | C001 | Ann Beech | 12 Elm St, Lahore |

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
<div class="db-relation-name">OrderLine (<u>orderNo, productNo</u>, qty)</div>

| orderNo | productNo | qty |
|---|---|---|
| O100 | P01 | 3 |
| O100 | P02 | 1 |
| O101 | P01 | 2 |
| O102 | P03 | 10 |

</div>
</div>

Each of these three relations is now in 2NF: `Product` and `Order` have single-attribute
keys, so partial dependency is structurally impossible; `OrderLine`'s only non-key attribute
(`qty`) genuinely needs the *entire* composite key. `Widget`'s price no longer repeats per
order — it lives in exactly one row of `Product`. But `Order` still has a problem: does
`custName` really depend on `orderNo`, or does it depend on `custNo`, which merely happens
to be *reachable from* `orderNo`? That question is exactly what 3NF answers.

## Third Normal Form (3NF)

!!! note "Definition"
    A relation is in **Third Normal Form (3NF)** if it is already in 2NF, and **no non-key
    attribute is transitively dependent on the primary key**. A **transitive dependency**
    exists when a non-key attribute `Z` depends on another non-key attribute `Y`, and `Y` in
    turn depends on the key `X` — that is, `X → Y → Z`, but `Z` does not depend on `X`
    directly, only *through* `Y`.

### Testing the 2NF Relations for Transitive Dependencies

`Product` and `OrderLine` are unaffected — check `Order(orderNo, orderDate, custNo,
custName, custAddress)`, key `orderNo`:

- `orderNo → custNo` — direct, fine.
- `orderNo → orderDate` — direct, fine.
- `custNo → custName` and `custNo → custAddress` — but `custNo` is itself a **non-key**
  attribute of this relation (the key is `orderNo` alone). So `custName` and `custAddress`
  depend on `orderNo` only *transitively*, through `custNo`: `orderNo → custNo → custName`.
  This is exactly the transitive-dependency pattern the definition above describes, and it
  **violates 3NF**.

The practical symptom is the redundancy already visible in the table: `Ann Beech` and her
address are stored once per order she places (`O100` and `O102` both repeat them), because
the fact "which customer" and the fact "that customer's name and address" are bundled into
one relation even though they describe two different things.

### Conversion to 3NF

Split off the transitively-dependent attributes into their own relation, keyed by the
attribute they actually depend on (`custNo`), leaving only `custNo` behind in `Order` as a
foreign key:

<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Customer (<u>custNo</u>, custName, custAddress)</div>

| custNo | custName | custAddress |
|---|---|---|
| C001 | Ann Beech | 12 Elm St, Lahore |
| C002 | Tom Kelly | 5 Oak Ave, Karachi |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">Order (<u>orderNo</u>, orderDate, custNo)</div>

| orderNo | orderDate | custNo |
|---|---|---|
| O100 | 2026-08-01 | C001 |
| O101 | 2026-08-02 | C002 |
| O102 | 2026-08-03 | C001 |

</div>
</div>

`Product` and `OrderLine` from the 2NF step carry over unchanged. The final schema —
verified 3NF, and in fact BCNF as well (every determinant in every relation below is that
relation's key, which Lecture 20 will show is the sharper test):

```text
Customer  (custNo, custName, custAddress)
Product   (productNo, productName, unitPrice)
Order     (orderNo, orderDate, custNo)
    Foreign Key custNo references Customer(custNo)
OrderLine (orderNo, productNo, qty)
    Foreign Key orderNo references Order(orderNo)
    Foreign Key productNo references Product(productNo)
```

<div class="db-diagram" markdown>
<p class="db-diagram-label">UNF to 3NF, the whole journey</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">UNF</span>
<span class="db-node-sub">One row per order, product lines repeat inside it</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">1NF</span>
<span class="db-node-sub">Flattened — one row per (order, product); key grows composite</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">2NF</span>
<span class="db-node-sub">Split off attributes depending on only half the composite key</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">3NF</span>
<span class="db-node-sub">Split off attributes depending on a non-key attribute, not the key itself</span>
</div>
</div>
</div>

Every anomaly from Lecture 18 is now gone: `Product` accepts a new, unordered product;
deleting `O101` leaves `Customer` row `C002` intact; `Widget`'s price lives in exactly one
row. And it cost nothing in information — `Customer ⋈ Order ⋈ OrderLine ⋈ Product`
reconstructs the original flattened 1NF table exactly (the lossless-join property from
Lecture 18), because every join attribute (`custNo`, `orderNo`, `productNo`) is the primary
key of the relation on the "one" side of the join.

## Examples of Normalization: A Second, Shorter Pass

To confirm the pattern generalizes beyond the order-tracking example, apply the same three
questions to a differently-shaped relation: a university records each course enrollment,
along with the assigned instructor's office, in one table.

<div class="db-relation" markdown>
<div class="db-relation-name">Enrollment (<u>studentNo, courseNo</u>, studentName, courseName, instructorNo, instructorOffice, grade) — 1NF</div>

| studentNo | courseNo | studentName | courseName | instructorNo | instructorOffice | grade |
|---|---|---|---|---|---|---|
| S1 | CS201 | Bilal Khan | Databases | I01 | Room 214 | A |
| S1 | CS305 | Bilal Khan | Networks | I02 | Room 108 | B+ |
| S2 | CS201 | Sara Malik | Databases | I01 | Room 214 | A− |

</div>

FDs: `studentNo → studentName`; `courseNo → courseName, instructorNo`; `instructorNo →
instructorOffice`; `{studentNo, courseNo} → grade`.

- **2NF check** against key `{studentNo, courseNo}`: `studentName` depends on `studentNo`
  alone (partial); `courseName` and `instructorNo` depend on `courseNo` alone (partial);
  `instructorOffice` depends on `instructorNo`, which depends on `courseNo` alone — also
  ultimately reachable from just `courseNo` (partial); only `grade` needs the full key.
  **Violates 2NF.** Split into `Student(studentNo, studentName)`,
  `Course(courseNo, courseName, instructorNo, instructorOffice)`, and
  `Enrollment(studentNo, courseNo, grade)`.
- **3NF check** on the new `Course(courseNo, courseName, instructorNo, instructorOffice)`,
  key `courseNo`: `instructorOffice` depends on `instructorNo`, which is itself a non-key
  attribute of `Course` — transitive. **Violates 3NF.** Split off
  `Instructor(instructorNo, instructorOffice)`, leaving `Course(courseNo, courseName,
  instructorNo)`.

Final 3NF schema: `Student(studentNo, studentName)`, `Instructor(instructorNo,
instructorOffice)`, `Course(courseNo, courseName, instructorNo)`, `Enrollment(studentNo,
courseNo, grade)` — the exact same three-question pattern (atomicity, then partial
dependency, then transitive dependency), applied to a different domain, produces the same
kind of clean result.

## Testing for Normal Forms

Given *any* relation and its functional dependencies, apply these three questions in order
— the moment one fails, stop and fix that level before checking the next:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Testing checklist — apply in order</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">1. Is every attribute value atomic?</span>
<span class="db-node-sub">No repeating groups, no multi-valued cells. No -> not even in 1NF; flatten first.</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">2. Is the key composite? If so, does every non-key attribute need the WHOLE key?</span>
<span class="db-node-sub">Single-attribute key -> automatically 2NF. Composite key -> check each non-key attribute against each proper subset of the key.</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">3. Does every non-key attribute depend ONLY on the key -- never on another non-key attribute?</span>
<span class="db-node-sub">If X (key) -> Y (non-key) -> Z (non-key), Z is transitively dependent -> violates 3NF.</span>
</div>
</div>
</div>

!!! warning "Partial vs. transitive: the most common exam mix-up"
    Both violations look similar on the page — "this attribute doesn't depend on the whole
    key" — but they are structurally different. A **partial** dependency is about a
    composite key: some non-key attribute depends on only *part* of it. A **transitive**
    dependency can happen even with a single-attribute key: the culprit is a *non-key*
    attribute standing in the way, as in `custNo → custName` inside a relation keyed by
    `orderNo`. If the key is a single attribute, partial dependency is impossible by
    definition — only check for transitive dependency.

## Key Takeaways

- **1NF**: every attribute value is atomic — no repeating groups. Fixed by flattening,
  which often forces the primary key to become composite.
- **2NF**: every non-key attribute depends on the **whole** composite key, not part of it.
  Only relevant when the key is composite; fixed by splitting off attributes that depend on
  only part of the key.
- **3NF**: every non-key attribute depends **directly** on the key, never transitively
  through another non-key attribute. Fixed by splitting off the non-key attribute doing the
  determining, along with everything it determines.
- The running `Order` example went **UNF → 1NF → 2NF → 3NF**, ending at
  `Customer`, `Product`, `Order`, `OrderLine` — a schema with zero redundancy for any single
  fact, verified lossless via natural join back to the original flattened table.
- **Testing** any relation for normal forms is the same three-question procedure every
  time: atomicity, then partial dependency (composite keys only), then transitive
  dependency — applied in that order, since each level assumes the previous one already
  holds.

3NF eliminates most real-world redundancy, but it is not the strictest possible test —
[Lecture 20](lecture-20-advanced-normalization-functional-dependencies-and-bcnf.md)
introduces **Boyce-Codd Normal Form (BCNF)**, a stronger rule that catches a specific kind
of anomaly 3NF can still miss, along with the formal machinery (Armstrong's Axioms,
attribute closure) needed to find every candidate key of a relation precisely.
