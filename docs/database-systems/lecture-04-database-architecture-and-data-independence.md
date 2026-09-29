---
title: "4. Database Architecture and Data Independence"
tags:
  - CSC270
  - Databases
  - DBMS Architecture
  - Data Independence
---

# 4. Database Architecture and Data Independence

[Lecture 2](lecture-02-the-database-approach.md) promised that a DBMS can change how data
is physically stored without breaking every application built on top of it, and called
that promise **data independence** — without yet explaining how it's actually achieved.
This lecture delivers on that promise. We'll look first at where a DBMS physically lives
relative to the applications that use it (client-server architecture), then at the
internal architecture that makes data independence possible: the **ANSI-SPARC three-schema
architecture** — arguably the single most important architectural idea in this entire
course, because so much of how relational databases are designed and used rests on it.

## In This Lecture

- Two-tier client-server architecture, and its limitations
- Three-tier client-server architecture, and why it emerged
- The ANSI-SPARC three-schema architecture: external, conceptual, and internal levels
- External/conceptual and conceptual/internal mappings, and what each one actually does
- Logical data independence vs. physical data independence — precisely defined and
  distinguished, with worked examples of each

## Client-Server Architecture

Before looking *inside* a DBMS, it's worth asking where it physically runs relative to the
applications and people using it. Two arrangements are foundational.

### Two-Tier Client-Server Architecture

In a **two-tier architecture**, the system is split into exactly two parts: a **client**,
which runs the user interface and (often) the application's business logic, and a
**server**, which runs the DBMS and stores the data. The client sends requests directly to
the database server and receives results back.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two-tier client-server architecture</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Client</span>
<span class="db-node-sub">UI + application/business logic (e.g. a bank teller's desktop application)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Server</span>
<span class="db-node-sub">DBMS + the stored database</span>
</div>
</div>
</div>

A classic two-tier example is an old-style desktop banking application installed on each
teller's workstation, connecting straight to a central database server over the bank's
internal network. This works well for a limited number of clients on a trusted internal
network, but it has real limits: every client machine needs the full application
installed and updated, business logic is duplicated across every client, and the
database server must handle a direct connection from every single client, which stops
scaling gracefully as the number of users grows.

### Three-Tier Client-Server Architecture

A **three-tier architecture** splits the client's responsibilities further, inserting a
middle layer between the user-facing client and the database server:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Three-tier client-server architecture</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Presentation tier</span>
<span class="db-node-sub">The client — a browser or thin app showing the UI only (e.g. a bank's online banking webpage)</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Application tier</span>
<span class="db-node-sub">Application server — business logic and rules (e.g. "a transfer needs sufficient funds")</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Data tier</span>
<span class="db-node-sub">Database server — the DBMS and the stored database itself</span>
</div>
</div>
</div>

Three tiers exist because two tiers stopped scaling once the client became a public,
untrusted, browser-based interface rather than a controlled workstation: keeping business
logic on a managed application server (instead of duplicated on every client) means it
can be updated in one place, and the database server never talks directly to the public
internet at all — only to trusted application servers. A modern online banking website is
a textbook three-tier system: the webpage in your browser is the presentation tier, the
bank's application servers enforcing rules like daily transfer limits are the application
tier, and the account database itself is the data tier.

!!! note "Client-server architecture is about physical location; the three-schema architecture below is about logical organization"
    Two-tier and three-tier describe *where software components run* — which machine, which
    process. The ANSI-SPARC architecture that follows describes something different: how
    the data *inside* the data tier's DBMS is logically organized into levels, regardless of
    which machine anything runs on. Keep the two ideas separate — a single-tier desktop
    database and a three-tier web application can both internally follow the same
    three-schema organization.

## The ANSI-SPARC Three-Schema Architecture

Proposed by the ANSI/X3/SPARC Study Group on Data Base Management Systems, the
**three-schema architecture** is the standard blueprint for how a DBMS organizes a
database's structure into three distinct levels, each describing the *same* underlying
data from a different point of view, for a different audience.

<div class="db-diagram" markdown>
<p class="db-diagram-label">The ANSI-SPARC three-schema architecture</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">External Level</span> <span class="db-node-sub">— many external schemas, one per user group; each shows only the data that group needs</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Conceptual Level</span> <span class="db-node-sub">— one conceptual schema; the complete community view of the whole database's structure and rules</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Internal Level</span> <span class="db-node-sub">— one internal schema; how the data is actually stored on physical media</span></div>
</div>
</div>

### External Level

The **external level** is closest to individual users, and consists of a number of
different **external schemas** (also called **user views**) — one for each distinct group
of users, each describing only the part of the database that group cares about, often
reshaped into a form convenient for them.

**Worked example: a university enrollment database.** Suppose the conceptual schema holds
full `Student`, `Course`, `Enrollment`, and `Instructor` relations, including sensitive
fields like `Student.cnic` and `Instructor.salary`. Different external schemas expose
very different slices of this:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Two external schemas over the same conceptual data</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">External schema: Course Advisor</span>
<span class="db-node-sub">StudentName, CourseTitle, Grade — no CNIC, no salary data at all</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">External schema: Payroll Clerk</span>
<span class="db-node-sub">InstructorName, Department, Salary — no student data at all</span>
</div>
</div>
</div>

Neither view shows the whole conceptual schema, and neither is aware the other exists —
each is tailored to exactly what its user group is authorized to see and needs to work
with.

### Conceptual Level

The **conceptual level** sits in the middle and holds exactly one **conceptual schema**: a
single, complete, community-wide view of the entire database's logical structure — every
entity, every relationship, every constraint — described *without* any reference to how
data is physically stored, and without favoring any one external view over another.

For the university example, the conceptual schema is the full set of relations
(`Student`, `Course`, `Enrollment`, `Instructor`) with all their attributes, primary and
foreign keys, and business rules (a student cannot enroll in the same course section
twice), independent of whether that data ends up on a hard disk, an SSD, or split across
several servers.

### Internal Level

The **internal level** holds exactly one **internal schema**, describing the physical
storage representation of the database: what files exist, what indexes exist, how records
are laid out on disk, what compression or encoding is used. This is the only level that
concerns itself with actual storage media.

For the university example, the internal schema might specify that `Student` records are
stored in a B-tree-indexed file ordered by `studentId`, with a separate hash index on
`cnic` for fast lookup — details no external-level user, and not even the conceptual
schema, needs to know about.

!!! warning "Three schemas, not three copies of the data"
    A common misconception: the three levels are **not** three separate copies of the data
    sitting in three different places. There is exactly one physical copy of the data,
    described at the internal level. The external and conceptual levels are *descriptions* —
    schemas — not additional data stores.

## Mappings Between the Levels

Because the three levels describe the same data differently, the DBMS needs a way to
translate a request made at one level into an action at another. That translation is done
through two **mappings**.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Mappings connecting the three levels</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">External Level</span>
<span class="db-node-sub">Course Advisor's view, Payroll Clerk's view, ...</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">External/Conceptual Mapping</span>
<span class="db-node-sub">Relates each external schema to the one conceptual schema</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">Conceptual Level</span>
<span class="db-node-sub">The single, complete community schema</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Conceptual/Internal Mapping</span>
<span class="db-node-sub">Relates the conceptual schema to the physical storage representation</span>
</div>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Internal Level</span>
<span class="db-node-sub">Files, indexes, physical record layout</span>
</div>
</div>
</div>

**External/Conceptual mapping** relates each external schema to the conceptual schema,
defining exactly how the (possibly renamed, reshaped, or restricted) fields a user sees
correspond to the conceptual schema's actual relations and attributes. When the Course
Advisor's view refers to `StudentName`, this mapping is what tells the DBMS that really
means `Student.name` in the conceptual schema.

**Conceptual/Internal mapping** relates the conceptual schema to the internal schema,
defining exactly how the conceptual-level relations correspond to physically stored
files, records, and fields. When the conceptual schema refers to a `Student` tuple, this
mapping is what tells the DBMS exactly where and how that tuple is physically stored on
disk.

## Data Independence, Precisely

With the three levels and two mappings in place, Lecture 2's promise of data independence
can finally be stated precisely — and split into the two distinct kinds Lecture 2
deliberately left unresolved.

### Logical Data Independence

**Logical data independence** is the capacity to change the **conceptual schema** without
having to change existing **external schemas** or the application programs built against
them. It is achieved because a change to the conceptual schema only requires updating the
**external/conceptual mapping** — the external schemas themselves stay exactly as they
were.

**Example.** The university adds a new `Instructor.officePhone` attribute to the
conceptual schema. The Course Advisor's external schema never referenced instructor data
at all, so nothing about it needs to change, and every application built against it keeps
working, completely unaware the conceptual schema grew a new column.

### Physical Data Independence

**Physical data independence** is the capacity to change the **internal schema** — how
data is physically stored — without having to change the **conceptual schema** (and,
therefore, without needing to change external schemas or application programs either). It
is achieved because a change to physical storage only requires updating the
**conceptual/internal mapping**.

**Example.** The DBA decides to add a new index on `Student.cnic` to speed up lookups, or
migrates the underlying storage from spinning disks to SSDs, or reorganizes how `Student`
records are laid out in their file. None of this touches a single attribute or
relationship in the conceptual schema — only the conceptual/internal mapping changes — so
every external schema and every application program is completely unaffected.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Logical vs. physical data independence</p>
<div class="db-grid-2" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">Logical data independence</span>
<span class="db-node-sub">Conceptual schema changes -&gt; only the external/conceptual mapping updates -&gt; external schemas untouched</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Physical data independence</span>
<span class="db-node-sub">Internal schema changes -&gt; only the conceptual/internal mapping updates -&gt; conceptual schema untouched</span>
</div>
</div>
</div>

!!! warning "The single most common mix-up in this topic"
    Students routinely swap these two around. Anchor them by *which schema changes*, not by
    which one sounds more "physical": **logical** data independence is about insulating
    users from changes at the **conceptual** level; **physical** data independence is about
    insulating the **conceptual** level from changes at the **internal**, physical-storage
    level. If the change is "we added a column" or "we split a relation in two," think
    logical. If the change is "we added an index" or "we moved to faster disks," think
    physical.

!!! tip "Physical data independence is the easier one to achieve in practice"
    Most commercial DBMSs deliver strong physical data independence — reorganizing storage,
    adding indexes, or changing file formats almost never requires touching application
    code. Logical data independence is harder: removing an attribute or restructuring a
    relation that an external schema actively depends on genuinely can force that external
    schema (and its applications) to change. The three-schema architecture minimizes this
    impact; it does not make it impossible.

## Key Takeaways

- **Two-tier** client-server architecture splits a system into client and database server;
  **three-tier** adds a middle application-server tier for business logic, improving
  scalability and centralizing logic that two-tier duplicates across every client.
- The **ANSI-SPARC three-schema architecture** organizes a database's structure into three
  levels describing the same data differently: the **external level** (many user views),
  the **conceptual level** (one complete community schema), and the **internal level** (the
  physical storage representation) — three *descriptions*, not three copies of the data.
- The **external/conceptual mapping** connects user views to the conceptual schema; the
  **conceptual/internal mapping** connects the conceptual schema to physical storage.
- **Logical data independence**: changing the conceptual schema without forcing changes to
  external schemas or application programs.
- **Physical data independence**: changing the internal (physical storage) schema without
  forcing changes to the conceptual schema — and therefore not to external schemas either.
- These four lectures form Unit 1's foundation; [Lecture
  5](lecture-05-the-relational-model.md) builds directly on the conceptual level just
  introduced here, formalizing it as the **relational model**.
