---
title: "3. Database Languages and Functions"
tags:
  - CSC270
  - Databases
  - DDL
  - DML
  - DCL
---

# 3. Database Languages and Functions

A database doesn't configure or query itself — someone has to tell it what tables to
create, what data to put in them, and who is allowed to touch what. [Lecture
2](lecture-02-the-database-approach.md) named "transaction support," "concurrency
control," and "authorization services" as functions every DBMS provides; this lecture
looks at the actual **languages** used to invoke those functions, and rounds out the list
of DBMS functions with the operational and administrative side: utilities and
day-to-day database administration. We'll use a small library system as the running
example.

## In This Lecture

- Why database languages are split into three sub-languages by *purpose*
- Data Definition Language (DDL): defining structure
- Data Manipulation Language (DML): working with data, and the procedural/declarative split
- Data Control Language (DCL): security and access control
- The complete list of core DBMS functions, expanded from Lecture 2
- Database utilities: the supporting tools every DBA relies on
- The day-to-day tasks that make up database administration

## Why Split the Language by Purpose?

Talking to a DBMS involves three genuinely different kinds of statements: statements that
describe *what the data looks like*, statements that *work with the data itself*, and
statements that decide *who is allowed to do either*. Rather than one enormous language
that tries to do everything, relational database languages (most visibly SQL) are
conventionally split into three sub-languages along exactly those lines.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The three sub-languages of a database language</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">DDL</span>
<span class="db-node-sub">Defines structure — tables, columns, constraints</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">DML</span>
<span class="db-node-sub">Reads and modifies the data living inside that structure</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">DCL</span>
<span class="db-node-sub">Controls who is allowed to use the DDL and DML above</span>
</div>
</div>
</div>

!!! note "One language, three jobs"
    In a modern relational DBMS, DDL, DML, and DCL are usually all part of the *same*
    language — SQL — rather than three separate languages a user has to learn one at a
    time. The split described here is a split by **purpose**, made clear so each part can
    be reasoned about on its own; SQL is covered as a language starting later in this
    course, once the relational model itself is established.

## Data Definition Language (DDL)

The **Data Definition Language** is the part of a database language used to define,
alter, and remove the database's structure — its **schema** — rather than the data inside
it. DDL statements are what a database designer uses to turn a design on paper into an
actual, usable structure the DBMS can enforce.

For a library system, DDL is what creates the `Book` and `Member` relations in the first
place, and later what adds a new column to `Book` when the library starts tracking a
publication year it didn't originally record:

<div class="db-relation" markdown>
<div class="db-relation-name">Book (isbn, title, author, available)</div>

| isbn | title | author | available |
|---|---|---|---|
| 978-0132350884 | Clean Code | Robert C. Martin | true |
| 978-0201633610 | Design Patterns | Gamma, Helm, Johnson, Vlissides | false |

</div>

Concretely, DDL is the family of statements that:

- **Create** a new table, view, index, or entire database.
- **Alter** an existing table's structure — add, remove, or modify a column; add a
  constraint.
- **Drop** a table, view, or index, removing its structure (and, typically, the data in it)
  entirely.

Every DDL statement, when executed, updates the **system catalog** (Lecture 2's
metadata) — which is precisely why DDL changes are felt everywhere at once: every part of
the DBMS that consults the catalog immediately sees the new structure.

## Data Manipulation Language (DML)

Where DDL shapes the container, the **Data Manipulation Language** works with what's
inside it: retrieving existing data and inserting, updating, or deleting rows. DML is what
a librarian's checkout application actually runs every time a book is borrowed or returned.

DML statements fall into two categories:

- **Retrieval** — asking questions of existing data ("which books by Robert C. Martin are
  currently available?") without changing anything.
- **Update** — inserting new data, modifying existing data, or deleting data.

!!! tip "Procedural vs. declarative DML — a distinction worth remembering early"
    A **procedural** DML requires the user to specify *what data is needed and how to get
    it* — step by step, in a particular order (this is exactly what relational algebra,
    covered later in this course, does). A **declarative** (non-procedural) DML requires
    the user to specify only *what data is needed*, leaving the DBMS's query optimizer free
    to decide the most efficient way to actually fetch it (this is what SQL and relational
    calculus do). Almost every DBMS you will use professionally exposes a declarative DML —
    "tell it what you want, not how to get it" is one of the relational model's central
    ideas, and this course builds up to it carefully.

A single logical action — "a member returns *Clean Code*" — typically involves more than
one DML statement working together: marking the book `available`, and removing the
corresponding loan record. [Lecture 29's](lecture-29-database-transactions-and-acid-properties.md)
transaction concept is precisely about guaranteeing a group of DML statements like this
either all succeed together or none of them do.

## Data Control & Security (DCL)

The **Data Control Language** governs permissions: who may run which DDL and DML
statements against which parts of the database. Without DCL, every user with any access to
the database would have unrestricted access to all of it — clearly unacceptable once a
database is shared across many roles (Lecture 2).

DCL statements typically:

- **Grant** a specific privilege (read, insert, update, delete, or even the right to grant
  further privileges) to a named user or role.
- **Revoke** a previously granted privilege.

<div class="db-diagram" markdown>
<p class="db-diagram-label">DCL in the library system — who can do what to Book</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Front-desk clerk</span>
<span class="db-node-sub">Granted: SELECT, UPDATE (availability only)</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Cataloging librarian</span>
<span class="db-node-sub">Granted: SELECT, INSERT, UPDATE, DELETE</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Library patron (self-service portal)</span>
<span class="db-node-sub">Granted: SELECT only</span>
</div>
</div>
</div>

DCL is one concrete mechanism behind the "authorization services" function named in
Lecture 2 — the DBA uses it to translate an organization's security policy into rules the
DBMS actually enforces on every request.

## Functions of a DBMS, Completed

Lecture 2 introduced the core functions a DBMS provides — storage, catalog access,
transactions, concurrency, recovery, security, integrity, communication, and data
independence. Two operational categories round out the full list, and both matter every
single day a database is in production, not just at design time.

### Database Utilities

**Utilities** are supporting programs, usually bundled with the DBMS, that help
administer the database without being part of the core query-processing engine itself:

| Utility | Purpose | Library-system example |
|---|---|---|
| Loading | Bulk-importing data from an external source | Importing 10,000 existing catalog records from the old system |
| Unloading / export | Extracting data out to a file | Exporting overdue-loan records for a report |
| Backup | Making a recoverable copy of the database | Nightly backup of the entire library database |
| Reorganization | Restructuring physical storage for performance | Rebuilding a fragmented index on `Book.isbn` |
| Performance monitoring | Tracking query speed and resource use | Noticing that "search by author" has gotten slow as the catalog grew |
| Statistics analysis | Gathering data distribution info used by the query optimizer | Recording that 40% of loans are for computer-science books |

### Database Administration Functions

**Database administration** is the ongoing, human side of keeping a database healthy —
the ordinary work of the DBA role introduced in Lecture 2:

- **Managing data storage and structure** — deciding physical storage details and creating
  the structures DDL will define.
- **Enforcing security and authorization** — issuing and revoking DCL privileges as staff
  join, change roles, or leave.
- **Monitoring performance and tuning** — watching for slow queries and adjusting indexes
  or configuration in response.
- **Managing backup and recovery** — scheduling backups and rehearsing recovery so a real
  failure isn't the first time the process is tested.
- **Maintaining data integrity** — reviewing that constraints defined via DDL still reflect
  the organization's actual business rules as those rules evolve.
- **Liaising with users** — translating end-user and application-developer needs into
  database changes, and communicating changes back to them.

!!! warning "A common mix-up: utilities vs. administration"
    Utilities are *tools*; administration is the *ongoing responsibility* that uses those
    tools. A backup utility can exist in a DBMS for years without ever protecting anyone if
    no administrator schedules it to run — the tool doesn't discharge the responsibility by
    itself.

## Key Takeaways

- Database languages split by purpose into **DDL** (define structure), **DML** (work with
  data), and **DCL** (control access) — usually unified into one language such as SQL
  rather than three separate ones.
- **DDL** creates, alters, and drops schema objects, and every DDL statement updates the
  system catalog immediately.
- **DML** retrieves and updates data; it can be **procedural** (specify how to get the
  data) or **declarative** (specify only what data is wanted) — modern SQL is
  predominantly declarative.
- **DCL** grants and revokes privileges, turning an organization's security policy into
  rules the DBMS enforces on every request.
- Rounding out Lecture 2's function list, **database utilities** are the supporting tools
  (load, backup, reorganize, monitor) that **database administration** — the DBA's ongoing
  responsibility — relies on day to day.
- [Lecture 4](lecture-04-database-architecture-and-data-independence.md) shifts from *what
  you can say to a DBMS* to *how a DBMS is architected internally* — client-server
  structure and the three-schema architecture that makes data independence possible.
