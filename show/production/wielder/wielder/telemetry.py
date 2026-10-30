"""WIELDER telemetry export — the Langfuse mirror (export half).

Round-1 parity gap #3: Wielder's telemetry of record is its SQLite
ledger + per-run packets. Langfuse (self-hosted core, MIT Expat; the
`ee/` trees are under the Langfuse Enterprise License and are never
used — see PROVENANCE.md) is the optional mirror. This module is the
projection from the record to the mirror, in Langfuse's documented
public ingestion shape — it wires the client/protocol, not the
server code:

- **Batch ingestion payload.** `POST {LANGFUSE_HOST}/api/public/ingestion`
  with HTTP Basic auth (public key as username, secret key as
  password) and body `{"batch": [event, ...]}`. Each event is
  `{"id", "timestamp", "type", "body"}`. One run becomes one
  `trace-create` event; each ledger tool call (a run step) becomes
  one `span-create` event — a span is Langfuse's observation type
  for a non-LLM step — carrying the step's payload as `input` and
  its result + raw output as `output`. Event and observation ids
  are deterministic (uuid5 over the run id + step id), so a
  re-export deduplicates server-side instead of duplicating traces.
- **Local mirror, always.** Every export writes the exact payload
  that would be POSTed, plus a JSONL mirror, under the caller's
  output directory — traces exist locally even with no server, and
  the mirror round-trips through `read_mirror`.
- **Honest seat status.** With `LANGFUSE_HOST` /
  `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` all present in the
  environment, `export_runs` POSTs the batch and reports the HTTP
  result. Without them it writes the local files and reports
  NOT CONFIGURED — the same seat-status honesty as `wielder seats`.
  Key values are never written to any file, log line, or report;
  only their presence is recorded.

The ledger stays the source of truth: this module reads it and
never writes to it.
"""
from __future__ import annotations

import base64
import json
import os
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from .ledger import Ledger

INGESTION_PATH = "/api/public/ingestion"
_NS = uuid.UUID("6c616e67-6675-7365-2d77-69656c646572")  # "langfuse-wielder"
_RAW_CAP = 4000  # raw step output carried per observation (ledger caps at 8000)


def _event_id(*parts: str) -> str:
    return str(uuid.uuid5(_NS, ":".join(parts)))


def _iso(ts: Optional[str]) -> Optional[str]:
    """Ledger timestamps (`%Y-%m-%dT%H:%M:%S%z`) -> ISO 8601 with a
    colon offset, which is what Langfuse's parser expects. Anything
    unparsable passes through unchanged rather than being invented."""
    if not ts:
        return None
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z").isoformat()
    except (ValueError, TypeError):
        return ts


def _as_obj(value):
    """Ledger tool-call payload/result columns are JSON strings;
    accept an already-parsed object too, and pass prose through."""
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            return value
    return value


# ---------------------------------------------------------------------------
# Configuration — presence only, never values (seat-status style)
# ---------------------------------------------------------------------------

def langfuse_config(env: Optional[dict] = None) -> dict:
    env = os.environ if env is None else env
    host = (env.get("LANGFUSE_HOST") or "").rstrip("/")
    has_pub = bool(env.get("LANGFUSE_PUBLIC_KEY"))
    has_sec = bool(env.get("LANGFUSE_SECRET_KEY"))
    return {"host": host or None, "public_key_present": has_pub,
            "secret_key_present": has_sec,
            "configured": bool(host and has_pub and has_sec)}


# ---------------------------------------------------------------------------
# Ledger run -> ingestion events
# ---------------------------------------------------------------------------

def run_to_events(run: dict) -> list[dict]:
    """One Wielder run record (Ledger.get_run shape) -> ingestion
    events: one trace-create + one span-create per tool call."""
    run_id = run["run_id"]
    created = _iso(run.get("created_at"))
    trace_body = {
        "id": run_id,
        "name": f"wielder run {run_id}",
        "timestamp": created,
        "input": {"card_id": run.get("card_id"), "card_title": run.get("card_title")},
        "output": {"state": run.get("state"), "blocker": run.get("blocker")},
        "metadata": {
            "run_id": run_id, "target_id": run.get("target_id"),
            "state": run.get("state"), "retries": run.get("retries"),
            "manifest_path": run.get("manifest_path"),
            "manifest_sha256": run.get("manifest_sha256"),
            "transitions": [
                {"from": t.get("from"), "to": t.get("to"),
                 "reason": t.get("reason"), "ts": _iso(t.get("ts"))}
                for t in run.get("transitions", [])],
        },
        "tags": ["wielder", str(run.get("state") or "unknown").lower()],
    }
    events = [{"id": _event_id(run_id, "trace-create"), "timestamp": created,
               "type": "trace-create", "body": trace_body}]
    for tc in run.get("tool_calls", []):
        obs_id = _event_id(run_id, "span", str(tc.get("id")))
        ts = _iso(tc.get("ts")) or created
        ok = bool(tc.get("ok"))
        body = {
            "id": obs_id,
            "traceId": run_id,
            "name": tc.get("tool"),
            "startTime": ts,
            "endTime": ts,
            "input": _as_obj(tc.get("payload")),
            "output": {"ok": ok, "exit_code": tc.get("exit_code"),
                       "result": _as_obj(tc.get("result")),
                       "raw_output": (tc.get("raw_output") or "")[:_RAW_CAP]},
            "level": "DEFAULT" if ok else "ERROR",
            "metadata": {"run_id": run_id, "tool_call_id": tc.get("id"),
                         "tool": tc.get("tool"), "exit_code": tc.get("exit_code")},
        }
        if not ok:
            body["statusMessage"] = (tc.get("raw_output") or "")[:500]
        events.append({"id": _event_id(run_id, "span-create", str(tc.get("id"))),
                       "timestamp": ts, "type": "span-create", "body": body})
    return events


def build_batch(ledger: Ledger, run_id: Optional[str] = None,
                limit: int = 50) -> tuple[dict, list[str]]:
    """The exact ingestion payload for one run (or the most recent
    `limit` runs). Returns (payload, run_ids)."""
    runs = [ledger.get_run(run_id)] if run_id else \
        [ledger.get_run(r["run_id"]) for r in ledger.list_runs(limit)]
    batch: list[dict] = []
    for run in runs:
        batch.extend(run_to_events(run))
    return {"batch": batch}, [r["run_id"] for r in runs]


# ---------------------------------------------------------------------------
# POST — only when configured; the payload is identical either way
# ---------------------------------------------------------------------------

def post_batch(payload: dict, env: Optional[dict] = None) -> dict:
    cfg = langfuse_config(env)
    if not cfg["configured"]:
        return {"configured": False, "posted": False,
                "detail": "NOT CONFIGURED — LANGFUSE_HOST / LANGFUSE_PUBLIC_KEY / "
                          "LANGFUSE_SECRET_KEY not all present; payload written "
                          "locally only"}
    env = os.environ if env is None else env
    auth = base64.b64encode(
        f"{env['LANGFUSE_PUBLIC_KEY']}:{env['LANGFUSE_SECRET_KEY']}".encode()
    ).decode()
    req = urllib.request.Request(
        cfg["host"] + INGESTION_PATH,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Basic {auth}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return {"configured": True, "posted": True, "status": r.status,
                    "detail": f"Langfuse ingestion answered HTTP {r.status}"}
    except Exception as e:
        return {"configured": True, "posted": False,
                "detail": f"POST failed — {type(e).__name__}: {e}"}


# ---------------------------------------------------------------------------
# Export — local mirror always, POST when configured
# ---------------------------------------------------------------------------

def export_runs(ledger: Ledger, out_dir: str | Path,
                run_id: Optional[str] = None, limit: int = 50,
                env: Optional[dict] = None, post: bool = True) -> dict:
    """Export runs to `out_dir`:
      langfuse-batch.json  — the exact ingestion POST body
      mirror.jsonl         — one event per line (the local mirror)
      traces/<run_id>.json — that run's events, inspectable alone
    Returns a report dict; no key material appears in it or on disk."""
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    payload, run_ids = build_batch(ledger, run_id=run_id, limit=limit)
    (out / "langfuse-batch.json").write_text(json.dumps(payload, indent=1))
    with open(out / "mirror.jsonl", "w") as f:
        for ev in payload["batch"]:
            f.write(json.dumps(ev) + "\n")
    traces_dir = out / "traces"
    traces_dir.mkdir(exist_ok=True)
    for rid in run_ids:
        evs = [e for e in payload["batch"]
               if e["body"].get("id") == rid or e["body"].get("traceId") == rid]
        (traces_dir / f"{rid}.json").write_text(
            json.dumps({"run_id": rid, "events": evs}, indent=1))
    report = {"runs": run_ids, "traces": len(run_ids),
              "events": len(payload["batch"]),
              "observations": sum(1 for e in payload["batch"]
                                  if e["type"] == "span-create"),
              "out_dir": str(out),
              "files": [str(out / "langfuse-batch.json"),
                        str(out / "mirror.jsonl")]
                       + [str(traces_dir / f"{r}.json") for r in run_ids],
              "langfuse": post_batch(payload, env=env) if post else
                          {"configured": langfuse_config(env)["configured"],
                           "posted": False, "detail": "posting skipped by caller"}}
    return report


def read_mirror(out_dir: str | Path) -> list[dict]:
    """Read the local mirror back — the round-trip counterpart of
    export_runs. A missing mirror reads as an empty list."""
    p = Path(out_dir) / "mirror.jsonl"
    if not p.exists():
        return []
    return [json.loads(ln) for ln in p.read_text().splitlines() if ln.strip()]
