/**
 * Cries — playback half of the soundtrack lane (2026-10-29).
 *
 * Consumes the existing CRY SYNTH (show teardown species-systems):
 * every species carries a `cry.synth` parameter block in
 * src/data/core/species.json, rendered by tools/cry_synth.py to
 * public/audio/cries/<lowercased-name>-cry.wav — the same file
 * convention DexView's CRY_URLS table already points at, so the dex
 * play button works the day the files land, with no UI change.
 *
 * Grammar (from CRY-SYNTH.md): a cry plays on battle entry (both
 * sides), on the dex entry view, and where creature-mode's grammar
 * calls for it. One cry per species per moment — the title gate's
 * variant rotation (titleCryGate.ts) is a title-screen extension
 * and is NOT generalised here.
 *
 * Fail-closed, same rule as the rest of the audio stack: unknown
 * species or a missing file resolves false and never throws, and
 * no substitute sound is ever invented.
 */

import speciesData from "../data/core/species.json";
import { playAudioUrl } from "./audioRouting";

interface SpeciesCryRecord {
  id: string;
  name: string;
  cry?: { synth?: unknown; rendered_wav?: string };
}

const SPECIES: SpeciesCryRecord[] = (speciesData as { species: SpeciesCryRecord[] }).species;
const BY_ID = new Map(SPECIES.map((s) => [s.id, s]));

/** File slug convention shared with DexView: lowercased species name. */
export function crySlug(speciesId: string): string | null {
  const s = BY_ID.get(speciesId);
  return s ? s.name.toLowerCase() : null;
}

export function cryUrl(speciesId: string): string | null {
  const s = BY_ID.get(speciesId);
  if (!s || !s.cry?.synth) return null;
  const base = import.meta.env.BASE_URL ?? "/";
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  return `${withSlash}audio/cries/${s.name.toLowerCase()}-cry.wav`;
}

/** Species with a full cry block — coverage tests assert 50/50. */
export function speciesWithCry(): string[] {
  return SPECIES.filter((s) => s.cry?.synth).map((s) => s.id);
}

export async function playCry(speciesId: string): Promise<boolean> {
  const url = cryUrl(speciesId);
  if (!url) return false;
  return playAudioUrl(url, "sfx");
}
