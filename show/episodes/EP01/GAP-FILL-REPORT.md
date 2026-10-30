# EP01 GAP-FILL — REPORT (2026-10-28)

**Programme:** EP01 gap-fill, carried out 2026-10-28 at the owner's order,
closing the gaps named in §11 of the EP01 Generation Package
(`show/episodes/EP01/GENERATION-PACKAGE.md`). This report is the close-out
record: what was done, what it rests on, what is still honestly open, and
what this programme does **not** claim.

**Rules the programme worked under:**

- **Canon-only sources.** Every fill was built from canon material already
  in the repo or in the owner's own staging (canon fronts / cutouts, named-
  canon human model sheets, the canon Gate base plate, and the canon
  colour / lighting systems). Nothing was taken from any other production.
- **DERIVED / CANDIDATE honesty.** Nothing produced by this programme is
  labelled canon. Generated sheets are CANDIDATE until the owner locks
  them; graded / landed plates are DERIVED and marked CURRENT-FOR-EP01
  for episode use only. Every landing carries its provenance and hashes
  in its registry or folder record.
- **Fenced list — not touched, not invented.** Owner-owed canon was left
  exactly as it stood: the species-data / dex texts, what stopped moving
  in the Dark Forest, the ED slot's content, the Mochiioteca's physical
  design, Mochiko's voice casting, and the status of Rule 3. The
  Dark Forest item is not depicted or described anywhere in this fill.
- **No baked shadows.** Character art carries no baked-in ground/contact
  shadow; sheets were graded on clean fields and Sproutle was seeded only
  from the cleaned cutout (the baked-shadow v1 file was never used).

**How it landed:** six production PRs, each squash-merged and verified
back from main — #26 plates (merge `f0b1db8408866ea82ff64c4a3d086eff825ccdbf`),
#27 human packs + records (merge `8d7e1588c877634d0cc75b420ae68153a9248580`),
#28 props (merge `44448fc7758fbcfc06769418fa7e4f0419df1c0d`),
#29 Dorowani + Kittember sheets (merge `4be1873039839d020fff0ff0b032b5ff7c613364`),
#32 Sproutle + Wispkin sheets (merge `5d9097d6d472893a9b3a883654d9724b94258a91`),
#33 Mochii + Gabu sheets (merge `baaa148e4aeee622e72b843cef0cc8fd3219877f`).
This close-out (the §11 resolution lines, this report, and the for-grok
re-sync) lands as a final PR on top of those.

---

## 1. INVENTORY HEADLINE FINDINGS (what was actually true before the fill)

The programme began with a verified inventory
(`~/workspace/ep01-gap-fill/INVENTORY.md`, Work Package A). Its headline
findings, because they change what the old records seemed to say:

- **The `d2f1bf1d7…` file is a composite PROOF, not a clean plate.** The
  file recorded as the Gate "v2-living — CURRENT"
  (`show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4`,
  md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31`) is the CUT01 composite life
  proof — characters composited over the Gate — not a standalone clean
  background plate.
- **No clean Gate plate existed in the repo.** `show/assets/backgrounds/`
  held only `dark-forest/`, `green/`, and `pond/` — no `gate/` folder at
  all. The Gate existed in-repo only inside composites.
- **The Gate v1 still and the Berry Store plates were local-only staging
  debt — now cleared.** The Gate v1 base still (2048, md5
  `2d4207f638976799e877049f0bcb3dd3`; 1280 working copy, md5
  `3d3d76f29d0dd23aa8633db1e471b81e`) lived only on local disk, and the
  Berry Store still / close / living files lived only in the local
  ep01-finish lane — even though the staging JSON's background paths
  pointed at them, so the episode as staged could not be reproduced from
  the repo alone. PR #26 landed all of them in the repo, byte-identical.
- **No GATE-DAWN key exists.** The Lighting System has no "Gate-dawn"
  key; the dawn Gate work was graded to the key of record, GATE-MORNING
  "First Bell", plus the Generation Package's N1 line "dawn, brand-blue
  key". Any record implying a GATE-DAWN key is wrong.

---

## 2. PER-GAP TABLE — §11 item by item

| # | Gap (§11) | What was done | Canon source | Status | Landing path | PR / merge |
|---|---|---|---|---|---|---|
| 1 | Multi-angle sheets GAP for all six pilot creatures | Candidate turnaround (¾/side/back) + expression sheets generated per character, anchor-graded panel by panel; grades + owner notes in each pack's record; pack views GAP → CANDIDATE. Wispkin expressions attempted, FAILED grading, not landed (see §3) | Each pack's canon `front.png` (byte-identical to the canon cutout); Sproutle seeded ONLY from the cleaned cutout, md5 `44068950bda8d0b427af1209565ab2e9` | CANDIDATE (5 of 6 creatures, all views; Wispkin turnaround CANDIDATE, Wispkin expressions remains GAP) | `show/production/tooling/avatar-stack/reference-packs/<character>/candidate-turnaround.png`, `candidate-expressions.png`, `CANDIDATE-SHEETS-RECORD.md`, `pack.json`; `PACK-MANIFEST.md` | #29 `4be18730` (Dorowani, Kittember); #33 `baaa148e` (Mochii, Gabu); #32 `5d9097d6` (Sproutle, Wispkin) |
| 2 | Dorowani + Gabu missing from species data; Wispkin dex text owed | Nothing — fenced, untouched | — | OWNER-OWED | — (no landing; `src/data/core/species.json` unchanged) | — |
| 3 | Mochiko: no reference pack; voice TBD | Pack assembled: `pack.json` + `front.png` (md5 `4862bf271f5ad3ba21eea3b0cd7926b5`). Voice not cast, not invented. ¾/side/back/expressions recorded GAP in the pack (model sheet is a single front pose) | Named-canon v2 model sheet `src/assets/human-characters/named-canon/media-generation-mochiko-v2-asian-no-tan-0-0b13fb4f-de23-4ed9-be79-698fec916e66.webp` (source md5 `a8bb285837b1e24362b2f2717a425df1`); front is a crop of it | PARTIAL — pack FILLED as CANDIDATE / DERIVED; voice OWNER-OWED; angles GAP | `show/production/tooling/avatar-stack/reference-packs/mochiko/` | #27 `8d7e1588` |
| 4 | Hex + Aeon model-sheet-only, no packs | Packs assembled the same way: Hex front md5 `82a12dd95a1367ada4c7e4a667e754c6`, Aeon front md5 `e2aedf38c43788a91dbdcef75c255b21`. Angles recorded GAP in each pack | Named-canon v2 model sheets (Hex source md5 `99c88b09ab26ac683824144a55697fca`; Aeon source md5 `a995e8133edc65bdfc0e9825a376476a`); fronts are crops of them | PARTIAL — packs FILLED as CANDIDATE / DERIVED; angles GAP | `show/production/tooling/avatar-stack/reference-packs/hex/`, `…/aeon/` | #27 `8d7e1588` |
| 5 | No canon painted plates for Pond / Green / Dark Forest; Gate v1 still not a repo file | Gate base stills landed in-repo; Gate dawn still + dawn living graded/landed and registered CURRENT-FOR-EP01 (DERIVED); Pond dawn + day-finish stills and Green day-finish still landed DERIVED, registered CURRENT-FOR-EP01; Dark Forest v1 still confirmed CURRENT in the registry (folder-path correction included) | Gate: owner-accepted v1 base plate (2048 md5 `2d4207f638976799e877049f0bcb3dd3`). Pond/Green: the provisional spec bases, finished per POND-MORNING "Flat Water" / POND-DAY "Ripple Key" / GREEN-DAY "Canopy Dapple". Gate dawn key: GATE-MORNING "First Bell" (no GATE-DAWN key exists) | FILLED FOR EP01 (DERIVED) — remainders: Gate pale-gold lane-edge rim is a composite-stage item, NOT in the whole-frame grade; GAP-pond-canon and GAP-green-canon stay open; Dark Forest STILLNESS BY LAW | `show/assets/backgrounds/gate/` (incl. `grade_plates.py`, `PROVENANCE.md`), `…/pond/`, `…/green/`; registry `show/shared/PLATES-REGISTRY.md` | #26 `f0b1db84` |
| 6 | Berry Store has no plate file at all | Still, close still, and living plate landed in-repo and registered CURRENT-FOR-EP01 (DERIVED), with provenance. (The files existed before only as local-only staging; the package's "no file at all" wording is superseded by this landing) | The ep01-finish lane's plates, verified against the staging description (V3-012–016) and the staging style law | FILLED (DERIVED) | `show/assets/backgrounds/berry-store/` (still md5 `4581c1afe6a72b037fec647b12a9ffc4`, close md5 `f8f7877f70f4a6bb1e06d24c4c15c0bc`, living md5 `482d0d24c43bce5a7634a5d62ce867ef`) | #26 `f0b1db84` |
| 7 | Unbuilt props: tool rack / aligned tools, bucket, moth | Tool rack and bucket built procedurally from the staging/script text and landed; moth spec-filled (build size, in-frame scale, placement, palette, acceptance check) — no image, deliberately | Staging JSON V3-056/057/085 (tools), V3-018 (bucket), V3-091 (moth) + script text; COLOR-SYSTEM palette | Tool rack + bucket FILLED (DERIVED / BUILT); moth SPEC-FILLED | `show/assets/props/EP01-PROP-tool-rack-v1.png` (md5 `9c6e493b20bc002f088a5ce57a771acd`), `EP01-PROP-bucket-v1.png` (md5 `715a431447ddaefe47d8df74a8b05827`), `EP01-PROP-moth-v1-SPEC.md`; `show/assets/props/PROPS-REGISTRY.md`; `ep01-props-v1` in `show/shared/parts-catalog.json` | #28 `44448fc7` |
| 8 | Sound gaps (SFX-COLDSPOT-01, SFX-BELL-01, frost crackle, BED-GREEN-DAY) | Nothing — out of scope for this programme, stated plainly | — | NOT ADDRESSED (unchanged) | — | — |
| 9 | Eye-whites wording conflict in the repo's own records | Records corrected: staging `canon_guards[0]` corrected + a dated CORRECTION guard appended; clip-index `canon_notes.dorowani_eyes` corrected with the old value preserved in the correction note; the for-grok staging copy carries the identical fix (both staging files byte-identical on main). Operational rule unchanged: EP01's Dorowani has eye-whites; keep them | Owner correction 2026-10-28 (the whites belong to the one specific made/generated Dorowani individual, NOT the avatar) | FILLED | `show/episodes/EP01/EP01-V3-staging.json`; `show/shared/clip-index.json`; `show/episodes/EP01/for-grok/EP01-V3-staging.json` | #27 `8d7e1588` |
| 10 | Rule 3 is a DRAFT rule | Nothing — an owner/canon matter, not an asset gap | — | UNCHANGED | — | — |
| 11 | ED slot content unscripted; chibi credits-bit an empty placeholder | Nothing — fenced, untouched | — | OWNER-OWED | — | — |
| 12 | Mochiioteca physical design canon TBD | Nothing — fenced, untouched; nothing in this fill designs it | — | OWNER-OWED | — | — |
| 13 | What stopped moving in the Dark Forest is canon TBD | Nothing — fenced, untouched; not depicted or described anywhere in this fill | — | OWNER-OWED | — | — |

---

## 3. PER-CHARACTER SHEET GRADES

All sheets are CANDIDATE — not canon. Each was graded by looking at the
actual images against the pack's anchors (`do_not_change`). Full grade
text lives in each pack's `CANDIDATE-SHEETS-RECORD.md`; the owner-flagged
notes are carried here in substance.

| Character | Turnaround | Expressions | Owner-flagged notes (in substance) |
|---|---|---|---|
| Dorowani | PASS / CANDIDATE (PR #29) | PASS / CANDIDATE — 8 panels incl. N1 walking and walking-carrying-manual poses (PR #29) | The generator added a small tail (visible in side/back and the two walking panels) that the canon front does not show — flagged for the owner's call. Anchors otherwise hold in every panel: red fin cheeks (not orange), red eyes with no sclera even in "surprised", pale belly, dorsal fin, tan shell, no baked shadow |
| Kittember | PASS / CANDIDATE (PR #29) | PASS / CANDIDATE — 7 panels incl. the N1 asleep pose (PR #29) | (1) The flame connects by overlap-contact rather than canon's fused orange tail-tip segment. (2) In the standing expression panels the tail reads orange for most of its visible length, where canon turns orange only near the tip. (3) The neutral and determined panels crop the flame slightly at the sheet edge. (4) "Surprised" eyes are wide pale-amber circles (stylised surprise read). Flame is attached at the tail tip in every panel (zoom-checked) |
| Sproutle | PASS / CANDIDATE (PR #32) | PASS / CANDIDATE — 6 panels (PR #32) | Seeded ONLY from the cleaned cutout (md5 `44068950bda8d0b427af1209565ab2e9`); the baked-shadow v1 file was never used or opened. Notes: (1) back-view feet show no toe claws; (2) proportions run slightly more chibi (head larger) than the canon front; (3) the back shell is a plain round dome with no segmentation — the canon front shows only the shell rim, so there is no canon segmentation for it to contradict; (4) the sleepy panel's mouth is a small downturn, so it reads tired/slightly grumpy as well as sleepy. No baked shadow — checked extra strictly for this character |
| Wispkin | PASS / CANDIDATE (PR #32) | **FAILED — NOT LANDED; view stays GAP** (PR #32) | Turnaround notes: (1) the left panel is a near-front three-quarter (a slight turn, not a deep ¾); (2) in the back panel the hands are hidden behind the body — only the wrapping arms and mask edges show. No horns were generated in either sheet (absence is not a failure — horns are an optional per-individual variant). **Expressions failure:** the generator duplicated the mask in all six panels — one mask worn like a face, with the expression drawn on it (including smiling/frowning mouths the canon mask does not have), and a SECOND smaller mask held in both hands below it. That breaks the anchor "mask is HELD in both hands in front of the body, not worn" in every panel, so the sheet is not usable as a reference and was not landed. Rejected generation kept only as failure evidence in the local work folder: md5 `41988a55a033d428055f4764c4031b04`, sha256 `5a51ecb4ea5c1f5de8baf37aa2a4e90b83f9311d438d03cf2604f7d22fa9d073`, 1,209,522 bytes. **Retry recipe (recorded in the pack):** one fresh call, explicitly "exactly one mask, held; expression via socket shape/tilt/posture" |
| Mochii | PASS / CANDIDATE (PR #33) | PASS / CANDIDATE — 6 panels (PR #33) | (1) The generator added a large sheet title ("Mochii / Character Turnaround Model Sheet") and a footer design-reference line that the other sheets do not carry. (2) The side panel reads as a turned front with the face pushed to the edge rather than a true flattened profile silhouette (small distinction for a near-spherical blob — flagged anyway). (3) The small floating blue droplets around the canon front were omitted from the turnaround (present around every expressions panel, as in canon). (4) The surprised and sleepy expression panels add a small pink mouth interior — the canon front's mouth is a simple black line |
| Gabu | PASS / CANDIDATE (PR #33) | PASS / CANDIDATE — 6 panels (PR #33) | (1) The crest spikes read larger and more numerous than the canon front's crest; the side panel's arm spots are enlarged to two big circles. (2) The ¾ panel's head is turned near-profile, so only one eye shows. (3) The "surprised" panel loses the orange iris — wide white eyes with tiny dark pupils (stylised surprise read). (4) The generator added short eyebrow lines in the worried, determined and sleepy panels — the canon front has no eyebrow lines. (5) The centre head spike reads as a twisted, fin-like spike in front view |

Human packs (PR #27) are not generated sheets: each front is a DERIVED
crop of the character's named-canon v2 model sheet, visually verified
(full character inside the crop, nothing cut, no shadow introduced).
¾ / side / back / expressions are GAP in all three human packs.

---

## 4. PER-PROP OUTCOMES (PR #28)

| Prop | Staged in | Outcome | File |
|---|---|---|---|
| Tool rack / aligned tools | V3-056, V3-057, V3-085 | BUILT / DERIVED — built procedurally (PIL) from the staging/script text; registered with scale, palette, and the staging it rests on | `show/assets/props/EP01-PROP-tool-rack-v1.png`, md5 `9c6e493b20bc002f088a5ce57a771acd` |
| Bucket (separate asset for Gabu's orbit gag) | V3-018 | BUILT / DERIVED — built to composite swinging from the handle pivot, water surface level; scale ~110–140 px tall against Gabu at plate scale | `show/assets/props/EP01-PROP-bucket-v1.png`, md5 `715a431447ddaefe47d8df74a8b05827` |
| Moth | V3-091 | SPEC-FILLED — no image shipped, deliberately: at its staged size (~30–45 px wingspan on the leaf on Gabu's head) a blind-built asset cannot be verified readable against the real composite. The spec fixes build size (256×256 at 4×, two wing poses), in-frame scale, placement on the existing leaf layer, orientation, night palette, and an acceptance check against the actual frame. The prop is an ordinary garden moth — it is NOT Mothrix and must not be built from Mothrix art | `show/assets/props/EP01-PROP-moth-v1-SPEC.md` |

All three are registered in `show/assets/props/PROPS-REGISTRY.md` and in
the `ep01-props-v1` collection of `show/shared/parts-catalog.json`.

---

## 5. THE HONEST PARTIALS

- **Wispkin expressions remain GAP.** One attempt was made; it failed its
  anchor check and was rejected, not landed. The retry recipe is recorded
  in the Wispkin pack; the retry itself has not been run.
- **Human angles remain GAP.** Mochiko, Hex, and Aeon have front-only
  packs because their model sheets carry a single front pose each.
  Producing their other angles is an owner-visible sheet step, not
  something to generate silently and label.
- **The Gate rim is not in the grade.** The pale-gold lane-edge rim in
  GATE-MORNING "First Bell" is an edge-selective light layer; the
  whole-frame dawn grade supplies key direction, temperature, ratio, and
  grade family only. The rim remains a composite-stage item (recorded in
  `show/assets/backgrounds/gate/PROVENANCE.md`).
- **Pond and Green are finished for EP01 use, not canon.** Their
  CURRENT-FOR-EP01 stills are DERIVED grades of provisional spec bases.
  GAP-pond-canon and GAP-green-canon stay open until canon painted plates
  land.
- **The moth is a spec, not a picture** (see §4).
- **Sound gaps were not addressed at all** (§11 item 8) — out of scope,
  unchanged.

## 6. OWNER-OWED — THE FENCED LIST (untouched by this programme)

1. Species-data / dex texts ×3 — Dorowani's species entry, Gabu's species
   entry, and Wispkin's dex text (§11 item 2).
2. What stopped moving in the Dark Forest (§11 item 13) — not depicted or
   described anywhere in this fill.
3. The ED slot's content, including the chibi credits-bit (§11 item 11).
4. The Mochiioteca's physical design (§11 item 12).
5. Mochiko's voice casting (§11 item 3).
6. The status of Rule 3 (§11 item 10) — remains a DRAFT rule.

## 7. WHAT THIS DOES **NOT** CLAIM

- **No candidate is canon.** Every generated sheet in this programme is
  CANDIDATE. Sheets await the owner's lock; until he locks them, no
  generated angle may be labelled canon or used as a canon reference.
- **Derived plates are EP01-usable, not canon originals.** The Gate dawn,
  Pond, Green, and Berry Store pieces are registered CURRENT-FOR-EP01
  (DERIVED). That registration is per use, for this episode; it does not
  make them canon painted art.
- **Pond / Green canon gaps remain.** GAP-pond-canon and GAP-green-canon
  are still open (§5 above).
- **The human pack fronts are crops, not new art and not cutouts** — the
  model sheets' plain light-grey background is retained, and the source
  sheets themselves remain "model sheet only, pending owner OK" in the
  canon doc.
- **Nothing fenced was filled in by the back door.** No dex text was
  written, no ED content was scripted, the Mochiioteca was not designed,
  Mochiko was not cast, Rule 3 was not settled, and the Dark Forest item
  was not depicted or described.
- **No audio was created.** The sound gaps in §11 item 8 stand exactly as
  they stood before this programme.

---

*Close-out compiled 2026-10-28 from the landed PRs #26–#33 (each
squash-merged and verified back from main by its worker) and the Work
Package A inventory at `~/workspace/ep01-gap-fill/INVENTORY.md`. The §11
resolution lines in `GENERATION-PACKAGE.md` carry the same statuses in
short form; this report is the long record.*
