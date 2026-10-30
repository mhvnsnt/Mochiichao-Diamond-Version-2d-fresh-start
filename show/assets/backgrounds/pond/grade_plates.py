#!/usr/bin/env python3
"""EP01 gap-fill Work Package B — reproducible DERIVED plate grades.

Every output of this script is a DERIVED grade: a colour/light treatment
layered over an existing plate (Lighting System L7: shifts are layers,
never repaints). Nothing here is canon original art, and every output is
registered DERIVED with its provenance in show/shared/PLATES-REGISTRY.md.

Inputs (verified, see INVENTORY.md / registry):
  Gate base : gate-plate-v1-still-1280.png
              md5 3d3d76f29d0dd23aa8633db1e471b81e (1280 working copy of the
              owner-accepted 2048x1152 v1 still, md5 2d4207f638976799e877049f0bcb3dd3)
  Pond base : EP01-PLATE-pond-day-v0-spec-still.png
              md5 40365a232823d32a916f1ba422a7a619 (provisional spec plate)
  Green base: EP01-PLATE-green-day-v0-spec-still.png
              md5 2439b9676a98d84a9cf0c72d8e699c9c (provisional spec plate)

Run:  python3 grade_plates.py <gate|pond-dawn|pond-day|green> <in.png> <out.png>
Deps: Pillow + NumPy only. Deterministic (fixed seed for the dapple layer).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

WARM = np.array([1.00, 0.92, 0.78])   # pale-gold warm tint direction
COOL = np.array([0.94, 1.00, 1.10])   # neutral-cool tint direction


def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0


def save(arr, path):
    Image.fromarray((np.clip(arr, 0, 1) * 255).round().astype(np.uint8)).save(path)


def colour_balance(arr, shadow_rgb, mid_rgb, high_rgb):
    """Per-channel gains interpolated by luminance (shadows/mids/highlights)."""
    shadow_rgb, mid_rgb, high_rgb = (np.asarray(v, np.float32) for v in (shadow_rgb, mid_rgb, high_rgb))
    lum = arr.mean(axis=2, keepdims=True)
    g = (shadow_rgb[None, None, :] * (1 - lum) ** 2
         + mid_rgb[None, None, :] * 2 * lum * (1 - lum)
         + high_rgb[None, None, :] * lum ** 2)
    # normalise the interpolation weights
    w = (1 - lum) ** 2 + 2 * lum * (1 - lum) + lum ** 2
    return arr * (g / w)


def saturation(arr, factor):
    lum = arr.mean(axis=2, keepdims=True)
    return lum + (arr - lum) * factor


def lift_shadows(arr, lift):
    """Low-ratio / high-key move: raise the toe, compress contrast slightly."""
    return np.clip(arr * (1.0 - lift) + lift * arr ** 0.5 * 0.35 + lift * 0.30, 0, 1)


def horizontal_gradient(h, w, left, right):
    t = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
    return np.ones((h, w, 1), np.float32) * (left * (1 - t) + right * t)


def vertical_gradient(h, w, top, bottom):
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    return np.ones((h, w, 1), np.float32) * (top * (1 - t) + bottom * t)


def gate_dawn(arr):
    """GATE-MORNING "First Bell" + N1 package line "dawn, brand-blue key".

    Key quote: low warm sun screen-left / bright sky bounce, low ratio
    (high-key) / rim pale gold on lane-facing edges / temp warm-neutral /
    grade Signature Day.
    Moves:
      1. Warm gradient wash, strongest screen-left, fading right
         -> the low warm sun's direction (screen-left key).
      2. Shadow lift + slight contrast compression -> low ratio, high-key
         bright sky bounce; everything readable.
      3. Colour balance: shadows keep a blue lean (brand-blue key in the
         shade + sky), highlights go warm-neutral -> warm-neutral temp
         without losing the brand blues.
      4. Saturation x1.05 -> Signature Day stays full.
    NOT done by a global grade (stated plainly): the pale-gold rim on
    lane-facing edges is an edge-selective light layer; it belongs to the
    composite/light-layer stage, not a whole-frame grade.
    """
    h, w, _ = arr.shape
    out = lift_shadows(arr, 0.10)
    warm = horizontal_gradient(h, w, 0.16, 0.03)          # left -> right
    out = np.clip(out * (1 - warm) + out * WARM[None, None, :] * warm * 1.6, 0, 1)
    out = colour_balance(out, (0.97, 1.00, 1.07), (1.01, 1.00, 0.99), (1.05, 1.00, 0.94))
    out = saturation(out, 1.05)
    return out


def pond_dawn(arr):
    """POND-MORNING "Flat Water" — the N1 / V3-002 plate (day plate at dawn grade).

    Key quote: open-sky key / fill = water bounce from below (fill
    direction inverted) / white sparkle rim on wet edges / temp
    neutral-cool / grade Ocean family, lightest step.
    Moves:
      1. Cool colour balance (B up, R down) -> neutral-cool temp.
      2. Overall lift -> lightest Ocean step, flat open-sky key.
      3. Extra luminance lift on the lower (water) half, cyan-leaning
         -> fill arriving from below, the Pond's inverted fill.
      4. Saturation x0.92 -> dawn-muted Ocean, lightest step.
      5. Highlight whitening (bright pixels pushed toward white)
         -> the white sparkle read on wet edges, grade-level only.
    """
    h, w, _ = arr.shape
    out = colour_balance(arr, (0.95, 1.00, 1.08), (0.96, 1.00, 1.07), (0.97, 1.01, 1.06))
    out = np.clip(out * 1.06 + 0.02, 0, 1)
    bounce = vertical_gradient(h, w, 0.0, 0.10) * np.array([0.92, 1.0, 1.05])
    out = np.clip(out + bounce * out, 0, 1)
    out = saturation(out, 0.92)
    lum = out.mean(axis=2, keepdims=True)
    sparkle = np.clip((lum - 0.72) / 0.28, 0, 1) ** 2 * 0.25
    out = np.clip(out + sparkle * (1 - out), 0, 1)
    return out


def pond_day(arr):
    """POND-DAY "Ripple Key" finish of the provisional day still.

    Key quote: sun + moving caustic bounce / fill water / bright broken
    caustic rim at the surface line / temp neutral / grade Ocean.
    Check first (documented in PROVENANCE.md): the provisional still is
    already neutral-temp flat daylight, so temp is NOT moved. Moves:
      1. Saturation x1.10 -> full Ocean grade (provisional sits muted).
      2. Contrast x1.05 about mid-grey -> sun key separates from fill.
      3. Highlight whitening, stronger than dawn -> bright broken sparkle
         at the surface line, grade-level only. The moving caustic rim
         itself is the living plate's shimmer cycle, not a still grade.
    """
    out = saturation(arr, 1.10)
    out = np.clip((out - 0.5) * 1.05 + 0.5, 0, 1)
    lum = out.mean(axis=2, keepdims=True)
    sparkle = np.clip((lum - 0.68) / 0.32, 0, 1) ** 2 * 0.30
    out = np.clip(out + sparkle * (1 - out), 0, 1)
    return out


def green_day(arr):
    """GREEN-DAY "Canopy Dapple" finish of the provisional day still.

    Key quote: sun through canopy — dappled, broken key / green atmosphere
    bounce (atmosphere only) / leaf-edge yellow-green rim / temp
    warm-neutral / grade Signature Day with Ocean-green lean.
    Check first (documented in PROVENANCE.md): the provisional still is
    uniform flat light — no dapple at all — so it differs from the key.
    Moves:
      1. Dapple layer: deterministic soft light patches (seeded blobs,
         heavily blurred) multiplying luminance 0.90–1.10 -> the broken
         canopy key as a light layer (L7), not a repaint.
      2. Warm-neutral balance in highlights only -> warm-neutral temp.
      3. Yellow-green lift on the brightest values -> leaf-edge rim read
         at grade level.
      4. Saturation x1.05 -> the Green keeps the fullest saturation in
         the show (its mood dial stays at full).
    """
    h, w, _ = arr.shape
    rng = np.random.default_rng(20261028)
    mask = Image.new("L", (w // 8, h // 8), 128)
    d = ImageDraw.Draw(mask)
    for _ in range(46):
        x, y = rng.uniform(0, w // 8), rng.uniform(0, h // 8)
        r = rng.uniform(6, 26)
        v = int(rng.uniform(88, 172))
        d.ellipse([x - r, y - r, x + r, y + r], fill=v)
    mask = mask.resize((w, h), Image.BILINEAR).filter(ImageFilter.GaussianBlur(28))
    m = np.asarray(mask).astype(np.float32) / 255.0
    dapple = (0.90 + 0.20 * m)[:, :, None]
    out = np.clip(arr * dapple, 0, 1)
    out = colour_balance(out, (1.00, 1.00, 1.00), (1.01, 1.00, 0.99), (1.03, 1.01, 0.96))
    lum = out.mean(axis=2, keepdims=True)
    rim = np.clip((lum - 0.62) / 0.38, 0, 1) ** 2 * 0.10 * np.array([0.95, 1.05, 0.80])
    out = np.clip(out + rim * (1 - out), 0, 1)
    out = saturation(out, 1.05)
    return out


JOBS = {"gate": gate_dawn, "pond-dawn": pond_dawn, "pond-day": pond_day, "green": green_day}

if __name__ == "__main__":
    job, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    save(JOBS[job](load(src)), dst)
    print(f"{job}: {src} -> {dst}")
