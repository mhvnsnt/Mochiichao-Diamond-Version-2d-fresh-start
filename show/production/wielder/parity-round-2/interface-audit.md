# Wielder Parity Round 2 — Interface Audit (Chainlit chat + dashboard)

**Date:** 2026-10-28. **Scope:** Wielder's two owner-facing surfaces in the
staging tree — the Chainlit chat (`chat_app.py` → `wielder/chat.py`) and the
read-only dashboard (`wielder/dashboard.py`) — judged against the
industry-standard interface set in `research/sweep-proprietary.md` §11
(synthesis) and `research/sweep-oss.md`. CLI state is cited where a feature
existed in the CLI but not in chat (the CLI belongs to a parallel worker;
gaps that are chat-only are the buildable ones here).

**Hard rule applied throughout:** no surface may present a claim the
verifier did not issue. Every status below is sourced from the ledger
(`wielder/ledger.py`), the Kanboard queue (`wielder/queue.py`), the
verifier manifest on disk, or the report packet (`wielder/report.py`) —
never from optimistic UI text. Where Wielder's data model records no such
fact, the feature is marked Missing rather than faked.

## How Wielder exposes run data today (the substrate)

| Source | What it actually carries | Citation |
|---|---|---|
| Ledger `runs` | run_id, card_id/title, target_id, state, blocker, manifest_path, manifest_sha256, retries, created/updated | `wielder/ledger.py` `Ledger.get_run` / `list_runs` |
| Ledger `transitions` | ordered state transitions with reason + timestamp | `ledger.py` `get_run()["transitions"]` |
| Ledger `tool_calls` | tool name, payload JSON, ok flag, exit_code, result JSON, raw_output (each truncated to 8000 chars at write), timestamp — **no per-call duration field**; elapsed time is only derivable from consecutive timestamps | `ledger.py` `log_tool` / `get_run()["tool_calls"]` |
| Ledger `inputs` | provenance lock: kind, path, sha256, bytes per input | `ledger.py` `inputs_of` |
| Queue (Kanboard) | columns Backlog/Ready/Doing/Verify/Owner review/Done + active tasks per column, via JSON-RPC (`Board.tasks_in`) with a read-only SQLite door (`BoardSqlite`) | `wielder/queue.py` |
| Verifier manifest | the ONLY verdict source: clauses (id/status/measured), owner_gate.status, read from the manifest file at `run["manifest_path"]`; headline phrasing lives in `wielder/judgment.py` `headline(manifest)` | `wielder/report.py`, `wielder/judgment.py` |
| Packet | `report.build_packet(ledger, run_id)` regenerates `data/runs/<run_id>/packet.md` from ledger + manifest, claim-linted before write | `wielder/report.py` |
| Graph checkpoint | LangGraph SQLite checkpointer (`data/graph.sqlite`, thread_id = run_id) holds plan/discovery/tool_results state and the owner-gate interrupt; `graph.resume_run` resumes the owner gate, `graph.resume_job` resumes crash/budget parks, `journal.resume_plan` classifies which path is legal | `wielder/graph.py`, `wielder/journal.py`, CLI twins `cmd_resume` / `cmd_resume_run` / `cmd_rewind` in `wielder/cli.py` |

## Audit table — feature × leader evidence × Wielder state (before this build)

States: **Present** = works in the chat surface · **Partial** = exists in a
weaker form or only in CLI/dashboard · **Missing** = no honest build exists
on Wielder's recorded data.

| # | Feature | Leader evidence (sweep-proprietary §11 / sweep-oss) | Wielder before | Wielder after this build |
|---|---|---|---|---|
| 1 | Queue / board visibility | Copilot Agents tab + Sessions view; Devin session sidebar; Jules repo task board (§11.5) | **Partial** — chat `queue` printed column → comma-joined card titles, no counts, no structured snapshot (`chat.py` `on_message`) | **Present** — `board`/`queue` renders counts + cards per column from a structured snapshot of `Board.tasks_in`; same snapshot function unit-tested |
| 2 | Run / trace timeline | Devin Progress tab (richest spec); Copilot live session logs; Cursor chat timeline; Jules activity feed (§11.1) | **Partial** — CLI `status` printed transitions + tools; chat showed only final state + one packet line; dashboard a flat runs table | **Present** — chat `timeline <run_id>` (alias `status`) merges ledger transitions + tool calls in timestamp order; dashboard gains `GET /runs/{id}/timeline` JSON |
| 3 | Tool-call inspection | Devin per-step detail; Copilot log-level inspection (§11.1; sweep notes no leader publishes a separate structured inspector UI) | **Partial** — packet listed tool name + ok + exit only (`report.py`); payload/result/raw_output sat unread in the ledger | **Present** — timeline carries payload, result and raw output per call (truncated, labelled), attached as a Chainlit Text element; exit codes unedited |
| 4 | Diff review + approve/reject (per-hunk) | Zed Review Changes / Cursor per-hunk keep-reject; async agents use PR-as-review (§11.3) | **Missing** — Wielder runs produce verifier manifests, not code diffs; the ledger/packet record no diff artifact, so there is nothing honest to render per-hunk. The review surface Wielder actually has is the owner gate (row 5) | **Missing (named remainder)** — not buildable from Wielder data; do not fake a diff view. CLI twin note: same gap in CLI |
| 5 | Owner-gate approve/reject surfacing | Plan-approval gates: Jules plan approval, Gemini Code Assist plan approval, Copilot Plan agent handoff (§11.2) | **Partial** — Approve/Deny actions appeared only on the message of a run that had just parked at the gate in that same chat session (`chat.py` `_run_and_report`); no way to see or act on gates parked earlier | **Present** — `gates` command lists every ledger run PARKED at the owner gate, each with the existing Approve/Deny actions (which call the finish-gate's own `record_verdict.py` / `record_rejection.py`) plus a Resume action wired to `graph.resume_run` |
| 6 | File / artifact previews | Cursor inline images, Devin IDE/browser tabs, ChatGPT Canvas files, Jules screenshots/diffs (§11.10) | **Partial** — packet path printed as inline code text; uploads were hash-locked but run artifacts were never attached | **Present** — `packet <run_id>` attaches the packet file and every recorded artifact that exists on disk (manifest, input files) as Chainlit File elements + packet text as a Text element; missing artifacts are named, never attached |
| 7 | Plan / task views | Windsurf editable `plan.md`; Copilot todo list; Jules first-class plan object (§11.2) | **Partial** — the board is the task view (row 1); the run's plan exists only inside the graph checkpoint state, not in the ledger, so no surface could show it | **Partial → improved** — timeline surfaces the plan steps from the run's checkpoint state when a checkpoint is readable, and says so plainly when none is; a persistent plan record in the ledger remains a graph/ledger change outside this lane's territory |
| 8 | Session resume | Cursor `agent --resume`, Copilot Continue-in-CLI, Zed Thread History restore (§11.8) | **Partial** — `wielder resume` / `resume-run` existed in CLI only; chat could start runs but never resume one | **Present** — `resumable` lists PARKED runs with their resume path classification (owner-gate vs durable-job, per `journal.resume_plan` semantics); `resume <run_id>` and the Resume action call the same underlying functions the CLI calls (`graph.resume_run` / `graph.resume_job`) — no reimplementation |
| 9 | Checkpoint / rewind surfacing | Cursor checkpoints in timeline; Zed per-message Restore Checkpoint; VS Code chat checkpoints (§11.4) | **Partial** — CLI `rewind` listed checkpoints; chat/dashboard showed none. (Note: even the CLI only *lists* checkpoints; arbitrary-checkpoint restore execution exists only inside `resume_job`'s budget-fork path) | **Present (surfacing)** — chat `checkpoints <run_id>` lists the same checkpoint history the CLI lists; dashboard timeline includes the ledger transition spine. Executing a rewind to an arbitrary checkpoint remains **Missing** — no such function exists in Wielder to wire to |
| 10 | Session persistence / history | Zed Thread History; Cursor transcript search (§11.8) | **Present** — chat turns persist in `data/chat.sqlite`; last owner turns replay on chat start (`chat.py` `_history`) | Present (unchanged) |
| 11 | Permission mediation / standing authorizations | Zed Tool Permissions; Gemini/VS Code per-call approvals with always-allow scoping (§11.9) | **Present** — `grants` / `grant <class>` / `revoke <id>` in chat over `wielder/authz.py`, never-grantable classes named | Present (unchanged) |
| 12 | Context controls (@-mentions, context picker) | Cursor/Windsurf/Zed/Cody @-mentions + context drawer (§11.6) | **Missing** — chat accepts file attachments (hash-locked into provenance) but has no @-mention picker or context drawer | **Missing (remainder)** — not in this build's priority order; Chainlit's composer does not expose an @-picker hook in the vendored 2.12 API |
| 13 | Live streaming steps during a run | All leaders stream the trace as the home view (§11.1) | **Partial** — `_run_and_report` blocks on `asyncio.to_thread(run_card)` and reports only at the end | **Partial (remainder)** — post-hoc timeline is now one command away, but the graph exposes no step callback to stream from; wiring one is a `graph.py` change outside this lane's territory |
| 14 | Verdict integrity (no un-issued claims) | Wielder's own constitution, stricter than any leader | **Present** — packet headline is generated from the manifest (`judgment.headline`); chat printed ledger state + packet line only | **Present, extended** — every new view follows the same rule: verdict text comes only from `judgment.headline(manifest)` read off the manifest file; a run with no manifest is shown as "no verifier verdict has been issued for this run", whatever its ledger state |

**Counts (14 features):** before — Present 3 (rows 10, 11, 14),
Partial 9 (rows 1, 2, 3, 5, 6, 7, 8, 9, 13), Missing 2 (rows 4, 12).
After this build — Present 10 (rows 1, 2, 3, 5, 6, 8, 9-surfacing, 10,
11, 14), Partial 2 (rows 7, 13), Missing 2 (rows 4, 12) — plus, inside
row 9, arbitrary-checkpoint restore execution remains Missing (no such
function exists in Wielder to wire to).

## Build notes (what was wired, in priority order)

1. **Board** — `board_snapshot(board)` + `render_board(snapshot)` in
   `wielder/chat.py`; `board` and the existing `queue` command both use it.
2. **Timeline + tool inspection** — `build_timeline(run)` merges ledger
   transitions and tool calls (elapsed seconds between consecutive
   recorded events are computed from the ledger timestamps and labelled
   as elapsed-since-previous-event, because the ledger records no
   per-call duration); `verdict_for_run(run)` reads the manifest file —
   the only verdict source. Rendered as markdown + a Text element with
   the full per-call payload/result/raw detail.
3. **Packet preview** — `packet_preview_data(run, packet_path, text)`
   collects artifacts that exist on disk; the `packet` command builds the
   packet via the existing `report.build_packet` and attaches them.
4. **Owner gates** — `pending_owner_gates(runs)` (ledger state PARKED +
   blocker naming the owner gate — the same test `_run_and_report`
   already used); `gates` view + Resume action → `graph.resume_run`,
   the real resume path. Approve/Deny keep using the gate's own
   recording scripts, unchanged.
5. **Session resume** — `resumable_runs(runs)` + `resume_mode_for(run)`
   (owner-gate → `graph.resume_run`; other parks → `graph.resume_job`,
   exactly the CLI's split between `cmd_resume` and `cmd_resume_run`).

All new handlers sit behind the same patterns as the existing chat code:
owner text is logged via `_log_turn`, card text passes through
`scrub()`, and no new write path bypasses the queue/graph.
