# JavaScript Syntax & Variables

This chapter covers JavaScript syntax and variables for beginner → intermediate students. It explains how to declare variables, basic data types, scope, hoisting, and common patterns with clear examples and expected output.

---

## 1. JavaScript Basics

- JavaScript statements end with a semicolon (optional in many cases because of ASI — Automatic Semicolon Insertion).
- Whitespace and line breaks are mostly ignored.
- Comments:
  - Single-line: `// comment`
  - Multi-line: `/* comment */`

```js
// single-line comment
/* multi-line
   comment */
```

---

## 2. Declaring Variables: var, let, const

- `var` — function-scoped, hoisted, can be re-declared. (Older style; avoid when possible.)
- `let` — block-scoped, can be reassigned, not hoisted in the same way as `var`.
- `const` — block-scoped, must be initialized, cannot be reassigned (but objects can be mutated).

### Examples

```js
// var example
function varTest() {
  var x = 1;
  if (true) {
    var x = 2; // same variable
    console.log('inside if', x); // 2
  }
  console.log('after if', x); // 2
}

// let example
function letTest() {
  let y = 1;
  if (true) {
    let y = 2; // different variable (block scope)
    console.log('inside if', y); // 2
  }
  console.log('after if', y); // 1
}

// const example
const z = { name: 'Alice' };
z.name = 'Bob'; // allowed (mutation)
// z = {} // not allowed (reassignment)
```

**Output (console):**

- varTest: inside if 2, after if 2
- letTest: inside if 2, after if 1

---

## 3. Data Types

- Primitive types: Number, String, Boolean, Null, Undefined, Symbol, BigInt
- Objects: Object, Array, Function, Date, RegExp, etc.

```js
typeof 42 // 'number'
typeof 'hello' // 'string'
typeof true // 'boolean'
typeof undefined // 'undefined'
typeof null // 'object'  // historical quirk
```

---

## 4. Template Literals (string interpolation)

Use backticks for multi-line strings and interpolation with `${}`.

```js
const name = 'Sam';
const greeting = `Hello, ${name}!`;
console.log(greeting); // Hello, Sam!
```

---

## 5. Operators

- Arithmetic: `+ - * / % **`
- Comparison: `==` (loose), `===` (strict), `!=`, `!==`, `<`, `>`
- Logical: `&&`, `||`, `!`
- Assignment: `=`, `+=`, `-=` etc.

**Tip:** prefer `===` and `!==` to avoid type coercion surprises.

---

## 6. Control Flow

- `if / else`
- `switch`
- Loops: `for`, `while`, `do...while`, `for...of`, `for...in`

```js
for (let i = 0; i < 3; i++) {
  console.log(i);
}

const arr = [10, 20, 30];
for (const v of arr) console.log(v);
```

---

## 7. Functions

- Function declarations vs expressions vs arrow functions.

```js
// declaration
function add(a, b) { return a + b; }

// expression
const multiply = function(a, b) { return a * b; };

// arrow function
const square = x => x * x;

console.log(add(2,3)); // 5
console.log(multiply(2,3)); // 6
console.log(square(4)); // 16
```

- Arrow functions do not have their own `this` and are not suitable as constructors.

---

## 8. Objects and Arrays

```js
const person = { name: 'Ana', age: 25 };
console.log(person.name); // Ana

const nums = [1,2,3];
nums.push(4); // [1,2,3,4]
```

### Destructuring

```js
const { name, age } = person;
const [first, second] = nums;
```

### Spread & Rest

```js
const more = [...nums, 5, 6];
function sum(...args) { return args.reduce((s,n) => s + n, 0); }
```

---

## 9. Hoisting (short)

- Declarations (`var` and function declarations) are hoisted to the top of their scope.
- `let` and `const` are hoisted but are in a Temporal Dead Zone until initialized.

```js
console.log(a); // undefined (var hoisted)
var a = 10;

console.log(b); // ReferenceError (TDZ)
let b = 20;
```

---

## 10. Type Conversion & Coercion (expanded)

JavaScript sometimes converts values between types automatically (coercion). This can be convenient but also surprising. Prefer explicit conversions when clarity matters.

### Common explicit conversion helpers

- Number(x) — convert to Number
- String(x) — convert to String
- Boolean(x) — convert to Boolean
- +x — unary plus converts to Number
- !!x — double negation to convert to Boolean

### Examples — basic cases

```js
Number('42')      // 42
Number('')        // 0
Number('  \t\n') // 0 (whitespace trimmed)
Number('12px')    // NaN

String(123)       // '123'
String(null)      // 'null'
String(undefined) // 'undefined'

Boolean(0)        // false
Boolean(1)        // true
Boolean('')       // false
Boolean('0')      // true
```

### Unary plus and double negation

```js
+'123'  // 123   (unary plus)
+'foo'  // NaN

!!''    // false (double negation)
!!'hi'  // true
```

### parseInt and parseFloat gotchas

```js
parseInt('08')     // 8 (modern engines parse as decimal)
parseInt('08', 10) // 8 (always specify radix to be explicit)
parseInt('12px')   // 12 (stops parsing at first non-digit)
parseFloat('3.14abc') // 3.14
```

### == vs === and coercion surprises

```js
0 == ''      // true  ('' coerces to 0)
0 === ''     // false (different types)
'\n' == 0    // true  (whitespace string -> 0)
false == '0' // true  ('0' -> 0, false -> 0)

// Prefer === to avoid implicit coercion
```

### Objects and ToPrimitive conversion (brief)

When objects are used in operations that expect primitives, JS calls internal ToPrimitive: tries valueOf(), then toString().

```js
const obj = { valueOf() { return 42; }, toString() { return 'obj'; } };
Number(obj) // 42  (uses valueOf)
String(obj) // 'obj' (uses toString)

// Strange concatenation behavior:
{} + []      // 0  (treated as numeric addition in some contexts)
[] + {}      // '[object Object]'
```

> Note: object-to-primitive rules are advanced — prefer explicit conversions like String(x) or Number(x) when dealing with non-primitive values.

### Practical tips

- Use explicit conversions: Number(), String(), Boolean() — they make intentions clear.
- Use === and !== for comparisons to avoid surprising coercion.
- When parsing user input, use parseInt/parseFloat with care and validate results (check for NaN).

---

## 11. Error Handling

```js
try {
  throw new Error('Something went wrong');
} catch (err) {
  console.error(err.message);
} finally {
  // cleanup
}
```

---

## 12. Modules (ESM)

```js
// export
export function greet(name) { return `Hi ${name}`; }

// import
import { greet } from './utils.js';
```

---

## 13. Best Practices

- Use `const` by default, `let` when reassignment is needed.
- Prefer `===` / `!==`.
- Keep functions small and single-purpose.
- Use descriptive variable names.
- Avoid global variables.

---

## 14. Practical examples

### Example: Simple counter with DOM

```html
<!-- Code: counter example -->
<button id="inc">Increment</button>
<span id="count">0</span>

<script>
  const btn = document.getElementById('inc');
  const countEl = document.getElementById('count');
  let count = 0;
  btn.addEventListener('click', () => {
    count += 1;
    countEl.textContent = count;
  });
</script>
```

### Example: Fetch JSON

```js
async function loadData() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  console.log(data);
}
loadData();
```

---

## 15. Exercises

1. Declare variables using `var`, `let`, and `const` and observe scope differences inside and outside blocks.
2. Write a function `sumAll(...nums)` that returns the sum of any number of arguments.
3. Fetch a JSON resource and display one field in the page.

---

## Further reading

- MDN JavaScript Guide
- ES6 features: let/const, arrow functions, destructuring