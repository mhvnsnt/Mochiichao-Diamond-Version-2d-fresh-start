# PC Wallpapers + Custom Backgrounds — Spec (staged only, no game edits, no PR)

Authorised Mars 2026-10-27 ~07:46 CDT: wallpapers from all games + modding
communities, PLUS user-uploadable original art from phone storage for
wallpapers/backgrounds — fully customisable. No Pokemon art is used: presets
below are theme SLOTS with source provenance; shipped art must be original
Mochiichao art. Title background excluded (start-screens lane); logo/studio
card never touched.

## Counts
- Named wallpaper themes inventoried: 26 / 26 = 100% (union, see §2)
- Black 2 indexed wallpapers: 16 ids 0–15 (`BOX_WALLPAPER_NORMAL_COUNT 16`,
  `pokebw2/src/system/box_savedata.c:21`) — counted as indexed slots, NOT
  as 16 extra named themes (no names in the Black 2 code excerpt).
- Diamond/Platinum wallpaper count: NOT verified (system exists in
  `decomps/pokeplatinum/src/applications/pc_boxes/`, count unverified) —
  0 verified, not guessed; wiring must count it before quoting a total.
- Mod-community presets on disk: 0. Fan-project wallpaper systems: 0
  (arena projects only). Mod presets must be sourced at wiring time.
- Apply targets: 3 — (1) PC box wallpaper per box, (2) PC screen background,
  (3) settings/menu background.

## 1. Per generation (source-grounded)
- FireRed: 14 boxes, name max 8, one wallpaper id per box,
  `GetBoxWallpaper`/`SetBoxWallpaper` bounds-checked (`wallpaperId <
  WALLPAPER_COUNT`, `pokemon_storage_system.c:126-137`). Enum order:
  forest, city, desert, savanna, crag, volcano, snow, cave, beach,
  seafloor, river, sky, stars, pokecenter, tiles, simple = 16.
  `MAX_DEFAULT_WALLPAPER = WALLPAPER_SAVANNA` (index 3): first 4 are the
  default set, rest unlock by progression. Art: per-theme palette + tiles
  + tilemap, scroll-direction load (`pokemon_storage_system_graphics.c`).
  Graphics dir `graphics/pokemon_storage/wallpapers/<theme>/` — NOT copied.
- HeartGold: 18 boxes × 30 = 540, name max 20, `wallpapers[NUM_BOXES]`,
  `unlockedWallpapers` bitfield, `PCStorage_GetBoxWallpaper` /
  `IsValidWallpaperId` (default range check). Defaults 0–15: forest, city,
  desert, savanna, crag, volcano, snow, cave, beach, seafloor, river, sky,
  pokecenter, machine, checks, simple. Bonus 32–39: 8 slots whose source
  names name source characters/events — inventoried as slots ONLY, names
  withheld, never shipped as Mochiichao names/art.
- Black 2: 24 trays × 30 = 720 shipped (`BOX_MAX_TRAY 24`, `BOX_MAX_POS 30`,
  `include/save/box.h`); wallpaper per tray, init cycles ids 0–15;
  `BoxSaveAccessor_GetWallpaper`/`SetWallpaper`; rendering in
  `ov255/box2_main.c` (WallCharLoad archive +14, WallPaletteLoad +38,
  WallScreenLoad scrolled, WallPaperSet scrolls in from a direction,
  WallPaperChange fades palette). Mars rule: 24 cap LIFTED — trays
  unlimited, every new tray gets a wallpaper slot, same get/set/scroll.
  BW2 ids map positionally onto §2 slots (id 0 → forest … 15 → simple)
  unless wiring finds BW2's own theme table, which supersedes this.
- Diamond/Platinum: 18 × 30 = 540; wallpaper in box-customisation state
  (`box_app_manager.c:3464`), unlockable branch (`box_menu.c:185`),
  per-wallpaper palette/tile/tilemap from the box archive
  (`ov19_021D79F8.c`). Count unverified — see above.
- Gen 1 (12×20) / Gen 2 (14×20): NO wallpaper system. Negative rule: the
  picker degrades to "plain" on a Gen 1/2 layout, never crashes/invents.

## 2. Preset registry (26 distinct slots)
Union = FR 16 (incl. center) + HG-only defaults (machine, checks) 2 + HG bonus 8 = 26. "Pokecenter" is the same theme as "center", counted once inside the FR 16. Order: forest,
city, desert, savanna, crag, volcano, snow, cave, beach, seafloor, river,
sky, stars, center, tiles, simple, machine, checks, bonus-1…bonus-8.
Full machine-readable list: wallpaper-registry.json (authoritative).
Art rule: every slot's shipped art is ORIGINAL Mochiichao art. Until art
exists for a slot, it renders as a generic pattern (flat colour + dots /
stripes / checker) and the picker badges it "art owed" — never as finished.

## 3. User upload flow (phone storage → wallpaper/background)
1. Upload: Settings → Wallpapers, or the PC wallpaper picker: file input
   `accept="image/png,image/jpeg,image/webp"`, plus the OS photo-library
   picker on phone. Multiple files allowed, one record per file.
2. Validate: PNG/JPEG/WebP only, ≤ 5 MB per file (proposal, §4); reject
   anything else with a plain message, never a silent drop. No moderation
   gate beyond format/size — none was asked for.
3. Store: Blob in IndexedDB, new `mochii_wallpapers` store:
   `{ id, name, blob, thumbnailBlob, createdAt, source: "upload" }`.
   The existing game stores saves as JSON in localStorage
   (`src/lib/saveSystem.ts`, `mochii_saves_*`) — NOT used for images
   (base64 in localStorage would blow quota and risk saves). Only the
   SELECTION (which id is on which box/background) lives in settings/save
   JSON; image bytes live only in IndexedDB, local device only, never in
   a repo PR, never sent to a server.
4. Select: picker lists presets (with "art owed" badges) then uploads
   (thumbnail grid). Selection is per target: box / PC background / menu
   background. One upload may serve many targets.
5. Preview: full-panel preview with box grid/menu overlaid at low opacity
   BEFORE confirming. Cancel restores the previous wallpaper.
6. Manage: rename, delete. Deleting an in-use upload falls back those
   targets to `wp-simple` (plain) and lists which targets changed.

## 4. Limits — source vs proposal, stated plainly
The game has NO upload path today (no FileReader, no image input, no
upload limits in `src/` — verified by grep), so there is no existing
pipeline limit to copy. These are SPEC PROPOSALS, not source values:
formats PNG/JPEG/WebP; ≤ 5 MB per upload (picker downscales first, so
large phone photos still work); stored image max 1024×1024 px, JPEG 0.85
(PNG kept if transparent, else JPEG); thumbnail 256×256 JPEG 0.8;
per-device upload cap 50 (proposal; picker warns at 45). The 50 cap is on
UPLOADS only — boxes/creatures stay unlimited per Mars's rule.

## 5. Wiring checklist (apply-all worker)
- [ ] Registry JSON → generated location; 26 slots + BW2 index note.
- [ ] Per-box get/set in PcView mirroring FR bounds-checked semantics,
      box count unlimited (new trays cycle wallpapers BW2-style).
- [ ] Picker in PcView + Settings → Wallpapers, with preview + confirm.
- [ ] Upload flow (§3) + IndexedDB store + thumbnails.
- [ ] "Art owed" badge + generic pattern render for art-less slots.
- [ ] Diamond/Platinum count verified before any total is quoted.
- [ ] No source art/tile/palette, and no source character/event theme
      name, is shipped (bonus slots generic only).

## 6. Genuinely needs Mars's word (do not guess) — 5 items
1. First-boot default wallpaper (FR cycles forest→savanna; BW2 cycles
   ids 0–15 — neither is chosen as Mochiichao default by this spec).
2. Unlock rules for unlock/bonus slots: progression-gated (source
   behaviour) or all available from the start?
3. Upload cap: is 50 right, or unlimited uploads too (matching
   unlimited boxes)? Proposed 50, not assumed.
4. Menu-background scope: pause + battle menus included, or only PC +
   settings? (Title excluded regardless.)
5. Original preset art: who makes the 26 slots' art, and in what order?
