---
name: list-web-technologies-topics
description: Lists the week-by-week, lecture-by-lecture topics and sub-topics for the Web Technologies (CSC336) course by parsing the official lecture-wise plan document in course-cdf/. Use when the user asks what CSC336 / Web Technologies covers, wants a syllabus/topic breakdown, or wants the lecture plan turned into a structured outline.
---

# List Web Technologies (CSC336) Topics

Extracts a clean, structured, lecture-wise topic list for the **Web Technologies (CSC336)**
course from `course-cdf/CSC336 Web Technologies - Lecture-wise Plan.doc` — the official
COMSATS CDF lecture-wise plan document (a legacy binary `.doc` table that is painful to read
by eye).

## What it does

1. Converts the `.doc` file to plain text with `antiword`.
2. Parses the "C: Lecture-wise Plan" table, re-joining each lecture's word-wrapped table
   cell back into a single topic title + a list of sub-topic bullets.
3. Prints a readable Week → Lecture → Topics outline, and can optionally write the same
   data as structured JSON for downstream use (e.g. generating documentation pages).

## When to use this skill

- The user asks "what topics does Web Technologies / CSC336 cover?"
- The user wants a lecture-by-lecture syllabus outline for CSC336.
- Any task that needs the CSC336 plan as structured data instead of a raw `.doc` file
  (e.g. building course docs, slides, or a study guide).

## How to run it

```bash
python .claude/skills/list-web-technologies-topics/scripts/extract_topics.py
```

This defaults to `course-cdf/CSC336 Web Technologies - Lecture-wise Plan.doc` relative to
the current working directory. To point at a different copy of the plan, or to also emit
JSON:

```bash
python .claude/skills/list-web-technologies-topics/scripts/extract_topics.py "path/to/plan.doc" --json out.json
```

The JSON shape is:

```json
{
  "meta": { "course_name": "...", "course_code": "CSC336", "prerequisite": "..." },
  "lectures": [
    { "week": "1", "lecture": 1, "title": "Introduction to Web Development",
      "subtopics": ["...", "..."], "practice": "Exercises as given in the books", "remarks": "..." }
  ]
}
```

## Requirements

- Python 3.9+ (uses `list[dict]` / `dict | None` type hints).
- `antiword` on PATH (converts the legacy binary `.doc` format to text). On Windows with
  Git Bash/MSYS2 this is typically already available at `/mingw64/bin/antiword`; otherwise
  install it via your package manager.

## Notes for the assistant

- Report the output directly to the user (or use it to drive another task, such as
  generating documentation) — don't just say the script exists.
- If `antiword` is missing, tell the user how to install it rather than guessing at the
  file contents.
- Lecture 17 in the plan is the Midterm Examination slot (no real topic content); treat it
  accordingly if generating further material from this list.
