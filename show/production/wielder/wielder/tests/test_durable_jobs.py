"""Durable-jobs tests (owner expansion, card 3) — kill-and-resume
proofs on a synthetic multi-step job. A crash is simulated with a
BaseException (process-death class: step machinery that catches
Exception must not swallow it), a usage-limit stop with the step
budget. The journal lives under a tmp DATA dir.
Run: python -m pytest wielder/tests -q   (from the package parent dir)
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import constitution as C
from wielder import journal as J


class Crash(BaseException):
    """Process death, simulated: not an Exception subclass."""


def _steps(n):
    return [{"tool": "fake_tool", "payload": {"i": i}, "purpose": f"step {i}"}
            for i in range(n)]


def _runner(calls, crash_at=None):
    def run(step):
        i = step["payload"]["i"]
        calls.append(i)
        if crash_at is not None and i == crash_at:
            raise Crash()
        return {"tool": "fake_tool", "ok": True, "exit_code": 0,
                "result": {"i": i}, "raw_output": "", "payload": step["payload"]}
    return run


@pytest.fixture(autouse=True)
def _tmp_data(tmp_path, monkeypatch):
    monkeypatch.setattr(C, "DATA", tmp_path)


def test_crash_resume_repeats_no_completed_step_and_loses_none():
    """The card's kill-and-resume proof, crash form."""
    calls: list[int] = []
    with pytest.raises(Crash):
        J.run_steps("W-crash", _steps(5), _runner(calls, crash_at=2), max_steps=40)
    assert sorted(J.load("W-crash")) == [0, 1]  # exactly the completed steps
    results, exhausted = J.run_steps("W-crash", _steps(5), _runner(calls), max_steps=40)
    assert exhausted is None
    assert [r["result"]["i"] for r in results] == [0, 1, 2, 3, 4]  # nothing lost
    assert calls.count(0) == 1 and calls.count(1) == 1  # completed: never repeated
    assert calls.count(2) == 2  # the step that died mid-execution is re-attempted
    assert calls.count(3) == 1 and calls.count(4) == 1


def test_usage_limit_stop_resumes_in_a_fresh_window():
    """The card's kill-and-resume proof, usage-limit form: the budget
    parks the job mid-plan; each resume gets a fresh window and the
    job completes with every step executed exactly once."""
    calls: list[int] = []
    results, exhausted = J.run_steps("W-limit", _steps(5), _runner(calls), max_steps=2)
    assert (len(results), exhausted) == (2, 2)
    results, exhausted = J.run_steps("W-limit", _steps(5), _runner(calls), max_steps=2)
    assert (len(results), exhausted) == (4, 4)
    results, exhausted = J.run_steps("W-limit", _steps(5), _runner(calls), max_steps=2)
    assert (len(results), exhausted) == (5, None)
    assert sorted(calls) == [0, 1, 2, 3, 4]  # each step exactly once, across 3 windows


def test_journal_survives_a_torn_last_line():
    J.run_steps("W-torn", _steps(2), _runner([]), max_steps=40)
    p = J.journal_path("W-torn")
    with open(p, "a") as f:
        f.write('{"index": 2, "fingerpr')  # crash mid-append
    assert sorted(J.load("W-torn")) == [0, 1]


def test_changed_step_is_not_rehydrated():
    calls: list[int] = []
    J.run_steps("W-changed", _steps(2), _runner(calls), max_steps=40)
    altered = _steps(2)
    altered[1] = {"tool": "fake_tool", "payload": {"i": 99}, "purpose": "changed"}
    J.run_steps("W-changed", altered, _runner(calls), max_steps=40)
    assert calls == [0, 1, 99]  # step 0 rehydrated; the changed step re-ran


def test_resume_plan_decisions():
    assert J.resume_plan("EXECUTING", ("execute",)) == "crash"
    assert J.resume_plan("PARKED", ()) == "budget-fork"
    assert J.resume_plan("PARKED", ("owner_gate",)) == "owner-gate"
    assert J.resume_plan("SUCCESS", ()) == "refuse"
    assert J.resume_plan("EXECUTING", ("plan",)) == "refuse"
    assert J.resume_plan("FAILED", ()) == "refuse"


def test_resume_events_are_the_resume_log():
    J.record_resume("W-log", "crash", {"journaled_steps": 2})
    events = J.resume_events("W-log")
    assert len(events) == 1 and events[0]["mode"] == "crash"
    assert events[0]["detail"]["journaled_steps"] == 2


def test_wiring_execute_journal_and_resume_paths():
    import wielder.graph as g
    src = Path(g.__file__).read_text()
    assert "journal_mod.run_steps" in src
    assert "def resume_job(" in src
    import wielder.cli as cli
    cli_src = Path(cli.__file__).read_text()
    assert "resume-run" in cli_src and "cmd_resume_run" in cli_src
