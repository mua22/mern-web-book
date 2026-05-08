# Chapter 9: HTML Best Practices for the Modern Web

A senior engineer doesn't just write HTML that "works." They write HTML that performs exceptionally well against Core Web Vitals, ranks high in SEO, and is flawlessly accessible.

## HTML and Core Web Vitals

Google uses Core Web Vitals to rank websites based on actual user experience metrics. Your HTML structure directly impacts these scores.

### 1. Largest Contentful Paint (LCP)
LCP measures how long it takes for the largest visual element (usually a hero image or an `<h1>`) to render.
**HTML Fix:** Preload your LCP image in the `<head>`, and never use `loading="lazy"` on images that appear "above the fold" (visible immediately on load).

### 2. Cumulative Layout Shift (CLS)
CLS measures visual stability. Have you ever gone to click a button, but an image suddenly loads, pushing the button down, making you click an ad instead? That is a layout shift.
**HTML Fix:** Always explicitly define `width` and `height` attributes on `<img>` and `<iframe>` tags. This reserves the exact space in the DOM before the asset even downloads.

```html
<!-- Good: Prevents CLS -->
<img src="banner.jpg" width="1200" height="400" alt="Banner">
```

## Structured Data (Schema.org & JSON-LD)

While semantic tags (`<article>`, `<footer>`) help search engines, they are often not enough for complex data like recipes, product reviews, or event tickets. 

To get "Rich Snippets" (like star ratings or cooking times directly in Google search results), you must inject **Structured Data** into your HTML. The modern standard is JSON-LD (JavaScript Object Notation for Linked Data), placed in a `<script>` tag inside the `<head>`.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Book",
  "name": "MERN Web Technologies",
  "author": {
    "@type": "Person",
    "name": "Usman"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "150"
  }
}
</script>
```

## Advanced Accessibility: Focus Management

Users who cannot use a mouse rely on the `Tab` key to navigate the interactive elements of your page. The order in which elements receive focus is called the "tab order," and it follows the flow of the DOM tree.

### The `tabindex` Attribute
Native interactive elements (`<a>`, `<button>`, `<input>`) are automatically focusable. Static elements (`<div>`, `<p>`) are not.

You can modify this behavior using the `tabindex` attribute.

- **`tabindex="0"`**: Adds a normally non-focusable element into the natural tab order. Use this if you've built a custom interactive widget out of a `<div>` (though you should prefer a `<button>`).
- **`tabindex="-1"`**: Removes an element from the natural tab order, but allows it to be focused programmatically via JavaScript. This is essential for managing focus in modal dialogs.
- **`tabindex="1"` (or any positive number)**: Forces a specific tab order, overriding the DOM structure. **Antipattern: Never do this.** It creates an unpredictable nightmare for keyboard users.

```html
<!-- Custom interactive element added to the tab order -->
<div class="custom-dropdown" tabindex="0" role="combobox" aria-expanded="false">
    Select Option
</div>
```

## Final Checklist for HTML Excellence

1. **Does it validate?** Run your URL through the W3C Markup Validation Service.
2. **Is it semantically accurate?** If CSS was disabled, would the structure still make logical sense?
3. **Is it accessible?** Unplug your mouse, turn on a screen reader (VoiceOver or NVDA), and try to navigate your site. 
4. **Is it lean?** Avoid "Divitis" (wrapping everything in unnecessary divs). Flatter DOM trees render faster.
