# Introduction to Tailwind CSS

Tailwind CSS is a utility-first CSS framework packed with classes like `flex`, `pt-4`, `text-center`, and `rotate-90` that can be composed to build any design, directly in your markup.

## Utility-First Paradigm

Unlike Bootstrap, which provides opinionated, pre-designed components (like a `.card` or `.btn`), Tailwind provides low-level utility classes. Instead of writing custom CSS, you apply these utilities directly to your HTML elements.

This approach offers maximum flexibility and avoids the problem of "framework lock-in" where every site looks exactly the same.

## Benefits of Tailwind

1. **No More Inventing Class Names**: You don't have to agonize over naming conventions like BEM. You just apply utility classes.
2. **Smaller CSS Bundle Sizes**: Tailwind's compiler automatically removes unused CSS classes, resulting in incredibly small production stylesheets.
3. **Safer Changes**: CSS is global, making changes risky. With Tailwind, styles are scoped to the HTML element, so changing one element won't accidentally break another.

### Example

```html
<!-- A styled button using Tailwind -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
 Click Me
</button>
```

While it might look like inline styles at first glance, utility classes provide the power of CSS (like hover states, media queries, and theming) without the drawbacks of managing large CSS files.
