# CSS Grid Layout

While CSS Flexbox is a powerful one-dimensional layout tool (for aligning items in rows OR columns), **CSS Grid** is a highly sophisticated **two-dimensional** layout engine. It allows you to align elements in rows AND columns simultaneously, providing ultimate control over complex webpage structures, web-application interfaces, and asymmetric gallery designs.

---

## 1. Grid Container: Defining the Grid

To initialize a grid layout, apply `display: grid` or `display: inline-grid` to the container element. You then define your grid columns and rows using dedicated properties.

### A. Defining Columns & Rows
- `grid-template-columns`: Sets the number and widths of columns.
- `grid-template-rows`: Sets the number and heights of rows.

```css
.simple-grid {
    display: grid;
    /* Create three columns: 200px wide, 100px wide, and 300px wide */
    grid-template-columns: 200px 100px 300px;
    /* Create two rows: 150px high and 200px high */
    grid-template-rows: 150px 200px;
}
```

### B. The Fractional Unit (`fr`)
Instead of pixel sizes or percentages, Grid introduces the **Fractional Unit (`fr`)**. One `fr` represents one share of the free, unallocated space inside the grid container.

```css
.fractional-grid {
    display: grid;
    /* Column 1 gets 1 share of space, Column 2 gets 2 shares, Column 3 gets 1 share.
       Total shares = 4. Column 2 occupies 50% of container width; Columns 1 & 3 occupy 25% each. */
    grid-template-columns: 1fr 2fr 1fr;
}
```

### C. Grid Functions: `repeat()` & `minmax()`
- **`repeat()`**: Simplifies grid definitions by repeating sizes.
- **`minmax()`**: Defines a size range with a strict minimum bound and a fluid maximum bound.

```css
.advanced-container {
    display: grid;
    /* Equivalent to: grid-template-columns: 1fr 1fr 1fr 1fr; */
    grid-template-columns: repeat(4, 1fr);
    
    /* Rows must be at least 100px tall, but can expand to fit content size (auto) */
    grid-template-rows: repeat(3, minmax(100px, auto));
}
```

---

## 2. Spacing the Grid

Use the `gap` property (or individual `row-gap`/`column-gap` rules) to space out your grid items cleanly without resorting to cell margins.

```css
.gapped-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px; /* Inserts 20px of space between all columns and rows */
}
```

---

## 3. Grid Items: Positioning Items

By default, the browser places elements into grid cells sequentially in document order. You can override this and explicitly position items across lines or named areas.

### A. Line-Based Positioning
Every grid is defined by numbered grid lines starting from index `1`. In a 3-column grid, there are 4 vertical grid lines.

```css
.sidebar {
    /* Stretch this element from vertical line 1 to vertical line 2 */
    grid-column-start: 1;
    grid-column-end: 2;
}

.main-content {
    /* Shorthand syntax: grid-column: [start] / [end] */
    grid-column: 2 / 4; /* Stretches across columns 2 and 3 */
    grid-row: 1 / 3;    /* Stretches vertically down rows 1 and 2 */
}
```

### B. The `span` Keyword
Instead of referencing exact end line indices, you can specify how many cells an element should span.

```css
.hero-banner {
    grid-column: 1 / span 3; /* Start at line 1 and stretch across 3 columns */
}
```

---

## 4. Responsive Grid without Media Queries

One of CSS Grid's most powerful features is the ability to build a fully responsive, wrap-around card grid that adapts seamlessly to the viewport width **without writing a single media query**.

### The Layout Formula:
```css
.auto-grid {
    display: grid;
    /* Automatically generate columns that are at least 250px wide, and expand up to 1fr. 
       If the container shrinks below 500px, the grid automatically drops to 1 column. */
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
}
```

### `auto-fit` vs `auto-fill`
- **`auto-fit`**: Fills the row with cells, and if there are empty columns leftover, they collapse to `0px`, causing the active grid items to stretch and fill the remaining row space. (Highly recommended for standard card lists).
- **`auto-fill`**: Fills the row with as many cells as possible, even if they are empty, leaving vacant spaces on the right side if there aren't enough grid items.

---

## 5. UI Layout Recipe: The Holy Grail Layout

The **Holy Grail Layout** is a classic page layout consisting of a header, three-column content (sidebar, main content, secondary sidebar), and a footer. CSS Grid implements this beautifully using named template areas.

### The HTML Structure
```html
<div class="page-layout">
    <header class="page-header">Site Header</header>
    <aside class="left-sidebar">Navigation</aside>
    <main class="page-main">Primary Article Content</main>
    <aside class="right-sidebar">Ads & Sidebar Info</aside>
    <footer class="page-footer">Site Footer</footer>
</div>
```

### The CSS Stylesheet
```css
.page-layout {
    display: grid;
    grid-template-columns: 240px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    
    /* Map out the structural areas of the grid cell-by-cell */
    grid-template-areas:
        "header  header  header"
        "sidebar main    ads"
        "footer  footer  footer";
}

/* Assign elements to their mapped grid areas */
.page-header { grid-area: header; background-color: #1e293b; color: white; padding: 20px; }
.left-sidebar { grid-area: sidebar; background-color: #f1f5f9; padding: 20px; }
.page-main { grid-area: main; padding: 30px; }
.right-sidebar { grid-area: ads; background-color: #f8fafc; padding: 20px; }
.page-footer { grid-area: footer; background-color: #0f172a; color: white; padding: 15px; text-align: center; }

/* Add responsiveness for mobile viewports */
@media (max-width: 768px) {
    .page-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto auto;
        grid-template-areas:
            "header"
            "main"
            "sidebar"
            "ads"
            "footer";
    }
}
```

---

## Practice Exercise

1. Create a `<div>` grid container with 6 child boxes styled with distinct background colors.
2. Define a 3-column layout where the middle column is twice as wide as the outer columns (`1fr 2fr 1fr`) and add a `15px` gap.
3. Position Box 1 to span across all 3 columns.
4. Position Box 2 to span 2 rows vertically.
5. Resize your browser viewport and observe how the cells adjust automatically.
