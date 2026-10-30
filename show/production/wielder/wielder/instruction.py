"""WIELDER instruction checker — the run is compared against the
task it was actually given, and drift blocks landing.

The failure this kills (owner's words): agents drifting from
instructions — touching files outside the task's scope, claiming
work the instruction never asked for. The instruction here is the
one recorded at intake: the queue card's text plus the finish-gate
target it names. From those, this module derives the run's scope —
the exact files the task legitimately touches:

- the target record itself and the method registry (read at plan),
- the artifact the target submits,
- the verifier manifest the target produces,
- Wielder's own runtime area (run workdirs, packets, journals).

Every plan step (checked in the plan node, before anything runs)
and every executed tool result (checked in evaluate, before any
completion route) has its payload paths extracted and compared
against that scope. A path outside it is DRIFT: the run parks, the
`instruction.drift` hook fires an escalation card, and landing is
blocked until the drift is resolved or the owner rules on it —
a ruling is recorded with `wielder drift-waive` and cited wherever
the drift is reported. URLs are not paths and are never flagged;
relative run-file paths resolve inside the run workdir by
construction of the tool layer.

Pure and deterministic: same instruction + same steps in, same
drift list out. The checker flags and blocks; it never rewrites a
plan and never grants a waiver itself.
"""
from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path
from typing import Any, Optional

from . import constitution as C


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def scope_paths_for(target_id: str, target: dict) -> list[str]:
    """The exact files a run on this target legitimately touches."""
    paths = {
        str(C.FINISH_GATE / "targets" / f"{target_id}.json"),
        str(C.FINISH_GATE / "methods" / "INDEX.json"),
        str(C.FINISH_GATE / "evidence" / f"{target['deliverable']}.json"),
    }
    if target.get("artifact"):
        paths.add(str(target["artifact"]))
    return sorted(paths)


def record_instruction(card_title: str, card_description: str,
                       target_id: Optional[str], target: Optional[dict]) -> dict:
    """The instruction record made at intake (plan node)."""
    return {
        "text": f"{card_title}. {card_description or ''}".strip(),
        "target_id": target_id,
        "scope_paths": scope_paths_for(target_id, target) if (target_id and target) else [],
        "scope_methods": list(target.get("method_ids", [])) if target else [],
        "recorded_at": _now(),
    }


def _candidate_paths(value: Any) -> list[str]:
    """Path-like strings inside a payload, recursively. A string is a
    candidate when it is absolute, or contains a slash and ends in a
    file extension. URLs and prose (spaces) are never candidates."""
    out: list[str] = []
    if isinstance(value, str):
        s = value.strip()
        if "://" in s or " " in s or "\n" in s:
            return out
        if s.startswith("/") and len(s) > 1:
            out.append(s)
        elif "/" in s and "." in s.rsplit("/", 1)[-1]:
            out.append(s)
    elif isinstance(value, dict):
        for v in value.values():
            out.extend(_candidate_paths(v))
    elif isinstance(value, (list, tuple)):
        for v in value:
            out.extend(_candidate_paths(v))
    return out


def _in_scope(path: str, instruction: dict) -> bool:
    if path in instruction.get("scope_paths", []):
        return True
    data = str(C.DATA)
    if path == data or path.startswith(data + "/"):
        return True  # Wielder's own runtime area: workdirs, packets, journals
    return False


def fingerprint(tool: str, path: str) -> str:
    return hashlib.sha256(f"{tool}|{path}".encode()).hexdigest()[:16]


def _drift_for(owner: str, tool: str, payload: dict, instruction: dict) -> list[dict]:
    out = []
    for p in _candidate_paths(payload):
        if not _in_scope(p, instruction):
            out.append({"where": owner, "tool": tool, "path": p,
                        "fingerprint": fingerprint(tool, p),
                        "reason": "path outside the instruction's scope "
                                  f"(target {instruction.get('target_id')})"})
    # A verifier/manifest step aimed at a different target than the
    # instruction's is claim drift: work the instruction never named.
    tid = payload.get("target_id")
    if tid and instruction.get("target_id") and tid != instruction["target_id"]:
        out.append({"where": owner, "tool": tool, "path": f"target:{tid}",
                    "fingerprint": fingerprint(tool, f"target:{tid}"),
                    "reason": f"step addresses target {tid}, not the "
                              f"instruction's target {instruction['target_id']}"})
    return out


def _unwaived(drift: list[dict], card_id: Optional[int]) -> list[dict]:
    waived = load_waivers()
    return [d for d in drift
            if (str(card_id), d["fingerprint"]) not in waived]


def check_steps(instruction: dict, steps: list[dict],
                card_id: Optional[int] = None) -> list[dict]:
    """Drift in a plan, before anything runs. `steps` are PlanStep
    dicts ({tool, payload, purpose})."""
    drift: list[dict] = []
    for i, step in enumerate(steps or []):
        drift.extend(_drift_for(f"step {i}", step.get("tool", ""),
                                step.get("payload") or {}, instruction))
    return _unwaived(drift, card_id)


def check_results(instruction: dict, tool_results: list,
                  card_id: Optional[int] = None) -> list[dict]:
    """Drift in what a run actually did, from its tool-result dicts."""
    drift: list[dict] = []
    for i, entry in enumerate(tool_results or []):
        drift.extend(_drift_for(f"result {i}", entry.get("tool", ""),
                                entry.get("payload") or {}, instruction))
    return _unwaived(drift, card_id)


# ---------- owner rulings (waivers) ----------

def waivers_path() -> Path:
    return C.DATA / "instruction-waivers.json"


def load_waivers() -> dict:
    """{(card_id, fingerprint): ruling record} — an owner ruling is
    the only thing that clears a drift flag, and it is recorded."""
    p = waivers_path()
    if not p.exists():
        return {}
    try:
        rows = json.loads(p.read_text()).get("waivers", [])
    except Exception:
        return {}
    return {(str(r["card_id"]), r["fingerprint"]): r for r in rows}


def add_waiver(card_id: int, fp: str, ruling: str) -> dict:
    p = waivers_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    if p.exists():
        try:
            rows = json.loads(p.read_text()).get("waivers", [])
        except Exception:
            rows = []
    rec = {"card_id": int(card_id), "fingerprint": fp, "ruling": ruling,
           "recorded_at": _now()}
    rows = [r for r in rows
            if not (str(r["card_id"]) == str(card_id) and r["fingerprint"] == fp)]
    rows.append(rec)
    p.write_text(json.dumps({"waivers": rows}, indent=1))
    return rec
