const { buildDeck } = require("./deckBuilder");

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 20: Cookies and Sessions",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-20-Cookies-and-Sessions.pptx",
  slides: [
    { type: "title", lectureNo: 20, heading: "Cookies\nand Sessions",
      sub: "How a stateless protocol remembers you — logged in, mid-checkout, and everything in between." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Understand why HTTP is stateless, and why applications need a way to manage state",
      "Learn how cookies are created and understand their key attributes",
      "Learn how sessions work: session identifiers and server-side session stores",
      "Compare session-based state management with pure cookie-based state",
      "Walk through a full login/logout flow, including session expiry",
      "Understand basic security considerations for cookies and sessions",
    ] },

    { type: "bullets", kicker: "Statelessness", heading: "The Statelessness of HTTP", items: [
      "Stateless means each request is handled with no memory of any previous request",
      "Intentional — it's a big reason the web scales so well; a stateless server doesn't track every visitor it's ever seen",
      "But real applications clearly DO remember you: logged in, cart contents, preferences",
    ] },

    { type: "flow", kicker: "Statelessness", heading: "Without Help, the Server Forgets",
      steps: [
        { label: "Browser:\nadd-to-cart" },
        { label: "Server:\n200 OK (added)" },
        { label: "Browser:\nGET /checkout" },
        { label: "Server:\n\"Cart is\nempty??\"" },
      ],
      caption: "Without extra help, the server has already forgotten the add-to-cart request by the time /checkout arrives — each request stands completely alone." },

    { type: "bullets", kicker: "State Management", heading: "Cookies and Sessions", items: [
      "State management: a mechanism that lets a stateless protocol FEEL stateful by carrying identifying information along with each request",
      "Lets the server connect separate requests together as belonging to the same visitor",
      "The two main tools are cookies and sessions — often used together",
    ] },

    { type: "bullets", kicker: "Cookies", heading: "What Is a Cookie?", items: [
      "A small key-value pair, generally capped around 4KB, that a server asks the browser to store",
      "The browser automatically resends it with every future request to that same server",
      "The basic building block that makes state management possible on the web",
    ] },

    { type: "code", kicker: "Cookies", heading: "Creating a Cookie",
      code: "app.get('/set-theme', (req, res) => {\n  res.cookie('theme', 'dark'); // sets Set-Cookie\n  res.send('Theme preference saved!');\n});\n\napp.get('/get-theme', (req, res) => {\n  console.log(req.cookies); // needs cookie-parser\n  res.send('Check the console for your theme.');\n});",
      note: "res.cookie() works out of the box; reading req.cookies needs extra middleware (next slide)." },

    { type: "callout", kicker: "Cookies", heading: "req.cookies Needs cookie-parser", kind: "note", h: 2.2,
      text: "Express does not parse incoming cookies into req.cookies by default — you need the small cookie-parser package (npm install cookie-parser, then app.use(require('cookie-parser')())) to read cookies sent by the browser. Setting cookies with res.cookie(), however, works out of the box." },

    { type: "flow", kicker: "Cookies", heading: "Setting and Reading a Cookie",
      steps: [
        { label: "Browser:\nGET /set-theme" },
        { label: "Server:\nSet-Cookie:\ntheme=dark" },
        { label: "Browser:\nGET /get-theme\n+ Cookie: theme=dark" },
        { label: "Server:\nreads\ntheme=dark" },
      ],
      caption: "The browser stores the cookie once, then attaches it automatically to every later request to that server — no extra client-side code required." },

    { type: "table", kicker: "Cookie Attributes", heading: "Cookie Attributes That Matter",
      header: ["Attribute", "Meaning"], colW: [2.6, 9.333], leftCol: 0, rowH: 0.85,
      rows: [
        ["Expires / Max-Age", "When the cookie is deleted — without it, a session cookie (gone when the browser closes); with it, persistent"],
        ["Path", "Restricts the cookie to requests under a specific path, e.g. Path=/admin"],
        ["HttpOnly", "Blocks client-side JavaScript (document.cookie) from reading the cookie — defends against XSS"],
        ["Secure", "The cookie is only ever sent over HTTPS — always use this in production"],
        ["SameSite", "Controls cross-site sending: Strict, Lax (common default), or None — a major CSRF defense"],
      ] },

    { type: "code", kicker: "Cookie Attributes", heading: "Setting Attributes",
      code: "app.get('/login', (req, res) => {\n  res.cookie('sessionId', 'abc123', {\n    maxAge: 24 * 60 * 60 * 1000, // 24 hours\n    httpOnly: true,\n    secure: true,  // HTTPS only\n    sameSite: 'lax'\n  });\n  res.send('Logged in!');\n});",
      note: "maxAge is in milliseconds; without it (or Expires) the cookie disappears when the browser closes." },

    { type: "callout", kicker: "Cookie Attributes", heading: "Always Set HttpOnly on Sensitive Cookies", kind: "warning", h: 2.2,
      text: "A cookie without HttpOnly can be read — and stolen — by any JavaScript running on the page, including malicious injected scripts. Any cookie that identifies a logged-in user, like a session ID, should always be set with HttpOnly: true." },

    { type: "bullets", kicker: "Sessions", heading: "Why Not Just Store Data in the Cookie?", items: [
      "Cookies are capped around 4KB — too small for real application data",
      "They're visible to (and can be tampered with by) the user unless specially protected",
      "You generally don't want sensitive data like \"this user is an admin\" sitting on the client",
    ] },

    { type: "bullets", kicker: "Sessions", heading: "How a Session Works", items: [
      "The session identifier (session ID) is generated by the server and sent to the browser as a cookie",
      "The actual session data lives in a session store on the server — memory for testing, a database or Redis in production",
      "On every request, the browser resends the session ID cookie; the server looks it up in its store",
    ] },

    { type: "flow", kicker: "Sessions", heading: "Login Creates a Session",
      steps: [
        { label: "Browser:\nPOST /login" },
        { label: "Server → Store:\ncreate session" },
        { label: "Store → Server:\nsessionId" },
        { label: "Server → Browser:\nSet-Cookie" },
        { label: "Browser:\nGET /dashboard\n+ cookie" },
        { label: "Server → Store:\nlook up ID" },
      ],
      caption: "The cookie only ever carries an opaque ID — the real data (who's logged in) stays server-side in the session store." },

    { type: "code", kicker: "Sessions", heading: "express-session Setup",
      code: "const express = require('express');\nconst session = require('express-session');\nconst app = express();\napp.use(express.json());\n\napp.use(session({\n  secret: 'a-long-random-secret-string',\n  resave: false,\n  saveUninitialized: false,\n  cookie: {\n    httpOnly: true,\n    secure: false, // true in production\n    maxAge: 30 * 60 * 1000 // 30 min\n  }\n}));" },

    { type: "code", kicker: "Sessions", heading: "Login and Dashboard Routes",
      code: "app.post('/login', (req, res) => {\n  // verify credentials against a DB first\n  req.session.userId = 7;\n  req.session.username = req.body.username;\n  res.send('Logged in!');\n});\n\napp.get('/dashboard', (req, res) => {\n  if (!req.session.userId) {\n    return res.status(401).send('Please log in first.');\n  }\n  res.send(`Welcome back, ${req.session.username}!`);\n});" },

    { type: "code", kicker: "Sessions", heading: "Logout Route",
      code: "app.post('/logout', (req, res) => {\n  req.session.destroy(() => {\n    res.send('Logged out.');\n  });\n});\n\napp.listen(3000);",
      note: "req.session.destroy() removes the session from the store — nothing is left for the old cookie to reference." },

    { type: "table", kicker: "Session- vs. Cookie-Based", heading: "Where Does the Data Actually Live?",
      header: ["", "Cookie-based state", "Session-based state"], colW: [2.9, 4.5, 4.533], leftCol: 0, rowH: 0.85,
      rows: [
        ["Where the data lives", "In the browser (inside the cookie)", "On the server (in the session store)"],
        ["Size limit", "Small (~4KB per cookie)", "Effectively unlimited"],
        ["Can the user tamper?", "Yes, unless cryptographically signed", "No — the user only holds an opaque ID"],
        ["Server needs storage?", "No", "Yes — memory, database, or Redis"],
        ["Good for", "Small, low-sensitivity values (theme, language)", "Anything sensitive or substantial (login, cart)"],
      ] },

    { type: "callout", kicker: "Session- vs. Cookie-Based", heading: "Signed Cookies: A Middle Ground", kind: "tip", h: 2.2,
      text: "Signed cookies keep the actual data in the cookie, but cryptographically sign it so the server can detect tampering. This adds tamper-detection but not secrecy — the data is still visible to the user, just not undetectably editable. Still not the right choice for genuinely secret data." },

    { type: "bullets", kicker: "Login/Logout Flow", heading: "Putting It Together", items: [
      "Login: the user submits credentials to a login route",
      "The server verifies the credentials against a database",
      "If valid, it creates a new session, stores data like the user's ID, and sends the session ID back as a cookie",
      "Authenticated requests: the browser attaches the session cookie automatically; the server looks up the session on each one",
      "Logout: destroys the session on the server, and typically clears the cookie on the client too",
      "Expiry: maxAge stops the browser from resending an old cookie; a good session store also expires the server-side data independently",
    ] },

    { type: "flow", kicker: "Login/Logout Flow", heading: "The Full Login → Logout Sequence",
      steps: [
        { label: "Submit\ncredentials" },
        { label: "POST /login\nverify + create\nsession" },
        { label: "Set-Cookie:\nsessionId=..." },
        { label: "Every request:\ncookie sent\nautomatically" },
        { label: "Click Logout\nPOST /logout" },
        { label: "Destroy session\n+ clear cookie" },
      ],
      caption: "Even if someone later obtained the old session cookie, it would no longer correspond to a valid session once destroyed." },

    { type: "bullets", kicker: "Security", heading: "Basic Security Considerations", numbered: false, items: [
      "Always set HttpOnly on session cookies — closes off a major theft vector (XSS)",
      "Always use Secure (and HTTPS) in production — the session ID is never sent in plain text",
      "Set a reasonable SameSite value and a reasonable maxAge — sessions that never expire are a standing risk",
      "Never store highly sensitive raw data (like plaintext passwords) inside a session, even server-side",
    ] },

    { type: "callout", kicker: "Security", heading: "Always Destroy the Session on Logout", kind: "warning", h: 2.1,
      text: "Destroy the session on the server side, not just by clearing the cookie in the browser — otherwise, an attacker who somehow captured the old cookie value could still use it after the user thought they had logged out." },

    { type: "closing", heading: "Lecture 20 in Six Points", items: [
      "HTTP is stateless: each request is handled independently, with no built-in memory of previous requests from the same client.",
      "A cookie is a small piece of data the server asks the browser to store and resend automatically, set via the Set-Cookie header.",
      "Key cookie attributes: Expires/Max-Age (lifetime), Path (scope), HttpOnly (blocks client-side JS), Secure (HTTPS only), and SameSite (cross-site sending).",
      "A session keeps the actual data on the server (in a session store) and uses a session identifier, held in a cookie, as the lookup key.",
      "A login/logout flow creates a session at login, checks it on each authenticated request, and destroys it at logout — sessions should always expire.",
      "Always combine HttpOnly, Secure, and a sensible SameSite setting on session cookies, and always destroy sessions server-side on logout.",
    ] },
  ],
});
