# WIELDER — PROVENANCE MANIFEST

The anti-bullshit device: every piece of Wielder is listed here with
what it is, where it came from, its licence verified at the licence
file (bucket per the honesty law), the sha256 of what was vendored or
the installed version, and whether it is **wired** or **gap-fill**. A
piece that is not in this manifest is not claimed as part of Wielder.
Licence failures were swapped for verified equivalents, and every swap
is recorded — never silently carried.

Assembled 2026-10-28 on this VM (Python 3.12.3, 2 CPU, 7 GB RAM).
Regenerate the file tables with `wielder/tools_build_provenance.py`.

## A. Installed pillars (official packages, wired as-is)

| Piece | Source | Licence (verified at the licence file, 2026-10-28) | Bucket | Installed | Running-verified |
|---|---|---|---|---|---|
| LangGraph | `langchain-ai/langgraph` via PyPI | MIT | open source | langgraph 1.2.18 | Graph executed end-to-end in Wielder's own loop; checkpoint history read back (time-travel surface) |
| LangGraph SQLite checkpointer | `langchain-ai/langgraph` libs via PyPI | MIT | open source | langgraph-checkpoint-sqlite 3.1.2 | Checkpoints written + `get_state_history` exercised |
| LangChain core | `langchain-ai/langchain` via PyPI | MIT | open source | langchain-core 1.7.0 (dependency) | Imported by the graph stack |
| Pydantic | `pydantic/pydantic` via PyPI | MIT | open source | pydantic 2.14.1 | Every Wielder schema validates through it (test suite) |
| Pydantic AI | `pydantic/pydantic-ai` via PyPI | MIT | open source | pydantic-ai 2.63.0 | Installed + imported; validation layer for LLM seats (seats advisory only) |
| MCP python-sdk | `modelcontextprotocol/python-sdk` via PyPI | MIT | open source | mcp 1.30.0 (Chainlit 2.12's pin; the server module tries the 2.x MCPServer API first, falls back to 1.x FastMCP) | `wielder/mcp_server.py` imports and constructs the server on the installed 1.30.0 |
| LanceDB | `lancedb/lancedb` via PyPI | Apache-2.0 | open source | lancedb 0.40.0 | Table created, 29 chunks indexed, top-3 search returned hits |
| sqlite-vec | `asg017/sqlite-vec` via PyPI (arrived as a LanceDB dependency) | Apache-2.0 (dual MIT) | open source | sqlite-vec 0.1.9 | Installed; the documented fallback store |
| FastAPI | `fastapi/fastapi` via PyPI | MIT | open source | fastapi 0.162.0 | Dashboard TestClient: GET / and /runs both 200, title WIELDER |
| Kanboard | finish-gate/board (official v1.2.56 source) | MIT (LICENSE read in the installed source) | open source | 1.2.56, SQLite at 127.0.0.1:8899 | LIVE: PHP 8.3 installed, board serving; Wielder read the queue and ran card #3 through the JSON-RPC API in the live run; the read-only SQLite door also exercised |
| Chainlit | `chainlit/chainlit` via PyPI | Apache-2.0 | open source | chainlit 2.12.0 | Chat pillar SERVING (HTTP 200 at 127.0.0.1:8897) via chat_app.py; messages become cards/runs on the same gated graph |
| finish-gate verifier | Owner's system, `~/workspace/ep01-rebuild/finish-gate/` | Owner's code | owner | its own git repo, head c19669d at the live run | Executed by Wielder runs; manifests are its sole-authored files (live run manifest sha256 d86dc95b…) |
| Method registry | finish-gate `methods/INDEX.json` (+ repo METHOD-REGISTRY of record) | Owner's system | owner | 4 Accepted, 2 Superseded | Resolver exercised in tests + runs; superseded hard-fail tested |

## B. Vendored — the owner's earlier agent system (donor), literal carry-over

Source: `mhvnsnt/agent-ops`, pulled in full during Phase 1
(tarball 6,487,806 B; audit in AUDIT.md). Owner's own code — carried
literally per the construction-kit rule for his own work.

| File | sha256 | Size |
|---|---|---|
| `vendor/agent-ops/AGENTS.md` | 7c44db1d45416fec5521492be06ed7be20fe23687f0e316c3feeb1445e8874b9 | 5219 B |
| `vendor/agent-ops/CHECKPOINT_PROTOCOL.md` | af88c3f796724e96e2785b17d6c4ea7ecb89bc21664684d9c8fe6ac048804882 | 3330 B |
| `vendor/agent-ops/HOW-GROKBOT-WORKS.md` | 48317e7d3a7ba974683b67aa8d7015c405c15663523e71b64c56d981edefc0d2 | 3443 B |
| `vendor/agent-ops/checkpoint.sh` | 95cb2c4d18ca733ee64cf0f22166b3b25550536bcb1df4442b734f2f699129ce | 5180 B |
| `vendor/agent-ops/github-scripts/instruction_gate.py` | ea5338297bba994a57e5cc980e83c3440c78f0bdb2350528e595104fd057f708 | 5337 B |
| `vendor/agent-ops/github-scripts/test_instruction_gate.py` | 92625b0c21e36c718d582f8267d9668e74c58a47cdc87cad28c85f9210ab62f2 | 3140 B |
| `vendor/agent-ops/guard-paths.sh` | cda8b19df96bd998211030cc72aa55bfb4cde81a9e6c7ad98e7ad3dcae9d1869 | 5683 B |
| `vendor/agent-ops/lane-autostart/lane-autostart.sh` | 305e883c222e2e7012ea8e6ebcb51f370c7615e362295652663d1e01ddb9574c | 8197 B |
| `vendor/agent-ops/lane-autostart/lanes.manifest` | 76d1616764624834b604b6d313a0ce5c2c690bd8456e638882e4cac22bfa8e56 | 1616 B |
| `vendor/agent-ops/lane-ckpt.sh` | 7d81ed682b505c75de571e08837a906e33949f9f70f54905350bdcdaf5e4aca8 | 3940 B |
| `vendor/agent-ops/lane-worktree.sh` | 8c4a01a9ca71ca3ba8fd4fa36c48b318765cb2b34739661e6773da80509a2e25 | 7784 B |
| `vendor/agent-ops/lanes/resilient-gh-upload.sh` | 655fed382e188f4ad3a4b4b729f4fcc81d9172309bccda62b5d468af7be2f961 | 11539 B |
| `vendor/agent-ops/local-ci/README.md` | a03f836407cc25df8a6b75ee9a7dc976e65fa999412df403f434596f1b5ccdc6 | 5153 B |
| `vendor/agent-ops/local-ci/local_ci.py` | 39cfccff58cf89759dec83404642fbfa34edebf6d562b7b99ae32f72899248ea | 15369 B |
| `vendor/agent-ops/protected-paths.json` | ec586dbbcfb0f19eb1ee064670d3d5685620de996f8acc2a7f351ac2746a3ec6 | 1489 B |
| `vendor/agent-ops/supervisor.sh` | b0cb75850731cfda5cd80dd6e071219fed23f5c006e7261b549995fed6b0c3bf | 6252 B |

Running-verified: the instruction gate's own test suite passes in its
vendored home (12 tests, run 2026-10-28). Note, honestly:
`lane-autostart.sh` was labelled "DESIGN PROPOSAL — NOT WIRED" by its
own author (AUDIT.md §2); it is vendored as a design record. Its
function in Wielder is performed by the cron heartbeat + queue pull,
not by this script.

## C. Gap-fill — the only new code (thin wiring, per the build mandate)

All under `wielder/`. Each file: graph definition, schema definitions,
or tool adapters onto the real systems above — nothing else was
written.

| File | sha256 | Role |
|---|---|---|
| `__init__.py` | 0cda80c33bb4c575f35f49849a9509f046f8a8a2be7456b6d4e8b8d8c340f252 | product definition |
| `authz.py` | 5f28ff3d4ea0b6a3460088579251f78d99a8147bba953b6cde74d57564178077 | Standing Authorization Ledger (Addendum 12) |
| `brain.py` | db9b335e30989b51fa8ab29505f40768fc8b82e247bbfbf81a94cd344842b96f | brain seats — measured availability + advisory call path (parity build; + xai-grok seat, Grok kit 2026-10-28; + grok-local seat, Grok-at-home kit 2026-10-28; + seat pools, parity round 2) |
| `chat.py` | 033cb4c6a43f6b7e96e927a41bc08a11e9ac3981f7f408ef0ac228ba146632cd | chat pillar logic — Chainlit front-end on the gated graph |
| `circles.py` | 157936d5870a20b03e570348b27cdbd389e66014c00f2758fa7027d46090cda9 | circle detector — repeated-action loop detection + heartbeat stall watch; looping/stalled runs park themselves with evidence (owner expansion card 5); + ping-pong and error-loop signals ported from PR #44 (reconciliation) |
| `cli.py` | 08dc004acbb845958e5b808e3ea342e2455e507998db75fadc1fce7f63370513 | manager surface; + verify-claim / check-report verbs for the external report gates (reconciliation) |
| `constitution.py` | db4804ffe16977e759cd75383cb1f841df71e4f630e87fc29d2ba78b2a3e8d37 | opposite-defaults as code + config loader (+ GROK_PATTERN_PERSONA, Grok kit 2026-10-28) |
| `context.py` | d167e948ee01179e5046d7230b3a73e59a7c1e36c427604f0cb5090ac4bc7246 | context compaction — deterministic digest of an over-threshold run history; routing inputs + ruling/authz references pinned verbatim (parity follow-up) |
| `gates/__init__.py` | 7fe00d5d8d62221993887361fb1db611b14734609e250fbde56e18b97ac23076 | external report gates package (grok lane PR #44, landed via the 2026-10-28 reconciliation) — the two-layer distinction lives in its docstring |
| `gates/claims.py` | 4832fd02bac13f09e7f8636e6390e0d6d30a93adbbe63b1ec30d198b3eee466d | proof gate for OTHER lanes' completion claims: commits on ref, blob sha256, PRs merged with merge commit on ref, evidence files present; a claim citing nothing checkable fails (grok lane PR #44) |
| `gates/instruction.py` | a4aff5c8679b126ce1290c358e66830579d7b41f90f0b546ee99983e2d3558ba | report instruction checker: method used vs specified word-for-word, banned ops (force-push/rebase/amend/reset --hard/rm/--no-verify), path scope (grok lane PR #44) |
| `critic.py` | 62034b2ce4770d0a3dfe0242ffbf454d810830c46c3302f150fc4960bc6459ea | zero-trust advisory critic |
| `dashboard.py` | 38993a121d66c7022ad71540ea70dd968560998f763a80cd1118a88c12c231fe | read-only status surface |
| `delegate.py` | 426c3b71921d1f7157be452c41619c03b79fdd5d66ea65bd42f2334717296a11 | child-run delegation |
| `desktop.py` | a304c245a938ebc4390affd1fe763ebcd678287c4e84c37275b0c068b29f9ca1 | desktop layer — display/bus/seat/self-provisioning (Addendum 13) |
| `doors.py` | 32d8f65148f1ceb529037f1cf10e0ce3dd8d89041961c007571f77cd971fcbb4 | multi-door capability router |
| `evidence.py` | c788434f645a932b51ff73270bbfff1662f10e858cb0ac0b58bbca73853655af | proof gate — evidence-bundle check over a run's tool record; an all-PASS verdict without hash-bound evidence may not be reported as a completion (owner expansion card 1) |
| `fanout.py` | bf4c2ca3641805859d7a8d5a2fe61e65a0c5b0930ed94c1274c24b1b8138c685 | parallel fan-out delegation (parity build) |
| `fixtures/rejection-cases.json` | 70a5c07f7a2db59e18f43534c7a363b95fbdce314dc972a718364500c3a2197b | negative-sampling fixtures (owner's real rejections) |
| `graph.py` | dc19bfd81acacbef3f9e6bbe47e3fdeae4b231780084fec7a10541eb5211b811 | the ReAct state graph |
| `hooks.json` | a1cabc7fd43936bf253156e18907c3787483bcd861345adb47fed42b2931a0e9 | hook definitions (parity build; named production events added as they are named — owner expansion) |
| `hooks.py` | 1254d051b6b226958b7aa0bc75645d1bb8ca710dcc1771548c5a1b87ceff2f8b | event hooks + filesystem inbox door (parity build) |
| `instruction.py` | ac37e4cf4473c3abc3dd658d9554afe07ff614cbd2f996df542a422fcc6ee683 | instruction checker — plan steps + executed results compared against the intake instruction's scope; drift blocks landing until resolved or owner-ruled (owner expansion card 2) |
| `judgment.py` | 6731ad7dbb691b55e5736591d270b82659fcc29e79642db969c612a2c5e8aacf | full-standard self-judgment |
| `journal.py` | f865abc549d3c4867aa2c3e82c1b182d960f38900659d5213d8db70e8f6cf216 | durable jobs — per-run step journal + journaled step executor + resume decision (Temporal-pattern event history) (owner expansion card 3) |
| `ledger.py` | 36f91e2d6687aa8ec4dd23c523a546525e767ef7ee527f8e26b55f664cb398c3 | SQLite run ledger |
| `linter.py` | 3f82a841cf3882d32425e44ea9a02400ac6d3fbcce44f2e7fab49e2202be5afd | claim linter |
| `mcp_client.py` | 7f8bb1c9e49b7ab873fb96a3427d89fa62d35c8b9d87a264b87aa902ae4e0d8c | MCP client — external server discovery + calls (parity build) |
| `mcp-servers.json` | fac0bc5fda20a36ff8f7287293e6c50961c40ad0bb58f6864fc6cffab5431553 | MCP client server configuration (parity build; empty by default) |
| `mcp_server.py` | 96b93db51f22ddba033edb47ed9bd539ba98c412a1645c76507cdc05e7043ffe | MCP tool surface |
| `memory.py` | 9742f14d02fda51aae094a69b2d925ba33ddbee1777fcb7e6cfb25c108b14420 | LanceDB memory + embedder selection (bge live, hash fallback recorded) |
| `methods.py` | e5a9f5ccec1a6b97d6f228d496dadd69431ec9c276aab289317308125637d39c | registry resolver |
| `pinning.py` | 4ee5df215a97fcf0ecc8e791fc009f6de8619133a5ad7d5792cbf82d75de6e29 | regression-pin requests |
| `queue.py` | 455d7c94f5cddc93a713f8a2de0cd3de3052f85e0b342fa300511959b86d7c1c | Kanboard client (pattern from the board's own seed script) + SQLite read door |
| `report.py` | e4ee4f5f3eec12beb53b65ba0909c6352d513e9bd36482ebef086afe8dc996cf | evidence-only packet generator (+ proof-gate evidence bundle section, owner expansion card 1) |
| `repo_index.py` | ae771348cd89cb02f5d902b3a325083e312d28ce0b5d9d255d024f7aeb09b6db | repo index — generated index of real paths/registries/schemas/public APIs; citation checks for preflight (owner expansion card 4) |
| `rules.json` | 90f7e6950dc35aa822ab9f3a8dcff52a4767dede0933df2cab0937b9c4757fe7 | compiled standing-law registry |
| `rules.py` | 7d23fa76896bed5ea8f5564ca8b69ff0f9538c5127de22919014813d22d4be31 | rules-registry check |
| `scheduler.py` | 823b0e6b096d8929bec394e8bae184995f644cb443f2366b8f737ae2062c7a01 | heartbeat — unattended runtime (Addendum 12B) + hooks inbox drain (parity build) + stall watch (owner expansion card 5) |
| `schemas.py` | 3e99d2bfe3628de8e949b29a9fc7e133341287fb0e85c421450cbffda91570b7 | Pydantic message/tool schemas |
| `scrub.py` | cc341cb09c88073a11da0750993bcd681e88ada6536eb533f5020cc7da1cd851 | first-person scrubber / prompt hygiene |
| `standing-authorizations.json` | a282d1594a17d926b27e2b10fb56986e1d88bf04b1e7711117d72c71a06ef51e | mirror of the Standing Authorization Ledger |
| `tests/test_wielder.py` | 839d659545f4d6968a15e0b9ae310ccd1173bfa7b8424bf7661f52c7d1847547 | the constitution, executable (17 tests) |
| `tests/test_circle_detector.py` | 3be6a4c50167a1e168fde167859f6e219339870a4a391522916d074427b37363 | circle-detector tests (7 tests): exact + near-identical loop detection, stall watch parks only the dead run (owner expansion card 5) |
| `tests/test_context_compaction.py` | e9883f93b59f89600bf384134396b40521483825520e18d14ff936d6f609a9f8 | context-compaction tests (7 tests): threshold no-fire, gate-target survival, ruling/authz preservation, bounded digest, wiring pins (parity follow-up) |
| `tests/test_durable_jobs.py` | e4e9866190bc215545a2c84db758b33b7bf022f034a2bbd239d4916f9d14c06f | durable-jobs tests (7 tests): crash kill-and-resume, usage-limit windows, torn journal line, resume decisions (owner expansion card 3) |
| `tests/test_instruction_checker.py` | 48bd5087d6e46221d851cd3f9e5d70203d49ac4a98b15824fa8ea06b49039519 | instruction-checker tests (7 tests): in-scope clean, pre-verifier catch, claim drift, waiver scoping (owner expansion card 2) |
| `tests/test_parity_additions.py` | a9140058964c4887ca3497c2ecc63e4b639ead580ec9af165e4ba305328b3c19 | parity-build tests (13 tests; the shipped-configs guard was updated in owner expansion card 1 — hooks now carry named events, MCP list still empty) |
| `tests/test_repo_index.py` | e310d221c576aa379920650c353be357db6dc118bfdfca6d0dae3c3362096503 | repo-index tests (7 tests): fixture index coverage, fake path/API rejection, jurisdiction (owner expansion card 4) |
| `tests/test_proof_gate.py` | 36f48b79aa1467a48ca56ae72ee02e25806488cf7e556461baa75f866dca9208 | proof-gate tests (7 tests): no-evidence rejection, full bundle, visual frame hash, clause-fail silence, packet bundle (owner expansion card 1) |
| `tests/test_xai_client.py` | f4bed1dd823f2c11b84994a33560e2e20ccc54adce6e8a67e981aa44bc25e898 | xai-grok seat tests (17 tests): seat registration + honest paid bucket, persona pin, request building, schema guard, mocked-transport chat + tool loop + streaming (Grok kit 2026-10-28) |
| `local_client.py` | da0b06c3bea41eeebaf1587c3dbb8a2c1091021193ae1d4f4849265b91aa1303 | self-hosted open-weights provider client for the grok-local seat — same shape as xai_client.py; env-configured endpoint (`GROK_LOCAL_BASE_URL`), optional key, chat + tool loop + streaming (Grok-at-home kit 2026-10-28) |
| `tests/test_local_client.py` | ac7404baf27edc19060585fd93dfcbe9c762c079cb00018bec082b1374117fcb | grok-local seat tests (16 tests): seat registration + open-weights bucket, not-configured honesty, request building, mocked-transport chat + tool loop + streaming (Grok-at-home kit 2026-10-28) |
| `tools.py` | f2a22d77c4b2125d3c7bfb8996f891801f562bbff4863af690757a4e8e0da467 | schema-only execution layer |
| `upgrades.py` | 0af25633ce7bf2b14a6566d7682b1e37af55c45c090f959e0495d19bb1316da6 | upgrade-loop cards (Addendum 7D) |
| `versions.py` | c918c4327391bb9279654fcf6f1f7c2561c5bd93c0a4eff8139d44e76b3927c6 | current-version resolver |
| `xai_client.py` | 503753aa5298f52e4c6a4d77fc2da76fa259aa8b7b16b811e7295f313181fff2 | xAI (Grok) provider client — chat + tool loop + server-side tool specs + reasoning controls + streaming for the xai-grok seat (Grok kit 2026-10-28) |
| `wielder.config` | 7786f209b243e17395a0e4b1bdaca3fdddf718a80c79891a89a498cb6cf9f876 | Wielder defaults (the constitution as config) |

| `browser_seat.py` | 6a1c241f2663f0eeeafba325651baf39f748f864d80e30cfde7c732f3ae03866 | local browser seat — Playwright Chromium (Apache-2.0), evidence receipts; fills the Chrome SIGTRAP seat gap (parity round 2) |
| `code_search.py` | f402e5e2c50d159551b828d1feb91123272a0c807b0b6523a13781b850536c78 | deterministic AST symbol definitions/references with file+line (parity round 2; pattern: Continue indexing shape, Apache-2.0) |
| `edit_txn.py` | 59b6c5bb83198d792e0d9328da790a5eb7a896810427e00ab3992774bc8ab591 | multi-file edit transactions — preview/apply/checkpoint/rollback, sha256 preimages (parity round 2; patterns: Aider diff edits + Cline checkpoints, both Apache-2.0) |
| `seatpool.py` | a1e22e99953095bcb9585fa79fa44191671c213f03fc630b04d3fedd1267b976 | seat layer — personal key pools + company pool (real employees), cap failover to local, POOL-OK/POOL-RISK flags (parity round 2) |
| `skill_import.py` | 862baf613a9de624f252f5de2f65d461c9cccada569ed4fe5395398113425751 | SKILL.md import adapter — guidance-only registry records through scrub + rules + instruction gate (parity round 2) |
| `skills.json` | 9e20f1f2768d438ea10dfd4f11c2733c7a2283e45d5945011824cd8b3d52ac5a | imported-skills registry (parity round 2; ships empty, hooks.json pattern) |
| `telemetry.py` | 14d977be8b712c1e1b1c4007532b4e3836442ea82d5f7f1024229d3842f15c90 | Langfuse telemetry exporter — ledger to ingestion batch + local mirror; wire format only, nothing from Langfuse ee/ (parity round 2) |
| `tests/test_brain_seat.py` | bd0b465e6f337b37532caa44de38291a1c951479f3b7940f6bf57676ec3b2376 | brain-seat tests (8): ollama seat status honesty + advise() shapes, HTTP mocked |
| `tests/test_browser_seat.py` | a814bf22af45dc5246cf7378d5783488a37fe1e5bafbd53e5439577e82659330 | browser-seat tests (17): job validation, failure receipts, doors hook, real-launch smoke when the seat is installed |
| `tests/test_code_search.py` | e3a81032f7c7d9069e00d812bc2f9fdc4d4e39c80e0bbb9d01af4d51629c72f8 | code-search tests: exact file/line definitions + references on a fixture tree |
| `tests/test_compaction_hydration.py` | 5f40653f71271b204eff9c12502112e9e7780849f14cc4134c370a2ad853c467 | compaction/hydration pins (6): graph compaction fires, routing inputs byte-identical, top-3 hydration cap enforced |
| `tests/test_desktop_anchor.py` | 21ab0bcb48daacbcb94bc6f982a99bea1dd9f1af231dcea77db26736bf8fb6ae | desktop bus-anchor tests (8): planted stale build-tree address rejected + re-anchored; current address trusted; dead socket distrusted |
| `tests/test_edit_txn.py` | 84e7615b63cf527ff2d8a95510dc90e1117d12b79a85fc8950b8aa9f7c8791ba | edit-transaction tests: preview writes nothing, apply exactness, byte-exact rollback incl. create/delete, mid-apply failure rollback, authz gate |
| `tests/test_interface_upgrades.py` | 6d0195ceece794371f37b7c593601fb8ec8381ae58d00eec2e88bad22d60fe28 | interface-upgrade tests (10): board/timeline/packet builders, no-manifest-no-verdict invariant, dashboard endpoints |
| `tests/test_seat_integration.py` | a0c1243127c8934346d70c8913b62076cf33d8c7024a59dc8b3f2d9fbe64e01c | brain<->seatpool integration tests (5): pool data in seat status, pool routing, POOL-RISK primary-only, local degradation, key redaction |
| `tests/test_seatpool.py` | 4aa2088ab2c48c9ac7fbfbcba0fdaa7c664e39463f336eb0ee812ff6575f6331 | seatpool tests (14): 429 rotation + cooldown, exhaustion fallback signal, POOL-RISK default, company enrol/revoke + audit, redaction |
| `tests/test_skill_import.py` | 7bc07c5c2e3df106f98dcc7c0d97419895933f52564f936bd1b76bfdb049be7b | skill-import tests (10): real + frontmatter forms, dedup, scrub, poisoned-skill rejection, CLI round-trip |
| `tests/test_telemetry_export.py` | 49829d95de9a21a914c0ff07ec29eb87fb770df7cb3a1405ab3504839042e4f5 | telemetry-export tests (7): trace/span shapes, deterministic ids, mirror round-trip, NOT CONFIGURED honesty, stubbed POST equality |

## D. Gaps, swaps, and honest statuses (never claimed wired until serving)

| Piece | Status |
|---|---|
| **Langfuse** (self-hosted core, MIT; ee/ dirs under its enterprise licence — never enabled) | **GAP, recorded.** Wielder's telemetry of record is the SQLite ledger + per-run packets (both live and exercised). Langfuse is the optional mirror; it counts as wired only when its stack serves on this VM. |
| **sentence-transformers + bge-small-en-v1.5** (Apache-2.0, verified from the installed package's LICENSE file) | **LIVE.** sentence-transformers 6.2.0 installed; the bge embedder is Wielder's active embedder (measured: `embedder_name` reports BAAI/bge-small-en-v1.5 via sentence-transformers; top-3 retrieval over the corpus index returns relevant chunks). The deterministic hash embedder remains the recorded fallback if the seat is ever absent. |
| **Desktop layer** (Addendum 13: Xvfb 2:21.1.12 distro package; dbus-daemon; Google Chrome 156.0.8078.73, free proprietary, Google's official .deb) | Display + bus + GUI-app smokes PASS (display brought up from down by self-provision; Inkscape rendered under Wielder's env; xclock window measured YAVG 229.6/255; x11vnc seat listening on 127.0.0.1:5999; xdotool installed). **Chrome seat gap, with evidence:** the browser process dies with SIGTRAP at startup on this VM across two flag sets (logs in wielder/data/smoke/); browser execution stays on the manager's browser lane. |
| **Standing Authorization Ledger** (Addendum 12) | LIVE in Wielder's own SQLite (`wielder/authz.py`): the owner's five standing classes granted 2026-10-28 under his standing order (#1–#5, listed by `wielder grants`), every use audit-logged, revocable in chat/CLI. The honest exception set (payment approvals, identity checks, unshared credentials) is never grantable — enforced in code, tested. |
| **Temporal** (MIT) | Deferred by design (STACK.md §6): one state machine of record. Seam documented; not installed, not claimed. |
| **Ollama** (MIT runner) | Not installed on this VM (measured: no binary). Brain-seat status is measured by `wielder seats`, never assumed. |
| **OpenRouter free tier** | Free proprietary, capped (20 req/min; 50 req/day no-purchase; 1,000/day after one-time $10). No API key held — seat unavailable, blocker named in `brain.py`. |
| **xAI Grok seat (`xai-grok`) + Grok kit** (`xai_client.py`, `grok/TEARDOWN.md`, `grok/CAPABILITY-MAP.md`, `grok/PROFILE.md`) | **WIRED (code + tests), NOT CONFIGURED.** Paid proprietary API (per-token pricing, docs.x.ai/developers/pricing — licence bucket recorded in `brain.py`, never labelled free). Seat registered in `seat_status()` / `smoke_test()` / `_SEAT_CALLS`; full client (chat completions, function-calling loop, server-side tool specs, reasoning_effort, streaming) is real stdlib code covered by `tests/test_xai_client.py` against a mocked transport — the suite passes with no key held. No `XAI_API_KEY` is held on this VM: the one owner step is creating a key at console.x.ai, storing it via the Secure Vault flow, and giving the spend go-ahead. The teardown is documentation-only (public sources, gaps labelled); no xAI weights, prompts or proprietary material are in this repo. |
| **Browser Use + Playwright** (MIT / Apache-2.0) | Licences verified; the browser door is declared in the multi-door router. Live-browser execution routes through Doro's browser lane in this deployment (a generic build agent cannot operate the owner's signed-in browser) — declared in CAPABILITY-MATRIX.md, never faked. |
| **Phoenix** | **Excluded:** its licence file reads Elastic License 2.0 — not open source. Recorded here so the exclusion is permanent and visible. |
| **Reconciliation with PR #44 (2026-10-28, grok lane) — external report gates** (`gates/claims.py`, `gates/instruction.py`; `wielder verify-claim` + `wielder check-report` CLI; `tests/test_gates_external.py`) | **WIRED (external layer), with the not-landed decisions recorded.** Under the owner's convergence ruling, PR #44 (the grok lane's gates package) was reconciled with this lane's owner-expansion series (#47–#54) instead of stacked beside it. LANDED: claims.py + instruction.py as the external report gate pair — they check OTHER lanes' completion reports against the real repo (a cited commit must be on the ref, a cited file's sha256 must match the blob on the ref, a cited PR must be MERGED with its merge commit on the ref, evidence files must exist non-empty; a claim citing nothing checkable fails; reported steps are checked for method-used vs method-specified drift, banned operations, and out-of-scope paths). THE DISTINCTION, written down: card 1's `evidence.py` gates Wielder's OWN finish packets from inside the loop before Wielder may report done; `gates/claims.py` verifies external lanes' reports from the outside, after the fact. Both stand. Card 2's `instruction.py` checks Wielder's own plan steps; `gates/instruction.py` checks reported steps. NOT LANDED, with reasons: `gates/journal.py` (Wielder's durability story is ONE story and it is named here: LangGraph SqliteSaver checkpoints for graph state + `journal.py`'s per-step journal for execute() steps — a second journal is the duplication the ruling bans; the grok journal is the same pattern in miniature); `gates/repoindex.py` (one index: `repo_index.py`, wired into preflight; the grok index is a lookup map and does not gate citations); `gates/circle.py` as a module (its ping-pong + error-loop signals were ported into `circles.py` in the follow-on reconciliation PR — one detector, more signals). The 12 committed `__pycache__/*.pyc` files in PR #44 did not land. PR #44's 13 attack tests re-ran green in this lane's environment (13 passed); the 9 claims/instruction tests landed as `tests/test_gates_external.py`. The handoff is answered in-repo at `HANDOFF-CLAUDE-TO-GROK-2026-10-28.md`. Compaction default: context.py's opt-in was flipped to on-by-default in the final reconciliation PR (the grok lane's catch, credited). |
| **Parity follow-up (2026-10-28)** — `context.py` context compaction (+ graph execute-node hook, `context_digest` state field, `wielder context` CLI) | **WIRED, opt-in, with honest limits.** Deterministic extractive digest of an over-threshold `tool_results` history; the router's manifest entries and the recent tail are pinned verbatim, and every owner ruling / standing-authorization reference cited in the history is carried in canonical form via a closed-vocabulary scan over `rules.json` + the Standing Authorization Ledger's classes — preservation is by construction and test-covered (`tests/test_context_compaction.py`, 7 tests; full suite 37 passed at build). Limits, stated plainly: **Default flipped 2026-10-28 (reconciliation, PR 3/3): compaction is ON by default and `WIELDER_COMPACTION=0` is the off switch** — the grok lane's PR #44 review caught the opt-in fairly; the env-gate test was rewritten to the new default (default-on fires, `=0` leaves a fat history untouched). Original build text follows: it shipped **off unless `WIELDER_COMPACTION=1`** (same opt-in pattern as the advisory seat); the digest is an extract (tool/ok/exit/hash/excerpt lines), **not** a generative summary — no seat is consulted; the preservation guarantee covers references in Wielder's own ruling/authz vocabulary, which is how Wielder's records cite them — a reference coined outside that vocabulary is outside the guarantee. The matrix behind this build is `PARITY-MATRIX.md` (extended this pass: Cursor, Devin, OpenAI Codex, Temporal, Manus). |
| **Owner expansion card 5 (2026-10-28) — circle detector** (`circles.py`; execute() guarded runner; scheduler stall watch; `run.loop_detected` + `run.stalled` hooks named; `wielder loops` CLI) | **WIRED.** Two detectors, both deterministic. In-run: every executed action is fingerprinted (tool + canonical payload); the same action — or a near-identical one, payloads differing only in volatile keys — repeated at or past the threshold (default 3, config budgets) raises LoopDetected inside execute(), which parks the run with the loop evidence attached and fires the escalation hook. The scan is seeded with the run's journaled steps, so a loop spanning a durable resume is still one loop. Heartbeat: the stall watch parks any run left in EXECUTING whose ledger progress marker (tool calls + transitions) is unchanged across N checks (default 2) — the crash-orphan sweep; card 3's resume path can pick such a run up from its park. Covered by `tests/test_circle_detector.py` (7 tests; full suite 72 passed at build). Reconciliation addendum (2026-10-28): the detector also carries the ping-pong (two actions alternating over a 6-step window) and error-loop (same failure signature at threshold across distinct actions) signals ported from the grok lane's PR #44 circle detector — its module was not landed; one detector, more signals. Honest bounds: repetition is judged on tool+payload identity, not on semantic progress — a legitimately polling step repeated with identical payloads past the threshold will park (that is the intended trade: it parks loudly with evidence and an escalation card, it never silently continues); thresholds are config-readable but the config is never written by Wielder. |
| **Owner expansion card 4 (2026-10-28) — repo index** (`repo_index.py`; preflight citation check; `wielder repo-index` CLI) | **WIRED.** A generated, refreshable index of the repo: every file path (repo-wide walk), JSON registries with their top-level keys, schemas (JSON schema files + Pydantic models), and public APIs (AST-extracted public functions/classes/methods) under the focus tree. The graph's preflight node checks the card text's citations and every plan payload's paths against the index; a citation absent from the index fails preflight before any expensive step — the real-code wiring law as a mechanism, pairing with the compaction card's bounded context (a run consults the index instead of stuffing the repo into context). Covered by `tests/test_repo_index.py` (7 tests; full suite 65 passed at build) and a live smoke run (index built over the seat tree; a real citation passed, a fake path was the only rejection). Honest bounds: registry/schema/API extraction is bounded to the focus prefixes (default `show/production`) while path coverage is repo-wide; API citations match exactly or as a dot-boundary suffix; absolute paths outside the indexed root are outside the index's jurisdiction (skipped, not blessed — receipts + the instruction checker govern those); preflight fails closed if the index cannot be built or read. |
| **Owner expansion card 3 (2026-10-28) — durable jobs** (`journal.py`; execute() runs plan steps under the journal; `graph.resume_job` + `wielder resume-run` CLI) | **WIRED.** Temporal's pattern in Wielder's form: completed plan steps are appended to a per-run step journal (fsynced JSONL) the moment they finish; on re-entry they are rehydrated from the journal — never repeated, never re-logged. A crash during execute() resumes by re-entering the checkpoint's pending execute node (`invoke(None)`, measured on this LangGraph version); a budget (usage-limit) park resumes by forking the thread from its pre-execute checkpoint, with a fresh step-budget window for the work that remains. Resume events are appended to the journal itself — the journal is the resume log the packet can cite. Covered by `tests/test_durable_jobs.py` (7 tests: crash kill-and-resume with per-step call counts, three-window usage-limit completion, torn-line survival, fingerprint change, resume decisions; full suite 58 passed at build). Honest bounds: the step that dies mid-execution is re-attempted (only completed steps are guaranteed not repeated — the Temporal semantics); the gate-calibration pre-flight re-runs on a crash resume (read-only, idempotent, named in `journal.py`); crashes inside short nodes other than execute() are refused by name, not improvised — the checkpoint and journal are preserved and the card can be re-driven. |
| **Owner expansion card 2 (2026-10-28) — instruction checker** (`instruction.py`; plan-node + evaluate checks; `instruction.drift` hook named; `wielder drift-waive` CLI) | **WIRED.** The instruction is recorded at intake (card text + the finish-gate target it names) and its scope derived from the target record: target file, method registry, the submitted artifact, the verifier manifest, plus Wielder's own runtime area. Every plan step is scope-checked in the plan node before anything runs, and every executed tool result is re-checked in evaluate before any completion route; a step aimed at a different target is claim drift. Drift parks the run, fires the escalation hook, and blocks landing until resolved or the owner rules — a ruling is recorded per card + drift fingerprint via `wielder drift-waive` and cited in the record. Covered by `tests/test_instruction_checker.py` (7 tests; full suite 51 passed at build). Honest bounds: the scope is path/target-based (payload citations), not a semantic reading of prose claims — the claim linter remains the text-claims layer; URLs are never flagged; a drift park ends the run (the waiver lets a re-run of the same card proceed), it does not mid-run pause. |
| **Owner expansion card 1 (2026-10-28) — proof gate** (`evidence.py`; graph evaluate + owner-gate-resume checks; plan template gains two `hash_file` evidence steps; packet gains the evidence-bundle section; `proof_gate.failed` hook named) | **WIRED.** A run whose verifier clauses all PASS may not route to success or the owner gate unless its own tool record carries the evidence bundle, hash-bound: verifier test output, the manifest hash, and a hash of the submitted artifact (the frame evidence when the artifact is visual). Missing evidence parks the run with the gaps named — a verifier pass without attached evidence is a FAIL. Covered by `tests/test_proof_gate.py` (7 tests; full suite 44 passed at build). Honest scope: the finish-gate verifier itself is untouched (scorer-owned); this is the consumer-side hardening inside Wielder — it decides whether Wielder may *report* completion, and it issues no PASS of its own. One pre-existing test was updated, in the open: `test_shipped_configs_are_empty_by_default` became `test_shipped_configs_carry_no_unconfigured_integrations`, because hooks.json now carries the named production events this expansion adds (the MCP server list still ships empty). |
| **Self-hosted Grok seat (`grok-local`) + Grok-at-home kit** (`local_client.py`, `grok-local/` — serving, training, PWA, free-test notebook, runbook) | **WIRED (code + tests), NOT DEPLOYED** — per the owner's ruling (2026-10-28): build everything first, rent when he says. Open weights only (Qwen3 family, Apache-2.0 — models, sizes, hashes and licences in `grok-local/MODEL-MANIFEST.md`); no xAI data trained on or distilled. Seat registered in `seat_status()` / `smoke_test()` / `_SEAT_CALLS`; client mirrors `xai_client.py` and is covered by `tests/test_local_client.py` (16 tests; suite 33 passed with the xAI tests). The package ships deploy-ready: vLLM serving kit with hash-verified on-seat weight pulls, a LoRA training kit on openly licensed data, a two-mode phone PWA (phone-chip seat + server seat, rendezvous seat discovery), and a ready-to-run Kaggle free-test notebook whose logic is dry-run-verified against a mock seat. GPU/phone steps are marked PROVEN-ON-FIRST-RUN in `grok-local/DEPLOY-RUNBOOK.md` with their exact success checks; nothing is rented and no endpoint exists yet — the seat reports not-configured until `GROK_LOCAL_BASE_URL` points at a live seat. |
| **Parity build (2026-10-28)** — `brain.advise()`, `mcp_client.py`, `fanout.py`, `hooks.py` (+ `hooks.json`, `mcp-servers.json`, CLI subcommands, scheduler drain, graph advisory hook) | **WIRED, with honest limits.** All four components are real code, covered by `tests/test_parity_additions.py` (13 tests; full suite 30 passed at build). Limits, stated plainly: the advisory call path is wired but **no seat is configured on this VM** (no Ollama binary, no API keys held — the same owner key actions named in `brain.py`); the MCP client ships with an **empty server list** (add servers to `mcp-servers.json` to connect them; round-trip verified against Wielder's own MCP server in tests); hooks ship with an **empty hook list** (definitions are added as real events are named). The full comparison behind this build is `PARITY-MATRIX.md`; the code-level inventory is `PARITY-INVENTORY.md`. |

## E. Parity round 2 (2026-10-28) — status amendments + new components

This section supersedes the §D rows it names. Evidence annex (sweeps,
shortlist, proofs, audit) ships with the round-2 landing package as
`parity-round-2/` files: `sweep-oss.md`, `sweep-proprietary.md`,
`seat-shortlist.md`, `interface-audit.md`, `ollama-seat-proof.md`,
`browser-seat-proof.md`, `langfuse-server-report.md`,
`telemetry-live-proof.md`.

**§D amendments:**

| §D row | Round-2 status |
|---|---|
| **Langfuse** — "GAP, recorded" | **WIRED + SERVING.** Exporter (`telemetry.py`, §C) + the real self-hosted server (upstream v4.71.0, core only, no ee) run on this VM: health OK, project `wielder-telemetry`, and a coordinator-run live proof exported a real ledger run end to end (ingestion 207, 3/3 events 201, trace read back with its ERROR-level span). Server is a runtime install (podman compose under the parity runtime dir, `LANGFUSE_MIGRATION_V4_WRITE_MODE=dual` required for legacy ingestion payloads); it does not auto-survive a VM replacement — recovery is an exact-commands recipe in `langfuse-server-report.md` §6 (~25 min). Keys live only in the local keys file, excluded from every package. |
| **Ollama** — "Not installed on this VM" | **LIVE.** Ollama 0.40.12 (MIT, tarball sha256 matched to the official release sums) installed workspace-resident; default advisory model `qwen2.5-coder:7b` (**Apache-2.0**, verified three ways incl. the licence blob inside the staged model; the family's 3B is the lone Qwen Research License carve-out and is NOT used; 1.5B Apache-2.0 is the fallback). Real `advise()` proof on file (unmocked; ~214 s for a 54-token answer on this 2-vCPU box — the seat is live and slow, both facts recorded). `OLLAMA_MIN_TIMEOUT` floor in brain.py exists because of that measurement. OpenRouter/Groq/Gemini key seats remain owner-account actions (Addendum 2 shortlist); the seat layer below is wired and waits only on keys. |
| **Browser Use + Playwright** — "execution routes through Doro's browser lane" | **LOCAL SEAT WIRED.** `browser_seat.py` drives a Playwright Chromium Headless Shell (156.0.8078.4) locally with evidence receipts; smoke-proven on local pages (title/click/type/screenshot verified from the artifact). It is registered as the local door in `doors.py`. WAN egress from this Chromium still fails on this VM (the authenticated egress proxy breaks its CONNECT tunnel; curl/Python pass — failure receipt on file), so wide-web work keeps the manager's browser lane as its routing substitute. The Chrome SIGTRAP gap is closed by substitution, not by reviving Chrome. |
| **Desktop layer** — Chrome seat gap note | Bus-anchor wart FIXED in `desktop.py`: the stale anchor was the *contents* of the persisted `bus-address` file (overlaid from the build tree at restore; the old socket still exists, so the old existence-only check trusted it). `bus_address()` now requires the socket path to anchor in the current runtime dir and be alive; stale addresses are discarded with evidence and `env_for()` scrubs the same anchor arriving via environment. 8 tests plant the exact restore fixture. |

**New external components / seats (licences verified at source, 2026-10-28):**

| Component | Source | Licence / bucket | Wielder use |
|---|---|---|---|
| Ollama 0.40.12 | ollama/ollama | open source, MIT (runner only) | local advisory seat runtime (workspace install) |
| qwen2.5-coder:7b | Qwen (via Ollama library) | open source, Apache-2.0 | default advisory model; num_ctx capped 8192 on this VM |
| Playwright 1.64.1 + Chromium Headless Shell | microsoft/playwright | open source, Apache-2.0; Chromium BSD-style (its own LICENSE in the build; NOT Google Chrome) | local browser seat runtime |
| Langfuse server v4.71.0 | langfuse/langfuse | open source core, MIT; **ee/ trees under the Langfuse Enterprise License — never vendored, never enabled** | self-hosted telemetry mirror (runtime) |
| OpenRouter / Groq / Gemini / Mistral / Cloudflare free tiers | providers' own pages | free proprietary, capped (caps in `seat-shortlist.md`) | advisory seats via `seatpool.py`; **all five POOL-RISK** (no swept terms allow one person multiple accounts) — pools wired, primary key only by default, flag visible in `wielder seats`. Dropped on evidence: Cerebras (no permanent free tier), GitHub Models (retired 2026-07-30), HF Inference (free credits ended) |
| Patterns (no code vendored) | Aider repo-map/edit formats; Cline checkpoints; Continue indexing/roles; OpenHands condenser/microagents; SWE-agent ACI/history processors; Gemini CLI `/compress`; Codex sandbox×approval axes | Apache-2.0 / MIT as swept | native Wielder implementations: `edit_txn.py`, `code_search.py`, compaction design (pre-existing), SKILL.md adapter target format |

**Round-2 test evidence:** full suite **182 passed** on the staging
tree (baseline 84 at repo main 918b95fd; +98: seatpool 14, browser
seat 17, edit_txn + code_search 13, skill_import 10, interface 10,
telemetry 7, compaction-hydration 6, desktop anchor 8, brain seat 8,
seat integration 5). Scorer separation held: no file under
`wielder/gates/`, `constitution.py`, or the finish-gate verifier was
touched; `standing-authorizations.json` is unchanged from main (the
suite's authz mirror rewrites it at test time — it is a runtime
mirror, excluded from the round-2 diff by restoration to the main
blob, verified by sha).

**Rebase + landing note (2026-10-28):** round 2 was packaged against
main @ 918b95fd; before it landed, the Grok kit reached main
(50059c6e, aee965e7), changing `wielder/brain.py`, this file, and
`wielder/constitution.py` (GROK_PATTERN_PERSONA). The package was
therefore rebased onto main @ 3bad734d: `brain.py` is a three-way
merge — both Grok seat registrations (xai-grok + grok-local,
including their smoke-test and `_SEAT_CALLS` wiring) and the round-2
seatpool routing are preserved (merged file 22,740 B = the round-2
file plus the Grok side's 4,601 unique bytes, nothing dropped);
this file's §C carries the merged `brain.py` hash, the Grok rows,
and the current `constitution.py` hash (db4804ff…). Two §C rows that
were already stale at the 918b95fd base and on main
(`tests/test_circle_detector.py`, `tests/test_context_compaction.py`
— the recorded hashes predated the files' current bytes; the files
are byte-identical on both refs) were corrected to the files' true
sha256; the files themselves are unchanged. Combined suite on the
rebased tree: **215 passed** (182 round-2 + 33 Grok), 0 failed.
