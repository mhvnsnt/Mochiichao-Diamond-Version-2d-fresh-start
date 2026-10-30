import { Texture } from 'pixi.js';

// Shared sheet-cell texture loader (PixiWorldCanvas + PixiBattleCanvas).
// Loads one 64x64 cell of a 192x64 sheet through an offscreen canvas so
// the game never needs a GLB, a network sprite, or a Pokemon sprite.
const cache = new Map<string, Promise<Texture>>();

/**
 * Cell-background keying (white-box fix, 2026-10-29).
 *
 * Human atlases under src/assets/human-characters/in-game-sheets/*
 * bake an OPAQUE light-grey background into every cell (corner
 * pixels e.g. (223,223,223,255) on the Hex atlas, (255,255,255,255)
 * on the PR #100 atlases). Cropping a raw cell therefore renders a
 * solid white/grey square behind the figure. Creature sheets are
 * properly transparent (alpha-0 corners), so this key must no-op
 * for them.
 *
 * Guard (all must hold, else the cell is returned untouched):
 *  - all four cell corners are fully opaque (alpha 255);
 *  - all four corners agree with each other (per-channel spread
 *    <= CORNER_SPREAD) — a cell whose corners differ is real art
 *    reaching the edges, not a flat baked background.
 * Key: flood fill from every border pixel, clearing (alpha 0) only
 * pixels connected to the border whose colour stays within
 * KEY_TOLERANCE of the corner colour. Interior regions that merely
 * resemble the background (white clothing, pale skin highlights)
 * survive unless they are colour-identical AND edge-connected.
 */
const CORNER_SPREAD = 12;
const KEY_TOLERANCE = 20;

function keyCellBackground(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const px = (x: number, y: number) => (y * w + x) * 4;
  const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
  for (const c of corners) {
    if (d[c + 3] !== 255) return; // transparent or translucent corner: not a baked-bg cell
  }
  for (let ch = 0; ch < 3; ch++) {
    let mn = 255, mx = 0;
    for (const c of corners) { const v = d[c + ch]; if (v < mn) mn = v; if (v > mx) mx = v; }
    if (mx - mn > CORNER_SPREAD) return; // corners disagree: real art, leave it alone
  }
  const kr = (d[corners[0]] + d[corners[1]] + d[corners[2]] + d[corners[3]]) / 4;
  const kg = (d[corners[0] + 1] + d[corners[1] + 1] + d[corners[2] + 1] + d[corners[3] + 1]) / 4;
  const kb = (d[corners[0] + 2] + d[corners[1] + 2] + d[corners[2] + 2] + d[corners[3] + 2]) / 4;
  const matches = (i: number) =>
    Math.abs(d[i] - kr) <= KEY_TOLERANCE &&
    Math.abs(d[i + 1] - kg) <= KEY_TOLERANCE &&
    Math.abs(d[i + 2] - kb) <= KEY_TOLERANCE;
  const seen = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + (w - 1)); }
  while (stack.length) {
    const p = stack.pop()!;
    if (seen[p]) continue;
    seen[p] = 1;
    const i = p * 4;
    if (!matches(i)) continue;
    d[i + 3] = 0;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  ctx.putImageData(img, 0, 0);
}

// Battle-only full-image loader (three-quarter cuts, not 64x64 sheet cells).
// Keeps the source image's aspect ratio via its own width/height; the caller
// sizes the sprite from tex.width / tex.height after load.
const fullCache = new Map<string, Promise<Texture>>();

export function fullImageTexture(imageUrl: string): Promise<Texture> {
  let p = fullCache.get(imageUrl);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(Texture.from(img));
      img.onerror = reject;
      img.src = imageUrl;
    });
    fullCache.set(imageUrl, p);
  }
  return p;
}

export function sheetCellTexture(sheetUrl: string, x: number): Promise<Texture> {
  const key = `${sheetUrl}@${x}`;
  let p = cache.get(key);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, x, 0, 64, 64, 0, 0, 64, 64);
        keyCellBackground(ctx, 64, 64);
        resolve(Texture.from(c));
      };
      img.onerror = reject;
      img.src = sheetUrl;
    });
    cache.set(key, p);
  }
  return p;
}

// Grid-cell loader for 4x4 human atlases (and any grid sheet): crops
// the 64x64 cell at pixel (x, y). sheetCellTexture above only ever
// crops row 0 (y = 0), which is why walk cells in rows 1-2 were
// unreachable until now. Existing callers of sheetCellTexture are
// unchanged; this is an additive export, not a behaviour change.
export function sheetCellTextureXY(sheetUrl: string, x: number, y: number): Promise<Texture> {
  const key = `${sheetUrl}@${x},${y}`;
  let p = cache.get(key);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 64; c.height = 64;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, x, y, 64, 64, 0, 0, 64, 64);
        keyCellBackground(ctx, 64, 64);
        resolve(Texture.from(c));
      };
      img.onerror = reject;
      img.src = sheetUrl;
    });
    cache.set(key, p);
  }
  return p;
}
