"""Local browser seat — Playwright-driven Chromium (parity round 2).

Why this seat exists: Wielder's headful Chrome seat (desktop.py) dies
with SIGTRAP at startup on this VM (evidence in PROVENANCE.md /
deploy/STASH-MANIFEST.md), so unattended browser EXECUTION used to
route out to the manager's browser lane (tools.request_browser_job —
a routing receipt, never execution). This module fills the local seat
with the industry-standard substitute: Playwright (Microsoft,
Apache-2.0 — verified at the repo LICENSE / package metadata,
see research/provenance-browser.md) driving its own Chromium build
headless. No display, no session bus, no signed-in profile: this seat
is for unattended page work (open, read, click, type, screenshot),
not for the owner's logged-in browsing, which stays on the manager
lane.

Seat honesty (the brain.py seat_status pattern): a seat counts as
wired only after a real launch smoke test. ``installed`` means the
Playwright package AND a Chromium binary were found; ``serving``
means a browser actually launched and answered. Anything less is
reported with its blocker, never upgraded on paper.

Execution model: Playwright is NOT a dependency of Wielder's main
venv. If it is importable in the current interpreter the job runs
in-process; otherwise the job is delegated to the dedicated seat venv
(env WIELDER_BROWSER_SEAT_VENV, or the parity runtime seat-venv) as a
subprocess running this same module, and the receipt comes back as
JSON. Either way the caller gets the same receipt shape.

Receipt (evidence style — what was done, never a bare "ok"):
    {"seat": "playwright-chromium", "ok": bool, "url": final URL,
     "title": page title or None, "text_excerpt": str,
     "screenshot": path or None, "steps": [{action, ok, detail}...],
     "error": None or "Type: message"}
A failed job returns a failure receipt. It never raises for a job
failure and never reports a fake success.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from pathlib import Path

from . import constitution as C

SEAT = "playwright-chromium"
BUCKET = "open source (Playwright Apache-2.0; Chromium — see provenance)"

# Where the parity build installed the seat. Overridable by env so the
# landing lane can re-point without a code edit.
_DEFAULT_SEAT_VENV = (Path.home() / "workspace" / "wielder-parity2"
                      / "runtime" / "seat-venv")
_DEFAULT_BROWSERS = (Path.home() / "workspace" / "wielder-parity2"
                     / "runtime" / "browsers")

_ACTIONS = {"click", "type", "fill", "read_text", "screenshot", "wait_for"}
_SELECTOR_ACTIONS = {"click", "type", "fill", "read_text", "wait_for"}
_TEXT_LIMIT = 2000


# ---------------------------------------------------------------------------
# Seat discovery
# ---------------------------------------------------------------------------

def seat_venv() -> Path | None:
    """The dedicated seat venv, if one is configured/present."""
    env = os.environ.get("WIELDER_BROWSER_SEAT_VENV")
    candidates = [Path(env)] if env else []
    candidates.append(_DEFAULT_SEAT_VENV)
    for cand in candidates:
        py = cand / "bin" / "python"
        if py.exists():
            return cand
    return None


def _playwright_python() -> Path | None:
    """An interpreter that can import playwright: this one first,
    then the seat venv's."""
    import importlib.util
    if importlib.util.find_spec("playwright") is not None:
        return Path(sys.executable)
    venv = seat_venv()
    if venv is not None:
        return venv / "bin" / "python"
    return None


def browsers_path() -> Path:
    env = os.environ.get("PLAYWRIGHT_BROWSERS_PATH")
    if env:
        return Path(env)
    if _DEFAULT_BROWSERS.exists():
        return _DEFAULT_BROWSERS
    return Path.home() / ".cache" / "ms-playwright"


def chromium_executable() -> Path | None:
    """The Chromium binary under the browsers path (full build or
    headless shell — both are fine for this seat)."""
    root = browsers_path()
    if not root.exists():
        return None
    patterns = ["chromium-*/chrome-linux64/chrome",
                "chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell",
                "chromium-*/chrome-linux/chrome",
                "chromium_headless_shell-*/chrome-linux/headless_shell",
                "chromium-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium",
                "chromium_headless_shell-*/chrome-mac/headless_shell"]
    for pat in patterns:
        for hit in sorted(root.glob(pat)):
            if hit.is_file():
                return hit
    return None


def _playwright_version(python: Path | None) -> str | None:
    if python is None:
        return None
    if Path(python) == Path(sys.executable):
        import importlib.metadata as md
        try:
            return md.version("playwright")
        except Exception:
            return None
    try:
        p = subprocess.run([str(python), "-c",
                            "import importlib.metadata as m; "
                            "print(m.version('playwright'))"],
                           capture_output=True, text=True, timeout=30)
        return p.stdout.strip() or None
    except Exception:
        return None


def _launch_smoke() -> tuple[bool, str]:
    """One real launch: browser up, about:blank loaded, browser down.
    This is the only thing that may set serving=True."""
    receipt = run_browser_job({"url": "about:blank", "steps": []})
    if receipt["ok"]:
        return True, "launch smoke passed (about:blank loaded, title read back)"
    return False, f"launch smoke failed — {receipt.get('error')}"


def seat_status(smoke: bool = True) -> dict:
    """Measured seat status, brain.py style. With smoke=True (the
    default) `serving` is only True after a real browser launch;
    smoke=False reports discovery only and leaves serving False with
    the reason stated."""
    python = _playwright_python()
    exe = chromium_executable()
    version = _playwright_version(python)
    installed = python is not None and version is not None and exe is not None
    serving, detail = False, None
    if not installed:
        missing = []
        if version is None:
            missing.append("playwright package not found (current interpreter or seat venv)")
        if exe is None:
            missing.append(f"no Chromium binary under {browsers_path()}")
        detail = "; ".join(missing)
    elif not smoke:
        detail = "discovery only — no launch attempted (smoke=False); seat not counted as wired"
    else:
        serving, detail = _launch_smoke()
    return {"seat": SEAT, "bucket": BUCKET,
            "installed": installed, "serving": serving,
            "playwright_version": version,
            "chromium": str(exe) if exe else None,
            "browsers_path": str(browsers_path()),
            "seat_python": str(python) if python else None,
            "blocker": None if serving else detail}


# ---------------------------------------------------------------------------
# Job spec validation
# ---------------------------------------------------------------------------

def validate_job(job) -> list[str]:
    """Return a list of spec errors (empty = valid). Pure — no browser
    is touched, so this is unit-testable on any machine."""
    errors: list[str] = []
    if not isinstance(job, dict):
        return ["job spec must be a JSON object (dict)"]
    url = job.get("url")
    if not isinstance(url, str) or not url:
        errors.append("job.url is required (non-empty string)")
    elif not (url.startswith(("http://", "https://")) or url == "about:blank"):
        errors.append(f"job.url must be http(s) or about:blank, got {url!r}")
    steps = job.get("steps", [])
    if not isinstance(steps, list):
        errors.append("job.steps must be a list")
    else:
        for i, step in enumerate(steps):
            if not isinstance(step, dict):
                errors.append(f"steps[{i}] must be an object")
                continue
            action = step.get("action")
            if action not in _ACTIONS:
                errors.append(f"steps[{i}].action must be one of {sorted(_ACTIONS)}, got {action!r}")
                continue
            if action in _SELECTOR_ACTIONS and not step.get("selector"):
                errors.append(f"steps[{i}] ({action}) requires a selector")
            if action in ("type", "fill") and "text" not in step:
                errors.append(f"steps[{i}] ({action}) requires text")
            if action == "screenshot" and not step.get("path"):
                errors.append(f"steps[{i}] (screenshot) requires a path")
    shot = job.get("screenshot")
    if shot is not None and not isinstance(shot, str):
        errors.append("job.screenshot must be a path string")
    timeout = job.get("timeout_ms", 30000)
    if not isinstance(timeout, int) or not (100 <= timeout <= 120000):
        errors.append("job.timeout_ms must be an int in [100, 120000]")
    return errors


# ---------------------------------------------------------------------------
# Job execution
# ---------------------------------------------------------------------------

def _failure_receipt(job, error: str, steps: list | None = None) -> dict:
    return {"seat": SEAT, "ok": False,
            "url": job.get("url") if isinstance(job, dict) else None,
            "title": None, "text_excerpt": "", "screenshot": None,
            "steps": steps or [], "error": error}


def _execute_in_process(job: dict) -> dict:
    """Run the job with this interpreter's Playwright. Raises only for
    programming errors; job failures are caught by run_browser_job."""
    from playwright.sync_api import sync_playwright

    timeout = job.get("timeout_ms", 30000)
    receipt = {"seat": SEAT, "ok": False, "url": job["url"], "title": None,
               "text_excerpt": "", "screenshot": None, "steps": [],
               "error": None}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            page = browser.new_page()
            page.goto(job["url"], timeout=timeout, wait_until="load")
            receipt["url"] = page.url
            receipt["title"] = page.title()
            for step in job.get("steps", []):
                action = step["action"]
                entry = {"action": action, "ok": False, "detail": ""}
                try:
                    if action == "click":
                        page.click(step["selector"], timeout=timeout)
                        entry["detail"] = f"clicked {step['selector']}"
                    elif action in ("type", "fill"):
                        page.fill(step["selector"], step["text"], timeout=timeout)
                        entry["detail"] = f"filled {step['selector']} with {len(step['text'])} chars"
                    elif action == "read_text":
                        entry["detail"] = page.inner_text(step["selector"], timeout=timeout)
                    elif action == "wait_for":
                        page.wait_for_selector(step["selector"], timeout=timeout)
                        entry["detail"] = f"{step['selector']} appeared"
                    elif action == "screenshot":
                        _shot(page, step["path"])
                        receipt["screenshot"] = step["path"]
                        entry["detail"] = f"screenshot at {step['path']}"
                    entry["ok"] = True
                except Exception as e:
                    entry["detail"] = f"{type(e).__name__}: {e}"
                    receipt["steps"].append(entry)
                    receipt["error"] = f"step {action} failed — {entry['detail']}"
                    return receipt
                receipt["steps"].append(entry)
            # Final state evidence: title + DOM text after all steps.
            receipt["title"] = page.title()
            receipt["url"] = page.url
            try:
                receipt["text_excerpt"] = page.inner_text("body", timeout=timeout)[:_TEXT_LIMIT]
            except Exception:
                receipt["text_excerpt"] = ""
            if job.get("screenshot"):
                _shot(page, job["screenshot"])
                receipt["screenshot"] = job["screenshot"]
            receipt["ok"] = True
            return receipt
        finally:
            browser.close()


def _shot(page, path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=path)


def _execute_via_seat_venv(job: dict, python: Path) -> dict:
    """Delegate to the seat venv: same module, --run-job mode, receipt
    as JSON on stdout. The child gets PLAYWRIGHT_BROWSERS_PATH pinned
    to the discovered browsers path and this package on PYTHONPATH."""
    jobs_dir = C.DATA / "browser-jobs"
    jobs_dir.mkdir(parents=True, exist_ok=True)
    stamp = int(time.time() * 1000)
    job_file = jobs_dir / f"seat-job-{stamp}.json"
    job_file.write_text(json.dumps(job))
    env = dict(os.environ)
    env["PLAYWRIGHT_BROWSERS_PATH"] = str(browsers_path())
    pkg_root = str(Path(__file__).resolve().parent.parent)
    env["PYTHONPATH"] = pkg_root + (os.pathsep + env["PYTHONPATH"] if env.get("PYTHONPATH") else "")
    env["WIELDER_BROWSER_SEAT_INPROCESS"] = "1"
    try:
        p = subprocess.run([str(python), "-m", "wielder.browser_seat",
                            "--run-job", str(job_file)],
                           capture_output=True, text=True, timeout=180, env=env)
    finally:
        job_file.unlink(missing_ok=True)
    for line in reversed((p.stdout or "").strip().splitlines()):
        try:
            return json.loads(line)
        except Exception:
            continue
    return _failure_receipt(job, f"seat venv produced no receipt "
                                 f"(exit {p.returncode}): {(p.stderr or '').strip()[-500:]}")


def run_browser_job(job) -> dict:
    """Execute one browser job and return its receipt. Invalid specs
    and seat/execution failures all come back as failure receipts —
    this function does not raise for a job problem."""
    if not isinstance(job, dict):
        return _failure_receipt(job, "job spec must be a JSON object (dict)")
    errors = validate_job(job)
    if errors:
        return _failure_receipt(job, "invalid job spec: " + "; ".join(errors))
    python = _playwright_python()
    if python is None:
        return _failure_receipt(job, "playwright not installed in this interpreter "
                                     "and no seat venv found — seat not wired")
    if chromium_executable() is None:
        return _failure_receipt(job, f"no Chromium binary under {browsers_path()} — seat not wired")
    try:
        if Path(python) == Path(sys.executable) or os.environ.get("WIELDER_BROWSER_SEAT_INPROCESS"):
            return _execute_in_process(job)
        return _execute_via_seat_venv(job, python)
    except Exception as e:
        return _failure_receipt(job, f"{type(e).__name__}: {e}")


def smoke() -> dict:
    """The `browser-seat` smoke function: seat_status with a real
    launch. Returns the status dict — serving=True is the proof."""
    return seat_status(smoke=True)


if __name__ == "__main__":  # seat-venv delegation entry point
    import argparse
    ap = argparse.ArgumentParser(prog="wielder.browser_seat")
    ap.add_argument("--run-job", help="path to a job-spec JSON file")
    ap.add_argument("--smoke", action="store_true")
    args = ap.parse_args()
    if args.smoke:
        print(json.dumps(smoke(), indent=1))
    elif args.run_job:
        spec = json.loads(Path(args.run_job).read_text())
        print(json.dumps(run_browser_job(spec)))
    else:
        ap.error("one of --run-job / --smoke is required")
