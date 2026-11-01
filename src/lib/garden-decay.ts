/**
 * B3 §2.7 / BOND-DECAY-SPEC — the neglect decay read, pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.7 (corrected
 * doctrine): a kept life's care-state, contentment, and bond DECAY
 * under neglect and can move negative — "the keeper who stays away
 * comes back to a relationship that has genuinely worsened". From
 * ~/workspace/rpg-layer-museum/BOND-DECAY-SPEC.md: the model is
 * FACTORED — rate(context, neglectType) x personalityScalar(axis)
 * -> decay per tick, plus floor(context, personality) — and the
 * discipline that carries it: ACCRUED bond never decays; EFFECTIVE
 * bond does. Accrued is the history (#39's ledger, slice 13's
 * per-pair ledger value); effective is the living value derived at
 * read, the value the help/consent ladder, battle rows, and Garden
 * life read (BOND-DECAY-SPEC §5, E1–E5).
 *
 * This module is that read only: effectiveBond(accrued, facts,
 * profile). It takes the accrued value as an input and returns a
 * number. It never writes a ledger, never stores a fact, and never
 * removes anything — decay alone, at any depth, never triggers
 * departure (BOND-DECAY-SPEC §6: "decay alone ... never triggers
 * departure ... the partner does not die and does not leave by
 * meter").
 *
 * Deliberately NOT here, and NOT decided here:
 * - NO rates, scalars, or floors authored: every number in the
 *   profile is caller-supplied data for the one balancing pass
 *   (BOND-DECAY-SPEC §4.4 / §7). The spec's owner-ruled SHAPES
 *   (storage light, party heavy, daycare moderate-and-individual,
 *   Garden light-moderate) are carried only as context names —
 *   the module assigns no number to any of them. A caller that
 *   passes party 3 and storage 1 has stated its own ratio; the
 *   module only multiplies. The one exception is the scalar
 *   identity: an omitted per-type scalar reads as 1 (unmoderated),
 *   which is arithmetic, not a rate.
 * - NO trait names: personality enters ONLY as caller-supplied
 *   per-neglect-type scalars. The §4.3 archetype placeholders
 *   (Brave/Sassy/Lonely/Calm/Hardy patterns) are NOT encoded —
 *   #108's displayName is OPEN and the in-world trait names are
 *   the owner's (BOND-DECAY-SPEC §7 slot 1). A caller derives its
 *   scalars from #108 however it does; this module never names
 *   a temperament.
 * - NO tick length: a fact's `units` are caller-resolved — phase
 *   ticks for drip types (N1 absence, N2 care-starvation, N4
 *   misplacement spans), event counts for N3 harsh use (a faint,
 *   a bitter-class item). The module never says how long a tick
 *   is or how many events a battle writes; the writing systems
 *   own their facts (BOND-DECAY-SPEC §2: battle-end writes N3;
 *   N1/N2 absences are read at projection time).
 * - NO effect bands or gates: the E1–E5 effect classes (mood,
 *   help/consent ladder, battle rows, Garden withdrawal, moral
 *   register) READ the effective value; they are not computed
 *   here. No band, threshold, or "cold" label is authored.
 * - NO host, NO store/view/save change, NO numeric effect in live
 *   play: no module imports this yet (see the staging locks in
 *   garden-decay.test.ts), and nothing in live play decays.
 *
 * Composition rules of THIS module (not canon, stated so a host
 * can rely on them exactly):
 * - Released/wild facts contribute 0 decay and never set the
 *   floor (BOND-DECAY-SPEC §3: "Released / wild — No decay").
 * - When facts span contexts, the floor that binds is the LOWEST
 *   supplied floor among the non-released fact contexts: the
 *   deepest context experienced sets how far the value may fall.
 * - A floor binds a fall FROM ABOVE, never lifts and never
 *   freezes: when accrued sits above the floor, effective never
 *   drops below it (max(accrued - totalDecay, floor)); when
 *   accrued already sits at or below the floor, decay applies
 *   unclamped — the floor is a stop for a falling value, not a
 *   lift for a low one and not a freeze on further decay.
 *   With no non-released facts, effective is exactly accrued,
 *   even if a floor sits above it.
 * - Purity: inputs are never mutated; the breakdown's
 *   contributions are fresh objects in fact order. Loud failures
 *   (throw) on non-finite or negative numbers, negative units,
 *   unknown contexts/types, and any missing rate or floor a
 *   fact actually needs. Silent defaults are never invented
 *   beyond the scalar identity above.
 */

/** Where the kept life is (BOND-DECAY-SPEC §3, owner-ruled weights). */
export type DecayContext =
  | "storage"
  | "party"
  | "daycare"
  | "garden"
  | "released";

/** The four neglect types (BOND-DECAY-SPEC §2). */
export type NeglectType =
  | "absence"
  | "care-starvation"
  | "harsh-use"
  | "misplacement";

/**
 * One neglect fact, as written/read by its owning system. `units`
 * are caller-resolved (phase ticks for drip types, event counts
 * for harsh use); this module never converts them.
 */
export interface NeglectFact {
  type: NeglectType;
  context: DecayContext;
  units: number;
}

/** Base rates: rate[context][type], caller-supplied, finite, >= 0. */
export type DecayRates = {
  [C in Exclude<DecayContext, "released">]?: Partial<
    Record<NeglectType, number>
  >;
};

/** Per-type personality scalars, caller-supplied; omitted = 1. */
export type PersonalityScalars = Partial<Record<NeglectType, number>>;

/** Floors: floor[context], caller-supplied, finite (may be negative). */
export type DecayFloors = Partial<Record<DecayContext, number>>;

export interface DecayProfile {
  rates: DecayRates;
  scalars?: PersonalityScalars;
  floors: DecayFloors;
}

export interface DecayContribution {
  type: NeglectType;
  context: DecayContext;
  units: number;
  rate: number;
  scalar: number;
  amount: number;
}

export interface DecayBreakdown {
  accrued: number;
  totalDecay: number;
  /** Null when no non-released fact was present (no floor applied). */
  floorApplied: number | null;
  effective: number;
  contributions: DecayContribution[];
}

const CONTEXTS: readonly DecayContext[] = [
  "storage",
  "party",
  "daycare",
  "garden",
  "released",
];

const NEGLECT_TYPES: readonly NeglectType[] = [
  "absence",
  "care-starvation",
  "harsh-use",
  "misplacement",
];

function fail(message: string): never {
  throw new Error(`garden-decay: ${message}`);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function checkContext(context: unknown): DecayContext {
  if (
    typeof context !== "string" ||
    !(CONTEXTS as readonly string[]).includes(context)
  ) {
    fail(`unknown decay context ${JSON.stringify(context)}`);
  }
  return context as DecayContext;
}

function checkType(type: unknown): NeglectType {
  if (
    typeof type !== "string" ||
    !(NEGLECT_TYPES as readonly string[]).includes(type)
  ) {
    fail(`unknown neglect type ${JSON.stringify(type)}`);
  }
  return type as NeglectType;
}

function checkFact(fact: unknown): NeglectFact {
  if (fact === null || typeof fact !== "object") {
    fail("neglect fact must be an object");
  }
  const f = fact as Partial<NeglectFact>;
  const type = checkType(f.type);
  const context = checkContext(f.context);
  if (!isFiniteNumber(f.units) || f.units < 0) {
    fail("neglect fact units must be a finite number >= 0");
  }
  return { type, context, units: f.units };
}

function checkProfile(profile: unknown): DecayProfile {
  if (profile === null || typeof profile !== "object") {
    fail("decay profile must be an object");
  }
  const p = profile as Partial<DecayProfile>;
  if (p.rates === null || typeof p.rates !== "object") {
    fail("decay profile rates must be an object");
  }
  if (p.floors === null || typeof p.floors !== "object") {
    fail("decay profile floors must be an object");
  }
  if (p.scalars !== undefined) {
    if (p.scalars === null || typeof p.scalars !== "object") {
      fail("decay profile scalars must be an object");
    }
    for (const [type, scalar] of Object.entries(p.scalars)) {
      checkType(type);
      if (!isFiniteNumber(scalar) || scalar < 0) {
        fail(`personality scalar for ${type} must be finite and >= 0`);
      }
    }
  }
  return p as DecayProfile;
}

/**
 * The factored decay read: accrued bond + neglect facts + profile
 * -> the living (effective) bond value. See the header for the
 * composition rules this function implements exactly.
 */
export function decayBreakdown(
  accrued: number,
  facts: readonly NeglectFact[],
  profile: DecayProfile,
): DecayBreakdown {
  if (!isFiniteNumber(accrued)) {
    fail("accrued bond must be a finite number");
  }
  if (!Array.isArray(facts)) {
    fail("neglect facts must be an array");
  }
  const checkedProfile = checkProfile(profile);
  const contributions: DecayContribution[] = [];
  let totalDecay = 0;
  let floorApplied: number | null = null;
  for (const rawFact of facts) {
    const fact = checkFact(rawFact);
    if (fact.context === "released") {
      // No decay by design (BOND-DECAY-SPEC §3); still recorded
      // in the breakdown at 0 so the read is auditable, and it
      // never sets the floor.
      contributions.push({
        type: fact.type,
        context: fact.context,
        units: fact.units,
        rate: 0,
        scalar: 1,
        amount: 0,
      });
      continue;
    }
    const rate = checkedProfile.rates[fact.context]?.[fact.type];
    if (!isFiniteNumber(rate) || rate < 0) {
      fail(
        `missing or invalid base rate for context ${fact.context} and neglect type ${fact.type}`,
      );
    }
    const scalar = checkedProfile.scalars?.[fact.type] ?? 1;
    if (!isFiniteNumber(scalar) || scalar < 0) {
      fail(`invalid personality scalar for ${fact.type}`);
    }
    const amount = rate * scalar * fact.units;
    if (!Number.isFinite(amount)) {
      fail("decay amount overflowed to a non-finite number");
    }
    totalDecay += amount;
    contributions.push({
      type: fact.type,
      context: fact.context,
      units: fact.units,
      rate,
      scalar,
      amount,
    });
    const floor = checkedProfile.floors[fact.context];
    if (!isFiniteNumber(floor)) {
      fail(`missing or invalid floor for context ${fact.context}`);
    }
    floorApplied =
      floorApplied === null ? floor : Math.min(floorApplied, floor);
  }
  const fallen = accrued - totalDecay;
  // No floor: no decay. Accrued above the floor: the floor stops
  // the fall. Accrued at/below the floor: decay applies unclamped.
  const effective =
    floorApplied === null
      ? accrued
      : accrued > floorApplied
        ? Math.max(fallen, floorApplied)
        : fallen;
  return {
    accrued,
    totalDecay,
    floorApplied,
    effective,
    contributions,
  };
}

/** The effective bond value alone (decayBreakdown's `effective`). */
export function effectiveBond(
  accrued: number,
  facts: readonly NeglectFact[],
  profile: DecayProfile,
): number {
  return decayBreakdown(accrued, facts, profile).effective;
}

/**
 * Recovery, the §4.4 second half: when care resumes, the climb
 * reads against the EFFECTIVE value, scaled by the caller's
 * Forgiveness scalar (omitted = 1, the identity). A care gain is
 * a gain: negative gains are refused loudly (decay is the decay
 * function's job, never smuggled in as negative care). No cap is
 * applied here — any cap is the writer's or host's decision.
 */
export function bondAfterCare(
  effective: number,
  careGain: number,
  forgiveness = 1,
): number {
  if (!isFiniteNumber(effective)) {
    fail("effective bond must be a finite number");
  }
  if (!isFiniteNumber(careGain) || careGain < 0) {
    fail("care gain must be a finite number >= 0");
  }
  if (!isFiniteNumber(forgiveness) || forgiveness < 0) {
    fail("forgiveness scalar must be a finite number >= 0");
  }
  const next = effective + careGain * forgiveness;
  if (!Number.isFinite(next)) {
    fail("recovered bond overflowed to a non-finite number");
  }
  return next;
}
