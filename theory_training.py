"""Backend services for theory-learning scenario training.

The training catalogue is deliberately kept separate from the browser.  On
startup we bootstrap questions that already exist in the theory knowledge
base, then use the configured model only when a pool needs more questions.
Generated questions and attempts are persisted as small JSON files under
``rag/data`` so a browser refresh (or a second client) can reuse them.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import random
import re
import secrets
import threading
import unicodedata
from difflib import SequenceMatcher
from typing import Any, Iterable, Sequence

from rag.bm25 import BM25Retriever
from rag.run_rag import MODEL, REASONING_EFFORT


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "rag" / "data"
QUESTIONS_PATH = Path(
    os.getenv("THEORY_TRAINING_QUESTIONS_PATH", str(DATA_DIR / "theory_training_questions.json"))
)
HISTORY_PATH = Path(
    os.getenv("THEORY_TRAINING_HISTORY_PATH", str(DATA_DIR / "theory_training_history.json"))
)
MAX_QUESTIONS_PER_REQUEST = 20
MAX_POOL_SIZE = 2000
MAX_HISTORY_SIZE = 5000
# Bump this when the learner-facing stem normalisation changes.  Older cache
# records may contain a definition paragraph or a repeated request; keeping
# them around defeats the idempotent normaliser on the next restart.
QUESTION_SCHEMA_VERSION = 9

# Names shown by the current frontend versus canonical catalogue names.
TRAINING_THEORY_ALIASES: dict[str, tuple[str, ...]] = {
    # The compact frontend profile names are intentionally user-facing.  The
    # catalogue may contain the same construct under a neighbouring academic
    # label, so resolve those labels before creating a specialized session.
    "建构主义学习理论": (
        "建构主义学习理论",
        "社会建构主义学习理论",
        "建构主义教学理论",
        "建构主义教育哲学",
    ),
    "人本主义学习理论": (
        "人本主义学习理论",
        "人本主义教学理论",
        "人本主义心理学",
    ),
    "教学对话理论（IRF）": ("教学对话理论",),
    "苏格拉底式问答法": ("苏格拉底教学法", "苏格拉底对话法"),
    "等待时间理论": ("课堂提问等待时间理论", "等待时间效应理论"),
    "学习迁移理论": ("学习迁移", "迁移学习理论"),
    "形成性评价理论": ("课堂形成性评价实施理论", "形成性课堂实施理论"),
    "社会互动学习理论": ("社会互动教学理论",),
    "皮亚杰认知发展理论": ("皮亚杰认知发展阶段理论",),
    "布鲁纳发现学习理论": ("布鲁纳认知结构学习理论", "布鲁纳结构主义教育"),
}

_ANSWER_LETTERS = "ABCD"
_FOCUS_SUFFIX_RE = re.compile(r"\s*[（(]\s*本题侧重[^）)]*[）)]\s*$")
_FULLWIDTH_TO_ASCII = str.maketrans({"Ａ": "A", "Ｂ": "B", "Ｃ": "C", "Ｄ": "D"})
_SCENARIO_MARKER = re.compile(r"情境判断(?:训练)?(?:（[^\n]{0,40}）)?", re.IGNORECASE)
_ANSWER_MARKER = re.compile(r"标准答案\s*[:：]?\s*([A-DＡ-Ｄ])", re.IGNORECASE)
_OPTION_LINE = re.compile(
    r"^\s*([A-DＡ-Ｄ])\s*[\.．、:：)）]\s*(.+?)\s*$",
    re.MULTILINE,
)
_SECTION_MARKER = re.compile(
    r"(?m)^\s*(?:[1１]\s*[\.、．:]?\s*)?核心知识点\s*[:：]?\s*"
)
_EVIDENCE_MARKER = re.compile(
    r"(?m)^\s*(?:[2２]\s*[\.、．:]?\s*)(?:情境精准对应|情境精准定位|情境对应)\s*[:：]?\s*"
)
_DISTINCTION_MARKER = re.compile(
    r"(?m)^\s*(?:[3３]\s*[\.、．:]?\s*)(?:错项精细排除|易错辨析|错项排除)\s*[:：]?\s*"
)
_REMINDER_MARKER = re.compile(
    r"(?m)^\s*(?:[4４]\s*[\.、．:]?\s*)备考易错提醒\s*[:：]?\s*"
)

_GENERIC_SCENARIO_PROMPT_RE = re.compile(
    r"^(?:以下哪项理论最能解释(?:上述课堂情境|课堂情境)|"
    r"请选择最符合理论的判断|"
    r"针对(?:上述课堂做法|题干中的教学安排|该课堂做法)，?最符合(?:该理论|理论)要求的判断是|"
    r"请判断[：:]?该课堂问题最需要运用(?:下列)?哪一理论进行核心校准|"
    r"请判断[：:]?该课堂问题最需要哪一理论(?:进行)?核心校准)[？?。.!！\s（）()]*$",
    re.IGNORECASE,
)

# Headings and prose that belong to the theory evidence/answer explanation,
# never to the learner-facing stem.  These markers occur both in authored
# Word conversions and in model-generated cache records.
_DISPLAY_NOISE_MARKERS = (
    "标准答案",
    "详细解析",
    "核心知识点",
    "情境精准对应",
    "情境精准定位",
    "错项精细排除",
    "易错辨析",
    "备考易错提醒",
    "理论解读",
    "相似理论对比辨析",
    "深度辨析总结",
    "情境判断训练",
    "表格：",
    "表格:",
    "课堂观察指标",
    "课堂操作",
    "教师行为",
    "学生行为",
    "应用边界",
    "边界提醒",
    "AI理论识别规则",
    "关键判断标准",
    "评课、反思、说课核心依据",
    "学生课堂行为处理",
    "课堂价值纠偏",
    "学科德育",
)
_EXPLANATORY_MARKERS = (
    "核心适用逻辑",
    "通用应用范围",
    "理论定位",
    "理论解释",
    "理论概述",
    "理论名称",
    "课堂中的核心适用逻辑",
    "主领域分类",
    "次领域标签",
    "代表人物/理论来源",
    "一句话记忆",
    "理论贡献",
    "理论局限",
)
_QUESTION_CUES = (
    "请判断",
    "请分析",
    "下列哪项",
    "哪项判断",
    "哪一理论",
    "哪种理论",
    "哪一教育理论",
    "该观点属于",
    "这一结论说明",
    "主要违背哪",
    "最恰当的是",
    "最符合哪",
    "主要体现哪",
    "依托哪一理论",
    "缺失哪一",
    "采用的核心",
    "属于哪",
)
_DANGLING_REFERENCE_RE = re.compile(
    r"(?:针对)?(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|结论|现象)|"
    r"(?:该课堂(?:现象|行为|问题|做法)?|这节课|这堂课)(?=最|首先|需要|是否|主要|与|的核心)",
    re.IGNORECASE,
)
_GENERIC_YES_NO_RE = re.compile(
    r"^是否(?:根据|依据|体现|为|能否|能够|做到|关注|给|提供|让|将|把|有)"
    r"[^。！？!?]{2,100}[？?。.!！]?$"
)

_EXPLANATION_MARKERS = (
    "核心适用逻辑", "通用应用范围", "理论在课堂中的", "理论核心适用逻辑",
    "理论主张", "该理论认为", "以下为绑定", "适配备课", "顶层校准",
    "理论解读", "理论分析", "相似理论对比", "深度辨析总结",
    "课堂观察指标", "课堂操作", "教师行为", "学生行为", "应用边界",
    "边界提醒", "AI理论识别规则", "理论贡献", "理论局限",
    "关键判断标准", "评课、反思、说课核心依据", "学生课堂行为处理",
    "课堂价值纠偏", "学科德育",
)
_CASE_START_RE = re.compile(
    r"(?:一位教师|某教师|教师在|教师认为|教师围绕|教师把|教师让|教师只|教师先|教师采用|"
    r"某小学[^。！？!?]{0,24}教师|小学[^。！？!?]{0,24}教师|班主任|某课堂|课堂中|"
    r"执教《|《[^》]{1,80}》|某研究|研究团队|一项研究|研究显示|学生在课堂)",
)


def _noise_heading_positions(text: str) -> list[int]:
    """Return positions where a catalogue marker starts an actual heading.

    Theory examples often contain ordinary prose such as ``以统一进度和标准答案
    覆盖学生差异``.  Treating every occurrence of ``标准答案`` as a section
    boundary truncates the classroom fact before it can be shown to the learner.
    A marker is considered a heading only when it starts a line (optionally after
    a numbered/bulleted prefix), or when it is an explicitly colon-labelled
    section after a sentence boundary.
    """

    positions: list[int] = []
    for marker in _DISPLAY_NOISE_MARKERS:
        start = 0
        while True:
            position = text.find(marker, start)
            if position < 0:
                break
            line_start = text.rfind("\n", 0, position) + 1
            line_prefix = text[line_start:position]
            suffix = text[position + len(marker):]
            # Most converted Word headings occupy their own line.  Numbered
            # headings (``1. 核心知识点``) and markdown bullets are accepted.
            line_heading = bool(
                re.fullmatch(
                    r"\s*(?:(?:[-*#]|[0-9０-９]+[.．、:：)]|[一二三四五六七八九十]+[、:：]))?\s*",
                    line_prefix,
                )
            )
            after = suffix.lstrip()
            explicit_label = bool(
                after.startswith((":", "："))
                and (
                    not line_prefix.strip()
                    or line_prefix.rstrip().endswith(("。", "！", "？", "!", "?", "；", ";"))
                )
            )
            if line_heading or explicit_label:
                positions.append(position)
            start = position + len(marker)
    return positions


def _case_excerpt(value: Any, *, max_chars: int = 520) -> str:
    """Extract only observable classroom/research facts from mixed prose.

    The catalogue files put definitions, application checklists and an exam
    item in the same text window.  A previous implementation treated the
    first ``教师`` phrase as a case, which leaked paragraphs such as
    ``核心适用逻辑`` into random practice cards.  This parser scores sentence
    candidates and rejects catalogue headings before truncating at a sentence
    boundary.
    """

    text = _clean_text(value, 10000)
    if not text:
        return ""
    text = re.sub(r"```(?:text|markdown)?|```", "", text, flags=re.IGNORECASE)
    text = text.replace("|", "；").replace("；；", "；")
    # A structured scenario block contains an authored classroom fact followed
    # by options and an answer key.  Prefer that bounded region over generic
    # theory prose so normalization remains stable across restarts.
    scenario_marker = _SCENARIO_MARKER.search(text)
    if scenario_marker:
        answer_marker = _ANSWER_MARKER.search(text, scenario_marker.end())
        block = text[scenario_marker.end() : answer_marker.start() if answer_marker else len(text)]
        block = re.sub(r"^\s*[（(][^）)]{0,100}[）)]\s*", "", block, count=1)
        block = re.sub(r"^\s*(?:题目|情境|正文)\s*[:：]?\s*", "", block, count=1)
        block = re.sub(r"(?m)^\s*[A-DＡ-Ｄ]\s*[.．、:：)）]\s*.*$", "", block)
        request_positions = [
            match.start()
            for cue in ("请判断", "请分析", "请选择", "下列哪项", "哪项判断")
            if (match := re.search(re.escape(cue), block))
        ]
        if request_positions:
            block = block[: min(request_positions)]
        block = re.sub(r"。{2,}", "。", block)
        scenario_parts = [
            part.strip(" ，,：:；;\n")
            for part in re.split(r"(?<=[。！？!?])|\n+", block)
            if part.strip()
        ]
        scenario_parts = [
            part for part in scenario_parts
            if len(part) >= 10 and not any(marker in part for marker in _EXPLANATION_MARKERS)
        ]
        if scenario_parts:
            scenario_case = _dedupe_case_sentences(scenario_parts, max_chars=max_chars)
            if scenario_case and _has_observable_case(scenario_case):
                return scenario_case
    # Prefer an explicitly labelled example.  This is important for fallback
    # generation: theory definitions often appear before the first classroom
    # example in the same chunk.
    example = re.search(
        r"(?:具体课例|课堂案例|教学案例|案例\s*\d*|例如[，,:：]?|以《[^》]{1,80}》为例[，,:：]?)",
        text,
    )
    if example:
        text = text[example.start():]
        example_prefix_len = example.end() - example.start()
        # Overlapping index windows can contain two or more ``具体课例``
        # paragraphs.  Keep one complete example; concatenating adjacent
        # examples creates a long, internally inconsistent question stem.
        next_example = next(
            (
                match
                for match in re.finditer(
                    r"(?:具体课例|课堂案例|教学案例|案例\s*\d*|以《[^》]{1,80}》为例[，,:：]?)",
                    text[example_prefix_len:],
                )
                if match.start() > 20
            ),
            None,
        )
        if next_example:
            text = text[: example_prefix_len + next_example.start()]
    # Stop only at an explanation/answer *heading*.  A marker embedded in
    # ordinary classroom prose (for example, ``标准答案覆盖学生差异``) is not
    # a boundary and must remain part of the observable case.
    cut_positions = [position for position in _noise_heading_positions(text) if position > 0]
    if cut_positions:
        text = text[: min(cut_positions)].strip()
    match = _CASE_START_RE.search(text)
    if match:
        # A labelled example can begin halfway through a sentence after OCR
        # chunking.  Trim the orphan prefix unless the text deliberately uses
        # an introductory “例如/以《…》为例” label.
        prefix = text[: match.start()]
        if not re.search(r"(?:例如|具体课例|课堂案例|教学案例|以《)", prefix):
            text = text[match.start():]
    elif example and text.startswith("《"):
        pass
    # Remove labels, variant metadata and a trailing assessment request.
    text = re.sub(r"^\s*(?:具体课例|课堂案例|教学案例|案例\s*\d*)\s*[:：]?\s*", "", text)
    text = re.sub(r"[（(]\s*(?:变式\s*\d+\s*[，,：:]?\s*)?重点观察[^）)]*[）)]", "", text)
    text = re.sub(r"^\s*(?:题目|情境|正文)\s*[:：]\s*", "", text)
    request_positions = [position for cue in _QUESTION_CUES if (position := text.find(cue)) >= 0]
    # Generic catalogue prompts are often not covered by a question cue
    # (notably ``面对这一教学问题``). They belong after the case and must be
    # removed before the case is recomposed with a fresh, varied request.
    for marker in ("面对这一教学问题", "针对上述课堂", "针对前述课堂", "该课堂现象是否", "上述做法"):
        position = text.find(marker)
        if position >= 0:
            request_positions.append(position)
    if request_positions:
        text = text[: min(request_positions)].strip()
    text = re.sub(r"(?:^|[。；])\s*\d+\s*[.．、)]\s*", "。", text)
    # Normalize OCR's repeated full stops before splitting.
    text = re.sub(r"。{2,}", "。", text)
    pieces = [part.strip(" ，,：:;\n") for part in re.split(r"(?<=[。！？!?])|\n+", text) if part.strip()]
    concrete: list[str] = []
    for piece in pieces:
        if len(piece) < 10 or any(marker in piece for marker in _EXPLANATION_MARKERS):
            continue
        if not _has_observable_case(piece):
            continue
        if re.search(r"(?:教师应|教师需|应当|可以通过|本理论|该理论|理论要求|适配备课|适用于|校准教育|围绕[^。；]{0,24}确立育人目标|作为[^。；]{0,30}依据)", piece):
            continue
        if (
            re.search(
                r"(?:让|要求|组织|安排|设计|观察|记录|比较|讲解|提问|调整|"
                r"忽略|没有|采用|收集|分析|发现|开展|布置|给出|禁止|联系|"
                r"完成|处理|提供|巡视|互评|修改|创造)",
                piece,
            )
            and re.search(
                r"(?:学生|课堂|任务|结果|错误|回答|作品|实验|数据|观点|发言|"
                r"理解|迁移|表现|小组|同伴)",
                piece,
            )
        ):
            concrete.append(piece)
    if not concrete:
        return ""
    # Include an explicit textbook title when available; it grounds otherwise
    # generic examples without exposing the surrounding theory prose.
    return _dedupe_case_sentences(concrete[:3], max_chars=max_chars)


def _dedupe_case_sentences(sentences: Sequence[str], *, max_chars: int = 520) -> str:
    """Collapse exact/near-exact OCR overlap while preserving case order."""

    compact: list[str] = []
    seen: list[str] = []
    for sentence in sentences:
        cleaned = _clean_text(sentence, 1000).strip(" ，,：:；;。！？!?")
        if len(cleaned) < 10:
            continue
        key = re.sub(r"\s+", "", cleaned)
        if not key or key in seen:
            continue
        if any(SequenceMatcher(None, key, old).ratio() >= 0.94 for old in seen[-5:]):
            continue
        seen.append(key)
        compact.append(cleaned)
    if not compact:
        return ""
    result = "。".join(compact).strip(" 。；;")
    if len(result) > max_chars:
        result = result[:max_chars]
        boundary = max(result.rfind("。"), result.rfind("；"), result.rfind("，"))
        if boundary >= 50:
            result = result[:boundary]
    return _polish_question_punctuation(result).strip(" 。；;")


def _question_request(stem: str, theory_name: str = "", ordinal: int = 0) -> str:
    """Return a concise, varied and self-contained exam request.

    ``question`` values in old records frequently contain anaphora (``上述
    课堂``) or a single yes/no checklist item.  Those phrases only make sense
    when a case is visible and are especially misleading in random mode.  The
    templates below deliberately avoid anaphora and rotate by a stable seed.
    """

    text = _clean_text(stem, 5000)
    if any(word in text for word in ("研究团队", "研究显示", "研究结论", "研究结果", "研究数据", "数据表明")):
        variants = (
            "这一研究结论主要说明（ ）。",
            "从该研究结果可以推出（ ）。",
            "该结论最能支持哪一判断？",
            "对这组研究数据的解释，最恰当的是（ ）。",
            "下列哪项结论与研究结果一致？",
            "这项研究主要揭示了（ ）。",
        )
    elif any(word in text for word in ("研究方式", "研究方法", "数据收集")):
        variants = (
            "该研究设计主要体现哪种方法？",
            "下列哪项最准确概括这种研究方法？",
            "该研究采用的核心方法是（ ）。",
            "从资料收集方式看，这项研究属于（ ）。",
            "判断该研究方法的关键依据是（ ）。",
            "下列哪一研究方法与该设计最吻合？",
        )
    elif any(word in text for word in ("认为", "观点", "主张")) and "教师" in text:
        variants = (
            "该教师的观点主要属于（ ）。",
            "这位教师的主张体现哪一教育观点？",
            "对该观点的理论归类，最恰当的是（ ）。",
            "该教师判断问题所依据的教育观点是（ ）。",
            "下列哪一理论最能解释这位教师的主张？",
            "这位教师的认识更接近哪一理论立场？",
        )
    elif any(word in text for word in ("违背", "违反", "错误")):
        variants = (
            "该做法主要违背哪一理论要求？",
            "要纠正这一做法，首先应依据哪一理论？",
            "这一做法反映出哪一理论认识偏差？",
            "下列哪项判断最能指出该做法的问题？",
            "教师首先应从哪一方面修正这项安排？",
            "对这一教学问题的诊断，最恰当的是（ ）。",
            "若改进这项教学，优先采取的措施是（ ）。",
            "该教学问题的关键成因是（ ）。",
        )
    else:
        variants = (
            "这项教学安排主要体现哪一理论？",
            "下列哪项判断最符合该理论的核心要求？",
            "若依据相关理论改进，教师下一步应当（ ）。",
            "哪项做法最能落实该理论？",
            "从教育理论角度看，最恰当的判断是（ ）。",
            "该教学设计是否符合理论要求？最准确的判断是（ ）。",
            "要解释这一现象，最适合采用哪一理论？",
            "这项做法的理论依据主要是（ ）。",
            "判断该教学安排是否合理，关键要看（ ）。",
            "教师接下来最需要改进的是（ ）。",
            "下列哪项分析与课堂事实最一致？",
            "题干中的教师行为主要反映了（ ）。",
            "对题干所述做法的专业诊断，正确的是（ ）。",
            "这项课堂安排的关键依据是（ ）。",
            "下列哪项改进最能回应题干中的学习困难？",
            "从学生学习证据看，教师首先应当（ ）。",
            "该案例最能说明哪一教育原理？",
            "判断这项做法是否适切，首要标准是（ ）。",
            "下列哪一分析准确解释了学生的表现？",
            "要改善题干中的教学效果，最恰当的措施是（ ）。",
            "题干中的师生互动主要体现了（ ）。",
            "该教学决策最符合哪一理论立场？",
            "从任务与评价的一致性看，正确判断是（ ）。",
            "面对题干中的学生反应，教师应优先（ ）。",
        )
    # Include theory name only in an improvement/criterion request; putting it
    # in every identification stem makes the answer obvious.
    result = variants[int(ordinal) % len(variants)]
    if theory_name and "相关理论" in result:
        result = result.replace("相关理论", theory_name)
    return _polish_question_punctuation(result)


def _extract_question_tail(value: Any) -> str:
    """Return the final learner-facing request from a mixed source string.

    This function intentionally returns *only* the request.  ``_case_excerpt``
    extracts observable facts separately, so a definition/application block
    can never be rendered in front of the question merely because it happened
    to precede the last question mark.
    """

    text = _clean_text(value, 8000)
    if not text:
        return ""
    # Answer keys and explanation sections must not be mistaken for a second
    # question when OCR joins the whole source into one line.  Use the same
    # line-aware rule as ``_case_excerpt`` so a phrase such as ``标准答案覆盖``
    # inside a classroom fact is preserved.
    cut_positions = _noise_heading_positions(text)
    if cut_positions:
        text = text[: min(cut_positions)].strip()
    # Prefer the last assessment cue.  Taking the last occurrence handles a
    # theory description that itself contains an earlier rhetorical question.
    # Prefer an explicit “请判断/请分析” lead-in over a later embedded cue
    # such as “下列哪项”; this preserves the complete exam request.
    for lead in ("请判断", "请分析", "请选择"):
        lead_pos = text.rfind(lead)
        if lead_pos >= max(0, len(text) // 4):
            candidate = text[lead_pos:].strip(" \n\r:：，,")
            if 6 <= len(candidate) <= 500:
                return _polish_question_punctuation(candidate)
    cue_positions = [
        (text.rfind(cue), cue)
        for cue in _QUESTION_CUES
        if text.rfind(cue) >= 0
    ]
    cue_positions.sort(reverse=True)
    for position, _cue in cue_positions:
        candidate = text[position:].strip(" \n\r:：，,")
        # Reject a cue embedded in a long theory heading; a real request is
        # normally short and ends in a question mark or an answer blank.
        if len(candidate) >= 6 and len(candidate) <= 360:
            return _polish_question_punctuation(candidate)
    # If no cue was found, use the final interrogative sentence.  This covers
    # authored stems such as “该做法主要体现哪种理论？” and avoids retaining
    # preceding explanatory paragraphs.
    matches = list(re.finditer(r"[^。！？!?\n]*[？?]", text))
    if matches:
        candidate = matches[-1].group(0).strip(" \n\r")
        if len(candidate) >= 6:
            return _polish_question_punctuation(candidate)
    # A short standalone request can be kept for later template replacement;
    # explanatory records are rejected so their prose cannot leak to the UI.
    if (
        len(text) <= 180
        and not any(marker in text for marker in _EXPLANATORY_MARKERS)
        and not re.search(r"(?:教师|学生|课堂|教学|执教|班主任|研究团队)", text)
    ):
        return _polish_question_punctuation(text)
    return ""


def _polish_question_punctuation(value: str) -> str:
    """Use readable Chinese punctuation in the learner-facing question."""

    return str(value).replace(",", "，").replace("?", "？")


def _is_generic_scenario_prompt(value: Any) -> bool:
    """Return whether *value* is a dangling, non-independent request.

    A large part of the authored catalogue uses a generic request such as
    ``面对这一教学问题，教师优先调整的方向是`` after a case paragraph.
    That request is valid only when the paragraph is rendered immediately
    before it.  It must not be selected as the whole question (and it should
    not be repeated when an already-normalised record is loaded).
    """

    text = _clean_text(value, 1200).strip(" \n\r，,：:；;")
    if not text:
        return False
    if _GENERIC_SCENARIO_PROMPT_RE.fullmatch(text):
        return True
    if _GENERIC_YES_NO_RE.fullmatch(text):
        return True
    compact = re.sub(r"[\s，,：:；;]+", "", text)

    # A complete case can use anaphora in its final request.  Only classify it
    # as generic when there is no actor/action evidence in the same value.
    has_case = _has_observable_case(text)
    if has_case:
        return False

    generic_patterns = (
        r"^面对这一教学问题教师优先调整的方向是(?:\（?\s*\）?)?[。.!！?？]*$",
        r"^针对(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|现象).*(?:最符合|首先|需要调整|应当).*$",
        r"^(?:从|依据|结合)(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|现象).*$",
        r"^该课堂(?:现象|行为|问题|表现|做法)(?:与|是否|最需要|首先|主要).*$",
        r"^请判断[:：]?该课堂问题最需要运用.*核心校准[？?。.!！]*$",
        r"^(?:哪一|哪项|哪种)(?:教育)?理论(?:核心|进行分析|进行核心校准|最适合作为分析框架|需要被优先引入)?[？?。.!！]*$",
        r"^面对这一教学问题.*$",
        r"^教师优先调整的方向是.*$",
        r"^做法[，,]?最符合(?:该理论|理论)要求的判断是.*$",
        r"^应当[（(]?\s*[）)]?[。.!！?？]*$",
        r"^(?:这项教学安排主要体现|下列哪项判断最符合该理论的核心要求|"
        r"若依据(?:相关理论|该理论)改进教师下一步应当|面对这一教学问题教师优先调整的方向是|"
        r"哪项做法最能落实该理论|从教育理论角度看最恰当的判断是|"
        r"该教学设计是否符合理论要求|要解释这一现象最适合采用哪一理论|"
        r"这项做法的理论依据主要是|判断该教学安排是否合理关键要看|"
        r"教师接下来最需要改进的是|下列哪项分析与课堂事实最一致).*$",
    )
    # Patterns are evaluated against the punctuation-stripped form where
    # possible, then against the original to retain optional suffixes.
    if any(re.fullmatch(pattern, compact, flags=re.IGNORECASE) for pattern in generic_patterns):
        return True
    dangling = re.search(
        r"(?:上述|前述)(?:课堂|做法|课堂做法|课堂行为|案例|现象)|"
        r"(?:该课堂(?:现象|行为|问题|表现|做法)?|该教学(?:安排|设计|做法))",
        text,
    )
    if dangling and not has_case:
        return True
    # A short question-only record with no observable fact is also a generic
    # template, even when it does not contain an explicit anaphor.
    return bool(
        not has_case
        and len(compact) <= 90
        and re.search(r"(?:哪一|哪项|哪种|是否|最恰当|主要体现|下一步|理论依据|判断)", text)
        and ("？" in text or "?" in text or "（" in text or "(" in text)
    )


def _contains_dangling_prompt(value: Any) -> bool:
    """Detect a generic request appended to an otherwise concrete case."""

    text = _clean_text(value, 1600)
    return bool(
        re.search(
            r"面对这一教学问题|"
            r"(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|现象)|"
            r"该课堂现象(?:是否|与|首先|主要|最需要)|"
            r"从[^。！？!?]{0,80}看[，,]?(?:上述|前述)",
            text,
        )
    )


def _has_observable_case(value: Any) -> bool:
    """Return whether text contains a concrete actor, action and evidence."""

    text = _clean_text(value, 1600)
    if len(re.sub(r"\s+", "", text)) < 35:
        return False
    actor = re.search(
        r"(?:一位教师|某教师|教师在|教师认为|教师围绕|教师让|教师采用|教师只|"
        r"教师先|教师没有|教师把|教师用|教师提供|教师组织|教师巡视|学生在|"
        r"学生不能|学生只能|学生完成|学生提出|学生表现|学生回答|小学[^。！？!?]{0,40}教师|"
        r"一名教师|班主任|教学中|课堂中|课堂上|针对学困生|当学生|研究过程中|研究者|"
        r"研究团队|研究显示|一项研究|执教《|教师)",
        text,
    )
    action = re.search(
        r"(?:安排|组织|设计|采用|要求|让学生|讲解|提问|操作|实验|朗读|圈画|"
        r"讨论|比较|记录|观察|调整|忽略|没有安排|直接给出|布置|评价|"
        r"覆盖|推进|背诵|模仿|迁移|数据|结论|提供|巡视|互评|修改|舍弃|"
        r"不渗透|机械|指责|强行|摒弃|压抑|反复|营造|拉近|帮助|提升|否定|结合|"
        r"营造|感受不到|统计|得出|分析|采用|导致|出现|全程|播放|阅读|要求)",
        text,
    )
    evidence = re.search(
        r"(?:学生|课堂|任务|结果|错误|回答|作品|实验|数据|观点|发言|理解|"
        r"迁移|表现|小组|同伴|答案|思路|学困生|班级|学习|学业|情绪|记忆|"
        r"数学|语文|科学|语言)",
        text,
    )
    if not (actor and action and evidence):
        return False
    # ``课堂中……`` or ``教学中……`` alone often introduces a definition or a
    # management principle rather than a witnessed event.  Require an explicit
    # teacher/student/research actor in those cases.
    if actor.group() in {"课堂中", "课堂上", "教学中"} and not re.search(
        r"(?:教师|学生|研究团队|研究者|班主任|学困生|儿童|小组)", text
    ):
        return False
    return not any(marker in text for marker in _EXPLANATORY_MARKERS)


def _line_heading_position(text: str, markers: Sequence[str]) -> int | None:
    """Find the first real section heading, ignoring inline prose.

    Phrases such as ``标准答案训练`` are ordinary classroom wording and must
    not be treated as the ``标准答案：B`` answer-key heading.  Only a marker at
    the beginning of a line (optionally preceded by a numbered heading) is a
    structural boundary.
    """

    positions: list[int] = []
    for marker in markers:
        pattern = rf"(?m)^\s*(?:\d+\s*[.．、)]\s*)?{re.escape(marker)}\s*(?:[:：]|$)"
        match = re.search(pattern, text)
        if match:
            positions.append(match.start())
    return min(positions) if positions else None


def _normalize_learner_request(
    value: Any,
    *,
    has_context: bool,
    fallback: str,
) -> str:
    """Return one self-contained assessment request with one answer marker.

    Model and legacy catalogue output sometimes joins two requests, for
    example ``是否符合要求？最准确的判断是（ ）。``.  It also uses
    ``上述课堂`` after the referenced paragraph has been removed.  This final
    boundary keeps the request independent and makes question cards stable in
    both the browser and exported history.
    """

    text = _clean_text(value, 800).strip(" ，,：:；;")
    dangling = bool(
        re.search(
            r"(?:上述|前述)(?:课堂|课堂做法|课堂行为|做法|案例|现象)|"
            r"该课堂现象(?:是否|与|首先|主要|最需要)",
            text,
        )
    )
    if dangling and not has_context:
        text = _clean_text(fallback, 800)
    elif has_context:
        replacements = {
            "上述课堂做法": "题干中的教学做法",
            "前述课堂做法": "题干中的教学做法",
            "上述课堂行为": "题干中的课堂行为",
            "前述课堂行为": "题干中的课堂行为",
            "上述课堂现象": "题干中的课堂现象",
            "前述课堂现象": "题干中的课堂现象",
            "上述课堂": "题干中的课堂",
            "前述课堂": "题干中的课堂",
            "上述做法": "题干中的做法",
            "前述做法": "题干中的做法",
            "上述案例": "题干中的案例",
            "前述案例": "题干中的案例",
            "该课堂现象": "题干中的课堂现象",
        }
        for source, target in replacements.items():
            text = text.replace(source, target)
    text = re.sub(r"^针对题干中的(?:课堂|教学做法|课堂行为|做法|案例)[，,：:、 ]*", "", text)
    text = re.sub(r"[（(]\s*[）)]", "（ ）", text)

    blank_matches = list(re.finditer(r"（\s*）", text))
    if blank_matches:
        # One empty answer blank is sufficient.  Remove earlier blanks while
        # retaining semantic parentheses such as theory abbreviations.
        last_start = blank_matches[-1].start()
        text = re.sub(r"（\s*）", "", text[:last_start]) + text[last_start:]
        text = re.sub(r"[？?]+\s*(?=.*（\s*）)", "，", text)
        text = re.sub(r"，+", "，", text).replace("，（ ）", "（ ）")
        text = text.rstrip("。.!！?？；;，, ") + "。"
    else:
        question_marks = [match.start() for match in re.finditer(r"[？?]", text)]
        if question_marks:
            last = question_marks[-1]
            prefix = re.sub(r"[？?]+", "，", text[:last])
            suffix = re.sub(r"[？?]+", "", text[last + 1 :]).strip("。.!！?？；;，, ")
            text = prefix.rstrip("，, ") + (f"，{suffix}" if suffix else "") + "？"
        else:
            text = text.rstrip("。.!！；;，, ") + "？"
    return _polish_question_punctuation(text).strip()


def _assessment_marker_count(value: Any) -> int:
    text = str(value or "")
    return len(re.findall(r"[？?]", text)) + len(re.findall(r"[（(]\s*[）)]", text))


def _compose_display_stem(
    stem: str,
    question: str,
    theory_name: str = "",
    *,
    include_context: bool = True,
) -> str:
    """Build the visible exam prompt without dangling anaphora.

    ``stem`` may contain a classroom case followed by a generic judgement
    sentence, or may be only a case paragraph.  The card must always retain
    observable facts and use a self-contained final question.
    """

    clean_stem = _clean_text(stem, 8000)
    clean_question = _clean_text(question, 1200)
    case = _case_excerpt(clean_stem) if include_context else ""
    # A mixed record may contain only theory exposition.  In that case keep a
    # concise classroom fact if one can be found; otherwise use a standalone
    # request and never expose the catalogue paragraph.
    if case and any(marker in case for marker in _EXPLANATORY_MARKERS):
        case = ""

    # Prefer an authored final question in the stem, then the explicit model
    # question.  Generic/anaphoric requests are discarded because they either
    # point to an invisible “above” paragraph or reduce every item to the same
    # yes/no checklist.
    extracted = _extract_question_tail(clean_stem)
    candidates = [extracted, clean_question]
    request = ""
    for candidate in candidates:
        candidate = _clean_text(candidate, 800)
        if not candidate:
            continue
        if not case and (_is_generic_scenario_prompt(candidate) or _GENERIC_YES_NO_RE.fullmatch(candidate)):
            continue
        if any(marker in candidate for marker in _DISPLAY_NOISE_MARKERS + _EXPLANATORY_MARKERS):
            continue
        request = candidate
        break
    if not request:
        # Derive a stable but varied request from the facts.  The hash keeps a
        # refreshed page deterministic while different questions rotate their
        # wording.
        seed = f"{theory_name}\n{clean_stem}"
        ordinal = int.from_bytes(hashlib.sha256(seed.encode("utf-8")).digest()[:4], "big")
        request = _question_request(clean_stem, theory_name, ordinal)
    request = _clean_text(request, 800)

    fallback_request = _question_request(clean_stem, theory_name, 0)
    request = _normalize_learner_request(
        request,
        has_context=bool(case),
        fallback=fallback_request,
    )

    if case:
        # Teacher questions inside the scenario are evidence, not additional
        # assessment requests.  Keep their wording but reserve the visible
        # question mark/answer blank for the final learner-facing request.
        case = re.sub(r"[（(]\s*[）)]", "", case)
        case = re.sub(r"[？?]+", "。", case)
        case = re.sub(r"。{2,}", "。", case)
        # Avoid duplicating an already-present request in the extracted case.
        if request not in case:
            case_tail = case.rstrip()
            separator = "" if case_tail.endswith(("。", "！", "？", ".", "!", "?")) else "。"
            visible = f"{case_tail}{separator}{request}"
        else:
            visible = case
    else:
        # A source containing only a checklist/definition is represented by a
        # concise independent question; callers still receive the full theory
        # evidence in ``knowledge_excerpt`` and answer feedback.
        visible = request
    visible = _polish_question_punctuation(visible)
    # Keep display cards compact and end with readable question punctuation.
    if len(visible) > 760:
        visible = visible[:760]
        boundary = max(visible.rfind("。"), visible.rfind("？"), visible.rfind("！"))
        if boundary >= 100:
            visible = visible[: boundary + 1]
    return visible.strip()


_FALLBACK_PROMPT_TEMPLATES = (
    "这名教师的做法主要体现哪一理论要求（ ）。",
    "针对题干中的教学安排，最恰当的专业判断是（ ）。",
    "结合题干事实，教师下一步应当（ ）。",
    "题干描述的教学问题主要涉及（ ）。",
    "该教学安排最需要校准的核心是（ ）。",
    "若依据{theory}改进这项教学，优先行动应是（ ）。",
    "下列哪项分析最符合{theory}的核心要求？",
    "从{theory}看，对这项教学安排的判断最恰当的是（ ）。",
)

_CORE_CALIBRATION_PROMPT_RE = re.compile(
    r"^请判断[：:]?该课堂问题最需要运用下列哪一理论进行核心校准[？?。.!！]?$"
)
_CORE_CALIBRATION_VARIANTS = (
    "下列课堂问题最需要依据哪一理论进行核心校准（ ）。",
    "从教育理论视角看，题干所述教学首先应依据哪一理论进行分析？",
    "题干中的教学做法主要需要运用哪一理论解释和校准？",
    "结合题干事实，最恰当的理论判断是（ ）。",
    "要准确诊断该课堂问题，以下哪一理论最适合作为分析框架？",
    "题干现象反映出哪一理论需要被优先引入？",
)


def _fallback_prompt(theory_name: str, ordinal: int) -> str:
    template = _FALLBACK_PROMPT_TEMPLATES[int(ordinal) % len(_FALLBACK_PROMPT_TEMPLATES)]
    return template.format(theory=theory_name)


def _vary_question_wording(value: Any, seed_text: str = "") -> str:
    """Diversify the legacy one-line calibration prompt deterministically."""

    text = _clean_text(value, 1000)
    if not _CORE_CALIBRATION_PROMPT_RE.fullmatch(text):
        return text
    seed = f"{seed_text}\n{text}".encode("utf-8")
    index = int.from_bytes(hashlib.sha256(seed).digest()[:4], "big") % len(_CORE_CALIBRATION_VARIANTS)
    return _CORE_CALIBRATION_VARIANTS[index]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _read_json(path: Path, default: Any) -> Any:
    try:
        with path.open("r", encoding="utf-8") as handle:
            value = json.load(handle)
        return value
    except (FileNotFoundError, OSError, UnicodeError, json.JSONDecodeError, TypeError, ValueError):
        return default


def _write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Include a per-write nonce and thread id.  A pid-only temporary name can
    # collide when two server workers persist the catalogue concurrently.
    temporary = path.with_name(
        f".{path.name}.{os.getpid()}.{threading.get_ident()}.{secrets.token_hex(6)}.tmp"
    )
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(value, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    # replace is atomic on the same volume on Windows and POSIX.
    temporary.replace(path)


def _clean_text(value: Any, limit: int = 12000) -> str:
    text = unicodedata.normalize("NFKC", str(value or "")).strip()
    return re.sub(r"[ \t]+", " ", text)[:limit]


def _canonical_letter(value: Any) -> str:
    text = str(value or "").strip().translate(_FULLWIDTH_TO_ASCII).upper()
    if text in _ANSWER_LETTERS:
        return text
    match = re.search(r"(?<![A-Z])([A-D])(?![A-Z])", text)
    return match.group(1) if match else text


def _schema_version(value: Any) -> int:
    try:
        return int(value or 1)
    except (TypeError, ValueError):
        return 1


def normalize_mode(value: Any) -> str:
    """Map UI labels and API aliases to ``specialized`` or ``random``."""

    text = _clean_text(value, 40).lower()
    if text in {"random", "rand", "random_training", "随机", "随机训练", "不限理论", "all"}:
        return "random"
    return "specialized"


def _mode_is_known(value: Any) -> bool:
    text = _clean_text(value, 40).lower()
    return text in {
        "specialized", "special", "specialized_training", "专项", "专项训练", "指定理论",
        "random", "rand", "random_training", "随机", "随机训练", "不限理论", "all",
    }


def _question_id(theory_name: str, stem: str, options: Sequence[str]) -> str:
    raw = "\n".join([theory_name, stem, *options]).encode("utf-8")
    return "question-" + hashlib.sha256(raw).hexdigest()[:20]


def _assign_question_id(
    item: dict[str, Any],
    theory_name: str,
    stem: str,
    options: Sequence[str],
) -> str:
    """Assign the content id while retaining ids referenced by old attempts."""

    question_id = _question_id(theory_name, stem, options)
    legacy: list[str] = []
    raw_legacy = item.get("legacy_question_ids")
    if isinstance(raw_legacy, (list, tuple)):
        legacy.extend(_clean_text(value, 200) for value in raw_legacy)
    legacy.extend(
        _clean_text(item.get(key), 200)
        for key in ("question_id", "id")
    )
    retained: list[str] = []
    for value in legacy:
        if value and value != question_id and value not in retained:
            retained.append(value)
    item["question_id"] = question_id
    item["id"] = question_id
    if retained:
        item["legacy_question_ids"] = retained[-12:]
    else:
        item.pop("legacy_question_ids", None)
    return question_id


def _question_signature(item: dict[str, Any]) -> str:
    """Stable semantic signature used to collapse stale cache variants."""

    options = []
    for option in item.get("options", []) if isinstance(item.get("options"), list) else []:
        value = _clean_text(option, 500)
        value = re.sub(r"^\s*[A-DＡ-Ｄ]\s*[\.．、:：)）]\s*", "", value)
        options.append(value)
    # Option order is presentation-only; sorting prevents the same question
    # with shuffled choices from bypassing cache de-duplication.
    return "\n".join(
        [_clean_text(item.get("theory_name"), 200), _clean_text(item.get("stem"), 5000), *sorted(options)]
    )


def _question_semantic_signature(item: dict[str, Any]) -> str:
    """Return a presentation-independent signature for a classroom stem.

    Older offline fallbacks appended ``变式编号/观察维度`` to an otherwise
    identical excerpt, and model batches occasionally repeated one scenario
    while only changing option order.  Those are one learning item, not
    separate questions, so selection and persistence must deduplicate them by
    the classroom fact itself.
    """

    theory = _clean_text(item.get("theory_name"), 200)
    stem = _clean_text(item.get("stem"), 5000)
    # The observation dimension is intentional variation for offline/model
    # questions.  Only remove an explicit numeric variant marker; removing
    # the whole parenthetical collapses all variants into the same stem.
    stem = re.sub(r"[（(]\s*变式\s*\d+\s*[）)]\s*", "", stem)
    stem = re.sub(r"变式\s*\d+\s*[，,：:]?", "", stem)
    stem = re.sub(r"\s+", "", stem).strip("，,。；; ")
    return f"{theory}\n{stem}"


def _prefer_question(current: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    """Prefer authoritative catalogue/model records over offline fallbacks."""

    rank = {
        "knowledge_base": 3,
        "llm_generated": 2,
        "cached": 2,
        "local_fallback": 1,
    }
    current_rank = (rank.get(str(current.get("origin") or ""), 0), _schema_version(current.get("schema_version")))
    candidate_rank = (rank.get(str(candidate.get("origin") or ""), 0), _schema_version(candidate.get("schema_version")))
    return candidate if candidate_rank >= current_rank else current


def _deduplicate_questions(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Collapse exact and near-identical stems while preserving best records."""

    exact: dict[str, dict[str, Any]] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        key = _question_semantic_signature(item)
        current = exact.get(key)
        exact[key] = item if current is None else _prefer_question(current, item)

    # Model-generated stems can differ only by a punctuation mark or a short
    # lead-in.  A high sequence ratio catches those without collapsing truly
    # different classroom situations.
    result: list[dict[str, Any]] = []
    for item in exact.values():
        item_key = _question_semantic_signature(item)
        item_focus_match = re.search(r"重点观察\s*([^：:）)]{1,20})", str(item.get("stem") or ""))
        item_focus = item_focus_match.group(1).strip() if item_focus_match else ""
        duplicate_index = next(
            (
                index
                for index, existing in enumerate(result)
                if existing.get("theory_name") == item.get("theory_name")
                and (
                    not item_focus
                    or not re.search(r"重点观察\s*([^：:）)]{1,20})", str(existing.get("stem") or ""))
                    or item_focus
                    == re.search(r"重点观察\s*([^：:）)]{1,20})", str(existing.get("stem") or "")).group(1).strip()
                )
                and SequenceMatcher(
                    None,
                    item_key,
                    _question_semantic_signature(existing),
                ).ratio() >= 0.96
            ),
            None,
        )
        if duplicate_index is None:
            result.append(item)
        else:
            result[duplicate_index] = _prefer_question(result[duplicate_index], item)
    return result


def _preferred_question_pool(items: Iterable[dict[str, Any]], count: int) -> list[dict[str, Any]]:
    """Prefer distinct authored/model questions before offline fallbacks."""

    unique = _deduplicate_questions(items)
    primary = [item for item in unique if item.get("origin") != "local_fallback"]
    fallback = [item for item in unique if item.get("origin") == "local_fallback"]

    # A catalogue can contain different stems that accidentally reuse the same
    # choice set.  Select one representative per set first so a requested
    # round does not look like the same question with reordered options.  Keep
    # duplicates at the end as a last resort when the pool is genuinely small.
    def spread(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
        distinct: list[dict[str, Any]] = []
        repeated: list[dict[str, Any]] = []
        seen: set[tuple[str, ...]] = set()
        for record in records:
            values = record.get("options") if isinstance(record.get("options"), list) else []
            signature = tuple(sorted(_clean_training_option(value) for value in values))
            if signature in seen:
                repeated.append(record)
            else:
                seen.add(signature)
                distinct.append(record)
        return [*distinct, *repeated]

    primary = spread(primary)
    fallback = spread(fallback)
    if len(primary) >= count:
        return primary
    return [*primary, *fallback]


_CORRECT_OPTION_VARIANTS = (
    "以{theory}的核心概念审视课堂目标、任务和学生证据，并据此调整教学。",
    "从{theory}出发，根据学生的表现证据校准目标、活动与支持。",
    "依据{theory}检视教育目标与学习过程，结合证据改进课堂。",
    "将{theory}落实为可观察、可表达、可迁移的学习经历，并根据反馈调整。",
    "围绕{theory}的关键机制组织任务，用学生的理解和迁移证据验证效果。",
    "以{theory}为依据连接教学目标、学习任务与评价证据，及时修正支持。",
    "运用{theory}分析题干中的关键事实，再据学生反应选择适切的教学行动。",
    "先按{theory}判断学习困难产生的机制，再用课堂证据检验改进是否有效。",
    "把{theory}转化为具体任务与反馈标准，并依据学生产出持续调整。",
    "依据{theory}识别目标与课堂行为的偏差，补充能够验证学习结果的证据。",
    "从{theory}的适用条件出发审查教学安排，避免只凭课堂气氛作判断。",
    "结合{theory}比较不同教学选择，以学生能否理解并迁移作为判断依据。",
    "用{theory}解释题干现象，同时核对教师支持与学生自主学习之间的关系。",
    "按照{theory}重组问题、活动和评价，使每项安排都能回指学习目标。",
    "基于{theory}提供分层支持，并通过后续表现判断支持是否需要撤除或调整。",
    "以{theory}辨析课堂现象的成因，选择既符合理论边界又可观察验证的方案。",
    "依照{theory}设置学习任务、收集过程证据，并用证据决定下一步反馈。",
    "从{theory}的核心判断标准审视题干事实，优先改进影响学生理解的环节。",
    "将{theory}与具体课堂证据对应，形成目标、行动、评价相互一致的方案。",
    "运用{theory}检验教学做法的适切性，并以学生真实学习变化评价成效。",
)


def _clean_training_option(value: Any) -> str:
    """Remove legacy presentation labels from a training choice."""

    cleaned = _clean_text(value, 500)
    return _FOCUS_SUFFIX_RE.sub("", cleaned).strip()


_OPTION_PADDING_VARIANTS = (
    "只依据课堂气氛是否热烈作出判断，不核对学生的学习证据。",
    "只检查教师是否完成讲授流程，不分析学生的理解与迁移表现。",
    "直接套用固定教学步骤，不再结合具体学情调整任务与支持。",
    "仅凭一次测验结果评价教学，不追踪学生形成和修正思路的过程。",
    "把活动数量当作学习质量，不检验活动是否真正指向教学目标。",
    "用统一要求替代差异化支持，不观察不同学生接受帮助后的变化。",
    "先公布标准结论，再要求学生按既定答案复述，不保留探究空间。",
    "只记录最终答案，不收集学生解释、作品或同伴互动等过程证据。",
    "把理论术语写入教案即视为已经落实，不核验实际课堂行为。",
    "发现学习困难后只增加练习量，不分析困难产生的具体机制。",
    "完全依据教师主观印象判断效果，不使用可观察、可复核的事实。",
    "只关注少数学生的正确回答，并据此推断全班已经达成目标。",
)


def _option_identity(value: Any) -> str:
    text = re.sub(r"\s+", "", _clean_training_option(value)).casefold()
    return text.rstrip("。.!！；;，,")


def _normalize_four_options(
    options: Sequence[Any],
    answer_index: int,
    *,
    theory_name: str = "",
    seed_text: str = "",
) -> tuple[list[str], int] | None:
    """Return four non-empty distinct choices without changing the answer.

    Legacy catalogue records usually contain three choices, while an occasional
    model response contains five or six.  Empty/duplicate choices are collapsed,
    the authored correct choice is always retained, and deterministic distractors
    fill any shortfall so cache ids remain stable across process restarts.
    """

    cleaned = [_clean_training_option(value) for value in options]
    if not 0 <= int(answer_index) < len(cleaned):
        return None
    correct = cleaned[int(answer_index)]
    if not correct:
        return None

    unique: list[str] = []
    positions: dict[str, int] = {}
    normalized_answer = -1
    for index, option in enumerate(cleaned):
        identity = _option_identity(option)
        if not identity:
            continue
        if identity not in positions:
            positions[identity] = len(unique)
            unique.append(option)
        if index == int(answer_index):
            normalized_answer = positions[identity]
    if normalized_answer < 0:
        return None

    if len(unique) > 4:
        retained_indices = list(range(4))
        if normalized_answer not in retained_indices:
            retained_indices[-1] = normalized_answer
            retained_indices.sort()
        unique = [unique[index] for index in retained_indices]
        normalized_answer = retained_indices.index(normalized_answer)

    if len(unique) < 4:
        seed = f"{theory_name}\n{seed_text}\n" + "\n".join(unique)
        offset = int.from_bytes(hashlib.sha256(seed.encode("utf-8")).digest()[:4], "big")
        for step in range(len(_OPTION_PADDING_VARIANTS) * 2):
            candidate = _OPTION_PADDING_VARIANTS[(offset + step) % len(_OPTION_PADDING_VARIANTS)]
            identity = _option_identity(candidate)
            if identity in positions:
                continue
            positions[identity] = len(unique)
            unique.append(candidate)
            if len(unique) == 4:
                break
    if len(unique) != 4 or len({_option_identity(value) for value in unique}) != 4:
        return None
    return unique, normalized_answer


def _ensure_item_four_options(item: dict[str, Any], *, seed_text: str = "") -> bool:
    options = item.get("options") if isinstance(item.get("options"), list) else []
    try:
        answer = int(item.get("answer", 0) or 0)
    except (TypeError, ValueError):
        answer = 0
    normalized = _normalize_four_options(
        options,
        answer,
        theory_name=_clean_text(item.get("theory_name"), 200),
        seed_text=seed_text or str(item.get("stem") or item.get("display_stem") or ""),
    )
    if normalized is None:
        return False
    item["options"], item["answer"] = normalized
    return True


def _rewrite_correct_option(item: dict[str, Any], ordinal: int = 0) -> None:
    """Vary repetitive correct-answer wording without changing its meaning."""

    options = item.get("options") if isinstance(item.get("options"), list) else []
    if not options:
        return
    options = [_clean_training_option(option) for option in options]
    try:
        answer_index = int(item.get("answer", 0) or 0)
    except (TypeError, ValueError):
        answer_index = 0
    if not 0 <= answer_index < len(options):
        return
    theory = _clean_text(item.get("theory_name"), 200)
    current = options[answer_index]
    origin = str(item.get("origin") or "")
    # Knowledge-base records commonly use only the theory name as the answer;
    # local fallbacks and earlier generated records used one fixed sentence.
    # Rewrite those cases with equivalent, varied formulations.  Preserve any
    # authored answer that contains a genuinely different, specific judgement.
    repetitive = (
        origin == "local_fallback"
        or current == theory
        or (theory and current.startswith(f"以{theory}的核心概念"))
        or (theory and "核心概念分析课堂目标" in current)
    )
    if theory and repetitive:
        options[answer_index] = _CORRECT_OPTION_VARIANTS[ordinal % len(_CORRECT_OPTION_VARIANTS)].format(theory=theory)
    item["options"] = options
    item["answer"] = answer_index
    if not _ensure_item_four_options(item):
        return
    options = item["options"]
    _assign_question_id(item, theory, str(item.get("stem") or ""), options)


def _diversify_duplicate_options(
    items: Iterable[dict[str, Any]],
    theory_names: Iterable[str] = (),
) -> list[dict[str, Any]]:
    """Make repeated choice sets useful instead of merely reordering them.

    Catalogue exercises often reused the same three theory names for every
    stem.  Keep the correct answer and option count, but rotate plausible
    theory distractors (or annotate generic distractors with the question's
    focus) whenever an identical set occurs more than once.
    """
    records = [item for item in items if isinstance(item, dict)]
    groups: dict[tuple[str, tuple[str, ...]], list[dict[str, Any]]] = defaultdict(list)
    for ordinal, item in enumerate(records):
        _rewrite_correct_option(item, ordinal)
        options = item.get("options") if isinstance(item.get("options"), list) else []
        signature = tuple(sorted(_clean_training_option(value) for value in options))
        groups[(str(item.get("theory_name") or ""), signature)].append(item)
    theory_pool = sorted({str(name).strip() for name in theory_names if str(name).strip()})
    for group_items in groups.values():
        if len(group_items) < 2:
            continue
        for occurrence, item in enumerate(group_items):
            options = [_clean_training_option(value) for value in item.get("options", [])]
            if len(options) < 3:
                continue
            answer_index = int(item.get("answer", 0) or 0)
            answer_index = max(0, min(answer_index, len(options) - 1))
            correct = options[answer_index]
            theory = str(item.get("theory_name") or "").strip()
            # A theory-name choice set can use other catalogue theories as
            # distractors, which is more natural than adding parenthetical
            # labels to the names.
            if theory and theory in theory_pool and all(value in theory_pool for value in options):
                candidates = [name for name in theory_pool if name != theory]
                if len(candidates) >= len(options) - 1:
                    offset = occurrence % len(candidates)
                    distractors = [
                        candidates[(offset + index) % len(candidates)]
                        for index in range(len(options) - 1)
                    ]
                    options = [correct, *distractors]
                else:
                    continue
            else:
                # Keep authored distractor wording intact.  Older versions
                # appended a focus label here; it was presentation noise and
                # is deliberately removed by _clean_training_option above.
                options = [_clean_training_option(value) for value in options]
            item["options"] = options
            item["answer"] = options.index(correct)
            if not _ensure_item_four_options(item):
                continue
            options = item["options"]
            _assign_question_id(item, theory, str(item.get("stem") or ""), options)
    return records


def _theory_knowledge_excerpt(retriever: BM25Retriever, theory_name: str) -> str:
    """Extract an exact, compact theory passage for the question material box."""

    chunks = [
        item
        for item in getattr(retriever, "chunks", []) or []
        if str(item.get("theory_name") or "").strip() == theory_name
    ]
    if not chunks:
        return ""
    priority = {"理论完成解释": 0, "教理范式汇典": 1, "课堂范本": 2}
    chunks.sort(key=lambda item: priority.get(str(item.get("source_type") or ""), 9))
    merged = _merge_chunks(chunks)
    labels = ("理论定位", "内涵", "核心观点", "一句话记忆", "关键判断标准")
    passages: list[str] = []
    for label in labels:
        match = re.search(
            rf"(?:^|\n){re.escape(label)}\s*[:：]\s*(.+?)(?=\n(?:[\u4e00-\u9fffA-Za-z/（）()·—-]{{2,24}})\s*[:：]|\Z)",
            merged,
            flags=re.DOTALL,
        )
        if not match:
            continue
        passage = _clean_text(match.group(1), 520)
        if passage and passage not in passages:
            passages.append(passage)
        if len("；".join(passages)) >= 360 or len(passages) >= 2:
            break
    if passages:
        return f"{theory_name}：" + "；".join(passages)[:700]
    fallback = _sanitize_fallback_evidence(merged, theory_name, max_chars=620)
    return f"{theory_name}：{fallback}" if fallback else ""


def _merge_chunks(chunks: Iterable[dict[str, Any]]) -> str:
    """Join fixed-window chunks while removing their overlapping suffixes."""

    merged = ""
    for item in chunks:
        text = str(item.get("text") or "")
        if not text:
            continue
        if not merged:
            merged = text
            continue
        # The chunk builder uses an overlap of about 120 characters.  Search
        # the longest suffix/prefix to remain robust to future overlap sizes.
        max_overlap = min(len(merged), len(text), 500)
        overlap = 0
        for size in range(max_overlap, 19, -1):
            if merged[-size:] == text[:size]:
                overlap = size
                break
        merged += text[overlap:]
    return merged


def _extract_section(text: str, marker: re.Pattern[str], following: Sequence[re.Pattern[str]]) -> str:
    match = marker.search(text)
    if not match:
        return ""
    start = match.end()
    end = len(text)
    for next_marker in following:
        candidate = next_marker.search(text, start)
        if candidate:
            end = min(end, candidate.start())
    # Tables and subsequent headings can be very long; keep explanations
    # readable and bounded for the API response.
    return _clean_text(text[start:end], 5000)


def _parse_scenario_block(
    block: str,
    *,
    theory_name: str,
    source: dict[str, Any],
) -> dict[str, Any] | None:
    marker = _SCENARIO_MARKER.search(block)
    if not marker:
        return None
    answer_match = _ANSWER_MARKER.search(block, marker.end())
    if not answer_match:
        return None
    body = block[marker.end() : answer_match.start()].strip()
    # A source may contain a heading between the marker and the actual stem.
    body = re.sub(r"^\s*题目\s*[:：]?\s*", "", body, count=1)
    options: list[str] = []
    option_spans: list[tuple[int, int, str]] = []
    for match in _OPTION_LINE.finditer(body):
        option_spans.append((match.start(), match.end(), match.group(2).strip()))
    if option_spans:
        stem = body[: option_spans[0][0]].strip()
        for index, (_start, _end, option) in enumerate(option_spans):
            # Do not let a line from a later section become an option.
            if index >= 4:
                break
            options.append(option)
    else:
        # Older catalogue records put each theory option on its own line
        # without an A./B. prefix.  Infer options from the short lines before
        # the answer marker, using the known theory catalogue where possible.
        lines = [line.strip() for line in body.splitlines() if line.strip()]
        stem_lines: list[str] = []
        candidate_lines: list[str] = []
        seen_question = False
        for line in lines:
            if not seen_question and (line.endswith("？") or line.endswith("?")):
                stem_lines.append(line)
                seen_question = True
                continue
            if seen_question and len(candidate_lines) < 6 and len(line) <= 80:
                candidate_lines.append(line)
            elif not seen_question:
                stem_lines.append(line)
        if len(candidate_lines) >= 3:
            options = candidate_lines[:4]
            stem = "".join(stem_lines).strip()
        else:
            return None
    if len(options) < 2 or not stem:
        return None
    answer_letter = _canonical_letter(answer_match.group(1))
    answer_index = _ANSWER_LETTERS.find(answer_letter)
    if answer_index < 0 or answer_index >= len(options):
        return None
    # Parse the three explanations from the text following 标准答案.  If a
    # section is absent, keep a grounded fallback instead of an empty field.
    tail = block[answer_match.end() :]
    knowledge = _extract_section(
        tail,
        _SECTION_MARKER,
        (_EVIDENCE_MARKER, _DISTINCTION_MARKER, _REMINDER_MARKER),
    )
    evidence = _extract_section(
        tail,
        _EVIDENCE_MARKER,
        (_DISTINCTION_MARKER, _REMINDER_MARKER),
    )
    distinction = _extract_section(tail, _DISTINCTION_MARKER, (_REMINDER_MARKER,))
    reminder = _extract_section(tail, _REMINDER_MARKER, ())
    if not distinction:
        distinction = reminder
    if not knowledge:
        knowledge = f"本题考查{theory_name}在课堂目标、任务、互动和评价中的核心判断标准。"
    if not evidence:
        evidence = f"题干所述课堂事实应与{theory_name}的核心解释对象逐项对应，并以学生表现证据核验。"
    if not distinction:
        distinction = f"易错点：不要仅凭题干中的表面活动或术语作答，应先判断问题主因是否属于{theory_name}。"
    source_meta = {
        key: source.get(key)
        for key in ("chunk_id", "source_type", "source_title", "category_path")
        if source.get(key) not in (None, "")
    }
    clean_stem = _clean_text(stem, 5000)
    display_stem = _compose_display_stem(
        clean_stem,
        _question_request(clean_stem, theory_name, len(options)),
        theory_name,
    )
    display_stem = _vary_question_wording(display_stem, theory_name + clean_stem)
    canonical_stem = display_stem or clean_stem
    normalized_choices = _normalize_four_options(
        options,
        answer_index,
        theory_name=theory_name,
        seed_text=canonical_stem,
    )
    if normalized_choices is None:
        return None
    clean_options, answer_index = normalized_choices
    question_id = _question_id(theory_name, canonical_stem, clean_options)
    question = {
        "question_id": question_id,
        "id": question_id,
        "theory_name": theory_name,
        "stem": canonical_stem,
        # Keep the classroom fact and the requested judgement separate so the
        # UI does not render the same paragraph twice.
        "question": display_stem,
        "display_stem": display_stem,
        "options": clean_options,
        "answer": answer_index,
        "difficulty": "基础·理论识别",
        "analysis": {
            "knowledge": knowledge,
            "evidence": evidence,
            "distinction": distinction,
        },
        "sources": [source_meta] if source_meta else [],
        "origin": "knowledge_base",
        "schema_version": QUESTION_SCHEMA_VERSION,
        "created_at": _now_iso(),
    }
    return question


def parse_knowledge_questions(retriever: BM25Retriever) -> list[dict[str, Any]]:
    """Extract all complete scenario questions from the chunk catalogue."""

    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for chunk in getattr(retriever, "chunks", []) or []:
        theory = _clean_text(chunk.get("theory_name"), 200)
        source_type = _clean_text(chunk.get("source_type"), 100)
        source_title = _clean_text(chunk.get("source_title"), 300)
        if not theory or not source_type or not str(chunk.get("text") or ""):
            continue
        grouped[(theory, source_type, source_title)].append(chunk)

    questions: dict[str, dict[str, Any]] = {}
    for (theory, source_type, source_title), chunks in grouped.items():
        merged = _merge_chunks(chunks)
        if "情境判断" not in merged:
            continue
        # Usually one block exists per theory/source.  Splitting at the marker
        # also supports future records with multiple practice questions.
        matches = list(_SCENARIO_MARKER.finditer(merged))
        for index, match in enumerate(matches):
            end = matches[index + 1].start() if index + 1 < len(matches) else len(merged)
            marker_source = next(
                (
                    chunk for chunk in chunks
                    if match.group(0) in str(chunk.get("text") or "")
                ),
                chunks[min(index, len(chunks) - 1)] if chunks else {},
            )
            source = {
                "chunk_id": marker_source.get("chunk_id", ""),
                "source_type": source_type,
                "source_title": source_title,
                "category_path": marker_source.get("category_path", []),
            }
            parsed = _parse_scenario_block(
                merged[match.start() : end], theory_name=theory, source=source
            )
            if parsed:
                questions[parsed["question_id"]] = parsed
    return list(questions.values())


def _safe_json(text: Any) -> Any:
    raw = str(text or "").strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError, ValueError):
        # Models occasionally prepend one sentence. Decode the first complete
        # object/array in linear time without an O(n²) substring sweep.
        decoder = json.JSONDecoder()
        starts = [position for position in (raw.find("{"), raw.find("[")) if position >= 0]
        for start in sorted(starts):
            try:
                value, _end = decoder.raw_decode(raw[start:])
                return value
            except (json.JSONDecodeError, TypeError, ValueError):
                continue
    return None


def _validate_question(item: Any, theory_name: str) -> dict[str, Any] | None:
    if not isinstance(item, dict):
        return None
    item_theory = _clean_text(item.get("theory_name") or item.get("theory"), 200)
    # The caller supplies the canonical theory; accepting a missing model field
    # avoids losing otherwise useful generated questions, but never accepts a
    # different explicit theory.
    if item_theory and item_theory != theory_name:
        return None
    origin = str(item.get("origin") or "").strip()
    raw_stem = _clean_text(
        item.get("stem")
        or item.get("question")
        or item.get("scenario")
        or item.get("题干")
        or item.get("情境"),
        5000,
    )
    if not raw_stem:
        return None
    # Legacy offline records stored an entire theory profile as ``stem``.
    # Drop those records instead of trying to display a random sentence from
    # the definition; the store will regenerate a concise fallback on demand.
    if (
        origin == "local_fallback"
        and len(raw_stem) > 180
        and not _case_excerpt(raw_stem)
        and any(marker in raw_stem for marker in _EXPLANATORY_MARKERS + _EXPLANATION_MARKERS)
    ):
        return None
    options_raw = item.get("options") or item.get("选项")
    if isinstance(options_raw, dict):
        options_raw = [options_raw[key] for key in sorted(options_raw)]
    if not isinstance(options_raw, (list, tuple)):
        return None
    options = []
    for value in options_raw:
        if isinstance(value, dict):
            value = value.get("text") or value.get("label") or value.get("name") or ""
        cleaned = _clean_text(value, 500)
        # Models sometimes include the letter despite the array schema. Keep
        # the frontend's own A/B/C/D labels from being duplicated.
        cleaned = re.sub(r"^\s*[A-DＡ-Ｄ]\s*[\.．、:：)）]\s*", "", cleaned)
        if cleaned:
            options.append(cleaned)
    if len(options) < 2:
        return None
    answer_value = item.get(
        "answer",
        item.get(
            "correct_answer",
            item.get("correctAnswer", item.get("correct_option", item.get("correct"))),
        ),
    )
    if isinstance(answer_value, str):
        letter = _canonical_letter(answer_value)
        if letter not in _ANSWER_LETTERS:
            letter_match = re.match(r"^([A-D])(?:\s*[\.．、:：)）])?", letter)
            if letter_match:
                letter = letter_match.group(1)
        if letter in _ANSWER_LETTERS:
            answer_index = _ANSWER_LETTERS.index(letter)
        else:
            try:
                answer_index = int(answer_value)
            except (TypeError, ValueError):
                answer_text = _clean_text(answer_value, 500)
                answer_index = next(
                    (index for index, option in enumerate(options)
                     if answer_text == option or option.startswith(answer_text)),
                    -1,
                )
                if answer_index < 0:
                    return None
    else:
        try:
            answer_index = int(answer_value)
        except (TypeError, ValueError):
            return None
    if not 0 <= answer_index < len(options):
        # Some clients/models use one-based option numbers.
        if 1 <= answer_index <= len(options):
            answer_index -= 1
        else:
            return None
    normalized_choices = _normalize_four_options(
        options,
        answer_index,
        theory_name=theory_name,
        seed_text=raw_stem,
    )
    if normalized_choices is None:
        return None
    options, answer_index = normalized_choices
    question_text = _clean_text(
        item.get("question") or item.get("prompt") or item.get("判断要求"),
        1000,
    )
    ordinal = _schema_version(item.get("fallback_ordinal", 0))
    if not question_text or question_text == raw_stem or _is_generic_scenario_prompt(question_text):
        question_text = _question_request(raw_stem, theory_name, ordinal)
    elif origin == "local_fallback":
        # The local reserve deliberately uses the same canonical prompt
        # rotation as newly generated records.
        question_text = _question_request(raw_stem, theory_name, ordinal)
    else:
        question_text = _vary_question_wording(question_text, theory_name + raw_stem)
    display_stem = _compose_display_stem(
        raw_stem,
        question_text,
        theory_name,
        include_context=origin != "local_fallback",
    )
    if not display_stem:
        return None
    # A long raw theory paragraph with no observable case should never survive
    # normalization as its first sentence.  Keep only the concise request.
    if len(display_stem) > 760:
        display_stem = _compose_display_stem("", question_text, theory_name)
    canonical_stem = display_stem
    analysis_raw = item.get("analysis") if isinstance(item.get("analysis"), dict) else {}
    knowledge = _clean_text(
        analysis_raw.get("knowledge")
        or analysis_raw.get("core_knowledge")
        or analysis_raw.get("核心知识点")
        or item.get("knowledge")
        or item.get("core_knowledge")
        or item.get("核心知识点"),
        5000,
    )
    evidence = _clean_text(
        analysis_raw.get("evidence")
        or analysis_raw.get("scenario")
        or analysis_raw.get("scenario_mapping")
        or analysis_raw.get("情境精准定位")
        or analysis_raw.get("情境精准对应")
        or item.get("evidence")
        or item.get("scenario_mapping"),
        5000,
    )
    distinction = _clean_text(
        analysis_raw.get("distinction")
        or analysis_raw.get("misconception")
        or analysis_raw.get("error_analysis")
        or analysis_raw.get("易错辨析")
        or item.get("distinction")
        or item.get("misconception"),
        5000,
    )
    if not (knowledge and evidence and distinction):
        return None
    normalized = {
        "question_id": _question_id(theory_name, canonical_stem, options),
        "id": _question_id(theory_name, canonical_stem, options),
        "theory_name": theory_name,
        "stem": canonical_stem,
        "display_stem": display_stem,
        "question": question_text,
        "display_stem": display_stem,
        "options": options,
        "answer": answer_index,
        "difficulty": _clean_text(item.get("difficulty"), 80) or "进阶·情境应用",
        "analysis": {
            "knowledge": knowledge,
            "evidence": evidence,
            "distinction": distinction,
        },
        "sources": item.get("sources") if isinstance(item.get("sources"), list) else [],
        "origin": origin or "llm_generated",
        "schema_version": QUESTION_SCHEMA_VERSION,
        "created_at": _clean_text(item.get("created_at"), 80) or _now_iso(),
    }
    raw_legacy_ids = item.get("legacy_question_ids")
    if isinstance(raw_legacy_ids, (list, tuple)):
        normalized["legacy_question_ids"] = list(raw_legacy_ids)
    for key in ("question_id", "id"):
        legacy_id = _clean_text(item.get(key), 200)
        if legacy_id:
            normalized.setdefault("legacy_question_ids", []).append(legacy_id)
    _assign_question_id(normalized, theory_name, canonical_stem, options)
    return normalized


def _compact_evidence(retriever: BM25Retriever, theory_name: str, max_chars: int = 9000) -> tuple[str, list[dict[str, Any]]]:
    # First use BM25 to retrieve scenario/analysis-relevant windows, then
    # supplement with same-theory definition windows.  Filtering by the
    # canonical theory after retrieval prevents similarly named theories from
    # leaking into a specialized prompt.
    chunks: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    search = getattr(retriever, "search", None)
    if callable(search):
        try:
            hits = search(
                f"{theory_name} 情境判断训练 核心知识点 情境精准对应 易错辨析",
                top_k=30,
            )
        except Exception:
            hits = []
        for hit in hits or []:
            chunk = getattr(hit, "chunk", hit)
            if not isinstance(chunk, dict) or str(chunk.get("theory_name") or "").strip() != theory_name:
                continue
            identifier = str(chunk.get("chunk_id") or id(chunk))
            if identifier in seen_ids:
                continue
            chunks.append(chunk)
            seen_ids.add(identifier)
    for chunk in getattr(retriever, "chunks", []) or []:
        if str(chunk.get("theory_name") or "").strip() != theory_name:
            continue
        identifier = str(chunk.get("chunk_id") or id(chunk))
        if identifier in seen_ids:
            continue
        chunks.append(chunk)
        seen_ids.add(identifier)
    # Keep definitions and practical classroom material; the latter contains
    # the most useful distinctions for scenario questions.
    priority = {"课堂范本": 0, "教理范式汇典": 1, "理论完成解释": 2}
    chunks.sort(key=lambda item: (priority.get(str(item.get("source_type")), 9), len(str(item.get("text") or ""))))
    pieces: list[str] = []
    sources: list[dict[str, Any]] = []
    total = 0
    for chunk in chunks:
        text = _clean_text(chunk.get("text"), 2600)
        if not text:
            continue
        remaining = max_chars - total
        if remaining <= 0:
            break
        text = text[:remaining]
        pieces.append(text)
        sources.append(
            {
                key: chunk.get(key)
                for key in ("chunk_id", "source_type", "source_title", "category_path")
                if chunk.get(key) not in (None, "")
            }
        )
        total += len(text)
    return "\n\n".join(pieces), sources[:8]


def _model_timeout() -> float:
    try:
        # Scenario generation returns several grounded JSON objects in one
        # call and is slower than a short chat turn.  Cache the result after
        # this first request, while still bounding a failed relay attempt.
        return min(90.0, max(10.0, float(os.getenv("THEORY_TRAINING_API_TIMEOUT_SECONDS", "60"))))
    except ValueError:
        return 60.0


def _generate_questions_batch(
    client: Any,
    retriever: BM25Retriever,
    theory_name: str,
    count: int,
    *,
    evidence: str | None = None,
    sources: list[dict[str, Any]] | None = None,
    exclude_stems: Sequence[str] = (),
) -> list[dict[str, Any]]:
    """Generate and validate one small batch for a canonical theory."""

    if client is None or count <= 0:
        return []
    # Keep the prompt compact enough for a predictable first-generation
    # latency; the full source metadata is still retained in ``sources``.
    if evidence is None or sources is None:
        evidence, sources = _compact_evidence(retriever, theory_name, max_chars=5000)
    if not evidence:
        return []
    exclusion_text = ""
    if exclude_stems:
        exclusion_text = "\n不要重复以下已生成题干：\n" + "\n".join(
            f"- {stem[:260]}" for stem in exclude_stems[-8:]
        )
    prompt = f"""
你是教育学理论情境训练题命题专家。只根据下面知识库证据，为“{theory_name}”生成 {count} 道互不重复的课堂情境判断题。
每题必须围绕真实小学课堂行为，题干具体、可判断，选项为 4 个理论名称或清晰的理论判断；正确答案必须能由证据支持。
题目的 stem 只写学生需要作答的考试题干，不要把理论定义、核心观点、通用应用范围、知识库标题或解析内容复制进题干；不要使用“某教师在课堂中出现如下做法：理论名称……”这类空泛套话。
题干句式要有变化，轮换使用“某教师认为……该观点属于（ ）”“某课堂做法主要体现（ ）”“这一教学现象说明（ ）”“若依据该理论，教师下一步应当（ ）”“下列判断最恰当的是（ ）”等表达，并把具体课堂行为、学生反应或研究事实写进题干。
每题解析必须具体绑定题干事实，且包含：核心知识点、情境精准定位、易错辨析（说明至少一个错项为什么不合适）。
严格只输出 JSON，不要 Markdown 或解释文字，格式：
{{"questions":[{{"theory_name":"{theory_name}","stem":"只包含最终考试题干","options":["...","...","...","..."],"answer":0,"analysis":{{"knowledge":"...","evidence":"...","distinction":"..."}}}}]}}
answer 使用从 0 开始的选项索引；理论名称必须是“{theory_name}”，不得编造教材、政策、人物或来源。

知识库证据：
{evidence}
{exclusion_text}
""".strip()
    try:
        model_client = client
        if hasattr(client, "with_options"):
            model_client = client.with_options(timeout=_model_timeout(), max_retries=0)
        arguments = {
            "model": MODEL,
            "instructions": "严格输出合法 JSON；不得展示思维过程。",
            "input": prompt,
            "reasoning": {
                "effort": os.getenv("THEORY_TRAINING_REASONING_EFFORT", REASONING_EFFORT)
            },
            "max_output_tokens": max(1200, min(4200, 900 * max(1, count))),
            "store": False,
        }
        try:
            response = model_client.responses.create(**arguments)
        except TypeError:
            # Lightweight test doubles and older OpenAI SDKs may not accept
            # the optional reasoning/store arguments.
            arguments.pop("reasoning", None)
            arguments.pop("store", None)
            response = model_client.responses.create(**arguments)
        parsed = _safe_json(getattr(response, "output_text", ""))
    except Exception:
        return []
    raw_questions: Any = parsed.get("questions") if isinstance(parsed, dict) else parsed
    if not isinstance(raw_questions, list):
        return []
    validated: list[dict[str, Any]] = []
    for item in raw_questions:
        normalized = _validate_question(item, theory_name)
        if normalized is None:
            continue
        normalized["sources"] = sources
        if normalized["question_id"] not in {q["question_id"] for q in validated}:
            validated.append(normalized)
        if len(validated) >= count:
            break
    return validated


def generate_questions_with_llm(
    client: Any,
    retriever: BM25Retriever,
    theory_name: str,
    count: int,
) -> list[dict[str, Any]]:
    """Generate a batch reliably, splitting large requests into <=4 items."""

    if client is None or count <= 0:
        return []
    target = max(1, int(count))
    evidence, sources = _compact_evidence(retriever, theory_name, max_chars=5000)
    if not evidence:
        return []
    generated: list[dict[str, Any]] = []
    seen_signatures: set[str] = set()
    # Four-item responses stay well below the relay's output/context limit;
    # continue in another call when the caller asks for a larger reserve.
    while len(generated) < target:
        batch_size = min(4, target - len(generated))
        batch = _generate_questions_batch(
            client,
            retriever,
            theory_name,
            batch_size,
            evidence=evidence,
            sources=sources,
            exclude_stems=[item.get("stem", "") for item in generated],
        )
        if not batch:
            break
        added = 0
        for item in batch:
            signature = _question_signature(item)
            if signature in seen_signatures:
                continue
            seen_signatures.add(signature)
            generated.append(item)
            added += 1
            if len(generated) >= target:
                break
        if not added:
            break
    return generated[:target]


def _sanitize_fallback_evidence(evidence: str, theory_name: str, max_chars: int = 420) -> str:
    """Extract a short classroom fact without answer-key material."""

    text = unicodedata.normalize("NFKC", str(evidence or ""))
    # Stop at practice/answer *headings* before considering paragraph content.
    # ``标准答案`` may also be an ordinary classroom phrase, so a global
    # substring cut would destroy otherwise useful evidence.
    cut_positions = _noise_heading_positions(text)
    for pattern in (r"情境判断(?:训练)?", r"情境落地训练"):
        for match in re.finditer(rf"(?m)^\s*(?:\d+\s*[.．、)]\s*)?{pattern}", text):
            cut_positions.append(match.start())
    if cut_positions:
        text = text[: min(cut_positions)]
    # Source chunks carry metadata headers before the actual body. Keep the
    # body so fallback stems do not expose catalogue bookkeeping fields.
    body_markers = [text.find("正文："), text.find("正文:")]
    body_starts = [position + 3 for position in body_markers if position >= 0]
    if body_starts:
        text = text[min(body_starts):]
    # Remove option-like lines and table labels that survive unusual layouts.
    text = re.sub(r"(?m)^\s*[A-DＡ-Ｄ]\s*[\.．、:：)）].*$", " ", text)
    text = re.sub(r"(?m)^\s*(?:题目|选项|答案|解析)\s*[:：].*$", " ", text)
    text = re.sub(r"(?:核心知识点|情境精准对应|情境精准定位|易错辨析)\s*[:：]?", " ", text)
    text = re.sub(r"\s*\|\s*", "；", text)

    # Keep only segments that describe an observable classroom/research event.
    # This filters table rows such as ``适用场景`` and abstract definitions
    # before a synthetic fallback is built from the evidence.
    segments = [
        part.strip(" ，,：:；;\n")
        for part in re.split(r"(?<=[。！？!?；;])|\n+", text)
        if part.strip()
    ]
    concrete: list[str] = []
    for segment in segments:
        if len(segment) < 12 or any(marker in segment for marker in _EXPLANATION_MARKERS):
            continue
        if re.search(r"(?:教师|学生|课堂|教学|执教|研究团队|研究显示|班级|小组)", segment) is None:
            continue
        if re.search(r"(?:安排|组织|设计|采用|要求|让学生|讲解|提问|操作|实验|朗读|圈画|"
                     r"讨论|比较|记录|观察|调整|忽略|只让|没有安排|直接给出|布置|评价|"
                     r"覆盖|推进|背诵|模仿|迁移|分析|发现|完成)", segment) is None:
            continue
        if re.search(r"(?:核心适用逻辑|通用应用范围|理论定位|理论要求|适配备课|适用于|"
                     r"作为[^。；]{0,30}依据|边界提醒|课堂操作\s*[:：])", segment):
            continue
        concrete.append(segment)
        if len(concrete) >= 3:
            break
    if not concrete:
        return ""
    result = "。".join(concrete)
    result = re.sub(r"\s+", "", result)
    if theory_name:
        result = result.replace(theory_name, "该理论")
    return result[:max_chars].strip(" ，。；;")


def _fallback_contains_answer_key(item: dict[str, Any]) -> bool:
    """Detect legacy fallback records that expose a complete answer block."""

    stem = str(item.get("stem") or "")
    if "标准答案" in stem:
        return True
    if "情境判断训练" in stem and re.search(r"[A-DＡ-Ｄ]\s*[\.．、:：)）]", stem):
        return True
    return bool(
        "详细解析" in stem
        and re.search(r"(?:核心知识点|易错辨析)", stem)
    )


def _fallback_case_from_chunks(
    chunks: Sequence[dict[str, Any]],
    theory_name: str,
    ordinal: int = 0,
) -> str:
    """Select a concise, concrete example for an offline question.

    A theory record contains many explanatory windows, while only a handful
    contain an actual classroom case.  Selecting by source type and explicit
    example markers prevents the fallback from turning a definition such as
    ``教学应适度超前`` into a fake classroom transcript.
    """

    candidates: list[tuple[int, int, str]] = []
    for chunk in chunks:
        raw = _clean_text(chunk.get("text"), 8000)
        if not raw:
            continue
        source_type = str(chunk.get("source_type") or "")
        # Split at explicit examples first.  A chunk may begin halfway through
        # an example because of the retrieval window, so also inspect the raw
        # text when no label is present.
        windows: list[str] = []
        labels = list(
            re.finditer(
                r"(?:具体课例|课堂案例|教学案例|案例\s*\d*|例如[，,:：]?|以《[^》]{1,80}》为例[，,:：]?)",
                raw,
            )
        )
        if labels:
            for index, label in enumerate(labels):
                end = labels[index + 1].start() if index + 1 < len(labels) else len(raw)
                windows.append(raw[label.start():end])
        else:
            windows.append(raw)
        for window in windows:
            excerpt = _case_excerpt(window, max_chars=520)
            if not excerpt:
                continue
            # Reject instructions and definitions that happened to include a
            # teacher noun but no classroom event.
            if any(marker in excerpt for marker in _EXPLANATION_MARKERS):
                continue
            if re.search(r"(?:教师|学生|课堂|执教|班主任|研究团队)", excerpt) is None:
                continue
            if re.search(
                r"(?:让|要求|组织|安排|设计|观察|记录|比较|讲解|提问|调整|忽略|"
                r"采用|收集|分析|发现|开展|布置|给出|联系|完成|处理|提供|巡视|"
                r"互评|修改|创造)",
                excerpt,
            ) is None or re.search(
                r"(?:学生|课堂|任务|结果|错误|回答|作品|实验|数据|观点|发言|"
                r"理解|迁移|表现|小组|同伴)",
                excerpt,
            ) is None:
                continue
            # Classroom范本 and explicitly titled examples are more likely to
            # be concrete than a generic theory paragraph.
            score = {"课堂范本": 30, "理论完成解释": 20, "教理范式汇典": 15}.get(source_type, 0)
            if "《" in excerpt:
                score += 15
            if "例如" in window or "具体课例" in window or "以《" in window:
                score += 10
            excerpt = _compact_case_text(excerpt, max_chars=300)
            if not excerpt:
                continue
            # Chunk windows can start in the middle of an explanatory sentence
            # (for example, “绕算理理解……”).  Such fragments are not useful
            # as a learner-facing scenario and tend to expose theory jargon.
            if not re.match(r"^(?:例如[，,：:]?|一位|某|教师|学生|课堂|《|一项)", excerpt):
                continue
            if re.search(r"(?:确立育人目标|转化为学生能够|落实为可观察|理论的核心|依据[^。；]{0,30}理论)", excerpt):
                continue
            candidates.append((score, len(excerpt), excerpt))
    # Deduplicate near-identical windows while retaining the best score.
    unique: dict[str, tuple[int, int, str]] = {}
    for score, length, excerpt in candidates:
        key = re.sub(r"\s+", "", excerpt)
        previous = unique.get(key)
        if previous is None or (score, length) > (previous[0], previous[1]):
            unique[key] = (score, length, excerpt)
    ranked = sorted(unique.values(), key=lambda item: (-item[0], -item[1], item[2]))
    if ranked:
        return ranked[int(ordinal) % len(ranked)][2]
    return ""


def _compact_case_text(value: Any, *, max_chars: int = 300) -> str:
    """Make one fallback case concise and remove theory self-references."""

    text = _clean_text(value, 1200)
    if not text:
        return ""
    text = re.sub(r"。{2,}", "。", text)
    text = re.sub(r"教师(?:基于|依据)[^，。；]{0,40}(?:设计教学|开展教学|组织教学)，?", "教师", text)
    text = re.sub(r"(?:该课例|这一做法|该安排)[^。；]{0,60}(?:正是|体现了|符合)[^。；]*[。；]", "", text)
    text = re.sub(r"未依托[^，。；]{0,30}(?:理论)?", "", text)
    text = re.sub(r"依据[^，。；]{0,30}理论持续观察学习证据、调整支持", "", text)
    # Remove labels that make the answer visible or turn a fact into a
    # recommendation.  Keep concrete negative outcomes (e.g. “不会解决”).
    text = re.sub(r"(?:理论要求|课堂观察指标|教师行为|学生行为)\s*[:：].*$", "", text)
    text = re.sub(r"\s+", "", text)
    pieces = [
        part.strip(" ，,：:；;。！？!?")
        for part in re.split(r"(?<=[。！？!?])", text)
        if part.strip()
    ]
    pieces = [
        part for part in pieces
        if not any(marker in part for marker in _EXPLANATION_MARKERS + ("核心判断标准",))
    ]
    if not pieces:
        return ""
    # One or two sentences are sufficient for an exam stem and keep the
    # generated card scannable on mobile screens.
    result = "。".join(pieces[:2]).strip(" 。；;")
    if len(result) > max_chars:
        result = result[:max_chars]
        boundary = max(result.rfind("。"), result.rfind("；"), result.rfind("，"))
        if boundary >= 40:
            result = result[:boundary]
    return _polish_question_punctuation(result).strip(" 。；;")


def _fallback_synthetic_case(theory_name: str, evidence: str, ordinal: int) -> str:
    """Build a short, observable classroom fact when no authored example exists.

    Definition/table windows are not suitable as learner-facing scenarios.  A
    previous fallback copied those windows verbatim, producing stems such as
    ``适用场景……课堂操作……``.  Use a small set of neutral but concrete
    classroom events instead; the theory evidence remains available in the
    answer feedback and source metadata.
    """

    templates = (
        "教师先让学生独立完成一项与课题相关的任务，再请学生说明思路，并根据不同回答调整后续提示。",
        "教师提供两种材料或表达路径，组织学生比较证据、互相质询，最后用新情境任务检验能否迁移。",
        "教师先让学生预测结果并记录依据，发现多数学生出现同一错误后暂停讲解，改用操作演示和同伴讨论帮助修正。",
        "小组合作完成探究任务，教师巡视记录每名学生的参与和作品，随后按表现分层布置下一步练习。",
        "教师把生活问题转成课堂任务，学生用画图、操作和口头表达呈现不同解法，再共同比较方法的依据。",
        "教师先展示学生的两种答案，要求全班找出证据并解释差异，依据讨论结果重新安排练习难度。",
        "课堂中少数学生反复回答，教师改用随机抽取和同伴互评，让更多学生提交思路与证据。",
        "学生完成任务后，教师不立即公布答案，而是安排自评、互评和修改，并检查新题中的应用表现。",
    )
    return templates[int(ordinal) % len(templates)]


def _fallback_generated_question(retriever: BM25Retriever, theory_name: str, ordinal: int) -> dict[str, Any] | None:
    """Create a transparent, evidence-bound question when the relay is down."""

    evidence, sources = _compact_evidence(retriever, theory_name, max_chars=1800)
    if not evidence:
        return None
    candidates = [
        chunk for chunk in getattr(retriever, "chunks", []) or []
        if str(chunk.get("theory_name") or "").strip() == theory_name
    ]
    candidates.sort(key=lambda item: (
        {"教理范式汇典": 0, "理论完成解释": 1, "课堂范本": 2}.get(str(item.get("source_type") or ""), 9),
        -len(str(item.get("text") or "")),
    ))
    # Select an authored classroom example where possible.  Never use the
    # first definition window merely because it is the longest chunk.
    excerpt = _fallback_case_from_chunks(candidates, theory_name, ordinal)
    if not excerpt:
        excerpt = _fallback_synthetic_case(theory_name, evidence, ordinal)
    # Keep the authored classroom fact intact.  Wording diversity comes from
    # the final request, so a fallback never fabricates a contradictory second
    # event (an earlier version appended “教师只给出统一答案” to a positive
    # example and made the scenario logically inconsistent).
    stem = excerpt
    prompt = _question_request(stem, theory_name, ordinal)
    correct_option = f"以{theory_name}的核心概念分析课堂目标、任务与学生证据，并据此调整教学"
    distractor_sets = (
        (
            "只依据学生当堂得分判断理论是否落实，不检查学习过程",
            "把任何热闹的活动都视为该理论已经落实，不再核对课堂证据",
            "用固定流程替代对具体学情、内容和学生发展的分析",
        ),
        (
            "只要安排小组活动就可以认定理论已经落实，不看任务质量",
            "把教师讲得是否完整当作唯一标准，不收集学生学习证据",
            "先套用固定环节，再要求所有学生按同一方式完成任务",
        ),
        (
            "只看课堂气氛是否热烈，不追问学生是否真正理解",
            "用一次正确答案代替对思路、依据和迁移表现的判断",
            "忽略学生差异，直接提高任务难度或减少必要支架",
        ),
        (
            "把理论术语写进教案就当作课堂已经实现了理论要求",
            "只记录教师的讲解步骤，不记录学生的回应和修正",
            "出现问题时维持原流程，不根据现场证据调整支持",
        ),
        (
            "把完成练习数量当作学习质量，不分析任务之间的联系",
            "只让少数学生代表发言，再据此推断全班学习状态",
            "把同伴互评当成形式环节，不要求学生说明判断依据",
        ),
        (
            "先给出结论再寻找零散例子证明，跳过学生的探究过程",
            "只评价最终作品，不关注学生如何形成和修正解释",
            "用统一答案压制不同但有证据支持的理解路径",
        ),
    )
    options = [correct_option, *distractor_sets[ordinal % len(distractor_sets)]]
    random.shuffle(options)
    # Offline mode has no model to author a trustworthy new scenario.  Show a
    # concise independent request and keep the evidence in the post-answer
    # explanation instead of exposing a theory-definition paragraph.
    # The learner must see the observable classroom fact.  Earlier versions
    # hid it from the card and left only a generic one-line request, which made
    # specialized and random rounds impossible to judge independently.
    display_stem = _compose_display_stem(stem, prompt, theory_name, include_context=True)
    # Persist the learner-facing request in the semantic stem so rounds that
    # reuse one short authored example still remain distinct by wording.
    canonical_stem = display_stem or stem
    question = {
        "question_id": _question_id(theory_name, canonical_stem, options),
        "id": _question_id(theory_name, canonical_stem, options),
        "theory_name": theory_name,
        "stem": canonical_stem,
        "question": display_stem,
        "display_stem": display_stem,
        "options": options,
        "answer": options.index(correct_option),
        "difficulty": "基础·情境判断",
        "analysis": {
            "knowledge": f"理论库中的{theory_name}材料指出：{excerpt[:520]}",
            "evidence": f"本题课堂事实取自该理论的知识库片段：{excerpt[:520]}；作答时需说明事实如何对应理论机制。",
            "distinction": f"易错辨析：有活动、有分数或出现理论术语，并不等于{theory_name}已经落实；必须核对题干事实与理论机制的对应关系及适用边界。",
        },
        "sources": sources,
        "origin": "local_fallback",
        "schema_version": QUESTION_SCHEMA_VERSION,
        "created_at": _now_iso(),
        "fallback_ordinal": ordinal,
    }
    return question


def _local_question_variant(
    base: dict[str, Any],
    theory_name: str,
    ordinal: int,
) -> dict[str, Any]:
    """Create a distinct answerable reserve item from an existing record.

    This is the last-resort count guarantee when a relay returns fewer valid
    JSON questions than requested.  The classroom fact and request vary, but
    the authoritative explanation and sources remain attached to the same
    theory so the resulting item can be graded like any cached question.
    """

    case = _fallback_synthetic_case(theory_name, "", ordinal)
    request = _question_request(case, theory_name, ordinal)
    display_stem = _compose_display_stem(case, request, theory_name, include_context=True)
    options = [_clean_training_option(value) for value in base.get("options", [])]
    try:
        answer = int(base.get("answer", 0) or 0)
    except (TypeError, ValueError):
        answer = 0
    answer = max(0, min(max(0, len(options) - 1), answer))
    item = {
        **base,
        "theory_name": theory_name,
        "stem": display_stem,
        "display_stem": display_stem,
        "question": _normalize_learner_request(request, has_context=True, fallback=request),
        "options": options,
        "answer": answer,
        "origin": "local_fallback",
        "schema_version": QUESTION_SCHEMA_VERSION,
        "created_at": _now_iso(),
        "fallback_ordinal": ordinal,
    }
    _rewrite_correct_option(item, ordinal)
    item["question_id"] = _question_id(theory_name, display_stem, item["options"])
    item["id"] = item["question_id"]
    return item


def _normalize_question_display(
    item: dict[str, Any],
    retriever: BM25Retriever,
    ordinal: int = 0,
) -> dict[str, Any]:
    """Guarantee a self-contained, concise learner-facing question.

    Legacy catalogue records often contain a theory definition followed by a
    dangling request, while old fallback records contain only the request.
    Reconstruct the visible stem from an evidence-bound classroom case and a
    short varied question.  Explanations remain in ``analysis`` and are never
    copied into the card.
    """

    if not isinstance(item, dict):
        return item
    theory = _clean_text(item.get("theory_name"), 200)
    raw_options = item.get("options") if isinstance(item.get("options"), list) else []
    try:
        raw_answer = int(item.get("answer", 0) or 0)
    except (TypeError, ValueError):
        raw_answer = 0
    normalized_choices = _normalize_four_options(
        raw_options,
        raw_answer,
        theory_name=theory,
        seed_text=str(item.get("stem") or item.get("display_stem") or item.get("question") or ""),
    )
    if normalized_choices is not None:
        item["options"], item["answer"] = normalized_choices
    raw = _clean_text(
        item.get("stem") or item.get("display_stem") or item.get("question"),
        8000,
    )
    existing_display = _clean_text(item.get("display_stem"), 1200)
    # Normalization is intentionally idempotent.  Once a record has a clean,
    # evidence-bearing display stem, do not re-run extraction and rotate its
    # wording on every cache load.
    if (
        existing_display
        and len(existing_display) <= 900
        and _has_observable_case(existing_display)
        and not any(marker in existing_display for marker in _EXPLANATION_MARKERS)
        and not _is_generic_scenario_prompt(existing_display)
        and not _contains_dangling_prompt(existing_display)
        and _assessment_marker_count(existing_display) == 1
    ):
        item["stem"] = existing_display
        item["display_stem"] = existing_display
        item.setdefault("question", _extract_question_tail(existing_display) or existing_display)
        _assign_question_id(item, theory, existing_display, item.get("options", []))
        return item
    # Prefer an authored case already present in the record.  If it is absent,
    # search same-theory chunks for a concrete example before synthesizing one.
    case = _case_excerpt(raw, max_chars=520)
    case_replaced = False
    case_is_concrete = bool(
        case
        and _has_observable_case(case)
        and not _is_generic_scenario_prompt(case)
        and not re.fullmatch(r"(?:面对|针对|结合|根据|从|这项|该|下列|哪一|哪项|请)[^。！？!?]{2,100}[？?。.!！]?(?:\s*\([^)]*\))?", case)
    )
    if not case_is_concrete:
        case_replaced = True
        chunk_cache = getattr(retriever, "_training_theory_chunks", None)
        if not isinstance(chunk_cache, dict):
            grouped_chunks: dict[str, list[dict[str, Any]]] = defaultdict(list)
            for chunk in getattr(retriever, "chunks", []) or []:
                if isinstance(chunk, dict):
                    grouped_chunks[str(chunk.get("theory_name") or "").strip()].append(chunk)
            chunk_cache = grouped_chunks
            try:
                setattr(retriever, "_training_theory_chunks", chunk_cache)
            except Exception:
                pass
        chunks = list(chunk_cache.get(theory, []))
        default_case_cache = getattr(retriever, "_training_default_cases", None)
        if not isinstance(default_case_cache, dict):
            default_case_cache = {}
            try:
                setattr(retriever, "_training_default_cases", default_case_cache)
            except Exception:
                pass
        case = default_case_cache.get(theory, "")
        if not case:
            # Score merged/example windows so a case split across overlapping
            # 800-character chunks is reconstructed before fallback synthesis.
            case = _fallback_case_from_chunks(chunks, theory, ordinal)
            if case and not _has_observable_case(case):
                case = ""
            default_case_cache[theory] = case
        if not case:
            # Synthetic cases are deliberately theory-neutral and the source
            # evidence remains in the feedback panel.  Do not run a BM25
            # search for every definition-only record during startup.
            case = _fallback_synthetic_case(theory, "", ordinal)
        if not _has_observable_case(case):
            case = _fallback_synthetic_case(theory, "", ordinal)
        case_replaced = True
    request_candidates = [] if case_replaced else [
        _extract_question_tail(raw),
        _clean_text(item.get("question"), 800),
    ]
    request = ""
    case_anchor = re.sub(r"\s+", "", case).replace("，", ",")[:32]
    for candidate in request_candidates:
        candidate = _clean_text(candidate, 800)
        # Older catalogue records stored the full visible stem in ``question``
        # as well as ``stem``.  Never treat that duplicated case paragraph as
        # the learner-facing request; try to recover only its final question.
        candidate_anchor = re.sub(r"\s+", "", candidate).replace("，", ",")[:32]
        if len(candidate) > 180 or (case_anchor and candidate_anchor.startswith(case_anchor)):
            extracted_candidate = _extract_question_tail(candidate)
            candidate = extracted_candidate or ""
        # A legacy record may store the case and the dangling generic request
        # together.  Even if the case prefix prevents the generic detector
        # from matching, the request itself must never be shown verbatim.
        if any(marker in candidate for marker in ("面对这一教学问题", "针对上述课堂", "针对前述课堂")):
            candidate = ""
        if not candidate or _is_generic_scenario_prompt(candidate):
            continue
        if _GENERIC_YES_NO_RE.fullmatch(candidate):
            continue
        if any(marker in candidate for marker in _DISPLAY_NOISE_MARKERS + _EXPLANATORY_MARKERS):
            continue
        # Requests that still point to an invisible paragraph are not
        # independently answerable; replace them with a rotated template.
        if re.search(r"(?:上述|前述)(?:课堂|做法|案例|现象)", candidate):
            continue
        if not (re.search(r"[？?]$", candidate) or "（" in candidate or "(" in candidate):
            continue
        request = candidate
        break
    if not request or len(request) > 180:
        request = _question_request(case, theory, ordinal)
    # Remove duplicate OCR/window-overlap sentences before composing the card.
    case_sentences = [part.strip() for part in re.split(r"(?<=[。！？!?])", case or "") if part.strip()]
    case_compact: list[str] = []
    for sentence in case_sentences:
        normalized_sentence = re.sub(r"\s+", "", sentence).strip("。！？!?")
        if normalized_sentence and all(
            normalized_sentence != re.sub(r"\s+", "", old).strip("。！？!?")
            for old in case_compact[-3:]
        ):
            case_compact.append(sentence)
    case = "".join(case_compact).strip() or case
    visible = _compose_display_stem(case, request, theory, include_context=True)
    if not visible:
        visible = f"{case} {_question_request(case, theory, ordinal)}".strip()
    # Remove accidental adjacent duplicate sentences introduced by OCR/window
    # overlap while preserving the original order and wording.
    sentences = [part.strip() for part in re.split(r"(?<=[。！？!?])", visible) if part.strip()]
    compact: list[str] = []
    for sentence in sentences:
        normalized = re.sub(r"\s+", "", sentence).strip("。！？!?")
        if normalized and all(normalized != re.sub(r"\s+", "", old).strip("。！？!?") for old in compact[-2:]):
            compact.append(sentence)
    visible = "".join(compact).strip()[:900]
    if _assessment_marker_count(visible) != 1:
        request = _normalize_learner_request(
            request,
            has_context=bool(case),
            fallback=_question_request(case, theory, ordinal),
        )
        visible = _compose_display_stem(case, request, theory, include_context=True)
    item["stem"] = visible
    item["display_stem"] = visible
    item["question"] = request
    options = item.get("options") if isinstance(item.get("options"), list) else []
    _assign_question_id(item, theory, visible, options)
    return item


class TheoryTrainingStore:
    """Thread-safe cache, session registry and attempt history."""

    def __init__(
        self,
        retriever: BM25Retriever,
        client: Any = None,
        *,
        questions_path: Path | None = None,
        history_path: Path | None = None,
    ) -> None:
        self.retriever = retriever
        self.client = client
        self.questions_path = questions_path or QUESTIONS_PATH
        self.history_path = history_path or HISTORY_PATH
        self._lock = threading.RLock()
        # Serialize model top-ups without holding the catalogue lock.  A slow
        # relay request must not block answer/history reads for other users.
        self._generation_lock = threading.Lock()
        self.questions: list[dict[str, Any]] = []
        self.history_items: list[dict[str, Any]] = []
        self.sessions: dict[str, dict[str, Any]] = {}
        self._knowledge_excerpt_cache: dict[str, str] = {}
        self._load()

    def _load(self) -> None:
        with self._lock:
            raw_questions = _read_json(self.questions_path, [])
            if isinstance(raw_questions, dict):
                raw_questions = raw_questions.get("questions", [])
            raw_question_items = raw_questions if isinstance(raw_questions, list) else []
            # A schema bump is a migration boundary.  Do not feed old stems
            # through the new normalizer and then mark them current: doing so
            # preserves duplicated/generic records and prevents a clean
            # catalogue rebuild.  Freshly parsed knowledge-base items below
            # replace this discarded cache in one pass.
            cache_requires_rebuild = any(
                isinstance(item, dict)
                and _schema_version(item.get("schema_version", 1)) < QUESTION_SCHEMA_VERSION
                for item in raw_question_items
            )
            force_rebuild = os.getenv("THEORY_TRAINING_REBUILD", "").strip().lower() in {
                "1", "true", "yes", "on"
            }
            if cache_requires_rebuild or force_rebuild:
                raw_question_items = []
            loaded: list[dict[str, Any]] = []
            for item in raw_question_items:
                theory = _clean_text(item.get("theory_name"), 200) if isinstance(item, dict) else ""
                normalized = _validate_question(item, theory) if theory else None
                if normalized:
                    # Drop pre-v2 offline variants that duplicated the whole
                    # stem in ``question``; they will be regenerated with the
                    # separated fact/prompt schema below.
                    if (
                        item.get("origin") == "local_fallback"
                        and str(item.get("question") or "").strip()
                        == str(item.get("stem") or "").strip()
                    ):
                        continue
                    if item.get("origin") == "local_fallback" and _fallback_contains_answer_key(item):
                        continue
                    normalized.update(
                        {
                            "sources": item.get("sources", normalized.get("sources", [])),
                            "origin": item.get("origin", "cached"),
                            "schema_version": _schema_version(item.get("schema_version", 1)),
                            "difficulty": _clean_text(
                                item.get("difficulty"), 80
                            ) or normalized.get("difficulty", "进阶·情境应用"),
                            "created_at": item.get("created_at", normalized.get("created_at")),
                        }
                    )
                    normalized = _normalize_question_display(normalized, self.retriever, len(loaded))
                    if _has_observable_case(normalized.get("display_stem")):
                        loaded.append(normalized)
            # Bootstrap knowledge-base questions once.  Avoid reparsing the
            # 13k-chunk index on every process restart when a valid cache is
            # already present; set THEORY_TRAINING_REBUILD=1 to refresh it.
            rebuild = cache_requires_rebuild or force_rebuild
            has_catalogue_questions = any(
                item.get("origin") in {"knowledge_base", "cached"} for item in loaded
            )
            stale_schema = any(
                _schema_version(item.get("schema_version", 1)) < QUESTION_SCHEMA_VERSION
                for item in loaded
            )
            if rebuild or not loaded or not has_catalogue_questions or stale_schema:
                existing_ids = {q["question_id"] for q in loaded}
                for item in parse_knowledge_questions(self.retriever):
                    item = _normalize_question_display(item, self.retriever, len(loaded))
                    if not _has_observable_case(item.get("display_stem")):
                        # A malformed/definition-only catalogue block should
                        # never reach the random pool as a question-only card.
                        # Rebuild it around a deterministic observable event;
                        # the original theory evidence stays in ``analysis``.
                        theory = str(item.get("theory_name") or "").strip()
                        case = _fallback_synthetic_case(theory, "", len(loaded))
                        request = _question_request(case, theory, len(loaded))
                        item["display_stem"] = _compose_display_stem(case, request, theory, include_context=True)
                        item["stem"] = item["display_stem"]
                        item["question"] = request
                        item["question_id"] = _question_id(theory, item["display_stem"], item.get("options", []))
                        item["id"] = item["question_id"]
                    if not _has_observable_case(item.get("display_stem")):
                        continue
                    # Parsed catalogue entries are authoritative: replace an
                    # older cached copy so improved section parsing is picked
                    # up after an application update.
                    replaced = False
                    for index, current in enumerate(loaded):
                        if current.get("question_id") == item["question_id"]:
                            loaded[index] = item
                            replaced = True
                            break
                    if not replaced and item["question_id"] not in existing_ids:
                        loaded.append(item)
                        existing_ids.add(item["question_id"])
            # Older cache versions included option labels in the question
            # hash. Collapse those stale duplicates by semantic content,
            # preferring freshly parsed catalogue data and newer schema data.
            deduped: dict[str, dict[str, Any]] = {}
            for item in loaded:
                signature = _question_signature(item)
                current = deduped.get(signature)
                if current is None:
                    deduped[signature] = item
                    continue
                current_rank = (
                    int(current.get("origin") == "knowledge_base"),
                    _schema_version(current.get("schema_version")),
                )
                item_rank = (
                    int(item.get("origin") == "knowledge_base"),
                    _schema_version(item.get("schema_version")),
                )
                if item_rank >= current_rank:
                    deduped[signature] = item
            loaded = list(deduped.values())
            # Collapse semantic duplicates from legacy caches as well.  This
            # runs after catalogue/model records are merged so the preferred
            # source wins when two records describe the same classroom fact.
            loaded = _deduplicate_questions(loaded)
            _diversify_duplicate_options(loaded, self._theory_names_from_chunks())
            # Mark all retained records as migrated after the refresh.  This
            # prevents a legacy local-fallback record from forcing an index
            # reparse on every subsequent restart.
            for item in loaded:
                item["schema_version"] = QUESTION_SCHEMA_VERSION
            self.questions = loaded[-MAX_POOL_SIZE:]
            self.history_items = _read_json(self.history_path, [])
            if not isinstance(self.history_items, list):
                self.history_items = []
            if not self.questions and loaded:
                self.questions = loaded
            self._persist_questions()

    def _persist_questions(self) -> None:
        try:
            _write_json(self.questions_path, self.questions[-MAX_POOL_SIZE:])
        except OSError:
            # Read-only deployments can still serve parsed in-memory questions.
            pass

    def _persist_history(self) -> None:
        try:
            _write_json(self.history_path, self.history_items[-MAX_HISTORY_SIZE:])
        except OSError:
            pass

    def _known_theory(self, value: str | None) -> str | None:
        text = _clean_text(value, 200)
        if not text:
            return None
        names = self._theory_names()
        if text in names:
            return text
        for alias, candidates in TRAINING_THEORY_ALIASES.items():
            if alias in text or text in alias:
                available = [candidate for candidate in candidates if candidate in names]
                if available:
                    return available[0]
        # Accept names with a common suffix such as “理论” or UI aliases, but
        # never silently choose one item from an ambiguous short query.
        try:
            from rag.run_rag import matching_theory_scope

            matched = matching_theory_scope(text, self.retriever)
            if len(matched) == 1:
                return next(iter(matched))
            if len(matched) > 1:
                normalized_text = re.sub(r"[\s·（）()\-—_]", "", text).casefold()
                close = [
                    name
                    for name in matched
                    if normalized_text
                    and normalized_text in re.sub(r"[\s·（）()\-—_]", "", name).casefold()
                    and len(name) - len(text) <= 4
                ]
                if len(close) == 1:
                    return close[0]
        except Exception:
            pass
        exact = [name for name in names if text in name or name in text]
        if len(exact) == 1:
            return exact[0]
        if len(exact) > 1:
            normalized_text = re.sub(r"[\s·（）()\-—_]", "", text).casefold()
            close = [
                name
                for name in exact
                if normalized_text
                and normalized_text in re.sub(r"[\s·（）()\-—_]", "", name).casefold()
                and len(name) - len(text) <= 4
            ]
            if len(close) == 1:
                return close[0]
        # A BM25 metadata search can recover punctuation/spacing variants.
        lower = text.casefold()
        folded = [name for name in names if name.casefold() == lower]
        return folded[0] if folded else None

    def _theory_names(self) -> set[str]:
        names = getattr(self.retriever, "theory_names", None)
        if names:
            return {str(name).strip() for name in names if str(name).strip()}
        return {
            str(item.get("theory_name") or "").strip()
            for item in getattr(self.retriever, "chunks", []) or []
            if str(item.get("theory_name") or "").strip()
        }

    def _theory_names_from_chunks(self) -> set[str]:
        return {
            str(item.get("theory_name") or "").strip()
            for item in getattr(self.retriever, "chunks", []) or []
            if str(item.get("theory_name") or "").strip()
        }

    def _pool_for(self, theory_name: str | None = None) -> list[dict[str, Any]]:
        if theory_name:
            return [item for item in self.questions if item.get("theory_name") == theory_name]
        return list(self.questions)

    def _append_questions(self, additions: Iterable[dict[str, Any]]) -> int:
        existing = {item.get("question_id") for item in self.questions}
        added = 0
        for ordinal, item in enumerate(additions):
            item = _normalize_question_display(item, self.retriever, len(self.questions) + ordinal)
            qid = item.get("question_id")
            if not qid or qid in existing:
                continue
            self.questions.append(item)
            existing.add(qid)
            added += 1
        if len(self.questions) > MAX_POOL_SIZE:
            self.questions = self.questions[-MAX_POOL_SIZE:]
        _diversify_duplicate_options(self.questions, self._theory_names())
        if added:
            self._persist_questions()
        return added

    def _generate_additions(self, theory_name: str, reserve: int, ordinal_seed: int = 0) -> list[dict[str, Any]]:
        """Generate a reserve and fill any model shortfall with evidence variants."""

        additions = generate_questions_with_llm(
            self.client, self.retriever, theory_name, reserve
        )
        addition_ids = {item.get("question_id") for item in additions}
        if len(additions) < reserve:
            for ordinal in range(reserve * 3):
                fallback = _fallback_generated_question(
                    self.retriever, theory_name, ordinal_seed + ordinal
                )
                if not fallback or fallback.get("question_id") in addition_ids:
                    continue
                additions.append(fallback)
                addition_ids.add(fallback.get("question_id"))
                if len(additions) >= reserve:
                    break
        return additions

    def _ensure_specialized(self, theory_name: str, count: int, refresh: bool) -> tuple[list[dict[str, Any]], int, int]:
        with self._lock:
            pool = self._pool_for(theory_name)
            cached_before = len(pool)
        generated = 0
        fresh: list[dict[str, Any]] = []
        if refresh or len(pool) < count:
            # Recheck after acquiring the generation lock: another request may
            # have filled this theory while we were waiting.
            with self._generation_lock:
                with self._lock:
                    pool = self._pool_for(theory_name)
                    current_ids = {item.get("question_id") for item in pool}
                    if not refresh and len(pool) >= count:
                        should_generate = False
                        reserve = 0
                        ordinal_seed = 0
                    else:
                        should_generate = True
                        needed = count if refresh else max(0, count - len(pool))
                        reserve = max(needed, min(12, count + 4))
                        ordinal_seed = len(self.questions)
                if should_generate:
                    # Model and retrieval work happens outside self._lock.
                    additions = self._generate_additions(
                        theory_name, reserve, ordinal_seed=ordinal_seed
                    )
                    with self._lock:
                        additions = _deduplicate_questions(additions)
                        generated = self._append_questions(additions)
                        pool = self._pool_for(theory_name)
                        fresh = [
                            item for item in pool
                            if item.get("question_id") not in current_ids
                        ]
        with self._lock:
            pool = self._pool_for(theory_name)
            # A refresh should prefer genuinely new questions. If the relay
            # returned duplicates, fill the remainder from the existing pool.
            selected = _preferred_question_pool(
                list(fresh) if refresh and fresh else list(pool),
                count,
            )
            if refresh and len(selected) < count:
                fresh_ids = {item.get("question_id") for item in selected}
                selected.extend(
                    item for item in pool if item.get("question_id") not in fresh_ids
                )
            selected = _preferred_question_pool(selected, count)
            random.shuffle(selected)
            return selected[:count], generated, cached_before

    def _ensure_random(self, count: int, refresh: bool) -> tuple[list[dict[str, Any]], int, int]:
        """Select a cross-theory batch, topping up outside the catalogue lock."""

        with self._lock:
            pool = self._pool_for()
            cached_before = len(pool)
        generated = 0
        fresh: list[dict[str, Any]] = []
        if refresh or len(pool) < count:
            with self._generation_lock:
                with self._lock:
                    pool = self._pool_for()
                    current_ids = {item.get("question_id") for item in pool}
                    should_generate = refresh or len(pool) < count
                    names = list(self._theory_names()) if should_generate else []
                    random.shuffle(names)
                # A random round only needs a small reserve when the existing
                # catalogue cannot satisfy it.  Model work is outside _lock.
                for name in names[: min(8, len(names))]:
                    with self._lock:
                        pool = self._pool_for()
                        if not refresh and len(pool) >= count:
                            break
                        ordinal_seed = len(self.questions)
                    requested = max(2, count // 2)
                    additions = self._generate_additions(
                        name, requested, ordinal_seed=ordinal_seed
                    )
                    with self._lock:
                        generated += self._append_questions(additions)
                        pool = self._pool_for()
                        fresh = [
                            item for item in pool
                            if item.get("question_id") not in current_ids
                        ]
                        if refresh and len(fresh) >= count:
                            break
        with self._lock:
            pool = self._pool_for()
            selected = _preferred_question_pool(
                list(fresh) if refresh and fresh else list(pool),
                count,
            )
            if refresh and len(selected) < count:
                fresh_ids = {item.get("question_id") for item in selected}
                selected.extend(
                    item for item in pool if item.get("question_id") not in fresh_ids
                )
            selected = _preferred_question_pool(selected, count)
            random.shuffle(selected)
            return selected[:count], generated, cached_before

    def _ensure_requested_count(
        self,
        selected: list[dict[str, Any]],
        count: int,
        *,
        canonical: str | None,
        mode: str,
    ) -> tuple[list[dict[str, Any]], int]:
        """Top up a short model/cache batch and return exactly ``count`` items."""

        selected = _preferred_question_pool(selected, count)
        if len(selected) >= count:
            return selected[:count], 0

        with self._generation_lock:
            with self._lock:
                source_pool = self._pool_for(canonical if mode == "specialized" else None)
                source_pool = _preferred_question_pool(source_pool, max(count, len(source_pool)))
                ordinal_seed = len(self.questions) + len(selected) + 1
            if not source_pool and canonical:
                seed = _fallback_generated_question(self.retriever, canonical, ordinal_seed)
                if seed:
                    source_pool = [seed]
            if not source_pool:
                return selected, 0

            signatures = {_question_semantic_signature(item) for item in selected}
            additions: list[dict[str, Any]] = []
            attempts = max(80, count * 12)
            for offset in range(attempts):
                base = source_pool[offset % len(source_pool)]
                theory_name = str(base.get("theory_name") or canonical or "").strip()
                if not theory_name:
                    continue
                candidate = _local_question_variant(base, theory_name, ordinal_seed + offset)
                signature = _question_semantic_signature(candidate)
                if not signature or signature in signatures:
                    continue
                signatures.add(signature)
                additions.append(candidate)
                if len(selected) + len(additions) >= count:
                    break

            if additions:
                with self._lock:
                    added = self._append_questions(additions)
                    pool = self._pool_for(canonical if mode == "specialized" else None)
                    completed = _preferred_question_pool(pool, count)
            else:
                added = 0
                completed = selected

        if len(completed) < count:
            # This should only be reachable for a damaged/empty catalogue.
            # Returning a shorter round silently is worse than a clear error,
            # because the UI promises the learner the selected question count.
            raise RuntimeError(f"训练题生成不足：请求 {count} 道，当前仅有 {len(completed)} 道")
        random.shuffle(completed)
        return completed[:count], added

    def get_questions(
        self,
        *,
        mode: Any = "specialized",
        theory_name: str | None = None,
        count: int = 5,
        refresh: bool = False,
        session_id: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        if mode and not _mode_is_known(mode):
            raise ValueError("mode 必须是 specialized 或 random")
        normalized_mode = normalize_mode(mode)
        count = max(1, min(MAX_QUESTIONS_PER_REQUEST, int(count or 5)))
        canonical = self._known_theory(theory_name) if theory_name else None
        if normalized_mode == "specialized":
            if theory_name and not canonical:
                raise ValueError(f"知识库中未找到理论：{_clean_text(theory_name, 200)}")
            if not canonical:
                # Default to the first theory in the catalogue only when no
                # theory was supplied; the API reports that choice.
                names = self._theory_names()
                canonical = sorted(names)[0] if names else None
            if not canonical:
                raise ValueError("未找到可训练的理论")
            selected, generated, cached_before = self._ensure_specialized(
                canonical, count, refresh
            )
        else:
            selected, generated, cached_before = self._ensure_random(count, refresh)
            canonical = None
        selected, locally_generated = self._ensure_requested_count(
            selected,
            count,
            canonical=canonical,
            mode=normalized_mode,
        )
        generated += locally_generated
        if not selected:
            raise ValueError("当前理论暂无可用情境题，请稍后重试")
        enriched: list[dict[str, Any]] = []
        for ordinal, item in enumerate(selected):
            item = _normalize_question_display(item, self.retriever, ordinal)
            normalized_choices = _normalize_four_options(
                item.get("options") if isinstance(item.get("options"), list) else [],
                int(item.get("answer", 0) or 0),
                theory_name=str(item.get("theory_name") or canonical or ""),
                seed_text=str(item.get("display_stem") or item.get("stem") or ordinal),
            )
            if normalized_choices is None:
                continue
            item["options"], item["answer"] = normalized_choices
            _assign_question_id(
                item,
                str(item.get("theory_name") or canonical or ""),
                str(item.get("stem") or item.get("display_stem") or ""),
                item["options"],
            )
            item_theory = str(item.get("theory_name") or canonical or "").strip()
            if item_theory not in self._knowledge_excerpt_cache:
                self._knowledge_excerpt_cache[item_theory] = _theory_knowledge_excerpt(
                    self.retriever,
                    item_theory,
                )
            enriched.append(
                {
                    **item,
                    "knowledge_excerpt": self._knowledge_excerpt_cache[item_theory],
                }
            )
        selected = enriched
        if len(selected) != count:
            raise RuntimeError(f"训练题数量校验失败：请求 {count} 道，实际 {len(selected)} 道")
        sid = _clean_text(session_id, 128) or secrets.token_urlsafe(16)
        with self._lock:
            self.sessions[sid] = {
                "question_ids": [item["question_id"] for item in selected],
                "mode": normalized_mode,
                "theory_name": canonical,
                "user_id": _clean_text(user_id, 160),
                "created_at": _now_iso(),
            }
        return {
            "session_id": sid,
            "mode": normalized_mode,
            "theory_name": canonical,
            "questions": selected,
            "generated_count": generated,
            "cached_count": cached_before,
            "model": MODEL,
        }

    def answer(
        self,
        *,
        session_id: str,
        question_id: str,
        selected_answer: Any,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        with self._lock:
            normalized_session_id = _clean_text(session_id, 128)
            if not normalized_session_id:
                raise ValueError("session_id 不能为空")
            question = next(
                (item for item in self.questions if item.get("question_id") == question_id),
                None,
            )
            if question is None:
                raise KeyError("题目不存在或已过期")
            session = self.sessions.get(normalized_session_id)
            # Sessions are intentionally process-local.  Do not accept a
            # guessed/expired id and let it write arbitrary history records.
            if session is None:
                raise KeyError("训练会话不存在或已过期，请重新开始训练")
            if question_id not in set(session.get("question_ids", [])):
                raise ValueError("题目不属于当前训练会话")
            session_user = _clean_text(session.get("user_id"), 160)
            answer_user = _clean_text(user_id, 160)
            if session_user and answer_user != session_user:
                raise ValueError("当前设备与训练会话不匹配")
            if not session_user and answer_user:
                # Bind an anonymous session on its first authenticated answer.
                session["user_id"] = answer_user
            try:
                if isinstance(selected_answer, str) and _canonical_letter(selected_answer) in _ANSWER_LETTERS:
                    selected = _ANSWER_LETTERS.index(_canonical_letter(selected_answer))
                else:
                    selected = int(selected_answer)
            except (TypeError, ValueError):
                raise ValueError("selected_answer 必须是选项索引或 A-D") from None
            if not 0 <= selected < len(question.get("options", [])):
                # Be liberal with one-based indices from older frontend code.
                if 1 <= selected <= len(question.get("options", [])):
                    selected -= 1
                else:
                    raise ValueError("selected_answer 超出选项范围")
            correct_answer = int(question.get("answer", 0))
            correct = selected == correct_answer
            existing = next(
                (
                    item
                    for item in reversed(self.history_items)
                    if item.get("session_id") == normalized_session_id
                    and item.get("question_id") == question_id
                ),
                None,
            )
            if existing:
                return {
                    "attempt_id": existing.get("attempt_id", ""),
                    "session_id": normalized_session_id,
                    "question_id": question_id,
                    "correct": bool(existing.get("correct")),
                    "selected_answer": existing.get("selected_answer"),
                    "correct_answer": existing.get("correct_answer"),
                    "analysis": question.get("analysis", {}),
                    "theory_name": question.get("theory_name", ""),
                    "options": question.get("options", []),
                    "sources": question.get("sources", []),
                    "idempotent": True,
                }
            record = {
                "attempt_id": "attempt-" + secrets.token_urlsafe(12),
                "session_id": normalized_session_id,
                "question_id": question_id,
                "mode": session.get("mode", "specialized"),
                # For random rounds the session scope is intentionally
                # theory-agnostic; retain the item's theory separately for
                # detailed review without mislabelling the training range.
                "theory_name": "" if session.get("mode") == "random" else session.get("theory_name") or question.get("theory_name", ""),
                "question_theory_name": question.get("theory_name", ""),
                "selected_answer": selected,
                "correct_answer": correct_answer,
                "correct": correct,
                "score": int(correct),
                "total": 1,
                "accuracy": "100%" if correct else "0%",
                "answered_at": _now_iso(),
                "question_stem": question.get("stem", ""),
                "display_stem": question.get("display_stem", question.get("stem", "")),
                "question": question.get("question", ""),
                "options": list(question.get("options", [])),
                "answer": correct_answer,
                "analysis": question.get("analysis", {}),
                "sources": question.get("sources", []),
                "user_id": _clean_text(user_id, 160) or session.get("user_id", ""),
            }
            self.history_items.append(record)
            self.history_items = self.history_items[-MAX_HISTORY_SIZE:]
            self._persist_history()
            return {
                "attempt_id": record["attempt_id"],
                "session_id": record["session_id"],
                "question_id": question_id,
                "correct": correct,
                "selected_answer": selected,
                "correct_answer": correct_answer,
                "correctAnswer": correct_answer,
                "answer": correct_answer,
                "analysis": question.get("analysis", {}),
                "theory_name": question.get("theory_name", ""),
                "options": question.get("options", []),
                "sources": question.get("sources", []),
            }

    def history(
        self,
        *,
        limit: int = 50,
        mode: Any = None,
        theory_name: str | None = None,
        user_id: str | None = None,
    ) -> list[dict[str, Any]]:
        with self._lock:
            if mode and not _mode_is_known(mode):
                return []
            normalized_mode = normalize_mode(mode) if mode else None
            canonical = self._known_theory(theory_name) if theory_name else None
            if theory_name and not canonical:
                return []
            values = list(reversed(self.history_items))
            result: list[dict[str, Any]] = []
            for item in values:
                if normalized_mode and item.get("mode") != normalized_mode:
                    continue
                if canonical and item.get("theory_name") != canonical and item.get("question_theory_name") != canonical:
                    continue
                if user_id and item.get("user_id") != _clean_text(user_id, 160):
                    continue
                result.append(item)
                # Internal callers (history_sessions) need the full retained
                # window; the HTTP route still caps user-facing limits at 200.
                if len(result) >= max(1, min(MAX_HISTORY_SIZE, int(limit or 50))):
                    break
            return result

    def history_sessions(
        self,
        *,
        limit: int = 30,
        mode: Any = None,
        theory_name: str | None = None,
        user_id: str | None = None,
    ) -> list[dict[str, Any]]:
        """Aggregate attempts into reviewable and, when possible, resumable sessions."""

        attempts = self.history(
            limit=MAX_HISTORY_SIZE,
            mode=mode,
            theory_name=theory_name,
            user_id=user_id,
        )
        with self._lock:
            question_snapshot = list(self.questions)
            live_sessions = {
                str(session_id): dict(session)
                for session_id, session in self.sessions.items()
            }
        grouped: dict[str, dict[str, Any]] = {}
        order: list[str] = []
        for attempt in attempts:
            sid = _clean_text(attempt.get("session_id"), 128) or str(attempt.get("attempt_id", ""))
            if sid not in grouped:
                grouped[sid] = {
                    "session_id": sid,
                    "mode": attempt.get("mode", "specialized"),
                    "theory_name": attempt.get("theory_name", ""),
                    "score": 0,
                    "total": 0,
                    "accuracy": "0%",
                    "finished_at": attempt.get("answered_at") or _now_iso(),
                    "attempts": [],
                    "questions": [],
                }
                order.append(sid)
            session = grouped[sid]
            session["score"] += int(bool(attempt.get("correct")))
            session["total"] += 1
            session["finished_at"] = max(
                str(session.get("finished_at") or ""),
                str(attempt.get("answered_at") or ""),
            )
            session["attempts"].append(attempt.get("attempt_id", ""))

        normalized_user = _clean_text(user_id, 160)
        question_lookup: dict[str, dict[str, Any]] = {}
        for question in question_snapshot:
            identifiers = [question.get("question_id"), question.get("id")]
            legacy = question.get("legacy_question_ids")
            if isinstance(legacy, (list, tuple)):
                identifiers.extend(legacy)
            for identifier in identifiers:
                identifier = _clean_text(identifier, 200)
                if identifier:
                    question_lookup[identifier] = question

        # A generated round can be resumed only while its server-side session is
        # still alive in this process. Include unanswered live rounds as well as
        # answered history so a refreshed browser can offer a real Continue action.
        for sid, live in live_sessions.items():
            live_user = _clean_text(live.get("user_id"), 160)
            if normalized_user and live_user != normalized_user:
                continue
            if mode and normalize_mode(live.get("mode")) != normalize_mode(mode):
                continue
            live_theory = _clean_text(live.get("theory_name"), 200)
            if theory_name and self._known_theory(theory_name) != live_theory:
                continue
            if sid not in grouped:
                grouped[sid] = {
                    "session_id": sid,
                    "mode": live.get("mode", "specialized"),
                    "theory_name": live_theory,
                    "score": 0,
                    "total": 0,
                    "accuracy": "0%",
                    "finished_at": live.get("created_at") or _now_iso(),
                    "attempts": [],
                    "questions": [],
                }
                order.append(sid)

        attempts_by_session: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
        for attempt in attempts:
            sid = _clean_text(attempt.get("session_id"), 128) or str(attempt.get("attempt_id", ""))
            qid = _clean_text(attempt.get("question_id"), 200)
            if qid:
                attempts_by_session[sid][qid] = attempt

        def review_question(
            question: dict[str, Any] | None,
            attempt: dict[str, Any] | None,
            question_id: str,
        ) -> dict[str, Any]:
            source = question or {}
            options = source.get("options") if isinstance(source.get("options"), list) else []
            if not options and attempt and isinstance(attempt.get("options"), list):
                options = attempt.get("options", [])
            # Do not disclose the answer key or explanation for an unanswered
            # live question. The normal answer endpoint supplies both after the
            # learner submits a choice.
            correct_answer = attempt.get("correct_answer") if attempt else None
            selected_answer = attempt.get("selected_answer") if attempt else None
            reconstructed_options = False
            if attempt and not options:
                try:
                    historical_answer = int(correct_answer)
                except (TypeError, ValueError):
                    historical_answer = 0
                historical_answer = max(0, min(3, historical_answer))
                historical_theory = _clean_text(
                    source.get("theory_name")
                    or attempt.get("question_theory_name")
                    or attempt.get("theory_name")
                    or "相关教育理论",
                    200,
                )
                correct_option = _CORRECT_OPTION_VARIANTS[0].format(theory=historical_theory)
                options = list(_OPTION_PADDING_VARIANTS[:3])
                options.insert(historical_answer, correct_option)
                reconstructed_options = True
            try:
                option_answer_index = int(correct_answer) if attempt and correct_answer is not None else 0
            except (TypeError, ValueError):
                letter = _canonical_letter(correct_answer)
                option_answer_index = _ANSWER_LETTERS.index(letter) if letter in _ANSWER_LETTERS else 0
            normalized_options = _normalize_four_options(
                options,
                option_answer_index,
                theory_name=str(source.get("theory_name") or (attempt or {}).get("question_theory_name") or ""),
                seed_text=str(source.get("stem") or (attempt or {}).get("question_stem") or question_id),
            )
            if normalized_options is not None:
                options, normalized_answer = normalized_options
                if attempt:
                    correct_answer = normalized_answer
            return {
                "question_id": _clean_text(source.get("question_id"), 200) or question_id,
                "id": _clean_text(source.get("question_id"), 200) or question_id,
                "theory_name": source.get("theory_name") or (attempt or {}).get("question_theory_name", ""),
                "stem": source.get("stem") or (attempt or {}).get("question_stem", ""),
                "display_stem": source.get("display_stem") or (attempt or {}).get("display_stem") or (attempt or {}).get("question_stem", ""),
                "question": source.get("question") or (attempt or {}).get("question", ""),
                "options": list(options),
                "answer": correct_answer,
                "correct_answer": correct_answer,
                "selected_answer": selected_answer,
                "answered": attempt is not None,
                "correct": bool(attempt.get("correct")) if attempt else None,
                "answered_at": attempt.get("answered_at", "") if attempt else "",
                "attempt_id": attempt.get("attempt_id", "") if attempt else "",
                "options_reconstructed": reconstructed_options,
                "analysis": (source.get("analysis") or attempt.get("analysis", {})) if attempt else {},
                "sources": (source.get("sources") or attempt.get("sources", [])) if attempt else [],
            }

        result: list[dict[str, Any]] = []
        for sid in order[: max(1, min(200, int(limit or 30)))]:
            session = grouped[sid]
            total = int(session["total"] or 0)
            session["accuracy"] = f"{round((int(session['score']) / total) * 100) if total else 0}%"
            live = live_sessions.get(sid)
            attempt_map = attempts_by_session.get(sid, {})
            question_ids = list(live.get("question_ids", [])) if live else list(attempt_map)
            questions: list[dict[str, Any]] = []
            for question_id in question_ids:
                question_id = _clean_text(question_id, 200)
                question = question_lookup.get(question_id)
                attempt = attempt_map.get(question_id)
                if attempt is None and question:
                    aliases = [question.get("question_id"), *(question.get("legacy_question_ids") or [])]
                    attempt = next((attempt_map.get(str(alias)) for alias in aliases if attempt_map.get(str(alias))), None)
                questions.append(review_question(question, attempt, question_id))
            # Very old attempts may refer to a question no longer in the live
            # session. Preserve them as review records instead of dropping them.
            represented = {
                value
                for question in questions
                for value in (question.get("question_id"), question.get("attempt_id"))
                if value
            }
            for question_id, attempt in attempt_map.items():
                if question_id in represented or attempt.get("attempt_id") in represented:
                    continue
                questions.append(review_question(question_lookup.get(question_id), attempt, question_id))
            answered_ids = {question_id for question_id in attempt_map}
            next_index = next(
                (index for index, question in enumerate(questions) if not question.get("answered")),
                None,
            )
            session["questions"] = questions
            session["answered_count"] = len(answered_ids)
            session["question_count"] = len(questions)
            session["next_question_index"] = next_index
            session["next_question_id"] = questions[next_index]["question_id"] if next_index is not None else None
            session["resumable"] = bool(live is not None and next_index is not None)
            session["status"] = "in_progress" if session["resumable"] else "completed"
            result.append(session)
        return result


__all__ = [
    "HISTORY_PATH",
    "QUESTIONS_PATH",
    "QUESTION_SCHEMA_VERSION",
    "TRAINING_THEORY_ALIASES",
    "TheoryTrainingStore",
    "generate_questions_with_llm",
    "normalize_mode",
    "parse_knowledge_questions",
]
