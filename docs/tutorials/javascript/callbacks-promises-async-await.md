---
title: "Tutorial: Callbacks, Promises, and Async/Await"
tags:
  - JavaScript
  - Async
  - Promises
  - Event Loop
  - Intermediate Project
---

# Callbacks, Promises, and Async/Await

Three different pieces of syntax, one single problem underneath all of them: how do you write code
that has to *wait* — for a timer, a file, a server — without freezing everything else on the page
while it waits? **Callbacks**, **Promises**, and **`async`/`await`** are three generations of the
same answer, each one fixing a real problem with the generation before it. This tutorial walks
through all three side by side, then puts a live, interactive visualizer right on this page so you
can *watch* the mechanism underneath all of them — the **event loop** — actually run, instead of
just reading about it.

**Prerequisites:** [Your First JavaScript Program](first-javascript-app.md) and
[Lecture 15: Asynchronous JavaScript](../../web-technologies/lecture-15-async-javascript-promises-fetch.md)
— this tutorial assumes you're comfortable with functions and arrow functions, and it builds
directly on Lecture 15's introduction to the call stack, the microtask queue, and the callback
(task) queue, rather than re-explaining them from scratch.

## In This Tutorial

- Why callbacks were JavaScript's original async tool, and the real problem with them —
  **callback hell**
- How Promises fix that problem: three states, `.then`/`.catch`/`.finally`, and chaining
- How `async`/`await` is the same Promise machinery, written to *read* like synchronous code
- A live, interactive **event loop visualizer**, embedded right on this page, that steps through a
  real mix of all three — synchronous code, a `setTimeout`, a Promise, and an `async` function —
  one engine action at a time
- Why the console output order (`1, 4, 6, 3, 5, 2`) is *not* the order the code is written in, and
  exactly why not

---

## Part 1: Callbacks — the Original Async Tool

A **callback** is just a function you hand to another function, to be called *later*, once some
work finishes:

```javascript
function loadUser(id, onDone) {
  setTimeout(() => {
    // pretend this took a real network request
    onDone({ id, name: "Ayesha" });
  }, 500);
}

loadUser(7, (user) => {
  console.log("Loaded:", user.name);
});
console.log("Request sent — not waiting around for it.");
```

`loadUser` returns immediately; `onDone` only runs once the (simulated) work is actually done,
500ms later. This is the entire idea behind every async pattern in this tutorial — the difference
between callbacks, Promises, and `async`/`await` is never *whether* the program waits without
blocking, only *how readable* the waiting code is.

### Callback Hell

The trouble starts the moment one async step needs the *result* of the previous one. Each new step
has to be nested **inside** the previous callback, because that's the only place its result is
available:

```javascript
loadUser(7, (user) => {
  loadOrders(user.id, (orders) => {
    loadOrderDetails(orders[0].id, (details) => {
      console.log(details);
      // ...and every additional step nests one level deeper
    }, handleError);
  }, handleError);
}, handleError);
```

This is **callback hell** (or the "pyramid of doom") — the indentation keeps marching to the
right, error handling has to be repeated at every level, and reading the sequence of steps means
reading the code inside-out. Promises exist specifically to fix this.

!!! note "Not every callback is 'callback hell'"
    `loadUser(7, onDone)` by itself is a perfectly ordinary, fine callback — plenty of built-in
    APIs still work exactly this way (`addEventListener`, `setTimeout`). The *hell* only shows up
    once callbacks start nesting inside callbacks because each step depends on the last one's
    result — a structural problem, not a callback problem.

## Part 2: Promises — a Flat Chain Instead of a Pyramid

A **Promise** is an object representing a value that doesn't exist yet, but will — either
successfully (**fulfilled**) or with an error (**rejected**). It starts **pending** and can only
change state once, after which it's permanently **settled**.

```javascript
function loadUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id <= 0) {
        reject(new Error("Invalid user id"));
        return;
      }
      resolve({ id, name: "Ayesha" });
    }, 500);
  });
}

loadUser(7)
  .then((user) => console.log("Loaded:", user.name))
  .catch((error) => console.error("Failed:", error.message))
  .finally(() => console.log("Request finished, either way"));
```

- **`.then(onFulfilled)`** runs when the promise succeeds.
- **`.catch(onRejected)`** runs when it fails.
- **`.finally(fn)`** runs regardless — ideal for cleanup, like hiding a loading spinner.

### Chaining Fixes the Pyramid

Every `.then()` returns a **new** Promise, so the nested pyramid from Part 1 flattens into a
single, readable sequence — with **one** `.catch()` at the end catching a failure from *any* step
above it:

```javascript
loadUser(7)
  .then((user) => loadOrders(user.id))
  .then((orders) => loadOrderDetails(orders[0].id))
  .then((details) => console.log(details))
  .catch((error) => console.error("Something failed:", error.message));
```

### `Promise.all` — Running Several at Once

`Promise.all` takes an array of promises and resolves once **every** one of them has — with an
array of their results, in the same order — or rejects immediately if any single one rejects.

```javascript
const results = await Promise.all([
  loadUser(1),
  loadUser(2),
  loadUser(3),
]);
console.log(results); // all three, together, in ~500ms total — not 1500ms
```

Reach for `Promise.all` whenever you need several *independent* pieces of data before continuing —
loading a profile, its posts, and its settings all at once, instead of one after another.

## Part 3: `async`/`await` — Promises That Read Like Sync Code

`async`/`await` doesn't replace Promises — it's syntax built directly on top of them, letting
Promise-based code *read* top-to-bottom like ordinary synchronous code, while staying just as
non-blocking underneath.

```javascript
async function loadOrderSummary(userId) {
  const user = await loadUser(userId);
  const orders = await loadOrders(user.id);
  const details = await loadOrderDetails(orders[0].id);
  return details;
}
```

Two rules, and that's the whole feature:

- **`async`** in front of a function makes it always return a Promise, and unlocks `await` inside
  it.
- **`await`** pauses *that function only* (never the whole program) until the Promise it's waiting
  on settles — then "unwraps" the resolved value, or throws if the Promise rejected.

### Error Handling with `try...catch`

Because a rejected `await` throws, you catch it exactly like any other exception — no `.catch()`
chain required:

```javascript
async function loadOrderSummary(userId) {
  try {
    const user = await loadUser(userId);
    const orders = await loadOrders(user.id);
    return await loadOrderDetails(orders[0].id);
  } catch (error) {
    console.error("Could not load order summary:", error.message);
    return null;
  }
}
```

!!! tip "Three tools, one engine"
    Callbacks, `.then()` chains, and `async`/`await` are not three different ways of being
    asynchronous — they're three different pieces of *syntax* sitting on top of the exact same
    underlying machine: the **event loop**. Part 4 makes that machine visible.

## Part 4: The Event Loop, Visualized

JavaScript runs on a single thread — it can only execute one thing at a time, on one **call
stack**. Every `setTimeout`, every Promise callback, every `await` continuation has to wait its
turn to get back onto that stack, and the **event loop** is the mechanism that decides *when* and
*in what order* that happens. The rule, in one sentence:

> Run all synchronous code first. Once the call stack is empty, drain the **entire** microtask
> queue (Promises, `async`/`await`) before running even one task from the callback queue
> (`setTimeout`, `setInterval`, DOM events).

That single rule explains output that looks baffling at first glance. Here's the exact code the
visualizer below runs, step by step:

```javascript
console.log("1: start");

setTimeout(() => {
  console.log("2: timeout callback");
}, 0);

Promise.resolve().then(() => {
  console.log("3: promise callback");
});

async function asyncFn() {
  console.log("4: async start");
  await null;
  console.log("5: async resumed");
}
asyncFn();

console.log("6: end");
```

Even with the timer's delay set to `0`, the real console output is **`1, 4, 6, 3, 5, 2`** — never
`1, 2, 3, 4, 5, 6`. Step through it below, one engine action at a time, and watch exactly why.

<div class="elv-widget" id="elv-widget">
<div class="elv-code-pane">
<div class="elv-code-title">script.js</div>
<div class="elv-code" id="elv-code"></div>
</div>
<div class="elv-controls">
<button type="button" id="elv-reset">&#8634; Reset</button>
<button type="button" id="elv-prev">&#9664; Prev</button>
<button type="button" id="elv-play">&#9654; Play</button>
<button type="button" id="elv-next">Next &#9654;</button>
<span class="elv-counter" id="elv-counter"></span>
</div>
<div class="elv-main">
<div class="elv-panels">
<div class="elv-panel elv-panel-stack">
<div class="elv-panel-title">Call Stack</div>
<div class="elv-stack" id="elv-stack"></div>
</div>
<div class="elv-panel">
<div class="elv-panel-title">Web APIs</div>
<div class="elv-list" id="elv-webapi"></div>
</div>
<div class="elv-panel">
<div class="elv-panel-title">Microtask Queue</div>
<div class="elv-list" id="elv-micro"></div>
</div>
<div class="elv-panel">
<div class="elv-panel-title">Callback Queue</div>
<div class="elv-list" id="elv-macro"></div>
</div>
</div>
<div class="elv-console">
<div class="elv-panel-title">Console Output</div>
<div class="elv-console-lines" id="elv-console-lines"></div>
</div>
</div>
<div class="elv-note" id="elv-note">Click <strong>Next</strong> (or <strong>Play</strong>) to start executing the script, one step at a time.</div>
</div>
<style>
.elv-widget{border:1px solid var(--cu-border-soft,#D8DCE3);border-radius:14px;padding:1.2rem;margin:1.4rem 0;background:var(--cu-surface,#F7F8FA);font-family:Arial,Helvetica,sans-serif;}
.elv-code-pane{margin-bottom:1rem;}
.elv-code-title{font-size:0.75rem;font-weight:700;letter-spacing:0.05em;color:var(--cu-faint,#7A8496);text-transform:uppercase;margin-bottom:0.4rem;}
.elv-code{background:#1F2429;color:#E8EAED;border-radius:8px;padding:0.9rem 1rem;font-family:"Courier New",Courier,monospace;font-size:0.82rem;line-height:1.55;overflow-x:auto;margin:0;}
.elv-code .elv-line{display:block;padding:0 0.4rem;border-radius:4px;white-space:pre;}
.elv-code .elv-line.elv-active{background:#c9680f55;outline:1px solid #c9680f;}
.elv-main{display:flex;flex-direction:column;gap:0.9rem;}
.elv-panels{display:grid;grid-template-columns:repeat(4,1fr);gap:0.7rem;}
.elv-panel{background:var(--cu-card,#FFFFFF);border:1px solid var(--cu-border-soft,#D8DCE3);border-radius:10px;padding:0.6rem;min-height:150px;}
.elv-panel-title{font-size:0.72rem;font-weight:700;letter-spacing:0.04em;color:var(--cu-faint,#7A8496);text-transform:uppercase;margin-bottom:0.5rem;}
.elv-stack{display:flex;flex-direction:column-reverse;gap:0.3rem;min-height:100px;}
.elv-list{display:flex;flex-direction:column;gap:0.3rem;min-height:100px;}
.elv-frame{background:#2b2b7a;color:#fff;border-radius:6px;padding:0.35rem 0.5rem;font-size:0.76rem;font-family:"Courier New",Courier,monospace;animation:elv-pop-in 0.25s ease;}
.elv-frame-webapi{background:#1C7293;}
.elv-frame-micro{background:#3FA66B;}
.elv-frame-macro{background:#B9720E;}
@keyframes elv-pop-in{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
.elv-console{background:var(--cu-card,#FFFFFF);border:1px solid var(--cu-border-soft,#D8DCE3);border-radius:10px;padding:0.6rem;}
.elv-console-lines{font-family:"Courier New",Courier,monospace;font-size:0.8rem;color:#1F2429;min-height:2rem;}
.elv-console-lines div{padding:0.1rem 0;}
.elv-note{margin-top:1rem;background:#E9EDFB;border:1px solid #6C7FD6;color:#262b40;border-radius:8px;padding:0.6rem 0.8rem;font-size:0.85rem;min-height:1.4em;}
.elv-controls{display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap;}
.elv-controls button{background:#c9680f;color:#fff;border:none;border-radius:6px;padding:0.4rem 0.8rem;font-weight:700;font-size:0.8rem;cursor:pointer;}
.elv-controls button:disabled{background:#ccc;cursor:not-allowed;}
.elv-counter{margin-left:auto;font-size:0.8rem;color:var(--cu-faint,#7A8496);font-family:"Courier New",Courier,monospace;}
@media screen and (max-width:52em){.elv-panels{grid-template-columns:repeat(2,1fr);}}
</style>
<script>
(function () {
  var CODE_LINES = [
    'console.log("1: start");',
    '',
    'setTimeout(() => {',
    '  console.log("2: timeout callback");',
    '}, 0);',
    '',
    'Promise.resolve().then(() => {',
    '  console.log("3: promise callback");',
    '});',
    '',
    'async function asyncFn() {',
    '  console.log("4: async start");',
    '  await null;',
    '  console.log("5: async resumed");',
    '}',
    'asyncFn();',
    '',
    'console.log("6: end");'
  ];

  var STEPS = [
    { hl: [], stack: [], webapi: [], micro: [], macro: [], out: [], note: 'Click Next (or Play) to start executing the script, one step at a time.' },
    { hl: [1], stack: ['main()', 'console.log()'], webapi: [], micro: [], macro: [], out: ['1: start'], note: "console.log('1: start') runs immediately — call stack: main() → console.log()." },
    { hl: [1], stack: ['main()'], webapi: [], micro: [], macro: [], out: ['1: start'], note: 'console.log() returns and is popped off the stack. Line 1 is done.' },
    { hl: [3, 4, 5], stack: ['main()'], webapi: ['setTimeout (0ms)'], micro: [], macro: [], out: ['1: start'], note: "setTimeout hands its callback to the browser's Web APIs and returns immediately — it does NOT block for 0ms." },
    { hl: [7, 8, 9], stack: ['main()'], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()'], macro: [], out: ['1: start'], note: 'Promise.resolve() is already fulfilled, so its .then() callback goes straight into the Microtask Queue.' },
    { hl: [16], stack: ['main()', 'asyncFn()'], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()'], macro: [], out: ['1: start'], note: 'asyncFn() is called — a new frame is pushed onto the call stack.' },
    { hl: [12], stack: ['main()', 'asyncFn()'], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()'], macro: [], out: ['1: start', '4: async start'], note: "Inside asyncFn, console.log('4: async start') runs synchronously, same as any normal function call." },
    { hl: [13], stack: ['main()'], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()', 'asyncFn (after await)'], macro: [], out: ['1: start', '4: async start'], note: "await null pauses asyncFn right here. Everything AFTER it is scheduled as a microtask, and asyncFn's frame pops off — control returns to main()." },
    { hl: [18], stack: ['main()'], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()', 'asyncFn (after await)'], macro: [], out: ['1: start', '4: async start', '6: end'], note: "console.log('6: end') runs — the last line of synchronous code in the script." },
    { hl: [], stack: [], webapi: ['setTimeout (0ms)'], micro: ['Promise .then()', 'asyncFn (after await)'], macro: [], out: ['1: start', '4: async start', '6: end'], note: 'Synchronous script finished — main() pops off. The call stack is now completely EMPTY.' },
    { hl: [8], stack: ['Promise .then()'], webapi: ['setTimeout (0ms)'], micro: ['asyncFn (after await)'], macro: [], out: ['1: start', '4: async start', '6: end'], note: 'Event loop: stack is empty, so it checks the Microtask Queue FIRST — before the Callback Queue — and takes the oldest microtask.' },
    { hl: [8], stack: [], webapi: ['setTimeout (0ms)'], micro: ['asyncFn (after await)'], macro: [], out: ['1: start', '4: async start', '6: end', '3: promise callback'], note: 'That microtask runs, logs its message, and the stack empties again.' },
    { hl: [14], stack: ['asyncFn (resumed)'], webapi: ['setTimeout (0ms)'], micro: [], macro: [], out: ['1: start', '4: async start', '6: end', '3: promise callback'], note: 'The Microtask Queue still had one more item — the event loop ALWAYS drains it completely before ever touching the Callback Queue.' },
    { hl: [14], stack: [], webapi: ['setTimeout (0ms)'], micro: [], macro: [], out: ['1: start', '4: async start', '6: end', '3: promise callback', '5: async resumed'], note: 'asyncFn resumes right after its await and logs its final line.' },
    { hl: [3, 4, 5], stack: [], webapi: [], micro: [], macro: ['setTimeout callback'], out: ['1: start', '4: async start', '6: end', '3: promise callback', '5: async resumed'], note: 'The Microtask Queue is finally empty. NOW the event loop looks at the Callback Queue — the timer already elapsed, so its callback moves there.' },
    { hl: [4], stack: ['setTimeout callback'], webapi: [], micro: [], macro: [], out: ['1: start', '4: async start', '6: end', '3: promise callback', '5: async resumed'], note: 'The stack is empty, so the event loop finally takes a task from the Callback Queue and runs it.' },
    { hl: [], stack: [], webapi: [], micro: [], macro: [], out: ['1: start', '4: async start', '6: end', '3: promise callback', '5: async resumed', '2: timeout callback'], note: 'Done! Final order: 1, 4, 6, 3, 5, 2 — all synchronous code, then every microtask, then the one macrotask. That’s the whole trick behind the event loop.' }
  ];

  var codeEl = document.getElementById('elv-code');
  var stackEl = document.getElementById('elv-stack');
  var webapiEl = document.getElementById('elv-webapi');
  var microEl = document.getElementById('elv-micro');
  var macroEl = document.getElementById('elv-macro');
  var consoleEl = document.getElementById('elv-console-lines');
  var noteEl = document.getElementById('elv-note');
  var counterEl = document.getElementById('elv-counter');
  var prevBtn = document.getElementById('elv-prev');
  var nextBtn = document.getElementById('elv-next');
  var playBtn = document.getElementById('elv-play');
  var resetBtn = document.getElementById('elv-reset');

  if (!codeEl) { return; }

  CODE_LINES.forEach(function (line, i) {
    var div = document.createElement('div');
    div.className = 'elv-line';
    div.id = 'elv-line-' + (i + 1);
    div.textContent = line.length ? line : ' ';
    codeEl.appendChild(div);
  });

  var current = 0;
  var playTimer = null;

  function renderList(el, items, frameClass) {
    el.innerHTML = '';
    items.forEach(function (text) {
      var div = document.createElement('div');
      div.className = 'elv-frame ' + frameClass;
      div.textContent = text;
      el.appendChild(div);
    });
  }

  function render() {
    var step = STEPS[current];

    for (var i = 1; i <= CODE_LINES.length; i++) {
      var lineEl = document.getElementById('elv-line-' + i);
      if (lineEl) { lineEl.classList.remove('elv-active'); }
    }
    step.hl.forEach(function (n) {
      var lineEl = document.getElementById('elv-line-' + n);
      if (lineEl) { lineEl.classList.add('elv-active'); }
    });

    renderList(stackEl, step.stack.slice().reverse(), 'elv-frame-stack');
    renderList(webapiEl, step.webapi, 'elv-frame-webapi');
    renderList(microEl, step.micro, 'elv-frame-micro');
    renderList(macroEl, step.macro, 'elv-frame-macro');

    consoleEl.innerHTML = '';
    step.out.forEach(function (line) {
      var div = document.createElement('div');
      div.textContent = '› ' + line;
      consoleEl.appendChild(div);
    });

    noteEl.textContent = step.note;
    counterEl.textContent = 'Step ' + current + ' / ' + (STEPS.length - 1);
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === STEPS.length - 1;
    if (current === STEPS.length - 1) { stopPlay(); }
  }

  function goNext() {
    if (current < STEPS.length - 1) { current++; render(); }
  }
  function goPrev() {
    if (current > 0) { current--; render(); }
  }
  function reset() {
    stopPlay();
    current = 0;
    render();
  }
  function stopPlay() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; playBtn.textContent = '▶ Play'; }
  }
  function togglePlay() {
    if (playTimer) {
      stopPlay();
      return;
    }
    playBtn.textContent = '⏸ Pause';
    playTimer = setInterval(function () {
      if (current >= STEPS.length - 1) { stopPlay(); return; }
      goNext();
    }, 1400);
  }

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);
  resetBtn.addEventListener('click', reset);
  playBtn.addEventListener('click', togglePlay);

  render();
})();
</script>

!!! tip "Nothing here is specific to this one example"
    Swap in any mix of `setTimeout`, `.then()`, and `await` and the same two rules still decide
    the order: synchronous code runs first, then the *entire* microtask queue drains, then one
    task from the callback queue runs — and the loop repeats. That's the complete mental model,
    for any program you'll ever read or write.

## Try It Yourself

1. In the code above, change the timer's delay from `0` to a very large number like `5000` in your
   head — does the *order* of the six log lines change at all? (It doesn't — the callback queue is
   only ever checked *after* the microtask queue is empty, no matter how short the delay is.)
2. Add a second `Promise.resolve().then(() => console.log("7: second promise"))` right after the
   first one. Predict where `"7"` lands in the final order before checking — it should land
   immediately after `"3"`, since the microtask queue is first-in-first-out and both are already
   sitting in it before the stack ever empties.
3. In a real file, write a `loadUser`/`loadOrders`/`loadOrderDetails` callback chain like Part 1's,
   then rewrite it twice — once with Promise chaining, once with `async`/`await` and
   `try...catch`. All three should produce identical output; only the readability changes.
4. Using `Promise.all`, write a function that loads three independent pieces of data at once and
   logs how long the whole thing took with `console.time`/`console.timeEnd` — compare that against
   loading the same three things with three separate `await` calls in sequence.

## Key Takeaways

- A **callback** is a function handed to another function to run later; nesting callbacks whose
  results depend on each other produces **callback hell** — the problem Promises exist to solve.
- A **Promise** is pending, then settles exactly once, into fulfilled or rejected.
  `.then()`/`.catch()`/`.finally()` react to that settlement, and chaining `.then()` calls flattens
  what used to be a nested pyramid into a single, linear sequence.
- **`async`/`await`** is the same Promise machinery, written to read top-to-bottom like synchronous
  code — `await` only pauses the function it's inside, never the whole program, and errors are
  handled with ordinary `try...catch`.
- The **event loop**'s whole job is one rule: finish all synchronous code, then drain the
  **entire** microtask queue (Promises, `await`), then run **one** task from the callback queue
  (`setTimeout`, DOM events) — then repeat.
- This is exactly why a `Promise.resolve().then(...)` always runs before a `setTimeout(..., 0)`,
  no matter how the code is ordered on the page — microtasks are a strictly higher-priority queue,
  not just a faster timer.
