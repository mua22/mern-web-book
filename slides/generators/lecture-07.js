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
      "The four positioning schemes: relative, absolute, fixed, and sticky",
      "Offset properties and the containing block",
      "z-index and stacking contexts",
      "Floats, the clear property, overflow, and common layout pitfalls",
    ] },

    { type: "bullets", kicker: "The Default", heading: "Normal Flow and Static Positioning", items: [
      "Normal flow: elements are placed one after another, in source order",
      "Every element's position defaults to static — \"follow normal flow, nothing special\"",
      "Offset properties (top/right/bottom/left) have NO effect on a static element",
    ] },

    { type: "image", kicker: "The Positioning Schemes", heading: "Five Ways to Lay Out an Element",
      intro: "Static flow, relative (shifted but reserved), absolute (pinned to an ancestor), fixed (pinned to the viewport), sticky (relative, then fixed).",
      img: `${IMG}/position-values-comparison.png` },

    { type: "table", kicker: "The Positioning Schemes", heading: "relative, absolute, fixed, sticky",
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

    { type: "table", kicker: "Floats", heading: "The clear Property",
      header: ["Value", "Behavior"], colW: [2.6, 9.4], leftCol: 0,
      rows: [
        ["left / right", "Moves below any preceding left- / right-floated elements"],
        ["both", "Moves below floats on either side — by far the most common value"],
        ["none (default)", "No clearing — free to sit beside a float"],
      ] },

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
    ] },

    { type: "closing", heading: "Lecture 7 in Six Points", items: [
      "Normal flow places elements in source order; position: static means \"stay in flow,\" and offsets do nothing on it.",
      "relative shifts an element while reserving its space; absolute/fixed remove it from flow entirely; sticky is a hybrid.",
      "The containing block for absolute is the nearest positioned ancestor — the relative-parent, absolute-child pattern.",
      "z-index only compares within the same stacking context.",
      "Floats pull an element aside and let content wrap it; a floats-only container can collapse unless cleared or given overflow other than visible.",
      "Prefer flexbox and grid for modern layout; understand floats mainly to read older code.",
    ] },
  ],
});
