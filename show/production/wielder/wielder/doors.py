"""Multi-door capability router (Counter-addition #10): every external
job declares all its doors up front. A failure on one door reroutes to
the next; a job is never parked as 'waiting on <service>', and an
owner-only browser claim is a rejected string unless a named hard
blocker is attached (enforced by wielder.linter).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable


@dataclass
class DoorResult:
    door: str
    ok: bool
    detail: str = ""


@dataclass
class DoorRun:
    job: str
    attempts: list[DoorResult] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return any(a.ok for a in self.attempts)


def browser_job_doors(job_spec: dict) -> list[tuple[str, Callable[[], tuple[bool, str]]]]:
    """ADDITIVE (parity round 2, browser-seat worker): the declared
    doors for one unattended browser job, in order. Door 1 is the
    LOCAL Playwright Chromium seat (wielder.browser_seat) — it really
    executes the job and its receipt is the door detail. The manager's
    browser lane is deliberately NOT listed as a door here: it returns
    routing receipts, not execution, so listing it would let a queued
    packet masquerade as a completed job. Callers that need signed-in
    browsing declare that lane separately and say so."""
    def _local_seat() -> tuple[bool, str]:
        import json as _json
        from . import browser_seat
        receipt = browser_seat.run_browser_job(job_spec)
        return bool(receipt.get("ok")), _json.dumps(receipt)
    return [("playwright-chromium-local", _local_seat)]


def attempt_with_doors(job: str, doors: list[tuple[str, Callable[[], tuple[bool, str]]]]) -> DoorRun:
    """Try each declared door in order until one works. Every attempt is
    recorded — the record is what a later blocker claim must cite."""
    run = DoorRun(job=job)
    for name, fn in doors:
        try:
            ok, detail = fn()
        except Exception as e:
            ok, detail = False, f"{type(e).__name__}: {e}"
        run.attempts.append(DoorResult(door=name, ok=ok, detail=detail))
        if ok:
            break
    return run
