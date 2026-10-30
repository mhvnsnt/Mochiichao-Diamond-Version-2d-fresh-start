#!/usr/bin/env python3
"""Traversal part 2 — compose the built-up traversal texture pieces
from HELD kit textures only (the env-pullin kit's own method: the
kit itself composed its ice set by tiling held 16x16 source textures
the way the source games compose them).

Outputs (into the tree's public/assets/hgss/):
  ledge_lip.png   — the ledge's top: plateau grass crest + bright
                    brow + dark under-lip band. Drawn overlapping
                    the plateau row above the face.
  climb_lip.png   — the climb face's top: rocky crest + brow +
                    under-lip band (from the criff face family).
  falls_crest.png — the waterfall's crest: upper-pool water +
                    the foam line where the water tips over.

Every pixel comes from a held texture (lighten/darken are value
multiplies on held pixels, recorded per piece). sha256 of inputs
and outputs printed for the landing record.
"""
import hashlib
from PIL import Image

A = "/home/hatch/workspace/traversal-build/tree/public/assets/hgss"
B = "/home/hatch/workspace/traversal-build/tree/public/assets/bw2"


def load(p):
    return Image.open(p).convert("RGBA")


def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()[:16]


def scale(im, f):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            px[x, y] = (min(255, int(r * f)), min(255, int(g * f)), min(255, int(b * f)), a)
    return im


def strip(im, y0, y1):
    return im.crop((0, y0, im.width, y1))


def stack(parts):
    w = max(p.width for p in parts)
    h = sum(p.height for p in parts)
    out = Image.new("RGBA", (w, h))
    y = 0
    for p in parts:
        out.paste(p, (0, y))
        y += p.height
    return out


inputs = {}

# ── ledge_lip.png (32x16) ──────────────────────────────────────
grass = load(f"{A}/grass_c.png"); inputs["grass_c.png"] = sha(f"{A}/grass_c.png")
cliff = load(f"{A}/cliff.png");   inputs["cliff.png"] = sha(f"{A}/cliff.png")
lip = stack([
    strip(grass, 0, 9),                    # plateau crest (grass top)
    scale(strip(cliff.copy(), 0, 3), 1.3), # bright brow
    scale(strip(cliff.copy(), 0, 4), 0.5), # dark under-lip band
])
assert lip.size == (32, 16), lip.size
lip.save(f"{A}/ledge_lip.png")

# ── climb_lip.png (32x16) ──────────────────────────────────────
criff = load(f"{A}/cliff_b.png"); inputs["cliff_b.png"] = sha(f"{A}/cliff_b.png")
rock = load(f"{A}/rock.png");     inputs["rock.png"] = sha(f"{A}/rock.png")
clip = stack([
    strip(scale(rock.copy(), 1.05), 0, 9),  # rocky crest
    scale(strip(criff.copy(), 0, 3), 1.3),  # bright brow
    scale(strip(criff.copy(), 0, 4), 0.5),  # dark under-lip band
])
assert clip.size == (32, 16), clip.size
clip.save(f"{A}/climb_lip.png")

# ── falls_crest.png (32x16) ────────────────────────────────────
water = load(f"{A}/water.png"); inputs["water.png"] = sha(f"{A}/water.png")
foam = load(f"{B}/foam.png");   inputs["foam.png"] = sha(f"{B}/foam.png")
foam32 = foam.resize((32, 32))
crest = stack([
    strip(water, 0, 10),        # the upper pool reaching the edge
    strip(foam32, 8, 14),       # the foam line where it tips over
])
assert crest.size == (32, 16), crest.size
crest.save(f"{A}/falls_crest.png")

print("inputs:", inputs)
for n in ["ledge_lip.png", "climb_lip.png", "falls_crest.png"]:
    print(n, sha(f"{A}/{n}"))
