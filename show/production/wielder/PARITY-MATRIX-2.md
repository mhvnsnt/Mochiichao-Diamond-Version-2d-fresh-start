# WIELDER — PARITY MATRIX 2 (parity expansion round 2, 2026-10-28)

Owner order: sweep the remaining leading agent and IDE services —
Gemini, ChatGPT/Codex, Cursor, OpenHands, and the wider field — wire
everything buildable into Wielder at 100%, close round 1's named
gaps, and **fill** gaps rather than name them (a gap stays named only
if it needs the owner's own key/act (a), a gate or the constitution
blocks it (b), or it is physically impossible here with no routing
substitute (c)). Paid tiers are never the default closure: local/open
first, native rebuild of the documented capability second, a paid
tier only as an owner-choice fallback line.

This matrix **extends** `PARITY-MATRIX.md` (round 1: Grok / Claude /
Replit / Emergent / Muse, plus its Cursor / Devin / Codex / Temporal
/ Manus extension) — it does not restate it. Per-source evidence lives
in the annex shipped with this round's landing package
(`parity-round-2/sweep-oss.md`, `parity-round-2/sweep-proprietary.md`):
every open-source licence below was read at the project's LICENSE
file on 2026-10-28; every proprietary cell is from public
documentation only, and where a vendor publishes no spec the annex
says NO SPEC PUBLISHED rather than guessing.

**Marks:** ● documented/strong · ◐ partial or bounded · — none / no
spec published. **Wielder states:** HAVE (pre-existing, code-verified)
· WIRED-NEW (built this round) · FILLED (a named gap, closed) ·
SUBSTITUTED-FILLED (proprietary capability rebuilt natively / free
substitute wired) · PARTIAL (real but bounded, bound stated) ·
GAP (a)/(b)/(c) (named remainder, case per the owner's rule).

## The matrix — new sources

| Capability | Gemini (CLI/App/Code Assist) | ChatGPT + Codex | Cursor | OpenHands | Windsurf | Aider | Cline | Continue † | SWE-agent | Cody | Copilot | Jules | Zed | Goose | **Wielder** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Agent loop / planning | ● | ● | ● | ● | ● | ● | ● plan/act | ● | ● | — chat only | ● | ● plan gate | ● | ● | **PARTIAL** (see notes) |
| Context compaction | ● `/compress` snapshot | ◐ | ● summariser | ● LLM condenser | ◐ | ◐ repo-map bound | ◐ | ◐ | ● history processors | — | ◐ | ◐ | ● inspectable | ◐ | **HAVE** |
| Rules / instruction files | ● GEMINI.md | ● AGENTS.md | ● .cursor/rules + AGENTS.md | ● microagents | ● rules + memories | ● CONVENTIONS.md | ● .clinerules | ● rules blocks | ◐ YAML config | ◐ prompts | ● copilot-instructions | ● AGENTS.md | ● reads all rivals' files | ● .goosehints | **HAVE** |
| Skills portability (SKILL.md) | ◐ | ● .agents/skills | ◐ workflows | ● microagents | ● workflows | — | ● skills | ◐ blocks | ◐ tool bundles | — | ◐ | — | ◐ | ● recipes | **WIRED-NEW** |
| Tool use + MCP | ● MCP | ● MCP | ● | ● | ● | — | ● + marketplace | ● | ◐ bundles | ◐ | ● | — | ● ACP/MCP | ● all-MCP | **HAVE** |
| Subagents / coordinator | ◐ | ● | ● project coordinator | ● | — | ◐ architect/editor | ◐ | — | — | — | ● cloud agent | — | ◐ external agents | ● subagents | **HAVE** |
| Codebase indexing / retrieval | ◐ | ◐ | ● index engine | ◐ | ◐ | ● repo map (tree-sitter+PageRank) | ◐ | ● embeddings @codebase | — | ● multi-repo picker | ● | ◐ repo picker | ◐ | ◐ | **WIRED-NEW** |
| Multi-file edit + diff apply | ● | ● | ● | ● | ● | ● edit formats | ● | ● apply role | ● | — | ● | ● diff→PR | ● | ● | **WIRED-NEW** |
| Checkpoints / rollback | ● git-backed /restore | ◐ | ◐ snapshots | ◐ event log replay | ● named checkpoints | ● git /undo | ● per-step | — | — | — | ● files+chat | ◐ setup snapshots | ● per-message restore | — | **WIRED-NEW** (bound in notes) |
| Sandbox / runtime isolation | ◐ | ● sandbox×approval axes | ● cloud VMs | ● per-conversation Docker | ◐ terminal modes | — git only | ◐ auto-approve matrix | — | ● SWE-ReX backends | — | ● ephemeral Actions env | ● cloud VM | ◐ | — none by design | **SUBSTITUTED** (notes) |
| Browser / computer use | ◐ | ● virtual computer | ● | ● | ◐ | — | ◐ | — | — | — | ◐ | — | — | — | **SUBSTITUTED-FILLED** |
| Telemetry / observability | ◐ | ◐ | ◐ | ◐ | — | — | ◐ | — | ● cost budgets | — | ● session logs | ● activity feed | ◐ token display | ◐ | **FILLED** |
| Local model seat | ● CLI seats | ● CLI seats | — | ● | — | ● any-model | ● | ● roles | ● | — | ◐ | — | ● | ● | **FILLED** |
| Free API seats + key handling | ● AI Studio key | ◐ paid seats | — | — | — | n/a | n/a | n/a | n/a | — | — | — | n/a | n/a | **WIRED-NEW** (notes) |
| Interface: run trace / tool inspection | ◐ | ◐ narration | ● | ● event stream | ● | ◐ | ● | ◐ | ◐ | ◐ files-read disclosure | ● live session logs | ● activity feed | ● | ◐ | **WIRED-NEW** |
| Interface: plan view + approval gate | ● approvable plan | ● editable plan (research) | ● | ◐ | ● plan.md | ◐ | ● plan/act gate | ◐ | — | — | ● per-tool approval | ● plan-approval gate | ◐ | ◐ | **HAVE + WIRED-NEW surface** |
| Interface: diff review approve/reject | ◐ | ◐ PR review | ● | ◐ | ◐ | ◐ | ● | ◐ | ◐ PR | — | ● draft PR | ● publish→PR | ● per-hunk keep/reject | ◐ | **PARTIAL** (notes) |
| Interface: queue / background visibility | ◐ | ● tasks | ● cloud agents | ● conversations | ◐ | — | ◐ | — | — | — | ● agents tab | ● task list | ● threads sidebar | ◐ | **WIRED-NEW** |
| Interface: session resume / history | ● | ● branch-in-new-chat | ● | ● | ● | ◐ | ● | ◐ | ◐ | ◐ | ● | ● | ● | ● | **WIRED-NEW surface** |
| Interface: artifact / file preview | ● canvas | ● canvas | ● | ● | ◐ | — | ◐ | ◐ | — | ◐ | ◐ | ◐ audio changelog | ● | ◐ | **WIRED-NEW** |

† Continue is end-of-life (README: no longer maintained, read-only) —
patterns only, never a dependency.

## What round 2 wired (deltas, with evidence)

| Addition | File(s) | Closes / fills |
|---|---|---|
| SKILL.md import adapter: registry in the hooks/mcp-servers pattern, guidance-only records, import gated by scrub + rules check + instruction gate (poisoned skills rejected) | `wielder/skill_import.py`, `wielder/skills.json`, `wielder/cli.py`, tests (10) | Round-1 gap: SKILL.md portability |
| Langfuse exporter: ledger → ingestion batch (trace per run, span per tool call, deterministic ids), unconditional local mirror, honest NOT CONFIGURED | `wielder/telemetry.py`, `wielder/cli.py`, tests (7) | Round-1 gap: telemetry mirror (export half) |
| Langfuse server: real upstream v4.71.0 self-hosted (podman, core only), dual-write mode for legacy ingestion; live exporter→server round-trip proven by the coordinator (207, 3/3 events 201, trace read back) | runtime install; recipe + evidence in annex (`langfuse-server-report.md`, `telemetry-live-proof.md`) | Round-1 gap: telemetry mirror (server half) — **FILLED** |
| Local brain seat: Ollama 0.40.12 (MIT) + qwen2.5-coder:7b (Apache-2.0) as Wielder's default advisory model, num_ctx capped, timeout floor measured; real advise() proof | `wielder/brain.py`, tests (8); runtime recipe in annex | Round-1 gap: advisory seat unconfigured — **FILLED** (local) |
| Seat layer: personal pools (owner's own accounts) with cap failover → local fallback; POOL-OK/POOL-RISK from providers' own terms (all five kept providers are POOL-RISK: primary-only default, flag in `wielder seats`); company pool for real distinct employees (enrol/revoke, per-member audit, ships empty); brain integration with one HTTP code path | `wielder/seatpool.py`, `wielder/brain.py`, tests (14 + 5 integration) | Addenda 2/3/5 seat policy; shortlist in annex (`seat-shortlist.md`) |
| Local browser seat: Playwright Chromium headless shell, evidence receipts, registered as the local door | `wielder/browser_seat.py`, `wielder/doors.py`, `wielder/desktop.py`, tests (17) | Desktop-layer Chrome SIGTRAP gap — **SUBSTITUTED-FILLED** (WAN bound in notes) |
| Desktop bus-anchor fix: persisted-address validation against the current runtime dir + env scrub + discard evidence | `wielder/desktop.py`, tests (8) | Restore-flagged anchor wart |
| Multi-file edit transactions: preview (writes nothing) / apply (sha256 preimage checkpoints) / rollback (byte-exact), registered as tools behind existing authz classes | `wielder/edit_txn.py`, `wielder/tools.py`, tests (in 13) | IDE-class gap: no edit/rollback primitives existed |
| Symbol code search: deterministic AST definitions/references with file+line | `wielder/code_search.py`, `wielder/tools.py`, tests (in 13) | IDE-class gap: repo_index was citation-checking only |
| Interface upgrades: board view, run timeline + tool inspection (verdict only from the verifier's manifest), packet preview with real hashes, owner-gate surfacing with real resume, session-resume surfacing, dashboard timeline/packet endpoints; thread-bound-ledger bug fixed in the chat run path | `wielder/chat.py`, `chat_app.py`, `wielder/dashboard.py`, tests (10) | Interface audit: 14 features, Present 3 → 10 |
| Compaction hydration pins (audit verdict: compaction itself was already wired in the follow-up build; no production change) | `wielder/tests/test_compaction_hydration.py` (6) | Round-1 gap 1 — verified HAVE |

**Suite: 182 passed** on the staging tree (baseline 84). Scorer
separation held — nothing under `wielder/gates/`, `constitution.py`,
or the verifier was touched by this round.

## Notes on bounded rows

- **Agent loop / planning — PARTIAL (unchanged bound, honestly
  kept):** Wielder's plan is still a fixed template bound to a
  finish-gate target, executed by the deterministic seat. What
  changed: the advisory seat is now LIVE locally (Ollama), so
  `brain.advise()` returns real model text (recorded, never routed
  on). Open-ended generative planning breadth remains the structural
  frontier, as round 1 stated — not closable by wiring, and not
  purchasable under the owner's priority rule (a frontier-model seat
  is an owner-choice fallback: a paid API seat would add generative
  breadth at per-token cost; the rebuilt/local answer above is the
  shipped one).
- **Checkpoints — WIRED-NEW with a named bound:** edit-transaction
  checkpoints + rollback are new and byte-exact; graph checkpoint
  listing (`rewind`) pre-existed. *Arbitrary-checkpoint restore
  execution* for graph runs stays GAP **(b)**: restore semantics for
  a gated production run belong to the run/gate owners under scorer
  separation; this round shipped the listing + the two real resume
  paths instead.
- **Sandbox — SUBSTITUTED:** OpenHands-style per-run containers were
  not adopted. Wielder's substitution is constitutional: schema-only
  tools, no raw shell, Standing Authorization Ledger gating, and the
  verifier outside the worker. Goose ships with no sandbox by design;
  Wielder's answer is stronger than that and is a design property,
  not a missing part.
- **Browser — SUBSTITUTED-FILLED with an environment bound:** the
  local seat is wired and smoke-proven for local/LAN targets. WAN
  from this Chromium fails on this VM (authenticated egress proxy
  breaks its CONNECT tunnel — failure receipt in the annex); WAN
  work routes through the manager's browser lane, which exists and
  works, so the capability has a routing substitute.
- **Free API seats — WIRED-NEW, keys are the (a) case:** the seat
  layer, pools, failover and status are wired and tested. Making a
  seat *live* needs the owner's own account act per provider (create
  key → Secure Vault) — the shortlist gives Doro the exact routes;
  Mistral additionally requires the owner's phone verification.
  No provider swept is POOL-OK; all personal pools default to
  primary-key-only with the flag visible.
- **Diff review — PARTIAL:** transaction-level review is real
  (preview diff → owner-gated apply → rollback). Per-hunk keep/reject
  in chat (Zed's shape) stays GAP: run packets carry manifests, not
  diffs, and Chainlit 2.12 exposes no per-hunk review surface; the
  @-mention context picker is likewise GAP on Chainlit 2.12 (no
  composer hook) — the CLI/code-search route covers the capability.
- **Interface streaming — PARTIAL:** timelines are complete after the
  fact; live step streaming needs a step callback in `graph.py`,
  which no lane in this round owned. Named for the graph lane.

## Remaining gaps after round 2 (complete list)

| Gap | Case | Closes when |
|---|---|---|
| Free-tier API keys themselves (OpenRouter/Groq/Gemini/Mistral/Cloudflare) | (a) owner account act | Owner creates keys on his own accounts; Doro deposits via Secure Vault from the shortlist; Mistral needs his phone verification |
| Arbitrary-checkpoint restore execution for graph runs | (b) gate/run-semantics owners | The gate lane designs restore semantics under scorer separation; listing + resume paths already ship |
| Per-hunk diff review UI; @-mention picker (chat surface) | (c) platform: Chainlit 2.12 has no such hooks | A chat-framework change or a custom component budget; capability covered at tool/CLI level meanwhile |
| Live step streaming in chat | (b)-adjacent: graph.py callback | Graph lane adds a step callback; timeline builders already consume the same records |
| WAN browsing from the local Chromium seat | (c) environment: egress proxy breaks Chromium CONNECT | Proxy/infra change on the VM; manager browser lane is the working substitute |
| Langfuse stack auto-survival across VM replacements | (c) environment | Recovery recipe (~25 min, annex §6) until a supervised service unit owns it — a service-refresh decision for the landing step |
| MCP server list / hook definitions ship empty | by design (owner configuration) | Owner names servers/hooks; each is a config edit, no code |

*Licence honesty, restated:* every "open source" label in this round
was read at the source LICENSE file (annex). Langfuse's `ee/` trees,
Cline's JetBrains plugin, and Qwen2.5-Coder-3B (Qwen Research
License) are the three restricted items found; none is used.
Continue is end-of-life and was mined for patterns only.
