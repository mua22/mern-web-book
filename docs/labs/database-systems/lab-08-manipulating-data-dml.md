---
title: "Lab 08: Manipulating Data (DML)"
---

# Lab 08: Manipulating Data (DML)

## Objectives:

- Insert new rows using single-row and multi-row INSERT ... VALUES, and using INSERT ... SELECT.
- Update existing rows using UPDATE ... SET ... WHERE, including updates that change more than one column at once.
- Delete rows using DELETE ... WHERE, and understand why omitting the WHERE clause is dangerous.
- Use MERGE to insert or update target rows in a single statement by matching against a source table.

## Activity Outcomes:

- Insert a new employee record, and insert several rows in a single statement.
- Archive job records into JOB_HISTORY using INSERT ... SELECT.
- Give every employee in a department a raise using UPDATE with a multi-column SET.
- Synchronize a staging table of salary adjustments into EMPLOYEES using MERGE.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express Edition)
- SQL Server Management Studio (SSMS)
- HR sample database (EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapter on Modifying Data from "Murach's SQL Server 2019 for Developers", Joel Murach & Mike Murach, covering INSERT, UPDATE, DELETE, and MERGE.

## 1) Useful Concepts

| Statement | Description |
|---|---|
| INSERT INTO table (cols) VALUES (...) | Adds one new row with the listed literal values |
| INSERT INTO table (cols) VALUES (...), (...), (...) | Adds several new rows in a single statement |
| INSERT INTO table (cols) SELECT ... FROM ... | Adds rows copied or computed from the result of a query, instead of typed-in literal values |
| UPDATE table SET col = value, col2 = value2 WHERE condition | Modifies existing rows that match the WHERE condition; several columns can be set in the same statement |
| DELETE FROM table WHERE condition | Removes existing rows that match the WHERE condition |
| **Safety note** | Running UPDATE or DELETE **without a WHERE clause** affects every row in the table. Always run the equivalent SELECT ... WHERE first to preview exactly which rows will be touched, and prefer running changes inside a transaction (BEGIN TRAN ... ROLLBACK/COMMIT) while testing |
| MERGE target USING source ON (match condition) WHEN MATCHED / WHEN NOT MATCHED | A single statement that inserts, updates, or deletes rows in the target table by comparing it against a source table or query -an "upsert" |

**MERGE skeleton:**

```sql
MERGE INTO target_table AS tgt
USING source_table AS src
    ON tgt.key_column = src.key_column
WHEN MATCHED THEN
    UPDATE SET tgt.col = src.col
WHEN NOT MATCHED BY TARGET THEN
    INSERT (col1, col2) VALUES (src.col1, src.col2)
WHEN NOT MATCHED BY SOURCE THEN
    DELETE;
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Medium | CLO-4 |
| Activity 3 | 20 Minutes | Low | CLO-4 |
| Activity 4 | 35 Minutes | High | CLO-4 |

### Activity 1: Inserting new employee rows

*Insert one new employee using a single-row INSERT, then insert two more new employees in a single multi-row INSERT statement.*

**Solution:**

```sql
-- Single-row insert
INSERT INTO EMPLOYEES (employee_id, first_name, last_name, email, hire_date, job_id, salary, department_id)
VALUES (300, 'Sara', 'Malik', 'sara.malik@example.com', '2026-01-15', 'IT_PROG', 6500.00, 60);

-- Multi-row insert
INSERT INTO EMPLOYEES (employee_id, first_name, last_name, email, hire_date, job_id, salary, department_id)
VALUES
    (301, 'Bilal', 'Ahmed', 'bilal.ahmed@example.com', '2026-01-15', 'ST_CLERK', 3200.00, 50),
    (302, 'Hira', 'Sheikh', 'hira.sheikh@example.com', '2026-01-16', 'SA_REP', 7000.00, 80);
```

**Output / Expected behaviour:**

| employee_id | first_name | last_name | job_id | salary | department_id |
|---|---|---|---|---|---|
| 300 | Sara | Malik | IT_PROG | 6500.00 | 60 |
| 301 | Bilal | Ahmed | ST_CLERK | 3200.00 | 50 |
| 302 | Hira | Sheikh | SA_REP | 7000.00 | 80 |

All three rows are visible with SELECT * FROM EMPLOYEES WHERE employee_id IN (300, 301, 302) -the second statement inserted two rows in a single round trip to the server.

### Activity 2: Archiving a job assignment into JOB_HISTORY

*Before an employee's current job assignment changes, archive it into JOB_HISTORY using INSERT ... SELECT, copying their employee_id, current job_id, and department_id, with start_date taken from their hire_date and end_date set to today.*

**Solution:**

```sql
INSERT INTO JOB_HISTORY (employee_id, start_date, end_date, job_id, department_id)
SELECT employee_id, hire_date, GETDATE(), job_id, department_id
FROM EMPLOYEES
WHERE employee_id IN (301, 302);
```

**Output / Expected behaviour:**

| employee_id | start_date | end_date | job_id | department_id |
|---|---|---|---|---|
| 301 | 2026-01-15 | 2026-10-02 | ST_CLERK | 50 |
| 302 | 2026-01-16 | 2026-10-02 | SA_REP | 80 |

INSERT ... SELECT copies as many rows as the SELECT returns in a single statement -useful whenever the new rows already exist, in some form, inside the database, rather than being typed in by hand one at a time.

### Activity 3: Giving a department a raise

*Give every employee in the IT department (department_id = 60) a 10% raise, and at the same time clear their commission_pct to confirm that IT staff are not on a sales commission.*

**Solution:**

```sql
UPDATE EMPLOYEES
SET salary = salary * 1.10,
    commission_pct = NULL
WHERE department_id = 60;
```

**Output / Expected behaviour:**

| employee_id | first_name | salary_before | salary_after |
|---|---|---|---|
| 103 | Alexander | 9000.00 | 9900.00 |
| 104 | Bruce | 6000.00 | 6600.00 |
| 300 | Sara | 6500.00 | 7150.00 |

SSMS reports (3 row(s) affected). Always run SELECT * FROM EMPLOYEES WHERE department_id = 60 first, using the identical WHERE clause, to confirm exactly which rows the UPDATE would touch before running it.

### Activity 4: Syncing a staging table of salary adjustments with MERGE

*The payroll team has loaded a staging table, SALARY_ADJUSTMENTS(employee_id, new_salary), with approved salary changes -some employee_ids already exist in EMPLOYEES (should be updated), and the table also contains a row for an employee_id that does not exist in EMPLOYEES (should be ignored, not inserted as a brand-new employee). Use MERGE to apply the adjustments.*

**Solution:**

```sql
CREATE TABLE SALARY_ADJUSTMENTS (
    employee_id INT PRIMARY KEY,
    new_salary  DECIMAL(10,2)
);

INSERT INTO SALARY_ADJUSTMENTS (employee_id, new_salary)
VALUES (300, 7200.00), (301, 3400.00), (999, 5000.00);

MERGE INTO EMPLOYEES AS tgt
USING SALARY_ADJUSTMENTS AS src
    ON tgt.employee_id = src.employee_id
WHEN MATCHED THEN
    UPDATE SET tgt.salary = src.new_salary;
```

**Output / Expected behaviour:**

| employee_id | salary_before | salary_after |
|---|---|---|
| 300 | 6500.00 | 7200.00 |
| 301 | 3200.00 | 3400.00 |

SSMS reports (2 row(s) affected). Employee_id 999 exists in SALARY_ADJUSTMENTS but has no matching row in EMPLOYEES; because the statement supplies no WHEN NOT MATCHED BY TARGET branch, that source-only row is simply ignored rather than being inserted as a new employee -exactly the behaviour required here. Adding a WHEN NOT MATCHED BY TARGET THEN INSERT branch would instead insert it as a brand-new employee row.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Insert a new department and its first employee**

Insert a new row into DEPARTMENTS for a department named 'Quality Assurance', then insert one new employee into EMPLOYEES assigned to that new department_id.

**Lab Task 2: Bulk update with a safety check**

Write a SELECT ... WHERE query that previews every employee whose job_id = 'SA_REP' and whose salary is below 6000, then write the UPDATE statement -with the identical WHERE clause -that raises each of their salaries to exactly 6000.

**Lab Task 3: MERGE for department reassignment**

Create a staging table DEPARTMENT_MOVES(employee_id, new_department_id), populate it with two or three rows, and write a MERGE statement that updates each matched employee's department_id in EMPLOYEES from the staging table, leaving every other employee untouched.
