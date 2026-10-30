# PLACE CHARGE — what a place *is*

**Status:** extension to the fate package (workspace, 2026-10-28).
Owner direction, same day, in his words' substance: *the
Forest can also bless and reward — in a scary, paranormal,
mysterious way; the luck there can feel stronger than
anywhere else in the game. And other places — in Region 1
and throughout the other regions — can feel cursed, or
lucky, or haunted, or blessed: an almost ontological,
existence-level quality that places carry.* The word he was
reaching for, confirmed by him the same day, is
**existential** — so the system's own name for the quality
is a place's **EXISTENTIAL CHARGE**. **Numinous** is
accepted alongside it as the register descriptor (his word
on the explanation: it "definitely also explains it
better") — the numinous is how a charged place *feels*:
presence, awe, and dread in the ground itself, what the old
vocabulary called a *genius loci*, a place's own spirit.
Both words are **production-layer vocabulary only**. In-world,
nobody says *existential* or *numinous*: people say a place
is **blessed**, or **haunted**, or **cursed**, or **lucky** —
the way people have always said it, without machinery.
Machine form: `fates-placecharge-fragment.json`
(`mochiichao/place-charge/v1`). New values are DRAFT; new
owner calls are in OWNER-SLOTS.md (items 41–48); nothing
here re-founds a landed system and no charge is assigned
to any canon place by this package.

---

## What charge is — and what it is not

The package now holds three different ways the world
answers the player, and charge is none of them:

- **WORLD-MEMORY.md** is the *people* system: holders
  remember deeds, weigh them by acceptance profile, and
  treat the doer by what they hold. Memory is about **you**.
- **WILD-MEMORY-ECOLOGY.md** is the *population* system:
  tallies, pressure, migration. Ecology is about **who
  lives there**.
- **DREAD-OVERLAY.md** is the Forest's *perception* system:
  what the Forest does to how its own ground is reached
  and read. The overlay is about **one place's answer**.

**Charge is about the place itself** — what a place *is*,
at the level of existence, before and after any Ranger
crosses it. A charged place was charged before the player
arrived; it stays charged after they leave; it reads the
same for a kind Ranger and a cruel one. Charge holds no
deeds, keeps no books, forms no opinion. It is not a
morality aura worn by a location, and it is never *about*
the player — the player is simply *in* it, the way you are
in weather. That is what makes it existential rather than
reputational: WORLD-MEMORY asks *what does this place's
people remember of you?* Charge asks *what is this place?*

A place can hold both kinds of record at once, in
different homes, doing different jobs: a town whose people
remember your cruelty (world memory) inside a town that
has been quietly lucky for a hundred years (charge). The
seam between the two is drafted once, below, and flagged.

## The charge model

Every place — area, town, or site, in its own place data
(#7's area records, #102's derivation) — may carry a
**charge record** (fragment: `chargeRecord`):

- **`baseCharge` — what the place IS.** A state from the
  closed vocabulary below, at a strength band. Base charge
  is canon data, like the place's name: set by the owner
  or by story, stored in the place's own record, and
  **never rewritten by any system** — not by deeds, not by
  ecology, not by this layer. Only the owner's word or a
  story event he rules can found or change one (§5).
- **`currentCharge` — what the place reads as now.**
  **Derived, never stored as an edited field**: the base
  charge as drifted by the long-arc inputs of §5, recomputed
  at read. Drift can deepen or soften the base charge's
  *strength* within drafted caps. **Drift can never flip
  the state**: no accumulation of player action turns a
  blessed place cursed, a haunted place lucky, or any
  state into any other. A flip is a story-scale fact, and
  story events that could flip or found a charge are owner
  slots (§6), never system outputs.
- **Strength bands** (DRAFT): `faint` (a lean — a tendency
  a visitor might name after a week) / `settled` (the
  place's known character — locals have a word for it) /
  `deep` (the place's defining fact — the reason stories
  start there) — and past the top, the drafted band
  **`peak`**: maximum, the region the Dark Forest's read
  occupies (§4) and the legendary-site class is defined
  at (§6). (Band name DRAFT, item 48.)

**The state vocabulary** (closed; the owner's words):

| State | What it means in the ground |
|---|---|
| **BLESSED** | A presence that shelters. The place leans toward keeping what enters it. |
| **LUCKY** | Fortune leans in. Things go uncannily right here — no presence implied, just the lean. |
| **HAUNTED** | The past pressing in. What happened here has not finished happening. |
| **CURSED** | Fortune leans away, and something in the lean feels *meant*. Things go uncannily wrong. |
| **UNMARKED** | The default. No lean the world answers to. Most ground is unmarked. |

**Charge is FELT, never itemised** — the same discipline
as the Forest's tallies in DREAD §0a. There is no charge
meter, no tally display, no UI label, no Mochiioteca line
that reads out a place's state or band. The player learns
a place's charge the way people actually learn it: by
being there, by what keeps happening, by what the locals
say in ordinary words. Charge effects are **seeded**
(place ref + world beat + derivation version) —
reproducible and testable, never pure RNG: the same place,
in the same world state, leans the same way.

**The acceptance test (the owner's, from firsthand
play).** He has played every Pokémon game, and his
confirmation of this whole pattern is experiential: those
small sets of locations feel *magical even in a handheld
game* — in his words, "I can feel the magic coming out of
this setting." That is recorded here as the system's
acceptance test, binding on any build: **a charged place
succeeds when the player FEELS the magic — the presence,
the lean — and never when a meter shows it.** A charge
implementation that reads correctly in the data and is
not felt in the hands has failed the test, however clean
its numbers are; a place the player *feels* before they
can say why has passed it. The test is why the discipline
above exists: the feeling is the deliverable, and a meter
would spend it.

## Effects — fortune and presence (all drafted)

Charge does two kinds of work, and no third kind. Both
stay at the level of **fortune and perception**: charge
never deals damage, never imposes a condition, never
blocks the critical path, never takes or grants an item,
and never writes the resolution of a battle or a capture
attempt. It colours *circumstances* — never outcomes a
system has already been given to decide.

**Fortune-side** — the texture of chance inside the
place's existing machinery:

- **Encounter fortune.** Within the *effective* table —
  the read the overlays have already derived (#7/#52,
  ecology overlay, Forest mediation) — fortune biases
  which stocked slot a meeting *feels* like: the calm one
  steps out first in a lucky place; in a cursed place, the
  meeting that starts wrong-footed. Fortune reads the
  effective table; it never writes it, never adds a row,
  never stocks a species, never changes a rate the tables
  own. It leans on *which* of the already-possible things
  the moment becomes — the near-miss, the hesitation, the
  one that was already turning away.
- **Finds and coincidences.** A find at the grass edge
  (from the area's own find data), a door held open by the
  wind, the storm that breaks as you reach shelter, the
  timely arrival the records scheduled — lucky; and in a
  cursed place the reverse texture: the path gone muddy,
  the light failing early, the small wrong thing at the
  wrong moment. Misfortune is *texture*, never theft or
  harm: items are not lost, deadlines are not failed,
  nobody is hurt by luck. (The DREAD §6 fairness floor is
  the template; this layer adopts it whole.)

**Presence-side** — the phenomena register, by state:

- **HAUNTED — the past pressing in.** Sounds of things
  that happened there, at the edge of hearing; a shape
  that resolves into nothing; a stretch of ground where an
  old event's *shape* repeats faintly — the feeling of a
  door that has been slammed a thousand times. Phenomena
  only: never a creature, never a ghost-individual, never
  encounterable, approachable, or a capture target —
  the same fence the Malakor register's eyes live under
  (DREAD §3), applied to every charged place.
- **BLESSED — a presence that shelters.** Rest reads
  deeper (the *presentation* of rest; landed rest systems
  own their numbers and charge changes none of them),
  weather spares the clearing, the wounded settle, dread
  thins at the edges. A blessed place does not make
  anything *safe* in the mechanical sense — it makes
  shelter *felt*, which is a different and older thing.
- **CURSED** carries a presence read too — a wrongness
  that leans, attention that feels returned without a
  returner — and **LUCKY** mostly does not: luck is the
  lean without the watcher, which is part of what makes
  a merely-lucky place gentler than a blessed one. The
  matrix is drafted data (fragment: `effects`), tuned per
  place class at landing.

## The Forest — the extreme case

**The Dark Forest is the most numinous place in the
world.** Its existential charge reads past the top of the
strength scale, and it is unique in the world's data in
one respect: **it is the only ground where the deepest
dread and the strongest luck in the game coexist.** The
Forest's charge is drafted as a **dual read** — the
haunted pole at its deepest (what stopped moving; the
Unseen layer; the Malakor register) and the blessing pole
at the game's ceiling (the owner's words: the luck there
can feel stronger than anywhere else). The exact encoding
of the dual read is an owner slot (item 41) — that the
Forest holds both, at the extremes, is the owner's
direction, not a slot.

**Forest blessings arrive through the mediation.** The
Forest has no direct answers; §0a's modes — delayed,
partial, layer-split, warped completion, bent kindness —
govern *every* response there, blessing included. A
Forest blessing is **bent kindness bent toward the player,
hugely**: a loop-back that returns you to exactly the
clearing you needed; a rewiring that puts the door in
your path; the one changed detail being the detail that
saves you; a migration that completes somewhere
impossible — with the thing you had lost, or spared,
standing in it. At first it is **indistinguishable from a
haunting** — that is not a flaw in the read, it is the
owner's register: scary, paranormal, mysterious. The
blessing does not announce itself, carries no marker, and
is never explained afterwards, by anyone, including the
game.

The fences ride along, unchanged: blessings **never make
the Forest safe** (DREAD §5 stands — resonance governs how
close the Forest leans, and good acts steady the surface
at most, briefly); the blessing never steadies the
depths; **the Forest's charge is base charge** — canon,
not drift: deeds done in the Forest feed the §0a tallies
and the §5 resonance read, never a charge drift, because
in the Forest the player does not move what the place is.
The Forest decides what a push meant; it does not let a
push rewrite it. And charge, like everything else in this
package, never touches the depths table (§7).

## Drift — how current charge moves (drafted, capped)

Current charge drifts from exactly two inputs, both
long-arc by construction:

1. **Story events.** Long-arc world events in their landed
   homes (the world-state producer's event record, story
   flags) may deepen, soften, found, or — only where the
   owner has ruled the event — flip a charge. The machinery
   accepts such events as data; **none are instanced by
   this package**, and which events carry this power is an
   owner slot (item 44).
2. **Accumulated deeds in the place.** #269's deed rows
   carry where an act happened; aggregated over a drafted
   long window (seasons, not days — DRAFT values, item 43),
   a place's accumulated valence may move its current
   strength **one band per window at most**, toward the
   valence's pole — a route where a Ranger keeps rescuing
   slowly reads luckier; a hall of repeated cruelties
   slowly reads worse. The cap is absolute in both
   directions: deed drift **deepens or softens, never
   flips, and never founds** a settled or deep charge on
   unmarked ground. On UNMARKED ground, deed accumulation
   may raise at most a *faint* current lean, and faint
   leans decay (below). Everything past that is a story
   fact, and story facts are the owner's.

**Decay.** Deed-driven drift is weather; base charge is
climate. Drift decays back toward the base read over
drafted windows without reinforcement — places forgive
slower than people (WORLD-MEMORY's floors are the rhyme),
but drift that nothing feeds is drift that fades. Story-
event changes do not decay; they are the new fact until
another story fact answers them.

Charge reads and writes **no ecology data**: it does not
consume pressure tallies and does not produce them. (The
Forest's tallies are DREAD §0a's business; elsewhere, a
place can be ecologically wounded and existentially
blessed at once, and the two systems will not pretend
otherwise.) A succeeded or wounded area's *feel* may be
cited by the show as colour — a read, never an input.

## Legendary sites — the peak-charge class

One class of place stands at the top of the whole system,
and it is inherited, not invented. **A legendary site is
a place whose existential charge sits at maximum — the
`peak` band — and is BOUND to a one-time event**: a
singular encounter, a singular item, a rite. The charge
is the place's standing fact; the binding is what makes
it a legendary site rather than merely a deeply charged
one. The event is stored where events live (the
world-state producer's event record, story flags) — the
charge record does not hold it, repeat it, or re-arm it.

**The lineage is the Pokémon base, and the doc says so
plainly** (the owner's Pokémon-base rule: fill gaps the
way Pokémon does it). The base games' sacred and special
places — the Spear Pillar / Bell Tower / Distortion World
/ Mt. Pyre class — are exactly this pattern: a place whose
existential feeling *is* the design, bound to the singular
thing that waits or happened there. Pokémon's legendaries
are never table spawns and never farmable; they are
one-time events at charged ground. This archetype keeps
that shape exactly, recoded in this canon's terms.

The same lineage holds the **HAUNTED archetype**:
Lavender Town's Pokémon Tower, and the unidentified ghost
in it — a presence the game refuses to let you identify
*or engage* until you carry the Silph Scope, resolving at
last as the Marowak mother's restless spirit. The Tower
is not a legendary site; it is the haunted pole of the
same pattern — a place whose charge is a presence, felt
long before it is understood.

**Design note (drafted).** Haunted charge means
*presence first, identity later or never*: what presses
in is met as presence — unidentifiable, unengageable, on
the place's terms — and whether it ever resolves into a
someone is a story fact, not a system output. And the
*means of seeing* — a scope, a rite, a carried thing —
is itself part of the place's grammar: the Tower's ghost
is not hidden behind an item check, the scope is how
that place permits itself to be read. The rhyme with the
Forest's Seen/Unseen layers (DREAD §1) is real, and the
difference is law: the Forest's flips stay **unmarked and
ungated** — no scope, key, or carried thing opens the
Unseen layer, and nothing there resolves into a someone.
The item-gated read belongs to haunted places that carry
it in their own grammar; it is not copied into the
Forest.

- **One time, ever.** The event happens once. Afterwards
  the place's charge **remains** — a legendary site does
  not empty out or go ordinary because its event is
  spent — but the event never repeats: no respawn, no
  re-roll, no second item, no rite re-performed for a
  second outcome. There is nothing at a spent legendary
  site to farm; there is only the place, still itself.
- **Never a spawn row.** The singular encounter is an
  *event*, not an encounter-table entry: it is on no
  table, at no rate, in no area — the depths fence's
  discipline generalised. A landing that puts a legendary
  on a spawn table has broken the archetype, not
  implemented it.
- **Mechanics ride charge.** A legendary site founds no
  mechanics of its own: its phenomena are presence-side
  effects at maximum, its fortune is the fortune-side lean
  at maximum, and where the site's own system mediates (a
  Forest-class site), it mediates per DREAD §0a. The
  fairness floor still binds — maximum charge is still
  fortune/perception level; **the event is the singular
  content, not a charge payout**.

**The class ships empty of instances.** No Mochiichao
legendary site, legendary creature, singular item, or
rite is invented, named, or implied by this package —
they are canon, and canon is the owner's (item 48). And
one naming discipline, stated before it can blur: **the
Dark Forest is named in this file only as the
charge-extreme the owner ruled** (§4). It sits in the
same `peak` region — it is **not** classified as a
legendary site, and nothing here makes it one, unless
the owner says so himself.

## The seam with world memory (one paragraph, flagged)

**FLAGGED — drafted, one paragraph, owner slot (item
45).** WORLD-MEMORY stays the people system and charge
stays the place system, and the two touch at exactly one
 drafted joint: *where* a deed happened may colour how it
is remembered. A memory record's strength at birth (and
its gossip spread, WORLD-MEMORY's channels) may read one
band stronger when the act happened in a charged place —
a cruelty done on blessed ground is remembered *harder*
by everyone who saw it, because the place itself seemed
to object; a kindness in a cursed place travels further
because it was unlikely there. The deed, its valence, and
its weight never change; only the memory's grip is
coloured by the ground it happened on. If the owner
severs the seam, the systems never touch at all, and
nothing else in either layer notices.

## Spread and instancing

The machinery is **region-blind**: charge is specified
for places in every region on the same terms. **Instancing
follows the standing boundary (List 4's): R1 only.** R2–5
charges are the owner's wholesale (item 42), with the
design lane.

**No canon place is assigned a charge by this package.**
Which places carry which base charge is the owner's call
(item 41). The fragment carries a short list of **DRAFT
suggestions** (`draftSuggestions`) — each clearly flagged,
each grounded in a cited canon fact, none an assignment:

- **The Dark Forest** — the dual extreme (above). This
  one stands on the owner's own direction; only its data
  encoding is drafted.
- **The Cave of Echoes** — haunted-leaning. Grounding:
  its canon record ("dark, but not empty… bring
  Illuminate, and bring patience") and its nature — a
  place whose whole fact is that sound stays in it.
- **Aeon Spire** — blessed-leaning. Grounding: its canon
  seat as the Bright garden — the world's own vocabulary
  already leans it toward shelter.
- **Mainframe Gardens** — blessed-leaning. Grounding:
  Rule 12 — "Everything in the garden belongs to
  somebody… And everybody belongs to the Garden" — a
  belonging that holds people is the blessed register in
  the Garden's own words.

Suggestions are a starting grid for his pass, nothing
more; un-picked suggestions found nothing.

## The fences that do not move

- **The depths:** the Dark Forest depths spawn table
  stays **EMPTY BY LAW (0 rows)**, and charge never
  touches it — no charge effect manifests in the depths
  as population, encounter, or presence-with-a-target.
  The Forest's blessing works on the surface's reads
  like everything else the Forest does; down there,
  nothing is stocked, blessed or otherwise.
- **Tables:** canon spawn tables are never edited by this
  layer. Charge effects ride the same **read-time overlay
  discipline** as ecology's pressure overlay — derived at
  read, traced to their inputs, never stored into a table.
- **Conservation:** charge never explains the Forest, the
  Secret, or **what stopped moving**. A haunted place's
  past pressing in is texture, never evidence: no
  phenomenon in this layer answers, hints at an answer
  to, or retires an arc question (List 9's law; DREAD §7
  carries the Forest's seat of it).
- **Phenomena:** never creatures, encounters, species,
  spawn rows, or capture targets — in any charged place,
  under any state. A presence is not a person and is
  never statted, named in-world, or explained.
- **Vocabulary:** *existential charge*, *numinous*, and
  *genius loci* are production terms. They appear in no
  in-world text, no UI string, no sign, no Mochiioteca
  entry (the wayfinding LEAK RULE's discipline, applied
  to this layer's words). In-world, places are blessed,
  haunted, cursed, or lucky, and that is all anyone says.
- **No new canon:** this layer founds no place, person,
  event, or charge. It specifies the machinery over the
  places canon already holds and assigns none of them a
  state.

## Show lane

Charge is **casting language**: a charged place is lit,
sounded, and staged by its state — a blessed place held
warm with one source that never quite accounts for
itself; a haunted place lit with one source too many; a
lucky place where the timely arrival is not a writer's
convenience but a beat the records scheduled. The
Forest's seats are the landed keys "Refusal" and "No
Key" (DREAD §3); other charged places take their reads
from this layer's register at staging time. Numinous
vocabulary is never spoken on screen, no character
theorises a place's charge, and #314's spectacle fence
binds the whole lane: the charge is *staged*, never
explained — the audience should leave a blessed place
unable to say why they felt held, and a haunted one
unable to say what they heard.

## Coverage — honest

- **Architecture: fully specified** over landed homes —
  #7/#102 place data (charge record seat), #269 deed rows
  (place-carrying), the world-state producer's event
  record (story-event input), #7/#52 encounter generation
  over effective tables (fortune read), DREAD §0a/§5 (the
  Forest's mediation and resonance), #84 roster binding,
  #314's fence, WORLD-MEMORY's spread machinery (the one
  flagged seam). The legendary-site archetype is the
  Pokémon base's sacred-site pattern, cited as lineage,
  not imported as content.
- **Contents: zero charges instanced or assigned, zero
  legendary sites instanced.** Every state assignment to
  a canon place is the owner's (items 41–42); the
  legendary-site class ships empty (item 48); every
  threshold, window, cap, and effect value is DRAFT and
  listed in OWNER-SLOTS.md (items 41–48).

## Files touched by this extension

- `PLACE-CHARGE.md` — this file.
- `fates-placecharge-fragment.json` — the machine form
  (validates as JSON; vocabularies closed as named).
- `DREAD-OVERLAY.md` — cross-link at §0a (Forest blessings
  arrive through the mediation this layer names) + files
  list entry.
- `WORLD-MEMORY.md` — the seam paragraph at its seat.
- `README.md` — cross-link section + file list.
- `OWNER-SLOTS.md` — items 41–47 added.
