"""WIELDER circle detector — a run that loops, parks itself.

The failure this kills (owner's words): agents looping in circles,
silently burning limits while nothing progresses. Two detectors:

- **In-run repetition.** Every step the execute node runs is
  fingerprinted (tool + canonical payload). The same action, or a
  near-identical one (payloads differing only in volatile keys —
  timestamps, nonces), repeated past the threshold raises
  LoopDetected; execute() parks the run with the loop evidence
  attached and the `run.loop_detected` hook fires an escalation
  card. The run never silently loops.
- **Heartbeat stall.** A run left in EXECUTING whose progress
  marker (tool-call + transition counts in the ledger) does not
  change across N heartbeat checks is presumed dead or stalled:
  the stall watch parks it (EXECUTING → EVALUATING → PARKED, the
  legal path) with the evidence named, and the scheduler fires
  `run.stalled`. This is also the crash-orphan sweep: a run whose
  process died mid-job sits in EXECUTING forever unless something
  parks it — now something does, and card 3's resume path can pick
  it up from the park.

Two further signals were ported in the 2026-10-28 reconciliation
from the grok lane's PR #44 circle detector (its module was not
landed — one detector, more signals): **ping-pong** (two actions
alternating over a 6-step window — catches alternation loops whose
per-action counts stay under the repeat threshold; at the default
threshold an alternation is already caught as an exact repeat) and
**error-loop** (the same failure signature — tool + error/exit —
repeated at threshold by otherwise distinct actions).

Thresholds read the config budgets (loop_repeat_threshold,
stall_max_checks) with code defaults 3 and 2; the config itself is
never written. Detection is deterministic — same record in, same
verdict out.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Optional

from . import constitution as C

VOLATILE_KEYS = {"ts", "timestamp", "nonce", "time", "at"}


class LoopDetected(RuntimeError):
    def __init__(self, evidence: dict):
        super().__init__(evidence.get("summary", "loop detected"))
        self.evidence = evidence


def loop_threshold() -> int:
    return int(C.CONFIG.get("budgets", {}).get("loop_repeat_threshold", 3))


def stall_max_checks() -> int:
    return int(C.CONFIG.get("budgets", {}).get("stall_max_checks", 2))


def _canon(payload: dict, near: bool) -> str:
    p = dict(payload or {})
    if near:
        p = {k: v for k, v in p.items() if k not in VOLATILE_KEYS}
    return json.dumps(p, sort_keys=True, default=str)


def fingerprint(tool: str, payload: dict, near: bool = False) -> str:
    return hashlib.sha256(f"{tool}|{_canon(payload, near)}".encode()).hexdigest()[:16]


PINGPONG_WINDOW = 6


def _error_signature(e: dict) -> Optional[str]:
    """Failure signature of a tool-result entry, or None when the
    entry is not a failure (plan steps carry no outcome and are
    ignored by the error-loop signal)."""
    if e.get("ok") is not False:
        return None
    return f"{e.get('tool', '')}|{e.get('error') or e.get('exit_code') or ''}"


def scan(entries: list[dict], threshold: Optional[int] = None) -> Optional[dict]:
    """Loop evidence if any action repeats >= threshold times in
    `entries` ({tool, payload} dicts — plan steps or tool results),
    else None. Signals, in order: exact repeat, near-identical
    repeat, error-loop, ping-pong (the last two ported from PR #44)."""
    threshold = threshold or loop_threshold()
    entries = entries or []
    for near in (False, True):
        counts: dict[str, dict] = {}
        for i, e in enumerate(entries):
            fp = fingerprint(e.get("tool", ""), e.get("payload") or {}, near=near)
            rec = counts.setdefault(fp, {"fingerprint": fp, "tool": e.get("tool", ""),
                                         "indices": []})
            rec["indices"].append(i)
        for rec in counts.values():
            if len(rec["indices"]) >= threshold:
                kind = "near-identical" if near else "exact"
                return {**rec, "kind": kind, "count": len(rec["indices"]),
                        "threshold": threshold,
                        "summary": f"{kind} action {rec['tool']} [{rec['fingerprint']}] "
                                   f"repeated {len(rec['indices'])}x at steps "
                                   f"{rec['indices']} (threshold {threshold})"}
    # error-loop: distinct actions failing the same way, at threshold
    err_counts: dict[str, dict] = {}
    for i, e in enumerate(entries):
        sig = _error_signature(e)
        if sig is None:
            continue
        rec = err_counts.setdefault(sig, {"fingerprint": sig, "tool": e.get("tool", ""),
                                          "indices": []})
        rec["indices"].append(i)
    for rec in err_counts.values():
        if len(rec["indices"]) >= threshold:
            return {**rec, "kind": "error-loop", "count": len(rec["indices"]),
                    "threshold": threshold,
                    "summary": f"error-loop: failure [{rec['fingerprint']}] repeated "
                               f"{len(rec['indices'])}x at steps {rec['indices']} "
                               f"(threshold {threshold})"}
    # ping-pong: two actions alternating over the window
    fps = [fingerprint(e.get("tool", ""), e.get("payload") or {}) for e in entries]
    for start in range(0, len(fps) - PINGPONG_WINDOW + 1):
        w = fps[start:start + PINGPONG_WINDOW]
        if len(set(w)) == 2 and all(w[i] != w[i + 1] for i in range(len(w) - 1)):
            return {"fingerprint": w[0], "tool": entries[start].get("tool", ""),
                    "indices": list(range(start, start + PINGPONG_WINDOW)),
                    "kind": "pingpong", "count": PINGPONG_WINDOW,
                    "threshold": threshold,
                    "summary": f"ping-pong: two actions alternating over "
                               f"{PINGPONG_WINDOW} steps at {start}.."
                               f"{start + PINGPONG_WINDOW - 1}"}
    return None


# ---------- heartbeat stall watch ----------

def _watch_path() -> Path:
    return C.DATA / "stall-watch.json"


def _load_watch() -> dict:
    p = _watch_path()
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text())
    except Exception:
        return {}


def _save_watch(watch: dict) -> None:
    p = _watch_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(watch, indent=1))


def _marker(run: dict) -> str:
    return f"{len(run.get('tool_calls', []))}:{len(run.get('transitions', []))}"


def check_stalls(ledger, max_stale: Optional[int] = None) -> list[dict]:
    """One stall-watch pass (called per heartbeat cycle). Parks any
    EXECUTING run whose progress marker has not changed for
    `max_stale` consecutive checks, and returns the stall records.
    A run that is progressing — or no longer EXECUTING — is never
    parked, and its marker is refreshed or dropped."""
    max_stale = max_stale if max_stale is not None else stall_max_checks()
    watch = _load_watch()
    stalled: list[dict] = []
    live: dict[str, Any] = {}
    for run in ledger.list_runs(limit=100):
        if run["state"] != "EXECUTING":
            continue
        rid = run["run_id"]
        full = ledger.get_run(rid)
        marker = _marker(full)
        prev = watch.get(rid)
        if prev and prev.get("marker") == marker:
            stale = int(prev.get("stale", 0)) + 1
        else:
            stale = 0
        if stale >= max_stale:
            blocker = (f"STALL WATCH: run {rid} shows no progress across "
                       f"{stale + 1} heartbeat checks (progress marker {marker} "
                       "unchanged) — presumed dead or stalled mid-job; parked "
                       "with this evidence. Card 3's resume path "
                       "(wielder resume-run) can pick it up.")
            ledger.transition(rid, "EVALUATING", "stall watch: no progress")
            ledger.set_outcome(rid, blocker=blocker)
            ledger.transition(rid, "PARKED", blocker)
            stalled.append({"run_id": rid, "stale_checks": stale + 1,
                            "marker": marker, "blocker": blocker})
        else:
            live[rid] = {"marker": marker, "stale": stale}
    _save_watch(live)
    return stalled
