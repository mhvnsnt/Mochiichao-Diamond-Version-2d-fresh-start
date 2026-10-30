// Battle background resolver — coverage law tests.
//
// The point of this suite: a battle background can never silently
// degrade to a generic scene. Every map that exists in FULL_WORLD has
// a hand-authored expectation below (written from what the place IS,
// independently of the binding file), every binding must point at a
// real scene, tile overrides must beat map bindings (the HGSS
// standing-tile rule), caves must force night (the HGSS forceNite
// rule), and the ONLY way to reach the route fallback is a context
// nothing classifies — where the result carries fallback: true in
// the open.

import { describe, it, expect } from "vitest";
import {
  resolveBattleScene,
  phaseFromLegacyPhase,
  asBattlePhase,
  getBattleSceneDef,
  sceneGeometry,
  BATTLE_SCENE_IDS,
  MAP_BATTLE_BG,
} from "./battleBackground";
import { FULL_WORLD } from "../world/FullWorldMaps";
import { TILE } from "../world/WorldConstants";

// What each place IS → the scene its battles must show. Written from
// the map names/roles, not copied from map-battle-bg.json: if the two
// ever disagree, this test is the alarm.
const GOLDEN: Record<string, string> = {
  sector0: "town", // Boot Harbor
  aeon_lab: "interior",
  route_1: "route",
  mochiiplex_1: "interior",
  binary_fields: "route",
  dojo_1: "dojo",
  binary_woods: "route", // the extended-grade forest; Refusal is its own system
  cave_of_echoes: "cave",
  neon_city: "town",
  scrap_junkyard: "route",
  coral_approach: "water",
  castagnoli_island: "water",
  mauveville_arena: "interior",
  boot_bay: "water",
  luigi_mansion: "interior",
  dojo_2: "dojo",
  sector0_truck: "interior",
  sector0_house_1f: "interior",
  sector0_house_2f: "interior",
  sector0_rival_house: "interior",
  route_2: "route",
  stoneport_city: "town",
  dojo_3: "dojo",
  route_3: "route",
  signal_tunnel: "cave",
  pale_town: "town",
  market_city: "town",
  dojo_4: "dojo",
  central_city: "town",
  dojo_5: "dojo",
  harbor_city: "town",
  dojo_6: "dojo",
  ember_island: "water",
  dojo_7: "dojo",
  dojo_8: "dojo",
  victory_route: "route",
  mainframe_plateau: "route",
  data_isle_1: "water",
  data_isle_2: "water",
  data_isle_3: "water",
  data_isle_4: "water",
  data_isle_5: "water",
  data_isle_6: "water",
  data_isle_7: "water",
  region2_arrival: "town",
  garden: "garden", // GardenView context id, bound deliberately
};

const PALETTE_KEYS = ["sky", "farBand", "mid", "ground", "groundShade", "platform", "platformRim", "accent"];
const MOTIFS = ["trees", "buildings", "waves", "crystals", "panels", "banners", "hedge"];

describe("scene data integrity", () => {
  it("every scene authors complete day + nite palettes", () => {
    for (const id of BATTLE_SCENE_IDS) {
      const def = getBattleSceneDef(id)!;
      expect(def, id).toBeTruthy();
      expect(MOTIFS).toContain(def.motif);
      for (const base of ["day", "nite"] as const) {
        for (const key of PALETTE_KEYS) {
          const v = (def[base] as unknown as Record<string, string>)[key];
          expect(v, `${id}.${base}.${key}`).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      }
    }
  });

  it("covers the six required scene classes", () => {
    for (const id of ["route", "town", "water", "cave", "interior", "dojo", "garden"]) {
      expect(BATTLE_SCENE_IDS).toContain(id);
    }
  });

  it("every binding points at a real scene", () => {
    for (const [mapId, sceneId] of Object.entries(MAP_BATTLE_BG)) {
      expect(BATTLE_SCENE_IDS, `${mapId} -> ${sceneId}`).toContain(sceneId);
    }
  });
});

describe("map coverage — no silent generic scene for any real place", () => {
  it("every FULL_WORLD map is bound, and only real maps (+ garden) are bound", () => {
    for (const mapId of Object.keys(FULL_WORLD)) {
      expect(MAP_BATTLE_BG[mapId], `unbound map: ${mapId}`).toBeTruthy();
    }
    for (const mapId of Object.keys(MAP_BATTLE_BG)) {
      expect(mapId === "garden" || mapId in FULL_WORLD, `binding for unknown map: ${mapId}`).toBe(true);
    }
  });

  it("every map resolves to its golden scene without the fallback", () => {
    for (const [mapId, sceneId] of Object.entries(GOLDEN)) {
      const r = resolveBattleScene({ mapId });
      expect(r.sceneId, mapId).toBe(sceneId);
      expect(r.fallback, mapId).toBe(false);
      expect(r.via, mapId).toBe("map-binding");
    }
  });
});

describe("HGSS rules", () => {
  it("standing tile beats the map binding (water tile in town = water scene)", () => {
    const r = resolveBattleScene({ mapId: "sector0", standingTile: TILE.WATER });
    expect(r.sceneId).toBe("water");
    expect(r.via).toBe("tile");
    const g = resolveBattleScene({ mapId: "sector0", standingTile: TILE.TALL_GRASS });
    expect(g.sceneId).toBe("route");
    expect(g.via).toBe("tile");
  });

  it("cave forces night whatever the clock says (forceNite)", () => {
    for (const phase of ["day", "morn", "eve"] as const) {
      const r = resolveBattleScene({ mapId: "cave_of_echoes", phase });
      expect(r.phaseUsed).toBe("nite");
      expect(r.forcedNite).toBe(true);
      expect(r.tint).toBeNull();
      expect(r.palette.sky).toBe(getBattleSceneDef("cave")!.nite.sky);
    }
    const byTile = resolveBattleScene({ mapId: "route_1", standingTile: TILE.CAVE, phase: "day" });
    expect(byTile.sceneId).toBe("cave");
    expect(byTile.phaseUsed).toBe("nite");
  });

  it("interior flag classifies an unbound interior", () => {
    const r = resolveBattleScene({ mapId: "some_future_house", interior: true });
    expect(r.sceneId).toBe("interior");
    expect(r.via).toBe("interior-flag");
    expect(r.fallback).toBe(false);
  });

  it("the fallback is loud: only an unclassifiable context reaches it, flagged", () => {
    const r = resolveBattleScene({ mapId: "no_such_map" });
    expect(r.sceneId).toBe("route");
    expect(r.fallback).toBe(true);
    expect(r.via).toBe("fallback");
    expect(resolveBattleScene({}).fallback).toBe(true);
  });
});

describe("phase variants", () => {
  it("day uses the day palette, nite and late the nite palette", () => {
    const def = getBattleSceneDef("route")!;
    expect(resolveBattleScene({ mapId: "route_1", phase: "day" }).palette).toEqual(def.day);
    expect(resolveBattleScene({ mapId: "route_1", phase: "nite" }).palette).toEqual(def.nite);
    expect(resolveBattleScene({ mapId: "route_1", phase: "late" }).palette).toEqual(def.nite);
  });

  it("morn/eve ride the day palette under the clock tint", () => {
    const def = getBattleSceneDef("route")!;
    const morn = resolveBattleScene({ mapId: "route_1", phase: "morn" });
    expect(morn.palette).toEqual(def.day);
    expect(morn.tint).toEqual({ color: "#ffa050", alpha: 0.14 });
    const eve = resolveBattleScene({ mapId: "route_1", phase: "eve" });
    expect(eve.palette).toEqual(def.day);
    expect(eve.tint).toEqual({ color: "#b45028", alpha: 0.18 });
    expect(resolveBattleScene({ mapId: "route_1", phase: "day" }).tint).toBeNull();
    expect(resolveBattleScene({ mapId: "route_1", phase: "nite" }).tint).toBeNull();
  });

  it("absent phase is the honest day default", () => {
    const r = resolveBattleScene({ mapId: "route_1" });
    expect(r.phaseUsed).toBe("day");
  });

  it("legacy phase adapter maps the running engine's table", () => {
    expect(phaseFromLegacyPhase("dawn")).toBe("morn");
    expect(phaseFromLegacyPhase("day")).toBe("day");
    expect(phaseFromLegacyPhase("dusk")).toBe("eve");
    expect(phaseFromLegacyPhase("night")).toBe("nite");
    expect(phaseFromLegacyPhase(undefined)).toBe("day");
    expect(phaseFromLegacyPhase("morn")).toBe("morn");
    expect(asBattlePhase("garbage")).toBe("day");
  });
});

describe("geometry", () => {
  it("every scene draws layered shapes and two platforms, enemy far right", () => {
    for (const sceneId of BATTLE_SCENE_IDS) {
      const r = resolveBattleScene({ mapId: Object.keys(MAP_BATTLE_BG).find((k) => MAP_BATTLE_BG[k] === sceneId) });
      const geo = sceneGeometry(r);
      expect(geo.shapes.length, sceneId).toBeGreaterThan(5);
      expect(geo.platforms.enemy.cx!, sceneId).toBeGreaterThan(geo.platforms.player.cx!);
      expect(geo.platforms.player.cy!, sceneId).toBeGreaterThan(geo.platforms.enemy.cy!);
    }
  });

  it("tint passes through to geometry for tinted phases only", () => {
    const eve = sceneGeometry(resolveBattleScene({ mapId: "route_1", phase: "eve" }));
    expect(eve.tint).toEqual({ color: "#b45028", alpha: 0.18 });
    const day = sceneGeometry(resolveBattleScene({ mapId: "route_1", phase: "day" }));
    expect(day.tint).toBeNull();
  });
});
