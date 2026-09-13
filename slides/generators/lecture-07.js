const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-07";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 7: CSS Positioning and Stacking",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-07-CSS-Positioning-and-Stacking.pptx",
  slides: [
    { type: "title", lectureNo: 7, heading: "CSS Positioning\nand Stacking",
      sub: "Taking elements out of normal flow — moving, pinning, and layering them — plus floats, an older tool you'll still see." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Normal document flow and static positioning",
      "The four positioning schemes: relative, absolute, fixed, and sticky — with a worked example of each",
      "Offset properties, the containing block, and a common mistake",
      "z-index and stacking contexts",
      "Floats — left, right, side-by-side columns, clearing, and common gotchas",
    ] },

    { type: "bullets", kicker: "The Default", heading: "Normal Flow and Static Positioning", items: [
      "Normal flow: elements are placed one after another, in source order",
      "Every element's position defaults to static — \"follow normal flow, nothing special\"",
      "Offset properties (top/right/bottom/left) have NO effect on a static element",
    ] },

    { type: "image", kicker: "The Positioning Schemes", heading: "Five Ways to Lay Out an Element",
      intro: "Static flow, relative (shifted but reserved), absolute (pinned to an ancestor), fixed (pinned to the viewport), sticky (relative, then fixed).",
      img: `${IMG}/position-values-comparison.png` },

    { type: "code", kicker: "Scheme 1 of 4", heading: "relative",
      code: '.box {\n  position: relative;\n  top: 10px;   /* 10px down from its normal spot */\n  left: 20px;  /* 20px right of its normal spot */\n}',
      note: "The box's original space stays reserved — other elements behave as though it never moved, even though it's now drawn 10px/20px away." },

    { type: "code", kicker: "Scheme 2 of 4", heading: "absolute",
      code: '.box {\n  position: absolute;\n  top: 0;\n  right: 0;\n}',
      note: "Removed from flow entirely — siblings slide into the space it used to occupy. Positioned against its containing block, not where it used to sit." },

    { type: "code", kicker: "Scheme 3 of 4", heading: "fixed",
      code: '.back-to-top {\n  position: fixed;\n  bottom: 20px;\n  right: 20px;\n}',
      note: "Pinned to the browser viewport — stays in the exact same screen spot even as the page scrolls. Classic use: a \"back to top\" button or a chat widget." },

    { type: "code", kicker: "Scheme 4 of 4", heading: "sticky",
      code: '.section-heading {\n  position: sticky;\n  top: 0;  /* the threshold — required for sticky to do anything */\n}',
      note: "Behaves like relative until the page scrolls to the threshold, then sticks like fixed — but only within its own parent's boundaries." },

    { type: "table", kicker: "Quick Recap", heading: "relative, absolute, fixed, sticky",
      header: ["Value", "Behavior"], colW: [2.6, 9.4], leftCol: 0, rowH: 0.85,
      rows: [
        ["relative", "Stays in normal flow (space still reserved), then shifts visually via offsets"],
        ["absolute", "Removed from flow; positioned against its nearest positioned ancestor"],
        ["fixed", "Removed from flow; positioned against the browser viewport, stays put when scrolled"],
        ["sticky", "Behaves like relative until a scroll threshold, then like fixed within its parent"],
      ] },

    { type: "code", kicker: "A Common Pattern", heading: "Relative Parent, Absolute Child",
      code: '.card { position: relative; }\n\n.card .badge {\n  position: absolute;\n  top: 8px; right: 8px;\n}',
      note: ".card becomes the containing block, so the badge is pinned to the card's corner, not the whole page." },

    { type: "image", kicker: "A Common Pattern", heading: "The Badge, Rendered",
      img: `${IMG}/card-badge.png` },

    { type: "code", kicker: "A Common Mistake", heading: "Absolute Without a Positioned Ancestor",
      code: '<div class="card">          <!-- position NOT set -->\n  <span class="badge">New</span>  <!-- position: absolute; top:8px; right:8px; -->\n</div>',
      note: "Without position: relative on .card, .badge's containing block becomes the whole page — it jumps to the page's top-right corner, not the card's." },

    { type: "code", kicker: "Stacking Order", heading: "z-index",
      code: ".back  { position: absolute; z-index: 1; }\n.front { position: absolute; z-index: 2; }  /* drawn on top */",
      note: "z-index only works on positioned elements (not static) — a higher value draws on top among overlapping elements." },

    { type: "image", kicker: "Stacking Order", heading: "z-index, Rendered",
      img: `${IMG}/z-index-stacking.png` },

    { type: "bullets", kicker: "Stacking Order", heading: "Stacking Contexts", numbered: false, items: [
      "A stacking context is a self-contained layer for z-index comparisons",
      "position + z-index, opacity < 1, or transform can create a new stacking context",
      "z-index values only compare WITHIN the same stacking context — a huge z-index can still lose if it's trapped inside an ancestor's context",
    ] },

    { type: "code", kicker: "Floats", heading: "float: left",
      code: '.image { float: left; margin-right: 15px; }',
      note: "Originally for text wrapping around an image. A floated element shifts to one edge; other content flows around it." },

    { type: "image", kicker: "Floats", heading: "Text Wrapping a Float, Rendered",
      img: `${IMG}/float-wrap.png` },

    { type: "code", kicker: "Floats", heading: "float: right — the Mirror Image",
      code: '.image {\n  float: right;\n  margin-left: 15px;\n}',
      note: "Exactly the same idea, flipped: the image sits at the right edge, and text wraps along its left side instead." },

    { type: "code", kicker: "Floats", heading: "A Classic Two-Column Layout",
      code: '.sidebar { float: left;  width: 25%; }\n.main    { float: left;  width: 75%; }\n\n<div class="sidebar">...</div>\n<div class="main">...</div>',
      note: "Before flexbox and grid existed, this float + matching-width pattern was the standard way to place two columns side by side." },

    { type: "bullets", kicker: "Floats", heading: "Float Gotchas Worth Knowing", numbered: false, items: [
      "A floated element needs an explicit width — without one, it can shrink to fit its content unpredictably",
      "Floating an inline element (like a <span>) makes it behave like a block for sizing purposes",
      "A float only affects the elements AFTER it in the HTML — it never moves content that comes before it",
    ] },

    { type: "table", kicker: "Floats", heading: "The clear Property",
      header: ["Value", "Behavior"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["left / right", "Moves below any preceding left- / right-floated elements"],
        ["both", "Moves below floats on either side — by far the most common value"],
        ["none (default)", "No clearing — free to sit beside a float"],
      ] },

    { type: "code", kicker: "Floats", heading: "clear, on Its Own",
      code: '<img class="photo" style="float:left;" ...>\n<p>Text wraps the floated photo.</p>\n<h2 style="clear: both;">Next Section</h2>',
      note: "Without clear: both, the heading could get squeezed into the space beside the float instead of starting cleanly below it." },

    { type: "code", kicker: "Floats", heading: "The Collapsing Parent Problem",
      code: '.clearfix::after {\n  content: "";\n  display: block;\n  clear: both;\n}',
      note: "If every child is floated, a container collapses to zero height. .clearfix adds an invisible element with clear: both to force the parent to contain its floated children again." },

    { type: "image", kicker: "Floats", heading: "Clearfix, Before and After",
      img: `${IMG}/clearfix-before-after.png` },

    { type: "table", kicker: "Overflow", heading: "Containing Floats — a Simpler Alternative",
      header: ["Value", "Behavior"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["visible (default)", "Content spills outside the box, still visible"],
        ["hidden", "Content that doesn't fit is clipped and hidden"],
        ["scroll / auto", "Adds scrollbars always / only when content actually overflows"],
      ] },

    { type: "image", kicker: "Overflow", heading: "Visible vs. Hidden, Rendered",
      img: `${IMG}/overflow-comparison.png` },

    { type: "callout", kicker: "Overflow", heading: "A One-Line Clearfix Alternative", kind: "tip", h: 1.9,
      text: "overflow: hidden (or auto) on a float's parent fixes the collapsing-parent problem too, in one line. Trade-off: it also clips any OTHER content that overflows that container, like a dropdown or tooltip — the .clearfix trick is the safer, general-purpose tool." },

    { type: "bullets", kicker: "Pitfalls", heading: "Common Layout Pitfalls", numbered: false, items: [
      "position: absolute without a relative ancestor jumps relative to the whole page",
      "z-index \"not working\" is almost always a stacking-context issue on an ancestor",
      "A position: fixed element is fixed to the viewport, not to a scrolling div — you likely want sticky instead",
      "A floated element with no explicit width, or an un-cleared float, are the two most common float bugs",
    ] },

    { type: "closing", heading: "Lecture 7 in Six Points", items: [
      "Normal flow places elements in source order; position: static means \"stay in flow,\" and offsets do nothing on it.",
      "relative shifts an element while reserving its space; absolute/fixed remove it from flow entirely; sticky is a hybrid.",
      "The containing block for absolute is the nearest positioned ancestor — forgetting it sends the element to the whole page.",
      "z-index only compares within the same stacking context.",
      "float: left/right pulls an element aside and wraps content around it — give it a width, and clear or contain its parent.",
      "Prefer flexbox and grid for modern layout; understand floats mainly to read older code.",
    ] },
  ],
});
