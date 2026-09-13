const pptxgen = require("pptxgenjs");
const theme = require("./theme");

const {
  NAVY, NAVY_DK, ORANGE, ORANGE_DK, WHITE, INK, MUTED, TINT, ICE, ICE_MUTED,
  HFONT, BFONT, W, H,
  bg, kicker, title, pageFoot,
} = theme;

const p = theme.newPresentation(pptxgen, {
  subject: "CSC336 Web Technologies",
  title: "Lecture 1: Introduction to Web Development",
});
const { numCircle, card } = theme.bind(p.ShapeType);

// ==========================================================
// 1. TITLE
// ==========================================================
let s = p.addSlide();
bg(s, NAVY);
// browser-window motif
s.addShape(p.ShapeType.roundRect, { x: 8.7, y: 1.5, w: 4.0, h: 3.0, rectRadius: 0.06,
  fill: { color: NAVY_DK }, line: { color: ICE, width: 1 } });
s.addShape(p.ShapeType.rect, { x: 8.7, y: 1.5, w: 4.0, h: 0.5, fill: { color: "3A3A78" }, line: { type: "none" } });
[0, 1, 2].forEach(i => s.addShape(p.ShapeType.ellipse, {
  x: 8.95 + i * 0.32, y: 1.68, w: 0.16, h: 0.16, fill: { color: ORANGE }, line: { type: "none" } }));
s.addText("<h1>", { isTextBox: true, x: 8.7, y: 2.3, w: 4.0, h: 1.4, align: "center", valign: "middle",
  fontFace: "Courier New", fontSize: 30, bold: true, color: ICE, margin: 0 });

s.addText("LECTURE 1", { isTextBox: true, x: 0.9, y: 2.15, w: 7, h: 0.5,
  fontFace: BFONT, fontSize: 15, bold: true, charSpacing: 4, color: ORANGE, margin: 0 });
s.addText("Introduction to\nWeb Development", { isTextBox: true, x: 0.85, y: 2.6, w: 7.6, h: 2.1,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 1.0, margin: 0 });
s.addText("From what the web actually is, to building full applications anyone can open in a browser.",
  { isTextBox: true, x: 0.9, y: 4.75, w: 7.4, h: 0.9, fontFace: BFONT, fontSize: 15, color: ICE, margin: 0 });
s.addText("CSC336 Web Technologies", { isTextBox: true,
  x: 0.9, y: 6.5, w: 9, h: 0.4, fontFace: BFONT, fontSize: 12, color: ICE_MUTED, margin: 0 });
pageFoot(s, 1, true);

// ==========================================================
// 2. IN THIS LECTURE
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Overview");
title(s, "In This Lecture");
const objs = [
  "The difference between the Internet and the Web",
  "The client\u2013server request\u2013response model behind every website",
  "Core vocabulary: URL/URI, HTTP/HTTPS, DNS, hosting, web server, browser",
  "The organizations that create and maintain web standards",
  "Types of web apps: static, dynamic, MPA, SPA, and PWA",
  "The full technology landscape \u2014 where HTML, CSS, JS, React, Node and MongoDB fit",
];
objs.forEach((t, i) => {
  const y = 2.15 + i * 0.82;
  numCircle(s, 0.75, y, i + 1);
  s.addText(t, { isTextBox: true, x: 1.5, y: y - 0.06, w: 11.0, h: 0.7, valign: "middle",
    fontFace: BFONT, fontSize: 15.5, color: INK, margin: 0 });
});
pageFoot(s, 2);

// ==========================================================
// 3. INTERNET VS WEB
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Foundations");
title(s, "The Internet vs. the Web");
s.addText("They are not the same thing.", { isTextBox: true, x: 0.7, y: 1.85, w: 11, h: 0.45,
  fontFace: BFONT, fontSize: 15, italic: true, color: MUTED, margin: 0 });

card(s, 0.7, 2.5, 5.85, 3.9);
s.addText("THE INTERNET", { isTextBox: true, x: 1.0, y: 2.8, w: 5.2, h: 0.4,
  fontFace: BFONT, fontSize: 13, bold: true, charSpacing: 2, color: NAVY, margin: 0 });
s.addText([
  { text: "A global network of interconnected computers that exchange data.", options: { bullet: true, breakLine: true } },
  { text: "Exists since the late 1960s (ARPANET).", options: { bullet: true, breakLine: true } },
  { text: "Carries far more than websites: email, video calls, games, file transfer.", options: { bullet: true, breakLine: true } },
  { text: "The roads, cables and traffic rules of the digital world.", options: { bullet: true } },
], { isTextBox: true, x: 1.0, y: 3.3, w: 5.25, h: 2.9, valign: "top", fontFace: BFONT, fontSize: 13.5,
  color: INK, paraSpaceAfter: 8, margin: 0 });

card(s, 6.8, 2.5, 5.85, 3.9);
s.addText("THE WEB  (WORLD WIDE WEB)", { isTextBox: true, x: 7.1, y: 2.8, w: 5.2, h: 0.4,
  fontFace: BFONT, fontSize: 13, bold: true, charSpacing: 2, color: ORANGE_DK, margin: 0 });
s.addText([
  { text: "One service that runs on top of the Internet.", options: { bullet: true, breakLine: true } },
  { text: "Invented in 1989 by Tim Berners-Lee.", options: { bullet: true, breakLine: true } },
  { text: "Built from three ideas: HTML documents, URLs, and the HTTP protocol.", options: { bullet: true, breakLine: true } },
  { text: "Just one kind of \u201cmail\u201d sent through the Internet's postal system.", options: { bullet: true } },
], { isTextBox: true, x: 7.1, y: 3.3, w: 5.25, h: 2.9, valign: "top", fontFace: BFONT, fontSize: 13.5,
  color: INK, paraSpaceAfter: 8, margin: 0 });
pageFoot(s, 3);

// ==========================================================
// 4. THE WEB = 3 IDEAS
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Foundations");
title(s, "The Web = Three Simple Ideas");
const triad = [
  ["Documents", "HTML", "Pages written in HyperText Markup Language that can link to one another."],
  ["Addresses", "URLs", "A unique address that identifies where each document lives."],
  ["A Protocol", "HTTP", "The rules for requesting a document and receiving it back."],
];
triad.forEach(([h1, h2, body], i) => {
  const x = 0.7 + i * 4.15;
  card(s, x, 2.4, 3.8, 4.0);
  s.addShape(p.ShapeType.ellipse, { x: x + 1.5, y: 2.75, w: 0.8, h: 0.8, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(String(i + 1), { isTextBox: true, x: x + 1.5, y: 2.75, w: 0.8, h: 0.8, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: 22, bold: true, color: WHITE, margin: 0 });
  s.addText(h1, { isTextBox: true, x: x + 0.2, y: 3.8, w: 3.4, h: 0.4, align: "center",
    fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
  s.addText(h2, { isTextBox: true, x: x + 0.2, y: 4.15, w: 3.4, h: 0.6, align: "center",
    fontFace: HFONT, fontSize: 24, bold: true, color: ORANGE_DK, margin: 0 });
  s.addText(body, { isTextBox: true, x: x + 0.35, y: 4.78, w: 3.1, h: 1.3, align: "center", valign: "top",
    fontFace: BFONT, fontSize: 12, color: INK, margin: 0 });
});
pageFoot(s, 4);

// ==========================================================
// 5. CLIENT-SERVER REQUEST-RESPONSE
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "How the Web Works");
title(s, "The Client\u2013Server Request\u2013Response Model", false, 29);
s.addText("A client asks for something. A server answers. The server does nothing until asked.",
  { isTextBox: true, x: 0.7, y: 1.85, w: 12, h: 0.45, fontFace: BFONT, fontSize: 14.5, italic: true, color: MUTED, margin: 0 });

// two endpoints
s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 3.0, w: 3.0, h: 1.5, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
s.addText("CLIENT\n(Browser)", { isTextBox: true, x: 0.9, y: 3.0, w: 3.0, h: 1.5, align: "center", valign: "middle",
  fontFace: BFONT, fontSize: 15, bold: true, color: WHITE, margin: 0 });
s.addShape(p.ShapeType.roundRect, { x: 9.4, y: 3.0, w: 3.0, h: 1.5, rectRadius: 0.08, fill: { color: ORANGE_DK }, line: { type: "none" } });
s.addText("SERVER\n(Web Server)", { isTextBox: true, x: 9.4, y: 3.0, w: 3.0, h: 1.5, align: "center", valign: "middle",
  fontFace: BFONT, fontSize: 15, bold: true, color: WHITE, margin: 0 });

// exchange rows
const rows = [
  ["Request", "GET /index.html", "right"],
  ["Response", "200 OK  \u2014  HTML page", "left"],
  ["Request", "GET /style.css", "right"],
  ["Response", "200 OK  \u2014  CSS file", "left"],
];
rows.forEach(([label, detail, dir], i) => {
  const y = 4.85 + i * 0.46;
  const isRight = dir === "right";
  s.addShape(p.ShapeType.line, { x: 2.4, y, w: 8.5, h: 0,
    line: { color: isRight ? NAVY : ORANGE_DK, width: 2,
      endArrowType: isRight ? "triangle" : "none", beginArrowType: isRight ? "none" : "triangle" } });
  s.addText(`${label}:  ${detail}`, { isTextBox: true, x: 2.6, y: y - 0.3, w: 8.2, h: 0.28,
    align: isRight ? "left" : "right", fontFace: "Courier New", fontSize: 11,
    color: isRight ? NAVY : ORANGE_DK, margin: 0 });
});
s.addText("One web page can take many request\u2013response exchanges \u2014 one for the HTML, then the CSS, images, and more.",
  { isTextBox: true, x: 0.9, y: 6.45, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
pageFoot(s, 5);

// ==========================================================
// 6. ANATOMY OF A URL
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Core Terminology");
title(s, "Anatomy of a URL");
s.addText("A URI identifies a resource. A URL is a URI that also says where it is and how to fetch it.",
  { isTextBox: true, x: 0.7, y: 1.85, w: 12, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, margin: 0 });

s.addShape(p.ShapeType.roundRect, { x: 0.9, y: 2.7, w: 11.5, h: 0.9, rectRadius: 0.06, fill: { color: NAVY }, line: { type: "none" } });
s.addText("https://www.example.com:443/courses/web-tech?semester=fall#lecture1", {
  isTextBox: true, x: 1.1, y: 2.7, w: 11.1, h: 0.9, valign: "middle",
  fontFace: "Courier New", fontSize: 15, color: WHITE, margin: 0 });

const parts = [
  ["https://", "scheme", "Which protocol to use (here, secure HTTP)"],
  ["www.example.com", "host", "Which server to contact"],
  [":443", "port", "Often omitted \u2014 443 is the default for HTTPS"],
  ["/courses/web-tech", "path", "Which resource on that server"],
  ["?semester=fall", "query", "Extra parameters, as key=value pairs"],
  ["#lecture1", "fragment", "A specific spot within the page"],
];
parts.forEach(([code, name, desc], i) => {
  const y = 3.9 + i * 0.5;
  s.addText(code, { isTextBox: true, x: 0.95, y, w: 3.0, h: 0.45, valign: "middle",
    fontFace: "Courier New", fontSize: 12, bold: true, color: ORANGE_DK, margin: 0 });
  s.addText(name, { isTextBox: true, x: 4.0, y, w: 1.7, h: 0.45, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, bold: true, color: NAVY, margin: 0 });
  s.addText(desc, { isTextBox: true, x: 5.8, y, w: 6.6, h: 0.45, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
});
pageFoot(s, 6);

// ==========================================================
// 7. HTTP & HTTPS
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Core Terminology");
title(s, "HTTP and HTTPS");
card(s, 0.7, 2.3, 5.85, 3.3);
s.addText("HTTP", { isTextBox: true, x: 1.0, y: 2.55, w: 5.2, h: 0.55,
  fontFace: HFONT, fontSize: 22, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "The rules for how a browser and server exchange requests and responses.", options: { bullet: true, breakLine: true } },
  { text: "Defines methods: GET (fetch data), POST (send data), and more.", options: { bullet: true, breakLine: true } },
  { text: "Defines status codes: 200 OK, 404 Not Found, 500 Server Error.", options: { bullet: true } },
], { isTextBox: true, x: 1.0, y: 3.2, w: 5.25, h: 2.2, valign: "top", fontFace: BFONT, fontSize: 13, color: INK, paraSpaceAfter: 8, margin: 0 });

card(s, 6.8, 2.3, 5.85, 3.3);
s.addText("HTTPS", { isTextBox: true, x: 7.1, y: 2.55, w: 5.2, h: 0.55,
  fontFace: HFONT, fontSize: 22, bold: true, color: ORANGE_DK, margin: 0 });
s.addText([
  { text: "HTTP plus an encryption layer (TLS/SSL).", options: { bullet: true, breakLine: true } },
  { text: "Scrambles data so eavesdroppers on the network cannot read it.", options: { bullet: true, breakLine: true } },
  { text: "Now used by almost every site; browsers warn when a site is not on HTTPS.", options: { bullet: true } },
], { isTextBox: true, x: 7.1, y: 3.2, w: 5.25, h: 2.2, valign: "top", fontFace: BFONT, fontSize: 13, color: INK, paraSpaceAfter: 8, margin: 0 });

s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 5.9, w: 11.95, h: 0.95, rectRadius: 0.06,
  fill: { color: "FDECE0" }, line: { color: ORANGE, width: 1 } });
s.addText("Never send passwords, card numbers or personal data over plain HTTP \u2014 it can be intercepted. Always use HTTPS.",
  { isTextBox: true, x: 1.0, y: 5.9, w: 11.4, h: 0.95, valign: "middle",
  fontFace: BFONT, fontSize: 13, bold: true, color: "8A3A12", margin: 0 });
pageFoot(s, 7);

// ==========================================================
// 8. DNS
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Core Terminology");
title(s, "DNS \u2014 The Phone Book of the Internet");
s.addText("Computers connect using numeric IP addresses. DNS translates a name into that number.",
  { isTextBox: true, x: 0.7, y: 1.85, w: 12, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, margin: 0 });

const dns = [
  ["You type", "example.com", "into the browser's address bar"],
  ["The DNS resolver", "looks up the name", "in the Internet's distributed directory"],
  ["DNS returns", "93.184.216.34", "the IP address of the server that hosts the site"],
  ["The browser connects", "to that IP", "and the HTTP request\u2013response begins"],
];
dns.forEach(([a, b, c], i) => {
  const y = 2.7 + i * 1.05;
  numCircle(s, 0.8, y + 0.1, i + 1, 0.55);
  s.addText([
    { text: a + "  ", options: { fontFace: BFONT, fontSize: 14, color: INK } },
    { text: b + "  ", options: { fontFace: "Courier New", fontSize: 13.5, bold: true, color: ORANGE_DK } },
    { text: c, options: { fontFace: BFONT, fontSize: 13, color: MUTED } },
  ], { isTextBox: true, x: 1.7, y: y - 0.05, w: 10.9, h: 0.8, valign: "middle", margin: 0 });
  if (i < 3) s.addShape(p.ShapeType.line, { x: 1.07, y: y + 0.65, w: 0, h: 0.45, line: { color: ICE, width: 2 } });
});
pageFoot(s, 8);

// ==========================================================
// 9. HOSTING / WEB SERVER / BROWSER
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Core Terminology");
title(s, "Hosting, Web Servers, and Browsers");
const three = [
  ["Hosting", "Storing your site's files on a computer connected to the Internet 24/7, so anyone can reach it any time.", "Vercel  \u2022  Netlify  \u2022  AWS  \u2022  DigitalOcean"],
  ["Web Server", "The software that listens for HTTP requests and sends back responses.", "Apache  \u2022  Nginx  \u2022  Node.js + Express"],
  ["Browser", "The client the user interacts with: sends requests, receives HTML/CSS/JS, renders the page.", "Chrome  \u2022  Firefox  \u2022  Safari  \u2022  Edge"],
];
three.forEach(([h1, body, egs], i) => {
  const x = 0.7 + i * 4.15;
  card(s, x, 2.35, 3.8, 3.55);
  s.addText(h1, { isTextBox: true, x: x + 0.3, y: 2.6, w: 3.2, h: 0.5,
    fontFace: HFONT, fontSize: 20, bold: true, color: NAVY, margin: 0 });
  s.addText(body, { isTextBox: true, x: x + 0.3, y: 3.2, w: 3.2, h: 1.55, valign: "top",
    fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
  s.addText(egs, { isTextBox: true, x: x + 0.3, y: 5.25, w: 3.2, h: 0.55, valign: "top",
    fontFace: BFONT, fontSize: 10.5, bold: true, color: ORANGE_DK, margin: 0 });
});
pageFoot(s, 9);

// ==========================================================
// 10. WEB STANDARDS BODIES
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Who Runs the Web");
title(s, "Web Standards Bodies");
s.addText("Standards let every browser interpret HTML, CSS and JavaScript the same way.",
  { isTextBox: true, x: 0.7, y: 1.85, w: 12, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, margin: 0 });
const bodies = [
  ["W3C", "World Wide Web Consortium", "Standards for HTML, CSS, and accessibility (WCAG). Founded by Tim Berners-Lee."],
  ["WHATWG", "Web Hypertext Application Technology Working Group", "Maintains the HTML Living Standard, updated continuously by browser vendors."],
  ["ECMA", "Ecma International", "Standardizes ECMAScript \u2014 the specification that JavaScript implements (ES2015, ES2020...)."],
  ["IETF", "Internet Engineering Task Force", "Core Internet protocols: HTTP, TLS, DNS. Publishes specs called RFCs."],
];
bodies.forEach(([abbr, full, desc], i) => {
  const x = 0.7 + (i % 2) * 6.1;
  const y = 2.5 + Math.floor(i / 2) * 2.15;
  card(s, x, y, 5.85, 1.95);
  s.addText(abbr, { isTextBox: true, x: x + 0.3, y: y + 0.2, w: 5.2, h: 0.5,
    fontFace: HFONT, fontSize: 19, bold: true, color: ORANGE_DK, margin: 0 });
  s.addText(full, { isTextBox: true, x: x + 0.3, y: y + 0.7, w: 5.3, h: 0.4,
    fontFace: BFONT, fontSize: 11, bold: true, color: NAVY, margin: 0 });
  s.addText(desc, { isTextBox: true, x: x + 0.3, y: y + 1.05, w: 5.3, h: 0.8,
    fontFace: BFONT, fontSize: 11.5, color: INK, margin: 0 });
});
pageFoot(s, 10);

// ==========================================================
// 11. TYPES OF WEB APPS
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Kinds of Web Apps");
title(s, "Types of Web Applications");
const types = [
  ["Static", "Serves the same HTML file to everyone. Nothing changes per user.", "Portfolios, documentation"],
  ["Dynamic", "Builds or changes content per request, using data from a database.", "Most real applications"],
  ["MPA", "Multi-Page App: every navigation loads a brand-new page from the server.", "News sites, classic e-commerce"],
  ["SPA", "Single-Page App: loads once, then JavaScript swaps content in place.", "Dashboards, social apps"],
  ["PWA", "An app-like SPA: works offline, installable, can send push notifications.", "Apps needing offline access"],
];
types.forEach(([h1, body, eg], i) => {
  const y = 2.25 + i * 0.92;
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y, w: 1.7, h: 0.66, rectRadius: 0.06, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(h1, { isTextBox: true, x: 0.7, y, w: 1.7, h: 0.66, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: 13, bold: true, color: WHITE, margin: 0 });
  s.addText(body, { isTextBox: true, x: 2.7, y: y - 0.02, w: 7.0, h: 0.7, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
  s.addText(eg, { isTextBox: true, x: 9.9, y: y - 0.02, w: 2.9, h: 0.7, valign: "middle",
    fontFace: BFONT, fontSize: 11, italic: true, color: MUTED, margin: 0 });
});
pageFoot(s, 11);

// ==========================================================
// 12. COMPARISON
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Kinds of Web Apps");
title(s, "Comparing the Types");
const th = { fill: NAVY, color: WHITE, bold: true, fontFace: BFONT, fontSize: 12, align: "center", valign: "middle" };
const td = { fontFace: BFONT, fontSize: 12, color: INK, align: "center", valign: "middle", fill: WHITE };
const tdl = { ...td, align: "left", bold: true };
const grid = [
  [{ text: "Type", options: th }, { text: "Content changes per user?", options: th }, { text: "Full page reloads?", options: th }, { text: "Typical use case", options: th }],
  [{ text: "Static", options: tdl }, { text: "No", options: td }, { text: "Yes (content never changes)", options: td }, { text: "Portfolio, documentation", options: td }],
  [{ text: "Dynamic (MPA)", options: tdl }, { text: "Yes", options: td }, { text: "Yes, on every navigation", options: td }, { text: "News sites, e-commerce", options: td }],
  [{ text: "SPA", options: tdl }, { text: "Yes", options: td }, { text: "No, after the first load", options: td }, { text: "Dashboards, social apps", options: td }],
  [{ text: "PWA", options: tdl }, { text: "Yes", options: td }, { text: "No", options: td }, { text: "Offline / installable apps", options: td }],
];
s.addTable(grid, { x: 0.7, y: 2.4, w: 11.95, colW: [2.2, 3.5, 3.35, 2.9], rowH: 0.72,
  border: { type: "solid", color: "D8D8E6", pt: 1 }, valign: "middle" });
s.addText("These categories overlap: an SPA is almost always dynamic, and a PWA is usually an SPA with extra powers.",
  { isTextBox: true, x: 0.7, y: 6.3, w: 12, h: 0.45, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
pageFoot(s, 12);

// ==========================================================
// 13. TECHNOLOGY LANDSCAPE
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "The Big Picture");
title(s, "The Technology Landscape");
const layers = [
  ["BROWSER  (Client)", "HTML  \u2022  CSS + Bootstrap / Tailwind  \u2022  JavaScript + jQuery / React", NAVY],
  ["SERVER", "Node.js + Express", "3A3A78"],
  ["DATA LAYER", "MongoDB  (via Mongoose)", ORANGE_DK],
];
layers.forEach(([h1, body, col], i) => {
  const y = 2.35 + i * 1.35;
  s.addShape(p.ShapeType.roundRect, { x: 2.2, y, w: 8.9, h: 1.1, rectRadius: 0.08, fill: { color: col }, line: { type: "none" } });
  s.addText(h1, { isTextBox: true, x: 2.5, y: y + 0.14, w: 8.3, h: 0.4,
    fontFace: BFONT, fontSize: 12, bold: true, charSpacing: 2, color: "DDE1F7", margin: 0 });
  s.addText(body, { isTextBox: true, x: 2.5, y: y + 0.52, w: 8.3, h: 0.5,
    fontFace: BFONT, fontSize: 13.5, bold: true, color: WHITE, margin: 0 });
  if (i < 2) {
    s.addShape(p.ShapeType.line, { x: 6.65, y: y + 1.1, w: 0, h: 0.25, line: { color: MUTED, width: 2, endArrowType: "triangle" } });
  }
});
s.addText("HTTP request / response", { isTextBox: true, x: 8.3, y: 3.45, w: 3.5, h: 0.3,
  fontFace: BFONT, fontSize: 10, italic: true, color: MUTED, margin: 0 });
s.addText("Nicknamed the MERN stack:  MongoDB \u00b7 Express \u00b7 React \u00b7 Node",
  { isTextBox: true, x: 0.7, y: 6.6, w: 12, h: 0.4, align: "center",
  fontFace: BFONT, fontSize: 13, bold: true, color: NAVY, margin: 0 });
pageFoot(s, 13);

// ==========================================================
// 14. ONE PATH PER LAYER
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "The Big Picture");
title(s, "This Course Picks One Path Per Layer");
const paths = [
  ["Markup", "HTML", "\u2014 (no real alternative in the browser)"],
  ["Styling", "CSS + Bootstrap or Tailwind", "Sass, Bulma, UnoCSS, ..."],
  ["Scripting", "JavaScript (ES6+), plus jQuery", "TypeScript"],
  ["Front-end framework", "React", "Vue, Angular, Svelte, SolidJS"],
  ["Server runtime", "Node.js + Express", "Django, Rails, Laravel, Spring Boot"],
  ["Database", "MongoDB + Mongoose", "PostgreSQL, MySQL, SQLite, Firebase"],
];
paths.forEach(([layer, pick, alt], i) => {
  const y = 2.2 + i * 0.8;
  s.addText(layer, { isTextBox: true, x: 0.75, y, w: 2.9, h: 0.7, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, bold: true, color: NAVY, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 3.7, y: y + 0.06, w: 4.5, h: 0.58, rectRadius: 0.06,
    fill: { color: TINT }, line: { color: ORANGE, width: 1 } });
  s.addText(pick, { isTextBox: true, x: 3.85, y: y + 0.06, w: 4.2, h: 0.58, valign: "middle",
    fontFace: BFONT, fontSize: 12, bold: true, color: INK, margin: 0 });
  s.addText("alt:  " + alt, { isTextBox: true, x: 8.5, y, w: 4.2, h: 0.7, valign: "middle",
    fontFace: BFONT, fontSize: 10.5, italic: true, color: MUTED, margin: 0 });
});
pageFoot(s, 14);

// ==========================================================
// 15. WHAT YOU NEED TO KNOW
// ==========================================================
s = p.addSlide();
bg(s, WHITE);
kicker(s, "Reality Check");
title(s, "What You Actually Need to Know");
s.addText("You are not expected to learn everything on the previous slide. Go deep on this stack; recognize the rest.",
  { isTextBox: true, x: 0.7, y: 1.85, w: 12, h: 0.45, fontFace: BFONT, fontSize: 13.5, italic: true, color: MUTED, margin: 0 });
const skills = [
  ["Solid \u2014 non-negotiable", "HTML, CSS, JavaScript (ES6+), Git & GitHub, REST API design"],
  ["Solid \u2014 the MERN core", "React, Node.js + Express, MongoDB + Mongoose"],
  ["One, deeply \u2014 not both", "A CSS framework: Bootstrap OR Tailwind"],
  ["Awareness only", "jQuery \u2014 enough to read and maintain older codebases"],
  ["Nice to have", "TypeScript; basic SQL/PostgreSQL; a second front-end framework"],
];
skills.forEach(([lvl, body], i) => {
  const y = 2.42 + i * 0.8;
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y, w: 3.15, h: 0.6, rectRadius: 0.06, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(lvl, { isTextBox: true, x: 0.8, y, w: 2.95, h: 0.6, valign: "middle",
    fontFace: BFONT, fontSize: 10.5, bold: true, color: WHITE, margin: 0 });
  s.addText(body, { isTextBox: true, x: 4.1, y: y - 0.02, w: 8.5, h: 0.64, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
});
s.addText("The pick-one pattern: depth in one option per category + awareness of the rest is what makes you employable.",
  { isTextBox: true, x: 0.7, y: 6.5, w: 12, h: 0.35, fontFace: BFONT, fontSize: 11.5, bold: true, color: ORANGE_DK, margin: 0 });
pageFoot(s, 15);

// ==========================================================
// 16. KEY TAKEAWAYS
// ==========================================================
s = p.addSlide();
bg(s, NAVY);
s.addText("KEY TAKEAWAYS", { isTextBox: true, x: 0.9, y: 0.8, w: 10, h: 0.5,
  fontFace: BFONT, fontSize: 15, bold: true, charSpacing: 4, color: ORANGE, margin: 0 });
s.addText("Lecture 1 in Six Points", { isTextBox: true, x: 0.85, y: 1.3, w: 11.5, h: 0.9,
  fontFace: HFONT, fontSize: 34, bold: true, color: WHITE, margin: 0 });
const take = [
  "The Internet is the global network; the Web is one service (pages, links, HTTP) running on top of it.",
  "The web works through a client\u2013server, request\u2013response model \u2014 browsers ask, servers answer.",
  "URL/URI identify resources, HTTP/HTTPS transfer them, DNS resolves names to IP addresses, hosting keeps a server reachable.",
  "W3C, WHATWG, ECMA and IETF write the standards that keep browsers and developers speaking one language.",
  "Web apps range from static sites to dynamic ones, built as MPAs, SPAs, or installable PWAs.",
  "This course teaches the MERN stack (+ Bootstrap/Tailwind, jQuery) \u2014 depth in one path, awareness of the alternatives.",
];
take.forEach((t, i) => {
  const y = 2.5 + i * 0.75;
  numCircle(s, 0.9, y, i + 1, 0.48);
  s.addText(t, { isTextBox: true, x: 1.6, y: y - 0.1, w: 11.0, h: 0.68, valign: "middle",
    fontFace: BFONT, fontSize: 12.5, color: ICE, margin: 0 });
});
pageFoot(s, 16, true);

const OUT = "D:/GitHub/mern-web-book/slides/CSC336-Lecture-01-Introduction-to-Web-Development.pptx";
p.writeFile({ fileName: OUT }).then(() => console.log("WROTE " + OUT));
