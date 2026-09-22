const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-30";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 30: Application Security Basics",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-30-Application-Security-Basics.pptx",
  slides: [
    { type: "title", lectureNo: 30, heading: "Application\nSecurity Basics",
      sub: "Your app is about to meet the Internet — here's how to keep it, and its users, safe." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "The CIA triad — confidentiality, integrity, availability",
      "Two guiding principles: least privilege and defence in depth",
      "HTTPS/TLS, certificates, and security-related response headers",
      "Authentication vs. authorization, revisited",
      "Input validation, output encoding, and secrets management",
    ] },

    { type: "bullets", kicker: "Why It Matters", heading: "Security for a Class Project?", items: [
      "\"Security is for big companies, not my class project\" — this is a mistake",
      "The moment an app is reachable on the Internet, automated bots probe it 24/7 for common weaknesses",
      "Security is not a bolt-on at the end — it's a way of thinking throughout development",
    ] },

    { type: "callout", kicker: "Why It Matters", heading: "Security Is a Process, Not a Checklist", kind: "note", h: 1.8,
      text: "You cannot make an application \"100% secure.\" Security is about reducing risk to an acceptable level and reacting quickly when something goes wrong — not reaching some finish line where you are \"done.\"" },

    { type: "diagram", kicker: "The CIA Triad", heading: "Three Goals of a Secure System",
      nodes: [
        { x: 4.9, y: 2.5, w: 3.5, h: 0.8, text: "CIA Triad", fill: "1E1E4C", fontSize: 15 },
        { x: 1.1, y: 4.4, w: 3.3, h: 1.2, text: "Confidentiality\nOnly the right people\ncan see data", fill: "2B2B7A", fontSize: 12 },
        { x: 5.0, y: 4.4, w: 3.3, h: 1.2, text: "Integrity\nData can't change\nwithout permission", fill: "2B2B7A", fontSize: 12 },
        { x: 8.9, y: 4.4, w: 3.3, h: 1.2, text: "Availability\nThe system stays up\nand usable", fill: "2B2B7A", fontSize: 12 },
      ],
      edges: [
        { x1: 5.5, y1: 3.3, x2: 2.75, y2: 4.4 },
        { x1: 6.65, y1: 3.3, x2: 6.65, y2: 4.4 },
        { x1: 7.8, y1: 3.3, x2: 10.55, y2: 4.4 },
      ],
      caption: "Nothing to do with the intelligence agency — every security decision maps back to protecting one (or more) of these three properties." },

    { type: "cards", kicker: "The CIA Triad", heading: "What Each Property Actually Means", cards: [
      { heading: "Confidentiality", accent: "2B2B7A", body: [
        "Information is only visible to people supposed to see it",
        "A password database should not be readable by an outside attacker",
        "Main tools: encryption and access control",
      ] },
      { heading: "Integrity", accent: "2B2B7A", body: [
        "Data can't be changed without authorization — and changes are detectable",
        "Nobody quietly edits a stored grade without a trace",
        "Main tools: checksums, digital signatures, access control",
      ] },
      { heading: "Availability", accent: "E67528", body: [
        "The system stays up and usable for legitimate users",
        "A denial-of-service attack floods a server to knock it offline",
        "Attacks availability without ever reading or changing data",
      ] },
    ] },

    { type: "bullets", kicker: "Least Privilege", heading: "Give Only the Access That's Needed", items: [
      "Every user, process, or piece of code should have ONLY the permissions it strictly needs — nothing more",
      "Example: if your API only reads/writes one collection, its DB user shouldn't be able to drop the whole database",
      "If an attacker compromises that account, least privilege limits how much damage they can do",
    ] },

    { type: "table", kicker: "Least Privilege", heading: "It Applies at Every Level",
      header: ["Level", "What Least Privilege Looks Like"], colW: [3.0, 9.0], leftCol: 0, rowH: 0.85,
      rows: [
        ["Operating system", "A web server process should not run as root / Administrator"],
        ["Database", "The app's DB user gets only the read/write it actually needs"],
        ["Application", "A regular user can't reach admin-only actions; a read-only key can't write"],
        ["Team", "Only developers who genuinely need production DB credentials get them"],
      ] },

    { type: "callout", kicker: "Least Privilege", heading: "The Question to Always Ask", kind: "tip", h: 1.7,
      text: "\"What is the SMALLEST set of permissions this needs to do its job?\" Grant that, not more. It is much easier to add a permission later than to clean up after a breach caused by over-broad access." },

    { type: "bullets", kicker: "Defence in Depth", heading: "Never Rely on One Layer", items: [
      "Layer multiple, independent defences so that if one fails, others are still standing",
      "Like a castle: not just a tall wall — also a moat, a drawbridge, guards, an inner keep",
      "If authentication alone had a bug, one flaw would expose your entire system",
    ] },

    { type: "flow", kicker: "Defence in Depth", heading: "Six Layers in a Web Application",
      steps: [
        { label: "Attacker" },
        { label: "1. HTTPS +\nfirewall" },
        { label: "2. Input\nvalidation" },
        { label: "3. Authn &\nauthz" },
        { label: "4. Least-priv.\nDB user" },
        { label: "5. Encrypted,\nbacked-up data" },
      ],
      caption: "With only step 3 (authentication) and nothing else, one login bug could expose everything. With defence in depth, one failure does not mean total compromise." },

    { type: "bullets", kicker: "HTTPS & TLS", heading: "Plain HTTP Is Not Safe", items: [
      "HTTP sends data as plain text — anyone intercepting traffic (shared Wi-Fi, your ISP) can read it, including passwords",
      "HTTPS = HTTP layered on top of TLS (Transport Layer Security), which encrypts the connection",
      "TLS is the modern successor to SSL — people still say \"SSL\" out of habit, though SSL itself is obsolete",
    ] },

    { type: "table", kicker: "HTTPS & TLS", heading: "What HTTPS Gives You — Mapped to CIA",
      header: ["HTTPS Provides", "CIA Property Protected"], colW: [5.0, 7.0], leftCol: 0, rowH: 0.85,
      rows: [
        ["Encryption — nobody eavesdropping can read the traffic", "Confidentiality"],
        ["Integrity — data can't be silently modified in transit", "Integrity"],
        ["Authentication of the server via a certificate", "(Confirms identity, backs both)"],
      ] },

    { type: "bullets", kicker: "HTTPS & TLS", heading: "Certificates and Certificate Authorities", items: [
      "A TLS certificate is a digital document proving a server's identity + its public key",
      "Issued by trusted organizations called Certificate Authorities (CAs)",
      "If a certificate is missing, expired, or doesn't match the domain, the browser warns instead of loading the page",
    ] },

    { type: "flow", kicker: "HTTPS & TLS", heading: "The TLS Handshake",
      steps: [
        { label: "Browser: \"let's\nconnect securely\"" },
        { label: "Server sends\nits certificate" },
        { label: "Browser checks\nCA + domain match" },
        { label: "Both negotiate\nan encryption key" },
        { label: "All further\ntraffic encrypted" },
      ],
      caption: "The server obtained its certificate from a CA in advance — the browser only has to verify it, not request one on the spot." },

    { type: "callout", kicker: "HTTPS & TLS", heading: "HTTPS Got Easy", kind: "tip", h: 1.8,
      text: "Free, automated certificate services like Let's Encrypt made HTTPS free and easy, which is why almost the entire web uses it by default. Most hosting platforms (Lecture 32) issue and renew certificates for you automatically." },

    { type: "table", kicker: "Response Headers", heading: "Security-Related HTTP Response Headers",
      header: ["Header", "What It Does"], colW: [4.0, 8.0], leftCol: 0, rowH: 0.85,
      rows: [
        ["Strict-Transport-Security", "\"Always use HTTPS for this site\" — even if the user types http://"],
        ["X-Content-Type-Options: nosniff", "Stops the browser guessing a file's type — blocks disguised malicious files"],
        ["X-Frame-Options", "Controls whether your page can load inside an <iframe> — prevents clickjacking"],
        ["Content-Security-Policy", "Restricts what sources of scripts/styles/resources a page can load"],
      ] },

    { type: "code", kicker: "Response Headers", heading: "A Shortcut: the helmet Middleware",
      code: 'const express = require("express");\nconst helmet = require("helmet");\n\nconst app = express();\napp.use(helmet()); // sets several security headers with good defaults' },

    { type: "cards", kicker: "Authn vs. Authz", heading: "Two Different Questions", cards: [
      { heading: "Authentication", accent: "2B2B7A", body: [
        "\"Who are you?\"",
        "Verifying an identity — a password, a token, a proof",
        "Like showing your student ID at the university gate",
      ] },
      { heading: "Authorization", accent: "E67528", body: [
        "\"What are you allowed to do?\"",
        "Happens AFTER authentication — decides if this action is permitted",
        "Like your ID having (or not having) access to a specific lab",
      ] },
    ] },

    { type: "diagram", kicker: "Authn vs. Authz", heading: "Every Request Answers Both Questions",
      nodes: [
        { x: 0.7, y: 3.1, w: 2.1, h: 0.7, text: "Incoming\nrequest", fill: "1E1E4C", fontSize: 12 },
        { x: 3.3, y: 2.9, w: 3.3, h: 1.1, text: "Authentication:\nWho are you?", shape: "diamond", fill: "FF8A3D", fontSize: 11.5 },
        { x: 3.5, y: 4.9, w: 2.9, h: 0.7, text: "401 Unauthorized", fill: "E67528", fontSize: 12 },
        { x: 7.6, y: 2.9, w: 3.5, h: 1.1, text: "Authorization:\nAre you allowed\nto do this?", shape: "diamond", fill: "FF8A3D", fontSize: 11.5 },
        { x: 7.9, y: 4.9, w: 2.9, h: 0.7, text: "403 Forbidden", fill: "E67528", fontSize: 12 },
        { x: 11.3, y: 2.9, w: 1.5, h: 1.1, text: "Request\nproceeds", fill: "3FA66B", fontSize: 11.5 },
      ],
      edges: [
        { x1: 2.8, y1: 3.45, x2: 3.3, y2: 3.45 },
        { x1: 4.5, y1: 4.0, x2: 4.5, y2: 4.9, label: "Not verified" },
        { x1: 6.6, y1: 3.45, x2: 7.6, y2: 3.45, label: "Verified" },
        { x1: 9.0, y1: 4.0, x2: 9.0, y2: 4.9, label: "Not permitted" },
        { x1: 11.1, y1: 3.45, x2: 11.3, y2: 3.45, label: "Permitted" },
      ],
      caption: "A very common bug: checking authentication but forgetting authorization — e.g. GET /api/orders/:id rejects anonymous users, but returns ANY order to ANY logged-in user." },

    { type: "callout", kicker: "Authn vs. Authz", heading: "Two Checks, Not One", kind: "warning", h: 1.5,
      extra: "401 Unauthorized really means \"you haven't proven who you are\" (an authentication failure). 403 Forbidden means \"I know who you are, but you're not allowed to do this\" (an authorization failure). Always ask both questions.",
      text: "This exact mistake — authenticated but not authorized — is common enough to have its own name: broken access control, covered in Lecture 31." },

    { type: "bullets", kicker: "Input Validation", heading: "Never Trust Data Coming In", items: [
      "Check that data from a form, URL parameter, upload, or request body matches what you expect — before using it",
      "Never trust data just because it came from your own frontend",
      "An attacker can send requests straight to your API with curl or Postman, bypassing your React forms entirely",
    ] },

    { type: "code", kicker: "Input Validation", heading: "Basic Server-Side Validation",
      code: 'app.post("/api/signup", (req, res) => {\n  const { email, age } = req.body;\n\n  if (typeof email !== "string" || !email.includes("@")) {\n    return res.status(400).json({ error: "A valid email is required." });\n  }\n\n  const numericAge = Number(age);\n  if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 120) {\n    return res.status(400).json({ error: "Age must be 13-120." });\n  }\n\n  res.status(201).json({ message: "Account created." });\n});',
      note: "Libraries like joi, zod, or express-validator define these rules once instead of writing manual if checks per field." },

    { type: "callout", kicker: "Input Validation", heading: "Client-Side Validation Is Convenience, Not Security", kind: "warning", h: 1.9,
      text: "React form validation gives instant feedback with zero network round trip — but it runs on the attacker's own computer, where they can disable or bypass it entirely. Always re-validate on the server too. Server-side validation is the real security boundary." },

    { type: "bullets", kicker: "Output Encoding", heading: "The Mirror Image of Input Validation", items: [
      "Transform data right before displaying/using it, so it can't be misread as code in that new context",
      "If a user's name is literally <script>alert('hi')</script> and you insert it into HTML unencoded, the browser runs it — this is Cross-Site Scripting (Lecture 31)",
      "React encodes {userName} in JSX automatically — the danger is deliberately bypassing that with dangerouslySetInnerHTML",
    ] },

    { type: "bullets", kicker: "Secrets Management", heading: "What Counts as a Secret", items: [
      "Any information that must stay private for your system to remain secure",
      "Database passwords, third-party API keys, JWT signing keys, cloud credentials — all secrets",
      "Once pushed to a public Git repo, a secret is permanently compromised — even if you delete it later, it's still in the history",
    ] },

    { type: "callout", kicker: "Secrets Management", heading: "Never Commit Secrets to Git", kind: "warning", h: 1.9,
      text: "One of the most common and damaging mistakes: committing a .env file or hard-coded API key, especially to a public GitHub repo. Automated bots scan public repos for exposed keys within minutes of a push. If one leaks, rotate it — generate a brand-new secret and revoke the old one." },

    { type: "code", kicker: "Secrets Management", heading: "The Standard Practice",
      code: '# .gitignore\nnode_modules/\n.env\n\n# .env.example  (safe to commit — no real secrets)\nDATABASE_URL=your-mongodb-connection-string-here\nJWT_SECRET=your-jwt-signing-secret-here\nSTRIPE_API_KEY=your-stripe-key-here',
      note: "Commit .env.example so teammates know what to set up. On your hosting platform (Lecture 32), set real values through its own environment variable settings — never by uploading a .env file." },

    { type: "closing", heading: "Lecture 30 in Six Points", items: [
      "The CIA triad — Confidentiality, Integrity, Availability — describes the three goals every security control protects.",
      "Least privilege: give every account, process, and piece of code only the permissions it strictly needs.",
      "Defence in depth: layer multiple independent controls so one failure doesn't mean total compromise.",
      "HTTPS/TLS encrypts traffic and lets the browser verify a server's identity via a CA-issued certificate.",
      "Authentication (\"who are you?\") and authorization (\"what are you allowed to do?\") are distinct — check both, every time.",
      "Validate input on the server, encode output on display, and never commit secrets to Git.",
    ] },
  ],
});
