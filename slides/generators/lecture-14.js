const { buildDeck } = require("./deckBuilder");
const IMG = "D:/GitHub/mern-web-book/docs/assets/img/lecture-14";

buildDeck({
  subject: "CSC336 Web Technologies",
  title: "Lecture 14: Regular Expressions and JSON",
  outFile: "D:/GitHub/mern-web-book/slides/CSC336-Lecture-14-Regular-Expressions-and-JSON.pptx",
  slides: [
    { type: "title", lectureNo: 14, heading: "Regular Expressions\nand JSON",
      sub: "Checking that user input has the right shape, and exchanging structured data with a server — two skills every real project needs." },

    { type: "agenda", kicker: "Overview", heading: "In This Lecture", items: [
      "Regex syntax: literals, character classes, quantifiers, and anchors",
      "Groups, alternation, backreferences, and flags (g, i, m)",
      "JavaScript's regex methods: test, exec, match, replace, split",
      "Validating and parsing form data with regex",
      "JSON syntax, and converting with JSON.stringify and JSON.parse",
    ] },

    { type: "code", kicker: "Regex Basics", heading: "What Is a Regular Expression?",
      code: 'const pattern = /hello/;\nconsole.log(pattern.test("hello world")); // true\nconsole.log(pattern.test("goodbye"));      // false\n\n// Dynamic pattern from a variable\nconst word = "hello";\nconst dynamicPattern = new RegExp(word);',
      note: "A regex describes a set of strings -- use it to test a shape, find matches, or replace parts of a string." },

    { type: "code", kicker: "Regex Syntax", heading: "Literals and Character Classes",
      code: '/cat/       // matches the exact text "cat"\n\n/[abc]/     // a single "a", "b", or "c"\n/[a-z]/     // any single lowercase letter (a range)\n/[0-9]/     // any single digit\n/[^0-9]/    // ^ inside [] means NOT a digit\n\n/\\d/  /\\D/  // digit / non-digit       -- same as [0-9]\n/\\w/  /\\W/  // word char / non-word    -- same as [A-Za-z0-9_]\n/\\s/  /\\S/  // whitespace / non-whitespace\n/./         // any character except a newline' },

    { type: "code", kicker: "Regex Syntax", heading: "Quantifiers -- How Many Times",
      code: '/a*/     // 0 or more "a"s\n/a+/     // 1 or more "a"s\n/a?/     // 0 or 1 "a" (optional)\n/a{3}/   // exactly 3 "a"s\n/a{2,4}/ // between 2 and 4 "a"s\n/a{2,}/  // 2 or more "a"s' },

    { type: "code", kicker: "Regex Syntax", heading: "Anchors -- Positions, Not Characters",
      code: '/^Hello/       // ^ = "start of string"\n/world$/       // $ = "end of string"\n/^Hello world$/ // must match the ENTIRE string exactly\n/\\bcat\\b/      // \\b = word boundary -- matches "cat" not "concatenate"' },

    { type: "code", kicker: "Groups & Alternation", heading: "Groups, Alternation, Backreferences",
      code: '// Groups -- apply a quantifier to more than one char\n/(ab)+/.test("ababab"); // true -- "ab" repeated 1+ times\n\n// Alternation -- "or"\n/cat|dog/.test("I have a dog"); // true\n\n// Backreference -- \\1 refers back to group 1\n/(\\w+)\\s\\1/.test("hello hello"); // true -- repeated word\n/(\\w+)\\s\\1/.test("hello world"); // false -- different words' },

    { type: "table", kicker: "Flags", heading: "Flags Change How the Whole Regex Behaves",
      header: ["Flag", "Meaning"], colW: [2.4, 9.6], leftCol: 0, rowH: 0.7,
      rows: [
        ["g", "Global -- find ALL matches, not just the first"],
        ["i", "Case-insensitive matching"],
        ["m", "Multiline -- ^ and $ match the start/end of each line"],
      ] },

    { type: "code", kicker: "Flags", heading: "Flags in Practice",
      code: 'const text = "Cat cat CAT";\nconsole.log(text.match(/cat/gi)); // ["Cat", "cat", "CAT"]' },

    { type: "code", kicker: "Regex Methods", heading: "test() and exec()",
      code: '// test() -- returns true/false, called on the regex\nconst hasDigit = /\\d/;\nconsole.log(hasDigit.test("abc123")); // true\n\n// exec() -- returns match details, called on the regex\nconst dateRegex = /(\\d{4})-(\\d{2})-(\\d{2})/;\nconst result = dateRegex.exec("Event date: 2026-09-05");\nconsole.log(result[0]); // "2026-09-05" -- full match\nconsole.log(result[1]); // "2026" -- first group' },

    { type: "code", kicker: "Regex Methods", heading: "match() -- a String Method",
      code: 'const text = "Call 123-456-7890 or 987-654-3210";\nconsole.log(text.match(/\\d{3}-\\d{3}-\\d{4}/g));\n// ["123-456-7890", "987-654-3210"]',
      note: "match() and matchAll() are called ON THE STRING, with the regex as the argument -- the opposite of test()/exec()." },

    { type: "code", kicker: "Regex Methods", heading: "replace() and split()",
      code: 'const messy = "hello   world    there";\nconsole.log(messy.replace(/\\s+/g, " ")); // "hello world there"\n\n// Captured groups in the replacement, with $1, $2, ...\nconst date = "2026-09-05";\nconsole.log(date.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, "$3/$2/$1")); // "05/09/2026"\n\nconst csvLine = "Ali, Sara,  Bilal";\nconsole.log(csvLine.split(/,\\s*/)); // ["Ali", "Sara", "Bilal"]' },

    { type: "code", kicker: "Form Validation", heading: "Validating an Email and a Password",
      code: 'function isValidEmail(email) {\n  const emailRegex = /^[\\w.+-]+@[\\w-]+\\.[a-zA-Z]{2,}$/;\n  return emailRegex.test(email);\n}\nisValidEmail("student@comsats.edu.pk"); // true\nisValidEmail("not-an-email");           // false\n\nfunction isStrongPassword(password) {\n  // 8+ chars, one uppercase, one lowercase, one digit\n  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;\n  return strongRegex.test(password);\n}\nisStrongPassword("Abcdefg1"); // true\nisStrongPassword("abcdefgh"); // false -- no uppercase, no digit' },

    { type: "code", kicker: "Form Validation", heading: "Validating a Phone Number",
      code: 'function isValidPakPhone(phone) {\n  // e.g. 0300-1234567\n  return /^03\\d{2}-\\d{7}$/.test(phone);\n}\nconsole.log(isValidPakPhone("0300-1234567")); // true' },

    { type: "callout", kicker: "Form Validation", heading: "Regex Validates Shape, Not Truth", kind: "warning", h: 2.0,
      text: "A regex can confirm that student@comsats.edu.pk LOOKS LIKE an email address, but it cannot confirm the mailbox actually exists. Always pair client-side shape validation with real server-side verification for anything important." },

    { type: "callout", kicker: "Form Validation", heading: "Test Your Regex Interactively", kind: "tip", h: 1.6,
      text: "Tools like regex101.com let you build and test a pattern against sample strings with live highlighting -- extremely useful while you're still learning the syntax." },

    { type: "code", kicker: "JSON", heading: "JavaScript Object Notation",
      code: '{\n  "name": "Ayesha",\n  "age": 22,\n  "isStudent": true,\n  "courses": ["Web Technologies", "Databases"],\n  "address": { "city": "Lahore", "zip": "54000" },\n  "graduationYear": null\n}',
      note: "JSON looks like a JS object literal, but is a strict, language-independent format for exchanging data between any two systems." },

    { type: "bullets", kicker: "JSON", heading: "JSON's Stricter Syntax Rules", items: [
      "Keys must be double-quoted strings -- \"name\", never name or 'name'",
      "String values must also use double quotes, not single quotes",
      "Allowed value types: string, number, boolean, null, object, or array",
      "No trailing commas, and no comments are allowed anywhere in JSON",
      "No functions, undefined, or dates -- JSON only represents plain data",
    ] },

    { type: "flow", kicker: "JSON", heading: "Object <-> JSON Text, Round Trip",
      steps: [
        { label: "JS object\n(in memory)" },
        { label: "JSON.stringify()\nJSON text" },
        { label: "sent over\nnetwork" },
        { label: "JSON.parse()\nJS object" },
      ],
      caption: "JSON.stringify turns a live JS value into a plain string for the network or a file; JSON.parse turns JSON text back into a usable JS value." },

    { type: "code", kicker: "JSON", heading: "JSON.stringify() -- Object to JSON Text",
      code: 'const student = {\n  name: "Bilal",\n  age: 21,\n  courses: ["Web Technologies", "OOP"],\n};\n\nconst jsonText = JSON.stringify(student);\nconsole.log(jsonText);\n// \'{"name":"Bilal","age":21,"courses":["Web Technologies","OOP"]}\'\n\n// Pretty-print with indentation (useful for debugging)\nconsole.log(JSON.stringify(student, null, 2));' },

    { type: "code", kicker: "JSON", heading: "JSON.parse() -- JSON Text to Object",
      code: 'const jsonText = \'{"name":"Bilal","age":21}\';\nconst obj = JSON.parse(jsonText);\nconsole.log(obj.name);     // "Bilal"\nconsole.log(obj.age + 1);  // 22 -- it\'s a real number, not a string' },

    { type: "callout", kicker: "JSON", heading: "Invalid JSON Throws an Error", kind: "warning", h: 1.6,
      text: "JSON.parse throws a SyntaxError if the string is not valid JSON (single quotes, a trailing comma, etc). Always wrap JSON.parse on external data in a try...catch block." },

    { type: "code", kicker: "JSON", heading: "Handling Bad JSON Safely",
      code: 'try {\n  const data = JSON.parse(someText);\n} catch (error) {\n  console.error("Invalid JSON:", error.message);\n}',
      note: "You will use JSON.stringify/parse constantly once your JavaScript talks to a server through the Fetch API, starting next lecture." },

    { type: "closing", heading: "Lecture 14 in Seven Points", items: [
      "A regex describes text using literals, character classes (\\d, \\w, \\s, [...]), quantifiers, and anchors (^, $, \\b).",
      "Groups () capture parts of a match; | means alternation; backreferences (\\1) refer back to an earlier group.",
      "test() and exec() are regex methods; match(), matchAll(), replace(), and split() are string methods that accept a regex.",
      "Flags g, i, and m change global, case-insensitive, and multiline matching behavior.",
      "Regex validates the SHAPE of input (emails, phone numbers, passwords) but cannot confirm the data is actually true.",
      "JSON is strict: double-quoted keys and strings only, no comments, no trailing commas, no functions.",
      "JSON.stringify converts a JS value to JSON text; JSON.parse converts it back -- always inside a try...catch for external data.",
    ] },
  ],
});
