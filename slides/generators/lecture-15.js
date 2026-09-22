const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-15";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 15: Asynchronous JavaScript: Promises and Fetch API",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-15-Async-JavaScript-Promises-and-Fetch.pptx",
  slides: [
    { type: "title", lectureNo: 15, heading: "Asynchronous JavaScript:\nPromises and Fetch",
      sub: "How JavaScript waits on things that take time — without ever freezing the page." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Synchronous vs. asynchronous execution, the event loop, task queue, and \"callback hell\"",
      "Promises: their three states, .then/.catch/.finally, chaining, and Promise.all",
      "async/await, and error handling with try...catch",
      "Making real network requests with the Fetch API: GET/POST, headers, response parsing, and CORS",
    ] },

    { type: "code", kicker: "Synchronous Execution", heading: "One Line at a Time",
      code: 'console.log("1");\nconsole.log("2");\nconsole.log("3");\n// Always prints: 1, 2, 3 -- in that exact order, with no gaps',
      note: "Each instruction must finish before the next one starts. This is how almost all the code you've written so far behaves." },

    { type: "code", kicker: "Asynchronous Execution", heading: "Some Things Happen \"Later\"",
      code: 'console.log("1");\nsetTimeout(() => console.log("2"), 1000); // scheduled, doesn\'t block\nconsole.log("3");\n// Prints: 1, 3, 2 -- "2" appears about a second later!',
      note: "JavaScript starts the operation, moves on immediately, and comes back to handle the result once it's ready." },

    { type: "codeImageSide", kicker: "Asynchronous Execution", heading: "The Exact Code, Live",
      code: 'console.log("1");\nsetTimeout(() =>\n  console.log("2"), 150);\nconsole.log("3");',
      img: `${IMG}/sync-vs-async-live.png` },

    { type: "bullets", kicker: "Why This Matters", heading: "JavaScript Is Single-Threaded", items: [
      "The browser can only do one thing at a time on that one thread",
      "A blocking operation would freeze buttons, scrolling, and animations until it finished",
      "Timers, network requests, and file reads are handed off so the thread stays free to keep the page responsive",
    ] },

    { type: "flow", kicker: "The Event Loop", heading: "How setTimeout(fn, 1000) Actually Runs",
      steps: [
        { label: "console.log(\"1\")\nruns on the\ncall stack" },
        { label: "setTimeout\nhanded off to the\nBrowser / Web APIs" },
        { label: "console.log(\"3\")\nruns -- stack\nis now empty" },
        { label: "After 1000ms, the\ncallback is placed\nin the task queue" },
        { label: "Event loop moves it\nto the stack --\nlogs \"2\"" },
      ],
      caption: "The event loop constantly checks: is the call stack empty? If yes, it takes the next item from the queue and runs it." },

    { type: "callout", kicker: "The Event Loop", heading: "Microtasks Run Before Macrotasks", kind: "note", h: 1.9,
      text: "Promise callbacks (.then, async/await) go into a special microtask queue that the event loop always empties completely before it looks at the regular task queue (where setTimeout callbacks live). This is why Promise.resolve().then(...) scheduled after setTimeout(..., 0) usually still runs first." },

    { type: "bullets", kicker: "Before Promises", heading: "Callback Hell", items: [
      "Before Promises existed, async code was handled with callbacks -- functions passed in to be called later",
      "When one async step depends on the result of the previous one, callbacks nest deeper and deeper",
      "Nicknamed \"callback hell\" or the \"pyramid of doom\" -- hard to read, hard to maintain",
    ] },

    { type: "code", kicker: "Before Promises", heading: "The Pyramid of Doom",
      code: 'getUser(userId, function (user) {\n  getOrders(user.id, function (orders) {\n    getOrderDetails(orders[0].id, function (details) {\n      console.log(details);\n      // ...and it keeps growing to the right with every extra step\n    }, handleError);\n  }, handleError);\n}, handleError);' },

    { type: "bullets", kicker: "Promises", heading: "What Is a Promise?", items: [
      "An object representing a value that isn't available yet, but will be at some point -- either successfully, or with an error",
      "Think of it as a receipt for a value that's still being prepared",
    ] },

    { type: "diagram", kicker: "Promises", heading: "The Three States",
      nodes: [
        { x: 5.1, y: 2.6, w: 3.1, h: 0.65, text: "Pending", shape: "roundRect", fill: "5D5D72", fontSize: 14 },
        { x: 1.3, y: 4.6, w: 3.4, h: 0.65, text: "Fulfilled", shape: "roundRect", fill: "3FA66B", fontSize: 14 },
        { x: 8.2, y: 4.6, w: 3.4, h: 0.65, text: "Rejected", shape: "roundRect", fill: "E67528", fontSize: 14 },
      ],
      edges: [
        { x1: 5.6, y1: 3.25, x2: 3.0, y2: 4.6, label: "operation\nsucceeds" },
        { x1: 7.0, y1: 3.25, x2: 9.9, y2: 4.6, label: "operation\nfails" },
      ],
      caption: "A promise is settled once it becomes fulfilled or rejected, and it can never change state again after that." },

    { type: "code", kicker: "Promises", heading: "Creating and Using a Promise",
      code: 'function delay(ms) {\n  return new Promise((resolve, reject) => {\n    if (ms < 0) { reject(new Error("Delay cannot be negative")); return; }\n    setTimeout(() => resolve(`Waited ${ms}ms`), ms);\n  });\n}\n\ndelay(1000)\n  .then(result => console.log(result))    // fulfilled\n  .catch(error => console.error(error))   // rejected\n  .finally(() => console.log("Done, either way")); // always runs' },

    { type: "codeImageSide", kicker: "Promises", heading: "delay().then/.catch/.finally, Live",
      code: 'delay(150)\n  .then(result =>\n    log(result))\n  .catch(error =>\n    log("ERROR: " +\n      error.message))\n  .finally(() =>\n    log("Done, either way"));',
      img: `${IMG}/promise-then-catch-finally-live.png` },

    { type: "code", kicker: "Promises", heading: "Chaining Promises",
      code: 'getUser(userId)\n  .then(user => getOrders(user.id))              // after getUser resolves\n  .then(orders => getOrderDetails(orders[0].id)) // after getOrders resolves\n  .then(details => console.log(details))         // after getOrderDetails resolves\n  .catch(error => console.error("Something failed:", error)); // catches ANY step',
      note: "Each .then() returns a NEW promise, which is what makes chaining possible -- one .catch() at the end catches an error from any step." },

    { type: "code", kicker: "Promises", heading: "Promise.all",
      code: 'const promise1 = delay(1000).then(() => "First");\nconst promise2 = delay(500).then(() => "Second");\nconst promise3 = delay(1500).then(() => "Third");\n\nPromise.all([promise1, promise2, promise3]).then(results => {\n  console.log(results); // ["First","Second","Third"] -- after ~1500ms, not 3000ms\n});',
      note: "Fulfills only once ALL promises have fulfilled, or rejects immediately if any ONE of them rejects -- ideal for independent data loaded in parallel." },

    { type: "codeImageSide", kicker: "Promises", heading: "Promise.all, Live",
      code: 'const promise1 =\n  delay(100).then(() => "First");\nconst promise2 =\n  delay(50).then(() => "Second");\nconst promise3 =\n  delay(150).then(() => "Third");\n\nPromise.all(\n  [promise1, promise2, promise3]\n).then(results => { ... });',
      img: `${IMG}/promise-all-live.png` },

    { type: "bullets", kicker: "async/await", heading: "Two Rules", items: [
      "async before a function makes it always return a Promise, and allows await inside it",
      "await pauses execution of THAT function (not the whole program) until the promise settles, then unwraps the resolved value -- or throws if it rejected",
    ] },

    { type: "code", kicker: "async/await", heading: "Reads Like Synchronous Code",
      code: 'async function loadOrderDetails(userId) {\n  const user = await getUser(userId);       // "pause" until the promise settles\n  const orders = await getOrders(user.id);\n  const details = await getOrderDetails(orders[0].id);\n  return details;\n}' },

    { type: "code", kicker: "async/await", heading: "Error Handling with try...catch",
      code: 'async function loadOrderDetails(userId) {\n  try {\n    const user = await getUser(userId);\n    const orders = await getOrders(user.id);\n    const details = await getOrderDetails(orders[0].id);\n    return details;\n  } catch (error) {\n    console.error("Failed to load order details:", error.message);\n    throw error; // re-throw if the caller also needs to know\n  }\n}' },

    { type: "codeImageSide", kicker: "async/await", heading: "try...catch, Live (getUser rejects)",
      code: 'async function loadOrderDetails(id) {\n  try {\n    const user =\n      await getUser(id);\n    return user;\n  } catch (error) {\n    log("caught: " +\n      error.message);\n    throw error;\n  }\n}',
      img: `${IMG}/async-await-trycatch-live.png` },

    { type: "callout", kicker: "async/await", heading: "async/await vs. .then Chains", kind: "tip", h: 1.7,
      text: "They do the same job -- async/await is just easier to read, especially with multiple sequential steps and conditional logic. You will see both styles in real codebases, but prefer async/await for new code you write." },

    { type: "bullets", kicker: "AJAX and Fetch", heading: "What Is AJAX?", items: [
      "The general technique of a web page requesting data from a server in the background, without a full page reload",
      "The name is historical (Asynchronous JavaScript and XML) -- today it almost always means JSON, not XML",
      "The modern, built-in tool for doing this is the Fetch API",
    ] },

    { type: "code", kicker: "Fetch API", heading: "A GET Request",
      code: 'async function loadStudents() {\n  const response = await fetch("https://api.example.com/students");\n  const students = await response.json(); // parses the body as JSON\n  console.log(students);\n}',
      note: 'fetch(url) resolves with a Response once headers arrive -- it resolves even for 404s; it only REJECTS on a genuine network failure.' },

    { type: "code", kicker: "Fetch API", heading: "Always Check response.ok",
      code: 'async function loadStudents() {\n  const response = await fetch("https://api.example.com/students");\n  if (!response.ok) {\n    throw new Error(`Request failed with status ${response.status}`);\n  }\n  const students = await response.json();\n  return students;\n}' },

    { type: "codeImageSide", kicker: "Fetch API", heading: "The Exact GET Code, Live",
      code: 'const response =\n  await fetch(url);\nresponse.ok;\nresponse.status;\n\nconst students =\n  await response.json();',
      img: `${IMG}/fetch-get-live.png` },

    { type: "code", kicker: "Fetch API", heading: "A POST Request with Headers",
      code: 'async function createStudent(newStudent) {\n  const response = await fetch("https://api.example.com/students", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(newStudent), // JS object -> JSON text\n  });\n  if (!response.ok) throw new Error(`Failed to create student: ${response.status}`);\n  return response.json();\n}',
      note: 'Content-Type: application/json tells the server "the body I\'m sending is JSON text," so it knows how to parse it.' },

    { type: "table", kicker: "Fetch API", heading: "Parsing Different Response Types",
      header: ["Method", "Parses the body as"], colW: [3.6, 8.4], leftCol: 0,
      rows: [
        ["response.json()", "JSON -- the most common case"],
        ["response.text()", "Plain text"],
        ["response.blob()", "Raw binary data (e.g. an image)"],
      ],
      note: "You can only read a response body ONCE -- call one parsing method per response." },

    { type: "code", kicker: "Fetch API", heading: "Putting It Together with Promise.all",
      code: 'async function fetchAllPages() {\n  try {\n    const [usersRes, postsRes] = await Promise.all([\n      fetch("https://api.example.com/users"),\n      fetch("https://api.example.com/posts"),\n    ]);\n    const users = await usersRes.json();\n    const posts = await postsRes.json();\n    console.log(users, posts);\n  } catch (error) {\n    console.error("Network error:", error.message);\n  }\n}' },

    { type: "bullets", kicker: "CORS Basics", heading: "Cross-Origin Resource Sharing", items: [
      "A browser security rule restricting JS on one origin (protocol + domain + port) from freely reading responses from a different origin",
      "The server decides who is allowed, via an Access-Control-Allow-Origin response header",
      "CORS is enforced by the BROWSER, not your JavaScript -- you cannot \"fix\" a CORS error from the frontend",
    ] },

    { type: "diagram", kicker: "CORS Basics", heading: "How the Browser Checks CORS",
      nodes: [
        { x: 0.9, y: 2.4, w: 3.6, h: 0.6, text: "Browser\nfetch(\"https://api.example.com/data\")", fill: "2B2B7A", fontSize: 11 },
        { x: 8.9, y: 2.4, w: 3.5, h: 0.6, text: "api.example.com", fill: "2B2B7A", fontSize: 12.5 },
        { x: 4.9, y: 3.7, w: 3.5, h: 0.85, text: "Access-Control-\nAllow-Origin\nallows this origin?", shape: "diamond", fill: "FF8A3D", fontSize: 11 },
        { x: 1.0, y: 5.3, w: 4.2, h: 0.6, text: "JS can read the response", fill: "3FA66B", fontSize: 12.5 },
        { x: 8.0, y: 5.3, w: 4.3, h: 0.6, text: "Browser BLOCKS the JS\nfrom reading it (CORS error)", fill: "E67528", fontSize: 12 },
      ],
      edges: [
        { x1: 4.5, y1: 2.7, x2: 8.9, y2: 2.7, label: "request" },
        { x1: 9.5, y1: 3.0, x2: 6.65, y2: 3.7, label: "response + header" },
        { x1: 5.8, y1: 4.55, x2: 3.1, y2: 5.3, label: "Yes" },
        { x1: 7.3, y1: 4.2, x2: 10.1, y2: 5.3, label: "No" },
      ],
      caption: "The network request may technically succeed either way -- CORS only controls whether your JavaScript is allowed to read the response." },

    { type: "callout", kicker: "CORS Basics", heading: "CORS Is Not Something You Can Bypass", kind: "warning", h: 1.9,
      text: "If you see a CORS error, the fix belongs on the server (adding the right Access-Control-Allow-Origin header), not in your fetch call. You'll work with server configuration, including CORS, starting in Unit 5." },

    { type: "closing", heading: "Lecture 15 in Six Points", items: [
      "Synchronous code blocks the single JS thread; asynchronous code lets long operations happen in the background without freezing the page.",
      "The event loop moves finished tasks from the queue onto the call stack whenever it's empty -- this is how setTimeout and Promise callbacks run.",
      "A Promise moves through pending, fulfilled, and rejected; chaining .then() calls replaces nested callback hell.",
      "Promise.all runs multiple promises in parallel and waits for all of them, or fails fast if any one rejects.",
      "async/await is Promise-based syntax that reads like synchronous code; errors are handled with ordinary try...catch.",
      "fetch() rejects only on true network failure, not on HTTP error codes -- always check response.ok; CORS is a browser rule enforced via response headers, fixable only on the server.",
    ] },
  ],
});
