---
title: "Lecture 14: Regular Expressions and JSON"
tags:
  - JavaScript
  - Regex
  - JSON
  - Validation
---

# Lecture 14: Regular Expressions and JSON

Two skills come up in almost every real web project: checking that user input has the right
*shape* (an email address, a phone number, a password with enough strength), and exchanging
structured data with a server. This lecture covers **regular expressions**, a mini-language for
matching patterns in text, and **JSON**, the standard format the web uses to move data around.

## In This Lecture

- Regex syntax: literals, character classes, quantifiers, and anchors
- Groups, alternation, backreferences, and flags (`g`, `i`, `m`)
- JavaScript's regex methods: `test`, `exec`, `match`, `replace`, `split`
- Validating and parsing form data with regex
- Client-side validation vs. server-side validation, and why only one of them can be trusted
- Schema validation with Joi, and why it scales better than hand-written regex
- JSON syntax, and converting between JSON and JavaScript objects with `JSON.stringify` and
  `JSON.parse`

## What Is a Regular Expression?

A **regular expression** (**regex** for short) is a pattern that describes a set of strings. You
use it to test whether a string matches a shape, find matches inside a larger string, or replace
parts of a string. In JavaScript, you write a regex between forward slashes:

```javascript
const pattern = /hello/;
console.log(pattern.test("hello world")); // true — "hello" appears in the string
console.log(pattern.test("goodbye"));      // false
```

You can also build one dynamically with the `RegExp` constructor, which is useful when the
pattern comes from a variable:

```javascript
const word = "hello";
const dynamicPattern = new RegExp(word);
```

## Regex Syntax

### Literals

The simplest regex just matches the exact characters you write — `/cat/` matches the text "cat"
wherever it appears.

### Character Classes

A **character class** matches any *one* character from a set, written inside square brackets, or
using shorthand codes:

```javascript
/[abc]/     // matches a single "a", "b", or "c"
/[a-z]/     // matches any single lowercase letter (a range)
/[0-9]/     // matches any single digit
/[^0-9]/    // ^ inside [] means NOT — matches any character that is NOT a digit

// Shorthand classes
/\d/  // any digit            — same as [0-9]
/\D/  // any NON-digit
/\w/  // any "word" character — same as [A-Za-z0-9_]
/\W/  // any NON-word character
/\s/  // any whitespace (space, tab, newline)
/\S/  // any NON-whitespace
/./   // any character except a newline
```

### Quantifiers

A **quantifier** says *how many times* the preceding item must repeat:

```javascript
/a*/   // 0 or more "a"s
/a+/   // 1 or more "a"s
/a?/   // 0 or 1 "a" (optional)
/a{3}/ // exactly 3 "a"s
/a{2,4}/ // between 2 and 4 "a"s
/a{2,}/  // 2 or more "a"s
```

### Anchors

**Anchors** don't match characters — they match a *position* in the string:

```javascript
/^Hello/  // ^ means "start of string" — matches only if the string STARTS with "Hello"
/world$/  // $ means "end of string" — matches only if the string ENDS with "world"
/^Hello world$/ // must match the ENTIRE string exactly
/\bcat\b/ // \b is a word boundary — matches "cat" but not "concatenate"
```

## Groups, Alternation, Backreferences, and Flags

### Groups

Parentheses `()` create a **group**, letting you apply a quantifier to more than one character at
once, and letting you extract just that piece of the match later.

```javascript
/(ab)+/.test("ababab"); // true — "ab" repeated one or more times
```

### Alternation

The pipe `|` means "or":

```javascript
/cat|dog/.test("I have a dog"); // true — matches "cat" OR "dog"
```

### Backreferences

A **backreference** refers back to a previously captured group, useful for finding repeated
patterns:

```javascript
// \1 refers back to whatever the first group (\w+) matched
/(\w+)\s\1/.test("hello hello"); // true — the same word repeated
/(\w+)\s\1/.test("hello world"); // false — different words
```

### Flags

**Flags** are letters placed after the closing slash that change how the whole regex behaves:

| Flag | Meaning |
|---|---|
| `g` | Global — find **all** matches, not just the first |
| `i` | Case-insensitive matching |
| `m` | Multiline — `^` and `$` match the start/end of each line, not just the whole string |

```javascript
const text = "Cat cat CAT";
console.log(text.match(/cat/gi)); // ["Cat", "cat", "CAT"] — all matches, ignoring case
```

## JavaScript Regex Methods

### `test()` — does it match?

Returns `true` or `false`. Called on the regex, with the string as the argument.

```javascript
const hasDigit = /\d/;
console.log(hasDigit.test("abc123")); // true
```

### `exec()` — find match details

Called on the regex; returns an array with match details (or `null` if no match), including the
matched text and any captured groups.

```javascript
const dateRegex = /(\d{4})-(\d{2})-(\d{2})/;
const result = dateRegex.exec("Event date: 2026-09-05");
console.log(result[0]); // "2026-09-05" — the full match
console.log(result[1]); // "2026" — first group
console.log(result[2]); // "09"   — second group
console.log(result[3]); // "05"   — third group
```

### `match()` and `matchAll()` — string methods

Called **on the string**, with the regex as the argument.

```javascript
const text = "Call 123-456-7890 or 987-654-3210";
console.log(text.match(/\d{3}-\d{3}-\d{4}/g));
// ["123-456-7890", "987-654-3210"]
```

### `replace()` and `replaceAll()`

```javascript
const messy = "hello   world    there";
console.log(messy.replace(/\s+/g, " ")); // "hello world there" — collapse extra spaces

// Using captured groups in the replacement with $1, $2, ...
const date = "2026-09-05";
console.log(date.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1")); // "05/09/2026"
```

### `split()`

```javascript
const csvLine = "Ali, Sara,  Bilal";
console.log(csvLine.split(/,\s*/)); // ["Ali", "Sara", "Bilal"] — split on comma + optional spaces
```

## Validating and Parsing Form Data

A very common real-world use of regex is checking that user input looks correct before you submit
a form or save it to a database:

```javascript
function isValidEmail(email) {
  const emailRegex = /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
console.log(isValidEmail("student@comsats.edu.pk")); // true
console.log(isValidEmail("not-an-email"));            // false

function isStrongPassword(password) {
  // at least 8 characters, one uppercase, one lowercase, one digit
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
}
console.log(isStrongPassword("Abcdefg1")); // true
console.log(isStrongPassword("abcdefgh")); // false — no uppercase, no digit

function isValidPakPhone(phone) {
  // e.g. 0300-1234567
  return /^03\d{2}-\d{7}$/.test(phone);
}
console.log(isValidPakPhone("0300-1234567")); // true
```

!!! warning "Regex validates *shape*, not *truth*"
    A regex can confirm that `student@comsats.edu.pk` **looks like** an email address (has an
    `@`, a domain, etc.), but it cannot confirm the mailbox actually exists. Always pair
    client-side shape validation with real server-side verification (like sending a confirmation
    email) for anything important.

!!! tip "Test your regex interactively"
    Tools like regex101.com let you build and test a pattern against sample strings with live
    highlighting — extremely useful while you're still learning the syntax.

## Client-Side vs. Server-Side Validation

The `isValidEmail`/`isStrongPassword` functions above run **in the browser** — the instant a
visitor types into a field, or the instant they click Submit, before anything is sent anywhere.
This is **client-side validation**, and it exists for exactly one reason: speed of feedback. The
visitor finds out their password is too weak in milliseconds, with no network round trip, no
page reload, and a specific, friendly message pointing at the exact field that's wrong.

But client-side validation can never be the *only* validation, because the browser running it is
entirely under the visitor's control. Anyone can open DevTools and delete your `<script>` tag,
disable JavaScript outright, or skip the browser completely and send a request straight to your
server with `curl`, Postman, or a one-line `fetch` typed into an unrelated page's console. None of
your carefully-written regex ever runs in any of those cases — your server receives exactly
whatever the request says, validated or not.

| | Client-side validation | Server-side validation |
|---|---|---|
| **Runs where** | In the visitor's browser (JavaScript, or HTML5 `required`/`pattern`) | On your server, after the request arrives |
| **Purpose** | Fast, friendly feedback — catch obvious mistakes before submitting | The actual gate — decide what's allowed into your system |
| **Can it be bypassed?** | Yes, trivially — disabled JS, DevTools, or a direct request | No — the server controls its own code; nothing reaches your database without passing through it |
| **Safe to rely on for security?** | **Never** | **Yes** — this is the only validation you can actually trust |

!!! warning "Never trust the client"
    This is one of the most important rules in web development: **any data arriving at your
    server could have come from anywhere** — your own form, a modified copy of your form, or a
    request built by hand with no browser involved at all. Client-side validation is a courtesy
    that makes your UI pleasant to use. Server-side validation is what actually protects your
    data, and it must independently re-check everything the client was supposed to check,
    assuming the client-side check never ran at all.

The practical rule, then, is **defense in depth**: keep your client-side regex checks for instant
UX feedback, but *never* skip re-validating the exact same data once it reaches your server —
using the exact same rules, or stricter ones. The next section introduces the tool most real
Node/Express backends use to do that server-side half well.

## Schema Validation with Joi

Hand-written regex works, but it has real limits once a form grows past two or three fields: every
field needs its own bespoke pattern, "required" and "optional" have to be checked separately from
shape, and a nested object (an address inside a user, say) turns into a tangle of manual `if`
statements. **[Joi](https://joi.dev)** is an npm package — `npm install joi` — that solves this by
letting you describe what a valid object *looks like* as a **schema**, declaratively, instead of
writing the checking logic yourself by hand.

```javascript
const Joi = require("joi");

const studentSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(16).max(100),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
    .required(),
});

const { error, value } = studentSchema.validate({
  name: "Ayesha",
  email: "ayesha@comsats.edu.pk",
  age: 22,
  password: "Abcdefg1",
});

if (error) {
  console.log(error.details[0].message);
} else {
  console.log("Valid:", value); // the same object, with types coerced where sensible
}
```

Notice the password rule still uses the exact same regex from the previous section —
`.pattern()` lets a Joi schema wrap a hand-written regex for the one piece only regex can express,
while Joi itself handles `.required()`, `.min()`, `.max()`, and `.email()` so you don't have to
write and test patterns for those yourself.

### Why Use Joi Instead of Writing It All by Hand

- **Readability** — `Joi.string().email().required()` says exactly what it checks, at a glance;
  the equivalent hand-rolled `if` chain checking type, presence, and shape separately is far
  harder to scan.
- **One schema, one source of truth** — the same `studentSchema` object can validate a signup
  form's data, a "create student" API request body, and a database-seeding script, so the rules
  for what counts as a valid student are defined exactly once.
- **Built-in validators for the shapes you'd otherwise write regex for** — `.email()`, `.uri()`,
  `.min()`/`.max()` for numbers *and* string length, `.integer()`, date validation — without
  writing or testing a single pattern.
- **Detailed, structured errors** — `error.details` is an array describing *every* rule that
  failed (pass `{ abortEarly: false }` to `.validate()` to collect all of them instead of just the
  first), which is far more useful to send back to a client than a single `true`/`false`.
- **Handles nested objects and arrays naturally** — `Joi.object({ address: Joi.object({ city:
  Joi.string().required() }) })` validates a nested shape in the same declarative style, something
  that gets unwieldy fast with hand-written `if` statements.

!!! tip "Where you'll actually use this"
    Joi's natural home is **server-side**, inside an Express route handler, validating
    `req.body` before any of it touches your database — exactly the server-side half of the
    client/server validation split above. You'll use it for real starting in
    [Lecture 25: REST API Development and Authentication](lecture-25-rest-api-development-and-authentication.md),
    validating incoming API requests before they're trusted with anything.

## JSON: JavaScript Object Notation

**JSON** (JavaScript Object Notation) is a lightweight, text-based format for representing
structured data. It looks a lot like a JavaScript object literal, which makes it easy to read, but
it is a strict, language-independent format used to exchange data between a browser and a server
(or between any two systems, in any programming language).

```json
{
  "name": "Ayesha",
  "age": 22,
  "isStudent": true,
  "courses": ["Web Technologies", "Databases"],
  "address": {
    "city": "Lahore",
    "zip": "54000"
  },
  "graduationYear": null
}
```

JSON syntax rules are stricter than JavaScript object syntax:

- **Keys must be double-quoted strings** — `"name"`, never `name` or `'name'`.
- String values must also use **double quotes**, not single quotes.
- Allowed value types: string, number, boolean (`true`/`false`), `null`, object, or array.
- **No trailing commas**, and **no comments** are allowed anywhere in JSON.
- **No functions, `undefined`, or dates** — JSON only represents plain data.

<div class="cu-svg-diagram" markdown>
<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="json-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <rect x="30" y="95" width="210" height="90" rx="12" fill="#C9680F"/>
  <text x="135" y="134" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="17" fill="#FFFFFF">JavaScript Object</text>
  <text x="135" y="156" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="#FDE8D2">(in memory)</text>
  <rect x="480" y="95" width="210" height="90" rx="12" fill="#1C7293"/>
  <text x="585" y="134" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="17" fill="#FFFFFF">Server / File / API</text>
  <text x="585" y="156" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="#D2EEF5">(anywhere data moves)</text>
  <path d="M240,100 C300,45 420,45 480,100" fill="none" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#json-arrow)"/>
  <text x="360" y="28" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="14" fill="var(--cu-text)">JSON.stringify()</text>
  <rect x="300" y="50" width="120" height="26" rx="13" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5"/>
  <text x="360" y="67" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="var(--cu-muted)">"JSON text"</text>
  <path d="M480,180 C420,235 300,235 240,180" fill="none" stroke="var(--cu-muted)" stroke-width="2.5" marker-end="url(#json-arrow)"/>
  <text x="360" y="268" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="14" fill="var(--cu-text)">JSON.parse()</text>
  <rect x="300" y="204" width="120" height="26" rx="13" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5"/>
  <text x="360" y="221" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="var(--cu-muted)">"JSON text"</text>
</svg>
</div>

A JavaScript object only ever exists *in memory*, inside one running program — it can't be sent
over a network or written to a file as-is. `JSON.stringify()` converts it into a plain string in
JSON's strict text format, which **can** travel anywhere: over HTTP, into a file, into a database
column. `JSON.parse()` reverses the conversion on the receiving end, turning that same text back
into a real, usable JavaScript object. Every request body you send and every response body you
receive through the Fetch API (next lecture) makes this exact round trip.

### `JSON.stringify()` — object to JSON text

Converts a JavaScript value into a JSON-formatted string, so it can be sent over the network or
saved to a file.

```javascript
const student = {
  name: "Bilal",
  age: 21,
  courses: ["Web Technologies", "OOP"],
};

const jsonText = JSON.stringify(student);
console.log(jsonText);
// '{"name":"Bilal","age":21,"courses":["Web Technologies","OOP"]}'

// Pretty-print with indentation (useful for logging/debugging)
console.log(JSON.stringify(student, null, 2));
```

### `JSON.parse()` — JSON text to object

Converts a JSON-formatted string back into a real JavaScript value you can work with.

```javascript
const jsonText = '{"name":"Bilal","age":21}';
const obj = JSON.parse(jsonText);
console.log(obj.name); // "Bilal"
console.log(obj.age + 1); // 22 — it's a real number, not a string
```

!!! warning "Invalid JSON throws an error"
    `JSON.parse` throws a `SyntaxError` if the string is not valid JSON (for example, if it uses
    single quotes or has a trailing comma). Always wrap `JSON.parse` on data from an external
    source in a `try...catch` block, which you'll practice more in the next lecture.
    ```javascript
    try {
      const data = JSON.parse(someText);
    } catch (error) {
      console.error("Invalid JSON:", error.message);
    }
    ```

You will use `JSON.stringify` and `JSON.parse` constantly starting in the next lecture, whenever
your JavaScript code talks to a server through the Fetch API — request bodies you send are turned
into JSON text with `stringify`, and response bodies you receive are turned back into usable
objects with `parse`.

## Try It Yourself

1. Write a regex-based function `extractHashtags(text)` that returns an array of all hashtags
   (words starting with `#`, made of letters, digits, or underscores) found in a string, e.g.
   `extractHashtags("Loving #WebDev and #JavaScript!")` should return `["#WebDev",
   "#JavaScript"]`.
2. Create a JavaScript object representing a small product catalog (an array of `{ name, price,
   inStock }` objects). Convert it to a pretty-printed JSON string with `JSON.stringify`, then
   parse it back with `JSON.parse` and use a `filter` (from the previous lecture) to log only the
   products where `inStock` is `true`.
3. Write a Joi schema for a product (`name` required string, `price` required positive number,
   `inStock` required boolean). Validate three test objects against it — one fully valid, one
   missing a required field, and one with a `price` of `-5` — and log `error.details[0].message`
   for the two that fail.
4. Build a tiny HTML form (name + email) with a client-side `isValidEmail` check like this
   lecture's, that blocks submission and shows an error message on an invalid address. Then write
   out, in comments only (no server to run here yet), exactly what a malicious or buggy client
   could still send straight to your server even with that check in place — this is the gap
   server-side validation with Joi exists to close.

## Key Takeaways

- A regex describes a pattern of text using literals, character classes (`\d`, `\w`, `\s`, or
  `[...]`), quantifiers (`*`, `+`, `?`, `{n,m}`), and anchors (`^`, `$`, `\b`).
- Groups `()` capture parts of a match; `|` means alternation ("or"); backreferences (`\1`) refer
  back to an earlier group; flags `g`, `i`, `m` change global/case-insensitive/multiline matching.
- `test()` and `exec()` are regex methods; `match()`, `matchAll()`, `replace()`, and `split()` are
  string methods that also accept a regex.
- Regex is excellent for validating the *shape* of form input (emails, phone numbers, passwords)
  but cannot confirm the data is actually true or real.
- Client-side validation (JavaScript or HTML5 attributes) is for instant UX feedback only — it
  can always be bypassed, so it must never be your only line of defense.
- Server-side validation is the only validation that can be trusted, since it's the only code the
  visitor doesn't control; always re-check incoming data on the server, independent of whatever
  the client already checked.
- Joi lets you describe a valid object as a declarative schema (`Joi.object({...})`) instead of
  hand-writing `if` statements and regex for every field — the standard tool for server-side
  validation in Express/Node, with structured errors and built-in validators like `.email()`.
- JSON is a strict, text-based data format — double-quoted keys and strings only, no comments, no
  trailing commas, no functions.
- `JSON.stringify` converts a JavaScript value into JSON text; `JSON.parse` converts JSON text
  back into a usable JavaScript value — the core of exchanging data with a server.
- Always wrap `JSON.parse` on external data in a `try...catch`, since malformed JSON throws an
  error.
