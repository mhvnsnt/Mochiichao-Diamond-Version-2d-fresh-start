# Main Menu — step record V1 to V36

Recovered 2026-10-28. Labels per step: **VERBATIM** (Mars's own
words, quoted, source named) · **PARAPHRASE** (his order/verdict on
record in the recording agent's words, timestamped) · **RECONSTRUCTED**
(rebuilt from artifacts/traces/code, evidence named) · **GAP**
(not recoverable — listed, never invented).

Spine source: `docs/ui-art-options/conversation-log-2026-10-25.md`
(the session's own running record, kept under Mars's standing order
of 2026-10-25 16:36 CDT to document all conversation in repo
documents, append-only). Other sources are named per step. All
times CDT. Canvas is 1200x1500, centre x=600, unless a step says
otherwise. Render pointers are repo paths; the full map is in
`EVIDENCE-INDEX.md`.

---

## Part 1 — V1 to V11: logos, layouts, and the FireRed rule

**V1 — logo draft 1.** PARAPHRASE (ui-art-options-index.md item 5).
White fill, teal outline, gold shadow, DIAMOND VERSION below.
Plain bold style. Kept as an option: Menu Creator row
Logo Image = V1. File: `docs/ui-art-options/mochiichao-logo-draft-v1.png`.

**V2 — logo draft 2, Y2K.** PARAPHRASE (index item 6). Bubbly
italic, cyan/blue gradient, white outline, stars, orbit ring.
Kept: Logo Image = V2. File: `mochiichao-logo-y2k-v2.png`.

**V3 — logo draft 3, mixed Y2K + the menu colour map.**
PARAPHRASE (index item 7). Black blocky letters, white outline,
cyan/pink gradients, stars/hearts/swoosh — PLUS the menu colour
map that every later panel colour comes from: Roster pink, Shop
yellow, Bag green, Battle red, PC blue, Garden purple. Kept:
Logo Image = V3. File: `mochiichao-logo-y2k-mixed-v3.png`.

**The official logo lands (2026-10-25 16:11).** PARAPHRASE
(conversation log). Mars uploaded the official chrome Y2K logo —
arched, with an orbit ring. It superseded V1–V3 as the main logo.
V1–V3 were NOT deleted: they stay as Logo Image options.
(interchangeable-elements index: "Official chrome logo (Mars
upload, black bg knocked out) — DEFAULT".)

**V4 — game flow UI.** PARAPHRASE (doc header: "User verdict
2026-10-25") + RECONSTRUCTED detail (`game-flow-ui-v4.md`). The
verdict it answers: menus/UI still ugly, game flow bad, no
narrative — no "this is where you start, this is what's
happening". The fix it sets: fill EVERY gap with the Pokemon flow
template (structure only), then Mochiichao's own story on top.
Flow: cinematic/logo → TITLE (title only) → MAIN MENU → prof
intro (one dialogue-box message per beat, continue arrow, never a
scrolling log) → spawn at HOME (Sector 0, Boot Harbor) → lab →
starter → rival battle → gifts + goal → first route. Note: this
doc calls the in-game main menu of its day "v3" (CONTINUE with
stats / NEW GAME / SETTINGS as separate framed windows, already
in IntroSequence) — the lane's numbers run across artifact kinds
(logos, docs, pictures), and v3 here is the in-game menu state,
not the logo draft. Why menus looked ugly — the file's own fix
list: ONE frame everywhere (StdWindowFrame, 9-slice), delete the
mono/terminal classes, bracket buttons and version footers; ONE
rounded bold game font, never mono; dialogue box bottom
full-width, 2 lines max, typewriter, continue arrow; buttons
filled and rounded, min 48px tap. Palette it works from: text
#f1f5f9, panel #16233a at ~92%, border teal/cyan #22d3ee, gold
accent #fbbf24, danger #ef4444.

**V5 — starter deadlock fix.** PARAPHRASE + RECONSTRUCTED
(`starter-deadlock-fix-v5.md`). From the 2026-10-25 Pages
playtest: title/main/save/shop/bag/PC mostly pass, but the
starter path deadlocked (lab door tiles were wall tiles; the game
never said Sector 0 has no encounters by design). The parts that
bear on the menu record: in that playtest the main menu was still
ONE list panel, not the separate framed windows of the v3 spec —
a defect carried on record from here; A/B buttons were partially
clipped and overlapped by the MochiiMind button (move MochiiMind,
do not shrink A/B). The doc's boundary restatement matches the
standing rule: layout/dialogue BEATS are structure and may be
copied 1:1; Pokemon dialogue text, town names, character names
and species may NOT be copied verbatim, even temporarily.

**V6 — layout diagram + newest-Pokemon UI survey.** PARAPHRASE
(index item 9; survey doc `most-recent-pokemon-ui-v6.md`).
Pokemon on the left, Mochiichao on the right, box for box.
Reference only — NOT a screenshot. The survey behind it: the
newest game in the repo is Black 2/White 2 (Gen 5); the clearest
UI code is HeartGold/SoulSilver (dialogue box X=2 Y=19 W=27 H=4;
start menu items unlock only when earned); FireRed is older but
has the clearest main-menu window templates. "100%" is defined
there as 100% of LAYOUT / STRUCTURE / RULES — never Pokemon art,
sprites, music, dialogue or names. File:
`pokemon-vs-mochiichao-layout-v6.png`.

**V7 — wireframe.** PARAPHRASE (index item 10). Title / main menu
/ pause / battle / dialogue boxes as wireframes. Reference only —
NOT a screenshot, NOT game art. File:
`pokemon-version-wireframe-v7.png`.

**V8 — verify-match layout.** PARAPHRASE + VERBATIM fragment
(index item 1): Mars called the look "terminal shit" — RETIRED as
a visual, KEPT as a layout reference (Pokemon boxes vs Mochiichao
boxes, text boxes only). File: `verify-match-layout-v8.png`.

**V9 — game-look mix.** PARAPHRASE (index item 2). Main menu and
battle HUD mixed on one screen. WRONG MIX — discarded as a screen,
kept as an option for its game-look elements only (title, HP
boxes, panels). File: `mochiichao-game-look-v9.png`.

**V10 — main menu only.** PARAPHRASE (index item 3). The main menu
ALONE, no battle elements. Became the main-menu reference the
numbered builds below work from. File:
`mochiichao-main-menu-only-v10.png`.

**V11 — FireRed-first replacement log.** PARAPHRASE (index item 4;
the log itself is `fire-red-first-replacement-log-v11.md`).
Mars's work order in it: ONE game at a time — FireRed/LeafGreen
FIRST, 100% of its steps, replace every proprietary thing, THEN
the next game (HeartGold second, Black 2 third); the earlier
all-games list was an overview only. Rule per element: show the
FireRed element FIRST, then exactly what Mochiichao thing
replaces it in that spot, and HAVE or NEED TO MAKE. The main-menu
geometry it pins (FireRed `main_menu.c`): CONTINUE window left 3
/ top 1, 24 wide x 10 high, palette 15, text at (2,2), save stats
inside; NEW GAME window left 3 / top 13, 24x2; the third slot
(Mystery Gift in FireRed) left 3 / top 17, 24x2 → becomes the
SETTINGS window, with a REAL settings screen behind it, not a
"coming soon" note. Two standing verdicts in the log: the build
of the day had the menu as ONE list panel — "WRONG, fix it"
(separate framed windows are the spec); and NO battle elements
on the main menu — the earlier image that put battle HP boxes
there (v9) was wrong and is discarded, do not reuse it. On the
title screen likewise: no menu, no battle, no HP, no moves — if
any appear, that is a bug, not a feature. This log became the
working rule for everything after it (and, at 17:14 the same
day, the standing Pokemon-first rule — Part 5).

---

## Part 2 — V12 to V26: building the menu picture

All steps PARAPHRASE from the conversation log (2026-10-25) unless
marked. Renders: `docs/ui-art-options/mochiichao-main-menu-*.png`.

**V12** — official logo at the TOP, dark panels.
**V13** — logo moved to the MIDDLE, v3 colour map on the panels.
**V14** — white background; blue circles + pink circles behind the
logo; blue heart + pink heart; black sparkles. (The circles,
hearts and sparkles born here are the logo emblems measured again
in PR #214 / #261 — Part 6.)
**V15** — circles kept; rainbow semi-circles added, rotated 90°;
decorations lowered to the logo centre (600,454).
**V16** — rainbow rotated clockwise. WRONG direction.
**V17** — Mars's correction: rainbow rotated 90°
COUNTERclockwise from v16. Net rotation −90° (the value the
elements index carries: Rainbow Arcs = ON, Rotation = −90).
**V18** — white puffy cloud over the rainbow, under the logo,
behind the opening + CONTINUE.
**V19** — the cloud becomes the real SVG puffy cloud
(`puffy-cloud.svg`), wider — NOT circles.
**V20** — cloud back to the v18 centre: (600,738).
**V21** — cloud centred 50/50 horizontally: visible x250–950,
centre x=600. The full visible box fixed by this step and carried
into the lock: x250–950, y648–828, 700x180, centre (600,738)
(PR #233 states this as "the locked spec + v21 step").
**V22** — cloud behind the logo centre (600,454). WRONG. Kept as a
selectable option, labelled SUPERSEDED — not deleted.
**V23** — cloud on top of the logo, behind CONTINUE. WRONG (scale
and place both changed). Kept as an option, labelled SUPERSEDED.
**V24** — LAYER ONLY change: cloud back to the v21 place and
scale; layer order fixed: rainbow < logo < cloud < CONTINUE.
**V25** — everything centred 50/50 at x=600; the 10px heart/star
asymmetries fixed; hearts and stars mirrored around x=600.
**V26** — the golden-ratio symbol spread: 42 solid-colour symbols,
golden angle 137.508°, radius = sqrt(n)·phi, sizes scaled by phi.
The four shapes and the 7-colour palette born here are the ones
formula v2 cycles in 2026 (Part 6). Kept as an option:
Symbols = 42, Coverage = GOLDEN.

---

## Part 3 — the research block, then V27 to V32: the fade fight

### The colour / neurochemistry research (2026-10-25)

Source: `docs/research/color-neurochemistry-design.md`, applied in
the conversation log. PARAPHRASE, with the research's own honesty
limits quoted because they are part of the record:

- Coverage: keep ~75–85% of the white bottom area truly blank;
  symbols cover ~10–15% of the bottom area's pixels; only 12–18
  small symbols, on a golden-ratio / Fibonacci lattice, low
  opacity. "If you screenshot, blur your eyes, and see a pattern
  rather than white, you have too many."
- Fade: a long, soft fade — not a hard edge — carries the artwork
  into pure white just above CONTINUE (the log works with 16–24px
  above CONTINUE; v27 used 20px).
- Colour roles: baby-blue / mint = calm; bubblegum pink =
  bonding (the oxytocin cue — a cute mascot, hearts); butter-yellow
  = the reward cue (dopamine — anticipation, NOT pleasure after
  reward; the anchor is dopamine-as-prediction-error, Schultz);
  lavender = curiosity. CONTINUE is the serotonin cue: it IS the
  remembered achievement, so it shows what continuing means in
  small calm type. Saturated red/orange: 0% in the symbol field,
  under 2% of the whole screen.
- Motion/feedback timing from the same research: feedback under
  ~200ms; idle motion slow (4–6s float); one symbol twinkles at a
  time, at most one per 3–7s; constant celebration habituates and
  kills the signal.
- **The honesty limit, in the research doc's own words**
  (VERBATIM, color-neurochemistry-design.md): the mappings are
  "well-attested as *design heuristics and popular gamification
  summaries*, not as laboratory proof that a pink star on a menu
  directly releases a named chemical", and "No lab study was found
  that measures dopamine/serotonin/oxytocin/endorphin release from
  a specific menu color, symbol density, or fade length." The
  numbers are A/B-test hypotheses. Any agent quoting them as
  proven thresholds is misquoting this record.

### The fade steps

**V27 — the full research menu (Mars's request).** PARAPHRASE
(conversation log). Everything the research said, applied whole:
fade pastel → pure white 20px above CONTINUE; buttons sit on 100%
white; bottom 75–85% blank; 15 small pastel symbols (golden
angle); CONTINUE sublabel "Last: Core Fragment" (the serotonin
cue); Mochii mascot by CONTINUE (the oxytocin cue); yellow
sparkles (dopamine cue); lavender stars (curiosity cue).
Render: `mochiichao-main-menu-full-research-v27.png`. Kept as an
option: Symbols = 15 PASTEL, Coverage = RESEARCH.

**V28 — full fill from half of CONTINUE (Mars, 16:39, replying to
v27).** PARAPHRASE. Symbols fill from HALF of CONTINUE (y≈843)
down to the bottom, full width. Fade band ~5% of screen height
(75px on the 1500 canvas) above CONTINUE, behind logo/arcs/cloud.
This SUPERSEDES the v27 research coverage as the direction; v27
stays an option. The layer order named from this step onward
(cited in PR #261 as the v28 order): white → background symbols →
arcs/circles/hearts → logo → cloud → panels.
Render: `mochiichao-main-menu-full-fill-v28.png`.
Option: Coverage = HALF-CONTINUE.

**V29 — full zone below the panels, double fade (Mars, 16:41).**
PARAPHRASE. Full zone starts y=1280 (below the panels, which end
about y1168). TWO 5% fade bands: y1280–1205 fades 90→255;
y1205–1130 fades 0→60; above 1130 pure white. Golden-ratio
placement kept. Render: `mochiichao-main-menu-lower-fade-v29.png`.
Option: Coverage = BELOW-PANELS.

**V30 — reach up 25% (Mars, 16:42).** PARAPHRASE. Everything
shifted UP by 25% of screen height (375px): full zone starts 905,
fade band 1: 830–905, fade band 2: 755–830, gone above 755.
Render: `mochiichao-main-menu-reach-up-v30.png`.
Option: Coverage = 50%.

**The golden reading of v30 (16:44).** PARAPHRASE (log). The
canvas golden lines are y573 (38.2%) and y927 (61.8%). V30's start
905 sits 22px from 927 — essentially on the bottom golden line.
Its fade top 755 is about 50%, NOT phi. A perfect phi top would be
573. That reading is what v31 tried.

**V31 — phi top.** PARAPHRASE (elements index + the v32 correction
entry in the log). Full zone from y723, fade 573–723 (61.8%).
REJECTED AS DEFAULT by Mars: it moved the background too high and
left too much space. Kept as an option, labelled rejected:
Coverage = 61.8%.

**V32 — the phi fade (Mars, 16:45). LOCKED.** PARAPHRASE (log +
`main-menu-default-locked-v32.md`). Mars's correction, as recorded:
v30's start (905) is PERFECT — do NOT move the start up or down,
and do NOT add negative space underneath. Only the fade LENGTH
changes, to phi: the field span is 745px (v30's fade top 755 to
the bottom 1500); split by phi — full 460 / fade 285 (38.2%). New
fade top: 620. Inside the fade, the golden split at 729:
620–729 fainter (109px), 729–905 stronger (176px); 176/109 =
1.615 ≈ phi. Gone above 620.
Render: `mochiichao-main-menu-phi-fade-v32.png`.
Option: Coverage = LOCKED V32.

**THE LOCK (Mars, 16:47; confirmed again 16:49).** PARAPHRASE
(log; lock doc). V32 is the locked default. Recorded confirmation:
v32 locked again, confirmed as the one. The rule that comes with
it: a later tweak changes the default ONLY when Mars locks it
again. Editing never overwrites the lock.

---

## Part 4 — THE LOCKED V32 SPEC (the floor)

Source: `docs/ui-art-options/main-menu-default-locked-v32.md`,
carried in code at `src/lib/lockedV32Menu.ts` and restored whole
by `docs/locked-v32-full-snapshot-20261027.md`. Every number here
is locked. Anything that disagrees with this section is wrong
until Mars locks a replacement.

- Canvas 1200x1500. Centre x=600.
- Logo: y180, w900 (x150–1050), h≈548, centre ≈(600,454). The logo
  is the PNG (`mochiichao-main-logo-v32-matched.png`) — NEVER font
  text.
- Rainbow arcs + circles: centre (600,454). Arc radii
  325/353/381/411/437, stroke 5. Orbits: blue ellipse 515x265,
  pink ellipse 475x230, both centre (600,454).
- Logo emblems (static, top layer, measured from the v32 picture):
  black stars (600,194) 41x41, (139,533) 45x45, (1059,533) 53x53;
  pink circle (1054,412) 46x46; the two hearts — blue centre
  (169,421.5) 63x50 #8cd2ff, pink centre (230,640.5) 53x40
  #ff96c8 (PR #261 exact values; the PR #214 values blue y405 /
  pink y637 are SUPERSEDED, do not use). Hearts sit on the v28
  layer: above arcs + symbols, below logo/cloud/panels, drawn last
  in the background SVG; static, full opacity — the pink heart at
  y640 is inside the fade band but is SOLID in the picture, so no
  fade applies to it.
- Cloud: visible box x250–950, y648–828 (700x180), centre
  (600,738). File: the original `puffy-cloud.svg`, byte-untouched,
  transform only. Rendered frame on current main: imgBox
  (224,599,825x264) — see Part 6 for how that frame was earned.
  Provenance, stated plainly (cloud trace, decomp check): NO
  Pokemon decomp pins a menu-cloud placement — FireRed has no
  menu cloud sprite, HeartGold's title is a 3D scene, Black 2 has
  no title/menu cloud placement. The 250–950 x 648–828 box is the
  Mochiichao v21 spec value, NOT a decomp value. Do not cite it
  as Pokemon's.
  Bob 6px / 5s rides on the cloud from PR #149 — it was never
  Mars-locked (Part 6, open items).
- Mochii cue: x170, y790, w110 (h110), bob 8px / 4.5s.
- Panels (all x300, w600; radius 28, border 3; label font
  Trebuchet MS stack, weight 800):
  - CONTINUE: y788, h110, pink #ff96c8, label size 35, sublabel
    "Last: Core Fragment" size 26.
  - NEW GAME: y918, h70, yellow #ffe696, label 26.
  - SETTINGS: y1008, h70, blue #8cd2ff, label 35.
  - BACK TO TITLE (B): y1098, h70, green #a0e6b4, label 31.
  - Stack ends about y1168.
- Panel text (PR #206, merged — part of the floor now): labels
  LEFT-aligned, never centred. Margins (construction): CONTINUE
  27, NEW GAME 33, SETTINGS 29, BACK 33; letter-spacing derived
  per panel (+0.10em / +0.14em / −0.07em / 0); sublabel margin 30,
  size 26, lineHeight 1.15. No tracking-widest. No hardcoded
  cursor on BACK — the (B) is part of the label, the cursor shows
  on the selected row only.
- Background: paper #ffffff. Full start y905 — DO NOT MOVE. Bottom
  1500, full to the edge, no negative space underneath. Phi fade:
  gone above 620 / mid (golden line) 729 / full 905. Fade length
  285. Golden lines 573 / 927 are reference only.
- Symbols: on the symbol layer ONLY — never above y620, never over
  logo, cloud or panels. The field itself: Part 6, step 1
  (formula v2 — the locked field is generated by formula, not by
  measured positions).

---

## Part 5 — animation states and the Menu Creator family (2026-10-25, after the lock)

### Animation — all PARAPHRASE from the conversation log; spec source `menu-background-animation-spec.md`

The motion spec: PixiJS v8 ticker, with the sine taken from
FireRed's `battle_anim_effects_1.c`
AnimTranslateLinearSingleSineWave — offset = sine × amplitude over
the symbol's base position. Pokemon sine, not scrolling.

**State 1 — SINE ONLY (Mars's correction, 17:05).** The earlier
scrolling demo was rejected: cheap/fast, NOT Pokemon sine — it
moved whole layers and rose above the logo. Never again. Sine
applies to the SYMBOL LAYER ONLY. Clamps: y620–1500 full scale
(310–750 half scale); never above the gone point 620; never over
logo, cloud or panels. Demo: `menu-v32-sine-only.gif` — 300
symbols, bob 6–12px, phase set by golden angle.
Option: Animation = SINE ONLY.

**State 2 — COMBINED (17:08).** Rise + fade + sine together on ALL
300 symbols. Modulo loop over the zone 620–1500. Fade = the locked
v32 fade (full 905, faint 729, gone 620).
Option: Animation = COMBINED.

**State 3 — MATCHED = "perfect" (17:10–17:12).** The parameters of
the old flow GIF are the reference, matched exactly: 80 frames ×
70ms = 5.6s loop; rise drift 5.5px/frame at half scale (440/80);
sway 3px; bob 2px; seamless frequency 2 cycles per 80 frames =
0.157 rad/frame. At full scale the rise is 157.14 px/s, sway 6px,
bob 4px. Demo: `menu-v32-rise-fade-sine-matched.gif`.
Mars's verdict (17:12): the matched animation is PERFECT.
Option: Animation = MATCHED. (This speed was the default until
2026-10-26 19:54 — Part 6, step 6.)

**Cache rule (17:31).** Never overwrite a file already shown. The
current animation was re-issued under a new name only:
`menu-v32-rise-fade-sine-current-20261025.gif` is a byte-copy of
the matched GIF.

Also kept as options: Animation = STATIC (the still v32), and
Animation = FLOW SPARSE (the sparse 36-symbol flow demo) —
labelled SUPERSEDED: Mars rejected it as too sparse; do not use it
as a default.

### The Menu Creator family — every item Mars-ordered, 2026-10-25

Full spec: `docs/ui-art-options/settings-menu-creator-spec.md`.

- **17:12 — Menu Creator approved.** Settings → MENU CREATOR:
  everything used to create v32 is editable; preview is the REAL
  menu (go back and it shows), not a fake panel inside settings;
  saving makes a preset; the default changes only on a new lock;
  Reset to Locked Default (v32) is always visible.
- **17:14 — the Pokemon-first rule, applied to menus.** The v1
  overlay mock of Menu Creator is DISCARDED: Pokemon settings is a
  dedicated FULL SCREEN, not a popup. FireRed `option_menu.c`:
  header window 26x2 at (2,3), options list 26x12 at (2,7), help
  bar 30x2 at (0,0); label left, value right; UP/DOWN wraps,
  LEFT/RIGHT cycles the value; A/B on CANCEL saves and exits; a
  FRAME change reloads the graphics live — that live reload is the
  Pokemon preview pattern. Menu Creator v2 spec: 4 pages (LOGO /
  BACKGROUND / ANIMATION / PANELS) in that exact structure.
- **17:16 — the rule confirmed for everything.** VERBATIM (Mars,
  recorded in `pokemon-first-rule.md`): "Exactly" — confirming
  that Pokemon-first applies to ANYTHING he asks for, with sources
  in order: (1) the game files we have, (2) open source,
  (3) anything else legal, (4) industry/academic. No terminal UI,
  ever, unless he asks for that exact thing in his own words.
- **17:18 — UI CREATOR** (a sub-menu: what an element LOOKS like —
  frame type, outline, rounded radius, border, glow, panel colour,
  text colour).
- **17:19 — BOTH exist.** UI Creator (look) and LAYOUT EDITOR
  (where it goes, how big: x, y, w, h, spacing, order, alignment,
  anchor) are different sub-menus at the same level. Layout fields
  are Pokemon's own window fields (tilemapLeft / tilemapTop /
  width / height).
- **17:20 — all Pokemon-editable UI + extra freedom rows.** Every
  row is labelled: **P** = Pokemon actually lets you edit this
  (FireRed/HeartGold options or frame choice); **X** = Mochiichao
  extension for more freedom — never claim Pokemon had it. FRAME
  row = 1–20 (FireRed's 10 frame types as the base set, HeartGold's
  20 choices as the count; all frames are ORIGINAL Mochiichao
  frames in those slots — no Pokemon frame tiles copied). Fonts,
  text colours, dialogue window, and every WindowTemplate (main
  menu, pause, options, healthboxes, action menu, party, bag,
  shop, PC, save, signpost, quest log) become editable elements.
- **17:21 / 17:22 — pull-all-then-edit: NOT adopted.** Mars asked
  twice; the boundary held (public repo / git history). What was
  agreed instead (17:23): a local-only stand-in workflow —
  proprietary-type items go in LOCALLY ONLY, marked, gitignored,
  never committed, replaced with the Mochiichao version before any
  push; releasable build = 0 such items. 17:24: "by parts" means
  conversion steps, not reconstruction. 17:25: backbone-only
  CONFIRMED. 17:26: the dialogue-beat conversion example
  CONFIRMED.
- **17:27 — the interchangeable-elements index**
  (`menu-elements-interchangeable-index.md`). Nothing shown is
  thrown away: every element from every draft is a selectable
  row/value. Menu Creator picks the element, UI Creator picks its
  look, Layout Editor picks its place/size. Rejected defaults
  (v31, v22, v23, sparse flow) stay selectable, labelled.
- **17:28 — the NEED list, fastest first**
  (`main-menu-need-list-100pct.md`). Six fast assets were ASSET
  DONE with wiring still NEED: footer, help line, DIAMOND VERSION
  subtitle, cursor, the 4 Y2K panel frames, sparkles/orbit layer.
  #7 mascot behind logo: NEED. #8 Menu Creator wiring: SPEC DONE /
  CODE NEED. #9 CONTINUE portrait: BLOCKED on the Human lane's
  transparent cutout. #10 title background scene art: HARDEST /
  NEED — and it must not be faked with a v32 composite.
- **17:35 — corrections + two new sub-menus.** (a) FOOTER: Pokemon's
  main menu has NO footer (`main_menu.c` checked) — a studio
  credit belongs on the TITLE screen, in the copyright slot
  (`title_screen.c` copyright/press-start tiles + the separate
  copyright screen). The footer is NOT text and NOT "MOCHII
  STUDIOS": it is the **M HEAVENSENT STUDIOS** logo; placeholder
  text until the logo arrived; `footer-mochii-studios.png`
  SUPERSEDED. The main-menu footer row survives only as an X
  option, default OFF. (b) HELP LINE: no help bar on Pokemon's
  main menu either — BACK TO TITLE stays a menu ROW (green, v32);
  the help bar "A: SELECT  LEFT/RIGHT: CHANGE  B: BACK" belongs in
  Settings / Menu Creator / UI Creator / Layout Editor, where
  Pokemon puts help bars. (c) SUBTITLE: the pink-outline /
  white-font DIAMOND VERSION subtitle goes back ON TOP of the
  cloud for now — 700 wide, centred on the cloud centre (600,738)
  — labelled TEMPORARY, not locked (composite:
  `menu-v32-subtitle-on-cloud.png`). (d) CURSOR CREATOR sub-menu
  (Pokemon base: `list_menu.c` selector arrow + cursorPal /
  cursorShadowPal / cursorKind; glow ring is an X extension).
  (e) PANEL FRAME EDITOR sub-menu (Pokemon base: the FRAME row;
  Y2K glossy panels are the X extension on that slot).
  (f) Sparkles/stars/orbit become editable rows, research-based
  (golden angle 137.508°, red/orange <2%, twinkle 3–7s max 1).
- **17:38 — the subtitle's phi placement.** phi = 1.618034.
  Subtitle width = logo width / phi = 900/phi = 556; height 74;
  centre (600,735) = logo centre 454 × phi; left 322, right 878.
  Noted at the time: cloud/logo centre ratio 738/454 = 1.626 ≈ phi
  (difference 0.008). Composite: `menu-v32-subtitle-golden-ratio.png`.
- **17:40 — the studio logo arrives.** Mars uploaded the M
  Heavensent Studios logo: title copyright slot. Width =
  screen/phi = 742 in the boot layout; 556 on the title layout
  (see the title spec). Centre (600,1222) on title.
- **17:41 — the standing default.** PARAPHRASE (recorded in
  `pokemon-first-rule.md`): always work from golden ratio / real
  research placement and scaling unless Mars says otherwise for a
  specific item. No eyeballed placements where a phi/research
  calculation exists. An override is logged for that item only;
  the default returns to phi/research for the next item.

### The settings structure underneath (from the traces)

The Menu Editor trace (`menu-editor-pokemon-settings-trace-20261026.md`,
FireRed → HeartGold → Black 2, structure only) pins the numbers
the family above is built on: FireRed's row counts are
{3, 2, 2, 2, 3, 10, 0} (TEXT SPEED / BATTLE SCENE / BATTLE STYLE /
SOUND / BUTTON MODE / FRAME / CANCEL); in FireRed, A or B exits
from ANY row and saves — the CANCEL row is just a label.
HeartGold's counts are {3, 2, 2, 2, 2, 20, 2} — FRAME is 20
there, Button Mode only 2 — and HeartGold has a real discard
path (B = quit) but leaks some values live while editing (sound,
button mode, text speed apply during editing and are not fully
reverted by Quit). Black 2 has NO frame row and NO button mode;
its discipline is the clean one: changes are live, but Quit
re-applies the entry snapshot, so Quit genuinely reverts. The
Mochiichao ruling recorded in the trace: frame counts must NOT
be merged blindly (FireRed 10, HeartGold 20, Black 2 none), and
the editor's exit follows **Black 2's snapshot discipline, NOT
HeartGold's live-leak, NOT FireRed's save-on-B** — the Menu
Editor's DISCARD is that discipline (Part 6, step 8). Six of the
editor's twelve categories have NO Pokemon options equivalent and
were designed new: cloud, symbols/animation picker, logo emblems,
logo slot, presets, export.

### Title screen (summary — the title has its own docs)

The main-menu session ran straight into the title screen; the full
record lives in `docs/ui-art-options/title-screen-spec.md` and
`title-screen-pull-100pct.md`. The locked points: Pokemon title
anatomy first (Ruby shine sweep x+=4/frame with background
brighten +2/frame to 31 then darken; version banner slides in
left+right; logo slides up; HeartGold blink cycle 30 on / 15 off /
45 total). Mochiichao phi layout, 1200x1500: logo 900 wide, centre
(600,450); DIAMOND VERSION banner 556x74, centre (600,735), slides
in Ruby-style; PRESS prompt at the bottom phi line y927, blinking
30/15; M Heavensent Studios 556, centre (600,1222), top 944 — 17px
clear of the press line. Background proportion 60-30-10. Sequence:
black → shine sweep → shine again → banner slides → logo slides up
→ press fades in + blinks → studio logo fades in → A/Start → white
fade → main menu (v32). Any key skips a phase, like Pokemon.
The hookup audit (`hookup-title-pressstart-settings-v1.md`)
recorded design/spec 17/20 (85%) and game 7/16 (44%) at that time,
with in-game SETTINGS opening a note only (functional 0/6) — and
the v32 menu itself kept UNCHANGED by the hookup.
One disagreement inside the Oct 25 record, flagged here and NOT
reconciled: the intro/title research doc lists three boot-sound
WAV options as made (A: A4+E5 two-note, 1.55s; B: C5-E5-G5-C6
arpeggio, 1.95s; C: D5-F#-A-G-D6 melodic logo, 2.30s — Mars's
ear-pick still owed either way), while the boot pull doc of the
same day says "Do NOT claim a boot sound exists" and lists it as
NEED. Both statements stand as written; the sound is not wired
in game under either reading.

---

## Part 6 — after v32: the dated correction chain (2026-10-26 → 2026-10-28)

These steps are NOT numbered versions — Mars never numbered them,
and this archive does not invent numbers for them. They are dated,
in order, with their PRs. Several of them changed locked values;
each one says whether Mars ordered it (a lock-level change) or
whether it follows the lock.

**Step 1 — 2026-10-26 14:18 — the symbol field goes back to the
formula.** VERBATIM (Mars, quoted in PR #214's body):
"stop cheating. Follow the formula" — rejecting the round-2
measured-position mapping (the 285-symbol set from PR #178:
SUPERSEDED, DO NOT USE). The field is GENERATED by the research
formula (formula v2, `src/lib/mainMenuSymbols.ts`): PHI =
1.6180339887; GOLDEN_ANGLE = 137.508°; N = 300; zone x 0–1200,
y 620–1500; lattice centre (741.6, 956.2) — 61.8% across, 38.2%
down the bottom zone; theta = i × GOLDEN_ANGLE; rho = sqrt(n) ×
PHI; K = 26.0 (outer radius 729px — the one constant the log does
not pin; recorded in PR #214 as chosen for the flattest full-width
columns, 22–29 per 100px, sd 2.1); jitter ±12.5% of mean spacing
59.3px (7.4px per axis, deterministic golden-ratio fractions —
no random module, no measured positions); fold x mod 1200,
y = 620 + ((y−620) mod 880) (the same modulo the rise motion
uses); sizes Fibonacci × 1.38 = {11, 18, 29, 47}, 75 of each;
shapes cycle v26's four; colours cycle v26's palette of 7.
Motion, fade and speed UNCHANGED from locked v32. Two research
rules were consciously NOT carried at N=300, and the PR says so:
the 1.5x min-gap rule was written for 12–18 symbols (at 300, the
worst pair sits 2.6px apart and renders as one heart, not a blob —
reported, not hand-fixed), and Fibonacci rotation is NOT applied
(the perfect lock, rotate 0, supersedes it). Bottom-fill evidence
(the 16:22 complaint, step 3): in the exact game-motion
simulation over all 80 frames, the bottom gap (1500 − lowest
symbol bottom edge) is NEGATIVE every frame (min −27.3, max −0.2,
mean −15.2) — the field reaches the edge; white seen below the
menu on a phone is the host letterbox, not field space.

**Step 2 — 2026-10-26 14:20 — panel text made exact (PR #206,
merged 2026-10-27).** PARAPHRASE: Mars caught centred panel text
(Pokemon and the targets are margined, not centred), a hardcoded
cursor on BACK, and tracking-widest on every label. The fix is
measured, in Part 4's floor: margins, label sizes 35/26/35/31,
letter-spacing DERIVED as (targetWidth − measuredWidth) /
(gaps × fontSize) from pass-1 Range measurements — not guessed.
The font family is deliberately NOT pinned: the Trebuchet MS /
Arial / sans-serif stack stays; headless Linux lacks Trebuchet MS,
so its fallback shifts width/height ratios, and the per-panel
letter-spacing absorbs that in this renderer.

**Step 3 — 2026-10-26 14:59 + 16:22 — the widened brief.**
PARAPHRASE (PR #214). 14:59: every version v1–v35 to be accounted
for; restore the missing small emblems; use the research's
golden-ratio randomness numbers; fix the field floating too high
and leaving negative space at the bottom. 16:22: bottom negative
space is still the main complaint, judged on the moving render.
(This brief is also the evidence for the v33–v35 gap — see Gaps.)

**Step 4 — 2026-10-26 17:59 + 18:13 — cloud: transform only.**
PARAPHRASE (PR #233). The cloud fix is positioning + scale ONLY,
using the original `puffy-cloud.svg` only. Sine/speed work is
PARKED by Mars at 17:59. The traced file
`mochiichao-main-cloud-v32.svg` is NOT the cloud: deleted from
main by Mars's order, BANNED everywhere, appears in code only in
BANNED comments. Redrawing the cloud path is banned by the 18:13
transform-only order.

**Step 5 — 2026-10-26 — the cloud frames: fixed1, fixed2, fixed3
(PR #233, merged 2026-10-27).** RECONSTRUCTED from the PR's
measurements. Why a frame was needed at all: the v21/locked
VISIBLE box is x250–950, y648–828, but the SVG's visible path
fills only 88.3% of its viewBox width (path x10–540 of 600) and
73.2% of its height (path y40–245 of 280) — and a plain `<img>`
letterboxes the viewBox (Chrome applies `meet`), so a 700x180 img
box rendered the visible cloud at only ~341 wide, centred ~583
(17px left, 48px short). The element is therefore
`<svg><image preserveAspectRatio="none">`, and its rendering
factors were measured (Chrome headless, this element, twice):
content renders at 0.851 × frame width, centred 0.044 × frame
width LEFT of the frame centre, 0.671 × frame height tall, top at
0.191 × frame height. Frames tried (visible interior, white-
interior method; TARGET from the v32 picture: x257–942, y655–815,
centre (599.5,735)):
- CURRENT (before): x422–742, y686–787, centre (582,736.5).
- FIXED1 (img 792x246 fill — superseded): x391–828, y665–787.
- FIXED2 (svg+image, frame 237,613,792x246 — superseded):
  x269–927, y665–810.
- FIXED3 (frame 225,599,823x258): x258–942, y653–811, centre
  (600,732) — 684 wide vs target 685 (99.9%). Close, NOT exact.

**Step 6 — 2026-10-26 19:54 — the checkpoint lock + three forward
fixes.** VERBATIM (Mars, recorded in
`cloud-fixed3-checkpoint-20261026-2015.md`): "lock in what you got
as one we can get back to at any point in time." The checkpoint:
cloud fixed3 is saved as CURRENT-restorable — explicitly NOT
perfect. Restore: branch `feature/cloud-shape-fix-20261026`,
head fd2516c4, plus the fixed3 renders. Registry:
`docs/locked-versions.json` / `.md`, log: `CHECKPOINT-LOG.md`.
The same message carried three fixes, all Mars's: (1) the emblem
rise is TOO FAST — use PR #163's slow-rise speed; (2) the emblem
field is TOO NARROW — widen it on both sides; (3) the blue + pink
hearts by the logo are MISSING — restore them at their exact v32
placements and exact layer (they existed only in PR #214).
Two pieces of Mars's own wording survive for this step's fixes:
the slow speed had been saved as an option in PR #163 and named
by Mars at 2026-10-26 10:54 CDT — VERBATIM: "really slow rise"
(cloud trace §3); and the field defect, in the words the cloud
trace quotes from his report on the fixed3 moving GIF —
VERBATIM: "white space on both sides of the emblems".
At 19:57 the acceptance bar, as recorded: the corrected cloud
must look like the TARGET exactly — not close, not 99.9%.

**Step 7 — PR #261 (Mars's orders of 19:54 + 19:57; merged
2026-10-27) — cloud exact-target, slow-rise default, field
finding, hearts exact.** Four parts:
(a) CLOUD: frame (224,599,825x264), transform only, file
byte-untouched. (In the isolated element rig, the frame
(224,601,825x254) measured EXACT on all four edges — interior
257–942 x 655–815; the app frame differs because of the app
correction below.) The finding that earned it: the picture's cloud
is a uniform vertical stretch ×1.039 about the top (the picture's
lobes sit 6px lower than the element's). Measured in the true
1200x1500 app render: interior 257–942 x 655–816 vs target
257–942 x 655–815 — left/right/top EXACT, bottom +1 (edge
threshold); right-lobe stroke 819 EXACT. ONE honest deviation,
recorded in the PR and not silently fixed: the picture's cloud is
asymmetric (left lobe bottom 812, right 819) while the SVG path
is symmetric, so NO frame-only transform matches both lobes —
the frame overshoots the left lobe's visible tail by 7px (at
x280–300, partly behind the Mochii). Fixing it by redrawing the
path is banned by step 4's order; it waits on Mars's call.
(b) SPEED: the default animation speed changes from "perfect" to
"slow-rise" (PR #163's speed): rise 8–14 px/s (per-symbol
vy = 8 + (i % 7)), sway 3–8, rotate ±4°, periods 4/5/6s.
"Perfect" stays as an option. Proof, same-sampling GIF
comparison: median rise 10.9 stage-px per frame interval vs 59.8
for the old perfect-speed GIF — 5.5x slower as a LOWER bound
(code ratio ~14x). This answers fix (1) of step 6.
(c) FIELD: no code change — the gap was the render, not the game.
The 285-symbol field then in code already spanned centres
20–1174, extent 1–1198.2 (full width); the old GIF's ~57px side
space was its 1200x1357 letterbox (stage scaled to 1085 wide).
The new native moving frame measures palette span x4–1199
(target picture 3–1195). This answers fix (2) of step 6: the
field was full-width; the picture of it was not. The bottom edge
was measured directly (2026-10-26, `menu-moving-bottom-measure`
and `menu-moving-bottom-phase` JSONs): across 195 wall-clock
frames the lowest symbol pixel sits at full-scale y1498.5 in
EVERY frame — a constant 1.5px gap to the 1500 bottom; across
the 80 phase-exact frames (captured with a script clock,
t = i × 70ms, rendering the app's own code) 79 of 80 frames read
the same 1.5px gap, with one outlier (frame 039, 7.7px) where
the lowest symbol has just wrapped. The two render scripts
(`render_menu_moving_phaseexact`, `render-native`) are capture
harnesses only — they hold NO spec values; anyone citing them as
the source of a position or a sine number is citing the wrong
file.
(d) HEARTS: measured from the v32 picture, correcting PR #214:
blue centre (169,421.5), 63x50, #8cd2ff; pink centre (230,640.5),
53x40, #ff96c8. Layer exactly the v28 order — drawn last in
MainMenuBackground's SVG (above arcs + symbols, below logo +
cloud + panels); static, full opacity. Recorded consequence: the
real logo PNG (thick orbit, tall M) covers parts the picture's
flatter logo art does not — the blue heart's lower portion sits
behind the orbit band and the pink sits almost fully behind the
M. Lifting the hearts above the logo to force visibility would
break the v28 order; that is Mars's call, not an agent's.

**Step 8 — 2026-10-26 19:59–20:40 — the Menu Editor (PR #260,
merged 2026-10-27 as 5f5ac9c8).** PARAPHRASE: Mars's order —
everything the UI lane did is editable by him from inside the
game, in Pokemon menu style (dedicated screens, name left / value
right, Left/Right cycles, A confirms, B back, save + restore).
Refinements the same evening: 20:32 — the editor tool's OWN
submenus are draggable/minimizable layers over a LIVE preview
(his explicit call; the tool's pattern only — the game menus stay
full screens). Built: `src/lib/menuEditor.ts` (188 editable
values: title 16, main menu 107, pause 46, Mochioteka 6, fonts 7,
game options 6), `menuEditorExport.ts` (canvas render + PNG/WebM
export), `MenuEditorScreen.tsx` (17 panels), wiring in
MainMenuBackground / IntroSequence / SettingsScreen / GameShell /
DexView. Editing writes the WORKING preset only; the game loads
working-if-saved, else locked exactly. DISCARD follows Black 2's
snapshot discipline (Part 5), not HeartGold's live-leak.
RESTORE LOCKED V32 in the
editor copies locked values into the DRAFT — it persists nothing
until a separate SAVE (that gap is what step 9 closes).

**Step 9 — 2026-10-27 — the locked v32 FULL SNAPSHOT**
(`docs/locked-v32-full-snapshot-20261027.md`; code
`src/lib/lockedV32Snapshot.ts`). One Settings row — RESTORE
LOCKED V32 (plus a twin on Menu Creator page 4) — restores ALL 19
dimensions in one click: canvas, logo PNG, cloud + frame, Mochii
cue, panels + label metrics, background + arcs + orbits, phi
fade, symbol animation speed (slow-rise, the current lock),
formula v2 field, all game settings, all menu-custom fields, the
preset fields, the title start-screen pick (cleared), the
animation-speed override (cleared), and the Menu Editor WORKING
PRESET (cleared — the old RESET row never cleared it, so after
editor edits even RESET left the edited menu on screen). The
snapshot is built LIVE from `LOCKED_V32_MENU` + the default
stores — never a stale copy — and it follows later locked values
(the #233/#261 cloud frame, the #206 label metrics, the logo
emblem layer) instead of re-deciding them. NOT in the snapshot,
by its own statement: the title scene itself, pause/Mochioteka
layouts, the editor's saved-template library.

**Step 10 — 2026-10-27 — lane state (recount, RECONSTRUCTED from
`ui-lane-recount-20261027.md`).** On main by then: the v32
restoration (PR #137: MenuList + MainMenuBackground), the
animated background (animation / sway / fade / bob in
MainMenuBackground), per-menu Y2K skins, the creators. Still
partial at recount time: Menu Editor (#260, merged later that
day), cloud/emblem fixes (#233 / #261 / #214 / #215 — of which
#214, #233, #261 merged 2026-10-27), day/night (#153 spec + #212,
still open at filing). The recount's own count — 24/40 done,
14 partial, 2 not started — is a RECONSTRUCTED list (the original
40-item enumeration was never found); do not quote it as Mars's
number, and do not add the title lane's 55/55 or 60/60 to it.

**Step 11 — 2026-10-27 verdicts, item 1 → PR #322 (fork) /
PR #5 (private; owner-confirmed 2026-10-28).** PARAPHRASE (PR
bodies, byte-identical in both repos). The change: pink heart
MIRRORED — centre x 230 → 970 (= 1200 − x), same y 640.5, same
53x40, same #ff96c8; blue stays (169,421.5). Panel labels:
CONTINUE + SETTINGS → white letters with black outline (2px
8-way shadow); CONTINUE sublabel → white + black outline (1px);
NEW GAME and BACK TO TITLE unchanged, plain black. (The task
wording it answered said "black letters with white outline (as
current)"; the PR records that all three targets and the base
code give BACK as plain black — 0 white px in its label band —
so no halo was added there. Decomp check in the same PR: FireRed
`main_menu.c` is left-aligned with white foreground — left
alignment + white letters are Pokemon-faithful; the black
outline, coloured fills and margins are Mochiichao spec.)
MEASURED WARNING, in the PR and repeated here because it decides
the next call: at the v28 layer the mirrored pink box is 100%
logo-opaque — the render confirms 0 #ff96c8 pixels in that box —
so the mirror move alone makes the pink heart INVISIBLE; the
left box it leaves is 0% logo-opaque and the blue is ~72%
visible. If the pink heart must be seen on the right, it needs a
new order from Mars (a layer above the logo, or a
transparent-gap position). Also recorded: three heart systems
coexisted on main (background logoEmblems from #214, approximate;
background logoHearts from #261, exact; the editor's emblems) —
deduping them is an editor-lane call owed to Mars/parent.
STATUS: Jamar confirmed this look as the current default on
2026-10-28. PR #5 as filed does NOT merge cleanly onto current
main (it was cut from an older main) and stays unmerged; the
confirmed look is re-cut onto main by the menu coordinator lane.
The confirmation covers the LOOK — mirrored pink heart position
and white labels with black outline — not that branch.

**Step 12 — Menu Editor expansion (PR #6, private; unmerged).**
PARAPHRASE (PR body). 314 editable values (the 188 of step 8 +
126 new): pinch/scale (two-finger, Ctrl+wheel, slider 25–200%),
preview-behind (minimize / drag aside / ghost 45% / park),
per-panel label colour/outline/font/alignment, per-line pause
styling, per-emblem layer, deeper save library (rename, duplicate,
search, tags, per-piece save/load), retro options (Gen 1–5 +
Black 2, each row sourced to a game + file), access rows (reduced
motion, high contrast, touch targets 44/56/68px, preview font
scale 0.85–1.30). The MIRROR PINK HEART row lives here as an
editor action: it sets x = 1200 − x. Gaps the PR declares about
itself: per-heart-above-logo stacking NOT implemented (per-heart
layer is z-order inside the emblem group only); per-panel ALIGN
drives the editor preview only (the real menu keeps #206's left
alignment until that wiring lands); font-picker entries missing
for the FireRed/Emerald/HeartGold font ids (no font files exist —
reference-only). STATUS: unmerged — Mars judges its six
screenshots first. Those screenshots were shown in chat on
2026-10-27 and never saved to the repo (see Gaps).

**Adjacent wiring record (from `wiring-tracker-100pct.md` —
wiring, NOT design; the menu itself was not redesigned in any of
these).** Eight separate batches list the main menu in their
"NOT changed / Keeps" lists as the locked v32 — the tracker never
documents a design change to it, only preservation. What did
change around it: BUTTON MODE keys on the main menu (PR #73, live
via PR #122: Q/E move the cursor, L confirms — "l copies A" only
in L=EQUALS=A mode; typing targets exempt); main-menu music
(PR #104: `mochiichao-main-menu-v1.wav`, a DRAFT wired for
testing, looping, tracks fade out over 1000ms on change);
press-start arrival (the M3 Mochii Chirp plays on the title
PRESS ANY KEY advance, through the 350ms white fade into
MAIN_MENU). The Menu Custom preview strip in Settings got its own
motion parameters (PR #80: SINE angle 2π per 2s at 1x scaled by
animationSpeed; FLOW = drift loop sweeping −2·sway…+2·sway over
4s; RISE_FADE = 2s loop, y 0…−12px, opacity 1…0) — and the
tracker states in the same entry that title/main-menu
symbol-layer motion IN GAME was still a GAP at that point; the
strip is a Settings preview, not the menu. The tracker also
carries the boot-sound tension one level further: most of it
treats BOOT = Option B (rising arpeggio) as settled and wired,
while its own local-only queue still lists "Mars pick A/B/C still
open — no sound wired until picked". Both statements stand;
nobody reconciled them in the record.

---

## Open owner calls — carried forward, do not decide these for him

From `mars-compare-notes-20261027.md` (renders compared, NO
changes made; all three still await Mars's word):

(a) **Top sparkle.** The v32 picture's top star: box x580–620,
y174–214, 41x41, centre (600,194), 521 black px. The matched GIF
and Mars's own proof render have 0 black px in that window. Keep
the v32 star, or drop it to match the GIF/proof?
(b) **The fade's faint segment.** Code `fadeAt` is piecewise
linear: 0 at 620 → 0.35 at 729 → 1 at 905. Re-measuring the
matched GIF (all 80 frames) sits BELOW the code line across
620–729 (10px bin medians: +0.014 at 650, −0.031 at 670, −0.069
at 690, −0.094 at 710 at worst; per-row −0.112 at 726), while the
strong segment 729–905 matches within ±0.011. Keep the code's
straight line, or order the GIF's faint curve?
(c) **Phone framing.** Current: width-fit letterbox (the
1200x1500 stage renders 390x487, centred in an 844-high phone
screen; 179px white above, 178 below — that white is the HOST
letterbox, not menu space). Proposed: height-fit cover (scale
0.563; centre-crops ~253px per side at full scale; panels
x300–900 still fit; the logo side stars at ~140/~1060 would crop;
the CONTINUE sublabel runs to the right edge). Keep letterbox, or
approve fill-height? Until Mars approves, NO framing change
anywhere.

Also open, named in PR #233 and not changed there: the cloud bob
(±6px, 5s, from PR #149) was never Mars-locked — killing it is a
one-line follow-up if he wants the cloud dead static.

---

## GAPS — listed by number, never padded

- **V33 — GAP.** No file, render, log entry or PR found.
- **V34 — GAP.** No file, render, log entry or PR found.
- **V35 — GAP.** No file, render, log entry or PR found.
- **V36 — GAP.** No file, render, log entry or PR found.

  Checked, not assumed: the full main-branch tree listing
  (26,013 paths, 2026-10-28) contains no v33, v34, v35 or v36
  token anywhere, and the 117,854-byte wiring tracker has zero
  hits for any of them.

  Evidence for the v33–v35 gap: Mars's own brief of 2026-10-26
  14:59 CDT (step 3 above) asked for "every version v1-v35", and
  the workers who answered it recorded in PR #214's body:
  "v33–v35 do not exist as files; v1–v9 placement numbers are not
  in the files; neither invented." The post-v32 work that does
  exist is filed above as the dated correction chain. V36 is not
  referenced in any source searched at all. If Mars numbers a
  future step, it is added here under his number, in his words.

- **V1–V9 symbol-placement numbers — GAP** (same PR #214
  statement). Those versions predate the symbol field; their
  artefacts and descriptions ARE on record (Part 1), but no
  placement numbers for them exist and none are invented here.
- **PR #6's six screenshots — GAP as files.** Shown in chat
  2026-10-27, never saved to the repo — a staging failure, named
  as such in the main chat. Their names survive in PR #6's body:
  editor-depth-pinch-scale, editor-mid-drag, editor-library-depth,
  editor-per-line-style, editor-retro-access, editor-access.
  Re-rendering them is owned by another lane.
- **Workspace proof renders — PARTIAL GAP.** The Oct 26–27 proof
  renders (cloudpos-*, cloudemblem-*, perfect-menu-*, menu-editor
  shots) were held in the local clone `~/workspace/mochiichao-work/`,
  which no longer exists on this machine. EVIDENCE-INDEX.md marks
  each one repo-held or workspace-only; workspace-only renders
  survive only where a PR or doc also carries them.
