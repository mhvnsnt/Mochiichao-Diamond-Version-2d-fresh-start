# BUILD-REPORT — gpu-4090 pack

Built 2026-10-28, locally staged at
`show/production/tooling/avatar-stack/gpu-4090/` (this folder).
**Not pushed to GitHub. No GPU was rented. No run on a real 4090
has happened** — the pack's status is **WIRED UNPROVEN** (README).

## Pack files — bytes + sha256

Paths are relative to this folder. Hashes were computed on the
files as they stand at delivery. (`__pycache__/` produced by the
py_compile validation was deleted afterwards; it is a build
artifact, not a pack file.)

| File | Bytes | sha256 |
|---|---:|---|
| `BUILD-REPORT.md` | self | — (this file; no self-hash) |
| `README.md` | 9259 | c2d417aff5afdcff4a0859c4b8574ddd27da8d09038cbc63b1d858dc0be4ed11 |
| `DECOMP-MAP.md` | 9457 | acfaeab26a327942031d8d4b12e4ea9cf8fc31cf7a765de5e9afb270b992ee9e |
| `MODELS-MANIFEST.md` | 8528 | 8fc02f7677b4007c0c9518568f918c74f1f30528f193bbbaa8e4018aaaa53b48 |
| `MODELS-MANIFEST.json` | 22524 | b6855ff2fce2bf65a225ea464253ced2579cfb6cd637c4668aa36587870fb601 |
| `Dockerfile` | 2880 | 7571aa96b2e0752bc04aeac946597a00955046ee3f427f37b580a1318492f31d |
| `download_models.py` | 6684 | 1b564f14b061df85aa0bc65055c42b3661364be1e10ea65a32036b587a12abc3 |
| `download_models.sh` | 614 | a32dfb0eaa8bfd31e7df217a6fa829834dcf91ce3963b35b489c07a5c1269c5c |
| `run_scene.py` | 37002 | e36b47a514b272358039b596587daaf117aa442ba0e26cfedf64922fe3af6e19 |
| `jobs/scene_job.4090.example.json` | 9067 | afeb4268561649e9366aaedd4c2f5c9df130ece0732e0cfeb559d43e1bd9478d |
| `runpod/template.json` | 1778 | 98bb113ed612eb8f843d02dc298dd5ab4077e4976e5d78f1f45e2eeb3d397e50 |
| `runpod/start.sh` | 1397 | 486d0cf2758dbdb5f8e5513b43878f7625c4ee23f931bd4e69f9ce4ab27cc312 |
| `vast/INSTANCE-NOTES.md` | 8996 | 3c373bc15617cc377ecf04cec50ffc039a42381280317a99e0be605dda73074d |
| `vast/onstart.sh` | 1323 | abdc2ef4fcc045544917e5e87111d165a0d63e50f3c063549ff4cd077ef53e28 |
| `workflows/CHANGES.md` | 4158 | 585879d076f4a5cbef97331a53e57f58f626b39571b0afb0e11c0f600b525c52 |
| `workflows/a14b-quality-tier.json` | 1515 | 79a988d35b37a472883f5ae6f5a9c2902599dc43f7086648f2b78ac267e1a163 |
| `workflows/workflow-i2v-locked.json` | 3715 | d85e6716dba63405b143f0f7097226882fa8eeb8a454e9c59e0ee6f67527f1fd |
| `workflows/workflow-turbo-fixed.json` | 4227 | 7a0fa8d644b6dec1c94df435b3ddf2eff04fddb4478d6ca83df19aee9148a11c |

The two workflow graphs are byte-identical copies of the repo's
`parity/workflow-i2v-locked.json` / `parity/workflow-turbo-fixed.json`
(their git blob SHAs and the no-node-changed statement are in
`workflows/CHANGES.md`).

## Validations actually run (2026-10-28, this build session)

| Check | Files | Result |
|---|---|---|
| `python3 -m json.tool` | `MODELS-MANIFEST.json`, `jobs/scene_job.4090.example.json`, `runpod/template.json`, `workflows/workflow-i2v-locked.json`, `workflows/workflow-turbo-fixed.json`, `workflows/a14b-quality-tier.json` | **OK — all 6 parse** |
| `python3 -m py_compile` | `download_models.py`, `run_scene.py` | **OK — both compile.** Honest build log: the first compile of `run_scene.py` caught a broken multi-line f-string (SyntaxError, line 513); it was fixed and the re-run passed. The hashes above are for the fixed file. |
| `bash -n` | `download_models.sh`, `runpod/start.sh`, `vast/onstart.sh` | **OK — all 3 parse** |
| `run_scene.py --dry-run` on the example job (default script resolution) | `jobs/scene_job.4090.example.json` + both workflows | **Exit 0** — job parses, both workflows parse and are API-format, plan printed. All 6 external scripts correctly reported MISSING under the pack-staging tree (they live in the repo checkout, not the pack) and the example job's AUTHORING-TIME still placeholders correctly reported. Full output below. |
| `run_scene.py --dry-run --avatar-stack <real repo checkout copy>` | same job | **Exit 0** — all 6 scripts (preflight, frame1_gate, likeness_gate, chain, matte/white_matte, composite) resolve to real files. Background living clip not present in that copy — reported, not hidden. |
| Endpoint shapes for `run_scene.py` | ComfyUI `POST /prompt` (`{"prompt","client_id"}` → `prompt_id`), `GET /history/{prompt_id}` (`status.completed` / `status_str`), `GET /view` (`filename`/`subfolder`/`type`), `POST /upload/image` (multipart `image`/`type`/`subfolder`/`overwrite`) | Verified against ComfyUI's documented server routes (docs.comfy.org API material) AND the repo's own `parity/locked_run_kernel.py`, which submits and polls exactly this way (`client_id` string, 5 s poll, history `status` checks). No endpoint was invented. |
| External-script CLIs for `run_scene.py` | `parity/preflight.py` (`--workflow` repeatable, `--reference`/`--expected-sha256`, exit 0/2), `parity/frame1_gate.py` (`--clip --reference --species --likeness-gate --out`; packet `verdict` PASS/FAIL), `likeness_gate.py` (`--clip --species --out`; **exit 0 writes PASS *or* FAIL — packet verdict rules; exit 2 = FAIL_CANNOT_MEASURE**), `freedom/chain_segments.py` (positional segments + `--out`), `white_matte.py` (positional in/out), `freedom/scene_composite.py` (positional background/out + per-layer `--layer/--x/--y/--scale/--z/--start`; draws the contact shadows itself) | Read from the scripts' own argparse in a local copy of the repo checkout — the runner calls them with these real argument shapes, and treats a gate as passed only when its packet `verdict` is `PASS`. |

### Dry-run output (verbatim, default resolution)

```
DRY RUN — job and workflow validation
scene: freedom-test-gate-wispkin-dorowani-01-4090
comfy: http://127.0.0.1:8188   out: <pack>/gpu-4090/out-freedom-test-gate-wispkin-dorowani-01-4090
avatar-stack (gate/composite scripts): <pack>/avatar-stack
  script[chain]: freedom/chain_segments.py -> MISSING (expected in the repo checkout at run time)
  script[composite]: freedom/scene_composite.py -> MISSING (expected in the repo checkout at run time)
  script[frame1_gate]: parity/frame1_gate.py -> MISSING (expected in the repo checkout at run time)
  script[likeness_gate]: likeness_gate.py -> MISSING (expected in the repo checkout at run time)
  script[matte]: white_matte.py -> MISSING (expected in the repo checkout at run time)
  script[preflight]: parity/preflight.py -> MISSING (expected in the repo checkout at run time)
  background: show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4 -> NOT FOUND locally
character: wispkin  layer: {"scale": 0.5, "start_offset_s": 0.0, "x": 0.3, "y": 0.92, "z_order": 1}
  seg0: workflow=workflows/workflow-i2v-locked.json seed=1201 duration_s=3.0 still=AUTHORING-TIME placeholder (must be filled before a real run)
  seg1: workflow=workflows/workflow-i2v-locked.json seed=1202 duration_s=3.0 still=AUTHORING-TIME placeholder (must be filled before a real run)
character: dorowani  layer: {"scale": 0.62, "start_offset_s": 0.5, "x": 0.68, "y": 0.95, "z_order": 2}
  seg0: workflow=workflows/workflow-i2v-locked.json seed=2201 duration_s=2.0 still=AUTHORING-TIME placeholder (must be filled before a real run)
  seg1: workflow=workflows/workflow-i2v-locked.json seed=2202 duration_s=3.0 still=AUTHORING-TIME placeholder (must be filled before a real run)
  seg2: workflow=workflows/workflow-i2v-locked.json seed=2203 duration_s=2.0 still=AUTHORING-TIME placeholder (must be filled before a real run)
order per character: generate -> frame1_gate -> chain -> likeness_gate -> cutout (white_matte primary) -> composite over living background (shadows drawn by scene_composite) -> grade (only if the job names a post script)
note: scripts not found under <pack>/avatar-stack: ['preflight', 'frame1_gate', 'likeness_gate', 'chain', 'matte', 'composite'] — dry-run reports them; a real run refuses to start without them.
dry-run result: OK (job parses, workflows parse and are API-format, plan above)
```

(Angle-bracket `<pack>` replaces the local staging path prefix in
two lines; segment `action:` lines are omitted here — they echo
the job file, which is hashed above. Nothing else was edited.)

## GAP list — everything not proven, carried on purpose

1. **Not yet run on a real 4090.** No GPU was rented for this
   build and no clip has been generated by this pack. The stack is
   PROVEN only when a first 4090 run passes, in order: preflight →
   generated clip → frame1 gate → likeness gate.
2. **Locked run still unproven — anywhere.** The VACE-locked graph
   was wired but its end-to-end run never completed (Kaggle 429 at
   wiring time, extraction §7.3). The earlier UNLOCKED proofs were
   graded FAIL: frame-1 SSIM 0.2938 / RGB MAD 100.29 against
   thresholds SSIM ≥ 0.50, MAD ≤ 40 (repo PARITY-REPORT).
3. **VACE-14B unverified on 24 GB.** No official VRAM figure
   exists; the primary repos present 14B as the multi-GPU example
   (verify report §3/§5 flag 3). Eval-only in the manifest; never
   downloaded. VACE-1.3B likewise has no VACE-specific published
   VRAM number — its fit rests on documented single-GPU inference
   plus the repo's ~11.33 GB locked-stack working set.
4. **LoRA base mismatch — NOT fixed in this pack.** The existing
   Wispkin + Dorowani LoRAs are Wan2.1-1.3B (musubi-tuner has no
   TI2V-5B task; 16 vs 48 latent channels) and do not load in the
   5B scene. The fix lives in the separate lora-fix lane
   (a TI2V-5B-capable trainer, or a 1.3B scene variant). They are
   listed in MODELS-MANIFEST as a known defect so nobody wires
   them into a 5B graph and calls it a lock. The LoRAs were also
   trained from 1–2 canon artworks each — identity anchors, not
   general models.
5. **LTX / Hunyuan: refused or eval-only, by licence and by fit**
   (MODELS-MANIFEST): LTX-2 = LTX-2 Community License (free
   commercial use only under $10M revenue) + 32 GB+ official VRAM
   prerequisite — refused for shipping. LTX-Video 0.9.x = licence
   CONFLICT (repo field Apache 2.0 vs its own v0.9.5 OpenRail-M
   news) — refused until the exact checkpoint's licence is read.
   HunyuanVideo original = Tencent Hunyuan Community License
   (does not apply in EU/UK/South Korea) + 45–60 GB official
   requirement — refused. HunyuanVideo-1.5 = same licence family —
   eval-only, never ship. `download_models.sh` fetches none of
   these.
6. **A14B quality tier: catalogued, not a tier.** No A14B graph is
   included — none exists in the source repo files, and inventing
   node wiring was refused (workflows/CHANGES.md). FP8 at 720p
   needs 48 GB and does not fit a 4090; the sourced 24 GB paths
   are FP8 at 640×640/480p or GGUF Q4_K_M–Q6_K, unproven on our
   material.
7. **Eval slots not yet run:** Phantom-Wan 1.3B (VRAM number
   UNVERIFIED), ToonCrafter, MultiShotMaster, FastWan/FastVideo
   (no 4090 figure in the sources used). Manifest slots only; the
   production method does not depend on any of them.
8. **Turbo LoRA licence recheck.** The Kijai repack card declares
   no licence (underlying Self-Forcing MIT, base Wan Apache-2.0);
   flagged RECHECK_BEFORE_COMMERCIAL_SHIP in the repo's
   backends.json. `download_models.sh` fetches it only under
   `--fast-lane`, with the warning printed.
9. **Dockerfile pins UNVERIFIED.** No source in the pack inputs
   pins a CUDA base image, ComfyUI release or PyTorch version.
   The CUDA 12.4.1 / sm_89 tags are a starting pin for the 4090's
   compute capability only; ComfyUI and the two custom-node packs
   are cloned unpinned. First image build must record the resolved
   commit SHAs into this report's successor.
10. **Host-side unknowns.** RunPod `template.json` field names
    were not tested against a RunPod account (none was used) —
    validate at deploy. RunPod Community RAM/vCPU: UNVERIFIED on
    the public pages checked. Vast: no fixed price exists and
    live availability/price can only be checked in the live
    marketplace at deploy time; Vast RAM/CPU guidance has no
    sourced figure (vast/INSTANCE-NOTES.md).
11. **Model-size GAPs.** `bytes: null` in MODELS-MANIFEST.json for
    VACE-1.3B fp16, UMT5-XXL fp8 scaled, Wan 2.2 VAE and the Turbo
    LoRA — no source states them, so they are measured at first
    download and written to `download-manifest.json`. Until then
    the minimum instance disk is not a sourced number.
12. **Example job is authoring-incomplete, by design.** Every
    segment's `view.source_still` is an `AUTHORING-TIME:`
    placeholder: the reference-pack still (path + sha256) for the
    segment's view must be filled in at authoring time. A real
    `run_scene.py` run refuses a character whose still is a
    placeholder, missing, or hash-mismatched — views are built
    FROM reference-pack stills, never generated from nothing. The
    job's living-background clip must likewise exist in the
    checkout at run time. The reference stills themselves are not
    part of this pack; they live in the repo's reference packs.
13. **Prompt convention (runner).** Following the repo's
    locked_run_kernel.py, the graphs' authored prompts run as
    written; `run_scene.py` patches only LoadImage, sampler seed,
    SaveVideo prefix, and an explicit segment `positive_prompt`
    field when one is authored. Composing a segment's free-text
    `action` into a prompt is a job-authoring step (PROMPT-PATTERNS
    spine), and the runner says which prompt was used per segment
    in its plan/report — it does not silently substitute the
    action text.
14. **Post/grade has no named script in the example job.**
    Shadows are drawn by scene_composite.py at composite time
    (the owner-locked order: shadows, then grade). If the job
    names no grade script, the runner records
    `NOT_PERFORMED_NO_SCRIPT_NAMED` in RUN-REPORT.json and the
    composite ships ungraded — recorded, never silently skipped.
    A named-but-missing grade script is a hard failure.
15. **BiRefNet backup has no script in this pack.** It is the
    named backup cutout (MIT; the working option for
    non-white-field plates), but no BiRefNet runner ships here: a
    job that asks for it without `--birefnet-script` fails loud
    instead of silently falling back to white_matte.
16. **Scene-scale speed UNPROVEN → no cost-per-minute claim.**
    The 22.8× Turbo figure (78.5 s vs 1,787.6 s) is a short test
    on the Kaggle T4 seat; FastWan's 16 s figure is a vendor H200
    number. The first 4090 run must measure seconds per 49-frame
    segment per workflow, and that measurement belongs in this
    report's successor before any per-episode cost is stated.
17. **Qwen2.5-VL-7B prompt extension** is wired in the repo but
    has not been exercised in a run (extraction §7.7); nothing in
    this pack claims it.
