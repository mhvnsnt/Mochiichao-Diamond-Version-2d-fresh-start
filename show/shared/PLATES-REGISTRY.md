# PLATES REGISTRY — EP01 environment plates (parts-catalog style)

**Registry date:** 2026-10-28 (built local-first; GitHub API rate-limited until
~00:45 UTC — nothing pushed, see `LANDING-STEPS.md`).
**Amendment 2026-10-28 (EP01 gap-fill Work Package B):** Gate seat registered
in-repo (§1 — base still landed, dawn still + dawn living grade landed
DERIVED); Pond dawn + day-finish stills landed DERIVED (§2); Green day-finish
still landed DERIVED (§4); Berry Store seat created (§6, DERIVED); Dark Forest
seat confirmed unchanged (§5). Everything landed by this amendment is labelled
DERIVED with provenance in each folder's `PROVENANCE.md` — a derived grade is
never a canon original.
**Laws applied:** Living World (cycles layered, never baked; one global
WIND-STATE drives picture + audio; prime-length loops, offset phases) ·
Forest Exception C6 (Dark Forest cycles OFF — a moving Forest cut FAILS) ·
Current-Version Law (CURRENT marked per piece AND per use; superseded named) ·
No-baked-shadows (no character art in any plate; shadows are composite-stage) ·
Licence honesty (all audio below is synthesised in-house — licence-clean by
construction; no third-party material in any plate).

> **⚠ PROVENANCE — READ FIRST.** The only canon painted background art on this
> disk is the **Garden Gate** plate. No canon painted Pond, Green, or Forest
> plate exists locally: the EP01 manifest/storyboard mark Pond "parts-catalog"
> (selection pending — Scene-02 gate file: *"Pond BG selection/build pending —
> picture not faked"*) and Forest "MAKE, not yet built". The Pond/Green/Forest
> plates below are therefore **PROVISIONAL SPEC PLATES (v0/v1-spec)**: built
> procedurally by `build/build_plates.py` strictly from the canon systems —
> Colour System location scripts, Lighting System keys, Living World cycle
> catalogue, and the Gate plate's palette family (brand blues
> `#70b0d0/#90b0d0/#b0d0f0`, belly-pale `#d0f0f0`, ink `#101010`; accent red
> `#a03436` appears in **no** plate — quarantine held). They carry the correct
> motion systems, keys, and wind behaviour so scenes can be timed, composited
> and gated NOW. **They are not canon art and must not be presented as such.**
> Each is superseded the moment a canon painted plate lands (Step 0 of
> LANDING-STEPS checks the in-repo candidates
> `sprite-art/battle-backgrounds-v3/battle-bg-lake-v3d.png` /
> `battle-bg-garden-v3d.png` and `docs/title-lane-archive/staging/backgrounds/`).

Format of all video plates: 1280×720, 24 fps, 8.0 s loop, H.264 + AAC
(synthesised ambient bed, placeholder for the canonical BED-* — see Audio).

---

## 1. GARDEN GATE — reference of record (not rebuilt; already CURRENT)

| Field | Value |
|---|---|
| v1 still (base plate) | Owner-accepted generated plate, 2048×1152 WebP — `~/workspace/mochiichao-show/scene-01/media-generation-garden-gate-bg-plate-0-1cbbf046-0051-45d6-bb70-ff42bec529a7.webp`, md5 `2d4207f638976799e877049f0bcb3dd3`. 1280×720 working copy in this package: `gate-reference/gate-plate-v1-still-1280.png`, md5 `3d3d76f29d0dd23aa8633db1e471b81e`. **LANDED IN REPO 2026-10-28 (Work Package B, staging debt cleared):** `show/assets/backgrounds/gate/EP01-PLATE-gate-v1-still-2048.webp` (byte-identical, md5 `2d4207f638976799e877049f0bcb3dd3`) + `gate/EP01-PLATE-gate-v1-still-1280.png` (byte-identical, md5 `3d3d76f29d0dd23aa8633db1e471b81e`). This is the base still of record for the Gate seat. |
| **dawn still — CURRENT-FOR-EP01 (DERIVED)** | `gate/EP01-PLATE-gate-dawn-v1-derived-still.png` — md5 `b1f3266666b8e8ce979341d413b2a2f1`, 1280×720. **DERIVED grade, not canon original art.** Derived-from: v1 still 1280 working copy (md5 above) via `gate/grade_plates.py` (kept in the folder, reproducible). Key: GATE-MORNING "First Bell" + Generation Package N1 line "dawn, brand-blue key" (no "Gate-dawn" key exists in the Lighting System). FOR: EP01 N1 still use (V3-001/003/005 family). Limitation recorded in `gate/PROVENANCE.md`: the pale-gold lane-edge rim is a composite/light-layer item, not produced by a whole-frame grade. |
| dawn living grade — DERIVED (existing local grade, landed) | `gate/EP01-PLATE-gate-dawn-v1-derived-living.mp4` — md5 `9fe9a295275fa2f863022c23ab2533eb`, 1280×720/24/8 s. Byte-identical copy of the pre-existing ep01-finish lane file `~/workspace/ep01-finish/assets/plates/gate-dawn.mp4` (the file the EP01 staging JSON names for V3-001/004/005/006). Inspected 2026-10-28: clean Gate art, no characters in frame, real dawn grade vs the v1 still. Registered as an existing local derived living grade; its internal build process was not recorded by its lane and is not claimed here. |
| **v2-living — CURRENT** | Repo: `show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4`, md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31` (local copy verified at `~/workspace/mochiichao-show/repo-add/show/episodes/EP01/animatic/`). Local proof-of-record composite: `~/workspace/mochiichao-show/twins-out/COMPOSITE-PROOF-gate-v4-living.mp4`, md5 `b94cbbc68b9e9be527e67f597d3f0b50`. |
| Supersedes | v1 still **as a standalone background** (v1 remains the accepted base plate the living layers sit on). |
| FOR | v2-living: EP01 cuts 01–05 and all Gate scene-ins / BR-GATE-01…03. v1 still: base for future Gate angle variants and re-dress grades only — never shipped alone. |
| Wind behaviour | Full WIND-STATE {CALM, BREEZE, GUST}: AMB-GATE-SWING-01 / GRASS-01 / LEAF-01 / CLOUD-01 / SIGN-01; CL-1 cloud shadow, CL-2 motes. Proof gate file notes gate-swing/grass masks/population not yet in the proof — known gap, unchanged by this package. |
| Audio | BED-GATE-MORNING / BED-GATE-NIGHT (existing gated scene beds). |

## 2. POND — DAY

| Field | Value |
|---|---|
| v0-spec still (base) | `pond/EP01-PLATE-pond-day-v0-spec-still.png` — md5 `40365a232823d32a916f1ba422a7a619`, 28,737 B |
| **v1-living (spec) — CURRENT for provisional use** | `pond/EP01-PLATE-pond-day-v1-living.mp4` — md5 `93106645072356d3954994be54772029`, 614,795 B |
| Supersedes | The storyboard/manifest placeholder "BG pond (parts-catalog)" — as a *timing/composite* plate only. Canon painted Pond plate remains **MAKE (GAP-pond-canon)**. |
| FOR | EP01 cuts 06–09 (Scene 2 Pond tour); BR-POND-01 / BR-POND-02 base state. NOT for: final production background until canon art lands and this is rebuilt from it (Living World C1 layering makes that a base-swap, cycles carry over). |
| Motion included | AMB-POND-RIPPLE-01 (3 motivated emitters, 3.7 s ring sets) · AMB-POND-REED-01 (2.9 s, wind-keyed) · AMB-POND-LILY-01 (5.3 s bob, ≤2° rotation) · AMB-POND-SHIMMER-01 (composite sparkle field) · cloud drift (BG, slowest) · CL-1 cloud shadow · CL-2 pollen motes. Loops prime-length, phases offset (C2). |
| Wind behaviour | BREEZE default: reed sway amplitude, ripple rate, cloud speed and bed rustle all key off WIND-STATE; CALM stills reeds/ripples (cut 08's duck gag pauses ripples — staging call, not a plate change); GUST raises chop/rustle. |
| Key / colour | POND-MORNING "Flat Water" → POND-DAY "Ripple Key"; water cyan/teal, reflection whites; Ocean family, lightest step. |
| **dawn still — CURRENT-FOR-EP01 (DERIVED)** | `pond/EP01-PLATE-pond-dawn-v1-derived-still.png` — md5 `527fbdcc7c89196b371dc3bb101efd69`. **DERIVED grade of the provisional v0-spec still** (md5 `40365a232823d32a916f1ba422a7a619`) via `pond/grade_plates.py`, per POND-MORNING "Flat Water". FOR: EP01 N1 / V3-002 (pond day plate at dawn grade). The v1-living (spec) above stays CURRENT for provisional use for its own cuts — currency is per use. GAP-pond-canon remains open: a derived grade of a provisional base is not canon art. Full provenance: `pond/PROVENANCE.md`. |
| **day finish still — CURRENT-FOR-EP01 (DERIVED)** | `pond/EP01-PLATE-pond-day-v1-derived-still.png` — md5 `c63c692d9af7e2ec980a6300a43d4fbe`. **DERIVED grade of the same provisional base** per POND-DAY "Ripple Key". Documented check (in `pond/PROVENANCE.md`): the provisional's temperature already matches the key's neutral, so temperature was not moved; the finish corrects saturation (full Ocean) and highlight sparkle only. The moving caustic rim stays the living plate's shimmer cycle, never baked into a still. |
| Audio | Muxed: synthesised water-lap + reed rustle (placeholder). Canonical bed: BED-POND-DAY; gated scene bed on disk: `show/episodes/EP01/audio/EP01-SCENE-02-pond-tour.wav` (33 s, md5 `e9e6931aa9b0dba34886ae047908e0d5`). |
| QA — world-alive | Frame-diff t=0.5 s vs t=4.0 s: mean abs diff **5.71**, **22.25 %** of pixels changed (>8) — ALIVE ✓ |
| Known shortfalls | Flat vector finish vs the Gate plate's painterly finish (provisional by design); water-bank silhouette is a simple ellipse read; no POP-WATER surface break (population is a composite-stage layer, P3 — not baked into plates). |

## 3. POND — DUSK (grade variant of §2)

| Field | Value |
|---|---|
| v0-spec still | `pond/EP01-PLATE-pond-dusk-v0-spec-still.png` — md5 `29ec4f9e259e5bc908876d56c86bec1b`, 28,251 B |
| **v1-living (spec) — CURRENT for provisional use** | `pond/EP01-PLATE-pond-dusk-v1-living.mp4` — md5 `037de6228a64c7078c70467930b74bfc`, 356,694 B |
| Derivation | Same base plate as Pond-Day under the dusk **overlay grade** (Lighting L7: shifts are layers, never repaints — one base, two keys). No separate painting exists or is needed. |
| Supersedes | Manifest placeholder "BG pond dusk variant" (cuts 13/17). |
| FOR | EP01 cuts 13–19 (Scene 4 stakeout → reveal); BR-POND-03. The day plate stays CURRENT for cuts 06–09 — currency is per use; neither pond version replaces the other. |
| Motion included | AMB-POND-MIST-01 (layered mist, 11 s drift, soft edges — built so cut 17's "mist parts" is a level split) · ripples continue, slower/dimmer · lily bob continues · reed sway at 0.55 amplitude (air stilling) · silver rim line on the water (rim changes employer: sun → dusk). **Shimmer OFF** (dies at dusk per spec), cloud shadow OFF, motes OFF. |
| Wind behaviour | Stakeout state: BREEZE decaying toward CALM across the scene (bed empties with it); mist drift is the only large motion. GUST is never used at the dusk Pond in EP01. |
| Key / colour | POND-DUSK "Stakeout" — last amber band, warm→cool crossfade, Storm family at low strength; saturation −30 % per EP01 colour script beat 5. |
| Audio | Muxed: synthesised dusk water + thinning insect layer (placeholder). Canonical bed: BED-POND-DUSK; gated scene bed on disk: `show/episodes/EP01/audio/EP01-SCENE-04-pond-dusk.wav` (46.8 s, md5 `ad2e716886785d4ad1be5ff297114dda`). |
| QA — world-alive | Mean abs diff **0.78**, **2.73 %** pixels changed — alive but deliberately quiet (mist + ripples only). This is the spec's intent for the stakeout, not a failure; flag for owner look if a stronger read is wanted. |

## 4. THE GREEN — DAY

| Field | Value |
|---|---|
| v0-spec still (base) | `green/EP01-PLATE-green-day-v0-spec-still.png` — md5 `2439b9676a98d84a9cf0c72d8e699c9c`, 47,413 B |
| **v1-living (spec) — CURRENT for provisional use** | `green/EP01-PLATE-green-day-v1-living.mp4` — md5 `9bd79f8899e2e2677f0f1187157e153e`, 637,057 B |
| Supersedes | The unnamed Green background implied by cuts 10–12 (no BG was ever specified or built). Canon painted Green plate remains **MAKE (GAP-green-canon)**. |
| FOR | EP01 cuts 10–12 (Scene 3: Gabu entrance, frost trail, device check-in); BR-GREEN-01 / BR-GREEN-02 base state; STAGE-WIDE daily-life framing. |
| Motion included | AMB-GREEN-GRASSWAVE-01 (the signature: a bend/brightness wave travelling with the wind, 6.1 s, grass blades keyed to it) · AMB-GREEN-FLOWER-01 (2.3 s bob clusters, phase variants shared with Gate grass) · AMB-GREEN-CLOUDSHADOW-01 (CL-1, 13 s crossing) · AMB-GREEN-LEAF-01 (sparse single-leaf drift) · canopy sway at background (½) depth rate · cloud drift. Frost patches (cut 11) are decal levels added at composite — they locally kill the grass cycle, per spec; not in the plate. |
| Wind behaviour | Full WIND-STATE; the grass wave IS the wind made visible (Ghibli evidence rule). Gabu's entrance (cut 10) parts the wave — hero-beat spend staged at composite, plate supplies the running wave. |
| Key / colour | GREEN-DAY "Canopy Dapple"; leaf greens at the fullest saturation in the show (Colour System: saturation is the Green's mood dial). |
| **day finish still — CURRENT-FOR-EP01 (DERIVED)** | `green/EP01-PLATE-green-day-v1-derived-still.png` — md5 `1c9d73ae1157ce46006c2a53ddd3f1c3`. **DERIVED grade of the provisional v0-spec still** (md5 `2439b9676a98d84a9cf0c72d8e699c9c`) via `green/grade_plates.py`, per GREEN-DAY "Canopy Dapple". Documented check (in `green/PROVENANCE.md`): the provisional is uniform flat light with no dapple at all, so it differed from the key and a finish was produced — a deterministic dapple light layer (Lighting L7: shifts are layers, never repaints), warm-neutral highlights, yellow-green highlight lift, saturation ×1.05. The v1-living (spec) above stays CURRENT for provisional use for its own cuts. GAP-green-canon remains open. |
| Audio | Muxed: synthesised wind-in-grass keyed to the 6.1 s wave (placeholder). Canonical bed: BED-GREEN-DAY (no gated Green scene bed exists yet — **GAP-green-bed**; Scene beds on disk cover Gate/Pond/Forest only). |
| QA — world-alive | Mean abs diff **6.20**, **34.19 %** pixels changed — ALIVE ✓ (highest of the set; correct for the garden's living-room). |
| Known shortfalls | Same provisional flat finish as Pond; treeline is a simple canopy band; path hint is schematic. |

## 5. DARK FOREST — DAY — **STILLNESS BY LAW**

| Field | Value |
|---|---|
| **v1 still — CURRENT (the only version; a living version must never exist)** | Still: `forest/EP01-PLATE-dark-forest-day-v1-still.png` — md5 `1c27182775f2b269d8c5a782577a5cb7`, 15,673 B. Timed still for edit use: `forest/EP01-PLATE-dark-forest-day-v1-STILL.mp4` — md5 `62d5b4f2b8c0d399d870d31a78b8fa1f`, 150,582 B (8.0 s of identical frames). |
| Supersedes | Manifest flags "MAKE: Dark Forest BG (stinger) not yet built" — as a *timing/composite* plate only. Canon painted Forest plate remains **MAKE (GAP-forest-canon)**; when it lands it replaces this still **as a still** — the stillness registration does not change. |
| FOR | EP01 stinger cuts 25–28 only. `STILL-FOREST` camera: locked frame, no drift, no pan. BR-FOREST-01 **does not exist** (by law — no B-roll eases anyone into the Forest). |
| Motion included | **NONE. Cycles OFF (Living World C6 / AMB-FOREST-NONE).** No population (P5: the zero is a plot point), no composite life (CL-1…CL-4 all OFF — no sky reaches in), no pattern-fill (Colour System §f: the Forest has none), no wind. The single sanctioned motion in the stinger — cut 28's one leaf falling *straight down*, no wind curve — is a **scripted story element staged at composite, NOT part of this plate**. |
| Wind behaviour | **NONE — by law.** The Forest does not read the global WIND-STATE. A gust anywhere else in the episode must not move anything here; the absence of wind where wind should reach is the scare. |
| Key / colour | FOREST-DAY "Refusal" — no key admitted, fill flat and directionless, rim **withheld**; drained blue-green at high value, ≈0 saturation (daylight that doesn't arrive). `#a03436` appears in the stinger only inside the Rule-12 burn-in (TK-5), which is a separate picture element and is **not** in this plate. |
| Audio | Picture-silent by design. The plate MP4 carries only an engineered-absence hush (synthesised room tone at −~50 LUFS class level, no birdsong, no wind, no underscore). Canonical bed: BED-FOREST-DAY; gated stinger bed on disk: `show/episodes/EP01/audio/EP01-STINGER-forest.wav` (46 s, md5 `958d30fcb41a96d15b74f64621fea2`, measured −51.85 LUFS — loudness-exempt by design gate). |
| QA — stillness gate | Source frames pixel-identical: md5 of frames 0 / 100 / 191 all `1c27182775f2b269d8c5a782577a5cb7` (= the still PNG) ✓. Decoded MP4 frame-diff t=0.5 s vs 4.0 s: mean **0.0087** / 0.02 % pixels — H.264 codec noise only, no picture motion. **STILL ✓ — a moving Forest cut would FAIL.** |
| Known shortfalls | Provisional flat finish; canopy reads grey-drained (spec: drained blue-green — saturation was pulled to 0.32 in build; owner may ask for slightly more blue-green at canon-paint stage). |
| Registry confirmation (2026-10-28, Work Package B) | Confirmed as-is: **v1 still — CURRENT (the only version; a living version must never exist)** under **STILLNESS BY LAW**. No new art was made, no living version exists or was created, and nothing beyond the existing environment art is depicted. Path note: the repo folder of record is `show/assets/backgrounds/dark-forest/` (the `forest/…` shorthand in the rows above refers to that folder). |

---

## 6. BERRY STORE — INTERIOR (seat created 2026-10-28, Work Package B)

| Field | Value |
|---|---|
| **v1 still — CURRENT-FOR-EP01 (DERIVED)** | `berry-store/EP01-PLATE-berry-store-v1-still.png` — md5 `4581c1afe6a72b037fec647b12a9ffc4`, 1280×720 |
| **v1 close still — CURRENT-FOR-EP01 (DERIVED)** | `berry-store/EP01-PLATE-berry-store-close-v1-still.png` — md5 `f8f7877f70f4a6bb1e06d24c4c15c0bc`, 1280×720 (the `berry-close` crop of the same art) |
| **v1 living — CURRENT-FOR-EP01 (DERIVED)** | `berry-store/EP01-PLATE-berry-store-v1-living.mp4` — md5 `482d0d24c43bce5a7634a5d62ce867ef`, 1280×720/24/8 s |
| Provenance | **DERIVED / provisional spec plates — not canon painted art.** Built by the ep01-finish lane; previously LOCAL-ONLY at `~/workspace/ep01-finish/assets/plates/` (staging debt — landed here 2026-10-28, byte-identical copies). Verified 2026-10-28 against the staging description (EP01-V3-staging.json V3-012–016; Generation Package §9 Plate 6) and the staging flat-cel style law: interior, berry crates on timber shelves, central ledger counter, window light from frame-right, close file a true crop of the same art centred on the ledger, no characters baked in. Full record: `berry-store/PROVENANCE.md`. No Berry Store lighting/colour key exists in LIGHTING-SYSTEM / COLOR-SYSTEM — the staging description is the record checked against. |
| FOR | EP01 N2 cluster, V3-012–016 (`berry` ×3, `berry-close` ×2). |
| Supersedes | The staging-record-only state ("no plate file exists in the repo" — Generation Package §9/§11 wording, correct about the repo until this landing). Canon painted Berry Store plate remains **MAKE** if one is ever commissioned; these derived plates are superseded the moment it lands. |

---

## GAP REGISTER (honest, not filled)

| Gap | What is missing | What exists instead | Closes when |
|---|---|---|---|
| GAP-pond-canon | Canon painted Pond plate | v0/v1-spec provisional (§2–3) + in-repo candidate `battle-bg-lake-v3d.png` (Step 0 checked at landing (2026-10-27): candidate is a flat battle-screen backdrop with a central battle-ring ellipse (1600x900) - battle-scale, NOT usable as a cinematic EP01 plate; finding recorded, candidate not used) | Canon plate pulled/painted + cycles re-based on it |
| GAP-green-canon | Canon painted Green plate | v0/v1-spec provisional (§4) + candidate `battle-bg-garden-v3d.png` (Step 0 checked at landing (2026-10-27): candidate is a flat battle-screen backdrop with a central battle-ring ellipse (1600x900) - battle-scale, NOT usable as a cinematic EP01 plate; finding recorded, candidate not used) | Same as above |
| GAP-forest-canon | Canon painted Forest plate | v1 still, provisional (§5) | Canon still painted — stillness registration carries over unchanged |
| GAP-green-bed | Gated BED-GREEN-DAY scene bed | Synthesised placeholder muxed in the plate MP4 | Green scene audio bed built + gated like Scenes 1/2/4/5 |
| GAP-gate-layers | Gate plate as separable layers (swing/grass masks) | v2-living proof (cloud-shadow/leaf/motes only, per its gate file) | Gate plate layered rebuild — pre-existing, not created by this package |
| GAP-population | POP-* crossings/perch/water classes in any plate | None — correctly absent: population is a composite-stage layer (P3), never baked into a plate | First population composite pass per scene |

## Build / reproducibility
`build/build_plates.py` (Python 3.12 + Pillow + NumPy + SciPy, FFmpeg 8.1.2)
rebuilds every file above deterministically (seeded) under
`~/workspace/still-to-build/living-plates/` — no `/tmp` used at any stage.
QA filmstrips: `qa/*-filmstrip.png`. Landing: `LANDING-STEPS.md` +
`parts-catalog-entry.json`.

---

## STEP-0 FINDING (recorded at landing, 2026-10-27)

The in-repo candidates named in Step 0 were fetched and inspected before landing: `sprite-art/battle-backgrounds-v3/battle-bg-lake-v3d.png` (1600x900, md5 f80a1077d12623116e48e4cb974b3e04) and `battle-bg-garden-v3d.png` (1600x900, md5 16759778cfa84c4b46c5e3ea3bec830a) are flat battle-screen backdrops with a central battle-ring ellipse - battle-scale art, not cinematic EP01 Pond/Green plates. The title-lane backgrounds directory holds title backgrounds, not scene plates. Verdict: candidates NOT usable; the provisional spec plates above land labelled provisional (CURRENT for provisional/timing use only), and GAP-pond-canon / GAP-green-canon / GAP-forest-canon stay open until canon painted plates land.
