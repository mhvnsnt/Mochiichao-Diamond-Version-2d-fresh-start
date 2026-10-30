# CONTENT-PACK SPEC — named-entry packs with override order

**Format:** `mochiichao/content-pack/v1` · **Status:** SPEC + worked
example. The base pack described below **already exists** — it is
`src/data/core/` as it stands today; this spec names the discipline around
it so patches, regional packs, event packs, and (later) player mods have
one legal shape. No data files move.

**Lineage:** Doom WAD (`W_AddFile`: IWAD then PWADs, later lump replaces
earlier by name — CODE, TEARDOWN-id-software.md §3) → Quake PAK (same
shape, paths instead of 8-char names) → SteamPipe depots (manifest =
build identity, chunk-level updates, channel branches — DOCS,
TEARDOWN-valve.md §5) → RSDK `Data.rsdk` (one archive the engine plays —
TEARDOWN-fighting-sega-capcom.md §1). Four giants, one pattern.

---

## 1. Definitions

- **Entry** — one data file, named by its repo-relative path
  (`src/data/core/species.json`). The path is the API; contents are
  validated by that entry's schema (`src/data/core/schemas/`).
- **Pack** — an ordered set of entries + a **manifest**
  (`format`, `packId`, `version`, per-entry `path`/`bytes`/`sha256`).
  The manifest is the pack's identity: two builds with the same manifest
  set have the same game data, and a replay header can name them.
- **Stack** — the ordered list of packs in force. Resolution rule, the
  whole system in one sentence: **an entry is read from the last pack in
  the stack that contains its path.**

## 2. The stack today (base reality, not a proposal)

| Order | Pack | Contents |
|---|---|---|
| 1 (base) | `core` | `src/data/core/*.json` + `schemas/` — species, moves, learnsets, encounters, trainers, evolutions… |
| 2 | area packs | `src/data/core/encounters/*.spawn-tables.json`, `src/data/core/routes/`, `src/data/core/ecology/` — area-scoped data that already lives beside the core |
| 3 | event/patch packs | *future* — seasonal events, balance patches, show-tie-in data: new packs appended, base untouched |

A balance patch is therefore a small pack overriding `moves.json` (or a
per-move fragment file, if the core later fragments) — reviewable as a
diff, reversible by removing the pack, and named in every replay recorded
while it was live. That last property is why this spec exists.

## 3. Rules

1. **Data only.** Packs never contain code (the QuakeC road-not-taken —
   id teardown §5). Rule changes are engine changes.
2. **Schema-gated.** Every entry must validate against its schema as
   stacked (post-override). A pack that breaks validation doesn't load;
   there is no partial application.
3. **Whole-entry override.** Overrides replace entries, never merge
   inside them. (Merging JSON by key is how silent canon corruption
   happens; if finer granularity is needed, fragment the entry into
   smaller files first — as the core already does for spawn tables.)
4. **Hashes are load-bearing.** Loading verifies `sha256` per entry;
   a mismatch is a hard stop, not a warning. QA and replays cite
   manifests, not version vibes.
5. **Canon discipline unchanged.** A pack is a delivery mechanism, not a
   canon source: values still come from the owner's canon process.
   This spec deliberately says nothing about what any value should be.

## 4. Channels (SteamPipe's branch pattern, miniaturized)

A **channel** is a named stack: `stable` (core + areas), `test`
(stable + candidate patch packs). Promoting a patch = moving it from
the test stack to the stable stack. No re-upload, no copy-edit-diverge:
the same pack file, re-pointed — the depot-branch lesson.

## 5. Worked example

`content-pack-manifest.example.json` (beside this file) is a real
manifest fragment for the `core` pack, generated from main @ `bfd91cc2`
(2026-10-28): real paths, real byte counts, real sha256 of the four
largest core entries. Regenerating the full manifest is a mechanical
job for the build tooling (a `list + hash` walk); the format is what's
being adopted here.

## 6. What this does not do (yet)

- No loader code is changed by this package. The game reads
  `src/data/core/` directly today; adopting the stack means the loader
  resolves through a manifest — a small, well-bounded engine task that
  this spec defines but does not perform.
- Mod support is a *consequence* of the shape, not a shipped feature:
  a player mod would be a pack appended above the stable stack, and
  §3's rules (data-only, schema-gated, hashed) are the safety story
  when/if the owner ever opens that door.
