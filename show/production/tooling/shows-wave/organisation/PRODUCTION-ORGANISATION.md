# PRODUCTION ORGANISATION — Blender Studio conventions, mapped onto our tree

Adopted from the Blender Studio open-movie organisation (teardown:
`../teardowns/BLENDER-STUDIO-OPEN-MOVIES.md`). Their conventions,
our folders. This spec changes no existing episode retroactively;
it governs new episodes and any re-organisation the owner orders.
Where our tree already does the thing under another name, the spec
says so and keeps the house name.

## The five laws, translated

### 1. A cut is a package, not a file
Blender Studio: a shot ships as a self-contained bundle — library
assets linked in `lib/`, caches in `caches/`, one file per task.

Ours: a cut's working home is its folder under the episode, and the
folder — not any single render — is the unit gates judge and the
ledger records.

```
show/episodes/EP##/cuts/V3-###/
  cut.json            <- the cut's manifest (template beside this spec)
  board/              <- board panels + e-konte rows for this cut
  puppet/             <- Tahoma2D scene(s)         (task file 1)
  cleanup/            <- OpenToonz cleanup output  (task file 2, when used)
  composite/          <- Natron graph + plate stack (task file 3)
  renders/            <- stage renders; only composite output is publishable
  audio/              <- the cut's stems as attached at build time
```

Existing episodes keep their current layout (`ep01-finish/` predates
this spec and stays as the EP01 record); the shape above is the
EP02+ default and the shape the build-manifest compiler should emit
— Blender Studio's deepest lesson is that **structure is generated
from the manifest by a tool (their Shot Builder), never made by
hand**, because hand-made structure drifts.

### 2. Assets are linked, never embedded
Their `lib/` rule: a shot links characters/props/sets; it never
owns copies, so one asset fix reaches every shot.

Ours: rigs, plates, palettes, and voice assets live in their shared
homes (`show/production/rigs/`, episode `assets/`, the colour
system) and are *referenced* by `cut.json`. A cut folder containing
a private copy of a rig or palette is a defect, the same class as a
baked shadow: fix by re-linking, not by syncing copies.

### 3. One file per task, with a named output contract
Their animation file publishes exactly one thing — the
`<shot>.anim.output` collection; downstream consumes only that;
the animator's scratch outside it is free and private.

Ours, per stage:

| Stage | Publishes (the contract) | Everything else in its folder is |
|---|---|---|
| board | the cut's board panels + timing rows | sketch/scratch |
| puppet | the rendered character pass (PNG sequence) + viseme record | rig-working files |
| cleanup | the cleaned, palette-true level set | match-line workings |
| composite | the cut master render + per-shot lighting record | graph workings, pre-comps |
| finish (episode level) | the episode master + web copy + VMAF gate record | encode trials |

A downstream stage that reaches past a contract into a stage's
scratch is a wiring bug, to be fixed by strengthening the contract,
never by reaching further.

### 4. Everything converges at one assembly stage
Their lighting file is where animation + effects become the shot.

Ours: **composite is the assembly stage** (already house law in
UNIFIED-PIPELINE / FLOW-COMPOSITE-PIPELINE: lighting and contact
shadows land at composite; the per-shot lighting record is written
there). Finish consumes composite outputs only.

### 5. Positional naming everywhere
Their `010_0050_A` address finds any stage of any shot.

Ours: the cut id (`V3-###`) is the address; stage files inside a
cut carry the cut id + stage name (`V3-042_composite.ntp`,
`V3-042_puppet.tnz`) so any file on any disk — including a TeraBox
backup — names its own home. Episode exports keep the established
`EP##-V#-MASTER.mp4` form.

## What we deliberately do not adopt

- **Kitsu** (their tracker): FULLSTACK-WIRING §0.4 holds — manifest
  + git + gates cover tracking until a second regular human joins
  production; that is the recorded revisit trigger. If it fires,
  Kitsu (AGPL-3.0) is the pre-studied candidate and the Blender
  Kitsu conventions above are its file-side half.
- **Flamenco** (their farm manager, GPL-3.0): no farm exists yet.
  Pre-approved candidate when one does.
- **SVN**: our warehouse is git/GitHub + TeraBox by house staging
  law. BAT's transferable idea — pack a cut with its dependencies
  and hashes for transport — is adopted as practice: a cut package
  moved off-machine travels with its `cut.json` + a sha256 list,
  exactly as the repo's other staged packages do.

## Templates

- `templates/cut.json` — the per-cut manifest (fields mirror the
  build-manifest compiler's per-cut record: route, assets by
  reference, gates, lighting record pointer).
- `templates/CUT-FOLDER.md` — the README dropped into each cut
  folder by the generator, stating the contract for that cut.
