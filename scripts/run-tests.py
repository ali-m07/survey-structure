"""Run the survey platform checks locally and in CI."""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
API = ROOT / "services/3-survey_engine_service"
WEB = ROOT / "frontend"


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--suite", choices=("all", "backend", "frontend"), default="all")
    parser.add_argument("--install", action="store_true", help="Install locked dependencies before checks")
    args = parser.parse_args()
    results = []
    output = ROOT / "test-results" / args.suite
    output.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env.update(USE_SQLITE="True", DEBUG="True", SECRET_KEY="test-runner-only-key", EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", NEXT_TELEMETRY_DISABLED="1")

    def run(name, command, cwd):
        print(f"\n>>> {name}", flush=True)
        started = time.monotonic()
        try:
            with (output / f"{name}.log").open("w", encoding="utf-8") as log:
                process = subprocess.Popen(command, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace")
                for line in process.stdout:
                    print(line, end="", flush=True)
                    log.write(line)
                code = process.wait()
        except OSError as error:
            print(str(error), flush=True)
            code = 1
        results.append({"check": name, "passed": code == 0, "exit_code": code, "seconds": round(time.monotonic() - started, 2)})
        return code == 0

    if args.suite in ("all", "backend"):
        venv = API / ".venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        python = str(venv) if venv.exists() else sys.executable
        ready = not args.install or run("backend-install", [python, "-m", "pip", "install", "-r", "requirements.txt"], API)
        if ready:
            run("backend-check", [python, "manage.py", "check"], API)
            run("backend-migrations", [python, "manage.py", "makemigrations", "--check", "--dry-run"], API)
            run("backend-tests", [python, "manage.py", "test", "app.surveys", "--noinput"], API)

    if args.suite in ("all", "frontend"):
        npm = shutil.which("npm.cmd" if os.name == "nt" else "npm") or "npm"
        ready = not args.install or run("frontend-install", [npm, "ci"], WEB)
        if ready:
            # Build first: Next generates route types used by the standalone type check.
            run("frontend-build", [npm, "run", "build"], WEB)
            run("frontend-types", [npm, "exec", "--", "tsc", "--noEmit"], WEB)

    (output / "summary.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print("\nSummary:")
    for result in results:
        print(f"{'PASS' if result['passed'] else 'FAIL'} {result['check']} ({result['seconds']}s)")
    print(f"Report: {output / 'summary.json'}")
    return 0 if results and all(result["passed"] for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())

