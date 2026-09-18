"""Reference-backed six-arts lesson-plan generation.

The source documents stay on the backend.  The browser receives only the
structured plan and a small list of source names, so the large board-document
files and the model relay key never leave this machine.
"""

from __future__ import annotations

from dataclasses import dataclass
from copy import deepcopy
import json
import os
from pathlib import Path
import re
import time
import unicodedata
from typing import Any
from zipfile import BadZipFile, ZipFile
from xml.etree import ElementTree as ET

from openai import APIConnectionError, APIStatusError, AuthenticationError, OpenAI

from rag.bm25 import BM25Retriever, SearchHit
from rag.run_rag import MODEL, REASONING_EFFORT


ROOT = Path(__file__).resolve().parent
ARTS_ROOT = ROOT / "艺智备课"
BASIS_DIR = ARTS_ROOT / "教案生成的依据资料"
SAMPLE_DIR = ARTS_ROOT / "最后智能体生成的教案"
MATH_SAMPLE_DIR = ARTS_ROOT / "数学样例"
MATH_BOARD_DIR = ARTS_ROOT / "小学数学板书"
CHINESE_BOARD_DIR = ARTS_ROOT / "小学语文板书"
LATEST_CIRCLE_TEMPLATE = ARTS_ROOT / "圆的认识-六艺融合教学设计_new.docx"
LATEST_DETAILED_TEMPLATE = ARTS_ROOT / "圆的认识-六艺融合教学设计_详案_new.docx"
TEXTBOOK_ROOT = ROOT / "教材（小数+小语）"
DOCX_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

ART_INFO: dict[str, dict[str, str]] = {
    "说": {"ability": "语言表达与思想建构", "activity": "朗诵、说课、角色表达、观点演讲", "evidence": "完整表达、语气恰当、能够用证据说明观点"},
    "唱": {"ability": "审美情操与协作精神", "activity": "学科歌谣、节奏诵读、合唱与情感演唱", "evidence": "节奏准确、情感投入、能够与同伴协作"},
    "弹": {"ability": "精细操作与专注坚持", "activity": "器乐配乐、工具操作、节奏控制与材料实践", "evidence": "操作规范、专注投入、作品或过程记录完整"},
    "舞": {"ability": "具身认知与情境表现", "activity": "体态律动、角色表演、空间站位与动作建模", "evidence": "动作与概念或情境对应，能够解释动作意义"},
    "书": {"ability": "规范书写与教师基本功", "activity": "关键词书写、结构化板书、学习单与反思记录", "evidence": "书写规范、布局清晰、记录能够支持学习回顾"},
    "画": {"ability": "视觉表达与创造思维", "activity": "概念图、简笔画、图示建模与创意作品", "evidence": "图示准确、结构清楚、能够用视觉作品表达理解"},
}

TEACHER_INDICATORS = [
    {"key": "4.1", "dimension": "教学理念", "observable": "教学目标、任务和评价保持一致，六艺活动服务学科理解。"},
    {"key": "4.2", "dimension": "教学实践", "observable": "能依据课堂证据追问、反馈并调整支架。"},
    {"key": "5.1", "dimension": "科内整合", "observable": "能整合教材内容、艺术表达与学习任务，形成清晰学习链。"},
    {"key": "5.2", "dimension": "跨科整合", "observable": "跨学科资源的使用有明确目标且不过度占用学科教学时间。"},
    {"key": "6.1", "dimension": "发展指导", "observable": "为不同基础学生提供可进入、可展示、可改进的参与路径。"},
    {"key": "8.1", "dimension": "反思知能", "observable": "能够依据学生作品、表达和过程记录反思教学效果。"},
]


def _allocate_minutes(total: int, weights: list[float]) -> list[int]:
    """Allocate integer minutes while preserving the requested total."""

    if not weights:
        return []
    normalized = [max(0.0, float(weight)) for weight in weights]
    if not any(normalized):
        normalized = [1.0] * len(weights)
    weight_sum = sum(normalized)
    raw = [total * weight / weight_sum for weight in normalized]
    minutes = [max(1, int(value)) for value in raw]
    remainder = total - sum(minutes)
    order = sorted(
        range(len(raw)),
        key=lambda index: raw[index] - int(raw[index]),
        reverse=remainder > 0,
    )
    cursor = 0
    while remainder and order:
        index = order[cursor % len(order)]
        if remainder > 0:
            minutes[index] += 1
            remainder -= 1
        elif minutes[index] > 1:
            minutes[index] -= 1
            remainder += 1
        cursor += 1
    return minutes


def _reference_metadata(references: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    # A textbook source can contribute several pages from the same PDF.  Keep
    # page-level provenance while still collapsing duplicate windows from one
    # page.  Legacy DOCX references continue to be de-duplicated by title.
    seen: set[tuple[str, str]] = set()
    for item in references:
        title = str(item.get("source_title") or item.get("title") or "未命名资料").strip()
        page = str(item.get("pdf_page") or "").strip()
        key = (title, page)
        if not title or key in seen:
            continue
        seen.add(key)
        entry: dict[str, Any] = {
            "title": title,
            "type": str(item.get("source_type") or item.get("type") or "依据资料"),
        }
        # These fields are intentionally optional for backwards compatibility
        # with the existing DOCX/knowledge-catalogue references.
        for field in (
            "source_file",
            "source_path",
            "markdown_path",
            "pdf_page",
            "grade",
            "term",
            "edition",
            "match_type",
        ):
            if item.get(field) not in (None, ""):
                entry[field] = item[field]
        result.append(entry)
    return result


@dataclass(frozen=True)
class LessonReference:
    source_title: str
    source_type: str
    subject: str
    text: str


def _extract_docx_text(path: Path) -> str:
    """Extract paragraph text without requiring python-docx."""

    try:
        with ZipFile(path) as archive:
            root = ET.fromstring(archive.read("word/document.xml"))
    except (BadZipFile, OSError, KeyError, ET.ParseError):
        return ""
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:p", DOCX_NS):
        text = "".join((node.text or "") for node in paragraph.findall(".//w:t", DOCX_NS)).strip()
        if text:
            paragraphs.append(text)
    return "\n".join(paragraphs)


def _chunk_text(text: str, size: int = 4200) -> list[str]:
    paragraphs = [part.strip() for part in text.splitlines() if part.strip()]
    chunks: list[str] = []
    current: list[str] = []
    current_length = 0
    for paragraph in paragraphs:
        if current and current_length + len(paragraph) + 1 > size:
            chunks.append("\n".join(current))
            # Keep a short heading/transition for the next retrieval window.
            current = current[-1:]
            current_length = len(current[0]) if current else 0
        current.append(paragraph)
        current_length += len(paragraph) + 1
    if current:
        chunks.append("\n".join(current))
    return chunks


def _subject_for(path: Path, source_type: str) -> str:
    name = path.name
    if "数学" in str(path) or "数学" in name:
        return "小学数学"
    if "语文" in str(path) or "语文" in name:
        return "小学语文"
    return "通用"


def _compact_match_text(value: Any) -> str:
    """Normalize textbook text for exact-title matching.

    Scanned/text-layer PDFs frequently interleave pinyin or Latin font runs
    between Chinese characters (for example ``乌 wO 鸦 yQ``).  The display
    text is kept unchanged, but the matching representation drops those runs
    whenever Chinese text is present.
    """

    text = unicodedata.normalize("NFKC", str(value or ""))
    if re.search(r"[\u3400-\u4dbf\u4e00-\u9fff]", text):
        text = re.sub(r"[A-Za-z][A-Za-z0-9_+./-]*", "", text)
    return re.sub(r"[\s《》〈〉\"“”‘’、，,。．.!！?？:：;；()（）\[\]【】{}<>]", "", text)


def _math_sample_match_key(value: Any) -> str:
    """Normalize a math sample filename/title without weakening PDF matching."""

    text = _compact_match_text(value)
    text = re.sub(r"^\d+", "", text)
    for suffix in ("教学设计", "教案", "详案", "简案", "docx"):
        text = text.replace(suffix, "")
    return text.replace("的", "")


def _topic_match_in_chunk(chunk: dict[str, Any], topic: str) -> bool:
    """Return whether a textbook/lesson chunk contains the requested title."""

    if chunk.get("_topic_window_match"):
        return True
    target = _compact_match_text(topic)
    if not target:
        return False
    if str(chunk.get("source_type", "")) == "数学样例":
        sample_target = _math_sample_match_key(target)
        sample_title = _math_sample_match_key(chunk.get("source_title", ""))
        return bool(sample_target and sample_title and (
            sample_target in sample_title or sample_title in sample_target
        ))
    for candidate in chunk.get("topic_titles", []) or []:
        candidate_key = _compact_match_text(candidate)
        if candidate_key and (target == candidate_key or target in candidate_key or candidate_key in target):
            return True
    for field in ("text", "index_text", "source_title"):
        candidate_key = _compact_match_text(chunk.get(field, ""))
        if target in candidate_key:
            return True
    return False


def _textbook_metadata_matches(
    chunk: dict[str, Any],
    subject: str,
    grade: str | None = None,
    edition: str | None = None,
    term: str | None = None,
) -> bool:
    """Apply the form's textbook metadata filters when the index has them."""

    def grade_key(value: Any) -> str:
        text = _compact_match_text(value)
        numerals = {
            "一": "1", "二": "2", "三": "3", "四": "4", "五": "5", "六": "6",
        }
        for chinese, digit in numerals.items():
            text = text.replace(chinese, digit)
        text = text.replace("上册", "").replace("下册", "")
        return text

    chunk_subject = str(chunk.get("subject", "通用")).strip()
    normalized_subject = str(subject or "通用").strip()
    if (
        chunk_subject
        and chunk_subject != "通用"
        and normalized_subject != "通用"
        and chunk_subject != normalized_subject
        and chunk_subject not in normalized_subject
        and normalized_subject not in chunk_subject
    ):
        return False
    for requested, field in ((grade, "grade"), (edition, "edition"), (term, "term")):
        wanted = grade_key(requested) if field == "grade" else _compact_match_text(requested or "")
        actual = grade_key(chunk.get(field, "")) if field == "grade" else _compact_match_text(chunk.get(field, ""))
        # Older indexes did not carry these fields.  Do not reject them when
        # the metadata is absent; subject/title matching remains authoritative.
        if wanted and actual and wanted not in actual and actual not in wanted:
            return False
    return True


def _is_textbook_navigation_chunk(chunk: dict[str, Any]) -> bool:
    """Identify contents/front-matter mentions that are not lesson facts."""

    text = str(chunk.get("index_text") or chunk.get("text") or "").strip()
    titles = list(chunk.get("topic_titles", []) or [])
    if any(marker in text for marker in ("编者的话", "亲爱的同学", "目录")):
        return True
    if len(titles) > 6:
        return True
    # Math contents pages can be only three short unit-title lines and may not
    # contain an explicit ``目录`` marker after PDF/OCR extraction.
    if len(titles) >= 2 and len(re.sub(r"\s+", "", text)) < 100:
        return True
    return False


def _math_topic_position(chunk: dict[str, Any], topic: str) -> int | None:
    """Locate a math lesson title in the clean page text.

    A title near the beginning of a page is normally the actual lesson
    heading.  A late occurrence is often only an exercise mentioning the next
    concept, as happens one page before ``三角形的面积``.
    """

    target = _compact_match_text(topic)
    text = _compact_match_text(chunk.get("index_text") or chunk.get("text") or "")
    position = text.find(target)
    return position if position >= 0 else None


_MATH_HEADING_SUFFIXES = (
    "的认识", "的意义", "的性质", "的面积", "的周长", "的体积",
    "加法", "减法", "乘法", "除法", "统计", "可能性",
    "位置与方向", "解决问题", "整理和复习",
)


def _math_page_starts_new_lesson(chunk: dict[str, Any], topic: str) -> bool:
    """Return whether a continuation page clearly opens another math lesson."""

    raw = str(chunk.get("index_text") or chunk.get("text") or "")
    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in raw.splitlines()
        if line.strip() and "公众号" not in line and "PDF课本" not in line
    ]
    if not lines:
        return False
    first = lines[0]
    first_key = _compact_match_text(first)
    target = _compact_match_text(topic)
    if target and target in first_key:
        return False
    if re.match(r"^\s*\d{1,2}\s*[.。．、]\s*[\u3400-\u4dbf\u4e00-\u9fff]", first):
        return True
    if first.startswith(("练习", "做一做", "你知道吗", "整理和复习")):
        return False
    if (
        2 <= len(first_key) <= 18
        and re.fullmatch(r"[\u3400-\u4dbf\u4e00-\u9fff0-9]+", first_key)
        and first_key.endswith(_MATH_HEADING_SUFFIXES)
    ):
        return True
    return False


def _textbook_index_candidates() -> list[Path]:
    """Find generated textbook indexes without making conversion mandatory.

    ``TEXTBOOK_INDEX_PATH`` is the deployment override.  Otherwise the new
    ``textbook_markdown`` directory is preferred, followed by older output
    directories kept for compatibility with prior local conversions.
    """

    configured = os.getenv("TEXTBOOK_INDEX_PATH", "").strip()
    candidates: list[Path] = []
    if configured:
        path = Path(configured).expanduser()
        if not path.is_absolute():
            path = ROOT / path
        if path.is_dir():
            path = path / "textbook_index.jsonl"
        candidates.append(path)
    configured_dir = os.getenv("TEXTBOOK_MARKDOWN_DIR", "").strip()
    if configured_dir:
        path = Path(configured_dir).expanduser()
        if not path.is_absolute():
            path = ROOT / path
        candidates.append(path / "textbook_index.jsonl")
    for name in ("textbook_markdown", "markdown", "markdown_test", "markdown_math_test", "markdown_one", "markdown_6math"):
        candidates.append(TEXTBOOK_ROOT / name / "textbook_index.jsonl")
    if TEXTBOOK_ROOT.is_dir():
        candidates.extend(sorted(TEXTBOOK_ROOT.rglob("textbook_index.jsonl")))
    unique: list[Path] = []
    seen: set[str] = set()
    for path in candidates:
        key = str(path.resolve())
        if key in seen or not path.is_file():
            continue
        seen.add(key)
        unique.append(path)
    return unique


def _textbook_index_quality(path: Path) -> tuple[int, int, int, float]:
    """Rank candidate indexes by document/chunk coverage, then freshness."""

    document_count = 0
    chunk_count = 0
    manifest = path.with_name("textbook_manifest.json")
    try:
        if manifest.is_file():
            data = json.loads(manifest.read_text(encoding="utf-8"))
            document_count = len(data.get("documents", [])) if isinstance(data, dict) else 0
            chunk_count = int(data.get("chunk_count", 0) or 0) if isinstance(data, dict) else 0
    except (OSError, ValueError, TypeError):
        pass
    if not chunk_count:
        try:
            chunk_count = sum(1 for line in path.open("r", encoding="utf-8") if line.strip())
        except OSError:
            chunk_count = 0
    # A complete 24-book catalogue should win over an older partial output.
    complete = 1 if document_count >= 24 else 0
    try:
        modified = path.stat().st_mtime
    except OSError:
        modified = 0.0
    return complete, document_count, chunk_count, modified


def _load_textbook_chunks() -> tuple[list[dict[str, Any]], Path | None]:
    """Load page/chunk records produced by :mod:`rag.textbook_pdf`.

    Malformed or absent indexes are treated as optional data: the lesson
    assistant remains usable with its existing DOCX and theory references.
    """

    paths = _textbook_index_candidates()
    if not paths:
        return [], None
    path = max(paths, key=_textbook_index_quality)
    manifest_map: dict[str, dict[str, Any]] = {}
    manifest_path = path.with_name("textbook_manifest.json")
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.is_file() else {}
        for document in data.get("documents", []) if isinstance(data, dict) else []:
            if isinstance(document, dict):
                for key in (str(document.get("source_file", "")), str(document.get("source_path", ""))):
                    if key:
                        manifest_map[key] = document
    except (OSError, ValueError, TypeError):
        manifest_map = {}
    chunks: list[dict[str, Any]] = []
    try:
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(row, dict) or not str(row.get("text", "")).strip():
                    continue
                source_file = str(row.get("source_file", "")).strip()
                source_path = str(row.get("source_path", "")).strip()
                document = manifest_map.get(source_file) or manifest_map.get(source_path) or {}
                row["source_type"] = str(row.get("source_type") or "教材PDF")
                row["source_title"] = source_file or str(row.get("source_title") or path.name)
                row["subject"] = str(row.get("subject") or "小学教材")
                if document:
                    row.setdefault("markdown_path", document.get("markdown_path", ""))
                    row.setdefault("edition", document.get("edition", ""))
                    row.setdefault("grade", document.get("grade", ""))
                    row.setdefault("term", document.get("term", ""))
                row["_textbook_index_path"] = str(path.relative_to(ROOT)).replace("\\", "/") if path.is_relative_to(ROOT) else str(path)
                # BM25 sees the cleaner index_text and the original text.  The
                # latter is retained for model grounding and page citations.
                index_text = str(row.get("index_text") or "").strip()
                if index_text and index_text not in str(row.get("text", "")):
                    row["_retrieval_text"] = f"{index_text}\n{row['text']}"
                else:
                    row["_retrieval_text"] = str(row.get("text", ""))
                chunks.append(row)
    except OSError:
        return [], None
    return chunks, path


class LessonReferenceStore:
    """Small in-memory BM25 index over the supplied lesson documents."""

    def __init__(
        self,
        references: list[LessonReference],
        knowledge_retriever: BM25Retriever | None = None,
        textbook_chunks: list[dict[str, Any]] | None = None,
        textbook_index_path: Path | None = None,
    ):
        if not references:
            references = [LessonReference("内置六艺模板", "内置模板", "通用", "新六艺包括说、唱、弹、舞、书、画，强调以艺育德、以美润教。")]
        self.references = references
        # The main API already builds this index for theory conversations.
        # Reuse it here so lesson-plan retrieval can see classroom exemplars
        # stored in 知识库/理论总表.json without building a second 13k-chunk
        # BM25 index during startup.
        self.knowledge_retriever = knowledge_retriever
        self.textbook_chunks = list(textbook_chunks or [])
        self.textbook_index_path = textbook_index_path
        chunks: list[dict[str, Any]] = []
        for index, reference in enumerate(references):
            for window, text in enumerate(_chunk_text(reference.text)):
                chunks.append(
                    {
                        "chunk_id": f"lesson-{index}-{window}",
                        "text": f"来源：{reference.source_title}\n{text}",
                        "source_title": reference.source_title,
                        "source_type": reference.source_type,
                        "subject": reference.subject,
                    }
                )
        self._chunks = chunks
        self.retriever = BM25Retriever(chunks)
        # Keep textbook pages in a separate index so broad theory retrieval
        # cannot distort their scores.  The two indexes are merged only after
        # subject/title/grade filtering in ``search``.
        self.textbook_retriever = (
            BM25Retriever(
                [
                    {
                        **row,
                        "text": str(row.get("_retrieval_text") or row.get("text") or ""),
                    }
                    for row in self.textbook_chunks
                    if str(row.get("_retrieval_text") or row.get("text") or "").strip()
                ]
            )
            if self.textbook_chunks
            else None
        )

    @classmethod
    def load(cls, knowledge_retriever: BM25Retriever | None = None) -> "LessonReferenceStore":
        references: list[LessonReference] = []
        paths: list[tuple[Path, str]] = []
        paths.extend((path, "依据资料") for path in BASIS_DIR.glob("*.docx"))
        paths.extend((path, "样例教案") for path in SAMPLE_DIR.glob("*.docx"))
        paths.extend((path, "数学样例") for path in MATH_SAMPLE_DIR.glob("*.docx"))
        paths.extend((path, "小学数学板书") for path in MATH_BOARD_DIR.glob("*.docx"))
        paths.extend((path, "小学语文板书") for path in CHINESE_BOARD_DIR.glob("*.docx"))
        if LATEST_CIRCLE_TEMPLATE.is_file():
            paths.append((LATEST_CIRCLE_TEMPLATE, "简案最新模板"))
        if LATEST_DETAILED_TEMPLATE.is_file():
            paths.append((LATEST_DETAILED_TEMPLATE, "详案最新模板"))
        for path, source_type in paths:
            text = _extract_docx_text(path)
            if not text:
                continue
            references.append(
                LessonReference(
                    source_title=path.name,
                    source_type=source_type,
                    subject=_subject_for(path, source_type),
                    text=text,
                )
            )
        # The PDF is retained as a traceable source even when optional PDF
        # parsing libraries are not installed in the deployment environment.
        for path in BASIS_DIR.glob("*.pdf"):
            references.append(
                LessonReference(path.name, "依据资料", "通用", f"参考文件：{path.name}。")
            )
        textbook_chunks, textbook_index_path = _load_textbook_chunks()
        return cls(
            references,
            knowledge_retriever=knowledge_retriever,
            textbook_chunks=textbook_chunks,
            textbook_index_path=textbook_index_path,
        )

    def search(
        self,
        query: str,
        subject: str,
        top_k: int = 8,
        topic: str | None = None,
        grade: str | None = None,
        edition: str | None = None,
        term: str | None = None,
    ) -> list[dict[str, Any]]:
        candidates: list[tuple[Any, str]] = [
            (hit, "lesson")
            for hit in self.retriever.search(query, top_k=min(60, max(top_k * 8, top_k)))
        ]
        if self.knowledge_retriever is not None:
            candidates.extend(
                (hit, "knowledge")
                for hit in self.knowledge_retriever.search(
                    query,
                    top_k=min(80, max(top_k * 12, top_k)),
                )
            )
        if self.textbook_retriever is not None:
            candidates.extend(
                (hit, "textbook")
                for hit in self.textbook_retriever.search(
                    query,
                    top_k=min(120, max(top_k * 16, top_k)),
                )
            )
        normalized_topic = _compact_match_text(topic or "")
        if normalized_topic:
            # A long default summary can bury an exact lesson title in BM25.
            # Promote title-bearing windows from all corpora before lexical
            # re-ranking.  OCR pages may carry the title only in metadata.
            direct_hits: list[tuple[Any, str]] = []
            for chunk in self._chunks:
                if _topic_match_in_chunk(chunk, normalized_topic):
                    direct_hits.append((SearchHit(100.0, chunk), "lesson"))
            if self.knowledge_retriever is not None:
                for chunk in self.knowledge_retriever.chunks:
                    if _topic_match_in_chunk(chunk, normalized_topic):
                        direct_hits.append((SearchHit(100.0, chunk), "knowledge"))
            if self.textbook_chunks:
                for chunk in self.textbook_chunks:
                    if _textbook_metadata_matches(chunk, subject, grade, edition, term) and _topic_match_in_chunk(chunk, normalized_topic):
                        direct_hits.append((SearchHit(140.0, chunk), "textbook"))
            direct_ids = {str(hit.chunk.get("chunk_id", "")) for hit, _ in direct_hits}
            candidates = direct_hits + [
                item for item in candidates if str(item[0].chunk.get("chunk_id", "")) not in direct_ids
            ]
            topic_terms = [term for term in re.findall(r"[\u4e00-\u9fff]{2,}", normalized_topic) if len(term) >= 2]

            def topic_score(item: tuple[Any, str]) -> float:
                hit, origin = item
                chunk = hit.chunk
                text = str(chunk.get("text", "")).replace(" ", "")
                source_type = str(chunk.get("source_type", ""))
                boost = 0.0
                exact = _topic_match_in_chunk(chunk, normalized_topic)
                if exact:
                    boost += {"textbook": 60.0, "knowledge": 42.0}.get(origin, 28.0)
                boost += sum(3.0 for term in topic_terms if term in text)
                if source_type == "样例教案" and exact:
                    boost += 8.0
                if source_type == "数学样例" and exact:
                    boost += 14.0
                if origin == "textbook":
                    title_keys = {_compact_match_text(value) for value in chunk.get("topic_titles", []) or []}
                    if normalized_topic in title_keys:
                        boost += 18.0
                    if grade and _textbook_metadata_matches(chunk, subject, grade, edition, term):
                        boost += 6.0
                    if edition and _compact_match_text(edition) == _compact_match_text(chunk.get("edition", "")):
                        boost += 4.0
                if origin == "knowledge":
                    # Classroom exemplars contain executable textbook steps;
                    # paradigm entries are useful supporting rationale but
                    # should rank behind a matching classroom example.
                    boost += {"课堂范本": 16.0, "教理范式汇典": 7.0}.get(source_type, 0.0)
                    if exact and any(mark in text for mark in ("教学流程", "优质落地课堂", "具体课例")):
                        boost += 12.0
                return float(hit.score) + boost

            candidates.sort(key=topic_score, reverse=True)
        else:
            candidates.sort(key=lambda item: float(item[0].score), reverse=True)
        # A short title can occur in a table of contents, an index, and the
        # actual lesson body.  Keep the densest nearby page cluster for each
        # textbook file; lesson pages are normally consecutive while TOC/index
        # mentions are isolated.  This also handles books whose body heading
        # was not recognized as a ``topic_title`` during OCR.
        textbook_topic_clusters: dict[str, set[int]] = {}
        if normalized_topic and self.textbook_chunks:
            pages_by_source: dict[str, set[int]] = {}
            for chunk in self.textbook_chunks:
                if not _textbook_metadata_matches(chunk, subject, grade, edition, term):
                    continue
                if not _topic_match_in_chunk(chunk, normalized_topic):
                    continue
                if _is_textbook_navigation_chunk(chunk):
                    continue
                source = str(chunk.get("source_file") or chunk.get("source_title") or "")
                page = int(chunk.get("pdf_page", 0) or 0)
                if source and page > 0:
                    pages_by_source.setdefault(source, set()).add(page)
            for source, page_set in pages_by_source.items():
                ordered = sorted(page_set)
                source_chunks = [
                    chunk
                    for chunk in self.textbook_chunks
                    if str(chunk.get("source_file") or chunk.get("source_title") or "") == source
                    and _textbook_metadata_matches(chunk, subject, grade, edition, term)
                    and not _is_textbook_navigation_chunk(chunk)
                ]
                chunks_by_page = {
                    int(chunk.get("pdf_page", 0) or 0): chunk
                    for chunk in source_chunks
                    if int(chunk.get("pdf_page", 0) or 0) > 0
                }
                if "数学" in str(subject):
                    heading_candidates: list[tuple[int, int, int, int]] = []
                    for page in ordered:
                        chunk = chunks_by_page.get(page)
                        if not chunk:
                            continue
                        position = _math_topic_position(chunk, normalized_topic)
                        if position is None:
                            continue
                        title_keys = {
                            _compact_match_text(value)
                            for value in chunk.get("topic_titles", []) or []
                        }
                        metadata_match = 1 if normalized_topic in title_keys else 0
                        near_heading = 1 if position <= 36 else 0
                        heading_candidates.append((near_heading, metadata_match, -position, -page))
                    if heading_candidates:
                        # Prefer a title at the start of a page, then explicit
                        # title metadata, then the earliest occurrence/page.
                        anchor_page = -max(heading_candidates)[3]
                    else:
                        anchor_page = ordered[0]
                    chosen = []
                    for page in range(anchor_page, anchor_page + 4):
                        chunk = chunks_by_page.get(page)
                        if not chunk:
                            break
                        if page > anchor_page and _math_page_starts_new_lesson(chunk, normalized_topic):
                            break
                        chosen.append(page)
                    textbook_topic_clusters[source] = set(chosen)
                    continue
                clusters: list[list[int]] = []
                for page in ordered:
                    if not clusters or page - clusters[-1][-1] > 3:
                        clusters.append([page])
                    else:
                        clusters[-1].append(page)
                if clusters:
                    # Prefer the largest cluster, then the one with the
                    # strongest page density (more pages per span).
                    chosen = max(
                        clusters,
                        key=lambda group: (len(group), len(group) / max(1, group[-1] - group[0] + 1)),
                    )
                    textbook_topic_clusters[source] = set(chosen)
            # Inject continuation pages even when their body does not repeat
            # the unit title and therefore receives no lexical BM25 score.
            existing_ids = {
                str(hit.chunk.get("chunk_id", "")) for hit, _ in candidates
            }
            for chunk in self.textbook_chunks:
                source = str(chunk.get("source_file") or chunk.get("source_title") or "")
                page = int(chunk.get("pdf_page", 0) or 0)
                if page not in textbook_topic_clusters.get(source, set()):
                    continue
                if not _textbook_metadata_matches(chunk, subject, grade, edition, term):
                    continue
                if _is_textbook_navigation_chunk(chunk):
                    continue
                chunk_id = str(chunk.get("chunk_id", ""))
                if chunk_id in existing_ids:
                    for index, (existing_hit, existing_origin) in enumerate(candidates):
                        if (
                            existing_origin == "textbook"
                            and str(existing_hit.chunk.get("chunk_id", "")) == chunk_id
                        ):
                            window_chunk = dict(existing_hit.chunk)
                            window_chunk["_topic_window_match"] = True
                            window_chunk["match_type"] = "topic_page_window"
                            candidates[index] = (
                                SearchHit(max(125.0, float(existing_hit.score)), window_chunk),
                                "textbook",
                            )
                            break
                    continue
                window_chunk = dict(chunk)
                window_chunk["_topic_window_match"] = True
                window_chunk["match_type"] = "topic_page_window"
                candidates.append((SearchHit(125.0, window_chunk), "textbook"))
                existing_ids.add(chunk_id)
            candidates.sort(key=topic_score, reverse=True)
        normalized_subject = subject.strip()
        # Exact title evidence is valuable for a lesson plan, while a BM25
        # fallback hit can merely share broad words such as “课堂” or “学生”.
        # Remember whether this query produced any exact title-bearing chunks;
        # downstream profile extraction uses only those chunks for textbook
        # facts and never mistakes generic theory prose for lesson content.
        has_exact_topic = bool(normalized_topic and any(
            _topic_match_in_chunk(hit.chunk, normalized_topic)
            for hit, _ in candidates
        ))
        has_textbook_exact = bool(normalized_topic and any(
            origin == "textbook" and _topic_match_in_chunk(hit.chunk, normalized_topic)
            for hit, origin in candidates
        ))
        selected: list[dict[str, Any]] = []
        per_source: dict[str, int] = {}
        exact_procedure_available = any(
            bool(normalized_topic)
            and _topic_match_in_chunk(hit.chunk, normalized_topic)
            and any(
                marker in str(hit.chunk.get("text", ""))
                for marker in ("教学流程", "操作与朗读", "操作验证", "情境演绎", "教学步骤")
            )
            for hit, _ in candidates
        )
        for hit, origin in candidates:
            chunk = hit.chunk
            chunk_subject = str(chunk.get("subject", "通用"))
            # The form normally sends "小学数学"/"小学语文", but callers
            # may use the shorter "数学"/"语文" labels.  Keep generic
            # material available while treating these labels as equivalent.
            if not _textbook_metadata_matches(chunk, normalized_subject, grade, edition, term):
                continue
            title = str(chunk.get("source_title", ""))
            # Two windows from a matching sample are useful: the first usually
            # contains教材分析/目标 and the next one contains concrete课堂步骤.
            # The compact references panel deduplicates these titles later.
            max_windows = 4 if origin == "textbook" else 2
            if per_source.get(f"{origin}:{title}", 0) >= max_windows:
                continue
            raw_text = str(chunk.get("text", ""))
            exact_topic = bool(normalized_topic and _topic_match_in_chunk(chunk, normalized_topic))
            # Once the supplied PDF contains the requested lesson, theory
            # catalogue records are not allowed to become competing textbook
            # facts.  Keep local lesson exemplars for pedagogy, but ground the
            # actual content in the page-level PDF evidence.
            if has_textbook_exact and origin == "knowledge":
                continue
            if origin == "textbook" and exact_topic:
                source = str(chunk.get("source_file") or chunk.get("source_title") or "")
                page = int(chunk.get("pdf_page", 0) or 0)
                allowed_pages = textbook_topic_clusters.get(source)
                if allowed_pages and page not in allowed_pages:
                    continue
            # Once the shared knowledge index has an exact lesson hit, a
            # non-matching knowledge block is usually a neighbouring example
            # from the same theory record.  Exclude it from the lesson prompt;
            # local "艺智备课" basis documents remain eligible as reusable
            # structure/pedagogy references.
            if has_exact_topic and not exact_topic:
                continue
            if (
                exact_procedure_available
                and exact_topic
                and origin == "knowledge"
                and any(
                    marker in raw_text
                    for marker in ("情境判断训练", "核心知识点", "备考易错提醒", "相似模式对比", "错项精细排除")
                )
                and not any(
                    marker in raw_text
                    for marker in ("教学流程", "操作与朗读", "操作验证", "情境演绎", "教学步骤")
                )
            ):
                continue
            # A table-of-contents page can contain the requested title and is
            # useful for locating a lesson, but it is not lesson evidence.
            # Topic extraction records many headings on such a page, whereas
            # a body page normally carries only the current lesson title.
            if (
                origin == "textbook"
                and exact_topic
                and _is_textbook_navigation_chunk(chunk)
            ):
                continue
            # Make the requested title visible to downstream sentence/case
            # extraction when a PDF row matched through ``topic_titles`` but
            # its OCR body omitted the printed heading.
            if origin == "textbook" and exact_topic and normalized_topic not in _compact_match_text(raw_text):
                display_topic = str(topic or "").strip().strip("《》〈〉")
                raw_text = f"教材课题《{display_topic}》\n{raw_text}"
            per_source_key = f"{origin}:{title}"
            per_source[per_source_key] = per_source.get(per_source_key, 0) + 1
            focused_text = _focus_topic_text(raw_text, topic) if exact_topic and topic else ""
            # If a chunk contains the exact title but the case extractor cannot
            # find a clean section, retain the raw text for traceability; the
            # profile builder still requires the title in each fact sentence.
            lesson_text = focused_text or raw_text
            selected.append(
                {
                    "chunk_id": chunk.get("chunk_id", ""),
                    "source_title": title,
                    "source_type": chunk.get("source_type", "依据资料"),
                    "subject": chunk_subject,
                    "score": round(hit.score, 4),
                    "text": lesson_text,
                    "retrieval_origin": origin,
                    "topic_match": exact_topic,
                    "topic_exact_only": has_exact_topic,
                    # Preserve textbook provenance for the API and prompt
                    # while leaving legacy references unchanged.
                    **{
                        field: chunk[field]
                        for field in (
                            "source_file",
                            "source_path",
                            "markdown_path",
                            "pdf_page",
                            "index_text",
                            "grade",
                            "term",
                            "edition",
                            "match_type",
                        )
                        if chunk.get(field) not in (None, "")
                    },
                }
            )
            if len(selected) >= top_k:
                break
        return selected


def _clean_arts(values: list[str] | None) -> list[str]:
    result = []
    for value in values or []:
        key = str(value).strip()
        if key in ART_INFO and key not in result:
            result.append(key)
    return result or ["说", "书", "画"]


def _context(payload: dict[str, Any]) -> dict[str, Any]:
    context = dict(payload)
    context["arts"] = _clean_arts(context.get("arts"))
    context["title"] = str(context.get("title") or "未命名课题").strip()
    context["stage"] = str(context.get("stage") or "小学").strip()
    context["grade"] = str(context.get("grade") or "四年级").strip()
    context["subject"] = str(context.get("subject") or "小学语文").strip()
    context["edition"] = str(context.get("edition") or "统编版").strip()
    # The supplied catalogue uses 人教版 for mathematics and 统编版 for
    # Chinese.  API callers that omit the edition (or inherit the historical
    # Chinese default while selecting mathematics) should still hit the
    # correct textbook rather than silently returning no pages.
    if "数学" in context["subject"] and context["edition"] in {"", "统编版"}:
        context["edition"] = "人教版"
    context["term"] = str(context.get("term") or "").strip()
    context["lessons"] = max(1, int(context.get("lessons") or 1))
    context["duration"] = max(20, int(context.get("duration") or 40))
    raw_summary = str(context.get("summary") or "").strip()
    # Keep the request payload itself clean as well as the derived profile.
    # This prevents a stale browser default (for example, the old
    # "圆明园的毁灭" summary) from reaching the model after only the title
    # was changed.  An empty summary is intentional: the profile/fallback
    # will supply topic anchors or ask the teacher to verify the textbook.
    context["summary"] = _topic_description(raw_summary, context["title"]) if raw_summary else ""
    raw_requirement = str(context.get("requirement") or "").strip()
    context["requirement"] = (
        _topic_description(raw_requirement, context["title"])
        if raw_requirement
        else ""
    ) or "六艺活动必须服务学科目标，并留下可观察的学习证据。"
    context["student_analysis"] = str(context.get("student_analysis") or "").strip()
    context["detail_level"] = "detailed" if context.get("detail_level") == "detailed" else "concise"
    return context


def _topic_name(title: str) -> str:
    """Normalize a form title for matching against sample-lesson text."""

    value = re.sub(r"[《》〈〉\"“”‘’]", "", str(title or "")).strip()
    # A teacher may enter a lesson title with a redundant lesson/period suffix.
    value = re.sub(r"(?:第?[一二三四五六七八九十0-9]+课时|教学设计|教案)$", "", value).strip()
    return value or "未命名课题"


def _sentences(text: str) -> list[str]:
    """Split extracted DOCX text while retaining useful Chinese sentence units."""

    pieces = re.split(r"[。！？!?；;\n]+", text or "")
    result: list[str] = []
    for piece in pieces:
        value = re.sub(r"\s+", " ", piece).strip(" \t\r\n，,：:")
        if len(value) >= 8:
            result.append(value)
    return result


# The theory catalogue stores several classroom cases in one fixed-width
# chunk.  A hit for one lesson can therefore contain the next lesson's
# procedure (for example, the ``《乌鸦喝水》`` block is followed by a
# ``《日月明》`` block).  Lesson-plan retrieval needs a narrower view than
# theory-chat retrieval, so keep a small amount of local case text and drop
# neighbouring lesson titles before extracting facts or numbered steps.
_CASE_BOUNDARY_RE = re.compile(
    r"(?m)^\s*(?:"
    r"案例\s*\d*\s*[：:]|具体课例\s*[：:]|教学流程(?:如下)?\s*[：:]?|"
    r"理论解读\s*[：:]?|\d+\s*[.．、)]\s*(?:小学|初中|高中|幼儿|职业|特殊)"
    r")"
)
# Only these markers start a neighbouring case.  ``教学流程如下`` and
# ``理论解读`` are internal sections and must not terminate the selected case.
_CASE_START_RE = re.compile(
    r"(?m)^\s*(?:"
    r"案例\s*\d*\s*[：:]|具体课例\s*[：:]|"
    r"\d+\s*[.．、)]\s*(?:小学|初中|高中|幼儿|职业|特殊)"
    r")"
)
_CASE_END_RE = re.compile(
    r"(?m)^\s*(?:"
    r"理论解读|理论分析|理论辨析|局限性提示|理论局限|备考易错提醒|"
    r"核心知识点|相似模式对比|情境判断训练|错项精细排除|"
    r"[⑤⑥⑦⑧⑨]\s*(?:小学|初中|高中|幼儿|职业|特殊)"
    r")"
)
_LESSON_TITLE_RE = re.compile(r"《([^》\n]{2,40})》")


def _compact_topic(value: Any) -> str:
    """Normalize a topic/title for matching while retaining its characters."""

    return re.sub(r"[《》〈〉\"“”‘’\s]", "", str(value or "")).strip()


def _topic_spans(text: str, title: str) -> list[tuple[int, int]]:
    """Return offsets of a title in text even when brackets/spaces differ."""

    target = _compact_topic(title)
    if not target:
        return []
    compact_chars: list[str] = []
    positions: list[int] = []
    for index, char in enumerate(str(text or "")):
        if char.isspace() or char in "《》〈〉\"“”‘’":
            continue
        compact_chars.append(char)
        positions.append(index)
    compact = "".join(compact_chars)
    spans: list[tuple[int, int]] = []
    cursor = 0
    while True:
        found = compact.find(target, cursor)
        if found < 0:
            break
        start = positions[found]
        end_index = found + len(target) - 1
        end = positions[end_index] + 1
        spans.append((start, end))
        cursor = found + max(1, len(target))
    return spans


def _has_other_lesson_title(text: str, title: str) -> bool:
    """Whether a line mentions a bracketed lesson other than ``title``."""

    normalized = _compact_topic(title)
    for candidate in _LESSON_TITLE_RE.findall(str(text or "")):
        if _compact_topic(candidate) != normalized:
            return True
    return False


def _focus_topic_text(text: str, title: str, max_chars: int = 2400) -> str:
    """Extract the case section containing ``title`` from a catalogue chunk.

    Theory records often place multiple examples back-to-back.  This helper
    uses the nearest case boundary on either side of each exact title and then
    removes lines that explicitly name another lesson.  If no exact title is
    present, an empty string is returned so callers cannot accidentally treat a
    generic theory paragraph as textbook evidence.
    """

    raw = str(text or "")
    spans = _topic_spans(raw, title)
    if not spans:
        return ""
    segments: list[str] = []
    boundaries = list(_CASE_START_RE.finditer(raw))
    end_markers = list(_CASE_END_RE.finditer(raw))
    for start, end in spans:
        previous = 0
        following = len(raw)
        for boundary in boundaries:
            if boundary.start() <= start:
                previous = boundary.start()
            elif boundary.start() >= end:
                following = boundary.start()
                break
        # Overlapping chunks can begin in the middle of a theory section and
        # contain the lesson title only inside a later scenario.  In that case
        # a preceding end marker is the true left boundary; do not include the
        # unrelated theory prose before it.
        preceding_ends = [marker for marker in end_markers if marker.start() < start]
        if previous == 0 and preceding_ends:
            previous = preceding_ends[-1].end()
        # A boundary immediately before the title is the useful case heading;
        # otherwise retain a little preceding context for chunks cut mid-line.
        if previous == 0:
            previous = max(0, start - 260)
        else:
            previous = max(0, previous)
        # Keep enough room for a four-step classroom procedure but never pass
        # the next case/subject boundary.
        following = min(following, end + max_chars)
        for marker in end_markers:
            if marker.start() > end:
                following = min(following, marker.start())
                break
        segment = raw[previous:following].strip()
        if segment:
            segments.append(segment)
    if not segments:
        return ""
    # De-duplicate overlapping windows while preserving source order.
    merged: list[str] = []
    seen: set[str] = set()
    for segment in segments:
        lines: list[str] = []
        for line in segment.splitlines():
            cleaned = re.sub(r"\s+", " ", line).strip()
            if not cleaned or "HYPERLINK" in cleaned or "http://" in cleaned or "https://" in cleaned:
                continue
            # A sentence such as “寓言单元：《守株待兔》《陶罐和铁罐》…”
            # names several lessons; it is not safe as evidence for one title.
            if _has_other_lesson_title(cleaned, title):
                continue
            lines.append(cleaned)
        focused = "\n".join(lines).strip()
        key = re.sub(r"\s+", "", focused)
        if focused and key not in seen:
            seen.add(key)
            merged.append(focused)
    return "\n".join(merged)[: max_chars * 2]


def _topic_evidence_sentences(text: str, title: str) -> list[str]:
    """Return title-bearing sentences plus their immediate continuation.

    Chinese quotation marks and semicolons often split a single classroom
    example into several short pieces.  Keeping at most two pieces after an
    exact-title piece preserves a question/answer pair (for example, the
    ``狐狸和乌鸦`` two-versus-three compliments question) without importing the
    next theory section.
    """

    pieces = re.split(r"[。！？!?；;\n]+", str(text or ""))
    cleaned: list[str] = []
    for piece in pieces:
        value = re.sub(r"\s+", " ", piece).strip(" \t\r\n，,：:")
        if value:
            cleaned.append(value)
    target = _compact_topic(title)
    anchors = [
        index for index, piece in enumerate(cleaned)
        if target and target in _compact_topic(piece)
    ]
    if not anchors:
        return []
    selected: list[str] = []
    seen: set[str] = set()
    procedure_text = any(
        marker in str(text or "")
        for marker in ("教学流程", "操作与朗读", "操作验证", "情境演绎", "教学步骤")
    )
    generic_markers = (
        "核心知识点", "备考易错提醒", "情境判断训练", "相似模式对比",
        "错项精细排除", "理论解读", "理论分析", "局限性提示",
    )
    if procedure_text:
        # A procedure-bearing chunk is already a title-scoped case window;
        # retain all its concrete sentences so a four-step example is not
        # reduced to only the first question and answer.
        candidate_indexes = range(len(cleaned))
    else:
        # For a short “具体课例” mention, keep only the local context around
        # the title.  The surrounding theory section is not textbook evidence.
        candidate_indexes = (
            index
            for anchor in anchors
            for index in range(max(0, anchor - 1), min(len(cleaned), anchor + 3))
        )
    for index in candidate_indexes:
        value = cleaned[index]
        if len(value) < 8:
            continue
        if any(marker in value for marker in generic_markers):
            continue
        if _has_other_lesson_title(value, title):
            continue
        if re.match(r"^(?:[①②③④⑤⑥⑦⑧⑨]|\(?\d+\)?)[、.)：:]", value):
            # Numbered theory sections are not textbook facts unless the
            # title itself is in that line.
            if target not in _compact_topic(value) and not procedure_text:
                continue
        key = re.sub(r"\s+", "", value)
        if key not in seen:
            seen.add(key)
            selected.append(value)
    return selected


def _extract_procedure_steps(title: str, references: list[dict[str, Any]]) -> list[tuple[str, str]]:
    """Extract numbered, topic-bearing classroom steps from retrieved text."""

    normalized_title = re.sub(r"\s+", "", title)
    candidates: list[tuple[int, str, str]] = []
    seen: set[str] = set()
    for reference in references:
        raw_text = str(reference.get("text", ""))
        # Search only the title-scoped case block.  This is deliberately done
        # again here because callers may construct references directly in
        # tests, bypassing LessonReferenceStore.search().
        text = _focus_topic_text(raw_text, title) or raw_text
        if normalized_title and normalized_title not in re.sub(r"[\s《》〈〉\"“”‘’]", "", text):
            continue
        for line in text.splitlines():
            line = re.sub(r"\s+", " ", line).strip()
            if _has_other_lesson_title(line, title):
                continue
            match = re.match(r"^(\d{1,2})\s*[.．、)]\s*(.{12,500})$", line)
            if not match:
                continue
            body = match.group(2).strip(" ;；")
            if any(
                marker in body
                for marker in ("核心知识点", "备考易错提醒", "情境判断训练", "相似模式对比", "错项精细排除")
            ):
                continue
            if not any(mark in body for mark in ("教师", "学生", "引导", "组织", "观看", "观察", "朗读", "实验", "操作", "讨论", "阅读", "圈画", "批注", "标注", "识字", "复述", "完成", "提问", "拓展", "迁移")):
                continue
            key = re.sub(r"\W", "", body)[:180]
            if not key or key in seen:
                continue
            seen.add(key)
            heading, separator, detail = body.partition("：")
            if separator and 2 <= len(heading) <= 18:
                candidates.append((int(match.group(1)), heading.strip(), detail.strip() or body))
            else:
                candidates.append((int(match.group(1)), "", body))
    candidates.sort(key=lambda item: item[0])
    return [(heading, body) for _, heading, body in candidates[:10]]


def _retrieved_stage_specs(title: str, facts: list[str], references: list[dict[str, Any]]) -> list[tuple[str, str, str, str, str]]:
    """Create concrete process specs from numbered exemplar prose or facts."""

    labels = ["情境导入", "文本/材料初读", "关键内容探究", "操作验证", "比较辨析", "合作表达", "迁移应用", "总结评价"]
    steps = _extract_procedure_steps(title, references)
    specs: list[tuple[str, str, str, str, str]] = []
    for index, (heading, body) in enumerate(steps):
        stage_title = heading or labels[min(index, len(labels) - 1)]
        body = body[:520]
        if any(word in body for word in ("实验", "操作", "透明", "石子", "测量", "动手", "模拟")):
            student = f"根据教师提供的材料动手完成与《{title}》有关的操作，边操作边记录现象、变化和解释，再与同伴核对。"
            art = "弹、书"
        elif any(word in body for word in ("朗读", "认读", "字词", "圈画", "阅读")):
            student = f"独立阅读《{title}》，圈画关键词句并朗读，完成一份带文本依据的学习记录，再向同伴说明理由。"
            art = "说、书"
        elif any(word in body for word in ("讨论", "比较", "交流", "方案", "可行")):
            student = f"围绕《{title}》分组讨论，比较不同观点或方案，引用材料中的具体细节说明选择理由，并完成一次修改。"
            art = "说、画"
        else:
            student = f"围绕《{title}》观察材料、提出问题并完成阶段任务，把发现记录为一句结论和一条证据，向同伴解释思路。"
            art = "说、画"
        evidence = f"完成“{stage_title}”学习记录：{body[:180]}"
        specs.append((stage_title, body, student, art, evidence))
    if len(specs) >= 4:
        return specs

    labels = ["问题导入", "事实提取", "证据探究", "合作表达", "迁移总结"]
    for index, fact in enumerate(facts[: len(labels)]):
        fact = fact[:420]
        if index == 0:
            teacher = f"围绕《{title}》呈现教材事实并追问：{fact}。请学生先预测，再说明想从教材中核对的细节。"
            student = f"观察或默读与《{title}》有关的材料，用‘我发现……因为……’提出一个可验证的问题。"
            art = "说"
        elif index == 1:
            teacher = f"引导学生回到教材，圈画、标注或整理这条事实：{fact}，示范如何把原文/图示转成学习记录。"
            student = f"独立提取《{title}》中的关键词、人物行动、数据或现象，完成一份带出处的记录单。"
            art = "书、画"
        elif index == 2:
            teacher = f"设置追问‘为什么能得出这个结论’，组织学生用材料验证：{fact}，并纠正只报答案的表达。"
            student = f"用操作、朗读、比较或图示检验《{title}》的关键事实，写出结论、依据和仍未解决的问题。"
            art = "弹、说"
        elif index == 3:
            teacher = f"组织小组围绕《{title}》比较不同理解，要求每组引用至少两条教材证据回应同伴。"
            student = f"分工整理证据，使用图示、角色表达或口头说明展示对《{title}》的理解，并根据反馈修改。"
            art = "说、画"
        else:
            teacher = f"提供改变人物、条件或情境的迁移任务，要求学生把《{title}》中的方法用于新问题并说明边界。"
            student = f"完成《{title}》迁移卡：写出新情境、选择的方法、依据和一个可能限制，提交出口条。"
            art = "书、画"
        specs.append((labels[index], teacher, student, art, f"围绕{title}完成事实核验与学习产出：{fact[:180]}"))
    return specs


def _normalize_math_ocr_text(value: Any) -> str:
    """Remove known scanner noise without guessing unverified arithmetic."""

    text = str(value or "")
    text = "\n".join(
        line for line in text.splitlines()
        if "公众号" not in line and "PDF课本" not in line and "电子课本大全" not in line
    )
    # This is a recurrent glyph substitution in the supplied Grade 5 book,
    # verified against the page image and the teacher-provided sample.
    text = re.sub(
        r"(?i)S\s*=\s*a\s*(?:[×xX*]\s*)?h\s*[-—－]\s*2",
        "S=ah÷2",
        text,
    )
    text = re.sub(
        r"(三角形(?:的)?面积\s*=\s*底\s*[×xX*]\s*高)\s*[-—－]\s*2",
        r"\1÷2",
        text,
    )
    text = re.sub(
        r"(120\s*[×xX*]\s*39[.,]8)\s*[-—－]\s*2",
        r"\1÷2",
        text,
    )
    text = re.sub(r"(?i)\b(cm|dm|m|km)\s*\(?2\)?\b", r"\1²", text)
    return text


def _math_fact_is_reliable(value: str) -> bool:
    """Reject OCR fragments whose formulas, fractions, or units are unsafe."""

    text = str(value or "").strip()
    if len(re.findall(r"[\u3400-\u4dbf\u4e00-\u9fff]", text)) < 4:
        return False
    if text.startswith((")", "）", "=", "+", "-", "—", "－")):
        return False
    if text.count("(") + text.count("（") != text.count(")") + text.count("）"):
        return False
    if re.search(r"(?i)[A-Za-z]\s*=\s*[A-Za-z0-9×xX*]+\s*[-—－]\s*\d", text):
        return False
    # A hyphen between small integers is usually a broken fraction bar in the
    # scanned math books.  Do not turn it into either subtraction or division
    # without a verified profile or visual check.
    if re.search(r"(?<!\d)\d{1,3}\s*[-—－]\s*\d{1,3}(?!\d)", text):
        return False
    compact = re.sub(r"\s+", "", text)
    number_tokens = re.findall(r"\d+(?:[.,]\d+)?", compact)
    if len(number_tokens) > 5 or (len(compact) > 180 and len(number_tokens) >= 3):
        return False
    symbol_count = len(re.findall(r"[0-9=+\-—－×xX*/÷()（）<>≤≥]", compact))
    if compact and symbol_count / len(compact) > 0.34:
        return False
    return True


def _textbook_facts(title: str, references: list[dict[str, Any]]) -> list[str]:
    """Extract concise, title-scoped facts from retrieved textbook pages."""

    def readable_text(item: dict[str, Any]) -> str:
        # ``index_text`` removes interleaved pinyin from PDF extraction.  The
        # extractor often leaves one Chinese character per line, so join only
        # whitespace that sits between Chinese characters while retaining
        # punctuation and paragraph boundaries.
        value = _normalize_math_ocr_text(item.get("index_text") or item.get("text") or "")
        # The index representation contains no pinyin; removing its layout
        # whitespace reconstructs sentences whose characters were emitted on
        # separate PDF text lines.
        value = re.sub(r"\s+", "", value)
        value = re.sub(r"(?<=[\u3400-\u4dbf\u4e00-\u9fff])\s+(?=[\u3400-\u4dbf\u4e00-\u9fff])", "", value)
        value = re.sub(r"(?<=[\u3400-\u4dbf\u4e00-\u9fff])\s+(?=[，。！？；：、,.!?;:])", "", value)
        return value

    facts: list[str] = []
    seen: set[str] = set()
    subject_is_math = any("数学" in str(item.get("subject", "")) for item in references)
    for item in references:
        if str(item.get("source_type", "")) != "教材PDF" or not item.get("topic_match"):
            continue
        text = readable_text(item)
        sentences = _topic_evidence_sentences(text, title)
        # In primary textbooks the lesson title is often repeated in a footer
        # or exercise heading after the passage.  That exact match can make
        # the local-window extractor return only the footer.  For PDF pages,
        # prefer the readable page sentences whenever the title window is too
        # short to contain the lesson's actual evidence.
        if len(sentences) < 2 or sum(len(value) for value in sentences) < 36:
            sentences = _sentences(text)
            # A page can be matched by TOC metadata while OCR omitted the
            # heading.  The loader prepends the title; use non-empty lines as a
            # conservative fallback rather than discarding the page entirely.
            sentences = _sentences(text)
        for sentence in sentences:
            value = re.sub(r"\s+", " ", str(sentence)).strip(" ，,：:;；")
            value = re.sub(
                rf"^(?:\d+[.．、)]\s*)?{re.escape(_topic_name(title))}\s*",
                "",
                value,
            ).strip(" ，,：:;；")
            if len(value) < 12 or value in seen:
                continue
            if any(marker in value for marker in ("本页无可提取文本", "source_file:", "source_path:", "page_count:")):
                continue
            # OCR/text-layer glyph runs can leave duplicated single-character
            # exercise labels (for example ``多多多只只只``) at the bottom of
            # a page.  They are not usable lesson evidence.
            if re.search(r"(.{1,3})\1{2,}", value) or (
                len(value) >= 16 and len(set(value)) / max(1, len(value)) < 0.42
            ):
                continue
            if _has_other_lesson_title(value, title):
                continue
            if subject_is_math and not _math_fact_is_reliable(value):
                continue
            seen.add(value)
            facts.append(value)
            if len(facts) >= 8:
                return facts
    return facts


# A title is often the only piece of information a teacher enters in the
# course form.  The two hand-authored examples are therefore not enough: an
# offline/fallback response for a different, well-known textbook lesson must
# still contain the actual story or concept instead of a generic "围绕课题"
# paragraph.  These compact anchors are deliberately phrased as facts that
# are stable across common primary-school editions.  Edition-specific
# vocabulary/paragraph counts are marked for teacher verification below.
_CANONICAL_TOPIC_PROFILES: dict[str, dict[str, Any]] = {
    "倒数的认识": {
        "aliases": ["倒数的认识", "认识倒数", "倒数认识"],
        "subject": "小学数学",
        "lesson_type": "概念课",
        "math_verified": True,
        "prior_knowledge": ["分数乘法", "乘积是1", "非零整数可以写成分母为1的分数"],
        "next_knowledge": ["分数除法", "用乘倒数的方法计算除法"],
        "focus": "从多组乘积为1的算式中抽象出倒数概念，理解倒数描述的是两个数之间的相互关系；掌握非零分数和非零整数求倒数的方法，并用乘积是否为1检验，重点解释1的倒数仍是1、0没有倒数。",
        "keywords": ["乘积是1", "两个数", "互为倒数", "相互关系", "非零分数", "交换分子分母", "1的倒数", "0没有倒数", "乘法检验"],
        "facts": [
            "乘积是1的两个数互为倒数；倒数是两个数之间的相互关系，应说a和b互为倒数，或a是b的倒数、b是a的倒数。",
            "非零分数求倒数时交换分子、分母的位置，并用原数与所得数的乘积是否为1进行检验。",
            "非零整数n可以写成n/1，所以它的倒数是1/n；这个方法必须保留n不等于0的条件。",
            "1×1=1，所以1的倒数是1；不存在数x使0×x=1，所以0没有倒数。",
            "一个数的倒数不一定比原数小：大于1的数的倒数通常小于1，0与1之间正数的倒数大于1，1的倒数等于1。",
        ],
        "misconception": "学生容易把倒数说成一个数孤立的属性，只记住机械颠倒分子分母；还可能认为0的倒数是0、倒数一定比原数小，或求出后不检验乘积是否为1。",
        "materials": "教材《倒数的认识》正文与练习、乘积为1的算式卡、正例/反例卡、分数条或数轴、概念形成学习单、磁贴和板书贴。",
        "target_detail": "能从3/8×8/3=1、7/15×15/7=1、5×1/5=1、1/12×12=1等算式概括共同特征，规范表述互为倒数；会求非零分数和非零整数的倒数并用乘积为1检验；能说明1和0的特殊情况，辨析‘倒数一定更小’等错误。",
        "representation_path": ["乘法算式", "分子分母结构", "互为关系语言", "正反例分类", "乘积为1检验"],
        "homework": "基础：写出3/5、8、1的倒数并逐题用乘积为1检验，说明0为什么没有倒数；发展：判断‘一个数的倒数一定比它小’并举出三个不同情况的例子；拓展：设计一道容易误判的倒数题，附答案、理由和纠错提示。",
        "board": "板书以‘倒数的认识’为题。左栏排列3/8×8/3=1、7/15×15/7=1、5×1/5=1，圈出共同点‘乘积是1’；中栏框出定义‘乘积是1的两个数互为倒数’，用双向箭头强调相互关系，并写‘非零分数：交换分子分母；非零整数n=n/1→1/n；检验：原数×倒数=1’；右栏列特殊值‘1↔1，0没有倒数（0×x不可能等于1）’及三个易错判断。",
        "practice": [
            {"level": "基础", "prompt": "写出3/5、8和1的倒数，并检验。", "answer": "5/3、1/8、1。", "reasoning": "分别相乘得到1；整数8先写成8/1。"},
            {"level": "辨析", "prompt": "判断：0的倒数是0；一个数的倒数一定比它小。", "answer": "两句都错误。", "reasoning": "0与任何数的乘积都不是1；1的倒数等于1，1/3的倒数3还比原数大。"},
            {"level": "变式", "prompt": "如果a×4/7=1，a是多少？", "answer": "a=7/4。", "reasoning": "a与4/7互为倒数，也可用乘法验算7/4×4/7=1。"},
            {"level": "开放", "prompt": "分别找一组倒数中前一个数大于、等于、小于后一个数的例子。", "answer": "如2与1/2、1与1、1/3与3。", "reasoning": "三组乘积都等于1，同时呈现大小关系的三种情况。"},
        ],
        "stage_weights": [3, 3, 5, 4, 5, 4, 4, 5, 3, 4],
        "compact_stage_indexes": [0, 2, 4, 6, 9],
        "stage_specs": [
            ("核心问题导入", "呈现3/8×8/3、7/15×15/7、5×1/5、1/12×12四个算式，只要求计算乘积并追问‘这些算式为什么都得到1？两个因数之间有什么关系？’", "独立计算四个乘积，用彩笔圈出分子、分母和整数写法中的对应位置，先写观察再与同伴比较。", "说、书", "四道正确算式、共同点观察句和一个待验证问题。"),
            ("激活乘法旧知", "回顾分数乘法约分和整数写成分母为1分数的方法，用3/8×8/3说明约分后乘积为1，而不是只凭‘看起来颠倒’判断。", "在算式上标出约分过程，把5改写成5/1并说明5×1/5=1，为抽象概念准备可核查依据。", "书、画", "约分标记、5=5/1的表征和乘积为1的理由。"),
            ("正例观察与定义", "把四组算式按‘两个因数—乘积’制成表格，追问‘定义里为什么既要有乘积是1，又要有两个数？’引导学生完整归纳。", "比较表格后说出‘乘积是1的两个数互为倒数’，在正例卡上用双向箭头标出谁是谁的倒数。", "说、书", "倒数定义、正例分类表和双向关系图。"),
            ("互为关系辨析", "比较‘3/5是倒数’‘3/5和5/3互为倒数’‘3/5是5/3的倒数’三种说法，追问哪一句缺少关系对象。", "逐句判断并改错，使用‘a和b互为倒数’及‘a是b的倒数’各造一句数学表达。", "说", "两句规范关系表达和一条错误修改记录。"),
            ("求倒数方法建构", "分别出示3/5、6和7/2，要求学生先根据乘积为1寻找对应数，再归纳非零分数交换分子分母、整数n写成n/1的方法，强调n不等于0。", "求出5/3、1/6和2/7，在每一题后写乘法检验；用流程图表示‘改写—交换—相乘检查’。", "书、画", "三题求倒数过程、乘法验算和方法流程图。"),
            ("特殊数1与0", "先问1的倒数，再设未知数x追问‘若0有倒数，应满足什么式子？0×x可能等于1吗？’禁止用0/0作解释。", "用1×1=1说明1的倒数是1，用0×x=0不可能等于1说明0没有倒数，并把两条结论写入特殊数卡。", "说、书", "1和0的结论、对应算式及完整理由。"),
            ("反例与易错诊断", "组织判断‘0的倒数是0’‘倒数一定比原数小’‘两个数分子分母颠倒就互为倒数’，要求用定义、反例或乘法检验作答。", "独立判断后分别举出1、1/3和带零错误的反例，修改错误表述并说明每次判断依据。", "说、画", "三道判断的正误、反例和纠错理由。"),
            ("分层练习与反馈", "依次投放基础题3/5、8、1，关系题a×4/7=1和开放题‘构造大小关系不同的三组倒数’，每题都追问‘怎样验证？’", "先独立完成，再按‘答案—乘积检验—关系表述’互评；错误者定位是概念、方法还是特殊值问题并订正。", "书、说", "分层练习答案、逐题检验、错误归因和订正。"),
            ("结构迁移", "联系下一课分数除法，只追问‘为什么除以一个非零分数可能转化为乘它的倒数’，不提前教学算法；要求指出非零条件。", "用一组互为倒数说明乘法关系，写出自己对分数除法的预测和需要继续验证的问题。", "说、画", "倒数知识结构图、含非零条件的迁移预测。"),
            ("总结与出口评价", "回到三个出口问题：什么叫互为倒数、怎样求并检验、1和0为什么特殊；根据学生证据纠正只说‘交换位置’的回答。", "用‘定义—方法—特殊值—检验’四格卡总结，完成一道自编易错题并附正确答案与理由。", "说、书", "四格总结卡、自编题、答案和理由。"),
        ],
    },
    "三角形的面积": {
        "aliases": ["三角形的面积", "三角形面积"],
        "subject": "小学数学",
        "lesson_type": "图形公式课",
        "math_verified": True,
        "prior_knowledge": ["平行四边形的面积S=ah", "图形转化", "三角形的底和对应高"],
        "next_knowledge": ["梯形的面积", "组合图形面积", "等底等高图形关系"],
        "focus": "用两个完全相同的三角形拼成平行四边形，在操作、图示、算式和数学语言之间转换，确认拼成图形与原三角形的对应底和高相等，推出每个三角形面积是平行四边形的一半，形成S=ah÷2并解释为什么必须除以2。",
        "keywords": ["两个完全相同的三角形", "拼成平行四边形", "对应的底", "对应的高", "面积的一半", "转化", "S=ah÷2", "平方单位"],
        "facts": [
            "两个完全相同的三角形可以拼成一个平行四边形；拼成的平行四边形与原三角形具有对应相等的底和高。",
            "拼成的平行四边形由两个完全相同的三角形组成，所以一个三角形的面积是该平行四边形面积的一半。",
            "三角形面积公式是S=ah÷2，其中a是所选底，h必须是这条底边上的对应高；除以2来自两个完全相同三角形拼成一个平行四边形。",
            "计算面积要使用平方单位；教材红领巾问题可按120×39.8÷2=2388（cm²）计算。",
            "等底等高的三角形面积相等，但必须同时满足底相等且对应高相等，不能只凭图形外观判断。",
        ],
        "misconception": "学生容易把S=ah÷2写成S=ah或OCR错误的S=ah-2，不能解释为什么除以2；也可能选择不对应的底和高、认为只有直角三角形能推导公式，或把面积单位写成长度单位。",
        "materials": "教材《三角形的面积》页面、每组两套完全相同的锐角/直角/钝角三角形纸片、平行四边形复习卡、直尺、三角尺、剪拼记录单、红领巾图片和方格纸。",
        "target_detail": "能用两块完全相同的锐角、直角或钝角三角形拼成平行四边形，指出对应底和高以及面积倍数关系；能完整推导并运用S=ah÷2，解释除以2的依据，正确使用平方单位；能诊断漏除以2、底高不对应和单位错误。",
        "representation_path": ["红领巾实物问题", "完全相同三角形剪拼", "平行四边形图", "对应底高与倍数关系", "S=ah÷2", "数值与单位检验"],
        "homework": "基础：选择对应底和高计算三道三角形面积题并写平方单位；发展：画一个底6 cm、高4 cm但形状不同的三角形，验证面积都是12 cm²；拓展：在方格纸上设计面积相等、形状不同的三角形，标出底、高和计算理由。",
        "board": "板书以‘三角形的面积’为题。左栏写核心问题‘红领巾面积怎样求？’并画三角形，标出a和对应高h；中栏动态呈现‘两个完全相同三角形→拼成平行四边形’，用同色箭头连接对应底、高，写‘平行四边形面积=ah，三角形面积=平行四边形面积÷2’，框出S=ah÷2并在÷2下标注‘两个完全相同’；右栏完成120×39.8÷2=2388（cm²），列易错点‘底高要对应、不能漏÷2、面积用平方单位’。",
        "practice": [
            {"level": "基础", "prompt": "三角形底8 cm、对应高5 cm，求面积。", "answer": "20 cm²。", "reasoning": "8×5÷2=20，面积使用平方厘米。"},
            {"level": "辨析", "prompt": "小明列8×5，另一名学生列8×4÷2，其中4 cm不是8 cm底边上的高。两式对吗？", "answer": "都不能作为正确解答。", "reasoning": "第一式漏除以2；第二式使用了不对应的底和高。"},
            {"level": "教材应用", "prompt": "红领巾底120 cm、高39.8 cm，求面积。", "answer": "2388 cm²。", "reasoning": "120×39.8÷2=2388。"},
            {"level": "开放", "prompt": "在方格纸上画三个底6 cm、高4 cm但形状不同的三角形。", "answer": "每个面积都是12 cm²。", "reasoning": "三角形形状虽不同，但对应底和高相同，6×4÷2=12。"},
        ],
        "stage_weights": [3, 3, 4, 6, 5, 5, 4, 4, 3, 3],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [
            ("真实问题导入", "出示红领巾三角形并给出底120 cm、高39.8 cm，追问‘只会求长方形和平行四边形面积，怎样得到这个三角形的面积？’保留学生猜想。", "标出红领巾的底和对应高，估计面积应小于同底等高平行四边形面积，并写下准备采用的转化方法。", "说、画", "红领巾标注图、面积范围猜想和转化方案。"),
            ("旧知连接", "复习平行四边形面积S=ah和割补转化经验，追问‘若能把三角形转化成平行四边形，哪些量必须保持对应？’", "在复习卡上计算一个平行四边形面积，标出底a和高h，用一句话说明公式与图中量的对应关系。", "说、书", "平行四边形公式、底高标注和对应关系说明。"),
            ("独立猜想与方案", "分别出示锐角、直角、钝角三角形纸片，让学生判断需要几块、怎样旋转或平移才能拼成已学图形，并要求先画操作草图。", "独立选择两块完全相同的三角形，画出拼接方向和公共边，预测拼成图形及面积倍数关系。", "画、弹", "剪拼草图、操作预测和‘需要完全相同’的条件记录。"),
            ("分类剪拼验证", "组织三类小组操作两块完全相同的锐角、直角、钝角三角形，巡视追问‘两块是否完全相同？拼成的一定是长方形吗？’纠正‘任意两块都能拼’。", "通过旋转、平移把两块完全相同的三角形拼成平行四边形，描出拼接线；三类小组交换作品，核查图形与条件。", "弹、画", "三类剪拼作品、操作记录和条件核查表。"),
            ("对应关系比较", "把原三角形与拼成的平行四边形同屏对照，用同色标出对应底和高，追问‘平行四边形的底、高分别对应三角形的什么？面积有几倍关系？’", "测量或叠合验证对应底、高相等，完成‘平行四边形由两个完全相同三角形组成，因此一个三角形面积是它的一半’说理链。", "说、画、书", "对应底高标记、测量表和完整倍数关系说明。"),
            ("公式推导", "从平行四边形面积=底×高逐步板演，追问‘为什么不是ah，为什么一定要除以2’，最后用字母a、h、S规范表示。", "沿‘平行四边形面积=ah→两个三角形总面积=ah→一个三角形面积=ah÷2’写推导，向同伴解释÷2的图形依据。", "说、书", "S=ah÷2推导链和‘为什么除以2’的口头说明。"),
            ("教材例题应用", "回到红领巾数据，示范先找对应底高、再代入、最后写平方单位：120×39.8÷2；要求学生估算结果并验算。", "独立计算120×39.8÷2=2388（cm²），用‘小于同底等高平行四边形面积’检查数量级和结果。", "书、说", "规范列式、2388 cm²答案、估算和检验说明。"),
            ("易错诊断", "展示S=ah、S=ah-2、底高不对应、答案写cm四类错误，要求学生分别指出概念、符号、对应关系或单位问题。", "逐项改成S=ah÷2，重新连接对应底和高，把cm改为cm²，并为每类错误写一句纠偏提醒。", "说、书、画", "四类错误诊断、正确改写和纠偏提示。"),
            ("分层与开放练习", "安排底8 cm高5 cm基础题、等底等高变式题和方格纸开放作图，逐题要求写答案与关键理由。", "完成20 cm²基础题，画三个底6 cm高4 cm的不同三角形并说明面积均为12 cm²，互查底高对应和单位。", "画、书", "分层练习答案、计算理由、三幅等面积图和互评记录。"),
            ("总结迁移", "用‘转化对象—不变量—倍数关系—公式—条件’回顾推导，联系下一课梯形面积，追问还可怎样把新图形转化为已学图形。", "完成五节点知识图，用一句话解释S=ah÷2中的a、h和÷2；提出一个可用转化思想解决的新面积问题。", "说、画", "五节点知识图、公式解释和迁移问题。"),
        ],
    },
    "乌鸦喝水": {
        "aliases": ["乌鸦喝水"],
        "focus": "一只乌鸦口渴，到处找水；它找到一个瓶子，却因水少、瓶口小而喝不到，后来发现旁边有许多小石子，把石子一个一个放进瓶子，水渐渐升高，终于喝到了水。课文把‘观察困难—想办法—连续操作—解决问题’连成一条清晰的因果链。",
        "keywords": ["口渴", "到处找水", "瓶子", "瓶口小", "小石子", "一个一个", "渐渐升高", "喝着水"],
        "facts": [
            "故事情节：乌鸦口渴找水→发现瓶中有水却喝不到→看见小石子并想出办法→把石子一个一个放入瓶中→水面渐渐升高后喝到水。",
            "关键因果：不是‘瓶子里没有水’，而是水不多、瓶口小，乌鸦的嘴够不到；投放石子使水面上升，办法才有效。",
            "常见低年级教材把‘怎么办呢’‘想出办法来了’‘一个一个’‘渐渐升高’作为朗读、识字和词语理解的抓手；自然段和生字请教师按手中版本核对。",
        ],
        "misconception": "学生容易只说‘乌鸦很聪明’或把‘把石子放进去’当成孤立动作，忽略瓶口小造成的困难、连续投放的过程和水面上升的因果证据；也容易把‘渐渐’读成一次性马上发生。",
        "materials": "课文《乌鸦喝水》、透明塑料瓶（瓶口大小不同）、清水、大小适中的小石子或玻璃珠、词语卡片、实验记录单、乌鸦和瓶子插图；实物操作需注意防洒和安全。",
        "target_detail": "能按教材朗读并复述‘口渴找水—瓶口小喝不到—投放小石子—水面升高—喝到水’的情节链；理解‘口渴、瓶口、办法、旁边、许多、一个一个、渐渐’等词语在句中的意思；能用观察或小实验说明石子进入瓶中后水面上升的现象，并用‘因为……所以……’表达解决问题的因果关系；识写字词以教师所用版本为准。",
        "homework": "基础：朗读课文3遍，圈出‘怎么办呢、想出办法来了、一个一个、渐渐升高’并抄写易错词；提升：用五格图向家人复述乌鸦解决口渴的过程；拓展：设计一个‘瓶口更小/石子换成棉花’的变式实验，先预测再记录结果，并说明哪些条件需要保持不变。",
        "art_tasks": {
            "说": "用‘困难—办法—结果’句式复述乌鸦喝水，并说明‘瓶口小’和‘水面升高’这两条证据",
            "唱": "把‘口渴找水、石子进瓶、水面升高’编成节奏短句，强化‘一个一个、渐渐’的过程词",
            "弹": "按‘观察—投放—停下记录’节奏操作石子实验，练习稳定、专注和规范取放材料",
            "舞": "用身体高低和手臂动作表现乌鸦低头够水、发现石子、连续投放和喝到水的变化",
            "书": "在学习单上记录瓶中水位变化、关键词和因果句，规范书写课题词语",
            "画": "绘制‘乌鸦—瓶口—水面—石子’五格因果图，并用箭头标出水面渐渐上升",
        },
        "stage_weights": [2, 3, 3, 4, 5, 5, 6, 4, 4, 4],
        "compact_stage_indexes": [0, 1, 4, 6, 9],
        "stage_specs": [
            ("情境导入", "出示透明瓶和乌鸦插图，先不揭示答案，追问‘乌鸦为什么低头仍喝不到？如果瓶口很小，你会怎么办？’让学生依据观察提出猜想。", "观察瓶中水位和瓶口，用‘我看到……所以我猜……’说出一个预测，并画出乌鸦可能采取的办法。", "说、画", "问题卡、初始预测图和理由句。"),
            ("初读课文", "布置‘读准字音、读通句子、找出乌鸦遇到的困难和办法’的任务，提醒学生圈出‘口渴、瓶口、小石子、渐渐’等词，并按常见教材结构标自然段，段数请按手中版本核对。", "自由朗读课文，用不同符号标出困难、办法和结果；同桌互读词语，完成‘我先发现了……’阅读记录。", "弹、书", "困难—办法—结果三栏阅读单和自然段标记。"),
            ("识字词语", "出示课文中的‘乌、鸦、渴、喝、瓶、办、法、旁、许、放、进、高、渐’等核心字词，比较‘渴/喝’偏旁和意义，结合图片解释‘瓶口、旁边、渐渐’。", "认读、组词并用‘渴/喝’各说一句话，把带有‘一个一个、渐渐’的短语按动作顺序排列，接受同伴指读纠音。", "说、唱", "字词卡、渴/喝辨析句和过程词排序条。"),
            ("发现困难", "精读‘瓶子里有水，可是瓶口很小，乌鸦喝不着水’等句，追问‘瓶中有水为什么仍然喝不到？哪两个词说明困难？’指导学生把原因画在瓶子示意图上。", "圈画‘有水、很小、喝不着’等证据，完成‘现象—原因’表，用完整句说明乌鸦不是没有水而是够不到水。", "说、书", "瓶子示意图、文本圈画和原因解释句。"),
            ("朗读转折", "抓住‘怎么办呢’‘乌鸦看见旁边有许多小石子，想出办法来了’的问答和语气转折，示范从焦急到惊喜的朗读，追问‘想出办法前后心情有什么变化？’", "分角色或分句朗读，给‘怎么办呢’加上合适语气，在心情线中标注焦急、思考、发现和期待四个节点。", "说、舞", "语气朗读、心情线和动作表达。"),
            ("办法操作", "出示小石子，要求学生边读边找动作词‘把、一个一个、放进’，示范一次规范投放，提醒每放一颗就观察并记录，避免把所有石子一次倒入。", "按顺序投放石子或模拟卡片，口头复述‘先……再……最后……’，在记录单上画出每一步和对应水位。", "弹、舞、书", "动作词标注、操作步骤卡和逐次记录。"),
            ("实验验证", "组织小组用透明瓶验证水位变化，设置‘石子大小/投放数量’的对照，追问‘哪一次观察支持水面渐渐升高？如果石子漂浮还会怎样？’引导学生区分教材事实与猜想。", "测量或目测记录投放前后水位，用箭头画出变化，依据数据说‘因为石子占据瓶内空间，所以水面上升’；对异常结果写下原因。", "说、弹、画", "实验记录表、水位变化图和因果解释。"),
            ("因果复述", "用五格图串联‘口渴—找水—喝不到—放石子—喝到水’，追问‘去掉哪一格故事就不完整？“渐渐”能否换成“马上”？’指导学生用文本词语复述。", "小组合作完成情节图，使用‘因为……所以……后来……终于……’复述全文，并用‘渐渐’说明过程不是瞬间发生。", "说、画", "五格情节图、完整复述录音或口头展示。"),
            ("规范书写与板书", "依据学生版本选择生字，示范‘渴/喝、办/法、进/高’的结构和易错笔画；板书保留‘困难→办法→操作→结果’并让学生补上课文关键词。", "观察范写、书空、临写并互评；把‘瓶口小、石子进瓶、水面升高’写入因果板书，修改一处不规范笔画。", "书", "生字书写、关键词板书和互评修改痕迹。"),
            ("总结迁移", "提供‘瓶口更小、没有石子、换成大豆’等新情境，追问‘仍能喝到吗？需要改变什么条件？’回扣乌鸦先观察再想办法、连续验证的学习方法。", "完成出口条‘我从乌鸦喝水学会先……再……’，选择一个变式情境画图或写方案，并说明预测依据。", "说、画", "迁移方案、出口条和一条依据。"),
        ],
    },
    "守株待兔": {
        "aliases": ["守株待兔", "守株待兔寓言"],
        "focus": "农夫偶然看见一只兔子撞在树桩上死去，捡到兔子后便放下农具守在树桩旁，希望再次不劳而获；结果兔子没有再来，田地也荒废了。课文把‘偶然事件—错误推断—停止劳动—结果落空’的因果链呈现出来，引导学生区分偶然与必然、愿望与事实。",
        "keywords": ["农夫", "兔子", "树桩", "撞死", "守株", "待兔", "耕田", "偶然", "不劳而获"],
        "facts": [
            "故事情节：农夫在田里耕作时偶然看见兔子撞到树桩死去，捡走兔子后便放下农具守在树桩旁等待下一只兔子。",
            "结果与原因：兔子没有再次撞到树桩，农夫没有收获，田地反而荒废；一次偶然不能推出事情一定会重复发生。",
            "寓言阅读重点：先梳理‘遇兔—捡兔—守株—田荒’的事件链，再用文本证据和生活例子说明不能把侥幸当作可靠方法；原文、注释和生字按所用版本核对。",
        ],
        "misconception": "学生容易只背‘不能不劳而获’的结论，忽略农夫从一次偶然收获推断必然结果的错误；也容易把‘守株’误解为认真守护树木，而没有联系‘放下耕作、等待兔子’的具体行动。",
        "materials": "所用版本《守株待兔》原文与注释、农夫/兔子/树桩情境图、文白对照卡、事件链卡片、偶然与必然辨析表、角色朗读评价单。",
        "target_detail": "能读准并理解课文中的关键文言词句（具体注释按教材核对），按‘耕田—兔撞树桩—捡兔—守株—田荒’复述故事；能从‘因释其耒而守株’等关键语句（原文以教材为准）找出农夫改变行动的证据，说明一次偶然不能带来必然收获；能用生活中的例子完成一次‘事实—推断—验证’辨析。",
        "homework": "基础：朗读原文和译文，整理‘兔、株、耒、冀、复’等版本中的关键词；发展：画‘遇兔—守株—田荒’三格图并写出每格证据；拓展：记录一个生活中的偶然事件，写出不能据此作出什么必然判断。",
        "art_tasks": {
            "说": "用文白对照和证据句复述农夫的行动变化",
            "唱": "按停顿节奏朗读文言句，区分‘守株’与‘待兔’的语义",
            "弹": "用事件卡和计时器模拟一次偶然与重复验证",
            "舞": "定格表现耕田、拾兔、放下农具守候和田地荒废",
            "书": "抄写关键词并完成‘事实—推断—结果’辨析表",
            "画": "绘制四格因果图，标出偶然事件和错误推断",
        },
        "stage_weights": [2, 3, 4, 5, 5, 5, 5, 4, 3, 4],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [],
    },
    "狐狸和乌鸦": {
        "aliases": ["狐狸和乌鸦"],
        "focus": "乌鸦嘴里叼着一块食物停在树上，狐狸想得到食物，先后用夸奖和奉承诱使乌鸦开口；乌鸦一唱，食物掉下，狐狸叼走食物。课文通过‘目的—试探—奉承—轻信—结果’的对话链，帮助学生理解人物语言、神态和行为之间的关系，并辨析盲目听信奉承的风险。",
        "keywords": ["狐狸", "乌鸦", "树上", "食物", "夸奖", "奉承", "开口", "掉下来", "得意"],
        "facts": [
            "故事情节：乌鸦叼着食物站在树上，狐狸看见后想办法得到食物，先观察并连续夸奖乌鸦。",
            "关键转折：乌鸦相信狐狸的赞美而开口，食物随之掉下，狐狸达到目的；对话中的夸奖不是单纯礼貌，而是带有明确目的的策略。",
            "阅读重点：比较狐狸前后语言、乌鸦神态和动作，找出‘听到什么—作出什么判断—导致什么结果’的文本证据；食物名称和原句按所用版本核对。",
        ],
        "misconception": "学生容易把狐狸简单说成‘聪明’、乌鸦简单说成‘笨’，忽略狐狸的语言策略和乌鸦由得意到上当的心理变化；也容易只复述结果而不引用对话说明原因。",
        "materials": "所用版本《狐狸和乌鸦》课文、狐狸和乌鸦头饰、对话卡片、表情/动作卡、情节链学习单、语气朗读评价表；食物名称和段落按教材核对。",
        "target_detail": "能按‘乌鸦得食—狐狸观察—连续奉承—乌鸦开口—食物掉落’复述故事；能圈画狐狸的称赞语和乌鸦的动作/神态，用语气朗读表现人物心理；能说明狐狸话语背后的目的，并在新情境中辨别真诚建议与带目的的奉承。",
        "homework": "基础：朗读课文，圈画狐狸的语言和乌鸦的动作；发展：制作‘语言—心理—结果’三栏图并向家人复述；拓展：改写一个乌鸦不轻信的结局，保留课文人物和因果依据。",
        "art_tasks": {
            "说": "分角色朗读并用证据解释狐狸的语言目的",
            "唱": "把关键对话按语气节奏读出奉承与得意",
            "弹": "用停顿和音量变化标记对话转折",
            "舞": "用表情和动作呈现狐狸试探、乌鸦得意与开口",
            "书": "记录‘语言—心理—结果’证据表",
            "画": "画五格情节图并用箭头标出食物掉落的因果",
        },
        "stage_weights": [2, 3, 4, 5, 5, 5, 5, 4, 3, 4],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [],
    },
    "植物如何喝水": {
        "aliases": ["植物怎样喝水", "植物如何吸水", "植物喝水"],
        "focus": "从‘植物没有嘴，水是怎样到达叶片的’这一问题出发，学生观察植物茎的切面并进行芹菜（或其他白色茎）染色实验，记录有色水在茎内向上运输的现象，提出根吸收水分、茎运输水分到叶等解释，再用证据检验和修正模型。具体材料和结论深度需按所用科学教材核对。",
        "keywords": ["植物", "吸水", "根", "茎", "叶", "芹菜染色", "水分运输", "观察记录", "实验"],
        "facts": [
            "探究问题：植物没有像动物那样的嘴，仍能把水分送到叶片；课堂应先让学生提出猜想，再寻找可观察证据。",
            "常见实验：把芹菜或白色茎插入有色水，经过一段时间观察茎的切面和叶脉出现颜色变化，记录水分沿茎向上运输的现象；时间和材料按教材核对。",
            "解释模型：根吸收水分，茎中的通道把水分运输到叶等部位；实验现象支持‘水能在植物体内移动’，不能单凭一次观察断言所有植物都完全相同。",
        ],
        "misconception": "学生容易把‘植物喝水’理解成植物用嘴吸水，或把一次染色现象直接等同于完整的植物吸水机制；还容易只看结果、不记录变量和观察时间。",
        "materials": "科学教材、芹菜/白色茎、透明杯、有色水、放大镜、刀具由教师操作、标签、计时器、观察记录表和安全提示；实验时间与材料按学校条件调整。",
        "target_detail": "能提出‘水从哪里进入、怎样到达叶片’的问题，按照预测—实验—观察—记录—解释的步骤完成染色实验；能在图上标出根、茎、叶并用观察证据说明水分运输现象；能区分观察到的事实、自己的解释和仍需验证的问题。",
        "homework": "基础：整理根、茎、叶与水分运输的关键词；发展：完成一次植物浇水观察日志，记录时间、部位和变化；拓展：设计一个改变光照、茎段或水色的对照方案，写出变量、预测和安全注意事项。",
        "art_tasks": {
            "说": "用‘我观察到—我推断—我还要验证’汇报实验",
            "唱": "用节奏口诀记根吸收、茎运输、叶片利用的探究链",
            "弹": "按实验步骤规范取样、计时和记录",
            "舞": "用身体路线模拟水分从根经茎到叶的移动",
            "书": "填写实验表格、变量和证据结论",
            "画": "绘制植物体内水分运输示意图并标注观察证据",
        },
        "stage_weights": [3, 4, 5, 6, 6, 5, 4, 3, 2, 2],
        "compact_stage_indexes": [0, 2, 3, 5, 9],
        "stage_specs": [],
    },
    "司马光": {
        "aliases": ["司马光砸缸", "司马光"],
        "focus": "小伙伴在庭院玩耍时，一个孩子掉进装满水的缸里，其他孩子惊慌逃散，司马光举石击缸，使水流出、孩子获救。课文突出在危险情境中保持镇定、寻找可行办法并立即行动。",
        "keywords": ["庭院", "水缸", "掉进", "众皆弃去", "持石", "击瓮", "水迸", "儿得活"],
        "facts": ["事情发生在儿童游戏时，一名孩子掉进盛水的缸中。", "同伴有的逃走，司马光没有离开，而是寻找石头击破水缸。", "缸破水流出，孩子因此获救；文言词语和译文须按教材版本核对。"],
        "misconception": "学生容易只记‘砸缸’这个结果，忽略司马光先判断危险、再选择让水流出的办法，也可能把现代译文当成原文朗读。",
        "materials": "课文原文与注释、情境图、缸和石头示意模型、文白对照卡、动作路线图、朗读评价单。",
        "target_detail": "能读准并理解‘庭院、水缸、掉进、众皆弃去、持石击瓮、水迸’等词句，按‘玩耍—落水—众人逃散—持石击缸—获救’复述事件，比较司马光与同伴的不同反应，并说明办法为何可行。",
        "homework": "朗读原文和译文，制作‘危险—判断—行动—结果’四格图；向家人讲述司马光的办法，并设计一个不靠蛮力、先保护自己再求助的安全方案。",
        "art_tasks": {"说": "文白对照复述事件并说明击缸的因果", "唱": "按停顿节奏朗读文言句", "弹": "用安全模型模拟观察与记录", "舞": "定格表现众人逃散与司马光持石", "书": "抄写关键词并做文言词语卡", "画": "画事件路线与因果图"},
        "stage_weights": [2, 3, 4, 5, 5, 5, 5, 4, 3, 4],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [],
    },
    "曹冲称象": {
        "aliases": ["曹冲称象"],
        "focus": "面对大象无法直接称量的难题，曹冲先让大象上船在船身刻记号，再把大象换成石头，装石头到刻度线，最后称石头总重量，用等量替换解决大物体称量问题。",
        "keywords": ["大象", "船", "刻记号", "石头", "水面", "重量", "称一称", "等量替换"],
        "facts": ["大象太大，不能直接放到普通秤上称。", "曹冲利用船的浮力和水面刻度，把大象造成的排水量转换为石头的重量。", "步骤关键是先记船身水位，再换石头并装到同一刻度，最后称石头。"],
        "misconception": "学生容易把‘把石头放船上’说成结论，漏掉前后水位必须相同，或误以为石头数量本身就是大象重量。",
        "materials": "大象、船、石头和水面图片或模型、刻度贴纸、操作记录单、步骤卡、天平示意图。",
        "target_detail": "能按四步复述称象办法，理解同一刻度表示排水量相等，能用图示说明为什么称石头可以推知大象重量，并比较直接称量与等量替换的优缺点。",
        "homework": "绘制曹冲称象四步图，给每步写一句说明；设计一个称量大南瓜或一桶水的等量替换方案，标出必须保持不变的条件。",
        "art_tasks": {"说": "按四步说明等量替换", "唱": "用节奏口诀记‘上船刻线、换石装满、逐块称量’", "弹": "规范摆放模型与刻度贴", "舞": "用站位表现水位相同", "书": "记录步骤与重量表", "画": "画船、水位和石头替换图"},
        "stage_weights": [2, 3, 4, 5, 5, 6, 5, 4, 3, 3],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [],
    },
    "小蝌蚪找妈妈": {
        "aliases": ["小蝌蚪找妈妈"],
        "focus": "小蝌蚪从‘大脑袋、黑灰身子、长尾巴’出发，沿途向鲤鱼、乌龟询问，在身体逐渐长出后腿、前腿、尾巴变短的过程中，根据外形线索找到青蛙妈妈。",
        "keywords": ["小蝌蚪", "鲤鱼", "乌龟", "后腿", "前腿", "尾巴变短", "青蛙妈妈", "迎上去"],
        "facts": ["小蝌蚪先后向鲤鱼、乌龟询问妈妈的样子和去向。", "成长过程中先长后腿、再长前腿，尾巴逐渐变短，最后成为小青蛙。", "找到妈妈依靠的是外形变化和对话线索，而不是只看一个特征。"],
        "misconception": "学生容易把成长顺序说乱，或只凭‘四条腿’认妈妈，忽略尾巴变化和连续观察。",
        "materials": "课文插图、蝌蚪和青蛙成长序列卡、角色头饰、观察记录单、动作路线图。",
        "target_detail": "能按时间顺序复述成长和寻找过程，抓住后腿、前腿、尾巴变短等外形证据，分角色朗读并用观察记录解释为什么最后认出青蛙妈妈。",
        "homework": "完成成长顺序图，向家人讲述小蝌蚪找到妈妈的过程；观察一种动物的成长或变化，画三阶段图并写出可观察证据。",
        "art_tasks": {"说": "角色对话与成长复述", "唱": "用节奏记成长顺序", "弹": "按阶段敲击记录观察", "舞": "模仿游动、长腿和跳跃", "书": "填写成长观察表", "画": "画成长序列与路线图"},
        "stage_weights": [2, 3, 4, 5, 5, 5, 5, 4, 3, 4],
        "compact_stage_indexes": [0, 1, 3, 5, 9],
        "stage_specs": [],
    },
}

_GENERIC_SUMMARY_MARKERS = (
    "围绕课题核心内容开展", "围绕课题开展理解", "围绕课题开展", "学科目标，并留下可观察",
)
_STALE_FORM_TOPIC_MARKERS = (
    "圆明园", "文化遗产保护", "昔日的辉煌与毁灭", "车轮为什么做成圆形",
    "小马驮麦子", "松鼠说水深", "老牛说水浅",
)


def _normalized_topic_text(value: Any) -> str:
    return re.sub(r"[《》〈〉\"“”‘’\s]", "", str(value or "")).strip()


def _canonical_topic_profile(title: str) -> dict[str, Any] | None:
    normalized = _normalized_topic_text(title)
    for key, template in _CANONICAL_TOPIC_PROFILES.items():
        aliases = [key, *template.get("aliases", [])]
        if any(
            _normalized_topic_text(alias) in normalized
            or (len(normalized) >= 4 and normalized in _normalized_topic_text(alias))
            for alias in aliases
            if alias
        ):
            profile = deepcopy(template)
            profile["title"] = _topic_name(title)
            profile["source"] = "canonical_textbook_anchor"
            profile["confidence"] = "high"
            if not profile.get("stage_specs"):
                profile["stage_specs"] = (
                    _build_math_stage_specs(profile)
                    if "数学" in str(profile.get("subject", ""))
                    else _build_topic_stage_specs(profile)
                )
            return profile
    return None


def _topic_description(value: Any, title: str) -> str:
    """Drop stale form defaults while retaining a teacher's own description."""

    text = str(value or "").strip()
    if not text:
        return ""
    normalized = _normalized_topic_text(title)
    if any(marker in text for marker in _GENERIC_SUMMARY_MARKERS):
        # These are the original form defaults, not textbook evidence.
        if not normalized or normalized not in _normalized_topic_text(text):
            return ""
    # The browser ships with a concrete example summary.  If a teacher only
    # changes the title, do not carry that other lesson into the new profile.
    known_titles = set(_CANONICAL_TOPIC_PROFILES) | {"圆明园的毁灭", "小马过河", "圆的认识"}
    mentioned = [item for item in known_titles if item in text]
    if mentioned and not any(item in normalized for item in mentioned):
        return ""
    stale_markers = [marker for marker in _STALE_FORM_TOPIC_MARKERS if marker in text]
    if stale_markers and not any(marker in normalized for marker in stale_markers):
        return ""
    return text


def _build_topic_stage_specs(profile: dict[str, Any], *, story: bool = True) -> list[tuple[str, str, str, str, str]]:
    """Create a full, topic-bearing process for catalog entries without hand
    written stage specs.

    A catalog entry may intentionally only provide stable content facts.  The
    generated stages still name those facts in every task, which is much more
    useful than falling back to five empty "核心探究" phases.  Teachers can
    replace version-sensitive wording after checking their textbook.
    """

    title = str(profile.get("title", "本课课题"))
    focus = str(profile.get("focus", ""))
    facts = [str(item) for item in profile.get("facts", []) if str(item).strip()]
    keywords = [str(item) for item in profile.get("keywords", []) if str(item).strip()]
    fact_one = facts[0] if facts else f"教材中关于{title}的关键情节或概念"
    fact_two = facts[1] if len(facts) > 1 else fact_one
    keyword_text = "、".join(keywords[:6]) or title
    if story:
        return [
            ("情境导入", f"出示《{title}》的标题、插图或实物，围绕‘{focus}’提出一个需要从课文寻找证据的问题；不先替学生说结论。", f"观察标题和材料，用‘我看到……我猜……因为……’作出预测，并写下一个想在《{title}》中验证的问题。", "说、画", f"问题卡、初始预测图，至少点出{title}的一处具体线索。"),
            ("初读文本", f"组织学生完整朗读《{title}》，要求圈画人物、地点、物品和动作，按‘开始—变化—结果’标出叙事线；段落数量和字词以手中教材核对。", f"独立朗读并用不同符号圈画‘{keyword_text}’，和同伴核对顺序，完成一张开始—变化—结果阅读单。", "弹、书", f"《{title}》的情节/信息顺序表和一处文本证据。"),
            ("词语与概念", f"从《{title}》中挑选‘{keyword_text}’进行认读、释义或概念辨析，示范把词语放回原句/图示，不把识记和理解割裂。", f"认读并给关键词组词、造句或标注图示；把易混词按意义、动作或结构分类，向同伴解释一组区别。", "说、书", f"关键词卡、句中释义或概念分类表，至少正确使用{keywords[0] if keywords else title}。"),
            ("关键证据", f"精读/观察能决定理解的具体片段：{fact_one}。教师连续追问‘哪一句、哪一个动作或哪一个数据支持你的判断’，指导学生从印象转向证据。", f"圈画或标注支持判断的句子、动作、数据和图示，完成‘现象—证据—暂时结论’三栏记录，并提出一个反问。", "说、书", f"关于{title}的证据表，至少列出两条可回指材料。"),
            ("过程建模", f"把《{title}》的变化/方法拆成可复现步骤，重点处理‘{fact_two}’；用流程卡、实物或板书演示先后关系，并指出容易跳步的位置。", f"按顺序排列步骤卡或完成一次操作/朗读，使用‘先……再……最后……’说明过程，发现顺序错误后重新修正。", "弹、舞、书", f"{title}步骤链、操作记录或有停顿标记的朗读稿。"),
            ("合作辨析", f"提供两种不同解释或一个常见误区，围绕‘{profile.get('misconception', '只记住结论而忽略证据')}’组织小组比较；要求每组引用《{title}》中的关键词或材料。", f"分工查找证据，回应‘为什么’和‘如果改变条件会怎样’，把小组结论改写成带依据的完整句。", "说、画", f"小组观点卡、反例/条件表和一次依据修订。"),
            ("六艺表达", f"先明确《{title}》的学科任务，再让学生用所选六艺把‘{keyword_text}’转成朗读、动作、书写、图示或节奏表达；教师检查表达是否改变了事实。", f"完成一项指向《{title}》的六艺作品，并在展示时说明‘我的表达呈现了哪条证据、帮助我理解了什么’。", "说、书、画", f"一份能回指{title}事实的六艺作品及口头说明。"),
            ("结构回顾", f"以板书/概念图回扣《{title}》的‘{focus}’，将关键词、证据、结论和易错点放在同一条主线上；对遗漏的环节用追问补齐。", f"小组共同完成结构图，用两条证据解释核心结论，并根据同伴建议补写或删改一个节点。", "书、画", f"{title}结构图、关键词板书和修订痕迹。"),
            ("迁移评价", f"设计一个与《{title}》相似但条件略变的新情境，要求学生迁移课文中的方法/判断；明确哪些内容是教材事实，哪些是新的合理推断。", f"独立完成变式任务，写出‘我采用……因为……’的迁移句，依据评价表自评并提交修改稿。", "说、画", f"迁移任务答案、依据说明和一处自我修正。"),
            ("总结作业", f"回到课题《{title}》，用出口问题检查学生能否说出具体人物、词句、数据、步骤或概念，而不是只说‘我学会了’；布置分层作业并提醒版本差异按教材核对。", f"完成‘我在《{title}》中发现……证据是……我还想验证……’出口条，选择朗读、复述、图示或操作记录作为课后成果。", "说、书", f"出口条、课后作品和一条可核查的{title}证据。"),
        ]
    return []


def _math_lesson_type(profile: dict[str, Any]) -> str:
    explicit = str(profile.get("lesson_type", "")).strip()
    if explicit:
        return explicit
    title = str(profile.get("title", ""))
    if any(term in title for term in ("面积", "周长", "体积", "图形", "角", "圆", "三角形", "四边形")):
        return "图形公式课"
    if any(term in title for term in ("统计", "统计图", "平均数", "数据")):
        return "统计课"
    if any(term in title for term in ("解决问题", "应用", "租船", "植树", "鸡兔同笼")):
        return "问题解决课"
    if any(term in title for term in ("计算", "口算", "笔算", "乘法", "除法", "加法", "减法")):
        return "计算课"
    return "概念课"


def _build_math_stage_specs(profile: dict[str, Any]) -> list[tuple[str, str, str, str, str]]:
    """Build an executable mathematics sequence for an unfamiliar topic."""

    title = str(profile.get("title", "本课课题"))
    lesson_type = _math_lesson_type(profile)
    facts = [str(item) for item in profile.get("facts", []) if str(item).strip()]
    fact_one = facts[0][:320] if facts else f"教材中《{title}》的核心例题、图示或数量关系"
    fact_two = facts[1][:320] if len(facts) > 1 else fact_one
    fact_three = facts[2][:320] if len(facts) > 2 else fact_two
    keywords = [str(item) for item in profile.get("keywords", []) if str(item).strip()]
    keyword_text = "、".join(keywords[:6]) or title
    prior = "、".join(str(item) for item in profile.get("prior_knowledge", []) if str(item).strip())
    prior = prior or "与本课直接相关的已有概念、运算方法或操作经验"
    if lesson_type == "图形公式课":
        attempt = "画草图、测量或剪拼，把新图形转化为已经会求面积/长度的图形"
        representation = "实物操作—几何图形—对应量标注—数量关系—字母公式"
        boundary = "所选底和高是否对应、转化前后哪些量不变、公式系数和计量单位是否正确"
    elif lesson_type == "计算课":
        attempt = "先估算并尝试计算，用数形结合或算式分步解释每一步为什么成立"
        representation = "具体情境—数量关系图—分步算式—竖式/横式算法—逆运算或估算检验"
        boundary = "运算顺序、数位/计数单位、进退位或约分条件以及验算结果"
    elif lesson_type == "统计课":
        attempt = "确定要回答的问题，收集、分类和整理数据，再选择合适的表或图表示"
        representation = "真实问题—原始数据—统计表—统计图—基于数据的判断"
        boundary = "数据来源、分类标准、单位、图表刻度以及结论能否由数据支持"
    elif lesson_type == "问题解决课":
        attempt = "圈出条件和问题，画数量关系图，先独立列式再比较不同解法"
        representation = "生活情境—已知/未知—数量关系图—算式—结果检验与解释"
        boundary = "条件是否全部使用、数量关系是否匹配、答案是否符合生活实际"
    else:
        attempt = "对正例、反例和临界例进行分类，找共同特征并尝试写出概念定义"
        representation = "具体实例—分类表—共同属性—数学语言定义—符号表达"
        boundary = "定义中的必要条件、特殊值、反例以及数学语言是否完整"
    return [
        ("核心问题导入", f"呈现《{title}》教材中的具体例题、图示或生活问题，聚焦‘{fact_one}’，追问学生已经知道什么、还必须求证什么。", f"观察数据、图形或算式，标出已知与未知，写下一个初始猜想及理由，不先套用结论。", "说、画", f"《{title}》核心问题卡、已知未知标注和带理由猜想。"),
        ("旧知纵向连接", f"调动{prior}，设置一道最小复习题，追问这些旧知中的哪一步能支持解决《{title}》。", f"独立完成复习题，用箭头连接旧知与本课问题，并说明准备调用的概念、公式或操作经验。", "说、书", f"旧知检测、纵向联系图和一条方法选择理由。"),
        ("独立尝试", f"要求学生围绕‘{fact_one}’先独立{attempt}；教师只提供材料和记录表，不提前给出统一方法。", f"完成第一轮计算、测量、分类、画图或剪拼，保留原始过程，写出暂时结论和一个不确定点。", "弹、画、书", f"个人尝试稿、原始数据/图示和暂时结论。"),
        ("合作操作验证", f"组织小组比较不同尝试，选取一种方法验证‘{fact_two}’，连续追问‘每一步依据是什么、改变一个条件还成立吗’。", f"分工操作、计算、测量或分类，记录至少两组证据；发现冲突时回到材料复核并修改小组结论。", "说、弹、书", f"小组验证表、两组可复查证据和一次修订痕迹。"),
        ("多表征沟通", f"把《{title}》的发现按‘{representation}’依次板演，要求不同方法使用同一组{keyword_text}解释对应关系。", f"把自己的操作转换成图、表、算式和数学语言，向同伴逐步说明各表征如何指向同一结论。", "说、画、书", f"至少三种相互对应的数学表征和完整说理句。"),
        ("结论形成", f"基于证据归纳‘{fact_three}’，逐词检查结论中的对象、条件、数量关系和符号，不接受只背答案的表达。", f"用自己的话复述结论，再写成规范数学语言或公式；用一组具体数据、图形或正例进行代入验证。", "说、书", f"规范结论/公式、成立条件和一组验证过程。"),
        ("条件与易错诊断", f"围绕‘{profile.get('misconception', '只记结论而忽略成立条件')}’提供一个正例和三个错例，重点检查{boundary}。", f"逐题定位错误发生在哪一步，用定义、反例、估算或逆运算改正，并给同伴写一句可操作的纠错提示。", "说、画", f"错因分类表、改正过程和条件边界清单。"),
        ("分层练习", f"依次设置基础复现、条件变化和解释理由三层任务，题目必须直接使用《{title}》的{keyword_text}，反馈时同时核对答案与推理。", f"先独立作答，再按‘答案—依据—检验’三栏互评；错题订正时注明自己漏掉的条件或步骤。", "书、说", f"三层练习的答案、关键推理、检验和订正。"),
        ("开放迁移", f"设计一个改变数据、图形位置、表达方式或生活条件的新问题，要求学生判断《{title}》的方法是否仍适用并说明边界。", f"选择画图、列表、操作或算式解决新问题，比较两种方案，写出适用条件和一个还可继续研究的问题。", "画、说", f"迁移方案、两种方法比较和适用条件说明。"),
        ("结构总结", f"按‘问题—旧知—操作/计算—表征—结论—条件—检验’回顾《{title}》，用出口题检查学生是否真正会解释。", f"完成知识结构图和一道自编题，必须同时给出答案、关键推理与检验方法，并依据评价表修正。", "说、书、画", f"《{title}》结构图、自编题、答案、推理和检验。"),
    ]


def _topic_profile(context: dict[str, Any], references: list[dict[str, Any]]) -> dict[str, Any]:
    """Build concrete topic anchors used by both fallback and model prompts.

    The supplied examples contain rich, topic-specific procedures.  Keeping a
    compact profile avoids sending the whole DOCX to every response while
    ensuring that a fallback plan still talks about the actual lesson rather
    than only saying “围绕课题开展活动”.
    """

    title = _topic_name(context.get("title", ""))
    normalized = title.replace(" ", "")
    canonical = _canonical_topic_profile(title)
    subject_is_math = "数学" in str(context.get("subject", ""))
    # A converted textbook page is the strongest source for a lesson-specific
    # profile.  Use a canonical anchor only for stable pedagogy/material
    # defaults, while replacing its facts and focus with the retrieved PDF
    # wording so a new edition or an unfamiliar title is not answered with a
    # stale hand-authored example.
    textbook_facts = _textbook_facts(title, references)
    if subject_is_math and canonical and canonical.get("math_verified"):
        provided_summary = _topic_description(context.get("summary", ""), title)
        if provided_summary:
            canonical["teacher_context"] = provided_summary
            canonical["focus"] = f"{canonical['focus']} 教师补充情境（不改变已核验数学事实）：{provided_summary}"
        canonical["source"] = (
            "verified_math_anchor_with_textbook_pdf"
            if any(
                str(item.get("source_type", "")) == "教材PDF" and item.get("topic_match")
                for item in references
            )
            else "verified_math_anchor"
        )
        canonical["textbook_evidence"] = [
            {
                "source_file": item.get("source_file") or item.get("source_title"),
                "pdf_page": item.get("pdf_page"),
                "source_path": item.get("source_path"),
            }
            for item in references
            if str(item.get("source_type", "")) == "教材PDF" and item.get("topic_match")
        ]
        canonical["confidence"] = "high"
        return canonical
    if textbook_facts:
        profile = deepcopy(canonical) if canonical else {
            "title": title,
            "keywords": [title],
            "misconception": (
                f"学生可能只记住《{title}》的结论或计算步骤，忽略数学对象、成立条件、表征转换和检验过程。"
                if subject_is_math
                else f"学生可能只记住《{title}》的表层信息，忽略教材中的关键证据和过程。"
            ),
            "materials": (
                f"教材《{title}》的例题与练习、数学学习单、可操作学具、直尺/方格纸和展示材料。"
                if subject_is_math
                else f"教材《{title}》、教材插图/练习、学习单和六艺活动材料。"
            ),
            "homework": (
                f"完成《{title}》基础题、变式题和一道自编题，每题同时写答案、关键推理与检验方法。"
                if subject_is_math
                else f"再次阅读《{title}》，整理关键词和两条教材证据，向家人复述或解释本课主线。"
            ),
            "art_tasks": {key: f"把{ART_INFO[key]['activity']}落实到《{title}》的教材事实，并留下可检查作品" for key in ART_INFO},
        }
        profile["title"] = title
        profile["facts"] = textbook_facts
        profile["focus"] = "；".join(textbook_facts[:3])
        profile["source"] = "textbook_pdf_math_ocr" if subject_is_math else "textbook_pdf"
        profile["confidence"] = "medium" if subject_is_math else "high"
        if subject_is_math:
            profile["math_verification_required"] = True
        profile["textbook_evidence"] = [
            {
                "source_file": item.get("source_file") or item.get("source_title"),
                "pdf_page": item.get("pdf_page"),
                "source_path": item.get("source_path"),
            }
            for item in references
            if str(item.get("source_type", "")) == "教材PDF" and item.get("topic_match")
        ]
        if subject_is_math:
            profile["lesson_type"] = _math_lesson_type(profile)
            profile["stage_specs"] = _build_math_stage_specs(profile)
        else:
            profile["stage_specs"] = _build_topic_stage_specs(profile)
        if not profile.get("stage_weights"):
            profile["stage_weights"] = [2, 3, 3, 4, 5, 5, 5, 4, 4, 4]
        if not profile.get("compact_stage_indexes"):
            profile["compact_stage_indexes"] = [0, 1, 3, 6, 9]
        return profile
    if canonical:
        provided_summary = _topic_description(context.get("summary", ""), title)
        if provided_summary and provided_summary not in str(canonical.get("focus", "")):
            # Keep teacher-supplied details visible while distinguishing them
            # from the stable core anchor.  This lets a school-specific edition
            # or a teacher's lesson brief refine the generated plan without
            # silently treating it as an official quotation.
            canonical["focus"] = f"{canonical.get('focus', '')} 教师补充概述（请按教材核对）：{provided_summary}"
            canonical["facts"] = [
                f"教师补充概述（请按所用版本核对）：{provided_summary}",
                *list(canonical.get("facts", [])),
            ][:8]
            canonical["confidence"] = "high"
        return canonical
    if "小马过河" in normalized:
        return {
            "title": title,
            "focus": "小马帮妈妈驮麦子到磨坊，过河时先后听取松鼠和老牛的不同意见，最后在妈妈鼓励下亲自下河，明白遇事要动脑并通过实践判断，不能盲目听信别人。",
            "keywords": ["棚", "驮", "磨坊", "挡住了去路", "连蹦带跳", "很愿意", "为难", "老牛说水浅", "松鼠说水深", "愿、意、麦、伯"],
            "facts": [
                "情节链：帮妈妈送麦子→被小河拦住→松鼠说水深危险→老牛说水很浅→小马在妈妈鼓励下亲自尝试。",
                "人物对话形成明显冲突：松鼠个子小、感受深，老牛个子高、感受浅，意见都来自自身经验，不能直接代替小马的判断。",
                "低年级语文任务应落在识字、分角色朗读、圈画文本证据、复述情节和联系生活表达道理上。",
            ],
            "misconception": "学生容易把“听妈妈的话”或“河水既不深也不浅”当成故事唯一结论，忽略小马比较信息、亲自实践和独立判断的过程。",
            "materials": "课文第1—6自然段（或完整文本）、生字卡片“驮/磨坊/挡住”等、角色头饰、河流情境图、朗读评价单。",
            "target_detail": "认识“棚、驮、磨、坊、挡、伯、浅、叹、既、蹄、淹、唉、哩”13个生字，会写“愿、意、麦、伯”4个生字；正确、流利地朗读并标出8个自然段；能抓住“连蹦带跳、很愿意、为难”等词句，分角色读出老马亲切、小马高兴、老牛沉稳、松鼠焦急的语气；能借助“麦子—磨坊—小河—水浅/水深”复述故事开头。",
            "homework": "基础：把课文正确朗读3遍，把“愿、意、麦、伯”每字规范书写3遍；提升：根据“麦子—磨坊—小河—老牛—松鼠”向家人讲述故事；拓展：画一幅小马遇河四格图，并写出一个仍想验证的问题。",
            "art_tasks": {
                "说": "认读13个生字、分角色朗读老马/小马/老牛/松鼠对话，并借助关键词复述故事",
                "唱": "用“大马驮东西”等节奏顺口溜识记“驮、叹、棚”等易错字",
                "弹": "在轻柔田园背景音乐中朗读1—6自然段，依据语气变化进入角色",
                "舞": "用连蹦带跳、焦急劝阻、沉稳说明和犹豫收脚等动作表现人物心理",
                "书": "标出8个自然段，规范书写“愿、意、麦、伯”，完成情节关键词板书",
                "画": "绘制“送麦子—遇小河—两种意见—小马为难”的情节链或四格图",
            },
            "stage_weights": [2, 2, 7, 3, 4, 6, 6, 4, 3, 3],
            "compact_stage_indexes": [0, 2, 4, 6, 9],
            "stage_specs": [
                ("情境导入", "出示小马驮麦子来到小河边的插图，追问“如果你是小马，此时最担心什么？你会先问谁？”把学生生活中的解决困难经验引到故事冲突。", "观察插图，用“我担心……因为……”完整说出预测，并提出一个想从课文中验证的问题。", "说", "形成带理由的预测句和课堂问题。"),
                ("初读课文", "播放轻柔背景音乐，布置“读准字音、读通句子、标出自然段”的任务，提醒学生在第1—6自然段圈出小马遇到困难的句子，并核对全文8个自然段。", "借助拼音自由朗读，用铅笔标出8个自然段；同桌互读“马棚、驮起、磨坊、挡住、深浅”等词语，记录一个读音疑问。", "弹、书", "8个自然段标注、词语朗读记录和一处文本疑问。"),
                ("识字正音", "出示“棚、驮、磨、坊、挡、伯、浅、叹、既、蹄、淹、唉、哩”13个生字，先领读、开火车组词，再针对“棚/坊”的后鼻音、“浅/挡”的声调进行示范。", "逐字认读并给“驮、磨、挡、浅、叹”组词，在学习单上把易错字按音节分类，接受同伴指读和纠音。", "说", "13个生字认读表、组词卡和易错音纠正记录。"),
                ("梗概与关键词", "用填空支架追问“谁要把什么送到哪里？什么挡住了去路？老牛和松鼠分别怎么说？”把“麦子—磨坊—小河—水浅/水深”写成情节链。", "口头完成填空，按“送麦子→遇到小河→听到两种意见”复述故事开头，并把5个关键词写进情节图。", "说、书", "情节链、口头复述和关键词书写。"),
                ("品读1—2自然段", "抓住“连蹦带跳”“怎么不能”“很愿意”等词句，追问“小马为什么开心？老马的话应该用什么语气？”示范老马亲切商量、小马高兴肯定的朗读。", "圈画关键词，先说出小马的心情，再和同桌分角色朗读1—2自然段；用动作表现“连蹦带跳”，把一句话读出语气变化。", "说、舞、弹", "关键词圈画、角色朗读录音和角色情绪动作。"),
                ("深入理解3—6自然段", "引导学生朗读“一条小河挡住了去路”“我能不能过去呢”等句子，比较老牛“水很浅”和松鼠“水深得很”；追问“为什么同一条河得到两种答案？”", "找出老牛、松鼠、小马的原话，填写“角色—看到的现象—得出的判断”表；用体态演绎小马“立刻跑到河边、连忙收住脚步”的犹豫。", "说、舞", "观点比较表、文本证据线和小马为难的体态展示。"),
                ("规范写字", "出示“愿、意、麦、伯”四字，分别讲解“愿”的半包围、“意/麦”的上下结构和“伯”的左右结构；范写关键笔画，提醒坐姿、握笔和笔顺。", "观察田字格中的占位，书空后描红、临写，每字至少练写3遍；同伴依据“笔顺、结构、整洁”三项标准圈出一处优点和一处修改处。", "书、说", "四字书写作品、互评单和一次修改痕迹。"),
                ("板书回顾与检测", "用板书串起“送麦子→小河挡路→老牛水浅/松鼠水深→小马为难”，组织词语认读和梗概填空，追问“今天我们知道了什么，还留下什么问题？”", "读“马棚、驮起、磨坊、挡住、伯伯、深浅、叹气”等词，完成故事填空；用一句话说出下节课想验证的内容。", "说、书", "词语检测、梗概填空和一个待解决问题。"),
                ("总结作业", "回扣“遇到困难怎么办”，不提前替学生说出结论，布置分层任务：朗读课文3遍、四字各写3遍、向家人讲述故事，并说明下节课继续探究小马如何过河。", "用“我今天抓住了……我还想知道……”完成出口条，选择朗读、书写或讲故事中的一项向同伴展示。", "说、书", "出口条、朗读/书写/讲故事中的一项课后成果。"),
                ("迁移表达", "提供“同伴说法不一致”“第一次做实验遇到困难”等校园情境，要求学生用“先听取信息—再比较依据—最后亲自验证”说出判断步骤，并联系小马的经历。", "完成“我不会只听一个人的话，我会……”句式，画出小马过河四格图或写一张“我的判断三步法”卡片。", "画、说", "四格图/判断卡、迁移句和一条具体反思。"),
            ],
        }
    if "圆的认识" in normalized or ("圆" in normalized and "认识" in normalized):
        return {
            "title": title,
            "focus": "从生活中的车轮、硬币等圆形物体出发，通过圆规和绳钉作图、折叠测量与肢体站位，认识圆心、半径、直径，理解同一圆内半径相等、直径是半径的2倍以及“定点定长”决定一个圆。",
            "keywords": ["圆心O", "半径r", "直径d", "曲线围成的封闭图形", "定点", "定长", "同圆半径相等", "d=2r", "一中同长", "圆规"],
            "facts": [
                "圆心是圆的中心点，半径是从圆心到圆上任意一点的线段，同一圆内半径有无数条且长度相等。",
                "直径经过圆心并连接圆上两点，同一圆内直径有无数条，直径长度等于半径的2倍（d=2r）。",
                "规范画圆的关键是先定圆心、再定半径，保持圆规两脚距离不变并绕定点旋转；这是后续圆周长和面积学习的基础。",
            ],
            "misconception": "学生常把圆的边界当作“周长”而不能区分圆心、半径、直径，或画圆时边旋转边改变圆规开口，导致不能解释“一中同长”和d=2r。",
            "materials": "圆规、直尺、绳子和图钉、大小不同的圆形纸片、车轮或硬币图片、探究记录单、彩笔。",
            "target_detail": "能规范使用圆规按“定点—定长—旋转”画圆并标出圆心O、半径r、直径d；准确说出半径和直径的定义；通过折纸与测量发现同一圆内半径相等、直径相等并能运用d=2r；能用“一中同长”解释车轮为什么是圆形。",
            "homework": "基础：整理圆心、半径、直径定义并完成两道d=2r计算；提升：画一个半径4厘米的圆，标出O、r、d并写出画圆步骤；拓展：设计圆形对称纹样，选择车轮、井盖或风扇中的一个，用“一中同长”解释其结构。",
            "art_tasks": {
                "说": "用“经过圆心、两端在圆上”等数学语言辨析半径和直径，并解释车轮原理",
                "唱": "创编并节奏诵读“定点定长记心间，半径决定大和小，圆心就把位置安”",
                "弹": "规范操作圆规、绳子和图钉，保持定点定长完成精细作图",
                "舞": "用手臂旋转和学生站圆体验圆的曲线边界及“一中同长”",
                "书": "规范记录测量数据、d=2r关系以及O/r/d符号",
                "画": "画大小、位置不同的圆和半径4厘米的圆，完成圆形纹样设计",
            },
            "stage_weights": [4, 3, 4, 4, 4, 5, 4, 4, 4, 4],
            "compact_stage_indexes": [0, 1, 2, 6, 9],
            "stage_specs": [
                ("情境导入", "展示车轮、硬币和圆形建筑图片，提出“车轮为什么做成圆形？怎样把一个圆画得既圆又准确？”让学生先说生活经验，再保留猜想。", "观察并列举圆形物体，提出一个关于“圆怎样画、为什么稳定”的问题，初步说出直线图形与圆形的不同。", "说", "问题卡和生活实例清单。"),
                ("图形辨析", "出示三角形、正方形、长方形和圆，引导学生沿边界描画并追问“哪些图形由线段围成？圆的边界有什么不同？”规范表述圆是曲线围成的封闭图形。", "在记录单上给图形分类，用“线段/曲线、是否封闭”两个标准说明分类理由，并用手臂做一次连续旋转体验曲线边界。", "说、舞", "图形分类表和“圆是曲线围成的封闭图形”定义句。"),
                ("工具画圆", "示范硬币、杯口、绳子图钉和圆规四种方法，重点演示圆规“针尖固定一点、两脚保持同一距离、笔尖旋转一周”；展示开口改变导致的失败圆。", "先用一种生活物品描圆，再用圆规独立画两个大小不同的圆；在图上标出圆心，按“定点、定长、闭合”清单互相检查。", "弹、画", "两种画圆作品、操作检查表和一次修正记录。"),
                ("概念辨析", "从圆心O向圆上三点连线，指导学生测量并归纳半径；再出示经过/不经过O的线段，追问“怎样的线段才叫直径？”要求学生使用“经过圆心、两端在圆上”。", "测量3条半径和2条候选线段，在表格中标注r、d；对错误线段说出理由，完成“半径是……直径是……”定义句。", "说、书", "标注O/r/d的图、定义句和错误辨析理由。"),
                ("位置大小", "布置“给自行车车架画两个车轮”任务，引导比较大小、位置不同的圆；追问“圆心移动会改变什么？半径变长会改变什么？”", "画出两个位置、大小不同的圆，分别标出O、r；向同伴解释“圆心决定位置、半径决定大小”，完成一分钟数学说理。", "画、说", "两幅规范作图、位置/大小结论和说理记录。"),
                ("折纸测量", "让学生把圆形纸片连续对折，观察折痕交点；指导测量同一圆的多条半径和直径，记录数据并引出墨子“圆，一中同长也”。", "折纸找圆心，测量3条半径和2条直径，填写“长度是否相等”表格；站成圆圈或用手臂指向圆心，体会半径等长。", "弹、舞、书", "折痕交点、测量表、“一中同长”解释和具身体验记录。"),
                ("关系验证", "设置“半径3厘米，直径多少”“直径8厘米，半径多少”的变式题，要求先画线段再列关系；引导学生归纳同圆半径相等、d=2r。", "独立完成两道变式题，向同伴说明d=2r的图形依据；用不同颜色标出一条半径和一条直径。", "说、书", "变式题、关系式和带颜色标注的图。"),
                ("多工具创作", "要求学生用绳子图钉或圆规画半径4厘米的圆，标出O、r、d，再创编口诀“定点定长记心间……”，检查工具操作和数学符号书写。", "完成半径4厘米的圆，标注O/r/d并互检；小组朗读或改编圆规口诀，用一句话解释口诀中的“定点、定长”。", "弹、唱、书", "半径4厘米作图、符号标注、口诀和解释录音。"),
                ("生活迁移", "回到车轮图片，追问“车轴到轮缘的距离为什么要相等？”并拓展井盖、风扇、瓶盖等圆形物体，要求学生用“一中同长”而非“看起来一样”解释。", "选择一个生活物体，画示意图标出圆心和半径，写出“因为……所以……”的解释，并回应同伴的追问。", "说、画", "生活示意图、因果解释和同伴追问记录。"),
                ("总结自评", "用“我会画圆—我认识O/r/d—我能用d=2r—我能解释车轮”四句式回顾，依据学生作品进行描述性反馈，布置分层作业。", "完成概念关系图和出口条；基础层整理定义，巩固层完成测量题，拓展层设计圆形纹样并标出O/r/d。", "书、画", "关系图、出口条和分层作业。"),
            ],
        }

    # For an unfamiliar title, use the most topic-bearing sentences in the
    # retrieved sample/basis text.  This keeps generation grounded without
    # pretending that the server knows facts that were not retrieved.
    # A form may retain the default summary after the teacher changes only
    # the title.  Never treat that stale text as facts about the new lesson.
    summary = _topic_description(context.get("summary", ""), title)
    requirement = _topic_description(context.get("requirement", ""), title)
    terms = [part for part in re.findall(r"[\u4e00-\u9fff]{2,}", title) if len(part) >= 2]
    candidates: list[tuple[int, str]] = []
    exact_references = [item for item in references if item.get("topic_match")]
    evidence_references = exact_references or references
    for item in evidence_references:
        source_type = str(item.get("source_type", ""))
        topic_scoped = bool(item.get("topic_match"))
        raw_text = str(item.get("text", ""))
        sentence_units = _topic_evidence_sentences(raw_text, title)
        # Directly supplied summaries may be useful even when no exact title
        # block exists; for retrieved text, an empty evidence set is safer
        # than turning generic pedagogical prose into textbook facts.
        if not sentence_units:
            continue
        for sentence in sentence_units:
            # Generic theory chunks frequently contain several neighbouring
            # examples.  Once an exact case block is available, do not let a
            # sentence that names another lesson leak into this profile.
            if _has_other_lesson_title(sentence, title):
                continue
            score = 0
            if title and title in sentence:
                score += 10
            elif topic_scoped:
                # Continuation pieces were selected by _topic_evidence_sentences
                # from an exact-title case block.
                score += 6
            score += sum(2 for term in terms if term in sentence)
            if source_type == "课堂范本":
                score += 5
            if any(mark in sentence for mark in ("教学流程", "优质落地课堂", "具体课例", "案例1")):
                score += 4
            if len(sentence) >= 18:
                score += 1
            if score:
                candidates.append((score, sentence))
    candidates.sort(key=lambda pair: (pair[0], len(pair[1])), reverse=True)
    # ``requirement`` describes pedagogy (for example, "use visual
    # expression"), not textbook facts.  Keeping it out of ``facts`` prevents
    # a generic form requirement from becoming the lesson's supposed content.
    provided_facts = _sentences(summary)
    # A stale or mixed summary should never reintroduce a neighbouring lesson.
    provided_facts = [
        fact for fact in provided_facts
        if not _has_other_lesson_title(fact, title)
    ]
    facts = list(dict.fromkeys(provided_facts + [sentence for _, sentence in candidates]))[:6]
    facts = [fact for fact in facts if fact]
    focus = summary or (facts[0] if facts else f"从《{title}》的教材材料中提取具体人物、词句、数据、操作步骤或概念关系，建立‘观察/阅读—证据—解释—迁移’学习链。")
    user_phrases: list[str] = []
    for clause in re.split(r"[，,。；;！？!?]", summary):
        value = re.sub(r"^(?:引导学生|要求学生|学生能够|学生能|理解|体会|形成|掌握|认识|分析|探究|感受)", "", clause).strip()
        if 2 <= len(value) <= 18:
            user_phrases.append(value)
    keywords = list(dict.fromkeys([title] + user_phrases + terms))[:8]
    profile = {
        "title": title,
        "focus": focus,
        "keywords": keywords or [title],
        "facts": facts or [f"本课需要回到{title}的教材原文或学科材料寻找证据。"],
        "misconception": f"学生可能停留在对{title}的直观印象，尚未能用教材或操作证据说明自己的判断。",
        "materials": "教材原文、课件或实物材料、学习单、展示工具和所选六艺活动材料。",
        "target_detail": f"能围绕《{title}》准确提取{keyword_text if (keyword_text := '、'.join((keywords or [title])[:6])) else title}，用教材、操作或作品证据说明理解，完成一次复述/建模和一次变式迁移；版本敏感的字词、段落和数据请教师按手中教材核对。",
        "homework": f"基础：再次阅读《{title}》，整理关键词和至少两条原文/图示证据；提升：用情节链、概念图或步骤卡向家人讲清《{title}》；拓展：提出一个改变条件的新问题，先写预测，再说明需要怎样验证。",
        "art_tasks": {key: f"把{ART_INFO[key]['activity']}落实到《{title}》的关键词、证据或步骤，并留下可检查作品" for key in ART_INFO},
        "source": "user_summary_or_retrieval",
        "confidence": "medium" if facts else "low",
    }
    if subject_is_math:
        profile["lesson_type"] = _math_lesson_type(profile)
        profile["materials"] = "教材例题与练习、数学学习单、可操作学具、直尺/方格纸、错例卡和展示材料。"
        profile["target_detail"] = (
            f"能围绕《{title}》完成‘问题—旧知—尝试—验证—表征—结论—条件—检验’学习链，"
            f"准确使用{'、'.join(profile['keywords'][:6])}，每道练习同时写出答案、关键推理和检验方法；"
            "教材OCR中的分数、公式、数值和单位须由教师对照原页复核。"
        )
        profile["homework"] = f"完成《{title}》一题基础练习、一题条件变化题和一道自编题，分别写出答案、理由、检验与订正。"
        profile["stage_specs"] = _build_math_stage_specs(profile)
    else:
        retrieved_specs = _retrieved_stage_specs(title, facts, references)
        profile["stage_specs"] = retrieved_specs if len(retrieved_specs) >= 4 else _build_topic_stage_specs(profile)
    profile["stage_weights"] = [2, 3, 3, 4, 5, 5, 5, 4, 4, 4]
    profile["compact_stage_indexes"] = [0, 1, 3, 6, 9]
    return profile


def _add_profile_reference(
    references: list[dict[str, Any]], profile: dict[str, Any], subject: str | None = None
) -> list[dict[str, Any]]:
    """Expose an honest source marker when a built-in topic anchor is used.

    A canonical lesson can be generated even when the local DOCX collection
    has no matching title.  Showing that fact in the references panel is
    clearer than presenting an unrelated six-arts theory document as if it
    supplied the story details.
    """

    source = str(profile.get("source", ""))
    confidence = str(profile.get("confidence", "medium"))
    trusted_math_source = source in {"verified_math_anchor", "verified_math_anchor_with_textbook_pdf"}
    if source != "canonical_textbook_anchor" and not trusted_math_source and confidence != "low":
        return references
    topic = _normalized_topic_text(profile.get("title", ""))
    if source == "canonical_textbook_anchor" or trusted_math_source:
        marker_title = f"内置教材课题锚点：{profile['title']}"
        marker_type = (
            "人工核验数学课题画像"
            if trusted_math_source
            else "常见教材核心情节（请按版本核对）"
        )
        marker_text = "；".join([str(profile.get("focus", "")), *[str(item) for item in profile.get("facts", [])]])
    else:
        marker_title = f"未检索到《{profile['title']}》的教材事实"
        marker_type = "需要教师提供教材片段或填写内容概述"
        marker_text = (
            f"知识库没有找到与《{profile['title']}》直接匹配的教材事实。"
            "当前教案只能依据教师输入的课题/概述生成教学任务；请在使用前核对教材原文、插图、数据和操作步骤。"
        )
    if any(str(item.get("source_title", "")) == marker_title for item in references):
        return references
    marker = {
        "chunk_id": f"topic-anchor-{topic or 'unknown'}",
        "source_title": marker_title,
        "source_type": marker_type,
        "subject": str(subject or profile.get("subject") or "通用"),
        "score": 100.0,
        "text": marker_text,
    }
    return [marker, *references]


def _build_sixarts_competencies(
    context: dict[str, Any],
    profile: dict[str, Any],
    selected_arts: list[str],
) -> list[dict[str, str]]:
    """Turn each six-arts dimension into a topic task and visible product."""

    title = str(profile.get("title") or context.get("title") or "本课内容")
    keywords = [str(item).strip() for item in profile.get("keywords", []) if str(item).strip()]
    keyword_text = "、".join(keywords[:5]) or title
    subject = str(context.get("subject", ""))
    selected = set(selected_arts)
    raw_tasks = profile.get("art_tasks") if isinstance(profile.get("art_tasks"), dict) else {}

    if "数学" in subject:
        defaults = {
            "说": f"围绕{keyword_text}按“答案—依据—条件—检验”完成数学说理，并回应同伴追问",
            "唱": f"在确有记忆需要时，把《{title}》的关键条件或步骤编成节奏短句，并逐句解释数学含义",
            "弹": f"规范使用《{title}》所需学具、直尺、方格纸或计算工具，按顺序操作并记录数据",
            "舞": f"仅在空间关系适用时，用站位、旋转、平移或对称动作建立《{title}》模型，再转译为图或算式",
            "书": f"规范书写《{title}》的算式、公式、单位、推理链和验算，保留一次错因订正",
            "画": f"用几何图、线段图、数轴、表格或流程图呈现《{title}》的数量关系并完整标注",
        }
    elif "语文" in subject:
        defaults = {
            "说": f"围绕{keyword_text}完成有依据的朗读、复述或观点表达，并回指具体词句",
            "唱": f"把《{title}》中适合节奏诵读的关键词句处理为短句，读出语气并解释词句作用",
            "弹": f"按《{title}》的情节、字词或表达任务操作卡片与材料，准确控制顺序和停顿",
            "舞": f"用克制的角色动作或空间站位呈现《{title}》的人物行动、情感变化或结构关系",
            "书": f"规范书写《{title}》的重点字词，完成带原文依据的批注、情节链或表达练习",
            "画": f"绘制《{title}》的情节图、人物关系图或文本证据图，并用关键词标注",
        }
    else:
        defaults = {
            "说": f"使用{keyword_text}清楚说明《{title}》的现象、证据和结论，并回应质疑",
            "唱": f"在适合记忆时把《{title}》的关键步骤或概念编成节奏短句，并解释其含义",
            "弹": f"规范操作《{title}》所需工具或材料，记录步骤、变化和异常现象",
            "舞": f"在确有具身建模价值时，用动作和空间关系呈现《{title}》的过程或结构",
            "书": f"规范记录《{title}》的关键词、观察数据、证据解释和修订结论",
            "画": f"用流程图、概念图或示意图呈现《{title}》的证据链和结构关系",
        }

    products = {
        "说": f"一段包含{keyword_text}的完整表达、同伴追问回应和一次语言修正",
        "唱": "一份节奏文本或录音，以及逐句对应的学科含义说明",
        "弹": "一张操作检查单、过程记录和能够复查的结果",
        "舞": "一个动作/空间模型及其对应的图示或学科语言解释",
        "书": f"一份规范书写的《{title}》学习单、推理记录和订正痕迹",
        "画": f"一幅标注完整的《{title}》图示，以及口头或书面的图意说明",
    }
    generic_markers = ("落实到《", "嵌入“", "教材事实，并留下", "关键词、证据或步骤")
    goals: list[dict[str, str]] = []
    for key in ART_INFO:
        task = str(raw_tasks.get(key, "")).strip()
        if not task or any(marker in task for marker in generic_markers):
            task = defaults[key]
        task = task.rstrip("。；")
        ability = task if task.startswith(("能", "能够")) else f"能{task}"
        emphasis = "重点目标" if key in selected else "拓展目标（仅在适合课题时）"
        goals.append(
            {
                "key": key,
                "text": (
                    f"{emphasis}：{ability}；形成{products[key]}，并说明该表达或操作怎样帮助自己理解《{title}》，"
                    "而不是只完成形式展示。"
                ),
            }
        )
    return goals


def _core_fusion_rows(
    context: dict[str, Any],
    profile: dict[str, Any],
    selected_arts: list[str],
    detailed: bool,
) -> list[dict[str, str]]:
    """Build the topic-specific table used by the design core-fusion section."""

    title = str(profile.get("title") or context.get("title") or "本课")
    subject = str(context.get("subject") or "")
    raw_tasks = profile.get("art_tasks") if isinstance(profile.get("art_tasks"), dict) else {}
    keys = list(ART_INFO) if detailed else [key for key in selected_arts if key in ART_INFO]
    if not keys:
        keys = ["说", "书", "画"]
    rows: list[dict[str, str]] = []
    for key in keys:
        task = str(raw_tasks.get(key) or "").strip()
        if not task or any(marker in task for marker in ("嵌入", "教材事实，并留下", "关键词、证据或步骤")):
            if "数学" in subject:
                defaults = {
                    "说": f"用数学语言说明《{title}》的答案、依据、条件和检验",
                    "唱": f"把《{title}》的关键条件或步骤编成节奏短句并解释含义",
                    "弹": f"规范操作《{title}》所需学具，记录过程和数据",
                    "舞": f"用空间站位、旋转或对称动作建立《{title}》模型",
                    "书": f"结构化记录《{title}》的算式、单位、推理和订正",
                    "画": f"用图表、数轴或几何图呈现《{title}》的数量关系",
                }
            elif "语文" in subject:
                defaults = {
                    "说": f"围绕《{title}》进行有证据的朗读、复述或观点表达",
                    "唱": f"用节奏诵读强化《{title}》的关键词句和语气",
                    "弹": f"按《{title}》的情节或字词任务操作学习材料",
                    "舞": f"用克制的角色动作呈现《{title}》的人物行动和情感",
                    "书": f"规范书写《{title}》重点字词并完成文本批注",
                    "画": f"绘制《{title}》情节图或人物关系图并标注证据",
                }
            else:
                defaults = {
                    "说": f"清楚说明《{title}》的现象、证据和结论",
                    "唱": f"用节奏短句记忆《{title}》的关键步骤或概念",
                    "弹": f"规范操作《{title}》所需工具并记录变化",
                    "舞": f"用动作和空间关系呈现《{title}》的过程或结构",
                    "书": f"结构化记录《{title}》的关键词、证据和结论",
                    "画": f"用示意图或概念图呈现《{title}》的证据链",
                }
            task = defaults[key]
        # Hand-authored profiles sometimes use a short task label such as
        # “角色对话与成长复述”.  Make the table independently meaningful by
        # tying that label to the requested lesson title (or one of its
        # concrete anchors), rather than leaving a generic-looking row.
        if title not in task and not any(
            str(keyword).strip() and str(keyword).strip() in task
            for keyword in profile.get("keywords", [])
        ):
            task = f"围绕《{title}》{task}"
        rows.append(
            {
                "key": key,
                "dimension": key,
                "fusion_point": task.rstrip("。；"),
                "evidence": ART_INFO[key]["evidence"],
                "focus": "重点融合" if key in selected_arts else "拓展关注",
            }
        )
    return rows


def _design_teacher_rows(
    context: dict[str, Any], profile: dict[str, Any], selected_arts: list[str]
) -> list[dict[str, str]]:
    """Return teacher-goal rows matching the four-column sample table."""

    title = str(profile.get("title") or context.get("title") or "本课")
    subject_word = (
        "数学"
        if "数学" in str(context.get("subject") or "")
        else "语文"
        if "语文" in str(context.get("subject") or "")
        else "学科"
    )
    art_text = "、".join(selected_arts) or "说、书、画"
    groups = (
        (
            "1.践行师德",
            "师德规范/教育情怀",
            "1.2职业认同、2.2专业信念",
            f"以亲切、专业的语言组织《{title}》学习，传递{subject_word}学科育人价值，营造敢于表达和尝试的课堂氛围。",
        ),
        (
            "2.学会教学",
            "学科素养/教学能力/课程整合",
            "3.1专业学科、4.1主教学科、5.1课程整合",
            f"准确处理《{title}》的核心知识与教材证据，围绕目标组织任务，并让{art_text}服务学科理解而非形式展示。",
        ),
        (
            "3.学会育人",
            "班级指导/综合育人",
            "6.1班级常规、6.2发展指导、7.2活动育人",
            f"有序组织《{title}》中的合作、操作和表达活动，为不同基础学生提供可进入、可展示、可改进的路径。",
        ),
        (
            "4.学会发展",
            "学会反思/沟通合作",
            "8.1文明底蕴、9.2合作技能",
            f"依据学生在《{title}》中的作品、表达和过程记录进行反馈，组织同伴互评并形成下一轮改进。",
        ),
    )
    return [
        {"一级指标": level, "二级指标": second, "三级指标": third, "本课达成目标": target}
        for level, second, third, target in groups
    ]


def _design_method_rows(
    context: dict[str, Any], profile: dict[str, Any], selected_arts: list[str]
) -> list[dict[str, str]]:
    """Create concise, executable teaching-method/fusion-strategy rows."""

    title = str(profile.get("title") or context.get("title") or "本课")
    arts = selected_arts or ["说", "书", "画"]
    joined = "、".join(arts)
    rows = [
        ("情境任务法", f"用《{title}》的具体材料或问题引出学习任务", "说、画", "4.1 主教学科"),
        ("证据探究法", f"回到《{title}》文本、图示、数据或操作记录寻找依据", "书、画、弹", "3.1 专业学科；4.1 主教学科"),
        ("合作表达法", f"小组比较不同理解，使用{joined}呈现并回应同伴追问", joined, "9.2 合作技能"),
        ("表现性评价法", "依据内容准确、证据清楚、表达完整三项标准即时反馈", joined, "4.2 教学实践"),
    ]
    return [
        {
            "教学方法": name,
            # The supplied lesson-plan exemplars use this exact three-column
            # table heading.  Keep the longer strategy explanation as an
            # auxiliary field for exports/clients that want more detail.
            "六艺侧重（学生）": focus,
            "对应教师三学会指标": indicator,
            "策略说明": description,
        }
        for name, description, focus, indicator in rows
    ]


def _build_design_sections(
    context: dict[str, Any],
    profile: dict[str, Any],
    selected_arts: list[str],
    detailed: bool,
    *,
    textbook_analysis: str,
    learner_analysis: str,
    target_detail: str,
    goals_text: str,
    difficulty_text: str,
    method_text: str,
    materials_text: str,
) -> list[dict[str, Any]]:
    """Return the canonical five-block teaching-design schema.

    Legacy design.modules remains in the response for older clients. New
    clients should consume this normalized sections list.
    """

    fusion_rows = _core_fusion_rows(context, profile, selected_arts, detailed)
    competency_rows = _build_sixarts_competencies(context, profile, selected_arts)
    subject_goal = target_detail.strip() or goals_text.split("\n", 1)[0].strip()
    if not subject_goal:
        subject_goal = f"围绕《{profile.get('title') or context.get('title') or '本课'}》完成可观察、可评价的学科学习任务。"
    if "数学" in str(context.get("subject") or ""):
        values_goal = "在解决真实问题、解释依据和修正错误的过程中形成严谨、合作、敢于验证的学习态度。"
    elif "语文" in str(context.get("subject") or ""):
        values_goal = "在朗读、交流和文本证据辨析中感受语言之美，形成尊重他人、独立思考和乐于合作的品质。"
    else:
        values_goal = "在观察、实践、表达和反思中形成尊重证据、主动合作和持续探究的态度。"
    return [
        {
            "key": "教材与学情分析",
            "title": "教材与学情分析",
            "blocks": [
                {"key": "教材分析", "title": "教材分析", "type": "text", "content": textbook_analysis},
                {"key": "学情分析", "title": "学情分析", "type": "text", "content": learner_analysis},
                {
                    "key": "核心六艺融合点",
                    "title": "核心六艺融合点",
                    "type": "table",
                    "columns": ["六艺维度", "本课融合点" if detailed else "课堂精准融合落点"],
                    "rows": [
                        {
                            "六艺维度": row["dimension"],
                            "本课融合点": row["fusion_point"],
                            "课堂精准融合落点": row["fusion_point"],
                            **row,
                        }
                        for row in fusion_rows
                    ],
                },
            ],
        },
        {
            "key": "教学目标",
            "title": "教学目标",
            "blocks": [
                {"key": "学科知识与技能", "title": "（一）学科知识与技能（指向学生）", "type": "text", "content": subject_goal},
                {
                    "key": "六艺素养目标",
                    "title": "（二）六艺素养目标（指向学生）",
                    "type": "table",
                    "columns": ["六艺维度", "具体表现"],
                    "rows": [
                        {"六艺维度": row["key"], "具体表现": row["text"], **row}
                        for row in competency_rows
                    ],
                },
                {"key": "情感态度价值观", "title": "（三）情感态度价值观（指向学生）", "type": "text", "content": values_goal},
                {
                    "key": "教师教学目标",
                    "title": "（四）教师教学目标（指向“践行三学会”毕业要求）",
                    "type": "table",
                    "columns": ["一级指标", "二级指标", "三级指标", "本课达成目标"],
                    "rows": _design_teacher_rows(context, profile, selected_arts),
                },
            ],
        },
        {
            "key": "教学重点与难点",
            "title": "教学重点与难点",
            "type": "text",
            "content": difficulty_text,
            "blocks": [{"key": "教学重点与难点", "title": "教学重点与难点", "type": "text", "content": difficulty_text}],
        },
        {
            "key": "教学方法与六艺活动策略",
            "title": "教学方法与六艺活动策略",
            "type": "table",
            "columns": ["教学方法", "六艺侧重（学生）", "对应教师三学会指标"],
            "rows": _design_method_rows(context, profile, selected_arts),
            "blocks": [{
                "key": "教学方法与六艺活动策略",
                "title": "教学方法与六艺活动策略",
                "type": "table",
                "columns": ["教学方法", "六艺侧重（学生）", "对应教师三学会指标"],
                "rows": _design_method_rows(context, profile, selected_arts),
            }],
        },
        {
            "key": "教学准备",
            "title": "教学准备",
            "type": "text",
            "content": materials_text or method_text,
            "blocks": [{"key": "教学准备", "title": "教学准备", "type": "text", "content": materials_text or method_text}],
        },
    ]


def _stage_heading(title: Any, index: int, time: Any) -> str:
    """Format a visible process heading like the supplied detailed samples."""

    raw = str(title or "教学环节").strip()
    raw = re.sub(r"^环节\s*[一二三四五六七八九十0-9]+\s*[:：]\s*", "", raw)
    raw = re.sub(r"\s*[（(]约?\s*\d+(?:\.\d+)?\s*分钟[）)]\s*$", "", raw)
    raw = re.sub(r"\s*[（(]\s*\d+(?:\.\d+)?\s*分钟[）)]\s*$", "", raw)
    aliases = {
        "情境导入": "新课引入——谈话激趣",
        "初读文本": "初读感知——整体把握",
        "初读课文": "初读感知——整体把握",
        "识字正音": "识字教学——多元识记",
        "识字词语": "字词学习——读准读通",
        "梗概与关键词": "整体感知——梳理梗概",
        "发现困难": "关键情节——发现问题",
        "品读1—2自然段": "细读感悟——品读文本",
        "朗读转折": "品读课文——体会表达",
        "深入理解3—6自然段": "深入理解——突破难点",
        "办法操作": "探究方法——操作验证",
        "实验验证": "实验探究——验证结论",
        "因果复述": "结构表达——因果复述",
        "规范写字": "写字教学——规范书写",
        "规范书写与板书": "书写指导——规范表达",
        "板书回顾与检测": "课堂练习——巩固检测",
        "总结作业": "课堂总结——回顾梳理",
        "总结迁移": "课堂总结——迁移应用",
        "迁移表达": "学以致用——迁移表达",
        "图形辨析": "动手操作——图形辨析",
        "工具画圆": "动手操作——规范作图",
        "概念辨析": "自主探究——概念辨析",
        "位置大小": "动手操作——位置与大小",
        "折纸测量": "实验探究——折纸测量",
        "关系验证": "变式练习——关系验证",
        "多工具创作": "综合实践——多工具创作",
        "生活迁移": "回归生活——应用拓展",
        "总结自评": "总结回顾——六艺自评",
        # Generic mathematics/topic profiles use these phase names.  Keep
        # their headings equally readable instead of exposing an internal
        # profile label verbatim.
        "核心问题导入": "新课引入——核心问题",
        "旧知纵向连接": "旧知回顾——建立联系",
        "独立尝试": "自主探究——独立尝试",
        "合作操作验证": "合作探究——操作验证",
        "多表征沟通": "多表征表达——说清依据",
        "结论形成": "概念归纳——形成结论",
        "条件与易错诊断": "错例辨析——明确条件",
        "分层练习": "分层练习——巩固方法",
        "开放迁移": "学以致用——开放迁移",
        "结构总结": "课堂总结——结构回顾",
        "词语与概念": "字词概念——联系语境",
        "关键证据": "精读研判——提取证据",
        "过程建模": "过程建模——复现步骤",
        "合作辨析": "合作辨析——比较观点",
        "六艺表达": "综合表达——成果展示",
        "结构回顾": "课堂总结——结构回顾",
        "迁移评价": "拓展评价——迁移应用",
    }
    raw = aliases.get(raw, raw)
    numerals = "一二三四五六七八九十"
    number = numerals[index] if 0 <= index < len(numerals) else str(index + 1)
    minute = str(time or "").strip() or "待定"
    # Keep the visible heading stable across model output and captured drafts.
    # Samples use ``约2分钟`` (without a space); extracting the numeric part
    # also prevents a value such as ``环节一：...（约2 分钟）`` from nesting
    # when a plan is rendered more than once.
    duration_match = re.search(r"(\d+(?:\.\d+)?)\s*分钟", minute)
    if duration_match:
        minute = f"{duration_match.group(1)}分钟"
    elif "分钟" not in minute:
        minute = f"{minute}分钟"
    if "——" not in raw and "—" not in raw and "-" not in raw:
        raw = raw.replace("，", "——", 1) if "，" in raw else raw
    return f"环节{number}：{raw}（约{minute}）"


def _build_process_stage_table(stage: dict[str, Any]) -> dict[str, Any]:
    """Normalize one stage to the five-column sample table."""

    columns = ["教学步骤", "教师行为", "学生活动", "学生六艺聚焦", "教师行为对应三学会指标"]
    art = str(stage.get("art_key") or stage.get("art_label") or "说").strip()
    art_activity = str(stage.get("art_activity") or "围绕本课任务进行表达").strip()
    indicator = str(stage.get("teacher_indicator") or "依据课堂证据进行反馈与调整").strip()
    teacher_default = str(stage.get("teacher") or "").strip()
    student_default = str(stage.get("student") or "").strip()

    def _short(value: Any, limit: int = 220) -> str:
        text = re.sub(r"\s+", " ", str(value or "")).strip()
        return text if len(text) <= limit else text[: limit - 1] + "…"

    def _body(step: Any) -> tuple[str, str]:
        text = _short(step, 260)
        match = re.match(r"^(教师任务|学生任务|证据核验|六艺表达|修改提交)\s*[：:]?\s*(.*)$", text)
        return (match.group(1), match.group(2).strip()) if match else ("教学任务", text)

    # Prefer an explicitly supplied table (for model/refinement callers), but
    # still repair missing cells so every row remains useful in the browser.
    source = stage.get("table") if isinstance(stage.get("table"), dict) else {}
    source_rows = source.get("rows") if isinstance(source.get("rows"), list) else []
    source_columns = [str(item).strip() for item in source.get("columns", [])] if isinstance(source.get("columns"), list) else []

    def _source_value(row: Any, names: tuple[str, ...], position: int = 0) -> str:
        if isinstance(row, (list, tuple)):
            # Array rows from older DOCX-shaped responses sometimes order the
            # columns as 教师行为、教师指标、学生行为、学生六艺渗透.  Resolve
            # by the declared header whenever possible before using the
            # canonical positional fallback.
            for name in names:
                if name in source_columns:
                    column_index = source_columns.index(name)
                    if column_index < len(row):
                        return _short(row[column_index])
            return _short(row[position] if position < len(row) else "")
        if isinstance(row, dict):
            for name in names:
                if row.get(name) not in (None, ""):
                    return _short(row.get(name))
        return ""

    if source_rows:
        step_values = source_rows[:8]
    else:
        steps = stage.get("steps") if isinstance(stage.get("steps"), list) else []
        step_values = [item for item in steps if str(item).strip()][:8]
    if not step_values:
        step_values = ["核心任务"]

    rows: list[dict[str, str]] = []
    for index, raw_step in enumerate(step_values):
        if source_rows:
            label = _source_value(raw_step, ("教学步骤", "步骤", "step"), 0)
            teacher = _source_value(raw_step, ("教师行为", "教师活动", "teacher"), 1)
            student = _source_value(raw_step, ("学生活动", "学生行为", "student"), 2)
            row_indicator = _source_value(raw_step, ("教师行为对应三学会指标", "教师指标", "teacher_indicator"), 4)
            # A source row can carry a useful fifth-column art description;
            # the canonical art selected for this stage must still win.
        else:
            role, body = _body(raw_step)
            role_labels = {
                "教师任务": "任务导入",
                "学生任务": "自主完成",
                "证据核验": "证据核验",
                "六艺表达": "六艺表达",
                "修改提交": "互评修正",
            }
            # Keep the first column scannable like the DOCX exemplars; the
            # full, topic-specific wording belongs in the teacher/student
            # behavior cells below.
            label = role_labels.get(role, _short(body or role, 100))
            if role in {"教师任务", "证据核验", "六艺表达", "修改提交"}:
                teacher = body or teacher_default
            else:
                teacher = teacher_default or body
            if role in {"学生任务", "六艺表达", "修改提交"}:
                student = body or student_default
            elif role == "证据核验":
                student = "对照评价标准核验成果，补充教材、图示、数据或操作依据。"
            else:
                student = student_default or body
            row_indicator = ""
        if not label:
            label = f"环节任务{index + 1}"
        label = re.sub(r"^\s*\d+\s*[.．、)]\s*", "", label)
        if not teacher:
            teacher = teacher_default or "教师组织任务并依据课堂证据进行反馈。"
        if not student:
            student = student_default or "学生完成任务并提交可观察学习成果。"
        if not row_indicator:
            row_indicator = indicator
        rows.append(
            {
                "教学步骤": _short(f"{index + 1}. {label}", 110),
                "教师行为": _short(teacher),
                "学生活动": _short(student),
                "学生六艺聚焦": f"{art}：{_short(art_activity, 150)}",
                "教师行为对应三学会指标": _short(row_indicator),
            }
        )
    return {"columns": columns, "rows": rows}


def _build_process_evaluation_tables(
    context: dict[str, Any], profile: dict[str, Any], selected_arts: list[str], detailed: bool
) -> dict[str, Any]:
    """Build the three evaluation blocks shown after process tables."""

    title = str(profile.get("title") or context.get("title") or "本课")
    arts = selected_arts or ["说", "书", "画"]
    art_text = "、".join(arts)
    standards = {
        "1.2": "A：教态亲切、语言专业并激发学习兴趣；B：语言规范；C：反馈笼统；D：语言不当。",
        "2.2": "A：持续传递学科育人价值；B：有明确鼓励；C：主要完成流程；D：缺少育人指向。",
        "3.1": "A：学科概念准确并能联系证据；B：基本准确；C：有少量错误；D：存在严重错误。",
        "4.1": "A：目标、任务、评价一致且重难点突破清楚；B：流程完整；C：环节缺漏；D：组织混乱。",
        "5.1": f"A：六艺活动自然服务《{title}》任务；B：有整合尝试；C：整合生硬；D：无有效整合。",
        "5.2": "A：跨学科资源有明确证据用途；B：有简单联系；C：联系弱；D：强行拼接。",
        "6.1": "A：活动规则清晰、秩序稳定；B：基本有序；C：提醒较多；D：课堂失序。",
        "6.2": "A：支架适配不同学生并促进发展；B：有分层支持；C：支持不足；D：未关注差异。",
        "7.2": f"A：学生在活动中建构《{title}》的理解；B：活动有效；C：活动与目标脱节；D：无活动证据。",
        "8.1": "A：能依据学生证据反思并提出下一步；B：有反思；C：反思笼统；D：无反思。",
        "9.2": "A：合作分工、回应和互评具体有效；B：能组织合作；C：合作流于形式；D：无合作设计。",
    }
    indicator_art = {
        "1.2": "说", "2.2": "说", "3.1": "说、书", "4.1": art_text,
        "5.1": art_text, "5.2": "画", "6.1": "书", "6.2": "舞",
        "7.2": "舞、弹", "8.1": "书、说", "9.2": "说、弹",
    }
    indicator_dimension = {
        "1.2": ("师德规范", "1.2 职业认同"), "2.2": ("教育情怀", "2.2 专业信念"),
        "3.1": ("学科素养", "3.1 专业学科"), "4.1": ("教学能力", "4.1 主教学科"),
        "5.1": ("课程整合", "5.1 课程整合"), "5.2": ("课程整合", "5.2 跨科整合"),
        "6.1": ("班级指导", "6.1 班级常规"), "6.2": ("班级指导", "6.2 发展指导"),
        "7.2": ("综合育人", "7.2 活动育人"), "8.1": ("学会反思", "8.1 文明底蕴"),
        "9.2": ("沟通合作", "9.2 合作技能"),
    }
    groups = {
        "践行师德维度": ["1.2", "2.2"],
        "学会教学维度": ["3.1", "4.1", "5.1", "5.2"],
        "学会育人维度": ["6.1", "6.2", "7.2"],
        "学会发展维度": ["8.1", "9.2"],
    }
    teacher_dimensions: list[dict[str, Any]] = []
    for dimension, keys in groups.items():
        rows = []
        for key in keys:
            second, third = indicator_dimension[key]
            rows.append(
                {
                    "二级指标": second,
                    "三级指标": third,
                    "对应六艺": indicator_art[key],
                    "评价标准（观察教师行为）": standards[key],
                    "等级": "A B C D",
                    "举证描述": "",
                }
            )
        teacher_dimensions.append(
            {
                "title": dimension,
                "description": f"观察《{title}》课堂中教师的具体行为，记录可核查事实，不以学生分数替代教师证据。",
                "columns": ["二级指标", "三级指标", "对应六艺", "评价标准（观察教师行为）", "等级", "举证描述"],
                "rows": rows,
            }
        )
    levels = [
        ("1.践行师德", "师德规范", "1.2 职业认同", "说"),
        ("1.践行师德", "教育情怀", "2.2 专业信念", "说"),
        ("2.学会教学", "学科素养", "3.1 专业学科", "说、书"),
        ("2.学会教学", "教学能力", "4.1 主教学科", art_text),
        ("2.学会教学", "课程整合", "5.1 课程整合", art_text),
        ("3.学会育人", "班级指导", "6.1 班级常规", "书"),
        ("3.学会育人", "班级指导", "6.2 发展指导", "舞"),
        ("3.学会育人", "综合育人", "7.2 活动育人", "舞、弹"),
        ("4.学会发展", "学会反思", "8.1 文明底蕴", "书、说"),
        ("4.学会发展", "沟通合作", "9.2 合作技能", "说、弹"),
    ]
    summary_rows = [
        {
            "一级指标": level,
            "二级指标": second,
            "三级指标": third,
            "对应六艺": art,
            "达成自评": "□达成 □待改进",
            "举证说明": "",
        }
        for level, second, third, art in levels
    ]
    student_rows = []
    for key in (list(ART_INFO) if detailed else arts):
        info = ART_INFO.get(key, {})
        student_rows.append(
            {
                "六艺维度": key,
                "评价等级（A/B/C/D）": "A B C D",
                "评价标准描述": f"A：{info.get('evidence', '表现具体且能说明意义')}；B：能参与并完成任务；C：需要提示；D：未参与或无法完成。",
                "学生典型表现（举证记录）": "",
            }
        )
    return {
        "title": "六艺·三学会融合教师课堂教学评价表",
        "description": "先依据四个教师行为维度记录可核查课堂事实，再使用综合达成统计表和学生六艺量表完成闭环评价。教师三学会指标用于评价教师行为，六艺指标用于评价学生表现，二者不混用。",
        "teacher_dimensions": teacher_dimensions,
        "teacher_summary": {
            "title": "六艺·三学会教师行为综合达成统计表",
            "description": "本表用于课后自我反思或教研组听评课，统计教师行为在各三级指标上的达成情况，要求达成标准可观察、可测量、可举证。",
            "columns": ["一级指标", "二级指标", "三级指标", "对应六艺", "达成自评", "举证说明"],
            "rows": summary_rows,
        },
        "student_rubric": {
            "title": "学生六艺素养评价量表（课堂观察用）",
            "description": f"观察学生在《{title}》课堂中的六艺表现，重点记录与学科任务直接相关的语言、操作、动作、书写或作品证据。",
            "columns": ["六艺维度", "评价等级（A/B/C/D）", "评价标准描述", "学生典型表现（举证记录）"],
            "rows": student_rows,
        },
    }


def _fallback_plan(payload: dict[str, Any], references: list[dict[str, Any]], warning: str | None = None) -> dict[str, Any]:
    context = _context(payload)
    arts = context["arts"]
    art_names = "、".join(arts)
    detailed = context["detail_level"] == "detailed"
    profile = _topic_profile(context, references)
    if not warning and str(profile.get("confidence", "medium")) == "low":
        warning = (
            f"知识库未检索到《{profile.get('title', context['title'])}》的直接教材事实；"
            "当前内容是依据课题信息生成的教学框架，请先按实际教材核对并补充原文、插图、数据或实验步骤。"
        )
    elif not warning and profile.get("math_verification_required"):
        warning = (
            f"已定位《{profile.get('title', context['title'])}》教材页面，但该课题尚无人工核验数学画像；"
            "教案已过滤明显OCR噪声，公式、分数线、运算符、图形标注、数值和单位仍须对照教材原页复核。"
        )
    facts = profile["facts"]
    facts_text = "；".join(facts[:3])
    keyword_text = "、".join(profile["keywords"][:8])
    target_detail = profile.get("target_detail") or f"准确理解{profile['title']}的核心内容，能够使用{keyword_text}中的关键词完成表达、操作或作品。"
    profile_homework = profile.get("homework") or f"基础作业：整理“{profile['title']}”的关键词和一条证据；拓展作业：选择一种六艺表达方式制作学习卡。"
    subject_is_language = "语文" in context["subject"]
    subject_is_math = "数学" in context["subject"]
    art_tasks = profile.get("art_tasks", {})
    if subject_is_math:
        math_art_tasks = {
            "说": f"围绕{keyword_text}完成逐步数学说理，说明答案、依据、条件和检验",
            "唱": f"仅在适合记忆《{profile['title']}》步骤或条件时节奏诵读，诵读后必须解释数学含义",
            "弹": f"规范使用学具、直尺、方格纸或计算工具完成《{profile['title']}》的操作与测量",
            "舞": f"仅在空间关系确有需要时用站位、旋转、平移或对称动作建立《{profile['title']}》模型",
            "书": f"规范书写《{profile['title']}》的算式、公式、单位、推理链和验算过程",
            "画": f"用线段图、几何图、数轴、表格或流程图呈现《{profile['title']}》的数量关系",
        }
        art_lines = "；".join(
            f"{key}：{art_tasks.get(key) or math_art_tasks[key]}，产出必须能核查数学答案与推理"
            for key in arts
        )
    else:
        # Keep nested activity construction outside an f-string expression
        # so the module parses on Python 3.10/3.11 as well.
        art_lines_parts = []
        for key in arts:
            info = ART_INFO.get(key, {})
            task = art_tasks.get(key) or f"把{info.get('activity', '艺术活动')}嵌入“{profile['title']}”的具体任务"
            evidence = info.get("evidence", "可观察的学习证据")
            art_lines_parts.append(f"{key}：{task}，要求学生留下{evidence}")
        art_lines = "；".join(art_lines_parts)
    if subject_is_language:
        learner_analysis = (
            f"{context['grade']}学生对“{profile['title']}”已有故事或生活经验，但容易只复述情节、凭印象下结论，"
            f"不能主动从文本中圈画证据。课堂以“读准—圈画—朗读—复述—迁移”为支架，针对{profile['misconception']}，"
            "给表达不完整的学生提供句式和词语卡，给基础较好的学生增加证据比较和开放表达。"
        )
    elif subject_is_math:
        prior_text = "、".join(str(item) for item in profile.get("prior_knowledge", []) if str(item).strip()) or "本课所需旧知"
        learner_analysis = (
            f"{context['grade']}学生已经学习{prior_text}，具备进入“{profile['title']}”的知识和操作基础，但容易出现：{profile['misconception']}"
            "课堂先做最小旧知检测，再让学生独立尝试，经过操作/计算、图示、算式和数学语言之间的多表征转换形成结论；"
            "基础层获得分步操作卡和半成品图，发展层必须解释每一步依据，拓展层处理反例、条件变化和开放题。"
        )
    else:
        learner_analysis = (
            f"{context['grade']}学生对“{profile['title']}”有初步经验，但需要把直观感受转化为可验证的学科表达。"
            f"课堂围绕“{profile['focus']}”提供材料、同伴协作和分层支架，要求每个结论都附有教材、操作或作品证据。"
        )
    if context.get("student_analysis"):
        learner_analysis = f"教师提供的实际学情：{context['student_analysis']}\n{learner_analysis}"
    if subject_is_math and profile.get("board"):
        board = str(profile["board"])
    elif "小马过河" in profile["title"]:
        board = (
            "板书分为三栏：左栏写课题并画出小马、松鼠、老牛和小河的简笔图；中栏按“遇到问题→听到不同意见→亲自尝试”"
            "排列情节链，在“水深/水浅”旁标注“经验不同”；右栏写“遇事要动脑，亲自试一试”，并保留学生用文本证据补充的关键词。"
        )
    elif "圆的认识" in profile["title"]:
        board = (
            "板书以课题“圆的认识”为中心：左侧画规范圆并标出圆心O、半径r、直径d；中部写“定点—定长—旋转”和"
            "“同一圆内半径相等、d=2r”；右侧记录学生用车轮或创意图案解释“一中同长”的证据，底部回扣“圆规画圆的关键”。"
        )
    elif subject_is_math:
        board = (
            f"板书以“{profile['title']}”为题，左栏写核心问题和已知/未知，中栏按“旧知→操作或计算→图/表→算式→结论”"
            f"呈现多表征推理链，使用{keyword_text}标出对象和条件；右栏列正例、反例、检验方法和分层练习答案，"
            "公式、数值和单位均对照教材原页核验，底部由学生补写一条‘结论在什么条件下成立’。"
        )
    else:
        board = (
            f"板书以“{profile['title']}”为中心，左侧呈现核心材料或问题，中部按“{keyword_text}—证据—结论”"
            "建立主线，右侧保留六艺活动中的关键词、图示或作品标准，底部写一句学生共同归纳的迁移结论。"
        )
    prior_text = "、".join(str(item) for item in profile.get("prior_knowledge", []) if str(item).strip())
    next_text = "、".join(str(item) for item in profile.get("next_knowledge", []) if str(item).strip())
    if subject_is_math:
        design_concept = (
            f"本课按小学数学{_math_lesson_type(profile)}组织“具体问题—旧知唤醒—独立尝试—操作/计算验证—多表征沟通—结论与条件—分层迁移”。"
            f"{art_names}只承担数学说理、规范操作、图示建模或算式记录功能，每项六艺活动都要回到《{profile['title']}》的答案、依据和检验，"
            "不单设与数学目标无关的表演。学生先产生真实解法，再比较、修正和概括，教师依据计算单、测量表、图示或说理句进行即时调控。"
        )
        textbook_analysis = (
            f"{context['edition']}{context['subject']}《{profile['title']}》属于{_math_lesson_type(profile)}。已有基础：{prior_text or '需按教材单元核对'}；"
            f"本课核心：{facts_text}；后续连接：{next_text or '本单元后续计算、图形或问题解决学习'}。"
            f"教学不能停留在记忆结论，而要沿“{'—'.join(profile.get('representation_path', ['情境', '操作/计算', '图表', '算式', '数学语言']))}”建立表征联系，"
            "每个公式、数值、单位和成立条件均以人工校验画像或教材原页为准，原始OCR只用于定位页码。"
        )
        goal_content = (
            f"1. 知识技能：{target_detail}\n"
            "2. 数学思考：经历独立尝试、操作/计算验证和多表征转换，能说清结论从哪里来、在什么条件下成立。\n"
            "3. 问题解决：完成基础、变式和开放任务，每题同时提交答案、关键推理与检验；能诊断并修正至少一类典型错误。\n"
            f"4. 六艺融合：用{art_names}服务数学说理、图示、书写或精细操作，作品必须准确呈现《{profile['title']}》的对象、关系和条件。"
        )
        method_content = (
            f"采用核心问题驱动、独立尝试、操作/计算验证、多表征沟通、错例诊断和分层练习。{profile['materials']}"
            "教师课前核对教材原页中的分数线、运算符、图形标注、数据与单位，准备‘答案—依据—检验’三栏学习单；"
            "课堂材料按基础、发展、拓展三层发放，所有操作都规定材料、步骤、记录方式和最终数学结论。"
        )
    else:
        design_concept = f"本课以“以艺育德·以美润教”为总原则，精选{art_names}服务于“{profile['focus']}”。学科知识始终是主线：先让学生接触具体材料、提出问题，再通过{art_names}完成表达、操作或创作，最后回到{profile['title']}的证据和结论。六艺活动不做装饰性展示，每项活动都必须产出可观察的语言、动作、书写或作品，并在同伴互评后修正。"
        textbook_analysis = f"{context['edition']}{context['subject']}“{profile['title']}”的核心内容可落实为：{facts_text}。本课不是泛泛介绍课题，而是围绕“{profile['focus']}”安排连续任务，依次完成{keyword_text}等关键学习点。教材处理遵循“情境进入—证据提取—概念/情节建构—迁移应用”，为后续单元学习和真实生活表达建立基础。"
        goal_content = f"1. 学科目标：{target_detail}\n2. 证据目标：经历观察/阅读、提出猜想、合作验证、表达修正和迁移应用，至少形成两份可核查学习记录。\n3. 六艺目标：在{art_names}活动中完成具体成果，能说明该成果如何帮助理解{profile['title']}，并根据评价标准改进一次。\n4. 育人目标：从{profile['title']}的学习中形成与真实生活相连的判断、合作或审美体验。"
        method_content = f"采用情境任务、证据研读/操作探究、合作表达、表现性评价和迁移反思五步法。{profile['materials']}教师课前将学习单分为“发现—证据—结论—迁移”四栏，准备分层提示卡和展示评价表；学生明确每一阶段要提交的口头、书面或作品成果。"
    modules = [
        {"title": "设计理念", "content": design_concept},
        {"title": "教材分析", "content": textbook_analysis},
        {"title": "学情分析", "content": learner_analysis},
        {"title": "核心六艺融合点", "content": art_lines},
        {"title": "教学目标", "content": goal_content},
        {"title": "教学重点与难点", "content": f"重点：用教材或操作证据建构“{profile['title']}”的核心理解，准确使用{keyword_text}。\n难点：{profile['misconception']}教师要追问“你的依据在哪里”“换一种情境还成立吗”，把{art_names}的感性体验转化为可评价、可迁移的学科成果。"},
        {"title": "教学方法与准备", "content": method_content},
    ]
    if subject_is_math or subject_is_language:
        modules.append({"title": "板书设计", "content": board})
    if detailed:
        if subject_is_math:
            practice_items = profile.get("practice", [])
            practice_text = "\n".join(
                f"{index + 1}. [{item.get('level', '练习')}] 题目：{item.get('prompt', '')} 答案：{item.get('answer', '')} 关键推理：{item.get('reasoning', '')}"
                for index, item in enumerate(practice_items)
                if isinstance(item, dict)
            ) or (
                f"1. 基础题：复现《{profile['title']}》核心方法，写答案、步骤和检验。\n"
                "2. 变式题：改变一个条件，说明原方法是否适用并给理由。\n"
                "3. 开放题：自编一道同类题，给出答案、关键推理和纠错点。"
            )
            modules.extend([
                {"title": "关键问题链", "content": f"核心问：《{profile['title']}》要解决的具体数学问题是什么？旧知问：{prior_text or '哪些已有概念或方法'}怎样支持本课？探究问：你的计算、测量、剪拼或分类证据是什么？表征问：实物/动作、图表、算式和数学语言怎样一一对应？结论问：{keyword_text}中的对象、关系和条件分别是什么？诊断问：换一个数据、位置或特殊值，结论还成立吗？检验问：能否用估算、逆运算、代入、反例或重新操作核查？"},
                {"title": "分层练习设计", "content": practice_text},
                {"title": "分层支持与课堂调控", "content": f"基础层提供步骤卡、半成品图、可操作学具和‘我先……因为……所以……再用……检验’句式；发展层必须比较两种表征并解释{keyword_text}的关系；拓展层处理特殊值、反例或开放设计。教师按‘答案是否正确—依据是否充分—条件是否完整—检验是否有效’四点观察；出现只报答案时要求补算式或图示，出现OCR式错误符号时立即回到教材原页和人工校验画像。"},
                {"title": "作业与课后延伸", "content": f"{profile_homework} 所有题目均需保留答案、关键推理、检验和一次订正；在家庭或校园中寻找一个与《{profile['title']}》结构相同的数学问题，记录真实数据并说明适用条件。"},
            ])
        else:
            modules.extend([
                {"title": "关键问题链", "content": f"导入问：关于“{profile['title']}”你已经知道什么、还想验证什么？探究问：材料中的哪一句、哪一个数据或哪一次操作支持你的判断？辨析问：如果换一个角色、条件或情境，结论是否仍成立？表达问：如何用{arts[0]}把证据讲给同伴听？迁移问：生活中哪里还需要使用“{profile['title']}”形成的判断方法？"},
                {"title": "分层支持与课堂调控", "content": f"基础层提供关键词卡、句式“我观察到……证据是……所以……”和示范样例；发展层要求比较两条证据并说明差异；拓展层要求提出反例或新情境。教师重点观察学生是否真正使用{keyword_text}，若出现“只说感受不举证”，立即回到材料圈画或操作记录；若六艺活动挤占学科时间，则保留一次高质量展示，删去重复表演。"},
                {"title": "作业与课后延伸", "content": f"{profile_homework} 课堂延伸要求学生在真实生活中寻找一个与“{profile['title']}”相似的问题，记录自己的判断、依据和改进，并保留作品或口头讲述记录。"},
            ])
    if not detailed:
        keep = {"设计理念", "教材分析", "学情分析", "核心六艺融合点", "教学目标", "教学重点与难点", "板书设计", "分层练习设计"}
        modules = [module for module in modules if module["title"] in keep]
    default_specs = [
        ("情境导入", f"以{profile['title']}的真实材料或问题导入，明确本课要解决的核心问题“{profile['focus']}”。", "观察/阅读材料，提出一个猜想，并用一句话说明自己的理由。", arts[0], f"形成关于{profile['title']}的初始问题和理由。"),
        ("核心探究", f"引导学生围绕“{profile['facts'][0]}”圈画、测量或操作，示范如何把直观发现记录为证据。", "独立完成第一轮阅读或操作，在学习单上记录发现、证据和暂时结论。", arts[1 % len(arts)], "提交一份带证据的学习记录，至少使用一个关键词。"),
        ("合作表达", f"组织小组比较不同答案，追问“哪些证据支持或反驳这个判断”，并指导学生用{arts[2 % len(arts)]}进行二次表达。", "分工整理材料，回应同伴质疑，修改小组结论并完成展示。", arts[2 % len(arts)], "形成小组海报、口头说明或表演作品。"),
        ("迁移练习", f"提供一个改变条件的新情境，要求学生把“{profile['title']}”的关键方法迁移过去，并针对常见误区进行反例辨析。", "独立完成变式任务，说明自己选择的方法和依据，再根据反馈修正。", arts[0], "完成一项变式任务并写出理由。"),
        ("总结与作业", f"回扣“{profile['focus']}”，用出口条检查学生是否能把活动体验转成学科语言，布置面向真实受众的{arts[-1]}作品。", "用“我学会了……证据是……我还想……”完成自评，带走可展示的课后任务。", arts[-1], "提交出口条、学习卡或课后作品。"),
    ]
    all_specs = profile["stage_specs"] or default_specs
    all_weights = profile.get("stage_weights") or [0.12, 0.28, 0.26, 0.2, 0.14]
    if not detailed and len(all_specs) > 5:
        indexes = profile.get("compact_stage_indexes") or [0, 1, len(all_specs) // 2, len(all_specs) - 2, len(all_specs) - 1]
        specs = [all_specs[index] for index in indexes if 0 <= index < len(all_specs)]
        weights = [all_weights[index] for index in indexes if 0 <= index < len(all_weights)]
    else:
        specs = all_specs
        weights = all_weights
    if len(weights) != len(specs):
        weights = [1.0] * len(specs)
    minutes_by_stage = _allocate_minutes(context["duration"], weights)
    stages = []
    for index, (title, teacher_core, student_core, spec_art, spec_evidence) in enumerate(specs):
        minutes = minutes_by_stage[index]
        matched_arts = [key for key in arts if key in spec_art]
        # Each process card has one canonical primary art.  The previous
        # implementation placed all matched dimensions in the penetration
        # sentence while the UI displayed only the first one, which made a
        # header such as “说” disagree with a body mentioning “舞/弹”.
        art_candidates = matched_arts or arts
        art = art_candidates[index % len(art_candidates)]
        stage_art_names = art
        evidence_prompt = (
            f"你的结论对应{keyword_text}中的哪一点？算式、数据、图形、操作或检验依据在哪里？"
            if subject_is_math
            else f"你的结论对应{keyword_text}中的哪一点？原文、数据、图示或操作依据在哪里？"
        )
        penetration_verbs = (
            "用一段可回指文本证据的完整表达",
            "用节奏、停顿或声音变化强化关键词记忆",
            "用规范操作记录过程、变化和结果",
            "用动作或空间关系呈现人物行动/数量关系",
            "用结构化书写固定概念、步骤与反思",
            "用图示、关系图或分镜呈现证据链",
        )
        penetration_action = penetration_verbs[index % len(penetration_verbs)]
        steps = [
            f"教师任务：{teacher_core}",
            f"学生任务：{student_core}",
            f"证据核验：对照“{spec_evidence}”检查成果，教师追问“{evidence_prompt}”",
            f"六艺表达：使用{art}完成{ART_INFO[art]['activity']}，{penetration_action}，并说明它怎样帮助理解{profile['title']}，不能只做展示。",
            "修改提交：同伴按照“内容准确、依据清楚、表达完整”指出一处亮点和一处修改建议，学生修正后提交阶段成果。",
        ]
        if not detailed:
            steps = steps[:3]
        stages.append({
            "title": title,
            "time": f"{minutes} 分钟",
            "art_key": art,
            "art_label": art,
            "art_activity": ART_INFO[art]["activity"],
            "teacher": f"{teacher_core}教师在巡视时重点检查学生是否使用{keyword_text}说明理由，发现“只报答案/只说感受”时，用“{evidence_prompt}”补足证据。",
            "student": (
                f"{student_core}随后把个人发现转成可复查的图、表、算式、数学说理或操作记录，并完成答案与检验。"
                if subject_is_math
                else f"{student_core}随后完成{ART_INFO[art]['activity']}，把个人发现转成可以朗读、展示、书写或操作复现的成果。"
            ),
            "penetration": f"{art}融合不是附加表演：本环节用{ART_INFO[art]['activity']}服务《{profile['title']}》的{title}任务，要求学生{penetration_action}，留下{ART_INFO[art]['evidence']}；本环节重点证据为：{spec_evidence}",
            "evidence": f"{spec_evidence}；同时观察{ART_INFO[art]['evidence']}。",
            "intention": f"通过“任务—证据—表达—修正”把{art}的表现转化为理解{profile['title']}的学科证据，解决“{profile['misconception']}”，并为下一环节提供可比较的成果。",
            "teacher_indicator": f"{TEACHER_INDICATORS[index % len(TEACHER_INDICATORS)]['observable']}；本环节具体观察学生是否能围绕{keyword_text}作出有依据的表达。",
            "steps": steps,
            "materials": profile["materials"],
            "question_chain": f"{teacher_core}→依据是什么→怎样修改或迁移到新情境？",
            "expected_output": spec_evidence,
        })
    rows = [
        {"key": key, "dimension": ART_INFO[key]["ability"], "observable": f"能在“{profile['title']}”任务中{ART_INFO[key]['evidence']}，并使用{keyword_text}说明依据", "evidence": f"{ART_INFO[key]['activity']}的过程记录或作品，能够对应{profile['title']}的关键证据", "target": "重点达成" if key in arts else "拓展关注"}
        for key in (ART_INFO if detailed else arts)
    ]
    if subject_is_math:
        self_assessment = [
            f"我能写出《{profile['title']}》练习的答案，并用图、表、算式或操作说明关键推理。",
            f"我能说清{keyword_text}中的对象、关系和成立条件，并用代入、估算、逆运算、反例或重新操作进行检验。",
            "我能定位自己的错误属于概念、条件、计算、符号还是单位问题，并保留一次订正。",
        ]
        reflection_prompts = [
            f"哪些学生已经建立《{profile['title']}》的操作/情境、图表、算式和数学语言联系，证据分别是什么？",
            f"哪些学生仍出现“{profile['misconception']}”，是旧知、表征转换还是条件意识造成的？",
            "分层练习中的答案、关键推理和检验是否都被评价；哪项六艺活动需要进一步压缩形式、强化数学用途？",
        ] if detailed else []
        extension = (
            f"在家庭或校园中寻找一个与《{profile['title']}》同结构的问题，记录真实数据，给出图示/算式、答案、"
            "关键推理、检验和适用条件；涉及教材公式、分数、数值或单位时须对照原页核验。"
        )
    else:
        self_assessment = [
            f"我能用{arts[0]}清楚表达自己对{profile['title']}的理解，并指出至少一条{keyword_text}相关证据。",
            f"我能根据同伴或教师反馈，修改关于{profile['title']}的作品、表达或记录。",
        ]
        reflection_prompts = [
            f"哪些学生证据最能说明他们真正理解了“{profile['focus']}”，而不是只记住结论？",
            f"哪些学生仍然存在“{profile['misconception']}”的表现？下一课如何调整支架？",
            "哪一项六艺活动需要减少形式、增加学科追问？",
        ] if detailed else []
        extension = f"面向真实受众展示“{profile['title']}”学习成果，保留过程记录、作品和学生反思；鼓励把课堂形成的判断方法迁移到家庭或校园中的新问题。"
    stages = _normalize_sixarts_process_stages(stages, context, profile)
    # Expose a canonical display heading and the five-column table represented
    # by each stage.  Keep the original flat fields for legacy clients.
    for index, stage in enumerate(stages):
        stage["heading"] = _stage_heading(stage.get("title"), index, stage.get("time"))
        stage["table"] = _build_process_stage_table(stage)
    design_sections = _build_design_sections(
        context,
        profile,
        arts,
        detailed,
        textbook_analysis=textbook_analysis,
        learner_analysis=learner_analysis,
        target_detail=target_detail,
        goals_text=goal_content,
        difficulty_text=f"重点：围绕《{profile['title']}》准确完成{keyword_text}相关的核心任务，并提交可回指教材或操作记录的学习成果。\n难点：{profile['misconception']}需要通过具体证据、变式情境和同伴互评把理解落实为可观察表现。",
        method_text=method_content,
        materials_text=f"教师准备：{profile.get('materials', '')}；学生准备：教材、学习单、记录工具及{art_names}活动所需材料。",
    )
    process_evaluation_tables = _build_process_evaluation_tables(context, profile, arts, detailed)
    result = {
        "title": f"{context['title']}教学设计",
        "version": context["detail_level"],
        "context": context,
        "design": {
            "modules": modules,
            "sections": design_sections,
            "schema_version": 2,
            "competencies": _build_sixarts_competencies(context, profile, arts),
            "fusion_score": min(96, 70 + len(arts) * 5 + (5 if context["requirement"] else 0)),
            "fusion_breakdown": [{"label": label, "value": value} for label, value in [("目标一致性", 90), ("活动可实施", 86), ("学生参与度", 88), ("育人价值", 92)]],
        },
        "process": {
            "stages": stages,
            "schema_version": 2,
            "evaluation_tables": process_evaluation_tables,
        },
        "evaluation": {
            "rows": rows,
            "teacher_rows": TEACHER_INDICATORS if detailed else [],
            "self_assessment": self_assessment,
            "reflection_prompts": reflection_prompts,
            "homework": profile_homework,
            "extension": extension,
            **({"practice": profile.get("practice", [])} if subject_is_math else {}),
            # Keep these aliases under evaluation as well; older frontends
            # render evaluation separately from the process timeline.
            **process_evaluation_tables,
        },
        "references": _reference_metadata(references),
        "warning": warning,
    }
    if subject_is_math:
        return _normalize_math_plan_value(result, str(profile.get("title", context["title"])))
    return result


def _prompt(context: dict[str, Any], references: list[dict[str, Any]]) -> str:
    profile = _topic_profile(context, references)
    detail = (
        "详细版：采用《圆的认识-六艺融合教学设计_详案_new.docx》的章节与表格布局，"
        "页面与导出依次展示设计理念、教材分析、学情分析、核心六艺融合点、教学目标、教学重难点、教学方法、教学准备八章。"
        "为兼容接口仍按下方JSON sections结构返回，设计理念放入modules；核心六艺融合点逐维度写明确的活动说明；"
        "教学目标含学科知识与技能文字、六艺素养目标两列表格、情感态度价值观文字和教师教学目标四列表格；教学方法使用三列表格。"
        "教学过程每阶段依次提供教师活动、学生活动、学生六艺渗透、教学步骤、设计意图、学习证据、教师指标、材料、学生产出。"
        "复杂探究通过细分步骤与子环节表达，steps中以‘（一）子环节·1.具体步骤’标记，页面将呈现环节/具体步骤两列表格；"
        "简单环节用顺序列表。每一步的教师提问、学生预期回应仍需在table.rows中保留。"
        "模板只决定布局，不得把圆的认识中的概念、数学活动或示例的语文学科核心要求复制到其他课题。"
        "教学过程必须逐项覆盖课题画像中的全部样例对应环节，不得把识字、品读、写字、作图、测量等不同任务合并成泛化的‘核心探究’；"
        "画像有9—10个环节时必须全部返回。每阶段必须写4—5条可执行步骤；教师活动不少于150个汉字，学生活动不少于100个汉字，"
        "并明确教师提问、学生预期回应、材料、学习产出、六艺渗透、学习证据、设计意图和教师指标。"
        "每个设计模块不少于200个汉字，全文应达到可直接执教的详案粒度；评价同时区分学生六艺表现与教师教学行为，并给出至少3条学生自评、3条教师反思提示。"
        if context["detail_level"] == "detailed"
        else "简洁版：按上述五个顶层块保留可直接执行的教材与学情分析、目标、重难点、方法策略和准备；核心融合点、六艺目标和教师目标使用表格。教学过程固定五个阶段，"
        "每阶段教师活动不少于70个汉字、学生活动不少于55个汉字，并写出一个具体问题和一个学生产出；评价只呈现用户选择的重点六艺，不能删除三页结构。"
    )
    profile_text = json.dumps(
        {
            "课题": profile["title"],
            "课题主线": profile["focus"],
            "关键事实": profile["facts"],
            "关键词": profile["keywords"],
            "易错点": profile["misconception"],
            "材料建议": profile["materials"],
            "目标细节": profile.get("target_detail", ""),
            "课后任务": profile.get("homework", ""),
            "画像来源": profile.get("source", "user_summary_or_retrieval"),
            "画像置信度": profile.get("confidence", "medium"),
            "样例对应环节": profile["stage_specs"],
        },
        ensure_ascii=False,
    )
    def _reference_label(item: dict[str, Any]) -> str:
        label = f"{item['source_title']}（{item['source_type']}）"
        page = item.get("pdf_page")
        source_path = item.get("source_path")
        if page not in (None, ""):
            label += f"，PDF第{page}页"
        if source_path:
            label += f"，路径：{source_path}"
        return label

    reference_text = "\n\n".join(
        f"【{index + 1}】{_reference_label(item)}\n{str(item.get('text', ''))[:4200]}"
        for index, item in enumerate(references)
    )
    json_shape = (
        '{"title":"...","version":"concise 或 detailed","design":{"sections":['
        '{"key":"教材与学情分析","blocks":[{"key":"教材分析","type":"text","content":"..."},'
        '{"key":"学情分析","type":"text","content":"..."},{"key":"核心六艺融合点","type":"table",'
        '"columns":["六艺维度","本课融合点"],"rows":[]}]},'
        '{"key":"教学目标","blocks":[{"key":"学科知识与技能","type":"text","content":"..."},'
        '{"key":"六艺素养目标","type":"table","columns":["六艺维度","具体表现"],"rows":[]},'
        '{"key":"情感态度价值观","type":"text","content":"..."},{"key":"教师教学目标",'
        '"type":"table","columns":["一级指标","二级指标","三级指标","本课达成目标"],"rows":[]}]},'
        '{"key":"教学重点与难点","type":"text","content":"..."},'
        '{"key":"教学方法与六艺活动策略","type":"table","columns":["教学方法","六艺侧重（学生）","对应教师三学会指标"],"rows":[]},'
        '{"key":"教学准备","type":"text","content":"..."}],"modules":[]},'
        '"process":{"stages":[{"title":"情境导入","heading":"环节一：新课引入——谈话激趣（约2分钟）","time":"2 分钟",'
        '"teacher":"...","student":"...","penetration":"...","steps":[],"table":{"columns":[],"rows":[]}}],'
        '"evaluation_tables":{"teacher_dimensions":[],"teacher_summary":{"columns":[],"rows":[]},'
        '"student_rubric":{"columns":[],"rows":[]}}},'
        '"evaluation":{"rows":[],"teacher_rows":[],"teacher_dimensions":[],"teacher_summary":{"columns":[],"rows":[]},'
        '"student_rubric":{"columns":[],"rows":[]},"self_assessment":[],"reflection_prompts":[],"homework":"...","extension":"..."}}'
    )
    return f"""请只返回合法 JSON，不要 Markdown 代码围栏。不要自行编造文件名，服务器会根据真实检索结果补齐 references。

课程信息：{json.dumps(context, ensure_ascii=False)}
课题画像：{profile_text}
课题化硬约束：正文必须点名《{profile['title']}》的具体人物、词句、数据、图示或操作；每阶段形成可检查产出；六艺活动必须服务学科任务。
参考资料：
{reference_text}
资料边界：只有课题匹配资料才能作为事实；版本敏感内容请教师按教材核对。
{detail}
{json_shape}"""


def _model_refinement_prompt(context: dict[str, Any], references: list[dict[str, Any]]) -> str:
    """Build a compact model task over the complete local RAG plan.

    The local plan already contains every design module and teaching stage.
    Repeating the entire document through the relay caused long responses to
    time out, so the model contributes only topic-specific refinements that
    ``_merge_plan`` overlays onto the grounded plan.
    """

    profile = _topic_profile(context, references)
    all_specs = profile.get("stage_specs", [])
    if context["detail_level"] == "concise" and len(all_specs) > 5:
        indexes = profile.get("compact_stage_indexes") or [0, 1, len(all_specs) // 2, len(all_specs) - 2, len(all_specs) - 1]
        specs = [all_specs[index] for index in indexes if 0 <= index < len(all_specs)]
    else:
        specs = all_specs
    stage_outline: list[dict[str, Any]] = []
    for index, spec in enumerate(specs):
        if not isinstance(spec, (list, tuple)) or not spec:
            continue
        stage_outline.append(
            {
                "index": index + 1,
                "title": str(spec[0]),
                "expected_output": str(spec[4]) if len(spec) > 4 else "",
            }
        )

    evidence_candidates = [
        item
        for item in references
        if item.get("source_type") == "教材PDF" or item.get("topic_match")
    ]
    if not evidence_candidates:
        evidence_candidates = references
    evidence = []
    for item in evidence_candidates[:3]:
        label = f"{item.get('source_title', '未命名资料')}（{item.get('source_type', '依据资料')}）"
        if item.get("pdf_page") not in (None, ""):
            label += f"，PDF第{item['pdf_page']}页"
        if "数学" in str(context.get("subject", "")):
            if item.get("source_type") == "数学样例":
                evidence_text = "仅参考数学课堂环节组织方式；不得把该样例中的其他课题事实、错误公式或数据移植到本课。"
            elif profile.get("math_verified"):
                evidence_text = "该页用于出处核查；数学事实、公式、数值和单位以课题画像中的人工核验内容为准，勿直接读取OCR表达式。"
            else:
                evidence_text = _normalize_math_ocr_text(item.get("index_text") or item.get("text", ""))[:1200]
        else:
            evidence_text = str(item.get("text", ""))[:1200]
        evidence.append(
            {
                "source": label,
                "text": evidence_text,
            }
        )

    profile_payload = {
        "课题": profile["title"],
        "课题主线": profile["focus"],
        "关键事实": profile["facts"][:6],
        "关键词": profile["keywords"][:8],
        "易错点": profile["misconception"],
        "目标细节": profile.get("target_detail", ""),
        "环节顺序": stage_outline,
    }
    math_rules = """
数学课额外约束：教学环节必须使用数学问题、旧知、操作/计算、多表征、结论条件和检验语言，不得出现“初读文本、人物、朗读情节”等语文环节；每道练习都写答案和关键推理。教材OCR中的分数线、减号、乘除号、公式、数值和单位可能损坏，不能把未核验的表达式当事实；若画像已提供人工核验公式，必须优先使用它，绝不能输出“S=ah-2”，面积单位写平方单位，公式要用代入或图形关系验证。数学样例只提供环节结构，不提供本课事实。
""" if "数学" in str(context.get("subject", "")) else ""
    return f"""你是小学教学设计专家。服务器已经依据教材RAG生成完整教案；你只做短小、课题化的增量精修，不要重写整份教案。
{math_rules}

课程信息：{json.dumps(context, ensure_ascii=False)}
课题画像：{json.dumps(profile_payload, ensure_ascii=False)}
教材证据：{json.dumps(evidence, ensure_ascii=False)}

要求：
详案排版依据《圆的认识-六艺融合教学设计_详案_new.docx》：教学设计八章，目标中保留六艺与教师指标表；教学过程按教师活动、学生活动、六艺渗透、教学步骤、设计意图、学习证据、教师指标、材料、学生产出排列，复杂步骤归入子环节。排版由前端完成；此处只精修学科内容，不能复制模板的课题事实。简案继续使用对应简案模板。
1. 只使用画像和教材证据支持的事实，不得移植其他课题的人物、概念、数据或原句。
2. process.stages必须与“环节顺序”数量、顺序和title完全一致。每项只返回title和steps；steps只写一条45至70个汉字的增量步骤，必须包含具体教师追问、学生预期回应和纠偏动作。
3. detailed版另返回3条学生自评和3条教师反思提示；concise版可以省略这两项。
4. 不要返回design、teacher、student、评价表、作业或其他长字段，本地完整教案会保留这些内容。
5. 只返回合法JSON，不要Markdown、解释或文件名，总输出不超过1400个汉字。

JSON结构：
{{"process":{{"stages":[{{"title":"与环节顺序一致","steps":["课题化增量步骤"]}}]}},"evaluation":{{"self_assessment":["..."],"reflection_prompts":["..."]}}}}"""


def _parse_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("模型没有返回合法 JSON")
        value = json.loads(cleaned[start : end + 1])
    if not isinstance(value, dict):
        raise ValueError("模型返回的教案结构不是对象")
    return value


def _valid_dict_list(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _merge_named_items(model_items: Any, fallback_items: Any) -> list[dict[str, Any]]:
    """Keep useful model items while retaining required fallback sections."""

    model_list = _valid_dict_list(model_items)
    fallback_list = _valid_dict_list(fallback_items)
    if not model_list:
        return fallback_list
    merged = list(model_list)
    def identity(item: dict[str, Any]) -> str:
        return str(item.get("title") or item.get("key") or item.get("dimension") or "").strip()

    seen = {identity(item) for item in model_list if identity(item)}
    for item in fallback_list:
        title = identity(item)
        if title and title not in seen:
            merged.append(item)
    return merged


def _merge_design_sections(model_sections: Any, fallback_sections: Any) -> list[dict[str, Any]]:
    """Merge the canonical nested design blocks without losing required rows."""

    fallback = _valid_dict_list(fallback_sections)
    model = _valid_dict_list(model_sections)
    if not model:
        return fallback
    # When called independently (for example by an older API consumer) there
    # may be no local sections to anchor the merge.  In that case return the
    # model's valid objects rather than an unexpected empty list.  Normal plan
    # generation always supplies the canonical fallback and therefore still
    # filters unknown/legacy top-level blocks below.
    if not fallback:
        return [dict(item) for item in model]
    by_key: dict[str, dict[str, Any]] = {}
    for item in model:
        key = str(item.get("key") or item.get("title") or "").strip()
        if key and key not in by_key:
            by_key[key] = dict(item)
    merged: list[dict[str, Any]] = []
    for base in fallback:
        key = str(base.get("key") or base.get("title") or "").strip()
        candidate = by_key.pop(key, None)
        if not candidate:
            merged.append(dict(base))
            continue
        current = dict(base)
        # Section names are part of the public schema.  A model is allowed to
        # refine content, but must not rename/reorder the five required blocks
        # (or turn a table into a free-form module).
        current.update({
            name: value
            for name, value in candidate.items()
            if name not in {"key", "title", "type", "blocks"}
            and value not in (None, "", [], {})
        })
        current["key"] = str(base.get("key") or key)
        current["title"] = str(base.get("title") or key)
        if base.get("type"):
            current["type"] = base["type"]
        base_blocks = _valid_dict_list(base.get("blocks"))
        model_blocks = _valid_dict_list(candidate.get("blocks"))
        if base_blocks:
            block_map = {
                str(block.get("key") or block.get("title") or "").strip(): dict(block)
                for block in model_blocks
                if str(block.get("key") or block.get("title") or "").strip()
            }
            blocks: list[dict[str, Any]] = []
            for block in base_blocks:
                block_key = str(block.get("key") or block.get("title") or "").strip()
                override = block_map.pop(block_key, None)
                # Some model responses put the single block's fields directly
                # on the section (for example ``教学重点与难点.content``).
                # Apply that shorthand to the matching canonical block.
                if override is None and block_key == key:
                    override = candidate
                item = dict(block)
                if override:
                    item.update({
                        name: value
                        for name, value in override.items()
                        if name not in {"key", "title", "type", "blocks"}
                        and value not in (None, "", [], {})
                    })
                    item["key"] = str(block.get("key") or block_key)
                    item["title"] = str(block.get("title") or block_key)
                    item["type"] = block.get("type") or item.get("type")
                    if item.get("type") == "table":
                        candidate_columns = override.get("columns")
                        if (
                            not isinstance(item.get("columns"), list)
                            or not any(str(value).strip() for value in item.get("columns", []))
                        ) and isinstance(candidate_columns, list) and any(str(value).strip() for value in candidate_columns):
                            item["columns"] = [str(value).strip() for value in candidate_columns if str(value).strip()]
                        candidate_rows = override.get("rows")
                        # Rows may be objects (preferred) or arrays emitted by
                        # a model.  Keep either form instead of silently
                        # dropping array rows through ``_valid_dict_list``.
                        if isinstance(candidate_rows, list) and candidate_rows:
                            normalized_rows = [
                                row if isinstance(row, (dict, list)) else {"内容": str(row)}
                                for row in candidate_rows
                            ]
                            item["rows"] = normalized_rows
                blocks.append(item)
            # Unknown model blocks are retained after required blocks, so new
            # clients can adopt future fields while legacy sections stay stable.
            # Keep them only inside the owning section; unknown *top-level*
            # sections are intentionally discarded below so the public design
            # always has the five requested blocks.
            blocks.extend(block_map.values())
            current["blocks"] = blocks
        merged.append(current)
    # Do not append arbitrary model sections.  They commonly contain legacy
    # numbered headings (``01 设计理念``/``板书设计``) and would reintroduce
    # sections explicitly removed from the new teaching-design layout.
    return merged


def _merge_stages(model_stages: Any, fallback_stages: Any, duration: int) -> list[dict[str, Any]]:
    model_list = _valid_dict_list(model_stages)
    fallback_list = _valid_dict_list(fallback_stages)
    # Keep the five-phase structure used by the supplied sample lesson plans.
    stage_count = max(5, len(fallback_list))

    def stage_key(value: Any) -> str:
        text = str(value or "").strip()
        text = re.sub(r"^环节\s*[一二三四五六七八九十0-9]+\s*[:：]\s*", "", text)
        text = re.sub(r"\s*[（(]约?\s*\d+(?:\.\d+)?\s*分钟[）)]\s*$", "", text)
        text = re.sub(r"\s*[（(]\s*\d+(?:\.\d+)?\s*分钟[）)]\s*$", "", text)
        return _normalized_topic_text(text)

    model_by_title: dict[str, dict[str, Any]] = {}
    for item in model_list:
        title_key = stage_key(item.get("title", ""))
        if title_key and title_key not in model_by_title:
            model_by_title[title_key] = item
    merged: list[dict[str, Any]] = []
    for index in range(stage_count):
        base = dict(fallback_list[index]) if index < len(fallback_list) else {}
        base_title_key = stage_key(base.get("title", ""))
        candidate = model_by_title.get(base_title_key, {}) if base_title_key else {}
        # Legacy callers may return an untitled positional delta.  A named
        # but mismatched stage is ignored in full so one omitted stage cannot
        # shift every later model refinement onto the wrong lesson phase.
        if not candidate and index < len(model_list) and not model_list[index].get("title"):
            candidate = model_list[index]
        if isinstance(candidate, dict):
            for key, value in candidate.items():
                if value not in (None, "", [], {}):
                    base[key] = value
        if base:
            merged.append(base)
    if not merged:
        return fallback_list
    weights: list[float] = []
    for stage in merged:
        match = re.search(r"\d+(?:\.\d+)?", str(stage.get("time", "")))
        weights.append(float(match.group()) if match else 1.0)
    for stage, minute in zip(merged, _allocate_minutes(duration, weights)):
        stage["time"] = f"{minute} 分钟"
    return merged


def _merge_evaluation_tables(model_tables: Any, fallback_tables: Any) -> dict[str, Any]:
    """Merge model refinements into the required process-evaluation schema.

    The lesson-plan prompt asks the model to return evaluation tables, but a
    relay may truncate the response or return only one dimension.  Replacing
    the complete local tables with that partial object used to make the UI
    lose one or more of the four teacher-dimension tables.  This helper keeps
    the fallback structure as the contract and overlays only non-empty model
    values.
    """

    fallback = deepcopy(fallback_tables) if isinstance(fallback_tables, dict) else {}
    model = model_tables if isinstance(model_tables, dict) else {}

    def _rows(value: Any) -> list[Any]:
        if not isinstance(value, list):
            return []
        return [
            row if isinstance(row, (dict, list)) else {"内容": str(row)}
            for row in value
            if row not in (None, "")
        ]

    def _table(base: Any, candidate: Any, default_title: str) -> dict[str, Any] | None:
        if not isinstance(base, dict) and not isinstance(candidate, dict):
            return None
        result = deepcopy(base) if isinstance(base, dict) else {}
        source = candidate if isinstance(candidate, dict) else {}
        for name, value in source.items():
            if name in {"title", "columns", "rows"}:
                continue
            if value not in (None, "", [], {}):
                result[name] = value
        result["title"] = str(
            (base or {}).get("title")
            if isinstance(base, dict)
            else ""
        ).strip() or default_title
        candidate_columns = source.get("columns")
        if (
            not isinstance(result.get("columns"), list)
            or not any(str(item).strip() for item in result.get("columns", []))
        ) and isinstance(candidate_columns, list) and any(str(item).strip() for item in candidate_columns):
            result["columns"] = [str(item).strip() for item in candidate_columns if str(item).strip()]
        elif isinstance(result.get("columns"), list):
            result["columns"] = [str(item) for item in result["columns"] if str(item).strip()]
        candidate_rows = _rows(source.get("rows"))
        if candidate_rows:
            result["rows"] = candidate_rows
        elif not isinstance(result.get("rows"), list):
            result["rows"] = []
        return result

    fallback_dimensions = _valid_dict_list(fallback.get("teacher_dimensions"))
    model_dimensions = _valid_dict_list(model.get("teacher_dimensions"))
    model_by_title = {
        _normalized_topic_text(item.get("title", "")): item
        for item in model_dimensions
        if str(item.get("title", "")).strip()
    }
    dimensions: list[dict[str, Any]] = []
    for base in fallback_dimensions:
        title = str(base.get("title") or "").strip()
        normalized = _normalized_topic_text(title)
        candidate = model_by_title.get(normalized)
        if candidate is None and normalized:
            candidate = next(
                (
                    item
                    for key, item in model_by_title.items()
                    if key.startswith(normalized) or normalized.startswith(key)
                ),
                None,
            )
        merged = _table(base, candidate, title)
        if merged is not None:
            # A dimension's title is canonical just like a design section's
            # title; do not let a model typo change the four visible labels.
            merged["title"] = title
            dimensions.append(merged)
    if not dimensions:
        # A malformed fallback should not make the API return an invalid
        # object; retain any valid model dimensions as a last resort.
        dimensions = [dict(item) for item in model_dimensions]
    fallback_summary = fallback.get("teacher_summary")
    model_summary = model.get("teacher_summary")
    summary = _table(
        fallback_summary,
        model_summary,
        "六艺·三学会教师行为综合达成统计表",
    )
    fallback_student = fallback.get("student_rubric")
    model_student = model.get("student_rubric")
    student = _table(
        fallback_student,
        model_student,
        "学生六艺素养评价量表（课堂观察用）",
    )
    result: dict[str, Any] = {
        "teacher_dimensions": dimensions,
        "teacher_summary": summary,
        "student_rubric": student,
    }
    # Preserve future, non-contract fields without allowing them to replace
    # the required tables above.
    for key, value in fallback.items():
        if key not in result:
            result[key] = deepcopy(value)
    for key, value in model.items():
        if key not in result and value not in (None, "", [], {}):
            result[key] = value
    return result


def _normalize_sixarts_process_stages(
    stages: list[dict[str, Any]], context: dict[str, Any], profile: dict[str, Any]
) -> list[dict[str, Any]]:
    """Make each process card internally consistent and topic-specific.

    Model output can independently fill ``art_key``, ``art_label``,
    ``art_activity`` and ``penetration``.  Treating those fields as independent
    values caused the header and the student-six-arts paragraph to disagree.
    The API now chooses one primary selected dimension per stage and derives
    all visible art wording from ``ART_INFO``.
    """

    selected = [key for key in context.get("arts", []) if key in ART_INFO]
    selected = selected or list(ART_INFO)
    title = str(profile.get("title") or context.get("title") or "本课")
    leads = (
        "用可回指教材证据的完整表达",
        "用节奏、停顿或声音变化突出关键词",
        "用规范操作记录过程、变化和结果",
        "用动作或空间关系呈现关键行动或关系",
        "用结构化书写固定概念、步骤与反思",
        "用图示、关系图或分镜呈现证据链",
    )
    for index, stage in enumerate(stages):
        if not isinstance(stage, dict):
            continue
        candidates = [
            str(stage.get("art_key") or "").strip(),
            str(stage.get("art_label") or "").strip(),
            str(stage.get("art_activity") or "").strip(),
        ]
        art = next((value for value in candidates if value in selected), "")
        if not art:
            for value in candidates:
                art = next((key for key in selected if key in value or value in ART_INFO[key]["activity"]), "")
                if art:
                    break
        art = art or selected[index % len(selected)]
        info = ART_INFO[art]
        stage["art_key"] = art
        stage["art_label"] = art
        stage["art_activity"] = info["activity"]
        evidence = str(stage.get("expected_output") or stage.get("evidence") or info["evidence"]).strip()
        # Keep the evidence generated for this particular lesson phase.  It
        # makes the six-arts text meaningfully different from the next phase.
        stage["penetration"] = (
            f"{art}融合不是附加表演：本环节以{leads[index % len(leads)]}完成{info['activity']}，"
            f"服务《{title}》的{stage.get('title', '教学环节')}任务；要求学生留下{info['evidence']}；"
            f"本环节重点证据为：{evidence}"
        )
        raw_steps = stage.get("steps")
        if isinstance(raw_steps, list):
            normalized_steps: list[str] = []
            for step in raw_steps:
                text = str(step).strip()
                if "六艺表达" in text:
                    text = (
                        f"六艺表达：使用{art}完成{info['activity']}，并说明这一表达怎样帮助理解《{title}》，"
                        "不能只做展示。"
                    )
                if text:
                    normalized_steps.append(text)
            stage["steps"] = normalized_steps
    return stages


def _normalize_math_plan_value(value: Any, topic: str = "") -> Any:
    """Repair only verified OCR glyph substitutions in generated math text."""

    if isinstance(value, dict):
        return {key: _normalize_math_plan_value(item, topic) for key, item in value.items()}
    if isinstance(value, list):
        return [_normalize_math_plan_value(item, topic) for item in value]
    if not isinstance(value, str):
        return value
    text = _normalize_math_ocr_text(value)
    text = re.sub(r"(?i)\bS\s*=\s*a\s*h\s*[-—－]\s*2\b", "S=ah÷2", text)
    text = re.sub(r"(?i)(S\s*=\s*a\s*[×xX*]?\s*h)\s*[-—－]\s*2", r"\1÷2", text)
    text = re.sub(r"(?i)(\b(?:cm|dm|m|km))\s*\(?2\)?\b", r"\1²", text)
    text = text.replace("(cm)2", "cm²").replace("(cm2)", "cm²")
    if "倒数" in str(topic):
        # These four fraction bars are known OCR failures on the verified page.
        for broken, fixed in (("3-8", "3/8"), ("8-3", "8/3"), ("7-15", "7/15"), ("15-7", "15/7")):
            text = text.replace(broken, fixed)
    return text


def _topic_hit_count(value: Any, profile: dict[str, Any]) -> int:
    text = str(value or "").replace(" ", "")
    if not text:
        return 0
    title = str(profile.get("title") or "").replace(" ", "")
    hits = 1 if title and title in text else 0
    # Do not count the title twice when it is also present in keywords.
    seen_terms: set[str] = set()
    for raw_term in profile.get("keywords", []):
        term = str(raw_term).replace(" ", "").strip()
        if len(term) < 2 or term == title or term in seen_terms:
            continue
        seen_terms.add(term)
        if term in text:
            hits += 1
    return hits


_GENERIC_TOPIC_PLACEHOLDERS = (
    "围绕课题", "相关内容", "某知识点", "本课内容", "核心探究", "进行探究活动",
    "开展学习活动", "加深理解", "提升能力",
)


def _augment_topic_text(candidate: Any, fallback: Any, profile: dict[str, Any], minimum: int) -> str:
    """Prevent a valid-but-generic model field from erasing topic detail."""

    model_text = str(candidate or "").strip()
    base_text = str(fallback or "").strip()
    if not model_text:
        return base_text
    topic_hits = _topic_hit_count(model_text, profile)
    required_hits = 2 if len(profile.get("keywords", [])) > 1 else 1
    has_placeholder = any(marker in model_text for marker in _GENERIC_TOPIC_PLACEHOLDERS)
    if len(model_text) >= minimum and topic_hits >= required_hits and not has_placeholder:
        return model_text
    if not base_text:
        return model_text
    if base_text in model_text:
        return model_text
    prefix = "课题化补充："
    return f"{model_text}\n{prefix}{base_text}"


def _merge_plan(plan: dict[str, Any], fallback: dict[str, Any], context: dict[str, Any], references: list[dict[str, Any]]) -> dict[str, Any]:
    result = dict(fallback)
    profile = _topic_profile(context, references)
    detailed = context["detail_level"] == "detailed"
    module_minimum = 180 if detailed else 110
    stage_teacher_minimum = 120 if detailed else 70
    stage_student_minimum = 90 if detailed else 55
    if isinstance(plan.get("title"), str) and plan["title"].strip():
        candidate_title = plan["title"].strip()
        # Keep the user-entered topic visible even if the model emits a
        # generic heading or accidentally repeats a retrieved sample title.
        if profile["title"].replace(" ", "") in candidate_title.replace(" ", ""):
            result["title"] = candidate_title

    model_design = plan.get("design") if isinstance(plan.get("design"), dict) else {}
    fallback_design = fallback.get("design", {})
    design = dict(fallback_design) if isinstance(fallback_design, dict) else {}
    design["modules"] = _merge_named_items(model_design.get("modules"), design.get("modules"))
    design["sections"] = _merge_design_sections(model_design.get("sections"), design.get("sections"))
    try:
        model_schema_version = int(model_design.get("schema_version") or 0)
    except (TypeError, ValueError):
        model_schema_version = 0
    try:
        fallback_schema_version = int(design.get("schema_version") or 2)
    except (TypeError, ValueError):
        fallback_schema_version = 2
    design["schema_version"] = max(model_schema_version, fallback_schema_version)
    fallback_modules = {
        str(item.get("title", "")): item
        for item in _valid_dict_list(fallback_design.get("modules") if isinstance(fallback_design, dict) else [])
    }
    for item in design["modules"]:
        title = str(item.get("title", "")).strip()
        base = fallback_modules.get(title, {})
        item["content"] = _augment_topic_text(item.get("content"), base.get("content", ""), profile, module_minimum)
    design["competencies"] = _merge_named_items(model_design.get("competencies"), design.get("competencies"))
    for field in ("fusion_score", "fusion_breakdown"):
        if model_design.get(field) not in (None, "", [], {}):
            design[field] = model_design[field]
    result["design"] = design

    model_process = plan.get("process") if isinstance(plan.get("process"), dict) else {}
    fallback_process = fallback.get("process", {})
    merged_stages = _merge_stages(
            model_process.get("stages"),
            fallback_process.get("stages", []) if isinstance(fallback_process, dict) else [],
            context["duration"],
        )
    merged_stages = _normalize_sixarts_process_stages(merged_stages, context, profile)
    fallback_stages = _valid_dict_list(fallback_process.get("stages", []) if isinstance(fallback_process, dict) else [])
    for index, stage in enumerate(merged_stages):
        base = fallback_stages[index] if index < len(fallback_stages) else {}
        stage["teacher"] = _augment_topic_text(stage.get("teacher"), base.get("teacher", ""), profile, stage_teacher_minimum)
        stage["student"] = _augment_topic_text(stage.get("student"), base.get("student", ""), profile, stage_student_minimum)
        stage["penetration"] = _augment_topic_text(stage.get("penetration"), base.get("penetration", ""), profile, 55 if detailed else 35)
        stage["evidence"] = _augment_topic_text(stage.get("evidence"), base.get("evidence", ""), profile, 40 if detailed else 25)
        stage["intention"] = _augment_topic_text(stage.get("intention"), base.get("intention", ""), profile, 70 if detailed else 40)
        stage["teacher_indicator"] = _augment_topic_text(stage.get("teacher_indicator"), base.get("teacher_indicator", ""), profile, 45 if detailed else 25)
        model_steps = [str(value).strip() for value in stage.get("steps", []) if str(value).strip()] if isinstance(stage.get("steps"), list) else []
        base_steps = [str(value).strip() for value in base.get("steps", []) if str(value).strip()] if isinstance(base.get("steps"), list) else []
        if model_steps and (
            _topic_hit_count(" ".join(model_steps), profile) < 1
            or any(marker in " ".join(model_steps) for marker in _GENERIC_TOPIC_PLACEHOLDERS)
            or _has_other_lesson_title(" ".join(model_steps), str(profile.get("title", "")))
        ):
            model_steps = []
        if detailed:
            stage["steps"] = model_steps + [value for value in base_steps if value not in model_steps][: max(0, 4 - len(model_steps))]
        elif model_steps:
            stage["steps"] = model_steps + [value for value in base_steps if value not in model_steps][: max(0, 3 - len(model_steps))]
        stage["heading"] = _stage_heading(stage.get("title"), index, stage.get("time"))
        stage["table"] = _build_process_stage_table(stage)
    fallback_evaluation_tables = (
        fallback_process.get("evaluation_tables", {})
        if isinstance(fallback_process, dict)
        else {}
    )
    model_evaluation_tables = (
        model_process.get("evaluation_tables", {})
        if isinstance(model_process, dict)
        else {}
    )
    # Some compatible model prompts put the tables under ``evaluation``
    # instead of ``process``.  Combine both candidates before applying the
    # schema-preserving merge.
    model_evaluation_alias = plan.get("evaluation") if isinstance(plan.get("evaluation"), dict) else {}
    if isinstance(model_evaluation_alias, dict):
        # Fill missing process-table keys from the legacy top-level alias,
        # while preferring an explicit process value when both are present.
        model_evaluation_tables = dict(model_evaluation_tables) if isinstance(model_evaluation_tables, dict) else {}
        for key in ("teacher_dimensions", "teacher_summary", "student_rubric"):
            if model_evaluation_tables.get(key) in (None, "", [], {}) and model_evaluation_alias.get(key) not in (None, "", [], {}):
                model_evaluation_tables[key] = model_evaluation_alias[key]
    process_evaluation_tables = _merge_evaluation_tables(
        model_evaluation_tables,
        fallback_evaluation_tables,
    )
    result["process"] = {
        "stages": merged_stages,
        "schema_version": 2,
        "evaluation_tables": process_evaluation_tables,
    }

    model_evaluation = plan.get("evaluation") if isinstance(plan.get("evaluation"), dict) else {}
    fallback_evaluation = fallback.get("evaluation", {})
    evaluation = dict(fallback_evaluation) if isinstance(fallback_evaluation, dict) else {}
    evaluation["rows"] = _merge_named_items(model_evaluation.get("rows"), evaluation.get("rows"))
    evaluation["teacher_rows"] = _merge_named_items(model_evaluation.get("teacher_rows"), evaluation.get("teacher_rows"))
    for field in ("self_assessment", "reflection_prompts"):
        value = model_evaluation.get(field)
        if isinstance(value, list) and any(str(item).strip() for item in value):
            evaluation[field] = [str(item).strip() for item in value if str(item).strip()]
    for field in ("homework", "extension"):
        value = model_evaluation.get(field)
        if isinstance(value, str) and value.strip():
            evaluation[field] = _augment_topic_text(value, evaluation.get(field, ""), profile, 80 if detailed else 45)
    # Expose process evaluation blocks at the top-level evaluation object too;
    # this keeps the old three-panel evaluate view and the new process view in
    # sync while allowing either client to consume the same tables.
    if process_evaluation_tables:
        for field, value in process_evaluation_tables.items():
            if field not in evaluation or not evaluation.get(field):
                evaluation[field] = value
    result["evaluation"] = evaluation
    result["context"] = context
    # Only expose references selected from the server-side index.  Model
    # generated filenames are not trusted and the retrieved text should never
    # be sent back to the browser as part of the compact reference list.
    result["references"] = _reference_metadata(references)
    result["version"] = context["detail_level"]
    if "数学" in str(context.get("subject", "")):
        result = _normalize_math_plan_value(result, str(profile.get("title", context.get("title", ""))))
    return result


def generate_lesson_plan(
    payload: dict[str, Any],
    store: LessonReferenceStore,
    client: OpenAI,
) -> tuple[dict[str, Any], bool, float, list[dict[str, Any]]]:
    context = _context(payload)
    query = " ".join([context["title"], context["subject"], context["summary"], context["requirement"], " ".join(context["arts"])])
    references = store.search(
        query,
        context["subject"],
        top_k=10,
        topic=context["title"],
        grade=context.get("grade"),
        edition=context.get("edition"),
        term=context.get("term"),
    )
    if not references:
        # Prefer documents whose extracted text mentions the requested title;
        # falling back to the first files would otherwise hide a usable sample
        # behind a generic theory document.
        topic = _topic_name(context["title"])
        ranked = sorted(
            store.references,
            key=lambda item: (topic in item.text or topic in item.source_title, item.source_type == "样例教案"),
            reverse=True,
        )
        references = [
            {"source_title": item.source_title, "source_type": item.source_type, "subject": item.subject, "score": 0.0, "text": item.text[:1200]}
            for item in ranked[:8]
        ]
    profile = _topic_profile(context, references)
    references = _add_profile_reference(references, profile, context.get("subject"))
    fallback = _fallback_plan(context, references)
    fallback["generation_mode"] = "local_textbook_fallback"
    started = time.perf_counter()
    try:
        # The model now returns only a compact refinement over the complete
        # local plan.  Keep a bounded budget so a slow relay still falls back
        # to the textbook-grounded plan before the browser gives up.
        model_client = client
        try:
            lesson_timeout = max(6.0, float(os.getenv("LESSON_PLAN_API_TIMEOUT_SECONDS", "60")))
        except ValueError:
            lesson_timeout = 60.0
        lesson_reasoning_effort = os.getenv("LESSON_PLAN_REASONING_EFFORT", "medium").strip().lower()
        if lesson_reasoning_effort not in {"minimal", "low", "medium", "high", "xhigh"}:
            lesson_reasoning_effort = "medium"
        if hasattr(client, "with_options"):
            model_client = client.with_options(timeout=lesson_timeout, max_retries=0)
        refinement_prompt = _model_refinement_prompt(context, references)
        parsed_response: dict[str, Any] | None = None
        response = None
        parse_error: ValueError | None = None
        # DeepSeek counts hidden reasoning and visible JSON in the same output
        # budget.  A detailed ten-stage plan can occasionally spend most of
        # that budget on reasoning and leave an empty/truncated JSON object.
        # Retry only that formatting failure, using low reasoning so the
        # second attempt remains inside the browser's request timeout.
        for attempt in range(2):
            response = model_client.responses.create(
                model=MODEL,
                instructions=(
                    "你负责对教材RAG教案做精确、简短的课题化增量精修。"
                    "只返回合法JSON，不编造教材事实、文件名、政策、荣誉或链接。"
                ),
                input=refinement_prompt,
                reasoning={
                    "effort": lesson_reasoning_effort if attempt == 0 else "low"
                },
                # Ask compatible Responses endpoints to enforce a JSON object;
                # the parser still handles relays that ignore this hint.
                text={"format": {"type": "json_object"}},
                max_output_tokens=(
                    7200 if context["detail_level"] == "detailed" else 4200
                ),
                store=False,
            )
            try:
                parsed_response = _parse_json(response.output_text)
                break
            except (json.JSONDecodeError, ValueError) as exc:
                parse_error = exc
                if attempt == 0:
                    continue
                raise ValueError("模型返回内容为空、截断或不是合法 JSON") from exc
        if parsed_response is None or response is None:
            raise ValueError("模型没有返回可用的教案精修 JSON") from parse_error
        plan = _merge_plan(parsed_response, fallback, context, references)
        plan["model"] = getattr(response, "model", MODEL) or MODEL
        plan["generation_mode"] = "rag_llm_refined"
        if str(profile.get("confidence", "medium")) == "low":
            plan["warning"] = fallback.get("warning") or (
                f"知识库未检索到《{profile.get('title', context['title'])}》的直接教材事实；"
                "请按实际教材核对并补充版本敏感内容。"
            )
        return plan, False, (time.perf_counter() - started) * 1000, references
    except (
        AuthenticationError,
        APIConnectionError,
        APIStatusError,
        AttributeError,
        OSError,
        RuntimeError,
        TypeError,
        ValueError,
    ) as exc:
        if isinstance(exc, ValueError):
            reason = "模型返回格式不完整"
        elif isinstance(exc, AuthenticationError):
            reason = "模型鉴权失败"
        elif isinstance(exc, APIStatusError):
            reason = f"模型服务 HTTP {exc.status_code}"
        elif isinstance(exc, APIConnectionError):
            reason = "模型连接失败"
        else:
            reason = type(exc).__name__
        fallback["warning"] = f"在线模型暂不可用，已使用教材与备课资料生成本地教案：{reason}"
        return fallback, True, (time.perf_counter() - started) * 1000, references
