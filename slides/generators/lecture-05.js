const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-05";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 5: Cascading Style Sheets (CSS) Fundamentals",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-05-CSS-Fundamentals.pptx",
  slides: [
    { type: "title", lectureNo: 5, heading: "CSS\nFundamentals",
      sub: "The language that controls how HTML looks: colours, fonts, spacing, and layout." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "CSS syntax, and the three ways to attach CSS to HTML",
      "Selectors: element, class, id, attribute, grouping, descendant",
      "Pseudo-classes and pseudo-elements",
      "The cascade and specificity — every conflict case, and the real scoring method",
      "Which properties inherit from parent to child, and which do not",
      "The most common colour, font, text, and background properties",
    ] },

    { type: "bullets", kicker: "Foundations", heading: "What Is CSS?", items: [
      "A style sheet language: HTML says what something IS, CSS says how it should look",
      "Separates content (HTML) from presentation (CSS)",
      "Change a whole site's look by editing one CSS file",
      "The same HTML can be restyled for print, mobile, or accessibility",
    ] },

    { type: "code", kicker: "Syntax", heading: "A CSS Rule",
      code: "p {\n  color: darkslategray;\n  font-size: 16px;\n}",
      note: "A selector (which elements) plus a declaration block (what style) — every declaration is a property: value pair, ending in a semicolon." },

    { type: "image", kicker: "Attaching CSS", heading: "1. Inline Styles",
      intro: '<p style="color: red; font-weight: bold;"> — applies only to that one element.',
      img: `${IMG}/inline-style.png` },

    { type: "image", kicker: "Attaching CSS", heading: "2. Internal Style Sheets",
      intro: "A <style> block inside <head> — applies to the whole page, but stuck in that one HTML file.",
      img: `${IMG}/internal-stylesheet.png` },

    { type: "callout", kicker: "Attaching CSS", heading: "3. External Style Sheets — Preferred", kind: "tip", h: 2.4,
      text: "One file, many pages: every page links the same styles.css, so the whole site looks consistent and you edit one file to restyle it. Separation of concerns keeps HTML focused on content. Browsers cache the file, so pages after the first load faster. Designers and developers can work on CSS and HTML independently." },

    { type: "image", kicker: "Selectors", heading: "Class Selector: .highlight",
      intro: ".highlight { background-color: yellow; } — reusable across as many elements as you like.",
      img: `${IMG}/class-selector.png` },

    { type: "image", kicker: "Selectors", heading: "ID Selector: #main-header",
      intro: "#main-header { font-size: 2rem; text-align: center; } — an id must be unique on the page.",
      img: `${IMG}/id-selector.png` },

    { type: "callout", kicker: "Selectors", heading: "Class vs. ID", kind: "warning", h: 1.7,
      text: "Use a class when a style might apply to more than one element (most of the time). Use an id only for something that truly appears once on the page. Overusing ids makes CSS harder to reuse." },

    { type: "image", kicker: "Selectors", heading: "Attribute Selector",
      intro: 'input[type="email"] { border: 1px solid gray; }  and  a[target] { color: purple; }',
      img: `${IMG}/attribute-selector.png` },

    { type: "image", kicker: "Selectors", heading: "Grouping Selector",
      intro: "h1, h2, h3 { font-family: Georgia, serif; color: darkred; } — one declaration block, three selectors.",
      img: `${IMG}/grouping-selector.png` },

    { type: "image", kicker: "Selectors", heading: "Descendant Selector",
      intro: "article p { color: #333; } — selects a <p> anywhere inside an <article>, however deeply nested.",
      img: `${IMG}/descendant-selector.png` },

    { type: "code", kicker: "Selectors", heading: "The Universal Selector",
      code: "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}",
      note: "* matches every single element on the page — most commonly seen in a \"CSS reset\" at the very top of a stylesheet." },

    { type: "code", kicker: "Selectors", heading: "Combinators: Child and Sibling",
      code: "nav > a   { color: navy; }    /* only DIRECT children, not grandchildren   */\nh2 + p    { font-weight: bold; } /* the paragraph immediately after an h2  */\nh2 ~ p    { color: gray; }       /* every p that follows an h2, not just one */",
      note: "> is stricter than a plain descendant selector (space) — it skips anything nested more than one level deep." },

    { type: "table", kicker: "States", heading: "Common Pseudo-Classes",
      header: ["Pseudo-class", "Matches"], colW: [3.4, 8.6], leftCol: 0,
      rows: [
        [":hover / :focus", "Mouse over the element / the element is focused"],
        [":active", "While the element is being clicked"],
        [":first-child / :last-child", "First / last child of its parent"],
        [":nth-child(n)", "The nth child of its parent"],
        [":not(selector)", "Elements that do NOT match the given selector"],
      ] },

    { type: "image", kicker: "States", heading: "Pseudo-Classes, Rendered",
      intro: "li:first-child and button:disabled are states the browser can render up front.",
      img: `${IMG}/pseudo-class-demo.png` },

    { type: "code", kicker: "Parts", heading: "Pseudo-Elements",
      code: "p::first-line { font-weight: bold; }\n\n.quote::before { content: \"\\201C\"; }\n.quote::after  { content: \"\\201D\"; }",
      note: "::before and ::after insert content that is not in the HTML at all — purely for decoration." },

    { type: "image", kicker: "Parts", heading: "Pseudo-Elements, Rendered",
      img: `${IMG}/pseudo-element-demo.png` },

    { type: "table", kicker: "The Cascade", heading: "Specificity, From Lowest to Highest",
      header: ["Selector Type", "Example"], colW: [4.5, 7.5], leftCol: 0,
      rows: [
        ["Element / pseudo-element", "p, ::before"],
        ["Class / attribute / pseudo-class", ".highlight, [type=\"text\"], :hover"],
        ["ID", "#main-header"],
        ["Inline style", "style=\"...\""],
        ["!important", "Overrides everything else"],
      ] },

    { type: "image", kicker: "The Cascade", heading: "Specificity Decides the Winner",
      intro: '<p id="lead-paragraph" class="intro"> — the id selector wins, regardless of source order.',
      img: `${IMG}/specificity-demo.png` },

    { type: "table", kicker: "Every Conflict Case", heading: "How the Browser Resolves Conflicts",
      header: ["Case", "The Winner"], colW: [4.8, 7.2], leftCol: 0, rowH: 0.78,
      rows: [
        ["1. Different specificity", "The more specific rule, regardless of order"],
        ["2. Equal specificity", "The rule written LATER in the source"],
        ["3. One rule is !important", "The !important rule, regardless of specificity"],
        ["4. Both rules !important", "Falls back to specificity, then order"],
        ["5. Inline style vs. stylesheet", "The inline style — unless the stylesheet rule is !important"],
      ] },

    { type: "code", kicker: "Every Conflict Case", heading: "Case 5 in Code",
      code: '<p id="lead" style="color: purple;">...</p>\n\n#lead { color: blue; }              /* loses to inline */\n#lead { color: green !important; } /* beats inline   */',
      note: "Without the !important line, the paragraph is purple. With it, green — one of the few times !important is the right tool." },

    { type: "table", kicker: "The Real Formula", heading: "The 4-Part Specificity Score",
      header: ["Column", "Counts"], colW: [3.6, 8.4], leftCol: 0, rowH: 0.78,
      rows: [
        ["Inline", "1 if the style is inline, else 0"],
        ["IDs", "Number of ID selectors"],
        ["Classes / attrs / pseudo-classes", "Number of these"],
        ["Elements / pseudo-elements", "Number of these"],
      ],
      note: "#nav .item a:hover -> (0,1,2,1)  beats  nav ul li a -> (0,0,0,4) — one ID always outweighs any number of elements, no matter how long the other selector looks." },

    { type: "code", kicker: "Inheritance", heading: "An Example Where Inheritance Does NOT Happen",
      code: ".parent {\n  border: 4px solid crimson;\n  padding: 20px;\n  color: darkblue;\n}\n\n<div class=\"parent\">\n  Parent text is dark blue.\n  <p>Child paragraph is dark blue too.</p>\n</div>",
      note: "color inherits, so the <p> is dark blue too. border and padding do NOT inherit — only .parent itself gets the crimson outline and padding." },

    { type: "table", kicker: "Inheritance", heading: "Inherited vs. Not Inherited",
      header: ["Inherited by Default", "Not Inherited by Default"], colW: [5.8, 6.2],
      rows: [
        ["color", "margin"],
        ["font-family, font-size, font-weight", "padding"],
        ["line-height", "border"],
        ["text-align", "width, height"],
        ["visibility", "background / background-color"],
      ] },

    { type: "image", kicker: "Colour", heading: "Five Ways to Write a Colour",
      intro: "Named, hex, rgb() all give the same red; rgba() adds transparency; hsl() gives hue/saturation/lightness.",
      img: `${IMG}/color-values.png` },

    { type: "image", kicker: "Fonts", heading: "Font Properties",
      intro: "font-family (a fallback list), font-size, font-weight, font-style — combined via the font shorthand too.",
      img: `${IMG}/font-properties.png` },

    { type: "image", kicker: "Text", heading: "Text Properties",
      intro: "text-align, text-decoration, text-transform, line-height, letter-spacing.",
      img: `${IMG}/text-properties.png` },

    { type: "code", kicker: "Backgrounds", heading: "Background Properties",
      code: ".card {\n  background-color: #f5f5f5;\n  background-image: url(\"pattern.png\");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: cover;\n}",
      note: "A background shorthand combines several of these into one declaration, just like font does." },

    { type: "closing", heading: "Lecture 5 in Six Points", items: [
      "CSS separates presentation from content; external style sheets are preferred for real projects.",
      "Selectors decide what gets styled: element, class, id, attribute, grouping, descendant.",
      "The cascade resolves conflicts in order: importance, then specificity, then source order — every time.",
      "Specificity is a 4-part score compared column by column; one ID beats any number of classes or elements.",
      "!important should be a last resort — it breaks normal specificity reasoning.",
      "Text properties like color inherit from parent to child; box properties like border and margin do not.",
    ] },
  ],
});
