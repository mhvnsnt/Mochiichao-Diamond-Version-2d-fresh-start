"""Instruction-checker tests (owner expansion, card 2) — drift from
the intake instruction is flagged and blocks landing. Hermetic:
synthetic instructions/steps; waivers under a tmp DATA dir.
Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from wielder import constitution as C
from wielder import instruction as ins

TARGET = {"method_ids": ["M-DEMO"], "artifact": "/work/out/shot.png",
          "deliverable": "demo"}


def _instruction():
    return ins.record_instruction("Fix the shot", "finish-gate target demo-target",
                                  "demo-target", TARGET)


def _template_steps():
    scope = ins.scope_paths_for("demo-target", TARGET)
    manifest = [p for p in scope if p.endswith("demo.json")][0]
    return [
        {"tool": "check_artifact", "payload": {"path": TARGET["artifact"]}, "purpose": "observe"},
        {"tool": "run_verifier", "payload": {"target_id": "demo-target"}, "purpose": "verify"},
        {"tool": "read_manifest", "payload": {"target_id": "demo-target"}, "purpose": "read"},
        {"tool": "hash_file", "payload": {"path": TARGET["artifact"]}, "purpose": "evidence"},
        {"tool": "hash_file", "payload": {"path": manifest}, "purpose": "evidence"},
    ]


def test_in_scope_plan_has_no_drift():
    assert ins.check_steps(_instruction(), _template_steps(), card_id=1) == []


def test_wandering_run_is_caught_before_its_verifier_step():
    """The card's test: a synthetic run wanders off-instruction; the
    checker flags the wandering step, which sits BEFORE the run's
    verifier (landing) step in the plan."""
    steps = _template_steps()
    steps.insert(1, {"tool": "hash_file",
                     "payload": {"path": "/home/user/other-show/secret.png"},
                     "purpose": "wander"})
    drift = ins.check_steps(_instruction(), steps, card_id=1)
    assert len(drift) == 1
    d = drift[0]
    assert d["path"] == "/home/user/other-show/secret.png"
    assert d["where"] == "step 1"
    verifier_idx = next(i for i, s in enumerate(steps) if s["tool"] == "run_verifier")
    assert 1 < verifier_idx  # flagged at step 1, before the verifier step


def test_step_aimed_at_another_target_is_claim_drift():
    steps = [{"tool": "read_manifest", "payload": {"target_id": "other-target"},
              "purpose": "peek"}]
    drift = ins.check_steps(_instruction(), steps, card_id=1)
    assert len(drift) == 1 and drift[0]["path"] == "target:other-target"


def test_urls_and_prose_are_never_flagged():
    steps = [{"tool": "request_browser_job",
              "payload": {"intent": "open the review page and read it",
                          "start_url": "https://example.com/review/1"},
              "purpose": "browser"}]
    assert ins.check_steps(_instruction(), steps, card_id=1) == []


def test_executed_results_are_checked_too():
    results = [{"tool": "hash_file", "ok": True,
                "payload": {"path": "/tmp/scratch/elsewhere.bin"}, "result": {}}]
    drift = ins.check_results(_instruction(), results, card_id=1)
    assert len(drift) == 1 and drift[0]["where"] == "result 0"


def test_owner_ruling_clears_only_that_cards_flag(tmp_path, monkeypatch):
    monkeypatch.setattr(C, "DATA", tmp_path)
    steps = [{"tool": "hash_file", "payload": {"path": "/srv/shared/asset.png"},
              "purpose": "borrow"}]
    drift = ins.check_steps(_instruction(), steps, card_id=42)
    assert len(drift) == 1
    ins.add_waiver(42, drift[0]["fingerprint"], "owner: shared asset is in scope for this card")
    assert ins.check_steps(_instruction(), steps, card_id=42) == []
    assert ins.check_steps(_instruction(), steps, card_id=43) != []  # other cards stay flagged


def test_wiring_plan_and_evaluate_and_hook_and_cli():
    import wielder.graph as g
    from wielder import hooks as hooks_mod
    src = Path(g.__file__).read_text()
    assert "instruction_mod.check_steps" in src
    assert "instruction_mod.check_results" in src
    assert "instruction" in g.WielderState.__annotations__
    assert '"parked": END' in src  # plan node can park on drift
    assert "instruction.drift" in {h["event"] for h in hooks_mod.load_hooks()}
    import wielder.cli as cli
    cli_src = Path(cli.__file__).read_text()
    assert "drift-waive" in cli_src and "cmd_drift_waive" in cli_src
