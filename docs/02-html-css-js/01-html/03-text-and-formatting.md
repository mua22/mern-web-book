# Advanced Text & Formatting Semantics

Text formatting in HTML is not about visual presentation; it is about semantic precision. A screen reader or search engine extracts entirely different meanings from text based on the tags you use.

## The True Hierarchy of Headings

Headings (`<h1>` to `<h6>`) must strictly form an outline of your document. 
- **SEO Impact**: Google's algorithms use the heading hierarchy to understand the primary topics of a page. 
- **Accessibility Impact**: Screen reader users often press the `H` key to jump from heading to heading. If you skip levels (e.g., an `<h2>` followed directly by an `<h4>`), it disorients the user.

```html
<!-- Correct Outline -->
<h1>Building a REST API</h1>
 <h2>1. Setup</h2>
 <h3>1.1 Installing Express</h3>
 <h2>2. Routing</h2>
```

## Meaningful Inline Formatting

Do not use `<b>` (bold) and `<i>` (italic) for emphasis. They are largely deprecated in favor of semantic equivalents.

- **`<strong>`**: Represents strong importance. Screen readers will inject an urgent tone.
- **`<em>`**: Represents stress emphasis. It changes the meaning of the sentence. (e.g., "I *love* coding" vs "I love *coding*").
- **`<mark>`**: Represents text highlighted for reference purposes, like a search result match.

## Quotes and Citations

When referencing external works, HTML provides robust tags.

### `<blockquote>`
Used for extended quotations that take up an entire block. The `cite` attribute provides the URL source of the quote (useful for search engines, though invisible to the user).

```html
<blockquote cite="https://developer.mozilla.org/en-US/docs/Web/HTML">
 <p>HTML is the most basic building block of the Web. It defines the meaning and structure of web content.</p>
</blockquote>
```

### `<q>` and `<cite>`
- `<q>` is used for short, inline quotations. The browser automatically adds quotation marks around it.
- `<cite>` represents the title of a work (a book, a paper, a movie). It is typically rendered in italics.

```html
<p>As stated in <cite>The Pragmatic Programmer</cite>, <q>Don't Repeat Yourself (DRY)</q> is a core principle.</p>
```

## The Power of the `<time>` Tag

Dates are notoriously difficult for machines to parse due to global formatting differences (e.g., 10/11/12 could be Oct 11, 2012 or Nov 10, 2012). The `<time>` element solves this using the `datetime` attribute, strictly formatted in ISO 8601.

```html
<!-- The user sees a friendly string, the machine sees a precise UTC timestamp -->
<p>The server crashed on <time datetime="2026-10-11T14:30:00Z">October 11th at 2:30 PM</time>.</p>
```
*Note: This is incredibly powerful for adding calendar events dynamically or for SEO local search indexing.*

## Computer Code & Technical Text

For developer documentation (like this book), HTML has highly specific semantic tags for representing computer terminology:

- **`<code>`**: Defines a fragment of computer code.
- **`<pre>`**: Preformatted text. It preserves exact spaces and line breaks. (Often used to wrap `<code>` blocks).
- **`<kbd>`**: Represents keyboard input or keystrokes.
- **`<samp>`**: Represents sample output from a computer program.
- **`<var>`**: Represents a variable in programming or mathematical expressions.

### Technical Example:
```html
<p>To list files, open your terminal and type <kbd>ls -la</kbd>.</p>

<p>The system should return the following output:</p>
<pre><samp>
drwxr-xr-x 5 root wheel 160 Oct 12 09:00 .
drwxr-xr-x 10 root wheel 320 Oct 11 18:30 ..
</samp></pre>

<p>In our script, the variable <var>x</var> stores the integer result.</p>
```
Using these tags allows you to target them easily with CSS (e.g., making `<kbd>` look like a physical keyboard key).
