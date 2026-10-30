# TEARDOWN — Blender Studio open movies: the production organisation

Blender Studio is the only major studio that publishes *entire
productions* — not just the finished films but the shot files, the
asset libraries, and the working conventions — so other studios can
copy the organisation, not just admire the pictures. Thirteen-plus
open movies in (*Elephants Dream* 2006 → *Sprite Fright* 2021,
*Charge* 2022, *Wing It!* 2023, and newer in development), every one
made with open tools and released under Creative Commons Attribution.

**Licences (verified at source 2026-10-28):** the films and their
production files are **CC BY** (3.0 on the older films, 4.0 on the
current ones — per-film, check the film's page). The pipeline tools
are separate open-source projects: **Kitsu** (CGWire) AGPL-3.0,
**Flamenco** (Blender Foundation) GPL-3.0, Blender Studio add-ons
(Blender Kitsu, Shot Builder, BAT — Blender Asset Tracer) GPL.

This teardown is about the *organisation*, which is the part a
one-operator studio can actually steal. The mapping onto our tree is
`../organisation/PRODUCTION-ORGANISATION.md`; templates live beside
it.

---

## 1. How a Blender Studio production is laid out

From the Studio's own production-files write-ups (Sprite Fright
shot files, extracted from their SVN repository with BAT):

- **A shot is a package, not a file.** Each published shot ships as
  a self-contained bundle with all its dependencies. Inside it:
  - `lib/` — every linked dependency: characters, props, sets. The
    shot never owns its assets; it *links* them from the library, so
    one asset fix propagates to every shot that uses it.
  - `caches/` — cached simulation/geometry data, kept separate from
    both the library and the working files (caches are regenerable,
    so they are stored like it).
- **One file per task inside the shot.** Animation, effects, and
  lighting are separate files for the same shot, because multiple
  artists contribute to one shot and must not step on each other.
  Effects files (fire, fluid, smoke, particles — one per effect
  family where needed) link the animation output and stay otherwise
  self-contained.
- **The animation file has a contract:** a disabled collection named
  `<shot>.anim.output` into which everything the downstream stages
  need is linked. Inside that collection the structure is law;
  outside it the animator has free rein (helpers, references,
  scratch). Downstream stages consume *only* the output collection.
- **Everything converges at the lighting stage.** The lighting file
  is the assembly point: animation output + effects collections are
  brought together there, and the shot is rendered from that stage.
  Data flow is one-directional: lib → anim → fx → lighting → render.
- **Naming is positional and boring:** shots are addressed by
  sequence/shot numbers (e.g. `010_0050_A`) everywhere — files,
  collections, tasks, renders — so any human or script can find any
  stage of any shot from its address alone.

## 2. The machinery around the files

- **Kitsu (CGWire)** is the production tracker: every asset and shot
  is a record with tasks per department, statuses, and previews.
  The **Blender Kitsu add-on** enforces the conventions from inside
  Blender and talks to the tracker; the **Shot Builder** add-on
  *constructs* a shot's task files from the tracker's data — the
  folder structure is generated, not hand-made, so it cannot drift.
- **Flamenco** is the render manager: jobs are submitted per shot,
  workers are interchangeable machines, and previews flow back for
  review (the Render Review add-on pulls farm output into the
  sequence editor). Studios copying the pipeline (documented cases:
  full TV series) report re-exporting entire episodes in minutes
  once the farm + conventions are in place.
- **Version control is SVN** in the Studio's own productions (chosen
  for binary-file friendliness), with **BAT (Blender Asset Tracer)**
  as the tool that packs a shot with its dependencies for
  publication or transfer — the thing that makes "a shot is a
  package" mechanically true.
- **The pipeline itself is open and versioned** (blender-studio-tools
  / blender-studio-pipeline repos): TD guides document the Kitsu
  server setup, the shared-folder population, and the add-on set, so
  the conventions are inspectable code + docs, not folklore.

## 3. What transfers to a 2D puppet pipeline — and what doesn't

Transfers directly (adopted in PRODUCTION-ORGANISATION.md):

1. **Shots as packages with a linked-library rule.** Our cuts already
   behave this way informally (plates + rigs + renders in
   `ep01-finish/`); the spec makes the `lib/`-style separation and
   the no-embedded-copies rule explicit for episodes.
2. **One file per task + an output contract.** Our stages (board →
   puppet → composite → finish) map to their anim → fx → lighting;
   the transferable law is the *contract*: each stage publishes a
   named output the next stage consumes, and scratch stays private
   to the stage.
3. **Assembly happens at one named stage.** Their lighting file =
   our composite stage (Natron graphs / flow-composite pipeline);
   nothing downstream of it re-opens upstream files.
4. **Positional naming everywhere.** Our cut ids (`V3-###`) already
   do this; the spec extends the same address discipline to stage
   files inside a cut.
5. **Generated structure beats hand-made structure.** Shot Builder's
   lesson: folder layouts should be emitted by a tool from the
   episode manifest (we have a build-manifest compiler — the spec
   wires the template to it) rather than created by hand per cut.

Does not transfer (recorded, not adopted):

- **Kitsu itself, for now.** FULLSTACK-WIRING §0.4 already weighed
  it: manifest + git + gate scripts cover tracking at our scale;
  the revisit trigger is a second regular human in production. The
  Blender Studio evidence doesn't change that calculus — it
  confirms the *conventions* are what matter at small scale, since
  their own add-ons exist to enforce conventions the tracker holds.
- **Flamenco.** No render farm exists here (2 vCPU VM + owner's
  machine + borrowed GPU seats). If a farm day comes, Flamenco
  (GPL-3.0) is the pre-approved candidate; today it would be a
  manager with no workers.
- **SVN.** Our warehouse law is GitHub/TeraBox + git; BAT's *idea*
  (pack a shot with its dependencies + hashes) transfers as a
  manifest practice, not as SVN.

## Sources

- Blender Studio, "Exploring the production files" (shot package,
  lib/, caches/, per-task files, anim.output, lighting assembly):
  https://studio.blender.org/blog/exploring-production-files/
- Blender Studio films index (CC BY productions):
  https://studio.blender.org/films/
- Blender Studio pipeline repos (Kitsu/Flamenco/BAT/Shot Builder
  conventions, TD guides): https://projects.blender.org/studio/
- "Il Baracchino" production report — a full series built by
  emulating this pipeline one-to-one (Kitsu + Shot Builder +
  Flamenco + SVN): https://www.blender.org (feature story, 2025)
