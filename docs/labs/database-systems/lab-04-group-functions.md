---
title: "Lab 04: Group Functions"
---

# Lab 04: Group Functions

## Objectives:

- Use aggregate (group) functions `AVG`, `SUM`, `COUNT`, `MIN`, and `MAX` to summarize data across rows.
- Group rows into subsets using `GROUP BY` and compute an aggregate per group.
- Filter groups using `HAVING`, and understand how it differs from `WHERE`.
- Produce subtotal and grand-total reports using SQL Server's `ROLLUP` and `CUBE` extensions.
- Build a single comma-separated summary string per group using `STRING_AGG`.

## Activity Outcomes:

- Compute summary statistics over an entire table or over groups of rows.
- Correctly choose between `WHERE` (row filter) and `HAVING` (group filter).
- Produce a grouped report with subtotals using `ROLLUP`.
- Aggregate text values from multiple rows into a single delimited string per group.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS) 18 or later
- The HR sample database, restored and attached to the local SQL Server instance

Instructor Note: As pre-lab activity, read the chapter on "Group Functions and the GROUP BY / HAVING Clauses" from Bryan Syverson and Joel Murach's "Murach's SQL Server for Developers".

## 1) Useful Concepts

| Function / Clause | Description |
|---|---|
| `AVG(col)` | Returns the average of a numeric column, ignoring `NULL` values |
| `SUM(col)` | Returns the total of a numeric column, ignoring `NULL` values |
| `COUNT(*)` | Returns the number of rows in a group (or table) |
| `COUNT(col)` | Returns the number of non-`NULL` values in `col` |
| `COUNT(DISTINCT col)` | Returns the number of distinct non-`NULL` values in `col` |
| `MIN(col)` / `MAX(col)` | Returns the smallest / largest value in `col` |
| `GROUP BY col1, col2` | Groups rows that share the same values in the listed columns; every non-aggregated column in the SELECT list must appear in GROUP BY |
| `HAVING condition` | Filters out *groups* after aggregation, based on a condition involving an aggregate function |
| `WHERE` vs `HAVING` | `WHERE` filters individual **rows** before grouping/aggregation happens and cannot reference an aggregate function; `HAVING` filters **groups** after aggregation and is the only place an aggregate function can appear in a filter condition |
| `GROUP BY col WITH ROLLUP` | Adds subtotal rows for each group plus one grand-total row, in hierarchical order |
| `GROUP BY col1, col2 WITH CUBE` | Adds subtotal rows for every possible combination of the grouping columns, plus a grand total |
| `STRING_AGG(col, separator)` | Concatenates the (non-`NULL`) values of `col` across a group into one delimited string (SQL Server 2017+) |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 10 Minutes | Low | CLO-1 |
| Activity 2 | 15 Minutes | Medium | CLO-1 |
| Activity 3 | 25 Minutes | High | CLO-1 |
| Activity 4 | 20 Minutes | Medium | CLO-1 |

### Activity 1: Simple aggregate summary

*Display the total number of employees, the average salary, the minimum salary, and the maximum salary across the entire EMPLOYEES table.*

**Solution:**

```sql
SELECT COUNT(*)      AS "Employee Count",
       AVG(salary)    AS "Average Salary",
       MIN(salary)    AS "Minimum Salary",
       MAX(salary)    AS "Maximum Salary"
FROM EMPLOYEES;
```

**Output / Expected behaviour:**

| Employee Count | Average Salary | Minimum Salary | Maximum Salary |
|---|---|---|---|
| 42 | 8456.33 | 2500.00 | 24000.00 |

### Activity 2: GROUP BY with HAVING

*Display department_id, the number of employees in that department, and the average salary per department, but only for departments with more than 3 employees. Order the result by average salary descending.*

**Solution:**

```sql
SELECT department_id          AS "Department",
       COUNT(*)               AS "Employee Count",
       AVG(salary)            AS "Average Salary"
FROM EMPLOYEES
GROUP BY department_id
HAVING COUNT(*) > 3
ORDER BY "Average Salary" DESC;
```

**Output / Expected behaviour:**

| Department | Employee Count | Average Salary |
|---|---|---|
| 90 | 4 | 15750.00 |
| 60 | 5 | 7200.00 |
| 50 | 12 | 3475.50 |

*Note how this differs from using `WHERE COUNT(*) > 3`, which is illegal — `WHERE` cannot reference an aggregate because it runs before grouping; `HAVING` runs after aggregation and is the correct clause here.*

### Activity 3: ROLLUP subtotal report

*Produce a report that shows, for each department_id and job_id combination, the total salary paid (SUM), plus a subtotal row per department and a grand-total row for the whole company.*

**Solution:**

```sql
SELECT department_id              AS "Department",
       job_id                     AS "Job",
       SUM(salary)                AS "Total Salary"
FROM EMPLOYEES
GROUP BY department_id, job_id
WITH ROLLUP
ORDER BY department_id, job_id;
```

**Output / Expected behaviour:**

| Department | Job | Total Salary |
|---|---|---|
| 60 | IT_PROG | 28800.00 |
| 60 | NULL | 28800.00 |
| 90 | AD_PRES | 24000.00 |
| 90 | AD_VP | 34000.00 |
| 90 | NULL | 58000.00 |
| NULL | NULL | 355167.86 |

*The rows where `Job` is `NULL` are the per-department subtotal rows produced by `ROLLUP`; the single row where both `Department` and `Job` are `NULL` is the grand total for the entire company.*

### Activity 4: STRING_AGG — employee roster per department

*Produce a single row per department showing department_id and one column named "Employee Roster" containing every employee's last name in that department, comma-separated, in alphabetical order.*

**Solution:**

```sql
SELECT department_id AS "Department",
       STRING_AGG(last_name, ', ') WITHIN GROUP (ORDER BY last_name) AS "Employee Roster"
FROM EMPLOYEES
GROUP BY department_id
ORDER BY department_id;
```

**Output / Expected behaviour:**

| Department | Employee Roster |
|---|---|
| 60 | Austin, Ernst, Hunold, Lorentz, Pataballa |
| 90 | De Haan, King, Kochhar |
| 100 | Faviet, Greenberg, Popp, Urman |

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Job-wise salary summary**

Write a query against EMPLOYEES that displays job_id, COUNT(*) of employees holding that job, and SUM(salary), MIN(salary), and MAX(salary) for each job_id. Group by job_id and order by SUM(salary) descending.

**Lab Task 2: High-cost departments only**

Write a query against EMPLOYEES that displays department_id and the total salary bill (SUM) per department, filtering with WHERE to exclude any employee hired before '2015-01-01' from the calculation, and then using HAVING to show only departments whose total salary bill (after the WHERE filter) exceeds 20000. Explain, as a comment in your script, why the date filter must go in WHERE and not HAVING.

**Lab Task 3: Department and job CUBE report with a comma-separated name list**

Write a query against EMPLOYEES that groups by department_id and job_id using WITH CUBE, showing COUNT(*) and AVG(salary) for every combination (including the all-department and all-job subtotal rows). As a second, separate query, use STRING_AGG to produce one row per job_id listing every distinct department_id (CAST to VARCHAR) that has an employee in that job, comma-separated.
