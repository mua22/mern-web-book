---
name: tutorial-pagination
description: How tutorial category listing pages (docs/tutorials/*/index.md, page-2.md, ...) are generated from data/tutorials.json instead of hand-edited. Use whenever a tutorial is added, removed, reordered, or moved between categories, whenever a category's intro/description changes, or before every deploy to make sure the generated pages and the JSON are in sync.
---

# Tutorial Pagination

cuinotes.com's Tutorials section (`docs/tutorials/`) is SEO-heavy content: lots of
small, focused pages meant to be found and indexed individually. Its category
listing pages (`docs/tutorials/<category>/index.md`, `page-2.md`, `page-3.md`, ...)
are **generated**, not hand-written — real, separate, static pages, one per 10
tutorials, not client-side JS pagination (crawlers mostly don't execute JS, and a
JS-paginated list has no distinct URL for page 2 to rank on its own).

`data/tutorials.json` is the single source of truth for which tutorial is in which
category, in what order, and what its title/level/summary are. A generator script
turns that JSON into the actual `.md` files. **Never hand-edit a generated file** —
edit the JSON and regenerate, or your edit will be silently overwritten (and the
`--check` mode described below will flag the file as "out of sync" until you do).

## The golden rule

**Before every deploy** (`mkdocs build` / `mkdocs gh-deploy`), if `data/tutorials.json`
or anything under `docs/tutorials/` changed since the last deploy, run:

```bash
python .claude/skills/tutorial-pagination/scripts/generate_tutorials.py
```

Review what it printed changed (`git diff` / `git status`), commit those files
alongside your JSON edit, *then* build and deploy. If it prints "Already in sync —
nothing to do.", there's nothing to commit and you're clear to deploy.

To just verify without writing (e.g. as a sanity check, or wired into a pre-commit/
pre-push hook later), use `--check` — it exits `1` and lists every file that would
change if the generated pages don't match the JSON:

```bash
python .claude/skills/tutorial-pagination/scripts/generate_tutorials.py --check
```

## Adding a new tutorial

1. Write the tutorial content file: `docs/tutorials/<category>/<slug>.md`, same
   frontmatter/structure convention as its category's existing tutorials.
2. Add an entry for it to `data/tutorials.json`, in the right category's
   `tutorials` array, in the position you want it to appear (reading order, not
   alphabetical) — `slug` (matches the filename minus `.md`), `title`, `level`
   (`"Beginner"`, `"Beginner to Intermediate"`, or `"Intermediate"` — these three
   strings specifically, they drive the chip color), and `summary` (one sentence,
   shown on the category listing card).
3. Add the page to `mkdocs.yml`'s `nav:` tree under that category, alongside its
   siblings (the generator does **not** touch `mkdocs.yml` — individual tutorial nav
   entries stay hand-maintained, same as every other content type in this repo).
   Paginated overflow pages (`page-2.md` etc.) are deliberately **not** added to
   `nav:` — they're reachable through the in-page pager and mkdocs's sitemap.xml,
   consistent with how most sites don't put pagination in a primary nav menu.
4. Run the generator (plain, no `--check`) and commit the files it changed —
   normally the category's `index.md` (card count/position updates) and the
   Tutorials landing page (`docs/tutorials/index.md`, category card counts).

## Adding a new category

1. Create `docs/tutorials/<new-category>/` (the generator will populate it, but the
   directory itself, and any hand-written tutorial `.md` files in it, are yours to
   create).
2. Add a category object to `data/tutorials.json`'s `categories` array: `slug`,
   `title`, `color` (`"purple"`, `"teal"`, or `"orange"` — the only three defined in
   `COLOR_HEX`/`COLOR_BG`/`COLOR_CHIP_CLASS` in the script; add a new one there first
   if you need a 4th), `icon_svg` (inner `<svg>` markup, stroke-based, no `stroke`
   attribute on the root paths — the wrapping `<svg>` sets `stroke="{hex}"` for you),
   `card_description` (one line, shown on the Tutorials landing page card),
   `intro` (a real paragraph, shown at the top of the category's own page 1), `tags`,
   and `tutorials: []` if it's starting empty (renders a "Coming soon" placeholder
   automatically — see `render_empty_state()`).
3. Add the category to `mkdocs.yml`'s Tutorials nav block (an `Overview:` entry
   pointing at `tutorials/<new-category>/index.md`, same shape as the existing
   categories).
4. Run the generator and commit what it wrote.

## Why static pages, not JS pagination (history)

An earlier version of this used a `.cu-paginated` container + a small JS file
(`docs/javascripts/pagination.js`) that chunked and hid/showed items client-side —
one URL per category, all pages behind it. That's fine for a UI toy but wrong for
SEO-heavy content: page 2's tutorials have no page 2 URL to be indexed or shared
under, and a crawler that doesn't execute JS never sees them chunked at all. This
was replaced with the JSON + generator approach so every page (page 1, page 2, ...)
is a real file with its own URL, title, meta description, and `rel="prev"`/
`rel="next"` link tags (see `overrides/main.html`'s `extrahead` block, which reads
the `pagination_prev`/`pagination_next` frontmatter the generator writes).

## How the generator works

`scripts/generate_tutorials.py` (this skill's `scripts/` folder):

1. Loads `data/tutorials.json` (`page_size`, defaulting the whole site to 10 items
   per page, plus the `categories` list).
2. For each category, chunks its `tutorials` array into pages of `page_size` and
   renders each page: `index.md` for page 1, `page-2.md`, `page-3.md`, ... for the
   rest. Each page gets its own frontmatter `title`/`description` (page 1 uses the
   category's `card_description`; page 2+ gets a distinct "Page N of M" title and
   description so search engines don't see duplicate content across pages), a
   `.cu-card` per tutorial (numbered `"N of TOTAL"` across the *whole* category, not
   just that page), and a `.cu-paginated-controls` pager (Prev / numbered pages /
   Next) built from real markdown links with `attr_list` classes — the *current*
   page number renders as a plain non-linked `<span class="cu-page-btn active">`,
   and a disabled Prev/Next (page 1 has no Prev, the last page has no Next) renders
   as a plain `<span aria-disabled="true">` rather than a link.
3. Deletes any `page-N.md` left over from when a category had more pages than it
   does now (a category that shrinks below its old page count won't leave orphaned
   pages reachable at dead URLs).
4. Regenerates `docs/tutorials/index.md` (the landing page) — one card per category,
   with its live tutorial count or "Coming soon" if empty.
5. Writes files with `pathlib`/UTF-8 only if their content actually changed (a
   no-op run touches nothing, so `git status` after a plain run only shows genuine
   content changes, never a wall of unchanged-content diffs from re-writing
   everything unconditionally).

Card and pager links are same-directory relative markdown links or same-directory
raw `<a href="slug/">` overlays (`.cu-card-link`) — every tutorial file, and every
`page-N.md`, lives in the *same* category folder, so no cross-directory relative-path
depth math is needed (see the `mkdocs-relative-href-depth` memory for why that
matters and how badly it can go wrong when it isn't same-directory).

## Requirements

Python 3.9+, standard library only (`json`, `pathlib`, `argparse`) — no install step.

## Notes for the assistant

- Never hand-edit `docs/tutorials/<category>/index.md` or `page-N.md` content, or
  `docs/tutorials/index.md`'s category cards — edit `data/tutorials.json` and run the
  generator. If you catch yourself about to `Edit` one of those files directly, stop
  and edit the JSON instead.
- After running the generator, actually look at what it printed changed before
  committing — an unexpected file in the list usually means a JSON typo (wrong slug,
  wrong category) rather than an intentional change.
- `SITE_URL` and the `--page_size`/color tables are constants at the top of
  `generate_tutorials.py`; keep `SITE_URL` in sync with `mkdocs.yml`'s `site_url` if
  that ever changes (used to build absolute `pagination_prev`/`pagination_next` URLs).
- Individual tutorial content pages themselves (`docs/tutorials/<category>/<slug>.md`)
  are never touched by this script — only the category listing/landing pages are
  generated. Writing a tutorial's actual content is a separate, hand-written task.
