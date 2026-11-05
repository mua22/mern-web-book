"""Generate all handbook diagrams into docs/claude-code-handbook/diagrams/*.svg.

Usage: python scripts/claude_handbook/build_diagrams.py [--preview]
--preview also writes a themed HTML contact sheet (light + dark) next to the SVGs' parent for review.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import diagrams_a  # noqa: E402

try:
    import diagrams_b  # noqa: E402
except ImportError:
    diagrams_b = None

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "claude-code-handbook" / "diagrams"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    allsvgs = dict(diagrams_a.ALL)
    if diagrams_b:
        allsvgs.update(diagrams_b.ALL)
    for name, fn in allsvgs.items():
        svg = fn()
        assert "\n\n" not in svg
        (OUT / f"{name}.svg").write_text(svg, encoding="utf-8")
    print(f"wrote {len(allsvgs)} diagrams -> {OUT}")
    if "--preview" in sys.argv:
        css = (ROOT / "docs/stylesheets/extra.css").read_text(encoding="utf-8")
        import re
        blocks = re.findall(r'\[data-md-color-scheme="(default|slate)"\]\s*\{(.*?)\n\}', css, re.S)
        tokens = {k: "\n".join(l for l in v.splitlines() if "--cu-" in l).replace("!important", "") for k, v in blocks}
        cards = "".join(f'<h4>{n}</h4><div class="card">{fn()}</div>' for n, fn in allsvgs.items())
        for scheme, bg in (("default", "#fff"), ("slate", "#090C12")):
            html = (f'<!doctype html><meta charset=utf-8><style>:root{{{tokens.get(scheme, "")}}}'
                    f'body{{background:{bg};font-family:sans-serif;padding:20px;color:var(--cu-text)}}'
                    '.card{background:var(--cu-surface);border:1px solid var(--cu-border);border-radius:14px;padding:18px;'
                    'margin-bottom:24px;max-width:820px}svg{width:100%;height:auto}h4{margin:0 0 6px}</style>' + cards)
            (OUT.parent / f"_preview-{scheme}.html").write_text(html, encoding="utf-8")
        print("preview html written")


if __name__ == "__main__":
    main()
