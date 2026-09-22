const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-24";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 24: Response Generation using Templates",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-24-Response-Generation-with-Templates.pptx",
  slides: [
    { type: "title", lectureNo: 24, heading: "Response Generation\nUsing Templates",
      sub: "Building real HTML on the server by filling reusable views with data — EJS, loops, partials, and the XSS trap to avoid." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "SSR vs. client-side rendering — a quick recap",
      "What a template engine is, and EJS in action",
      "Passing data from an Express route into a view, and interpolating it",
      "Loops, conditionals, partials/includes, and layouts inside templates",
      "Output escaping (XSS prevention), form redisplay, and flash messages",
    ] },

    { type: "bullets", kicker: "Recap", heading: "SSR vs. Client-Side Rendering", items: [
      "Server-side rendering (SSR): the server builds the complete HTML page — including the data — and sends it ready to display",
      "Client-side rendering (CSR): the server sends a near-empty page + JavaScript; the browser builds the visible content after load",
      "CSR is how single-page apps built with React work — covered later in this course",
      "This lecture is entirely about the SSR side: Express + a template engine",
    ] },

    { type: "diagram", kicker: "Recap", heading: "SSR vs. CSR, Side by Side",
      nodes: [
        { x: 0.9, y: 2.25, w: 5.6, h: 0.45, text: "SERVER-SIDE RENDERING", fill: "2B2B7A", fontSize: 12 },
        { x: 0.9, y: 2.9, w: 5.6, h: 0.65, text: "Browser requests page", fill: "1E1E4C", fontSize: 11.5 },
        { x: 0.9, y: 3.75, w: 5.6, h: 0.65, text: "Server fetches data from database", fill: "1E1E4C", fontSize: 11.5 },
        { x: 0.9, y: 4.6, w: 5.6, h: 0.65, text: "Server fills template with data", fill: "1E1E4C", fontSize: 11.5 },
        { x: 0.9, y: 5.45, w: 5.6, h: 0.65, text: "Complete HTML sent to browser", fill: "3FA66B", fontSize: 11.5 },

        { x: 6.85, y: 2.25, w: 5.6, h: 0.45, text: "CLIENT-SIDE RENDERING", fill: "E67528", fontSize: 12 },
        { x: 6.85, y: 2.9, w: 5.6, h: 0.65, text: "Browser requests page", fill: "8A3A12", fontSize: 11.5 },
        { x: 6.85, y: 3.75, w: 5.6, h: 0.65, text: "Server sends near-empty HTML + JS bundle", fill: "8A3A12", fontSize: 11.5 },
        { x: 6.85, y: 4.6, w: 5.6, h: 0.65, text: "Browser runs JS, fetches data from API", fill: "8A3A12", fontSize: 11.5 },
        { x: 6.85, y: 5.45, w: 5.6, h: 0.65, text: "JS builds HTML in the browser", fill: "3FA66B", fontSize: 11.5 },
      ],
      edges: [
        { x1: 3.7, y1: 3.55, x2: 3.7, y2: 3.75 },
        { x1: 3.7, y1: 4.4, x2: 3.7, y2: 4.6 },
        { x1: 3.7, y1: 5.25, x2: 3.7, y2: 5.45 },
        { x1: 9.65, y1: 3.55, x2: 9.65, y2: 3.75 },
        { x1: 9.65, y1: 4.4, x2: 9.65, y2: 4.6 },
        { x1: 9.65, y1: 5.25, x2: 9.65, y2: 5.45 },
      ] },

    { type: "bullets", kicker: "Template Engines", heading: "What Is a Template Engine?", items: [
      "A library for writing HTML files with placeholders and logic (loops, conditionals) embedded inside them",
      "At request time, it combines your template file with real data and produces plain HTML — a template file is called a view",
      "EJS (Embedded JavaScript) — real JavaScript inside <% %> tags, right alongside HTML — our primary example",
      "Pug (indentation-based), Handlebars (\"logic-light\"), Django templates — same idea, different ecosystems",
    ] },

    { type: "code", kicker: "Setting Up EJS", heading: "Installing and Configuring EJS",
      code: 'npm install ejs\n\nconst express = require("express");\nconst app = express();\n\napp.set("view engine", "ejs"); // tells Express to use EJS\napp.set("views", "./views");   // folder where .ejs files live',
      note: "Express now looks for files ending in .ejs inside the views folder whenever you call res.render()." },

    { type: "code", kicker: "Passing Data", heading: "res.render(view, data)",
      code: 'app.get("/profile", (req, res) => {\n  res.render("profile", {\n    username: "Ayesha",\n    joinYear: 2023,\n  });\n});' },

    { type: "codeImageSide", kicker: "Interpolation", heading: "profile.ejs, Rendered",
      code: '<!-- views/profile.ejs -->\n<h1>Welcome,\n  <%= username %>!\n</h1>\n<p>\n  Member since\n  <%= joinYear %>.\n</p>',
      img: `${IMG}/profile-render.png` },

    { type: "callout", kicker: "Interpolation", heading: "<%= %> Escapes by Default", kind: "note", h: 1.7,
      text: "<%= expression %> is interpolation — it evaluates the JavaScript expression and inserts the result into the HTML, automatically escaping it (why that matters comes up shortly)." },

    { type: "code", kicker: "Loops & Conditionals", heading: "Data From the Route",
      code: 'app.get("/products", (req, res) => {\n  res.render("products", {\n    products: [\n      { name: "Notebook", price: 3.5, inStock: true },\n      { name: "Pen", price: 1.0, inStock: false },\n    ],\n  });\n});' },

    { type: "code", kicker: "Loops & Conditionals", heading: "<% %> Runs Raw JavaScript",
      code: '<% if (products.length === 0) { %>\n  <p>No products available.</p>\n<% } else { %>\n  <ul>\n    <% products.forEach(function(product) { %>\n      <li>\n        <%= product.name %> — $<%= product.price.toFixed(2) %>\n        <% if (product.inStock) { %>\n          <span class="in-stock">In Stock</span>\n        <% } else { %>\n          <span class="out-of-stock">Out of Stock</span>\n        <% } %>\n      </li>\n    <% }) %>\n  </ul>\n<% } %>' },

    { type: "codeImageSide", kicker: "Loops & Conditionals", heading: "products.ejs, Rendered",
      code: '<% products.forEach(p => { %>\n  <li>\n    <%= p.name %> —\n    $<%= p.price\n      .toFixed(2) %>\n    <% if (p.inStock) { %>\n      In Stock\n    <% } else { %>\n      Out of Stock\n    <% } %>\n  </li>\n<% }) %>',
      img: `${IMG}/products-render.png` },

    { type: "bullets", kicker: "Partials & Layouts", heading: "Partials / Includes", items: [
      "A small, reusable template fragment inserted into other templates — a header, nav bar, or footer",
      "Avoids repeating the same markup in every single template file as pages grow",
    ] },

    { type: "code", kicker: "Partials & Layouts", heading: "Defining and Including a Partial",
      code: '<!-- views/partials/header.ejs -->\n<header>\n  <h1>My Website</h1>\n  <nav><a href="/">Home</a> | <a href="/products">Products</a></nav>\n</header>\n\n<!-- views/products.ejs -->\n<%- include(\'partials/header\') %>\n<h1>Our Products</h1>\n<%- include(\'partials/footer\') %>' },

    { type: "callout", kicker: "Partials & Layouts", heading: "Why <%- %> Here, Not <%= %>", kind: "note", h: 1.9,
      text: "include() returns raw HTML, so we use <%- %> (the unescaped output tag) instead of <%= %> — otherwise the header's own HTML tags would show up as literal text like &lt;header&gt; instead of being rendered." },

    { type: "bullets", kicker: "Partials & Layouts", heading: "Layouts: A Shared Page Shell", items: [
      "A layout takes partials a step further: one \"shell\" template (<html>, <head>, header, footer already in place) wrapping each page's unique content",
      "EJS has no built-in layout support like some engines — achieve the same effect with includes, or the express-ejs-layouts package",
    ] },

    { type: "code", kicker: "Partials & Layouts", heading: "express-ejs-layouts",
      code: 'const expressLayouts = require("express-ejs-layouts");\napp.use(expressLayouts);\napp.set("layout", "layout"); // uses views/layout.ejs\n\n<!-- views/layout.ejs -->\n<body>\n  <%- include(\'partials/header\') %>\n  <%- body %>  <!-- each page\'s unique content injected here -->\n  <%- include(\'partials/footer\') %>\n</body>' },

    { type: "bullets", kicker: "XSS Prevention", heading: "Cross-Site Scripting (XSS)", items: [
      "An attack where an attacker gets their own JavaScript to run inside your page",
      "Usually via submitted text (a comment, a username) inserted directly into HTML without being cleaned up",
      "If a comment contains <script>stealCookies()</script> and your template inserts it unescaped, that script runs in every visitor's browser",
    ] },

    { type: "code", kicker: "XSS Prevention", heading: "Escaped vs. Unescaped Output",
      code: "<!-- comment.text is: <script>alert('hacked')</script> -->\n\n<p><%= comment.text %></p>\n<!-- Renders SAFELY as visible text -->\n\n<p><%- comment.text %></p>\n<!-- DANGEROUS: actually executes the script -->",
      note: "<%= %> converts <, >, &, \" into safe HTML entities (&lt;, &gt;, ...) so the browser displays them as text instead of running them." },

    { type: "callout", kicker: "XSS Prevention", heading: "Never Use <%- %> on User Data", kind: "warning", h: 2.0,
      text: "Only use the unescaped <%- %> tag for content you trust completely — your own partials, or HTML you've deliberately sanitized. Default to escaped output (<%= %>) and treat unescaped output as an exception that needs a specific reason." },

    { type: "code", kicker: "Form Redisplay", heading: "Redisplaying an Invalid Submission",
      code: 'app.post("/signup", (req, res) => {\n  const { username, email } = req.body;\n\n  if (!email) {\n    return res.render("signup", {\n      error: "Email is required.",\n      username, // send back what they already typed\n      email,\n    });\n  }\n  // ... otherwise, save the user and redirect ...\n});',
      note: "Better to show the form again with what the user already typed than to make them start over from a blank form." },

    { type: "codeImageSide", kicker: "Form Redisplay", heading: "signup.ejs, Rendered With an Error",
      code: '<% if (typeof error\n     !== \'undefined\') { %>\n  <p class="error">\n    <%= error %>\n  </p>\n<% } %>\n\n<input name="username"\n  value="<%= username %>">\n<input name="email"\n  value="<%= email %>">',
      img: `${IMG}/signup-render.png` },

    { type: "bullets", kicker: "Flash Messages", heading: "One-Time Messages After a Redirect", items: [
      "A flash message is a short message (\"Login successful\", \"Item deleted\") shown immediately after an action",
      "Typically right after a redirect, then automatically discarded so it doesn't reappear on refresh",
      "Relies on sessions to temporarily hold the message across the redirect",
    ] },

    { type: "code", kicker: "Flash Messages", heading: "Setting Up connect-flash",
      code: 'npm install connect-flash express-session\n\napp.use(session({ secret: "some-secret-key", resave: false, saveUninitialized: false }));\napp.use(flash());\n\n// Make flash messages available to every template automatically\napp.use((req, res, next) => {\n  res.locals.successMessage = req.flash("success");\n  res.locals.errorMessage = req.flash("error");\n  next();\n});' },

    { type: "code", kicker: "Flash Messages", heading: "Setting and Reading the Message",
      code: 'app.post("/items/:id/delete", (req, res) => {\n  // ... delete the item ...\n  req.flash("success", "Item deleted successfully.");\n  res.redirect("/items");\n});\n\n<!-- views/items.ejs -->\n<% if (successMessage.length > 0) { %>\n  <p class="flash-success"><%= successMessage[0] %></p>\n<% } %>',
      note: "The message is stored when req.flash() is called, read (and removed) on the very next render, then gone — refreshing /items again shows nothing." },

    { type: "closing", heading: "Lecture 24 in Six Points", items: [
      "SSR builds complete HTML on the server before sending it; client-side rendering sends a near-empty page and builds content with JavaScript in the browser.",
      "A template engine (EJS, Pug, Handlebars, Django templates) fills HTML views with real data at request time via res.render().",
      "EJS uses <%= %> for escaped interpolation, <% %> for control flow, and <%- %> for unescaped raw HTML output.",
      "Partials/includes avoid repeating shared markup; layouts wrap a shared page shell around each view's unique content.",
      "Escaping output by default is your main defense against XSS — never render untrusted, user-submitted data with the unescaped tag.",
      "Form redisplay shows a submitted form again with the user's input and an error; flash messages show a one-time message after a redirect, then discard it.",
    ] },
  ],
});
