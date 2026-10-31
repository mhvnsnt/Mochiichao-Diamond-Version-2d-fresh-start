# Mochiichao M1 build log (running handoff)

Branch: `feat/m1-dojo1-playthrough` (PR #129, base `feat/m1-playable-start`). PRs stay open: Actions are billing-blocked.
Live test build: the `m1/` folder of the public fork's gh-pages (deployed after every step).
Commit identity: mhvnsnt <197314870+mhvnsnt@users.noreply.github.com>. Run gitleaks (no -q) before every push. No force-push, no deletions.

## Done (newest last)
1. Gen-3-style battle scene, keyed Player D boy atlas, keyboard YES/NO, name fix.
2. EXP and leveling (`awardExp` in WorldEngine.tsx: floor(baseExpYield*L/7, x1.5 trainers), level^3 curve, rebuilt via createMochii, new moves logged). HP on level-up is clamped to 1..maxHp.
3. Catch result screen ("Gotcha! X was caught!", plus team-added/full).
4. Blackout heals the party and sends you to the last MochiiPlex (pokeemerald DoWhiteOut behaviour).
5. Losing the Hex rival battle continues the story (no money lost, marked defeated), as in Gen 1-5 rival fights.
6. Save-slot screen: keyboard support (Up/Down, Enter/Z, Esc/X).
7. FRLG-like level curve. Route 1 trainers Lv3-5; Dojo 1 acolytes Lv7-9; Master Lin Dreadtoise Lv11. Edited in `src/lib/trainers-region1.ts` (the canonical rows, which override the map) and in FullWorldMaps.ts.
8. Dojo 1 guard moved off the only doorway (it wandered onto the door tile at 14,9 and blocked entry).
9. Battles fill the viewport on desktop and in portrait phone mode (GbaBattleScene: 100vw x 100dvh, portrait layout, sprite scale `vs`).
10. Overworld creature flicker fix. In pixi 8, `Texture.from(url)` on an unloaded URL draws an empty texture, so walk frames blinked. Frames are now preloaded with `Assets.load` (`readyUrl` in PixiWorldCanvas.tsx), and the sheet cell shows until a frame is ready.
11. STAB x1.5 in calcDamage (GameData.ts), using species types from `battleStats`.

## Sources used
- pret pokeemerald/pokefirered decomps, as behaviour references only (whiteout, EXP formula, STAB). No ripped assets.
- CC0 town tiles that were already in the repo (Kenney); credits are in the repo.
- All Mochiichao art is the owner's originals.

## QA harness (tools/qa/)
Uses Playwright with the system Chrome, against `npx vite build --base ./` served at http://localhost:8765/?qa.
The `?qa` query exposes `window.__qa = {store, world, create}`.
- `lib.mjs`: boot/newGame/walk/talk/fight/heal/grass/resume.
- `t8`: Route 1 trainers plus a catch.
- `t10`: grind loop.
- `t12`: Silicon Town, then nurse, then Dojo 1 and Lin. It has a QA boost to Lv14 that stands in for grinding and is labelled in its output.
- `t13 <w> <h> <tag>`: viewport battle screenshots.
- `t14`: flicker frame strip.

## Next
- Confirm Lin's badge in an end-to-end run, then take screenshots and a video.
- Scope is now start through Dojo 2. Fill in the route after Silicon Town, Dojo 2, items, and NPC dialogue.
- Move the UI to a Gen 5-9 style HUD and battle UI.
- Add a CC0 interior tileset with credits.
- Use existing repo art for the mover NPC sprites.
- Type effectiveness: `src/lib/battleTypeChart.ts` exists (TRUE_TYPE_CHART) but calcDamage does not use it yet.

## Resume steps
```
git checkout feat/m1-dojo1-playthrough && npm ci
npx vite build --base ./ && npx http-server dist -p 8765   # or any static server
node tools/qa/t12.mjs     # needs a cp-*.json checkpoint from t8/t10 (Playwright storageState)
```
To deploy, copy `dist/.` into the gh-pages clone's `m1/` and commit as mhvnsnt.

## Running change log (one line per shipped fix; ship via /workspace/mchao/ship.sh "msg")
- 2026-10-29 17:46 CDT: Battle: type chart (TRUE_TYPE_CHART) + super-effective text, in-battle Mend Patch, Bag/Fight on-screen BACK (X/Esc), command box clamped inside viewport, player walk-frame preload
- 2026-10-29 17:47 CDT: Maps: visible door tile on every door warp (Silicon Town dojo/MochiiPlex, Dojo 2), new Sector 0 neighbor house behind the orphan door
- 2026-10-29 17:48 CDT: Sprites: healers/bosses/trainers/townsfolk use existing repo human atlases instead of silhouette placeholders; Master Falk gets his owner-locked atlas
