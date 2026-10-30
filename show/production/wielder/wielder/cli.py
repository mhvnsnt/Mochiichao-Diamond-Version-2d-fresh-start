"""WIELDER — a production Agentic AI system (autonomous multi-agent
production system) for the Mochiichao show.

Management surface (the manager dispatches, clears blockers, and reads
evidence through this CLI — no manager action requires editing code):

  wielder queue                 list the finish queue (columns + cards)
  wielder run-once [--card ID]  run one card through the full loop
  wielder runs                  recent runs from the SQLite ledger
  wielder status <run_id>       one run: state, transitions, tool calls
  wielder packet <run_id>       (re)generate + print the run's packet
  wielder resume <run_id>       resume a run paused at the owner gate
  wielder verify-claim <claim.json> --repo <path> [--ref <ref>]
                                verify an external lane's completion claim
                                against git truth (gates/claims.py)
  wielder check-report <ask.json> <step.json>
                                check a reported step: method used vs
                                specified, banned ops, path scope
                                (gates/instruction.py)
  wielder seats                 measured brain-seat availability
  wielder board-check           is the finish queue serving?
  wielder skills [list|import <path>] [--registry <path>]
                                imported SKILL.md skills (guidance data)
  wielder telemetry [export|status] [--run <id>] [--out <dir>]
                                Langfuse ingestion export + local mirror
"""
from __future__ import annotations

import argparse
import json
import pathlib
import sys

from . import brain
from .graph import resume_run, run_card
from .ledger import Ledger
from .queue import Board
from .report import build_packet


def _board() -> Board:
    return Board()


def cmd_queue(_args) -> int:
    b = _board()
    for col in ["Backlog", "Ready", "Doing", "Verify", "Owner review", "Done"]:
        tasks = b.tasks_in(col)
        print(f"{col}: {len(tasks)}")
        for t in tasks:
            print(f"  #{t['id']} {t['title']}")
    return 0


def cmd_run_once(args) -> int:
    b = _board()
    ledger = Ledger()
    if args.card:
        card = None
        for col in ["Ready", "Backlog", "Doing", "Verify", "Owner review"]:
            for t in b.tasks_in(col):
                if int(t["id"]) == args.card:
                    card = t
        if card is None:
            print(f"card {args.card} not found")
            return 2
    else:
        card = b.first_ready_card()
        if card is None:
            print("no card in Ready — nothing to run (WIP=1, queue is the work source)")
            return 0
    result = run_card(ledger, b, card)
    run = ledger.get_run(result["run_id"])
    packet = build_packet(ledger, result["run_id"])
    print(json.dumps({"run_id": result["run_id"], "state": run["state"],
                      "blocker": run["blocker"], "manifest": run["manifest_path"],
                      "packet": str(packet),
                      "interrupted_at_owner_gate": "__interrupt__" in result["final"]}, indent=1))
    return 0


def cmd_runs(_args) -> int:
    for r in Ledger().list_runs():
        print(f"{r['run_id']}  {r['state']:<9} card #{r['card_id']} {r['card_title'][:60]}")
    return 0


def cmd_status(args) -> int:
    run = Ledger().get_run(args.run_id)
    print(json.dumps({k: run[k] for k in ("run_id", "card_id", "card_title", "target_id",
                                          "state", "blocker", "manifest_path",
                                          "manifest_sha256", "retries")}, indent=1))
    for t in run["transitions"]:
        print(f"  {t['ts']} {t['from'] or '∅'} → {t['to']}: {t['reason']}")
    for tc in run["tool_calls"]:
        print(f"  tool {tc['tool']} ok={bool(tc['ok'])} exit={tc['exit_code']}")
    return 0


def cmd_packet(args) -> int:
    packet = build_packet(Ledger(), args.run_id)
    print(packet.read_text())
    print(f"[packet at {packet}]")
    return 0


def cmd_resume(args) -> int:
    ledger = Ledger()
    result = resume_run(ledger, _board(), args.run_id)
    run = ledger.get_run(args.run_id)
    packet = build_packet(ledger, args.run_id)
    print(json.dumps({"run_id": args.run_id, "state": run["state"], "blocker": run["blocker"],
                      "packet": str(packet),
                      "interrupted_at_owner_gate": "__interrupt__" in result["final"]}, indent=1))
    return 0


def cmd_resume_run(args) -> int:
    """Durable-job resume (owner expansion card 3): crash during
    execute() or a budget park — never the owner gate (cmd_resume)."""
    from .graph import resume_job
    ledger = Ledger()
    result = resume_job(ledger, _board(), args.run_id)
    print(json.dumps(result, indent=1))
    return 0 if result.get("resumed") else 2


def cmd_repo_index(args) -> int:
    """Repo index (owner expansion card 4): build/refresh the index
    of real paths, registries, schemas and public APIs, or check a
    text's citations against it."""
    from . import repo_index
    if args.action == "build":
        idx = repo_index.build_index()
        path = repo_index.save_index(idx)
        print(json.dumps({"index": str(path), "root": idx["root"],
                          "paths": idx["path_count"], "truncated": idx["truncated"],
                          "registries": len(idx["registries"]),
                          "schemas": len(idx["schemas"]), "apis": len(idx["apis"]),
                          "generated_at": idx["generated_at"]}, indent=1))
        return 0
    idx = repo_index.load_or_build()
    if args.action == "check":
        rep = repo_index.check_citations(idx, args.text or "")
        print(json.dumps(rep, indent=1))
        return 0 if rep["ok"] else 2
    print(json.dumps({"index": str(repo_index.index_path()), "root": idx["root"],
                      "paths": idx["path_count"], "generated_at": idx["generated_at"],
                      "registries": len(idx["registries"]), "apis": len(idx["apis"])},
                     indent=1))
    return 0


def cmd_loops(args) -> int:
    """Circle detector status (owner expansion card 5): thresholds
    + the most recent loop/stall escalation firings."""
    from . import circles, hooks
    fired = [f for f in hooks.recent_fired(limit=200)
             if f.get("event") in ("run.loop_detected", "run.stalled")]
    print(json.dumps({"loop_repeat_threshold": circles.loop_threshold(),
                      "stall_max_checks": circles.stall_max_checks(),
                      "recent_loop_events": fired[-10:]}, indent=1))
    return 0


def cmd_verify_claim(args) -> int:
    """External proof gate (grok lane PR #44, reconciliation): a lane's
    completion claim counts only if every commit, file hash and merged
    PR it cites verifies against the real repo. Exit 0 = claim holds."""
    from .gates import claims
    claim = json.loads(pathlib.Path(args.claim).read_text())
    lookup = None
    if claim.get("prs"):
        slug = claim.get("repo_slug")
        lookup = claims.gh_pr_lookup(slug) if slug else (lambda n: None)
    v = claims.verify_claim(claim, pathlib.Path(args.repo), args.ref,
                            pr_lookup=lookup)
    print(json.dumps({"ok": v.ok, "checked": v.checked,
                      "failures": v.failures}, indent=1))
    return 0 if v.ok else 1


def cmd_check_report(args) -> int:
    """External report instruction checker (grok lane PR #44,
    reconciliation): method used vs method specified word-for-word,
    banned operations, touched paths vs allowed scope. Exit 0 = clean."""
    from .gates import instruction
    ask = json.loads(pathlib.Path(args.ask).read_text())
    step = json.loads(pathlib.Path(args.step).read_text())
    problems = instruction.check_step(ask, step)
    print(json.dumps({"ok": not problems, "problems": problems}, indent=1))
    return 0 if not problems else 1


def cmd_seats(_args) -> int:
    print(json.dumps(brain.seat_status(), indent=1))
    return 0


def cmd_run_queue(args) -> int:
    """No-idle topology (manager level): process Ready cards one at a
    time; a parked card never blocks the cards behind it."""
    b = _board()
    ledger = Ledger()
    done = 0
    while done < args.max:
        card = b.first_ready_card()
        if card is None:
            break
        before = {r["run_id"] for r in ledger.list_runs(50)}
        result = run_card(ledger, b, card)
        run = ledger.get_run(result["run_id"])
        build_packet(ledger, result["run_id"])
        print(json.dumps({"run_id": result["run_id"], "card": card["id"],
                          "state": run["state"], "blocker": run["blocker"]}))
        done += 1
        if result["run_id"] in before:
            break
    print(f"processed {done} card(s)")
    return 0


def cmd_pin_request(args) -> int:
    from .pinning import build_pin_request
    path = build_pin_request(Ledger(), args.run_id, args.defect_class, args.owner_words)
    print(f"pin request written: {path}")
    print("application stays with the gate lane (scorer separation): "
          "finish-gate/review/record_rejection.py, as its own commit")
    return 0


def cmd_rewind(args) -> int:
    """Time-travel surface: list the run's checkpoints (last verified
    states) from the graph's SQLite checkpointer."""
    from .graph import build_graph
    graph = build_graph(Ledger(), None)
    cfg = {"configurable": {"thread_id": args.run_id}}
    snaps = list(graph.get_state_history(cfg))
    for s in snaps:
        print(f"checkpoint {s.config['configurable'].get('checkpoint_id', '?')[:12]} "
              f"next={s.next} values_keys={sorted(s.values.keys()) if s.values else []}")
    print(f"{len(snaps)} checkpoint(s) for {args.run_id}")
    return 0


def cmd_board_check(_args) -> int:
    try:
        cols = _board().columns()
        print(f"board serving: columns {cols}")
        return 0
    except Exception as e:
        print(f"board NOT serving: {e}")
        return 1


def cmd_heartbeat(args) -> int:
    from .scheduler import heartbeat_cycle
    if args.once:
        out = heartbeat_cycle(Ledger(), _board(), max_cards=args.max)
        print(json.dumps(out, indent=1))
        return 0
    from .scheduler import heartbeat
    heartbeat(interval_seconds=args.interval)
    return 0


def cmd_digest(_args) -> int:
    """Memory digest — the file-convention equivalent: a Markdown digest
    of what the system has done and what is parked, generated from the
    ledger (check the record before claiming what is saved)."""
    from . import constitution as C
    led = Ledger()
    lines = ["# WIELDER DIGEST — generated from the run ledger", ""]
    for r in led.list_runs(30):
        lines.append(f"- {r['created_at']} {r['run_id']} [{r['state']}] card #{r['card_id']} "
                     f"{r['card_title']}" + (f" — blocker: {r['blocker']}" if r["blocker"] else ""))
    path = C.DATA / "DIGEST.md"
    path.write_text("\n".join(lines) + "\n")
    print(f"digest written: {path}")
    return 0


def cmd_artifacts(_args) -> int:
    from . import constitution as C
    from .tools import sha256_of
    runs_dir = C.DATA / "runs"
    if runs_dir.exists():
        for f in sorted(runs_dir.rglob("*")):
            if f.is_file():
                print(f"{f.relative_to(C.DATA)}  sha256 {sha256_of(f)}  {f.stat().st_size} B")
    return 0


def cmd_desktop(args) -> int:
    from . import desktop
    if args.action == "vnc":
        print(json.dumps(desktop.start_vnc_seat(), indent=1))
    else:
        print(json.dumps(desktop.self_provision(), indent=1))
    return 0


def cmd_delegate(args) -> int:
    from .delegate import delegate
    b = _board()
    card = None
    for col in ["Ready", "Backlog", "Doing", "Verify", "Owner review"]:
        for t in b.tasks_in(col):
            if int(t["id"]) == args.card:
                card = t
    if card is None:
        print(f"card {args.card} not found")
        return 2
    record = delegate(Ledger(), b, args.parent, card, args.scope)
    print(json.dumps(record, indent=1))
    return 0


def cmd_advise(args) -> int:
    from . import brain
    out = brain.advise(args.prompt, seat=args.seat)
    print(json.dumps(out, indent=1))
    return 0 if out["ok"] else 2


def cmd_context(args) -> int:
    from . import context
    vocab = context.reference_vocabulary()
    print(json.dumps({
        "enabled": context.compaction_enabled(),
        "env": context.COMPACTION_ENV,
        "threshold_chars": context.threshold_chars(),
        "digest_cap_chars": context.digest_cap_chars(),
        "tail_entries": context.tail_entries(),
        "pinned_vocabulary": {
            "total": len(vocab),
            "owner_rulings": sum(1 for _, k, _ in vocab if k.startswith("owner-ruling")),
            "canon_locks": sum(1 for _, k, _ in vocab if k == "canon-lock"),
            "standing_authorization_classes":
                sum(1 for _, k, _ in vocab if k == "standing-authorization class"),
        },
        "note": "deterministic extractive digest; routing inputs pinned "
                "verbatim; on by default (WIELDER_COMPACTION=0 disables)",
    }, indent=1))
    return 0


def cmd_drift_waive(args) -> int:
    """Record an owner ruling on an instruction-drift flag (owner
    expansion card 2). The ruling is the only thing that clears a
    drift flag, and it is recorded with its text."""
    from . import instruction
    rec = instruction.add_waiver(args.card, args.fingerprint, args.ruling)
    print(json.dumps({"waiver_recorded": rec,
                      "note": "the drift flag for this card + fingerprint is "
                              "cleared by this ruling; the ruling text is on "
                              "record in instruction-waivers.json"}, indent=1))
    return 0


def cmd_delegate_many(args) -> int:
    from .fanout import delegate_many
    b = _board()
    wanted = [int(x) for x in args.cards.split(",") if x.strip()]
    items = []
    for col in ["Ready", "Backlog", "Doing", "Verify", "Owner review"]:
        for t in b.tasks_in(col):
            if int(t["id"]) in wanted:
                items.append({"card": t, "scope": args.scope})
    missing = [c for c in wanted if c not in {int(i["card"]["id"]) for i in items}]
    if missing:
        print(f"cards not found: {missing}")
        return 2
    print(json.dumps(delegate_many(args.parent, items, max_workers=args.workers), indent=1))
    return 0


def cmd_hooks(args) -> int:
    from . import hooks
    if args.action == "fire":
        if not args.event:
            print("hooks fire needs an event name")
            return 2
        payload = json.loads(args.payload) if args.payload else {}
        print(json.dumps(hooks.emit(args.event, payload, board=_board()), indent=1))
        return 0
    if args.action == "drain":
        print(json.dumps(hooks.drain_inbox(_board()), indent=1))
        return 0
    print(json.dumps({"hooks": hooks.load_hooks(),
                      "recent_fired": hooks.recent_fired()}, indent=1))
    return 0


def cmd_mcp(args) -> int:
    from . import mcp_client
    if args.action == "call":
        if not args.server or not args.tool:
            print("mcp call needs a server and a tool name")
            return 2
        res = mcp_client.call(args.server, args.tool, json.loads(args.payload or "{}"))
        print(res.model_dump_json(indent=1))
        return 0 if res.ok else 2
    found = mcp_client.discover_all()
    print(json.dumps({"servers": found,
                      "errors": mcp_client.LAST_DISCOVERY_ERRORS}, indent=1))
    return 0


def cmd_skills(args) -> int:
    """Skill registry (parity round 2, gap 2): list imported SKILL.md
    skills, or import one through the scrub + rules + instruction
    gate in wielder.skill_import. Skills are guidance data."""
    from pathlib import Path as _P

    from . import skill_import
    registry = _P(args.registry) if args.registry else None
    if args.action == "import":
        if not args.path:
            print("skills import needs a SKILL.md path")
            return 2
        try:
            rec = skill_import.import_skill(args.path, registry=registry)
        except skill_import.SkillImportError as e:
            print(f"skill import rejected: {e}")
            return 2
        print(json.dumps({k: rec[k] for k in
                          ("id", "name", "description", "kind", "source", "imported_at")},
                         indent=1))
        return 0
    skills = skill_import.load_skills(registry)
    print(json.dumps({"skills": [{k: s.get(k) for k in
                                  ("id", "name", "description", "kind", "source")}
                                 for s in skills]}, indent=1))
    return 0


def cmd_telemetry(args) -> int:
    """Langfuse telemetry export (parity round 2, gap 3): project
    ledger runs into Langfuse's ingestion shape, always mirrored
    locally; POSTed only when the Langfuse env is configured."""
    from . import telemetry
    if args.action == "status":
        cfg = telemetry.langfuse_config()
        print(json.dumps({**cfg,
                          "detail": "configured" if cfg["configured"] else
                                    "NOT CONFIGURED — LANGFUSE_HOST / "
                                    "LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY "
                                    "not all present; exports write locally only"},
                         indent=1))
        return 0
    out = args.out or str(pathlib.Path(__file__).resolve().parent
                          / "data" / "telemetry-export")
    rep = telemetry.export_runs(Ledger(), out, run_id=args.run)
    print(json.dumps(rep, indent=1))
    return 0


OWNER_STANDING_CLASSES = ["browser-actions", "kaggle-browser", "staging-github-terabox",
                          "landing-lane-prs", "local-builds-renders"]


def cmd_grants(args) -> int:
    from . import authz
    if args.action == "seed":
        existing = {g["action_class"] for g in authz.list_grants() if not g["revoked_at"]}
        for cls in OWNER_STANDING_CLASSES:
            if cls not in existing:
                gid = authz.grant(cls, "*", granted_by="owner standing order 2026-10-28",
                                  note="Addendum 12 standing authorization; revocable at any time")
                print(f"granted #{gid}: {cls} (scope *)")
        return 0
    if args.action == "grant":
        gid = authz.grant(args.cls, args.scope or "*")
        print(f"granted #{gid}: {args.cls}")
        return 0
    if args.action == "revoke":
        authz.revoke(int(args.cls))
        print(f"revoked grant #{args.cls}")
        return 0
    for g in authz.list_grants():
        state = "REVOKED" if g["revoked_at"] else "active"
        print(f"#{g['id']} [{state}] {g['action_class']} scope={g['scope']} by {g['granted_by']} at {g['granted_at']}")
    print("never grantable (owner acts, provider design): " + ", ".join(authz.NEVER_GRANTABLE))
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="wielder", description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("queue").set_defaults(fn=cmd_queue)
    p = sub.add_parser("run-once"); p.add_argument("--card", type=int); p.set_defaults(fn=cmd_run_once)
    sub.add_parser("runs").set_defaults(fn=cmd_runs)
    p = sub.add_parser("status"); p.add_argument("run_id"); p.set_defaults(fn=cmd_status)
    p = sub.add_parser("packet"); p.add_argument("run_id"); p.set_defaults(fn=cmd_packet)
    p = sub.add_parser("resume"); p.add_argument("run_id"); p.set_defaults(fn=cmd_resume)
    p = sub.add_parser("resume-run"); p.add_argument("run_id"); p.set_defaults(fn=cmd_resume_run)
    p = sub.add_parser("repo-index"); p.add_argument("action", nargs="?", default="status", choices=["status", "build", "check"]); p.add_argument("text", nargs="?"); p.set_defaults(fn=cmd_repo_index)
    sub.add_parser("loops").set_defaults(fn=cmd_loops)
    sub.add_parser("seats").set_defaults(fn=cmd_seats)
    sub.add_parser("board-check").set_defaults(fn=cmd_board_check)
    p = sub.add_parser("run-queue"); p.add_argument("--max", type=int, default=3); p.set_defaults(fn=cmd_run_queue)
    p = sub.add_parser("pin-request"); p.add_argument("run_id"); p.add_argument("defect_class"); p.add_argument("owner_words"); p.set_defaults(fn=cmd_pin_request)
    p = sub.add_parser("rewind"); p.add_argument("run_id"); p.set_defaults(fn=cmd_rewind)
    p = sub.add_parser("heartbeat"); p.add_argument("--once", action="store_true"); p.add_argument("--max", type=int, default=3); p.add_argument("--interval", type=int, default=21600); p.set_defaults(fn=cmd_heartbeat)
    sub.add_parser("digest").set_defaults(fn=cmd_digest)
    sub.add_parser("artifacts").set_defaults(fn=cmd_artifacts)
    p = sub.add_parser("delegate"); p.add_argument("parent"); p.add_argument("--card", type=int, required=True); p.add_argument("--scope", default=""); p.set_defaults(fn=cmd_delegate)
    p = sub.add_parser("grants"); p.add_argument("action", nargs="?", default="list", choices=["list", "seed", "grant", "revoke"]); p.add_argument("cls", nargs="?"); p.add_argument("--scope"); p.set_defaults(fn=cmd_grants)
    p = sub.add_parser("desktop"); p.add_argument("action", nargs="?", default="status", choices=["status", "provision", "vnc"]); p.set_defaults(fn=cmd_desktop)
    p = sub.add_parser("advise"); p.add_argument("prompt"); p.add_argument("--seat"); p.set_defaults(fn=cmd_advise)
    sub.add_parser("context").set_defaults(fn=cmd_context)
    p = sub.add_parser("drift-waive"); p.add_argument("--card", type=int, required=True); p.add_argument("--fingerprint", required=True); p.add_argument("--ruling", required=True); p.set_defaults(fn=cmd_drift_waive)
    p = sub.add_parser("verify-claim"); p.add_argument("claim"); p.add_argument("--repo", required=True); p.add_argument("--ref", default="HEAD"); p.set_defaults(fn=cmd_verify_claim)
    p = sub.add_parser("check-report"); p.add_argument("ask"); p.add_argument("step"); p.set_defaults(fn=cmd_check_report)
    p = sub.add_parser("delegate-many"); p.add_argument("parent"); p.add_argument("--cards", required=True, help="comma-separated card ids"); p.add_argument("--scope", default=""); p.add_argument("--workers", type=int, default=3); p.set_defaults(fn=cmd_delegate_many)
    p = sub.add_parser("hooks"); p.add_argument("action", nargs="?", default="list", choices=["list", "fire", "drain"]); p.add_argument("event", nargs="?"); p.add_argument("payload", nargs="?"); p.set_defaults(fn=cmd_hooks)
    p = sub.add_parser("mcp"); p.add_argument("action", nargs="?", default="discover", choices=["discover", "call"]); p.add_argument("server", nargs="?"); p.add_argument("tool", nargs="?"); p.add_argument("payload", nargs="?"); p.set_defaults(fn=cmd_mcp)
    p = sub.add_parser("skills"); p.add_argument("action", nargs="?", default="list", choices=["list", "import"]); p.add_argument("path", nargs="?"); p.add_argument("--registry"); p.set_defaults(fn=cmd_skills)
    p = sub.add_parser("telemetry"); p.add_argument("action", nargs="?", default="export", choices=["export", "status"]); p.add_argument("--run"); p.add_argument("--out"); p.set_defaults(fn=cmd_telemetry)
    args = ap.parse_args(argv)
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
