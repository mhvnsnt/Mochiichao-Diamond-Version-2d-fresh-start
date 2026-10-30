#!/usr/bin/env python3
"""Run Watcher — Kaggle kernel status-change alerter.

Industry-standard pattern for services without completion webhooks:
poll the status API on a short interval, keep a local state file, and
speak ONLY when a watched kernel's status changes. Silence = no change.

LIGHT POLLS. One steady-state poll is exactly one `kernels_status` call
per watched kernel — the lightest call that returns kernel status.
Heavier calls happen only on events:
  - kernels_list (lastRunTime metadata): first poll (baseline) and when
    a kernel enters a terminal state. Cached in state.json otherwise.
  - ListKernelSessionOutput (output inventory): when a kernel
    completes, at most 10 pages; at most one inventory is fetched per
    poll. If the fetch is rate-limited or fails, the kernel is flagged
    `pending_inventory` in state and the inventory is delivered as a
    follow-up block on a later healthy poll. This API returns file
    NAMES/paths only — no sizes — so alerts list artifact names and
    never invent sizes.

429 HANDLING (first-class, by design). The account's API budget is
shared with bulk downloads and other tooling, so rate limits are
weather, not news:
  - On HTTP 429 anywhere in a poll: stop polling, keep whatever real
    status changes were already observed (those still print — they are
    production news), then back off SILENTLY: no output mentions the
    429, exit code stays 0.
  - Backoff is exponential and self-enforcing: state.json records
    backoff_seconds (900 -> 1800 -> 3600 cap) and backoff_until. A
    poll that starts while backoff_until is in the future makes ZERO
    API calls and exits silently — under a fixed 15-minute scheduler
    this is what lengthens the effective interval.
  - A fully clean poll resets the backoff to zero.
  - Never burst-poll: no in-cycle retry loops anywhere in this script.

OTHER FAILURES are not weather: an auth/API failure aborts the poll,
prints to stderr, and exits 2, so a scheduler can tell "broken" apart
from "nothing changed". State is only written after a poll that ran.

WHAT THE API GIVES (verified 2026-10-28, kaggle pkg 2.2.5):
  - kernels_status returns ONLY {status, failureMessage}. No runtime
    field exists, so durations here are LOCALLY OBSERVED (time between
    this watcher first seeing one status and first seeing the next)
    and labelled as such.
  - lastRunTime comes from kernels_list metadata, not the status call.

Credentials: read by the kaggle package from ~/.kaggle/kaggle.json.
This script never prints, copies, or logs the key.

Usage:
  python3 run_watcher.py                 # one poll, human-readable
  python3 run_watcher.py --json          # one poll, JSON lines
  python3 run_watcher.py --registry R --state S

Exit codes: 0 = poll ran (alerts, silence, or a silent 429 backoff).
2 = the poll itself failed for a non-429 reason (see stderr).
"""

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_REGISTRY = HERE / "registry.json"
DEFAULT_STATE = HERE / "state.json"
TERMINAL_OK = {"COMPLETE"}
TERMINAL_BAD = {"ERROR", "CANCELLED", "CANCELED"}
TERMINAL = TERMINAL_OK | TERMINAL_BAD
INVENTORY_TOP_N = 25
INVENTORY_PAGE_SIZE = 500
INVENTORY_MAX_PAGES = 10
# Files that count as production artifacts in an output listing. These
# kernels run whole tool trees (e.g. ComfyUI) in their working dir, so
# the raw listing is mostly source noise; the alert surfaces artifacts
# and counts the rest.
ARTIFACT_EXTS = {
    ".mp4", ".mov", ".webm", ".mkv", ".avi",
    ".png", ".jpg", ".jpeg", ".webp", ".gif",
    ".safetensors", ".ckpt", ".pt", ".pth", ".bin",
    ".zip", ".tar", ".gz", ".wav", ".mp3", ".flac",
}
BACKOFF_BASE_S = 900        # 15 min
BACKOFF_CAP_S = 3600        # 1 h


# ---------------------------------------------------------------- utils

def now_dt() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(s):
    try:
        return datetime.strptime(s, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except Exception:
        return None


def human_dur(seconds: float) -> str:
    seconds = int(max(0, seconds))
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}h {m}m"
    if m:
        return f"{m}m {s}s"
    return f"{s}s"


def human_bytes(n) -> str:
    try:
        n = float(n)
    except Exception:
        return "?"
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit == "B" else f"{n:.1f} {unit}"
        n /= 1024


def is_rate_limit(exc: BaseException) -> bool:
    """True if the exception chain carries an HTTP 429."""
    seen = set()
    cur = exc
    while cur is not None and id(cur) not in seen:
        seen.add(id(cur))
        if getattr(cur, "status", None) == 429:
            return True
        resp = getattr(cur, "response", None)
        if getattr(resp, "status_code", None) == 429:
            return True
        msg = str(cur)
        if "429" in msg or "Too Many Requests" in msg:
            return True
        cur = cur.__cause__ or cur.__context__
    return False


# ---------------------------------------------------------------- kaggle

def get_api():
    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    api.authenticate()
    return api


def status_of(api, ref):
    st = api.kernels_status(ref)
    name = getattr(st.status, "name", None) or str(st.status)
    failure = (getattr(st, "failure_message", "") or "").strip()
    return name, failure


def last_run_times(api):
    """ref -> lastRunTime string, from kernels_list metadata (mine)."""
    out = {}
    for k in api.kernels_list(mine=True, page_size=100) or []:
        ref = getattr(k, "ref", None)
        lrt = getattr(k, "last_run_time", None)
        if ref:
            out[ref] = str(lrt) if lrt else None
    return out


def is_artifact(name: str) -> bool:
    """A listed output file counts as a production artifact if it has an
    artifact extension (or is a run/gate report JSON) AND sits where
    deliverables live: shallow (<=2 path segments), under out/, or under
    an output/ folder. Files deep inside a dumped tool tree (e.g.
    ComfyUI/comfy/.../examples/*.png) are tree noise, not output."""
    lower = name.lower()
    ext_match = any(lower.endswith(ext) for ext in ARTIFACT_EXTS) or (
        lower.endswith(".json") and ("report" in lower or "gate" in lower)
    )
    if not ext_match:
        return False
    if name.count("/") <= 1:
        return True
    return lower.startswith("out/") or "/output/" in lower


def list_session_output(api, ref):
    """Names (relative paths) in the kernel's latest-session output,
    via the SDK's ListKernelSessionOutput call. Bounded: at most
    INVENTORY_MAX_PAGES pages. NOTE: this API returns names/paths only
    — ApiKernelSessionOutputFile has no size field, so the watcher
    reports names and never invents sizes."""
    from kagglesdk.kernels.types.kernels_api_service import (
        ApiListKernelSessionOutputRequest,
    )

    owner_slug, kernel_slug, _version = api.parse_kernel_string(ref)
    names = []
    token = None
    truncated = False
    with api.build_kaggle_client() as kaggle:
        for _ in range(INVENTORY_MAX_PAGES):
            req = ApiListKernelSessionOutputRequest()
            req.user_name = owner_slug
            req.kernel_slug = kernel_slug
            if token:
                try:
                    api._set_paging(req, INVENTORY_PAGE_SIZE, token)
                except Exception:
                    req.page_token = token
            resp = kaggle.kernels.kernels_api_client.list_kernel_session_output(req)
            for f in getattr(resp, "files", []) or []:
                names.append(getattr(f, "file_name", "?"))
            token = getattr(resp, "next_page_token", None)
            if not token:
                break
        else:
            truncated = bool(token)
    return names, truncated


def output_inventory(api, ref):
    """Artifact inventory of a completed kernel's latest-session output:
    names classified into production artifacts vs everything else
    (tool trees and sources these kernels dump into their output)."""
    names, truncated = list_session_output(api, ref)
    artifacts = [n for n in names if is_artifact(n)]
    # shallow paths first: deliverables live at top level or in out/,
    # tool-tree files sit deep inside e.g. ComfyUI/...
    artifacts.sort(key=lambda n: (n.count("/"), n))
    return {
        "listed": len(names),
        "truncated": truncated,
        "artifacts": artifacts[:INVENTORY_TOP_N],
        "artifact_count": len(artifacts),
        "other_count": len(names) - len(artifacts),
    }


# ---------------------------------------------------------------- state

def engage_backoff(state, at: datetime):
    cur = state.get("backoff_seconds", 0) or 0
    new = BACKOFF_BASE_S if cur == 0 else min(cur * 2, BACKOFF_CAP_S)
    state["backoff_seconds"] = new
    state["backoff_until"] = iso(at + timedelta(seconds=new))


def clear_backoff(state):
    state["backoff_seconds"] = 0
    state.pop("backoff_until", None)


def in_backoff(state, at: datetime) -> bool:
    until = parse_iso(state.get("backoff_until", "") or "")
    return bool(until and at < until)


# ---------------------------------------------------------------- main

def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Kaggle kernel status-change watcher")
    ap.add_argument("--registry", default=str(DEFAULT_REGISTRY))
    ap.add_argument("--state", default=str(DEFAULT_STATE))
    ap.add_argument("--json", action="store_true", help="emit alerts as JSON lines")
    args = ap.parse_args(argv)

    registry_path = Path(args.registry)
    state_path = Path(args.state)
    if not registry_path.exists():
        print(f"run-watcher: registry not found: {registry_path}", file=sys.stderr)
        return 2
    registry = json.loads(registry_path.read_text())
    watched = registry.get("kernels", [])
    labels = {e["ref"]: e for e in watched}

    first_run = not state_path.exists()
    state = {"kernels": {}}
    if not first_run:
        try:
            state = json.loads(state_path.read_text())
        except Exception:
            state = {"kernels": {}}
            first_run = True
    state.setdefault("kernels", {})

    poll_dt = now_dt()
    poll_time = iso(poll_dt)

    # --- 429 self-gate: inside a backoff window, make zero API calls.
    if in_backoff(state, poll_dt):
        return 0

    try:
        api = get_api()
    except Exception as exc:
        if is_rate_limit(exc):
            engage_backoff(state, poll_dt)
            state_path.write_text(json.dumps(state, indent=1))
            return 0
        print(f"run-watcher: POLL FAILED (auth): {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2

    alerts = []
    rate_limited = False
    lrt_cache = {}

    def lrts():
        """Lazy kernels_list: only called at baseline / terminal events."""
        if "map" not in lrt_cache:
            lrt_cache["map"] = last_run_times(api)
        return lrt_cache["map"]

    # --- status polling: one light call per kernel, stop dead on 429.
    polled_all = True
    for entry in watched:
        ref = entry["ref"]
        try:
            new_status, failure = status_of(api, ref)
        except Exception as exc:
            if is_rate_limit(exc):
                rate_limited = True
                polled_all = False
                break
            print(f"run-watcher: POLL FAILED: {type(exc).__name__}: {exc}", file=sys.stderr)
            return 2

        prev = state["kernels"].get(ref)

        if prev is None:
            lrt = None
            if first_run:
                try:
                    lrt = lrts().get(ref)
                except Exception as exc:
                    if is_rate_limit(exc):
                        rate_limited = True
                    lrt = None
            state["kernels"][ref] = {
                "status": new_status,
                "since": poll_time,
                "last_change": poll_time,
                "last_poll": poll_time,
                "last_run_time": lrt,
                "pending_inventory": False,
            }
            if first_run:
                alerts.append({
                    "kind": "BASELINE", "ref": ref,
                    "label": entry.get("label", ""), "programme": entry.get("programme", ""),
                    "status": new_status, "last_run_time": lrt, "at": poll_time,
                })
            continue

        prev["last_poll"] = poll_time
        if new_status == prev["status"]:
            continue

        # ---- status changed ----
        since_dt = parse_iso(prev.get("since", poll_time))
        observed = human_dur((poll_dt - since_dt).total_seconds()) if since_dt else "?"
        lrt = prev.get("last_run_time")
        if new_status in TERMINAL:
            try:
                lrt = lrts().get(ref) or lrt
            except Exception as exc:
                if is_rate_limit(exc):
                    rate_limited = True
        if lrt:
            prev["last_run_time"] = lrt

        alert = {
            "kind": "CHANGE", "ref": ref,
            "label": entry.get("label", ""), "programme": entry.get("programme", ""),
            "old_status": prev["status"], "new_status": new_status,
            "old_status_observed_for": observed,
            "last_run_time": lrt, "at": poll_time,
        }
        if new_status in TERMINAL_BAD and failure:
            alert["failure_message"] = failure

        prev["status"] = new_status
        prev["since"] = poll_time
        prev["last_change"] = poll_time

        if new_status in TERMINAL_OK:
            # one inline inventory attempt; failure defers, never loops
            try:
                inv = output_inventory(api, ref)
                alert["output_files"] = inv
                prev["pending_inventory"] = False
            except Exception as exc:
                if is_rate_limit(exc):
                    rate_limited = True
                alert["output_files_deferred"] = True
                prev["pending_inventory"] = True
        alerts.append(alert)

    # --- drain ONE pending inventory on a healthy poll.
    if polled_all and not rate_limited:
        for ref, kstate in state["kernels"].items():
            if kstate.get("pending_inventory") and kstate.get("status") in TERMINAL_OK:
                try:
                    inv = output_inventory(api, ref)
                except Exception as exc:
                    if is_rate_limit(exc):
                        rate_limited = True
                    break  # stays pending; no noise
                kstate["pending_inventory"] = False
                entry = labels.get(ref, {})
                alerts.append({
                    "kind": "OUTPUT", "ref": ref,
                    "label": entry.get("label", ""), "programme": entry.get("programme", ""),
                    "status": kstate["status"],
                    "last_run_time": kstate.get("last_run_time"),
                    "output_files": inv, "at": poll_time,
                })
                break  # at most one per poll

    # --- backoff bookkeeping: 429 lengthens, a clean poll resets.
    if rate_limited:
        engage_backoff(state, poll_dt)
    elif polled_all:
        clear_backoff(state)

    state["updated"] = poll_time
    state_path.write_text(json.dumps(state, indent=1))

    for a in alerts:
        if args.json:
            print(json.dumps(a))
        else:
            print(format_alert(a))
    return 0




def format_alert(a) -> str:
    lines = []
    if a["kind"] == "BASELINE":
        lines.append(f"[run-watcher BASELINE] {a['ref']} — {a['label']}")
        lines.append(f"  programme: {a['programme']}")
        lines.append(f"  current status: {a['status']}")
        if a.get("last_run_time"):
            lines.append(f"  last run (Kaggle lastRunTime): {a['last_run_time']}")
        return "\n".join(lines)
    if a["kind"] == "OUTPUT":
        lines.append(f"[run-watcher OUTPUT] {a['ref']} — {a['label']}")
        lines.append(f"  programme: {a['programme']}")
        lines.append(f"  output inventory for the completed run:")
        lines.extend(inventory_lines(a["output_files"]))
        return "\n".join(lines)
    lines.append(f"[run-watcher ALERT] {a['ref']} — {a['label']}")
    lines.append(f"  programme: {a['programme']}")
    lines.append(f"  status: {a['old_status']} -> {a['new_status']}  (at {a['at']} UTC)")
    lines.append(f"  previous status observed for: {a['old_status_observed_for']} (local observation)")
    if a.get("last_run_time"):
        lines.append(f"  last run (Kaggle lastRunTime): {a['last_run_time']}")
    if a.get("failure_message"):
        lines.append(f"  failure: {a['failure_message']}")
    if a.get("output_files"):
        lines.extend(inventory_lines(a["output_files"]))
    if a.get("output_files_deferred"):
        lines.append("  output inventory deferred (will follow on a later poll)")
    return "\n".join(lines)


def inventory_lines(inv) -> list:
    lines = [
        f"  output: {inv['listed']} files in latest-session output"
        + (" (listing truncated)" if inv.get("truncated") else "")
        + f"; {inv['artifact_count']} artifacts; "
        + f"{inv['other_count']} other files (tool trees, sources)"
    ]
    if inv["artifacts"]:
        lines.append("  artifacts (names; the list API gives no sizes):")
        for n in inv["artifacts"]:
            lines.append(f"    - {n}")
        if inv["artifact_count"] > len(inv["artifacts"]):
            lines.append(f"    ... and {inv['artifact_count'] - len(inv['artifacts'])} more artifacts")
    else:
        lines.append("  no media/model/report artifacts in the listed output")
    return lines


if __name__ == "__main__":
    sys.exit(main())
