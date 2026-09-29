---
title: "8. Join and Division Operations"
tags:
  - CSC270
  - Relational Algebra
  - Join
  - Division
---

# 8. Join and Division Operations

[Lecture 7](lecture-07-relational-algebra-unary-and-set-operations.md) ended with a
Cartesian product's core weakness in plain view: pairing *every* client with *every*
Lahore property produced nine rows, most of them nonsense (pairing a client who can't
afford a property with that property anyway). **Join** operators exist to fix exactly that
— they are a Cartesian product with a matching condition built in, so you only ever
materialize the combinations that make sense. This lecture works through the full join
family — theta join, equijoin, natural join, and the three outer joins — and finishes with
**division**, relational algebra's least intuitive but most powerful operator, purpose-built
for "find the X that relates to *every* Y" questions.

We extend the rental agency once more: `PropertyForRent` gains one new row (`PG55`, deliberately
left with no assigned staff member — recall it from Lecture 6's referential-integrity
example, where it was accepted with `staffNo = NULL`), and we introduce `Viewing`, which
records which clients have viewed which properties.

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
| PG55 | 9 Castle Rd | Lahore | Flat | 3 | 19000 | CO46 | *(NULL)* | B003 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Viewing (<u>clientNo, propertyNo</u>, viewDate, comment)</div>

| clientNo | propertyNo | viewDate | comment |
|---|---|---|---|
| CR56 | PA14 | 2026-05-24 | too small |
| CR56 | PG4 | 2026-06-01 | too remote |
| CR56 | PG36 | 2026-06-15 | *(NULL)* |
| CR62 | PA14 | 2026-05-26 | *(NULL)* |
| CR62 | PG4 | 2026-06-14 | no dining room |
| CR76 | PG4 | 2026-06-20 | too expensive |

</div>

## In This Lecture

- **Theta join (θ-join)** — Cartesian product plus an arbitrary comparison condition
- **Equijoin** — the special case of theta join using only equality
- **Natural join (⋈)** — an equijoin with the duplicate attribute automatically removed
- **Outer joins** — left, right, and full, and why they keep "unmatched" rows that an inner
  join would silently drop
- **Division (÷)** — answering "find every X related to *all* of a given set of Y"

## Theta Join (θ-Join)

A **theta join** combines two relations by taking their Cartesian product and immediately
applying a SELECT with some condition θ that compares an attribute of one relation against
an attribute of the other. Formally:

```text
R ⋈θ S  ≡  σθ (R × S)
```

θ can be **any** comparison operator — `=`, `≠`, `<`, `>`, `≤`, `≥` — which is exactly what
distinguishes a general theta join from the equality-only special case (equijoin, next
section).

**Query:** which (client, Lahore property) pairs represent a property the client can
actually afford — i.e., the client's `maxRent` is at least the property's `rent`? This is
the *same* nine-pair Cartesian product from the end of Lecture 7, now filtered by a theta
condition instead of left as raw noise:

```text
Client ⋈ Client.maxRent ≥ PropertyForRent.rent (σ city='Lahore' (PropertyForRent))
```

<div class="db-relation" markdown>
<div class="db-relation-name">Input: Client</div>

| clientNo | name | prefType | maxRent |
|---|---|---|---|
| CR56 | Aline Stewart | Flat | 25000 |
| CR62 | Mike Ritchie | House | 30000 |
| CR76 | John Kay | Flat | 20000 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Input: σ city='Lahore' (PropertyForRent), projected to propertyNo and rent</div>

| propertyNo | rent |
|---|---|
| PA14 | 22000 |
| PG4 | 35000 |
| PG36 | 24500 |

</div>

Tracing all nine pairs from Lecture 7's Cartesian product against the condition
`maxRent ≥ rent`: `CR56`(25000) vs. `PA14`(22000) → 25000≥22000 ✓; vs. `PG4`(35000) →
25000≥35000 ✗; vs. `PG36`(24500) → 25000≥24500 ✓. `CR62`(30000) vs. `PA14` → ✓; vs. `PG4` →
30000≥35000 ✗; vs. `PG36` → ✓. `CR76`(20000) vs. `PA14` → 20000≥22000 ✗; vs. `PG4` → ✗; vs.
`PG36` → 20000≥24500 ✗.

<div class="db-relation" markdown>
<div class="db-relation-name">Output: the theta join — 4 of the original 9 pairs survive</div>

| clientNo | maxRent | propertyNo | rent |
|---|---|---|---|
| CR56 | 25000 | PA14 | 22000 |
| CR56 | 25000 | PG36 | 24500 |
| CR62 | 30000 | PA14 | 22000 |
| CR62 | 30000 | PG36 | 24500 |

</div>

Nine raw pairings collapsed to four *meaningful* ones — every client who cannot afford a
given property is gone, and notice `CR76` disappears entirely from the result: none of the
three Lahore properties fall within their 20,000 budget.

## Equijoin

An **equijoin** is a theta join where θ is restricted to equality (`=`) only — by far the
most common join in practice, since it's what you use whenever you're matching a foreign
key against the primary key it references.

**Query:** for every staff member, show their assigned branch's details, matching
`Staff.branchNo = Branch.branchNo`.

```text
Staff ⋈ Staff.branchNo = Branch.branchNo Branch
```

<div class="db-relation" markdown>
<div class="db-relation-name">Input: Staff</div>

| staffNo | name | branchNo |
|---|---|---|
| SL21 | John White | B005 |
| SG37 | Ann Beech | B003 |
| SG14 | David Ford | B003 |
| SA9 | Mary Howe | B007 |
| SL41 | Julie Lee | B005 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Input: Branch</div>

| branchNo | city |
|---|---|
| B003 | Lahore |
| B005 | Karachi |
| B007 | Islamabad |

</div>

Every staff member's `branchNo` matches exactly one `Branch` row here, so all five survive:

<div class="db-relation" markdown>
<div class="db-relation-name">Output: the equijoin — note branchNo appears TWICE</div>

| staffNo | name | branchNo | branchNo | city |
|---|---|---|---|---|
| SL21 | John White | B005 | B005 | Karachi |
| SG37 | Ann Beech | B003 | B003 | Lahore |
| SG14 | David Ford | B003 | B003 | Lahore |
| SA9 | Mary Howe | B007 | B007 | Islamabad |
| SL41 | Julie Lee | B005 | B005 | Karachi |

</div>

!!! warning "An equijoin's defining flaw: the redundant column"
    Look closely at the header row above — `branchNo` is listed **twice**, once from each
    input relation, and every value in those two columns is, by construction, identical
    (that's exactly what the equality condition guarantees). Carrying that redundant column
    around is wasteful and error-prone. **Natural join** exists solely to fix this.

## Natural Join (⋈)

A **natural join** is an equijoin performed on **all** attributes the two relations have in
common (by name), with the duplicate column automatically dropped from the result. When
people write the plain symbol ⋈ with no explicit condition, they almost always mean natural
join.

```text
Staff ⋈ Branch
```

Since `Staff` and `Branch` share exactly one common attribute name, `branchNo`, this
automatically joins on `Staff.branchNo = Branch.branchNo` — identical matching condition to
the equijoin above — but keeps only **one** copy of `branchNo`:

<div class="db-relation" markdown>
<div class="db-relation-name">Output: Staff ⋈ Branch (natural join) — one branchNo column</div>

| staffNo | name | branchNo | city |
|---|---|---|---|
| SL21 | John White | B005 | Karachi |
| SG37 | Ann Beech | B003 | Lahore |
| SG14 | David Ford | B003 | Lahore |
| SA9 | Mary Howe | B007 | Islamabad |
| SL41 | Julie Lee | B005 | Karachi |

</div>

Same five rows, same information — one fewer column of pure redundancy. This is why, in
SQL, `NATURAL JOIN` and the common `JOIN ... ON a.branchNo = b.branchNo` pattern followed by
selecting only one `branchNo` in the output are functionally the same idea; the algebra just
makes that redundancy removal automatic and explicit.

<div class="db-grid-3" markdown>
<div class="db-diagram" markdown>
<p class="db-diagram-label">Theta join</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">R × S, filtered</span><span class="db-node-sub">any comparison operator (=, &lt;, ≥, …)</span></div>
</div>
</div>
<div class="db-diagram" markdown>
<p class="db-diagram-label">Equijoin</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Theta join, θ = "="</span><span class="db-node-sub">keeps BOTH matched columns (duplicate)</span></div>
</div>
</div>
<div class="db-diagram" markdown>
<p class="db-diagram-label">Natural join</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Equijoin on shared attribute names</span><span class="db-node-sub">duplicate column removed</span></div>
</div>
</div>
</div>

## Outer Joins

Every join so far is an **inner join**: a tuple that has no match on the other side simply
vanishes from the result. That's often *not* what you want — "list every staff member, and
their properties if they have any" needs staff with zero properties to still show up.
**Outer joins** solve this by keeping unmatched rows and padding the missing side with
`NULL`.

First, the inner (natural) join for reference — every `staffNo` that appears in
`PropertyForRent` is matched to its staff row:

```text
Staff ⋈ PropertyForRent
```

<div class="db-relation" markdown>
<div class="db-relation-name">Inner join: Staff ⋈ PropertyForRent — staff with NO properties, and properties with NO staff, both vanish</div>

| staffNo | name | propertyNo | city | rent |
|---|---|---|---|---|
| SG14 | David Ford | PA14 | Lahore | 22000 |
| SG14 | David Ford | PG4 | Lahore | 35000 |
| SA9 | Mary Howe | PL94 | Islamabad | 15000 |
| SA9 | Mary Howe | PG16 | Islamabad | 45000 |
| SG37 | Ann Beech | PG36 | Lahore | 24500 |
| SL21 | John White | PG21 | Karachi | 28000 |

</div>

Two things are missing here on purpose: **Julie Lee (`SL41`)** manages no properties at all,
so she never appears; and **`PG55`** has no assigned staff (`staffNo = NULL`), so it never
appears either. Each outer join variant restores exactly one of those two gaps — or both.

### LEFT OUTER JOIN (⟕)

Keeps **every** tuple of the left relation, padding with `NULL` where no match exists on the
right.

```text
Staff ⟕ PropertyForRent
```

<div class="db-relation" markdown>
<div class="db-relation-name">Staff ⟕ PropertyForRent — every staff member kept, even with zero properties</div>

| staffNo | name | propertyNo | city | rent |
|---|---|---|---|---|
| SG14 | David Ford | PA14 | Lahore | 22000 |
| SG14 | David Ford | PG4 | Lahore | 35000 |
| SA9 | Mary Howe | PL94 | Islamabad | 15000 |
| SA9 | Mary Howe | PG16 | Islamabad | 45000 |
| SG37 | Ann Beech | PG36 | Lahore | 24500 |
| SL21 | John White | PG21 | Karachi | 28000 |
| SL41 | Julie Lee | *(NULL)* | *(NULL)* | *(NULL)* |

</div>

`SL41` is back, with `NULL` filling every column that would have come from `PropertyForRent`
— exactly what "left outer" promises: nothing on the left is ever dropped.

### RIGHT OUTER JOIN (⟖)

Symmetric to the left outer join: keeps **every** tuple of the *right* relation instead.

```text
Staff ⟖ PropertyForRent
```

<div class="db-relation" markdown>
<div class="db-relation-name">Staff ⟖ PropertyForRent — every property kept, even with no assigned staff</div>

| staffNo | name | propertyNo | city | rent |
|---|---|---|---|---|
| SG14 | David Ford | PA14 | Lahore | 22000 |
| SG14 | David Ford | PG4 | Lahore | 35000 |
| SA9 | Mary Howe | PL94 | Islamabad | 15000 |
| SA9 | Mary Howe | PG16 | Islamabad | 45000 |
| SG37 | Ann Beech | PG36 | Lahore | 24500 |
| SL21 | John White | PG21 | Karachi | 28000 |
| *(NULL)* | *(NULL)* | PG55 | Lahore | 19000 |

</div>

Now `PG55` is back (rent 19,000, no assigned staff), and `SL41` is gone again — right outer
join only ever protects rows from the *right* relation.

### FULL OUTER JOIN

Keeps **every** tuple from *both* relations, padding with `NULL` on whichever side has no
match — the union, in effect, of the left and right outer join results.

```text
Staff ⟗ PropertyForRent
```

<div class="db-relation" markdown>
<div class="db-relation-name">Staff ⟗ PropertyForRent — nothing from either side is ever dropped</div>

| staffNo | name | propertyNo | city | rent |
|---|---|---|---|---|
| SG14 | David Ford | PA14 | Lahore | 22000 |
| SG14 | David Ford | PG4 | Lahore | 35000 |
| SA9 | Mary Howe | PL94 | Islamabad | 15000 |
| SA9 | Mary Howe | PG16 | Islamabad | 45000 |
| SG37 | Ann Beech | PG36 | Lahore | 24500 |
| SL21 | John White | PG21 | Karachi | 28000 |
| SL41 | Julie Lee | *(NULL)* | *(NULL)* | *(NULL)* |
| *(NULL)* | *(NULL)* | PG55 | Lahore | 19000 |

</div>

Eight rows total: the six matched pairs, plus `SL41` (unmatched staff) and `PG55` (unmatched
property) both preserved side by side.

!!! tip "Picking the right join, fast"
    Ask which side you can't afford to lose rows from. "List every staff member, worked
    property or not" → left outer, staff on the left. "List every property, staffed or not"
    → keep properties on the "kept" side (right outer as written above, or swap operands and
    use left outer). "Give me a complete audit of both staff and properties, no gaps
    anywhere" → full outer. If you don't need unmatched rows at all, a plain (inner) natural
    join is simpler and — on real DBMSs — usually faster.

## Division (÷)

**Division** answers a distinctive shape of question: "find every value of A that is
associated, *in every single case*, with **all** of the values in some other set of B."
Formally, given $R(A, B)$ and $S(B)$ — where $S$'s only attribute(s) are a subset of $R$'s
attributes — $R \div S$ returns every value $a$ such that, for **every** tuple in $S$, the
pair $(a, b)$ exists in $R$.

**Query:** which clients have viewed **every** property located in Lahore?

First, identify the divisor — every Lahore property:

<div class="db-relation" markdown>
<div class="db-relation-name">Divisor: π propertyNo (σ city='Lahore' (PropertyForRent))</div>

| propertyNo |
|---|
| PA14 |
| PG4 |
| PG36 |

</div>

<div class="db-relation" markdown>
<div class="db-relation-name">Dividend: π clientNo, propertyNo (Viewing)</div>

| clientNo | propertyNo |
|---|---|
| CR56 | PA14 |
| CR56 | PG4 |
| CR56 | PG36 |
| CR62 | PA14 |
| CR62 | PG4 |
| CR76 | PG4 |

</div>

```text
π clientNo, propertyNo (Viewing) ÷ π propertyNo (σ city='Lahore' (PropertyForRent))
```

Work it by hand, one candidate `clientNo` at a time — group the dividend by `clientNo` and
check whether that client's set of viewed properties is a **superset** of the divisor
`{PA14, PG4, PG36}`:

- **CR56** viewed `{PA14, PG4, PG36}` — contains all three required properties ✓ **included**
- **CR62** viewed `{PA14, PG4}` — missing `PG36` ✗ excluded
- **CR76** viewed `{PG4}` — missing `PA14` and `PG36` ✗ excluded

<div class="db-relation" markdown>
<div class="db-relation-name">Output: clients who have viewed every Lahore property</div>

| clientNo |
|---|
| CR56 |

</div>

Only `CR56` has viewed all three Lahore properties; `CR62` came close (two of three) but
division has no notion of "mostly" — it is all-or-nothing by definition.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Division, visually: which clientNo groups are a superset of the divisor?</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">CR56 → {PA14, PG4, PG36}</span>
<span class="db-node-sub">superset of divisor {PA14, PG4, PG36} — KEPT</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">CR62 → {PA14, PG4}</span>
<span class="db-node-sub">missing PG36 — dropped</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">CR76 → {PG4}</span>
<span class="db-node-sub">missing PA14, PG36 — dropped</span>
</div>
</div>
</div>

!!! note "Division has no single native SQL keyword"
    Unlike SELECT, PROJECT, and the joins — which map almost directly onto `WHERE`,
    `SELECT`, and `JOIN` — division has to be *built* in SQL, typically with a double
    negation ("no Lahore property exists that this client has NOT viewed") using nested
    `NOT EXISTS` subqueries, or with a `GROUP BY` plus `HAVING COUNT(...) = (total divisor
    count)`. That SQL translation is one of the more genuinely tricky patterns you'll meet
    later in the course — having a solid hand-traced mental model of division from examples
    like this one is exactly what makes that SQL pattern eventually click instead of feeling
    arbitrary.

## Try It Yourself

1. Using the full `PropertyForRent` table at the top of this lecture, hand-trace
   `PropertyForRent ⋈ PropertyForRent.ownerNo = PrivateOwner.ownerNo PrivateOwner` (an
   equijoin) — list the resulting rows, including which attribute appears twice.
2. Convert your answer to (1) into a natural join instead, and state exactly which column
   disappears.
3. Using `Viewing` and `Client`, compute `Viewing ⋈ Client` (natural join on `clientNo`) and
   then decide: would a `RIGHT OUTER JOIN Viewing ⟖ Client` produce any additional rows
   beyond the inner join? Justify your answer by checking whether every `Client` row has at
   least one matching `Viewing` row.
4. Compute `π clientNo, propertyNo (Viewing) ÷ π propertyNo (PropertyForRent)` — division
   by *every* property in the whole agency, not just Lahore's. Which clients, if any, survive
   this stricter division? (Hint: no client has viewed all seven properties — confirm the
   result is empty, and explain in one sentence why an empty result is still a perfectly
   valid, correct answer.)

## Key Takeaways

- **Theta join** = Cartesian product + a SELECT with any comparison operator θ — the most
  general join.
- **Equijoin** is the theta join special case restricted to `=`; it always leaves a
  redundant duplicate column behind.
- **Natural join (⋈)** is an equijoin on all commonly-named attributes, with the duplicate
  column automatically removed — the join you'll write and think in most often.
- **Outer joins** preserve unmatched rows that an inner join would silently drop: **left**
  keeps every left-relation row, **right** keeps every right-relation row, **full** keeps
  both — all padding missing values with `NULL`.
- **Division (÷)** answers "find every A related to *all* of a given set of B" — computed by
  grouping the dividend by its A-value and keeping only groups whose B-values are a superset
  of the divisor; it has no single SQL keyword and is usually expressed through nested
  `NOT EXISTS` or `GROUP BY … HAVING COUNT(...)`.

This closes out unary, set, join, and division operations — the full core of relational
algebra. Later lectures in this unit turn to **relational calculus** (a declarative
counterpart to everything covered in this lecture and the last) before the course moves on
to SQL itself, where every one of these operators reappears under a more familiar syntax.
