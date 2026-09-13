// Generic, data-driven slide renderer built on theme.js.
//
// Lectures 2-10 are expressed as a JSON-like array of slide specs instead of
// hand-placed shapes, so every deck shares identical layout logic (and thus
// identical look and feel) by construction. Lecture 1 stays hand-built (it
// already existed and has a couple of bespoke diagrams), but uses the same
// theme.js primitives underneath.
//
// Usage:
//   const { buildDeck } = require("./deckBuilder");
//   buildDeck({ subject, title, outFile, deckKicker, lectureNo, slides: [...] });

const pptxgen = require("pptxgenjs");
const theme = require("./theme");

const {
  NAVY, NAVY_DK, ORANGE, ORANGE_DK, WHITE, INK, MUTED, TINT, ICE, ICE_MUTED,
  HFONT, BFONT, CFONT,
  bg, kicker, title, pageFoot, tableStyles,
} = theme;

const MARGIN_X = 0.7;
const CONTENT_TOP = 2.15; // where body content starts on a normal kicker+title slide
const CONTENT_RIGHT = 12.633; // 13.333 - MARGIN_X
const CONTENT_W = CONTENT_RIGHT - MARGIN_X;

function header(s, spec, kickerFns) {
  kicker(s, spec.kicker || "");
  title(s, spec.heading, false, spec.headingSize);
  let y = CONTENT_TOP;
  if (spec.intro) {
    s.addText(spec.intro, {
      isTextBox: true, x: MARGIN_X, y: 1.85, w: CONTENT_W, h: 0.45,
      fontFace: BFONT, fontSize: 13.5, italic: true, color: MUTED, margin: 0,
    });
    y = 2.45;
  }
  return y;
}

function renderTitle(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, NAVY);
  s.addText((spec.kicker || `LECTURE ${spec.lectureNo}`).toUpperCase(), {
    isTextBox: true, x: 0.9, y: 2.15, w: 8, h: 0.5,
    fontFace: BFONT, fontSize: 15, bold: true, charSpacing: 4, color: ORANGE, margin: 0,
  });
  s.addText(spec.heading, {
    isTextBox: true, x: 0.85, y: 2.6, w: 9.5, h: 2.1,
    fontFace: HFONT, fontSize: spec.headingSize || 40, bold: true, color: WHITE,
    lineSpacingMultiple: 1.05, margin: 0,
  });
  if (spec.sub) {
    s.addText(spec.sub, {
      isTextBox: true, x: 0.9, y: 4.8, w: 9.8, h: 0.9,
      fontFace: BFONT, fontSize: 15, color: ICE, margin: 0,
    });
  }
  s.addText(spec.course || "CSC336 Web Technologies", {
    isTextBox: true, x: 0.9, y: 6.5, w: 9, h: 0.4,
    fontFace: BFONT, fontSize: 12, color: ICE_MUTED, margin: 0,
  });
  pageFoot(s, helpers.nextNum(), true);
  return s;
}

function renderAgendaOrBullets(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const items = spec.items;
  const step = items.length <= 5 ? 0.9 : 0.78;
  items.forEach((t, i) => {
    const y = y0 + i * step;
    if (spec.numbered !== false) {
      helpers.numCircle(s, MARGIN_X + 0.05, y, i + 1);
      s.addText(t, {
        isTextBox: true, x: MARGIN_X + 0.8, y: y - 0.08, w: CONTENT_W - 0.8, h: 0.7,
        valign: "middle", fontFace: BFONT, fontSize: 15, color: INK, margin: 0,
      });
    } else {
      s.addShape(p.ShapeType.ellipse, { x: MARGIN_X + 0.05, y: y + 0.24, w: 0.09, h: 0.09, fill: { color: ORANGE }, line: { type: "none" } });
      s.addText(t, {
        isTextBox: true, x: MARGIN_X + 0.35, y: y - 0.08, w: CONTENT_W - 0.35, h: 0.7,
        valign: "middle", fontFace: BFONT, fontSize: 15, color: INK, margin: 0,
      });
    }
  });
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderCards(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const cards = spec.cards; // [{heading, accent?, body:[...]}]
  const n = cards.length;
  const gap = 0.25;
  const cw = (CONTENT_W - gap * (n - 1)) / n;
  const cardH = 7.0 - y0 - 0.35;
  cards.forEach((c, i) => {
    const x = MARGIN_X + i * (cw + gap);
    helpers.card(s, x, y0, cw, cardH);
    const accent = c.accent || (i % 2 === 0 ? NAVY : ORANGE_DK);
    s.addText((c.heading || "").toUpperCase(), {
      isTextBox: true, x: x + 0.28, y: y0 + 0.25, w: cw - 0.56, h: 0.4,
      fontFace: BFONT, fontSize: 12.5, bold: true, charSpacing: 1.5, color: accent, margin: 0,
    });
    const bodyItems = (c.body || []).map((line, j, arr) => ({
      text: line, options: { bullet: true, breakLine: j < arr.length - 1 },
    }));
    s.addText(bodyItems, {
      isTextBox: true, x: x + 0.28, y: y0 + 0.75, w: cw - 0.56, h: cardH - 1.0,
      valign: "top", fontFace: BFONT, fontSize: 12, color: INK, paraSpaceAfter: 6, margin: 0,
    });
  });
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderImage(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const boxY = y0 + 0.1;
  const boxH = 6.75 - boxY - (spec.caption ? 0.5 : 0);
  const boxW = CONTENT_W;
  helpers.screenshotFrame(s, spec.img, MARGIN_X, boxY, boxW, boxH);
  if (spec.caption) {
    s.addText(spec.caption, {
      isTextBox: true, x: MARGIN_X, y: boxY + boxH + 0.2, w: boxW, h: 0.4,
      fontFace: BFONT, fontSize: 11, italic: true, color: MUTED, align: "center", margin: 0,
    });
  }
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderImagePair(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const gap = 0.4;
  const boxW = (CONTENT_W - gap) / 2;
  const boxY = y0 + 0.5;
  const boxH = 6.6 - boxY;
  [spec.left, spec.right].forEach((item, i) => {
    const x = MARGIN_X + i * (boxW + gap);
    s.addText((item.label || "").toUpperCase(), {
      isTextBox: true, x, y: y0, w: boxW, h: 0.4,
      fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 1.5, color: ORANGE_DK, align: "center", margin: 0,
    });
    helpers.screenshotFrame(s, item.img, x, boxY, boxW, boxH);
  });
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderTable(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const styles = tableStyles();
  const nCols = spec.header.length;
  const colW = spec.colW || spec.header.map(() => CONTENT_W / nCols);
  const grid = [spec.header.map(h => ({ text: h, options: styles.th }))];
  spec.rows.forEach(row => {
    grid.push(row.map((cell, ci) => ({ text: cell, options: (spec.leftCol === ci) ? styles.tdl : styles.td })));
  });
  s.addTable(grid, {
    x: MARGIN_X, y: y0, w: CONTENT_W, colW,
    rowH: spec.rowH || 0.62,
    border: { type: "solid", color: "D8D8E6", pt: 1 }, valign: "middle",
  });
  if (spec.note) {
    s.addText(spec.note, {
      isTextBox: true, x: MARGIN_X, y: 6.6, w: CONTENT_W, h: 0.4,
      fontFace: BFONT, fontSize: 11.5, italic: true, color: MUTED, margin: 0,
    });
  }
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderCode(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const lineCount = spec.code.split("\n").length;
  const maxH = spec.note ? 3.6 : 4.3;
  let fontSize = spec.fontSize || 14;
  let boxH = spec.codeH;
  if (!boxH) {
    // Same calibrated Courier New line-box height as renderCodeImage, with a font
    // floor so a long snippet shrinks instead of visually overflowing its box.
    const PAD = 0.6;
    const FONT_FLOOR = 10;
    const lineH = (fs) => (fs * 1.5) / 72;
    let needed = PAD + lineCount * lineH(fontSize);
    if (needed > maxH) {
      fontSize = Math.max(FONT_FLOOR, ((maxH - PAD) / lineCount) * (72 / 1.5));
      needed = PAD + lineCount * lineH(fontSize);
    }
    boxH = needed;
  }
  helpers.codeBox(s, spec.code, MARGIN_X, y0, CONTENT_W, boxH, fontSize);
  if (spec.note) {
    const noteY = y0 + boxH + 0.25;
    s.addText(spec.note, {
      isTextBox: true, x: MARGIN_X, y: noteY, w: CONTENT_W, h: Math.max(0.5, 6.85 - noteY),
      fontFace: BFONT, fontSize: 13, color: INK, valign: "top", margin: 0,
    });
  }
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderCodeImage(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const lineCount = spec.code.split("\n").length;
  const BOTTOM = 6.8;
  const GAP = 0.3;
  const MIN_IMG_H = 1.0;
  const FONT_FLOOR = 10;
  // Empirical Courier New line-box height at lineSpacingMultiple 1.25 (measured via
  // PowerPoint COM render, not the nominal 1.25x-of-point-size figure -- that alone
  // undercounts and lets long snippets visually overflow into the image below).
  const lineH = (fs) => (fs * 1.5) / 72;
  let fontSize = spec.fontSize || 12.5;
  let codeH = spec.codeH;
  if (!codeH) {
    const PAD = 0.6;
    const maxCodeH = BOTTOM - y0 - GAP - MIN_IMG_H;
    let needed = PAD + lineCount * lineH(fontSize);
    if (needed > maxCodeH) {
      fontSize = Math.max(FONT_FLOOR, ((maxCodeH - PAD) / lineCount) * (72 / 1.5));
      needed = PAD + lineCount * lineH(fontSize);
    }
    codeH = needed;
  }
  helpers.codeBox(s, spec.code, MARGIN_X, y0, CONTENT_W, codeH, fontSize);
  const imgY = y0 + codeH + GAP;
  const imgH = Math.max(0.7, BOTTOM - imgY);
  helpers.screenshotFrame(s, spec.img, MARGIN_X, imgY, CONTENT_W, imgH);
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderCallout(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  helpers.callout(s, spec.kind || "note", spec.text, MARGIN_X, y0, CONTENT_W, spec.h || 2.0);
  if (spec.extra) {
    s.addText(spec.extra, {
      isTextBox: true, x: MARGIN_X, y: y0 + (spec.h || 2.0) + 0.3, w: CONTENT_W, h: 2.5,
      fontFace: BFONT, fontSize: 13, color: INK, valign: "top", margin: 0,
    });
  }
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderFlowHoriz(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const steps = spec.steps; // [{label, sub?}]
  const n = steps.length;
  const gap = 0.55;
  const boxW = (CONTENT_W - gap * (n - 1)) / n;
  const boxY = y0 + 0.6;
  const boxH = 1.5;
  steps.forEach((st, i) => {
    const x = MARGIN_X + i * (boxW + gap);
    s.addShape(p.ShapeType.roundRect, {
      x, y: boxY, w: boxW, h: boxH, rectRadius: 0.08,
      fill: { color: i === n - 1 ? ORANGE_DK : NAVY }, line: { type: "none" },
    });
    s.addText(st.label, {
      isTextBox: true, x: x + 0.1, y: boxY + 0.12, w: boxW - 0.2, h: boxH - 0.24,
      align: "center", valign: "middle", fontFace: BFONT, fontSize: 12.5, bold: true, color: WHITE, margin: 0,
    });
    if (i < n - 1) {
      s.addShape(p.ShapeType.line, {
        x: x + boxW, y: boxY + boxH / 2, w: gap, h: 0,
        line: { color: MUTED, width: 2, endArrowType: "triangle" },
      });
    }
  });
  if (spec.caption) {
    s.addText(spec.caption, {
      isTextBox: true, x: MARGIN_X, y: boxY + boxH + 0.5, w: CONTENT_W, h: 1.5,
      fontFace: BFONT, fontSize: 13, color: INK, valign: "top", margin: 0,
    });
  }
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderLayers(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, WHITE);
  const y0 = header(s, spec, helpers);
  const layers = spec.layers; // [{label, body, color?}]
  const n = layers.length;
  const gapV = 0.35;
  const boxH = Math.min(1.1, (6.9 - y0 - gapV * (n - 1)) / n);
  layers.forEach((layer, i) => {
    const y = y0 + i * (boxH + gapV);
    s.addShape(p.ShapeType.roundRect, {
      x: 1.7, y, w: 9.9, h: boxH, rectRadius: 0.08,
      fill: { color: layer.color || (i % 2 === 0 ? NAVY : "3A3A78") }, line: { type: "none" },
    });
    s.addText(layer.label.toUpperCase(), {
      isTextBox: true, x: 2.0, y: y + boxH * 0.16, w: 9.3, h: boxH * 0.35,
      fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 1.5, color: "DDE1F7", margin: 0,
    });
    s.addText(layer.body, {
      isTextBox: true, x: 2.0, y: y + boxH * 0.48, w: 9.3, h: boxH * 0.48,
      fontFace: BFONT, fontSize: 13, bold: true, color: WHITE, margin: 0,
    });
    if (i < n - 1) {
      s.addShape(p.ShapeType.line, {
        x: 6.65, y: y + boxH, w: 0, h: gapV,
        line: { color: MUTED, width: 2, endArrowType: "triangle" },
      });
    }
  });
  pageFoot(s, helpers.nextNum());
  return s;
}

function renderClosing(p, spec, helpers) {
  const s = p.addSlide();
  bg(s, NAVY);
  s.addText("KEY TAKEAWAYS", {
    isTextBox: true, x: 0.9, y: 0.8, w: 10, h: 0.5,
    fontFace: BFONT, fontSize: 15, bold: true, charSpacing: 4, color: ORANGE, margin: 0,
  });
  s.addText(spec.heading, {
    isTextBox: true, x: 0.85, y: 1.3, w: 11.5, h: 0.9,
    fontFace: HFONT, fontSize: 34, bold: true, color: WHITE, margin: 0,
  });
  const items = spec.items;
  const step = items.length <= 6 ? 0.75 : 0.66;
  items.forEach((t, i) => {
    const y = 2.5 + i * step;
    helpers.numCircle(s, 0.9, y, i + 1, 0.48);
    s.addText(t, {
      isTextBox: true, x: 1.6, y: y - 0.1, w: 11.0, h: step - 0.05,
      valign: "middle", fontFace: BFONT, fontSize: 12.5, color: ICE, margin: 0,
    });
  });
  pageFoot(s, helpers.nextNum(), true);
  return s;
}

const RENDERERS = {
  title: renderTitle,
  agenda: renderAgendaOrBullets,
  bullets: renderAgendaOrBullets,
  cards: renderCards,
  image: renderImage,
  imagePair: renderImagePair,
  table: renderTable,
  code: renderCode,
  codeImage: renderCodeImage,
  callout: renderCallout,
  flow: renderFlowHoriz,
  layers: renderLayers,
  closing: renderClosing,
};

async function buildDeck(deckSpec) {
  const p = theme.newPresentation(pptxgen, { subject: deckSpec.subject, title: deckSpec.title });
  const bound = theme.bind(p.ShapeType);
  let counter = 0;
  const helpers = { ...bound, nextNum: () => ++counter };

  deckSpec.slides.forEach((slideSpec) => {
    const renderer = RENDERERS[slideSpec.type];
    if (!renderer) throw new Error(`Unknown slide type: ${slideSpec.type}`);
    renderer(p, slideSpec, helpers);
  });

  await p.writeFile({ fileName: deckSpec.outFile });
  console.log(`WROTE ${deckSpec.outFile}  (${counter} slides)`);
}

module.exports = { buildDeck };
