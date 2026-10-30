"""WIELDER chat — the owner-facing pillar (Chainlit, Apache-2.0).

Architecture rule: the chat is a front-end on the SAME gated system.
A chat message becomes a queue card / a run under the constitution —
never an unguarded side-channel. What the owner sees here: his words,
Wielder's run states (from the ledger), and evidence packets. The
owner gate is presented in chat: Approve/Deny invoke the finish-gate's
OWN recording scripts (the owner's act through his interface —
record_verdict.py / record_rejection.py), after which the manager
resumes the run and the verifier re-issues the manifest.

Conversation history persists in Wielder's own SQLite (data/chat.sqlite).
Attachments are hashed into the run's provenance lock.

Run: chainlit run wielder/chat.py --host 127.0.0.1 --port 8897
"""
from __future__ import annotations

import asyncio
import json
import re
import sqlite3
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import chainlit as cl

from . import constitution as C
from . import judgment as judgment_mod
from .graph import resume_job, resume_run, run_card
from .ledger import Ledger
from .queue import Board
from .report import build_packet
from .scrub import scrub
from .tools import sha256_of

CHAT_DB = C.DATA / "chat.sqlite"


def _db() -> sqlite3.Connection:
    C.DATA.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(CHAT_DB)
    con.execute("CREATE TABLE IF NOT EXISTS turns(id INTEGER PRIMARY KEY AUTOINCREMENT,"
                " role TEXT, text TEXT, ts TEXT)")
    return con


def _log_turn(role: str, text: str) -> None:
    con = _db()
    con.execute("INSERT INTO turns(role,text,ts) VALUES (?,?,?)",
                (role, text, time.strftime("%Y-%m-%dT%H:%M:%S%z")))
    con.commit()
    con.close()


def _history(limit: int = 20) -> list[tuple[str, str]]:
    con = _db()
    rows = con.execute("SELECT role,text FROM turns ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    con.close()
    return list(reversed(rows))


# ---------------------------------------------------------------------------
# Interface upgrades (parity round 2) — pure data-shaping functions.
#
# Every function below renders ONLY what the ledger, the queue, the graph
# checkpoint, or the verifier manifest recorded. The verdict line in
# particular comes from judgment.headline(manifest) read off the manifest
# file — the finish-gate verifier is the only verdict issuer, and a run
# with no manifest is shown as having no verdict, whatever its ledger
# state says. These functions take plain dicts / a board-like object so
# they are unit-testable without Chainlit or Kanboard running.
# ---------------------------------------------------------------------------

BOARD_COLUMNS = ["Backlog", "Ready", "Doing", "Verify", "Owner review", "Done"]
_NO_VERDICT = ("No verifier verdict has been issued for this run "
               "(no manifest on record).")


def board_snapshot(board: Any, columns: Optional[list[str]] = None) -> dict:
    """Live queue state from the board's own reads. A column the board
    cannot serve is reported under ``errors`` — never rendered as empty."""
    cols: dict[str, list[dict]] = {}
    errors: dict[str, str] = {}
    for col in (columns or BOARD_COLUMNS):
        try:
            cols[col] = [{"id": int(t["id"]), "title": str(t.get("title") or "")}
                         for t in board.tasks_in(col)]
        except Exception as e:  # board door down for this column: say so
            cols[col] = []
            errors[col] = str(e)
    return {"columns": cols, "errors": errors}


def render_board(snapshot: dict) -> str:
    lines = ["**Finish queue** (Kanboard, read live)"]
    total = 0
    for col, tasks in snapshot["columns"].items():
        total += len(tasks)
        lines.append(f"\n**{col}** ({len(tasks)}):")
        if tasks:
            lines += [f"- #{t['id']} {t['title']}" for t in tasks]
        elif col in snapshot.get("errors", {}):
            lines.append(f"- ⚠ board read failed: {snapshot['errors'][col]}")
        else:
            lines.append("- —")
    lines.append(f"\n{total} active card(s) across {len(snapshot['columns'])} columns.")
    return "\n".join(lines)


def _parse_ts(ts: Optional[str]) -> Optional[datetime]:
    if not ts:
        return None
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z")
    except (ValueError, TypeError):
        return None


def _jsonish(value: Any) -> Any:
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return value
    return value


def _dump(value: Any, limit: int = 1000) -> str:
    text = value if isinstance(value, str) else json.dumps(value, indent=1, default=str)
    return text if len(text) <= limit else text[:limit] + f"\n… [truncated, {len(text)} chars total]"


def load_manifest(run: dict) -> Optional[dict]:
    """The verifier manifest for a run, read from the file the ledger
    recorded — or None. This file is the only verdict source."""
    path = run.get("manifest_path")
    if path and Path(path).exists():
        try:
            return json.loads(Path(path).read_text())
        except Exception:
            return None
    return None


def verdict_for_run(run: dict, manifest: Optional[dict] = None) -> str:
    """The run's verdict EXACTLY as the verifier issued it (via the
    judgment headline over the manifest), or an explicit no-verdict line.
    Ledger state is never promoted into a verdict here."""
    if manifest is None:
        manifest = load_manifest(run)
    if manifest is None:
        return _NO_VERDICT
    return judgment_mod.headline(manifest)


def build_timeline(run: dict) -> list[dict]:
    """Merge a ledger run's transitions and tool calls into one ordered
    timeline. The ledger records no per-call duration, so ``elapsed_s``
    is the seconds since the previous recorded event — labelled as such
    in the render, never presented as the call's own duration."""
    events: list[dict] = []
    for i, t in enumerate(run.get("transitions", [])):
        events.append({"kind": "transition", "seq": i, "ts": t.get("ts"),
                       "title": f"{t.get('from') or '∅'} → {t.get('to')}",
                       "detail": t.get("reason") or "",
                       "tool": None, "ok": None, "exit_code": None,
                       "payload": None, "result": None, "raw_output": ""})
    for i, tc in enumerate(run.get("tool_calls", [])):
        events.append({"kind": "tool", "seq": i, "ts": tc.get("ts"),
                       "title": str(tc.get("tool") or "?"),
                       "detail": "",
                       "tool": tc.get("tool"),
                       "ok": (bool(tc["ok"]) if tc.get("ok") is not None else None),
                       "exit_code": tc.get("exit_code"),
                       "payload": _jsonish(tc.get("payload")),
                       "result": _jsonish(tc.get("result")),
                       "raw_output": tc.get("raw_output") or ""})
    kind_order = {"transition": 0, "tool": 1}
    epoch = datetime(1970, 1, 1, tzinfo=_parse_ts("1970-01-01T00:00:00+0000").tzinfo)
    events.sort(key=lambda e: (_parse_ts(e["ts"]) or epoch,
                               kind_order.get(e["kind"], 9), e["seq"]))
    prev: Optional[datetime] = None
    for e in events:
        ts = _parse_ts(e["ts"])
        e["elapsed_s"] = (int((ts - prev).total_seconds())
                          if (ts is not None and prev is not None) else None)
        if ts is not None:
            prev = ts
    return events


def plan_steps_from_state(state: Optional[dict]) -> list[dict]:
    """Plan steps recorded in a run's graph checkpoint state (the plan
    is checkpoint state, not a ledger row — callers pass the checkpoint
    values dict, or None when no checkpoint is readable)."""
    if not state:
        return []
    plan = state.get("plan") or {}
    steps = plan.get("steps") or []
    return [{"tool": s.get("tool"), "purpose": s.get("purpose") or "",
             "payload": s.get("payload") or {}} for s in steps]


def render_timeline(run: dict, manifest: Optional[dict] = None,
                    plan_steps: Optional[list[dict]] = None,
                    checkpoint_note: str = "") -> str:
    lines = [f"**Run {run['run_id']}** — card #{run['card_id']} {run['card_title']}",
             f"- Ledger state: **{run['state']}** (the ledger's record, not a verdict)",
             f"- Target: {run.get('target_id') or 'none recorded'}",
             f"- Blocker: {run.get('blocker') or 'none recorded'}",
             f"- Verifier verdict: {verdict_for_run(run, manifest)}",
             f"- Manifest: {run.get('manifest_path') or 'none recorded'}"
             + (f" (sha256 {run['manifest_sha256']})" if run.get("manifest_sha256") else "")]
    if plan_steps:
        lines += ["", "**Plan** (from the run's graph checkpoint):"]
        lines += [f"{i + 1}. `{s['tool']}` — {s['purpose']}".rstrip(" —")
                  for i, s in enumerate(plan_steps)]
    elif checkpoint_note:
        lines += ["", f"Plan: {checkpoint_note}"]
    lines += ["", "**Timeline** (ledger transitions + tool calls, in recorded order; "
                  "`+Ns` = elapsed since the previous recorded event — the ledger "
                  "records no per-call duration):"]
    for e in build_timeline(run):
        elapsed = f" (+{e['elapsed_s']}s)" if e["elapsed_s"] is not None else ""
        if e["kind"] == "transition":
            lines.append(f"- {e['ts'] or '?'} ⛓ {e['title']}{elapsed}"
                         + (f" — {e['detail']}" if e["detail"] else ""))
        else:
            lines.append(f"- {e['ts'] or '?'} 🔧 `{e['title']}` ok={e['ok']} "
                         f"exit={e['exit_code']}{elapsed}")
    if not run.get("transitions") and not run.get("tool_calls"):
        lines.append("- no transitions or tool calls recorded for this run")
    return "\n".join(lines)


def render_tool_inspection(run: dict) -> str:
    """Full per-call detail: payload, result, raw output — as recorded
    in the ledger (the ledger itself truncates each field at write)."""
    calls = run.get("tool_calls", [])
    if not calls:
        return f"Run {run['run_id']}: no tool calls recorded in the ledger."
    out = [f"# Tool-call inspection — run {run['run_id']}", ""]
    for i, tc in enumerate(calls, 1):
        out += [f"## {i}. {tc.get('tool')} — ok={bool(tc['ok']) if tc.get('ok') is not None else None} "
                f"exit={tc.get('exit_code')} at {tc.get('ts')}",
                "", "Payload:", "```json", _dump(_jsonish(tc.get("payload"))), "```",
                "Result:", "```json", _dump(_jsonish(tc.get("result"))), "```"]
        if tc.get("raw_output"):
            out += ["Raw output:", "```", _dump(tc["raw_output"]), "```"]
        out.append("")
    return "\n".join(out)


def packet_preview_data(run: dict, packet_path: Any,
                        packet_text: Optional[str] = None) -> dict:
    """Which of a run packet's artifacts actually exist on disk.
    Existing files become attachments; absent ones are named as
    missing — an artifact is never presented that is not there."""
    candidates: list[tuple[str, Optional[str]]] = [("packet", str(packet_path)),
                                                   ("verifier manifest", run.get("manifest_path"))]
    for i in run.get("inputs", []):
        candidates.append((f"input ({i.get('kind')})", i.get("path")))
    artifacts, missing, seen = [], [], set()
    for label, path in candidates:
        if not path:
            missing.append(f"{label}: none recorded")
            continue
        if path in seen:
            continue
        seen.add(path)
        p = Path(path)
        if p.exists() and p.is_file():
            artifacts.append({"label": label, "path": str(p), "name": p.name,
                              "bytes": p.stat().st_size, "sha256": sha256_of(p)})
        else:
            missing.append(f"{label}: {path} (not on disk)")
    if packet_text is None and packet_path and Path(packet_path).exists():
        packet_text = Path(packet_path).read_text()
    return {"run_id": run["run_id"], "packet_path": str(packet_path),
            "packet_text": packet_text or "", "artifacts": artifacts,
            "missing": missing}


def render_packet_preview(preview: dict) -> str:
    lines = [f"**Run packet — {preview['run_id']}**",
             f"Packet file: `{preview['packet_path']}`", "", "Artifacts on disk:"]
    if preview["artifacts"]:
        lines += [f"- {a['label']}: `{a['path']}` — {a['bytes']} bytes, sha256 {a['sha256']}"
                  for a in preview["artifacts"]]
    else:
        lines.append("- none")
    if preview["missing"]:
        lines += ["", "Named as missing (not attached, not claimed):"]
        lines += [f"- {m}" for m in preview["missing"]]
    lines.append("\nThe packet text is attached alongside this message; its "
                 "headline is the verifier manifest's, as issued.")
    return "\n".join(lines)


def is_owner_gate_park(run: dict) -> bool:
    """The ledger's own owner-gate signature — the same test the run
    report has always used: PARKED with a blocker naming the owner gate."""
    return run.get("state") == "PARKED" and "owner gate" in (run.get("blocker") or "")


def pending_owner_gates(runs: list[dict]) -> list[dict]:
    return [r for r in runs if is_owner_gate_park(r)]


def resume_mode_for(run: dict) -> Optional[str]:
    """Which REAL resume path a run belongs to — the same split the CLI
    makes: owner-gate parks go to graph.resume_run (`wielder resume`);
    other parks go to graph.resume_job (`wielder resume-run`), which
    itself refuses anything it cannot safely resume. Terminal and
    in-flight states have no resume path: None."""
    if is_owner_gate_park(run):
        return "owner-gate"
    if run.get("state") == "PARKED":
        return "durable-job"
    return None


def resumable_runs(runs: list[dict]) -> list[dict]:
    out = []
    for r in runs:
        mode = resume_mode_for(r)
        if mode:
            out.append({"run_id": r["run_id"], "state": r["state"],
                        "card_id": r.get("card_id"), "card_title": r.get("card_title"),
                        "target_id": r.get("target_id"), "blocker": r.get("blocker"),
                        "mode": mode})
    return out


def render_gates(gates: list[dict]) -> str:
    if not gates:
        return ("No runs are parked at the owner gate. (A gate appears here only "
                "when the ledger records a PARKED run whose blocker names the "
                "owner gate.)")
    lines = ["**Pending owner gates** (from the ledger):"]
    for g in gates:
        lines.append(f"- {g['run_id']} — card #{g['card_id']} {g['card_title']} · "
                     f"target {g.get('target_id') or 'none recorded'}\n"
                     f"  Blocker: {g.get('blocker')}")
    lines.append("\nApprove/Deny record the verdict through the finish-gate's own "
                 "scripts; Resume re-enters the run via graph.resume_run, which "
                 "re-reads the manifest — the chat issues no verdict itself.")
    return "\n".join(lines)


def render_resumable(items: list[dict]) -> str:
    if not items:
        return "No resumable runs: no PARKED runs in the ledger."
    lines = ["**Resumable runs** (PARKED in the ledger):"]
    for it in items:
        path = ("graph.resume_run — owner verdict path" if it["mode"] == "owner-gate"
                else "graph.resume_job — durable-job path (refuses if unsafe)")
        lines.append(f"- {it['run_id']} — card #{it['card_id']} {it['card_title']} · "
                     f"resume via {path}\n  Blocker: {it.get('blocker') or 'none recorded'}")
    lines.append("\nResume with `resume <run_id>`.")
    return "\n".join(lines)


def render_checkpoints(run_id: str, rows: list[dict]) -> str:
    if not rows:
        return f"No checkpoints recorded for {run_id} in the graph checkpointer."
    lines = [f"**Checkpoints for {run_id}** (graph checkpointer, read-only listing — "
             "the same history `wielder rewind` prints):"]
    for r in rows:
        lines.append(f"- checkpoint {r['checkpoint_id']} · next={r['next']} · "
                     f"state keys: {', '.join(r['values_keys']) or 'none'}")
    lines.append(f"{len(rows)} checkpoint(s). Restoring to an arbitrary checkpoint is "
                 "not a Wielder function today — resume goes through `resume <run_id>`, "
                 "which uses the checkpoint the resume path itself selects.")
    return "\n".join(lines)


@cl.on_chat_start
async def on_start():
    led = Ledger()
    runs = led.list_runs(5)
    state = "\n".join(f"- {r['run_id']} [{r['state']}] card #{r['card_id']} {r['card_title']}"
                      for r in runs) or "- no runs yet"
    await cl.Message(
        content=("**WIELDER** — production Agentic AI system for the Mochiichao show.\n\n"
                 "Say `run` to pull the next Ready card, `run card <id>` for a specific card, "
                 "`board` (or `queue`) for the live finish queue, `timeline <run_id>` for a "
                 "run's ledger timeline + tool-call inspection, `packet <run_id>` for its "
                 "review packet with artifacts attached, `gates` for runs parked at the "
                 "owner gate, `resumable` / `resume <run_id>` for parked runs, "
                 "`checkpoints <run_id>` for a run's checkpoint history, or describe new "
                 "work and it becomes a queue card. "
                 "Nothing here is done until the finish-gate verifier's manifest says so.\n\n"
                 f"Recent runs:\n{state}")).send()
    for role, text in _history(6):
        if role == "owner":
            await cl.Message(content=f"**You (earlier):** {text}", author="history").send()


def _run_card_fresh(card: dict) -> dict:
    """run_card in the worker thread with a Ledger/Board created in
    that same thread — a Ledger's sqlite connection is thread-bound,
    so a loop-thread Ledger cannot be handed to asyncio.to_thread."""
    return run_card(Ledger(), Board(), card)


async def _run_and_report(card: dict):
    led = Ledger()
    await cl.Message(content=f"Running card #{card['id']}: {card['title']}").send()
    result = await asyncio.to_thread(_run_card_fresh, card)
    run = led.get_run(result["run_id"])
    packet = build_packet(led, result["run_id"])
    summary = packet.read_text().splitlines()[2] if packet.exists() else ""
    actions = []
    if is_owner_gate_park(run):
        actions = [cl.Action(name="approve", payload={"run_id": result["run_id"],
                                                       "target_id": run["target_id"]},
                             label="Approve (owner verdict)"),
                   cl.Action(name="deny", payload={"run_id": result["run_id"],
                                                   "target_id": run["target_id"]},
                             label="Deny + pin regression"),
                   cl.Action(name="resume_run", payload={"run_id": result["run_id"]},
                             label="Resume (re-verify via graph.resume_run)")]
    await cl.Message(
        content=(f"Run {result['run_id']} — state **{run['state']}**\n"
                 f"{summary}\nBlocker: {run['blocker'] or 'none'}\n"
                 f"Packet: `{packet}`"),
        actions=actions).send()
    _log_turn("wielder", f"run {result['run_id']} state {run['state']} blocker {run['blocker']}")


def _normalize_run_id(run_id: str) -> str:
    """Ledger run ids are `W-<hex>`; chat commands are matched
    case-insensitively, so restore the canonical prefix."""
    return "W-" + run_id[2:] if run_id[:2].lower() == "w-" else run_id


def _build_packet_fresh(run_id: str) -> Path:
    """build_packet with a Ledger created in the calling (worker)
    thread — sqlite connections are thread-bound (see _run_card_fresh)."""
    return build_packet(Ledger(), run_id)


def _resume_fresh(run_id: str, mode: str) -> tuple[dict, dict, Path]:
    """The resume itself, in the worker thread with thread-local
    Ledger/Board: returns (resume result, ledger run afterwards,
    packet path)."""
    led, board = Ledger(), Board()
    fn = resume_run if mode == "owner-gate" else resume_job
    result = fn(led, board, run_id)
    return result, led.get_run(run_id), build_packet(led, run_id)


def _checkpoint_plan(run_id: str) -> tuple[list[dict], str]:
    """Plan steps from the run's graph checkpoint, if one is readable.
    Returns (steps, note) — the note is used when there are no steps to
    show, so the surface says why instead of inventing a plan."""
    try:
        from .graph import build_graph
        graph = build_graph(Ledger(), None)
        snap = graph.get_state({"configurable": {"thread_id": run_id}})
        steps = plan_steps_from_state(snap.values if snap else None)
        if steps:
            return steps, ""
        return [], "no plan steps in the run's checkpoint state."
    except Exception as e:
        return [], f"no readable checkpoint for this run ({e})."


def _checkpoint_rows(run_id: str) -> list[dict]:
    """Checkpoint history rows — the same read `wielder rewind` performs
    (graph.get_state_history over the run's thread), shaped for render."""
    from .graph import build_graph
    graph = build_graph(Ledger(), None)
    cfg = {"configurable": {"thread_id": run_id}}
    return [{"checkpoint_id": (s.config["configurable"].get("checkpoint_id") or "?")[:12],
             "next": list(s.next or []),
             "values_keys": sorted(s.values.keys()) if s.values else []}
            for s in graph.get_state_history(cfg)]


async def _send_board():
    snap = await asyncio.to_thread(board_snapshot, Board())
    await cl.Message(content=render_board(snap)).send()


async def _send_timeline(run_id: str):
    run_id = _normalize_run_id(run_id)
    led = Ledger()
    try:
        run = led.get_run(run_id)
    except KeyError:
        await cl.Message(content=f"No run {run_id} in the ledger.").send()
        return
    manifest = load_manifest(run)
    steps, note = await asyncio.to_thread(_checkpoint_plan, run_id)
    elements = []
    if run.get("tool_calls"):
        elements.append(cl.Text(name=f"tool-inspection-{run_id}",
                                content=render_tool_inspection(run), display="side"))
    await cl.Message(content=render_timeline(run, manifest, steps, note),
                     elements=elements).send()
    _log_turn("wielder", f"timeline {run_id} state {run['state']}")


async def _send_packet(run_id: str):
    run_id = _normalize_run_id(run_id)
    led = Ledger()
    try:
        led.get_run(run_id)
    except KeyError:
        await cl.Message(content=f"No run {run_id} in the ledger.").send()
        return
    packet = await asyncio.to_thread(_build_packet_fresh, run_id)
    run = led.get_run(run_id)
    preview = packet_preview_data(run, packet)
    elements = [cl.Text(name=f"packet-{run_id}", content=preview["packet_text"],
                        display="side")]
    for a in preview["artifacts"]:
        elements.append(cl.File(name=a["name"], path=a["path"]))
    await cl.Message(content=render_packet_preview(preview), elements=elements).send()
    _log_turn("wielder", f"packet {run_id} artifacts {len(preview['artifacts'])}")


async def _send_gates():
    gates = pending_owner_gates(Ledger().list_runs(50))
    await cl.Message(content=render_gates(gates)).send()
    for g in gates:
        actions = [cl.Action(name="approve", payload={"run_id": g["run_id"],
                                                       "target_id": g["target_id"]},
                             label="Approve (owner verdict)"),
                   cl.Action(name="deny", payload={"run_id": g["run_id"],
                                                   "target_id": g["target_id"]},
                             label="Deny + pin regression"),
                   cl.Action(name="resume_run", payload={"run_id": g["run_id"]},
                             label="Resume (re-verify via graph.resume_run)")]
        await cl.Message(content=f"Owner gate — {g['run_id']} (target {g['target_id']})",
                         actions=actions).send()


async def _do_resume(run_id: str):
    """Resume through the graph's REAL resume paths — graph.resume_run
    for owner-gate parks, graph.resume_job for durable-job parks; the
    same functions the CLI's resume / resume-run commands call. The
    outcome reported is the ledger state afterwards, nothing else."""
    run_id = _normalize_run_id(run_id)
    led = Ledger()
    try:
        run = led.get_run(run_id)
    except KeyError:
        await cl.Message(content=f"No run {run_id} in the ledger.").send()
        return
    mode = resume_mode_for(run)
    if mode is None:
        await cl.Message(content=(f"Run {run_id} is in state {run['state']} — no resume "
                                  "path exists for that state. Only PARKED runs resume.")).send()
        return
    fn_name = "resume_run" if mode == "owner-gate" else "resume_job"
    await cl.Message(content=f"Resuming {run_id} via graph.{fn_name} "
                             f"({mode} path)…").send()
    result, run, packet = await asyncio.to_thread(_resume_fresh, run_id, mode)
    detail = ""
    if mode == "durable-job":
        detail = (f"\nresume_job result: resumed={result.get('resumed')}"
                  + (f" — {result.get('reason')}" if result.get("reason") else ""))
    elif "__interrupt__" in (result.get("final") or {}):
        detail = "\nThe run is paused at the owner gate again (interrupt re-issued)."
    await cl.Message(content=(f"Run {run_id} after resume — ledger state **{run['state']}**\n"
                              f"Blocker: {run['blocker'] or 'none'}{detail}\n"
                              f"Packet: `{packet}`")).send()
    _log_turn("wielder", f"resume {run_id} via {mode} -> state {run['state']}")


@cl.on_message
async def on_message(message: cl.Message):
    text = (message.content or "").strip()
    _log_turn("owner", text)
    files = message.elements or []
    attachments = []
    for el in files:
        p = Path(getattr(el, "path", "") or "")
        if p.exists():
            dest = C.DATA / "chat-uploads" / p.name
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(p.read_bytes())
            attachments.append({"path": str(dest), "sha256": sha256_of(dest)})
    board = Board()
    if text.lower() == "grants":
        from . import authz as _a
        lines = [f"#{g['id']} [{'REVOKED' if g['revoked_at'] else 'active'}] {g['action_class']} "
                 f"scope={g['scope']}" for g in _a.list_grants()]
        lines.append("Grant with `grant <class>`, revoke with `revoke <id>`. "
                     "Never grantable (owner acts): " + ", ".join(_a.NEVER_GRANTABLE))
        await cl.Message(content="\n".join(lines) or "no grants recorded").send()
        return
    gm = re.match(r"grant ([\w\-]+)", text.lower())
    if gm:
        from . import authz as _a
        try:
            gid = _a.grant(gm.group(1), "*")
            await cl.Message(content=f"Standing authorization granted: #{gid} {gm.group(1)} (scope *). "
                                     "It will not prompt again; every use is audit-logged.").send()
        except Exception as e:
            await cl.Message(content=f"Cannot grant: {e}").send()
        return
    rm = re.match(r"revoke (\d+)", text.lower())
    if rm:
        from . import authz as _a
        _a.revoke(int(rm.group(1)))
        await cl.Message(content=f"Grant #{rm.group(1)} revoked.").send()
        return
    m = re.search(r"run card (\d+)", text.lower())
    if text.lower() in ("queue", "board"):
        await _send_board()
        return
    tm = re.match(r"(?:timeline|status) (\S+)$", text.lower())
    if tm:
        await _send_timeline(tm.group(1))
        return
    pm = re.match(r"packet (\S+)$", text.lower())
    if pm:
        await _send_packet(pm.group(1))
        return
    if text.lower() == "gates":
        await _send_gates()
        return
    if text.lower() == "resumable":
        await cl.Message(content=render_resumable(
            resumable_runs(Ledger().list_runs(50)))).send()
        return
    xm = re.match(r"resume (\S+)$", text.lower())
    if xm:
        await _do_resume(xm.group(1))
        return
    cm = re.match(r"(?:checkpoints|rewind) (\S+)$", text.lower())
    if cm:
        try:
            rows = await asyncio.to_thread(_checkpoint_rows, _normalize_run_id(cm.group(1)))
            await cl.Message(content=render_checkpoints(
                _normalize_run_id(cm.group(1)), rows)).send()
        except Exception as e:
            await cl.Message(content=f"Checkpoint history unreadable for "
                                     f"{cm.group(1)}: {e}").send()
        return
    if m or text.lower() == "run":
        card = None
        if m:
            for col in ["Ready", "Backlog", "Doing", "Verify", "Owner review"]:
                for t in board.tasks_in(col):
                    if int(t["id"]) == int(m.group(1)):
                        card = t
        else:
            card = board.first_ready_card()
        if card is None:
            await cl.Message(content="No matching card is available to run.").send()
            return
        if attachments:
            card = {**card, "description": (card.get("description") or "") +
                    f"\nAttachments (provenance): {json.dumps(attachments)}"}
        await _run_and_report(card)
        return
    # Any other owner message becomes a queue card — the chat is not a
    # side-channel: work enters through the queue, under the constitution.
    cols = board.columns()
    cid = board.call("createTask", project_id=1, title=scrub(text)[:120],
                     column_id=cols["Backlog"],
                     description=f"From Wielder chat. Attachments: {json.dumps(attachments)}")
    await cl.Message(content=f"Added as queue card #{cid} (Backlog). It runs when it reaches "
                             "Ready and is pulled — under the same gates as everything else.").send()


@cl.action_callback("approve")
async def on_approve(action: cl.Action):
    """The owner's verdict, recorded through the gate's own script.
    The gate change then needs its own commit (gate lane) before a
    verify run can certify — the chat says so plainly."""
    tid = action.payload["target_id"]
    out = subprocess.run(["python3", str(C.FINISH_GATE / "review/record_verdict.py"),
                          tid, "APPROVED", "via Wielder chat (owner)"],
                         capture_output=True, text=True)
    await cl.Message(content=(f"Owner verdict recorded for {tid}: {out.stdout.strip()} "
                              f"{out.stderr.strip()}\nNext: the gate lane commits that change on "
                              "its own; then `resume " + action.payload["run_id"] + "` here "
                              "(or `wielder resume` in the CLI — same graph.resume_run path) "
                              "re-verifies and routes.")).send()


@cl.action_callback("resume_run")
async def on_resume_action(action: cl.Action):
    """Resume button on an owner-gate / run report message — calls the
    same _do_resume path as the `resume <run_id>` command, which routes
    to graph.resume_run / graph.resume_job by the run's ledger state."""
    await _do_resume(action.payload["run_id"])


@cl.action_callback("deny")
async def on_deny(action: cl.Action):
    tid = action.payload["target_id"]
    out = subprocess.run(["python3", str(C.FINISH_GATE / "review/record_rejection.py"),
                          tid, "owner_gate", "Rejected by the owner via Wielder chat"],
                         capture_output=True, text=True)
    await cl.Message(content=(f"Rejection recorded for {tid} and pinned as a regression: "
                              f"{out.stdout.strip()} {out.stderr.strip()}")).send()
