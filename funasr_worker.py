"""Persistent FunASR worker used by the Python 3.14 API process.

FunASR and PyTorch run in a dedicated Python 3.11 environment.  Requests and
responses use one JSON object per line so the loaded model can be reused across
audio jobs instead of being initialized for every upload.
"""

from __future__ import annotations

from contextlib import redirect_stdout
import json
import os
from pathlib import Path
import re
import shutil
import sys
import traceback
from typing import Any


PROTOCOL_PREFIX = "EDULINK_FUNASR_RESULT\t"
_MODEL: Any | None = None
_POSTPROCESS: Any | None = None


def _modelscope_cache_dir() -> Path:
    return Path(
        os.getenv(
            "FUNASR_CACHE_DIR",
            os.getenv("MODELSCOPE_CACHE", r".runtime/funasr-models"),
        )
    )


def _copy_legacy_model_cache(model_name: str) -> None:
    """Reuse an already downloaded model while moving it off a Unicode path."""

    if "/" not in model_name or os.name != "nt":
        return
    organisation, repository = model_name.split("/", 1)
    target = _modelscope_cache_dir() / "models" / organisation / repository
    if (target / "configuration.json").is_file() or (target / "config.yaml").is_file():
        return
    legacy = Path.home() / ".cache" / "modelscope" / "hub" / "models" / organisation / repository
    if not legacy.is_dir():
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(legacy, target, dirs_exist_ok=True)


def _resolve_model_reference(model_name: str) -> str:
    """Use a complete local ModelScope snapshot when one is available."""

    reference = str(model_name or "").strip()
    candidate = Path(reference)
    if candidate.is_dir():
        return str(candidate)
    aliases = {
        "fsmn-vad": ("iic", "speech_fsmn_vad_zh-cn-16k-common-pytorch"),
    }
    alias_target = aliases.get(reference.lower())
    if alias_target:
        cached = _modelscope_cache_dir() / "models" / alias_target[0] / alias_target[1]
        if (cached / "configuration.json").is_file() or (
            (cached / "config.yaml").is_file() and (cached / "model.pt").is_file()
        ):
            return str(cached)
    if "/" not in reference:
        return reference
    organisation, repository = reference.split("/", 1)
    cached = _modelscope_cache_dir() / "models" / organisation / repository
    if (cached / "configuration.json").is_file() or (
        (cached / "config.yaml").is_file() and (cached / "model.pt").is_file()
    ):
        return str(cached)
    return reference


def _write_response(payload: dict[str, Any]) -> None:
    sys.__stdout__.write(PROTOCOL_PREFIX + json.dumps(payload, ensure_ascii=False) + "\n")
    sys.__stdout__.flush()


def _positive_int(name: str, default: int) -> int:
    try:
        return max(1, int(os.getenv(name, str(default))))
    except ValueError:
        return default


def _positive_float(name: str, default: float) -> float:
    try:
        return max(0.1, float(os.getenv(name, str(default))))
    except ValueError:
        return default


def _get_model() -> Any:
    global _MODEL, _POSTPROCESS
    if _MODEL is not None:
        return _MODEL

    # sentencepiece cannot reliably open model files below a Unicode Windows
    # user profile. Keep all ModelScope assets in an ASCII-only cache path.
    os.environ.setdefault("MODELSCOPE_CACHE", str(_modelscope_cache_dir()))
    _copy_legacy_model_cache(os.getenv("FUNASR_MODEL", "iic/SenseVoiceSmall"))

    # FunASR prints model-download and progress messages to stdout.  Keep the
    # protocol channel clean by sending those diagnostics to the worker log.
    with redirect_stdout(sys.stderr):
        # This Windows/Conda environment is behind a certificate chain that is
        # present in the OS trust store but not Conda's bundled CA file.
        try:
            import truststore

            truststore.inject_into_ssl()
        except ImportError:
            pass
        from funasr import AutoModel
        from funasr.utils.postprocess_utils import rich_transcription_postprocess

        _POSTPROCESS = rich_transcription_postprocess
        model_reference = os.getenv("FUNASR_MODEL", "iic/SenseVoiceSmall")
        vad_reference = os.getenv("FUNASR_VAD_MODEL", "fsmn-vad")
        _copy_legacy_model_cache(model_reference)
        _MODEL = AutoModel(
            model=_resolve_model_reference(model_reference),
            vad_model=_resolve_model_reference(vad_reference),
            vad_kwargs={
                "max_single_segment_time": _positive_int(
                    "FUNASR_MAX_SEGMENT_MS", 30_000
                )
            },
            hub=os.getenv("FUNASR_HUB", "ms"),
            device=os.getenv("FUNASR_DEVICE", "cpu"),
            ncpu=_positive_int("FUNASR_NCPU", min(8, os.cpu_count() or 4)),
            disable_update=True,
            disable_pbar=True,
        )
    return _MODEL


_SENSEVOICE_TAG = re.compile(r"<\|[^|]*\|>")
_CONTENT_CHAR = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fffA-Za-z0-9]")


def _clean_text(value: Any) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    if _POSTPROCESS is not None:
        try:
            text = str(_POSTPROCESS(text) or text)
        except Exception:
            pass
    return _SENSEVOICE_TAG.sub("", text).strip()


def _has_content(text: str) -> bool:
    # VAD occasionally emits a punctuation-only boundary (for example ``。``).
    # It is not a classroom utterance and should not become a transcript row.
    return bool(_CONTENT_CHAR.search(text))


def _milliseconds(value: Any) -> int | None:
    if value is None or value == "":
        return None
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return None


def _normalise_result(result: Any) -> dict[str, Any]:
    item = result[0] if isinstance(result, list) and result else result
    if not isinstance(item, dict):
        raise RuntimeError("FunASR returned an unsupported result structure")

    segments: list[dict[str, Any]] = []
    sentence_info = item.get("sentence_info") or []
    if isinstance(sentence_info, list):
        for segment in sentence_info:
            if not isinstance(segment, dict):
                continue
            text = _clean_text(segment.get("sentence") or segment.get("text"))
            if not text or not _has_content(text):
                continue
            start_ms = _milliseconds(segment.get("start", segment.get("start_time")))
            end_ms = _milliseconds(segment.get("end", segment.get("end_time")))
            if start_ms is not None and end_ms is not None and end_ms < start_ms:
                end_ms = None
            segments.append(
                {"text": text, "start_ms": start_ms, "end_ms": end_ms}
            )

    segments.sort(
        key=lambda segment: (
            segment["start_ms"] is None,
            segment["start_ms"] if segment["start_ms"] is not None else 0,
        )
    )

    full_text = _clean_text(item.get("text"))
    if not _has_content(full_text):
        full_text = ""
    if not full_text and segments:
        full_text = "".join(segment["text"] for segment in segments)
    return {"text": full_text, "segments": segments}


def _transcribe(audio_path: str, language: str) -> dict[str, Any]:
    path = Path(audio_path)
    if not path.is_file():
        raise FileNotFoundError(f"Audio file does not exist: {path}")

    model = _get_model()
    with redirect_stdout(sys.stderr):
        result = model.generate(
            input=str(path),
            cache={},
            language=language or "zh",
            use_itn=True,
            batch_size_s=_positive_int("FUNASR_BATCH_SIZE_S", 60),
            merge_vad=True,
            merge_length_s=_positive_float("FUNASR_MERGE_LENGTH_S", 15.0),
            sentence_timestamp=True,
        )
    return _normalise_result(result)


def _handle(request: dict[str, Any]) -> bool:
    request_id = str(request.get("id") or "")
    action = str(request.get("action") or "transcribe")
    if action == "shutdown":
        _write_response({"id": request_id, "ok": True, "shutdown": True})
        return False
    if action == "ping":
        _write_response(
            {
                "id": request_id,
                "ok": True,
                "model_loaded": _MODEL is not None,
                "model": os.getenv("FUNASR_MODEL", "iic/SenseVoiceSmall"),
            }
        )
        return True
    if action != "transcribe":
        raise ValueError(f"Unsupported worker action: {action}")

    result = _transcribe(
        str(request.get("audio_path") or ""),
        str(request.get("language") or "zh"),
    )
    _write_response({"id": request_id, "ok": True, **result})
    return True


def main() -> int:
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        request_id = ""
        try:
            request = json.loads(line)
            if not isinstance(request, dict):
                raise ValueError("Worker request must be a JSON object")
            request_id = str(request.get("id") or "")
            if not _handle(request):
                return 0
        except Exception as exc:
            traceback.print_exc(file=sys.stderr)
            _write_response(
                {
                    "id": request_id,
                    "ok": False,
                    "error": str(exc) or type(exc).__name__,
                    "error_type": type(exc).__name__,
                }
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
