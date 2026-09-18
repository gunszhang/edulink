"""Small dependency-free BM25 retriever for the generated JSONL chunks."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import json
import math
from pathlib import Path
import re
import unicodedata
from typing import Any, Iterable


_CJK_RUN = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff]+")
_WORD_RUN = re.compile(r"[a-z0-9]+(?:[-_./][a-z0-9]+)*")
_THEORY_SUFFIXES = (
    "教育教学理论",
    "教育理论",
    "教学理论",
    "课程理论",
    "学习理论",
    "发展理论",
    "理论",
    "思想",
    "范式",
    "模式",
    "学说",
)
_THEORY_QUERY_SUFFIXES = (
    "是什么",
    "指什么",
    "学习理论",
    "教学理论",
    "课程理论",
    "教育理论",
    "理论",
    "的",
    "有哪些",
    "有何",
    "如何",
    "怎么",
    "为何",
    "为什么",
    "核心",
    "观点",
    "内容",
    "局限",
    "应用",
    "适用",
    "区别",
    "关系",
    "分析",
    "说明",
    "解释",
    "举例",
    "案例",
    "课堂",
    "教学",
    "优点",
    "缺点",
    "意义",
    "作用",
)
_ASCII_ALIAS = re.compile(r"[a-z0-9][a-z0-9 ._/-]*", re.IGNORECASE)
_BOUNDARY_CHARS = set(" \t\r\n,，.。!！?？:：;；、()（）[]【】{}《》<>\"'“”‘’")


def tokenize(text: str) -> list[str]:
    """Tokenize Chinese text with characters/bigrams plus latin word runs."""

    normalized = unicodedata.normalize("NFKC", text).lower()
    tokens: list[str] = []
    occupied: list[tuple[int, int]] = []
    for match in _CJK_RUN.finditer(normalized):
        run = match.group(0)
        occupied.append(match.span())
        tokens.extend(run)
        tokens.extend(run[i : i + 2] for i in range(len(run) - 1))
        tokens.extend(run[i : i + 3] for i in range(len(run) - 2))
    for match in _WORD_RUN.finditer(normalized):
        if any(start < match.end() and match.start() < end for start, end in occupied):
            continue
        tokens.append(match.group(0))
    return tokens


def theory_aliases(name: str) -> set[str]:
    normalized = unicodedata.normalize("NFKC", name).strip().lower()
    aliases = {normalized} if normalized else set()
    for suffix in _THEORY_SUFFIXES:
        if normalized.endswith(suffix):
            shortened = normalized[: -len(suffix)].strip()
            if len(shortened) >= 4:
                aliases.add(shortened)
    return aliases


@dataclass(frozen=True)
class SearchHit:
    score: float
    chunk: dict[str, Any]


class BM25Retriever:
    """In-memory BM25 index; suitable for the current ~13k chunk catalogue."""

    def __init__(self, chunks: list[dict[str, Any]], k1: float = 1.5, b: float = 0.75):
        if not chunks:
            raise ValueError("The chunk file is empty.")
        self.chunks = chunks
        self.theory_names = frozenset(
            str(item.get("theory_name", "")).strip()
            for item in chunks
            if item.get("theory_name")
        )
        self._theory_aliases_by_name = {
            name: theory_aliases(name) for name in self.theory_names
        }
        self.theory_aliases = frozenset(
            alias
            for aliases in self._theory_aliases_by_name.values()
            for alias in aliases
        )
        self.k1 = k1
        self.b = b
        self._term_frequencies = [Counter(tokenize(item.get("text", ""))) for item in chunks]
        self._lengths = [sum(counter.values()) for counter in self._term_frequencies]
        self._average_length = sum(self._lengths) / max(len(self._lengths), 1)
        document_frequency: Counter[str] = Counter()
        for counter in self._term_frequencies:
            document_frequency.update(counter.keys())
        total = len(chunks)
        self._idf = {
            term: math.log(1.0 + (total - frequency + 0.5) / (frequency + 0.5))
            for term, frequency in document_frequency.items()
        }
        self._unknown_idf = math.log(1.0 + (total + 0.5) / 0.5)

    @classmethod
    def from_jsonl(cls, path: Path) -> "BM25Retriever":
        chunks: list[dict[str, Any]] = []
        with path.open("r", encoding="utf-8") as handle:
            for line_number, line in enumerate(handle, start=1):
                if not line.strip():
                    continue
                try:
                    item = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"Invalid JSONL at line {line_number}: {exc}") from exc
                if not item.get("text"):
                    continue
                chunks.append(item)
        return cls(chunks)

    def _score(self, query_tokens: list[str], index: int) -> float:
        frequencies = self._term_frequencies[index]
        length = self._lengths[index]
        score = 0.0
        normalization = 1.0 - self.b + self.b * length / max(self._average_length, 1.0)
        for term in query_tokens:
            frequency = frequencies.get(term, 0)
            if not frequency:
                continue
            numerator = frequency * (self.k1 + 1.0)
            denominator = frequency + self.k1 * normalization
            score += self._idf.get(term, 0.0) * numerator / denominator
        return score

    def has_theory_signal(self, query: str) -> bool:
        return bool(self.matching_theory_names(query))

    @staticmethod
    def _explicit_alias_match(query: str, alias: str) -> bool:
        if not alias:
            return False
        if _ASCII_ALIAS.fullmatch(alias):
            pattern = rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])"
            return bool(re.search(pattern, query, re.IGNORECASE))

        start = query.find(alias)
        while start >= 0:
            end = start + len(alias)
            if end == len(query) or query[end] in _BOUNDARY_CHARS:
                return True
            remainder = query[end:]
            if any(remainder.startswith(suffix) for suffix in _THEORY_QUERY_SUFFIXES):
                return True
            start = query.find(alias, start + 1)
        return False

    def matching_theory_names(self, query: str) -> set[str]:
        normalized = unicodedata.normalize("NFKC", query).strip().lower()
        return {
            name
            for name, aliases in self._theory_aliases_by_name.items()
            if any(self._explicit_alias_match(normalized, alias) for alias in aliases)
        }

    def query_coverage(self, query: str, hit: SearchHit) -> float:
        """Return IDF-weighted 2/3-gram coverage of the query in a hit."""

        query_terms = []
        for term in dict.fromkeys(tokenize(query)):
            if _CJK_RUN.fullmatch(term):
                if len(term) not in {2, 3}:
                    continue
            elif len(term) < 2:
                continue
            query_terms.append(term)
        if not query_terms:
            return 0.0

        document_terms = set(tokenize(str(hit.chunk.get("text", ""))))
        weights = [self._idf.get(term, self._unknown_idf) for term in query_terms]
        total_weight = sum(weights)
        if not total_weight:
            return 0.0
        matched_weight = sum(
            weight
            for term, weight in zip(query_terms, weights)
            if term in document_terms
        )
        return matched_weight / total_weight

    def _metadata_boost(
        self,
        query: str,
        chunk: dict[str, Any],
        matching_theories: set[str],
    ) -> float:
        normalized_query = unicodedata.normalize("NFKC", query).lower()
        theory = str(chunk.get("theory_name", ""))
        boost = 0.0
        if theory in matching_theories:
            boost += 12.0

        source_type = str(chunk.get("source_type", ""))
        application_words = ("\u8bfe\u5802", "\u6559\u5b66", "\u6848\u4f8b", "\u5982\u4f55", "\u8bbe\u8ba1", "\u6539\u8fdb")
        definition_words = ("\u4ec0\u4e48", "\u5b9a\u4e49", "\u5185\u6db5", "\u6838\u5fc3", "\u7406\u8bba\u89e3\u91ca", "\u533a\u522b")
        if any(word in normalized_query for word in application_words):
            if source_type == "\u8bfe\u5802\u8303\u672c":
                boost += 2.5
            elif source_type == "\u6559\u7406\u8303\u5f0f\u6c47\u5178":
                boost += 2.0
        if any(word in normalized_query for word in definition_words) and source_type == "\u7406\u8bba\u5b8c\u6210\u89e3\u91ca":
            boost += 2.5
        return boost

    def search(
        self,
        query: str,
        top_k: int = 8,
        category: str | None = None,
        source_type: str | None = None,
        min_score: float = 0.0,
    ) -> list[SearchHit]:
        if not query.strip():
            return []
        # Repeated query terms must not inflate the relevance threshold.
        query_tokens = list(dict.fromkeys(tokenize(query)))
        matching_theories = self.matching_theory_names(query)
        scored: list[SearchHit] = []
        for index, chunk in enumerate(self.chunks):
            if category and category not in chunk.get("category_path", []):
                continue
            if source_type and chunk.get("source_type") != source_type:
                continue
            score = self._score(query_tokens, index)
            score += self._metadata_boost(query, chunk, matching_theories)
            if score > 0:
                scored.append(SearchHit(score=score, chunk=chunk))
        scored.sort(key=lambda hit: hit.score, reverse=True)

        # Avoid filling the prompt with ten overlapping windows from one record.
        selected: list[SearchHit] = []
        per_record: Counter[tuple[str, str]] = Counter()
        for hit in scored:
            if hit.score < min_score:
                break
            chunk = hit.chunk
            key = (str(chunk.get("theory_name", "")), str(chunk.get("source_type", "")))
            if per_record[key] >= 2:
                continue
            selected.append(hit)
            per_record[key] += 1
            if len(selected) >= top_k:
                break
        return selected


def load_retriever(path: Path) -> BM25Retriever:
    return BM25Retriever.from_jsonl(path)
