# TEARDOWN — Model Context Protocol (MCP)

*Agents wave, 2026-10-28. Sources: the public specification and
documentation at modelcontextprotocol.io (read 2026-10-28), the
official SDK repositories, and Wielder's own tree on main. Licence
labels verified at source the same day.*

## What it is

MCP is the open protocol that standardises how an AI application
(the **host**) connects to external tools and context. One host
creates one **client** per **server**; servers offer three
primitives; everything travels as JSON-RPC 2.0. Anthropic created it
in November 2024; in December 2025 it was donated to the Agentic AI
Foundation (a Linux Foundation directed fund co-founded by
Anthropic, Block and OpenAI), so no single vendor owns it now. It is
the closest thing the agent industry has to a USB-C port: Claude
Code, Codex, Gemini CLI, AutoGen and the OpenAI Agents SDK all speak
it, which is precisely why it is the headline of this wave — a tool
exposed once over MCP is reachable from every harness.

**Licence bucket: open standard + open source SDKs.** The
specification lives in `modelcontextprotocol/modelcontextprotocol`
(GitHub reports its licence as NOASSERTION — the repo carries mixed
documentation/code licensing; the SDKs are unambiguous): the official
Python SDK (`modelcontextprotocol/python-sdk`, **MIT**, v2.x on PyPI;
Wielder pins the 1.30.0 line in requirements.txt), TypeScript SDK
(**MIT** per its package metadata), and the reference servers
collection (**MIT** per-server). Nothing in this wave copies SDK
code: Wielder's new core is implemented from the published
specification, which is what the specification is for.

## The protocol, as specified

**Transports (2).** *Stdio*: the client spawns the server as a
subprocess; messages are newline-delimited JSON over stdin/stdout;
the server logs to stderr only. *Streamable HTTP* (2025-03-26,
replacing the original HTTP+SSE transport): one HTTP endpoint, POST
for client→server, optional SSE stream for server→client, standard
HTTP auth (OAuth recommended).

**Lifecycle.** `initialize` request (client's protocolVersion,
capabilities, clientInfo) → server result (its protocolVersion —
the client's version if supported, else the server's latest —
capabilities, serverInfo) → `notifications/initialized` → normal
operation. Requests before the handshake are an error
(`-32002`, server-not-initialized).

**Server primitives (3).**
- **Tools** — model-controlled executable functions.
  `tools/list` (each with a JSON Schema `inputSchema`), `tools/call`.
  Results carry `content` blocks (text/image/resource), optional
  `structuredContent`, and `isError`: a tool that fails returns an
  isError *result* so the model can react; protocol-level failures
  (unknown tool `-32602`, unknown method `-32601`, parse `-32700`)
  are JSON-RPC errors. The distinction is load-bearing and Wielder's
  core implements it exactly.
- **Resources** — application-controlled context data, addressed by
  URI (`resources/list`, `resources/read`, templates via
  `resources/templates/list`, optional subscribe/listChanged).
- **Prompts** — user-controlled templates (`prompts/list`,
  `prompts/get` with argument substitution).

**Client primitives.** Roots (filesystem bounds the client offers),
sampling (`sampling/createMessage` — the server borrows the host's
model), elicitation (`elicitation/create` — the server asks the user
for input mid-call). Plus utilities: `ping`, progress notifications,
cancellation, logging. Pagination is cursor-based; JSON-RPC batching
is *not* part of MCP.

**Version history.** 2024-11-05 (first) → 2025-03-26 (Streamable
HTTP, OAuth) → 2025-06-18 (structured content, elicitation) →
2025-11-25 (current widely-implemented revision: tasks/extensions
groundwork, registry at registry.modelcontextprotocol.io) →
**2026-07-28 (stateless revision)**: the initialize handshake goes
away; every request carries version + capabilities in `_meta`;
capability discovery becomes the optional `server/discover`;
sampling and logging are deprecated (log to stderr / use the
provider API directly); change notifications become opt-in
subscriptions. Wielder implements the handshake revisions
(2024-11-05…2025-11-25) — what the SDKs and deployed servers speak
today — and tracks the stateless revision as a GAP below, in the
open, rather than claiming it.

## What Wielder already had (audit, main @ bfd91cc2)

The parity build had already wired the SDK bridge, and this wave
does not touch it:

- `wielder/mcp_client.py` — MCP **client** via the official SDK:
  spawns servers from `wielder/mcp-servers.json` (stdio), discovers
  tools, generates a Pydantic model from each tool's input schema,
  registers them into `tools.REGISTRY` as `mcp__<server>__<tool>`,
  and gates calls behind the `mcp-client` standing-authorization
  class. Discovery errors are recorded, never fatal.
- `wielder/mcp_server.py` — MCP **server** via the SDK, exposing two
  generic meta-tools (`wielder_tools`, `wielder_tool`): list names,
  then call-by-name with a JSON-string payload.

## What was missing, and what this wave wired

Missing: (1) first-class exposure — hosts present *individual*
tools with their own schemas to the model; two meta-tools hide
Wielder's eight tools behind a stringly-typed door; (2) the
resources and prompts primitives — Wielder had no MCP resources or
prompts at all; (3) a protocol implementation Wielder owns outright,
independent of the SDK's release cadence and import weight (the
deterministic seat's environment is deliberately bare); (4) any test
coverage of the MCP surface (tests/ had none).

Wired now (all new files; the SDK bridge is untouched):

- **`wielder/mcp_protocol.py`** — the protocol core, stdlib only:
  `ServerCore` (all three primitives, lifecycle + negotiation,
  spec error codes, batch rejection), `ClientSession` (handshake,
  primitive calls, notification stashing), `LoopbackTransport`
  (in-process, for tests/embedding), `StdioTransport` (spawn +
  NDJSON), `serve_stdio` (the server side of the wire).
- **`wielder/mcp_wielder_server.py`** — Wielder as an MCP server in
  the shape hosts expect: every REGISTRY tool a first-class tool
  (schema from `wielder/tool_schemas.py`, execution through
  `tools.call_tool`, so validation, authz classes and the
  scorer-owned write guard all still apply — MCP exposure does not
  bypass a single Wielder guarantee); resources
  `wielder://constitution` and `wielder://tools` read **live** from
  the constitution module and registry; one prompt,
  `wielder_run_card`, stating the governed flow. Run:
  `python -m wielder.mcp_wielder_server`.
- **`wielder/tests/test_mcp_wave.py`** — 25 tests: lifecycle,
  negotiation, all three primitives, error-shape discipline,
  loopback client round-trip, the real registry served in-process,
  and a real stdio subprocess round-trip. Verbatim output:
  `TEST-OUTPUT.txt` (25 passed).

## Claude Code harness patterns → Wielder's loop

Claude Code (Anthropic's terminal agent; the product is
**proprietary** — its GitHub repo carries no open-source licence and
exists for issues/plugins/docs; the teardown is of documented
behaviour only, no code taken) is the reference host implementation
of MCP and the pattern source for terminal harnesses generally:

| Claude Code pattern (documented) | Wielder's counterpart | State |
|---|---|---|
| Permission modes (default / acceptEdits / plan / bypass) + per-tool allow rules | Standing-authorization classes (`wielder/authz.py`): a class asks once, then stands; tool layer enforces per call | HAVE (different shape: classes over action types, not per-tool prompts) |
| Hooks (PreToolUse/PostToolUse/etc. shell hooks in settings) | `wielder/hooks.py` + `hooks.json`: event files → queue cards at heartbeat; instruction/proof gates inside the run | HAVE (event→card shape, not per-tool-call interception — GAP, minor: no pre-tool veto hook surface) |
| Subagents (isolated context, own tools, handoff summary) | `wielder/delegate.py` + `fanout.py`: full child runs on named cards, packet-cited results, errors captured per child | HAVE (stronger: children are graded runs, not summaries) |
| CLAUDE.md memory hierarchy (user/project/local) | `wielder/instruction.py` + repo AGENTS.md discipline + instruction-drift gate | HAVE |
| MCP client (stdio + remote servers, `.mcp.json`) | `mcp_client.py` (SDK) + `mcp_protocol.ClientSession` (owned core) | HAVE (both halves now) |
| MCP server mode (`claude mcp serve`) | `mcp_server.py` (SDK meta-tools) + `mcp_wielder_server.py` (first-class tools/resources/prompts) | HAVE (this wave) |
| Plan mode (read-only exploration before edits) | Graph state machine: PLANNING is a distinct state; execution cannot precede a plan + discovery log | HAVE (structural, constitution #2) |
| Checkpointing / rewind | LangGraph checkpoint store (`data/graph.sqlite`) + step journal for durable jobs | HAVE |
| Headless mode (`-p`, JSON output, CI) | Manager CLI (`wielder run-once / run-queue / heartbeat --once`) | HAVE |

The one pattern deliberately **not** adopted: Claude Code's
sampling-style model borrowing and its interactive permission
prompts as the primary safety shape. Wielder's constitution inverts
both on purpose (deterministic seat default; authorization by
standing class, decided once by the owner, not per keystroke).

## GAPs (labelled, not faked)

- **Stateless 2026-07-28 revision** — not implemented: no
  `server/discover`, no per-request `_meta` negotiation, no
  subscriptions/listen. The handshake core is the deployed reality;
  the stateless revision is the documented next step.
- **Streamable HTTP transport** — not implemented in the owned core
  (stdio + loopback only). The SDK bridge also configures stdio
  only. A remote Wielder server would need this plus the spec's
  OAuth story; neither is claimed.
- **Client primitives as a server consumer** — Wielder acting as a
  *client* does not offer sampling/elicitation/roots to servers it
  connects to (the SDK bridge covers the SDK's defaults; the owned
  `ClientSession` declares roots capability in initialize but does
  not answer `roots/list`). Servers Wielder connects to must not
  require them.
- **Resource templates & subscriptions** — `resources/templates/list`
  answers empty; no subscribe support. Static resources only.
- **Tasks extension** (durable long-running tool handles) — not
  implemented; Wielder's own durable-job journal is the internal
  equivalent, not exposed over MCP.
