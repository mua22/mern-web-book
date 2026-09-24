---
title: "Lab 08: jQuery, AJAX and JSON"
---

# Lab 08: jQuery, AJAX and JSON

## Objective:

To understand the use of jQuery, AJAX, and JSON in web applications: how jQuery simplifies client-side programming, how AJAX communicates with the server without reloading the page, and how JSON exchanges structured data between client and server.

## Activity Outcomes:

- Learn the basic concepts and syntax of jQuery.
- Select and manipulate HTML elements using jQuery.
- Handle events using jQuery.
- Understand AJAX and asynchronous communication between client and server.
- Send and receive data using AJAX.
- Understand the structure and use of JSON data; parse and display it dynamically.

## 1) Useful Concepts

jQuery is a fast, lightweight JavaScript library that simplifies HTML document traversal, event handling, animation, and AJAX interactions with a concise syntax. AJAX (Asynchronous JavaScript and XML) lets a page send/receive data from a server without a full reload. JSON (JavaScript Object Notation) is the lightweight data format most commonly exchanged over AJAX.

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Medium | CLO-4 |
| Activity 2 | 20 Minutes | Medium | CLO-4 |
| Activity 3 | 20 Minutes | Medium | CLO-4 |
| Activity 4 | 20 Minutes | Medium | CLO-4 |
| Activity 5 | 25 Minutes | Medium | CLO-4 |
| Activity 6 | 25 Minutes | Medium | CLO-4 |

### Activity 1: jQuery event handling and DOM manipulation

*Create buttons to hide an element, show an element, and change the text of an element.*

**Solution:**

```html
<h2 id="title">jQuery Event Handling</h2>
<p id="para">jQuery makes JavaScript programming easier.</p>
<button id="hide">Hide</button>
<button id="show">Show</button>
<button id="change">Change Text</button>

<script>
  $(document).ready(function() {
    $("#hide").click(function() { $("#para").hide(); });
    $("#show").click(function() { $("#para").show(); });
    $("#change").click(function() { $("#para").text("Text has been changed using jQuery!"); });
  });
</script>
```

### Activity 2: DOM manipulation and validation using jQuery

*Create a form with Name and Email fields. Use jQuery to validate that both fields are not empty when the user submits the form.*

**Solution:**

```html
<form id="userForm">
  <label for="name">Name:</label><input type="text" id="name"><br>
  <label for="email">Email:</label><input type="email" id="email"><br>
  <button type="submit">Submit</button>
</form>
<p id="error" style="color:red;"></p>

<script>
  $(document).ready(function() {
    $('#userForm').submit(function(event) {
      event.preventDefault();
      const name = $('#name').val(), email = $('#email').val();
      if (!name || !email) { $('#error').text('Both fields are required.'); }
      else { $('#error').text(''); alert('Form submitted successfully!'); }
    });
  });
</script>
```

### Activity 3: Displaying a JSON object with jQuery

*Create a JSON object and display its information using jQuery.*

**Solution:**

```html
<div id="student"></div>
<script>
  $(document).ready(function() {
    const student = { name: "Muhammad Tariq", age: 45, marks: 85 };
    $("#student").html(
      "<p>Name: " + student.name + "</p>" +
      "<p>Age: " + student.age + "</p>" +
      "<p>Marks: " + student.marks + "</p>"
    );
  });
</script>
```

### Activity 4: Fetch data using AJAX

*Create a button that, when clicked, fetches a list of users from a public API and displays the data in a table.*

**Solution:**

```html
<button id="fetchUsers">Fetch Users</button>
<table border="1" id="userTable"><tr><th>Name</th><th>Email</th></tr></table>

<script>
  $(document).ready(function() {
    $('#fetchUsers').click(function() {
      $.ajax({
        url: 'https://jsonplaceholder.typicode.com/users',
        method: 'GET',
        success: function(data) {
          data.forEach(user => {
            $('#userTable').append(`<tr><td>${user.name}</td><td>${user.email}</td></tr>`);
          });
        },
        error: function() { alert('Error fetching users.'); }
      });
    });
  });
</script>
```

### Activity 5: Retrieving JSON data from a local server without reloading

*Use AJAX to retrieve JSON data from a small Express server.*

**Solution:**

```javascript
// Server-side code
const express = require('express');
const app = express();
app.use(express.static('public'));
app.get('/students', (req, res) => {
  res.json([
    { name: "Baloch", age: 20, marks: 85 },
    { name: "Ahmed", age: 21, marks: 90 }
  ]);
});
app.listen(3000, () => console.log("Server running at http://localhost:3000"));

// Client-side code (public/index.html)
$("#loadStudents").click(function() {
  $.ajax({
    url: "/students", method: "GET",
    success: function(data) {
      let output = "";
      data.forEach(s => output += `<p>Name: ${s.name} | Age: ${s.age} | Marks: ${s.marks}</p>`);
      $("#result").html(output);
    },
    error: function() { $("#result").text("Unable to retrieve student data."); }
  });
});
```

### Activity 6: Submitting a registration form via AJAX

*Create a registration form and submit the form data to the server using AJAX.*

**Solution:**

```javascript
// Client-side
$("#registerForm").submit(function(event) {
  event.preventDefault();
  const student = { name: $("#name").val(), email: $("#email").val() };
  $.ajax({
    url: "/register", method: "POST",
    contentType: "application/json", data: JSON.stringify(student),
    success: function(response) { $("#message").html("<h3>" + response.message + "</h3>"); },
    error: function() { $("#message").text("Registration failed."); }
  });
});

// Server-side
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.post('/register', (req, res) => {
  console.log("Name:", req.body.name, "Email:", req.body.email);
  res.json({ message: "Registration Successful" });
});
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Product upload with validation**

Create a form to upload a product's details (name, price, description). Use AJAX to send the data to a server, validate it using jQuery, and ensure the price is a positive number.

**Lab Task 2: Filterable posts list**

Fetch and display a list of posts from a server using AJAX. Implement a search bar to filter posts by title using jQuery.

**Lab Task 3: Weather lookup app**

Build a weather application where the user enters a city name, and an AJAX request fetches current weather data from an API (e.g. OpenWeatherMap). Display the temperature and weather description dynamically.
