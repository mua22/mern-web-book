# Chapter 8: Advanced Media, Canvas, and Embeds

Embedding media is easy. Ensuring that media is accessible, performant, and secure requires a deeper understanding of HTML5's multimedia APIs.

## Video Subtitles and Captions (`<track>`)

A video is inaccessible to deaf users, or users watching in a noisy environment without headphones, unless it has captions. HTML5 provides the `<track>` element to synchronize text tracks with media playback.

These text tracks are typically written in WebVTT (Web Video Text Tracks) format (`.vtt` files).

```html
<video controls width="800">
    <source src="course-intro.mp4" type="video/mp4">
    
    <!-- English Captions (Default) -->
    <track src="captions-en.vtt" kind="captions" srclang="en" label="English" default>
    
    <!-- Spanish Subtitles -->
    <track src="subs-es.vtt" kind="subtitles" srclang="es" label="Español">
</video>
```
- `kind="captions"`: Intended for deaf audiences. Includes dialogue and sound effects (e.g., "[Door slams]").
- `kind="subtitles"`: Intended for users who can hear but don't understand the language. Includes only dialogue translation.

## The `<canvas>` Element

The `<canvas>` element is a blank drawing board. By itself, it does nothing. It exposes a drawing context to JavaScript, allowing you to render 2D graphics, games, data visualizations (like Chart.js), or even 3D WebGL scenes.

```html
<canvas id="gameBoard" width="800" height="600">
    <!-- Fallback content for screen readers or unsupported browsers -->
    Your browser does not support the canvas element.
</canvas>
```
*Note: The canvas is essentially a raster image. It is inherently inaccessible to screen readers. If you draw a chart on a canvas, you must provide the raw data in an accessible HTML `<table>` visually hidden nearby.*

## Advanced Iframe Security (`sandbox`)

The `<iframe>` element is powerful because it embeds a third-party website. It is also highly dangerous because you are executing untrusted code on your domain.

To mitigate this, HTML5 introduced the `sandbox` attribute. Adding it applies the strictest possible restrictions to the iframe:
- It cannot execute JavaScript.
- It cannot submit forms.
- It cannot open popups.
- It is treated as coming from a unique, isolated origin (preventing access to cookies/storage).

```html
<!-- Fully locked down iframe -->
<iframe src="https://untrusted-site.com" sandbox></iframe>
```

### Granular Sandboxing
Usually, a completely locked-down iframe breaks the content. You can explicitly lift specific restrictions by passing space-separated values to the sandbox attribute.

```html
<!-- Allows JavaScript and forms, but prevents popups and restricts same-origin data access -->
<iframe src="https://widget-provider.com" sandbox="allow-scripts allow-forms"></iframe>
```

## `<object>` vs `<iframe>`

While `<iframe>` is used for HTML documents, the `<object>` tag is a more generic element used to embed external resources, PDFs, or plugin-based media.

```html
<!-- Embedding a PDF directly into the page -->
<object data="syllabus.pdf" type="application/pdf" width="100%" height="600px">
    <p>It appears you don't have a PDF plugin for this browser. <a href="syllabus.pdf">Click here to download the PDF.</a></p>
</object>
```
The fallback content inside the `<object>` tag is critical for a good user experience if the browser cannot render the embedded type.
