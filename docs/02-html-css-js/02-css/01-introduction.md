# Introduction to CSS

Cascading Style Sheets (CSS) is the language used to style an HTML document. While HTML describes the structure of a web page, CSS describes how HTML elements are to be displayed on screen, paper, or in other media.

## The Role of CSS

CSS saves a lot of work. It can control the layout of multiple web pages all at once. By separating content (HTML) from presentation (CSS), web development becomes much more efficient and maintainable.

### Core Concepts

1. **Selectors**: Patterns used to select the element(s) you want to style.
2. **Properties**: The specific stylistic aspect you want to change (e.g., `color`, `font-size`, `margin`).
3. **Values**: The setting for the property (e.g., `red`, `16px`, `10px`).

### Syntax Example

```css
h1 {
 color: blue;
 font-size: 24px;
}
```

In this example, `h1` is the selector, `color` and `font-size` are properties, and `blue` and `24px` are values.

## The Box Model

Every element in web design is a rectangular box. The CSS box model is essentially a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.

- **Content**: The text or image content of the box.
- **Padding**: Clears an area around the content. The padding is transparent.
- **Border**: A border that goes around the padding and content.
- **Margin**: Clears an area outside the border. The margin is transparent.

Understanding the box model is critical for creating accurate layouts and spacing your elements correctly.

## Layout Mechanisms

CSS provides several mechanisms for laying out elements on a page:
- **Normal Flow**: The default layout behavior.
- **Flexbox**: A one-dimensional layout model for aligning items in rows or columns.
- **CSS Grid**: A two-dimensional layout model for complex grid-based designs.
- **Positioning**: Taking elements out of normal flow and positioning them absolutely or relatively.
