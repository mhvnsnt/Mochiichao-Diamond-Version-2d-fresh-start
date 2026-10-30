# TEARDOWN — SkyPilot (orchestration: the capacity manufacturer)

*Verified at source 2026-10-28: github.com/skypilot-org/skypilot — licence
read from the repo (Apache-2.0), activity read from its README/news and
release count. Directory listings checked the same day put the current
release line at v0.14.x (v0.14.1, Oct 2026); the repo itself shows 47
releases and commits within the day. Status: actively maintained.*

## What it is

SkyPilot is the industry-standard open-source **broker layer** for GPU
work: you describe a job once (resources, setup commands, run commands, in
YAML or Python), and SkyPilot finds a seat that fits — across Kubernetes,
Slurm, and 20+ clouds (its README lists AWS, GCP, Azure, OCI, CoreWeave,
Nebius, Lambda, **RunPod**, Fluidstack, Cudo, Paperspace, **Vast.ai**,
Prime Intellect and more) — provisions it, syncs your working directory,
runs setup, runs the job, streams logs, and can auto-stop idle capacity and
auto-recover spot/preemptible jobs. It is BYOC: everything launches inside
*your* accounts on those clouds; SkyPilot itself sells no compute.

## What it replaces in the proprietary chain

A big lab's internal "capacity desk": the team/tooling that knows which
cloud has a free 4090-class card, at what price, and moves the job there.
For a fabless operation that desk is exactly the ASML-shaped hole — the
machine that manufactures *access to capacity*. SkyPilot is that machine,
already built, Apache-2.0.

## How it fits our chain — and where it honestly doesn't

- **Rented seats (RunPod / Vast): native fit.** Both are first-class
  SkyPilot clouds. When the owner says "rent," our serving and training
  jobs become `sky launch` of the YAMLs in `skypilot/` — the seat
  (provider, GPU type, spot vs on-demand) is a resources block, not a
  rewrite. This is the wiring this folder lands.
- **Persistent own machines: fit.** SkyPilot can target SSH-reachable
  machines and Kubernetes clusters. A future bought seat joins the same
  job files.
- **Kaggle-style free sessions: NOT a fit, stated plainly.** SkyPilot has
  no Kaggle backend and cannot drive notebook sessions — free sessions are
  ephemeral, notebook-shaped, and account-bound; there is no cloud API for
  SkyPilot to provision against. The free-seat rotation stays
  notebook-native (grok-local's free-test notebook + rendezvous). Anyone
  claiming their orchestrator "runs Kaggle" is wrapping browser automation,
  which is our lane's job, not SkyPilot's.
- **Serverless endpoints: partial.** SkyPilot provisions machines/pods,
  not per-request serverless GPU APIs. Seat class "serverless" in our
  seat-matrix therefore points at the provider's own endpoint config, not
  at a SkyPilot task. The matrix in `serving/` keeps the three seat
  classes distinct for exactly this reason.

## The alternative, evaluated: Ray

Ray (ray-project/ray, **Apache-2.0**, verified 2026-10-28; 132 releases,
very active) is a distributed *runtime*: it scales Python functions/actors
across a cluster you already have (Ray Core/Train/Serve). Verdict:
**documented alternative, not primary.** Ray answers "I have a cluster,
run this across it"; SkyPilot answers "get me a cluster and run this."
Our bottleneck is the second question, at 1-node scale. Ray also underpins
parts of the ecosystem (vLLM's distributed mode can use it), so it stays
in the stack *inside* other tools. If we ever run standing multi-node
training, Ray becomes the in-cluster layer under SkyPilot — the two are
complements in the industry pattern, and this folder picks SkyPilot as
primary for our scale today.

## Walls / GAPs

- SkyPilot needs the underlying cloud accounts and their credentials; it
  manufactures access, not free capacity. Free-tier capacity remains the
  notebook lane.
- Spot recovery is real but not magic: a preempted training job resumes
  from checkpoints — which is why the training YAML mounts the durable
  dataset home and the runbook's save checklist exists.
- No Kaggle/Colab backend (above). No per-token billing magic: you pay
  the seat's meter while it runs; autostop is the discipline.

## Wiring landed here

- `skypilot/serve-vllm.yaml` — the Grok-at-home serving job with seat as
  a variable (accelerator + cloud chosen at launch).
- `skypilot/train-lora.yaml` — the LoRA training job template with
  durable-home mounts and checkpoint save-out.
- `skypilot/README.md` — launch commands per seat class and the
  first-run proof checklist (what output counts as "SkyPilot works for
  us": a job that lands on the cheapest fitting seat, serves, and stops).
