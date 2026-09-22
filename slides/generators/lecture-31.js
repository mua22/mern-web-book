const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-31";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 31: Common Web Attacks and Defences",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-31-Common-Web-Attacks-and-Defences.pptx",
  slides: [
    { type: "title", lectureNo: 31, heading: "Common Web Attacks\nand Defences",
      sub: "The specific attacks that hit real web applications most often — and the defence that stops each one." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "SQL and NoSQL injection, and how parameterized queries prevent them",
      "The three types of Cross-Site Scripting (XSS), plus a Content Security Policy intro",
      "Cross-Site Request Forgery (CSRF) and anti-CSRF tokens",
      "Broken access control and session hijacking / fixation",
      "CORS misconfiguration as a security risk, and the basics of rate limiting",
    ] },

    { type: "callout", kicker: "Where These Come From", heading: "The OWASP Top 10", kind: "note", h: 1.9,
      text: "Most attacks in this lecture appear on the OWASP Top 10 — a well-known, regularly updated list of the most critical web application security risks, published by the Open Worldwide Application Security Project. Worth revisiting throughout your career." },

    { type: "bullets", kicker: "Injection", heading: "What Is an Injection Attack?", items: [
      "Untrusted input is inserted directly into a command executed by an interpreter — like a database query",
      "This lets an attacker change what that command actually does",
      "SQL databases and NoSQL databases (like MongoDB) are both vulnerable to their own version of it",
    ] },

    { type: "code", kicker: "SQL Injection", heading: "Gluing Strings Into a Query",
      code: "// VULNERABLE -- never do this\nconst query = `SELECT * FROM users\n  WHERE username = '${username}'\n  AND password = '${password}'`;\ndb.execute(query);",
      note: "If the attacker types ' OR '1'='1 as the username, the query becomes ...WHERE username='' OR '1'='1' AND password=''. Since '1'='1' is always true, it can return every row -- logging the attacker in without any password." },

    { type: "code", kicker: "NoSQL Injection", heading: "The Same Idea, No SQL Required",
      code: '// VULNERABLE -- never do this\napp.post("/login", async (req, res) => {\n  const user = await User.findOne({\n    username: req.body.username,\n    password: req.body.password,\n  });\n});',
      note: 'If the attacker sends { "username": "admin", "password": { "$ne": null } } as JSON, MongoDB reads $ne as "not equal to null" -- true for almost any stored password, logging them in as admin.' },

    { type: "bullets", kicker: "The Fix", heading: "Parameterized Queries", items: [
      "Never build a query by concatenating raw user input into it",
      "Send the query structure and the user-supplied values to the database SEPARATELY",
      "The database engine then treats values strictly as data, never as executable query logic",
    ] },

    { type: "code", kicker: "The Fix", heading: "Safe, in SQL and MongoDB",
      code: '// SAFE -- SQL, parameterized placeholders\nconst result = await pool.query(\n  "SELECT * FROM users WHERE username = $1\n   AND password_hash = $2",\n  [username, hashedPassword]\n);\n\n// SAFE -- Mongoose, enforcing expected types first\nif (typeof username !== "string" || typeof password !== "string") {\n  return res.status(400).json({ error: "Invalid input." });\n}\nconst user = await User.findOne({ username });',
      note: "express-mongo-sanitize is also commonly used to strip $-prefixed keys from incoming data as an extra layer of defence." },

    { type: "callout", kicker: "The Fix", heading: "Never Build Queries With String Concatenation", kind: "warning", h: 1.9,
      text: "If you ever see a query built like `...WHERE x = '${value}'` anywhere in your code -- SQL or otherwise -- treat it as a bug to fix immediately, even in a class project. This single habit, more than any other, is responsible for a huge share of real-world data breaches." },

    { type: "bullets", kicker: "Cross-Site Scripting", heading: "What Is XSS?", items: [
      "An attacker gets their own JavaScript to run inside another user's browser, in the context of your site",
      "Because it runs AS IF part of your site, it can steal cookies, read what the user sees, or act on their behalf",
      "Three common types: stored, reflected, and DOM-based",
    ] },

    { type: "bullets", kicker: "Stored XSS", heading: "Saved on the Server, Served to Everyone", items: [
      "Malicious script gets saved on the server (e.g. a database) and is later served to other users",
      "Example: a comment box that doesn't sanitize input stores a comment containing a <script> tag",
      "If rendered into every visitor's page without encoding, the script runs in EVERY viewer's browser",
    ] },

    { type: "flow", kicker: "Stored XSS", heading: "How It Plays Out",
      steps: [
        { label: "Attacker posts\ncomment w/ <script>" },
        { label: "Server stores it\nas-is (no sanitize)" },
        { label: "Victim requests\nthe page" },
        { label: "Server sends HTML\nwith the script" },
        { label: "Victim's browser\nexecutes it" },
      ],
      caption: "Cookies stolen, requests made as the victim -- all without the victim doing anything but viewing the page." },

    { type: "imagePair", kicker: "Stored XSS", heading: "Unsanitized vs. Output-Encoded",
      left: { img: `${IMG}/stored-xss-unsafe.png`, label: "Stored raw, inserted via innerHTML" },
      right: { img: `${IMG}/stored-xss-safe.png`, label: "Stored the same, rendered as text" } },

    { type: "bullets", kicker: "Reflected XSS", heading: "Bounced Straight Back in the Response", items: [
      "Malicious script is part of a request (often a URL) and the server reflects it back immediately, without storing it",
      "Example: a search page echoing ?q=<script>...</script> straight into \"You searched for: ...\"",
      "The attacker tricks a victim into clicking a crafted link (email, chat) -- it runs the moment the page loads",
    ] },

    { type: "code", kicker: "DOM-Based XSS", heading: "Entirely in the Browser, Never Touches the Server",
      code: '// VULNERABLE -- DOM-based XSS\nconst params = new URLSearchParams(window.location.search);\ndocument.getElementById("welcome").innerHTML =\n  "Welcome, " + params.get("name");\n// ?name=<img src=x onerror=alert(1)> executes attacker JS',
      note: "Because the vulnerable code runs purely client-side, this type can be invisible even if you carefully audit your server code." },

    { type: "code", kicker: "Preventing XSS", heading: "Output Encoding: React Does It by Default",
      code: '// SAFE in React -- text is automatically escaped\nfunction Comment({ text }) {\n  return <p>{text}</p>; // a <script> tag renders as harmless text\n}\n\n// DANGEROUS -- deliberately opts out of escaping\nfunction Comment({ html }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />;\n}' },

    { type: "code", kicker: "Preventing XSS", heading: "Sanitizing Real HTML With DOMPurify",
      code: 'import DOMPurify from "dompurify";\n\nconst clean = DOMPurify.sanitize(userSuppliedHtml);\n// now safe to pass to dangerouslySetInnerHTML',
      note: "Needed when you genuinely must render user-supplied HTML, like a rich-text blog editor -- it strips dangerous tags/attributes while keeping safe formatting." },

    { type: "code", kicker: "Content Security Policy", heading: "A Browser-Enforced Safety Net",
      code: "Content-Security-Policy: default-src 'self'; script-src 'self'",
      note: "Tells the browser which sources of scripts, styles, and other resources are allowed to load. Even if an attacker sneaks a <script> tag onto your page, a strict CSP can stop the browser from running it. Works ALONGSIDE output encoding, not instead of it." },

    { type: "bullets", kicker: "CSRF", heading: "Tricking a Logged-In Victim's Browser", items: [
      "Cross-Site Request Forgery: a site the victim never intended to request gets requested anyway",
      "Exploits that browsers auto-attach cookies (like a session cookie) to every request, regardless of which page triggered it",
      "Your bank's POST /transfer, authenticated purely by a session cookie, is a perfect target",
    ] },

    { type: "code", kicker: "CSRF", heading: "A Hidden, Auto-Submitting Form",
      code: '<!-- On evil.com -- victim never sees this, it submits itself -->\n<form action="https://yourbank.com/transfer" method="POST"\n      id="csrf-form">\n  <input type="hidden" name="amount" value="1000" />\n  <input type="hidden" name="to" value="attacker-account" />\n</form>\n<script>\n  document.getElementById("csrf-form").submit();\n</script>' },

    { type: "flow", kicker: "CSRF", heading: "How the Forged Request Succeeds",
      steps: [
        { label: "Victim, logged\ninto YourBank" },
        { label: "Visits\nevil.com" },
        { label: "Page auto-\nsubmits hidden form" },
        { label: "Browser sends POST,\ncookie attached" },
        { label: "Bank sees valid\ncookie, transfers" },
      ],
      caption: "The victim never clicked \"transfer\" -- from the browser's point of view it's just a normal request to yourbank.com." },

    { type: "code", kicker: "Preventing CSRF", heading: "Anti-CSRF Tokens",
      code: 'app.get("/transfer-form", (req, res) => {\n  const csrfToken = generateRandomToken();\n  req.session.csrfToken = csrfToken;\n  res.render("transfer", { csrfToken });\n});\n\napp.post("/transfer", (req, res) => {\n  if (req.body.csrfToken !== req.session.csrfToken) {\n    return res.status(403).json({ error: "Invalid CSRF token." });\n  }\n  // proceed with the transfer\n});',
      note: "evil.com has no way to read or guess this token -- it can't read cookies or page content from a different origin." },

    { type: "callout", kicker: "Preventing CSRF", heading: "Header-Based Auth Is Naturally More Resistant", kind: "note", h: 1.9,
      text: "CSRF specifically abuses the browser's automatic cookie-attaching. If your API requires a token sent manually in an Authorization header (as with JWTs in Lecture 25) rather than relying on cookies, a forged form submission can't attach that header -- though it introduces its own tradeoffs around client-side token storage." },

    { type: "bullets", kicker: "Broken Access Control", heading: "Checking Who, Not What They Can Do", items: [
      "A broad category: a user can access data or perform an action they should not be permitted to",
      "Most common example: Insecure Direct Object Reference (IDOR) — trusting a client-supplied ID without checking ownership",
      "Also: reaching /admin by guessing the URL, or a frontend that only HIDES an unauthorized action",
    ] },

    { type: "code", kicker: "Broken Access Control", heading: "IDOR — Vulnerable vs. Fixed",
      code: '// VULNERABLE -- checks authentication, not authorization\napp.get("/api/invoices/:id", requireLogin, async (req, res) => {\n  const invoice = await Invoice.findById(req.params.id);\n  res.json(invoice); // returns ANY invoice\n});\n\n// SAFE -- also verifies the resource belongs to this user\napp.get("/api/invoices/:id", requireLogin, async (req, res) => {\n  const invoice = await Invoice.findOne(\n    { _id: req.params.id, owner: req.user.id });\n  if (!invoice) return res.status(404).json({ error: "Not found." });\n  res.json(invoice);\n});' },

    { type: "callout", kicker: "Broken Access Control", heading: "Hiding a Button Is Not Access Control", kind: "warning", h: 1.9,
      text: "Hiding an admin feature in React ({user.isAdmin && <AdminButton />}) only improves the interface -- it does nothing to stop someone calling the admin API endpoint directly. Every privileged action must be enforced on the SERVER, not just hidden on the client." },

    { type: "bullets", kicker: "Sessions", heading: "Session Hijacking vs. Session Fixation", items: [
      "A session remembers a logged-in user across requests, usually via a session ID cookie",
      "Hijacking: an attacker steals a valid user's session ID (via XSS, sniffed traffic, a leaked log) and impersonates them",
      "Fixation: the attacker SETS the victim's session ID to a known value before they log in, then uses that same ID",
    ] },

    { type: "table", kicker: "Sessions", heading: "Defences Against Both",
      header: ["Defence", "Why It Helps"], colW: [3.6, 8.4], leftCol: 0, rowH: 0.78,
      rows: [
        ["Always use HTTPS", "Session cookies can't be sniffed over the network"],
        ["HttpOnly + Secure cookies", "Blocks theft via XSS; only ever sent over HTTPS"],
        ["Regenerate session ID at login", "Makes a pre-fixed ID useless"],
        ["Reasonable expiry + real logout", "Invalidates the session server-side, not just the cookie"],
      ] },

    { type: "bullets", kicker: "CORS", heading: "A Security Topic, Not Just a Dev Annoyance", items: [
      "CORS lets a frontend on one origin make requests to a backend on another origin, via explicit opt-in headers",
      "By default browsers block cross-origin requests — this exists to stop CSRF-style tricks via fetch()",
      "A careless CORS config can undo protections you rely on elsewhere",
    ] },

    { type: "code", kicker: "CORS", heading: "Dangerous vs. Safe Configuration",
      code: '// DANGEROUS -- reflects any origin, allows credentials\napp.use(cors({ origin: true, credentials: true }));\n\n// SAFE -- explicitly allow only your own frontend\napp.use(cors({\n  origin: ["https://your-frontend-domain.com"],\n  credentials: true,\n}));',
      note: "origin: true + credentials: true tells browsers 'any website may make authenticated requests using the visiting user's cookies' -- the opposite of what CORS is for." },

    { type: "bullets", kicker: "Rate Limiting", heading: "Slowing Down Abuse", items: [
      "Restricts how many requests a client (IP, account, API key) can make in a time window",
      "Defends against brute-force login attempts, denial-of-service style abuse, and data scraping",
      "Apply stricter limits on sensitive endpoints (login, password reset) than general read-only ones",
    ] },

    { type: "code", kicker: "Rate Limiting", heading: "express-rate-limit",
      code: 'const rateLimit = require("express-rate-limit");\n\nconst loginLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 5,                   // 5 login attempts per window\n  message: "Too many login attempts. Try again later.",\n});\n\napp.post("/api/login", loginLimiter, loginHandler);' },

    { type: "closing", heading: "Lecture 31 in Six Points", items: [
      "SQL/NoSQL injection mixes untrusted input into a query as if it were code; parameterized queries keep data and logic separate.",
      "XSS (stored, reflected, DOM-based) runs attacker script in another user's browser; the defence is consistent output encoding, reinforced by CSP.",
      "CSRF tricks a logged-in browser into submitting an unwanted request; anti-CSRF tokens (or header-based auth) stop it.",
      "Broken access control means checking who someone is but not what they're allowed to do — check both, on the server, every time.",
      "Session hijacking steals a session; fixation plants one in advance — HttpOnly/Secure cookies and regenerating IDs at login defend against both.",
      "A CORS misconfiguration (reflecting any origin with credentials) can silently undo the protection CORS is meant to provide; rate limiting slows brute-force and abuse.",
    ] },
  ],
});
