# Introduction to Bootstrap

Bootstrap is the most popular CSS framework for developing responsive and mobile-first websites. It provides a massive collection of pre-designed CSS classes and JavaScript components that allow developers to build consistent, professional-looking interfaces rapidly.

## Key Features

1. **Responsive Grid System**: A powerful 12-column grid layout that automatically adapts to different screen sizes (mobile, tablet, desktop).
2. **Pre-styled Components**: Ready-to-use components like navigation bars, modals, dropdowns, buttons, and alerts.
3. **Utility Classes**: Quick utility classes for margins, padding, colors, typography, and display properties.
4. **JavaScript Plugins**: Interactive components powered by custom JavaScript, eliminating the need to write complex logic from scratch.

## How Bootstrap Works

Instead of writing custom CSS for every element, you apply Bootstrap's predefined classes directly in your HTML.

### Example

```html
<!-- A simple Bootstrap Button -->
<button class="btn btn-primary btn-lg">Click Me</button>

<!-- A simple Bootstrap Grid -->
<div class="container">
 <div class="row">
 <div class="col-md-6">Left Column</div>
 <div class="col-md-6">Right Column</div>
 </div>
</div>
```

In the grid example, the layout will automatically stack vertically on small screens and display side-by-side on medium and larger screens, purely through the use of the `container`, `row`, and `col-md-6` classes.
