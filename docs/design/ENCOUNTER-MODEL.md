# ENCOUNTER-MODEL — dual encounters, the engagement layer, and the decided battle-style rule

**Owner design (Jamar, 2026-10-29 ~20:12–20:13 CDT):** the tall-grass
random encounter STAYS — "I like the walking around in the grass
mechanic and the random pop up, that's really fun, I want to keep
it" — AND creatures are visible roaming the overworld, in BOTH
control modes; you can act on a wild before it reaches you — "fight
them and try and fight them while you're not close to them… knock
them out and catch them before they get to you, and then when they
get to you then the battle starts."

**Amendment (owner correction, 2026-10-29 ~20:17 CDT):** the
battle-style rule is DECIDED by design, not parked as a data flag for
his retune (§5). Doro-designed under his delegation, reversible by
his word.

**Status:** BUILT (prototype scope) in `tree/`; receipts in
MODE-SWAP-SPEC §8 and §7 here.

---

## 1. Two encounter presentations, one ecology

An area's wild population exists once — the map's encounter pool —
and presents two ways at once:

- **In the grass:** the classic random roll, exactly as the engine
  has always run it (tile 6, the map's own rate, its own pool). This
  package did not modify that code path, its rate, or any pool. The
  guard is a test: `creatureMode.test.ts` asserts the seed encounter
  tables still carry their grass method + slots and live maps still
  carry their pools, and the full suite (121/121) passes over the
  untouched path.
- **In the open:** roamers — visible creatures from the SAME pool,
  walking the map's grass tiles, with temperaments, homes, and
  hearts (hit points) of their own (§3).

**The mix is area data** (`encounter-modes.json` → `areaMix`, read by
`encounterMixFor()`): `grass` (classic only), `roamer` (visible
only), `both`. Default: **`both`** wherever a map has a pool and open
ground — the owner's confirmation was BOTH, everywhere the habitat
supports it. Interiors and pool-less maps resolve to the grass model
(nothing to roam). Per-map overrides are rows in the same file.

## 2. Why both is the Pokémon answer anyway

This is how the series itself converged: BW2/HGSS grass + rustling
spots; Scarlet's full roamers *replaced* the grass roll and lost
something players loved; Arceus kept visible creatures AND let you
act before contact. The owner's instinct — keep the grass, add the
world — is the synthesis the donors point at, and it composes with
habitat-recognition: a roamer is its species' habitat class made
visible (a `small-ground` species on the meadow, a `waters-edge`
species on the bank — roamer placement reads the same vocabulary,
RECOGNITION-SPEC axes, never a second spawn logic).

## 3. Roamers

- **Population:** up to 3 per map (data), drawn from the head of the
  map's own pool, standing on its grass tiles. Same levels as the
  pool entry; an entry's stat block rides along for skirmishes.
- **Temperament (Arceus T3 — species-level, legible, acted out):**
  `timid` flees at range 4 · `docile` grazes, flees only at contact
  range · `curious` approaches slowly and hesitates · `bold`
  approaches inside 3 · `aggressive` chases inside its sight radius.
  Temperament is the roamer's *personality shown in movement* — the
  observation layer's input as much as the encounter layer's.
- **Territory:** every roamer has a home tile; it wanders ≤4 tiles,
  drifts home when the player is far, and an **Alpha** (a
  territory-holding elite individual, Arceus T3's wild-elite class)
  holds a wider sight radius and never flees — and is a *stakes*
  class for §5.
- **Heartbeat:** roamers step on a 700 ms tick (data) — the world's
  own step rhythm family (140 ms player walk ÷ the NPC wander
  cadence), PMD's step-synchrony translated: the world moves, and
  what it does while you watch is its behaviour, not an animation.
- **Presentation:** the canvas's existing wild rendering; a chasing
  wild carries the canvas's red telegraph ring (its own grammar).

## 4. The engagement layer — acting before contact

One key (binding data, default `KeyF`) acts on the nearest living
roamer within 3 tiles (data). What the act IS depends on who is
holding the controls — because the two modes have different grammars:

**Ranger mode — approach play only.** The Ranger is a person, not a
weapon (canon: the Ranger never deals damage personally — enforced
in `rangedAction()`: a strike request in ranger mode is REFUSED with
the reason spoken, never softened into a weak hit).
- **Catch attempt** — a cube thrown from range (base 30%, data).
  Caught: it's yours before it ever reached you (Scarlet/Arceus
  approach play). Missed: it is *angered* — it comes at you, and
  contact is now likely.
- **Lure / distract** — resolution shapes exist in the resolver
  (draw it closer; turn a chaser's attention) for the verb surfaces
  that will call them (Scouter/observation stack); the prototype
  binds the catch attempt to the key.

**Creature mode — your moves are real.** You ARE a creature; PMD's
field contract applies (MODE-SWAP-SPEC §3):
- **Strike** — your first known move (or Strike, the regular attack)
  resolves through the game's REAL damage math
  (`battle-math.calculateDamage`, the same function the classic
  battle uses — one math, two presentations). Outcomes: hurt it and
  it comes at you (angered, contact imminent); knock it OUT at
  range, and the KO resolves two ways —
  - **Recruited (PMD flavour):** it wakes and *follows you home* —
    joins the Garden (T11 recruitment = habitat housing), chance
    read from habitat fit × your lead's effective bond band. No
    cube. This is PMD's recruitment-by-encounter wearing our bond
    system, and Super's Connection-Orb logic in miniature: the
    graph grows by meetings.
  - **Knocked out:** it goes down in the field (fainted, not
    caught — the Scarlet outcome).
- Creatures do not throw cubes: a catch attempt in creature mode is
  refused with the reason spoken. Your tools are your body and your
  bonds.

**Contact** — a roamer steps onto your tile (or you onto it, or an
angered/chasing one arrives): the encounter escalates per §5.

## 5. THE BATTLE-STYLE RULE — DECIDED

*Logged as DORO-DESIGNED under the owner's delegation (2026-10-29
~20:17 CDT): when he says "I don't know how we'll decide," Doro
designs the remainder the way he would want it — meaning decides,
consistent with his moment law (a thing changes when the meaning
changes state). Reversible by his word; not a TBD.*

> **RANGER MODE:** wild contact = the classic turn battle (BW2/HGSS),
> always. That is the Ranger's grammar: the formal duel, party
> against wild, cubes and commands. Ranged play in Ranger mode is
> approach play only (§4).
>
> **CREATURE MODE:** wild scraps in the overworld resolve PMD-style
> in real time — move-for-move exchanges on the world heartbeat,
> through the same damage math. You are the creature; that is the
> mode's grammar. **Any fight with STAKES — a trainer, a boss, a
> dojo-class opponent, a story encounter, an Alpha/territory
> holder — ESCALATES to the classic turn battle, the formal duel.**
> The escalation is itself a marked moment (device grammar: the
> Name Bar / held beat — moment-device library), because the meaning
> of the fight changed: it stopped being a scrap and became a duel.
>
> **DUNGEONS AND CAVES:** follow the mode rule — creature =
> real-time scraps, Ranger = classic — with roamers visible in
> both. Place never overrides mode.

Implementation: `battleStyleFor(mode, place, stakes)` in
creatureMode.ts is the rule as a pure function (place is accepted so
per-encounter records can carry context; it deliberately does not
change the outcome). Per-encounter data may still RECORD context and
stakes for the engine's use — but their style values are set by this
rule. The rule is locked by tests (`creatureMode.test.ts`: the full
mode × place × stakes matrix).

| | wild | trainer / boss / dojo / story / Alpha |
|---|---|---|
| **Ranger** | classic | classic |
| **Creature** | PMD real-time skirmish | **escalates → classic** |

## 6. Owner slots in this model (complete list)

1. The swap button (MODE-SWAP-SPEC §6.1) and companion story
   overrides (§6.2) — the only input/story slots.
2. Roamer *species temperament assignments* per species and Alpha
   placement in authored encounters are canon content (species
   tables) — the system's temperament vocabulary and behaviour are
   decided here; which species is bold is his canon to table.
3. Battle style: **NOT a slot** — decided, §5.

## 7. Build receipts (prototype scope, honest fences)

- Roamers live on every pool map (one species set per map from its
  own pool; Sproutle "038" heads Route 1's pool and is the
  screenshot subject).
- Contact → classic battle runs through the engine's EXISTING
  `triggerWildBattle` — the duel is the real battle system, not a
  mock.
- Creature-mode contact with a wild runs the skirmish exchange in
  the engine tick (one exchange per contact heartbeat).
- Fences of the prototype (named, not hidden): skirmish damage
  numbers run on the pool entry's stat block through battle-math;
  party-side HP bookkeeping in skirmishes is notification-level in
  this build (the classic battle remains the ledger of record for
  party HP); recruit/catch resolutions at range are resolved and
  announced in-world — Garden housing writes and cube inventory
  writes ride their own systems' landing steps in the gap-fill
  sequence (S-order), they are not forked here.
- Tests: 20 new (rule matrix, canon refusal, temperament, recruit,
  grass-untouched guards) inside a 121/121 green suite; tsc 0.
