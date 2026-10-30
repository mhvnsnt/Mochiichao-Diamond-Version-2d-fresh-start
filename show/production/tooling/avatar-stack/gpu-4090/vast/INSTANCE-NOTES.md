# Vast instance notes — choosing and using a Vast 4090 for this stack

Vast is the marketplace option for the same pack RunPod runs from
`runpod/`. Everything model- and workflow-side is identical; only
how the machine is picked, paid for and emptied differs. Facts are
from `VERIFY-4090-HOSTS-AND-MODELS.md` §2 (checked 2026-10-28);
anything that is operator guidance rather than a sourced fact is
labelled as such.

## There is no Vast price — check the live listing at deploy time

**Verified:** Vast publishes no fixed RTX 4090 price. Its own
pricing page says, in its own words, "Prices set by supply and
demand" / "Prices are set by the market, not by Vast"
(https://vast.ai/pricing). The 4090 page is a spec sheet only
(https://VAST.AI/pricing/gpu/RTX-4090). Billing is per second.
Three instance types exist: On-Demand (guaranteed uptime),
Interruptible (50%+ cheaper, preemptible), Reserved (up to 50%
off, 1/3/6-month terms).

**Indicative only — NOT a Vast price:** third-party snapshots
checked 2026-10-28 put usable on-demand 4090s around
**$0.35–$0.60/hr** (Spheron ~$0.34–$0.50, citing Vast's own
listings, cheap end = unverified hosts, high end = verified
datacentres; dev.to $0.34–$0.45 marketplace/spot; GPUPerHour live
snapshot: cheapest in-stock on-demand $0.59/GPU-hr, median daily
catalog average $0.33/GPU-hr). Treat that range as a budgeting
guide and **confirm the exact listing in the live marketplace when
you launch** — a text fetch cannot establish live availability or
a live price (verify report §2/§5 flag 1). Never hard-code a Vast
price into a budget, a job or a report; `vast/onstart.sh`
deliberately assumes none.

## Specs to require when choosing the listing

| Requirement | What to pick | Why / source |
|---|---|---|
| GPU | **NVIDIA GeForce RTX 4090, exactly 1** | The whole pack is sized for a single 24 GB card. Vast's own 4090 spec: **24 GB GDDR6X, 1,008 GB/s** (VAST.AI/pricing/gpu/RTX-4090). A different card changes every VRAM verdict in MODELS-MANIFEST. |
| CUDA / driver | Host driver must run the pack image: `Dockerfile` builds on `nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04` because the 4090 is sm_89 (Ada) | The Dockerfile pin itself is flagged UNVERIFIED until the first image build + 4090 run (see BUILD-REPORT gaps) — so at launch, confirm the instance starts the image and `nvidia-smi` shows the 4090 before paying for model downloads. If the image won't start on that host, pick another listing; do not debug a bad host on the clock. (Operator guidance.) |
| Disk | See the totals below — do not pick a small disk | Models are downloaded onto the instance at start (`download_models.sh`), never baked into the image. |
| RAM / CPU | No Vast-specific figure is published in the sources used — **GAP** | Operator guidance: the graphs offload the ~6.7 GB UMT5 text encoders to CPU/device-offload paths, so leave real headroom above the model files themselves; if a listing is unusually thin on RAM, skip it. Record what you actually launched in the run report. |

### Disk: the model-set totals (from MODELS-MANIFEST)

Ship-clean set that `download_models.sh` fetches by default —
sizes a source states exactly:

| File set | Bytes |
|---|---:|
| Wan2.2 TI2V-5B fp16 | 9,999,658,848 |
| UMT5-XXL fp8 non-scaled (Kijai repack) | 6,731,333,792 |
| Wan 2.1 VAE | 253,815,318 |
| **Known-byte subtotal** | **16,984,807,958** |

On top of that, four ship-clean files have **no source-stated size**
(GAP in MODELS-MANIFEST — measured at download, written to
`download-manifest.json`): Wan2.1 VACE-1.3B fp16, UMT5-XXL fp8
scaled, Wan 2.2 VAE, and — only with `--fast-lane` — the Turbo
LoRA. Then add: the Docker image + ComfyUI checkout itself, the HF
cache (`HF_HOME=/workspace/hf-cache`), job inputs, and every
generated segment + gate packet you plan to keep on the box during
a session.

So the honest rule: **the minimum disk is not a number any source
gives — size the instance generously, and after the first download
read the measured total out of `download-manifest.json` and use
THAT as the floor for future instances.** (Eval-tier models are
never downloaded by the script; if a human ever stages the A14B
GGUF pair by hand that is another 19,303,457,792 B — see
MODELS-MANIFEST — and the disk choice must grow by at least that.)

## Using the instance: onstart.sh

1. Check this pack out onto the instance first — `onstart.sh`
   resolves the pack directory from its own location, so any
   checkout path works.
2. Use `vast/onstart.sh` as the instance start command. It:
   - creates `/workspace/models`, `/workspace/output`,
     `/workspace/input` (override the model dir with `MODELS_DIR`,
     the ComfyUI checkout with `COMFY_ROOT`, default `/opt/ComfyUI`
     — the layout the pack `Dockerfile` builds);
   - runs `download_models.sh` — **ship-clean set only**. The Turbo
     LoRA (Fast Lane) is fetched only if you add `--fast-lane`
     yourself, with its RECHECK_BEFORE_COMMERCIAL_SHIP licence
     warning understood (see `download_models.py` header);
   - writes `extra_model_paths.yaml` pointing ComfyUI at the model
     dir (no edits inside ComfyUI's own tree);
   - starts ComfyUI headless on **port 8188**, listening on
     0.0.0.0, with input/output under `/workspace`. ComfyUI has no
     login of its own in this setup — treat the instance as
     private: don't publish the port or the instance address.
3. Drive it with `run_scene.py --comfy-url http://127.0.0.1:8188`
   from the instance (or your own tunnel to 8188). Per-character
   order, gates and composite are the runner's job, not the
   instance's — see README "How a run goes".

## Interruptible: cheaper, and it can be stopped — not for finals

**Verified:** Interruptible instances are **50%+ cheaper and
preemptible** (vast.ai/pricing, via the verify report). Preemptible
means the host can take the machine back mid-run; whatever was in
flight dies with it.

What that means for this stack:

- `run_scene.py` works segment by segment and makes each finished
  piece durable as it goes: outputs are downloaded off ComfyUI per
  segment, gate packets are written per segment, and
  RUN-REPORT.json is re-saved after every stage. A preemption loses
  at most the segment currently generating — **provided you have
  been pulling finished work off the instance** (next section). If
  everything still lives only on that disk, a preemption loses it
  all anyway.
- Use Interruptible, if at all, for short throwaway tests (a single
  Turbo segment, a prompt check) where losing the in-flight piece
  costs minutes.
- **Use On-Demand for long final runs** — the locked VACE proof,
  chained multi-segment characters, anything whose whole point is
  finishing and passing gates start to finish. Paying the
  guaranteed-uptime rate for the deciding run is cheaper than
  re-running a preempted one. (Operator guidance from the verified
  preemption fact, not a Vast claim.)

## Persistence: the instance disk is NOT the repo

This is the staging law applied to a rented box:

- **Nothing on a Vast instance is staged.** The instance is a
  workbench. When it is stopped/destroyed, its disk goes with it —
  do not treat `/workspace` here as storage. (RunPod's template in
  this pack mounts a *network volume* at /workspace; **do not
  assume a Vast instance gives you the same thing** — on Vast,
  /workspace is instance-local unless you deliberately attached
  storage, and either way it is not the repo.)
- **Models are disposable by design** — they re-download from
  `download_models.sh` on any future instance; their measured
  sizes/hashes land in `download-manifest.json`. Don't haul weights
  off the box; haul the manifest.
- **Generated work is NOT disposable.** Finished segment clips,
  gate packets, chained clips, composites and RUN-REPORT.json are
  the run's evidence. **Pull them back off the instance before you
  stop or destroy it**, then stage them per the standing rule:
  code/config/manifests/gate packets to GitHub, large media to
  TeraBox with a hashed manifest in the repo. A clip that only ever
  existed on a destroyed instance does not exist.
- Jobs you authored on the box (filled-in scene jobs with real
  reference-still paths + hashes) are production records too —
  pull them back with the outputs, not after.

## Pre-launch checklist (operator)

1. Live listing checked just now: 4090, 24 GB, On-Demand (or
   Interruptible knowingly, for a short test), disk sized per the
   totals above, price seen with your own eyes — not copied from
   this file.
2. Image built from the pack `Dockerfile` (no prebuilt image is
   claimed to exist).
3. `onstart.sh` set as the start command; pack checked out on the
   instance.
4. After start: ComfyUI answering on 8188 before the first
   `run_scene.py` call; `download-manifest.json` written.
5. A pull-back step is planned BEFORE the run starts — where the
   outputs and gate packets land when it finishes.
