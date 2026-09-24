---
title: "Lab 11: Database Connectivity through ORM/ODM"
---

# Lab 11: Database Connectivity through ORM/ODM

Aligns with Lecture 22 (Database Connectivity with MongoDB) and Lecture 23 (Object-Document Mapping). This lab uses Mongoose, the standard ODM for MongoDB in Express applications.

## Objective:

To connect an Express application to a MongoDB database using Mongoose, define schemas and models, and perform CRUD operations through the ODM instead of raw driver calls.

## Activity Outcomes:

- Explain the purpose of an ODM and how a Schema maps to a MongoDB collection.
- Connect an Express app to MongoDB (local or Atlas) using Mongoose and environment variables.
- Define a Mongoose Schema with field types, defaults and validation rules.
- Perform create, read, update and delete operations using Model methods.
- Use projection, sorting, pagination (skip/limit) and basic filtering in queries.
- Write and run a simple seed script.

## 1) Useful Concepts

```bash
npm install mongoose dotenv
```

**.env file (never commit real credentials):**

```ini
MONGO_URI=mongodb://127.0.0.1:27017/lab11db
```

**Connecting to MongoDB:**

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Connection error:', err.message));
```

**Defining a Schema and Model:**

```javascript
const studentSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  marks: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
```

**Common Model methods:**

```text
Student.create({ name: 'Ayesha', email: 'ayesha@test.com', marks: 78 });
Student.find();                       // all documents
Student.find({ marks: { $gte: 50 } }); // filter
Student.findById(id);
Student.findByIdAndUpdate(id, { marks: 90 }, { new: true });
Student.findByIdAndDelete(id);
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 minutes | Low | CLO-4 |
| Activity 2 | 30 minutes | Medium | CLO-4 |
| Activity 3 | 30 minutes | Medium | CLO-4 |

### Activity 1: Connect and insert documents

*Connect an Express app to MongoDB using Mongoose, define a **Student** schema, and insert two sample documents on server start.*

**Solution:**

```javascript
// models/Student.js
const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  marks: { type: Number, default: 0 }
});
module.exports = mongoose.model('Student', studentSchema);

// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const app = express();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('MongoDB connected');
  const count = await Student.countDocuments();
  if (count === 0) {
    await Student.insertMany([
      { name: 'Ayesha', email: 'ayesha@test.com', marks: 78 },
      { name: 'Bilal',  email: 'bilal@test.com',  marks: 55 }
    ]);
    console.log('Sample students inserted');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Output / Expected behaviour:**

```text
Console: 'MongoDB connected' then 'Sample students inserted' (first run only).
```

### Activity 2: Full CRUD via Mongoose

*Expose route handlers that perform create, read, update and delete using the **Student** model.*

**Solution:**

```javascript
app.use(express.json());

app.post('/students', async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/students', async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get('/students/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

app.put('/students/:id', async (req, res) => {
  const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/students/:id', async (req, res) => {
  const deleted = await Student.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted successfully' });
});
```

**Output / Expected behaviour:**

```text
POST /students with a valid body returns 201 and the saved document (with its _id).
GET /students returns the full array.
DELETE on an unknown id returns 404.
```

### Activity 3: Validation, filtering and pagination

*Add schema-level validation, then support filtering by minimum marks and pagination via query parameters: /students?minMarks=50&page=1&limit=2.*

**Solution:**

```javascript
// schema validation example (models/Student.js)
marks: {
  type: Number,
  min: [0, 'Marks cannot be negative'],
  max: [100, 'Marks cannot exceed 100']
}

// route: filtering + pagination + sorting
app.get('/students', async (req, res) => {
  const minMarks = Number(req.query.minMarks) || 0;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const filter = { marks: { $gte: minMarks } };
  const students = await Student.find(filter)
    .sort({ marks: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Student.countDocuments(filter);
  res.json({ page, limit, total, results: students });
});
```

**Output / Expected behaviour:**

```text
/students?minMarks=60&page=1&limit=1 returns the single highest-marks student with marks >= 60, plus { page, limit, total }.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Product catalogue model**

Create a Product schema (name, price, category, stock) with validation (price &gt;= 0, stock &gt;= 0). Implement full CRUD routes as in Activity 2.

**Lab Task 2: Referencing another collection**

Create an Order schema whose product field stores a mongoose.Schema.Types.ObjectId referencing Product. Implement GET /orders/:id that uses .populate('product') to return the order together with the full product document.

**Lab Task 3: Seed script**

Write a standalone seed.js (run with node seed.js) that connects to the database, deletes all existing Product documents, and inserts at least 8 sample products. It should print a summary count when finished and close the connection.
