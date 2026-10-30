# UI TEMPLATE KIT — 2026-10-30

**What this is.** The game's UI template kit: one shared token set,
the standard window / list menu / choice menu / HUD notification
templates, and the keyboard model every menu shares — built UNDER
and AROUND the systems the game already had (StdWindow, MenuList,
menuSkins, menuCustom, the menu editor, the layout catalogue), not
beside them. Owner order 2026-10-30: use all the cn-gigaleak repos
and the reverse-engineering repos to flesh out the game and give
it templates and nice, clean, user-friendly, industry-standard
menus, windows and UI.

**What was searched (per surface, releases-are-holdings rule).**

- **Repo trees:** all 36 `cn-gigaleak-*` repos + 19 cartoon/show
  repos enumerated recursively (61,122 blob paths; cape-jones tree
  truncates — its finds are a floor). Full record:
  `survey-cn.md` in the lane folder.
- **Code search:** 10 queries against `user:mhvnsnt` ("title card"
  59, "title-card" 38, "dialogue box" 0, "text box" in:path 0, …).
- **Release assets:** the 2026-10-30 donor-hunt sweep (all 148
  repos, 57 with releases, 490 releases, 6,403 assets) re-mined
  for UI material; in-scope cn+show = 4,078 asset names.
- **Local disk:** the Pokémon decomp corpus
  (`~/workspace/pokemon-code-study/projects/`, 34 clones —
  pokeheartgold read in depth, pokeemerald second, pokecrystal /
   pokediamond / pokeplatinum corroborating), the BW2/HGSS
  teardown docs, the dialogue template library + wiring lanes,
  the menu-parity audit, the persona dialect packages (catalogued
  as the owner expanded it 2026-10-30: a recurring game language,
  mostly Luigi + the Mysterious Figure, appearing in other places
  too — not a Luigi-only fence, and never the default skin of
  ordinary menus in this kit), and the four-fixes log.
- **Open internet:** not needed for the build itself (every ported
  behaviour came from held code); the BW2 finding below is from
  the held catalogue.

**The honest headline from the hunt.** The CN/cartoon repos hold
NO game-menu or dialogue-box templates: their menu material is
DVD-menu artwork (Ed, Edd n Eddy ×6 .ai, a PPGZ .psd — studio
files, all-rights-reserved, study-grade measurements only), two
title-card artworks (Grim Adventures .ai), and lettering sheets.
All menu CODE in the fleet is Jamar's own (cape-jones title-card +
lower-thirds generators, pocket-studio editor UI) or MIT Godot
demo menus vendored in animation-techniques-archive. The game's
UI grammar therefore comes from where game UI actually lives in
the holdings: the Pokémon decomp family (one architecture —
Window + TextPrinter + ListMenu + choice menus — shared by
HGSS/Emerald) and the game's own shipped systems. BW2 contributes
NO UI code: no public BW2 decomp exists (held catalogue §5);
pokeblack is a byte-matching disassembly whose UI holdings are
data only. Gen-5-shaped behaviour comes from HGSS, the same DS
window family one gen earlier — labelled inference, not a source.

## The kit (all in-repo)

| Piece | File | Kind |
|---|---|---|
| Token set | `src/lib/uiTokens.ts` + `src/lib/uiKit.css` | One spacing / type / frame / focus / layer token record; values measured from the shipped screens (StdWindow v4 palette, MenuList's 15px row gap, DialogueBox 16px/1.625, HUD 11px micro-labels, 48px targets). CSS vars on `:root`; no shared frame class is redefined. |
| Navigation logic | `src/lib/uiMenuNav.ts` (+ `uiMenuNav.test.ts`, 10 tests) | Pure port of the HGSS list-menu input model (below). |
| Keyboard hook | `src/lib/useMenuNavigation.ts` | Binds uiMenuNav to the game's existing buttonMode translation (isConfirmKey / shoulderKey / isTypingTarget) — no second input system. |
| Standard window | `src/components/game/UiWindow.tsx` | StdWindow + title bar + standard top-right close seat + footer/help slot. Built ON StdWindow; skins/day-night/v32 untouched. |
| List menu | `src/components/game/UiListMenu.tsx` | MenuList's row pattern + disabled/header rows, scroll window with ▲/▼ affordances, full keyboard model, selected-row help line. |
| Choice menu | `src/components/game/UiChoiceMenu.tsx` | YES/NO + short option lists with a moving cursor (below). |
| HUD notification | `src/components/game/UiNotice.tsx` + `src/lib/uiNotice.ts` | App-level StdWindow toast bus. **ORIGINAL** (see gaps): the corpus has no toast system; WorldEngine's internal notify() is the world-screen equivalent, this is the view-screen one. |

## Provenance (source-first wiring law)

| Kit behaviour | Source (project · file · function) | Seam changes |
|---|---|---|
| A chooses the highlighted row's value; B returns LIST_CANCEL; Up/Down step; Left/Right or L/R page by maxShowed | pret-pokeheartgold · `src/list_menu.c` · `ListMenu_ProcessInput` | C task state → pure functions over (index, scroll offset); return codes → typed results; L/R read through buttonMode's shoulderKey (Q/E on web). |
| Header rows print but are never landed on; disabled rows likewise | pret-pokeheartgold · `src/list_menu.c` · `ListMenuChangeSelection` / `ListMenuUpdateSelectedRowIndexAndScroll` (LIST_HEADER skip) | LIST_HEADER → `header`; the web analogue `disabled` added (greyed, native disabled button). |
| Scroll window: cursor walks toward the middle row, then the window scrolls; ends stop with a boundary signal | same, `ListMenuUpdateSelectedRowIndexAndScroll` | Reproduced in `scrollOffsetFor`; boundary signal → `atBoundary` flag + cancel cue in the hook. |
| Scroll arrows shown only while more rows exist in that direction | pret-pokeemerald · `src/list_menu.c` · `AddScrollIndicatorArrowPair` (threshold-driven pair); the game's own ShopView already renders ▲/▼ this way | Thresholds → `offset > 0` / `offset + maxShowed < total`. |
| Wrap on short action menus; wrap as an explicit per-menu choice | pret-pokeemerald · `src/menu.c` · `Menu_MoveCursor` (wraps) vs `Menu_MoveCursorNoWrapAround`; pret-pokeheartgold · `src/list_menu_2d.c` · `enableWrap` template field | One `wrap` option on every kit call, default stated per screen in its wiring comment. |
| YES/NO as a factory of the choice menu; initial cursor; B always = No | pret-pokeheartgold · `src/list_menu_2d.c` · `CreateYesNoMenu` / `Std_CreateYesNoMenu`; `src/yes_no_prompt.c` · `YesNoPrompt_HandleInput` | The 2-row toggle of the source = wrap on 2 rows; decision cues stay with each caller's existing choke point (DialogueBox `choose()`, BagView `doTossYes`, ShopView `doConfirm`). |
| Window = one framed surface everywhere; frame is a numbered style | pret-pokeheartgold · `src/bg_window.c` / `include/render_window.h`; pret-pokeemerald · `src/text_window.c` · `DrawStdWindowFrame` / `DrawDialogueFrame` | Already the game's StdWindow (game-flow v4 translated this to CSS); UiWindow standardises the furniture on top of it instead of re-porting the frame. |
| Start menu = action table + context builder + availability, cursor remembered | pret-pokeheartgold · `src/start_menu.c` · `sStartMenuActions`, `StartMenu_BuildActionLists` | Already the game's PauseMenu shape (menu-editor config order/visibility); this pass only gave it the keyboard model it lacked. |
| Bag per-pocket cursor memory | pret-pokeheartgold · `include/bag_cursor.h` · `BagCursor` (per-pocket scroll+position, field/battle separate) | Already the game's BagView per-pocket cursor (editor gen≥3 default); the kit's list hook routes every keyboard move through BagView's own `selectEntry`, so the memory hears keyboard moves too. |

Licence grades: the pret decomps are reverse-engineering holdings
used under Jamar's actual rule (systems/code wire up 100%; no
Pokémon themselves, names, logos, cries, or literal dialogue are
carried — every port above is behaviour re-implemented in original
TypeScript). The CN studio files are all-rights-reserved
study-grade (measurements only; nothing from them is in this kit).
Jamar's own cape-jones/pocket-studio UI code is show/editor-side
and was catalogued, not needed by the game menus. The MIT Godot
demo menus (animation-techniques-archive) were read as behaviour
reference (pause fade 0.3s/0.2s, focus-grab) — no Godot code is in
this React kit.

## Applications (where the kit is visible in play)

- **Pause menu** (`GameShell.tsx`): full keyboard model — arrows
  move the cursor (wrap), confirm runs the row, Escape/X closes.
  buttonMode.ts recorded this as a labelled NEED ("the pause menu
  — which has no keyboard selection at all"); its note is updated.
  Root fix in `WorldEngine.tsx`: overworld keys are guarded off
  while the pause menu is open (before, arrows walked the player
  under the open menu and Escape re-opened instead of closing),
  and a held direction stops at pause. Save posts a HUD notice.
- **Dialogue box** (`DialogueBox.tsx`): the YES/NO seat is
  UiChoiceMenu — same buttons, same `choose()` choke point, plus
  cursor + arrows + Enter-confirms-highlighted + Escape = NO.
  Y/N shortcuts and paging are unchanged; persona presentation
  mode untouched.
- **Bag** (`BagView.tsx`): joins the skin table (below); arrows
  move the item cursor, Escape leaves; the Mend Patch target
  window is UiWindow + UiListMenu (fainted/full-HP members are
  disabled rows) — before, that window was mouse-only; the Toss
  confirm is UiWindow + UiChoiceMenu (Y/N still answers).
- **Shop** (`ShopView.tsx`): joins the skin table; Buy/Sell/Quit
  gains a real cursor (it rendered a static ► on all rows);
  buy/sell lists get arrows + Enter-opens-confirm + Escape steps
  back a level (menu → out); the transaction confirm is
  UiWindow + UiChoiceMenu. Before this pass, Escape did nothing
  anywhere in the shop.
- **Settings** (`SettingsScreen.tsx`, unchanged file): its skin
  rows render from `MENU_SKIN_MENUS`, so the new Bag/Shop rows
  appear there automatically.
- **Skin table** (`menuSkins.ts`): gap G8 of the menu-editability
  parity audit closed in code — `bag` and `shop` join
  `MenuSkinMenu` with values verbatim from
  `docs/ui-art/menu-skins/bag.y2k-skins.json` /
  `shop.y2k-skins.json` (shop pastel written out — its pale-yellow
  values differ from the shared factory). Their `.bag-y2k` /
  `.shop-y2k` classes remain the 'default' flavour's look.
- **Title / main menu:** deliberately untouched. The v32 main
  menu is locked data with its own keyboard cursor already; the
  kit builds under and around it, per the lock.

## Gaps (stated, not padded)

- **No quantity stepper yet** — the corpus has one shared
  stepper (pret-pokeemerald `src/menu_helpers.c`
  `AdjustQuantityAccordingToDPadInput`: ±1 vertical, ±10
  horizontal) and the shop's editor already flags a quantity
  selector as stored-not-live. Porting it is the natural next
  kit piece; it is not in this pass.
- **No toast system exists in the source corpus** — UiNotice is
  original, labelled as such in its own header.
- **Party screen** stays its own state machine (the source says
  so too: HGSS `party_menu.c` is not a ListMenu); the kit does
  not force it into the list template.
- **CN fleet unopened surfaces:** the documents-archive release
  (323 opaque slices of a ~350 GB zip) and all split-archive
  release assets were listed by name/size only; UI contents
  inside them are unverified, not absent. cape-jones' tree
  truncates in the API; its UI finds are a floor.
- **Persona dialect:** catalogued per the owner's 2026-10-30
  expansion (a recurring game language, mostly Luigi + the
  Mysterious Figure, appearing elsewhere too). This kit changes
  no dialect surface; `personaDialogue.ts` and DialogueBox's
  persona mode are byte-untouched.
