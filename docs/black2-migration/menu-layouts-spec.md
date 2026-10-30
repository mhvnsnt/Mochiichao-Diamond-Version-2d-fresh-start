# Swappable Menu Layouts — Spec (staged design + wiring spec only, no game edits)

Authorised: Mars 2026-10-27 ~07:46 CDT. Rule: menu layout is SWAPPABLE between all
generations, with a menu editor in settings for each menu type separately (battle,
pause, PC, and every other menu system). Caps rule from the same order: Black 2 is
canonical for bag/storage, BUT caps are lifted — unlimited boxes, unlimited PC
storage, item stacks above 99, PC above 100 creatures. Build on top of the most
recent game's code, caps removed, because the universe keeps growing.

Scope of this job: staged spec only. No game files edited, no PR, no logo / studio
card / title files touched. The apply-all worker owns the game PR.

## Counts

- Primary menu types inventoried: 7 / 7 = 100%
  (battle, pause/start-field, bag, PC/storage, shop, save, options/settings)
- Sub-menus inventoried: 4 / 4 = 100%
  (fight/move-select, party, yes/no confirm, item context)
- Generations inventoried: 5 / 5 = 100% (Gen 1, 2, 3, 4, 5)
- Codebases checked: 11 / 11 = 100%
  (Red, Yellow, Gold, Crystal, Ruby, Emerald, FireRed, Diamond, Platinum,
  HeartGold, Black 2 — in `~/workspace/mochiichao-work/decomps/` and
  `~/workspace/mochiichao-work/fresh-start/` submodules)
- Fan/mod menu-layout systems usable on disk: 0
  (fan-reference projects are arena-battle projects; no menu-layout or wallpaper
  system found in them. Mod-community menu files on disk: 0 found. Do not invent
  mod layouts at wiring time — source them then, or ship with the 5 gens.)
- Existing Mochiichao components mapped: 7 / 7 = 100%
  (BattleView, GameShell, PcView, BagView, ShopView, SaveMenu, settings surface
  — see §4; there is no dedicated Settings/Options view yet, so the settings
  surface itself is a NEW component, not a swap)

## 1. What each generation actually does (source-grounded, no art copied)

### Gen 1 — Red / Yellow (`decomps/pokered`, `decomps/pokeyellow`)
- Battle menu: a text box, not a free-floating panel. `BATTLE_MENU_TEMPLATE`
  at tiles (8,12)–(19,17) (`data/text_boxes.asm:31`); Safari variant at
  (0,12)–(19,17). 2-column layout, cursor `▶` at left-column (9,14)/(9,16) and
  right-column (15,14)/(15,16) (`engine/battle/core.asm`, DisplayBattleMenu).
  Input: D-pad moves between 4 items, A confirms, B cancels back; the last
  selection is remembered (`wBattleAndStartSavedMenuItem`).
- Pause/start menu: vertical list in a bordered box at (10,0), width 8 tiles,
  first item at (11,2) (`engine/menus/draw_start_menu.asm`). Items in order:
  Dex, Creatures, Items, Player name, Save (or Reset on link), Option, Exit.
  Count 6 without Dex, 7 with Dex. Watched keys: Up/Down/Start/B/A.
- Bag: vertical scrolling item list ("Pack") with quantity column; item use /
  toss / give via a sub-list. No pockets.
- PC: Bill's PC — vertical list menus (Deposit, Withdraw, etc.), creature
  list per box. Boxes: 12 boxes × 20 creatures = 240 (`MONS_PER_BOX 20`,
  `NUM_BOXES 12`, `constants/pokemon_data_constants.asm`).
- Shop: vertical buy/sell list with price column, quantity prompt on buy.
- Save: start-menu item; no separate save screen. Main menu (title) is
  Continue / New Game.
- Options: vertical list — Text Speed, Battle Animation, Battle Style, Sound,
  Frame (frame type selector). Defaults in `data/default_options.asm` style.

### Gen 2 — Gold / Crystal (`decomps/pokegold`, `decomps/pokecrystal`)
- Menu engine: three reusable engines in `constants/menu_constants.asm`:
  VerticalMenu, ScrollingMenu (arrows, quantity items, left/right enable),
  2DMenu (grid, wrap left/right and up/down, exit on any edge, sprite anims).
  Flags: wrap, cursor, no-top-spacing, place-title, disable-B, enable-Select.
- Battle menu: 2×2 grid at the bottom of the battle screen, same 4 actions as
  Gen 1, D-pad + A/B, cursor remembered.
- Pause/start menu: vertical list, right side, with item descriptions on some
  entries. Includes Pokegear / Phone in Crystal.
- Bag: pocket tabs (Items, Balls, Key Items, TMs/HMs in Gen 2 shape) with a
  vertical list inside each pocket; L/R switches pocket.
- PC: Bill's PC + "Move" system; boxes 14 × 20 = 280 (Gen 2 shape; the 14/20
  figure is the Gen 2 box layout, distinct from Gen 1's 12/20 and Gen 3+'s
  30-per-box grid).
- Shop: vertical list, buy/sell, quantity prompt.
- Options: Text Speed (Fast/Med/Slow), Battle Animation, Battle Style,
  Sound (Mono/Stereo), Print, Frame (frame types, `maskbits NUM_FRAMES`),
  Cancel — `engine/menus/options_menu.asm`.

### Gen 3 — FireRed / Ruby / Emerald
  (`fresh-start/pokefirered-leafgreen`, `decomps/pokeruby`, `decomps/pokeemerald`)
- Window system: `struct WindowTemplate { bg, tilemapLeft, tilemapTop, width,
  height, paletteNum, baseBlock }` — every menu is a set of these windows on a
  30×20 tile screen. This is the portable unit the registry copies: a layout
  is a list of windows + an item list + a cursor rule.
- Battle menu: action window at the bottom (gfx via `LoadBattleMenuWindowGfx`,
  `src/battle_bg.c:691`); 4 actions in a 2×2 arrangement; move-select is a
  second window with 4 moves + PP + Cancel. Cursor wraps within the window.
- Pause/start menu: vertical list on the right + a description pane for the
  highlighted item (`src/start_menu.c`: start-menu actions table Dex /
  Creatures / Bag / Player / Save / Option / Exit / Retire / Link-Player).
  Save-stats window (1,1,14×9), Safari stats window (1,1,10×4), post-link
  message window (2,15,26×4).
- Bag: pocket tabs across the top, vertical item list below, quantity column,
  item description pane. Pockets: Items, Balls, TMs/HMs, Berries, Key Items
  (FireRed shape: 5 pockets).
- PC/storage: 6-column × 5-row grid = 30 per box, 14 boxes = 420
  (`TOTAL_BOXES_COUNT 14`, `IN_BOX_ROWS 5`, `IN_BOX_COLUMNS 6`,
  `include/pokemon_storage_system.h`). Main menu: Withdraw, Deposit, Move
  Creatures, Move Items, Exit, each with a description line. Cursor remembered
  per box. Wallpaper menu per box (see wallpaper-spec.md).
- Shop: buy window (2,1,12×6) + item list + Yes/No confirm + quantity prompt;
  sell path mirrors buy. Sell price = floor(buy / 2) (all-sources rule).
- Save: stats window + confirm; clear-save / save-failed screens are separate
  full screens (`clear_save_data_screen.c`, `save_failed_screen.c`).
- Options: header window (2,3,26×2) + list window (2,7,26×12)
  (`src/option_menu.c:70`); items Text Speed (Slow/Mid/Fast), Battle Style
  (Shift/Set), Sound (Mono/Stereo), Frame Type. Left/right changes the value,
  up/down moves the row, B saves and exits.

### Gen 4 — Diamond / Platinum / HeartGold
  (`decomps/pokediamond`, `decomps/pokeplatinum`, `fresh-start/pokeheartgold`)
- Menu engine: `list_menu.c` (vertical list) + `list_menu_2d.c` (grid list) +
  touchscreen list menus. Touch targets are first-class: every list item has
  a hitbox, and D-pad and touch move the same cursor.
- Battle menu (HeartGold, `src/battle/battle_input.c`): `BattleMenuTemplate`
  per menu state — palette 246, priority array, touchscreen hitbox rects,
  touch-input array, and function pointers: `funcCursor` (move),
  `funcSaveCursorPos` (remember), `funcCreateMenuObjects` (draw),
  `funcTouchCallback`. Slide-in task (`Task_BattleMenuSlideIn`) animates the
  menu in; main menu has 4 text objects Fight / Bag / Creatures / Run
  (`include/constants/battle_menu.h`: MENUTXT_FIGHT, MENUTXT_BAG,
  MENUTXT_POKEMON, MENUTXT_RUN). Move-select, target-select, yes/no and
  switch/keep are separate templates in the same table.
- Pause/start menu: vertical list (`src/start_menu.c`) with touch support;
  HG adds Pokegear as a full app, not a menu row.
- Bag: `bag_view.c` — pocket tabs + vertical list; pockets by item attribute
  (`GetItemAttr ITEMATTR_FIELD_POCKET`, `src/bag.c:73`); HG pockets: 8.
- PC/storage: 18 boxes × 30 = 540 (`NUM_BOXES 18`, `MONS_PER_BOX 30`,
  `include/constants/pokemon.h`); box name max 20 chars (HG) vs 8 (FR).
  Wallpaper per box, default + bonus sets (see wallpaper-spec.md).
- Shop: list + quantity + confirm, same shape as Gen 3, touch-enabled.
- Options: full app (`options.c`, `options_app.c`) — text speed, battle
  style, sound, frame, plus Gen 4 additions (battle scene on/off, button mode).
- Save: main-menu entry + stats/confirm screens; delete-save is a separate
  app (`application/delete_savedata.c`).

### Gen 5 — Black 2 (`fresh-start/pokebw2`) — CANONICAL BASE, caps lifted
- Menu engine: `PrintWindow` + `WindowLayout` tables. Black 2's start menu
  (`src/ov162/startmenu.c:300`) is a 20-entry `sWindowLayouts` table of
  (x1, y1, x2, y2, …) rects — the clearest proof that a "layout" in this
  codebase IS a table of rectangles, which is exactly what the registry
  below copies. Scrolling list: cursor + cursorRow, list scrolls to keep the
  cursor visible, `StartMenu_SetItemPalette` highlights the row.
- Battle menu: overlay menus (`src/ov036/ircbattlemenu.c` pattern: button
  windows created from rect tables — 4-button, 2-button variants at
  `sWinRectsA / sWinRects2 / sWinRects3`); bottom action bar + move grid.
  This is the canonical battle layout to build on, per Mars's "most recent
  game is canonical" rule.
- Pause/field menu: `src/ov036/field_menu.c`, `src/ov012/event_field_menu.c`
  — vertical list over the field, shortcut menu variant.
- Bag: overlay 286 (`b_bag_main.c`, `b_bag_ui.c`, `b_bag_item.c`) — pocket
  tabs + list + item detail; canonical pockets: 5 + Free Space, 614 slots
  (all-sources count).
- PC/storage: overlay 255 (`box2_main.c`) — trays scroll left/right
  (`BOX2_TRAY_SCROLL_L/R`), 24 trays × 30 = 720 in the shipped game
  (`BOX_MAX_TRAY 24`, `BOX_MAX_POS 30`, `include/save/box.h`). **Mars rule
  overrides the 24 cap: trays are unlimited — the tray list grows, the
  scroll and wallpaper-per-tray logic are unchanged.** Item stacks above 99
  and PC totals above 100 creatures follow the same rule: the slot/count
  fields are not capped at the shipped values.
- Shop: script-menu shop (`src/ov036/scrcmd_shop.c`) + resort shop variant;
  list + quantity + confirm.
- Options: system app menu (`src/system/app_menu_common.c`,
  `app_taskmenu.c`, `bmp_menu.c`) — the settings-app pattern the Mochiichao
  settings surface copies.
- Save: save-block system (`src/system/box_savedata.c` pattern + save
  control blocks); the save menu is a list + confirm, not a layout of its own.

## 2. Layout registry (what the wiring implements)

One registry entry per (menu type × generation). A layout is data, not code:

```json
{
  "menuType": "battle",
  "generation": "gen5",
  "pattern": "bottom-action-bar",
  "windows": [{ "id": "action", "x": 0, "y": 0, "w": 0, "h": 0, "anchor": "bottom" }],
  "items": ["fight", "bag", "creatures", "run"],
  "itemOrder": ["fight", "bag", "creatures", "run"],
  "cursor": { "type": "highlight", "wraps": true, "remembered": true },
  "confirm": "A", "cancel": "B",
  "touch": true,
  "source": "pokebw2/src/ov036/ircbattlemenu.c (button-window rect tables)"
}
```

Coordinates are stored in the registry in a normalised unit (percent of the
menu panel, 0–100) at wiring time, NOT as raw GBA/DS tile coordinates — the
raw tile numbers above are provenance, and the wiring converts them, because
Mochiichao renders in a browser, not on a 240×160 / 256×192 screen. The one
exception: relative relationships are preserved exactly (e.g. Gen 1 battle
box is bottom-right; Gen 3 options header sits above the list window).

Registry entries (menu type × gen): 7 types × 5 gens = 35 entries.
Plus 4 sub-menu patterns (move-select, party, yes/no, item-context) × 5 gens
= 20 entries. Total registry entries: 55.

| Menu type | Gen 1 | Gen 2 | Gen 3 | Gen 4 | Gen 5 (canonical) | Mochiichao component |
|---|---|---|---|---|---|---|
| Battle | 2×2 textbox bottom-right | 2×2 grid bottom | 2×2 action window bottom | template + touch rects, slide-in | button-window bar + move grid | BattleView (+ PixiBattleCanvas for the field, menu overlay only) |
| Pause/start | vertical list top-right | vertical list right | vertical list right + description pane | vertical list + touch | scrolling list, cursorRow | GameShell (pause overlay) |
| Bag | vertical list, no pockets | pocket tabs + list | pocket tabs + list + description | pocket tabs + list + touch | pocket tabs + list + detail | BagView |
| PC/storage | vertical list menus | list + move | 6×5 grid, 30/box, wallpaper menu | list/grid + touch, 18 boxes | tray scroll L/R, 24 trays (cap lifted → unlimited) | PcView |
| Shop | vertical list + price | vertical list + price | buy window + list + yes/no + qty | list + touch + qty | script list + qty + confirm | ShopView |
| Save | start-menu item | start-menu item | stats window + confirm | app + confirm | list + confirm | SaveMenu (+ gameStore save) |
| Options/settings | vertical list | vertical list | header + list windows | full app | system app menu | NEW Settings view (no existing component) |

## 3. Settings switch + per-menu editors

### 3.1 Settings switch (global)
- `settings.menuLayoutPreset`: one of `gen1 | gen2 | gen3 | gen4 | gen5`
  (gen5 = canonical default in code, but see §6: the FIRST-BOOT default is
  owed to Mars and is NOT set by this spec).
- `settings.menuLayoutOverrides`: per-menu-type override, e.g.
  `{ "battle": "gen3", "pc": "gen5", "bag": "gen4" }`. An override always
  beats the global preset for that menu type.
- `settings.menuLayoutCustom`: per-menu-type edited layouts saved from the
  editors below. A custom layout beats preset and override for that menu type
  until the user resets it.
- Precedence: custom > per-menu override > global preset > built-in fallback
  (gen5 canonical). Fallback is never a guess: if a registry entry is missing
  for a (type, gen) pair, the menu falls back to gen5 for that type and the
  settings screen flags the gap — it does not silently render a different gen.

### 3.2 Editor spec — one editor per menu type, all inside Settings
Every editor shares the same frame and differs only in its editable fields:

- Frame: live preview panel (the actual menu, rendered with the edited
  layout, on dummy data) + field panel + Reset-to-gen-default + Save +
  Delete-custom. Preview is mandatory: no editor ships a layout the user
  cannot see before saving.
- Battle menu editor: layout picker (gen1–gen5), item order (reorder the 4
  actions: Fight / Bag / Creatures / Run), arrangement (2×2 grid / bottom
  bar / vertical list / corners), cursor style (highlight / arrow / both),
  wrap on/off, remember-cursor on/off, move-select arrangement (grid/list),
  target-select arrangement.
- Pause menu editor: layout picker, item order (Dex-equivalent / Creatures /
  Bag / Player / Save / Options / Exit + any Mochiichao rows), description
  pane on/off + position, panel anchor (top-right / right / full-height).
- Bag menu editor: layout picker, pocket order, pocket visibility, list
  density (rows visible), description pane on/off, quantity column on/off.
- PC menu editor: layout picker, grid columns (6 canonical, editable),
  slots per box (30 canonical, editable — the box count itself is unlimited
  and is NOT an editor field), box-name editing on/off, wallpaper picker
  placement (see wallpaper-spec.md), party pane on/off, move-mode on/off.
- Shop menu editor: layout picker, buy/sell tab order, price column on/off,
  quantity prompt style, confirm on/off.
- Save menu editor: layout picker, stats shown (time / location / creatures
  count), slot arrangement (list / grid), confirm on/off.
- Options/settings editor: layout picker, row order (text speed / battle
  style / sound / frame / menu-layout rows), value-change input
  (left-right / tap-cycle / dropdown).

Editor persistence: one record per menu type in the save/settings store,
versioned (`layoutVersion: 1`), with the source gen recorded so a later
"reset to gen X" is always possible. Editors never edit the logo, studio
card, title screen, or any other lane's screen — menu editors edit menus only.

## 4. Mapping to existing Mochiichao components (no clobbering)

- BattleView (`src/components/views/BattleView.tsx`) — owns the battle menu
  overlay; PixiBattleCanvas owns the battlefield, not the menu. The registry
  drives the overlay only.
- GameShell (`src/components/GameShell.tsx`) — owns the pause overlay.
- BagView, PcView, ShopView, SaveMenu — each owns its menu; each reads its
  layout from the registry + settings, and renders the same actions in the
  chosen arrangement. No action is added or removed by a layout change.
- MenuList (`src/components/game/MenuList.tsx`) and StdWindow
  (`src/components/game/StdWindow.tsx`) are the shared renderers the
  registry should target: a layout entry maps to (window rects + list
  component + cursor component), not to a new component per gen.
- Settings surface: NEW. There is no dedicated Settings/Options view in
  `src/components/views/` today (options live inside other views). The
  settings view + all seven editors are new components, added alongside —
  never by editing another lane's view in place.

## 5. What is NOT decided by this spec (counts as owed, §6)

- First-boot default preset (gen5 is the code fallback, not the chosen default).
- Whether the settings surface is a full-screen view or a GameShell overlay.
- Touch vs keyboard-first defaults on phone (the game is played on phone;
  Gen 4/5 touch rects are the only source touch patterns — the editor must
  offer both, but the default input mode is owed).

## 6. Things that genuinely need Mars's word (do not guess)

1. Default layout preset on first boot: gen1 / gen2 / gen3 / gen4 / gen5 / a
   Mochiichao-mixed default? (Code fallback is gen5; that is not a decision.)
2. Settings surface shape: full-screen Settings view, or a pause-overlay
   panel inside GameShell?
3. Default input mode on phone: touch-first (Gen 4/5 rects) or D-pad/keyboard
   cursor-first (Gen 1–3)? Editors offer both either way.
4. Frame art for the menu windows: original Mochiichao frame art is owed
   (Gen 2/3 frame-type selector is a pattern, not art — no source frame art
   is copied).
5. Any Mochiichao-only menu rows (e.g. Garden, Creature Mode) in the pause
   menu: their order relative to the source rows is a canon decision, not a
   layout decision — the editor supports them, but their default order is owed.

Total owed from this spec: 5 items. Everything else in §§1–4 is filled from
source above.
