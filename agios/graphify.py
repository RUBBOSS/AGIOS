from __future__ import annotations

import base64
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


MAX_GRAPH_JSON_BYTES = 50 * 1024 * 1024
MAX_GRAPH_HTML_BYTES = 50 * 1024 * 1024
_COMMIT = re.compile(r"^[0-9a-f]{7,40}$")
_NONCE = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
_SCRIPT_OPEN = re.compile(r"<script\b[^>]*>", re.IGNORECASE)
_SCRIPT_CLOSE = re.compile(r"</script\s*>", re.IGNORECASE)
_SCRIPT_BLOCK = re.compile(r"<script\b[^>]*>(.*?)</script\s*>", re.IGNORECASE | re.DOTALL)
_STYLE_OPEN = re.compile(r"<style\b[^>]*>", re.IGNORECASE)
_STYLE_CLOSE = re.compile(r"</style\s*>", re.IGNORECASE)
_QUOTED_ATTRIBUTE = re.compile(
    r"\s+([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(?:\"([^\"]*)\"|'([^']*)')",
    re.DOTALL,
)
_VIS_NETWORK_SRC = "https://unpkg.com/vis-network@9.1.6/standalone/umd/vis-network.min.js"
_VIS_NETWORK_INTEGRITY = "sha384-Ux6phic9PEHJ38YtrijhkzyJ8yQlH8i/+buBR8s3mAZOJrP1gwyvAcIYl3GWtpX1"
# Deterministic <style> blocks injected by the SRI-pinned vis-network 9.1.6 bundle.
_VIS_NETWORK_STYLE_ELEMENT_HASHES = tuple(
    f"'sha256-{digest}'"
    for digest in (
        "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=",
        "4cgFR0//m8/eHo2G/esYsuZetUHlzCUWYM59sfgE9zY=",
        "IY7YKNHjbzQ1NfAKrBZvBZohgXMtxrqB9PaqhAaT3vg=",
        "OutIf5hnp68ctx4ThtV5J02g5HTJ5bbu/hkNfqVXWWo=",
        "QE7TOEDW7YIlMzvUUnm8boDWeNBN7PBbaaYJjnp34WI=",
        "QuPewnJYr+SnQiTnCNHFBw99ExTsz9f8w5320PimEPw=",
        "gGUn/VMBXCeWm86qX/pOf+4ZDSbe0JcaXXb4rJjw1mA=",
        "uepMTym1NwItBa/XV6ef6fQobLL0A0CNVDM5km5L+nQ=",
    )
)

_MOBILE_GRAPH_STYLE = """
<style id="hermes-mobile-graphify">
@media (max-width: 720px) {
  body { position: relative; display: block; }
  #graph { width: 100vw !important; height: 100vh !important; }
  #sidebar {
    position: absolute;
    z-index: 10;
    left: 8px;
    right: 8px;
    bottom: 8px;
    width: auto;
    max-height: 124px;
    display: block;
    overflow: auto;
    border: 1px solid #2a2a4e;
    border-radius: 8px;
    background: rgba(26, 26, 46, .96);
  }
  #search-wrap, #legend-wrap { display: none; }
  #info-panel { min-height: 0; padding: 10px 12px; border-bottom: 0; }
  #info-panel h3 { margin-bottom: 5px; font-size: 11px; }
  #info-content { font-size: 12px; line-height: 1.35; }
}
</style>
"""


def _strict_tag_attributes(tag: str, name: str) -> dict[str, str] | None:
    match = re.fullmatch(
        rf"<{re.escape(name)}\b(?P<attributes>[^>]*)>",
        tag,
        re.IGNORECASE | re.DOTALL,
    )
    if match is None:
        return None
    raw = match.group("attributes")
    attributes: dict[str, str] = {}
    position = 0
    while raw[position:].strip():
        attribute = _QUOTED_ATTRIBUTE.match(raw, position)
        if attribute is None:
            return None
        key = attribute.group(1).lower()
        if key in attributes:
            return None
        attributes[key] = (
            attribute.group(2)
            if attribute.group(2) is not None
            else attribute.group(3)
        )
        position = attribute.end()
    return attributes


class GraphifyArtifacts:
    """Read-only access to a fixed local Graphify output directory."""

    def __init__(self, root: str | Path):
        self.root = Path(root).expanduser().resolve()

    def _artifact(self, name: str, *, max_bytes: int) -> Path | None:
        candidate = self.root / name
        if candidate.is_symlink() or not candidate.is_file():
            return None
        try:
            resolved = candidate.resolve(strict=True)
            resolved.relative_to(self.root)
        except (OSError, ValueError):
            return None
        try:
            size = resolved.stat().st_size
        except OSError:
            return None
        if size <= 0 or size > max_bytes:
            return None
        return resolved

    def _git_head(self) -> str | None:
        repository = self.root.parent
        git_marker = repository / ".git"
        git_dir = git_marker
        if git_marker.is_file() and not git_marker.is_symlink():
            try:
                marker = git_marker.read_text(encoding="utf-8").strip()
            except OSError:
                return None
            if not marker.startswith("gitdir:"):
                return None
            git_dir = (repository / marker.removeprefix("gitdir:").strip()).resolve()
        if not git_dir.is_dir() or git_dir.is_symlink():
            return None
        try:
            head = (git_dir / "HEAD").read_text(encoding="utf-8").strip()
        except OSError:
            return None
        if not head.startswith("ref:"):
            return head.lower() if _COMMIT.fullmatch(head.lower()) else None
        ref = head.removeprefix("ref:").strip()
        ref_path = git_dir / ref
        try:
            value = ref_path.read_text(encoding="utf-8").strip().lower()
        except OSError:
            value = ""
            try:
                for line in (git_dir / "packed-refs").read_text(encoding="utf-8").splitlines():
                    if line and not line.startswith(("#", "^")):
                        commit, packed_ref = line.split(" ", 1)
                        if packed_ref == ref:
                            value = commit.lower()
                            break
            except (OSError, ValueError):
                return None
        return value if _COMMIT.fullmatch(value) else None

    def status(self) -> dict[str, Any]:
        unavailable: dict[str, Any] = {
            "schema_version": 1,
            "status": "unavailable",
            "project": self.root.parent.name or "HermesOS",
            "nodes": 0,
            "links": 0,
            "communities": 0,
            "built_at_commit": None,
            "current_commit": None,
            "freshness": "unknown",
            "generated_at": None,
            "view_url": None,
            "source": "local Graphify artifacts",
            "reason": "Build the local HermesOS graph to open this view.",
        }
        graph_path = self._artifact("graph.json", max_bytes=MAX_GRAPH_JSON_BYTES)
        html_path = self._artifact("graph.html", max_bytes=MAX_GRAPH_HTML_BYTES)
        if graph_path is None or html_path is None:
            return unavailable
        try:
            payload = json.loads(graph_path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            unavailable["reason"] = "The local Graphify artifacts are invalid; rebuild the graph."
            return unavailable
        if not isinstance(payload, dict):
            unavailable["reason"] = "The local Graphify artifacts are invalid; rebuild the graph."
            return unavailable
        nodes = payload.get("nodes")
        links = payload.get("links")
        if not isinstance(nodes, list) or not isinstance(links, list):
            unavailable["reason"] = "The local Graphify artifacts are invalid; rebuild the graph."
            return unavailable
        communities = {
            node.get("community")
            for node in nodes
            if isinstance(node, dict) and node.get("community") is not None
        }
        raw_built = str(payload.get("built_at_commit") or "").lower()
        built = raw_built if _COMMIT.fullmatch(raw_built) else None
        current = self._git_head()
        freshness = "unknown"
        if built and current:
            freshness = "current" if current.startswith(built) or built.startswith(current) else "stale"
        generated_at = datetime.fromtimestamp(
            html_path.stat().st_mtime, tz=timezone.utc
        ).isoformat()
        return {
            "schema_version": 1,
            "status": "ready",
            "project": self.root.parent.name or "HermesOS",
            "nodes": len(nodes),
            "links": len(links),
            "communities": len(communities),
            "built_at_commit": built,
            "current_commit": current[:7] if current else None,
            "freshness": freshness,
            "generated_at": generated_at,
            "view_url": "/graphify/view",
            "source": "local Graphify artifacts",
            "reason": None,
        }

    def view_path(self) -> Path:
        graph_path = self._artifact("graph.json", max_bytes=MAX_GRAPH_JSON_BYTES)
        html_path = self._artifact("graph.html", max_bytes=MAX_GRAPH_HTML_BYTES)
        if graph_path is None or html_path is None:
            raise FileNotFoundError("Graphify artifacts unavailable")
        return html_path

    def view_html(self, nonce: str) -> str:
        if not _NONCE.fullmatch(nonce):
            raise FileNotFoundError("Graphify view unavailable")
        html_path = self.view_path()
        try:
            html = html_path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            raise FileNotFoundError("Graphify view unavailable") from exc
        scripts = _SCRIPT_OPEN.findall(html)
        script_bodies = _SCRIPT_BLOCK.findall(html)
        styles = _STYLE_OPEN.findall(html)
        script_attributes = [_strict_tag_attributes(tag, "script") for tag in scripts]
        style_attributes = [_strict_tag_attributes(tag, "style") for tag in styles]
        if (
            len(scripts) != 3
            or len(_SCRIPT_CLOSE.findall(html)) != 3
            or len(script_bodies) != 3
            or len(styles) != 1
            or len(_STYLE_CLOSE.findall(html)) != 1
            or any(attributes is None for attributes in (*script_attributes, *style_attributes))
            or script_attributes[0]
            != {
                "src": _VIS_NETWORK_SRC,
                "integrity": _VIS_NETWORK_INTEGRITY,
                "crossorigin": "anonymous",
            }
            or any(script_attributes[1:])
            or style_attributes[0] != {}
            or not script_bodies[2].lstrip().startswith("// Render hyperedges as shaded regions")
            or "const hyperedges = [" not in script_bodies[2]
            or "network.on('afterDrawing'" not in script_bodies[2]
        ):
            raise FileNotFoundError("Graphify view unavailable")
        marker = html.lower().rfind("</head>")
        if marker < 0:
            raise FileNotFoundError("Graphify view unavailable")
        document = f"{html[:marker]}{_MOBILE_GRAPH_STYLE}{html[marker:]}"
        document = re.sub(
            r"<script\b", f'<script nonce="{nonce}"', document, flags=re.IGNORECASE
        )
        return re.sub(
            r"<style\b", f'<style nonce="{nonce}"', document, flags=re.IGNORECASE
        )

    def style_attribute_hashes(self) -> tuple[str, ...]:
        html_path = self.view_path()
        try:
            html = html_path.read_text(encoding="utf-8")
        except (OSError, UnicodeError) as exc:
            raise FileNotFoundError("Graphify view unavailable") from exc
        colors = set(
            re.findall(r'"background"\s*:\s*"(#[0-9A-Fa-f]{6})"', html)
        )
        values = {"margin-top:8px;color:#aaa;font-size:11px"}
        values.update(f"background:{color}" for color in colors)
        values.update(f"border-left-color:{color}" for color in colors)
        return tuple(
            "'sha256-"
            + base64.b64encode(hashlib.sha256(value.encode("utf-8")).digest()).decode("ascii")
            + "'"
            for value in sorted(values)
        )

    @staticmethod
    def style_element_hashes() -> tuple[str, ...]:
        return _VIS_NETWORK_STYLE_ELEMENT_HASHES
