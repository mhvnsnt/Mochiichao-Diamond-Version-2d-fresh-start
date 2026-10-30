#!/usr/bin/env python3
"""Episode Foundry — local gate (per-clip grading).

Grades ONE generated clip against the finish-gate standards of record.
This module does not invent parallel math where a measurer already
exists; it reuses, with attribution:

  * FRAME1 — the finish-gate ``frame1_anchor`` measurer, copied from
    ``~/workspace/ep01-rebuild/finish-gate/verify`` (``m_frame1_anchor``):
    frame 1 and the reference are both resized to 256x256 RGB (the
    reference alpha-composited over white) and compared by mean
    absolute pixel difference. Threshold ``max_mad = 40.0`` comes from
    ``finish-gate/targets/vace-attempt3.json`` clause AC-02 (and
    ``finish-gate/gates/thresholds.json`` [frame1_anchor], calibrated
    against the known 'reference never anchored' failure at MAD 50.96).
    Above threshold = FAIL, class ``reference never anchored``.

  * LIKENESS_SAMPLE — the likeness comparison from
    ``avatar-tool-build/corrective-pass/locked-run/job/likeness_gate.py``
    (``align_to_canvas`` / ``ssim_map`` / masked MAD + silhouette IoU),
    as driven by that folder's ``frame1_gate.py`` over frames
    {first, mid, last}. Thresholds are the standing ones stated in both
    files: SSIM >= 0.50, silhouette IoU >= 0.55, RGB MAD <= 40.0 (the
    MAD bound is the same 40.0 as the vace-attempt3 target record).
    Fail classes follow frame1_gate.py: frame 1 failing =
    ``reference-never-anchored``; frame 1 passing but a later sampled
    frame failing = ``drift``.

  * BG_PERSIST — the finish-gate ``bg_presence`` measurer, copied from
    ``finish-gate/verify`` (``m_bg_presence``) with its thresholds from
    ``gates/thresholds.json`` [white_frame]: frames scaled to 160x90, a
    pixel is near-white when min(R,G,B) > 245, a frame is a white frame
    when > 0.98 of its pixels are near-white. The vace-attempt3 target
    (AC-03) allows ``max_white_frames = 0``. Any unwhitelisted white
    frame = FAIL, class ``background disappeared``. (A cut whose
    background is white BY DESIGN — e.g. the VACE proof's plain white
    field, where the character still occupies > 2% of the frame — does
    not trip this: the character's pixels are not near-white. A caller
    may whitelist a genuinely all-white design via
    ``allow_white_background=True``, which is recorded in the packet.)

  * MOTION — mean frame-difference floor. The finish-gate has NO
    direct frame-difference measurer (its bg_life tool measures
    affine-compensated background residual, a different quantity), so
    this floor is a Foundry default, stated here and NOT attributed to
    the finish-gate: ``MOTION_FLOOR_MAD = 1.0`` (mean absolute RGB
    difference, 0-255 scale, averaged over consecutive sampled frame
    pairs; up to 12 frames sampled evenly, first and last included).
    At or below the floor = FAIL, class ``slideshow still``. Tune via
    ``--motion-floor``; the value used is recorded in every packet.

Frame-1 vs likeness references (Foundry addendum, frame-chaining):
FRAME1 is always measured against the reference ACTUALLY FED to the
generator (``fed_reference`` — a canon still, or a chained last frame
of the previous cut). LIKENESS_SAMPLE is measured against the CANON
reference (``canon_reference``) whenever one is supplied, so chaining
never relaxes the likeness clauses. When no separate canon reference
is supplied, both use the fed reference.

Output: a per-cut gate record JSON
``{cut_id, clauses: {FRAME1|LIKENESS_SAMPLE|MOTION|BG_PERSIST:
{status, measured, threshold, fail_class?}}, verdict, fail_classes}``.

Exit codes (CLI): 0 = PASS, 2 = FAIL, 3 = cannot measure.

Scratch frames are written next to the output record (never /tmp —
this VM's /tmp is a small tmpfs; see the workspace /tmp pinch rule).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

# --- thresholds: finish-gate targets/vace-attempt3.json + gates/thresholds.json
FRAME1_MAX_MAD = 40.0          # AC-02 frame1_anchor max_mad
FRAME1_RESIZE = 256            # gates/thresholds.json [frame1_anchor] resize
# --- thresholds: likeness_gate.py / frame1_gate.py standing values
SSIM_MIN = 0.50
IOU_MIN = 0.55
RGB_MAD_MAX = 40.0
WHITE_DIST_FG = 16.0           # likeness_gate WHITE_DIST_FG
CANVAS = 512                   # likeness_gate alignment canvas
FIT = 448                      # likeness_gate fit box
# --- thresholds: finish-gate bg_presence (verify m_bg_presence + thresholds)
BG_PIXEL_NEAR_WHITE = 245      # gates/thresholds.json [white_frame]
BG_WHITE_PIXEL_FRACTION = 0.98
BG_MAX_WHITE_FRAMES = 0        # vace-attempt3 AC-03 max_white_frames
# --- Foundry default (NOT a finish-gate number; see module docstring)
MOTION_FLOOR_MAD = 1.0
MOTION_SAMPLE_FRAMES = 12

SCHEMA = "mochiichao/episode-foundry-gate/v1"


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def probe_video(path: Path) -> dict:
    """ffprobe spec — same fields as finish-gate m_ffprobe_spec reads."""
    cmd = ["ffprobe", "-v", "error", "-select_streams", "v:0",
           "-show_entries", "stream=width,height,avg_frame_rate,nb_frames,duration",
           "-show_entries", "format=duration", "-of", "json", str(path)]
    r = _run(cmd)
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}: {r.stderr.strip()[:300]}")
    d = json.loads(r.stdout)
    st = d["streams"][0]
    num, den = st["avg_frame_rate"].split("/")
    fps = float(num) / float(den) if float(den) else 0.0
    if st.get("nb_frames") and int(st["nb_frames"]) > 0:
        n = int(st["nb_frames"])
    elif st.get("duration") and fps:
        n = int(round(float(st["duration"]) * fps))
    elif d.get("format", {}).get("duration") and fps:
        n = int(round(float(d["format"]["duration"]) * fps))
    else:
        raise RuntimeError(f"cannot determine frame count for {path}")
    dur = float(d.get("format", {}).get("duration") or (n / fps if fps else 0.0))
    return {"width": int(st["width"]), "height": int(st["height"]),
            "fps": fps, "frames": n, "duration_s": dur}


def extract_frame(clip: Path, index: int, dest: Path) -> np.ndarray:
    """Decode one frame to an HxWx3 uint8 array (ffmpeg select, as in
    likeness_gate.decode_frame / frame1_gate.decode_frame)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = _run(["ffmpeg", "-y", "-v", "error", "-i", str(clip),
              "-vf", f"select='eq(n\\,{index})'", "-frames:v", "1", str(dest)])
    if r.returncode != 0 or not dest.exists():
        raise RuntimeError(f"frame {index} decode failed: {r.stderr.strip()[:300]}")
    return np.asarray(Image.open(dest).convert("RGB"))


def load_reference_rgba(path: Path) -> Image.Image:
    if not Path(path).is_file():
        raise RuntimeError(f"reference not found: {path}")
    return Image.open(path).convert("RGBA")


def reference_over_white(ref_rgba: Image.Image) -> np.ndarray:
    """Alpha-composite a reference over white (finish-gate m_frame1_anchor
    does exactly this before resizing)."""
    bg = Image.new("RGBA", ref_rgba.size, (255, 255, 255, 255))
    return np.asarray(Image.alpha_composite(bg, ref_rgba).convert("RGB"))


# --------------------------------------------------------------------------
# Copied with attribution from likeness_gate.py (avatar-tool-build
# corrective-pass/locked-run/job/): white_distance, align_to_canvas, ssim_map.
# Only change: ssim uses scipy.ndimage when available (as the original does).
# --------------------------------------------------------------------------

def white_distance(img: np.ndarray) -> np.ndarray:
    img = img.astype(np.float32)
    return np.sqrt(((255.0 - img) ** 2).sum(axis=2) / 3.0)


def align_to_canvas(rgb: np.ndarray, mask: np.ndarray):
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise RuntimeError("empty foreground mask")
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    bw, bh = x1 - x0 + 1, y1 - y0 + 1
    scale = FIT / max(bw, bh)
    nw, nh = max(1, round(bw * scale)), max(1, round(bh * scale))
    rgb_crop = Image.fromarray(rgb[y0:y1 + 1, x0:x1 + 1].astype(np.uint8))
    msk_crop = Image.fromarray((mask[y0:y1 + 1, x0:x1 + 1] * 255).astype(np.uint8))
    rgb_r = rgb_crop.resize((nw, nh), Image.BILINEAR)
    msk_r = msk_crop.resize((nw, nh), Image.BILINEAR)
    canvas_rgb = np.full((CANVAS, CANVAS, 3), 255, dtype=np.uint8)
    canvas_msk = np.zeros((CANVAS, CANVAS), dtype=np.uint8)
    ox, oy = (CANVAS - nw) // 2, (CANVAS - nh) // 2
    canvas_rgb[oy:oy + nh, ox:ox + nw] = np.asarray(rgb_r)
    canvas_msk[oy:oy + nh, ox:ox + nw] = np.asarray(msk_r)
    return canvas_rgb.astype(np.float32), canvas_msk > 127, scale


def ssim_map(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    from scipy import ndimage
    C1, C2 = 0.01 ** 2, 0.03 ** 2
    mu_x = ndimage.gaussian_filter(x, 1.5)
    mu_y = ndimage.gaussian_filter(y, 1.5)
    s_x = ndimage.gaussian_filter(x * x, 1.5) - mu_x ** 2
    s_y = ndimage.gaussian_filter(y * y, 1.5) - mu_y ** 2
    s_xy = ndimage.gaussian_filter(x * y, 1.5) - mu_x * mu_y
    num = (2 * mu_x * mu_y + C1) * (2 * s_xy + C2)
    den = (mu_x ** 2 + mu_y ** 2 + C1) * (s_x + s_y + C2)
    return num / den


def compare_frame_to_reference(frame_rgb: np.ndarray,
                               ref_rgba: Image.Image) -> dict:
    """likeness_gate.measure math for one in-memory frame vs a reference
    image. Reference mask: alpha > 0.5 when the reference carries real
    alpha (canon cutout); otherwise the white-distance foreground mask
    (frame1_gate.py's fed-reference path for white-field prep frames)."""
    ref_rgb = reference_over_white(ref_rgba)
    alpha = np.asarray(ref_rgba)[..., 3]
    if int((alpha < 250).sum()) > 0:
        ref_mask = alpha > 127
    else:
        ref_mask = white_distance(ref_rgb) >= WHITE_DIST_FG
    frame_mask = white_distance(frame_rgb) >= WHITE_DIST_FG
    f_rgb, f_msk, _ = align_to_canvas(frame_rgb, frame_mask)
    r_rgb, r_msk, _ = align_to_canvas(ref_rgb, ref_mask)
    union = f_msk | r_msk
    inter = f_msk & r_msk
    if int(union.sum()) == 0:
        raise RuntimeError("empty union silhouette")
    iou = float(inter.sum() / union.sum())
    smap = ssim_map(f_rgb.mean(axis=2) / 255.0, r_rgb.mean(axis=2) / 255.0)
    ssim = float(smap[union].mean())
    mad = float(np.abs(f_rgb - r_rgb)[union].mean())
    measurements = {"ssim_union": round(ssim, 4),
                    "silhouette_iou": round(iou, 4),
                    "rgb_mad_255": round(mad, 3)}
    checks = {"ssim": ssim >= SSIM_MIN, "silhouette_iou": iou >= IOU_MIN,
              "rgb_mad": mad <= RGB_MAD_MAX}
    return {"measurements": measurements, "checks": checks,
            "verdict": "PASS" if all(checks.values()) else "FAIL"}


def frame1_mad(frame_rgb: np.ndarray, ref_rgba: Image.Image) -> float:
    """finish-gate m_frame1_anchor math: both sides resized to
    FRAME1_RESIZE x FRAME1_RESIZE RGB, plain mean abs difference."""
    a = np.asarray(Image.fromarray(frame_rgb).resize(
        (FRAME1_RESIZE, FRAME1_RESIZE))).astype(float)
    b = np.asarray(Image.fromarray(reference_over_white(ref_rgba)).resize(
        (FRAME1_RESIZE, FRAME1_RESIZE))).astype(float)
    return float(np.abs(a - b).mean())


def bg_white_frames(clip: Path, scratch: Path) -> tuple[int, int]:
    """finish-gate m_bg_presence: extract every frame at 160x90, count
    frames whose near-white pixel fraction exceeds the threshold."""
    frames_dir = scratch / "bgframes"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for old in frames_dir.glob("f*.png"):
        old.unlink()
    r = _run(["ffmpeg", "-v", "error", "-y", "-i", str(clip),
              "-vf", "scale=160:90", str(frames_dir / "f%04d.png")])
    if r.returncode != 0:
        raise RuntimeError(f"bg frame extract failed: {r.stderr.strip()[:300]}")
    files = sorted(frames_dir.glob("f*.png"))
    if not files:
        raise RuntimeError("no frames extracted for bg_presence")
    white = 0
    for fp in files:
        a = np.asarray(Image.open(fp).convert("RGB")).astype(int)
        frac = float((a.min(axis=2) > BG_PIXEL_NEAR_WHITE).mean())
        if frac > BG_WHITE_PIXEL_FRACTION:
            white += 1
    return white, len(files)


def motion_mean_diff(clip: Path, spec: dict, scratch: Path) -> dict:
    n = spec["frames"]
    k = min(MOTION_SAMPLE_FRAMES, n)
    idx = sorted({round(i * (n - 1) / (k - 1)) for i in range(k)}) if k > 1 else [0]
    frames = [extract_frame(clip, i, scratch / f"motion_{i}.png").astype(np.float32)
              for i in idx]
    diffs = [float(np.abs(frames[i + 1] - frames[i]).mean())
             for i in range(len(frames) - 1)]
    return {"sampled_indices": idx,
            "pair_diffs": [round(d, 4) for d in diffs],
            "mean_frame_diff_mad": round(float(np.mean(diffs)) if diffs else 0.0, 4)}


# --------------------------------------------------------------------------

def grade_clip(clip, fed_reference, canon_reference=None, cut_id=None,
               motion_floor=MOTION_FLOOR_MAD, max_white_frames=BG_MAX_WHITE_FRAMES,
               allow_white_background=False, scratch_dir=None,
               reference_source=None, road=None, gpu_seconds=None) -> dict:
    """Grade one clip; returns the gate record dict (also see CLI)."""
    clip, fed_reference = Path(clip), Path(fed_reference)
    canon_reference = Path(canon_reference) if canon_reference else fed_reference
    cut_id = cut_id or clip.stem
    scratch = Path(scratch_dir) if scratch_dir else clip.parent / f".gate-scratch-{cut_id}"
    scratch.mkdir(parents=True, exist_ok=True)
    record: dict = {
        "schema": SCHEMA, "cut_id": cut_id,
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "clip": str(clip),
        "reference_fed": {"path": str(fed_reference),
                          "sha256": sha256_of(fed_reference) if fed_reference.is_file() else None},
        "reference_canon": {"path": str(canon_reference),
                            "sha256": sha256_of(canon_reference) if canon_reference.is_file() else None},
        "reference_source": reference_source or "canon",
        "road": road,
        "gpu_seconds": gpu_seconds,
        "clauses": {},
    }
    clauses = record["clauses"]
    try:
        if not clip.is_file():
            raise RuntimeError(f"clip not found: {clip}")
        record["clip_sha256"] = sha256_of(clip)
        spec = probe_video(clip)
        record["clip_spec"] = spec
        fed_rgba = load_reference_rgba(fed_reference)
        canon_rgba = load_reference_rgba(canon_reference)
        n = spec["frames"]
        sampled = sorted({0, max(0, n // 2), n - 1})

        # FRAME1 — against the FED reference (chaining never relaxes it).
        f0 = extract_frame(clip, 0, scratch / "frame_first.png")
        mad1 = frame1_mad(f0, fed_rgba)
        ok1 = mad1 <= FRAME1_MAX_MAD
        clauses["FRAME1"] = {
            "status": "PASS" if ok1 else "FAIL",
            "measured": {"frame1_mad_255": round(mad1, 3)},
            "threshold": {"max_mad": FRAME1_MAX_MAD, "resize": FRAME1_RESIZE,
                          "source": "finish-gate targets/vace-attempt3.json AC-02"},
            **({} if ok1 else {"fail_class": "reference never anchored"}),
        }

        # LIKENESS_SAMPLE — against the CANON reference.
        per_frame = {}
        for i in sampled:
            frame = f0 if i == 0 else extract_frame(
                clip, i, scratch / f"likeness_{i}.png")
            try:
                per_frame[str(i)] = compare_frame_to_reference(frame, canon_rgba)
            except Exception as e:  # noqa: BLE001 — a frame that cannot be
                per_frame[str(i)] = {"measurements": None,  # measured fails
                                     "checks": None, "verdict": "FAIL",
                                     "error": f"{type(e).__name__}: {e}"}
        lik_ok = all(v["verdict"] == "PASS" for v in per_frame.values())
        lik = {"status": "PASS" if lik_ok else "FAIL",
               "measured": {"frames": per_frame, "sampled_indices": sampled},
               "threshold": {"ssim_min": SSIM_MIN, "silhouette_iou_min": IOU_MIN,
                             "rgb_mad_255_max": RGB_MAD_MAX,
                             "source": "likeness_gate.py / frame1_gate.py standing thresholds"}}
        if not lik_ok:
            lik["fail_class"] = ("reference-never-anchored"
                                 if per_frame[str(0)]["verdict"] != "PASS" else "drift")
        clauses["LIKENESS_SAMPLE"] = lik

        # MOTION — Foundry floor (see docstring; not a finish-gate number).
        mot = motion_mean_diff(clip, spec, scratch)
        mot_ok = mot["mean_frame_diff_mad"] > motion_floor
        clauses["MOTION"] = {
            "status": "PASS" if mot_ok else "FAIL",
            "measured": mot,
            "threshold": {"min_mean_frame_diff_mad": motion_floor,
                          "source": "Foundry default MOTION_FLOOR_MAD (no finish-gate equivalent)"},
            **({} if mot_ok else {"fail_class": "slideshow still"}),
        }

        # BG_PERSIST — finish-gate bg_presence, vace target allowance.
        white, total = bg_white_frames(clip, scratch)
        bg_ok = allow_white_background or white <= max_white_frames
        clauses["BG_PERSIST"] = {
            "status": "PASS" if bg_ok else "FAIL",
            "measured": {"white_frames": white, "frames_sampled": total,
                         "white_frame_fraction": round(white / total, 4) if total else 0.0},
            "threshold": {"max_white_frames": max_white_frames,
                          "pixel_near_white": BG_PIXEL_NEAR_WHITE,
                          "white_pixel_fraction": BG_WHITE_PIXEL_FRACTION,
                          "whitelisted_white_background": allow_white_background,
                          "source": "finish-gate verify m_bg_presence + targets/vace-attempt3.json AC-03"},
            **({} if bg_ok else {"fail_class": "background disappeared"}),
        }
    except Exception as e:  # noqa: BLE001 — cannot measure is a FAIL, never a pass
        record["error"] = f"{type(e).__name__}: {e}"
        record["verdict"] = "FAIL"
        record["fail_classes"] = ["fail-cannot-measure"]
        return record

    record["fail_classes"] = [c["fail_class"] for c in clauses.values()
                              if c["status"] != "PASS" and "fail_class" in c]
    record["verdict"] = ("PASS" if all(c["status"] == "PASS" for c in clauses.values())
                         else "FAIL")
    return record


def grade_image(image, canon_reference, cut_id=None) -> dict:
    """Likeness-only grading for a single keyframe image (SDXL feed).
    Same comparison + thresholds as the LIKENESS_SAMPLE clause."""
    image, canon_reference = Path(image), Path(canon_reference)
    record: dict = {"schema": SCHEMA, "cut_id": cut_id or image.stem,
                    "kind": "keyframe_image", "image": str(image),
                    "reference_canon": {"path": str(canon_reference),
                                        "sha256": sha256_of(canon_reference)
                                        if canon_reference.is_file() else None},
                    "clauses": {}}
    try:
        if not image.is_file():
            raise RuntimeError(f"image not found: {image}")
        record["image_sha256"] = sha256_of(image)
        frame = np.asarray(Image.open(image).convert("RGB"))
        result = compare_frame_to_reference(frame, load_reference_rgba(canon_reference))
        ok = result["verdict"] == "PASS"
        record["clauses"]["LIKENESS_SAMPLE"] = {
            "status": result["verdict"], "measured": result,
            "threshold": {"ssim_min": SSIM_MIN, "silhouette_iou_min": IOU_MIN,
                          "rgb_mad_255_max": RGB_MAD_MAX}}
        record["verdict"] = "PASS" if ok else "FAIL"
        record["fail_classes"] = [] if ok else ["likeness"]
    except Exception as e:  # noqa: BLE001
        record["error"] = f"{type(e).__name__}: {e}"
        record["verdict"] = "FAIL"
        record["fail_classes"] = ["fail-cannot-measure"]
    return record


def main() -> int:
    ap = argparse.ArgumentParser(description="Episode Foundry gate — grade one clip.")
    ap.add_argument("--clip", required=True)
    ap.add_argument("--reference", required=True,
                    help="the reference ACTUALLY FED to the generator (frame-1 is graded against this)")
    ap.add_argument("--canon-reference",
                    help="canon reference for the likeness clauses (default: --reference)")
    ap.add_argument("--cut-id")
    ap.add_argument("--reference-source", default="canon",
                    help="'canon' or 'chained:<prev_cut_id>' (recorded, never relaxes a clause)")
    ap.add_argument("--road")
    ap.add_argument("--gpu-seconds", type=float)
    ap.add_argument("--motion-floor", type=float, default=MOTION_FLOOR_MAD)
    ap.add_argument("--max-white-frames", type=int, default=BG_MAX_WHITE_FRAMES)
    ap.add_argument("--allow-white-background", action="store_true")
    ap.add_argument("--scratch")
    ap.add_argument("--out", required=True, help="gate record JSON path")
    args = ap.parse_args()

    record = grade_clip(args.clip, args.reference, args.canon_reference,
                        cut_id=args.cut_id, motion_floor=args.motion_floor,
                        max_white_frames=args.max_white_frames,
                        allow_white_background=args.allow_white_background,
                        scratch_dir=args.scratch,
                        reference_source=args.reference_source,
                        road=args.road, gpu_seconds=args.gpu_seconds)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(record, indent=2) + "\n")
    print(f"gate record: {out}")
    print(f"verdict: {record['verdict']}  fail_classes: {record.get('fail_classes')}")
    for name, c in record["clauses"].items():
        print(f"  {name:16s} {c['status']:4s}  {json.dumps(c['measured'])[:180]}")
    if record.get("error"):
        print(f"error: {record['error']}")
        return 3
    return 0 if record["verdict"] == "PASS" else 2


if __name__ == "__main__":
    sys.exit(main())
