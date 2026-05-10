# Advanced Semantics and Accessibility

Semantic HTML is not just about making code look pretty. It directly interfaces with the Accessibility Tree, a structure that the browser builds parallel to the DOM, which is then fed to assistive technologies like screen readers.

## Semantics vs. ARIA Roles

Before HTML5, developers had to use WAI-ARIA (Web Accessibility Initiative - Accessible Rich Internet Applications) attributes to explain what a `<div>` was doing.

```html
<!-- The Old Way (HTML4 + ARIA) -->
<div role="navigation">
 <div role="heading" aria-level="2">Menu</div>
 <!-- links... -->
</div>
```

HTML5 semantic tags have these ARIA roles built-in implicitly. The cardinal rule of ARIA is: **No ARIA is better than bad ARIA.** Always prefer the native HTML5 element.

```html
<!-- The Modern HTML5 Way -->
<nav>
 <h2>Menu</h2>
 <!-- links... -->
</nav>
```
Only use ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-live`) when you are building complex, dynamic JavaScript widgets (like a custom tab-switcher) that native HTML cannot represent.

## Native Interactive Semantics

You do not need JavaScript to build every interactive component. HTML5 provides semantic elements that handle complex interactions natively.

### Accordions (`<details>` and `<summary>`)
You can build a fully functional, accessible, toggleable accordion using just HTML.

```html
<details>
 <summary>Click here to view the hidden content</summary>
 <p>This paragraph is hidden by default. When the user clicks the summary, the browser automatically reveals this text without any JavaScript.</p>
</details>
```
*Note: The `<summary>` tag must be the first child of the `<details>` element.*

## Document Outlining and Sectioning Roots

The browser uses heading tags (`<h1>` - `<h6>`) combined with sectioning elements (`<section>`, `<article>`, `<nav>`, `<aside>`) to generate an outline of the page.

### The `<section>` vs `<article>` Debate
This is a common point of confusion for developers:
- `<article>`: Represents a completely self-contained piece of content. If you took this piece of content and put it on a completely different website, it would still make perfect sense (e.g., a blog post, a standalone widget).
- `<section>`: Represents a thematic grouping of content. It is usually a part of a larger whole. It typically requires a heading.

```html
<main>
 <article>
 <header>
 <h1>Understanding React Hooks</h1>
 </header>
 
 <section>
 <h2>1. What is useState?</h2>
 <p>...</p>
 </section>

 <section>
 <h2>2. What is useEffect?</h2>
 <p>...</p>
 </section>
 </article>
</main>
```

## Niche Semantic Elements

Senior developers utilize specific tags for specific jobs, enriching the machine-readability of the document.

### The `<address>` Element
Used to supply contact information for its nearest `<article>` or `<body>` ancestor. Note: It should not be used for generic postal addresses unless it's the specific contact info for the page's author.

```html
<footer>
 <address>
 Contact the author at <a href="mailto:john@example.com">john@example.com</a>.
 </address>
</footer>
```

### `<figure>` and `<figcaption>`
Used to wrap independent content (images, code snippets, diagrams) with an optional caption.

```html
<figure>
 <img src="architecture-diagram.jpg" alt="MERN Stack Architecture Diagram">
 <figcaption>Figure 1: The flow of data in a standard MERN application.</figcaption>
</figure>
```
