# FIGHTING SYSTEMS — the Brutal Fist / BANNON data language

**Home:** this is a **transfer package**. It was authored in the
Mochiichao repo's games-wave folder; its true home is the Brutal Fist
repo family (`mhvnsnt/brutalfistgrokversion*` — which of the versioned
trees is canonical is the **owner's ruling**, an open slot this package
deliberately does not fill). Everything here is repo-agnostic: drop the
folder in, the conventions hold.

**Sources:** TEARDOWN-fighting-sega-capcom.md (parent folder) — Capcom's
published frame-data language (DOCS), the RSDK data-architecture lesson
(CODE), the GGPO rollback decision (MIT, CODE/DOCS). Canon discipline:
this package defines the *language* BANNON data is written in. It
contains **no BANNON move values** — real frame data for real wrestlers
is canon work in the home repo. The one worked example
(`example-move.json`) uses placeholder values and says so.

---

## 1. The frame is the unit

- The versus sim runs at **60 ticks/sec** (sim-core `versus` profile);
  all move data is written in integer frames at 60 fps. No seconds, no
  floats, anywhere in fighting data.
- A move's timeline: `startup` → `active` → `recovery`, plus the
  outcome block (damage, advantage on hit/block, stun, hitstop,
  pushback) and the cancel table. Field definitions are the schema's
  (`frame-data.schema.json`, JSON Schema 2020-12, house style).

## 2. Boxes, not art

- Collision is box-vs-box per frame: `hitboxes` (attack), `hurtboxes`
  (vulnerable), and typed volumes (throw, projectile, armor flag) are
  data on the move's frames; character hurtboxes are data on the
  character's states (idle/crouch/airborne…).
- Art is dressed over boxes at presentation time and can never change
  an outcome. A move whose art and boxes disagree is a data bug,
  graded like one — this is the rule that makes frame data *mean*
  something, and it's the fighting-game form of the house
  verify-then-state law.

## 3. Wrestling extensions (ours, marked as ours)

Capcom's vocabulary is striking-first. BANNON extends it for grappling,
in the schema, each extension flagged `"x-bannon-extension"`:

- **Grapple phases:** a throw is a move whose active frames test a
  `throwBox` against the opponent's `throwable` hurtbox state, then
  enter a scripted **clinch sequence** (lift → hold → fall) whose
  frames are data like any other timeline, with `escapeWindow` frames
  during which the defender's input can break it.
- **Position conditions:** moves may require ring position
  (`nearRopes`, `onTurnbuckle`, `opponentDown`) — position is sim
  state, so conditions are data predicates, not code branches.
- **Pinfall:** not a move — a state machine the schema references by
  name (`pinfallRulesetId`): count ticks, kick-out windows, rope-break
  rule. Its values are canon slots in the home repo.

## 4. Input rules (adopted conventions)

- **Buffer window: 6 frames.** An input pressed within 6 frames before
  it becomes legal is stored and fires on the first legal frame.
  (Modern standard; fixed here so every move is tuned against the same
  forgiveness.)
- **Motion leniency:** special-move motions accept their final input
  within a 12-frame window after the motion completes.
- **SOCD cleaning:** simultaneous left+right = neutral; up+down =
  neutral (the Capcom Pro Tour tournament standard for leverless
  controllers). Last-input-priority variants are rejected — one rule,
  published, no per-player config.
- Inputs are recorded per tick (sim-core §2) — which is what makes
  replays, training-mode playback, and rollback all the same feature.

## 5. Netplay decision (made, not deferred)

- **1v1 versus: GGPO-pattern rollback** over the deterministic versus
  sim — input prediction, max rollback 8 frames, player-adjustable
  input delay 0–8 frames. Reference implementation: the MIT GGPO SDK
  (adoptable code); a native implementation against sim-core's contract
  is equally legal — the *pattern* is the decision. Living proof at
  community scale: Fightcade.
- **Anything beyond 1v1:** server-authoritative or lockstep per
  sim-core §4. Rollback is not stretched past its physics.
- Transport is a separate, later choice (GameNetworkingSockets, BSD-3,
  is the pre-approved candidate — TEARDOWN-valve.md §4).

## 6. Tuning furniture (a requirement, learned from RSDK's dev menu)

The home repo's build must ship, in its dev mode: **frame-step**
(advance one frame, with inputs displayed), **box overlay** (hit/
hurt/throw boxes drawn over art), and **frame-data readout** (current
move, current frame, phase). Frame data that cannot be stepped through
cannot be tuned; this is specified here so it isn't discovered later.

## 7. Presentation

Match presentation (broadcast grammar: readability colours,
tale-of-the-tape, momentum graph, replay bumps) is specified in
`match-presentation.md` beside this file, shared between BANNON and
the show's battle presentation.
