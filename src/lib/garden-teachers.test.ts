import { describe, expect, it } from "vitest";
import {
  axesTaughtBy,
  taughtAxes,
  teachersForMeetings,
  validateTeacherMapping,
  type TeacherMapping,
  type TeacherMeeting,
} from "./garden-teachers";

function mapping(): TeacherMapping {
  return {
    "species-a": ["axis-swim", "axis-run"],
    "species-b": ["axis-run", "axis-power"],
    "species-c": [],
  };
}

function meetings(): TeacherMeeting[] {
  return [
    { speciesId: "species-b", at: 30 },
    { speciesId: "species-a", at: 10 },
    { speciesId: "species-b", at: 20 },
    { speciesId: "species-unknown", at: 5 },
    { speciesId: "species-c", at: 40 },
  ];
}

describe("garden-teachers (B3 §2.2 journey teachers)", () => {
  it("lists met teachers in first-met order with mapping-order axes", () => {
    const result = teachersForMeetings(mapping(), meetings());
    // species-unknown (at 5) has no mapping entry, so it does not
    // appear; species-b's earliest meeting is at 20, not 30.
    expect(result.map((t) => t.speciesId)).toEqual([
      "species-a",
      "species-b",
      "species-c",
    ]);
    expect(result[0]).toEqual({
      speciesId: "species-a",
      firstMetAt: 10,
      axes: ["axis-swim", "axis-run"],
    });
    expect(result[1]).toEqual({
      speciesId: "species-b",
      firstMetAt: 20,
      axes: ["axis-run", "axis-power"],
    });
    expect(result[2]).toEqual({
      speciesId: "species-c",
      firstMetAt: 40,
      axes: [],
    });
  });

  it("orders by stamp, with log order breaking stamp ties", () => {
    const result = teachersForMeetings(mapping(), [
      { speciesId: "species-b", at: 10 },
      { speciesId: "species-a", at: 10 },
    ]);
    expect(result.map((t) => t.speciesId)).toEqual([
      "species-b",
      "species-a",
    ]);
    expect(result[0].firstMetAt).toBe(10);
  });

  it("a species met twice yields one entry, at its earliest stamp", () => {
    const result = teachersForMeetings(mapping(), [
      { speciesId: "species-a", at: 50 },
      { speciesId: "species-a", at: 12 },
      { speciesId: "species-a", at: 12 },
    ]);
    expect(result).toEqual([
      {
        speciesId: "species-a",
        firstMetAt: 12,
        axes: ["axis-swim", "axis-run"],
      },
    ]);
  });

  it("taughtAxes unions axes once, in first-appearance order", () => {
    expect(taughtAxes(mapping(), meetings())).toEqual([
      "axis-swim",
      "axis-run",
      "axis-power",
    ]);
  });

  it("empty meetings teach nothing, and an empty mapping teaches nothing", () => {
    expect(teachersForMeetings(mapping(), [])).toEqual([]);
    expect(taughtAxes(mapping(), [])).toEqual([]);
    expect(teachersForMeetings({}, meetings())).toEqual([]);
    expect(taughtAxes({}, meetings())).toEqual([]);
  });

  it("a Map mapping reads exactly like a record mapping", () => {
    const map: TeacherMapping = new Map([
      ["species-a", ["axis-swim", "axis-run"]],
      ["species-b", ["axis-run", "axis-power"]],
      ["species-c", []],
    ]);
    expect(teachersForMeetings(map, meetings())).toEqual(
      teachersForMeetings(mapping(), meetings()),
    );
    expect(taughtAxes(map, meetings())).toEqual(
      taughtAxes(mapping(), meetings()),
    );
  });

  it("axesTaughtBy separates mapped-empty from unmapped, and copies", () => {
    expect(axesTaughtBy(mapping(), "species-a")).toEqual([
      "axis-swim",
      "axis-run",
    ]);
    expect(axesTaughtBy(mapping(), "species-c")).toEqual([]);
    expect(axesTaughtBy(mapping(), "species-unknown")).toBeNull();
    const got = axesTaughtBy(mapping(), "species-a")!;
    got.push("axis-forged");
    expect(axesTaughtBy(mapping(), "species-a")).toEqual([
      "axis-swim",
      "axis-run",
    ]);
  });

  it("validateTeacherMapping accepts a valid mapping and rejects bad ones", () => {
    expect(() => validateTeacherMapping(mapping())).not.toThrow();
    expect(() => validateTeacherMapping(new Map())).not.toThrow();
    expect(() => validateTeacherMapping({ "species-a": ["axis-x", "axis-x"] })).toThrow();
    expect(() => validateTeacherMapping({ "species-a": [""] })).toThrow();
    expect(() => validateTeacherMapping({ "species-a": "axis-x" })).toThrow();
    expect(() => validateTeacherMapping({ "": ["axis-x"] })).toThrow();
    expect(() => validateTeacherMapping(null)).toThrow();
    expect(() => validateTeacherMapping([])).toThrow();
    expect(() => validateTeacherMapping("species-a")).toThrow();
  });

  it("malformed meetings fail loudly", () => {
    expect(() =>
      teachersForMeetings(mapping(), [{ speciesId: "", at: 1 }]),
    ).toThrow();
    expect(() =>
      teachersForMeetings(mapping(), [{ speciesId: "species-a", at: NaN }]),
    ).toThrow();
    expect(() =>
      teachersForMeetings(mapping(), [{ speciesId: "species-a", at: 1 }] as unknown as TeacherMeeting[]),
    ).not.toThrow();
    expect(() =>
      teachersForMeetings(mapping(), "nope" as unknown as TeacherMeeting[]),
    ).toThrow();
    expect(() => axesTaughtBy(mapping(), "")).toThrow();
  });

  it("inputs are untouched and outputs are fresh", () => {
    const m = mapping();
    const mt = meetings();
    const beforeM = JSON.stringify(m);
    const beforeMt = JSON.stringify(mt);
    const result = teachersForMeetings(m, mt);
    expect(JSON.stringify(m)).toBe(beforeM);
    expect(JSON.stringify(mt)).toBe(beforeMt);
    result[0].axes.push("axis-forged");
    expect(teachersForMeetings(m, mt)[0].axes).toEqual([
      "axis-swim",
      "axis-run",
    ]);
  });

  it("exact result shape: no extra fields on a teacher entry", () => {
    const [entry] = teachersForMeetings(mapping(), [
      { speciesId: "species-a", at: 3 },
    ]);
    expect(Object.keys(entry).sort()).toEqual([
      "axes",
      "firstMetAt",
      "speciesId",
    ]);
  });

  it("caller-vocabulary ids: opaque tokens work unchanged", () => {
    const result = teachersForMeetings(
      { "tok-77": ["tok-axis-1"] },
      [{ speciesId: "tok-77", at: 1 }],
    );
    expect(result).toEqual([
      { speciesId: "tok-77", firstMetAt: 1, axes: ["tok-axis-1"] },
    ]);
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) =>
      fs.readFileSync(new URL(p, import.meta.url), "utf-8");
    const hosts = [
      "./garden-wiring.ts",
      "../components/views/GardenView.tsx",
      "./wiring/phase4-garden.ts",
      "./garden-register.ts",
      "./garden-story.ts",
      "./garden-arcs.ts",
      "./garden-migration.ts",
      "./garden-individual.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-teachers");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("./garden-teachers.ts", import.meta.url),
      "utf-8",
    );
    for (const token of ["Mochii", "Sproutle", "player", "ranger"]) {
      expect(source.toLowerCase()).not.toContain(token);
    }
  });
});
