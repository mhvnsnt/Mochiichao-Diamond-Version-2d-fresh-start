// Sound coverage guards (sound-full-coverage lane, 2026-10-29).
//
// The "never made-and-left-unwired again" machinery. Four guards:
// (a) every registered cue has at least one real playCue call site
//     somewhere in src outside the registry and the tests — a cue
//     that exists but is never called fails the build;
// (b) every FULL_WORLD map resolves to a track or an authored
//     SILENCE row — never null, never undefined, never INHERIT
//     (silence in play comes from SCORE-STATE ABSENCE, and even
//     that resolution must be the explicit SILENCE constant's
//     value, not an accident);
// (c) every battle outcome path carries its music/jingle wiring:
//     wild win, trainer win, dojo win, loss (no jingle — asserted
//     as a deliberate absence in the record, but the defeat path
//     must still exist in the host), flee, capture — checked as
//     markers in the two battle hosts;
// (d) every UNIQUE_CUES sound is called only from its allowed
//     files — a bound (sacred) sound reused by a second function
//     fails the build.
//
// File scanning follows soundCues.test.ts's pattern (read the real
// sources; a deleted call site fails here, not silently in game).

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join, relative } from "node:path";
import { CUE_IDS, UNIQUE_CUES, type CueId } from "./soundCues";
import { MAP_PLACEMENT, resolveMusic, SILENCE, INHERIT } from "./musicPlacement";
import { FULL_WORLD } from "../world/FullWorldMaps";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "..");

function allSourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) allSourceFiles(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = allSourceFiles(srcRoot).filter(
  (p) => !p.endsWith("lib/soundCues.ts"),
);
const contents = new Map<string, string>(
  files.map((p) => [relative(srcRoot, p).split("\\").join("/"), readFileSync(p, "utf8")]),
);

function callSites(id: CueId): string[] {
  const needle = `playCue('${id}')`;
  const hits: string[] = [];
  for (const [rel, text] of contents) {
    let i = text.indexOf(needle);
    while (i !== -1) {
      hits.push(rel);
      i = text.indexOf(needle, i + 1);
    }
  }
  return hits;
}

describe("(a) no registered cue is left unwired", () => {
  it("every cue id has at least one playCue call site", () => {
    for (const id of CUE_IDS) {
      expect(callSites(id).length, `cue '${id}' has ZERO call sites — made but unwired`).toBeGreaterThan(0);
    }
  });
});

describe("(b) every map resolves to music or authored silence", () => {
  it("no map resolution is null/undefined/INHERIT", () => {
    for (const key of Object.keys(FULL_WORLD)) {
      expect(MAP_PLACEMENT[key], `map ${key} has no placement row`).toBeDefined();
      const p = resolveMusic({ screen: "overworld", mapId: key, battleKind: null });
      expect(p, `map ${key} resolved to INHERIT`).not.toBe(INHERIT);
      expect(typeof p).toBe("string");
      expect((p as string).length).toBeGreaterThan(0);
    }
  });
  it("ABSENCE resolves to the explicit SILENCE value, battles included", () => {
    expect(resolveMusic({ screen: "battle", mapId: "route_1", battleKind: "wild", scoreState: "ABSENCE" })).toBe(SILENCE);
    expect(resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null, scoreState: "ABSENCE" })).toBe(SILENCE);
  });
  it("night phase swaps only the classes that have night arrangements", () => {
    expect(resolveMusic({ screen: "overworld", mapId: "sector0", battleKind: null, phase: "night" })).toBe("townNight");
    expect(resolveMusic({ screen: "overworld", mapId: "binary_fields", battleKind: null, phase: "night" })).toBe("town2Night");
    expect(resolveMusic({ screen: "overworld", mapId: "route_1", battleKind: null, phase: "night" })).toBe("routeNight");
    expect(resolveMusic({ screen: "overworld", mapId: "cave_of_echoes", battleKind: null, phase: "night" })).toBe("cave");
    expect(resolveMusic({ screen: "overworld", mapId: "sector0", battleKind: null, phase: "day" })).toBe("town");
  });
});

describe("(c) every battle outcome path carries its sound wiring", () => {
  const we = contents.get("world/WorldEngine.tsx") ?? "";
  const bv = contents.get("components/views/BattleView.tsx") ?? "";
  it("both hosts exist in the scan", () => {
    expect(we.length).toBeGreaterThan(0);
    expect(bv.length).toBeGreaterThan(0);
  });
  it("wild win: victory jingle fires in both hosts", () => {
    expect(we).toContain("playVictoryJingle('wild')");
    expect(bv).toContain("playVictoryJingle('wild')");
  });
  it("trainer + dojo win: trainer jingle and badge voice in WorldEngine", () => {
    expect(we).toContain("playVictoryJingle('trainer')");
    expect(we).toContain("playCue('ritual.badge')");
  });
  it("dojo battles resolve to the dojo battle track", () => {
    expect(resolveMusic({ screen: "battle", mapId: "dojo_1", battleKind: "dojo" })).toBe("dojoBattle");
    expect(we).toContain('"dojo"');
  });
  it("loss path exists in both hosts (deliberately no jingle)", () => {
    expect(we).toContain("blacked out");
    expect(bv).toContain("blacked out");
  });
  it("flee and capture paths keep their cues in both hosts", () => {
    for (const host of [we, bv]) {
      expect(host).toContain("playCue('battle.flee')");
      expect(host).toContain("playCue('capture.success')");
      expect(host).toContain("playCue('capture.fail')");
    }
  });
  it("shop and garden views carry their own placement", () => {
    expect(contents.get("components/views/ShopView.tsx") ?? "").toContain("screen: 'shop'");
    expect(contents.get("components/views/GardenView.tsx") ?? "").toContain("screen: 'garden'");
    expect(resolveMusic({ screen: "shop", mapId: "", battleKind: null })).toBe("shop");
    // Sound-exceptions lane: the Garden resolves to its OWN track
    // (COVERAGE slot 21 closure) — not the town class it rode on.
    expect(resolveMusic({ screen: "garden", mapId: "", battleKind: null })).toBe("garden");
  });
});

describe("(d) bound (sacred) sounds are never reused by a second function", () => {
  it("every UNIQUE_CUES entry is called only from its allowed files", () => {
    for (const [id, binding] of Object.entries(UNIQUE_CUES)) {
      if (!binding) continue;
      const sites = new Set(callSites(id as CueId));
      for (const site of sites) {
        expect(
          binding.allowedFiles,
          `'${id}' is bound to ${binding.boundTo} but is called from ${site}`,
        ).toContain(site);
      }
      expect(sites.size, `bound cue '${id}' is not called anywhere`).toBeGreaterThan(0);
    }
  });
});
