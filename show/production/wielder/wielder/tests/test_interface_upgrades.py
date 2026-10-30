"""Interface-upgrade tests (parity round 2) — the pure data-shaping
functions behind the chat/dashboard surfaces, against fixture
ledger/queue data. The invariant under test throughout: a surface may
only show what the ledger, the board, or the verifier manifest
recorded — a verdict comes from the manifest file or not at all.

Run: python -m pytest wielder/tests/test_interface_upgrades.py -q
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import chat
from wielder.ledger import Ledger


# ---------------------------------------------------------------- fixtures

class FakeBoard:
    def __init__(self, cols, fail_cols=()):
        self._cols = cols
        self._fail = set(fail_cols)

    def tasks_in(self, column_title):
        if column_title in self._fail:
            raise RuntimeError("board door down")
        return self._cols.get(column_title, [])


def _run_dict(**over):
    run = {"run_id": "W-abc123", "card_id": 7, "card_title": "Fix the gate",
           "target_id": "gate-1", "state": "PARKED", "blocker": None,
           "manifest_path": None, "manifest_sha256": None, "retries": 0,
           "transitions": [], "tool_calls": [], "inputs": []}
    run.update(over)
    return run


def _manifest(tmp_path, clauses=None, owner="PENDING"):
    man = {"target_id": "gate-1",
           "clauses": clauses if clauses is not None
           else [{"id": "AC-01", "measurer": "m", "status": "PASS",
                  "measured": "ok", "threshold": "x"}],
           "owner_gate": {"status": owner}}
    p = tmp_path / "manifest.json"
    p.write_text(json.dumps(man))
    return p, man


# ------------------------------------------------------------------- board

def test_board_snapshot_counts_cards_and_reports_errors():
    board = FakeBoard(
        {"Backlog": [{"id": 1, "title": "a"}, {"id": 2, "title": "b"}],
         "Ready": [{"id": 3, "title": "c"}], "Doing": [], "Verify": [],
         "Owner review": [], "Done": [{"id": 9, "title": "z"}]},
        fail_cols={"Verify"})
    snap = chat.board_snapshot(board)
    assert [t["id"] for t in snap["columns"]["Backlog"]] == [1, 2]
    assert snap["columns"]["Ready"][0]["title"] == "c"
    assert snap["errors"] == {"Verify": "board door down"}
    text = chat.render_board(snap)
    assert "**Backlog** (2)" in text and "#3 c" in text
    assert "board read failed" in text  # an unreadable column is named, not faked empty
    assert "4 active card(s)" in text


# ---------------------------------------------------------------- timeline

def test_timeline_merges_transitions_and_tools_with_elapsed():
    run = _run_dict(
        transitions=[
            {"id": 1, "run_id": "W-abc123", "from": None, "to": "IDLE",
             "reason": "run opened", "ts": "2026-10-28T10:00:00-0500"},
            {"id": 2, "run_id": "W-abc123", "from": "IDLE", "to": "PLANNING",
             "reason": "plan", "ts": "2026-10-28T10:00:05-0500"}],
        tool_calls=[
            {"id": 1, "run_id": "W-abc123", "tool": "check_artifact",
             "payload": json.dumps({"path": "/x.png"}), "ok": 1, "exit_code": 0,
             "result": json.dumps({"exists": True}), "raw_output": "found",
             "ts": "2026-10-28T10:01:05-0500"}])
    events = chat.build_timeline(run)
    assert [e["kind"] for e in events] == ["transition", "transition", "tool"]
    assert events[0]["elapsed_s"] is None
    assert events[1]["elapsed_s"] == 5
    assert events[2]["elapsed_s"] == 60
    assert events[2]["ok"] is True and events[2]["exit_code"] == 0
    assert events[2]["payload"] == {"path": "/x.png"}  # payload JSON parsed for inspection
    text = chat.render_timeline(run)
    assert "Ledger state: **PARKED** (the ledger's record, not a verdict)" in text
    assert "no per-call duration" in text  # elapsed is labelled honestly


def test_tool_inspection_shows_payload_result_and_raw():
    run = _run_dict(tool_calls=[
        {"id": 1, "run_id": "W-abc123", "tool": "run_verifier",
         "payload": json.dumps({"target_id": "gate-1"}), "ok": 0, "exit_code": 2,
         "result": json.dumps({"clauses": 3}), "raw_output": "boom",
         "ts": "2026-10-28T10:00:00-0500"}])
    text = chat.render_tool_inspection(run)
    assert "run_verifier" in text and "exit=2" in text
    assert '"target_id": "gate-1"' in text and "boom" in text


def test_verdict_comes_from_the_manifest_file_only(tmp_path):
    # A real ledger run whose manifest exists: verdict = the manifest's headline.
    led = Ledger(tmp_path / "led.sqlite")
    rid = led.open_run(7, "Fix the gate", "gate-1")
    mpath, _man = _manifest(tmp_path)
    led.set_outcome(rid, manifest_path=str(mpath), manifest_sha256="deadbeef")
    run = led.get_run(rid)
    verdict = chat.verdict_for_run(run)
    assert verdict.startswith("CORE RESULT: machine clauses PASS")
    assert "owner gate has not ruled" in verdict  # PENDING stays not-done

    # A failing clause in the manifest surfaces as issued — failures first.
    mpath2, _ = _manifest(tmp_path / "sub" if False else tmp_path,
                          clauses=[{"id": "AC-02", "measurer": "bg", "status": "FAIL",
                                    "measured": "12 white frames", "threshold": "0"}],
                          owner="APPROVED")
    run2 = _run_dict(manifest_path=str(mpath2))
    assert chat.verdict_for_run(run2).startswith("CORE RESULT: FAIL")


def test_no_manifest_means_no_verdict_even_for_success_state():
    # The hard rule: ledger state SUCCESS without a manifest on record
    # must NOT be rendered as a verdict.
    run = _run_dict(state="SUCCESS", manifest_path=None)
    assert chat.verdict_for_run(run) == chat._NO_VERDICT
    run_missing_file = _run_dict(state="SUCCESS", manifest_path="/nope/manifest.json")
    assert chat.verdict_for_run(run_missing_file) == chat._NO_VERDICT


def test_plan_steps_from_checkpoint_state():
    state = {"plan": {"steps": [{"tool": "check_artifact", "purpose": "observe",
                                 "payload": {"path": "/x"}},
                                {"tool": "run_verifier", "purpose": "submit",
                                 "payload": {}}]}}
    steps = chat.plan_steps_from_state(state)
    assert [s["tool"] for s in steps] == ["check_artifact", "run_verifier"]
    assert chat.plan_steps_from_state(None) == []
    assert chat.plan_steps_from_state({}) == []


# ------------------------------------------------------------------ packet

def test_packet_preview_data_splits_existing_and_missing(tmp_path):
    packet = tmp_path / "packet.md"
    packet.write_text("# packet\n")
    mpath, _ = _manifest(tmp_path)
    real_input = tmp_path / "in.png"
    real_input.write_bytes(b"\x89PNG")
    run = _run_dict(manifest_path=str(mpath),
                    inputs=[{"id": 1, "run_id": "W-abc123", "kind": "artifact",
                             "path": str(real_input), "sha256": "x", "bytes": 4,
                             "ts": "t"},
                            {"id": 2, "run_id": "W-abc123", "kind": "target",
                             "path": str(tmp_path / "gone.json"), "sha256": "y",
                             "bytes": 1, "ts": "t"}])
    preview = chat.packet_preview_data(run, packet)
    labels = {a["label"] for a in preview["artifacts"]}
    assert labels == {"packet", "verifier manifest", "input (artifact)"}
    assert all(len(a["sha256"]) == 64 for a in preview["artifacts"])
    assert any("gone.json" in m for m in preview["missing"])
    text = chat.render_packet_preview(preview)
    assert "Named as missing" in text and "packet.md" in text
    assert preview["packet_text"] == "# packet\n"


# ------------------------------------------------------------- gates/resume

def test_pending_owner_gates_and_resume_modes():
    gate_run = _run_dict(run_id="W-g1", state="PARKED",
                         blocker="Machine clauses all PASS; owner gate is PENDING")
    budget_run = _run_dict(run_id="W-b1", state="PARKED",
                           blocker="step budget exhausted (40) — parked")
    done_run = _run_dict(run_id="W-d1", state="SUCCESS", blocker=None)
    failed_run = _run_dict(run_id="W-f1", state="FAILED", blocker="x")
    runs = [gate_run, budget_run, done_run, failed_run]
    assert [g["run_id"] for g in chat.pending_owner_gates(runs)] == ["W-g1"]
    assert chat.resume_mode_for(gate_run) == "owner-gate"      # graph.resume_run
    assert chat.resume_mode_for(budget_run) == "durable-job"   # graph.resume_job
    assert chat.resume_mode_for(done_run) is None
    assert chat.resume_mode_for(failed_run) is None
    items = chat.resumable_runs(runs)
    assert [(i["run_id"], i["mode"]) for i in items] == [("W-g1", "owner-gate"),
                                                         ("W-b1", "durable-job")]
    assert "graph.resume_run" in chat.render_resumable(items)
    assert "No runs are parked at the owner gate" in chat.render_gates([])


def test_render_checkpoints_and_run_id_normalisation():
    assert chat._normalize_run_id("w-abc123") == "W-abc123"
    assert chat._normalize_run_id("W-abc123") == "W-abc123"
    rows = [{"checkpoint_id": "abcd1234efgh", "next": ["owner_gate"],
             "values_keys": ["plan", "run_id"]}]
    text = chat.render_checkpoints("W-abc123", rows)
    assert "abcd1234efgh" in text and "1 checkpoint(s)" in text
    assert "not a Wielder function" in text  # arbitrary restore: named, not implied
    assert "No checkpoints recorded" in chat.render_checkpoints("W-x", [])


# --------------------------------------------------------------- dashboard

def test_dashboard_timeline_endpoint_serves_ledger_and_manifest(tmp_path, monkeypatch):
    from fastapi.testclient import TestClient

    from wielder import constitution as C
    from wielder import dashboard

    monkeypatch.setattr(C, "DATA", tmp_path)
    led = Ledger()  # default path now resolves under tmp_path
    rid = led.open_run(7, "Fix the gate", "gate-1")
    led.transition(rid, "PLANNING", "plan")
    led.log_tool(rid, "check_artifact", {"path": "/x"}, True, 0,
                 {"exists": True}, "found")
    client = TestClient(dashboard.app)
    out = client.get(f"/runs/{rid}/timeline")
    assert out.status_code == 200
    body = out.json()
    assert body["ledger_state"] == "PLANNING"
    assert body["verdict"] is None  # no manifest -> the surface issues no verdict
    assert body["tool_calls"][0]["tool"] == "check_artifact"
    assert body["transitions"][0]["to"] == "IDLE"
    assert client.get("/runs/W-nope/timeline").status_code == 404
    pkt = client.get(f"/runs/{rid}/packet").json()
    assert pkt["packet"] is None and "no packet" in pkt["note"]
