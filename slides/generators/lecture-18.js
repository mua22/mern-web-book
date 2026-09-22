const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-18";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 18: Request Handling and Routing",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-18-Request-Handling-and-Routing.pptx",
  slides: [
    { type: "title", lectureNo: 18, heading: "Request Handling\nand Routing",
      sub: "From one route to dozens: reading a request fully, and organizing a growing Express project." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "The anatomy of an HTTP request: method, URL, headers, and body",
      "Routes for GET, POST, PUT, PATCH, and DELETE",
      "Route parameters and query strings",
      "Parsing a JSON request body with express.json()",
      "Serving static files, and organizing routes with express.Router",
      "Handling unmatched routes (404) and centralizing error handling",
    ] },

    { type: "code", kicker: "Anatomy of a Request", heading: "Every HTTP Request Has Four Parts",
      code: 'POST /api/books HTTP/1.1\nHost: localhost:3000\nContent-Type: application/json\nAccept: application/json\n\n{"title": "Clean Code", "author": "Robert C. Martin"}',
      note: "Method (POST), URL/path (/api/books), headers (Content-Type, Accept), and body (the JSON payload)." },

    { type: "table", kicker: "Anatomy of a Request", heading: "Where to Find Each Part in Express",
      header: ["Request part", "Where to find it"], colW: [3.6, 8.4], leftCol: 0,
      rows: [
        ["Method", "req.method"],
        ["Path", "req.path (or req.url, which includes the query string)"],
        ["Headers", "req.headers (e.g. req.headers['content-type'])"],
        ["Body", "req.body (requires middleware)"],
        ["Route parameters", "req.params"],
        ["Query string", "req.query"],
      ] },

    { type: "bullets", kicker: "Routing", heading: "What Is Routing?", items: [
      "Matching an incoming request's method and path to the code that should handle it",
      "Express gives you one method per HTTP verb, each taking a path and a handler function",
    ] },

    { type: "table", kicker: "Routing", heading: "The Five Methods You'll Use Constantly",
      header: ["Method", "Typical purpose", "Example"], colW: [2.4, 5.3, 4.3], leftCol: 0, rowH: 0.62,
      rows: [
        ["GET", "Read/fetch data -- should never change anything", "Fetch a list of books"],
        ["POST", "Create something new", "Add a new book"],
        ["PUT", "Replace an existing resource entirely", "Overwrite a book's full record"],
        ["PATCH", "Partially update an existing resource", "Change only a book's price"],
        ["DELETE", "Remove a resource", "Delete a book"],
      ] },

    { type: "code", kicker: "Routing", heading: "One app.METHOD() per Verb",
      code: "app.get('/api/books', (req, res) => res.send('All books'));\napp.post('/api/books', (req, res) => res.send('A new book was created'));\n\napp.put('/api/books/:id', (req, res) =>\n  res.send(`Book ${req.params.id} was fully replaced`));\napp.patch('/api/books/:id', (req, res) =>\n  res.send(`Book ${req.params.id} was partially updated`));\napp.delete('/api/books/:id', (req, res) =>\n  res.send(`Book ${req.params.id} was deleted`));" },

    { type: "callout", kicker: "Routing", heading: "Method + Path = Endpoint", kind: "note", h: 1.7,
      text: "The same path (/api/books/:id) can have completely different handlers depending on the method. Express matches on the combination of method AND path together, not the path alone -- this pairing is often called an endpoint." },

    { type: "callout", kicker: "Routing", heading: "GET Requests Should Be Safe", kind: "tip", h: 1.9,
      text: "Calling a GET request should never change data on the server. This isn't enforced by the language -- it's a convention other developers, browsers, and tools all rely on. Breaking it can cause surprising bugs, since browsers may pre-fetch or cache GET requests." },

    { type: "bullets", kicker: "Extracting Data", heading: "Route Parameters vs. Query Strings", items: [
      "Two different ways of getting extra information out of a URL -- important not to confuse them",
      "Route parameters: named placeholders built into the path itself, marked with a colon (:) -- identify WHICH resource",
      "Query strings: optional ?key=value pairs at the end of a URL -- filter or modify a request",
    ] },

    { type: "codeImageSide", kicker: "Route Parameters", heading: "The Exact Code, Live",
      code: "// URL: /api/books/42\napp.get('/api/books/:id',\n  (req, res) => {\n  console.log(req.params.id);\n  // \"42\"\n  res.send(\n    `You asked for book\n    number ${req.params.id}`\n  );\n});",
      img: `${IMG}/route-param-browser.png` },

    { type: "code", kicker: "Route Parameters", heading: "More Than One Parameter",
      code: "// URL: /api/authors/12/books/42\napp.get('/api/authors/:authorId/books/:bookId', (req, res) => {\n  console.log(req.params.authorId); // \"12\"\n  console.log(req.params.bookId);   // \"42\"\n});" },

    { type: "code", kicker: "Query Strings", heading: "Filtering, Sorting, Pagination",
      code: "// URL: /api/books?genre=fiction&sort=title&page=2\napp.get('/api/books', (req, res) => {\n  console.log(req.query.genre); // \"fiction\"\n  console.log(req.query.sort);  // \"title\"\n  console.log(req.query.page);  // \"2\" (always a string!)\n  res.send('Filtered book list');\n});" },

    { type: "callout", kicker: "Query Strings", heading: "Everything Arrives as a String", kind: "warning", h: 1.9,
      text: "req.params and req.query always arrive as strings, even if they look like a number. req.query.page is \"2\", not 2. If you need a number, convert it explicitly: Number(req.query.page) or parseInt(req.query.page, 10)." },

    { type: "table", kicker: "Extracting Data", heading: "Route Parameter vs. Query String",
      header: ["", "Route parameter", "Query string"], colW: [2.8, 4.7, 4.5], leftCol: 0, rowH: 0.68,
      rows: [
        ["Syntax", "/books/:id  ->  /books/42", "/books?genre=fiction"],
        ["Purpose", "Identifies a specific resource", "Filters/modifies a request"],
        ["Required?", "Usually required to match the route", "Usually optional"],
        ["Access in Express", "req.params", "req.query"],
      ] },

    { type: "bullets", kicker: "Middleware", heading: "What Is Middleware?", items: [
      "A function that runs DURING the request-response cycle, before your route handler, typically to inspect or transform the request",
      "By default, Express does NOT automatically parse a JSON body -- req.body would be undefined without extra setup",
      "express.json() is a built-in middleware that parses an incoming body as JSON and attaches it to req.body",
    ] },

    { type: "code", kicker: "Middleware", heading: "Registering express.json()",
      code: "const express = require('express');\nconst app = express();\n\napp.use(express.json()); // apply to every incoming request\n\napp.post('/api/books', (req, res) => {\n  const { title, author } = req.body;\n  res.status(201).send(`Created \"${title}\" by ${author}`);\n});",
      note: "app.use(express.json()) must be called BEFORE any route handler that expects to read req.body." },

    { type: "flow", kicker: "Middleware", heading: "Where Middleware Fits",
      steps: [
        { label: "Incoming\nRequest" },
        { label: "express.json()\nparses body into\nreq.body" },
        { label: "Route matching\n(method + path)" },
        { label: "Your route\nhandler runs" },
      ],
      caption: "app.use(...) registers middleware that runs for (by default) every incoming request, before Express tries to match it to a route." },

    { type: "callout", kicker: "Middleware", heading: "The #1 Beginner Mistake", kind: "warning", h: 2.0,
      text: "If you forget app.use(express.json()) and the client sends a JSON body, req.body will be undefined, and destructuring it (const { title } = req.body) will throw an error. If req.body seems empty, check this first." },

    { type: "bullets", kicker: "Static Files", heading: "Files That Don't Change Per-Request", items: [
      "Images, CSS stylesheets, client-side JavaScript bundles, and so on",
      "express.static() is a built-in middleware that serves an entire folder of files automatically",
      "You don't need to write a route yourself -- Express matches the URL to the file",
    ] },

    { type: "code", kicker: "Static Files", heading: "express.static('public')",
      code: "app.use(express.static('public'));\n\n// my-project/\n// |-- index.js\n// `-- public/\n//     |-- logo.png\n//     `-- style.css\n//\n// A request to /logo.png is served from public/logo.png automatically." },

    { type: "bullets", kicker: "Organizing Routes", heading: "Routers and Controllers", items: [
      "Keeping every route in one file becomes hard to manage as an app grows past a handful of routes",
      "express.Router() -- a mini, standalone Express app you define in a separate file and plug into your main app",
      "Router file: defines URL paths and methods; Controller file: contains the actual handler logic",
    ] },

    { type: "code", kicker: "Organizing Routes", heading: "routes/books.js",
      code: "const express = require('express');\nconst router = express.Router();\nconst booksController = require('../controllers/booksController');\n\nrouter.get('/', booksController.getAllBooks);\nrouter.get('/:id', booksController.getBookById);\nrouter.post('/', booksController.createBook);\n\nmodule.exports = router;" },

    { type: "code", kicker: "Organizing Routes", heading: "controllers/booksController.js",
      code: "exports.getAllBooks = (req, res) => {\n  res.send('List of all books');\n};\n\nexports.getBookById = (req, res) => {\n  res.send(`Book with id ${req.params.id}`);\n};\n\nexports.createBook = (req, res) => {\n  res.status(201).send(`Created book: ${req.body.title}`);\n};" },

    { type: "code", kicker: "Organizing Routes", heading: "index.js -- Mounting the Router",
      code: "const express = require('express');\nconst app = express();\nconst booksRouter = require('./routes/books');\n\napp.use(express.json());\napp.use('/api/books', booksRouter); // mount at this path prefix\n\napp.listen(3000);",
      note: "router.get('/:id', ...) inside routes/books.js therefore actually handles GET /api/books/:id -- the prefix is added automatically." },

    { type: "bullets", kicker: "404 Handling", heading: "What Happens With No Matching Route?", items: [
      "Express needs to be told explicitly what to do, or it sends a generic, unhelpful default response",
      "Place a catch-all handler AFTER all your other routes -- Express checks routes in the order they're defined",
    ] },

    { type: "code", kicker: "404 Handling", heading: "A Catch-All 404 Handler",
      code: "// ...all your real routes go above this...\n\napp.use((req, res) => {\n  res.status(404).send('Sorry, that page was not found.');\n});" },

    { type: "bullets", kicker: "Error Handling", heading: "Centralized Error-Handling Middleware", items: [
      "Instead of try/catch and custom error responses in every route, Express supports error-handling middleware in one place",
      "You recognize it because it takes FOUR parameters instead of the usual two or three, with err first",
      "next(err) skips all remaining normal routes/middleware and jumps straight to the nearest error handler",
    ] },

    { type: "code", kicker: "Error Handling", heading: "next(err) and the 4-Parameter Handler",
      code: "app.get('/api/books/:id', (req, res, next) => {\n  try {\n    if (req.params.id === '0') throw new Error('Invalid book id');\n    res.send(`Book ${req.params.id}`);\n  } catch (err) {\n    next(err); // pass along to the error-handling middleware\n  }\n});\n\napp.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(500).send('Something went wrong on our end.');\n});" },

    { type: "diagram", kicker: "Putting It Together", heading: "Request Lifecycle: Match, Handle, or 404",
      nodes: [
        { x: 4.9, y: 2.2, w: 3.4, h: 0.5, text: "Request arrives", fill: "2B2B7A", fontSize: 12.5 },
        { x: 4.6, y: 2.85, w: 4.0, h: 0.5, text: "express.json() middleware", fill: "2B2B7A", fontSize: 11.5 },
        { x: 4.9, y: 3.5, w: 3.4, h: 0.8, text: "Matches a defined\nroute?", shape: "diamond", fill: "FF8A3D", fontSize: 11.5 },
        { x: 0.9, y: 4.5, w: 3.6, h: 0.55, text: "Catch-all 404 handler\nsends 404 response", fill: "5D5D72", fontSize: 11 },
        { x: 7.4, y: 4.5, w: 4.0, h: 0.55, text: "Route handler runs", fill: "2B2B7A", fontSize: 12.5 },
        { x: 7.6, y: 5.25, w: 3.6, h: 0.75, text: "Error thrown or\nnext(err) called?", shape: "diamond", fill: "FF8A3D", fontSize: 11 },
        { x: 5.3, y: 6.2, w: 3.3, h: 0.55, text: "Normal response sent", fill: "3FA66B", fontSize: 11.5 },
        { x: 9.1, y: 6.2, w: 3.4, h: 0.55, text: "Error-handling middleware\nsends 500 response", fill: "E67528", fontSize: 10.5 },
      ],
      edges: [
        { x1: 6.6, y1: 2.7, x2: 6.6, y2: 2.85 },
        { x1: 6.6, y1: 3.35, x2: 6.6, y2: 3.5 },
        { x1: 5.2, y1: 4.1, x2: 2.7, y2: 4.5, label: "No" },
        { x1: 8.0, y1: 4.1, x2: 9.4, y2: 4.5, label: "Yes" },
        { x1: 9.4, y1: 5.05, x2: 9.4, y2: 5.25 },
        { x1: 8.4, y1: 6.0, x2: 6.95, y2: 6.2, label: "No" },
        { x1: 10.4, y1: 6.0, x2: 10.8, y2: 6.2, label: "Yes" },
      ] },

    { type: "callout", kicker: "Putting It Together", heading: "Order Matters", kind: "tip", h: 1.7,
      text: "Middleware and routes are checked top-to-bottom in the order you register them with app.use()/app.get()/etc. Your 404 handler and error-handling middleware must always come LAST, or they'll swallow requests meant for routes defined below them." },

    { type: "closing", heading: "Lecture 18 in Six Points", items: [
      "Every HTTP request has a method, URL/path, headers, and optionally a body -- Express exposes all of these on req.",
      "Express provides one method per HTTP verb (get/post/put/patch/delete); routing matches on method AND path together.",
      "Route parameters (req.params, from :name) identify a specific resource; query strings (req.query, from ?key=value) filter or modify a request -- both always arrive as strings.",
      "express.json() middleware must be registered with app.use() before your routes can read a JSON body via req.body.",
      "express.static('folder') serves static files directly, without individual routes; express.Router() splits routes into separate files, typically paired with controllers.",
      "Register a catch-all 404 handler and a 4-argument error-handling middleware LAST, after all your real routes.",
    ] },
  ],
});
