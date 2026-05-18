# CSS Fundamentals

## Overview

**Cascading Style Sheets (CSS)** is the design engine of the web. While HTML defines the structural bones and content of a webpage, CSS breathes life, color, and visual hierarchy into it. Mastering CSS is the bridge between writing code and creating delightful, professional user experiences.

In this module, you will transition from styling basic text elements to architecting production-ready, highly responsive web interfaces using modern standards.

---

## What You'll Learn

By the end of this module, you will be able to:
- **Style structural components** with precise color, typography, and border attributes.
- **Compute and troubleshoot spacing issues** using the CSS Box Model (`content`, `padding`, `border`, `margin`).
- **Target page elements precisely** and manage design overrides using CSS Selectors and Specificity rules.
- **Build sophisticated layouts** with CSS Flexbox (1-dimensional layouts) and CSS Grid (2-dimensional layouts).
- **Control element positioning** and vertical layering (`z-index`) relative to parent containers.
- **Implement responsive layouts** that adapt fluidly across mobile, tablet, and desktop screens using Media Queries and fluid design values.
- **Author high-performance, maintainable CSS** using best-practice conventions like BEM and semantic CSS styling.

---

## Curriculum Structure

This module is structured into 9 comprehensive, sequential chapters:

1. **[01. Introduction to CSS](01-introduction.md)**: Role, basic syntax, and different ways to include CSS in your projects.
2. **[02. Selectors & Specificity](02-selectors-specificity.md)**: Master basic/advanced selectors, combinators, pseudo-classes/elements, and cascade conflict resolution.
3. **[03. The Box Model](03-box-model.md)**: Explore content, padding, borders, margins, `box-sizing: border-box`, and margin collapsing.
4. **[04. Block vs Inline](04-block-vs-inline.md)**: Master the default element types (`block`, `inline`, `inline-block`) and leverage the `display` property.
5. **[05. Flexbox Layout](05-flexbox.md)**: A deep dive into one-dimensional layouts, container/item alignments, and responsive flex spacing.
6. **[06. Grid Layout](06-grid.md)**: Learn two-dimensional web layouts, templates, minmax boundaries, and grid area structures.
7. **[07. Positioning & Z-Index](07-positioning-zindex.md)**: Control element flow using static, relative, absolute, fixed, and sticky coordinate spaces along with layered stacking context.
8. **[08. Responsive Web Design](08-responsive-design.md)**: Build fluid, device-agnostic layouts utilizing viewports, media queries, mobile-first design, and rem/em units.
9. **[09. CSS Best Practices](09-best-practices.md)**: Clean style architectures using CSS variables, BEM notation, page performance optimizations, and accessibility (a11y) rules.

---

## Getting Started

To add CSS styling to an HTML document, you link your external stylesheet in the `<head>` of your document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stunning Webpage</title>
    <!-- Link the external CSS file -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="hero-section">
        <h1>Welcome to Modern CSS</h1>
        <p>Unleash the visual potential of your web pages.</p>
    </header>
</body>
</html>
```

In your `style.css` file:

```css
/* Style the hero section */
.hero-section {
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    color: #ffffff;
    padding: 60px 20px;
    text-align: center;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
}
```

---

## Additional Resources

- **MDN Web Docs - CSS**: [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **CSS-Tricks**: [A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) & [A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- **PDF Lecture Slides**: Refer to your course dashboard or google drive share for downloadable lecture slides on web page layout design.
