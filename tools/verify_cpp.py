# Extracts every titled ```cpp block from a lecture markdown file, compiles
# each with g++, runs it, and prints the real output next to whatever
# ```text output block follows it in the doc -- so a mismatch (or outright
# fabricated output) is caught by reading, not by trusting the prose.
#
# Requires a real g++ on PATH or at MINGW_BIN below (a portable WinLibs
# MinGW-w64 build works well on Windows with no admin rights -- see
# https://github.com/brechtsanders/winlibs_mingw/releases). Runtime DLLs
# (libstdc++-6.dll etc.) must also be reachable, so MINGW_BIN is prepended
# to PATH for both the compile and run subprocess calls.
#
# Usage:
#   python tools/verify_cpp.py docs/algorithms-and-data-structures/lecture-05-*.md
#   python tools/verify_cpp.py docs/algorithms-and-data-structures/lecture-*.md   (shell-expanded)

import re
import subprocess
import sys
import tempfile
import os

MINGW_BIN = r"C:\Users\UsmanAkram\tools\mingw64\bin"
GXX = os.path.join(MINGW_BIN, "g++.exe")

ENV = os.environ.copy()
ENV["PATH"] = MINGW_BIN + os.pathsep + ENV.get("PATH", "")

CPP_BLOCK = re.compile(
    r'```cpp(?:\s+title="([^"]+)")?\n(.*?)\n```', re.DOTALL
)
TEXT_BLOCK = re.compile(r'```text\n(.*?)\n```', re.DOTALL)


def extract_blocks(md_path):
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
    blocks = []
    for m in CPP_BLOCK.finditer(content):
        if not m.group(1):
            continue  # untitled cpp block: an illustrative fragment, not a runnable file
        title = m.group(1)
        code = m.group(2)
        # the ```text block (if any) immediately following this cpp block
        rest = content[m.end():]
        text_m = TEXT_BLOCK.match(rest.lstrip("\n"))
        documented = text_m.group(1) if text_m else None
        blocks.append((title, code, documented))
    return blocks


def compile_and_run(title, code, workdir):
    src_path = os.path.join(workdir, title if title.endswith(".cpp") else title + ".cpp")
    exe_path = os.path.join(workdir, os.path.splitext(os.path.basename(src_path))[0] + ".exe")
    with open(src_path, "w", encoding="utf-8") as f:
        f.write(code)

    compile_proc = subprocess.run(
        [GXX, "-std=c++17", "-o", exe_path, src_path],
        capture_output=True, text=True, env=ENV,
    )
    if compile_proc.returncode != 0:
        return None, f"COMPILE ERROR:\n{compile_proc.stderr}"

    run_proc = subprocess.run(
        [exe_path], capture_output=True, text=True, env=ENV, timeout=15,
    )
    return run_proc.stdout, run_proc.stderr


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/verify_cpp.py <lecture.md> [more.md ...]")
        sys.exit(1)

    with tempfile.TemporaryDirectory() as workdir:
        any_mismatch = False
        for md_path in sys.argv[1:]:
            blocks = extract_blocks(md_path)
            print(f"\n=== {md_path} ({len(blocks)} cpp block(s)) ===")
            for title, code, documented in blocks:
                stdout, stderr = compile_and_run(title, code, workdir)
                print(f"\n--- {title} ---")
                if stdout is None:
                    print(stderr)
                    any_mismatch = True
                    continue
                print("REAL OUTPUT:")
                print(stdout.rstrip("\n"))
                if stderr.strip():
                    print("STDERR:", stderr.strip())
                if documented is not None:
                    doc_norm = documented.strip()
                    real_norm = stdout.rstrip("\n").strip()
                    # strip the "$ g++ ... / $ ./exe" command-echo lines before comparing
                    doc_lines = [l for l in doc_norm.split("\n") if not l.startswith("$")]
                    doc_norm = "\n".join(doc_lines).strip()
                    if doc_norm != real_norm:
                        print("MISMATCH vs documented output:")
                        print("  documented:", repr(doc_norm))
                        print("  real:      ", repr(real_norm))
                        any_mismatch = True
        if any_mismatch:
            print("\n\nSome blocks had compile errors or output mismatches -- see above.")
            sys.exit(1)
        print("\n\nAll blocks compiled and matched their documented output.")


if __name__ == "__main__":
    main()
