import { describe, expect, it } from "vitest";
import {
  gardenCheckIn,
  type CheckInInputs,
} from "./garden-checkin";
import type { AutonomousChangeInputs } from "./garden-autonomous";
import type { MigrationRule } from "./garden-migration";
import type { StoryBeat } from "./garden-story";
import type { ArcBeat } from "./garden-arcs";
import type { MovementRecord } from "./garden-movement";

function autonomousBase(): AutonomousChangeInputs {
  return {
    residents: ["c-1", "c-2"],
    worldState: "key-a",
    migrationRules: [],
    storyBeats: [{ id: "b1", arrivals: [], departures: [] }],
    storyThroughBeatId: "b1",
    arcs: [{ residentId: "c-1", arc: "arc-a" }],
    arcBeats: [{ id: "a1", changes: [] }],
    arcThroughBeatId: "a1",
  };
}

function base(): CheckInInputs {
  return {
    log: [],
    news: { since: null },
    autonomous: autonomousBase(),
  };
}

function movement(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  from: string | null,
  to: string | null,
  at: number,
): MovementRecord {
  return { id, creatureId, verb, from, to, at };
}

describe("garden-checkin (B3 §2.5 check-in beat bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated change", () => {
    expect(gardenCheckIn(base())).toEqual({
      news: [],
      autonomous: {
        migration: {
          residents: ["c-1", "c-2"],
          arrived: [],
          departed: [],
          appliedRuleIds: [],
        },
        story: {
          residents: ["c-1", "c-2"],
          arrived: [],
          departed: [],
          appliedBeatIds: ["b1"],
        },
        arcs: {
          arcs: [{ residentId: "c-1", arc: "arc-a" }],
          changed: [],
          appliedBeatIds: ["a1"],
        },
      },
    });
  });

  it("full bundle: news and autonomous each exactly as its own read reports it", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-9", "garden-arrival", "wild-y", "home-a", 10),
      movement("m2", "c-8", "garden-departure", "home-a", "wild-y", 20),
      movement("m3", "c-7", "release", "home-a", "edge-x", 30),
    ];
    inputs.news = {
      since: null,
      gardenEdge: ["edge-x"],
    };
    inputs.autonomous.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: ["c-3"],
        departures: ["c-2"],
      } as MigrationRule,
    ];
    inputs.autonomous.storyBeats = [
      { id: "b1", arrivals: ["c-4"], departures: ["c-1"] } as StoryBeat,
    ];
    inputs.autonomous.arcBeats = [
      {
        id: "a1",
        changes: [{ residentId: "c-1", arc: "arc-b" }],
      } as ArcBeat,
    ];
    expect(gardenCheckIn(inputs)).toEqual({
      news: [
        {
          creatureId: "c-9",
          kind: "arrival",
          movementId: "m1",
          at: 10,
          from: "wild-y",
          to: "home-a",
        },
        {
          creatureId: "c-8",
          kind: "departure",
          movementId: "m2",
          at: 20,
          from: "home-a",
          to: "wild-y",
        },
        {
          creatureId: "c-7",
          kind: "edge-sighting",
          movementId: "m3",
          at: 30,
          from: "home-a",
          to: "edge-x",
        },
      ],
      autonomous: {
        migration: {
          residents: ["c-1", "c-3"],
          arrived: ["c-3"],
          departed: ["c-2"],
          appliedRuleIds: ["r1"],
        },
        story: {
          residents: ["c-2", "c-4"],
          arrived: ["c-4"],
          departed: ["c-1"],
          appliedBeatIds: ["b1"],
        },
        arcs: {
          arcs: [{ residentId: "c-1", arc: "arc-b" }],
          changed: ["c-1"],
          appliedBeatIds: ["a1"],
        },
      },
    });
  });

  it("news stamp gating: at the last check-in stamp is already seen", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 10),
      movement("m2", "c-2", "garden-arrival", null, "home-a", 11),
    ];
    inputs.news = { since: 10 };
    const result = gardenCheckIn(inputs);
    expect(result.news.map((item) => item.movementId)).toEqual(["m2"]);
  });

  it("since null means never checked in: the whole log is news", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 5),
    ];
    inputs.news = { since: null };
    expect(gardenCheckIn(inputs).news).toHaveLength(1);
  });

  it("gardenHomes filter: only arrivals to and departures from a Garden home count", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 1),
      movement("m2", "c-2", "garden-arrival", null, "elsewhere", 2),
      movement("m3", "c-3", "garden-departure", "home-a", null, 3),
      movement("m4", "c-4", "garden-departure", "elsewhere", null, 4),
    ];
    inputs.news = { since: null, gardenHomes: ["home-a"] };
    const result = gardenCheckIn(inputs);
    expect(result.news.map((item) => item.movementId)).toEqual(["m1", "m3"]);
  });

  it("edge-sighting only with an edge set and an edge destination", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-5", "release", "home-a", "edge-x", 1),
      movement("m2", "c-6", "release", "home-a", "wild-y", 2),
    ];
    inputs.news = { since: null, gardenEdge: ["edge-x"] };
    const result = gardenCheckIn(inputs);
    expect(result.news.map((item) => item.movementId)).toEqual(["m1"]);
    expect(result.news[0].kind).toBe("edge-sighting");
  });

  it("without an edge set, releases produce no sighting", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-5", "release", "home-a", "edge-x", 1),
    ];
    inputs.news = { since: null };
    expect(gardenCheckIn(inputs).news).toEqual([]);
  });

  it("keeper-to-keeper movements are never Garden news", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "gift", "keeper-a", "keeper-b", 1),
      movement("m2", "c-2", "trade", "keeper-a", "keeper-b", 2),
      movement("m3", "c-3", "transfer", "keeper-a", "keeper-b", 3),
    ];
    inputs.news = { since: null };
    expect(gardenCheckIn(inputs).news).toEqual([]);
  });

  it("side by side, not merged: one creature in the news and in the story result at once", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 1),
    ];
    inputs.news = { since: null };
    inputs.autonomous.storyBeats = [
      { id: "b1", arrivals: [], departures: ["c-1"] } as StoryBeat,
    ];
    const result = gardenCheckIn(inputs);
    // The doorway says c-1 arrived; the story says c-1 departed.
    // Both facts are reported; neither overwrites the other.
    expect(result.news.map((item) => item.creatureId)).toEqual(["c-1"]);
    expect(result.autonomous.story.departed).toEqual(["c-1"]);
    expect(result.autonomous.story.residents).toEqual(["c-2"]);
  });

  it("news in stamp order, log order breaking stamp ties", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 20),
      movement("m2", "c-2", "garden-arrival", null, "home-a", 10),
      movement("m3", "c-3", "garden-arrival", null, "home-a", 20),
    ];
    inputs.news = { since: null };
    const result = gardenCheckIn(inputs);
    expect(result.news.map((item) => item.movementId)).toEqual([
      "m2",
      "m1",
      "m3",
    ]);
  });

  it("loud failures: malformed doorway record", () => {
    const inputs = base();
    inputs.log = [
      { id: "", creatureId: "c-1", verb: "garden-arrival", from: null, to: "home-a", at: 1 } as MovementRecord,
    ];
    expect(() => gardenCheckIn(inputs)).toThrow();
  });

  it("loud failures: non-finite check-in stamp", () => {
    const inputs = base();
    inputs.news = { since: Number.NaN };
    expect(() => gardenCheckIn(inputs)).toThrow();
  });

  it("loud failures: unknown story cursor", () => {
    const inputs = base();
    inputs.autonomous.storyThroughBeatId = "no-such-beat";
    expect(() => gardenCheckIn(inputs)).toThrow();
  });

  it("loud failures: unknown arc cursor", () => {
    const inputs = base();
    inputs.autonomous.arcThroughBeatId = "no-such-beat";
    expect(() => gardenCheckIn(inputs)).toThrow();
  });

  it("loud failures: duplicate migration rule ids", () => {
    const inputs = base();
    const rule = {
      id: "r1",
      worldStates: ["key-a"],
      arrivals: [],
      departures: [],
    } as MigrationRule;
    inputs.autonomous.migrationRules = [rule, { ...rule }];
    expect(() => gardenCheckIn(inputs)).toThrow();
  });

  it("inputs untouched and fresh outputs across calls", () => {
    const inputs = base();
    inputs.log = [
      movement("m1", "c-1", "garden-arrival", null, "home-a", 1),
    ];
    const before = JSON.stringify(inputs);
    const first = gardenCheckIn(inputs);
    const second = gardenCheckIn(inputs);
    expect(JSON.stringify(inputs)).toBe(before);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first.news).not.toBe(second.news);
    expect(first.news[0]).not.toBe(second.news[0]);
    expect(first.autonomous).not.toBe(second.autonomous);
    expect(first.autonomous.migration).not.toBe(second.autonomous.migration);
  });

  it("exact result shape: two sections, no merged residents field", () => {
    const result = gardenCheckIn(base());
    expect(Object.keys(result).sort()).toEqual(["autonomous", "news"]);
    expect(result).not.toHaveProperty("residents");
    expect(Object.keys(result.autonomous).sort()).toEqual([
      "arcs",
      "migration",
      "story",
    ]);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const inputs = base();
    inputs.log = [
      movement("mx-9", "zz-7", "garden-arrival", "qq-1", "hh-2", 42),
    ];
    inputs.autonomous.residents = ["zz-7", "yy-3"];
    inputs.autonomous.arcs = [{ residentId: "zz-7", arc: "arc-zz" }];
    const result = gardenCheckIn(inputs);
    expect(result.news[0]).toEqual({
      creatureId: "zz-7",
      kind: "arrival",
      movementId: "mx-9",
      at: 42,
      from: "qq-1",
      to: "hh-2",
    });
    expect(result.autonomous.migration.residents).toEqual(["zz-7", "yy-3"]);
  });

  it("staging locks: no host or composed module imports the check-in bundle yet", async () => {
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
      "./garden-teachers.ts",
      "./garden-movement.ts",
      "./garden-arrivals.ts",
      "./garden-research.ts",
      "./garden-discovery.ts",
      "./garden-bonds.ts",
      "./garden-decay.ts",
      "./garden-record.ts",
      "./garden-inbound.ts",
      "./garden-news.ts",
      "./garden-autonomous.ts",
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-checkin");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-checkin.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
