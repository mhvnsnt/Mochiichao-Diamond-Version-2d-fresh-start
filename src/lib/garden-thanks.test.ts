import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  gatheringBeat,
  thanksEmissions,
  thanksPresentation,
  type ThanksUseEvent,
} from "./garden-thanks";

const HAPPY: ThanksUseEvent = { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 2, totalNeeds: 2 };

describe("garden-thanks emission read (DQB2 X7, pure form)", () => {
  it("a single happy use emits one signal at intensity 1", () => {
    const signals = thanksEmissions([HAPPY]);
    expect(signals).toEqual([
      { zoneId: "meadow", habitatId: "pond", uses: 1, satisfiedNeeds: 2, totalNeeds: 2, intensity: 1 },
    ]);
  });

  it("partial satisfaction gives a fractional intensity, not a band", () => {
    const signals = thanksEmissions([
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 1, totalNeeds: 2 },
    ]);
    expect(signals[0].intensity).toBe(0.5);
  });

  it("a use that satisfied nothing emits nothing", () => {
    expect(
      thanksEmissions([{ zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 0, totalNeeds: 3 }]),
    ).toEqual([]);
  });

  it("same zone + habitat groups: counts sum, intensity is the window ratio", () => {
    const signals = thanksEmissions([
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 1, totalNeeds: 2 },
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 2, totalNeeds: 2 },
    ]);
    expect(signals).toHaveLength(1);
    expect(signals[0].uses).toBe(2);
    expect(signals[0].satisfiedNeeds).toBe(3);
    expect(signals[0].totalNeeds).toBe(4);
    expect(signals[0].intensity).toBe(0.75);
  });

  it("same zone, different habitat stays separate; null habitat stays separate", () => {
    const signals = thanksEmissions([
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 1, totalNeeds: 1 },
      { zoneId: "meadow", habitatId: null, satisfiedNeeds: 1, totalNeeds: 1 },
      { zoneId: "meadow", habitatId: "grove", satisfiedNeeds: 1, totalNeeds: 1 },
    ]);
    expect(signals.map((s) => s.habitatId)).toEqual([null, "grove", "pond"]);
  });

  it("output order is deterministic regardless of input order", () => {
    const a = thanksEmissions([
      { zoneId: "b-zone", habitatId: "x", satisfiedNeeds: 1, totalNeeds: 1 },
      { zoneId: "a-zone", habitatId: "x", satisfiedNeeds: 1, totalNeeds: 1 },
    ]);
    const b = thanksEmissions([
      { zoneId: "a-zone", habitatId: "x", satisfiedNeeds: 1, totalNeeds: 1 },
      { zoneId: "b-zone", habitatId: "x", satisfiedNeeds: 1, totalNeeds: 1 },
    ]);
    expect(a).toEqual(b);
    expect(a.map((s) => s.zoneId)).toEqual(["a-zone", "b-zone"]);
  });

  it("empty window emits no signals", () => {
    expect(thanksEmissions([])).toEqual([]);
  });

  it("gathering beat fires on a level rise, at the caller heart-place", () => {
    expect(gatheringBeat(1, 2, "heart")).toEqual({
      kind: "gathering",
      zoneId: "heart",
      fromLevel: 1,
      toLevel: 2,
    });
  });

  it("gathering beat fires on first attainment, with fromLevel null", () => {
    expect(gatheringBeat(null, 1, "heart")).toEqual({
      kind: "gathering",
      zoneId: "heart",
      fromLevel: null,
      toLevel: 1,
    });
  });

  it("no beat when the level did not change or no new level exists", () => {
    expect(gatheringBeat(2, 2, "heart")).toBeNull();
    expect(gatheringBeat(1, null, "heart")).toBeNull();
    expect(gatheringBeat(null, null, "heart")).toBeNull();
  });

  it("the beat names no rite and no object (owner slot S4 unsettled)", () => {
    const beat = gatheringBeat(1, 2, "heart");
    expect(beat).not.toHaveProperty("rite");
    expect(beat).not.toHaveProperty("ceremony");
    expect(beat).not.toHaveProperty("bell");
    expect(Object.keys(beat ?? {}).sort()).toEqual(["fromLevel", "kind", "toLevel", "zoneId"]);
  });

  it("combined presentation read carries signals + beat together", () => {
    const p = thanksPresentation({
      events: [HAPPY],
      previousLevel: 1,
      newLevel: 2,
      heartZoneId: "heart",
    });
    expect(p.signals).toHaveLength(1);
    expect(p.gathering).toEqual({ kind: "gathering", zoneId: "heart", fromLevel: 1, toLevel: 2 });
  });

  it("loud failures: bad ids, counts, and levels", () => {
    expect(() => thanksEmissions([{ zoneId: "", habitatId: null, satisfiedNeeds: 1, totalNeeds: 1 }])).toThrow(
      "garden-thanks:",
    );
    expect(() =>
      thanksEmissions([{ zoneId: "z", habitatId: null, satisfiedNeeds: -1, totalNeeds: 1 }]),
    ).toThrow("garden-thanks:");
    expect(() =>
      thanksEmissions([{ zoneId: "z", habitatId: null, satisfiedNeeds: 2, totalNeeds: 1 }]),
    ).toThrow("garden-thanks:");
    expect(() =>
      thanksEmissions([{ zoneId: "z", habitatId: null, satisfiedNeeds: 1.5, totalNeeds: 2 }]),
    ).toThrow("garden-thanks:");
    expect(() => gatheringBeat(-1, 2, "heart")).toThrow("garden-thanks:");
    expect(() => gatheringBeat(1, 2.5, "heart")).toThrow("garden-thanks:");
    expect(() => gatheringBeat(1, 2, "")).toThrow("garden-thanks:");
    expect(() => thanksEmissions("not-an-array" as never)).toThrow("garden-thanks:");
  });

  it("purity: inputs are never mutated", () => {
    const events: ThanksUseEvent[] = [
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 1, totalNeeds: 2 },
      { zoneId: "meadow", habitatId: "pond", satisfiedNeeds: 1, totalNeeds: 2 },
    ];
    const before = JSON.stringify(events);
    thanksEmissions(events);
    expect(JSON.stringify(events)).toBe(before);
  });

  it("no signal carries a balance, wallet, or spendable field", () => {
    const [s] = thanksEmissions([HAPPY]);
    expect(Object.keys(s).sort()).toEqual([
      "habitatId",
      "intensity",
      "satisfiedNeeds",
      "totalNeeds",
      "uses",
      "zoneId",
    ]);
  });

  it("staging locks: no live module imports the thanks module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    expect(wiring).not.toContain("garden-thanks");
    expect(view).not.toContain("garden-thanks");
    expect(phase4).not.toContain("garden-thanks");
  });
});
