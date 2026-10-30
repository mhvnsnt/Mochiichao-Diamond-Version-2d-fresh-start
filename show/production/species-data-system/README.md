# Species Data System — Gen 1 gap audit + gap fills + new-species intake

Sideline A package, 2026-10-27. **Workspace deliverable — nothing here has
been pushed to GitHub.** The design (side) lane owns repo PRs and receives
this package for landing.

## Why this package is an audit, not a rebuild

Jamar's direction was to build the Mochiioteca data layer (bios, footprints,
silhouettes, discovery) data-first for every Mochi. The audit found the
design lane had **already built most of that apparatus** (data core PR #98,
footprints PR #237, silhouettes PR #175, cries PR #193, DexView PR #228, dex
registry PR #243). Rebuilding it would have created a competing system. So
this package instead: (1) maps what exists, (2) audits every Gen-1 species
against it element by element, (3) fills only the missing pieces, in the
lane's own formats, and (4) turns the lane's format into the intake template
for the *new* species — which is where the design effort is actually aimed.

## Headline results

- **Gen 1 working roster = 49 species**, not 47: Dorowani and Gabu have
  designs, footprints, silhouettes, cries and dex entries but **no record in
  `species.json`** (Conflict 1). The "60 species" figure is the brainstorm
  file's concept count — its own header says *ideas, not canon*.
- **Media half complete:** footprints 49/49, silhouettes 49/49, cries 49/49,
  discovery states/media wired 49/49.
- **Written half is the gap:** bio_short 12/49, bio_long 0/49, body data
  ~unrecorded (pilot-six body plans only), habitat data at seed level
  (13 species).
- Validator: **343/343** audit claims re-verified against the live repo.

## Contents

| File | What it is |
|---|---|
| `AUDIT-WHAT-EXISTS.md` | The existing apparatus, with locations — read this first |
| `GAP-AUDIT.md` | Counts per element, the 7 canon conflicts, per-species matrix |
| `gap-audit.json` | The same matrix, machine-readable (49 species × 8 elements, status + source + note per cell) |
| `gap-fills/dorowani-gabu-core-records.json` | Core-format records for the 2 species missing from species.json |
| `gap-fills/body-and-discovery-fills.json` | Per-species footprint spec (from the lane manifest), body_plan (canon/derived, marked), habitat + rarity basis; height/weight TBD |
| `ALIGNMENT-MAP.md` | The draft schema field-by-field against the lane's format — lane wins; true absences named |
| `TBD-REGISTER.md` | Every unknown, owned: 6 owner decisions ◆ + 11 lane work items |
| `DESIGN-BRIEF-goddgachuu.md` | Owner-directed design brief for Goddgachuu (#400, Mythic/Neon): LOCKED design — concept 5 ruled PERFECT by the owner, the main/default version (pass-5 state: traditional Japanese anime storm clouds — bold spiral swirls, sharp silver spikes, strong gold lightning; the chest/shoulder framing is his own flowing white fur with the pearls and chest diamond set into it; the heavenly sash ruled PERFECT and untouchable — over the pass-3 legless serpent form with pass-4's steel-blue horns/antlers and yellow-gold lips, creature-catcher anime read) over the concept-1 mix, trait by trait with sources; Diablo pull cited from Western Heart canon; two owner-confirmation flags; arms question CLOSED by the lock (approved design has no arms); concept art staged in `concepts/` (1–4 design history, 5 the LOCKED main art); variant programme planned — most variations of any species: ONE MATRIX, 5 variants × all 5 colourways each = 25 core versions (jewel pool of 10 across them), a BUILD LIST (all get made), variants ~10% each for now; build list in `VARIANT-GRID-DRAFT-goddgachuu.md` (CW2–CW5 candidate names are starting suggestions, not decisions) |
| | `RESEARCH-NOTE-goddgachuu-rarity.md` | How Pokémon wires its rarest — the Mythical pattern (absent from every encounter table; distribution / authored-event only; dex-final placement; catch rate 3 when battleable) plus the extreme benchmarks below it (Feebas 6/444 tiles, Munchlax ~1%, roaming Legendaries, shiny-locks) — the research half of Goddgachuu's rarity wiring (owner ruling 2026-10-28: the rarest Mochiichao); the wiring half is the brief's rarity + typing section and species record 400 |
| `NEW-SPECIES-SHEET-TEMPLATE.md` | Intake workflow for a brand-new species: Gate 0 lock+number → data sheet → Gate 1 review → design → derived media → Gate 2 wiring; plus the 49→thousands scaling path |
| `new-species-record-template.json` | The intake record (core + dex + footprint + discovery + natural-history blocks, in lane shapes) |
| `validate_gap_audit.py` | Re-checks the audit's present/partial claims against the live repo (PAT, read-only, stdlib) |
| `validate-output.txt` | Its run: 343 checks, 343 passed |
| `source-manifest.json` | Provenance: every repo file/PR this package rests on |

## How each consumer uses it

- **Game:** nothing to re-wire — the game already reads the lane's core +
  dex registry. This package tells the game lane exactly which fields are
  still seed/provisional/null (TBD register W4–W8) and hands it the two
  missing core records (Dorowani/Gabu) for a future wiring PR.
- **Show:** the matrix's discovery/show-relevant cells + `cast.json`
  alignment show which species are episode-ready (media complete) vs
  writing-blocked (no bio). The intake template's `show_block` +
  first-appearance hook make new species arrive show-ready by construction.
- **Design lane:** `NEW-SPECIES-SHEET-TEMPLATE.md` is the working document —
  no new species gets designed until its Gate 1 data sheet passes, and the
  design is built *from* the locked sheet (body plan, anatomy that survives
  the 16px silhouette, region flavour, the one Mochi art style). Derived
  media (silhouette/footprint/cry) are pipeline outputs of the finished
  design, per the lane's existing methods.

## Scaling in one paragraph

Fix numbering now (one canonical registry — TBD D1), generate records from
one intake source instead of hand-keeping five files per species, batch new
species by region under the Flavor Law with per-batch gates, treat
provisional as a first-class flagged state, and keep forms out of the
species count. Full version: NEW-SPECIES-SHEET-TEMPLATE.md §"Scaling path".
