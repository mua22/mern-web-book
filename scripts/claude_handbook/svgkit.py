"""Tiny SVG kit for the Claude Code Handbook diagrams.

Everything is drawn with the site's CSS variables (--cu-*), so diagrams follow light/dark mode.
Nodes are tinted (accent stroke + translucent fill) instead of solid, which keeps text readable
in both themes. Output has no blank lines, so it can be inlined in Markdown safely.
"""
from html import escape

FONT = "Sora, 'Segoe UI', Inter, Arial, sans-serif"
MONO = "'JetBrains Mono', Consolas, monospace"

ACCENTS = {
    "teal": "var(--cu-teal)",
    "purple": "var(--cu-purple)",
    "orange": "var(--cu-orange)",
    "plain": "var(--cu-faint)",
    "red": "#E5484D",
}


class Svg:
    def __init__(self, w, h, title, desc=""):
        self.w, self.h, self.title, self.desc = w, h, title, desc
        self.parts = []

    # ---- primitives -------------------------------------------------------
    def text(self, x, y, s, size=13, weight=500, anchor="middle", fill="var(--cu-text)", mono=False, opacity=1):
        fam = MONO if mono else FONT
        self.parts.append(
            f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="{fam}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" opacity="{opacity}">{escape(str(s))}</text>'
        )

    def lines(self, x, y, lines, size=13, weight=500, anchor="middle", fill="var(--cu-text)", gap=None, mono=False):
        gap = gap or size * 1.35
        for i, ln in enumerate(lines):
            self.text(x, y + i * gap, ln, size, weight, anchor, fill, mono)

    def rect(self, x, y, w, h, r=12, fill="var(--cu-bg)", stroke="var(--cu-border-soft)", sw=1.5, dash=None, opacity=1):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{sw}"{d} opacity="{opacity}"/>'
        )

    def circle(self, cx, cy, r, fill="none", stroke="var(--cu-border-soft)", sw=1.5):
        self.parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def line(self, x1, y1, x2, y2, stroke="var(--cu-border-soft)", sw=1.5, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    # ---- composites -------------------------------------------------------
    def node(self, x, y, w, h, title, sub=None, color="teal", r=12, size=13.5, mono=False):
        c = ACCENTS[color]
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}" fill-opacity="0.12" '
            f'stroke="{c}" stroke-width="1.6"/>'
        )
        title_lines = title if isinstance(title, list) else [title]
        sub_lines = sub if isinstance(sub, list) else ([sub] if sub else [])
        total = len(title_lines) * size * 1.3 + (len(sub_lines) * (size - 2.5) * 1.35 + 4 if sub_lines else 0)
        ty = y + (h - total) / 2 + size
        for i, ln in enumerate(title_lines):
            self.text(x + w / 2, ty + i * size * 1.3, ln, size, 700, mono=mono)
        base = ty + (len(title_lines) - 1) * size * 1.3 + 4
        for i, ln in enumerate(sub_lines):
            self.text(x + w / 2, base + (i + 1) * (size - 2.5) * 1.35, ln, size - 2.5, 500, fill="var(--cu-muted)")

    def pill(self, x, y, w, label, color="plain", h=24, size=11.5, mono=False):
        c = ACCENTS[color]
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{c}" fill-opacity="0.14" stroke="{c}" stroke-width="1"/>'
        )
        self.text(x + w / 2, y + h / 2 + size * 0.35, label, size, 600, mono=mono)

    def badge(self, cx, cy, n, color="teal"):
        c = ACCENTS[color]
        self.circle(cx, cy, 11, fill=c, stroke=c)
        self.text(cx, cy + 4, n, 12, 800, fill="var(--cu-on-accent)")

    def group(self, x, y, w, h, label, color="plain"):
        c = ACCENTS[color]
        self.rect(x, y, w, h, r=16, fill=c, stroke=c, sw=1.2, dash="5 5", opacity=0.07)
        self.rect(x, y, w, h, r=16, fill="none", stroke=c, sw=1.2, dash="5 5", opacity=0.7)
        self.text(x + 14, y + 20, label.upper(), 10.5, 800, anchor="start", fill=c)

    def arrow(self, pts, color="plain", label=None, lx=None, ly=None, dash=None, sw=1.8, both=False):
        """Polyline arrow through pts [(x,y),...] with a head at the end."""
        c = ACCENTS.get(color, color)
        d = "M" + " L".join(f"{x},{y}" for x, y in pts)
        da = f' stroke-dasharray="{dash}"' if dash else ""
        start = f' marker-start="url(#h-{color})"' if both else ""
        self.parts.append(
            f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linejoin="round" '
            f'marker-end="url(#h-{color})"{start}{da}/>'
        )
        if label:
            mx = lx if lx is not None else (pts[0][0] + pts[-1][0]) / 2
            my = ly if ly is not None else (pts[0][1] + pts[-1][1]) / 2 - 7
            self.text(mx, my, label, 11, 600, fill="var(--cu-muted)")

    # ---- output -----------------------------------------------------------
    def render(self):
        markers = "".join(
            f'<marker id="h-{k}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 Z" fill="{v}"/></marker>'
            for k, v in ACCENTS.items()
        )
        head = (
            f'<svg viewBox="0 0 {self.w} {self.h}" xmlns="http://www.w3.org/2000/svg" role="img" '
            f'aria-label="{escape(self.title)}"><title>{escape(self.title)}</title>'
            + (f"<desc>{escape(self.desc)}</desc>" if self.desc else "")
            + f"<defs>{markers}</defs>"
        )
        return head + "".join(self.parts) + "</svg>"
