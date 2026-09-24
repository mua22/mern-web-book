---
title: "Lab 12: REST API Development and CRUD Operations"
---

# Lab 12: REST API Development and CRUD Operations

Aligns with Lecture 25 (REST API Development and Authentication). Builds on the Mongoose model from Lab 11 and restructures it into a proper REST API with a router/controller layout, consistent responses and token-based authentication.

## Objective:

To design and implement a complete, well-structured REST API: resource-oriented routes, consistent JSON response shape, correct HTTP status codes, a modular router/controller organisation, and JWT-based authentication for protected endpoints.

## Activity Outcomes:

- Apply REST principles: resources, nouns in URIs, HTTP verbs for actions, statelessness.
- Organise routes using express.Router() with a separate controller file.
- Return a consistent JSON response envelope and correct status codes.
- Add a 404 handler and a centralized error-handling middleware.
- Issue and verify JSON Web Tokens (JWT) for authentication; protect selected routes.

## 1) Useful Concepts

**REST resource/verb mapping:**

| HTTP Verb | URI | Action |
|---|---|---|
| GET | /api/products | Retrieve all products |
| GET | /api/products/:id | Retrieve one product |
| POST | /api/products | Create a product |
| PUT | /api/products/:id | Replace/update a product |
| DELETE | /api/products/:id | Delete a product |

**Consistent response envelope:**

```text
// success
{ "success": true, "data": { ... } }
// failure
{ "success": false, "error": "Product not found" }
```

```bash
npm install jsonwebtoken bcryptjs
```

**Issuing and verifying a JWT:**

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

function requireAuth(req, res, next) {
  const header = req.headers.authorization; // 'Bearer <token>'
  if (!header) return res.status(401).json({ success: false, error: 'No token provided' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 30 minutes | Medium | CLO-4 |
| Activity 2 | 25 minutes | Medium | CLO-4 |
| Activity 3 | 30 minutes | High | CLO-5 |

### Activity 1: Full CRUD REST API with consistent responses

*Build a complete Products REST API using the response envelope and correct status codes (200, 201, 400, 404).*

**Solution:**

```javascript
// controllers/productController.js
const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({ success: true, data: products });
};

exports.getOne = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.status(200).json({ success: true, data: product });
};

exports.create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { res.status(400).json({ success: false, error: err.message }); }
};

exports.update = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.status(200).json({ success: true, data: product });
};

exports.remove = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.status(200).json({ success: true, data: {} });
};
```

**Output / Expected behaviour:**

```text
Same responses as Lab 11 Activity 2, now wrapped consistently as { success, data } / { success, error }.
```

### Activity 2: Router/controller modularisation, 404 and error handling

*Move routes into their own router file, mount it under /api, and add a catch-all 404 handler plus centralized error middleware.*

**Solution:**

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
module.exports = router;

// index.js
app.use(express.json());
app.use('/api/products', require('./routes/products'));

// 404 handler (after all routes)
app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

// centralized error handler (must have 4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});
```

**Output / Expected behaviour:**

```text
GET /api/nonexistent returns 404 with { success: false, error: 'Route not found' }.
```

### Activity 3: JWT authentication for a protected route

*Add a **Users** collection with hashed passwords, a POST /api/auth/login route that issues a **JWT, and** protect DELETE /api/products/:id so only an authenticated request may delete a product.*

**Solution:**

```javascript
// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // stored as a bcrypt hash
});
module.exports = mongoose.model('User', userSchema);

// routes/auth.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = require('express').Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, data: { token } });
});
module.exports = router;

// applying requireAuth (from Useful Concepts) to one route
const requireAuth = require('../middleware/requireAuth');
router.delete('/:id', requireAuth, ctrl.remove);
```

**Output / Expected behaviour:**

```text
DELETE /api/products/:id without an Authorization header returns 401.
Logging in via /api/auth/login with correct credentials returns a token; sending it as 'Authorization: Bearer <token>' allows the delete to succeed.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Search, filter and pagination on the API**

Extend GET /api/products to accept ?search=, ?category=, ?page= and ?limit= query parameters and return matching, paginated results inside the same { success, data } envelope, along with a meta object containing total count and page info.

**Lab Task 2: Role-protected delete**

Add a role field to the User model ('admin' or 'staff'). Update requireAuth (or add a requireAdmin variant) so DELETE requests are only permitted for role 'admin'; 'staff' tokens should receive 403 Forbidden.

**Lab Task 3: API versioning**

Restructure the mount points so the existing routes are served under /api/v1/products and /api/v1/auth. Explain, in a short comment block at the top of index.js, why versioning the URI helps when the API's response shape changes later.
