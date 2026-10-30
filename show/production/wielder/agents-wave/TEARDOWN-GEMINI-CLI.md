# TEARDOWN — Google Gemini CLI

*Agents wave, 2026-10-28. Sources: github.com/google-gemini/gemini-cli
(README + linked docs, read 2026-10-28). Licence verified at source.*

## What it is

**Licence bucket: open source — Apache-2.0** (TypeScript, ~109k
stars at audit). Google's terminal agent: a ReAct-style loop over
built-in tools (filesystem, shell, web fetch/search), extended by
MCP servers and custom extensions, scriptable headlessly
(`gemini -p`, `--output-format json` / `stream-json`).

A status fact that belongs in the open (the repo's own banner
states it): as of 2026-06-18 the free individual tier and Google AI
plan access moved to Google's Antigravity CLI; this repository now
serves Gemini Code Assist Standard/Enterprise on Google Cloud plus
legacy API/Vertex keys. The *code* remains Apache-2.0 and fully
readable — the teardown stands — but "Gemini CLI free tier" is no
longer an accurate label for the product around it, and Wielder's
existing `gemini-free` advisory seat (brain.py, owner's seat
policy) is a separate recorded arrangement this wave does not
alter.

## Patterns, and Wielder's parity deltas

| Gemini CLI pattern | Wielder counterpart | Delta |
|---|---|---|
| GEMINI.md context files (hierarchical: global → project → directory, `@import` composition) | `instruction.py` + AGENTS.md discipline + drift gate | Parity in effect; Wielder adds enforcement (drift detection) Gemini CLI lacks |
| Checkpointing (conversation save/resume, `/restore`) | LangGraph checkpoint store + durable-job step journal | Parity; Wielder's journal is step-granular and fsynced, aimed at crash-resume of *work*, not chat |
| Built-in tool set with per-tool confirmation | Tool layer + standing-authorization classes | Different default: Gemini asks per action class interactively; Wielder's classes are decided once (unattended heartbeat) |
| Sandboxing (macOS Seatbelt / container) + Trusted Folders (per-folder execution policy) | Structural containment in the tool layer; scorer-owned path guard | **GAP**: no OS sandbox, no per-folder trust policy — same gap as the Codex row, recorded once in WAVE-MAP |
| MCP client (servers in settings.json, `@server` addressing in prompts) | `mcp_client.py` (SDK bridge) + `mcp_protocol.ClientSession` (this wave) | Parity; Wielder additionally merges discovered tools into the validated registry, so an MCP tool inherits Wielder's guarantees |
| Headless mode with JSON / stream-json events | Manager CLI + ledger/journal | Parity of purpose; Wielder's event record is the SQLite ledger, not a stdout stream |
| Extensions (bundled commands/tools/MCP config) | Registered methods + the tools registry | Parity of concept; Wielder's extension unit (a method record) carries acceptance state and provenance, which extensions do not |
| Telemetry (OpenTelemetry) | Ledger + report packets | Partial: Wielder records more (evidence chain) but exports no OTel spans — cosmetic GAP |

## The Gemini dialect, wired

Gemini's function-declaration format is the one dialect in the wave
whose schema language is *not* plain JSON Schema: the API's Schema
type is an OpenAPI-3.0-flavoured subset (no `title`, no
`additionalProperties`, no `$defs`/`$ref`). `wielder/tool_schemas.py`
implements that reduction (`_gemini_schema` + `$defs` inlining) and
the test suite walks every generated declaration asserting no
banned key survives. A Wielder tool can therefore be declared to a
Gemini-shaped host without hand-translation.

## GAPs

- OS sandbox / trusted-folder policy (shared with the Codex row).
- The Antigravity CLI successor product — proprietary hosted
  surface; documented behaviour only, and out of this wave's scope
  beyond noting the migration.
- Gemini model internals — closed; GAP by the wave's definition.
