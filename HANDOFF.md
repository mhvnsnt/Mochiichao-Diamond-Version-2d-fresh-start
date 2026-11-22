# HANDOFF — Mochiichao-Diamond-Version-2d-fresh-start

**Last updated: 2026-11-22 (America/New_York).**
**Repo:** `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start` (PUBLIC, ~970 MB), default branch `main`.
**Purpose of this file:** any agent that picks up work here reads this FIRST, then the linked docs. It states what we've done, where we're at, and what we're working toward — so the owner can say "go to this repo, pick up the work" and you just know. Update this file in the same PR whenever the state changes (add, don't delete).

## 1. What this repo is

The LIVE Diamond repo for the Mochiichao show — the 2D Diamond version. Cleaned-history copy, Stage B build 2026-10-29, pre-swap. The Mochiichao show is full Pokemon-anime production. The split: **Diamond feeds Crystal one way; Crystal keeps everything; building focus stays on Crystal and its playable slice.** The sanitize rule holds across all of it: cries, literal dialogue, logos, and images never go in. The public fork (`Mochiichao-Diamond-Version-2d-public-fork`) is reference-only now — Diamond work lands HERE, never there.

## 2. Where we're at

### DONE
- **M1 owner directive (2026-10-31):** M1 ONLY — M1 is the face, all game work to M1 + Crystal. (`M1-OWNER-DIRECTIVE.md`.)
- **Regions 3–5 NPC wiring (2026-11-13, PR #427 merged):** R5-047 Mythar wired, 77/136; audit parity 124/130.
- **Stage B build (2026-10-29):** cleaned-history copy, pre-swap, landed as this repo.

### IN PROGRESS
- **Open PRs:** #47 (stage: traversal build parts 1+2, full-tree snapshot — composition order 1 of 2); #48 (stage: 3D world full-tree snapshot — composition order 2 of 2); #49 (records: battle-payoff lane records — audit, spec, in-game proof); #51 (teardown Shadow of War N1/N2: rivalry module + trait schema); #52 (teardown Spore T1/T2: part grammar + derivation core). Next step: work the staging PRs in composition order (#47, then #48), then the battle-payoff records.
- Last push 2026-11-20.

### BLOCKED
- Nothing recorded as blocked.

## 3. What we're working toward

Diamond as the feeder into Crystal, and the playable slice. Bar for done: full Pokemon-anime production standard — real animation, real cuts, the sanitize rule held (no cries, no literal dialogue, no logos, no images), and every wired region audited with in-game proof before it counts.

## 4. Standing rules that apply here

- **Branch → PR → merge, always.** Never push to main directly. Add-only, zero-conflict PRs, no force pushes.
- **Checkpoint-and-save law:** CHECKPOINT.md first, update after every step; the repo is the save; resume, never restart.
- **No-temp-storage law:** nothing in /tmp or any wipeable location, ever. Everything goes straight into the repo or a durable folder the second it exists.
- **Real-source-only:** every part comes from the actual source code and files, wired up fully. No hand-tooled lookalikes, no fake panels.
- **M1 ONLY directive (owner, 2026-10-31):** M1 is the face; all game work goes to M1 + Crystal.
- **Sanitize rule:** cries, literal dialogue, logos, and images never go in.
- **Pre-made parts first:** use existing parts/kits before building anything new.
- **Anti-clobber / no-data-loss:** never wipe or overwrite another lane's work.

## 5. Key files and paths

| What | Where |
|---|---|
| M1 directive (read first) | `M1-OWNER-DIRECTIVE.md` |
| Canon + bible | `CANON.md`, `GAME-BIBLE.md`, `SEQUENCE-PLAN.md` |
| Work log | `WORKLOG.md` |
| Agent rules | `AGENTS.md`, `WORKING-METHOD.md` |
| Show | `show/` |
| App / source | `app/`, `src/`, `index.html`, `package.json` |
| Docs | `docs/` |
| Staging | `staging/` |
| Sprites | `sprite-art/`, `sprites-bake/`, `pokebw2/`, `pokefirered-leafgreen/`, `pokeheartgold/` |

## 6. Open decisions needing the owner

- **Staging PRs #47 / #48:** composition order is stated (1 of 2, then 2 of 2) — if the order ever changes, that's his call.
- **Battle-payoff records (#49):** what counts as proof for a battle payoff — audit + spec + in-game proof is the stated bar; he judges the renders.
- **Public fork vs this repo:** already decided — this repo is live, the fork is reference-only. Do not re-decide it in a lane.

## 7. How to pick up

1. Read this HANDOFF.md first, then `M1-OWNER-DIRECTIVE.md`, `CANON.md`, and `GAME-BIBLE.md`, then `WORKLOG.md`.
2. Check the open PRs (#47, #48, #49, #51, #52) before starting anything — work them in composition order.
3. Resume from the stated next step — never restart, never re-derive finished work.
4. Land work branch → PR → merge, add-only. Stage finished work to the repo as it lands.
5. Update this HANDOFF.md in the same PR when the state changes. Verify with your own eyes before claiming anything done.
