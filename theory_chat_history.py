"""Small, authenticated persistence layer for theory-chat sessions.

The browser keeps a local copy for offline use.  This store is an optional
server adapter used when a deployment needs history to survive a browser
refresh or be available from another device.  Sessions are scoped by the
client id supplied by the browser; the id is not treated as an identity or a
permission to access another client's sessions.
"""

from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import threading
from typing import Any


ROOT = Path(__file__).resolve().parent
HISTORY_PATH = Path(
    os.getenv(
        "THEORY_CHAT_HISTORY_PATH",
        str(ROOT / "rag" / "data" / "theory_chat_sessions.json"),
    )
)
MAX_SESSIONS = 2000
MAX_SESSIONS_PER_CLIENT = 120
MAX_MESSAGES = 80
MAX_FIELD = 24000
_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _timestamp(value: Any) -> float:
    """Return a comparable UTC timestamp for client-provided ISO values."""

    try:
        parsed = datetime.fromisoformat(str(value or "").replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.timestamp()
    except (TypeError, ValueError, OverflowError):
        return 0.0


def _text(value: Any, limit: int) -> str:
    return str(value or "").strip()[:limit]


def _client_id(value: Any) -> str:
    # Keep this deliberately conservative: it is used as a storage scope and
    # must never become a path component or an unbounded log field.
    candidate = _text(value, 160)
    return candidate if re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:@-]{0,159}", candidate) else ""


def _session_id(value: Any) -> str:
    candidate = _text(value, 128)
    return candidate if _ID_RE.fullmatch(candidate) else ""


def _safe_message(value: Any) -> dict[str, Any] | None:
    if not isinstance(value, dict):
        return None
    role = _text(value.get("role"), 20).lower()
    if role not in {"user", "assistant"}:
        return None
    result: dict[str, Any] = {"role": role}
    # The current UI prefers text (which it renders through its own Markdown
    # escaper).  Keep a small, sanitized legacy html field for old sessions.
    text = _text(value.get("text"), MAX_FIELD)
    if text:
        result["text"] = text
    html = _text(value.get("html"), MAX_FIELD)
    if html:
        # Remove scripts, event handlers and javascript URLs before returning
        # legacy markup to a client that may place it in innerHTML.
        html = re.sub(r"<\s*(script|style|iframe|object|embed)[^>]*>.*?<\s*/\s*\1\s*>", "", html, flags=re.I | re.S)
        html = re.sub(r"\s+on[a-z]+\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)", "", html, flags=re.I)
        html = re.sub(r"javascript\s*:", "", html, flags=re.I)
        result["html"] = html
    for key in ("intro", "streaming", "requestFailed"):
        if key in value:
            result[key] = bool(value.get(key))
    for key in ("sources", "status", "trace", "model", "retryQuestion", "retryMode"):
        if key not in value:
            continue
        item = value[key]
        if key in {"sources", "status", "trace"}:
            # These are display metadata; cap their JSON representation rather
            # than trusting arbitrary nested objects from a browser.
            try:
                encoded = json.dumps(item, ensure_ascii=False)
            except (TypeError, ValueError):
                continue
            if len(encoded) <= 12000:
                result[key] = item
        else:
            result[key] = _text(item, 400)
    return result if result.get("text") or result.get("html") else None


def normalize_session(payload: Any, session_id: str, client_id: str) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("session body must be an object")
    sid = _session_id(session_id)
    cid = _client_id(client_id)
    if not sid or not cid:
        raise ValueError("session_id and client_id are required")
    messages: list[dict[str, Any]] = []
    raw_messages = payload.get("messages")
    if isinstance(raw_messages, list):
        for item in raw_messages[-MAX_MESSAGES:]:
            safe = _safe_message(item)
            if safe:
                messages.append(safe)
    now = _now()
    created = _text(payload.get("createdAt") or payload.get("created_at"), 64) or now
    updated = _text(payload.get("updatedAt") or payload.get("updated_at"), 64) or now
    return {
        "id": sid,
        "title": _text(payload.get("title"), 240) or "新对话",
        "preview": _text(payload.get("preview"), 400),
        "theoryId": _text(payload.get("theoryId") or payload.get("theory_id"), 200),
        "messages": messages,
        "createdAt": created,
        "updatedAt": updated,
        "client_id": cid,
    }


class TheoryChatHistoryStore:
    def __init__(self, path: Path | str = HISTORY_PATH) -> None:
        self.path = Path(path)
        self._lock = threading.RLock()
        self._sessions: dict[tuple[str, str], dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        try:
            raw = json.loads(self.path.read_text(encoding="utf-8"))
        except (FileNotFoundError, OSError, UnicodeError, json.JSONDecodeError):
            return
        values = raw.get("sessions", []) if isinstance(raw, dict) else raw
        if not isinstance(values, list):
            return
        for item in values:
            if not isinstance(item, dict):
                continue
            cid = _client_id(item.get("client_id"))
            sid = _session_id(item.get("id"))
            if not cid or not sid:
                continue
            try:
                normalized = normalize_session(item, sid, cid)
            except ValueError:
                continue
            self._sessions[(cid, sid)] = normalized
        self._trim()

    def _trim(self) -> None:
        by_client: dict[str, list[tuple[tuple[str, str], dict[str, Any]]]] = {}
        for key, item in self._sessions.items():
            by_client.setdefault(key[0], []).append((key, item))
        for items in by_client.values():
            items.sort(key=lambda pair: pair[1].get("updatedAt", ""), reverse=True)
            for key, _item in items[MAX_SESSIONS_PER_CLIENT:]:
                self._sessions.pop(key, None)
        if len(self._sessions) > MAX_SESSIONS:
            ordered = sorted(self._sessions.items(), key=lambda pair: pair[1].get("updatedAt", ""), reverse=True)
            self._sessions = dict(ordered[:MAX_SESSIONS])

    def _persist(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        values = sorted(self._sessions.values(), key=lambda item: item.get("updatedAt", ""), reverse=True)
        temporary = self.path.with_name(f".{self.path.name}.{os.getpid()}.tmp")
        temporary.write_text(json.dumps({"version": 1, "sessions": values}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        temporary.replace(self.path)

    def list(self, client_id: str, query: str = "") -> list[dict[str, Any]]:
        cid = _client_id(client_id)
        keyword = _text(query, 200).casefold()
        with self._lock:
            values = [item for (scope, _sid), item in self._sessions.items() if scope == cid]
            if keyword:
                values = [item for item in values if keyword in f"{item.get('title', '')} {item.get('preview', '')}".casefold()]
            return [json.loads(json.dumps(item, ensure_ascii=False)) for item in sorted(values, key=lambda item: item.get("updatedAt", ""), reverse=True)]

    def get(self, client_id: str, session_id: str) -> dict[str, Any] | None:
        cid, sid = _client_id(client_id), _session_id(session_id)
        with self._lock:
            item = self._sessions.get((cid, sid))
            return json.loads(json.dumps(item, ensure_ascii=False)) if item else None

    def save(self, client_id: str, session_id: str, payload: Any) -> dict[str, Any]:
        normalized = normalize_session(payload, session_id, client_id)
        with self._lock:
            existing = self._sessions.get((normalized["client_id"], normalized["id"]))
            # Browser requests can complete out of order across tabs or
            # devices. Never let an older snapshot overwrite a newer one.
            if existing and _timestamp(existing.get("updatedAt")) > _timestamp(normalized.get("updatedAt")):
                return json.loads(json.dumps(existing, ensure_ascii=False))
            self._sessions[(normalized["client_id"], normalized["id"])] = normalized
            self._trim()
            self._persist()
            return json.loads(json.dumps(normalized, ensure_ascii=False))

    def remove(self, client_id: str, session_id: str) -> bool:
        key = (_client_id(client_id), _session_id(session_id))
        with self._lock:
            existed = key in self._sessions
            if existed:
                self._sessions.pop(key, None)
                self._persist()
            return existed


__all__ = ["HISTORY_PATH", "TheoryChatHistoryStore", "normalize_session"]
