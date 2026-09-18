"""Conservative subject scoping for theory retrieval.

Only explicitly subject-specific theories are filtered. General education,
psychology, classroom-management, and assessment theories remain available
to every subject.
"""

from __future__ import annotations

import re
from typing import Any, Literal


SubjectScope = Literal["chinese", "math", ""]


def infer_subject_scope(subject: str = "", context: str = "") -> SubjectScope:
    """Infer Chinese or mathematics only when the available signal is clear."""

    explicit = re.sub(r"\s+", "", str(subject or ""))
    if re.search(r"(?:小学|初中|高中)?语文|语文学科", explicit):
        return "chinese"
    if re.search(r"(?:小学|初中|高中)?数学|数学学科", explicit):
        return "math"

    value = re.sub(r"\s+", "", str(context or ""))
    if re.search(r"小学语文|语文课|语文学科", value):
        return "chinese"
    if re.search(r"小学数学|数学课|数学学科", value):
        return "math"

    chinese_cues = (
        "文言文", "课文", "朗读", "生字", "字词", "词义", "文本证据",
        "段落", "人物品质", "阅读理解", "作文", "仿写",
    )
    math_cues = (
        "算式", "运算", "加法", "减法", "乘法", "除法", "分数", "小数",
        "几何", "面积", "周长", "平均数", "倒数", "数位", "方程", "比例",
        "凑十", "口算",
    )
    chinese_score = sum(cue in value for cue in chinese_cues)
    math_score = sum(cue in value for cue in math_cues)
    if chinese_score >= 2 and chinese_score > math_score:
        return "chinese"
    if math_score >= 2 and math_score > chinese_score:
        return "math"
    return ""


def theory_subject_scope(chunk: dict[str, Any]) -> SubjectScope:
    """Classify only theories whose name or terminal directory is explicit."""

    name = re.sub(r"\s+", "", str(chunk.get("theory_name") or ""))
    path = [re.sub(r"\s+", "", str(item)) for item in chunk.get("category_path", [])]
    leaf = path[-1] if path else ""

    # Some imported paths retain an obsolete mathematics parent above the
    # Chinese directory. The terminal directory is therefore authoritative.
    if "语文学科" in leaf:
        return "chinese"
    if "数学" in leaf and "语文" not in leaf:
        return "math"

    if "数学" in name or name.upper().startswith(("APOS", "HPM", "RME")):
        return "math"
    if any(marker in name for marker in ("语文", "文言文")):
        return "chinese"
    if name.startswith("范希尔"):
        return "math"
    return ""


def theory_is_compatible(chunk: dict[str, Any], subject_scope: SubjectScope) -> bool:
    """Reject only a theory explicitly dedicated to the opposite subject."""

    if subject_scope not in {"chinese", "math"}:
        return True
    theory_scope = theory_subject_scope(chunk)
    return not theory_scope or theory_scope == subject_scope


def subject_scope_label(subject_scope: SubjectScope) -> str:
    return {"chinese": "小学语文", "math": "小学数学"}.get(subject_scope, "")
