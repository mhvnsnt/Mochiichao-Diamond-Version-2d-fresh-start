"""WIELDER parity-build tests — the 2026-10-28 parity-plus additions:
advisory brain seats (callable), the MCP client, parallel fan-out
delegation, event hooks, and the graph preflight regression pin.

Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest


# ---------- graph regression pin ----------

def test_graph_preflight_failure_path_has_json():
    """Regression: graph.preflight formats its desktop-failure blocker
    with json.dumps — the module must import json, or that failure path
    raises NameError instead of parking the run with the evidence."""
    from wielder import graph
    assert graph.json is json


# ---------- brain.advise ----------

def _no_seats():
    return [{"seat": "ollama-local", "installed": False, "serving": False},
            {"seat": "openrouter-free", "installed": False, "serving": False},
            {"seat": "groq-free", "installed": False, "serving": False},
            {"seat": "gemini-free", "installed": False, "serving": False}]


def test_advise_not_configured_is_honest(monkeypatch):
    from wielder import brain
    monkeypatch.setattr(brain, "seat_status", _no_seats)
    out = brain.advise("anything")
    assert out["ok"] is False and out["text"] == ""
    assert "NOT CONFIGURED" in out["detail"]


def test_advise_unknown_seat():
    from wielder import brain
    out = brain.advise("x", seat="no-such-seat")
    assert out["ok"] is False and "unknown seat" in out["detail"]


def test_advise_calls_seat_with_constitution_constraints(monkeypatch):
    from wielder import brain
    seen = {}

    def fake_post(url, body, headers, timeout):
        seen["url"], seen["body"], seen["headers"] = url, body, headers
        return {"choices": [{"message": {"content": "Clause AC-02 status FAIL"}}]}

    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(brain, "_post_json", fake_post)
    out = brain.advise("audit this", seat="openrouter-free")
    assert out["ok"] is True and "AC-02" in out["text"]
    assert seen["headers"]["Authorization"] == "Bearer test-key"
    system = seen["body"]["messages"][0]
    assert system["role"] == "system" and "No praise" in system["content"]


def test_advise_missing_key_is_not_configured(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    out = brain.advise("x", seat="groq-free")
    assert out["ok"] is False and "NOT CONFIGURED" in out["detail"]


def test_advisory_gate_is_env_opt_in(monkeypatch):
    from wielder import brain
    monkeypatch.delenv("WIELDER_ADVISORY", raising=False)
    assert brain.advisory_enabled() is False
    monkeypatch.setenv("WIELDER_ADVISORY", "1")
    assert brain.advisory_enabled() is True


# ---------- hooks ----------

class _FakeBoard:
    def __init__(self, fail=False):
        self.calls = []
        self.fail = fail

    def columns(self):
        return {"Backlog": 7, "Ready": 1}

    def call(self, method, **params):
        self.calls.append((method, params))
        if self.fail:
            raise RuntimeError("board door down")
        return 4242


HOOKS = [{"event": "job.done", "title": "JOB {job} finished",
          "description": "door record for {job}", "column": "Backlog"},
         {"event": "other.event", "title": "never fires here",
          "description": "", "column": "Backlog"}]


def test_emit_creates_card_and_logs(tmp_path, monkeypatch):
    from wielder import constitution as C
    from wielder import hooks
    monkeypatch.setattr(C, "DATA", tmp_path)
    board = _FakeBoard()
    out = hooks.emit("job.done", {"job": "K-9"}, board=board, hooks=HOOKS)
    assert len(out) == 1 and out[0]["status"] == "CARD_CREATED"
    assert out[0]["card_id"] == 4242 and out[0]["hook_title"] == "JOB K-9 finished"
    method, params = board.calls[0]
    assert method == "createTask" and params["title"] == "JOB K-9 finished"
    fired = (tmp_path / "hooks" / "fired.jsonl").read_text().strip().split("\n")
    assert len(fired) == 1 and json.loads(fired[0])["event"] == "job.done"


def test_emit_board_down_is_recorded_never_dropped(tmp_path, monkeypatch):
    from wielder import constitution as C
    from wielder import hooks
    monkeypatch.setattr(C, "DATA", tmp_path)
    out = hooks.emit("job.done", {"job": "K-9"}, board=_FakeBoard(fail=True), hooks=HOOKS)
    assert out[0]["status"] == "RECORDED_BOARD_DOWN" and out[0]["card_id"] is None
    assert hooks.recent_fired()[0]["status"] == "RECORDED_BOARD_DOWN"


def test_drain_inbox_moves_good_and_malformed(tmp_path, monkeypatch):
    from wielder import constitution as C
    from wielder import hooks
    monkeypatch.setattr(C, "DATA", tmp_path)
    box = tmp_path / "hooks-inbox"
    box.mkdir(parents=True)
    (box / "a.json").write_text(json.dumps({"event": "job.done", "payload": {"job": "K-1"}}))
    (box / "b.json").write_text("{not json")
    out = hooks.drain_inbox(board=_FakeBoard(), hooks=HOOKS)
    statuses = sorted(o["status"] for o in out)
    assert statuses == ["CARD_CREATED", "MALFORMED"]
    assert not list(box.glob("*.json"))
    assert len(list((box / "processed").glob("*.json"))) == 2


def test_shipped_configs_carry_no_unconfigured_integrations():
    """Updated in the owner-expansion pass: hooks.json no longer ships
    empty — the expansion named real production events (proof gate,
    instruction drift, loop/stall escalation), and PROVENANCE §D
    always said definitions land as events are named. The guard's
    intent stands: no unconfigured *integrations* ship — the MCP
    server list is still empty, and every shipped hook must be a
    well-formed named event, never a placeholder."""
    from wielder import hooks, mcp_client
    for h in hooks.load_hooks():
        assert h.get("event") and h.get("title") and h.get("column")
    assert mcp_client.load_servers() == []


# ---------- fanout ----------

def test_delegate_many_aggregates_and_isolates_failures(tmp_path, monkeypatch):
    from wielder import constitution as C
    from wielder import fanout
    monkeypatch.setattr(C, "DATA", tmp_path)

    def fake_delegate(ledger, board, parent_run_id, card, scope):
        if int(card["id"]) == 2:
            raise RuntimeError("child boom")
        return {"parent_run_id": parent_run_id, "child_run_id": f"W-{card['id']}",
                "card_id": int(card["id"]), "scope": scope,
                "child_packet": "packet", "child_state": "PARKED"}

    monkeypatch.setattr(fanout, "_delegate_one", fake_delegate)
    items = [{"card": {"id": i, "title": f"card {i}"}, "scope": "s"} for i in (1, 2, 3)]
    agg = fanout.delegate_many("P-1", items, max_workers=2)
    assert agg["counts"] == {"total": 3, "ok": 2, "error": 1}
    assert [c["card_id"] for c in agg["children"]] == [1, 2, 3]  # input order kept
    assert "child boom" in agg["children"][1]["record"]["error"]
    assert Path(agg["record_path"]).exists()


# ---------- mcp client (real end-to-end against Wielder's own server) ----------

def _self_server_config(tmp_path):
    root = Path(__file__).resolve().parents[2]
    cfg = {"servers": [{"name": "self", "command": sys.executable,
                        "args": ["-m", "wielder.mcp_server"],
                        "env": {"PYTHONPATH": str(root)}}]}
    p = tmp_path / "mcp-servers.json"
    p.write_text(json.dumps(cfg))
    return p


def test_mcp_client_discovers_and_calls_own_server(tmp_path, monkeypatch):
    pytest.importorskip("mcp")
    from wielder import authz, mcp_client
    monkeypatch.setattr(authz.C, "DATA", tmp_path)
    cfg = _self_server_config(tmp_path)
    found = mcp_client.discover("self", path=cfg)
    names = {t["name"] for t in found}
    assert {"wielder_tool", "wielder_tools"} <= names
    with pytest.raises(authz.NotAuthorized):
        mcp_client.call("self", "wielder_tools", {}, path=cfg)
    authz.grant("mcp-client", "*")
    res = mcp_client.call("self", "wielder_tools", {}, path=cfg)
    assert res.ok and "run_verifier" in res.raw_output


def test_mcp_registry_entries_validate_payloads(tmp_path, monkeypatch):
    pytest.importorskip("mcp")
    from wielder import authz, mcp_client
    monkeypatch.setattr(authz.C, "DATA", tmp_path)
    authz.grant("mcp-client", "*")
    cfg = _self_server_config(tmp_path)
    entries = mcp_client.registry_entries(path=cfg)
    assert "mcp__self__wielder_tools" in entries
    model, fn = entries["mcp__self__wielder_tools"]
    res = fn(model())
    assert res.ok and "read_manifest" in res.raw_output
    model2, _ = entries["mcp__self__wielder_tool"]
    with pytest.raises(Exception):
        model2(name=123, payload_json="{}")  # schema rejects a non-string name
