# MOCHII UI DIALECT — the Syndicate register (a reserved UI dialect over the Pokémon base)

**What this is.** A UI *dialect*: a second, reserved presentation
register that lives on top of Mochiichao's Pokémon-base UI and is
spent, by law, almost only by one power — the Syndicate, and the
man displayed to the player only as **"Mysterious Figure"**: Luigi
Castagnoli, 8th dojo leader, whose dojo seat is the cover and
whose Syndicate seat is the real one (canon: `REGION1_LEAGUE_
BATTLES`, Dojo 8, badge #8 — display resolves to the mysterious-
figure string until the `luigi_revealed` flag; Jax is his decoy).
Built from the Persona 5 teardown beside this doc
(`PERSONA5-UI-TEARDOWN.md`, DOCS/DATA-grade — Persona 5 has no
public code; the grammar is what transfers, never the art).

**The owner's usage law, which this spec exists to enforce.**
The register is **reserved**. Luigi / the Mysterious Figure and
the Syndicate use it most often and most fully. Everywhere else it
appears **sparingly** — at high points and interaction points,
dialogue presentation included — and it **builds up** toward him
across Region 1. And presence-first applies to the UI itself:
**fragments of the dialect appear before Luigi is ever
identified.** A player should feel that *someone's* interface
keeps touching the game long before they can name whose it is.
The style is a presence before it is a person.

**Relation to #331.** List 34's #331 (Persona bond ranks +
calendar engine) is this dialect's twin and is **extended, never
contradicted**: #331 built the machinery (rank as a derived read;
the calendar engine) and deliberately left the presentation layer
open ("the game shows ranks on people the way Persona does, as
UI"). This spec is that presentation layer — for bond ranks, for
the calendar's day-arrivals, and for every other surface the
reservation rules admit. #331's fences stand untouched: ranks are
never stored, never hung on a Mochi, never buy battle effects; the
calendar engine owns no year and this dialect invents none.

---

## 1. The two registers

| | **Base register** (the Pokémon base) | **Syndicate register** (this dialect) |
|---|---|---|
| Whose it is | The world's everyday surface — every Ranger, every town | The Syndicate's territory; the Mysterious Figure's hand |
| Composition | Orthogonal panels, rounded, calm | Slanted shards and panels, hard diagonals, torn edges |
| Colour | The game's standing palette | Near-black + white + **one** saturated accent (see §2.2 — the accent colour itself is an owner slot) |
| Typography | The game's standing faces | Collage behaviour: mixed weights/cases/rotations on *labels and splashes only* (never body text — readability is law) |
| Motion | Standing transitions | Snap, slide, and pulse; panels arrive at angles and settle; nothing eases politely |
| Sound-adjacent beats | Standing UI cues | UI events land on a beat (a shard *hits*); silence before a full-dialect screen is a sanctioned move |
| Where it runs | ~All ordinary play | Per the reservation rules in §3 — a minority of surfaces, by design |

The base register is not "the boring one." It is the world's
normal — the dialect only reads as an intrusion because the base
register is consistent everywhere else. **Any proposal that puts
dialect styling on ordinary play is a defect against this spec**,
the same class as a spawn-table edit in the ecology layer.

## 2. Composition rules (the dialect's grammar)

Distilled from the teardown (§§1–7 there); each rule is written
for Mochiichao's own TypeScript/CSS stack and Mochiichao's own art.

1. **Slant is the signature.** Panels, tags, bars, and splashes in
   the dialect sit on hard diagonals (one dominant slant family
   per screen; a second, opposed slant is reserved for a second
   speaker/power in split compositions). An orthogonal dialect
   screen is off-register.
2. **One accent colour, rationed.** The dialect runs black /
   white / one accent. Sub-colours are forbidden inside dialect
   surfaces **except** functional HP/MP-class readouts carried
   over from the base UI (Persona's own exception, kept). When
   emphasis is needed and colour can't be spent, use **guide
   lines and contrast**, not a new colour (CEDEC rule).
3. **Information lives on the white side.** In any dialect
   composition, the load-bearing information (numbers, names,
   choices) sits in the mainly-white zone; the black/accent zones
   carry pose, mood, and punctuation. (CEDEC rule, adopted whole.)
4. **Posed figures inhabit full screens.** Where the dialect takes
   a full screen (Class A surfaces, §3), a posed character render
   occupies the frame and *changes pose with the selection* where
   the surface is a menu — the surface is performed, not just
   displayed. Figure art is Mochiichao canon art, posed through
   the same pose-capture discipline the teardown documents
   (layout first, pose second, frame-checked).
5. **Typography performs on labels only.** Splash words, section
   titles, and name tags may use collage treatment (mixed weight,
   case, rotation, cut-letter feel — drawn with Mochiichao's own
   locked faces, Bungee/Fredoka per the identity kit; no Atlus
   fonts, no ransom-note assets). Body text, stats, and dialogue
   lines stay in the standing readable face. The dialect shouts
   its *headlines* and speaks its *sentences* plainly.
6. **Punctuation vocabulary.** A small, fixed glyph set — shard,
   burst, star-class marks drawn in Mochiichao's own style —
   punctuates ranks, results, and reveals everywhere the dialect
   runs, so a fragment is recognisable from one glyph. (The exact
   glyph set is production art, not canon; it ships as data,
   §5.)
7. **Dialogue treatment.** In dialect scenes: speakers enter as
   portrait busts in slanted panels, name in a shard tag; opposed
   speakers take opposed slants (panel-split conversation). A
   **cut-in** — close art in a slanted frame — is the dialogue
   system's reserved emphasis move, spendable only at Class A/B
   beats (§3), never in ordinary conversation. Choices present as
   tilted shards. Where a speaker is *unidentified*, the tag
   carries the display string canon gives ("Mysterious Figure") —
   the dialect never leaks a hidden name, and its portrait slot
   for an unidentified speaker is silhouette/shard, not a face:
   presence without identity, in the UI's own grammar.
8. **Transitions are hits, not fades.** Dialect surfaces enter by
   snap/slide on a beat and exit by cut or reverse-snap. Day
   boundaries and reveals may *hold* a splash (see §4) — a held
   poster frame is a sanctioned dialect move; a slow dissolve is
   not.
9. **The calendar arrives in dialect splashes — when it may.**
   #331's engine owns the day; this dialect owns how a day
   *arrives* on surfaces the reservation rules admit (Class B
   story days; Class A always). A dialect day-splash is a big-
   numeral title card in the register. Ordinary days arrive in
   the base register. (Engine contents — the year itself — remain
   #331's owner/canon slot; a splash style is not a calendar.)

## 3. Reservation rules (who may use it, and how much)

Surfaces are classed; the class caps the dialect dose. Doses are
**data** (`persona-dialect-fragment.json`), so a landing can be
audited against them.

- **CLASS A — FULL DIALECT (the Syndicate's own surfaces).**
  Anything that is the Mysterious Figure's or the Syndicate's in
  fiction: his dialogue scenes, Syndicate encounters and
  communications, Dojo 8 / Veil City's seat surfaces, the Luigi
  reveal sequence, Syndicate shops/fronts *when the fiction says
  the mask is off*, his battle presentation (the 8th-dojo battle
  is a Class A surface — the one dojo fight in Region 1 fought
  inside someone else's interface). Full grammar: slants, accent,
  posed figures, cut-ins, splashes, collage headlines.
- **CLASS B — HIGH-POINT FRAGMENTS (the world's peaks).** Story
  high points and major interaction points *not* owned by the
  Syndicate: region-pivotal dialogue beats, legendary-site class
  events (place-charge peak class), Elite/Champion-tier staging,
  bond-rank threshold scenes (#331's scene slots — the rank-up
  ceremony is a Class B surface by default), festival/climax
  staging. Dose cap: **fragments only** — a subset of the grammar
  (slant + one glyph family + at most one of {cut-in, splash,
  collage headline} per surface), over an otherwise base-register
  screen. A Class B surface that reads as Class A is over-dosed.
- **CLASS C — TRACES (the build-up; see §4).** Pre-reveal,
  unattributed intrusions: a shard-tag on an otherwise ordinary
  dialogue, a slanted transition where a straight one belongs, a
  glyph in a results screen, a phone/message surface that arrives
  in the dialect for one conversation and is never explained.
  Class C doses are single-element, deniable, and **never
  attributed in-fiction** — no character remarks on them. They are
  the UI's equivalent of a Frost trace: evidence a presence
  passed here.
- **CLASS D — BASE ONLY (ordinary play).** Everything else:
  ordinary dialogue, ordinary battles, ordinary shops, menus,
  HUD, garden surfaces. **Zero dialect.** This class is the
  majority of the game and is what makes A–C legible.
- **JAX — THE DECOY'S SHARE.** Jax, the decoy, gets a **lesser,
  derivative share**: Class B fragments in his own scenes, but
  with a defined *wrongness* the art lane can execute — his
  fragments imitate the dialect one degree off (the opposed slant
  family; the accent desaturated a step; poses that quote Class A
  compositions without completing them). In-fiction read: a man
  wearing someone else's style. Whether that wrongness is ever
  *called out* in story is an owner slot (§6); the visual rule
  ships regardless, because the build-up curve needs the player
  to be able to learn — without being told — that Jax's version
  isn't the source.
- **The reveal changes the dose, not the register.** After
  `luigi_revealed`, Class A surfaces may carry his name and face;
  the grammar does not change. The dialect was never a disguise
  the UI wore — it was his territory the whole time, and the
  reveal only signs it.

## 4. The build-up curve (Region 1, presence → identity)

Drafted as data bands in the fragment; the curve is the owner's
"build up to that" made auditable. Bands are keyed to **story
position**, never to play time.

| Band | Story position (R1) | Permitted classes | Shape of the dose |
|---|---|---|---|
| **B0 — Clean** | Opening through the first dojo | D only | No dialect anywhere. The base register establishes the world's normal. |
| **B1 — First traces** | Early-mid R1 (post first dojo, before the Syndicate is named in story) | D + rare C | A handful of Class C traces across the whole band — single elements, unattributed, deniable. |
| **B2 — A pattern** | Mid R1 (Syndicate named as an organisation; Jax encountered) | D + C + B (Syndicate-adjacent only) + Jax's lesser share | Traces recur near Syndicate business; Jax's off-register imitation appears; Class B fragments only where the Syndicate's hand is in the fiction. |
| **B3 — The territory** | Late R1 (Veil City approach, Dojo 8) | All classes; A unlocked at the seat | Class A surfaces at the Syndicate's own places; the density of C/B rises toward the seat; the reveal signs the register. |
| **B4 — After the reveal** | Post-Dojo-8 R1 and beyond (R2–5 by analogy) | All classes, per-surface fiction test | Class A follows the Syndicate wherever it operates; the rest of the world keeps B/C discipline — the dialect does **not** become the game's default skin after its owner is known. |

Two curve laws: **(1) No regression of mystery.** A later band
never explains an earlier trace; traces stay deniable even after
the reveal (the player connects them; the game doesn't).
**(2) The curve is a ceiling, not a quota.** Bands cap what *may*
appear; nothing must be spent to fill a band. A quiet band is
lawful; an over-dosed band is a defect.

## 5. As data (what ships beside this doc)

`persona-dialect-fragment.json` (`mochiichao/ui-dialect/v1`)
carries: the class table (A/B/C/D + Jax share) with dose caps;
the build-up bands B0–B4 keyed to story-position keys; the
composition constants that are safe to fix now (slant families,
white-side information rule, sub-colour exception) with the
accent colour and glyph set left as **named nulls** (owner/art
slots, §6); the #331 seats (bond-rank ceremony = Class B default;
calendar day-arrival splashes = Class B/A surfaces); and the show
-lane mapping (§7). Validation rules ride in the fragment: a
surface record naming Class A without a Syndicate-fiction key
fails; a Class B record spending more than its fragment budget
fails; a Class D record naming any dialect element fails.

## 6. Owner slots (invented nothing — these are Jamar's calls)

1. **The accent colour.** The dialect's one saturated accent
   (Persona's lesson is that the colour *is* the identity). Any
   hue is buildable; the choice is canon, not design.
2. **Luigi's reveal specifics** — where, when, and in what scene
   `luigi_revealed` flips, and what the reveal sequence itself
   stages. This spec supplies the register the reveal will wear,
   and nothing about its story.
3. **Whether Jax's wrongness is ever named in-fiction** — a
   character noticing the imitation, or the game never saying it.
4. **Class B eligibility list per region** beyond the defaults in
   §3 — which story beats count as high points is a story call.
5. **The Syndicate's name in UI text** — whether dialect surfaces
   may print an organisation name/mark before the reveal, or
   stay anonymous shards until signed. (Default in the fragment:
   anonymous until reveal.)
6. **Bond-rank display** (carried from #331's open slot): whether
   any pair's rank shows a *number* in dialect ceremony screens,
   or rank is always staged without numerals.
7. **Show-side dose** — how much of the dialect the *show* may
   spend in episodes not featuring Luigi (see §7); the game-side
   curve does not automatically bind the show.

## 7. Show-lane notes

The show has no UI — but it has *presentation*, and the dialect
translates: at episode high points, dialogue staging may borrow
the dialect's grammar in camera/composition terms (opposed-slant
panel-split framings in split-screen beats, cut-in close-ups as
the reserved emphasis move, shard-shaped transition cards,
held poster frames at reveals). Luigi/Syndicate episodes stage
in the full register (Class A by analogy); other episodes spend
fragments (Class B by analogy) and traces (Class C — an
unexplained shard transition in an early episode is the show's
Frost trace). The **Chibi Card System caps still apply** — the
dialect does not exempt any card from its budget, and chibi
surfaces never carry the dialect (the register is menace and
polish; chibi is neither). Episode-level dose calls stay with
the episode's own gate; this spec supplies the grammar and the
reservation, not episode approvals.

## 8. Wiring notes (real-code law — verified against main's full tree listing, 21,199 paths, saved 2026-10-28)

*Correction history, kept in the open: this section was first
written with two paths "verified" through a flaky per-file API
that later contradicted itself. The version below rests only on
the saved full-tree listing of main plus files actually read.
Where a path is named, it is in that listing; where a file's
contents weren't read, that is said.*

The game's live layer is TypeScript/TSX (`src/lib/`,
`src/components/`), and — better than this spec dared hope —
**most of the seats it needs already exist as named systems**:

- **Dialogue seat (paths verified).** Dialogue is data + a
  wiring layer: `src/lib/wiring/dialogue/region1-dialogue.json`
  (with per-region siblings and `region1-truck-start.json` /
  `.ink`), driven by `src/lib/wiring/dialogue-ink.ts`, with
  speaker display resolution in **`src/lib/dialogueAttribution.
  ts`** and an existing validator, **`src/lib/wiring/validate-
  dialogue.ts`** (plus `tests/dialogue-attribution-region1.
  test.ts`). The dialect's seat: a `register`/`dialectClass`
  key on scene/line records in the wiring dialogue JSONs,
  resolved alongside attribution in `dialogueAttribution.ts`,
  and this fragment's rules added to the `validate-dialogue.ts`
  pattern — validation infrastructure for exactly this already
  exists; the dialect extends it, it does not invent it. Two
  corroborations in the same listing: `src/lib/personaDialogue.
  ts` — a Persona-dialogue module already exists in the live
  layer by that name (contents not read in this pass; flagged
  as the first file landing should read) — and a whole menu-
  customisation family around the skin seat (`menuSkins.ts`,
  `menuCustom.ts`, `mainMenuSymbols.ts`, `dayNightMenuVariants.
  ts`). NOT
  claimed: that any main-branch dialogue file already contains
  a "Mysterious Figure" speaker (that scene file exists in lane
  working copies; its contents on main were not verified).
- **Theme/token seat (verified).** The game already skins its
  menus: **`src/lib/menuSkins.css`** beside
  `src/assets/ui/mochiichao-ui.css`, with UI-art code at
  `src/lib/uiArt.ts` / `src/components/game/UiArt.tsx`. The
  Syndicate register lands as a named skin/token set in
  `menuSkins.css` keyed by the data field — a sibling skin, not
  a fork of the base UI. (That "menu skins" already exist as a
  codebase concept is the strongest wiring fact in this spec.)
- **Surface components (verified present on main, all TSX).**
  `src/components/game/DialogueBox.tsx` (dialogue surface),
  `src/components/game/MenuList.tsx` + `TitleStartScreen.tsx`
  (menu/title surfaces), `src/components/SaveMenu.tsx`, and the
  battle surfaces `src/components/views/BattleView.tsx` /
  `ArenaBattleView.tsx` + `src/components/game/PixiBattle
  Canvas.tsx` (the Class A 8th-dojo battle seat lives in this
  family). Implementation keys rendering off the data field
  above.
- **League / reveal seat (canon verified; live home partly
  open).** The canon facts (Dojo 8; leader `luigi-castagnoli`;
  display `"Mysterious Figure"` until `luigi_revealed`;
  Syndicate Seat / Dojo of the Veil, Veil City) were read this
  session from the canon league data, and main carries the
  canon doc `docs/human-characters/luigi-dojo8-identity-check-
  2026-10-27.md` (existence verified; contents not re-read in
  this pass). On main, league data verifies at the canonical
  **`src/data/core/docs/league-fragment.json`** with the dojo
  circuit at `src/data/core/encounters/region1-dojo-circuit.
  json`. The working-copy paths (`src/data/league/region1.
  json`, `src/data/core/league.json`) do **not** exist on main,
  and neither does any `src/lib/wiring/league/` home — **the
  live league read that a reveal flag would wire into remains
  a landing locate-task**, with `league-fragment.json` as the
  canonical source of truth until then. This spec does not
  pretend otherwise.
- **Map corroboration.** `src/lib/wiring/maps/luigi_mansion.json`
  exists on main — Castagnoli-associated map wiring is already a
  named thing in the live layer (noted as a seat candidate for
  Class A staging; its contents were not read in this pass, so
  no claim is made about them).

Implementation shape, all grounded above: (a) `register` field
on dialogue/surface data → (b) a named skin in `menuSkins.css`
+ tokens in `mochiichao-ui.css` → (c) fragment validation in
the `validate-dialogue.ts` pattern at content-build time. No
new engine. If landing finds a seat that cannot key off data
fields, that gap gets reported, not papered over.

**Cross-links.** #331 bond ranks + calendar engine (this spec is
its presentation layer; the calendar's day-arrival is flagged in
§2.9 as a natural dialect seat) · place-charge legendary-site
class (Class B default seat for peak-charge events) · moral-
choices four-slot fate prompt (a Class A/B dialogue surface
candidate at Syndicate/post-battle beats — the prompt's grammar
is unchanged; only its staging register is in scope here) ·
DREAD-OVERLAY (the Forest's Unseen register and the Syndicate
register are different presences and must never share a palette
or a glyph — two territories, two skins).

---

*Package: `~/workspace/mochiichao-show/persona-ui-teardown/` —
this spec + `PERSONA5-UI-TEARDOWN.md` + `persona-dialect-
fragment.json` (`mochiichao/ui-dialect/v1`, validated). All dose
values DRAFT. Story facts invented: none.*
