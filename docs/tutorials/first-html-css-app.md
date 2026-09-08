---
title: "Tutorial: Your First HTML + CSS Page"
tags:
  - HTML
  - CSS
  - Beginner Project
  - Box Model
---

# Creating Your First HTML + CSS Application

This tutorial puts everything from the HTML and CSS fundamentals together into one real,
finished page: a simple personal "About Me" page. No frameworks, no JavaScript — just
semantic HTML and CSS you already know, combined into something you can actually be
proud of and show someone. By the end, you'll have a working two-file project and a
clear mental model of how every line of CSS connects to what you see on screen.

**Prerequisites:** [HTML and HTML5 Fundamentals](../web-technologies/lecture-03-html-html5-fundamentals.md)
and CSS through [the box model](../web-technologies/lecture-06-css-box-model-and-display.md)
(colors, fonts, spacing, borders, `border-radius`, `box-shadow`). This project
deliberately does **not** use Flexbox, Grid, or `position` — those come later, and a
solid page like this one doesn't need them yet.

## In This Tutorial

- Plan a simple page's sections before writing any code
- Set up a two-file project: `index.html` and `style.css`
- Build the HTML structure with semantic tags
- Style it with CSS: colors, the box model, rounded corners, shadows, and a hover effect
- See the finished, real result and understand what every rule is doing
- Get ideas for extending the page yourself

---

## Part 1: Plan Before You Code

Before opening an editor, decide what sections the page actually needs. For this
project:

- A **header** with a name, a small circular avatar, and a short tagline
- An **About Me** section — a paragraph introducing yourself
- A **skills/learning** section — a short list
- A **contact** section — a way to reach you (an email link is enough for now)
- A **footer** with a copyright line

Sketching this out first (even just as a list, like above) means you're never staring at
a blank file wondering what to build next — you already have a checklist.

## Part 2: Set Up Your Project Folder

Create a new folder, and inside it, two empty files: `index.html` and `style.css`. Link
the stylesheet from the HTML file's `<head>`, exactly as you learned in
[CSS Fundamentals](../web-technologies/lecture-05-css-fundamentals.md):

```html
<link rel="stylesheet" href="style.css">
```

Using an **external** stylesheet (rather than inline styles or an internal `<style>`
block) means your HTML stays focused on content and structure, and every style rule
lives in one organized place.

## Part 3: Build the HTML Structure

Here is the complete `index.html`. Notice it's built entirely from tags you already
know — a `<header>`, `<main>` with three `<section>`s inside it, and a `<footer>` — plus
one small, hand-made "avatar" using a styled `<div>` with initials, so the page needs no
external image file at all.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ayesha Khan - About Me</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="profile-header">
            <div class="avatar">AK</div>
            <h1>Ayesha Khan</h1>
            <p class="tagline">BSCS Student &middot; Aspiring Web Developer</p>
        </header>

        <main>
            <section class="about">
                <h2>About Me</h2>
                <p>
                    I'm a 5th-semester Computer Science student learning how the web
                    works, one lecture at a time. This page is my very first project
                    built entirely with HTML and CSS - no frameworks, no JavaScript,
                    just the fundamentals.
                </p>
            </section>

            <section class="skills">
                <h2>What I'm Learning</h2>
                <ul>
                    <li>HTML5 &amp; Semantic Markup</li>
                    <li>CSS Fundamentals &amp; the Box Model</li>
                    <li>Responsive Design</li>
                    <li>JavaScript (coming soon)</li>
                </ul>
            </section>

            <section class="contact">
                <h2>Get In Touch</h2>
                <p>Have a question about this page? Send me an email.</p>
                <a class="btn" href="mailto:ayesha.khan@example.com">Email Me</a>
            </section>
        </main>

        <footer>
            <p>&copy; 2026 Ayesha Khan. Built with HTML &amp; CSS.</p>
        </footer>
    </div>
</body>
</html>
```

A few things worth noticing:

- Everything is wrapped in one `<div class="container">`. This is the single element
  CSS will use to center the whole page and give it a card-like shape.
- `class="avatar"`, `class="profile-header"`, `class="tagline"`, and `class="btn"` don't
  do anything by themselves — they're just hooks for the CSS you'll write next, exactly
  like you learned with [class selectors](../web-technologies/lecture-05-css-fundamentals.md#class-selector).
- Replace `"Ayesha Khan"`, the initials, the tagline, and the email address with your
  own — this is *your* page.

## Part 4: Style It With CSS

Here is the complete `style.css`. Read it top to bottom — every rule is something from
the CSS fundamentals and box model material, just applied together on a real page.

```css
:root {
  --color-primary: #2b2b7a;
  --color-accent: #ff8a3d;
  --color-bg: #f4f4f8;
  --color-card: #ffffff;
  --color-text: #333333;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.container {
  max-width: 600px;
  margin: 40px auto;
  background-color: var(--color-card);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.profile-header {
  background-color: var(--color-primary);
  color: white;
  text-align: center;
  padding: 40px 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  line-height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background-color: var(--color-accent);
  color: white;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
}

.profile-header h1 {
  margin: 0 0 4px;
}

.tagline {
  margin: 0;
  opacity: 0.85;
}

main {
  padding: 30px;
}

section {
  margin-bottom: 30px;
}

section:last-child {
  margin-bottom: 0;
}

h2 {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-bg);
  padding-bottom: 8px;
}

.skills ul {
  padding-left: 20px;
}

.skills li {
  margin-bottom: 6px;
}

.btn {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  background-color: var(--color-accent);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn:hover {
  background-color: #e67528;
  transform: translateY(-2px);
}

footer {
  text-align: center;
  padding: 16px;
  font-size: 13px;
  color: #777;
  border-top: 1px solid var(--color-bg);
}
```

Walking through the interesting parts:

- **`:root` custom properties.** Five colors are defined once at the top and reused with
  `var(--color-name)` everywhere else. Change `--color-primary` in one place, and the
  header, headings, and border colors all update together.
- **`* { box-sizing: border-box; }`.** This changes how `width`/`height` are calculated
  for *every* element (recall the box model: with `border-box`, padding and border are
  included inside the stated width, instead of added on top of it). Most real projects
  set this globally, right at the top of the stylesheet, for exactly this reason.
- **`.container`** uses `max-width: 600px` with `margin: 40px auto`. This is the classic
  beginner-friendly centering trick: an element with a fixed `max-width` and
  `margin: auto` on the left/right centers itself horizontally in the page — no Flexbox
  or Grid required.
- **`.avatar`** is centered *text* inside a circle using `line-height` equal to the
  circle's `height` — another simple, pre-Flexbox trick for vertically centering a single
  line of text inside a box.
- **`.btn:hover`** changes the background color and nudges the button up slightly
  (`translateY(-2px)`) on hover, smoothed over 0.2 seconds by the `transition` property —
  a small touch that makes the page feel interactive without any JavaScript at all.

## Part 5: See It Running

Open `index.html` directly in your browser (double-click it, or right-click → Open
With). Here is what this exact HTML and CSS produce:

![Rendered output: a centered white card on a light gray page, with a dark blue header containing an orange circular avatar showing the initials AK, the name "Ayesha Khan" and a tagline, followed by About Me, What I'm Learning, and Get In Touch sections, and an orange "Email Me" button](../assets/img/tutorials/first-html-css-app.png)

Try hovering your mouse over the **Email Me** button in your own browser — you'll see the
color change and the slight upward movement that `.btn:hover` and `transition` produce
together, something a still screenshot can't show.

## Try It Yourself

1. Replace the name, initials, tagline, about text, skills, and email address with your
   own, and change `--color-primary` and `--color-accent` to a color scheme you like.
2. Add a fourth section — a "Projects" section with a short paragraph or a list of things
   you've built or want to build.
3. Replace the initials `<div class="avatar">` with a real photo instead: add
   `<img src="photo.jpg" alt="A photo of Ayesha Khan" class="avatar">` in the HTML (an
   `<img>` can take the same `class="avatar"` styling), and add `object-fit: cover;` to
   the `.avatar` CSS rule so a rectangular photo still fills the circle correctly.
4. Add a second button next to "Email Me" — for example a link to a GitHub profile —
   reusing the same `.btn` class so it automatically matches the existing style.

## Key Takeaways

- A real page is just familiar HTML tags and CSS rules, combined — nothing you built here
  required anything beyond HTML structure and the CSS box model.
- `:root` custom properties let you define a color scheme once and reuse it everywhere,
  making the whole page easy to re-theme later.
- `max-width` + `margin: auto` centers a block element without needing Flexbox or Grid —
  a genuinely useful technique on its own, not just a beginner stepping stone.
- Small touches like a `:hover` state with a `transition` make a plain page feel
  noticeably more polished, with only a few lines of CSS and no JavaScript.
