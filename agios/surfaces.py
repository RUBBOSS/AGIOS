"""Registry-driven runtime surfaces for the AGIOS command center.

A *surface* is a bounded window onto a real, existing application: a web
panel (embedded), a live terminal (real PTY), or a native app launcher.
Every surface is declared in the authoritative AGIOS registry; the server
never accepts commands or URLs from the browser.  Deny-by-default: unknown
kinds, non-loopback URLs, and missing command definitions are rejected at
configuration load.

Security invariants:

- Web surfaces may only point at loopback hosts.
- Terminal surfaces run the registry-declared command through a real PTY
  (winpty on Windows, stdlib pty elsewhere); input/resize come from the
  local websocket only.
- Launch actions spawn the registry-declared command detached; nothing
  client-supplied is ever executed.
"""

from __future__ import annotations

import asyncio
import os
import shutil
import socket
import subprocess
import sys
import urllib.parse
from dataclasses import dataclass
from typing import Any, Mapping

ALLOWED_KINDS = frozenset({"web", "terminal", "native"})
LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
MAX_SURFACES = 12
MAX_COMMAND_ARGS = 8
PROBE_TIMEOUT_SECONDS = 0.8
RESOLVE_BINARIES = frozenset(
    {"hermes", "codex", "opencode", "cmd.exe", "powershell.exe"}
)
# Hermes desktop-internal variables. When the AGIOS server is launched from a
# shell inherited from the Hermes desktop app, these poison every child:
# `hermes dashboard` then serves the desktop bundle ("Desktop IPC bridge is
# unavailable") or exits. Surfaces must never inherit them.
SCRUBBED_ENV_VARS = frozenset({"HERMES_SERVE_HEADLESS", "HERMES_WEB_DIST"})


def child_environment() -> dict[str, str]:
    """Return the server environment minus desktop-internal bridge vars."""
    environment = os.environ.copy()
    for key in SCRUBBED_ENV_VARS:
        environment.pop(key, None)
    return environment


class SurfaceConfigError(ValueError):
    """Raised when a surface entry violates the deny-by-default contract."""


def validate_surface(entry: Any, identifier: str) -> dict[str, Any]:
    """Validate one surface entry and return its normalized form."""
    if not isinstance(entry, Mapping):
        raise SurfaceConfigError(f"surface {identifier} must be an object")
    surface_id = entry.get("id")
    name = entry.get("name")
    kind = entry.get("kind")
    if not isinstance(surface_id, str) or not surface_id.strip():
        raise SurfaceConfigError(f"surface {identifier} requires a non-empty id")
    if not isinstance(name, str) or not name.strip():
        raise SurfaceConfigError(f"surface {surface_id} requires a non-empty name")
    if kind not in ALLOWED_KINDS:
        raise SurfaceConfigError(f"surface {surface_id} has an unknown kind")

    normalized: dict[str, Any] = {"id": surface_id, "name": name, "kind": kind}

    def command_field(field: str) -> list[str]:
        value = entry.get(field)
        if not isinstance(value, list) or not value or len(value) > MAX_COMMAND_ARGS:
            raise SurfaceConfigError(f"surface {surface_id} {field} must be a bounded array")
        parts = [str(item).strip() for item in value]
        if any(not part for part in parts):
            raise SurfaceConfigError(f"surface {surface_id} {field} must not contain empty items")
        return parts

    if kind == "web":
        url = entry.get("url")
        if not isinstance(url, str):
            raise SurfaceConfigError(f"surface {surface_id} requires a loopback url")
        try:
            parsed = urllib.parse.urlparse(url)
        except ValueError as exc:
            raise SurfaceConfigError(f"surface {surface_id} url is invalid") from exc
        if parsed.scheme != "http" or parsed.hostname not in LOOPBACK_HOSTS:
            raise SurfaceConfigError(f"surface {surface_id} url must be http on loopback")
        normalized["url"] = url
        if entry.get("launch") is not None:
            normalized["launch"] = command_field("launch")
    elif kind == "terminal":
        normalized["command"] = command_field("command")
    else:  # native
        normalized["launch"] = command_field("launch")

    cwd = entry.get("cwd")
    if cwd is not None:
        if not isinstance(cwd, str) or not cwd.strip():
            raise SurfaceConfigError(f"surface {surface_id} cwd must be a non-empty string")
        normalized["cwd"] = cwd
    return normalized


def validate_surfaces(raw_surfaces: Any) -> list[dict[str, Any]]:
    if raw_surfaces is None:
        return []
    if not isinstance(raw_surfaces, list) or len(raw_surfaces) > MAX_SURFACES:
        raise SurfaceConfigError("surfaces must be a bounded array")
    seen: set[str] = set()
    normalized: list[dict[str, Any]] = []
    for index, entry in enumerate(raw_surfaces):
        surface = validate_surface(entry, f"[{index}]")
        if surface["id"] in seen:
            raise SurfaceConfigError(f"duplicate surface id {surface['id']}")
        seen.add(surface["id"])
        normalized.append(surface)
    return normalized


def _resolve_binary(token: str) -> str | None:
    if token in RESOLVE_BINARIES:
        resolved = shutil.which(token)
        if resolved:
            return resolved
    return None


def _web_probe(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    port = parsed.port or 80
    try:
        with socket.create_connection((parsed.hostname, port), timeout=PROBE_TIMEOUT_SECONDS):
            return "live"
    except OSError:
        return "unreachable"


def _terminal_probe(command: list[str]) -> str:
    binary = _resolve_binary(command[0])
    if binary:
        return "available"
    if shutil.which(command[0]):
        return "available"
    return "missing"


def probe_surface(surface: dict[str, Any]) -> dict[str, Any]:
    """Return a bounded status snapshot for one surface."""
    kind = surface["kind"]
    status = "unknown"
    if kind == "web":
        status = _web_probe(surface["url"])
    elif kind == "terminal":
        status = _terminal_probe(surface["command"])
    else:
        status = _terminal_probe(surface.get("launch", []))
    result = {"id": surface["id"], "name": surface["name"], "kind": kind, "status": status}
    if kind == "web":
        result["url"] = surface["url"]
    return result


def collect_surfaces(surfaces: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [probe_surface(surface) for surface in surfaces]


def launch_surface(surface: dict[str, Any]) -> dict[str, Any]:
    """Spawn a registry-declared launch command, fully detached."""
    command = surface.get("launch")
    if not command:
        raise ValueError(f"surface {surface['id']} has no launch command")
    binary = _resolve_binary(command[0]) or shutil.which(command[0])
    if not binary:
        raise FileNotFoundError(f"launch binary not found for surface {surface['id']}")
    cwd = surface.get("cwd") or os.path.expanduser("~")
    if os.name == "nt":
        flags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        flags = 0
    subprocess.Popen(
        [binary, *command[1:]],
        cwd=cwd,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        close_fds=True,
        env=child_environment(),
        creationflags=flags if os.name == "nt" else 0,
        start_new_session=os.name != "nt",
    )
    return {"id": surface["id"], "launched": True}


def spawn_surface_pty(surface: dict[str, Any], columns: int = 100, rows: int = 30):
    """Open a real PTY running the surface command.

    Returns a small process wrapper with ``read``, ``write``, ``resize``,
    ``alive``, and ``terminate`` — identical semantics across backends.
    """
    command = surface.get("command")
    if not command:
        raise ValueError(f"surface {surface['id']} is not a terminal surface")
    binary = _resolve_binary(command[0]) or shutil.which(command[0])
    if not binary:
        raise FileNotFoundError(f"terminal binary not found for surface {surface['id']}")
    cwd = surface.get("cwd") or os.path.expanduser("~")
    columns = max(20, min(int(columns), 400))
    rows = max(5, min(int(rows), 200))

    if os.name == "nt":
        from winpty import PtyProcess  # type: ignore

        process = PtyProcess.spawn(
            [binary, *command[1:]],
            cwd=cwd,
            dimensions=(rows, columns),
            env=child_environment(),
        )

        class WinPtyHandle:
            def __init__(self, proc):
                self.proc = proc

            def read(self, size: int = 4096) -> str:
                return self.proc.read(size)

            def write(self, data: str) -> None:
                self.proc.write(data)

            def resize(self, cols: int, rows: int) -> None:
                self.proc.setwinsize(rows, cols)

            def alive(self) -> bool:
                return self.proc.isalive()

            def terminate(self) -> None:
                if self.proc.isalive():
                    self.proc.terminate()

        return WinPtyHandle(process)

    import pty
    import termios
    import struct
    import fcntl

    master, slave = pty.openpty()
    process = subprocess.Popen(
        [binary, *command[1:]],
        cwd=cwd,
        stdin=slave,
        stdout=slave,
        stderr=slave,
        start_new_session=True,
        close_fds=True,
        env=child_environment(),
    )
    os.close(slave)

    def _set_size(cols: int, rows: int) -> None:
        winsize = struct.pack("HHHH", rows, cols, 0, 0)
        fcntl.ioctl(master, termios.TIOCSWINSZ, winsize)

    _set_size(columns, rows)

    class PosixPtyHandle:
        def read(self, size: int = 4096) -> str:
            return os.read(master, size).decode("utf-8", errors="replace")

        def write(self, data: str) -> None:
            os.write(master, data.encode("utf-8", errors="replace"))

        def resize(self, cols: int, rows: int) -> None:
            _set_size(cols, rows)

        def alive(self) -> bool:
            return process.poll() is None

        def terminate(self) -> None:
            if process.poll() is None:
                process.terminate()

    return PosixPtyHandle()


async def pump_pty(pty_handle, send_text, stop_event: asyncio.Event) -> None:
    """Forward PTY output to the websocket until the session ends."""
    loop = asyncio.get_running_loop()
    while not stop_event.is_set():
        try:
            chunk = await loop.run_in_executor(None, pty_handle.read, 4096)
        except (OSError, RuntimeError):
            break
        if not chunk:
            await asyncio.sleep(0.03)
            if not pty_handle.alive():
                break
            continue
        await send_text(chunk)
