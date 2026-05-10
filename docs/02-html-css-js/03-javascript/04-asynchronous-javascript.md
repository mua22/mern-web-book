# Asynchronous JavaScript: Waiting for Things

So far, all the JavaScript we've seen runs *synchronously*. That means it runs one line at a time, strictly from top to bottom. It won't move to line 2 until line 1 is completely finished.

But what if line 1 involves downloading a massive picture from the internet? If JavaScript stops and waits for that download to finish, your whole website will freeze! 

This is where **Asynchronous JavaScript** comes in. It allows us to start a task, move on to other things while we wait, and then come back to finish it when the task is done.

## 1. Callbacks (The Old Way)

A callback is just a function that you pass into another function as an argument, and it gets executed *later* when a certain task is complete.

We already saw callbacks when we used Event Listeners!

```javascript
// The function () => { ... } is a callback!
// It doesn't run right away. It waits for the click.
document.querySelector('button').addEventListener('click', () => {
    console.log("I'm running later!");
});
```

Another classic example is `setTimeout`, which waits a specified number of milliseconds before running the callback:

```javascript
console.log("1. Starting...");

// setTimeout takes a callback function and a time to wait (in ms)
setTimeout(() => {
    console.log("3. Finished waiting 2 seconds!");
}, 2000);

console.log("2. Moving on without waiting...");

// Output will be:
// 1. Starting...
// 2. Moving on without waiting...
// (2 seconds pass)
// 3. Finished waiting 2 seconds!
```

**The Problem with Callbacks ("Callback Hell"):** If you have many asynchronous tasks that rely on each other (e.g., Get user data -> Then get their posts -> Then get comments on the posts), your callbacks start nesting deeply inside each other, creating a messy, hard-to-read pyramid of code.

---

## 2. Promises (The Better Way)

To fix the messy callback problem, JavaScript introduced `Promises`. 

Think of a Promise like ordering food at a busy restaurant. 
1. You place your order.
2. The cashier gives you a buzzer (a **Promise**). It's a guarantee that *eventually* you will either get your food (it **Resolves**), or they will tell you they ran out of ingredients (it **Rejects**).
3. While you wait, you can go sit down, talk to your friends, or play on your phone. You aren't frozen at the counter.

We handle Promises using `.then()` for success, and `.catch()` for errors.

```javascript
// Note: fetch() is a built-in browser tool to get data from the internet. 
// It ALWAYS returns a Promise!

console.log("Ordering data...");

fetch("https://jsonplaceholder.typicode.com/users/1")
    .then((response) => {
        // This runs if the request was successful
        console.log("Got the response! Converting to JSON...");
        return response.json(); // .json() also returns a Promise!
    })
    .then((userData) => {
        // This runs after the JSON conversion is done
        console.log("Here is the user:", userData.name);
    })
    .catch((error) => {
        // This only runs if something went terribly wrong (like no internet)
        console.error("Oh no! The order failed:", error);
    });

console.log("Doing other things while we wait...");
```

---

## 3. Async / Await (The Modern Way)

Promises were a massive improvement, but chaining all those `.then()` blocks could still get a little confusing.

Enter **`async` / `await`**. This is "syntactic sugar" (a nicer way of writing) over Promises. It allows us to write asynchronous code that *looks* like regular synchronous code!

**Rule 1:** You must put the word `async` in front of your function.
**Rule 2:** You use the word `await` inside that function to pause execution *until* a Promise resolves.

Let's rewrite the exact same `fetch` example above using `async/await`:

```javascript
// Because we have 'async', JavaScript knows this function has waiting inside it
async function getUserInfo() {
    console.log("Ordering data...");

    try {
        // 'await' tells JavaScript to pause THIS function until fetch finishes.
        // It does NOT freeze the rest of the website!
        const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
        
        console.log("Got the response! Converting to JSON...");
        const userData = await response.json();
        
        console.log("Here is the user:", userData.name);
        
    } catch (error) {
        // We use standard try/catch blocks for errors now!
        console.error("Oh no! The order failed:", error);
    }
}

// Call the function
getUserInfo();
console.log("Doing other things while we wait...");
```

**Why is this better?**
* It reads from top to bottom, making it much easier to understand.
* You can use standard `try/catch` blocks for errors instead of chaining `.catch()`.
* It completely eliminates "callback hell"!
