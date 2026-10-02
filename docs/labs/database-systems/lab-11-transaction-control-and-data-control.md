---
title: "Lab 11: Transaction Control & Data Control"
---

# Lab 11: Transaction Control & Data Control

## Objectives:

- Understand transactions and the role of `COMMIT`, `ROLLBACK`, and `SAVE TRANSACTION` (savepoints) in T-SQL.
- Use `GRANT` and `REVOKE` to control object-level privileges (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
- Create database roles and assign users to them.
- Apply the principle of least privilege when designing database access.

## Activity Outcomes:

- Wrap a set of changes in a transaction and roll it back after a mistake.
- Use a savepoint to roll back only part of a transaction.
- Grant limited privileges to a reporting role.
- Revoke a previously granted privilege.

**Tools / Software Required:**

- SQL Server 2019 (Developer or Express edition)
- SQL Server Management Studio (SSMS)
- The HR sample database (REGIONS, COUNTRIES, LOCATIONS, DEPARTMENTS, JOBS, EMPLOYEES, JOB_HISTORY)

Instructor Note: As pre-lab activity, read the chapter on "Transaction Control and Database Security" from the course's SQL Server reference text, covering transactions, savepoints, and the `GRANT`/`REVOKE` privilege model.

## 1) Useful Concepts

| Statement / Keyword | Description |
|---|---|
| `BEGIN TRANSACTION` (or `BEGIN TRAN`) | Marks the starting point of an explicit transaction |
| `COMMIT TRANSACTION` | Permanently saves all changes made since the transaction began |
| `ROLLBACK TRANSACTION` | Undoes all changes made since the transaction began (or since a named savepoint) |
| `SAVE TRANSACTION savepoint_name` | T-SQL's savepoint syntax; marks a point within a transaction to roll back to, without undoing the entire transaction |
| `ROLLBACK TRANSACTION savepoint_name` | Rolls back only the work done after the named savepoint |
| `GRANT privilege ON object TO principal` | Gives a user or role permission to perform an action (e.g. `SELECT`, `INSERT`, `UPDATE`, `DELETE`) on an object |
| `REVOKE privilege ON object FROM principal` | Removes a previously granted permission |
| `CREATE ROLE role_name` | Creates a new database role to group privileges |
| `ALTER ROLE role_name ADD MEMBER user_name` | Adds a database user to a role |
| Principle of Least Privilege | Every user/role should be granted only the minimum privileges needed to perform its job -nothing more |

**Transaction syntax skeleton:**

```sql
BEGIN TRANSACTION;
    -- one or more DML statements
    SAVE TRANSACTION savepoint1;
    -- more DML statements
    -- ROLLBACK TRANSACTION savepoint1;  -- undoes only statements after savepoint1
COMMIT TRANSACTION;  -- or ROLLBACK TRANSACTION; to undo everything
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 15 Minutes | Low | CLO-3 |
| Activity 2 | 20 Minutes | Medium | CLO-3 |
| Activity 3 | 15 Minutes | Low | CLO-3 |
| Activity 4 | 10 Minutes | Low | CLO-3 |

### Activity 1: Rolling back a mistaken UPDATE

*A payroll clerk accidentally runs an `UPDATE` that gives every employee in department 50 a 10x salary increase instead of a 10% increase. Demonstrate how a transaction lets this mistake be undone before it is committed.*

**Solution:**

```sql
BEGIN TRANSACTION;

    UPDATE EMPLOYEES
    SET salary = salary * 10   -- mistake: should have been salary * 1.10
    WHERE department_id = 50;

    -- Clerk notices the error before committing:
    ROLLBACK TRANSACTION;
```

**Output / Expected behaviour:**

```text
(45 row(s) affected)   -- from the UPDATE, before rollback
Rollback complete.

-- A subsequent SELECT salary FROM EMPLOYEES WHERE department_id = 50;
-- shows the ORIGINAL salary values, as if the UPDATE never happened.
```

### Activity 2: Using a savepoint for a partial rollback

*A transaction gives a correct 10% raise to department 50, then mistakenly also tries to delete all job history for department 50. Use `SAVE TRANSACTION` so only the mistaken delete is undone, while the raise is kept.*

**Solution:**

```sql
BEGIN TRANSACTION;

    UPDATE EMPLOYEES
    SET salary = salary * 1.10
    WHERE department_id = 50;

    SAVE TRANSACTION before_delete;

    DELETE FROM JOB_HISTORY
    WHERE department_id = 50;   -- mistake: should not have run this

    -- Roll back only the DELETE, keeping the UPDATE:
    ROLLBACK TRANSACTION before_delete;

COMMIT TRANSACTION;
```

**Output / Expected behaviour:**

```text
(45 row(s) affected)   -- UPDATE
(3 row(s) affected)    -- DELETE, later undone
Rollback to savepoint complete.
Commit complete.

-- Final result: the 10% raise is permanent, but JOB_HISTORY rows for
-- department 50 are still intact, since only the DELETE was rolled back.
```

### Activity 3: Granting SELECT-only access to a reporting role

*The company wants a read-only reporting role that can query employee data for dashboards but must never modify it. Create a role REPORTING_ROLE and grant it `SELECT` only on EMPLOYEES and DEPARTMENTS.*

**Solution:**

```sql
CREATE ROLE REPORTING_ROLE;

GRANT SELECT ON EMPLOYEES TO REPORTING_ROLE;
GRANT SELECT ON DEPARTMENTS TO REPORTING_ROLE;

-- Add an existing database user to the role:
ALTER ROLE REPORTING_ROLE ADD MEMBER report_user;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

-- Any login mapped to report_user can now run:
-- SELECT * FROM EMPLOYEES;      -> succeeds
-- UPDATE EMPLOYEES SET ...      -> fails with a permission error,
--   because only SELECT was granted (principle of least privilege).
```

### Activity 4: Revoking a privilege

*It turns out REPORTING_ROLE should not be able to see DEPARTMENTS after all -only EMPLOYEES. Revoke the SELECT privilege on DEPARTMENTS from REPORTING_ROLE.*

**Solution:**

```sql
REVOKE SELECT ON DEPARTMENTS FROM REPORTING_ROLE;
```

**Output / Expected behaviour:**

```text
Command(s) completed successfully.

-- Any member of REPORTING_ROLE attempting:
-- SELECT * FROM DEPARTMENTS;
-- now fails with:
The SELECT permission was denied on the object 'DEPARTMENTS'.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Rollback after a mistaken DELETE**

Write a transaction that deletes all employees in department 10 from EMPLOYEES, then realize this was a mistake and roll the entire transaction back. Verify with a `SELECT` that the employees are still present.

**Lab Task 2: Savepoint with two updates**

Write a transaction that (a) increases the `max_salary` of all rows in JOBS by 5%, sets a savepoint, then (b) mistakenly sets `min_salary` to 0 for all rows in JOBS. Roll back only to the savepoint so the 5% increase survives but the `min_salary` mistake is undone, then commit.

**Lab Task 3: Grant and revoke for a HR_CLERK role**

Create a role HR_CLERK_ROLE. Grant it `SELECT`, `INSERT`, and `UPDATE` (but not `DELETE`) on EMPLOYEES. Then write the statement that would revoke the `UPDATE` privilege from this role if clerks should no longer be allowed to modify employee records.
