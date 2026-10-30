"""Scheduled/background work — Wielder's equivalent of the platform's
scheduling (documented behaviour, ~/docs/scheduling-and-watching.md):
scheduled checks are POLLING, not watching; timing is loose; a run that
is interrupted resumes if it safely can, else is recorded as stopped
and the next cycle goes ahead. Wielder's heartbeat polls the finish
queue on an interval and processes Ready cards one at a time (WIP=1,
no-idle: a parked card never blocks the cycle).
"""
from __future__ import annotations

import time

from .graph import run_card
from .ledger import Ledger
from .queue import Board
from .report import build_packet


def heartbeat_cycle(ledger: Ledger, board: Board, max_cards: int = 3) -> list[dict]:
    out = []
    # Event door (wielder.hooks): drain the hooks inbox first, so an
    # event that landed between cycles becomes queue cards this cycle.
    # A hooks failure never blocks the queue — the firings are recorded
    # in data/hooks/fired.jsonl either way.
    try:
        from . import hooks as _hooks
        _hooks.drain_inbox(board)
    except Exception:
        pass
    # Stall watch (owner expansion card 5): a run left in EXECUTING
    # whose progress marker does not change across N heartbeat
    # checks is parked with the evidence named and escalated — never
    # left silently looping or dead. Card 3's resume path can pick
    # it up from the park.
    try:
        from . import circles as _circles
        for stall in _circles.check_stalls(ledger):
            try:
                from . import hooks as _hooks
                _hooks.emit("run.stalled",
                            {"run_id": stall["run_id"],
                             "stale_checks": stall["stale_checks"]}, board)
            except Exception:
                pass
            out.append({"run_id": stall["run_id"], "card_id": None,
                        "state": "PARKED", "blocker": stall["blocker"]})
    except Exception:
        pass
    for _ in range(max_cards):
        card = board.first_ready_card()
        if card is None:
            break
        result = run_card(ledger, board, card)
        run = ledger.get_run(result["run_id"])
        build_packet(ledger, result["run_id"])
        out.append({"run_id": result["run_id"], "card_id": card["id"],
                    "state": run["state"], "blocker": run["blocker"]})
    return out


def heartbeat(interval_seconds: int = 21600, once: bool = False) -> None:
    """Default interval mirrors the standing 6h studio-orchestrator
    pattern. Timing is approximate by design (polling, not watching)."""
    ledger, board = Ledger(), Board()
    while True:
        heartbeat_cycle(ledger, board)
        if once:
            return
        time.sleep(interval_seconds)
