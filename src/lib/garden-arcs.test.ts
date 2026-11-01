import { describe, expect, it } from "vitest";
import {
  applyArcBeats,
  validateArcBeat,
  type ArcBeat,
  type ResidentArc,
} from "./garden-arcs";

function arc(residentId: string, arcValue: string): ResidentArc {
  return { residentId, arc: arcValue };
}

function beat(id: string, changes: ResidentArc[] = []): ArcBeat {
  return {
    id,
    changes: changes.map((c) => ({ residentId: c.residentId, arc: c.arc })),
  };
}

describe("garden-arcs (B3 §2.5 resident-arc read)", () => {
  it("applies one beat's arc changes in place, appending new residents", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1"), arc("res-b", "arc-1")],
      [beat("b-1", [arc("res-b", "arc-2"), arc("new-a", "arc-1")])],
      "b-1",
    );
    expect(result.arcs).toEqual([
      arc("res-a", "arc-1"),
      arc("res-b", "arc-2"),
      arc("new-a", "arc-1"),
    ]);
    expect(result.changed).toEqual(["res-b", "new-a"]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("beats after the cursor do not apply yet", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [
        beat("b-1", [arc("res-a", "arc-2")]),
        beat("b-2", [arc("res-a", "arc-3")]),
      ],
      "b-1",
    );
    expect(result.arcs).toEqual([arc("res-a", "arc-2")]);
    expect(result.changed).toEqual(["res-a"]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("advancing the cursor applies the next beats in schedule order", () => {
    const schedule = [
      beat("b-1", [arc("res-a", "arc-2")]),
      beat("b-2", [arc("res-a", "arc-3"), arc("res-b", "arc-1")]),
    ];
    const result = applyArcBeats([arc("res-a", "arc-1")], schedule, "b-2");
    expect(result.arcs).toEqual([
      arc("res-a", "arc-3"),
      arc("res-b", "arc-1"),
    ]);
    expect(result.changed).toEqual(["res-a", "res-b"]);
    expect(result.appliedBeatIds).toEqual(["b-1", "b-2"]);
  });

  it("a later beat can overwrite an earlier arc, and the change is net", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [
        beat("b-1", [arc("res-a", "arc-2")]),
        beat("b-2", [arc("res-a", "arc-3")]),
      ],
      "b-2",
    );
    expect(result.arcs).toEqual([arc("res-a", "arc-3")]);
    expect(result.changed).toEqual(["res-a"]);
  });

  it("a later beat changing an arc back to its original value is not a net change", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [
        beat("b-1", [arc("res-a", "arc-2")]),
        beat("b-2", [arc("res-a", "arc-1")]),
      ],
      "b-2",
    );
    expect(result.arcs).toEqual([arc("res-a", "arc-1")]);
    expect(result.changed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1", "b-2"]);
  });

  it("assigning the arc a resident already has changes nothing but still applies", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [beat("b-1", [arc("res-a", "arc-1")])],
      "b-1",
    );
    expect(result.arcs).toEqual([arc("res-a", "arc-1")]);
    expect(result.changed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("an empty arc state gains entries only from applied beats", () => {
    const result = applyArcBeats(
      [],
      [
        beat("b-1", [arc("new-a", "arc-1")]),
        beat("b-2", [arc("new-b", "arc-1")]),
      ],
      "b-1",
    );
    expect(result.arcs).toEqual([arc("new-a", "arc-1")]);
    expect(result.changed).toEqual(["new-a"]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("an empty beat still counts as applied", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [beat("b-1", [])],
      "b-1",
    );
    expect(result.arcs).toEqual([arc("res-a", "arc-1")]);
    expect(result.changed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("caller-vocabulary arc tokens work: no stage is enumerated by the module", () => {
    const result = applyArcBeats(
      [arc("res-a", "token-x")],
      [beat("b-1", [arc("res-a", "token-y"), arc("res-b", "token-z")])],
      "b-1",
    );
    expect(result.arcs).toEqual([
      arc("res-a", "token-y"),
      arc("res-b", "token-z"),
    ]);
    expect(result.changed).toEqual(["res-a", "res-b"]);
  });

  it("cursor identity: the same cursor gives the same arcs, and inputs are untouched", () => {
    const arcs = [arc("res-a", "arc-1"), arc("res-b", "arc-1")];
    const schedule = [beat("b-1", [arc("res-b", "arc-2")])];
    const beforeArcs = JSON.stringify(arcs);
    const beforeSchedule = JSON.stringify(schedule);
    const first = applyArcBeats(arcs, schedule, "b-1");
    const second = applyArcBeats(arcs, schedule, "b-1");
    expect(first).toEqual(second);
    expect(JSON.stringify(arcs)).toEqual(beforeArcs);
    expect(JSON.stringify(schedule)).toEqual(beforeSchedule);
    // Result entries are fresh objects, not the input objects.
    expect(first.arcs[0]).not.toBe(arcs[0]);
  });

  it("an unknown cursor fails loudly instead of inventing a story position", () => {
    expect(() =>
      applyArcBeats([arc("res-a", "arc-1")], [beat("b-1")], "b-9"),
    ).toThrow();
    expect(() =>
      applyArcBeats([arc("res-a", "arc-1")], [beat("b-1")], ""),
    ).toThrow();
    expect(() => applyArcBeats([arc("res-a", "arc-1")], [], "b-1")).toThrow();
  });

  it("duplicate beat ids fail loudly", () => {
    expect(() =>
      applyArcBeats(
        [],
        [beat("b-1", [arc("new-a", "arc-1")]), beat("b-1", [arc("new-b", "arc-1")])],
        "b-1",
      ),
    ).toThrow();
  });

  it("a beat naming the same resident twice fails loudly", () => {
    expect(() =>
      validateArcBeat(beat("b-1", [arc("res-a", "arc-2"), arc("res-a", "arc-3")])),
    ).toThrow();
  });

  it("malformed beats and state fail loudly: empty id, empty arc, duplicate residents, non-array schedule", () => {
    expect(() => validateArcBeat(beat(""))).toThrow();
    expect(() => validateArcBeat(beat("b-1", [arc("res-a", "")]))).toThrow();
    expect(() => validateArcBeat(beat("b-1", [arc("", "arc-2")]))).toThrow();
    expect(() =>
      applyArcBeats(
        [arc("res-a", "arc-1"), arc("res-a", "arc-2")],
        [beat("b-1")],
        "b-1",
      ),
    ).toThrow();
    expect(() =>
      applyArcBeats([arc("res-a", "arc-1")], "nope" as never, "b-1"),
    ).toThrow();
    expect(() =>
      applyArcBeats("nope" as never, [beat("b-1")], "b-1"),
    ).toThrow();
  });

  it("the result shape carries exactly arcs, changed, appliedBeatIds", () => {
    const result = applyArcBeats(
      [arc("res-a", "arc-1")],
      [beat("b-1", [arc("res-a", "arc-2")])],
      "b-1",
    );
    expect(Object.keys(result).sort()).toEqual([
      "appliedBeatIds",
      "arcs",
      "changed",
    ]);
    // No composition field: an arc beat never adds or removes a resident.
    expect(result).not.toHaveProperty("residents");
    expect(result).not.toHaveProperty("arrived");
    expect(result).not.toHaveProperty("departed");
  });

  it("no authored content: no species, place, or arc-stage vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const moduleSource = fs.readFileSync(
      new URL("./garden-arcs.ts", import.meta.url),
      "utf-8",
    );
    for (const word of [
      "Sproutle",
      "Mochii",
      "Kittember",
      "Boot Harbor",
      "Dojo",
      "Garden Level",
    ]) {
      expect(moduleSource).not.toContain(word);
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
    expect(read("./garden-wiring.ts")).not.toContain("garden-arcs");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-arcs",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain("garden-arcs");
    expect(read("./garden-register.ts")).not.toContain("garden-arcs");
    // And the sibling composition read does not import it either:
    // arcs stay a separate read, not a field on a composition beat.
    expect(read("./garden-story.ts")).not.toContain("garden-arcs");
  });
});
