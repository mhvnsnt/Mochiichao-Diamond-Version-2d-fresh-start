"""Surgical proof for the real-anime-movement report (shot C of V3-072).

What this proves, end to end, with the staged PIL/numpy + ffmpeg chain:
1. CLEAN PLATE: Whispkin's head/mask is rebuilt with the finger holes FILLED
   (white, the mask's own colour) instead of knocked out where the hands sat.
2. SEPARATE HANDS: the hands are independent sprites drawn from the dark
   pixels only; they are no longer cut out of the mask image.
3. TEETH LEFTOVER REMOVED: the body piece no longer carries a copy of the
   mask's teeth in the head-overlap band, so a head tilt cannot leave teeth
   sitting on the chest.
4. DEFORMATION, NOT RIGID ROTATION: the head is bent with a smooth mesh
   warp (lean increases toward the top) instead of one rigid rotate().
5. SMOKE AS SMOKE: the smoke trail is displaced on both axes with a smooth
   travelling wave, softened and alpha-pulsed, so it flows and dissolves
   instead of sliding as one rigid character-sheet crop.

This is a surgical proof for one shot, not the full redo. The full
shot-by-shot plan lives in ../REPORT.md.
Usage: python3 make_surgical_proof.py <repo_root> <outdir>
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FPS, W, H = 24, 1280, 720
src = Image.open(os.path.join(
    ROOT, 'show/production/tooling/avatar-stack/reference-packs/wispkin/front.png')).convert('RGBA')
sw, sh = src.size
plate = Image.open(os.path.join(
    ROOT, 'show/assets/backgrounds/pond/EP01-PLATE-pond-dusk-v0-spec-still.png')).convert('RGB')
world0 = plate.resize((2560, 1440), Image.LANCZOS)


def crop_mask(fn):
    m = Image.new('L', src.size, 0)
    fn(ImageDraw.Draw(m))
    p = src.copy()
    a = np.minimum(np.array(p)[..., 3], np.array(m))
    arr = np.array(p); arr[..., 3] = a
    return Image.fromarray(arr)


def dark_only(p):
    a = np.array(p).copy()
    lum = a[..., :3].astype(int).mean(-1)
    a[..., 3] = np.where(lum < 110, a[..., 3], 0)
    return Image.fromarray(a)


# --- separate hand sprites (drawn from dark pixels, as in the original) ---
handL = dark_only(crop_mask(lambda d: d.rectangle([0, 158, 78, 236], 255)))
handR = dark_only(crop_mask(lambda d: d.rectangle([212, 158, 288, 236], 255)))
hand_alpha = np.maximum(np.array(handL)[..., 3], np.array(handR)[..., 3])

# --- 1+3: clean head plate ---
head_full = crop_mask(lambda d: d.rectangle([40, 0, 250, 250], 255))
h = np.array(head_full).astype(int)
# fill the finger holes: where a hand was knocked out of the mask area,
# restore the mask's own white instead of leaving transparent holes.
# Gated to the mask's SOLID silhouette (alpha with interior holes filled):
# finger areas that stick out past the mask's edge stay transparent —
# filling them would paint white blobs onto the background.
from scipy import ndimage
solid = ndimage.binary_fill_holes(np.array(head_full)[..., 3] > 0)
holes = (hand_alpha > 0) & solid & (np.indices((sh, sw))[0] < 250)
h[holes] = [245, 242, 235, 255]
head_clean = Image.fromarray(h.astype(np.uint8))
# ORIGINAL head (for the before/after sheet): hands knocked out, holes left
_h = np.array(head_full)
_h[..., 3] = np.where(hand_alpha > 0, 0, _h[..., 3])
head_holed = Image.fromarray(_h)

# --- body with the teeth band removed ---
body_full = crop_mask(lambda d: d.rectangle([20, 200, 270, 330], 255))
b = np.array(body_full).copy()
# head-overlap band: erase ONLY the duplicated teeth (the bright pixels)
# and keep the body's own dark dome — erasing the whole band would cut
# the body's top off and open a gap at the neck (caught on proof v1).
band = b[:252]
# only pixels that are actually drawn (alpha>0): the rectangle crop also
# contains transparent surround whose RGB happens to be bright — painting
# those would fill the rectangle's corners opaque (caught on proof v3)
bright = (band[..., :3].astype(int).mean(-1) > 150) & (band[..., 3] > 0)
# repaint the teeth in the body's own near-black — erasing them would
# punch see-through holes in the body (caught on proof v2)
band[bright] = [8, 8, 10, 255]
b[:252] = band
body_clean = Image.fromarray(b)
smoke = crop_mask(lambda d: d.rectangle([0, 310, 288, 609], 255))


def mesh_bend(img, bend_px, phase=0.0):
    """Smooth horizontal bend: displacement grows toward the top of the
    part, with a gentle travelling ripple — a poor-man's plastic-tool warp."""
    a = np.array(img)
    out = np.zeros_like(a)
    hh, ww = a.shape[:2]
    for y in range(hh):
        t = 1.0 - y / max(hh - 1, 1)          # 1 at top, 0 at bottom
        k = int(round(bend_px * t * t + math.sin(y / 31.0 + phase) * 1.5 * t))
        out[y] = np.roll(a[y], k, axis=0)
    return Image.fromarray(out)


def flow_smoke(fidx):
    """Smoke displaced on BOTH axes by a travelling wave, softened, and
    alpha-pulsed — it churns and thins instead of sliding rigidly."""
    a = np.array(smoke).astype(np.float32)
    o = np.zeros_like(a)
    hh, ww = a.shape[:2]
    for y in range(310, hh):
        depth = (y - 310) / max(hh - 310, 1)
        kx = int(round(math.sin(y / 23.0 + fidx * 0.35) * 10 * depth))
        row = np.roll(a[y], kx, axis=0)
        o[y] = row
    img = Image.fromarray(np.clip(o, 0, 255).astype(np.uint8))
    img = img.filter(ImageFilter.GaussianBlur(1.2 + 0.6 * math.sin(fidx * 0.35)))
    al = np.array(img).astype(np.float32)
    al[..., 3] *= 0.82 + 0.18 * math.sin(fidx * 0.35 + 1.0)
    return Image.fromarray(np.clip(al, 0, 255).astype(np.uint8))


def ease(t):
    return t * t * (3 - 2 * t)


def paste_rot(canvas, part, rot, piv, off):
    r = part.rotate(rot, resample=Image.BICUBIC, center=piv, translate=off)
    canvas.alpha_composite(r)


def build_puppet(u, fidx, clean=True):
    """Shot C 'peek': head leans in, left hand lifts to the mask."""
    c = Image.new('RGBA', (sw, sh + 40), 0)
    c.alpha_composite(flow_smoke(fidx), (0, 0))
    sq = 1.0 + 0.04 * ease(u)
    bd = body_clean if clean else body_full
    bimg = bd.resize((sw, int(sh * sq)), Image.BICUBIC)
    c.alpha_composite(bimg, (0, int(330 - 330 * sq)))
    head = head_clean if clean else head_holed
    bend = -14 * ease(u)                       # lean grows through the shot
    himg = mesh_bend(head, bend, phase=fidx * 0.2)
    paste_rot(c, himg, -4 * ease(u), (145, 235), (0, int(-20 * ease(u))))
    # hands as separate sprites, travelling on an arc (not a straight lerp)
    lift = ease(u)
    lx = int(-10 * lift); ly = int(-34 * lift + 6 * math.sin(lift * math.pi))
    paste_rot(c, handL, 22 * lift, (60, 200), (lx, ly))
    paste_rot(c, handR, -6 * lift, (228, 200), (int(6 * lift), int(-4 * lift)))
    return c


def render(puppet_clean, outname, n=48):
    frames_dir = os.path.join(OUT, outname + '_frames')
    os.makedirs(frames_dir, exist_ok=True)
    for f in range(n):
        u = f / (n - 1)
        ua = (f // 2 * 2) / (n - 1)            # character on 2s, camera on 1s
        pz = build_puppet(ua, f // 2, clean=puppet_clean)
        sc = 0.42 * 1440 / sh
        pz = pz.resize((int(pz.width * sc), int(pz.height * sc)), Image.LANCZOS)
        world = world0.copy().convert('RGBA')
        cx, cy = 0.55 * 2560, 0.50 * 1440
        world.alpha_composite(pz, (int(cx - pz.width / 2), int(cy - pz.height * 0.35)))
        z = 2.8 + 1.4 * ease(u)                # shot C push-in
        vw, vh = 2560 / z, 1440 / z
        X = min(max(cx, vw / 2), 2560 - vw / 2); Y = min(max(cy, vh / 2), 1440 - vh / 2)
        crop = world.crop((int(X - vw / 2), int(Y - vh / 2), int(X + vw / 2), int(Y + vh / 2)))
        crop.convert('RGB').resize((W, H), Image.LANCZOS).save(
            os.path.join(frames_dir, f'{f:04d}.png'))
    seg = os.path.join(OUT, outname + '.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-framerate', str(FPS), '-i',
                    os.path.join(frames_dir, '%04d.png'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '18', seg], check=True)
    return seg


after = render(True, 'shotC-surgical-proof-v1')
before = render(False, 'shotC-original-parts-v1')

# before/after sheet: same mid-shot moment, original parts vs clean parts
def grab(mp4_frames, idx):
    return Image.open(os.path.join(OUT, mp4_frames, f'{idx:04d}.png'))
sheet = Image.new('RGB', (W, H), (10, 10, 14))
sheet.paste(grab('shotC-original-parts-v1_frames', 36).resize((W // 2, H // 2)), (0, 0))
sheet.paste(grab('shotC-surgical-proof-v1_frames', 36).resize((W // 2, H // 2)), (W // 2, 0))
sheet.paste(grab('shotC-original-parts-v1_frames', 47).resize((W // 2, H // 2)), (0, H // 2))
sheet.paste(grab('shotC-surgical-proof-v1_frames', 47).resize((W // 2, H // 2)), (W // 2, H // 2))
d = ImageDraw.Draw(sheet)
d.text((12, 10), 'BEFORE: holed mask + teeth copy on body', fill=(255, 120, 120))
d.text((W // 2 + 12, 10), 'AFTER: clean plate + separate hands + bent head', fill=(140, 255, 160))
d.text((12, H // 2 + 10), 'BEFORE (final frame)', fill=(255, 120, 120))
d.text((W // 2 + 12, H // 2 + 10), 'AFTER (final frame)', fill=(140, 255, 160))
sheet.save(os.path.join(OUT, 'surgical-before-after.png'))
print('done', after, before)
