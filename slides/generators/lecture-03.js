const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-03";
const IMG2 = "D:/GitHub/mern-web-book/slides/assets/lecture-03";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 3: HTML and HTML5 Fundamentals",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-03-HTML-and-HTML5-Fundamentals.pptx",
  slides: [
    { type: "title", lectureNo: 3, heading: "HTML and HTML5\nFundamentals",
      sub: "The raw ingredients of every website: structure, text, links, images, tables, and lists." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Understand the role of markup languages, and the anatomy of an HTML tag",
      "HTML's document structure, elements, attributes, nesting rules, and void elements",
      "Headings, text formatting, and why the old <font> tag is obsolete",
      "<pre>/<code> and other technical text tags, plus HTML entities",
      "Hyperlinks (internal vs. external), images (including image links), audio, video",
      "Tables, all three list types (including nested lists), and what HTML5 added",
    ] },

    { type: "bullets", kicker: "Foundations", heading: "What Is a Markup Language?", items: [
      "HyperText — text that contains links to other text or pages",
      "Markup — the text is annotated with tags describing its structure",
      "Language — a shared grammar every browser agrees to follow",
      "HTML is NOT a programming language — no variables, loops, or conditions; it only describes structure and content",
    ] },

    { type: "table", kicker: "Start Here", heading: "Anatomy of an HTML Tag",
      header: ["Part", "Example", "Meaning"], colW: [3.0, 3.4, 5.6], leftCol: 0, rowH: 0.75,
      rows: [
        ["Opening tag", "<p>", "Marks the start of an element"],
        ["Attribute", "class=\"intro\"", "Extra info, written inside the opening tag only"],
        ["Content", "Hello, World!", "What sits between the opening and closing tag"],
        ["Closing tag", "</p>", "Marks the end — note the forward slash"],
        ["Comment", "<!-- note -->", "Ignored by the browser, visible only in the source"],
        ["Void (self-closing) tag", "<br>", "No content, and so no closing tag at all"],
      ] },

    { type: "codeImage", kicker: "Start Here", heading: "Your First Example: Hello, World!",
      code: '<!-- This is a comment: the browser ignores it -->\n<p class="intro" id="greeting">Hello, World!</p>',
      img: `${IMG2}/hello-world.png` },

    { type: "codeImage", kicker: "Structure", heading: "HTML Document Structure",
      code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>My First Page</title>\n</head>\n<body>\n    <h1>Hello, Web!</h1>\n    <p>This is my first HTML page.</p>\n</body>\n</html>',
      img: `${IMG}/doc-structure.png` },

    { type: "table", kicker: "Elements", heading: "Void (Self-Closing) Elements",
      header: ["Element", "What It Does"], colW: [3, 9.0], leftCol: 0,
      rows: [
        ["<br>", "A single line break within text"],
        ["<hr>", "A thematic divider line between sections"],
        ["<img>", "Embeds an image"],
        ["<input>", "A form control"],
        ["<meta> / <link>", "Document metadata / an external resource, used inside <head>"],
      ],
      note: "Void elements have no content and therefore no closing tag — <div></div> is NOT void, it just happens to be empty." },

    { type: "codeImage", kicker: "Elements", heading: "Void Elements, Rendered",
      code: '<br>\n<hr>\n<img src="cat.jpg" alt="A photo of a cat">\n<input type="text">',
      img: `${IMG}/void-elements.png` },

    { type: "table", kicker: "Layout Basics", heading: "Block-Level vs. Inline Elements",
      header: ["", "Block-Level", "Inline"], colW: [3.4, 4.3, 4.3], leftCol: 0,
      rows: [
        ["Starts a new line?", "Yes", "No — flows with content"],
        ["Full available width?", "Yes, by default", "No — only as wide as content"],
        ["Examples", "h1-h6, p, div, ul, table", "a, strong, em, span, img"],
      ] },

    { type: "codeImage", kicker: "Layout Basics", heading: "Block vs. Inline, Rendered",
      code: '<h1>Page Title</h1>\n<p>This is a paragraph.</p>\n<p>This is another paragraph, on its own line below.</p>\n\n<p>This word is <strong>important</strong>, and this is a\n<a href="#">link</a> in the middle of a sentence.</p>',
      img: `${IMG}/block-inline.png` },

    { type: "table", kicker: "Attributes", heading: "Global Attributes",
      header: ["Attribute", "Purpose"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["id", "A unique identifier for one specific element"],
        ["class", "Category name(s) shared by many elements, for CSS/JS"],
        ["title", "Extra info shown as a tooltip on hover"],
        ["style", "Inline CSS applied to just this one element"],
        ["lang", "The (human) language of this element's content"],
        ["data-*", "A custom attribute for attaching your own data"],
      ],
      note: "Boolean attributes (required, checked, disabled) need no =\"value\" — present means true, absent means false." },

    { type: "codeImage", kicker: "Attributes", heading: "Attributes, Rendered",
      code: '<a href="https://www.comsats.edu.pk" target="_blank">Visit COMSATS</a>\n<p>Founded in 1998, <abbr title="World Wide Web Consortium">W3C</abbr> sets web standards.</p>\n<p style="color: red;">Urgent</p>\n<input type="text" required placeholder="required field">\n<input type="checkbox" checked> Subscribe\n<button disabled>Can\'t click me</button>',
      img: `${IMG}/attributes-demo.png` },

    { type: "codeImage", kicker: "Text Content", heading: "Headings",
      code: "<h1>Chapter Title</h1>\n<h2>Section Heading</h2>\n<h3>Sub-section Heading</h3>",
      img: `${IMG}/headings.png` },

    { type: "codeImage", kicker: "Text Content", heading: "Text Formatting Elements",
      code: '<strong>Warning</strong>: this is <em>really</em> important.\n<b>Bold text</b> and <i>Italic text</i>.\n<mark>highlighted</mark> text, and <small>terms apply</small>.\nH<sub>2</sub>O and x<sup>2</sup>\nLine one<br>Line two\n<hr>',
      img: `${IMG}/text-formatting.png` },

    { type: "codeImage", kicker: "A Deprecated Tag", heading: "The <font> Tag",
      code: '<font color="red" size="5" face="Arial">\n  This text is red, size 5, Arial font.\n</font>',
      img: `${IMG}/font-tag.png` },

    { type: "bullets", kicker: "A Deprecated Tag", heading: "Why We Don't Use <font>", numbered: false, items: [
      "Mixes structure with appearance — HTML should describe what something is, not how it looks",
      "Doesn't scale — changing 50 pages means editing 50 pages, not one CSS rule",
      "No responsive or interactive ability — can't change on hover, on a smaller screen, or in dark mode",
      "Fails validation — flagged as an error by the W3C Markup Validator",
    ] },

    { type: "table", kicker: "Technical Text", heading: "<pre>, <code>, and Related Tags",
      header: ["Tag", "Meaning"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["<pre>", "Preformatted text — preserves every space and line break, monospace"],
        ["<code>", "An inline snippet of computer code, monospace"],
        ["<kbd>", "Keyboard input — a key the user should press"],
        ["<samp>", "Sample output from a program or command"],
        ["<var>", "A variable name or placeholder value"],
        ["<blockquote>", "A longer, block-level quotation"],
      ] },

    { type: "codeImage", kicker: "Technical Text", heading: "Technical Text Tags, Rendered",
      code: '<pre>function greet() {\n    console.log("Hello!");\n}</pre>\n<p>Use the <code>console.log()</code> function.</p>\n<p>Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.</p>\n<p>Printed: <samp>Build succeeded</samp></p>\n<p>Replace <var>filename</var> with your own.</p>\n<blockquote>The Web connects people.</blockquote>',
      img: `${IMG2}/pre-code-tags.png` },

    { type: "table", kicker: "Special Characters", heading: "HTML Entities",
      header: ["Entity", "Renders As", "Why You Need It"], colW: [2.2, 2.2, 7.6], leftCol: 0,
      rows: [
        ["&lt;", "<", "A literal < would start a tag"],
        ["&gt;", ">", "A literal > would end a tag"],
        ["&amp;", "&", "A literal & would start another entity"],
        ["&nbsp;", "(a space)", "A non-breaking space — never wraps a line"],
        ["&copy;", "\u00A9", "Not on most keyboards"],
        ["&mdash;", "\u2014", "An em dash, longer than a hyphen"],
      ] },

    { type: "codeImage", kicker: "Special Characters", heading: "Entities, Rendered",
      code: "<p>5 &lt; 10 and 10 &gt; 5</p>\n<p>Copyright &copy; 2025 &mdash; All rights reserved</p>\n<p>Click&nbsp;Here&nbsp;Now (no line break allowed)</p>",
      img: `${IMG2}/entities.png` },

    { type: "cards", kicker: "Hyperlinks", heading: "Internal and External Links", cards: [
      { heading: "External (Absolute URL)", accent: "2B2B7A", body: [
        "The complete address, including https:// and the domain",
        "Use for a page on a DIFFERENT website",
        "target=\"_blank\" + rel=\"noopener noreferrer\" opens safely in a new tab",
      ] },
      { heading: "Internal (Relative URL)", accent: "E67528", body: [
        "A path relative to the current page — no domain name",
        "Use for pages within YOUR OWN site",
        "Survives a domain move, since it never contained the domain",
      ] },
    ] },

    { type: "codeImage", kicker: "Hyperlinks", heading: "Links, Rendered",
      code: '<a href="https://en.wikipedia.org/wiki/HTML">HTML on Wikipedia</a>\n<a href="https://www.comsats.edu.pk" target="_blank" rel="noopener noreferrer">Visit COMSATS (new tab)</a>\n<a href="about.html">About Us</a>\n<a href="pages/contact.html">Contact (in a subfolder)</a>\n<a href="../index.html">Back to home (one folder up)</a>',
      img: `${IMG}/links.png` },

    { type: "codeImage", kicker: "Images", heading: "The <img> Element",
      code: '<img src="images/logo.png" alt="COMSATS logo" width="200" height="80">',
      img: `${IMG}/images.png` },

    { type: "codeImage", kicker: "Media", heading: "Audio and Video",
      code: '<audio controls>\n    <source src="song.mp3" type="audio/mpeg">\n    Your browser does not support audio.\n</audio>\n\n<video width="480" controls>\n    <source src="movie.mp4" type="video/mp4">\n    Your browser does not support video.\n</video>',
      img: `${IMG}/audio-video.png` },

    { type: "codeImage", kicker: "Tabular Data", heading: "Tables: <table>, <tr>, <th>, <td>",
      code: '<table>\n  <thead>\n    <tr><th>Name</th><th>Course</th><th>Grade</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Ali</td><td>CSC336</td><td>A</td></tr>\n    <tr><td>Sara</td><td>CSC336</td><td>A+</td></tr>\n  </tbody>\n</table>',
      img: `${IMG}/tables.png` },

    { type: "codeImage", kicker: "Lists", heading: "Unordered, Ordered, and Description Lists",
      code: '<ul>\n  <li>HTML</li><li>CSS</li><li>JavaScript</li>\n</ul>\n\n<ol>\n  <li>Write the HTML</li><li>Add CSS styling</li>\n</ol>\n\n<dl>\n  <dt>HTML</dt><dd>The markup language...</dd>\n</dl>',
      img: `${IMG}/lists.png` },

    { type: "codeImage", kicker: "Lists", heading: "A Closer Look: Description Lists",
      code: '<dl>\n    <dt>HTML</dt>\n    <dd>The markup language used to structure web pages.</dd>\n    <dt>CSS</dt>\n    <dd>The language used to style web pages.</dd>\n</dl>',
      img: `${IMG2}/description-list.png` },

    { type: "codeImage", kicker: "Lists", heading: "Nested Lists",
      code: "<ul>\n  <li>Front End\n    <ul>\n      <li>HTML</li>\n      <li>CSS</li>\n    </ul>\n  </li>\n  <li>Back End\n    <ul>\n      <li>Node.js</li>\n      <li>Express</li>\n    </ul>\n  </li>\n</ul>",
      img: `${IMG2}/nested-lists.png` },

    { type: "bullets", kicker: "Lists", heading: "Nested List Rules", numbered: false, items: [
      "A nested <ul>/<ol> goes inside the <li> of the item it belongs under",
      "A nested <ol> restarts its own numbering from 1, independent of the level above",
      "Browsers change bullet style (disc → circle → square) at each nesting depth",
    ] },

    { type: "bullets", kicker: "HTML5", heading: "What HTML5 Added", numbered: false, items: [
      "Semantic layout: header, nav, main, section, article, aside, footer",
      "Media: audio, video, source, track — no plugins required",
      "Graphics: canvas and native svg support",
      "New attributes: placeholder, required, pattern, data-*, contenteditable, draggable",
    ] },

    { type: "callout", kicker: "Browser Support", heading: "Progressive Enhancement", kind: "tip", h: 1.9,
      text: "Not every browser supports every HTML5 feature. Check caniuse.com before relying on a newer one, and design your page so it still works reasonably well in older browsers while enhancing the experience for those that support more." },

    { type: "closing", heading: "Lecture 3 in Six Points", items: [
      "A tag has an opening tag, content, and a closing tag; attributes live inside the opening tag; comments and attributes never appear in the rendered page.",
      "Void elements (br, img) have no closing tag; nesting must close in reverse order.",
      "Block-level elements stack and fill width; inline elements flow within text.",
      "The <font> tag is obsolete — use CSS for all styling instead.",
      "<pre>/<code> handle technical text; entities (&lt; &nbsp;) represent characters HTML can't take literally.",
      "HTML has three list types — unordered, ordered, description (<dl>) — and any of them can be nested.",
    ] },
  ],
});
