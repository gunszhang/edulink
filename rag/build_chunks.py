"""Build searchable RAG chunks from the enriched theory catalogue.

The input catalogue is a nested JSON object.  A theory leaf is identified by
the presence of one or more of the three source keys (theory explanation,
teaching paradigms, and classroom exemplars).  This module deliberately uses
only the Python standard library so that the chunk-building step can run in a
fresh environment before any embedding or retrieval dependencies are added.

Run from any directory with::

    python rag/build_chunks.py

The default output is ``rag/data/knowledge_chunks.jsonl``.  Paths and chunk
parameters can be overridden with the command-line options shown by ``-h``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
import unicodedata
from pathlib import Path
from typing import Any, Iterable, Iterator, Sequence


SOURCE_KEYS: tuple[str, ...] = ("理论完成解释", "教理范式汇典", "课堂范本")
PARAGRAPH_KEY = "段落"
TABLE_KEY = "表格"
TITLE_KEY = "原始标题"


def _default_input_path() -> Path:
    """Return the catalogue path relative to this script, not the cwd."""

    return Path(__file__).resolve().parents[1] / "知识库" / "理论总表.json"


def _default_output_path() -> Path:
    return Path(__file__).resolve().parent / "data" / "knowledge_chunks.jsonl"


def _is_scalar(value: Any) -> bool:
    return not isinstance(value, (list, tuple, dict))


def _value_to_text(value: Any) -> str:
    """Render a cell or a scalar value without losing structured data."""

    if value is None:
        return ""
    if isinstance(value, bool):
        return "是" if value else "否"
    if isinstance(value, (dict, list, tuple)):
        if isinstance(value, dict):
            pieces = []
            for key, item in value.items():
                rendered = _value_to_text(item)
                pieces.append(f"{key}: {rendered}" if rendered else str(key))
            return "；".join(pieces)
        return "；".join(_value_to_text(item) for item in value)
    return str(value)


def _clean_line(value: Any) -> str:
    """Normalize line endings and incidental whitespace while retaining prose."""

    text = _value_to_text(value)
    text = unicodedata.normalize("NFC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # A paragraph is expected to be one logical line.  Preserve intentional
    # newlines in nested values, but keep indentation noise out of the index.
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
    return "\n".join(line for line in lines if line)


def _flatten_paragraphs(value: Any) -> list[str]:
    """Flatten paragraph containers into ordered, non-empty text lines."""

    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        result: list[str] = []
        for item in value:
            result.extend(_flatten_paragraphs(item))
        return result
    if isinstance(value, dict):
        result = []
        for key, item in value.items():
            rendered = _clean_line(item)
            if rendered:
                result.append(f"{key}：{rendered}")
        return result
    rendered = _clean_line(value)
    return [rendered] if rendered else []


def _render_table(value: Any) -> list[str]:
    """Render arbitrarily nested table/list data as retrieval-friendly text.

    The source JSON normally stores a table as ``[rows]`` or ``[[rows]]``.
    This renderer also handles ragged rows, dictionaries, and scalar cells so
    a malformed or future table shape does not abort the complete build.
    """

    if value is None:
        return []
    if isinstance(value, dict):
        lines: list[str] = []
        for key, item in value.items():
            rendered = _value_to_text(item)
            if rendered:
                lines.append(f"{key}：{rendered}")
        return lines
    if not isinstance(value, (list, tuple)):
        rendered = _clean_line(value)
        return [rendered] if rendered else []
    if not value:
        return []

    # A flat list is one row.  A list of flat lists is a matrix/table.
    if all(_is_scalar(cell) for cell in value):
        cells = [_clean_line(cell).replace("|", "／") for cell in value]
        row = " | ".join(cell for cell in cells if cell)
        return [row] if row else []
    if all(isinstance(row, (list, tuple)) and all(_is_scalar(cell) for cell in row) for row in value):
        lines = []
        for row in value:
            cells = [_clean_line(cell).replace("|", "／") for cell in row]
            # Keep empty cells in their position when there is at least one
            # non-empty cell; this preserves column alignment for ragged data.
            if any(cells):
                lines.append(" | ".join(cells))
        return lines

    # Nested matrices (the common ``[table, table]`` representation) are
    # rendered in order with a small delimiter so tables remain distinguishable.
    lines = []
    for index, child in enumerate(value, start=1):
        child_lines = _render_table(child)
        if not child_lines:
            continue
        if len(value) > 1:
            lines.append(f"表格片段 {index}：")
        lines.extend(child_lines)
    return lines


def _flatten_tables(value: Any) -> list[str]:
    """Flatten the record's table collection and label each table."""

    if value is None:
        return []
    # A record usually has a list of tables.  If it is a single matrix, treat
    # it as one table rather than interpreting each row as a separate table.
    if isinstance(value, (list, tuple)):
        if not value:
            return []
        looks_like_single_matrix = all(
            isinstance(row, (list, tuple))
            and all(_is_scalar(cell) for cell in row)
            for row in value
        )
        tables: Sequence[Any] = [value] if looks_like_single_matrix else value
    else:
        tables = [value]

    lines: list[str] = []
    for index, table in enumerate(tables, start=1):
        rendered = _render_table(table)
        if not rendered:
            continue
        lines.append(f"表格 {index}：")
        lines.extend(rendered)
    return lines


def _record_text(
    theory_name: str,
    category_path: Sequence[str],
    source_type: str,
    record: Any,
) -> tuple[str, str]:
    """Return ``(source_title, text)`` for one source record."""

    if isinstance(record, dict):
        source_title = _clean_line(record.get(TITLE_KEY)) or theory_name
        paragraphs = _flatten_paragraphs(record.get(PARAGRAPH_KEY))
        tables = _flatten_tables(record.get(TABLE_KEY))
    else:
        source_title = theory_name
        paragraphs = _flatten_paragraphs(record)
        tables = []

    # A compact metadata preamble improves semantic retrieval for chunks that
    # begin in the middle of a long record.  The same metadata is also emitted
    # as structured JSON fields below for filtering and citation.
    preamble = [
        f"理论名称：{theory_name}",
        f"分类路径：{' / '.join(category_path)}" if category_path else "分类路径：",
        f"来源类型：{source_type}",
        f"原始标题：{source_title}",
    ]
    sections = ["\n".join(preamble)]
    if paragraphs:
        sections.append("正文：\n" + "\n".join(paragraphs))
    if tables:
        sections.append("表格：\n" + "\n".join(tables))
    text = "\n\n".join(sections).strip()
    return source_title, text


def split_text(text: str, chunk_size: int = 800, overlap: int = 120) -> Iterator[str]:
    """Yield deterministic, character-based overlapping chunks.

    Fixed-width windows are intentionally used here: Chinese text has no
    whitespace token boundary, and a deterministic character budget keeps
    downstream embedding batches predictable.  Newline-aware splitting can be
    layered on later without changing the JSONL contract.
    """

    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must satisfy 0 <= overlap < chunk_size")
    normalized = text.strip()
    if not normalized:
        return
    if len(normalized) <= chunk_size:
        yield normalized
        return

    step = chunk_size - overlap
    start = 0
    length = len(normalized)
    while start < length:
        end = min(start + chunk_size, length)
        chunk = normalized[start:end].strip()
        if chunk:
            yield chunk
        if end >= length:
            break
        start += step


def _iter_leaves(value: Any, path: tuple[str, ...] = ()) -> Iterator[tuple[tuple[str, ...], dict[str, Any]]]:
    """Walk nested catalogue objects and yield theory leaves."""

    if isinstance(value, dict):
        if any(key in value for key in SOURCE_KEYS):
            # The enriched catalogue uses a dict at every leaf.  Keep a
            # defensive copy/type guard so malformed branches are skipped
            # gracefully rather than mistaken for category nodes.
            yield path, value
            return
        for key, child in value.items():
            yield from _iter_leaves(child, path + (str(key),))
    elif isinstance(value, list):
        for child in value:
            yield from _iter_leaves(child, path)


def _iter_records(value: Any) -> Iterable[Any]:
    if value is None:
        return ()
    if isinstance(value, list):
        return value
    return (value,)


def _chunk_id(
    category_path: Sequence[str],
    theory_name: str,
    source_type: str,
    record_index: int,
    chunk_index: int,
) -> str:
    identity = "\x1f".join(
        [*category_path, theory_name, source_type, str(record_index), str(chunk_index)]
    )
    digest = hashlib.sha1(identity.encode("utf-8")).hexdigest()[:16]
    return f"chunk-{digest}"


def build_chunks(
    input_path: Path,
    output_path: Path,
    chunk_size: int = 800,
    overlap: int = 120,
) -> dict[str, int]:
    """Build JSONL chunks and return summary counts."""

    with input_path.open("r", encoding="utf-8-sig") as handle:
        catalogue = json.load(handle)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary = {
        "theory_leaves": 0,
        "source_records": 0,
        "nonempty_records": 0,
        "chunks": 0,
        "characters": 0,
    }

    # Write beside the destination and replace atomically.  A failed build
    # therefore cannot leave a seemingly valid but truncated index file.
    fd, temporary_name = tempfile.mkstemp(
        prefix=f".{output_path.stem}.", suffix=".tmp", dir=str(output_path.parent)
    )
    os.close(fd)
    temporary_path = Path(temporary_name)
    try:
        with temporary_path.open("w", encoding="utf-8", newline="\n") as output:
            for path, leaf in _iter_leaves(catalogue):
                if not path:
                    continue
                summary["theory_leaves"] += 1
                theory_name = path[-1]
                category_path = list(path[:-1])
                for source_type in SOURCE_KEYS:
                    records = list(_iter_records(leaf.get(source_type)))
                    summary["source_records"] += len(records)
                    for record_index, record in enumerate(records):
                        source_title, text = _record_text(
                            theory_name, category_path, source_type, record
                        )
                        # A missing source is represented by an empty list in
                        # the catalogue; do not index a metadata-only chunk.
                        if not text or text == f"理论名称：{theory_name}\n分类路径：{' / '.join(category_path)}\n来源类型：{source_type}\n原始标题：{source_title}":
                            continue
                        summary["nonempty_records"] += 1
                        for chunk_index, chunk in enumerate(
                            split_text(text, chunk_size=chunk_size, overlap=overlap)
                        ):
                            item = {
                                "chunk_id": _chunk_id(
                                    category_path,
                                    theory_name,
                                    source_type,
                                    record_index,
                                    chunk_index,
                                ),
                                "theory_name": theory_name,
                                "category_path": category_path,
                                "source_type": source_type,
                                "source_title": source_title,
                                "text": chunk,
                            }
                            output.write(json.dumps(item, ensure_ascii=False) + "\n")
                            summary["chunks"] += 1
                            summary["characters"] += len(chunk)
        os.replace(temporary_path, output_path)
    except Exception:
        try:
            temporary_path.unlink(missing_ok=True)
        except OSError:
            pass
        raise
    return summary


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=_default_input_path(), help="理论总表 JSON 路径")
    parser.add_argument("--output", type=Path, default=_default_output_path(), help="输出 JSONL 路径")
    parser.add_argument("--chunk-size", type=int, default=800, help="每个片段的字符数（默认 800）")
    parser.add_argument("--overlap", type=int, default=120, help="相邻片段重叠字符数（默认 120）")
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    if not args.input.is_file():
        raise SystemExit(f"找不到输入文件：{args.input}")
    try:
        summary = build_chunks(
            args.input,
            args.output,
            chunk_size=args.chunk_size,
            overlap=args.overlap,
        )
    except (json.JSONDecodeError, OSError, ValueError) as exc:
        raise SystemExit(f"构建知识切片失败：{exc}") from exc
    print(json.dumps({"input": str(args.input), "output": str(args.output), **summary}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
