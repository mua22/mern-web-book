const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-10";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 10: Responsive Design and Framework Fundamentals",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-10-Responsive-Design-and-Frameworks.pptx",
  slides: [
    { type: "title", lectureNo: 10, heading: "Responsive Design\nand Frameworks",
      sub: "Building one site that adapts to any screen — and the two major CSS frameworks that make it faster." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Mobile-first design, the viewport meta tag, and fluid units",
      "Media queries and breakpoints — every combination, plus responsive images",
      "Component-based (Bootstrap) vs. utility-first (Tailwind) frameworks",
      "Bootstrap's grid system, components, and utilities",
      "Tailwind's utility-class structure",
      "Extending either framework with your own custom classes",
    ] },

    { type: "bullets", kicker: "Mobile-First", heading: "Mobile-First Design", items: [
      "Write base CSS for small screens FIRST, then add styling for larger screens with media queries",
      "The opposite of \"desktop-first,\" where you design big and cram it onto a phone afterward",
      "Mobile traffic is the majority of web visits — adding complexity as space grows is easier than stripping it away",
    ] },

    { type: "code", kicker: "The Viewport", heading: "The Viewport Meta Tag",
      code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      note: "width=device-width uses the real device width; initial-scale=1.0 starts at 100% zoom." },

    { type: "callout", kicker: "The Viewport", heading: "Never Forget This Tag", kind: "warning", h: 1.7,
      text: "Without the viewport meta tag, none of your media queries will work correctly on a real phone — the browser will still pretend it has a much wider screen." },

    { type: "table", kicker: "Fluid Units", heading: "Units That Scale, Not Fixed Pixels",
      header: ["Unit", "Relative To"], colW: [2.2, 9.8], leftCol: 0,
      rows: [
        ["%", "The size of the parent element"],
        ["rem", "The root (<html>) element's font size"],
        ["em", "The current element's own font size"],
        ["vw / vh", "1% of the viewport's width / height"],
      ] },

    { type: "imagePair", kicker: "Fluid Units", heading: "The Same Page, Two Widths",
      left: { img: `${IMG}/fluid-units-wide.png`, label: "Wide" },
      right: { img: `${IMG}/fluid-units-narrow.png`, label: "Narrow" } },

    { type: "code", kicker: "Media Queries", heading: "A Mobile-First Breakpoint",
      code: '.container { display: flex; flex-direction: column; }\n\n@media (min-width: 768px) {\n  .container { flex-direction: row; }\n}' },

    { type: "imagePair", kicker: "Media Queries", heading: "Three Cards, Two Widths",
      left: { img: `${IMG}/media-query-wide.png`, label: "Wide (row)" },
      right: { img: `${IMG}/media-query-narrow.png`, label: "Narrow (column)" } },

    { type: "table", kicker: "Media Query Syntax", heading: "and, Comma, and not",
      header: ["Operator", "Meaning"], colW: [2.6, 9.4], leftCol: 0, rowH: 0.85,
      rows: [
        ["and", "Combines conditions — ALL must be true"],
        [", (comma)", "Works like OR — ANY one condition must be true"],
        ["not", "Inverts the entire media query (needs a media type)"],
        ["orientation / prefers-color-scheme / print", "Portrait vs. landscape / dark mode / printed page — same @media syntax"],
      ] },

    { type: "code", kicker: "Responsive Images", heading: "The One Rule That Matters",
      code: "img {\n  max-width: 100%;\n  height: auto;\n}",
      note: "max-width: 100% keeps an image from ever growing wider than its container; height: auto preserves its aspect ratio." },

    { type: "imagePair", kicker: "Responsive Images", heading: "The Same Image, Two Widths",
      left: { img: `${IMG}/responsive-image-wide.png`, label: "Wide" },
      right: { img: `${IMG}/responsive-image-narrow.png`, label: "Narrow" } },

    { type: "cards", kicker: "Frameworks", heading: "Component-Based vs. Utility-First", cards: [
      { heading: "Bootstrap (Component-Based)", accent: "2B2B7A", body: [
        "Ships pre-styled, ready-to-use components (.btn, .card, .navbar)",
        "Fast to get a decent-looking page up quickly",
        "Overriding built-in styles can fight the framework",
      ] },
      { heading: "Tailwind (Utility-First)", accent: "E67528", body: [
        "Ships hundreds of tiny, single-purpose utility classes (flex, p-4)",
        "Nothing looks \"designed\" until you style it yourself",
        "Takes longer at first — many class names to learn",
      ] },
    ] },

    { type: "code", kicker: "Bootstrap", heading: "The 12-Column Grid",
      code: '<div class="container">\n  <div class="row">\n    <div class="col-md-8">Main content</div>\n    <div class="col-md-4">Sidebar</div>\n  </div>\n</div>' },

    { type: "imagePair", kicker: "Bootstrap", heading: "The Grid, Two Widths",
      left: { img: `${IMG}/bootstrap-grid-wide.png`, label: "Wide (side by side)" },
      right: { img: `${IMG}/bootstrap-grid-narrow.png`, label: "Narrow (stacked)" } },

    { type: "image", kicker: "Bootstrap", heading: "Components, Rendered",
      intro: "A button, a card, and a navbar — three lines of HTML, zero custom CSS.",
      img: `${IMG}/bootstrap-components.png` },

    { type: "image", kicker: "Bootstrap", heading: "Utilities, Rendered",
      intro: 'd-flex justify-content-between p-3 — spacing and alignment classes, similar in spirit to Tailwind.',
      img: `${IMG}/bootstrap-utilities.png` },

    { type: "code", kicker: "Tailwind CSS", heading: "A Fully Styled Button",
      code: '<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold\n               px-4 py-2 rounded-lg shadow">\n  Save Changes\n</button>' },

    { type: "image", kicker: "Tailwind CSS", heading: "The Button, Rendered",
      img: `${IMG}/tailwind-button.png` },

    { type: "code", kicker: "Tailwind CSS", heading: "Responsive by Default",
      code: '<div class="flex flex-col md:flex-row">\n  <!-- stacked by default, a row from md breakpoint up -->\n</div>' },

    { type: "imagePair", kicker: "Tailwind CSS", heading: "flex-col md:flex-row, Two Widths",
      left: { img: `${IMG}/tailwind-flex-wide.png`, label: "Wide (row)" },
      right: { img: `${IMG}/tailwind-flex-narrow.png`, label: "Narrow (column)" } },

    { type: "imagePair", kicker: "Tailwind CSS", heading: "w-full lg:w-1/3, Two Widths",
      left: { img: `${IMG}/tailwind-width-wide.png`, label: "Wide (1/3)" },
      right: { img: `${IMG}/tailwind-width-narrow.png`, label: "Narrow (full)" } },

    { type: "code", kicker: "Custom Classes", heading: "Bootstrap + Your Own Class",
      code: '<button class="btn btn-primary my-cta-button">Get Started</button>\n\n.my-cta-button { text-transform: uppercase; letter-spacing: 1px; }' },

    { type: "image", kicker: "Custom Classes", heading: "Bootstrap + Custom, Rendered",
      img: `${IMG}/bootstrap-custom-class.png` },

    { type: "code", kicker: "Custom Classes", heading: "Tailwind + Your Own Class",
      code: '<span class="text-blue-600 font-bold brand-underline">New!</span>\n\n.brand-underline { text-decoration: underline wavy; text-underline-offset: 4px; }' },

    { type: "image", kicker: "Custom Classes", heading: "Tailwind + Custom, Rendered",
      img: `${IMG}/tailwind-custom-class.png` },

    { type: "closing", heading: "Lecture 10 in Six Points", items: [
      "Mobile-first: base styles for small screens, then add complexity with min-width media queries.",
      "The viewport meta tag is required for media queries to work correctly on real phones.",
      "Fluid units (%, rem, vw, vh) scale relative to something else, unlike fixed px.",
      "Media queries combine with and (all true), comma (any true), and not (inverts) — and test more than width.",
      "max-width: 100%; height: auto; keeps images from overflowing their container.",
      "Bootstrap gives finished components; Tailwind gives composable utilities — both expect your own custom CSS on top.",
    ] },
  ],
});
