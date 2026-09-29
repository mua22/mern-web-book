---
title: "25. Indexing"
tags:
  - CSC270
  - Indexing
  - Query Performance
  - B-Trees
---

# 25. Indexing

Every query you have written since Unit 2 eventually has to touch physical storage: rows
sitting in disk blocks, read one block at a time. So far we have quietly assumed the DBMS
finds the right rows efficiently — but ask yourself what actually has to happen to answer
`WHERE propertyNo = 'PA14'` against a table of ten million properties, with nothing extra
to help. Without help, the DBMS has exactly one option: check every single row. **Indexing**
is the technique that avoids this, and it is arguably the single most important physical
design decision a database administrator makes, because the right index can turn a query
that takes minutes into one that takes microseconds — with no change to the query itself.

We continue the `PropertyForRent` relation from the DreamHome case study introduced in
earlier lectures.

## In This Lecture

- Why a table with no index forces a full table scan for every lookup
- **Primary indexes** — built on the ordering key of a physically ordered file
- **Secondary indexes** — built on a non-ordering field, for queries the file isn't sorted by
- **Dense vs. sparse indexes** — one entry per record vs. one entry per block
- **Single-level vs. multi-level indexes** — why big indexes need to be indexed themselves
- How to choose which columns are actually worth indexing
- The real trade-off: faster reads against slower writes and extra storage
- Real `CREATE INDEX` SQL syntax

## The Cost of Not Having an Index

Consider `PropertyForRent` with a few sample rows:

<div class="db-relation" markdown>
<div class="db-relation-name">PropertyForRent (<u>propertyNo</u>, street, city, type, rooms, rent, branchNo)</div>

| propertyNo | street | city | type | rooms | rent | branchNo |
|---|---|---|---|---|---|---|
| PA14 | 6 Lawrence St | Islamabad | House | 5 | 42000 | B007 |
| PL94 | 22 Mall Rd | Karachi | Flat | 3 | 28000 | B005 |
| PG4 | 18 Dale Rd | Lahore | Flat | 3 | 21000 | B003 |
| PG36 | 2 Manor Rd | Lahore | Flat | 4 | 26000 | B003 |
| PG21 | 5 Novar Dr | Lahore | House | 5 | 39000 | B003 |

</div>

Five rows is nothing — a query like `SELECT * FROM PropertyForRent WHERE propertyNo = 'PG21'`
scans all five in a blink no matter how the DBMS looks for it. Now imagine the same table
holding 10,000,000 properties spread across 500,000 disk blocks. With no index, finding
`PG21` means a **full table scan**: read block 1, check every row in it, read block 2, check
every row in it, and so on — on average reading half the table, and in the worst case (the
row isn't there, or it's the very last one) reading *all* 500,000 blocks.

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Without an index — full table scan</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Read block 1</span><span class="db-node-sub">Check every row — no match</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Read block 2</span><span class="db-node-sub">Check every row — no match</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">… up to block 500,000</span><span class="db-node-sub">Worst case: read every block</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">With an index — direct lookup</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Look up PG21 in the index</span><span class="db-node-sub">A handful of comparisons, not 500,000</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Follow the pointer</span><span class="db-node-sub">Jump straight to block 214,009</span></div>
</div>
</div>

</div>

An **index** is exactly what the comparison above suggests: a small, separately stored
structure that maps values of a chosen field (or fields) directly to the disk block (or exact
row) that holds them — so the DBMS can *jump* to the answer instead of *scanning* for it. The
price is that the index itself takes disk space and has to be kept up to date every time the
underlying table changes; the rest of this lecture is about that trade-off, and about the
different shapes an index can take.

## Primary Indexes

A **primary index** is built on the field that the data file is physically **ordered** by —
almost always the primary key, since that's the field most systems choose to sort the file on
when one is needed. Because the file is already sorted on this field, the index only needs
**one entry per distinct key value**, pointing to the first record with that value (or to the
block that contains it).

<div class="db-relation" markdown>
<div class="db-relation-name">Primary index on PropertyForRent(propertyNo), file physically ordered by propertyNo</div>

| Index entry: propertyNo | Pointer |
|---|---|
| PA14 | → block 1 |
| PG4 | → block 2 |
| PG21 | → block 2 |
| PG36 | → block 3 |
| PL94 | → block 3 |

</div>

!!! note "A primary index assumes an ordered file"
    This only works because `PropertyForRent` is physically stored in `propertyNo` order.
    If the file were unordered — the far more common case in practice — there is no
    "primary index" possible on it at all; you'd need a different kind of index (a
    **clustering index**, out of scope here, or the secondary index below) to speed up
    lookups on that field.

## Secondary Indexes

Most useful queries do *not* filter on the field a file happens to be ordered by. "Find all
properties in Lahore" filters on `city` — a field `PropertyForRent` is not sorted by. A
**secondary index** solves exactly this: it is built on a non-ordering field, and it must
have **one entry for every record**, because unlike a primary index it cannot rely on nearby
values being physically adjacent on disk — matching rows could be scattered across the entire
file.

<div class="db-relation" markdown>
<div class="db-relation-name">Secondary index on PropertyForRent(city)</div>

| Index entry: city | Pointer |
|---|---|
| Islamabad | → PA14 |
| Karachi | → PL94 |
| Lahore | → PG4 |
| Lahore | → PG36 |
| Lahore | → PG21 |

</div>

Notice `Lahore` appears three times — once per matching record — because a secondary index
cannot compress multiple rows into one entry the way a primary index can. This is the direct
cause of the dense-vs-sparse distinction below.

## Dense and Sparse Indexes

- A **dense index** has **one index entry for every record** in the file, whether or not the
  file is ordered on that field. Every secondary index is necessarily dense.
- A **sparse index** has **one index entry per block** (not per record), storing only the
  first key value in each block. This is only possible when the file is physically ordered on
  the indexed field, because then the DBMS can find any record by locating its block through
  the sparse index and scanning just that one block.

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Dense index <span class="db-badge db-badge-orange">1 entry / record</span></p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">PA14 → record 1</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">PG4 → record 2</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">PG21 → record 3</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">PG36 → record 4</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">PL94 → record 5</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Sparse index <span class="db-badge db-badge-teal">1 entry / block</span></p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">PA14 → block 1</span><span class="db-node-sub">holds PA14</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">PG4 → block 2</span><span class="db-node-sub">holds PG4, PG21</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">PG36 → block 3</span><span class="db-node-sub">holds PG36, PL94</span></div>
</div>
</div>

</div>

A sparse index is smaller and therefore faster to search than a dense one over the same file
— but it can only ever be built on a field the file is physically ordered by, which is why a
table typically has at most one sparse (primary) index but can have many dense (secondary)
indexes.

## Single-Level and Multi-Level Indexes

Everything above was a **single-level index**: one flat list of (key, pointer) pairs. That
works fine while the index itself is small enough to search quickly — but an index over ten
million rows is itself a large file. If the index no longer fits comfortably in memory,
searching *it* starts to suffer from the same problem the index was built to solve in the
first place.

The fix is to apply the same idea recursively: build an index **on the index**. This produces
a **multi-level index** — the structure underlying the B-tree and B+-tree indexes that every
production DBMS (MySQL's InnoDB, PostgreSQL, SQL Server, Oracle) actually uses internally.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Multi-level index — index the index, as many times as needed</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">Top-level (second-level) index</span> <span class="db-node-sub">— small enough to fit in one block; one entry per block of the level below</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">First-level index</span> <span class="db-node-sub">— one entry per data block, exactly like the single-level index above</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Data file</span> <span class="db-node-sub">— the actual PropertyForRent rows, in disk blocks</span></div>
</div>
</div>

A lookup now walks *down* the levels — check the top-level index (one block), follow its
pointer to the right first-level block, follow *that* pointer to the right data block — instead
of scanning a single enormous flat index. A B+-tree is precisely this idea made
self-balancing: it keeps every level the same depth automatically as rows are inserted and
deleted, guaranteeing that any lookup touches only a handful of blocks even as the table grows
into the billions of rows.

!!! tip "This is why index lookups are described as O(log n)"
    Each level of a balanced multi-level index divides the search space by roughly the same
    factor (the number of entries that fit in one block). That's exactly what gives B-tree
    indexes their logarithmic lookup cost, in sharp contrast to a full table scan's linear
    `O(n)` cost — the same `O(1)`-vs-`O(n)` gap from the data structures course, now showing up
    inside the database engine itself.

## Creating Indexes in SQL

In practice, you never build or maintain index structures yourself — the DBMS does it, once
you tell it which column(s) to index:

```sql
-- A simple secondary index on one column
CREATE INDEX idx_property_city
ON PropertyForRent (city);

-- A unique index -- also enforces that no two rows may share a value
CREATE UNIQUE INDEX idx_property_no
ON PropertyForRent (propertyNo);

-- A composite (multi-column) index -- useful when queries filter on both columns together
CREATE INDEX idx_property_city_rent
ON PropertyForRent (city, rent);

-- Removing an index that is no longer earning its cost
DROP INDEX idx_property_city;
```

Most relational engines automatically create an index behind every `PRIMARY KEY` and often
every `UNIQUE` constraint — you are only responsible for the *extra* indexes your query
workload needs.

## Index Selection and Performance

Not every column deserves an index — an index that's never used still costs storage and slows
every write. Good candidates share these properties:

- **High selectivity** — the column has many distinct values, so an index lookup narrows the
  search dramatically (`propertyNo`, `email`). A column like `isActive` (only two possible
  values) barely benefits, since an index lookup still returns roughly half the table.
- **Foreign keys** — almost always worth indexing, since they're constantly used in joins.
- **Columns in `WHERE` clauses** — filters your application runs often and against large
  tables are the clearest case for an index.
- **Columns in `ORDER BY`** — an index on the sort column can let the DBMS skip a separate
  sort step entirely.
- **Columns in `JOIN` conditions** — exactly where a foreign-key index pays off most visibly.

!!! warning "Indexing everything is not a shortcut to a fast database"
    Every index the DBMS maintains must be updated on every `INSERT`, `UPDATE`, or `DELETE`
    that touches the indexed column — so an over-indexed table can make writes dramatically
    slower without a matching benefit, since most of those indexes are never actually used by
    a query. Index selection is a genuine design decision, made from the query workload the
    application actually runs, not a rule of "more indexes are always better."

## Advantages and Disadvantages of Indexing

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Advantages</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Much faster reads</span><span class="db-node-sub">O(log n) lookups instead of O(n) scans</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Faster sorting and joins</span><span class="db-node-sub">An indexed sort order can avoid a separate sort step</span></div>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Enforces uniqueness</span><span class="db-node-sub">UNIQUE indexes double as a constraint</span></div>
</div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Disadvantages</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Slower writes</span><span class="db-node-sub">Every INSERT/UPDATE/DELETE must also update every affected index</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Extra storage</span><span class="db-node-sub">An index over a large table can itself be sizeable</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Maintenance overhead</span><span class="db-node-sub">Indexes can fragment and need periodic rebuilding</span></div>
</div>
</div>

</div>

## Key Takeaways

- With no index, the DBMS must run a **full table scan** — checking every row — for any
  lookup that isn't handled another way; the cost grows linearly with table size.
- A **primary index** is built on the field a file is physically ordered by, and needs only
  one entry per distinct key value; a **secondary index** is built on any other field and
  must be **dense** (one entry per record), since matching rows aren't physically grouped.
- **Sparse indexes** (one entry per block) are only possible on an ordered file's primary
  index; every secondary index is necessarily **dense**.
- A **single-level index** that itself grows too large to search quickly is solved by
  building a **multi-level index** — an index on the index — which is exactly the idea
  behind the B-tree/B+-tree structures every production DBMS uses internally.
- Choose indexes based on real query workload: high-selectivity columns, foreign keys, and
  columns that appear in `WHERE`, `JOIN`, and `ORDER BY` clauses — not every column.
- Indexing is a genuine trade-off: faster reads and joins, at the cost of slower writes and
  extra storage — never "free" performance.

Indexing is the last physical-design tool in the relational toolbox this course covers before
we widen the lens. The next three lectures step outside the relational model entirely, to see
how a different family of databases — NoSQL — solves storage and lookup problems that don't
fit neatly into rows and columns at all. Continue to
[Lecture 26 — Introduction to NoSQL Databases](lecture-26-introduction-to-nosql-databases.md).
