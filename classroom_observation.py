"""Evidence-first classroom observation analysis.

The module keeps the measurable parts deterministic (speaker parsing, counts,
hot words, five-dimension scores and retrieval provenance).  The model is used
only to polish explanations from those facts and retrieved theory excerpts;
when the relay is unavailable the deterministic report remains usable.
"""

from __future__ import annotations

import atexit
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from difflib import SequenceMatcher
from io import BytesIO
import json
import os
import queue
import re
from pathlib import Path
import subprocess
import tempfile
import threading
import time
from typing import Any, Iterable
import uuid

from openai import OpenAI

from rag.bm25 import BM25Retriever, SearchHit
from rag.run_rag import MODEL, REASONING_EFFORT
from theory_subject_scope import (
    infer_subject_scope,
    subject_scope_label,
    theory_is_compatible,
)


MAX_TRANSCRIPT_CHARS = 120_000
MAX_THEORY_MAPPINGS = 8
MAX_REFINEMENT_CHARS = MAX_TRANSCRIPT_CHARS
REFINEMENT_CHUNK_CHARS = 3_000
REFINEMENT_CHUNK_ROWS = 4
REFINEMENT_MAX_WORKERS = 2

_FUNASR_PROTOCOL_PREFIX = "EDULINK_FUNASR_RESULT\t"
_FUNASR_PROCESS: subprocess.Popen[str] | None = None
_FUNASR_RESPONSES: queue.Queue[dict[str, Any]] | None = None
_FUNASR_REQUEST_LOCK = threading.RLock()

_TIMESTAMP = re.compile(r"^(\d{1,2}:\d{2}(?::\d{2})?)\s*")
_SPEAKER = re.compile(
    r"^[（(]?\s*(教师话语|模拟学生话语\s*\d*|无法确定|未标注说话人|"
    r"师(?:引导|小结|追问|提问)?|教师|老师|生(?:\s*\d*|\s*[（(]齐[）)])?|学生\s*\d*|"
    r"全班|小组|生齐|齐答|学生甲|学生乙|teacher|student\s*\d*|uncertain)[）)]?\s*[：:]\s*",
    re.I,
)
_SPEAKER_TOKEN = re.compile(
    r"[（(]?\s*(教师话语|模拟学生话语\s*\d*|无法确定|未标注说话人|"
    r"师(?:引导|小结|追问|提问)?|教师|老师|生(?:\s*\d*|\s*[（(]齐[）)])?|学生\s*\d*|"
    r"全班|小组|生齐|齐答|学生甲|学生乙|teacher|student\s*\d*|uncertain)[）)]?\s*[：:]",
    re.I,
)
_CJK_RUN = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]{2,}")

STOPWORDS = {
    "我们", "你们", "他们", "这个", "那个", "然后", "现在", "就是", "可以",
    "一个", "还有", "什么", "怎么", "为什么", "老师", "学生", "同学", "请你",
    "大家", "一下", "这里", "那里", "是不是", "对不对", "好不好", "今天",
}

HOTWORD_LEXICON: dict[str, tuple[str, ...]] = {
    "teacher": (
        "追问", "凑十", "凑成10", "移一移", "发现", "规律", "为什么", "对不对",
        "圈一圈", "想一想", "说一说", "补充", "举例", "验证", "反馈", "以后还能用",
        "同意吗", "理由", "依据", "再说", "观察", "比较", "小组讨论", "同桌交流",
    ),
    "student": (
        "不公平", "凑十", "凑成10", "少1", "10+3", "因为", "所以", "移到这边",
        "我来", "我觉得", "我发现", "对", "不对", "答案", "规律", "为什么",
    ),
    # Local ASR cannot diarize speakers. These terms are reported separately
    # instead of being incorrectly attributed to teachers or students.
    "other": (
        "课堂", "学习", "观察", "发现", "规律", "问题", "为什么", "因为", "所以",
        "同学", "老师", "请", "回答", "读", "写", "看", "说", "想一想", "练习",
    ),
}

EVENT_RULES: tuple[dict[str, Any], ...] = (
    {"title": "情境与问题引入", "keys": ("比赛", "游戏", "生活", "情境", "真实", "不公平", "问题")},
    {"title": "操作体验与概念建构", "keys": ("学具", "实物", "圆片", "操作", "移", "摆", "拼", "画", "算式", "符号")},
    {"title": "师生对话与思维引导", "keys": ("为什么", "依据", "理由", "怎么", "如果", "追问", "解释", "补充")},
    {"title": "同伴协作与观点交流", "keys": ("小组", "同桌", "合作", "讨论", "交流", "汇报", "同伴", "互相")},
    {"title": "规律发现与结构归纳", "keys": ("发现", "规律", "观察", "比较", "归纳", "总结", "猜想", "验证")},
    {"title": "变式迁移与应用", "keys": ("以后", "还能", "迁移", "应用", "新问题", "换一换", "举例", "验证")},
    {"title": "形成性反馈与调整", "keys": ("很好", "真棒", "关键", "纠正", "提醒", "有道理", "评价", "改")},
)

THEORY_HINTS: dict[str, tuple[str, ...]] = {
    "情境与问题引入": ("建构主义", "情境认知", "认知冲突", "问题情境"),
    "操作体验与概念建构": ("皮亚杰", "多元表征", "数学表征", "发现学习", "认知发展"),
    "师生对话与思维引导": ("教学对话", "IRF", "苏格拉底", "课堂提问", "追问"),
    "同伴协作与观点交流": ("社会互动", "合作学习", "同伴", "社会协商"),
    "规律发现与结构归纳": ("发现学习", "布鲁纳", "归纳", "结构学习"),
    "变式迁移与应用": ("学习迁移", "变式教学", "认知结构迁移", "应用"),
    "形成性反馈与调整": ("形成性评价", "描述性反馈", "教学调节", "反馈"),
}


@dataclass(frozen=True)
class TranscriptLine:
    index: int
    time: str
    content: str
    speaker: str
    simulated: bool = False
    role_label: str = ""


@dataclass(frozen=True)
class _RefinementChunkResult:
    """Immutable hand-off from one model worker to the ordered aggregator."""

    chunk_index: int
    turns: tuple[tuple[tuple[str, Any], ...], ...]
    corrections: tuple[tuple[tuple[str, Any], ...], ...]
    used_model: bool
    warning: str | None = None


def _speaker_and_content(raw: str) -> tuple[str, str, bool, str]:
    match = _SPEAKER.match(raw)
    if not match:
        return "other", raw, False, ""
    label = match.group(1)
    content = raw[match.end() :].strip()
    compact_label = re.sub(r"\s+", "", label)
    lowered = compact_label.lower()
    if compact_label in {"无法确定", "未标注说话人"} or lowered == "uncertain":
        return "other", content, False, "uncertain"
    if compact_label.startswith("模拟学生话语"):
        return "student", content, True, compact_label
    if compact_label in {"师", "教师", "老师", "教师话语", "师引导", "师小结", "师追问", "师提问"} or lowered == "teacher":
        return "teacher", content, False, "teacher"
    return "student", content, False, compact_label or "student"


def _split_turns(value: str) -> list[tuple[str, str, bool, str]]:
    """Split merged DOCX paragraphs such as ``生1：...师：...`` into turns."""

    matches = list(_SPEAKER_TOKEN.finditer(value))
    if len(matches) <= 1 or matches[0].start() > 2:
        return [_speaker_and_content(value)]
    turns: list[tuple[str, str, bool, str]] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(value)
        label = match.group(0)
        content = value[match.end() : end].strip()
        if not content:
            continue
        speaker, _, simulated, role_label = _speaker_and_content(label + content)
        turns.append((speaker, content, simulated, role_label))
    return turns or [_speaker_and_content(value)]


def parse_transcript(text: str) -> list[TranscriptLine]:
    """Parse common timestamp/speaker transcript formats without inventing facts."""

    lines: list[TranscriptLine] = []
    for index, raw in enumerate(str(text or "").splitlines()):
        value = raw.strip()
        if not value:
            continue
        timestamp = _TIMESTAMP.match(value)
        marker = timestamp.group(1) if timestamp else f"#{index + 1:02d}"
        content = value[timestamp.end() :] if timestamp else value
        for speaker, turn_content, simulated, role_label in _split_turns(content.strip()):
            if turn_content:
                lines.append(TranscriptLine(len(lines), marker, turn_content, speaker, simulated, role_label))
    return lines


def _clean_trial_source(text: str) -> list[dict[str, Any]]:
    """Keep spoken content while dropping common transcription-platform metadata."""

    raw_lines = [line.strip() for line in str(text or "").splitlines() if line.strip()]
    has_speaker_blocks = any(re.fullmatch(r"讲话人\s*\d+", line) for line in raw_lines)
    rows: list[dict[str, Any]] = []
    accept_next = not has_speaker_blocks
    skip_section = False
    for raw in raw_lines:
        if re.fullmatch(r"讲话人\s*\d+", raw):
            accept_next = True
            skip_section = False
            continue
        if raw in {"关键词", "全文概要"}:
            skip_section = True
            accept_next = False
            continue
        if skip_section:
            continue
        if has_speaker_blocks and not accept_next:
            continue
        timestamp = _TIMESTAMP.match(raw)
        marker = timestamp.group(1) if timestamp else ""
        content = raw[timestamp.end() :].strip() if timestamp else raw
        content = re.sub(r"^未标注说话人\s*[：:]\s*", "", content).strip()
        if not content:
            continue
        rows.append({
            "source_line": len(rows) + 1,
            "time": marker,
            "text": content,
        })
        if has_speaker_blocks:
            accept_next = False
    return rows


def _refinement_chunks(rows: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    chunks: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []
    size = 0
    for row in rows:
        row_size = len(str(row.get("text", ""))) + 32
        if current and (size + row_size > REFINEMENT_CHUNK_CHARS or len(current) >= REFINEMENT_CHUNK_ROWS):
            chunks.append(current)
            current = []
            size = 0
        current.append(row)
        size += row_size
    if current:
        chunks.append(current)
    return chunks


def _refinement_worker_count() -> int:
    try:
        requested = int(os.getenv("TRANSCRIPT_REFINE_MAX_WORKERS", str(REFINEMENT_MAX_WORKERS)))
    except (TypeError, ValueError):
        requested = REFINEMENT_MAX_WORKERS
    return max(2, min(3, requested))


def _refinement_timeout_seconds() -> float:
    # The shared client defaults to MODEL_API_TIMEOUT_SECONDS=45 with one retry.
    # Small refinement chunks use the same timeout unless explicitly overridden.
    fallback = os.getenv("MODEL_API_TIMEOUT_SECONDS", "45")
    try:
        return max(15.0, float(os.getenv("TRANSCRIPT_REFINE_TIMEOUT_SECONDS", fallback)))
    except (TypeError, ValueError):
        return 45.0


def _freeze_records(records: list[dict[str, Any]]) -> tuple[tuple[tuple[str, Any], ...], ...]:
    return tuple(tuple(record.items()) for record in records)


def _thaw_records(records: tuple[tuple[tuple[str, Any], ...], ...]) -> list[dict[str, Any]]:
    return [dict(record) for record in records]


def _trial_refinement_prompt(
    rows: list[dict[str, Any]],
    metadata: dict[str, Any],
    reference_text: str,
) -> str:
    source_rows: list[str] = []
    for row in rows:
        time_label = f"[{row['time']}]" if row.get("time") else ""
        source_rows.append(f"[{row['source_line']:04d}]{time_label} {row['text']}")
    source = "\n".join(source_rows)
    return f"""请将下方“教师试讲录音转文字稿”整理成教学互动实录。录音只有教师一个人的声音；教师可能自问自答、模拟学生发言，也可能转述或假设学生回答。先在不改变主要意思和顺序的前提下校正有上下文或教材依据的识别错误，再拆分话轮。

只分为三类：
1. teacher：教师以教师身份说出的讲解、提问、反馈、指令、过渡语、板书说明等。
2. student：教师以学生身份或学生口吻说出的回答；教师明确转述的“有同学说……”“他说……”“小明认为……”也归为模拟学生。连续多个不同学生回答用 student_index=1、2……。
3. uncertain：无法判断身份的简短或残缺内容。

证据约束：
- 不添加原文没有的知识结论、课堂事件、学生表现或具体回答。
- 可以删除重复语气词、口误和无意义填充词，并修正有教材或上下文依据的同音字、专名、课文原句和标点。
- 教师直接自问自答时拆成“教师问题—模拟学生答案—教师反馈”。教师反馈完整复述答案时，可以抽取该答案为模拟学生话语，同时必须保留教师原有反馈。
- 同一问题后出现“上官、欧阳、东方、诸葛”这类多个独立短答案时，必须拆成多条 student，并依次填写 student_index=1、2、3、4；只有一个学生回答时 student_index 必须为 null。
- 只知道发生了朗读、书写、观察、回答等行为但不知道具体内容时，student 文本只能写括号占位，例如“（朗读第一句）”，derivation 使用 inferred_placeholder。
- 不得把教师示范朗读、教师讲解或教师自己给出的结论机械改成学生话语。
- 每条话轮必须填写它直接来自的 source_line；不得伪造时间，程序会从原始行继承时间。
- 保持 source_line 非递减和话轮先后关系。

derivation 取值：original_teacher、explicit_self_answer、teacher_restatement、inferred_placeholder、uncertain。

请只输出一个 JSON 对象，不要输出代码围栏或思考过程：
{{
  "turns": [
    {{
      "source_line": 1,
      "speaker": "teacher|student|uncertain",
      "student_index": null,
      "text": "话轮正文",
      "derivation": "original_teacher|explicit_self_answer|teacher_restatement|inferred_placeholder|uncertain",
      "confidence": 0.0
    }}
  ],
  "corrections": [
    {{"before": "原识别片段", "after": "校正片段", "basis": "上下文或教材依据"}}
  ]
}}

课堂信息：{json.dumps(metadata, ensure_ascii=False)}
教材核对片段（只能用于纠正，不得据此补写录音中不存在的课堂活动）：
{reference_text[:5000] or '未提供'}

待处理原稿：
{source}
"""


def _normalize_refinement_text(value: Any) -> str:
    return re.sub(r"\s+", "", re.sub(r"[^0-9A-Za-z\u3400-\u9fff]", "", str(value or "")))


def _normalize_student_groups(turns: list[dict[str, Any]]) -> list[dict[str, Any]]:
    expanded: list[dict[str, Any]] = []
    for turn in turns:
        if turn.get("speaker") != "student" or turn.get("derivation") == "inferred_placeholder":
            expanded.append(turn)
            continue
        text = str(turn.get("text") or "").strip()
        parts = [part.strip(" ，,、。；;！!？?") for part in re.split(r"[、，,]", text)]
        independent = len(parts) >= 2 and all(part and len(part) <= 6 for part in parts)
        if independent:
            for part in parts:
                expanded.append({**turn, "text": f"{part}。", "student_index": None})
        else:
            expanded.append(turn)

    result: list[dict[str, Any]] = []
    index = 0
    while index < len(expanded):
        turn = expanded[index]
        if turn.get("speaker") != "student":
            result.append(turn)
            index += 1
            continue
        end = index + 1
        while (
            end < len(expanded)
            and expanded[end].get("speaker") == "student"
            and expanded[end].get("source_line") == turn.get("source_line")
        ):
            end += 1
        group = expanded[index:end]
        if len(group) > 1:
            result.extend({**item, "student_index": offset} for offset, item in enumerate(group, start=1))
        else:
            result.append({**turn, "student_index": None})
        index = end
    return result


def _validated_model_turns(
    parsed: dict[str, Any],
    rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    raw_turns = parsed.get("turns")
    if not isinstance(raw_turns, list) or not raw_turns:
        raise ValueError("模型未返回有效话轮")
    row_map = {int(row["source_line"]): row for row in rows}
    allowed_derivations = {
        "original_teacher", "explicit_self_answer", "teacher_restatement",
        "inferred_placeholder", "uncertain",
    }
    result: list[dict[str, Any]] = []
    previous_source = 0
    for item in raw_turns:
        if not isinstance(item, dict):
            continue
        try:
            source_line = int(item.get("source_line"))
        except (TypeError, ValueError):
            continue
        source = row_map.get(source_line)
        speaker = str(item.get("speaker") or "").strip().lower()
        turn_text = re.sub(r"\s+", " ", str(item.get("text") or "")).strip()
        if not source or source_line < previous_source or speaker not in {"teacher", "student", "uncertain"} or not turn_text:
            continue
        previous_source = source_line
        derivation = str(item.get("derivation") or "").strip()
        if derivation not in allowed_derivations:
            derivation = "uncertain" if speaker == "uncertain" else "explicit_self_answer" if speaker == "student" else "original_teacher"
        if speaker == "student" and derivation == "original_teacher":
            derivation = "explicit_self_answer"
        if speaker == "uncertain":
            derivation = "uncertain"
        try:
            confidence = max(0.0, min(1.0, float(item.get("confidence", 0.7))))
        except (TypeError, ValueError):
            confidence = 0.7
        try:
            student_index = int(item.get("student_index")) if item.get("student_index") not in (None, "") else None
        except (TypeError, ValueError):
            student_index = None
        result.append({
            "speaker": speaker,
            "text": turn_text,
            "student_index": student_index if speaker == "student" and student_index and student_index > 0 else None,
            "simulated": speaker == "student",
            "derivation": derivation,
            "confidence": round(confidence, 3),
            "source_line": source_line,
            "source_time": str(source.get("time") or ""),
            "source_text": str(source.get("text") or ""),
        })
    if not result:
        raise ValueError("模型话轮未通过证据校验")
    covered_source_lines = {int(item["source_line"]) for item in result}
    missing_source_lines = sorted(set(row_map) - covered_source_lines)
    if missing_source_lines:
        missing = "、".join(str(value) for value in missing_source_lines[:8])
        raise ValueError(f"模型遗漏原稿行：{missing}")
    result = _normalize_student_groups(result)
    source_text = _normalize_refinement_text("".join(str(row["text"]) for row in rows))
    output_text = _normalize_refinement_text("".join(
        item["text"] for item in result if item["derivation"] != "inferred_placeholder"
    ))
    if len(output_text) > len(source_text) * 2.4 + 800:
        raise ValueError("模型输出相对原稿扩写过多")
    similarity = SequenceMatcher(None, source_text, output_text).ratio() if source_text and output_text else 0.0
    if similarity < 0.32:
        raise ValueError("模型输出与原稿相似度过低")
    corrections: list[dict[str, str]] = []
    for item in parsed.get("corrections") or []:
        if not isinstance(item, dict):
            continue
        before = str(item.get("before") or "").strip()
        after = str(item.get("after") or "").strip()
        basis = str(item.get("basis") or "").strip()
        if before and after and before != after and _normalize_refinement_text(before) in source_text:
            corrections.append({"before": before[:120], "after": after[:120], "basis": basis[:180]})
    return result, corrections[:80]


def _fallback_trial_turns(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    turns: list[dict[str, Any]] = []
    brief = re.compile(r"^(?:嗯+|啊+|哦+|对|好|是|行|可以)[。！!？?，,、\s]*$")
    for row in rows:
        speaker, content, simulated, role_label = _speaker_and_content(str(row["text"]))
        if not role_label:
            speaker = "uncertain" if brief.fullmatch(content) else "teacher"
            simulated = False
        normalized_speaker = "uncertain" if speaker == "other" else speaker
        simulated = normalized_speaker == "student"
        turns.append({
            "speaker": normalized_speaker,
            "text": content,
            "student_index": None,
            "simulated": simulated,
            "derivation": "uncertain" if normalized_speaker == "uncertain" else "explicit_self_answer" if simulated else "original_teacher",
            "confidence": 1.0 if role_label else 0.35,
            "source_line": int(row["source_line"]),
            "source_time": str(row.get("time") or ""),
            "source_text": str(row.get("text") or ""),
        })
    return turns


def _format_trial_transcript(turns: list[dict[str, Any]]) -> str:
    rows: list[str] = []
    for turn in turns:
        speaker = str(turn.get("speaker") or "uncertain")
        if speaker == "teacher":
            label = "教师话语"
        elif speaker == "student":
            index = turn.get("student_index")
            label = f"模拟学生话语{index}" if index else "模拟学生话语"
        else:
            label = "无法确定"
        time_label = f"{turn.get('source_time')} " if turn.get("source_time") else ""
        rows.append(f"{time_label}{label}：{turn.get('text', '').strip()}")
    return "\n".join(rows).strip()


def _refine_trial_chunk(
    chunk_index: int,
    chunk: tuple[dict[str, Any], ...],
    client: OpenAI,
    metadata: dict[str, Any],
    reference_text: str,
) -> _RefinementChunkResult:
    # Every worker owns its row dictionaries and local result lists.  Only an
    # immutable snapshot crosses back to the main thread for ordered merging.
    rows = [dict(row) for row in chunk]
    try:
        response = client.responses.create(
            model=MODEL,
            instructions=(
                "你是严谨的中文课堂逐字稿编辑。只能纠正和重组给定录音文字，"
                "不得补写课堂事实；必须输出合法 JSON，不展示内部思考过程。"
            ),
            input=_trial_refinement_prompt(rows, metadata, reference_text),
            reasoning={"effort": os.getenv("TRANSCRIPT_REFINE_REASONING_EFFORT", REASONING_EFFORT)},
            max_output_tokens=max(1800, int(os.getenv("TRANSCRIPT_REFINE_MAX_OUTPUT_TOKENS", "12000"))),
            store=False,
            timeout=_refinement_timeout_seconds(),
        )
        parsed = _parse_model_json(getattr(response, "output_text", ""))
        if not parsed:
            raise ValueError("模型返回格式无法解析")
        turns, corrections = _validated_model_turns(parsed, rows)
        return _RefinementChunkResult(
            chunk_index=chunk_index,
            turns=_freeze_records(turns),
            corrections=_freeze_records(corrections),
            used_model=True,
        )
    except Exception as exc:
        reason = re.sub(r"\s+", " ", str(exc or "")).strip()[:180]
        warning = (
            f"第 {rows[0]['source_line']}-{rows[-1]['source_line']} 行未完成模型标注："
            f"{type(exc).__name__}{f'（{reason}）' if reason else ''}"
        )
        return _RefinementChunkResult(
            chunk_index=chunk_index,
            turns=_freeze_records(_fallback_trial_turns(rows)),
            corrections=(),
            used_model=False,
            warning=warning,
        )


def refine_trial_transcript(
    transcript: str,
    client: OpenAI | None = None,
    metadata: dict[str, Any] | None = None,
    reference_text: str = "",
    use_model: bool = True,
) -> dict[str, Any]:
    """Correct single-teacher trial ASR and expose simulated student turns."""

    started_at = time.perf_counter()
    raw_text = str(transcript or "")[:MAX_REFINEMENT_CHARS].strip()
    rows = _clean_trial_source(raw_text)
    if not rows:
        raise ValueError("转写稿为空或未提取到可处理的讲话内容")
    chunks = _refinement_chunks(rows)
    turns: list[dict[str, Any]] = []
    corrections: list[dict[str, str]] = []
    model_chunks = 0
    failed_chunks = 0
    warnings: list[str] = []
    if use_model and client is not None:
        work_items = [
            (index, tuple(dict(row) for row in chunk))
            for index, chunk in enumerate(chunks)
        ]
        with ThreadPoolExecutor(
            max_workers=_refinement_worker_count(),
            thread_name_prefix="transcript-refine",
        ) as executor:
            futures = [
                executor.submit(
                    _refine_trial_chunk,
                    index,
                    chunk,
                    client,
                    dict(metadata or {}),
                    str(reference_text or ""),
                )
                for index, chunk in work_items
            ]
            # Read futures by source chunk index rather than completion order.
            chunk_results = [future.result() for future in futures]
        for chunk_result in sorted(chunk_results, key=lambda item: item.chunk_index):
            turns.extend(_thaw_records(chunk_result.turns))
            corrections.extend(_thaw_records(chunk_result.corrections))
            if chunk_result.used_model:
                model_chunks += 1
            else:
                failed_chunks += 1
            if chunk_result.warning:
                warnings.append(chunk_result.warning)
    else:
        turns = _fallback_trial_turns(rows)
        warnings.append("大模型未启用，当前仅完成保守清洗；未从自问自答中推导模拟学生话语。")
    stats = {
        "teacher_turns": sum(item["speaker"] == "teacher" for item in turns),
        "simulated_student_turns": sum(item["speaker"] == "student" for item in turns),
        "uncertain_turns": sum(item["speaker"] == "uncertain" for item in turns),
        "placeholder_turns": sum(item.get("derivation") == "inferred_placeholder" for item in turns),
        "correction_count": len(corrections),
    }
    used_model = model_chunks > 0
    return {
        "raw_text": raw_text,
        "text": _format_trial_transcript(turns),
        "turns": turns,
        "corrections": corrections,
        "stats": stats,
        "used_model": used_model,
        "model": MODEL if used_model else None,
        "processing_mode": "llm" if used_model and model_chunks == len(chunks) else "partial" if used_model else "fallback",
        "refinement_ms": round((time.perf_counter() - started_at) * 1000, 2),
        "chunk_count": len(chunks),
        "model_chunk_count": model_chunks,
        "failed_chunk_count": failed_chunks,
        "warning": "；".join(warnings) if warnings else None,
        "evidence_notice": "模拟学生话语来自教师自问自答、转述或有证据的互动占位，只用于评价试讲互动设计，不代表真实学生参与或学习效果。",
    }


def _contains_any(text: str, words: Iterable[str]) -> bool:
    return any(word and word in text for word in words)


def _contexts(lines: list[TranscriptLine], word: str, limit: int = 3) -> list[str]:
    return [f"{line.time} {line.content}" for line in lines if word in line.content][:limit]


def _hotwords(lines: list[TranscriptLine], speaker: str) -> list[dict[str, Any]]:
    selected = [line for line in lines if line.speaker == speaker]
    counts: Counter[str] = Counter()
    for word in HOTWORD_LEXICON[speaker]:
        count = sum(line.content.count(word) for line in selected)
        if count:
            counts[word] = count
    # Add meaningful repeated Chinese phrases so an unfamiliar subject is not
    # forced into a mathematics-specific vocabulary.
    phrase_counts: Counter[str] = Counter()
    for line in selected:
        for phrase in _CJK_RUN.findall(line.content):
            if phrase in STOPWORDS or len(phrase) > 8:
                continue
            phrase_counts[phrase] += 1
    for phrase, count in phrase_counts.most_common(16):
        if count >= 2 and phrase not in counts:
            counts[phrase] = count
    result: list[dict[str, Any]] = []
    for rank, (word, count) in enumerate(counts.most_common(10), start=1):
        result.append({
            "rank": rank,
            "word": word,
            "count": count,
            "contexts": _contexts(selected, word),
        })
    return result


def _question_counts(lines: list[TranscriptLine]) -> dict[str, int]:
    teacher = [line for line in lines if line.speaker == "teacher"]
    students = [line for line in lines if line.speaker == "student"]
    simulated_students = [line for line in students if line.simulated]
    observed_students = [line for line in students if not line.simulated]
    other = [line for line in lines if line.speaker == "other"]
    question_words = ("？", "?", "为什么", "怎么", "多少", "谁", "有没有", "能不能", "同意吗", "你觉得")
    deep_words = ("为什么", "依据", "理由", "解释", "规律", "如果", "怎么证明", "还能", "有什么发现")
    feedback_words = ("很好", "真棒", "关键", "对了", "不错", "再说", "补充", "有道理", "纠正", "提醒")
    open_words = ("为什么", "怎么", "理由", "依据", "如果", "有什么发现", "你觉得", "怎样", "还能")
    collective_words = ("齐", "全班", "一起", "生齐", "齐答")
    teacher_questions = [line for line in teacher if _contains_any(line.content, question_words)]
    open_questions = [line for line in teacher_questions if _contains_any(line.content, open_words)]
    irf = 0
    for index, line in enumerate(lines):
        if line.speaker != "teacher" or not _contains_any(line.content, question_words):
            continue
        answer_at = next((j for j in range(index + 1, min(index + 5, len(lines))) if lines[j].speaker == "student"), None)
        if answer_at is not None and any(lines[j].speaker == "teacher" for j in range(answer_at + 1, min(answer_at + 4, len(lines)))):
            irf += 1
    student_questions = [line for line in students if _contains_any(line.content, ("？", "?", "为什么", "怎么", "吗"))]
    simulated_student_questions = [line for line in simulated_students if line in student_questions]
    wait = [line for line in teacher if _contains_any(line.content, ("想一想", "先思考", "不急", "等待", "停顿", "五秒", "3秒", "5秒"))]
    collaboration = [line for line in lines if _contains_any(line.content, ("小组", "同桌", "合作", "讨论", "交流", "同伴", "汇报"))]
    return {
        "teacher_lines": len(teacher),
        "student_lines": len(students),
        "observed_student_lines": len(observed_students),
        "simulated_student_lines": len(simulated_students),
        "other_lines": len(other),
        "questions": len(teacher_questions),
        "open_questions": len(open_questions),
        "closed_questions": max(0, len(teacher_questions) - len(open_questions)),
        "deep_questions": sum(_contains_any(line.content, deep_words) for line in teacher),
        "answers": len(students),
        "individual_answers": sum(not _contains_any(line.content, collective_words) for line in students),
        "collective_answers": sum(_contains_any(line.content, collective_words) for line in students),
        "feedback": sum(_contains_any(line.content, feedback_words) for line in teacher),
        "student_questions": len(student_questions),
        "observed_student_questions": len(student_questions) - len(simulated_student_questions),
        "simulated_student_questions": len(simulated_student_questions),
        "wait_evidence": len(wait),
        "collaboration": len(collaboration),
        "irf_chains": irf,
    }


def _score_dimensions(counts: dict[str, int], lines: list[TranscriptLine]) -> list[dict[str, Any]]:
    total = max(1, counts["questions"])
    open_ratio = counts["open_questions"] / total
    context_hits = sum(_contains_any(line.content, EVENT_RULES[0]["keys"]) for line in lines)
    operation_hits = sum(_contains_any(line.content, EVENT_RULES[1]["keys"]) for line in lines)
    transfer_hits = sum(_contains_any(line.content, EVENT_RULES[5]["keys"]) for line in lines)
    pattern_hits = sum(_contains_any(line.content, EVENT_RULES[4]["keys"]) for line in lines)
    interaction = min(20, round(9 + open_ratio * 7 + min(4, counts["deep_questions"] * 0.8)))
    answer_score = min(20, 9 + min(4, counts["wait_evidence"] * 2) + min(5, counts["individual_answers"] / max(1, counts["answers"]) * 6) - min(4, counts["collective_answers"] / max(1, counts["answers"]) * 4))
    simulated_only = counts["simulated_student_lines"] > 0 and counts["observed_student_lines"] == 0
    if simulated_only:
        answer_score = min(15, answer_score)
    answer_reason = (
        f"识别到 {counts['simulated_student_lines']} 条模拟学生话语；本项评价试讲中的应答设计完整度，不证明真实学生覆盖。"
        if simulated_only
        else "看开放问题后的思考时间以及个别应答与齐答的平衡。"
    )
    dimensions = [
        ("情境与问题设计", min(20, 10 + min(7, context_hits * 2) + min(3, counts["student_questions"])),
         "看课堂是否用真实情境或认知冲突提出可探究问题。"),
        ("师生互动与思维引导", interaction,
         f"开放性提问 {counts['open_questions']} 次、高阶追问 {counts['deep_questions']} 次，并考察 IRF 反馈质量。"),
        ("操作体验与概念建构", min(20, 9 + min(8, operation_hits * 2) + min(3, counts["collaboration"])),
         "看操作、语言、图示和符号是否形成从具体到抽象的证据链。"),
        ("等待时间与应答覆盖", answer_score, answer_reason),
        ("规律发现与迁移应用", min(20, 9 + min(6, pattern_hits * 1.5) + min(5, transfer_hits * 2)),
         "看学生是否归纳不变结构，并在条件变化的新任务中验证方法。"),
    ]
    return [{"dimension": name, "score": max(1, min(20, int(score))), "max_score": 20, "reason": reason} for name, score, reason in dimensions]


def _retrieval_context(
    lines: list[TranscriptLine],
    retriever: BM25Retriever,
    theory_names: list[str] | None = None,
    subject: str = "",
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    selected = {str(name).strip() for name in (theory_names or []) if str(name).strip()}
    subject_scope = infer_subject_scope(subject)
    subject_label = subject_scope_label(subject_scope)
    mappings: list[dict[str, Any]] = []
    references: dict[str, dict[str, Any]] = {}
    for event in EVENT_RULES:
        event_lines = [line for line in lines if _contains_any(line.content, event["keys"])]
        if not event_lines:
            continue
        query = " ".join([
            subject_label,
            event["title"],
            *THEORY_HINTS.get(event["title"], ()),
            *[line.content for line in event_lines[:3]],
        ])
        candidates = retriever.search(query, top_k=24)
        matching_names = retriever.matching_theory_names(query)
        hits = [
            hit for hit in candidates
            if theory_is_compatible(hit.chunk, subject_scope)
            and (
                str(hit.chunk.get("theory_name", "")) in matching_names
                or (hit.score >= 35.0 and retriever.query_coverage(query, hit) >= 0.15)
            )
        ]
        if selected:
            scoped = [hit for hit in hits if str(hit.chunk.get("theory_name", "")) in selected]
            if scoped:
                hits = scoped
        hits = hits[:3]
        if not hits:
            continue
        primary = hits[0]
        theory_name = str(primary.chunk.get("theory_name", "未命名理论"))
        evidence = [
            f"{line.time} {'（模拟学生话轮）' if line.simulated else ''}{line.content}"
            for line in event_lines[:3]
        ]
        mapping = {
            "event": event["title"],
            "time": event_lines[0].time,
            "theory_name": theory_name,
            "evidence": evidence,
            "how_applied": (
                f"试讲脚本中设计了模拟学生话轮“{event_lines[0].content[:70]}”，召回理论片段用于评价互动设计；该话轮不证明真实学生表现。"
                if event_lines[0].simulated
                else f"课堂中出现“{event_lines[0].content[:70]}”等行为，召回理论片段用于解释其教学机制；是否充分落地需结合学生后续表现核验。"
            ),
            "mechanism": str(primary.chunk.get("text", ""))[:420],
            "confidence": round(min(0.99, max(0.2, primary.score / 100)), 2),
            "sources": [],
        }
        for hit in hits:
            chunk = hit.chunk
            source = {
                "chunk_id": chunk.get("chunk_id", ""),
                "theory_name": chunk.get("theory_name", ""),
                "category_path": list(chunk.get("category_path", [])),
                "source_type": chunk.get("source_type", ""),
                "source_title": chunk.get("source_title", ""),
                "score": round(float(hit.score), 4),
            }
            mapping["sources"].append(source)
            references[source["chunk_id"] or f"{source['source_title']}:{len(references)}"] = source
        mappings.append(mapping)
        if len(mappings) >= MAX_THEORY_MAPPINGS:
            break
    return mappings, list(references.values())


def _diagnoses(counts: dict[str, int], dimensions: list[dict[str, Any]], lines: list[TranscriptLine]) -> list[dict[str, Any]]:
    def item(dimension: str, indicator: str, score: int, basis: str, action: str, expected: str, measure: str) -> dict[str, Any]:
        return {"dimension": dimension, "indicator": indicator, "score": score, "max_score": 5, "basis": basis, "action": action, "expected": expected, "measure": measure}

    questions = max(1, counts["questions"])
    simulated_only = counts["simulated_student_lines"] > 0 and counts["observed_student_lines"] == 0
    agency_score = max(1, min(5, 1 + counts["student_questions"]))
    coverage_score = max(1, min(5, round(counts["individual_answers"] / max(1, counts["answers"]) * 5)))
    if simulated_only:
        agency_score = min(3, agency_score)
        coverage_score = min(3, coverage_score)
    agency_basis = (
        f"单人试讲中识别到模拟学生主动提问 {counts['simulated_student_questions']} 次；只能判断教师是否设计了学生发问位置，不能判断真实学生主体性。"
        if simulated_only
        else f"记录到学生主动提问 {counts['student_questions']} 次。"
    )
    coverage_basis = (
        f"识别到模拟学生应答 {counts['simulated_student_lines']} 条；用于检查提问—应答—反馈脚本，不代表真实学生覆盖率。"
        if simulated_only
        else f"个别应答 {counts['individual_answers']} 次，集体齐答 {counts['collective_answers']} 次。"
    )
    return [
        item("学生主体性", "学生主动提问、质疑、互动频次", agency_score, agency_basis, "在规律总结后设置“我有一个问题”环节，先独立写下问题，再由同伴追问。", "真实课堂中至少出现 5 个学生自发问题。", "实课录音中编码真实学生问题，并区分事实、解释、拓展三类。"),
        item("认知深度", "高认知问题占教师问题比例", max(1, min(5, round(counts["deep_questions"] / questions * 5))), f"高阶追问 {counts['deep_questions']} 次 / 教师问题 {counts['questions']} 次。", "开放问题后保留独立思考和证据比较，要求学生说明“因为……所以……”。", "完整解释型回答达到个人回答的 60%。", "统计开放问题比例、回答句长和是否提供依据。"),
        item("操作有效性", "学具/实物是否促进概念理解", max(1, min(5, 1 + min(3, sum(_contains_any(line.content, EVENT_RULES[1]['keys']) for line in lines)) + min(1, counts["answers"] > 3))), f"逐字稿中识别到 {sum(_contains_any(line.content, EVENT_RULES[1]['keys']) for line in lines)} 条操作/表征证据；以实际操作—表达链核验。", "每次操作后增加画图或算式记录，并请学生反向解释操作意义。", "至少 90% 学生能用图或符号解释操作结果。", "收集任务单或出口条，统计解释正确率。"),
        item("应答覆盖面", "个别应答与集体齐答的平衡", coverage_score, coverage_basis, "先独立作答或同桌互说，再随机抽取不同层次学生表达，避免只听最快回答者。", "真实课堂中每名学生至少有 2 次可核验的独立表达机会。", "实课中按座位或学习单记录独立回答覆盖率。"),
        item("规律归纳严谨性", "学生是否自主验证规律并说明边界", max(1, min(5, 1 + min(3, sum(_contains_any(line.content, EVENT_RULES[4]['keys']) for line in lines)) + min(1, counts["deep_questions"] > 0))), f"记录到 {sum(_contains_any(line.content, EVENT_RULES[4]['keys']) for line in lines)} 条规律/发现证据，需进一步核验是否由学生提出并用变式验证。", "提供一个新例子和一个反例，让学生先判断适用性，再完整表述不变关系。", "每组提交至少 1 个验证例和 1 个边界说明。", "检查新例子判断、理由和反例解释是否完整。"),
    ]


def _markdown_report(
    metadata: dict[str, Any],
    lines: list[TranscriptLine],
    counts: dict[str, int],
    teacher_hotwords: list[dict[str, Any]],
    student_hotwords: list[dict[str, Any]],
    other_hotwords: list[dict[str, Any]],
    dimensions: list[dict[str, Any]],
    mappings: list[dict[str, Any]],
    diagnoses: list[dict[str, Any]],
) -> str:
    total = sum(item["score"] for item in dimensions)
    simulated_only = counts["simulated_student_lines"] > 0 and counts["observed_student_lines"] == 0
    evidence_notice = (
        "本稿来自教师单人试讲。下列“模拟学生话语”由教师自问自答、转述或有证据的互动占位识别而来，只用于评价互动脚本设计，不代表真实学生参与、掌握程度或课堂生成。"
        if simulated_only
        else "本稿按课堂实录处理；说话人身份仍应结合原始音视频核验。"
    )
    student_heading = "模拟学生热词" if simulated_only else "学生热词"
    hotword_table = lambda rows: "\n".join(
        f"| {item['rank']} | {item['word']} | {item['count']} | {'；'.join(item['contexts']) or '未记录完整语境'} |"
        for item in rows
    ) or "| - | 未发现稳定热词 | 0 | 逐字稿证据不足 |"
    mapping_blocks: list[str] = []
    for index, item in enumerate(mappings, start=1):
        source_text = ", ".join(
            "{}（{}）".format(source.get("source_title", ""), source.get("source_type", ""))
            for source in item.get("sources", [])
        )
        mapping_blocks.append(
            f"### {index}. {item['event']} → {item['theory_name']}\n\n"
            f"- 课堂证据：{'；'.join(item['evidence'])}\n"
            f"- 理论如何结合：{item['how_applied']}\n"
            f"- 召回理论机制：{item['mechanism']}\n"
            f"- 证据置信度：{item['confidence']}\n"
            f"- 来源：{source_text or '未返回来源元数据'}"
        )
    mapping_text = "\n\n".join(mapping_blocks) or "暂未召回与课堂行为直接相关的理论片段；请补充更完整逐字稿后重试。"
    diagnosis_table = "\n".join(
        f"| {item['dimension']} | {item['indicator']} | {item['score']}/5 | {item['basis']} |"
        for item in diagnoses
    )
    recommendation_table = "\n".join(
        f"| {item['dimension']} | {item['action']} | {item['expected']} | {item['measure']} |"
        for item in diagnoses
    )
    return f"""# 课堂观察分析报告

课题：{metadata.get('title') or '未命名课堂'}  
学科：{metadata.get('subject') or '待补充'}  
年级：{metadata.get('grade') or '待补充'}  
课堂时长：{metadata.get('duration') or '待补充'}  
  分析日期：{metadata.get('analysis_date') or time.strftime('%Y-%m-%d')}  
  分析依据：课堂逐字稿 + 606 条教育理论目录对应的知识库检索片段

> 证据属性：{evidence_notice}

## 一、课堂热词

### 1. 教师热词
| 排序 | 热词 | 出现频次 | 典型语境 |
| --- | --- | ---: | --- |
{hotword_table(teacher_hotwords)}

### 2. {student_heading}
| 排序 | 热词 | 出现频次 | 典型语境 |
| --- | --- | ---: | --- |
{hotword_table(student_hotwords)}

### 3. 未分角色热词

本节仅在音频转写未提供教师/学生说话人标签时使用；热词可用于核对文本，但不据此推断发言身份。
| 排序 | 热词 | 出现频次 | 典型语境 |
| --- | --- | ---: | --- |
{hotword_table(other_hotwords)}

## 二、课堂数据看板

| 指标 | 数据 | 说明 |
| --- | ---: | --- |
| 话语记录 | {len(lines)} 条 | 教师 {counts['teacher_lines']} 条，真实学生 {counts['observed_student_lines']} 条，模拟学生 {counts['simulated_student_lines']} 条，无法确定 {counts['other_lines']} 条 |
| 教师提问 | {counts['questions']} 次 | 开放性 {counts['open_questions']} 次，封闭性 {counts['closed_questions']} 次 |
| 高阶追问 | {counts['deep_questions']} 次 | 含理由、依据、假设和规律类问题 |
| 学生应答 | {counts['answers']} 次 | 其中模拟应答 {counts['simulated_student_lines']} 次；试讲稿只据此评价应答位置与内容设计 |
| IRF 互动链 | {counts['irf_chains']} 个 | 教师发起—学生回应—教师反馈；模拟话轮形成的是设计链，不是实课行为链 |
| 教师反馈 | {counts['feedback']} 次 | 仅统计逐字稿中可识别的反馈语句 |
| 学生主动提问 | {counts['student_questions']} 次 | 真实 {counts['observed_student_questions']} 次，模拟 {counts['simulated_student_questions']} 次 |
| 合作交流证据 | {counts['collaboration']} 条 | 小组、同桌、讨论、同伴互评等 |
| 等待时间证据 | {counts['wait_evidence']} 条 | 只有原文含停顿或秒数时才可判断等待时长 |

## 三、评价指标分数与五维图（雷达图数据）

评分满分 100 分，每个维度满分 20 分；分数来自逐字稿可观察证据，不把缺失证据当作事实。单人试讲中的模拟学生话语只参与互动设计评价，应答覆盖与学生主体性不得解释为真实学习效果。

| 维度 | 得分 | 评分理由 |
| --- | ---: | --- |
{chr(10).join(f"| {item['dimension']} | {item['score']}/20 | {item['reason']} |" for item in dimensions)}
| **总分** | **{total}/100** | 五维证据综合，不替代教师专业判断。 |

```text
五维雷达图数据：{', '.join(f"{item['dimension']}={item['score']}" for item in dimensions)}
```

## 四、理论映射

理论映射严格采用“课堂行为—理论片段—结合方式”一一对应；没有逐字稿证据的理论不强行套用。

{mapping_text}

## 五、教学诊断：指标化标准（5 分制）

| 诊断维度 | 指标内容 | 本课得分 | 证据依据 |
| --- | --- | ---: | --- |
{diagnosis_table}

## 六、教学优化建议：指标化标准

| 优化方向 | 具体行动 | 预期效果（定量） | 下次课评估方式 |
| --- | --- | --- | --- |
{recommendation_table}

## 七、证据边界与结论

本报告只对逐字稿中明确记录的教师话语和可追溯的模拟学生话轮作判断。模拟话轮用于评价教师预设的提问—应答—反馈结构，不证明真实学生说过这些话，也不证明真实参与率、掌握程度或课堂生成性。语气、表情、板书、真实等待秒数和未转写行为不作推断。建议进入真实课堂后继续保留时间戳，并同步记录学生作品、座位覆盖和任务完成情况，以检验上述指标。
"""


def _ensure_report_metadata_header(report: str, metadata: dict[str, Any]) -> str:
    """Keep request metadata visible when model polishing replaces the draft."""

    text = str(report or "").strip()
    values = {
        "课题": str(metadata.get("title") or "未命名课堂"),
        "学科": str(metadata.get("subject") or "待补充"),
        "年级": str(metadata.get("grade") or "待补充"),
        "课堂时长": str(metadata.get("duration") or "待补充"),
    }
    head = text[:1200]
    if all(
        re.search(rf"{re.escape(label)}\s*[:：]\s*{re.escape(value)}", head)
        for label, value in values.items()
    ):
        return text

    header = [
        "# 课堂观察分析报告",
        "",
        f"课题：{values['课题']}  ",
        f"学科：{values['学科']}  ",
        f"年级：{values['年级']}  ",
    ]
    teacher = str(metadata.get("teacher") or "").strip()
    if teacher:
        header.append(f"授课教师：{teacher}  ")
    header.extend([
        f"课堂时长：{values['课堂时长']}  ",
        f"分析日期：{metadata.get('analysis_date') or time.strftime('%Y-%m-%d')}  ",
        "分析依据：课堂逐字稿 + 606 条教育理论目录对应的知识库检索片段",
    ])
    body = re.sub(r"^\s*#\s+课堂观察分析报告\s*", "", text, count=1).lstrip()
    return "\n".join(header) + (f"\n\n{body}" if body else "")


def _compact_prompt(payload: dict[str, Any], deterministic: dict[str, Any]) -> str:
    context_lines: list[str] = []
    for index, mapping in enumerate(deterministic["theory_mapping"], start=1):
        context_lines.append(f"[{index}] {mapping['theory_name']}：{mapping['mechanism']}\n课堂证据：{'；'.join(mapping['evidence'])}")
    return f"""你是课堂观察报告编辑。只能基于下列已计算事实和理论检索片段润色，不得新增逐字稿中没有的事件、次数、理论或学生表现。
请只输出 Markdown 正文，不要输出 JSON、代码围栏或内部思考过程。必须使用并保留以下四个标题：
## 一、课堂热词
## 二、评价指标分数与五维图（雷达图数据）
## 三、理论映射
## 四、教学诊断与优化建议的指标化标准
理论映射要逐条说明“课堂证据—理论—如何结合”，并保留来源标题；评分、频次和量化指标必须与已计算数据一致。
如果 evidence_mode=teacher_trial_simulation，必须明确写出“模拟学生话语只用于评价试讲互动设计，不代表真实学生参与或学习效果”，不得把模拟话轮写成真实课堂表现。

课堂元数据：{json.dumps(payload, ensure_ascii=False)}
已计算数据：{json.dumps({k: v for k, v in deterministic.items() if k not in {'report'}}, ensure_ascii=False)}
理论检索片段：\n{chr(10).join(context_lines)}
"""


def _parse_model_json(text: str) -> dict[str, Any] | None:
    value = str(text or "").strip()
    if value.startswith("```"):
        value = re.sub(r"^```(?:json)?\s*|\s*```$", "", value, flags=re.I | re.S).strip()
    start, end = value.find("{"), value.rfind("}")
    if start < 0 or end <= start:
        return {"report_markdown": value} if _is_usable_model_report(value) else None
    try:
        parsed = json.loads(value[start : end + 1])
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _is_usable_model_report(text: str, require_simulation_notice: bool = False) -> bool:
    value = str(text or "")
    required_sections = ("课堂热词", "评价指标", "理论映射", "指标化")
    return (
        len(value.strip()) > 500
        and all(section in value for section in required_sections)
        and (not require_simulation_notice or "模拟学生" in value)
    )


def generate_observation_report(
    payload: dict[str, Any],
    retriever: BM25Retriever,
    client: OpenAI | None = None,
    use_model: bool = True,
) -> dict[str, Any]:
    transcript = str(payload.get("transcript", ""))[:MAX_TRANSCRIPT_CHARS]
    lines = parse_transcript(transcript)
    if not lines:
        raise ValueError("逐字稿为空或无法识别有效段落")
    counts = _question_counts(lines)
    teacher_hotwords = _hotwords(lines, "teacher")
    student_hotwords = _hotwords(lines, "student")
    other_hotwords = _hotwords(lines, "other")
    dimensions = _score_dimensions(counts, lines)
    mappings, references = _retrieval_context(
        lines,
        retriever,
        payload.get("theory_names"),
        str(payload.get("subject") or ""),
    )
    diagnoses = _diagnoses(counts, dimensions, lines)
    metadata = {key: payload.get(key, "") for key in ("title", "subject", "grade", "duration", "teacher", "analysis_date")}
    report = _markdown_report(metadata, lines, counts, teacher_hotwords, student_hotwords, other_hotwords, dimensions, mappings, diagnoses)
    simulated_only = counts["simulated_student_lines"] > 0 and counts["observed_student_lines"] == 0
    evidence_mode = "teacher_trial_simulation" if simulated_only else "classroom_observation"
    evidence_notice = (
        "模拟学生话语只用于评价试讲互动设计，不代表真实学生参与或学习效果。"
        if simulated_only
        else "说话人和课堂行为以当前逐字稿为准，仍应结合原始音视频核验。"
    )
    result: dict[str, Any] = {
        "summary": f"本课共识别 {len(lines)} 条话语（教师 {counts['teacher_lines']}、真实学生 {counts['observed_student_lines']}、模拟学生 {counts['simulated_student_lines']}、无法确定 {counts['other_lines']}），召回 {len(mappings)} 条理论映射，五维总分 {sum(item['score'] for item in dimensions)}/100。",
        "lines": [
            {
                "index": line.index,
                "time": line.time,
                "content": line.content,
                "speaker": line.speaker,
                "simulated": line.simulated,
                "role_label": line.role_label,
                "tags": [],
            }
            for line in lines
        ],
        "transcript_stats": counts,
        "hotwords": {"teacher": teacher_hotwords, "student": student_hotwords, "other": other_hotwords},
        "dimensions": dimensions,
        "total_score": sum(item["score"] for item in dimensions),
        "theory_mapping": mappings,
        "diagnoses": diagnoses,
        "recommendations": diagnoses,
        "references": references,
        "report": report,
        "model": MODEL,
        "used_model": False,
        "evidence_mode": evidence_mode,
        "evidence_notice": evidence_notice,
        "warning": (
            evidence_notice
            if simulated_only
            else "逐字稿中有无法确定的话轮；教师/学生热词和应答覆盖只统计已标注内容。"
            if counts["other_lines"] else None
        ),
    }
    if not use_model or client is None:
        return result
    try:
        response = client.responses.create(
            model=MODEL,
            instructions="你是严谨的教育研究报告编辑。输出可核验、克制，不展示内部思维链。",
            input=_compact_prompt(payload, result),
            reasoning={"effort": REASONING_EFFORT},
            max_output_tokens=5500,
            store=False,
        )
        parsed = _parse_model_json(getattr(response, "output_text", ""))
        if parsed:
            report_valid = isinstance(parsed.get("report_markdown"), str) and _is_usable_model_report(
                parsed["report_markdown"],
                require_simulation_notice=simulated_only,
            )
            if report_valid and isinstance(parsed.get("summary"), str) and parsed["summary"].strip():
                result["summary"] = parsed["summary"].strip()
            if report_valid:
                result["report"] = _ensure_report_metadata_header(
                    parsed["report_markdown"], metadata
                )
            elif parsed.get("report_markdown"):
                result["warning"] = "模型报告缺少必要章节，已保留结构化证据报告。"
            result["used_model"] = report_valid
        else:
            result["warning"] = "模型返回格式无法解析，已保留基于逐字稿和理论库的结构化报告。"
    except Exception as exc:  # model failure must not discard deterministic evidence
        result["warning"] = f"模型润色暂不可用，已返回本地证据报告：{type(exc).__name__}"
    if simulated_only:
        boundary = evidence_notice
        result["warning"] = f"{result['warning']}；{boundary}" if result.get("warning") and boundary not in result["warning"] else (result.get("warning") or boundary)
    return result


def _format_timestamp(seconds: float) -> str:
    total = max(0, int(seconds or 0))
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def _read_funasr_worker_output(
    process: subprocess.Popen[str], responses: queue.Queue[dict[str, Any]]
) -> None:
    stdout = process.stdout
    if stdout is None:
        responses.put({"_worker_eof": True, "error": "FunASR worker stdout is unavailable"})
        return
    for raw_line in stdout:
        line = raw_line.strip()
        if not line.startswith(_FUNASR_PROTOCOL_PREFIX):
            continue
        try:
            payload = json.loads(line[len(_FUNASR_PROTOCOL_PREFIX) :])
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            responses.put(payload)
    responses.put(
        {
            "_worker_eof": True,
            "error": f"FunASR worker exited with code {process.poll()}",
        }
    )


def _funasr_worker_paths() -> tuple[Path, Path, Path]:
    root = Path(__file__).resolve().parent
    python_path = Path(os.getenv("FUNASR_PYTHON", r"python"))
    worker_path = Path(os.getenv("FUNASR_WORKER", str(root / "funasr_worker.py")))
    log_path = Path(os.getenv("FUNASR_LOG", str(root / ".runtime" / "funasr-worker.log")))
    return python_path, worker_path, log_path


def _start_funasr_worker() -> tuple[subprocess.Popen[str], queue.Queue[dict[str, Any]]]:
    global _FUNASR_PROCESS, _FUNASR_RESPONSES
    if _FUNASR_PROCESS is not None and _FUNASR_PROCESS.poll() is None and _FUNASR_RESPONSES is not None:
        return _FUNASR_PROCESS, _FUNASR_RESPONSES

    python_path, worker_path, log_path = _funasr_worker_paths()
    if not python_path.is_file():
        raise RuntimeError(f"FunASR Python 环境不存在：{python_path}")
    if not worker_path.is_file():
        raise RuntimeError(f"FunASR 工作进程脚本不存在：{worker_path}")

    log_path.parent.mkdir(parents=True, exist_ok=True)
    environment = os.environ.copy()
    environment.setdefault("PYTHONUTF8", "1")
    environment.setdefault("PYTHONIOENCODING", "utf-8")
    environment["MODELSCOPE_CACHE"] = os.getenv(
        "FUNASR_CACHE_DIR",
        os.getenv("MODELSCOPE_CACHE", r".runtime/funasr-models"),
    )
    source_root = worker_path.parent / "FunASR-main"
    if source_root.is_dir():
        existing_pythonpath = environment.get("PYTHONPATH", "")
        environment["PYTHONPATH"] = os.pathsep.join(
            item for item in (str(source_root), existing_pythonpath) if item
        )
    creationflags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    with log_path.open("a", encoding="utf-8") as log_stream:
        process = subprocess.Popen(
            [str(python_path), "-u", str(worker_path)],
            cwd=str(worker_path.parent),
            env=environment,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=log_stream,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
            creationflags=creationflags,
        )
    responses: queue.Queue[dict[str, Any]] = queue.Queue()
    reader = threading.Thread(
        target=_read_funasr_worker_output,
        args=(process, responses),
        name="edulink-funasr-output",
        daemon=True,
    )
    reader.start()
    _FUNASR_PROCESS = process
    _FUNASR_RESPONSES = responses
    return process, responses


def _terminate_funasr_worker() -> None:
    global _FUNASR_PROCESS, _FUNASR_RESPONSES
    process = _FUNASR_PROCESS
    _FUNASR_PROCESS = None
    _FUNASR_RESPONSES = None
    if process is None or process.poll() is not None:
        return
    try:
        process.terminate()
        process.wait(timeout=5)
    except Exception:
        try:
            process.kill()
        except Exception:
            pass


atexit.register(_terminate_funasr_worker)


def _request_funasr(audio_path: Path) -> dict[str, Any]:
    with _FUNASR_REQUEST_LOCK:
        process, responses = _start_funasr_worker()
        request_id = uuid.uuid4().hex
        request = {
            "id": request_id,
            "action": "transcribe",
            "audio_path": str(audio_path),
            "language": os.getenv("FUNASR_LANGUAGE", "zh"),
        }
        try:
            if process.stdin is None:
                raise RuntimeError("FunASR worker stdin is unavailable")
            process.stdin.write(json.dumps(request, ensure_ascii=False) + "\n")
            process.stdin.flush()
        except (BrokenPipeError, OSError) as exc:
            _terminate_funasr_worker()
            raise RuntimeError("FunASR 工作进程意外退出，请查看 .runtime/funasr-worker.log") from exc

        try:
            timeout_seconds = max(30.0, float(os.getenv("FUNASR_TIMEOUT_SECONDS", "1800")))
        except ValueError:
            timeout_seconds = 1800.0
        deadline = time.monotonic() + timeout_seconds
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                _terminate_funasr_worker()
                raise RuntimeError(
                    f"FunASR 转写超过 {int(timeout_seconds)} 秒，工作进程已重置"
                )
            try:
                response = responses.get(timeout=min(0.5, remaining))
            except queue.Empty:
                if process.poll() is not None:
                    _terminate_funasr_worker()
                    raise RuntimeError(
                        "FunASR 工作进程意外退出，请查看 .runtime/funasr-worker.log"
                    )
                continue
            if response.get("_worker_eof"):
                _terminate_funasr_worker()
                raise RuntimeError(
                    "FunASR 工作进程意外退出，请查看 .runtime/funasr-worker.log"
                )
            if str(response.get("id") or "") != request_id:
                continue
            if not response.get("ok"):
                raise RuntimeError(f"FunASR 转写失败：{response.get('error') or '未知错误'}")
            return response


def _convert_audio_to_wav(data: bytes, target_path: Path) -> None:
    """Decode browser audio formats to the stable input expected by FunASR."""

    try:
        import av

        with av.open(BytesIO(data)) as incoming, av.open(
            str(target_path), mode="w", format="wav"
        ) as outgoing:
            stream = outgoing.add_stream("pcm_s16le", rate=16_000)
            stream.layout = "mono"
            resampler = av.AudioResampler(format="s16", layout="mono", rate=16_000)
            decoded_frames = 0
            for frame in incoming.decode(audio=0):
                decoded_frames += 1
                converted = resampler.resample(frame)
                for item in converted if isinstance(converted, list) else [converted]:
                    if item is None:
                        continue
                    for packet in stream.encode(item):
                        outgoing.mux(packet)
            flushed = resampler.resample(None)
            for item in flushed if isinstance(flushed, list) else [flushed]:
                if item is None:
                    continue
                for packet in stream.encode(item):
                    outgoing.mux(packet)
            for packet in stream.encode(None):
                outgoing.mux(packet)
        if decoded_frames == 0:
            raise RuntimeError("音频中没有可解码的声音轨道")
    except ImportError as exc:
        raise RuntimeError("音频格式转换需要 PyAV：python -m pip install av") from exc
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"无法解码上传的音频文件：{exc}") from exc


def _format_funasr_transcript(response: dict[str, Any]) -> str:
    rows: list[str] = []
    segments = response.get("segments")
    if isinstance(segments, list):
        for segment in segments:
            if not isinstance(segment, dict):
                continue
            content = str(segment.get("text") or "").strip()
            if not content:
                continue
            start_ms = segment.get("start_ms")
            try:
                timestamp = _format_timestamp(float(start_ms) / 1000.0)
            except (TypeError, ValueError):
                timestamp = ""
            prefix = f"{timestamp} " if timestamp else ""
            rows.append(f"{prefix}未标注说话人：{content}")
    if rows:
        return "\n".join(rows)
    full_text = str(response.get("text") or "").strip()
    return f"未标注说话人：{full_text}" if full_text else ""


def _transcribe_audio_funasr(filename: str, data: bytes) -> str:
    temp_path: Path | None = None
    try:
        configured_dir = Path(
            os.getenv("FUNASR_TEMP_DIR", r".runtime/funasr-temp")
        )
        configured_dir.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            prefix="edulink-funasr-",
            suffix=".wav",
            dir=str(configured_dir),
            delete=False,
        ) as stream:
            temp_path = Path(stream.name)
        _convert_audio_to_wav(data, temp_path)
        return _format_funasr_transcript(_request_funasr(temp_path))
    finally:
        if temp_path is not None:
            try:
                temp_path.unlink(missing_ok=True)
            except OSError:
                pass


# Compatibility alias for integrations that used the former local-ASR helper.
_transcribe_audio_local = _transcribe_audio_funasr


def transcribe_audio(client: OpenAI | None, filename: str, data: bytes, content_type: str = "") -> tuple[str, str]:
    """Transcribe Chinese classroom audio through the relay or local FunASR.

    ``ASR_BACKEND=funasr`` is the default. ``auto`` tries the relay first and
    falls back to FunASR. ``local`` remains an alias for older deployments.
    """

    backend = os.getenv("ASR_BACKEND", "funasr").strip().lower()
    if backend not in {"auto", "relay", "funasr", "local"}:
        raise RuntimeError("ASR_BACKEND must be one of: auto, relay, funasr")
    if backend in {"auto", "relay"} and client is not None:
        stream = BytesIO(data)
        stream.name = filename or "classroom-audio"
        response = client.audio.transcriptions.create(
            model=os.getenv("ASR_RELAY_MODEL", "gpt-4o-mini-transcribe"),
            file=stream,
            language="zh",
            response_format="text",
        )
        text = getattr(response, "text", None) or str(response)
        return str(text).strip(), "relay"
    if backend == "relay":
        raise RuntimeError("ASR_BACKEND=relay 但模型中转站客户端未就绪")
    # Keep the former helper name as an interception point for integrations
    # that monkeypatch the local ASR adapter during tests.
    return _transcribe_audio_local(filename, data), "funasr"
