import { describe, expect, it } from "vitest";
import { edgeDiscoveries, isEdgeDiscoverable } from "./garden-discovery";
import type { MovementRecord } from "./garden-movement";

const EDGE = ["edge-a", "edge-b"];

function rec(
  id: string,
  creatureId: string,
  verb: MovementRecord["verb"],
  to: string | null,
  at: number,
): MovementRecord {
  return { id, creatureId, verb, from: null, to, at };
}

describe("garden-discovery (B3 §2.3 edge discovery read)", () => {
  it("qualifies a release to an edge place, and only that", () => {
    const log = [
      rec("m1", "c1", "release", "edge-a", 10),
      rec("m2", "c2", "release", "far-place", 11),
      rec("m3", "c3", "gift", "edge-a", 12),
      rec("m4", "c4", "garden-arrival", "edge-a", 13),
    ];
    expect(edgeDiscoveries(log, { gardenEdge: EDGE })).toEqual([
      {
        creatureId: "c1",
        releaseRecordId: "m1",
        releasedAt: 10,
        releasedTo: "edge-a",
      },
    ]);
    expect(isEdgeDiscoverable(log, "c1", { gardenEdge: EDGE })).toBe(true);
    expect(isEdgeDiscoverable(log, "c2", { gardenEdge: EDGE })).toBe(false);
    expect(isEdgeDiscoverable(log, "c3", { gardenEdge: EDGE })).toBe(false);
    expect(isEdgeDiscoverable(log, "c4", { gardenEdge: EDGE })).toBe(false);
  });

  it("a later movement of any verb ends the candidacy", () => {
    const log = [
      rec("m1", "c1", "release", "edge-a", 10),
      rec("m2", "c1", "garden-arrival", "garden-home", 20),
      rec("m3", "c2", "release", "edge-b", 10),
      rec("m4", "c2", "transfer", "other-keep", 20),
      rec("m5", "c3", "release", "edge-a", 10),
      rec("m6", "c3", "release", "far-place", 20),
    ];
    expect(edgeDiscoveries(log, { gardenEdge: EDGE })).toEqual([]);
  });

  it("a later release to the edge replaces the earlier one (one entry)", () => {
    const log = [
      rec("m1", "c1", "release", "edge-a", 10),
      rec("m2", "c1", "garden-departure", "edge-b", 20),
      rec("m3", "c1", "release", "edge-b", 30),
    ];
    expect(edgeDiscoveries(log, { gardenEdge: EDGE })).toEqual([
      {
        creatureId: "c1",
        releaseRecordId: "m3",
        releasedAt: 30,
        releasedTo: "edge-b",
      },
    ]);
  });

  it("orders by release stamp, ties by release-record log order", () => {
    const log = [
      rec("m1", "c-early-first-seen", "gift", "keep-x", 1),
      rec("m2", "c-late", "release", "edge-a", 5),
      rec("m3", "c-early-first-seen", "release", "edge-b", 5),
      rec("m4", "c-earliest", "release", "edge-a", 2),
    ];
    // c-earliest first (stamp 2); the stamp-5 tie breaks by the
    // release records' log order (m2 before m3), NOT by the
    // creatures' first appearance (m1 would put c-early first).
    expect(
      edgeDiscoveries(log, { gardenEdge: EDGE }).map((d) => d.creatureId),
    ).toEqual(["c-earliest", "c-late", "c-early-first-seen"]);
  });

  it("a release with no destination never qualifies", () => {
    const log = [rec("m1", "c1", "release", null, 10)];
    expect(edgeDiscoveries(log, { gardenEdge: EDGE })).toEqual([]);
    expect(isEdgeDiscoverable(log, "c1", { gardenEdge: EDGE })).toBe(false);
  });

  it("an empty log discovers nothing; unknown creatures are false", () => {
    expect(edgeDiscoveries([], { gardenEdge: EDGE })).toEqual([]);
    expect(isEdgeDiscoverable([], "nobody", { gardenEdge: EDGE })).toBe(false);
  });

  it("an eligible-creature set applies the #102 range rule, caller-resolved", () => {
    const log = [
      rec("m1", "c1", "release", "edge-a", 10),
      rec("m2", "c2", "release", "edge-a", 11),
    ];
    expect(
      edgeDiscoveries(log, {
        gardenEdge: EDGE,
        eligibleCreatures: new Set(["c2"]),
      }).map((d) => d.creatureId),
    ).toEqual(["c2"]);
    expect(
      edgeDiscoveries(log, { gardenEdge: EDGE, eligibleCreatures: [] }).length,
    ).toBe(0);
  });

  it("an empty edge set discovers nothing (no guessing where the edge is)", () => {
    const log = [rec("m1", "c1", "release", "edge-a", 10)];
    expect(edgeDiscoveries(log, { gardenEdge: [] })).toEqual([]);
  });

  it("inputs are never mutated or reordered", () => {
    const log = [
      rec("m1", "c2", "release", "edge-a", 20),
      rec("m2", "c1", "release", "edge-a", 10),
    ];
    const snapshot = JSON.stringify(log);
    const out = edgeDiscoveries(log, { gardenEdge: EDGE });
    expect(out.map((d) => d.creatureId)).toEqual(["c1", "c2"]);
    expect(JSON.stringify(log)).toBe(snapshot);
    expect(out[0]).not.toBe(log[1]);
  });

  it("fails loudly on malformed records and malformed caller sets", () => {
    const bad = [{ id: "x", creatureId: "c1", verb: "teleport", from: null, to: "edge-a", at: 1 }] as unknown as never;
    expect(() => edgeDiscoveries(bad, { gardenEdge: EDGE })).toThrow();
    expect(() =>
      edgeDiscoveries([], { gardenEdge: [""] }),
    ).toThrow();
    expect(() =>
      edgeDiscoveries([], {
        gardenEdge: EDGE,
        eligibleCreatures: [""],
      }),
    ).toThrow();
    expect(() =>
      edgeDiscoveries("not-an-array" as never, { gardenEdge: EDGE }),
    ).toThrow();
    expect(() =>
      isEdgeDiscoverable([], "", { gardenEdge: EDGE }),
    ).toThrow();
  });

  it("no authored content: no species, place, or name vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const src = fs.readFileSync(
      new URL("./garden-discovery.ts", import.meta.url),
      "utf-8",
    );
    // The module names only the doorway verbs and the spec's own
    // concepts; it must not name any creature, place, or route.
    for (const word of ["Sproutle", "Mochii", "Kittember", "Route", "Boot Harbor"]) {
      expect(src).not.toContain(word);
    }
  });

  it("staging locks: no host imports the module yet", async () => {
    const fs = await import("node:fs");
    const read = (p: string) => {
      try {
        return fs.readFileSync(new URL(p, import.meta.url), "utf-8");
      } catch {
        return "";
      }
    };
    expect(read("./garden-wiring.ts")).not.toContain("garden-discovery");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-discovery",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain("garden-discovery");
    expect(read("./garden-register.ts")).not.toContain("garden-discovery");
  });
});
