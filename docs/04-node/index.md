# Node.js & Express.js Backend Development

## Overview

Node.js allows you to run JavaScript on the server side, and Express.js is a framework for building web applications and APIs.

## What You'll Learn

- Node.js runtime and fundamentals
- NPM (Node Package Manager)
- Creating REST APIs with Express.js
- Routing and middleware
- Server-side rendering
- MongoDB and Mongoose for databases
- Authentication and authorization
- Cookies and sessions

## Key Topics

### Node.js Fundamentals
- Event-driven architecture
- Modules and package management
- File system operations
- Asynchronous programming

### Express.js Framework
- Setting up an Express server
- Routing and request/response handling
- Middleware concepts
- Error handling

### Database Integration
- MongoDB basics
- Mongoose ODM
- Schema design and validation
- CRUD operations

### Security & Authentication
- User authentication
- Password hashing
- JWT tokens
- Authorization and access control
- Sessions and cookies

## Getting Started

Basic Express.js server:

```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.post('/api/users', (req, res) => {
    const user = req.body;
    res.status(201).json({ message: 'User created', user });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

## Next Steps

Learn to build scalable APIs, work with databases, and implement proper authentication before moving to frontend development.
