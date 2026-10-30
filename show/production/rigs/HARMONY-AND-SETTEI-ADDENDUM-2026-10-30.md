# ADDENDUM 2026-10-30 — Harmony rig kit + settei/design-rules kit
### Companion to RIG-AND-SHEET-SPEC.md and DONOR-PROVENANCE-2026-10-29.md

Lands the construction kit recovered by the 2026-10-30 donor hunt
(owner order: hunt everywhere — repos and the open internet — and
pull study copies). **Specs and measurements land; studio character
files never do** — the source material stays in local study only.

Provenance in one paragraph: the Rick & Morty Toon Boom files named
as gap §C.1 in DONOR-PROVENANCE-2026-10-29 were in the owner's own
holdings — GitHub release `tv-gigaleak-rickandmorty-v1` of
`mhvnsnt/cn-gigaleak-cartoon-vault`, asset
`rick-and-morty-toonboom-files.zip` (asset id 657152589,
17,745,919 B, sha256 of the downloaded copy
ed7e9b3ea9578f6f7f77399ddb353923ee90379ddbd8a33e42c891bca6a91cea),
with a byte-size-identical duplicate asset (id 657744881) in
`mhvnsnt/cn-gigaleak-bonus-non-cn` release `bonus-non-cn-v1`. The
2026-10-29 pass searched trees and code search but never enumerated
release assets — the vault's tree holds only the Smiling Friends
zip, which is how real files were reported as a gap. Also identified
this pass: `khsqgj.pdf` (provenance §C.2, unidentified there) is the
Smiling Friends *Design & Cleanup Rules* book. Digimon settei were
located on the public web (Settei Dreams; archive.org item
`digimon-adventure-2020-settei`). Lilo & Stitch has no circulating
sheet pack; its production style document is *Surfing the Sanders
Style*. Monster Rancher settei: not located anywhere searched —
recorded honestly in the hunt report.

---

# Kit — Toon Boom Harmony production rig construction
### Extracted 2026-10-30 from a real network production template library (study copies local only)

Source of measurements: five complete character templates (.tpl) from a
Harmony Premium 21 production — Rick (hero build), Morty (hero build),
Beth, Summer, Jerry (standard builds). File/header evidence:
`scene.elementTable.xml` reports "Harmony Premium (HarmonyPremium.exe)
version 21.0.1 build 17727"; palettes carry server paths
`/USA_DB/jobs/RAM_Character/...` and `/USA_DB/jobs/RAM_BUILD/...` —
i.e. these are the studio's shared character-build templates, exported
from the production database. Full provenance: HUNT-REPORT.md.

Everything below is construction method — part systems, node
vocabulary, naming, palette format — written so a Mochiichao rig can be
built to the same standard in Harmony or mirrored in BlairWitch/.rig.json.

---

## 1. Template anatomy (what a character .tpl contains)

```
<Character>.tpl/
  <Character>.tpl/
    PALETTE_LIST              — text: which palettes, LINKed from the job server
    scene.xstage              — the node network + pegs + deformers (XML)
    scene.elementTable.xml    — element registry (id, name, folder, field chart)
    scene.aux                 — auxiliary scene data
    pose_copier_cached_data.json (optional — pose library cache)
    palette-library/*.plt     — character palette(s), plain text (see §5)
    elements/<PartName>/      — one folder per drawing element
        <PartName>-<sub>.tvg  — substitution drawings (vector)
        palette-library/      — per-element palette link folder
    environments/, frames/, jobs/  — standard Harmony scene folders
```

- Hero builds (long-running leads): Rick = 66 elements / 1,348 drawings,
  xstage 9.37 MB. Morty = 45 elements / 842 drawings, xstage 7.18 MB.
- Standard builds (supporting cast): 39–45 elements / 326–337 drawings,
  xstage 0.62–0.93 MB. The hero/standard gap is ~10× in network size —
  budget rig effort by screen time, exactly like the model-sheet
  principal/secondary split in the Gumball guide (PR #145).

## 2. Part decomposition (element inventory)

Naming: character prefix + part + side, e.g. `R_lower_arm_L`,
`M_eye_R_lideyebag`, `Mom_collar_back`, `Summer_hair_back`,
`Dad_lower_pants_inner_L`. Three naming generations coexist (initials
`R_`, `M_`; role names `Mom_`, `Dad_`; full names `Summer_`) — the
convention that matters is *prefix_part_side*, stable across the cast.

Standard part set (39–45 elements on a standard build):
- Head group: head, hair, hair_back, ear_L/R, brow_L/R, eye_L/R
  (with lid+eyebag as one combined element), nose, mouth.
- Torso group: neck, collar_L/R + collar_back, chest/hips, crotch.
- Arms: shoulder_1, upper_arm/sleeve_L/R, sleeve_inner_L/R,
  lower_arm_L/R, lower_sleeve_L/R, hand_L/R.
- Legs: upper_pants_L/R, lower_pants_L/R, pants_inner_L/R,
  lower_leg_L/R, shoe_L/R.
- Extras as needed: belt, buckle, labcoat pieces, props
  (`Prop_2`, `prop_placement_01`), a `Line_Thickness_Knob` element,
  versioned dupes for variant assemblies (`Int_Pocket1.56`…`.60`).

Hero-only granularity: coat split into 7+ elements (coat side, coat
back, coat-down, lapels), hand overlays as separate elements
(`R_hand_L_OL`), tongue+mouth interior as one 565-drawing element
(`R_Tongue_OL`), eye squash helper elements (`eye_squash`,
`eye_lid_squash`), spare hand sets (`M_hand_extra_L/R` on Morty).

## 3. Substitution-drawing conventions (the mouth/hand/head charts)

- Angle codes are baked into drawing names: F (front), 3Q
  (three-quarter), P (profile), PQB/PPQB (profile-quarter-back),
  Q, B (back). Eyes ship per angle: `Mom_eye_L-3Q_1…4`, `-F_1…4`,
  `-P_1…4` — four numbered variants per angle (lid positions).
- Heads: 10 drawings on Rick (`R_head-1, -B, -F, -FQ, -P, -PPQB,
  -PQB, -Q, …`) — a head is a small angle chart, not one drawing.
- Brows: 19 drawings incl. named expressions (`R_brows-3Q_Angry1`,
  `-F_Angry3`) — expression in the drawing name.
- Mouths: 44–48 drawings on standard builds (Beth 47, Summer 44,
  Jerry 48), angle-coded (`Mom_mouth-3Q_10`, `-3Q_11`, `-3Q_12`…).
- Hands: **105 / 107 drawings** per hand on the hero build
  (`R_hand_L_OL`, `R_hand_R_OL`) — the hand library lives INSIDE the
  character template as a giant substitution chart, the Harmony
  counterpart of Foster's shared generic-hands library (PR #145 §3f).
  Standard builds keep hands small and add `hand_extra` sets instead.
- Every element reserves an `-empty` drawing (blank substitution =
  part hidden) — visibility by substitution, not by deleting.
- Per-element folders each carry their own `palette-library/` link —
  colours resolve per element from the shared palette.

## 4. Node network (from the hero xstage files)

Module census — Rick: 1,586 CurveModule (deformers), 997 PEG,
447 Multi-Port-In + 447 Multi-Port-Out, 423 OffsetModule, 77 READ,
33 COMPOSITE, 26 IMAGE, 15 COLOR_OVERRIDE_TVG, 12 TransformationSwitch,
9 CUTTER, plus COLOR_ART / LINE_ART / OVERLAY / UNDERLAY art-layer
splits. Morty: same vocabulary (1,181 curves / 964 pegs / 53 reads).

What the numbers mean as construction rules:
- **One master peg per character** (`R_MASTER_PEG`); every part hangs
  under it through its own peg. ~1,000 pegs on a hero rig: pegs are
  cheap, hierarchy is deep.
- **Curve deformers are the default joint**, not bones: each Curve
  module carries resting offset + orientation and an Offset module;
  chains run Curve → Curve_1 → Curve_2 … up to Curve_8 per limb.
  447 Multi-Port pairs = the network is built from grouped sub-networks
  (one group per body region), each with its own in/out ports.
- **A dedicated composite per region** (`Head_Composite`, several
  `Composite_*`) rather than one flat composite — z-order is managed
  per region, then regions composite together.
- **CUTTER nodes do the masking** (9 on Rick): coat-over-torso,
  sleeve-over-arm, mouth-inside-head are cutter pairs, driven by the
  dedicated matte colour in the palette (§5).
- **TransformationSwitch** (12–14) swaps whole part assemblies
  (angle/turnaround switches), and named switches exist for colour
  override sets (`CO_Line`, `CO_Fill`, `line_trims_fill` —
  COLOR_OVERRIDE_TVG modules recolour line/fill for states like
  shadowed or lit variants without new drawings).
- Art is split into LINE_ART / COLOR_ART / OVERLAY / UNDERLAY layers
  on composite parts (the standard Harmony 4-layer drawing model) —
  overlay carries tones/highlights, underlay carries shadow shapes.
- Scene defaults: **24 fps**, 12-field field chart
  (`fieldChart="12"` in the element table); camera-safe key palette
  framed for 1920 (`Camera_Safe_Key_1920.plt`).

Beth/Summer/Jerry networks are the same vocabulary at standard scale
(65–71 pegs, 40–47 reads, 2–3 composites, no curve-deformer forest) —
the standard build is a peg-and-substitution puppet; the hero build
adds deformers, cutters, overrides and region composites.

## 5. Palette format (.plt — plain text, measured)

```
ToonBoomAnimationInc PaletteFile 2
Solid    Line            <hex-id>    0   0   0 255
Solid    hair            <hex-id>  171 213 235 255
Solid    skin            <hex-id>  215 203 191 255
Solid    rig             <hex-id>   39  31 178   0    <- alpha 0
Solid    Cutter          <hex-id>    0 255  12 255   <- pure green matte
Solid    "top teeth"     <hex-id>  229 224 176 255
```

- Semantic, part-based colour names (hair, skin, pants, socks, shoes,
  belt, buckle, labcoat, tongue, tooth, mouth, eye, drool, "drool
  line", "labcoat inside", "shoes sole", "eye bump color") — one flat
  list per character, ~25 colours on the hero palette, quoted names
  where a space is needed.
- Two functional colours ride in every palette: `rig` (blue, **alpha
  0** — invisible guide colour used to paint rig-only marks) and
  `Cutter` (saturated green — the matte colour cutter nodes key on).
- Palettes are LINKed, not embedded: `PALETTE_LIST` points at the job
  server path, so one palette update propagates to every scene — the
  same single-source rule as our §2 palette files, enforced by the tool.
- Utility palettes travel with every template: `Controllers.plt`
  (control/deformer colours), `penstyle_opacity.plt`,
  `Camera_Safe_Key_1920.plt`, `Default_rec.plt`.

## 6. What this gives Mochiichao (application notes)

- The .rig.json scaffold's body plans should add: angle-coded
  substitution charts (F/3Q/P minimum) for head, eyes, brows, mouth;
  a hand chart sized by screen time (standard ~10–20, hero 100+);
  an `-empty` substitution per element; cutter pairs for
  clothing-over-body overlaps; a transformation-switch per turnaround
  angle; per-region composites.
- Palette files (§2 of RIG-AND-SHEET-SPEC) should adopt the .plt
  discipline: flat semantic list, one `rig`-class guide colour at
  alpha 0, one matte colour, everything LINKed from a single source.
- Deformer-first joints (curves with resting offset/orientation) are
  the Harmony answer to the thin-streak/neck-seam defects logged on
  the Dorowani rig v1: parts overlap under curve control instead of
  rotating as rigid cards.

---

# Kit — settei (anime production setting documents) + design-rules rulebooks
### Extracted 2026-10-30: the sheet-format half of the missing-donor hunt

Two document *systems* recovered/documented in this pass. Both are
formats, not artwork: the value is the completeness standard they set
for a Mochiichao model pack.

---

## A. The settei pack (Japanese TV-anime setting documents)

What a settei pack is, verified against the largest public archive
(Settei Dreams, setteidreams.net) and a published design-works book:

**Sections** (from *Digimon Adventure tri. Design Works*, official
Toei book, section index verified via withthewill.net's breakdown):
1. Character & partner design works — heroes + partners at their
   primary forms, with shading/highlight/detail callouts
   (clothing construction, accessories drawn separately).
2. Creature design works — the full creature roster incl. evolved
   forms and one-offs.
3. Prop design works — signature items drawn first (devices,
   eyewear), then the rest.
4. Art design works — environments, multiple angles per space,
   **scale diagrams with characters placed in the space** for depth
   and perspective.
5. 3DCG model works — where CG assists (evolution sequences), the
   models are documented in the same pack.

**Circulation facts (2026-10-30):**
- Settei Dreams (largest archive) holds Digimon settei for
  *Digimon Adventure:* (2020 reboot, added 2026-05-29, scanned by
  Gamer101_123) and *Digimon Universe: Appli Monsters* (2021-05-21,
  donated). Homepage states the archive's terms: reference use for
  animation practice, fan art, 3D models, cosplay; no resale.
- An archive.org item `digimon-adventure-2020-settei` holds the 2020
  settei as a single PDF ("Digimon Adventure (2020).pdf"; the item
  page showed 1,674 downloads at check time). Direct file fetch from
  this machine returned a landing page rather than the PDF — recorded
  as a live lead with a verified listing, study-copy pull pending a
  working mirror.
- Original 1999 *Digimon Adventure* settei circulate as physical
  photocopy sets in the collector market and as restored sheets on
  DeviantArt (e.g. MysticalDreamer18's Digimon settei restorations,
  posted as colouring-page references, Toei/Bandai credited) — no
  complete digital pack located in this pass.
- Official physical route: Toei's *Design Works* books (DigiFes /
  Toei store, limited runs) — the tri. volume above is the template
  for what "complete" means.

**Format rules to adopt (the kit):**
- Every character sheet carries: turnaround + expression set +
  detail callouts (each accessory drawn alone) + shading/highlight
  guides on the same sheet — not as separate documents.
- Creature sheets are grouped by evolution/stage line, forms side by
  side at consistent scale.
- Environment sheets always include a character-in-space scale
  diagram; props get their own section ordered by story importance.
- One pack per production, one index — our model-pack completeness
  standard (8-sheet KND pack in TOOLING-INDEX) should grow the
  settei sections: props section + art/scale section + CG-assist
  section where applicable.

## B. The design & cleanup rulebook (recovered document system)

`khsqgj.pdf` — unidentified in every prior pass — is identified
2026-10-30 by first-hand page reads as the **[adult swim] DESIGN &
CLEANUP RULES — SMILING FRIENDS** (created by Zach Hadel & Michael
Cusack), 18 scanned pages, sha256
4f370172378d4c4d5b1671aed858d00e326ccedb03057c9743b56c2995f6f306,
held in `mhvnsnt/cn-gigaleak-cartoon-vault` (repo blob, mirrored in
the pdfs release as `Smiling.Friends.pdf`, asset 657077433,
7,830,039 B — byte-identical size).

Structure observed (pages 1–3, 9 read directly; document continues
in the same system):
- Cover: show title + "Design & Cleanup Rules" + creator credit.
- Numbered rules, one topic per spread, each rule = a short
  statement + paired do/don't drawings with ✓/✗ marks:
  - Line weight: ONE universal line weight across all characters,
    props, FX and backgrounds at every shot size (Rule 1).
  - Line quality: three graded classes — clean (1), wobbly (2),
    scratchy (3); "too sloppy" is the failure line (Rule 2).
  - Bodies with clothes: draw the full body first ("as if wearing
    spandex"), build clothes over it, final touches last — kills
    lumpy seams where parts join (Rule 3, with a GOOD FLOW / BAD
    FLOW annotated example).
  - Drawing angles: 3/4 front + profile are the norm; front view is
    the exception, reserved for comic effect (Rule 4).
  - Poses: no "cartoon cliché" poses, no shrinking/stretching body
    parts; believability and consistency over pushed acting (Rule 5).
  - Mouths (Rule 17): nose line ends in a point at the lip; upper
    lip gently curved overhanging the bottom; mouth shapes kept
    asymmetrical; open mouths cut INTO the body silhouette; small
    characters get simple, large mouth shapes for readability.

**The kit:** the rulebook is a *document type* Mochiichao doesn't
have yet — a numbered, visual do/don't design-rules book per show,
separate from model sheets. Rules 1–3 and 17 map directly onto
defects already logged in our own pipeline (line-weight drift
between donors, seam gaps at joins, mouth-chart discipline), and
the format (numbered rule + ✓/✗ pair drawings) is the cheapest
possible way to make a style rule enforceable at the gate.

## C. Lilo & Stitch — the style-guide fact (no sheet pack circulates)

No model-sheet pack for Lilo & Stitch circulates digitally (his
repos: none; web: auction/gallery singles only — Heritage Auctions
lot #47306 sold a Lilo turnaround model-sheet copy/print with
production roughs attributed to Andreas Deja; galleries sell
individual production drawings). What does exist, and is the actual
production document for the film's look: **"Surfing the Sanders
Style"** — the style manual Sue Nichols wrote dissecting Chris
Sanders' drawing style, required study for every artist joining the
production (Sanders' own FAQ, chrissandersart.com, confirms the
booklet, its purpose, and that the film was made to look like his
drawings). Kit value: when a show's look is one artist's hand, the
production writes a *style-dissection manual* — the same document
type as (B), aimed at a drawing style instead of cleanup rules.
For Mochiichao: the canon species art style needs its own
"Surfing the — Style" dissection if multiple hands/AI seats are to
hold it.
