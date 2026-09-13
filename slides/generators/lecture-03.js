const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-03";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 3: HTML and HTML5 Fundamentals",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-03-HTML-and-HTML5-Fundamentals.pptx",
  slides: [
    { type: "title", lectureNo: 3, heading: "HTML and HTML5\nFundamentals",
      sub: "The raw ingredients of every website: structure, text, links, images, tables, and lists." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Understand the role of markup languages, and HTML's document structure",
      "Elements, tags, attributes, nesting rules, void elements, and validation",
      "Headings, text formatting, and why the old <font> tag is obsolete",
      "<pre>/<code> and other technical text tags, plus HTML entities",
      "Hyperlinks (internal vs. external), images (including image links), audio, video",
      "Tables, lists (including nested lists), and what HTML5 added",
    ] },

    { type: "bullets", kicker: "Foundations", heading: "What Is a Markup Language?", items: [
      "HyperText — text that contains links to other text or pages",
      "Markup — the text is annotated with tags describing its structure",
      "Language — a shared grammar every browser agrees to follow",
      "HTML is NOT a programming language — no variables, loops, or conditions; it only describes structure and content",
    ] },

    { type: "image", kicker: "Structure", heading: "HTML Document Structure",
      intro: "<!DOCTYPE html>, <html lang=\"en\">, <head> (meta, title), and <body> — every valid page starts this way.",
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

    { type: "image", kicker: "Elements", heading: "Void Elements, Rendered",
      intro: "A line break, a horizontal rule, a broken-image icon showing its alt text, and an empty input.",
      img: `${IMG}/void-elements.png` },

    { type: "table", kicker: "Layout Basics", heading: "Block-Level vs. Inline Elements",
      header: ["", "Block-Level", "Inline"], colW: [3.4, 4.3, 4.3], leftCol: 0,
      rows: [
        ["Starts a new line?", "Yes", "No — flows with content"],
        ["Full available width?", "Yes, by default", "No — only as wide as content"],
        ["Examples", "h1-h6, p, div, ul, table", "a, strong, em, span, img"],
      ] },

    { type: "image", kicker: "Layout Basics", heading: "Block vs. Inline, Rendered",
      intro: "The heading and both paragraphs each claim a full line; strong and a sit inside the last paragraph's line.",
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

    { type: "image", kicker: "Attributes", heading: "Attributes, Rendered",
      intro: "A link, an abbr with a title tooltip, a style-colored paragraph, and three boolean-attribute form controls.",
      img: `${IMG}/attributes-demo.png` },

    { type: "image", kicker: "Text Content", heading: "Headings and Paragraphs",
      intro: "<h1> through <h6>, most to least important — only one <h1> per page.",
      img: `${IMG}/headings.png` },

    { type: "image", kicker: "Text Content", heading: "Text Formatting Elements",
      intro: "strong, em, b, i, mark, small, sub/sup, br, hr — each with a distinct default appearance.",
      img: `${IMG}/text-formatting.png` },

    { type: "code", kicker: "A Deprecated Tag", heading: "The <font> Tag",
      code: '<font color="red" size="5" face="Arial">\n  This text is red, size 5, Arial font.\n</font>',
      note: "Before CSS existed, <font> was the only way to style text directly in HTML." },

    { type: "image", kicker: "A Deprecated Tag", heading: "<font>, Rendered",
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

    { type: "image", kicker: "Hyperlinks", heading: "Links, Rendered",
      intro: "External links first (Wikipedia, COMSATS in a new tab), then internal ones (About, Contact, Home).",
      img: `${IMG}/links.png` },

    { type: "image", kicker: "Images", heading: "The <img> Element",
      intro: "src, alt, width, height — and wrapping an <img> in <a> turns it into a clickable image link.",
      img: `${IMG}/images.png` },

    { type: "image", kicker: "Media", heading: "Audio and Video",
      intro: "<audio controls> and <video controls> with a <source> child — native players, no plugins needed.",
      img: `${IMG}/audio-video.png` },

    { type: "image", kicker: "Tabular Data", heading: "Tables",
      intro: "<table>, <thead>/<tbody>, <tr>, <th>, <td> — for genuinely tabular data only, never page layout.",
      img: `${IMG}/tables.png` },

    { type: "code", kicker: "Lists", heading: "Nested Lists",
      code: "<ul>\n  <li>Front End\n    <ul>\n      <li>HTML</li>\n      <li>CSS</li>\n    </ul>\n  </li>\n  <li>Back End</li>\n</ul>",
      note: "A nested <ul>/<ol> goes inside the <li> of the item it belongs under. Browsers change bullet style (disc, circle, square) at each depth." },

    { type: "image", kicker: "Lists", heading: "All Three List Types, Rendered",
      intro: "Unordered (bulleted), ordered (numbered), and description (term/definition pairs).",
      img: `${IMG}/lists.png` },

    { type: "bullets", kicker: "HTML5", heading: "What HTML5 Added", numbered: false, items: [
      "Semantic layout: header, nav, main, section, article, aside, footer",
      "Media: audio, video, source, track — no plugins required",
      "Graphics: canvas and native svg support",
      "New attributes: placeholder, required, pattern, data-*, contenteditable, draggable",
    ] },

    { type: "callout", kicker: "Browser Support", heading: "Progressive Enhancement", kind: "tip", h: 1.9,
      text: "Not every browser supports every HTML5 feature. Check caniuse.com before relying on a newer one, and design your page so it still works reasonably well in older browsers while enhancing the experience for those that support more." },

    { type: "closing", heading: "Lecture 3 in Six Points", items: [
      "HTML describes structure and content only — void elements (br, img) have no closing tag; nesting must close in reverse order.",
      "Block-level elements stack and fill width; inline elements flow within text.",
      "The <font> tag is obsolete — use CSS for all styling instead.",
      "<pre>/<code> handle technical text; entities (&lt; &nbsp;) represent characters HTML can't take literally.",
      "External links use absolute URLs; internal links use relative ones and survive a domain move.",
      "HTML has three list types — unordered, ordered, description — and any of them can be nested.",
    ] },
  ],
});
