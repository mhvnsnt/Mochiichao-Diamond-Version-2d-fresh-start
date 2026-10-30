# TEARDOWN — Riot + Blizzard (netcode models, replay systems, broadcast grammar)

**Licence:** neither company releases engine code. What they publish —
engineering blogs, GDC talks, system documentation — is **public
documentation**, and that is the level this teardown adopts at.
**Evidence grade: DOCS throughout**, with the specific publications named.
Nothing here is reverse-engineered from binaries; it doesn't need to be —
both companies teach these systems in public, in unusual detail.

---

## 1. Riot — determinism as a product feature (League of Legends)

Riot's engineering blog series **"Determinism in League of Legends"**
(technology.riotgames.com, four parts: Introduction / Implementing
Determinism / Unified Clock / Fixing Divergences) documents a year-long
project to make the LoL *game server* deterministic:

- **Motivation, in order:** (1) **Delta Checker** — automated tests that
  record a game's inputs and re-simulate, flagging any divergence between
  builds; (2) **Project Chronobreak** — an esports-official tool that
  *rewinds a live pro game* to an earlier point after a bug or incident,
  instead of remaking it. Chronobreak is only possible because re-playing
  the recorded inputs reproduces the exact state.
- **The work:** a **unified clock** (one authoritative time source for all
  systems), deterministic ordering of system updates, seeded/controlled
  randomness, hunting float and iteration-order divergences — the blog's
  "Fixing Divergences" part is a catalogue of exactly how determinism
  breaks (unordered containers, wall-clock reads, platform float drift)
  and how each class was killed.
- **Replay distribution:** LoL replays are small files (`.rofl`) shared
  through the client — possible only because the client can re-simulate.
  (Cautionary note, Oct 2026: Riot's attempt to restrict replay downloads
  was reversed within weeks after community backlash — replay *openness*
  turned out to be load-bearing for the coaching/analysis ecosystem.
  Recorded here as distribution-policy evidence: treat replays as a
  public good, not a leak.)

**Native mapping:** Chronobreak and Delta Checker are the two uses our
replay spec is explicitly designed for (`native/replay-format-spec.md`
§§4–5): checkpoints + input re-simulation = rewind; recorded inputs +
state hashes = the regression harness. The divergence catalogue is
adopted as sim-core's determinism rules (`native/sim-core-spec.md` §3) —
unordered iteration and wall-clock reads are banned in sim code by name,
because Riot's postmortems say that's where it dies.

## 2. Riot — the authoritative fixed-step sim (Valorant / LoL movement)

Riot's published netcode writing (their "Netcode" article series on the
Riot Games Technology blog) documents the other half:

- Client and server run movement/physics at a **fixed timestep** (their
  example runs the movement sim at 128 steps/sec) **decoupled from render
  framerate** — a 60 FPS client runs multiple sim steps per frame; a
  faster client interpolates within one step. Fixed steps make client and
  server results *comparable* ("move #408" names the same computation on
  both machines).
- The server is **authoritative**; clients predict and are corrected.
  Divergence is treated as a budget to minimize, not a sin to deny.

**Native mapping:** sim-core §1 (fixed tick, decoupled render) and §4
(authority menu). Our tick rates are far lower (a 2D RPG's world doesn't
need 128 Hz) — the *principle* is what's adopted, with rates chosen per
surface in the config (`native/deterministic-sim-config.json`).

## 3. Blizzard — two models, both documented

**(a) Deterministic lockstep (StarCraft II / Heroes of the Storm).**
The SC-line RTS model: peers exchange **only inputs**, every machine runs
the full sim, a turn scheduler advances the sim when all inputs for that
turn arrive. Consequences Blizzard designs around: minimal bandwidth,
perfect replays for free (inputs again), zero server cost — paid for with
input latency equal to the slowest peer's turn time and total exposure if
one peer's sim diverges. Heroes of the Storm inherited the SC2 engine and
the model, and its well-documented reconnect pain (rejoining = re-simming
the whole game from zero at high speed) is the model's known failure mode
— recorded in sim-core §4 as the reason our lockstep profile checkpoints
state hashes *and* keeps periodic full-state snapshots for rejoin.

**(b) Server-authoritative prediction (Overwatch, GDC 2016).** Tim Ford's
GDC talk ("Overwatch Gameplay Architecture and Netcode") is the canonical
public description:

- An **entity-component-system** core; client and server run the **same
  deterministic simulation** of abilities/movement.
- The client **predicts** its own actions; on the server's authoritative
  snapshot it **rolls back and replays** buffered inputs to the present.
  Mispredictions are rare and usually invisible.
- **Favour the shooter:** hit registration honours what the shooter saw;
  targets are **rewound** to the shooter's view for the test, with
  **clamps** so nobody is rewound absurdly far, and defensive abilities
  get explicit exceptions. Hit *registration* is predicted on the client;
  damage is never simulated client-side.

**Native mapping:** (b) is the reference design for any future
server-hosted Mochiichao surface, and its *vocabulary* (prediction,
reconciliation, rewind clamp, shooter-favoured exceptions) is adopted in
sim-core §4 so future design starts from named parts. (a) is the versus
fallback where rollback doesn't fit. Neither is integrated today — no
netplay surface exists (WAVE-MAP gap #4).

## 4. Broadcast / esports presentation grammar

What pro broadcasts of LoL and Overwatch (and fighting-game majors) all
converge on — the grammar `native/fighting/match-presentation.md`
specifies for BANNON and the show:

- **Spectator is a separate client with a delay** (LoL spectator delay;
  observer-directed cameras) — the audience never sees the players' raw
  feed, and the delay is a fairness feature, not a bug.
- **Readability colours:** Overwatch League introduced per-team
  home/away colour schemes applied to *everything* (uniforms, effects,
  UI) so a viewer can parse a chaotic frame instantly. Rule adopted:
  in any presented match, each side owns one colour family, effects
  included — this composes with the show's colour discipline (identity
  colours protected; presentation colours are a layer, not a re-skin).
- **Persistent furniture:** minimap, objective timers (dragon/baron →
  for us: round/match-point state), gold/XP differential graph (→
  momentum graph), item builds (→ loadout cards), tale-of-the-tape
  pre-match cards, instant-replay bumps between phases, and a
  " broadcast state" that survives camera cuts.
- **Continuity tooling:** Chronobreak's existence is itself a broadcast
  feature — the show can always be rescued to a known state. Our replay
  checkpoints are specified to serve the same office for BANNON events
  and for show battle staging reviews.

## Sources (this pass)

- Riot Games Technology blog: "Determinism in League of Legends" series
  (Introduction — Project Chronobreak + Delta Checker; Implementation;
  Unified Clock; Fixing Divergences), technology.riotgames.com;
  Riot netcode writing on fixed-timestep authoritative movement
  (128 Hz example), retrieved 2026-10-28.
- LoL replay policy reversal, Oct 2026 (Patch 26.20/26.21 reporting).
- Blizzard: Overwatch GDC 2016 netcode talk (Tim Ford) as documented in
  talk summaries and coverage (ECS, prediction/reconciliation,
  favour-the-shooter, rewind clamps); StarCraft II / Heroes of the Storm
  deterministic lockstep as documented in engine/netcode literature.
