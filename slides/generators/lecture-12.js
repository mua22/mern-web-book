const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-12";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 12: Array Methods and Data Processing",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-12-Array-Methods-and-Processing.pptx",
  slides: [
    { type: "title", lectureNo: 12, heading: "Array Methods\nand Processing",
      sub: "Saying what you want done to a list, not how to loop through it — the highest-leverage skill for the rest of this course." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Iterating over arrays with forEach and for...of",
      "Transforming with map, selecting with filter, aggregating with reduce",
      "Searching and testing with find, some, and every, and ordering with sort",
      "Frequently used string and object methods",
      "Method chaining — expressing a data pipeline in one readable expression",
      "Writing in an immutable, functional style, and avoiding common mutation mistakes",
    ] },

    { type: "code", kicker: "Iteration", heading: "forEach",
      code: 'const fruits = ["apple", "banana", "cherry"];\n\nfruits.forEach((fruit, index) => {\n  console.log(`${index}: ${fruit}`);\n});\n// 0: apple\n// 1: banana\n// 2: cherry',
      note: "forEach runs a function once per element. It always returns undefined -- use it purely for side effects, like logging." },

    { type: "code", kicker: "Iteration", heading: "for...of",
      code: 'for (const fruit of fruits) {\n  if (fruit === "banana") continue;\n  console.log(fruit);\n}',
      note: "for...of is a loop construct (not a method) that iterates over the VALUES of any iterable, and supports break/continue, unlike forEach." },

    { type: "callout", kicker: "Iteration", heading: "for...in vs. for...of", kind: "note", h: 1.7,
      text: "for...in iterates over an object's KEYS (or an array's indexes) and is generally used for plain objects. for...of iterates over VALUES and is generally preferred for arrays. Mixing them up is a common source of bugs." },

    { type: "code", kicker: "Transformation", heading: "map -- Same Length In, Same Length Out",
      code: 'const prices = [100, 200, 300];\nconst withTax = prices.map(price => price * 1.15);\nconsole.log(withTax); // [115, 230, 345]\nconsole.log(prices);  // [100, 200, 300] -- original untouched',
      note: "map creates a NEW array by applying a function to every element -- ideal for converting every item into something else." },

    { type: "code", kicker: "Selection", heading: "filter -- Keep Only What Matches",
      code: 'const numbers = [1, 2, 3, 4, 5, 6];\nconst evens = numbers.filter(n => n % 2 === 0);\nconsole.log(evens); // [2, 4, 6]',
      note: "filter creates a NEW array with only the elements for which the function returns true -- the result can be shorter than the original." },

    { type: "code", kicker: "Aggregation", heading: "reduce -- Boil It Down to One Value",
      code: 'const cart = [10, 20, 30];\nconst total = cart.reduce((accumulator, price) => accumulator + price, 0);\nconsole.log(total); // 60',
      note: "reduce takes the combining function and an INITIAL VALUE for the accumulator -- here, 0." },

    { type: "table", kicker: "Aggregation", heading: "Walking Through reduce, Step by Step",
      header: ["Step", "accumulator", "currentValue", "returns"], colW: [2.0, 3.4, 3.5, 3.5], leftCol: 0,
      rows: [
        ["1", "0", "10", "10"],
        ["2", "10", "20", "30"],
        ["3", "30", "30", "60"],
      ] },

    { type: "code", kicker: "Aggregation", heading: "reduce Can Build Objects Too",
      code: 'const words = ["cat", "dog", "cat", "bird", "dog", "cat"];\nconst counts = words.reduce((acc, word) => {\n  acc[word] = (acc[word] || 0) + 1;\n  return acc;\n}, {});\nconsole.log(counts); // { cat: 3, dog: 2, bird: 1 }',
      note: "reduce is more powerful than it looks -- you can use it to count occurrences, or even implement map/filter yourself." },

    { type: "code", kicker: "Searching", heading: "find, some, and every",
      code: 'const users = [\n  { id: 1, name: "Ali", active: true },\n  { id: 2, name: "Sara", active: false },\n  { id: 3, name: "Bilal", active: true },\n];\n\nusers.find(u => u.id === 2);          // { id: 2, name: "Sara", ... }\nusers.some(u => u.active === false);  // true -- AT LEAST ONE matches\nusers.every(u => u.active === true);  // false -- not ALL match',
      note: "find returns the FIRST matching element (or undefined); some/every return booleans." },

    { type: "code", kicker: "Ordering", heading: "sort -- Mutates in Place",
      code: 'const nums = [40, 1, 5, 200];\nconsole.log(nums.sort());               // [1, 200, 40, 5] -- WRONG (strings!)\nconsole.log(nums.sort((a, b) => a - b)); // [1, 5, 40, 200] -- ascending\nconsole.log(nums.sort((a, b) => b - a)); // [200, 40, 5, 1] -- descending',
      note: "Without a comparison function, sort converts elements to strings first. (a,b)=>a-b is negative when a comes first, positive when b comes first." },

    { type: "callout", kicker: "Ordering", heading: "sort Mutates the Array", kind: "warning", h: 1.9,
      text: "Unlike map and filter, sort (and also reverse, push, pop, splice) change the original array instead of returning a new one. If you need to keep the original order intact, sort a copy: [...nums].sort((a, b) => a - b)." },

    { type: "code", kicker: "Strings & Objects", heading: "Frequently Used String Methods",
      code: 'const text = "  Hello, World!  ";\ntext.trim();               // "Hello, World!"\ntext.toLowerCase();        // "  hello, world!  "\ntext.includes("World");    // true\ntext.trim().split(", ");   // ["Hello", "World!"]\n"5".padStart(3, "0");      // "005"\n`Hi ${"Ali"}`.slice(0, 2); // "Hi"' },

    { type: "code", kicker: "Strings & Objects", heading: "Frequently Used Object Methods",
      code: 'const person = { name: "Ayesha", age: 22 };\nObject.keys(person);   // ["name", "age"]\nObject.values(person); // ["Ayesha", 22]\nObject.entries(person); // [["name","Ayesha"], ["age",22]]\n\nconst merged = Object.assign({}, person, { age: 23 });\nconsole.log(merged); // { name: "Ayesha", age: 23 } -- person unchanged' },

    { type: "code", kicker: "Method Chaining", heading: "One Readable Multi-Step Pipeline",
      code: 'const orders = [\n  { item: "Book", price: 20, qty: 2 },\n  { item: "Pen", price: 2, qty: 10 },\n  { item: "Laptop", price: 800, qty: 1 },\n];\n\nconst totalForExpensiveItems = orders\n  .filter(order => order.price > 5)              // keep Book, Laptop\n  .map(order => order.price * order.qty)          // [40, 800]\n  .reduce((sum, lineTotal) => sum + lineTotal, 0); // 840',
      note: "Because map, filter, and similar methods return NEW arrays, you can call another array method directly on the result." },

    { type: "flow", kicker: "Method Chaining", heading: "The Pipeline, Step by Step",
      steps: [
        { label: "orders array\n(3 items)" },
        { label: "filter\nprice > 5\n[Book, Laptop]" },
        { label: "map\nprice * qty\n[40, 800]" },
        { label: "reduce\nsum\n840" },
      ],
      caption: "Each stage takes the previous stage's output array as its input -- filter narrows the list, map transforms it, reduce collapses it to one number." },

    { type: "callout", kicker: "Method Chaining", heading: "Read Chains Top to Bottom", kind: "tip", h: 1.7,
      text: "When a chain gets long, put each method call on its own line. It reads like a numbered list of steps, and makes it much easier to see which step introduced a bug." },

    { type: "code", kicker: "Immutability", heading: "Mutating vs. Immutable Style",
      code: '// Mutating (avoid)\nfunction addItemMutating(cart, item) {\n  cart.push(item); // changes the original array\n  return cart;\n}\n\n// Immutable (prefer)\nfunction addItemImmutable(cart, item) {\n  return [...cart, item]; // returns a brand-new array\n}\n\nconst cart = ["Book"];\nconst newCart = addItemImmutable(cart, "Pen");\nconsole.log(cart);    // ["Book"] -- untouched\nconsole.log(newCart); // ["Book", "Pen"]' },

    { type: "code", kicker: "Immutability", heading: "The Same Idea for Objects",
      code: 'const settings = { theme: "light", fontSize: 14 };\nconst updated = { ...settings, theme: "dark" }; // new object, settings unchanged',
      note: "map, filter, and reduce are all immutable by nature -- they never touch the original array. This is required by frameworks like React, which detect changes by comparing old and new data." },

    { type: "table", kicker: "Common Mistakes", heading: "Methods That Mutate vs. Methods That Don't",
      header: ["Mutates the original array", "Returns a new array, leaves original alone"], colW: [5.8, 6.2], rowH: 0.85,
      rows: [
        ["push, pop, shift, unshift", "map, filter, slice, concat"],
        ["splice", "reduce (usually)"],
        ["sort, reverse", "spread ([...arr])"],
      ],
      note: "Mixing these two columns up is one of the most common sources of bugs in JavaScript array code." },

    { type: "code", kicker: "Common Mistakes", heading: "Three More Frequent Mistakes",
      code: '// 1. forEach always returns undefined\nconst doubled = [1, 2, 3].forEach(n => n * 2); // WRONG -- use map\n\n// 2. Missing initial value in reduce on an empty array\nconst empty = [];\n// empty.reduce((a, b) => a + b); // TypeError!\nconst safe = empty.reduce((a, b) => a + b, 0); // 0 -- safe\n\n// 3. == instead of === inside filter/find callbacks\nconst strNums = ["1", "2", "3"];\nstrNums.filter(n => n === 2); // [] -- "2" !== 2 (types differ)' },

    { type: "closing", heading: "Lecture 12 in Seven Points", items: [
      "Use forEach or for...of to just walk through an array; use map, filter, and reduce to produce a new value.",
      "map transforms every element (same length in/out); filter selects a subset; reduce combines it all into one result.",
      "find returns the first match (or undefined); some/every return booleans about whether any/all elements match.",
      "sort (like push, splice, and reverse) mutates the original array -- copy first with [...arr] to keep the original order.",
      "Method chaining expresses multi-step data pipelines clearly, but put each call on its own line once a chain gets long.",
      "Prefer an immutable, functional style -- return new arrays/objects instead of mutating existing ones, especially for React.",
      "Always pass an initial value to reduce to avoid a runtime error on empty arrays.",
    ] },
  ],
});
