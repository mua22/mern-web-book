---
title: "23. Views and Materialized Views"
tags:
  - CSC270
  - SQL
  - Views
  - Database Design
---

# 23. Views and Materialized Views

Normalization (Lectures 18-22) is a discipline aimed at the *storage* layer: split data so
every fact lives in exactly one place. But the applications and users querying a database
rarely want to think in terms of ten small, carefully normalized tables — they want "show me
this branch's current staff roster" as a single, simple query. **Views** bridge that gap:
they let you define a convenient, application-friendly shape over a normalized schema
without duplicating a single byte of data. This lecture covers ordinary views, their
strengths and real limitations, and their physically-stored cousin, the **materialized
view** — a deliberate, managed trade of storage and staleness for query speed.

## In This Lecture

- What a view is: a virtual table with no stored data of its own
- Creating views with `CREATE VIEW ... AS SELECT ...`
- Querying a view exactly like a base table
- Which views are updatable, and which fundamentally cannot be
- Advantages and disadvantages of ordinary views
- Materialized views: what "materialized" actually changes
- Creating and refreshing materialized views, and the refresh strategies available
- Advantages and disadvantages of materialized views, weighed against ordinary views

## Introduction to Views

A **view** is a **virtual table** — its definition is a stored query, but it has no rows of
its own on disk. Every time you query a view, the DBMS runs the view's underlying query
(against the current data in the base tables) and hands you the result as if it were a
table. Nothing is duplicated; the view is a *lens* onto the base tables, not a copy of them.

Consider the running `Branch` and `Staff` relations from Lecture 5. A branch manager should
only ever need to see staff at *their own* branch, not the whole company:

<div class="db-relation" markdown>
<div class="db-relation-name">Staff (<u>staffNo</u>, name, position, salary, branchNo)</div>

| staffNo | name | position | salary | branchNo |
|---|---|---|---|---|
| SL21 | John White | Manager | 30000 | B005 |
| SG37 | Ann Beech | Assistant | 12000 | B003 |
| SG14 | David Ford | Supervisor | 18000 | B003 |
| SA9 | Mary Howe | Assistant | 9000 | B007 |

</div>

## Creating Views

`CREATE VIEW` names a query and gives it a permanent, reusable identity in the schema:

```sql
CREATE VIEW Branch003Staff AS
    SELECT staffNo, name, position, salary
    FROM Staff
    WHERE branchNo = 'B003';
```

Nothing was copied. `Branch003Staff` is just a name bound to that `SELECT` statement; every
time it's referenced, the DBMS re-runs the query against the live `Staff` table. A view can
join multiple base tables, filter, rename, and aggregate — anything a `SELECT` can do:

```sql
CREATE VIEW StaffWithBranchCity AS
    SELECT s.staffNo, s.name, s.position, b.city
    FROM Staff s
    JOIN Branch b ON s.branchNo = b.branchNo;
```

```sql
CREATE VIEW BranchSalaryTotals AS
    SELECT branchNo, COUNT(*) AS staffCount, SUM(salary) AS totalSalary
    FROM Staff
    GROUP BY branchNo;
```

## Querying Views

Once created, a view is queried exactly like a base table — this transparency is the whole
point; the application code doesn't need to know or care that it's talking to a view:

```sql
SELECT * FROM Branch003Staff
WHERE salary > 10000
ORDER BY salary DESC;
```

You can even join a view with a base table, or with another view, and the result is
computed correctly each time by re-evaluating both underlying queries and combining them —
the DBMS handles this transparently.

## Updating Views

Whether `INSERT`, `UPDATE`, or `DELETE` through a view is even legal depends entirely on how
the view is defined, because every such operation has to be translated, unambiguously, back
into a change on the underlying base table(s). A view is generally **updatable** only if it:

- Is built from a **single** base table (no join),
- Does **not** use `DISTINCT`,
- Does **not** use `GROUP BY`, `HAVING`, or an aggregate function (`SUM`, `COUNT`, `AVG`, ...),
- Does **not** use set operations (`UNION`, `INTERSECT`, `EXCEPT`),
- Includes every column that has no default value and disallows `NULL` in the base table
  (otherwise an `INSERT` through the view couldn't populate a required column at all).

`Branch003Staff` above qualifies — it's a single-table, no-aggregate `SELECT` — so this is
legal and behaves exactly as if you'd updated `Staff` directly:

```sql
UPDATE Branch003Staff
SET salary = salary * 1.05
WHERE staffNo = 'SG37';
```

`BranchSalaryTotals`, by contrast, is **not updatable** — it has no meaningful way to push
"set `totalSalary` to 50000" back onto individual `Staff` rows; the aggregation has
irreversibly thrown away the row-level detail needed to know *which* salary to change, and
by how much. `StaffWithBranchCity` is likewise not updatable in most systems, because a
single `UPDATE` through a two-table join view is ambiguous about which base table a changed
column belongs to.

!!! warning "Attempting to update a non-updatable view"
    Most database systems simply reject the statement outright:
    ```sql
    UPDATE BranchSalaryTotals SET totalSalary = 50000 WHERE branchNo = 'B003';
    -- ERROR: cannot update a view that contains aggregate functions
    ```
    A handful of systems support `INSTEAD OF` triggers that let you define custom logic for
    what an `INSERT`/`UPDATE`/`DELETE` on an otherwise non-updatable view should actually do
    to the base tables — but that's application-defined behavior layered on top, not
    something the view provides automatically.

## Advantages and Disadvantages of Views

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Advantages</span>
<span class="db-node-sub">Security — grant access to a view's rows/columns without exposing the whole base table (Lecture 24 builds directly on this). Simplicity — hide complex joins and aggregations behind one simple name. Logical data independence — the base schema can be restructured, and as long as the view definition is updated to match, every application querying the view keeps working unchanged.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Disadvantages</span>
<span class="db-node-sub">Performance overhead — the underlying query re-runs on every reference, which can be expensive for a complex join or aggregation queried frequently. Update restrictions — many useful views (joins, aggregates, DISTINCT) are simply not updatable, as shown above, forcing applications back to the base tables for writes.</span>
</div>
</div>

## Materialized Views

An ordinary view stores no data — it recomputes its result every time. A **materialized
view** is a view whose result set **is** physically stored (materialized) on disk, exactly
like a real table, and periodically refreshed to catch up with changes in the base tables.
Querying a materialized view reads the stored, precomputed result directly — no re-running
the underlying join or aggregation at query time.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Ordinary View vs. Materialized View, at Query Time</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Query a plain VIEW</span><span class="db-node-sub">Re-runs the underlying SELECT against base tables, every time</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Fresh result, every query</span><span class="db-node-sub">Cost: recomputation on every access</span></div>
</div>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Query a MATERIALIZED VIEW</span><span class="db-node-sub">Reads the stored result directly, like a table</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Fast, but possibly stale</span><span class="db-node-sub">Cost: storage, and a refresh step to stay current</span></div>
</div>
</div>

### Creating Materialized Views

```sql
CREATE MATERIALIZED VIEW BranchSalaryTotals_MV AS
    SELECT branchNo, COUNT(*) AS staffCount, SUM(salary) AS totalSalary
    FROM Staff
    GROUP BY branchNo;
```

The syntax is nearly identical to an ordinary view — only the keyword changes — but the
effect is very different: `BranchSalaryTotals_MV` now occupies real storage, sized like the
query's result set, and does **not** automatically reflect a subsequent `UPDATE` to `Staff`
until it is explicitly refreshed.

### Refreshing Materialized Views

Because the stored data can drift out of sync with the base tables, every materialized view
needs a **refresh strategy**:

```sql
-- On-demand: refresh right now, blocking until it completes
REFRESH MATERIALIZED VIEW BranchSalaryTotals_MV;
```

```sql
-- On-demand, without blocking concurrent reads of the old data while it refreshes
REFRESH MATERIALIZED VIEW CONCURRENTLY BranchSalaryTotals_MV;
```

```sql
-- Scheduled: many systems pair this with a job scheduler rather than SQL syntax alone
-- e.g. a nightly cron job or database job scheduler calling REFRESH on a timer
```

```sql
-- On-commit: some systems (e.g. Oracle) support automatic refresh
-- triggered by the base table's own committed transactions
CREATE MATERIALIZED VIEW BranchSalaryTotals_MV
    REFRESH ON COMMIT AS
    SELECT branchNo, COUNT(*) AS staffCount, SUM(salary) AS totalSalary
    FROM Staff
    GROUP BY branchNo;
```

| Refresh strategy | When it runs | Best for |
|---|---|---|
| **On-demand** | Manually, whenever an administrator or job issues `REFRESH` | Reports run occasionally, where staleness between runs is acceptable |
| **Scheduled** | On a timer (nightly, hourly) via a job scheduler | Dashboards and analytics where a known, bounded staleness window is fine |
| **On-commit** | Automatically, as part of every committing transaction on a base table | Data that must never be stale, at the cost of slower writes |

### Advantages and Disadvantages of Materialized Views

<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Advantages</span>
<span class="db-node-sub">Query performance — expensive joins and aggregations are computed once at refresh time, not on every read. Reduces load on base tables for read-heavy reporting and analytics workloads, since readers hit the stored result instead of re-deriving it.</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Disadvantages</span>
<span class="db-node-sub">Staleness — data can lag behind the base tables between refreshes, which is unacceptable for some applications (e.g. real-time balances). Storage cost — the result set is physically duplicated. Refresh overhead — recomputing the view (especially full, non-incremental refreshes) can itself be an expensive, resource-intensive operation.</span>
</div>
</div>

!!! tip "Choosing between a view and a materialized view"
    Default to an ordinary view. Reach for a materialized view specifically when profiling
    shows a particular query (usually a heavy aggregation or multi-way join) is run
    *often enough, relative to how often its underlying data changes*, that recomputing it
    every single time is measurably wasteful — and when the application can tolerate the
    resulting staleness window between refreshes. If it can't tolerate any staleness at all,
    `REFRESH ON COMMIT` narrows that window to zero, but at the cost of slower writes to the
    base tables — there is no free lunch here, only a trade-off you pick deliberately.

## Try It Yourself

1. Write a `CREATE VIEW` statement over `Branch(branchNo, street, city, postcode)` and
   `Staff(staffNo, name, position, salary, branchNo)` that shows each branch's city
   alongside its total staff salary bill. Is your view updatable? Justify your answer using
   the updatability rules above.
2. A company dashboard shows "total revenue this quarter," recomputed from millions of order
   rows, refreshed once per night. Would you implement this as an ordinary view or a
   materialized view? What refresh strategy would you choose, and why?
3. Explain, in one or two sentences, why `CREATE VIEW`'s security benefit (restricting a
   user to a subset of rows or columns) still holds even though a view stores no data of its
   own — what, exactly, is being restricted if not "access to stored bytes"? (Lecture 24
   answers this directly.)

## Key Takeaways

- A **view** is a virtual table: a stored, named query with no data of its own, re-evaluated
  against live base-table data every time it's referenced.
- Views are queried exactly like base tables, but only a subset — no join, `DISTINCT`,
  `GROUP BY`, or aggregate — are **updatable**, because the update must translate back
  unambiguously onto the base table(s).
- Views buy security, simplicity, and logical data independence, at the cost of
  recomputation overhead and restricted updatability.
- A **materialized view** physically stores its result set, trading storage and staleness
  for query speed — the exact opposite trade-off profile of an ordinary view.
- Refresh strategy (**on-demand**, **scheduled**, or **on-commit**) is the single most
  important design decision for any materialized view, because it directly controls how
  stale the stored data is allowed to become.

Lecture 24 uses ordinary views specifically as a security mechanism — restricting a database
user to a filtered subset of rows or columns — and ties directly back to the `CREATE VIEW`
syntax introduced here. Continue to
[Lecture 24, Database Authorization](lecture-24-database-authorization.md).
