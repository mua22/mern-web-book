---
title: "Lab 13: Introduction to MongoDB & the Document Model"
---

# Lab 13: Introduction to MongoDB & the Document Model

## Objectives:

- Explain how MongoDB's document model differs from the relational model used in Labs 1–12.
- Compare relational vocabulary (table, row, column) to MongoDB vocabulary (collection, document, field).
- Distinguish BSON from JSON and understand why MongoDB stores BSON internally.
- Understand embedding vs. the SQL world's default of normalization into separate tables.
- Perform the four CRUD operation families: insert, find, update, and delete.

## Activity Outcomes:

- Create a database and a collection using the MongoDB Shell.
- Insert single and multiple documents with `insertOne()` and `insertMany()`.
- Query documents with `find()` and a basic equality filter.
- Update a document's field with `updateOne()` / `updateMany()` and `$set`.
- Delete documents with `deleteOne()` / `deleteMany()`.

**Tools / Software Required:**

- MongoDB Community Server (local install) or a free-tier MongoDB Atlas cluster
- `mongosh` (the MongoDB Shell) or MongoDB Compass
- A text editor -VS Code, Sublime Text, or Notepad++ (to save queries for submission)

Instructor Note: As pre-lab activity, read the official MongoDB manual pages "Documents" and "Databases and Collections", and re-open the `employees`/`departments` schema used in Labs 1–12 so the relational-to-document comparison in this lab makes sense in context.

## 1) Useful Concepts

| Term | Description |
|---|---|
| Database | Top-level container for collections, roughly like a SQL database/schema |
| Collection | A group of documents, roughly like a SQL table -but with no fixed column list |
| Document | A single JSON-like record inside a collection, roughly like a SQL row |
| Field | A key/value pair inside a document, roughly like a SQL column |
| `_id` | The mandatory primary-key field for every document; MongoDB generates an `ObjectId` automatically if one is not supplied |
| Embedded document | A document nested inside another document's field (e.g. `department` inside `employees`), used instead of a separate joined table |
| Array field | A field whose value is a list (e.g. `skills: ["Office Management", "Scheduling"]`) |
| BSON | "Binary JSON" -the binary-encoded format MongoDB actually stores and transmits documents in; adds types JSON lacks natively (`Date`, `ObjectId`, binary data) |
| JSON | The human-readable text format used to *write* documents in the shell; MongoDB converts it to BSON on the way in |
| Schema flexibility | Collections do not enforce a fixed column list -documents in the same collection may have different fields, unlike a SQL table's fixed schema |

**Relational model vs. document model:**

| Relational (SQL, Labs 1–12) | Document (MongoDB) |
|---|---|
| Database | Database |
| Table | Collection |
| Row | Document |
| Column | Field |
| Primary key column | `_id` field |
| Foreign key + `JOIN` to a second table | Either an embedded document/array (denormalized) or a reference field resolved later with `$lookup` |
| Schema fixed by `CREATE TABLE` | Schema flexible per document; validation is optional |
| Normalization (split data across tables to avoid duplication) | Embedding (nest related data directly in the document) is often preferred when that data is always read together |

**The four CRUD operation families:**

| Family | Key methods |
|---|---|
| Create | `insertOne(doc)`, `insertMany([doc1, doc2, ...])` |
| Read | `find(filter)`, `findOne(filter)` |
| Update | `updateOne(filter, { $set: {...} })`, `updateMany(filter, { $set: {...} })` |
| Delete | `deleteOne(filter)`, `deleteMany(filter)` |

**The HR dataset used throughout Labs 13–15 (same data as Labs 1–12, now as documents):**

```javascript
{
  _id: ObjectId("..."),
  employee_id: 101,
  first_name: "Jennifer",
  last_name: "Whalen",
  email: "jwhalen@example.com",
  hire_date: ISODate("2003-09-17"),
  job_title: "Administration Assistant",
  salary: 4400,
  department: { department_id: 10, department_name: "Administration" },
  skills: ["Office Management", "Scheduling"],
  manager_id: 101
}
```

Notice `department` is an **embedded document**, not a foreign key into a separate table -this is the document-model default, in contrast to the normalized `departments` table from the SQL labs.

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Low | CLO-4 |
| Activity 2 | 15 Minutes | Low | CLO-4 |
| Activity 3 | 20 Minutes | Medium | CLO-4 |
| Activity 4 | 20 Minutes | Medium | CLO-4 |

### Activity 1: Creating the database and inserting employee documents

*Switch to a new database named `hrDB`, then insert the first three employee documents into an `employees` collection -one with `insertOne()`, and two more with `insertMany()`.*

**Solution:**

```javascript
use hrDB

db.employees.insertOne({
  employee_id: 101,
  first_name: "Jennifer",
  last_name: "Whalen",
  email: "jwhalen@example.com",
  hire_date: ISODate("2003-09-17"),
  job_title: "Administration Assistant",
  salary: 4400,
  department: { department_id: 10, department_name: "Administration" },
  skills: ["Office Management", "Scheduling"],
  manager_id: 101
})

db.employees.insertMany([
  {
    employee_id: 102,
    first_name: "Michael",
    last_name: "Hartstein",
    email: "mhartstein@example.com",
    hire_date: ISODate("2004-02-17"),
    job_title: "Marketing Manager",
    salary: 13000,
    department: { department_id: 20, department_name: "Marketing" },
    skills: ["Campaign Planning", "Budgeting"],
    manager_id: 100
  },
  {
    employee_id: 103,
    first_name: "Pat",
    last_name: "Fay",
    email: "pfay@example.com",
    hire_date: ISODate("2005-08-17"),
    job_title: "Marketing Representative",
    salary: 6000,
    department: { department_id: 20, department_name: "Marketing" },
    skills: ["Market Research"],
    manager_id: 102
  }
])
```

**Output / Expected behaviour:**

```json
{
  acknowledged: true,
  insertedId: ObjectId("66f1a2b3c4d5e6f7a8b9c0d1")
}
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("66f1a2b3c4d5e6f7a8b9c0d2"),
    '1': ObjectId("66f1a2b3c4d5e6f7a8b9c0d3")
  }
}
```

### Activity 2: Finding documents with a basic filter

*Retrieve every employee in the Marketing department, then retrieve a single employee by `employee_id`.*

**Solution:**

```javascript
// All documents where the embedded field department_name equals "Marketing"
db.employees.find({ "department.department_name": "Marketing" })

// A single document, looked up by employee_id
db.employees.findOne({ employee_id: 101 })
```

**Output / Expected behaviour:**

```json
[
  { "employee_id": 102, "first_name": "Michael", "last_name": "Hartstein", "job_title": "Marketing Manager", "salary": 13000 },
  { "employee_id": 103, "first_name": "Pat", "last_name": "Fay", "job_title": "Marketing Representative", "salary": 6000 }
]
```

### Activity 3: Updating a salary

*Give employee 103 (Pat Fay) a raise to 6500, using `updateOne()` and `$set`. Then give every employee in the Marketing department a 5% increase using `updateMany()`.*

**Solution:**

```javascript
db.employees.updateOne(
  { employee_id: 103 },
  { $set: { salary: 6500 } }
)

db.employees.updateMany(
  { "department.department_name": "Marketing" },
  { $mul: { salary: 1.05 } }
)
```

**Output / Expected behaviour:**

```json
{ "acknowledged": true, "matchedCount": 1, "modifiedCount": 1 }
{ "acknowledged": true, "matchedCount": 2, "modifiedCount": 2 }
```

### Activity 4: Deleting a terminated employee

*Employee 103 has left the company. Remove that single document with `deleteOne()`. Then, as a cleanup example, show how `deleteMany()` would remove every employee in a department (e.g. a department being closed down).*

**Solution:**

```javascript
// Remove exactly one document
db.employees.deleteOne({ employee_id: 103 })

// Remove every document matching a filter (use with care -deletes every match)
db.employees.deleteMany({ "department.department_name": "Temporary Projects" })
```

**Output / Expected behaviour:**

```json
{ "acknowledged": true, "deletedCount": 1 }
{ "acknowledged": true, "deletedCount": 0 }
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Build the `employees` collection**

In a new database named `labDB`, insert at least six employee documents (reuse the `employees` shape shown in Useful Concepts) covering at least three different departments. Use one `insertOne()` call and one `insertMany()` call.

**Lab Task 2: Filter and update**

Write a `find()` query that returns every employee with `salary` below 7000. Then write an `updateOne()` that sets a `job_title` to a promoted title for one employee, and an `updateMany()` that adds a new skill to every employee in one department using `$push` inside `$set`'s sibling update operator (i.e. `{ $push: { skills: "New Skill" } }`).

**Lab Task 3: Clean up a department**

Add one employee document whose `department.department_name` is `"Temporary Projects"`. Write a `deleteMany()` query that removes every employee in that department, then confirm with a `find()` that the collection no longer contains any such documents.
