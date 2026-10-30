# Menu editability parity audit — 2026-10-28

Owner's ruling (Jamar, 2026-10-28): **100% owner editability parity
for menus** — every menu-affecting value an agent can change in code,
the owner must be able to change himself in the menu editor. No
agent-only knobs. This audit is the measurement of that ruling
against the code as it stands. It is the document the owner's
verdict on PR #6 (the editor expansion) will be judged against.

## Method and states

- A **property** is one independently settable value that changes a
  menu's rendering (a leaf value in a config, a settings field, a CSS
  value, a literal in a component).
- **E** — owner-editable in the menu editor AND wired to the real
  menu. **P** — present in the editor but preview-only, stored-only,
  or not wired to the real menu. **S** — owner-adjustable in the
  game's Settings screen (not the editor). **A** — agent-only: code
  or CSS literals with no owner surface at all.
- The editor is audited at its most advanced state: **PR #6's
  branch** (`feature/menu-editor-expansion-followup-20261027`,
  unmerged — the owner judges it separately). Where the editor
  **on main today** differs, that is stated; main's editor is the
  older 188-claim state, so every E below is conditional on PR #6
  landing.
- Counts of the editor surface were verified by materialising
  PR #6's `lockedMenuEditorConfig()` and counting leaf values
  (305), not taken from any claim. The expansion lane's own count
  is 314 rows (188 prior claim + 126 itemised new rows; the 188
  baseline's method was never stated, per the lane's own log). The
  two counts differ by method — rows vs materialised values, empty
  per-item style maps, metadata — and both are reported here rather
  than blended.

## The systems that style the menus today (why parity is not one switch)

Five overlapping systems, wired at different times:

1. **The menu editor** (`src/lib/menuEditor.ts` + `MenuEditorScreen`)
   — deep free-form config, consumed by `IntroSequence` (title/main
   menu), `GameShell` (pause), `MainMenuBackground`, `DexView`.
   **It reaches 3 of the 10 menus.** Defaults derive live from the
   locked v32 record (`src/lib/lockedV32Menu.ts`).
2. **The layout system** (`menuLayoutCatalogue.ts`, 45 Pokémon-gen
   arrangement entries + `menuLayoutLive.ts` overrides) — consumed
   by pause/battle/bag/pc/shop/save/settings; the owner picks
   entries and overrides in Settings-embedded editors (**S**).
3. **The menu skins** (`menuSkins.ts` + `docs/ui-art/menu-skins/`)
   — 5 menus wired (pc/party/save/battle/dialogue) × 3 flavours;
   the owner picks a flavour in Settings (**S**); the flavour token
   values themselves are **A**.
4. **Game settings** (`gameSettings.ts`, ~29 fields + the
   menuCustom block ~12) — fonts, cursor, HUD, panel options;
   owner-facing in Settings (**S**).
5. **CSS + literals** (`src/index.css` frame classes, per-view
   Tailwind literals, day/night palettes in `menuCustom.ts`) —
   **A**, and every menu inherits them.

## Table 1 — the editor's own surface (PR #6 state, verified leaf count)

| Config block | Menu(s) | Values | E (wired) | P (not wired) | Notes |
|---|---|---:|---:|---:|---|
| layers (visible/order/opacity ×7) | main | 21 | 21 | 0 | opacity wired per PR #6 log |
| logo slot | main | 3 | 3 | 0 | |
| cloud (frame + bob) | main | 7 | 7 | 0 | |
| mochii cue | main | 7 | 7 | 0 | |
| panels (4 × 18 fields) | main | 72 | 68 | 4 | per-panel ALIGN ×4 = preview only (gap G3) |
| panelStyle | main | 3 | 3 | 0 | |
| continueSublabel | main | 1 | 1 | 0 | |
| symbols (field) | main | 9 | 8 | 1 | rotateDeg: in the type, no editor row, unused (G5) |
| arcs + orbits | main | 19 | 19 | 0 | |
| fade + paper | main | 4 | 4 | 0 | |
| emblems (6 × 9) | main | 54 | 54 | 0 | per-emblem z orders WITHIN the group only (G2) |
| title slots | title | 17 | 17 | 0 | |
| pause (order/labels/help/visible/geometry) | pause | 61 | 61 | 0 | +42 per-item style rows exist with empty defaults, wired via MenuList (E when set) |
| mochioteka (dex look) | dex | 6 | 6 | 0 | the dex's only editor coverage |
| retro options | settings screen | 10 | 0 | 10 | stored values; in-game wiring partial/absent (G6) |
| access options | global | 5 | 0 | 5 | stored; wiring not evidenced in code (G7) |
| metadata + editor chrome | — | 6 | — | — | name/savedAt + editor-panel geometry: not menu properties |
| **Total** | | **305** | **279** | **20** | menu-affecting values: **299** (305 − 6 non-menu) |

## Table 2 — the whole menu family, by surface

| Menu | Editor (E/P) | Settings-level owner control (S) | Agent-only (A) — the parity gap |
|---|---|---|---|
| Title | 17 E | cursor colour/shape/glow (Settings), menu font | title presets file (8 presets, `titleScreenPresets.ts`), boot/intro sequence (scene texts, 2.5 s boot, 350 ms fade), studio cards |
| Main menu | 195 E / 5 P (of 200) | cursor settings, menu font | LockedStage scaling; overwrite-dialog styling; day/night palette application |
| Pause | 61 E (+42 style rows) | layout entry + overrides (row spacing, alignment) | `.pause-y2k-panel` CSS values, MenuList button classes, backdrop, help-line styling |
| Party (Team) | — | skin flavour choice (12 tokens behind it) | roster grid/card geometry, HP bar colours, StdWindow frame values (`index.css`) |
| Bag | — | layout entry + overrides (grid columns, pocket cursor, tabs) | `.bag-y2k` CSS values; **no skin entry exists for bag in code** (docs preset unwired, G8) |
| PC | — | skin flavour, layout entry + overrides | StdWindow frame values, box grid geometry |
| Shop | — | layout entry + overrides | `.shop-y2k` CSS values; docs skin preset unwired (G8) |
| Settings | 10 P (retro, stored) | the settings themselves (~41 fields) + layout editors + skin pickers live here | the settings screen's own section composition/order, its panel CSS |
| Save slots | — | skin flavour ('save'), layout entry | slot-card geometry/classes in BOTH save screens (IntroSequence phase + SaveMenu) |
| Battle | — | skin flavour, layout entry, 6 HUD settings, battle font | HP threshold colours, type colours, command-menu geometry, healthbox literals |
| Dialogue | — | skin flavour, text speed, dialogue font, button mode | typewriter ms per speed step, box geometry/page size, `--menu-dialogue-radius` default, name-tag styling |
| Shared/global | — | — | `index.css` frame system (~15 value groups every menu inherits), skin flavour token tables (5 menus × 3 flavours × ~12 tokens ≈ 180 values), layout catalogue contents (45 entries), day/night palettes (4 states × ~6 values, RTC-driven, zero editor rows), the font list itself (27 fonts in `fonts.ts` — picking is E/S, the list is A) |

**Headline:** of the ten menus, free-form editor parity exists for
**two** (main menu, pause) plus the title slots and a 6-value dex
look. The other seven menus offer the owner choice-level control
only — pick a preset, a flavour, a layout — while the values inside
those choices, and everything in the CSS layer, remain agent-only.
The editor's 299 menu-affecting values are real but cover a
minority of the family's surface; at least ~350 further countable
values (skin tokens, catalogue contents, palettes, CSS groups,
battle/dialogue/save literals) have no owner surface at all.

## The gaps, named (each is a work item, not a footnote)

- **G1 — PR #6's defaults now fight the confirmed look.** PR #6's
  `PanelCfg` defaults are documented in its own code as "black
  letters; CONTINUE + SETTINGS white halo… Mars's white/black
  combos live as LABEL_STYLE_PRESETS — saved option sets, never
  defaults," and its export fallbacks match. Step 1 (PR #59,
  merged) made white + black outline the code default per the
  owner's confirmation. When PR #6 is reconciled, its label-colour
  defaults, presets framing, and export fallbacks must be re-based
  to the confirmed defaults, or the editor will silently revert
  the confirmed look the first time a preset is saved.
- **G2 — Per-heart stacking above/below the logo NOT implemented**
  (PR #6 declared): per-emblem z is order within the emblem group
  only; the whole group moves on the LAYERS panel. This is also
  why the confirmed mirrored pink heart stays covered by the logo
  until the owner orders a layer change.
- **G3 — Per-panel ALIGN drives the editor preview only** (PR #6
  declared): the real menu keeps merged PR #206's left alignment.
- **G4 — Font-picker entries missing** for the FireRed / Emerald /
  HeartGold font ids (PR #6 declared): no font files exist; the
  ids are reference-only. 27 font files/ids exist in `fonts.ts`.
- **G5 — Symbol rotation**: `rotateDeg` sits in the config type at
  default 0 with no editor row and no consumer (PR #6 declared
  the row cut).
- **G6 — Retro options (10) are stored, not wired**: e.g. Yellow
  sound is a stored value while in-game routing stays Mono/Stereo
  (the lane's own comment). They change no menu today.
- **G7 — Access options (5) are stored; wiring not evidenced**:
  the game's reduced-motion behaviour reads the OS
  `prefers-reduced-motion` query, not this config.
- **G8 — Half the skins family is docs-only**: presets for
  main-menu / settings / pause / bag / shop exist in
  `docs/ui-art/menu-skins/` but are not wired in code (main-menu
  deliberately — locked default; pause/bag/shop render earlier
  Y2K CSS instead). Bag and shop have no skin entry in code at all.
- **G9 — Skin flavour tokens are agent-only** (~180 values): the
  owner picks among 3 flavours per wired menu; he cannot edit a
  flavour's colours.
- **G10 — Layout catalogue contents are agent-only** (45 entries):
  the owner picks an entry and ~10 override knobs per menu in
  Settings; the entries' geometry is code.
- **G11 — Day/night menu palettes have zero editor rows**:
  `DAY_NIGHT_COLOURWAYS` (4 RTC states) apply automatically; the
  values are literals in `menuCustom.ts`.
- **G12 — The CSS frame system is agent-only**: `.game-panel`,
  `.std-window`, `.game-button`, `.game-title`,
  `.pause-y2k-panel`, `.bag-y2k`, `.shop-y2k` values in
  `index.css` underlie every menu and appear in no editor.
- **G13 — Battle literals**: HP-bar threshold colours, move type
  colours, command geometry — agent-only beyond flavour/HUD
  choices.
- **G14 — Dialogue literals**: per-speed typewriter intervals,
  2-line page geometry, radius default — agent-only beyond
  text-speed choice.
- **G15 — Save-slot geometry** in both save screens: agent-only
  beyond the 'save' skin flavour.
- **G16 — Title/intro literals**: the 8 title presets' contents,
  intro scene texts and timings — agent-only.
- **G17 — No editor blocks exist** for bag/shop/pc/party/save/
  battle/dialogue styling: the editor's config type has no
  sections for them at all. Closing parity means new config
  sections + consumers, per menu, or folding those menus into
  the layout/skin systems with editable tokens.
- **G18 — The shipped editor (main) is behind PR #6**: on main
  today the editor is the 188-claim state; e.g. panel
  `labelMargin`/`labelLetterSpacing` are merged from locked data
  at render and cannot be edited at all until PR #6 lands. All
  E counts in Table 1 are PR #6-conditional.
- **G19 — Theme tokens are recorded, not yet consumed at render**
  (Step 3 of this programme): the confirmed theme now lives as
  shared default data in the menu-skins family (skins.json
  `confirmedTheme` + `CONFIRMED_MENU_THEME` in `menuSkins.ts`),
  but each menu's default rendering still comes from its existing
  code. Making every menu consume the one token record at render
  time is the follow-on wiring that closes G9/G12/G17 properly.

- **G20 — Editor interaction model rejected; rebuilt to the game's
  edit flow** (owner ruling, 2026-10-28): the row-and-slot operation
  style measured in this audit — every action a side-text row cycled
  through a swatch/slot, library entries handled via separate
  RENAME / DUPLICATE / UPDATE / EXPORT / DELETE rows — is rejected
  by the owner as overcomplicated and indirect (his comparison: a
  word-match puzzle, not an editor). The capability coverage in
  Tables 1–2 above stands as the spec; the operation style does not
  land. The follow-on editor work rebuilds operation to the model
  games use: select the element, hit EDIT, edit the actual element
  in place, hit SAVE, answer the "Are you sure you want to save?"
  confirmation. Until that rebuild lands, no new editor surface
  ships in the row-and-slot style. See the governing section at the
  end of this audit.

## What closing parity takes (sequence, for the owner's verdict)

1. PR #6 verdict → land it with G1's re-base (defaults =
   confirmed look) and its declared gaps G2–G5 either closed or
   carried as named debt.
2. Editor config sections for the seven uncovered menus (G17),
   consuming the Step 3 theme tokens as their defaults (G19).
3. Token-level editing for skins and layout entries (G9, G10),
   day/night palette rows (G11), and the CSS frame values (G12)
   surfaced as editor data instead of stylesheet literals.
4. Wire or remove the stored-only blocks (G6, G7): a row the
   owner can change that changes nothing is worse than no row.

## Governing ruling — editor interaction model (owner, 2026-10-28)

Owner ruling (Jamar, 2026-10-28, given while judging PR #6's
library-depth screenshot): the menu editor's row-and-slot operation
style is **rejected**. In his words, in substance: editing is not
that complicated — the row style "dumbed it down and made it too
complicated": side text on one side, the thing it belongs to on the
other, matched up like a cross-puzzle. The required model is the
one actual games use in their edit menus:

1. Select the thing itself on the menu — the panel, the label, the
   emblem: the actual element, in place.
2. Hit **EDIT** — and edit that element directly, in place.
3. Hit **SAVE**.
4. The editor asks **"Are you sure you want to save?"** — the owner
   answers yes, and only then is the change kept.

Standing law for all editor work from this ruling forward:

- **PR #6's capability coverage stands as the spec.** The value
  map in Tables 1–2 of this audit — what the owner can reach, menu
  by menu — remains the coverage the editor must deliver, with the
  gap list (G1–G19) as the work list.
- **PR #6's operation style does NOT land.** Its row-and-slot
  interaction (actions as side-text rows with swatch/slot cycling;
  library entries split across separate RENAME / DUPLICATE /
  UPDATE / EXPORT / DELETE rows) is not the interaction model,
  whatever the disposition of PR #6's code.
- **The follow-on editor work implements EDIT → in-place edit →
  SAVE → confirm over that coverage** (gap G20). Library handling
  folds into the same model: select the entry, edit it, save it,
  confirm — not a row per verb.
- This ruling governs the sequence in "What closing parity takes"
  above: step 1's PR #6 disposition is judged against this model,
  and no step ships new editor surface in the rejected style.

*Audit by the menu programme lane, 2026-10-28. Sources: PR #6
branch files (menuEditor.ts / MenuEditorScreen.tsx / expansion
log), main at `f441da7a` (post-Step-1), the V1→V36 steps archive
(`docs/ui-art/main-menu-steps-v1-to-v36/`, Part 6 Step 12
corroborates the PR #6 counts and gaps), and a leaf-count of the
materialised PR #6 default config run locally.*
