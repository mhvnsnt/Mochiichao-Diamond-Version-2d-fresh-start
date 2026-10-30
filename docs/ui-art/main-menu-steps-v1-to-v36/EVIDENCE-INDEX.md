# Evidence index — every step, its picture

How to use this: pick any step in `STEPS.md`, find it here, open
the file. If a step's picture is not here and not in the repo, the
step says so — nothing in this archive rests on a picture nobody
can open. All paths are in `docs/ui-art-options/` unless a full
path is given. Byte sizes are from the main-branch tree listing
(checked 2026-10-28) and are given so a changed or swapped file
shows up as a size change.

## The numbered renders, V10–V32

| Step | File | Bytes |
|---|---|---|
| V10 | mochiichao-main-menu-only-v10.png | 70,336 |
| V12 | mochiichao-main-menu-with-logo-v12.png | 473,767 |
| V13 | mochiichao-main-menu-v3-colors-logo-middle-v13.png | 407,830 |
| V14 | mochiichao-main-menu-white-bg-v14.png | 362,331 |
| V15 | mochiichao-main-menu-white-bg-v15.png | 376,078 |
| V16 | mochiichao-main-menu-white-bg-v16.png | 385,137 |
| V17 | mochiichao-main-menu-white-bg-v17.png | 386,441 |
| V18 | mochiichao-main-menu-white-bg-v18.png | 388,299 |
| V19 | mochiichao-main-menu-white-bg-v19.png | 387,625 |
| V20 | mochiichao-main-menu-white-bg-v20.png | 391,251 |
| V21 | mochiichao-main-menu-white-bg-v21.png | 396,151 |
| V22 | mochiichao-main-menu-white-bg-v22.png | 397,500 |
| V23 | mochiichao-main-menu-white-bg-v23.png | 199,273 |
| V24 | mochiichao-main-menu-white-bg-v24.png | 394,330 |
| V25 | mochiichao-main-menu-white-bg-v25.png | 394,252 |
| V26 | mochiichao-main-menu-white-bg-v26.png | 399,734 |
| V27 | mochiichao-main-menu-full-research-v27.png | 420,111 |
| V28 | mochiichao-main-menu-full-fill-v28.png | 428,328 |
| V29 | mochiichao-main-menu-lower-fade-v29.png | 432,611 |
| V30 | mochiichao-main-menu-reach-up-v30.png | 434,493 |
| V31 | mochiichao-main-menu-golden-618-v31.png | 434,293 |
| V32 | mochiichao-main-menu-phi-fade-v32.png | 439,494 |
| V32 | mochiichao-main-menu-locked-v32-annotated.png | 423,512 |

Notes: no `mochiichao-main-menu-*` render exists for V1–V9, V11,
or V33–V36. V23's file is about half the byte size of its
white-bg neighbours (V14–V26 all run ~362–400 KB); no source
explains the difference — recorded as an observation, not a
conclusion. The tree also lists `src/assets/ui/main-menu-v32-background.png`
at 439,494 bytes — the same size as the phi-fade render. That is
a size match in a listing only; identity is NOT claimed.

## The early artefacts (V1–V9, V11)

| Step | File | Bytes |
|---|---|---|
| V1 | mochiichao-logo-draft-v1.png | 34,336 |
| V2 | mochiichao-logo-y2k-v2.png | 16,341 |
| V3 | mochiichao-logo-y2k-mixed-v3.png | 19,562 |
| V4 | game-flow-ui-v4.md (document, no render) | — |
| V5 | starter-deadlock-fix-v5.md (document, no render) | — |
| V6 | pokemon-vs-mochiichao-layout-v6.png | 61,909 |
| V6 survey | most-recent-pokemon-ui-v6.md (document) | — |
| V7 | pokemon-version-wireframe-v7.png | 78,089 |
| V8 | verify-match-layout-v8.png | 66,786 |
| V9 | mochiichao-game-look-v9.png | 211,837 |
| V11 | fire-red-first-replacement-log-v11.md (document) | — |

Unversioned generated main-menu candidates also sit in the
folder (reference only, never locked):
media-generation-mochiichao-main-menu-0-f2a1438e-….png (2,757,028)
and media-generation-mochiichao-main-menu-canon-0-48009951-….png
(2,986,868). The UI style guide calls the canon one's header and
footer wrong ("CREATURES" header, fake version footer) — do not
treat either as a version.

## Animation states (all V32-based)

| State | File | Bytes |
|---|---|---|
| Sine only | menu-v32-sine-only.gif | 1,497,429 |
| Combined (rise+fade+sine, all) | menu-v32-rise-fade-sine-all.gif | 4,051,353 |
| Matched ("perfect") | menu-v32-rise-fade-sine-matched.gif | 5,384,290 |
| Current (byte-copy of matched, cache rule) | menu-v32-rise-fade-sine-current-20261025.gif | 5,384,290 |
| Animated full | menu-v32-animated-full.gif | 4,064,489 |
| "This one" moving | menu-v32-this-one-moving.gif | 5,782,445 |

The matched and current GIFs carrying the SAME byte size is the
cache rule made visible: the current file is a byte-copy of the
matched file under a new name (STEPS.md, Part 5). Also in the
folder, unversioned: menu-background-flow-demo.gif (147,904 —
the sparse flow demo, SUPERSEDED) and
menu-background-flow-actual-menu.gif (4,769,742).

## Subtitle composites

| Item | File | Bytes |
|---|---|---|
| Subtitle on cloud (temporary placement) | menu-v32-subtitle-on-cloud.png | 454,609 |
| Subtitle phi placement | menu-v32-subtitle-golden-ratio.png | 453,417 |

## The 2026-10-26 correction-chain renders

Cloud position set (cloudpos, all 20261026) — CURRENT is the
pre-fix render; FIXED (unsuffixed) is the first fix state (no
file named "fixed1" exists — the unsuffixed set IS fixed1):

cloudpos-current-20261026.png (592,904) · cloudpos-current-crop-20261026.png
(164,465) · cloudpos-current-phone-20261026.png (196,887) ·
cloudpos-fixed-20261026.png (588,953) · cloudpos-fixed-crop-20261026.png
(158,692) · cloudpos-fixed-phone-20261026.png (194,517) ·
cloudpos-fixed2-20261026.png (574,700) · cloudpos-fixed3-20261026.png
(572,139) · cloudpos-fixed3-phone-20261026.png (190,419) ·
cloudpos-fixed3-moving-20261026-moving.gif (5,889,710) ·
cloudpos-closeup-compare-20261026.png (363,139).

Cloud + emblem set (cloudemblem, all 20261026 — the PR #261
states): cloudemblem-20261026-stage3.png (567,292, the true
1200x1500 frozen stage) · cloudemblem-20261026-stage2.png
(567,413) · cloudemblem-20261026-stage-frozen.png (553,259) ·
cloudemblem-20261026-moving3-moving.gif (6,401,169) ·
cloudemblem-20261026-moving2-moving.gif (6,388,900) ·
cloudemblem-20261026-moving-moving.gif (5,669,238) ·
cloudemblem-20261026-phone390.png (181,831) ·
cloudemblem-20261026-phone2.png (193,509) ·
cloudemblem-20261026-phone.png (192,927) ·
cloudemblem-20261026-closeup.png (245,459).

Perfect-menu set (all 20261026 — the "perfect" = matched-speed
menu renders the correction chain was judged on):
perfect-menu-render-20261026.png · -cloudfix-fresh · -cloudfix-seeded
· -cloudfix2-fresh · -cloudfix2-seeded · -cloudswap-seeded ·
-formula (2,740 bytes — far smaller than every other render here;
recorded as-is) · -formula-v2 · -formula-v2-annotated · -round2 ·
-sectiono-fresh · -sectiono-pr · -textfix-final (PR #206's proof)
· -textfix-seeded; side-by-sides: perfect-menu-side-by-side-20261026.png
· -cloudfix2 · -cloudswap · -formula-v2 · -round2 · -textfix.
Plus menu-perfect-verification-proof-20261026.gif (120,881).

Menu loop set (formula v2 motion): menu-loop-frame-0 through
menu-loop-frame-7-20261026.png (8 frames) +
menu-loop-formula-v2-20261026.gif (691,344).

Menu Editor (PR #260 era, 20261026): menu-editor-top-20261026.png,
menu-editor-cloud-…, menu-editor-symbols-…, menu-editor-layers-…,
menu-editor-library-saved-…, menu-editor-live-preview-moved-…,
menu-editor-pause-…, menu-editor-preview-visible-…,
menu-editor-roundtrip-main-menu-…, menu-editor-roundtrip-v2-20261026.png
(140,562), menu-editor-mochioteka-current-…,
menu-editor-mochioteka-gen1-20261026.png (98,274),
menu-editor-mochioteka-gen2-20261026.png (94,441),
menu-editor-text-fixedfont-…, menu-editor-top-fixedfont-….
NOT in the repo: PR #6's six expansion screenshots (chat-only,
2026-10-27 — see STEPS.md, Gaps).

## The 2026-10-27 compare renders (the open owner calls)

mars-compare-top-sparkle-20261027.png (127,775) ·
mars-compare-fade-faint-20261027.png (128,383) ·
mars-compare-phone-framing-20261027.png (461,159) — with the
notes in mars-compare-notes-20261027.md. Menu stack verdict
renders (PR #322 / PR #5): the menu-stack-20261027-* files in
this folder (4 PNGs) + menu-stack-20261027-trace.md.

## Measurement files (the numbers' receipts)

- cloudswap-measure-20261026.json — cloud interior measurements.
- menu-moving-bottom-measure-20261026.json — 195 frames: lowest
  symbol pixel at y1498.5 in every frame (1.5px bottom gap).
- menu-moving-bottom-phase-20261026.json — 80 phase-exact frames:
  79/80 at the same 1.5px gap; frame 039 at 7.7px.
- Render harnesses (they hold NO spec values — they render the
  app's own code): render_menu_moving_phaseexact_20261026.py
  (script clock, t = i x 70ms), render-native-20261026.py
  (native aspect; window height +143px compensates headless
  Chrome's fixed deduction), render_menu_moving_sectiono_*.py.

## Code seats (where the locked values live now)

- src/lib/lockedV32Menu.ts — LOCKED_V32_MENU + MENU_ANIMATION_SPEEDS
  (the floor, in code; its comments carry provenance per value).
- src/lib/mainMenuSymbols.ts — the formula v2 field (300 symbols).
- src/lib/lockedV32Snapshot.ts — the 19-dimension restore.
- src/lib/menuEditor.ts / menuEditorExport.ts — the editor
  (188 values; expansion to 314 in unmerged PR #6).
- src/components/game/MainMenuBackground.tsx — renders arcs,
  symbols, fade, hearts from the active config.
- src/components/IntroSequence.tsx — title + main menu rendering.
- src/assets/ui/puffy-cloud.svg — the cloud file (597 bytes,
  byte-untouched through every fix).
- src/assets/ui/mochiichao-main-logo-v32-matched.png — the logo.

## Workspace-only evidence (named, not hidden)

The Oct 26–27 lanes also kept proof renders in the local clone
~/workspace/mochiichao-work/ui-art/. That clone no longer exists
on this machine. Every render named in a PR body was checked
against the repo inventory above: the cloudpos, cloudemblem,
perfect-menu, menu-loop, menu-editor and mars-compare sets ARE
in the repo. Where a PR body names a workspace path only (for
example PR #214's side-by-side set), the repo's own set for the
same state (perfect-menu-side-by-side-formula-v2) is the
checkable evidence, and the difference is recorded here rather
than smoothed over.
