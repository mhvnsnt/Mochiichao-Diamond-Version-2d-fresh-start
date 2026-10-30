# State-of-the-Art 2026 Research — What Can Actually Be Pulled Into Mochiichao

Date: 2026-10-25. Research only. NOT wired into the game.
Nothing in this file claims a build, a PR, a merge, a deploy,
or a playtest. It is a wiring checklist for main to apply,
PR by PR, after the dirty v5 work in the work clone is settled.
Do NOT edit `~/workspace/mochiichao-work/fresh-start` from this
research — this file is the only output.

Game context, from the two files read first:
- React / Vite / TypeScript web game, 2.5D sprites
  ("looks 3D, runs 2D"), turn-based battles, open-world maps,
  Garden / raising, Creature Mode real-time, Arena Mode.
- Existing shape (assets-code-fill-plan.md, five-region-
  progression-wiring-master.md): maps as data in FULL_WORLD,
  events as data (npcs / events / doors / exits), dialogue as
  data, BattleView, SaveMenu slots, MochiiPlex heal + shop,
  field techs separated from TMs, trainer AI profiles,
  Kenney CC0 tiles restyled, CC0 / credit-required chiptune
  music named but audio system 0% wired.
- Repo rules that still apply: PRs only, additions only,
  no force-push, no history rewrite, deletion check on
  every commit, merge gate reads the deletion list.

How this research was done: web search, 2026-10-25, with
queries for PixiJS / WebGL / WebGPU, ECS / state, asset
pipelines / atlasing / compression, Web Audio, testing /
CI, performance budgets, accessibility, save / cloud sync,
analytics privacy, localization, and live-ops / patching.
Summaries below are paraphrases, not verbatim copies of
any source's text, code, art, or music. Links are the exact
URLs returned by search — check them again at install time,
because versions and licences change. Where a licence was
not confirmed in the search result itself, this file says
"verify the package LICENSE file" instead of asserting it.

## 0. The one decision that shapes everything else

Do NOT rewrite Mochiichao into a different engine.
The 2026 studio standard for a web game like this is
NOT "port to Unreal / Unity native and ship a web export
as an afterthought." Those are full desktop engines whose
web exports are, per the sources found, significantly
larger and slower to load than a purpose-built web game,
and they are not drop-ins for a React / Vite / TypeScript
codebase with its own WorldEngine, BattleView, and
SaveMenu. The same applies, in the other direction, to
"rewrite everything in Phaser" — Phaser is a complete
framework, not a patch, and swapping to it would mean
rebuilding the world, battle, and save systems around
Phaser scenes. The studio-level move here is narrower:
keep React for UI / menus / dialogue, keep the game's
own data model, and replace only the rendering layer
and the systems that are currently missing (audio,
asset pipeline, tests, budgets, save robustness) with
proven open-source pieces, one at a time, behind a
thin adapter so each piece can be removed again.

In short: pull in libraries, not engines. Build the
game, not a new engine.

## 1. Rendering — PixiJS v8 (WebGPU first, WebGL fallback, Canvas last)

2026 studio standard, from sources found:
- PixiJS v8 (v8.16.0 cited as a recent 2026 milestone)
  is a ground-up rewrite: environment-agnostic core,
  first-class WebGPU alongside WebGL, Render Layers
  (draw order independent of scene-graph order),
  aggressive batching (shared-texture sprites grouped
  into few draw calls — one source cites 500 sprites
  from one atlas dropping from hundreds of draw calls
  to fewer than ten), tree-shakeable subpath imports,
  and an experimental Canvas fallback for non-WebGL
  devices.
  Sources: https://www.abratabia.com/pixijs/
  and https://copyprogramming.com/howto/match-3-game-in-pixi-js-101-sprite-basics
- PixiJS is a renderer, NOT a full game engine: it
  has no built-in physics, scenes, input, or audio —
  those are supplied by the game or by add-ons.
  Phaser 3/4, by contrast, ships physics, audio,
  tilemaps, cameras, and particles, but is a bigger
  bundle and a different architecture.
  Source: https://generalistprogrammer.com/comparisons/phaser-vs-pixijs
  and https://wpdean.com/what-is-pixijs/

What fits Mochiichao:
- PULL: PixiJS v8 as the world / battle / arena render
  layer only, behind a `Renderer` adapter. React keeps
  menus, dialogue, shop, roster, and save UI. One
  Pixi canvas for the world, one for battles if needed,
  never one canvas per sprite.
- Licence: MIT, confirmed in search results for PixiJS.
  Source: https://www.linuxlinks.com/pixijs-html5-creation-engine/
- What to build, not pull: the 2.5D look itself —
  fake-perspective scaling, sort order by Y, shadow
  ellipses, and the "looks 3D, runs 2D" camera. No
  library gives Mochiichao its look; PixiJS only draws
  it fast.
- What does NOT fit: Three.js / Babylon.js as the
  main renderer (3D-first, heavier, wrong tool for a
  2.5D sprite game), a raw Canvas 2D rewrite for
  thousands of sprites (fine under ~100 sprites, not
  for a full map + particles), and a new renderer
  from a 2026 benchmark blog (one source claims a
  small renderer beats PixiJS on synthetic particle
  tests — interesting, not a production replacement;
  do not swap a proven renderer on a benchmark alone).
  Source for the benchmark caution: https://debuff.jp/research/how-spryte-got-fast

Wiring step (after the audio / save steps below, or
in parallel on a separate branch — never in the same
PR as a world-map change):
1. Add `pixi.js` as a dependency, import only needed
   subpaths, measure bundle before / after.
2. Build a throwaway Pixi scene that draws the
   existing Sector 0 map data (tiles + NPCs + player)
   with one atlas, `roundPixels: true`, nearest
   filtering, integer scaling.
3. Prove the acceptance check: 60 fps on a mid phone
   with the map + 20 NPCs + particles, draw calls in
   single digits for the tile layer, no React re-render
   per frame (React renders UI state only; Pixi owns
   the frame loop).
4. Only then migrate WorldEngine rendering behind
   the adapter, map by map, keeping the CSS/emoji
   renderer as a fallback flag until the Pixi path
   passes the existing playtest gates.

## 2. Framework choice — what to pull, what to leave alone

- PULL (later, only if a system is missing): Phaser 4
  ideas, not Phaser itself — its scene / camera /
  tween patterns can be copied as design patterns in
  Mochiichao's own code, without importing Phaser.
  Phaser 4 was cited as released April 2026 with a
  rebuilt renderer; Phaser 3 used its own renderer,
  not PixiJS.
  Source: https://wpdean.com/what-is-phaser/
- LEAVE ALONE: Unreal, Unity native, Godot HTML5
  export as a "drop-in" — all three are full engines
  with editors and Wasm / WebGL exports, not patches
  for a React web game. Godot is the closest fit if
  a future native port is ever wanted, and that is a
  separate project, not a 2026 wiring step.
  Source: https://www.abratabia.com/pixijs/ (Unity /
  Godot web-export size / load discussion)
- LEAVE ALONE for now: melonJS, Cocos Creator, and
  PlayCanvas — competent, but each adds a second
  engine's opinions without solving a problem
  Mochiichao actually has today (rendering, audio,
  saves, tests).

## 3. ECS and state — bitECS for the hot loop, Zustand for UI state

2026 studio standard, from sources found:
- For game state, selector-based subscriptions beat
  Context re-renders: a component re-renders only
  when the slice it selected changes. Zustand is
  cited as the recommended default for most games
  (~1.2 KB gzipped in the source), Jotai for complex
  derived / atomic state, Context only for rarely
  changing data (theme, settings), and Redux as
  excessive boilerplate for game state.
  Source: https://copyprogramming.com/howto/javascript-how-is-right-to-make-react-game
- For simulation, ECS (entities = IDs, components =
  pure data, systems = logic) is the data-oriented
  pattern: bitECS 0.4 is a TypeScript rewrite with
  relationships, observers (onAdd / onRemove / onSet /
  onGet), prefabs, and And / Or / Not queries.
  Source: https://bitecs.dev/docs/introduction
- TypeScript 5.9 (GA Feb 2026 cited) with `"strict":
  true` and discriminated unions for game states is
  the cited 2026 baseline; a TS7 native compiler
  preview is cited as faster, but is a preview, not
  a production dependency to adopt today.
  Source: https://copyprogramming.com/howto/typescript-best-esports-game-ever-code-example

What fits Mochiichao:
- PULL: Zustand, but split, not one store. Keep the
  existing gameStore shape and split it into:
  `uiStore` (menu, dialogue, view — React re-renders
  allowed), `saveStore` (party, roster, flags, badges —
  written to disk, never re-rendered per frame), and
  `settingsStore` (volume, remaps, accessibility —
  persisted separately from the save).
- PULL (only for Creature Mode / Arena Mode hot loops):
  bitECS for moving entities (position, velocity,
  hitbox, cooldown) — NOT for the whole game. Turn-
  based battles, Garden, and dialogue do not need ECS
  and would get slower and harder to read if forced
  into it.
- Licences: verify the LICENSE file in each package
  at install time (Zustand, bitECS, and Jotai are
  commonly MIT — do not ship on this sentence alone;
  the install PR must record the licence found).
- What to build, not pull: the save schema itself
  (see §8), the battle state machine (turn phases as
  a discriminated union: `select | animate | resolve |
  faint | victory`), and the Garden tick (Garden time
  runs only while the save is loaded, per the Chao
  conversion — do not run it in a background worker
  that drifts the save).

Wiring step:
1. Split the store, no behaviour change, tests pass.
2. Add a bitECS world for Creature Mode only, with
   Position / Velocity / Hitbox / Cooldown components
   and Movement / Collision / Cooldown systems, and a
   fixed timestep (see §6) so Creature Mode is
   deterministic, not frame-rate dependent.
3. Acceptance: UI re-renders do not spike during
   Creature Mode movement; battle state cannot be
   in two phases at once (exhaustive switch check).

## 4. Asset pipeline — atlases, compression, and a build that fails loudly

2026 studio standard, from sources found:
- One texture atlas per theme, not one file per sprite:
  batching, draw-call reduction, and one GPU upload
  per atlas. Pixel art: source at authored resolution,
  scale in-engine at integer multiples, nearest
  filtering, or edges blur.
  Source: https://app.cinevva.com/game-assets/free-tilesets
  (atlas / integer-scaling guidance, via search)
- GPU texture compression: Basis Universal / KTX2
  (UASTC near-lossless, ETC1S tiny) transcoded at load
  to the GPU's native format (BC7 desktop, ASTC mobile,
  ETC mobile), so a texture stays compressed in VRAM
  instead of expanding to raw RGBA (one source cites
  a 4K PNG expanding to 64 MB in VRAM, and KTX2
  cutting GPU memory by up to ~80% in that write-up).
  For 2D pixel art, this is a later optimisation, not
  the first one — WebP / PNG atlases come first, KTX2
  second, and only if VRAM is actually measured as a
  problem.
  Sources: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
  and https://www.webcodingcenter.com/babylon-js/loading-gltf-and-the-asset-container--ktx2-and-basis-universal-texture-compression.html
  and https://dev.to/theassetbench/slope-of-the-3d-saas-tax-why-asset-bench-is-the-local-first-toolkit-weve-been-waiting-for-24ke
- Production builds: minify, tree-shake, content-hash
  filenames, brotli / gzip, split vendor chunks.
  Source: https://generalistprogrammer.com/tutorials/webgl-game-development-complete-browser-gaming-guide-2025

What fits Mochiichao:
- PULL: a scripted pipeline, not a new tool, first:
  `scripts/build-assets.mjs` (or a Vite plugin) that
  takes `assets/src/<theme>/*.png`, packs them into
  one atlas + JSON (frames, trimmed, rotated off),
  emits WebP + PNG fallbacks, and fails the build
  if any atlas exceeds 2048×2048 or any frame is
  missing. Use an existing packer library only if
  the script proves too slow — TexturePacker is a
  paid tool, not a default; free packers exist, but
  the script + a manifest is enough for 16×16 tiles.
- PULL (when VRAM is measured): KTX-Software /
  Basis Universal transcoding for large background
  atlases only, never for small UI icons.
- What to build, not pull: the Mochiichao palette
  restyle step (Kenney CC0 tiles → teal / cream /
  data-blue) as a checked-in script, so a restyle
  is reproducible, not a one-off edit in an image
  editor that no one can repeat.
- Licence note: Kenney CC0 (already in the assets
  plan) needs no attribution; any new packer tool's
  licence must be recorded in the PR, and raw packs
  with "no redistribution" terms must never be put
  in the public repo as ZIPs (already the rule for
  the reodesuxz pack).

Wiring step, in order:
1. Atlas script + manifest, one theme (town) first.
2. Bundle / atlas size report in CI (see §6).
3. Lazy-load atlases per region (Region 1 atlas on
   boot, Region 2 atlas on ferry, etc.) — never load
   all five regions' atlases at title.
4. Only then evaluate KTX2, with a VRAM measurement
   before / after on a mid phone.

## 5. Web Audio — raw Web Audio first, a thin manager, no autoplay hacks

2026 studio standard, from sources found:
- Web Audio API, not `<audio>` tags, for games:
  `AudioBufferSourceNode` with `loop = true`,
  `loopStart` / `loopEnd` for seamless loops, GainNode
  ramps for crossfades (20–50 ms cited for loop
  switches, longer for music changes), recreate nodes
  per play (nodes are one-shot), reuse buffers, resume
  the context on a user gesture, handle the
  `interrupted` state, and use AudioWorklet for custom
  DSP instead of the deprecated ScriptProcessorNode.
  OGG / Opus is cited as the better loop format than
  MP3 (MP3 gap), with OGG preferred for compression.
  Sources: https://copyprogramming.com/howto/audiobuffersourcenode
  and https://copyprogramming.com/howto/stop-looping-audio-with-javascript-but-completing-playing-iteration
  and https://copyprogramming.com/howto/html5-audio-loop-from-point-a-to-b
- Libraries (Howler.js, Tone.js) abstract cross-
  browser quirks and add crossfade helpers, but the
  manager underneath is still Web Audio. Howler is
  the smaller pull if the raw manager proves fiddly;
  Tone.js is the larger pull for generative / scheduled
  music and is not needed for loop + SFX playback.

What fits Mochiichao:
- PULL: nothing at first except the browser API
  itself, plus a small original `AudioManager`:
  `init on first gesture → load (fetch + decodeAudioData,
  cached buffers) → playLoop(track, crossfade) →
  playSFX(name) → duck music on dialogue / battle →
  mute / volume per bus (music, SFX, UI) → resume on
  gesture`. This is the audio system that the assets
  plan lists as 0% wired — it is the single most
  valuable "missing system" pull in this file.
- PULL (only if needed): Howler.js for its fallback
  and sprite support, behind the same manager interface,
  so swapping it in does not rewrite call sites.
- Licences: verify Howler / Tone LICENSE files at
  install time; the CC0 / credit-required music packs
  from the assets plan (hyperpixel CC0, Tallbeard CC0,
  Quillbit / Vacuous with credit) are the tracks, not
  the player — do not confuse the two licences.
- What to build, not pull: the track map (title,
  town, route, forest, cave, harbour, neon, battle,
  boss, elite, champion, ending — one loop per scene,
  battle overrides route, victory jingle on win, no
  music change on dialogue alone, per the assets plan),
  and the autoplay rule: never unmute without a user
  gesture, never auto-play on page load.

Wiring step:
1. AudioManager + mute / volume settings + a silent
   fallback if the context is suspended.
2. One loop (town) + one SFX (confirm) + one jingle
   (victory), wired to the existing settings screen.
3. Full track map, region by region, with crossfade
   on map change and ducking on battle.
4. Acceptance: no audio on first paint, no gap on
   loop, no click on switch, no crash on iOS Safari
   (resume on touch, buffers under 100 MB cited as a
   mobile guideline).

## 6. Testing, CI, and performance budgets — the gate that makes "100%" mean something

2026 studio standard, from sources found:
- Vitest is the community default for new web projects
  (cited as 30–70% faster in CI than Jest, with browser
  mode in v4 running tests in a real browser via
  Playwright for canvas / layout / worker code).
  Playwright for E2E, with PerformanceObserver injected
  before navigation to capture FCP / LCP without flaky
  `waitForTimeout` sleeps.
  Sources: https://tech-insider.org/vitest-vs-jest-2026/
  and https://dev.to/styrow_dev/how-do-you-measure-and-assert-core-web-vitals-or-other-performance-metrics-within-a-playwright-42cb
- Performance budgets enforced in CI, not just
  Lighthouse spot-checks: LCP under 2.5 s, INP (not
  FID — FID retired March 2024), CLS, and Lighthouse
  CI against the deployed preview, failing the PR
  if budgets are missed. Field data via the web-vitals
  library, because lab scores miss slow devices.
  Sources: https://www.techinterview.org/post/3233475391/frontend-testing-2026-vitest-playwright-visual-regression/
  and https://www.netguru.com/blog/web-development-best-practices
  and https://www.plerdy.com/core-web-vitals-checklist/
- Visual regression: 2–3 shots per critical page
  (desktop, mobile, one interactive state), with
  masking for dynamic content (timestamps, animations)
  or the tests cry wolf.
  Source: https://dev.to/delta-qa/frontend-testing-in-2026-the-complete-guide-to-strategies-and-tools-1kf4

What fits Mochiichao:
- PULL: Vitest (unit: battle damage, type chart,
  save migration, Garden tick, trainer AI move pick),
  Playwright (E2E: the 10 playtest gates in the wiring
  master, fresh save, no cheats, 390×844 phone viewport
  included), Lighthouse CI (preview URL only), and
  `bundlesize` / a Vite bundle report (JS + atlas
  budgets, see below).
- What to build, not pull: the playtest gates as
  tests (truck start → Codex → Sprint Boots → Dojo 1
  → … → Mythar, with save / load returning to the
  saved map), and a fixed-timestep game loop test
  (Creature Mode at 30 fps and 120 fps must advance
  the same distance).
- Budgets to set in the first CI PR (starting points,
  tighten later, never loosen silently):
  - Initial JS (gzipped, first paint): ≤ 300 KB.
  - Total JS + CSS on first load: ≤ 600 KB.
  - First region atlas (town + creatures): ≤ 2 MB.
  - LCP (preview, desktop): < 2.5 s. INP: < 200 ms.
  - Frame time (world, mid phone): p95 < 16.7 ms.
  - No new dependency without a bundle-size note in
    the PR.

Wiring step:
1. Vitest + 10 unit tests (battle, save, Garden tick).
2. Playwright + 3 E2E gates (new game → Dojo 1,
   save / load, battle win / loss).
3. Lighthouse CI + bundle budgets, failing the PR.
4. Visual regression for title, world, battle, and
   dialogue — masked animations, phone + desktop.

## 7. Accessibility — WCAG 2.2 AA as a checklist, not a mode

2026 studio standard, from sources found:
- Semantic HTML for menus (`<button>`, `<nav>`,
  `<dialog>`), `aria-label` for icon-only controls,
  focus moved to the first element on open and
  returned on close, `aria-live` for dynamic changes
  (score, HP, turn), and colour never as the only
  signal (shape / icon / position / pattern too).
  Source: http://dev.to/oceanviewgames/building-accessible-games-wcag-for-interactive-content-4eim
- A 10-item baseline that covers most needs:
  remappable controls, subtitles with size / background
  / speaker labels, colourblind-safe design, genuine
  pause (no timers running behind the pause menu),
  adjustable text size / UI scale (2× minimum),
  difficulty / assist options, audio cues for visual
  events and visual cues for audio events, reduce-
  motion / disable-camera-shake, aim / precision aids,
  high-contrast mode.
  Source: https://datafield.dev/video-game-design/appendices/appendix-i-accessibility-checklist.html
- Settings as one dictionary per device, applied at
  once, rules unchanged by options (a player with
  every option on plays the same game), separate
  volumes for world / UI / music, hold vs. toggle
  alternatives, and text scaling that rearranges
  layouts instead of clipping.
  Source: https://cobomakesgames.com/blog/accessibility-settings-in-games/
- Reference standard cited by studios: WCAG 2.2,
  Level AA, with manual keyboard / screen-reader
  testing (VoiceOver, NVDA) alongside automated
  axe-core checks, because automated tools catch
  only a portion of real problems.
  Sources: https://www.uniagames.com/accessibility/
  and https://www.techinterview.org/post/3233475391/frontend-testing-2026-vitest-playwright-visual-regression/

What fits Mochiichao:
- PULL: axe-core in Vitest / Playwright (one assertion
  per component, not one giant page scan), and a
  single `settings` dictionary (see §3) with keys for
  text scale, high contrast, reduced motion, screen
  shake off, remaps, hold-to-toggle, and three volume
  buses.
- What to build, not pull: the game's own accessibility
  layer — dialogue as real text (not canvas-only text)
  for menus, `aria-live` announcements for battle
  turns ("Mochii used Tackle — 12 damage"), keyboard-
  only play for the whole overworld (no mouse-only
  doors), and a "photosensitivity" flag that disables
  flashing / shake globally.
- What does NOT fit: a separate "accessible mode"
  that changes rules, or a colourblind mode that only
  swaps a palette without adding shape / icon signals.

Wiring step:
1. Settings dictionary + text scale + reduced motion
   + shake off + remaps, applied at once.
2. axe-core in CI, WCAG 2.2 AA, with a manual
   keyboard-only pass of title → new game → Dojo 1.
3. `aria-live` battle announcements + dialogue as
   text, then a screen-reader pass (NVDA / VoiceOver)
   on menus only — world canvas narration is a later,
   separate project, not a blocker for the first pass.

## 8. Save, cloud sync, and analytics privacy — local first, cloud optional, no tracking by default

2026 studio standard, from sources found:
- Storage tiers: localStorage 5–10 MB (sync, simple
  prefs only), IndexedDB 50 MB+ / gigabytes by disk
  (async, structured, the right tier for a game save),
  Cache Storage for offline assets, cookies 4 KB
  (auth only, HttpOnly). IndexedDB has no built-in
  sync — sync is custom logic, Background Sync, or a
  library like PouchDB / Dexie Cloud on a CouchDB-
  compatible backend.
  Sources: https://copyprogramming.com/howto/how-do-i-save-an-object-in-indexeddb
  and https://dev.to/godofgeeks/indexeddb-vs-localstorage-40n6
  and https://www.abratabia.com/game-saves/
- Privacy: local-only data (localStorage / IndexedDB
  on the player's device) is not the same compliance
  burden as server data, but cloud saves, leaderboards,
  analytics, and auth records ARE subject to GDPR /
  CCPA, need a privacy policy, consent before tracking
  cookies, and a view / export / delete path for the
  player's data. The cited indie approach: privacy-
  respecting analytics or none at all, a deletion
  endpoint, and no tracking cookies without consent.
  Source: https://www.abratabia.com/game-saves/

What fits Mochiichao:
- PULL: IndexedDB for saves (via a tiny wrapper or
  Dexie — verify licence at install), with a
  versioned schema: `saveVersion` + migration functions
  (v1 → v2 → …), never a blind overwrite. Keep the
  existing SaveMenu slots, but store each slot as
  one IndexedDB record + a localStorage pointer, with
  a checksum and a backup slot (last good save) so a
  corrupted write does not eat the game.
- PULL (only if cloud is ever wanted): Supabase or
  Firebase Realtime for sync, with last-write-wins
  explicitly rejected — the correct rule for a single-
  player game is "newer saveVersion wins, and on
  conflict, keep both slots and let the player pick."
  Do not add cloud sync before local IndexedDB is
  solid; cloud is a feature, not a fix for a broken
  local save.
- PULL: no analytics by default. If analytics is ever
  added, use a privacy-respecting, self-hosted or
  cookieless tool, aggregate only (no player IDs, no
  IP storage), and put an opt-out in settings that
  actually stops collection. Never add a third-party
  tracker to a children's / family game without a
  separate decision in main.
- What to build, not pull: save migration tests
  (every old saveVersion loads into the new schema),
  a save export / import file (JSON, player-owned,
  for backup and for moving devices without a cloud),
  and a "delete all my data" button that actually
  deletes IndexedDB + localStorage + any server record.

Wiring step:
1. IndexedDB save store + versioned schema + backup
   slot + export / import, with migration tests.
2. Settings persisted separately from saves (so a
   save delete does not wipe accessibility settings).
3. Only then, if wanted, cloud sync with the
   conflict rule above and a privacy policy page.

## 9. Localization — ICU first, strings out of code from day one

2026 studio standard, from sources found:
- Externalize every string to resource files (JSON /
  YAML, hierarchical keys like `battle.win`), use ICU
  MessageFormat for plurals / selects / ordinals
  (`{count, plural, one {# item} other {# items}}`),
  never concatenate fragments in code, design for
  ~30% text expansion (German), use logical CSS
  (`margin-inline-start`, not `margin-left`) for RTL,
  and lint for missing keys / placeholder mismatches
  in CI. AI translation for drafts + human review for
  story text is the cited 2026 workflow, with
  pseudo-localization testing early.
  Sources: https://copyprogramming.com/howto/best-way-to-design-for-localization-of-strings
  and https://copyprogramming.com/howto/how-to-get-started-with-internationalization-in-javascript
  and https://dev.to/jancizmar/react-i18n-libraries-in-2026-a-practical-comparison-lbe
- For React: react-i18next (mature, own format) vs.
  FormatJS / react-intl and Lingui (ICU native) —
  ICU is the industry standard across Java / Android /
  iOS and translation platforms, so ICU-native wins
  if the game ever leaves English. i18next v24 and
  Lingui v5.4 / FormatJS v7 are cited as current, with
  build-time message compilation as the performance
  move.
  Source: https://dev.to/jancizmar/react-i18n-libraries-in-2026-a-practical-comparison-lbe

What fits Mochiichao:
- PULL: FormatJS (react-intl) OR Lingui, ICU-native,
  with messages compiled at build time and lazy-loaded
  per locale. Do NOT pull react-i18next without its
  ICU plugin if ICU is the goal — its default format
  is not ICU and conversion later is painful.
- What to build, not pull: the string extraction
  itself — every dialogue line, town sign, shop label,
  and battle message in the story-fill files must
  become a key (`dialogue.sector0.mom.truck.1`, etc.)
  with context comments for translators, before any
  translation is attempted. English is the fallback
  for missing keys, never a duplicated English string
  in another locale file.
- Wiring step:
  1. Extract strings to `locales/en.json` (ICU), with
     a CI lint that fails on a hardcoded user-facing
     string in new code.
  2. Pseudo-locale test (expanded + bracketed text)
     on title, dialogue, battle, and shop — fix
     clipping before translating anything.
  3. Only then add a second locale, with human review
     of story text and a glossary (Mochiichao names,
     dojo names, tech names are NOT translated unless
     Mars says so — record that decision).

## 10. Live-ops and patching — PWA with a versioned service worker, never a silent breaking update

2026 studio standard, from sources found:
- Service worker lifecycle: install (precache) →
  waiting → activate (delete old caches, claim) →
  fetch. Versioned cache names (v1 → v2) trigger
  updates; `skipWaiting()` + `clients.claim()` for
  immediate activation, or a user prompt ("New version
  available — reload?") for a game, so a player is
  never mid-battle when the code swaps underneath them.
  Strategies: cache-first for static assets,
  stale-while-revalidate for most content, network-
  first for APIs / saves. HTTPS mandatory, service
  worker under ~50 KB, no sensitive data in caches.
  Sources: https://udn.realityripple.com/docs/Web/Progressive_web_apps/Offline_Service_workers
  and https://copyprogramming.com/howto/how-to-force-service-worker-to-update
  and https://dev.to/timevolt/building-pwas-offline-first-like-a-jedi-master-43lj
- PWA limits to plan around, especially iOS: install
  only from the share sheet, push only after install
  and a user tap, no background sync / periodic sync
  while closed, no store listing / IAP in a PWA.
  Source: https://www.forasoft.com/blog/article/pwa-could-ruin-your-business
- Workbox (via vite-plugin-pwa, MIT, confirmed in
  search) automates precaching, runtime caching, and
  the update prompt, and is the recommended way to
  avoid hand-writing a service worker.
  Source: https://awesome.ecosyste.ms/projects/github.com%2Fvite-pwa%2Fvite-plugin-pwa

What fits Mochiichao:
- PULL: vite-plugin-pwa (MIT) + Workbox, with a
  manifest (icons, theme colour, standalone display),
  precache of the shell + first-region atlas, runtime
  caching for later regions, and an update prompt
  that only reloads when the player is NOT in battle
  or dialogue (check the game state first — this is
  a game-specific rule no generic PWA template knows).
- What to build, not pull: the version / migration
  contract — a new build must never load an old save
  without running its migration (see §8), and a new
  build must never delete a save on update. Test
  this explicitly: old save + new build = migrated
  save, not a blank game.
- What does NOT fit: silent auto-update on every
  load (breaks mid-battle), background sync as a
  save mechanism (not reliable on iOS while closed),
  or a native wrapper (Capacitor) before the PWA
  itself is solid.

Wiring step:
1. vite-plugin-pwa + manifest + precache shell,
   offline page ("You are offline — your save is
   local, reconnect to update").
2. Update prompt gated on game state (not in battle
   / dialogue), with old-cache cleanup on activate.
3. Update + save-migration test in Playwright.

## 11. Input, touch, and gamepad — one input layer, remappable from day one

2026 studio standard (from the accessibility sources
in §7, applied to input): every control remappable,
hold vs. toggle alternatives, adjustable sensitivity /
dead zones, keyboard + mouse + touch + gamepad, and
no mouse-only or touch-only action.
What fits Mochiichao:
- PULL: nothing heavy — a small original `Input`
  layer (keyboard map, touch D-pad + buttons, Gamepad
  API polling) that emits game actions (`move`,
  `confirm`, `cancel`, `run`, `menu`), not raw keys,
  so remapping is a settings change, not a code change.
- What to build: the remap UI (in settings, with
  conflict detection), touch controls that do not
  cover the dialogue box, and a gamepad dead-zone
  setting. Creature Mode needs analog movement; turn-
  based battles need D-pad navigation — both go
  through the same action layer.
- Wiring step: Input layer first, remap UI second,
  gamepad third. Acceptance: the whole overworld and
  battle can be played keyboard-only, touch-only, and
  gamepad-only, with no action that requires a mouse.

## 12. Security and crash handling — small, but studio-level

- Content Security Policy with nonces, not a wildcard
  `unsafe-inline` fallback, dependency + secrets
  scanning on every PR, and human review of AI-
  generated code — all cited as 2026 baseline checks.
  Source: https://www.netguru.com/blog/web-development-best-practices
- Crash / error reporting: a lightweight, privacy-
  respecting reporter (Sentry is the commonly cited
  option, but only with PII scrubbing and an opt-out;
  otherwise, log errors to a local file the player
  can export). Never send a save file, a player name,
  or a roster to a third party without consent.
- What fits: CSP + scanning in CI first, error
  boundary in React (a crashed battle view must not
  eat the save — recover to the world with the party
  intact), and a "report a bug" export (save version,
  build version, last map, no personal data).

## Wiring checklist — in order of impact (do these in this order)

Impact order is by what unblocks the most other work
and what breaks the least if it is wrong. Each step
is one PR, with its acceptance check, and the PR must
record licences found, bundle size before / after,
and the playtest gate it passes. NOTHING below is
wired yet — this checklist is 0/24 steps wired = 0%.

1. [ ] Zustand split (ui / save / settings) — no behaviour change, tests pass.
2. [ ] IndexedDB save store + versioned schema + backup slot + export / import + migration tests.
3. [ ] AudioManager (raw Web Audio) + mute / volume buses + town loop + confirm SFX + victory jingle.
4. [ ] Asset atlas script (town theme first) + manifest + build failure on missing / oversized atlas.
5. [ ] Vitest unit tests (battle, type chart, save migration, Garden tick, AI move pick).
6. [ ] Playwright E2E gates (new game → Dojo 1, save / load, battle win / loss), phone + desktop.
7. [ ] Bundle + atlas budgets in CI, failing the PR (see §6 numbers).
8. [ ] PixiJS v8 renderer adapter, Sector 0 throwaway scene first, 60 fps + draw-call check.
9. [ ] Migrate WorldEngine rendering behind the adapter, map by map, CSS fallback flag kept.
10. [ ] bitECS world for Creature Mode only (Position / Velocity / Hitbox / Cooldown, fixed timestep).
11. [ ] Battle state machine as a discriminated union, exhaustive phase check.
12. [ ] Settings dictionary + text scale + reduced motion + shake off + remaps + hold/toggle.
13. [ ] axe-core in CI (WCAG 2.2 AA) + keyboard-only pass + aria-live battle announcements.
14. [ ] Input layer (keyboard / touch / gamepad → actions) + remap UI + conflict detection.
15. [ ] String extraction to ICU `locales/en.json` + CI lint on hardcoded user-facing strings.
16. [ ] Pseudo-locale test, fix clipping, then (only then) a second locale with human review.
17. [ ] Lazy-load atlases per region (Region 1 on boot, later regions on their story link).
18. [ ] KTX2 / Basis evaluation, only with a VRAM measurement before / after on a mid phone.
19. [ ] vite-plugin-pwa + manifest + precache shell + offline page.
20. [ ] Update prompt gated on game state (not in battle / dialogue) + old-cache cleanup.
21. [ ] Update + save-migration test (old save + new build = migrated save, never blank).
22. [ ] CSP + dependency / secrets scanning in CI + React error boundary (battle crash → world, party intact).
23. [ ] Privacy-respecting error reporting (opt-out, PII scrubbed) or local export only — one, not both, decided in main.
24. [ ] Lighthouse CI on preview + web-vitals field reporting (aggregate only, no player IDs).

## Top 5 highest-impact pulls (if only five get done)

1. PixiJS v8 renderer adapter (§1) — turns the CSS/emoji
   world into a real 2.5D renderer without rewriting
   the game, and unblocks particles, sorting, and
   Creature / Arena presentation.
2. Zustand split + IndexedDB versioned saves (§3, §8) —
   stops save corruption from eating a five-region
   game, and makes every later system (Garden, cloud,
   export) possible.
3. Raw Web Audio manager + track map (§5) — the
   currently 0% system, cheapest to build, biggest
   feel change for the least code.
4. Asset atlas pipeline + CI budgets (§4, §6) — stops
   the bundle and VRAM from growing silently as five
   regions of art land, and makes "100%" measurable.
5. Vitest + Playwright + Lighthouse CI gates (§6) —
   turns the wiring master's 10 playtest gates from
   manual checks into a PR gate, so a later region
   cannot silently break an earlier one.

## What does NOT fit, stated plainly

- Unreal / Unity native as a drop-in: wrong delivery
  model for a React web game, larger / slower web
  exports, full-engine rewrite, not a patch.
- A full Phaser rewrite: complete framework, not a
  library; rebuilding WorldEngine / BattleView / SaveMenu
  around Phaser scenes is a new project, not a wiring step.
- Three.js / Babylon.js as the main renderer: 3D-first,
  heavier, wrong tool for 2.5D sprites.
- Godot HTML5 export as a patch: full engine + Wasm,
  editor workflow, separate project if a native port
  is ever wanted.
- A benchmark-only renderer swap: a synthetic particle
  benchmark is not production evidence.
- Cloud sync before local saves are solid, silent
  auto-updates mid-battle, analytics with player IDs
  by default, and any licence-disregard rule: all
  rejected in this checklist, for the reasons in §8
  and §10. Licences must be recorded in each install
  PR, and LPC / share-alike art stays reference-only
  until a licence decision in main (per the assets plan).

## Sources actually found (search, 2026-10-25 — re-check at install)

- PixiJS v8: https://www.abratabia.com/pixijs/
- PixiJS 2026 features: https://copyprogramming.com/howto/match-3-game-in-pixi-js-101-sprite-basics
- Phaser vs PixiJS: https://generalistprogrammer.com/comparisons/phaser-vs-pixijs
- PixiJS guide / Phaser 4: https://wpdean.com/what-is-pixijs/ and https://wpdean.com/what-is-phaser/
- PixiJS MIT: https://www.linuxlinks.com/pixijs-html5-creation-engine/
- Renderer benchmark caution: https://debuff.jp/research/how-spryte-got-fast
- React game state / Zustand: https://copyprogramming.com/howto/javascript-how-is-right-to-make-react-game
- bitECS: https://bitecs.dev/docs/introduction
- TypeScript 2026: https://copyprogramming.com/howto/typescript-best-esports-game-ever-code-example
- Asset atlas guidance: https://app.cinevva.com/game-assets/free-tilesets
- WebGL best practices / Basis: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- KTX2 / Basis: https://www.webcodingcenter.com/babylon-js/loading-gltf-and-the-asset-container--ktx2-and-basis-universal-texture-compression.html
- Asset Bench / KTX2: https://dev.to/theassetbench/slope-of-the-3d-saas-tax-why-asset-bench-is-the-local-first-toolkit-weve-been-waiting-for-24ke
- WebGL distribution / compression: https://generalistprogrammer.com/tutorials/webgl-game-development-complete-browser-gaming-guide-2025
- Web Audio loops: https://copyprogramming.com/howto/audiobuffersourcenode
- Web Audio graceful stop / crossfade: https://copyprogramming.com/howto/stop-looping-audio-with-javascript-but-completing-playing-iteration
- HTML5 audio loops: https://copyprogramming.com/howto/html5-audio-loop-from-point-a-to-b
- Vitest vs Jest 2026: https://tech-insider.org/vitest-vs-jest-2026/
- Playwright Core Web Vitals: https://dev.to/styrow_dev/how-do-you-measure-and-assert-core-web-vitals-or-other-performance-metrics-within-a-playwright-42cb
- Frontend testing 2026: https://www.techinterview.org/post/3233475391/frontend-testing-2026-vitest-playwright-visual-regression/
- Web best practices 2026 / CSP / scanning: https://www.netguru.com/blog/web-development-best-practices
- Core Web Vitals checklist: https://www.plerdy.com/core-web-vitals-checklist/
- Frontend testing guide: https://dev.to/delta-qa/frontend-testing-in-2026-the-complete-guide-to-strategies-and-tools-1kf4
- Accessible games / WCAG: http://dev.to/oceanviewgames/building-accessible-games-wcag-for-interactive-content-4eim
- Accessibility checklist: https://datafield.dev/video-game-design/appendices/appendix-i-accessibility-checklist.html
- Accessibility settings: https://cobomakesgames.com/blog/accessibility-settings-in-games/
- Accessibility statement / WCAG 2.2 AA: https://www.uniagames.com/accessibility/
- Game saves / privacy: https://www.abratabia.com/game-saves/
- IndexedDB guide: https://copyprogramming.com/howto/how-do-i-save-an-object-in-indexeddb
- IndexedDB vs localStorage: https://dev.to/godofgeeks/indexeddb-vs-localstorage-40n6
- Localization best practices: https://copyprogramming.com/howto/best-way-to-design-for-localization-of-strings
- i18n getting started: https://copyprogramming.com/howto/how-to-get-started-with-internationalization-in-javascript
- React i18n comparison / ICU: https://dev.to/jancizmar/react-i18n-libraries-in-2026-a-practical-comparison-lbe
- PWA offline / service workers: https://udn.realityripple.com/docs/Web/Progressive_web_apps/Offline_Service_workers
- Service worker updates: https://copyprogramming.com/howto/how-to-force-service-worker-to-update
- PWA limits / iOS: https://www.forasoft.com/blog/article/pwa-could-ruin-your-business
- PWA Workbox guide: https://ultimatecourses.com/blog/ultimate-guide-pwa-workbox
- PWA offline-first: https://dev.to/timevolt/building-pwas-offline-first-like-a-jedi-master-43lj
- vite-plugin-pwa MIT: https://awesome.ecosyste.ms/projects/github.com%2Fvite-pwa%2Fvite-plugin-pwa
- JS game engines 2026: https://codersera.com/blog/top-javascript-game-engines-and-libraries/

## Count, for the parent report

- Areas researched: 12/12 = 100% of the areas named in
  the task (rendering, framework choice, ECS/state,
  asset pipeline, Web Audio, testing/CI/performance,
  accessibility, save/cloud/analytics privacy,
  localization, live-ops/patching, input, security) —
  plus the "does NOT fit" list, which is part of the
  research, not an extra area.
- Wiring checklist: 24/24 steps written = 100% of the
  checklist, 0/24 steps wired into the game = 0% wired.
  That split is deliberate: this task asked for research
  + checklist, not for edits to the game, and this file
  does not claim otherwise.
- Top 5 pulls: listed above, in impact order.
