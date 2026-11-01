/**
 * B3 §2.3 research output — documented development as observation
 * data, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.3: a raised
 * individual's documented development — growth stages watched,
 * behaviours learned, lineage — is observation data. It feeds the
 * per-species research levels and the bio library's
 * discovery-honesty rule: a bio fills when habitat/development data
 * actually lands, never by default.
 *
 * This module is that output's read half only: given caller-supplied
 * observation records, it groups what has actually been observed per
 * creature and per species, and it answers, per caller-supplied bio
 * field, whether that field's required observation kind has landed.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - An observation is one documented development fact: which
 *   creature it is about, which kind of observation it is, and
 *   when (a caller-supplied ordering stamp — the same finite
 *   monotonic stamp family the doorway log uses; this module
 *   never reads a clock). Kinds are caller vocabulary, never
 *   authored here: the spec's examples (a growth stage watched,
 *   a behaviour learned, lineage) are concepts, not a list this
 *   module enumerates.
 * - Species grouping is caller-resolved, not authored here: the
 *   caller supplies the creature-to-species mapping (a Map or a
 *   plain record). Observations about unmapped creatures count
 *   in creature-level reads and are excluded from species
 *   summaries — a partial mapping is legitimate, not malformed.
 * - A species summary lists observed kinds in first-observed
 *   order (stamp order, stable ties by log order), with a count
 *   and first/last stamps per kind. A species with no
 *   observations has an empty kind list, never a default kind.
 * - Bio fill is the discovery-honesty rule in its smallest form:
 *   a bio field is filled exactly when its required kind has been
 *   observed at least once for that species. Requirement order is
 *   preserved. No field is ever filled by default, by a count
 *   threshold, or by a level — thresholds and levels are not
 *   assigned here (see below).
 *
 * Deliberately NOT here: NO research levels, NO scores, NO
 * thresholds, NO ranking (the per-species level scale is the
 * flagged owner decision in the spec's §C item 1, and no scale is
 * assigned here); NO host (garden-wiring.ts, GardenView,
 * wiring/phase4-garden.ts, garden-register.ts do not import this
 * module — staging locks in the test); NO store/view/save change;
 * NO bio contents authored (fields and required kinds are
 * caller-supplied); NO species, place, or name vocabulary authored
 * (every id and kind is a caller-supplied opaque string); NO
 * honour effect (the §2.3 honour output is a separate read);
 * NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered; outputs are fresh
 * values. Loud failures (throw) on malformed records, malformed
 * mappings, and malformed bio requirements; silent defaults are
 * never invented.
 */

/** One documented development observation. */
export interface ResearchObservation {
  /** Unique within the log; duplicates fail loudly on append. */
  id: string;
  /** The observed creature's id (opaque). */
  creatureId: string;
  /** The observation kind (caller vocabulary, opaque). */
  kind: string;
  /** Caller-supplied ordering stamp; must be finite. */
  at: number;
}

export type ResearchObservationLog = readonly ResearchObservation[];

/** Creature id -> species id, caller-resolved (Map or plain record). */
export type SpeciesOfCreature =
  | ReadonlyMap<string, string>
  | Readonly<Record<string, string>>;

/** One bio field's requirement, caller-supplied. */
export interface BioFieldRequirement {
  /** The bio field's id (opaque). */
  field: string;
  /** The observation kind that fills it (caller vocabulary). */
  requiredKind: string;
}

/** One bio field's fill verdict. */
export interface BioFieldFill {
  field: string;
  requiredKind: string;
  /** True exactly when the kind was observed for the species. */
  filled: boolean;
  /** How many times the kind was observed for the species. */
  observedCount: number;
}

/** One kind's observation tally inside a species summary. */
export interface KindTally {
  kind: string;
  count: number;
  firstAt: number;
  lastAt: number;
}

/** What has actually been observed for one species. */
export interface SpeciesResearchSummary {
  speciesId: string;
  totalObservations: number;
  /** Kinds in first-observed order (stamp order, stable ties). */
  observedKinds: string[];
  kinds: KindTally[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/** Loud validation for one observation. Throws on the first defect. */
export function validateResearchObservation(
  observation: unknown,
): asserts observation is ResearchObservation {
  if (
    typeof observation !== "object" ||
    observation === null ||
    Array.isArray(observation)
  ) {
    throw new Error("garden-research: observation must be an object");
  }
  const o = observation as Record<string, unknown>;
  if (!isNonEmptyString(o.id)) {
    throw new Error("garden-research: observation id must be a non-empty string");
  }
  if (!isNonEmptyString(o.creatureId)) {
    throw new Error(
      "garden-research: observation creatureId must be a non-empty string",
    );
  }
  if (!isNonEmptyString(o.kind)) {
    throw new Error("garden-research: observation kind must be a non-empty string");
  }
  if (typeof o.at !== "number" || !Number.isFinite(o.at)) {
    throw new Error("garden-research: observation at must be a finite number");
  }
}

function validatedLog(log: ResearchObservationLog): ResearchObservationLog {
  if (!Array.isArray(log)) {
    throw new Error("garden-research: log must be an array");
  }
  for (const observation of log) validateResearchObservation(observation);
  return log;
}

/**
 * Append one observation to the log. Returns a NEW log; the input log
 * and its records are never mutated. A duplicate id or a malformed
 * observation fails loudly and appends nothing.
 */
export function appendResearchObservation(
  log: ResearchObservationLog,
  observation: ResearchObservation,
): ResearchObservation[] {
  validateResearchObservation(observation);
  if (log.some((entry) => entry.id === observation.id)) {
    throw new Error(
      `garden-research: duplicate observation id: ${observation.id}`,
    );
  }
  return [...log, observation];
}

/** Observations in stamp order, stable for equal stamps. */
function inStampOrder(
  log: ResearchObservationLog,
): ResearchObservation[] {
  return log
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.at - b.entry.at || a.index - b.index)
    .map(({ entry }) => entry);
}

/**
 * Every observation about one creature, in stamp order, stable ties.
 * Returns fresh records in a fresh array; the log is never reordered.
 */
export function observationsForCreature(
  log: ResearchObservationLog,
  creatureId: string,
): ResearchObservation[] {
  if (!isNonEmptyString(creatureId)) {
    throw new Error("garden-research: creatureId must be a non-empty string");
  }
  return inStampOrder(validatedLog(log)).filter(
    (entry) => entry.creatureId === creatureId,
  );
}

/**
 * The kinds observed for one creature, in first-observed order
 * (stamp order, stable ties). Duplicates collapse: one entry per kind.
 */
export function observedKindsForCreature(
  log: ResearchObservationLog,
  creatureId: string,
): string[] {
  const kinds: string[] = [];
  const seen = new Set<string>();
  for (const entry of observationsForCreature(log, creatureId)) {
    if (!seen.has(entry.kind)) {
      seen.add(entry.kind);
      kinds.push(entry.kind);
    }
  }
  return kinds;
}

function speciesOf(
  mapping: SpeciesOfCreature,
  creatureId: string,
): string | null {
  if (mapping instanceof Map) {
    const value = mapping.get(creatureId);
    if (value === undefined) return null;
    if (!isNonEmptyString(value)) {
      throw new Error(
        "garden-research: species mapping values must be non-empty strings",
      );
    }
    return value;
  }
  if (typeof mapping !== "object" || mapping === null) {
    throw new Error("garden-research: species mapping must be a map or a record");
  }
  const value = (mapping as Readonly<Record<string, string>>)[creatureId];
  if (value === undefined) return null;
  if (!isNonEmptyString(value)) {
    throw new Error(
      "garden-research: species mapping values must be non-empty strings",
    );
  }
  return value;
}

/**
 * What has actually been observed for one species: the caller-mapped
 * observations about that species' creatures, tallied per kind in
 * first-observed order. Unmapped creatures contribute nothing here.
 * A species with no observations returns an empty kind list.
 */
export function researchSummaryForSpecies(
  log: ResearchObservationLog,
  speciesId: string,
  speciesOfCreature: SpeciesOfCreature,
): SpeciesResearchSummary {
  if (!isNonEmptyString(speciesId)) {
    throw new Error("garden-research: speciesId must be a non-empty string");
  }
  const checked = validatedLog(log);
  const tallies = new Map<string, KindTally>();
  let total = 0;
  for (const entry of inStampOrder(checked)) {
    if (speciesOf(speciesOfCreature, entry.creatureId) !== speciesId) continue;
    total += 1;
    const tally = tallies.get(entry.kind);
    if (tally === undefined) {
      tallies.set(entry.kind, {
        kind: entry.kind,
        count: 1,
        firstAt: entry.at,
        lastAt: entry.at,
      });
    } else {
      tally.count += 1;
      tally.lastAt = entry.at;
    }
  }
  const kinds = [...tallies.values()];
  return {
    speciesId,
    totalObservations: total,
    observedKinds: kinds.map((tally) => tally.kind),
    kinds,
  };
}

/**
 * The kinds observed for one species, in first-observed order.
 * Convenience read over the species summary.
 */
export function observedKindsForSpecies(
  log: ResearchObservationLog,
  speciesId: string,
  speciesOfCreature: SpeciesOfCreature,
): string[] {
  return researchSummaryForSpecies(log, speciesId, speciesOfCreature)
    .observedKinds;
}

function validatedRequirements(
  requirements: readonly BioFieldRequirement[],
): BioFieldRequirement[] {
  if (!Array.isArray(requirements)) {
    throw new Error("garden-research: bio requirements must be an array");
  }
  const seen = new Set<string>();
  for (const requirement of requirements) {
    if (
      typeof requirement !== "object" ||
      requirement === null ||
      Array.isArray(requirement)
    ) {
      throw new Error("garden-research: bio requirement must be an object");
    }
    const r = requirement as Record<string, unknown>;
    if (!isNonEmptyString(r.field)) {
      throw new Error(
        "garden-research: bio field must be a non-empty string",
      );
    }
    if (!isNonEmptyString(r.requiredKind)) {
      throw new Error(
        "garden-research: bio requiredKind must be a non-empty string",
      );
    }
    if (seen.has(r.field as string)) {
      throw new Error(
        `garden-research: duplicate bio field: ${String(r.field)}`,
      );
    }
    seen.add(r.field as string);
  }
  return requirements as BioFieldRequirement[];
}

/**
 * The discovery-honesty rule, per bio field, in requirement order: a
 * field is filled exactly when its required kind has been observed at
 * least once for the species. A species with no observations fills
 * nothing — no field is ever filled by default, by a threshold, or
 * by a level, because neither is assigned here.
 */
export function bioFillForSpecies(
  log: ResearchObservationLog,
  speciesId: string,
  speciesOfCreature: SpeciesOfCreature,
  requirements: readonly BioFieldRequirement[],
): BioFieldFill[] {
  const summary = researchSummaryForSpecies(log, speciesId, speciesOfCreature);
  const counts = new Map(
    summary.kinds.map((tally) => [tally.kind, tally.count]),
  );
  return validatedRequirements(requirements).map((requirement) => {
    const observedCount = counts.get(requirement.requiredKind) ?? 0;
    return {
      field: requirement.field,
      requiredKind: requirement.requiredKind,
      filled: observedCount > 0,
      observedCount,
    };
  });
}
