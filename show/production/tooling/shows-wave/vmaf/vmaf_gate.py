#!/usr/bin/env python3
"""VMAF delivery gate — Mochiichao show pipeline.

Measures a delivery encode against its reference master with
Netflix VMAF (via ffmpeg's libvmaf filter) and judges it against
the house thresholds in VMAF-POLICY.md. Attaches at Finish
(UNIFIED-PIPELINE stage 10): every delivered encode gets a number,
and the number goes in the delivery ledger.

Usage:
  # measure an existing encode against its reference
  vmaf_gate.py --reference MASTER.mp4 --distorted WEB.mp4

  # encode from the reference at a named house profile, then measure
  vmaf_gate.py --reference MASTER.mp4 --profile web      # CRF 21 (FULLSTACK-WIRING web copy)
  vmaf_gate.py --reference MASTER.mp4 --profile ladder28 # CRF 28 aggressive ladder rung
  vmaf_gate.py --reference MASTER.mp4 --profile master   # CRF 16 (FULLSTACK-WIRING master)

  # measure only a window of a long reference (seconds)
  vmaf_gate.py --reference MASTER.mp4 --profile web --ss 60 --window 90

Options:
  --ffmpeg PATH     ffmpeg with libvmaf (default: $VMAF_FFMPEG or `ffmpeg`)
  --model NAME      libvmaf model (default: version=vmaf_v0.6.1, the built-in)
  --threads N       libvmaf threads (default: 2)
  --out DIR         where encode + JSON results land (default: ./vmaf-out)
  --mean-threshold  pooled-mean pass line (default: 93.0 — see VMAF-POLICY.md)
  --p5-threshold    5th-percentile-frame pass line (default: 80.0)
  --keep-encode     keep the encoded file when using --profile

Exit codes: 0 = PASS, 1 = FAIL (below a threshold), 2 = could not measure.
Stdlib only. No network. All scratch stays under --out (never /tmp).
"""
import argparse, json, math, os, subprocess, sys, tempfile

PROFILES = {
    # name -> (label, ffmpeg video args) — from FULLSTACK-WIRING stage 10
    "master":   ("CRF 16 master profile",  ["-c:v", "libx264", "-crf", "16", "-preset", "medium"]),
    "web":      ("CRF 21 web profile",     ["-c:v", "libx264", "-crf", "21", "-preset", "medium"]),
    "ladder28": ("CRF 28 ladder rung",     ["-c:v", "libx264", "-crf", "28", "-preset", "medium"]),
}

def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p

def probe(ffprobe, path):
    p = run([ffprobe, "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height,avg_frame_rate,duration",
             "-of", "json", path])
    if p.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}: {p.stderr.strip()[:300]}")
    s = json.loads(p.stdout)["streams"][0]
    num, den = s["avg_frame_rate"].split("/")
    return {"width": s["width"], "height": s["height"],
            "fps": float(num) / float(den or 1), "duration": float(s.get("duration") or 0)}

def pct(vals, q):
    vals = sorted(vals)
    if not vals: return 0.0
    k = (len(vals) - 1) * (q / 100.0)
    f, c = math.floor(k), math.ceil(k)
    if f == c: return vals[int(k)]
    return vals[f] * (c - k) + vals[c] * (k - f)

def main():
    ap = argparse.ArgumentParser(description="VMAF delivery gate")
    ap.add_argument("--reference", required=True)
    ap.add_argument("--distorted")
    ap.add_argument("--profile", choices=sorted(PROFILES))
    ap.add_argument("--ffmpeg", default=os.environ.get("VMAF_FFMPEG", "ffmpeg"))
    ap.add_argument("--model", default="version=vmaf_v0.6.1")
    ap.add_argument("--threads", type=int, default=2)
    ap.add_argument("--ss", type=float, default=0.0, help="window start (seconds)")
    ap.add_argument("--window", type=float, default=0.0, help="window length (seconds, 0 = whole file)")
    ap.add_argument("--out", default="vmaf-out")
    ap.add_argument("--mean-threshold", type=float, default=93.0)
    ap.add_argument("--p5-threshold", type=float, default=80.0)
    ap.add_argument("--keep-encode", action="store_true")
    a = ap.parse_args()

    ffprobe = os.path.join(os.path.dirname(a.ffmpeg), "ffprobe") if "/" in a.ffmpeg else "ffprobe"
    os.makedirs(a.out, exist_ok=True)
    ref = os.path.abspath(a.reference)

    chk = run([a.ffmpeg, "-hide_banner", "-filters"])
    if "libvmaf" not in chk.stdout:
        print("ERROR: this ffmpeg has no libvmaf filter. Point --ffmpeg at a libvmaf build.",
              file=sys.stderr)
        return 2

    distorted = a.distorted
    encode_info = None
    if a.profile:
        label, vargs = PROFILES[a.profile]
        distorted = os.path.join(a.out, f"encode-{a.profile}.mp4")
        cmd = [a.ffmpeg, "-hide_banner", "-loglevel", "error", "-y"]
        if a.ss: cmd += ["-ss", str(a.ss)]
        cmd += ["-i", ref]
        if a.window: cmd += ["-t", str(a.window)]
        cmd += vargs + ["-an", distorted]
        p = run(cmd)
        if p.returncode != 0:
            print(f"ERROR: encode failed: {p.stderr.strip()[:400]}", file=sys.stderr)
            return 2
        encode_info = {"profile": a.profile, "label": label, "file": distorted,
                       "bytes": os.path.getsize(distorted)}
    if not distorted or not os.path.exists(distorted):
        print("ERROR: no distorted file (give --distorted or --profile).", file=sys.stderr)
        return 2
    distorted = os.path.abspath(distorted)

    try:
        rmeta, dmeta = probe(ffprobe, ref), probe(ffprobe, distorted)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 2
    if (rmeta["width"], rmeta["height"]) != (dmeta["width"], dmeta["height"]):
        print(f"ERROR: geometry mismatch ref {rmeta['width']}x{rmeta['height']} "
              f"vs distorted {dmeta['width']}x{dmeta['height']} — rescale before gating.",
              file=sys.stderr)
        return 2

    log_path = os.path.join(a.out, "vmaf-log.json")
    filt = (f"[0:v]setpts=PTS-STARTPTS[ref];[1:v]setpts=PTS-STARTPTS[dist];"
            f"[dist][ref]libvmaf=log_fmt=json:log_path={log_path}:"
            f"model={a.model}:n_threads={a.threads}")
    cmd = [a.ffmpeg, "-hide_banner", "-loglevel", "error"]
    if a.ss: cmd += ["-ss", str(a.ss)]
    cmd += ["-i", ref, "-i", distorted, "-lavfi", filt]
    if a.window: cmd += ["-t", str(a.window)]  # output-side cap: without it ffmpeg
    # keeps decoding the reference past the window (found in testing, TEST-RECORD)
    cmd += ["-shortest", "-f", "null", "-"]
    p = run(cmd)
    if p.returncode != 0 or not os.path.exists(log_path):
        print(f"ERROR: libvmaf run failed: {p.stderr.strip()[:400]}", file=sys.stderr)
        return 2

    log = json.load(open(log_path))
    frames = [f["metrics"]["vmaf"] for f in log["frames"]]
    pooled = log["pooled_metrics"]["vmaf"]
    result = {
        "reference": ref, "distorted": distorted, "encode": encode_info,
        "model": a.model, "frames_measured": len(frames),
        "window": {"ss": a.ss, "seconds": a.window or None},
        "vmaf_mean": round(pooled["mean"], 3),
        "vmaf_min_frame": round(min(frames), 3),
        "vmaf_p5_frame": round(pct(frames, 5), 3),
        "vmaf_harmonic_mean": round(pooled["harmonic_mean"], 3),
        "thresholds": {"mean": a.mean_threshold, "p5": a.p5_threshold},
    }
    result["verdict"] = ("PASS" if result["vmaf_mean"] >= a.mean_threshold
                         and result["vmaf_p5_frame"] >= a.p5_threshold else "FAIL")
    out_json = os.path.join(a.out, "vmaf-result.json")
    json.dump(result, open(out_json, "w"), indent=2)
    print(json.dumps(result, indent=2))
    print(f"\n{result['verdict']}: mean {result['vmaf_mean']} (line {a.mean_threshold}), "
          f"p5 {result['vmaf_p5_frame']} (line {a.p5_threshold}), "
          f"min frame {result['vmaf_min_frame']} over {len(frames)} frames")
    if a.profile and not a.keep_encode and os.path.exists(encode_info["file"]):
        pass  # encode stays in --out for the record; --out is the scratch home
    return 0 if result["verdict"] == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())
