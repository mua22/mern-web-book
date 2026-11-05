"""Package the Shelf example as docs/claude-code-handbook/downloads/shelf.zip (run from the repo root)."""
import os
import zipfile

ROOT = "docs/claude-code-handbook/examples"
OUT = "docs/claude-code-handbook/downloads/shelf.zip"
SKIP = {"node_modules", "data.json", ".env"}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    for d, dirs, files in os.walk(os.path.join(ROOT, "shelf")):
        dirs[:] = [x for x in dirs if x not in SKIP]
        for f in sorted(files):
            if f in SKIP:
                continue
            full = os.path.join(d, f)
            z.write(full, os.path.relpath(full, ROOT))
print(f"wrote {OUT}: {len(zipfile.ZipFile(OUT).namelist())} files")
