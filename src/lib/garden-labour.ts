// S14 slice 7 — DQB2 W7 labour conditions, pure library form (no host yet).
//
// Wiring-plan step: a Garden job runs only when its workplace habitat
// is recognised and stocked, and social jobs require a second resident
// present in the habitat (TRANSFER-MAP X5: labour is room-conditional
// and need-driven; cooks cook in kitchens, farmers work fields,
// merchants need customers). The plan's exit test: removing a
// workplace habitat idles exactly its jobs and no others. The plan
// also says the job execution seat is "wherever resident jobs tick —
// to be pinned to the landing lane's then-current tree", and that
// seat does not exist on main today: garden-wiring.ts and
// phase4-garden.ts carry no job, workplace, or job-tick code at all
// (verified by fresh main reads this run — the only "task" hit in
// garden-wiring.ts is an unrelated daycare hatch-task comment). So
// this slice is the conditions reader in pure form, on the S10–S14
// library-first pattern, and it invents no job tick, no output, and
// no host call. What this module does, and what it does not:
//
// - DOES: read, for one job or a list of jobs, whether each job runs
//   or idles, and — when it idles — exactly why, in check order:
//   "no-workplace" (the job's zone has no recognised habitat, or its
//   solved recipe differs from the job's workplace recipe), then
//   "unstocked" (the job requires stock and its zone is not in the
//   caller-supplied stocked set), then "no-partner" (a social job
//   with no second resident present in the zone). An idle job is a
//   behavioural fact, not an error: the status carries
//   waitsAtWorkplace = true, and no function here throws for an idle
//   job (loud failures are reserved for malformed input, below).
// - DOES (exit test): statuses are computed per job from that job's
//   own zone/workplace only, so nulling one zone's solved habitat
//   idles exactly the jobs in that zone and leaves every other zone's
//   jobs unchanged (proven by test, not asserted in prose).
// - DOES NOT: author any job, resident, zone, habitat, recipe, or
//   stock vocabulary. Job ids, worker ids, zone ids and recipe ids
//   are all caller-supplied opaque strings; test fixtures are
//   synthetic. No job, workplace, or stock data for any Garden
//   resident is authored here (owner slots S1/S3 untouched).
// - DOES NOT: run, tick, start, stop, or complete any job; produce,
//   consume, or move any stock or output; change comfort, Garden
//   Level, thanks-emission, or any save record. Stock is a
//   caller-supplied per-zone boolean fact (a zone is stocked or it
//   is not) — quantities, storage contents, and supply chains are
//   host/data-lane work, not invented here, and this module never
//   reads a quantity it was not given.
// - DOES NOT: decide who is present in a zone. Presence
//   (residentsPresent: zoneId -> resident ids) is caller-resolved —
//   a host may derive it from the W6 register's homes plus visitors,
//   but this module never claims a resident is present from a home
//   assignment alone, and never claims a visitor exists. The social
//   rule counts only distinct residents other than the worker.
// - DOES NOT: touch any live path yet. Staging locks in the test
//   file assert garden-wiring.ts, GardenView.tsx and
//   phase4-garden.ts do not import this module.
//
// Grain note: the W3 derived habitats cache holds ONE solved habitat
// per zone, so a workplace is recognised per zone (zone -> solved
// habitat recipe match) and stock is likewise a per-zone fact. If a
// later host carries several habitats per zone, the workplace key
// must be revisited — this module does not silently generalise it.
//
// Pure: inputs are only read, never mutated. All outputs are fresh
// objects.

import type { SolvedHabitat } from "./garden-habitats";

/** A Garden job's labour conditions, all caller-supplied. */
export interface GardenLabourJob {
  /** Caller-supplied job id (opaque; no job is named here). */
  jobId: string;
  /** Caller-supplied worker resident id (opaque). */
  workerId: string;
  /** Zone the job's workplace habitat must be recognised in. */
  zoneId: string;
  /** Habitat recipe id that must be the zone's solved habitat. */
  workplaceRecipeId: string;
  /** True when the job also needs its workplace stocked. */
  requiresStock: boolean;
  /** True when the job also needs a second resident present. */
  social: boolean;
}

/** Why a job idles, in the order the checks run. */
export type LabourIdleReason = "no-workplace" | "unstocked" | "no-partner";

/** One job's labour status: running, or idle with its exact reason. */
export interface GardenLabourStatus {
  jobId: string;
  workerId: string;
  zoneId: string;
  workplaceRecipeId: string;
  /** True when the job's conditions are all met. */
  running: boolean;
  /** Null when running; the idle reason, in check order, otherwise. */
  idleReason: LabourIdleReason | null;
  /**
   * True exactly when idle: the worker waits at the workplace
   * (behavioural idle, per the wiring plan — never an error surface).
   */
  waitsAtWorkplace: boolean;
}

/**
 * Everything a labour read needs, caller-resolved:
 * - zoneHabitats: the W3 derived habitats cache shape
 *   (zoneId -> SolvedHabitat | null);
 * - residentsPresent: zoneId -> resident ids present in that zone
 *   (caller-resolved presence: register homes plus visitors — this
 *   module never derives presence itself);
 * - stockedZones: zones whose workplace is stocked (a per-zone fact,
 *   matching the W3 one-habitat-per-zone grain; see header).
 */
export interface LabourContext {
  zoneHabitats: Readonly<Record<string, SolvedHabitat | null>>;
  residentsPresent: Readonly<Record<string, readonly string[]>>;
  stockedZones: ReadonlySet<string>;
}

function fail(message: string): never {
  throw new Error(`garden-labour: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function validateJob(job: GardenLabourJob): GardenLabourJob {
  if (job === null || typeof job !== "object" || Array.isArray(job)) {
    fail("each job must be an object");
  }
  nonEmptyString(job.jobId, "jobId");
  nonEmptyString(job.workerId, "workerId");
  nonEmptyString(job.zoneId, "zoneId");
  nonEmptyString(job.workplaceRecipeId, "workplaceRecipeId");
  if (typeof job.requiresStock !== "boolean") fail(`requiresStock for job "${job.jobId}" must be a boolean`);
  if (typeof job.social !== "boolean") fail(`social for job "${job.jobId}" must be a boolean`);
  return job;
}

function validateContext(context: LabourContext): LabourContext {
  if (context === null || typeof context !== "object" || Array.isArray(context)) {
    fail("context must be an object");
  }
  if (
    context.zoneHabitats === null ||
    typeof context.zoneHabitats !== "object" ||
    Array.isArray(context.zoneHabitats)
  ) {
    fail("zoneHabitats must be an object");
  }
  if (
    context.residentsPresent === null ||
    typeof context.residentsPresent !== "object" ||
    Array.isArray(context.residentsPresent)
  ) {
    fail("residentsPresent must be an object");
  }
  if (!(context.stockedZones instanceof Set)) {
    fail("stockedZones must be a Set");
  }
  for (const [zone, present] of Object.entries(context.residentsPresent)) {
    if (!Array.isArray(present)) fail(`residentsPresent for zone "${zone}" must be an array`);
    for (const id of present) nonEmptyString(id, `resident present in zone "${zone}"`);
  }
  return context;
}

/**
 * Whether a job's workplace is recognised: the job's zone has a
 * solved habitat and its recipe id equals the job's workplace
 * recipe id. A null, missing, or differently-reciped zone habitat
 * is not recognised — never an error, just not a workplace.
 */
export function isWorkplaceRecognised(
  job: GardenLabourJob,
  zoneHabitats: Readonly<Record<string, SolvedHabitat | null>>,
): boolean {
  validateJob(job);
  if (zoneHabitats === null || typeof zoneHabitats !== "object" || Array.isArray(zoneHabitats)) {
    fail("zoneHabitats must be an object");
  }
  const solved = zoneHabitats[job.zoneId] ?? null;
  return solved !== null && solved.recipeId === job.workplaceRecipeId;
}

/**
 * One job's labour status, in check order: workplace, then stock,
 * then partner. An idle job never throws; only malformed input does.
 */
export function jobLabourStatus(job: GardenLabourJob, context: LabourContext): GardenLabourStatus {
  validateJob(job);
  validateContext(context);
  const base = {
    jobId: job.jobId,
    workerId: job.workerId,
    zoneId: job.zoneId,
    workplaceRecipeId: job.workplaceRecipeId,
  };
  if (!isWorkplaceRecognised(job, context.zoneHabitats)) {
    return { ...base, running: false, idleReason: "no-workplace", waitsAtWorkplace: true };
  }
  if (job.requiresStock && !context.stockedZones.has(job.zoneId)) {
    return { ...base, running: false, idleReason: "unstocked", waitsAtWorkplace: true };
  }
  if (job.social) {
    const present = context.residentsPresent[job.zoneId] ?? [];
    const partners = new Set(present.filter((id) => id !== job.workerId));
    if (partners.size < 1) {
      return { ...base, running: false, idleReason: "no-partner", waitsAtWorkplace: true };
    }
  }
  return { ...base, running: true, idleReason: null, waitsAtWorkplace: false };
}

/**
 * Every job's status, in job order. A duplicated job id throws
 * loudly: two statuses for one id would be ambiguous to a host.
 */
export function labourStatuses(jobs: readonly GardenLabourJob[], context: LabourContext): GardenLabourStatus[] {
  if (!Array.isArray(jobs)) fail("jobs must be an array");
  validateContext(context);
  const seen = new Set<string>();
  const out: GardenLabourStatus[] = [];
  for (const job of jobs) {
    validateJob(job);
    if (seen.has(job.jobId)) fail(`duplicate jobId "${job.jobId}"`);
    seen.add(job.jobId);
    out.push(jobLabourStatus(job, context));
  }
  return out;
}

/** Counts for a status list: total, running, idle, and idle by reason. */
export function labourSummary(statuses: readonly GardenLabourStatus[]): {
  total: number;
  running: number;
  idle: number;
  byReason: Record<LabourIdleReason, number>;
} {
  if (!Array.isArray(statuses)) fail("statuses must be an array");
  const byReason: Record<LabourIdleReason, number> = {
    "no-workplace": 0,
    unstocked: 0,
    "no-partner": 0,
  };
  let running = 0;
  for (const s of statuses) {
    if (s.running) running += 1;
    else if (s.idleReason !== null) byReason[s.idleReason] += 1;
  }
  return { total: statuses.length, running, idle: statuses.length - running, byReason };
}
