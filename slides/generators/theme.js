// Shared visual theme + slide-building helpers for every CSC336 lecture deck.
//
// Every lecture's generator script (lecture-NN.js) requires() this module
// instead of redefining colors/fonts/helpers itself, so all ten decks share
// one design system by construction, not by convention.
//
// Usage in a lecture script:
//   const theme = require("./theme");
//   const { NAVY, ORANGE, ... , bg, kicker, title, pageFoot, ... } = theme;

const PRESENTER_NAME = "Usman Akram";
const INSTITUTION = "COMSATS University Islamabad";

// ---------- palette ----------
const NAVY = "2B2B7A";
const NAVY_DK = "1E1E4C";
const ORANGE = "FF8A3D";
const ORANGE_DK = "E67528";
const WHITE = "FFFFFF";
const INK = "26262F";
const MUTED = "5D5D72";
const TINT = "F1F1F8";
const ICE = "C9D3F5";
const ICE_MUTED = "9AA3D8"; // muted footer/caption text on dark backgrounds

// ---------- fonts ----------
const HFONT = "Cambria";       // headings
const BFONT = "Calibri";       // body
const CFONT = "Courier New";   // code

// ---------- layout constants ----------
const W = 13.333; // LAYOUT_WIDE slide width, inches
const H = 7.5;    // LAYOUT_WIDE slide height, inches
const FOOTER_Y = 7.05;

/** Create a new presentation pre-configured with LAYOUT_WIDE + shared metadata. */
function newPresentation(pptxgen, { subject, title: deckTitle }) {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE";
  p.author = PRESENTER_NAME;
  p.company = INSTITUTION;
  p.subject = subject; // e.g. "CSC336 Web Technologies"
  p.title = deckTitle; // e.g. "Lecture 2: Tiered Web Architecture"
  return p;
}

function bg(slide, color) {
  slide.background = { color };
}

function kicker(slide, text) {
  slide.addText(text.toUpperCase(), {
    isTextBox: true, x: 0.7, y: 0.5, w: 11, h: 0.4,
    fontFace: BFONT, fontSize: 13, bold: true, charSpacing: 3,
    color: ORANGE, align: "left", margin: 0,
  });
}

function title(slide, text, onDark, sz) {
  slide.addText(text, {
    isTextBox: true, x: 0.7, y: 0.92, w: 11.9, h: 1.0,
    fontFace: HFONT, fontSize: sz || 34, bold: true,
    color: onDark ? WHITE : NAVY, align: "left", margin: 0,
  });
}

function numCircle(slide, x, y, n, d = 0.5, ShapeType) {
  slide.addShape(ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: ORANGE }, line: { type: "none" },
  });
  slide.addText(String(n), {
    isTextBox: true, x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: 15, bold: true, color: WHITE, margin: 0,
  });
}

function card(slide, x, y, w, h, ShapeType) {
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: TINT }, line: { color: "E2E2EE", width: 1 },
  });
}

/**
 * The finalized footer, used on every slide (light or dark background).
 * Left: presenter name + institution. Right: slide number.
 */
function pageFoot(slide, n, onDark) {
  const color = onDark ? ICE_MUTED : MUTED;
  slide.addText(`${PRESENTER_NAME}  •  ${INSTITUTION}`, {
    isTextBox: true, x: 0.7, y: FOOTER_Y, w: 9.5, h: 0.32,
    fontFace: BFONT, fontSize: 9, color, align: "left", margin: 0,
  });
  slide.addText(String(n), {
    isTextBox: true, x: 12.2, y: FOOTER_Y, w: 0.5, h: 0.32,
    fontFace: BFONT, fontSize: 9, color, align: "right", margin: 0,
  });
}

/** A dark rounded code box, matching the book's code-block presentation. */
function codeBox(slide, lines, x, y, w, h, ShapeType, fontSize = 14) {
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: NAVY_DK }, line: { type: "none" },
  });
  slide.addText(lines, {
    isTextBox: true, x: x + 0.35, y: y + 0.25, w: w - 0.7, h: h - 0.5,
    fontFace: CFONT, fontSize, color: ICE, valign: "top", margin: 0,
    lineSpacingMultiple: 1.25,
  });
}

/** Color-coded callout box matching the book's !!! note/tip/warning admonitions. */
const CALLOUT_STYLES = {
  note:    { fill: "E9EDFB", border: "6C7FD6", label: "NOTE",    labelColor: "33459E" },
  tip:     { fill: "E6F6EE", border: "3FA66B", label: "TIP",     labelColor: "1F7A46" },
  warning: { fill: "FDECE0", border: ORANGE,   label: "WARNING", labelColor: "8A3A12" },
};

function callout(slide, kind, text, x, y, w, h, ShapeType) {
  const s = CALLOUT_STYLES[kind] || CALLOUT_STYLES.note;
  slide.addShape(ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: s.fill }, line: { color: s.border, width: 1 },
  });
  slide.addText(s.label, {
    isTextBox: true, x: x + 0.25, y: y + 0.15, w: w - 0.5, h: 0.3,
    fontFace: BFONT, fontSize: 10, bold: true, charSpacing: 2,
    color: s.labelColor, margin: 0,
  });
  slide.addText(text, {
    isTextBox: true, x: x + 0.25, y: y + 0.48, w: w - 0.5, h: h - 0.65,
    fontFace: BFONT, fontSize: 12.5, color: INK, valign: "top", margin: 0,
  });
}

/** Shared table cell style presets for pptxgenjs addTable. */
function tableStyles() {
  return {
    th: { fill: NAVY, color: WHITE, bold: true, fontFace: BFONT, fontSize: 12, align: "center", valign: "middle" },
    td: { fontFace: BFONT, fontSize: 12, color: INK, align: "center", valign: "middle", fill: WHITE },
    tdl: { fontFace: BFONT, fontSize: 12, color: INK, align: "left", valign: "middle", fill: WHITE, bold: true },
  };
}

/**
 * A framed screenshot slide: kicker + title + real embedded image + caption,
 * matching the book's own screenshot-framing look (border + shadow + padding).
 */
function screenshotFrame(slide, imgPath, x, y, w, h, ShapeType) {
  slide.addShape(ShapeType.roundRect, {
    x: x - 0.12, y: y - 0.12, w: w + 0.24, h: h + 0.24, rectRadius: 0.06,
    fill: { color: WHITE }, line: { color: "E2E2EE", width: 1 },
    shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 3, angle: 90 },
  });
  slide.addImage({ path: imgPath, x, y, w, h });
}

/**
 * Bind the shape-dependent helpers (numCircle, card, codeBox, callout,
 * screenshotFrame) to a presentation's ShapeType enum, so lecture scripts can
 * call them as numCircle(slide, x, y, n) without passing ShapeType every time.
 */
function bind(ShapeType) {
  return {
    numCircle: (slide, x, y, n, d) => numCircle(slide, x, y, n, d, ShapeType),
    card: (slide, x, y, w, h) => card(slide, x, y, w, h, ShapeType),
    codeBox: (slide, lines, x, y, w, h, fontSize) => codeBox(slide, lines, x, y, w, h, ShapeType, fontSize),
    callout: (slide, kind, text, x, y, w, h) => callout(slide, kind, text, x, y, w, h, ShapeType),
    screenshotFrame: (slide, imgPath, x, y, w, h) => screenshotFrame(slide, imgPath, x, y, w, h, ShapeType),
  };
}

module.exports = {
  PRESENTER_NAME, INSTITUTION,
  NAVY, NAVY_DK, ORANGE, ORANGE_DK, WHITE, INK, MUTED, TINT, ICE, ICE_MUTED,
  HFONT, BFONT, CFONT, W, H, FOOTER_Y,
  newPresentation, bg, kicker, title, pageFoot, tableStyles, bind,
};
