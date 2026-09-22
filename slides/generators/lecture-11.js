const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-11";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 11: Core JavaScript Concepts (ES6+)",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-11-Core-JavaScript-ES6.pptx",
  slides: [
    { type: "title", lectureNo: 11, heading: "Core JavaScript\nConcepts (ES6+)",
      sub: "Functions, closures, and objects — the rules that make JavaScript feel different from every language you already know." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "JavaScript's role on the web, and how to embed it in a page",
      "var, let, and const — plus primitive vs. reference types",
      "Operators, type coercion, and == vs. ===",
      "Scope, hoisting, and the temporal dead zone",
      "Three ways to write a function, and ES6 parameter/destructuring features",
      "How this is determined, and controlling it with call, apply, bind",
      "Closures — what they are, why they matter, and common pitfalls",
      "Objects, arrays, template literals, and ES6 modules",
    ] },

    { type: "table", kicker: "Foundations", heading: "The Three Layers of a Web Page",
      header: ["Layer", "Language", "Job"], colW: [3.0, 3.0, 6.6], leftCol: 0, rowH: 0.75,
      rows: [
        ["Structure", "HTML", "What content exists on the page"],
        ["Presentation", "CSS", "How the content looks"],
        ["Behavior", "JavaScript", "How the page reacts and changes over time"],
      ],
      note: "JavaScript runs client-side, inside the browser, on the user's own computer — not on the server." },

    { type: "code", kicker: "Embedding JS", heading: "Three Ways to Add JavaScript",
      code: "<!-- 1. Inline: avoid -- hard to maintain -->\n<button onclick=\"alert('Hello!')\">Click me</button>\n\n<!-- 2. Internal: inside a <script> tag -->\n<script>\n  console.log(\"Hello from an internal script\");\n</script>\n\n<!-- 3. External: linked .js file -- the standard approach -->\n<script src=\"app.js\"></script>",
      note: "External scripts keep HTML and JS in separate files, and the browser can cache the .js file across page loads." },

    { type: "code", kicker: "Script Loading", heading: "defer vs. async",
      code: '<script src="app.js" defer></script>\n<script src="analytics.js" async></script>',
      note: "By default a <script> tag stops HTML parsing, downloads, and runs immediately -- defer and async change that." },

    { type: "flow", kicker: "Script Loading", heading: "defer: Downloads in the Background",
      steps: [
        { label: "Browser meets\n<script defer>" },
        { label: "Downloads in\nbackground" },
        { label: "HTML keeps\nparsing" },
        { label: "Runs after\nparsing finishes" },
      ],
      caption: "Multiple defer scripts run in the order they appear. Use defer for scripts that need the DOM to exist -- most of the time." },

    { type: "flow", kicker: "Script Loading", heading: "async: Runs the Moment It Arrives",
      steps: [
        { label: "Browser meets\n<script async>" },
        { label: "Downloads in\nbackground" },
        { label: "Runs immediately\non download" },
        { label: "May interrupt\nHTML parsing" },
      ],
      caption: "Scripts can run out of order. Use async only for independent scripts that don't touch the page, like analytics trackers." },

    { type: "callout", kicker: "Script Loading", heading: "Rule of Thumb", kind: "tip", h: 1.7,
      text: "Put defer on almost every script you write. Reach for async only for scripts that do not depend on the DOM and do not need to run in a specific order." },

    { type: "code", kicker: "Variables", heading: "var, let, and const",
      code: 'var oldStyle = "avoid me";   // function-scoped, redeclarable -- legacy\nlet counter = 0;             // block-scoped, can be reassigned\nconst PI = 3.14159;          // block-scoped, cannot be reassigned',
      note: "Use const by default. Use let when the value must change. Avoid var -- it predates modern JS and has confusing scoping rules." },

    { type: "callout", kicker: "Variables", heading: "const Does Not Mean \"Unchangeable Value\"", kind: "warning", h: 1.5,
      text: "const only prevents reassigning the variable itself. If the value is an object or array, its contents can still be changed." },

    { type: "code", kicker: "Variables", heading: "const Locks the Binding, Not the Contents",
      code: 'const person = { name: "Ali" };\nperson.name = "Sara"; // allowed -- we didn\'t reassign `person`\n// person = {};        // NOT allowed -- this would throw an error' },

    { type: "table", kicker: "Variables", heading: "Primitive vs. Reference Types",
      header: ["", "Primitive types", "Reference types"], colW: [2.6, 5.0, 5.0], leftCol: 0, rowH: 0.85,
      rows: [
        ["Examples", "string, number, boolean, undefined, null, symbol, bigint", "object, array, function"],
        ["Stored as", "The actual value", "A pointer to a location in memory"],
        ["Copied by", "Value (a real, independent copy)", "Reference (both point to the same data)"],
      ] },

    { type: "code", kicker: "Variables", heading: "Copy by Value vs. Copy by Reference",
      code: '// Primitives copy by value\nlet a = 5;\nlet b = a; // b gets its own copy of 5\nb = 10;\nconsole.log(a); // 5 -- unaffected\n\n// Objects copy by reference\nlet obj1 = { value: 5 };\nlet obj2 = obj1; // obj2 points to the SAME object as obj1\nobj2.value = 10;\nconsole.log(obj1.value); // 10 -- obj1 changed too!',
      note: "This distinction explains a huge number of beginner bugs -- keep it in mind whenever you assign one variable to another." },

    { type: "code", kicker: "Operators", heading: "Type Coercion",
      code: 'console.log("5" + 3);    // "53"  -- number coerced to string, then joined\nconsole.log("5" - 3);    // 2     -- string coerced to number\nconsole.log(1 + true);   // 2     -- true coerced to 1\nconsole.log("10" == 10);  // true  -- coercion happens before comparing\nconsole.log("10" === 10); // false -- no coercion, types differ',
      note: "== (\"loose equality\") converts both sides to a common type first. === (\"strict equality\") compares value and type, with no conversion." },

    { type: "callout", kicker: "Operators", heading: "Always Prefer === and !==", kind: "warning", h: 1.7,
      text: "Loose equality produces surprising results (\"\" == 0 is true, null == undefined is true). Using strict equality by default avoids an entire category of bugs." },

    { type: "code", kicker: "Control Flow", heading: "if / else and for",
      code: 'let hour = 14;\nif (hour < 12) {\n  console.log("Good morning");\n} else if (hour < 18) {\n  console.log("Good afternoon");\n} else {\n  console.log("Good evening");\n}\n\nfor (let i = 0; i < 3; i++) {\n  console.log("Iteration", i);\n}' },

    { type: "code", kicker: "Control Flow", heading: "switch",
      code: 'let day = "Mon";\nswitch (day) {\n  case "Sat":\n  case "Sun":\n    console.log("Weekend");\n    break;\n  default:\n    console.log("Weekday");\n}',
      note: "switch compares with === internally, and each case needs a break -- otherwise execution \"falls through\" into the next case." },

    { type: "bullets", kicker: "Scope", heading: "Three Kinds of Scope", items: [
      "Global scope: declared outside any function or block; visible everywhere",
      "Function scope: var is visible anywhere inside the function it was declared in, even inside nested blocks",
      "Block scope: let and const are visible only inside the { } block where they were declared",
    ] },

    { type: "code", kicker: "Scope", heading: "var Leaks Out of a Block; let Does Not",
      code: 'function demo() {\n  if (true) {\n    var fnScoped = "I leak out of the if-block";\n    let blockScoped = "I stay inside the if-block";\n  }\n  console.log(fnScoped);    // works\n  console.log(blockScoped); // ReferenceError\n}' },

    { type: "code", kicker: "Hoisting", heading: "Hoisting and the Temporal Dead Zone",
      code: 'console.log(x); // undefined -- not an error, it\'s "hoisted"\nvar x = 5;\n\nconsole.log(y); // ReferenceError: Cannot access \'y\' before initialization\nlet y = 5;',
      note: "var is hoisted and initialized with undefined. let/const are hoisted but NOT initialized -- the gap is the temporal dead zone (TDZ)." },

    { type: "callout", kicker: "Hoisting", heading: "Why the TDZ Is a Good Thing", kind: "note", h: 1.7,
      text: "The TDZ turns a silent bug (accidentally using a variable before it has a real value) into a loud, immediate error, which makes mistakes far easier to catch." },

    { type: "code", kicker: "Functions", heading: "Three Ways to Write a Function",
      code: '// 1. Function declaration -- hoisted, callable before it appears\nfunction add(a, b) {\n  return a + b;\n}\n\n// 2. Function expression -- NOT hoisted the same way\nconst subtract = function (a, b) {\n  return a - b;\n};\n\n// 3. Arrow function -- shorter, ES6 (2015)\nconst multiply = (a, b) => { return a * b; };\nconst square = x => x * x; // single-expression shortcut' },

    { type: "callout", kicker: "Functions", heading: "Which One Should You Use?", kind: "tip", h: 1.7,
      text: "Use function declarations for top-level, named functions -- they are easy to read and are hoisted. Use arrow functions for short, inline callbacks." },

    { type: "code", kicker: "ES6 Parameters", heading: "Default and Rest Parameters",
      code: 'function greet(name = "Guest") {\n  console.log(`Hello, ${name}!`);\n}\ngreet();         // "Hello, Guest!"\ngreet("Ayesha"); // "Hello, Ayesha!"\n\nfunction sum(...numbers) {\n  return numbers.reduce((total, n) => total + n, 0);\n}\nsum(1, 2, 3, 4); // 10' },

    { type: "code", kicker: "ES6 Parameters", heading: "The Spread Operator",
      code: 'const nums = [1, 2, 3];\nconsole.log(Math.max(...nums)); // same as Math.max(1, 2, 3)\n\nconst arr1 = [1, 2];\nconst arr2 = [3, 4];\nconst combined = [...arr1, ...arr2]; // [1, 2, 3, 4]\n\nconst defaults = { color: "blue", size: "M" };\nconst custom = { ...defaults, size: "L" }; // { color: "blue", size: "L" }' },

    { type: "callout", kicker: "ES6 Parameters", heading: "Rest vs. Spread -- Same Dots, Opposite Direction", kind: "note", h: 1.7,
      text: "Rest gathers many values into one array (used in a function's parameter list). Spread expands one array or object into many values (used when calling a function or building a new array/object)." },

    { type: "code", kicker: "Destructuring", heading: "Unpacking Arrays and Objects",
      code: '// Array destructuring -- position matters\nconst coordinates = [10, 20];\nconst [x, y] = coordinates;\n\n// Object destructuring -- name matters, order doesn\'t\nconst student = { name: "Bilal", age: 21 };\nconst { name, age } = student;\n\n// Renaming and default values while destructuring\nconst { name: studentName, gpa = 0 } = student;' },

    { type: "code", kicker: "this Binding", heading: "this Depends on How You Call It",
      code: 'const car = {\n  brand: "Toyota",\n  describe: function () {\n    console.log(`This is a ${this.brand}`);\n  },\n};\ncar.describe(); // "This is a Toyota" -- called as car.describe()\n\nconst detached = car.describe;\ndetached(); // "This is a undefined" -- `this` is no longer `car`!' },

    { type: "code", kicker: "this Binding", heading: "call, apply, and bind",
      code: 'function describe(city) {\n  console.log(`${this.brand} is from ${city}`);\n}\nconst car = { brand: "Honda" };\n\ndescribe.call(car, "Tokyo");    // pass `this` and args individually\ndescribe.apply(car, ["Tokyo"]); // pass `this` and args as an array\nconst bound = describe.bind(car); // returns a NEW function, `this` locked in\nbound("Tokyo");',
      note: "bind does NOT call the function -- it returns a new function permanently bound to thisArg, useful when passing a method as a callback." },

    { type: "callout", kicker: "this Binding", heading: "Arrow Functions and this", kind: "warning", h: 1.7,
      text: "Arrow functions do not have their own this. Instead they use this from the surrounding (\"lexical\") scope where they were defined -- ideal for callbacks inside methods." },

    { type: "code", kicker: "this Binding", heading: "Why Arrow Callbacks Are Ideal Here",
      code: 'const timer = {\n  seconds: 0,\n  start: function () {\n    setInterval(() => {\n      this.seconds++; // `this` is `timer`, inherited from `start`\n      console.log(this.seconds);\n    }, 1000);\n  },\n};',
      note: "A regular function() here would have its OWN this -- not timer -- and this.seconds++ would fail." },

    { type: "code", kicker: "Closures", heading: "A Function That Remembers",
      code: 'function makeCounter() {\n  let count = 0; // "enclosed" by the returned function\n  return function () {\n    count++;\n    return count;\n  };\n}\n\nconst counter1 = makeCounter();\nconsole.log(counter1()); // 1\nconsole.log(counter1()); // 2\n\nconst counter2 = makeCounter(); // a completely separate `count`\nconsole.log(counter2()); // 1',
      note: "Each call to makeCounter() creates a brand-new count and a brand-new inner function with a private reference to it." },

    { type: "bullets", kicker: "Closures", heading: "Common Uses of Closures", items: [
      "Data privacy: count above cannot be accessed except through the returned function -- a simple form of encapsulation",
      "Function factories: creating specialized functions, like makeCounter above",
      "Callbacks that need context: event handlers and setTimeout callbacks often rely on closures to remember values",
    ] },

    { type: "code", kicker: "Closures", heading: "A Classic Loop Pitfall",
      code: '// BUGGY: prints 3, 3, 3 -- `var` is function-scoped, all three\n// callbacks share the SAME `i`, whose final value is 3.\nfor (var i = 1; i <= 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n\n// FIXED: prints 1, 2, 3 -- `let` creates a NEW `i` per iteration.\nfor (let j = 1; j <= 3; j++) {\n  setTimeout(() => console.log(j), 100);\n}',
      note: "This is one of the strongest practical reasons to prefer let over var." },

    { type: "code", kicker: "Objects & Arrays", heading: "Grouping and Listing Data",
      code: 'const book = {\n  title: "Eloquent JavaScript",\n  year: 2024,\n  tags: ["javascript", "programming"],\n};\nconsole.log(book.title);      // dot notation\nconsole.log(book["year"]);    // bracket notation -- for dynamic keys\nbook.pages = 472;             // add a new property\n\nconst numbers = [10, 20, 30];\nnumbers.push(40);             // add to the end\nconsole.log(numbers.length);  // 4' },

    { type: "code", kicker: "Template Literals", heading: "Backtick Strings",
      code: 'const name = "Hina";\nconst score = 92;\n\n// Old way\nconsole.log("Hello " + name + ", your score is " + score + "%.");\n\n// Template literal\nconsole.log(`Hello ${name}, your score is ${score}%.`);\n\nconst multiLine = `Line one\nLine two`;',
      note: "Template literals embed expressions with ${} and let strings span multiple lines without special characters." },

    { type: "code", kicker: "ES6 Modules", heading: "export and import",
      code: '// mathUtils.js\nexport function add(a, b) { return a + b; }\nexport const PI = 3.14159;\nexport default function multiply(a, b) { return a * b; }\n\n// main.js\nimport multiply, { add, PI } from "./mathUtils.js";\nconsole.log(add(2, 3));      // 5\nconsole.log(multiply(2, 3)); // 6',
      note: "A module's variables and functions are private by default -- you must explicitly export what other files can use." },

    { type: "callout", kicker: "ES6 Modules", heading: "Modules Are Deferred Automatically", kind: "note", h: 1.6,
      text: "Add type=\"module\" to the script tag to use modules in the browser: <script type=\"module\" src=\"main.js\"></script>. Module scripts behave like defer by default -- they don't block HTML parsing." },

    { type: "closing", heading: "Lecture 11 in Seven Points", items: [
      "JavaScript adds behavior to a page; use defer for scripts needing the DOM, async for independent ones.",
      "Prefer const by default, let when reassignment is needed, and avoid var.",
      "Primitives copy by value; objects and arrays copy by reference -- a frequent source of beginner bugs.",
      "Use === / !== instead of == / != to avoid unexpected type coercion.",
      "let/const are block-scoped and sit in the temporal dead zone; var is function-scoped and hoisted as undefined.",
      "this depends on how a function is called; call/apply/bind control it explicitly, arrow functions inherit it lexically.",
      "A closure lets an inner function remember its outer function's variables after that function has returned.",
    ] },
  ],
});
