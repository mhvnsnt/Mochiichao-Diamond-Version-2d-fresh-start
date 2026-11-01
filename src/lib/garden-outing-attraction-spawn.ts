/**
 * B3 §2.2 + §2.3 + §2.5 + §2.6 + bonds + decay + comfort + thanks
 * + level + records + check-in + snapshot + journey + unlocks
 * + individual + teachers + movement + arrivals + research
 * + discovery + news + inbound + autonomous + habitats
 * + attraction + spawn — one outing plus its Garden news plus
 * what its journey brings home plus what the Garden does on its
 * own plus what its zones recognise as habitats plus what those
 * habitats attract plus what that attraction means for spawn
 * rows, pure library form.
 *
 * This module composes two already-landed reads and invents no
 * new section and no new rule. It calls the existing reads and
 * reports exactly what they return, side by side:
 * - the outing-plus-habitats-plus-attraction bundle from
 *   garden-outing-attraction (slice 52: the outing bundle plus
 *   one per-creature bond list, one effective-bond breakdown,
 *   one comfort day, one thanks presentation, one Garden level
 *   summary, one bridge record, one check-in beat, one Garden
 *   snapshot, one Garden journey, one Garden unlock evaluation,
 *   one per-creature individual bond summary, one teacher
 *   reading per caller-named teacher entry, one movement
 *   reading per caller-named movement entry, one arrivals
 *   reading per caller-named arrival entry, one research
 *   reading per caller-named research entry, one discovery
 *   reading per caller-named discovery entry, one news reading
 *   per caller-named news entry, one inbound reading per
 *   caller-named inbound entry, one autonomous reading per
 *   caller-named autonomous entry, one habitat reading per
 *   caller-named habitat entry, and one attraction reading per
 *   caller-named attraction entry, each exactly as its own read
 *   reports it);
 * - one spawn annotation per caller-named spawn entry, in
 *   caller order, via garden-attraction's attractSpawnRows,
 *   over the richness of the attraction reading that entry
 *   NAMES (by id) from the bundle's attraction section.
 *
 * The spawn section is NOT computed from the outing-habitats
 * section's outing, bonds, decay, comfort, thanks, level,
 * record, check-in, snapshot, journey, unlock, individual,
 * teacher, movement, arrival, research, discovery, news,
 * inbound, migration, story, arc, or habitat values, and it is
 * NOT computed from an attraction entry's solved habitats
 * directly — it reads only the named reading's already-reported
 * richness, exactly as the bundle reports it. Which reading a
 * spawn entry names is the caller's decision, encoded in the
 * input; a name with no matching reading is a loud failure,
 * never a silent fallback to another reading or to an empty
 * richness. A row's species, weight, levels, method, order and
 * every other field ride along byte-for-byte — this binding
 * NEVER adds spawn-table stock and NEVER reweights a table
 * (garden-attraction's own rule, inherited): a row is marked
 * attracted with the named reading's richness for its class,
 * or unattracted with richness 0. Any future host that maps
 * richness to a weight does so with its own authored bands; no
 * band lives here, and no weight changes here.
 * The bundle itself carries no merged residents field, no
 * total-across-spawn-entries field, no spawn level, score,
 * threshold, or ranking on any reading beyond the reads' own
 * rules, no honour or money inflow field, no currency, balance,
 * or spend, and no named rite or bell-equivalent object.
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO merged composition and NO order invented between the
 *   outing-attraction bundle and the spawn section (above);
 * - NO reconciliation of the two sections' pictures (above):
 *   the spawn section's facts are exactly what attractSpawnRows
 *   reports over the named reading's richness, and the
 *   outing-attraction section's facts are exactly what
 *   gardenOutingAttraction reports over its own inputs;
 * - NO spawn annotation computed from an outing-attraction
 *   value other than the named reading's richness: the rows
 *   are caller-supplied, never read off a bond list, a decay
 *   breakdown, a comfort day, a thanks intensity, a level
 *   summary, a bridge record, a check-in beat, a snapshot
 *   lens, a journey visit, an unlock evaluation, an
 *   individual summary, a teacher reading, a movement reading,
 *   an arrival reading, a research reading, a discovery
 *   candidate, a news item, an inbound reading, a migration,
 *   a story, an arc, a habitat reading, or an attraction
 *   reading the entry did not name;
 * - NO outing, bond, comfort, thanks, level, record, check-in,
 *   snapshot, journey, unlock, individual, teacher, movement,
 *   arrival, research, discovery, news, inbound, migration,
 *   story, arc, habitat, attraction, or spawn writer: an
 *   annotation is a summary this module never stores or
 *   registers in live play, and no record is appended to any
 *   log here;
 * - NO recipe data authored for any habitat and NO
 *   recipe->class table authored here (both are
 *   caller-supplied through the bundle; the Garden's native
 *   habitat names and contents are owner slot S1 in the
 *   wiring plan, never filled here);
 * - NO composition pass (Pokopia context modifiers and
 *   neighbour-habitat combos resolve after base matching and
 *   are a later slice, inherited from garden-habitats);
 * - NO manufactured-booster data (Owner Slot 1, inherited
 *   from garden-inbound, never filled here);
 * - NO honour or money inflow computed here (inherited from
 *   garden-inbound: both arrive as caller-held counts, not as
 *   reads over these inputs);
 * - NO reweighting, NO stock added, NO weight band, and NO
 *   encounter/spawn/route decision (whether an attracted row
 *   is rolled, and whether a discovery candidate is actually
 *   met on a route, are host decisions, not this read's);
 * - NO host, NO store/view/save change, NO effect in live
 *   play: whether a recognised habitat's richness is applied
 *   to a spawn table is a host decision, not this read's;
 * - NO season/festival/weather, story, arc, species, place,
 *   or range vocabulary authored (all ids, keys, and arc
 *   values are opaque caller strings; the #102 range rule is
 *   the host's filter);
 * - NO cursor/stamp storage: the caller keeps the last
 *   check-in stamp, both cursors, and both autonomous cursors;
 * - NO new record section (a record gains a field only when
 *   its own read gains one).
 *
 * Purity: inputs are never mutated or reordered; the bundle and
 * every entry and list inside it are fresh objects and fresh
 * arrays. Loud failures (throw) on a malformed input bundle and
 * on any failure propagated from either composed read.
 */

import {
  gardenOutingAttraction,
  type GardenOutingAttraction,
  type GardenOutingAttractionInputs,
} from "./garden-outing-attraction";
import {
  attractSpawnRows,
  type AttractionRichness,
  type RowAttraction,
} from "./garden-attraction";

/** One spawn-table row, as far as this module reads it. Other fields ride along untouched. */
export interface SpawnRowInput {
  habitatClass?: string | null;
  [key: string]: unknown;
}

/** One caller-named spawn annotation, over a named attraction reading's richness. */
export interface SpawnEntry {
  /** The annotation's id (opaque, caller-chosen). */
  id: string;
  /** The id of the attraction reading whose richness annotates these rows. */
  attractionId: string;
  /** The spawn rows to annotate, in caller order. */
  rows: readonly SpawnRowInput[];
}

/** The inputs one outing-plus-attraction-plus-spawn bundle is composed from. */
export interface GardenOutingAttractionSpawnInputs {
  /** The outing-attraction bundle's inputs, as slice 52 takes them. */
  outingAttraction: GardenOutingAttractionInputs;
  /** The spawn section's inputs: one entry per annotation, in caller order. */
  spawn: {
    entries: readonly SpawnEntry[];
  };
}

/** One spawn entry's annotation, copied fresh. */
export interface SpawnReading {
  /** The entry's id, as supplied. */
  id: string;
  /** The attraction reading id the entry named, as supplied. */
  attractionId: string;
  /** The named reading's richness, copied fresh. */
  richness: AttractionRichness;
  /** The entry's rows, each with its attraction annotation attached. */
  rows: Array<SpawnRowInput & { attraction: RowAttraction }>;
}

/** One outing plus its Garden news plus what its journey brings home plus what the Garden does on its own plus what its zones recognise as habitats plus what those habitats attract plus what that attraction means for spawn rows. */
export interface GardenOutingAttractionSpawn {
  /** The outing-plus-habitats-plus-attraction bundle, exactly as slice 52 reports it. */
  outingAttraction: GardenOutingAttraction;
  /** One spawn annotation per caller-named spawn entry, in caller order. */
  spawn: SpawnReading[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * One outing plus its Garden news plus what its journey brings
 * home plus what the Garden does on its own plus what its zones
 * recognise as habitats plus what those habitats attract plus
 * what that attraction means for spawn rows: outing-attraction
 * bundle + per-entry spawn annotations, each exactly as its own
 * read reports it, side by side, with no merged composition and
 * no reconciliation between their pictures.
 */
export function gardenOutingAttractionSpawn(
  inputs: GardenOutingAttractionSpawnInputs,
): GardenOutingAttractionSpawn {
  if (inputs === null || typeof inputs !== "object") {
    throw new Error("garden-outing-attraction-spawn: inputs must be an object");
  }
  if (
    inputs.outingAttraction === null ||
    typeof inputs.outingAttraction !== "object"
  ) {
    throw new Error(
      "garden-outing-attraction-spawn: outingAttraction inputs must be an object",
    );
  }
  if (inputs.spawn === null || typeof inputs.spawn !== "object") {
    throw new Error(
      "garden-outing-attraction-spawn: spawn inputs must be an object",
    );
  }
  if (!Array.isArray(inputs.spawn.entries)) {
    throw new Error(
      "garden-outing-attraction-spawn: spawn entries must be an array",
    );
  }
  const seen = new Set<string>();
  for (const entry of inputs.spawn.entries) {
    if (entry === null || typeof entry !== "object") {
      throw new Error(
        "garden-outing-attraction-spawn: spawn entry must be an object",
      );
    }
    if (!isNonEmptyString(entry.id)) {
      throw new Error(
        "garden-outing-attraction-spawn: spawn entry id must be a non-empty string",
      );
    }
    if (seen.has(entry.id)) {
      throw new Error(
        `garden-outing-attraction-spawn: duplicate spawn entry id: ${entry.id}`,
      );
    }
    seen.add(entry.id);
    if (!isNonEmptyString(entry.attractionId)) {
      throw new Error(
        "garden-outing-attraction-spawn: spawn entry attractionId must be a non-empty string",
      );
    }
    if (!Array.isArray(entry.rows)) {
      throw new Error(
        "garden-outing-attraction-spawn: spawn entry rows must be an array",
      );
    }
  }
  const outingAttraction = gardenOutingAttraction(inputs.outingAttraction);
  const byId = new Map(
    outingAttraction.attraction.map((reading) => [reading.id, reading]),
  );
  const spawn: SpawnReading[] = inputs.spawn.entries.map((entry) => {
    const reading = byId.get(entry.attractionId);
    if (reading === undefined) {
      throw new Error(
        `garden-outing-attraction-spawn: unknown attraction reading id: ${entry.attractionId}`,
      );
    }
    return {
      id: entry.id,
      attractionId: entry.attractionId,
      richness: { ...reading.richness },
      rows: attractSpawnRows(entry.rows, reading.richness),
    };
  });
  return { outingAttraction, spawn };
}
