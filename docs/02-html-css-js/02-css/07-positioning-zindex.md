# Positioning & Z-Index

By default, the browser renders HTML elements on a web page following a standard visual layout flow known as the **Normal Document Flow** (block elements stacking vertically, inline elements flowing horizontally). 

However, advanced layouts (such as modal popups, dropdown menus, floating action buttons, and sticky headers) require taking elements out of this normal flow and positioning them at exact coordinates. This is achieved using CSS **Positioning** properties and vertical layering via **Z-Index**.

---

## 1. The Five CSS Positioning Types

To position an element, you first set its `position` property. You then specify its exact coordinates using the **Coordinate Offset Properties**: `top`, `right`, `bottom`, and `left`.

### A. Static Positioning (`position: static`)
This is the default positioning value for every HTML element. Elements render in normal document order.
- **Offsets**: `top`, `right`, `bottom`, `left`, and `z-index` properties have **absolutely no effect**.
- **Document Flow**: The element occupies its natural physical space in the layout.

---

### B. Relative Positioning (`position: relative`)
The element is positioned **relative to its original, natural position** in the normal document flow.
- **Offsets**: Offsets shift the element visually from where it would normally sit. For example, `top: 10px; left: 20px;` shifts the element $10\text{px}$ down and $20\text{px}$ right from its default spot.
- **Document Flow**: Extremely important: **the physical space originally occupied by the element remains reserved in the document flow**. Neighboring elements do not move to fill the gap; it acts as if the element is still in its original place, even if it is rendered elsewhere overlapping other content.
- **Primary Use Case**: Often applied to parent containers strictly to establish a positioning anchor for absolutely-positioned child elements.

---

### C. Absolute Positioning (`position: absolute`)
The element is completely **removed from the normal document flow**. No space is reserved for it, and adjacent elements flow as if it does not exist.
- **Offsets**: Positioned relative to its **closest positioned ancestor** (any parent element styled with a `position` of `relative`, `absolute`, `fixed`, or `sticky`). If no positioned ancestor exists, it aligns relative to the root `<html>` document viewport.
- **Width Behavior**: Shrinks horizontally to fit its content unless explicit widths or left/right coordinates are set.

```css
/* Anchoring a dropdown menu to a card button */
.button-container {
    position: relative; /* Anchor container */
    display: inline-block;
}

.dropdown-menu {
    position: absolute; /* Place relative to container boundary */
    top: 100%;          /* Align immediately below the button */
    left: 0;
    width: 200px;
    background: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

### D. Fixed Positioning (`position: fixed`)
The element is completely **removed from the normal document flow** and positioned **relative to the browser viewport**.
- **Offsets**: Placed directly within the screen coordinates.
- **Scroll Behavior**: Remains locked, frozen in place during scrolling, floating above the page content.
- **Common Use Cases**: Persistent headers, sidebars, floating "Back to Top" buttons, and full-screen modal overlays.

```css
.sticky-alert {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #ef4444;
    color: white;
    padding: 16px;
    border-radius: 8px;
}
```

---

### E. Sticky Positioning (`position: sticky`)
A hybrid behavior. The element acts like `position: relative` within normal flow until the browser scroll window crosses a designated coordinate threshold. At that point, it temporarily locks in place like `position: fixed` until it reaches the boundary of its parent container.
- **Scroll Behavior**: Glides with the page, locks at the threshold, and scrolls away once its parent container exits the screen.
- **Requirement**: You **must** specify at least one coordinate offset (e.g., `top: 0;`) for sticky positioning to activate.

```css
.sticky-table-header {
    position: sticky;
    top: 0; /* Sticks to top of parent table container during vertical scroll */
    background-color: #f8fafc;
}
```

---

## 2. Positioning Quick Reference

| Position Type | Positioned Relative To | Removed From Flow? | Space Reserved? |
| :--- | :--- | :--- | :--- |
| **`static`** | Normal Document Flow | No | Yes |
| **`relative`** | Its own natural position | No | **Yes** |
| **`absolute`** | Closest Positioned Ancestor | **Yes** | No |
| **`fixed`** | Browser Viewport | **Yes** | No |
| **`sticky`** | Scroll threshold / parent boundary | No | Yes |

---

## 3. Z-Index & Stacking Context

When elements are positioned outside the normal flow, they frequently overlap. The **`z-index`** property controls this vertical layering order along the $Z$-axis (depth).

- `z-index` takes integer values (positive, negative, or zero).
- Elements with a higher `z-index` render on top of elements with lower values.
- **CRITICAL RULE**: `z-index` **only works on positioned elements** (`relative`, `absolute`, `fixed`, `sticky`). It is completely ignored on static elements (`position: static`).

### What is a Stacking Context?
A **Stacking Context** is a three-dimensional layering hierarchy formed in the HTML document. When a stacking context is created, all of its child elements are layered relative to this parent context. They cannot escape it.

A stacking context is formed by:
1. The root element (`<html>`).
2. An element styled with `position: relative` or `absolute` and a `z-index` value other than `auto`.
3. An element styled with `position: fixed` or `sticky`.
4. Elements with `opacity` less than `1`.
5. Elements using `transform`, `filter`, or `perspective` values other than `none`.

#### The Golden Rule of Stacking Contexts:
If Parent A has a lower stacking context hierarchy than Parent B, then A's children can **never** render on top of B's children, regardless of how high you set the children's `z-index` values!

```html
<!-- Stacking Context Conflict Example -->
<div class="header" style="position: relative; z-index: 10;">
    <div class="tooltip" style="position: absolute; z-index: 9999;">Tooltips</div>
</div>

<div class="modal-overlay" style="position: fixed; z-index: 20;">
    Modal Contents
</div>
```
- **Outcome**: The tooltip has a `z-index: 9999`, but because it is trapped inside the `.header` context which is locked at `z-index: 10`, it will render **behind** the `.modal-overlay` (`z-index: 20`). 
- **Fix**: Move the overlay elements outside trapped parent containers, or increase the `.header` container's `z-index` to be greater than `20`.

---

## Practice Exercise

1. Create a `relative` container `.parent` with a width of `300px` and height of `300px`. Give it a light gray background.
2. Inside it, create an `.absolute` child box with a size of `50px` by `50px`, colored purple.
3. Position the purple child box at the exact bottom-right corner of the parent box. (Hint: `bottom: 0; right: 0;`).
4. Now, create a second child box inside the container. Position it absolutely at the bottom-right corner as well, but with a different color. 
5. Set `z-index` values on both child boxes to control which colored box renders on top.
