# MOVEMENT TEARDOWN — how the Pokémon games make creatures walk around and fight

Owner order, 2026-10-28: tear down the movement systems — followers,
visible overworld encounters, battle motion — from the actual games,
and build Mochiichao's native system on those foundations
(`docs/MOCHII-MOVEMENT-SYSTEM.md` + `src/data/core/movement.json`).

**Evidence grades used throughout.** `CODE` = read in a held decomp
source tree in the local study archive (`~/workspace/pokemon-code-study/`).
`DATA` = read in held structured data/schemas (pkNX family). `DOCS` =
design/documentation level: the mechanism as the shipped games present
it and public documentation describes it, no held code read. `PARTIAL`
= a project is held but the relevant internals are not yet extracted
in it. Study material is reference only (licence NONE /
all-rights-reserved handling); nothing below copies code, data, names
or text from any game — mechanisms and shapes only.

---

## 1. Followers — a party creature walking behind the player

### 1.1 Yellow (1998) — the origin — `CODE`

Held: `pret-pokeyellow`, `engine/pikachu/` is a dedicated follower
engine for the one follower species: `pikachu_follow.asm` (1,580
lines), `pikachu_movement.asm`, `pikachu_emotions.asm`.

- **Spawn gating** (`ShouldPikachuSpawn`): the follower appears only
  if the starter is alive in the party, the player is on foot
  (`wWalkBikeSurfState == 0` — no follower while cycling or surfing),
  and neither of two hide-flag bits is set.
- **The trail is a command buffer.** The player's movement commands
  are recorded into `wPikachuFollowCommandBuffer`; the follower
  consumes commands off the buffer, and does not start moving until
  at least **two** steps are buffered
  (`AreThereAtLeastTwoStepsInPikachuFollowCommandBuffer`) — a built-in
  one-step lag, so it replays the player's path one tile behind.
- **Warp discipline:** on spawn/warp the buffer is cleared and the
  follower is re-placed relative to the player's facing
  (`CalculatePikachuPlacementCoords` — a small spawn-state machine:
  right of / below / above the player).
- **Reactions are a separate subsystem** (`pikachu_emotions.asm`)
  keyed to the follower's happiness value — talking to the follower
  reads its emotional state, not a generic line.

### 1.2 HeartGold/SoulSilver (2009) — the universal system — `CODE`

The owner's chosen foundation game. Held: `pret-pokeheartgold`.
Engine: `src/follow_mon.c` (2,019 lines) + `src/save_follow_mon.c`;
data: `files/fielddata/tsurepoke/tp_param.csv` (per-species follower
parameters) and the species→overworld-model lookup tables in
`follow_mon.c`.

- **Who follows:** the lead party individual — the first *alive*
  non-egg party member if any is alive, else the first non-egg
  (`FollowMon_InitMapObject`, `FollowMon_ChangeMon`; re-evaluated
  whenever the party changes). Any species can follow; the follower
  is that specific individual (its form, gender and shiny flag are
  read off the record and carried onto the field object).
- **The follower is a full field object,** created programmatically
  (`FollowMon_CreateMapObject`): object id `obj_partner_poke`,
  movement type `0x30`, script `std_following_mon` (id 9700),
  unlimited roam range (−1, −1), a keep-alive flag so it is never
  culled like a scenery NPC. Field systems treat it as a first-class
  actor — the photo mode, headbutt trees and rock-smash all reference
  it directly.
- **Per-species parameters are data** (`tp_param.csv`, one row per
  species/form): a size byte (read by
  `FollowMon_GetSizeParamBySpecies`), a `too_tall` flag, a `hover`
  flag (flying/levitating species are rendered offset from the
  ground), plus gendered-form rows. Presentation differences are
  table rows, not code branches.
- **Permission is species × place.** Every map header carries a
  follow mode — `MAP_FOLLOWMODE_ALLOW`, `MAP_FOLLOWMODE_HEIGHT_RESTRICT`
  (species whose size byte is set are recalled), `MAP_FOLLOWMODE_PREVENT`
  (`FollowMon_GetPermissionBySpeciesAndMap`). On top of the general
  rule sits a **named exception list in code**: Diglett and Dugtrio
  are barred from every Bell Tower floor (`FollowMon_DiglettPermissionCheck`).
  Exceptions are enumerated cases, not a rule engine.
- **Traversal states hide and restore it.** When the player cycles or
  surfs, the follower is recalled/hidden (the save block's follower
  state byte is set to 2 and the recall routine runs); on foot it is
  restored (state 1). The save block (`SaveFollowMon`) persists the
  current map id and an **inhibit flag** by which scripts can suspend
  following.
- **Map transitions re-check permission.** The field overlay
  (`src/unk_02055BF0.c`) re-tests species×map permission on entering
  a map; a follower that is not permitted on the new map despawns
  instead of following the player in.
- **Mood is a real per-individual value.** `FieldSystemUnkSub108`
  wraps a mood stored *on the Pokémon's own record* (`MON_DATA_MOOD`,
  signed byte, **−127..127**). It resets to 0 when a new
  (species, personality) pair becomes the follower; scripts add to it
  (a dedicated script command calls `FieldSystem_UnkSub108_AddMonMood`);
  and it **drifts one step toward neutral** per tick
  (`FieldSystem_UnkSub108_MoveMoodTowardsNeutral`). Talking to the
  follower runs its script, which reads mood and place context to
  pick a reaction. (Mechanism `CODE`; the reaction text/animation
  tables themselves are script data — `DATA`.)
- **Scripts choreograph it like any actor.** Dedicated script
  commands pause/unpause the follower
  (`ScrCmd_ToggleFollowingPokemonMovement`), apply a movement route
  to it (`ScrCmd_FollowingPokemonMovement`), wait for it, and place
  it relative to the player (`ScrCmd_605`). The Bell Tower script
  choreographs the follower mid-scene on the climb (study archive
  GAP-FILL map D10/D14).
- **Honest gap:** the per-frame step-replay update behind movement
  type `0x30` lives in field-overlay code whose functions are still
  address-named (`ov01_02203AB4` and kin) in the held snapshot. The
  trail *discipline* — command replay with a one-step buffer — is
  `CODE`-verified in Yellow and consistent with HGSS's object setup,
  but HGSS's own stepping function grades `PARTIAL` in the held tree.

### 1.3 Let's Go Pikachu/Eevee (2018) — the variant — `DOCS`

Held: `raulzrrs/letsgo-recomp` — a static recompilation; no lifted
gameplay code at this HEAD, so mechanics grade `DOCS`.

- Two-tier following: the partner rides with the player (hat/shoulder),
  and **any one party Pokémon follows on foot** in the HGSS pattern.
- Large followers are **rideable**: mounting changes the player's
  traversal speed and movement mode — the follower doubles as a
  vehicle state, extending HGSS's hide-on-vehicle rule into
  *become* the vehicle.
- The follower interacts with the world (it finds items while
  strolling) — reactions extended from talk-to into ambient events.

---

## 2. Visible overworld encounters — creatures already there

### 2.0 The baseline being replaced — `CODE`

In the sprite-era games (verified in `pret-pokeheartgold`
`src/field/encounter_check.c` + `files/fielddata/encountdata/gs_enc_data.json`)
encounters are invisible: each step in an encounter zone rolls
against the area's slot table. Every visible-encounter system below
keeps **the same slot tables** and changes only *when the creature
materialises*: at a place, ahead of contact, instead of at a dice
roll after contact.

### 2.1 Let's Go (2018) — `DOCS`

Wild Pokémon spawn visibly around the player from the area table,
wander short loops, and despawn by distance/time. Contact (either
direction) opens the catch screen — wild encounters are capture
scenes, not battles. Rare/shiny states are visible in the field
before contact, so the player can choose engagements.

### 2.2 Sword/Shield (2019) — `DATA` + `DOCS`

- Tables: structured encounter archives for SwSh are held in the
  pkNX structures layer (`DATA`) — the slot-table shape survives
  unchanged into the visible era.
- Lifecycle (`DOCS`): two spawn classes share the world — **symbol
  encounters** (visible models on wander paths; an exclamation mark
  when one notices the player; bold ones charge, timid ones flee)
  and hidden rustle encounters. Awareness is a state the player can
  read and play around (crouching/whistling interact with it).

### 2.3 Legends: Arceus (2022) — `DATA` (schema read) + `DOCS`

Held: `kwsch-pkNX`, `FlatBuffers/Arceus/.../Field/Slots/EncounterDataArchive.fbs`
— the visible-encounter slot schema, read directly:

- Each slot carries, beside species/level machinery: `BaseProbability`
  (spawn weighting), level overrides, an **Eligibility** trait block
  (condition type/id — time, weather and story gates), an **Oybn**
  trait block, per-slot IV/effort values and a fixed moveset — the
  slot generates a specific *kind* of individual, not just a species.
- **Behaviour is authored per slot on two axes: `Behavior1` and
  `Behavior2` (both required strings).** The roaming creature's
  disposition is data on its spawn record, not a species constant.
- A sibling archive (`EncounterMultiplerArchive`) scales populations
  (the mass-outbreak mechanism) without editing slot tables.

Lifecycle (`DOCS`): spawn → idle/graze at its place → **awareness**
(an indicator fills as it notices the player) → disposition resolves
by its behaviour assignment — docile creatures flee, wary ones watch
and keep distance, aggressive ones attack **the player character**
(who can dodge, be staggered, and black out) → engagement happens
*in the same space*: throw a ball from stealth (back-strike bonus),
or send out a partner and the battle stages where everyone stands.

### 2.4 Scarlet/Violet (2022) — `DOCS`

Fully open roaming: creatures spawn in habitat clusters, idle, graze
and wander with per-species temperaments (small ones scatter, some
approach, territorial ones posture); contact starts a battle **in
place**, in the world space, with no arena transition. The lead
Pokémon can also be sent out to walk and battle autonomously
(the "Let's Go!" auto-battle mode) — follower and battler are the
same field object, closing the loop with §1.

---

## 3. Battle motion — creatures that move and make contact

### 3.1 The sprite-era grammar — `CODE`

Held: `pret-pokeemerald` `src/battle_anim_*.c` (per-type animation
script files) and `pret-pokeheartgold` `src/battle/`
(`battle_command.c` — an ordered command queue, `BtlCmd_*`).

- The battler sprite **never leaves its spot**. All motion is the
  animation-script layer: timed cue scripts that translate, scale,
  flash and shake *effect sprites* over the battlers; the battler
  itself gets at most whole-sprite nudges (entrance slide-in —
  `BtlCmd_PokemonSlideIn` — a recoil shake, a faint sink).
- Presentation is strictly queued: announcement → animation →
  damage → status, drained in order from one message/effect queue.
  (This is the skeleton the native BATTLE-UI-FLOW already adopts.)

### 3.2 The 3D console era — Colosseum / XD / Battle Revolution — `PARTIAL` + `DOCS`

Held: `TeamOrre/xd-decomp` (matching decomp, early — 206 source
files, no assets), `TeamOrre/colosseum-decomp` (skeleton at this
HEAD), `pret/pokerevo` (disassembly; sparse named sources). Battle-
motion internals are **not yet extracted** in any held tree, so the
grammar below grades `DOCS` — it is how the shipped games stage
fights, stated as design fact, not read from their code.

- Full 3D models share one arena floor. **Contact-class moves are
  locomotion**: the attacker leaves its position, runs/flies to the
  target, strikes on the contact frame, and returns to its position.
  **Ranged-class moves keep position**: the effect/projectile
  travels instead. The move's class decides which body performs the
  travel — this split is the era's core staging grammar.
- Reactions are bodily: flinch recoil, collapse-and-recall-beam
  faints; entrances are throws onto marked positions. The camera
  cuts per beat (wide for locomotion, close for impact).

### 3.3 Mainline 3D (XY → SwSh → SV) — `DOCS`

Held code is not load-bearing here (`charlieduzstuf/pokesword` is a
matching decomp at 0.67% byte-weighted coverage; its field sources
are stubs) — `DOCS` throughout. The console grammar carries over:
idle = in-place breathing/sway loops; contact moves trigger approach
performances (most literal in SV, where the battle happens in the
world space and the approach is real locomotion across it); ranged
moves hold position. SwSh stages battles in visible arenas; SV
removes the transition entirely — battle staging and overworld
movement become one spatial system.

### 3.4 The grammar, synthesised

Five staging classes cover every era:

| class | what the body does | eras |
|---|---|---|
| `entrance` | arrive onto a marked position (throw/slide/materialise) | all |
| `idle` | hold position with a living loop (static → bob → breath/sway) | all |
| `approach_contact` | travel to the target, strike, return | 3D eras; sprite era fakes it with effect layers |
| `ranged_stay` | hold position; the effect travels | all |
| `reaction_exit` | flinch/recoil, faint collapse + recall | all |

The native system (`docs/MOCHII-MOVEMENT-SYSTEM.md` §3) adopts these
five classes as its staging vocabulary for game and show alike.
