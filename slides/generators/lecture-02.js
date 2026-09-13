const { buildDeck } = require("./deckBuilder");

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 2: Tiered Web Architecture",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-02-Tiered-Web-Architecture.pptx",
  slides: [
    { type: "title", lectureNo: 2, heading: "Tiered Web\nArchitecture",
      sub: "How to organize an application's code and computers — from one machine to many." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Distinguish between tiers (physical deployment) and layers (logical code organization)",
      "Learn the common layers inside a typical application, and how they combine with tiers",
      "Understand one-tier (standalone) architecture and when it's used",
      "Understand two-tier (client-server) architecture, its advantages and limitations",
      "Understand three-tier and N-tier architecture",
      "Learn how to choose an architecture based on scalability, maintainability, and cost",
    ] },

    { type: "cards", kicker: "Foundations", heading: "Tiers vs. Layers: Two Different Ideas",
      intro: "Both aim at separation of concerns — but tiers separate physically, layers separate logically.",
      cards: [
        { heading: "Tier", accent: "2B2B7A", body: [
          "A physical (deployment) boundary",
          "Describes WHERE a piece of the app runs — which machine, process, or container",
          "Two pieces running on different computers are in different tiers",
        ] },
        { heading: "Layer", accent: "E67528", body: [
          "A logical boundary inside your code",
          "Describes HOW responsibilities are organized within a program",
          "Layers can all live on the very same machine, in the very same process",
        ] },
      ] },

    { type: "flow", kicker: "Tiers", heading: "Tiers = Physical Deployment", steps: [
      { label: "Machine 1" }, { label: "Machine 2" },
    ], caption: "Two pieces of an app communicating over a network are in two different tiers, no matter how similar their code looks." },

    { type: "layers", kicker: "Layers", heading: "Layers = Logical Code Organization", layers: [
      { label: "Presentation Layer", body: "Shows information, collects input", color: "2B2B7A" },
      { label: "Business Logic Layer", body: "Applies the rules of the application", color: "3A3A78" },
      { label: "Data Access Layer", body: "Talks to the database", color: "E67528" },
    ] },

    { type: "callout", kicker: "Foundations", heading: "A Layered App Can Still Be One Tier", kind: "note", h: 1.8,
      text: "You could write a program with clean layers — a data layer, a business-logic layer, a presentation layer — and still run the entire thing on a single laptop as one process. That is one tier (everything deployed together) but multiple layers (well-organized code). Tiers and layers are independent design decisions." },

    { type: "bullets", kicker: "Simplest Case", heading: "One-Tier (Standalone) Architecture", numbered: false, items: [
      "The entire application — UI, business logic, and data storage — runs on a single machine, in a single process",
      "No network communication between tiers, because there is only one tier",
      "Example: a desktop calculator, a local script, or a static HTML file opened via file:///",
    ] },

    { type: "code", kicker: "Simplest Case", heading: "One-Tier, Visualized",
      code: "[ Your Computer ]\n   \u251c\u2500\u2500 User Interface\n   \u251c\u2500\u2500 Application Logic\n   \u2514\u2500\u2500 Data (local file / in-memory)",
      note: "One-tier applications are the easiest to build and deploy — no network, no server to configure. But they cannot be shared over the Internet as-is; they only work for a single user on a single machine." },

    { type: "flow", kicker: "Splitting the App", heading: "Two-Tier (Client\u2013Server) Architecture", steps: [
      { label: "Client (UI)" }, { label: "Server (Logic + Data)" },
    ], caption: "The client and server communicate over a network — the same client-server model from Lecture 1, now viewed as an architecture pattern." },

    { type: "cards", kicker: "Trade-offs", heading: "Two-Tier: Advantages and Limitations", cards: [
      { heading: "Advantages", accent: "2B2B7A", body: [
        "Simple to build and reason about — only two moving parts",
        "Centralized data — all clients see the same up-to-date data",
        "Lower initial cost — fewer servers to set up and pay for",
      ] },
      { heading: "Limitations", accent: "E67528", body: [
        "Scalability bottleneck — one server handles UI, logic, and data all at once",
        "Tight coupling between business logic and data access",
        "Single point of failure — if the server goes down, so does the app",
      ] },
    ] },

    { type: "flow", kicker: "Scaling Up", heading: "Three-Tier Architecture", steps: [
      { label: "Presentation Tier\n(Browser / React)" }, { label: "Application Tier\n(API Server)" }, { label: "Data Tier\n(Database)" },
    ], caption: "This is exactly the shape of the MERN stack you'll build later: React (presentation), Express/Node.js (application), MongoDB (data) — each capable of running on its own machine." },

    { type: "bullets", kicker: "Generalizing", heading: "N-Tier: As Many Tiers as You Need", numbered: false,
      intro: "N-tier generalizes three-tier: split into any number of tiers when it's useful.",
      items: [
        "A caching tier (e.g., Redis) to speed up repeated requests",
        "A load balancer tier in front of multiple application servers",
        "A separate authentication tier dedicated to verifying user identity",
      ] },

    { type: "cards", kicker: "Trade-offs", heading: "Three-Tier / N-Tier: Advantages and Limitations", cards: [
      { heading: "Advantages", accent: "2B2B7A", body: [
        "Independent scaling — add app servers without touching the database",
        "Each tier can be developed and deployed by different teams",
        "Reusability — one API tier can serve web, mobile, and third parties",
        "Better fault isolation",
      ] },
      { heading: "Limitations", accent: "E67528", body: [
        "More complexity — more configuration, more network calls",
        "Higher cost — more servers or cloud services to pay for",
        "Network latency between tiers, slower than in-process calls",
      ] },
    ] },

    { type: "bullets", kicker: "Inside One Tier", heading: "The Three Common Layers", items: [
      "Presentation Layer — shows information and captures input; no business rules here",
      "Business Logic Layer — the actual rules: validation, calculations, decisions",
      "Data Access Layer — talks to the database; knows nothing about business rules or UI",
    ] },

    { type: "code", kicker: "Inside One Tier", heading: "A Request Flowing Through the Layers",
      code: "project/\n\u251c\u2500\u2500 routes/       <- Presentation: reads the request, sends response\n\u251c\u2500\u2500 services/     <- Business logic: validation, calculations\n\u251c\u2500\u2500 models/       <- Data access: talks to the database\n\u2514\u2500\u2500 app.js",
      note: "A request flows down through the layers, and the response flows back up — each layer only ever talks to its direct neighbor, never skipping ahead. This is exactly the structure you'll build starting in Unit 5." },

    { type: "table", kicker: "Decision Time", heading: "Choosing an Architecture",
      header: ["Factor", "Question to Ask"],
      colW: [3.2, 8.75], leftCol: 0, rowH: 1.0,
      rows: [
        ["Scalability", "Will the number of users grow? Do parts need to grow at different rates?"],
        ["Maintainability", "Will multiple teams work on this? Update one part without breaking another?"],
        ["Cost", "What's the hosting budget? Can you afford the added operational complexity?"],
      ],
      note: "One-tier for personal tools and prototypes. Two-tier for small, stable apps. Three-tier/N-tier for apps expected to grow or be maintained by a team long-term." },

    { type: "callout", kicker: "A Word of Caution", heading: "More Tiers Is Not Automatically Better", kind: "warning", h: 1.8,
      text: "A three-tier setup for a small class project adds deployment overhead (multiple servers, network configuration) that isn't justified if the project will never need to scale. Match the architecture to the actual requirements, not to what sounds most impressive." },

    { type: "closing", heading: "Lecture 2 in Six Points", items: [
      "Tiers are physical/deployment boundaries; layers are logical boundaries in code — both aim at separation of concerns, independently.",
      "One-tier runs everything on one machine; two-tier splits client from server but has a single point of failure.",
      "Three-tier separates presentation, application, and data — enabling independent scaling at the cost of complexity.",
      "N-tier generalizes further, adding tiers like caching or load balancing as needed.",
      "Most apps organize code into three layers: presentation, business logic, and data access — each talks only to its neighbor.",
      "Choosing an architecture is a trade-off between scalability, maintainability, and cost.",
    ] },
  ],
});
