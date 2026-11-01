import { describe, expect, it } from "vitest";
import {
  autonomousChange,
  type AutonomousChangeInputs,
} from "./garden-autonomous";
import type { MigrationRule } from "./garden-migration";
import type { StoryBeat } from "./garden-story";
import type { ArcBeat, ResidentArc } from "./garden-arcs";

function base(): AutonomousChangeInputs {
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

describe("garden-autonomous (B3 §2.5 autonomous change bundle)", () => {
  it("minimal inputs read back unchanged, no fabricated change", () => {
    expect(autonomousChange(base())).toEqual({
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
    });
  });

  it("full bundle: each section exactly as its own read reports it", () => {
    const inputs = base();
    inputs.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: ["c-3"],
        departures: ["c-2"],
      } as MigrationRule,
    ];
    inputs.storyBeats = [
      { id: "b1", arrivals: ["c-4"], departures: ["c-1"] } as StoryBeat,
    ];
    inputs.arcBeats = [
      {
        id: "a1",
        changes: [
          { residentId: "c-1", arc: "arc-b" },
          { residentId: "c-3", arc: "arc-c" },
        ],
      } as ArcBeat,
    ];
    const result = autonomousChange(inputs);
    expect(result.migration).toEqual({
      residents: ["c-1", "c-3"],
      arrived: ["c-3"],
      departed: ["c-2"],
      appliedRuleIds: ["r1"],
    });
    expect(result.story).toEqual({
      residents: ["c-2", "c-4"],
      arrived: ["c-4"],
      departed: ["c-1"],
      appliedBeatIds: ["b1"],
    });
    expect(result.arcs).toEqual({
      arcs: [
        { residentId: "c-1", arc: "arc-b" },
        { residentId: "c-3", arc: "arc-c" },
      ],
      changed: ["c-1", "c-3"],
      appliedBeatIds: ["a1"],
    });
  });

  it("side by side, not chained: migration and story both start from the input residents", () => {
    const inputs = base();
    inputs.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: [],
        departures: ["c-1"],
      } as MigrationRule,
    ];
    inputs.storyBeats = [
      { id: "b1", arrivals: ["c-9"], departures: [] } as StoryBeat,
    ];
    const result = autonomousChange(inputs);
    // Migration departed c-1, but the story section still starts
    // from the input residents, so c-1 is still in the story result.
    expect(result.migration.residents).toEqual(["c-2"]);
    expect(result.story.residents).toEqual(["c-1", "c-2", "c-9"]);
  });

  it("story cursor gates later beats; migration and arcs are unaffected", () => {
    const inputs = base();
    inputs.storyBeats = [
      { id: "b1", arrivals: ["c-3"], departures: [] },
      { id: "b2", arrivals: ["c-4"], departures: [] },
    ];
    inputs.storyThroughBeatId = "b1";
    inputs.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: ["c-5"],
        departures: [],
      } as MigrationRule,
    ];
    const result = autonomousChange(inputs);
    expect(result.story).toEqual({
      residents: ["c-1", "c-2", "c-3"],
      arrived: ["c-3"],
      departed: [],
      appliedBeatIds: ["b1"],
    });
    expect(result.migration.arrived).toEqual(["c-5"]);
  });

  it("arc cursor gates later beats", () => {
    const inputs = base();
    inputs.arcBeats = [
      { id: "a1", changes: [{ residentId: "c-1", arc: "arc-b" }] },
      { id: "a2", changes: [{ residentId: "c-1", arc: "arc-c" }] },
    ];
    inputs.arcThroughBeatId = "a1";
    const result = autonomousChange(inputs);
    expect(result.arcs).toEqual({
      arcs: [{ residentId: "c-1", arc: "arc-b" }],
      changed: ["c-1"],
      appliedBeatIds: ["a1"],
    });
  });

  it("arc net zero: changed back by a later applied beat reads unchanged", () => {
    const inputs = base();
    inputs.arcBeats = [
      { id: "a1", changes: [{ residentId: "c-1", arc: "arc-b" }] },
      { id: "a2", changes: [{ residentId: "c-1", arc: "arc-a" }] },
    ];
    inputs.arcThroughBeatId = "a2";
    const result = autonomousChange(inputs);
    expect(result.arcs.arcs).toEqual([{ residentId: "c-1", arc: "arc-a" }]);
    expect(result.arcs.changed).toEqual([]);
    expect(result.arcs.appliedBeatIds).toEqual(["a1", "a2"]);
  });

  it("migration key that fires nothing still leaves story and arcs applying", () => {
    const inputs = base();
    inputs.worldState = "key-b";
    inputs.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: ["c-3"],
        departures: [],
      } as MigrationRule,
    ];
    inputs.storyBeats = [
      { id: "b1", arrivals: ["c-4"], departures: [] },
    ];
    const result = autonomousChange(inputs);
    expect(result.migration).toEqual({
      residents: ["c-1", "c-2"],
      arrived: [],
      departed: [],
      appliedRuleIds: [],
    });
    expect(result.story.arrived).toEqual(["c-4"]);
  });

  it("loud failures: bad bundle, unknown story cursor, unknown arc cursor", () => {
    expect(() => autonomousChange(null as never)).toThrow();
    const unknownStory = base();
    unknownStory.storyThroughBeatId = "no-such-beat";
    expect(() => autonomousChange(unknownStory)).toThrow();
    const unknownArc = base();
    unknownArc.arcThroughBeatId = "no-such-beat";
    expect(() => autonomousChange(unknownArc)).toThrow();
  });

  it("loud failures: duplicate migration rule ids and duplicate arc-beat residents", () => {
    const dupRule = base();
    dupRule.migrationRules = [
      { id: "r1", worldStates: ["key-a"], arrivals: ["c-3"], departures: [] },
      { id: "r1", worldStates: ["key-a"], arrivals: ["c-4"], departures: [] },
    ] as MigrationRule[];
    expect(() => autonomousChange(dupRule)).toThrow();
    const dupArc = base();
    dupArc.arcBeats = [
      {
        id: "a1",
        changes: [
          { residentId: "c-1", arc: "arc-b" },
          { residentId: "c-1", arc: "arc-c" },
        ],
      },
    ];
    expect(() => autonomousChange(dupArc)).toThrow();
  });

  it("loud failures: a story beat arriving and departing the same creature", () => {
    const inputs = base();
    inputs.storyBeats = [
      { id: "b1", arrivals: ["c-1"], departures: ["c-1"] },
    ];
    expect(() => autonomousChange(inputs)).toThrow();
  });

  it("inputs untouched and outputs fresh across calls", () => {
    const inputs = base();
    inputs.migrationRules = [
      {
        id: "r1",
        worldStates: ["key-a"],
        arrivals: ["c-3"],
        departures: [],
      } as MigrationRule,
    ];
    const before = JSON.stringify(inputs);
    const first = autonomousChange(inputs);
    first.migration.residents.push("tampered");
    first.arcs.arcs[0]!.arc = "tampered";
    const second = autonomousChange(inputs);
    expect(second.migration.residents).toEqual(["c-1", "c-2", "c-3"]);
    expect(second.arcs.arcs).toEqual([{ residentId: "c-1", arc: "arc-a" }]);
    expect(JSON.stringify(inputs)).toBe(before);
  });

  it("exact result shape: three sections, no merged residents field", () => {
    const result = autonomousChange(base());
    expect(Object.keys(result).sort()).toEqual([
      "arcs",
      "migration",
      "story",
    ]);
    expect("residents" in result).toBe(false);
  });

  it("caller-vocabulary ids pass through unchanged", () => {
    const inputs: AutonomousChangeInputs = {
      residents: ["odd-creature-9"],
      worldState: "odd-key-7",
      migrationRules: [
        {
          id: "odd-rule-3",
          worldStates: ["odd-key-7"],
          arrivals: ["odd-creature-10"],
          departures: [],
        },
      ],
      storyBeats: [
        { id: "odd-beat-2", arrivals: [], departures: ["odd-creature-9"] },
      ],
      storyThroughBeatId: "odd-beat-2",
      arcs: [{ residentId: "odd-creature-9", arc: "odd-arc-1" }],
      arcBeats: [
        {
          id: "odd-arc-beat-1",
          changes: [{ residentId: "odd-creature-9", arc: "odd-arc-2" }],
        },
      ],
      arcThroughBeatId: "odd-arc-beat-1",
    };
    const result = autonomousChange(inputs);
    expect(result.migration.residents).toEqual([
      "odd-creature-9",
      "odd-creature-10",
    ]);
    expect(result.story.residents).toEqual([]);
    expect(result.arcs.arcs).toEqual([
      { residentId: "odd-creature-9", arc: "odd-arc-2" },
    ]);
  });

  it("staging locks: no host or composed module imports the autonomous bundle yet", async () => {
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
    ];
    for (const host of hosts) {
      expect(read(host)).not.toContain("garden-autonomous");
    }
  });

  it("no-authored-content: the module source names no creature kind", async () => {
    const fs = await import("node:fs");
    const source = fs
      .readFileSync(new URL("./garden-autonomous.ts", import.meta.url), "utf-8")
      .toLowerCase();
    for (const token of ["mochii", "sproutle", "kittember", "zephling"]) {
      expect(source).not.toContain(token);
    }
  });
});
