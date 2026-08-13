from __future__ import annotations

import hashlib
import os
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable, Mapping


MAX_IMAGE_BYTES = 8 * 1024 * 1024
MIME_SUFFIXES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _timestamp(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")


@contextmanager
def _database(path: Path):
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _valid_magic(data: bytes, mime_type: str) -> bool:
    if mime_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if mime_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff") and data.endswith(b"\xff\xd9")
    if mime_type == "image/webp":
        return len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False


class VisionAssetStore:
    """Private local image intake with explicit retention and metadata-only responses."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root).expanduser().absolute()
        self.files = self.root / "files"
        self.files.mkdir(parents=True, exist_ok=True)
        self.database = self.root / "assets.sqlite3"
        with _database(self.database) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS vision_assets (
                    asset_id TEXT PRIMARY KEY,
                    label TEXT NOT NULL,
                    file_path TEXT NOT NULL UNIQUE,
                    mime_type TEXT NOT NULL,
                    byte_count INTEGER NOT NULL,
                    sha256 TEXT NOT NULL,
                    data_class TEXT NOT NULL,
                    retention TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT,
                    status TEXT NOT NULL
                )
                """
            )

    @staticmethod
    def _public(row: sqlite3.Row) -> dict[str, Any]:
        return {
            "asset_id": row["asset_id"],
            "label": row["label"],
            "mime_type": row["mime_type"],
            "byte_count": int(row["byte_count"]),
            "sha256": row["sha256"],
            "data_class": row["data_class"],
            "retention": row["retention"],
            "created_at": row["created_at"],
            "expires_at": row["expires_at"],
            "status": row["status"],
        }

    def purge_expired(self) -> int:
        current = _timestamp(_now())
        with _database(self.database) as connection:
            rows = connection.execute(
                "SELECT asset_id, file_path FROM vision_assets "
                "WHERE status='active' AND expires_at IS NOT NULL AND expires_at<=?",
                (current,),
            ).fetchall()
            for row in rows:
                self._delete_file(Path(row["file_path"]))
                connection.execute(
                    "UPDATE vision_assets SET status='expired' WHERE asset_id=?",
                    (row["asset_id"],),
                )
        return len(rows)

    def add(
        self,
        *,
        label: str,
        data: bytes,
        mime_type: str,
        data_class: str,
        retention: str,
    ) -> Mapping[str, Any]:
        selected_label = str(label or "image").strip()[:120] or "image"
        selected_mime = str(mime_type or "").split(";", 1)[0].strip().lower()
        suffix = MIME_SUFFIXES.get(selected_mime)
        if suffix is None or not _valid_magic(data, selected_mime):
            raise ValueError("image format or file signature is not supported")
        if not data or len(data) > MAX_IMAGE_BYTES:
            raise ValueError("image must be between 1 byte and 8 MB")
        if data_class not in {"public", "internal", "private_business", "customer_restricted"}:
            raise ValueError("image data class is invalid")
        if retention not in {"session", "24_hours", "manual"}:
            raise ValueError("image retention is invalid")
        asset_id = str(uuid.uuid4())
        file_path = self.files / f"{asset_id}{suffix}"
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
        descriptor = os.open(file_path, flags, 0o600)
        try:
            with os.fdopen(descriptor, "wb") as handle:
                handle.write(data)
        except Exception:
            file_path.unlink(missing_ok=True)
            raise
        created = _now()
        expires = created + timedelta(hours=24) if retention == "24_hours" else None
        digest = hashlib.sha256(data).hexdigest()
        try:
            with _database(self.database) as connection:
                connection.execute(
                    "INSERT INTO vision_assets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')",
                    (
                        asset_id,
                        selected_label,
                        os.fspath(file_path),
                        selected_mime,
                        len(data),
                        digest,
                        data_class,
                        retention,
                        _timestamp(created),
                        _timestamp(expires) if expires else None,
                    ),
                )
        except Exception:
            file_path.unlink(missing_ok=True)
            raise
        return self.get(asset_id)

    def get(self, asset_id: str) -> Mapping[str, Any]:
        self.purge_expired()
        with _database(self.database) as connection:
            row = connection.execute(
                "SELECT * FROM vision_assets WHERE asset_id=?", (asset_id,)
            ).fetchone()
        if row is None:
            raise ValueError("vision asset was not found")
        return self._public(row)

    def resolve_many(self, asset_ids: Iterable[str]) -> list[tuple[Mapping[str, Any], Path]]:
        selected = tuple(dict.fromkeys(str(item) for item in asset_ids))[:3]
        resolved: list[tuple[Mapping[str, Any], Path]] = []
        self.purge_expired()
        with _database(self.database) as connection:
            for asset_id in selected:
                row = connection.execute(
                    "SELECT * FROM vision_assets WHERE asset_id=? AND status='active'",
                    (asset_id,),
                ).fetchone()
                if row is None:
                    raise ValueError("vision asset is not active")
                path = Path(row["file_path"])
                if path.parent.resolve() != self.files.resolve() or not path.is_file() or path.is_symlink():
                    raise ValueError("vision asset file is unavailable")
                data = path.read_bytes()
                if hashlib.sha256(data).hexdigest() != row["sha256"]:
                    raise ValueError("vision asset integrity check failed")
                resolved.append((self._public(row), path))
        return resolved

    def release_session_assets(self, asset_ids: Iterable[str]) -> None:
        selected = tuple(dict.fromkeys(str(item) for item in asset_ids))[:3]
        with _database(self.database) as connection:
            for asset_id in selected:
                row = connection.execute(
                    "SELECT file_path, retention, status FROM vision_assets WHERE asset_id=?",
                    (asset_id,),
                ).fetchone()
                if row is None or row["retention"] != "session" or row["status"] != "active":
                    continue
                self._delete_file(Path(row["file_path"]))
                connection.execute(
                    "UPDATE vision_assets SET status='released' WHERE asset_id=?", (asset_id,)
                )

    def list(self, limit: int = 40) -> list[Mapping[str, Any]]:
        self.purge_expired()
        with _database(self.database) as connection:
            rows = connection.execute(
                "SELECT * FROM vision_assets ORDER BY created_at DESC LIMIT ?",
                (max(1, min(int(limit), 100)),),
            ).fetchall()
        return [self._public(row) for row in rows]

    def _delete_file(self, path: Path) -> None:
        try:
            if path.parent.resolve() == self.files.resolve():
                path.unlink(missing_ok=True)
        except OSError:
            pass
