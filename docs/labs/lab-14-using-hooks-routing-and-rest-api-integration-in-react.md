---
title: "Lab 14: Using Hooks, Routing and REST API Integration in React"
---

# Lab 14: Using Hooks, Routing and REST API Integration in React

Aligns with Lecture 28 (Hooks and State Management) and Lecture 29 (Routing and API Integration). Consumes the REST API built in Lab 12.

## Objective:

To fetch data from a REST API using useEffect/useState with loading and error states, and to add client-side routing with React Router so the app has multiple pages that share layout.

## Activity Outcomes:

- Fetch data inside useEffect and handle loading/error/success states correctly.
- Set up React Router with BrowserRouter, Routes, Route and Link.
- Read a route parameter with useParams to fetch a single resource.
- Navigate programmatically with useNavigate after a form submission.
- Send POST requests from a React form to an Express REST API.

## 1) Useful Concepts

```bash
npm install react-router-dom axios
```

**The data-fetching pattern:**

```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let cancelled = false;
  async function load() {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!cancelled) setData(json.data);
    } catch (err) {
      if (!cancelled) setError(err.message);
    } finally {
      if (!cancelled) setLoading(false);
    }
  }
  load();
  return () => { cancelled = true; }; // cleanup on unmount
}, []);
```

**Basic router setup:**

```jsx
// src/main.jsx
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
  <BrowserRouter><App /></BrowserRouter>
);

// src/App.jsx
import { Routes, Route, Link } from 'react-router-dom';
function App() {
  return (
    <>
      <nav><Link to='/'>Home</Link> | <Link to='/products'>Products</Link></nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/products' element={<ProductList />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 25 minutes | Medium | CLO-4 |
| Activity 2 | 30 minutes | Medium | CLO-4 |
| Activity 3 | 30 minutes | High | CLO-4 |

### Activity 1: Fetch and display products with loading/error states

*Build a ProductList component that fetches from the Lab 12 API and clearly shows loading, error and success states.*

**Solution:**

```jsx
import { useEffect, useState } from 'react';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | error | ready

  useEffect(() => {
    fetch('http://localhost:3000/api/products')
      .then(res => res.json())
      .then(json => { setProducts(json.data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <p>Loading products...</p>;
  if (status === 'error') return <p>Could not load products.</p>;

  return (
    <ul>
      {products.map(prod => <li key={prod._id}>{prod.name} -PKR {prod.price}</li>)}
    </ul>
  );
}
export default ProductList;
```

**Output / Expected behaviour:**

```text
Page briefly shows 'Loading products...', then the list; stopping the Express server and reloading shows 'Could not load products.'
```

### Activity 2: Route parameters -product detail page

*Add a **route /products/**:id that fetches and displays a single product using useParams.*

**Solution:**

```jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => { setProduct(json.data); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, [id]);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'error') return <p>Product not found. <Link to='/products'>Back</Link></p>;

  return (
    <div>
      <h2>{product.name}</h2>
      <p>PKR {product.price}</p>
      <Link to='/products'>Back to list</Link>
    </div>
  );
}
export default ProductDetail;

// In ProductList, link each item to its detail page:
<Link to={`/products/${prod._id}`}>{prod.name}</Link>
```

**Output / Expected behaviour:**

```text
Clicking a product name navigates to /products/<id> and shows that product's detail; an invalid id shows the not-found message.
```

### Activity 3: Create-product form with navigation

*Add a form that POSTs a new product to the API, then uses useNavigate to return to the product list on success.*

**Solution:**

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price) })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      navigate('/products');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder='Name' required />
      <input value={price} onChange={e => setPrice(e.target.value)} placeholder='Price' type='number' required />
      <button type='submit'>Add Product</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
export default AddProduct;
```

**Output / Expected behaviour:**

```text
Submitting valid data creates the product on the server and redirects to /products, where the new item now appears.
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Edit and delete from the UI**

On ProductDetail, add Edit and Delete buttons. Edit should load the product into a controlled form and PUT the changes; Delete should call the DELETE endpoint and navigate back to /products on success.

**Lab Task 2: Not-found route**

Add a catch-all &lt;Route path='*' element={&lt;NotFound /&gt;} /&gt; that renders a friendly 404 page with a link back to Home for any unmatched URL.

**Lab Task 3: Basic loading/error UX polish**

Replace the plain 'Loading...' text across all three pages with a small reusable &lt;Status /&gt; component that accepts a state prop ('loading' | 'error' | message) and renders consistent styling; reuse it in ProductList, ProductDetail and AddProduct.
