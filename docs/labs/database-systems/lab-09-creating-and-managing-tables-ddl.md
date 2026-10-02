---
title: "Lab 09: Creating & Managing Tables (DDL)"
---

# Lab 09: Creating & Managing Tables (DDL)

## Objectives:

- Understand the Data Definition Language (DDL) statements used in T-SQL.
- Create new tables with appropriate column data types.
- Apply column-level and table-level constraints (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`).
- Modify existing tables using `ALTER TABLE` -adding, altering, and dropping columns and constraints.
- Remove tables safely using `DROP TABLE`.

## Activity Outcomes:

- Design and create a new table from scratch with correct data types.
- Add a foreign key referencing an existing table.
- Alter a table to add, modify, or drop a column.
- Add a `CHECK` constraint to enforce a business rule.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS)
- The HR sample database (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, JOBS, EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapter on "Data Definition Language and Table Creation" from the course's SQL Server reference text, covering `CREATE TABLE`, `ALTER TABLE`, and constraint types.

## 1) Useful Concepts

| Statement / Keyword | Description |
|---|---|
| `CREATE TABLE table_name (...)` | Creates a new table with the specified columns and constraints |
| `INT` | Whole number data type (4 bytes) |
| `DECIMAL(p, s)` | Fixed-precision numeric type; `p` = total digits, `s` = digits after the decimal point |
| `VARCHAR(n)` / `NVARCHAR(n)` | Variable-length character string (non-Unicode / Unicode), max `n` characters |
| `DATE` | Stores a calendar date (no time component) |
| `DATETIME` | Stores date and time together |
| `PRIMARY KEY` | Uniquely identifies each row; implies `NOT NULL` and uniqueness |
| `FOREIGN KEY ... REFERENCES` | Enforces referential integrity by linking a column to a primary key in another table |
| `NOT NULL` | Disallows NULL values in a column |
| `UNIQUE` | Ensures all values in a column are distinct |
| `CHECK (condition)` | Enforces a Boolean condition on column values |
| `DEFAULT value` | Supplies a value automatically when none is provided on `INSERT` |
| `ALTER TABLE ... ADD column_name type` | Adds a new column to an existing table |
| `ALTER TABLE ... ALTER COLUMN` | Changes a column's data type, size, or nullability |
| `ALTER TABLE ... DROP COLUMN` | Removes a column from a table |
| `ALTER TABLE ... ADD CONSTRAINT` | Adds a named constraint to an existing table |
| `ALTER TABLE ... DROP CONSTRAINT` | Removes a named constraint |
| `DROP TABLE table_name` | Permanently removes a table and its data |

**Generic CREATE TABLE syntax:**

```sql
CREATE TABLE table_name (
    column1 datatype CONSTRAINT constraint_name PRIMARY KEY,
    column2 datatype NOT NULL,
    column3 datatype DEFAULT default_value,
    column4 datatype,
    CONSTRAINT fk_name FOREIGN KEY (column4) REFERENCES other_table(other_column)
);
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-3 |
| Activity 2 | 15 Minutes | Low | CLO-3 |
| Activity 3 | 20 Minutes | Medium | CLO-3 |
| Activity 4 | 15 Minutes | Low | CLO-3 |

### Activity 1: Creating a PROJECTS table with constraints

*Create a new table named PROJECTS to track departmental projects. It must have a surrogate primary key `project_id`, a required `project_name`, a `budget` with two decimal places, a `start_date`, and a foreign key `department_id` referencing the existing DEPARTMENTS table.*

**Solution:**

```sql
CREATE TABLE PROJECTS (
    project_id      INT IDENTITY(1,1) CONSTRAINT pk_projects PRIMARY KEY,
    project_name    NVARCHAR(100) NOT NULL,
    budget          DECIMAL(12, 2) DEFAULT 0.00,
    start_date      DATE NOT NULL DEFAULT GETDATE(),
    department_id   INT,
    CONSTRAINT fk_projects_department
        FOREIGN KEY (department_id) REFERENCES DEPARTMENTS(department_id)
);
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.
A new PROJECTS table is created with 0 rows; department_id values must
match an existing department_id in DEPARTMENTS (or be NULL).
```

### Activity 2: Altering PROJECTS to add a new column

*The department needs to track whether a project is still active. Alter the PROJECTS table to add a new `is_active` column that defaults to 1 (true).*

**Solution:**

```sql
ALTER TABLE PROJECTS
ADD is_active BIT NOT NULL DEFAULT 1;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.
PROJECTS now has 6 columns; existing rows (if any) are filled in with is_active = 1.
```

### Activity 3: Adding a CHECK constraint

*Business rule: a project's budget must never be negative. Add a named `CHECK` constraint to PROJECTS enforcing this rule on the existing `budget` column.*

**Solution:**

```sql
ALTER TABLE PROJECTS
ADD CONSTRAINT chk_projects_budget CHECK (budget >= 0);
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.
-- A later attempt such as:
-- INSERT INTO PROJECTS (project_name, budget, department_id) VALUES ('Test', -500, 10);
-- would fail with:
The INSERT statement conflicted with the CHECK constraint "chk_projects_budget".
```

### Activity 4: Dropping a column

*The `start_date` default of `GETDATE()` turned out to be unnecessary, and the team decides the `is_active` column is no longer needed. Drop the `is_active` column from PROJECTS.*

**Solution:**

```sql
ALTER TABLE PROJECTS
DROP CONSTRAINT IF EXISTS DF__PROJECTS__is_act__default; -- drop auto-named default constraint if present

ALTER TABLE PROJECTS
DROP COLUMN is_active;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.
PROJECTS now has 5 columns: project_id, project_name, budget, start_date, department_id.
```

*Note: SQL Server auto-generates a constraint name for a column's `DEFAULT` unless you name it explicitly with `CONSTRAINT`. In practice, check the actual name first with `sp_helpconstraint 'PROJECTS'` before dropping a column that has a default.*

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: EQUIPMENT table**

Create a new table EQUIPMENT with columns `equipment_id` (primary key), `equipment_name` (required), `purchase_cost` (decimal, two places), `purchase_date` (date), and `department_id` (foreign key referencing DEPARTMENTS). Add a `CHECK` constraint ensuring `purchase_cost` is greater than 0.

**Lab Task 2: Altering EQUIPMENT**

Alter the EQUIPMENT table created in Task 1 to add a `warranty_years` column (`INT`, default 1) and a `UNIQUE` constraint on `equipment_name`.

**Lab Task 3: Cleaning up**

Write the `ALTER TABLE` statement to drop the `warranty_years` column from EQUIPMENT, and then the `DROP TABLE` statement to remove the EQUIPMENT table entirely. Explain in one sentence why `DROP TABLE` should be used with caution.
