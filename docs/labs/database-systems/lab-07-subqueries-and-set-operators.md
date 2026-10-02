---
title: "Lab 07: Subqueries & Set Operators"
---

# Lab 07: Subqueries & Set Operators

## Objectives:

- Write single-row (scalar) subqueries compared with =, &gt;, &lt;, and other single-value operators.
- Write multi-row subqueries using IN, ANY, and ALL.
- Write correlated subqueries, where the inner query references a column from the current row of the outer query.
- Combine the result sets of two queries using UNION, UNION ALL, INTERSECT, and EXCEPT.

## Activity Outcomes:

- Use a scalar subquery to compare each row against a single computed value, such as a company-wide average.
- Use IN / ANY / ALL to compare a column against a list of values returned by a subquery.
- Use a correlated subquery to compare each row against a value computed specifically for that row's own group.
- Combine two result sets with UNION / UNION ALL and observe the effect on duplicate rows; use INTERSECT and EXCEPT to find common and exclusive rows.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express Edition)
- SQL Server Management Studio (SSMS)
- HR sample database (EMPLOYEES, DEPARTMENTS, JOBS, LOCATIONS, COUNTRIES)

Instructor Note: As pre-lab activity, read the chapter on Subqueries from "Murach's SQL Server 2019 for Developers", Joel Murach & Mike Murach, covering single-row, multi-row, and correlated subqueries.

## 1) Useful Concepts

| Term / Syntax | Description |
|---|---|
| Single-row (scalar) subquery | A subquery guaranteed to return exactly one value; may be compared with =, &gt;, &lt;, &gt;=, &lt;=, &lt;&gt; |
| Multi-row subquery | A subquery that can return more than one value; must be used with IN, ANY, or ALL (not with a bare = or &gt;) |
| IN | True if the outer value equals any one value in the subquery's result list |
| ANY (or SOME) | True if the comparison is true for at least one value returned by the subquery -e.g. &gt; ANY (...) means greater than the smallest value returned |
| ALL | True if the comparison is true for every value returned by the subquery -e.g. &gt; ALL (...) means greater than the largest value returned |
| Correlated subquery | A subquery that references a column from the outer query; conceptually re-evaluated once per outer row, using that row's own values |
| UNION | Combines two result sets and removes duplicate rows (requires comparing all rows -more expensive) |
| UNION ALL | Combines two result sets and keeps all rows, including duplicates (cheaper -no duplicate check) |
| INTERSECT | Returns only the rows that appear in both result sets |
| EXCEPT | Returns rows from the first result set that do not appear in the second (T-SQL uses EXCEPT; Oracle's equivalent keyword is MINUS) |

**Rule of thumb:** if a subquery might return more than one row, it cannot be compared directly with = or &gt; -use IN, ANY, or ALL instead, or aggregate it down to a single value.

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Medium | CLO-4 |
| Activity 3 | 30 Minutes | Medium | CLO-4 |
| Activity 4 | 30 Minutes | Medium | CLO-4 |

### Activity 1: Scalar subquery -employees earning above the company average

*List the employees who earn more than the average salary across the entire company.*

**Solution:**

```sql
SELECT first_name, last_name, salary
FROM EMPLOYEES
WHERE salary > (SELECT AVG(salary) FROM EMPLOYEES)
ORDER BY salary DESC;
```

**Output / Expected behaviour:**

| first_name | last_name | salary |
|---|---|---|
| Steven | King | 24000.00 |
| Lex | De Haan | 17000.00 |
| Neena | Kochhar | 17000.00 |
| Alexander | Hunold | 9000.00 |

The inner query, (SELECT AVG(salary) FROM EMPLOYEES), always returns exactly one number, so it can be compared directly with the &gt; operator.

### Activity 2: Multi-row subquery -employees in departments located in a given country

*List the employees who work in a department located in the United States of America, using a multi-row subquery with IN rather than a join.*

**Solution:**

```sql
SELECT first_name, last_name, department_id
FROM EMPLOYEES
WHERE department_id IN (
    SELECT d.department_id
    FROM DEPARTMENTS AS d
    INNER JOIN LOCATIONS AS l ON d.location_id = l.location_id
    INNER JOIN COUNTRIES AS c ON l.country_id = c.country_id
    WHERE c.country_name = 'United States of America'
)
ORDER BY department_id;
```

**Output / Expected behaviour:**

| first_name | last_name | department_id |
|---|---|---|
| Steven | King | 10 |
| Alexander | Hunold | 60 |
| Nancy | Greenberg | 100 |

The inner query can return many department_id values, so IN is required; writing = (...) instead would raise an error ("Subquery returned more than 1 value") as soon as more than one department qualifies.

**ANY / ALL variant:** the same style of comparison can also use ANY or ALL instead of IN:

```sql
SELECT first_name, last_name, salary
FROM EMPLOYEES
WHERE salary > ALL (
    SELECT max_salary FROM JOBS WHERE job_id IN ('SA_REP', 'ST_CLERK')
);
```

This returns employees who earn more than the highest max_salary of either job -ALL requires beating every value returned (the largest one), whereas ANY would only require beating the smallest.

### Activity 3: Correlated subquery -employees earning more than their own department's average

*List employees who earn more than the average salary of their own department -this time using a correlated subquery instead of the derived-table theta join used in Lab 05.*

**Solution:**

```sql
SELECT e.first_name,
       e.last_name,
       e.department_id,
       e.salary
FROM EMPLOYEES AS e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM EMPLOYEES AS e2
    WHERE e2.department_id = e.department_id
)
ORDER BY e.department_id;
```

**Output / Expected behaviour:**

| first_name | last_name | department_id | salary |
|---|---|---|---|
| Alexander | Hunold | 60 | 9000.00 |
| Lex | De Haan | 90 | 17000.00 |
| John | Chen | 100 | 8200.00 |

Unlike Activity 1, the inner query here has no single fixed answer: the condition e2.department_id = e.department_id ties it to the outer query's current row, so the average is recalculated separately for every employee's own department. This is what "correlated" means -the inner query cannot be run on its own without a value supplied by the outer row.

### Activity 4: UNION, UNION ALL, INTERSECT, and EXCEPT

*Build a report of "employees worth reviewing": those hired before January 1, 2020, combined with those who currently earn a sales commission. Then show the difference between UNION and UNION ALL, and use INTERSECT/EXCEPT to compare the two lists directly.*

**Solution:**

```sql
-- UNION: combined list, duplicates removed (an employee satisfying BOTH filters appears once)
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE hire_date < '2020-01-01'
UNION
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE commission_pct IS NOT NULL;

-- UNION ALL: same two lists, duplicates kept (that same employee now appears twice)
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE hire_date < '2020-01-01'
UNION ALL
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE commission_pct IS NOT NULL;

-- INTERSECT: only employees satisfying BOTH conditions
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE hire_date < '2020-01-01'
INTERSECT
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE commission_pct IS NOT NULL;

-- EXCEPT: hired before 2020, but NOT currently earning commission
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE hire_date < '2020-01-01'
EXCEPT
SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE commission_pct IS NOT NULL;
```

**Output / Expected behaviour:**

UNION (8 distinct rows -employee 174 satisfies both filters but is counted only once):

| employee_id | first_name | last_name |
|---|---|---|
| 101 | Neena | Kochhar |
| 102 | Lex | De Haan |
| 174 | Ellen | Abel |

UNION ALL returns 9 rows for the same two queries, because employee 174 is now listed twice -once from each SELECT. INTERSECT returns a single row (employee 174 -the only employee satisfying both conditions at once), and EXCEPT returns everyone hired before 2020 *except* employee 174.

UNION silently removes the duplicate row for employee 174; UNION ALL keeps both copies, which is both cheaper to compute and necessary whenever you need to count occurrences rather than distinct members.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Top earner per job using a correlated subquery**

Write a query that lists employees whose salary equals the maximum salary paid for their own job_id, using a correlated subquery (hint: compare e.salary to (SELECT MAX(salary) FROM EMPLOYEES AS e2 WHERE e2.job_id = e.job_id)).

**Lab Task 2: Departments with no commissioned employees**

Using ALL or NOT IN, write a query that lists departments in which no employee earns a sales commission (commission_pct IS NULL for every employee in that department).

**Lab Task 3: UNION-based combined roster**

Write a query that returns a single roster of employee names combining (a) employees managed by a specific manager_id, and (b) employees belonging to the IT department, using UNION. Then re-run it with UNION ALL and add a one-line comment explaining why the row counts differ, or do not differ, for your data.
