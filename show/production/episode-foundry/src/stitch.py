#!/usr/bin/env python3
"""Episode Foundry — stitch (gated assembly).

Reads the cut manifest, the per-cut clips, and the per-cut gate records
(src/gate.py output), and concatenates ONLY the PASS clips, in manifest
order, into a growing assembly:

    <out-dir>/ep01-foundry-assembly.mp4     (1280x720, 24 fps, re-encoded)
    <out-dir>/assembly-ledger.json          (per cut: INCLUDED /
                                             EXCLUDED_FAIL + fail classes /
                                             MISSING, plus the pace summary)

A cut with no gate record, or a gate record that is not PASS, is never
stitched. A cut whose clip file is absent is MISSING. FAIL exclusions
carry the gate record's fail classes verbatim.

Pace (Foundry headline metric, owner addendum 2026-10-28):
    pace = finished seconds of PASSED (included) video / GPU hours
plus cuts-per-GPU-hour as the secondary figure. GPU time is taken, in
priority order, from --gpu-hours, else the sum of ``gpu_seconds`` over
the included cuts' gate records, else the sum of ``gpu_seconds`` in a
kernel ledger passed with --kernel-ledger. When no GPU time is known
the pace fields are null and the ledger says why — never invented.

Audio: default NO audio track. With --scratch-audio a silent bed is
muxed in and labelled as scratch in the file metadata AND in the
ledger (``audio: "SCRATCH-SILENT-BED — not final audio"``).

Self-test: ``--self-test`` fabricates three tiny synthetic clips with
PIL + ffmpeg, grades them with the real gate (one static -> MOTION
fail 'slideshow still'; one all-white -> BG_PERSIST fail 'background
disappeared'; one moving -> PASS), stitches the passer, and prints the
ledger. Scratch goes under the self-test dir, never /tmp (pinch rule).

Usage:
  stitch.py --manifest data/cut-manifest.json --clips-dir DIR \
            --gate-dir DIR --out-dir DIR [--scratch-audio] \
            [--gpu-hours H] [--kernel-ledger LEDGER.json]
  stitch.py --self-test [--self-test-dir DIR]
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import gate as gate_mod  # noqa: E402  (same-folder grading, reused for self-test)

TARGET_W, TARGET_H, TARGET_FPS = 1280, 720, 24
ASSEMBLY_NAME = "ep01-foundry-assembly.mp4"
LEDGER_NAME = "assembly-ledger.json"
SCHEMA = "mochiichao/episode-foundry-assembly/v1"


def _run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True)


def probe_duration(path: Path) -> float:
    r = _run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
              "-of", "json", str(path)])
    if r.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {path}: {r.stderr.strip()[:200]}")
    return float(json.loads(r.stdout)["format"]["duration"])


def load_manifest(path: Path) -> list[dict]:
    data = json.loads(Path(path).read_text())
    if isinstance(data, dict):
        cuts = data.get("cuts") or data.get("manifest") or []
    else:
        cuts = data
    if not isinstance(cuts, list):
        raise ValueError(f"manifest {path} does not hold a cut list")
    return cuts


def find_clip(clips_dir: Path, cut_id: str) -> Path | None:
    for cand in (clips_dir / f"{cut_id}.mp4",
                 clips_dir / cut_id / "clip.mp4",
                 clips_dir / cut_id / f"{cut_id}.mp4",
                 clips_dir / cut_id / "output.mp4"):
        if cand.is_file() and cand.stat().st_size > 0:
            return cand
    return None


def load_gate_records(gate_dir: Path | None,
                      gate_records_file: Path | None) -> dict[str, dict]:
    records: dict[str, dict] = {}
    if gate_records_file and Path(gate_records_file).is_file():
        data = json.loads(Path(gate_records_file).read_text())
        items = data if isinstance(data, list) else list(data.values())
        for rec in items:
            if isinstance(rec, dict) and rec.get("cut_id"):
                records[rec["cut_id"]] = rec
    if gate_dir and Path(gate_dir).is_dir():
        for p in sorted(Path(gate_dir).glob("*.json")):
            try:
                rec = json.loads(p.read_text())
            except Exception:  # noqa: BLE001 — unreadable record = not a PASS
                continue
            if isinstance(rec, dict) and rec.get("cut_id"):
                records.setdefault(rec["cut_id"], rec)
            elif isinstance(rec, dict) and rec.get("verdict"):
                records.setdefault(p.stem.replace(".gate", ""), rec)
    return records


def kernel_ledger_gpu_seconds(path: Path | None) -> float | None:
    if not path or not Path(path).is_file():
        return None
    try:
        data = json.loads(Path(path).read_text())
    except Exception:  # noqa: BLE001
        return None
    entries = data.get("entries", []) if isinstance(data, dict) else data
    total, found = 0.0, False
    for e in entries if isinstance(entries, list) else []:
        if isinstance(e, dict) and isinstance(e.get("gpu_seconds"), (int, float)):
            total += float(e["gpu_seconds"])
            found = True
    return total if found else None


def normalise_clip(src: Path, dest: Path) -> None:
    vf = (f"scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=decrease,"
          f"pad={TARGET_W}:{TARGET_H}:(ow-iw)/2:(oh-ih)/2,"
          f"fps={TARGET_FPS},format=yuv420p")
    r = _run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-vf", vf,
              "-c:v", "libx264", "-preset", "medium", "-crf", "18",
              "-an", str(dest)])
    if r.returncode != 0 or not dest.exists():
        raise RuntimeError(f"normalise failed for {src}: {r.stderr.strip()[:300]}")


def assemble(manifest_path, clips_dir, gate_dir, out_dir,
             gate_records_file=None, scratch_audio=False,
             gpu_hours=None, kernel_ledger=None) -> dict:
    manifest_path, clips_dir, out_dir = Path(manifest_path), Path(clips_dir), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    scratch = out_dir / "stitch-scratch"
    scratch.mkdir(parents=True, exist_ok=True)
    cuts = load_manifest(manifest_path)
    records = load_gate_records(Path(gate_dir) if gate_dir else None,
                                Path(gate_records_file) if gate_records_file else None)

    entries: list[dict] = []
    included_clips: list[Path] = []
    pass_seconds = 0.0
    gate_gpu_seconds = 0.0
    for cut in cuts:
        cut_id = cut.get("cut_id")
        entry: dict = {"cut_id": cut_id, "road": cut.get("road"),
                       "manifest_duration_s": cut.get("duration_s")}
        clip = find_clip(clips_dir, cut_id) if cut_id else None
        rec = records.get(cut_id) if cut_id else None
        if clip is None:
            entry.update({"status": "MISSING", "reason": "clip file not found"})
        elif rec is None:
            entry.update({"status": "MISSING",
                          "reason": "no gate record — ungraded clips never stitch",
                          "clip": str(clip)})
        elif rec.get("verdict") != "PASS":
            entry.update({"status": "EXCLUDED_FAIL", "clip": str(clip),
                          "fail_classes": rec.get("fail_classes", []),
                          "road": rec.get("road", entry["road"])})
        else:
            dur = probe_duration(clip)
            entry.update({"status": "INCLUDED", "clip": str(clip),
                          "duration_s": round(dur, 3),
                          "road": rec.get("road", entry["road"]),
                          "gpu_seconds": rec.get("gpu_seconds")})
            included_clips.append(clip)
            pass_seconds += dur
            if isinstance(rec.get("gpu_seconds"), (int, float)):
                gate_gpu_seconds += float(rec["gpu_seconds"])
        entries.append(entry)

    assembly_path = out_dir / ASSEMBLY_NAME
    if included_clips:
        normed = []
        for i, clip in enumerate(included_clips):
            dest = scratch / f"norm-{i:04d}.mp4"
            normalise_clip(clip, dest)
            normed.append(dest)
        list_file = scratch / "concat.txt"
        list_file.write_text("".join(
            f"file '{p.resolve().as_posix()}'\n" for p in normed))
        joined = scratch / "joined.mp4"
        r = _run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                  "-i", str(list_file), "-c", "copy", str(joined)])
        if r.returncode != 0:
            raise RuntimeError(f"concat failed: {r.stderr.strip()[:300]}")
        if scratch_audio:
            r = _run(["ffmpeg", "-y", "-v", "error", "-i", str(joined),
                      "-f", "lavfi", "-i",
                      "anullsrc=channel_layout=stereo:sample_rate=48000",
                      "-shortest", "-c:v", "copy", "-c:a", "aac",
                      "-metadata", "comment=SCRATCH AUDIO - SILENT BED - NOT FINAL",
                      str(assembly_path)])
            if r.returncode != 0:
                raise RuntimeError(f"scratch-audio mux failed: {r.stderr.strip()[:300]}")
        else:
            r = _run(["ffmpeg", "-y", "-v", "error", "-i", str(joined),
                      "-c", "copy", "-an", str(assembly_path)])
            if r.returncode != 0:
                raise RuntimeError(f"assembly write failed: {r.stderr.strip()[:300]}")
        assembly_duration = probe_duration(assembly_path)
    else:
        assembly_duration = 0.0
        if assembly_path.exists():
            assembly_path.unlink()

    # Pace: finished seconds of PASSED video per GPU hour (headline) +
    # cuts per GPU hour (secondary). Null when GPU time is unknown.
    gpu_s = None
    gpu_source = None
    if gpu_hours is not None:
        gpu_s, gpu_source = float(gpu_hours) * 3600.0, "--gpu-hours"
    elif gate_gpu_seconds > 0:
        gpu_s, gpu_source = gate_gpu_seconds, "sum of gate-record gpu_seconds (included cuts)"
    else:
        kl = kernel_ledger_gpu_seconds(Path(kernel_ledger) if kernel_ledger else None)
        if kl:
            gpu_s, gpu_source = kl, "kernel ledger gpu_seconds"
    n_included = sum(1 for e in entries if e["status"] == "INCLUDED")
    if gpu_s:
        pace = {"gpu_hours": round(gpu_s / 3600.0, 4), "gpu_time_source": gpu_source,
                "finished_seconds_per_gpu_hour": round(pass_seconds / (gpu_s / 3600.0), 3),
                "cuts_per_gpu_hour": round(n_included / (gpu_s / 3600.0), 3)}
    else:
        pace = {"gpu_hours": None, "gpu_time_source": None,
                "finished_seconds_per_gpu_hour": None, "cuts_per_gpu_hour": None,
                "note": "no GPU time recorded — pass --gpu-hours, gate records with "
                        "gpu_seconds, or --kernel-ledger"}

    ledger = {
        "schema": SCHEMA,
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "manifest": str(manifest_path),
        "assembly": str(assembly_path) if included_clips else None,
        "assembly_duration_s": round(assembly_duration, 3),
        "audio": ("SCRATCH-SILENT-BED — not final audio" if scratch_audio and included_clips
                  else "none"),
        "target_spec": {"width": TARGET_W, "height": TARGET_H, "fps": TARGET_FPS},
        "entries": entries,
        "summary": {
            "cuts_total": len(entries), "included": n_included,
            "excluded_fail": sum(1 for e in entries if e["status"] == "EXCLUDED_FAIL"),
            "missing": sum(1 for e in entries if e["status"] == "MISSING"),
            "pass_seconds": round(pass_seconds, 3),
            "pace": pace,
        },
    }
    (out_dir / LEDGER_NAME).write_text(json.dumps(ledger, indent=2) + "\n")
    return ledger


# --------------------------------------------------------------------------
# Self-test: synthetic clips -> real gate -> stitch the passer.
# --------------------------------------------------------------------------

def _synthetic_frames(kind: str, work: Path, n: int = 24, w: int = 320, h: int = 240):
    from PIL import Image, ImageDraw
    frames_dir = work / f"frames-{kind}"
    frames_dir.mkdir(parents=True, exist_ok=True)
    for i in range(n):
        if kind == "white":
            im = Image.new("RGB", (w, h), (255, 255, 255))
        else:
            im = Image.new("RGB", (w, h), (24, 32, 96))  # dark navy field
            d = ImageDraw.Draw(im)
            x = 40 if kind == "static" else 10 + 6 * i
            d.rectangle([x, 80, x + 60, 160], fill=(220, 60, 50))
            d.ellipse([200, 30, 260, 90], fill=(240, 200, 60))
        im.save(frames_dir / f"f{i:03d}.png")
    return frames_dir


def _encode(frames_dir: Path, dest: Path, fps: int = 24) -> None:
    r = _run(["ffmpeg", "-y", "-v", "error", "-framerate", str(fps),
              "-i", str(frames_dir / "f%03d.png"), "-c:v", "libx264",
              "-pix_fmt", "yuv420p", str(dest)])
    if r.returncode != 0:
        raise RuntimeError(f"synthetic encode failed: {r.stderr.strip()[:300]}")


def self_test(base: Path) -> dict:
    from PIL import Image
    base = Path(base)
    clips_dir, gates_dir, refs_dir = base / "clips", base / "gates", base / "refs"
    for d in (clips_dir, gates_dir, refs_dir, base / "work"):
        d.mkdir(parents=True, exist_ok=True)
    plan = [("TEST01-PASS", "moving", 1800.0),   # 0.5 GPU h recorded -> pace demo
            ("TEST02-STATIC", "static", None),
            ("TEST03-WHITE", "white", None)]
    manifest = []
    print("== self-test: fabricating clips ==")
    for cut_id, kind, gpu_s in plan:
        frames_dir = _synthetic_frames(kind, base / "work")
        clip = clips_dir / f"{cut_id}.mp4"
        _encode(frames_dir, clip)
        ref = refs_dir / f"{cut_id}-reference.png"
        Image.open(frames_dir / "f000.png").save(ref)
        print(f"  {cut_id}: kind={kind} clip={clip.name} ref={ref.name}")
        manifest.append({"cut_id": cut_id, "characters": ["synthetic"],
                         "background_plate": "synthetic", "duration_s": 1.0,
                         "beat": f"self-test {kind}", "road": "vace-local"})
        print(f"== self-test: gating {cut_id} ==")
        record = gate_mod.grade_clip(clip, ref, cut_id=cut_id,
                                     scratch_dir=base / "work" / f"gate-{cut_id}",
                                     road="vace-local", gpu_seconds=gpu_s)
        (gates_dir / f"{cut_id}.gate.json").write_text(json.dumps(record, indent=2) + "\n")
        measured = {k: v.get("measured") for k, v in record["clauses"].items()}
        print(f"  verdict={record['verdict']} fail_classes={record.get('fail_classes')}")
        for k, v in measured.items():
            print(f"    {k}: {json.dumps(v)[:200]}")
    manifest_path = base / "cut-manifest.json"
    manifest_path.write_text(json.dumps(
        {"schema": "mochiichao/episode-foundry-manifest/v1", "cuts": manifest}, indent=2) + "\n")

    print("== self-test: stitching ==")
    ledger = assemble(manifest_path, clips_dir, gates_dir, base / "assembly")
    for e in ledger["entries"]:
        print(f"  LEDGER {e['cut_id']}: {e['status']}"
              + (f" fail_classes={e.get('fail_classes')}" if e.get("fail_classes") else "")
              + (f" duration_s={e.get('duration_s')}" if e.get("duration_s") else ""))
    print(f"  SUMMARY {json.dumps(ledger['summary'])}")
    print(f"  ASSEMBLY {ledger['assembly']} duration_s={ledger['assembly_duration_s']}")

    checks = {e["cut_id"]: e["status"] for e in ledger["entries"]}
    assert checks.get("TEST01-PASS") == "INCLUDED", checks
    assert checks.get("TEST02-STATIC") == "EXCLUDED_FAIL", checks
    assert checks.get("TEST03-WHITE") == "EXCLUDED_FAIL", checks
    by_id = {e["cut_id"]: e for e in ledger["entries"]}
    assert "slideshow still" in by_id["TEST02-STATIC"]["fail_classes"], by_id["TEST02-STATIC"]
    assert "background disappeared" in by_id["TEST03-WHITE"]["fail_classes"], by_id["TEST03-WHITE"]
    assert ledger["summary"]["included"] == 1
    assert ledger["assembly"] and Path(ledger["assembly"]).is_file()
    print("SELF-TEST PASS: passer stitched, static excluded (slideshow still), "
          "white excluded (background disappeared)")
    return ledger


def main() -> int:
    ap = argparse.ArgumentParser(description="Episode Foundry stitch — gated assembly.")
    ap.add_argument("--manifest")
    ap.add_argument("--clips-dir")
    ap.add_argument("--gate-dir")
    ap.add_argument("--gate-records", help="combined gate records JSON (list or {cut_id: record})")
    ap.add_argument("--out-dir")
    ap.add_argument("--scratch-audio", action="store_true",
                    help="mux a clearly-labelled silent scratch bed (default: no audio)")
    ap.add_argument("--gpu-hours", type=float,
                    help="total GPU hours consumed (pace denominator override)")
    ap.add_argument("--kernel-ledger", help="foundry kernel cut-ledger.json (gpu_seconds source)")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--self-test-dir",
                    default=str(Path(__file__).resolve().parent.parent / "selftest-out"))
    args = ap.parse_args()

    if args.self_test:
        self_test(Path(args.self_test_dir))
        return 0
    if not (args.manifest and args.clips_dir and args.out_dir):
        ap.error("--manifest, --clips-dir and --out-dir are required (or use --self-test)")
    ledger = assemble(args.manifest, args.clips_dir, args.gate_dir, args.out_dir,
                      gate_records_file=args.gate_records,
                      scratch_audio=args.scratch_audio,
                      gpu_hours=args.gpu_hours, kernel_ledger=args.kernel_ledger)
    for e in ledger["entries"]:
        print(f"{e['cut_id']}: {e['status']}"
              + (f" {e.get('fail_classes')}" if e.get("fail_classes") else ""))
    print(f"summary: {json.dumps(ledger['summary'])}")
    print(f"assembly: {ledger['assembly']} ({ledger['assembly_duration_s']}s)")
    print(f"ledger: {Path(args.out_dir) / LEDGER_NAME}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
