import { describe, it, expect } from "vitest";
import { cryUrl, speciesWithCry } from "./cries";
import speciesData from "../data/core/species.json";
// The pilot-six parameter source of truth lives in the show package
// inside this repo (show/production/tooling/species-systems/); the game
// consumes it verbatim, never forks it. The path is repo-relative so
// the suite runs anywhere the repo is checked out: the old path reached
// outside the repo to a sibling checkout, which does not exist on CI
// runners — the read died with ENOENT at import time and failed
// collection for the whole file (the ci-budgets red on every PR).
import { readFileSync } from "node:fs";
const pilotSix = JSON.parse(
  readFileSync(
    new URL("../../show/production/tooling/species-systems/pilot_six_cries.json", import.meta.url),
    "utf8",
  ),
);

interface Sp { id: string; name: string; cry?: { synth: Record<string, unknown>; rendered_wav?: string } }
const SPECIES = (speciesData as { species: Sp[] }).species;

describe("cry coverage", () => {
  it("all 50 species carry a cry parameter block", () => {
    expect(SPECIES.length).toBe(50);
    expect(speciesWithCry().length).toBe(50);
    for (const s of SPECIES) {
      expect(s.cry?.synth, `${s.name} missing cry.synth`).toBeDefined();
      expect(s.cry?.rendered_wav).toBe(`public/audio/cries/${s.name.toLowerCase()}-cry.wav`);
    }
  });

  it("cry URLs follow the DexView file convention", () => {
    expect(cryUrl("001")).toMatch(/audio\/cries\/mochii-cry\.wav$/);
    expect(cryUrl("150")).toMatch(/audio\/cries\/gabu-cry\.wav$/);
    expect(cryUrl("400")).toMatch(/audio\/cries\/goddgachuu-cry\.wav$/);
    expect(cryUrl("999")).toBeNull();
  });

  it("pilot six parameters are the synth's own, verbatim (no fork)", () => {
    const pilot = pilotSix as unknown as Record<string, { synth: unknown }>;
    for (const s of SPECIES) {
      const p = pilot[s.name.toLowerCase()];
      if (p) expect(s.cry?.synth).toEqual(p.synth);
    }
  });

  it("identity floor: no two species share a voice identity", () => {
    // Same wave pair + same pitch contour = same voice family; inside a
    // family, neighbours must differ by >= 30 Hz of base pitch or
    // >= 0.15 s of length (the List-9 identity-floor rule).
    const groups = new Map<string, Sp[]>();
    for (const s of SPECIES) {
      const sy = s.cry!.synth as { wave_a: string; wave_b: string; pitch_env: unknown };
      const key = `${sy.wave_a}|${sy.wave_b}|${JSON.stringify(sy.pitch_env)}`;
      groups.set(key, [...(groups.get(key) ?? []), s]);
    }
    for (const members of groups.values()) {
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i].cry!.synth as { base_hz: number; length_s: number };
          const b = members[j].cry!.synth as { base_hz: number; length_s: number };
          const separated = Math.abs(a.base_hz - b.base_hz) >= 30 || Math.abs(a.length_s - b.length_s) >= 0.15;
          expect(separated, `${members[i].name} vs ${members[j].name} violate the identity floor`).toBe(true);
        }
      }
    }
  });
});
