# EP01 — "THE GARDEN HAS A GHOST" — COMPLETE GENERATION PACKAGE

**What this is.** Everything needed to generate every scene of
Mochiichao Episode 1, assembled from the show's repo of record
(`mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start`, branch `main`,
assembled 2026-10-28). Hand this package to a generation tool (or a
generation team) and the whole episode can be produced from it: the
full shooting script, the beat sheet, the cue sheet, the colour
script, the storyboard plan, a per-scene/per-cut breakdown for all
107 story cuts plus the OP/ED/preview slots, the full character
roster with canon references and ruled traits, the plate list, and
an honest gaps section naming everything the repo does **not** have.

**Companion files (byte-exact copies from the repo — the script of
record lives here in full, never summarised):**

| File in this package | Repo source |
|---|---|
| `EP01-SHOOTING-SCRIPT-v3.md` | `show/episodes/EP01/EP01-SHOOTING-SCRIPT-v3.md` (64,316 B) |
| `BEAT-SHEET.md` | `show/episodes/EP01/BEAT-SHEET.md` |
| `CUE-SHEET.md` | `show/episodes/EP01/CUE-SHEET.md` |
| `EP01-COLOUR-SCRIPT.md` | `show/episodes/EP01/EP01-COLOUR-SCRIPT.md` |
| `STORYBOARD-PLAN.md` | `show/episodes/EP01/STORYBOARD-PLAN.md` |
| `EP01-V3-episode.json` | `show/episodes/EP01/EP01-V3-episode.json` (scene/cut index) |
| `EP01-V3-staging.json` | `show/episodes/EP01/EP01-V3-staging.json` (per-cut staging: durations, backgrounds, layers, notes) |
| `EP01-V3-BEDS.md` | `show/episodes/EP01/EP01-V3-BEDS.md` (the episode's music beds, per scene) |
| `EP01-V3-STEMS-AND-MASTER-MANIFEST.md` | `show/episodes/EP01/EP01-V3-STEMS-AND-MASTER-MANIFEST.md` (audio stems + master record) |
| `EP01-ED-BEAT-MAP.md` | `show/episodes/EP01/timing/EP01-ED-BEAT-MAP.md` (ending-credits music beat map) |
| `EP01-ED-GAG-ABOVE-FLOOR-CHART.md` | `show/episodes/EP01/timing/EP01-ED-GAG-ABOVE-FLOOR-CHART.md` (the ending-gag timing chart — "the chibi walk") |
| `V3-CHANGE-NOTE.md` | `show/episodes/EP01/V3-CHANGE-NOTE.md` (what v3 changed and why) |
| `style/` (subfolder, 75 files) | The show's full style & production language — every style-bearing document swept from `show/` (plus the human-character style docs from `docs/`), byte-exact, at the same relative paths. Indexed in the READ FIRST section below. |

The shooting script is v3 — the current version. v2 is superseded
as a standalone document; its 28 locked cuts live inside v3
verbatim, marked LOCKED-SPINE. Do not work from v2.

---

## 1. THE PRODUCTION METHOD (owner-locked)

Generate the episode **per character, never all-in-one**:

1. **Generate each character's performance separately** — one
   generation per character per cut, using the same scene prompt,
   that character's canon reference (see the roster, §8), and its
   negative-prompt lines.
2. **Cut the background out** of each character plate.
3. **Overlay the cutouts onto the real scene plate** (the living
   background for that cut — see the plates list, §9). Shadows are
   added **here, at composite** — never baked into character art.
4. **Post-production**: timing, shadows, colour grade, effects,
   polish — in that order (shadows before the colour grade).

One shared scene timing map per scene: the cut table in §7 gives
every cut's story-clock window and target length; all characters
in a cut are generated against the same window.

**Format of record:** 1280×720, 24 fps. Story picture is
FULL-SIZE characters only — no chibi anywhere in the story
(chibi is confined to the ED credits-bit slot and the preview
card, per the slot verdict recorded in the staging file).

**Style law (from EP01-V3-staging.json):** hard-edged cel shading,
canon ink `#101010` outlines, brand palette. Smoke/mist/aura are
cel-quantised to flat fill + rim bands. No soft/plush/pastel
gradient finish.

## 2. THE SOUND RULES (never break these)

- **Creatures speak in cries and sounds only.** No words, no
  name-saying. Each species has a designed cry (roster, §8; audio
  files in the cue sheet, §5).
- **Humans speak words.** In EP01 the only human voice is
  Mochiko's, and she speaks **only inside the LOCKED-SPINE blocks**
  (S1, S2, S3, S4, S5) — every line is in the script verbatim. All
  new-material Mochiko beats are wordless by design.
- **Subtitles are silent-film intertitles — exactly FIVE in this
  episode**, all listed in §3. No other cut carries a subtitle.
- **"Forever and always"** is reserved language in this show,
  spent only at threshold moments of trust and bond. It does not
  occur in EP01 and must not be added.

## 3. THE FIVE INTERTITLES (complete ledger — there are no others)

| # | Cut | Speaker | Text |
|---|---|---|---|
| 1 (locked) | V3-073 | WISPKIN | *"...I keep the garden at night."* |
| 2 (locked) | V3-077 | WISPKIN | *"...not alone anymore."* |
| 3 (locked) | V3-106 | (Rule 12) | "Everything in the garden belongs to somebody... And everybody belongs to the Garden." |
| 4 (new) | V3-089 | WISPKIN | *"...This is my round. Every night."* |
| 5 (new) | V3-100 | WISPKIN | *"...I practise. So the stacks stay up."* |

Rule 12's wording is the owner's exact wording and is never
paraphrased. It is also **spoken aloud by Mochiko** at V3-076
(cut 21) — spoken there, not subtitled.

## 4. RUNTIME MAP (24:00 slot — from the script, §0)

| Block | Cuts | Seconds |
|---|---|---|
| OP (before story 0:00; broadcast −1:00) | — | 60 |
| N1 — Dawn Before the Keeper | V3-001–006 | 78 |
| S1 — LOCKED Scene 1 (v2 cuts 01–05) | V3-007–011 | 37 |
| N2 — The Rounds, Part 1 | V3-012–021 | 128 |
| S2 — LOCKED Scene 2 (v2 cuts 06–09) | V3-022–025 | 33 |
| N3 — The Rounds, Part 2 | V3-026–033 | 102 |
| S3 — LOCKED Scene 3 (v2 cuts 10–12) | V3-034–036 | 27 |
| N4 — False Clue One: The Frost Is a Map | V3-037–045 | 108 |
| N5 — False Clue Two: The Net Plan | V3-046–053 | 96 |
| N6 — The Garden at Work | V3-054–060 | 84 |
| EYECATCH — Mochiioteca check-in | V3-061 | 8 |
| N7 — The Stakeout Builds | V3-062–067 | 73 |
| S4 — LOCKED Scene 4 (v2 cuts 13–19) | V3-068–074 | 74 |
| S5 — LOCKED Scene 5 (v2 cuts 20–24) | V3-075–079 | 48 |
| N8 — The First Night Shift, Together | V3-080–089 | 128 |
| N9 — Night in the Garden | V3-090–097 | 104 |
| N10 — Morning-After Button | V3-098–103 | 86 |
| ST — LOCKED Stinger (v2 cuts 25–28) | V3-104–107 | 46 |
| **STORY TOTAL** | **107 cuts** | **1,260** |
| ED | — | 75 |
| Next-episode preview / broadcaster buffer | — | 45 |
| **SLOT TOTAL** | | **1,440 = 24:00** |

Locked spine material: 265s. New material: 995s. The per-cut
durations in the staging file sum to the same 1,440s.

**Standing scene rules that apply to every generation:**

- **Living World:** finished scenes live — ambient cycles, wind
  state, population. Wind state is CALM throughout EP01.
- **Forest exception: cycles OFF.** No cut may add motion to any
  Dark Forest image (the stinger's stillness is law; a moving
  Forest cut fails).
- **One dominant colour per sequence:** dawn brand-blue → day
  clear → dusk amber-thin → night indigo. The single scripted
  exception is the FROST CLOSE-UP COLOUR SHIFT (V3-039) — shift
  on the push-in, restore on the pull-back; the device belongs to
  the frost and to nothing else in this episode.
- **No baked shadows** in any character art or output. Shadows
  are composite-stage work only.
- **The frost is Wispkin's trace** (canon): where the chill of
  his smoke tail settles as he walks his nightly round. It
  carries a dark spirit aura — black-purple smoke/flame living
  inside the frost. Shown, never explained in dialogue.
- **Cameo protection:** HEX is never framed closer than the far
  fence line (V3-002). The AEON ping occurs exactly once
  (V3-043) and never repeats.

---

## STYLE & PRODUCTION LANGUAGE — READ FIRST

This package carries the show's **whole production and design
language**, not just the episode files. Everything in the
`style/` subfolder is a **byte-exact copy** of the repo document
of the same relative path — nothing rewritten, nothing
summarised. If any rule below and any other document disagree,
the document of record wins and the disagreement is a defect
to report, not to improvise around.

### The show bible and design language

| Style document (in `style/`) | What it governs |
|---|---|
| `show/bible/SHOW-BIBLE.md` | The show bible — the world, the cast, and the locked laws (voice, subtitles, likeness, construction kit). |
| `show/bible/COLOR-SYSTEM.md` | The colour system — species colour slots, palettes, grades, and the Lustre colour law. |
| `show/bible/LIGHTING-SYSTEM.md` | THE LIGHTING SYSTEM — the owner's seven lighting laws carried into the garden, per-location lighting keys, the colour-shift protocol, and the EP01 lighting plot. This is the lighting convention for the whole show. |
| `show/bible/DESIGN-PRINCIPLES.md` | Design principles — how Mochiichao things are designed and judged. |
| `show/bible/DESIGN-THEORY.md` | Design theory — the reasoning under the design language. |
| `show/bible/EP-COLOUR-SCRIPT-FORMAT.md` | The format every episode colour script (including EP01's) follows. |
| `show/bible/REPAINT-PROTOCOL.md` | How existing art is repainted/corrected without breaking canon. |
| `show/bible/WRITING-STANDARD.md` | The house writing standard the script was written under. |
| `show/bible/IDENTITY-KIT.md` | Official logo, palette sampled from the real art, fonts, title-card layout. |
| `show/bible/identity-kit.json` | The identity kit as data (palette values, fonts). |
| `show/bible/TOY-READ-TEST.md` | The toy-read check — a character must read as itself at toy/silhouette scale. |
| `show/bible/README.md` | The bible folder's own index. |
| `show/production/species-data-system/DESIGN-BRIEF-canon-world.md` | THE DESIGN BRIEF — canon world design language and the naming laws (display names change, internal ids never do; move rename-on-use; stats never invented). |
| `docs/human-characters/CANON-HUMAN-CHARACTERS.md` | Canon human characters — the locked looks for Mochiko, Hex, Aeon (source of the roster's human entries). |
| `docs/human-characters/STYLE-GUIDE.md` | The human-character art style guide. |

### Canon consistency and variants

| Style document (in `style/`) | What it governs |
|---|---|
| `show/production/CANON-CONSISTENCY.md` | The variant doctrine — absorb a mostly-close deviation as a ruled per-individual VARIANT, locked for that individual; inconsistency after a ruling is the defect. Carries the no-baked-shadows rule. |
| `show/production/species-data/80-INDIVIDUAL-VARIATION.md` | How individuals of a species vary — the variation system under the doctrine. |
| `show/production/species-data/318-RULED-DEVIATION-REGISTER.md` | The ruled-deviation register — how rulings are recorded. |
| `show/production/species-data/322-GENERATED-VARIATION.md` | How generated variation is handled and judged. |
| `show/production/species-data/324-DEVIATION-INHERITANCE.md` | Ruled deviations never inherit to other individuals. |
| `show/production/species-data/RULED-DEVIATION-REGISTRY.json` | The machine-readable registry of every ruled deviation (Dorowani eye-whites, Wispkin horns, Verdilance maskless, Kittember Region 4, Hex/Aeon variants...). |
| `show/production/species-data/HABITAT-VARIANTS.md` | Habitat-driven variant looks. |
| `show/production/200-LUSTRE-PRESENTATION.md` | How Lustre (shiny) forms are presented — a look rule (Sproutle's blue front is his Lustre variant). |

### Method, timing and the delivery gate

| Style document (in `style/`) | What it governs |
|---|---|
| `show/production/WORKING-RULES.md` | The working rules every deliverable is gated by — verify-then-state, measure before delivery, wrong character = FAIL. |
| `show/production/animation-method/METHOD-REGISTRY.md` | The method registry — the CURRENT usable animation method (Industry Method v1.3 + generated-turnaround route), superseded methods named, and the ED-credits standard. |
| `show/production/animation-method/TIMING-STANDARD.md` | The timing standard — 24 fps master, work largely on 3s (8 drawings/sec), accents on 2s/1s, framerate modulation, holds, beat-grid sync. The lowest acceptable bar, not the target. |
| `show/production/animation-method/CORRECTED-METHOD.md` | The corrected animation method in full (construction + timing + above-floor layers). |
| `show/production/TIMING-SYSTEM.md` | The production timing system the timing standard sits on. |
| `show/production/animation-method/YU-YU-HAKUSHO-ENDING-STUDY.md` | The ending-credits study — what production-grade ED work actually is (the ED slot's reference standard). |
| `show/production/animation-method/ABOVE-THE-FLOOR-RESEARCH.md` | The above-the-floor research behind the ending-gag standard. |
| `show/production/animation-method/WALK-DIAGNOSIS-LOG.md` | How the backwards walk was diagnosed — the drawn-space protocol that binds any character. |
| `show/production/animation-method/WHAT-WE-DO-WRONG.md` | The gap log, part 1 — known failure classes and their gates. |
| `show/production/animation-method/WHAT-WE-DO-WRONG-ADDENDUM.md` | The gap log, addendum 1. |
| `show/production/animation-method/WHAT-WE-DO-WRONG-ADDENDUM-2.md` | The gap log, addendum 2 — gaps 12–21 with their gates (line speed, gait grammars, face/blink, ED music sync...). |
| `show/production/animation-method/GENERATED-TURNAROUND-PIPELINE.md` | The generated-turnaround route — how multi-angle sheets get made for generated animation (the fix for the front-only GAP in §11). |
| `show/production/animation-method/PULL-IN-LIST.md` | The animation-method pull-in list — what was taken from industry practice and what was not. |
| `show/production/UNIFIED-PIPELINE.md` | The unified production pipeline — how an episode moves from script to finished cut. |
| `show/production/BOARD-PIPELINE.md` | The storyboarding pipeline (e-konte discipline). |
| `show/production/EPISODE-PLANNING-METHOD.md` | How an episode is planned: memo → beat sheet → shooting script → boards → animatic lock. |
| `show/production/75-DELIVERY-SPEC.md` | The delivery spec — what a finished episode delivery must contain and pass. |

### Look of a shot: plates, camera, posing, faces

| Style document (in `style/`) | What it governs |
|---|---|
| `show/shared/PLATES-REGISTRY.md` | The plates registry — every background plate, its current version, living vs still, and the plate style/shadow laws (source of §9). |
| `show/production/LIVING-WORLD.md` | The living-world doctrine — backgrounds are alive (cycles, layers, motion), never baked stills, except where the law says STILL (the Dark Forest). |
| `show/production/ENVIRONMENT-AND-CAMERA.md` | Environment and camera language — how places are framed and how the camera behaves. |
| `show/production/POSING-SYSTEM.md` | The posing system — the show's pose language for characters. |
| `show/production/320-FACE-EXPRESSION.md` | Face and expression language. |
| `show/production/SMEAR-FRAME-GRAMMAR.md` | Smear-frame grammar — how motion smears are drawn in this show. |
| `show/production/CHIBI-CARD-SYSTEM.md` | The chibi card system — where chibi is legal (cards, ED bits), the caps, and the protected moments. Story screen presence is full-size. |
| `show/production/149-MOCHIIOTECA-ON-SCREEN.md` | How the Mochiioteca appears on screen (EP01 shows it as abstract light + icons only). |
| `show/production/MOCHIIOTECA-ENTRY-STYLE.md` | The style of Mochiioteca entries. |
| `show/production/species-data/152-SPECIES-BEHAVIOUR-PROFILES.md` | Species behaviour profiles — how each species moves and acts (performance reference). |

### How outside generation is driven (the avatar-stack patterns)

| Style document (in `style/`) | What it governs |
|---|---|
| `show/production/tooling/avatar-stack/platforms/PRODUCTION-PATTERN.md` | The production pattern for generated character work — the per-character generate → gate → composite flow this package's §1 method comes from. |
| `show/production/tooling/avatar-stack/platforms/PROMPT-PATTERNS.md` | The prompt patterns — how generation prompts are built (likeness lock, negative lines, variant handling). |

### Music and sound language

| Style document (in `style/`) | What it governs |
|---|---|
| `show/production/344-MUSIC-IDENTITY.md` | Music identity — a theme is who someone is, stated in music; every major subject has a theme record. |
| `show/production/345-SOUNDTRACK-CONSTRUCTION.md` | Soundtrack construction — how the show's music is built from the identity records. |
| `show/production/ADAPTIVE-MUSIC.md` | The adaptive music system — beds, layers, and how music follows scenes (the EP01 beds in this package were made under it). |
| `show/production/296-SONIC-GRAMMAR.md` | Sonic grammar — the show's sound language. |
| `show/production/VOICE-DESIGN.md` | Voice design — human voices and creature voices. |
| `show/production/PROSODY-SYSTEM.md` | The prosody system — how cries and speech carry emotion and meaning. |
| `show/production/136-CRY-COMPREHENSION.md` | Cry comprehension — how audiences read creature cries (the rule under 'creatures speak in cries only'). |
| `show/production/SFX-LIBRARY.md` | The SFX library — the named sound effects (SFX-BELL-01, SFX-COLDSPOT-01...) the cue sheet calls for. |

### Show-root documents and episode-furniture formats

| Style document (in `style/`) | What it governs |
|---|---|
| `show/WORKING-METHOD.md` | THE WORKING METHOD — the construction-kit law's own document: what may be taken from any source (tools, pipelines, systems, environments, props) and what never crosses over (characters, names, logos). Cited by Show Bible law 4. |
| `show/BRAND-GUIDE.md` | The brand guide — outward-facing brand look and usage. |
| `show/README.md` | The show folder's own readme. |
| `show/production/list3-systems/CREDITS-FORMAT.md` | The credits format — how episode credits (the ED slot) are laid out. |
| `show/production/list3-systems/OPENING-TITLES.md` | The opening-titles format (the OP slot). |
| `show/production/list3-systems/CAMERA-SYSTEM.md` | The camera system record behind the environment-and-camera language. |
| `show/production/list3-systems/ENVIRONMENTAL-SOUND.md` | Environmental sound — how places sound under the dialogue and music. |
| `show/production/list4-systems/EYECATCH-FORMAT.md` | The eyecatch format — EP01 has an eyecatch slot (V3-055a); this is its format of record. |
| `show/production/list5-systems/43-SCALE-CHART-SYSTEM.md` | The scale-chart system — characters' relative sizes on screen. |
| `show/production/moves-registry/MOCHIICHAO-NAME-MAP.md` | The move name map — every move's Mochiichao display name against its internal id (the naming law applied; §10's reference). |
| `show/production/moves-registry/ANIMATION-SOURCE-CATALOGUE.md` | The move-animation source catalogue — how move performances are sourced and logged per anatomy. |
| `show/production/species-systems/CRY-SYNTH.md` | Cry synthesis — how creature cries are made. |
| `show/production/model-sheets/116-RANGER-WARDROBE.md` | Ranger wardrobe — the human Rangers' clothing design language. |
| `show/production/fonts/FONTS.md` | The font record (display + text faces named in the identity kit). |

### The load-bearing rules, verbatim

**The show's locked laws** — `show/bible/SHOW-BIBLE.md` §5 (laws 1–7):

```
## 5. THE LAWS (locked 2026-10-27)
1. **Voice law:** creatures = pure cries and sounds only. No
   words. No name-saying. Emotion is performance + sound.
2. **Subtitle law:** subtitles are silent-film intertitles —
   they appear ONLY at certain important moments to carry a
   creature's meaning, then vanish. Rationed hard.
3. **Rule 12 (the thesis, Jamar's exact wording):**
   *"Everything in the garden belongs to somebody... And
   everybody belongs to the Garden."* — warm over the Garden,
   a warning over the Dark Forest. The show's promise and its
   threat are the same sentence.
4. **Construction-kit law:** WORKING-METHOD.md governs all
   borrowed material (no donor characters, names, logos).
5. **Writing law:** WRITING-STANDARD.md — Jamar's house system:
   rules first, canon-sourced beats, open items never silently
   filled, gags are mechanisms, silence is a tool, line economy.
6. **Animation law:** FIRST-START.md §3 — only frame-verified
   real performance counts as animation. No slideshows, ever.
7. **LIKENESS LAW (Jamar, 2026-10-27 — learned from the avatar):**
   every character is built from the character's ACTUAL image
   already in this repo — the way the owner's avatar was built
   from the picture he sent, candidates generated off that exact
   image. NEVER invent a likeness from a text description.
   Generative work takes the repo art file as its image source
   and must preserve the likeness and the art style of that
   source. **Likeness gate:** before any generated character
   asset is used or shipped, frames are checked against the
   character's model sheet — same character, same style, or it
   is rejected and does not enter the repo. (Rejected under this
   law, 2026-10-27: the glossy-3D gen-pilot2 batch — Mochii/Gabu/
   Kittember/Sproutle/Wispkin clips that drifted off-model. They
   were never pushed to this repo.)
```

**The lighting laws** — `show/bible/LIGHTING-SYSTEM.md` §0 (the owner's seven laws, carried over; the full system — per-location keys for Gate/Pond/Green/Dark Forest, the colour-shift protocol, and the locked EP01 lighting plot — is in the copied document):

```
## 0. THE SPINE — THE OWNER'S SEVEN LAWS, CARRIED OVER

These are not research findings. They are Jamar's own lighting philosophy,
already written down in his cape-jones and Mochiichao repos. The Mochiichao
Lighting System **adopts them as law** and translates them to the garden.
Original sources: cape-jones `docs/lighting/COLOR-GRADES.md`,
`docs/lighting/DYNAMIC-RIM-BLASTER-LIGHTING.md`, `docs/lighting/LED-CONTROLLER.md`,
`3d-assets/living-room/lighting/LIGHTING-RIG.md`; Mochiichao
`docs/ui-art/day-night-activation-overlay-spec-20261027.md`,
`day-night-menu-variants.json`, `palette-lint-note.md`.

- **L1 — Grades are built from the model sheets around a LOCKED palette.**
  A scene's grade is derived from the characters in it, not imposed on them.
  Protected identity colours are **never tinted by environment colour** — the
  cape-jones model-sheet law: the white suit stays #FFFFFF, blown out, in
  every signature grade. In Mochiichao the protected set is each species'
  Colour System v2 slots (Dominant / Support / Accent / Ink #101010).
- **L2 — Rim light is SITUATIONAL.** Rim is motivated by the scene — blue/cyan
  in space/void, LED colour in LED scenes, blast colour while a blaster
  fires. Its one non-negotiable job: **dark costume elements stay readable
  in dark settings.** Rim is never decoration; it is a readability tool
  with a story excuse.
- **L3 — TAKEOVER SOURCES.** An active light source (a firing blaster in
  cape-jones) **becomes the scene lighting while it is active**: it creates
  the rim, throws colour into the environment, drives the shot's grade, and
  releases when it stops. Every source colour carries its own lighting
  "personality" preset.
- **L4 — Named grade FAMILIES with use-when rules.** Signature grades
  (day / night / trippy), colour families (royal / ocean / ember / gold /
  ghost), and expressive outside grades — cape-jones' own doc names the
  non-naturalistic ones as written **"in the Ed, Edd n Eddy spirit"**:
  Noir (near-B&W, one colour retained), Acid Candy (hyper-saturated
  emotional colour), Storm (desaturated tension). A grade is chosen by
  name, from the family, for a stated reason.
- **L5 — Lighting is the signature device.** Owner's stated philosophy
  (2026-10-17 canon): Chowder made patterned texture its signature visual
  language; Cape Jones makes **dynamic coloured lighting** its signature.
  Carried into Mochiichao: the garden show's signature is not a filter —
  it is **light that behaves**: motivated, coloured, and allowed to take
  over the scene.
- **L6 — Animated lighting systems ship with STATIC REFERENCE LOOKS.**
  Cape Jones' LED presets are animated systems, and each has a still
  reference look for boards and thumbnails. Every animated lighting
  behaviour in Mochiichao (a shift, a takeover, a cycle) must likewise
  have a boardable still: first frame, peak frame, released frame.
- **L7 — Shifts are an OVERLAY, never a repaint.** From the Mochiichao
  day/night activation spec: day/night is an **overlay layer** — the cycle
  modulates any theme without touching it; turning it off returns the base
  exactly; gradual transitions are a first-class parameter; tint is a
  separable control. **Base = canon, shift = layer.** This is the technical
  form of every colour-shift rule in §3.
```

**No baked shadows** — `show/production/CANON-CONSISTENCY.md`:

```
- **No baked shadows.** Character art never carries a baked-in
  ground/contact shadow; shadows are added at composite time so they
  match the scene. Source art that arrives shadowed is cleaned, the
  clean version becomes the current one, and the shadowed version is
  marked not usable. *(Standing rule; enforced in every pack's
  `do_not_change`; the cleaned Sproutle cutout is the worked case.)*
- **Per-individual traits, once ruled.** A RULED deviation is part of
```

**The current animation method** — `show/production/animation-method/METHOD-REGISTRY.md`:

```
### The Industry Method — v1.3 (2026-10-28)

- **The method:** the Industry Method v1.2 (construction core +
  timing layer + above-floor layer + the likeness gate, folded in
  unchanged, below) **plus the generated-turnaround route** for
  generated character animation:
  `GENERATED-TURNAROUND-PIPELINE.md` in this folder. The route:
  DIAGNOSE (the 20-point structural defect audit run as data
  against the input art) → TURNAROUND (a corrected multi-angle
  sheet generated under a design-inventory prompt built from the
  character's canon record) → ANIMATE (image-to-video from the
  corrected sheet's side-profile cell, on the landed scene-job
  format v2 and its wired path) → EXPORT (frame slicing +
  sprite-sheet packing for game use) → GATES (frame-1 check,
  timing profile, likeness against the corrected sheet, grading
  law, and a diagnosis re-run of the finished frames).
- **Currency, per use (upgrade rule 3 — the standing assignment,
  written here so it is never a quiet fallback):** for GENERATED
  character animation, the v1.3 turnaround route is the
  CURRENT / USABLE method. For DRAWN proofs (part-separated
  puppets, substitution drawings), v1.2's drawn route remains
  CURRENT for that use — it is not superseded there; the two
  routes serve different production kinds and neither substitutes
  for the other.
```

**Timing registers** — `show/production/animation-method/TIMING-STANDARD.md` §3:

```
## 3. Registers — which rate leads, where

A **register** is a passage's declared timing character, written
on its chart before production. Registers modulate *within*
themselves (§4); a register is a centre of gravity, not a uniform
rate.

### 3.1 Scene register (the show's default)

- Body motion drawn **mostly at 12 new drawings/sec**.
- **Calm passages** may centre on **8 new drawings/sec**.
- **Action accents and impacts** run at **24 new drawings/sec**,
  in short bursts — the research report's guidance is impact
  passages at full rate for **at most ~4–8 frames** (report §10,
  guidance grade).
- **Mouth shapes change at 12 changes/sec**, in the 3-shape
  system (closed / half / open), fitted *after* the voice
  recording, per the spec's afureko order (voice first, flaps
  fitted to it).
- Battle grammar per the spec: an anticipation hold → smears at
  24 or 12 drawings/sec → an impact frame held 1–3 frames → a
  held aftermath. The hold after the hit is part of the move's
  read.

### 3.2 Ending-credits / chibi register (the owner's exception)

- The ending-credits gag and chibi devices are **led by 8 new
  drawings/sec** — walk cycles at 8 drawings/sec with accents at
  12 drawings/sec where the chart calls for them.
- This is the **credits exception the owner himself ruled**
  (registry: an ED piece may take less work and a lower drawing
  rate, never a lower standard). It is **not** the show's scene
  default, and it must never be quoted as one.

### 3.3 What no register permits

- A whole scene or gag at one unmodulated rate with no chart
  reason (§4, §8).
- Whole-sprite transforms (bob/tilt/zoom of a still) presented as
  animation at any rate — rejected twice by the owner; the
  storyboard draft built that way is Storyboard Draft 1, not the
  episode.
- Interpolation-generated in-betweens on character cel layers
  (§12: the interpolation tools are rejected for cel layers on
  sourced evidence, and §0 names the profile a below-bar defect).
```

**The ED-credits standard** — `show/production/animation-method/METHOD-REGISTRY.md`:

```
## ⬛ THE ED-CREDITS STANDARD (owner, 2026-10-28 — standing)

An ending-credit piece is allowed to take **less work** than a
story scene: fewer drawings, a lower drawing rate (on 3s — 8
drawings per second — is the house ED timing), loops, pans, held
poses. It is **not** allowed to take a lower standard.

An ED piece is production-grade when, at whatever drawing rate it
uses: its art is finished (no placeholder drawings), its contacts
plant and stick, its held poses are strong enough to read as
silhouettes, its timing varies on purpose (accents on 2s, a few
frames on 1s at the exact hit), the camera/background do honest
motion work, the cuts and beats land on the song, and every
character's personality is in their chart, not in their fluidity.
That is how the reference endings the format descends from were
actually made — see `YU-YU-HAKUSHO-ENDING-STUDY.md`. **Low FPS was
never the amateur part. Missing craft was.** A piece that fails
those checks is not "ED effort level"; it is unfinished, and it
does not ship as an ending.
```

**Chibi discipline** — `show/production/CHIBI-CARD-SYSTEM.md`:

```
---

## 1. THE SIZE LAW (production law, owner's words in substance)

**Characters are FULL-SIZE. Chibi is a device, not the picture.**

- Full-size characters carry the story: **~85–90% of character
  screen presence in every episode is full-size**, measured in
  character-appearance seconds inside story content.
- Chibi versions exist for the show's **in-between furniture and
  flair**: eyecatch cards, preview cards, transition/B-roll
  cards, credits bits, and the rare dramatic-comedic snap (§3).
- A chibi form is a **proportion variant of the canon full-size
  likeness** (§4) — never a separate character, never a separate
  likeness, never the default way a character looks.
- The band is a ceiling on chibi, not a quota to fill. An episode
  with **zero** chibi in its story is always legal; EP01 is
  nearly that (§6). The furniture slots (eyecatch, preview,
  credits) are where chibi lives, and they are seconds, not
  scenes.
```

**Naming laws** — `show/production/species-data-system/DESIGN-BRIEF-canon-world.md`:

```
| **Internal ids unchanged** | Display names change; internal file/id keys NEVER do (e.g. map id `binary_woods`, story flags `codex_get`). Wiring must not break. Design files/labels use display names; code keys stay. |
| **Move rename-on-use** | Every Pokemon-named move gets a Mochiichao display name when used/attached (ids stable). Signature table: §4.5. Stats are NEVER invented — owner-TBD stays TBD. |
```

---


---

## 5. THE SHOOTING SCRIPT

The complete shooting script — every scene, every line, every
VISUAL / ACTION / DIALOGUE / SUBTITLES / SFX / MUSIC block for all
107 cuts — is the companion file **`EP01-SHOOTING-SCRIPT-v3.md`**
in this package, copied byte-exact from the repo (64,316 bytes).
It is the script of record. The per-scene breakdown in §7 of this
document is a production index into it (plates, cast, timings,
staging notes) — if the breakdown and the script ever disagree,
**the script wins**.

Script facts a generator needs up front:

- 28 of the 107 cuts are the **locked spine** (blocks S1–S5 +
  stinger), carried verbatim from the locked v2 script. Nothing
  inside them is edited, re-timed, or re-ordered.
- The only human dialogue in the episode is inside those locked
  blocks (Mochiko's lines, quoted in the §7 block headers).
- One numbered Manual rule is performed in N2 — **Rule 3, which
  is a DRAFT** (see §11, Gaps). The ritual is the beat; if the
  draft rule is swapped or cut, the beat still stands.
- Two scripted action beats carry the episode's motion budget:
  **Action Beat A** — Gabu's pond-side lunge (V3-069, locked
  cut 14); **Action Beat B** — Wispkin's first float-up and
  bell-ring (V3-078, locked cut 23).
- Existing episode assets already in the repo: the Scene-1
  animatic (`show/episodes/EP01/animatic/EP01-SCENE-01-animatic-v1.mp4`
  — a timing proof, never shipped as animation), the CUT01
  composite life proof (which is also the current Garden Gate
  living plate), gated scene audio beds
  (`show/episodes/EP01/audio/` — Scene 1 gate-morning, Scene 2
  pond-tour, Scene 4 pond-dusk, Scene 5 gate-night, forest
  stinger), and ED timing charts
  (`show/episodes/EP01/timing/`).

---

## 6. ANNEXES — BEAT SHEET, CUE SHEET, COLOUR SCRIPT, STORYBOARD PLAN (VERBATIM)

Byte-exact copies of the repo documents, reproduced in full. The same files also sit in this package folder as standalone companions.

### 6.1 BEAT-SHEET.md — `show/episodes/EP01/BEAT-SHEET.md`

# EP01 — "The Garden Has a Ghost" — BEAT SHEET v1

Format: ~6 minutes · Cast: Mochiko (human lead), pilot six ·
Locations (3, all from parts-catalog): Garden Gate, Garden Pond,
Garden Green (battle-bg-garden) · Featured species: **Wispkin**
Show convention (Jamar, 2026-10-27): creatures do NOT talk in words -
they vocalize - PURE CRIES AND SOUNDS ONLY (decided by Jamar
2026-10-27; no name-saying either). SUBTITLES appear silent-film
style ONLY at important moments to carry a creature's meaning
(the Rule 12 subtitle is the model) - see bible/WRITING-STANDARD.md.
Only humans
(Mochiko) speak word-dialogue. Meaning comes from performance,
context and Mochiko's reactions.

**6-beat engine (mystery formula, garden-sized):**
1. **Arrival (0:00–1:00)** — Mochiko's first morning as garden
   keeper. Mochii (excitable, bouncy) gives the tour at high speed.
   Dorowani, the steady hand, carries the keeper's manual.
2. **The oddity (1:00–1:45)** — Berries Mochii stacked are
   un-stacked. A toy rolls uphill. Nobody there. Kittember's flame
   tail flame flickers at nothing.
3. **Investigation (1:45–3:15)** — Gabu volunteers as ghost-catcher
   (all confidence, no plan). Dorowani checks the manual: "Garden
   Rule 12: everything in the garden belongs to somebody."
   Footprints? No — a trail of cold spots. Sproutle notices the
   pattern: the moved things spell a wobbly arrow to the pond.
4. **False scare (3:15–4:15)** — Pond at dusk. Gabu's big grab
   catches only smoke. Kittember's tail flame flares — a tall shadow looms
   (it's Sproutle's sprout silhouette, gag) — then the real shape:
   small, dark, shaking.
5. **Reveal (4:15–5:15)** — It's Wispkin, the garden's night
   keeper, too shy to say hello in daylight. It moved things to get
   Mochiko's attention — it's been keeping the garden alone and
   wanted to be introduced properly. Dorowani: "Rule 12. You
   belonged here the whole time."
6. **Resolution + tag (5:15–6:00)** — Proper introductions at the
   gate sign; Wispkin gets its name on the keeper board. Tag: Gabu
   still wearing the ghost-catcher net as a hat. He keeps it.

**Action beats (motion budget):** (A) Beat 3 — Gabu's pond-side
lunge-and-miss, full-body. (B) Beat 5 — Wispkin's reveal: smoke
swirl + first full float-up.
**Reusable assets created:** keeper board (prop), garden gate sign,
cold-spot trail FX, Wispkin smoke cycle.

**Stinger (Jamar, 2026-10-27):** after the tag, cut to the DARK
FOREST in full daylight — light that doesn't reach in, no birdsong,
suspense held on stillness. The Rule 12 line appears as a SUBTITLE
over the forest and holds: "Everything in the garden belongs to somebody... And everybody belongs to the Garden." The line is the
show's warm thesis AND its warning, depending on what's under it.
New location flagged: the Dark Forest (daylit-horror set) — a MAKE
item for the parts catalog; what stopped moving in there is not
shown in EP01.

### 6.2 CUE-SHEET.md — `show/episodes/EP01/CUE-SHEET.md`

# EP01 cue sheet v1 (music/SFX — all sources in-repo or indexed)
| Cue | Where | Source |
|---|---|---|
| Title theme | 0:00 | public/audio/mochiichao-title-v3.wav |
| Theme stems (underscore build) | beats 1–2 | public/audio/mixer/mixer-title-*.wav |
| Mochii cry (voice base + punctuation) | throughout | public/audio/cries/mochii-cry.wav |
| Dorowani cry | beats 1, 6 | public/audio/cries/dorowani-cry.wav |
| Gabu cry (lunge sting) | beat 4 | public/audio/cries/gabu-cry.wav |
| Kittember cry (tail-flame flare) | beats 2, 4 | public/audio/cries/kittember-cry.wav |
| Sproutle cry (discovery) | beat 3 | public/audio/cries/sproutle-cry.wav |
| Wispkin cry (reveal, soft) | beat 5 | public/audio/cries/wispkin-cry.wav |
| Cold-spot shimmer SFX | beats 2–4 | SFX-COLDSPOT-01 — GAP → route decided (#51 §4): synthesise (reversed bell partials + air); must not resemble any natural source |
| Gate bell (tag) | beat 6 | SFX-BELL-01 — GAP → route decided (#51 §4): foley/record or CC0 bell; single approved take becomes canon |
Finish target: -14 LUFS (TRIPPEDD finish spec, PIPELINE.md).

### 6.3 EP01-COLOUR-SCRIPT.md — `show/episodes/EP01/EP01-COLOUR-SCRIPT.md`

# EP01 COLOUR SCRIPT — "The Garden Has a Ghost"

```
episode:        EP01 — "The Garden Has a Ghost"
arc_statement:  drains as the mystery deepens, returns on the reveal
drain_axis:     saturation (value held)
shift_licence:  Dark Forest only (COLOR-SYSTEM §d default)
spark_budget:   ≤1 action spike (beat 4) + stinger exception (scripted)
```

Re-issued from COLOR-SYSTEM §(e) in the EP-COLOUR-SCRIPT-FORMAT
(show/bible/EP-COLOUR-SCRIPT-FORMAT.md) at the List-6 landing, 2026-10-27 —
**values unchanged; format migration only.**

| Beat | Scene | Location grade ref | Dominant | Value | Saturation | The spark |
|---|---|---|---|---|---|---|
| 1 — First morning | Gate | COLOR-SYSTEM §(d): Garden Gate | brand blues | high | full | timber warmth; the home grade, everything in its right colour |
| 2 — Things move | Green | COLOR-SYSTEM §(d): Green | leaf greens | high-mid | full −10% | Kittember's tail flame, low — the only warm note, and it's *looking at something* |
| 3 — Keeper investigates | Green/Pond edge | COLOR-SYSTEM §(d): Green / Pond | greens cooling toward teal | mid | −20% | Mochii's bright blue starts reading *cold* instead of cute (temperature does the acting) |
| 4 — The lunge (Gabu misses) | Pond | COLOR-SYSTEM §(d): Pond | teal/cyan | mid, contrast UP | full for one beat | the episode's single action-saturation spike; smoke-grey bursts in (Wispkin's support colour, unexplained) |
| 5 — The reveal (Wispkin floats up) | Pond, dusk | COLOR-SYSTEM §(d): Pond | deep pond blues | low-mid | −30%, then warming | the white skull mask is the brightest value in the episode so far — dread colour flips to face |
| 6 — Introduction / tag | Gate | COLOR-SYSTEM §(d): Garden Gate | brand blues, lantern warmth | mid-high | full, restored +warm | subtitle moment sits inside the warmest frame of the episode (§g) |
| **Stinger** | Dark Forest, DAY | COLOR-SYSTEM §(d): Dark Forest | drained blue-green | **high value, ~0 saturation** | **≈0** | none. No spark is the spark. Rule 12 burns in accent red (§g) — the only saturated pixel in the shot |

Script notes (from §(e), unchanged): (i) the drain is *value-held* — beats 1–6
keep the Eds' value discipline while saturation does the storytelling;
(ii) the stinger breaks the episode's own rule — saturation ≈0 at high value.

### 6.4 STORYBOARD-PLAN.md — `show/episodes/EP01/STORYBOARD-PLAN.md`

# EP01 STORYBOARD PLAN — e-konte discipline

Per EPISODE-PLANNING-METHOD.md step 4: cuts numbered, seconds per
cut, BANK marks for stock. Format ~6:00. Board pitch (step 5) is
the gate — timings lock at the animatic, not before.
HB economy target: ~34 cuts, heavy BANK reuse from EP01 onward.

| Cut | Sec | Content | Assets / BANK |
|---|---|---|---|
| 01 | 0:08 | Garden Gate wide, morning. Sign: GARDEN KEEPER. | BG gate (MAKE), BANK after EP01 |
| 02 | 0:06 | Mochiko arrives, backpack bigger than her. | Mochiko rig |
| 03 | 0:05 | Gate swings — Mochii bouncing on it, squeak-cry. | Mochii puppet, gate |
| 04 | 0:08 | Mochii circles her at speed; Mochiko's line. | walk/bounce cycle BANK |
| 05 | 0:10 | Dorowani enters with the Manual; gavel-tap. Rule 1 read. | Dorowani rig, Manual prop |
| 06 | 0:12 | POND: tour patter; Mochii stacks berries. | BG pond (parts-catalog), berry props |
| 07 | 0:08 | Berries un-stack one by one, unseen hands. | berry cycle |
| 08 | 0:06 | Toy duck rolls UPHILL. Both watch it go. | duck prop |
| 09 | 0:07 | Kittember tail flame flickers at empty air; ears flat. | Kittember rig, tail-flame FX |
| 10 | 0:09 | GREEN: Gabu stomps in, net-cape, chest-beat bellow. | Gabu rig (ACTION BEAT A build) |
| 11 | 0:10 | Sproutle ground-level: frost-patch trail. | frost FX decals |
| 12 | 0:08 | The trail points at the pond. Keeper device check-in eyecatch energy. | device prop (OPEN ITEM) |
| 13 | 0:14 | POND DUSK: stakeout behind bush, five heads. | BG pond dusk variant |
| 14 | 0:10 | Gabu LUNGES — splash — smoke through fingers. (ACTION BEAT A) | water splash FX |
| 15 | 0:08 | Tail-flame FLARES. Giant spiky shadow on mist. | shadow gag layout |
| 16 | 0:06 | Reveal of the gag: Sproutle's sprout silhouette. | Sproutle rig |
| 17 | 0:12 | Mist parts. Wispkin, small, shaking, holding the duck. | Wispkin float rig |
| 18 | 0:14 | The shy wail. SUBTITLE (earned moment 1): "...I keep the garden at night." | subtitle card style |
| 19 | 0:10 | Mochiko kneels to its level. "Then let's do it properly." | — |
| 20 | 0:12 | GATE NIGHT: name painted on the keeper board. | board prop |
| 21 | 0:12 | Rule 12 read aloud (exact wording, bible §5). Cricket beat. | — |
| 22 | 0:08 | SUBTITLE (earned moment 2), Wispkin over the board: "...not alone anymore." | subtitle card |
| 23 | 0:10 | Wispkin floats UP first time; bell rung with smoke tail. (ACTION BEAT B) | smoke cycle BANK |
| 24 | 0:06 | TAG: Gabu tips the net-hat. Mochiko's line. | — |
| 25 | 0:20 | STINGER: DARK FOREST, DAY. Light not reaching in. Stillness. | Forest BG (MAKE, daylit-horror) |
| 26 | 0:10 | Something stops moving between trunks. Never shown. | — |
| 27 | 0:12 | SUBTITLE burns in (Rule 12, exact wording). Holds. | subtitle card, forest grade |
| 28 | 0:04 | One leaf falls straight down. SMASH TO BLACK. | — |

Total ≈ 4:14 of cut time; remaining runtime = title card,
eyecatch, transitions, held beats at animatic lock (planning
estimate only — the pitch decides).

---


---

## 7. PER-SCENE BREAKDOWN — every scene, every cut

How to read the cut tables: **Time** = story-clock window from the
script. **Length / Staging background** = target duration and the
background assignment from `EP01-V3-staging.json`. **On screen** =
characters present per that cut's staging layers (props/FX layers
are named inside the note). **Action / staging note** = the staging
file's own note for the cut, with its flags (⚠). The full
VISUAL/ACTION/DIALOGUE/SFX/MUSIC text for every cut is in the
byte-exact script (companion file) — dialogue and subtitle text
also appear in the block headers below and in §3.

### OP — TITLE SEQUENCE (slot furniture, 60s)

Broadcast slot before story 0:00. **Plate:** Garden Gate v2-living (`gate-day`). **Cast:** the six creatures in idle windows, then Mochiko, then the title card *MOCHIICHAO / The Garden Has a Ghost*. **Sound:** Title theme — Cue T1 (`public/audio/mochiichao-title-v3.wav`). **Dialogue:** none.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| OP | slot −1:00–0:00 (broadcast) | 60s | gate-day | Mochii, Dorowani, Gabu, Kittember, Sproutle, Wispkin (idles, staggered windows) + Mochiko | OP title sequence (slot furniture): gate living bg, six creature idles introduce in staggered windows, Mochiko window, title card 'MOCHIICHAO / The Garden Has a Ghost' fades in and holds. |

### N1 — EXT. GARDEN GATE / GARDEN WIDE — DAWN (78s) [NEW]

**Light/colour:** dawn, brand-blue key; wind CALM. **Plates:** Gate v2-living at dawn grade; Pond day plate at dawn grade (V3-002); keeper-board crop (V3-003). **Cast:** HEX (cameo, V3-002 only — distant at the far fence, no line, no name), Kittember (asleep), Dorowani, Wispkin (smoke curl only, V3-006 — body never shown). **Dialogue:** none. **Cries/sound:** one distant unidentifiable cry (V3-001); the gate bell stirs with no hand near it; Dorowani's low hum-cry at the latch (V3-005); Wispkin's smoke is silent. **Music:** none until the T1 melody stem enters solo at V3-003; out entirely for V3-006's last six seconds.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-001 | 0:00–0:14 | 14s | gate-dawn | — (empty frame / plate only) | Gate living plate at dawn grade, wide. Mist band low on path; empty frame, bell stir is audio-only. |
| V3-002 | 0:14–0:26 | 12s | pond-dawn | HEX (distant, frame edge) | SPECIAL: pond-day plate at dawn grade. Something crosses under mist (ripple only); HEX distant still at far fence, frame right edge, ~90px tall, unintroduced. |
| V3-003 | 0:26–0:36 | 10s | board-blank | — (empty frame / plate only) | Keeper board close-up (crop of gate plate), blank line held. No layers - the board is the subject. |
| V3-004 | 0:36–0:48 | 12s | gate-dawn | Kittember | Kittember asleep on gate post: tail_flame_wave (idle avoided - gate FAIL note), small, high on the door post, flame low. |
| V3-005 | 0:48–1:02 | 14s | gate-dawn | Dorowani | Dorowani crosses the path with the Manual (720 working twin suits the rounds beat), checks the latch mid-frame; manual prop rides with him. |
| V3-006 | 1:02–1:18 | 16s | gate-dawn | Wispkin (smoke curl only — body never shown) | Smoke curl slides home along the path's edge, low - night shift ending unseen. |

### S1 — EXT. GARDEN GATE — MORNING (37s) [LOCKED-SPINE — v2 cuts 01–05]

**Plate:** Garden Gate v2-living, morning (`gate-day`). **Cast:** Mochiko, Mochii, Dorowani. **Dialogue (Mochiko, locked verbatim):** "First rule of the garden: the gate is a trampoline. Got it." / (reading) "Rule one: mind the gate." **Cries:** Mochii's squeak-cry like a metronome on the swinging gate. **Music:** Cue T1 (title track). **Subtitles:** none.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-007 | 1:18–1:26 | 8s | gate-day | — (empty frame / plate only) | LOCKED cut 01: Gate wide morning, keeper board + sign. Empty wide (plate carries it). |
| V3-008 | 1:26–1:32 | 6s | gate-day | Mochiko | LOCKED cut 02: Mochiko arrives under too-big backpack (idle_breathe baseline; backpack prop not a separate asset). |
| V3-009 | 1:32–1:37 | 5s | gate-day | Mochii | LOCKED cut 03: gate swings - Mochii bouncing on it: squash_hop canvas bouncing at gate centre with post shadow. |
| V3-010 | 1:37–1:45 | 8s | gate-day | Mochiko | LOCKED cut 04: Mochii circles Mochiko at speed (rectangular circuit canvas at ground/post height); Mochiko talk_nod for her line. |
| V3-011 | 1:45–1:55 | 10s | gate-day | Dorowani, Mochiko | LOCKED cut 05: Dorowani with the Manual, gavel-tap reading; Mochiko listening. |

### N2 — INT./EXT. BERRY STORE & THE ROUNDS — MORNING (128s) [NEW]

**Plates:** Berry Store provisional spec plate + its close crop (V3-012–016 — see §9, Plate 6); Green day (V3-017, 020); Pond day (V3-018, 021); Gate day (V3-019). **Cast:** Mochiko + all six creatures across the cluster. **Dialogue:** none — Mochiko is wordless in all new material; she counts on her fingers, the ledger, and Mochii's head. **Key beats:** the inventory gag in three movements (V3-013–015) resolves into the care loop — *feed the helper first* (V3-016); Sproutle's watering round with exactly three leaf-wipes (V3-017); Gabu's bucket-orbit water run (V3-018); the notch-row beat (V3-019); **the Manual ritual (V3-020): Dorowani reads Rule 3 — a DRAFT rule — in reading-cadence cries; heads bow at the familiar part; music OUT, room tone only.**

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-012 | 1:55–2:07 | 12s | berry | Dorowani, Gabu, Sproutle, Kittember, Mochiko | Berry store interior (PROVISIONAL SPEC PLATE). Mochiko opens the ledger; crew assembles at stations around her. ⚠ PROVISIONAL SPEC PLATE: berry-store interior |
| V3-013 | 2:07–2:21 | 14s | berry-close | Mochii | Ledger pile close-up: Mochii the solemn auditor sits in the counting frame; berry pyramid small beside the tally. ⚠ PROVISIONAL SPEC PLATE crop: berry-store-close |
| V3-014 | 2:21–2:35 | 14s | berry-close | Mochii | Inventory gag 2nd movement: pile right, count wrong - pyramid-minus-one; Mochii looks at the ceiling (tip_wiggle). ⚠ PROVISIONAL SPEC PLATE crop: berry-store-close |
| V3-015 | 2:35–2:47 | 12s | berry | Mochii, Mochiko | Two-shot keeper + auditor, pile between them; she works it out and laughs (wordless). |
| V3-016 | 2:47–2:57 | 10s | berry | Mochii, Mochiko | Care loop: she feeds Mochii first - small bowl beat staged with single berry before the auditor. |
| V3-017 | 2:57–3:11 | 14s | green-day | Sproutle | Sproutle's watering round along the Green edge beds: walking canvas, leaf-wipe pauses built into the path (3 stops). |
| V3-018 | 3:11–3:23 | 12s | pond-day | Gabu | Gabu's water run to the Pond: bucket-orbit gag staged as a wide swinging walk (bucket prop not a separate asset; orbit carried by the sway path). ⚠ bucket prop not built as separate asset - orbit read from Gabu's sway path |
| V3-019 | 3:23–3:35 | 12s | gate-day | Dorowani, Mochiko | Gate post notch-row beat: Mochiko questions, Dorowani's fin draws down the years (idle + proximity staging). |
| V3-020 | 3:35–3:51 | 16s | green-day | Dorowani, Mochii, Sproutle, Gabu | Rule 3 (DRAFT) ritual: Dorowani reads the Manual, heads bow at the familiar part (head_tilt set). |
| V3-021 | 3:51–4:03 | 12s | pond-day | Dorowani, Mochii, Sproutle, Kittember | Procession in single file toward the Pond, keeper fitted in neither leading nor last: staggered walking canvases. |

### S2 — INT./EXT. GARDEN POND — CONTINUOUS (33s) [LOCKED-SPINE — v2 cuts 06–09]

**Plate:** Pond day v1-living. **Cast:** Mochiko (tour patter), Mochii, Kittember (V3-025); the berry pyramid and the toy duck. **Dialogue (Mochiko, locked verbatim):** "You stacked those. Who unstacked those?" / "Ducks don't roll uphill." **SFX:** berry plops, duck squeak, tail-flame hum. **Music:** T1 stems thin out under the oddity. **Subtitles:** none.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-022 | 4:03–4:15 | 12s | pond-day | Mochii | LOCKED cut 06: pond tour; Mochii stacks the berry pyramid with pride. |
| V3-023 | 4:15–4:23 | 8s | pond-day | — (empty frame / plate only) | LOCKED cut 07: pyramid un-stacks one by one, unseen hands - staged as windowed pyramid stages (full -> minus-one -> small -> single), each canvas windowed, nobody on screen does it. |
| V3-024 | 4:23–4:29 | 6s | pond-day | Mochii | LOCKED cut 08: toy duck rolls UPHILL - rolling canvas (spin, centre keys) climbing the bank; Mochii watches. |
| V3-025 | 4:29–4:36 | 7s | pond-day | Kittember | LOCKED cut 09: Kittember tail flame flickers at empty air (tail_flame_wave at pond edge). |

### N3 — EXT. GARDEN POND — LATE MORNING (102s) [NEW]

**Plate:** Pond day v1-living. **Cast:** Mochiko, Mochii, Gabu, Kittember, Sproutle, Dorowani. **Dialogue:** none. **Key beats:** Mochiko re-stacks the pyramid keeper-style (V3-026) and the crew holds on it a moment too long (V3-027 — nobody on screen counts the berries; the audience will); Kittember's flame *leans* toward the Green with direction, three full seconds held (V3-028, music OUT — the hum is the music); Gabu appoints himself pyramid guard (V3-030), falls asleep standing within one cut (V3-031), and Mochii stacks one berry on the leaf on his head (V3-032 — pays off at V3-091/103); the midday bell drifts the crew toward the Green and the locked frost scene (V3-033).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-026 | 4:36–4:50 | 14s | pond-day | Gabu, Sproutle, Mochiko | Mochiko re-stacks the pyramid keeper-style (pyramid fades in berry by berry read); crew drifts in to watch. Mochiko staged at the pyramid. |
| V3-027 | 4:50–5:00 | 10s | pond-day | Mochii, Gabu, Kittember, Sproutle, Dorowani | Finished pyramid, full ring of watchers, held a moment too long. |
| V3-028 | 5:00–5:12 | 12s | pond-day | Kittember | Sensor beat extended: Kittember at pond edge, flame leans toward the Green (tail_flame_wave, held large). |
| V3-029 | 5:12–5:22 | 10s | pond-day | Kittember, Mochii, Gabu, Sproutle, Dorowani | One composed frame: crew, flame, Green beyond - everyone watches a flame point. |
| V3-030 | 5:22–5:34 | 12s | pond-day | Gabu | Gabu appoints himself pyramid guard, net over shoulder like a sash; chest-beat of self-appointment (jaw_chomp read). |
| V3-031 | 5:34–5:48 | 14s | pond-day | Gabu | Guard asleep standing within one cut; a falling leaf lands on his head and stays (leaf-fall windowed to land at Gabu's crown). |
| V3-032 | 5:48–6:00 | 12s | pond-day | Gabu, Mochii | Close on the leaf: Mochii tiptoes in and stacks one berry on it (berry-on-leaf appears late, windowed). |
| V3-033 | 6:00–6:18 | 18s | pond-day | Dorowani, Gabu, Sproutle | Midday bell: crew drifts in one direction toward the Green into the locked frost scene - procession canvases exit frame right. |

### S3 — EXT. GARDEN GREEN — DAY (27s) [LOCKED-SPINE — v2 cuts 10–12]

**Plate:** Green day v1-living (the script's locked text names the Green as battle-bg-garden; the registry's canon-plate verdict stands — see §9). **Cast:** Gabu, Sproutle, Mochiko. **Dialogue (Mochiko, locked verbatim):** "You want to catch it. ...By supper. Sure. Why not." / "It's giving us directions?" **Action:** Gabu stomps in wearing the net as a cape, chest-beat foghorn bellow; Sproutle, cheek to the grass, chirps the discovery — the cold spots make a path pointing at the pond; keeper-device check-in (abstract light and icons only — the Mochiioteca's physical design is canon TBD). **SFX:** stomp, bellow, frost crackle (**GAP** — see §11). **Music:** T1 out; investigation pulse from stems.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-034 | 6:18–6:27 | 9s | green-day | Gabu | LOCKED cut 10: Gabu stomps in net-cape, chest-beat bellow - entrance canvas + net drape + jaw_chomp arrival. |
| V3-035 | 6:27–6:37 | 10s | green-day | Sproutle | LOCKED cut 11: Sproutle ground-level finds the frost-patch trail (frost strip + patches, dead still inside the grass). |
| V3-036 | 6:37–6:45 | 8s | green-day | Sproutle, Gabu | LOCKED cut 12: trail points at the pond; Mochiioteca check-in - abstract device light + icons only (canon TBD treatment), no readable data. |

### N4 — EXT. GARDEN GREEN — DAY (108s) [NEW] — False Clue One: The Frost Is a Map

**Plate:** Green day v1-living; V3-039 uses the special `shift039` composite piece. **Colour:** day clear, one scripted exception — **V3-039, the FROST CLOSE-UP COLOUR SHIFT (first and only use in EP01): palette drains to indigo/violet on the push-in (7:14), the black-purple spirit aura moves inside the frost through the hold (to 7:24), the world restores on the pull-back (7:24–7:29); Kittember's flame, far behind, is the only warm note in the shifted world.** **Cast:** Sproutle (lead, cheek near ground), Dorowani, Gabu, Kittember, Mochiko (V3-042/043), AEON (signal only, V3-043). **Dialogue:** none. **Cries/sound:** Sproutle's survey chirps, one per patch; Gabu's offended rumblings and one chest-beat at his own frost-filled stomp-print (V3-040/041 — the audience can clock it; nobody on screen does); **the AEON ping — once, dry, foreign (V3-043)**.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-037 | 6:45–6:59 | 14s | green-day | Sproutle, Dorowani, Gabu | Tracking procession forms at grass level: Sproutle cheek near ground leads, detectives strung behind, frost patches dead still. |
| V3-038 | 6:59–7:11 | 12s | green-day | Sproutle, Dorowani | Patch by patch at cheek height: shaped frost patches read in order; Sproutle reads, the file holds each stop. |
| V3-039 | 7:11–7:29 | 18s | shift039 | Kittember, Sproutle | SPECIAL: frost close-up colour shift - background is the pre-rendered 3-segment MP4 (push-in / JoJo indigo-violet shift held with frost-aura / restore pull-back). Kittember layer graded WARM, far behind - the only warm note in the shifted world. |
| V3-040 | 7:29–7:41 | 12s | green-day | Gabu | One patch much larger, footprint-shaped: Gabu measures it against his own foot twice, offence growing. |
| V3-041 | 7:41–7:51 | 10s | green-day | Gabu | Gabu chest-beats at the patch; it does nothing back. It wins. (Patch is his own stomp-print, frost-filled - shape rhyme with 040.) |
| V3-042 | 7:51–8:05 | 14s | green-day | Sproutle, Mochiko | Mochiko sweeps the Mochiioteca slowly along the trail, patch to patch - device records, hands solve. Device glow is the hand-unit cluster for her hand beats. |
| V3-043 | 8:05–8:17 | 12s | green-day | AEON (device signal only) | Device icon field close: icons light in sequence along the remembered path; one foreign ping (audio). Icon field fills frame centre. ⚠ Aeon device-icons clip (1280x720, icon sequence + ONE ping flash at 7.0-7.45s of the clip) placed near-full-frame; the ping lands inside this cut exactly once |
| V3-044 | 8:17–8:25 | 8s | green-day | Sproutle, Dorowani, Gabu, Kittember | Held beat of method: the detectives resume at the trail's pace - procession re-formed, nobody rushes. |
| V3-045 | 8:25–8:33 | 8s | green-day | Gabu, Sproutle, Dorowani | Pond path junction: trail thins toward the water; Gabu already reading the path like a general; the file halts. |

### N5 — EXT. POND PATH & GREEN EDGE — DAY (96s) [NEW] — False Clue Two: The Net Plan

**Plates:** Green day; Pond day (V3-049). **Cast:** Gabu (director of the trap), Dorowani, Mochii, Kittember, Sproutle, Mochiko (V3-053). **Dialogue:** none. **Key beats:** the trap built in earnest — net, rope, berry bait, Gabu directing with huge silent gestures from behind a bush that covers one shoulder (V3-046); Dorowani quietly ties one corner properly (V3-047 — the corner holds for the net's whole career); the trap's catches: a falling leaf (V3-048), the toy duck rolling *downhill*, perfectly normally, watched with impossible suspicion (V3-049), and Gabu himself, demonstrating the trigger flawlessly (V3-050); the untangling, unhurried, no mockery (V3-051); **the cold line (V3-052): Kittember will not cross a thin run of frost — flame goes small, NO cry, six seconds of silence, comedy stops; Mochiko kneels to the line's height, not to cross (V3-053). The net plan is over.**

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-046 | 8:33–8:47 | 14s | green-day | Gabu, Mochii | The trap built in earnest: net strung over the path, berry bait placed with a jeweller's care, Gabu directing with huge silent gestures from behind a too-small bush. |
| V3-047 | 8:47–8:59 | 12s | green-day | Dorowani | Dorowani inspects the rigging and quietly ties one corner properly (working twin). The corner holds. |
| V3-048 | 8:59–9:07 | 8s | green-day | Gabu | Trap armed; its first catch is a falling leaf - the net does not even notice it. |
| V3-049 | 9:07–9:19 | 12s | pond-day | Gabu, Kittember, Mochii | The duck rolls DOWNHILL perfectly normally through the trap zone; everyone watches with impossible suspicion. |
| V3-050 | 9:19–9:33 | 14s | green-day | Gabu | Gabu demonstrates the trigger flawlessly and is completely caught: net drape canvas over Gabu, Dorowani's corner holding beautifully. |
| V3-051 | 9:33–9:43 | 10s | green-day | Gabu, Dorowani, Sproutle | The untangling, unhurried: crew frees the general; the net is folded with the same care it was strung with. |
| V3-052 | 9:43–9:59 | 16s | green-day | Kittember, Gabu, Sproutle | A cold line of frost at the Green's edge: Kittember will not cross it; flame goes small (head_tilt - no cry). Comedy stops. |
| V3-053 | 9:59–10:09 | 10s | green-day | Mochiko, Kittember | Mochiko kneels at the line's height, at the cat's height - not to cross. The investigation changes hands. ⚠ kneel_bow staged with 10px bottom headroom (rig QA: held frame ends soles-flush with canvas bottom) |

### N6 — THE GARDEN AT WORK (84s) [NEW]

**Plates:** Green at dusk grade (V3-054/055/059); Pond dusk (V3-056–058, 060). Time passes to dusk *inside the work*, not in a transition. **Cast:** the crew; Mochiko at V3-056/057 (held-frame beats — see staging flags). **Dialogue:** none. **Cries:** feeding-register cries, each species distinct. **Key beats:** feeding round two — Mochii fed first, the N2 lesson applied without comment (V3-054); Sproutle eats around the kept leaf; Gabu fed last and most; the pyramid stands untouched deep in one frame (V3-055); **evidence by tidiness — the pond tools found put away neatly where Mochiko left them in a heap (V3-056); she re-hangs one tool the neat way, copying a hand she has never seen (V3-057)**; the pyramid framed exactly as V3-027 — with **one berry fewer** (V3-058); day cycles end one by one (V3-059/060).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-054 | 10:09–10:21 | 12s | green-dusk | Mochii, Sproutle, Kittember, Gabu | Feeding round two at speed (green at dusk grade, light lengthening): each species fed in its own way; Mochii fed first - the N2 lesson applied. |
| V3-055 | 10:21–10:33 | 12s | green-dusk | Sproutle, Gabu | Round continues: Sproutle eats around the kept leaf; Gabu fed last and most; the pyramid stands untouched deep in frame (small canvas, deep background placement). |
| V3-056 | 10:33–10:47 | 14s | pond-dusk | — (empty frame / plate only) | Evidence by tidiness: pond tools found put away neatly where she left them in a heap - empty dusk frame, the neatness is the event (no tool-rack asset; beat carried by the held frame). ⚠ tool rack / aligned-tools prop not built - beat staged as held empty frame; flagged for prop pass |
| V3-057 | 10:47–10:59 | 12s | pond-dusk | — (empty frame / plate only) | She re-hangs one tool the neat way, copying a hand she has never seen - held two seconds past comfort. Held frame beat (see 056 flag). ⚠ tool prop not built - held frame; Mochiko hand beat awaits prop + her clip pass; Mochiko present in script beat but frame held empty pending tool prop |
| V3-058 | 10:59–11:09 | 10s | pond-dusk | — (empty frame / plate only) | The pyramid in last full light, framed exactly as V3-027 - one berry fewer. Nobody on screen counts. |
| V3-059 | 11:09–11:21 | 12s | green-dusk | Dorowani, Gabu, Kittember | Work sites finishing one by one inside the work as dusk gathers: can set down, gate checked, net folded - crew settling statics. |
| V3-060 | 11:21–11:33 | 12s | pond-dusk | Mochii, Gabu, Sproutle | Garden wide between states: day cycles ending, first knee-height mist testing the Pond's edge; silhouettes settle into evening positions. |

### EYECATCH — Mochiioteca check-in (8s) [NEW]

**Slot furniture.** Mochiioteca check-in graphic — Persona-pop treatment, abstract light and icons over the identity palette, no readable data (device design is canon TBD). **Sound:** T1 sting only. **The AEON ping does NOT repeat here** — the ping is V3-043's, once only (the staging file's device-icons clip carries its own internal flash as a graphic asset; the episode-level story beat stays single).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-061 | 11:33–11:41 | 8s | gate-night | AEON (device signal only) | EYECATCH: Mochiioteca check-in graphic - abstract light and icons over the night palette, no readable data. Slot furniture. ⚠ Aeon device-icons clip at native 1280x720 full frame (its ping flash is inside the clip's own timeline; the episode-level AEON ping remains V3-043's story beat - eyecatch is slot furniture per script |

### N7 — THE STAKEOUT BUILDS (73s) [NEW]

**Plate:** Pond dusk v1-living. Light dies in real time across the cluster; sound thins as light thins. **Cast:** Gabu, Dorowani, Sproutle, Kittember, Mochii; Mochiko (one look, V3-064). **Dialogue:** none. **Key beats:** posts chosen like a heist, played completely straight (V3-062); Gabu's disguise — one leaf on a string in front of his face, adjusted twice, behind which he is entirely visible (V3-063); stakeout supplies issued — blankets folded with quartermaster precision, and the Manual considered as a pillow for exactly one look and placed under Dorowani's arm, as always (V3-064); Sproutle takes the ground post, wipes the visor once, goes stone-still (V3-065 — this stillness is what makes the V3-071 gag work); Kittember's tail set as the tripwire at the path's edge (V3-066 — the mechanism V3-070 pays off, armed in plain view); the frame composes itself into the locked cut-13 picture with no seam (V3-067).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-062 | 11:41–11:53 | 12s | pond-dusk | Gabu, Dorowani, Sproutle, Kittember, Mochii | Positions chosen like a heist: each crew member surveys, selects, occupies a post; the pyramid beyond; mist arriving at ground level. |
| V3-063 | 11:53–12:05 | 12s | pond-dusk | Gabu | Gabu's disguise: one leaf on a string held before his face; behind the leaf, entirely visible: Gabu. |
| V3-064 | 12:05–12:17 | 12s | pond-dusk | Dorowani | Stakeout supplies issued: Dorowani with folded blankets, quartermaster precision; the Manual stays under his arm, never a pillow. |
| V3-065 | 12:17–12:27 | 10s | pond-dusk | Sproutle | Sproutle takes the ground post and goes stone-still - visor wiped once (head_tilt), then absolute discipline. |
| V3-066 | 12:27–12:38 | 11s | pond-dusk | Kittember | Kittember's tail set as the tripwire at the path's edge, flame low and even - the locked cut-15 mechanism armed in plain view. |
| V3-067 | 12:38–12:54 | 16s | pond-dusk | Mochii, Gabu, Dorowani, Kittember, Sproutle | The stakeout frame composes itself into the locked cut-13 picture: five posts, knee-height mist, last colour going. |

### S4 — EXT. GARDEN POND — DUSK (74s) [LOCKED-SPINE — v2 cuts 13–19]

**Plate:** Pond dusk v1-living; mist at knee height. **Cast:** the five stakeout posts, then Wispkin (V3-072 on). **Dialogue (Mochiko, locked verbatim):** "Caught it. Not caught it." / "That's Sproutle's shadow. Everybody breathe." / "...Hi. You kept the garden all night, didn't you. Every night." / "Then let's do it properly." **INTERTITLE 1 at V3-073** (Wispkin: *"...I keep the garden at night."*). **Action Beat A — V3-069: Gabu LUNGES, splash, comes up holding smoke that pours through his fingers.** The tail-flame FLARES (V3-070): a giant spiky shadow on the mist — revealed as Sproutle's sprout, backlit (V3-071, gag played straight). Mist parts: Wispkin, small, shaking, holding the duck up like an apology (V3-072); the shy wail, rising at the end like a question (V3-073). **Music:** all stems out for the wail; one stem back under the reveal.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-068 | 12:54–13:08 | 14s | pond-dusk | Mochii, Gabu, Dorowani, Kittember, Sproutle | LOCKED cut 13: pond dusk stakeout behind the bush line, five heads, mist at knee height. |
| V3-069 | 13:08–13:18 | 10s | pond-dusk | Gabu | LOCKED cut 14 (Action Beat A): Gabu LUNGES - splash - comes up holding smoke that pours through his fingers. |
| V3-070 | 13:18–13:26 | 8s | pond-dusk | Kittember, Sproutle | LOCKED cut 15: tail-flame FLARES; giant spiky shadow on the mist - sprout-shadow is a POST layer over the mist band, never baked. |
| V3-071 | 13:26–13:32 | 6s | pond-dusk | Sproutle, Kittember, Gabu | LOCKED cut 16: gag reveal - the giant shadow is Sproutle's sprout, backlit; Sproutle centre, small, in honest scale. |
| V3-072 | 13:32–13:44 | 12s | pond-dusk | Wispkin | LOCKED cut 17: mist parts - Wispkin, small, shaking, holding the duck up like an apology (float canvas enters through the parting mist). |
| V3-073 | 13:44–13:58 | 14s | pond-dusk | Wispkin | LOCKED cut 18: the shy wail - INTERTITLE 1 over Wispkin mask_tilt. Card occupies the middle portion of the cut, fades in/holds/out. |
| V3-074 | 13:58–14:08 | 10s | pond-dusk | Mochiko, Wispkin | LOCKED cut 19: Mochiko kneels to Wispkin's level - 'Then let's do it properly.' ⚠ kneel_bow staged with 10px bottom headroom (rig QA: held frame ends soles-flush with canvas bottom) |

### S5 — EXT. GARDEN GATE — NIGHT (48s) [LOCKED-SPINE — v2 cuts 20–24]

**Plates:** Gate night (v2-living, night grade); keeper board at night (`board-night`). **Cast:** Mochiko, Dorowani, Wispkin, Mochii, Gabu. **The board now reads: WISPKIN — NIGHT KEEPER, fresh paint (V3-075).** **Dialogue (locked verbatim):** Mochiko reads **Rule 12 aloud** from the Manual (V3-076) — *"Everything in the garden belongs to somebody... And everybody belongs to the Garden."* — spoken, not subtitled; the crickets carry the beat after. Tag line: "It's a successful hat, Gabu. It's a successful hat." **INTERTITLE 2 at V3-077** (Wispkin: *"...not alone anymore."*). **Action Beat B — V3-078: Wispkin floats UP for the first time and rings the gate bell with its tail of smoke.** Tag: Gabu tips the net, worn as a hat, grandly (V3-079). **Music:** T1 melody stem, solo.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-075 | 14:08–14:20 | 12s | board-night | — (empty frame / plate only) | LOCKED cut 20: keeper board at night - fresh painted line 'WISPKIN - NIGHT KEEPER' with wet sheen (board-night-painted plate is the subject). |
| V3-076 | 14:20–14:32 | 12s | gate-night | Dorowani, Wispkin, Mochii, Mochiko | LOCKED cut 21: Rule 12 read aloud (exact wording, spoken - not a subtitle); cricket beat. Mochiko reads from the Manual (talk_nod), crew gathered. |
| V3-077 | 14:32–14:40 | 8s | board-night | Wispkin | LOCKED cut 22: INTERTITLE 2 over the named board; Wispkin small below its own name. Card mid-cut. |
| V3-078 | 14:40–14:50 | 10s | gate-night | Wispkin | LOCKED cut 23 (Action Beat B): Wispkin floats UP for the first time and rings the gate bell with its smoke tail - float_up one-shot then idle-swap hold at height; smoke curl at the bell. |
| V3-079 | 14:50–14:56 | 6s | gate-night | Gabu | LOCKED cut 24 TAG: Gabu tips the net worn as a hat, grandly (head_tilt + net panel tipped above him). |

### N8 — THE FIRST NIGHT SHIFT, TOGETHER (128s) [NEW]

**Plates:** keeper board ceremony framing (V3-080–082); Gate night; Pond night; Green night. **Cast:** the whole crew + Wispkin. **Dialogue:** none. **The board ceremony:** a paw print pressed in paint beside the new name (V3-080); a fin print, and one small scorch dot from a tail tip held close — not on — the wood (V3-081); the last mark is not a print: one perfect berry placed on the board's ledge by the smallest hands in the Garden (V3-082). **Wispkin shows its round** and the crew follows the way you follow a guide in his own country: the duck set back on the water with both hands (V3-084 — the locked cut-08 uphill roll re-reads itself), the tools aligned, checked like affection (V3-085), the pyramid adjusted by one berry (V3-086 — the locked cut-07 un-stacking re-reads as rehearsal); frost blooming in the smoke tail's wake, aura thread inside each patch, **no colour shift — the device was spent at V3-039** (V3-087); the round closes at the Gate and Wispkin stays in the frame (V3-088 — the wail's shape, warm, resolved upward). **INTERTITLE 4 at V3-089** (Wispkin: *"...This is my round. Every night."*) — no sound or music under the card.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-080 | 14:56–15:08 | 12s | board-ceremony | Mochii, Gabu, Wispkin | Board ceremony first mark: paw print pressed beside the new name (ceremony plate carries prints+marks); crew assembled below the board. |
| V3-081 | 15:08–15:20 | 12s | board-ceremony | Dorowani, Kittember | Fin print pressed with a scholar's care; one small scorch dot from a tail tip held close - not on - the wood. |
| V3-082 | 15:20–15:32 | 12s | board-ceremony | Wispkin | The last mark is not a print: one perfect berry placed on the board's ledge by the smallest hands; Wispkin in frame with its own name. |
| V3-083 | 15:32–15:46 | 14s | gate-night | Wispkin, Dorowani, Gabu | Wispkin shows its round: floats at walking height along the cold path, crew following behind quiet, learning the route with their feet; frost forming in its wake. |
| V3-084 | 15:46–16:00 | 14s | pond-night | Wispkin | Round station 1: Wispkin sets the duck back on the water with both hands, like a launched ship; ripple arrives exactly on time. |
| V3-085 | 16:00–16:10 | 10s | pond-night | Wispkin | Round station 2: the tools, aligned of course - Wispkin passes them like Dorowani passed the latch (005 rhyme); passing canvas, check performed like affection. ⚠ tool rack prop not built - passing beat staged on Wispkin's path; flagged for prop pass |
| V3-086 | 16:10–16:22 | 12s | pond-night | Wispkin | Round station 3: the pyramid, and one berry adjusted by a hair - Wispkin's small adjusting move at the stack (rhyme: V3-032's berry set down). |
| V3-087 | 16:22–16:34 | 12s | green-night | Wispkin, Dorowani, Sproutle | The path under the round, close: frost blooming in the smoke tail's wake, the aura's black-purple thread inside each patch (frost-aura smaller variant riding the trail). |
| V3-088 | 16:34–16:48 | 14s | gate-night | Wispkin, Mochii, Gabu, Kittember, Sproutle, Dorowani | The round closes at the Gate: Wispkin turns and sees its own night full of the people it kept it for. It stays in the frame. |
| V3-089 | 16:48–17:04 | 16s | gate-night | Wispkin | Stillness: Wispkin small against the lit Garden - INTERTITLE 4 mid-cut over the emptied frame. |

### N9 — NIGHT IN THE GARDEN (104s) [NEW]

**Plates:** Gate night; Green night. One dominant colour: indigo. **Cast:** Mochii, Gabu, Kittember, Sproutle, Mochiko (V3-093). **Dialogue:** none. **Key beats:** Mochii asleep mid-bounce, frozen at the apex of a hop, squeak-snore on a two-beat cycle (V3-090); Gabu on night guard, asleep standing, leaf still on his head, while a moth inspects the leaf (V3-091 — the moth is not a built asset, see §11); Kittember's flame sweeping slow, lighthouse register, throwing two small stars off Sproutle's visor (V3-092); Mochiko writes the day into the keeper log — the page is never shown (V3-093; the log book is a MAKE prop, §11); **V3-094 — THE HELD SILENCE: ten full seconds of nothing but night cycles and crickets at the cut's centre; no designed sound; the Forest, pointedly, does not hum inside this silence**; far away, the gate bell rung once by nobody visible (V3-095 — the V3-001 stir, answered); the whole Garden in one composed night frame, the frost trail glimmering once and going still (V3-096); a curl of smoke crosses home at the path's edge, slower than V3-006, with nothing left to hide from (V3-097).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-090 | 17:04–17:16 | 12s | gate-night | Mochii | Mochii asleep mid-bounce on top of the gate, frozen at the apex of a hop (idle_bob small, high on the gate). |
| V3-091 | 17:16–17:30 | 14s | green-night | Gabu | Pyramid post: Gabu on night guard asleep standing, net over his shoulder, leaf still on his head from V3-031. ⚠ moth at the leaf not built as an asset - leaf + guard carry the shot |
| V3-092 | 17:30–17:44 | 14s | green-night | Kittember, Sproutle | Kittember's flame sweeping slow across the Green, lighthouse register; crosses Sproutle's ground post (two small stars of visor reflection are a mix/light note, not a layer). |
| V3-093 | 17:44–17:56 | 12s | gate-night | — (empty frame / plate only) | Keeper's bench: Mochiko writes the day into the keeper log (log book prop beside her); page never shown. |
| V3-094 | 17:56–18:12 | 16s | gate-night | Kittember | THE HELD SILENCE: garden wide at night, indigo; nothing framed as an event. Kittember's flame far off, small. |
| V3-095 | 18:12–18:22 | 10s | gate-night | — (empty frame / plate only) | Far side of the Garden, gate small in frame: the bell is rung once by nobody visible - empty held frame, the report is audio. |
| V3-096 | 18:22–18:36 | 14s | gate-night | Wispkin | Garden wide, indigo complete - board, gate, Pond, Green in one composed night frame; the frost trail glimmers once along the path and goes still. |
| V3-097 | 18:36–18:48 | 12s | gate-dawn | Wispkin (smoke curl only — body never shown) | Path's edge, low: a curl of smoke crossing home, slower than V3-006, nothing left to hide from (dawn grade). |

### N10 — MORNING-AFTER BUTTON (86s) [NEW]

**Plates:** Gate dawn with the named board (`gate-dawn-named` — V3-098); Pond day (V3-099/100); Gate day (V3-101–103). Dawn rhymed with N1 shot for shot in structure — protect the rhyme in the edit. **Cast:** Mochiko, Gabu, Wispkin (smoke + intertitle), the crew in the final wide. **Dialogue:** none. **Key beats:** the board in morning light — WISPKIN — NIGHT KEEPER is simply one of the names now, paint dry, marks beside it; **at the far fence, where a figure stood at dawn yesterday, the fence stands empty, and the emptiness is peaceful** (V3-098, rhyme with V3-002); the tall pyramid stands perfect — and beside it a second, smaller pyramid at half scale (V3-099); **INTERTITLE 5 at V3-100** (Wispkin: *"...I practise. So the stacks stay up."*); a curl of smoke slides away in full morning light, a neighbour going home from work (V3-101); Mochiko arrives under the backpack (rhyme with locked cut 02), takes in both pyramids, and straightens the small pyramid's top berry by a hair — the exact gesture she witnessed at V3-086, returned, keeper to keeper (V3-102); the final hold pulls wide on the whole awake Garden and discovers Gabu asleep beneath the net worn as a blanket, leaf still on his head (V3-103).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-098 | 18:48–19:00 | 12s | gate-dawn-named | — (empty frame / plate only) | SPECIAL: Gate at dawn wide - the board now reads WISPKIN - NIGHT KEEPER, paint dry, marks beside it (gate-dawn-named still plate: board legibility beats living layers for this one rhyme shot). HEX ABSENT: the far fence stands empty; the rhyme with V3-002 is the emptiness. |
| V3-099 | 19:00–19:14 | 14s | pond-day | — (empty frame / plate only) | Pyramid site morning: the tall pyramid perfect - and beside it a second, smaller pyramid at half scale. Practice, made visible. |
| V3-100 | 19:14–19:26 | 12s | pond-day | — (empty frame / plate only) | The small pyramid centred, morning light on it like a lamp - INTERTITLE 5 mid-cut over the still stack. |
| V3-101 | 19:26–19:38 | 12s | gate-day | Wispkin (smoke curl only — body never shown) | Path's edge rhyme with V3-006: a curl of smoke slides away in full morning light, unhurried - a neighbour going home from work. |
| V3-102 | 19:38–19:54 | 16s | gate-day | — (empty frame / plate only) | Backpack silhouette rhymed with locked cut 02: Mochiko arrives, takes in both pyramids, kneels and straightens the small pyramid's top berry by a hair - keeper to keeper. |
| V3-103 | 19:54–20:14 | 20s | gate-day | Gabu, Mochii, Sproutle, Kittember | Final hold, pulling wide: Garden awake and whole; discovered last, Gabu asleep beneath the net worn as a blanket, leaf still on his head. |

### ST — EXT. THE DARK FOREST — DAY (46s) [LOCKED-SPINE — v2 cuts 25–28]

**Plate:** Dark Forest v1 STILL — **cycles OFF by law; locked camera; nothing moves that the locked script does not move.** Full daylight that does not reach in; the forest floor is in night anyway; drained blue-green at high value, ~0 saturation. **Cast:** no one on screen. Something far in the dark stops moving between the trunks — **never shown** (what it is remains canon TBD; do not invent it). **Dialogue:** none. **INTERTITLE 3 at V3-106:** Rule 12's exact wording burns in low and holds — accent red, the only saturated pixel in the shot. **SFX:** birdsong from the Garden side only; none from in there. **Music:** none. V3-107: one leaf falls straight down in no wind; SMASH TO BLACK.

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| V3-104 | 20:14–20:34 | 20s | forest | — (empty frame / plate only) | LOCKED cut 25: the Dark Forest, day; light does not reach in. STILL plate, no layers, no cycles (Forest law). |
| V3-105 | 20:34–20:44 | 10s | forest | — (empty frame / plate only) | LOCKED cut 26: something stops moving between the trunks; never shown. No layer may be added - the stillness is the shot. |
| V3-106 | 20:44–20:56 | 12s | forest | — (empty frame / plate only) | LOCKED cut 27: INTERTITLE 3 - Rule 12 exact wording, burns in LOW (lower-centre card) and holds over the Forest still. |
| V3-107 | 20:56–21:00 | 4s | forest | — (empty frame / plate only) | LOCKED cut 28: one leaf falls straight down in no wind; smash to black is episode-level (not faked per-cut). |

### ED — ENDING (slot furniture, 75s)

**Not scripted beyond its slot** (script §7 item 9 — ED content is open-item territory). Staging of record: garden-wide night settle over the Gate night framing, credits card fading in/out, small cast idles (Mochii, Wispkin, Kittember) at the frame bottom. A chibi credits-bit gag slot sits near the end (56–70s) as an **EMPTY marked placeholder — PENDING OWNER; no gag is built and none may be invented.**

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| ED | slot (75s) | 75s | gate-night | Mochii, Wispkin, Kittember | ED (slot furniture): garden-wide night settle, credits card fades in/out, small cast idles at frame bottom. Chibi credits-bit slot present near the end as an EMPTY marked placeholder frame (56-70s) - PENDING OWNER, no gag invented. ⚠ PENDING OWNER: chibi credits-bit gag slot (placeholder frame only, no gag built) |

### PREV — NEXT-EPISODE PREVIEW (slot furniture, 45s)

Chibi-framed card per the slot verdict: brand-blue card field (`prev-bg`); full-size teaser footage in the framed window (Forest+smoke / Pond-dusk+Wispkin / Gate-dawn+Mochii); chibi cast row as card furniture; NEXT TIME in/out. Chibi forms here are proportion variants derived from canon clips — likeness-gate subject to owner/scorer review before ship (staging flag).

| Cut | Time | Length | Staging background | On screen | Action / staging note |
|---|---|---|---|---|---|
| PREV | slot (45s) | 45s | prev-bg | Chibi cast row (card furniture); teaser windows: Wispkin (pond-dusk), Mochii (gate-dawn), Forest+smoke | PREV (slot furniture, CHIBI-FRAMED per SLOT VERDICT): brand-blue card field, full-size teaser footage in the framed window (forest+smoke / pond-dusk+wispkin / gate-dawn+mochii), chibi cast row as card furniture, NEXT TIME in/out. ⚠ Chibi forms are proportion variants derived from canon-pixel clips (anisotropic squash) - likeness-gate subject to owner/scorer review before ship |

<!-- story cuts emitted: 107 -->

---


---

## 8. CHARACTER ROSTER — everyone who appears in EP01

Nine characters. Reference images for the six creatures are the
canon pack fronts (repo path + GitHub blob URL — the repo is
private, so blob URLs open for signed-in users; raw URLs need
auth). Humans have model sheets only (see Gaps).

### MOCHIKO — human lead
- **Canon look** (`docs/human-characters/CANON-HUMAN-CHARACTERS.md`,
  v2 — current): East Asian, warm brown skin, dark brown twin
  tails, teal eyes. Outfit v2: dark navy jacket with teal trim,
  teal skirt over teal leggings, navy sneakers, capsule backpack.
  **No tan/cream/beige in the outfit** (v1 outfit superseded). In
  EP01 she arrives under a too-big backpack and carries the
  keeper's ledger/log and the Mochiioteca device.
- **Reference:** model sheet recorded in the canon doc as
  `named-canon/media-generation-mochiko-v2-asian-no-tan-0-*.webp`
  — status per that doc: *model sheet only, pending owner OK;
  in-game sheet still owed*. There is no Mochiko reference pack.
- **Role in EP01:** the new garden keeper — her first morning.
  She is Prof. Aeon's assistant; the Mochiioteca is his gift to
  her (canon ground, script N4 note).
- **Voice:** human word-dialogue, **only inside the locked spine**
  (lines quoted in §7 at S1–S5). **Voice casting is TBD** — not
  cast, not recorded (script §7 item 2). Every other Mochiko beat
  in the episode is wordless performance.
- **Appears:** OP; S1–S5; N2, N3, N4 (V3-042/043 — her hand and
  the device), N5 (V3-053), N6 (V3-056/057), N7 (V3-064 — one
  look), N9 (V3-093 — writing the keeper log), N10 (V3-102 — the
  button).

### MOCHII — creature, pilot six
- **Canon look:** bright blue dominant (#40a0e0 family) with
  lighter blue highlights (#80c0e0); round, compact body
  proportions (pack `do_not_change`). Species 001, Aqua type —
  dex text: *"A small, water-based creature that bounces to
  move."* (`src/data/core/species.json`)
- **Canon reference (CANON):**
  `show/production/tooling/avatar-stack/reference-packs/mochii/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/mochii/front.png
  (cutout md5 `aa95714f06b146c3464d139837b6cbab`)
- **Cry:** `public/audio/cries/mochii-cry.wav` — identity
  (species.json): *"Bouncing squeak-cry — a squeaky metronome:
  three bright hops, pitch bouncing up-down-up, joyful and
  round."* In EP01 the squeak-cry runs like a metronome when he
  bounces on the gate; his "auditor" gag in N2 plays on total
  silence while helping.
- **Signature move (NOT performed in EP01):** Hydro Rush.
- **Negative-prompt additions:** none character-specific in the
  pack beyond the global rules (no baked shadow; keep the round
  compact proportions).
- **Appears:** OP; S1, S2, S4, S5; N2, N3, N5, N6, N7, N8, N9,
  N10; ED.

### DOROWANI — creature, pilot six
- **Canon look (pack):** Water-type pilot. Body blue (#20a0c0
  family dominant), pale belly (#c0e0e0), deep blue shading
  (#2060a0). **Red fin cheeks — NOT orange** (the orange-cheeked
  version is a rejected drift, never canon). Red eyes, light
  belly + dorsal fin, **tan shell carried on the back — it is a
  shell, never a hat**. Owner shorthand: a crocodile with a
  turtle shell — long croc snout with teeth, turtle shell on his
  back, red fin cheeks.
- **Canon reference (CANON):**
  `show/production/tooling/avatar-stack/reference-packs/dorowani/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/dorowani/front.png
  (cutout md5 `342315e9063e2fd9de348a434f07dc1f`)
- **⚠ EYES — read this before generating him.** The Dorowani
  *species* pattern is red eyes set directly in the blue face,
  **no whites, no sclera**. EP01's Dorowani is the one specific
  individual who **has eye-whites** — an owner-ruled kept trait
  for this individual: in EP01 his whites are KEPT, never
  corrected away (staging canon guard). For any *other* Dorowani
  in any other generation, the pack's negative line applies:
  **"no white around the eyes, no sclera — red eyes set directly
  in the blue face"**, and whites must never grow, shrink, or
  flicker — inconsistency is itself the defect. (The repo's
  records disagree on the *label* for this individual — see §11,
  Gap 9. The operational rule above is what all records agree
  on.) Dorowani is Hex's partner (staging canon guard).
- **Cry:** `public/audio/cries/dorowani-cry.wav` — low hum-cries;
  for Manual readings, a **reading cadence**: cries in the shape
  of sentences, measured and unhurried. He carries the Manual and
  performs the readings (V3-011 locked, V3-020 ritual).
- **Signature move (NOT performed in EP01):** Water Orb
  (owner-named original move).
- **Appears:** OP; S1, S4, S5; N1, N2, N3, N4, N5, N6, N7, N8.

### GABU — creature, pilot six
- **Canon look (pack):** teal dominant (#60a0a0 family) with
  sandy yellow (#e0e080) accents; **wide jaw** (jaw-chomp is a
  canon rig action for this character). Long arms (the bucket
  orbit gag, V3-018, is built on them).
- **Canon reference (CANON):**
  `show/production/tooling/avatar-stack/reference-packs/gabu/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/gabu/front.png
  (cutout md5 `bddcbfff8571ec8022083b9e87945259`)
- **Cry:** `public/audio/cries/gabu-cry.wav` — in EP01: a foghorn
  bellow of total confidence (S3 entrance), chest-beats,
  whispered-command barks that are too loud to be whispers, a hum
  of total self-satisfaction, and a recurring snore-cycle.
- **Signature move (NOT performed in EP01):** Tremor
  (owner-named original move; stats owner-TBD).
- **Appears:** OP; S3, S4, S5; N2, N3, N4, N5, N6, N7, N8, N9,
  N10. He carries Action Beat A (V3-069) and the net's whole
  career (cape → trap → hat → blanket).

### KITTEMBER — creature, pilot six
- **Canon look:** species 010, Beast/Flame — dex text: *"A fiery
  little feline."* Charcoal/black body (#404040/#202020, ~76% of
  opaque pixels) with orange flame accents (#e08000). **Tail-tip
  flame present and orange — it is part of the silhouette. The
  dark body must not be lightened into grey-blue drift** (pack).
  EP01's Kittember is the base (Region 1) form; a ruled Region 4
  regional variant exists elsewhere in canon (black coat,
  all-fours, white chest patch, pink ear interiors, half-lidded
  eyes, teardrop tail flame, fluff tufts) — **not** this
  individual; do not mix the forms.
- **Canon reference (CANON):**
  `show/production/tooling/avatar-stack/reference-packs/kittember/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/kittember/front.png
  (cutout md5 `ffb60b1cf0cc714cc35eadbf9f839935`)
- **Cry:** `public/audio/cries/kittember-cry.wav` — identity
  (species.json): *"Thin mewl with a warm crackle underneath — a
  small cat voice, rising then falling away, with faint fire-pops
  from the tail flame woven through it."* Sleep-breath only in
  N1; **no cry at all in V3-052 — the absence is the performance.**
- **EP01 role:** the tail-tip flame is **the episode's sensor** —
  it dips toward the Pond in sleep (V3-004), flickers at empty
  air (V3-025), *leans* toward the Green with direction
  (V3-028), goes small at the cold line (V3-052), is set as the
  stakeout tripwire (V3-066), and FLARES for the S4 gag
  (V3-070). Sensor law: the flame knows first; smallest is worst.
- **Signature move (NOT performed in EP01):** Fire Stream
  (already an original name; blasts come from the tail ~75% of
  the time, from the mouth ~25% — species-wide owner rule).
- **Appears:** OP; S2, S4; N1, N2, N3, N4, N5, N6, N7, N8, N9,
  N10; ED. (Wild Kittember live in the Dark Forest in canon —
  none are shown in EP01's stinger.)

### SPROUTLE — creature, pilot six
- **Canon look:** species 038, Flora/Chrome — dex text: *"A
  little plant turtle."* Greens dominant (#60c0a0 / #80c0a0
  families), mint-green body, big cyan visor, olive helmet/cap,
  sprout on the head (the sprout's backlit silhouette is the S4
  gag). Keeps **a leaf behind one ear** — a kept tool: he wipes
  his fogged visor with it (exactly three times in V3-017; the
  habit runs all season). The portrait
  (`sprite-art/portraits-scripted-v3/sproutle-portrait-scripted-v3.png`)
  is his canon likeness of record; the blue form in
  `public/assets/variants/lustre/` is his **Lustre (shiny)
  variant** — a different form, NOT a rival likeness, and not
  used in EP01.
- **Canon reference (CANON, cleaned cutout only):**
  `show/production/tooling/avatar-stack/reference-packs/sproutle/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/sproutle/front.png
  (cutout md5 `44068950bda8d0b427af1209565ab2e9`). **Use only the
  cleaned cutout** — the earlier v1 file carries a baked grey
  ground ellipse and is marked NOT USABLE (no-baked-shadows
  rule).
- **Cry:** `public/audio/cries/sproutle-cry.wav` — identity
  (species.json): *"Soft chirps — three gentle, rounded chirps
  with quiet gaps between them; a noticer's small voice, never
  startling."* One chirp per bed on his watering round; soft
  survey chirps, one per frost patch, in N4.
- **Signature move (NOT performed in EP01):** Leaf Blast.
- **Appears:** OP; S3, S4; N2, N3, N4, N5, N6, N7, N8, N9, N10.

### WISPKIN — creature, pilot six — the episode's featured species
- **Canon look (pack):** body near-black smoke (#000000–#404040
  dominant); mask bone white (#e0e0e0). **Cracked white
  skull-mask ghost: the crack pattern and eye sockets are the
  identity. The mask is HELD in both hands in front of the body,
  not worn. The body dissolves into smoke at the edges — no solid
  legs/feet.** Species 042, Umbral (species.json carries him as
  roster-only — dex text still owed there; see §11, Gap 2).
- **Canon reference (CANON):**
  `show/production/tooling/avatar-stack/reference-packs/wispkin/front.png`
  — https://github.com/mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start/blob/main/show/production/tooling/avatar-stack/reference-packs/wispkin/front.png
  (cutout md5 `4741bc9a97b80e99106a764d1aa6c3f8`)
- **Variant trait (owner ruling 2026-10-28):** **horns are
  optional per individual** — some Wispkin have horns, in varying
  styles. Horns are not his always-form and not a likeness
  failure: never force horns, never fail a generation for horns.
- **Cry:** `public/audio/cries/wispkin-cry.wav` — identity
  (species.json): *"Whisper-wail — soft and breathy, a slow minor
  fall carried on noise-breath; the night keeper heard more than
  seen."* The near-silence palette: **the quietest thing in the
  episode.** His smoke makes no sound at all (V3-006, V3-101).
  The shy wail at V3-073 rises at the end like a question; the
  same shape returns warm and resolved at V3-088.
- **The frost is his:** the frost patches are his round-trace —
  the chill of his smoke tail settling as he walks his nightly
  round — with a dark spirit aura (black-purple smoke/flame)
  living inside the frost. His round: set the duck back on the
  water, check the pond tools (kept aligned), adjust the berry
  pyramid by a hair, end at the Gate.
- **Meaning:** he never speaks words. His meaning is carried by
  performance and by intertitles 1, 2, 4, 5 (§3).
- **Signature move (NOT performed in EP01):** Dark Wave.
- **Appears:** OP (idle); S4, S5; N1 (smoke curl only, V3-006 —
  body never shown), N8, N9 (V3-096 framing), N10 (smoke,
  V3-101); ED.

### HEX — human cameo (one shot)
- **Canon look** (`docs/human-characters/CANON-HUMAN-CHARACTERS.md`):
  v2 is the current/primary version — Black, dark brown skin,
  black hair with purple streak, amber eyes, black/purple
  high-collar jacket (model sheet recorded as
  `named-canon/media-generation-hex-v2-black-0-*.webp`). v1
  (pale) is kept as a **variant** — the owner did not order a
  race change; neither version is deleted. Model sheet only,
  pending owner OK.
- **EP01 use — one cut only (V3-002):** a distant figure standing
  still at the far fence line, frame edge, ~90px tall in staging.
  **No approach, no line, no name, no introduction.** He is gone
  when the frame is revisited (V3-098 — the fence stands empty,
  and the emptiness is the beat). **Never board him closer than
  the fence line.**
- **Voice:** none.
- Dorowani is Hex's partner (staging canon guard) — context
  only; nothing of it is stated in the episode.

### AEON (Prof. Aeon) — human cameo (signal only — never seen)
- **Canon look** (human canon doc): v2 current/primary — Black
  older professor, dark brown skin, grey afro + grey beard, round
  glasses, white lab coat over teal tech suit, data tablet (model
  sheet: `named-canon/media-generation-prof-aeon-v2-black-0-*.webp`).
  v1 (pale) kept as variant. Model sheet only.
- **EP01 use:** **presence by signal only.** Inside the
  Mochiioteca sweep at V3-043, one tone that does not belong —
  **a single clean ping, mixed dry, from outside the Garden's
  sound-world. Once. It never repeats in this episode** (not in
  the eyecatch, not anywhere else). No body, no voice, no name
  anywhere in the episode. Mochiko's hand pauses half a beat;
  the sweep resumes.
- **Voice:** none.

---


---

## 9. PLATES LIST — every background EP01 uses

Source of record: `show/shared/PLATES-REGISTRY.md` + the
parts-catalog environment-plates entry + `EP01-V3-staging.json`
background assignments. All video plates: 1280×720, 24 fps, 8.0s
loops.

**⚠ Provenance (the registry's own warning, kept):** the only
canon painted background art is the **Garden Gate** plate. The
Pond, Green, and Forest plates in the repo are **provisional spec
plates** — built procedurally from the canon colour/lighting/
living-world systems so scenes can be timed, composited, and
gated now. **They are not canon art and must not be presented as
such**; each is superseded the moment a canon painted plate
lands (the living cycles carry over — only the base art swaps).

| # | Plate | Repo file (CURRENT version) | Living or still | Used in |
|---|---|---|---|---|
| 1 | **Garden Gate — v2-living (CURRENT)** | `show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4` (md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31`) | **LIVING** — cloud-shadow drift, leaf drift, pollen motes (gate-swing/grass/population layers are the continuing upgrade path, not yet in the proof) | All Gate scenes: S1 (morning), S5 (night), N1 (dawn grade), N7→S4 approach, N8–N10 Gate framings; staging backgrounds `gate-day`, `gate-dawn`, `gate-night`, `gate-dawn-named`, and the `board-*` crops below |
| 1a | Garden Gate — v1 still (base layer) | Owner-accepted 2048×1152 WebP plate — recorded in the registry at a workspace path (`~/workspace/mochiichao-show/scene-01/media-generation-garden-gate-bg-plate-0-1cbbf046-0051-45d6-bb70-ff42bec529a7.webp`, md5 `2d4207f638976799e877049f0bcb3dd3`); **the still itself is not a file in this repo** | Still — **superseded as a standalone background**; it is the base layer the living version is built on. Never composite onto the still directly (Current-Version Law) | Base layer under v2-living only |
| 2 | **Pond — Day, v1-living (spec, provisional)** | `show/assets/backgrounds/pond/EP01-PLATE-pond-day-v1-living.mp4` (md5 `93106645072356d3954994be54772029`); base still `EP01-PLATE-pond-day-v0-spec-still.png` | **LIVING (spec)** — ripples (3 emitters), reed sway, lily bob, shimmer field, cloud drift/shadow, pollen motes; wind-keyed (BREEZE default; CALM stills the ripples for the cut-08 duck gag) | S2 (cuts 06–09 use), N2 (V3-018, 021), N3, N5 (V3-049), N10 (V3-099/100); dawn grade at V3-002 (`pond-dawn`) |
| 3 | **Pond — Dusk, v1-living (spec, provisional)** | `show/assets/backgrounds/pond/EP01-PLATE-pond-dusk-v1-living.mp4` (md5 `037de6228a64c7078c70467930b74bfc`); base still `EP01-PLATE-pond-dusk-v0-spec-still.png` — same base art as Pond Day under the dusk overlay grade (one base, two keys) | **LIVING (spec)** — layered mist (11s drift, built so cut 17's "mist parts" is a level split), slower ripples, lily bob, reed sway at 0.55; shimmer/cloud-shadow/motes OFF at dusk | N6 tail (V3-056–058, 060), N7, S4 (stakeout → reveal); night grade for N8's Pond station (V3-084, `pond-night`) |
| 4 | **Green — Day, v1-living (spec, provisional)** | `show/assets/backgrounds/green/EP01-PLATE-green-day-v1-living.mp4` (md5 `9bd79f8899e2e2677f0f1187157e153e`); base still `EP01-PLATE-green-day-v0-spec-still.png` | **LIVING (spec)** — the signature grass-wave (6.1s bend/brightness wave travelling with the wind), flower bob clusters, cloud shadow, leaf drift, canopy sway. Frost patches are composite-stage decals that locally kill the grass cycle — never in the plate | S3, N4, N5 (`green-day`); dusk grade N6 (`green-dusk`, V3-054/055/059); night grade N8 (V3-087) + N9 (V3-091/092, `green-night`) |
| 5 | **Dark Forest — Day, v1 STILL (the only version; a living version must never exist)** | `show/assets/backgrounds/dark-forest/EP01-PLATE-dark-forest-day-v1-still.png` (md5 `1c27182775f2b269d8c5a782577a5cb7`) + timed edit version `EP01-PLATE-dark-forest-day-v1-STILL.mp4` (8.0s of identical frames) | **STILL BY LAW** — cycles OFF, no population, no wind, no composite life. The one sanctioned motion in the stinger (cut 28's leaf falling straight down) is a scripted story element staged at composite, **not** part of this plate | ST stinger only (V3-104–107). Locked camera: no drift, no pan |
| 6 | **Berry Store (interior)** | **No plate file exists in the repo.** Staging flags it `PROVISIONAL SPEC PLATE: berry-store interior` (and `berry-close` as its crop) | Provisional (staging record only) | N2 (V3-012–016: `berry` ×3, `berry-close` ×2) |

**Derived framings (not separate plate files — crops/grades of
the plates above, per staging):** `board-blank` (keeper-board
close-up, crop of the Gate plate — V3-003), `board-night`
(V3-075, 077), `board-ceremony` (the board with prints/marks —
V3-080–082), `gate-dawn-named` (Gate dawn still framing where the
painted board must read — V3-098), `shift039` (the pre-rendered
3-segment colour-shift composite piece for V3-039 — push-in /
shifted hold / restore; a composite piece, not a background
plate), `prev-bg` (the preview card's brand-blue field — slot
furniture, PREV only).

**Staging background index (all 19 staging background ids,
mapped):** `gate-day` ×10, `gate-dawn` ×5, `gate-night` ×13 →
Plate 1 · `pond-day` ×17, `pond-dawn` ×1 → Plate 2 · `pond-dusk`
×17, `pond-night` ×3 → Plate 3 · `green-day` ×20, `green-dusk`
×3, `green-night` ×3 → Plate 4 · `forest` ×4 → Plate 5 · `berry`
×3, `berry-close` ×2 → Plate 6 (provisional, no file) ·
`board-blank` ×1, `board-night` ×2, `board-ceremony` ×3,
`gate-dawn-named` ×1 → Gate-plate derived framings · `shift039`
×1 → V3-039 composite piece · `prev-bg` ×1 → PREV card field.

---

## 10. MOVES — WHAT THE EPISODE ACTUALLY USES

**No named battle moves are performed in EP01.** This was checked,
not assumed: the script, the staging file and the episode index
contain no move performances — the episode's two action beats
(V3-069, V3-078) are a lunge and a float-up, staged in the script
without move names, and no move stats are invented anywhere in
this package. The signature moves below exist in the characters'
reference packs as canon identity. They are listed here **for
reference only — do not add them to the episode.** (Full move
naming record: `style/show/production/moves-registry/MOCHIICHAO-NAME-MAP.md`.)

| Character | Signature move (Mochiichao display name) | Note |
|---|---|---|
| Mochii | **Hydro Rush** | — |
| Dorowani | **Water Orb** | Owner-named original move (not a rename). |
| Gabu | **Tremor** | New move; its game stats are owner-TBD — never invent them. |
| Kittember | **Fire Stream** | Original name. Species performance rule: ~75% tail / ~25% mouth. |
| Sproutle | **Leaf Blast** | — |
| Wispkin | **Dark Wave** | His shadow-ball-class orb animation (the avatar making_something clip) is a **separate** move whose Mochiichao name is still owner-TBD — it does not replace Dark Wave. |

---

## 11. GAPS — WHAT THE REPO DOES NOT HAVE

Named plainly. Nothing here is papered over, and nothing in this
package invents material to fill these holes.

1. **Multi-angle sheets are a GAP for all six pilot creatures.**
   Each reference pack holds the canon **front** only. ¾ views,
   side views, back views and expression sheets do not exist yet —
   any generator working a side/back/¾ cut is extrapolating from
   the front, and those frames need the likeness gate (§1,
   READ FIRST) before use. (The route to close this gap is written
   in `style/show/production/animation-method/GENERATED-TURNAROUND-PIPELINE.md`.)
   **GAP-FILL 2026-10-28 — CANDIDATE:** Candidate turnaround + expression sheets were generated from each pack's canon front (Sheet Assembly pattern), anchor-graded against the pack anchors, and landed in `show/production/tooling/avatar-stack/reference-packs/<character>/` as `candidate-turnaround.png` + `candidate-expressions.png`, with grades and notes in each pack's `CANDIDATE-SHEETS-RECORD.md` and views updated GAP → CANDIDATE in `pack.json` / `PACK-MANIFEST.md`. Five of the six creatures now carry CANDIDATE views for every missing angle (Dorowani + Kittember, PR #29, merge `4be18730`; Mochii + Gabu, PR #33, merge `baaa148e`; Sproutle, PR #32, merge `5d9097d6`). Wispkin's turnaround is CANDIDATE (PR #32), but **Wispkin's expressions REMAIN GAP**: the candidate attempt FAILED its anchor check — the generator duplicated the mask (one mask worn with drawn-on expressions, a second mask held), breaking the held-not-worn anchor in all six panels — so it was not landed; the failure, the rejected hashes, and the retry recipe (one fresh call, explicitly "exactly one mask, held; expression via socket shape/tilt/posture") are recorded in the Wispkin pack. CANDIDATE is not canon: the owner locks sheets only after seeing them.

2. **Dorowani and Gabu are not in the species data file**
   (`src/data/core/species.json` carries 47 species; neither is
   among them). Their canon is their reference packs only.
   Wispkin's dex text is also owed (the field is empty).
   **GAP-FILL 2026-10-28 — OWNER-OWED:** Species-data / dex material is fenced owner territory and was not touched by this programme. Dorowani's and Gabu's species entries and Wispkin's dex text remain owed by the owner, exactly as above.

3. **Mochiko (the only speaking human):** voice casting is TBD;
   her art record is a model sheet only — no generation reference
   pack exists for her, and her puppet was not built at animatic
   stage (animatic cut 02 is a board slate for exactly this
   reason).
   **GAP-FILL 2026-10-28 — PARTIAL:** A Mochiko reference pack now exists — `show/production/tooling/avatar-stack/reference-packs/mochiko/` (`pack.json` + `front.png`, md5 `4862bf271f5ad3ba21eea3b0cd7926b5`), FILLED as CANDIDATE / DERIVED: the front is a crop of her named-canon v2 model sheet (PR #27, merge `8d7e1588`). Her voice remains OWNER-OWED (casting still TBD — nothing was cast or invented), and her ¾ / side / back / expression views remain GAP inside the pack, because the model sheet carries a single front pose only.

4. **Hex and Aeon** are model-sheet-only — no reference packs.
   **GAP-FILL 2026-10-28 — PARTIAL:** Reference packs now exist for both — `show/production/tooling/avatar-stack/reference-packs/hex/` (front md5 `82a12dd95a1367ada4c7e4a667e754c6`) and `show/production/tooling/avatar-stack/reference-packs/aeon/` (front md5 `e2aedf38c43788a91dbdcef75c255b21`), FILLED as CANDIDATE / DERIVED crops of their named-canon v2 model sheets (PR #27, merge `8d7e1588`). Their ¾ / side / back / expression views remain GAP inside each pack, because each model sheet carries a single front pose only.

5. **Canon painted plates do not exist yet for Pond, Green or
   Dark Forest.** The repo's video plates for them are
   *provisional spec* builds (the plates registry says so itself);
   the Gate's v1 base still is not a repo file (workspace path
   only; the v2-living composite is the current Gate piece).
   **GAP-FILL 2026-10-28 — FILLED FOR EP01 (DERIVED):** The Gate base stills are now repo files — `show/assets/backgrounds/gate/EP01-PLATE-gate-v1-still-2048.webp` (md5 `2d4207f638976799e877049f0bcb3dd3`) and `EP01-PLATE-gate-v1-still-1280.png` (md5 `3d3d76f29d0dd23aa8633db1e471b81e`) — clearing the local-only staging debt, and the Gate dawn pieces are registered CURRENT-FOR-EP01 (DERIVED) in `show/shared/PLATES-REGISTRY.md`: dawn still `EP01-PLATE-gate-dawn-v1-derived-still.png` (md5 `b1f3266666b8e8ce979341d413b2a2f1`) and dawn living `EP01-PLATE-gate-dawn-v1-derived-living.mp4` (md5 `9fe9a295275fa2f863022c23ab2533eb`), with `grade_plates.py` + `PROVENANCE.md` kept in the gate folder (PR #26, merge `f0b1db84`). Pond dawn (md5 `527fbdcc7c89196b371dc3bb101efd69`) and Pond day finish (md5 `c63c692d9af7e2ec980a6300a43d4fbe`) stills and the Green day finish still (md5 `1c9d73ae1157ce46006c2a53ddd3f1c3`) are likewise CURRENT-FOR-EP01 (DERIVED). Named remainders: the pale-gold lane-edge rim is a composite-stage item and is NOT in the whole-frame Gate grade (recorded in the gate provenance); **GAP-pond-canon and GAP-green-canon stay open** — a derived grade of a provisional base is not canon art; and the Dark Forest v1 still is confirmed CURRENT in the registry — STILLNESS BY LAW, no living version.

6. **The Berry Store has no plate file at all** — its only record
   is the staging file, which itself flags it provisional
   (N2, V3-012–016).
   **GAP-FILL 2026-10-28 — FILLED (DERIVED):** The Berry Store plate is now in the repo at `show/assets/backgrounds/berry-store/` — still `EP01-PLATE-berry-store-v1-still.png` (md5 `4581c1afe6a72b037fec647b12a9ffc4`), close still `EP01-PLATE-berry-store-close-v1-still.png` (md5 `f8f7877f70f4a6bb1e06d24c4c15c0bc`), living `EP01-PLATE-berry-store-v1-living.mp4` (md5 `482d0d24c43bce5a7634a5d62ce867ef`) — registered CURRENT-FOR-EP01 (DERIVED) in `show/shared/PLATES-REGISTRY.md` with provenance in the folder (PR #26, merge `f0b1db84`). The files existed before only as local-only staging (the ep01-finish lane); that staging debt is cleared. They are DERIVED / provisional plates, not canon painted art.

7. **Unbuilt props the script calls for:** the tool rack / aligned
   tools (V3-056, V3-057, V3-085 — staging flags "prop NOT
   built"), a bucket as a separate asset (V3-018), and the moth
   (V3-091).
   **GAP-FILL 2026-10-28 — FILLED (DERIVED) / SPEC-FILLED:** The tool rack and the bucket are built and landed as DERIVED props — `show/assets/props/EP01-PROP-tool-rack-v1.png` (md5 `9c6e493b20bc002f088a5ce57a771acd`) and `show/assets/props/EP01-PROP-bucket-v1.png` (md5 `715a431447ddaefe47d8df74a8b05827`) — and the moth is SPEC-FILLED at `show/assets/props/EP01-PROP-moth-v1-SPEC.md` (a build spec, no image: at its staged size of ~30–45 px on the leaf, a blind-built asset cannot be verified readable against the real V3-091 composite). All three are registered in `show/assets/props/PROPS-REGISTRY.md` and the `ep01-props-v1` collection in `show/shared/parts-catalog.json` (PR #28, merge `44448fc7`).

8. **Sound gaps:** the cold-spot shimmer (SFX-COLDSPOT-01) and the
   gate bell (SFX-BELL-01) have no finished files — the cue sheet
   records the decided routes (synthesise the shimmer; foley/CC0
   for the bell). Frost crackle is likewise unfinished. One gated
   audio bed named in the staging (BED-GREEN-DAY) does not exist;
   the episode's other beds are new-cluster MAKE items (see
   `EP01-V3-BEDS.md`).
   **GAP-FILL 2026-10-28 — NOT ADDRESSED:** The sound gaps were out of scope for this programme and are unchanged — SFX-COLDSPOT-01, SFX-BELL-01, the frost crackle, and BED-GREEN-DAY remain exactly as recorded above. Nothing in this gap-fill created, synthesised, or substituted any audio.

9. **One wording conflict in the repo's own records** (reported,
   not resolved here): the staging file's canon guard and the
   clip-index call EP01's Dorowani "the avatar-set Dorowani /
   avatar-show individual (Doro)" — the owner-corrected ruling is
   that the one whites-having individual is a specific
   made/generated individual, **not** the avatar. The operational
   rule every record agrees on, and the one this package follows:
   **EP01's Dorowani has eye-whites; keep them; never correct them
   away.**
   **GAP-FILL 2026-10-28 — FILLED:** The records are corrected. In `show/episodes/EP01/EP01-V3-staging.json`, `canon_guards[0]` now attributes the eye-whites to the one specific made/generated Dorowani individual from the owner's original ruling — NOT the avatar — and a dated CORRECTION guard is appended; in `show/shared/clip-index.json`, `canon_notes.dorowani_eyes` is corrected the same way, with the old value preserved in the correction note. The for-grok staging copy carries the identical fix (the two staging files are byte-identical on main). The operational rule is unchanged: EP01's Dorowani has eye-whites; keep them; never correct them away (PR #27, merge `8d7e1588`).

10. **Rule 3 is a DRAFT rule** (script §0.1). The V3-020 ritual
    beat is written to survive its removal.
   **GAP-FILL 2026-10-28 — UNCHANGED:** Rule 3's status is an owner / canon matter, not an asset gap, and this programme did not touch it. It remains a DRAFT rule, exactly as above.

11. **The ED slot's content is unscripted** beyond its 75-second
    slot, beat map and gag chart (all included in this package);
    the chibi credits-bit inside it is an EMPTY placeholder
    pending the owner.
   **GAP-FILL 2026-10-28 — OWNER-OWED:** The ED slot's content is fenced owner territory and was not touched by this programme. The chibi credits-bit remains an empty placeholder pending the owner, exactly as above.

12. **The Mochiioteca's physical design is canon TBD** — in EP01
    it appears only as abstract light and icons, never as a
    designed object.
   **GAP-FILL 2026-10-28 — OWNER-OWED:** The Mochiioteca's physical design is fenced owner territory and was not touched by this programme; it remains canon TBD, exactly as above, and nothing in this gap-fill designs it.

13. **What stopped moving in the Dark Forest is canon TBD** — it
    is never shown and must not be invented or depicted.
   **GAP-FILL 2026-10-28 — OWNER-OWED:** What stopped moving in the Dark Forest is fenced owner territory and was not touched by this programme; it remains canon TBD, and it is not depicted or described anywhere in this gap-fill, exactly as above.

---

## 12. COVERAGE CHECK — WHAT WAS VERIFIED FOR THIS PACKAGE

Counted from the files themselves, 2026-10-28:

**Scenes / cuts**
- Script scene blocks (story): **17** (OP, eyecatch and preview
  are slots around them). Breakdown sections in §7: **20**
  (17 story blocks + OP + ED + PREV).
- Unique cut ids (V3-001…V3-107) in the script: **107**. Shots in
  the staging file: **110** (107 story cuts + OP, ED, PREV slots).
  Breakdown rows in §7: **110** — every staging shot appears,
  with its story-clock window and target length.
- Story runtime: 1,260 s of cuts inside a 1,440 s (24:00) frame
  with OP/ED/PREV.

**Characters**
- Named characters in the script's cast: **9** — Mochiko, Mochii,
  Dorowani, Gabu, Kittember, Sproutle, Wispkin, Hex, Aeon.
  Roster entries in §8: **9**. Every character named anywhere in
  the script or staging is in the roster.

**Plates**
- Unique background ids used by the staging file: **19** — all 19
  are mapped in §9 to their plate files (or named as GAP /
  staging-record-only where no file exists: Berry Store,
  board-blank, the PREV card background).

**Style & production language sweep**
- Markdown documents under `show/` in the repo: **824**. Every
  one was classified. **73 style-bearing documents from `show/`
  are included byte-exact** in `style/` (plus the 2 human-character
  documents from `docs/`, and the episode's own music/gag/stems
  documents as package-root companions) — each is indexed in the
  READ FIRST section with what it governs.
- **Found but excluded, with reasons:**
  - The other episodes' files (EP02–EP10 scripts/beat sheets,
    26 documents) — this package is EP01; EP01's own superseded
    v2 script and its delivery/render ledgers and build report
    were likewise excluded (superseded / production bookkeeping,
    not generation language). EP01's `MANUAL-RULES-DRAFT.md` was
    excluded as an unadopted draft — the adopted rules are the
    script's §0.1 and the bible laws.
  - The numbered teardown system documents — several hundred across
    `show/production/` root, `battle/`, `world-systems/` and the
    `list*-systems/` folders) — game, battle and world-mechanics
    systems. They define how the *game* works, not how this
    episode looks, sounds or is made. The exceptions — the ones
    that DO govern episode look, sound, format or method — were
    pulled in individually and are in the index (camera, credits
    format, opening titles, eyecatch format, environmental sound,
    scale charts, face/expression, Mochiioteca on-screen...).
  - `show/production/tooling/full-stack/` (142 documents) and the
    rest of the avatar-stack tooling tree — third-party engine
    code/docs and our own engine wiring, run records and
    evaluations. An outside generator needs the *pattern*
    documents (included), not our engine internals.
  - `show/research/` and `show/production/research/` +
    `adaptation-library/` (34 documents) — donor-show research
    notes. Their distilled results already live in the bible and
    method documents; the notes themselves carry donor identity,
    which the construction-kit law keeps out of a generation
    package.
  - `show/production/wielder/` (16 documents) — internal agent
    tooling, not production language.
  - Rig construction records (`show/production/rigs/`), staging
    lists, pull-in registers, audits, production logs and
    retrospectives — working records of how things were built or
    checked, not rules a generator follows; the rules they serve
    are in the included method documents.
  - EP01's audio `.wav` beds and animatic `.mp4` proofs are
    media, not documents — they are listed in §5 with their repo
    paths rather than copied.

**Verbatim integrity**
- Every companion file and every `style/` file in this package is
  a byte-exact copy, verified against the repo by git blob hash
  at download. The quote blocks in READ FIRST were machine-checked
  against their source documents.
