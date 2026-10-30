#!/usr/bin/env python3
"""run_scene.py — the gpu-4090 scene runner.

Reads a scene job in the format of jobs/scene_job.4090.example.json
(schema mochiichao-show/scene-job/v2, gpu-4090 extensions included)
and runs the owner-locked production method, per character:

    generate separately -> frame-1 gate -> chain segments ->
    likeness gate -> cutout -> composite over the living
    background -> post (shadows at composite, then grade)

A gate failure stops THAT character: it is never chained, cut out
or composited, and it is never reported as a keeper. Other
characters continue; the run exits non-zero if any character
failed, and the composite (built from passing characters only) is
labelled incomplete in RUN-REPORT.json.

ComfyUI HTTP API — ONLY the server's real documented routes are
used (ComfyUI server.py routes, docs.comfy.org API tutorials; the
same shapes the repo's own parity/locked_run_kernel.py uses):

    POST /prompt            body {"prompt": <API-format graph>,
                            "client_id": <str>} -> {"prompt_id": ...}
    GET  /history/{id}      -> {id: {"outputs": {...}, "status":
                            {"completed": bool, "status_str": ...}}}
    GET  /view?filename=..&subfolder=..&type=..   -> output bytes
    POST /upload/image      multipart form fields "image" (file),
                            "type" ("input"), "subfolder",
                            "overwrite" -> {"name","subfolder","type"}

External steps are the repo avatar-stack's own scripts, invoked
with their REAL command lines (read from the scripts themselves):

    parity/preflight.py     --workflow W [--workflow W ...]
                            [--reference P --expected-sha256 H ...]
                            --out PACKET     (exit 0 pass / 2 fail)
    parity/frame1_gate.py   --clip C --reference R
                            [--reference-sha256 H] --species S
                            --likeness-gate PATH --scratch DIR
                            --out PACKET     (packet verdict PASS req.)
    likeness_gate.py        --clip C --species S [--cutouts DIR]
                            --out PACKET     (exit 0 writes PASS *or*
                            FAIL — the packet verdict is the verdict;
                            exit 2 = FAIL_CANNOT_MEASURE)
    freedom/chain_segments.py  SEG... --out CHAINED [--report R]
    white_matte.py          IN OUT           (positional; VP9 alpha)
    freedom/scene_composite.py BG OUT --layer CLIP --x --y
                            --scale --z --start   (per layer)
                            [--workdir DIR]  (draws contact shadows
                            itself — shadows live at composite time)

Which script fills which role comes from the job's own pipeline
block (the .py names it specifies). A role the job does not name
falls back to the repo-standard file named above. A script that
cannot be found is a HARD failure before any GPU time is spent —
never a silent skip. The one exception is --dry-run, which prints
the full plan (FOUND/MISSING per script) and exits 0: scripts live
in the repo checkout next to this pack at run time, not inside the
pack itself.

Prompt handling follows the repo kernel's convention: the graphs'
authored prompts run as written. The runner patches only
  * every LoadImage node's image  <- the uploaded reference still
  * sampler seed (KSampler / WanVideoSampler) <- segment "seed"
  * SaveVideo filename_prefix     <- <scene>_<character>_segNN
  * the positive prompt IF a segment carries an explicit
    "positive_prompt"/"prompt" field (VACE graph: the CLIPTextEncode
    reached through WanVaceToVideo's "positive" link; Turbo graph:
    WanVideoTextEncode's "positive_prompt").
A segment's free-text "action" is the authoring record (see
PROMPT-PATTERNS); composing it into a prompt is a job-authoring
step, not something this runner invents at run time. The plan and
the run report say, per segment, which prompt was used.

Views: a segment's still comes from its view.source_still (or a
segment-level source_still / start_image / reference_image field).
Reference packs are multi-view STILLS and the source of truth;
video packs gain views FROM those stills — a view is never
generated from nothing, so a placeholder ("AUTHORING-TIME: ...")
or missing still aborts the character before submission.

Stdlib only. No GPU work happens in this process — it drives a
local ComfyUI server (default http://127.0.0.1:8188).
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

PACK_DIR = Path(__file__).resolve().parent
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".mkv"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}

# Repo-standard script per role (relative to the avatar-stack root).
# The job's pipeline block overrides the file name when it names a
# .py for the role; these defaults are the files README.md lists.
DEFAULT_SCRIPTS = {
    "preflight": "parity/preflight.py",
    "frame1_gate": "parity/frame1_gate.py",
    "likeness_gate": "likeness_gate.py",
    "chain": "freedom/chain_segments.py",
    "matte": "white_matte.py",
    "composite": "freedom/scene_composite.py",
}
ROLE_KEYWORDS = {
    "preflight": ("preflight",),
    "frame1_gate": ("frame1", "frame_1", "frame-1"),
    "likeness_gate": ("likeness",),
    "chain": ("chain",),
    "matte": ("matte", "birefnet"),
    "composite": ("composite",),
}


def sha256_of(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def die(msg):
    print(f"\nFATAL: {msg}")
    sys.exit(1)


# ---------------------------------------------------------------- job

def load_job(path):
    try:
        job = json.loads(Path(path).read_text())
    except Exception as e:  # noqa: BLE001
        die(f"job file {path} does not parse as JSON: {e}")
    errs = []
    if not isinstance(job, dict):
        die("job file is not a JSON object")
    if not job.get("scene_id"):
        errs.append("job.scene_id is missing")
    chars = job.get("characters")
    if not isinstance(chars, list) or not chars:
        errs.append("job.characters must be a non-empty list")
        chars = []
    for ci, ch in enumerate(chars):
        if not ch.get("character"):
            errs.append(f"characters[{ci}].character is missing")
        segs = ch.get("segments")
        if not isinstance(segs, list) or not segs:
            errs.append(f"characters[{ci}].segments must be a non-empty list")
            continue
        for si, seg in enumerate(segs):
            if "seed" not in seg:
                errs.append(f"characters[{ci}].segments[{si}].seed is missing "
                            "(the graphs' sampler seed is patched from it)")
    return job, errs


def pipeline_texts(job):
    """All descriptive strings in job.pipeline, flattened."""
    out = []

    def walk(v):
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, list):
            for x in v:
                walk(x)

    walk(job.get("pipeline") or {})
    return out


def resolve_scripts(job, avatar_stack):
    """role -> (relative name, resolved Path or None)."""
    texts = pipeline_texts(job)
    named = {}
    for t in texts:
        for tok in re.findall(r"[\w./-]+\.py\b", t):
            named.setdefault(tok, tok)
    scripts = {}
    for role, default_rel in DEFAULT_SCRIPTS.items():
        rel = default_rel
        for tok in named.values():
            base = tok.rsplit("/", 1)[-1].lower()
            if any(k in base for k in ROLE_KEYWORDS[role]):
                rel = tok
                break
        p = (avatar_stack / rel).resolve()
        scripts[role] = (rel, p if p.is_file() else None)
    return scripts


def job_workflows(job):
    gen = ((job.get("pipeline") or {}).get("generation") or {})
    primary = gen.get("primary_workflow") or "workflows/workflow-i2v-locked.json"
    fast = gen.get("fast_lane_workflow") or "workflows/workflow-turbo-fixed.json"
    return primary, fast


def segment_workflow_rel(seg, ch, job, primary, fast):
    if seg.get("workflow"):
        return seg["workflow"]
    if ch.get("workflow"):
        return ch["workflow"]
    if seg.get("fast_lane") or ch.get("fast_lane"):
        return fast
    return primary


def load_workflow(rel):
    p = (PACK_DIR / rel).resolve()
    if not p.is_file():
        die(f"workflow named by the job does not exist in the pack: {rel}")
    try:
        wf = json.loads(p.read_text())
    except Exception as e:  # noqa: BLE001
        die(f"workflow {rel} does not parse as JSON: {e}")
    if not isinstance(wf, dict) or not wf:
        die(f"workflow {rel} is not an API-format graph (object of nodes)")
    bad = [k for k, v in wf.items()
           if not isinstance(v, dict) or "class_type" not in v]
    if bad:
        die(f"workflow {rel}: nodes without class_type: {bad[:5]} — "
            "not API format (export with ComfyUI's API-format save)")
    return wf


def parse_still(seg):
    """-> (path_str, sha256_or_None, is_placeholder)."""
    raw = None
    view = seg.get("view") or {}
    for cand in (view.get("source_still"), seg.get("source_still"),
                 seg.get("start_image"), seg.get("reference_image"),
                 view.get("still")):
        if cand:
            raw = str(cand)
            break
    if raw is None:
        return None, None, False
    if raw.lstrip().upper().startswith("AUTHORING-TIME"):
        return raw, None, True
    sha = None
    m = re.search(r"\b[0-9a-fA-F]{64}\b", raw)
    if m:
        sha = m.group(0).lower()
    path = None
    for tok in re.split(r"[\s,;]+", raw):
        if Path(tok).suffix.lower() in IMAGE_EXTS and "/" in tok:
            path = tok
            break
    if path is None:  # maybe the whole string is a bare filename/path
        t = raw.strip()
        if Path(t).suffix.lower() in IMAGE_EXTS:
            path = t
    return path, sha, False


def find_existing(rel_or_abs, bases):
    p = Path(rel_or_abs)
    if p.is_absolute():
        return p if p.is_file() else None
    for b in bases:
        cand = (b / p)
        if cand.is_file():
            return cand.resolve()
    return None


# ------------------------------------------------------------- comfy

class Comfy:
    def __init__(self, base):
        self.base = base.rstrip("/")
        self.client_id = f"gpu-4090-{uuid.uuid4().hex[:12]}"

    def _open(self, req, timeout=60):
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()

    def post_prompt(self, graph):
        body = json.dumps({"prompt": graph,
                           "client_id": self.client_id}).encode()
        req = urllib.request.Request(
            f"{self.base}/prompt", data=body,
            headers={"Content-Type": "application/json"})
        try:
            resp = json.loads(self._open(req))
        except Exception as e:  # noqa: BLE001
            die(f"POST /prompt failed ({self.base}): {e}")
        if "prompt_id" not in resp:
            die(f"POST /prompt returned no prompt_id: "
                f"{json.dumps(resp)[:600]}")
        return resp["prompt_id"]

    def history(self, prompt_id):
        req = urllib.request.Request(f"{self.base}/history/{prompt_id}")
        try:
            return json.loads(self._open(req, timeout=30))
        except Exception:  # noqa: BLE001 — treated as "not ready yet"
            return {}

    def wait(self, prompt_id, timeout_s, poll_s):
        t0 = time.time()
        while time.time() - t0 < timeout_s:
            entry = self.history(prompt_id).get(prompt_id)
            if entry:
                status = entry.get("status") or {}
                if status.get("status_str") == "error":
                    raise RuntimeError(
                        f"ComfyUI execution error: "
                        f"{json.dumps(status)[:600]}")
                if status.get("completed"):
                    return entry, time.time() - t0
            time.sleep(poll_s)
        raise RuntimeError(f"timed out after {timeout_s}s "
                           f"(prompt_id {prompt_id})")

    def view(self, filename, subfolder, ftype):
        q = urllib.parse.urlencode({"filename": filename,
                                    "subfolder": subfolder or "",
                                    "type": ftype or "output"})
        req = urllib.request.Request(f"{self.base}/view?{q}")
        return self._open(req, timeout=300)

    def upload_image(self, path):
        """POST /upload/image (multipart: image, type, subfolder,
        overwrite) -> the name LoadImage must reference."""
        data = Path(path).read_bytes()
        boundary = f"----gpu4090{uuid.uuid4().hex}"
        parts = []

        def field(name, value):
            parts.append(f"--{boundary}\r\nContent-Disposition: "
                         f"form-data; name=\"{name}\"\r\n\r\n"
                         f"{value}\r\n".encode())

        def filefield(name, fname, blob):
            parts.append(
                f"--{boundary}\r\nContent-Disposition: form-data; "
                f"name=\"{name}\"; filename=\"{fname}\"\r\n"
                f"Content-Type: application/octet-stream\r\n\r\n"
                .encode() + blob + b"\r\n")

        filefield("image", Path(path).name, data)
        field("type", "input")
        field("subfolder", "")
        field("overwrite", "true")
        parts.append(f"--{boundary}--\r\n".encode())
        body = b"".join(parts)
        req = urllib.request.Request(
            f"{self.base}/upload/image", data=body,
            headers={"Content-Type":
                     f"multipart/form-data; boundary={boundary}"})
        try:
            resp = json.loads(self._open(req, timeout=120))
        except Exception as e:  # noqa: BLE001
            die(f"POST /upload/image failed for {path}: {e}")
        name = resp.get("name")
        if not name:
            die(f"/upload/image returned no name: {json.dumps(resp)[:300]}")
        sub = resp.get("subfolder") or ""
        return f"{sub}/{name}" if sub else name


def patch_graph(wf, uploaded_name, seg, prefix):
    """Patch a deep copy of the graph for one segment. Returns
    (graph, notes) — notes say exactly what was and was not patched."""
    g = json.loads(json.dumps(wf))
    notes = []
    for node in g.values():
        ct = node.get("class_type")
        inp = node.setdefault("inputs", {})
        if ct == "LoadImage" and uploaded_name:
            inp["image"] = uploaded_name
        if ct in ("KSampler", "WanVideoSampler") and "seed" in seg:
            inp["seed"] = seg["seed"]
        if ct == "SaveVideo":
            inp["filename_prefix"] = prefix
    explicit = seg.get("positive_prompt") or seg.get("prompt")
    if explicit:
        done = False
        for node in g.values():
            if node.get("class_type") == "WanVideoTextEncode":
                node["inputs"]["positive_prompt"] = explicit
                done = True
        for node in g.values():
            if node.get("class_type") == "WanVaceToVideo":
                link = node["inputs"].get("positive")
                if isinstance(link, list) and str(link[0]) in g:
                    tgt = g[str(link[0])]
                    if tgt.get("class_type") == "CLIPTextEncode":
                        tgt["inputs"]["text"] = explicit
                        done = True
        notes.append("positive prompt: segment's explicit "
                     "positive_prompt/prompt field"
                     if done else
                     "WARNING: segment carries an explicit prompt but "
                     "no patchable positive-prompt node was found — "
                     "graph prompt used as authored")
    else:
        notes.append("positive prompt: graph's authored prompt "
                     "(segment 'action' is the authoring record; "
                     "composing it into a prompt is a job-authoring "
                     "step — see PROMPT-PATTERNS)")
    notes.append("graph length/fps/resolution: as authored "
                 "(duration_s stays the job's timing-map value)")
    return g, notes


def collect_outputs(entry):
    files = []
    for node_out in (entry.get("outputs") or {}).values():
        if not isinstance(node_out, dict):
            continue
        for v in node_out.values():
            if isinstance(v, list):
                for item in v:
                    if isinstance(item, dict) and "filename" in item:
                        files.append(item)
    return files


# ------------------------------------------------------- external steps

def run_step(label, argv, log_path):
    log_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"  [{label}] {' '.join(str(a) for a in argv)}")
    with open(log_path, "w") as lf:
        r = subprocess.run([str(a) for a in argv],
                           stdout=lf, stderr=subprocess.STDOUT)
    if r.returncode != 0:
        print(f"  [{label}] FAILED (exit {r.returncode}) — log: {log_path}")
    return r.returncode


def packet_verdict(packet_path):
    try:
        d = json.loads(Path(packet_path).read_text())
    except Exception:  # noqa: BLE001
        return None
    return d.get("verdict")


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--job", required=True, help="scene job JSON")
    ap.add_argument("--comfy-url", "--comfy", dest="comfy_url",
                    default="http://127.0.0.1:8188",
                    help="ComfyUI base URL (default %(default)s)")
    ap.add_argument("--out", "--workdir", dest="out", default=None,
                    help="output directory (default: ./out-<scene_id>)")
    ap.add_argument("--avatar-stack", default=None,
                    help="path to the repo avatar-stack/ checkout the "
                         "gate/composite scripts live in (default: "
                         "this pack's parent directory)")
    ap.add_argument("--cutouts", default=None,
                    help="canon cutouts dir for likeness_gate.py "
                         "(default: the gate's own default)")
    ap.add_argument("--birefnet-script", default=None,
                    help="path to a BiRefNet cutout script — required "
                         "only if a job asks for the BiRefNet backup; "
                         "no such script ships in this pack")
    ap.add_argument("--poll-interval", type=float, default=5.0)
    ap.add_argument("--timeout", type=float, default=2400.0,
                    help="per-segment ComfyUI timeout, seconds "
                         "(default %(default)s, the repo kernel's)")
    ap.add_argument("--dry-run", action="store_true",
                    help="validate job + workflows and print the plan; "
                         "contact nothing, run nothing")
    args = ap.parse_args()

    job, errs = load_job(args.job)
    pack = PACK_DIR
    avatar_stack = (Path(args.avatar_stack).resolve()
                    if args.avatar_stack else pack.parent)
    primary, fast = job_workflows(job)
    scripts = resolve_scripts(job, avatar_stack)
    scene = job.get("scene_id", "scene")
    out = Path(args.out).resolve() if args.out else (
        Path.cwd() / f"out-{scene}")

    # validate every workflow the job can select, up front
    wf_cache = {}
    for rel in {primary, fast} | {
            segment_workflow_rel(s, c, job, primary, fast)
            for c in job.get("characters", []) for s in c.get("segments", [])}:
        wf_cache[rel] = load_workflow(rel)

    bases = [Path.cwd(), avatar_stack, avatar_stack.parents[2]
             if len(avatar_stack.parents) >= 3 else avatar_stack]
    bg_raw = ((job.get("background") or {}).get("clip"))
    bg_path = find_existing(bg_raw, bases) if bg_raw else None

    # ------------------------------------------------------------ plan
    plan = []
    plan.append(f"scene: {scene}")
    plan.append(f"comfy: {args.comfy_url}   out: {out}")
    plan.append(f"avatar-stack (gate/composite scripts): {avatar_stack}")
    for role, (rel, p) in sorted(scripts.items()):
        state = str(p) if p else "MISSING (expected in the repo checkout at run time)"
        plan.append(f"  script[{role}]: {rel} -> {state}")
    plan.append(f"  background: {bg_raw} -> "
                f"{bg_path if bg_path else 'NOT FOUND locally'}")
    for ch in job.get("characters", []):
        plan.append(f"character: {ch['character']}  layer: "
                    f"{json.dumps(ch.get('layer') or {})}")
        for si, seg in enumerate(ch.get("segments", [])):
            rel = segment_workflow_rel(seg, ch, job, primary, fast)
            still, sha, ph = parse_still(seg)
            still_desc = ("AUTHORING-TIME placeholder (must be filled "
                          "before a real run)" if ph else
                          (still or "none named in the job"))
            plan.append(f"  seg{si}: workflow={rel} seed={seg.get('seed')} "
                        f"duration_s={seg.get('duration_s')} "
                        f"still={still_desc}"
                        + (f" sha256={sha[:16]}..." if sha else ""))
            plan.append(f"        action: {str(seg.get('action'))[:100]}")
    plan.append("order per character: generate -> frame1_gate -> "
                "chain -> likeness_gate -> cutout (white_matte "
                "primary) -> composite over living background "
                "(shadows drawn by scene_composite) -> grade "
                "(only if the job names a post script)")

    if args.dry_run:
        print("DRY RUN — job and workflow validation")
        for e in errs:
            print(f"  ERROR: {e}")
        for line in plan:
            print(line)
        missing = [r for r, (_, p) in scripts.items() if p is None]
        if missing:
            print(f"note: scripts not found under {avatar_stack}: "
                  f"{missing} — dry-run reports them; a real run "
                  "refuses to start without them.")
        if errs:
            print("dry-run result: JOB INVALID")
            return 1
        print("dry-run result: OK (job parses, workflows parse and "
              "are API-format, plan above)")
        return 0

    # ------------------------------------------------------- real run
    if errs:
        for e in errs:
            print(f"ERROR: {e}")
        die("job is invalid — fix it or validate with --dry-run")
    missing = {r: rel for r, (rel, p) in scripts.items() if p is None}
    if missing:
        die("required repo scripts not found under "
            f"{avatar_stack}: {missing}. run_scene.py never skips a "
            "gate/composite step silently — point --avatar-stack at "
            "the repo checkout that holds avatar-stack/.")
    if bg_raw and bg_path is None:
        die(f"background clip not found: {bg_raw} (tried relative "
            f"to {bases}) — the composite runs over the job's living "
            "background, so it must exist before GPU time is spent")

    for line in plan:
        print(line)
    out.mkdir(parents=True, exist_ok=True)
    logs = out / "logs"
    report = {"scene_id": scene, "job": str(Path(args.job).resolve()),
              "comfy_url": args.comfy_url, "started_unix": time.time(),
              "characters": {}, "status": "RUNNING"}
    report_path = out / "RUN-REPORT.json"

    def save_report():
        report["updated_unix"] = time.time()
        report_path.write_text(json.dumps(report, indent=2) + "\n")

    comfy = Comfy(args.comfy_url)
    py = sys.executable

    # preflight (once, before GPU time)
    pf_argv = [py, scripts["preflight"][1]]
    for rel in dict.fromkeys(wf_cache):
        pf_argv += ["--workflow", str((pack / rel).resolve())]
    refs = []
    for ch in job["characters"]:
        for seg in ch["segments"]:
            still, sha, ph = parse_still(seg)
            if still and sha and not ph:
                sp = find_existing(still, bases)
                if sp:
                    refs += ["--reference", str(sp),
                             "--expected-sha256", sha]
    pf_argv += refs + ["--out", str(out / "preflight.json")]
    if run_step("preflight", pf_argv, logs / "preflight.log") != 0:
        report["status"] = "ABORTED_PREFLIGHT"
        save_report()
        die("preflight failed — see logs/preflight.log and "
            "preflight.json. No GPU time was spent on segments.")

    composite_layers = []  # (cutout_path, layer_dict) for passed chars
    any_fail = False

    for ch in job["characters"]:
        name = ch["character"]
        cdir = out / name
        cdir.mkdir(parents=True, exist_ok=True)
        crec = {"status": "RUNNING", "segments": []}
        report["characters"][name] = crec
        save_report()
        print(f"\n=== character: {name} ===")
        seg_videos = []
        failed = False

        for si, seg in enumerate(ch["segments"]):
            srec = {"index": si, "seed": seg.get("seed")}
            crec["segments"].append(srec)
            still_raw, sha, ph = parse_still(seg)
            if ph or not still_raw:
                srec["status"] = "FAIL_NO_STILL"
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: FAIL — no usable reference still "
                      f"({still_raw!r}). Views come from the "
                      "reference-pack stills; a view is never "
                      "generated from nothing.")
                break
            still_path = find_existing(still_raw, bases)
            if still_path is None:
                srec["status"] = "FAIL_STILL_NOT_FOUND"
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: FAIL — reference still not found: "
                      f"{still_raw}")
                break
            if sha and sha256_of(still_path) != sha:
                srec["status"] = "FAIL_STILL_HASH"
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: FAIL — still sha256 mismatch for "
                      f"{still_path}")
                break
            srec["still"] = str(still_path)

            rel = segment_workflow_rel(seg, ch, job, primary, fast)
            uploaded = comfy.upload_image(still_path)
            prefix = f"{scene}_{name}_seg{si:02d}"
            graph, notes = patch_graph(wf_cache[rel], uploaded,
                                       seg, prefix)
            srec["workflow"] = rel
            srec["patch_notes"] = notes
            for n in notes:
                print(f"  seg{si}: {n}")
            t0 = time.time()
            pid = comfy.post_prompt(graph)
            srec["prompt_id"] = pid
            print(f"  seg{si}: submitted {rel} as {pid}")
            try:
                entry, secs = comfy.wait(pid, args.timeout,
                                         args.poll_interval)
            except RuntimeError as e:
                srec["status"] = "FAIL_COMFY"
                srec["error"] = str(e)
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: FAIL — {e}")
                break
            srec["seconds"] = round(secs, 1)
            sdir = cdir / "segments" / f"seg{si:02d}"
            sdir.mkdir(parents=True, exist_ok=True)
            (sdir / "history.json").write_text(
                json.dumps(entry, indent=2) + "\n")
            videos = []
            for f in collect_outputs(entry):
                dest = sdir / f["filename"]
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(comfy.view(f["filename"],
                                            f.get("subfolder", ""),
                                            f.get("type", "output")))
                if dest.suffix.lower() in VIDEO_EXTS:
                    videos.append(dest)
            if not videos:
                srec["status"] = "FAIL_NO_VIDEO_OUTPUT"
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: FAIL — history carried no video "
                      "output to download via /view")
                break
            clip = videos[0]
            srec["clip"] = str(clip)
            srec["clip_sha256"] = sha256_of(clip)
            print(f"  seg{si}: done in {secs:.1f}s -> {clip.name}")

            # frame-1 gate BEFORE anything else touches the clip
            pkt = sdir / "frame1_gate.json"
            argv = [py, scripts["frame1_gate"][1],
                    "--clip", str(clip),
                    "--reference", str(still_path),
                    "--species", name,
                    "--likeness-gate", str(scripts["likeness_gate"][1]),
                    "--scratch", str(sdir / "frame1-scratch"),
                    "--out", str(pkt)]
            if sha:
                argv += ["--reference-sha256", sha]
            rc = run_step(f"frame1_gate[{name}/seg{si}]", argv,
                          logs / f"frame1-{name}-seg{si:02d}.log")
            verdict = packet_verdict(pkt)
            srec["frame1_gate"] = {"packet": str(pkt),
                                   "verdict": verdict, "exit": rc}
            if verdict != "PASS":
                srec["status"] = "FAIL_FRAME1_GATE"
                crec["status"] = "FAILED"
                any_fail = failed = True
                print(f"  seg{si}: GATE FAIL (verdict={verdict}, "
                      f"exit={rc}) — character stopped here; this "
                      "clip is never chained, cut out or composited.")
                break
            srec["status"] = "PASS"
            seg_videos.append(clip)
            save_report()

        if failed:
            continue

        # chain segments (play order)
        chained = cdir / f"{name}_chained.mp4"
        rc = run_step(f"chain[{name}]",
                      [py, scripts["chain"][1],
                       *[str(v) for v in seg_videos],
                       "--out", str(chained),
                       "--report", str(cdir / "chain-report.json"),
                       "--workdir", str(cdir / "chain-work")],
                      logs / f"chain-{name}.log")
        if rc != 0 or not chained.is_file():
            crec["status"] = "FAILED_CHAIN"
            any_fail = True
            continue
        crec["chained_clip"] = str(chained)
        crec["chained_sha256"] = sha256_of(chained)

        # likeness gate on the chained character clip
        pkt = cdir / "likeness_gate.json"
        argv = [py, scripts["likeness_gate"][1],
                "--clip", str(chained), "--species", name,
                "--out", str(pkt),
                "--debug-dir", str(cdir / "likeness-debug")]
        cut = find_existing(args.cutouts, bases) if args.cutouts else None
        if cut:
            argv += ["--cutouts", str(cut)]
        rc = run_step(f"likeness_gate[{name}]", argv,
                      logs / f"likeness-{name}.log")
        verdict = packet_verdict(pkt)
        crec["likeness_gate"] = {"packet": str(pkt),
                                 "verdict": verdict, "exit": rc}
        if verdict != "PASS":
            crec["status"] = "FAILED_LIKENESS_GATE"
            any_fail = True
            print(f"  {name}: LIKENESS GATE FAIL (verdict={verdict}) "
                  "— character is not cut out or composited.")
            save_report()
            continue

        # cutout — white_matte primary; BiRefNet only if the job
        # asks for it by name, and only with a script to run
        wants_birefnet = "birefnet" in json.dumps(
            (ch.get("cutout") or "")).lower() or "birefnet" in (
            ((job.get("pipeline") or {}).get("cutout") or {})
            .get("primary", "")).lower()
        cutout = cdir / f"{name}_cutout.webm"
        if wants_birefnet:
            bn = (Path(args.birefnet_script).resolve()
                  if args.birefnet_script else None)
            if bn is None or not bn.is_file():
                crec["status"] = "FAILED_CUTOUT_NO_BIREFNET_SCRIPT"
                any_fail = True
                print(f"  {name}: FAIL — the job asks for the BiRefNet "
                      "backup but no BiRefNet script ships in this "
                      "pack and none was given via --birefnet-script. "
                      "Failing loud instead of silently falling back.")
                save_report()
                continue
            rc = run_step(f"cutout-birefnet[{name}]",
                          [py, str(bn), str(chained), str(cutout)],
                          logs / f"cutout-{name}.log")
        else:
            rc = run_step(f"cutout-white_matte[{name}]",
                          [py, scripts["matte"][1],
                           str(chained), str(cutout)],
                          logs / f"cutout-{name}.log")
        if rc != 0 or not cutout.is_file():
            crec["status"] = "FAILED_CUTOUT"
            any_fail = True
            continue
        crec["cutout"] = str(cutout)
        crec["cutout_sha256"] = sha256_of(cutout)
        crec["status"] = "PASS"
        composite_layers.append((cutout, ch.get("layer") or {}))
        save_report()

    # composite over the living background (passing characters only)
    if composite_layers:
        comp_out = out / f"{scene}_composite.mp4"
        argv = [py, scripts["composite"][1], str(bg_path),
                str(comp_out), "--workdir", str(out / "scene-work")]
        for clip, lay in composite_layers:
            argv += ["--layer", str(clip),
                     "--x", str(lay.get("x", 0.5)),
                     "--y", str(lay.get("y", 0.95)),
                     "--scale", str(lay.get("scale", 0.6)),
                     "--z", str(lay.get("z_order", 0)),
                     "--start", str(lay.get("start_offset_s", 0.0))]
        rc = run_step("composite", argv, logs / "composite.log")
        if rc != 0 or not comp_out.is_file():
            report["status"] = "FAILED_COMPOSITE"
            save_report()
            die("scene_composite.py failed — see logs/composite.log")
        report["composite"] = {"path": str(comp_out),
                               "sha256": sha256_of(comp_out),
                               "layers": [str(c)
                                          for c, _ in composite_layers],
                               "complete": not any_fail}
        print(f"composite -> {comp_out} "
              f"({'complete' if not any_fail else 'INCOMPLETE — '
               'a character failed and was excluded'})")

        # post: shadows are drawn by scene_composite itself, at
        # composite time. Grade runs ONLY if the job names a script.
        post_text = str(((job.get("pipeline") or {}).get("post")) or "")
        m = re.search(r"[\w./-]+\.py\b", post_text)
        if m:
            grade = find_existing(m.group(0), [avatar_stack])
            if grade is None:
                report["status"] = "FAILED_POST_SCRIPT_MISSING"
                save_report()
                die(f"the job names a post/grade script "
                    f"({m.group(0)}) that is not in the avatar-stack "
                    "checkout — failing loud, not skipping it.")
            graded = out / f"{scene}_composite_graded.mp4"
            rc = run_step("post-grade",
                          [py, str(grade), str(comp_out), str(graded)],
                          logs / "post-grade.log")
            if rc != 0 or not graded.is_file():
                report["status"] = "FAILED_POST"
                save_report()
                die("post/grade script failed — see logs/post-grade.log")
            report["graded"] = {"path": str(graded),
                                "sha256": sha256_of(graded)}
        else:
            report["post_grade"] = (
                "NOT_PERFORMED_NO_SCRIPT_NAMED — the job's post step "
                "names no script; shadows were drawn at composite "
                "time by scene_composite.py, and the composite is "
                "UNGRADED. This is recorded, not skipped silently.")
            print("post: no grade script named in the job — "
                  "composite is ungraded (recorded in RUN-REPORT.json)")
    else:
        print("no character passed its gates — no composite built")
        any_fail = True

    report["status"] = "COMPLETED_WITH_FAILURES" if any_fail else "PASS"
    save_report()
    print(f"\nrun report: {report_path}  status: {report['status']}")
    return 1 if any_fail else 0


if __name__ == "__main__":
    sys.exit(main())
