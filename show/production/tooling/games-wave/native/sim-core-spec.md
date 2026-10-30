# SIM-CORE SPEC — Mochiichao's deterministic simulation constitution

**Format:** `mochiichao/sim-core/v1` · **Config:** `deterministic-sim-config.json`
(beside this file) · **Status:** SPEC — the target contract for the game
engine. The engine (`src/world/WorldEngine.tsx`) runs a frame-driven loop
today; migrating it to this contract is follow-on engineering, specified
here, **not claimed done** (real-code wiring law).

**Lineage (one line each, full teardowns in the parent folder):** fixed
tic + input demos + consistency checks — id (CODE). Unified clock,
divergence hunting, record/playback/validate — Riot (DOCS). Deterministic
client/server sim + reconciliation — Blizzard (DOCS). Dormancy/relevancy
vocabulary — Epic (DOCS). Prediction lineage QuakeWorld → Source —
id/Valve (CODE/DOCS). This spec is the synthesis all five agree on.

---

## 1. The tick

- The world simulation advances in **fixed ticks**, decoupled from
  rendering. Rendering reads the two most recent sim states and
  interpolates; rendering never writes sim state.
- Tick rates are **per surface** (config): `world` 30 Hz (overworld,
  followers, ecology), `battle` 30 Hz (battle staging + animscript sync),
  `versus` 60 Hz (BANNON-style frame-data surfaces — fighting grammar is
  frame-based at 60). A surface's rate is part of its replay identity:
  a replay recorded at one rate is invalid at another.
- A tick processes, in a **fixed, documented order**: queued inputs →
  movement → interactions/encounters → ecology/behaviour → timers/events.
  The order is part of the spec; changing it is a sim-version bump.

## 2. Inputs are the only history

- Every input that can affect the sim is recorded **per tick, per actor**
  (player commands; AI decisions are *derived* from sim state + RNG, never
  injected from outside the tick).
- A session is therefore fully described by `(initial state, content-pack
  manifest, master seed, input stream)`. This is the Doom demo identity,
  and it is what makes the replay format (`replay-format-spec.md`) small
  and exact.

## 3. Determinism rules (the Riot catalogue, adopted as law)

Sim code (anything reachable from a tick) MUST NOT:

- read the wall clock or frame delta (time = tick count, only);
- iterate unordered collections where iteration order affects outcomes
  (use sorted/stable orders; the data core's arrays are ordered by id);
- use platform-dependent float behaviour in outcome-affecting math
  (positions on the tile grid are integer/fixed-point in the sim; floats
  are rendering-side only);
- call unseeded randomness. **All** randomness draws from named,
  seeded streams (config: `encounter`, `ecology`, `battle`, `cosmetic`),
  each stream's state part of the sim state — Doom's single fixed table,
  split by purpose so cosmetic rolls can't perturb gameplay rolls.

Violation of any rule is a determinism bug, graded like a crash.

## 4. The authority menu (which model runs which surface)

| Surface | Model | Why |
|---|---|---|
| Overworld / story (today) | **Local deterministic** (id model, 1 player) | No peers, no server; determinism buys replays + QA |
| Battle (today) | **Local deterministic** on the same tick | Battles must replay bit-exact for staging review + gates |
| Future co-op / shared world | **Server-authoritative + client prediction + reconciliation** (QuakeWorld → Overwatch model; Epic's vocabulary: authority, relevancy, dormancy) | A trusted host exists; cheating and divergence are the host's problem |
| Versus 1v1 (BANNON) | **Rollback** (GGPO pattern over the versus profile) | Frame tolerances forbid input delay; 2 peers, tiny state |
| Versus >2 or shared-world modes | **Lockstep with checkpoints** (StarCraft-line) or server-authoritative — decide per mode at design time, from this menu | Lockstep's rejoin cost is the known trap; checkpoints + snapshots are mandatory if chosen |

No surface may invent a fifth model without amending this spec.

## 5. Behaviour evaluation (where the movement system plugs in)

- Per-area behaviour profiles and per-individual memory (movement system,
  PR #66) evaluate **on the world tick**: profile = the static tree shape
  (selector/sequence over the two authored behaviour axes — Epic's
  behaviour-tree pattern in our data), individual record = the blackboard
  (per-creature keys). Behaviour code reads/writes only sim state.
- **Dormancy:** individuals in unloaded/distant areas do not tick; their
  state is their record, advanced in bulk on area entry (catch-up by
  elapsed ticks, deterministic from the same streams). This is Epic's
  dormancy with the network removed.

## 6. Checkpoints + consistency

- Every `checkpointEveryTicks` (config), the sim computes a **state hash**
  over the canonical serialization of outcome-affecting state and stores
  it in the session log / replay. Doom called a mismatch a "consistency
  failure"; so do we — a hash mismatch in replay or QA is a P1 defect
  with the tick number attached.
- Full-state snapshots are taken at checkpoint intervals in versus/
  lockstep surfaces (rejoin + Chronobreak-class rewind) and at save
  points in local surfaces (a save file *is* a snapshot + manifest +
  seed + tick).

## 7. Migration notes for `src/world/` (the honest gap)

- `WorldEngine.tsx` / `WorldRenderer.tsx` exist and run the game today.
  The migration is: extract the tick (fixed-step accumulator), move
  outcome-affecting math to integer/fixed-point, route RNG through the
  named streams, add the checkpoint hash. Each step is independently
  landable; the replay format can be adopted after step 1+3, before the
  rest. **None of this is done by this package** — this package is the
  contract that migration is judged against.
