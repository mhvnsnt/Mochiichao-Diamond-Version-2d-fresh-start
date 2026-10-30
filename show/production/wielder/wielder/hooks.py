"""Event hooks — work that starts because something happened.

Wielder's heartbeat POLLS the queue on an interval (wielder.scheduler).
Polling alone means nothing reacts when an event lands between cycles.
This module is the event door, modelled on the platform's hook system
(an automation fires the moment its event arrives):

- Hook definitions live in `wielder/hooks.json` in the package:
  {"hooks": [{"event": "name", "title": "...", "description": "...",
              "column": "Backlog"}]}
  Title/description may reference payload keys as {key}; missing keys
  render empty — a hook never crashes on a thin payload.
- `emit(event, payload, board)` turns each matching hook into a queue
  card. If the board door is down, the firing is recorded in
  data/hooks/fired.jsonl with status RECORDED_BOARD_DOWN — the same
  never-silently-dropped rule as upgrade proposals (wielder.upgrades).
- The filesystem inbox is the transport any local process can use:
  drop a JSON file {"event": ..., "payload": {...}} into
  data/hooks-inbox/ and the next heartbeat cycle drains it into cards
  (wired in wielder.scheduler.heartbeat_cycle). Processed files move
  to data/hooks-inbox/processed/; malformed files are recorded and
  moved too — nothing loops forever, nothing vanishes.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Optional

from . import constitution as C
from .queue import Board

CONFIG_NAME = "hooks.json"


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def config_path() -> Path:
    return C.WIELDER_HOME / CONFIG_NAME


def load_hooks(path: Optional[Path] = None) -> list[dict]:
    p = Path(path) if path else config_path()
    if not p.exists():
        return []
    return list(json.loads(p.read_text()).get("hooks", []))


class _Fmt(dict):
    def __missing__(self, key):  # a thin payload renders empty, never raises
        return ""


def _render(template: str, payload: dict) -> str:
    return template.format_map(_Fmt(payload))


def _record(outcome: dict) -> None:
    out = C.DATA / "hooks" / "fired.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "a") as f:
        f.write(json.dumps(outcome) + "\n")


def recent_fired(limit: int = 20) -> list[dict]:
    p = C.DATA / "hooks" / "fired.jsonl"
    if not p.exists():
        return []
    lines = p.read_text().strip().split("\n")
    return [json.loads(x) for x in lines[-limit:] if x.strip()]


def emit(event: str, payload: Optional[dict] = None,
         board: Optional[Board] = None, hooks: Optional[list[dict]] = None) -> list[dict]:
    """Fire every hook bound to `event`. Returns one outcome per hook;
    every outcome is also appended to the fired log."""
    payload = payload or {}
    outcomes: list[dict] = []
    for hook in (load_hooks() if hooks is None else hooks):
        if hook.get("event") != event:
            continue
        title = _render(hook.get("title", f"HOOK: {event}"), payload)
        description = _render(hook.get("description", ""), payload)
        column = hook.get("column", "Backlog")
        card_id: Any = None
        status = "RECORDED_BOARD_DOWN"
        if board is not None:
            try:
                cols = board.columns()
                card_id = board.call("createTask", project_id=1, title=title,
                                     column_id=cols[column], description=description)
                status = "CARD_CREATED"
            except Exception:
                card_id, status = None, "RECORDED_BOARD_DOWN"
        outcome = {"ts": _now(), "event": event, "hook_title": title,
                   "column": column, "card_id": card_id, "status": status,
                   "payload": payload}
        _record(outcome)
        outcomes.append(outcome)
    return outcomes


def inbox_dir() -> Path:
    return C.DATA / "hooks-inbox"


def drain_inbox(board: Optional[Board] = None,
                hooks: Optional[list[dict]] = None) -> list[dict]:
    """Emit every event file waiting in data/hooks-inbox/. Returns the
    combined outcomes (including a 'malformed' outcome per bad file)."""
    box = inbox_dir()
    outcomes: list[dict] = []
    if not box.exists():
        return outcomes
    processed = box / "processed"
    processed.mkdir(parents=True, exist_ok=True)
    for f in sorted(box.glob("*.json")):
        try:
            data = json.loads(f.read_text())
            outcomes.extend(emit(str(data["event"]), data.get("payload") or {},
                                 board=board, hooks=hooks))
        except Exception as e:
            bad = {"ts": _now(), "event": None, "hook_title": f.name,
                   "column": None, "card_id": None, "status": "MALFORMED",
                   "payload": {"error": f"{type(e).__name__}: {e}"}}
            _record(bad)
            outcomes.append(bad)
        f.rename(processed / f.name)
    return outcomes
