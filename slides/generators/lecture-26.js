const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-26";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 26: Introduction to React.js and Rendering Approaches",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-26-Introduction-to-React.pptx",
  slides: [
    { type: "title", lectureNo: 26, heading: "Introduction to React.js\nand Rendering Approaches",
      sub: "From imperative DOM-poking to describing what the page should look like — and letting React figure out the rest." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Why React exists: single-page applications, declarative UI, and components",
      "The Virtual DOM and how React's reconciliation process updates the real page",
      "Setting up a React project with Vite, and the folder structure",
      "JSX: embedding expressions, conditional rendering, and rendering lists with key",
      "A conceptual overview of rendering approaches: CSR, SSR, SSG, and hydration",
    ] },

    { type: "bullets", kicker: "Why React?", heading: "Multi-Page Sites vs. Single-Page Apps", items: [
      "Multi-page app (MPA): click a link, the browser throws away the page and requests a brand-new one — even the unchanged navbar re-renders",
      "Single-page app (SPA): the browser loads one HTML page + a JS bundle; JavaScript swaps content in and out without a full reload",
      "Only the data that changed travels over the network, and only the parts of the page that need to change update — navigation feels instant",
      "React is the most widely used SPA library, maintained by Meta and a large open-source community",
    ] },

    { type: "callout", kicker: "Why React?", heading: "React Is a Library, Not a Framework", kind: "note", h: 1.9,
      text: "React only handles the \"view\" layer — turning data into UI. Routing and global state management are added separately, unlike a full framework like Angular that bundles everything out of the box." },

    { type: "bullets", kicker: "Why React?", heading: "The Problem With Manual DOM Manipulation", items: [
      "A shopping cart: every time an item is added or removed you must remember to update the array, find/add-or-remove the <li>, recalculate the total, and update the total's text",
      "Every one of these is a manual, imperative instruction: \"go find this element, then change it this way\"",
      "As an app grows, keeping the DOM in sync with data by hand becomes error-prone — easy to forget a step",
    ] },

    { type: "codeImageSide", kicker: "Declarative UI", heading: "Describe the What, Not the How",
      code: 'function CartTotal({ items }) {\n  const total = items.reduce(\n    (sum, item) => sum + item.price, 0\n  );\n  return (\n    <p>Total: ${total.toFixed(2)}</p>\n  );\n}',
      img: `${IMG}/cart-total-render.png` },

    { type: "codeImageSide", kicker: "Components", heading: "A Component Is Just a Function",
      code: 'function Greeting() {\n  return (\n    <h1>\n      Hello, welcome\n      to the store!\n    </h1>\n  );\n}',
      img: `${IMG}/greeting-render.png` },

    { type: "bullets", kicker: "Components", heading: "Components Combine Like Building Blocks", items: [
      "Components are small, self-contained, reusable pieces of UI, each responsible for one part of the page",
      "A Navbar, ProductList, ProductCard, and Footer component can all be assembled inside a single App component",
      "Mirrors how you already think about HTML — a page made of sections — but each section is reusable, testable JavaScript",
      "Components, props, and composition are studied in depth in Lecture 27",
    ] },

    { type: "bullets", kicker: "The Virtual DOM", heading: "Why React Avoids Touching the Real DOM", items: [
      "Direct changes to the real DOM are relatively expensive — layout recalculation, repainting, and more",
      "The Virtual DOM (VDOM) is a lightweight, in-memory JavaScript object tree that mirrors your UI's structure",
      "When data changes, React builds a new VDOM tree, diffs it against the previous one, and computes the smallest set of real DOM changes needed",
      "Comparing plain JS objects in memory is much faster than repeatedly touching the real DOM",
    ] },

    { type: "diagram", kicker: "The Virtual DOM", heading: "Reconciliation, Step by Step",
      nodes: [
        { x: 4.6, y: 2.25, w: 4.1, h: 0.55, text: "State or props change", fill: "1E1E4C", fontSize: 12 },
        { x: 4.4, y: 3.0, w: 4.5, h: 0.55, text: "React builds a new Virtual DOM tree", fill: "2B2B7A", fontSize: 11.5 },
        { x: 4.55, y: 3.75, w: 4.2, h: 0.8, text: "Diff against previous\nVirtual DOM tree", shape: "diamond", fill: "FF8A3D", fontSize: 11.5 },
        { x: 0.9, y: 5.0, w: 3.6, h: 0.6, text: "Skip DOM update", fill: "5D5D72", fontSize: 12 },
        { x: 5.3, y: 5.0, w: 4.3, h: 0.6, text: "Compute minimal set of real DOM operations", fill: "2B2B7A", fontSize: 11 },
        { x: 5.6, y: 5.85, w: 3.8, h: 0.6, text: "Reconciliation: apply changes to the real DOM", fill: "2B2B7A", fontSize: 10.5 },
        { x: 5.9, y: 6.65, w: 3.2, h: 0.55, text: "Browser repaints changed parts only", fill: "3FA66B", fontSize: 11 },
      ],
      edges: [
        { x1: 6.65, y1: 2.8, x2: 6.65, y2: 3.0 },
        { x1: 6.65, y1: 3.55, x2: 6.65, y2: 3.75 },
        { x1: 5.3, y1: 4.3, x2: 2.7, y2: 5.0, label: "No differences" },
        { x1: 7.3, y1: 4.55, x2: 7.4, y2: 5.0, label: "Differences found" },
        { x1: 7.45, y1: 5.6, x2: 7.5, y2: 5.85 },
        { x1: 7.5, y1: 6.45, x2: 7.5, y2: 6.65 },
      ] },

    { type: "callout", kicker: "The Virtual DOM", heading: "You Rarely Think About This Directly", kind: "tip", h: 1.7,
      text: "As a React developer, you almost never interact with the Virtual DOM yourself. You write components that describe the UI for the current data, and reconciliation handles the rest." },

    { type: "bullets", kicker: "Setting Up Vite", heading: "Vite: The Modern Build Tool", items: [
      "A build tool takes your JSX and modern JavaScript and bundles it into files browsers can run, plus a local dev server with fast reloading",
      "Vite (\"veet\") is the modern standard — fast because it uses native ES modules during development instead of bundling the whole app on every change",
      "Create React App (CRA) was the old official way to start a project — no longer actively maintained, noticeably slower than Vite",
    ] },

    { type: "code", kicker: "Setting Up Vite", heading: "Creating a New Project",
      code: 'npm create vite@latest my-react-app -- --template react\ncd my-react-app\nnpm install\nnpm run dev',
      note: "Starts a local dev server (usually http://localhost:5173) with hot module replacement (HMR) — saving a file updates the browser instantly, without a full page reload." },

    { type: "code", kicker: "Setting Up Vite", heading: "A Freshly Created Project's Folder Structure",
      code: 'my-react-app/\n├── index.html          # the single HTML page the app is injected into\n├── package.json         # project metadata and dependencies\n├── vite.config.js       # Vite\'s configuration file\n├── public/               # static assets copied as-is\n└── src/\n    ├── main.jsx          # entry point: mounts <App /> into index.html\n    ├── App.jsx            # the root component\n    ├── App.css\n    └── index.css' },

    { type: "code", kicker: "Setting Up Vite", heading: "main.jsx: Mounting the App",
      code: 'import { StrictMode } from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\n\ncreateRoot(document.getElementById("root")).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);',
      note: "index.html contains one empty container, <div id=\"root\">. Everything your users see is ultimately rendered inside that single div — the essence of a single-page application." },

    { type: "bullets", kicker: "JSX", heading: "What Is JSX?", items: [
      "JSX (JavaScript XML): a syntax extension letting you write HTML-like markup directly inside JavaScript",
      "Browsers cannot run JSX directly — Vite transforms it into React.createElement(...) calls before the code reaches the browser",
      "You write JSX because it reads much closer to the HTML you already know, while still being plain JavaScript underneath",
    ] },

    { type: "code", kicker: "JSX", heading: "What JSX Compiles To",
      code: 'const element = <h1>Hello, world!</h1>;\n\n// Vite/Babel transforms the line above into approximately:\nconst element2 = React.createElement("h1", null, "Hello, world!");' },

    { type: "codeImageSide", kicker: "JSX", heading: "Embedding Expressions With { }",
      code: 'function UserGreeting({ name }) {\n  const hour = new Date().getHours();\n  const timeOfDay = hour < 12\n    ? "morning" : "afternoon";\n  return (\n    <p>\n      Good {timeOfDay},\n      {name.toUpperCase()}!\n    </p>\n  );\n}',
      img: `${IMG}/user-greeting-render.png` },

    { type: "callout", kicker: "JSX", heading: "JSX Rules to Remember", kind: "warning", h: 2.1,
      text: "A component must return a single root element (or a Fragment). Use className instead of class. Every tag must be closed, including self-closing tags like <img />. Curly braces { } can only hold expressions, not statements like if or for." },

    { type: "code", kicker: "Conditional Rendering", heading: "Expressions That Evaluate to JSX",
      code: 'function LoginStatus({ isLoggedIn }) {\n  if (isLoggedIn) return <p>Welcome back!</p>;\n  return <p>Please log in.</p>;\n}\n\nfunction Notification({ count }) {\n  return (\n    <div>\n      {count > 0 && <span className="badge">{count} new</span>}\n      {count === 0 ? <span>No notifications</span> : null}\n    </div>\n  );\n}',
      note: "count > 0 && <span>...</span> renders the span only when truthy, otherwise nothing. The ternary chooses between two different pieces of UI." },

    { type: "imagePair", kicker: "Conditional Rendering", heading: "Notification, Two States",
      left: { img: `${IMG}/notification-badge-render.png`, label: "count = 3" },
      right: { img: `${IMG}/notification-none-render.png`, label: "count = 0" } },

    { type: "codeImageSide", kicker: "Rendering Lists", heading: ".map() and the key Prop",
      code: 'function ProductList({ products }) {\n  return (\n    <ul>\n      {products.map((p) => (\n        <li key={p.id}>\n          {p.name} — ${p.price}\n        </li>\n      ))}\n    </ul>\n  );\n}',
      img: `${IMG}/product-list-render.png` },

    { type: "callout", kicker: "Rendering Lists", heading: "Don't Use the Array Index as a Key", kind: "warning", h: 2.0,
      text: "It's tempting to write key={index} — fine for static lists that never reorder. But if the list CAN change, using the index can mix up which DOM element belongs to which data (subtle bugs like inputs showing the wrong value). Prefer a stable, unique identifier from your data, such as a database id." },

    { type: "table", kicker: "Rendering Approaches", heading: "CSR, SSR, SSG, and Hydration",
      header: ["Approach", "When HTML Is Generated", "Typical Use Case"], colW: [2.6, 4.4, 5.0], rowH: 0.72,
      rows: [
        ["CSR", "In the browser, after JS downloads and runs", "Dashboards, apps behind a login"],
        ["SSR", "On the server, for each request", "Fast first load, SEO-friendly content"],
        ["SSG", "At build time, before deployment", "Blogs, documentation, marketing pages"],
        ["Hydration", "A step after SSR/SSG delivers HTML", "Making pre-rendered HTML interactive"],
      ] },

    { type: "bullets", kicker: "Rendering Approaches", heading: "CSR, SSR, and SSG in Plain Terms", items: [
      "CSR: what a plain Vite + React app does by default — first paint can be slow, but navigation is fast once loaded",
      "SSR: runs React components on the server (Node.js) per request, producing HTML the browser can show immediately",
      "SSG: produces full HTML once, at build time — served instantly from a CDN, no per-visitor server computation",
    ] },

    { type: "flow", kicker: "Hydration", heading: "SSR + Hydration, in Sequence",
      steps: [
        { label: "Browser\nrequests page" },
        { label: "Server renders\nReact to HTML" },
        { label: "HTML sent —\nvisible immediately" },
        { label: "Browser downloads\nJS bundle" },
        { label: "React hydrates:\nattaches handlers" },
      ],
      caption: "Hydration connects SSR/SSG HTML to React on the client: the HTML appears instantly, but has no event listeners until React \"wakes it up\" by attaching them, without re-creating any DOM nodes." },

    { type: "callout", kicker: "Rendering Approaches", heading: "This Course Focuses on CSR", kind: "note", h: 1.9,
      text: "In this course you will build a client-side-rendered SPA with Vite, talking to the Express REST API from Lecture 25. SSR, SSG, and frameworks like Next.js are covered in depth in the Advanced Web Technologies course." },

    { type: "closing", heading: "Lecture 26 in Six Points", items: [
      "React builds single-page applications using a declarative style: describe what the UI should look like, instead of manually updating the DOM.",
      "UIs are built from components — reusable functions that return JSX.",
      "The Virtual DOM is an in-memory copy of the UI tree; React diffs it against the previous version and applies only minimal changes — reconciliation.",
      "Vite is the modern tool for creating and running React projects, replacing the older Create React App.",
      "JSX lets you write HTML-like syntax in JavaScript; use { } for expressions, className instead of class, and a stable, unique key for list items.",
      "CSR, SSR, and SSG are different strategies for turning components into HTML; hydration makes server-delivered HTML interactive in the browser.",
    ] },
  ],
});
