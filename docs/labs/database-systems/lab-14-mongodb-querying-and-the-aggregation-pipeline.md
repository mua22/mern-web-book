---
title: "Lab 14: MongoDB Querying & the Aggregation Pipeline"
---

# Lab 14: MongoDB Querying & the Aggregation Pipeline

## Objectives:

- Filter documents using comparison query operators (`$gt`, `$lt`, `$gte`, `$lte`, `$in`, `$ne`, `$regex`, `$exists`).
- Combine conditions using logical operators (`$and`, `$or`).
- Understand the aggregation pipeline as MongoDB's answer to SQL's `GROUP BY` and `JOIN`.
- Use `$match`, `$group`, `$sort`, `$project`, and `$lookup` to build multi-stage pipelines.

## Activity Outcomes:

- Write `find()` queries that combine multiple comparison and logical operators.
- Build a `$match` + `$group` pipeline that aggregates salary by department (the document-model equivalent of a SQL `GROUP BY`).
- Build a `$sort` + `$project` pipeline that shapes a report-style result.
- Build a `$lookup` pipeline that joins the `employees` collection to a separate `departments` collection (the document-model equivalent of a SQL `JOIN`).

**Tools / Software Required:**

- MongoDB Community Server (local install) or a free-tier MongoDB Atlas cluster
- `mongosh` (the MongoDB Shell) or MongoDB Compass
- The `employees` collection built in Lab 13, plus a new `departments` collection (created in Activity 4 below)

Instructor Note: As pre-lab activity, re-read Lab 04 (SQL `GROUP BY`) and Lab 05 (SQL `JOIN`) from the relational labs before this session -every pipeline stage below is introduced side-by-side with the SQL clause it replaces, and the comparison is the main learning objective of this lab.

## 1) Useful Concepts

**Query operators (used inside a `find()` filter):**

| Operator | Meaning |
|---|---|
| `$gt` | Greater than |
| `$lt` | Less than |
| `$gte` | Greater than or equal to |
| `$lte` | Less than or equal to |
| `$ne` | Not equal to |
| `$in` | Value is one of a given array of values |
| `$regex` | Field matches a regular-expression pattern (for text search) |
| `$exists` | Field is present (or absent) on the document |

**Logical operators:**

| Operator | Meaning |
|---|---|
| `$and` | All of the listed conditions must be true |
| `$or` | At least one of the listed conditions must be true |

**The aggregation pipeline, stage by stage -with its SQL analogy:**

| Pipeline Stage | SQL Analogy | Purpose |
|---|---|---|
| `$match` | `WHERE` | Filters documents entering the pipeline |
| `$group` | `GROUP BY` | Groups documents by a key and computes accumulators (`$sum`, `$avg`, `$count`) per group |
| `$sort` | `ORDER BY` | Orders documents (or groups) by one or more fields |
| `$project` | `SELECT` column list | Chooses, renames, or computes which fields pass to the next stage / the output |
| `$lookup` | `JOIN` | Pulls in matching documents from another collection, embedding them as an array field |

**`$group` accumulators:**

| Accumulator | Meaning |
|---|---|
| `$sum` | Total of a numeric field (or `1` to count documents) across the group |
| `$avg` | Average of a numeric field across the group |
| `$count` *(as a stage, MongoDB 5+)* | Counts the documents reaching that point in the pipeline |

**General pipeline shape:**

```javascript
db.collection.aggregate([
  { $match:   { ... } },   // ~ WHERE
  { $group:   { ... } },   // ~ GROUP BY
  { $sort:    { ... } },   // ~ ORDER BY
  { $project: { ... } }    // ~ SELECT column list
])
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Medium | CLO-4 |
| Activity 2 | 25 Minutes | Medium | CLO-4 |
| Activity 3 | 20 Minutes | Medium | CLO-4 |
| Activity 4 | 30 Minutes | High | CLO-5 |

### Activity 1: Filtering with multiple query operators

*Find every employee whose salary is at least 6000 but less than 13000, whose job title contains the word "Manager" (case-insensitive), and who is not employee 101.*

**Solution:**

```javascript
db.employees.find({
  $and: [
    { salary: { $gte: 6000, $lt: 13000 } },
    { job_title: { $regex: "Manager", $options: "i" } },
    { employee_id: { $ne: 101 } }
  ]
})

// Equivalent "is in one of these departments" check using $in
db.employees.find({ "department.department_id": { $in: [20, 30, 50] } })
```

**Output / Expected behaviour:**

```json
[
  { "employee_id": 102, "first_name": "Michael", "last_name": "Hartstein", "job_title": "Marketing Manager", "salary": 13650 }
]
```

### Activity 2: `$match` + `$group` -average and total salary by department

*Compute, for every department, the number of employees, their total salary, and their average salary -sorted from highest average salary to lowest. This is the direct document-model parallel of the SQL `GROUP BY` report built in Lab 04.*

**Solution:**

```javascript
db.employees.aggregate([
  { $match: { salary: { $gt: 0 } } },                 // ~ WHERE salary > 0
  { $group: {
      _id: "$department.department_name",             // ~ GROUP BY department_name
      employee_count: { $sum: 1 },
      total_salary:   { $sum: "$salary" },
      avg_salary:     { $avg: "$salary" }
  }},
  { $sort: { avg_salary: -1 } }                        // ~ ORDER BY avg_salary DESC
])
```

**Output / Expected behaviour:**

```json
[
  { "_id": "Marketing",      "employee_count": 2, "total_salary": 19650, "avg_salary": 9825 },
  { "_id": "Administration", "employee_count": 1, "total_salary": 4400,  "avg_salary": 4400 }
]
```

### Activity 3: `$sort` + `$project` -a salary report

*Produce a report showing each employee's full name (computed by concatenating first and last name), job title, and salary, sorted by salary descending, hiding the raw `_id` and `email` fields.*

**Solution:**

```javascript
db.employees.aggregate([
  { $sort: { salary: -1 } },                          // ~ ORDER BY salary DESC
  { $project: {                                        // ~ SELECT full_name, job_title, salary
      _id: 0,
      full_name: { $concat: ["$first_name", " ", "$last_name"] },
      job_title: 1,
      salary: 1
  }}
])
```

**Output / Expected behaviour:**

| full_name | job_title | salary |
|---|---|---|
| Michael Hartstein | Marketing Manager | 13650 |
| Pat Fay | Marketing Representative | 6000 |
| Jennifer Whalen | Administration Assistant | 4400 |

### Activity 4: `$lookup` -joining employees to departments

*Create a separate `departments` collection, then write a pipeline that attaches each employee's full department document (including a `location` field that does not exist in the embedded copy) by joining on `department_id`. This is the direct document-model parallel of the SQL `JOIN` built in Lab 05.*

**Solution:**

```javascript
// Step 1: a separate departments collection, independent of the embedded copy
db.departments.insertMany([
  { department_id: 10, department_name: "Administration", location: "Karachi" },
  { department_id: 20, department_name: "Marketing",       location: "Lahore" },
  { department_id: 30, department_name: "Purchasing",      location: "Islamabad" }
])

// Step 2: $lookup joins employees -> departments on department_id
db.employees.aggregate([
  { $lookup: {
      from: "departments",                 // collection being joined ~ JOIN departments
      localField: "department.department_id",
      foreignField: "department_id",
      as: "department_info"               // ~ the joined row(s), returned as an array
  }},
  { $unwind: "$department_info" },        // flattens the one-element array, like an inner join
  { $project: {
      _id: 0,
      first_name: 1,
      last_name: 1,
      job_title: 1,
      "department_info.department_name": 1,
      "department_info.location": 1
  }}
])
```

**Output / Expected behaviour:**

```json
[
  {
    "first_name": "Jennifer",
    "last_name": "Whalen",
    "job_title": "Administration Assistant",
    "department_info": { "department_name": "Administration", "location": "Karachi" }
  },
  {
    "first_name": "Michael",
    "last_name": "Hartstein",
    "job_title": "Marketing Manager",
    "department_info": { "department_name": "Marketing", "location": "Lahore" }
  }
]
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Multi-operator filter**

Write a `find()` query that returns every employee whose `salary` is between 5000 and 15000 inclusive, whose `email` field exists, and whose `first_name` starts with any letter from "A" to "M" (use `$regex`). Combine the conditions with an explicit `$and`.

**Lab Task 2: Headcount and salary by department**

Using `$match`, `$group`, and `$sort`, produce a report of employee headcount and maximum salary (`$max`) per department, including only departments with more than one employee (hint: add a second `$match` after `$group`, filtering on `employee_count`), sorted by headcount descending.

**Lab Task 3: Projected, joined report**

Write a single pipeline that uses `$lookup` to join `employees` to `departments` on department id, `$project`s only `employee_id`, `full_name` (computed), `department_info.location`, and `salary`, and `$sort`s the final result by `location` ascending.
