import { describe, expect, it } from "vitest";
import {
  applyStoryBeats,
  validateStoryBeat,
  type StoryBeat,
} from "./garden-story";

function beat(
  id: string,
  arrivals: string[] = [],
  departures: string[] = [],
): StoryBeat {
  return { id, arrivals, departures };
}

describe("garden-story (B3 §2.5 story-beat composition read)", () => {
  it("applies one beat's arrivals and departures, in composition order", () => {
    const result = applyStoryBeats(
      ["res-a", "res-b", "res-c"],
      [beat("b-1", ["new-a"], ["res-b"])],
      "b-1",
    );
    expect(result.residents).toEqual(["res-a", "res-c", "new-a"]);
    expect(result.arrived).toEqual(["new-a"]);
    expect(result.departed).toEqual(["res-b"]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("beats after the cursor do not apply yet", () => {
    const result = applyStoryBeats(
      ["res-a"],
      [
        beat("b-1", ["new-a"]),
        beat("b-2", ["new-b"], ["res-a"]),
        beat("b-3", ["new-c"]),
      ],
      "b-1",
    );
    expect(result.residents).toEqual(["res-a", "new-a"]);
    expect(result.arrived).toEqual(["new-a"]);
    expect(result.departed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("advancing the cursor applies the next beats in schedule order", () => {
    const schedule = [
      beat("b-1", ["new-a"]),
      beat("b-2", ["new-b"], ["res-a"]),
    ];
    const result = applyStoryBeats(["res-a"], schedule, "b-2");
    expect(result.residents).toEqual(["new-a", "new-b"]);
    expect(result.arrived).toEqual(["new-a", "new-b"]);
    expect(result.departed).toEqual(["res-a"]);
    expect(result.appliedBeatIds).toEqual(["b-1", "b-2"]);
  });

  it("a later beat can undo an earlier one", () => {
    const result = applyStoryBeats(
      ["res-a"],
      [beat("b-1", ["new-a"]), beat("b-2", [], ["new-a"])],
      "b-2",
    );
    // Net change: new-a arrived and then left, so it is neither.
    expect(result.residents).toEqual(["res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1", "b-2"]);
  });

  it("a later beat can re-arrive a resident departed by an earlier beat", () => {
    const result = applyStoryBeats(
      ["res-a", "res-b"],
      [beat("b-1", [], ["res-a"]), beat("b-2", ["res-a"])],
      "b-2",
    );
    // Present before and after: neither a net arrival nor a departure,
    // but it moved to the end (arrivals append).
    expect(result.residents).toEqual(["res-b", "res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
  });

  it("a beat can replace a resident: departures apply before arrivals", () => {
    const result = applyStoryBeats(
      ["res-a", "res-b"],
      [beat("b-1", ["new-a"], ["res-a"])],
      "b-1",
    );
    expect(result.residents).toEqual(["res-b", "new-a"]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("an arrival already resident is not duplicated, and the beat still counts as applied", () => {
    const result = applyStoryBeats(
      ["res-a"],
      [beat("b-1", ["res-a"], ["ghost"])],
      "b-1",
    );
    expect(result.residents).toEqual(["res-a"]);
    expect(result.arrived).toEqual([]);
    expect(result.departed).toEqual([]);
    expect(result.appliedBeatIds).toEqual(["b-1"]);
  });

  it("an empty schedule with no cursor target fails loudly, and an empty resident list takes arrivals only", () => {
    const result = applyStoryBeats(
      [],
      [beat("b-1", ["new-a", "new-b"])],
      "b-1",
    );
    expect(result.residents).toEqual(["new-a", "new-b"]);
    expect(result.arrived).toEqual(["new-a", "new-b"]);
    expect(result.departed).toEqual([]);
    expect(() => applyStoryBeats(["res-a"], [], "b-1")).toThrow();
  });

  it("beat ids are caller vocabulary, not a module-enumerated story", () => {
    // The story's beats work only because the caller names them;
    // the module enumerates no sequence, chapter, or event.
    const result = applyStoryBeats(
      [],
      [beat("beat-x", ["visitor-a"])],
      "beat-x",
    );
    expect(result.residents).toEqual(["visitor-a"]);
    expect(result.appliedBeatIds).toEqual(["beat-x"]);
  });

  it("the read never advances the story: same cursor always gives the same composition", () => {
    const residents = ["res-a"];
    const schedule = [beat("b-1", ["new-a"]), beat("b-2", ["new-b"])];
    expect(applyStoryBeats(residents, schedule, "b-1")).toEqual(
      applyStoryBeats(residents, schedule, "b-1"),
    );
    expect(residents).toEqual(["res-a"]);
    expect(schedule).toEqual([
      beat("b-1", ["new-a"]),
      beat("b-2", ["new-b"]),
    ]);
  });

  it("inputs are never mutated", () => {
    const residents = ["res-a", "res-b"];
    const schedule = [beat("b-1", ["new-a"], ["res-b"])];
    applyStoryBeats(residents, schedule, "b-1");
    expect(residents).toEqual(["res-a", "res-b"]);
    expect(schedule[0].arrivals).toEqual(["new-a"]);
    expect(schedule[0].departures).toEqual(["res-b"]);
  });

  it("an unknown cursor fails loudly instead of inventing a story position", () => {
    expect(() =>
      applyStoryBeats(["res-a"], [beat("b-1", ["new-a"])], "b-9"),
    ).toThrow();
    expect(() =>
      applyStoryBeats(["res-a"], [beat("b-1", ["new-a"])], ""),
    ).toThrow();
  });

  it("duplicate beat ids fail loudly", () => {
    expect(() =>
      applyStoryBeats(
        [],
        [beat("b-1", ["new-a"]), beat("b-1", ["new-b"])],
        "b-1",
      ),
    ).toThrow();
  });

  it("a beat that both arrives and departs the same creature fails loudly", () => {
    expect(() => validateStoryBeat(beat("b-1", ["x"], ["x"]))).toThrow();
  });

  it("malformed beats fail loudly: empty id, duplicate arrivals, duplicate residents, non-array schedule", () => {
    expect(() => validateStoryBeat(beat("", ["x"]))).toThrow();
    expect(() => validateStoryBeat(beat("b-1", ["x", "x"]))).toThrow();
    expect(() =>
      applyStoryBeats(["res-a", "res-a"], [beat("b-1")], "b-1"),
    ).toThrow();
    expect(() =>
      applyStoryBeats(["res-a"], "nope" as never, "b-1"),
    ).toThrow();
  });

  it("the result shape carries exactly residents, arrived, departed, appliedBeatIds", () => {
    const result = applyStoryBeats(
      ["res-a"],
      [beat("b-1", ["new-a"])],
      "b-1",
    );
    expect(Object.keys(result).sort()).toEqual([
      "appliedBeatIds",
      "arrived",
      "departed",
      "residents",
    ]);
    // No arc field: a resident's arc is a later slice, not smuggled here.
    expect(result).not.toHaveProperty("arc");
  });

  it("no authored content: no species, place, or story vocabulary in the module", async () => {
    const fs = await import("node:fs");
    const moduleSource = fs.readFileSync(
      new URL("./garden-story.ts", import.meta.url),
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
    expect(read("./garden-wiring.ts")).not.toContain("garden-story");
    expect(read("../components/views/GardenView.tsx")).not.toContain(
      "garden-story",
    );
    expect(read("./wiring/phase4-garden.ts")).not.toContain("garden-story");
    expect(read("./garden-register.ts")).not.toContain("garden-story");
  });
});
