# TEARDOWN — Microsoft AutoGen

*Agents wave, 2026-10-28. Sources: github.com/microsoft/autogen,
microsoft.github.io/autogen (read 2026-10-28). Licences verified at
source the same day.*

## What it is

**Licence buckets: code open source — MIT; repository documentation
— CC-BY-4.0.** (The repo root licence GitHub detects is CC-BY-4.0,
covering the docs; the Python packages — `autogen-core`,
`autogen-agentchat` 0.7.5, `autogen-ext` — carry MIT, per their
PyPI metadata.) AutoGen is Microsoft's multi-agent framework, in
its current (post-0.2) architecture:

- **Core** — an event-driven *actor runtime*: agents are actors
  with identities, exchanging typed messages through a runtime that
  can be single-process or distributed (gRPC worker runtime).
  Agents are addressable, stateful, and language-interoperable.
- **AgentChat** — the conversational layer on Core: `AssistantAgent`
  (model + tools), `UserProxyAgent` (human/code-execution proxy),
  and **teams** with turn-taking policies: `RoundRobinGroupChat`,
  `SelectorGroupChat` (a model picks the next speaker),
  `Swarm` (handoff-driven), `MagenticOneGroupChat`.
- **Magentic-One** — the flagship generalist team: an Orchestrator
  keeps a *task ledger* (facts + plan) and a *progress ledger*
  (per-agent status), delegating to specialist agents
  (WebSurfer, FileSurfer, Coder, ComputerTerminal) and replanning
  when the progress ledger stalls.
- **Extensions** — `McpWorkbench` (MCP servers as agent toolsets),
  Docker code execution, `AutoGen Studio` (a no-code prototyping
  UI on AgentChat).

## AutoGen's conversation model vs Wielder's coordinator model

The philosophical difference is the whole story. AutoGen's unit of
coordination is the **conversation**: agents talk, a policy picks
speakers, and the work product precipitates out of the dialogue.
Wielder's constitution forbids exactly that shape — *inter-agent
messages are schema JSON only* and the graph is a state machine
(IDLE → PLANNING → EXECUTING → EVALUATING → SUCCESS/FAILED/PARKED),
never a loose loop. Mapping the pieces honestly:

| AutoGen | Wielder | Verdict |
|---|---|---|
| AssistantAgent (model + tools, reflect-on-tool-use) | Advisory seats (`brain.advise`) + the deterministic method executor | Different centre of gravity: AutoGen's agent *is* the loop; Wielder's loop runs with no model at all, seats advise |
| RoundRobin / Selector turn-taking | The graph's fixed state transitions; routing reads verifier manifests and exit codes only | Not applicable by design — Wielder has no speaker selection because it has no conversation |
| Swarm handoffs | `delegate.py` (child run on a card) + `fanout.py` (parallel children, aggregate record) | Parity of purpose, stronger evidence shape: the parent cites the child's *packet*, never its prose — there is no prose |
| Magentic-One task + progress ledgers | The run ledger (`ledger.py`: runs, transitions, tool calls) + queue cards + stall-watch (`circles.check_stalls`) | **Parity, independently converged** — the two-ledger idea (what is true / what is done) is the same invention; Wielder's are SQLite and gate the run, Magentic-One's are model-maintained text |
| Actor runtime (Core) | LangGraph graph + checkpoint store | Different mechanism (message-passing actors vs state graph); Wielder gets distribution only via the board/queue, AutoGen Core's gRPC runtime is genuinely more distributed — GAP, low relevance to a single-VM studio |
| McpWorkbench | `mcp_client.py` + this wave's protocol core | Parity (both consume MCP servers) |
| UserProxyAgent (human in the loop) | The owner gate (PARKED state; resumes on the owner's verdict) + approval cards | Parity of purpose; Wielder's park is a graph state with a mandatory blocker record, not a chat turn |
| Docker code executor | Registered-script tool (named scripts only) | Wielder is deliberately narrower |
| AutoGen Studio (no-code UI) | Chainlit chat app (`chat.py`) + dashboard | Partial — Wielder's UI is an operator surface, not a team-design studio; not a goal |

## What this wave wired for the AutoGen target

No AutoGen code and no new module: the honest result of the
teardown is that Wielder already contains the wireable ideas, in
its own stricter shapes (the table above is the evidence), and
importing a conversational framework would *contradict* the
constitution rather than extend the system. What the wave adds for
this target is the mapping itself and one convergence note: the
MCP workbench pattern is now served from both sides of Wielder —
client (existing) and first-class server (this wave) — which is
the same interop position AutoGen reaches via `McpWorkbench`.

## GAPs

- **Distributed actor runtime** — Wielder coordinates through a
  board + SQLite on one VM; AutoGen Core's routed, multi-process
  actors are a real capability Wielder does not have and does not
  currently need (the studio is one machine by design).
- **Model-selected turn-taking** (SelectorGroupChat) — absent on
  purpose; recorded here so the absence is a decision, not an
  oversight.
- AutoGen's hosted surfaces (Studio's cloud aspects) and model
  internals — out of scope / closed.
