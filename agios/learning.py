"""Knowledge intake: deterministic /learn-style indexed brain files.

A document is read once and reduced to a small index: chunks (the real
content, split deterministically), a glossary of the most frequent
technical terms, and a cheat sheet of opening statements. Nothing is
summarized by a model, so nothing can be hallucinated. The full source
text stays local in state_dir/learned/ and is digest-addressed.
"""

from __future__ import annotations

import hashlib
import json
import re
import sqlite3
import uuid
from pathlib import Path
from typing import Any, Iterable, Mapping

from .contracts import canonical_json, utc_now

SCHEMA_VERSION = 1
MAX_TEXT_BYTES = 200_000
MAX_CHUNKS = 40
CHUNK_LIMIT = 2000
GLOSSARY_LIMIT = 12


class LearningStoreError(RuntimeError):
    pass


def _database(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA journal_mode=WAL")
    return connection


def _chunk_text(text: str) -> list[str]:
    """Deterministic split: headings and blank-line paragraphs, bounded."""

    normalized = str(text or "").replace("\r\n", "\n").strip()
    if not normalized:
        return []
    sections = re.split(r"\n\s*\n", normalized)
    chunks: list[str] = []
    for section in sections:
        compact = " ".join(section.split())
        while len(compact) > CHUNK_LIMIT:
            chunks.append(compact[:CHUNK_LIMIT])
            compact = compact[CHUNK_LIMIT:]
        if compact:
            chunks.append(compact)
    return chunks[:MAX_CHUNKS]


def _glossary(chunks: list[str]) -> list[str]:
    """Frequent 2-3 word capitalized technical terms, deterministic."""

    counts: dict[str, int] = {}
    for chunk in chunks:
        for match in re.findall(r"\b[A-Z][A-Za-z0-9-]+(?:\s+[A-Z][A-Za-z0-9-]+){1,2}\b", chunk):
            term = re.sub(r"\s+", " ", match).strip()
            if len(term) < 4:
                continue
            counts[term] = counts.get(term, 0) + 1
    ranked = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return [term for term, _ in ranked[:GLOSSARY_LIMIT]]


def _cheat_sheet(chunks: list[str]) -> str:
    """First sentence of the first three chunks; raw, never paraphrased."""

    lines: list[str] = []
    for chunk in chunks[:3]:
        sentence = re.split(r"(?<=[.!?])\s+", chunk, maxsplit=1)[0]
        lines.append(sentence[:300])
    return " ".join(lines)[:900]


class LearningStore:
    def __init__(self, state_dir: str | Path) -> None:
        self.root = Path(state_dir)
        self.root.mkdir(parents=True, exist_ok=True)
        self.path = self.root / "learned.sqlite3"
        self.texts = self.root / "learned"
        self.texts.mkdir(parents=True, exist_ok=True)
        connection = _database(self.path)
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS learned_docs(
                    doc_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    source_name TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    text_digest TEXT NOT NULL,
                    chunk_count INTEGER NOT NULL,
                    glossary_json TEXT NOT NULL,
                    cheat_sheet TEXT NOT NULL
                )
                """
            )
            connection.commit()
        finally:
            connection.close()

    def add(self, *, title: str, source_name: str, text: str) -> Mapping[str, Any]:
        selected_title = re.sub(r"\s+", " ", str(title or "").strip())[:160]
        if not selected_title:
            raise LearningStoreError("title is required")
        selected_source = re.sub(r"\s+", " ", str(source_name or "pasted").strip())[:160]
        raw = str(text or "")
        if not raw.strip():
            raise LearningStoreError("document text is required")
        if len(raw.encode("utf-8")) > MAX_TEXT_BYTES:
            raise LearningStoreError("document exceeds the 200 KB intake limit")

        chunks = _chunk_text(raw)
        if not chunks:
            raise LearningStoreError("no readable content found in the document")
        glossary = _glossary(chunks)
        cheat_sheet = _cheat_sheet(chunks)
        digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()

        existing = self.find_by_digest(digest)
        if existing:
            return existing

        doc_id = str(uuid.uuid4())
        created_at = utc_now()
        (self.texts / f"{doc_id}.txt").write_text(raw, encoding="utf-8")
        connection = _database(self.path)
        try:
            connection.execute(
                """
                INSERT INTO learned_docs(
                    doc_id, title, source_name, created_at, text_digest,
                    chunk_count, glossary_json, cheat_sheet
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc_id,
                    selected_title,
                    selected_source,
                    created_at,
                    digest,
                    len(chunks),
                    json.dumps(glossary),
                    cheat_sheet,
                ),
            )
            connection.commit()
        finally:
            connection.close()
        return self.get(doc_id)

    def find_by_digest(self, digest: str) -> Mapping[str, Any] | None:
        connection = _database(self.path)
        try:
            row = connection.execute(
                "SELECT * FROM learned_docs WHERE text_digest=?", (digest,)
            ).fetchone()
        finally:
            connection.close()
        return dict(row) if row else None

    def get(self, doc_id: str) -> Mapping[str, Any]:
        connection = _database(self.path)
        try:
            row = connection.execute(
                "SELECT * FROM learned_docs WHERE doc_id=?", (doc_id,)
            ).fetchone()
        finally:
            connection.close()
        if row is None:
            raise LearningStoreError("learned document was not found")
        item = dict(row)
        item["glossary"] = json.loads(item.pop("glossary_json"))
        text_path = self.texts / f"{doc_id}.txt"
        if text_path.is_file():
            item["chunks"] = _chunk_text(text_path.read_text(encoding="utf-8"))
        else:
            item["chunks"] = []
        return item

    def list(self, limit: int = 40) -> list[Mapping[str, Any]]:
        bounded = max(1, min(int(limit), 200))
        connection = _database(self.path)
        try:
            rows = connection.execute(
                """
                SELECT doc_id, title, source_name, created_at, text_digest,
                       chunk_count, glossary_json, cheat_sheet
                FROM learned_docs ORDER BY created_at DESC LIMIT ?
                """,
                (bounded,),
            ).fetchall()
        finally:
            connection.close()
        items: list[Mapping[str, Any]] = []
        for row in rows:
            item = dict(row)
            item["glossary"] = json.loads(item.pop("glossary_json"))
            items.append(item)
        return items

    def summary(self) -> Mapping[str, Any]:
        connection = _database(self.path)
        try:
            row = connection.execute(
                "SELECT COUNT(*) AS total, COALESCE(SUM(chunk_count), 0) AS chunks FROM learned_docs"
            ).fetchone()
        finally:
            connection.close()
        return {
            "schema_version": SCHEMA_VERSION,
            "status": "ready",
            "documents": int(row["total"]),
            "indexed_chunks": int(row["chunks"]),
        }


def build_brain_file(doc: Mapping[str, Any]) -> Mapping[str, Any]:
    """The retrieval-facing brain file: index first, content on demand."""

    return {
        "schema_version": SCHEMA_VERSION,
        "doc_id": str(doc["doc_id"]),
        "title": str(doc["title"]),
        "source": str(doc["source_name"]),
        "created_at": str(doc["created_at"]),
        "index": {
            "chunk_count": int(doc["chunk_count"]),
            "glossary": [str(item)[:80] for item in doc.get("glossary", [])][:GLOSSARY_LIMIT],
            "cheat_sheet": str(doc.get("cheat_sheet") or "")[:900],
        },
        "chunks": [str(chunk)[:CHUNK_LIMIT] for chunk in doc.get("chunks", [])][:MAX_CHUNKS],
        "privacy": {
            "synthetic": False,
            "source_preserved": True,
            "note": "Deterministic index only; no model-generated summary exists.",
        },
    }
