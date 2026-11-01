/**
 * B3 §2.5 migration/season composition read — the Garden changes
 * without the player, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.5: the
 * Garden is an ecology instance, and ecologies in this programme
 * move — visiting/resident composition shifts with the world state
 * (the #19 world-state producer, weather behaviour, the seasonal
 * festival calendar) whether or not the player visits, breeds, or
 * builds anything. This module is the read half of that shift only:
 * given the current resident composition, one world-state key, and
 * caller-supplied migration rules, it returns the composition that
 * world state produces.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - The world-state key is caller vocabulary — one opaque string
 *   supplied by the world-state producer's caller. This module
 *   enumerates no season, phase, festival, or weather: a rule fires
 *   exactly when its worldStates list contains the current key, and
 *   a key the caller never names fires nothing. The #19 producer
 *   itself is not built here; this read takes its key as input.
 * - A migration rule names arrivals (creatures that join the
 *   composition under this world state) and departures (creatures
 *   that leave it). Rules apply in caller order; within one rule,
 *   departures apply before arrivals, so a later rule can undo an
 *   earlier one and a rule can replace a resident.
 * - Composition order is stable: surviving original residents keep
 *   caller order, and new arrivals append in rule order, each at
 *   most once (first arrival wins). A creature already resident is
 *   not re-added, and a departure for a creature not resident
 *   changes nothing — but a firing rule still counts as applied.
 * - `arrived` and `departed` are the NET composition change: a
 *   creature in the result but not in the input, and a creature in
 *   the input but not in the result. A resident departed by one
 *   firing rule and re-arrived by a later one is neither: it was
 *   present before and after, so the composition did not change
 *   for it. `appliedRuleIds` lists every firing rule in rule
 *   order, whether or not it changed the composition.
 * - Visit-independence is structural, not a flag: this read takes
 *   no visit count, no visit stamp, and no player action of any
 *   kind. The same residents, key, and rules always give the same
 *   composition, visited or not. A host that wants the check-in
 *   beat (garden-news) reads the doorway log separately; this
 *   read never looks at it.
 *
 * Deliberately NOT here: NO season/festival/weather vocabulary
 * authored (keys are opaque caller strings); NO species, place, or
 * range data authored (creature ids are opaque; the #102 range
 * rule — only species whose range reaches the Garden can visit —
 * is the host's filter, not this read's, because this read carries
 * no range data to check it against); NO host (garden-wiring.ts,
 * GardenView, wiring/phase4-garden.ts, garden-register.ts do not
 * import this module — staging locks in the test); NO store/view/
 * save change; NO story-beat driver (sequence beats changing the
 * Garden on the story's schedule are a later §2.5 slice with their
 * own schedule input, not a world-state key); NO numeric effect
 * in live play.
 *
 * Purity: inputs are never mutated or reordered; outputs are fresh
 * values. Loud failures (throw) on malformed rules, duplicate rule
 * ids, duplicate world-state keys inside a rule, a creature both
 * arriving and departing in one rule, and malformed resident ids;
 * silent defaults are never invented.
 */

/** One migration rule: what one world state does to the composition. */
export interface MigrationRule {
  /** Unique within the rule list; duplicates fail loudly. */
  id: string;
  /** World-state keys this rule fires under; at least one required. */
  worldStates: readonly string[];
  /** Creatures that join the composition when this rule fires. */
  arrivals: readonly string[];
  /** Creatures that leave the composition when this rule fires. */
  departures: readonly string[];
}

export type MigrationRuleList = readonly MigrationRule[];

/** The composition one world state produces, with its net change. */
export interface MigratedComposition {
  /** Residents after migration, in stable composition order. */
  residents: string[];
  /** Net arrivals: in the result, not in the input. */
  arrived: string[];
  /** Net departures: in the input, not in the result. */
  departed: string[];
  /** Every firing rule, in rule order, changed or not. */
  appliedRuleIds: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(message: string): never {
  throw new Error(`MigrationRule: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${what} must be a non-empty string`);
  }
  return value as string;
}

function validateIdList(
  value: unknown,
  what: string,
  allowEmpty: boolean,
): string[] {
  if (!Array.isArray(value)) {
    fail(`${what} must be an array`);
  }
  if (!allowEmpty && value.length === 0) {
    fail(`${what} must not be empty`);
  }
  const seen = new Set<string>();
  const checked: string[] = [];
  for (const entry of value) {
    const id = nonEmptyString(entry, `${what} entry`);
    if (seen.has(id)) {
      fail(`${what} contains a duplicate id: ${id}`);
    }
    seen.add(id);
    checked.push(id);
  }
  return checked;
}

/** Loud validation for one migration rule; returns the rule. */
export function validateMigrationRule(rule: unknown): MigrationRule {
  if (!isRecord(rule)) {
    fail("rule must be an object");
  }
  const id = nonEmptyString(rule.id, "rule id");
  const worldStates = validateIdList(rule.worldStates, "worldStates", false);
  const arrivals = validateIdList(rule.arrivals, "arrivals", true);
  const departures = validateIdList(rule.departures, "departures", true);
  if (arrivals.length === 0 && departures.length === 0) {
    fail("rule must name at least one arrival or departure");
  }
  const arrivalSet = new Set(arrivals);
  for (const creatureId of departures) {
    if (arrivalSet.has(creatureId)) {
      fail(
        `rule ${id} both arrives and departs creature: ${creatureId}`,
      );
    }
  }
  return rule as unknown as MigrationRule;
}

function validateRules(rules: unknown): MigrationRule[] {
  if (!Array.isArray(rules)) {
    fail("rules must be an array");
  }
  const seen = new Set<string>();
  const checked: MigrationRule[] = [];
  for (const rule of rules) {
    const valid = validateMigrationRule(rule);
    if (seen.has(valid.id)) {
      fail(`Duplicate migration rule id: ${valid.id}`);
    }
    seen.add(valid.id);
    checked.push(valid);
  }
  return checked;
}

function validateResidents(residents: unknown): string[] {
  return validateIdList(residents, "residents", true);
}

/**
 * Read the Garden composition one world state produces: apply every
 * firing migration rule, in caller order, to the current residents.
 * No visit input exists — the result depends only on residents,
 * the world-state key, and the rules.
 */
export function migrateComposition(
  residents: readonly string[],
  worldState: string,
  rules: MigrationRuleList,
): MigratedComposition {
  const current = validateResidents(residents);
  const key = nonEmptyString(worldState, "worldState");
  const checkedRules = validateRules(rules);
  const present = new Set<string>(current);
  const order: string[] = [...current];
  const appliedRuleIds: string[] = [];
  for (const rule of checkedRules) {
    if (!rule.worldStates.includes(key)) {
      continue;
    }
    appliedRuleIds.push(rule.id);
    for (const creatureId of rule.departures) {
      if (present.has(creatureId)) {
        present.delete(creatureId);
        order.splice(order.indexOf(creatureId), 1);
      }
    }
    for (const creatureId of rule.arrivals) {
      if (!present.has(creatureId)) {
        present.add(creatureId);
        order.push(creatureId);
      }
    }
  }
  const before = new Set(current);
  const after = new Set(order);
  const arrived = order.filter((creatureId) => !before.has(creatureId));
  const departed = current.filter((creatureId) => !after.has(creatureId));
  return { residents: order, arrived, departed, appliedRuleIds };
}
