const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-25";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 25: REST API Development and Authentication",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-25-REST-API-Development-and-Authentication.pptx",
  slides: [
    { type: "title", lectureNo: 25, heading: "REST API Development\nand Authentication",
      sub: "Designing clean, consistent endpoints — then locking them down with sessions, JWTs, and bcrypt." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "REST principles: resources, URIs, HTTP verbs, and statelessness",
      "Designing CRUD endpoints with consistent JSON response shapes",
      "Session-based vs. token-based authentication (JWT)",
      "Hashing passwords safely with bcrypt",
      "Protecting routes with authentication middleware and role-based access control",
    ] },

    { type: "bullets", kicker: "REST Principles", heading: "What Is REST?", items: [
      "REST (Representational State Transfer): design principles for APIs built around resources — the \"nouns\" of your app (a user, a post, an order)",
      "Operations on resources go through URLs and standard HTTP methods",
      "No custom action per operation — avoid /getUser or /deleteUserById",
    ] },

    { type: "table", kicker: "REST Principles", heading: "Resources and URIs",
      header: ["Resource", "Collection URI", "Single Resource URI"], colW: [3.6, 4.2, 4.2], rowH: 0.8,
      rows: [
        ["Users", "/api/users", "/api/users/:id"],
        ["Posts", "/api/posts", "/api/posts/:id"],
        ["Comments (nested)", "/api/posts/:postId/comments", "/api/posts/:postId/comments/:id"],
      ] },

    { type: "callout", kicker: "REST Principles", heading: "Plural Nouns, No Verbs", kind: "tip", h: 1.7,
      text: "Use plural nouns for resource names (/users, not /user), and never put a verb in the URI (avoid /getUsers or /deleteUser/5) — the HTTP method already communicates the action." },

    { type: "table", kicker: "REST Principles", heading: "HTTP Verbs: What to Do With a Resource",
      header: ["Method", "Meaning", "Example"], colW: [2.2, 3.4, 6.4], rowH: 0.72,
      rows: [
        ["GET", "Read a resource, never changes data", "GET /api/users/5"],
        ["POST", "Create a new resource", "POST /api/users"],
        ["PUT", "Replace a resource entirely", "PUT /api/users/5"],
        ["PATCH", "Partially update a resource", "PATCH /api/users/5"],
        ["DELETE", "Remove a resource", "DELETE /api/users/5"],
      ] },

    { type: "bullets", kicker: "REST Principles", heading: "Statelessness", items: [
      "Each request must carry everything the server needs to process it — an auth token, for example",
      "The server should not rely on remembering anything about the client from a previous request",
      "This is why token-based auth fits REST APIs especially well — though session-based APIs remain common, especially for server-rendered apps",
    ] },

    { type: "diagram", kicker: "REST Principles", heading: "Every Request, Routed by Method",
      nodes: [
        { x: 5.3, y: 2.3, w: 2.7, h: 0.6, text: "Client Request", fill: "1E1E4C", fontSize: 12.5 },
        { x: 5.15, y: 3.15, w: 3.0, h: 0.75, text: "HTTP Method?", shape: "diamond", fill: "FF8A3D", fontSize: 12 },
        { x: 0.9, y: 4.55, w: 2.1, h: 0.6, text: "Read\nresource", fill: "2B2B7A", fontSize: 11.5 },
        { x: 3.3, y: 4.55, w: 2.1, h: 0.6, text: "Create\nresource", fill: "2B2B7A", fontSize: 11.5 },
        { x: 5.7, y: 4.55, w: 2.1, h: 0.6, text: "Update\nresource", fill: "2B2B7A", fontSize: 11.5 },
        { x: 8.1, y: 4.55, w: 2.1, h: 0.6, text: "Remove\nresource", fill: "2B2B7A", fontSize: 11.5 },
        { x: 4.5, y: 5.8, w: 4.3, h: 0.6, text: "JSON Response", fill: "3FA66B", fontSize: 12.5 },
      ],
      edges: [
        { x1: 6.65, y1: 2.9, x2: 6.65, y2: 3.15 },
        { x1: 5.6, y1: 3.65, x2: 2.0, y2: 4.55, label: "GET" },
        { x1: 6.1, y1: 3.9, x2: 4.4, y2: 4.55, label: "POST" },
        { x1: 7.2, y1: 3.9, x2: 6.7, y2: 4.55, label: "PUT / PATCH" },
        { x1: 7.7, y1: 3.65, x2: 9.1, y2: 4.55, label: "DELETE" },
        { x1: 2.0, y1: 5.15, x2: 5.5, y2: 5.85 },
        { x1: 4.4, y1: 5.15, x2: 6.0, y2: 5.8 },
        { x1: 6.7, y1: 5.15, x2: 6.9, y2: 5.8 },
        { x1: 9.1, y1: 5.15, x2: 7.5, y2: 5.85 },
      ] },

    { type: "code", kicker: "CRUD Endpoints", heading: "GET: List and Read One",
      code: '// GET /api/posts — list\nrouter.get("/posts", async (req, res) => {\n  const posts = await Post.find();\n  res.status(200).json({ data: posts });\n});\n\n// GET /api/posts/:id — read one\nrouter.get("/posts/:id", async (req, res) => {\n  const post = await Post.findById(req.params.id);\n  if (!post) return res.status(404).json({ error: "Post not found." });\n  res.status(200).json({ data: post });\n});' },

    { type: "code", kicker: "CRUD Endpoints", heading: "POST, PATCH, DELETE",
      code: '// POST /api/posts — create\nrouter.post("/posts", async (req, res) => {\n  try {\n    const post = await Post.create(req.body);\n    res.status(201).json({ data: post });\n  } catch (err) {\n    res.status(400).json({ error: err.message });\n  }\n});\n\n// DELETE /api/posts/:id\nrouter.delete("/posts/:id", async (req, res) => {\n  const post = await Post.findByIdAndDelete(req.params.id);\n  if (!post) return res.status(404).json({ error: "Post not found." });\n  res.status(204).send(); // No Content\n});' },

    { type: "callout", kicker: "CRUD Endpoints", heading: "Keep the Response Shape Consistent", kind: "note", h: 2.0,
      text: "Successful responses wrap the payload in { data: ... }, errors use { error: ... }, and the status code always matches what happened (200 OK, 201 Created, 204 No Content, 404 Not Found, 400 Bad Request). One shape, every endpoint." },

    { type: "bullets", kicker: "Authentication", heading: "Session-Based Authentication (Recap)", items: [
      "After login, the server creates a session (data stored server-side) and sends a session ID in a cookie",
      "On every future request, the browser attaches that cookie automatically and the server looks up the session",
      "Storage lives on the server; the client only holds a small ID",
      "Fits naturally with server-rendered (SSR) apps — but harder to scale across multiple servers sharing one session store",
    ] },

    { type: "bullets", kicker: "Authentication", heading: "Token-Based Authentication (JWT)", items: [
      "The server issues the client a self-contained token after login — no server-side memory required",
      "The client stores the token and sends it back on every request, usually in an Authorization header",
      "The server verifies the token's authenticity without a storage lookup",
      "A JWT is a string of three dot-separated parts: header (metadata), payload (data like user ID/role), and signature (proves it wasn't tampered with)",
    ] },

    { type: "diagram", kicker: "Authentication", heading: "Issuing and Verifying a JWT",
      nodes: [
        { x: 1.1, y: 2.3, w: 2.4, h: 0.5, text: "Client", fill: "2B2B7A", fontSize: 13 },
        { x: 9.8, y: 2.3, w: 2.4, h: 0.5, text: "Server", fill: "2B2B7A", fontSize: 13 },
      ],
      edges: [
        { x1: 2.3, y1: 2.8, x2: 2.3, y2: 6.5, color: "D8D8E6" },
        { x1: 11.0, y1: 2.8, x2: 11.0, y2: 6.5, color: "D8D8E6" },
        { x1: 2.3, y1: 3.05, x2: 11.0, y2: 3.05, label: "POST /api/login\n(email, password)" },
        { x1: 11.0, y1: 3.7, x2: 11.0, y2: 3.7, label: "verify password,\ncreate + sign JWT" },
        { x1: 11.0, y1: 4.35, x2: 2.3, y2: 4.35, label: "200 OK { token }", dashed: true },
        { x1: 2.3, y1: 5.0, x2: 11.0, y2: 5.0, label: "GET /api/posts\nAuthorization: Bearer <token>" },
        { x1: 11.0, y1: 5.65, x2: 11.0, y2: 5.65, label: "verify signature\n& expiry" },
        { x1: 11.0, y1: 6.3, x2: 2.3, y2: 6.3, label: "200 OK { data }", dashed: true },
      ],
      caption: "The client stores the token after login and resends it on every request — the server never has to remember anything between requests." },

    { type: "code", kicker: "JWT", heading: "Issuing a Token at Login",
      code: 'npm install jsonwebtoken\n\nfunction issueToken(user) {\n  return jwt.sign(\n    { userId: user._id, role: user.role },\n    process.env.JWT_SECRET,\n    { expiresIn: "1h" }\n  );\n}\n\napp.post("/api/login", async (req, res) => {\n  const { email, password } = req.body;\n  const user = await User.findOne({ email });\n  const validPassword = user && (await bcrypt.compare(password, user.passwordHash));\n  if (!validPassword) return res.status(401).json({ error: "Invalid email or password." });\n  res.status(200).json({ data: { token: issueToken(user) } });\n});' },

    { type: "code", kicker: "JWT", heading: "Verifying a Token",
      code: 'function verifyToken(req, res, next) {\n  const authHeader = req.headers.authorization; // "Bearer eyJhbGciOi..."\n  const token = authHeader && authHeader.split(" ")[1];\n  if (!token) return res.status(401).json({ error: "No token provided." });\n\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.userId = decoded.userId;\n    req.userRole = decoded.role;\n    next();\n  } catch (err) {\n    return res.status(401).json({ error: "Invalid or expired token." });\n  }\n}' },

    { type: "bullets", kicker: "JWT", heading: "Refreshing Tokens", items: [
      "A short-lived token (like the 1-hour one above) keeps expiring — apps often issue a second, longer-lived refresh token alongside it",
      "When the access token expires, the client sends the refresh token to a dedicated endpoint to get a new one",
      "This avoids forcing the user to log in again",
    ] },

    { type: "code", kicker: "JWT", heading: "The Refresh Endpoint",
      code: 'app.post("/api/refresh", async (req, res) => {\n  const { refreshToken } = req.body;\n  try {\n    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);\n    const newAccessToken = jwt.sign(\n      { userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "1h" }\n    );\n    res.status(200).json({ data: { token: newAccessToken } });\n  } catch (err) {\n    res.status(401).json({ error: "Invalid refresh token, please log in again." });\n  }\n});' },

    { type: "table", kicker: "Comparison", heading: "Session-Based vs. Token-Based (JWT)",
      header: ["", "Session-Based", "Token-Based (JWT)"], colW: [3.2, 4.4, 4.8], leftCol: 0, rowH: 0.62,
      rows: [
        ["Identity lives", "Server-side session store", "Self-contained in the token"],
        ["Client holds", "Small session ID (cookie)", "The full token"],
        ["Server lookup needed?", "Yes, every request", "No — signature is enough"],
        ["Fits well with", "Server-rendered (SSR) apps", "REST APIs, mobile apps, SPAs"],
        ["Revoking access early", "Easy — delete the session", "Harder — valid until expiry"],
      ] },

    { type: "callout", kicker: "Comparison", heading: "Neither Is Universally \"Better\"", kind: "note", h: 1.9,
      text: "Session-based auth remains an excellent, simple choice for traditional server-rendered applications, while JWTs shine when your API is consumed by multiple separate clients (a React SPA, a mobile app) that aren't using browser cookies at all." },

    { type: "bullets", kicker: "Password Hashing", heading: "Never Store Plain-Text Passwords", items: [
      "If your database is ever compromised, plain-text passwords hand the attacker every user's real password immediately",
      "Instead, store a hash — the output of a one-way function that scrambles the password so it can't practically be reversed",
      "bcrypt is a widely trusted password-hashing algorithm — deliberately slow, and automatically salted (random data so identical passwords hash differently)",
    ] },

    { type: "code", kicker: "Password Hashing", heading: "Hashing and Comparing With bcrypt",
      code: 'npm install bcrypt\n\n// When a user registers:\nconst passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds\nconst user = await User.create({ email, passwordHash });\n\n// When a user logs in:\nconst isMatch = await bcrypt.compare(plainTextPassword, user.passwordHash);',
      note: "bcrypt.compare() re-hashes the submitted password using the same salt and checks if the results match — it never \"un-hashes\" anything, because that's not mathematically possible." },

    { type: "callout", kicker: "Password Hashing", heading: "Passwords Are Radioactive", kind: "warning", h: 2.0,
      text: "Never log, email, or send a user's plain-text password anywhere, even temporarily — and never implement \"forgot password\" by emailing the old password back, since you never stored it. Send a time-limited reset link/token instead." },

    { type: "code", kicker: "Protected Routes", heading: "Combining Middleware for RBAC",
      code: 'function requireRole(role) {\n  return function (req, res, next) {\n    if (req.userRole !== role) {\n      return res.status(403).json({ error: "Forbidden: insufficient permissions." });\n    }\n    next();\n  };\n}\n\napp.delete("/api/users/:id", verifyToken, requireRole("admin"), async (req, res) => {\n  await User.findByIdAndDelete(req.params.id);\n  res.status(204).send();\n});',
      note: "verifyToken runs first (confirms WHO the user is), then requireRole(\"admin\") runs (confirms they're ALLOWED to do this). Either check failing stops the request there." },

    { type: "callout", kicker: "Protected Routes", heading: "Two Middleware, Two Jobs", kind: "tip", h: 1.7,
      text: "This uses the same middleware-chaining pattern from the Middleware lecture — authentication and authorization are two of the most common real-world uses for custom middleware." },

    { type: "closing", heading: "Lecture 25 in Six Points", items: [
      "REST organizes an API around resources identified by URIs, using standard HTTP verbs instead of custom action names.",
      "REST APIs are ideally stateless — each request carries what the server needs, rather than relying on server memory.",
      "Design CRUD endpoints with consistent JSON response shapes ({ data } / { error }) and accurate HTTP status codes.",
      "Session-based auth keeps identity on the server; token-based auth (JWT) puts a signed, self-contained token in the client's hands.",
      "JWTs are issued at login, verified on protected routes, and often paired with a longer-lived refresh token.",
      "Always hash passwords with bcrypt (never plain text); chain authentication middleware with role-based access control on protected routes.",
    ] },
  ],
});
