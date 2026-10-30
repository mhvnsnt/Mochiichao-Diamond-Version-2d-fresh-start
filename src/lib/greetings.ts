// Honor greetings — stub-kill S-8 (2026-10-29).
//
// Before this module, honor's greeting read (greetingTierForBand in
// src/lib/honor.ts) had NO importer anywhere: the derived band never
// reached a single NPC's mouth. Now the NPC dialogue entry in
// WorldEngine resolves a greeting opener through here, so the band
// is FELT in how the world talks to the Ranger — and, per the
// presentation-restraint law, never shown: no band name, tier name,
// or number appears in any line or on any screen.
//
// PROVENANCE: the shape is the honor-west teardown's greeting
// register (~/workspace/honor-west-teardown/ TRANSFER-MAP.md §1.4 +
// TEARDOWN-RDR2.md — DOCS grade, written here as required): RDR2's
// honor moves greeting warmth; FNV-style reputation does the same
// per group. Ours reads the one derived band through honor's own
// greetingTierForBand; the line sets themselves are original
// Mochiichao writing in the game's existing dialogue voice, stored
// as data (src/data/core/greetings.json). Human NPCs only — creature
// NPCs speak in cries and are excluded by the caller and by
// isGreeter below.

import greetingsJson from "../data/core/greetings.json";
import { greetingTierForBand } from "./honor";

export type GreetingVoice = "honest" | "fence" | "neutral";

interface GreetingsData {
  tiers: Record<string, Record<GreetingVoice, string[]>>;
}

const DATA = greetingsJson as unknown as GreetingsData;

export const GREETING_TIERS = Object.keys(DATA.tiers);

/** NPC ids whose voice runs underworld-adjacent (fence class). */
const FENCE_VOICE_IDS = new Set<string>([
  // Syndicate / Liberation Front adjacent folk, when placed with
  // dialogue. Kept as data so placements extend it, not code.
]);

export function greetingVoiceFor(npc: {
  id?: string;
  isShop?: boolean;
  isHeal?: boolean;
  isHotel?: boolean;
}): GreetingVoice {
  if (npc.id && FENCE_VOICE_IDS.has(npc.id)) return "fence";
  if (npc.isShop || npc.isHeal || npc.isHotel) return "honest";
  return "neutral";
}

/** Creature NPCs announce themselves with a cry line ("Name: *...*")
 *  — they are not greeters; the cries-only rule keeps them out. */
export function isGreeter(npc: { dialog?: string[] }): boolean {
  const first = npc.dialog?.[0] ?? "";
  return !/:\s*\*/.test(first);
}

function pick(lines: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return lines[h % lines.length];
}

/**
 * Resolve the greeting opener for an NPC at a given derived band.
 * Total by construction: every tier carries every voice, and any
 * unknown band falls back through greetingTierForBand's own default
 * to the neutral tier — there is no missing-key path.
 */
export function greetingFor(
  npc: { id?: string; isShop?: boolean; isHeal?: boolean; isHotel?: boolean },
  bandId: string,
): { tier: string; voice: GreetingVoice; line: string } {
  const tier = greetingTierForBand(bandId);
  const voice = greetingVoiceFor(npc);
  const lines = DATA.tiers[tier]?.[voice] ?? DATA.tiers.neutral[voice];
  return { tier, voice, line: pick(lines, npc.id ?? voice) };
}
