---
title: "Lab 04: CSS Advanced Concepts"
---

# Lab 04: CSS Advanced Concepts

## Objective:

To develop practical skills in modern CSS layout, responsive design, component positioning, visual effects, and animation, using Flexbox, CSS Grid, transitions, transforms, pseudo-classes/elements, and keyframe animations.

## Activity Outcomes:

- Explain when Flexbox and CSS Grid should be used for page and component layout.
- Construct one-dimensional layouts with Flexbox using alignment, spacing, wrapping and ordering.
- Construct two-dimensional layouts with CSS Grid using tracks, gaps, and named areas.
- Apply mobile-first responsive design with media queries and fluid CSS units.
- Use relative, absolute, fixed and sticky positioning appropriately.
- Create interactive visual feedback using pseudo-classes and pseudo-elements.
- Apply transitions, transforms, and controlled @keyframes animations.
- Debug layout and responsive behaviour using browser Developer Tools.

## 1) Useful Concepts

**Flexbox vs Grid:**

| Feature | Flexbox | Grid |
|---|---|---|
| Dimensions | One-dimensional | Two-dimensional |
| Best for | Component-level alignment (navbars, toolbars, form rows) | Page/section layout (dashboards, galleries, page shells) |
| Key tools | justify-content, align-items, flex, gap | grid-template-columns, grid-template-areas, gap |

```css
.navbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }

.card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
```

**Responsive design and fluid units:**

A mobile-first approach starts with a compact base layout and progressively enhances it for larger screens using min-width media queries. Prefer content-driven breakpoints over device-named ones.

```css
@media (min-width: 768px) { .page { grid-template-columns: 240px 1fr; } }
@media (min-width: 1100px) { .page { grid-template-columns: 260px 1fr 280px; } }

h1 { font-size: clamp(1.8rem, 4vw, 3.2rem); }         /* min, preferred, max */
.container { width: min(92%, 1100px); padding-inline: max(1rem, 3vw); }
```

**Positioning and stacking:**

| Position | Behaviour | Typical use |
|---|---|---|
| static | Normal document flow | Default |
| relative | Stays in flow; becomes a positioning context | Badge anchors, small offsets |
| absolute | Removed from flow; positioned against nearest positioned ancestor | Overlays, badges |
| fixed | Positioned relative to the viewport | Persistent action buttons |
| sticky | Relative until a scroll threshold, then fixed | Sticky headers/sidebars |

z-index controls stacking order within a stacking context -a higher value does not automatically place an element above everything else on the page if it sits inside a different stacking context.

**Pseudo-classes, pseudo-elements, transitions, transforms:**

```css
.button:hover { transform: translateY(-2px); }
.button:focus-visible { outline: 3px solid #8ec5ff; outline-offset: 3px; }
input:invalid { border-color: #d73a49; }
.external-link::after { content: " ↗"; font-size: .9em; }

.button { transition: transform 180ms ease, background-color 180ms ease; }
.card:hover { transform: translateY(-6px) scale(1.01); }
```

**Keyframe animations and reduced motion:**

```css
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.status-dot { animation: pulse 1.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**CSS custom properties (variables):**

Custom properties centralise reusable values (colors, spacing, radii) for easier maintenance -a natural next step after the box-sizing/box-model foundation from Lab 03; this lab reuses that foundation rather than re-teaching it.

```javascript
:root { --color-primary: #005cc5; --space-md: 1rem; --radius-md: 0.75rem; }
.card { padding: var(--space-md); border-radius: var(--radius-md); }
```

## 2) Solved Lab Activities

| Sr. No. | Allocated Time | Level of Complexity | CLO Mapping |
|---|---|---|---|
| Activity 4.1 | 30 Minutes | Medium | CLO-4 |
| Activity 4.2 | 30 Minutes | Medium | CLO-4 |
| Activity 4.3 | 30 Minutes | Medium | CLO-4 |

### Activity 4.1: Responsive navigation bar

*Create a responsive navigation bar. On small screens, navigation links should wrap neatly. On larger screens, the brand, navigation links, and action button should be aligned horizontally.*

**Solution:**

```html
<nav class="site-nav">
  <a class="site-brand" href="#">CUI Web Technologies</a>
  <div class="site-links"><a href="#">Home</a><a href="#">Labs</a><a href="#">Contact</a></div>
  <a class="nav-button" href="#">Login</a>
</nav>

.site-nav { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1rem 1.5rem; background: #17365d; }
.site-links { display: flex; gap: 1rem; flex-wrap: wrap; }
.nav-button { padding: .55rem .9rem; border-radius: .5rem; background: #005cc5; color: #fff; text-decoration: none; }

@media (max-width: 700px) {
  .site-nav { justify-content: center; }
  .site-brand { flex-basis: 100%; text-align: center; }
}
```

### Activity 4.2: Responsive dashboard with CSS Grid

*Build a dashboard containing a header, sidebar, main content area, and cards. Use Grid for the page structure and a nested Grid for the cards.*

**Solution:**

```html
<div class="dashboard">
  <header class="dashboard-header">Dashboard</header>
  <aside class="dashboard-sidebar">Navigation</aside>
  <main class="dashboard-main">
    <section class="stats">
      <article class="stat-card">Students<br><strong>240</strong></article>
      <article class="stat-card">Projects<br><strong>36</strong></article>
    </section>
  </main>
</div>

.dashboard { min-height: 100vh; display: grid; grid-template: "header header" auto "sidebar main" 1fr / 220px 1fr; }
.dashboard-header { grid-area: header; } .dashboard-sidebar { grid-area: sidebar; } .dashboard-main { grid-area: main; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }

@media (max-width: 700px) {
  .dashboard { grid-template: "header" auto "main" 1fr "sidebar" auto / 1fr; }
}
```

### Activity 4.3: Interactive card with animation

*Create an information card that uses a hover transition, a pseudo-element, and a small keyframe animation. Ensure keyboard users receive visible focus feedback.*

**Solution:**

```html
<article class="info-card">
  <h2>CSS Animation</h2>
  <p>Learn how transitions and keyframes improve user interaction.</p>
  <a class="learn-more" href="#">Learn more</a>
</article>

.info-card { position: relative; padding: 1.5rem; border-radius: .9rem; border: 1px solid #d9e2f3; transition: transform 180ms ease; animation: entrance 450ms ease-out both; }
.info-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 4px; background: #005cc5; }
.info-card:hover { transform: translateY(-4px); }
.learn-more:focus-visible { outline: 3px solid #8ec5ff; outline-offset: 3px; }

@keyframes entrance { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
```

## 3) Graded Lab Tasks

*Note: The instructor may adjust these tasks to the level of difficulty and complexity of the solved activities. Tasks should be evaluated in the same lab session.*

**Lab Task 1: Responsive university landing page**

Create a header, navigation bar, hero section, three feature cards, and a footer. Use Flexbox for the navigation and CSS Grid for the feature section; the layout must adapt to small and large screens.

**Lab Task 2: Product card gallery**

Create a responsive product gallery with at least six cards (image, name, description, price, badge, action button). Use auto-fit/minmax() for the grid and add an accessible hover/focus interaction.

**Lab Task 3: Dashboard layout**

Create a responsive dashboard using grid-template-areas (header, sidebar, main, stats cards, footer). On small screens, reorganize into a single-column structure.

**Lab Task 4: Animated information component**

Create an information component using a pseudo-element, transition, transform, and @keyframes animation. Include a prefers-reduced-motion rule and a visible keyboard-focus state.

**Lab Task 5: Refactor a previous lab**

Take a page from Lab 01, 02 or 03 and refactor its layout using Flexbox/Grid, introduce CSS custom properties, and make it responsive.
