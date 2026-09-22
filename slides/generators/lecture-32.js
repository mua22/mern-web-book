const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-32";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 32: Domain, DNS and Deployment",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-32-Domain-DNS-and-Deployment.pptx",
  slides: [
    { type: "title", lectureNo: 32, heading: "Domain, DNS\nand Deployment",
      sub: "The last step: taking your MERN app off your laptop and putting it on the Internet." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Domain names, registrars, and the main DNS record types",
      "How DNS resolution actually works, and what TTL means",
      "Hosting options: shared hosting, VPS, PaaS, and serverless",
      "Deploying a React frontend and Express backend, plus reverse proxies and monitoring",
    ] },

    { type: "bullets", kicker: "Domain Names", heading: "A Human-Readable Stand-In for an IP", items: [
      "A domain name (example.com) stands in for a numeric IP address (93.184.216.34) computers actually use",
      "Read right to left: .com is the top-level domain (TLD); example is the second-level domain you register",
      "www (or any prefix) is a subdomain — used to organize services, e.g. api.example.com, blog.example.com",
    ] },

    { type: "bullets", kicker: "Registrars", heading: "Buying a Domain", items: [
      "You register through a registrar — a company accredited to sell domains, e.g. Namecheap, GoDaddy, Google Domains",
      "Registrars reserve the name for you (usually one year at a time, renewable)",
      "They do NOT host your website's content — that's a separate job",
    ] },

    { type: "callout", kicker: "Registrars", heading: "Domains and Hosting Are Two Separate Purchases", kind: "note", h: 1.9,
      text: "A very common beginner confusion: buying a domain does not, by itself, put a website online. You still need a server somewhere to store and run your application, and you need to tell your domain where that server is — which is exactly what DNS does." },

    { type: "bullets", kicker: "DNS", heading: "The Internet's Phone Book", items: [
      "DNS (Domain Name System) translates human-readable domain names into IP addresses",
      "You look up a name, DNS gives you a number",
      "DNS information is organized into records, stored on nameservers, grouped into zones (one zone per domain)",
    ] },

    { type: "table", kicker: "DNS", heading: "The Record Types You'll Use Most",
      header: ["Record", "Purpose", "Example"], colW: [1.8, 6.0, 4.2], leftCol: 0, rowH: 0.78,
      rows: [
        ["A", "Maps a domain/subdomain to an IPv4 address", "example.com -> 93.184.216.34"],
        ["AAAA", "Maps a domain/subdomain to an IPv6 address", "example.com -> 2606:2800:..."],
        ["CNAME", "Maps a domain/subdomain to another domain name", "www.example.com -> example.com"],
        ["MX", "Which mail servers handle email, and priority", "example.com -> mail.example.com"],
        ["TXT", "Arbitrary text — ownership verification, SPF/DKIM", '"v=spf1 include:..."'],
      ] },

    { type: "callout", kicker: "DNS", heading: "CNAME Has a Root-Domain Limit", kind: "tip", h: 2.0,
      text: "Hosting platforms like Vercel/Netlify often ask you to point a subdomain at THEIR domain via CNAME, since their own IPs can change. But you generally can't put a CNAME on the bare root domain alongside records like MX — a historical DNS rule. Most platforms offer a workaround (\"ALIAS\"/\"ANAME\" records) for pointing a root domain at them." },

    { type: "flow", kicker: "DNS Resolution", heading: "What Happens When You Type a URL",
      steps: [
        { label: "Browser asks\nrecursive resolver" },
        { label: "Resolver asks\nroot nameserver" },
        { label: "Root points to\n.com TLD server" },
        { label: "TLD points to\nauthoritative server" },
        { label: "Authoritative returns\nthe A record" },
        { label: "Browser connects\nto that IP" },
      ],
      caption: "The recursive resolver (your ISP, or a public one like 8.8.8.8) does this legwork on your behalf. The authoritative nameserver — configured at your registrar — holds the actual, official records for your domain." },

    { type: "bullets", kicker: "TTL", heading: "Time to Live", items: [
      "Every DNS record has a TTL (in seconds) — how long resolvers may cache that answer before asking again",
      "A TTL of 3600 means \"valid for one hour; don't re-check more often than that\"",
    ] },

    { type: "code", kicker: "TTL", heading: "A Record With Its TTL",
      code: "example.com.    3600    IN    A    93.184.216.34" },

    { type: "table", kicker: "TTL", heading: "The Trade-Off",
      header: ["TTL", "Effect"], colW: [2.6, 9.4], leftCol: 0, rowH: 0.85,
      rows: [
        ["High (e.g. 24h)", "Less nameserver load, faster repeated lookups — but changes take longer to reach everyone"],
        ["Low (e.g. 5 min)", "Changes propagate fast — at the cost of more frequent lookups"],
      ] },

    { type: "callout", kicker: "TTL", heading: "Lower It Before You Move Hosts", kind: "tip", h: 1.7,
      text: "If you know you're about to change a DNS record — e.g. moving your site to a new host — lower the TTL a day or two in advance, so resolvers pick up the new value quickly instead of serving a stale answer for hours." },

    { type: "flow", kicker: "Hosting Options", heading: "From Least to Most Managed",
      steps: [
        { label: "Shared Hosting\nleast control,\nleast effort" },
        { label: "VPS\nfull control,\nfull responsibility" },
        { label: "PaaS\nmanaged,\ndeveloper-friendly" },
        { label: "Serverless\nno server\nmanagement" },
      ] },

    { type: "cards", kicker: "Hosting Options", heading: "Four Ways to Run Your App", cards: [
      { heading: "Shared Hosting", accent: "2B2B7A", body: [
        "Your site shares a server with many others",
        "Cheap, simple — often just FTP",
        "Poor fit for a Node.js + MongoDB app",
      ] },
      { heading: "VPS", accent: "2B2B7A", body: [
        "Your own isolated slice, root access",
        "DigitalOcean, Linode, AWS EC2",
        "You configure and secure everything",
      ] },
      { heading: "PaaS", accent: "E67528", body: [
        "Platform provisions servers for you",
        "Render, Railway, Heroku",
        "The sweet spot for student full-stack projects",
      ] },
      { heading: "Serverless", accent: "E67528", body: [
        "Code runs only per request, scales to zero",
        "AWS Lambda, Vercel/Netlify functions",
        "Pay per use; no long-lived DB connections",
      ] },
    ] },

    { type: "table", kicker: "Hosting Options", heading: "Comparing the Four",
      header: ["Option", "Control", "Setup Effort", "Good For"], colW: [2.4, 2.0, 2.6, 5.0], leftCol: 0, rowH: 0.7,
      rows: [
        ["Shared hosting", "Low", "Very low", "Simple static/PHP sites"],
        ["VPS", "Full", "High", "Custom server setups, learning ops"],
        ["PaaS", "Medium", "Low", "Most student/startup full-stack apps"],
        ["Serverless", "Low (by design)", "Low, different model", "Spiky, event-driven traffic"],
      ] },

    { type: "bullets", kicker: "Deployment", heading: "One Repo, Two Deploy Targets", items: [
      "A typical MERN project deploys its React frontend and Express backend SEPARATELY",
      "Each goes to a platform suited for it — a static-file host for the frontend, a PaaS for the backend",
      "Both platforms connect to the same GitHub repository and rebuild automatically",
    ] },

    { type: "diagram", kicker: "Deployment", heading: "From git push to Live",
      nodes: [
        { x: 0.7, y: 3.6, w: 1.9, h: 0.7, text: "Write code\nlocally", fill: "1E1E4C", fontSize: 11.5 },
        { x: 3.0, y: 3.6, w: 1.9, h: 0.7, text: "git push to\nGitHub", fill: "1E1E4C", fontSize: 11.5 },
        { x: 5.3, y: 2.5, w: 2.7, h: 0.75, text: "Frontend platform\nbuilds React app", fill: "2B2B7A", fontSize: 11 },
        { x: 5.3, y: 4.55, w: 2.7, h: 0.75, text: "Backend platform\nbuilds Express app", fill: "2B2B7A", fontSize: 11 },
        { x: 8.5, y: 2.5, w: 1.9, h: 0.75, text: "Frontend live\non a CDN", fill: "3FA66B", fontSize: 11 },
        { x: 8.5, y: 4.55, w: 1.9, h: 0.75, text: "Backend live,\nrunning server", fill: "3FA66B", fontSize: 11 },
      ],
      edges: [
        { x1: 2.6, y1: 3.95, x2: 3.0, y2: 3.95 },
        { x1: 4.9, y1: 3.8, x2: 5.3, y2: 2.9 },
        { x1: 4.9, y1: 4.1, x2: 5.3, y2: 4.9 },
        { x1: 8.0, y1: 2.87, x2: 8.5, y2: 2.87 },
        { x1: 8.0, y1: 4.92, x2: 8.5, y2: 4.92 },
        { x1: 10.4, y1: 2.87, x2: 10.4, y2: 4.55, label: "API calls (HTTPS)" },
      ],
      caption: "Every push to the connected branch triggers an automatic rebuild and redeploy on both platforms — continuous deployment." },

    { type: "code", kicker: "Build & Environment", heading: "Development vs. Production",
      code: "# In production, compile React into a small set of\n# static, optimized HTML/CSS/JS files\nnpm run build",
      note: "The dev server (npm start) is heavy and unminified, meant for a fast feedback loop while coding — not for real users." },

    { type: "code", kicker: "Build & Environment", heading: "Production Environment Variables",
      code: "# .env.example -- committed as documentation, not real secrets\nDATABASE_URL=your-production-mongodb-uri\nJWT_SECRET=your-jwt-secret\nNODE_ENV=production\nPORT=5000",
      note: "Real values go into your hosting platform's dashboard — the same .env-based approach from Lecture 30, but for production." },

    { type: "bullets", kicker: "Deploying the Frontend", heading: "e.g. Vercel or Netlify", numbered: true, items: [
      "Push your React project to a GitHub repository",
      "Connect that repository to Vercel/Netlify through their dashboard",
      "Configure the build command (npm run build) and output directory (build or dist)",
      "The platform builds and deploys, giving you a live URL immediately",
      "Optionally connect your own domain via the CNAME record it tells you to add",
    ] },

    { type: "bullets", kicker: "Deploying the Backend", heading: "e.g. Render", numbered: true, items: [
      "Push your Express project to GitHub",
      "Connect the repository to Render and create a new \"Web Service\"",
      "Configure the start command (node server.js) and environment variables in the dashboard",
      "Render builds and starts your server, with HTTPS already configured",
      "Update your deployed frontend to point its API requests at this live backend URL",
    ] },

    { type: "callout", kicker: "Deploying the Backend", heading: "Free Tiers Spin Down", kind: "warning", h: 1.9,
      text: "Free tiers on platforms like Render often \"spin down\" your backend after inactivity to save resources, then take a few seconds to \"wake up\" on the next request. Normal for a student project — paid tiers keep your service running continuously." },

    { type: "bullets", kicker: "Reverse Proxies", heading: "The Server in Front of Your Server", items: [
      "A reverse proxy sits in front of your actual application server, receiving requests first and forwarding them",
      "Most hosting platforms run one for you, even if you never interact with it directly",
      "On a VPS you'd configure one yourself, commonly with software like Nginx",
    ] },

    { type: "diagram", kicker: "Reverse Proxies", heading: "One Front Door, Many Backends",
      nodes: [
        { x: 1.0, y: 3.7, w: 2.4, h: 0.8, text: "Browser", fill: "1E1E4C", fontSize: 13 },
        { x: 4.6, y: 3.7, w: 3.0, h: 0.8, text: "Reverse Proxy\n(e.g. Nginx)", fill: "FF8A3D", fontSize: 12.5 },
        { x: 9.0, y: 2.6, w: 3.0, h: 0.8, text: "App Server\nInstance 1", fill: "2B2B7A", fontSize: 12 },
        { x: 9.0, y: 4.8, w: 3.0, h: 0.8, text: "App Server\nInstance 2", fill: "2B2B7A", fontSize: 12 },
      ],
      edges: [
        { x1: 3.4, y1: 4.1, x2: 4.6, y2: 4.1 },
        { x1: 7.6, y1: 3.9, x2: 9.0, y2: 3.0 },
        { x1: 7.6, y1: 4.3, x2: 9.0, y2: 5.2 },
      ],
      caption: "One proxy commonly handles three jobs at once: terminating SSL/TLS (one place manages the certificate), load balancing across app instances, and serving static files directly." },

    { type: "cards", kicker: "Monitoring", heading: "Knowing It's Actually Working", cards: [
      { heading: "Uptime Monitoring", accent: "2B2B7A", body: [
        "A service periodically pings your app",
        "Alerts you if it stops responding",
        "e.g. UptimeRobot, or built into many PaaS dashboards",
      ] },
      { heading: "Logs", accent: "2B2B7A", body: [
        "console.log and error output from your server",
        "See what happened around a problem",
        "Most platforms give a live logs dashboard",
      ] },
      { heading: "Error Tracking", accent: "E67528", body: [
        "Tools like Sentry capture unhandled exceptions",
        "Stack trace + which user/request triggered it",
        "Automatic, no need to reproduce manually",
      ] },
    ] },

    { type: "callout", kicker: "Monitoring", heading: "Check Your Logs Right After Deploying", kind: "tip", h: 1.8,
      text: "Even for a class project, check your hosting platform's logs dashboard right after deploying, and again the next day. It's the fastest way to catch a crash, a missing environment variable, or a database connection issue that isn't obvious from clicking around the live site." },

    { type: "closing", heading: "Congratulations — You've Reached the End of CSC336", items: [
      "A domain name is a human-readable stand-in for an IP address, purchased through a registrar — buying one doesn't host your app by itself.",
      "DNS translates names to IPs via A, AAAA, CNAME, MX, and TXT records; TTL controls how long each answer is cached along the way.",
      "Hosting ranges from shared hosting to VPS to PaaS (the sweet spot for most student MERN apps) to serverless.",
      "Deploying a MERN app means a build step for the React frontend and a continuously running Express server, each with production environment variables.",
      "A reverse proxy handles SSL termination, load balancing, and static files — most PaaS platforms run one for you automatically.",
      "You went from how the web works to building, securing, and deploying a full-stack MERN app — that foundation carries into any framework you use next. Advanced Web Technologies (CSC337) picks up from here.",
    ] },
  ],
});
