# Wielder Parity Round 2 — Interface Upgrades Smoke (headless, function-output evidence)

**Date:** 2026-10-28. **Method:** No screenshots, no mockups. A headless
harness (`/tmp/interface_smoke.py`, ephemeral) that:

1. Redirects `wielder.constitution.DATA` to a temp dir *before* importing
   the chat module, so the ledger, chat log, packets and graph checkpoint
   all land in temp space — the staging tree's data and the live
   wielder-home were not touched.
2. Imports `chat_app` from the staging tree (registers the real Chainlit
   handlers from `wielder/chat.py`) — import succeeded under Chainlit 2.12.0.
3. Seeds a fixture ledger: run `W-ee916fab0be2` parked at the owner gate
   (2 tool calls logged, verifier manifest on disk with clauses PASS +
   owner_gate PENDING, one provenance input) and run `W-4da591f6771b`
   parked on step-budget exhaustion.
4. Substitutes a fake board (2 cards) and a fake outgoing `cl.Message`
   that captures content/elements/actions; installs a stub Chainlit
   context carrying only `session.thread_id` (elements read it at
   construction; a live session provides it).
5. Drives the REAL `on_message` handler with each new command and records
   exactly what it emitted.

## Results per command (captured output, trimmed only for length)

### `board`
One message: all six columns with counts — Backlog (1) `#1 Backlog card`,
Ready (1) `#7 Gate card`, Doing/Verify/Owner review/Done (0) — and the
footer `2 active card(s) across 6 columns.`

### `timeline W-ee916fab0be2`
One message + a `Text` element named `tool-inspection-W-ee916fab0be2`
(the full per-call payload/result/raw inspection). Message excerpt:

```
**Run W-ee916fab0be2** — card #7 Gate card
- Ledger state: **PARKED** (the ledger's record, not a verdict)
- Target: gate-1
- Blocker: Machine clauses all PASS; owner gate is PENDING
- Verifier verdict: CORE RESULT: machine clauses PASS — owner gate has not ruled (not done)
- Manifest: /tmp/wielder-smoke-…/manifest.json (sha256 ab12)

Plan: no plan steps in the run's checkpoint state.

**Timeline** (… `+Ns` = elapsed since the previous recorded event — the ledger records no per-call duration):
- 2026-10-28T20:38:34+0000 ⛓ ∅ → IDLE — run opened
- … IDLE → PLANNING → EXECUTING → EVALUATING → PARKED (+0s each, fixture timestamps share a second)
- 2026-10-28T20:38:34+0000 🔧 `run_verifier` ok=True exit=0 (+0s)
- 2026-10-28T20:38:34+0000 🔧 `read_manifest` ok=True exit=0 (+0s)
```

The verdict line is `judgment.headline(manifest)` read off the fixture
manifest file — the surface issued nothing of its own.

### `packet W-ee916fab0be2`
One message with elements `[Text packet-W-ee916fab0be2, File packet.md,
File manifest.json]`. Content lists both artifacts with real byte counts
and sha256 hashes computed at render time (packet 1595 bytes,
manifest 161 bytes). The recorded input pointed at the same file as the
manifest, so it was de-duplicated rather than double-attached.

### `gates`
Two messages: the pending-gates list (the one gate run, with its ledger
blocker) and a per-gate message carrying actions
`['approve', 'deny', 'resume_run']` — approve/deny are the pre-existing
callbacks that invoke the finish-gate's own `record_verdict.py` /
`record_rejection.py`; `resume_run` is the new callback into
`graph.resume_run` via the shared `_do_resume` path.

### `resumable`
One message listing both PARKED runs with their real resume paths:
`W-ee916fab0be2 … resume via graph.resume_run — owner verdict path` and
`W-4da591f6771b … resume via graph.resume_job — durable-job path
(refuses if unsafe)`.

### `checkpoints W-ee916fab0be2`
`No checkpoints recorded for W-ee916fab0be2 in the graph checkpointer.`
(correct: the fixture run never entered the graph).

### `resume W-4da591f6771b` — the real resume path, honestly refusing
Two messages: the routing notice, then

```
Run W-4da591f6771b after resume — ledger state **PARKED**
Blocker: step budget exhausted (40) — run parked at last verified state
resume_job result: resumed=False — no checkpoint with execute() pending
exists in the thread history — cannot fork safely
Packet: `/tmp/wielder-smoke-…/data/runs/W-4da591f6771b/packet.md`
```

`graph.resume_job` was genuinely invoked against the fixture run and
refused for exactly the reason it gives in production when no safe fork
exists; the chat reported the refusal and the unchanged ledger state
verbatim rather than claiming a resume.

## Bug found by the smoke (and fixed)

The first smoke run crashed in `_send_packet`:
`sqlite3.ProgrammingError: SQLite objects created in a thread can only
be used in that same thread`. A `Ledger`'s sqlite connection is
thread-bound, so a Ledger created on the event-loop thread cannot be
handed to `asyncio.to_thread`. All new handlers now create thread-local
Ledger/Board objects inside the worker (`_build_packet_fresh`,
`_resume_fresh`), and the identical pre-existing pattern in
`_run_and_report` (loop-thread Ledger passed to
`asyncio.to_thread(run_card, …)`) was fixed the same way via
`_run_card_fresh`. After the fix the smoke exits 0 with all seven
commands producing the output above.

## Unit tests

`wielder/tests/test_interface_upgrades.py` — 10 tests, all passing
(board snapshot incl. per-column board-failure reporting; timeline
merge + elapsed labelling; tool inspection content; verdict-from-manifest
incl. the SUCCESS-state-with-no-manifest case rendering NO verdict;
packet preview existing/missing split with real sha256; owner-gate
filter + resume-mode classification; checkpoint rendering; run-id
normalisation; dashboard `/runs/{id}/timeline` + `/packet` endpoints via
FastAPI TestClient against a temp ledger).
