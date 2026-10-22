---
title: "Lecture 13: DOM Manipulation and Event Handling"
tags:
  - JavaScript
  - DOM
  - Events
  - Web Development
---

# Lecture 13: DOM Manipulation and Event Handling

Every interactive web page you have ever used — one that updates without a full reload, reacts to
clicks, or validates a form as you type — does it through the **DOM**. This lecture shows you how
JavaScript reads, changes, and reacts to the structure of a web page.

## In This Lecture

- What the DOM tree, nodes, and the `document` object actually are
- Selecting elements with `getElementById`, `querySelector`, and `querySelectorAll`
- Creating, updating, and removing elements
- Working with `classList` and inline styles
- Handling events with `addEventListener` and the event object
- The event life cycle — capturing, target, and bubbling — plus delegation,
  `preventDefault`, and `stopPropagation`
- Unobtrusive JavaScript, and why `addEventListener("DOMContentLoaded", ...)` is usually
  a better choice than `window.onload`

## The DOM Tree, Nodes, and the `document` Object

The **DOM** (Document Object Model) is a live, in-memory, tree-shaped representation of an HTML
page that the browser builds after parsing your HTML. Every tag becomes an object — called a
**node** — that JavaScript can read and modify. When you change the DOM, the browser immediately
redraws the page to match.

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>My Page</h1>
    <p>Hello <strong>world</strong></p>
  </body>
</html>
```

<div class="cu-svg-diagram" markdown>
<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="l13-dom-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <rect x="300" y="15" width="140" height="44" rx="8" fill="#2B2B7A"/>
  <text x="370" y="42" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="13" fill="#FFFFFF">document</text>
  <line x1="370" y1="59" x2="370" y2="99" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <rect x="300" y="99" width="140" height="44" rx="8" fill="#1C7293"/>
  <text x="370" y="126" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="13" fill="#FFFFFF">&lt;html&gt;</text>
  <line x1="370" y1="143" x2="370" y2="183" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <rect x="300" y="183" width="140" height="44" rx="8" fill="#1C7293"/>
  <text x="370" y="210" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="13" fill="#FFFFFF">&lt;body&gt;</text>
  <line x1="330" y1="227" x2="220" y2="267" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <line x1="410" y1="227" x2="520" y2="267" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <rect x="130" y="267" width="170" height="54" rx="8" fill="#3FA66B"/>
  <text x="215" y="291" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="13" fill="#FFFFFF">&lt;h1&gt;</text>
  <text x="215" y="310" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="11" fill="#E4F5EB">'My Page'</text>
  <rect x="450" y="267" width="140" height="44" rx="8" fill="#3FA66B"/>
  <text x="520" y="294" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="13" fill="#FFFFFF">&lt;p&gt;</text>
  <line x1="490" y1="311" x2="420" y2="351" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <line x1="550" y1="311" x2="610" y2="351" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dom-arrow)"/>
  <rect x="320" y="351" width="200" height="44" rx="8" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="420" y="378" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="12" fill="var(--cu-text)">Text: 'Hello '</text>
  <rect x="530" y="351" width="150" height="44" rx="8" fill="#3FA66B"/>
  <text x="605" y="371" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="12.5" fill="#FFFFFF">&lt;strong&gt;</text>
  <text x="605" y="388" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-style="italic" font-size="10.5" fill="#E4F5EB">'world'</text>
</svg>
</div>

A few important vocabulary words:

- **Node**: any single item in the tree — an element, a piece of text, or a comment.
- **Element**: a node that represents an HTML tag, like `<p>` or `<div>`.
- **`document`**: a special global object that represents the entire page, and is your entry
  point for interacting with the DOM (`document.getElementById(...)`, `document.title`, etc.).
- **Parent / child / sibling**: `body` is the *parent* of `h1` and `p`; `h1` and `p` are
  *siblings* (children of the same parent).

!!! note "The DOM is not the same as your HTML file"
    The DOM is what the browser *builds* from your HTML — and JavaScript can change it after the
    fact. If you use "View Page Source" you see the original HTML file, but if you use "Inspect
    Element" (DevTools) you see the *current* DOM, which may look very different after scripts
    have run.

## Selecting Elements

Before you can change something on the page, you need to select the node(s) you want.

```javascript
// By id — returns a single element, or null if not found
const title = document.getElementById("main-title");

// By CSS selector — returns the FIRST matching element, or null
const firstButton = document.querySelector(".btn");
const firstInput = document.querySelector("input[type='email']");

// By CSS selector — returns ALL matching elements as a NodeList
const allButtons = document.querySelectorAll(".btn");
```

`querySelector` and `querySelectorAll` accept **any valid CSS selector** — by class (`.btn`), by
tag (`div`), by attribute (`[type="text"]`), or combinations (`ul li.active`) — which makes them
far more flexible than the older `getElementById`/`getElementsByClassName` methods.

```javascript
// NodeList supports forEach directly
allButtons.forEach(btn => console.log(btn.textContent));
```

!!! tip "`querySelectorAll` returns a NodeList, not an Array"
    A `NodeList` supports `forEach`, but not `map` or `filter` directly. Convert it first if you
    need those: `Array.from(allButtons)` or `[...allButtons]`.

## Creating, Updating, and Removing Nodes

### Creating and Inserting

```javascript
const newItem = document.createElement("li");   // create a new <li> element
newItem.textContent = "New task";                // give it text content

const list = document.querySelector("#task-list");
list.appendChild(newItem);          // add as the last child
list.prepend(newItem);              // add as the first child
list.insertBefore(newItem, list.children[1]); // insert at a specific position
```

### Updating Content and Attributes

```javascript
const heading = document.querySelector("h1");
heading.textContent = "Updated Title";  // sets plain text (safe — treats input as text)
heading.innerHTML = "<em>Updated</em> Title"; // parses the string AS HTML

const link = document.querySelector("a");
link.setAttribute("href", "https://example.com");
console.log(link.getAttribute("href"));
link.removeAttribute("target");
```

!!! warning "`innerHTML` and security"
    `innerHTML` parses whatever string you give it as real HTML. If that string ever comes from
    user input (a comment box, a search field) and you insert it with `innerHTML`, a malicious
    user could inject a `<script>` tag — this is called **XSS (Cross-Site Scripting)**, and you
    will study it later in this course. Prefer `textContent` unless you specifically need to
    insert HTML markup, and always trust `textContent` over `innerHTML` for anything user-typed.

### Removing Nodes

```javascript
const item = document.querySelector("#task-3");
item.remove();               // modern, simplest way

// Older way, still seen in existing code:
item.parentNode.removeChild(item);
```

## `classList` and Inline Styles

Rather than changing CSS with raw strings, use `classList` to toggle predefined CSS classes — this
keeps styling logic in your CSS file, where it belongs.

```javascript
const box = document.querySelector(".box");

box.classList.add("highlighted");
box.classList.remove("hidden");
box.classList.toggle("active");     // adds it if missing, removes it if present
console.log(box.classList.contains("active")); // true or false
```

You can also set individual CSS properties directly through the `style` property, which writes
**inline styles** (CSS applied directly on the element, with the highest priority):

```javascript
box.style.backgroundColor = "yellow";
box.style.display = "none";
box.style.fontSize = "18px";
```

!!! tip "Prefer `classList` over `style`"
    Toggling a class is usually better than setting individual style properties in JavaScript,
    because it keeps the "what it should look like" (CSS) separate from "when it should look that
    way" (JavaScript), and it's easier to change the look later without touching your script.

## Events and `addEventListener`

An **event** is something that happens in the browser that your code can respond to — a click, a
key press, a page load, a form submission, and many more. An **event listener** is a function you
register to run when a specific event happens on a specific element.

```javascript
const button = document.querySelector("#save-btn");

button.addEventListener("click", function () {
  console.log("Button was clicked!");
});

// Arrow function version
button.addEventListener("click", () => console.log("Clicked!"));
```

`addEventListener(eventType, handlerFunction)` is preferred over the older `onclick = ...` style
because it lets you attach **multiple** listeners to the same event on the same element, and you
can remove a specific one later with `removeEventListener`.

```javascript
function handleClick() {
  console.log("Handled once");
}
button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick); // must pass the SAME function reference
```

### The Event Object

Every event handler automatically receives an **event object** describing what happened:

```javascript
document.querySelector("input").addEventListener("keydown", (event) => {
  console.log(event.key);        // which key was pressed, e.g. "Enter"
  console.log(event.target);     // the exact element the event happened on
  console.log(event.type);       // "keydown"
});

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault(); // stop the default action (page reload) — see below
  console.log("Form data captured without reloading the page");
});
```

Common events you will use constantly: `click`, `submit`, `input`, `change`, `keydown`,
`keyup`, `mouseover`, `mouseout`, `load`, `DOMContentLoaded`.

## The Event Life Cycle: Capturing, Target, and Bubbling

When an event fires on an element nested inside other elements, it doesn't just affect that one
element — it travels through the entire DOM tree in **three** ordered phases. Together these are
called the event's **life cycle**:

1. **Capturing phase**: the event starts at `document` and travels **down** the tree, through
   every ancestor of the element it's heading for, without yet having reached it.
2. **Target phase**: the event arrives at the exact element the user interacted with — the
   **target**. Both capturing-phase and bubbling-phase listeners registered directly on the
   target fire here.
3. **Bubbling phase**: the event then travels back **up** the tree, through the same ancestors,
   in reverse order, all the way back to `document`.

<div class="cu-svg-diagram" markdown>
<svg viewBox="0 0 820 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="l13-lifecycle-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <rect x="20" y="30" width="220" height="330" rx="10" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5"/>
  <text x="130" y="52" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="11.5" fill="var(--cu-muted)">1. Capturing (top to bottom)</text>
  <rect x="75" y="68" width="110" height="38" rx="7" fill="#2B2B7A"/>
  <text x="130" y="92" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">document</text>
  <line x1="130" y1="106" x2="130" y2="146" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="75" y="146" width="110" height="38" rx="7" fill="#1C7293"/>
  <text x="130" y="170" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">&lt;body&gt;</text>
  <line x1="130" y1="184" x2="130" y2="224" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="75" y="224" width="110" height="38" rx="7" fill="#3FA66B"/>
  <text x="130" y="248" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">&lt;ul&gt;</text>
  <line x1="240" y1="243" x2="300" y2="243" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="300" y="30" width="180" height="330" rx="10" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5"/>
  <text x="390" y="52" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="11.5" fill="var(--cu-muted)">2. Target</text>
  <rect x="330" y="195" width="120" height="50" rx="8" fill="#C9680F" stroke="#FFFFFF" stroke-width="2.5"/>
  <text x="390" y="217" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="12" fill="#FFFFFF">li</text>
  <text x="390" y="234" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10" fill="#FDE8D2">(target)</text>
  <line x1="480" y1="220" x2="540" y2="220" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="540" y="30" width="260" height="330" rx="10" fill="var(--cu-surface)" stroke="var(--cu-border-soft)" stroke-width="1.5"/>
  <text x="670" y="52" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="11.5" fill="var(--cu-muted)">3. Bubbling (bottom to top)</text>
  <rect x="615" y="224" width="110" height="38" rx="7" fill="#3FA66B"/>
  <text x="670" y="248" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">&lt;ul&gt;</text>
  <line x1="670" y1="224" x2="670" y2="184" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="615" y="146" width="110" height="38" rx="7" fill="#1C7293"/>
  <text x="670" y="170" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">&lt;body&gt;</text>
  <line x1="670" y1="146" x2="670" y2="106" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-lifecycle-arrow)"/>
  <rect x="615" y="68" width="110" height="38" rx="7" fill="#2B2B7A"/>
  <text x="670" y="92" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-size="12" fill="#FFFFFF">document</text>
</svg>
</div>

By default, `addEventListener` only reacts during the **target** and **bubbling** phases. You can
make it react during the **capturing** phase instead by passing `true` (or
`{ capture: true }`) as a third argument:

```javascript
element.addEventListener("click", handler, true); // capturing phase
element.addEventListener("click", handler, false); // bubbling phase (default)
```

### Watching All Three Phases in Order

The life cycle is easiest to believe once you log it. Given three nested elements —
`<div id="outer"><div id="middle"><button id="inner">Click</button></div></div>` — attach both a
capturing and a bubbling listener to *every* level, then click the innermost button:

```javascript
["outer", "middle", "inner"].forEach((id) => {
  const el = document.getElementById(id);

  el.addEventListener("click", () => console.log(`CAPTURE: ${id}`), true);
  el.addEventListener("click", () => console.log(`BUBBLE: ${id}`), false);
});
```

Clicking the button logs, in this exact order:

```text
CAPTURE: outer
CAPTURE: middle
CAPTURE: inner
BUBBLE: inner
BUBBLE: middle
BUBBLE: outer
```

Notice `inner` (the target) logs **both** of its own listeners back-to-back — that's the target
phase, sitting right in the middle between capturing going down and bubbling coming back up. You
can check which phase a handler is currently running in from the event object itself:

```javascript
inner.addEventListener("click", (event) => {
  console.log(event.eventPhase); // 1 = capturing, 2 = at target, 3 = bubbling
  console.log(event.target);        // always #inner — where the click actually happened
  console.log(event.currentTarget); // whichever element THIS listener is attached to
});
```

!!! note "Why capturing exists at all"
    Almost all real code only ever uses the bubbling phase — it's what event delegation (below)
    relies on. Capturing listeners are rare in application code, but they matter for one specific
    job: intercepting an event *before* anything closer to the target gets a chance to react to
    it or stop it, which is occasionally useful for logging, analytics, or a parent that needs the
    first word on every click inside it, no matter what a child's own handler does.

### Event Delegation

Because events bubble up, you can attach **one** listener on a parent element instead of separate
listeners on every child — this is called **event delegation**. It's especially useful for lists
where items are added or removed dynamically, since a listener on individual items would need to
be re-attached every time.

```javascript
const list = document.querySelector("#task-list");

// One listener on the parent handles clicks on ANY current or future <li>
list.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    event.target.classList.toggle("done");
  }
});
```

Here, `event.target` is the specific element that was actually clicked (a particular `<li>`),
while `event.currentTarget` is the element the listener is attached to (`list` itself).

!!! tip "Why event delegation matters"
    If you add 100 new `<li>` items after the page loads, a delegated listener on the parent
    `<ul>` automatically handles clicks on all of them — no need to attach 100 separate listeners
    or re-attach one every time an item is added.

### `preventDefault` and `stopPropagation`

These two methods on the event object control the event's behavior, but they do very different
things:

- **`event.preventDefault()`**: stops the browser's **default behavior** for that event — like
  a form actually submitting and reloading the page, or a link actually navigating.
- **`event.stopPropagation()`**: stops the event from **continuing to bubble (or capture)** to
  other elements — but the default browser behavior still happens unless you also call
  `preventDefault()`.

```javascript
document.querySelector("a.disabled-link").addEventListener("click", (event) => {
  event.preventDefault(); // the link will NOT navigate anywhere
});

document.querySelector(".dropdown-toggle").addEventListener("click", (event) => {
  event.stopPropagation(); // clicking this button won't also trigger a listener
                            // on a parent element (e.g. a "click outside to close" handler)
});
```

!!! warning "Don't confuse the two"
    `preventDefault()` cancels what the browser *would have done*. `stopPropagation()` cancels
    the event from *reaching other listeners* further up (or down) the tree. A single handler can
    call both when needed, but they solve different problems.

## Unobtrusive JavaScript

Every earlier tutorial in this course bound events with an HTML attribute — `onclick="save()"`
sitting right inside the tag. That's a fine way to learn, but it has real costs once a page grows:
the behavior is scattered through the HTML instead of living in one place, the same attribute can
only hold *one* handler, and some security policies (CSP) reject inline attribute handlers
outright.

**Unobtrusive JavaScript** is the practice of keeping *all* behavior out of the HTML entirely —
no `onclick`, no `onsubmit`, nothing. The HTML describes structure only; a separate `.js` file
selects its own elements and attaches its own listeners with `addEventListener`.

```html
<!-- Obtrusive: behavior is mixed into the markup -->
<button onclick="save()">Save</button>
```

```html
<!-- Unobtrusive: the markup says nothing about behavior -->
<button id="save-btn">Save</button>
```

```javascript
// script.js — all behavior lives here instead
document.getElementById("save-btn").addEventListener("click", save);
```

This separation is why `addEventListener` is the technique real production code reaches for, even
though attribute binding is easier for a first project: the HTML stays reusable and readable on
its own, and a single element can respond to the same event with more than one independent
listener — try that with an `onclick` attribute and the second one you write simply overwrites
the first.

### The Problem: Running Script Before the Page Is Ready

An unobtrusive script has to solve a timing problem attribute binding never had. `onclick="save()"`
works no matter when it runs, because the browser doesn't even look at it until the button exists
and is clicked. But a `<script>` that calls `document.getElementById("save-btn")` **before** that
button has been parsed gets `null` back, and `.addEventListener` on `null` throws an error and
stops your whole script.

```html
<head>
  <script src="script.js"></script>   <!-- runs immediately, before <body> exists yet -->
</head>
<body>
  <button id="save-btn">Save</button>
</body>
```

JavaScript needs to **wait** until the elements it wants to select actually exist. There are two
standard ways to wait, and they wait for different things.

### `window.onload` — Waits for Everything

```javascript
window.onload = function () {
  // Runs only after the HTML, CSS, images, and every other linked resource
  // has fully finished downloading.
  document.getElementById("save-btn").addEventListener("click", save);
};
```

`window.onload` fires only once *every* resource the page references — every `<img>`, every
stylesheet, every embedded video — has completely finished loading. That makes it reliable, but
slow: a page with one large, slow-loading image delays `onload` by exactly as long as that image
takes, even if your script has nothing to do with images at all.

### `DOMContentLoaded` — Waits Only for the HTML

```javascript
document.addEventListener("DOMContentLoaded", function () {
  // Runs as soon as the HTML has been fully parsed into the DOM —
  // it does NOT wait for images, fonts, or other external resources.
  document.getElementById("save-btn").addEventListener("click", save);
});
```

`DOMContentLoaded` fires as soon as the DOM tree itself is built — every element exists and can be
selected — without waiting for images or other slow external resources to finish downloading.
Since almost every unobtrusive script only needs the *elements* to exist (not the images inside
them), `DOMContentLoaded` fires sooner and is the right choice for the vast majority of
"wait until the page is ready" code.

<div class="cu-svg-diagram" markdown>
<svg viewBox="0 0 940 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="l13-dcl-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="var(--cu-muted)"/>
    </marker>
  </defs>
  <rect x="15" y="55" width="150" height="60" rx="10" fill="#2B2B7A"/>
  <text x="90" y="90" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="12.5" fill="#FFFFFF">HTML parsed</text>
  <line x1="165" y1="85" x2="260" y2="85" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dcl-arrow)"/>
  <text x="212" y="70" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10.5" fill="var(--cu-text)">fires immediately</text>
  <rect x="260" y="55" width="180" height="60" rx="10" fill="#1C7293"/>
  <text x="350" y="90" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="12" fill="#FFFFFF">DOMContentLoaded</text>
  <line x1="440" y1="85" x2="560" y2="85" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dcl-arrow)"/>
  <text x="500" y="62" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10" fill="var(--cu-text)">images keep loading</text>
  <text x="500" y="75" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="10" fill="var(--cu-text)">in the background</text>
  <rect x="560" y="55" width="190" height="60" rx="10" fill="#C9680F"/>
  <text x="655" y="82" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="11.5" fill="#FFFFFF">Images/CSS finish</text>
  <text x="655" y="99" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-weight="700" font-size="11.5" fill="#FFFFFF">loading</text>
  <line x1="750" y1="85" x2="800" y2="85" stroke="var(--cu-muted)" stroke-width="2" marker-end="url(#l13-dcl-arrow)"/>
  <text x="862" y="60" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="9.5" fill="var(--cu-text)">fires only once</text>
  <text x="862" y="72" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="9.5" fill="var(--cu-text)">EVERYTHING is done</text>
  <rect x="800" y="55" width="125" height="60" rx="10" fill="#6C4FF5"/>
  <text x="862" y="90" text-anchor="middle" font-family="&quot;Courier New&quot;, monospace" font-weight="700" font-size="12" fill="#FFFFFF">window.onload</text>
</svg>
</div>

!!! tip "How to choose"
    Use `addEventListener("DOMContentLoaded", ...)` for almost everything — selecting elements,
    attaching listeners, populating initial content. Reach for `window.onload` only when your code
    genuinely needs a fully loaded resource first — for example, reading `img.naturalWidth` from an
    `<img>`, which isn't accurate until the image data has actually arrived.

!!! warning "`window.onload = fn` only allows ONE handler"
    Assigning directly to `window.onload` (or any `element.onclick`, `element.onsubmit`, etc.)
    silently **replaces** any handler already assigned there — it's really no different from the
    `onclick="..."` attribute in that respect. `addEventListener("DOMContentLoaded", fn)`, by
    contrast, can be called many times, and every listener still runs. This is one more reason
    `addEventListener` is the preferred, fully unobtrusive tool: `window.onload` is really a
    leftover from before `addEventListener` existed.

A script placed at the very end of `<body>` (after all the HTML above it) typically doesn't need
either one — by the time the browser reaches that `<script>` tag, everything before it is already
parsed. `DOMContentLoaded` becomes essential specifically when your script is loaded from `<head>`,
or anywhere else that might run before the elements it needs actually exist.

## Try It Yourself

1. Build a simple to-do list: an `<input>`, an "Add" `<button>`, and an empty `<ul id="list">`.
   When the button is clicked, create a new `<li>` with the input's text and append it to the
   list, then clear the input. Use `event.preventDefault()` if you wrap the input in a `<form>`.
2. Add **one** delegated `click` listener on `#list` that toggles a `done` CSS class (with a
   line-through style) when any `<li>` is clicked, and removes the `<li>` entirely if the user
   clicks a small "×" you add inside each item — using `event.target` to tell which part was
   clicked.
3. Build three nested `<div>`s and attach both a capturing and a bubbling listener to each, like
   the example above. Log each firing to the page (not just the console) and confirm you see all
   six lines in the exact capture-then-target-then-bubble order described above.
4. Convert that same page to fully unobtrusive JavaScript: remove every `onclick` attribute,
   move the script tag to `<head>`, and wrap all of your `document.getElementById`/
   `addEventListener` setup code in a single `document.addEventListener("DOMContentLoaded", ...)`
   call so it still works even though the script now runs before the body exists.

## Key Takeaways

- The DOM is a live, tree-shaped, in-memory representation of the page; `document` is your entry
  point into it.
- `getElementById` selects by id; `querySelector`/`querySelectorAll` select by any CSS selector
  and are more flexible.
- Prefer `textContent` over `innerHTML` unless you specifically need to insert HTML, to avoid
  XSS security risks with user-supplied text.
- `classList.add/remove/toggle/contains` is the preferred way to change an element's appearance;
  reserve direct `style` changes for one-off, dynamic values.
- `addEventListener` registers event handlers and supports multiple listeners per event; every
  handler receives an event object describing what happened.
- Every event travels through three ordered phases — **capturing** (down from `document`),
  **target** (at the element itself), and **bubbling** (back up to `document`) — and
  `addEventListener`'s third argument chooses which of the first and last you listen on.
- Bubbling is what makes event delegation possible: one listener on a parent handles events from
  many (even future) children, instead of attaching — and re-attaching — a separate listener to
  every single one.
- `preventDefault()` stops the browser's default action; `stopPropagation()` stops the event from
  reaching other listeners — they are not the same thing.
- **Unobtrusive JavaScript** keeps all behavior in `.js` files and out of HTML attributes, using
  `addEventListener` exclusively — this allows multiple independent listeners per element and
  keeps structure and behavior separately maintainable.
- Wrap DOM setup code in `document.addEventListener("DOMContentLoaded", ...)` so it runs as soon
  as the HTML is parsed, without waiting on slow-loading images the way `window.onload` does;
  reach for `window.onload` only when you specifically need a resource to have finished loading.
