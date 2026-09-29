---
title: "2. The Database Approach"
tags:
  - CSC270
  - Databases
  - DBMS Architecture
  - Data Independence
---

# 2. The Database Approach

[Lecture 1](lecture-01-introduction-to-databases-and-information-systems.md) established
*why* organizations move away from file-based systems and toward a shared, centrally
managed database. This lecture opens that database up: what exactly is stored inside one
besides the raw data itself, who the people are that keep it running, what a DBMS is
physically built out of, and what it does for every request that passes through it. We'll
use a single running example — a bank — to keep all of these ideas grounded.

## In This Lecture

- The distinction between data and metadata, and why a database needs both
- The full database environment: hardware, software, data, procedures, and people
- The roles people play around a database — DBA, designers, developers, end users
- The major components a DBMS is built from
- The core functions every DBMS performs
- A first look at data dependence vs. data independence

## Data and Metadata

**Data** is the actual facts being stored — `"Ali Raza"`, `4500000`, `"B003"`. On its own,
a raw value like `4500000` tells you nothing: is it a salary, an account balance, a phone
number? A database needs a second layer describing the first.

**Metadata** — sometimes called the **system catalog** or **data dictionary** — is *data
about the data*: the names of tables and columns, each column's data type and size,
which columns form a key, what constraints apply, and how tables relate to one another.
The DBMS itself is the primary reader of metadata; it consults the catalog before
executing almost every operation, to check that a request even makes sense.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Data vs. metadata, for a bank's Account table</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Data</span>
<span class="db-node-sub">"SL21", 4500000, "B003" — the actual stored values</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Metadata</span>
<span class="db-node-sub">accountNo is CHAR(5) and a primary key; balance is DECIMAL and must be &gt;= 0; branchNo is a foreign key to Branch</span>
</div>
</div>
</div>

!!! tip "Metadata is why a DBMS can reject bad requests before running them"
    When an application tries to insert a letter into `balance`, the DBMS doesn't need
    special-case code for that column — it looks up `balance`'s type in the catalog, sees
    it's numeric, and refuses the insert. Metadata is what makes a DBMS's rule-enforcement
    *general* rather than hand-coded per column, per table, per application.

## The Database Environment

A working database is never just "the data." Connolly & Begg describe the full
**database environment** as five interacting components:

<div class="db-diagram" markdown>
<p class="db-diagram-label">The database environment</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Hardware</span>
<span class="db-node-sub">Servers, storage devices, network — where the bytes physically live</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Software</span>
<span class="db-node-sub">The DBMS itself, the operating system, and application programs</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Data</span>
<span class="db-node-sub">The facts being stored, plus the metadata describing them</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Procedures</span>
<span class="db-node-sub">Documented instructions for running and using the system — backup schedules, login steps</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">People</span>
<span class="db-node-sub">Everyone who designs, administers, develops for, or simply uses the database</span>
</div>
</div>
</div>

Losing sight of any one of these can sink an otherwise well-designed database. A bank can
have flawless table designs and still suffer outages if no *procedure* exists for what to
do when a disk fails, or if the *people* running it were never trained on the backup tool.

## Roles Around a Database

The "people" component of the environment splits into distinct roles, each with a
different relationship to the data.

| Role | Primary concern | Example task at a bank |
|---|---|---|
| **Database Administrator (DBA)** | Managing the DBMS itself: security, performance, backup/recovery, availability | Granting a new teller's login only `SELECT` access to `Account`, never `DELETE` |
| **Database Designers** | Deciding *what* data to store and how it relates — logical and physical design | Deciding that `Account` needs a `branchNo` foreign key referencing `Branch` |
| **Application Developers** | Writing the programs end users interact with, built on top of the database | Building the teller's "process withdrawal" screen |
| **End Users** | Using the finished application to do their job; rarely touch the database directly | A teller processing a customer's withdrawal through the bank's software |

!!! note "Two kinds of end user"
    **Naive users** interact only through a fixed application interface, unaware a database
    even exists underneath — a bank teller using a withdrawal screen. **Sophisticated
    users** (analysts, power users) may write their own queries directly against the
    database to answer one-off questions, without going through a pre-built application at
    all — a bank's risk analyst querying total outstanding loans per branch.

The **DBA** deserves particular emphasis: in a file-based world (Lecture 1), no single
person was responsible for the organization's data as a whole — each application
programmer managed their own files. The database approach concentrates that
responsibility into one role precisely because centralizing the data means centralizing
the risk if it's mismanaged.

## Components of a DBMS

Zooming in from the environment to the DBMS software itself, a DBMS is built from several
cooperating components, each handling a distinct concern:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Major components inside a DBMS</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Query Processor</span>
<span class="db-node-sub">Parses and optimizes queries submitted by users and applications</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Database Manager</span>
<span class="db-node-sub">Coordinates access to stored data; enforces integrity and security rules</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Transaction Manager</span>
<span class="db-node-sub">Ensures concurrent operations stay correct and recoverable</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">File Manager</span>
<span class="db-node-sub">Manages the allocation of physical disk space for stored files</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">DML / DDL Precompiler</span>
<span class="db-node-sub">Translates database statements embedded in application code</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Data Dictionary / Catalog</span>
<span class="db-node-sub">Stores the metadata every other component consults</span>
</div>
</div>
</div>

None of these components act alone — a single `UPDATE Account SET balance = balance -
5000 WHERE accountNo = 'SL21'` submitted by the teller's withdrawal screen passes through
the query processor to be parsed, the catalog to check `Account` and `balance` exist and
the update is permitted, the transaction manager to make the change safely alongside any
other concurrent activity, and finally the file manager to write the new value to disk.

## Functions of a DBMS

Beyond its internal components, a DBMS is judged by the *functions* it provides to every
application built on top of it — the services listed as advantages in Lecture 1, now made
concrete:

- **Data storage, retrieval, and update** — the most basic function: store a value, get it
  back later, change it.
- **A user-accessible catalog** — metadata is itself queryable, so tools and administrators
  can inspect the database's own structure.
- **Transaction support** — a mechanism to ensure a group of related operations (debit one
  account, credit another) either all complete or none do.
- **Concurrency control services** — correctness guarantees when many users access the
  database at the same time, so two simultaneous withdrawals from the same account can't
  both succeed and overdraw it.
- **Recovery services** — restoring the database to a correct state after a hardware or
  software failure, without losing committed work.
- **Authorization services** — controlling who is allowed to do what, down to individual
  tables or columns.
- **Support for data communication** — integrating with the network software applications
  use to reach the database remotely.
- **Integrity services** — enforcing that stored data satisfies the organization's business
  rules (a `balance` can't go negative on a savings account).
- **Services to promote data independence** — insulating applications from the details of
  how data is physically stored, the subject of the next section.
- **Utility services** — tools for import/export, performance monitoring, and analysis.

## Data Dependence vs. Data Independence — A First Look

Recall from Lecture 1 that file-based systems suffered from **program-data dependence**:
an application program's code was written assuming an exact, specific physical file
layout, so changing that layout meant rewriting every program that touched the file.

**Data independence** is the DBMS's answer to that problem: the capacity to change a
database's structure at one level without requiring application programs written against
another level to change. A well-designed DBMS lets the DBA reorganize how data is
physically stored on disk — or extend the table with a new column other applications don't
care about — without forcing every existing application to be rewritten or recompiled.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Data dependence vs. data independence</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Data dependence (file-based)</span>
<span class="db-node-sub">Application code hard-codes field order and size; any physical change breaks every program that reads the file</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Data independence (database approach)</span>
<span class="db-node-sub">Applications see a stable logical view; the DBMS absorbs physical changes underneath it</span>
</div>
</div>
</div>

This is only a first look — [Lecture 4](lecture-04-database-architecture-and-data-independence.md)
gives data independence its full treatment, splitting it into **logical** and **physical**
data independence once the ANSI-SPARC three-schema architecture is on the table, which is
what actually makes this insulation possible.

!!! warning "Don't confuse 'independence' with 'the schema never changes'"
    Data independence does not mean the database's structure is frozen. It means changes at
    one level can be made *without cascading* into forced changes at another level. The
    schema still evolves over time — independence is about containing the blast radius of
    that evolution, not preventing it.

## Key Takeaways

- **Metadata** (the system catalog) describes the data — names, types, constraints,
  relationships — and is what lets a DBMS enforce rules generically rather than through
  hand-coded, per-field logic.
- The **database environment** is hardware, software, data, procedures, and people
  together — a database's design can be excellent and still fail if procedures or people
  are neglected.
- Distinct **roles** — DBA, database designers, application developers, and end users
  (naive and sophisticated) — divide responsibility for a shared database in a way
  file-based systems never required.
- A DBMS is built from cooperating **components** (query processor, database manager,
  transaction manager, file manager, catalog) that together deliver its core **functions**:
  storage, transactions, concurrency, recovery, security, integrity, and data independence.
- **Data independence** lets one level of the database change without forcing dependent
  application programs to change — the direct fix for file-based systems' program-data
  dependence problem, expanded fully in
  [Lecture 4](lecture-04-database-architecture-and-data-independence.md).
- Before that, [Lecture 3](lecture-03-database-languages-and-functions.md) looks at the
  languages — DDL, DML, and DCL — that people and programs actually use to talk to a DBMS.
