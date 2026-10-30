# WIELDER — WIRING

Every real file and system Wielder touches, named. If it is not listed
here, Wielder does not touch it.

## Reads (no write path exists in the tool layer)

| System / file | What Wielder does with it |
|---|---|
| `~/workspace/ep01-rebuild/finish-gate/methods/INDEX.json` | Method binding at PLANNING (Accepted check; superseded hard-fails) + provenance lock hash |
| `~/workspace/ep01-rebuild/finish-gate/methods/records/*.md` | Cited by the registry records; read by the manager, not parsed by the graph |
| `~/workspace/ep01-rebuild/finish-gate/targets/<id>.json` | The run's contract: artifact path, method ids, owner-gate state at plan time |
| `~/workspace/ep01-rebuild/finish-gate/evidence/<deliverable>.json` | Read after each verifier run — the ONLY pass source; hashed into the run record |
| `~/workspace/ep01-rebuild/finish-gate/review/<id>/` | The verifier's own owner packets live here; Wielder's packets live in its own data dir (below) and cite these |
| The game repo registries (via LanceDB index) | Retrieval hydration (top-3) from indexed text: repo docs, show/production markdown, workspace research — media by metadata only |
| Kanboard SQLite (`finish-gate/board/kanboard/data/db.sqlite`) | Door 2: read-only task reads when the API door is down |
| `wielder/mcp-servers.json` (package config) | MCP client server list (parity build): name / command / args / env per external MCP server; read at discovery and call time |
| `wielder/hooks.json` (package config) | Event-hook definitions (parity build): event name → queue-card template |
| Brain-seat env (`OPENROUTER_API_KEY`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `WIELDER_ADVISORY`, `WIELDER_*_MODEL`) | Advisory seats only: key PRESENCE is measured, key values are never printed or recorded; the graph consults a seat only when `WIELDER_ADVISORY=1` |
| `WIELDER_COMPACTION` env (parity follow-up; default flipped 2026-10-28) | Context compaction is ON by default: the graph's execute node may replace an over-threshold `tool_results` history with the deterministic digest from `wielder/context.py`; `WIELDER_COMPACTION=0` turns it off. The manifest entries routing reads and the recent tail are pinned verbatim; every firing is audit-logged in the ledger as a `context_compact` tool-call row. Thresholds read from `wielder.config` budgets when present (defaults in `context.py`) — the config itself is never written by Wielder |
| The run's own tool record (ledger rows + graph state) | Proof gate (owner expansion card 1): before an all-PASS verdict routes to success or the owner gate, `wielder/evidence.py` checks the record for the hash-bound evidence bundle (verifier test output, manifest sha256, artifact/frame hash). Missing evidence parks the run and fires the `proof_gate.failed` hook (definition in `hooks.json`). Read-only over the record; the finish-gate itself is never written |

## Executes (through the schema'd tool layer only)

| System | How |
|---|---|
| `~/workspace/ep01-rebuild/finish-gate/verify <target-id> [--skip-gate-run]` | Subprocess via the `run_verifier` tool. Wielder cannot write evidence/ — verify is the sole author of manifests. Wielder also runs it on `calib-defect-planted` as the gate-calibration pre-flight |
| Registered method scripts (`methods/INDEX.json` → `implementing[]`) | Via `run_registered_script` — only scripts named in an Accepted method's record, only with schema'd args |
| Kanboard JSON-RPC API (127.0.0.1:8899) | Queue pull (WIP=1), card moves (Doing / Owner review / Ready / Done), comments, the Done-rule description update, upgrade-card creation. Auth from env `WIELDER_BOARD_AUTH`, defaulting to the board's documented local default (finish-gate/board/ADMIN-NOTE.txt); never printed |
| The board server itself | Started with finish-gate's own `board/start_board.sh` (PHP 8.3.6 built-in server) when down |
| Configured MCP servers (stdio, parity build) | Spawned by `wielder/mcp_client.py` for discovery + tool calls; calls from the graph require the `mcp-client` standing-authorization class; discovered tools join the tool layer as `mcp__<server>__<tool>` with schemas generated from the server's own input schemas |
| Advisory brain seats (parity build) | `wielder/brain.py` `advise()`: one HTTP completion call to a configured seat (Ollama local / OpenRouter / Groq / Gemini free tiers, all free proprietary capped except Ollama). Advisory only — recorded on the run, never routed on; the deterministic seat remains the default |

## Writes (Wielder's own ground only)

| Path | What |
|---|---|
| `wielder/data/ledger.sqlite` | Run ledger: runs, transitions, tool calls (incl. `context_compact` audit rows when compaction fires, parity follow-up), inputs (provenance lock), failures (taxonomy) |
| `wielder/data/graph.sqlite` | The graph's checkpoint store (time-travel / resume) |
| `wielder/data/lancedb/` | The memory index |
| `wielder/data/runs/<run_id>/` | `packet.md`, `self_judgment.md` per run |
| `wielder/data/pins/` | Regression-pin REQUESTS (application stays with the gate lane) |
| `wielder/data/browser-jobs/` | Browser-job packets for the manager's browser lane |
| `wielder/data/delegations/` | Delegation records (parent ↔ child run) + fan-out aggregate records (`fanout-<parent>.json`, parity build) |
| `wielder/data/hooks/fired.jsonl` | Hook firing log (parity build): every firing incl. board-down recordings and malformed inbox files |
| `wielder/data/instruction-waivers.json` | Owner rulings on instruction-drift flags (owner expansion card 2): one record per (card, drift fingerprint) with the ruling text, written only by `wielder drift-waive` |
| `wielder/data/runs/<run_id>/step-journal.jsonl` | Durable-job step journal (owner expansion card 3): one fsynced record per completed plan step + resume events; read by execute() on re-entry so completed steps are rehydrated, never repeated |
| `wielder/data/repo-index.json` | The repo index (owner expansion card 4): generated by `wielder repo-index build` (or the first preflight that needs it); read by preflight's citation check on every run |
| `wielder/data/stall-watch.json` | Stall-watch progress markers (owner expansion card 5): one marker per EXECUTING run, rewritten every heartbeat cycle by `circles.check_stalls` |
| `wielder/gates/` (claims.py, instruction.py) | External report gates (grok lane PR #44, landed in the 2026-10-28 reconciliation): verify OTHER lanes' completion claims and reported steps against the real repo — `wielder verify-claim` / `wielder check-report`. Wielder's own runs are gated from inside by evidence.py / instruction.py / circles.py; see PROVENANCE.md section D for the two-layer distinction |
| `wielder/data/hooks-inbox/processed/` | Drained hook event files (parity build), moved after firing |
| `wielder/data/chat.sqlite`, `wielder/data/chat-uploads/`, `wielder/data/DIGEST.md` | Chat pillar history, attachments (hashed into provenance), memory digest |

## Never touches (structural, not promised)

- `finish-gate/gates/`, `methods/`, `targets/`, `goldens/`, `evidence/`,
  and the `verify` script: the tool layer raises GuardError on any
  write under these prefixes (constitution.py SCORER_OWNED_PREFIXES;
  test-covered). Gate changes — including the owner-verdict edits that
  `review/record_verdict.py` makes — are the gate lane's own commits.
- The game repo: Wielder lands there only as this package, through the
  repo lane's PR process (`show/production/wielder/`).
- Wielder's own constitution/config: upgrades are proposed as queue
  cards and land through the same gates as all other work (Addendum 7D).

## Trigger wiring

- Manager CLI (`wielder run-once / run-queue / heartbeat --once`) —
  live now.
- Event hooks (parity build): JSON event files dropped into
  `wielder/data/hooks-inbox/` are drained at the start of every
  heartbeat cycle (`wielder/hooks.py`, wired in
  `wielder/scheduler.py`) and become queue cards per `hooks.json`;
  `wielder hooks fire <event> '<json>'` fires one manually.
- Cron heartbeat: the standing 6h studio-orchestrator pattern; the
  package ships the heartbeat (`wielder/scheduler.py`); the cron job
  definition itself is created by the manager on the owner's word
  (a scheduled job is persistent state — it is not created silently
  from inside an assembly run).
- Chat: `chainlit run wielder/chat.py --host 127.0.0.1 --port 8897`
  starts with the stack; one local URL.
