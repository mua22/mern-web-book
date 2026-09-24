---
title: "Lab 15: Web Application Security"
---

# Lab 15: Web Application Security

Aligns with Lecture 30 (Application Security Basics) and Lecture 31 (Common Web Attacks and Defences). Applies directly to the Express/MongoDB API from Labs 11–12 and the React front end from Labs 13–14.

## Objective:

To apply core, practical web-application security measures: secure password storage, protection against NoSQL injection and XSS, sensible CORS configuration, common security response headers, and basic rate limiting.

## Activity Outcomes:

- Explain the CIA triad and why plaintext password storage is unacceptable.
- Hash and verify passwords using bcrypt.
- Add security headers using helmet and understand what each mitigates.
- Configure CORS explicitly rather than allowing all origins.
- Recognise and fix a NoSQL injection vulnerability in a query.
- Recognise and fix a reflected XSS vulnerability in server-rendered HTML.
- Apply basic rate limiting to a sensitive route.

## 1) Useful Concepts

| Threat | Typical cause | Primary defence used in this lab |
|---|---|---|
| Plaintext password exposure | Storing req.body.password directly | bcrypt.hash() before saving; bcrypt.compare() on login |
| NoSQL injection | Passing untrusted req.body/req.query straight into a Mongo query | Validate/whitelist input types; strip $ and . operators (e.g. express-mongo-sanitize) |
| Cross-Site Scripting (XSS) | Inserting untrusted input into HTML without escaping | Escape output server-side; never use dangerouslySetInnerHTML with untrusted data in React |
| Cross-Origin misuse | cors() with no options (allow-all) | Explicit origin allow-list in the CORS config |
| Brute-force / abuse | No limit on repeated requests to a route | express-rate-limit on sensitive routes such as /login |

```bash
npm install bcryptjs helmet cors express-rate-limit express-mongo-sanitize
```

**Security middleware baseline:**

```javascript
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173'], methods: ['GET','POST','PUT','DELETE'] }));
app.use(mongoSanitize()); // strips keys starting with $ or containing '.'
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 25 minutes | Medium | CLO-4 |
| Activity 2 | 20 minutes | Medium | CLO-4 |
| Activity 3 | 30 minutes | High | CLO-5 |

### Activity 1: Hash passwords with bcrypt

*Update the registration route from Lab 12 to hash the password before saving, and confirm login still works by comparing hashes.*

**Solution:**

```javascript
const bcrypt = require('bcryptjs');

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Username and an 8+ character password are required' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed });
  res.status(201).json({ success: true, data: { id: user._id, username: user.username } });
});

// login (unchanged in shape from Lab 12, using bcrypt.compare)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  const valid = user && await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });
  res.json({ success: true, data: { username } });
});
```

**Output / Expected behaviour:**

```text
Inspecting the users collection shows only bcrypt hashes (e.g. '$2a$10$...'), never the plaintext password.
```

### Activity 2: Headers, CORS and rate limiting

*Add helmet, an explicit CORS allow-list, and rate limiting on the login route specifically.*

**Solution:**

```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                  // 5 attempts per window per IP
  message: { success: false, error: 'Too many login attempts, try again later.' }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => { /* as in Activity 1 */ });
```

**Output / Expected behaviour:**

```text
A request from an origin other than http://localhost:5173 is blocked by CORS.
The 6th login attempt within 10 minutes from the same IP receives 429 with the rate-limit message.
```

### Activity 3: Demonstrate and fix NoSQL injection and XSS

*Show a vulnerable query and a vulnerable HTML response, then fix both.*

**Solution:**

```javascript
// VULNERABLE: query built directly from user input
app.post('/api/auth/login-unsafe', async (req, res) => {
  // if req.body.password is the object { "$ne": null }, this matches ANY user
  const user = await User.findOne({ username: req.body.username, password: req.body.password });
  res.json({ success: !!user });
});

// FIXED: validate types before querying, and never compare passwords with $-operators
app.post('/api/auth/login-safe', async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid input' });
  }
  const user = await User.findOne({ username });
  const valid = user && await bcrypt.compare(password, user.password);
  res.json({ success: !!valid });
});

// VULNERABLE: reflecting untrusted input straight into HTML
app.get('/search-unsafe', (req, res) => {
  res.send(`<h2>Results for: ${req.query.term}</h2>`); // e.g. ?term=<script>...</script>
});

// FIXED: escape before inserting into HTML
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
}
app.get('/search-safe', (req, res) => {
  res.send(`<h2>Results for: ${escapeHtml(req.query.term || '')}</h2>`);
});

// React note: never do this with untrusted data —
// <div dangerouslySetInnerHTML={{ __html: userInput }} />
// React already escapes {expression} text content by default; prefer that.
```

**Output / Expected behaviour:**

```text
POST /api/auth/login-unsafe with { "username": "admin", "password": { "$ne": null } } logs in without a real password -demonstrating the vulnerability.
The same payload against /api/auth/login-safe is rejected with 400 because password is not a string.
GET /search-unsafe?term=<script>alert(1)</script> renders the tag in the page; /search-safe?term=... shows it as harmless escaped text.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Token expiry and re-login**

Reduce the JWT expiresIn from Lab 12 to '2m'. Demonstrate that a request made after expiry is rejected by requireAuth with 401, and that logging in again issues a fresh, working token.

**Lab Task 2: Security header/report checklist**

Enable helmet on the Lab 12 API and use browser developer tools (Network tab) to list which response headers helmet added (e.g. X-Content-Type-Options, X-Frame-Options). For each header, write one sentence on what it protects against.

**Lab Task 3: OWASP Top 10 mapping**

Produce a short table mapping each vulnerability class covered in this lab (weak password storage, NoSQL injection, XSS, CORS misconfiguration, missing rate limiting) to its corresponding OWASP Top 10 category, and note one additional Top 10 category not covered in this lab that the students should research on their own.
