"""WIELDER graph — the ReAct loop as a state graph on the official
LangGraph package (pillar #1, MIT — see THIRD-PARTY-NOTICES).

Perceive (claim + scrub) → Reason (discovery log + plan; method binding
hard-fails) → Act (schema-validated tools only) → Observe (raw results,
unedited) → Evaluate (routes ONLY on exit codes + the finish-gate
verifier's manifest; model claims are ignored by the router) → the
owner gate is an interrupt node: the run pauses durably and resumes
only when the owner's recorded verdict changes the manifest.

Durable execution: the graph's SQLite checkpointer (time-travel /
rewind on failure) + the Wielder ledger — one state machine of record.
"""
from __future__ import annotations

import json
import re
import sqlite3
import traceback
from typing import Any, Optional, TypedDict

from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from . import brain as brain_mod
from . import constitution as C
from . import context as context_mod
from . import critic as critic_mod
from . import evidence as evidence_mod
from . import instruction as instruction_mod
from . import journal as journal_mod
from . import circles as circles_mod
from . import judgment as judgment_mod
from . import methods as M
from . import rules as rules_mod
from . import tools
from . import versions as versions_mod
from .ledger import Ledger
from .queue import Board
from .schemas import CriticNote, DiscoveryLog, Plan, PlanStep, ToolResult
from .scrub import scrub

CALIB_TARGET = "calib-defect-planted"


class WielderState(TypedDict, total=False):
    run_id: str
    card_id: int
    card_title: str
    card_description: str
    scrubbed_text: str
    target_id: Optional[str]
    discovery: dict
    plan: dict
    calibration: dict
    tool_results: list
    manifest: dict
    critic_note: dict
    retries: int
    advisory_note: str
    context_digest: dict
    evidence: dict
    artifact: str
    instruction: dict
    drift: list
    loop_evidence: dict
    route: str
    blocker: Optional[str]
    outcome: str
    gate_announced: bool
    receipts: list
    resolved_versions: list
    diagnosis: dict


def _target_from_card(text: str) -> Optional[str]:
    m = re.search(r"finish-gate target ([a-z0-9][a-z0-9\-]*)", text)
    return m.group(1) if m else None


def build_graph(ledger: Ledger, board: Optional[Board]):
    def _run_step(run_id: str, step: PlanStep) -> dict:
        try:
            res = tools.call_tool(step.tool, step.payload)
        except Exception:
            res = ToolResult(tool=step.tool, ok=False, raw_output=traceback.format_exc())
        ledger.log_tool(run_id, res.tool, step.payload, res.ok, res.exit_code,
                        res.result, res.raw_output)
        out = res.model_dump()
        out["payload"] = step.payload
        return out

    def perceive(state: WielderState) -> WielderState:
        text = scrub(f"{state['card_title']}. {state.get('card_description', '')}")
        if board is not None:
            board.move(state["card_id"], "Doing")
        return {"scrubbed_text": text, "target_id": _target_from_card(text), "retries": 0}

    def plan(state: WielderState) -> WielderState:
        run_id = state["run_id"]
        ledger.transition(run_id, "PLANNING", "discovery log + method binding")
        target_id = state.get("target_id")
        if not target_id:
            ledger.transition(run_id, "FAILED", "card names no finish-gate target")
            return {"route": "failed", "outcome": "card names no finish-gate target"}
        try:
            target = M.load_target(target_id)
            for mid in target["method_ids"]:
                M.assert_accepted(mid)  # Superseded/unregistered hard-fail here
        except Exception as e:
            ledger.transition(run_id, "FAILED", f"method binding failed: {e}")
            return {"route": "failed", "outcome": str(e), "target_id": target_id}
        # Rules-registry check (#12): settled rulings are never re-litigated.
        try:
            rules_mod.check_text(state["scrubbed_text"], context="card text")
        except Exception as e:
            ledger.transition(run_id, "FAILED", f"rules-registry check failed: {e}")
            return {"route": "failed", "outcome": str(e), "target_id": target_id}
        # Current-version resolver (#9): every piece resolves to current.
        try:
            resolved = versions_mod.resolve_run_pieces(target)
        except Exception as e:
            ledger.transition(run_id, "FAILED", f"current-version resolution failed: {e}")
            return {"route": "failed", "outcome": str(e), "target_id": target_id}
        # Three-strikes class-change (#7): a third resubmission of the same
        # fix class is forbidden — the run routes to diagnosis instead.
        strikes = ledger.count_failures(target_id, "resubmit")
        if strikes >= 3:
            diag = {"target_id": target_id, "prior_resubmissions": strikes,
                    "instruction": "diagnosis required: measure the artifact in the "
                                   "space the defect lives in (drawn pixels for drawing "
                                   "defects), not in the space of the last fix class"}
            ledger.transition(run_id, "PARKED",
                              f"three-strikes: {strikes} resubmission failures on {target_id}; "
                              "diagnosis node required before any further attempt")
            return {"route": "diagnosis", "diagnosis": diag, "target_id": target_id,
                    "resolved_versions": resolved}
        # Input provenance lock (#2): exact inputs + sha256 into the run record.
        from pathlib import Path as _P
        receipts = []
        for kind, pth in (("target", str(C.FINISH_GATE / "targets" / f"{target_id}.json")),
                          ("registry", str(C.FINISH_GATE / "methods/INDEX.json")),
                          ("artifact", target["artifact"])):
            hp = _P(pth)
            if hp.exists():
                digest = tools.sha256_of(hp)
                ledger.record_input(run_id, kind, pth, digest, hp.stat().st_size)
                receipts.append({"kind": kind, "path": pth, "sha256": digest})
            else:
                receipts.append({"kind": kind, "path": pth, "sha256": None})
        hits: list[str] = []
        assumptions: list[str] = []
        try:
            from .memory import Memory
            mem = Memory()
            hits = [h["path"] for h in mem.retrieve(state["scrubbed_text"], k=C.RETRIEVAL_TOP_K)]
            assumptions.append(f"embedder live: {Memory.embedder_name}")
        except Exception as e:  # retrieval is hydration, never a gate
            assumptions.append(f"retrieval unavailable: {e}")
        discovery = DiscoveryLog(
            knowns=[f"target {target_id} governed by methods {target['method_ids']}",
                    f"artifact of record: {target['artifact']}",
                    f"owner gate on target: {target.get('owner_gate', {}).get('status')}"],
            unknowns=["artifact presence and clause measurements until the verifier runs"],
            files_read=[str(C.FINISH_GATE / 'targets' / f'{target_id}.json'),
                        str(C.FINISH_GATE / 'methods/INDEX.json')],
            assumptions=assumptions, retrieval_hits=hits)
        steps = [PlanStep(tool="check_artifact", payload={"path": target["artifact"]},
                          purpose="observe artifact presence before submission"),
                 PlanStep(tool="run_verifier", payload={"target_id": target_id},
                          purpose="submit artifact to the finish-gate verifier"),
                 PlanStep(tool="read_manifest", payload={"target_id": target_id},
                          purpose="read the verifier manifest (the only PASS source)"),
                 PlanStep(tool="hash_file", payload={"path": target["artifact"]},
                          purpose="proof gate: hash-bind the submitted artifact as evidence"),
                 PlanStep(tool="hash_file",
                          payload={"path": str(C.FINISH_GATE / "evidence"
                                               / f"{target['deliverable']}.json")},
                          purpose="proof gate: hash-bind the verifier manifest file as evidence")]
        plan_obj = Plan(target_id=target_id, method_ids=list(target["method_ids"]),
                        discovery=discovery, steps=steps)
        # Instruction checker (owner expansion card 2): the plan is
        # compared against the instruction recorded at intake, before
        # anything runs. Out-of-scope drift parks the run and fires
        # the escalation hook; landing stays blocked until the drift
        # is resolved or the owner rules (wielder drift-waive).
        instruction = instruction_mod.record_instruction(
            state["card_title"], state.get("card_description", ""), target_id, target)
        drift = instruction_mod.check_steps(
            instruction, [s.model_dump() for s in steps], card_id=state["card_id"])
        if drift:
            named = "; ".join(f"{d['where']} {d['tool']} -> {d['path']} [{d['fingerprint']}]"
                              for d in drift[:3])
            blocker = (f"INSTRUCTION DRIFT at plan time: {len(drift)} out-of-scope "
                       f"item(s): {named}. Landing is blocked until the drift is "
                       "resolved or the owner rules (wielder drift-waive).")
            try:
                from . import hooks as _hooks
                _hooks.emit("instruction.drift",
                            {"run_id": run_id, "target_id": target_id,
                             "drift": named}, board)
            except Exception:
                pass  # the park is the mechanism; the hook is the escalation
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {"route": "parked", "blocker": blocker, "instruction": instruction,
                    "drift": drift, "target_id": target_id,
                    "resolved_versions": resolved}
        return {"discovery": discovery.model_dump(), "plan": plan_obj.model_dump(),
                "target_id": target_id, "route": "ok", "artifact": target["artifact"],
                "instruction": instruction, "drift": [],
                "receipts": receipts, "resolved_versions": resolved}

    def preflight(state: WielderState) -> WielderState:
        """Pre-flight validation (#4 + desktop layer): the environment
        is self-provisioned first (display/bus/scratch — Addendum 13),
        read receipts are verified (cited files exist, hashes match
        the provenance lock), every plan step's payload is dry-validated
        against its tool schema, the standing authorizations the plan
        needs are confirmed, and the scorer paths are checked clean
        BEFORE any expensive step runs."""
        run_id = state["run_id"]
        from . import desktop as _desk
        env_evidence = _desk.self_provision()
        ledger.tool_call(run_id, "desktop_self_provision", True, 0 if env_evidence["ok"] else 1)
        if not env_evidence["ok"]:
            blocker = ("desktop layer could not self-provision — desktop attempt evidence: "
                       + json.dumps(env_evidence)[:400])
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {"route": "parked", "blocker": blocker}
        from . import authz as _authz
        if _authz.active_grant("local-builds-renders") is None:
            blocker = ("standing authorization not granted for class "
                       "'local-builds-renders' — the owner grants it once "
                       "(chat: `grant local-builds-renders`); this run parks, "
                       "nothing else stops")
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {"route": "parked", "blocker": blocker}
        problems: list[str] = []
        for r in state.get("receipts", []):
            if r["kind"] in ("target", "registry"):
                if not r.get("sha256"):
                    problems.append(f"read receipt missing content: {r['path']}")
        for step in state["plan"]["steps"]:
            model = tools.REGISTRY[step["tool"]][0]
            try:
                model(**step["payload"])
            except Exception as e:
                problems.append(f"payload for {step['tool']} fails schema: {e}")
        import subprocess as _sp
        dirty = _sp.run(["git", "-C", str(C.FINISH_GATE), "status", "--porcelain", "--",
                         "gates", "methods", "targets", "goldens"],
                        capture_output=True, text=True).stdout.strip()
        if dirty:
            problems.append(f"scorer paths dirty at preflight (separation): {dirty[:200]}")
        # Repo index (owner expansion card 4): citations in the card
        # text and in plan payloads must exist in the index of the
        # real repo — a deliverable citing a path or API absent from
        # the index fails preflight (the real-code wiring law,
        # mechanically enforced). Absolute paths outside the indexed
        # root are outside the index's jurisdiction and are skipped;
        # an index that cannot be built or read fails closed.
        try:
            from . import repo_index as _ri
            idx = _ri.load_or_build()
            rep = _ri.check_citations(idx, state.get("scrubbed_text", ""))
            for pth in rep["missing_paths"]:
                problems.append(f"card cites a path absent from the repo index: {pth}")
            for api in rep["missing_apis"]:
                problems.append(f"card cites an API absent from the repo index: {api}")
            for step in state["plan"]["steps"]:
                for pth in _ri.payload_paths(step["payload"]):
                    if _ri.path_status(idx, pth) == "missing":
                        problems.append(
                            f"plan step {step['tool']} cites a path absent from "
                            f"the repo index: {pth}")
        except Exception as e:
            problems.append(f"repo index unavailable — citations cannot be verified: {e}")
        if problems:
            reason = "preflight failed: " + "; ".join(problems)
            ledger.transition(run_id, "FAILED", reason)
            return {"route": "failed", "outcome": reason}
        return {"route": "ok"}

    def diagnosis(state: WielderState) -> WielderState:
        """Diagnosis node (#7): reached only via the three-strikes rule.
        It records the diagnosis requirement into the packet material and
        ends the run parked — no fourth attempt of the same class."""
        return {"route": "parked",
                "blocker": "three-strikes rule: diagnosis required before any further "
                           "attempt on this target (see diagnosis record in run state)"}

    def _compact(state: WielderState, results: list) -> tuple:
        """Context compaction (parity follow-up): on by default
        (WIELDER_COMPACTION=0 disables), deterministic, recorded in the ledger
        as a tool-call row, and never load-bearing — any failure keeps
        the original history. Returns (results, extra_state); the
        manifest entries evaluate() routes on are pinned verbatim
        inside context.compact_history, so routing inputs cannot
        change. Advisory-class wiring, same pattern as brain.advise:
        it annotates the run, it cannot steer it."""
        if not context_mod.compaction_enabled():
            return results, {}
        try:
            new_results, out = context_mod.maybe_compact(results, state.get("target_id"))
            if out is None:
                return results, {}
            d = out["digest"]
            ledger.log_tool(state["run_id"], "context_compact",
                            {"target_id": state.get("target_id")}, True, 0,
                            {"original_entries": d["original_entries"],
                             "original_chars": out["original_chars"],
                             "compacted_chars": out["compacted_chars"],
                             "pinned_references": [r["reference"]
                                                   for r in d["pinned_references"]]},
                            out["rendered"])
            return new_results, {"context_digest": d}
        except Exception:
            return results, {}  # compaction is never load-bearing

    def execute(state: WielderState) -> WielderState:
        run_id = state["run_id"]
        if ledger.state_of(run_id) != "EXECUTING":
            ledger.transition(run_id, "EXECUTING", "running plan steps through the tool layer")
        results: list[dict] = []
        calibration = state.get("calibration", {})
        # Gate-calibration pre-flight: the planted-defect target must FAIL
        # its bg_presence clause. If the gate cannot see a planted defect,
        # its verdicts are not trusted and the run stops here.
        if state["target_id"] != CALIB_TARGET and not calibration:
            cal = _run_step(run_id, PlanStep(
                tool="run_verifier", payload={"target_id": CALIB_TARGET, "skip_gate_run": True},
                purpose="gate calibration: planted defect must be detected"))
            man = _run_step(run_id, PlanStep(
                tool="read_manifest", payload={"target_id": CALIB_TARGET},
                purpose="read calibration manifest"))
            ac02 = next((c for c in man.get("result", {}).get("clauses", []) if c["id"] == "AC-02"), {})
            calibration = {"ac02_status": ac02.get("status"),
                           "calibration_manifest_sha256": man.get("result", {}).get("sha256")}
            if ac02.get("status") != "FAIL":
                ledger.transition(run_id, "EVALUATING", "calibration verdict")
                ledger.transition(run_id, "FAILED",
                                  "gate calibration failed: planted defect AC-02 did not FAIL")
                return {"tool_results": results, "calibration": calibration, "route": "failed",
                        "outcome": "gate calibration failed — verifier did not detect the planted defect"}
        max_steps = int(C.CONFIG.get("budgets", {}).get("max_steps_per_run", 40))
        # Durable jobs (owner expansion card 3): plan steps run under
        # the per-run step journal (wielder.journal). A step that
        # completed before a crash or a budget stop is rehydrated
        # from the journal — never repeated, never re-logged; the
        # remaining steps run under this invocation's fresh budget
        # window. The calibration pre-flight above stays outside the
        # journal: it is a read-only gate check, idempotent by design.
        # Circle detector (owner expansion card 5): every executed
        # action joins the scan — journaled steps that will rehydrate
        # included, so a loop spanning a resume is still one loop. A
        # repeat at or past the threshold parks the run with the loop
        # evidence attached; it never silently loops.
        scanned: list[dict] = []
        attempted: list[dict] = []
        _steps_now = [dict(s) for s in state["plan"]["steps"]]
        for _i, _entry in sorted(journal_mod.load(run_id).items()):
            if _i < len(_steps_now) and \
                    _entry["fingerprint"] == journal_mod.fingerprint(_steps_now[_i]):
                scanned.append({"tool": _steps_now[_i].get("tool", ""),
                                "payload": _steps_now[_i].get("payload") or {}})

        def _guarded_runner(step: dict) -> dict:
            res = _run_step(run_id, PlanStep(**step))
            attempted.append(res)
            scanned.append({"tool": step["tool"],
                            "payload": step.get("payload") or {}})
            hit = circles_mod.scan(scanned)
            if hit:
                raise circles_mod.LoopDetected(hit)
            return res

        try:
            results, exhausted = journal_mod.run_steps(
                run_id, _steps_now, _guarded_runner, max_steps)
        except circles_mod.LoopDetected as loop:
            done = journal_mod.load(run_id)
            rebuilt: list[dict] = []
            new_iter = iter(attempted)
            for i, s in enumerate(_steps_now):
                e = done.get(i)
                if e and e["fingerprint"] == journal_mod.fingerprint(s):
                    rebuilt.append(e["result"])
                else:
                    rebuilt.append(next(new_iter, {}))
            results = [r for r in rebuilt if r]
            ledger.transition(run_id, "EVALUATING", "circle detector")
            blocker = (f"CIRCLE DETECTOR: {loop.evidence['summary']} — run parked "
                       "with the loop evidence attached; it does not silently loop.")
            try:
                from . import hooks as _hooks
                _hooks.emit("run.loop_detected",
                            {"run_id": run_id, "target_id": state["target_id"],
                             "loop": loop.evidence["summary"]}, board)
            except Exception:
                pass  # the park is the mechanism; the hook is the escalation
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            results, extra = _compact(state, results)
            return {"tool_results": results, "calibration": calibration,
                    "route": "failed", "outcome": blocker,
                    "loop_evidence": loop.evidence, **extra}
        if exhausted is not None:  # budget spine (#11): park, never push on
            ledger.transition(run_id, "EVALUATING", "budget check")
            blocker = f"step budget exhausted ({max_steps}) — run parked at last verified state"
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            results, extra = _compact(state, results)
            return {"tool_results": results, "calibration": calibration,
                    "route": "failed", "outcome": blocker, **extra}
        results, extra = _compact(state, results)
        return {"tool_results": results, "calibration": calibration, **extra}

    def _manifest_of(state: WielderState) -> dict:
        man = next((r for r in reversed(state.get("tool_results", []))
                    if r["tool"] == "read_manifest"
                    and r.get("payload", {}).get("target_id") == state["target_id"]), None)
        return (man or {}).get("result", {})

    def evaluate(state: WielderState) -> WielderState:
        run_id = state["run_id"]
        if state.get("route") == "failed":  # calibration failure already transitioned
            return {"route": "failed"}
        ledger.transition(run_id, "EVALUATING", "routing on exit codes + verifier manifest only")
        manifest = _manifest_of(state)
        note: CriticNote = critic_mod.review_manifest(manifest)
        base: WielderState = {"manifest": manifest, "critic_note": note.model_dump()}
        # Advisory LLM seat (parity build): env-gated (WIELDER_ADVISORY=1),
        # advisory only. The seat's text is recorded on the run state;
        # routing below reads the manifest only — a seat can never change
        # an outcome, and a seat failure can never break the loop.
        if brain_mod.advisory_enabled():
            try:
                summary = {"target_id": manifest.get("target_id"),
                           "owner_gate": (manifest.get("owner_gate") or {}).get("status"),
                           "clauses": [{"id": c.get("id"), "status": c.get("status"),
                                        "measured": str(c.get("measured"))[:120]}
                                       for c in manifest.get("clauses", [])]}
                adv = brain_mod.advise(
                    "Audit this verifier manifest summary. List failure reasons "
                    "only; no praise, no pass language. " + json.dumps(summary)[:1200])
                if adv.get("ok"):
                    base = {**base, "advisory_note": adv["text"][:2000]}
            except Exception:
                pass  # advisory is never load-bearing
        if not manifest.get("exists"):
            blocker = "verifier produced no manifest — no evidence, no completion"
            _park_on_board(state, blocker)
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {**base, "route": "parked", "blocker": blocker}
        ledger.set_outcome(run_id, manifest_path=manifest.get("manifest_path"),
                           manifest_sha256=manifest.get("sha256"),
                           target_id=manifest.get("target_id"))
        # Full-standard self-judgment (#8): written into the run record for
        # the packet — failures first, likeness first.
        try:
            import json as _json
            from pathlib import Path as _P
            full = _json.loads(_P(manifest["manifest_path"]).read_text())
            out_dir = C.DATA / "runs" / run_id
            out_dir.mkdir(parents=True, exist_ok=True)
            (out_dir / "self_judgment.md").write_text(judgment_mod.judgment_section(full) + "\n")
        except Exception as e:
            base = {**base, "outcome": f"self-judgment write failed: {e}"}
        clauses = manifest.get("clauses", [])
        failed = [c for c in clauses if c.get("status") != "PASS"]
        owner_status = (manifest.get("owner_gate") or {}).get("status")
        if failed:
            # Stop-on-fail with the specific defects, likeness first (#3/#8).
            # Re-running the same submission cannot fix a measured defect,
            # so no retry is spent; the failure is taxonomised (#7).
            ordered = judgment_mod._order(failed)
            defects = "; ".join(f"{c['id']} {c.get('status')} (measured: {c.get('measured')})"
                                for c in ordered)
            blocker = f"Verifier clauses failed: {defects}"
            ledger.record_failure(run_id, state["target_id"],
                                  defect_class=",".join(c["id"] for c in ordered),
                                  fix_class="resubmit")
            _park_on_board(state, blocker)
            if board is not None:  # upgrade loop (7D): the failure becomes work
                from . import upgrades as _up
                _up.propose_upgrade_card(
                    board, f"WIELDER-UPGRADE: {state['target_id']} — {ordered[0]['id']} defect",
                    f"From Wielder run {run_id}. {blocker}\n"
                    "Fixes land through the method registry + finish-gate, never by "
                    "Wielder editing its own gates.")
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {**base, "route": "parked", "blocker": blocker}
        # Instruction checker (owner expansion card 2): what the run
        # actually did is re-checked against the intake instruction
        # before any completion route. Drift parks the run — landing
        # is blocked until resolved or owner-ruled. Runs whose state
        # predates the instruction record skip this (record is made
        # at plan time in the same lineage).
        if state.get("instruction"):
            drift = instruction_mod.check_results(
                state["instruction"], state.get("tool_results", []),
                card_id=state["card_id"])
            if drift:
                named = "; ".join(
                    f"{d['where']} {d['tool']} -> {d['path']} [{d['fingerprint']}]"
                    for d in drift[:3])
                blocker = (f"INSTRUCTION DRIFT: {len(drift)} out-of-scope item(s) "
                           f"in the executed record: {named}. Landing is blocked "
                           "until the drift is resolved or the owner rules "
                           "(wielder drift-waive).")
                try:
                    from . import hooks as _hooks
                    _hooks.emit("instruction.drift",
                                {"run_id": run_id, "target_id": state["target_id"],
                                 "drift": named}, board)
                except Exception:
                    pass  # the park is the mechanism; the hook is the escalation
                _park_on_board(state, blocker)
                ledger.set_outcome(run_id, blocker=blocker)
                ledger.transition(run_id, "PARKED", blocker)
                return {**base, "route": "parked", "blocker": blocker, "drift": drift}
        # Proof gate (owner expansion): an all-PASS verdict may not be
        # reported as a completion unless the run's own record carries
        # the evidence artifacts, hash-bound (wielder.evidence). A
        # verifier pass without attached evidence is a FAIL here — the
        # run parks with the missing items named and the hook fires.
        rep = evidence_mod.proof_gate(manifest, state.get("tool_results", []),
                                      state["target_id"], state.get("artifact"))
        base = {**base, "evidence": rep}
        if rep["applies"] and not rep["complete"]:
            blocker = ("PROOF GATE: verifier clauses all PASS but the finish "
                       "packet lacks attached evidence — missing: "
                       + "; ".join(rep["missing"])
                       + ". A verifier pass without evidence is a FAIL.")
            try:
                from . import hooks as _hooks
                _hooks.emit("proof_gate.failed",
                            {"run_id": run_id, "target_id": state["target_id"],
                             "missing": "; ".join(rep["missing"])}, board)
            except Exception:
                pass  # the park is the mechanism; the hook is the escalation
            _park_on_board(state, blocker)
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
            return {**base, "route": "parked", "blocker": blocker}
        if owner_status == "APPROVED":
            return {**base, "route": "success_ready"}
        return {**base, "route": "owner_gate"}

    def succeed(state: WielderState) -> WielderState:
        run_id = state["run_id"]
        manifest = state["manifest"]
        if board is not None:
            desc = board.get_description(state["card_id"])
            board.update_description(state["card_id"], desc +
                f"\n\nDone evidence: {manifest.get('manifest_path')} sha256 {manifest.get('sha256')}")
            board.move(state["card_id"], "Done")
        ledger.transition(run_id, "SUCCESS", "all clauses PASS + owner gate APPROVED")
        return {"route": "success", "outcome": "verifier manifest: all clauses PASS, owner APPROVED"}

    def owner_gate(state: WielderState) -> WielderState:
        """Interrupt node mapped to the owner gate. The run pauses here,
        durably, until the owner's recorded verdict changes the manifest;
        `wielder resume <run_id>` re-enters and re-reads the manifest."""
        run_id = state["run_id"]
        blocker = ("Machine clauses all PASS; owner gate is PENDING — "
                   "the owner's eye is the remaining gate.")
        if not state.get("gate_announced"):
            if board is not None:
                board.comment(state["card_id"], f"WIELDER run {run_id}: {blocker}")
                board.move(state["card_id"], "Owner review")
            ledger.set_outcome(run_id, blocker=blocker)
            ledger.transition(run_id, "PARKED", blocker)
        # Suspend. On resume this node restarts; the announce above is
        # guarded so it happens once.
        interrupt({"kind": "owner_gate", "run_id": run_id, "target_id": state["target_id"],
                   "awaiting": "owner verdict recorded via finish-gate review/record_verdict.py"})
        # Resumed: the owner's verdict was recorded gate-side (its own
        # commit, per the gate's law). Re-run the verifier so the manifest
        # itself carries the verdict — exit-code truth, not claims.
        ledger.transition(run_id, "EVALUATING", "owner gate resume — re-running verifier")
        rv = _run_step(run_id, PlanStep(tool="run_verifier",
                                        payload={"target_id": state["target_id"]},
                                        purpose="re-verify after owner verdict"))
        fresh = _run_step(run_id, PlanStep(tool="read_manifest",
                                           payload={"target_id": state["target_id"]},
                                           purpose="read the fresh manifest after owner verdict"))
        manifest = fresh.get("result", {})
        ledger.set_outcome(run_id, manifest_path=manifest.get("manifest_path"),
                           manifest_sha256=manifest.get("sha256"),
                           target_id=manifest.get("target_id"))
        clauses = manifest.get("clauses", [])
        failed = [c for c in clauses if c.get("status") != "PASS"]
        owner_status = (manifest.get("owner_gate") or {}).get("status")
        if not failed:
            # Proof gate on the resume path too: the fresh verifier +
            # manifest reads join the run's record for the check.
            rep = evidence_mod.proof_gate(
                manifest, list(state.get("tool_results", [])) + [rv, fresh],
                state["target_id"], state.get("artifact"))
            if rep["applies"] and not rep["complete"]:
                blocker2 = ("PROOF GATE (owner-gate resume): verifier clauses "
                            "all PASS but attached evidence is missing: "
                            + "; ".join(rep["missing"])
                            + ". A verifier pass without evidence is a FAIL.")
                ledger.set_outcome(run_id, blocker=blocker2)
                ledger.transition(run_id, "PARKED", blocker2)
                return {"manifest": manifest, "route": "parked",
                        "blocker": blocker2, "evidence": rep}
        if not failed and owner_status == "APPROVED":
            if board is not None:
                desc = board.get_description(state["card_id"])
                board.update_description(state["card_id"], desc +
                    f"\n\nDone evidence: {manifest.get('manifest_path')} sha256 {manifest.get('sha256')}")
                board.move(state["card_id"], "Done")
            ledger.transition(run_id, "SUCCESS", "owner APPROVED after interrupt; clauses PASS")
            return {"manifest": manifest, "route": "success",
                    "outcome": "verifier manifest: all clauses PASS, owner APPROVED"}
        blocker2 = (f"Owner gate resume: owner status {owner_status}, "
                    f"failed clauses: {[c['id'] for c in failed] or 'none'}")
        ledger.set_outcome(run_id, blocker=blocker2)
        ledger.transition(run_id, "PARKED", blocker2)
        return {"manifest": manifest, "route": "parked", "blocker": blocker2}

    def _park_on_board(state: WielderState, blocker: str) -> None:
        if board is not None:
            board.comment(state["card_id"], f"WIELDER run {state['run_id']} PARKED: {blocker}")
            board.move(state["card_id"], "Ready")

    g = StateGraph(WielderState)
    g.add_node("perceive", perceive)
    g.add_node("plan", plan)
    g.add_node("preflight", preflight)
    g.add_node("diagnosis", diagnosis)
    g.add_node("execute", execute)
    g.add_node("evaluate", evaluate)
    g.add_node("succeed", succeed)
    g.add_node("owner_gate", owner_gate)
    g.add_edge(START, "perceive")
    g.add_edge("perceive", "plan")
    g.add_conditional_edges("plan", lambda s: s.get("route"),
                            {"ok": "preflight", "failed": END, "diagnosis": "diagnosis",
                             "parked": END})
    g.add_conditional_edges("preflight", lambda s: s.get("route"),
                            {"ok": "execute", "failed": END, "parked": END})
    g.add_edge("diagnosis", END)
    g.add_edge("execute", "evaluate")
    g.add_conditional_edges("evaluate", lambda s: s.get("route"),
                            {"success_ready": "succeed", "owner_gate": "owner_gate",
                             "parked": END, "failed": END})
    g.add_edge("succeed", END)
    g.add_conditional_edges("owner_gate", lambda s: s.get("route"),
                            {"success": END, "parked": END})
    C.DATA.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(C.DATA / "graph.sqlite"), check_same_thread=False)
    return g.compile(checkpointer=SqliteSaver(conn))


def run_card(ledger: Ledger, board: Optional[Board], card: dict) -> dict:
    """One full unattended run over one card. Returns run id + final state
    (which carries __interrupt__ when the run is paused at the owner gate)."""
    run_id = ledger.open_run(int(card["id"]), card["title"], None)
    graph = build_graph(ledger, board)
    state: WielderState = {"run_id": run_id, "card_id": int(card["id"]),
                           "card_title": card["title"],
                           "card_description": card.get("description") or ""}
    final = graph.invoke(state, config={"configurable": {"thread_id": run_id}})
    return {"run_id": run_id, "final": final}


def resume_run(ledger: Ledger, board: Optional[Board], run_id: str) -> dict:
    """Resume a run paused at the owner-gate interrupt."""
    from langgraph.types import Command
    graph = build_graph(ledger, board)
    final = graph.invoke(Command(resume="owner-verdict-check"),
                         config={"configurable": {"thread_id": run_id}})
    return {"run_id": run_id, "final": final}


def resume_job(ledger: Ledger, board: Optional[Board], run_id: str) -> dict:
    """Resume a run interrupted mid-job (owner expansion card 3,
    wielder.journal): a crash during execute(), or a budget park.
    Completed steps are never repeated and none are lost — the step
    journal carries them across. The owner-gate interrupt is NOT
    this path (see resume_run); a run parked there is reported and
    left untouched, as is any state with no safe resume."""
    graph = build_graph(ledger, board)
    cfg = {"configurable": {"thread_id": run_id}}
    snap = graph.get_state(cfg)
    state_now = ledger.state_of(run_id)
    mode = journal_mod.resume_plan(state_now, tuple(snap.next or ()))
    if mode == "owner-gate":
        return {"run_id": run_id, "resumed": False, "mode": mode,
                "reason": "run is parked at the owner gate — use resume_run "
                          "(wielder resume) once the owner's verdict is recorded"}
    if mode == "refuse":
        return {"run_id": run_id, "resumed": False, "mode": mode,
                "reason": f"no safe resume for ledger state {state_now} with pending "
                          f"nodes {list(snap.next or [])} — checkpoint and journal preserved"}
    done_before = len(journal_mod.load(run_id))
    if mode == "crash":
        journal_mod.record_resume(run_id, mode, {"ledger_state": state_now,
                                                 "pending": list(snap.next or []),
                                                 "journaled_steps": done_before})
        ledger.log_tool(run_id, "job_resume", {"mode": mode}, True, 0,
                        {"journaled_steps": done_before},
                        "durable resume: crash recovery via checkpoint + step journal")
        graph.invoke(None, config=cfg)
    else:  # budget-fork: re-enter from the checkpoint where execute() was pending
        fork = next((past for past in graph.get_state_history(cfg)
                     if tuple(past.next or ()) == ("execute",)), None)
        if fork is None:
            return {"run_id": run_id, "resumed": False, "mode": mode,
                    "reason": "no checkpoint with execute() pending exists in the "
                              "thread history — cannot fork safely"}
        ledger.transition(run_id, "EVALUATING",
                          "durable resume: budget-parked run forked from its pre-execute checkpoint")
        journal_mod.record_resume(run_id, mode, {"ledger_state": state_now,
                                                 "journaled_steps": done_before})
        ledger.log_tool(run_id, "job_resume", {"mode": mode}, True, 0,
                        {"journaled_steps": done_before},
                        "durable resume: budget fork via checkpoint + step journal")
        fork_cfg = {"configurable": {"thread_id": run_id,
                                     "checkpoint_id": fork.config["configurable"]["checkpoint_id"]}}
        graph.invoke(None, config=fork_cfg)
    return {"run_id": run_id, "resumed": True, "mode": mode,
            "journaled_steps_before": done_before,
            "journaled_steps_after": len(journal_mod.load(run_id)),
            "final_state": ledger.state_of(run_id)}
