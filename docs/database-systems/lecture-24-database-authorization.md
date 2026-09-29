---
title: "24. Database Authorization"
tags:
  - CSC270
  - SQL
  - Security
  - Authorization
---

# 24. Database Authorization

A perfectly normalized, perfectly indexed database is worthless if the wrong person can
read the salary table or delete the enrollment records. **Authorization** is the layer that
decides, for every user and every operation, whether it's allowed — and SQL has a compact,
standard vocabulary for expressing exactly that: `GRANT`, `REVOKE`, and roles. This lecture
covers that vocabulary end to end, and closes the loop with Lecture 23 by showing how a view
becomes, in practice, one of the most common and effective security tools a database
designer has.

## In This Lecture

- Why database security matters: confidentiality, integrity, and availability
- Database users and privileges
- Discretionary vs. mandatory access control, briefly
- Granting privileges with `GRANT ... ON ... TO ...`
- Revoking privileges with `REVOKE`
- Roles and role-based access control — why they beat granting to individuals directly
- Authorization rules and how the DBMS enforces them
- Views as a security mechanism, tying directly back to Lecture 23
- A consolidated reference of SQL authorization commands
- Security considerations: SQL injection and the least-privilege principle

## Database Security and Authorization

**Database security** is the protection of data against unauthorized access, modification,
or destruction. It rests on three classic goals, usually called the **CIA triad**:

- **Confidentiality** — only authorized users can *read* the data (a student shouldn't read
  other students' grades).
- **Integrity** — only authorized users can *modify* the data, and only in permitted ways
  (a student shouldn't be able to edit their own grade).
- **Availability** — authorized users can access the data when they need it; security
  controls should not themselves become the reason legitimate access fails.

**Authorization** is the specific mechanism that decides *who* may do *what* to *which*
data — it answers "is this particular operation, by this particular user, on this particular
object, allowed right now?" It is distinct from **authentication** (proving *who* you are,
e.g. logging in with a password) — authentication happens first, authorization happens on
every subsequent operation.

## Database Users and Privileges

Every operation in a DBMS happens under some **user** (or role) identity, and every user
holds a set of **privileges** — specific permissions to perform specific operations on
specific database objects. The common privilege types map directly onto SQL's data
operations:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Common SQL Privileges</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title"><span class="db-badge db-badge-teal">SELECT</span></span><span class="db-node-sub">Read rows from a table or view</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title"><span class="db-badge db-badge-purple">INSERT</span></span><span class="db-node-sub">Add new rows</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title"><span class="db-badge db-badge-orange">UPDATE</span></span><span class="db-node-sub">Modify existing rows</span></div>
</div>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title"><span class="db-badge db-badge-teal">DELETE</span></span><span class="db-node-sub">Remove rows</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title"><span class="db-badge db-badge-purple">EXECUTE</span></span><span class="db-node-sub">Run a stored procedure or function</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">ALL PRIVILEGES</span><span class="db-node-sub">Shorthand for every applicable privilege at once</span></div>
</div>
</div>

### Access Control: Discretionary vs. Mandatory

Two broad models govern how privileges get assigned:

- **Discretionary Access Control (DAC)** — the owner of an object (or an administrator)
  decides, at their discretion, who gets which privileges on it. This is what `GRANT` and
  `REVOKE` implement, and what almost every relational DBMS uses by default.
- **Mandatory Access Control (MAC)** — every object and every user carries a fixed
  **security classification** (e.g. `unclassified`, `secret`, `top secret`), and access is
  decided by comparing classifications according to a system-wide policy that individual
  users cannot override, even if they own the object. MAC appears mainly in government and
  military-grade systems; this course focuses on DAC, since it's what you'll actually use in
  a standard SQL database.

## Granting Privileges

`GRANT` gives one or more privileges, on one object, to one or more users (or roles):

```sql
GRANT SELECT ON Staff TO usman;
```

```sql
GRANT SELECT, INSERT, UPDATE ON Staff TO usman, ayesha;
```

```sql
GRANT ALL PRIVILEGES ON Branch TO db_admin;
```

Column-level granularity restricts a privilege to specific columns only — useful when a user
needs to update some fields but never others:

```sql
GRANT UPDATE (position, salary) ON Staff TO hr_clerk;
```

`EXECUTE` applies to stored procedures and functions rather than tables:

```sql
GRANT EXECUTE ON ProcessPayroll TO payroll_service;
```

`WITH GRANT OPTION` additionally lets the *recipient* grant the same privilege on to others
— without it, a user can use the privilege but cannot pass it along:

```sql
GRANT SELECT ON Staff TO branch_manager WITH GRANT OPTION;
```

!!! note "GRANT OPTION spreads responsibility, not just access"
    Once `branch_manager` holds `SELECT ... WITH GRANT OPTION`, they can run
    `GRANT SELECT ON Staff TO some_other_user` themselves, without the database
    administrator's involvement. This is powerful for delegating administration, but it also
    means privilege chains can grow past what a single audit of `GRANT` statements at the
    top makes obvious — a real reason to use `WITH GRANT OPTION` sparingly.

## Revoking Privileges

`REVOKE` removes a previously granted privilege — the mirror image of `GRANT`, with matching
syntax:

```sql
REVOKE UPDATE ON Staff FROM usman;
```

```sql
REVOKE ALL PRIVILEGES ON Branch FROM db_admin;
```

Revoking a privilege that was granted `WITH GRANT OPTION` typically cascades: privileges
that were granted onward *because of* that option are revoked too, unless the system
provides an explicit `RESTRICT` to block a revoke that would cascade:

```sql
REVOKE SELECT ON Staff FROM branch_manager CASCADE;
```

## Roles and Role-Based Access Control

Granting privileges directly to dozens or hundreds of individual users does not scale — every
new hire needs the same ten `GRANT` statements typed out again, and every policy change means
re-running them against every affected user individually. **Role-Based Access Control
(RBAC)** fixes this by inserting one extra layer: define a **role** as a named bundle of
privileges, then assign users to roles instead of granting to users directly.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Role-Based Access Control</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">1. CREATE ROLE</span><span class="db-node-sub">Define a named role, e.g. branch_staff</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">2. GRANT privileges TO the role</span><span class="db-node-sub">Bundle every privilege the role needs, once</span></div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">3. GRANT the role TO users</span><span class="db-node-sub">Every user assigned the role inherits the whole bundle immediately</span></div>
</div>
</div>

```sql
CREATE ROLE branch_staff;

GRANT SELECT, INSERT, UPDATE ON Staff TO branch_staff;
GRANT SELECT ON Branch TO branch_staff;

GRANT branch_staff TO usman, ayesha, hamza;
```

When policy changes, you change it **once**, on the role — every assigned user picks up the
new privilege set immediately, with no per-user `GRANT` statements to hunt down and re-run:

```sql
GRANT DELETE ON Staff TO branch_staff;  -- every user with this role now has DELETE too

REVOKE branch_staff FROM hamza;         -- hamza loses the entire bundle in one statement
```

!!! tip "Roles vs. individual grants, in one sentence"
    Grant privileges to **roles**, and assign **users** to roles — never the other way
    around, unless a privilege is genuinely unique to one specific person and will never
    apply to a second user.

## Authorization Rules

An **authorization rule** is the DBMS's internal record of exactly which privilege a
specific user (or role) holds on a specific object — effectively a row in the DBMS's own
system catalog, of the rough shape `(grantor, grantee, object, privilege, grantable?)`. Every
time a user issues a SQL statement, the DBMS's authorization subsystem checks the statement
against these rules *before* executing anything: no matching rule means the statement is
rejected outright, regardless of whether the underlying operation would otherwise succeed.
This check happens on every single statement, every single time — authorization is not a
one-time login check, it's continuously enforced.

## Views for Security

[Lecture 23](lecture-23-views-and-materialized-views.md) introduced views as a way to
present a convenient shape over a normalized schema. That same mechanism is one of the most
practical **security** tools available, because a view can restrict *which rows and columns*
a user ever sees — privileges are then granted on the *view*, not on the underlying table,
so the restriction is structural, not just a matter of application-level discipline.

Restricting **columns** — hide `salary` from anyone who isn't HR:

```sql
CREATE VIEW StaffPublicInfo AS
    SELECT staffNo, name, position, branchNo
    FROM Staff;

GRANT SELECT ON StaffPublicInfo TO general_staff;
-- general_staff never gets SELECT on Staff itself, so salary stays invisible
```

Restricting **rows** — let each branch manager see only their own branch's staff:

```sql
CREATE VIEW MyBranchStaff AS
    SELECT staffNo, name, position, salary
    FROM Staff
    WHERE branchNo = CURRENT_BRANCH();  -- resolved per session/user in a real system

GRANT SELECT ON MyBranchStaff TO branch_manager;
```

Because the branch manager is never granted any privilege on `Staff` directly, there is no
way for them to bypass the `WHERE branchNo = ...` filter by querying the base table instead
— the restriction holds regardless of what tool or client they use to connect.

!!! note "This is exactly Lecture 23's updatability trade-off, revisited"
    `StaffPublicInfo` above is a single-table, no-aggregate view, so it remains updatable
    under Lecture 23's rules — `general_staff` could plausibly be granted `UPDATE` on it for
    the columns it exposes. A security view built on a join or aggregate, by contrast,
    inherits the same non-updatability discussed last lecture — which is often *exactly*
    what you want for a read-only reporting role.

## SQL Authorization Commands — Consolidated Reference

| Command | Purpose |
|---|---|
| `GRANT <privileges> ON <object> TO <user\|role>` | Give one or more privileges on an object |
| `GRANT <privileges> ON <object> TO <user> WITH GRANT OPTION` | Give privileges, and permission to re-grant them |
| `REVOKE <privileges> ON <object> FROM <user\|role>` | Remove previously granted privileges |
| `REVOKE ... CASCADE` | Remove privileges, and cascade the revoke to anything granted onward because of them |
| `CREATE ROLE <name>` | Define a new named role |
| `GRANT <role> TO <user>` | Assign a user to a role, inheriting its whole privilege bundle |
| `REVOKE <role> FROM <user>` | Remove a user from a role |
| `CREATE VIEW ... AS SELECT ...` | Define a restricted row/column subset to grant privileges on instead of a base table |

## Security Considerations

!!! warning "SQL Injection: the single most common real-world database attack"
    **SQL injection** occurs when untrusted input (typically from a web form) is concatenated
    directly into a SQL string instead of being passed as a properly separated parameter,
    letting an attacker inject their own SQL logic:
    ```text
    -- Application builds this string directly from user input:
    "SELECT * FROM Staff WHERE staffNo = '" + userInput + "'"

    -- Attacker submits, as userInput:
    ' OR '1'='1

    -- Resulting statement actually executed:
    SELECT * FROM Staff WHERE staffNo = '' OR '1'='1'
    -- returns EVERY row, bypassing the intended filter entirely
    ```
    A more damaging payload can chain a second statement (`'; DROP TABLE Staff; --`) if the
    driver allows multiple statements per call. The fix is **parameterized queries /
    prepared statements**, never string concatenation:
    ```sql
    -- Prepared statement -- user input is bound as a parameter, never parsed as SQL
    PREPARE getStaff AS SELECT * FROM Staff WHERE staffNo = $1;
    EXECUTE getStaff('SG37');
    ```
    Authorization and parameterized queries are complementary, not substitutes for each
    other: even a perfectly parameterized application still needs the *user account it
    connects as* to hold only the minimum privileges it actually needs — the next point.

**Least privilege** is the governing principle behind everything in this lecture: grant a
user (or an application's own database account) exactly the privileges its job requires, and
nothing more. A reporting dashboard's database account needs `SELECT` and nothing else — it
should never hold `DELETE` on any table, precisely so that a bug or a successful injection
attack against that dashboard cannot destroy data it was never supposed to be able to touch
in the first place. Combined with roles (grant the *role* least privilege, once) and
security views (expose only the rows/columns a role actually needs), least privilege turns
authorization from a single login check into a system-wide, continuously-enforced discipline.

## Try It Yourself

1. Write the `CREATE ROLE`, `GRANT`, and role-assignment statements to create a
   `read_only_auditor` role that can `SELECT` from `Staff` and `Branch` but nothing else, and
   assign a user named `auditor1` to it.
2. A junior developer proposes building a customer-facing search feature by concatenating
   the search box's text directly into a SQL `WHERE` clause string. Explain, in two or three
   sentences, exactly what could go wrong and what you'd tell them to do instead.
3. Design a security view (using Lecture 23's `CREATE VIEW` syntax) that lets a `payroll_hr`
   role see every column of `Staff`, but lets a `general_staff` role see only `staffNo`,
   `name`, and `position` — then write the two corresponding `GRANT SELECT` statements.

## Key Takeaways

- **Authorization** continuously decides who may do what to which data, resting on the CIA
  triad — confidentiality, integrity, and availability.
- SQL implements **discretionary access control**: `GRANT` assigns privileges
  (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXECUTE`), `REVOKE` removes them, and
  `WITH GRANT OPTION` lets a recipient re-grant further.
- **Roles** bundle privileges once and let you assign/revoke an entire policy for a user in
  a single statement — grant to roles, assign users to roles, essentially always.
- **Views**, introduced in Lecture 23 for convenience, double as a genuine security
  mechanism: grant privileges on a restricted view instead of the base table to enforce
  row- and column-level restrictions structurally, not just by application convention.
- **SQL injection** remains one of the most common real-world attacks against databases;
  parameterized queries prevent it, and the **least-privilege principle** limits the damage
  even when some other defense fails.

This closes Unit 6. Lecture 23's views
([Lecture 23, Views and Materialized Views](lecture-23-views-and-materialized-views.md)) and
this lecture's `GRANT`/`REVOKE`/role vocabulary are the two tools you'll reach for most often
when a real deployed schema needs to serve multiple applications and user classes safely from
one underlying, fully normalized database.
