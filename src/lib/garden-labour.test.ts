import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isWorkplaceRecognised,
  jobLabourStatus,
  labourStatuses,
  labourSummary,
  type GardenLabourJob,
  type LabourContext,
} from "./garden-labour";
import type { SolvedHabitat } from "./garden-habitats";

function solved(recipeId: string): SolvedHabitat {
  return { recipeId, tier: 1, extent: 3, finish: 2, character: null };
}

function job(partial: Partial<GardenLabourJob> & { jobId: string }): GardenLabourJob {
  return {
    workerId: "worker-a",
    zoneId: "zone-1",
    workplaceRecipeId: "recipe-kitchen",
    requiresStock: false,
    social: false,
    ...partial,
  };
}

function context(partial: Partial<LabourContext> = {}): LabourContext {
  return {
    zoneHabitats: { "zone-1": solved("recipe-kitchen"), "zone-2": solved("recipe-field") },
    residentsPresent: { "zone-1": ["worker-a"], "zone-2": ["worker-b"] },
    stockedZones: new Set<string>(),
    ...partial,
  };
}

function throwsWith(fn: () => unknown, part: string): void {
  expect(fn).toThrowError(new RegExp(`garden-labour: .*${part}`));
}

describe("garden-labour (S14 slice 7, DQB2 W7 pure form)", () => {
  it("runs a plain job whose workplace is recognised", () => {
    const s = jobLabourStatus(job({ jobId: "j1" }), context());
    expect(s).toEqual({
      jobId: "j1",
      workerId: "worker-a",
      zoneId: "zone-1",
      workplaceRecipeId: "recipe-kitchen",
      running: true,
      idleReason: null,
      waitsAtWorkplace: false,
    });
  });

  it("runs a social job with a partner, and a stock job in a stocked zone", () => {
    const social = jobLabourStatus(
      job({ jobId: "j2", social: true }),
      context({ residentsPresent: { "zone-1": ["worker-a", "res-b"] } }),
    );
    expect(social.running).toBe(true);
    const stocked = jobLabourStatus(
      job({ jobId: "j3", requiresStock: true }),
      context({ stockedZones: new Set(["zone-1"]) }),
    );
    expect(stocked.running).toBe(true);
  });

  it("idles with no-workplace when the zone is unsolved, missing, or differently reciped", () => {
    const unsolved = jobLabourStatus(job({ jobId: "j4" }), context({ zoneHabitats: { "zone-1": null } }));
    expect(unsolved).toMatchObject({ running: false, idleReason: "no-workplace", waitsAtWorkplace: true });
    const missing = jobLabourStatus(job({ jobId: "j5" }), context({ zoneHabitats: {} }));
    expect(missing.idleReason).toBe("no-workplace");
    const wrong = jobLabourStatus(
      job({ jobId: "j6", workplaceRecipeId: "recipe-other" }),
      context(),
    );
    expect(wrong.idleReason).toBe("no-workplace");
    expect(isWorkplaceRecognised(job({ jobId: "j6", workplaceRecipeId: "recipe-other" }), context().zoneHabitats)).toBe(false);
    expect(isWorkplaceRecognised(job({ jobId: "j1" }), context().zoneHabitats)).toBe(true);
  });

  it("idles with unstocked when stock is required and the zone is not stocked", () => {
    const s = jobLabourStatus(job({ jobId: "j7", requiresStock: true }), context());
    expect(s).toMatchObject({ running: false, idleReason: "unstocked", waitsAtWorkplace: true });
  });

  it("ignores stock when the job does not require it", () => {
    expect(jobLabourStatus(job({ jobId: "j8" }), context()).running).toBe(true);
  });

  it("idles with no-partner when a social job has no second resident", () => {
    const alone = jobLabourStatus(job({ jobId: "j9", social: true }), context());
    expect(alone).toMatchObject({ running: false, idleReason: "no-partner", waitsAtWorkplace: true });
    const nobody = jobLabourStatus(
      job({ jobId: "j10", social: true }),
      context({ residentsPresent: {} }),
    );
    expect(nobody.idleReason).toBe("no-partner");
  });

  it("counts only distinct residents other than the worker as partners", () => {
    const dupWorker = jobLabourStatus(
      job({ jobId: "j11", social: true }),
      context({ residentsPresent: { "zone-1": ["worker-a", "worker-a"] } }),
    );
    expect(dupWorker.idleReason).toBe("no-partner");
    const onePartner = jobLabourStatus(
      job({ jobId: "j12", social: true }),
      context({ residentsPresent: { "zone-1": ["worker-a", "res-b", "res-b"] } }),
    );
    expect(onePartner.running).toBe(true);
  });

  it("checks in order: workplace beats stock beats partner", () => {
    const both = jobLabourStatus(
      job({ jobId: "j13", requiresStock: true, social: true }),
      context({ zoneHabitats: { "zone-1": null } }),
    );
    expect(both.idleReason).toBe("no-workplace");
    const stockFirst = jobLabourStatus(
      job({ jobId: "j14", requiresStock: true, social: true }),
      context(),
    );
    expect(stockFirst.idleReason).toBe("unstocked");
  });

  it("exit test: removing one zone's workplace idles exactly its jobs and no others", () => {
    const jobs = [
      job({ jobId: "za", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen" }),
      job({ jobId: "zb", zoneId: "zone-1", workplaceRecipeId: "recipe-kitchen", workerId: "worker-c" }),
      job({ jobId: "zc", zoneId: "zone-2", workplaceRecipeId: "recipe-field", workerId: "worker-b" }),
    ];
    const before = labourStatuses(jobs, context());
    expect(before.map((s) => s.running)).toEqual([true, true, true]);
    const after = labourStatuses(
      jobs,
      context({ zoneHabitats: { "zone-1": null, "zone-2": solved("recipe-field") } }),
    );
    expect(after.map((s) => [s.jobId, s.running, s.idleReason])).toEqual([
      ["za", false, "no-workplace"],
      ["zb", false, "no-workplace"],
      ["zc", true, null],
    ]);
    expect(labourSummary(after)).toEqual({
      total: 3,
      running: 1,
      idle: 2,
      byReason: { "no-workplace": 2, unstocked: 0, "no-partner": 0 },
    });
  });

  it("keeps job order and never mutates its inputs", () => {
    const jobs = [job({ jobId: "m1" }), job({ jobId: "m2", zoneId: "zone-2", workplaceRecipeId: "recipe-field", workerId: "worker-b" })];
    const ctx = context();
    const beforeJobs = JSON.stringify(jobs);
    const beforeCtx = JSON.stringify({ ...ctx, stockedZones: [...ctx.stockedZones] });
    const out = labourStatuses(jobs, ctx);
    expect(out.map((s) => s.jobId)).toEqual(["m1", "m2"]);
    expect(JSON.stringify(jobs)).toBe(beforeJobs);
    expect(JSON.stringify({ ...ctx, stockedZones: [...ctx.stockedZones] })).toBe(beforeCtx);
    expect(out[0]).not.toBe(out[1]);
  });

  it("fails loudly on malformed input, never silently", () => {
    throwsWith(() => jobLabourStatus(job({ jobId: "" }), context()), "jobId");
    throwsWith(() => jobLabourStatus(job({ jobId: "x", requiresStock: "yes" as never }), context()), "requiresStock");
    throwsWith(() => labourStatuses([job({ jobId: "d" }), job({ jobId: "d" })], context()), "duplicate jobId");
    throwsWith(() => labourStatuses("nope" as never, context()), "jobs must be an array");
    throwsWith(() => jobLabourStatus(job({ jobId: "x" }), { ...context(), stockedZones: ["zone-1"] as never }), "stockedZones must be a Set");
    throwsWith(() => jobLabourStatus(job({ jobId: "x" }), { ...context(), residentsPresent: { "zone-1": "worker-a" as never } }), "residentsPresent");
  });

  it("staging locks: no live module imports the labour module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    expect(wiring).not.toContain("garden-labour");
    expect(view).not.toContain("garden-labour");
    expect(phase4).not.toContain("garden-labour");
  });
});
