const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-13";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 13: DOM Manipulation and Event Handling",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-13-DOM-Manipulation-and-Events.pptx",
  slides: [
    { type: "title", lectureNo: 13, heading: "DOM Manipulation\nand Event Handling",
      sub: "How JavaScript reads, changes, and reacts to the structure of a web page — the engine behind every interactive site." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "What the DOM tree, nodes, and the document object actually are",
      "Selecting elements with getElementById, querySelector, and querySelectorAll",
      "Creating, updating, and removing elements",
      "Working with classList and inline styles",
      "Handling events with addEventListener and the event object",
      "Event bubbling, capturing, delegation, preventDefault, and stopPropagation",
    ] },

    { type: "code", kicker: "The DOM", heading: "A Page, Before It Becomes a Tree",
      code: "<!DOCTYPE html>\n<html>\n  <body>\n    <h1>My Page</h1>\n    <p>Hello <strong>world</strong></p>\n  </body>\n</html>",
      note: "The DOM (Document Object Model) is a live, in-memory, tree-shaped representation of this HTML that the browser builds after parsing it." },

    { type: "diagram", kicker: "The DOM", heading: "Every Tag Becomes a Node",
      nodes: [
        { x: 5.4, y: 2.25, w: 2.4, h: 0.55, text: "document", fill: "1E1E4C", fontSize: 12.5 },
        { x: 5.4, y: 3.15, w: 2.4, h: 0.55, text: "html", fill: "2B2B7A", fontSize: 12.5 },
        { x: 5.4, y: 4.05, w: 2.4, h: 0.55, text: "body", fill: "2B2B7A", fontSize: 12.5 },
        { x: 2.6, y: 4.95, w: 2.6, h: 0.55, text: "h1: 'My Page'", fill: "3A3A78", fontSize: 11.5 },
        { x: 6.6, y: 4.95, w: 1.8, h: 0.55, text: "p", fill: "3A3A78", fontSize: 12 },
        { x: 5.55, y: 5.85, w: 2.6, h: 0.55, text: "Text: 'Hello '", fill: "FF8A3D", fontSize: 11, textColor: "1E1E4C" },
        { x: 8.55, y: 5.85, w: 2.6, h: 0.55, text: "strong: 'world'", fill: "FF8A3D", fontSize: 11, textColor: "1E1E4C" },
      ],
      edges: [
        { x1: 6.6, y1: 2.8, x2: 6.6, y2: 3.15 },
        { x1: 6.6, y1: 3.7, x2: 6.6, y2: 4.05 },
        { x1: 6.4, y1: 4.6, x2: 3.9, y2: 4.95 },
        { x1: 6.9, y1: 4.6, x2: 7.5, y2: 4.95 },
        { x1: 7.3, y1: 5.5, x2: 6.85, y2: 5.85 },
        { x1: 7.6, y1: 5.5, x2: 9.85, y2: 5.85 },
      ],
      caption: "Node: any single item in the tree. Element: a node representing an HTML tag. body is the PARENT of h1 and p; h1 and p are SIBLINGS." },

    { type: "callout", kicker: "The DOM", heading: "The DOM Is Not the Same as Your HTML File", kind: "note", h: 2.0,
      text: "The DOM is what the browser builds from your HTML -- and JavaScript can change it after the fact. \"View Page Source\" shows the original file; \"Inspect Element\" (DevTools) shows the CURRENT DOM, which may look very different after scripts have run." },

    { type: "code", kicker: "Selecting Elements", heading: "getElementById and querySelector",
      code: '// By id -- a single element, or null if not found\nconst title = document.getElementById("main-title");\n\n// By CSS selector -- the FIRST matching element, or null\nconst firstButton = document.querySelector(".btn");\nconst firstInput = document.querySelector("input[type=\'email\']");\n\n// By CSS selector -- ALL matching elements, as a NodeList\nconst allButtons = document.querySelectorAll(".btn");',
      note: "querySelector/querySelectorAll accept ANY valid CSS selector -- by class, tag, attribute, or combinations -- far more flexible than getElementById." },

    { type: "code", kicker: "Selecting Elements", heading: "NodeList Supports forEach",
      code: 'allButtons.forEach(btn => console.log(btn.textContent));' },

    { type: "callout", kicker: "Selecting Elements", heading: "A NodeList Is Not an Array", kind: "tip", h: 1.7,
      text: "A NodeList supports forEach, but not map or filter directly. Convert it first if you need those: Array.from(allButtons) or [...allButtons]." },

    { type: "codeImageSide", kicker: "Creating Nodes", heading: "Creating and Inserting Elements",
      code: 'const newItem =\n  document.createElement("li");\nnewItem.textContent = "New task";\n\nconst list =\n  document.querySelector("#task-list");\nlist.appendChild(newItem);\n// list.prepend(newItem);\n// list.insertBefore(newItem,\n//   list.children[1]);',
      img: `${IMG}/dom-insert-demo.png` },

    { type: "code", kicker: "Updating Nodes", heading: "Updating Content and Attributes",
      code: 'const heading = document.querySelector("h1");\nheading.textContent = "Updated Title";      // sets plain text (safe)\nheading.innerHTML = "<em>Updated</em> Title"; // parses the string AS HTML\n\nconst link = document.querySelector("a");\nlink.setAttribute("href", "https://example.com");\nconsole.log(link.getAttribute("href"));\nlink.removeAttribute("target");' },

    { type: "callout", kicker: "Updating Nodes", heading: "innerHTML and Security (XSS)", kind: "warning", h: 2.2,
      text: "innerHTML parses whatever string you give it as real HTML. If that string comes from user input and you insert it with innerHTML, a malicious user could inject a <script> tag -- this is Cross-Site Scripting (XSS). Prefer textContent unless you specifically need to insert markup." },

    { type: "code", kicker: "Removing Nodes", heading: "Removing an Element",
      code: 'const item = document.querySelector("#task-3");\nitem.remove(); // modern, simplest way\n\n// Older way, still seen in existing code:\nitem.parentNode.removeChild(item);' },

    { type: "codeImageSide", kicker: "classList", heading: "classList vs. Raw Style Strings",
      code: 'const box =\n  document.querySelector(".box");\n\nbox.classList.add("highlighted");\nbox.classList.remove("hidden");\nbox.classList.toggle("active");\nbox.classList.contains("active");\n// true or false',
      img: `${IMG}/dom-classlist-demo.png` },

    { type: "code", kicker: "Inline Styles", heading: "Setting Individual CSS Properties",
      code: 'box.style.backgroundColor = "yellow";\nbox.style.display = "none";\nbox.style.fontSize = "18px";',
      note: "The style property writes INLINE styles -- CSS applied directly on the element, with the highest priority." },

    { type: "callout", kicker: "Inline Styles", heading: "Prefer classList Over style", kind: "tip", h: 1.9,
      text: "Toggling a class keeps \"what it should look like\" (CSS) separate from \"when it should look that way\" (JavaScript), and it's easier to change the look later without touching your script." },

    { type: "code", kicker: "Events", heading: "addEventListener",
      code: 'const button = document.querySelector("#save-btn");\n\nbutton.addEventListener("click", function () {\n  console.log("Button was clicked!");\n});\n\n// Arrow function version\nbutton.addEventListener("click", () => console.log("Clicked!"));\n\nfunction handleClick() { console.log("Handled once"); }\nbutton.addEventListener("click", handleClick);\nbutton.removeEventListener("click", handleClick); // same function reference',
      note: "addEventListener is preferred over onclick=... because it allows MULTIPLE listeners on the same event, and a specific one can be removed later." },

    { type: "code", kicker: "Events", heading: "The Event Object",
      code: 'document.querySelector("input").addEventListener("keydown", (event) => {\n  console.log(event.key);    // which key was pressed, e.g. "Enter"\n  console.log(event.target); // the exact element the event happened on\n  console.log(event.type);   // "keydown"\n});\n\ndocument.querySelector("form").addEventListener("submit", (event) => {\n  event.preventDefault(); // stop the page reload\n  console.log("Form data captured without reloading the page");\n});' },

    { type: "table", kicker: "Events", heading: "Common Events You Will Use Constantly",
      header: ["Category", "Events"], colW: [3.6, 8.4], leftCol: 0, rowH: 0.75,
      rows: [
        ["Mouse / pointer", "click, mouseover, mouseout"],
        ["Keyboard", "keydown, keyup"],
        ["Forms", "submit, input, change"],
        ["Page lifecycle", "load, DOMContentLoaded"],
      ] },

    { type: "diagram", kicker: "Bubbling & Capturing", heading: "Two Phases of Every Event",
      nodes: [
        { x: 1.0, y: 2.35, w: 4.8, h: 0.45, text: "1. Capturing (top to bottom)", fill: "1E1E4C", fontSize: 12, bold: true },
        { x: 1.0, y: 3.0, w: 1.05, h: 0.65, text: "document", fill: "2B2B7A", fontSize: 10.5 },
        { x: 2.25, y: 3.0, w: 0.85, h: 0.65, text: "body", fill: "2B2B7A", fontSize: 10.5 },
        { x: 3.3, y: 3.0, w: 0.75, h: 0.65, text: "ul", fill: "2B2B7A", fontSize: 10.5 },
        { x: 4.25, y: 3.0, w: 1.55, h: 0.65, text: "li (target)", fill: "FF8A3D", fontSize: 10.5, textColor: "1E1E4C" },

        { x: 1.0, y: 4.6, w: 4.8, h: 0.45, text: "2. Bubbling (bottom to top)", fill: "1E1E4C", fontSize: 12, bold: true },
        { x: 1.0, y: 5.25, w: 1.55, h: 0.65, text: "li (target)", fill: "FF8A3D", fontSize: 10.5, textColor: "1E1E4C" },
        { x: 2.75, y: 5.25, w: 0.75, h: 0.65, text: "ul", fill: "2B2B7A", fontSize: 10.5 },
        { x: 3.7, y: 5.25, w: 0.85, h: 0.65, text: "body", fill: "2B2B7A", fontSize: 10.5 },
        { x: 4.75, y: 5.25, w: 1.05, h: 0.65, text: "document", fill: "2B2B7A", fontSize: 10.5 },
      ],
      edges: [
        { x1: 2.05, y1: 3.32, x2: 2.25, y2: 3.32 },
        { x1: 3.1, y1: 3.32, x2: 3.3, y2: 3.32 },
        { x1: 4.05, y1: 3.32, x2: 4.25, y2: 3.32 },
        { x1: 2.55, y1: 5.57, x2: 2.75, y2: 5.57 },
        { x1: 3.5, y1: 5.57, x2: 3.7, y2: 5.57 },
        { x1: 4.55, y1: 5.57, x2: 4.75, y2: 5.57 },
      ],
      caption: "By default, addEventListener listens during the BUBBLING phase. Pass true as a third argument to listen during capturing instead." },

    { type: "code", kicker: "Event Delegation", heading: "One Listener, Many Children",
      code: 'const list = document.querySelector("#task-list");\n\n// One listener on the parent handles clicks on ANY current or future <li>\nlist.addEventListener("click", (event) => {\n  if (event.target.tagName === "LI") {\n    event.target.classList.toggle("done");\n  }\n});',
      note: "event.target is the specific element clicked; event.currentTarget is the element the listener is attached to (list itself)." },

    { type: "codeImageSide", kicker: "Event Delegation", heading: "Event Delegation, Rendered",
      code: 'list.addEventListener("click",\n  (event) => {\n  if (event.target.tagName ===\n      "LI") {\n    event.target.classList\n      .toggle("done");\n  }\n});',
      img: `${IMG}/dom-delegation-demo.png` },

    { type: "callout", kicker: "Event Delegation", heading: "Why Event Delegation Matters", kind: "tip", h: 1.9,
      text: "If you add 100 new <li> items after the page loads, a delegated listener on the parent <ul> automatically handles clicks on all of them -- no need to attach or re-attach 100 separate listeners." },

    { type: "code", kicker: "preventDefault / stopPropagation", heading: "Two Very Different Methods",
      code: 'document.querySelector("a.disabled-link").addEventListener("click", (event) => {\n  event.preventDefault(); // the link will NOT navigate anywhere\n});\n\ndocument.querySelector(".dropdown-toggle").addEventListener("click", (event) => {\n  event.stopPropagation(); // won\'t also trigger a parent\'s listener\n});',
      note: "preventDefault() stops the browser's default behavior. stopPropagation() stops the event from continuing to bubble/capture." },

    { type: "callout", kicker: "preventDefault / stopPropagation", heading: "Don't Confuse the Two", kind: "warning", h: 1.9,
      text: "preventDefault() cancels what the browser would have done. stopPropagation() cancels the event from reaching other listeners further up (or down) the tree. A single handler can call both when needed." },

    { type: "closing", heading: "Lecture 13 in Seven Points", items: [
      "The DOM is a live, tree-shaped, in-memory representation of the page; document is your entry point into it.",
      "getElementById selects by id; querySelector/querySelectorAll select by any CSS selector and are more flexible.",
      "Prefer textContent over innerHTML unless you specifically need to insert HTML, to avoid XSS security risks.",
      "classList.add/remove/toggle/contains is the preferred way to change appearance; reserve direct style for one-off values.",
      "addEventListener registers handlers and supports multiple listeners per event; every handler receives an event object.",
      "Events bubble up (and can capture down) the DOM tree -- this enables event delegation, one listener for many children.",
      "preventDefault() stops the browser's default action; stopPropagation() stops the event reaching other listeners.",
    ] },
  ],
});
