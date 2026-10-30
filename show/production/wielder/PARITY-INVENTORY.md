# WIELDER — PARITY INVENTORY (Phase 1 of the parity-plus build, 2026-10-28)

What Wielder actually is on main, established by reading the code and
measuring the seats — not from Wielder's own claims. Companion to
`PARITY-MATRIX.md` (the capability comparison) and `PROVENANCE.md`
(the component manifest). Seat: `show/production/wielder/` — **458
paths** on main at inventory time.

## The seat, by area

| Area | Paths | State |
|---|---|---|
| Seat docs (README, CAPABILITY-MATRIX, STACK, WIRING, ROUTING, AUDIT, CANT-LIST, COUNTER-ADDITIONS-CHECKLIST, EXTRACTION, PROVENANCE, THIRD-PARTY-NOTICES, chainlit.md) | 12 | Written records of the original assembly; CAPABILITY-MATRIX is the prior, product-level mapping — PARITY-MATRIX is the deeper capability-level one |
| `wielder/` package (code + config + tests + fixtures) | 38 | The system itself — per-file verdicts below |
| `wielder/vendor/agent-ops/` (donor system, literal carry-over) | 24 | Design record + working scripts (instruction gate, checkpoint protocol, local-CI, path guards); includes `HOW-GROKBOT-WORKS.md` — the owner's Grok-bot lane process record |
| `training/` (Wielder Train, landed via PR #25, merged 2026-10-28) | ~380 | A tool lane, not agent core: vendored sd-scripts trainer (~330 files) + the thin `wielder_train` wrapper (cli + preflight), SDXL configs for Dorowani/Wispkin, a Kaggle kernel + dataset package, and proof artifacts (a micro-smoke LoRA + logs). Full training runs execute through the Kaggle lane, outside this inventory's verification |
| `deploy/` (`wielder.service`, STASH-MANIFEST) | 2 | Unattended-runtime definition |
| Launchers (`chat_app.py`, `wielder-cli.sh`, `requirements.txt`) | 3 | requirements are pinned and recorded as running-verified 2026-10-28 |

## Per-file verdicts — the `wielder/` package (all read in full)

**REAL — substantive, exercised by the test suite:**

- `graph.py` (23.9 KB) — the LangGraph backbone: perceive → plan →
  preflight → execute → evaluate → succeed / owner-gate **interrupt**,
  plus a diagnosis route. SQLite checkpointer (rewind/resume),
  gate-calibration pre-flight (a planted-defect target must FAIL
  before any verdict is trusted), three-strikes diagnosis rule, step
  budget, input provenance lock (sha256 receipts), rules-registry and
  current-version checks at planning. **Bounded by design:** the plan
  is a fixed template (check artifact → run verifier → read manifest)
  bound to a finish-gate target named in the card — this is a
  verification-execution loop, not an open-ended planner.
  **Bug found in this pass and fixed:** the preflight desktop-failure
  path called `json.dumps` with no `import json` in the module — a
  NameError would have replaced the intended evidence-carrying park.
  Fixed + regression-pinned (`test_parity_additions.py`).
- `ledger.py` — SQLite run ledger; legal state transitions enforced
  (illegal ones raise). The state machine of record.
- `queue.py` — Kanboard JSON-RPC client (the finish queue) + a
  read-only SQLite door for board reads when the API door is down.
- `tools.py` — the execution layer: 8 schema-validated tools
  (`hash_file`, `check_artifact`, `run_verifier`, `read_manifest`,
  `run_registered_script`, `retrieve`, `write_run_file`,
  `request_browser_job`); scorer-owned paths are write-denied
  structurally. No raw shell, by constitution.
- `authz.py` — Standing Authorization Ledger: lasting grants per
  action class × scope, every use audit-logged, revocable; the honest
  exception set (payment approvals, identity checks, unshared
  credentials) is never grantable, in code.
- `memory.py` — LanceDB vector memory, top-3 retrieval hydration
  only; bge-small embedder (live, per PROVENANCE §D) with a recorded
  deterministic hash-embedder fallback.
- `critic.py` / `judgment.py` — deterministic zero-trust advisory
  critic over verifier manifests (can never pass anything; pass
  language is schema-banned) + full-standard self-judgment sections
  (failures first, likeness first).
- `linter.py` — claim linter: completion claims without a manifest
  id + sha256 are rejected; "waiting on <service>" and "only the
  owner can" claims are rejected without a named hard blocker.
- `methods.py` / `versions.py` / `rules.py` / `scrub.py` /
  `pinning.py` / `upgrades.py` / `doors.py` — small, real,
  deterministic modules: method-registry binding (Superseded
  hard-fails), current-version resolver, settled-rulings check,
  first-person scrubber, regression-pin requests, upgrade-card
  proposals, and the multi-door attempt router.
- `report.py` — evidence-only run packets, claim-linted before
  emission.
- `scheduler.py` — polling heartbeat (WIP=1; a parked card never
  blocks the cycle). **Extended in this build:** each cycle first
  drains the hooks inbox (see `hooks.py`).
- `dashboard.py` — read-only FastAPI status surface over the ledger.
- `chat.py` + `chat_app.py` — Chainlit chat pillar: a message becomes
  a queue card/run; the owner gate is presented in chat; history in
  Wielder's own SQLite.
- `cli.py` — the manager surface: 17 subcommands at inventory
  (queue/run/run-queue/resume/rewind/packet/seats/grants/delegate/
  heartbeat/digest/artifacts/desktop/board-check/…). **+4 in this
  build:** `advise`, `delegate-many`, `hooks`, `mcp`.
- `desktop.py` — desktop self-provisioning (display/bus) with
  measured evidence; the Chrome seat gap is recorded in
  PROVENANCE §D (browser process dies on this VM — browser execution
  stays on the manager's browser lane, declared, never faked).
- `constitution.py` + `wielder.config` + `rules.json` +
  `standing-authorizations.json` — the opposite-defaults constitution
  as data: budgets, retry caps, scorer-owned prefixes, prompt
  constraints, compiled standing law. **Not touched by this build**
  (upgrades land through PRs; Wielder never edits its own gates or
  constitution at runtime).

**PARTIAL at inventory — extended in this build (Phase 3):**

- `brain.py` — seats were MEASURED (`seat_status`, `smoke_test`) but
  **nothing could call one**: no inference path existed. Measured
  live in this pass: only the deterministic seat serves; Ollama is
  not installed on the VM; no OpenRouter/Groq/Gemini key is held.
  → `advise()` added: a real, env-gated, advisory-only call path
  (stdlib HTTP; honest NOT CONFIGURED until a key/server exists).
- `delegate.py` — one child run, synchronous, no parallelism.
  → `fanout.py` added: parallel child runs over named cards with a
  failure-isolating aggregate record.
- `mcp_server.py` — MCP **server** only; Wielder could expose tools
  but not consume anyone else's. → `mcp_client.py` added: config-
  driven stdio client; discovered tools register into the same
  validated tool layer as `mcp__<server>__<tool>`, gated by the
  `mcp-client` standing-authorization class.
- Scheduling — polling only; nothing reacted to events.
  → `hooks.py` added: hook definitions (`hooks.json`) + a filesystem
  inbox door drained by every heartbeat cycle; board-down firings are
  recorded, never dropped.

**Recorded gaps NOT closed by this build (named, not papered over):**

- **Langfuse telemetry mirror** — GAP in PROVENANCE §D; the SQLite
  ledger + packets remain the telemetry of record.
- **Temporal-class durable execution** — deferred by design (one
  state machine of record); seam documented in STACK.md.
- **Open-ended planning breadth** — the graph's plan is a fixed
  template; LLM seats are advisory and currently unconfigured (owner
  key actions, named in `brain.py`). This is the honest frontier the
  capability matrix also names.
- **In-Wielder browser execution** — routed to the manager's browser
  lane by design (`request_browser_job` is a routing receipt, tested
  as such).
- **Outbound messaging beyond board comments** — routes through the
  manager layer (CAPABILITY-MATRIX records this as partial).

## Verification performed in this pass

- Full code read of all 31 package code files + the seat docs.
- Test suite run locally against this build: **30 passed** (17
  pre-existing constitution tests + 13 parity-addition tests,
  including a real MCP round-trip against Wielder's own server).
- CLI smokes: `wielder seats` (measured above), `wielder mcp`
  (empty config → no servers, no errors), `wielder hooks` (empty
  config), `wielder advise` (honest NOT CONFIGURED with per-seat
  reasons).
- NOT done in this pass: a live queue run against the Kanboard board
  (the board's live state was not probed) and any Kaggle-side
  training run (another lane's in-flight work, untouched).
