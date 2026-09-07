#!/usr/bin/env python3
"""Render a small HTML snippet with headless Chrome and save an auto-cropped PNG.

Used to generate real, honest "rendered in a browser" screenshots for the book's
HTML/CSS code examples, instead of hand-drawn diagrams that can drift from what the
markup actually does.

Usage:
    python scripts/shoot_html.py input.html output.png
    python scripts/shoot_html.py input.html output.png --width 800 --height 1400

`input.html` should be a *complete* HTML document (doctype/head/body) -- wrap your
snippet yourself so you control fonts/margins/extra CSS needed only for legibility
(e.g. adding a light table border). Keep the actual tags being taught unchanged from
what's shown in the lecture's code block.
"""
import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageChops

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser() -> str:
    for candidate in CHROME_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise SystemExit("No headless-capable browser found (checked Chrome/Edge default install paths).")


def shoot(html_path: Path, out_path: Path, width: int = 760, height: int = 1400, pad: int = 12, scale: int = 2) -> None:
    browser = find_browser()
    html_path = html_path.resolve()
    out_path = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path = out_path.with_suffix(".raw.png")

    result = subprocess.run(
        [
            browser,
            "--headless",
            "--disable-gpu",
            f"--screenshot={raw_path}",
            f"--window-size={width},{height}",
            "--hide-scrollbars",
            f"--force-device-scale-factor={scale}",
            f"file:///{html_path.as_posix()}",
        ],
        capture_output=True,
        text=True,
    )
    if not raw_path.exists():
        print("STDOUT:", result.stdout, file=sys.stderr)
        print("STDERR:", result.stderr, file=sys.stderr)
        raise SystemExit(f"Browser did not produce {raw_path}")

    img = Image.open(raw_path).convert("RGB")
    bg = Image.new("RGB", img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        left = max(0, left - pad * scale)
        top = max(0, top - pad * scale)
        right = min(img.width, right + pad * scale)
        bottom = min(img.height, bottom + pad * scale)
        img = img.crop((left, top, right, bottom))
    img.save(out_path)
    raw_path.unlink()
    print(f"{html_path.name} -> {out_path} ({img.width}x{img.height})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("html_file")
    parser.add_argument("out_file")
    parser.add_argument("--width", type=int, default=760)
    parser.add_argument("--height", type=int, default=1400)
    parser.add_argument("--pad", type=int, default=12)
    args = parser.parse_args()
    shoot(Path(args.html_file), Path(args.out_file), width=args.width, height=args.height, pad=args.pad)


if __name__ == "__main__":
    main()
