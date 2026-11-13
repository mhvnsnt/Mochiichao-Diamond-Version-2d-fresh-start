// Regions 3-5 maps — Regions 3-5 skeleton tests (2026-11-13).
//
// Pins what the regions3-5-maps PR wires: every region3/4/5-dialogue.json
// mapKey resolves to a FULL_WORLD map (or to the region's plateau, which
// folds the Elite 1-4 / Champion / Hall keys per the R1 mainframe_plateau
// precedent), every exit/door target exists, every map has an entry and
// an exit, every gate names a recognised requirement (fail-closed), every
// town has heal + shop + sign + a non-battle NPC, no dead door, the wired
// battle NPCs match their trainer rows (species + levels + reward), the
// seven grounded wild pools exist in the core tables, and every referenced
// Ink knot resolves in the compiled region stories.
//
// What this does NOT pin (owed, see docs/regions3-5-maps-audit-20261113.md):
// dojo leader battles + badge awards (leaders are NAME GAP, dialogue-only;
// R5-012 names Hex as Dojo 1 leader against R5-04's NAME GAP — flagged for
// Mars), Elite / Champion battles, Front Recruit battles
// (R5-003/004), Battle Zone / Tournament / Frontier Brain battles, wild
// pools on the other routes, and the R5 tower climbers (no tower maps).
import { describe, it, expect } from "vitest";
import { FULL_WORLD } from "../src/world/FullWorldMaps";
import {
  TRAINERS_REGION_3,
  type TrainerTeam,
} from "../src/lib/trainers-region3";
import { TRAINERS_REGION_4 } from "../src/lib/trainers-region4";
import { TRAINERS_REGION_5 } from "../src/lib/trainers-region5";
import { tableFor } from "../src/lib/encounters";
import { createInkSession } from "../src/lib/inkStory";
import { isExitOpen, isDoorOpen } from "../src/lib/doorGate";
import { techniqueByName } from "../src/lib/fieldTechniques";
import region3Beats from "../src/lib/wiring/dialogue/region3-dialogue.json";
import region4Beats from "../src/lib/wiring/dialogue/region4-dialogue.json";
import region5Beats from "../src/lib/wiring/dialogue/region5-dialogue.json";

type AnyMap = Record<string, any>;
const M = (k: string): AnyMap => (FULL_WORLD as any)[k];
const r3Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r3_"));
const r4Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r4_"));
const r5Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r5_"));
const NEW_KEYS = [...r3Keys, ...r4Keys, ...r5Keys];

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
  "r3_root_hamlet",
  "r3_rustboro",
  "r3_dewford",
  "r3_mauville",
  "r3_lavaridge",
  "r3_petalburg",
  "r3_fortree",
  "r3_lilycove",
  "r3_mossdeep",
  "r3_crater_city",
  "r4_twinleaf",
  "r4_sandgem",
  "r4_jubilife",
  "r4_oreburgh",
  "r4_floaroma",
  "r4_eterna",
  "r4_hearthome",
  "r4_veilstone",
  "r4_pastoria",
  "r4_celestic",
  "r4_canalave",
  "r4_snowpoint",
  "r4_sunyshore",
  "r5_start_city",
  "r5_sandgem",
  "r5_jubilife",
  "r5_oreburgh",
  "r5_floaroma",
  "r5_eterna",
  "r5_hearthome",
  "r5_veilstone",
  "r5_pastoria",
  "r5_celestic",
  "r5_canalave",
  "r5_snowpoint",
  "r5_sunyshore",
];
const DOJOS = [
  "r3_dojo_1",
  "r3_dojo_2",
  "r3_dojo_3",
  "r3_dojo_4",
  "r3_dojo_5",
  "r3_dojo_6",
  "r3_dojo_7",
  "r3_dojo_8",
  "r4_dojo_1",
  "r4_dojo_2",
  "r4_dojo_3",
  "r4_dojo_4",
  "r4_dojo_5",
  "r4_dojo_6",
  "r4_dojo_7",
  "r4_dojo_8",
  "r5_dojo_1",
  "r5_dojo_2",
  "r5_dojo_3",
  "r5_dojo_4",
  "r5_dojo_5",
  "r5_dojo_6",
  "r5_dojo_7",
  "r5_dojo_8",
];
// Dialogue keys folded into each region's plateau (R1 mainframe_plateau
// precedent: one map, 5 battle slots, Hall of Records as a flag, not a map).
const FOLDED: Record<string, Set<string>> = {
  r3_plateau: new Set(["r3_elite_1", "r3_elite_2", "r3_elite_3", "r3_elite_4", "r3_champion", "r3_hall"]),
  r4_plateau: new Set(["r4_elite_1", "r4_elite_2", "r4_elite_3", "r4_elite_4", "r4_champion", "r4_hall"]),
  r5_plateau: new Set(["r5_elite_1", "r5_elite_2", "r5_elite_3", "r5_elite_4", "r5_champion", "r5_hall"]),
};
// One talk knot per dialogue entry (the _after knots are post-battle and
// trigger with the leader battles, which are owed — see the audit doc).
const ENTRY_KNOTS = [
  "r3_01_outpost_2f",
  "r3_02_oldale_road",
  "r3_03_rustboro",
  "r3_04_dewford",
  "r3_05_mauville",
  "r3_06_lavaridge",
  "r3_07_petalburg",
  "r3_08_fortree",
  "r3_09_crater_city",
  "r3_09a_lilycove",
  "r3_09b_mossdeep",
  "r3_10_awakening",
  "r3_11_victory_route",
  "r3_12_plateau",
  "r3_13_frontier_arenas",
  "r4_01_twinleaf",
  "r4_02_sandgem",
  "r4_03_jubilife",
  "r4_04_oreburgh",
  "r4_05_floaroma",
  "r4_06_eterna",
  "r4_07_hearthome",
  "r4_08_veilstone",
  "r4_09_pastoria",
  "r4_10_celestic",
  "r4_11_canalave",
  "r4_12_snowpoint",
  "r4_13_sunyshore",
  "r4_14_victory_route",
  "r4_15_plateau",
  "r4_16_battle_zone",
  "r5_01_start_city",
  "r5_02_sandgem",
  "r5_03_jubilife",
  "r5_04_oreburgh",
  "r5_05_floaroma",
  "r5_06_eterna",
  "r5_07_hearthome",
  "r5_08_veilstone",
  "r5_09_pastoria",
  "r5_10_celestic",
  "r5_11_canalave",
  "r5_12_snowpoint",
  "r5_13_sunyshore",
  "r5_14_victory_route",
  "r5_15_plateau",
  "r5_16_grand_tournament",
  "r5_17_mythar_final",
];
// Trainer rows wired as battle NPCs in this PR: 27 Region 3 + 26 Region 4
// + 24 Region 5 = 77 NPCs, of which 76 resolve to rows. R3-001 (Hex, lab
// battle) is the exception: the NPC is named "Hex", which never resolves,
// so its row is pinned separately below and NOT in this list.
const WIRED_ROWS = [
  "R3-002",
  "R3-003",
  "R3-004",
  "R3-005",
  "R3-006",
  "R3-007",
  "R3-010",
  "R3-011",
  "R3-012",
  "R3-013",
  "R3-014",
  "R3-015",
  "R3-017",
  "R3-018",
  "R3-020",
  "R3-021",
  "R3-023",
  "R3-024",
  "R3-026",
  "R3-027",
  "R3-029",
  "R3-030",
  "R3-032",
  "R3-033",
  "R3-035",
  "R3-036",
  "R4-001",
  "R4-002",
  "R4-003",
  "R4-004",
  "R4-005",
  "R4-006",
  "R4-007",
  "R4-008",
  "R4-009",
  "R4-010",
  "R4-015",
  "R4-016",
  "R4-018",
  "R4-019",
  "R4-021",
  "R4-022",
  "R4-024",
  "R4-025",
  "R4-027",
  "R4-028",
  "R4-030",
  "R4-031",
  "R4-033",
  "R4-034",
  "R4-036",
  "R4-037",
  "R5-001",
  "R5-002",
  "R5-005",
  "R5-006",
  "R5-007",
  "R5-008",
  "R5-009",
  "R5-010",
  "R5-011",
  "R5-013",
  "R5-014",
  "R5-016",
  "R5-017",
  "R5-019",
  "R5-020",
  "R5-022",
  "R5-023",
  "R5-025",
  "R5-026",
  "R5-028",
  "R5-029",
  "R5-031",
  "R5-032",
  "R5-047",
];
// Wild pools grounded in trainer-row species + levels (see the audit doc).
const GROUNDED_POOLS: Record<string, { method: "grass" | "surf"; species: string[] }> = {
  r3_oldale_road: { method: "grass", species: ["013", "019", "022", "038"] },
  r3_victory_route: { method: "grass", species: ["003", "006", "009", "012", "021", "028", "046"] },
  r4_floaroma: { method: "grass", species: ["035", "038", "041", "042"] },
  r4_route_1: { method: "grass", species: ["013", "019", "022", "041"] },
  r4_victory_route: { method: "grass", species: ["003", "006", "009", "012", "015", "021", "028", "046"] },
  r5_route_1: { method: "grass", species: ["013", "019", "022", "038"] },
  r5_victory_route: { method: "grass", species: ["002", "003", "006", "009", "012", "015", "021", "028", "043", "046"] },
};

describe("regions3-5 maps — Regions 3-5 skeleton", () => {
  it("126 Regions 3-5 maps exist in FULL_WORLD (41 + 44 + 41)", () => {
    expect(r3Keys.length).toBe(41);
    expect(r4Keys.length).toBe(44);
    expect(r5Keys.length).toBe(41);
    expect(NEW_KEYS.length).toBe(126);
    expect(M("r3_root_hamlet")).toBeDefined();
    expect(M("r4_twinleaf")).toBeDefined();
    expect(M("r5_start_city")).toBeDefined();
    expect(M("r5_mythar_final")).toBeDefined();
  });

  it("all 112 region3/4/5-dialogue.json mapKeys resolve (18 folded into the plateaus)", () => {
    const keys = new Set<string>();
    for (const beats of [region3Beats, region4Beats, region5Beats] as any[]) {
      for (const e of beats.entries) {
        for (const k of e.mapKeys as string[]) keys.add(k);
      }
    }
    expect(keys.size).toBe(112);
    for (const k of keys) {
      const region = k.slice(0, 2);
      if (FOLDED[`${region}_plateau`].has(k)) continue;
      expect(M(k), `dialogue mapKey ${k} has no map`).toBeDefined();
    }
    for (const p of ["r3_plateau", "r4_plateau", "r5_plateau"]) {
      expect(M(p)).toBeDefined();
    }
  });

  it("inter-region links: Frost Peak -> Root Hamlet outpost, Frontier -> Twinleaf, Rift -> Start City", () => {
    const frost = M("r2_frost_peak");
    expect(frost.exits.some((e: any) => e.to === "r3_outpost_2f")).toBe(true);
    expect(frost.exits.some((e: any) => e.to === "r2_plateau")).toBe(true);
    expect(M("r3_frontier_arenas").exits.some((e: any) => e.to === "r4_twinleaf")).toBe(true);
    expect(M("r4_rift_dungeon").exits.some((e: any) => e.to === "r5_start_city")).toBe(true);
  });

  it("every exit/door target in Regions 3-5 maps exists", () => {
    for (const k of [...NEW_KEYS, "r2_frost_peak"]) {
      for (const l of links((FULL_WORLD as any)[k])) {
        expect((FULL_WORLD as any)[l.to], `${k} -> ${l.to} is missing`).toBeDefined();
      }
    }
  });

  it("every Regions 3-5 map has an outbound link and an inbound link", () => {
    const inbound = new Map<string, number>();
    for (const k of Object.keys(FULL_WORLD)) {
      for (const l of links((FULL_WORLD as any)[k])) {
        inbound.set(l.to, (inbound.get(l.to) ?? 0) + 1);
      }
    }
    for (const k of NEW_KEYS) {
      expect(links(M(k)).length, `${k} has no way out`).toBeGreaterThan(0);
      expect(inbound.get(k) ?? 0, `${k} has no way in`).toBeGreaterThan(0);
    }
  });

  it("every gate names a recognised requirement, fail-closed", () => {
    for (const k of NEW_KEYS) {
      for (const l of links(M(k))) {
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

  it("victory gates are badges>=24 (R3), >=32 (R4), >=40 (R5)", () => {
    const cases: [string, string, string, number][] = [
      ["r3_awakening", "r3_victory_route", "badges>=24", 24],
      ["r4_sunyshore", "r4_victory_route", "badges>=32", 32],
      ["r5_sunyshore", "r5_victory_route", "badges>=40", 40],
    ];
    for (const [from, to, cond, need] of cases) {
      const exit = M(from).exits.find((e: any) => e.to === to);
      expect(exit, `${from} -> ${to}`).toBeDefined();
      expect(exit.condition).toBe(cond);
      const short = Array.from({ length: need - 1 }, (_, i) => `b${i}`);
      const full = [...short, `b${need - 1}`];
      expect(isExitOpen(exit, short, {})).toBe(false);
      expect(isExitOpen(exit, full, {})).toBe(true);
    }
  });

  it("sea-road exits are Wave-gated on both shores", () => {
    expect(techniqueByName("Wave")).not.toBeNull();
    for (const town of ["r3_dewford", "r3_mauville"]) {
      const gates = M(town).exits.filter((e: any) => e.to === "r3_sea_route");
      expect(gates.length, `${town} -> sea road`).toBeGreaterThan(0);
      for (const g of gates) expect(g.hmNeeded).toBe("Wave");
    }
  });

  it("every town has heal + shop + sign + a non-battle NPC", () => {
    const hasFlag = (mapKey: string, flag: string, seen = new Set<string>()): boolean => {
      if (seen.has(mapKey)) return false;
      seen.add(mapKey);
      const m = M(mapKey);
      if (!m) return false;
      if (allNpcs(m).some((n) => n[flag])) return true;
      return links(m).some((l) => l.kind === "door" && hasFlag(l.to, flag, seen));
    };
    for (const t of TOWNS) {
      const m = M(t);
      expect(hasFlag(t, "isHeal"), `${t} has no heal`).toBe(true);
      expect(hasFlag(t, "isShop"), `${t} has no shop`).toBe(true);
      expect((m.signs ?? []).length, `${t} has no sign`).toBeGreaterThan(0);
      expect(allNpcs(m).some((n) => !n.battle), `${t} has no non-battle NPC`).toBe(true);
    }
  });

  it("no dead door: every door's target has a way back to the source map", () => {
    for (const k of NEW_KEYS) {
      for (const d of M(k).doors ?? []) {
        const back = links(M(d.to)).some((l) => l.to === k);
        expect(back, `door ${k} -> ${d.to} has no way back`).toBe(true);
      }
    }
  });

  it("dojos: 2 wired acolytes + dialogue-only leader each (badge award owed)", () => {
    for (const d of DOJOS) {
      const npcs = allNpcs(M(d));
      const fighters = npcs.filter((n) => n.battle);
      expect(fighters.length, `${d} acolytes`).toBe(2);
      const leader = npcs.find((n) => n.name === "Dojo Leader");
      expect(leader, `${d} leader`).toBeDefined();
      expect(leader.battle, `${d} leader must stay dialogue-only until named`).toBeUndefined();
    }
  });

  it("76 wired battle NPCs match their trainer rows (species + levels + reward)", () => {
    const rows: TrainerTeam[] = [
      ...(TRAINERS_REGION_3 as TrainerTeam[]),
      ...(TRAINERS_REGION_4 as TrainerTeam[]),
      ...(TRAINERS_REGION_5 as TrainerTeam[]),
    ];
    // Duplicate display names exist across regions (Acolyte Pup, Acolyte
    // Frost, Acolyte Wire, Acolyte Gale), so the row match is by
    // name + team + reward, not by name alone.
    const rowFor = (name: string, team: any[], reward: number): TrainerTeam | undefined => {
      const cands = rows.filter(
        (r) => (r.name ? `${r.trainerClass} ${r.name}` : r.trainerClass) === name,
      );
      return cands.find(
        (r) =>
          JSON.stringify(r.team.map((s) => `${s.speciesId}@${s.level}`)) ===
            JSON.stringify(team.map((m: any) => `${m.id}@${m.level}`)) &&
          r.reward === reward,
      );
    };
    const seen = new Set<string>();
    for (const k of NEW_KEYS) {
      for (const n of allNpcs(M(k))) {
        if (!n.battle) continue;
        if (n.name === "Hex") continue; // R3-001, pinned separately below
        const row = rowFor(n.name, n.battle.team, n.battle.reward);
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

  it("Hex lab battle mirrors row R3-001 exactly (name never resolves)", () => {
    const lab = M("r3_lab");
    const hex = allNpcs(lab).find((n) => n.name === "Hex");
    expect(hex).toBeDefined();
    expect(hex.battle).toBeDefined();
    const row = (TRAINERS_REGION_3 as TrainerTeam[]).find((r) => r.id === "R3-001")!;
    expect(hex.battle.team.map((m: any) => `${m.id}@${m.level}`)).toEqual(
      row.team.map((s) => `${s.speciesId}@${s.level}`),
    );
    expect(hex.battle.reward).toBe(row.reward);
  });

  it("grounded wild pools exist in the core tables with the row species", () => {
    for (const [mapId, want] of Object.entries(GROUNDED_POOLS)) {
      const t = tableFor(mapId, want.method);
      expect(t, `${mapId} ${want.method} table`).not.toBeNull();
      expect(t!.slots.map((s) => s.speciesId).sort()).toEqual([...want.species].sort());
    }
  });

  it("every referenced Ink knot resolves in its region story", () => {
    const referenced = new Set<string>();
    for (const k of NEW_KEYS) {
      const story = `region${k[1]}-story`;
      for (const n of allNpcs(M(k))) {
        if (!n.inkStory) continue;
        expect(n.inkStory, `${k} NPC ${n.id}`).toBe(story);
        referenced.add(`${story}:${n.inkKnot}`);
        expect(
          createInkSession(story, n.inkKnot),
          `${k} NPC ${n.id} knot ${n.inkKnot}`,
        ).not.toBeNull();
      }
    }
    for (const knot of ENTRY_KNOTS) {
      const story = `region${knot[1]}-story`;
      expect(referenced.has(`${story}:${knot}`), `entry knot ${knot} is referenced by no NPC`).toBe(true);
    }
  });

  it("plateaus fold the Elite / Champion / Hall keys and hold 5 dialogue-only slots each", () => {
    for (const p of ["r3_plateau", "r4_plateau", "r5_plateau"]) {
      const npcs = allNpcs(M(p));
      expect(npcs.filter((n) => n.name.startsWith("Elite ")).length, p).toBe(4);
      expect(npcs.some((n) => n.name === "Champion"), p).toBe(true);
      expect(npcs.filter((n) => n.battle).length, p).toBe(0);
      expect(M(p).signs.some((s: any) => s.text.includes("HALL OF RECORDS")), p).toBe(true);
    }
  });

  it("Grand Tournament: 6 dialogue-only challengers + Hex (dialogue-only)", () => {
    const npcs = allNpcs(M("r5_grand_tournament"));
    const challengers = npcs.filter((n) => n.name === "Tournament Challenger");
    expect(challengers.length).toBe(6);
    expect(challengers.filter((n) => n.battle).length).toBe(0);
    const hex = npcs.find((n) => n.name === "Hex");
    expect(hex).toBeDefined();
    expect(hex.battle).toBeUndefined();
    expect(hex.dialog[0]).toContain("I am here too.");
  });

  it("Mythar final: attendant + Aeon + Grand Champion Mythar battle (row R5-047)", () => {
    const npcs = allNpcs(M("r5_mythar_final"));
    expect(npcs.length).toBe(3);
    expect(npcs.some((n) => n.name === "Plateau Attendant")).toBe(true);
    expect(npcs.some((n) => n.name === "Prof. Aeon")).toBe(true);
    const mythar = npcs.find((n) => n.name === "Grand Champion Mythar");
    expect(mythar).toBeDefined();
    expect(mythar!.battle).toBeDefined();
    expect(mythar!.battle.team.map((m: any) => `${m.id}@${m.level}`)).toEqual([
      "331@100",
      "003@100",
      "046@100",
      "043@100",
      "028@100",
      "021@100",
    ]);
    expect(mythar!.battle.reward).toBe(20000);
    expect(mythar!.inkKnot).toBe("r5_17_mythar_final");
    expect(mythar!.dialog[0]).toContain("I am not a region champion");
    expect(npcs.some((n) => n.name === "Mythar")).toBe(false);
  });
});
