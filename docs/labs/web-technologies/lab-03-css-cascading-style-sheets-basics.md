---
title: "Lab 03: CSS (Cascading Style Sheets) Basics"
---

# Lab 03: CSS (Cascading Style Sheets) Basics

## Objective:

To introduce Cascading Style Sheets (CSS) and its role in controlling presentation, layout, typography, colors, spacing, and interactive behaviour of HTML documents.

## Activity Outcomes:

- Apply CSS using inline, internal, and external stylesheets.
- Understand CSS selectors and declaration syntax.
- Use common CSS properties for typography, colors, spacing, borders, and backgrounds.
- Understand the CSS cascade, inheritance, and specificity.
- Apply the CSS Box Model to create structured page components.
- Use display, margin, padding, and box-sizing to control layout.
- Style links, buttons, badges, and other interactive elements using :hover and :active.
- Inspect and debug CSS using browser Developer Tools.

## 1) Useful Concepts

CSS controls presentation -colors, fonts, spacing, borders, backgrounds, positioning -while HTML defines structure. A CSS rule consists of a selector followed by declarations: selector { property: value; }

**Three ways to apply CSS:**

| Method | Where it lives | Trade-off |
|---|---|---|
| Inline | style attribute on one element | Quick, but not reusable and hard to maintain |
| Internal | &lt;style&gt; inside &lt;head&gt; | Fine for a single standalone page; not shareable across pages |
| External | separate .css file linked via &lt;link&gt; | Reusable, cacheable, cleanest separation of structure/presentation -preferred for production |

```html
<link rel="stylesheet" href="css/styles.css">

/* styles.css */
* { box-sizing: border-box; }
body { font-family: "Segoe UI", sans-serif; background-color: #f8f9fa; }
.page-title { color: #0d6efd; text-align: center; }
```

**Selectors:**

```css
p { color: #334155; }              /* element selector */
.card { background: white; }        /* class selector: class="card" */
#main-heading { color: blue; }       /* id selector: id="main-heading" */
* { box-sizing: border-box; }        /* universal selector */
```

**Cascade and specificity:**

When multiple rules target the same element, the browser resolves the conflict using specificity: inline styles &gt; ID selectors &gt; class/attribute/pseudo-class selectors &gt; element/pseudo-element selectors. Among rules of equal specificity, the one appearing later in the stylesheet wins.

```css
p { color: black; }              /* element      */
.text-sample { color: blue; }    /* class        */
#unique-text { color: green; }   /* id -wins over the above */
<p id="unique-text" class="text-sample">Text</p>  <!-- renders green -->
```

**The CSS Box Model:**

Every element is a box made of Content → Padding → Border → Margin (innermost to outermost). box-sizing: content-box (default) means width applies only to content, with padding/border added on top; box-sizing: border-box means width includes padding and border, which is far easier to reason about.

```css
*, *::before, *::after { box-sizing: border-box; }  /* common global reset */

.card { width: 300px; padding: 20px; border: 2px solid #cbd5e1; margin: 30px; }
/* content-box: rendered width = 300 + 20+20 (padding) + 2+2 (border) = 344px */
/* border-box:  rendered width = 300px total, padding/border absorbed inside  */
```

**Display values:**

- block -occupies full available width, starts on a new line (div, p, h1, section)
- inline -occupies only the space its content needs (span, a, strong)
- inline-block -stays in line but accepts width/height/margin/padding (buttons, badges)

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 1 | 45 Minutes | Medium | CLO-4 |
| Activity 2 | 45 Minutes | Medium | CLO-4 |

### Activity 3.1: Article-preview component (typography, color, external CSS, links)

*Create a professional article-preview component using HTML5 and an external CSS stylesheet, demonstrating typography hierarchy, colors, spacing and interactive link states.*

**Solution:**

```html
<!-- index.html -->
<link rel="stylesheet" href="style.css">
<article class="article-card">
  <span class="category-badge">Web Development</span>
  <h1 class="article-title">Mastering Cascading Style Sheets</h1>
  <p class="article-meta">Published on <time datetime="2026-09-09">September 9, 2026</time></p>
  <p class="article-excerpt">CSS gives developers control over webpage presentation...</p>
  <div class="article-footer"><a href="#" class="read-btn">Read Article &rarr;</a></div>
</article>

/* style.css */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; padding: 50px 20px; font-family: "Inter", sans-serif; background: #f1f5f9; color: #334155; }
.article-card { max-width: 550px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; }
.category-badge { display: inline-block; padding: 4px 10px; background: #e0e7ff; color: #3730a3; font-size: .75rem; font-weight: 700; text-transform: uppercase; border-radius: 4px; }
.article-title { color: #0f172a; font-size: 1.75rem; font-weight: 700; }
.read-btn { display: inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px; transition: background-color .2s ease; }
.read-btn:hover { background: #0369a1; }
.read-btn:active { background: #075985; }
```

### Activity 3.2: Profile card (box model, circular image, hover states)

*Create a profile card component demonstrating the CSS Box Model, dimensions, margins, padding, borders, circular images, shadows, and interactive buttons.*

**Solution:**

```html
<div class="profile-card">
  <div class="avatar-container"><img src="avatar.jpg" alt="Profile avatar" class="avatar-img"></div>
  <div class="profile-content">
    <h2 class="user-name">Dr. Sarah Khan</h2>
    <p class="user-role">Associate Professor and Researcher</p>
    <button class="action-btn">View Profile</button>
  </div>
</div>

*, *::before, *::after { box-sizing: border-box; }
.profile-card { width: 320px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,.1); overflow: hidden; }
.avatar-img { width: 100px; height: 100px; border: 4px solid #fff; border-radius: 50%; object-fit: cover; }
.action-btn { width: 100%; padding: 12px; background: #0f172a; color: #fff; border: none; border-radius: 6px; cursor: pointer; transition: all .2s ease; }
.action-btn:hover { background: #2563eb; transform: translateY(-2px); }
.action-btn:active { transform: translateY(0); }
```

**Common CSS errors covered in this lab (for Developer Tools debugging practice):**

- Wrong stylesheet path (href="style.css" when the file is actually at css/style.css).
- Unclosed comment (/* ... without a closing */) can swallow following rules.
- Confusing .class and #id selectors for class="..." vs id="..." attributes.
- Forgetting box-sizing: border-box, causing an element's rendered size to exceed its declared width.
- Applying width/height to a naturally inline element (e.g. &lt;a&gt;) without display: inline-block first.

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Personal profile card**

Create a professional personal profile card (photo, name, designation, short bio, at least three statistics, contact info, primary action button) using external CSS, class selectors, the box model, box-sizing, border-radius, box-shadow, object-fit, and :hover/:active states.

**Lab Task 2: Article-preview component**

Create an article-preview component containing category, title, author, publication date, short description and a Read More button, demonstrating typography hierarchy, font weight/size, line-height, and interactive link states.

**Lab Task 3: E-commerce product card**

Create a product card (image, sale badge, category, name, description, current/original price, stock status, Add to Cart and Wishlist buttons) using external CSS, a global box-sizing: border-box rule, border-radius, box-shadow, overflow: hidden, positioned badge, object-fit, and hover/active/transition states.
