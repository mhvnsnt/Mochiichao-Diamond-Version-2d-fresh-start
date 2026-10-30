#!/usr/bin/env python3
"""Per-pose kage / highlight layer bank (gap G10).

TV shiage paints shadow (kage) and highlight as SEPARATE artwork
from the character's flat colours, per light variant. This system
banks those layers per pose so the composite step (satsuei) can
seat them - the character art itself is NEVER touched: the
no-baked-shadows rule is enforced by construction (this tool only
reads pose art; a hash check in --proof asserts the file is
byte-identical afterwards).

Shape derivation (deterministic, from the pose's own silhouette):
  kage-1 (broad shadow side) = S & ~shift(S, toward light, d1)
  kage-2 (deep core)         = S & ~shift(S, toward light, d2), d2<d1
  highlight (light-side rim) = S & ~shift(S, away from light, dh)
Edges are softened 1px then re-thresholded for cel-crisp contours.
A pose may add HAND-DRAWN interior shapes (belly, shell, muzzle)
as PNGs in a hand/ folder beside the pose; when present they are
unioned into kage-1 and flagged in the manifest - hand shapes win,
the derived rim is the floor, never the ceiling.

Colours come from the character's settei colour model. Slot ORDER
is not consistent across characters (Dorowani's dark tone sits at
slot 4, Mochii's at slot 2), so roles are picked by luminance:
  base = slot 0 (the body colour for every current model),
  dark = the palette's darkest slot, light = its lightest slot.
  kage-1 = mix(base, dark, 0.50), kage-2 = mix(base, dark, 0.78),
  highlight = lightest slot. Recomputed per variant, so sunset
  shadows warm and night shadows cool exactly as the model says.

Light direction per variant (dx, dy; +x right, +y down):
  day (-1,-1) high left | interior (0,-1) soft top
  sunset (-1,-0.3) low left | night (1,-1) high right (moon)

Usage:
  kage_layers.py build           # bank layers for all poses/variants
  kage_layers.py proof           # composited day-vs-sunset proof
Bank: pipeline/kage-bank/<char>/<pose>/<variant>/{kage1,kage2,hi}.png
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

HERE = Path(__file__).parent
TV = HERE.parent
BANK = HERE / "kage-bank"

POSES = {
    "mochii": {
        "standing": TV / "calibration/run/core/images/characters/"
                       "mochii_gag/body/standing/body1.png",
        "colour_models": TV / "settei/mochii/colour-models.json",
        "hand_dir": None,
    },
    "dorowani": {
        "standing": Path.home() / "workspace/mochiichao-show/"
                                  "canon-cutouts/dorowani.png",
        "colour_models": TV / "settei/dorowani/colour-models.json",
        "hand_dir": None,
    },
}

LIGHT = {"day": (-1.0, -1.0), "interior": (0.0, -1.0),
         "sunset": (-1.0, -0.3), "night": (1.0, -1.0)}
ALPHA = {"kage1": 96, "kage2": 80, "hi": 115}


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def hex2rgb(h: str):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def mix(c1, c2, t):
    return tuple(round(a + (b - a) * t) for a, b in zip(c1, c2))


def shift_mask(mask: np.ndarray, dx: int, dy: int) -> np.ndarray:
    out = np.zeros_like(mask)
    h, w = mask.shape
    xs0, xs1 = max(0, dx), min(w, w + dx)
    xd0, xd1 = max(0, -dx), min(w, w - dx)
    ys0, ys1 = max(0, dy), min(h, h + dy)
    yd0, yd1 = max(0, -dy), min(h, h - dy)
    out[ys0:ys1, xs0:xs1] = mask[yd0:yd1, xd0:xd1]
    return out


def crisp(mask_f: np.ndarray) -> np.ndarray:
    im = Image.fromarray((mask_f * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(1.2))
    return (np.asarray(im, dtype=float) / 255.0) > 0.5


def layer_png(shape: np.ndarray, colour, alpha: int) -> Image.Image:
    h, w = shape.shape
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = colour
    arr[..., 3] = np.where(shape, alpha, 0).astype(np.uint8)
    return Image.fromarray(arr, "RGBA")


def build():
    manifest = {"rule": "kage/highlight live ONLY as these separate "
                        "bank layers; character art is read, never "
                        "written (no-baked-shadows rule)",
                "poses": {}}
    for char, poses in POSES.items():
        models = json.loads(poses["colour_models"].read_text())
        for pose_name in [k for k in poses if k not in
                          ("colour_models", "hand_dir")]:
            src = poses[pose_name]
            before = sha256(src)
            img = Image.open(src).convert("RGBA")
            alpha = np.asarray(img.getchannel("A"), dtype=float) / 255.0
            sil = alpha > 0.5
            w = img.size[0]
            entry = {"source": str(src), "source_sha256": before,
                     "variants": {}}
            hand = None
            if poses.get("hand_dir"):
                hp = Path(poses["hand_dir"]) / f"{pose_name}-kage.png"
                if hp.exists():
                    hand = np.asarray(Image.open(hp).convert("L"),
                                       dtype=float) / 255.0 > 0.5
            for variant, palette in models.items():
                slots = [hex2rgb(h) for h in palette]
                lum = [0.2126 * r + 0.7152 * g + 0.0722 * b
                       for r, g, b in slots]
                base = slots[0]
                dark = slots[int(np.argmin(lum))]
                lightest = slots[int(np.argmax(lum))]
                colours = {"kage1": mix(base, dark, 0.50),
                           "kage2": mix(base, dark, 0.78),
                           "hi": lightest}
                lx, ly = LIGHT[variant]
                norm = max(1e-6, (lx * lx + ly * ly) ** 0.5)
                ux, uy = lx / norm, ly / norm
                d1 = max(2, round(0.11 * w))
                d2 = max(1, round(0.045 * w))
                dh = max(1, round(0.03 * w))
                k1 = sil & ~crisp(shift_mask(sil.astype(float),
                                             round(ux * d1), round(uy * d1)))
                k2 = sil & ~crisp(shift_mask(sil.astype(float),
                                             round(ux * d2), round(uy * d2)))
                hi = sil & ~crisp(shift_mask(sil.astype(float),
                                             -round(ux * dh), -round(uy * dh)))
                if hand is not None:
                    k1 = k1 | (hand & sil)
                outdir = BANK / char / pose_name / variant
                outdir.mkdir(parents=True, exist_ok=True)
                for name, shape in (("kage1", k1), ("kage2", k2),
                                    ("hi", hi)):
                    layer_png(shape, colours[name], ALPHA[name]).save(
                        outdir / f"{name}.png")
                entry["variants"][variant] = {
                    "colours": {k: "#%02x%02x%02x" % v
                                for k, v in colours.items()},
                    "light": [lx, ly],
                    "coverage_pct": {
                        "kage1": round(100 * float(k1.sum()) /
                                       max(1, float(sil.sum())), 1),
                        "kage2": round(100 * float(k2.sum()) /
                                       max(1, float(sil.sum())), 1),
                        "hi": round(100 * float(hi.sum()) /
                                    max(1, float(sil.sum())), 1)},
                    "hand_shapes": hand is not None}
            assert sha256(src) == before, f"pose art changed: {src}"
            manifest["poses"][f"{char}/{pose_name}"] = entry
            print(f"banked {char}/{pose_name}: variants "
                  f"{list(entry['variants'])}; source sha unchanged")
    BANK.mkdir(parents=True, exist_ok=True)
    (BANK / "bank-manifest.json").write_text(json.dumps(manifest, indent=1))
    print("manifest:", BANK / "bank-manifest.json")


def composite(char_img: Image.Image, variant_dir: Path,
              bg: Image.Image, pos) -> Image.Image:
    out = bg.copy()
    x, y = pos
    for name in ("kage1", "kage2"):
        lay = Image.open(variant_dir / f"{name}.png")
        out.paste(Image.alpha_composite(
            out.crop((x, y, x + lay.size[0], y + lay.size[1]))
            .convert("RGBA"), lay).convert("RGB"), (x, y))
    out_rgba = out.convert("RGBA")
    out_rgba.alpha_composite(char_img, dest=(x, y))
    # re-seat layers OVER the character (they shade the character)
    out = out_rgba.convert("RGB")
    for name in ("kage1", "kage2", "hi"):
        lay = Image.open(variant_dir / f"{name}.png")
        region = out.crop((x, y, x + lay.size[0], y + lay.size[1]))
        out.paste(Image.alpha_composite(region.convert("RGBA"), lay)
                  .convert("RGB"), (x, y))
    return out


def proof():
    """One composited shot per light variant + the rule checks."""
    out_dir = TV / "calibration" / "kage-proof"
    out_dir.mkdir(parents=True, exist_ok=True)
    char_src = POSES["mochii"]["standing"]
    before = sha256(char_src)
    char = Image.open(char_src).convert("RGBA")
    char_big = char  # native 380px tall; pos keeps it inside the plate
    plates = {"day": TV / "bg-packages/garden-gate/master-day.png",
              "sunset": TV / "bg-packages/garden-gate/master-sunset.png"}
    results = {}
    for variant, plate in plates.items():
        if not plate.exists():
            results[variant] = "plate missing: " + str(plate)
            continue
        bg = Image.open(plate).convert("RGB").resize((960, 540))
        pos = (290, 120)
        plain = bg.copy()
        plain.paste(char_big, pos, char_big)
        comp = composite(char_big, BANK / "mochii/standing" / variant,
                         bg, pos)
        plain.save(out_dir / f"mochii-garden-{variant}-nokage.png")
        comp.save(out_dir / f"mochii-garden-{variant}-kage.png")
        region = (slice(pos[1], pos[1] + char_big.size[1]),
                  slice(pos[0], pos[0] + char_big.size[0]))
        sil = np.asarray(char_big.getchannel("A")) > 128
        cp = np.asarray(comp, dtype=float)[region][sil]
        pp = np.asarray(plain, dtype=float)[region][sil]
        results[variant] = {
            "char_mean_rgb_kage": [round(float(cp[:, i].mean()), 1)
                                   for i in range(3)],
            "char_mean_rgb_plain": [round(float(pp[:, i].mean()), 1)
                                    for i in range(3)],
            "mean_abs_change_from_kage": round(
                float(np.abs(cp - pp).mean()), 2)}
    report = {"character_art_sha256_before": before,
              "character_art_sha256_after": sha256(char_src),
              "character_art_unchanged":
                  sha256(char_src) == before,
              "variants": results}
    if "day" in results and "sunset" in results and \
            isinstance(results["day"], dict):
        d = np.array(results["day"]["char_mean_rgb_kage"])
        s = np.array(results["sunset"]["char_mean_rgb_kage"])
        report["day_vs_sunset_char_mean_abs_diff"] = round(
            float(np.abs(d - s).mean()), 2)
    (out_dir / "kage-proof.json").write_text(json.dumps(report, indent=1))
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    {"build": build, "proof": proof}[cmd]()
