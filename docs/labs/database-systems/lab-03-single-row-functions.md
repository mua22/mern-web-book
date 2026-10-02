---
title: "Lab 03: Single-Row Functions"
---

# Lab 03: Single-Row Functions

## Objectives:

- Use character (string) functions to transform and extract text data.
- Use number functions to round, truncate, and manipulate numeric values.
- Use date functions to compute intervals and shift dates.
- Use conversion functions to change a value's data type.
- Use general functions (`CASE`, `ISNULL`/`COALESCE`) to handle conditional logic and NULL values.

## Activity Outcomes:

- Reformat and clean up text columns using character functions.
- Perform numeric calculations using number functions.
- Compute durations and shifted dates using date functions.
- Convert values between data types explicitly.
- Build conditional, NULL-safe expressions in a SELECT list.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS) 18 or later
- The HR sample database, restored and attached to the local SQL Server instance

Instructor Note: As pre-lab activity, read the chapter on "Single-Row Functions" (character, number, date, and conversion functions) from James R. Groff and Paul N. Weinberg's "SQL: The Complete Reference".

## 1) Useful Concepts

**Character functions:**

| Function | Description |
|---|---|
| `UPPER(str)` / `LOWER(str)` | Converts a string to upper-case / lower-case |
| `LTRIM(str)` / `RTRIM(str)` / `TRIM(str)` | Removes leading / trailing / both whitespace |
| `SUBSTRING(str, start, length)` | Extracts a substring starting at position `start` for `length` characters |
| `LEN(str)` | Returns the number of characters in a string |
| `REPLACE(str, old, new)` | Replaces every occurrence of `old` with `new` |
| `CONCAT(str1, str2, ...)` | Concatenates strings, treating `NULL` as an empty string |

**Number functions:**

| Function | Description |
|---|---|
| `ROUND(num, decimals)` | Rounds a number to the given number of decimal places |
| `CEILING(num)` | Rounds up to the nearest integer |
| `FLOOR(num)` | Rounds down to the nearest integer (T-SQL equivalent of `TRUNC` for whole numbers) |
| `ABS(num)` | Returns the absolute (non-negative) value |
| `num % divisor` | Modulo operator — the remainder after integer division (T-SQL has no `MOD()` function) |

**Date functions:**

| Function | Description |
|---|---|
| `GETDATE()` | Returns the current server date and time |
| `DATEDIFF(unit, start, end)` | Returns the difference between two dates, in the given unit (e.g. `YEAR`, `MONTH`, `DAY`) |
| `DATEADD(unit, number, date)` | Adds (or subtracts, with a negative number) an interval to a date |
| `FORMAT(date, 'format')` | Formats a date (or number) as a string using a .NET-style format string, e.g. `'yyyy-MM-dd'` |

**Conversion functions:**

| Function | Description |
|---|---|
| `CAST(expr AS type)` | Converts `expr` to the given data type (ANSI-standard syntax) |
| `CONVERT(type, expr [, style])` | Converts `expr` to the given data type; the optional `style` controls date/number formatting (T-SQL specific) |

**General functions:**

| Function | Description |
|---|---|
| `CASE WHEN cond1 THEN val1 WHEN cond2 THEN val2 ELSE val3 END` | Conditional expression, evaluated top to bottom |
| `ISNULL(expr, replacement)` | Returns `replacement` if `expr` is `NULL`, otherwise `expr` (T-SQL specific, 2 arguments only) |
| `COALESCE(expr1, expr2, ...)` | Returns the first non-`NULL` expression in the list (ANSI-standard, any number of arguments) |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 10 Minutes | Low | CLO-1 |
| Activity 2 | 15 Minutes | Medium | CLO-1 |
| Activity 3 | 20 Minutes | Medium | CLO-1 |
| Activity 4 | 20 Minutes | Medium | CLO-1 |

### Activity 1: Formatting employee names

*Display each employee's last_name in all upper-case, first_name in all lower-case, and a column showing the length of last_name.*

**Solution:**

```sql
SELECT UPPER(last_name)  AS "Last Name (Upper)",
       LOWER(first_name) AS "First Name (Lower)",
       LEN(last_name)    AS "Last Name Length"
FROM EMPLOYEES;
```

**Output / Expected behaviour:**

| Last Name (Upper) | First Name (Lower) | Last Name Length |
|---|---|---|
| KING | steven | 4 |
| KOCHHAR | neena | 7 |
| HUNOLD | alexander | 6 |
| ERNST | bruce | 5 |

### Activity 2: Computing years of service

*Display last_name, hire_date, and a computed column "Years of Service" showing how many full years each employee has worked, based on hire_date and the current date.*

**Solution:**

```sql
SELECT last_name,
       hire_date,
       DATEDIFF(YEAR, hire_date, GETDATE()) AS "Years of Service"
FROM EMPLOYEES
ORDER BY "Years of Service" DESC;
```

**Output / Expected behaviour:**

| last_name | hire_date | Years of Service |
|---|---|---|
| King | 2013-06-17 | 13 |
| De Haan | 2016-01-13 | 10 |
| Hunold | 2016-01-03 | 10 |
| Ernst | 2017-05-21 | 9 |

*(Years of Service values are computed relative to the date the query is run, so your results will differ from the sample above.)*

### Activity 3: Salary-grade classification with CASE

*Display last_name, salary, and a computed column "Salary Grade" that classifies each employee as 'A' if salary >= 15000, 'B' if salary >= 8000, 'C' if salary >= 4000, and 'D' otherwise.*

**Solution:**

```sql
SELECT last_name,
       salary,
       CASE
            WHEN salary >= 15000 THEN 'A'
            WHEN salary >= 8000  THEN 'B'
            WHEN salary >= 4000  THEN 'C'
            ELSE 'D'
       END AS "Salary Grade"
FROM EMPLOYEES
ORDER BY salary DESC;
```

**Output / Expected behaviour:**

| last_name | salary | Salary Grade |
|---|---|---|
| King | 24000.00 | A |
| Kochhar | 17000.00 | A |
| Hunold | 9000.00 | B |
| Ernst | 6000.00 | C |
| Lorentz | 4200.00 | C |

### Activity 4: Handling NULL commission with ISNULL, rounding, and date formatting

*Display last_name, salary, commission_pct, a computed column "Effective Commission" that substitutes 0 for employees with no commission, a computed column "Commission Amount" (salary × effective commission, rounded to 2 decimal places), and hire_date formatted as 'dd-MMM-yyyy'.*

**Solution:**

```sql
SELECT last_name,
       salary,
       commission_pct,
       ISNULL(commission_pct, 0)                              AS "Effective Commission",
       ROUND(salary * ISNULL(commission_pct, 0), 2)           AS "Commission Amount",
       FORMAT(hire_date, 'dd-MMM-yyyy')                        AS "Hire Date"
FROM EMPLOYEES
ORDER BY "Commission Amount" DESC;
```

**Output / Expected behaviour:**

| last_name | salary | commission_pct | Effective Commission | Commission Amount | Hire Date |
|---|---|---|---|---|---|
| Russell | 14000.00 | 0.40 | 0.40 | 5600.00 | 01-Oct-2014 |
| Partners | 10000.00 | 0.30 | 0.30 | 3000.00 | 05-Jan-2015 |
| King | 24000.00 | NULL | 0.00 | 0.00 | 17-Jun-2013 |
| Ernst | 6000.00 | NULL | 0.00 | 0.00 | 21-May-2017 |

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Masked email directory**

Write a query against EMPLOYEES that displays last_name and a computed column "Masked Email" that replaces every occurrence of "@hr.com" in the email column with "@company.internal", using REPLACE.

**Lab Task 2: Days until next anniversary**

Write a query against EMPLOYEES that displays last_name, hire_date, and a computed column "Days To Next Review" showing the number of days between today's date and the date exactly 6 months (use DATEADD) after each employee's most recent hire-date anniversary.

**Lab Task 3: Rounded bonus eligibility report**

Write a query against EMPLOYEES that displays last_name, salary, and a computed column "Bonus" using CASE: employees with salary > 10000 get a bonus of salary * 0.05 (rounded to the nearest whole number using ROUND), employees with salary BETWEEN 5000 AND 10000 get salary * 0.03 (rounded), and everyone else gets 0. Use COALESCE instead of ISNULL anywhere commission_pct is involved in a tie-break ORDER BY.
