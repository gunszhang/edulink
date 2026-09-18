"""HTTP API for the education RAG service.

The browser should call this service instead of calling the model relay
directly.  The relay API key stays on this machine; clients authenticate with
the separate ``RAG_API_TOKEN`` configured for this service.
"""

from __future__ import annotations

import argparse
import asyncio
from contextlib import asynccontextmanager
import json
import os
import re
import secrets
import time
from typing import Any, AsyncIterator, Iterator, Literal

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from openai import APIConnectionError, APIStatusError, AuthenticationError
from pydantic import BaseModel, Field, field_validator
from starlette.concurrency import run_in_threadpool
from starlette.responses import FileResponse, StreamingResponse
from theory_references import prepare_download
from lesson_visuals import start_visual, get_job as get_visual_job, image_path as visual_image_path

from rag.bm25 import BM25Retriever
from rag.run_rag import (
    CHUNK_PATH,
    DEFAULT_MIN_RELEVANCE_SCORE,
    MODEL,
    answer_question_detailed,
    create_client,
    ensure_chunks,
    prepare_answer,
    stream_prepared_answer,
)
from lesson_plan import LessonReferenceStore, generate_lesson_plan
from classroom_observation import (
    _terminate_funasr_worker,
    generate_observation_report,
    refine_trial_transcript,
    transcribe_audio,
)
from teaching_reflection import (
    ReflectionReferences,
    build_growth_profile,
    diagnose_reflection,
    extract_reflection_document,
    generate_reflection_actions,
    generate_reflection_outcome,
    infer_reflection_metadata,
    load_reflection_references,
)
from theory_training import TheoryTrainingStore
from theory_chat_history import TheoryChatHistoryStore


DEFAULT_CORS_ORIGINS = (
    "http://localhost:3000,http://localhost:5173,"
    "http://127.0.0.1:3000,http://127.0.0.1:5173,"
    "http://localhost:5500,http://127.0.0.1:5500,"
    "http://localhost:8080,http://127.0.0.1:8080,null,"
    "https://example.invalid,"
    "https://example.invalid,"
    "https://example.invalid"
)
TRANSCRIBE_JOB_TTL_SECONDS = 30 * 60
TRANSCRIBE_MAX_JOBS = 8
bearer = HTTPBearer(auto_error=False)


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _cors_origins() -> list[str]:
    raw = os.getenv("RAG_CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    origins = [item.strip() for item in raw.split(",") if item.strip()]
    return origins or ["http://localhost:3000"]


def _configured_token() -> str:
    token = os.getenv("RAG_API_TOKEN", "").strip()
    if not token and not _env_bool("RAG_ALLOW_NO_AUTH"):
        raise RuntimeError(
            "RAG_API_TOKEN is not configured. Set a long random token before "
            "starting the server, or explicitly set RAG_ALLOW_NO_AUTH=1 for "
            "a local-only test."
        )
    return token


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=12000)


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=8000)
    top_k: int = Field(default=6, ge=1, le=20)
    category: str | None = Field(default=None, max_length=200)
    source_type: str | None = Field(default=None, max_length=100)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=20)
    session_id: str | None = Field(default=None, max_length=128)
    context_theory: str | None = Field(default=None, max_length=200)
    response_mode: Literal[
        "core_viewpoints",
        "classroom_implementation",
        "classroom_case",
        "common_misconceptions",
    ] | None = None

    @field_validator("question")
    @classmethod
    def normalize_question(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question cannot be empty")
        return value


class SourceItem(BaseModel):
    number: int
    chunk_id: str
    theory_name: str
    category_path: list[str]
    source_type: str
    source_title: str
    score: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]
    model: str
    session_id: str | None
    retrieval_used: bool
    retrieval_reason: str
    top_score: float | None
    top_coverage: float | None
    search_ms: float
    model_ms: float
    total_ms: float


class LessonPlanRequest(BaseModel):
    stage: str = Field(default="小学", max_length=40)
    grade: str = Field(default="四年级", max_length=40)
    subject: str = Field(default="小学语文", max_length=80)
    edition: str = Field(default="统编版", max_length=80)
    term: str = Field(default="", max_length=20)
    title: str = Field(..., min_length=1, max_length=120)
    lessons: int = Field(default=1, ge=1, le=8)
    duration: int = Field(default=40, ge=20, le=180)
    summary: str = Field(default="", max_length=5000)
    requirement: str = Field(default="", max_length=5000)
    student_analysis: str = Field(default="", max_length=5000)
    arts: list[str] = Field(default_factory=lambda: ["说", "书", "画"], min_length=1, max_length=6)
    detail_level: Literal["concise", "detailed"] = "concise"

    @field_validator("title", "summary", "requirement", "student_analysis", "term", mode="before")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        return str(value or "").strip()


class LessonPlanResponse(BaseModel):
    plan: dict[str, Any]
    model: str
    used_fallback: bool
    warning: str | None = None
    references: list[dict[str, Any]]


class ClassroomObservationRequest(BaseModel):
    title: str = Field(default="", max_length=160)
    subject: str = Field(default="", max_length=80)
    grade: str = Field(default="", max_length=80)
    duration: str = Field(default="", max_length=40)
    teacher: str = Field(default="", max_length=80)
    analysis_date: str = Field(default="", max_length=40)
    transcript: str = Field(..., min_length=1, max_length=120000)
    theory_names: list[str] = Field(default_factory=list, max_length=20)
    use_model: bool = True

    @field_validator("transcript")
    @classmethod
    def normalize_transcript(cls, value: str) -> str:
        value = str(value or "").strip()
        if not value:
            raise ValueError("transcript cannot be empty")
        return value


class ClassroomObservationResponse(BaseModel):
    summary: str
    lines: list[dict[str, Any]]
    transcript_stats: dict[str, int]
    hotwords: dict[str, list[dict[str, Any]]]
    dimensions: list[dict[str, Any]]
    total_score: int
    theory_mapping: list[dict[str, Any]]
    diagnoses: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    references: list[dict[str, Any]]
    report: str
    model: str
    used_model: bool
    evidence_mode: str = "classroom_observation"
    evidence_notice: str = ""
    warning: str | None = None


class TranscriptRefineRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=120000)
    title: str = Field(default="", max_length=160)
    subject: str = Field(default="", max_length=80)
    grade: str = Field(default="", max_length=80)
    use_model: bool = True

    @field_validator("transcript")
    @classmethod
    def normalize_trial_transcript(cls, value: str) -> str:
        value = str(value or "").strip()
        if not value:
            raise ValueError("transcript cannot be empty")
        return value


class ReflectionMetadataRequest(BaseModel):
    source_text: str = Field(..., min_length=1, max_length=80000)
    filename: str = Field(default="", max_length=260)


class ReflectionDiagnoseRequest(BaseModel):
    source_text: str = Field(..., min_length=30, max_length=80000)
    filename: str = Field(default="", max_length=260)
    project_name: str = Field(default="", max_length=160)
    lesson_name: str = Field(default="", max_length=160)
    source_type: str = Field(default="课后教学反思", max_length=80)
    teacher_focus: str = Field(default="", max_length=5000)
    include_observation: bool = False
    observation_summary: dict[str, Any] | None = None
    use_model: bool = True

    @field_validator("source_text")
    @classmethod
    def normalize_reflection_source(cls, value: str) -> str:
        value = str(value or "").strip()
        if len(value) < 30:
            raise ValueError("source_text must contain at least 30 characters")
        return value


class ReflectionActionsRequest(BaseModel):
    source_text: str = Field(default="", max_length=80000)
    diagnosis: dict[str, Any]
    selected_theories: list[str] = Field(default_factory=list, min_length=1, max_length=10)
    use_model: bool = True


class ReflectionOutcomeRequest(BaseModel):
    source_text: str = Field(..., min_length=30, max_length=80000)
    project_name: str = Field(default="", max_length=160)
    lesson_name: str = Field(default="", max_length=160)
    output_type: Literal["reflection", "case", "research", "paper", "lesson", "experiment"] = "reflection"
    writing_style: Literal["teacher", "student", "paper", "competition"] = "teacher"
    diagnosis: dict[str, Any]
    actions_data: dict[str, Any]
    selected_theories: list[str] = Field(default_factory=list, min_length=1, max_length=10)
    teacher_focus: str = Field(default="", max_length=5000)
    use_model: bool = True


class ReflectionProfileRequest(BaseModel):
    diagnosis: dict[str, Any]
    actions_data: dict[str, Any] = Field(default_factory=dict)
    rounds: list[dict[str, Any]] = Field(default_factory=list, max_length=50)
    outcome_content: str = Field(default="", max_length=80000)


class HealthResponse(BaseModel):
    status: str
    model: str
    chunks: int
    textbook_chunks: int = 0
    textbook_documents: int = 0
    theory_training_questions: int = 0
    theory_training_attempts: int = 0


class TheoryTrainingQuestionsRequest(BaseModel):
    """Request a batch of scenario questions for the fifth theory step.

    ``theory``/``question_count``/``client_id`` are accepted as aliases for
    older frontend builds; the service normalizes them in the route.
    """

    mode: str = Field(default="specialized", max_length=40)
    theory_name: str | None = Field(default=None, max_length=200)
    theory: str | None = Field(default=None, max_length=200)
    count: int = Field(default=5, ge=1, le=20)
    question_count: int | None = Field(default=None, ge=1, le=20)
    num_questions: int | None = Field(default=None, ge=1, le=20)
    refresh: bool = False
    session_id: str | None = Field(default=None, max_length=128)
    user_id: str | None = Field(default=None, max_length=160)
    client_id: str | None = Field(default=None, max_length=160)


class TheoryTrainingAnswerRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=128)
    question_id: str | None = Field(default=None, max_length=200)
    id: str | None = Field(default=None, max_length=200)
    selected_answer: int | str | None = None
    answer: int | str | None = None
    user_id: str | None = Field(default=None, max_length=160)
    client_id: str | None = Field(default=None, max_length=160)


class TheoryTrainingHistoryQuery(BaseModel):
    limit: int = Field(default=50, ge=1, le=200)
    mode: str | None = Field(default=None, max_length=40)
    theory_name: str | None = Field(default=None, max_length=200)
    user_id: str | None = Field(default=None, max_length=160)
    client_id: str | None = Field(default=None, max_length=160)


def _get_retriever(request: Request) -> BM25Retriever:
    retriever = getattr(request.app.state, "retriever", None)
    if retriever is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG index is not ready",
        )
    return retriever


def _get_theory_chat_history_store(request: Request) -> TheoryChatHistoryStore:
    store = getattr(request.app.state, "theory_chat_history", None)
    if store is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="理论对话历史服务尚未就绪",
        )
    return store


def _history_client_id(value: str | None, request: Request) -> str:
    candidate = str(value or request.headers.get("X-EduLink-Client") or "").strip()
    # The client id is only a storage namespace.  Requiring a bounded,
    # opaque-looking value prevents accidental cross-client enumeration.
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:@-]{0,159}", candidate):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="client_id is required and must contain only letters, digits, ., _, :, @ or -",
        )
    return candidate


def _lesson_title(value: str) -> str:
    match = re.search(r"《([^》]{1,80})》", str(value or ""))
    return match.group(1).strip() if match else str(value or "").strip()


def _transcript_textbook_context(request: Request, metadata: dict[str, Any]) -> str:
    """Return title-scoped textbook text for ASR correction, never activity invention."""

    title = _lesson_title(str(metadata.get("title") or ""))
    store = getattr(request.app.state, "lesson_store", None)
    if not title or store is None:
        return ""
    subject = str(metadata.get("subject") or "通用").strip() or "通用"
    try:
        references = store.search(
            f"{title} {subject} 课文 原文 概念",
            subject,
            top_k=5,
            topic=title,
            grade=str(metadata.get("grade") or "").strip() or None,
        )
    except Exception:
        return ""
    exact = [
        item for item in references
        if item.get("topic_match") and item.get("retrieval_origin") == "textbook"
    ]
    selected = exact or [item for item in references if item.get("topic_match")]
    return "\n\n".join(str(item.get("text") or "")[:1800] for item in selected[:3])[:5000]


def token_dependency(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> None:
    expected = os.getenv("RAG_API_TOKEN", "").strip()
    if not expected and _env_bool("RAG_ALLOW_NO_AUTH"):
        return
    if not expected or credentials is None or not secrets.compare_digest(
        credentials.credentials, expected
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API token",
            headers={"WWW-Authenticate": "Bearer"},
        )


_STREAM_END = object()


def _next_stream_event(iterator: Iterator[dict[str, Any]]) -> dict[str, Any] | object:
    return next(iterator, _STREAM_END)


def _encode_sse(payload: dict[str, Any]) -> str:
    event_type = str(payload.get("type") or "message")
    data = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    return f"event: {event_type}\ndata: {data}\n\n"


def _stream_error_payload(exc: Exception) -> dict[str, Any]:
    if isinstance(exc, AuthenticationError):
        detail = "模型中转站鉴权失败，请检查服务端 API Key"
        code = "relay_authentication_failed"
        retryable = False
    elif isinstance(exc, APIConnectionError):
        detail = "模型中转站连接失败或流式响应中断"
        code = "relay_connection_failed"
        retryable = True
    elif isinstance(exc, APIStatusError):
        detail = f"模型中转站返回 HTTP {exc.status_code}"
        code = "relay_status_error"
        retryable = exc.status_code in {408, 409, 429} or exc.status_code >= 500
    else:
        detail = "模型流式回答生成失败，请稍后重新尝试"
        code = "stream_generation_failed"
        retryable = True
    return {"type": "error", "code": code, "detail": detail, "retryable": retryable}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Validate auth before loading the index so a misconfigured public service
    # fails immediately instead of silently running without protection.
    _configured_token()
    rebuild = _env_bool("RAG_REBUILD")
    ensure_chunks(rebuild=rebuild)
    app.state.retriever = BM25Retriever.from_jsonl(CHUNK_PATH)
    app.state.lesson_store = LessonReferenceStore.load(app.state.retriever)
    app.state.reflection_references = load_reflection_references()
    app.state.llm_client = create_client()
    # Scenario questions are bootstrapped from the same theory index used by
    # chat and are persisted independently so training can work across
    # browser sessions and devices.
    app.state.theory_training = TheoryTrainingStore(
        app.state.retriever,
        app.state.llm_client,
    )
    app.state.theory_chat_history = TheoryChatHistoryStore()
    app.state.request_semaphore = asyncio.Semaphore(
        max(1, int(os.getenv("RAG_MAX_CONCURRENCY", "4")))
    )
    # Audio transcription can outlive the HTTP request when accessed through
    # a temporary tunnel. Keep the job state in the process and let clients
    # poll for the completed result instead of holding a long POST open.
    app.state.classroom_transcribe_jobs = {}
    app.state.classroom_transcribe_tasks = set()
    yield
    tasks = list(getattr(app.state, "classroom_transcribe_tasks", set()))
    for task in tasks:
        task.cancel()
    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)
    _terminate_funasr_worker()
    app.state.llm_client.close()
    app.state.llm_client = None
    app.state.retriever = None
    app.state.lesson_store = None
    app.state.reflection_references = None
    app.state.theory_training = None
    app.state.theory_chat_history = None


app = FastAPI(
    title="Education RAG API",
    version="1.4.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=(
        r"^(?:https?://(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|"
        r"192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+)(?::\d+)?|"
        r"https://[a-z0-9-]+\.trycloudflare\.com)$"
    ),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-EduLink-Client"],
)


@app.get("/api/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    retriever = getattr(request.app.state, "retriever", None)
    lesson_store = getattr(request.app.state, "lesson_store", None)
    textbook_chunks = getattr(lesson_store, "textbook_chunks", []) if lesson_store else []
    textbook_documents = {
        str(item.get("source_path") or item.get("source_file") or "")
        for item in textbook_chunks
        if isinstance(item, dict)
    }
    training_store = getattr(request.app.state, "theory_training", None)
    return HealthResponse(
        status="ok" if retriever is not None else "starting",
        model=MODEL,
        chunks=len(retriever.chunks) if retriever is not None else 0,
        textbook_chunks=len(textbook_chunks),
        textbook_documents=len({item for item in textbook_documents if item}),
        theory_training_questions=len(getattr(training_store, "questions", []) or []),
        theory_training_attempts=len(getattr(training_store, "history_items", []) or []),
    )


class LessonVisualRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    subject: str = Field(default='小学语文', max_length=80)
    grade: str = Field(default='', max_length=40)
    term: str = Field(default='', max_length=20)
    kind: Literal['board', 'illustration'] = 'board'
    lesson_content: str = Field(default='', max_length=18000)
    brief: str = Field(default='', max_length=1500)
    lookup_only: bool = False


@app.post('/api/sixarts/visuals', dependencies=[Depends(token_dependency)])
def create_lesson_visual(payload: LessonVisualRequest):
    try:
        return start_visual(payload.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.get('/api/sixarts/visuals/jobs/{job_id}', dependencies=[Depends(token_dependency)])
def lesson_visual_status(job_id: str):
    try:
        return get_visual_job(job_id)
    except KeyError:
        raise HTTPException(status_code=404, detail='图片任务已失效，请重新获取')


@app.get('/api/sixarts/visuals/images/{image_id}', dependencies=[Depends(token_dependency)])
def lesson_visual_image(image_id: str):
    try:
        return FileResponse(visual_image_path(image_id))
    except KeyError:
        raise HTTPException(status_code=404, detail='图片不存在，请重新获取')


@app.get('/api/theory-references/{entry_id}/download', dependencies=[Depends(token_dependency)])
def download_theory_references(entry_id: str):
    try:
        path, filename, media_type = prepare_download(entry_id)
    except KeyError:
        raise HTTPException(status_code=404, detail='未找到该理论模块的参考文献')
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='参考文献文件暂不可用，请联系管理员同步文件及索引')
    except ValueError:
        raise HTTPException(status_code=400, detail='参考文献索引无效')
    return FileResponse(path, filename=filename, media_type=media_type)


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    dependencies=[Depends(token_dependency)],
)
async def chat(
    request: Request,
    payload: ChatRequest,
    retriever: BM25Retriever = Depends(_get_retriever),
) -> ChatResponse:
    try:
        try:
            min_relevance_score = float(
                os.getenv("RAG_MIN_RELEVANCE_SCORE", str(DEFAULT_MIN_RELEVANCE_SCORE))
            )
        except ValueError as exc:
            raise RuntimeError("RAG_MIN_RELEVANCE_SCORE must be numeric") from exc
        async with request.app.state.request_semaphore:
            result = await run_in_threadpool(
                answer_question_detailed,
                question=payload.question,
                retriever=retriever,
                top_k=payload.top_k,
                category=payload.category,
                source_type=payload.source_type,
                client=request.app.state.llm_client,
                history=[item.model_dump() for item in payload.history],
                context_theory=payload.context_theory,
                response_mode=payload.response_mode,
                min_relevance_score=min_relevance_score,
            )
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="模型中转站鉴权失败，请检查服务端 API Key",
        ) from exc
    except APIConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="模型中转站连接失败或响应超时",
        ) from exc
    except APIStatusError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"模型中转站返回 HTTP {exc.status_code}",
        ) from exc
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="知识库问答服务处理失败",
        ) from exc

    return ChatResponse(
        answer=result.answer,
        sources=result.citations,
        model=MODEL,
        session_id=payload.session_id,
        retrieval_used=result.retrieval_used,
        retrieval_reason=result.retrieval_reason,
        top_score=result.top_score,
        top_coverage=result.top_coverage,
        search_ms=result.search_ms,
        model_ms=result.model_ms,
        total_ms=result.total_ms,
    )


@app.post(
    "/api/chat/stream",
    dependencies=[Depends(token_dependency)],
)
async def chat_stream(
    request: Request,
    payload: ChatRequest,
    retriever: BM25Retriever = Depends(_get_retriever),
) -> StreamingResponse:
    try:
        min_relevance_score = float(
            os.getenv("RAG_MIN_RELEVANCE_SCORE", str(DEFAULT_MIN_RELEVANCE_SCORE))
        )
        prepared = await run_in_threadpool(
            prepare_answer,
            question=payload.question,
            retriever=retriever,
            top_k=payload.top_k,
            category=payload.category,
            source_type=payload.source_type,
            history=[item.model_dump() for item in payload.history],
            context_theory=payload.context_theory,
            response_mode=payload.response_mode,
            min_relevance_score=min_relevance_score,
        )
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="知识库问答服务处理失败",
        ) from exc

    async def generate_events() -> AsyncIterator[str]:
        async with request.app.state.request_semaphore:
            iterator = iter(stream_prepared_answer(prepared, request.app.state.llm_client))
            queue: asyncio.Queue[tuple[str, Any]] = asyncio.Queue(maxsize=32)

            async def produce() -> None:
                try:
                    while True:
                        event = await run_in_threadpool(_next_stream_event, iterator)
                        if event is _STREAM_END:
                            break
                        await queue.put(("event", event))
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    await queue.put(("error", exc))
                finally:
                    await queue.put(("end", None))

            producer = asyncio.create_task(produce())
            try:
                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        kind, value = await asyncio.wait_for(queue.get(), timeout=12.0)
                    except TimeoutError:
                        yield ": keep-alive\n\n"
                        continue
                    if kind == "end":
                        break
                    if kind == "error":
                        error_event = _stream_error_payload(value)
                        error_event["session_id"] = payload.session_id
                        yield _encode_sse(error_event)
                        break
                    payload_event = dict(value)
                    payload_event["session_id"] = payload.session_id
                    yield _encode_sse(payload_event)
            except asyncio.CancelledError:
                raise
            finally:
                if not producer.done():
                    producer.cancel()
                try:
                    await asyncio.wait_for(producer, timeout=1.0)
                except (asyncio.CancelledError, TimeoutError):
                    pass
                close = getattr(iterator, "close", None)
                if callable(close):
                    try:
                        close()
                    except (RuntimeError, ValueError):
                        pass

    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


@app.get(
    "/api/theory-chat/sessions",
    dependencies=[Depends(token_dependency)],
)
async def theory_chat_history_list(
    request: Request,
    q: str = Query(default="", max_length=200),
    client_id: str | None = Query(default=None, max_length=160),
) -> list[dict[str, Any]]:
    """List saved theory conversations for one browser/client namespace."""

    store = _get_theory_chat_history_store(request)
    scope = _history_client_id(client_id, request)
    return await run_in_threadpool(store.list, scope, q)


@app.get(
    "/api/theory-chat/sessions/{session_id}",
    dependencies=[Depends(token_dependency)],
)
async def theory_chat_history_get(
    request: Request,
    session_id: str,
    client_id: str | None = Query(default=None, max_length=160),
) -> dict[str, Any]:
    store = _get_theory_chat_history_store(request)
    scope = _history_client_id(client_id, request)
    item = await run_in_threadpool(store.get, scope, session_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话历史不存在或已过期")
    return item


@app.put(
    "/api/theory-chat/sessions/{session_id}",
    dependencies=[Depends(token_dependency)],
)
async def theory_chat_history_save(
    request: Request,
    session_id: str,
    payload: dict[str, Any],
    client_id: str | None = Query(default=None, max_length=160),
) -> dict[str, Any]:
    store = _get_theory_chat_history_store(request)
    scope = _history_client_id(client_id or payload.get("client_id"), request)
    try:
        return await run_in_threadpool(store.save, scope, session_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc


@app.delete(
    "/api/theory-chat/sessions/{session_id}",
    dependencies=[Depends(token_dependency)],
)
async def theory_chat_history_delete(
    request: Request,
    session_id: str,
    client_id: str | None = Query(default=None, max_length=160),
) -> dict[str, bool]:
    store = _get_theory_chat_history_store(request)
    scope = _history_client_id(client_id, request)
    removed = await run_in_threadpool(store.remove, scope, session_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="对话历史不存在或已过期")
    return {"deleted": True}


def _get_theory_training_store(request: Request) -> TheoryTrainingStore:
    store = getattr(request.app.state, "theory_training", None)
    if store is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="理论情境训练服务尚未就绪",
        )
    return store


@app.post(
    "/api/theory-training/questions",
    dependencies=[Depends(token_dependency)],
)
@app.post(
    "/api/theory-training/generate",
    dependencies=[Depends(token_dependency)],
)
async def theory_training_questions(
    request: Request,
    payload: TheoryTrainingQuestionsRequest,
) -> dict[str, Any]:
    """Return cached or newly generated specialized/random scenario questions."""

    store = _get_theory_training_store(request)
    data = payload.model_dump()
    mode = data.get("mode", "specialized")
    theory_name = data.get("theory_name") or data.get("theory")
    count = data.get("question_count") or data.get("num_questions") or data.get("count", 5)
    user_id = data.get("user_id") or data.get("client_id")
    try:
        async with request.app.state.request_semaphore:
            return await run_in_threadpool(
                store.get_questions,
                mode=mode,
                theory_name=theory_name,
                count=count,
                refresh=bool(data.get("refresh", False)),
                session_id=data.get("session_id"),
                user_id=user_id,
            )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "无法生成情境训练题",
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc) or "理论情境训练服务暂不可用",
        ) from exc


@app.post(
    "/api/theory-training/answer",
    dependencies=[Depends(token_dependency)],
)
@app.post(
    "/api/theory-training/submit",
    dependencies=[Depends(token_dependency)],
)
async def theory_training_answer(
    request: Request,
    payload: TheoryTrainingAnswerRequest,
) -> dict[str, Any]:
    """Grade one answer and persist the attempt for history queries."""

    store = _get_theory_training_store(request)
    data = payload.model_dump()
    question_id = data.get("question_id") or data.get("id")
    if not question_id:
        session = store.sessions.get(str(data.get("session_id")), {})
        question_ids = session.get("question_ids", [])
        if len(question_ids) == 1:
            question_id = question_ids[0]
    selected_answer = (
        data.get("selected_answer")
        if data.get("selected_answer") is not None
        else data.get("answer")
    )
    if not question_id or selected_answer is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="question_id 和 selected_answer 不能为空",
        )
    try:
        async with request.app.state.request_semaphore:
            return await run_in_threadpool(
                store.answer,
                session_id=data["session_id"],
                question_id=str(question_id),
                selected_answer=selected_answer,
                user_id=data.get("user_id") or data.get("client_id"),
            )
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc) or "题目不存在或已过期",
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "答案格式无效",
        ) from exc


@app.get(
    "/api/theory-training/history",
    dependencies=[Depends(token_dependency)],
)
@app.get(
    "/api/theory-training/attempts",
    dependencies=[Depends(token_dependency)],
)
async def theory_training_history(
    request: Request,
    limit: int = Query(default=50, ge=1, le=200),
    mode: str | None = Query(default=None, max_length=40),
    theory_name: str | None = Query(default=None, max_length=200),
    theory: str | None = Query(default=None, max_length=200),
    user_id: str | None = Query(default=None, max_length=160),
    client_id: str | None = Query(default=None, max_length=160),
) -> dict[str, Any]:
    """Return newest attempts, optionally filtered by mode/theory/device."""

    store = _get_theory_training_store(request)
    effective_user_id = user_id or client_id
    # Build session summaries from the complete retained history, then apply
    # the requested item limit only to the detailed attempt list.  Otherwise a
    # long session is reported with a misleading partial score.
    all_result = await run_in_threadpool(
        store.history,
        limit=5000,
        mode=mode,
        theory_name=theory_name or theory,
        user_id=effective_user_id,
    )
    session_result = await run_in_threadpool(
        store.history_sessions,
        limit=limit,
        mode=mode,
        theory_name=theory_name or theory,
        user_id=effective_user_id,
    )
    result = all_result[:limit]
    # Keep raw attempts for compatibility and expose complete review/resume
    # state per training session for newer browser clients.
    summaries = {str(item.get("session_id") or ""): item for item in session_result}
    enriched_history: list[dict[str, Any]] = []
    for item in result:
        sid = str(item.get("session_id") or item.get("attempt_id") or "")
        summary = summaries.get(sid, {})
        enriched = dict(item)
        enriched.setdefault("id", item.get("attempt_id", ""))
        enriched["score"] = int(summary.get("correct", int(bool(item.get("correct")))))
        enriched["total"] = int(summary.get("total", 1) or 1)
        accuracy = summary.get("accuracy", 100 if item.get("correct") else 0)
        enriched["accuracy"] = str(accuracy) if str(accuracy).endswith("%") else f"{accuracy}%"
        enriched["finished_at"] = item.get("answered_at", "")
        enriched_history.append(enriched)
    return {
        "history": enriched_history,
        "items": enriched_history,
        "sessions": session_result,
        "count": len(enriched_history),
    }


@app.post(
    "/api/sixarts/lesson-plan",
    response_model=LessonPlanResponse,
    dependencies=[Depends(token_dependency)],
)
async def sixarts_lesson_plan(
    request: Request,
    payload: LessonPlanRequest,
) -> LessonPlanResponse:
    store = getattr(request.app.state, "lesson_store", None)
    client = getattr(request.app.state, "llm_client", None)
    if store is None or client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="六艺教案资料索引尚未就绪",
        )
    async with request.app.state.request_semaphore:
        plan, used_fallback, _model_ms, references = await run_in_threadpool(
            generate_lesson_plan,
            payload.model_dump(),
            store,
            client,
        )
    warning = plan.get("warning") if isinstance(plan, dict) else None
    # The retrieved text is only needed to build the model prompt.  Return
    # compact provenance metadata to the browser so large DOCX excerpts never
    # become part of the public API response.
    public_references = [
        {
            "source_title": str(item.get("source_title", "")),
            "source_type": str(item.get("source_type", "依据资料")),
            "subject": str(item.get("subject", "通用")),
            "score": float(item.get("score", 0.0) or 0.0),
            **{
                field: item[field]
                for field in (
                    "source_file",
                    "source_path",
                    "markdown_path",
                    "pdf_page",
                    "grade",
                    "term",
                    "edition",
                    "match_type",
                )
                if item.get(field) not in (None, "")
            },
        }
        for item in references
        if isinstance(item, dict) and item.get("source_title")
    ]
    return LessonPlanResponse(
        plan=plan,
        model=str(plan.get("model", MODEL)) if isinstance(plan, dict) else MODEL,
        used_fallback=used_fallback,
        warning=warning,
        references=public_references,
    )


@app.post(
    "/api/classroom-observation/refine-transcript",
    dependencies=[Depends(token_dependency)],
)
async def classroom_observation_refine_transcript(
    request: Request,
    payload: TranscriptRefineRequest,
) -> dict[str, Any]:
    """Correct trial-lesson ASR and identify teacher-simulated student turns."""

    started_at = time.perf_counter()
    metadata = {
        "title": payload.title,
        "subject": payload.subject,
        "grade": payload.grade,
    }
    reference_text = _transcript_textbook_context(request, metadata)
    client = getattr(request.app.state, "llm_client", None)
    async with request.app.state.request_semaphore:
        try:
            result = await run_in_threadpool(
                refine_trial_transcript,
                payload.transcript,
                client,
                metadata,
                reference_text,
                payload.use_model,
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc) or "试讲逐字稿无法处理",
            ) from exc
    result["total_ms"] = round((time.perf_counter() - started_at) * 1000, 2)
    return result


@app.post(
    "/api/classroom-observation/analyze",
    response_model=ClassroomObservationResponse,
    dependencies=[Depends(token_dependency)],
)
async def classroom_observation_analyze(
    request: Request,
    payload: ClassroomObservationRequest,
) -> ClassroomObservationResponse:
    """Analyze a transcript with deterministic coding, theory RAG and model polish."""

    retriever = _get_retriever(request)
    client = getattr(request.app.state, "llm_client", None)
    async with request.app.state.request_semaphore:
        try:
            result = await run_in_threadpool(
                generate_observation_report,
                payload.model_dump(),
                retriever,
                client,
                payload.use_model,
            )
        except (OSError, RuntimeError, ValueError) as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc) or "逐字稿无法分析",
            ) from exc
    return ClassroomObservationResponse(**result)


def _classroom_audio_max_bytes() -> int:
    asr_backend = os.getenv("ASR_BACKEND", "funasr").strip().lower()
    default_mb = 25 if asr_backend == "relay" else 250
    try:
        configured_mb = int(os.getenv("ASR_MAX_UPLOAD_MB", str(default_mb)))
    except ValueError:
        configured_mb = default_mb
    return max(25, configured_mb) * 1024 * 1024


def _classroom_asr_model_name(backend_used: str) -> str:
    if backend_used == "funasr":
        return os.getenv("FUNASR_MODEL", "iic/SenseVoiceSmall")
    return os.getenv("ASR_RELAY_MODEL", "gpt-4o-mini-transcribe")


async def _run_classroom_transcription_pipeline(
    request: Request,
    *,
    filename: str,
    content_type: str,
    data: bytes,
    title: str,
    subject: str,
    grade: str,
    postprocess: bool,
    progress_callback: Any | None = None,
) -> dict[str, Any]:
    """Run ASR and refinement without requiring one long-lived HTTP request."""

    started_at = time.perf_counter()

    def progress(phase: str, value: int, **extra: Any) -> None:
        if progress_callback is not None:
            progress_callback({"phase": phase, "progress": value, **extra})

    asr_backend = os.getenv("ASR_BACKEND", "funasr").strip().lower()
    client = getattr(request.app.state, "llm_client", None)
    if client is None and asr_backend == "relay":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="模型服务尚未就绪")

    progress("asr", 5)
    asr_started_at = time.perf_counter()
    async with request.app.state.request_semaphore:
        try:
            transcribe_client = None if asr_backend in {"funasr", "local"} or (asr_backend == "auto" and len(data) > 25 * 1024 * 1024) else client
            transcript, backend_used = await run_in_threadpool(
                transcribe_audio, transcribe_client, filename, data, content_type
            )
        except AuthenticationError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="音频转写服务鉴权失败") from exc
        except APIConnectionError as exc:
            if asr_backend != "auto":
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="音频转写服务连接或响应超时") from exc
            try:
                transcript, backend_used = await run_in_threadpool(
                    transcribe_audio, None, filename, data, content_type
                )
            except Exception as local_exc:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"远程转写不可用，本地转写失败：{type(local_exc).__name__}") from local_exc
        except APIStatusError as exc:
            if asr_backend != "auto":
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"音频转写服务返回 HTTP {exc.status_code}") from exc
            try:
                transcript, backend_used = await run_in_threadpool(
                    transcribe_audio, None, filename, data, content_type
                )
            except Exception as local_exc:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"远程转写 HTTP {exc.status_code}，本地转写失败：{type(local_exc).__name__}") from local_exc
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"音频转写失败：{exc}") from exc
    asr_ms = round((time.perf_counter() - asr_started_at) * 1000, 2)
    if not transcript:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="音频转写服务返回空文本")

    progress("asr_complete", 45, transcript_chars=len(transcript))
    metadata = {"title": title[:160], "subject": subject[:80], "grade": grade[:80]}
    progress("refinement", 50)
    refinement_started_at = time.perf_counter()
    async with request.app.state.request_semaphore:
        refinement = await run_in_threadpool(
            refine_trial_transcript,
            transcript,
            client,
            metadata,
            _transcript_textbook_context(request, metadata),
            postprocess,
        )
    refinement_ms = round((time.perf_counter() - refinement_started_at) * 1000, 2)
    progress("completed", 100)

    notice_parts = [
        "已保留原始 ASR 稿，并完成试讲话轮优化。" if refinement.get("used_model") else "已保留原始 ASR 稿；模型后处理未完整完成，请人工核对。",
        str(refinement.get("evidence_notice") or ""),
    ]
    if refinement.get("warning"):
        notice_parts.append(str(refinement["warning"]))
    return {
        "text": refinement["text"],
        "raw_text": transcript,
        "refinement": refinement,
        "filename": filename,
        "backend": backend_used,
        "model": _classroom_asr_model_name(backend_used),
        "speaker_labeled": bool(refinement.get("stats", {}).get("teacher_turns")),
        "postprocessed": bool(refinement.get("used_model")),
        "asr_ms": asr_ms,
        "refinement_ms": refinement_ms,
        "total_ms": round((time.perf_counter() - started_at) * 1000, 2),
        "notice": "；".join(part for part in notice_parts if part),
    }


def _prune_classroom_transcribe_jobs(app: FastAPI) -> None:
    jobs = getattr(app.state, "classroom_transcribe_jobs", {})
    now = time.time()
    for job_id, job in list(jobs.items()):
        if job.get("status") in {"completed", "failed"} and now - float(job.get("finished_at", job.get("created_at", now))) > TRANSCRIBE_JOB_TTL_SECONDS:
            jobs.pop(job_id, None)


async def _run_classroom_transcribe_job(
    request: Request,
    job_id: str,
    *,
    filename: str,
    content_type: str,
    data: bytes,
    title: str,
    subject: str,
    grade: str,
    postprocess: bool,
) -> None:
    jobs = request.app.state.classroom_transcribe_jobs
    job = jobs.get(job_id)
    if job is None:
        return
    job.update(status="running", phase="asr", progress=5, started_at=time.time())

    def update_progress(update: dict[str, Any]) -> None:
        current = jobs.get(job_id)
        if current is not None:
            current.update(update)

    try:
        result = await _run_classroom_transcription_pipeline(
            request,
            filename=filename,
            content_type=content_type,
            data=data,
            title=title,
            subject=subject,
            grade=grade,
            postprocess=postprocess,
            progress_callback=update_progress,
        )
    except HTTPException as exc:
        job.update(status="failed", phase="failed", progress=100, error=str(exc.detail or "音频转写失败"), http_status=exc.status_code, finished_at=time.time())
    except asyncio.CancelledError:
        raise
    except Exception as exc:  # pragma: no cover - defensive boundary for background work
        job.update(status="failed", phase="failed", progress=100, error=f"音频转写失败：{type(exc).__name__}", http_status=503, finished_at=time.time())
    else:
        job.update(status="completed", phase="completed", progress=100, result=result, finished_at=time.time())


@app.post(
    "/api/classroom-observation/transcribe/start",
    dependencies=[Depends(token_dependency)],
)
async def classroom_observation_transcribe_start(
    request: Request,
    audio: UploadFile = File(...),
    title: str = Form(default=""),
    subject: str = Form(default=""),
    grade: str = Form(default=""),
    postprocess: bool = Form(default=True),
) -> dict[str, Any]:
    """Queue audio processing so a temporary tunnel never holds a long POST."""

    data = await audio.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="音频文件为空")
    max_bytes = _classroom_audio_max_bytes()
    if len(data) > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"音频文件不能超过 {max_bytes // (1024 * 1024)} MB")

    _prune_classroom_transcribe_jobs(request.app)
    jobs = request.app.state.classroom_transcribe_jobs
    active_count = sum(job.get("status") in {"queued", "running"} for job in jobs.values())
    if active_count >= TRANSCRIBE_MAX_JOBS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="当前音频处理任务较多，请稍后重试")

    job_id = secrets.token_urlsafe(18)
    jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "phase": "queued",
        "progress": 0,
        "created_at": time.time(),
        "filename": audio.filename or "classroom-audio",
    }
    task = asyncio.create_task(
        _run_classroom_transcribe_job(
            request,
            job_id,
            filename=audio.filename or "classroom-audio",
            content_type=audio.content_type or "",
            data=data,
            title=title,
            subject=subject,
            grade=grade,
            postprocess=postprocess,
        )
    )
    request.app.state.classroom_transcribe_tasks.add(task)
    task.add_done_callback(request.app.state.classroom_transcribe_tasks.discard)
    return {"job_id": job_id, "status": "queued", "phase": "queued", "progress": 0, "status_url": f"/api/classroom-observation/transcribe/status/{job_id}"}


@app.get(
    "/api/classroom-observation/transcribe/status/{job_id}",
    dependencies=[Depends(token_dependency)],
)
async def classroom_observation_transcribe_status(request: Request, job_id: str) -> dict[str, Any]:
    """Return progress or the completed result for a queued audio job."""

    _prune_classroom_transcribe_jobs(request.app)
    job = request.app.state.classroom_transcribe_jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="音频处理任务不存在或已过期")
    response: dict[str, Any] = {
        "job_id": job_id,
        "status": job.get("status", "queued"),
        "phase": job.get("phase", "queued"),
        "progress": int(job.get("progress", 0) or 0),
    }
    if job.get("status") == "completed":
        response["result"] = job.get("result")
    elif job.get("status") == "failed":
        response["error"] = job.get("error", "音频转写失败")
        response["http_status"] = job.get("http_status", 503)
    return response


@app.post(
    "/api/classroom-observation/transcribe",
    dependencies=[Depends(token_dependency)],
)
async def classroom_observation_transcribe(
    request: Request,
    audio: UploadFile = File(...),
    title: str = Form(default=""),
    subject: str = Form(default=""),
    grade: str = Form(default=""),
    postprocess: bool = Form(default=True),
) -> dict[str, Any]:
    """Convert classroom audio to a timestamped transcript.

    Local FunASR/SenseVoice is the default because the configured relay does
    not expose a speech-to-text model. Set ``ASR_BACKEND=relay`` only after
    configuring a compatible speech endpoint.
    """

    started_at = time.perf_counter()
    data = await audio.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="音频文件为空")
    asr_backend = os.getenv("ASR_BACKEND", "funasr").strip().lower()
    try:
        configured_max_mb = int(os.getenv("ASR_MAX_UPLOAD_MB", "250" if asr_backend != "relay" else "25"))
    except ValueError:
        configured_max_mb = 250 if asr_backend != "relay" else 25
    max_bytes = max(25, configured_max_mb) * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"音频文件不能超过 {max(25, configured_max_mb)} MB")
    client = getattr(request.app.state, "llm_client", None)
    if client is None and asr_backend == "relay":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="模型服务尚未就绪")
    asr_started_at = time.perf_counter()
    async with request.app.state.request_semaphore:
        try:
            # The relay currently has no speech model.  For large uploads,
            # skip the relay's 25 MB limit and use local ASR immediately.
            transcribe_client = None if asr_backend in {"funasr", "local"} or (asr_backend == "auto" and len(data) > 25 * 1024 * 1024) else client
            transcript, backend_used = await run_in_threadpool(
                transcribe_audio, transcribe_client, audio.filename or "classroom-audio", data, audio.content_type or ""
            )
        except AuthenticationError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="音频转写服务鉴权失败") from exc
        except APIConnectionError as exc:
            if asr_backend != "auto":
                raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="音频转写服务连接或响应超时") from exc
            try:
                transcript, backend_used = await run_in_threadpool(
                    transcribe_audio, None, audio.filename or "classroom-audio", data, audio.content_type or ""
                )
            except Exception as local_exc:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"远程转写不可用，本地转写失败：{type(local_exc).__name__}") from local_exc
        except APIStatusError as exc:
            if asr_backend != "auto":
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"音频转写服务返回 HTTP {exc.status_code}") from exc
            try:
                transcript, backend_used = await run_in_threadpool(
                    transcribe_audio, None, audio.filename or "classroom-audio", data, audio.content_type or ""
                )
            except Exception as local_exc:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"远程转写 HTTP {exc.status_code}，本地转写失败：{type(local_exc).__name__}") from local_exc
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"音频转写失败：{exc}") from exc
    asr_ms = round((time.perf_counter() - asr_started_at) * 1000, 2)
    if not transcript:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="音频转写服务返回空文本")
    metadata = {"title": title[:160], "subject": subject[:80], "grade": grade[:80]}
    refinement_started_at = time.perf_counter()
    async with request.app.state.request_semaphore:
        refinement = await run_in_threadpool(
            refine_trial_transcript,
            transcript,
            client,
            metadata,
            _transcript_textbook_context(request, metadata),
            postprocess,
        )
    refinement_ms = round((time.perf_counter() - refinement_started_at) * 1000, 2)
    notice_parts = [
        "已保留原始 ASR 稿，并完成试讲话轮优化。" if refinement.get("used_model") else "已保留原始 ASR 稿；模型后处理未完整完成，请人工核对。",
        str(refinement.get("evidence_notice") or ""),
    ]
    if refinement.get("warning"):
        notice_parts.append(str(refinement["warning"]))
    return {
        "text": refinement["text"],
        "raw_text": transcript,
        "refinement": refinement,
        "filename": audio.filename or "classroom-audio",
        "backend": backend_used,
        "model": _classroom_asr_model_name(backend_used),
        "speaker_labeled": bool(refinement.get("stats", {}).get("teacher_turns")),
        "postprocessed": bool(refinement.get("used_model")),
        "asr_ms": asr_ms,
        "refinement_ms": refinement_ms,
        "total_ms": round((time.perf_counter() - started_at) * 1000, 2),
        "notice": "；".join(part for part in notice_parts if part),
    }


@app.post(
    "/api/teaching-reflection/metadata",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_metadata(
    payload: ReflectionMetadataRequest,
) -> dict[str, str]:
    """Infer editable project and lesson names from a reflection draft."""

    return infer_reflection_metadata(payload.source_text, payload.filename)


@app.post(
    "/api/teaching-reflection/extract",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_extract(
    file: UploadFile = File(...),
) -> dict[str, str]:
    """Extract reflection text and metadata from an uploaded document."""

    data = await file.read()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="上传文件为空",
        )
    max_bytes = 25 * 1024 * 1024
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="反思文件不能超过 25 MB",
        )
    try:
        return await run_in_threadpool(
            extract_reflection_document,
            file.filename or "教学反思.txt",
            data,
        )
    except (RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "无法提取反思文件正文",
        ) from exc


@app.post(
    "/api/teaching-reflection/diagnose",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_diagnose(
    request: Request,
    payload: ReflectionDiagnoseRequest,
    retriever: BM25Retriever = Depends(_get_retriever),
) -> dict[str, Any]:
    """Build evidence-separated diagnoses and retrieve matching theories."""

    references = getattr(request.app.state, "reflection_references", None)
    client = getattr(request.app.state, "llm_client", None)
    try:
        async with request.app.state.request_semaphore:
            return await run_in_threadpool(
                diagnose_reflection,
                payload.model_dump(),
                retriever,
                client,
                references,
            )
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "教学反思诊断失败",
        ) from exc


@app.post(
    "/api/teaching-reflection/actions",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_actions(
    request: Request,
    payload: ReflectionActionsRequest,
) -> dict[str, Any]:
    """Turn the confirmed theory combination into observable actions."""

    client = getattr(request.app.state, "llm_client", None)
    try:
        async with request.app.state.request_semaphore:
            return await run_in_threadpool(
                generate_reflection_actions,
                payload.model_dump(),
                client,
            )
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "教学改进行动生成失败",
        ) from exc


@app.post(
    "/api/teaching-reflection/outcome",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_outcome(
    request: Request,
    payload: ReflectionOutcomeRequest,
) -> dict[str, Any]:
    """Generate the selected professional teaching outcome."""

    references = getattr(request.app.state, "reflection_references", None)
    client = getattr(request.app.state, "llm_client", None)
    try:
        async with request.app.state.request_semaphore:
            return await run_in_threadpool(
                generate_reflection_outcome,
                payload.model_dump(),
                client,
                references,
            )
    except (OSError, RuntimeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc) or "教学成果生成失败",
        ) from exc


@app.post(
    "/api/teaching-reflection/profile",
    dependencies=[Depends(token_dependency)],
)
async def teaching_reflection_profile(
    payload: ReflectionProfileRequest,
) -> dict[str, Any]:
    """Build a growth profile from the current and previous reflection rounds."""

    return await run_in_threadpool(build_growth_profile, payload.model_dump())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--host",
        default=os.getenv("RAG_HOST", "0.0.0.0"),
        help="监听地址，跨设备访问时默认监听所有网卡",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("RAG_PORT", "8000")),
        help="监听端口",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="开发模式自动重载；公网服务不要启用",
    )
    return parser.parse_args()


def main() -> None:
    import uvicorn

    args = parse_args()
    uvicorn.run(
        "api_server:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
    )


if __name__ == "__main__":
    main()
