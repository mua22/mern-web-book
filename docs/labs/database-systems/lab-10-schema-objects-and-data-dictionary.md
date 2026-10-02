---
title: "Lab 10: Schema Objects & Data Dictionary"
---

# Lab 10: Schema Objects & Data Dictionary

## Objectives:

- Understand and create views (`CREATE VIEW`) to simplify and restrict data access.
- Understand how SQL Server's indexed views relate to the "materialized view" concept used in other database systems.
- Understand auto-numbering using `IDENTITY` columns and `CREATE SEQUENCE`.
- Create indexes and understand the difference between clustered and non-clustered indexes.
- Create synonyms for schema objects.
- Query the system data dictionary (`sys.tables`, `sys.columns`, `INFORMATION_SCHEMA.COLUMNS`).

## Activity Outcomes:

- Create a view that hides sensitive columns from a base table.
- Create an index and identify a query that benefits from it.
- Query `INFORMATION_SCHEMA.COLUMNS` to inspect a table's structure.
- Create and use a synonym.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS)
- The HR sample database (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, JOBS, EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapter on "Schema Objects: Views, Indexes, Sequences and the Data Dictionary" from the course's SQL Server reference text.

## 1) Useful Concepts

| Object / Statement | Description |
|---|---|
| `CREATE VIEW view_name AS SELECT ...` | Defines a virtual table backed by a stored query; does not store data itself |
| Indexed View (SQL Server) | SQL Server's equivalent of a "materialized view" -created with `CREATE VIEW ... WITH SCHEMABINDING` followed by a unique clustered index on the view, which physically stores the result set |
| `IDENTITY(seed, increment)` | Column property that auto-generates sequential numeric values on `INSERT` (most common T-SQL auto-increment mechanism) |
| `CREATE SEQUENCE seq_name AS INT START WITH 1 INCREMENT BY 1` | A standalone, reusable number generator independent of any single table (closer to Oracle-style sequences) |
| `NEXT VALUE FOR seq_name` | Retrieves the next value from a sequence |
| `CREATE INDEX idx_name ON table(column)` | Creates a non-clustered index to speed up lookups on a column |
| `CREATE CLUSTERED INDEX` | Creates an index that determines the physical storage order of table rows (a table may have only one) |
| `CREATE NONCLUSTERED INDEX` | Creates a separate structure with pointers back to the data rows; a table may have many |
| `CREATE SYNONYM syn_name FOR schema.object` | Creates an alternate name for a table, view, or other object |
| `sys.tables` | System catalog view listing all user tables |
| `sys.columns` | System catalog view listing all columns of all objects |
| `INFORMATION_SCHEMA.COLUMNS` | ANSI-standard view exposing column metadata (name, type, nullability) for every table |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-3 |
| Activity 2 | 15 Minutes | Medium | CLO-3 |
| Activity 3 | 15 Minutes | Low | CLO-3 |
| Activity 4 | 15 Minutes | Low | CLO-3 |

### Activity 1: Creating a simplified employee-department view

*HR staff need a simplified, read-only view of employees and their departments that hides sensitive columns such as `salary` and `commission_pct`. Create a view EMPLOYEE_DIRECTORY_VW exposing only the employee's name, email, job, and department name.*

**Solution:**

```sql
CREATE VIEW EMPLOYEE_DIRECTORY_VW AS
SELECT
    e.employee_id,
    e.first_name,
    e.last_name,
    e.email,
    e.job_id,
    d.department_name
FROM EMPLOYEES e
JOIN DEPARTMENTS d ON e.department_id = d.department_id;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

SELECT * FROM EMPLOYEE_DIRECTORY_VW WHERE department_name = 'IT';

| employee_id | first_name | last_name | email          | job_id    | department_name |
|-------------|------------|-----------|----------------|-----------|------------------|
| 103         | Alexander  | Hunold    | AHUNOLD        | IT_PROG   | IT               |
| 104         | Bruce      | Ernst     | BERNST         | IT_PROG   | IT               |

-- salary and commission_pct are not exposed through this view.
```

### Activity 2: Creating an index and observing its use

*Employee lookups by `last_name` are frequent and slow on a large EMPLOYEES table. Create a non-clustered index on `last_name` and write a query that would use it.*

**Solution:**

```sql
CREATE NONCLUSTERED INDEX idx_employees_lastname
ON EMPLOYEES (last_name);
GO

-- Query that benefits from the new index:
SELECT employee_id, first_name, last_name, department_id
FROM EMPLOYEES
WHERE last_name = 'King';
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

| employee_id | first_name | last_name | department_id |
|-------------|------------|-----------|----------------|
| 100         | Steven     | King      | 90             |

-- The query's execution plan shows an "Index Seek" on idx_employees_lastname
-- instead of a full table scan, because the WHERE clause filters on last_name.
```

### Activity 3: Querying INFORMATION_SCHEMA for column metadata

*Before writing a report query, a developer wants to see every column of the EMPLOYEES table, along with its data type and whether it allows NULLs.*

**Solution:**

```sql
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'EMPLOYEES'
ORDER BY ORDINAL_POSITION;
```

**Output / Expected behaviour:**

```text
| COLUMN_NAME    | DATA_TYPE | CHARACTER_MAXIMUM_LENGTH | IS_NULLABLE |
|----------------|-----------|--------------------------|-------------|
| employee_id    | int       | NULL                     | NO          |
| first_name     | nvarchar  | 50                       | YES         |
| last_name      | nvarchar  | 50                       | NO          |
| email          | nvarchar  | 100                      | NO          |
| phone_number   | varchar   | 20                       | YES         |
| hire_date      | date      | NULL                     | NO          |
| job_id         | varchar   | 10                       | NO          |
| salary         | decimal   | NULL                     | YES         |
| commission_pct | decimal   | NULL                     | YES         |
| manager_id     | int       | NULL                     | YES         |
| department_id  | int       | NULL                     | YES         |
```

### Activity 4: Creating a synonym

*Report writers keep mistyping the full table name EMPLOYEES in ad-hoc queries. Create a shorter synonym EMP for it.*

**Solution:**

```sql
CREATE SYNONYM EMP FOR dbo.EMPLOYEES;

-- Usage:
SELECT employee_id, first_name, last_name FROM EMP WHERE department_id = 60;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

| employee_id | first_name | last_name |
|-------------|------------|-----------|
| 103         | Alexander  | Hunold    |
| 104         | Bruce      | Ernst     |
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Department summary view**

Create a view DEPARTMENT_HEADCOUNT_VW that lists each department's `department_name` along with a count of employees in it (hint: use `GROUP BY` with `JOIN`).

**Lab Task 2: Indexing for a search column**

Create a non-clustered index on the `email` column of EMPLOYEES, then write a query that looks up an employee by `email` and would benefit from this index.

**Lab Task 3: Data dictionary and synonym**

Write a query against `sys.tables` that lists every user table in the database along with its `create_date`. Then create a synonym DEPT for the DEPARTMENTS table and use it in a simple `SELECT`.
