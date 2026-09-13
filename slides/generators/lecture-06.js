const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-06";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 6: The CSS Box Model and Display",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-06-CSS-Box-Model-and-Display.pptx",
  slides: [
    { type: "title", lectureNo: 6, heading: "The CSS Box Model\nand Display",
      sub: "Every element is a rectangular box — understanding its size and behavior is the core of CSS layout." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "The four layers of the box model: content, padding, border, and margin",
      "Margin collapsing, and why it surprises beginners",
      "box-sizing: content-box vs. border-box",
      "Controlling size with width, height, and min-/max- constraints",
      "The display property: block, inline, inline-block, and none",
      "A real technique: turning a <ul> into a horizontal menu with display",
    ] },

    { type: "bullets", kicker: "The Box Model", heading: "Four Nested Layers", items: [
      "Content — the actual text, image, or other content",
      "Padding — transparent space inside the border, colored by the background",
      "Border — a line (or nothing) drawn around the padding",
      "Margin — transparent space outside the border, never filled with color",
    ] },

    { type: "codeImage", kicker: "The Box Model", heading: "The Four Layers, Rendered",
      code: '.content { width: 300px; height: 150px; background: steelblue; }\n.padding { padding: 20px; background: seagreen; }\n.border  { border: 20px solid darkorange; }\n.margin  { margin: 20px; background: wheat; }',
      img: `${IMG}/box-model-layers.png` },

    { type: "code", kicker: "Margin Collapsing", heading: "Two Adjacent Vertical Margins",
      code: ".box-one { margin-bottom: 30px; }\n.box-two { margin-top: 20px; }",
      note: "You might expect a 50px gap — but margin collapsing means the actual gap is only 30px, the LARGER of the two." },

    { type: "image", kicker: "Margin Collapsing", heading: "Margin Collapsing, Rendered",
      img: `${IMG}/margin-collapsing.png` },

    { type: "callout", kicker: "Margin Collapsing", heading: "Only Happens Vertically", kind: "warning", h: 1.9,
      text: "Margin collapsing applies only to top/bottom margins of block elements in normal flow. It never happens with left/right margins, or with flex, grid, floats, or absolute positioning." },

    { type: "code", kicker: "box-sizing", heading: "content-box (Default) vs. border-box",
      code: "/* content-box: padding + border ADD to width */\n.a { box-sizing: content-box; width: 300px; padding: 20px; border: 2px solid; }\n/* actual rendered width = 344px */\n\n/* border-box: padding + border are INCLUDED in width */\n.b { box-sizing: border-box; width: 300px; padding: 20px; border: 2px solid; }\n/* actual rendered width = exactly 300px */" },

    { type: "image", kicker: "box-sizing", heading: "Same Width, Different Sizing",
      intro: "Same width, padding, and border on both — content-box renders visibly wider than border-box.",
      img: `${IMG}/box-sizing-comparison.png` },

    { type: "callout", kicker: "box-sizing", heading: "border-box: The Practical Default", kind: "tip", h: 1.7,
      text: "Because border-box makes sizing far more predictable, most real style sheets start with *, *::before, *::after { box-sizing: border-box; } as a site-wide reset." },

    { type: "bullets", kicker: "Sizing", heading: "min-/max- Constraints", numbered: false, items: [
      "max-width caps how wide a box can grow — never wider than 1000px, even on a huge screen",
      "min-width / min-height set a floor the box will never shrink below",
      "Together they let a box scale down on narrow screens but stop growing past a sensible limit on wide monitors",
    ] },

    { type: "bullets", kicker: "The display Property", heading: "block, inline, inline-block, none", items: [
      "block — starts a new line, fills the full available width (div, p, h1-h6, ul)",
      "inline — flows within text, width/height are ignored (span, a, strong)",
      "inline-block — flows inline, but respects width/height/vertical margin (nav links, buttons)",
      "none — removed from the page entirely, taking up no space at all",
    ] },

    { type: "codeImage", kicker: "The display Property", heading: "All Four Values, Compared",
      code: '.section { display: block; }        /* new line, full width  */\n.tag     { display: inline; }       /* flows in text, no w/h */\n.button  { display: inline-block;   /* inline + respects w/h */\n           width: 120px; height: 40px; }\n.hidden-panel { display: none; }    /* removed entirely      */',
      img: `${IMG}/display-comparison.png` },

    { type: "code", kicker: "A Common Mix-Up", heading: "display: none vs. visibility: hidden",
      code: ".gone    { display: none; }      /* removed entirely — no space reserved   */\n.invisible { visibility: hidden; } /* invisible, but still takes up its space */",
      note: "Toggling display: none with JavaScript reflows the page (neighbors shift to fill the gap); visibility: hidden leaves a blank gap where the element used to be." },

    { type: "code", kicker: "inline-block in Practice", heading: "A Row of Equal-Sized Buttons",
      code: ".btn {\n  display: inline-block;\n  width: 120px;\n  text-align: center;\n  padding: 10px 0;\n  margin-right: 8px;\n}",
      note: "inline-block is what lets several fixed-width buttons sit on one line, side by side, without giving up width/height control the way plain inline would." },

    { type: "code", kicker: "A Practical Example", heading: "Turning a <ul> Into a Horizontal Menu",
      code: ".menu { list-style: none; margin: 0; padding: 0; }\n.menu li { display: inline-block; margin-right: 20px; }",
      note: "li is block by default — this one change turns a vertical list into a horizontal menu, with no HTML change at all." },

    { type: "image", kicker: "A Practical Example", heading: "Before and After, Rendered",
      img: `${IMG}/ul-menu-display.png` },

    { type: "bullets", kicker: "A Practical Example", heading: "Why Build a Menu This Way?", numbered: false, items: [
      "A nav menu IS, conceptually, a list of links — that's exactly what it is to a screen reader and a search engine",
      "Screen readers announce it as a list, telling users how many links there are",
      "The HTML never has to change later — redesign to a dropdown or hamburger menu by changing only CSS",
    ] },

    { type: "code", kicker: "Finishing Touches", heading: "Borders, Radius, and Shadow",
      code: ".card {\n  border: 2px solid #333;\n  border-radius: 8px;\n  box-shadow: 0 4px 8px rgba(0,0,0,0.2);\n}\n\n.avatar { border-radius: 50%; }  /* a circle */" },

    { type: "bullets", kicker: "Finishing Touches", heading: "Consistent Spacing Techniques", numbered: false, items: [
      "A spacing scale — pick a small set of values (4px, 8px, 16px, 24px) and only ever use those",
      "CSS custom properties — define --space-md: 16px once in :root, reuse everywhere with var(--space-md)",
      "Change the whole site's spacing rhythm by editing one value in :root",
    ] },

    { type: "closing", heading: "Lecture 6 in Six Points", items: [
      "Every box has four layers: content, padding, border, margin — vertically adjacent margins can collapse to the larger value.",
      "box-sizing: border-box makes padding and border count inside your width, and is the practical default.",
      "min-/max-width/height add flexible constraints on top of a base size.",
      "display controls layout behavior: block fills width, inline flows in text, inline-block combines both, none removes the element entirely.",
      "A <ul> styled with li { display: inline-block; } is a real way to build a menu without losing list semantics.",
      "border-radius, box-shadow, and CSS custom properties keep a design finished and consistent.",
    ] },
  ],
});
