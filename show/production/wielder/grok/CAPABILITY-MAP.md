# GROK → WIELDER CAPABILITY MAP

Every documented Grok agent capability (TEARDOWN.md) mapped to
Wielder's equivalent. **HAVE** = real code exists in this repo today.
**PARTIAL** = the seam exists; the Grok-specific piece was missing
and this kit adds it, or a bound is stated. **GAP** = not present,
with the reason named. Claims here follow the same rule as the rest
of Wielder: a capability counts only where code or a doc in this
repo backs it.

| # | Grok capability (documented) | Wielder equivalent | Status |
|---|---|---|---|
| 1 | Chat completions over an OpenAI-compatible REST API | `brain.py` seats of kind `"openai"` (`_post_json`, stdlib urllib) | **HAVE** — pattern predates this kit (OpenRouter/Groq seats) |
| 2 | Grok models as a callable seat | `brain.py`: `xai-grok` seat in `seat_status()`, `smoke_test()`, `_SEAT_CALLS` (advisory path via `advise()`) | **HAVE (code)** — registered by this kit; **NOT CONFIGURED** until the owner adds `XAI_API_KEY` |
| 3 | Client function calling (tools, tool_choice, parallel calls, one follow-up with all results) | `wielder/xai_client.py`: `function_tool()` + `run_tool_loop()` (executes all calls, returns all results in one follow-up, unknown functions reported back, round cap honest) | **HAVE** — added by this kit, test-covered without a key |
| 4 | Tool parameter schemas from Pydantic models | Wielder pins Pydantic AI + `schemas.py`; `function_tool()` accepts any JSON Schema dict incl. `model_json_schema()` output, and enforces the documented object-root rule locally | **HAVE** |
| 5 | Server-side Web Search / X Search with citations | `xai_client.web_search_tool()` / `x_search_tool()` build the documented specs (domain filters, handle/date scoping); passed through to the API. Wielder itself has no native live-search seat — this is the provider's tool, billed per call | **PARTIAL** — spec support wired; usable only with a configured key, and only on the API surface that accepts server-side tools (Responses) |
| 6 | Server-side code execution (sandboxed) | `xai_client.code_execution_tool()` spec. Wielder's own rule stands: **no raw shell** in its tool layer — provider-side sandbox execution is a different, provider-contained surface | **PARTIAL** — spec wired; not a Wielder tool, by constitution |
| 7 | Collections search (RAG over uploaded docs) | Spec via `collections_search_tool()`; Wielder's own equivalent is **LanceDB memory with top-3 hydration** (`memory.py`) over the show/game corpus | **HAVE (equivalent)** — Wielder's local RAG predates the kit; the xAI-hosted variant is spec-only |
| 8 | Remote MCP tools (provider connects to your MCP servers) | Wielder is MCP-native both ways: `mcp_server.py` exposes its tools, `mcp_client.py` calls external servers | **HAVE** — the protocol matches; either side can be the MCP host |
| 9 | Reasoning effort control (low/medium/high/xhigh) | `xai_client.build_chat_body(reasoning_effort=...)` validates the level and enforces the documented penalty/stop incompatibility locally | **HAVE** — added by this kit |
| 10 | Encrypted reasoning content carried across turns | No Wielder equivalent — Wielder's runs carry *evidence* (ledger + manifests), not hidden traces, by design | **GAP (by design)** — conflicts with the evidence-only constitution; not adopted |
| 11 | Structured outputs (json_schema response_format) | `build_chat_body(response_format=...)` pass-through; Wielder validates all inter-agent payloads with Pydantic schemas regardless of seat | **HAVE** |
| 12 | Streaming (SSE; tool calls arrive whole per chunk) | `xai_client.chat_stream()` + `iter_stream_deltas()` (wire format unit-tested) | **HAVE** — added by this kit |
| 13 | Multi-agent collaboration (Heavy / 4.20-multi-agent: agents debate + verify) | Wielder's shape is different and deliberate: LangGraph graph + `delegate.py` child runs + `fanout.py` parallel fan-out, with a **separate verifier** issuing the only PASS. Grok's is in-model; Wielder's is in-system with scorer separation | **PARTIAL** — pattern parity (parallel agents + verification), mechanism intentionally not copied: no Wielder seat may grade its own work |
| 14 | Plan-then-approve execution (Grok Build plan mode) | The owner gate: LangGraph interrupt node; runs park durably and resume only on the owner's recorded verdict (`wielder.config`) | **HAVE** — predates the kit |
| 15 | Long-running goal mode with built-in verification (`/goal`) | The finish-queue loop: WIP=1 pull, method registry, finish-gate verifier manifest as the only "done" | **HAVE (equivalent, stricter)** — Wielder's verification is external and deterministic, not the agent's own |
| 16 | Skills / plugins / hooks / AGENTS.md (Grok Build) | Wielder: `hooks.py` + `hooks.json`, MCP servers config, method registry as the skill-equivalent law; the repo's own AGENTS.md conventions | **HAVE (equivalent)** |
| 17 | Persona: direct, search-first, first-principles | `constitution.GROK_PATTERN_PERSONA` + `grok/PROFILE.md` spec; inherits `NODE_PROMPT_CONSTRAINTS` (anti-sycophancy) on any seat that uses it | **HAVE** — added by this kit |
| 18 | Consumer memory (grok.com personalisation) | Wielder memory is the LanceDB corpus index + SQLite ledger — inspectable, owner-owned; no provider-side memory is used | **HAVE (equivalent)** — provider memory is undocumented (TEARDOWN §9), so nothing to wire |
| 19 | DeepSearch (browse-then-answer agent behaviour) | Behaviour = seat + `web_search`/`x_search` specs + persona rule "search first, cite sources"; Wielder's browser door (Browser Use pillar) covers page-level work on the manager's lane | **PARTIAL** — composed from parts above; no single "deepsearch" switch exists in the API to copy |
| 20 | Grok Bot (always-on teammate product) | No public API exists to wire | **GAP** — nothing to connect; Wielder's own queue loop is the in-repo equivalent of an always-on teammate |
| 21 | Imagine / Voice APIs | Not agent behaviour; media lanes exist elsewhere in this repo (avatar-stack) | **Out of scope** — recorded in TEARDOWN §2 for completeness |
| 22 | Moderation / AUP enforcement | Provider-side on xAI calls (documented); Wielder-side, the constitution + instruction gate + claim linter govern its own outputs | **HAVE (both sides, different layers)** |

## What this kit changed in Wielder

- `wielder/brain.py` — `xai-grok` seat registered (bucket: **paid
  proprietary**), smoke test + advisory call entry.
- `wielder/xai_client.py` — **new.** The seat's full client: chat,
  tool loop, server-side tool specs, reasoning controls, streaming.
- `wielder/constitution.py` — `GROK_PATTERN_PERSONA` constant added
  (persona convention: named constants alongside `CRITIC_PERSONA`).
- `wielder/tests/test_xai_client.py` — **new.** Mocked-transport
  tests; pass with no key held.
- `grok/TEARDOWN.md`, `grok/CAPABILITY-MAP.md`, `grok/PROFILE.md` —
  this documentation set.
- `PROVENANCE.md` — hashes updated for the two edited files, rows
  added for the new files, seat status recorded in §D.

## The one owner step

Everything above is complete and testable **without** a key. The
seat goes live only when the owner (1) creates an xAI API key at
console.x.ai, (2) stores it via the Secure Vault flow so it lands as
the `XAI_API_KEY` environment variable — never through chat — and
(3) gives the spend go-ahead, because the API is paid per token and
per server-side tool call. Until then `wielder seats` reports the
seat honestly: installed = False, blocker named.
