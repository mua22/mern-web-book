# 8. Server-Side Rendering (SSR) and EJS Templating

Before we dive into the world of React and build complete Single Page Applications (SPAs), it is absolutely vital to understand how the internet worked for the first two decades of its life. 

Historically, web servers did not just send raw JSON data (like we did in previous chapters). Instead, the server was responsible for grabbing data from a database, physically stitching it into an HTML file on the server's CPU, and then sending that fully formed web page to the user's browser. This process is called **Server-Side Rendering (SSR)**.

In this chapter, we will learn how to build traditional SSR applications using a powerful templating engine called **EJS** (Embedded JavaScript), and explore how to handle HTML form submissions like a pro.

---

## 8.1 What is a Templating Engine?

If you try to write a dynamic HTML page using only `res.send()`, you will quickly find yourself writing horrific code that looks like this:

```javascript
// DO NOT DO THIS!
app.get('/profile', (req, res) => {
    const username = "MernNinja";
    res.send(`
        <html>
            <body>
                <h1>Welcome back, ${username}!</h1>
            </body>
        </html>
    `);
});
```

Mixing perfectly formatted HTML code inside messy JavaScript template strings is entirely unscalable. We need a way to keep our HTML files strictly separate from our JavaScript server logic, but still inject dynamic data into them before sending them off.

This is where a **Templating Engine** comes in. A templating engine allows you to write perfectly normal HTML files with special placeholders in them. The engine replaces those placeholders with real data at the exact millisecond the request arrives.

```mermaid
flowchart LR
    Data[(Raw JS Data)] --> Engine{Templating Engine <br/> (EJS)}
    Template[EJS Template File <br/> HTML with placeholders] --> Engine
    Engine -->|stitches together| HTML[Final Pure HTML String]
    HTML --> Browser[Delivered to Browser]
```

---

## 8.2 Setting up EJS (Embedded JavaScript)

There are many Node.js templating engines (Pug, Handlebars, Nunjucks), but EJS is the most loved by beginners because it requires almost zero new syntax. If you know HTML and you know basic JavaScript, you already know EJS!

### Step 1: Install EJS
EJS is just another third-party NPM package.
```bash
npm install ejs
```

### Step 2: Configure Express
We need to tell our Express application that we intend to use EJS to render our views.

```javascript
// server.js
const express = require('express');
const app = express();

// Tell Express: "We are using EJS as our official view engine."
app.set('view engine', 'ejs');

// Wait... where does Express look for these files?
// By default, Express will look for a folder named 'views' in your root directory!

app.listen(3000, () => console.log("Server running..."));
```

### Step 3: Create the Views Folder
Create a folder named `views` right next to your `server.js` file. Inside it, create `index.ejs`. Make sure the extension is `.ejs`, not `.html`!

---

## 8.3 The Data Lifecycle: From Server to EJS

To understand how data flows into your templates, let's look at the complete lifecycle of an EJS render.

1. **The Request:** The user navigates to `http://localhost:3000/profile`.
2. **The Controller:** Your Express route handler (`app.get`) intercepts the request. It queries the database or constructs an object containing the required data.
3. **The Injector:** You call `res.render('filename', dataObject)`. Express takes the `dataObject`, opens the EJS file, and injects the Javascript properties as local variables into the template.
4. **The Compilation:** EJS quickly scans the file, executes any loops or `if` statements, and replaces the variables with physical HTML text.
5. **The Response:** The fully formed, static HTML string is fired back to the user's browser.

### The Syntax of EJS
EJS uses special "squid" tags to inject JavaScript directly into HTML. You must remember the distinct difference between the two primary tags:

*   **`<% %>` (Scriptlet Tag):** Used for **Control Flow** (Logic). If you want to write an `if` statement or a `for` loop, you use this tag. **It does NOT print anything to the screen.**
*   **`<%= %>` (Output Tag):** Used to **Print Data**. Whatever variables or equations are inside this tag will be evaluated, converted to text, and printed directly into the HTML tree.

Let's write a comprehensive `views/profile.ejs` file to demonstrate variables, if-statements, and loops:

```html
<!-- views/profile.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My EJS Profile</title>
</head>
<body>
    <!-- 1. The Output Tag (Printing data) -->
    <h1>Welcome back, <%= username %>!</h1>
    
    <!-- You can execute basic JS math or methods inside the output tag -->
    <p>Your name in uppercase is: <%= username.toUpperCase() %></p>

    <!-- 2. The Scriptlet Tag (Control Flow: If Statements) -->
    <!-- Notice how we must open AND close the tags around the standard HTML -->
    <% if (isAdmin) { %>
        <div style="background-color: yellow; border: 1px solid red;">
            <p style="color: red;">Warning: You have Admin Privileges.</p>
        </div>
    <% } else { %>
        <p>You are a standard user.</p>
    <% } %>

    <h3>Your Recent Orders:</h3>
    <ul>
        <!-- 3. The Scriptlet Tag (Control Flow: For Loops) -->
        <% for(let i = 0; i < orders.length; i++) { %>
            <li>
                Order ID: <%= orders[i].id %> - Cost: $<%= orders[i].price %>
            </li>
        <% } %>
    </ul>
</body>
</html>
```

Now, let's go back to our `server.js` route handler and feed this template the exact data it expects:

```javascript
// server.js
app.get('/profile', (req, res) => {
    // 1. Fetch our data (Suppose this came from a database)
    const userProfile = {
        username: "MernNinja",
        isAdmin: true,
        orders: [
            { id: "A1", price: 45.00 },
            { id: "B2", price: 12.50 },
            { id: "C3", price: 99.99 }
        ]
    };

    // 2. Render the EJS file and pass the data object as the SECOND argument!
    res.render('profile', userProfile);
});
```

When you visit `/profile`, the output tags (`<%= username %>`) are magically replaced with "MernNinja", and the loop iterates three times, generating three distinct `<li>` elements on the fly!

---

## 8.4 Form Handling (The `POST` Request Lifecycle)

The primary reason we build server-rendered websites is to allow users to submit information back to us using HTML forms. 

Let's combine everything we've learned—Routing, Middlewares, and EJS—to build a completely functioning form submission system.

### 1. The Form Middleware (Crucial Step)

If a user submits an HTML form, the data is NOT sent as a nicely formatted JSON object. It is sent as a raw URL-encoded string. To tell our Express assembly line how to parse HTML form submissions, we must activate a specific middleware.

```javascript
// server.js
const express = require('express');
const app = express();

app.set('view engine', 'ejs');

// Middlewares
app.use(express.urlencoded({ extended: true })); // parses HTML <form> data!
app.use(express.json()); // parses standard JSON APIs
```

### 2. The Form View (`views/register.ejs`)

We create a simple EJS file containing our registration form. Pay very close attention to the `method` and `action` attributes on the `<form>` tag, and the `name` attributes on the inputs!

```html
<!-- views/register.ejs -->
<h1>Create an Account</h1>

<!-- Action: Where to send the data. Method: How to send the data (POST) -->
<form action="/submit-registration" method="POST">
    
    <label>Username:</label>
    <!-- The "name" attribute is what the server will use as the Object Key! -->
    <input type="text" name="username" required>
    
    <br><br>

    <label>Password:</label>
    <input type="password" name="password" required>
    
    <br><br>
    
    <button type="submit">Register Now</button>
</form>
```

### 3. The Route Handlers

We now need TWO routes. One `GET` route to serve the blank form to the user, and one `POST` route to catch the data when they click the submit button.

```javascript
// Route 1: Show the form to the user
app.get('/register', (req, res) => {
    res.render('register'); // Sends views/register.ejs
});

// Route 2: Catch the data sent from the form!
// Notice the path matches the "action" attribute on the HTML form
app.post('/submit-registration', (req, res) => {
    
    // Because of our express.urlencoded() middleware, 
    // the data is beautifully organized inside req.body!
    const { username, password } = req.body;
    
    console.log(`Received secure registration for: ${username}`);

    // In a real app, we would save this to MongoDB here.
    
    // Send back a success page!
    res.send(`<h1>Registration went perfectly, ${username}!</h1>`);
});
```

When you hit the submit button in your browser, the browser packages the data, sends a `POST` request to `/submit-registration`, the middleware catches it, builds `req.body`, and your server responds with success.

## Summary

In this section, we built our first traditional, fully-rendered web application:
1. **Server-Side Rendering (SSR)** is the classical method of physically stitching data into HTML files on your backend server before sending them to the browser.
2. We used **EJS (Embedded JavaScript)**, a popular templating engine that allows us to use `<%if%>` and `<%for%>` loops directly inside HTML to generate dynamic views.
3. We used **`res.render('filename', data)`** instead of `res.send()` to execute our templates.
4. We learned how to process HTML **Forms** by combining the HTML `method` and `action` attributes with the crucial `app.use(express.urlencoded())` middleware.

### Looking Forward: SSR vs CSR
It is crucial to note that this course focuses deeply on **both** Server-Side Rendering (SSR) and Client-Side Rendering (CSR). 

While the ultimate goal of the modern MERN stack is to replace EJS entirely with **React.js** to build lightning-fast Client-Side SPAs, mastering SSR guarantees you fully understand the historical foundations of the web, SEO mechanics, and how traditional secure form submissions work under the hood. 

But before we can build fully dynamic websites in *either* framework, we must master the most critical piece of the backend: how to save all this form data permanently so it isn't erased every time we turn off the server. It's time to learn about Databases.
