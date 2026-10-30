"""Parallel fan-out delegation — many child runs, one parent record.

`wielder/delegate.py` runs ONE child run of the graph, synchronously.
The leading agent products fan out: several workers on independent
cards at once, results aggregated for the parent. This module is that
primitive for Wielder, under the same rules as single delegation:

- every child is a full run of the same graph on its own card, graded
  by the same finish-gate verifier — the parent cites child PACKETS
  (built from artifacts), never child prose;
- a child that raises is captured as an ERROR record in the aggregate —
  it never takes the other children down with it;
- the aggregate record lands in data/delegations/ next to the single
  delegation records, so the parent's evidence chain is one file.

Concurrency model, stated plainly: each worker thread builds its own
Ledger connection (same SQLite file) and its own Board client. SQLite
serialises writers; children are separate runs on separate cards, so
contention is limited to brief lock waits. The queue discipline is
unchanged — the heartbeat still pulls WIP=1; fan-out is a
manager-invoked delegation over cards the manager names explicitly,
and each child run is itself WIP=1 inside its own graph.
"""
from __future__ import annotations

import json
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Optional

from . import constitution as C
from .delegate import delegate as _delegate_one
from .ledger import Ledger
from .queue import Board


def _one(parent_run_id: str, item: dict, ledger_path: Optional[str]) -> dict:
    card = item["card"]
    try:
        ledger = Ledger(ledger_path) if ledger_path else Ledger()
        record = _delegate_one(ledger, Board(), parent_run_id, card,
                               item.get("scope", ""))
        return {"card_id": int(card["id"]), "ok": True, "record": record}
    except Exception as e:
        return {"card_id": int(card["id"]) if str(card.get("id")).isdigit() else card.get("id"),
                "ok": False, "record": {"error": f"{type(e).__name__}: {e}"}}


def delegate_many(parent_run_id: str, items: list[dict],
                  max_workers: int = 3, ledger_path: Optional[str] = None) -> dict:
    """Run one child run per item, in parallel. Each item is
    {"card": <board card dict>, "scope": <scope note>}. Returns (and
    writes) the aggregate record: children in INPUT order, each with
    its delegation record or its captured error."""
    workers = max(1, min(int(max_workers), len(items) or 1))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        children = list(pool.map(lambda it: _one(parent_run_id, it, ledger_path), items))
    aggregate: dict[str, Any] = {
        "parent_run_id": parent_run_id,
        "children": children,
        "counts": {"total": len(children),
                   "ok": sum(1 for c in children if c["ok"]),
                   "error": sum(1 for c in children if not c["ok"])},
    }
    out = C.DATA / "delegations" / f"fanout-{parent_run_id}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(aggregate, indent=1))
    aggregate["record_path"] = str(out)
    return aggregate
