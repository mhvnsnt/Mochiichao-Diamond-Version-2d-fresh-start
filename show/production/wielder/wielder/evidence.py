"""WIELDER proof gate — a verifier PASS is not a completion unless
the finish packet carries the evidence.

The failure this kills (owner's words): agents saying "done" with
nothing to show. The finish-gate verifier (a separate, scorer-owned
system) issues the only PASS — but a PASS verdict on its own is a
claim about measurements recorded elsewhere. This module is the
consumer-side hardening inside Wielder: before a run may route to
success or to the owner gate on an all-PASS manifest, the run's own
tool record must carry the evidence artifacts, each hash-bound:

- the verifier's own output (the test output) for this target —
  hashed here, so the packet cites bytes, not a summary;
- the verifier manifest itself, as read back by `read_manifest`,
  with its sha256;
- a `hash_file` record for the artifact the run submits — and when
  that artifact is a visual (image/video), that same hash record is
  the frame evidence: the exact bytes the verifier and the owner
  judge are the bytes named in the packet.

A verifier pass without attached evidence is a FAIL at this gate:
the graph parks the run with the missing items named. This module
never issues a PASS of its own and never edits the finish-gate —
it decides only whether Wielder may *report* completion. Pure and
deterministic: same tool record in, same verdict out.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any, Optional

VISUAL_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif",
               ".mp4", ".webm", ".mov", ".m4v"}

MISSING_VERIFIER_OUTPUT = "verifier test output (run_verifier raw output for the target)"
MISSING_MANIFEST = "verifier manifest hash (read_manifest sha256 for the target)"


def _sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", "replace")).hexdigest()


def _payload(entry: dict) -> dict:
    return entry.get("payload") or {}


def collect(tool_results: list, target_id: Optional[str]) -> list[dict]:
    """Extract the evidence bundle from a run's tool-result dicts
    (graph shape: model_dump + payload). Each item is hash-bound."""
    bundle: list[dict] = []
    for entry in tool_results or []:
        tool = entry.get("tool")
        result = entry.get("result") or {}
        if tool == "run_verifier" and _payload(entry).get("target_id") == target_id:
            raw = entry.get("raw_output") or ""
            if raw.strip():
                bundle.append({"kind": "verifier_output",
                               "ref": f"run_verifier:{target_id}",
                               "sha256": _sha256_text(raw),
                               "detail": f"{len(raw)} chars of verifier output"})
        elif tool == "read_manifest" and _payload(entry).get("target_id") == target_id:
            if result.get("exists") and result.get("sha256"):
                bundle.append({"kind": "manifest",
                               "ref": result.get("manifest_path") or f"manifest:{target_id}",
                               "sha256": result["sha256"],
                               "detail": "verifier manifest as read back"})
        elif tool == "hash_file":
            if result.get("exists") and result.get("sha256"):
                bundle.append({"kind": "artifact_hash",
                               "ref": _payload(entry).get("path") or result.get("path"),
                               "sha256": result["sha256"],
                               "detail": f"{result.get('bytes')} bytes"})
    return bundle


def is_visual(path: Optional[str]) -> bool:
    return bool(path) and Path(str(path)).suffix.lower() in VISUAL_EXTS


def check(tool_results: list, target_id: Optional[str],
          artifact_path: Optional[str] = None) -> dict:
    """The proof-gate check over a run's tool record. `complete` is
    True only when every required evidence class is present."""
    bundle = collect(tool_results, target_id)
    kinds = {b["kind"] for b in bundle}
    missing: list[str] = []
    if "verifier_output" not in kinds:
        missing.append(MISSING_VERIFIER_OUTPUT)
    if "manifest" not in kinds:
        missing.append(MISSING_MANIFEST)
    if artifact_path:
        hashed = {b["ref"] for b in bundle if b["kind"] == "artifact_hash"}
        if artifact_path not in hashed:
            if is_visual(artifact_path):
                missing.append(
                    f"visual/frame evidence hash for the artifact ({artifact_path})")
            else:
                missing.append(f"artifact hash evidence ({artifact_path})")
    return {"complete": not missing, "missing": missing, "bundle": bundle}


def proof_gate(manifest: dict, tool_results: list, target_id: Optional[str],
               artifact_path: Optional[str] = None) -> dict:
    """The gate decision the graph routes on. `applies` is True only
    when the verifier's clauses all PASS — clause failures are the
    verifier path's business, not this gate's. When it applies, an
    incomplete evidence bundle means the run may not be reported
    complete, whatever the verdict says."""
    clauses = (manifest or {}).get("clauses", [])
    applies = bool(clauses) and all(c.get("status") == "PASS" for c in clauses)
    rep = check(tool_results, target_id, artifact_path)
    return {"applies": applies, "complete": rep["complete"] if applies else False,
            "missing": rep["missing"], "bundle": rep["bundle"]}


def from_ledger_rows(tool_calls: list) -> list[dict]:
    """Adapt ledger tool-call rows (JSON strings) to the graph's
    tool-result dict shape, for the packet's evidence section."""
    import json
    out = []
    for tc in tool_calls or []:
        def _load(v):
            if isinstance(v, str):
                try:
                    return json.loads(v)
                except Exception:
                    return {}
            return v or {}
        out.append({"tool": tc.get("tool"), "payload": _load(tc.get("payload")),
                    "result": _load(tc.get("result")),
                    "raw_output": tc.get("raw_output") or ""})
    return out
