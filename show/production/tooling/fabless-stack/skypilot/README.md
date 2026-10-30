# SkyPilot configs (Fabless Stack link 3 — the fab layer)

SkyPilot (Apache-2.0, skypilot-org/skypilot) is the primary orchestration
pick: one task YAML provisions a GPU seat on any enabled cloud and runs the
job. Full reasoning, the Ray alternative evaluation, and the honest Kaggle
note (SkyPilot has no Kaggle backend — Kaggle seats belong to the grok-local
rotation) are in `../TEARDOWN-skypilot.md`.

- `serve-vllm.yaml` — serve a model with vLLM; seat GPU class, model, and
  context length are variables at the top of the file.
- `train-lora.yaml` — LoRA/QLoRA training seat with mandatory save-out:
  inputs mounted from durable staging, checkpoints saved out before the
  seat dies (owner's operating model: sessions are borrowed, work is kept).

Both files are parse-validated; first execution happens on the first
provisioned seat (owner-gated for anything rented — "build everything first,
rent when I say").
