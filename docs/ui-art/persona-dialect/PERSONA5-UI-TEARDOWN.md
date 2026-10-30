# PERSONA 5 UI TEARDOWN — the manga register, deciphered (DOCS/DATA grade)

**Grading, stated plainly first.** Persona 5 has **no public source
code and no decompilation project**. Nothing in this teardown comes
from Persona 5's code, and no Persona 5 game files, ROMs, ISOs, or
extracted assets were touched, downloaded, or studied. Everything
below is **DOCS/DATA-grade**: Atlus's own published design talk
(CEDEC+KYUSHU 2017, via Famitsu, reported by Siliconera), published
UX/design breakdowns, and the Persona modding community's public
documentation of the *formats and tools around* the game. Where a
claim rests on one source, the source is named. The construction-kit
rule governs throughout: what Mochiichao takes is the **design
grammar** — composition, colour discipline, transition behaviour,
production method — never Atlus's art, fonts, text, characters, or
branding. The Mochiichao dialect built from this teardown is
specified in `MOCHII-UI-DIALECT.md` beside this doc.

**What Persona 5's UI is, in one paragraph.** A full-screen,
high-contrast manga register laid over an RPG: near-black, white,
and exactly one saturated main colour (red), composed in slanted
panels and shards, animated at all times, with the protagonist's
posed figure *inside* the menus. Atlus's stated job for it (CEDEC):
the UI must convey information **and** convey the identity of the
game — it is marketing and interface in the same surface. That dual
job is the whole lesson for Mochiichao: a UI dialect can be a
*presence* — a place/person's territory rendered as interface —
before it is ever a person's name.

---

## 1. Main / pause menu architecture

- **Full-screen takeover.** The pause menu is not a window over the
  game; it replaces the screen. A posed 3D render of the protagonist
  occupies the frame, and the menu list rides on top of a churning
  background of angular shapes, halftone, and star motifs.
- **The character poses per selection.** Moving the cursor changes
  the protagonist's pose to match the chosen section (party members
  appear back-to-back with him in the party screens) — the menu is
  *performed* by the cast, not just displayed. (Mechanics of Magic
  breakdown; CEDEC confirms the pose pipeline below.)
- **Production method (CEDEC, Atlus's own account).** Layouts were
  designed in Photoshop; a motion designer posed the 3D model and
  captured poses into a purpose-built tool that rendered the shot
  as 2D menu art. Menu UI and battle UI had **separate designers**;
  the battle designer passed specs to the programmer and they
  checked the result **frame by frame together**. Texture data was
  authored as **path (vector) data** so it survived the PS3/PS4
  resolution split — i.e., the register is resolution-independent
  by construction: angles and shards, not bitmaps.
- **Selection language.** The hovered item scales up and takes a
  colour splash against the red/black/white field; the currently
  relevant information is always placed on the mainly-white side of
  the composition (CEDEC). Nothing in the menu is still: panels
  pulse, slide, and snap with a beat.

## 2. The composition language (the "manga panel" grammar)

- **One main colour, rationed sub-colour.** Each Persona game picks
  a single identity colour (P3 blue, P4 yellow, P5 red). P5 went
  further: **no sub-colours at all except inside HP/MP elements**,
  to keep the red distinctive (CEDEC). Guidance when colour can't
  be spent: **central guide lines** draw the player's gaze, and
  **angle and contrast changes** mark context shifts instead of new
  colours.
- **Slant as default.** Panels, bars, tags, and text blocks sit at
  aggressive diagonals; orthogonal UI reads as "not this register."
  Jagged, torn edges and halftone dot fields carry the punk-collage
  / photocopied-poster texture.
- **Ransom-note typography.** Headlines and menu labels mix fonts,
  weights, and rotations like cut-out magazine letters — typography
  as collage, never a single clean face. (Multiple breakdowns;
  the punk-collage lineage is explicit in the readmedium analysis.)
- **Stars and shards.** A small set of recurring glyphs (stars,
  bursts, angular shards) punctuates ranks, results, and emphasis —
  a vocabulary of punctuation marks the whole game shares.

## 3. Dialogue presentation

- **Portrait busts in angular panels.** Speakers appear as large
  portrait art sliding into slanted speech panels; the speaker's
  name rides in a shard tag. The panel split lets two speakers
  occupy opposed diagonals — conversation staged as a manga page,
  panels leaning against each other.
- **Cut-ins at beats.** Dramatic lines trigger close-up cut-in art
  (face/eyes filling a slanted frame) — the dialogue system has a
  reserved *emphasis move* it spends only at high points.
- **Command bubbles in battle read like manga bubbles.** Battle
  actions ring the acting character the way action/speech bubbles
  sit on a manga page (Siliconera UI overview) — dialogue grammar
  and battle grammar are the same grammar.
- **The phone.** In-game messaging is skinned as a real chat app —
  a familiar surface dropped inside the register — used for
  exposition, invitations, and confidant logistics. The register
  bends to quote a real-world UI rather than forcing the real-world
  UI into the register.
- **Choices as shards.** Player choices present as tilted option
  shards, not a neutral list — even a two-option prompt keeps the
  composition language.

## 4. Battle UI

- **The command ring.** On a character's turn, commands (attack,
  Persona/skill, gun, item, guard) arrange around the character
  model itself — the character is the menu's hub, not a corner box.
- **HP as theme.** Enemy health drains from heart-shaped/themed
  gauges — even a lifebar is on-register (GameFAQs design thread
  documents the heart-drain read).
- **Set-piece finishes.** All-Out Attacks end on a full-screen
  finishing-touch screen: the acting character's cut-in art plus a
  stylised quote line, held as a poster frame before results.
- **Results as a burst.** Post-battle results explode across star/
  shard compositions; level-ups and rank events get the same
  punctuation vocabulary as the menus.

## 5. Confidant / social overlays

- **Rank-up is a ceremony screen.** A confidant rank increase gets
  its own splash: star-burst composition, the new rank displayed
  as an event, not a toast notification. The bond system (#331's
  twin) presents its thresholds the way battles present finishes —
  social progress is staged, not logged. This is the presentation
  layer #331 deliberately left open ("the game shows ranks on
  people the way Persona does, as UI").
- **The confidant list is a card index.** Relationships are browsed
  as composed card panels in the register — the social graph wears
  the same clothes as the battle UI.

## 6. Calendar / day-transition screens

- **The date is a HUD citizen.** Date and time-of-day phase sit in
  the screen corner at all times, weekday colour-coded; time phase
  is a named segment, not a clock number.
- **Day changes are splashes, not fades.** Crossing a day boundary
  throws a full date splash — big stylised numerals, the new day
  announced as a title card. The calendar is *shown arriving*,
  which is what makes a year feel lived rather than counted.
  (This is the presentation seat waiting on #331's calendar
  engine: the engine deliberately owns no year; the dialect
  supplies how a day *arrives* once contents exist.)

## 7. Shops and system overlays

- **Every vendor keeps the register.** Shops re-skin content
  (catalogues, stock) but never leave the composition language —
  the register is the world's, not one screen's.
- **The counter-register exists too.** The Velvet Room runs a
  deliberate second dialect — deep blue, calm, symmetrical — for a
  second power's territory. Persona itself proves the reservation
  principle this package builds on: **a reserved register reads as
  someone's domain.** Mochiichao's Syndicate register is built to
  that same read.

## Sources (all DOCS-grade, consulted 2026-10-28)

- Atlus CEDEC+KYUSHU 2017 UI talk, via Famitsu, reported by
  Siliconera ("Atlus Reveals The Design Secrets Behind Persona 5's
  Distinctive UI") — colour rationing, guide lines, white-side
  information rule, Photoshop→pose-tool production pipeline,
  frame-by-frame battle UI checking, vector path data.
- Siliconera, "What Makes the UI and Menus in Persona Games So
  Good?" — battle command ring as manga bubbles; register
  consistency across menus.
- Medium (ousiadroid), "Persona 5's Interaction Design" —
  ransom-note typography, halftone silhouettes, pulsing angular
  panels, tooltip/cue-card layering.
- Mechanics of Magic, "Visual Design of Games: Persona 5" — pause
  menu selection behaviour (scale + colour splash), per-section
  character posing, party back-to-back composition.
- Sakurai's Famitsu column #515 ("The Aims of UI"), via Source
  Gaming — portraits + models in constant stylish motion as the
  UI's distinguishing act.
- readmedium, "Can Persona 5's UI be Justified by its Style?" —
  punk-collage / ransom-letter lineage of the register.

---

## 8. Tooling inventory — what's actually in hand, and what isn't

**In hand (reference library, verified 2026-10-28):**

| Tool | What it actually is | Licence | Coverage — stated exactly |
|---|---|---|---|
| **Atlus-Script-Tools** (`TGEnigma/Atlus-Script-Tools`; local copy at `~/workspace/reference-library/Atlus-Script-Tools/`, git HEAD `05483fe`, ~15 MB) | C# compiler/decompiler for Atlus **script formats**: flow scripts (`.bf`) and message scripts (`.bmd`, `.bm2`) | **GPL-3.0** (LICENSE.txt in the local copy) | Its README's supported-games list **includes Persona 5 and Persona 5 Royal** (with P3/P3FES/P3P/P3R, P4/P4G, Catherine, Raidou, Persona Q). It also carries a `Mods/Persona 5` folder and P5 command-table scripts. **What it covers is dialogue/event scripting — the text-and-flow layer that dialogue presentation runs on. It does NOT cover menu/UI rendering, textures, or models, and this package claims no UI coverage for it.** Its value to Mochiichao is method, not assets: how a production dialogue system separates message scripts from flow scripts is a working reference for our own DialogueService-shaped systems. |
| **AtlusFileSystemLibrary** (`TGEnigma/AtlusFileSystemLibrary`; pulled shallow into `~/workspace/reference-library/AtlusFileSystemLibrary/` during this pass, ~0.5 MB) | Library + `PackTools` (PakPack) for Atlus archive formats (`.pac`/`.spr` pack/unpack) | **GPL-2.0** (LICENSE in the clone; GitHub licence API agrees) | Archive plumbing for the same script-era formats. Study/reference only — Mochiichao has no Atlus archives to unpack; pulled because it is tiny, licence-clean, and completes the script-toolchain picture beside Atlus-Script-Tools. |

**Surveyed, licence-verified at source, NOT pulled (with reasons):**

| Tool | Licence (GitHub licence API, 2026-10-28) | Why not pulled |
|---|---|---|
| **Aemulus Package Manager** (`TekkaGB/AemulusModManager`, GPL-3.0) | GPL-3.0 | A mod *merger/loader front-end* for playing modded copies of P4G/P5/P5R. It manages game files we do not have and may not take; it teaches packaging workflow, which the shrinefox guides already document at DOCS grade. Recorded, not staged. |
| **Reloaded II** (`Reloaded-Project/Reloaded-II`, GPL-3.0) | GPL-3.0 | A universal .NET mod-loading framework (~92 MB repo) whose function is injecting mods into a running commercial game. No production use for Mochiichao and too large to stage as a reading copy under the staging law; its architecture is documented publicly. Recorded, not staged. |
| **CriPakTools** (`esperknight/CriPakTools`) | **No licence file** (GitHub licence API: none) | CPK archive extraction for commercial game files. No licence = all-rights-reserved handling: not pulled, not used.Also functionally moot — no CPK files exist in this project. |
| **Amicitia editor** (`ShrineFox/Amicitia`) | **No licence file** | A format editor for Persona game files (~23 MB). No licence = not pulled. Its sibling documentation (shrinefox.com guides; the amicitia wiki tradition) is the DOCS-grade source this teardown actually uses. |

**The honest summary of the tooling position.** The Persona
teardown's real yield is *documentation and one script toolchain*:
Atlus-Script-Tools (in hand, GPL-3.0, genuinely covers P5/P5R
**script** formats) plus the modding community's published guides.
There is no Persona 5 code to pull, no UI source to study, and no
lawful asset route — and the dialect spec next door is written so
it needs none of those: it is a design grammar implemented in
Mochiichao's own TypeScript/CSS stack, informed by published design
material, owing Atlus nothing but the idea that a register can be
reserved for a power.
