# 14. Tutorial: Building a Server-Side E-Commerce Store

Over the last 13 chapters, you have learned the independent components of the backend: the `http` request/response cycle, Express Middlewares, the MVC architectural pattern, EJS Templating/Layouts, and MongoDB persistance using Mongoose.

It is time to put all of these puzzle pieces together. We are going to build a functional, multi-page E-Commerce storefront utilizing pure Server-Side Rendering (SSR). This application will fetch products from a MongoDB database and dynamically generate the HTML on the server before sending it to the user.

---

## 14.1 The Application Architecture (MVC)

We are building a simple storefront called **"Ninja Gear"**. The user flow is straightforward:
1. They visit the homepage (`/`) and see a beautiful grid of all available products.
2. They click on a specific product to navigate to the Details Page (`/product/:id`).

Before writing any code, we must cleanly structure our folders in the terminal following the MVC architecture:

```bash
# Our Directory Structure
/ninja-gear-app
  ├── /controllers
  │   └── productController.js
  ├── /models
  │   └── Product.js
  ├── /routes
  │   └── productRoutes.js
  ├── /views
  │   ├── layout.ejs
  │   ├── home.ejs
  │   └── productDetail.ejs
  └── server.js
```

*(Note: Ensure you have run `npm init -y` and `npm install express ejs express-ejs-layouts mongoose` before starting).*

---

## 14.2 The Model (Mongoose)

First, we define what a "Product" actually looks like using Mongoose.

```javascript
// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);
```

---

## 14.3 The Controller (Business Logic)

Next, we write the "Brain" of our application. The Controller queries MongoDB and then strictly hands that raw data payload over to EJS via `res.render()`. 

Since database querying takes time, these functions must definitely run asynchronously.

```javascript
// controllers/productController.js
const Product = require('../models/Product');

// Fetch all products for the homepage
exports.getStoreHomepage = async (req, res) => {
    try {
        const products = await Product.find();
        
        // Render the home.ejs view, and pass the products array to it!
        res.render('home', { title: "Ninja Gear Store", products: products });
    } catch (err) {
        // If the database fails, render a generic error page
        res.render('error', { message: "Failed to load store." });
    }
};

// Fetch a single product for the dynamic details page
exports.getProductDetails = async (req, res) => {
    try {
        // Extract the Mongoose ID from the URL path (/product/64a7...)
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).send('Product Not Found!');
        
        res.render('productDetail', { title: product.name, product: product });
    } catch (err) {
        res.status(400).send('Invalid Product ID');
    }
};
```

---

## 14.4 The Routing

Now we connect the Router traffic cop. We attach the URL endpoints to the specific functions we just wrote in the Controller.

```javascript
// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// The Homepage
router.get('/', productController.getStoreHomepage);

// The Dynamic Details Page
router.get('/product/:id', productController.getProductDetails);

module.exports = router;
```

---

## 14.5 The Views (EJS Layouts and Rendering)

Here is where the magic of Server-Side Rendering truly shines.

### The Master Layout
We create our permanent wrapper using `express-ejs-layouts`. Notice how we inject dynamic variables like `<%= title %>` straight into the `<head>` tag!

```html
<!-- views/layout.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title><%= title %></title>
    <!-- Simple inline styling for demonstration purposes -->
    <style>
        body { font-family: sans-serif; margin: 0; background: #fdfdfd; }
        nav { background: #E74C3C; color: white; padding: 15px; text-align: center;}
        .container { max-width: 900px; margin: 20px auto; }
    </style>
</head>
<body>
    <nav>
        <h1>⚔️ Ninja Gear Store ⚔️</h1>
        <a href="/" style="color: white">Return to Storefront</a>
    </nav>
    
    <div class="container">
         <!-- THE DYNAMIC INJECTION HOLE -->
        <%- body %> 
    </div>
</body>
</html>
```

### The Homepage View (Looping Cards)
The controller passed an array of products to this view. We use an EJS `<% for %>` loop to iteratively generate a visual HTML card for every single product in the database.

```html
<!-- views/home.ejs -->
<div style="display: flex; gap: 20px; flex-wrap: wrap;">
    
    <!-- Render a card for EVERY product in the Array -->
    <% for(let p of products) { %>
        <div style="border: 1px solid #ccc; padding: 15px; width: 250px;">
            <img src="<%= p.imageUrl %>" width="100%" alt="<%= p.name %>" />
            
            <h3><%= p.name %></h3>
            <p><strong>$<%= p.price %></strong></p>
            
            <!-- Generate a dynamic URL specific to this product's database ID! -->
            <a href="/product/<%= p._id %>">
                <button style="background: black; color: white; width: 100%">View Item</button>
            </a>
        </div>
    <% } %>

</div>
```

### The Details View (Single Item)
When the user clicks the "View Item" button, the Controller isolates that specific product.

```html
<!-- views/productDetail.ejs -->
<div style="text-align: center;">
    
    <img src="<%= product.imageUrl %>" width="300px" style="border-radius: 10px;" />
    
    <h1 style="color: #E74C3C"><%= product.name %></h1>
    <h2>$<%= product.price %></h2>
    <p style="color: gray; padding: 20px;"><%= product.description %></p>
    
    <button style="background: green; color: white; padding: 15px 40px; font-size: 18px">
        Add to Shopping Cart
    </button>
</div>
```

---

## 14.6 Bringing It Together (`server.js`)

Our final step is to assemble the puzzle pieces inside the root of our Node application.

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');

// Import Custom Router
const productRoutes = require('./routes/productRoutes');

const app = express();

// Database Connection
mongoose.connect('mongodb://localhost:27017/ninjaGearDB')
    .then(() => console.log('Database Connected Successfully!'))
    .catch(err => console.log('Database Crash: ', err));

// View Engine & Layout Setup
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Connect the Router!
app.use('/', productRoutes);

// Ignite the Server
app.listen(3000, () => console.log("E-Commerce Server running on Port 3000!"));
```

## Summary

You have officially bridged the entire backend ecosystem! By architecting an SSR E-Commerce store, you proved you understand how:
1. **Mongoose Models** define and enforce the data structures of our products.
2. **Express Controllers** orchestrate business logic by fetching data from the Model and forwarding it to the EJS Views.
3. **EJS Layouts** elegantly wrap dynamic pages (`<%- body %>`) inside a consistent navigation shell.
4. **EJS Syntax** dynamically generated unique HTML product cards using database loops and `_id` concatenations.

While this traditional SSR methodology is highly effective and incredibly SEO-friendly, as applications scale in interactive complexity (e.g., dynamically updating the shopping cart counter without refreshing the page), we hit a harsh limitation.

In the final portion of the MERN stack curriculum, we will decouple the UI entirely from the `server.js` codebase. It is time to learn the ultimate framework for Client-Side logic: **React**.
