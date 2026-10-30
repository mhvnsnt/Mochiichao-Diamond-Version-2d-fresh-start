# Wielder Parity Round 2 — Proprietary / Hosted Products Sweep

**Scope:** Cursor, Windsurf (Cascade), Devin by Cognition, GitHub Copilot (VS Code agent mode + GitHub coding/cloud agent), Google Jules, Sourcegraph Cody, Zed Agent Panel, Gemini surfaces (AI Studio, Gemini App, Gemini Code Assist agent mode), ChatGPT surfaces (Agent Mode / Work, Deep Research, Tasks, Canvas, Projects).

**Method:** Public documentation only — official docs, help pages, changelogs, product pages fetched as page text on 2026-10-28. No binaries, no decompiling, no account scraping. Where official docs publish **no spec** for an interface feature, this file says so explicitly (`NO SPEC PUBLISHED`) rather than inferring it. Secondary guides are only used to corroborate an official page and are flagged as such.

**Wielder context:** Wielder's interfaces are a Chainlit chat web UI and a CLI. Interface comparison therefore focuses on: run/trace timelines, tool-call inspection, diff review with approve/reject, file/artifact previews, plan/task views, session resume/branching, queue/background-run visibility, checkpoint/rewind, rules/instructions files, codebase context controls (@-mentions, context pickers).

**Key sources (official, fetched):**
- Cursor: `cursor.com/docs/agent/overview` (+ rules/indexing/background-agent doc family it links to)
- Windsurf/Devin Desktop: `docs.devin.ai/windsurf/*` changelog + Cascade docs mirror, `docs.devin.ai/work-with-devin/*`
- Devin: `docs.devin.ai/work-with-devin/devin-session-tools`, `docs.devin.ai/work-with-devin/advanced-capabilities`, `docs.devin.ai/enterprise/deployment/overview`, `docs.devin.ai/release-notes/overview`
- Copilot / VS Code: `code.visualstudio.com/docs/copilot/chat/chat-planning`, `code.visualstudio.com/docs/agents/best-practices`, `docs.github.com/en/copilot/concepts/agents/coding-agent/agent-management`, `docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/track-copilot-sessions`
- Jules: `jules.google.com`, `jules.google/docs/environment.md`, `jules.google/docs/repo.md`, `jules.google/docs/llms-full.txt`
- Cody: `sourcegraph.com/docs/cody/*` — chat, prompts, quickstart, clients (VS Code / JetBrains / web / CLI)
- Zed: `zed.dev/docs/ai/agent-panel`, `zed.dev/docs/ai/zed-agent`, `zed.dev/docs/ai/overview`
- Gemini Code Assist: `cloud.google.com/gemini/docs/codeassist/agent-mode`, `cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer`, `cloud.google.com/gemini/docs/codeassist/gemini-cli`
- Gemini App: `support.google.com/gemini/answer/15719111` (Deep Research), Gemini Canvas help family
- AI Studio: `ai.google.dev/gemini-api/docs/ai-studio-quickstart`
- ChatGPT: `help.openai.com` agent / deep research / canvas / tasks / projects article family, `openai.com` product posts (as summarised in help-centre cross-refs; note the Oct 2026 rename of Agent Mode → ChatGPT Work, see §9 caveat)

---

## 1. Cursor

Editor: VS Code fork. Surfaces: IDE Agent pane (`Cmd/Ctrl+I`), Agents Window (multi-repo / multi-environment), CLI (`agent`), `cursor.com/agents` web + mobile for cloud agents.

### A) Agent capabilities (doc-cited)

- **Autonomous multi-step agent, no tool-call limit.** Docs: "Agent is Cursor's assistant that can complete complex coding tasks independently, run terminal commands, and edit code" and "There is no limit on the number of tool calls Agent can make during a task." Three components are named: Instructions (system prompt + rules), Tools, Model. [Cursor Agent Overview]
- **Tool set:** file search by name / directory listing / grep-pattern search; file read (including image files `.png/.jpg/.gif/.webp/.svg` into vision context); file edit (suggest + auto-apply); terminal execution with configurable default profile; web search (agent generates queries); rules retrieval by type/description; browser control (navigate, interact, screenshot, verify visual changes); image generation (saved to `assets/` by default, shown inline); clarifying questions mid-task — agent keeps reading/editing/running while waiting for the answer. [Overview]
- **Project / coordinator pattern:** For a larger body of work, a "Project" is a coordinator agent that plans the work and delegates to other agents. Also `/goal` gives a long-lived objective worked until complete; `/loop` runs a prompt/skill on a recurring/variable interval (agent chooses wake time if unspecified); pairing with Custom Modes (playbooks). [Overview]
- **Composer lineage:** The multi-file editor formerly branded Composer is now the Agent surface; own frontier model family (Composer 2.x) is offered alongside third-party frontier models, tuned per-model by Cursor. Product pages describe parallel subagents (tens to hundreds) and self-checking before results reach the user. Treat the "10s to 100s" figure as product-page marketing language, not a docs spec.
- **Codebase indexing:** Semantic indexing of the workspace from the opened root; status shown in settings / status bar; `.cursorignore` (on top of `.gitignore`) excludes files from the index. `@codebase` semantic search depends on the completed index. Docs describe Merkle-tree incremental re-indexing in the indexing doc family. [Cursor indexing docs; corroborated in rules/context guides reviewed 2026-10-15/28]
- **Tab completion (documented behaviour):** A separate specialised model ("Tab"), not the chat model. Documented to: suggest multi-line edits, not just the next token; predict the *next edit location* and offer a Tab-jump to it, including cross-file jumps via a portal window; auto-add missing imports (TypeScript/Python, beta in earlier docs); use recent edits, recent files, open tabs and linter errors as context; render as ghost text for additions or a diff popup for modifications; accept whole suggestion with Tab or word-by-word with `Cmd/Ctrl+Right`. [Cursor Tab docs]
- **Cloud / Background Agents (formerly "Background Agents"):** Isolated cloud VMs with a full dev environment, internet access and package installs; plan, edit, run/test, iterate asynchronously; start from IDE, web or mobile; hand back a branch/PR; hand off between cloud and local editor; run terminal commands without per-command approval in the cloud environment (docs warn to connect only repos you are comfortable running there). Agents Window manages local + cloud + remote-SSH agents in one sidebar. [Cursor cloud-agents docs; Overview queue/steer notes]
- **Bugbot / Automations (product-tier features named in docs/changelog):** Automated PR review; automations triggered by GitHub webhooks / Slack messages. Plan-gated.
- **Sandbox for local terminal:** Sandboxed agent runs freely inside a controlled environment and asks only to leave it (e.g. network); platform implementation differs (macOS Seatbelt, Linux Landlock+seccomp, Windows via WSL2) per Feb 2026 engineering post linked from docs.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | Chat timeline is the trace: tool calls, edits and checkpoints are inline in the conversation. Overview documents clicking a checkpoint *in the chat timeline* to preview state. No separate published spec for a standalone "trace viewer" page distinct from chat/agents window. Agents Window gives a sidebar list of agents across repos/environments. |
| Tool-call inspection | Tool invocations are shown in-chat as they run (search, edit, terminal with output). Ask/steer does not hide them. Docs do not publish a structured tool-call inspector schema (inputs/outputs JSON view) — **NO SPEC PUBLISHED** for a dedicated inspector beyond the in-chat rendering. |
| Diff review approve/reject | "Review changes" opens the full diff; accept/reject **per file and per hunk/line** is the documented workflow in tutorials linked from docs and in the Agents Window review flow. Inline `Cmd/Ctrl+K` edits show green/red inline diff with accept (`Ctrl+Enter`) / reject (`Esc`). |
| File/artifact previews | Edited files open in editor; generated images shown inline in chat; browser tool shows screenshots inline; cloud-agent work previews via the linked PR/branch. |
| Plan/task view | Project coordinator plan + delegation is a docs feature; queue is a first-class view (see below). A standalone persistent `plan.md`-style artefact is **not** the Cursor pattern (contrast Windsurf Planning Mode). In-chat todo-style progress is model-rendered, not a separately specced widget in the Overview — **partial / NO SEPARATE SPEC**. |
| Session resume/branching | Past transcripts are searchable from Agents Window (`Cmd/Ctrl+K` palette, local search index); CLI supports `agent --resume <chat_id>`. **Side chats** (`/side` or `/btw`): durable branched conversation that uses the parent thread as hidden reference context, keeps its own transcript, and can be @-mentioned back into the main thread. Editing/re-submitting a prior user message as a fork is not described in the Overview — **NO SPEC PUBLISHED** for message-fork branching; side chat is the documented branching primitive. |
| Queue / background visibility | **Best-documented queue in the set.** While agent works: `Enter` queues a message (waits for current task), `Cmd/Ctrl+Enter` sends immediately (attached to tool results), "Send now" / double-Enter steers at the next tool call without cutting off in-flight work; queued messages appear in order below the active task and can be **drag-reordered**; CLI: Enter steers at a safe boundary, second Enter interrupts. Cloud agents are listed/managed at `cursor.com/agents` and in Agents Window. |
| Checkpoint / rewind | **Automatic checkpoints** before significant changes, capturing all modified files. Click checkpoint in timeline to preview, then Restore; also Restore Checkpoint button on prior requests / hover `+`. Restoring reverts **files only**, not conversation messages. Checkpoints are local, session-scoped, separate from Git, do **not** include manual edits, and are auto-cleaned — docs explicitly warn to commit milestones in Git. |
| Rules / instructions files | Four layers: **Project Rules** `.cursor/rules/*.mdc` (Markdown + YAML frontmatter: `description`, `globs`, `alwaysApply`; modes: always / auto-attached by glob / agent-requested by description / manual @-mention; nested `.cursor/rules/` per subdirectory); **User Rules** (global, in settings); **Team Rules** (org dashboard, also feed Security Review/Bugbot); **`AGENTS.md`** at root (plain Markdown alternative/companion, also nested). Legacy `.cursorrules` single file is deprecated. Rules apply to Agent chat, not to Tab or inline edit per the customisation docs. Skills (`.cursor/skills/`), subagents (`.cursor/agents/`), hooks (`.cursor/hooks.json`), MCP (`.cursor/mcp.json`) sit alongside rules. |
| Codebase context controls | **@-mentions** are the core control: `@Files`, `@Folders`, `@Codebase` (semantic search), `@Docs` (indexed external docs), `@Web`, `@Commit`/git diff, `@Terminal`, past chats, rules, browser. `.cursorignore` controls indexing exclusion. Context is assembled from prompt + attached/open files + index + rules + history + tools, per context docs. |

---

## 2. Windsurf — Cascade (now in the Devin family / "Devin Desktop")

Editor: VS Code fork (Codeium → Cognition). Note for provenance: Cognition acquired Windsurf in July 2025; current docs live under `docs.devin.ai/windsurf/*`. New conversations in the desktop product are migrating from "Cascade" to "Devin Local" per current docs — Cascade conversations remain accessible. Findings below are the documented Cascade behaviour.

### A) Agent capabilities

- **Cascade agent:** Answers codebase questions, edits files, runs tools/terminal, iterates on errors (incl. automatic linter run + auto-fix edit on its own generated code). Modes: **Chat Mode** (read-only: questions, explanations, no file changes) vs **Write/Code Mode** (direct generation/editing) vs full **Agent** operation (edit + run commands + install packages + iterate until done) — mode naming varies slightly across doc versions; the read-only vs write split is consistent.
- **Flows / multi-step reasoning:** Cascade breaks a task into a step chain ("Flows"); vendor/guide descriptions state each step is explainable and reversible. Planning example in docs: reads route structure, checks schema, creates handler matching conventions, generates migration, wires services.
- **Planning Mode (Pro/Teams/Enterprise; shipped July 17 2025 per changelog):** Cascade creates a persistent, **user-editable `plan.md`** before acting, refers to it and updates it as tasks complete. Toggle in the Cascade panel.
- **Workflows:** Saved, reusable step-by-step prompts for recurring tasks, stored in `.windsurf/workflows/`, invoked by slash command; Cascade can help author/edit them. [Changelog 2025-07-17]
- **Real-time awareness:** Cascade is aware of the user's live editor actions; user can say "Continue" without re-supplying context. [Cascade docs]
- **Terminal execution levels:** Disabled (approve each) / Allowlist Only / Auto / **Turbo** (auto-run except deny-list matches, which require approval). Allow/deny lists in settings. MCP tool calls cost one flow-action credit each regardless of outcome (changelog note).
- **Supercomplete / Tab:** Multi-line, project-context completions (function-level), distinct from Cascade chat.
- **Previews & App Deploys:** Live Preview spins up a dev server inside the IDE; App Deploys (beta) publishes a web project via Netlify to a public URL (docs warn: preview-grade, claim in provider account, no secrets/private data). Not available under Devin Local.
- **Voice input:** Speech-to-text dictation into Cascade. [Cascade docs]
- **Models:** Multi-model picker (own SWE-1 / SWE-1.5 family + third-party frontier models); Arena Mode for blind side-by-side model comparison is described in product/guides material.
- **MCP:** One-click MCP server install from settings list; Cascade can call external tools/APIs (e.g. Stripe, database, observability servers).

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | Cascade panel shows the step flow as it executes, with a **table of contents** of steps/prompts that doubles as navigation for reverts (see checkpoints). Teams analytics dashboard (org level) reports messages, total tool calls, model usage. No published spec for a separate per-tool-call JSON inspector — **NO SPEC PUBLISHED**. |
| Tool-call inspection | Terminal commands and outputs are visible inside the Cascade/terminal panel in context; MCP calls are visible as steps. Granular input/output inspection beyond the step view: **NO SPEC PUBLISHED**. |
| Diff review approve/reject | Write mode shows diffs for review before/while applying; users can accept/reject changes. Per-hunk granularity is less explicitly specced in official Cascade docs than in Cursor/Zed — docs emphasise revert (below) as the safety mechanism. Mark as **documented at file/change level; per-hunk spec not published**. |
| File/artifact previews | Live Preview (running app in IDE), deploy URL preview. Edited files open in editor. |
| Plan/task view | **Planning Mode `plan.md`** is the strongest plan artefact in this sweep: persistent Markdown file, user-editable mid-run, Cascade picks up user edits. Plus the in-panel step/to-do list during execution. |
| Session resume/branching | Conversation history dropdown + history icon list past Cascade conversations for resume. **@-mentioning a past conversation** injects its full context into a new one (changelog 2025-07-17) — the documented cross-session branching/context-reuse primitive. In-conversation message-fork branching: **NO SPEC PUBLISHED**. Current-docs caveat: Devin Local (successor surface) does **not** persist Cascade Memories between sessions; durable instructions should live in rules/skills. |
| Queue / background visibility | Cascade is primarily an interactive, in-editor agent. No documented cloud/background-agent queue comparable to Cursor Cloud Agents or Jules/Copilot session lists in the Cascade docs — **NO SPEC PUBLISHED** for a background-run queue. (Devin cloud sessions, §3, are the family's background surface.) |
| Checkpoint / rewind | **Named checkpoints + reverts:** Hover a prompt → revert arrow, or revert from the table of contents, to roll back **all code changes** to that step's state; users can also create a **named snapshot/checkpoint** mid-conversation to navigate/revert to later. Docs warn reverting is **irreversible** — keep independent Git history. |
| Rules / instructions files | **Rules:** `.windsurf/rules/` files (activation: always-on / manual @-mention / glob-attached / model-decision) + legacy `.windsurfrules` root file; **Global rules** at `~/.codeium/windsurf/memories/global_rules.md`; workspace rules; enterprise system-level rules deployed by admins. Also reads `AGENTS.md`. **Memories (distinct from Rules):** auto-generated by Cascade during conversations (workspace-scoped, zero flow credits, stored locally, not version-controlled, not shared across workspaces/teammates) + user-created memories (can be global). Managed via the Customizations/book icon in the Cascade panel. Cascade can also be told "remember X" / "create a memory of …". |
| Codebase context controls | **@-mentions:** `@functions`, `@classes`, `@files`, `@directories`, `@web`, `@docs`, past conversations. `+` menu in the composer adds files, workflows, images. Whole-workspace semantic indexing underpins context; real-time editor actions are implicit context. |

---

## 3. Devin by Cognition (cloud agent)

Surface: Web app (`app.devin.ai`) session UI, Slack / Teams / Linear / Jira triggers, REST API + Devin MCP server. Each session = an isolated "Devbox" VM (shell + VS Code IDE + browser) driven by Cognition's cloud "brain".

### A) Agent capabilities

- **Ticket-in → PR-out autonomous engineer:** Plans, codes, runs tests, opens a pull request for review. Connects GitHub, GitLab, Bitbucket, Azure DevOps + custom Git providers. Initiated from web, Slack, issue trackers, API, automations/schedules/webhooks. [Devin docs family]
- **Own machine:** Sandboxed cloud environment per session with shell, code editor, browser; snapshots capture the environment (repo, installed deps, env vars, shell history, optionally browser profile) for reuse by future sessions.
- **Knowledge:** Persistent, curated notes (coding standards, deploy steps, internal tools) with title/trigger/content; Devin auto-recalls relevant notes for a task; org knowledge base is folder-structured, searchable, with **pending knowledge suggestions** Devin generates from sessions for human review/dismissal. [Advanced Capabilities]
- **Playbooks:** Reusable, shareable, versioned procedures (outcome, steps, postconditions/specs, advice, forbidden actions, required inputs) for recurring work; attachable to sessions and automations; editable inline before sending (quick-edit in the input box; "Update Playbook in library" / "Create new Playbook" to persist). Usage analytics per playbook (sessions, users, merged PRs, weekly chart) and version history per release notes.
- **Memory / "Dreaming":** Preferences/corrections/lessons saved as notes carrying across sessions, with an organising "dreaming" process (described in product material; note-level, not full-transcript recall — sessions themselves are disposable).
- **Skills, MCP, hooks, `AGENTS.md`:** Devin reads `AGENTS.md` before coding; MCP/plugins/skills/hooks/rules managed in Customize settings at personal/org/enterprise scope; marketplace plugins are typically one MCP server + skills.
- **Managed / coordinator Devins (Advanced Capabilities):** A coordinator session can spin up **child sessions** with own prompt, playbook, tags, structured-output schema and ACU (compute-unit) limit; message running children; get woken when a child finishes/needs input (no polling); monitor per-child ACU; sleep/terminate children; schedule messages to itself; parallel patterns documented (e.g. 50-file migration split into per-package sessions). Auto-approve of child batches can be turned off in Settings.
- **Automations & schedules:** Trigger sessions from Slack, GitHub, GitLab, Linear, Jira, PagerDuty, schedules (cron + one-time) and webhooks. Full REST API: a Sentry crash → session → PR is the documented pattern.
- **Session Insights:** On-demand analysis of completed sessions — issues/challenges, timeline with milestones + efficiency metrics, action items, improved-prompt suggestions; spin up a new session directly from the improved prompt; turn a successful session into a playbook (or improve an existing playbook by diffing success/failure sessions).
- **No third-party LLM keys:** Deployment docs state Devin "does not currently support third-party LLM API keys" — single managed harness.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | **Progress tab = unified timeline:** click any step or the Progress tab; all shell commands, code edits and browser activity logged in one view. Via API/MCP: inspect any session's **full event timeline** — list event summaries, fetch detailed event contents, full-text search across events, and search across shell/file/browser/git/MCP activity when analysing sessions. Command history supports **time navigation** (click a command to jump to that point; future commands greyed out). This is the richest published trace spec in the sweep. |
| Tool-call inspection | Per-step detail in Progress tab; shell command history with output preview + copy (three-dots menu), linked to the progress update it belongs to. Browser activity and edits are steps in the same log. |
| Diff review approve/reject | Review is **PR-centric** (open PR, review on the Git host) + in-session IDE diff view for quick changes. No documented in-Devin per-hunk accept/reject UI comparable to Zed/Cursor — approval happens at PR review and at plan/takeover points. State this as: **diff view YES (IDE), granular approve/reject NO SPEC PUBLISHED; PR is the approval surface**. |
| File/artifact previews | Embedded VS Code IDE (real-time edit watching, tabs, go-to-definition), Interactive Browser/Computer tab (view + interact, screenshots/recordings as proof), shell outputs. "Use Devin's Machine" opens the session's VS Code in a new tab. |
| Plan/task view | Devin presents a plan (steps + expected files) before coding; user replies to re-plan. Coordinator view groups **parent/child sessions nested in the sidebar**. Session Insights adds a post-hoc milestone timeline. A persistent user-editable plan file (Windsurf-style) is **not** the Devin cloud pattern — **NO SPEC PUBLISHED** for an editable plan artefact. |
| Session resume/branching | Sessions can be messaged while running, paused for **human takeover** (stop Devin, use IDE/shell/browser yourself, then resume and tell Devin what changed), terminated, archived, tagged, pinned, searched/filtered by tags/playbook/origin/user/time. **Side Chats** (`/btw …`, hover menu, add-tab): read-only Q&A panel with full session context up to that point, does not interrupt or mutate the main session — the documented branching primitive. Sessions can be **@-mentioned** into other sessions. Fork-from-arbitrary-message: **NO SPEC PUBLISHED**. |
| Queue / background visibility | The product *is* background: session list/sidebar is the queue (running/waiting/done), Slack mirroring ("send to channel" mirrors a web session into a Slack thread bidirectionally), notifications, schedules list, coordinator wake-on-child events. |
| Checkpoint / rewind | **Snapshots/blueprints** are the rewind-adjacent primitive, but they snapshot the *environment/machine*, not a per-message code state: restore = start a new session from a snapshot/blueprint. Per-step code rewind inside a session (Cursor/Windsurf-style): **NO SPEC PUBLISHED** — Git/PR history is the code-level rollback. Browser-profile persistence is an explicit approve-a-blueprint-update flow. |
| Rules / instructions files | Layered: `AGENTS.md` (repo) + **Knowledge** (org, trigger-scoped) + **Playbooks** (procedures) + Customize (skills/MCP/hooks/rules at personal/org/enterprise scope) + repo setup/blueprint (install/test/run commands Devin snapshots). No single `.devinrules`-style file is the headline mechanism — the knowledge/playbook system replaces it. |
| Codebase context controls | Repo connection + indexing (Ask Devin / DeepWiki over indexed repos), attachments upload/download (API), @-mentions of sessions, playbook/knowledge attachment at session creation (incl. from Slack modal with playbook + snapshot pickers). A chat-style @-file picker inside the session composer: less specced than IDE agents — **partial; NO DETAILED SPEC PUBLISHED** (context is primarily repo + knowledge + playbook scoped). |

---

## 4. GitHub Copilot — two distinct agents

GitHub explicitly distinguishes them: **(a) Agent Mode** — synchronous, interactive, in the IDE (VS Code / JetBrains / etc.); **(b) Coding Agent / "Copilot cloud agent"** — asynchronous, on GitHub, in a GitHub Actions ephemeral environment. Docs: "less todo, more done — the difference between coding agent and agent mode."

### A) Agent capabilities

- **Agent Mode (VS Code):** Plans multi-step work, creates/edits/deletes files across the workspace, runs terminal commands (with approval), self-corrects on errors/tests, understands workspace context. Modes in one Chat view: **Ask** (read-only Q&A), **Edit** (scoped edits), **Agent** (autonomous tools), **Plan** (see below). Tool ecosystem includes extension-contributed tools (e.g. MSSQL extension: list connections, read schema, run queries — each tool call requires approval). [VS Code docs]
- **Plan agent:** Read-only research over the codebase, breaks the task into actionable steps + open questions, presents a standard-format plan draft for iteration; makes **no code changes until approved**; handoff buttons start implementation in the same session **or** delegate to a background/cloud session; partial implementation ("only steps 1 and 2") is supported. [VS Code Planning docs]
- **Coding/cloud agent:** Assign an issue to Copilot (Assignees → Copilot, optional prompt) or start from the Agents tab/panel, Copilot Chat, or IDE with `@github`. It works in an ephemeral dev environment, runs tests/linters to validate before pushing, pushes commits to a **draft PR**, reacts 👀 on the issue/PR when it starts/sees a comment, responds to `@copilot` PR comments **only from users with write access**. Commits are authored by Copilot (requester as co-author), signed/Verified, each message linking to the session log. It can also do non-coding work from the same conversation: **plan, answer codebase questions, deep-research a repo** (with a permission prompt from Chat), and defer PR creation until you click **Create Pull Request** (with a **Diff** review first) vs. asking for a PR in the prompt (`View Pull Request` in the log). [GitHub Docs]
- **Agent platform:** From the Agents surface you can also run **third-party agents (Claude, Codex), partner agent apps, and custom agents** (task-specific system prompts, e.g. test-writer, refactorer), pick the model per task, and set **automations** (schedule or event, e.g. issue opened). [Agent Management]
- **Customisation:** Repo custom instructions (`.github/copilot-instructions.md` + path-scoped instruction files), `AGENTS.md` support, MCP servers, Agent Skills — per GitHub Docs customisation family.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | **Coding agent: session logs stream live** — open via "Copilot started work" → **View session** in the PR/issue timeline, the Agents tab, or `gh agent-task view --log [--follow]`. Logs expose reasoning ("internal monologue" in community wording; GitHub's wording: reasoning + tools used), files read, tests/linters run, validation steps. Session overview shows token usage + session length. VS Code Agent Mode: activity renders in Chat; the Sessions view tracks local/background/cloud sessions. |
| Tool-call inspection | Log-level inspection for cloud sessions (every tool call, file read, command). In VS Code, tool calls appear in chat with **per-call approval** controls. A standalone structured inspector UI beyond log/chat rendering: **NO SPEC PUBLISHED**. |
| Diff review approve/reject | Two layers: (1) in-IDE — agent edits land as reviewable changes; tool/terminal actions require approval in interactive use; (2) on GitHub — **the PR is the diff-approval surface** (draft PR, normal review/request-changes/merge; request Copilot re-review). VS Code checkpoints (below) are the pre-commit reject-all path. Per-hunk accept/reject inside Copilot Chat itself: **NO SPEC PUBLISHED** (VS Code's editor diff review is the surface). |
| File/artifact previews | Changed files in editor (IDE mode); PR diff + Files Changed (cloud mode); plan drafts openable in the editor. |
| Plan/task view | **Plan agent** (reviewable, iterable draft, open-in-editor, handoff buttons) + **todo list**: the agent creates a todo list in Chat for complex tasks, auto-updates it as steps complete; user can revise by natural language ("revise step 1…", "add another task") or clear it. Experimental: a lightweight **background todo agent** offloads todo bookkeeping from the main model (`github.copilot.chat.agent.backgroundTodoAgent.enabled`). |
| Session resume/branching | Sessions view in VS Code Chat (local/background/cloud unified); **Checkout / Apply** a cloud session's changes locally; **Open in VS Code / Continue in Copilot CLI** from GitHub; past sessions are searchable/queryable in natural language from CLI/VS Code ("About Copilot session data"). Message-level fork/branch of a chat: **NO SPEC PUBLISHED**. |
| Queue / background visibility | **Strongest multi-surface queue in the sweep:** GitHub.com Agents tab/page (cross-repo, steer/stop/start), repo Agents tab, VS Code Sessions view + "Copilot on my Behalf" (PR extension), JetBrains/Eclipse job lists (right-click → Cancel Job), GitHub Mobile Agents list (filter Open/Merged/Closed), Raycast task view, `gh agent-task list/view`. Multiple parallel sessions are a headline workflow; both sessions update in real time. |
| Checkpoint / rewind | **VS Code Chat checkpoints** restore affected workspace files **and chat history** to the checkpoint point. Documented limit: checkpoints do **not** reverse terminal commands, deployments or external-service effects — use Git/external recovery for those. Cloud agent: stop preserves pushed commits; Git history is the rewind. |
| Rules / instructions files | `.github/copilot-instructions.md` (repo-wide) + path-specific instructions, `AGENTS.md`, organisation custom instructions, custom agents' prompts, prompt files — per GitHub/VS Code customisation docs. |
| Codebase context controls | Chat participants/agents (`@github`, `@workspace`, extension participants), `#`-references to files/symbols/tools (e.g. `#todo`), file/folder attachment picker, repo selector for cloud sessions (choose repo + branch before starting). |

---

## 5. Google Jules

Surface: Web app (`jules.google.com`), Jules Tools CLI (`jules`, TUI + `remote new/list/pull`), REST API (v1alpha). Execution: fresh Google Cloud VM per task. GA 2025-08-06. Plans gate throughput: Free 15 tasks/day, 3 concurrent; Pro (Google AI Pro) 100/day, 15 concurrent; Ultra 300/day, 60 concurrent [jules.google pricing/product page].

### A) Agent capabilities

- **Async task agent:** Pick GitHub repo + branch, describe task (or label an issue `jules`, or trigger from CLI/API/schedule); Jules clones into a secure Cloud VM, installs deps (setup script / snapshot), analyses the codebase, executes, runs tests, self-corrects — including **auto-fixing failing GitHub Actions checks on its own PRs** — and opens a PR. Also works on empty repos (scaffold from scratch) and on tasks **without a repo** via API.
- **Plan-first:** Jules generates a step plan (Gemini thinking) naming files to change; execution waits for approval (configurable; a **Planning Critic** agent reviews plans that run without human approval).
- **Task types documented:** Bug fixes, multi-file feature builds, refactors, dependency version bumps, test writing/fixing, changelogs — including **audio changelogs** (listen to what changed). Multimodal input (text, images via public URL; frontend tasks verified with Playwright in the default image, screenshot returned with changes).
- **Suggested tasks:** Jules scans connected codebases for TODOs/performance issues and surfaces one-click suggested tasks; **scheduled tasks** (daily/weekly/monthly) for recurring work.
- **Environment snapshots:** Running a setup script via **Run and Snapshot** saves the environment (deps installed etc.); future tasks on that repo load it automatically for faster, consistent starts. Config lives under the repo's "codebase → Configuration" / "configure environment" in the task pane.
- **Integrations:** Vetted MCP server list (Linear, Stitch, Neon, Tinybird, Context7, Supabase per current product material), Render failed-deployment fixing, GitHub Issues as task source. Commits can be authored by Jules, the user, or both.
- **Data note (official):** Google states Jules does not train on private repository content.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | **Activity feed per session:** the API model is Source → Session → **Activity** (plan generation, message, progress update, artifact are activity types); web UI shows plan, progress narration/reasoning, terminal/test logs, and explains each change in natural language linked to the plan step. Repo view lists tasks by state. |
| Tool-call inspection | Via activity/log stream and terminal logs in the session view; CLI `jules remote list/pull` fetches session results. A granular per-tool-call structured inspector: **NO SPEC PUBLISHED** beyond the activity feed/logs. |
| Diff review approve/reject | **Plan approval is the pre-execution gate** (review, give feedback/edit, approve). Post-execution: in-UI **diff view** (browse, expand, download/copy snippets) → **Publish Branch** → **Open a PR directly from Jules** (dropdown by Publish Branch) → GitHub PR review is final approval. Jules cannot push to your main branch on its own. In-UI per-hunk accept/reject: **NO SPEC PUBLISHED**. |
| File/artifact previews | Diff viewer, change summary + reasoning, screenshots for frontend verification, audio changelog player, PR preview. |
| Plan/task view | The plan is a first-class, pre-execution UI object (steps + files), editable via feedback before approval. Repo view = per-repo task board (Running on top; Completed with full logs + diffs; Failed/waiting labelled; click any task to reopen, review plan, continue feedback). |
| Session resume/branching | Sessions are continuable: reopen a task, keep giving feedback mid-run (**steer/interrupt while it runs**), follow-up after completion. CLI lists/pulls remote sessions by ID. Branching/forking a session into variants: **NO SPEC PUBLISHED**. |
| Queue / background visibility | Background-by-design: task lists with concurrency caps per plan are the queue; notifications on completion; scheduled-task management; CLI/API session listing. |
| Checkpoint / rewind | **Environment snapshots** (see above) are the only snapshot primitive — they snapshot setup, not code state mid-task. Code rewind = Git/PR. Per-step checkpoint/restore: **NO SPEC PUBLISHED**. |
| Rules / instructions files | **`AGENTS.md`** at repo root, auto-read with zero extra config (docs note improved `AGENTS.md` adherence); setup scripts are the other durable instruction surface. No Jules-specific rules-file format — **NO SPEC PUBLISHED** for a proprietary rules system. |
| Codebase context controls | Repo + branch pickers are the context control; full-repo clone/scan (no @-mention picker — Jules works on the whole repo by design). File-level @-mentions in the prompt composer: **NO SPEC PUBLISHED**. |

---

## 6. Sourcegraph Cody

Surfaces: VS Code, JetBrains, Visual Studio (experimental), Neovim, Sourcegraph web, Cody CLI. Positioning in 2026 docs: enterprise AI coding assistant built on Sourcegraph code search/graph; Free/Pro wound down toward Enterprise (per Sourcegraph's plan-change notice linked from the Cody repo). **Important parity note: Cody's documented centre of gravity is chat + autocomplete + prompts, not an autonomous agent loop.** Gaps below are real findings, not omissions.

### A) Agent capabilities

- **Chat with codebase context:** Ask questions / request code; Cody searches the codebase (keyword + embeddings/local search for Free/Pro; Sourcegraph search engine for Enterprise) and answers, **disclosing which files it read** to produce the answer. Chat can write code with **Copy / Insert at Cursor / Save to New File** actions. If context is insufficient, Cody asks a follow-up or asks for a re-scoped question.
- **Autocomplete:** Single-line and whole-function context-aware completions in any language/config/doc file.
- **Inline edit / fix:** Request fixes/refactors in place; debug help and code-smell detection.
- **Prompts (formerly Commands):** Pre-built + custom reusable prompts (document code, explain, generate unit tests, detect smells…), created in the **Prompt Library** (web) with template + dynamic context (selection, current file), visibility (private/org/public), draft state, tags, and a mode: **Chat only vs Edit code**. Org-shared prompts appear in every member's chat panel.
- **Agentic chat:** Current Sourcegraph material describes chat/agent surfaces and an MCP server that exposes Sourcegraph context to *external* agents (Claude Code, Cursor, Codex, Amp). A Cody-native autonomous multi-step agent with terminal execution comparable to §§1–5 is **not specced in the Cody docs fetched** — **NO SPEC PUBLISHED** for a Cody agent loop, tool-calling terminal, or self-correcting test iteration.
- **Models:** Swappable LLMs (Claude, GPT, Gemini families per current docs; "latest LLMs" wording — no static menu is published).
- **Context Filters (governance):** Admins can exclude selected repositories from chat and autocomplete results entirely.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | **NO SPEC PUBLISHED** for a run timeline (chat product, not a run product). The transparency substitute is **context disclosure**: Cody lists the files/context it read for each answer. Chat History panel lists past chats; history is exportable as JSON (JetBrains docs). |
| Tool-call inspection | **NO SPEC PUBLISHED** (no documented tool-calling execution loop to inspect). |
| Diff review approve/reject | **NO SPEC PUBLISHED** for agent diff review. Code from chat is applied by explicit user actions (Insert at Cursor / Save to File) and then reviewed with normal editor/Git diff. Prompts in "Edit code" mode edit code, but a per-hunk approve/reject UI is not described in the docs fetched. |
| File/artifact previews | Code blocks in chat with copy/insert/save actions; editor previews are the IDE's own. |
| Plan/task view | **NO SPEC PUBLISHED** — no plan mode, no todo list in Cody docs. Prompts are the reusable-task primitive instead. |
| Session resume/branching | Multiple simultaneous chats + Chat History (revisit past chats, export JSON). Branching/forking: **NO SPEC PUBLISHED**. |
| Queue / background visibility | **NO SPEC PUBLISHED** — no background runs to queue. |
| Checkpoint / rewind | **NO SPEC PUBLISHED** — Git is the only rollback. |
| Rules / instructions files | No Cody rules-file format is specced in the docs fetched (**NO SPEC PUBLISHED** for a `.codyrules`-equivalent). Durable instruction surfaces are: org **Prompts** (Prompt Library), Context Filters (exclusions), and enterprise configuration. |
| Codebase context controls | **Cody's standout.** Context chips/picker in chat; **@-mentions**: `@file`, `@#symbol` (in `@#` form in older docs; `@` + symbol in current), remote repos, OpenCtx sources (Jira, Linear, Google Docs, Notion…). **Multi-repo context (Enterprise): up to 10 repos total** (local project + 9 remote) selected in the chat-context interface, searched via Sourcegraph; Free/Pro can toggle local context on/off; web chat: pick up to 10 indexed repos. CLI equivalents: `--context-file`, `--context-repo`, `--stdin` (e.g. `git diff \| cody chat -m '…' -`). "Public knowledge only" mode disables code context. |

---

## 7. Zed — Agent Panel

Editor: native (Rust) editor. Agent paths: **Zed Agent** (native), **External Agents** via the open **Agent Client Protocol (ACP)** (Claude Code, Codex, Gemini CLI, Copilot etc. keep their own auth/billing/config), **Terminal Threads** (CLI/TUI in a panel thread). Docs explicitly warn some panel features (thread restore, checkpoints, token display) depend on the agent integration.

### A) Agent capabilities

- **Zed Agent:** Reads/searches the project, edits files, runs terminal commands, uses built-in tools + Zed-managed MCP servers, follows Agent Profiles (which tools are available) and Tool Permissions (allow / deny / confirm per tool), Skills and Instructions. Model access via LLM Providers: Zed-hosted, provider API keys, subscriptions, gateways, local models; per-model tool support is surfaced honestly — a **"No tools" label** when the selected model/provider can't call tools, warning icon for partial MCP-tool support.
- **Edit Prediction:** Zed's own model (Zeta family) predicts the next edit inline while typing — the Tab-completion analogue; accepted predictions are the Pro tier's metered-included feature.
- **Inline Assistant:** Selection-scoped transforms in place, separate from the panel.
- **Git commit generation** from the Git panel; **Parallel Agents:** multiple threads across projects and Git worktrees simultaneously.
- **External-agent hosting as a capability:** ACP means Zed's review/checkpoint/thread UI can wrap third-party agents — a distribution capability none of the other IDEs here publish as an open protocol.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | Thread view streams responses **with indicators showing which tools the model is using**; any thread can be opened **as Markdown** (`agent: open active thread as markdown`) — the thread *is* the portable trace. A separate analytics/trace dashboard: **NO SPEC PUBLISHED**. |
| Tool-call inspection | In-thread tool indicators + permission prompts (confirm-gated calls show before running, per Tool Permissions). Structured per-call input/output inspector beyond the thread rendering: **NO SPEC PUBLISHED**. |
| Diff review approve/reject | **Review Changes** (`Ctrl+Shift+R`): a **multi-buffer tab with every agent change**; **accept/reject each hunk or the whole set**. Optional single-file review (`agent.single_file_review`): inline diffs in each file with the same keep/reject hunk controls, temporarily overriding the buffer's Git diff. Panel surfaces files changed + line counts in an accordion above the editor. |
| File/artifact previews | **Follow mode:** crosshair toggle (or hold `Cmd/Ctrl` on submit) makes the editor jump to each file the agent touches, live. Multi-buffer review is the artifact view; image attachments supported in prompts (vision models). |
| Plan/task view | **NO SPEC PUBLISHED** for a dedicated plan agent / todo-list widget in the Agent Panel docs fetched. Task structure is the thread + tool steps. (External agents may bring their own planning, per-integration.) |
| Session resume/branching | **Threads Sidebar** (`Cmd/Ctrl+Alt+J`): all threads grouped by project, thread switcher (`Ctrl+Tab`), archive (hover / `Shift+Backspace`), **Thread History across all projects, restorable at any time**. Sent messages are **editable and re-submittable** with adjusted prompt/context. **New From Summary** starts a fresh thread seeded with a summary of the current one; past threads can be **@-mentioned** into a new thread. Explicit fork-from-message as a named feature: **NO SPEC PUBLISHED** (edit-and-resubmit + New From Summary cover the workflow). |
| Queue / background visibility | Messages sent while generating are **queued by default** (editable/removable, individually or all); a queued message can be toggled to **Steer** (delivered at the agent's next step — Zed Agent only) or **Send Now** (double-Enter / stop button interrupts immediately). Multiple concurrent threads are visible in the sidebar; background completion notifications (OS notification and/or sound; `agent.notify_when_agent_waiting`, `agent.play_sound_when_agent_done`); Zed holds off OS idle-sleep while a thread generates (`agent.prevent_idle_sleep`). No cloud background agents of Zed's own — **NO SPEC PUBLISHED** (background = local parallel threads). |
| Checkpoint / rewind | **Restore Checkpoint button on every message** that performed an edit: returns the codebase to its state **prior to that message**; appears even if you interrupt mid-edit. Per-message granularity is the finest checkpoint spec in this sweep. |
| Rules / instructions files | **Instructions:** one project instruction file — first match wins from a published precedence list: `.rules`, `.cursorrules`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, `AGENT.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` — **plus** personal `~/.config/zed/AGENTS.md`, both loaded automatically. Plus **Skills** (reusable task instructions, invoked by name/@-mention) and Agent Profiles (tool configuration). Zed deliberately reads competitors' rule files. |
| Codebase context controls | **@-mentions:** files, directories, symbols, **previous threads, skills, diagnostics, branch diffs, URLs to fetch**. Pasting a multi-line selection auto-formats it as an @-mention with file context (`Cmd/Ctrl+Shift+V` pastes raw); selection → "add selection to thread" (`Cmd/Ctrl+>`, `+` menu). **Token usage for the active thread is displayed** next to the profile selector; **auto-compaction** at a configurable threshold (default 90%) replaces older messages with an inspectable **Context Compacted** summary entry; `/compact` manual; banner + Start New Thread when the window is too small (<80k) to compact. |

---

## 8. Gemini surfaces

Three distinct surfaces — do not conflate them.

### 8a. Google AI Studio (developer prototyping)

**Capabilities:** Web workspace for prototyping with Gemini models and exporting Gemini API calls. Create/chat prompts, pick models, upload multimodal files, tune run settings (temperature, output length, safety settings, thinking budget, media resolution), system instructions, tools toggles (Grounding with Google Search, structured output/JSON, code execution, function calling, URL context), **Get Code** export (Python/JS/…), API-key/project management, usage/quota dashboard, prompt saving + token counting, model **Compare mode** (side-by-side settings/models), Stream (live camera/screen sharing).

**Interface features (against the checklist):**
- Run/trace timeline: run history / chat history list only — **NO SPEC PUBLISHED** for an agent trace (AI Studio prompts are single-model runs, not agent runs).
- Tool inspection: tool toggles + grounding citations in output; no tool-call inspector spec.
- Diff review: **N/A / NO SPEC** (no codebase editing).
- Previews: output pane, compare pane, media previews.
- Plan/task view: **NO SPEC PUBLISHED**.
- Resume/branching: chat history reopen/continue; prompt gallery items are **forkable templates** (35+ curated examples). Conversation fork-from-message: **NO SPEC PUBLISHED**.
- Queue/background: **NO SPEC PUBLISHED** (synchronous runs).
- Checkpoint/rewind: prompt versioning is by saving prompts — no checkpoint spec.
- Rules files: **system instructions** field per prompt is the analogue; no repo rules file.
- Context controls: file/Drive uploads + URL context + system instruction are the pickers; no @-mention codebase system (not a codebase product).

### 8b. Gemini App (consumer assistant) — agent features

**Capabilities:**
- **Deep Research:** Multi-step research agent: builds a **research plan you can Edit before starting**, browses/searches (Google Search by default; sources picker can add/remove Gmail, Drive, uploaded files, NotebookLM notebooks), runs **~5–10 minutes in the background**, notifies on completion (web thread badge / mobile push), returns a cited report; Ultra reports can embed charts, diagrams and interactive simulators; reports can be opened, shared/exported/copied, and turned into a **Canvas visualisation** ("Create" in the Canvas panel). Daily + concurrent-request limits, surfaced in-product. API sibling: Deep Research / Deep Research Max agents (`deep-research-preview-04-2026` / `-max-`) with collaborative planning + background execution via the Interactions API.
- **Canvas in Gemini Apps:** Create docs/apps/visuals in a side panel from a prompt or a report.
- General agent-adjacent features: file/image upload & analysis, Workspace-connected sources, scheduled/recurring actions are a Gemini App feature family (per Google product material) — detailed Tasks-equivalent spec is thinner than ChatGPT's; mark **partial spec**.

**Interface features:** Plan view = the editable pre-run research plan (**Edit plan → Start research** is a textbook plan-approval gate). Trace: report + sources/citations, not a step timeline (**NO SPEC PUBLISHED** for a live step trace). Queue/background: leave the chat and get notified; concurrent limits published qualitatively. Diff/checkpoint/rules/@-mentions: **NO SPEC PUBLISHED / N/A** (not a coding surface).

### 8c. Gemini Code Assist — Agent Mode (VS Code + IntelliJ)

**Capabilities (official agent-mode overview):** Multi-step task solutions; Q&A about code; code generation from design docs, issues and `TODO` comments; built-in tools (VS Code: **all Gemini CLI tools** — grep, terminal, file read/write, web search, web fetch; IntelliJ list published: `read_file`, `write_file`, `analyze_current_file`, `find_files`, `grep`, `list_files`, `resolve_symbol`, `find_usages`, `git`, `list_vcs_roots`); **MCP servers** (local + remote, configured in `~/.gemini/settings.json`) auto-selected by the agent; **YOLO mode** (auto-approve) inherited from Gemini CLI; commands `/memory`, `/stats`, `/tools`, `/mcp` in VS Code agent mode; quotas shared with Gemini CLI. Recitation/citations are **not** available in agent mode (documented limitation).

**Interface features:**
- Plan/task view: For complex tasks the agent **shows a high-level plan for approval**; user can comment on, edit and fine-tune the plan and ask questions before approving; execution then asks for clarifications/permissions as needed.
- Tool-call inspection + approvals: The ReAct loop is permission-mediated in the UI: **mutating/filesystem tool requests ask Allow/Deny** (with "always allow this tool/server/similar operations" options); read-only tools may proceed without asking. This allow/deny prompt is the inspection surface; a post-hoc trace viewer: **NO SPEC PUBLISHED**.
- Context controls: **Context drawer** in the agent chat prompt area shows exactly what context is available/included (workspace info, tool responses, Search results, URL content, Markdown context files; IntelliJ adds indexed symbols/usages + VCS). `GEMINI.md`-style Markdown context files are the rules analogue (Gemini CLI family: hierarchical context files + `/memory`) — in the Code Assist agent-mode overview these appear as "context files you create in Markdown"; a detailed precedence spec is published for Gemini CLI, not repeated in the Code Assist page (**partial spec**).
- Diff review: edits are applied via tools under the permission flow and reviewed in the IDE's normal diff/Git UI; a dedicated agent multi-file review pane with per-hunk approve/reject: **NO SPEC PUBLISHED**.
- Session resume/branching, queue/background, checkpoints: **NO SPEC PUBLISHED** in the agent-mode docs fetched — agent mode is presented as an interactive IDE mode (the async Google coding agent is Jules, §5).

---

## 9. ChatGPT surfaces (OpenAI)

**Rename caveat (Oct 2026):** OpenAI's help page for agent mode now redirects to **ChatGPT Work** — the multi-step, file-producing mode reached via a Chat/Work switcher (paid plans) — and a separate cloud browser for website workflows. The capabilities below are documented under "ChatGPT agent" (Jul 2025 launch) and carried into Work; where the name changed, the interface patterns are the continuity that matters for parity.

### A) Agent capabilities

- **Agent Mode / Work:** A virtual computer unifying the Operator (visual browser) + Deep Research + terminal/code execution + connectors: navigates sites (visual browser via screenshots + text browser), fills forms, filters results, runs code, creates finished artefacts (reports, spreadsheets, slides, documents). Accesses connected apps (Gmail, GitHub, Drive…) for reading (e.g. summarise inbox, find meeting slots); acting on a site still requires login via takeover. Can **schedule a completed task to recur** (e.g. weekly metrics report every Monday). Paid-plan message allowances apply (Plus ~40 agent messages/month at launch-era docs).
- **Deep Research:** Multi-step web research agent: clarifies, **proposes a plan you can edit before it runs**, issues sequential searches, reads dozens of sources over ~5–30 minutes, returns a **fully cited structured report**; accepts file uploads; (Feb 2026) can connect to MCP servers / internal sources alongside the web. It synthesises — OpenAI/docs-adjacent guidance is to verify citations.
- **Tasks (scheduled prompts):** One-off or recurring scheduled runs (briefings, reminders, monitors) that execute without an open tab and notify; managed/paused/edited from a Tasks view; per-plan active-task caps. Scheduled agent runs count against the agent allowance.
- **Canvas:** Side-by-side collaborative editor for writing and code: direct in-place editing, inline suggestions/comments on selected spans, version iteration, code execution in-canvas, targeted rewrites (length/tone/reading level for prose). Opens automatically for substantial writing/coding outputs or on request.
- **Projects:** Persistent workspaces grouping chats + uploaded files (per-plan file caps, ~25–40) + **custom instructions** scoped to the project; project-only memory/context isolation (chats inside a project draw on project files/instructions; project chats don't leak into general history by default).
- **Supporting systems:** Memory (cross-conversation, user-reviewable), Custom Instructions (global), connectors/apps, Data Analysis (uploads → Python execution, charts), Search (cited web answers), GPTs, (2026) Skills and Workspace Agents per OpenAI product material.

### B) Interface features

| Dimension | Finding |
|---|---|
| Run/trace timeline | Agent mode shows a **live on-screen narration / activity view** of what it is doing on its virtual computer (per OpenAI launch + help material). Deep Research shows research progress and the final cited report. A structured, replayable tool-call log/timeline export: **NO SPEC PUBLISHED**. (Contrast Devin/Copilot session logs.) |
| Tool-call inspection | Narration + the visible virtual browser are the inspection surface; consequential steps pause for approval (below). Per-tool input/output inspection: **NO SPEC PUBLISHED**. |
| Diff review approve/reject | Not a code-diff product. Approval pattern is **action approval**: agent asks permission before consequential actions (purchases, sending email); **Watch Mode** requires supervision on sensitive sites; **Takeover Mode** hands the browser to the user for logins/passwords (the agent never handles the credential), then attempts to continue from the prior workflow state. Canvas provides the document-level accept/edit/reject surface (edit directly, accept suggestions inline, restore earlier versions). |
| File/artifact previews | Agent outputs open as finished files (docs/sheets/slides/reports) in-chat; Canvas is the rich preview/edit surface; Deep Research reports render with citations and (for code/data) downloadable artefacts. |
| Plan/task view | Deep Research: **editable pre-run plan** (edit before execution). Tasks view: list of scheduled tasks with schedule, pause/edit/delete. Agent mode itself: narration rather than a pre-approved plan by default (plan-edit is the Deep Research pattern). No todo-list widget spec for agent mode — **partial**. |
| Session resume/branching | Chat history resume everywhere; **"Branch in new chat"** from a message's `⋯` menu (web) is an explicit, documented fork primitive — the clearest message-branching spec in this sweep alongside Cursor/Zed side chats. Projects group sessions; branching inside Canvas keeps version history of the artefact. |
| Queue / background visibility | Deep Research and agent tasks run in the background with completion notification; Tasks view is the schedule queue; concurrent/allowance limits are surfaced as plan caps rather than a live multi-run dashboard — a cross-run live queue UI: **NO SPEC PUBLISHED**. |
| Checkpoint / rewind | Canvas **version history** (restore previous versions of the artefact) is the rewind primitive. Agent-run state rewind / per-step checkpoints: **NO SPEC PUBLISHED**. Cookies persist across agent sessions (documented); run-to-run progress carry-over is explicitly **not** documented (each scheduled run starts a new request). |
| Rules / instructions files | No repo rules file (not a coding IDE surface). Layered equivalents: **Custom Instructions** (global) → **Project instructions** (workspace) → GPT instructions → Memory. For the coding sibling (Codex) the file is `AGENTS.md`, shared with Cursor/Jules/Zed conventions. |
| Codebase context controls | File uploads, connectors and Projects are the context pickers; @-mentions exist for GPTs/connectors in the composer rather than codebase symbols. Codebase @-file/@-symbol system: **NO SPEC PUBLISHED / N/A** for ChatGPT itself. |

---

## 10. Cross-product gaps worth naming (honesty box)

- **Cody is not (yet) documented as an agent.** Its specs cover chat/autocomplete/prompts/context. Every agent-interface row for Cody is `NO SPEC PUBLISHED` — Wielder should not "match Cody" on agent UI; Cody's lesson is context UX + governance (context filters, multi-repo picker, read-file disclosure).
- **No product publishes a structured tool-call inspector schema** (JSON in/out per call) as a user-facing spec. The leaders render tool calls *in the trace* (Devin Progress tab, Copilot session logs, Zed thread indicators) — inspection = a readable, clickable trace, not a separate debugger.
- **Per-hunk diff approval** is specced only by the editor-native agents (Zed, Cursor; VS Code via editor diff). Cloud agents (Devin, Jules, Copilot coding agent) deliberately move approval to **plan approval + PR review**.
- **Checkpoint semantics differ and docs say so:** Cursor = files only, local, no manual edits; VS Code = files + chat history, not terminal/external effects; Zed = per-message code state; Windsurf = revert is irreversible; Devin/Jules snapshots = environment, not code.
- **Branching** has three documented shapes and no common standard: side chats (Cursor `/side`/`/btw`, Devin `/btw`), branch-in-new-chat (ChatGPT), New-From-Summary + @-mention-thread (Zed), @-mention-past-conversation (Windsurf/Copilot session data). A literal "fork from this message" button is rare.

---

## 11. Synthesis — the de-facto industry-standard interface set

Features present in **most leaders** (≥5 of the 9 products, counting Gemini Code Assist and Copilot's two modes as their vendors intend them). This is the set Wielder's Chainlit UI + CLI should be judged against, in priority order:

1. **Streaming run trace as the home view.** The conversation/timeline *is* the trace: ordered steps showing tool use, file reads/edits, commands + output, and browser activity, clickable for detail (Devin Progress tab; Copilot live session logs; Cursor chat timeline; Zed thread tool indicators; Jules activity feed; ChatGPT agent narration). Wielder implication: Chainlit steps must render every tool call with its input summary and output, live, and remain inspectable after the run.
2. **Plan-before-execution with an approval/edit gate.** Plan agent + handoff (Copilot), editable plan (Jules, Gemini Deep Research, ChatGPT Deep Research), approvable high-level plan (Gemini Code Assist), persistent editable `plan.md` (Windsurf), coordinator plan (Cursor Projects, Devin playbooks/coordinator). Plus a **live todo/task list** that updates as steps complete (Copilot todos; Cascade step list).
3. **Diff review with granular accept/reject — or PR-as-review for async.** Editor agents: multi-file review surface, per-hunk keep/reject (Zed Review Changes, Cursor Review changes). Async agents: branch + draft PR + in-UI diff before publishing (Jules, Copilot, Devin). One of these two shapes is mandatory; "agent edited files, trust it" appears nowhere.
4. **Checkpoint / rewind per turn.** Automatic snapshots before significant edits, restore from the timeline (Cursor), per-message Restore Checkpoint (Zed), chat checkpoints (VS Code), named checkpoints + revert (Windsurf) — always documented as *separate from Git*, with published limits.
5. **Queue + steer + background-run visibility.** Queued follow-ups that wait, steering messages delivered at the next tool call, send-now interrupt (Cursor, Zed); a sessions/jobs list across surfaces with live status, steer and stop (Copilot Agents tab, Devin sidebar, Jules repo task board). Background completion notifications (Zed, Gemini, ChatGPT, Jules).
6. **`@`-mention context controls + a visible context picker/drawer.** @-files/folders/symbols/docs/web/diffs/threads (Cursor, Windsurf, Zed, Cody, VS Code `#`/`@`), a context drawer showing what the agent can see (Gemini Code Assist), context chips that can be added/removed (Cody), and token-usage display with compaction (Zed; Cursor transcript search + summaries).
7. **Rules/instructions files, layered.** Repo file (`.cursor/rules/*.mdc`, `.windsurf/rules/`, `.github/copilot-instructions.md`, `AGENTS.md` — note `AGENTS.md` is now read by Cursor, Jules, Devin, Zed, Copilot and Codex, and Zed even reads rivals' files) + user/global layer + org/team layer. Reusable-task layer beside it: workflows (Windsurf), playbooks (Devin), prompts (Cody), skills (Cursor/Zed/Devin).
8. **Session persistence, search and branching.** Restorable history across projects (Zed Thread History, Cursor transcript search, Copilot session data, Devin session search/filter), resume in another surface (Copilot Open-in-VS-Code/CLI, Cursor cloud↔local handoff), and a low-friction branch: side chat / branch-in-new-chat / new-from-summary.
9. **Permission mediation for tool use.** Mutating tools ask Allow/Deny with "always allow" scoping (Gemini Code Assist, VS Code agent approvals, Zed Tool Permissions, Windsurf terminal modes incl. Turbo + deny-list, ChatGPT consequential-action approval + takeover for credentials). Autonomy is a *setting with named levels*, never a silent default.
10. **Artefact previews in place.** Edited files, generated images, screenshots, running-app preview, finished documents/reports open inside the experience (Cursor inline images/browser shots, Windsurf Live Preview, Devin IDE + Interactive Browser, ChatGPT Canvas + finished files, Gemini Canvas reports, Jules screenshots/diffs/audio changelog).

**Second tier (leaders-only, differentiating — worth Wielder roadmap notes, not parity gates):** environment snapshots for fast repeatable setup (Jules, Devin blueprints); coordinator spawning managed child sessions with budgets (Devin, Cursor Projects); session insights/post-hoc run analysis with improved-prompt generation (Devin); audio changelog (Jules); ACP-style hosting of external agents inside your UI (Zed); multi-repo context picker up to 10 repos + context filters (Cody); auto-compaction with an inspectable summary entry (Zed).

**What is *not* standard (do not build to it):** a separate structured tool-call debugger UI; per-hunk review inside cloud-agent web UIs (PR review owns it); conversation-fork buttons as a universal primitive; any rules format other than Markdown files + `AGENTS.md` convergence.

---

*Prepared 2026-10-28 from public documentation fetched the same day. Product UIs in this category change monthly; re-verify plan-gated limits and renamed surfaces (notably ChatGPT Agent Mode → Work, Windsurf → Devin Desktop) before quoting them externally.*
