# GROK (xAI) — FUNCTIONAL TEARDOWN

**What this is.** A functional teardown of xAI's Grok agent, built the
only way this workspace ever builds one: from **public sources only** —
xAI's own published documentation first, reputable secondary coverage
second, everything else labelled a gap. Researched 2026-10-28.

**What this is not.** Grok's current models are closed. Their weights,
architecture, training data and system prompts are not public and
cannot be decrypted, extracted or decompiled — by us or anyone.
"100%" in the owner's order means 100% of what is publicly documented,
with the undocumented remainder listed as GAP (§9), never filled in
with guesses. Nothing proprietary is copied into this repo: behaviour
is described in our own words, and the only xAI artefact in the kit is
an API client written against the public API contract.

**Legal frame, stated plainly.** xAI's terms prohibit reverse
engineering the *service* and distilling model behaviour. This kit
does neither: it reads published documentation, and it calls the API
the documented way, with the owner's own key, if and when he adds one.
The one genuinely open xAI artefact is Grok-1 (below).

Sources are cited inline as [S#] and listed in §10.

---

## 1. What "Grok" names — five surfaces, three programmable

"Grok" is a family name, not one product. The surfaces that matter
here:

| Surface | What it is | Programmable? |
|---|---|---|
| **xAI API** (api.x.ai) | The developer platform: chat/reasoning models, server-side agent tools, image/video/voice APIs | **Yes** — this is what the kit wires (§2–§6) |
| **Grok Build** | xAI's official terminal coding agent (CLI) | **Yes** — headless mode, JSON output, agent protocol over stdio (§7) |
| **grok.com / Grok in X** | The consumer assistant (chat, DeepSearch, voice, Imagine media generation) | No developer API; behaviour documented only at feature level |
| **Grok Bot** | An always-on "teammate" product launched 2026-08-11 | **No public API, webhook or programmatic surface** as of the coverage [S11] — GAP for wiring |
| **Grok-1** (2024) | The one open release: a 314B-parameter mixture-of-experts model's weights + architecture, published under **Apache-2.0** | Weights are public; the hosted models are not this model |

The owner's phrase "Grok bot" most plausibly points at the agent
behaviour he has used — the assistant that searches first, reasons,
calls tools and answers directly. Every programmable part of that
behaviour lives in the API and Grok Build, and that is what this
teardown covers in depth.

## 2. Model lineup (agent-relevant), per xAI's own docs

From the official models + pricing pages [S1][S2] (prices per 1M
tokens, short-context tier; prompts ≥200k tokens bill at roughly
double — "long context" rates — on all listed models):

| Model | Context | Input / Output | Notes (as documented) |
|---|---|---|---|
| `grok-4.7` | 500k | $2.00 / $6.00 | Flagship "for code and everything else"; configurable reasoning; knowledge cutoff May 2026 |
| `grok-4.6` | 500k | $2.00 / $6.00 | Reasoning effort incl. `xhigh` |
| `grok-4.5` | 500k | $2.00 / $6.00 | Reasoning low/medium/high |
| `grok-4.3` | 1M | $1.25 / $2.50 | Configurable reasoning; the kit's default seat model |
| `grok-4.20-multi-agent-0309` | 1M | $1.25 / $2.50 | Multi-agent model: several agents collaborate per request (§5) |
| `grok-4.20-0309-reasoning` / `-non-reasoning` | 1M | $1.25 / $2.50 | Fixed-mode variants |
| `grok-build-0.1` | 256k | $1.00 / $2.00 | The coding-agent model behind Grok Build |
| `grok-imagine-*` | — | per image / per second | Image + video generation/editing APIs (media lane, not this kit) |
| `grok-voice-*` | — | per minute / per char | Speech-to-speech, STT, TTS APIs (not this kit) |

Naming rules [S1]: `<model>` aliases to the latest stable,
`<model>-latest` to the newest, `<model>-<date>` pins a snapshot.
Older aliases are retired over time — a client must resolve models
from the docs/console, not from memory (secondary trackers note
retired grok-4/grok-3 aliases redirecting to current models [S12]).

Batch API: 20% discount on the listed text models, ~24h turnaround,
no rate-limit consumption [S2]. Priority processing: 2× price for
lower latency on Chat Completions / Responses [S2]. Prompt caching is
automatic and cached input bills at a fraction of input price [S2].

## 3. API compatibility

- Base URL `https://api.x.ai/v1`; a US regional endpoint
  `https://us.api.x.ai/v1` runs inference in the US at 1.1× rates [S2].
- The REST API is **OpenAI-compatible**: the OpenAI SDK works by
  pointing `base_url` at api.x.ai [S12][S13]; xAI also ships its own
  SDKs (Python `xai_sdk` over gRPC, Vercel AI SDK provider).
- Two conversation surfaces: **Chat Completions** (OpenAI-shaped
  messages) and the **Responses API** (item-based output,
  `previous_response_id` chaining, server-side state options). The
  agent tools (§4) are fully supported on Responses; tool names also
  work per the pricing page note [S2].
- Streaming is SSE; documented xAI quirk: with streaming, a function
  call arrives **whole in a single chunk**, not split across chunks
  [S3].
- Chat-model details [S1]: no role-order limitation (system/user/
  assistant may be mixed in any sequence); image inputs accepted
  (jpg/png, ≤20 MiB each); `logprobs` unsupported on grok-4.20+ and
  silently ignored.

## 4. Tool calling — the agent core

Two tool categories [S4]:

**A. Client function calling.** You define tools; the model requests
calls; you execute locally and return results.

- Chat Completions shape: `{"type": "function", "function": {"name",
  "description", "parameters"}}` where `parameters` is JSON Schema;
  the Responses shape flattens the same fields to the top level [S3].
- The `parameters` root must be an object (or a oneOf/anyOf of
  objects); anything else is rejected with a 400 naming the tool [S3].
- `tool_choice`: `"auto"` (default) / `"required"` / `"none"` / a
  specific named tool [S3].
- **Parallel tool calls are on by default.** Protocol rule: execute
  all calls in a response, then return **all results in one follow-up
  request** — one follow-up per call is a protocol violation [S3][S13].
- Up to 350 tools per request [S3]. Unknown-function results are
  returned to the model as tool outputs rather than crashing the loop
  (the docs' own example pattern) [S3].
- Pydantic models are a documented way to author parameter schemas
  (`model_json_schema()`) [S3] — the same validation library Wielder
  already pins.

**B. Server-side (built-in) tools** — executed on xAI's
infrastructure, billed per invocation on top of tokens [S2][S4]:

| Tool | Does | Price |
|---|---|---|
| `web_search` | Live web search + page browsing; domain allow/exclude filters (≤5 each, mutually exclusive); optional image understanding / image search | $5 / 1k calls |
| `x_search` | Live X posts/profiles/threads; handle allowlist, date range, media understanding | $5 / 1k posts, $10 / 1k profiles |
| `code_execution` (`code_interpreter`) | Sandboxed Python execution | $5 / 1k calls |
| `collections_search` (`file_search`) | RAG over uploaded document collections | $2.50 / 1k calls |
| `attachment_search` | Search files attached to messages | $5 / 1k calls |
| `image_generation` | Generate/edit images in conversation | Imagine rates |
| `view_image` / `view_x_video` | Inspect media found by the search tools | token-based |
| **Remote MCP tools** | Connect your own MCP servers; xAI manages the connection and tool discovery | token-based |

Answers built from search come back with **citations** (source URLs)
[S4][S5]. The legacy standalone "Live Search" API (`search_parameters`)
was retired 2026-01-12 (HTTP 410) and replaced by these agent tools —
do not wire the old field [S14].

## 5. Reasoning and multi-agent behaviour

- Reasoning models think before answering; the trace is **not**
  exposed as text — usage exposes `reasoning_tokens`, and the
  Responses API can return **encrypted** reasoning content to carry
  context across turns without revealing it [S6]. grok-4.7 returns
  reasoning *summaries* that can be streamed alongside the answer [S6].
- `reasoning_effort`: `low` / `medium` / `high` (default) / `xhigh`
  (grok-4.6+; treated as `high` on models without it). On
  grok-4.5–4.7 reasoning **cannot be disabled** [S6].
- Documented incompatibility: `presence_penalty`, `frequency_penalty`
  and `stop` are rejected on reasoning models [S6].
- **Multi-agent:** on `grok-4.20-multi-agent`, the same effort
  parameter controls **how many agents collaborate** (4 or 16)
  instead of reasoning depth [S6]. The consumer line of the same idea
  is Grok Heavy (2025): multiple agents work a problem in parallel
  and weigh hypotheses against each other [S15]. Secondary write-ups
  describe specialised agent roles in the 4.20 system; xAI's own docs
  confirm the collaboration and the agent-count control, not a role
  roster — the roster is GAP (§9).
- Structured outputs: schema-constrained JSON via `response_format`
  (`json_schema`) is supported [S13]; a production guide citing the
  docs records the guaranteed-subset limits (e.g. maxLength ≤ 2048,
  maxItems ≤ 256, maxProperties ≤ 64) [S16] — treat anything past the
  guaranteed subset as model behaviour, and validate anyway.

## 6. Persona and memory, as documented

What is public about how Grok *behaves* (feature level, in our words):

- **Stated design goal:** xAI markets Grok as "maximally
  truth-seeking" — built to answer directly, reason from first
  principles, and not defer to political correctness [S17]. Its
  public persona is deliberately witty and irreverent, a tone xAI
  has associated with the Hitchhiker's Guide / JARVIS inspiration
  since launch [S17].
- **Search-first answering:** the consumer agent's signature move
  since Grok 3 is DeepSearch — browse web + X, then answer with what
  was found [S15]. In the API this is not a personality trait but a
  mechanism: the server-side search tools of §4B, with citations.
- **Think modes:** user-facing reasoning depth controls in the
  consumer product correspond to the API's `reasoning_effort` (§5).
- **Memory:** grok.com offers conversation history and personalised
  memory features at product level; **no memory API is documented** —
  an integrating system keeps its own memory (Wielder: LanceDB).
  Internals: GAP.
- **Identity/safety floor is not user-reprogrammable:** system
  prompts steer style and viewpoint, but cannot switch off the
  provider's safety layer or rewrite the model's core identity —
  observed behaviour consistent with the published AUP [S18].

## 7. Grok Build — the coding agent (secondary, from xAI pages as re-read by reviewers)

xAI's official terminal coding agent, announced 2026-05-25 [S19][S20]:

- Local-first CLI: reads/edits the codebase, runs commands; TUI,
  headless (`-p`) for scripts/CI, and an ACP agent mode over stdio.
- **Plan mode:** edits blocked until the user approves/comments/
  rewrites the plan. **Subagents:** parallel agents, including in
  their own git worktrees; workflows fan out across many agents.
- Reads `AGENTS.md`; supports skills (with a command to capture a
  session as a skill), plugins + marketplaces, hooks, and MCP
  servers — the same extension vocabulary Wielder already uses.
- **`/goal` mode** (2026-06): hand the agent one objective; it plans,
  keeps a visible checklist, executes and **verifies** (code review,
  page inspection, script execution) until done; steerable with
  status/pause/resume/clear [S21].
- Access: subscription-gated (SuperGrok / X Premium tiers; the
  `grok-build-0.1` model is also on the API [S2]). One secondary
  guide claims the CLI was open-sourced under Apache-2.0 at its 1.0
  release [S22] — **single-source, not verified against a licence
  file in this pass: treat as unconfirmed** before relying on it.

## 8. Safety / moderation surface, as documented

- An **Acceptable Use Policy** governs the service (prohibited:
  illegal/harmful content, CSAM and exploitation of minors,
  non-consensual intimate imagery, privacy and IP violations) [S18].
- The pricing page documents a **usage-guideline violation fee**
  ($0.05/request) for violations caught before generation on the
  Responses API — i.e. pre-generation screening exists and is billed
  [S2].
- xAI's representations to a regulator describe **input and output
  filtering with classifiers**, content moderation, and CSAM hash-list
  matching [S23]. Classifier internals, thresholds and the full
  refusal taxonomy are not published — GAP.
- Enterprise terms additionally bar using outputs to build competing
  services and bar probing/benchmarking outside the agreement [S24] —
  consumer/API terms govern this kit's use; the kit only calls the
  API as documented.

## 9. GAP list — what is NOT public (labelled, never faked)

1. **Weights / architecture / training** of every current model
   (Grok-1, Apache-2.0, is the sole exception).
2. **System prompts** of grok.com / Grok in X / Grok Bot. (Prompt
   texts have leaked in the past; a leak is not documentation, is
   not reproduced here, and is not a stable contract.)
3. **Grok Bot internals** — no public API or harness documentation.
4. **Multi-agent orchestration protocol** in grok-4.20-multi-agent /
   Heavy — agent count and collaboration are documented; the
   message protocol and any role roster are not.
5. **Moderation internals** — classifiers, thresholds, appeal paths
   beyond the AUP's statements.
6. **DeepSearch's ranking/retrieval internals** — behaviour is
   observable; the pipeline is not documented.
7. **Consumer memory internals** — what is stored, for how long, and
   how it is injected is not documented.
8. **Fine-tuning** — not offered for current models [S25].

## 10. Sources

- [S1] xAI docs — Models & pricing: https://docs.x.ai/developers/models
- [S2] xAI docs — API pricing (tools, batch, priority, endpoints, violation fee): https://docs.x.ai/developers/pricing
- [S3] xAI docs — Function calling: https://docs.x.ai/developers/tools/function-calling
- [S4] xAI docs — Tools overview: https://docs.x.ai/developers/tools/overview
- [S5] xAI docs — Web Search tool: https://docs.x.ai/developers/tools/web-search
- [S6] xAI docs — Reasoning: https://docs.x.ai/developers/model-capabilities/text/reasoning
- [S11] Continuum — Grok Bot vs Grok Build (product map, primary source per row): https://continuumcode.ai/guides/grok-bot-vs-grok-build/
- [S12] Strands Agents — xAI provider notes (aliases, server-side tools): https://strandsagents.com/latest/documentation/docs/community/model-providers/xai/
- [S13] LiteLLM — xAI provider (OpenAI compatibility, structured outputs, XAI_API_KEY): https://docs.litellm.ai/docs/providers/xai
- [S14] FixAEO — Live Search retirement + Agent Tools API: https://fixaeo.com/blogs/does-grok-search-the-web/
- [S15] Taskade — xAI/Grok history (Grok 3 DeepSearch/Think, Grok 4 Heavy multi-agent): https://www.taskade.com/blog/xai-grok-history
- [S16] DVNC — Grok API production-agents guide (structured-output limits): https://dvnc.dev/blog/grok-api-build-guide-production-agents
- [S17] Coverage of xAI's "maximally truth-seeking" framing and persona: https://www.datacenterdynamics.com/en/news/xai-raises-another-6bn-including-from-nvidia-and-amd/ and https://front9founder.substack.com/p/grok-the-honest-ai
- [S18] xAI Acceptable Use Policy (as analysed): https://jlellis.net/blog/privacy-and-content-safety-in-grok-what-lawyers-need-to-know/
- [S19] EveryDev — Grok Build CLI (features from xAI's Build docs): https://www.everydev.ai/tools/grok-build-cli
- [S20] DevelopersDigest — Grok Build developer guide (xAI pages re-read): https://www.developersdigest.tech/blog/grok-build-developer-guide-2026
- [S21] MarkTechPost — /goal in Grok Build: https://www.marktechpost.com/2026/06/22/xai-launches-goal-in-grok-build-adding-long-running-autonomous-execution-with-built-in-verification-for-multi-step-coding-tasks/
- [S22] Codersera — Grok Build guide (open-source claim, unverified): https://codersera.com/blog/xai-grok-build-skills-connectors-guide-2026/
- [S23] Privacy Commissioner of Canada — PIPEDA findings quoting xAI's safeguard representations: https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2026/pipeda-2026-004/
- [S24] xAI Enterprise Terms of Service (restrictions): https://x.ai/legal/terms-of-service-enterprise/previous-2025-06-09
- [S25] Grok 4 model card summary (no fine-tuning): https://www.prompthub.us/models/grok-4

*All xAI-doc facts above were read on docs.x.ai on 2026-10-28.
Model lineups and prices move fast; re-check [S1]/[S2] before
relying on any figure.*
