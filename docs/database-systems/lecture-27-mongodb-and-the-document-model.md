---
title: "27. MongoDB and the Document Model"
tags:
  - CSC270
  - MongoDB
  - NoSQL
  - Document Databases
---

# 27. MongoDB and the Document Model

Lecture 26 named MongoDB as the leading example of a document store; now we open it up
properly. MongoDB is the most widely used NoSQL database in the world, and it is the one you
are overwhelmingly likely to meet in a real job, so this lecture and the next work through it
in genuine depth: how it is structured, what a "document" actually is on disk, and how to
read, write, update, and delete data with its real query syntax. Keep the relational habits
from Units 3–5 close at hand — the most useful thing you can do in this lecture is notice,
concretely, where MongoDB agrees with everything you already know and where it deliberately
does something else.

## In This Lecture

- MongoDB's architecture: the `mongod` server process, databases, collections, and documents
- The document-oriented data model, and how it compares to the relational row/table model
- **BSON** — why MongoDB stores Binary JSON instead of plain text JSON
- MongoDB's core data types, including `ObjectId`, dates, arrays, and embedded documents
- Modeling relationships by **embedding** — and how that contrasts with relational
  normalization
- Real CRUD syntax: `insertOne`/`insertMany`, `find`, `updateOne`/`updateMany`,
  `deleteOne`/`deleteMany`
- Query operators (`$gt`, `$in`, `$and`) and projections
- Realistic use cases for a document database

## Introduction to MongoDB

**MongoDB** is an open-source, document-oriented NoSQL database, first released in 2009 and
now maintained by MongoDB, Inc. Instead of rows in tables, MongoDB stores data as
**documents** — flexible, nested, JSON-like structures — grouped into **collections**. It was
built from the ground up around the horizontal-scaling and schema-flexibility priorities from
Lecture 26, while still offering a rich query language, indexing (the same core idea as
Lecture 25, adapted to documents), and — since version 4.0 — multi-document ACID transactions.

## MongoDB Architecture

A running MongoDB deployment centers on **`mongod`**, the core server process that stores
data and answers queries. Clients — the `mongosh` shell, or a driver in your application's
language — connect to `mongod` (directly, or in a cluster, via a router; Lecture 28 covers
that) and issue commands against a four-level hierarchy:

<div class="db-diagram" markdown>
<p class="db-diagram-label">MongoDB's storage hierarchy</p>
<div class="db-stack" markdown>
<div class="db-stack-layer" markdown><span class="db-node-title">mongod server process</span> <span class="db-node-sub">— one running MongoDB instance</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Database</span> <span class="db-node-sub">— e.g. university</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Collection</span> <span class="db-node-sub">— e.g. students, courses — analogous to a relational table</span></div>
<div class="db-stack-layer" markdown><span class="db-node-title">Document</span> <span class="db-node-sub">— e.g. one student's record — analogous to a relational row</span></div>
</div>
</div>

## Documents and Collections

A **collection** is MongoDB's rough analog of a relational table — but unlike a table, it
enforces no fixed schema: two documents in the same collection can have entirely different
fields. A **document** is the analog of a row, written as a set of field/value pairs — but
unlike a row, a document's values can themselves be arrays or nested documents, not just flat
scalars.

```javascript
// A single document in the "students" collection
{
  _id: ObjectId("66f1a2b3c4d5e6f7a8b9c0d1"),
  regNo: "FA21-BCS-045",
  name: "Ayesha Khan",
  gpa: 3.72,
  department: "Computer Science",
  isActive: true,
  enrollmentDate: ISODate("2021-09-01")
}
```

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Relational model</p>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Table</span><span class="db-node-sub">Fixed columns, every row has the same shape</span></div>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Document model</p>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Collection</span><span class="db-node-sub">No fixed columns, documents can vary in shape</span></div>
</div>

</div>

## BSON Data Format

MongoDB does not store documents as plain-text JSON. It stores them as **BSON** ("Binary
JSON"), a binary-encoded serialization format designed for exactly two things JSON itself
can't do well:

- **Richer data types** — plain JSON only has strings, numbers, booleans, null, arrays, and
  objects. BSON adds types JSON has no native concept of, including dates, binary data, and a
  dedicated 12-byte `ObjectId` type — all of which you'll see below.
- **Efficient traversal** — every BSON field is stored with a length prefix, so the database
  can skip directly past a field it doesn't need instead of parsing character-by-character the
  way a text-based JSON parser must.

You never write BSON by hand — you write ordinary-looking JSON-like syntax in `mongosh` or a
driver, and MongoDB encodes it to BSON internally, decoding it back to a readable
representation whenever you view it.

## MongoDB Data Types

| Type | Example | Notes |
|---|---|---|
| `ObjectId` | `ObjectId("66f1a2b3c4d5e6f7a8b9c0d1")` | A 12-byte unique identifier, auto-generated as `_id` if you don't supply one |
| `String` | `"Ayesha Khan"` | UTF-8 text |
| `Int32` / `Int64` | `42`, `9223372036854775807` | Whole numbers, sized like a relational `INT`/`BIGINT` |
| `Double` | `3.72` | Default type for a decimal literal |
| `Boolean` | `true`, `false` | |
| `Date` | `ISODate("2021-09-01")` / `new Date()` | Stored internally as milliseconds since the Unix epoch |
| `Array` | `["CSC270", "CSC211"]` | An ordered list — values need not even share a type |
| `Embedded Document` | `{ street: "6 Lawrence St", city: "Islamabad" }` | A document nested as the value of a field |
| `Null` | `null` | Represents a deliberately absent value |

## Embedded Documents and Arrays

This is the single biggest mental shift coming from the relational model. Instead of splitting
related data into separate tables joined by a foreign key, a document database can **embed**
related data directly inside the parent document — trading normalization for the convenience
of retrieving everything about one entity in a single read, with no join at all.

### One-to-Few: Embedding a List of Addresses

A student who has lived at, at most, a handful of addresses is the classic "one-to-few" case —
the related data is small, bounded, and almost always read together with its parent:

```javascript
db.students.insertOne({
  regNo: "FA21-BCS-045",
  name: "Ayesha Khan",
  addresses: [
    { type: "home", city: "Islamabad", street: "6 Lawrence St" },
    { type: "hostel", city: "Islamabad", street: "COMSATS Hostel Block C" }
  ]
});
```

### One-to-Many: Embedding Enrolled Courses

Now consider a student's enrolled courses — the relationship Lecture 16 would model with a
`Student` table, a `Course` table, and an `Enrollment` junction table connected by foreign
keys. MongoDB can instead embed the enrollment details directly inside the student document:

```javascript
db.students.insertOne({
  regNo: "FA21-BCS-045",
  name: "Ayesha Khan",
  gpa: 3.72,
  enrolledCourses: [
    { courseCode: "CSC270", title: "Database Systems", creditHours: 3, semester: "Fall 2025" },
    { courseCode: "CSC211", title: "Algorithms and Data Structures", creditHours: 3, semester: "Fall 2025" }
  ]
});
```

<div class="db-grid-2" markdown>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Relational approach (Lecture 16)</p>
<div class="db-flow db-flow-vertical" markdown>
<div class="db-node db-node-teal" markdown><span class="db-node-title">Student table</span><span class="db-node-sub">regNo, name, gpa</span></div>
<div class="db-node db-node-purple" markdown><span class="db-node-title">Enrollment table</span><span class="db-node-sub">regNo (FK), courseCode (FK), semester</span></div>
<div class="db-node db-node-orange" markdown><span class="db-node-title">Course table</span><span class="db-node-sub">courseCode, title, creditHours</span></div>
</div>
<span class="db-node-sub">Reading a student's courses needs a two-table join</span>
</div>

<div class="db-diagram" markdown>
<p class="db-diagram-label">Document approach (this lecture)</p>
<div class="db-node db-node-teal" markdown><span class="db-node-title">One student document</span><span class="db-node-sub">enrolledCourses embedded directly as an array — no join needed to read it</span></div>
</div>

</div>

Embedding is not the *only* option in MongoDB, and it is not always the right one. When
related data is large, unbounded, or needs to be queried independently of its "parent" — many
students sharing the same course, say — MongoDB documents can instead **reference** each other
by storing an `ObjectId`, much closer to a relational foreign key:

```javascript
// Referencing instead of embedding -- closer to the relational foreign-key style
db.students.insertOne({
  regNo: "FA21-BCS-045",
  name: "Ayesha Khan",
  enrolledCourseIds: [ ObjectId("66f2b1c0..."), ObjectId("66f2b1c1...") ]
});
```

!!! note "Embed for data read together; reference for data queried independently"
    Compare this directly against [Lecture 16 — Mapping EER Models to Relational
    Schemas](lecture-16-mapping-eer-models-to-relational-schemas.md): the relational model
    normalizes *first* and joins at query time; MongoDB asks you to design around your actual
    read pattern *first* — embed what you almost always read together, reference what you
    need to query, update, or share independently.

## MongoDB CRUD Operations

MongoDB's four CRUD verbs map directly onto SQL's `INSERT`, `SELECT`, `UPDATE`, and `DELETE` —
the syntax simply speaks documents instead of rows.

### Create

```javascript
db.students.insertOne({
  regNo: "FA21-BCS-046",
  name: "Bilal Ahmed",
  gpa: 3.15,
  department: "Computer Science",
  isActive: true
});

db.students.insertMany([
  { regNo: "FA21-BCS-047", name: "Sara Malik", gpa: 3.90, department: "Software Engineering", isActive: true },
  { regNo: "FA21-BCS-048", name: "Hamza Tariq", gpa: 2.85, department: "Computer Science", isActive: false }
]);
```

### Read

```javascript
// Every document in the collection
db.students.find();

// Documents matching an exact value
db.students.find({ department: "Computer Science" });

// Just the first match
db.students.findOne({ regNo: "FA21-BCS-045" });
```

### Update

```javascript
db.students.updateOne(
  { regNo: "FA21-BCS-045" },
  { $set: { gpa: 3.80 } }
);

db.students.updateMany(
  { isActive: false },
  { $set: { status: "alumni" } }
);
```

### Delete

```javascript
db.students.deleteOne({ regNo: "FA21-BCS-048" });

db.students.deleteMany({ isActive: false });
```

!!! warning "updateOne/deleteOne without a unique filter is a silent trap"
    `updateOne` and `deleteOne` act on the *first* document MongoDB happens to match — if your
    filter isn't actually unique, you may not modify the document you meant to. Filter on a
    genuinely unique field (like `regNo`, or `_id`) whenever you intend to touch exactly one
    document, exactly the same discipline a relational `WHERE` clause on a primary key gives you.

## MongoDB Querying

Beyond exact-match filters, MongoDB provides **query operators** — always written with a
leading `$` — for comparisons and logical combinations:

```javascript
// $gt: greater than
db.students.find({ gpa: { $gt: 3.5 } });

// $in: value is one of a given set
db.students.find({ department: { $in: ["Computer Science", "Software Engineering"] } });

// $and: every condition must hold
db.students.find({
  $and: [
    { gpa: { $gte: 3.0 } },
    { isActive: true }
  ]
});
```

A second argument to `find()` is a **projection** — which fields to return, mirroring a
relational `SELECT column_list` instead of `SELECT *`:

```javascript
// Return only name and gpa (and the always-included _id, suppressed here with 0)
db.students.find(
  { gpa: { $gt: 3.5 } },
  { name: 1, gpa: 1, _id: 0 }
);
```

| Operator | Meaning | Relational equivalent |
|---|---|---|
| `$eq` | Equal to | `=` |
| `$gt` / `$gte` | Greater than / or equal | `>` / `>=` |
| `$lt` / `$lte` | Less than / or equal | `<` / `<=` |
| `$in` | Value is in a given list | `IN (...)` |
| `$and` / `$or` | Combine conditions | `AND` / `OR` |

## MongoDB Use Cases

Document databases like MongoDB fit particularly well where records naturally vary in shape or
are usually read as one self-contained unit: content-management systems, product catalogs
with wildly different attributes per category, user profiles, mobile and single-page
application backends, and any system whose schema is still evolving quickly during active
product development.

## Key Takeaways

- MongoDB stores **documents** — flexible, JSON-like structures — grouped into **collections**,
  served by the `mongod` process; roughly: collection ≈ table, document ≈ row, but neither
  enforces a fixed shape.
- MongoDB stores data as **BSON**, not plain text JSON, for richer data types (`ObjectId`,
  `Date`, distinct integer/double types) and faster binary traversal.
- Relationships can be modeled by **embedding** related data directly in the parent document
  (best for data almost always read together) or by **referencing** another document's
  `ObjectId` (closer to a relational foreign key, better for independently-queried data) —
  a genuinely different design question than the normalize-first relational approach from
  Lecture 16.
- The CRUD verbs — `insertOne`/`insertMany`, `find`/`findOne`, `updateOne`/`updateMany`,
  `deleteOne`/`deleteMany` — map directly onto SQL's `INSERT`, `SELECT`, `UPDATE`, `DELETE`.
- Query operators like `$gt`, `$in`, and `$and`, plus projections, give MongoDB's query
  language most of the expressive power of a SQL `WHERE` and `SELECT` clause, in document form.

A single `mongod` on one machine is exactly the "one server" picture from Lecture 26's CAP
theorem discussion — fine until you need the availability or the capacity a single server
cannot give you. The next lecture shows how MongoDB actually achieves both. Continue to
[Lecture 28 — MongoDB Sharding and Replication](lecture-28-mongodb-sharding-and-replication.md).
