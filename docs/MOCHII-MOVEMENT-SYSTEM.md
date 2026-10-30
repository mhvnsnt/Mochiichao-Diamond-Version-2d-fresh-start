# MOCHII MOVEMENT SYSTEM — followers, visible encounters, battle motion (native)

The native system built on the teardown in `docs/MOVEMENT-TEARDOWN.md`.
Machine-readable config: `src/data/core/movement.json`, validated by
`src/data/core/schemas/movement-system.schema.json`
(format `mochiichao/movement-system/v1`).

**Foundations, in force throughout.** Pokémon-base rule, HGSS first
(the owner's chosen foundation game). Open-world essence law:
Mochiichao is an open-world RPG — creatures live in the world, not in
dice rolls. Battle Doctrine: battles are command-driven; everything
between commands is presentation on a read-only snapshot and never
writes battle state. Canon discipline: this system ships **mechanisms
only** — which species roam where, exception lists, and reaction lines
stay in the canon tables and owner slots named below, never invented
here. Overlays read canon tables; they never edit them.

---

## 1. The follower — your lead partner walks with you

Template: HGSS `follow_mon.c` mechanics, Yellow's trail discipline,
Let's Go's rideable extension. Wiring map anchor: study archive
GAP-FILL D14 (systems #58 follower, #241 follower town rules).

### 1.1 Lead selection
The follower is the lead individual: the first **alive, non-egg**
party member; if none is alive, the first non-egg member. Re-evaluated
on every party change (catch, faint, heal, deposit, evolution — the
follower becomes the evolved form, it is the same individual).
Config: `follower.leadSelection`.

### 1.2 The trail (command-buffer replay)
The follower does not pathfind. The Ranger's movement commands are
enqueued (`follower.trail.model = command_buffer_replay`); the
follower consumes them once **at least two steps are buffered**
(`minBufferedSteps = 2`), replaying the Ranger's exact path one step
behind — the Yellow mechanism, which is also what HGSS's follower
object setup implements. On warp, door, or scripted move: the buffer
clears and the follower re-places behind the Ranger's facing.
Follower speed always equals Ranger speed (it replays commands, it
does not chase).

### 1.3 Permission — species × place
Every map carries a follow mode in its map data:
`allow` / `height_restrict` / `prevent` (`follower.permission.mapModes`).
Per-species follower parameters live in the follower parameter table
(schema in `movement-system.schema.json` §`followerParam`): `sizeClass`
(derived from the #161 size records), `tooTall`, `hover` (aerial
species render offset from the ground) — the `tp_param.csv` shape.
`height_restrict` recalls species with `tooTall` set when entering.

Species×place **exceptions** are a named list, HGSS-style
(the Diglett/Bell Tower pattern). The list ships **empty**
(`follower.permission.exceptionList = []`): entries are canon
rulings, added by the canon lane, never inferred here.

**Place-authored door (already landed in the repo):** the #241
town rules (`show/production/world-systems/241-FOLLOWER-TOWN-RULES.md`;
data shape `show/production/world-systems/follower-rules-fragment.json`,
format `mochiichao/follower-rules/v1`) write a `followerRule` —
`welcome` / `park` / `barred`, default `welcome` — onto interior
and area records. The two layers compose: this system's
map-mode × species permission decides whether the follower *can*
be out; a place's `followerRule` decides whether it *waits at the
door* instead (the #58 PARKED state) — a presentation beat at the
threshold that writes nothing about the individual.

### 1.4 Traversal states
On foot: following. On any mounted/vehicle/water traversal mode:
the follower is recalled and hidden, and restored on returning to
foot (HGSS's cycling/surfing rule; persisted as the traversal state
in the save block). Let's Go extension, flagged as an **open design
slot**: a suitably large follower may *be* the mount — default is the
HGSS recall rule until the design lane rules otherwise.

### 1.5 Mood and interaction
Mood is a value **on the individual record** (the #267 wild/owned
individual machinery; `individual.schema.json` is its home): range
**−127..127**, starts at 0 for a newly-followed individual, drifts
**one step toward neutral** per tick, and is moved by field events
and scripts (`follower.mood`). Talking to the follower selects a
reaction by mood band × place context — mechanism here, **reaction
content is a show/design-lane canon slot** (lines, animations), not
written by this system. Town and indoor behaviour rides on this
same mechanism under the #241 follower town rules
(`show/production/world-systems/241-FOLLOWER-TOWN-RULES.md`,
landed): interiors carry a `followerRule` (welcome/park/barred,
§1.3) and PARKED is the follower's state while the Ranger is
inside a park/barred place. #241's rule *values* are unassigned
today — zero interiors are instanced yet — which is a content
slot, not a missing system.

### 1.6 Script choreography
Cutscenes direct the follower with five verbs
(`follower.scriptVerbs`): `pause_follower`, `resume_follower`,
`follower_follow_route`, `place_follower_relative`, `wait_follower`
— the HGSS script-command set, natively named. The follower is a
first-class field object for every other field system (photo spots,
field moves, events) exactly as in HGSS.

### 1.7 Save state
Persisted with the game save (`follower.saveState`): current map id,
inhibit flag (scripts may suspend following), traversal state.

---

## 2. Visible encounters — the world is already populated

Template: Arceus slot schema (behaviour authored per spawn record),
SwSh awareness play, SV in-place engagement. Wiring anchors: D1
(encounter tables — the #7 spawn tables, landed), D2 (#114 roamers —
landed at `show/production/world-systems/114-ROAMING-ENCOUNTERS.md`),
F5/#267 (wild-individual identity). **This system reads the existing
spawn tables — `src/data/core/encounters/*.spawn-tables.json` — and
adds no species data to them.**

### 2.1 Lifecycle
`visibleEncounters.lifecycle`:
`spawn → roam → aware → disposition → engage | disengage → despawn`

- **spawn**: an individual is generated from a slot of the area's
  existing spawn table (species, level band, eligibility gates —
  the slot's own `timeOfDay`/`weather` fields are the gates) and
  placed at a spawn point inside the area, beyond the player's
  immediate view where the area geometry allows.
- **roam**: the creature lives its loop at its place — idle, graze,
  wander — per its behaviour profile (§2.2). It is a **wild
  individual** while it exists: it draws from and writes back to
  the #267 individual pool, so the wild-memory/ecology overlays
  see the same creature the player sees (F5 discipline: identity
  follows the individual, memory writes are read-time events,
  canon tables are never edited by encounters).
- **aware**: proximity and line-of-sight raise awareness; the game
  shows it (the exclamation/indicator grammar) so the player can
  read and play around it — approach quietly, detour, or commit.
- **disposition**: resolves by profile (§2.2): `flee`, `watch`,
  `approach`, or `charge`.
- **engage**: contact (either direction) starts the encounter.
  Areas declare their battle mode (transition vs in-place, per the
  world's battle presentation); aggressive profiles can also strike
  at the Ranger, Arceus-style — whether Ranger-harm exists in a
  given area is an area/canon ruling, the mechanism is profile data.
- **disengage / despawn**: leaving the awareness radius decays
  awareness back to roam; leaving the (larger) despawn radius
  removes the creature — spawn/despawn hysteresis, the Arceus/SwSh
  pattern, so creatures never pop at a single boundary.

### 2.2 Behaviour profiles — two axes, assigned per area
Following the Arceus `Behavior1`/`Behavior2` pattern, a profile is
two axes (`visibleEncounters.dispositionAxes`): a **disposition**
(`docile` / `wary` / `bold` / `aggressive`) and a **reaction**
(`flee` / `watch` / `approach` / `charge`). Profiles bind per
(`areaId`, `method`) in `movement.json` §`visibleEncounters.areaProfiles`
— **the binding list ships empty**: which profile a place's
creatures carry is world/canon content, assigned by the canon lane
as areas are authored. Until an area is assigned, it runs
`unassignedBehaviour = step_roll_fallback` — the classic invisible
step-roll against the same spawn table, so unassigned areas behave
exactly as the game does today. Roamer individuals (#114) enter
this same lifecycle at `roam`, with map-graph movement between
areas per the roamer rules.

### 2.3 Population
Per-area live-creature caps follow the population classes the
behaviour-table machinery already defines (`population_sparse /
population_mixed / population_dense` — see
`schemas/behaviour-table-fragment.json`); a population multiplier
(the Arceus outbreak mechanism) scales spawn weighting without
editing slot tables.

---

## 3. Battle motion — one staging grammar for game and show

Template: the five-class grammar synthesised in
`MOVEMENT-TEARDOWN.md` §3.4 (3D console era contact/ranged split;
sprite-era cue discipline). This section defines **staging classes
and their contract with the battle state machine** — it does not
replace the battle-presentation package: state flow stays
`BATTLE-UI-FLOW` (INTRO → LIVING_FIELD → COMMAND_RING →
TARGET_SELECT → COMMIT → RESOLUTION → END_CHECK) and per-move
choreography stays in `mochiichao/move-animscript/v1` files
(timed cue lists, beats: anticipation → release → travel → impact →
reaction → settle; body choreography per anatomy, variance logged).

### 3.1 The five classes (`battleStaging.classes`)
- `entrance` — arrive onto the marked position. Contract: INTRO.
- `idle_living` — the between-command living fight: breath/sway,
  stance shifts, gaze held on the opponent, small feints — pure
  presentation on the read-only battle snapshot (Battle Doctrine).
  Contract: LIVING_FIELD (and COMMAND_RING/TARGET_SELECT, dimmed
  behind the commanding creature's focus).
- `approach_contact` — the performer travels to the target, strikes
  on the animscript's impact beat, returns to position.
- `ranged_stay` — the performer holds position; the effect/projectile
  tracks carry the travel.
- `reaction_exit` — flinch/recoil on the reaction beat; faint =
  collapse + recall. Contract: RESOLUTION, END_CHECK.

### 3.2 Where the class is declared
Per **performance** (per move × anatomy) in the move's animscript
file: the performance's body track either performs the approach
(`approach_contact`) or it doesn't (`ranged_stay`) — the staging
class is read off the authored performance, never guessed from the
move name at runtime. Mechanical default for unauthored moves,
Pokémon-way: a move whose effect object marks it as making contact
stages `approach_contact`; all others `ranged_stay`; status/self
moves stage in place under `ranged_stay` with no travel tracks.
Anatomy variance applies with full force: a limbless swimmer's
`approach_contact` is a swim/lunge line, a levitating performer's is
a glide — same class, same beats, different body track (the
animscript `variance_notes` carry the difference, as always).

### 3.3 The show uses the same grammar
Show battle scenes stage by the same five classes and the same beat
map: a battle scene's shot list names, per move, the class and the
performance — so a scene and the game battle it mirrors cannot
drift apart in how a move is performed. Show-side staging detail
(camera per class, cut rhythm) lives with the battle-presentation
package and the show bible; this system owns only the shared class
vocabulary and the state contract above.

---

## 4. Wiring status and gaps (honest)

**Landed with this system (data + spec, additions only):**
`src/data/core/movement.json` (config instance),
`src/data/core/schemas/movement-system.schema.json` (its schema,
including the follower-parameter table shape and the area-profile
binding shape), this spec, and the teardown.

**GAPS — engine wiring still owed (spec-with-gap-flag, per the
real-code wiring law):**
1. `src/world/WorldEngine.tsx` / `WorldRenderer.tsx` do not yet load
   `movement.json`. The data-core's own precedent applies: JSON
   wiring needs the `resolveJsonModule` decision (or fetch loading)
   named in `src/data/core/README.md` — it is not silently made here.
2. The follower is not yet wired into the world engine — but the
   repo is not empty here (an earlier draft of this section wrongly
   implied it was; corrected on the audit evidence). What exists:
   a tested trail prototype (`sprite-art/arena-combat/follower/followerWalk.js`
   + `FOLLOWER-SPEC.md` + `FIGHT-AS-CREATURE-SPEC.md` — its own
   header states it is NOT wired into the game and the Step 3
   overworld agent owns the wiring), the Step 3 follower specs
   (`docs/research-sweep/step3-overworld-follower/` — band,
   steering, leader-following, play-as-creature controls), the #58
   follower state machine (FOLLOW / CATCHUP / IDLE / REACT /
   PARKED) documented by its companion
   (`show/production/world-systems/GARDEN-FOLLOWER-SYSTEM.md`)
   and the #241 town rules. What is missing is only the join:
   `src/world/WorldEngine.tsx` / `WorldRenderer.tsx` consume none
   of it, and do not load `movement.json`. §1 is the build spec
   for that join: field object + command buffer + permission
   check on map load + save fields.
3. No visible-encounter spawner exists yet. §2 is its build spec;
   it consumes the landed spawn tables unchanged.
4. Battle staging classes (§3) bind to the battle-presentation
   package (workspace package #10; in-repo companions:
   `docs/arena-battle-presentation-spec.md`, `docs/battle-resolver.md`)
   — the class vocabulary lands here; per-move animscript
   performances are authored by the animation lane.
5. Canon slots left open, by design: follower exception list (§1.3),
   area behaviour bindings (§2.2), follower reaction content (§1.5),
   mount-follower ruling (§1.4), #241 `followerRule` values
   (unassigned — zero interiors instanced yet, §1.5).
