# Building a RESTful API with Express and Mongoose

In Chapter 9, we built an elegant MVC architecture using Express, but we had to rely on a fake JavaScript array because we had no database. In Chapter 11, we mastered Mongoose, executing powerful queries natively, but our code wasn't connected to the web.

It is time to marry the two technologies. In this chapter, we will fuse Express routing, the MVC pattern, and Mongoose query power to build a professional, fully functional backend: a **RESTful API**.

This is the ultimate culmination of your Node.js backend journey. 

---

## What is a RESTful API?

**REST** stands for *Representational State Transfer*. While it sounds incredibly academic, REST is simply a standardized set of rules (an architectural style) for how web applications should communicate over HTTP.

If you follow REST principles, any developer in the world—whether they are building a React website, an iOS App, or an Android App—will instantly know how to interact with your server without asking you for instructions.

The core philosophy of REST revolves around mapping standard HTTP Verbs to standard Database CRUD operations on a specific "Resource" (like `users` or `products`).

Here is the golden RESTful mapping matrix you must memorize:

```mermaid
graph LR
 subgraph HTTP Verb
 GET
 POST
 PUT
 DELETE
 end

 subgraph URL Endpoint
 E1[/api/users/]
 E2[/api/users/:id]
 end

 subgraph Mongoose Action
 READ[User.find()]
 CREATE[User.create()]
 UPDATE[User.findByIdAndUpdate()]
 DEL[User.findByIdAndDelete()]
 end

 GET --- E1 --> READ
 POST --- E1 --> CREATE
 GET --- E2 -.->|Find One| READ
 PUT --- E2 --> UPDATE
 DELETE --- E2 --> DEL
```

Notice the URLs are always plural nouns (`/users`), never verbs (`/getUsers`). The HTTP verb *is* the action. Let's implement this matrix!

---

## The Complete Architecture

To keep our enterprise application modular, we will utilize three files:
1. `models/User.js`: Our Mongoose Schema.
2. `controllers/userController.js`: Where Express and Mongoose fuse together using `async/await`.
3. `routes/userRoutes.js`: Where we map URLs to the Controller.

Assume our `models/User.js` file is exactly the same as the previous chapter (requiring a `username` and `email`). Let's look at the Controller.

---

## The REST Controller (Express meets Mongoose)

When mapping endpoints, database queries take time to execute over the network. Therefore, every single route handler must be an `async` function wrapped in a `try / catch` block. If Mongoose fails to find a document or rejects an invalid email, we catch the error and send a clean JSON response back to the client.

```javascript
// controllers/userController.js
const User = require('../models/User');

// --- READ (GET /api/users) ---
exports.getAllUsers = async (req, res) => {
 try {
 const users = await User.find();
 res.status(200).json({ status: "Success", results: users.length, data: users });
 } catch (err) {
 res.status(500).json({ status: "Error", message: err.message });
 }
};

// --- READ ONE (GET /api/users/:id) ---
exports.getSingleUser = async (req, res) => {
 try {
 const user = await User.findById(req.params.id);
 
 // Critical: If the ID format is correct but the user doesn't exist, Mongoose returns null.
 if (!user) {
 return res.status(404).json({ status: "Fail", message: "User not found." });
 }
 res.status(200).json({ status: "Success", data: user });
 } catch (err) {
 // If they provide a malformed ID (not 24 characters), Mongoose throws an error.
 res.status(400).json({ status: "Fail", message: "Invalid ID format" });
 }
};

// --- CREATE (POST /api/users) ---
exports.createUser = async (req, res) => {
 try {
 // We pass the incoming Form/JSON data (req.body) directly to Mongoose
 const newUser = await User.create(req.body);
 
 res.status(201).json({ status: "Success", data: newUser });
 } catch (err) {
 // Validation Errors (e.g. missing username) get caught here
 res.status(400).json({ status: "Fail", message: err.message });
 }
};

// --- UPDATE (PUT /api/users/:id) ---
exports.updateUser = async (req, res) => {
 try {
 // new: true returns the updated document. runValidators ensures the new data is valid!
 const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
 new: true,
 runValidators: true 
 });

 if (!updatedUser) {
 return res.status(404).json({ status: "Fail", message: "User not found." });
 }
 res.status(200).json({ status: "Success", data: updatedUser });
 } catch (err) {
 res.status(400).json({ status: "Fail", message: err.message });
 }
};

// --- DELETE (DELETE /api/users/:id) ---
exports.deleteUser = async (req, res) => {
 try {
 const deletedUser = await User.findByIdAndDelete(req.params.id);
 
 if (!deletedUser) {
 return res.status(404).json({ status: "Fail", message: "User not found." });
 }
 
 // 204 No Content signifies successful deletion
 res.status(204).json({ status: "Success", data: null });
 } catch (err) {
 res.status(400).json({ status: "Fail", message: err.message });
 }
};
```

---

## The Router Setup

Now that our Controller flawlessly handles the massive data logic, parsing the `req` object, and utilizing Mongoose, our router file becomes incredibly tiny.

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// The RESTful mapping in pure, readable format
router.route('/')
 .get(userController.getAllUsers)
 .post(userController.createUser);

router.route('/:id')
 .get(userController.getSingleUser)
 .put(userController.updateUser)
 .delete(userController.deleteUser);

module.exports = router;
```
*(Notice the elegant use of `router.route()`. This allows us to chain multiple HTTP verbs onto a specific URL path without rewriting the URL).*

## Summary

You did it. You have officially constructed a professional, RESTful MERN backend API!

1. **REST** revolves around predictable resource-matching. We match predictable URLs (`/api/users`) with distinct HTTP Verbs to enforce predictable database behavior.
2. The combination of **Express and Mongoose** is exceptionally powerful. Express handles the `req` parameters and response Headers, dynamically feeding the data payloads directly into Mongoose `create`, `find`, and `update` queries.
3. **Robust Error Handling** using `try/catch` is the critical component of any production API. A server shouldn't silently crash when bad data occurs; it should elegantly catch Mongoose Schema Validation errors and send back a standard, legible HTTP 400 JSON status response to instruct the frontend on what to fix.

### The Ultimate Milestone
Your backend server is completely finished! It accepts internet traffic, validates payloads, saves data permanently, and gracefully handles complex errors. 

The question now is: How do actual humans interact with this API visually? We are finally ready to introduce the grand crown jewel of the MERN stack—it is time to build dynamic, interactive, ultra-fast frontend user interfaces using **React.js**.
