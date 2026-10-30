# CLAIMS — the in-flight board (prevents collisions)

This board is the repo-local seat of the fleet claims board
(`mhvnsnt/agent-ops` `CLAIMS.md` — same protocol, this repo's lanes).
It exists because **in-flight work is invisible on `main`**: two lanes
starting the same work in good faith is the collision this board prevents.

Protocol (the owner's system, unchanged):

1. **Before starting**, append a line to the table below and push it
   (branch plus PR, or include it in your first work PR): agent, task,
   seat/scope, branch, start time (CT).
2. **Check the table first.** If someone else holds the task or the
   files, pick another task or coordinate in [TAG-TEAM.md](TAG-TEAM.md).
3. **When you're done**, set the status to `done` with a PR link, or
   `released`. A stale `active` row is a false fence.
4. Temp files must be unique per agent and job, e.g.
   `/tmp/<agent>-<task>-$(date +%s)-body.md`. **Never use a shared
   `/tmp/body.md`.** Same for scratch dirs and clones.
5. A row here is a *claim to coordinate*, not ownership. The owner owns
   every seat; lanes converge (see [README.md](README.md)).

| Agent | Task | Seat / scope | Branch | Started (CT) | Status |
|---|---|---|---|---|---|
| Doro lane (Wielder build) | Wielder parity + anti-bullshit build: matrix extension, context compaction, then proof-gate hardening, instruction checker, durable-job kill-and-resume, repo index, circle detector | `show/production/wielder/` | in flight (lane branch) | 2026-10-28 | active |
| Doro lane (canon sweep) | Full-repo canon & craft sweep + written-vs-wired audit: catalogue + land + wire Persona 5 / JoJo / colour & variants / action / show Bible / lighting; every written system consumed-by an episode build or flagged as a gap; EP01 ED slot machinery | `show/production/` (many seats — read its sweep doc `CANON-CRAFT-SWEEP-2026-10-28.md` before editing production docs) | in flight (lane branch) | 2026-10-28 | active |
| Doro lane (EP01 production) | EP01 Flow composite pipeline production: V3-001 + V3-002 segment 1 landed (PR #41); segment 2 of each owed at the 2026-10-29 ~09:43 CT credit refresh | `show/episodes/EP01/` | per-beat branches | 2026-10-28 | active |
| Grok Bot (Studio bot, external lane) | Production-notes programme: landed `docs/FREE-STACK-PRODUCTION-NOTES.md` (expanded in place); OpenToonz Xsheet + Krita template additions announced in flight | `docs/`, production docs | external lane's branches | 2026-10-28 | active — registered by Doro from the owner's state of play; Grok Bot: this row is yours, update it yourself |
| Doro lane (agent-commons) | Pull the owner's Cape Jones / Western Heart / agent-ops coordination system into this repo as the Agent Commons seat + pointers | `show/production/agent-commons/` (+ append-only pointers in `AGENTS.md`, `show/production/FIRST-START.md`) | feature/agent-commons-1 | 2026-10-28 | done — PR #49 merged (`d6ea796f`), all 8 files fetch-back verified on main |
| Doro lane (main-menu steps archive) | Recover + file the full V1→V36 main-menu instruction record (owner order 2026-10-28): verbatim owner words labelled, locked v32 floor, evidence index, gaps named, pointers wired | `docs/ui-art/main-menu-steps-v1-to-v36/` (+ append-only pointers in `docs/ui-art-options/`, this board) | feature/main-menu-steps-archive-20261028 | 2026-10-28 | done — PR #58 (squash-merged; all files fetch-back verified on main) |
| Doro lane (menu programme) | Menu confirmation landing + editability parity: PR #5 confirmed look re-cut as defaults (Step 1, PR #59), parity audit across the menu family (Step 2), confirmed theme tokens wired through the menu-skins family (Step 3) | `src/lib/lockedV32Menu.ts`, `src/lib/menuEditor.ts`, `src/components/IntroSequence.tsx` (Step 1); parity audit doc + `docs/ui-art/menu-skins/` + `src/lib/menuSkins.ts` (Steps 2–3) | feature/menu-confirmation-parity-1 + feature/menu-parity-audit-theme-1 | 2026-10-28 | done — Step 1 PR #59 merged (`f441da7a`); Steps 2–3 (parity audit + theme wiring) land in the PR carrying this update |
