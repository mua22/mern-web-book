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
      "Bootstrap's grid system in depth: auto-layout, nesting, offsets, ordering",
      "Tailwind's utility classes, config file, and dark mode",
      "Extending either framework with your own custom classes",
      "CSS preprocessors: Sass, SCSS, and LESS — and customizing Bootstrap with Sass",
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

    { type: "code", kicker: "Fluid Units", heading: "Fluid Units in Practice",
      code: '.hero {\n  width: 100vw;   /* always fills the full screen width */\n  height: 60vh;   /* always 60% of the visible screen height */\n}\n.card { width: 90%; } /* always 90% of its parent, whatever that is */' },

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

    { type: "table", kicker: "Bootstrap Grid", heading: "Grid Modifier Classes",
      header: ["Class pattern", "Effect"], colW: [3.6, 8.4], leftCol: 0, rowH: 0.62,
      rows: [
        [".col (no number)", "Auto-layout: shares available width equally"],
        [".col-{n}", "Exactly n of 12 columns, at all screen sizes"],
        [".col-{bp}-{n}", "n columns from that breakpoint up (mobile-first)"],
        [".offset-{bp}-{n}", "Pushes the column right by n empty columns"],
        [".order-{n}", "Visual display order (0-5), independent of HTML order"],
        [".row-cols-{n}", "Shorthand: every child column becomes 12/n wide"],
        [".g-{n} / .gx-{n} / .gy-{n}", "Gutter size between columns — all / x / y"],
      ],
      note: "Every one of these is a thin wrapper around the Flexbox properties from Lecture 9 — .row is display:flex, .col is a flex item." },

    { type: "codeImage", kicker: "Bootstrap Grid", heading: "Auto-Layout Columns and Nesting",
      code: '<div class="row">\n  <div class="col">col</div>\n  <div class="col">col</div>\n  <div class="col">col</div>\n</div>\n\n<div class="row">\n  <div class="col-8">\n    col-8\n    <div class="row">\n      <div class="col-6">nested col-6</div>\n      <div class="col-6">nested col-6</div>\n    </div>\n  </div>\n  <div class="col-4">col-4</div>\n</div>',
      img: `${IMG}/grid-autolayout-nesting.png` },

    { type: "codeImage", kicker: "Bootstrap Grid", heading: "Offsetting and Reordering Columns",
      intro: "offset-md-4 centers a 4-wide column; order-* rearranges visual order independent of HTML order.",
      code: '<div class="col-4 offset-md-4">col-4 offset-md-4</div>\n\n<div class="order-3">First in HTML — order-3</div>\n<div class="order-1">Second in HTML — order-1</div>\n<div class="order-2">Third in HTML — order-2</div>',
      img: `${IMG}/grid-offset-order.png` },

    { type: "codeImage", kicker: "Bootstrap", heading: "Components, Rendered",
      intro: "Three lines of HTML, zero custom CSS.",
      code: '<button class="btn btn-primary">Save Changes</button>\n\n<div class="card"><div class="card-body">\n  <h5 class="card-title">Card Title</h5>\n</div></div>\n\n<nav class="navbar navbar-expand-lg navbar-light bg-light">...</nav>',
      img: `${IMG}/bootstrap-components.png` },

    { type: "codeImage", kicker: "Bootstrap", heading: "Utilities, Rendered",
      code: '<div class="d-flex justify-content-between p-3">\n  <!-- d-flex: display:flex; justify-content-between: space-between; p-3: padding -->\n</div>',
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

    { type: "code", kicker: "Tailwind CSS", heading: "Responsive Width",
      code: '<div class="w-full lg:w-1/3">\n  <!-- full width by default, one-third width from the "lg" breakpoint up -->\n</div>' },

    { type: "imagePair", kicker: "Tailwind CSS", heading: "w-full lg:w-1/3, Two Widths",
      left: { img: `${IMG}/tailwind-width-wide.png`, label: "Wide (1/3)" },
      right: { img: `${IMG}/tailwind-width-narrow.png`, label: "Narrow (full)" } },

    { type: "table", kicker: "Tailwind CSS", heading: "More Utility Categories",
      header: ["Category", "Example classes"], colW: [2.6, 9.4], leftCol: 0, rowH: 0.62,
      rows: [
        ["Flexbox", "flex, justify-center, items-center, gap-4"],
        ["Grid", "grid, grid-cols-3, col-span-2"],
        ["Sizing", "w-1/2, h-screen, max-w-md"],
        ["Borders", "border, border-2, rounded-full"],
        ["Typography", "text-lg, font-bold, truncate"],
        ["State variants", "hover:, focus:, active:, disabled: (prefix any utility)"],
      ],
      note: "The spacing/color scale is numeric and consistent — p-4 = 1rem, blue-100 (near-white) through blue-900 (near-black)." },

    { type: "code", kicker: "Tailwind CSS", heading: "Configuring Tailwind: theme.extend",
      code: "module.exports = {\n  theme: {\n    extend: {\n      colors: { brand: '#ff6b35' },  // usable as bg-brand, text-brand...\n    },\n  },\n};" },

    { type: "codeImage", kicker: "Tailwind CSS", heading: "A Custom Color, Rendered",
      intro: "theme.extend adds to Tailwind's defaults, so bg-brand works with every state-variant prefix, just like a built-in color.",
      code: '<button class="bg-brand hover:bg-orange-700 text-white font-semibold\n               px-4 py-2 rounded-lg">\n  Save Changes\n</button>',
      img: `${IMG}/tailwind-custom-color.png` },

    { type: "codeImage", kicker: "Tailwind CSS", heading: "Dark Mode",
      intro: "darkMode: 'class' in the config activates dark: utilities for any element inside a .dark ancestor.",
      code: '<div class="bg-white dark:bg-gray-800 text-black dark:text-white">\n  Card content\n</div>',
      img: `${IMG}/tailwind-dark-mode.png` },

    { type: "code", kicker: "Tailwind CSS", heading: "The @apply Directive",
      code: '.btn-primary {\n  @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold\n         px-4 py-2 rounded-lg shadow;\n}\n\n<button class="btn-primary">Save Changes</button>',
      note: "Produces the exact same button as writing all six utility classes by hand — @apply just names a repeated combination." },

    { type: "code", kicker: "Custom Classes", heading: "Bootstrap + Your Own Class",
      code: '<button class="btn btn-primary my-cta-button">Get Started</button>\n\n.my-cta-button { text-transform: uppercase; letter-spacing: 1px; }' },

    { type: "image", kicker: "Custom Classes", heading: "Bootstrap + Custom, Rendered",
      img: `${IMG}/bootstrap-custom-class.png` },

    { type: "code", kicker: "Custom Classes", heading: "Tailwind + Your Own Class",
      code: '<span class="text-blue-600 font-bold brand-underline">New!</span>\n\n.brand-underline { text-decoration: underline wavy; text-underline-offset: 4px; }' },

    { type: "image", kicker: "Custom Classes", heading: "Tailwind + Custom, Rendered",
      img: `${IMG}/tailwind-custom-class.png` },

    { type: "bullets", kicker: "CSS Preprocessors", heading: "What Is a CSS Preprocessor?", numbered: false, items: [
      "A separate language that adds variables, nesting, and mixins on top of CSS, then COMPILES to plain CSS the browser reads",
      "Sass has two syntaxes: the indented .sass, and SCSS (.scss) — CSS-compatible braces/semicolons, by far the more common choice, including in Bootstrap's own source",
      "LESS solves the same problems with a different syntax (@var instead of $var) — used by Bootstrap 3, before it switched to Sass",
    ] },

    { type: "table", kicker: "CSS Preprocessors", heading: "Sass Variables vs. CSS Custom Properties",
      header: ["", "Sass ($name)", "CSS custom property (--name)"], colW: [3.4, 4.4, 4.6], leftCol: 0, rowH: 0.85,
      rows: [
        ["Resolved", "At compile time — a fixed value", "At runtime, in the browser"],
        ["Changes after load?", "No", "Yes — JS or media queries can update it"],
        ["Needs a build step?", "Yes — must compile the .scss", "No — works in a plain <style> tag"],
      ] },

    { type: "codeImage", kicker: "Sass Fundamentals", heading: "Variables, Nesting, and Mixins",
      code: '$primary-color: #6c5ce7;\n\n.card {\n  border: 1px solid $primary-color;\n  .title { color: $primary-color; }\n  &:hover { box-shadow: 0 4px 10px rgba(0,0,0,0.2); }\n}\n\n@mixin flex-center { display: flex; justify-content: center; align-items: center; }\n.banner { @include flex-center; background: $primary-color; }',
      img: `${IMG}/sass-fundamentals-demo.png` },

    { type: "code", kicker: "Sass Fundamentals", heading: "Partials and @use",
      code: '// _variables.scss\n$primary-color: #6c5ce7;\n\n// main.scss\n@use \'variables\' as v;\n.card { border: 1px solid v.$primary-color; }',
      note: "A filename starting with _ is a partial — Sass pulls it into whatever file imports it, instead of compiling it separately." },

    { type: "table", kicker: "LESS", heading: "Sass (SCSS) vs. LESS",
      header: ["Feature", "Sass (SCSS)", "LESS"], colW: [3.0, 4.6, 4.8], leftCol: 0, rowH: 0.7,
      rows: [
        ["Variable syntax", "$name", "@name"],
        ["Mixin definition", "@mixin name { ... }", ".name() { ... }"],
        ["Mixin use", "@include name;", ".name();"],
        ["Used by", "Bootstrap 4 and 5, most new projects", "Bootstrap 3, older codebases"],
      ] },

    { type: "code", kicker: "Customizing Bootstrap", heading: "Override Variables Before Importing",
      code: '// custom.scss — override BEFORE importing Bootstrap\'s source\n$primary: #ff6b35;\n$border-radius: 1rem;\n$grid-gutter-width: 3rem;\n\n@import "bootstrap/scss/bootstrap";\n\n// sass custom.scss custom.css',
      note: "Every component reading these variables picks up the new values everywhere, automatically — no HTML changes at all." },

    { type: "imagePair", kicker: "Customizing Bootstrap", heading: "Stock vs. Sass-Customized Bootstrap",
      left: { img: `${IMG}/bootstrap-sass-before.png`, label: "Stock Bootstrap" },
      right: { img: `${IMG}/bootstrap-sass-after.png`, label: "Sass-Customized" } },

    { type: "closing", heading: "Lecture 10 in Eight Points", items: [
      "Mobile-first: base styles for small screens, then add complexity with min-width media queries.",
      "The viewport meta tag is required for media queries to work correctly on real phones.",
      "Fluid units (%, rem, vw, vh) scale relative to something else, unlike fixed px.",
      "Bootstrap's grid goes beyond col-md-*: auto-layout columns, nesting, offset-*, and order-* cover real layouts.",
      "Bootstrap gives finished components; Tailwind gives composable utilities, configured via tailwind.config.js and dark:.",
      "Sass/SCSS and LESS compile to plain CSS, adding variables (compile-time, unlike runtime CSS custom properties), nesting, and mixins.",
      "Bootstrap's own source is Sass — overriding its variables before importing it recompiles the whole framework around your values.",
      "Both frameworks expect your own custom CSS on top — they solve the common 80%, not the last 20% that makes a site unique.",
    ] },
  ],
});
