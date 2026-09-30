#!/usr/bin/env python3
"""
Generate the Tutorials landing page and every category's paginated listing
pages from data/tutorials.json -- the single source of truth for which
tutorial is in which category, in what order, and (derived here) which page
it lands on.

This replaces client-side JS pagination with real, separate, crawlable pages
(index.md = page 1, page-2.md, page-3.md, ...) for SEO: paginated content
behind JavaScript is invisible to most crawlers and has no distinct URL to
rank or be shared. Every page here is a plain static file with its own
title, meta description, and rel=prev/next hints.

Usage:
    python .claude/skills/tutorial-pagination/scripts/generate_tutorials.py
    python .claude/skills/tutorial-pagination/scripts/generate_tutorials.py --check

Run with no flags to (re)write every generated file so it matches the JSON.
Run with --check to verify the generated files already match the JSON
without writing anything -- exits 1 and prints a diff-style report if they
don't (use this to confirm you already ran a plain regenerate before
deploying, in CI, or in a pre-commit/pre-push hook).

See the sibling SKILL.md for the full workflow this script is part of.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
DATA_PATH = REPO_ROOT / "data" / "tutorials.json"
TUTORIALS_DIR = REPO_ROOT / "docs" / "tutorials"
SITE_URL = "https://cuinotes.com/"  # must match mkdocs.yml's site_url

COLOR_HEX = {
    "purple": "#6C4FF5",
    "teal": "#12B394",
    "orange": "#B9720E",
}
COLOR_BG = {
    "purple": "rgba(108,79,245,0.10)",
    "teal": "rgba(53,231,196,0.10)",
    "orange": "rgba(185,114,14,0.10)",
}
COLOR_CHIP_CLASS = {
    "purple": "cu-chip-purple",
    "teal": "cu-chip-teal",
    "orange": "cu-chip-orange",
}
LEVEL_CHIP_CLASS = {
    "Beginner": "cu-chip-teal",
    "Beginner to Intermediate": "cu-chip-purple",
    "Intermediate": "cu-chip-orange",
}


def chunk(items: list, size: int) -> list[list]:
    """Split into pages of `size`. Always returns at least one (possibly empty) page."""
    return [items[i : i + size] for i in range(0, len(items), size)] or [[]]


def yaml_str(value: str) -> str:
    """Double-quoted YAML scalar, safe for titles/descriptions with colons or quotes."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def render_card(tutorial: dict, position: int, total: int) -> str:
    level = tutorial["level"]
    chip_class = LEVEL_CHIP_CLASS.get(level, "cu-chip-teal")
    return f"""<div class="cu-card" markdown>
<a class="cu-card-link" href="{tutorial['slug']}/" aria-label="Open {tutorial['title']} tutorial"></a>
<div class="cu-tut-top" markdown>
<span class="cu-chip {chip_class}">{level}</span>
</div>

### {tutorial['title']}

{tutorial['summary']}

<div class="cu-card-foot" markdown>
<span>{position} of {total}</span>
<span class="cu-go">Start tutorial →</span>
</div>
</div>"""


def render_empty_state() -> str:
    return """<div class="cu-empty" markdown>
<span class="cu-empty-icon">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
</span>

### Coming soon

Tutorials for this category haven't been written yet. In the meantime, start with
[HTML &amp; CSS](../html-css/index.md) or [DevOps](../devops/index.md), both available now.
</div>"""


def render_pager(page_num: int, total_pages: int) -> str:
    if total_pages <= 1:
        return ""
    parts = []

    if page_num > 1:
        target = "index.md" if page_num == 2 else f"page-{page_num - 1}.md"
        parts.append(f"[← Prev]({target}){{: .cu-page-btn .cu-page-nav}}")
    else:
        parts.append('<span class="cu-page-btn cu-page-nav" aria-disabled="true">← Prev</span>')

    for p in range(1, total_pages + 1):
        if p == page_num:
            parts.append(f'<span class="cu-page-btn active">{p}</span>')
        else:
            target = "index.md" if p == 1 else f"page-{p}.md"
            parts.append(f"[{p}]({target}){{: .cu-page-btn}}")

    if page_num < total_pages:
        target = f"page-{page_num + 1}.md"
        parts.append(f"[Next →]({target}){{: .cu-page-btn .cu-page-nav}}")
    else:
        parts.append('<span class="cu-page-btn cu-page-nav" aria-disabled="true">Next →</span>')

    return '<div class="cu-paginated-controls" markdown>\n' + "\n".join(parts) + "\n</div>"


def page_url(category_slug: str, page_num: int) -> str:
    if page_num == 1:
        return f"{SITE_URL}tutorials/{category_slug}/"
    return f"{SITE_URL}tutorials/{category_slug}/page-{page_num}/"


def render_category_page(
    category: dict, page_num: int, page_items: list, total_pages: int, total_items: int, page_size: int
) -> str:
    slug = category["slug"]
    is_first = page_num == 1

    if is_first:
        title = f"{category['title']} — Tutorials"
        description = category["card_description"]
    else:
        title = f"{category['title']} — Page {page_num} of {total_pages} — Tutorials"
        description = f"More {category['title']} tutorials (page {page_num} of {total_pages})."

    frontmatter_lines = ["---", f"title: {yaml_str(title)}", f"description: {yaml_str(description)}"]
    if page_num > 1:
        frontmatter_lines.append(f"pagination_prev: {yaml_str(page_url(slug, page_num - 1))}")
    if page_num < total_pages:
        frontmatter_lines.append(f"pagination_next: {yaml_str(page_url(slug, page_num + 1))}")
    frontmatter_lines.append("tags:")
    for tag in category["tags"]:
        frontmatter_lines.append(f"  - {yaml_str(tag)}")
    frontmatter_lines.append("---")
    frontmatter = "\n".join(frontmatter_lines)

    if is_first:
        heading = f"# {category['title']}"
        intro = category["intro"]
    else:
        heading = f"# {category['title']} — Page {page_num} of {total_pages}"
        intro = f"More [{category['title']}](index.md) tutorials."

    if total_items == 0:
        body = render_empty_state()
    else:
        offset = (page_num - 1) * page_size
        body = "\n\n".join(
            render_card(t, offset + i + 1, total_items) for i, t in enumerate(page_items)
        )

    pager = render_pager(page_num, total_pages)

    parts = [frontmatter, "", heading, "", intro, "", body]
    if pager:
        parts += ["", pager]
    return "\n".join(parts) + "\n"


def render_landing_card(category: dict) -> str:
    color = category["color"]
    hex_color = COLOR_HEX[color]
    bg = COLOR_BG[color]
    count = len(category["tutorials"])
    if count > 0:
        foot = f'<span>{count} tutorial{"s" if count != 1 else ""}</span>\n<span class="cu-go">Browse →</span>'
    else:
        foot = "<span>Coming soon</span>"
    return f"""<div class="cu-card" markdown>
<a class="cu-card-link" href="{category['slug']}/" aria-label="Open {category['title']} tutorials"></a>
<div class="cu-card-top" markdown>
<span class="cu-icon-badge" style="background: {bg};">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{hex_color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{category['icon_svg']}</svg>
</span>
</div>

### {category['title']}

{category['card_description']}

<div class="cu-card-foot" markdown>
{foot}
</div>
</div>"""


def render_landing_page(categories: list) -> str:
    frontmatter = """---
title: Tutorials
description: >-
  Standalone, tool-focused tutorials for MERN-stack web development — HTML & CSS,
  JavaScript, Express, React, and DevOps — each self-contained with runnable,
  copy-pasteable examples.
---"""
    cards = "\n\n".join(render_landing_card(c) for c in categories)
    return f"""{frontmatter}

# Tutorials

Standalone, tool-focused tutorials that sit alongside the course chapters — things
every developer needs regardless of which course unit you're on. Each one is
self-contained, written from beginner to intermediate level, with runnable,
copy-pasteable examples. Pick a category below.

<div class="cu-cards-3" markdown>

{cards}

</div>

More tutorials will be added to each category over time.
"""


def write_if_changed(path: Path, content: str, check: bool, changed: list[Path]) -> None:
    existing = path.read_text(encoding="utf-8") if path.exists() else None
    if existing == content:
        return
    changed.append(path)
    if not check:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--check",
        action="store_true",
        help="verify generated files match the JSON without writing; exit 1 if out of sync",
    )
    args = parser.parse_args()

    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    page_size = data["page_size"]
    categories = data["categories"]

    changed: list[Path] = []
    removed: list[Path] = []

    for category in categories:
        slug = category["slug"]
        tutorials = category["tutorials"]
        pages = chunk(tutorials, page_size)
        total_pages = len(pages)
        cat_dir = TUTORIALS_DIR / slug

        for page_num, page_items in enumerate(pages, start=1):
            content = render_category_page(category, page_num, page_items, total_pages, len(tutorials), page_size)
            path = cat_dir / ("index.md" if page_num == 1 else f"page-{page_num}.md")
            write_if_changed(path, content, args.check, changed)

        # Clean up stale page-N.md files left over from a category that shrank.
        if cat_dir.exists():
            for existing in sorted(cat_dir.glob("page-*.md")):
                try:
                    n = int(existing.stem.split("-", 1)[1])
                except ValueError:
                    continue
                if n > total_pages:
                    removed.append(existing)
                    if not args.check:
                        existing.unlink()

    landing_content = render_landing_page(categories)
    write_if_changed(TUTORIALS_DIR / "index.md", landing_content, args.check, changed)

    if changed or removed:
        verb = "would change" if args.check else "changed"
        for p in changed:
            print(f"{verb}: {p.relative_to(REPO_ROOT)}")
        for p in removed:
            verb2 = "would remove" if args.check else "removed"
            print(f"{verb2}: {p.relative_to(REPO_ROOT)}")
        if args.check:
            print(f"\n{len(changed) + len(removed)} file(s) out of sync with {DATA_PATH.relative_to(REPO_ROOT)}.")
            print("Run without --check to regenerate them before deploying.")
            return 1
        print(f"\nRegenerated {len(changed)} file(s), removed {len(removed)} stale file(s).")
        return 0

    print("Already in sync — nothing to do.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
