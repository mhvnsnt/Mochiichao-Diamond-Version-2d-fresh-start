/**
 * B3 §2.3 one honour account — the Garden → Journey honour output,
 * pure library form.
 *
 * From ~/workspace/chao-garden-teardown/BRIDGE-SPEC.md §2.3: honours
 * are one counted account, never spent, earned by both halves of the
 * game — Garden-side results and journey-side feats feed the SAME
 * total. The count is a key, never a currency that is paid out; and
 * each new honour source re-reads the whole account, so the total is
 * always the sum over every source, not a running balance kept
 * apart from its sources.
 *
 * This module is that output's read half only: given caller-supplied
 * honour sources, it totals them. Sources are caller vocabulary —
 * opaque ids with a whole-number count — never enumerated here: the
 * spec's examples (sport, dojo, discovery, journey feats) are
 * concepts, not a list this module owns, and no source is ever
 * credited by default.
 *
 * Rules, exactly as the spec shapes them and no further:
 * - A source is one counted contribution: an id and a count. Counts
 *   are whole numbers, zero or more. A negative, fractional, or
 *   non-finite count fails loudly; an empty or non-string id fails
 *   loudly; a duplicate source id fails loudly.
 * - honorAccount returns the whole account: the total (the sum over
 *   every source), one entry per source in caller order, and the
 *   source count. An empty source list is an empty account — total
 *   0, no entries — never a default honour.
 * - honorAccountWith appends one new source and re-reads the whole
 *   account from the full list, so a new source can never silently
 *   replace or shadow an earlier one.
 * - Honours are counted, never spent: this module offers no way to
 *   reduce a count, remove a source, or pay honours out. (Removal,
 *   if a host ever needs it, is the host's own decision, not a
 *   read in this module.)
 *
 * Deliberately NOT here: NO gate decision (which doors the count
 * opens — stock, heritage content, visitation — is the flagged
 * owner decision in the spec's §C item 1, and no door, band, level,
 * or threshold is assigned here); NO host (garden-wiring.ts,
 * GardenView, wiring/phase4-garden.ts, garden-register.ts do not
 * import this module — staging locks in the test); NO store/view/
 * save change; NO source vocabulary authored (every source id is a
 * caller-supplied opaque string); NO effect in live play.
 *
 * Purity: inputs are never mutated or reordered; outputs are fresh
 * values. Loud failures (throw) on malformed sources and duplicate
 * ids; silent defaults are never invented.
 */

/** One counted honour contribution, caller-supplied. */
export interface HonorSource {
  /** Unique within the account; duplicates fail loudly on append. */
  id: string;
  /** Whole honours counted from this source; zero or more. */
  count: number;
}

export type HonorSourceList = readonly HonorSource[];

/** One source's counted contribution, as the account reports it. */
export interface HonorEntry {
  sourceId: string;
  count: number;
}

/** The whole honour account, re-read from its sources. */
export interface HonorAccount {
  /** The sum over every source; 0 for an empty account. */
  total: number;
  /** One entry per source, in caller order. */
  entries: HonorEntry[];
  /** Number of sources feeding the account. */
  sourceCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Loud validation for one honour source; returns the source. */
export function validateHonorSource(source: unknown): HonorSource {
  if (!isRecord(source)) {
    throw new Error("HonorSource must be an object");
  }
  if (typeof source.id !== "string" || source.id.length === 0) {
    throw new Error("HonorSource id must be a non-empty string");
  }
  if (
    typeof source.count !== "number" ||
    !Number.isFinite(source.count) ||
    !Number.isInteger(source.count) ||
    source.count < 0
  ) {
    throw new Error(
      "HonorSource count must be a whole number, zero or more",
    );
  }
  return source as unknown as HonorSource;
}

function validateSources(sources: unknown): HonorSource[] {
  if (!Array.isArray(sources)) {
    throw new Error("Honor sources must be an array");
  }
  const seen = new Set<string>();
  const checked: HonorSource[] = [];
  for (const source of sources) {
    const valid = validateHonorSource(source);
    if (seen.has(valid.id)) {
      throw new Error(`Duplicate honour source id: ${valid.id}`);
    }
    seen.add(valid.id);
    checked.push(valid);
  }
  return checked;
}

/**
 * Append one source to a source list without mutating it.
 * A duplicate id fails loudly; the original list is untouched.
 */
export function appendHonorSource(
  sources: HonorSourceList,
  source: HonorSource,
): HonorSource[] {
  const checked = validateSources(sources);
  const valid = validateHonorSource(source);
  if (checked.some((entry) => entry.id === valid.id)) {
    throw new Error(`Duplicate honour source id: ${valid.id}`);
  }
  return [...checked, valid];
}

/**
 * Read the whole honour account from its sources: the total is the
 * sum over every source, entries stay in caller order, and an empty
 * list reads as an empty account, never a default.
 */
export function honorAccount(sources: HonorSourceList): HonorAccount {
  const checked = validateSources(sources);
  const entries = checked.map((entry) => ({
    sourceId: entry.id,
    count: entry.count,
  }));
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  return { total, entries, sourceCount: entries.length };
}

/**
 * Append one new source and re-read the whole account from the full
 * list — the "each new source re-reads the whole account" rule. The
 * input list is never mutated.
 */
export function honorAccountWith(
  sources: HonorSourceList,
  source: HonorSource,
): HonorAccount {
  return honorAccount(appendHonorSource(sources, source));
}
