---
title: "Lab 09: Request/Response Handling on Server Side"
---

# Lab 09: Request/Response Handling on Server Side

## Objective:

To understand how a server-side application receives requests from clients, processes the requested information, and sends appropriate responses back to the client using Express.js.

## Activity Outcomes:

- Learn how Express.js handles HTTP requests and responses.
- Understand the request/response cycle between client and server.
- Learn to handle GET and POST requests.
- Understand how to retrieve data using req.params, req.query, and req.body.
- Learn to send HTML, text, and JSON responses using Express.js.
- Get a first, light look at middleware and a small REST-style route set -these are previewed here and covered in full depth in Lab 10 (Middleware) and Lab 12 (REST API Development), so there is no need to master them yet.

## 1) Useful Concepts

- HTTP Methods: Express supports GET, POST, PUT and DELETE. GET retrieves information; POST submits data.
- Route Parameters & Query Strings: dynamic values via req.params (/user/:id) or req.query (/search?q=express).
- Middleware (previewed here, full depth in Lab 10): functions that process a request before it reaches its route handler.
- Express Router (previewed here, full depth in Lab 12): enables modular routing across separate files.

```javascript
const express = require('express');
const app = express();

app.get('/home', (req, res) => res.send('Welcome to Home Page'));
app.post('/submit', (req, res) => res.send('Data received successfully'));
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Low | CLO-4 |
| Activity 3 (preview) | 30 Minutes | Medium | CLO-4 |
| Activity 4 (preview) | 30 Minutes | Medium | CLO-4 |
| Activity 5 | 30 Minutes | Medium | CLO-4 |

### Activity 1: A basic Express application

*Create a basic Express application with GET routes for home, about, and contact pages.*

**Solution:**

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Welcome to my Home Page'));
app.get('/about', (req, res) => res.send('About Us Page'));
app.get('/contact', (req, res) => res.send('Contact Us Page'));

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
```

### Activity 2: Rendering JSON and HTML, page navigation

*Serve HTML from one route, JSON from another, and add a catch-all 404 route.*

**Solution:**

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Welcome. <a href="/help">Help</a>'));

app.get('/help', (req, res) => {
  res.send('<h1>Help Page</h1><a href="/">Go to Index Page</a>');
});

app.get('/search', (req, res) => {
  console.log('Query received:', req.query);
  res.send([
    { name: 'Muhammad Umar', age: 15, marks: 93 },
    { name: 'Muhammad Tariq', age: 45, marks: 85 }
  ]);
});

app.get('/*', (req, res) => res.send('404 - Page Not Found'));

app.listen(3000);
```

### Activity 3 (preview of Lab 10/Lab 12): Params, query strings, and middleware

*Create routes handling dynamic parameters, query parameters, request logging middleware, and a POST route for form submissions.*

**Solution:**

```javascript
app.get('/user/:id', (req, res) => res.send(`User ID: ${req.params.id}`));

app.get('/search', (req, res) => {
  const term = req.query.term || 'No term provided';
  res.send(`Search Results for: ${term}`);
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.post('/submit', (req, res) => {
  const { name, email } = req.body;
  res.send(`Name: ${name}, Email: ${email}`);
});
```

### Activity 4 (preview of Lab 10/Lab 12): Router-level middleware and a first REST-style route set

*Use middleware specific to one **router, and** expose a minimal in-memory REST API for users.*

**Solution:**

```javascript
const express = require('express');
const router = express.Router();

router.use((req, res, next) => { console.log('Middleware for users router'); next(); });
router.get('/', (req, res) => res.send('User list'));

const app = express();
app.use('/users', router);

// A minimal REST-style API (developed fully in Lab 12)
app.use(express.json());
const users = [];
app.get('/users', (req, res) => res.json(users));
app.post('/users', (req, res) => { users.push(req.body); res.status(201).json(req.body); });

app.listen(3000);
```

### Activity 5: Front-end/back-end registration demo using GET/POST

*Build a registration form and process it once with GET, then adapt it to POST.*

**Solution:**

```html
<!-- Register.html -->
<body>
  <h1>Registration Form</h1>
  <form action="sending" method="get">
    Name: <input type="text" name="name"><br>
    Email: <input type="email" name="email"><br>
    <input type="submit">
  </form>
</body>

// index.js
const express = require('express');
const app = express();

app.get('/register', (req, res) => res.sendFile(__dirname + '/Register.html'));
app.get('/sending', (req, res) => res.send(req.query));

app.listen(3000);
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: A small blog application**

Create a GET / route for the homepage, a GET /post/:id route to display individual blog posts, and a GET /contact route with a feedback form.

**Lab Task 2: CRUD REST API for products**

Using an array of objects, implement GET /products, GET /products/:id, POST /products, PUT /products/:id and DELETE /products/:id. (This is deliberately the same scope as Lab 12 -use it here as a first attempt, then compare against the fully-structured version in Lab 12.)

**Lab Task 3: Search route with query parameters**

Create a GET /search route accepting term and category query parameters, filter an array of products accordingly, return matches as JSON, and display a message when none are found.

**Lab Task 4: Navigation menu across routes**

Create Home, About and Services routes returning HTML content, with navigation links between them.

**Lab Task 5: Registration form using GET and POST**

Build a registration form, submit it via GET, display the received data, then change it to POST and use Express middleware to process the POST data.
