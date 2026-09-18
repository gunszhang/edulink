"""Retrieve evidence from the education catalogue and answer with the LLM."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import os
from pathlib import Path
import re
import sys
import time
from typing import Any, Iterator

# On Windows, Conda may export an outdated SSL_CERT_FILE.  Use the Windows
# certificate store so the model relay's TLS certificate is verified correctly.
try:
    import truststore

    truststore.inject_into_ssl()
except Exception:  # pragma: no cover - optional platform integration
    truststore = None

from openai import APIConnectionError, APIStatusError, AuthenticationError, OpenAI

try:
    from .bm25 import BM25Retriever, SearchHit
    from .build_chunks import build_chunks
except ImportError:  # Direct invocation: python rag/run_rag.py
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from rag.bm25 import BM25Retriever, SearchHit
    from rag.build_chunks import build_chunks


ROOT = Path(__file__).resolve().parents[1]
CHUNK_PATH = Path(__file__).resolve().parent / "data" / "knowledge_chunks.jsonl"

# Runtime configuration is environment-only in the public delivery.
sys.path.insert(0, str(ROOT))
from model_config import API_BASE_URL, API_KEY, MODEL, REASONING_EFFORT  # noqa: E402


GROUNDING_INSTRUCTIONS = """
你是教育智能体，必须基于提供的知识片段回答问题。

规则：
1. 只能把知识片段作为事实依据，不要臆造知识库中没有的理论、人物或结论。
2. 回答要直接解决用户问题，必要时分点说明。
3. 使用知识片段时，在相关句子末尾标注 [1]、[2] 等来源编号。
4. 如果片段不足以支持结论，要明确说“知识库中缺少足够依据”，并指出需要补充什么。
5. 课堂建议必须区分知识库已有做法和你的推断；推断要明确标注为“建议”。
6. 对话历史只用于理解上下文，不可替代知识片段成为事实来源。
""".strip()

DIRECT_INSTRUCTIONS = """
你是教育智能体，请结合对话历史自然、简洁地回答当前问题。

当前没有提供知识库片段：
1. 不得声称回答来自知识库，也不要生成虚假的来源编号。
2. 问候、致谢等日常对话直接简短回应。
3. 非教育领域问题可以简洁回答；涉及实时信息时说明无法核验实时状态。
4. 如果问题要求权威教育理论依据，应明确说明本次未检索到足够相关的知识片段。
""".strip()

DEFAULT_MIN_RELEVANCE_SCORE = 30.0
MAX_HISTORY_MESSAGES = 8
MAX_HISTORY_CHARS = 6000

QUICK_ACTION_SPECS: dict[str, dict[str, Any]] = {
    "core_viewpoints": {
        "query_terms": "核心观点 定义 内涵 关键判断标准 理论说明 适用边界",
        "source_priority": ("理论完成解释", "教理范式汇典", "课堂范本"),
        "contract": (
            "当前任务是解释所选理论的核心观点。先用一句话给出理论定位，再列出4至6条核心观点。"
            "每条必须包含“观点—具体含义—课堂中的判断标志”，并用知识库来源编号标注依据；最后补充适用边界。"
            "不得只写抽象口号，也不得用其他理论的观点替代当前理论。"
        ),
    },
    "classroom_implementation": {
        "query_terms": "课堂落实 教师行为 学生行为 学习证据 教理范式 反馈 调整",
        "source_priority": ("教理范式汇典", "课堂范本", "理论完成解释"),
        "contract": (
            "当前任务是说明所选理论如何在课堂落实。先写清落实前提，再给出4至6个连续步骤。"
            "每一步都要包含教师做什么、学生做什么、形成什么可观察证据、证据不足时如何调整，并标注知识库来源。"
            "最后提供一条可直接使用的教师话术和一项检查理论是否真正落地的标准。"
        ),
    },
    "classroom_case": {
        "query_terms": "课堂范本 具体课例 教学流程 教师行为 学生行为 观察证据 理论解读",
        "source_priority": ("课堂范本", "教理范式汇典", "理论完成解释"),
        "contract": (
            "当前任务是给出一个知识库支持的具体课堂案例。优先采用召回片段中已有的学科、课题和流程；"
            "依次写“案例背景—主要问题—4至6步课堂过程—学生学习证据—理论为何适用—可改进点”，并逐段标注来源。"
            "如果知识库没有具体课题，不得虚构教材名称或数据，应明确说明后给出不绑定课题的课堂情境。"
        ),
    },
    "common_misconceptions": {
        "query_terms": "常见误区 局限性 错误做法 判断标准 适用条件 适用边界 纠偏",
        "source_priority": ("理论完成解释", "教理范式汇典", "课堂范本"),
        "contract": (
            "当前任务是辨析使用所选理论时的常见误区。列出4至6项，每项按“错误表现—为什么不符合理论—"
            "纠偏做法—可观察检查点”展开并标注来源；最后说明该理论不能替代什么、需要与哪些课堂条件结合。"
            "不得只写‘形式化、表面化’等空泛标签。"
        ),
    },
}

# The frontend uses teacher-friendly labels while the knowledge catalogue
# sometimes stores the same construct under a method or implementation name.
THEORY_CONTEXT_ALIASES: dict[str, tuple[str, ...]] = {
    "苏格拉底式问答法": ("谈话法",),
    "等待时间理论": ("课堂提问理论",),
    "形成性评价理论": ("形成性课堂实施理论", "课堂形成性评价实施理论"),
    "学习迁移理论": ("认知结构迁移理论",),
    "人本主义学习理论": ("人本主义教学理论",),
    "布鲁纳发现学习理论": ("发现学习教学理论",),
    "教学对话理论（IRF）": ("教学对话理论",),
    "社会互动学习理论": ("社会互动教学理论",),
}

EDUCATION_TERMS = (
    "教育", "教学", "教师", "老师", "学生", "课堂", "课程", "学校", "班级",
    "教案", "课例", "教研", "评课", "说课", "教学反思", "教育评价", "考试", "作业",
    "育人", "师生", "同伴学习", "合作学习", "小组学习", "小组积分", "家校", "家长",
    "儿童发展", "学习困难", "学习动机", "学习评价", "学习理论", "认知发展", "认知冲突",
    "核心素养", "学科素养", "德育", "班主任", "备课", "授课", "教材", "校本",
    "课程标准", "课标", "课堂管理", "课堂提问", "课堂参与", "教学设计", "教学策略",
    "心理学", "教育心理", "学习心理", "发展心理", "认知心理", "教育思想", "教育哲学",
    "教育社会学", "教育技术", "课程论", "教学论", "班杜拉", "皮亚杰", "维果茨基",
    "布鲁纳", "杜威", "赫尔巴特", "马斯洛", "奥苏贝尔", "加涅", "斯金纳",
    "科尔伯格", "弗洛伊德", "埃里克森",
)
FOLLOW_UP_TERMS = (
    "它", "这个理论", "该理论", "上述", "刚才", "前面", "这段", "这种", "那它", "为什么",
    "如何应用", "如何落实", "怎么应用", "怎么落实", "核心观点", "主要观点", "有什么局限",
    "有何局限", "举个例子", "再解释", "继续说", "它们的区别", "二者区别",
    "那应该", "怎样改进", "怎么改进", "改进建议", "还有别的", "还有其他", "别的建议",
    "其他建议", "这个怎么办", "那怎么办", "怎么办", "再说说", "再展开", "再具体",
)
THEORY_INTENT_TERMS = (
    "理论", "观点", "核心", "定义", "内涵", "机制", "课堂", "教学", "教育",
    "教师", "学生", "课程", "学习", "案例", "误区", "落实", "应用", "分析",
    "解释", "改进", "评价", "教案", "反思", "课例", "提问", "反馈",
)
SMALL_TALK_PATTERN = re.compile(
    r"^(你好|您好|嗨|hello|hi|在吗|谢谢|感谢|再见|拜拜|你是谁|你能做什么)[!！。,.，?？\s]*$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class AnswerResult:
    answer: str
    citations: list[dict]
    retrieval_used: bool
    retrieval_reason: str
    top_score: float | None
    top_coverage: float | None
    search_ms: float
    model_ms: float
    total_ms: float


@dataclass(frozen=True)
class PreparedAnswer:
    user_input: str
    instructions: str
    max_output_tokens: int
    citations: list[dict]
    retrieval_used: bool
    retrieval_reason: str
    top_score: float | None
    top_coverage: float | None
    search_ms: float
    started_at: float


def create_client() -> OpenAI:
    timeout_seconds = max(5.0, float(os.getenv("MODEL_API_TIMEOUT_SECONDS", "45")))
    max_retries = max(0, int(os.getenv("MODEL_API_MAX_RETRIES", "1")))
    return OpenAI(
        api_key=API_KEY,
        base_url=API_BASE_URL,
        timeout=timeout_seconds,
        max_retries=max_retries,
    )


def normalize_history(history: list[dict[str, Any]] | None) -> list[dict[str, str]]:
    normalized_reversed: list[dict[str, str]] = []
    total_chars = 0
    for item in reversed((history or [])[-MAX_HISTORY_MESSAGES:]):
        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        remaining = MAX_HISTORY_CHARS - total_chars
        if remaining <= 0:
            break
        content = content[:remaining]
        normalized_reversed.append({"role": role, "content": content})
        total_chars += len(content)
    return list(reversed(normalized_reversed))


def format_history(history: list[dict[str, str]]) -> str:
    if not history:
        return ""
    labels = {"user": "用户", "assistant": "助手"}
    lines = [f"{labels[item['role']]}：{item['content']}" for item in history]
    return "<conversation_history>\n" + "\n".join(lines) + "\n</conversation_history>\n\n"


def is_small_talk(question: str) -> bool:
    return bool(SMALL_TALK_PATTERN.fullmatch(question.strip()))


def has_domain_signal(query: str, retriever: BM25Retriever) -> bool:
    normalized = query.strip().lower()
    if any(term in normalized for term in EDUCATION_TERMS):
        return True
    return retriever.has_theory_signal(normalized)


def has_theory_intent(query: str) -> bool:
    """Detect an education/theory request without relying on injected context."""

    normalized = str(query or "").strip().lower()
    return bool(normalized) and any(term in normalized for term in THEORY_INTENT_TERMS)


def history_has_domain_signal(history: list[dict[str, str]], retriever: BM25Retriever) -> bool:
    return any(
        has_domain_signal(item.get("content", ""), retriever)
        or has_theory_intent(item.get("content", ""))
        for item in history
        if isinstance(item, dict) and item.get("content")
    )


def passes_relevance_threshold(
    score: float,
    coverage: float,
    min_score: float,
) -> bool:
    """Conservative gate: high BM25 scores still need query-term coverage."""

    if score < min_score:
        return False
    return (
        (score >= 70.0 and coverage >= 0.25)
        or (score >= 60.0 and coverage >= 0.35)
        or (score >= 45.0 and coverage >= 0.50)
        or coverage >= 0.65
    )


def matching_theory_scope(value: str | None, retriever: BM25Retriever) -> set[str]:
    """Prefer exact catalogue names over broader alias matches."""

    text = str(value or "").strip()
    if not text:
        return set()
    mapped = {
        canonical
        for display_name, canonical_names in THEORY_CONTEXT_ALIASES.items()
        if display_name in text
        for canonical in canonical_names
        if canonical in retriever.theory_names
    }
    if mapped:
        return mapped
    if text in retriever.theory_names:
        return {text}
    exact = {name for name in retriever.theory_names if name and name in text}
    if exact:
        return {
            name for name in exact
            if not any(name != other and name in other for other in exact)
        }
    return retriever.matching_theory_names(text)


def build_retrieval_query(
    question: str,
    history: list[dict[str, str]],
    context_theory: str | None,
    retriever: BM25Retriever,
    response_mode: str | None = None,
) -> str:
    history = history or []
    if is_small_talk(question):
        return question
    spec = QUICK_ACTION_SPECS.get(str(response_mode or ""), {})
    query_terms = str(spec.get("query_terms", "")).strip()
    explicit_theories = matching_theory_scope(question, retriever)
    if explicit_theories:
        return "\n".join(
            part for part in (" ".join(sorted(explicit_theories)), question, query_terms) if part
        )
    history_domain = history_has_domain_signal(history, retriever)
    context_is_relevant = (
        bool(context_theory)
        and (
            bool(response_mode)
            or has_theory_intent(question)
            or (history_domain and any(term in question for term in FOLLOW_UP_TERMS))
        )
    )
    if context_theory and not explicit_theories and context_is_relevant:
        context_names = matching_theory_scope(context_theory, retriever)
        theory_query = " ".join(sorted(context_names)) or context_theory
        parts = [theory_query, question]
        if query_terms:
            parts.append(query_terms)
        return "\n".join(parts)
    if has_domain_signal(question, retriever) or has_theory_intent(question):
        return "\n".join(part for part in (question, query_terms) if part)
    if not any(term in question for term in FOLLOW_UP_TERMS):
        return "\n".join(part for part in (question, query_terms) if part)
    previous_users = [
        item["content"] for item in history if item["role"] == "user"
    ][-2:]
    parts = [part for part in [*previous_users, question, query_terms] if part]
    return "\n".join(parts)


def ensure_chunks(rebuild: bool = False) -> None:
    if rebuild or not CHUNK_PATH.is_file():
        input_path = ROOT / "知识库" / "理论总表.json"
        summary = build_chunks(input_path, CHUNK_PATH)
        print(
            f"Built {summary['chunks']} chunks from {summary['nonempty_records']} records.",
            file=sys.stderr,
        )


def make_context(hits: list[SearchHit], max_chars: int = 12000) -> tuple[str, list[dict]]:
    blocks: list[str] = []
    citations: list[dict] = []
    used = 0
    for number, hit in enumerate(hits, start=1):
        chunk = hit.chunk
        path = " / ".join(chunk.get("category_path", []))
        block = (
            f"[{number}] 理论：{chunk.get('theory_name', '')}\n"
            f"分类：{path}\n"
            f"来源类型：{chunk.get('source_type', '')}\n"
            f"原始标题：{chunk.get('source_title', '')}\n"
            f"内容：{chunk.get('text', '')}"
        )
        if used + len(block) > max_chars:
            break
        blocks.append(block)
        used += len(block) + 2
        citations.append(
            {
                "number": number,
                "chunk_id": chunk.get("chunk_id", ""),
                "theory_name": chunk.get("theory_name", ""),
                "category_path": list(chunk.get("category_path", [])),
                "source_type": chunk.get("source_type", ""),
                "source_title": chunk.get("source_title", ""),
                "score": round(hit.score, 4),
            }
        )
    return "\n\n".join(blocks), citations


def prepare_answer(
    question: str,
    retriever: BM25Retriever,
    top_k: int = 6,
    category: str | None = None,
    source_type: str | None = None,
    history: list[dict[str, Any]] | None = None,
    context_theory: str | None = None,
    response_mode: str | None = None,
    min_relevance_score: float = DEFAULT_MIN_RELEVANCE_SCORE,
) -> PreparedAnswer:
    total_started = time.perf_counter()
    question = question.strip()
    if not question:
        raise ValueError("question cannot be empty")

    top_k = max(1, min(top_k, 20))
    history = normalize_history(history)
    context_theory = (context_theory or "").strip() or None
    response_mode = str(response_mode or "").strip() or None
    if response_mode not in QUICK_ACTION_SPECS:
        response_mode = None
    min_relevance_score = max(0.0, float(min_relevance_score))
    explicit_theories = matching_theory_scope(question, retriever)
    effective_theory = "、".join(sorted(explicit_theories)) or context_theory
    question_domain = has_domain_signal(question, retriever) or has_theory_intent(question)
    history_domain = history_has_domain_signal(history, retriever)
    context_scope = matching_theory_scope(context_theory, retriever)
    follow_up_domain = history_domain and any(term in question for term in FOLLOW_UP_TERMS)
    context_relevant = bool(context_scope) and (
        bool(response_mode)
        or has_theory_intent(question)
        or follow_up_domain
    )
    retrieval_query = build_retrieval_query(
        question,
        history,
        context_theory,
        retriever,
        response_mode,
    )

    hits: list[SearchHit] = []
    citations: list[dict] = []
    top_score: float | None = None
    top_coverage: float | None = None
    search_ms = 0.0
    if is_small_talk(question):
        retrieval_reason = "small_talk"
    elif not (question_domain or follow_up_domain or context_relevant):
        retrieval_reason = "no_domain_signal"
    else:
        search_started = time.perf_counter()
        candidates = retriever.search(
            retrieval_query,
            top_k=min(60, max(top_k * 4, top_k)),
            category=category,
            source_type=source_type,
        )
        if response_mode and effective_theory:
            matching_names = matching_theory_scope(effective_theory, retriever)
            scoped = [
                hit for hit in candidates
                if str(hit.chunk.get("theory_name", "")) in matching_names
            ]
            # A quick action is always about the selected theory.  Falling
            # back to unrestricted candidates would create a fluent answer
            # grounded in the wrong theory when a display alias is missing.
            candidates = scoped
            priorities = {
                value: len(QUICK_ACTION_SPECS[response_mode]["source_priority"]) - index
                for index, value in enumerate(QUICK_ACTION_SPECS[response_mode]["source_priority"])
            }
            candidates.sort(
                key=lambda hit: (
                    priorities.get(str(hit.chunk.get("source_type", "")), 0),
                    float(hit.score),
                ),
                reverse=True,
            )
        search_ms = round((time.perf_counter() - search_started) * 1000, 2)
        best_candidate = max(candidates, key=lambda hit: hit.score) if candidates else None
        top_score = round(best_candidate.score, 4) if best_candidate else None
        top_coverage = (
            round(
                max(
                    retriever.query_coverage(part, best_candidate)
                    for part in retrieval_query.splitlines()
                    if part.strip()
                ),
                4,
            )
            if best_candidate
            else None
        )
        theory_match = retriever.has_theory_signal(retrieval_query)
        if candidates and theory_match and (top_score or 0.0) >= min_relevance_score:
            hits = [hit for hit in candidates if hit.score >= min_relevance_score][:top_k]
            retrieval_reason = "matched_theory"
        elif candidates and passes_relevance_threshold(
            top_score or 0.0,
            top_coverage or 0.0,
            min_relevance_score,
        ):
            hits = [hit for hit in candidates if hit.score >= min_relevance_score][:top_k]
            retrieval_reason = "matched"
        else:
            retrieval_reason = "below_threshold"

    history_context = format_history(history)
    if hits:
        context, citations = make_context(hits)
        # Retrieved text is delimited so source documents remain data rather
        # than being interpreted as instructions to the model.
        user_input = (
            f"{history_context}"
            "<knowledge_context>\n"
            f"{context}\n"
            "</knowledge_context>\n\n"
            f"当前理论：{effective_theory or '未指定'}\n"
            f"用户当前问题：\n{question}"
        )
        quick_contract = str(QUICK_ACTION_SPECS.get(response_mode or "", {}).get("contract", ""))
        instructions = (
            f"{GROUNDING_INSTRUCTIONS}\n\n{quick_contract}"
            if quick_contract
            else GROUNDING_INSTRUCTIONS
        )
    else:
        user_input = f"{history_context}用户当前问题：\n{question}"
        instructions = DIRECT_INSTRUCTIONS

    return PreparedAnswer(
        user_input=user_input,
        instructions=instructions,
        max_output_tokens=1600 if response_mode else 1000,
        citations=citations,
        retrieval_used=bool(hits),
        retrieval_reason=retrieval_reason,
        top_score=top_score,
        top_coverage=top_coverage,
        search_ms=search_ms,
        started_at=total_started,
    )


def _response_arguments(
    prepared: PreparedAnswer,
    client: Any | None = None,
) -> dict[str, Any]:
    # Keep the compact 1600/1000 defaults for lightweight test doubles and
    # older relays. DeepSeek V4 includes hidden reasoning tokens in the same
    # budget, so real clients pointed at DeepSeek need a larger ceiling. This
    # is especially important for the cited quick-action contracts such as
    # “common misconceptions”, which otherwise end mid-stream.
    output_tokens = prepared.max_output_tokens
    is_deepseek_client = (
        client is not None
        and isinstance(client, OpenAI)
        and (
            "api.deepseek.com" in API_BASE_URL.lower()
            or MODEL.lower().startswith("deepseek")
        )
    )
    if is_deepseek_client:
        output_tokens = max(
            output_tokens,
            # DeepSeek V4 counts hidden reasoning tokens inside this same
            # ceiling.  Give cited quick actions enough room for both the
            # reasoning pass and the requested multi-point answer.  The
            # smaller budget remains suitable for ordinary chat questions.
            6400 if prepared.max_output_tokens >= 1600 else 3200,
        )
    reasoning_effort = REASONING_EFFORT
    if is_deepseek_client and prepared.max_output_tokens >= 1600:
        # Quick actions already carry a tightly scoped contract and retrieved
        # evidence.  A full medium reasoning pass can consume the entire
        # DeepSeek output ceiling before the cited answer is finished.  Keep
        # ordinary chat and long-form generation at the configured effort,
        # while using a faster pass for these four fixed actions.
        reasoning_effort = os.getenv("EDULINK_QUICK_REASONING_EFFORT", "low").strip().lower() or "low"
    return {
        "model": MODEL,
        "instructions": prepared.instructions,
        "input": prepared.user_input,
        "reasoning": {"effort": reasoning_effort},
        "max_output_tokens": output_tokens,
        "store": False,
    }


def answer_question_detailed(
    question: str,
    retriever: BM25Retriever,
    top_k: int = 6,
    category: str | None = None,
    source_type: str | None = None,
    client: OpenAI | None = None,
    history: list[dict[str, Any]] | None = None,
    context_theory: str | None = None,
    response_mode: str | None = None,
    min_relevance_score: float = DEFAULT_MIN_RELEVANCE_SCORE,
) -> AnswerResult:
    if not question.strip():
        return AnswerResult(
            answer="请输入问题。",
            citations=[],
            retrieval_used=False,
            retrieval_reason="empty_question",
            top_score=None,
            top_coverage=None,
            search_ms=0.0,
            model_ms=0.0,
            total_ms=0.0,
        )
    prepared = prepare_answer(
        question=question,
        retriever=retriever,
        top_k=top_k,
        category=category,
        source_type=source_type,
        history=history,
        context_theory=context_theory,
        response_mode=response_mode,
        min_relevance_score=min_relevance_score,
    )
    client = client or create_client()
    model_started = time.perf_counter()
    response = client.responses.create(**_response_arguments(prepared, client))
    model_ms = round((time.perf_counter() - model_started) * 1000, 2)
    content = response.output_text.strip()
    if not content:
        raise RuntimeError("The API returned an empty response.")
    return AnswerResult(
        answer=content,
        citations=prepared.citations,
        retrieval_used=prepared.retrieval_used,
        retrieval_reason=prepared.retrieval_reason,
        top_score=prepared.top_score,
        top_coverage=prepared.top_coverage,
        search_ms=prepared.search_ms,
        model_ms=model_ms,
        total_ms=round((time.perf_counter() - prepared.started_at) * 1000, 2),
    )


def stream_prepared_answer(
    prepared: PreparedAnswer,
    client: OpenAI,
) -> Iterator[dict[str, Any]]:
    """Yield metadata, model text deltas, then the completed answer."""

    yield {
        "type": "meta",
        "sources": prepared.citations,
        "model": MODEL,
        "retrieval_used": prepared.retrieval_used,
        "retrieval_reason": prepared.retrieval_reason,
        "top_score": prepared.top_score,
        "top_coverage": prepared.top_coverage,
        "search_ms": prepared.search_ms,
    }
    model_started = time.perf_counter()
    parts: list[str] = []
    final_response: Any = None
    completed = False
    truncated_reason: str | None = None
    stream = client.responses.create(**_response_arguments(prepared, client), stream=True)
    try:
        for event in stream:
            event_type = str(getattr(event, "type", ""))
            if event_type in {"response.output_text.delta", "response.refusal.delta"}:
                delta = str(getattr(event, "delta", ""))
                if delta:
                    parts.append(delta)
                    yield {"type": "delta", "delta": delta}
            elif event_type == "response.completed":
                final_response = getattr(event, "response", None)
                completed = True
            elif event_type == "response.incomplete":
                response = getattr(event, "response", None)
                details = getattr(response, "incomplete_details", None)
                reason = getattr(details, "reason", None) or "unknown reason"
                # A length-limited response can already contain a useful
                # answer.  Treat it as a completed stream so the browser does
                # not discard the visible deltas and start a duplicate retry.
                # If no answer text was emitted, keep the error path so the
                # caller can retry an otherwise empty response.
                if reason in {"max_output_tokens", "length", "output_limit"} and "".join(parts).strip():
                    final_response = response
                    truncated_reason = str(reason)
                    completed = True
                    break
                raise RuntimeError(f"The API stream ended incomplete: {reason}")
            elif event_type == "response.failed":
                response = getattr(event, "response", None)
                error = getattr(response, "error", None)
                message = getattr(error, "message", None) or "The API stream failed."
                raise RuntimeError(str(message))
            elif event_type in {"error", "response.error"}:
                message = getattr(event, "message", None) or "The API stream returned an error."
                raise RuntimeError(str(message))
    finally:
        close = getattr(stream, "close", None)
        if callable(close):
            close()

    if not completed:
        raise RuntimeError("The API stream ended before response.completed.")

    content = "".join(parts).strip()
    if not content and final_response is not None:
        content = str(getattr(final_response, "output_text", "") or "").strip()
        if content:
            yield {"type": "delta", "delta": content}
    if not content:
        raise RuntimeError("The API returned an empty streamed response.")

    model_ms = round((time.perf_counter() - model_started) * 1000, 2)
    yield {
        "type": "done",
        "answer": content,
        "sources": prepared.citations,
        "model": MODEL,
        "truncated": bool(truncated_reason),
        "finish_reason": truncated_reason or "stop",
        "retrieval_used": prepared.retrieval_used,
        "retrieval_reason": prepared.retrieval_reason,
        "top_score": prepared.top_score,
        "top_coverage": prepared.top_coverage,
        "search_ms": prepared.search_ms,
        "model_ms": model_ms,
        "total_ms": round((time.perf_counter() - prepared.started_at) * 1000, 2),
    }


def answer_question(
    question: str,
    retriever: BM25Retriever,
    top_k: int = 6,
    category: str | None = None,
    source_type: str | None = None,
    client: OpenAI | None = None,
) -> tuple[str, list[dict]]:
    """Backward-compatible wrapper for CLI and existing callers."""

    result = answer_question_detailed(
        question=question,
        retriever=retriever,
        top_k=top_k,
        category=category,
        source_type=source_type,
        client=client,
    )
    return result.answer, result.citations


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("question", nargs="?", help="要咨询的问题；不提供时进入交互模式")
    parser.add_argument("--top-k", type=int, default=6, help="召回片段数量，默认 6")
    parser.add_argument("--category", help="按一级分类过滤，例如：心理学理论类")
    parser.add_argument("--source-type", help="按来源过滤：理论完成解释、教理范式汇典或课堂范本")
    parser.add_argument("--rebuild", action="store_true", help="重新生成知识切片")
    parser.add_argument("--show-sources", action="store_true", help="输出召回来源和分数")
    parser.add_argument(
        "--retrieve-only",
        action="store_true",
        help="只执行本地召回，不调用模型（用于调试检索结果）",
    )
    return parser.parse_args()


def run_once(question: str, args: argparse.Namespace, retriever: BM25Retriever) -> None:
    if getattr(args, "retrieve_only", False):
        hits = retriever.search(
            question,
            top_k=max(1, min(args.top_k, 20)),
            category=args.category,
            source_type=args.source_type,
        )
        context, citations = make_context(hits)
        if not citations:
            print("\n没有检索到足够相关的知识片段。")
            return
        print("\n召回片段：")
        print(context)
        print("\n召回来源：")
        for citation in citations:
            path = " / ".join(citation["category_path"])
            print(
                f"[{citation['number']}] {citation['theory_name']} | {path} | "
                f"{citation['source_type']} | {citation['source_title']} | "
                f"{citation['chunk_id']} | score={citation['score']}"
            )
        return

    answer, citations = answer_question(
        question,
        retriever,
        top_k=max(1, min(args.top_k, 20)),
        category=args.category,
        source_type=args.source_type,
    )
    print("\n回答：")
    print(answer)
    if args.show_sources:
        print("\n召回来源：")
        for citation in citations:
            path = " / ".join(citation["category_path"])
            print(
                f"[{citation['number']}] {citation['theory_name']} | "
                f"{path} | {citation['source_type']} | "
                f"{citation['source_title']} | {citation['chunk_id']} | "
                f"score={citation['score']}"
            )


def main() -> None:
    args = parse_args()
    ensure_chunks(rebuild=args.rebuild)
    retriever = BM25Retriever.from_jsonl(CHUNK_PATH)
    if args.question:
        run_once(args.question, args, retriever)
        return

    print("RAG 交互模式，输入 exit 退出。")
    while True:
        try:
            question = input("\n问题> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if question.lower() in {"exit", "quit", "\u9000\u51fa"}:
            return
        if question:
            run_once(question, args, retriever)


if __name__ == "__main__":
    try:
        main()
    except AuthenticationError as exc:
        print(f"Authentication failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
    except APIConnectionError as exc:
        print(f"Cannot connect to the API: {exc}", file=sys.stderr)
        raise SystemExit(1)
    except APIStatusError as exc:
        print(f"API request failed with HTTP {exc.status_code}: {exc}", file=sys.stderr)
        raise SystemExit(1)
    except (OSError, RuntimeError, ValueError) as exc:
        print(f"RAG failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
