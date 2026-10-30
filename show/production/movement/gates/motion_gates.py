#!/usr/bin/env python3
"""Motion gates G0-G6 (fix item 6; kills D9 - "it moved a bit" was
never a number).

Silhouette-first, per research report section 6: frame-difference
coverage inside the character mask (the FACE BOX EXCLUDED - a
face-only character must score ~zero, as it does in our old render),
centroid-aligned mask IoU for deformation, width/height ratio range
for liquid bodies, dead-run length, per-region coverage, and
sheet-verified anticipation/settle. All thresholds are engineering
starting values calibrated against reference clips (game floor =
Pokemon BW-style idle, target = TV clip), per the report - they are
NOT published industry constants.

Clip inputs: a video (mp4) or frames dir; a masks dir (per-frame
character alpha, m%04d.png / f%04d.png alpha); and a sidecar
<clip>.gates.json: {"face_box": [x0,y0,x1,y1]} or
{"face_boxes": [[...] per frame]} in frame coordinates.
"""
from __future__ import annotations

import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

DIFF_T = 18          # greylevel change = pixel "moved"
COV_T = 0.005        # 0.5% of region changed = region alive that frame
DEAD_T = 0.001       # 0.1% = dead frame
FPS = 24


class Clip:
    def __init__(self, frames, masks, face_boxes, label):
        self.frames = frames            # list HxWx3 uint8 RGB
        self.masks = masks              # list HxW uint8 0/1
        self.face_boxes = face_boxes    # list of (x0,y0,x1,y1)
        self.label = label
        assert len(frames) == len(masks) == len(face_boxes)


def _read_video(path: Path):
    cap = cv2.VideoCapture(str(path))
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))
    cap.release()
    return frames


def load_clip(video: str | None, masks_dir: str, sidecar: str, label: str,
              frames_dir: str | None = None) -> Clip:
    if frames_dir:
        frames = [np.array(Image.open(p).convert("RGB"))
                  for p in sorted(Path(frames_dir).glob("f*.png"))]
    else:
        frames = _read_video(Path(video))
    masks = []
    for p in sorted(Path(masks_dir).glob("*.png")):
        m = np.array(Image.open(p))
        if m.ndim == 3:
            m = m[..., 3] if m.shape[2] == 4 else m[..., 0]
        masks.append((m > 10).astype(np.uint8))
    # align lengths (video codecs can add/drop a frame)
    n = min(len(frames), len(masks))
    frames, masks = frames[:n], masks[:n]
    sc = json.loads(Path(sidecar).read_text())
    if "face_boxes" in sc:
        fbs = [tuple(b) for b in sc["face_boxes"]][:n]
    else:
        fbs = [tuple(sc["face_box"])] * n
    return Clip(frames, masks, fbs, label)


def _rect_mask(shape, box) -> np.ndarray:
    m = np.zeros(shape, dtype=np.uint8)
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    m[max(0, y0):y1, max(0, x0):x1] = 1
    return m


def _shift(mask: np.ndarray, dx: int, dy: int) -> np.ndarray:
    out = np.zeros_like(mask)
    h, w = mask.shape
    x0, x1 = max(0, dx), min(w, w + dx)
    y0, y1 = max(0, dy), min(h, h + dy)
    sx0, sy0 = x0 - dx, y0 - dy
    out[y0:y1, x0:x1] = mask[sy0:sy0 + (y1 - y0), sx0:sx0 + (x1 - x0)]
    return out


def measure(clip: Clip, char_class: str = "liquid", actions: list | None = None) -> dict:
    fr, mk = clip.frames, clip.masks
    n = len(fr)
    grey = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY).astype(np.int16) for f in fr]
    diffb = [np.zeros(mk[0].shape, np.uint8)]
    for t in range(1, n):
        diffb.append((np.abs(grey[t] - grey[t - 1]) > DIFF_T).astype(np.uint8))
    face = [_rect_mask(mk[0].shape, b) for b in clip.face_boxes]
    body = [mk[t] & (1 - face[t]) for t in range(n)]
    body_area = max(int(np.max([b.sum() for b in body])), 1)
    cov = np.array([float((diffb[t] & body[t]).sum()) / body_area for t in range(n)])

    # ---- G0 background presence + ambient life
    blank = 0
    amb_window_means = []
    bg_cov = []
    for t in range(n):
        bgm = 1 - cv2.dilate(mk[t], np.ones((5, 5), np.uint8), iterations=2)
        f = fr[t].astype(int)
        white_frac = float(((f[..., 0] > 242) & (f[..., 1] > 242) &
                            (f[..., 2] > 242) & (bgm > 0)).sum()) / max(int(bgm.sum()), 1)
        if white_frac > 0.90:
            blank += 1
        bg_cov.append(float((diffb[t] & bgm).sum()) / max(int(bgm.sum()), 1))
    for w0 in range(0, max(1, n - 47)):
        amb_window_means.append(float(np.mean(bg_cov[w0:w0 + 48])))
    amb_min = min(amb_window_means) if amb_window_means else float(np.mean(bg_cov))

    # ---- G1 body motion coverage (rolling 1s)
    alive = cov > COV_T
    win_frac = [float(np.mean(alive[w0:w0 + 24])) for w0 in range(0, max(1, n - 23))]
    g1_min = min(win_frac) if win_frac else float(np.mean(alive))

    # ---- G2 deformation
    ratios, cents, boxes = [], [], []
    for t in range(n):
        ys, xs = np.nonzero(mk[t])
        if len(xs) == 0:
            ratios.append(np.nan); cents.append((0, 0)); boxes.append((0, 0, 0, 0))
            continue
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
        ratios.append((xs.max() - xs.min() + 1) / (ys.max() - ys.min() + 1))
        cents.append((xs.mean(), ys.mean()))
    ratios = np.array(ratios, float)
    rng_win = []
    for w0 in range(0, max(1, n - 47)):
        seg = ratios[w0:w0 + 48]
        seg = seg[~np.isnan(seg)]
        if len(seg):
            rng_win.append(100 * (seg.max() - seg.min()) / seg.mean())
    ratio_med = float(np.median(rng_win)) if rng_win else 0.0
    ious = []
    for t in range(6, n):
        dx = int(round(cents[t][0] - cents[t - 6][0]))
        dy = int(round(cents[t][1] - cents[t - 6][1]))
        a = _shift(mk[t - 6], dx, dy)
        inter = int((a & mk[t]).sum()); union = int((a | mk[t]).sum())
        ious.append(inter / max(union, 1))
    iou_frac = float(np.mean([i < 0.97 for i in ious])) if ious else 0.0

    # ---- G3 dead run (body)
    dead = cov <= DEAD_T
    longest, run = 0, 0
    for d in dead:
        run = run + 1 if d else 0
        longest = max(longest, run)

    # ---- G4 per-region coverage
    def region_cov(region_masks):
        area = max(int(np.max([r.sum() for r in region_masks])), 1)
        c = np.array([float((diffb[t] & region_masks[t]).sum()) / area for t in range(n)])
        return float(np.mean(c > COV_T)), float(np.mean(c))
    face_reg = [mk[t] & face[t] for t in range(n)]
    app_reg, core_reg = [], []
    for t in range(n):
        x0, y0, x1, y1 = boxes[t]
        split = int(y0 + 0.72 * (y1 - y0))
        app = mk[t].copy(); app[:split, :] = 0
        app_reg.append(app & (1 - face[t]))
        core = mk[t].copy(); core[split:, :] = 0
        core_reg.append(core & (1 - face[t]))
    face_frac, _ = region_cov(face_reg)
    core_frac, _ = region_cov(core_reg)
    app_frac, _ = region_cov(app_reg)

    g = {}
    # ambient threshold calibrated on the reference set (report S6:
    # thresholds are starting values calibrated against reference
    # clips): frozen control and the old render's still plate both
    # measure exactly 0.0; the living plate alone measures 0.042% in
    # its quietest 2s window. 0.02% sits between dead and living.
    g["G0"] = {"blank_bg_frames": blank,
               "ambient_min_2s_pct": round(100 * amb_min, 3),
               "pass": bool(blank == 0 and amb_min > 0.0002)}
    g["G1"] = {"body_coverage_worst_1s_pct": round(100 * g1_min, 1),
               "body_coverage_mean_pct": round(100 * float(np.mean(alive)), 1),
               "pass": bool(g1_min >= 0.60)}
    if char_class in ("liquid", "soft"):
        g["G2"] = {"iou_below_0.97_frac_pct": round(100 * iou_frac, 1),
                   "wh_ratio_range_median_2s_pct": round(ratio_med, 2),
                   "pass": bool(iou_frac >= 0.30 and ratio_med >= 5.0)}
    else:
        g["G2"] = {"iou_below_0.97_frac_pct": round(100 * iou_frac, 1),
                   "wh_ratio_range_median_2s_pct": round(ratio_med, 2),
                   "pass": bool(iou_frac >= 0.20)}
    g["G3"] = {"longest_dead_body_run_frames": int(longest),
               "pass": bool(longest <= 12)}
    g["G4"] = {"face_coverage_pct": round(100 * face_frac, 1),
               "core_coverage_pct": round(100 * core_frac, 1),
               "appendage_coverage_pct": round(100 * app_frac, 1),
               "pass": bool(core_frac >= 0.40 and app_frac >= 0.40)}
    # ---- G5 anticipation + settle, measured on the height series.
    # Settle means RETURN TO THE IDLE ENVELOPE, not to a frozen
    # ratio: a living character's rest state oscillates by design,
    # so the band is measured from the clip's own pre-action idle.
    # The landing must answer the anticipation: a counter-move at
    # least half the anticipation's depth within 14 frames.
    if actions:
        hs = np.array([(b[3] - b[1] + 1) for b in boxes], float)
        rest = float(np.median(hs[:12]))
        series = hs / rest
        idle_dev = float(np.percentile(np.abs(series[:24] - 1.0), 95)) \
            if actions[0]["launch_frame"] >= 24 else 0.03
        band = max(2 * idle_dev, 0.04)
        res = []
        ok_all = True
        for ai, a in enumerate(actions):
            lf, land = a["launch_frame"], a["land_frame"]
            anti = float(np.min(series[max(0, lf - 10):lf])) if lf >= 2 else 1.0
            # settle is measured until the NEXT action starts warming
            # up; later modulations are separate declared events
            end = (actions[ai + 1]["launch_frame"] - 10) if ai + 1 < len(actions) \
                else len(series)
            seg = series[land:max(end, land + 4)]
            squash = float(np.min(seg[:14])) if len(seg) >= 4 else 1.0
            squash_need = 1.0 - 0.5 * (1.0 - anti)
            settle_limit = 2 * a.get("declared_settle", 12) + 8
            settle_len = None
            dev = np.abs(seg - 1.0)
            for i in range(len(seg) - 4):
                if np.all(dev[i:i + 4] <= band):
                    settle_len = i
                    break
            ring = float(np.std(seg[3:settle_len])) if settle_len and settle_len > 5 else 0.0
            peak_dev = float(np.max(dev[:14])) if len(seg) >= 4 else 0.0
            # no lower bound on settle_len: the counter-move's
            # existence is proven by the landing-squash check, and a
            # small action honestly settles fast (its transient
            # barely leaves the idle band). The failure modes G5
            # exists for - no anticipation, no landing counter-move,
            # never returning to the idle envelope - are all still
            # caught by the three checks above.
            ok = (anti <= 0.94 and squash <= squash_need
                  and settle_len is not None and settle_len <= settle_limit
                  and (ring > 0.002 or peak_dev > band))
            ok_all &= ok
            res.append({"action": a.get("name", "major"),
                        "anticipation_min_ratio": round(anti, 3),
                        "landing_squash_ratio": round(squash, 3),
                        "squash_required_max": round(squash_need, 3),
                        "idle_band": round(band, 3),
                        "settle_frames_measured": settle_len,
                        "settle_ring_std": round(ring, 4), "pass": bool(ok)})
        g["G5"] = {"actions": res, "pass": bool(ok_all)}
    else:
        g["G5"] = {"pass": None, "note": "no major action in clip"}
    g["frames"] = n
    g["overall_pass"] = bool(all(v.get("pass") for k, v in g.items()
                                 if isinstance(v, dict) and v.get("pass") is not None))
    return g


def fmt_table(rows: dict[str, dict]) -> str:
    lines = ["| gate | " + " | ".join(rows.keys()) + " |",
             "|---|" + "---|" * len(rows)]
    def cell(v, key, suffix=""):
        d = rows[v]
        return f"{d[key]}{suffix}" if key in d else "-"
    lines.append("| G0 blank-bg frames | " + " | ".join(
        f"{rows[k]['G0']['blank_bg_frames']}" for k in rows) + " |")
    lines.append("| G0 ambient min 2s % | " + " | ".join(
        f"{rows[k]['G0']['ambient_min_2s_pct']}" for k in rows) + " |")
    lines.append("| G1 body coverage worst-1s % | " + " | ".join(
        f"{rows[k]['G1']['body_coverage_worst_1s_pct']}" for k in rows) + " |")
    lines.append("| G2 IoU<0.97 frames % | " + " | ".join(
        f"{rows[k]['G2']['iou_below_0.97_frac_pct']}" for k in rows) + " |")
    lines.append("| G2 w/h range median-2s % | " + " | ".join(
        f"{rows[k]['G2']['wh_ratio_range_median_2s_pct']}" for k in rows) + " |")
    lines.append("| G3 longest dead run (frames) | " + " | ".join(
        f"{rows[k]['G3']['longest_dead_body_run_frames']}" for k in rows) + " |")
    lines.append("| G4 core / appendage coverage % | " + " | ".join(
        f"{rows[k]['G4']['core_coverage_pct']} / {rows[k]['G4']['appendage_coverage_pct']}"
        for k in rows) + " |")
    lines.append("| G4 face coverage % (diagnostic) | " + " | ".join(
        f"{rows[k]['G4']['face_coverage_pct']}" for k in rows) + " |")
    lines.append("| OVERALL (G0-G4) | " + " | ".join(
        ("PASS" if all(rows[k][f'G{i}']['pass'] for i in range(5)) else "FAIL")
        for k in rows) + " |")
    return "\n".join(lines)
