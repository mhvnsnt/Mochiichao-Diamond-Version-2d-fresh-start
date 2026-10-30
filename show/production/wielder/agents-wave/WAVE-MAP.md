# AGENTS WAVE — MAP

*Ordered by Jamar, 2026-10-28: "reverse engineer everything about
everything in that list, 100%, wired up into my repos." Executed
against the open agent ecosystem list (Anthropic MCP + Claude Code,
OpenAI Codex + Agents SDK, Google Gemini CLI, Microsoft AutoGen,
Meta Llama Stack + Hugging Face). "100%" = as far as public/open
sources document; closed weights and product internals are GAPs,
labelled, never faked. No paid API was wired as a dependency.*

Audit base: Wielder on main @ `bfd91cc2` (478 blobs under
`show/production/wielder/`). Everything this wave adds is a **new
file** — no existing Wielder file is modified, so the parity and
seat-pool lanes working the same tree cannot collide with it.

## Status by target

| # | Target | Bucket (verified at source) | Status | Evidence |
|---|---|---|---|---|
| 1 | Anthropic MCP — protocol | Open standard; SDKs MIT | **WIRED** | `wielder/mcp_protocol.py` (owned core: lifecycle, tools/resources/prompts, stdio + loopback) + `wielder/mcp_wielder_server.py` (every registry tool first-class; live constitution/tools resources; run-card prompt); 25 tests pass (`TEST-OUTPUT.txt`) |
| 1b | MCP — Wielder's pre-existing SDK bridge | MIT SDK (pinned 1.30.0) | HAVE (untouched) | `wielder/mcp_client.py`, `wielder/mcp_server.py`, `mcp-servers.json` on main; the wave's suite includes a guard test that the bridge config still loads |
| 1c | Claude Code harness patterns | Paid proprietary product (repo: no OSS licence) | HAVE (documented-behaviour parity) | Pattern-by-pattern mapping in `TEARDOWN-MCP.md` §"Claude Code harness patterns" — permissions↔authz classes, subagents↔delegate/fanout, plan mode↔graph states, checkpointing↔graph store |
| 2 | OpenAI Codex CLI | Open source, Apache-2.0 (CLI); models/cloud paid proprietary | HAVE (parity, with 1 GAP) | `TEARDOWN-OPENAI.md`: sandbox×approval two-axis model mapped to tool-layer containment × standing-authorization classes; AGENTS.md↔instruction system; GAP = no OS-level sandbox |
| 2b | OpenAI Agents SDK | Open source, MIT | HAVE (parity) + WIRED (schema dialect) | Primitives mapped (tools/handoffs/guardrails/sessions/tracing) in `TEARDOWN-OPENAI.md`; `wielder/tool_schemas.py` exports the registry in OpenAI function-calling shape, test-pinned |
| 3 | Google Gemini CLI | Open source, Apache-2.0 (free tier moved to Antigravity CLI 2026-06-18 — repo banner) | HAVE (parity) + WIRED (schema dialect) | `TEARDOWN-GEMINI-CLI.md` delta table; `tool_schemas.py` implements Gemini's restricted Schema subset (no title/$defs/$ref), test-walked |
| 4 | Microsoft AutoGen | Code MIT; repo docs CC-BY-4.0 | HAVE (parity by convergence) | `TEARDOWN-AUTOGEN.md`: Magentic-One's two ledgers ↔ Wielder's run ledger + stall-watch; Swarm ↔ delegate/fanout; nothing imported — a conversational framework would contradict the constitution; GAP = distributed actor runtime (not needed on one VM) |
| 5 | Meta Llama Stack | Open source, MIT (Llama *weights*: free-but-restricted Community License) | PARTIAL (conventions adopted, runtime not adopted — recorded decision) | `TEARDOWN-MODEL-ECOSYSTEM.md`: API/provider split ↔ brain.py seat layer; no Llama-licence surface exists in the tree (seats run Apache-2.0 Qwen3) |
| 5b | Hugging Face ecosystem | Hub library Apache-2.0; Hub service free proprietary | **WIRED** (card half; verify half was HAVE) | `wielder/model_card.py`: HF-format card render/parse (licence mandatory) + verify-before-serve as a pure check in grok-local's exact manifest shape + hash-manifest recording; grok-local's `pull_model.py` untouched and still the download-time enforcer |

## What landed (this package)

Code — `show/production/wielder/wielder/`:
- `mcp_protocol.py` — MCP protocol core (stdlib only)
- `mcp_wielder_server.py` — Wielder over MCP, first-class shape
  (`python -m wielder.mcp_wielder_server`, stdio)
- `tool_schemas.py` — registry → MCP / OpenAI / Anthropic / Gemini
  schema dialects from one canonical rendering
- `model_card.py` — model cards + seat verification (stdlib only)
- `tests/test_mcp_wave.py` — 25 tests, all passing on this VM
  (verbatim output in `TEST-OUTPUT.txt`); the pre-existing xAI
  suite still passes alongside (17/17 in the same run)

Docs — `show/production/wielder/agents-wave/` (this folder):
`WAVE-MAP.md` (this file), `TEARDOWN-MCP.md`,
`TEARDOWN-OPENAI.md`, `TEARDOWN-GEMINI-CLI.md`,
`TEARDOWN-AUTOGEN.md`, `TEARDOWN-MODEL-ECOSYSTEM.md`,
`TEST-OUTPUT.txt`.

## GAP register (everything not claimed)

1. MCP stateless revision 2026-07-28 (`server/discover`, `_meta`
   negotiation, subscriptions) — not implemented.
2. MCP Streamable HTTP transport + OAuth — not implemented (stdio
   and loopback only, both halves).
3. MCP client primitives offered to servers (sampling/elicitation/
   roots answers) — not implemented.
4. MCP resource templates/subscriptions, Tasks extension — not
   implemented.
5. OS-level sandboxing of tool execution (Codex/Gemini Seatbelt-
   Landlock class) — Wielder contains structurally instead.
6. AutoGen Core's distributed actor runtime — absent, not needed.
7. Llama Stack runtime — not adopted (decision, TEARDOWN-MODEL-
   ECOSYSTEM.md).
8. Seat model cards for grok-local's four seats — module wired;
   rendering the cards is a grok-local-lane follow-up.
9. Closed weights/internals of every target product — documented
   behaviour only, by the wave's definition.

## Registration follow-ups (owned by sibling lanes' files)

This wave deliberately edits no shared file. When a Wielder lane
next touches them, register: `PROVENANCE.md` (the four modules as
wave additions), `WIRING.md` (the MCP server reads the constitution
module + registry in-process; serves over stdio when the manager
runs it), `THIRD-PARTY-NOTICES` (no third-party code was vendored —
the protocol core is implemented from the public specification;
noting that fact is the only entry needed).
