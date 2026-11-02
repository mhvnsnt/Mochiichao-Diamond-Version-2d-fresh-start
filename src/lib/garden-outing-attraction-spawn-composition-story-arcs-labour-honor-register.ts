/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn + composition + story + arcs + labour
 * + honour + register
 * — one outing plus its Garden news plus what its journey
 * brings home plus what the Garden does on its own plus what
 * its zones recognise as habitats plus what those habitats
 * attract plus what that attraction means for spawn rows
 * plus what the composition pass says about a recognised
 * habitat plus what the story beats say about who is present
 * plus what the arc beats say about each resident's arc
 * plus whether each caller-named Garden job runs or idles
 * plus what the caller-supplied honour sources add up to
 * plus what the caller-supplied Garden register lists,
 * pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-attraction-plus-spawn-plus-composition-
 *   plus-story-plus-arcs-plus-labour-plus-honour bundle from
 *   garden-outing-attraction-spawn-composition-story-arcs-labour-honor
 *   (slice 58);
 * - one register reading via garden-register's allResidents,
 *   registerSummary, and homeRecognised, over a
 *   caller-supplied register and a caller-supplied derived
 *   habitats cache (zoneId -> SolvedHabitat | null).
 *
 * The register section is NOT computed from the bundle's outing,
 * bond, decay, comfort, thanks, level, record, check-in,
 * snapshot, journey, unlock, individual, teacher, movement,
 * arrival, research, discovery, news, inbound, migration,
 * story, arc, attraction, spawn, composition, labour, or
 * honour values. In particular it is NOT read off the bundle's
 * habitats section, story residents, arc residents, labour
 * statuses, or honour entries: the register and the habitats
 * cache are caller-supplied, never taken from the bundle. No
 * order is invented between the bundle and the register
 * section beyond each read's own order. A register reading is
 * a summary this module never stores or registers in live
 * play, and no record is appended to any log here.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged register and NO order invented between the
 *   outing-attraction-spawn-composition-story-arcs-labour-
 *   honour bundle and the register section beyond each
 *   section's own order;
 * - NO reconciliation of the two sections' pictures: the
 *   register section's facts are exactly what garden-register
 *   reports over the caller-supplied register and cache, and
 *   the bundle's facts are exactly what
 *   gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor
 *   reports over its own inputs;
 * - NO register reading computed from a bundle value (above):
 *   residents, homes, preferences, and the habitats cache are
 *   caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement
 *   reading, an arrival reading, a research reading, a
 *   discovery candidate, a news item, an inbound reading, a
 *   migration, a story beat or arc inside the bundle, an
 *   attraction reading, a spawn annotation, a habitat
 *   reading, a composition reading, a story reading, an arc
 *   reading, a labour status, or an honour entry;
 * - NO register writer: this module never lists a resident,
 *   assigns or clears a home, sets preferences, or removes a
 *   resident — it only reads the register the caller hands
 *   it, and no record is appended to any log here;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, spawn, composition,
 *   labour, honour, or register writer;
 * - NO resident, zone, habitat, recipe, stock, preference,
 *   or honour-source data authored for any resident or
 *   habitat (owner slots S1/S5 in the wiring plan, never
 *   filled here; all ids are caller-supplied);
 * - NO numeric effect of a register count or a recognised
 *   flag on tiers, richness, weights, stock, or spawn
 *   behaviour, and NO encounter, spawn, or route decision
 *   (whether a register reading is consulted anywhere is a
 *   host decision, not this read's);
 * - NO manufactured-booster data and NO honour or money
 *   inflow (inherited exclusions from garden-inbound);
 * - NO season/festival/weather, species, place, or range
 *   vocabulary authored (all ids are opaque caller strings;
 *   the #102 range rule is the host's filter);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a register reading is applied anywhere is
 *   a host decision, not this read's;
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, both autonomous cursors,
 *   the story cursor, and the arc cursor;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle
 * and every entry and list inside it are fresh objects and
 * fresh arrays. Loud failures (throw) on a malformed input
 * bundle and on any failure propagated from either composed
 * read.
 */

import {
  gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonor,
  type GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs,
} from "./garden-outing-attraction-spawn-composition-story-arcs-labour-honor";
import {
  allResidents,
  homeRecognised,
  registerSummary,
  type GardenRegister,
  type GardenRegisterEntry,
} from "./garden-register";
import type { SolvedHabitat } from "./garden-habitats";

/** The register section's inputs: a caller-supplied register and habitats cache. */
export interface RegisterInputs {
  /** The register to read, as the caller built it (opaque ids). */
  register: GardenRegister;
  /** Derived habitats cache, zoneId -> solved habitat or null, as the caller built it. */
  zoneHabitats: Readonly<Record<string, SolvedHabitat | null>>;
}

/** The register section's report: the register read, exactly as garden-register reports it, copied fresh. */
export interface RegisterReport {
  /** Every listed resident, in register order, copied fresh. */
  entries: GardenRegisterEntry[];
  /** Counts for the register: listed, assigned, unassigned. */
  summary: { listed: number; assigned: number; unassigned: number };
  /** Whether each listed resident's assigned home is recognised, by resident id; null when unlisted or unassigned (no home to recognise). */
  recognised: Record<string, boolean | null>;
}

/** The inputs one outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour-plus-register bundle is composed from. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs {
  /** The outing-attraction-spawn-composition-story-arcs-labour-honour bundle's inputs, as slice 58 takes them. */
  outingAttractionSpawnCompositionStoryArcsLabourHonor: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorInputs;
  /** The register section's inputs. */
  register: RegisterInputs;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows plus what the composition pass says about a recognised habitat plus what the story beats say about who is present plus what the arc beats say about each resident's arc plus whether each caller-named Garden job runs or idles plus what the caller-supplied honour sources add up to plus what the caller-supplied Garden register lists. */
export interface GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister {
  /** The outing-plus-attraction-plus-spawn-plus-composition-plus-story-plus-arcs-plus-labour-plus-honour bundle, exactly as slice 58 reports it. */
  outingAttractionSpawnCompositionStoryArcsLabourHonor: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonor;
  /** The register reading, exactly as garden-register reports it, copied fresh. */
  register: RegisterReport;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows plus what the
 * composition pass says about a recognised habitat plus what
 * the story beats say about who is present plus what the arc
 * beats say about each resident's arc plus whether each
 * caller-named Garden job runs or idles plus what the
 * caller-supplied honour sources add up to plus what the
 * caller-supplied Garden register lists:
 * outing-attraction-spawn-composition-story-arcs-labour-honour
 * bundle + one register reading, each exactly as its own read
 * reports it, side by side, with no merged register and no
 * reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister(
  inputs: GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegisterInputs,
): GardenOutingAttractionSpawnCompositionStoryArcsLabourHonorRegister {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register: inputs must be an object",
    );
  }
  if (
    inputs.outingAttractionSpawnCompositionStoryArcsLabourHonor === null ||
    typeof inputs.outingAttractionSpawnCompositionStoryArcsLabourHonor !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register: outingAttractionSpawnCompositionStoryArcsLabourHonor inputs must be an object",
    );
  }
  if (inputs.register === null || typeof inputs.register !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register: register inputs must be an object",
    );
  }
  if (
    inputs.register.register === null ||
    typeof inputs.register.register !== "object" ||
    Array.isArray(inputs.register.register)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register: register must be an object",
    );
  }
  if (
    inputs.register.zoneHabitats === null ||
    typeof inputs.register.zoneHabitats !== "object" ||
    Array.isArray(inputs.register.zoneHabitats)
  ) {
    throw new Error(
      "garden-outing-attraction-spawn-composition-story-arcs-labour-honor-register: zoneHabitats must be an object",
    );
  }
  const outingAttractionSpawnCompositionStoryArcsLabourHonor =
    gardenOutingAttractionSpawnCompositionStoryArcsLabourHonor(
      inputs.outingAttractionSpawnCompositionStoryArcsLabourHonor,
    );
  const register: GardenRegister = inputs.register.register;
  const zoneHabitats: Readonly<Record<string, SolvedHabitat | null>> =
    inputs.register.zoneHabitats;
  const entries: GardenRegisterEntry[] = allResidents(register);
  const summary = registerSummary(register);
  const recognised: Record<string, boolean | null> = {};
  for (const entry of entries) {
    recognised[entry.residentId] = homeRecognised(register, entry.residentId, zoneHabitats);
  }
  return {
    outingAttractionSpawnCompositionStoryArcsLabourHonor,
    register: {
      entries,
      summary: { ...summary },
      recognised,
    },
  };
}
