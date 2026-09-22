const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-16";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 16: Introduction to Server-Side Programming",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-16-Introduction-to-Server-Side-Programming.pptx",
  slides: [
    { type: "title", lectureNo: 16, heading: "Introduction to\nServer-Side Programming",
      sub: "Taking the JavaScript you already know and using it to build the other half of a web app." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Client-side vs. server-side responsibilities",
      "Web server, application server, and runtime environment -- what each term actually means",
      "Node.js as a JavaScript runtime, and how it stays fast with the event loop and non-blocking I/O",
      "npm (Node Package Manager) and package.json",
      "Setting up a new Express.js project from scratch",
      "Building your first web server and a basic route",
    ] },

    { type: "bullets", kicker: "Two Sides", heading: "Client-Side Responsibilities", items: [
      "Rendering the page the user sees",
      "Responding to clicks, typing, and other user interactions",
      "Validating a form before sending it (nicer UX -- never trust this alone)",
      "Making requests to a server for data, using fetch (Lecture 15)",
    ] },

    { type: "bullets", kicker: "Two Sides", heading: "Server-Side Responsibilities", items: [
      "Deciding what data to send back for a given request",
      "Talking to a database to read or save information",
      "Checking whether a user is allowed to see or change something (authentication and authorization)",
      "Enforcing business rules the client should never be trusted to enforce alone",
    ] },

    { type: "callout", kicker: "Two Sides", heading: "Client-Side Code Is Public", kind: "note", h: 1.9,
      text: "Anyone can open their browser's developer tools and read, and even change, your client-side JavaScript. Any check that truly matters -- \"is this password correct?\", \"does this user own this post?\" -- must be done AGAIN on the server, which the user cannot tamper with." },

    { type: "table", kicker: "Two Sides", heading: "Client-Side vs. Server-Side",
      header: ["", "Client-side", "Server-side"], colW: [2.4, 4.7, 4.8], leftCol: 0, rowH: 0.68,
      rows: [
        ["Runs on", "The user's device (browser)", "A computer you control"],
        ["Seen/edited by user?", "Yes", "No"],
        ["Typical languages", "HTML, CSS, JavaScript", "JavaScript (Node.js), Python, Java, PHP..."],
        ["Typical job", "Display, interactivity, UX", "Data, business logic, security, storage"],
      ] },

    { type: "diagram", kicker: "Two Sides", heading: "The Two Sides Talk Over HTTP",
      nodes: [
        { x: 0.7, y: 3.0, w: 2.4, h: 0.75, text: "Client\n(Browser)", fill: "2B2B7A", fontSize: 13 },
        { x: 5.4, y: 3.0, w: 2.8, h: 0.75, text: "Server\n(Node.js + Express)", fill: "2B2B7A", fontSize: 11.5 },
        { x: 10.5, y: 3.0, w: 2.13, h: 0.75, text: "Database", fill: "5D5D72", fontSize: 12.5 },
      ],
      edges: [
        { x1: 3.1, y1: 3.25, x2: 5.4, y2: 3.25, label: "GET /api/books" },
        { x1: 5.4, y1: 3.65, x2: 3.1, y2: 3.65, label: "JSON response" },
        { x1: 8.2, y1: 3.25, x2: 10.5, y2: 3.25, label: "query" },
        { x1: 10.5, y1: 3.65, x2: 8.2, y2: 3.65, label: "records" },
      ],
      caption: "The same request-response pattern from Lecture 1 -- JavaScript on the client then uses the data to update the page." },

    { type: "cards", kicker: "Three Terms", heading: "Web Server vs. App Server vs. Runtime", cards: [
      { heading: "Web Server", accent: "2B2B7A", body: [
        "Listens for HTTP requests, sends back HTTP responses",
        "Just speaks HTTP -- receive a request, send a response",
        "Examples: Apache, Nginx, or a Node.js server you build",
      ] },
      { heading: "Application Server", accent: "E67528", body: [
        "Runs your app's actual logic -- decides WHAT to send back",
        "In small Express projects, this is the SAME program as the web server",
        "Can be a separate piece of software in larger systems",
      ] },
      { heading: "Runtime Environment", accent: "5D5D72", body: [
        "The software that actually executes your code",
        "A browser's runtime gives JS the DOM, fetch, localStorage",
        "Node.js's runtime gives JS the file system and network instead",
      ] },
    ] },

    { type: "callout", kicker: "Three Terms", heading: "Why Can't JavaScript Just Run Anywhere?", kind: "note", h: 2.1,
      text: "JavaScript, as a language, only defines variables, functions, loops, objects. It does NOT define how to read a file or open a network connection -- those abilities are added by whatever environment runs the code. Node.js deliberately leaves out browser-only things like the DOM." },

    { type: "bullets", kicker: "Node.js", heading: "A JavaScript Runtime Outside the Browser", items: [
      "Node.js (\"Node\") lets you run JavaScript directly on a computer, outside any browser -- including on a server",
      "Built in 2009 on top of Chrome's V8 engine -- the same engine that runs JS inside Chrome",
      "Adds capabilities a browser withholds: reading/writing files, listening for network connections",
      "The SAME language you already know can now write your server -- no new language required",
    ] },

    { type: "bullets", kicker: "Event Loop", heading: "I/O and Blocking", items: [
      "I/O (Input/Output): any operation where your program talks to something outside itself and waits -- reading a file, querying a database, a network request",
      "These are typically thousands of times slower than running JavaScript in memory",
      "A blocking operation freezes the ENTIRE program until it finishes -- like one cashier who stops serving everyone else to find one item",
    ] },

    { type: "bullets", kicker: "Event Loop", heading: "Node.js Uses Non-Blocking I/O Instead", items: [
      "When Node starts a slow operation, it does NOT wait around -- it hands off the task and moves on",
      "When the slow task finishes, Node is notified and runs the code attached to handle the result",
      "This lets one Node.js process serve many clients at once, even though it only does one thing at any single instant",
    ] },

    { type: "flow", kicker: "Event Loop", heading: "Non-Blocking I/O in Action",
      steps: [
        { label: "Request 1 arrives,\nneeds a DB query" },
        { label: "Node hands the query\nto the OS / DB driver" },
        { label: "Node stays free --\nhandles Requests 2, 3" },
        { label: "DB query for\nRequest 1 finishes" },
        { label: "Callback runs --\nresponds to Request 1" },
      ],
      caption: "The event loop constantly checks: is there a finished task waiting for its callback? If so, run it. If not, keep checking." },

    { type: "callout", kicker: "Event Loop", heading: "This Is Why Lecture 15 Mattered", kind: "tip", h: 1.7,
      text: "Server-side Node.js code is full of non-blocking operations -- reading files, querying databases, calling other APIs -- and you will use async/await constantly to write that code cleanly." },

    { type: "callout", kicker: "Event Loop", heading: "Non-Blocking I/O Doesn't Help Everything", kind: "warning", h: 2.0,
      text: "It only helps with waiting on EXTERNAL things (disk, network, database). A huge, slow calculation directly in JavaScript WILL block the single thread and freeze your entire server for every user. Node.js is great at \"wait for many slow things at once,\" not at \"crunch huge amounts of pure computation.\"" },

    { type: "bullets", kicker: "npm", heading: "The Node Package Manager", items: [
      "Almost no real project is written entirely from scratch -- developers rely on packages (libraries/modules)",
      "npm is installed automatically alongside Node.js, and lets you download, install, and manage packages",
      "npm also maintains the world's largest registry of JavaScript packages, at npmjs.com",
    ] },

    { type: "code", kicker: "npm", heading: "Every Project Has a package.json",
      code: '{\n  "name": "my-first-server",\n  "version": "1.0.0",\n  "main": "index.js",\n  "scripts": { "start": "node index.js" },\n  "dependencies": { "express": "^4.19.2" }\n}',
      note: "Lists basic project info, your dependencies, and custom shortcut commands (scripts) like starting your server." },

    { type: "bullets", kicker: "npm", heading: "node_modules", items: [
      "Installing a package downloads its code into a folder called node_modules, and records it in package.json",
      "node_modules is never committed to version control (excluded via .gitignore)",
      "Anyone can recreate it exactly by running npm install with no arguments -- npm reads package.json and fetches every listed dependency",
    ] },

    { type: "bullets", kicker: "Express.js", heading: "The Most Widely Used Node.js Web Framework", items: [
      "A framework handles common, repeated tasks for you: parsing requests, matching URLs to your code, sending responses",
      "Lets you focus on your application's actual logic instead of rebuilding these basics every time",
    ] },

    { type: "callout", kicker: "Express.js", heading: "Express Is Not Your Only Option", kind: "note", h: 2.0,
      text: "This course focuses on Express because it keeps you using JavaScript. The COMSATS course plan also permits Python frameworks like Django and FastAPI, which solve the exact same problems. Routing, request handling, middleware, and status codes apply equally whether you use Express, Django, or FastAPI." },

    { type: "code", kicker: "Setting Up Express", heading: "Step 1 -- Confirm Node.js Is Installed",
      code: "node --version\nnpm --version",
      note: "If these print version numbers (e.g. v20.11.0 and 10.2.4), Node.js and npm are ready. Otherwise install Node.js from nodejs.org." },

    { type: "code", kicker: "Setting Up Express", heading: "Step 2 -- Initialize a New Project",
      code: "mkdir my-first-server\ncd my-first-server\nnpm init -y",
      note: "npm init creates a new package.json; -y accepts all default answers (you can edit it by hand afterward)." },

    { type: "code", kicker: "Setting Up Express", heading: "Step 3 -- Install Express",
      code: "npm install express",
      note: "Downloads Express into node_modules and adds it as a dependency in package.json." },

    { type: "code", kicker: "First Web Server", heading: "index.js",
      code: "const express = require('express');\nconst app = express();\nconst PORT = 3000;\n\napp.get('/', (req, res) => {\n  res.send('Hello, world! This is my first Express server.');\n});\n\napp.listen(PORT, () => {\n  console.log(`Server is running at http://localhost:${PORT}`);\n});" },

    { type: "bullets", kicker: "First Web Server", heading: "Unpacking Each Piece", items: [
      "require('express') loads the package (Node's original module system; import express from 'express' is the modern equivalent)",
      "express() creates an application object, usually named app -- represents your entire server",
      "app.get('/', callback) defines a route: on GET /, run this function, with req (the request) and res (the response)",
      "res.send(...) sends data back and ends the response -- plain text here, but also HTML, JSON, and more",
      "app.listen(PORT, callback) actually starts listening for network connections -- nothing happens until you call it",
    ] },

    { type: "codeImageSide", kicker: "First Web Server", heading: "Visiting localhost:3000",
      code: "node index.js\n\n// terminal prints:\n// Server is running at\n// http://localhost:3000\n\n// then open a browser to\n// http://localhost:3000",
      img: `${IMG}/express-hello-world-browser.png` },

    { type: "diagram", kicker: "First Web Server", heading: "One Request, Start to Finish",
      nodes: [
        { x: 1.2, y: 3.3, w: 3.4, h: 0.65, text: "Browser", fill: "2B2B7A", fontSize: 13.5 },
        { x: 7.5, y: 3.3, w: 4.2, h: 0.65, text: "Node.js Process\n(your index.js)", fill: "2B2B7A", fontSize: 12 },
      ],
      edges: [
        { x1: 4.6, y1: 3.15, x2: 7.5, y2: 3.15, label: "GET http://\nlocalhost:3000/" },
        { x1: 7.5, y1: 3.75, x2: 4.6, y2: 3.75, label: "200 OK\n\"Hello, world!...\"" },
      ],
      caption: "app.listen(3000) means the server is already waiting; the route matches app.get('/', ...) and responds every time you visit." },

    { type: "callout", kicker: "First Web Server", heading: "What Is \"localhost\"?", kind: "tip", h: 1.7,
      text: "localhost is a special hostname that always means \"this same computer.\" While developing, your server and browser both run on your own machine. When you later deploy your app, visitors reach it through a real domain name instead." },

    { type: "callout", kicker: "First Web Server", heading: "EADDRINUSE: Port Already in Use", kind: "warning", h: 1.8,
      text: "Two programs cannot listen on the exact same port at the same time. If you see EADDRINUSE, something (perhaps an earlier copy of your own server) is already using that port -- stop it, or choose a different port number." },

    { type: "closing", heading: "Lecture 16 in Six Points", items: [
      "Client-side code runs in the browser and can be seen/altered by the user; server-side code runs on a machine you control and handles data, logic, and security.",
      "A web server speaks HTTP, an application server runs your app's logic, and a runtime environment (browser or Node.js) executes your code -- in small Express apps, the first two are the same program.",
      "Node.js is a JavaScript runtime (built on Chrome's V8 engine) that runs JavaScript outside the browser, including on servers.",
      "Node.js handles many requests at once with non-blocking I/O and the event loop, instead of blocking the whole program while waiting.",
      "npm installs and manages reusable packages, tracked in package.json, with code stored in node_modules.",
      "Express.js simplifies building servers: express() creates an app, app.get() defines routes, and app.listen() starts listening.",
    ] },
  ],
});
