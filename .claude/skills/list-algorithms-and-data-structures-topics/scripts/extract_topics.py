#!/usr/bin/env python3
"""Extract the lecture-wise topic list from the CSC211 (Algorithms and Data Structures)
lecture-wise-plan PDF.

Unlike the legacy .doc-based CDF plans for CSC336/CSC337 (parsed with antiword into a
clean pipe-delimited table), this course's plan ships as a PDF whose table has real
columns but no textual delimiters -- plain-text extraction (even with -layout) interleaves
the Topic / Practice / Remarks columns mid-line. This script instead reads word-level
bounding boxes (via PyMuPDF) and reconstructs the table by column x-position and row
y-position, the same way a human eye tracks a table visually.

Usage:
    python extract_topics.py [path/to/plan.pdf] [--json out.json]
"""
import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_FILE = "course-cdf/algorithms-and-data-structures/Lecture-wise-plan.pdf"

# Column boundaries (x0, in points) read off the header row of the "C: Lecture-wise Plan"
# table. Re-check these with --debug-columns if the source PDF is ever regenerated with a
# different layout.
COL_WEEK_END = 119
COL_LECTURE_END = 176
COL_TOPIC_END = 419
COL_PRACTICE_END = 507

BULLET_CHARS = {"", "�", "•", ""}


def _import_fitz():
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        raise SystemExit(
            "PyMuPDF is required but not installed. Install it with `pip install pymupdf`."
        ) from exc
    return fitz


def extract_words(pdf_path: Path) -> list[tuple[int, float, float, float, float, str]]:
    """Return (page_index, x0, y0, x1, y1, text) for every word, across the whole document."""
    fitz = _import_fitz()
    doc = fitz.open(pdf_path)
    words = []
    for page_index, page in enumerate(doc):
        for w in page.get_text("words"):
            x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
            words.append((page_index, x0, y0, x1, y1, text))
    return words


def parse_meta(pdf_path: Path) -> dict:
    fitz = _import_fitz()
    doc = fitz.open(pdf_path)
    text = doc[1].get_text("text")  # page 2: "A: Teacher Information" / "B: Course Contents"
    meta = {}
    m = re.search(r"Course Name:\s*(\S+)\s+(.+)", text)
    if m:
        meta["course_code"] = m.group(1).strip()
        meta["course_name"] = m.group(2).split("\n")[0].strip()
    m = re.search(r"Pre-requisite:\s*(.+)", text)
    if m:
        meta["prerequisite"] = m.group(1).split("\n")[0].strip()
    m = re.search(r"Credit Hours:\s*(\S+)", text)
    if m:
        meta["credit_hours"] = m.group(1).strip()
    m = re.search(r"This course provides.+?(?=Recommended Books:)", text, re.S)
    if m:
        meta["course_contents"] = re.sub(r"\s+", " ", m.group(0)).strip()
    return meta


def _row_key(page_index: int, y: float) -> tuple[int, float]:
    return (page_index, y)


def parse_lectures(words: list[tuple[int, float, float, float, float, str]]) -> list[dict]:
    # Find every table row where the "Lecture #" column holds a bare integer -- that marks
    # the start of a new lecture record. Ignore the header row's "#" and any stray page
    # furniture by requiring the word to be a pure digit string.
    lecture_starts: list[tuple[int, tuple[int, float]]] = []  # (lecture_no, (page,y))
    week_col_words = []
    for page_index, x0, y0, x1, y1, text in words:
        if x0 < COL_WEEK_END and re.fullmatch(r"\d{1,2}", text):
            week_col_words.append((page_index, y0, text))
        if COL_WEEK_END <= x0 < COL_LECTURE_END and re.fullmatch(r"\d{1,2}", text):
            n = int(text)
            if 1 <= n <= 40:
                lecture_starts.append((n, _row_key(page_index, y0)))

    lecture_starts.sort(key=lambda t: t[1])
    # De-duplicate accidental repeats (e.g. a stray digit picked up twice on the same row).
    dedup: list[tuple[int, tuple[int, float]]] = []
    for n, key in lecture_starts:
        if dedup and dedup[-1][0] == n and abs(dedup[-1][1][1] - key[1]) < 5 and dedup[-1][1][0] == key[0]:
            continue
        dedup.append((n, key))
    lecture_starts = dedup

    week_col_words.sort(key=lambda t: (t[0], t[1]))

    def week_for(key: tuple[int, float]) -> str:
        current = ""
        for page_index, y0, text in week_col_words:
            if (page_index, y0) <= key:
                current = text
            else:
                break
        return current

    lectures = []
    for i, (lec_no, start_key) in enumerate(lecture_starts):
        end_key = lecture_starts[i + 1][1] if i + 1 < len(lecture_starts) else (10**9, 0)
        topic_words, practice_words, remarks_words = [], [], []
        for page_index, x0, y0, x1, y1, text in words:
            key = _row_key(page_index, y0)
            if not (start_key <= key < end_key):
                continue
            if text == "(Date)":
                continue
            if COL_LECTURE_END <= x0 < COL_TOPIC_END:
                topic_words.append((page_index, y0, x0, text))
            elif COL_TOPIC_END <= x0 < COL_PRACTICE_END:
                practice_words.append((page_index, y0, x0, text))
            elif x0 >= COL_PRACTICE_END:
                remarks_words.append((page_index, y0, x0, text))

        lectures.append(
            {
                "week": week_for(start_key),
                "lecture": lec_no,
                "topic_words": topic_words,
                "practice_words": practice_words,
                "remarks_words": remarks_words,
            }
        )
    return lectures


def words_to_lines(tagged_words: list[tuple[int, float, float, str]]) -> list[str]:
    """Group (page,y0,x0,text) tuples into reading-order lines, splitting on bullet chars."""
    tagged_words = sorted(tagged_words, key=lambda t: (t[0], round(t[1], 0), t[2]))
    lines: list[list[str]] = []
    current: list[str] = []
    last_key = None
    for page_index, y0, x0, text in tagged_words:
        key = (page_index, round(y0 / 4))  # bucket rows ~4pt apart as "same line"
        if text in BULLET_CHARS:
            if current:
                lines.append(current)
            current = []
            last_key = key
            continue
        if last_key is not None and key != last_key and current and (key[0] != last_key[0] or abs(y0 - last_y) > 16):
            # Big vertical jump with no bullet in between -> still same bullet, just wrapped;
            # only start a new line on an explicit bullet character (handled above).
            pass
        current.append(text)
        last_key = key
        last_y = y0
    if current:
        lines.append(current)
    return [" ".join(l).strip() for l in lines if " ".join(l).strip()]


def build_lecture_records(raw_lectures: list[dict]) -> list[dict]:
    out = []
    for lec in raw_lectures:
        topic_lines = words_to_lines(lec["topic_words"])
        practice_lines = words_to_lines(lec["practice_words"])
        remarks_lines = words_to_lines(lec["remarks_words"])

        title = topic_lines[0].rstrip(":").strip() if topic_lines else ""
        subtopics = topic_lines[1:]

        out.append(
            {
                "week": lec["week"],
                "lecture": lec["lecture"],
                "title": title,
                "subtopics": subtopics,
                "practice": " ".join(practice_lines).strip(),
                "remarks": " ".join(remarks_lines).strip(),
            }
        )
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf_file", nargs="?", default=DEFAULT_FILE)
    parser.add_argument("--json", dest="json_out", default=None, help="Optional path to write JSON output")
    args = parser.parse_args()

    pdf_path = Path(args.pdf_file)
    if not pdf_path.exists():
        raise SystemExit(f"File not found: {pdf_path}")

    meta = parse_meta(pdf_path)
    words = extract_words(pdf_path)
    raw_lectures = parse_lectures(words)
    lectures = build_lecture_records(raw_lectures)

    print(f"# {meta.get('course_name', pdf_path.stem)} ({meta.get('course_code', '')})")
    if meta.get("prerequisite"):
        print(f"Pre-requisite: {meta['prerequisite']}")
    print(f"Total lectures found: {len(lectures)}\n")

    current_week = None
    for lec in lectures:
        if lec["week"] and lec["week"] != current_week:
            current_week = lec["week"]
            print(f"\n## Week {current_week}")
        print(f"\n### Lecture {lec['lecture']}: {lec['title']}")
        for point in lec["subtopics"]:
            print(f"  - {point}")
        if lec["practice"]:
            print(f"  Practice/Evaluation: {lec['practice']}")
        if lec["remarks"]:
            print(f"  Reading: {lec['remarks']}")

    if args.json_out:
        out = {"meta": meta, "lectures": lectures}
        Path(args.json_out).write_text(json.dumps(out, indent=2), encoding="utf-8")
        print(f"\nJSON written to {args.json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
