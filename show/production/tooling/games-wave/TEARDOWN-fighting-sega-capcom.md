# TEARDOWN — Fighting-game systems (Sega + Capcom) for Brutal Fist / BANNON

**Why these two:** Sega owns the decomp-visible side (what a shipped 2D
game's data architecture actually looks like, in readable code) and the
Virtua Fighter data culture; Capcom owns the modern fighting-game *data
conventions* — the frame-data language every fighting game now speaks.
BANNON (the owner's wrestling game; cast and world in the Brutal Fist
repos) needs both: an architecture and a language.

**Licences (verified at source):**
- **Sonic 1/2 (2013) Decompilation** (Rubberduckycooly): ships under a
  **custom licence file in-repo (not an OSI licence)**; the decomp requires
  assets from the official releases to run and contains no Sega assets.
  House handling: **study-reference only**, exactly like the Pokémon
  decomps in the study archive — structure and mechanism are learned,
  code is never carried over.
- **Capcom:** no fighting-engine code is public. What *is* public:
  Capcom's own published frame data (the official Street Fighter 6 site
  publishes per-move frame tables) and the community's documented
  conventions (supercombo wiki et al.). **DOCS grade.**
- **GGPO** (Tony Cannon): **open source — MIT** (open-sourced 2019-10-09;
  repo + SDK docs public). The one piece of real, adoptable code in this
  teardown.

**Evidence grades:** Sonic decomp **CODE** (project structure and data
architecture) · Capcom conventions **DOCS** · GGPO **CODE/DOCS**.

---

## 1. Sega side — the RSDK lesson: a game is a data archive + scripted objects

The Sonic 1/2 2013 decomp (of Christian Whitehead's Retro Engine, RSDKv4)
shows the same architecture as id's WAD, one generation on:

- All content ships in one archive, **`Data.rsdk`** — the engine is a
  player for the archive, not a bundle of loose files.
- Game objects are **scripted** (per-object scripts compiled by a built-in
  script compiler): object behaviour lives on the data side, the engine
  provides physics/rendering/audio primitives.
- A `settings.ini` + dev menu (frame-step, palette overlay, object
  inspection) is a first-class citizen — the shipped game carries its own
  debugging furniture.

**Transfer to BANNON:** (a) the content-pack pattern already adopted for
Mochiichao (`native/content-pack-spec.md`) is the same shape — BANNON
inherits it unchanged; (b) the scripted-objects lesson maps to BANNON's
wrestler/move *data* being the game: a match is data (rosters, move
tables, frame data) interpreted by a small deterministic engine — which is
exactly what makes the frame-data schema in `native/fighting/` the core
deliverable rather than an appendix; (c) frame-step/inspection dev
furniture is specified as a requirement in FIGHTING-SYSTEMS.md §6 — you
cannot tune frame data you cannot step through.

(The Genesis-era disassemblies and Sonic 3 A.I.R. exist in the same
ecosystem; A.I.R. is source-available under its own restrictive terms and
adds nothing architectural beyond the above — noted, not used.)

## 2. Capcom side — frame data is a public language

Modern fighting games (Capcom's Street Fighter line is the reference
implementation) describe every move in one shared vocabulary. Capcom
publishes it officially for SF6; every tournament, wiki, and training mode
speaks it:

- **Phases:** `startup` (frames before the move can hit) → `active`
  (frames during which it can hit) → `recovery` (frames before the
  character can act again). Total = startup + active + recovery; the game
  runs at a fixed 60 frames/second, so *frames are the unit of design*.
- **Outcomes:** `damage`; `onHit` / `onBlock` = frame advantage after the
  exchange (positive: the attacker acts first); `hitstop` (both characters
  freeze briefly on contact — the impact feel); `hitstun` / `blockstun`
  durations; pushback.
- **Boxes, per frame:** a move is a timeline of box states — **hitboxes**
  (attack volumes), **hurtboxes** (vulnerable volumes), plus typed
  specials (throw boxes, projectile boxes, armor/invincibility flags).
  Collision is box-vs-box per frame; the *art* is dressed over the boxes,
  never the reverse.
- **Cancel rules:** which phases of a move may be interrupted into which
  follow-ups (normal→special→super chains, jump/dash cancels) — the combo
  system is a property of the data, not an engine feature.
- **Input systems:** a **buffer window** (inputs pressed slightly early
  are stored and fire on the first legal frame), execution leniency
  (e.g. multi-frame windows for special-move motions), and **SOCD
  cleaning** for leverless controllers (simultaneous opposing cardinal
  directions resolve by a published rule; Capcom's tournament rule made
  up+down = neutral the standard).

**Transfer to BANNON:** `native/fighting/frame-data.schema.json` is this
vocabulary as a JSON Schema in the house style, extended for wrestling
(grapple phases: clinch/lift/hold; ropes/turnbuckle position conditions;
pinfall as a state machine hook) with every extension marked as ours.
`example-move.json` works one generic move through it end to end.
FIGHTING-SYSTEMS.md fixes the conventions BANNON adopts verbatim (60 Hz
frame unit; advantage notation; buffer + SOCD rules) so all future
BANNON data speaks one language.

## 3. Netplay for 1v1 — the GGPO decision

- **The problem:** delay-based netcode adds input delay equal to network
  latency; at fighting-game frame tolerances that destroys the game feel.
- **GGPO's answer (rollback):** both peers run the *deterministic* sim
  locally at full speed, predicting the remote player's input (repeat last
  input); when the true input arrives, if it differs, the sim **rolls back
  to the last agreed frame and re-simulates** to the present — corrections
  are usually invisible because predictions are usually right. A small,
  fixed input delay (0–8 frames, player-adjustable) smooths the rest.
  Requirements on the game: deterministic sim, full state save/restore in
  ≤ a frame's budget, inputs as the only network traffic.
- **Why this is adoptable:** MIT-licensed SDK + the pattern is implementable
  natively in any engine that satisfies the sim-core constitution — which
  is the deep reason sim-core (deterministic, input-recording) is the
  foundation package of this whole wave. BANNON versus = sim-core versus
  profile (60 Hz) + GGPO-pattern rollback. Fightcade (a GGPO client
  ecosystem running classic fighters online for years) is the living proof
  of the pattern at community scale — DOCS-grade evidence, cited in
  FIGHTING-SYSTEMS.md §5.
- **What rollback is not for:** more than 2 players with shared worlds,
  or non-deterministic sims. BANNON's battle-royale-style modes, if they
  ever exist, take the server-authoritative branch of sim-core §4 instead.

## 4. Presentation (joint with the Riot/Blizzard teardown)

Fighting broadcasts run on the same furniture as MOBA/shooter esports:
readability colours per side, tale-of-the-tape cards, momentum graphs,
replay bumps between rounds. The full grammar is torn down in
TEARDOWN-riot-blizzard.md §4 and specified for BANNON + the show in
`native/fighting/match-presentation.md`.

## Sources (this pass)

- Sonic 1/2 2013 Decompilation — project README/releases and licence
  reporting (GitHub; GameBrew "Mixed"/custom listings), retrieved
  2026-10-28. Structure described from the project's public documentation.
- GGPO — Wikipedia + Game Developer (gamedeveloper.com) on the 2019 MIT
  open-sourcing; GGPO SDK documentation (ggpo.net / GitHub), retrieved
  2026-10-28.
- Frame-data conventions — Capcom's official SF6 frame-data publication +
  community documentation (supercombo wiki), describing the standard
  vocabulary; SOCD tournament rule as publicly reported (Capcom Pro Tour).
