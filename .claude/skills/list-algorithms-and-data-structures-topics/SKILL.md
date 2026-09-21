---
name: list-algorithms-and-data-structures-topics
description: Lists the week-by-week, lecture-by-lecture topics and sub-topics for the Algorithms and Data Structures (CSC211) course by parsing the official lecture-wise plan PDF in course-cdf/. Use when the user asks what CSC211 / Algorithms and Data Structures covers, wants a syllabus/topic breakdown, or wants the lecture plan turned into a structured outline.
---

# List Algorithms and Data Structures (CSC211) Topics

Extracts a clean, structured, lecture-wise topic list for the **Algorithms and Data
Structures (CSC211)** course from
`course-cdf/algorithms-and-data-structures/Lecture-wise-plan.pdf` — the official COMSATS
lecture-wise plan document (32 lectures across 16 teaching weeks plus a midterm and final).

## Why this one works differently from the CSC336/CSC337 skills

Those two courses' plans are legacy `.doc` files, parsed with `antiword` into a clean
pipe-delimited table. This course's plan ships as a **PDF** with a real (but textually
undelimited) table — plain-text extraction, even `pdftotext -layout`, interleaves the
Topic / Practice / Remarks columns mid-line because they sit side by side on the page.

Instead, `extract_topics.py` reads **word-level bounding boxes** (via PyMuPDF) and
reconstructs the table the way a human eye tracks it: column membership by x-position,
row/lecture membership by y-position, using each "Lecture #" cell's row as the start
boundary for that lecture's slice of the Topic/Practice/Remarks columns.

## When to use this skill

- The user asks "what topics does Algorithms and Data Structures / CSC211 cover?"
- The user wants a lecture-by-lecture syllabus outline for CSC211.
- Any task that needs the CSC211 plan as structured data instead of a raw PDF (e.g.
  building course docs, slides, or a study guide) — this is what drove building the
  `docs/algorithms-and-data-structures/` book.

## How to run it

```bash
python .claude/skills/list-algorithms-and-data-structures-topics/scripts/extract_topics.py
```

Defaults to `course-cdf/algorithms-and-data-structures/Lecture-wise-plan.pdf` relative to
the current working directory. To point at a different copy, or to also emit JSON:

```bash
python .claude/skills/list-algorithms-and-data-structures-topics/scripts/extract_topics.py "path/to/plan.pdf" --json out.json
```

The JSON shape is:

```json
{
  "meta": { "course_code": "CSC211", "course_name": "...", "prerequisite": "...", "course_contents": "..." },
  "lectures": [
    { "week": "1", "lecture": 1, "title": "Introduction to Data Structures",
      "subtopics": ["Course Overview", "..."], "practice": "...", "remarks": "..." }
  ]
}
```

## Requirements

- Python 3.9+.
- `pymupdf` (`pip install pymupdf`) — already installed in this project's Python
  environment.

## Notes for the assistant

- Report the output directly to the user, or use it to drive another task (e.g. generating
  documentation) — don't just say the script exists.
- The source PDF's own header has a typo: it labels the course "CSC211 Discrete
  Structures" even though every other official document (CDF, syllabus) and the actual
  content is **Data Structures** (and Algorithms). The script surfaces the typo as-is in
  `meta.course_name` — treat "Discrete Structures" here as a source typo, not a real course
  name, if it surfaces anywhere downstream.
- Lecture 18 is the Midterm Examination slot and lecture 32's row also carries the Final
  Term Exam note (it trails the table) — neither has real topic content of its own; treat
  them accordingly if generating further material from this list.
- The `practice`/`remarks` fields can carry minor column-bleed artifacts (e.g. a stray
  "Weiss:" token) from words that sit exactly on a column boundary in the source PDF —
  the `title`/`subtopics` fields (the ones that matter for content generation) are clean.
  If you need the reading references cleanly, cross-check against the syllabus PDF
  (`CSC211_DS&A_Syllabus_V3.1.pdf`) instead, which has them in plain extractable text.
- Two reference books are cited throughout: **Goodrich** (*Data Structures & Algorithms in
  C++*, Goodrich/Tamassia/Mount/Goldwasser) and **Weiss** (*Data Structures and Algorithm
  Analysis in C++*) — both C++. This is why the companion book
  (`docs/algorithms-and-data-structures/`) uses C++ for every code example.
