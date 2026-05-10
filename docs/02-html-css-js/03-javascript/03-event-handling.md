# Event Handling: Making the Page Interactive

You've learned how to select and change elements on the page (DOM Manipulation). But right now, those changes only happen *immediately* when the page loads. How do we make things happen *only when the user clicks a button*, or *types in an input box*, or *scrolls the page*?

We use **Events** and **Event Listeners**!

## 1. Syntax of an Event Listener

Think of an event listener like giving an element a set of instructions: "Hey button, listen for a click, and when that click happens, run this function!"

The method we use is called `addEventListener`. It takes two main arguments:
1.  **The Event Type:** What are we listening for? (e.g., `'click'`, `'mouseenter'`, `'keydown'`)
2.  **The Callback Function:** The code that runs *when* the event happens.

```javascript
// Step 1: Select the element
const myButton = document.querySelector("#submit-btn");

// Step 2: Add the listener
myButton.addEventListener('click', function() {
    console.log("Button was clicked!");
    
    // You can do DOM manipulation right here!
    myButton.textContent = "Clicked!";
    myButton.classList.add("success");
});
```

---

## 2. The Mighty `click` Event

This is the most common event you will use. It fires when a user clicks an element (usually a button or a link).

```html
<button id="dark-mode-btn">Toggle Dark Mode</button>
<p class="content">This is some content.</p>
```

```javascript
const darkModeBtn = document.querySelector('#dark-mode-btn');

darkModeBtn.addEventListener('click', () => {
    // 1. Find the <body> tag
    const body = document.querySelector('body');
    
    // 2. Toggle a CSS class that changes the background color
    body.classList.toggle('dark-theme');
    
    // 3. Change the button text depending on the mode!
    if (body.classList.contains('dark-theme')) {
         darkModeBtn.textContent = 'Switch to Light Mode';
    } else {
         darkModeBtn.textContent = 'Switch to Dark Mode';
    }
});
```

---

## 3. The Useful `input` and `change` Events

These events are crucial for forms! They let you capture what a user is typing into a text box or selecting from a dropdown menu.

*   `input`: Fires immediately, every single time a character is typed or deleted. Great for live searching.
*   `change`: Fires only when the user *commits* the change (e.g., clicks away from the input box, or selects a new dropdown option).

```html
<label>Type your name:</label>
<input type="text" id="name-input">
<p>Hello, <span id="display-name">Guest</span>!</p>
```

```javascript
const nameInput = document.querySelector('#name-input');
const displayName = document.querySelector('#display-name');

// Using the 'input' event to update the greeting live as they type!
nameInput.addEventListener('input', () => {
    // We access what they typed using the .value property of the input
    const theirName = nameInput.value;
    
    // If they delete everything, default back to 'Guest'
    if (theirName === "") {
        displayName.textContent = "Guest";
    } else {
        displayName.textContent = theirName;
    }
});
```

---

## 4. Mouse and Keyboard Events

You can build complex interactions by combining different mouse and keyboard events.

### Mouse Events
*   `mouseenter`: When the mouse pointer moves *over* an element.
*   `mouseleave`: When the mouse pointer moves *off* an element.

```javascript
const spookyImage = document.querySelector('#haunted-house-img');

spookyImage.addEventListener('mouseenter', () => {
   // Change the image source when hovered!
   spookyImage.src = 'scary-house.jpg'; 
});

spookyImage.addEventListener('mouseleave', () => {
   // Change it back when they move away
   spookyImage.src = 'normal-house.jpg'; 
});
```

### Keyboard Events
*   `keydown`: Fires when a key is pressed down.

**The Event Object (`e`):** When an event happens, JavaScript automatically passes an "Event Object" into your function. This object holds tons of useful information about the event—like exactly *which* key was pressed on the keyboard!

```javascript
// We put an 'e' (or 'event') inside the function parentheses to catch the Event Object
document.addEventListener('keydown', (e) => {
    
    // e.key tells us the specific key that was pressed
    console.log("You pressed: " + e.key);
    
    if (e.key === 'Escape') {
        console.log("Closing the modal window!");
        // Code to hide a modal would go here
    }
    
    if (e.key === 'Enter') {
        console.log("Submitting the form!");
    }
});
```

---

## 5. The "Page Load" Problem: Where Does JavaScript Go?

If your JavaScript runs *before* the HTML has finished loading, it won't be able to find any elements to attach events to! `document.querySelector('#my-button')` will just return `null`, causing errors.

This depends entirely on where you place your `<script>` tag in your HTML file.

### Approach 1: Script at the End of the `<body>` (Recommended for Beginners)

The simplest solution is to put your `<script src="app.js"></script>` right before the closing `</body>` tag.

**Pros:**
* By the time the browser reaches your script, it has already read and built the entire HTML DOM above it.
* Your JavaScript can safely select any element on the page instantly.
* The visual page loads faster for the user because the browser isn't paused to download/run the JavaScript midway through.

**Cons:**
* If your JavaScript is huge, any interactivity on the page might be delayed until the very end.

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <button id="click-me">Click Me!</button>

    <!-- Script goes at the very bottom! -->
    <script src="app.js"></script>
</body>
</html>
```

### Approach 2: Script in the `<head>` (Requires an Event Listener)

Sometimes you want or need your script to be requested early inside the `<head>`. If you do this, your Javascript runs *before* the `<body>` exists!

To fix this, you must wrap all your code inside a special event listener called `DOMContentLoaded`. This tells your script: "Wait until the HTML is fully downloaded and parsed before you run!".

**Pros:**
* Keeps your HTML file cleaner by grouping all metadata/links in the `<head>`.
* The browser can start downloading the JavaScript file sooner.

**Cons:**
* If you forget the `DOMContentLoaded` wrapper, your code will break.

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
    <!-- Script is at the top! -->
    <script src="app.js"></script>
</head>
<body>
    <h1>Welcome</h1>
    <button id="click-me">Click Me!</button>
</body>
</html>
```

```javascript
// app.js

// We MUST wrap everything in this listener if the script is in the <head>!
document.addEventListener('DOMContentLoaded', () => {

    // Now it's safe to look for elements!
    const btn = document.querySelector('#click-me');
    
    btn.addEventListener('click', () => {
        console.log("Button clicked safely!");
    });
    
});
```

### Approach 3: The `window.onload` Event (Delayed Binding)

There is another older, but still useful, method for waiting called `window.onload`. 

While `DOMContentLoaded` fires the *millisecond* the HTML is done being read by the browser, `window.onload` waits for **EVERYTHING** on the page to finish downloading. This includes massive images, stylesheets, iframes, and ads.

**Pros:**
* Guarantee that every single asset (like images) is fully available and has an accurate width/height before your JavaScript runs.

**Cons:**
* If you have a huge, slow-loading image on your page, your JavaScript buttons might be broken and unclickable for several seconds while the user waits for that image!

```javascript
// This waits for the HTML AND all heavy assets (images, CSS, etc.) to load entirely
window.onload = function() {
    
    // Now it's safe to look for elements and bind events
    const introImage = document.querySelector('#heavy-hero-image');
    
    introImage.addEventListener('click', () => {
        console.log("Image was clicked, and we know it's fully loaded!");
    });

};
```

**Rule of thumb for most modern development:** 
Use **`DOMContentLoaded`** (or put the `<script>` at the end of the `<body>`) so your buttons and interactivity work as quickly as possible. Only use `window.onload` if your JavaScript *specifically requires* an image or iframe to be fully rendered first.

*(Note: Modern HTML introduced `defer` and `async` attributes for script tags in the head which also solve this, but `DOMContentLoaded` is the fundamental mechanism you should understand first!)*
