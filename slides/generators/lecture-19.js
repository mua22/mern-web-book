const { buildDeck } = require("./deckBuilder");

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 19: HTTP Status Codes and Common Headers",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-19-HTTP-Status-Codes-and-Headers.pptx",
  slides: [
    { type: "title", lectureNo: 19, heading: "HTTP Status Codes\nand Headers",
      sub: "The three-digit codes and metadata headers that tell every client exactly what happened — and how to set them yourself in Express." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Understand the five status code families (1xx–5xx) and what each broadly means",
      "Learn the exact meaning and correct use of the most common specific status codes",
      "Identify key request headers: Accept, Content-Type, Authorization, User-Agent",
      "Identify key response headers: Content-Type, Cache-Control, Set-Cookie, Location",
      "Understand content negotiation — how client and server agree on a response format",
    ] },

    { type: "bullets", kicker: "Overview", heading: "Every Response Carries Two Things", items: [
      "A three-digit status code that summarizes what happened, at a glance",
      "A set of headers — key-value metadata about the request or response",
      "Setting these correctly in your own Express routes is what makes your API behave the way browsers, other servers, and mobile apps expect",
    ] },

    { type: "flow", kicker: "Status Code Families", heading: "Five Families, By First Digit",
      steps: [
        { label: "1xx\nInformational" },
        { label: "2xx\nSuccess" },
        { label: "3xx\nRedirection" },
        { label: "4xx\nClient Error" },
        { label: "5xx\nServer Error" },
      ],
      caption: "The first digit tells you, at a glance, what kind of outcome occurred — before you even read the rest of the response." },

    { type: "table", kicker: "Status Code Families", heading: "What Each Family Means",
      header: ["Family", "Meaning", "At Fault"], colW: [2.1, 7.633, 2.2], leftCol: 0, rowH: 0.85,
      rows: [
        ["1xx Informational", "Request received and understood; processing continues (rare in typical apps)", "—"],
        ["2xx Success", "Request received, understood, and accepted successfully", "—"],
        ["3xx Redirection", "Further action needed, usually following a different URL", "—"],
        ["4xx Client Error", "Bad syntax, invalid data, or something the client did wrong", "Client"],
        ["5xx Server Error", "The server failed on an otherwise-valid request", "Server"],
      ] },

    { type: "callout", kicker: "Status Code Families", heading: "Where to Start Debugging", kind: "note", h: 2.1,
      text: "A useful habit: 4xx means \"look at what the client sent\" — a bad request, a missing field, an unauthenticated user. 5xx means \"look at your server code\" — an unhandled exception, a database that's down, a bug. This distinction guides where you start debugging." },

    { type: "code", kicker: "Status Code Families", heading: "Setting a Status Code in Express",
      code: "res.status(201).json({ message: 'Book created successfully' });",
      note: "If you never call .status(), Express defaults to 200." },

    { type: "table", kicker: "Common Status Codes", heading: "Success and Redirection Codes",
      header: ["Code", "Name", "When to Use It"], colW: [1.2, 2.4, 8.333], leftCol: 0, rowH: 1.0,
      rows: [
        ["200", "OK", "Default success code with a body — successful GET, PUT, PATCH"],
        ["201", "Created", "A new resource was created — the standard response to a POST that creates something, often paired with a Location header"],
        ["204", "No Content", "Success, but nothing to send back — a typical DELETE response"],
        ["301 / 302", "Moved / Found", "301 = permanently moved (update links); 302 = temporarily moved — the new URL is in the Location header"],
      ] },

    { type: "table", kicker: "Common Status Codes", heading: "Client and Server Error Codes",
      header: ["Code", "Name", "When to Use It"], colW: [1.2, 2.4, 8.333], leftCol: 0, rowH: 0.6,
      rows: [
        ["400", "Bad Request", "Malformed request — broken JSON or a required field missing"],
        ["401", "Unauthorized", "No valid credentials provided — \"you need to log in\""],
        ["403", "Forbidden", "Authenticated, but not allowed to do this"],
        ["404", "Not Found", "No resource exists at this URL"],
        ["409", "Conflict", "Conflicts with the resource's current state — e.g. email already taken"],
        ["422", "Unprocessable Entity", "Well-formed request, but the data fails validation rules"],
        ["500", "Internal Server Error", "Something broke on the server — an unhandled exception or bug"],
      ] },

    { type: "callout", kicker: "Common Status Codes", heading: "401 vs. 403 — A Very Common Mix-Up", kind: "warning", h: 2.3,
      text: "401 Unauthorized really means \"I don't know who you are\" — not logged in, missing or invalid credentials. 403 Forbidden means \"I know who you are, but you're not allowed to do this\" — logged in, but insufficient permissions, like a regular user hitting an admin-only route. Many students use these interchangeably; exams and real APIs do not." },

    { type: "callout", kicker: "Common Status Codes", heading: "400 vs. 422", kind: "warning", h: 2.4,
      text: "400 typically means the request itself is malformed at a structural level — broken JSON, wrong content type. 422 means the request was structurally fine and understood, but the data inside it fails validation — e.g. age: -5, or a missing required field in otherwise-valid JSON. Not every API distinguishes these strictly, but you should understand the difference conceptually." },

    { type: "code", kicker: "Common Status Codes", heading: "Validating a POST and Responding 201 / 400",
      code: "app.post('/api/books', (req, res) => {\n  const { title, author } = req.body;\n\n  if (!title || !author) {\n    return res.status(400).json({\n      error: 'title and author are required'\n    });\n  }\n\n  const newBook = { id: 101, title, author };\n\n  res.status(201)\n     .location(`/api/books/${newBook.id}`)\n     .json(newBook);\n});",
      note: "location() sets the Location header — where the new resource now lives." },

    { type: "code", kicker: "Common Status Codes", heading: "204 No Content and 404 Not Found",
      code: "app.delete('/api/books/:id', (req, res) => {\n  // ... delete the book here ...\n  res.status(204).send(); // nothing to return\n});\n\napp.get('/api/books/:id', (req, res) => {\n  const book = null; // imagine none found\n  if (!book) {\n    return res.status(404).json({\n      error: 'Book not found'\n    });\n  }\n  res.status(200).json(book);\n});",
      note: "204 has no body; 404 means nothing exists at that URL." },

    { type: "table", kicker: "Request Headers", heading: "Key Request Headers",
      header: ["Header", "Purpose"], colW: [2.3, 9.633], leftCol: 0, rowH: 0.85,
      rows: [
        ["Accept", "Which content type(s) the client can handle in the response"],
        ["Content-Type", "The format of the request body — what express.json() checks before parsing req.body"],
        ["Authorization", "Credentials proving who the client is, e.g. Bearer <token>"],
        ["User-Agent", "Identifies the client software — browser, OS, or a tool like curl"],
      ] },

    { type: "code", kicker: "Request Headers", heading: "Reading Headers in Express",
      code: "app.get('/api/books', (req, res) => {\n  console.log(req.headers['user-agent']);\n  console.log(req.get('Accept'));\n  res.send('ok');\n});",
      note: "req.headers uses lowercase keys; req.get() is case-insensitive." },

    { type: "table", kicker: "Response Headers", heading: "Key Response Headers",
      header: ["Header", "Purpose"], colW: [2.3, 9.633], leftCol: 0, rowH: 0.85,
      rows: [
        ["Content-Type", "Format of the response body — set automatically by res.json() / res.send()"],
        ["Cache-Control", "How long the response may be reused before it must be re-fetched"],
        ["Set-Cookie", "Tells the browser to store a cookie (covered next lecture)"],
        ["Location", "Where a redirect points, or where a newly created resource now lives"],
      ] },

    { type: "code", kicker: "Response Headers", heading: "Setting Response Headers",
      code: "app.get('/api/report', (req, res) => {\n  res.set('Cache-Control', 'no-store');\n  res.json({ generatedAt: new Date().toISOString() });\n});\n\napp.get('/old-path', (req, res) => {\n  res.redirect(301, '/new-path');\n});",
      note: "res.redirect(301, ...) sets both the 301 status and the Location header automatically." },

    { type: "bullets", kicker: "Content Negotiation", heading: "Client and Server Agree on a Format", items: [
      "The client states its preferred format(s) via the Accept header",
      "The server decides how to respond based on that — and on what it's actually able to produce",
      "A browser navigating to a URL sends Accept: text/html, ... — a fetch() call from a JS app might send Accept: application/json instead",
    ] },

    { type: "flow", kicker: "Content Negotiation", heading: "A Content-Negotiated Exchange",
      steps: [
        { label: "Client sends\nAccept: json" },
        { label: "Server replies\n200 OK (json)" },
        { label: "Client sends\nAccept: html" },
        { label: "Server replies\n200 OK (html)" },
      ],
      caption: "Same server, same route family — the Accept header the client sends decides which format the response comes back in." },

    { type: "code", kicker: "Content Negotiation", heading: "res.format() in Express",
      code: "app.get('/books', (req, res) => {\n  res.format({\n    'application/json': () => {\n      res.json({ books: ['Clean Code', 'Pragmatic Prog.'] });\n    },\n    'text/html': () => {\n      res.send('<h1>Books</h1>');\n    },\n    default: () => {\n      res.status(406).send('Not Acceptable');\n    }\n  });\n});",
      note: "res.format() runs the callback matching the client's Accept header; unmatched types fall to default." },

    { type: "callout", kicker: "Content Negotiation", heading: "You're Already Doing This", kind: "tip", h: 2.2,
      text: "Even without res.format(), you perform a simpler form of content negotiation every time you choose res.json() vs. res.send() vs. res.render() — you are deciding, on the server side, what format to return. Full content negotiation just makes that decision dynamic, based on what the client actually asked for." },

    { type: "closing", heading: "Lecture 19 in Six Points", items: [
      "Status codes fall into five families by their first digit: 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error.",
      "Know the exact use of 200, 201, 204, 301/302, 400, 401, 403, 404, 409, 422, and 500 — especially 401 (not authenticated) vs. 403 (not authorized), and 400 (malformed) vs. 422 (failed validation).",
      "Key request headers: Accept (what the client wants back), Content-Type (format of the request body), Authorization (credentials), User-Agent (identifies the client).",
      "Key response headers: Content-Type (response format), Cache-Control (caching rules), Set-Cookie (store a cookie), Location (redirect / new resource URL).",
      "Content negotiation lets a client and server agree on a response format using the Accept header; Express supports this with res.format().",
      "Set status codes explicitly with res.status(code), and always choose the code that most accurately describes what happened.",
    ] },
  ],
});
