// Stub-kill S-3 receipts: the field-technique engine reads the
// HM_REQUIRED table, the tile-15 split holds, and gates evaluate
// against real authored maps.
import { describe, it, expect } from "vitest";
import {
  FIELD_TECHNIQUES, techniqueForTile, techniqueByName, evaluateTileGate,
} from "./fieldTechniques";
import { HM_REQUIRED, TILE } from "../world/WorldConstants";
import { FULL_WORLD } from "../world/FullWorldMaps";

const partyWith = (moves: string[]) => [{ hp: 10, nickname: "Partner", moves } as any];
const HELD = { "tech.boulder_break": true, "tech.slice": true, "tech.wave": true };

describe("S-3 field-technique engine", () => {
  it("all 11 Rare verbs exist, named from RARE-FIELD-EFFECTS", () => {
    expect(FIELD_TECHNIQUES.map((t) => t.name)).toEqual([
      "Slice", "Boulder Break", "Mighty Push", "Cascade", "Wave",
      "Deep Dive", "Vortex", "Crag Climb", "Mist Clear", "Illuminate", "Ascend",
    ]);
    for (const t of FIELD_TECHNIQUES) expect(t.flag).toMatch(/^tech\.[a-z_]+$/);
  });

  it("HM_REQUIRED names resolve to techniques (the table is read, not decorative)", () => {
    for (const [tile, name] of Object.entries(HM_REQUIRED)) {
      expect(techniqueByName(name), `tile ${tile}`).not.toBeNull();
      expect(techniqueForTile(Number(tile))?.name).toBe(name);
    }
  });

  it("tile 15 is split: smash (15) vs push (26)", () => {
    expect(techniqueForTile(TILE.HM_ROCK)?.name).toBe("Boulder Break");
    expect(techniqueForTile(TILE.HM_BOULDER)?.name).toBe("Mighty Push");
    expect(techniqueForTile(TILE.HM_CUT)?.name).toBe("Slice");
    expect(techniqueForTile(TILE.WATER)?.name).toBe("Wave");
    expect(techniqueForTile(TILE.HM_WATERFALL)?.name).toBe("Cascade");
  });

  it("gate verdicts: un-granted acquisition refuses with the reason spoken", () => {
    const v = evaluateTileGate(TILE.HM_ROCK, {}, partyWith(["ROCK_SMASH"]));
    expect(v?.open).toBe(false);
    if (v?.open === false) {
      expect(v.reason).toBe("not-held");
      expect(v.text).toContain("Boulder Break");
    }
  });

  it("gate verdicts: held but no performer refuses differently", () => {
    const v = evaluateTileGate(TILE.HM_ROCK, HELD, partyWith(["TACKLE"]));
    expect(v?.open).toBe(false);
    if (v?.open === false) expect(v.reason).toBe("no-performer");
  });

  it("gate verdicts: held + performer opens (id and display-name move forms)", () => {
    expect(evaluateTileGate(TILE.HM_ROCK, HELD, partyWith(["ROCK_SMASH"]))?.open).toBe(true);
    expect(evaluateTileGate(TILE.HM_ROCK, HELD, partyWith(["Rock Smash"]))?.open).toBe(true);
    expect(evaluateTileGate(TILE.HM_ROCK, HELD, partyWith(["Boulder Break"]))?.open).toBe(true);
    const fainted = [{ hp: 0, nickname: "Down", moves: ["ROCK_SMASH"] } as any];
    expect(evaluateTileGate(TILE.HM_ROCK, HELD, fainted)?.open).toBe(false);
  });

  it("ungated tiles return null (no gate invented)", () => {
    expect(evaluateTileGate(TILE.PATH, HELD, partyWith(["ROCK_SMASH"]))).toBeNull();
    expect(evaluateTileGate(TILE.WALL, HELD, partyWith(["ROCK_SMASH"]))).toBeNull();
  });

  it("tile-gated proof on authored maps (verified against the real tiles)", () => {
    // NOTE, correction of record: the completeness audit claimed
    // Cave of Echoes authors HM_ROCK at (15,8) and (10,16). Checked
    // against the actual map: both cells are CAVE floor (8) — the
    // cave authors NO technique tiles. The maps that DO author hard
    // gates are route_1, dojo_1, binary_woods and scrap_junkyard;
    // the proof runs on those.
    const gateTilesOf = (mapId: string) => {
      const found: { tile: number; tech: string }[] = [];
      for (const row of FULL_WORLD[mapId].tiles ?? []) {
        for (const t of row) {
          const tech = techniqueForTile(t);
          if (tech && t !== TILE.WATER) found.push({ tile: t, tech: tech.name });
        }
      }
      return found;
    };
    // Map 1: route_1 — one smashable rock + one waterfall.
    const r1 = gateTilesOf("route_1");
    expect(r1.filter((g) => g.tech === "Boulder Break")).toHaveLength(1);
    expect(r1.filter((g) => g.tech === "Cascade")).toHaveLength(1);
    // Map 2: scrap_junkyard — rocks and cut trees in bulk.
    const jy = gateTilesOf("scrap_junkyard");
    expect(jy.filter((g) => g.tech === "Boulder Break").length).toBeGreaterThanOrEqual(10);
    expect(jy.filter((g) => g.tech === "Slice").length).toBeGreaterThanOrEqual(10);
    // Every authored hard-gate tile on those maps refuses without
    // the acquisition, and opens with held + performer.
    for (const mapId of ["route_1", "scrap_junkyard", "dojo_1", "binary_woods"]) {
      for (const g of gateTilesOf(mapId)) {
        expect(evaluateTileGate(g.tile, {}, [])?.open, `${mapId} tile ${g.tile}`).toBe(false);
      }
    }
    expect(evaluateTileGate(TILE.HM_ROCK, { "tech.boulder_break": true }, partyWith(["ROCK_SMASH"]))?.open).toBe(true);
    expect(evaluateTileGate(TILE.HM_CUT, { "tech.slice": true }, partyWith(["CUT"]))?.open).toBe(true);
    expect(evaluateTileGate(TILE.HM_WATERFALL, { "tech.cascade": true }, partyWith(["WATERFALL"]))?.open).toBe(true);
  });

  it("acquisition starts un-granted: the engine ships checks, not grants", () => {
    for (const t of FIELD_TECHNIQUES) {
      expect(evaluateTileGate(TILE.HM_ROCK, {}, partyWith(["ROCK_SMASH"]))?.open).toBe(false);
      expect(t.flag.startsWith("tech.")).toBe(true);
    }
  });
});
