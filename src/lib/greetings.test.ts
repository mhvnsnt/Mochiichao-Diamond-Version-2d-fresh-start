// Stub-kill S-8 receipts: every placed greeter NPC resolves a
// greeting line at every band, with no missing-key fallback, and no
// line ever names the band or tier (restraint law).
import { describe, it, expect } from "vitest";
import { greetingFor, greetingVoiceFor, isGreeter, GREETING_TIERS } from "./greetings";
import { greetingTierForBand } from "./honor";
import bandEffects from "../data/core/honor/band-effects.json";
import { FULL_WORLD } from "../world/FullWorldMaps";

const BAND_IDS = Object.keys((bandEffects as any).greetingRegister.bands as Record<string, string>);

describe("S-8 honor greetings", () => {
  it("the band set is the real one (11 bands) and every band maps to authored tiers", () => {
    expect(BAND_IDS).toHaveLength(11);
    for (const band of BAND_IDS) {
      expect(GREETING_TIERS).toContain(greetingTierForBand(band));
    }
    expect(GREETING_TIERS).toHaveLength(11);
  });

  it("coverage: every placed greeter NPC resolves a line at every band", () => {
    let greeters = 0;
    for (const map of Object.values(FULL_WORLD) as any[]) {
      for (const npc of map.npcs ?? []) {
        if (!npc.dialog?.length || npc.battle) continue;
        if (!isGreeter(npc)) continue; // creatures: cries only
        greeters++;
        for (const band of BAND_IDS) {
          const g = greetingFor(npc, band);
          expect(typeof g.line, `${npc.id} @ ${band}`).toBe("string");
          expect(g.line.length).toBeGreaterThan(0);
        }
      }
    }
    expect(greeters).toBeGreaterThan(20);
  });

  it("creature NPCs are not greeters (cries-only rule untouched)", () => {
    expect(isGreeter({ dialog: ["Pupbble: *contented yip, watching the water*"] })).toBe(false);
    expect(isGreeter({ dialog: ["Mochii: *a bright chirp*"] })).toBe(false);
    expect(isGreeter({ dialog: ["Mind the pack, it bruises."] })).toBe(true);
  });

  it("voice classes: service folk run honest, everyone else neutral by default", () => {
    expect(greetingVoiceFor({ isShop: true })).toBe("honest");
    expect(greetingVoiceFor({ isHeal: true })).toBe("honest");
    expect(greetingVoiceFor({ id: "town_oldman" })).toBe("neutral");
  });

  it("restraint: the band is felt, never named — no line leaks a band id or system word", () => {
    // Band ids are the system's vocabulary; ordinary English that
    // happens to share a word with a tier ("cold", "warm") is the
    // game's voice, not a leak.
    const forbidden = [...BAND_IDS, "morale", "tier", "greeting register"];
    for (const map of Object.values(FULL_WORLD) as any[]) {
      for (const npc of map.npcs ?? []) {
        if (!npc.dialog?.length || npc.battle || !isGreeter(npc)) continue;
        for (const band of BAND_IDS) {
          const line = greetingFor(npc, band).line.toLowerCase();
          for (const word of forbidden) {
            // Word-boundary match: "rough" inside "through" is the
            // game's English, not a leak.
            const needle = word.toLowerCase().replace(/-/g, "[\\s-]");
            expect(new RegExp(`\\b${needle}\\b`).test(line), `${npc.id}: "${line}" leaks "${word}"`).toBe(false);
          }
        }
      }
    }
  });

  it("the same NPC greets warm bands warmer than dread bands (felt difference)", () => {
    const npc = { id: "bh_net_mender" };
    const warm = greetingFor(npc, "paragon");
    const dread = greetingFor(npc, "black-hearted");
    expect(warm.tier).toBe("reverent");
    expect(dread.tier).toBe("dread");
    expect(warm.line).not.toBe(dread.line);
  });
});
