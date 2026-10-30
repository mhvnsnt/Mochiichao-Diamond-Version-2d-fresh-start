"""Proof-gate tests (owner expansion, card 1) — a verifier PASS with
no attached evidence is a FAIL. Hermetic: synthetic tool records and
a tmp ledger; no finish-gate, no board.
Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from wielder import evidence as ev
from wielder import hooks as hooks_mod

TARGET = "demo-target"
ARTIFACT = "/work/out/shot.png"
MANIFEST_PATH = "/gate/evidence/demo.json"
SHA = "a" * 64


def _res(tool, payload, result=None, raw=""):
    return {"tool": tool, "ok": True, "exit_code": 0,
            "result": result or {}, "raw_output": raw, "payload": payload}


def _manifest_result():
    return _res("read_manifest", {"target_id": TARGET},
                result={"exists": True, "sha256": SHA,
                        "manifest_path": MANIFEST_PATH,
                        "clauses": [{"id": "AC-01", "status": "PASS"}]})


def _pass_manifest():
    return {"exists": True, "owner_gate": {"status": "PENDING"},
            "clauses": [{"id": "AC-01", "status": "PASS", "measured": "ok"}]}


def _full_results():
    return [
        _res("check_artifact", {"path": ARTIFACT},
             result={"path": ARTIFACT, "exists_nonempty": True, "bytes": 10}),
        _res("run_verifier", {"target_id": TARGET},
             result={"manifest_path": MANIFEST_PATH, "manifest_exists": True},
             raw="verify: 12 checks ran, output recorded"),
        _manifest_result(),
        _res("hash_file", {"path": ARTIFACT},
             result={"exists": True, "path": ARTIFACT, "bytes": 10, "sha256": "b" * 64}),
        _res("hash_file", {"path": MANIFEST_PATH},
             result={"exists": True, "path": MANIFEST_PATH, "bytes": 99, "sha256": SHA}),
    ]


def test_done_claim_without_evidence_is_rejected():
    """The card's test: a synthetic run whose manifest claims all-PASS
    but whose record carries no evidence artifacts is rejected."""
    rep = ev.proof_gate(_pass_manifest(), [_manifest_result()], TARGET, ARTIFACT)
    assert rep["applies"] is True
    assert rep["complete"] is False
    joined = " ".join(rep["missing"])
    assert "verifier test output" in joined
    assert "visual/frame evidence" in joined  # .png artifact, no hash on record


def test_full_evidence_bundle_clears_the_proof_gate():
    rep = ev.proof_gate(_pass_manifest(), _full_results(), TARGET, ARTIFACT)
    assert rep["applies"] is True and rep["complete"] is True
    assert rep["missing"] == []
    kinds = {b["kind"] for b in rep["bundle"]}
    assert kinds == {"verifier_output", "manifest", "artifact_hash"}
    for b in rep["bundle"]:
        assert len(b["sha256"]) == 64  # every item hash-bound


def test_visual_artifact_needs_its_own_frame_hash():
    results = [r for r in _full_results()
               if not (r["tool"] == "hash_file" and r["payload"]["path"] == ARTIFACT)]
    rep = ev.check(results, TARGET, "/work/out/clip.mp4")
    assert rep["complete"] is False
    assert any("visual/frame evidence" in m for m in rep["missing"])
    # a hash of some OTHER file does not stand in for the artifact
    rep2 = ev.check(_full_results(), TARGET, "/work/out/other.mp4")
    assert rep2["complete"] is False


def test_nonvisual_artifact_missing_hash_is_named_plainly():
    results = [r for r in _full_results() if r["tool"] != "hash_file"]
    rep = ev.check(results, TARGET, "/work/out/data.json")
    assert any("artifact hash evidence" in m for m in rep["missing"])
    assert not any("visual/frame" in m for m in rep["missing"])


def test_proof_gate_is_silent_when_clauses_fail():
    """Clause failures belong to the verifier path; the proof gate
    only judges completions that claim PASS."""
    manifest = {"exists": True, "clauses": [{"id": "AC-01", "status": "FAIL"}]}
    rep = ev.proof_gate(manifest, [], TARGET, ARTIFACT)
    assert rep["applies"] is False


def test_packet_carries_the_evidence_bundle(tmp_path, monkeypatch):
    import json as _json
    from wielder import constitution as C
    from wielder.ledger import Ledger
    from wielder.report import build_packet

    monkeypatch.setattr(C, "DATA", tmp_path)
    led = Ledger(tmp_path / "ledger.sqlite")
    rid = led.open_run(7, "demo card", TARGET)
    for r in _full_results():
        led.log_tool(rid, r["tool"], r["payload"], True, 0, r["result"], r["raw_output"])
    mdir = tmp_path / "evidence"
    mdir.mkdir()
    mpath = mdir / "demo.json"
    mpath.write_text(_json.dumps(_pass_manifest() | {"target_id": TARGET}))
    led.set_outcome(rid, manifest_path=str(mpath), manifest_sha256=SHA, target_id=TARGET)
    text = build_packet(led, rid).read_text()
    assert "Evidence bundle (proof gate)" in text
    assert "verifier_output" in text and "artifact_hash" in text
    assert "b" * 64 in text  # the artifact's hash is in the packet, not a claim


def test_graph_wiring_and_hook_definition():
    import wielder.graph as g
    src = Path(g.__file__).read_text()
    assert src.count("evidence_mod.proof_gate") >= 2  # evaluate + owner-gate resume
    assert "evidence" in g.WielderState.__annotations__
    plan_src = src[src.index("def plan("):src.index("def preflight(")]
    assert plan_src.count('tool="hash_file"') == 2  # artifact + manifest file
    events = {h["event"] for h in hooks_mod.load_hooks()}
    assert "proof_gate.failed" in events
