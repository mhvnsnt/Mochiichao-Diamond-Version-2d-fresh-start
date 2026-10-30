import React, { useEffect, useState } from 'react';
import { getSheetDef, sheetCellStyle, fallbackColorFor, creatureDisplayName, battleSpriteUrl } from '../../lib/spriteSheets';
import { folderForSpecies, IDLE, loadIdleFrame, loadSilhouette, SILHOUETTES } from '../../lib/creatureAnimation';

/**
 * One creature portrait, game-style. Real sheet cell when one exists
 * (all 49 sheet defs after the Phase 3 pivot, 147/148 included via their
 * locked 2D atlases); otherwise an original coloured silhouette
 * (a drawn blob with eyes, coloured by the creature's first type) plus the
 * creature's name. Never a Pokemon sprite, never an emoji, never a network
 * sprite fetch at play time.
 *
 * Phase 3 additions (creatureAnimation registry):
 * - Idle loops: when animateIdle is on (default) and the creature has an
 *   idle spec, the portrait cycles its idle_a/b/c frames at the spec's
 *   durations, falling back to the static sheet cell while frames load or
 *   if a load fails. The static cell is never replaced by a guessed frame.
 *   Idle frames are FRONT-facing art, so they may only stand in for the
 *   FRONT view: a 'back' request always renders the back view (the sheet's
 *   back cell, or the species' battle-back cut when one is registered).
 *   Back-sprite fix, 2026-10-29 (owner bug report): the idle cycle used
 *   to override ANY requested view, so in battle the player's creature
 *   showed its front idle frames and faced the player — Tyrage was the
 *   reported case, every species with an idle spec had the same defect
 *   on the DOM battle surfaces (WorldEngine billboards, ArenaBattleView).
 * - Discovery silhouettes: when undiscovered is set and a silhouette exists
 *   for the creature, the silhouette renders instead of the sheet cell
 *   (nothing flashes the real art first — the box stays empty until the
 *   silhouette loads). When there is no sheet def but a silhouette exists,
 *   the silhouette replaces the blob fallback. No dex view passes
 *   undiscovered yet; the prop is the wiring, the dex surface is owed.
 * - Lustre variants (10 looks per creature) render in the Team panel via variants.ts, not here.
 */
export default function CreaturePortrait({
  speciesId, view = 'front', size = 96, name, showName = false, mirror = false,
  animateIdle = true, undiscovered = false,
}: {
  speciesId: string | undefined | null;
  view?: 'front' | 'back' | 'side';
  size?: number;
  name?: string;
  showName?: boolean;
  mirror?: boolean;
  animateIdle?: boolean;
  undiscovered?: boolean;
}) {
  const def = getSheetDef(speciesId);
  const color = fallbackColorFor(speciesId);
  const label = name || creatureDisplayName(speciesId);
  const folder = folderForSpecies(speciesId);
  const idleSpec = folder ? IDLE[folder] : undefined;
  const hasSilhouette = !!(folder && SILHOUETTES[folder]);

  const [idleUrl, setIdleUrl] = useState<string | null>(null);
  const [idleFailed, setIdleFailed] = useState(false);
  const [silUrl, setSilUrl] = useState<string | null>(null);

  // Idle cycle: step through the spec frames at their durations. Each
  // step loads its frame URL (registry-cached promises); a failed load
  // stops the cycle and the static cell shows instead.
  useEffect(() => {
    if (!animateIdle || !idleSpec || !folder || undiscovered) return;
    // Idle frames are front-facing art (see header): never cycle them
    // for a non-front view, or a back-view request ends up facing front.
    if (view !== 'front') return;
    let cancelled = false;
    let timer = 0;
    const step = (idx: number) => {
      if (cancelled) return;
      const frame = idleSpec.frames[idx % idleSpec.frames.length];
      const p = loadIdleFrame(folder, frame.file);
      if (!p) { setIdleFailed(true); return; }
      p.then((url) => {
        if (cancelled) return;
        setIdleUrl(url);
        timer = window.setTimeout(() => step(idx + 1), frame.durationMs);
      }).catch(() => { if (!cancelled) setIdleFailed(true); });
    };
    step(0);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, animateIdle, undiscovered, view]);

  // Silhouette load (undiscovered, or no-def fallback).
  useEffect(() => {
    if (!folder || !hasSilhouette) return;
    if (!undiscovered && def) return;
    let cancelled = false;
    const p = loadSilhouette(folder);
    if (!p) return;
    p.then((url) => { if (!cancelled) setSilUrl(url); }).catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, hasSilhouette, undiscovered, !!def]);

  const showSilhouette = ((undiscovered && hasSilhouette) || (!def && hasSilhouette)) && !!silUrl;
  const showIdle = !!def && view === 'front' && animateIdle && !!idleSpec && !idleFailed && !!idleUrl && !undiscovered;
  // Battle-back cut (Gearkid / Mechapion, registered in spriteSheets):
  // a full-image back view cut from the species' own 2D sheet, used for
  // the player side of a battle when the atlas has no genuine back cell.
  const battleBackUrl = view === 'back' && def ? battleSpriteUrl(speciesId, true) : null;
  // Undiscovered and no silhouette loaded yet: empty box, never the real
  // art (even when a sheet def exists but no silhouette does). No-def,
  // not undiscovered, with a silhouette still loading: the blob below,
  // then the silhouette once it arrives. The blob is the only branch that
  // carries the "Art in progress" caption.
  const showEmptyUndiscovered = undiscovered && !silUrl;
  const showBlob = !def && !showSilhouette && !showEmptyUndiscovered;

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      {showEmptyUndiscovered ? (
        <div style={{ width: size, height: size }} aria-label={`${label} (undiscovered)`} />
      ) : showSilhouette ? (
        <img src={silUrl!} alt={`${label} (undiscovered)`} width={size} height={size} style={{ width: size, height: size, imageRendering: 'pixelated', transform: mirror ? 'scaleX(-1)' : undefined }} />
      ) : showIdle ? (
        <img src={idleUrl!} alt={label} width={size} height={size} style={{ width: size, height: size, imageRendering: 'pixelated', transform: mirror ? 'scaleX(-1)' : undefined }} />
      ) : battleBackUrl ? (
        <img src={battleBackUrl} alt={label} width={size} height={size} style={{ width: size, height: size, objectFit: 'contain', transform: mirror ? 'scaleX(-1)' : undefined }} />
      ) : def ? (
        <div style={{ ...sheetCellStyle(def, view, size), transform: mirror ? 'scaleX(-1)' : undefined }} aria-label={label} />
      ) : (
        <div
          className="relative flex items-end justify-center"
          style={{ width: size, height: size }}
          aria-label={`${label} (art not made yet)`}
        >
          <div
            className="rounded-full"
            style={{
              width: size * 0.82, height: size * 0.66, background: color,
              boxShadow: `inset -${size * 0.08}px -${size * 0.08}px 0 rgba(0,0,0,0.25)`,
              position: 'relative',
            }}
          >
            <div className="absolute rounded-full bg-white" style={{ width: size * 0.12, height: size * 0.12, left: '24%', top: '28%' }}>
              <div className="absolute rounded-full bg-black" style={{ width: '55%', height: '55%', left: '22%', top: '22%' }} />
            </div>
            <div className="absolute rounded-full bg-white" style={{ width: size * 0.12, height: size * 0.12, right: '24%', top: '28%' }}>
              <div className="absolute rounded-full bg-black" style={{ width: '55%', height: '55%', left: '22%', top: '22%' }} />
            </div>
          </div>
          <div className="absolute rounded-full" style={{ width: size * 0.9, height: size * 0.1, background: 'rgba(0,0,0,0.35)', bottom: 0 }} />
        </div>
      )}
      {showName && <div className="text-center font-bold text-white leading-tight" style={{ fontSize: Math.max(11, size * 0.16) }}>{label}</div>}
    </div>
  );
}
