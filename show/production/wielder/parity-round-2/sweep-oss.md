# Wielder Parity Round 2 — Open-Source Sweep (verified at source)

- **Date checked for every project below: 2026-10-28**
- Method: the actual `LICENSE` file in each repo was fetched and read (raw
  `raw.githubusercontent.com/<owner>/<repo>/main/...` URL given per section),
  plus the repo's `README.md` and the GitHub API record
  (`api.github.com/repos/<owner>/<repo>`) for pushed date / primary language.
  Licence labels come **only** from the LICENSE file read — never from a
  badge, a README claim, or memory. Where a capability detail comes from
  project docs / doc-site search rather than the README read in this sweep,
  that is said in-line.
- Licence buckets used (per the licence-honesty law): **open source** (named
  licence), **free proprietary / paid** (for the *model service* behind an
  open-source client, where that distinction matters), **free-but-restricted**
  (research / non-commercial terms).
- Three repos have **moved** since the task list was written — the old name
  redirects, the API returns the new owner:
  - `All-Hands-AI/OpenHands` → **`OpenHands/OpenHands`**
  - `paul-gauthier/aider` → **`Aider-AI/aider`**
  - `block/goose` → **`aaif-goose/goose`** (Agentic AI Foundation / Linux Foundation)

---

## 1. google-gemini/gemini-cli — Gemini CLI

**Licence verdict: Apache-2.0 — OPEN SOURCE (client code only).**
LICENSE read: `raw.githubusercontent.com/google-gemini/gemini-cli/main/LICENSE`
— header "Apache License, Version 2.0, January 2004". Checked 2026-10-28.
Activity: pushed **2026-10-28T19:37:24Z** (same day as check), primary
language **TypeScript**, not archived — **alive, very active**.
⚠️ Product status changed (README, read 2026-10-28): this repo is now
maintained for **Gemini Code Assist Standard / Enterprise** on Google Cloud;
free individual / Google AI Pro-Ultra access **moved to Antigravity CLI on
2026-06-18**, and the README says it is "Not optimized for Gemini 4+". The
*code* is Apache-2.0; the *model seat behind it* is **paid / enterprise
proprietary** (Code Assist licence, paid API key, or Vertex AI) — do not
label a Gemini seat "free" on the strength of this repo.

Capabilities to wire into Wielder:

- **Context files — `GEMINI.md` hierarchy:** global `~/.gemini/GEMINI.md` →
  project → subdirectory files, merged most-specific-wins, with `@./file`
  imports inside them; `/init` scaffolds one, `/memory add|show|refresh`
  edits persistent memory. This is the direct template for a Wielder
  context-file loader.
- **Context compression:** `/compress` summarises the conversation into a
  structured snapshot (goal / key knowledge / file state / plan preserved);
  docs report an auto-trigger at ~70% of the context limit. Directly fills
  round-1 gap #1 (compaction/summariser) — copy the *snapshot schema*, not
  just "summarise old turns".
- **Checkpointing:** `--checkpointing` snapshots files + conversation before
  tool execution (git-backed shadow snapshots); `/restore` / `/restore list`
  rolls back files *and* context together.
- **Tool system:** built-ins (file system, shell, web fetch/search) +
  **MCP servers** configured in `~/.gemini/settings.json` (`mcpServers`),
  invoked as `@server prompt`; **Extensions** bundle custom commands + MCP
  config + context files (`gemini extensions install`); **custom commands**
  as TOML files in `~/.gemini/commands/*.toml`.
- **Headless / script surface:** `gemini -p "…"`, `--output-format json` and
  `--output-format stream-json` (newline-delimited events) — the cleanest
  machine-readable headless contract in this sweep; Wielder's CLI seat
  should emit the same two formats.
- **Sandbox + trust model:** `--sandbox` / `GEMINI_SANDBOX=1` (Docker /
  macOS Seatbelt), Trusted Folders gating execution policy per folder,
  approval modes incl. `--yolo` auto-approve.
- **Surfaces:** terminal TUI, VS Code IDE companion (open files / cursor /
  native diff sync), GitHub Action for PR review/triage, telemetry
  (local or GCP target) + token caching, `/stats`.

Blockers: none in the code licence. Seat blocker only: no free Gemini seat
remains in this client (see status note above).

---

## 2. openai/codex — Codex CLI

**Licence verdict: Apache-2.0 — OPEN SOURCE (client code only).**
LICENSE read: `raw.githubusercontent.com/openai/codex/main/LICENSE` —
"Apache License, Version 2.0", appendix "Copyright 2025 OpenAI".
Checked 2026-10-28.
Activity: pushed **2026-10-28T20:23:56Z**, primary language **Rust**,
not archived — **alive, very active**.
Seat note: code is Apache-2.0; running it needs a **ChatGPT plan
(Plus/Pro/Business/Edu/Enterprise — paid proprietary)** or a paid OpenAI
API key, per its README.

Capabilities to wire into Wielder:

- **Instructions file — `AGENTS.md`:** merged from repo root down to the
  current folder; `/init` scaffolds it. Codex is the reference
  implementation of the AGENTS.md convention Wielder should adopt verbatim
  (one file format read by CLI, IDE and app alike).
- **Two-axis safety model (the pattern to copy):** *sandbox_mode* =
  `read-only` | `workspace-write` | `danger-full-access` (what the agent
  *can* do; OS-enforced — Seatbelt on macOS, bubblewrap+seccomp on Linux)
  kept **separate** from *approval_policy* = `untrusted` | `on-request` |
  `never` (when it must *ask*). `--full-auto` is just the preset
  workspace-write + on-request. Newer builds add named permission
  profiles (`:read-only`, `:workspace`, `:danger-no-sandbox`, plus custom
  `[permissions.<name>]` tables with per-path filesystem rules and
  protected `.git/` `.codex/` `.agents/` paths).
- **Config:** single `~/.codex/config.toml` (project override
  `.codex/config.toml`, loaded only for trusted projects) shared across
  CLI / IDE extension / desktop app; MCP servers are configured in the
  same TOML.
- **Skills:** `.agents/skills/` (project) and `~/.codex/skills/` (user);
  each skill is a folder with a `SKILL.md` (YAML frontmatter +
  instructions) — the exact format round-1 gap #2 (SKILL.md import
  adapter) must ingest.
- **Surfaces / loop:** local terminal agent (`codex`), non-interactive
  `codex exec "…"` for scripting, IDE extension (VS Code/Cursor/Windsurf),
  `codex app` desktop app, and a separate cloud agent (Codex Web) whose
  runtime is two-phase — network-on setup phase, then offline agent phase
  unless internet is explicitly enabled. Network is **off by default** in
  the local sandbox — a good Wielder default.

Blockers: none in the code licence. No open-weight model is bundled;
the seat is paid proprietary (above).

---

## 3. OpenHands/OpenHands (was All-Hands-AI/OpenHands) — OpenHands / Agent Canvas

**Licence verdict: MIT — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/All-Hands-AI/OpenHands/main/LICENSE`
(redirects to the renamed org) — "The MIT License (MIT)",
"Copyright © 2025 OpenHands contributors". Checked 2026-10-28.
No `ee/` split is stated in that LICENSE file (contrast Langfuse §9).
Activity: pushed **2026-10-28T19:21:46Z**, primary language **TypeScript**
(this repo is now the frontend/control centre — see below), not archived
— **alive, very active**.
⚠️ Architecture moved: this repo is now **Agent Canvas**, "the self-hosted
developer control center for coding agents". The actual agent loop, tools
and runtime now live in the separate **`OpenHands/software-agent-sdk`**
repo (Python SDK + Agent Server); automations in `OpenHands/automation`.
Vendoring "OpenHands" from this repo alone gets the UI, **not** the agent.

Capabilities to wire into Wielder:

- **Agent Server pattern:** one REST Agent Server per host/port; a single
  frontend (Canvas) connects to **many backends** (local, Docker, VM,
  cloud) and switches between them mid-work without losing the
  conversation — the multi-backend seat router Wielder wants.
- **ACP (Agent Client Protocol) as the agent-plug standard:** Canvas runs
  the OpenHands agent out of the box but can drive Claude Code, Codex,
  Gemini CLI, Pi, OpenCode or any ACP-compatible agent — i.e. foreign
  agents become seats behind one UI/ledger.
- **Condenser (context compression):** pluggable history condensers —
  LLM-summarising condenser and recent-events condenser
  (`openhands/memory/condenser/…`, config under `[condenser]`) — keep the
  full event log persistent and replayable while the *prompt* is
  compressed, so a session can exceed the context window indefinitely and
  still rewind to any event. Second strong reference for round-1 gap #1.
- **Microagents = skills:** Markdown + YAML frontmatter in
  `.openhands/microagents/` (repo), `~/.openhands/microagents/` (user) and
  a global skills dir. Three types: **repo** (always loaded),
  **knowledge** (loaded when a trigger keyword appears in conversation),
  **task** (invoked by slash command). Trigger-based loading is the piece
  most skill systems in this sweep lack — copy it.
- **Event/loop design (SDK):** typed Action/Observation event stream,
  `Conversation.run()` until Finish / stuck-detection / budget exhaustion;
  stuck detection, max-iteration + accumulated-cost budgets, risk-aware
  confirmation (`ConfirmRisky` — pause only on destructive actions),
  security risk assessment before execution, LiteLLM provider abstraction
  (any provider incl. local Ollama/vLLM/SGLang).
- **Runtime/sandbox:** same agent code on `LocalWorkspace` (no isolation,
  full filesystem — README warns explicitly), single Docker sandbox, or
  **one Docker container per conversation** (`OH_CONVERSATION_RUNTIME=docker`,
  workspace + persisted state mounted so history survives container
  replacement).
- **Automations:** schedule- or webhook-triggered agent runs integrating
  Slack / GitHub / Linear / Notion (issue → decomposed tasks → report to
  Slack is the shipped example).
- **Surfaces:** web Canvas UI (localhost:8000), CLI/headless, Agent Server
  REST API, multi-user sandboxed deployment mode.

Blockers: none in the LICENSE read. Practical blocker: it is a
**multi-repo system now** — budget for the SDK repo as the real source,
and note OpenHands Cloud / Enterprise are separate commercial offerings
(not in this repo's MIT grant as read).

---

## 4. Aider-AI/aider (was paul-gauthier/aider) — Aider

**Licence verdict: Apache-2.0 — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/Aider-AI/aider/main/LICENSE.txt`
(also read at the old `paul-gauthier/aider/main/LICENSE.txt` — identical
Apache-2.0 text). Checked 2026-10-28.
Activity: pushed **2026-05-22T14:02:20Z**, primary language **Python**,
not archived — **alive, but cadence has slowed** (last push ~5 months
before this check; repo still updated in the API record on 2026-10-28).
Re-verify HEAD before vendoring any specific module.

Capabilities to wire into Wielder:

- **Repo Map (the standout):** tree-sitter parses the whole repo into a
  graph of files/symbols/references, **PageRank-ranked** and packed to a
  token budget (`--map-tokens`, default ≈1/8 of context) so the model sees
  a compact map of a large codebase instead of file dumps. Nothing else in
  this sweep does ranked-map context; this is the indexing pattern to copy
  for Wielder's repo awareness (no embeddings service needed).
- **Edit-format engine:** per-model edit formats — `diff`
  (SEARCH/REPLACE blocks), `whole`, `udiff`, `patch`, `architect` — chosen
  automatically per model (`ModelSettings.edit_format`), with fuzzy
  matching on apply. Wielder's editor should be format-pluggable the
  same way.
- **Architect mode:** two-model split — a strong *architect/planner* model
  designs the change, a cheaper *editor* model executes it; plus a
  *weak model* role for commit messages/summaries. A ready-made
  multi-seat routing pattern (strong seat plans, local seat edits).
- **Git-native checkpointing:** auto-commit after every accepted edit with
  a generated message; `/undo`, `/diff`, `/clear` in-chat; git itself is
  the undo/attribution system (aider requires a git repo).
- **Chat modes & context control:** `code` / `ask` / `architect` / `help`
  modes; explicit context scoping with `/add` (editable) vs read-only
  reference files; images and web pages as context; voice-to-code.
- **Self-repair loop:** `--auto-lint` / `--lint-cmd` and `--auto-test` /
  `--test-cmd` run after each edit and feed failures back to the model
  until green.
- **Instructions/config:** `CONVENTIONS.md` (read-only conventions file),
  `.aider.conf.yml` (project) + home config, model-agnostic via LiteLLM —
  cloud models and local Ollama models through one adapter; prompt caching
  support. **Watch mode:** put `AI!`/`AI?` comments in any editor and
  aider watching the filesystem does the work — a zero-IDE-integration
  surface worth copying.

Blockers: none. Apache-2.0 throughout the LICENSE read.

---

## 5. cline/cline — Cline

**Licence verdict: Apache-2.0 — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/cline/cline/main/LICENSE` —
"Apache License, Version 2.0", appendix "Copyright 2026 Cline Bot Inc.".
Checked 2026-10-28.
Activity: pushed **2026-10-28T20:07:45Z**, primary language **TypeScript**,
not archived — **alive, very active**.
Note: the repo-root README read in this sweep is now a short surface
index (CLI / desktop / VS Code / JetBrains); the feature details below are
corroborated from Cline's docs/docs-site descriptions, not from that
README alone.
⚠️ One surface is **not** open: multiple sources state the JetBrains
plugin is distributed via JetBrains Marketplace and is not open-sourced
with the rest — treat only the VS Code extension, CLI and SDK as
Apache-2.0-vendorable until the plugin's own licence is read.

Capabilities to wire into Wielder:

- **Plan / Act two-mode loop:** Plan mode = read/search/discuss only, no
  writes or commands; Act mode executes with the Plan context retained.
  Mode is a hard capability gate, not a prompt suggestion — copy the gate.
- **Granular auto-approve matrix:** eight separately toggleable categories
  (read project files, read all files, edit project files, edit all
  files, execute safe commands, execute all commands, use browser, use
  MCP) — finer-grained than Codex's policy enum and a good UI model for
  Wielder's approval cards.
- **Checkpoints:** every step is checkpointed (shadow-git style); any
  message/step can be restored, rolling back files and conversation.
- **Rules + skills:** `.clinerules` file(s) at project root, auto-loaded
  by CLI, VS Code and JetBrains surfaces; skills let the model load
  specific rule sets on demand.
- **MCP Marketplace:** in-product discovery/install of MCP servers plus
  the ability to have Cline *build* a new MCP server from a prompt —
  servers are the extension unit, configured automatically.
- **Tool loop with live feedback:** file create/edit with in-editor diff
  review, terminal execution with real-time output monitoring (long-running
  dev servers keep running in background; the agent reacts to new output —
  compile errors, test failures, crashes), linter/compiler error watching,
  and headless-browser use (Puppeteer-class) for web actions/screenshots.
- **Surfaces:** VS Code extension, CLI (interactive + fully headless for
  CI/CD/scripting, incl. multi-agent teams and scheduled agents in current
  releases), native desktop app (macOS/Windows; run sessions in any
  folder, schedule routines, manage models/plugins/MCP), JetBrains plugin
  (see licence note above), and an `@cline/sdk` package for embedding the
  runtime. Model-agnostic / BYOK across 30+ providers incl. local Ollama
  and LM Studio.

Blockers: JetBrains plugin licence unverified / reported closed (above).
Everything else read is Apache-2.0.

---

## 6. continuedev/continue — Continue

**Licence verdict: Apache-2.0 — OPEN SOURCE, but the project is END-OF-LIFE.**
LICENSE read: `raw.githubusercontent.com/continuedev/continue/main/LICENSE`
— "Apache License, Version 2.0", appendix "Copyright 2023 Continue Dev, Inc.".
Checked 2026-10-28.
Activity: pushed **2026-10-27T15:39:03Z**, primary language **TypeScript** —
but its own README (read 2026-10-28) states verbatim: *"The
`continuedev/continue` repository is no longer actively maintained and is
read-only for all users"* and announces a **"Final 2.0.0 Release"** (which
also removed anonymous telemetry and pulled out authentication).
**Alive: NO — finished/frozen at 2.0.0.** Vendor patterns, not a living
dependency; expect no fixes. Third-party reports (not repo-verified in
this sweep) say the Continue Hub service has shut down, which would break
any config that references hub blocks with `uses:` — Wielder configs must
declare everything inline/local, never by hub reference.

Capabilities to wire into Wielder (as patterns — this is the best
*config architecture* in the sweep):

- **Blocks + `config.yaml` composition:** an assistant is a YAML file
  (`name`/`version`/`schema: v1`, at `~/.continue/config.yaml` globally or
  in-workspace) composed of single-purpose **blocks** — `models`,
  `context`, `rules`, `prompts`, `tools`/`mcpServers`, `docs` — each block
  independently shareable/versionable. This is the cleanest "assemble an
  agent from parts" schema to copy for Wielder seat/card definitions.
- **Model roles:** one model list, each entry tagged with roles —
  `chat`, `edit`, `apply`, `agent`, `autocomplete`, `embed`, `rerank` —
  so a big model chats/edits, a small fast FIM model autocompletes, and a
  dedicated embedding model indexes. Role-tagging maps 1:1 onto Wielder's
  seat system (incl. a local advisory seat in the `chat`/`edit` roles and
  a tiny model in `autocomplete`).
- **Context providers (`@`-mentions):** pluggable providers — `@codebase`,
  `@code`, `@diff`, `@terminal`, `@problems`, `@folder`, `@docs`,
  `@web`, `@tree` etc. — each a small module that returns context on
  demand instead of stuffing the prompt.
- **Codebase indexing/retrieval:** `@codebase` chunks + embeds the repo
  (embed-role model, e.g. a local embedding model via Ollama) for semantic
  search — the embeddings-based counterpart to Aider's repo map; the two
  patterns compose well.
- **Rules:** `.continue/rules/*.md` files with frontmatter (e.g.
  `alwaysApply: true`, glob scoping) — numbered multi-file rules folders
  rather than one monolith.
- **Autocomplete pipeline:** dedicated FIM model role with
  `autocompleteOptions` (debounce delay, max prompt tokens) — latency
  engineering Wielder's editor surface will need if it grows one.
- **Surfaces:** VS Code extension, JetBrains plugin, CLI (`@continuedev/cli`).

Blockers: licence is clean Apache-2.0; the blocker is **maintenance
death** (above) — patterns only, pin nothing live to it.

---

## 7. SWE-agent/SWE-agent — SWE-agent

**Licence verdict: MIT — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/SWE-agent/SWE-agent/main/LICENSE`
— "MIT License", "Copyright (c) 2024 John Yang, Carlos E. Jimenez,
Alexander Wettig, Shunyu Yao, Karthik Narasimhan, Ofir Press".
Checked 2026-10-28.
Activity: pushed **2026-10-26T22:40:23Z**, primary language **Python**,
not archived — **alive, but superseded by its own team**: the README
(read 2026-10-28) warns *"Most of our current development effort is on
mini-swe-agent, which has superseded SWE-agent… Our general recommendation
is to use mini-SWE-agent instead."* For new wiring, evaluate
mini-SWE-agent (same org) alongside this repo.

Capabilities to wire into Wielder:

- **Agent-Computer Interface (ACI) — the core idea:** tools designed for
  an LM, not a human — bounded/truncated output, persistent runtime
  state, fixed argument grammar, file viewer with paging, `find_file` /
  filemap navigation, a dedicated editor that shows before/after and
  rejects malformed edits (lint check on edit). "Build agent-shaped
  tools, not human-shaped tools" is the design law to adopt verbatim.
- **Single-YAML agent definition:** one config file governs everything —
  `agent.templates` (system/instance/next-step prompt templates),
  `agent.tools.bundles`, `agent.history_processors`, `agent.model`
  (incl. `per_instance_cost_limit`). CLI flags override individual keys.
- **Tool bundles as data:** tools are **YAML manifests + bash scripts**
  in bundle directories (`tools/registry`, `tools/edit_anthropic`,
  `tools/review_on_submit_m`, `tools/web_browser`…) that are mixed and
  matched per config; tool docs render directly into the prompt. No
  Python plugin API needed — the most portable tool format in this sweep.
- **History processors (context management as a pipeline):** the history
  is run through processors before *every* model call — e.g.
  `cache_control` (prompt-caching markers, `last_n_messages`) and
  `last_n_observations` (bound old observations) — plus an optional
  summariser. A third reference design for round-1 gap #1, and the most
  *composable* one: Wielder's compactor should be a processor chain, not
  a single summarise call.
- **Runtime separation — SWE-ReX:** the agent loop talks to a runtime
  abstraction (local / Docker / Modal / AWS Fargate) that owns the shell
  session inside the container; the same run parallelises with
  `sweagent run-batch`. Steal the agent↔runtime split so Wielder seats
  can move between local and sandboxed execution without loop changes.
- **Budget & termination discipline:** cost (not step count) as the
  primary budget; per-instance cost limits and timeouts; every
  termination path (cost limit, context overflow, timeout, repeated
  errors) **auto-submits a degraded result instead of crashing**; a
  sentinel string (`<<SWE_AGENT_SUBMISSION>>`) in an observation marks
  completion; a `review_on_submit` bundle runs a quality review pass
  before the patch is finalised.
- **Modes:** `sweagent run` (one issue/task), `sweagent shell`
  (interactive), `sweagent run-batch` (parallel benchmark runs);
  EnIGMA mode re-targets the same loop at CTF/cybersecurity tasks —
  proof the loop is task-agnostic.

Blockers: none. MIT throughout the LICENSE read.

---

## 8. aaif-goose/goose (was block/goose) — Goose

**Licence verdict: Apache-2.0 — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/block/goose/main/LICENSE`
(redirects to the renamed org) — "Apache License, Version 2.0", appendix
"Copyright 2024 Block, Inc.". Checked 2026-10-28.
Activity: pushed **2026-10-28T20:08:16Z**, primary language **Rust**,
not archived — **alive, very active**. Governance note: created by Block,
now under the **Agentic AI Foundation (AAIF) at the Linux Foundation**;
docs moved to goose-docs.ai.

Capabilities to wire into Wielder:

- **Recipes (the standout):** portable **YAML task definitions** —
  title/description, instructions/prompt, extensions to enable,
  parameters, sub-recipes — stored globally or project-locally in
  `.goose/recipes/`, run with `goose run --recipe <file>`, shareable as
  files, and **schedulable** (`goose schedule add --cron "…"`) with
  session history per schedule. This is the closest existing analogue to
  Wielder queue cards as portable artifacts — copy the recipe schema.
- **Extensions = MCP, all the way down:** every capability is an MCP
  server — built-in (Developer: shell + file edit + screen capture;
  Computer Controller; Memory; Tutorial), stdio, HTTP/SSE, or
  Docker-isolated — 70+ available; config in `~/.config/goose/config.yaml`.
  Goose also *hosts* its built-ins as MCP servers for other clients.
- **Hints/instructions:** `.goosehints` project file (and AGENTS.md
  support), `.gooseignore` (plus `.gitignore`) — note its safety default:
  `.env` / `.env.*` files are ignored by default.
- **Subagents + sessions:** parallel subagent execution from recipes,
  persistent named sessions, a Memory extension (project-local + global
  memory stores), custom prompt templates and declarative custom
  providers under the goose config dir.
- **ACP server mode:** `goose acp` runs Goose as an Agent Client Protocol
  agent over stdio (e.g. for Zed) — second data point (with OpenHands)
  that ACP is becoming the standard agent-plug protocol.
- **Surfaces:** native desktop app, CLI, and an API — the `goosed` daemon
  exposes a REST API (OpenAPI) + WebSocket streaming. 15+ model providers
  incl. local Ollama/LM Studio; existing Claude/ChatGPT/Gemini
  subscriptions usable via ACP.
- ⚠️ **Sandbox: none.** Goose runs on the host with the user's full
  permissions by design; its controls are a tool-permission record file
  and ignore lists, not an OS sandbox. Wielder must **not** copy this
  part — pair Goose's recipe/extension patterns with a Codex/Gemini-style
  sandbox + approval layer.

Blockers: none in the licence. The no-sandbox design (above) is a safety
gap to engineer around, not a licence blocker.

---

## 9. langfuse/langfuse — Langfuse (telemetry / evals mirror)

**Licence verdict: SPLIT — MIT Expat for the CORE, proprietary Enterprise
License for the `ee/` parts. NOT uniformly open source.**
LICENSE read: `raw.githubusercontent.com/langfuse/langfuse/main/LICENSE` —
"Copyright (c) 2023-2026 ClickHouse, Inc."; content **outside**
`ee/`, `web/src/ee/`, `worker/src/ee/` and
`packages/shared/src/server/ee/` is under the **"MIT Expat"** license;
content under those directories is governed by `ee/LICENSE`.
Second file read: `raw.githubusercontent.com/langfuse/langfuse/main/ee/LICENSE`
— the **"Langfuse Enterprise license (EE license)"**: use only with a
valid Langfuse Enterprise License / agreement with Langfuse GmbH or
ClickHouse, Inc.; dev/test copying allowed, but *"it is forbidden to
copy, merge, publish, distribute, sublicense, and/or sell the Software"*
without one. Checked 2026-10-28. (GitHub's API consequently reports this
repo's licence as "Other / NOASSERTION" — correct, because it is a split.)
Activity: pushed **2026-10-28T20:23:15Z**, primary language **TypeScript**,
not archived — **alive, very active** (now part of ClickHouse).

Capabilities to wire into Wielder (round-1 gap #3 — telemetry mirror):

- **Wire the client/protocol, not the server code:** the vendorable path
  is Langfuse's **SDKs (Python, JS/TS) and public API (OpenAPI)** from
  the MIT core — Wielder emits traces to a self-hosted Langfuse (core)
  or to Langfuse Cloud (free tier = free proprietary service; label it
  as such, with its caps, never as open source).
- **Trace model worth mirroring locally:** nested traces / observations /
  generations / spans / events with sessions and user ids, token + cost
  tracking per generation, and scores attached to traces — Wielder's own
  ledger should be able to export this exact shape so the mirror is a
  projection, not a second source of truth.
- **Prompt management:** centrally versioned prompts with server/client
  caching (iterate on prompts without redeploying) — a pattern for
  Wielder's prompt/skill registry.
- **Evals:** LLM-as-judge + code evaluators + user feedback + manual
  labelling, **datasets** for test sets/benchmark runs tied to trace data
  — the shape for Wielder's finish-gate scoring records.
- **Self-host shape (core only):** Docker Compose on one VM (web +
  worker + Postgres + ClickHouse + Redis + object storage) — heavy for
  an 8 GB VM; prefer the SDK-to-Cloud mirror or a minimal local exporter
  first, and benchmark before self-hosting the full stack.

🚫 **Blockers — hard:** do **not** vendor, copy or adapt anything under
`ee/`, `web/src/ee/`, `worker/src/ee/` or `packages/shared/src/server/ee/`
into Wielder's tree. The MIT grant covers the rest of the repo only.
Keep an explicit allow-list (core paths) / deny-list (those four `ee`
trees) in the landing manifest.

---

## 10. ollama/ollama — Ollama (local model seat runtime)

**Licence verdict: MIT — OPEN SOURCE (the runtime; NOT the models).**
LICENSE read: `raw.githubusercontent.com/ollama/ollama/main/LICENSE` —
"MIT License", "Copyright (c) Ollama". Checked 2026-10-28.
Activity: pushed **2026-10-28T19:20:30Z**, primary language **Go**,
not archived — **alive, very active**.
⚠️ Scope: this MIT grant covers the Ollama **server/runner code only**.
Every model in the library carries **its own licence** (see §12) — never
inherit "MIT" onto a model.

Capabilities to wire into Wielder:

- **Local seat contract:** a localhost daemon on `:11434` with a small
  REST API — `POST /api/chat`, `POST /api/generate`, `POST /api/embed`,
  model management (`/api/pull`, `/api/tags`, `/api/ps`) — plus official
  Python and JS client libraries. Wielder's local seat should speak
  exactly this API so any Ollama-served model is a drop-in seat.
- **Modelfile:** declarative model definitions (base model, `SYSTEM`,
  `TEMPLATE`, `PARAMETER` e.g. `num_ctx`, stop tokens) — the pattern for
  packaging a Wielder "seat profile" (system prompt + params) as a file.
- **`ollama launch` integrations:** one-command wiring of the local
  server into external agents (docs list Claude Code, Codex, Copilot CLI,
  OpenCode and others) — evidence the daemon-as-seat pattern is now the
  industry default for local models.
- **Runtime facts for the VM seat:** llama.cpp backend; GGUF quantised
  models run CPU-only; models load/unload on demand (keep-alive), so an
  advisory seat can share RAM with the rest of the VM if only one model
  is resident at a time (see §12 for sizes).

Blockers: none for the runtime. Model licences are per-model (§12).

---

## 11. microsoft/playwright — Playwright (browser seat)

**Licence verdict: Apache-2.0 — OPEN SOURCE.**
LICENSE read: `raw.githubusercontent.com/microsoft/playwright/main/LICENSE`
— "Apache License, Version 2.0", appendix "Portions Copyright (c)
Microsoft Corporation. Portions Copyright 2017 Google Inc.".
Checked 2026-10-28.
Activity: pushed **2026-10-28T18:46:25Z**, primary language **TypeScript**,
not archived — **alive, very active**.
Note: the Apache grant covers Playwright's code; the browser binaries it
downloads (Chromium / Firefox / WebKit builds) are separate artifacts
under those projects' own terms — check them separately if binaries are
ever redistributed, rather than assuming this licence covers them.

Capabilities to wire into Wielder (the browser seat):

- **Playwright MCP (the seat form factor):** `@playwright/mcp` gives an
  agent full browser control over MCP using **structured accessibility
  snapshots** — the page as an a11y tree with stable element refs
  (`e5`, `e10`) to click/type against — *no vision model or screenshots
  required*. Deterministic, cheap in tokens, and the right primary
  browser seat for Wielder.
- **Playwright CLI (token-cheaper alternative):** `@playwright/cli` +
  `playwright-cli open/type/press/screenshot` commands designed for
  coding agents (avoids loading large tool schemas/a11y trees into
  context), `playwright-cli install --skills` installs agent skills for
  it, and `playwright-cli show` opens a live dashboard of browser
  sessions with screencast preview and take-over — a ready-made
  session-monitoring UI pattern.
- **Library API:** one API drives Chromium, Firefox and WebKit
  (headless or headed, device emulation, network interception/routing,
  storage-state save/reuse for authenticated sessions —
  `storageState({path: 'auth.json'})`).
- **Test runner + evidence:** Playwright Test with per-test browser
  context isolation, auto-waiting, web-first retrying assertions,
  parallelism, and **tracing** — trace.zip with DOM snapshots, network,
  console and screenshots at every step, inspectable in Trace Viewer.
  Wielder's browser seat should emit traces the same way so a browser
  run is auditable after the fact.
- **Surfaces:** Test, CLI, MCP server, library (JS/TS + Python/.NET/Java
  ports), VS Code extension with CodeGen recording and locator picking.

Blockers: none in the licence (browser-binary note above).

---

## 12. Local advisory-seat model — Qwen2.5-Coder on Ollama

**Pick: `qwen2.5-coder:7b` (Ollama default tag) — Apache-2.0.**
**Licence verdict for the 7B: Apache-2.0 — OPEN SOURCE / open weights.**
**Licence verdict for the 3B: Qwen Research License — FREE-BUT-RESTRICTED
(research terms; do NOT use as the shipped/default seat).**

What was actually read, 2026-10-28:

- Ollama library page `ollama.com/library/qwen2.5-coder` and the per-tag
  pages for `:7b` and `:3b` — the text extraction of those pages does
  **not** render a licence field, so the licence was **not** taken from
  Ollama's page alone (recorded honestly rather than guessed).
- Ollama tags listing `ollama.com/library/qwen2.5-coder/tags` — sizes and
  context, read directly: `:7b` (= `latest`) **4.7 GB, 32K context**;
  `:3b` 1.9 GB, 32K; `:1.5b` 986 MB, 32K; `:14b` 9.0 GB (too big for this
  VM class).
- Licence by size, from Qwen's official Qwen2.5-Coder series table
  (Alibaba Cloud / Qwen blog, read via search 2026-10-28): 0.5B, 1.5B,
  **7B, 14B, 32B = Apache 2.0**; **3B = "Qwen Research"** — the 3B is the
  lone carve-out in the family. The Hugging Face model cards for
  `Qwen/Qwen2.5-Coder-7B-Instruct` and `Qwen/Qwen2.5-Coder-3B-Instruct`
  were also opened in this sweep; their extracted text likewise did not
  render the licence metadata field, so the series table is the cited
  source. **Action for the build team:** before the model is staged,
  re-read the licence file inside the exact HF repo / Ollama blob being
  staged and pin that reading in the manifest — do not rely on this
  sweep's table alone at staging time.

Fit for an 8 GB-RAM CPU-only VM (advisory seat):

- `qwen2.5-coder:7b` at 4.7 GB on disk (Q4-class default quant) leaves
  headroom in 8 GB **only if it is the sole resident model** and the seat
  is used advisory-style (summaries, second opinions, small edits,
  compaction drafts) — CPU inference will be slow; cap `num_ctx` well
  below the 32K maximum to keep KV-cache RAM down.
- Fallback if RAM pressure bites: `qwen2.5-coder:1.5b` (986 MB,
  Apache-2.0) — much weaker, but safe to keep resident.
- **Avoid `qwen2.5-coder:3b` despite its attractive 1.9 GB size** — its
  Qwen Research licence is the restricted bucket; using it as the
  default seat would mislabel a restricted model as open source, which
  the licence-honesty law forbids.

---

## Cross-cutting takeaways for the build team

1. **No AGPL was found in any LICENSE file read in this sweep.** The only
   licence blockers are: Langfuse's four `ee/` trees (proprietary
   Enterprise License, §9), Cline's JetBrains plugin (reported not
   open-sourced, §5), and Qwen2.5-Coder-**3B**'s Research licence (§12).
   Everything else is Apache-2.0 or MIT and vendorable with notices kept.
2. **Convergent patterns worth standardising in Wielder (multiple
   independent implementations agree):**
   - Instructions file hierarchy: `AGENTS.md` (Codex, Goose) /
     `GEMINI.md` (Gemini) / `.clinerules` (Cline) / microagents
     (OpenHands) / `.continue/rules/` (Continue) — pick **AGENTS.md +
     SKILL.md folders** as Wielder's two formats and write importers for
     the others.
   - Context compaction as a *pipeline*: Gemini `/compress` snapshot
     schema + OpenHands condenser (persistent event log underneath) +
     SWE-agent history processors (chainable, run before every call).
   - Checkpoint = files + conversation together, via shadow git:
     Gemini `/restore`, Cline checkpoints, Aider auto-commits.
   - Safety = sandbox axis × approval axis, kept separate (Codex),
     with granular per-action auto-approve categories (Cline).
   - Tools as data: MCP everywhere; tool *bundles* as YAML+scripts
     (SWE-agent); capabilities as shareable YAML artifacts — Goose
     **recipes** and Continue **blocks**.
   - ACP is emerging as the agent-plug protocol (OpenHands Canvas,
     Goose `acp`) — Wielder seats should speak it.
   - Browser seat = accessibility-snapshot MCP, not screenshots
     (Playwright MCP); local seat = Ollama's `:11434` API (§10–12).
3. **Dead / superseded — patterns only, no live dependency:** Continue
   (final 2.0.0, repo read-only), SWE-agent (team moved to
   mini-SWE-agent). **Slowed:** Aider (last push 2026-05-22).
4. **Client-open ≠ seat-free:** Gemini CLI and Codex are Apache-2.0
   *code* whose normal seats are paid proprietary services. Keep the
   code licence and the seat licence as two separate lines in every
   Wielder manifest, per the licence-honesty law.
