// Regions 2-5 maps — Region 2 skeleton tests (2026-11-13).
//
// Pins what the regions2-5-maps PR wires: every region2-dialogue.json
// mapKey resolves to a FULL_WORLD map (or to r2_plateau, which folds the
// Elite 1-4 / Champion / Hall keys per the R1 mainframe_plateau precedent),
// every exit/door target exists, every map has an entry and an exit,
// every gate names a recognised requirement (fail-closed), every town has
// heal + shop + sign + a non-battle NPC, no dead door, the wired battle
// NPCs match their trainer rows (species + levels + reward), the five
// grounded wild pools exist in the core tables, and every referenced Ink
// knot resolves in the compiled region2-story.
//
// What this does NOT pin (owed, see docs/regions2-5-maps-audit-20261113.md):
// dojo leader battles + badge awards (leaders are NAME GAP, dialogue-only),
// Elite / Champion / First Champion battles, wild pools on routes 3-9 and
// the sea road (no trainer-row species for those stretches), and Regions
// 3-5 maps (0/111 dialogue keys wired yet).
import { describe, it, expect } from "vitest";
import { FULL_WORLD } from "../src/world/FullWorldMaps";
import { TRAINERS_REGION_2, type TrainerTeam } from "../src/lib/trainers-region2";
import { tableFor } from "../src/lib/encounters";
import { createInkSession } from "../src/lib/inkStory";
import { isExitOpen, isDoorOpen } from "../src/lib/doorGate";
import { techniqueByName } from "../src/lib/fieldTechniques";
import region2Beats from "../src/lib/wiring/dialogue/region2-dialogue.json";

type AnyMap = Record<string, any>;
const R2 = (k: string): AnyMap => (FULL_WORLD as any)[k];
const r2Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r2_"));

/** All exits + doors of a map, tagged with their kind. */
function links(m: AnyMap): Array<{ kind: string; to: string; condition?: string; hmNeeded?: string }> {
  const out: Array<{ kind: string; to: string; condition?: string; hmNeeded?: string }> = [];
  for (const e of m.exits ?? []) out.push({ kind: "exit", to: e.to, condition: e.condition, hmNeeded: e.hmNeeded });
  for (const d of m.doors ?? []) out.push({ kind: "door", to: d.to, condition: d.condition, hmNeeded: d.hmNeeded });
  return out;
}

function allNpcs(m: AnyMap): any[] {
  return [...(m.npcs ?? []), ...(m.events ?? []).map((e: any) => e.npc).filter(Boolean)];
}

const TOWNS = [
  "r2_dawnfield", "r2_cherryport", "r2_violet", "r2_azalea", "r2_goldenrod",
  "r2_ecruteak", "r2_olivine", "r2_cianwood", "r2_mahogany", "r2_blackthorn",
];
const DOJOS = [
  "r2_dojo_1", "r2_dojo_2", "r2_dojo_3", "r2_dojo_4",
  "r2_dojo_5", "r2_dojo_6", "r2_dojo_7", "r2_dojo_8",
];
// Dialogue keys folded into r2_plateau (R1 mainframe_plateau precedent:
// one map, 5 battle slots, Hall of Records as a flag, not a map).
const FOLDED = new Set([
  "r2_elite_1", "r2_elite_2", "r2_elite_3", "r2_elite_4", "r2_champion", "r2_hall",
]);
// One talk knot per dialogue entry (the _after knots are post-battle and
// trigger with the leader battles, which are owed — see the audit doc).
const ENTRY_KNOTS = [
  "r2_01_dawnfield", "r2_02_cherryport", "r2_03_violet", "r2_04_azalea",
  "r2_05_ilex_forest", "r2_06_goldenrod", "r2_07_ecruteak", "r2_08_olivine",
  "r2_09_cianwood", "r2_10_mahogany", "r2_11_blackthorn", "r2_12_victory_route",
  "r2_13_plateau", "r2_14_frost_peak",
];
// Trainer rows wired as battle NPCs in this PR: 15 route/area trainers +
// 16 dojo acolytes. Leaders (R2-018/021/024/027/030/033/036/039), Elite
// (R2-040..043), Champion (R2-044), rematches (R2-045..052) and the First
// Champion (R2-053) are NAME GAP and stay dialogue-only.
const WIRED_ROWS = [
  "R2-001", "R2-002", "R2-003", "R2-004", "R2-005", "R2-006", "R2-007",
  "R2-008", "R2-009", "R2-010", "R2-011", "R2-012", "R2-013", "R2-014",
  "R2-015", "R2-016", "R2-017", "R2-019", "R2-020", "R2-022", "R2-023",
  "R2-025", "R2-026", "R2-028", "R2-029", "R2-031", "R2-032", "R2-034",
  "R2-035", "R2-037", "R2-038",
];
// Wild pools grounded in trainer-row species + levels (see the audit doc).
const GROUNDED_POOLS: Record<string, { method: "grass" | "surf"; species: string[] }> = {
  r2_route_1: { method: "grass", species: ["147", "150", "016"] },
  r2_route_2: { method: "grass", species: ["041", "147", "019", "150"] },
  r2_ilex_forest: { method: "grass", species: ["017", "041", "042", "018"] },
  r2_lake: { method: "surf", species: ["028", "024"] },
  r2_victory_route: { method: "grass", species: ["009", "015", "021", "046", "003", "034", "012", "028"] },
};

describe("regions2-5 maps — Region 2 skeleton", () => {
  it("43 Region 2 maps exist in FULL_WORLD", () => {
    expect(r2Keys.length).toBe(43);
    expect(R2("r2_dawnfield")).toBeDefined();
    expect(R2("r2_frost_peak")).toBeDefined();
  });

  it("all 38 region2-dialogue.json mapKeys resolve (6 folded into r2_plateau)", () => {
    const keys = new Set<string>();
    for (const e of (region2Beats as any).entries) {
      for (const k of e.mapKeys as string[]) keys.add(k);
    }
    expect(keys.size).toBe(38);
    for (const k of keys) {
      if (FOLDED.has(k)) continue;
      expect(R2(k), `dialogue mapKey ${k} has no map`).toBeDefined();
    }
    expect(R2("r2_plateau")).toBeDefined();
  });

  it("region2_arrival now exits north to Dawnfield (and still back to Data Isle 7)", () => {
    const arrival = (FULL_WORLD as any).region2_arrival;
    expect(arrival.exits.some((e: any) => e.to === "r2_dawnfield")).toBe(true);
    expect(arrival.exits.some((e: any) => e.to === "data_isle_7")).toBe(true);
  });

  it("every exit/door target in Region 2 maps exists", () => {
    for (const k of [...r2Keys, "region2_arrival"]) {
      for (const l of links((FULL_WORLD as any)[k])) {
        expect((FULL_WORLD as any)[l.to], `${k} -> ${l.to} is missing`).toBeDefined();
      }
    }
  });

  it("every Region 2 map has an outbound link and an inbound link", () => {
    const inbound = new Map<string, number>();
    for (const k of Object.keys(FULL_WORLD)) {
      for (const l of links((FULL_WORLD as any)[k])) {
        inbound.set(l.to, (inbound.get(l.to) ?? 0) + 1);
      }
    }
    for (const k of r2Keys) {
      expect(links(R2(k)).length, `${k} has no way out`).toBeGreaterThan(0);
      expect(inbound.get(k) ?? 0, `${k} has no way in`).toBeGreaterThan(0);
    }
  });

  it("every gate names a recognised requirement, fail-closed", () => {
    for (const k of r2Keys) {
      for (const l of links(R2(k))) {
        if (l.condition) {
          expect(l.condition, `${k} gate ${l.condition}`).toMatch(/^badges>=\d+$/);
          expect(isDoorOpen(l.condition, [])).toBe(false);
        }
        if (l.hmNeeded) {
          expect(techniqueByName(l.hmNeeded), `${k} hmNeeded ${l.hmNeeded}`).not.toBeNull();
          expect(isExitOpen({ to: l.to, hmNeeded: l.hmNeeded }, [], {})).toBe(false);
        }
      }
    }
  });

  it("Victory Route gate is badges>=16 (8 Region 1 + 8 Region 2)", () => {
    const exit = R2("r2_blackthorn").exits.find((e: any) => e.to === "r2_victory_route");
    expect(exit).toBeDefined();
    expect(exit.condition).toBe("badges>=16");
    const fifteen = Array.from({ length: 15 }, (_, i) => `b${i}`);
    const sixteen = [...fifteen, "b15"];
    expect(isExitOpen(exit, fifteen, {})).toBe(false);
    expect(isExitOpen(exit, sixteen, {})).toBe(true);
  });

  it("sea-road exits are Wave-gated on both shores", () => {
    expect(techniqueByName("Wave")).not.toBeNull();
    for (const town of ["r2_olivine", "r2_cianwood"]) {
      const gates = R2(town).exits.filter((e: any) => e.to === "r2_sea_road");
      expect(gates.length, `${town} -> sea road`).toBeGreaterThan(0);
      for (const g of gates) expect(g.hmNeeded).toBe("Wave");
    }
  });

  it("every town has heal + shop + sign + a non-battle NPC", () => {
    const hasFlag = (mapKey: string, flag: string, seen = new Set<string>()): boolean => {
      if (seen.has(mapKey)) return false;
      seen.add(mapKey);
      const m = R2(mapKey);
      if (!m) return false;
      if (allNpcs(m).some((n) => n[flag])) return true;
      return links(m).some((l) => l.kind === "door" && hasFlag(l.to, flag, seen));
    };
    for (const t of TOWNS) {
      const m = R2(t);
      expect(hasFlag(t, "isHeal"), `${t} has no heal`).toBe(true);
      expect(hasFlag(t, "isShop"), `${t} has no shop`).toBe(true);
      expect((m.signs ?? []).length, `${t} has no sign`).toBeGreaterThan(0);
      expect(allNpcs(m).some((n) => !n.battle), `${t} has no non-battle NPC`).toBe(true);
    }
  });

  it("no dead door: every door's target has a way back to the source map", () => {
    for (const k of r2Keys) {
      for (const d of R2(k).doors ?? []) {
        const back = links(R2(d.to)).some((l) => l.to === k);
        expect(back, `door ${k} -> ${d.to} has no way back`).toBe(true);
      }
    }
  });

  it("dojos: 2 wired acolytes + dialogue-only leader each (badge award owed)", () => {
    for (const d of DOJOS) {
      const npcs = allNpcs(R2(d));
      const fighters = npcs.filter((n) => n.battle);
      expect(fighters.length, `${d} acolytes`).toBe(2);
      const leader = npcs.find((n) => n.name === "Dojo Leader");
      expect(leader, `${d} leader`).toBeDefined();
      expect(leader.battle, `${d} leader must stay dialogue-only until named`).toBeUndefined();
    }
  });

  it("31 wired battle NPCs match their trainer rows (species + levels + reward)", () => {
    const byDisplay = new Map<string, TrainerTeam>(
      TRAINERS_REGION_2.map((r) => [`${r.trainerClass} ${r.name}`, r] as [string, TrainerTeam]),
    );
    const seen = new Set<string>();
    for (const k of r2Keys) {
      for (const n of allNpcs(R2(k))) {
        if (!n.battle) continue;
        const row = byDisplay.get(n.name);
        expect(row, `${k} NPC ${n.name} has no trainer row`).toBeDefined();
        seen.add(row!.id);
        const inline = n.battle.team.map((m: any) => `${m.id}@${m.level}`);
        const expected = row!.team.map((s) => `${s.speciesId}@${s.level}`);
        expect(inline, `${n.name} inline team`).toEqual(expected);
        expect(n.battle.reward, `${n.name} reward`).toBe(row!.reward);
      }
    }
    expect([...seen].sort()).toEqual([...WIRED_ROWS].sort());
  });

  it("grounded wild pools exist in the core tables with the row species", () => {
    for (const [mapId, want] of Object.entries(GROUNDED_POOLS)) {
      const t = tableFor(mapId, want.method);
      expect(t, `${mapId} ${want.method} table`).not.toBeNull();
      expect(t!.slots.map((s) => s.speciesId).sort()).toEqual([...want.species].sort());
    }
  });

  it("every referenced Ink knot resolves in region2-story", () => {
    const referenced = new Set<string>();
    for (const k of r2Keys) {
      for (const n of allNpcs(R2(k))) {
        if (!n.inkStory) continue;
        expect(n.inkStory).toBe("region2-story");
        referenced.add(n.inkKnot);
        expect(
          createInkSession("region2-story", n.inkKnot),
          `${k} NPC ${n.id} knot ${n.inkKnot}`,
        ).not.toBeNull();
      }
    }
    for (const knot of ENTRY_KNOTS) {
      expect(referenced.has(knot), `entry knot ${knot} is referenced by no NPC`).toBe(true);
    }
  });

  it("plateau folds the Elite / Champion / Hall keys and holds 5 dialogue-only slots", () => {
    const npcs = allNpcs(R2("r2_plateau"));
    expect(npcs.filter((n) => n.name.startsWith("Elite ")).length).toBe(4);
    expect(npcs.some((n) => n.name === "Champion")).toBe(true);
    expect(npcs.filter((n) => n.battle).length).toBe(0);
    expect(R2("r2_plateau").signs.some((s: any) => s.text.includes("HALL OF RECORDS"))).toBe(true);
  });
});
