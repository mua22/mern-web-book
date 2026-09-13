// Shared visual theme + slide-building helpers for every CSC336 lecture deck.
//
// Every lecture's generator script (lecture-NN.js) requires() this module
// instead of redefining colors/fonts/helpers itself, so all ten decks share
// one design system by construction, not by convention.
//
// Usage in a lecture script:
//   const theme = require("./theme");
//   const { NAVY, ORANGE, ... , bg, kicker, title, pageFoot, ... } = theme;

const fs = require("fs");

const PRESENTER_NAME = "Usman Akram";
const INSTITUTION = "COMSATS University Islamabad";

/**
 * Read a PNG's real pixel dimensions straight from its IHDR chunk.
 *
 * pptxgenjs 4.0.1's `sizing: { type: "contain" }` cannot actually read a
 * local image's natural size (getSizeFromImage() is wired up as an async
 * stub that never resolves in this code path -- see its own source around
 * "we need to make getSizeFromImage use callback"). Left alone, it silently
 * falls back to treating the image's own aspect ratio as already matching
 * the target box, which means "contain" does nothing and the image is
 * simply stretched to fill the box -- a real, confirmed distortion bug.
 * Computing the fit ourselves and passing exact w/h/x/y sidesteps it
 * entirely; every screenshot embed in these decks goes through this.
 */
function pngSize(path) {
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(path, "r");
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);
  if (buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Not a PNG (or unreadable header): ${path}`);
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/**
 * Compute the x/y/w/h (inches) an image should be drawn at to fit fully
 * inside a box (boxX, boxY, boxW, boxH), preserving its real aspect ratio
 * and centering it — a manual, correct replacement for pptxgenjs's broken
 * "contain" sizing.
 */
const CRISP_DPI = 150; // "looks sharp" pixel density target for a projected/on-screen slide
const MAX_UPSCALE = 2.5; // never enlarge a source image past this multiple of its crisp-native size

function containFit(imgPath, boxX, boxY, boxW, boxH) {
  const { width, height } = pngSize(imgPath);
  const imgRatio = width / height;
  const boxRatio = boxW / boxH;
  let w, h;
  if (imgRatio > boxRatio) {
    // image is relatively wider than the box -> width-limited
    w = boxW;
    h = boxW / imgRatio;
  } else {
    // image is relatively taller than the box -> height-limited
    h = boxH;
    w = boxH * imgRatio;
  }
  // Cap enlargement: a genuinely small source screenshot (some of this
  // book's are only ~150-300px on a side) blown up to fill an 11+ inch
  // slide box turns visibly blurry. Rather than stretch it edge to edge,
  // clamp to a modest multiple of its own "crisp" native size and center
  // it in the box with more surrounding whitespace instead.
  const nativeW = width / CRISP_DPI;
  const nativeH = height / CRISP_DPI;
  const maxW = nativeW * MAX_UPSCALE;
  const maxH = nativeH * MAX_UPSCALE;
  if (w > maxW || h > maxH) {
    const scale = Math.min(maxW / w, maxH / h);
    w *= scale;
    h *= scale;
  }
  const x = boxX + (boxW - w) / 2;
  const y = boxY + (boxH - h) / 2;
  return { x, y, w, h };
}

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
  // Fit the image inside the w x h box ourselves, preserving its real aspect
  // ratio and centering it -- see containFit()'s comment for why pptxgenjs's
  // own "contain" sizing can't be trusted for local files.
  const fit = containFit(imgPath, x, y, w, h);
  slide.addImage({ path: imgPath, x: fit.x, y: fit.y, w: fit.w, h: fit.h });
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
