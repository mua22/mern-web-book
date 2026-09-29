---
title: "32. Course Review"
tags:
  - CSC270
  - Course Review
  - Capstone
---

# 32. Course Review

Thirty-one lectures ago, this course opened with a simple question: what actually *is* a
database, and why isn't "just a bunch of files" good enough? Every lecture since has been an
answer to some piece of that question, built on top of the answers before it. This final
lecture doesn't introduce new material — instead, it walks back across all eight units, one
tight recap at a time, and follows a single running example through every stage a real
piece of data goes through in a real system: modeled, normalized, secured and indexed,
represented as a document, and finally updated safely inside a transaction.

## In This Lecture

- A one-paragraph recap of each of the course's 8 units, with a diagram or two apiece
- One running example — a university's Student/Course enrollment data — followed through
  ER modeling, normalization, indexing/security, NoSQL, and transactions
- A consolidated concept map tying the whole course together end to end
- Where this course's ideas lead next: distributed databases, data warehousing, query
  optimization
- A closing note now that the course is complete

## The Running Example

Throughout this recap, one scenario recurs: a university needs to record which **students**
are enrolled in which **courses**. It's small enough to hold in your head in full, and rich
enough that every unit of this course had something genuine to say about it.

## Unit 1 — Foundations of Database Systems

[Lecture 1](lecture-01-introduction-to-databases-and-information-systems.md) opened with the
problem a DBMS exists to solve: a **file-based approach** to storing the university's data
(a plain spreadsheet of student records, another of course records, no coordination between
them) suffers from data redundancy, inconsistency, and poor access control the moment more
than one program needs to touch that data. The **database approach** — a shared,
centrally-managed repository governed by a DBMS — fixes this by inserting one layer of
software between every application and the raw data, responsible for structure, integrity,
concurrent access, and recovery, all of which the rest of this course explored in depth.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 1 — from raw files to a managed database</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">File-based approach</span>
<span class="db-node-sub">Each application owns its own files — redundancy, inconsistency, no shared control</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">Database approach</span>
<span class="db-node-sub">One shared repository, managed by a DBMS, used by many applications at once</span>
</div>
</div>
</div>

## Unit 2 — The Relational Model

[Lecture 5](lecture-05-the-relational-model.md) gave that "structure" a precise mathematical
shape: data lives in **relations** (tables) — sets of tuples (rows) over a fixed set of
attributes (columns), each drawn from a declared domain. [Lecture 6](lecture-06-integrity-constraints.md)
then added the rules that keep a relation trustworthy: domain constraints on individual
values, entity integrity forbidding a `NULL` primary key, and referential integrity keeping
every foreign key honest against the table it references.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 2 — the Student relation, with its constraints</p>
<div class="db-relation" markdown>
<div class="db-relation-name">Student (<u>studentId</u>, name, major)</div>

| studentId | name | major |
|---|---|---|
| S001 | Amina Raza | Computer Science |
| S002 | Bilal Hussain | Computer Science |

</div>
</div>

## Unit 3 — Relational Algebra and Calculus

[Lecture 7](lecture-07-relational-algebra-unary-and-set-operations.md) onward gave the
relational model a formal query language, built from a small set of operators — selection
(σ), projection (π), join (⋈), union, and division among them — each one taking whole
relations as input and producing a relation as output, which is exactly what lets these
operators **compose**. "Which Computer Science students are enrolled in a Database Systems
course?" is one composed expression built from exactly these pieces:

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 3 — a composed relational algebra query</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">σ (Selection)</span>
<span class="db-node-sub">major = 'Computer Science'</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">⋈ (Join)</span>
<span class="db-node-sub">Student ⋈ Enrollment ⋈ Course</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">π (Projection)</span>
<span class="db-node-sub">name, courseTitle</span>
</div>
</div>
</div>

## Unit 4 — Data Modeling: ER and EER

[Lecture 11](lecture-11-data-modeling-and-database-design.md) onward is where the running
example first takes shape, at the conceptual level, before any table exists at all: `Student`
and `Course` as **entities**, connected by an **Enrolls** relationship with M:N cardinality
(a student enrolls in many courses; a course has many students), refined further with EER
tools like specialization where needed (Lecture 13 covered exactly the kinds of modeling
issues that arise here).

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 4 — the running example as an ER diagram</p>
<div class="db-erd" markdown>
<div class="db-entity" markdown>
<div class="db-entity-name">Student</div>
<ul class="db-entity-attrs"><li class="db-pk">studentId</li><li>name</li><li>major</li></ul>
</div>
<div class="db-relate" markdown>
<div class="db-relate-line"></div>
<div class="db-relate-name">Enrolls</div>
<div class="db-relate-line"></div>
<div class="db-relate-card"><span class="db-badge db-badge-teal">M</span><span class="db-badge db-badge-orange">N</span></div>
</div>
<div class="db-entity" markdown>
<div class="db-entity-name">Course</div>
<ul class="db-entity-attrs"><li class="db-pk">courseId</li><li>title</li><li>seatsAvailable</li></ul>
</div>
</div>
</div>

## Unit 5 — Normalization

[Lecture 18](lecture-18-normalization-purpose-and-concepts.md) onward took the ER diagram's
M:N relationship and gave it formal, redundancy-free table structure. A naive single table
holding every enrollment repeats the student's name and the course's title on every row —
exactly the update-anomaly risk normalization exists to eliminate. Decomposing it into
**1NF → 2NF → 3NF** form (a fresh `Enrollment` table holding only the foreign keys and any
enrollment-specific attribute, like the grade) removes the redundancy entirely, matching the
ER diagram's M:N relationship as its own relation, exactly as Unit 4's modeling anticipated.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 5 — normalizing the enrollment data</p>
<div class="db-grid-2" markdown>
<div class="db-relation" markdown>
<div class="db-relation-name">Unnormalized — repeats name and title</div>

| studentId | name | courseId | title | grade |
|---|---|---|---|---|
| S001 | Amina Raza | CS270 | Database Systems | A |
| S001 | Amina Raza | CS211 | Algorithms | B+ |

</div>
<div class="db-relation" markdown>
<div class="db-relation-name">3NF — Enrollment references, doesn't repeat</div>

| studentId | courseId | grade |
|---|---|---|
| S001 | CS270 | A |
| S001 | CS211 | B+ |

</div>
</div>
</div>

## Unit 6 — Views, Security, and Indexing

[Lecture 23](lecture-23-views-and-materialized-views.md) onward operationalized the
normalized schema. A **view** exposes a student's transcript (`Student ⋈ Enrollment ⋈
Course`, the exact same join from Unit 3) as a single queryable object without duplicating
data; `GRANT SELECT ON StudentTranscript TO registrar_staff` limits who can read it; and an
**index** on `Enrollment.studentId` turns "find every course this student is enrolled in"
from a full table scan into a direct lookup — the same structure this course covers
underneath every one of its transaction examples running fast in practice.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 6 — a view, a grant, and an index over the normalized tables</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">VIEW StudentTranscript</span>
<span class="db-node-sub">Student ⋈ Enrollment ⋈ Course, exposed as one queryable object</span>
</div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">GRANT SELECT ... TO registrar_staff</span>
<span class="db-node-sub">Restricts who can read the view</span>
</div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">INDEX ON Enrollment(studentId)</span>
<span class="db-node-sub">Makes "find this student's enrollments" fast</span>
</div>
</div>
</div>

## Unit 7 — NoSQL and MongoDB

[Lecture 26](lecture-26-introduction-to-nosql-databases.md) onward stepped outside the
relational model entirely, and the running example is a genuinely useful contrast here: a
document database like MongoDB would happily store a student's enrollments **denormalized**,
embedded directly inside the student's own document — the opposite instinct from Unit 5 —
because MongoDB's strength is reading one student's entire profile in a single lookup,
without a join, at the cost of the same update-anomaly risk normalization was designed to
eliminate.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 7 — the same data, denormalized as a MongoDB document</p>
<div class="db-relation" markdown>
<div class="db-relation-name">students collection — one embedded document</div>

```json
{
  "_id": "S001",
  "name": "Amina Raza",
  "major": "Computer Science",
  "enrollments": [
    { "courseId": "CS270", "title": "Database Systems", "grade": "A" },
    { "courseId": "CS211", "title": "Algorithms", "grade": "B+" }
  ]
}
```

</div>
</div>

Neither choice — Unit 5's normalized tables or Unit 7's embedded document — is universally
"correct"; each is the right tool for a different access pattern, exactly the kind of
trade-off this entire course has repeatedly asked you to reason about explicitly rather than
apply by habit.

## Unit 8 — Transaction Management

[Lecture 29](lecture-29-database-transactions-and-acid-properties.md) onward wrapped the
whole thing in safety guarantees. Enrolling a student is, underneath, at least two writes —
insert the `Enrollment` row *and* decrement `Course.seatsAvailable` — and both must succeed
or neither should, exactly the transaction pattern Lecture 29's bank transfer demonstrated.
[Lecture 30](lecture-30-transaction-management-concurrency-control.md)'s concurrency control
stops two students from both reading "1 seat left" and both successfully enrolling in it, and
[Lecture 31](lecture-31-failure-and-recovery-in-transaction-management.md)'s recovery manager
guarantees that once a student's enrollment is confirmed, it survives any crash that follows.

<div class="db-diagram" markdown>
<p class="db-diagram-label">Unit 8 — enrolling a student, safely, inside one transaction</p>
<div class="db-flow" markdown>
<div class="db-node db-node-teal" markdown>
<span class="db-node-title">BEGIN TRANSACTION</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-purple" markdown>
<span class="db-node-title">INSERT Enrollment; UPDATE seatsAvailable</span>
<span class="db-node-sub">Isolation (Lecture 30) stops two students racing for the last seat</span>
</div>
<div class="db-arrow"></div>
<div class="db-node db-node-orange" markdown>
<span class="db-node-title">COMMIT</span>
<span class="db-node-sub">Durability (Lecture 31) guarantees this survives any later crash</span>
</div>
</div>
</div>

## The Whole Course, as One Thread

Laid end to end, the running example touched every unit of this course in a single,
unbroken line — this is the concept map the rest of the course has been building toward:

<div class="db-diagram" markdown>
<p class="db-diagram-label">One enrollment record's entire journey through this course</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 1 — Foundations</span>
<span class="db-node-sub">A DBMS, not loose files, manages Student and Course data</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Units 2–3 — Relational Model, Algebra &amp; Calculus</span>
<span class="db-node-sub">Data lives in constrained relations; queries are composed operators over them</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 4 — ER/EER Modeling</span>
<span class="db-node-sub">Student —Enrolls(M:N)— Course, modeled conceptually first</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 5 — Normalization</span>
<span class="db-node-sub">The M:N relationship becomes its own redundancy-free Enrollment table</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 6 — Views, Security, Indexing</span>
<span class="db-node-sub">A transcript view, access control, and a fast lookup path over those tables</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 7 — NoSQL contrast</span>
<span class="db-node-sub">The same data, deliberately denormalized, for a different access pattern</span>
</div>
<div class="db-stack-layer" markdown>
<span class="db-node-title">Unit 8 — Transactions</span>
<span class="db-node-sub">Every write to this data, wrapped in ACID guarantees</span>
</div>
</div>
</div>

Notice what each unit actually contributed: Units 1–3 gave you the *vocabulary and query
power* to talk about data precisely; Units 4–5 gave you a *disciplined design process* from
real-world requirements to a provably redundancy-free schema; Unit 6 made that schema
*usable and safe* for real applications; Unit 7 showed you that the relational answer isn't
the *only* answer; and Unit 8 made every single operation on that data *safe under failure
and concurrency*. None of these units stands alone — a normalized schema (Unit 5) with no
transactions (Unit 8) protecting its writes is just as fragile as a perfectly modeled ER
diagram (Unit 4) with no indexing (Unit 6) to make it usable at scale.

## Where This Leads Next

This course deliberately stopped at a single DBMS instance, serving requests one transaction
at a time (however concurrently). Three natural directions extend everything you've learned
here:

- **Distributed databases** — what happens when the data itself is spread across multiple
  machines, and a transaction might need to update rows on two of them at once (this needs
  its own version of Atomicity and Isolation, across a network that can partially fail).
- **Data warehousing and OLAP** — this course's relational model was optimized for many
  small, fast transactions (OLTP); a data warehouse instead optimizes for a small number of
  huge, read-heavy analytical queries across a company's entire history of data.
- **Query optimization** — every SQL query this course wrote was, silently, run through a
  query optimizer that chose *how* to execute the relational algebra behind it (which
  index to use, which join order) — a topic this course assumed but never opened up.

## Course Complete

You started this semester with a question about files and spreadsheets, and by this lecture
you've built, unit by unit, a complete and rigorous answer: how to model real-world data
correctly, how to prove that model is free of redundancy, how to query it with a small,
composable algebra, how to secure and speed up access to it, how to consider a document-based
alternative when it genuinely fits better, and finally, how to guarantee every single change
to it is safe — even against concurrent access and outright hardware failure. That last piece
is not a footnote; it's the guarantee that makes everything built in the first seven units
actually trustworthy in the real world, where machines crash and thousands of users click
"submit" at the same instant.

None of this stops mattering once the exam is over. Every application you build from here
forward — a web app, a mobile backend, a data pipeline — sits on top of a database doing
exactly the things this course spent a semester explaining. The specific SQL dialect or
NoSQL engine you end up using on the job may differ from the exact examples here, but the
underlying questions will not: is this schema modeled correctly, is it normalized enough to
trust, is it indexed and secured appropriately, and is every write to it actually safe.
That's the habit of mind this course was built to give you — congratulations on completing
Database Systems (CSC270).
