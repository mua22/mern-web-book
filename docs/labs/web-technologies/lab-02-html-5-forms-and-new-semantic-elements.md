---
title: "Lab 02: HTML-5 Forms and New Semantic Elements"
---

# Lab 02: HTML-5 Forms and New Semantic Elements

## Objective:

- Use HTML5 form input types that go beyond plain text.
- Apply built-in HTML5 form validation without writing JavaScript.
- Group related form controls using fieldset and legend.
- Understand and correctly apply HTML5 semantic elements.
- Structure a full webpage layout using semantic tags instead of generic divs.

## Activity Outcomes:

- HTML5 input tags
- HTML5 forms
- HTML5 semantic elements

Instructor Note: As pre-lab activity, read Chapter 3 from "Web Design Playground: HTML & CSS the Interactive Way", Paul McFedries, 2019.

## 1) Useful Concepts

HTML forms pass data to a server. The &lt;form&gt; tag encloses input elements; its key attributes are action (URL to submit to), method ("get" or "post"), and target.

**Common input tags:**

```html
<input type="text" name="textfield" value="initial value">
<textarea name="textarea" cols="24" rows="2">Hello</textarea>
<input type="password" name="password">
<input type="submit" value="Submit">  <input type="reset" value="Reset">  <input type="button" value="Push Me">
<input type="radio" name="gender" value="male"> Male
<input type="checkbox" name="checkbox" value="checkbox" checked>
<select name="select">
  <option value="red">red</option>
  <option value="green">green</option>
</select>
```

**HTML5 attributes and elements:**

- required -makes an input field mandatory; pattern -validates input against a regex; readonly / disabled -restrict editing; autocomplete -suggests previous entries.
- &lt;datalist&gt; -provides predefined autocomplete suggestions for a text input.
- type="email", type="date", type="color", type="number" -specialised input fields with built-in validation/UI.

```html
<label for="color">My favorite color:</label>
<input type="text" id="color" name="color" list="colors">
<datalist id="colors">
  <option value="Red"><option value="Black"><option value="Blue"><option value="Green">
</datalist>

<input type="email" name="email">
<input type="date" name="dob">
<input type="color" name="favcolor">
<input type="number" name="age" min="18" max="60">
```

**HTML5 Semantic elements:**

Before HTML5, layout relied almost entirely on generic &lt;div&gt; containers. HTML5 added elements that describe what a section of the page means, improving accessibility and search-engine understanding:

- &lt;header&gt; -introductory content or a site's masthead
- &lt;nav&gt; -a block of primary navigation links
- &lt;main&gt; -the dominant, unique content of the page (one per page)
- &lt;section&gt; -a thematic grouping of content, usually with its own heading
- &lt;article&gt; -a self-contained piece of content, e.g. a blog post
- &lt;aside&gt; -content tangentially related to the surrounding content
- &lt;figure&gt; / &lt;figcaption&gt; -an image (or other media) with an attached caption
- &lt;footer&gt; -footer content for its nearest section or the whole page
- &lt;time datetime="..."&gt; -a machine-readable date or time

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 30 Minutes | Medium | CLO-4 |
| Activity 2 | 30 Minutes | Medium | CLO-4 |
| Activity 3 | 30 Minutes | Medium | CLO-4 |

### Activity 1: Identity form

*Make a form with name, gender (radio buttons), password and a submit option. Use text boxes for input fields and buttons for the submit option.*

**Solution:**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Get Identity</title></head>
<body>
  <p><b>Who are you?</b></p>
  <form method="post" action="">
    <p><label for="name">Name:</label> <input type="text" id="name" name="name"></p>
    <p><label for="password">Password:</label> <input type="password" id="password" name="password"></p>
    <p>Gender:
      <label><input type="radio" name="gender" value="m"> Male</label>
      <label><input type="radio" name="gender" value="f"> Female</label>
    </p>
    <p><input type="submit" value="Submit"> <input type="reset" value="Reset"></p>
  </form>
</body>
</html>
```

### Activity 2: Signup/registration form

*Create a student registration form using several HTML5 input types.*

**Solution:**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Student Registration Form</title></head>
<body>
  <h1>Student Registration Form</h1>
  <form method="post" action="">
    <p><label for="fullname">Full Name:</label> <input type="text" id="fullname" name="fullname" required></p>
    <p><label for="email">Email:</label> <input type="email" id="email" name="email" required></p>
    <p><label for="password">Password:</label> <input type="password" id="password" name="password" required></p>
    <p><label for="dob">Date of Birth:</label> <input type="date" id="dob" name="dob"></p>
    <p>Gender:
      <label><input type="radio" name="gender" value="male"> Male</label>
      <label><input type="radio" name="gender" value="female"> Female</label>
    </p>
    <p><label for="color">Favorite Color:</label> <input type="color" id="color" name="color"></p>
    <p><label for="age">Age:</label> <input type="number" id="age" name="age" min="15" max="60"></p>
    <p>Hobbies:<br>
      <label><input type="checkbox" name="hobby" value="reading"> Reading</label>
      <label><input type="checkbox" name="hobby" value="coding"> Coding</label>
    </p>
    <p><label for="about">About Yourself:</label><br>
      <textarea id="about" name="about" rows="4" cols="40"></textarea></p>
    <p><input type="submit" value="Register"> <input type="reset" value="Reset"></p>
  </form>
</body>
</html>
```

### Activity 3: Using semantic elements

*Recreate the layout of a simple news/blog homepage using only semantic tags: a &lt;header&gt; containing a site title and a &lt;nav&gt; with four links; a &lt;main&gt; containing two &lt;article&gt; elements, each with its own &lt;figure&gt;/&lt;figcaption&gt;; one &lt;aside&gt; listing three 'Related Links'; and one &lt;footer&gt; with a copyright line built using &lt;time&gt;.*

**Solution:**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Campus Times</title></head>
<body>
  <header>
    <h1>Campus Times</h1>
    <nav>
      <a href="#">Home</a> <a href="#">Sports</a> <a href="#">Tech</a> <a href="#">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>University Hosts Final Year Project Exhibition</h2>
      <figure>
        <img src="exhibition.jpg" alt="Students at the tech fest">
        <figcaption>Students showcase final-year projects.</figcaption>
      </figure>
      <p>The Computer Science department held its annual Final Year Project Exhibition...</p>
    </article>
    <article>
      <h2>Football Team Wins Inter-University Cup</h2>
      <p>The university football team secured first place...</p>
    </article>
  </main>
  <aside>
    <h3>Related Links</h3>
    <ul><li><a href="#">Admissions</a></li><li><a href="#">Events Calendar</a></li><li><a href="#">Alumni Network</a></li></ul>
  </aside>
  <footer>
    <p>&copy; <time datetime="2026">2026</time> Campus Times. All rights reserved.</p>
  </footer>
</body>
</html>
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: File upload and search field**

Extend registration.html by adding a file-upload field for a CV (accept only .pdf and .doc files) and a search field styled with type="search" and a placeholder of 'Search programs...'.

**Lab Task 2: Personal profile page using semantic elements**

Create a personal profile page using different HTML5 semantic elements, as demonstrated in Activity 3.
