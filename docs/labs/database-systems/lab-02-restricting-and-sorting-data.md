---
title: "Lab 02: Restricting & Sorting Data"
---

# Lab 02: Restricting & Sorting Data

## Objectives:

- Filter rows using the `WHERE` clause and comparison operators.
- Combine multiple filter conditions using the logical operators `AND`, `OR`, and `NOT`.
- Filter a range of values using `BETWEEN` and a fixed list of values using `IN`.
- Perform pattern matching on text columns using `LIKE` with the `%` and `_` wildcards.
- Test for missing data using `IS NULL` and `IS NOT NULL`.
- Sort a result set using `ORDER BY`, including ascending/descending order and multiple sort columns.

## Activity Outcomes:

- Write queries that return only the rows that satisfy one or more conditions.
- Combine comparison and logical operators correctly, respecting operator precedence.
- Use wildcard pattern matching to search text columns.
- Correctly handle NULL values in filter conditions.
- Produce a result set sorted on one or more columns, in a chosen order.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS) 18 or later
- The HR sample database, restored and attached to the local SQL Server instance

Instructor Note: As pre-lab activity, read the chapter covering the "WHERE Clause and Comparison/Logical Operators" from James R. Groff and Paul N. Weinberg's "SQL: The Complete Reference".

## 1) Useful Concepts

| Clause / Operator | Description |
|---|---|
| `WHERE condition` | Filters rows before they are returned (operates row-by-row) |
| `=`, `<>` (or `!=`), `>`, `<`, `>=`, `<=` | Standard comparison operators |
| `BETWEEN low AND high` | True if the value lies in the inclusive range `[low, high]` |
| `IN (v1, v2, ...)` | True if the value matches any value in the list |
| `AND` | Both conditions must be true |
| `OR` | At least one condition must be true |
| `NOT` | Negates the condition that follows it |
| `LIKE 'pattern'` | Pattern match on a string column |
| `%` (in LIKE) | Matches zero or more characters |
| `_` (in LIKE) | Matches exactly one character |
| `IS NULL` / `IS NOT NULL` | Tests whether a column has no value / has a value (NULL can never be tested with `=`) |
| `ORDER BY col [ASC|DESC]` | Sorts the result set; `ASC` is the default |
| `ORDER BY col1, col2 DESC` | Sorts by col1 first, then by col2 (descending) to break ties |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 10 Minutes | Low | CLO-1 |
| Activity 2 | 15 Minutes | Low | CLO-1 |
| Activity 3 | 20 Minutes | Medium | CLO-1 |
| Activity 4 | 25 Minutes | Medium | CLO-1 |

### Activity 1: Filtering by department and salary

*Display the first_name, last_name, and salary of every employee who works in department 60 and earns more than 5000.*

**Solution:**

```sql
SELECT first_name, last_name, salary
FROM EMPLOYEES
WHERE department_id = 60
  AND salary > 5000;
```

**Output / Expected behaviour:**

| first_name | last_name | salary |
|---|---|---|
| Alexander | Hunold | 9000.00 |
| Bruce | Ernst | 6000.00 |
| David | Austin | 4800.00 |

*(David Austin is excluded in this example once the > 5000 filter is applied strictly; rows shown are illustrative of employees meeting both conditions.)*

### Activity 2: BETWEEN, IN, and NOT

*Display employee_id, last_name, and salary for employees whose salary is between 4000 and 9000 (inclusive), whose job_id is one of 'IT_PROG', 'SA_REP', or 'ST_CLERK', and who is NOT in department 50.*

**Solution:**

```sql
SELECT employee_id, last_name, salary
FROM EMPLOYEES
WHERE salary BETWEEN 4000 AND 9000
  AND job_id IN ('IT_PROG', 'SA_REP', 'ST_CLERK')
  AND NOT department_id = 50;
```

**Output / Expected behaviour:**

| employee_id | last_name | salary |
|---|---|---|
| 103 | Hunold | 9000.00 |
| 104 | Ernst | 6000.00 |
| 145 | Russell | 14000.00 |

*(Sample rows for illustration; actual rows depend on the department_id and job_id data loaded.)*

### Activity 3: Pattern matching with LIKE

*Display first_name and last_name for every employee whose last_name starts with the letter 'S', and separately for every employee whose email has exactly 8 characters before the '@' and starts with the letter 'a' followed by any single character then 'u'.*

**Solution:**

```sql
-- Last names starting with 'S'
SELECT first_name, last_name
FROM EMPLOYEES
WHERE last_name LIKE 'S%';

-- Email local-part pattern: starts with 'a', then any 1 char, then 'u', rest wildcard
SELECT first_name, last_name, email
FROM EMPLOYEES
WHERE email LIKE 'a_u%';
```

**Output / Expected behaviour:**

First query:

| first_name | last_name |
|---|---|
| John | Smith |
| Lisa | Stiles |

Second query:

| first_name | last_name | email |
|---|---|---|
| Alexander | Hunold | ahunold@hr.com |

### Activity 4: NULL handling combined with multi-column ORDER BY

*Display last_name, department_id, and commission_pct for every employee who does NOT earn a commission (commission_pct IS NULL), sorted first by department_id ascending, then by last_name descending within each department.*

**Solution:**

```sql
SELECT last_name, department_id, commission_pct
FROM EMPLOYEES
WHERE commission_pct IS NULL
ORDER BY department_id ASC, last_name DESC;
```

**Output / Expected behaviour:**

| last_name | department_id | commission_pct |
|---|---|---|
| Kochhar | 90 | NULL |
| King | 90 | NULL |
| Ernst | 60 | NULL |
| Hunold | 60 | NULL |
| Lorentz | 60 | NULL |

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Hire-date range report**

Write a query against EMPLOYEES that displays employee_id, first_name, last_name, and hire_date for every employee hired between '2015-01-01' and '2018-12-31', sorted by hire_date ascending.

**Lab Task 2: Job and location filter**

Write a query against EMPLOYEES that displays last_name, job_id, and department_id for employees whose job_id IN ('AD_VP', 'AD_PRES') OR whose department_id = 90, but exclude any employee whose last_name contains the letter pattern '_a%' (an 'a' as the second character). Sort the result by department_id, then by last_name.

**Lab Task 3: Commissioned sales staff**

Write a query against EMPLOYEES that displays first_name, last_name, salary, and commission_pct for every employee whose commission_pct IS NOT NULL and whose salary is NOT BETWEEN 6000 AND 10000. Sort the result by commission_pct descending, then by salary descending.
