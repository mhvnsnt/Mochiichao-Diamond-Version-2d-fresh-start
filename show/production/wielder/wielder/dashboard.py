"""WIELDER dashboard — read-only status surface over the run ledger.
Title and surface are Wielder's; it renders ledger facts, nothing else.
Run: uvicorn wielder.dashboard:app --host 127.0.0.1 --port 8898
"""
from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse

from . import constitution as C
from . import judgment as judgment_mod
from .ledger import Ledger

app = FastAPI(title="WIELDER")


def _run_or_404(run_id: str) -> dict:
    try:
        return Ledger().get_run(run_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"no run {run_id} in the ledger")


def _verdict(run: dict):
    """The verifier's verdict for a run, from its manifest file only —
    the same headline the packet carries. None when no manifest exists:
    this surface issues no verdict of its own."""
    path = run.get("manifest_path")
    if path and Path(path).exists():
        try:
            return judgment_mod.headline(json.loads(Path(path).read_text()))
        except Exception:
            return None
    return None


@app.get("/runs")
def runs():
    return Ledger().list_runs()


@app.get("/runs/{run_id}")
def run(run_id: str):
    return _run_or_404(run_id)


@app.get("/runs/{run_id}/timeline")
def run_timeline(run_id: str):
    """Run timeline + tool-call inspection as JSON: ledger transitions
    and tool calls exactly as recorded (payload/result/raw included),
    plus the manifest-issued verdict. Read-only (parity round 2 —
    the chat surface renders the same data as `timeline <run_id>`)."""
    r = _run_or_404(run_id)
    return {"run_id": r["run_id"], "card_id": r["card_id"],
            "card_title": r["card_title"], "target_id": r["target_id"],
            "ledger_state": r["state"], "blocker": r["blocker"],
            "manifest_path": r["manifest_path"],
            "manifest_sha256": r["manifest_sha256"],
            "verdict": _verdict(r),
            "transitions": r["transitions"],
            "tool_calls": r["tool_calls"],
            "inputs": r["inputs"]}


@app.get("/runs/{run_id}/packet")
def run_packet(run_id: str):
    """The run's review packet, if one has been generated. Read-only:
    this surface does not generate packets (that is report.build_packet,
    via the CLI or chat) — a missing packet is reported, not invented."""
    _run_or_404(run_id)
    packet = C.DATA / "runs" / run_id / "packet.md"
    if not packet.exists():
        return {"run_id": run_id, "packet": None,
                "note": "no packet has been generated for this run yet"}
    return {"run_id": run_id, "packet_path": str(packet),
            "packet": packet.read_text()}


@app.get("/", response_class=HTMLResponse)
def index():
    rows = "".join(
        f"<tr><td>{r['run_id']}</td><td>{r['state']}</td><td>#{r['card_id']}</td>"
        f"<td>{r['card_title']}</td><td>{r['blocker'] or ''}</td>"
        f"<td><a href='/runs/{r['run_id']}/timeline'>timeline</a> · "
        f"<a href='/runs/{r['run_id']}/packet'>packet</a></td></tr>"
        for r in Ledger().list_runs())
    return ("<html><head><title>WIELDER</title></head><body>"
            "<h1>WIELDER — production Agentic AI system for the Mochiichao show</h1>"
            "<p>Read-only view of the run ledger. Done is issued only by the "
            "finish-gate verifier; this page reports ledger state.</p>"
            f"<table border='1' cellspacing='0' cellpadding='4'>{rows}</table>"
            "</body></html>")
