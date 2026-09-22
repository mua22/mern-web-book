const { buildDeck } = require("./deckBuilder");

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 22: Database Connectivity with PostgreSQL / MongoDB",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-22-Database-Connectivity.pptx",
  slides: [
    { type: "title", lectureNo: 22, heading: "Database\nConnectivity",
      sub: "Connecting a Node/Express app to PostgreSQL and MongoDB — and choosing the right shape for your data." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Compare the relational (PostgreSQL) and document (MongoDB) data models",
      "Learn how to choose the right database for a given project",
      "Set up a database connection, understand connection strings, and connection pooling",
      "Perform CRUD operations from server-side code in both MongoDB and PostgreSQL",
      "Design collections/schemas and add basic validation",
      "Use environment variables safely and handle database errors properly",
    ] },

    { type: "bullets", kicker: "Databases", heading: "What Is a Database?", items: [
      "Software dedicated to storing, organizing, and retrieving data reliably",
      "Persistence: the data survives — \"persists\" — beyond the life of the program",
      "Two kinds you'll meet constantly: relational (PostgreSQL, MySQL) and document (MongoDB)",
    ] },

    { type: "code", kicker: "Relational Model", heading: "PostgreSQL: Tables and Foreign Keys",
      code: "-- users table\n| id | name    | email             |\n|----|---------|-------------------|\n| 1  | Ayesha  | ayesha@email.com  |\n| 2  | Bilal   | bilal@email.com   |\n\n-- orders table (references users via user_id)\n| id | user_id | total |\n|----|---------|-------|\n| 1  | 1       | 45.00 |\n| 2  | 1       | 12.50 |",
      note: "A JOIN matches rows across tables using the foreign key — here, orders.user_id points back to users.id." },

    { type: "code", kicker: "Document Model", heading: "MongoDB: Flexible JSON-Like Documents",
      code: "// A document in the \"users\" collection\n{\n  \"_id\": \"64f1a2b3c4d5e6f7a8b9c0d1\",\n  \"name\": \"Ayesha\",\n  \"email\": \"ayesha@email.com\",\n  \"orders\": [\n    { \"total\": 45.00, \"date\": \"2024-01-15\" },\n    { \"total\": 12.50, \"date\": \"2024-02-02\" }\n  ]\n}",
      note: "Ayesha's orders live inside her own document — no separate table, no JOIN needed to read them together." },

    { type: "diagram", kicker: "Relational vs. Document", heading: "Two Very Different Shapes",
      nodes: [
        { x: 1.0, y: 2.15, w: 4.9, h: 0.35, text: "RELATIONAL (PostgreSQL)", fill: "FFFFFF", textColor: "2B2B7A", bold: true, fontSize: 13 },
        { x: 6.9, y: 2.15, w: 5.03, h: 0.35, text: "DOCUMENT (MongoDB)", fill: "FFFFFF", textColor: "E67528", bold: true, fontSize: 13 },
        { x: 1.0, y: 2.65, w: 4.9, h: 0.9, text: "users table\nid | name | email", fill: "2B2B7A", fontSize: 13 },
        { x: 1.0, y: 4.15, w: 4.9, h: 0.9, text: "orders table\nid | user_id | total", fill: "2B2B7A", fontSize: 13 },
        { x: 6.9, y: 2.65, w: 5.03, h: 2.4, text: "users collection\n\n{ name, email,\n  orders: [ {...}, {...} ] }\n\n(orders embedded directly)", fill: "E67528", fontSize: 13 },
      ],
      edges: [
        { x1: 3.45, y1: 3.55, x2: 3.45, y2: 4.15, label: "FK / JOIN" },
      ],
      caption: "Relational data lives in separate tables joined by foreign keys; document data is often embedded directly inside the parent document — no join needed." },

    { type: "table", kicker: "Comparing the Two", heading: "Relational vs. Document, Side by Side",
      header: ["", "Relational (PostgreSQL)", "Document (MongoDB)"], colW: [2.3, 4.8, 4.833], leftCol: 0, rowH: 0.7,
      rows: [
        ["Structure", "Tables with fixed columns", "Collections of flexible JSON-like documents"],
        ["Schema", "Strict — defined up front, enforced by the database", "Flexible — documents in the same collection can differ"],
        ["Relationships", "Foreign keys + JOINs", "Embedding (nested data) or manual references"],
        ["Best for", "Clear structure, strong consistency (banking, inventory)", "Naturally nested, evolving data (profiles, catalogs)"],
        ["Query language", "SQL", "MongoDB Query Language (JS-like methods)"],
        ["Scaling style", "Traditionally scales up; modern versions scale out too", "Designed from the start to scale out"],
      ] },

    { type: "callout", kicker: "Comparing the Two", heading: "Terminology: SQL vs. NoSQL", kind: "note", h: 1.7,
      text: "PostgreSQL/MySQL are often called SQL databases, after their query language. MongoDB is called a NoSQL database — \"not only SQL\" — a broad category that includes document, key-value, and other non-relational databases." },

    { type: "cards", kicker: "Choosing the Right Database", heading: "There's No Universal \"Best\"", cards: [
      { heading: "Choose PostgreSQL", accent: "2B2B7A", body: [
        "Data has a clear, stable structure",
        "Relationships between entities matter a lot — orders belong to customers, who belong to a store",
        "You need strong consistency guarantees, e.g. financial transactions",
      ] },
      { heading: "Choose MongoDB", accent: "E67528", body: [
        "Data is naturally nested or hierarchical — a blog post with embedded comments",
        "The schema is likely to evolve quickly during early development",
        "You mostly read/write whole \"documents\" at once — a user profile with all its settings",
      ] },
    ] },

    { type: "callout", kicker: "Choosing the Right Database", heading: "Many Real Systems Use Both", kind: "tip", h: 2.0,
      text: "A relational database for structured, transactional data (like payments), and a document database for flexible content (like product catalogs or activity logs). Choosing a database is a design decision per use case, not a one-time choice for the whole company." },

    { type: "bullets", kicker: "Connections", heading: "Drivers and Connection Strings", items: [
      "A driver is a library that knows how to speak a database's network protocol — mongodb (or mongoose) for MongoDB, pg for PostgreSQL",
      "A connection string (URI) packs together protocol, host, port, database name, and credentials",
      "Your server passes this string to the driver once, at startup",
    ] },

    { type: "code", kicker: "Connections", heading: "Connection String Formats",
      code: "mongodb://username:password@localhost:27017/myAppDB\n\npostgresql://username:password@localhost:5432/myAppDB" },

    { type: "callout", kicker: "Environment Variables", heading: "Never Hard-Code Credentials", kind: "warning", h: 2.3,
      text: "Anyone who sees your source code — including everyone on GitHub, if the repo is public — sees the password too. Always add .env to your .gitignore file; committing real credentials to Git, even a private repo, is one of the most common causes of security breaches in student and professional projects alike." },

    { type: "code", kicker: "Environment Variables", heading: ".env File",
      code: "# .env  (never commit this file to Git)\nMONGO_URI=mongodb://localhost:27017/myAppDB\nPG_CONNECTION_STRING=postgresql://user:pass@localhost:5432/myAppDB\nPORT=3000" },

    { type: "code", kicker: "Environment Variables", heading: "Reading Environment Variables",
      code: "// at the very top of your entry file\nrequire(\"dotenv\").config();\n\nconsole.log(process.env.MONGO_URI);",
      note: "npm install dotenv first — it reads .env into process.env at runtime." },

    { type: "code", kicker: "Connecting to MongoDB", heading: "MongoClient",
      code: "const { MongoClient } = require(\"mongodb\");\nrequire(\"dotenv\").config();\n\nconst client = new MongoClient(process.env.MONGO_URI);\n\nasync function main() {\n  await client.connect();\n  console.log(\"Connected to MongoDB\");\n  const db = client.db(\"myAppDB\");\n  return db;\n}\n\nmain().catch(console.error);" },

    { type: "code", kicker: "Connection Pooling", heading: "PostgreSQL: Pool",
      code: "const { Pool } = require(\"pg\");\nrequire(\"dotenv\").config();\n\nconst pool = new Pool({\n  connectionString: process.env.PG_CONNECTION_STRING,\n  max: 10, // max connections kept in the pool\n});\n\nasync function getUsers() {\n  const result = await pool.query(\"SELECT * FROM users\");\n  return result.rows;\n}",
      note: "Opening a new connection per query is slow; both drivers reuse a pool of already-open connections instead." },

    { type: "callout", kicker: "Connection Pooling", heading: "MongoDB Pools Too", kind: "note", h: 1.7,
      text: "MongoDB's driver also manages a connection pool internally — by default, up to 100 connections — even though you only call client.connect() once. You rarely need to configure this yourself outside a high-traffic production app." },

    { type: "flow", kicker: "Connection Pooling", heading: "Borrowing a Connection from the Pool",
      steps: [
        { label: "App requests\na connection" },
        { label: "Pool hands out\nan existing one" },
        { label: "App runs\nthe query" },
        { label: "DB returns\nresults" },
        { label: "App releases\nconnection back" },
      ],
      caption: "The pool is a set of already-open connections, reused across many queries instead of opened fresh each time." },

    { type: "code", kicker: "CRUD in MongoDB", heading: "Create and Read",
      code: "const users = db.collection(\"users\");\n\n// CREATE\nconst result = await users.insertOne({\n  name: \"Ayesha\", email: \"ayesha@email.com\", age: 21\n});\n\n// READ\nconst oneUser = await users.findOne({\n  email: \"ayesha@email.com\"\n});\nconst adults = await users.find({\n  age: { $gte: 18 }\n}).toArray();",
      note: "insertedId comes back on the result; find() returns a cursor — toArray() collects every match." },

    { type: "code", kicker: "CRUD in MongoDB", heading: "Update and Delete",
      code: "// UPDATE\nawait users.updateOne(\n  { email: \"ayesha@email.com\" },\n  { $set: { age: 22 } }\n);\n\n// DELETE\nawait users.deleteOne({\n  email: \"ayesha@email.com\"\n});",
      note: "$set only touches the fields you list — every other field on the document is left alone." },

    { type: "code", kicker: "CRUD in PostgreSQL", heading: "Create and Read",
      code: "// CREATE\nconst result = await pool.query(\n  \"INSERT INTO users (name, email, age)\" +\n  \" VALUES ($1, $2, $3) RETURNING id\",\n  [\"Ayesha\", \"ayesha@email.com\", 21]\n);\n\n// READ\nconst oneUser = await pool.query(\n  \"SELECT * FROM users WHERE email = $1\",\n  [\"ayesha@email.com\"]\n);",
      note: "$1, $2, $3 are placeholders — the driver safely substitutes the array values." },

    { type: "code", kicker: "CRUD in PostgreSQL", heading: "Update and Delete",
      code: "// UPDATE\nawait pool.query(\n  \"UPDATE users SET age = $1 WHERE email = $2\",\n  [22, \"ayesha@email.com\"]\n);\n\n// DELETE\nawait pool.query(\n  \"DELETE FROM users WHERE email = $1\",\n  [\"ayesha@email.com\"]\n);" },

    { type: "callout", kicker: "CRUD in PostgreSQL", heading: "Always Use Parameterized Queries", kind: "warning", h: 2.3,
      text: "Building queries by concatenating strings opens the door to SQL injection, letting an attacker smuggle their own SQL commands through user input. The MongoDB driver's object-based query syntax is naturally safer the same way, as long as you don't build queries from raw, unvalidated strings yourself." },

    { type: "bullets", kicker: "Schema Design", heading: "Plan Your Structure Deliberately", items: [
      "MongoDB doesn't force a rigid schema, but you should still decide what fields exist, their types, and whether related data is embedded or referenced",
      "MongoDB also supports optional schema validation at the database level",
      "PostgreSQL enforces structure automatically, through the table definition itself",
    ] },

    { type: "code", kicker: "Schema Design", heading: "MongoDB Schema Validation",
      code: "await db.createCollection(\"users\", {\n  validator: { $jsonSchema: {\n    bsonType: \"object\",\n    required: [\"name\", \"email\"],\n    properties: {\n      name: { bsonType: \"string\" },\n      email: { bsonType: \"string\", pattern: \"^.+@.+$\" },\n      age: { bsonType: \"int\", minimum: 0 }\n    }\n  } }\n});" },

    { type: "code", kicker: "Schema Design", heading: "PostgreSQL Table Definition",
      code: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(150) UNIQUE NOT NULL,\n  age INTEGER CHECK (age >= 0)\n);" },

    { type: "code", kicker: "Error Handling", heading: "Always Wrap Database Calls",
      code: "app.post(\"/api/users\", async (req, res) => {\n  try {\n    const result = await usersCollection\n      .insertOne(req.body);\n    res.status(201).json({ id: result.insertedId });\n  } catch (err) {\n    console.error(\"Database error:\", err.message);\n    res.status(500).json({ error: \"Could not create user.\" });\n  }\n});",
      note: "Never assume a database call succeeds — the network can drop, a constraint can fail, or the server can be down." },

    { type: "callout", kicker: "Error Handling", heading: "Never Leak Raw Errors to the Client", kind: "tip", h: 2.0,
      text: "Raw database error messages can leak details about your schema or internal setup. Log the full error on the server, and send the client a short, generic message instead." },

    { type: "closing", heading: "Lecture 22 in Six Points", items: [
      "Relational databases (PostgreSQL) use tables, fixed schemas, and JOINs; document databases (MongoDB) use flexible, JSON-like documents, often embedding related data.",
      "Choose based on your data's shape and your app's needs — structured/relational data favors PostgreSQL, nested/evolving data favors MongoDB.",
      "A connection string tells your driver how to reach the database; a connection pool reuses connections instead of opening a new one per query.",
      "Keep credentials out of your source code — use environment variables and a .env file, never committed to Git.",
      "CRUD operations look different in MongoDB (insertOne, find) versus PostgreSQL (SQL via pool.query), but the underlying goal is the same.",
      "Always use parameterized queries to prevent SQL injection, and always wrap database calls in try/catch with sensible error responses.",
    ] },
  ],
});
