"""Read-only validation for the source-only package."""
import ast
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SECRET = re.compile(rb"(?:sk[-_]?[A-Za-z0-9_-]{20,}|EduRag-[A-Za-z0-9-]{12,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)")
BAD_SUFFIXES = {".jsonl", ".db", ".sqlite", ".sqlite3", ".pdf", ".docx", ".log", ".pt", ".pth", ".onnx", ".mp3", ".wav", ".mp4"}
BAD_PREFIXES = ("test_", "convert_", "sync_", "normalize_", "package_", "prepare_")


def main():
    problems = []
    files = 0
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        files += 1
        relative = path.relative_to(ROOT).as_posix()
        data = path.read_bytes()
        if SECRET.search(data):
            problems.append((relative, "credential-like value"))
        if path.suffix.lower() in BAD_SUFFIXES:
            problems.append((relative, "database/corpus/model file"))
        if path.name.startswith(BAD_PREFIXES) or path.name == "test.py":
            problems.append((relative, "development-only script"))
        if path.suffix.lower() == ".py":
            try:
                ast.parse(data.decode("utf-8-sig"), filename=relative)
            except (SyntaxError, UnicodeError):
                problems.append((relative, "Python syntax error"))
    for relative, reason in problems:
        print(f"{relative}: {reason}")
    print(f"Checked {files} files; issues: {len(problems)}")
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
