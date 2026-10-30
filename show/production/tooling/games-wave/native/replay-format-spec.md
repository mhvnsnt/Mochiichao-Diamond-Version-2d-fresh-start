# REPLAY FORMAT SPEC — input-stream replays with state-hash checkpoints

**Format:** `mochiichao/replay/v1` · **Status:** SPEC. Depends on
sim-core (`sim-core-spec.md`): a replay is only as exact as the sim is
deterministic. Adopt after sim-core migration steps 1+3 (tick extraction +
named RNG streams).

**Lineage:** Doom `.lmp` (header + per-tic ticcmds; playback =
re-simulation — CODE) · Riot's record/playback/validate tooling and
**Chronobreak** (rewind a live game by re-simming to a checkpoint —
DOCS) · Riot's **Delta Checker** (recorded inputs as the regression
harness — DOCS) · LoL `.rofl` distribution (small files, client
re-simulates — DOCS) · Source `.dem` message-stream recording (the other
philosophy — reserved, §6).

---

## 1. File shape

A replay is one JSON document (binary packing is a later optimization;
JSON keeps replays diffable, gate-able, and hand-inspectable at our
scale):

```
{ header, inputs: [ per-tick input records ], checkpoints: [ {tick, stateHash} ], result? }
```

- **header** — see `replay-header.example.json`: format, sim version,
  surface + tick rate, content-pack manifest hashes (the replay names
  the exact data it was recorded against), master seed, participants,
  recorded-at metadata (wall-clock lives here only — never in the sim).
- **inputs** — sparse: only ticks where at least one actor's input
  changed need a record; a record is `{tick, actor, input}` where
  `input` is that surface's input vocabulary (world: move/interact
  commands; battle: chosen action per decision point; versus: per-frame
  controller state). Doom recorded every tic densely because bytes were
  the constraint of 1993; ours are sparse because readability is ours.
- **checkpoints** — every `checkpointEveryTicks` (sim config), the
  state hash at that tick. Playback verifies each one as it passes.

## 2. Playback rules

1. Rebuild initial state from header (build + packs + seed), then
   re-sim, feeding `inputs` at their ticks.
2. At each checkpoint, compare hash. **Mismatch = consistency failure**:
   stop, report `{tick, expected, actual}` — the first divergent tick is
   the bug report (Riot's divergence-hunting, mechanized).
3. Rendering during playback is free (any camera, any speed, pause,
   step) — playback is a *viewer* over the sim, exactly as Doom demo
   playback shared the game's command slot with live play.

## 3. Use 1 — battle replays (player-facing)

A finished battle exports a replay: tiny, shareable, verifiable against
the recipient's build by header hashes. Battle staging review (show
side) uses the same files: a battle that played well can be re-watched
from any angle for animscript reference, and a battle that played wrong
is a reproducible defect, not an anecdote.

## 4. Use 2 — Chronobreak rule (event/save rescue)

Restoring a session to an earlier point = **load the nearest checkpoint
snapshot at or before the target tick, then re-sim inputs to the
target**. Local surfaces: this is what a save-scumming-proof "rewind to
checkpoint" does. Versus/event surfaces: this is the official's rescue
tool — the match resumes from a state everyone can verify by hash,
which is the entire Chronobreak lesson.

## 5. Use 3 — Delta Checker rule (QA regression harness)

A library of canonical replays (one per system: a route walk, a wild
battle, a dojo battle, an ecology day-cycle) is re-run after any data
or engine change. **All checkpoints must match, or the change ships
with a written divergence note.** This converts "did we break the game
feel?" from an opinion into a gate — and it is the cheapest of the
three uses to build, so it is the recommended first implementation.

## 6. Reserved: message-stream mode

If a future surface is server-mediated and its sim is not the local
deterministic one, that surface's replays record the *server message
stream* instead (the Quake/Source `.dem` philosophy). The header gains
`mode: "message-stream"`; playback is re-rendering, not re-simulation,
and §5's guarantees do not apply. Reserved so nobody shoehorns it into
the input-stream format later.

## 7. What this does not do

- No anti-cheat claims: a replay proves what the sim computed from its
  inputs, nothing about who produced the inputs.
- No cross-version playback: a sim-version or pack-hash mismatch is a
  refusal, not a best-effort (the LoL patch-lock lesson).
