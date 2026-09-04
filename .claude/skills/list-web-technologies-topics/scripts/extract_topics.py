#!/usr/bin/env python3
"""Extract the lecture-wise topic list from a COMSATS CDF lecture-wise-plan .doc file.

Usage:
    python extract_topics.py [path/to/plan.doc] [--json out.json]

Requires the `antiword` binary to be on PATH (used to convert the legacy
.doc binary format to plain text before parsing the table).
"""
import argparse
import html
import json
import re
import subprocess
import sys
from pathlib import Path

DEFAULT_FILE = "course-cdf/CSC336 Web Technologies - Lecture-wise Plan.doc"


def run_antiword(doc_path: Path) -> str:
    try:
        result = subprocess.run(
            ["antiword", str(doc_path)],
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise SystemExit(
            "antiword is required but was not found on PATH. "
            "Install it (e.g. `choco install antiword` or via MSYS2/mingw) and retry."
        ) from exc
    except subprocess.CalledProcessError as exc:
        raise SystemExit(f"antiword failed on {doc_path}: {exc.stderr}") from exc
    return result.stdout


def parse_course_meta(text: str) -> dict:
    meta = {}
    name_match = re.search(r"Course Name:\s*([^|]+)", text)
    code_match = re.search(r"Course Code:\s*(\w+)", text)
    credit_match = re.search(r"Credit Hours:\s*([\w+]+)", text)
    prereq_match = re.search(r"Pre-requisite:\s*([^|]+(?:\n[^|]+)?)", text)
    semester_match = re.search(r"Semester:\s*(.+)", text)
    if name_match:
        meta["course_name"] = name_match.group(1).strip()
    if code_match:
        meta["course_code"] = code_match.group(1).strip()
    if credit_match:
        meta["credit_hours"] = credit_match.group(1).strip()
    if prereq_match:
        meta["prerequisite"] = prereq_match.group(1).strip()
    if semester_match:
        meta["semester"] = semester_match.group(1).strip()
    return meta


def parse_lectures(text: str) -> list[dict]:
    """Parse the pipe-delimited 'C: Lecture-wise Plan' table antiword emits."""
    lines = text.splitlines()
    try:
        start = next(i for i, l in enumerate(lines) if l.strip().startswith("C: Lecture-wise Plan"))
    except StopIteration:
        raise SystemExit("Could not find the 'C: Lecture-wise Plan' section in the document.")

    table_lines = [l for l in lines[start:] if l.strip().startswith("|")]

    lectures: list[dict] = []
    current: dict | None = None
    current_week = ""

    for raw in table_lines:
        cells = [c.strip() for c in raw.strip().strip("|").split("|")]
        while len(cells) < 5:
            cells.append("")
        week, lecture_no, topic, practice, remarks = cells[:5]

        if week:
            current_week = week

        if lecture_no.isdigit():
            if current:
                lectures.append(current)
            current = {
                "week": current_week,
                "lecture": int(lecture_no),
                "topic_lines": [],
                "practice": [],
                "remarks": [],
            }

        # Skip the header row and pure date placeholder rows with no useful text
        if topic and topic.upper() not in {"TOPIC (CHAPTER/TOPICS COVERED)"}:
            if current is not None:
                current["topic_lines"].append(topic)
        if practice and practice.upper() not in {"PRACTICE/", "EVALUATIO", "EVALUATION"}:
            if current is not None:
                current["practice"].append(practice)
        if remarks and remarks.upper() != "REMARKS":
            if current is not None:
                current["remarks"].append(remarks)

    if current:
        lectures.append(current)

    for lec in lectures:
        full_text = " ".join(lec.pop("topic_lines"))
        full_text = re.sub(r"\s+", " ", full_text).strip()
        if ":" in full_text.split(".")[0][:80]:
            title, _, rest = full_text.partition(":")
            title = title.strip()
            rest = rest.strip()
        else:
            title, rest = full_text, ""
        # Break the remaining prose into readable sub-topic bullets.
        points = re.split(r"(?<=[a-z0-9\)])\s*;\s*(?=[A-Z])|(?<=[a-z0-9\)])\.\s+(?=[A-Z])", rest)
        points = [p.strip().rstrip(".") for p in points if p.strip()]
        lec["title"] = title
        lec["subtopics"] = points
        lec["practice"] = " ".join(lec["practice"]).strip()
        lec["remarks"] = " ".join(lec["remarks"]).strip()

    return lectures


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("doc_file", nargs="?", default=DEFAULT_FILE)
    parser.add_argument("--json", dest="json_out", default=None, help="Optional path to write JSON output")
    args = parser.parse_args()

    doc_path = Path(args.doc_file)
    if not doc_path.exists():
        raise SystemExit(f"File not found: {doc_path}")

    raw_text = run_antiword(doc_path)
    raw_text = html.unescape(raw_text)
    meta = parse_course_meta(raw_text)
    lectures = parse_lectures(raw_text)

    print(f"# {meta.get('course_name', doc_path.stem)} ({meta.get('course_code', '')})")
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

    if args.json_out:
        out = {"meta": meta, "lectures": lectures}
        Path(args.json_out).write_text(json.dumps(out, indent=2), encoding="utf-8")
        print(f"\nJSON written to {args.json_out}", file=sys.stderr)


if __name__ == "__main__":
    main()
