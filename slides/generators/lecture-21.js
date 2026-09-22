const { buildDeck } = require("./deckBuilder");

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 21: Middleware",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-21-Middleware.pptx",
  slides: [
    { type: "title", lectureNo: 21, heading: "Middleware",
      sub: "The functions that sit between a request and its final response — logging, parsing, authentication, all in one pipeline." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Understand the middleware concept and how requests flow through a pipeline",
      "Learn the (req, res, next) function signature every middleware follows",
      "Distinguish application-level, router-level, and error-handling middleware",
      "Use built-in Express middleware (express.json, express.static) and popular third-party middleware (morgan, cors)",
      "Write your own custom middleware function",
    ] },

    { type: "bullets", kicker: "Middleware", heading: "What Is Middleware?", items: [
      "A function that sits in the middle of the request and the final response",
      "Express runs a chain of these functions, one after another, for every incoming request",
      "Each one can run code, change req/res, end the cycle by sending a response, or pass control to the next function",
    ] },

    { type: "bullets", kicker: "Middleware", heading: "The Airport Security Analogy", items: [
      "Your bag doesn't go straight from check-in to the plane — it passes through several stations",
      "Ticket check, X-ray scanner, manual inspection — each one either lets it through or stops it there",
      "Express middleware works the same way: every request passes through a chain of stations before it reaches its final handler",
    ] },

    { type: "diagram", kicker: "The Pipeline", heading: "The Request/Response Pipeline",
      nodes: [
        { x: 0.7, y: 2.4, w: 1.9, h: 0.7, text: "Incoming\nRequest", fill: "1E1E4C", fontSize: 11.5 },
        { x: 2.85, y: 2.4, w: 2.05, h: 0.7, text: "Middleware 1\n(logging)", fill: "2B2B7A", fontSize: 11.5 },
        { x: 5.15, y: 2.4, w: 2.05, h: 0.7, text: "Middleware 2\n(parse JSON)", fill: "2B2B7A", fontSize: 11.5 },
        { x: 7.45, y: 2.4, w: 2.05, h: 0.7, text: "Middleware 3\n(check auth)", fill: "2B2B7A", fontSize: 11.5 },
        { x: 9.75, y: 2.4, w: 2.15, h: 0.7, text: "Route Handler\n(sends response)", fill: "E67528", fontSize: 11 },
        { x: 5.0, y: 4.5, w: 2.6, h: 0.8, text: "Error-Handling\nMiddleware", fill: "B3261E", fontSize: 12 },
      ],
      edges: [
        { x1: 2.6, y1: 2.75, x2: 2.85, y2: 2.75 },
        { x1: 4.9, y1: 2.75, x2: 5.15, y2: 2.75 },
        { x1: 7.2, y1: 2.75, x2: 7.45, y2: 2.75 },
        { x1: 9.5, y1: 2.75, x2: 9.75, y2: 2.75 },
        { x1: 3.875, y1: 3.1, x2: 6.0, y2: 4.5, dashed: true, label: "error" },
        { x1: 6.175, y1: 3.1, x2: 6.3, y2: 4.5, dashed: true },
        { x1: 8.475, y1: 3.1, x2: 6.6, y2: 4.5, dashed: true },
      ],
      caption: "Often called the request/response pipeline. Any middleware can call next(err) to skip straight to the nearest error-handling middleware, registered last, after every other app.use() and route." },

    { type: "code", kicker: "The (req, res, next) Signature", heading: "Every Middleware Gets (req, res, next)",
      code: "function myMiddleware(req, res, next) {\n  // req, res, and next -- the standard trio\n  console.log(`${req.method} ${req.url}`);\n  next(); // move on to the next middleware\n}",
      note: "Forgetting next() — without also sending a response — makes the client hang forever waiting for a reply." },

    { type: "callout", kicker: "The (req, res, next) Signature", heading: "Always Call next() or End the Response", kind: "warning", h: 2.1,
      text: "A middleware function must always either call next() or end the response (with res.send(), res.json(), res.end(), etc.). Doing neither is one of the most common bugs beginners hit with Express — the request just times out." },

    { type: "code", kicker: "The (req, res, next) Signature", heading: "Registering Middleware with app.use()",
      code: "const express = require(\"express\");\nconst app = express();\n\napp.use(function (req, res, next) {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});\n\napp.get(\"/\", (req, res) => {\n  res.send(\"Home page\");\n});\n\napp.listen(3000);",
      note: "Every request — whichever route it eventually matches — passes through the logging middleware first, since it was registered before the routes." },

    { type: "callout", kicker: "The (req, res, next) Signature", heading: "Order Matters", kind: "tip", h: 2.0,
      text: "Express runs middleware in the exact order you register it. A middleware registered after your routes will never run for requests an earlier route already handled." },

    { type: "code", kicker: "Application-Level Middleware", heading: "Global vs. Path-Scoped vs. Route-Scoped",
      code: "app.use((req, res, next) => {  // every request\n  req.requestTime = Date.now();\n  next();\n});\n\napp.use(\"/admin\", (req, res, next) => { // /admin only\n  console.log(\"Someone hit the admin area\");\n  next();\n});\n\napp.get(\"/profile\", (req, res, next) => {\n  next();\n}, (req, res) => {\n  res.send(\"Profile page\");\n});",
      note: "A route can have multiple handler functions — each must call next() except the last, which usually sends the response." },

    { type: "code", kicker: "Router-Level Middleware", heading: "routes/users.js",
      code: "const express = require(\"express\");\nconst router = express.Router();\n\nrouter.use((req, res, next) => {\n  console.log(\"Time:\", Date.now());\n  next();\n});\n\nrouter.get(\"/\", (req, res) => {\n  res.send(\"List of users\");\n});\n\nrouter.get(\"/:id\", (req, res) => {\n  res.send(`User with id ${req.params.id}`);\n});\n\nmodule.exports = router;" },

    { type: "code", kicker: "Router-Level Middleware", heading: "Mounting the Router",
      code: "// app.js\nconst usersRouter = require(\"./routes/users\");\napp.use(\"/users\", usersRouter);",
      note: "Now the logging middleware inside users.js only fires for requests under /users/* — never for, say, /products." },

    { type: "bullets", kicker: "Error-Handling Middleware", heading: "Four Parameters, Not Three", items: [
      "Error-handling middleware looks almost the same, but takes FOUR parameters: (err, req, res, next)",
      "Express recognizes it as an error handler purely because of that fourth parameter",
      "Must be registered LAST, after all other app.use() and route calls",
    ] },

    { type: "code", kicker: "Error-Handling Middleware", heading: "A Basic Error Handler",
      code: "app.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).json({\n    error: \"Something went wrong on the server.\"\n  });\n});",
      note: "Express recognizes this as an error handler purely because it takes four parameters, not three." },

    { type: "code", kicker: "Error-Handling Middleware", heading: "Reaching It with next(err)",
      code: "app.get(\"/risky\", (req, res, next) => {\n  try {\n    doSomethingThatMightFail();\n    res.send(\"It worked!\");\n  } catch (err) {\n    next(err); // hand off to the error handler\n  }\n});\n\n// ... other routes ...\n\napp.use((err, req, res, next) => {\n  console.error(err.message);\n  res.status(500).send(\"Internal Server Error\");\n});",
      note: "next(err) skips every remaining regular middleware and jumps straight to the nearest error handler." },

    { type: "callout", kicker: "Error-Handling Middleware", heading: "Chaining Error Handlers", kind: "note", h: 1.9,
      text: "You can have multiple error-handling middleware functions — one that logs and calls next(err) again, and a final one that sends the response. The same chain idea applies to errors too." },

    { type: "bullets", kicker: "Built-In Middleware", heading: "Express Ships With a Few Built In", items: [
      "express.json() — parses JSON request bodies into req.body",
      "express.urlencoded() — parses traditional HTML <form> submissions",
      "express.static() — serves static files (HTML, CSS, images, JS) directly from a folder",
    ] },

    { type: "code", kicker: "Built-In Middleware", heading: "express.json()",
      code: "app.use(express.json());\n\napp.post(\"/api/notes\", (req, res) => {\n  console.log(req.body); // parsed JSON body\n  res.status(201).json({ message: \"Note created\" });\n});",
      note: "Without express.json(), req.body would be undefined for JSON requests." },

    { type: "code", kicker: "Built-In Middleware", heading: "express.static()",
      code: "app.use(express.static(\"public\"));\n\n// GET /logo.png now automatically serves\n// public/logo.png -- no route needed",
      note: "Express matches the request path directly to a file in the folder." },

    { type: "cards", kicker: "Third-Party Middleware", heading: "Two You'll Use Constantly", cards: [
      { heading: "morgan — Request Logging", accent: "2B2B7A", body: [
        "Logs every incoming request: method, path, status code, response time",
        "npm install morgan",
        "app.use(morgan(\"dev\"))",
        "Invaluable while developing and debugging",
      ] },
      { heading: "cors — Cross-Origin Requests", accent: "E67528", body: [
        "Browsers block a page on one origin from calling an API on another (same-origin policy)",
        "npm install cors",
        "app.use(cors()) adds the headers needed to explicitly allow it",
        "Restrict the allowed origin before production",
      ] },
    ] },

    { type: "code", kicker: "Third-Party Middleware", heading: "morgan in Practice",
      code: "npm install morgan\n\nconst morgan = require(\"morgan\");\napp.use(morgan(\"dev\"));\n// logs: GET /users 200 12.345 ms" },

    { type: "code", kicker: "Third-Party Middleware", heading: "cors in Practice",
      code: "npm install cors\n\nconst cors = require(\"cors\");\napp.use(cors()); // any origin -- fine for dev\n\n// Production: restrict it\napp.use(cors({ origin: \"https://myapp.com\" }));" },

    { type: "callout", kicker: "Third-Party Middleware", heading: "Lock Down cors() Before Production", kind: "warning", h: 2.0,
      text: "cors() with no options allows ANY website to call your API from the browser. That's convenient during development but should usually be locked down to specific origins before you deploy to production." },

    { type: "code", kicker: "Custom Middleware", heading: "A Custom Authentication Check",
      code: "function requireLogin(req, res, next) {\n  if (!req.session || !req.session.userId) {\n    return res.status(401).json({\n      error: \"You must be logged in.\"\n    });\n  }\n  next();\n}\n\napp.get(\"/dashboard\", requireLogin, (req, res) => {\n  res.send(\"Welcome to your dashboard!\");\n});",
      note: "If the check fails, requireLogin sends 401 and does NOT call next() — the /dashboard handler never runs." },

    { type: "code", kicker: "Custom Middleware", heading: "Chaining Several Small Middleware",
      code: "function logRequest(req, res, next) {\n  console.log(`${req.method} ${req.url}`);\n  next();\n}\n\nfunction validateNoteBody(req, res, next) {\n  if (!req.body.title) {\n    return res.status(400).json({ error: \"Title required.\" });\n  }\n  next();\n}\n\napp.post(\"/api/notes\", logRequest, validateNoteBody, (req, res) => {\n  res.status(201).json({ message: \"Note created\" });\n});",
      note: "Small, single-purpose middleware chained together is one of the biggest reasons Express apps stay readable as they grow." },

    { type: "closing", heading: "Lecture 21 in Seven Points", items: [
      "Middleware functions run in a chain (the request/response pipeline) for each incoming request, in the order they are registered.",
      "Every middleware function receives (req, res, next); it must call next() or end the response, or the request will hang.",
      "Application-level middleware (app.use()) applies globally or to a path prefix; router-level middleware applies only within an express.Router().",
      "Error-handling middleware has four parameters, (err, req, res, next), must be registered last, and is reached via next(err).",
      "Express ships with built-in middleware like express.json(), express.urlencoded(), and express.static().",
      "Third-party middleware such as morgan (logging) and cors (cross-origin requests) are installed from npm and plugged in the same way.",
      "Writing your own middleware — for logging, validation, or authentication — is one of the most common and powerful patterns in Express development.",
    ] },
  ],
});
