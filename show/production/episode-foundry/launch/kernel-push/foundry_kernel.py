#!/usr/bin/env python3
"""Episode Foundry — batch kernel (road: vace-local).

ONE Kaggle kernel script that turns a queue of EP01 cuts into gated-ready
clips, back to back, resumably:

  1. stages the VACE-1.3B weights + canon references ONCE from the
     attached Kaggle datasets;
  2. starts ComfyUI locally in the kernel (fresh clone, code only);
  3. loads a cut queue (a subset of data/cut-manifest.json, passed as a
     JSON file in the kernel inputs);
  4. per cut: preflight -> build the VACE job from the verified
     attempt-3 workflow -> submit -> wait via
     ``comfy_wait.wait_for_completion`` (the fixed wait client built by
     the wait-fix lane; this kernel DEPENDS on its interface and never
     reimplements polling — the attempt-3 run died on exactly that
     defect: a hand-rolled /history loop asserting TIMEOUT_NO_HISTORY);
  5. writes per cut, under /kaggle/working/foundry-out/<cut_id>/:
     clip.mp4, reference.png (the reference ACTUALLY FED), its sha256
     (reference.sha256.txt + ledger), frames/frame_first|mid|last.png,
     the pass clips, and appends the cut to cut-ledger.json.
     RESUMABLE: on start, any existing ledger in the output is read and
     cuts already marked DONE are skipped. The ledger is rewritten
     after every cut, so a killed session keeps its progress.

ROADS (Foundry addendum 2026-10-28): the foundry is multi-road —
"flow-replica", "vace-local" (this kernel), "part-pack". The ledger is
road-agnostic: every entry carries its ``road``; this kernel executes
only road == "vace-local" entries, ledger-marks the others
SKIPPED_ROAD for their own lanes, and never clobbers existing entries
from other roads. PROOF ORDER: the proof cut runs the flow-replica
road first (owner-proven method line); this kernel's proof run follows.

FRAME-CHAINING (addendum): where consecutive queue entries are marked
continuous (``continuous: true`` / ``continuous_with_prev: true``),
the cut's fed reference is the PREVIOUS cut's last frame instead of
the canon still. The ledger records ``reference_source`` =
``canon`` | ``chained:<prev_cut_id>`` and the reference sha256 either
way. Chaining does not relax grading: gate.py checks frame 1 against
the fed reference and the likeness clauses against canon (the canon
path + sha256 are recorded in the ledger for exactly that).

WORKFLOW — verified from the artifact, not assumed
(source: ~/workspace/ep01-rebuild/proof/vace-attempt3/workflow.json,
sha256 c9058122fa271067324f01dec344a4465c3b23774e6fd94be5c741bf503b2af4,
matching the attempt-3 RUN-LOG):
  node 9  WanVaceToVideo.reference_image <- node 8 LoadImage
          (canon cutout)                        => REFERENCE ENGAGED
  node 9  .control_video  <- node 6 VHS_LoadVideo (flf_control.mp4,
          force_rate 16, frame_load_cap 49)
  node 9  .control_masks  <- node 14 ImageToMask(red) <- node 7
          VHS_LoadVideo (flf_mask.mp4)
  node 9  width 480, height 768, length 49, strength 1.0
          (its _meta title claims 832x480 — the INPUTS say 480x768
          portrait, and the run's AUDIT_PASS 480,768,49 agrees with
          the inputs; the title is stale)
  node 11 KSampler latent_image <- [9, 2]; node 12 VAEDecode <- [11, 0]
  GAP: there is NO TrimVideoLatent anywhere in the graph. The parity
  preflight (avatar-tool-build .../job/preflight.py) treats a missing
  TrimVideoLatent.trim_amount <- [vace, 3] wire as a lock failure,
  because WanVaceToVideo prepends the reference latent and output 3 is
  the count to trim after sampling. Attempt-3's own object_info
  validation passed without it. This kernel REPAIRS the wire by
  default — KSampler -> TrimVideoLatent -> VAEDecode, trim_amount
  [9, 3] — records the repair in every ledger entry, and reproduces
  the proof graph byte-for-byte instead when
  FOUNDRY_EXACT_PROOF_GRAPH=1 (in which case preflight records the
  trim gap as a warning, not a failure). No silent divergence either
  way.
  Frame budget: length 49 at 16 fps = 3.0625 s per pass is the PROVEN
  per-pass count (frame_load_cap 49, AUDIT_PASS 480,768,49). Longer
  cuts chain passes by last-frame continuation; seams are recorded.

WEIGHTS (staging manifest of record:
mochiichao-show/wiring/STAGING-MANIFEST.md, server-verified
2026-10-28; 61,934,128,382 B across the 5 private datasets):
  marsfmmg/mochiichao-wan22-consistency-kit — VACE-1.3B
  (wan2.1_vace_1.3B_fp16.safetensors, 4,309,519,800 B), Wan 2.1 VAE
  (wan_2.1_vae.safetensors, 253,815,318 B), UMT5
  (umt5_xxl_fp8_e4m3fn_scaled.safetensors, 6,735,906,897 B)
  marsfmmg/mochiichao-likeness-datasets — canon references
  (<species>.png cutouts; local ground truth:
  ~/workspace/mochiichao-show/canon-cutouts/)
The other three datasets (wan22-core, wan22-accel, ace-step,
voice-weights) are not needed by this road and are not read here.
Kaggle budget note (owner addendum): ~30 GPU hrs/week is the honest
cap; the ledger's gpu_seconds accounting exists so pace can be
managed against it.

QUEUE ENTRY SCHEMA (manifest schema + optional extras):
  {cut_id, characters: [species, ...], background_plate, duration_s,
   beat, road?, continuous?/continuous_with_prev?, scene_id?,
   reference_path?, reference_sha256?, keyframe_start?, keyframe_end?,
   seed?}
Verified against the real manifest (data/cut-manifest.json, landed
2026-10-28 during this build): a top-level list of 107 cuts, cut_ids
V3-001..V3-107, total duration 1260 s; the scene field is named
``scene`` ("N1", "S1", ...); characters use canon spelling ("Dorowani",
"Hex") and may be EMPTY (plate-only cuts -> SKIPPED_NO_CHARACTER, see
run_cut); background_plate is an absolute path and is usually a LIVING
.mp4 plate (handled by plate_frames); there are NO road/continuous
fields yet — the defaults above apply (road vace-local, chaining only
where a queue entry opts in).
``characters[0]`` is the VACE reference character — WanVaceToVideo
takes exactly ONE reference_image. Multi-character cuts are generated
against the first character and the limitation is written into the
ledger entry (``multi_character_note``); it is never hidden.

ENV: FOUNDRY_QUEUE (queue JSON path; default: search kernel inputs),
FOUNDRY_OUT (default /kaggle/working/foundry-out),
FOUNDRY_PASS_DEADLINE_S (per-pass wait deadline, default 3600),
FOUNDRY_EXACT_PROOF_GRAPH=1, FOUNDRY_SEED_BASE (default 42),
FOUNDRY_COMFY_WAIT_DIR (folder holding comfy_wait.py, if not found
on the default search paths).
FOUNDRY_ACCEL (acceleration profile from kernel/accel_profile.py;
unset = "baseline" = the proven recipe unchanged; named profiles
add ComfyUI launch flags in main() and workflow transforms in
build_workflow(), recorded per cut in workflow_repairs; see
accel/ACCEL-TEARDOWN.md + accel/AB-PROTOCOL.md).

TWO-SESSION DESIGN (owner addendum 2026-10-28 15:48 — this VACE road
is the headline route for the REPLICA of the owner-graded recipe.
Attribution, settled from the records 2026-10-28: the owner-graded
best clips were generated by Google Flow / Veo 3.1 Lite (whose free
credits imposed the 5 clips/day cap) from locally composited canon
start frames; Wan 2.1 + VACE is this replica's substitute engine for
that recipe's generation stage — see flow-recipe/FLOW-RECIPE.md §0).
The kernel runs as ONE of two
concurrent Kaggle sessions over DISJOINT cut ranges:
  --shard A | B        contiguous halves of the queue (A = first
                       ceil(n/2) cuts in queue order, B = the rest)
  --range A:B          explicit 1-based inclusive queue range
  --cuts id,id,...     explicit cut-id list (queue order preserved)
  (env equivalents: FOUNDRY_SHARD, FOUNDRY_SHARD_RANGE, FOUNDRY_CUT_LIST)
Each session writes its OWN ledger shard file,
foundry-out/cut-ledger-<shard>.json (unsharded runs keep
cut-ledger.json), with the same record schema plus a ``sessions``
list recording each run's wall-clock on the GPU seat — the GPU-hours
denominator for pace. MERGE RULE (merge_ledgers() below, also runnable
standalone: --merge-ledgers A.json B.json --merge-out merged.json):
entries are keyed by cut_id; DONE beats any non-DONE state from
another shard (a cut DONE in either shard is done, idempotently);
between two DONE entries the earliest finished_utc wins; GPU seconds
are taken from the winning entry only, so a merged total never
double-counts. RESTART-CHAINING: on start, the session scans its
inputs (and sibling shard ledgers) for prior cut-ledger*.json files
and merges their DONE set in before selecting work — a fresh session
continues where the last ended.
Spec note: THROUGHPUT-ARCH.md / CAP-ANALYSIS.md (the two-session
design spec, separate worker) had NOT landed when this was built;
these implementation notes are written as that spec's input.

FP16 (T4 / Turing has no BF16 or FP8 acceleration): the staged VACE
UNET is the FP16 variant (wan2.1_vace_1.3B_fp16.safetensors — asserted
by name at staging) and the Wan 2.1 VAE ships as the standard fp16
checkpoint. The one FP8 reference in the graph is the text encoder,
umt5_xxl_fp8_e4m3fn_scaled.safetensors — it is the ONLY UMT5 variant
staged in any of the five datasets (staging manifest §A/§B), so there
is no fp16 UMT5 to switch to; on T4 it loads through ComfyUI's
MixedPrecisionOps dequant path (attempt-3 comfy.log confirms), i.e.
correct but without acceleration. Flagged here and in the run log,
never silently swapped.
"""
from __future__ import annotations

import copy
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time
import traceback
import urllib.request
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# comfy_wait — the fixed wait client (separate lane's deliverable).
# Interface depended on, NOT reimplemented:
#   wait_for_completion(base_url, prompt_id, *, deadline_s, poll_s=5.0,
#                       log=print) -> dict
# ---------------------------------------------------------------------------

def _import_comfy_wait():
    candidates = []
    env_dir = os.environ.get("FOUNDRY_COMFY_WAIT_DIR")
    if env_dir:
        candidates.append(pathlib.Path(env_dir))
    here = pathlib.Path(__file__).resolve()
    candidates += [here.parent, here.parent.parent / "src",
                   pathlib.Path("/kaggle/working"), pathlib.Path("/kaggle/input")]
    for base in candidates:
        if not base.exists():
            continue
        hits = [base / "comfy_wait.py"] if (base / "comfy_wait.py").is_file() else []
        hits += sorted(base.rglob("comfy_wait.py"))[:4] if base.is_dir() else []
        for hit in hits:
            sys.path.insert(0, str(hit.parent))
            try:
                import comfy_wait  # noqa: PLC0415
                return comfy_wait
            except Exception:  # noqa: BLE001
                sys.path.pop(0)
    raise SystemExit(
        "BLOCKED: comfy_wait.py not found on any search path "
        f"({[str(c) for c in candidates]}). The fixed wait client is a "
        "separate lane's deliverable (src/comfy_wait.py); this kernel "
        "depends on its interface and will not reimplement polling.")


# Resolved lazily in main() (generation path only) so the ledger
# utilities (--merge-ledgers, --preview-selection) run anywhere,
# including machines where the wait client has not landed yet.
WAIT_FN = None

# ---------------------------------------------------------------------------
# accel_profile — the OPTIONAL acceleration layer (kernel/accel_profile.py,
# teardown in accel/ACCEL-TEARDOWN.md). Resolved in main(); with
# FOUNDRY_ACCEL unset the profile is "baseline" and build_workflow /
# the ComfyUI launch line are byte-for-byte the proven recipe.
# ---------------------------------------------------------------------------

ACCEL_MODULE = None
ACCEL_PROFILE_NAME = os.environ.get("FOUNDRY_ACCEL", "baseline")


def _import_accel_profile():
    here = pathlib.Path(__file__).resolve()
    candidates = [here.parent, pathlib.Path("/kaggle/working"),
                  pathlib.Path("/kaggle/input")]
    for base in candidates:
        if not base.exists():
            continue
        hits = [base / "accel_profile.py"] if (base / "accel_profile.py").is_file() else []
        hits += sorted(base.rglob("accel_profile.py"))[:4] if base.is_dir() else []
        for hit in hits:
            sys.path.insert(0, str(hit.parent))
            try:
                import accel_profile  # noqa: PLC0415
                return accel_profile
            except Exception:  # noqa: BLE001
                sys.path.pop(0)
    return None

# ---------------------------------------------------------------------------
# The verified attempt-3 workflow (see module docstring for the audit).
# Embedded so the kernel does not depend on any repo copy at run time —
# same pattern as likeness-stack/kaggle/vace-flf/mochiichao-vace-likeness.py.
# ---------------------------------------------------------------------------

WORKFLOW_JSON = r'''{
 "1": {"_meta": {"title": "VACE-1.3B (resolved by fetch script)"}, "class_type": "UNETLoader", "inputs": {"unet_name": "wan2.1_vace_1.3B_fp16.safetensors", "weight_dtype": "default"}},
 "2": {"_meta": {"title": "UMT5 fp8 scaled"}, "class_type": "CLIPLoader", "inputs": {"clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors", "device": "default", "type": "wan"}},
 "3": {"_meta": {"title": "Wan 2.1 VAE (VACE pairs with 2.1, not 2.2)"}, "class_type": "VAELoader", "inputs": {"vae_name": "wan_2.1_vae.safetensors"}},
 "4": {"_meta": {"title": "Positive"}, "class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": "POSITIVE_PLACEHOLDER"}},
 "5": {"_meta": {"title": "Negative"}, "class_type": "CLIPTextEncode", "inputs": {"clip": ["2", 0], "text": "photorealistic, 3d render, cgi, realistic, changing character design, morphing, deformed, extra limbs, extra characters, blurry, text, watermark, logo, colored background, camera movement, zoom"}},
 "6": {"_meta": {"title": "Sparse FLF control video"}, "class_type": "VHS_LoadVideo", "inputs": {"force_rate": 16, "format": "AnimateDiff", "frame_load_cap": 49, "select_every_nth": 1, "skip_first_frames": 0, "video": "CONTROL_PLACEHOLDER", "custom_width": 0, "custom_height": 0}},
 "7": {"_meta": {"title": "Sparse FLF mask video"}, "class_type": "VHS_LoadVideo", "inputs": {"force_rate": 16, "format": "AnimateDiff", "frame_load_cap": 49, "select_every_nth": 1, "skip_first_frames": 0, "video": "MASK_PLACEHOLDER", "custom_width": 0, "custom_height": 0}},
 "8": {"_meta": {"title": "Reference image (canon cutout)"}, "class_type": "LoadImage", "inputs": {"image": "REFERENCE_PLACEHOLDER"}},
 "9": {"_meta": {"title": "VACE"}, "class_type": "WanVaceToVideo", "inputs": {"batch_size": 1, "control_masks": ["14", 0], "control_video": ["6", 0], "height": 768, "length": 49, "negative": ["5", 0], "positive": ["4", 0], "reference_image": ["8", 0], "strength": 1.0, "vae": ["3", 0], "width": 480}},
 "10": {"_meta": {"title": "Wan flow shift (eval starting point)"}, "class_type": "ModelSamplingSD3", "inputs": {"model": ["1", 0], "shift": 8.0}},
 "11": {"_meta": {"title": "KSampler"}, "class_type": "KSampler", "inputs": {"cfg": 5.0, "denoise": 1.0, "latent_image": ["9", 2], "model": ["10", 0], "negative": ["9", 1], "positive": ["9", 0], "sampler_name": "uni_pc", "scheduler": "simple", "seed": 42, "steps": 30}},
 "12": {"class_type": "VAEDecode", "inputs": {"samples": ["11", 0], "vae": ["3", 0]}},
 "13": {"_meta": {"title": "Output"}, "class_type": "VHS_VideoCombine", "inputs": {"filename_prefix": "PREFIX_PLACEHOLDER", "format": "video/h264-mp4", "frame_rate": 16, "images": ["12", 0], "loop_count": 0, "save_output": true, "pingpong": false}},
 "14": {"class_type": "ImageToMask", "inputs": {"image": ["7", 0], "channel": "red"}}
}'''

WF_WIDTH, WF_HEIGHT, WF_FPS, WF_LENGTH = 480, 768, 16, 49  # proven per pass
WEIGHTS = [("diffusion_models", "wan2.1_vace_1.3B_fp16.safetensors", 4309519800),
           ("vae", "wan_2.1_vae.safetensors", 253815318),
           ("text_encoders", "umt5_xxl_fp8_e4m3fn_scaled.safetensors", 6735906897)]
BASE_URL = "http://127.0.0.1:8188"
WORK = pathlib.Path("/kaggle/working")
OUT_ROOT = pathlib.Path(os.environ.get("FOUNDRY_OUT", WORK / "foundry-out"))
LEDGER_PATH = OUT_ROOT / "cut-ledger.json"
PASS_DEADLINE_S = float(os.environ.get("FOUNDRY_PASS_DEADLINE_S", "3600"))
EXACT_PROOF_GRAPH = os.environ.get("FOUNDRY_EXACT_PROOF_GRAPH") == "1"
SEED_BASE = int(os.environ.get("FOUNDRY_SEED_BASE", "42"))
ROAD = "vace-local"
LOG: list[str] = []

# Design descriptors verified from workflow.json node 4 (Dorowani only;
# other species get the generic preserve-design wording — inventing
# canon descriptors for them is not this kernel's call).
DESCRIPTORS = {
    "dorowani": ("a blue bipedal creature with red fin-like cheeks, red eyes, "
                 "a light cream belly, a small dorsal fin and a tan shell on "
                 "its back"),
}


def log(*a) -> None:
    s = " ".join(str(x) for x in a)
    print(s, flush=True)
    LOG.append(s)


def sh(cmd: str) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    log("$", cmd, "\n", (r.stdout or "")[-800:], (r.stderr or "")[-400:])
    return r


def sha256_of(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Ledger (road-agnostic, resumable)
# ---------------------------------------------------------------------------

def load_ledger(path: pathlib.Path | None = None) -> dict:
    path = path or LEDGER_PATH
    if path.is_file():
        try:
            data = json.loads(path.read_text())
            if isinstance(data, dict) and isinstance(data.get("entries"), list):
                data.setdefault("sessions", [])
                return data
        except Exception:  # noqa: BLE001 — a corrupt ledger must not
            log("LEDGER_UNREADABLE — starting a fresh ledger")  # silently pass
    return {"schema": "mochiichao/episode-foundry-ledger/v1",
            "created_utc": utcnow(), "entries": [], "sessions": []}


def merge_ledgers(ledgers: list[dict]) -> dict:
    """The two-session merge rule (see module docstring): keyed by
    cut_id; DONE beats non-DONE; earliest DONE wins; GPU seconds come
    from the winning entry only (no double-count). Sessions concatenate."""
    by_id: dict[str, dict] = {}
    sessions: list[dict] = []
    for led in ledgers:
        sessions.extend(led.get("sessions", []) if isinstance(led, dict) else [])
        for e in (led.get("entries", []) if isinstance(led, dict) else []):
            cid = e.get("cut_id")
            if not cid:
                continue
            cur = by_id.get(cid)
            if cur is None:
                by_id[cid] = e
            elif e.get("status") == "DONE" and cur.get("status") != "DONE":
                by_id[cid] = e
            elif e.get("status") == "DONE" and cur.get("status") == "DONE":
                if str(e.get("finished_utc") or "") < str(cur.get("finished_utc") or ""):
                    by_id[cid] = e
    merged = {"schema": "mochiichao/episode-foundry-ledger/v1",
              "created_utc": utcnow(),
              "entries": [by_id[k] for k in sorted(by_id)],
              "sessions": sessions}
    merged["summary"] = ledger_summary(merged)
    return merged


def ledger_summary(ledger: dict) -> dict:
    entries = ledger.get("entries", [])
    done = [e for e in entries if e.get("status") == "DONE"]
    gpu_s = sum(float(e.get("gpu_seconds") or 0) for e in entries)
    session_s = sum(float(s.get("wall_seconds") or 0)
                    for s in ledger.get("sessions", []))
    produced = sum(float(e.get("duration_s") or 0) for e in done)
    return {
        "updated_utc": utcnow(),
        "entries": len(entries), "done": len(done),
        "by_status": {s: sum(1 for e in entries if e.get("status") == s)
                      for s in sorted({e.get("status") for e in entries})},
        "by_road": {r: sum(1 for e in entries if e.get("road") == r)
                    for r in sorted({e.get("road") for e in entries if e.get("road")})},
        "produced_seconds": round(produced, 3),
        "gpu_hours_total": round(gpu_s / 3600.0, 4),
        "session_gpu_hours_total": round(session_s / 3600.0, 4),
        "produced_seconds_per_gpu_hour": (
            round(produced / (gpu_s / 3600.0), 3) if gpu_s else None),
        "pace_note": ("produced pace above is generation-side; the HEADLINE "
                      "pace (finished seconds of PASSED video per GPU hour) "
                      "is computed in src/stitch.py from gate verdicts"),
    }


def select_shard_cuts(queue: list[dict], shard: str | None = None,
                      range_spec: str | None = None,
                      cut_list: str | None = None) -> list[dict]:
    """Disjoint-range selection for the two-session pattern."""
    if cut_list:
        wanted = {c.strip() for c in cut_list.split(",") if c.strip()}
        return [c for c in queue if c.get("cut_id") in wanted]
    if range_spec:
        a, b = (int(x) for x in range_spec.split(":"))
        return queue[max(0, a - 1):b]
    if shard in ("A", "B"):
        half = -(-len(queue) // 2)
        return queue[:half] if shard == "A" else queue[half:]
    return queue


def save_ledger(ledger: dict) -> None:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    ledger["summary"] = ledger_summary(ledger)
    tmp = LEDGER_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(ledger, indent=2) + "\n")
    tmp.replace(LEDGER_PATH)


def upsert_entry(ledger: dict, entry: dict) -> None:
    for i, e in enumerate(ledger["entries"]):
        if e.get("cut_id") == entry.get("cut_id"):
            ledger["entries"][i] = entry
            return
    ledger["entries"].append(entry)


# ---------------------------------------------------------------------------
# Graph validation vs the LIVE server (copied with attribution from
# likeness-stack/kaggle/vace-flf/mochiichao-vace-likeness.py: type_set /
# validate — the attempt-3 pre-flight gate).
# ---------------------------------------------------------------------------

def _type_set(t):
    if isinstance(t, list):
        return None
    return {x.strip() for x in str(t).split(",")}


def validate_graph(wf: dict, oi: dict) -> list[str]:
    errors = []
    for nid, node in wf.items():
        ct = node.get("class_type")
        if ct not in oi:
            errors.append(f"node {nid} ({ct}): unknown node class")
            continue
        spec = oi[ct]
        inputs_spec = {}
        for section in ("required", "optional"):
            for name, tspec in spec.get("input", {}).get(section, {}).items():
                inputs_spec[name] = (tspec[0], section)
        present = node.get("inputs", {})
        for name, (_t, section) in inputs_spec.items():
            if section == "required" and name not in present:
                errors.append(f"node {nid} ({ct}): Required input is missing: {name}")
        out_cache: dict[str, list] = {}
        for name, val in present.items():
            if not (isinstance(val, list) and len(val) == 2
                    and isinstance(val[0], (str, int))):
                continue
            src_id, slot = str(val[0]), int(val[1])
            if name not in inputs_spec:
                continue
            expected = _type_set(inputs_spec[name][0])
            if expected is None:
                errors.append(f"node {nid} ({ct}): input {name} is a combo, cannot be linked")
                continue
            if src_id not in wf:
                errors.append(f"node {nid} ({ct}): input {name} links from missing node {src_id}")
                continue
            src_ct = wf[src_id].get("class_type")
            if src_ct not in oi:
                continue
            if src_id not in out_cache:
                out_cache[src_id] = oi[src_ct].get("output", [])
            outs = out_cache[src_id]
            if slot >= len(outs):
                errors.append(f"node {nid} ({ct}): input {name} links slot {slot} "
                              f"but {src_ct} has {len(outs)} outputs")
                continue
            actual = outs[slot]
            if "*" not in expected and "*" != actual and actual not in expected:
                errors.append(f"node {nid} ({ct}): type mismatch on {name}: "
                              f"received {actual}, expected {sorted(expected)}")
    return errors


# ---------------------------------------------------------------------------
# Preflight (adapted from avatar-tool-build/corrective-pass/locked-run/
# job/preflight.py: check_reference + the native-VACE branch of
# check_workflow). A cut that fails is ledger-marked PREFLIGHT_FAIL and
# never consumes GPU time.
# ---------------------------------------------------------------------------

def _is_link(v) -> bool:
    return isinstance(v, list) and len(v) == 2 and isinstance(v[0], (str, int)) \
        and isinstance(v[1], int)


def preflight_cut(wf: dict, reference_path: pathlib.Path,
                  expected_sha256: str | None) -> dict:
    failures: list[str] = []
    checks: dict = {}
    # Reference: exists, decodable, hash logged (and matched when expected).
    if not reference_path.is_file():
        failures.append(f"reference image missing: {reference_path}")
        checks["reference"] = {"status": "missing", "path": str(reference_path)}
    else:
        try:
            from PIL import Image
            with Image.open(reference_path) as im:
                im.verify()
            with Image.open(reference_path) as im:
                checks["reference"] = {"status": "ok", "path": str(reference_path),
                                       "format": im.format, "size": list(im.size)}
        except Exception as e:  # noqa: BLE001
            failures.append(f"reference image unreadable: {e}")
            checks["reference"] = {"status": "unreadable", "path": str(reference_path)}
        actual = sha256_of(reference_path)
        checks["reference"]["sha256"] = actual
        if expected_sha256 and actual.lower() != expected_sha256.lower().removeprefix("sha256:"):
            failures.append(f"reference hash mismatch: actual {actual}, "
                            f"expected {expected_sha256}")
            checks["reference"]["status"] = "hash-mismatch"
        elif not expected_sha256:
            checks["reference"]["hash_logged_from_file"] = True  # hash IS the log
    # Workflow: stale LoRA key anywhere aborts (preflight.py rule).
    def walk(obj):
        yield obj
        if isinstance(obj, dict):
            for v in obj.values():
                yield from walk(v)
        elif isinstance(obj, list):
            for v in obj:
                yield from walk(v)
    if any(isinstance(o, dict) and "lora_args" in o for o in walk(wf)):
        failures.append("stale LoRA key 'lora_args' present in workflow")
    # VACE reference path engaged assertion (the core lock check).
    vace_ids = [nid for nid, n in wf.items()
                if isinstance(n, dict) and n.get("class_type") == "WanVaceToVideo"]
    if not vace_ids:
        failures.append("no WanVaceToVideo node in workflow")
    for nid in vace_ids:
        inputs = wf[nid].get("inputs", {})
        ref = inputs.get("reference_image")
        src = str(ref[0]) if _is_link(ref) else None
        if not src or src not in wf:
            failures.append(f"WanVaceToVideo {nid}: reference_image not engaged")
        else:
            cls = wf[src].get("class_type")
            checks.setdefault("vace_reference_sources", {})[nid] = {"node": src, "class_type": cls}
            if cls != "LoadImage":
                failures.append(f"WanVaceToVideo {nid}: reference_image source "
                                f"{src} is {cls}, not LoadImage")
        for key in ("control_video", "control_masks"):
            if not _is_link(inputs.get(key)):
                failures.append(f"WanVaceToVideo {nid}: {key} not engaged")
        strength = inputs.get("strength")
        if not isinstance(strength, (int, float)) or float(strength) <= 0:
            failures.append(f"WanVaceToVideo {nid}: non-positive strength {strength!r}")
        # Trim wire: part of the lock per parity preflight (see docstring).
        trim_ok = any(isinstance(n, dict) and n.get("class_type") == "TrimVideoLatent"
                      and n.get("inputs", {}).get("trim_amount") == [str(nid), 3]
                      for n in wf.values())
        checks.setdefault("trim_latent_wired", {})[nid] = trim_ok
        if not trim_ok and not EXACT_PROOF_GRAPH:
            failures.append(f"no TrimVideoLatent.trim_amount wired from "
                            f"WanVaceToVideo {nid} output 3")
        elif not trim_ok:
            checks["trim_gap_warning"] = ("EXACT_PROOF_GRAPH: trim wire absent, "
                                          "as in the attempt-3 proof graph")
    return {"verdict": "PASS" if not failures else "ABORT",
            "failures": failures, "checks": checks}


# ---------------------------------------------------------------------------
# Workflow construction
# ---------------------------------------------------------------------------

def build_workflow(cut: dict, fed_reference_name: str, control_name: str,
                   mask_name: str, prefix: str, seed: int) -> tuple[dict, list[str]]:
    wf = json.loads(WORKFLOW_JSON)
    repairs: list[str] = []
    species = (cut.get("characters") or ["the character"])[0]
    descriptor = DESCRIPTORS.get(str(species).lower())
    beat = (cut.get("beat") or "").strip()
    plate = cut.get("background_plate")
    bg_clause = ("Plain solid white background" if not plate
                 else f"Background: {plate}")
    positive = ("flat 2D cartoon animation, preserve the exact character "
                "design of the reference"
                + (f": {descriptor}" if descriptor else "")
                + (f". {beat}" if beat else "")
                + f". {bg_clause}, locked-off camera, no camera movement.")
    wf["4"]["inputs"]["text"] = positive
    wf["6"]["inputs"]["video"] = control_name
    wf["7"]["inputs"]["video"] = mask_name
    wf["8"]["inputs"]["image"] = fed_reference_name
    wf["11"]["inputs"]["seed"] = seed
    wf["13"]["inputs"]["filename_prefix"] = prefix
    if not EXACT_PROOF_GRAPH:
        # Repair the missing trim wire (module docstring): KSampler output
        # passes through TrimVideoLatent with trim_amount from the VACE
        # node's own output 3 before VAEDecode.
        wf["15"] = {"_meta": {"title": "Trim prepended reference latent "
                                       "(foundry repair of the attempt-3 gap)"},
                    "class_type": "TrimVideoLatent",
                    "inputs": {"samples": ["11", 0], "trim_amount": ["9", 3]}}
        wf["12"]["inputs"]["samples"] = ["15", 0]
        repairs.append("inserted TrimVideoLatent (node 15): samples <- KSampler, "
                       "trim_amount <- [WanVaceToVideo 9, output 3]; VAEDecode "
                       "now reads node 15 (attempt-3 graph had no trim node)")
    if ACCEL_MODULE is not None and ACCEL_PROFILE_NAME != "baseline":
        wf, accel_notes = ACCEL_MODULE.apply_to_workflow(wf, ACCEL_PROFILE_NAME)
        repairs.extend(accel_notes)
    return wf, repairs


def build_prompt_only(cut: dict) -> str:
    wf, _ = build_workflow(cut, "x", "x", "x", "x", 0)
    return wf["4"]["inputs"]["text"]


# ---------------------------------------------------------------------------
# Input staging + control construction
# ---------------------------------------------------------------------------

def find_in_inputs(name: str) -> pathlib.Path | None:
    inp = pathlib.Path("/kaggle/input")
    if not inp.exists():
        return None
    hits = sorted(inp.rglob(name))
    return hits[0] if hits else None


def resolve_reference(cut: dict) -> pathlib.Path | None:
    if cut.get("reference_path"):
        p = pathlib.Path(cut["reference_path"])
        if p.is_file():
            return p
        hit = find_in_inputs(p.name)
        if hit:
            return hit
    species = str((cut.get("characters") or [""])[0]).lower()
    return find_in_inputs(f"{species}.png") if species else None


def resolve_plate(cut: dict) -> pathlib.Path | None:
    plate = cut.get("background_plate")
    if not plate or not isinstance(plate, str):
        return None
    p = pathlib.Path(plate)
    if p.is_file():
        return p
    return find_in_inputs(p.name)


def resolve_keyframe(cut: dict, key: str) -> pathlib.Path | None:
    raw = cut.get(key)
    if not raw:
        return None
    p = pathlib.Path(raw)
    if p.is_file():
        return p
    return find_in_inputs(p.name)


def prep_on_canvas(img_path: pathlib.Path, canvas: "object") -> "object":
    """Attempt-3 start-frame prep (mochiichao-vace-likeness.py): alpha-bbox
    crop, thumbnail onto the canvas. RGB images (chained frames) are pasted
    resized to fill instead — they are already full frames."""
    from PIL import Image
    im = Image.open(img_path)
    if im.mode == "RGBA" and im.getchannel("A").getbbox():
        rgba = im.convert("RGBA")
        rgba = rgba.crop(rgba.getchannel("A").getbbox())
        rgba.thumbnail((446, 675))
        canvas.alpha_composite(rgba, (17, 63))
        return canvas
    rgb = im.convert("RGB").resize((WF_WIDTH, WF_HEIGHT), Image.LANCZOS)
    canvas.paste(rgb, (0, 0))
    return canvas


def plate_frames(plate: pathlib.Path | None, dest_dir: pathlib.Path,
                 tag: str) -> list:
    """The 49 control-background frames at workflow size. Manifest plates
    are LIVING plates (.mp4 — e.g. gate-dawn.mp4 in the real 107-cut
    manifest), so a video plate contributes its own frames (looped if
    short); an image plate is held; no plate = white field (the proof
    workflow's design)."""
    from PIL import Image
    if plate is None:
        return [Image.new("RGB", (WF_WIDTH, WF_HEIGHT), (255, 255, 255))
                for _ in range(WF_LENGTH)]
    if plate.suffix.lower() in (".mp4", ".mov", ".webm", ".mkv"):
        pdir = dest_dir / f"plate-{tag}"
        pdir.mkdir(parents=True, exist_ok=True)
        r = subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-i", str(plate),
             "-vf", (f"scale={WF_WIDTH}:{WF_HEIGHT}:force_original_aspect_ratio="
                     f"increase,crop={WF_WIDTH}:{WF_HEIGHT}"),
             "-frames:v", str(WF_LENGTH), str(pdir / "p-%03d.png")],
            capture_output=True, text=True)
        files = sorted(pdir.glob("p-*.png"))
        if r.returncode != 0 or not files:
            raise RuntimeError(f"plate frame extract failed for {plate}: "
                               f"{r.stderr[-300:]}")
        frames = [Image.open(f).convert("RGB") for f in files]
        while len(frames) < WF_LENGTH:
            frames.append(frames[-1].copy())
        return frames[:WF_LENGTH]
    base = Image.open(plate).convert("RGB").resize(
        (WF_WIDTH, WF_HEIGHT), Image.LANCZOS)
    return [base.copy() for _ in range(WF_LENGTH)]


def build_control(cut: dict, fed_ref: pathlib.Path, start_key: pathlib.Path | None,
                  end_key: pathlib.Path | None, plate: pathlib.Path | None,
                  dest_dir: pathlib.Path, tag: str) -> tuple[str, str]:
    """Sparse FLF control + all-white mask (attempt-3 recipe): frame 0 =
    start anchor composited on the plate, last frame = end anchor,
    middle frames = the bare plate frames, mask all-white (generate
    everywhere, following the control). Returns (control, mask) names
    inside ComfyUI/input."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = dest_dir / f"ctrl-{tag}"
    frames_dir.mkdir(exist_ok=True)
    bases = plate_frames(plate, dest_dir, tag)
    start_canvas = prep_on_canvas(start_key or fed_ref,
                                  bases[0].copy().convert("RGBA")).convert("RGB")
    end_src = end_key or start_key or fed_ref
    end_canvas = prep_on_canvas(end_src,
                                bases[-1].copy().convert("RGBA")).convert("RGB")
    for i in range(WF_LENGTH):
        frame = start_canvas if i == 0 else end_canvas if i == WF_LENGTH - 1 else bases[i]
        frame.save(frames_dir / f"c-{i:03d}.png")
    control_name = f"foundry_{tag}_control.mp4"
    mask_name = f"foundry_{tag}_mask.mp4"
    cin = pathlib.Path("/kaggle/working/ComfyUI/input")
    cin.mkdir(parents=True, exist_ok=True)
    sh(f"ffmpeg -v error -y -framerate {WF_FPS} -i {frames_dir}/c-%03d.png "
       f"-c:v libx264 -pix_fmt yuv420p {cin}/{control_name}")
    sh(f"ffmpeg -v error -y -f lavfi -i color=white:size={WF_WIDTH}x{WF_HEIGHT}"
       f":rate={WF_FPS}:duration={WF_LENGTH / WF_FPS:.2f} -frames:v {WF_LENGTH} "
       f"-c:v libx264 -pix_fmt yuv420p {cin}/{mask_name}")
    return control_name, mask_name


# ---------------------------------------------------------------------------
# Server + queue plumbing
# ---------------------------------------------------------------------------

def http_get(path: str):
    with urllib.request.urlopen(f"{BASE_URL}{path}", timeout=30) as r:
        return json.loads(r.read())


def queue_prompt(wf: dict, client_id: str) -> str:
    body = json.dumps({"prompt": wf, "client_id": client_id}).encode()
    req = urllib.request.Request(f"{BASE_URL}/prompt", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read())
    if resp.get("node_errors"):
        raise RuntimeError(f"node_errors: {resp['node_errors']}")
    return resp["prompt_id"]


def extract_frame_png(clip: pathlib.Path, index: int, dest: pathlib.Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(clip),
                        "-vf", f"select='eq(n\\,{index})'", "-frames:v", "1",
                        str(dest)], capture_output=True, text=True)
    if r.returncode != 0 or not dest.exists():
        raise RuntimeError(f"frame extract failed: {r.stderr[-300:]}")


def probe_frames(clip: pathlib.Path) -> int:
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=nb_frames,duration,avg_frame_rate",
                        "-of", "json", str(clip)], capture_output=True, text=True)
    st = json.loads(r.stdout)["streams"][0]
    if st.get("nb_frames") and int(st["nb_frames"]) > 0:
        return int(st["nb_frames"])
    num, den = st["avg_frame_rate"].split("/")
    return int(round(float(st["duration"]) * float(num) / float(den)))


def load_queue() -> list[dict]:
    raw = os.environ.get("FOUNDRY_QUEUE")
    candidates = [pathlib.Path(raw)] if raw else []
    candidates += [WORK / "cut-queue.json", WORK / "cut-manifest.json"]
    candidates += sorted(WORK.glob("queue-*.json"))[:2]
    inp = pathlib.Path("/kaggle/input")
    if inp.exists():
        candidates += sorted(inp.rglob("cut-queue.json"))[:2]
        candidates += sorted(inp.rglob("cut-manifest.json"))[:2]
        candidates += sorted(inp.rglob("queue-*.json"))[:2]
    for cand in candidates:
        if cand and cand.is_file():
            data = json.loads(cand.read_text())
            cuts = data.get("cuts") if isinstance(data, dict) else data
            if isinstance(cuts, list):
                log(f"QUEUE {cand}: {len(cuts)} cuts")
                return cuts
    raise SystemExit("BLOCKED: no cut queue found (set FOUNDRY_QUEUE or attach "
                     "cut-queue.json / cut-manifest.json / queue-*.json as a kernel input)")


# ---------------------------------------------------------------------------
# Per-cut run
# ---------------------------------------------------------------------------

def run_cut(cut: dict, cut_index: int, ledger: dict,
            prev_state: dict) -> dict:
    cut_id = cut["cut_id"]
    road = cut.get("road") or ROAD
    cut_dir = OUT_ROOT / cut_id
    cut_dir.mkdir(parents=True, exist_ok=True)
    entry: dict = {"cut_id": cut_id, "road": road, "status": "RUNNING",
                   "characters": cut.get("characters"),
                   "duration_s": cut.get("duration_s"), "beat": cut.get("beat"),
                   "scene_id": cut.get("scene_id") or cut.get("scene"),
                   "started_utc": utcnow()}
    if len(cut.get("characters") or []) > 1:
        entry["multi_character_note"] = (
            "WanVaceToVideo takes ONE reference_image; this cut is generated "
            f"against characters[0] ({cut['characters'][0]}). Other listed "
            "characters are not separately referenced by this road.")
    gpu_t0 = time.time()
    try:
        if road != ROAD:
            entry.update({"status": "SKIPPED_ROAD",
                          "note": f"road '{road}' is executed by its own lane; "
                                  "recorded here so the shared ledger stays whole"})
            return entry
        if not cut.get("characters"):
            # Real-manifest case (e.g. V3-001, a living-plate establishing
            # cut): no character to likeness-lock. Not a failure of this
            # road — the cut belongs to plate/composite handling. Recorded
            # plainly so the batch never silently drops it.
            entry.update({"status": "SKIPPED_NO_CHARACTER",
                          "note": "manifest lists no characters for this cut; "
                                  "the VACE likeness road has nothing to lock — "
                                  "route via plate/composite handling"})
            return entry

        # --- reference selection: canon, or chained last frame (addendum) ---
        wants_chain = bool(cut.get("continuous") or cut.get("continuous_with_prev"))
        canon_path = resolve_reference(cut)
        fed_path, ref_source = None, "canon"
        if wants_chain and prev_state.get("last_frame") and prev_state.get("cut_id"):
            fed_path = pathlib.Path(prev_state["last_frame"])
            ref_source = f"chained:{prev_state['cut_id']}"
            entry["chain_note"] = "continuous run: fed reference is the previous cut's last frame"
        elif wants_chain:
            entry["chain_note"] = ("continuity requested but no previous last frame "
                                   "available in this run — fell back to canon")
        if fed_path is None:
            fed_path = canon_path
        if fed_path is None or not fed_path.is_file():
            entry.update({"status": "PREFLIGHT_FAIL",
                          "error": "no canon reference resolvable for "
                                   f"{(cut.get('characters') or ['?'])[0]}"})
            return entry
        fed_copy = cut_dir / "reference.png"
        shutil.copy(fed_path, fed_copy)
        fed_sha = sha256_of(fed_copy)
        (cut_dir / "reference.sha256.txt").write_text(fed_sha + "\n")
        entry.update({"reference_source": ref_source,
                      "reference_path": str(fed_copy), "reference_sha256": fed_sha,
                      "canon_reference_path": str(canon_path) if canon_path else None,
                      "canon_reference_sha256": sha256_of(canon_path)
                      if canon_path and canon_path.is_file() else None})

        plate = resolve_plate(cut)
        entry["background_plate"] = str(plate) if plate else None
        if plate is None and cut.get("background_plate"):
            entry["plate_note"] = ("background_plate named in the manifest but not "
                                   "resolvable in the kernel inputs — white field used")
        start_key = resolve_keyframe(cut, "keyframe_start")
        end_key = resolve_keyframe(cut, "keyframe_end")

        # --- passes: proven 49-frame passes, last-frame continuation ---
        frames_needed = max(1, int(round(float(cut.get("duration_s") or 3.0) * WF_FPS)))
        n_passes = max(1, -(-frames_needed // WF_LENGTH))
        entry["frames_target"] = frames_needed
        entry["passes_planned"] = n_passes
        entry["seams"] = [{"after_pass": k, "at_output_frame": k * WF_LENGTH,
                           "source": "last-frame continuation"}
                          for k in range(1, n_passes)]
        pass_clips: list[pathlib.Path] = []
        continuation_frame: pathlib.Path | None = None
        wf_repairs: list[str] = []
        for p in range(n_passes):
            tag = f"{cut_id}-p{p}"
            control_src = continuation_frame or start_key or fed_copy
            control_name, mask_name = build_control(
                cut, control_src, control_src,
                end_key if p == n_passes - 1 else None, plate, cut_dir, tag)
            ref_name = f"foundry_{cut_id}_ref.png"
            shutil.copy(fed_copy, pathlib.Path("/kaggle/working/ComfyUI/input") / ref_name)
            seed = int(cut.get("seed") or (SEED_BASE + cut_index * 100 + p))
            wf, repairs = build_workflow(cut, ref_name, control_name, mask_name,
                                         f"foundry_{cut_id}_p{p}", seed)
            wf_repairs = repairs
            # Preflight BEFORE any GPU time (per cut, on the built graph).
            pf = preflight_cut(wf, fed_copy, cut.get("reference_sha256"))
            entry.setdefault("preflight", pf)
            if pf["verdict"] != "PASS":
                entry.update({"status": "PREFLIGHT_FAIL", "failures": pf["failures"]})
                return entry
            errs = validate_graph(wf, http_get("/object_info"))
            if errs:
                entry.update({"status": "PREFLIGHT_FAIL",
                              "failures": [f"live object_info validation: {e}" for e in errs]})
                return entry
            pid = queue_prompt(wf, f"foundry-{cut_id}-p{p}")
            log(f"QUEUED {cut_id} pass {p + 1}/{n_passes} prompt_id={pid}")
            hist = WAIT_FN(BASE_URL, pid, deadline_s=PASS_DEADLINE_S,
                           poll_s=5.0, log=lambda *a: log(*a))
            status = (hist or {}).get("status", {}) if isinstance(hist, dict) else {}
            if status.get("status_str") == "error":
                entry.update({"status": "GEN_FAIL",
                              "error": f"ComfyUI execution error: {json.dumps(status)[:500]}"})
                return entry
            outs = sorted(pathlib.Path("/kaggle/working/ComfyUI/output").rglob(
                f"foundry_{cut_id}_p{p}*.mp4"))
            if not outs:
                entry.update({"status": "GEN_FAIL",
                              "error": f"no output mp4 for pass {p}"})
                return entry
            pass_dest = cut_dir / "passes" / f"pass-{p:02d}.mp4"
            pass_dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(outs[-1], pass_dest)
            pass_clips.append(pass_dest)
            n_frames = probe_frames(pass_dest)
            continuation_frame = cut_dir / "passes" / f"pass-{p:02d}-last.png"
            extract_frame_png(pass_dest, n_frames - 1, continuation_frame)
            log(f"PASS_DONE {cut_id} pass {p + 1}/{n_passes}: {pass_dest.name} "
                f"({n_frames} frames)")
        entry["workflow_repairs"] = wf_repairs

        # --- assemble the cut clip (trim chained passes to the target) ---
        clip_path = cut_dir / "clip.mp4"
        if len(pass_clips) == 1:
            shutil.copy(pass_clips[0], clip_path)
        else:
            list_file = cut_dir / "passes" / "concat.txt"
            list_file.write_text("".join(
                f"file '{p.resolve().as_posix()}'\n" for p in pass_clips))
            r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat",
                                "-safe", "0", "-i", str(list_file),
                                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                                str(clip_path)], capture_output=True, text=True)
            if r.returncode != 0:
                entry.update({"status": "GEN_FAIL",
                              "error": f"pass concat failed: {r.stderr[-300:]}"})
                return entry
        total = probe_frames(clip_path)
        if total > frames_needed:
            trimmed = cut_dir / "clip-untrimmed.mp4"
            clip_path.replace(trimmed)
            r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(trimmed),
                                "-frames:v", str(frames_needed),
                                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                                str(clip_path)], capture_output=True, text=True)
            if r.returncode == 0:
                total = frames_needed
        frames_out = {}
        for tag, idx in (("frame_first", 0), ("frame_mid", total // 2),
                         ("frame_last", total - 1)):
            dest = cut_dir / "frames" / f"{tag}.png"
            extract_frame_png(clip_path, idx, dest)
            frames_out[tag] = str(dest)
        entry.update({"status": "DONE", "clip": str(clip_path),
                      "clip_sha256": sha256_of(clip_path), "frames_out": total,
                      "frames": frames_out,
                      "pass_clips": [str(p) for p in pass_clips],
                      "prompt": build_prompt_only(cut)})
        prev_state.update({"cut_id": cut_id,
                           "last_frame": frames_out["frame_last"]})
        return entry
    except Exception:  # noqa: BLE001 — one cut's failure never kills the batch
        entry.update({"status": "GEN_FAIL", "error": traceback.format_exc()[-1200:]})
        return entry
    finally:
        entry["gpu_seconds"] = round(time.time() - gpu_t0, 1)
        entry["finished_utc"] = utcnow()
        upsert_entry(ledger, entry)
        save_ledger(ledger)


# ---------------------------------------------------------------------------

def parse_cli(argv: list[str]) -> dict:
    import argparse
    ap = argparse.ArgumentParser(add_help=False)
    ap.add_argument("--shard")
    ap.add_argument("--range", dest="range_spec")
    ap.add_argument("--cuts", dest="cut_list")
    ap.add_argument("--queue")
    ap.add_argument("--merge-ledgers", nargs="+")
    ap.add_argument("--merge-out")
    ap.add_argument("--preview-selection", action="store_true")
    args, _unknown = ap.parse_known_args(argv)
    return {"shard": args.shard or os.environ.get("FOUNDRY_SHARD"),
            "range_spec": args.range_spec or os.environ.get("FOUNDRY_SHARD_RANGE"),
            "cut_list": args.cut_list or os.environ.get("FOUNDRY_CUT_LIST"),
            "queue": args.queue,
            "merge_ledgers": args.merge_ledgers,
            "merge_out": args.merge_out,
            "preview_selection": args.preview_selection}


def find_prior_ledgers() -> list[pathlib.Path]:
    """Restart-chaining sources: prior shard ledgers attached as kernel
    inputs, plus any sibling shard ledgers already in the output root."""
    found: list[pathlib.Path] = []
    inp = pathlib.Path("/kaggle/input")
    if inp.exists():
        found += sorted(inp.rglob("cut-ledger*.json"))
    if OUT_ROOT.exists():
        found += [p for p in sorted(OUT_ROOT.glob("cut-ledger*.json"))
                  if p != LEDGER_PATH]
    return found


def main() -> None:
    global LEDGER_PATH, WAIT_FN
    cli = parse_cli(sys.argv[1:])
    if cli["queue"]:
        os.environ["FOUNDRY_QUEUE"] = cli["queue"]
    # Utility modes first: they run anywhere, no GPU / wait client needed.
    if cli["merge_ledgers"]:
        parts = []
        for raw in cli["merge_ledgers"]:
            data = json.loads(pathlib.Path(raw).read_text())
            parts.append(data)
        merged = merge_ledgers(parts)
        out = pathlib.Path(cli["merge_out"] or "cut-ledger-merged.json")
        out.write_text(json.dumps(merged, indent=2) + "\n")
        print(f"merged {len(parts)} ledgers -> {out}: "
              f"{merged['summary']['done']} DONE, "
              f"gpu_hours_total={merged['summary']['gpu_hours_total']}, "
              f"produced_seconds={merged['summary']['produced_seconds']}")
        return
    shard = cli["shard"]
    if shard:
        LEDGER_PATH = OUT_ROOT / f"cut-ledger-{shard}.json"
    if cli["preview_selection"]:
        queue = load_queue()
        sel = select_shard_cuts(queue, shard, cli["range_spec"], cli["cut_list"])
        print(f"shard={shard} range={cli['range_spec']} cuts={cli['cut_list']}: "
              f"{len(sel)} of {len(queue)} cuts selected")
        for c in sel:
            print(f"  {c.get('cut_id')} ({c.get('duration_s')}s)")
        return
    WAIT_FN = _import_comfy_wait().wait_for_completion
    # Acceleration layer: baseline (FOUNDRY_ACCEL unset) changes nothing.
    # A named profile with no accel_profile.py findable is a hard stop —
    # never a silent baseline run wearing an accelerated label.
    global ACCEL_MODULE
    accel_flags: list[str] = []
    if ACCEL_PROFILE_NAME != "baseline":
        ACCEL_MODULE = _import_accel_profile()
        if ACCEL_MODULE is None:
            raise SystemExit(
                f"BLOCKED: FOUNDRY_ACCEL={ACCEL_PROFILE_NAME} requested but "
                "accel_profile.py not found on any search path; refusing to "
                "run the baseline under an accelerated label")
        accel_flags = ACCEL_MODULE.comfy_launch_flags(ACCEL_PROFILE_NAME)
    session_t0 = time.time()
    session_started = utcnow()
    session_done = 0
    ledger_ref: dict = {}
    try:
        log(subprocess.run(["nvidia-smi"], capture_output=True, text=True).stdout[:400])
        # Setup: ComfyUI + VideoHelperSuite, fresh clones (code only).
        if not (WORK / "ComfyUI").exists():
            sh(f"cd {WORK} && git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git")
            sh(f"cd {WORK} && git clone --depth 1 https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git "
               "ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite")
        sh(f"{sys.executable} -m pip install -q -r {WORK}/ComfyUI/requirements.txt "
           f"-r {WORK}/ComfyUI/custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt")
        log("SETUP_DONE")
        # Stage weights ONCE from the attached datasets (byte-size asserted
        # against the staging manifest of record).
        models = WORK / "ComfyUI" / "models"
        for sub, name, size in WEIGHTS:
            src = find_in_inputs(name)
            assert src, f"BLOCKED: weight {name} not found in attached datasets"
            assert src.stat().st_size == size, \
                f"weight size mismatch for {name}: {src.stat().st_size} != {size}"
            dst = models / sub / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            if dst.exists() or dst.is_symlink():
                dst.unlink()
            os.symlink(src, dst)
            log("staged", name, src.stat().st_size)
        assert "fp16" in WEIGHTS[0][1], "VACE UNET must be the staged FP16 variant"
        log("FP16_NOTE: VACE UNET + Wan 2.1 VAE are the FP16 staged variants "
            "(T4-native). The UMT5 text encoder is staged ONLY as "
            "umt5_xxl_fp8_e4m3fn_scaled.safetensors — T4 has no FP8 "
            "acceleration; it loads via ComfyUI MixedPrecisionOps dequant "
            "(attempt-3 comfy.log). No FP16 UMT5 exists in the staged "
            "datasets to switch to; flagged, not swapped.")
        # Start ComfyUI once for the whole batch.
        log(f"ACCEL_PROFILE {ACCEL_PROFILE_NAME} launch_flags={accel_flags}")
        srv = subprocess.Popen(
            [sys.executable, "main.py", "--listen", "127.0.0.1", "--port", "8188",
             "--disable-auto-launch"] + accel_flags,
            cwd=str(WORK / "ComfyUI"),
            stdout=open(WORK / "foundry-comfy.log", "w"), stderr=subprocess.STDOUT)
        try:
            for _ in range(120):
                try:
                    http_get("/system_stats")
                    log("SERVER_UP")
                    break
                except Exception:  # noqa: BLE001
                    time.sleep(5)
            else:
                raise RuntimeError("ComfyUI server did not come up")
            full_queue = load_queue()
            queue = select_shard_cuts(full_queue, shard, cli["range_spec"],
                                      cli["cut_list"])
            log(f"SHARD shard={shard} range={cli['range_spec']} "
                f"cuts={cli['cut_list']}: {len(queue)} of {len(full_queue)} "
                f"cuts in this session; ledger={LEDGER_PATH.name}")
            ledger = load_ledger()
            ledger_ref.update({"ledger": ledger})
            # Restart-chaining: fold in DONE cuts from any prior shard
            # ledger present in this session's inputs (merge rule).
            priors = find_prior_ledgers()
            if priors:
                prior_ledgers = []
                for p in priors:
                    try:
                        prior_ledgers.append(json.loads(p.read_text()))
                    except Exception:  # noqa: BLE001
                        log(f"PRIOR_LEDGER_UNREADABLE {p}")
                if prior_ledgers:
                    merged_prior = merge_ledgers(prior_ledgers + [ledger])
                    prior_done = {e["cut_id"] for e in merged_prior["entries"]
                                  if e.get("status") == "DONE"}
                    local_ids = {e.get("cut_id") for e in ledger["entries"]}
                    for e in merged_prior["entries"]:
                        if e["cut_id"] in prior_done and e["cut_id"] not in local_ids:
                            ledger["entries"].append(e)
                    log(f"RESTART_CHAIN: {len(prior_done)} DONE cuts known "
                        f"across {len(priors)} prior ledger(s)")
            done_ids = {e["cut_id"] for e in ledger["entries"]
                        if e.get("status") == "DONE"}
            log(f"RESUME: {len(done_ids)} cuts already DONE in the ledger")
            prev_state: dict = {}
            for idx, cut in enumerate(queue):
                cut_id = cut.get("cut_id")
                if not cut_id:
                    log(f"QUEUE_SKIP entry {idx}: no cut_id")
                    continue
                if cut_id in done_ids:
                    log(f"SKIP {cut_id}: already DONE (resumable ledger)")
                    # Keep chaining context for a following continuous cut.
                    last = OUT_ROOT / cut_id / "frames" / "frame_last.png"
                    if last.is_file():
                        prev_state = {"cut_id": cut_id, "last_frame": str(last)}
                    continue
                entry = run_cut(cut, idx, ledger, prev_state)
                if entry.get("status") == "DONE":
                    session_done += 1
                log(f"CUT {cut_id}: {entry['status']}")
            log("BATCH_DONE")
        finally:
            srv.terminate()
    except Exception:  # noqa: BLE001
        log("KERNEL_EXCEPTION\n", traceback.format_exc())
    finally:
        # Session record: wall-clock on the GPU seat (pace denominator),
        # appended to THIS shard's ledger.
        try:
            ledger = ledger_ref.get("ledger") or load_ledger()
            ledger.setdefault("sessions", []).append({
                "shard": shard, "started_utc": session_started,
                "ended_utc": utcnow(),
                "wall_seconds": round(time.time() - session_t0, 1),
                "cuts_done_this_session": session_done})
            save_ledger(ledger)
        except Exception:  # noqa: BLE001
            pass
        OUT_ROOT.mkdir(parents=True, exist_ok=True)
        (OUT_ROOT / "RUN-LOG.txt").write_text("\n".join(LOG))
        print("SCRIPT_DONE")


if __name__ == "__main__":
    main()
