# CSS Best Practices

Writing CSS is easy; writing clean, maintainable, performant, and scalable CSS for large production applications is highly challenging. Without structure, stylesheets quickly devolve into a chaotic tangle of overrides, global style leakage, and duplicate declarations.

Follow these industry-standard CSS best practices to author high-quality, professional stylesheets.

---

## 1. Keep Your CSS DRY with Custom Properties

**DRY (Don't Repeat Yourself)** is a foundational coding principle. In CSS, repeating identical color hex codes, padding dimensions, or font pairings across hundreds of lines leads to a maintenance nightmare.

**CSS Custom Properties (Variables)** solve this by storing key design values in a single centralized location, allowing you to update your entire site's design instantly.

### Declaring & Using CSS Variables:
Always declare your global variables inside the **`:root`** pseudo-class so they are accessible to every element in the HTML tree.

```css
/* 1. Declare variables inside :root */
:root {
    --primary-color: #4f46e5;      /* Indigo */
    --secondary-color: #06b6d4;    /* Cyan */
    --text-main: #1f2937;          /* Dark Slate */
    --bg-light: #f9fafb;           /* Off-white */
    --border-radius-lg: 12px;
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 2. Consume variables using the var() function */
body {
    background-color: var(--bg-light);
    color: var(--text-main);
    font-family: 'Inter', sans-serif;
}

.button-primary {
    background-color: var(--primary-color);
    color: #ffffff;
    border-radius: var(--border-radius-lg);
    transition: var(--transition-smooth);
}

/* 3. Easy interactive overrides (e.g., hover shifts) */
.button-primary:hover {
    background-color: var(--secondary-color);
}
```

---

## 2. Leverage BEM Naming Convention

As websites scale, generic class names (like `.title`, `.btn`, `.wrapper`) lead to style collisions and styling overrides that break other pages. **BEM (Block, Element, Modifier)** is a popular, highly structured class-naming convention that ensures CSS classes are modular, self-contained, and completely independent.

```css
/* BEM Syntax Structure */
.block { }                  /* Self-contained component */
.block__element { }          /* Child component belonging strictly to the block */
.block--modifier { }         /* Variation of the block or element */
```

### A. The Block
A standalone, independent entity that is meaningful on its own (e.g., `.card`, `.navbar`, `.menu`).

### B. The Element (`__`)
A part of a block that has no standalone meaning and is semantically tied directly to its parent block. Elements are prefixed with a **double underscore** (e.g., `.card__title`, `.card__image`, `.card__button`).

### C. The Modifier (`--`)
A flag on a block or element used to change its appearance, state, or behavior. Modifiers are prefixed with a **double hyphen** (e.g., `.card--featured`, `.card__button--disabled`).

### Practical BEM Component Example:

#### The HTML
```html
<div class="user-card user-card--premium">
    <img src="user.jpg" alt="User avatar" class="user-card__avatar">
    <h3 class="user-card__username">Usman Live</h3>
    <button class="user-card__btn user-card__btn--active">View Profile</button>
</div>
```

#### The CSS
```css
/* Block */
.user-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
}

/* Block Modifier (Variation) */
.user-card--premium {
    background: linear-gradient(135deg, #fff, #fef08a);
    border-color: #eab308;
}

/* Elements */
.user-card__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
}

.user-card__username {
    font-size: 1.25rem;
    margin: 10px 0;
}

.user-card__btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
}

/* Element Modifier */
.user-card__btn--active {
    background-color: #2563eb;
    color: white;
}
```

---

## 3. Keep Selectors Simple for Performance

How browsers parse CSS affects page rendering speeds. **Browsers read CSS selectors from right to left** (the "key selector" first, then working upward through parents).

- **Bad (Extremely Inefficient)**:
  `body main .content-wrapper article div.card ul li a`
  - *Why?* The browser must find every `<a>` on the entire page, then traverse up to check if it's in a `<li>`, then a `<ul>`, then a `div.card`, and so on. This causes massive rendering layout shifts.
- **Good (Highly Performant)**:
  `.card__link`
  - *Why?* The browser immediately matches the class and styles it instantly in a single step.

### Selector Rules:
1. **Limit Nesting**: Try to never nest selectors more than 3 levels deep.
2. **Avoid Tag Qualifiers**: Don't write `div.card` when `.card` is sufficient. Specifying the tag name adds unnecessary weight and slows parser matching.
3. **Use Direct Classes**: Instead of targeting lists via `.menu ul li a`, give the link a dedicated class `.menu__link`.

---

## 4. Accessibility (a11y) in CSS

Web accessibility is a critical requirement. Styling should ensure all users can navigate your site.

### A. Maintain Visible Focus Outlines
Many keyboard-navigating users and screen-readers rely on the focus outline to see where they are on the page. **Never remove this outline without offering a visible alternative**.

```css
/* Bad - Accessibility Violation */
a:focus, button:focus {
    outline: none;
}

/* Good - Provides a visible, high-contrast, beautiful outline alternative */
a:focus-visible, button:focus-visible {
    outline: 3px solid #2563eb;
    outline-offset: 4px;
}
```

---

### B. Screen Reader-Only Text (`.sr-only`)
Sometimes you need to include helpful textual context strictly for screen readers, while keeping it hidden visually from standard screens (e.g. labeling a search icon button).

```css
/* Use this utility class to hide elements visually but keep them readable by a11y tools */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

---

### C. Ensure High Contrast
Ensure your text color has a contrast ratio of at least **4.5:1** against its background for standard text, or **3:1** for large headings, satisfying Web Content Accessibility Guidelines (WCAG 2.1).

---

## Practice Exercise

1. Create a CSS stylesheet using variables to store primary, secondary, background, and textual color sets.
2. Build a modern BEM-styled component named `.pricing-card`. 
3. Include elements like `.pricing-card__title`, `.pricing-card__price`, `.pricing-card__features`, and a button named `.pricing-card__btn`.
4. Create a modifier variant named `.pricing-card--popular` that adds an accent border-color and scales the card slightly using `transform: scale(1.05);` on hover to make it pop visually.
