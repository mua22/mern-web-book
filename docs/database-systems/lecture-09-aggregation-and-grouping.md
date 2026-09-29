---
title: "9. Aggregation and Grouping"
tags:
  - CSC270
  - Relational Algebra
  - Aggregate Functions
  - Grouping
---

# 9. Aggregation and Grouping

Every query you have written so far answers a question about individual tuples: *which*
rows satisfy a condition, *which* columns to keep, *which* rows two relations share. But a
huge fraction of real questions a business asks are not about individual rows at all — they
are about **summaries** over many rows at once: "what is our total wage bill?", "how many
staff work at each branch?", "what's the average rent per property type?" Relational algebra
answers these with two closely related, easily confused operators: **aggregation**, which
collapses many tuples into one summary value, and **grouping**, which first splits a relation
into buckets so aggregation can be applied separately to each bucket. This lecture builds
both, precisely, and shows exactly how they compose.

We continue the property rental agency database from Lectures 5–8: `Branch`, `Staff`, and
now `PropertyForRent`, whose full schema is introduced below.

## In This Lecture

- Why relational algebra's five basic operators (Lectures 7–8) cannot answer summary
  questions on their own
- The aggregate functions: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`
- The formal aggregate operator, written ℱ (script F), and how to read it
- The grouping operator, written 𝔊 (script G), and what it means to "group by" an attribute
- Combining grouping with aggregation to answer per-group summary questions
- Worked examples: total salary per branch, count of staff per position, average rent per
  property type
- Common pitfalls: aggregating without grouping when you meant to group, and grouping by the
  wrong attribute set

## Why Aggregation Is a New Kind of Operator

Every operator from Lectures 7–8 — selection (σ), projection (π), union, difference, the
various joins — takes one or two relations and produces **another relation of the same
general shape**: still rows and columns, still one tuple per matching input row (or fewer,
after filtering). None of them can answer "how many rows are there?" or "what's the total of
this column?" because those questions don't ask for a filtered or combined set of tuples —
they ask for a single number *computed from* many tuples.

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

"What is the total salary bill?" is not a question about *which* tuples to keep — it needs
every tuple, reduced to a single number: 30000 + 12000 + 18000 + 9000 + 22000 = **91000**.
No σ, π, or ⋈ expression can produce that, because their output is always a relation whose
tuples come *from* the input, never a value *computed across* the input. Relational algebra
needs a genuinely new operator family for this, which is exactly what aggregate functions
provide.

## Aggregate Functions

An **aggregate function** takes a collection of values from one column of a relation and
reduces them to a single summary value. The relational model (and SQL, which you'll meet in
Unit 6) provides five standard aggregate functions:

| Function | Meaning | Applies to |
|---|---|---|
| `COUNT` | Number of values (or tuples) | Any type |
| `SUM` | Total of all values | Numeric only |
| `AVG` | Arithmetic mean of all values | Numeric only |
| `MIN` | Smallest value | Numeric, or any orderable type |
| `MAX` | Largest value | Numeric, or any orderable type |

Applied to the `Staff.salary` column above:

| Function | Result |
|---|---|
| `COUNT(salary)` | 5 |
| `SUM(salary)` | 91000 |
| `AVG(salary)` | 18200 |
| `MIN(salary)` | 9000 |
| `MAX(salary)` | 30000 |

!!! note "COUNT is special"
    `COUNT` is the only aggregate function that makes sense on *any* column, including
    non-numeric ones (`COUNT(name)`) — and `COUNT(*)` counts tuples directly, ignoring
    columns entirely. The other four require a numeric (or at least orderable) domain,
    since "the average of five job titles" is meaningless.

### The Aggregate Operator, ℱ

Formally, relational algebra extends its operator set with the **aggregate operator**,
written ℱ (a script capital F), which applies one or more aggregate functions across an
entire relation and produces a single-tuple result:

```text
ℱ <function-list> (R)
```

For example, "find the total and average salary across all staff":

```text
ℱ SUM(salary), AVG(salary) (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result of ℱ SUM(salary), AVG(salary) (Staff)</div>

| SUM(salary) | AVG(salary) |
|---|---|
| 91000 | 18200 |

</div>

Notice the result is a relation with exactly **one tuple** — no matter how many rows
`Staff` had, ℱ always collapses them all into a single summary row, because with no
grouping attribute specified, the entire relation is treated as one group.

!!! warning "Aggregation is not filtering"
    A beginner's mistake is expecting `ℱ AVG(salary) (Staff)` to somehow list each staff
    member alongside the average. It does not — it discards every individual `name`,
    `position`, and `staffNo` value entirely and returns only the single computed number.
    If you need individual rows *and* a summary value side by side, that's a different,
    more advanced technique (a correlated subquery in SQL) outside the scope of pure
    aggregation.

## Grouping Operations

Aggregating the *whole* relation answers "what's the total salary bill for the company?" —
but "what's the total salary bill **per branch**?" is a different, more useful question. It
needs the relation split into buckets first — one bucket per branch — with the aggregate
function applied separately inside each bucket. That splitting step is **grouping**.

**Grouping** partitions a relation into subsets, called **groups**, such that every tuple in
a group shares the same value for one or more chosen **grouping attributes**, and every
tuple with that value ends up in that same group. Grouping `Staff` by `branchNo` produces
three groups from the five rows shown earlier:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Grouping Staff by branchNo, before any aggregate is applied</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Group B005</span>
<span class="db-node-sub">SL21 John White · SL41 Julie Lee</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Group B003</span>
<span class="db-node-sub">SG37 Ann Beech · SG14 David Ford</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Group B007</span>
<span class="db-node-sub">SA9 Mary Howe</span>
</div>
</div>
</div>

Grouping alone produces no new information — it's purely an organizational step. Its value
only appears once an aggregate function is applied to *each* group separately, which is
exactly what the grouping operator, combined with ℱ, does next.

!!! tip "Every distinct value of the grouping attribute gets exactly one group"
    If `Staff` had a sixth row at a brand-new `B009` branch, grouping by `branchNo` would
    automatically produce a fourth group — you never declare groups in advance; they fall
    out entirely from the distinct values already present in the grouping attribute.

## Grouping With Aggregate Functions

Relational algebra writes "group, then aggregate per group" with the **grouping operator**,
written 𝔊 (a script capital G), placed before ℱ:

```text
<grouping-attributes> 𝔊 ℱ <function-list> (R)
```

Read this left to right as: *partition R into groups sharing the same value of
grouping-attributes, then compute function-list separately within each group, producing one
result tuple per group.*

### Worked Example 1 — Total Salary Per Branch

"Find the total salary bill for each branch":

```text
branchNo 𝔊 ℱ SUM(salary) (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result of branchNo 𝔊 ℱ SUM(salary) (Staff)</div>

| branchNo | SUM(salary) |
|---|---|
| B005 | 52000 |
| B003 | 30000 |
| B007 | 9000 |

</div>

Trace it by hand: B005's group holds John White (30000) and Julie Lee (22000), summing to
52000; B003's group holds Ann Beech (12000) and David Ford (18000), summing to 30000; B007's
group holds only Mary Howe, so its "sum" is just her single salary, 9000. One result tuple
per group, exactly as promised — three branches in, three summary rows out, regardless of
how many staff each branch happens to have.

### Worked Example 2 — Count of Staff Per Position

"How many staff hold each position?" — group by `position` instead of `branchNo`, and count
instead of sum:

```text
position 𝔊 ℱ COUNT(staffNo) (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result of position 𝔊 ℱ COUNT(staffNo) (Staff)</div>

| position | COUNT(staffNo) |
|---|---|
| Manager | 2 |
| Assistant | 2 |
| Supervisor | 1 |

</div>

John White and Julie Lee are both Managers (group size 2); Ann Beech and Mary Howe are both
Assistants (group size 2); David Ford is the only Supervisor (group size 1). Changing which
attribute you group by changes the entire shape of the result — grouping is not a fixed
step, it's a choice you make based on exactly what question you're answering.

### Worked Example 3 — Multiple Aggregates in One Grouped Query

Nothing stops you from computing several aggregate functions over the same groups at once.
"For each branch, report the number of staff, and their average and maximum salary":

```text
branchNo 𝔊 ℱ COUNT(staffNo), AVG(salary), MAX(salary) (Staff)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result of branchNo 𝔊 ℱ COUNT(staffNo), AVG(salary), MAX(salary) (Staff)</div>

| branchNo | COUNT(staffNo) | AVG(salary) | MAX(salary) |
|---|---|---|---|
| B005 | 2 | 26000 | 30000 |
| B003 | 2 | 15000 | 18000 |
| B007 | 1 | 9000 | 9000 |

</div>

B005's average is (30000 + 22000) / 2 = 26000, and its maximum is John White's 30000. B003's
average is (12000 + 18000) / 2 = 15000, maximum 18000. B007 has only one row, so its count,
average, and maximum all reduce to Mary Howe's single salary.

## A Second Running Example: PropertyForRent

To see grouping answer a question about something other than staff, bring in
`PropertyForRent`, the relation that records every property the agency has listed:

<div class="db-relation" markdown>
<div class="db-relation-name">PropertyForRent (<u>propertyNo</u>, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)</div>

| propertyNo | street | city | type | rooms | rent | branchNo |
|---|---|---|---|---|---|---|
| PA14 | 6 Lawrence St | Islamabad | House | 5 | 42000 | B007 |
| PL94 | 22 Mall Rd | Karachi | Flat | 3 | 28000 | B005 |
| PG4 | 18 Dale Rd | Lahore | Flat | 3 | 21000 | B003 |
| PG36 | 2 Manor Rd | Lahore | Flat | 4 | 26000 | B003 |
| PG21 | 5 Novar Dr | Lahore | House | 5 | 39000 | B003 |

</div>

"Find the average rent and number of properties of each type":

```text
type 𝔊 ℱ COUNT(propertyNo), AVG(rent) (PropertyForRent)
```

<div class="db-relation" markdown>
<div class="db-relation-name">Result of type 𝔊 ℱ COUNT(propertyNo), AVG(rent) (PropertyForRent)</div>

| type | COUNT(propertyNo) | AVG(rent) |
|---|---|---|
| House | 2 | 40500 |
| Flat | 3 | 25000 |

</div>

Check the Flat row by hand: PL94 (28000), PG4 (21000), PG36 (26000) sum to 75000, divided by
3 gives exactly 25000. The House row: PA14 (42000) and PG21 (39000) sum to 81000, divided by
2 gives 40500. This is precisely the shape of question a rental agency asks constantly —
"what's a fair market rent for a flat?" — and it is answered by grouping plus aggregation,
never by selection or projection alone.

## Composing Grouping With Selection

Grouping and aggregation combine naturally with the operators from Lectures 7–8. "Find the
total rent collected on properties managed by branch B003" first filters with σ, *then*
aggregates:

```text
ℱ SUM(rent) (σ branchNo = 'B003' (PropertyForRent))
```

Filter first: only PG4, PG36, and PG21 survive the selection (all three belong to B003).
Then aggregate the filtered set: 21000 + 26000 + 39000 = 86000. Order matters here — filter
*before* you aggregate whenever the condition is about individual tuples (which branch),
and group *after* any such filter, so the aggregate only ever sees the rows you actually
want summarized.

!!! warning "Grouping by the wrong attribute silently changes the question"
    `branchNo 𝔊 ℱ SUM(rent) (PropertyForRent)` and `type 𝔊 ℱ SUM(rent) (PropertyForRent)`
    are both perfectly valid — and produce completely different, equally "correct" looking
    tables. Before writing a grouped query, always state the question in plain English
    first ("total rent *per branch*" vs. "total rent *per property type*") and let that
    sentence tell you exactly which attribute belongs after 𝔊. Grouping by the wrong
    attribute is a silent logic error, not a syntax error — the query still runs and still
    returns a plausible-looking table.

## Key Takeaways

- The five aggregate functions — `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` — reduce many values
  from one column into a single summary value; none of Lectures 7–8's operators can do this.
- The **aggregate operator** ℱ applies aggregate functions across an entire relation,
  producing exactly one result tuple, when no grouping attribute is specified.
- **Grouping** partitions a relation into buckets sharing a common value on one or more
  grouping attributes — by itself it reorganizes tuples but computes nothing.
- The **grouping operator** 𝔊, written before ℱ as `grouping-attrs 𝔊 ℱ function-list (R)`,
  applies the aggregate functions separately to each group, producing one summary tuple
  *per group* rather than one summary tuple for the whole relation.
- Worked examples confirmed by hand: total salary per branch (52000 / 30000 / 9000), count
  of staff per position (2 / 2 / 1), and average rent per property type (40500 / 25000).
- Filter with σ *before* grouping whenever the condition concerns individual tuples;
  choosing the wrong grouping attribute is a silent logic error, not a syntax error, so
  always state the question in plain English before writing the algebra.

Grouping and aggregation finish the algebra's toolkit for *computing* over relations — the
next lecture turns to a completely different way of asking the same questions: not "apply
these operators in this order," but "describe, declaratively, what the answer looks like."
Continue to [Lecture 10 — Relational Calculus](lecture-10-relational-calculus.md).
