# Interchangeable start screens — inventory + staged plan (PREP ONLY)

Date: 2026-10-26. Status: PREP ONLY — inventory and plan, no game changes,
no PR, no merge, no art generated, no title/logo/studio-card file edited.
Mars order (2026-10-26 ~20:39 CDT): AFTER the all-sources wiring is done,
Mochiichao gets interchangeable start screens coded exactly how Pokemon
codes their title/start screens, using Black 2 + all other generations on
disk, adding ONLY background videos, never clobbering the logo, studio
card, or locked title art.

Hard rule for the later build: logo, studio card, and locked title art
are DO NOT TOUCH. The background layer is the ONLY addition. Any later
build that edits a logo/studio-card/locked-title file fails this plan.

Proprietary rule applied here (Mars 2026-10-26 ~20:39/20:41 CDT, standing):
swap out ONLY Pokemon (species/characters), Pokemon names, Pokemon images,
logos, and actual literal dialogue. Everything else — code flow, structure,
layer order, timing, values — is usable at 100%. Cries are a Pokemon piece
(a Pokemon's voice) and belong in the swap-out bucket. No Pokemon name,
dialogue, image, logo, or cry is copied in this file or in any staged
output. Version creatures are referred to only generically below.

## 0. Counts

- Generations inventoried: 5/5 = 100% (Gen 1, Gen 2, Gen 3, Gen 4, Gen 5)
- Codebases inventoried: 11/11 = 100% (3 fresh-start submodules + 8 decomps/)
  - With title code found: 10/11 = 91%
  - Data-only (no title app code located): 1/11 = 9% (Diamond demo files only)
- Title systems mapped in §3: 11 rows
  - HAVE (already in Mochiichao's game code): 5/11 = 45%
  - PARTIAL (present but not Pokemon-shaped): 1/11 = 9% (row 1, state machine)
  - NEED TO MAKE (later build, after wiring): 5/11 = 45% (rows 2, 8, 9, 10, 11)
- Game files changed by THIS task: 0/0 — read-only inventory. Note: the
  fresh-start work tree was already dirty before this task (including a
  pre-existing modification to IntroSequence.tsx); none of that is mine,
  and I edited nothing in it.

## 1. Title code + structure per generation on disk

All paths are on-disk sources, verified this pass. Structure is described
in own words; no code, art, audio, dialogue, or names are copied.

### Gen 1 — pokered (417-line title asm) + pokeyellow (title + 2 variants)
- File: decomps/pokered/engine/movie/title.asm; decomps/pokeyellow/
  engine/movie/title.asm, title_rb.asm, title_yellow.asm; gfx/title/ dirs.
- Structure: tile-based single screen. Loads logo tiles, version graphic,
  copyright tiles, and a title creature sprite into VRAM, places the
  logo tilemap, places the copyright line, then runs a scrolling creature
  intro (creature scrolls in, then the title loops). No video layer, no
  background swap: the background IS the tilemap. Interchange, Gen 1
  style, would mean swapping the tilemap/palette set — the ancestor of
  the background-layer idea.
- Logo/studio slots: logo tiles in the upper area, copyright line as a
  separate tile row, publisher/studio card graphics loaded as their own
  tile block before the logo. Lesson for Mochiichao: logo, copyright,
  and studio card are separate layers/blocks, never baked into the
  background.

### Gen 2 — pokegold (206-line title asm) + pokecrystal (374-line title asm)
- Files: decomps/pokegold/engine/movie/title.asm, gfx/title/
  (title_bg_gold.pal, title_bg_silver.pal, title_fg.pal, title trails);
  decomps/pokecrystal/engine/movie/title.asm (+ unused_title.asm),
  gfx/title/title.pal.
- Structure: tile-based, two-part decompress (lower part, then upper
  part), version creature sprite decompressed, logo drawn, copyright
  drawn, then a background-animation routine runs (InitializeBackground
  in Crystal) with palette cycling. Crystal adds a gradient applied to
  the logo and a background crystal graphic as a distinct animated
  layer. Two version palettes in Gold (one per version) = the earliest
  on-disk example of a version-swapped background treatment.
- Logo/studio slots: logo + version text drawn as their own rows,
  copyright as line 0 of the tilemap, background as its own animated
  layer behind them.

### Gen 3 — pokeruby (814-line title_screen.c) + pokeemerald (869 lines)
  + pokefirered-leafgreen (1,315-line title_screen.c)
- Files: decomps/pokeruby/src/title_screen.c + include/title_screen.h +
  graphics/title_screen/; decomps/pokeemerald/src/title_screen.c +
  include/title_screen.h + graphics/title_screen/; fresh-start/
  pokefirered-leafgreen/src/title_screen.c + include/title_screen.h.
- Structure (shared Gen 3 pattern, FireRed most developed): a task-driven
  scene state machine — INIT -> flash sprite -> FADEIN -> RUN -> RESTART
  -> CRY (on confirm, the version creature's cry plays, then exit).
  Four background layers (BG 0-3, priorities 0-3, 8bpp on BG 0, 4bpp on
  BG 1-3), each with its own char/map base. Sprite layers on top: logo
  shine sprite, version banner in two halves (left/right sprites that
  slide to a goal Y), press-start + copyright banner sprite, and
  ambient spawner tasks (flame spawners in FireRed, leaf spawners in
  the other version — background particles as tasks, not video).
  Press-start blinks as its own task (Task_TitleScreen_BlinkPressStart).
  Confirm goes to a copyright screen after the title (CB2_InitCopyright
  ScreenAfterTitleScreen), not straight to the menu.
- Background swap, Gen 3 style: swap the BG tilemaps/palettes and the
  spawner task per version. There is NO video file and NO runtime
  background selector in Gen 3 — the background is fixed per version.
  Interchange for Mochiichao is therefore a NEW control on top of the
  Gen 3 layer model, not a port of an existing Gen 3 selector.
- Logo/studio slots: logo shine is a sprite over the logo; version
  banner slides in as two sprites; press-start + copyright is one
  banner sprite. All sit ABOVE the BG layers, never inside them.

### Gen 4 — pokeplatinum (1,426-line title_screen.c) + pokeheartgold
  (863-line title_screen.c) + pokediamond (demo data only)
- Files: decomps/pokeplatinum/src/applications/title_screen.c +
  include/applications/title_screen.h + res/graphics/title_screen/
  (titledemo.order, logo/copyright/border screen files);
  fresh-start/pokeheartgold/src/title_screen.c + include/title_screen.h;
  decomps/pokediamond/files/demo/title/ (titledemo + op_demo NARC
  palette/tile/screen/cell/animation files — NO title app code located,
  so Diamond is data-only in this inventory).
- Structure (Platinum, the fullest Gen 4 model): an application state
  machine — INIT_RESOURCES -> SHOW_INTRO -> INIT_SOUND -> MAIN ->
  EXIT_NORMAL / EXIT_REPLAY_OPENING -> CLEANUP. The intro itself is a
  second state machine (fade from black, wait, fade to white, fade from
  white, reset counter, second white fade, camera move-in over 60
  frames, wait + fade). MAIN is two states: CONFIGURE_BGS, then
  BLINK_TEXT. Layer map is explicit and named: main-screen layer 0 =
  version creature, layer 1 = copyright, layer 3 = creature background;
  sub-screen layer 0 = press-start, layer 1 = logo background 2,
  layer 2 = logo, layer 3 = logo background. Input disabled for the
  first 30 frames after the intro; exit fade delayed 10 frames after
  confirm; opening replays after 900 frames of inactivity.
  HeartGold is the dual-screen version of the same idea: an overlay
  manager with INIT / MAIN / EXIT, a main state machine (WAIT_FADE ->
  START_MUSIC -> PLAY -> PROCEED_FLASH / PROCEED_NOFLASH -> FADEOUT),
  a 3D model state machine (OFF / STOP / RUN, with WAIT_STOP and RUN
  sub-states), a top-screen glow state machine (SETUP / IN / OUT /
  PAUSE), 2D background graphics loaded into the background config,
  and a touch-to-start window that is removed on confirm. Confirm
  fades to white (or black, by path) with palette fades of 5-12 frames.
- Background swap, Gen 4 style: still fixed per version; the "background"
  is a 3D scene + camera curve on one screen and 2D layers on the other.
  Interchange for Mochiichao maps to: one background layer slot that can
  hold any of the staged background videos, with the camera/curve idea
  carried as a slow drift/pan on the video, not as a 3D engine.
- Logo/studio slots: logo has its OWN sub-screen layer, separate from
  its two background layers; copyright has its OWN main-screen layer;
  the studio/publisher card is its own intro beat before the title
  (the intro state machine), not part of the title background.

### Gen 5 — pokebw2 (719-line ov162/title.c, the closest model)
- Files: fresh-start/pokebw2/src/ov162/title.c + include/app/title.h;
  res/graphics/title/ (10 files: image/screen/palette files plus
  black2/ and white2/ version dirs); sound title banks/sequences/
  streams (structure only — no audio copied). The other two title-named
  files (ov214/worldtrade_title.c, ov319/manual_title.c) are other
  screens, not the game title, and are excluded from this inventory.
- Structure: a game-proc state machine — INIT_DISPLAY -> INIT ->
  WAIT_FADE_IN -> RUN -> WAIT_CRY -> FADE_OUT -> WAIT_FADE_OUT ->
  FREE -> END. Four cooperating parts, each with Init / Update / Free:
  TitleSys (system/fade/vblank), TitleBG (2D background: a scrolling
  sub-screen background layer, scrolled one way in one version and the
  other way in the other version — the clearest on-disk precedent for
  a version-dependent background direction), TitleG3D (3D scene: model,
  light, camera, animation curve; curve file differs by version),
  TitleObj (2D objects/actors). Inputs: A/Start -> start menu (after
  the version creature's cry state — cry is a Pokemon piece, swapped
  out in Mochiichao); other buttons -> save-delete and microphone-test
  branches (not title-background work, not carried over). Timeout:
  6,780 frames with no input ends the title without starting anything.
  Confirm flashes white, hides main background layer 3 and the sub
  background/object layers, and puts the 3D scene on the top screen.
- Background swap, Gen 5 style: the background is a scrolling 2D layer
  + a 3D scene with a version-specific curve. For Mochiichao's video
  backgrounds, the portable part is the LAYER SLOT + SCROLL/DRIFT +
  VERSION-DEPENDENT DIRECTION, not the 3D scene itself. This is the
  primary model for the later build: one background slot, swapped
  contents, everything else fixed.
- Logo/studio slots: logo and press-start live on the sub-screen layers
  and the 2D background window; the 3D scene and the scrolling
  background are behind/beside them, never over them.

## 2. Mochiichao's current title setup (read-only, as-is)

Source: fresh-start/src/components/IntroSequence.tsx (538 lines),
fresh-start/src/App.tsx (67 lines). No title/logo/studio-card file was
edited by this task.

- Phases (state machine, already present): CINEMATIC -> TITLE ->
  MAIN_MENU -> SAVE_SLOTS -> PROF_INTRO_1 -> GENDER_SELECT ->
  NAME_ENTRY -> RIVAL_NAME -> PROF_INTRO_2. Any key / click advances
  CINEMATIC -> TITLE -> MAIN_MENU; MAIN_MENU has up/down + confirm and
  B/back to TITLE. Prompt pulse: an 800 ms interval toggling prompt
  opacity (Pokemon's press-start blink is a frame task; Mochiichao's is
  a timed interval — same slot, different clock).
- CINEMATIC phase (studio card slot, DO NOT TOUCH): black screen, text
  "MOCHII STUDIOS", "MOCHIICHAO / DIAMOND VERSION", a star glyph, and
  a "PRESS ANY KEY" prompt. This is the studio-card beat and stays
  exactly as it is.
- TITLE phase (logo slot, DO NOT TOUCH): dark background, a stardust
  pattern overlay at 20% opacity, a teal gradient band at the bottom
  half, a placeholder glyph figure, text "MOCHIICHAO" + "DIAMOND
  VERSION", "PRESS ANY KEY" at the bottom, and a copyright line
  "© 2026 MOCHII STUDIOS. ALL RIGHTS RESERVED." at the very bottom.
  Note: the game code's TITLE phase currently renders a TEXT logo, not
  the locked title image — the locked title art lives in staging (see
  below) and is not wired into this phase by this task.
- Background videos in the GAME tree: 0 found. No <video> element in
  src/, no .mp4/.webm under fresh-start/public/. This is a NEED, not a
  HAVE: the later build must first place the chosen background videos
  into the game tree (or reference the staged ones) before any
  interchange control can run.
- Staged (NOT in the game tree) background material found this pass:
  - sprite-art/title/: title-bg-key-art-v1.png + title-bg-key-art-v2.png
    (key art; v1 is flagged in its spec as NOT final — see its spec's
    v2 note, do not present v1 as final).
  - ui-art/title-backgrounds/: 18 title-bg-*.png files (scene
    backgrounds, v1 + v2 sets), plus title-backgrounds-layer-map.md.
  - ui-art/title-backgrounds/action-videos/: 10 creature title
    animation .mp4 files (v1), plus fullres builds in
    action-videos-fullres/. These are creature animations, NOT
    background videos — do not silently relabel them as backgrounds.
- Locked title art (DO NOT TOUCH): the title lockup composition and
  the v32 menu are owned by the UI-art/title lanes; this plan does not
  name, move, or edit any locked file, and the later build must not
  either. If a locked file's path is needed at build time, it comes
  from the UI-art lane's registry, not from this plan inventing one.

## 3. Staged plan: Pokemon title element -> Mochiichao replacement -> HAVE / NEED

Layer order for the later build (from Gen 4/Gen 5, the fullest models):
background video slot (bottom) -> logo background -> logo (DO NOT
TOUCH) -> version banner (DO NOT TOUCH, part of lockup) -> press-any-key
-> copyright line (top-most text layer). Studio card is a SEPARATE
phase before the title, never a layer inside it.

| # | Pokemon title element (all gens) | Mochiichao replacement in that exact spot | Status |
|---|---|---|---|
| 1 | Title state machine: INIT -> FADEIN -> RUN -> confirm -> FADEOUT, with timeout (BW2: 6,780 frames) and opening replay (Platinum: 900 frames) | IntroSequence phases CINEMATIC -> TITLE -> MAIN_MENU, any-key advance | PARTIAL — phases exist; Pokemon-style fade in/out + timeout/replay are not in the game code |
| 2 | Background layer slot: BG layers (Gen 3: 4 layers, priorities 0-3), scrolling sub background (BW2, version-dependent direction), 3D scene + camera curve (Gen 4/5) | Background VIDEO slot behind the logo, one slot, swapped contents | NEED TO MAKE — no video layer exists in the game tree |
| 3 | Logo layer: its own sprite/layer, above all backgrounds (Gen 3 shine sprite, Gen 4 sub-screen logo layer, Gen 5 sub layers) | Locked Mochiichao logo lockup, in its current spot | HAVE — DO NOT TOUCH |
| 4 | Studio/publisher card: its own tile block (Gen 1), its own intro beat (Gen 4/5 intro state machine) | CINEMATIC phase studio card | HAVE — DO NOT TOUCH |
| 5 | Version banner: two sliding halves (Gen 3), version text row (Gen 2), version-specific palette/curve (Gen 2/5) | "DIAMOND VERSION" banner, part of the logo lockup | HAVE — DO NOT TOUCH |
| 6 | Press-any-key / press-start: its own blink task (Gen 3), BLINK_TEXT state (Gen 4), touch-to-start window (HG) | "PRESS ANY KEY" prompt, 800 ms opacity pulse | HAVE — timing clock differs (interval vs frame task), keep as-is unless Mars changes it |
| 7 | Copyright line: its own tile row (Gen 1/2), its own main-screen layer (Gen 4), its own banner sprite (Gen 3) | "© 2026 MOCHII STUDIOS" bottom line | HAVE — DO NOT TOUCH |
| 8 | Fade transitions: palette fades in/out, white flash on confirm (HG 5-12 frames, Platinum 10-frame exit delay, BW2 white flash + layer hide) | Fade in/out + white flash on TITLE -> MAIN_MENU | NEED TO MAKE — current phase change is instant |
| 9 | Background interchange control + persistence: NO generation ships a runtime background selector (all gens: background fixed per version; Gen 2/5 vary it only by version) | A selector that swaps ONLY the background video slot and persists the choice | NEED TO MAKE — new control, modelled on the version-swap idea, not copied from any gen |
| 10 | Background video assets placed in the game tree | Chosen background videos in the game tree, behind the logo | NEED TO MAKE — 0 video files in the game tree today; staged PNGs and creature .mp4s are not a background list |
| 11 | Timeout / replay behaviour: BW2 timeout, Platinum 900-frame replay | Title idle behaviour (stay, replay, or return) | NEED TO MAKE — decision owed, see §4 |

HAVE: 5/11 = 45% (rows 3, 4, 5, 6, 7). PARTIAL: 1/11 = 9% (row 1 —
state machine present, fades/timeout/replay not Pokemon-shaped).
NEED TO MAKE: 5/11 = 45% (rows 2, 8, 9, 10, 11; row 11 is
decision-gated, see §4).

## 4. Mars-only decisions owed (do not invent in the later build)

1. Background video list: which videos ARE the interchangeable
   backgrounds (staged scene PNGs rendered as video? creature .mp4s?
   a new set?) — the game tree has 0 today, and the staged sets do
   not label themselves as "the background list". Mars picks the list.
2. Interchange control: how the player swaps backgrounds (a menu
   option? a key on the title? automatic rotation? a settings item?) —
   no generation ships this control, so there is no Pokemon default
   to copy; Mars decides the control.
3. Transition timing: fade durations and whether confirm flashes
   white (HG/Platinum/BW2 all flash/fade, but with different frame
   counts) — Mars picks the Mochiichao numbers, or keeps the current
   instant change.
4. Timeout / replay: does an idle title time out, replay an opening,
   or stay forever? BW2 times out at 6,780 frames; Platinum replays
   at 900 frames; a web title may want neither. Mars decides.
5. Title background key art version: v1 is flagged NOT final in its
   spec; whether v2 (or a later version) is the locked background
   behind the video slot is a UI-art lane decision, not this plan's.
6. Logo/studio-card confirmation: this plan assumes the current
   CINEMATIC studio card and TITLE logo lockup are the locked ones.
   If the UI-art lane has a newer locked file, that file — not this
   plan's description — is what the later build must not touch.

## 5. Later build order (queued, AFTER all-sources wiring — not this task)

1. Place Mars's chosen background videos in the game tree (row 10).
2. Add the background video slot behind the logo, lowest layer,
   Pokemon layer order (§3) — logo, studio card, copyright, version
   banner, press-any-key untouched.
3. Add Pokemon-style fade in/out + confirm flash (row 8) using the
   numbers Mars picks in §4.3.
4. Add the interchange control + persistence (row 9) using the
   control Mars picks in §4.2.
5. Add timeout/replay behaviour only as Mars picks in §4.4.
6. Gate: build passes; title shows with each background in the list;
   logo, studio card, copyright, version banner, and press-any-key
   render identically with every background; no locked file changed
   (deletion list 0, logo/studio-card diff 0).

## Sources (paths verified on disk this pass)

- fresh-start/pokefirered-leafgreen/src/title_screen.c (1,315 lines),
  include/title_screen.h; src/intro.c, src/main_menu.c (adjacent, not
  title-background work).
- fresh-start/pokeheartgold/src/title_screen.c (863 lines),
  include/title_screen.h.
- fresh-start/pokebw2/src/ov162/title.c (719 lines),
  include/app/title.h, res/graphics/title/ (10 files).
- decomps/pokered/engine/movie/title.asm (417 lines) + title2.asm,
  gfx/title/; decomps/pokeyellow/engine/movie/title.asm,
  title_rb.asm, title_yellow.asm, gfx/title/.
- decomps/pokegold/engine/movie/title.asm (206 lines), gfx/title/;
  decomps/pokecrystal/engine/movie/title.asm (374 lines),
  unused_title.asm, gfx/title/.
- decomps/pokeruby/src/title_screen.c (814 lines),
  include/title_screen.h, graphics/title_screen/;
  decomps/pokeemerald/src/title_screen.c (869 lines),
  include/title_screen.h, graphics/title_screen/.
- decomps/pokeplatinum/src/applications/title_screen.c (1,426 lines),
  include/applications/title_screen.h, res/graphics/title_screen/;
  decomps/pokediamond/files/demo/title/ (titledemo + op_demo data
  files, no title app code located).
- fresh-start/src/components/IntroSequence.tsx (538 lines),
  fresh-start/src/App.tsx (67 lines) — Mochiichao current setup.
- sprite-art/title/title-bg-key-art-v1.png, title-bg-key-art-v2.png;
  ui-art/title-backgrounds/title-bg-*.png (18 files),
  title-backgrounds-layer-map.md, action-videos/ (10 v1 .mp4 files).
