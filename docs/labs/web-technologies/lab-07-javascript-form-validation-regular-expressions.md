---
title: "Lab 07: JavaScript Form Validation, Regular Expressions"
---

# Lab 07: JavaScript Form Validation, Regular Expressions

## Objective:

To build interactive web interfaces using DOM manipulation and events, validate and parse form data with regular expressions and JSON, and perform asynchronous data exchange using Promises and the Fetch API.

## Activity Outcomes:

- Select, create, update and remove DOM nodes; apply classes/styles and use the event object.
- Explain capturing, bubbling and delegation; distinguish preventDefault from stopPropagation.
- Construct regular expressions using classes, quantifiers, anchors, groups, alternatives, backreferences and flags.
- Validate input with useful error feedback and exchange structured data using JSON.stringify/JSON.parse.
- Trace asynchronous execution and implement Promise chains, Promise.all, async/await and Fetch GET/POST with error handling.

Instructor note: the asynchronous JavaScript activities (4–5) depend on the async/Promises/Fetch lecture; schedule this part of the lab only after that lecture has been delivered, or run a short preparatory demonstration first.

## 1) Useful Concepts

**DOM selection and manipulation:**

| API | Use |
|---|---|
| getElementById / querySelector(All) | Select one / the first / all matching elements |
| createElement, append | Create an element and insert it into a parent |
| textContent, value | Read/write text safely; read a form control's value |
| classList.add/remove/toggle | Manage CSS classes without replacing the whole attribute |

```javascript
const list = document.querySelector("#topics");
const item = document.createElement("li");
item.textContent = "DOM practice";
list.append(item);
item.classList.add("selected");
```

**Events, propagation and delegation:**

event.preventDefault() cancels the default action (e.g. form navigation); it does not stop propagation. event.stopPropagation() halts further propagation but does not cancel the default action. Delegation places one listener on a parent and inspects event.target, so it can handle children created later.

```javascript
form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  // validate / update the DOM / send a request here
});
```

**Regular expressions:**

| Construct | Meaning |
|---|---|
| [A-Z], \d, \w, \s | Character range; digit; word char; whitespace |
| *, +, ?, {n,m} | Zero or more; one or more; optional; bounded count |
| ^ and $ | Start and end of input (or line, with the m flag) |
| ( ... ), (?: ... ) | Capturing / non-capturing group |
| \| | Alternation |
| g, i, m flags | Global search; ignore case; multiline anchors |

```javascript
const codePattern = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
console.log(codePattern.test("1AB23CD456")); // true

regex.test(text)      // boolean
regex.exec(text)      // full match + capture groups, or null
text.match(regex)     // matches or null
text.replace(regex, "$1")  // $1 refers to the first capture group
```

**JSON:**

```javascript
const json = JSON.stringify({ name: "Ayesha", active: true });
const restored = JSON.parse(json);
// JSON does not preserve methods, undefined values, or circular references
```

**Promises, async/await and Fetch:**

```javascript
async function getCourses() {
  const response = await fetch("/api/courses");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

Promise.all([later("courses", 500), later("settings", 300)])
  .then(values => console.log(values.join(", ")))
  .catch(err => console.log(err.message));
```

fetch() normally resolves even for HTTP errors like 404 -always check response.ok before parsing the body. Parsing (.json()) is itself asynchronous and can fail on malformed data.

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Medium | CLO-4 |
| Activity 2 | 15 Minutes | Medium | CLO-4 |
| Activity 3 | 30 Minutes | Medium | CLO-4 |
| Activity 4 | 15 Minutes | Medium | CLO-4 |
| Activity 5 | 25 Minutes | High | CLO-4 |

### Activity 1: Dynamic topic list with delegated events

*Build a list that adds topics, marks them complete and removes them, using one delegated click listener on the parent &lt;ul&gt;.*

**Solution:**

```javascript
const form = document.getElementById("topicForm");
const list = document.querySelector("#topics");

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.querySelector("#topic").value.trim();
  if (!title) return;
  const item = document.createElement("li");
  item.innerHTML = `<span>${title}</span>
    <button data-action="done">Done</button>
    <button data-action="remove">Remove</button>`;
  list.append(item);
  form.reset();
});

list.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = button.closest("li");
  if (button.dataset.action === "remove") item.remove();
  else item.classList.toggle("done");
});
```

### Activity 2: Regex validation and text processing

*Validate a fictional workshop code, extract its components, remove repeated words, split topic tags, and search multiline text.*

**Solution:**

```javascript
const codePattern = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
console.log(codePattern.test("1AB23CD456")); // true

const codeParts = /^([1-4])([A-Z]{2})(\d{2})([A-Z]{2})(\d{3})$/;
console.log(codeParts.exec("1AB23CD456").slice(1).join(" | ")); // 1 | AB | 23 | CD | 456

console.log("web WEB and code code".replace(/\b([A-Za-z]+)\s+\1\b/gi, "$1")); // web and code

const tags = "HTML, CSS ; JavaScript".trim().split(/\s*[,;]\s*/);
console.log(tags); // ["HTML", "CSS", "JavaScript"]
```

**Output / Expected behaviour:**

```text
true
1 | AB | 23 | CD | 456
web and code
['HTML', 'CSS', 'JavaScript']
```

### Activity 3: Workshop form validation

*Validate name, email, workshop code, and matching passwords with useful error feedback; preview only valid, non-password data as JSON.*

**Solution:**

```javascript
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codePattern = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
function passwordOK(v) {
  return v.length >= 10 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v) && /[!@#$%]/.test(v) && !/\s/.test(v);
}
function validate(fields) {
  const errors = {};
  if (fields.fullName.trim().length < 2) errors.fullName = "Enter a name of 2+ characters.";
  if (!emailPattern.test(fields.email.trim())) errors.email = "Enter a valid email.";
  if (!codePattern.test(fields.code.trim())) errors.code = "Use the exact workshop code format.";
  if (!passwordOK(fields.password)) errors.password = "10+ chars, upper/lowercase, digit, symbol, no spaces.";
  if (fields.confirm !== fields.password) errors.confirm = "Passwords must match.";
  return errors;
}
// On successful submit: build a payload WITHOUT password/confirm and JSON.stringify it for preview.
```

### Activity 4: Promise sequencing and concurrent work

*Demonstrate synchronous vs microtask vs timer-task ordering, a Promise chain with error handling, and Promise.all for concurrent requests.*

**Solution:**

```javascript
console.log("A: synchronous start");
setTimeout(() => console.log("D: timer task"), 0);
Promise.resolve().then(() => console.log("C: promise microtask"));
console.log("B: synchronous end");
// Output order: A, B, C, D

function later(value, delay, fail = false) {
  return new Promise((resolve, reject) => setTimeout(() => fail ? reject(new Error(`Unavailable: ${value}`)) : resolve(value), delay));
}
later(6, 100).then(v => v * 2).then(v => console.log(`Chain result: ${v}`))
  .catch(err => console.log(`Handled: ${err.message}`));

async function loadTogether() {
  const values = await Promise.all([later("courses", 500), later("settings", 300)]);
  console.log(`Together: ${values.join(", ")}`); // input order preserved regardless of which resolves first
}
loadTogether();
```

**Output / Expected behaviour:**

```text
A: synchronous start
B: synchronous end
C: promise microtask
D: timer task
Chain result: 12
Together: courses, settings
```

### Activity 5: Fetch GET/POST with JSON

*Load a list of courses via GET, populate a dropdown, then submit a registration via POST and display the returned record.*

**Solution:**

```javascript
async function requestJSON(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

loadButton.addEventListener("click", async () => {
  try {
    const courses = await requestJSON("/api/courses");
    courses.forEach(c => select.append(new Option(c.title, c.id)));
  } catch (err) { status.textContent = `Could not load courses: ${err.message}`; }
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    const saved = await requestJSON("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.value, email: emailInput.value, course: select.value })
    });
    status.textContent = `Created demo registration ${saved.id}.`;
  } catch (err) { status.textContent = `Submission failed: ${err.message}`; }
});
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Workshop registration with a review list**

Extend Activity 3 with a programme selector (BSCS/BSSE) and a topic-tags field (comma/semicolon separated, trimmed, empty tags discarded). A valid submission creates a review-list entry via safe DOM creation (textContent, never innerHTML with untrusted input), excluding both password fields from the stored/displayed data. Provide one delegated listener for removing entries.

**Lab Task 2: Resilient course registration interface**

Extend Activity 5 to load courses and a settings.json file concurrently with Promise.all; use the settings' registrationOpen flag to enable/disable the POST button, and handle HTTP, JSON-parsing and network failures distinctly with visible recovery.
