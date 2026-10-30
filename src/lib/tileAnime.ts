/**
 * tileAnime.ts — the field tile-animation system, PORTED from
 * HeartGold/SoulSilver's own data (source-first wiring law).
 *
 * PROVENANCE
 * - Source: pret-pokeheartgold, files/data/fldtanime.narc.
 *   Member 0 is the cycle table: 9 named entries, each a list of
 *   (frame, ticks) steps terminated by 0xFFFF. "Ticks" are field
 *   frames at the DS's 60 fps. Members 1-9 are the BTX0 frame
 *   texture sets those steps swap between — animation by TEXTURE
 *   SWAP, not palette cycling.
 * - Extraction receipt: ~/workspace/env-pullin-hgss-bw2/extracted/
 *   hgss/fldtanime-cycles.json (table) + fldtanime-member*.nsbtx
 *   (frame sets); all 47 frame textures decoded to PNG.
 * - Seam: the C consumer of fldtanime.narc is not in the held
 *   decomp (it lives in a not-yet-decompiled overlay — verified by
 *   ripgrep over pret-pokeheartgold src/ + include/). What is
 *   ported here is therefore the DATA + the table-driver semantics
 *   the data itself defines: accumulate elapsed field ticks, the
 *   current step's frame is shown for its tick count, then advance;
 *   the table loops. No table value was invented or altered.
 * - Our renderer samples the same tables from a 30 fps interval
 *   (2 source ticks per sample) instead of a 60 fps field loop;
 *   the fastest source step (swave_p's 2-tick frames, 33 ms) sits
 *   exactly at that sampling rate. Table values are unchanged.
 *
 * BINDINGS (which cycle drives which of our tile families — the
 * source binds cycles per-tileset in its area data; our maps use
 * the bindings recorded here):
 * - sea_on   -> open-water crest overlays (frames sea_on.1-6)
 * - dsea_on  -> deep water (table identical to sea_on in source)
 * - swave_p  -> shore-wave frames on shallow tiles at a land edge
 *               (frames hamabe.1-6 from files/data/minihamabe.nsbtx)
 * - flower01 -> flower tiles (frames flower01.1-3)
 * - sea_rock -> rocks standing in water (reserved; rock tiles at a
 *               water edge — wired for Route 1's pond rocks)
 */

export interface AnimeStep {
  frame: number;
  ticks: number;
}

export const FLDTANIME: Record<string, AnimeStep[]> = {
  sea_on: [
    { frame: 0, ticks: 18 }, { frame: 1, ticks: 18 }, { frame: 2, ticks: 18 },
    { frame: 3, ticks: 18 }, { frame: 4, ticks: 18 }, { frame: 5, ticks: 18 },
  ],
  swave_p: [
    { frame: 0, ticks: 12 }, { frame: 1, ticks: 4 }, { frame: 2, ticks: 4 },
    { frame: 3, ticks: 2 }, { frame: 4, ticks: 2 }, { frame: 5, ticks: 38 },
    { frame: 4, ticks: 4 }, { frame: 3, ticks: 4 }, { frame: 2, ticks: 4 },
    { frame: 1, ticks: 4 }, { frame: 0, ticks: 12 },
  ],
  swave_un: [
    { frame: 0, ticks: 40 }, { frame: 3, ticks: 39 }, { frame: 2, ticks: 5 },
    { frame: 1, ticks: 6 },
  ],
  sea_rock: [
    { frame: 0, ticks: 8 }, { frame: 1, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 3, ticks: 8 }, { frame: 4, ticks: 8 }, { frame: 5, ticks: 10 },
    { frame: 4, ticks: 8 }, { frame: 3, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 1, ticks: 8 }, { frame: 0, ticks: 8 },
  ],
  sea_rock_m: [
    { frame: 0, ticks: 8 }, { frame: 1, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 3, ticks: 8 }, { frame: 4, ticks: 8 }, { frame: 5, ticks: 10 },
    { frame: 4, ticks: 8 }, { frame: 3, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 1, ticks: 8 }, { frame: 0, ticks: 8 },
  ],
  flower01: [
    { frame: 0, ticks: 18 }, { frame: 1, ticks: 18 }, { frame: 0, ticks: 18 },
    { frame: 2, ticks: 18 },
  ],
  flower02: [
    { frame: 0, ticks: 18 }, { frame: 1, ticks: 18 }, { frame: 0, ticks: 18 },
    { frame: 2, ticks: 18 },
  ],
  dsea_on: [
    { frame: 0, ticks: 18 }, { frame: 1, ticks: 18 }, { frame: 2, ticks: 18 },
    { frame: 3, ticks: 18 }, { frame: 4, ticks: 18 }, { frame: 5, ticks: 18 },
  ],
  r_sea_rock: [
    { frame: 0, ticks: 8 }, { frame: 1, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 3, ticks: 8 }, { frame: 4, ticks: 8 }, { frame: 5, ticks: 10 },
    { frame: 4, ticks: 8 }, { frame: 3, ticks: 8 }, { frame: 2, ticks: 8 },
    { frame: 1, ticks: 8 }, { frame: 0, ticks: 8 },
  ],
};

export function cycleLength(steps: AnimeStep[]): number {
  return steps.reduce((a, s) => a + s.ticks, 0);
}

/** The frame the cycle shows at an absolute field-tick count.
 *  phase shifts the cycle per tile (the source scatters its wave
 *  marks per metatile; our tiles phase by position hash). */
export function tileAnimeFrame(cycle: string, ticks: number, phase = 0): number {
  const steps = FLDTANIME[cycle];
  if (!steps || steps.length === 0) return 0;
  const len = cycleLength(steps);
  let t = (((ticks + phase) % len) + len) % len;
  for (const s of steps) {
    if (t < s.ticks) return s.frame;
    t -= s.ticks;
  }
  return steps[steps.length - 1].frame;
}

/** A cheap signature of every cycle the renderer binds, so the
 *  canvas only repaints when a displayed frame actually changes. */
export function tileAnimeSignature(ticks: number): string {
  return [
    tileAnimeFrame('sea_on', ticks),
    tileAnimeFrame('swave_p', ticks),
    tileAnimeFrame('flower01', ticks),
    tileAnimeFrame('sea_rock', ticks),
  ].join('|');
}
