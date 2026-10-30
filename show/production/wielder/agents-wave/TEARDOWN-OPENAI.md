# TEARDOWN — OpenAI: Codex CLI + Agents SDK

*Agents wave, 2026-10-28. Sources: github.com/openai/codex,
github.com/openai/openai-agents-python, the Agents SDK documentation
(openai.github.io/openai-agents-python, read 2026-10-28), OpenAI's
Codex documentation. Licences verified at source 2026-10-28.*

## Codex CLI

**Licence bucket: open source — Apache-2.0.** The CLI repository
(Rust, ~131k stars at audit) is Apache-2.0. The *models* it drives,
Codex Cloud and the IDE extension are **paid proprietary** products;
only the CLI is open. Per the owner's hard free rule, nothing here
wires the OpenAI API as a dependency — the teardown takes the
harness design, which is the reusable asset.

**The design worth taking — two independent safety axes.** Codex
separates *what the agent can technically touch* from *when it must
ask*:

- **Sandbox mode** (OS-enforced: Seatbelt on macOS, Landlock/seccomp
  on Linux): `read-only` → `workspace-write` (writes inside
  workspace roots, network off by default) → `danger-full-access`.
  Newer builds express this as permission profiles.
- **Approval policy**: `on-request` (the agent decides when to ask)
  / `never` (safe only when the sandbox contains the blast radius) /
  deprecated `untrusted`, `on-failure`. `codex exec` (the
  non-interactive CI mode) runs read-only + never by default.
- **AGENTS.md** — project guidance files, read hierarchically; the
  industry converged on this filename (it is now an Agentic AI
  Foundation project alongside MCP).
- **Hooks + rules files** (`.codex/hooks.json`, `.rules`) — the
  enforcement layer under AGENTS.md's advice; `codex review`
  re-reads diffs; MCP client support and subagents are built in;
  `--oss` swaps the model seat to a local Ollama model.

**Mapping to Wielder (evidence in the tree):** Wielder's two axes
are the *tool layer* (structural containment: validated payloads
only, no raw text-to-shell, scorer-owned prefixes denied in code —
`tools.py`/`constitution.py`) and *standing-authorization classes*
(`authz.py` — the ask-once-then-stand shape, broader than Codex's
per-session approval and deliberately so: Wielder runs unattended
on a heartbeat). AGENTS.md ↔ `wielder/instruction.py` + the repo's
own AGENTS.md discipline + the instruction-drift gate. `codex exec`
↔ the manager CLI's `run-once`. Verdict: **parity** on the harness
patterns; Wielder's containment is narrower in one respect (no
OS-level sandbox around registered scripts — they run as the
Wielder user) and stronger in another (a script can only run if a
method record names it). The OS-sandbox gap is recorded in
WAVE-MAP.md, not silently absorbed.

## Agents SDK

**Licence bucket: open source — MIT** (`openai/openai-agents-python`,
PyPI `openai-agents` 0.24.0 at audit). A production evolution of
Swarm, built on a deliberately tiny primitive set:

- **Agent** — an LLM with instructions, tools, guardrails, handoffs;
  a built-in loop (`Runner`) that runs turns until a final output.
- **Function tools** — any Python function becomes a tool with
  automatic JSON Schema generation and Pydantic validation.
- **Handoffs / agents-as-tools** — delegation as a first-class
  primitive, with input filtering on the transfer.
- **Guardrails** — input/output validation running *in parallel*
  with the agent, fail-fast on tripwire.
- **Sessions** — a persistent memory layer across turns.
- **Tracing** — built-in spans for every run (visualise, evaluate,
  fine-tune from them).
- **MCP integration** — remote MCP servers' tools exposed beside
  function tools (`MCPServerStdio` et al.); human-in-the-loop
  approvals; sandbox agents with resumable workspace sessions;
  realtime/voice pipelines.

**Mapping to Wielder:** this is the closest public relative of
Wielder's architecture, and the parity is mostly structural —
function tools with Pydantic schemas ↔ `tools.REGISTRY` (same
pattern, independently arrived at; Wielder's goes further: payload
validation is the *only* execution door); handoffs ↔
`delegate.py`/`fanout.py` (Wielder's children are full graded runs,
not conversational transfers); guardrails ↔ the gates family
(claims/instruction gates, critic lint, evidence proof gate —
Wielder's run *after and during*, as separate artifacts, not as
parallel tripwires on the same call; the difference is recorded,
not rounded); sessions ↔ the graph checkpoint store + step
journal; tracing ↔ the run ledger + journal (SQLite, artifact-
cited) — Wielder's traces double as its evidence chain, which the
SDK's do not claim to be.

## What this wave wired for the OpenAI target

The interop surface, not a dependency:

- **`wielder/tool_schemas.py`** renders the registry into the
  OpenAI function-calling envelope
  (`{"type": "function", "function": {name, description, parameters}}`)
  alongside the MCP, Anthropic and Gemini dialects — so a Wielder
  tool can be offered to a Codex/Agents-SDK-shaped host in its own
  format, and the shape is test-pinned (`test_mcp_wave.py`).
- No OpenAI API seat was added, and none should be: the owner's
  seat policy governs advisory seats, Wielder's existing seats are
  unchanged, and the paid API stays behind the recorded
  key-plus-spend-go-ahead gate that `brain.py` already enforces for
  the paid xAI seat.

## GAPs

- **OS-level sandboxing** of tool execution (Codex's Seatbelt/
  Landlock layer) — Wielder contains by structure and authorization,
  not by kernel sandbox. Labelled GAP in WAVE-MAP.
- **Tracing visualisation** — the SDK ships a trace viewer;
  Wielder's ledger is queryable data + generated packets, no span
  UI. Cosmetic; not claimed.
- **Realtime/voice agent pipelines** — out of scope for Wielder's
  production-graph role; the show's voice lane owns that ground.
- Closed model weights/internals behind both products — GAP by
  definition of the wave: documented behaviour only.
