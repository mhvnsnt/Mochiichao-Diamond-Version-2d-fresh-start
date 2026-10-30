# COLORWAY LIBRARY — the full-palette shifts, as data

**Status:** DRAFT extension pass, **v2 — rewritten under the owner
ruling of 2026-10-28** (see §0). Machine side:
`colorway-library.json` (schema `mochiichao/colorway-library/v2`),
beside this doc in `show/production/`. This document is the design
doc and the research record; the JSON is what the composite stage
and the colour-design pass consume.

---

## 0. OWNER RULING 2026-10-28 — what changed, and why v1 was wrong

v1 of this library (same day, earlier draft) encoded the colour
shifts as LIGHTING only: environment and light moved, character
palettes were locked, under LIGHTING-SYSTEM §4's CS protocol.
That was built on an instruction to treat protected identity
colours as never-shifted.

**The owner corrected it, in substance:** in JoJo the CHARACTERS'
colours switch too during those scenes — the whole palette
shifts, characters included — and then they go back to normal.
Applying the character lock to colorways obscures the very thing
being imported, and breaks part of what the owner is writing.

**The ruling, as recorded:**

- The colour protection in LIGHTING-SYSTEM (LS-2/CS-2) governs
  **environment tint** — light falling on a character. It does
  not govern, and must not veto, **colorways**.
- The **COLORWAY system** is a full palette shift: environment
  AND character palettes shift together, hold for the beat, and
  return to normal. It is a **distinct system** from the CS
  protocol, and the two coexist: a scene can carry a lighting
  key (CS) and, on its dramatic beats, a colorway (CW), logged
  separately, neither borrowing the other's rules.
- How the shifted colours are chosen follows the researched
  JoJo method (§1) — emotion-first, decided per scene by the
  colour-design pass — not a fixed lookup table.

**Bookkeeping consequences:** v1's JSON entries described
lighting-grade shifts wearing the colorway name; they are
superseded by v2 (the CS protocol itself lives in
LIGHTING-SYSTEM §4 and loses nothing — v1 invented no CS law,
it only pointed at it). v1's owner slot OS-4 (character-fill
shift) is **closed by this ruling**: it is not an open question,
it is the system's core. The remaining owner slots are
re-scoped in §5. The JOJO-CUT-GRAMMAR's colour pairings and
POSING-SYSTEM's hold re-key were updated the same day to name
which of the two systems a given colour event belongs to.

## 1. RESEARCH — how JoJo actually decides the switch colours

Researched 2026-10-28 for this rewrite. Primary = Araki's or
Tsuda's own words in published interviews/books. Secondary =
staff listings and scene catalogues, labelled.

### 1.1 Araki's side: there is no canon colour, and that is the method

- **"JoJo does not have a fixed color."** — Araki, 25th
  Anniversary long interview, as reported in secondary coverage
  of that interview. Characters are drawn in completely
  different colours on covers than their in-text descriptions
  (a character stated to be blond appears silver-haired on a
  cover) — deliberately, because the work had no fixed colours
  to violate. **[secondary reporting of a primary interview]**
- **Feeling first, verbatim.** ANN's 2017 interview asks why he
  doesn't stick to a colour scheme for cover illustrations or
  colour pages. Araki: **"I put more emphasis on giving readers
  different feelings and impressions through different color
  combinations."** The combination is chosen for the feeling it
  produces, not for consistency with any prior combination.
  **[primary: ANN interview, 2017-06-29]**
- **Divergence in the moment is part of the method.** In
  *Manga in Theory and Practice* (his own craft book, ch. 5),
  Araki writes: "When I'm coloring, the colors can diverge from
  my original plans; I might picture something as being blue,
  but when I try adding a little gray, I think, 'I like this
  darker color!' Such happenstances might be beyond explanations
  of reason." Colour decisions are finished by felt response at
  the moment of making, and the plan is allowed to lose.
  **[primary: Manga in Theory and Practice, 2015]**
- **The tools visible inside his stated choices:**
  - *Balance across opposing sides.* JOJOVELLER (his own
    commentary): a character "ended up green" because "I wanted
    some color balance between the allies and enemies" — and,
    in the same breath, "at that time, I was really into green."
    Structure and whim, both admitted. **[primary: JOJOVELLER
    Stand Guide]**
  - *Symbolic fit to the character's impression.* JoJonium
    interview: of Hermit Purple — "Purple is a noble color, so
    I thought it was fitting for an older character." A hue is
    assigned for what it *means* about the person.
    **[primary: JoJonium special interview]**
  - *A signature pairing he trusts.* The 25th Anniversary
    interview reporting describes his "invincible color
    combination": **pink and sky blue** — a pairing he reaches
    for because it works, the closest thing to a formula he
    admits, and it is a *pairing*, not a palette.
    **[secondary reporting of a primary interview]**
  - *Deliberate impossibility.* In a 2006 published talk with
    CLAMP's Nekoi, Araki describes his JoJo method: "drawing in
    a realistic style but coloring in completely impossible
    colors." Wrongness against nature is a chosen effect, not
    an error. **[primary: published Araki×Nekoi talk, 2006]**

### 1.2 The anime side: a base palette exists so departures can read

- **Scene-specific colouring is the stated policy.** Director
  Naokatsu Tsuda (ANN, 2015): anime normally locks a colour
  setting that "can't change," while the manga has no set
  colours — "so we decided on scene-specific coloring, so that
  the 'set color' could still change depending on the specifics
  of the scene." The anime keeps a base set colour AND a licence
  to depart from it per scene. **[primary: ANN interview with
  Naokatsu Tsuda, 2015]**
- **The base palettes are Araki-approved; the shifts honour the
  readers.** At Anime Boston 2017 (paraphrased panel report),
  Tsuda said the characters' colour schemes were based on the
  Medicos palettes because those are Araki-approved, and the
  colour changes were added because (1) no other anime does
  that, and (2) every reader of the manga had imagined the
  colours differently, and he wanted to include that feeling.
  **[primary-adjacent: director's panel answers, paraphrased by
  the JoJo wiki's interview archive]**
- **Who executes it:** the colour-design seat (色彩設計) owns a
  production's palettes, base and variant alike — for this
  series, credited to Mariko Murata (season 1) and Yūko Satō
  (seasons 2–5). Palette variants for dramatic scenes are
  colour-design work done under the director's policy, i.e. a
  named person's per-scene decision, not an automatic filter.
  **[secondary: staff credits as catalogued]**
- **The observed shift grammar** (from scene catalogues and
  adaptation coverage): shifts land **suddenly, on the beat,
  and totally** — sky, ground, clothes, hair, skin-adjacent
  tones all move together ("whenever things get real, the sky
  turns purple and the grass turns pink" is the folk summary of
  a real, consistent practice). World-rule breaks get the
  strongest transform in the kit: for the time-stop, the '90s
  OVA spreads a circle that **inverts the colours, then fades
  back to normal**; the 2015 TV version opens with a **flash of
  negative colour, then holds greyscale** while time is
  stopped. **[secondary: TV Tropes' Colour-Coded Timestop
  catalogue + adaptation coverage]**
- **Return to normal is structural, not negotiated:** a shift
  belongs to its scene/beat. When the beat ends, the base set
  colours resume — in the TV grammar, snapped back on the cut;
  where the effect itself dissolves (the OVA time-stop), the
  colours fade back with it. No shifted palette persists into
  the next scene's base. **[secondary, from the same
  catalogues; consistent with Tsuda's "set color" framing —
  the set colour is what a scene returns TO]**

### 1.3 The honest finding

**There is no lookup table, and inventing one would falsify the
import.** The method, as documented, is:

1. A base palette exists (approved, consistent) so that a
   departure *reads* as a departure.
2. At a dramatic beat, the colour decision is made **per scene,
   feeling first**: name what the beat must feel like; choose
   the combination that gives that feeling.
3. The choosing uses a small kit of relationship moves —
   balance across opposing sides, symbolic fit, a trusted
   signature pairing, deliberate impossibility/inversion for
   world-rule breaks — applied with judgement, and the plan is
   allowed to lose to a better felt combination in the moment.
4. The shift is total (characters included) and sudden; it
   holds for the beat; then the base palette returns, snapped
   on the cut (or fading only where the effect itself
   dissolves).

§2 encodes exactly that: a decision procedure, a transform kit,
and named recipes that are worked examples of the procedure —
not exemptions from it.

## 2. THE SYSTEM AS ENCODED

### 2.1 The decision procedure (the colour-design pass, per beat)

1. **Name the beat and its feeling** in one line (the beat
   types are CW-B1..B6, §2.2). If the feeling can't be named,
   there is no colorway — decoration is not a beat.
2. **Apply the kit** (§2.3): pick the relationship move(s) the
   feeling calls for — unify, oppose, surge, invert, pair,
   mute, wrong-note.
3. **Decide per character, against their own anchors** (§2.4):
   every present character's slots are transformed by the
   move; nobody is tinted by accident and nobody is exempt.
   The decision is a person's (the colour-design pass), made
   at scene design time — the chosen palettes are then
   **recorded in the JSON-side production log for that scene**
   (actual values chosen), so a shift is data once decided,
   and repeatable.
4. **Readability gate (house law):** in the shifted state,
   silhouettes and values must still read — who is who, by
   shape and accent-placement, at a glance. A shift that
   erases identity fails; a shift that *argues* with identity
   (the wrong-note recipe) keeps every other anchor steady so
   the one wrong note is legible as wrong.
5. **Set the hold and the return** (§2.5) before the scene is
   boarded. A colorway with no named return is not boarded.

### 2.2 Beat types (the CW trigger grammar — this system's own)

- **CW-B1 Menace registers** — dread arrives and is felt.
- **CW-B2 Opposition locks in** — two sides become the scene's
  structure.
- **CW-B3 Power ignites** — an ability/effort surges in one
  character.
- **CW-B4 Emotion peaks or turns** — joy, grief, resolve,
  tenderness at full strength.
- **CW-B5 The world breaks** — a rule of the world is violated
  on screen (the time-stop class).
- **CW-B6 The wrong thing is revealed** — a reveal whose
  content is impossibility or wrongness.

These are palette-event beats. They are **not** CS-3 triggers
and do not borrow CS-3's authority: CS-3 governs lighting
shifts, this grammar governs colorways, per the §0 ruling.
The same story moment may fire both systems (a reveal can
re-key the light AND shift the palette); each is logged under
its own system.

### 2.3 The transform kit (relationship moves, not palettes)

- `unify_to_field` — every palette (environment + characters)
  pulled toward one field hue family; accents hold longest.
- `oppose_poles` — the frame's two sides take complementary
  poles; each character's dominant moves to their side's pole
  relationship (complement of the opposing anchor).
- `surge_self` — one character's palette surges (saturation
  and value up; dominant pushes toward its own accent family
  or white-hot); all other palettes step back (desaturate/
  darken one step) to cede the frame.
- `invert_world` — global inversion: hues rotate to their
  complements and values invert; ink holds. Reserved for
  CW-B5.
- `signature_pair` — field and characters re-paired around a
  trusted two-colour pairing chosen from the cast's own
  anchors (the method's pink+sky-blue move, in our colours —
  a pairing, never a copied palette).
- `mute_all` — global desaturation and cooling; accents mute
  last (identity lingers after the world greys).
- `wrong_note` — exactly one element (a character, or one slot
  of one character) shifts; everything else holds base. The
  eye is meant to find it.

### 2.4 Character anchors (base set palettes; COLOR-SYSTEM)

Shifts are expressed as transforms over each character's own
four slots (COLOR-SYSTEM §spec; ink `#101010` shared and held
under every transform except where a recipe says otherwise).
Measured anchors on record: Mochii dominant `#50b0f0`, accent
= clear-drop shine (a value accent); Dorowani dominant
`#30b0d0`, belly/support `#d0f0f0`, deep/shadow `#3070b0`,
accent `#a03436` (fin cheeks + eyes); Gabu dominant teal,
support sea-green, accent = warm shell-belly note; Kittember
dominant black, support charcoal, accents gold eyes + orange
tail-tip flame; Sproutle dominant mint, support leaf green,
accent blue visor; Wispkin body black, support grey smoke,
mask white (its accent is a VALUE). Slots without a measured
hex in the record stay named slots from the locked chart —
the colour-design pass samples the chart, never invents
( COLOR-SYSTEM sampling rule).

**Wispkin's mask, stated once and plainly:** the mask-white
lock is an LS-2 *tint* rule and binds lighting. Under a
colorway the mask is a palette slot like any other and CAN
shift — that is what "characters included" means. Recipes
that keep the mask white do so as a *choice with a reason*
(the wrong-note recipe inverts this: the mask is the note).

**House guardrail — the red reserve (bookkeeping, ours, not
JoJo's):** COLOR-SYSTEM licenses `#a03436` narrowly (Dorowani's
accent, alerts/wrongness, Rule burn-in). Inside a declared
colorway, transforms may pass through any hue, but no
character's shifted dominant may *settle* inside the red
reserve zone except Dorowani's own accent family — red must
keep meaning Dorowani-or-wrongness in this show, colorway or
not. This guardrail is house canon discipline recorded here;
it constrains settling, never movement.

### 2.5 Hold and return grammar

- **Hold:** a colorway holds for its beat's full duration —
  a pose hold's frames, a confrontation's exchange, a scene
  segment. It never flickers mid-beat; a new shift state
  requires a new beat (a re-trigger under §2.2).
- **Return — default:** SNAP BACK on the cut that ends the
  beat. Base set palettes resume exactly, on the first frame
  of the next cut. No ramp, no residue.
- **Return — dissolve exception:** only where the effect
  itself dissolves (CW-B5 world-breaks; CW-B4 grief where the
  resolution IS the scene's action) may the restore fade —
  ≤6f for a world-break release, or a within-scene gradual
  restore for grief, named at board time.
- **No leakage:** a shifted palette never persists into the
  next scene's base state. Base is the world's default; the
  shift is a visited state.

### 2.6 The recipes (worked examples of the procedure)

The JSON carries seven recipes — `cw2-menace-field`,
`cw2-opposition-clash`, `cw2-ignition-surge`,
`cw2-world-break`, `cw2-emotion-bloom`, `cw2-wrong-note`,
`cw2-grief-mute` — each with its beat types, the kit moves it
applies, per-character transform expressions for the pilot
six, its hold, and its return. A recipe is a *precedent*: a
new beat may run the procedure fresh and log a new palette
set without becoming a recipe. Recipes earn their place by
being reused.

## 3. TWO SYSTEMS, ONE SCENE — bookkeeping

| | CS protocol (LIGHTING-SYSTEM §4) | Colorway system (this doc) |
|---|---|---|
| What moves | Light: keys, rims, atmosphere, shadow colour, grade of the *light* | Palettes: environment AND characters, as colour design |
| Characters | Held — fills never re-hued by light (LS-2) | Shifted — that is the device |
| Decided by | Lighting sheet (§8.1), CS-3 closed triggers | Colour-design pass, CW-B1..B6 beat grammar, §2.1 procedure |
| Return | CS-6 release to base key | Snap back on the ending cut (§2.5) |
| Enforcement | Composite overlays (LS-7) / OCIO looks | Per-scene palette sets (paint-stage data) / OCIO looks |

A tint is light behaving; a colorway is the world re-decided.
If a colour event can be removed by deleting an overlay, it
was lighting. If it has to be repainted, it was a colorway.

## 4. Enforcement

- **Today:** palette sets are paint/composite-stage data —
  per-scene variant palettes for the puppet lane's cutouts and
  plates, applied for the beat's frame range on the xsheet
  (the xsheet notes `CW:<recipe-or-procedure id>` in the cut's
  colour line; the decided values live in the scene's
  colour-design record).
- **Eventual:** the house OpenColorIO config (Omniverse-cluster
  lane) carries colorways as named looks for plate/FX layers;
  character palette sets remain paint data (a look cannot
  repaint a character's slots individually — the honest split
  is recorded here rather than promised away).

## 5. OWNER SLOTS — still open (re-scoped after the ruling)

- **OS-1 — Comedy colorway.** The researched beat grammar is
  dramatic; JoJo's shifts serve tension/elation/dread. A gag
  palette punch is not in the documented grammar — owner's
  call whether comedy may fire CW beats.
- **OS-2 — Flashback base palettes.** A flashback's *base*
  palette differing from the present-day base is a scene-base
  decision, not an in-scene shift; the house already pairs
  style shift with time shift in principle (ENVIRONMENT-AND-
  CAMERA §6). Whether flashbacks take standing alternate base
  sets remains the owner's call.
- **OS-3 — TK-6 bond colourway.** TK-6 is RESERVED in
  LIGHTING-SYSTEM §5; if its world-dimming ever wants a
  palette partner, that pairing is the owner's.
- **OS-5 — Arc-level re-skin.** JoJo re-skins its world per
  Part; house locations hold fixed colour scripts
  (COLOR-SYSTEM §d). Re-skinning a location for an arc is an
  identity decision, not a shift.
- **Closed by the 2026-10-28 ruling:** character-fill shifts
  (v1's OS-4) — now the core of this system.

*Draft status: v2 for owner review. Where this doc and
LIGHTING-SYSTEM disagree about LIGHTING, LIGHTING-SYSTEM
governs; about COLORWAYS, this doc governs under the §0
ruling, and LIGHTING-SYSTEM's addendum of the same date
records the boundary from its side.*
