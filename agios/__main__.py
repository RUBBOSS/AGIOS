from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Sequence

from .config import ConfigError, load_config
from .demo import run_demo
from .doctor import run_doctor


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = REPOSITORY_ROOT / "configs" / "agios.json"


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="AGIOS Foundation v0.1")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("validate", help="validate the authoritative configuration")
    doctor = commands.add_parser("doctor", help="run read-only desired-state checks")
    doctor.add_argument("--profiles", type=Path, default=REPOSITORY_ROOT / "configs")
    doctor.add_argument("--journal", type=Path)
    demo = commands.add_parser("demo", help="run the deterministic Foundation demonstration")
    demo.add_argument("--state", type=Path)
    serve_parser = commands.add_parser("serve", help="serve the standalone AGIOS command center")
    serve_parser.add_argument("--host", default="127.0.0.1")
    serve_parser.add_argument("--port", type=int, default=9120)
    serve_parser.add_argument("--frontend", type=Path)
    serve_parser.add_argument("--journal", type=Path)
    serve_parser.add_argument("--state-dir", type=Path)
    args = parser.parse_args(argv)

    try:
        if args.command == "validate":
            config = load_config(args.config)
            result = {
                "schema_version": 1,
                "status": "valid",
                "agents": len(config.agents),
                "models": len(config.models),
                "runtimes": len(config.runtimes),
                "routes": len(config.routes),
                "businesses": len(config.businesses),
                "departments": len(config.departments),
                "integrations": len(config.integrations),
                "systems": len(config.systems),
            }
        elif args.command == "doctor":
            result = run_doctor(
                config_path=args.config,
                profiles_dir=args.profiles,
                journal_path=args.journal,
            )
        elif args.command == "demo":
            result = run_demo(config_path=args.config, state_path=args.state)
        else:
            from .server import DEFAULT_FRONTEND, serve

            serve(
                config_path=args.config,
                frontend_path=args.frontend or DEFAULT_FRONTEND,
                journal_path=args.journal,
                state_dir=args.state_dir,
                host=args.host,
                port=args.port,
            )
            return 0
    except (ConfigError, OSError, RuntimeError, ValueError) as exc:
        print(json.dumps({"schema_version": 1, "status": "failed", "error": str(exc)}, sort_keys=True))
        return 2
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result.get("status") not in {"failed"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
