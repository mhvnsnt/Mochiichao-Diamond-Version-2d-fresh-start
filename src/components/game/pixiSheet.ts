import { Texture } from 'pixi.js';

// Shared sheet-cell texture loader (PixiWorldCanvas + PixiBattleCanvas).
// Loads one 64x64 cell of a 192x64 sheet through an offscreen canvas so
// the game never needs a GLB, a network sprite, or a Pokemon sprite.
const cache = new Map<string, Promise<Texture>>();

// M1 (2026-10-29): some townsperson atlases ship an opaque flat
// background (white/grey) behind each 64x64 cell, which drew as a
// box around the figure in the world. Flood-fill from the cell
// corners and clear pixels close to the corner colour. Cells that
// are already transparent at the corners are left exactly as-is.
function keyOutCellBackground(c: HTMLCanvasElement) {
  const ctx = c.getContext('2d')!;
  const w = c.width, h = c.height;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const corners = [0, w - 1, (h - 1) * w, h * w - 1];
  if (corners.every(i => d[i * 4 + 3] < 16)) return;
  const seen = new Uint8Array(w * h);
  for (const start of corners) {
    if (d[start * 4 + 3] < 16) continue;
    const r0 = d[start * 4], g0 = d[start * 4 + 1], b0 = d[start * 4 + 2];
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      if (seen[i]) continue;
      const o = i * 4;
      if (d[o + 3] >= 16 && Math.abs(d[o] - r0) + Math.abs(d[o + 1] - g0) + Math.abs(d[o + 2] - b0) > 36) continue;
      seen[i] = 1; d[o + 3] = 0;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) stack.push(i - 1);
      if (x < w - 1) stack.push(i + 1);
      if (y > 0) stack.push(i - w);
      if (y < h - 1) stack.push(i + w);
    }
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
        c.getContext('2d')!.drawImage(img, x, 0, 64, 64, 0, 0, 64, 64);
        keyOutCellBackground(c);
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
        c.getContext('2d')!.drawImage(img, x, y, 64, 64, 0, 0, 64, 64);
        keyOutCellBackground(c);
        resolve(Texture.from(c));
      };
      img.onerror = reject;
      img.src = sheetUrl;
    });
    cache.set(key, p);
  }
  return p;
}
