---
title: "Lab 13: Creating a React Application and Components"
---

# Lab 13: Creating a React Application and Components

Aligns with Lecture 26 (Introduction to React.js and Rendering Approaches) and Lecture 27 (Components, Props and Event Handling).

## Objective:

To scaffold a React application, understand JSX syntax and rules, and build reusable function components using props, children and basic event handling.

## Activity Outcomes:

- Scaffold a React project using Vite and explain the generated folder structure.
- Write JSX and explain how it differs from HTML (className, self-closing tags, one root element).
- Create function components and compose them (parent/child).
- Pass and use props, including default props and children.
- Render lists using map() with a stable key.
- Handle basic DOM events (onClick, onChange) and manage a controlled input.

## 1) Useful Concepts

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```

**Generated structure (relevant parts):**

```jsx
my-app/
  src/
    main.jsx      // mounts <App /> into index.html's #root
    App.jsx       // top-level component
  index.html
```

**JSX rules to remember:**

- A component must return a single root element (or a Fragment `&lt;&gt;...&lt;/&gt;`).
- Use className instead of class; use htmlFor instead of for.
- Curly braces { } embed a JavaScript expression inside markup.
- Every element in a rendered list needs a unique, stable key prop.

**A minimal function component:**

```javascript
function Greeting({ name = 'Student' }) {
  return <h2>Hello, {name}!</h2>;
}
export default Greeting;
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 20 minutes | Low | CLO-4 |
| Activity 2 | 30 minutes | Medium | CLO-4 |
| Activity 3 | 30 minutes | Medium | CLO-4 |

### Activity 1: Scaffold and compose Header/Footer

*Create a Vite React project. Build separate Header and Footer components and compose them inside App.*

**Solution:**

```jsx
// src/components/Header.jsx
function Header() {
  return (
    <header>
      <h1>CUI Web Technologies</h1>
    </header>
  );
}
export default Header;

// src/components/Footer.jsx
function Footer() {
  return <footer>&copy; 2026 Department of Computer Science</footer>;
}
export default Footer;

// src/App.jsx
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Header />
      <p>Main page content goes here.</p>
      <Footer />
    </>
  );
}
export default App;
```

**Output / Expected behaviour:**

```text
Page renders the heading, a paragraph and the footer copyright line.
```

### Activity 2: A reusable ProductCard rendered from a list

*Create a ProductCard component that accepts name, price and inStock as props. Render an array of products using **map(**), each with a unique key.*

**Solution:**

```jsx
// src/components/ProductCard.jsx
function ProductCard({ name, price, inStock }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>PKR {price}</p>
      <p>{inStock ? 'In Stock' : 'Out of Stock'}</p>
    </div>
  );
}
export default ProductCard;

// src/App.jsx
import ProductCard from './components/ProductCard';

const products = [
  { id: 1, name: 'Wireless Headphones', price: 4999, inStock: true },
  { id: 2, name: 'Mechanical Keyboard', price: 8999, inStock: false },
  { id: 3, name: 'USB-C Hub', price: 2499, inStock: true }
];

function App() {
  return (
    <div>
      {products.map(item => (
        <ProductCard key={item.id} name={item.name} price={item.price} inStock={item.inStock} />
      ))}
    </div>
  );
}
export default App;
```

**Output / Expected behaviour:**

```text
Three cards render, each showing its own name, price and stock status.
```

### Activity 3: Controlled form to add a product

*Add a simple form with a text input and a submit button; typing updates state (controlled input), and submitting adds a new product to the rendered list without reloading the page.*

**Solution:**

```jsx
import { useState } from 'react';

function App() {
  const [products, setProducts] = useState(['Headphones', 'Keyboard']);
  const [name, setName] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setProducts(prev => [...prev, trimmed]);
    setName('');
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Product name" />
        <button type="submit">Add Product</button>
      </form>
      <ul>
        {products.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
    </div>
  );
}
export default App;
```

**Output / Expected behaviour:**

```text
Typing 'Mouse' and submitting adds a new 'Mouse' item to the list; the input clears; the page never reloads.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Student list mini-app**

Build a small app with components StudentList, StudentItem and SearchBar. Store an array of student objects in state; SearchBar is a controlled input that filters the visible list by name as the user types (case-insensitive substring match).

**Lab Task 2: Add and remove items**

Extend the student list app so each StudentItem has a Remove button that deletes that student from state, and a form (as in Activity 3) that adds new students.

**Lab Task 3: Props with children and defaults**

Create a Card component that accepts a title prop and renders whatever is passed as children inside it. Give title a default value of 'Untitled' and demonstrate the component both with and without a title supplied.
