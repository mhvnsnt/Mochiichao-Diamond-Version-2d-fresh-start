import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  areasForSpecies,
  dexAreaLabel,
  dexAreaMessage,
  worldAreasForSpecies,
  type DexWorldAreaRow,
} from "./dexAreas";

// Fixture mirrors the real worldAreas shape: five live-map rows,
// sector0-placed listing one species twice in its slots.
const FIXTURE: DexWorldAreaRow[] = [
  {
    areaId: "route-1-grass",
    mapId: "route_1",
    method: "grass",
    slots: [{ speciesId: "038" }, { speciesId: "001" }],
  },
  {
    areaId: "binary-woods-grass",
    mapId: "binary_woods",
    method: "grass",
    slots: [{ speciesId: "010" }],
  },
  {
    areaId: "sector0-placed",
    mapId: "sector0",
    method: "placed",
    slots: [
      { speciesId: "001" },
      { speciesId: "004" },
      { speciesId: "007" },
      { speciesId: "007" },
      { speciesId: "010" },
    ],
  },
];

describe("areasForSpecies (S11 slice 5)", () => {
  it("returns each matching area once, in input order", () => {
    expect(areasForSpecies("001", FIXTURE)).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
      { areaId: "sector0-placed", mapId: "sector0", method: "placed" },
    ]);
  });
  it("a species listed twice in one area's slots still reads as one area", () => {
    expect(areasForSpecies("007", FIXTURE)).toEqual([
      { areaId: "sector0-placed", mapId: "sector0", method: "placed" },
    ]);
  });
  it("species do not leak across areas", () => {
    expect(areasForSpecies("038", FIXTURE)).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
    ]);
  });
  it("an unknown species reads no areas, never an invented one", () => {
    expect(areasForSpecies("147", FIXTURE)).toEqual([]);
    expect(areasForSpecies("", FIXTURE)).toEqual([]);
  });
  it("malformed rows are skipped, not guessed at", () => {
    const rows = [
      { areaId: "no-slots", mapId: "route_1", method: "grass" },
      { areaId: "null-slots", mapId: "route_1", method: "grass", slots: null },
      { areaId: "no-method", mapId: "route_1", slots: [{ speciesId: "001" }] },
      ...FIXTURE,
    ] as unknown as DexWorldAreaRow[];
    expect(areasForSpecies("001", rows)).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
      { areaId: "sector0-placed", mapId: "sector0", method: "placed" },
    ]);
  });
  it("a row without an areaId falls back to mapId-method, like encounters.ts", () => {
    const rows: DexWorldAreaRow[] = [
      { mapId: "route_1", method: "grass", slots: [{ speciesId: "001" }] },
    ];
    expect(areasForSpecies("001", rows)).toEqual([
      { areaId: "route_1-grass", mapId: "route_1", method: "grass" },
    ]);
  });
});

describe("worldAreasForSpecies against the real encounters.json", () => {
  it("Razorgater 004 reads sector0-placed and cave-of-echoes-cave", () => {
    expect(worldAreasForSpecies("004")).toEqual([
      { areaId: "cave-of-echoes-cave", mapId: "cave_of_echoes", method: "cave" },
      { areaId: "sector0-placed", mapId: "sector0", method: "placed" },
    ]);
  });
  it("Sproutle 038 reads route-1-grass only", () => {
    expect(worldAreasForSpecies("038")).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
    ]);
  });
  it("a roster species with no worldArea row reads none", () => {
    expect(worldAreasForSpecies("147")).toEqual([]);
  });
});

describe("dexAreaLabel / dexAreaMessage", () => {
  it("labels an area by its authored id plus method", () => {
    expect(
      dexAreaLabel({ areaId: "sector0-placed", mapId: "sector0", method: "placed" }),
    ).toBe("sector0-placed (placed)");
  });
  it("the message joins areas, or says honestly when there are none", () => {
    expect(dexAreaMessage("004", "caught")).toContain("cave-of-echoes-cave (cave)");
    expect(dexAreaMessage("004", "caught")).toContain("sector0-placed (placed)");
    expect(dexAreaMessage("147", "seen")).toBe("No recorded area yet.");
    expect(dexAreaMessage("004", "undiscovered")).toBe("Undiscovered.");
  });
});

describe("DexView area section source lock (S11 slice 5)", () => {
  it("the section renders in the shared detail, the current detail, and both retro AREA paths", () => {
    const src = readFileSync(
      new URL("../components/views/DexView.tsx", import.meta.url),
      "utf8",
    );
    expect(src).toContain("worldAreasForSpecies");
    expect(src).toContain("dexAreaMessage");
    expect(src).toContain("Found in");
    expect(src).toContain("<AreaSection speciesId={speciesId} status={status} />");
    expect(src).toContain(
      "<AreaSection speciesId={selected.speciesId} status={selectedStatus} />",
    );
    // The old honest placeholder is gone from every look: area data
    // now exists for the species that have it, and the no-area line
    // is the per-species honest one.
    expect(src).not.toContain(
      "where this creature is found is not in the Mochiichao roster data yet",
    );
  });
});
