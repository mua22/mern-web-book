const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-04";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 4: Semantic HTML and HTML Forms",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-04-Semantic-HTML-and-Forms.pptx",
  slides: [
    { type: "title", lectureNo: 4, heading: "Semantic HTML\nand HTML Forms",
      sub: "Organizing a page so it means something — to humans, browsers, and search engines — and collecting user input." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Block-level vs. inline elements, and the generic <div>/<span>",
      "HTML5 semantic elements, and why they matter for accessibility and SEO",
      "Build forms: <form>, action/method — including a real Google search GET form",
      "<input> types, <select>, <textarea>, <button>",
      "Upload files with multipart/form-data",
      "Client-side validation with required, pattern, min, max",
    ] },

    { type: "codeImage", kicker: "Layout Basics", heading: "Block-Level vs. Inline (Recap)",
      intro: "Block elements each claim their own line; inline elements flow within the surrounding text.",
      code: '<p>This is a block-level paragraph.</p>\n<p>This is another block — starts on its own line.</p>\n\n<p>This sentence has an <strong>inline bold word</strong> and an\n<a href="#">inline link</a> in the flow of the text.</p>',
      img: `${IMG}/block-inline.png` },

    { type: "codeImage", kicker: "Generic Containers", heading: "The Generic <div> and <span>",
      intro: "<div> is a generic BLOCK container; <span> is a generic INLINE container — neither means anything on its own.",
      code: '<div class="card">\n    <p>Some content wrapped in a div so it can be styled as a "card".</p>\n</div>\n\n<p>The price is <span class="highlight-price">$25</span> today only.</p>',
      img: `${IMG}/div-span.png` },

    { type: "cards", kicker: "Semantic HTML", heading: "Meaningless Divs vs. Semantic Tags", cards: [
      { heading: "Without Semantics (Old Style)", accent: "2B2B7A", body: [
        "<div class=\"header\">", "<div class=\"nav\">", "<div class=\"main-content\">", "<div class=\"footer\">",
      ] },
      { heading: "With Semantics (HTML5)", accent: "E67528", body: [
        "<header>", "<nav>", "<main>", "<footer>",
      ] },
    ] },

    { type: "table", kicker: "Semantic HTML", heading: "The Main Semantic Elements",
      header: ["Element", "Represents"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["<header>", "Introductory content — logo, title, nav"],
        ["<nav>", "A block of navigation links"],
        ["<main>", "The primary, unique content (only one per page)"],
        ["<section> / <article>", "A themed grouping / self-contained standalone content"],
        ["<aside>", "Content tangentially related (a sidebar)"],
        ["<footer>", "Closing content — copyright, contact links"],
      ] },

    { type: "code", kicker: "Semantic HTML", heading: "A Full Page Skeleton",
      code: '<header>\n    <h1>My Tech Blog</h1>\n    <nav><a href="/">Home</a> <a href="/about.html">About</a></nav>\n</header>\n<main>\n    <article><h2>Why Semantic HTML Matters</h2><p>Semantic tags help everyone.</p></article>\n    <aside><h3>Related Posts</h3></aside>\n</main>\n<footer><p>&copy; 2026 My Tech Blog.</p></footer>' },

    { type: "image", kicker: "Semantic HTML", heading: "A Full Page Skeleton, Rendered",
      intro: "Semantic elements have no built-in visual style — but every section genuinely exists in the markup.",
      img: `${IMG}/semantic-skeleton.png` },

    { type: "bullets", kicker: "Why It Matters", heading: "Accessibility and SEO", numbered: false, items: [
      "Accessibility: screen readers use semantic tags to jump to navigation or skip to main content — a div-only page gives them nothing to work with",
      "SEO: search engines weight content inside <article>/<main>/headings more than anonymous <div>s",
      "Rule of thumb: reach for a semantic element first; fall back to <div>/<span> only when nothing else fits",
    ] },

    { type: "codeImage", kicker: "HTML Forms", heading: "A Basic Form",
      code: '<form action="/submit-login" method="POST">\n    <label for="username">Username:</label>\n    <input type="text" id="username" name="username">\n\n    <label for="password">Password:</label>\n    <input type="password" id="password" name="password">\n\n    <button type="submit">Log In</button>\n</form>',
      img: `${IMG}/login-form.png` },

    { type: "table", kicker: "HTML Forms", heading: "The action and method Attributes",
      header: ["Attribute", "Meaning"], colW: [2.4, 9.6], leftCol: 0, rowH: 0.9,
      rows: [
        ["action", "The URL the form's data is sent to on submit"],
        ["method: GET", "Appends data to the URL as a query string — for searches, not sensitive data"],
        ["method: POST", "Sends data in the request body — for anything that creates/changes data, or is sensitive"],
      ] },

    { type: "callout", kicker: "Security", heading: "Never Use GET for Passwords", kind: "warning", h: 1.7,
      text: "GET puts form values directly into the URL, where they can end up saved in browser history, server logs, and shared links. Always use POST for passwords and other sensitive information." },

    { type: "codeImage", kicker: "A Real Example", heading: "Searching Google with a GET Form",
      intro: 'name="q" is the exact query-parameter name Google\'s search endpoint expects — submitting this form genuinely searches Google.',
      code: '<form action="https://www.google.com/search" method="GET">\n    <label for="q">Search Google:</label>\n    <input type="text" id="q" name="q" placeholder="Type your search...">\n    <button type="submit">Search</button>\n</form>',
      img: `${IMG}/google-search-form.png` },

    { type: "table", kicker: "Input Types", heading: "Common <input> Types",
      header: ["Type", "Purpose"], colW: [2.4, 9.6], leftCol: 0, rowH: 0.56,
      rows: [
        ["text / email / password", "A line of text, checked for an email shape, or hidden as dots"],
        ["number / date", "Numeric input with arrows / a date picker"],
        ["checkbox / radio", "An on/off box / a mutually-exclusive choice (same name)"],
        ["file", "Lets the user pick a file to upload"],
        ["range / color", "A slider / a color picker"],
        ["submit / hidden", "Submits the form / not shown, but sent along with the data"],
      ] },

    { type: "code", kicker: "Input Types", heading: "Every <input> Type",
      code: '<input type="text" name="fullname" placeholder="Full name">\n<input type="email" name="email" placeholder="you@example.com">\n<input type="password" name="password">\n<input type="number" name="age" min="1" max="120">\n<input type="date" name="birthday">\n<input type="checkbox" name="subscribe" checked>\n<input type="radio" name="gender" value="male"> Male\n<input type="radio" name="gender" value="female"> Female\n<input type="file" name="resume">\n<input type="range" name="volume" min="0" max="100">\n<input type="color" name="favcolor">\n<input type="submit" value="Send">' },

    { type: "image", kicker: "Input Types", heading: "Every Input Type, Rendered",
      intro: "Each type is a genuinely different native control — this is the browser doing most of the work for you.",
      img: `${IMG}/input-types.png` },

    { type: "bullets", kicker: "File Uploads", heading: "multipart/form-data", numbered: false, items: [
      "A file's raw bytes can't fit in a URL — file uploads require method=\"POST\"",
      "enctype=\"multipart/form-data\" switches the request body format so text fields and raw file bytes can travel together",
      "accept is a filter hint for the file picker, not a security check — the server must always re-validate the uploaded file",
    ] },

    { type: "code", kicker: "File Uploads", heading: "What multipart/form-data Looks Like",
      code: 'POST /upload-resume HTTP/1.1\nContent-Type: multipart/form-data; boundary=----Bnd123\n\n------Bnd123\nContent-Disposition: form-data; name="resume"; filename="cv.pdf"\n\n%PDF-1.4 ...(raw binary bytes)...\n------Bnd123--',
      note: "Node.js/Express (with multer) parses this format for you automatically — you'll never write boundary-splitting code by hand." },

    { type: "bullets", kicker: "More Controls", heading: "<select>, <textarea>, and <button>", items: [
      "<select> + <option> creates a dropdown; the selected attribute pre-picks one",
      "<textarea> is a resizable, multi-line text box — its default text goes between the tags, not in a value attribute",
      "<button> is more flexible than <input type=\"submit\"> because it can contain other HTML",
    ] },

    { type: "code", kicker: "More Controls", heading: "<select> and <textarea> Markup",
      code: '<select id="course" name="course">\n    <option value="csc336">Web Technologies</option>\n    <option value="csc337" selected>Advanced Web Technologies</option>\n</select>\n\n<textarea id="message" name="message" rows="5" cols="40">Type here...</textarea>' },

    { type: "imagePair", kicker: "More Controls", heading: "Dropdown and Textarea, Rendered",
      left: { img: `${IMG}/select-dropdown.png`, label: "Select" },
      right: { img: `${IMG}/textarea.png`, label: "Textarea" } },

    { type: "codeImage", kicker: "More Controls", heading: "Three Button Types",
      intro: "submit submits the form, reset clears it, button does nothing on its own (wired up with JavaScript later).",
      code: '<button type="submit">Submit</button>\n<button type="reset">Clear Form</button>\n<button type="button">Just a Button (does nothing by itself)</button>',
      img: `${IMG}/buttons.png` },

    { type: "table", kicker: "Validation", heading: "HTML5 Client-Side Validation",
      header: ["Attribute", "Effect"], colW: [2.6, 9.4], leftCol: 0, rowH: 0.75,
      rows: [
        ["required", "The field cannot be left empty"],
        ["pattern", "A regular expression the value must match (with title for a hint)"],
        ["min / max / step", "Lowest/highest acceptable value and allowed increment"],
        ["maxlength / minlength", "Character-count limits on a text field"],
      ] },

    { type: "code", kicker: "Validation", heading: "A Validated Registration Form",
      code: '<form action="/register" method="POST">\n    <label for="uname">Username (required):</label>\n    <input type="text" id="uname" name="uname" required>\n\n    <label for="cnic">CNIC (format 00000-0000000-0):</label>\n    <input type="text" id="cnic" name="cnic"\n           pattern="\\d{5}-\\d{7}-\\d" title="Format: 00000-0000000-0">\n\n    <label for="age">Age (18–60):</label>\n    <input type="number" id="age" name="age" min="18" max="60">\n\n    <button type="submit">Register</button>\n</form>' },

    { type: "image", kicker: "Validation", heading: "A Validated Form, Rendered",
      intro: "The warning bubbles only appear live in a browser when you try to submit invalid or missing data.",
      img: `${IMG}/validation-form.png` },

    { type: "callout", kicker: "Validation", heading: "Client-Side Validation Is Not Enough", kind: "warning", h: 1.9,
      text: "A user can disable JavaScript or edit HTML in dev tools. Client-side validation is a convenience for instant feedback — it is not security. Every submission must also be validated again on the server." },

    { type: "closing", heading: "Lecture 4 in Six Points", items: [
      "Semantic elements (header, nav, main, article, footer) describe role, improving accessibility and SEO over generic divs.",
      "action sets where form data goes; method (GET/POST) sets how — GET builds a query string, exactly how Google's search box works.",
      "<input type=\"...\"> covers most controls; <select>, <textarea>, and <button> cover the rest.",
      "File uploads need method=\"POST\" and enctype=\"multipart/form-data\" — accept is a hint, not a security check.",
      "required/pattern/min/max give instant feedback, but must always be backed by server-side validation.",
      "Always pair inputs with <label>, connected via matching for/id attributes.",
    ] },
  ],
});
