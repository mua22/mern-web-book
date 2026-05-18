# Selectors & Specificity

To style HTML elements, you first need a way to target them. **CSS Selectors** define exactly which elements in the HTML tree will receive your styling declarations. When multiple styling rules conflict on the same element, the **Cascade** and **Specificity** rules govern which styles win.

---

## 1. CSS Selectors

Selectors can be simple, complex, attribute-based, or state-based.

### A. Basic Selectors

| Name | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| **Universal** | `*` | Targets every single element on the page. | `* { box-sizing: border-box; }` |
| **Type (Element)** | `element` | Targets all elements of a specific HTML tag. | `p { line-height: 1.6; }` |
| **Class** | `.class` | Targets all elements with a specific `class` attribute. | `.btn { padding: 10px; }` |
| **ID** | `#id` | Targets the single element with a unique `id` attribute. | `#nav-bar { display: flex; }` |

---

### B. Combinator Selectors

Combinators describe relationships between different selectors in the HTML structure.

#### 1. Descendant Selector (space)
Targets all elements that are inside the specified parent element, regardless of how deep they are nested.
```css
/* Targets all <a> elements inside any <nav> element */
nav a {
    color: #4f46e5;
    text-decoration: none;
}
```

#### 2. Child Selector (`>`)
Targets only elements that are immediate, direct children of the specified parent element.
```css
/* Targets only <li> elements that are direct children of <ul class="menu"> */
ul.menu > li {
    border-bottom: 1px solid #e5e7eb;
}
```

#### 3. Adjacent Sibling Selector (`+`)
Targets an element that is directly next to (immediately following) another specified element at the same nesting level.
```css
/* Targets only the first <p> element that immediately follows an <h1> */
h1 + p {
    font-size: 20px;
    color: #4b5563;
}
```

#### 4. General Sibling Selector (`~`)
Targets all sibling elements that follow another specified element at the same nesting level, even if they aren't directly adjacent.
```css
/* Targets all <p> elements that follow an <h2> sibling */
h2 ~ p {
    color: #6b7280;
}
```

---

### C. Attribute Selectors

Attribute selectors target elements based on the presence, name, or exact value of their HTML attributes.

```css
/* 1. Presence: Targets any <a> with a target attribute */
a[target] {
    font-weight: 600;
}

/* 2. Exact Match: Targets <input type="password"> */
input[type="password"] {
    letter-spacing: 4px;
}

/* 3. Starts With (^=): Targets links whose href starts with https */
a[href^="https"] {
    color: green;
}

/* 4. Ends With ($=): Targets links ending in .pdf */
a[href$=".pdf"] {
    background-image: url('pdf-icon.png');
}

/* 5. Contains (*=): Targets elements whose class contains "btn-" */
button[class*="btn-"] {
    border-radius: 4px;
}
```

---

### D. Pseudo-Classes & Pseudo-Elements

#### Pseudo-Classes
Pseudo-classes target elements based on their user state, structural position, or current status. They are prefixed with a single colon (`:`).

```css
/* User Interactions */
a:hover { text-decoration: underline; }  /* Cursor hovers over link */
input:focus { border-color: #3b82f6; }   /* Element receives focus */
button:active { transform: scale(0.98); } /* Element is clicked */

/* Structural Position */
li:first-child { font-weight: bold; }    /* First list item */
li:last-child { border: none; }          /* Last list item */
tr:nth-child(even) { background: #f3f4f6; } /* Zebra striping */
```

#### Pseudo-Elements
Pseudo-elements are used to style a specific part of an element. They are prefixed with a double colon (`::`).

```css
/* Insert decorative content before or after an element */
.required::after {
    content: " *";
    color: #ef4444;
}

/* Style the first letter of a paragraph (Drop Cap) */
p.intro::first-letter {
    font-size: 200%;
    font-weight: bold;
    color: #2563eb;
}

/* Style input placeholders */
input::placeholder {
    color: #9ca3af;
    font-style: italic;
}
```

---

## 2. The Cascade & Specificity

The term **Cascading** in CSS refers to the engine that determines which styling declarations override others when conflicts arise. The cascade decides this based on three main pillars (in order of priority):

1. **Importance**: Does the rule use `!important`?
2. **Specificity**: Which selector pattern is more specific?
3. **Source Order**: If importance and specificity are tied, the rule declared latest (bottom of the file) wins.

---

### Understanding Specificity Math

Specificity is represented as a 4-part weight score: `(Inline, ID, Class, Type)`.

We calculate the score by counting occurrences:

1. **Inline Styles** (Column 1): Written directly inside the HTML `style` attribute. (Score: `1, 0, 0, 0` or 1000)
2. **ID Selectors** (Column 2): e.g., `#header`, `#footer`. (Score: `0, 1, 0, 0` or 100)
3. **Classes, Pseudo-classes, & Attributes** (Column 3): e.g., `.btn`, `:hover`, `[type="text"]`. (Score: `0, 0, 1, 0` or 10)
4. **Elements & Pseudo-elements** (Column 4): e.g., `div`, `p`, `::before`. (Score: `0, 0, 0, 1` or 1)

*Note: The universal selector (`*`) has no specificity score (`0, 0, 0, 0`).*

### Specificity Comparison Table

Let's rank some selectors by their mathematical weights:

| Selector | Inline | ID | Class/Attr/Pseudo | Element/Pseudo | Total Score | Rank |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `style="..."` | 1 | 0 | 0 | 0 | **1000** | **1 (Highest)** |
| `#sidebar .widget ul li a:hover` | 0 | 1 | 2 | 3 | **123** | **2** |
| `#main-content p` | 0 | 1 | 0 | 1 | **101** | **3** |
| `.nav-bar .menu-item a` | 0 | 0 | 2 | 1 | **21** | **4** |
| `div ul li a` | 0 | 0 | 0 | 4 | **4** | **5** |
| `a` | 0 | 0 | 0 | 1 | **1** | **6 (Lowest)** |

#### Example Conflict:
```css
/* Score: 0, 0, 1, 1 (11) */
.highlight p {
    color: red;
}

/* Score: 0, 0, 0, 2 (2) */
div p {
    color: blue;
}
```
**Outcome**: The paragraph text will be **red** because `.highlight p` has a higher specificity score (`11`) than `div p` (`2`).

---

## 3. Inheritance & Overrides

### Inheritance
Some CSS properties inherit their values from their parent elements automatically by default (e.g., `color`, `font-family`, `line-height`). Others do not (e.g., `margin`, `padding`, `border`, `width`).

You can explicitly force inheritance behavior using CSS global values:
- `inherit`: Forces an element to take the property value of its parent.
- `initial`: Resets the property to its default browser value.
- `unset`: Acts as `inherit` if the property naturally inherits, or `initial` if it does not.

```css
/* Force an <a> inside a card to inherit its parent's text color */
.card a {
    color: inherit;
}
```

### The `!important` Rule
Adding `!important` to a CSS declaration forces it to override all other specificity rules, making it the ultimate selector trump card.

```css
p {
    color: blue !important; /* This paragraph will remain blue */
}

#special-paragraph {
    color: red; /* Normally wins because of ID specificity, but loses to !important */
}
```

> [!WARNING]
> **Use `!important` with extreme caution.** Overusing it destroys the cascading nature of CSS, makes your stylesheets extremely difficult to maintain, and leads to code inflation. 
> Only use `!important` in utility classes (e.g., `.hidden { display: none !important; }`) or as a temporary emergency patch during troubleshooting.

---

## Practice Exercise

Given the following HTML structure:

```html
<div id="parent" class="container">
    <p class="text-content">What color will I be?</p>
</div>
```

Calculate the specificity scores for the following conflicting CSS rules and determine which one will style the paragraph:

1. `div p { color: orange; }`
2. `.container p { color: green; }`
3. `#parent .text-content { color: purple; }`
4. `div.container p.text-content { color: blue; }`

*Answer hint: Calculate the weight tuple (Inline, ID, Class, Element) for each ruleset. The highest score wins!*
