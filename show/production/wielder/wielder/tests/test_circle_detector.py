"""Circle-detector tests (owner expansion, card 5) — a run that
loops, parks itself; a run that stalls, gets parked by the watch.
Hermetic: synthetic action records + a tmp ledger/DATA dir.
Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from wielder import circles as K
from wielder import constitution as C
from wielder.ledger import Ledger


def _entry(i, **payload):
    return {"tool": "hash_file", "payload": payload or {"path": f"/x/{i}.png"}}


def test_exact_repeat_is_detected_at_threshold():
    """The card's test, detector half: the same action repeated past
    the threshold is a loop, with the evidence attached."""
    entries = [_entry(0, path="/x/a.png") for _ in range(3)]
    hit = K.scan(entries)
    assert hit is not None
    assert hit["kind"] == "exact" and hit["count"] == 3
    assert hit["indices"] == [0, 1, 2]
    assert K.scan(entries[:2]) is None  # below threshold: no flag


def test_near_identical_repeat_is_detected():
    entries = [{"tool": "check_artifact",
                "payload": {"path": "/x/a.png", "ts": t}} for t in (1, 2, 3)]
    hit = K.scan(entries)
    assert hit is not None and hit["kind"] == "near-identical"
    assert hit["count"] == 3


def test_progressing_work_is_not_flagged():
    entries = [_entry(i) for i in range(6)]
    assert K.scan(entries) is None


def test_loop_evidence_shape_for_the_graph_park():
    hit = K.scan([_entry(0, path="/x/a.png") for _ in range(3)])
    err = K.LoopDetected(hit)
    assert err.evidence["summary"].startswith("exact action hash_file")
    assert err.evidence["threshold"] == 3


def test_stall_watch_parks_only_the_dead_run(tmp_path, monkeypatch):
    """The card's test, heartbeat half: no progress across N checks
    parks the run with evidence; a progressing run is never parked."""
    monkeypatch.setattr(C, "DATA", tmp_path)
    led = Ledger(tmp_path / "ledger.sqlite")
    dead = led.open_run(1, "dead job", "t")
    live = led.open_run(2, "live job", "t")
    for rid in (dead, live):
        led.transition(rid, "PLANNING", "start")
        led.transition(rid, "EXECUTING", "start")
    led.log_tool(dead, "hash_file", {"path": "/x"}, True, 0, {}, "")
    led.log_tool(live, "hash_file", {"path": "/x"}, True, 0, {}, "")

    assert K.check_stalls(led, max_stale=2) == []       # check 1: markers recorded
    led.log_tool(live, "hash_file", {"path": "/y"}, True, 0, {}, "")  # live progresses
    assert K.check_stalls(led, max_stale=2) == []       # check 2: dead stale=1
    led.log_tool(live, "hash_file", {"path": "/z"}, True, 0, {}, "")  # live progresses
    stalled = K.check_stalls(led, max_stale=2)          # check 3: dead stale=2 -> park
    assert [s["run_id"] for s in stalled] == [dead]
    assert "no progress" in stalled[0]["blocker"]
    assert led.state_of(dead) == "PARKED"
    assert led.state_of(live) == "EXECUTING"            # untouched


def test_thresholds_come_from_config_with_code_defaults():
    assert K.loop_threshold() == 3
    assert K.stall_max_checks() == 2


def test_wiring_execute_scheduler_hooks_cli():
    import wielder.graph as g
    import wielder.scheduler as s
    from wielder import hooks as hooks_mod
    gsrc = Path(g.__file__).read_text()
    exe = gsrc[gsrc.index("def execute("):gsrc.index("def _manifest_of(")]
    assert "circles_mod.scan" in exe and "LoopDetected" in exe
    assert "loop_evidence" in g.WielderState.__annotations__
    assert "check_stalls" in Path(s.__file__).read_text()
    events = {h["event"] for h in hooks_mod.load_hooks()}
    assert {"run.loop_detected", "run.stalled"} <= events
    import wielder.cli as cli
    assert "cmd_loops" in Path(cli.__file__).read_text()


# ---- signals ported from PR #44 (grok lane) in the reconciliation ----

def test_pingpong_actions_are_detected():
    """PR #44's ping-pong case, ported: two distinct actions
    alternating over the window is a circle even though neither
    action individually crosses the repeat threshold consecutively."""
    a = {"tool": "read_file", "payload": {"path": "/x/a.py"}}
    b = {"tool": "read_file", "payload": {"path": "/x/b.py"}}
    # at the default threshold the alternation is already an exact
    # repeat (3x each) — the exact signal wins, correctly:
    assert K.scan([a, b, a, b, a, b])["kind"] == "exact"
    # the ping-pong signal exists for alternation whose per-action
    # counts stay UNDER the repeat threshold:
    hit = K.scan([a, b, a, b, a, b], threshold=4)
    assert hit is not None and hit["kind"] == "pingpong"
    assert hit["indices"] == [0, 1, 2, 3, 4, 5]
    # a broken alternation is not a ping-pong
    assert K.scan([a, b, a, a, b, a]) is None or \
        K.scan([a, b, a, a, b, a])["kind"] != "pingpong"


def test_same_error_repeated_is_an_error_loop():
    """PR #44's error-loop case, ported: distinct actions failing
    with the same signature at threshold is a loop; different
    failures are just work going wrong."""
    entries = [{"tool": "run_verifier", "payload": {"i": i},
                "ok": False, "error": "ENOENT: manifest"} for i in range(3)]
    hit = K.scan(entries)
    assert hit is not None and hit["kind"] == "error-loop"
    assert hit["count"] == 3
    varied = [{"tool": "run_verifier", "payload": {"i": i},
               "ok": False, "error": f"failure {i}"} for i in range(3)]
    assert K.scan(varied) is None
    # successes interleaved with one repeated failure stay under it
    mixed = entries[:2] + [{"tool": "run_verifier", "payload": {"i": 9},
                            "ok": True, "result": "fine"}]
    assert K.scan(mixed) is None


def test_pingpong_port_keeps_progress_clean():
    """Alternating DIFFERENT pairs (real back-and-forth work across
    changing inputs) must not trip the ported signals."""
    entries = [{"tool": "read_file", "payload": {"path": f"/x/{i}.py"}}
               for i in range(8)]
    assert K.scan(entries) is None
