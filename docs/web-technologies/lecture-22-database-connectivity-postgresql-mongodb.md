---
title: "Lecture 22: Database Connectivity with PostgreSQL / MongoDB"
tags:
  - MongoDB
  - PostgreSQL
  - Databases
  - Node.js
  - Express
---

# Lecture 22: Database Connectivity with PostgreSQL / MongoDB

Every real application needs to remember things after the server restarts — user
accounts, blog posts, orders. That's what a **database** is for: software dedicated to
storing, organizing, and retrieving data reliably. This lecture shows you how to connect
a Node.js/Express application to a database, using MongoDB (a document database) as the
primary example and PostgreSQL (a relational database) as a point of comparison.

## In This Lecture

- Compare the relational (PostgreSQL) and document (MongoDB) data models
- Learn how to choose the right database for a given project
- Set up a database connection, understand connection strings, and connection pooling
- Perform CRUD operations from server-side code in both MongoDB and PostgreSQL
- Design collections/schemas and add basic validation
- Use environment variables safely and handle database errors properly

## Relational vs. Document Data Models

A **database** stores data so it can be saved, searched, and updated efficiently, even
after your server process stops running (this is called **persistence** — the data
survives, or "persists," beyond the life of the program). There are many kinds of
databases, but the two you will meet constantly are **relational** databases (like
PostgreSQL, MySQL) and **document** databases (like MongoDB).

### The Relational Model (PostgreSQL)

A **relational database** organizes data into **tables**, which look like spreadsheets:
fixed **columns** (each with a defined data type) and any number of **rows**. Every row
in a table has the same set of columns. Relationships between tables are expressed using
**foreign keys** — a column in one table that refers to a row in another table.

```sql
-- users table
| id | name    | email             |
|----|---------|-------------------|
| 1  | Ayesha  | ayesha@email.com  |
| 2  | Bilal   | bilal@email.com   |

-- orders table (references users via user_id)
| id | user_id | total |
|----|---------|-------|
| 1  | 1       | 45.00 |
| 2  | 1       | 12.50 |
```

To combine data from both tables (say, "get Ayesha's orders"), you use a **JOIN** — a SQL
operation that matches rows across tables using the foreign key.

### The Document Model (MongoDB)

A **document database** stores data as **documents** — flexible, JSON-like objects —
grouped into **collections** (roughly the document-database equivalent of a table). Each
document can have its own set of fields, and related data is often **embedded** directly
inside the parent document instead of living in a separate table.

```json
// A document in the "users" collection
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Ayesha",
  "email": "ayesha@email.com",
  "orders": [
    { "total": 45.00, "date": "2024-01-15" },
    { "total": 12.50, "date": "2024-02-02" }
  ]
}
```

Here, Ayesha's orders are stored *inside* her user document — no separate table and no
JOIN needed to read them together.

```mermaid
flowchart LR
    subgraph Relational["Relational (PostgreSQL)"]
      direction TB
      T1["users table\nid | name | email"]
      T2["orders table\nid | user_id | total"]
      T1 -- "foreign key\nJOIN" --> T2
    end
    subgraph Document["Document (MongoDB)"]
      direction TB
      D1["users collection\n{ name, email,\n  orders: [ {...}, {...} ] }"]
    end
```

### Comparing the Two

| | Relational (PostgreSQL) | Document (MongoDB) |
|---|---|---|
| Structure | Tables with fixed columns | Collections of flexible JSON-like documents |
| Schema | Strict — defined up front, enforced by the database | Flexible — documents in the same collection can differ |
| Relationships | Foreign keys + JOINs | Embedding (nested data) or manual references |
| Best for | Data with clear structure and relationships (banking, inventory, anything needing strong consistency) | Data that's naturally nested, evolving, or read as a whole "unit" (user profiles, content, catalogs) |
| Query language | SQL (Structured Query Language) | MongoDB Query Language (JavaScript-like methods) |
| Scaling style | Traditionally scales up (a bigger server); modern versions also scale out | Designed from the start to scale out (spread across many servers) |

!!! note "Terminology: SQL vs. NoSQL"
    You will often hear PostgreSQL/MySQL called **SQL databases** (after their query
    language) and MongoDB called a **NoSQL database** (meaning "not only SQL" — a broad
    category that includes document, key-value, and other non-relational databases).

## Choosing the Right Database

There's no universal "best" database — the right choice depends on your data and your
application's needs. Some practical guidelines:

- **Choose PostgreSQL (relational)** when your data has a clear, stable structure; when
  relationships between entities matter a lot (e.g., orders belonging to customers,
  belonging to a store); and when you need strong guarantees that data stays consistent
  (e.g., financial transactions, where you cannot afford a half-completed transfer).
- **Choose MongoDB (document)** when your data is naturally nested or hierarchical (e.g.,
  a blog post with embedded comments); when your schema is likely to evolve quickly
  during early development; or when you're mostly reading/writing whole "documents" at a
  time (e.g., a user profile with all its settings).

!!! tip
    Many real-world systems use **both** — a relational database for structured,
    transactional data (like payments) and a document database for flexible content
    (like product catalogs or activity logs). Choosing a database is a design decision
    per use case, not a one-time choice for the whole company.

## Connection Setup, Connection Strings, and Pooling

To talk to a database, your Node.js server needs a **driver** — a library that knows how
to speak that database's network protocol. For MongoDB, that's the official `mongodb`
package (or `mongoose`, which we cover in the next lecture). For PostgreSQL, it's the
`pg` package.

A **connection string** (or URI) is a single string that packs together everything needed
to reach the database: protocol, host, port, database name, and credentials.

```text
mongodb://username:password@localhost:27017/myAppDB
postgresql://username:password@localhost:5432/myAppDB
```

### Environment Variables and `.env`

You should **never** hard-code credentials (passwords, connection strings) directly in
your source code — anyone who sees the code (including everyone on GitHub, if the repo is
public) sees the password too. Instead, store them in **environment variables**: values
set outside your code, in the operating system or a `.env` file, and read into your
program at runtime.

```bash
npm install dotenv
```

```text
# .env  (never commit this file to Git)
MONGO_URI=mongodb://localhost:27017/myAppDB
PG_CONNECTION_STRING=postgresql://user:pass@localhost:5432/myAppDB
PORT=3000
```

```javascript
// at the very top of your entry file
require("dotenv").config();

console.log(process.env.MONGO_URI); // reads the value from .env
```

!!! warning
    Always add `.env` to your `.gitignore` file. Committing real credentials to a Git
    repository — even a private one — is one of the most common causes of security
    breaches in student and professional projects alike.

### Connecting to MongoDB

```javascript
const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

async function main() {
  await client.connect();
  console.log("Connected to MongoDB");
  const db = client.db("myAppDB");
  return db;
}

main().catch(console.error);
```

### Connecting to PostgreSQL and Connection Pooling

Opening a brand-new network connection for every single query is slow and wastes
resources. Instead, both drivers give you a **connection pool** — a set of already-open
connections that are reused across many queries, handed out to whichever part of your
code needs one and returned to the pool when done.

```javascript
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  max: 10, // maximum number of connections kept in the pool
});

async function getUsers() {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
}
```

!!! note
    MongoDB's driver also manages a connection pool internally (by default, up to 100
    connections) even though you only call `client.connect()` once. You rarely need to
    configure this yourself unless you're tuning a high-traffic production application.

```mermaid
sequenceDiagram
    participant App as Express App
    participant Pool as Connection Pool
    participant DB as Database Server

    App->>Pool: request a connection
    Pool-->>App: hands out an existing connection
    App->>DB: run query
    DB-->>App: return results
    App->>Pool: release connection back to pool
```

## CRUD Operations

**CRUD** stands for **Create, Read, Update, Delete** — the four basic operations every
data-driven application performs.

### MongoDB Driver Example

```javascript
async function crudDemo(db) {
  const users = db.collection("users");

  // CREATE
  const insertResult = await users.insertOne({
    name: "Ayesha",
    email: "ayesha@email.com",
    age: 21,
  });
  console.log("Inserted id:", insertResult.insertedId);

  // READ
  const oneUser = await users.findOne({ email: "ayesha@email.com" });
  const allAdults = await users.find({ age: { $gte: 18 } }).toArray();

  // UPDATE
  await users.updateOne(
    { email: "ayesha@email.com" },
    { $set: { age: 22 } }
  );

  // DELETE
  await users.deleteOne({ email: "ayesha@email.com" });
}
```

### PostgreSQL (`pg`) Example

```javascript
async function crudDemo(pool) {
  // CREATE
  const insertResult = await pool.query(
    "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING id",
    ["Ayesha", "ayesha@email.com", 21]
  );
  console.log("Inserted id:", insertResult.rows[0].id);

  // READ
  const oneUser = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    ["ayesha@email.com"]
  );
  const allAdults = await pool.query("SELECT * FROM users WHERE age >= $1", [18]);

  // UPDATE
  await pool.query("UPDATE users SET age = $1 WHERE email = $2", [22, "ayesha@email.com"]);

  // DELETE
  await pool.query("DELETE FROM users WHERE email = $1", ["ayesha@email.com"]);
}
```

!!! warning "Always use parameterized queries"
    Notice the `$1`, `$2` placeholders (PostgreSQL) instead of pasting variables
    directly into the SQL string. Building queries by concatenating strings opens the
    door to **SQL injection**, a serious security vulnerability where an attacker can
    smuggle their own SQL commands through user input. The MongoDB driver's object-based
    query syntax (`{ email: someVariable }`) is naturally safer in the same way, as long
    as you don't build queries from raw, unvalidated strings yourself.

## Schema / Collection Design and Validation

Even though MongoDB doesn't force a rigid schema, you should still **plan your document
structure deliberately** — deciding what fields exist, their types, and whether related
data should be embedded or referenced. MongoDB also supports optional **schema
validation** at the database level:

```javascript
await db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age: { bsonType: "int", minimum: 0 },
      },
    },
  },
});
```

In PostgreSQL, structure is enforced automatically through the table definition itself:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 0)
);
```

## Error Handling Around Database Calls

Database calls can fail for many reasons: the network drops, the connection string is
wrong, a query violates a constraint (like a duplicate email on a `UNIQUE` column), or the
database server is simply down. Never assume a database call will succeed — always wrap
it and respond sensibly.

```javascript
app.post("/api/users", async (req, res) => {
  try {
    const result = await usersCollection.insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Could not create user." });
  }
});
```

!!! tip
    Never send raw database error messages directly to the client in production — they
    can leak details about your schema or internal setup. Log the full error on the
    server, and send the client a short, generic message instead.

## Try It Yourself

1. Install MongoDB locally (or use a free MongoDB Atlas cluster) and connect to it from
   a small Node.js script using the official `mongodb` driver. Insert three documents
   into a `products` collection, then write a query that finds only the products with a
   `price` greater than 10.
2. Sketch (on paper or in a comment) how you would model a "blog post with comments"
   feature in both a relational schema (tables + foreign keys) and a MongoDB document
   (with embedded comments). Which approach would you pick, and why?

## Key Takeaways

- **Relational databases** (PostgreSQL) use tables, fixed schemas, and JOINs;
  **document databases** (MongoDB) use flexible, JSON-like documents in collections,
  often embedding related data.
- Choose based on your data's shape and your app's needs — structured/relational data
  favors PostgreSQL, nested/evolving data favors MongoDB.
- A **connection string** tells your driver how to reach the database; a **connection
  pool** reuses connections instead of opening a new one per query.
- Keep credentials out of your source code — use **environment variables** and a
  `.env` file (never committed to Git).
- CRUD (Create, Read, Update, Delete) operations look different in MongoDB (methods like
  `insertOne`, `find`) versus PostgreSQL (SQL statements via `pool.query`), but the
  underlying goal is the same.
- Always use parameterized queries to prevent SQL injection, and always wrap database
  calls in `try/catch` with sensible error responses.
