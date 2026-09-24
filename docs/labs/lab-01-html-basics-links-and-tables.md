---
title: "Lab 01: HTML Basics, Links and Tables"
---

# Lab 01: HTML Basics, Links and Tables

## Objectives:

- Understand the basic structure and syntax of an HTML5 document.
- Use heading, paragraph, and text-formatting tags correctly.
- Create ordered and unordered lists.
- Create hyperlinks -internal, external, and email -and distinguish absolute from relative href values.
- Build and format tables, including merged cells using rowspan and colspan.
- Add images and videos to web pages.

## Activity Outcomes:

- Design a basic web page using HTML tags.
- Add text formatting tags.
- Add lists to web pages.
- Link pages together using internal, external and email links.
- Build and format tables, including merged header cells.
- Add images and videos to web pages.

**Tools / Software Required:**

- A text editor -VS Code, Sublime Text, or Notepad++
- A modern web browser -Google Chrome or Mozilla Firefox

Instructor Note: As pre-lab activity, read Chapters 1–3 from "Web Design Playground: HTML & CSS the Interactive Way", Paul McFedries, 2019.

## 1) Useful Concepts

| Tag | Description |
|---|---|
| &lt;!DOCTYPE&gt; | Defines the document type |
| &lt;html&gt; | Defines an HTML document |
| &lt;head&gt; / &lt;title&gt; | Metadata / document title |
| &lt;body&gt; | Defines the document's body |
| &lt;h1&gt; to &lt;h6&gt; | Defines HTML headings |
| &lt;p&gt;, &lt;br&gt;, &lt;hr&gt; | Paragraph; single line break; thematic break |
| &lt;a href="..."&gt; | Creates a hyperlink. Absolute URL (e.g. https://example.com/page.html) points to a full address on the web; relative URL (e.g. about.html or ../images/pic.jpg) is resolved against the current page's location and is the right choice for links within the same site. |
| &lt;img src="..."&gt;, &lt;video src="..."&gt; | Inserts an image / video |
| &lt;ol&gt;, &lt;ul&gt;, &lt;li&gt; | Ordered list, unordered list, list item |
| &lt;dl&gt;, &lt;dt&gt;, &lt;dd&gt; | Description list; term; description |
| &lt;table&gt;, &lt;tr&gt;, &lt;th&gt;, &lt;td&gt; | Table; row; header cell; data cell |
| &lt;thead&gt;, &lt;tbody&gt;, &lt;tfoot&gt; | Groups header / body / footer rows of a table |
| rowspan, colspan | Merge a cell across multiple rows / columns |
| &lt;iframe&gt; | Embeds another document within the current page |
| &lt;!-- ... --&gt; | Comment |

**HTML Basic Structure:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title</title>
  </head>
  <body>
    <!-- page content goes here -->
  </body>
</html>
```

**How to create a basic web page:**

Step 1: Open a text editor. Step 2: Write your HTML code. Step 3: Save the file with the .html extension, e.g., webpage.html. Step 4: Open the HTML file in a browser. Step 5: Make changes → Save → Refresh the browser.

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 10 Minutes | Low | CLO-4 |
| Activity 2 | 20 Minutes | Low | CLO-4 |
| Activity 3 | 30 Minutes | Low | CLO-4 |
| Activity 4 | 30 Minutes | Low | CLO-4 |

### Activity 1: A personal introduction page

*Create a page that introduces yourself. It must include: one &lt;h1&gt; main heading with your name, three &lt;p&gt; paragraphs (about you, your education, and your interests), an unordered list of at least four hobbies, and an ordered list of your top three academic achievements.*

**Solution:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Muhammad Ali Khan</title>
</head>
<body>
  <h1>Muhammad Ali Khan</h1>
  <p>I am a second-semester BS Computer Science student.</p>
  <p>I completed my intermediate education at ABC College and am now pursuing a degree in Computer Science.</p>
  <p>I am interested in programming, web development, and photography.</p>

  <h2>My Hobbies</h2>
  <ul>
    <li>Reading</li>
    <li>Web Development</li>
    <li>Photography</li>
    <li>Cricket</li>
  </ul>

  <h2>My Top Academic Achievements</h2>
  <ol>
    <li>Dean's List, Fall 2025</li>
    <li>1st Position -Intermediate (Pre-Engineering)</li>
    <li>Winner, University Coding Challenge 2025</li>
  </ol>
</body>
</html>
```

### Activity 2: Adding internal, external and email links

*Following Activity 1, add three types of links: internal, external, and email. Also demonstrate the difference between an absolute and a relative link.*

**Solution:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Muhammad Ali Khan</title>
</head>
<body>
  <h1>Muhammad Ali Khan</h1>
  <h2>My Links</h2>

  <!-- Internal link: an in-page bookmark using a relative fragment reference -->
  <p><a href="#about">Go to About Me</a></p>

  <!-- External link: an absolute URL, points to a different site entirely -->
  <p><a href="https://www.google.com">Visit Google</a></p>

  <!-- Relative link: points to another page in the SAME site/folder, no domain needed -->
  <p><a href="portfolio.html">View My Portfolio</a></p>

  <!-- Email link -->
  <p><a href="mailto:muhammadali@example.com">Email Me</a></p>

  <hr>

  <h2 id="about">About Me</h2>
  <p>My name is Muhammad Ali Khan. I am a second-semester BS Computer Science student.</p>
</body>
</html>
```

**Output / Expected behaviour:**

```text
#about is an internal (relative, same-page) link.
https://www.google.com is an absolute (external) link.
portfolio.html is a relative (same-site) link -it works regardless of domain, which is why site-internal navigation should normally use relative paths.
```

### Activity 3: Adding an educational-history table

*Now add a table describing your educational history.*

**Solution:**

```html
<table border="1">
  <tr>
    <th>Degree</th>
    <th>Institute</th>
    <th>Year</th>
  </tr>
  <tr>
    <td>BS Computer Science</td>
    <td>ABC University</td>
    <td>2025 - Present</td>
  </tr>
  <tr>
    <td>Intermediate</td>
    <td>ABC College</td>
    <td>2024</td>
  </tr>
  <tr>
    <td>Matriculation</td>
    <td>ABC School</td>
    <td>2022</td>
  </tr>
</table>
```

### Activity 4: Adding an image

*Following Activities 1–3, add an image to the web page.*

**Solution:**

```html
<img src="profile.jpg" alt="Muhammad Ali Khan" width="250">
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Semester Result Card**

Create result.html containing a 'Result Card' table with columns Subject, Credit Hours, Marks Obtained, and Grade for five subjects. Use colspan to add a merged title row reading 'Semester Result -Fall 2026' above the column headers.

**Lab Task 2: One-page portfolio with bookmarks**

Create portfolio.html -a one-page personal portfolio with at least three internal bookmark links (About, Projects, Contact) that jump to sections using id attributes, plus one external link that opens in a new tab (target="_blank").

**Lab Task 3: COMSATS library page**

Create a webpage for the COMSATS library. Add lists and apply text formatting to your page. Use videos and images of the library and add them to your page.
