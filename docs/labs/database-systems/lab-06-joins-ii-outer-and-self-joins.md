---
title: "Lab 06: Joins II — Outer & Self-Joins"
---

# Lab 06: Joins II — Outer & Self-Joins

## Objectives:

- Understand how LEFT OUTER JOIN, RIGHT OUTER JOIN, and FULL OUTER JOIN differ from INNER JOIN in the rows each one preserves.
- Identify rows that appear in a result set only because of an outer join.
- Write a self-join to relate a table to itself, such as joining EMPLOYEES to itself through manager_id.
- Compare row counts between an INNER JOIN and a LEFT OUTER JOIN on the same two tables.

## Activity Outcomes:

- Use LEFT OUTER JOIN to list every department, including departments with no employees.
- Use RIGHT OUTER JOIN to list every employee, including employees not yet assigned to a department.
- Use FULL OUTER JOIN to combine the unmatched rows from both sides in a single result set.
- Use a self-join on EMPLOYEES to show each employee next to their manager's name, and quantify the effect of an outer join on row counts.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express Edition)
- SQL Server Management Studio (SSMS)
- HR sample database (DEPARTMENTS, EMPLOYEES)

Instructor Note: As pre-lab activity, read the chapter on Joins from "Murach's SQL Server 2019 for Developers", Joel Murach & Mike Murach, covering OUTER JOIN and self-joins.

## 1) Useful Concepts

| Term / Syntax | Description |
|---|---|
| LEFT OUTER JOIN (LEFT JOIN) | Keeps every row of the left (first-named) table. Where no matching row exists in the right table, its columns return NULL |
| RIGHT OUTER JOIN (RIGHT JOIN) | Keeps every row of the right (second-named) table. Where no matching row exists in the left table, its columns return NULL |
| FULL OUTER JOIN | Keeps every row from both tables -matched rows are combined as usual, and unmatched rows from either side appear with NULLs in the other table's columns |
| OUTER keyword | Optional in T-SQL -LEFT JOIN means the same as LEFT OUTER JOIN |
| Self-join | A table joined to itself, using two different aliases, to relate rows within the same table (e.g. an employee row to the row of its own manager) |
| IS NULL after an outer join | The standard way to isolate "only the unmatched rows" -e.g. WHERE d.department_id IS NULL after a RIGHT JOIN finds employees with no department |

**Self-join syntax (employee -> manager):**

```sql
SELECT e.first_name AS employee_first_name,
       m.first_name AS manager_first_name
FROM EMPLOYEES AS e
LEFT JOIN EMPLOYEES AS m
    ON e.manager_id = m.employee_id;
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Low | CLO-4 |
| Activity 3 | 25 Minutes | Medium | CLO-4 |
| Activity 4 | 30 Minutes | Medium | CLO-4 |

### Activity 1: LEFT OUTER JOIN -every department, even empty ones

*List every department's name together with a count of its employees, making sure departments with zero employees still appear in the report.*

**Solution:**

```sql
SELECT d.department_name,
       COUNT(e.employee_id) AS employee_count
FROM DEPARTMENTS AS d
LEFT OUTER JOIN EMPLOYEES AS e
    ON d.department_id = e.department_id
GROUP BY d.department_name
ORDER BY employee_count;
```

**Output / Expected behaviour:**

| department_name | employee_count |
|---|---|
| Public Relations | 0 |
| Treasury | 0 |
| Executive | 3 |
| IT | 5 |
| Finance | 6 |

Public Relations and Treasury have no rows in EMPLOYEES at all; an INNER JOIN would have silently dropped both departments from the report. Because LEFT OUTER JOIN preserves every row of DEPARTMENTS (the left table), they instead appear with employee_count = 0.

### Activity 2: RIGHT OUTER JOIN -every employee, even unassigned ones

*List every employee's name and department name, including any employee who has not yet been assigned to a department.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       d.department_name
FROM DEPARTMENTS AS d
RIGHT OUTER JOIN EMPLOYEES AS e
    ON d.department_id = e.department_id
ORDER BY d.department_name;
```

**Output / Expected behaviour:**

| first_name | last_name | department_name |
|---|---|---|
| Diana | Lopez | NULL |
| Steven | King | Executive |
| Nancy | Greenberg | Finance |
| Alexander | Hunold | IT |

Diana Lopez appears with department_name = NULL because her department_id has not yet been set. EMPLOYEES is the right-hand table here, and RIGHT OUTER JOIN preserves every one of its rows -an INNER JOIN on the same two tables would have excluded her completely.

### Activity 3: FULL OUTER JOIN -unmatched rows from both sides

*Combine Activities 1 and 2 into a single report that shows every department (even empty ones) and every employee (even unassigned ones) in one result set.*

**Solution:**

```sql
SELECT d.department_name,
       e.first_name,
       e.last_name
FROM DEPARTMENTS AS d
FULL OUTER JOIN EMPLOYEES AS e
    ON d.department_id = e.department_id
ORDER BY d.department_name, e.last_name;
```

**Output / Expected behaviour:**

| department_name | first_name | last_name |
|---|---|---|
| NULL | Diana | Lopez |
| Executive | Steven | King |
| Finance | Nancy | Greenberg |
| IT | Alexander | Hunold |
| Public Relations | NULL | NULL |
| Treasury | NULL | NULL |

Two different kinds of unmatched rows now appear in the same result: Public Relations and Treasury (departments with no employees -NULL on the employee side) and Diana Lopez (an employee with no department -NULL on the department side). A FULL OUTER JOIN produces, in one query, what a LEFT and a RIGHT OUTER JOIN would each produce separately.

### Activity 4: Self-join, plus an INNER vs LEFT JOIN row-count comparison

*Part A: List each employee next to their manager's name using a self-join on EMPLOYEES. Part B: Confirm, by comparing row counts, that a LEFT JOIN between DEPARTMENTS and EMPLOYEES returns at least as many rows as the equivalent INNER JOIN.*

**Solution -Part A:**

```sql
SELECT e.first_name + ' ' + e.last_name AS employee_name,
       m.first_name + ' ' + m.last_name AS manager_name
FROM EMPLOYEES AS e
LEFT JOIN EMPLOYEES AS m
    ON e.manager_id = m.employee_id
ORDER BY manager_name;
```

**Output / Expected behaviour:**

| employee_name | manager_name |
|---|---|
| Lex De Haan | Steven King |
| Neena Kochhar | Steven King |
| Alexander Hunold | Lex De Haan |
| Steven King | NULL |

Steven King has manager_name = NULL because he sits at the top of the hierarchy (his own manager_id is NULL). LEFT JOIN is used here -instead of INNER JOIN -specifically so that this employee is not lost from the report.

**Solution -Part B:**

```sql
SELECT 'INNER JOIN' AS join_type, COUNT(*) AS row_count
FROM DEPARTMENTS AS d
INNER JOIN EMPLOYEES AS e ON d.department_id = e.department_id
UNION ALL
SELECT 'LEFT JOIN', COUNT(*)
FROM DEPARTMENTS AS d
LEFT JOIN EMPLOYEES AS e ON d.department_id = e.department_id;
```

**Output / Expected behaviour:**

| join_type | row_count |
|---|---|
| INNER JOIN | 14 |
| LEFT JOIN | 16 |

The LEFT JOIN returns two more rows than the INNER JOIN -one extra row for each of the two departments (Public Relations, Treasury) that have no matching employees, each kept alive with NULL employee columns instead of being dropped.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Job titles with zero current employees**

Write a LEFT JOIN query that lists every job title in JOBS together with the count of employees currently holding it, including job titles with zero current employees.

**Lab Task 2: Full outer comparison of current jobs and job history**

Write a FULL OUTER JOIN between EMPLOYEES and JOB_HISTORY on employee_id that lists every employee's current job_id next to any prior job_id recorded in JOB_HISTORY, including employees with no history rows at all.

**Lab Task 3: Three-level self-join**

Write a self-join that lists every employee, their manager's name, and their manager's manager's name (i.e., join EMPLOYEES to itself twice, using two different aliases).
