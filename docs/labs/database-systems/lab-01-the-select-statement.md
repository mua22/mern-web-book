---
title: "Lab 01: The SELECT Statement"
---

# Lab 01: The SELECT Statement

## Objectives:

- Understand the basic syntax and clause order of the T-SQL `SELECT` statement.
- Retrieve all columns or a chosen subset of columns from a table.
- Rename output columns using column aliases (`AS`).
- Remove duplicate rows from a result set using `DISTINCT`.
- Build arithmetic expressions in a SELECT list to derive new, computed columns.
- Concatenate string columns to build formatted, human-readable output.
- Limit the number of rows returned using `TOP N`.

## Activity Outcomes:

- Write a basic SELECT query against a real schema.
- Produce a report with renamed, computed columns.
- Produce a duplicate-free list of values from a column.
- Combine arithmetic and string operations in a single query.
- Restrict a result set to a fixed number of rows.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS) 18 or later
- The HR sample database, restored and attached to the local SQL Server instance

Instructor Note: As pre-lab activity, read the chapter on "Retrieving Data with the Select Statement" from Bryan Syverson and Joel Murach's "Murach's SQL Server for Developers" (relevant introductory chapter on SELECT basics).

## 1) Useful Concepts

| Clause / Keyword | Description |
|---|---|
| `SELECT col1, col2 FROM table;` | Retrieves the named columns from a table |
| `SELECT * FROM table;` | Retrieves all columns from a table |
| `SELECT col AS alias` | Renames a column in the output (alias may also be written `col alias` or `'alias' = col`) |
| `SELECT DISTINCT col` | Removes duplicate values/rows from the result set |
| `+`, `-`, `*`, `/`, `%` | Arithmetic operators usable directly in a SELECT list |
| `col1 + col2` or `CONCAT(col1, col2, ...)` | String concatenation (`+` requires matching/convertible types; `CONCAT` auto-converts and ignores `NULL`) |
| `SELECT TOP (n) ...` | Restricts the result set to the first *n* rows returned |
| `SELECT TOP (n) PERCENT ...` | Restricts the result set to the first *n* percent of rows |
| `;` | Statement terminator (recommended in T-SQL) |

**Basic SELECT syntax:**

```sql
SELECT column1, column2, ...
FROM table_name;
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 10 Minutes | Low | CLO-1 |
| Activity 2 | 15 Minutes | Low | CLO-1 |
| Activity 3 | 20 Minutes | Medium | CLO-1 |
| Activity 4 | 25 Minutes | Medium | CLO-1 |

### Activity 1: Selecting all employees

*Write a query to display every column, for every row, of the EMPLOYEES table.*

**Solution:**

```sql
SELECT *
FROM EMPLOYEES;
```

**Output / Expected behaviour:**

| employee_id | first_name | last_name | email | hire_date | job_id | salary | department_id |
|---|---|---|---|---|---|---|---|
| 100 | Steven | King | sking@hr.com | 2013-06-17 | AD_PRES | 24000.00 | 90 |
| 101 | Neena | Kochhar | nkochhar@hr.com | 2015-09-21 | AD_VP | 17000.00 | 90 |
| 102 | Lex | De Haan | ldehaan@hr.com | 2016-01-13 | AD_VP | 17000.00 | 90 |
| 103 | Alexander | Hunold | ahunold@hr.com | 2016-01-03 | IT_PROG | 9000.00 | 60 |
| 104 | Bruce | Ernst | bernst@hr.com | 2017-05-21 | IT_PROG | 6000.00 | 60 |

*(All rows and columns are returned; only a sample is shown above.)*

### Activity 2: Selecting specific columns with aliases

*Display each employee's ID, first name, last name, and salary. Rename the output columns to "Employee ID", "First Name", "Last Name", and "Monthly Salary" respectively.*

**Solution:**

```sql
SELECT employee_id AS "Employee ID",
       first_name  AS "First Name",
       last_name   AS "Last Name",
       salary      AS "Monthly Salary"
FROM EMPLOYEES;
```

**Output / Expected behaviour:**

| Employee ID | First Name | Last Name | Monthly Salary |
|---|---|---|---|
| 100 | Steven | King | 24000.00 |
| 101 | Neena | Kochhar | 17000.00 |
| 103 | Alexander | Hunold | 9000.00 |
| 104 | Bruce | Ernst | 6000.00 |
| 107 | Diana | Lorentz | 4200.00 |

### Activity 3: Computing annual salary and a raise, with distinct job titles

*Part A: Display each employee's last name along with their monthly salary, their computed annual salary (monthly salary × 12), and their annual salary after a 10% raise. Part B: Separately, list every distinct job_id present in the JOBS table (no duplicates).*

**Solution:**

```sql
-- Part A: Annual salary and raise computation
SELECT last_name                              AS "Last Name",
       salary                                 AS "Monthly Salary",
       salary * 12                            AS "Annual Salary",
       salary * 12 + (salary * 12 * 0.10)     AS "Annual Salary After 10% Raise"
FROM EMPLOYEES;

-- Part B: Distinct job titles (ids)
SELECT DISTINCT job_id AS "Job ID"
FROM JOBS;
```

**Output / Expected behaviour:**

Part A:

| Last Name | Monthly Salary | Annual Salary | Annual Salary After 10% Raise |
|---|---|---|---|
| King | 24000.00 | 288000.00 | 316800.00 |
| Kochhar | 17000.00 | 204000.00 | 224400.00 |
| Hunold | 9000.00 | 108000.00 | 118800.00 |
| Ernst | 6000.00 | 72000.00 | 79200.00 |

Part B:

| Job ID |
|---|
| AD_PRES |
| AD_VP |
| IT_PROG |
| SA_REP |
| ST_CLERK |

### Activity 4: Formatted full-name report, top 5 highest-paid

*Produce a report with one column named "Employee" that shows each employee's full name formatted as "Last, First" (e.g., "King, Steven"), and a column named "Annual Salary" showing salary × 12. Show only the 5 rows with the smallest employee_id (use TOP), and do not repeat any job_id values in a separate distinct-job check.*

**Solution:**

```sql
SELECT TOP (5)
       CONCAT(last_name, ', ', first_name) AS "Employee",
       salary * 12                          AS "Annual Salary"
FROM EMPLOYEES
ORDER BY employee_id;

-- Supporting check: distinct job_ids used by these employees
SELECT DISTINCT job_id AS "Job ID Used"
FROM EMPLOYEES;
```

**Output / Expected behaviour:**

| Employee | Annual Salary |
|---|---|
| King, Steven | 288000.00 |
| Kochhar, Neena | 204000.00 |
| De Haan, Lex | 204000.00 |
| Hunold, Alexander | 108000.00 |
| Ernst, Bruce | 72000.00 |

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Department code report**

Write a query against the DEPARTMENTS table that displays department_id and department_name, aliased as "Dept Code" and "Dept Name". Add a third computed column named "Dept Tag" that concatenates department_id and department_name together, separated by a dash (e.g., "90-Executive").

**Lab Task 2: Commission eligibility list**

Write a query against the EMPLOYEES table that displays last_name, salary, and commission_pct for every employee, then show only the DISTINCT commission_pct values that exist in the table (one column, no duplicates).

**Lab Task 3: Top-paid job families**

Write a query against the JOBS table that displays job_title, min_salary, max_salary, and a computed column named "Salary Range" (max_salary − min_salary). Use TOP to show only the 10 rows with the largest min_salary.
