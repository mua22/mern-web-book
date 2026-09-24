---
title: "Lab 10: Working with Sessions and Middleware"
---

# Lab 10: Working with Sessions and Middleware

Aligns with Lecture 20 (Cookies and Sessions) and Lecture 21 (Middleware). Builds directly on the Express fundamentals from Lab 9.

## Objective:

To understand how HTTP statelessness is managed using cookies and sessions, and how Express middleware forms a request/response processing pipeline, including application-level, router-level and error-handling middleware.

## Activity Outcomes:

- Explain why HTTP is stateless and how cookies/sessions provide state.
- Set and read cookies using the cookie-parser package.
- Create and destroy sessions using express-session; implement login/logout.
- Write custom application-level and router-level middleware.
- Write centralized error-handling middleware.
- Protect routes using authentication-check middleware.

## 1) Useful Concepts

**Cookies vs Sessions:**

A cookie is a small piece of data stored in the browser and sent with every request to the same origin. A session stores state on the server and gives the client only a session identifier (usually via a cookie). Sessions are generally preferred for sensitive state such as login status because the actual data never leaves the server.

```bash
npm install express express-session cookie-parser
```

**Setting up sessions:**

```javascript
const session = require('express-session');
app.use(session({
  secret: 'lab10-secret-key',   // use an env variable in production
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 15 } // 15 minutes
}));
```

**Middleware signature:**

Ordinary middleware: (req, res, next) =&gt; { ... next(); }. Error-handling middleware has four parameters: (err, req, res, next) and must be registered after all routes.

```javascript
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}
app.use(logger); // application-level middleware

// error-handling middleware (note: 4 parameters)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});
```

**Router-level middleware:**

```javascript
const router = express.Router();
router.use((req, res, next) => {
  console.log('Middleware scoped to this router only');
  next();
});
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 minutes | Low | CLO-4 |
| Activity 2 | 30 minutes | Medium | CLO-4 |
| Activity 3 | 25 minutes | Medium | CLO-4 |

### Activity 1: Cookie-based visit counter

*Use cookie-parser to track how many times a visitor has loaded the page, without using a session.*

**Solution:**

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

app.get('/', (req, res) => {
  let visits = parseInt(req.cookies.visits) || 0;
  visits++;
  res.cookie('visits', visits, { maxAge: 900000 });
  res.send(`You have visited this page ${visits} time(s).`);
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Output / Expected behaviour:**

```text
First load: 'You have visited this page 1 time(s).'
Reload: 'You have visited this page 2 time(s).'
```

### Activity 2: Login/logout using express-session

*Create a login form. On correct credentials, start a session and redirect to a protected dashboard route. Add a middleware function requireLogin that blocks access to /dashboard when no session exists.*

**Solution:**

```javascript
const express = require('express');
const session = require('express-session');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'lab10-secret', resave: false, saveUninitialized: false }));

const USER = { username: 'admin', password: '1234' }; // fictional demo credentials

app.get('/login', (req, res) => {
  res.send(`
    <form method='POST' action='/login'>
      <input name='username' placeholder='Username'><br>
      <input name='password' type='password' placeholder='Password'><br>
      <button type='submit'>Login</button>
    </form>`);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    return res.redirect('/dashboard');
  }
  res.send('Invalid credentials. <a href="/login">Try again</a>');
});

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/dashboard', requireLogin, (req, res) => {
  res.send(`Welcome, ${req.session.user}! <a href='/logout'>Logout</a>`);
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Output / Expected behaviour:**

```text
Visiting /dashboard without logging in redirects to /login.
After correct login, /dashboard shows the welcome message.
/logout destroys the session and returns to /login.
```

### Activity 3: Custom logging middleware + centralized error handling

*Add a request logger (application-level middleware), a router-level middleware for an /admin router, and a centralized error-handling middleware that catches thrown errors from any route.*

**Solution:**

```javascript
const express = require('express');
const app = express();

// Application-level middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Router-level middleware
const adminRouter = express.Router();
adminRouter.use((req, res, next) => {
  console.log('Admin router middleware executed');
  next();
});
adminRouter.get('/stats', (req, res) => res.json({ users: 42 }));
app.use('/admin', adminRouter);

// Route that intentionally throws
app.get('/crash', (req, res) => {
  throw new Error('Deliberate failure for demonstration');
});

// Centralized error-handling middleware (4 params, registered last)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

**Output / Expected behaviour:**

```text
GET /admin/stats logs 'Admin router middleware executed' then returns { users: 42 }.
GET /crash returns 500 with JSON: { "error": "Deliberate failure for demonstration" }.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Session-based shopping cart skeleton**

Store an array of item names in req.session.cart. Add routes POST /cart/add (adds an item), GET /cart (lists items) and POST /cart/clear (empties the cart). Verify the cart persists across requests but resets after req.session.destroy().

**Lab Task 2: Role-based middleware**

Extend Activity 2 so req.session.user also stores a role ('admin' or 'guest'). Write a requireAdmin middleware and protect a GET /admin/reports route so only role 'admin' can access it; a 'guest' session should receive 403 Forbidden.

**Lab Task 3: Simple rate-limiting middleware**

Write a custom middleware (without a package) that counts requests per IP address in memory and responds with 429 Too Many Requests if an IP exceeds 5 requests within 10 seconds. Apply it only to a specific route, e.g. /search.
