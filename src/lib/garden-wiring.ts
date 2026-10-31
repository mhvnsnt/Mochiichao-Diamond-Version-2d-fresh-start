/**
 * Mochi Garden wiring — pass 2, pure logic, no network, no imports
 * from game screens. This is the code that closes the Garden wiring
 * gap: persisted records, cocoon timer, farm, race, sparring, breeding.
 *
 * Rules only, Mochiichao values, Mochiichao names. No character,
 * dialogue, cry, logo, town name, art, or sound from any other game.
 * Fruit map below is a PROPOSED data file (Mars can change one line);
 * it is not presented as Mars-approved canon.
 */
import {
  GardenStats, GardenCreature, clamp, applyGardenItem, gardenForm,
  dominantStat, typeVariant,
} from './mochiichao-systems';
import { GARDEN_CRITTERS } from './garden-data';
import { deriveWorldState, type WorldClockAnchor } from './worldClock';
import {
  solveHabitat,
  type HabitatPlacement,
  type HabitatRecipe,
  type SolveHabitatOptions,
  type SolvedHabitat,
} from './garden-habitats';

export interface FarmPlot {
  id: string;
  seed: string | null;
  plantedAt: number; // in-game minutes, Garden time only while save loaded
  readyAt: number;
  harvested: boolean;
}

export interface GardenSaveRecord extends GardenCreature {
  // All extended fields are optional so a plain GardenCreature from
  // main (pass 3 store) is assignable, and upgradeGardenRecord fills
  // defaults on first Garden use. No other lane's record is clobbered.
  gardenAge?: number; // Garden Years, 1 year = 60 in-game Garden minutes
  rebirths?: number;
  mythic?: boolean;
  personality?: string;
  favouriteFruit?: string;
  cocoon?: { active: boolean; startedAt: number; endsAt: number; targetForm: string } | null;
  farm?: FarmPlot[];
  raceWins?: number;
  sparWins?: number;
  egg?: { speciesId: string; parentA: string; parentB: string; stepsRemaining: number } | null;
  collectedCritters?: string[];
  /** W3 placement block: zoneId -> cell key -> placed item. See the W3 section at the end of this file. */
  placements?: GardenPlacements;
  /** W3 derived cache: zoneId -> slice-1 solver output for that zone. Derived, never hand-edited. */
  habitats?: GardenZoneHabitats;
}

/** Upgrade a pass-3 GardenCreature to a full GardenSaveRecord, defaults only. */
export function upgradeGardenRecord(
  rec: GardenCreature | undefined, speciesId: string, seed: number,
): GardenSaveRecord {
  const base = rec || newGardenRecord(speciesId, seed);
  return {
    ...base,
    gardenAge: (base as GardenSaveRecord).gardenAge ?? 0,
    rebirths: (base as GardenSaveRecord).rebirths ?? 0,
    mythic: (base as GardenSaveRecord).mythic ?? false,
    personality: (base as GardenSaveRecord).personality ?? 'Curious',
    favouriteFruit: (base as GardenSaveRecord).favouriteFruit ?? 'Aqua Fruit',
    cocoon: (base as GardenSaveRecord).cocoon ?? null,
    farm: (base as GardenSaveRecord).farm ?? (newGardenRecord(speciesId, seed).farm as FarmPlot[]),
    raceWins: (base as GardenSaveRecord).raceWins ?? 0,
    sparWins: (base as GardenSaveRecord).sparWins ?? 0,
    egg: (base as GardenSaveRecord).egg ?? null,
    collectedCritters: (base as GardenSaveRecord).collectedCritters ?? [],
    placements: (base as GardenSaveRecord).placements ?? {},
    habitats: (base as GardenSaveRecord).habitats ?? {},
  };
}

export const ZERO_STATS: GardenStats = { dive: 0, glide: 0, sprint: 0, might: 0, endurance: 0 };

export function newGardenRecord(speciesId: string, seed: number): GardenSaveRecord {
  return {
    speciesId, garden: { ...ZERO_STATS }, careScore: 0, bond: 0,
    careMistakes: 0, trainingSessions: 0, colorwaySeed: seed, parts: [],
    gardenAge: 0, rebirths: 0, mythic: false, personality: 'Curious',
    favouriteFruit: 'Aqua Fruit',
    cocoon: null,
    farm: [
      { id: 'plot-1', seed: null, plantedAt: 0, readyAt: 0, harvested: false },
      { id: 'plot-2', seed: null, plantedAt: 0, readyAt: 0, harvested: false },
      { id: 'plot-3', seed: null, plantedAt: 0, readyAt: 0, harvested: false },
    ],
    raceWins: 0, sparWins: 0, egg: null, collectedCritters: [],
    placements: {}, habitats: {},
  };
}

/**
 * Garden "now" in game minutes — S1 TAIL part 2 (DORO-DERIVED design,
 * not an owner ruling): the Garden becomes a reader of the world
 * clock instead of its own manual counter. An anchored save reads
 * the world clock's totalGameMinutes (the #19 running total, from
 * worldClock.ts); an unanchored save keeps the manual gardenMinutes
 * counter exactly as before, so old saves still work before the
 * engine anchors them. plantPlot / harvestPlot / enterCocoon /
 * tickCocoon are unchanged and take this value as their nowMinutes
 * — DURATIONS ARE UNCHANGED (plots +7, cocoon +10), only the driver
 * changes. Two consequences, stated plainly, not hidden:
 * (1) at the world clock's 4 game-minutes/real-second rate, 7 world
 * minutes pass in under 2 real seconds, so anchored plots ripen
 * fast — pacing redesign belongs to S14's phase-4 garden machine
 * (the 480-minute berry model), and no new duration is invented
 * here; (2) plots/cocoons planted under the old manual counter
 * carry readyAt/endsAt in that counter's small scale, so they read
 * as ready on the first world-clock read — a one-time migration
 * artefact, not a second clock kept alongside.
 */
export function gardenNowMinutes(
  anchor: WorldClockAnchor | null | undefined,
  fallbackMinutes: number,
  nowMs: number,
): number {
  if (!anchor) return fallbackMinutes;
  return deriveWorldState(anchor, nowMs).totalGameMinutes;
}

/** Cocoon: enter at Form I/II threshold, emerge after 10 Garden minutes. */
export function enterCocoon(rec: GardenSaveRecord, nowMinutes: number): GardenSaveRecord {
  const form = gardenForm(rec.garden);
  if (form === 'Base' || rec.cocoon) return rec;
  return { ...rec, cocoon: { active: true, startedAt: nowMinutes, endsAt: nowMinutes + 10, targetForm: form } };
}
export function tickCocoon(rec: GardenSaveRecord, nowMinutes: number): GardenSaveRecord {
  if (!rec.cocoon || nowMinutes < rec.cocoon.endsAt) return rec;
  return { ...rec, cocoon: null, gardenAge: rec.gardenAge + 0.1 };
}

/** Farm: plant a seed, ready after 7 Garden minutes, harvest gives fruit. */
export function plantPlot(rec: GardenSaveRecord, plotId: string, seed: string, nowMinutes: number): GardenSaveRecord {
  return {
    ...rec,
    farm: (rec.farm ?? []).map(p => p.id === plotId && !p.seed
      ? { ...p, seed, plantedAt: nowMinutes, readyAt: nowMinutes + 7, harvested: false }
      : p),
  };
}
export function harvestPlot(rec: GardenSaveRecord, plotId: string, nowMinutes: number): { rec: GardenSaveRecord; fruit: string | null } {
  const plot = (rec.farm ?? []).find(p => p.id === plotId);
  if (!plot || !plot.seed || nowMinutes < plot.readyAt) return { rec, fruit: null };
  const fruit = plot.seed;
  return {
    rec: { ...rec, farm: (rec.farm ?? []).map(p => p.id === plotId ? { ...p, seed: null, harvested: true } : p) },
    fruit,
  };
}

/** Race: speed = sprint + glide, fade = endurance. Higher score wins. */
export function raceScore(g: GardenStats): number {
  const speed = g.sprint + g.glide;
  const fade = Math.max(0, 50 - g.endurance);
  return speed * 2 - fade;
}
export function runRace(a: GardenStats, b: GardenStats): 'A' | 'B' | 'Tie' {
  const sa = raceScore(a), sb = raceScore(b);
  return sa > sb ? 'A' : sb > sa ? 'B' : 'Tie';
}

/** Sparring: auto-battler score. Might = damage, endurance = HP, sprint = ring speed, dive/glide = dodge. */
export function sparScore(g: GardenStats): number {
  return g.might * 3 + g.endurance * 2 + g.sprint + Math.floor((g.dive + g.glide) / 2);
}
export function runSpar(a: GardenStats, b: GardenStats): 'A' | 'B' | 'Tie' {
  const sa = sparScore(a), sb = sparScore(b);
  return sa > sb ? 'A' : sb > sa ? 'B' : 'Tie';
}

/**
 * Breeding / Bonding Season Egg.
 * Default species = base form of the higher-Bond parent (spec rule),
 * player may override to either parent's species in the UI — never a
 * silent mother's-species default, never a hybrid species.
 * Grades: 50/50 per stat, higher grade wins visible 70% — modelled
 * here as: higher parent stat wins 70% of the time via a deterministic
 * seed (0-99, Mars can change the seed, no random module in save).
 * Garden Form, battle level, Mythic Form, Rebirth count: NOT inherited.
 * Mythic creatures cannot breed.
 */
export function createBreedingEgg(
  parentA: GardenSaveRecord, parentB: GardenSaveRecord,
  overrideSpeciesId: string | null, seed70: number,
): GardenSaveRecord['egg'] | null {
  if (parentA.mythic || parentB.mythic) return null;
  const higher = parentA.bond >= parentB.bond ? parentA : parentB;
  const speciesId = overrideSpeciesId || higher.speciesId;
  return {
    speciesId,
    parentA: parentA.speciesId, parentB: parentB.speciesId,
    stepsRemaining: 100,
  };
}
/**
 * Bonding Season gate (manifest §2: Bond >50 gates breeding).
 * Pure predicate only — it does not change createBreedingEgg and does
 * not decide species choice (HELD, Mars decides). Threshold 50 is
 * manifest-stated, not invented here.
 */
export function canBreed(parentA: GardenSaveRecord, parentB: GardenSaveRecord): boolean {
  return !parentA.mythic && !parentB.mythic && parentA.bond > 50 && parentB.bond > 50;
}

/**
 * Egg steps (daycare hatch-task structure, manifest §2/§8): the egg's
 * steps counter counts down as the creature walks/plays, and at 0 the
 * egg hatches. No new numbers: the 100-step start is pass 2's existing
 * value, 0 is the hatch threshold. hatching clears the egg and returns
 * its species; the caller builds the new record with newGardenRecord
 * + inheritedGardenStats (both already on main).
 */
export function tickEggSteps(rec: GardenSaveRecord, steps: number): GardenSaveRecord {
  if (!rec.egg) return rec;
  return { ...rec, egg: { ...rec.egg, stepsRemaining: Math.max(0, rec.egg.stepsRemaining - steps) } };
}
export function hatchEgg(rec: GardenSaveRecord): { rec: GardenSaveRecord; hatchedSpeciesId: string | null } {
  if (!rec.egg || rec.egg.stepsRemaining > 0) return { rec, hatchedSpeciesId: null };
  return { rec: { ...rec, egg: null }, hatchedSpeciesId: rec.egg.speciesId };
}

/**
 * Garden Critter application (manifest §3: critters raise a stat and add
 * a part). Stat, part slot, and critter id all come from GARDEN_CRITTERS
 * in garden-data.ts. The stat gain is a required caller parameter —
 * no Mars-approved critter gain value exists yet, so none is invented
 * here. Unknown critter id: record returned unchanged.
 */
export function applyCritter(rec: GardenSaveRecord, critterId: string, statGain: number): GardenSaveRecord {
  const critter = GARDEN_CRITTERS.find(c => c.id === critterId);
  if (!critter) return rec;
  const garden = applyGardenItem(rec.garden, { [critter.stat]: statGain });
  const parts = rec.parts.includes(critter.part) ? rec.parts : [...rec.parts, critter.part];
  const collected = (rec.collectedCritters ?? []).includes(critterId)
    ? rec.collectedCritters : [...(rec.collectedCritters ?? []), critterId];
  return { ...rec, garden, parts, collectedCritters: collected };
}

export function inheritedGardenStats(a: GardenStats, b: GardenStats, seed70: number): GardenStats {
  const pick = (x: number, y: number): number => {
    const hi = Math.max(x, y);
    // seed70 in 0-99: <70 picks the higher parent stat, else the lower.
    return seed70 < 70 ? hi : Math.min(x, y);
  };
  return {
    dive: clamp(pick(a.dive, b.dive), 0, 99),
    glide: clamp(pick(a.glide, b.glide), 0, 99),
    sprint: clamp(pick(a.sprint, b.sprint), 0, 99),
    might: clamp(pick(a.might, b.might), 0, 99),
    endurance: clamp(pick(a.endurance, b.endurance), 0, 99),
  };
}

/** Data Rebirth: Bond >50 = Rebirth Egg, stats halved, parts kept. */
export function dataRebirth(rec: GardenSaveRecord): GardenSaveRecord {
  if (rec.bond <= 50) return rec;
  return {
    ...rec,
    garden: {
      dive: Math.floor(rec.garden.dive / 2), glide: Math.floor(rec.garden.glide / 2),
      sprint: Math.floor(rec.garden.sprint / 2), might: Math.floor(rec.garden.might / 2),
      endurance: Math.floor(rec.garden.endurance / 2),
    },
    rebirths: (rec.rebirths ?? 0) + 1, gardenAge: 0, cocoon: null,
    egg: { speciesId: rec.speciesId, parentA: rec.speciesId, parentB: rec.speciesId, stepsRemaining: 100 },
  };
}

export function gardenSummary(rec: GardenSaveRecord): string {
  return `${rec.speciesId} — Form ${gardenForm(rec.garden)}, dominant ${dominantStat(rec.garden)}, variant ${typeVariant(rec.garden) || 'none'}, Bond ${rec.bond}, Rebirths ${rec.rebirths}, Mythic ${rec.mythic ? 'yes' : 'no'}`;
}
export { applyGardenItem };

/**
 * W3 — Placement records in the Garden save (gap-fill S14 slice 3, 2026-10-31).
 *
 * DQB2 WIRING-PLAN W3: GardenSaveRecord gains a placements block (per-zone
 * cell -> { itemId, rotation }, chunked by Garden zone) plus the derived
 * habitats cache (slice-1 solver output per zone, recomputed on placement
 * change — derived, never hand-edited).
 *
 * Rules, all stated here so a later slice can be checked against them:
 * - Placements is a two-level map: zoneId -> cell key -> cell. A cell key
 *   is the caller's distinct position key within the zone (e.g. "x,y");
 *   this module never parses it, and it never invents a coordinate grid.
 * - Rotation is the placed item's facing, a finite number. No
 *   quarter-turn restriction is imposed — no canon rotation step exists
 *   in the plan, so none is invented here.
 * - All setters are pure: inputs are only read, never mutated; each
 *   returns a new record with copied maps. Removing the last cell of a
 *   zone drops the zone key; removing an absent cell returns the record
 *   unchanged (same reference).
 * - Setters invalidate the derived cache: any placement change returns
 *   the record with habitats cleared to {}, so the cache never claims
 *   to describe placements it does not match. Clearing is invalidation,
 *   not a solved value — recomputeHabitats is the only function that
 *   writes solved values into the cache.
 * - The solver conversion carries itemId only: a W3 cell has no
 *   material, richness, band, or category data, so converted cells read
 *   categories from the caller's optional categoriesFor callback
 *   (default: none), material null, richness 0, band 0. That means
 *   extent counts the zone's cells and finish/character read from
 *   defaults until an item catalogue lands — stated, not hidden.
 *   Category requirements match only through categoriesFor.
 * - The per-zone cap is slice 1's named parameter, applied per zone
 *   with alreadyRegistered 0 (one habitat per zone per record), so a
 *   cap of 0 recognises nothing and a cap of 1 or more allows the
 *   zone's habitat.
 * - upgradeGardenRecord only defaults an absent placements block to {}
 *   and an absent cache to {} — it never recomputes, because
 *   recomputing needs caller-supplied recipes. Old saves therefore load
 *   with an empty placements block (additive-only migration), and
 *   plantPlot / harvestPlot / cocoon functions are untouched by this
 *   slice (verified by the diff: this section plus the two optional
 *   record fields and their defaults, nothing else).
 *
 * Deliberately NOT here: NO host (GardenView and gameStore do not call
 * these functions yet — staging locks in garden-placements.test.ts);
 * NO composition cache (variants/combos from slice 2 are not stored
 * here — the cache holds the slice-1 base only); NO item catalogue
 * (no material/richness/band/categories authored); NO attraction
 * binding (W4); NO recipe data authored (owner slot S1).
 */

/** One placed item in a Garden zone, at a distinct position key. */
export interface GardenPlacementCell {
  itemId: string;
  /** Placed facing, a finite number; no step restriction is imposed. */
  rotation: number;
}

/** Per-zone placements: zoneId -> cell key -> placed item. */
export type GardenPlacements = Record<string, Record<string, GardenPlacementCell>>;

/** Derived habitats cache: zoneId -> slice-1 solver output for that zone. */
export type GardenZoneHabitats = Record<string, SolvedHabitat | null>;

/** Options for the W3 solver reads: slice-1 options plus the category lookup. */
export interface GardenPlacementSolveOptions extends SolveHabitatOptions {
  /** Category tags for an itemId, for wildcard requirements. Defaults to none. */
  categoriesFor?: (itemId: string) => readonly string[];
}

function placementFail(message: string): never {
  throw new Error(`gardenPlacement: ${message}`);
}

function placementKey(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) placementFail(`${what} must be a non-empty string`);
  return value as string;
}

function validatePlacementCell(cell: GardenPlacementCell, what: string): void {
  if (cell === null || typeof cell !== "object") placementFail(`${what} must be an object`);
  placementKey(cell.itemId, `${what} itemId`);
  if (typeof cell.rotation !== "number" || !Number.isFinite(cell.rotation)) {
    placementFail(`${what} rotation must be a finite number`);
  }
}

/** The empty placements block: the value old saves migrate to. */
export function emptyPlacements(): GardenPlacements {
  return {};
}

/**
 * Place (or replace) one cell in a zone. Pure: returns a new record;
 * the input record and its maps are never mutated. Invalidates the
 * derived habitats cache (cleared to {}).
 */
export function setPlacementCell(
  rec: GardenSaveRecord,
  zoneId: string,
  cellKey: string,
  cell: GardenPlacementCell,
): GardenSaveRecord {
  placementKey(zoneId, "zoneId");
  placementKey(cellKey, "cellKey");
  validatePlacementCell(cell, `cell "${cellKey}"`);
  const placements = rec.placements ?? {};
  const zone = placements[zoneId] ?? {};
  return {
    ...rec,
    placements: { ...placements, [zoneId]: { ...zone, [cellKey]: { ...cell } } },
    habitats: {},
  };
}

/**
 * Remove one cell from a zone. Removing the last cell of a zone drops
 * the zone key. Removing an absent cell or zone returns the record
 * unchanged (same reference). Invalidates the cache on a real removal.
 */
export function removePlacementCell(
  rec: GardenSaveRecord,
  zoneId: string,
  cellKey: string,
): GardenSaveRecord {
  placementKey(zoneId, "zoneId");
  placementKey(cellKey, "cellKey");
  const placements = rec.placements ?? {};
  const zone = placements[zoneId];
  if (zone === undefined || zone[cellKey] === undefined) return rec;
  const nextZone = { ...zone };
  delete nextZone[cellKey];
  const nextPlacements = { ...placements };
  if (Object.keys(nextZone).length === 0) {
    delete nextPlacements[zoneId];
  } else {
    nextPlacements[zoneId] = nextZone;
  }
  return { ...rec, placements: nextPlacements, habitats: {} };
}

/** Cells of one zone, in zone-map order, as copies (treat as read-only). */
export function placementCellsInZone(
  rec: GardenSaveRecord,
  zoneId: string,
): Array<{ key: string; cell: GardenPlacementCell }> {
  placementKey(zoneId, "zoneId");
  const zone = (rec.placements ?? {})[zoneId] ?? {};
  return Object.entries(zone).map(([key, cell]) => ({ key, cell: { ...cell } }));
}

/**
 * Convert one zone's placements to the slice-1 solver's placement
 * shape. ItemId only: categories come from the caller's callback,
 * material/richness/band read solver defaults (see the W3 header).
 */
export function zonePlacementToHabitatPlacement(
  rec: GardenSaveRecord,
  zoneId: string,
  categoriesFor?: (itemId: string) => readonly string[],
): HabitatPlacement {
  placementKey(zoneId, "zoneId");
  if (categoriesFor !== undefined && typeof categoriesFor !== "function") {
    placementFail("categoriesFor must be a function");
  }
  const cells = placementCellsInZone(rec, zoneId).map(({ key, cell }) => ({
    id: key,
    itemId: cell.itemId,
    categories: categoriesFor ? [...categoriesFor(cell.itemId)] : [],
  }));
  return { zoneId, cells };
}

/**
 * Recognise one zone's habitat from its placements, or null.
 * Recipes are caller-supplied; no recipe content lives here.
 */
export function solveZoneHabitat(
  rec: GardenSaveRecord,
  zoneId: string,
  recipes: readonly HabitatRecipe[],
  options: GardenPlacementSolveOptions = {},
): SolvedHabitat | null {
  const placement = zonePlacementToHabitatPlacement(rec, zoneId, options.categoriesFor);
  return solveHabitat(placement, recipes, options);
}

/**
 * Recompute the derived habitats cache for every zone that has
 * placements. Pure: returns a new record; the input record is never
 * mutated, and farm/cocoon/egg and every other record field ride
 * through unchanged. Zones with no placements get no cache entry.
 */
export function recomputeHabitats(
  rec: GardenSaveRecord,
  recipes: readonly HabitatRecipe[],
  options: GardenPlacementSolveOptions = {},
): GardenSaveRecord {
  const placements = rec.placements ?? {};
  const habitats: GardenZoneHabitats = {};
  for (const zoneId of Object.keys(placements)) {
    habitats[zoneId] = solveZoneHabitat(rec, zoneId, recipes, options);
  }
  return { ...rec, habitats };
}
