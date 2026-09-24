---
title: "Lab 06: JavaScript Basics"
---

# Lab 06: JavaScript Basics

## Objective:

To apply core JavaScript (ES6+) concepts and built-in methods when writing reusable, modular programs that process data for web applications.

## Activity Outcomes:

- Embed and run scripts; choose declarations and data types; apply operators and control flow.
- Explain scope, hoisting, the temporal dead zone, function forms, this binding and closures.
- Use default/rest parameters, spread, destructuring, objects, arrays, template literals and ES6 modules.
- Select suitable array, string and object methods; build processing chains without unintended mutation.

Required tools: a code editor, an ES6-capable browser with Developer Tools, and a simple local static server (e.g. VS Code Live Server, or node's http-server) so module imports work correctly over HTTP rather than file://.

## 1) Useful Concepts

**Script loading:**

```html
<script src="activity1.js" defer></script>          <!-- classic script, keeps document order -->
<script type="module" src="app.js"></script>        <!-- ES module, deferred by default -->
```

**Variables and data types:**

Use const when a binding should not be reassigned and let when it should change. A const object may still have mutable properties -the binding is fixed, not the object's contents.

```javascript
const original = { score: 10 };
const alias = original;
alias.score = 20;             // allowed -mutating the referenced object
console.log(original.score);  // 20
// original = {};             // TypeError -reassigning a const binding
```

**Operators and coercion:**

```javascript
console.log("5" + 2);              // "52": concatenation
console.log("5" - 2);              // 3: numeric coercion
console.log("5" == 5, "5" === 5);  // true false
console.log(Number("5") + 2);      // 7
```

**Scope, hoisting, temporal dead zone:**

```javascript
function scopeDemo() {
  console.log(a);          // undefined (var is hoisted)
  var a = 1;
}
// console.log(score);     // ReferenceError: temporal dead zone
let score = 70;
```

**Functions, default/rest/spread, destructuring:**

```javascript
function add(a, b = 0) { return a + b; }
function sum(...values) { return values.reduce((s, v) => s + v, 0); }
const numbers = [2, 3, 4];
console.log(sum(...numbers));            // 9
const [first, ...rest] = numbers;        // 2 and [3, 4]
const { name, marks = 0 } = { name: "Ayesha" };
```

**this, call/apply/bind, closures:**

```javascript
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const a = makeCounter(), b = makeCounter();
console.log(a(), a(), b()); // 1 2 1 -each factory call creates independent state
```

**Array processing methods:**

| Method | Purpose |
|---|---|
| forEach / for...of | Side effects / iteration |
| map | New array of transformed values |
| filter | New array containing matches |
| reduce | Accumulates to one result |
| find / some / every | First match / any match / all match |
| sort | Reorders the array in place (needs a numeric comparator for numbers) |

```javascript
const marks = [45, 78, 90, 60];
const labels = marks.filter(m => m >= 50).map(m => `${m}%`);
const ranked = [...marks].sort((a, b) => b - a);  // copy first -sort mutates in place
```

**ES6 modules:**

```javascript
// maths.js
export const passMark = 50;
export function passed(mark) { return mark >= passMark; }

// app.js
import { passMark, passed } from "./maths.js";
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 Minutes | Low | CLO-4 |
| Activity 2 | 25 Minutes | Medium | CLO-4 |
| Activity 3 | 25 Minutes | Medium | CLO-4 |
| Activity 4 | 20 Minutes | Medium | CLO-4 |

### Activity 1: Marks summary and control flow

*Convert **four mark** strings to numbers, calculate their total and average, select a result category, and report every mark. Use for...of, **while,** do...while and switch.*

**Solution:**

```javascript
"use strict";
const rawMarks = ["78", "45", "90", "60"];
const marks = [];
let total = 0;
for (const raw of rawMarks) {
  const value = Number(raw);
  if (raw.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`Invalid mark: ${raw}`);
  }
  marks.push(value);
  total += value;
}
const average = total / marks.length;
let result;
if (average >= 80) result = "Excellent";
else if (average >= 50) result = "Pass";
else result = "Needs improvement";
console.log(`Total: ${total}; Average: ${average.toFixed(2)}; Result: ${result}`);
let index = 0;
while (index < marks.length) { console.log(`Student ${index + 1}: ${marks[index]}`); index++; }
```

**Output / Expected behaviour:**

```text
Total: 273; Average: 68.25; Result: Pass
```

### Activity 2: Functions, closures and this

*Create reusable total/average functions and two independent counters. Demonstrate default/rest parameters, spread, destructuring and call/apply/bind.*

**Solution:**

```javascript
"use strict";
function total(...values) { return values.reduce((s, v) => s + v, 0); }
function createCounter(start = 0) {
  let count = start;
  return { next: () => ++count, current: () => count };
}
const first = createCounter(), second = createCounter(10);
console.log(first.next(), first.next(), second.next()); // 1 2 11

const student = { name: "Ayesha", programme: "BSCS" };
function introduce(prefix) { return `${prefix} ${this.name} (${this.programme})`; }
console.log(introduce.call(student, "Welcome"));
const introduceStudent = introduce.bind(student, "Student:");
console.log(introduceStudent());
```

**Output / Expected behaviour:**

```text
1 2 11
Welcome Ayesha (BSCS)
Student: Ayesha (BSCS)
```

### Activity 3: Book catalogue processing

*Use a fictional catalogue to compute available books, discounted copies, stock value and search results without altering the original prices.*

**Solution:**

```javascript
"use strict";
const books = [
  { id: 1, title: "HTML Essentials", price: 1000, stock: 5 },
  { id: 2, title: "CSS Layouts", price: 1500, stock: 0 },
  { id: 3, title: "JavaScript Lab", price: 2000, stock: 3 }
];
const available = books.filter(b => b.stock > 0);
const discounted = available.map(b => ({ ...b, price: b.price * 0.9 }));
const value = books.reduce((sum, b) => sum + b.price * b.stock, 0);
const found = books.find(b => b.id === 3);
console.log(`Available: ${available.length}; Stock value: PKR ${value}; Found: ${found.title}`);
```

**Output / Expected behaviour:**

```text
Available: 2; Stock value: PKR 11000; Found: JavaScript Lab
```

### Activity 4: A modular marks report

*Separate data, processing and presentation across four files: data.js, analytics.js, app.js and index.html, loaded with type="module".*

**Solution:**

```javascript
// data.js
export const students = [
  { name: "Ayesha", marks: 78 }, { name: "Bilal", marks: 45 }, { name: "Hina", marks: 90 }
];

// analytics.js
export function summarise(students, passMark = 50) {
  const total = students.reduce((s, x) => s + x.marks, 0);
  return { count: students.length, average: total / students.length,
           passed: students.filter(s => s.marks >= passMark).map(s => s.name) };
}

// app.js
import { students } from "./data.js";
import { summarise } from "./analytics.js";
const { count, average, passed } = summarise(students);
document.getElementById("report").textContent =
  `Students: ${count}\nAverage: ${average.toFixed(2)}\nPassed: ${passed.join(", ")}`;
```

**Output / Expected behaviour:**

```text
Students: 3
Average: 71.00
Passed: Ayesha, Hina
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Safe marks analyser**

Write analyseMarks(rawMarks) that converts/validates every input, returns { count, total, average, passed, highest }, uses 50 as the pass threshold, and does not modify the input array. Handle an empty array (all zeros/null) without NaN or division by zero. Throw a clear Error for any blank, non-numeric, non-finite or out-of-range mark.

**Lab Task 2: Non-mutating catalogue report**

Using the Activity 3 catalogue, implement buildReport(books, searchText, discount = 0.10) using map/filter/reduce/find/some/every/sort as appropriate, producing normalised titles, case-insensitive search matches, discounted copies, total stock value and an ascending price ranking, without mutating the original array.

**Lab Task 3: Reusable revision tracker**

Create tracker.js exporting createTracker(start = 0) with add(...minutes), current() and reset() methods, keeping state in a closure. Create two independent trackers in app.js via a module script and demonstrate that resetting one does not affect the other.
