# Games Wave — the giants' game technology, torn down and wired natively

**Owner's order (Jamar, 2026-10-28):** reverse engineer everything takeable
about the top industry-standard game technology — id Software, Valve, Epic,
Sega + Capcom, Riot + Blizzard — and wire the systems up into his repos at
100%. "100%" = as far as public/open sources allow; every gap is labelled,
nothing is faked, and closed material is never worked around.

**Construction-kit rule (standing):** what transfers is SYSTEMS — simulation
models, packaging formats, replay designs, data conventions, presentation
grammar. No game assets, no characters, no branding, ever. Study code stays
reference; everything that ships here is a native Mochiichao artifact.

## Read in this order

1. **WAVE-MAP.md** — the whole wave on one page: per target, its true home
   repo, licence (verified at source), evidence grade, HAVE / PARTIAL / GAP,
   and what landed where.
2. **TEARDOWN-\*.md** — one teardown per target, mechanisms first, with the
   native mapping written next to each mechanism.
3. **native/** — the adopted systems as real spec/data files:
   - `sim-core-spec.md` + `deterministic-sim-config.json` — the deterministic
     fixed-timestep simulation constitution (id × Riot × Blizzard synthesis).
   - `content-pack-spec.md` + `content-pack-manifest.example.json` — the
     WAD/PAK-pattern content packaging and override system, mapped onto the
     existing `src/data/core/` (the example manifest carries real sha256
     hashes of the real core files).
   - `replay-format-spec.md` + `replay-header.example.json` — input-stream
     replay files with state-hash checkpoints (Doom demo × Chronobreak ×
     Delta Checker).
   - `fighting/` — the Brutal Fist / BANNON fighting-systems package:
     `FIGHTING-SYSTEMS.md`, `frame-data.schema.json`,
     `example-move.json`, `match-presentation.md`.

## Audit position (what already existed — extended, not duplicated)

- The Pokémon study archive (`~/workspace/pokemon-code-study/`) and its
  GAP-FILL-WIRING-MAP already own the Pokémon-template layer; this wave is
  the *other* giants and does not re-teardown Pokémon systems.
- The movement system (PR #66, open at audit time: `docs/MOVEMENT-TEARDOWN.md`,
  `docs/MOCHII-MOVEMENT-SYSTEM.md`, `src/data/core/movement.json` +
  `movement-system.schema.json`) already owns followers / visible encounters /
  battle staging. This wave's sim-core spec is written to sit *under* it:
  movement behaviour axes consume sim ticks; nothing here re-specifies them.
- Encounter / spawn / battle data already lives in `src/data/core/`
  (`encounters.json`, spawn tables, `moves.json`, 27 schemas). The
  content-pack spec treats those files as the base pack's entries — it adds
  a packaging/override layer, not new data.
- The show's battle animscript seat (`show/production/tooling/battle/
  validate_animscript.py`, `move-animscript/v1`) is the presentation layer
  the replay and fighting packages cross-reference.

## Homes

Primary landing: this folder (the Mochiichao repo's tooling index home, with
its sibling programmes). True homes per target are named in WAVE-MAP.md —
Brutal Fist/BANNON material is a transfer package for the
`mhvnsnt/brutalfistgrokversion*` repo family; Western Heart inherits the
sim-core and content-pack systems through this repo's game.
