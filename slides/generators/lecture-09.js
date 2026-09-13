const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-09";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 9: Flexbox and Grid Layout",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-09-Flexbox-and-Grid-Layout.pptx",
  slides: [
    { type: "title", lectureNo: 9, heading: "Flexbox and\nGrid Layout",
      sub: "The two modern CSS layout systems — one-dimensional alignment, and two-dimensional page structure." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Flexbox: container, items, and the two axes",
      "flex-direction, justify-content, align-items, flex-wrap, flex-grow/shrink/basis",
      "CSS Grid: rows, columns, and the fr unit",
      "Grid line placement, spanning multiple cells, and named grid areas",
      "Choosing Flexbox vs. Grid — and using both together",
    ] },

    { type: "code", kicker: "Flexbox", heading: "Container and Items",
      code: ".nav { display: flex; }",
      note: "One declaration turns every direct child of .nav into a flex item, laid out in a single row by default." },

    { type: "image", kicker: "Flexbox", heading: "A Flex Nav Bar, Rendered",
      img: `${IMG}/flex-nav-intro.png` },

    { type: "codeImage", kicker: "Flexbox", heading: "The Main Axis and the Cross Axis",
      intro: "The main axis runs in the flex direction (row, by default); the cross axis runs perpendicular to it.",
      code: '.flex-row {\n  display: flex; /* main axis: horizontal, left to right */\n}',
      img: `${IMG}/main-cross-axis.png` },

    { type: "code", kicker: "Flexbox Properties", heading: "flex-direction",
      code: ".container { flex-direction: row | row-reverse | column | column-reverse; }" },

    { type: "image", kicker: "Flexbox Properties", heading: "flex-direction, Compared",
      img: `${IMG}/flex-direction-comparison.png` },

    { type: "code", kicker: "Flexbox Properties", heading: "justify-content (Main Axis)",
      code: ".container { justify-content: flex-start | flex-end | center |\n                          space-between | space-around | space-evenly; }" },

    { type: "image", kicker: "Flexbox Properties", heading: "justify-content, Compared",
      img: `${IMG}/justify-content-comparison.png` },

    { type: "code", kicker: "Flexbox Properties", heading: "align-items (Cross Axis)",
      code: ".container { align-items: stretch | flex-start | flex-end | center; }" },

    { type: "image", kicker: "Flexbox Properties", heading: "align-items, Compared",
      img: `${IMG}/align-items-comparison.png` },

    { type: "code", kicker: "A Famous Trick", heading: "Perfect Centering",
      code: ".container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
      note: "The classic answer to \"how do I center a div\" — both axes at once." },

    { type: "image", kicker: "A Famous Trick", heading: "Centering, Rendered",
      img: `${IMG}/centering-trick.png` },

    { type: "code", kicker: "Flexbox Properties", heading: "flex-wrap",
      code: ".container { flex-wrap: nowrap | wrap; }",
      note: "nowrap squeezes everything onto one line, even past the container's edge; wrap breaks items onto multiple lines." },

    { type: "image", kicker: "Flexbox Properties", heading: "flex-wrap, Compared",
      img: `${IMG}/flex-wrap-demo.png` },

    { type: "code", kicker: "Flexbox Properties", heading: "flex-grow, flex-shrink, flex-basis",
      code: ".item { flex-basis: 200px; }   /* starting size before growing/shrinking */\n.item { flex: 1; }              /* grow to fill equally */\n.item { flex-grow: 2; }         /* grow twice as fast as flex-grow: 1 */" },

    { type: "image", kicker: "Flexbox Properties", heading: "Growing and Shrinking, Rendered",
      img: `${IMG}/flex-grow-shrink-basis.png` },

    { type: "code", kicker: "CSS Grid", heading: "Rows and Columns",
      code: ".grid {\n  display: grid;\n  grid-template-columns: 200px 200px 200px;\n  grid-template-rows: 150px 150px;\n  gap: 10px;\n}" },

    { type: "image", kicker: "CSS Grid", heading: "A Basic Grid, Rendered",
      img: `${IMG}/grid-basic-demo.png` },

    { type: "code", kicker: "CSS Grid", heading: "The fr Unit",
      code: "grid-template-columns: 1fr 1fr 1fr;      /* three equal columns */\ngrid-template-columns: 2fr 1fr;          /* left column twice as wide */\ngrid-template-columns: 250px 1fr;        /* fixed sidebar + flexible main */",
      note: "fr distributes remaining space as a FRACTION — it's Grid's equivalent of flex-grow." },

    { type: "image", kicker: "CSS Grid", heading: "The fr Unit, Compared",
      img: `${IMG}/fr-unit-comparison.png` },

    { type: "code", kicker: "CSS Grid", heading: "gap",
      code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}",
      note: "gap replaces the old margin-hack for spacing grid (and flex) items evenly, without extra space at the edges." },

    { type: "image", kicker: "CSS Grid", heading: "gap, Rendered",
      img: `${IMG}/grid-gap-repeat-demo.png` },

    { type: "code", kicker: "Grid Placement", heading: "Placing Items on Grid Lines",
      code: ".item-a { grid-column: 1 / 3; grid-row: 1; }\n.item-b { grid-column: 3; grid-row: 1; }",
      note: "Grid lines are numbered starting at 1 — an item can be placed at exact, specific cells." },

    { type: "image", kicker: "Grid Placement", heading: "Line Placement, Rendered",
      img: `${IMG}/grid-line-placement.png` },

    { type: "code", kicker: "Grid Placement", heading: "Spanning Multiple Cells",
      code: ".featured {\n  grid-column: span 2;\n  grid-row: span 2;\n}",
      note: "A photo-gallery-style layout: one featured cell occupies a 2x2 block while others fill in around it." },

    { type: "image", kicker: "Grid Placement", heading: "Spanning, Rendered",
      img: `${IMG}/grid-span-demo.png` },

    { type: "code", kicker: "Grid Placement", heading: "Named Grid Areas",
      code: '.page {\n  grid-template-areas:\n    "header header"\n    "sidebar main"\n    "footer footer";\n}\n.header { grid-area: header; }',
      note: "Naming areas makes a whole-page layout genuinely readable straight from the CSS." },

    { type: "image", kicker: "Grid Placement", heading: "Named Areas, Rendered",
      img: `${IMG}/named-grid-areas.png` },

    { type: "table", kicker: "Decision Time", heading: "Choosing Flexbox vs. Grid",
      header: ["", "Flexbox", "Grid"], colW: [2.6, 4.9, 4.9], leftCol: 0, rowH: 0.85,
      rows: [
        ["Dimensions", "One-dimensional (a row OR a column)", "Two-dimensional (rows AND columns)"],
        ["Best for", "Nav bars, button groups, aligning items", "Whole-page layouts, photo galleries"],
        ["Item placement", "Items flow in order", "Items placed at exact grid cells"],
      ] },

    { type: "callout", kicker: "Decision Time", heading: "The Simple Rule of Thumb", kind: "tip", h: 1.9,
      text: "Arranging things in ONE direction (a row of buttons, a horizontal menu)? Reach for Flexbox. Need to control rows AND columns together (an overall page layout, a gallery)? Reach for Grid. In real projects you'll use both together constantly." },

    { type: "code", kicker: "Using Both Together", heading: "Grid for Skeleton, Flexbox Inside It",
      code: '.page {\n  display: grid;\n  grid-template-columns: 220px 1fr;\n  grid-template-areas: "sidebar main";\n}\n.header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}' },

    { type: "image", kicker: "Using Both Together", heading: "Grid + Flexbox, Rendered",
      img: `${IMG}/flex-grid-together.png` },

    { type: "closing", heading: "Lecture 9 in Six Points", items: [
      "Flexbox lays out items along a main axis and a cross axis, one dimension at a time.",
      "justify-content aligns along the main axis; align-items aligns along the cross axis — together they center anything.",
      "flex-grow/shrink/basis control how items expand, shrink, and start sized within the available space.",
      "CSS Grid lays out rows AND columns together; the fr unit distributes remaining space as flexible fractions.",
      "Grid items can be placed on exact lines, span multiple cells, or use named grid-template-areas for a readable layout.",
      "Use Flexbox for one-dimensional alignment; use Grid for the overall page skeleton — and combine both in real projects.",
    ] },
  ],
});
