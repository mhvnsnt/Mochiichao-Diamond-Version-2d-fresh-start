"""WIELDER telemetry-export tests (parity round 2, gap 3, export half).

A fake ledger with known runs exports to Langfuse's public ingestion
shape: one trace per run, steps as span observations. The local
mirror files exist and round-trip. Without Langfuse env the export
reports NOT CONFIGURED honestly and still writes everything locally;
with env (and the POST stubbed) the same payload is what gets sent.

Run: python -m pytest wielder/tests/test_telemetry_export.py -q
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder.ledger import Ledger


def _fake_ledger(tmp_path) -> tuple[Ledger, str, str]:
    led = Ledger(tmp_path / "ledger.sqlite")
    r1 = led.open_run(7, "demo card one", "demo-target")
    led.transition(r1, "PLANNING", "plan")
    led.transition(r1, "EXECUTING", "execute")
    led.log_tool(r1, "check_artifact", {"path": "/tmp/a.png"}, True, 0,
                 {"exists_nonempty": True}, "artifact present")
    led.log_tool(r1, "run_verifier", {"target_id": "demo-target"}, True, 0,
                 {"manifest_exists": True}, "verifier ok")
    led.log_tool(r1, "read_manifest", {"target_id": "demo-target"}, False, 1,
                 {"exists": False}, "no manifest yet")
    r2 = led.open_run(8, "demo card two", None)
    led.log_tool(r2, "hash_file", {"path": "/tmp/b.png"}, True, 0,
                 {"sha256": "ab" * 32}, "hashed")
    return led, r1, r2


# ---------- payload structure ----------

def test_batch_has_one_trace_per_run_and_steps_as_observations(tmp_path):
    from wielder import telemetry
    led, r1, r2 = _fake_ledger(tmp_path)
    payload, run_ids = telemetry.build_batch(led)
    assert set(run_ids) == {r1, r2}
    batch = payload["batch"]
    traces = [e for e in batch if e["type"] == "trace-create"]
    spans = [e for e in batch if e["type"] == "span-create"]
    assert {t["body"]["id"] for t in traces} == {r1, r2}  # one trace per run
    assert len(spans) == 4  # 3 steps on r1 + 1 step on r2
    assert {s["body"]["traceId"] for s in spans} == {r1, r2}
    assert {s["body"]["name"] for s in spans} == \
        {"check_artifact", "run_verifier", "read_manifest", "hash_file"}
    # Envelope shape: every event carries id + timestamp + type + body.
    for e in batch:
        assert e["id"] and e["timestamp"] and e["type"] and isinstance(e["body"], dict)
    # A failed step is an ERROR-level observation with its input intact.
    bad = next(s for s in spans if s["body"]["name"] == "read_manifest")
    assert bad["body"]["level"] == "ERROR"
    assert bad["body"]["input"] == {"target_id": "demo-target"}
    assert bad["body"]["output"]["result"] == {"exists": False}
    good = next(s for s in spans if s["body"]["name"] == "check_artifact")
    assert good["body"]["level"] == "DEFAULT"
    assert good["body"]["output"]["result"] == {"exists_nonempty": True}


def test_single_run_export_and_deterministic_ids(tmp_path):
    from wielder import telemetry
    led, r1, _r2 = _fake_ledger(tmp_path)
    p1, _ = telemetry.build_batch(led, run_id=r1)
    p2, _ = telemetry.build_batch(led, run_id=r1)
    assert [e["id"] for e in p1["batch"]] == [e["id"] for e in p2["batch"]]
    assert all(e["body"].get("traceId", r1) == r1 for e in p1["batch"])


# ---------- mirror files + round-trip ----------

def test_export_writes_mirror_files_that_round_trip(tmp_path):
    from wielder import telemetry
    led, r1, r2 = _fake_ledger(tmp_path)
    out = tmp_path / "mirror"
    rep = telemetry.export_runs(led, out, env={})
    assert rep["traces"] == 2 and rep["events"] == 6 and rep["observations"] == 4
    batch_file = out / "langfuse-batch.json"
    mirror_file = out / "mirror.jsonl"
    assert batch_file.exists() and mirror_file.exists()
    assert (out / "traces" / f"{r1}.json").exists()
    assert (out / "traces" / f"{r2}.json").exists()
    on_disk = json.loads(batch_file.read_text())
    assert on_disk == {"batch": telemetry.read_mirror(out)}
    assert len(telemetry.read_mirror(out)) == rep["events"]
    # No key material anywhere on disk.
    assert "LANGFUSE_SECRET" not in batch_file.read_text()


def test_read_mirror_missing_dir_is_empty(tmp_path):
    from wielder import telemetry
    assert telemetry.read_mirror(tmp_path / "nope") == []


# ---------- honest configuration status ----------

def test_not_configured_without_env(tmp_path):
    from wielder import telemetry
    led, _r1, _r2 = _fake_ledger(tmp_path)
    cfg = telemetry.langfuse_config({})
    assert cfg["configured"] is False
    rep = telemetry.export_runs(led, tmp_path / "m", env={})
    assert rep["langfuse"]["configured"] is False
    assert rep["langfuse"]["posted"] is False
    assert "NOT CONFIGURED" in rep["langfuse"]["detail"]
    assert (tmp_path / "m" / "mirror.jsonl").exists()  # local mirror regardless


def test_configured_posts_same_payload(tmp_path, monkeypatch):
    import urllib.request

    from wielder import telemetry
    led, _r1, _r2 = _fake_ledger(tmp_path)
    env = {"LANGFUSE_HOST": "http://langfuse.invalid",
           "LANGFUSE_PUBLIC_KEY": "pk-test", "LANGFUSE_SECRET_KEY": "sk-test"}
    seen = {}

    class _Resp:
        status = 207

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    def fake_urlopen(req, timeout=0):
        seen["url"] = req.full_url
        seen["auth"] = req.headers.get("Authorization")
        seen["body"] = json.loads(req.data)
        return _Resp()

    monkeypatch.setattr(urllib.request, "urlopen", fake_urlopen)
    rep = telemetry.export_runs(led, tmp_path / "m2", env=env)
    assert rep["langfuse"]["configured"] is True
    assert rep["langfuse"]["posted"] is True and rep["langfuse"]["status"] == 207
    assert seen["url"] == "http://langfuse.invalid/api/public/ingestion"
    assert seen["auth"].startswith("Basic ")
    # The POSTed batch is byte-for-byte the mirrored batch.
    assert seen["body"]["batch"] == telemetry.read_mirror(tmp_path / "m2")
    # The report itself never carries the keys.
    assert "sk-test" not in json.dumps(rep) and "pk-test" not in json.dumps(rep)


# ---------- CLI ----------

def test_cli_telemetry_status_and_export(tmp_path, capsys, monkeypatch):
    from wielder import cli
    led, r1, _r2 = _fake_ledger(tmp_path)
    monkeypatch.setattr(cli, "Ledger", lambda *a, **k: led)
    monkeypatch.delenv("LANGFUSE_HOST", raising=False)
    monkeypatch.delenv("LANGFUSE_PUBLIC_KEY", raising=False)
    monkeypatch.delenv("LANGFUSE_SECRET_KEY", raising=False)
    assert cli.main(["telemetry", "status"]) == 0
    assert "NOT CONFIGURED" in capsys.readouterr().out
    out_dir = tmp_path / "cli-mirror"
    assert cli.main(["telemetry", "export", "--run", r1,
                     "--out", str(out_dir)]) == 0
    rep = json.loads(capsys.readouterr().out)
    assert rep["runs"] == [r1] and rep["traces"] == 1
    assert (out_dir / "mirror.jsonl").exists()
