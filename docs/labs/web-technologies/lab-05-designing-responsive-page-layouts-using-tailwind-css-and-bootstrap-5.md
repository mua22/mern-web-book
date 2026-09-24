---
title: "Lab 05: Designing Responsive Page Layouts using Tailwind CSS and Bootstrap 5"
---

# Lab 05: Designing Responsive Page Layouts using Tailwind CSS and Bootstrap 5

## Objective:

To enable an interface to adapt its layout, spacing, typography and interactive elements across device sizes, using two contrasting CSS framework approaches: Bootstrap 5 (component-driven) and Tailwind CSS (utility-first).

## Activity Outcomes:

- Explain the difference between component-driven and utility-first CSS frameworks.
- Integrate Bootstrap 5 and Tailwind CSS into an HTML document via CDN.
- Construct responsive layouts using Bootstrap's 12-column grid.
- Construct responsive layouts using Tailwind's Grid and Flexbox utilities.
- Apply mobile-first responsive design and breakpoint modifiers in both frameworks.
- Implement hover, focus and active states; build responsive cards, navigation, and product grids.

## 1) Useful Concepts

| Feature | Bootstrap 5 | Tailwind CSS |
|---|---|---|
| Approach | Component-driven (.btn, .card, .navbar) | Utility-first (flex, p-4, rounded-lg) |
| Grid | 12-column Flexbox grid (.container/.row/.col-*) | CSS Grid / Flexbox utilities (grid-cols-*) |
| Responsive syntax | col-md-6 | md:grid-cols-2 |
| JavaScript | Required for modals/dropdowns/collapses | Generally no framework JS dependency |

```html
<!-- Bootstrap 5 via CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Tailwind Play CDN (for classroom experimentation) -->
<script src="https://cdn.tailwindcss.com"></script>
```

**Bootstrap 12-column grid:**

```html
<div class="container my-5">
  <div class="row g-4">
    <div class="col-12 col-md-6 col-lg-4"><div class="p-4 bg-primary text-white rounded">Column 1</div></div>
    <div class="col-12 col-md-6 col-lg-4"><div class="p-4 bg-secondary text-white rounded">Column 2</div></div>
  </div>
</div>
```

**Tailwind Grid and Flexbox:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="p-6 bg-indigo-600 text-white rounded-lg shadow">Grid Item 1</div>
  <div class="p-6 bg-violet-600 text-white rounded-lg shadow">Grid Item 2</div>
</div>
```

**Responsive breakpoints:**

| Framework | Sm | md | lg | xl |
|---|---|---|---|---|
| Bootstrap 5 | 576px | 768px | 992px | 1200px |
| Tailwind | 640px | 768px | 1024px | 1280px |

Important: breakpoint names do not represent identical pixel values across frameworks -always check the framework's own documentation.

**Interactive/state modifiers (Tailwind):**

```html
<button class="bg-slate-700 hover:bg-sky-500 focus:ring-4 focus:ring-sky-500/50 active:scale-95 transition-all">
  Hover & Click Me
</button>
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 30 Minutes | Medium | CLO-4 |
| Activity 2 | 30 Minutes | Medium | CLO-4 |
| Activity 3 | 45 Minutes | High | CLO-4 |

### Activity 1: Bootstrap component paradigm

*Build a Bootstrap card **using .card, .badge**, **and .btn** to demonstrate the component-driven approach.*

**Solution:**

```html
<div class="card shadow-sm mx-auto" style="max-width:400px;">
  <div class="card-body">
    <span class="badge bg-primary mb-2">Bootstrap Component</span>
    <h5 class="card-title">Pre-styled UI Element</h5>
    <p class="card-text text-muted">Bootstrap provides semantic component classes like .card and .badge.</p>
    <button class="btn btn-primary w-100">Action Button</button>
  </div>
</div>
```

### Activity 2: Tailwind utility-first paradigm

*Build the equivalent card using only Tailwind utility classes to contrast with Activity 1.*

**Solution:**

```html
<div class="max-w-sm mx-auto bg-white rounded-xl shadow-md border border-slate-200 p-6">
  <span class="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">Tailwind Utility</span>
  <h3 class="text-xl font-bold text-slate-900 mb-2">Atomic Assembly</h3>
  <p class="text-slate-600 text-sm mb-4">Tailwind composes layouts directly in markup using utility classes.</p>
  <button class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg">Action Button</button>
</div>
```

### Activity 3: Responsive e-commerce product catalogue

*Develop a responsive product catalogue (navigation header with search/cart, a filter sidebar, a responsive product grid with cards, and a sticky cart summary) using Tailwind CSS.*

**Solution:**

```html
<header class="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md px-4 py-3">
  <div class="max-w-7xl mx-auto flex items-center justify-between">
    <a href="#" class="text-xl font-black text-white">NexusStore</a>
    <input type="text" placeholder="Search products..." class="hidden sm:block bg-slate-800 rounded-xl py-2 px-4 text-sm">
  </div>
</header>

<div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-4">
  <aside class="w-full lg:w-64"><!-- category / price filters --></aside>
  <main class="flex-1">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <article class="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="relative h-48 overflow-hidden">
          <span class="absolute top-3 left-3 bg-indigo-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">SALE</span>
          <img src="headphones.jpg" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <div class="p-5">
          <h3 class="font-bold text-white mb-2">Pro Noise-Canceling Headset</h3>
          <div class="flex items-center justify-between">
            <span class="text-lg font-black text-white">$199</span>
            <button class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl">Add to Cart</button>
          </div>
        </div>
      </article>
    </div>
  </main>
</div>

<div class="sticky bottom-4 max-w-xl mx-auto w-full px-4">
  <div class="bg-indigo-600/90 text-white p-4 rounded-2xl flex items-center justify-between">
    <div><p class="text-xs">Selected Items (2)</p><p class="font-black">$348.00 USD</p></div>
    <button class="bg-white text-indigo-950 font-black text-xs px-5 py-2.5 rounded-xl">Checkout Order →</button>
  </div>
</div>
```

**Common problems and troubleshooting:**

- Unwanted horizontal scrollbar in Bootstrap: a .row is used outside a .container -always wrap rows in a container.
- A Tailwind class like w-[350px] has no effect: check the CDN script is loading, or that a dynamically-built class string isn't being used (Tailwind needs the full class name to appear literally in the markup).
- A Bootstrap navbar toggle does nothing: the bootstrap.bundle.min.js script is missing, or the data-bs-toggle/data-bs-target attributes are missing.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Responsive multi-column layout comparison**

Build the same 3-column responsive layout (stacks on mobile, 2 columns on tablet, 3 on desktop) once using Bootstrap's grid and once using Tailwind's grid utilities; note in comments which took fewer custom CSS lines.

**Lab Task 2: Mobile filter drawer**

Extend the Activity 3 catalogue so the filter sidebar is hidden on small screens behind a 'Filters' button that toggles its visibility (Bootstrap collapse component or a small Tailwind + vanilla-JS toggle).

**Lab Task 3: Responsive navigation menu**

Build a responsive navbar (brand, links, and a call-to-action button) that collapses into a mobile menu below a chosen breakpoint, in either framework.
