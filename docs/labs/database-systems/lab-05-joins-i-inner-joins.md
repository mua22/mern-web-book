---
title: "Lab 05: Joins I — Inner Joins"
---

# Lab 05: Joins I — Inner Joins

## Objectives:

- Understand the purpose of joins in combining related data from multiple tables.
- Write equijoins using the ANSI INNER JOIN ... ON syntax.
- Understand the natural-join concept, and why ANSI JOIN syntax is preferred over the older comma-style join.
- Write theta joins that use a non-equality join condition.
- Combine three or more tables in a single multi-table join query.

## Activity Outcomes:

- Join EMPLOYEES and DEPARTMENTS using an equijoin.
- Join three tables -EMPLOYEES, DEPARTMENTS, and LOCATIONS -in a single query.
- Write a theta join that compares a value against a computed threshold rather than matching it exactly.
- Produce a multi-table report combining employee, job, department, and location data.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express Edition)
- SQL Server Management Studio (SSMS)
- HR sample database (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, JOBS, EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapter on Joins from "Murach's SQL Server 2019 for Developers", Joel Murach & Mike Murach, covering INNER JOIN, equijoins, and multi-table joins.

## 1) Useful Concepts

| Term / Syntax | Description |
|---|---|
| INNER JOIN ... ON | Returns only the rows for which the join condition is true in both tables |
| Equijoin | A join whose condition uses the equality operator (=), usually matching a foreign key to the primary key it references |
| ANSI JOIN syntax | table1 INNER JOIN table2 ON table1.col = table2.col -- the modern, preferred syntax; keeps the join condition separate from filter conditions in WHERE |
| Old comma-style join | FROM table1, table2 WHERE table1.col = table2.col -- legacy syntax; avoid it -forgetting the WHERE condition silently produces a cross join, and it cannot express an OUTER JOIN |
| Natural-join concept | Conceptually, joining two tables on the column(s) that represent the "same" real-world attribute (e.g. department_id). SQL Server has no NATURAL JOIN keyword -ANSI INNER JOIN ... ON is used instead, which also makes the matched columns explicit and self-documenting |
| Theta join | A join whose condition uses a comparison operator other than = (e.g. &gt;, &lt;, BETWEEN, &lt;&gt;) |
| Multi-table join | Chaining several INNER JOIN clauses in one query to combine three or more tables |
| Table alias | A short name given to a table (e.g. AS e) used to shorten and disambiguate column references, especially when the same column name exists in more than one table |

**Basic ANSI equijoin syntax:**

```sql
SELECT columns
FROM table1 AS t1
INNER JOIN table2 AS t2
    ON t1.matching_column = t2.matching_column;
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Low | CLO-4 |
| Activity 3 | 30 Minutes | Medium | CLO-4 |
| Activity 4 | 30 Minutes | Medium | CLO-4 |

### Activity 1: Employees with their department names

*Write a query that lists each employee's first name, last name, and salary, along with the name of the department they work in. Use the ANSI INNER JOIN syntax.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       e.salary,
       d.department_name
FROM EMPLOYEES AS e
INNER JOIN DEPARTMENTS AS d
    ON e.department_id = d.department_id
ORDER BY d.department_name, e.last_name;
```

**Output / Expected behaviour:**

| first_name | last_name | salary | department_name |
|---|---|---|---|
| Lex | De Haan | 17000.00 | Executive |
| Neena | Kochhar | 17000.00 | Executive |
| Nancy | Greenberg | 12000.00 | Finance |
| Bruce | Ernst | 6000.00 | IT |
| Alexander | Hunold | 9000.00 | IT |

Only employees whose department_id matches an existing row in DEPARTMENTS are returned -this is the defining property of an equijoin.

### Activity 2: Three-table join -employee, department, and city

*Extend Activity 1 so that the report also shows the city in which each employee's department is located. This requires joining three tables: EMPLOYEES, DEPARTMENTS, and LOCATIONS.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       d.department_name,
       l.city
FROM EMPLOYEES AS e
INNER JOIN DEPARTMENTS AS d
    ON e.department_id = d.department_id
INNER JOIN LOCATIONS AS l
    ON d.location_id = l.location_id
ORDER BY l.city, e.last_name;
```

**Output / Expected behaviour:**

| first_name | last_name | department_name | city |
|---|---|---|---|
| Nancy | Greenberg | Finance | Seattle |
| Neena | Kochhar | Executive | Seattle |
| Steven | King | Executive | Seattle |
| Alexander | Hunold | IT | Southlake |
| Bruce | Ernst | IT | Southlake |

Each additional INNER JOIN narrows the result further -a row only survives if a match exists at every link of the chain.

### Activity 3: Theta join -employees earning above their department's average

*Write a query that lists employees who earn more than the average salary of their own department. This is a theta join: EMPLOYEES is joined to a derived table of per-department averages using a greater-than (&gt;) condition instead of an equality.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       e.department_id,
       e.salary,
       dept_avg.avg_salary
FROM EMPLOYEES AS e
INNER JOIN (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM EMPLOYEES
    GROUP BY department_id
) AS dept_avg
    ON e.department_id = dept_avg.department_id
    AND e.salary > dept_avg.avg_salary
ORDER BY e.department_id;
```

**Output / Expected behaviour:**

| first_name | last_name | department_id | salary | avg_salary |
|---|---|---|---|---|
| Alexander | Hunold | 60 | 9000.00 | 7500.00 |
| Lex | De Haan | 90 | 17000.00 | 15666.67 |
| John | Chen | 100 | 8200.00 | 7920.00 |

Notice the join still matches department_id with = (so each employee is compared only against their own department's average), but the second part of the ON condition -e.salary > dept_avg.avg_salary -is a theta condition. The derived table dept_avg is itself a subquery; the next lab on subqueries builds on exactly this idea with correlated subqueries.

### Activity 4: Multi-table employee directory report

*Produce a complete directory report showing each employee's name, job title, department, city, and country.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       j.job_title,
       d.department_name,
       l.city,
       c.country_name
FROM EMPLOYEES AS e
INNER JOIN JOBS AS j
    ON e.job_id = j.job_id
INNER JOIN DEPARTMENTS AS d
    ON e.department_id = d.department_id
INNER JOIN LOCATIONS AS l
    ON d.location_id = l.location_id
INNER JOIN COUNTRIES AS c
    ON l.country_id = c.country_id
ORDER BY c.country_name, d.department_name, e.last_name;
```

**Output / Expected behaviour:**

| first_name | last_name | job_title | department_name | city | country_name |
|---|---|---|---|---|---|
| Steven | King | President | Executive | Seattle | United States of America |
| Nancy | Greenberg | Finance Manager | Finance | Seattle | United States of America |
| Alexander | Hunold | Programmer | IT | Southlake | United States of America |

Five tables are now linked by four INNER JOIN clauses -a single unmatched row at any link (e.g. a NULL department_id, or a location with no country_id) would remove that employee from the result, which is exactly the behaviour explored further with OUTER JOINs in the next lab.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Manager lookup report**

Write a query that lists each department's name together with its manager's first and last name, by joining DEPARTMENTS to EMPLOYEES on manager_id = employee_id.

**Lab Task 2: Job-eligible employees**

Write a theta join between EMPLOYEES and JOBS (other than each employee's own job) that lists employees whose current salary falls within the min_salary/max_salary range of a different job, suggesting they could be reassigned to it.

**Lab Task 3: Regional headcount report**

Write a multi-table join across EMPLOYEES, DEPARTMENTS, LOCATIONS, COUNTRIES, and REGIONS that lists, for every employee, their name alongside the region_name they work in.
