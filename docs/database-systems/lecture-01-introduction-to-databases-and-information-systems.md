---
title: "1. Introduction to Databases and Information Systems"
tags:
  - CSC270
  - Databases
  - File-Based Systems
  - DBMS
---

# 1. Introduction to Databases and Information Systems

Every organization of any size runs on data — a university tracks students, courses, and
grades; a bank tracks accounts and transactions; a hospital tracks patients and
prescriptions. Long before anyone writes a line of SQL, a much more basic question has to
be answered: *where does all of this data live, and who is responsible for keeping it
correct?* This lecture is about that question. We'll look at how organizations stored data
before databases existed, why that approach eventually broke down at scale, and what a
**database management system** offers instead — along with an honest look at what it
costs to get those benefits.

## In This Lecture

- What a database is, and how it differs from an information system built around one
- Common categories of database applications you already use
- How data management evolved from manual filing to file-based systems to databases
- File-based systems: how they worked, and the specific problems that forced a rethink
- The database approach: what changes, concretely, when data is centralized
- The advantages a DBMS gives you — and the real costs it imposes in return

## Databases and Information Systems

A **database** is a shared, organized collection of logically related data, designed to
meet the information needs of an organization. Three words in that definition carry all
the weight:

- **Shared** — many users and many programs draw on the same data, not private copies of it.
- **Organized** — the data isn't a dumped pile of facts; it's structured so it can be
  found, related, and reasoned about.
- **Logically related** — a student's enrollment record, their fee payments, and their
  transcript are all *about the same student*, and the database is expected to know that.

A **database management system (DBMS)** is the software that creates, manages, and
controls access to a database. Application programs never touch the raw data files
directly; they go through the DBMS, which handles storage, retrieval, security, and
consistency on their behalf.

Put the two together — a database, the DBMS that manages it, and the application programs
that use it — and you have an **information system**: the full set of people, procedures,
data, software, and hardware that an organization uses to collect, store, and disseminate
information. The database is the foundation; the information system is everything built
on top of it.

<div class="db-diagram" markdown>
<p class="db-diagram-label">From data to an information system</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Database</span>
<span class="db-node-sub">Organized, shared, logically related data</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">DBMS</span>
<span class="db-node-sub">Software that stores, retrieves, and protects that data</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Information System</span>
<span class="db-node-sub">Database + DBMS + application programs + people + procedures</span>
</div>
</div>
</div>

!!! note "A database is not the same thing as a spreadsheet"
    A spreadsheet stores data too, but it has no concept of enforcing that a "Student ID"
    column only ever contains valid, existing students, no built-in way to let 50 people
    update it safely at once, and no automatic recovery if the machine crashes mid-edit. A
    DBMS is built specifically to guarantee those things; a spreadsheet application is not.

## Database Applications

Databases are so embedded in everyday software that it's easy to miss how many different
kinds of systems are really "a database with a purpose-built interface in front of it":

| Application domain | What's stored | A concrete example |
|---|---|---|
| Banking | Accounts, balances, transactions | Checking whether a debit card transaction should be approved |
| Airlines | Reservations, schedules, seat maps | Confirming there's still a seat on flight PK-301 |
| University records | Students, courses, enrollments, grades | Producing a transcript for a graduating student |
| Telecommunications | Call records, subscriber accounts | Generating a monthly phone bill |
| Sales / e-commerce | Products, orders, customers, inventory | Showing "only 3 left in stock" on a product page |
| Human resources | Employees, salaries, positions | Running monthly payroll for an entire company |

!!! tip "A quick test for 'is this really a database problem?'"
    If the data needs to be shared by more than one person or program, must stay accurate
    even when many people touch it at once, and needs to survive a crash without silently
    losing or corrupting anything, it belongs in a database — not in a private file that one
    program happens to read and write.

## Evolution of Data Management

Data management didn't start with the DBMS. It evolved in stages, each one responding to
the weaknesses of the one before it.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Evolution of data management</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Manual / paper filing</span>
<span class="db-node-sub">Ledgers, index cards, physical filing cabinets — slow, error-prone, one copy</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">File-based systems</span>
<span class="db-node-sub">Each application owns its own computer files; no coordination between them</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Database approach (DBMS)</span>
<span class="db-node-sub">One managed, shared collection of data serving every application</span>
</div>
</div>
</div>

Understanding *why* each stage gave way to the next is more useful than memorizing the
stages themselves — so the rest of this lecture focuses on the middle stage in detail,
because its failure modes are exactly what the database approach was invented to fix.

## File-Based Systems

Before DBMSs existed, each application had its own private set of data files, designed and
maintained by the programmer who wrote that application, with its own file layout baked
directly into the program's code.

**Worked example: a university before it had a database.** Suppose COMSATS ran three
separate offices, each with its own file-based system, all needing student data:

<div class="db-diagram" markdown>
<p class="db-diagram-label">A student's data, scattered across three file-based systems</p>
<div class="db-grid-3" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Registrar's file</span>
<span class="db-node-sub">RegNo, Name, CNIC, Address, Program</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Library's file</span>
<span class="db-node-sub">RegNo, Name, Address, BooksIssued</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Finance office's file</span>
<span class="db-node-sub">RegNo, Name, Address, FeeBalance</span>
</div>
</div>
</div>

Notice `Name` and `Address` are stored **three separate times** — once per office, each in
its own file, written by its own program. That single design decision is the root of
almost every problem file-based systems became known for:

- **Data redundancy** — the same facts (a student's name, address) are duplicated across
  every file that needs them, wasting storage and duplicating data-entry effort.
- **Data inconsistency** — because the copies are independent, they drift. If the student
  moves house and only *tells the registrar*, the library and finance office still have the
  old address — now there are three "true" addresses and no way to tell which is current.
- **Poor data sharing** — the library's program can't easily ask the registrar's file "is
  this student still enrolled?" — the files were never designed to talk to each other.
- **Program-data dependence** — the physical layout of a file (field order, field sizes,
  data types) is hard-coded into the application program that reads it. Add one field, and
  every program touching that file must be found and recompiled.
- **Limited data sharing and difficulty answering unanticipated queries** — a request like
  "list every student who owes a library fine *and* has an outstanding tuition balance"
  spans two separate, incompatible files, and answering it means writing a brand-new
  program from scratch.
- **Integrity and security are hard to enforce consistently** — each program enforces its
  own rules (or doesn't), and there's no single place to say "a fee balance can never be
  negative" that automatically applies everywhere.

!!! warning "Inconsistency is the most dangerous failure mode, not the most obvious one"
    Wasted storage from redundancy is a cost you can measure and budget for. Inconsistency
    is worse precisely because it's invisible until it causes damage — a graduating student
    blocked from receiving their transcript because the finance office's *stale* copy of
    their fee balance still shows an unpaid amount that was actually settled weeks earlier,
    according to the registrar's copy.

## The Database Approach

The database approach's core idea is disarmingly simple: instead of every application
owning a private copy of the data it needs, **store the data once, centrally, and let every
application go through a DBMS to reach it.**

<div class="db-diagram" markdown>
<p class="db-diagram-label">File-based systems vs. the database approach</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">File-based (before)</span>
<span class="db-node-sub">Registrar, Library, and Finance each keep their own Name/Address copy — three files, three truths</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Database approach (after)</span>
<span class="db-node-sub">One Student table holds Name/Address once; Registrar, Library, and Finance all read the same row through the DBMS</span>
</div>
</div>
</div>

Redoing the earlier example with the database approach: a single `Student` relation stores
`RegNo`, `Name`, `Address`, and `Program` exactly once. The library's system and the
finance office's system no longer keep their own copies of `Name` and `Address` — they
each store only the data unique to their own concern (`BooksIssued`, `FeeBalance`) and
*reference* the same shared student record through the DBMS. Update the address once, and
every office sees the update immediately, because there was only ever one address to
begin with.

This is the essence of the shift the rest of this course explores: from **many
private, siloed files** to **one shared, centrally managed pool of data** — with the DBMS
sitting between every application and that pool, enforcing the rules consistently.
[Lecture 2](lecture-02-the-database-approach.md) goes into this approach's environment,
roles, and components in detail.

## Advantages of the Database Approach (DBMS)

Centralizing data through a DBMS, done well, delivers concrete benefits over file-based
systems:

- **Control of data redundancy** — the database approach doesn't always eliminate
  redundancy completely, but it lets you control it deliberately, storing each fact once
  wherever possible.
- **Data consistency** — with redundancy controlled, there is no risk of two copies
  disagreeing, because there is (ideally) only one copy.
- **More information from the same amount of data** — combining previously separate files
  lets the organization derive information no single file could answer alone (e.g., "which
  students have both a library fine and a tuition balance").
- **Sharing of data** — existing data can be shared by new applications, since the data is
  no longer owned by one program.
- **Improved data integrity** — validation rules (a fee balance cannot be negative, a
  `RegNo` must be unique) can be defined once, in the database, and are then enforced for
  *every* application automatically.
- **Improved security** — access can be restricted per-user, so a library clerk can be
  allowed to see `BooksIssued` without being able to see another student's `FeeBalance`.
- **Enforcement of standards** — data formats (date formats, ID formats) can be enforced
  centrally rather than left to each programmer's discretion.
- **Economy of scale** — consolidating data and processing into one managed system, rather
  than many small independent ones, reduces total organizational cost over time.
- **Balance of conflicting requirements** — a trained DBA can arrange the overall
  organization of data to serve the organization's needs as a whole, rather than optimizing
  for one department at the expense of another.
- **Improved data accessibility and responsiveness** — modern DBMSs provide query
  languages that can answer previously unanticipated questions directly, without writing a
  new program for each one.
- **Increased productivity** — DBMSs provide many of the standard functions a programmer
  would otherwise have to write from scratch (storage, retrieval, concurrency, recovery),
  freeing developers to focus on the application's actual logic.
- **Improved backup and recovery services** — a modern DBMS provides facilities to
  minimize the amount of processing lost following a failure, protecting data far more
  robustly than one programmer's ad hoc backup script.

## Disadvantages of the Database Approach (DBMS)

The database approach is not free — it trades one set of problems for another set, smaller
but real:

- **Complexity** — a DBMS is an intricate piece of software; database designers,
  developers, administrators, and end users all need to understand enough of it to use it
  effectively.
- **Cost** — DBMS software, and the more powerful hardware it often demands, add a
  significant up-front and ongoing expense that a simple set of flat files never required.
- **Reduced performance for narrow, specialized needs** — a general-purpose DBMS, built to
  serve many applications well, can be slower for one highly specialized task than a
  program written to do exactly that one thing and nothing else.
- **Higher impact of a failure** — because the database is centralized and shared, an
  outage or corruption affects *every* application that depends on it at once, rather than
  just the one program whose private file broke.

!!! note "Why organizations adopt the database approach anyway"
    None of these disadvantages are usually enough, on their own, to justify going back to
    file-based systems — the redundancy and inconsistency problems shown earlier only get
    worse as an organization grows, while the database approach's costs are largely one-time
    (learning the technology, paying for the software and hardware) rather than compounding.
    That said, a tiny, single-user, single-purpose tool with no sharing requirement may
    genuinely be better served by a plain file — the database approach is a trade-off, not a
    universal law.

## Key Takeaways

- A **database** is shared, organized, logically related data; a **DBMS** manages it; an
  **information system** is the database, DBMS, and applications together, serving an
  organization's information needs.
- Databases quietly power banking, airlines, university records, telecoms, sales, and HR
  systems — almost any software that shares data among people or programs.
- **File-based systems** gave each application its own private files, which caused data
  redundancy, inconsistency, poor sharing, and tight program-data dependence.
- The **database approach** replaces those many private files with one centrally managed,
  shared pool of data that every application accesses through a DBMS.
- The database approach earns real advantages — consistency, integrity, security,
  standards, shared access, and built-in recovery — at the real cost of added complexity,
  cost, and a bigger blast radius when something does go wrong.
- [Lecture 2](lecture-02-the-database-approach.md) picks up exactly where this one leaves
  off: who is responsible for a database once an organization adopts this approach, and
  what a DBMS is actually made of.
