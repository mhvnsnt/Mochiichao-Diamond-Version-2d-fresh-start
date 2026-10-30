"""WIELDER durable jobs — a run interrupted mid-job resumes with no
step repeated and no step lost.

Temporal is the exemplar (parity matrix, follow-up): a workflow's
completed activities are recorded in an event history and, on
recovery, their recorded results are handed back instead of being
recomputed. Wielder's form of that pattern:

- The LangGraph checkpoint (graph.sqlite) already carries the run's
  state between nodes — a crash leaves the checkpoint at the last
  completed node, and `graph.invoke(None)` re-enters at the pending
  node (measured on this stack, not assumed).
- Node granularity is too coarse inside the execute node, where the
  expensive steps live. So every completed plan step is written to
  a per-run step journal (append-only JSONL, fsynced per step)
  the moment it finishes. On re-entry, execute() rehydrates
  journaled steps from the journal instead of re-running them:
  a completed step is never repeated, and the step that died
  mid-execution is the only one re-attempted.
- A usage-limit / budget stop parks the run inside execute(); its
  thread is finished, so resume forks the thread from the
  checkpoint where execute() was pending (LangGraph time-travel)
  and the journal carries the completed steps across.

Resume events are appended to the same journal, so the journal IS
the resume log the finish packet can cite as evidence. The one
re-run on a crash resume is the gate-calibration pre-flight — a
read-only check against an existing manifest, idempotent by
design, and named here rather than hidden.
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any, Callable, Optional

from . import constitution as C


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def journal_path(run_id: str) -> Path:
    return C.DATA / "runs" / run_id / "step-journal.jsonl"


def fingerprint(step: dict) -> str:
    """Stable identity of a plan step: tool + canonical payload."""
    canon = json.dumps({"tool": step.get("tool"), "payload": step.get("payload") or {}},
                       sort_keys=True, default=str)
    return hashlib.sha256(canon.encode()).hexdigest()[:16]


def _append(run_id: str, record: dict) -> None:
    p = journal_path(run_id)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "a") as f:
        f.write(json.dumps(record) + "\n")
        f.flush()
        os.fsync(f.fileno())


def load(run_id: str) -> dict[int, dict]:
    """{step_index: journal entry} for completed steps of a run."""
    p = journal_path(run_id)
    out: dict[int, dict] = {}
    if not p.exists():
        return out
    for line in p.read_text().splitlines():
        if not line.strip():
            continue
        try:
            rec = json.loads(line)
        except Exception:
            continue  # a torn final line from a crash mid-append is skipped
        if "index" in rec and "result" in rec:
            out[int(rec["index"])] = rec
    return out


def record_step(run_id: str, index: int, step: dict, result: dict) -> None:
    _append(run_id, {"index": index, "fingerprint": fingerprint(step),
                     "tool": step.get("tool"), "result": result, "ts": _now()})


def record_resume(run_id: str, mode: str, detail: dict) -> None:
    _append(run_id, {"event": "resume", "mode": mode, "detail": detail, "ts": _now()})


def resume_events(run_id: str) -> list[dict]:
    p = journal_path(run_id)
    if not p.exists():
        return []
    out = []
    for line in p.read_text().splitlines():
        try:
            rec = json.loads(line)
        except Exception:
            continue
        if rec.get("event") == "resume":
            out.append(rec)
    return out


def run_steps(run_id: str, steps: list[dict],
              runner: Callable[[dict], dict],
              max_steps: int) -> tuple[list[dict], Optional[int]]:
    """Run a plan's steps under the journal. `runner(step_dict)` ->
    tool-result dict; it may raise (a crash) — the journal then
    holds exactly the steps that completed, and a later call with
    the same run_id continues from the first uncompleted step.

    Returns (results, exhausted_at): exhausted_at is the index of
    the first step NOT run because this invocation's step budget
    (max_steps newly executed steps) ran out, else None. Journaled
    steps are rehydrated, never re-run, and do not consume budget —
    a resumed run gets a fresh budget window for the work that
    remains, which is what a usage-limit resume means."""
    done = load(run_id)
    results: list[dict] = []
    spent = 0
    for i, step in enumerate(steps):
        entry = done.get(i)
        if entry is not None and entry["fingerprint"] == fingerprint(step):
            results.append(entry["result"])
            continue
        if spent >= max_steps:
            return results, i
        result = runner(step)
        record_step(run_id, i, step, result)
        results.append(result)
        spent += 1
    return results, None


def resume_plan(ledger_state: str, pending_next: tuple) -> str:
    """Decide how a run may be resumed, from its ledger state and
    the checkpoint's pending nodes. Pure decision, separately
    testable; graph.resume_job executes it.

    - "crash": the thread still has execute() pending and the
      ledger sits in EXECUTING — re-enter with invoke(None); the
      journal prevents step repetition.
    - "budget-fork": the thread finished (budget park) and the
      ledger is PARKED — fork from the checkpoint where execute()
      was pending and re-enter; the journal carries completed steps.
    - "owner-gate": the pending node is the owner gate — that path
      belongs to graph.resume_run (owner verdict), not this one.
    - "refuse": anything else — named, nothing improvised; the
      checkpoint and journal are preserved untouched."""
    nxt = tuple(pending_next or ())
    if nxt == ("owner_gate",):
        return "owner-gate"
    if "execute" in nxt and ledger_state == "EXECUTING":
        return "crash"
    if not nxt and ledger_state == "PARKED":
        return "budget-fork"
    return "refuse"
