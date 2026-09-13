const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-08";
const IMG2 = "D:/GitHub/mern-web-book/slides/assets/lecture-08";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 8: CSS3 Features",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-08-CSS3-Features.pptx",
  slides: [
    { type: "title", lectureNo: 8, heading: "CSS3\nFeatures",
      sub: "Rounded corners, gradients, shadows, transforms, and animation — visual polish with pure CSS." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Rounded corners, gradients, shadows, and opacity",
      "2D/3D transforms, transitions, and keyframe animations",
      "Web fonts, icon fonts, and CSS custom properties (variables)",
      "Media queries, feature queries, and cross-browser compatibility",
      "Vendor prefixes, and why compatibility still matters",
    ] },

    { type: "code", kicker: "Shapes", heading: "border-radius",
      code: '.card { border-radius: 12px; }\n.avatar { border-radius: 50%; }  /* a perfect circle */\n.bubble { border-radius: 20px 20px 20px 0; }',
      note: "A pixel value rounds by a fixed amount; a percentage rounds relative to the element's own size." },

    { type: "image", kicker: "Shapes", heading: "border-radius, Rendered",
      img: `${IMG}/border-radius-shapes.png` },

    { type: "code", kicker: "Gradients", heading: "Linear and Radial Gradients",
      code: '.banner    { background: linear-gradient(to right, #4facfe, #00f2fe); }\n.spotlight { background: radial-gradient(circle, #fff, #333); }\n.diagonal  { background: linear-gradient(45deg, orange, red); }' },

    { type: "image", kicker: "Gradients", heading: "Gradients, Rendered",
      img: `${IMG}/gradients-linear-radial-diagonal.png` },

    { type: "codeImage", kicker: "Gradients", heading: "Multiple Color Stops",
      code: '.rainbow {\n  background: linear-gradient(\n    to right,\n    red 0%, yellow 25%, green 50%, blue 75%, violet 100%\n  );\n}',
      img: `${IMG}/gradient-rainbow-stops.png` },

    { type: "codeImage", kicker: "Shadows", heading: "box-shadow on Hover — Live",
      intro: "Genuinely live on the deployed page — shown here at both states.",
      code: '.card {\n  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);\n}\n.card:hover {\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);\n}',
      img: `${IMG2}/shadow-hover.png` },

    { type: "codeImage", kicker: "Shadows", heading: "text-shadow",
      code: "h1 {\n  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);\n}",
      img: `${IMG}/text-shadow-heading.png` },

    { type: "codeImage", kicker: "Shadows", heading: "Multiple Shadows",
      code: "box-shadow: 0 1px 2px #000, 0 0 20px gold;\n/* stack shadows by separating them with commas */",
      img: `${IMG}/multiple-shadows-glow.png` },

    { type: "codeImage", kicker: "Opacity", heading: "opacity",
      intro: "opacity fades EVERYTHING inside, including text; use rgba() for a transparent background with solid text.",
      code: ".faded {\n  opacity: 0.5; /* 50% transparent */\n}",
      img: `${IMG}/opacity-comparison.png` },

    { type: "table", kicker: "Transforms", heading: "2D and 3D Transform Functions",
      header: ["Function", "What It Does"], colW: [4.0, 8.0], leftCol: 0,
      rows: [
        ["translate(x, y) / translateZ(z)", "Moves an element"],
        ["rotate(deg) / rotateX/Y/Z(deg)", "Spins an element"],
        ["scale(n) / scaleX/Y/Z(n)", "Resizes an element"],
        ["skew(deg)", "Slants an element"],
      ] },

    { type: "codeImage", kicker: "Transforms", heading: "2D Transforms, Compared",
      code: '.box  { transform: rotate(15deg); }\n.box2 { transform: scale(1.2); }\n.box3 { transform: translate(50px, 20px); }\n.box4 { transform: skew(10deg, 0deg); }\n.box5 { transform: translate(20px, 0) rotate(10deg) scale(1.1); }',
      img: `${IMG}/transforms-2d-comparison.png` },

    { type: "codeImage", kicker: "Transforms", heading: "A 3D Hover Flip — Live",
      code: '.scene { perspective: 800px; }\n\n.card-3d {\n  transform: rotateY(25deg);\n  transition: transform 0.4s ease;\n}\n.card-3d:hover { transform: rotateY(0deg); }',
      img: `${IMG2}/card3d.png` },

    { type: "codeImage", kicker: "Transitions", heading: "A Smooth Hover Transition — Live",
      code: 'button {\n  background-color: royalblue;\n  transition: background-color 0.3s ease, transform 0.3s ease;\n}\nbutton:hover {\n  background-color: darkblue;\n  transform: scale(1.05);\n}',
      img: `${IMG2}/transition-btn.png` },

    { type: "codeImage", kicker: "Keyframe Animations", heading: "@keyframes — Live and Looping",
      code: '@keyframes bounce {\n  0%   { transform: translateY(0); }\n  50%  { transform: translateY(-20px); }\n  100% { transform: translateY(0); }\n}\n\n.ball { animation: bounce 1s ease-in-out infinite; }',
      img: `${IMG2}/bounce-frames.png` },

    { type: "table", kicker: "Animation", heading: "Timing Functions",
      header: ["Value", "Feel"], colW: [3.0, 9.0], leftCol: 0,
      rows: [
        ["linear", "Constant speed, start to finish — feels mechanical"],
        ["ease (default)", "Starts slow, speeds up, ends slow — the most natural-feeling default"],
        ["ease-in / ease-out", "Slow start only / slow finish only"],
        ["cubic-bezier(...)", "A fully custom easing curve for a specific feel"],
      ] },

    { type: "callout", kicker: "Animation", heading: "transition vs. animation", kind: "tip", h: 1.7,
      text: "Use a transition for simple state changes (hover, focus, a toggled class). Use a keyframe animation for anything that plays on its own, loops, or needs more than a start and end state." },

    { type: "bullets", kicker: "Fonts", heading: "Web Fonts and Icon Fonts", numbered: false, items: [
      "Web fonts (Google Fonts, or @font-face) let every visitor see the exact same typeface",
      "Always end a font-family list with a generic fallback: sans-serif, serif, monospace",
      "Icon fonts let you use icons like text — resizable, colorable — though many projects now prefer inline SVG",
    ] },

    { type: "code", kicker: "Custom Properties", heading: "CSS Variables",
      code: ':root {\n  --main-color: #6c5ce7;\n  --spacing-unit: 8px;\n}\n\n.button {\n  background-color: var(--main-color);\n  padding: calc(var(--spacing-unit) * 2);\n}',
      note: "A live, real value in the browser — change it once in :root and every var(--main-color) usage updates instantly." },

    { type: "image", kicker: "Custom Properties", heading: "One Rule, Two Colors",
      intro: "Nothing changed except the value of --main-color in scope — proof the variable controls the rendered color.",
      img: `${IMG}/custom-properties-demo.png` },

    { type: "bullets", kicker: "Adapting to Devices", heading: "Media and Feature Queries", numbered: false, items: [
      "@media (min-width: 768px) { ... } adapts styles to screen size — the foundation of responsive design",
      "@supports (display: grid) { ... } applies CSS only if the browser actually supports a feature",
      "Both check something real about the current browser before applying their block",
    ] },

    { type: "table", kicker: "Compatibility", heading: "Vendor Prefixes",
      header: ["Prefix", "Browser Engine"], colW: [3.4, 8.6], leftCol: 0,
      rows: [
        ["-webkit-", "Chrome, Safari, newer Edge"],
        ["-moz-", "Firefox"],
        ["-ms-", "old Internet Explorer / Edge"],
        ["-o-", "old Opera"],
      ],
      note: "Always place the unprefixed, standard property LAST — Autoprefixer automates this in real projects." },

    { type: "closing", heading: "Lecture 8 in Six Points", items: [
      "border-radius, gradients, box-shadow/text-shadow, and opacity build modern visual effects with no images.",
      "transform repositions/rotates/resizes without disturbing layout; 3D transforms need perspective on a parent.",
      "transition animates between two states; @keyframes + animation define multi-step, looping animations.",
      "CSS custom properties (--name, read with var(--name)) power theming and dark mode from one place.",
      "Media queries adapt to screen size; feature queries (@supports) adapt to what the browser can render.",
      "Vendor prefixes exist for experimental features — always place the unprefixed property last.",
    ] },
  ],
});
