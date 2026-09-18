"""Launch the sanitized source delivery without embedding secrets."""
import argparse
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "EduLink-backend-handoff-2026-09-06"


def load_config():
    path = ROOT / "config" / "local.env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, separator, value = line.partition("=")
        if not separator or not key.strip().replace("_", "").isalnum():
            raise SystemExit("Invalid config/local.env line; use KEY=value.")
        value = value.strip().strip("\"'")
        if value:
            os.environ.setdefault(key.strip(), value)


def check_port(port):
    with socket.socket() as probe:
        try:
            probe.bind(("127.0.0.1", port))
        except OSError as exc:
            raise SystemExit(f"Port {port} is occupied.") from exc


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--frontend-only", action="store_true")
    parser.add_argument("--frontend-port", type=int, default=5500)
    parser.add_argument("--backend-port", type=int, default=8000)
    args = parser.parse_args()
    load_config()
    if args.frontend_port == args.backend_port:
        raise SystemExit("Frontend and backend ports must differ.")
    check_port(args.frontend_port)
    if not args.frontend_only:
        missing = [name for name in ("DEEPSEEK_API_KEY", "RAG_API_TOKEN") if not os.getenv(name)]
        if missing:
            raise SystemExit("Configure in config/local.env: " + ", ".join(missing))
        chunks = ROOT / "rag" / "data" / "knowledge_chunks.jsonl"
        catalogue = ROOT / "知识库" / "理论总表.json"
        if not any(path.is_file() and path.stat().st_size for path in (chunks, catalogue)):
            raise SystemExit("Knowledge data is excluded. Restore it first or use --frontend-only.")
        check_port(args.backend_port)
    config = {
        "baseUrl": f"http://127.0.0.1:{args.backend_port}",
        "token": "" if args.frontend_only else os.environ["RAG_API_TOKEN"],
        "timeoutMs": 180000,
    }
    (FRONTEND / "runtime-config.override.js").write_text(
        "window.EDULINK_RAG_CONFIG = " + json.dumps(config) + ";\n", encoding="utf-8"
    )
    os.environ.setdefault("RAG_CORS_ORIGINS", f"http://127.0.0.1:{args.frontend_port},http://localhost:{args.frontend_port}")
    processes = []
    try:
        if not args.frontend_only:
            processes.append(subprocess.Popen(
                [sys.executable, "api_server.py", "--host", "127.0.0.1", "--port", str(args.backend_port)], cwd=ROOT
            ))
        processes.append(subprocess.Popen(
            [sys.executable, "-m", "http.server", str(args.frontend_port), "--bind", "127.0.0.1", "--directory", str(FRONTEND)], cwd=ROOT
        ))
        print(f"Frontend: http://127.0.0.1:{args.frontend_port}", flush=True)
        while all(process.poll() is None for process in processes):
            time.sleep(0.5)
        raise SystemExit("A service exited; inspect its preceding output.")
    except KeyboardInterrupt:
        pass
    finally:
        for process in processes:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=8)
                except subprocess.TimeoutExpired:
                    process.kill()


if __name__ == "__main__":
    main()
