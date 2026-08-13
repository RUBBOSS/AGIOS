from __future__ import annotations

import base64
import json
import tempfile
from pathlib import Path
from typing import Any, Mapping


MAX_AUDIO_BYTES = 10 * 1024 * 1024
MIME_SUFFIXES = {
    "audio/webm": ".webm",
    "video/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp4": ".m4a",
}


class VoiceAdapterError(RuntimeError):
    pass


class HermesVoiceAdapter:
    """Explicit, loopback-only bridge to Hermes STT/TTS providers."""

    def __init__(self, state_dir: str | Path) -> None:
        self.state_dir = Path(state_dir).expanduser().absolute()
        self.state_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _configs() -> tuple[Mapping[str, Any], Mapping[str, Any]]:
        try:
            from tools.transcription_tools import _load_stt_config
            from tools.tts_tool import _load_tts_config

            stt = _load_stt_config()
            tts = _load_tts_config()
        except (ImportError, OSError, RuntimeError, TypeError, ValueError):
            return {}, {}
        return (
            stt if isinstance(stt, Mapping) else {},
            tts if isinstance(tts, Mapping) else {},
        )

    def capabilities(self) -> dict[str, Any]:
        stt, tts = self._configs()
        stt_provider = str(stt.get("provider") or "auto")
        tts_provider = str(tts.get("provider") or "edge")
        local_stt = stt_provider in {"local", "local_command"}
        local_tts = tts_provider in {"neutts", "piper", "kittentts"}
        return {
            "status": "ready" if stt or tts else "unavailable",
            "input": {
                "enabled": bool(stt.get("enabled", True)) if stt else False,
                "provider": stt_provider,
                "local": local_stt,
                "consent": "push-to-talk",
            },
            "output": {
                "enabled": bool(tts),
                "provider": tts_provider,
                "local": local_tts,
                "activation": "explicit-play",
            },
            "vision": {"enabled": False, "status": "designed-not-connected"},
        }

    def transcribe(self, audio: bytes, mime_type: str) -> dict[str, Any]:
        from .operational import OperationalError

        selected_mime = str(mime_type or "").split(";", 1)[0].lower().strip()
        suffix = MIME_SUFFIXES.get(selected_mime)
        if suffix is None:
            raise OperationalError("audio recording format is not supported")
        if not audio:
            raise OperationalError("audio recording is empty")
        if len(audio) > MAX_AUDIO_BYTES:
            raise OperationalError("audio recording exceeds the 10 MB limit")
        temp_path: Path | None = None
        try:
            with tempfile.NamedTemporaryFile(
                prefix="agios-voice-", suffix=suffix, dir=self.state_dir, delete=False
            ) as handle:
                handle.write(audio)
                temp_path = Path(handle.name)
            from tools.voice_mode import transcribe_recording

            result = transcribe_recording(str(temp_path))
            if not isinstance(result, Mapping) or not result.get("success"):
                message = str(result.get("error") if isinstance(result, Mapping) else "")
                raise OperationalError(message[:300] or "voice transcription failed")
            transcript = str(result.get("transcript") or "").strip()[:8000]
            return {"success": True, "transcript": transcript}
        except OperationalError:
            raise
        except (ImportError, OSError, RuntimeError, TypeError, ValueError) as exc:
            raise OperationalError("Hermes voice transcription is unavailable") from exc
        finally:
            if temp_path is not None:
                try:
                    temp_path.unlink(missing_ok=True)
                except OSError:
                    pass

    def synthesize(self, text: str) -> dict[str, Any]:
        from .operational import OperationalError, _bounded_text

        selected_text = _bounded_text(text, label="speech text", limit=4000)
        output_path: Path | None = None
        cleanup_paths: set[Path] = set()
        try:
            from tools.tts_tool import text_to_speech_tool

            with tempfile.NamedTemporaryFile(
                prefix="agios-reply-", suffix=".mp3", dir=self.state_dir, delete=False
            ) as handle:
                output_path = Path(handle.name)
            output_path.unlink(missing_ok=True)
            raw = text_to_speech_tool(text=selected_text, output_path=str(output_path))
            result = json.loads(raw) if isinstance(raw, str) else raw
            if not isinstance(result, Mapping) or not result.get("success"):
                raise OperationalError("Hermes speech output is unavailable")
            candidates = result.get("file_paths") or [result.get("file_path") or output_path]
            cleanup_paths.update(Path(item) for item in candidates if item)
            audio_path = next((Path(item) for item in candidates if item and Path(item).is_file()), None)
            if audio_path is None or audio_path.stat().st_size > MAX_AUDIO_BYTES:
                raise OperationalError("Hermes speech output is invalid")
            mime = "audio/ogg" if audio_path.suffix.lower() == ".ogg" else "audio/mpeg"
            encoded = base64.b64encode(audio_path.read_bytes()).decode("ascii")
            return {"success": True, "audio_data_url": f"data:{mime};base64,{encoded}"}
        except OperationalError:
            raise
        except (ImportError, OSError, RuntimeError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise OperationalError("Hermes speech output is unavailable") from exc
        finally:
            if output_path is not None:
                cleanup_paths.add(output_path)
            for path in cleanup_paths:
                try:
                    if path.parent.resolve() == self.state_dir.resolve():
                        path.unlink(missing_ok=True)
                except OSError:
                    pass
