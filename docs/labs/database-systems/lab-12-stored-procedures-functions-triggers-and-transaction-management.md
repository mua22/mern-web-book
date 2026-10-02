---
title: "Lab 12: Stored Procedures, Functions, Triggers & Transaction Management"
---

# Lab 12: Stored Procedures, Functions, Triggers & Transaction Management

## Objectives:

- Create and execute parameterised stored procedures with `CREATE PROCEDURE`.
- Create scalar and table-valued functions with `CREATE FUNCTION`.
- Create triggers with `CREATE TRIGGER` to automate auditing tasks.
- Understand basic concurrency-control concepts: locking and transaction isolation levels.
- Understand the purpose of database backup and recovery (`BACKUP DATABASE` / `RESTORE DATABASE`).

## Activity Outcomes:

- Write a stored procedure that accepts a parameter and returns filtered results.
- Write a scalar function that performs a calculation on a single row.
- Write an `AFTER INSERT` trigger that logs changes to an audit table.
- Explain, at a conceptual level, isolation levels and database backups.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS)
- The HR sample database (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, JOBS, EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapters on "Stored Procedures, Functions and Triggers" and "Concurrency Control and Backup/Recovery" from the course's SQL Server reference text. This is a broad survey lab -focus on recognising the syntax and purpose of each object rather than deep mastery of every option.

## 1) Useful Concepts

| Object / Statement | Description |
|---|---|
| `CREATE PROCEDURE proc_name @param type AS BEGIN ... END` | Defines a reusable, callable block of T-SQL that can accept parameters |
| `EXEC proc_name @param = value` | Executes a stored procedure |
| `CREATE FUNCTION func_name (@param type) RETURNS type AS BEGIN ... RETURN ... END` | Defines a scalar function returning a single value |
| `CREATE FUNCTION func_name (...) RETURNS TABLE AS RETURN (SELECT ...)` | Defines an inline table-valued function returning a result set |
| `CREATE TRIGGER trg_name ON table AFTER INSERT, UPDATE, DELETE AS BEGIN ... END` | Defines code that runs automatically after a DML event on a table |
| `inserted` / `deleted` | Special trigger tables holding the new / old row images affected by the triggering statement |
| Lock | A mechanism that temporarily restricts access to data to prevent conflicting concurrent changes |
| `READ COMMITTED` | Default SQL Server isolation level; a transaction only sees data that has been committed by other transactions |
| `SERIALIZABLE` | Strictest isolation level; transactions behave as if executed one at a time, preventing phantom reads |
| `BACKUP DATABASE db_name TO DISK = 'path'` | Creates a full backup of the database to a file |
| `BACKUP DATABASE db_name TO DISK = 'path' WITH DIFFERENTIAL` | Creates a differential backup -only changes since the last full backup |
| `RESTORE DATABASE db_name FROM DISK = 'path'` | Restores a database from a backup file |

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Medium | CLO-3 |
| Activity 2 | 15 Minutes | Medium | CLO-3 |
| Activity 3 | 20 Minutes | Medium | CLO-3 |
| Activity 4 | 10 Minutes | Low | CLO-3 |

### Activity 1: A stored procedure to list employees by department

*HR frequently needs to list all employees in a given department. Write a stored procedure GetEmployeesByDepartment that accepts a `department_id` parameter and returns the matching employees.*

**Solution:**

```sql
CREATE PROCEDURE GetEmployeesByDepartment
    @department_id INT
AS
BEGIN
    SELECT employee_id, first_name, last_name, job_id, salary
    FROM EMPLOYEES
    WHERE department_id = @department_id
    ORDER BY last_name;
END;
GO

-- Execution:
EXEC GetEmployeesByDepartment @department_id = 60;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

| employee_id | first_name | last_name | job_id    | salary |
|-------------|------------|-----------|-----------|--------|
| 104         | Bruce      | Ernst     | IT_PROG   | 6000   |
| 103         | Alexander  | Hunold    | IT_PROG   | 9000   |
```

### Activity 2: A scalar function to compute years of service

*Reports need each employee's years of service calculated consistently. Write a scalar function GetYearsOfService that accepts a `hire_date` and returns the number of full years between that date and today.*

**Solution:**

```sql
CREATE FUNCTION GetYearsOfService (@hire_date DATE)
RETURNS INT
AS
BEGIN
    RETURN DATEDIFF(YEAR, @hire_date, GETDATE())
           - CASE
                WHEN DATEADD(YEAR, DATEDIFF(YEAR, @hire_date, GETDATE()), @hire_date) > GETDATE()
                THEN 1 ELSE 0
             END;
END;
GO

-- Usage:
SELECT employee_id, first_name, last_name, hire_date,
       dbo.GetYearsOfService(hire_date) AS years_of_service
FROM EMPLOYEES
WHERE department_id = 60;
```

**Output / Expected behaviour:**

```text
| employee_id | first_name | last_name | hire_date  | years_of_service |
|-------------|------------|-----------|------------|-------------------|
| 103         | Alexander  | Hunold    | 2016-01-13 | 9                 |
| 104         | Bruce      | Ernst     | 2017-05-21 | 8                 |
```

### Activity 3: An AFTER INSERT trigger for new-hire auditing

*Management wants every new employee insertion logged automatically to an audit table. Create an audit table EMPLOYEE_AUDIT and an `AFTER INSERT` trigger on EMPLOYEES that logs the new employee's id and the timestamp of insertion.*

**Solution:**

```sql
CREATE TABLE EMPLOYEE_AUDIT (
    audit_id     INT IDENTITY(1,1) PRIMARY KEY,
    employee_id  INT NOT NULL,
    action       VARCHAR(20) NOT NULL,
    action_time  DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TRIGGER trg_employees_after_insert
ON EMPLOYEES
AFTER INSERT
AS
BEGIN
    INSERT INTO EMPLOYEE_AUDIT (employee_id, action, action_time)
    SELECT employee_id, 'INSERT', GETDATE()
    FROM inserted;
END;
GO

-- Test:
INSERT INTO EMPLOYEES (employee_id, first_name, last_name, email, hire_date, job_id, salary, department_id)
VALUES (300, 'Sana', 'Riaz', 'SRIAZ', GETDATE(), 'IT_PROG', 5500, 60);
```

**Output / Expected behaviour:**

```text
(1 row(s) affected)   -- INSERT into EMPLOYEES
(1 row(s) affected)   -- trigger's INSERT into EMPLOYEE_AUDIT

SELECT * FROM EMPLOYEE_AUDIT;

| audit_id | employee_id | action | action_time             |
|----------|-------------|--------|--------------------------|
| 1        | 300         | INSERT | 2026-10-02 10:15:03.120  |
```

### Activity 4: A full database backup

*Before applying any schema changes, the DBA wants a full backup of the HR database. Write the `BACKUP DATABASE` statement that performs this.*

**Solution:**

```sql
BACKUP DATABASE HR
TO DISK = 'C:\Backups\HR_Full.bak'
WITH INIT, NAME = 'HR-Full Database Backup';
```

**Output / Expected behaviour:**

```text
Processed 1344 pages for database 'HR', file 'HR' on file 1.
BACKUP DATABASE successfully processed 1344 pages in 0.512 seconds (20.512 MB/sec).
```

A full backup copies the entire database -every table, index, and object- to the specified file, and serves as the baseline recovery point. A **differential backup** (added with `WITH DIFFERENTIAL`) only captures the data pages that changed since the last full backup, making it much faster to run but dependent on that full backup to restore from. In the event of data loss or corruption, `RESTORE DATABASE HR FROM DISK = 'C:\Backups\HR_Full.bak'` brings the database back to the state captured at backup time.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Stored procedure for job-based salary lookup**

Write a stored procedure GetEmployeesByJob that accepts a `@job_id` parameter and returns the `employee_id`, `first_name`, `last_name`, and `salary` of all employees holding that job, ordered by `salary` descending.

**Lab Task 2: Scalar function for annual salary**

Write a scalar function GetAnnualSalary that accepts a monthly `salary` value and returns the annual salary (salary * 12). Use it in a `SELECT` against EMPLOYEES.

**Lab Task 3: Trigger for salary-change auditing and isolation levels**

Create an audit table SALARY_AUDIT (`employee_id`, `old_salary`, `new_salary`, `change_time`) and an `AFTER UPDATE` trigger on EMPLOYEES that logs a row into it whenever an employee's `salary` column is updated (hint: compare the `inserted` and `deleted` pseudo-tables). In one or two sentences, explain the difference between running this update under `READ COMMITTED` versus `SERIALIZABLE` isolation.
