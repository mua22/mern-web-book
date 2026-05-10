# Advanced Data Representation

When dealing with complex data, developers often reach for JavaScript grids or complex CSS frameworks. However, mastering native HTML lists and tables ensures your data remains fundamentally accessible and machine-readable.

## Complex Nested Lists

Lists (`<ul>`, `<ol>`, `<dl>`) can be infinitely nested, but the structure must be precise. A common mistake is placing nested `<ol>` or `<ul>` tags directly inside the parent `<ul>`. **Nested lists must always be children of an `<li>` element.**

```html
<!-- CORRECT WAY to nest lists -->
<ol>
    <li>Prepare the environment
        <ul>
            <li>Install Node.js</li>
            <li>Install MongoDB</li>
        </ul>
    </li>
    <li>Initialize the project</li>
</ol>
```

### Advanced Description Lists
Description lists (`<dl>`) are often underutilized. They are perfect for metadata, glossaries, or any key-value pairs. You can have multiple `<dt>` (terms) mapping to a single `<dd>` (description), or vice versa.

```html
<dl>
    <!-- Multiple terms, one description -->
    <dt>Color</dt>
    <dt>Colour</dt>
    <dd>The property possessed by an object of producing different sensations on the eye.</dd>

    <!-- One term, multiple descriptions -->
    <dt>Server</dt>
    <dd>A computer that provides data to other computers.</dd>
    <dd>A waiter in a restaurant.</dd>
</dl>
```

## Professional Table Architecture

Tables should strictly be used for multidimensional data. They are heavily scrutinized by screen readers, so failing to implement accessibility attributes renders the table useless to visually impaired users.

### 1. Semantic Sections
Always split your table into `<thead>`, `<tbody>`, and `<tfoot>`. This is not just for semantics; CSS can use these tags to create scrollable table bodies while keeping the header fixed at the top of the screen.

### 2. The `scope` Attribute
Screen readers read tables linearly (cell by cell). When a user hears "Data: 500", they need to know what row and column that "500" belongs to. The `scope` attribute explicitly ties data cells to header cells.

- `scope="col"`: Specifies that the header applies to the entire column below it.
- `scope="row"`: Specifies that the header applies to the entire row next to it.

### 3. `<colgroup>`
If you need to apply CSS classes to entire columns (e.g., highlighting the "Pricing" column), doing it cell-by-cell is inefficient. Use `<colgroup>`.

### The Ultimate Accessible Table Example

```html
<table>
    <caption>Annual SaaS Revenue Projection (2026)</caption>
    
    <colgroup>
        <col class="column-primary">
        <col class="column-q1" style="background-color: #f4f4f4;">
        <col class="column-q2">
    </colgroup>

    <thead>
        <tr>
            <!-- Empty header cell for the top-left corner -->
            <td></td> 
            <th scope="col">Q1 ($)</th>
            <th scope="col">Q2 ($)</th>
        </tr>
    </thead>

    <tbody>
        <tr>
            <th scope="row">Basic Tier</th>
            <td>50,000</td>
            <td>65,000</td>
        </tr>
        <tr>
            <th scope="row">Pro Tier</th>
            <td>120,000</td>
            <td>145,000</td>
        </tr>
    </tbody>

    <tfoot>
        <tr>
            <th scope="row">Total</th>
            <td>170,000</td>
            <td>210,000</td>
        </tr>
    </tfoot>
</table>
```
**Why this is professional-grade:**
1. The `<caption>` provides context before the user even enters the table.
2. `<colgroup>` allows for efficient, column-wide CSS styling.
3. `scope` ensures perfect screen-reader navigation.
4. `<tfoot>` is cleanly separated for summary data.
