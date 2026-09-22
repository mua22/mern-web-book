// Renders an HTML demo page (local file or http(s) URL) and saves a real
// screenshot as a PNG, for use as a codeImage/codeImageSide slide's `img`.
//
// Playwright can load file:// URLs directly, so no local HTTP server is
// needed -- point it straight at a scratch .html file.
//
// Usage:
//   node tools/screenshot.js <htmlFileOrUrl> <outPngPath> [width] [height]
//
// The screenshot is cropped to the <body> element's actual rendered size
// (not the full viewport), so the source HTML should size itself with a
// fixed `width` on <body> and let height flow naturally from content --
// see any docs/assets/img/lecture-*/*-demo.png source for the pattern.

const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const [, , target, outPath, width, height] = process.argv;
  if (!target || !outPath) {
    console.error("Usage: node tools/screenshot.js <htmlFileOrUrl> <outPngPath> [width] [height]");
    process.exit(1);
  }
  const url = /^https?:\/\//i.test(target)
    ? target
    : "file:///" + path.resolve(target).replace(/\\/g, "/");

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: Number(width) || 620, height: Number(height) || 400 },
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator("body").screenshot({ path: outPath });
  await browser.close();
  console.log(`WROTE ${outPath}`);
}

main();
