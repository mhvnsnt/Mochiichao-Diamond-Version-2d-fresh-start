# fuel-stack — make your own fuel

*The owner's doctrine (Jamar, 2026-10-28): "If the fuel station
closed forever, people would reverse engineer how fuel is made and
make their own fuel." Fuel here = GPU compute-hours. This folder is
the map and the working kits for producing usable compute WITHOUT a
4090-class card and WITHOUT a cloud account: compression, efficient
engines, distillation, speculative decoding, device splitting,
CPU inference, on-device accelerators, doing less work, sparsity,
capacity assembly — plus one evaluated extreme (BitNet).*

## Read order

1. **FUEL-STACK.md** — the map: all ten + BitNet, one entry each
   (plain language, licence verified at source, owner lane, status),
   the quantization decision table, per-phone verdicts, CPU-seat
   rules, and the recommended first live fuel run.
2. The teardowns for this lane's builds:
   `TEARDOWN-distillation.md`, `TEARDOWN-speculative-decoding.md`,
   `TEARDOWN-caching-and-retrieval.md`, `TEARDOWN-sparse-by-design.md`,
   `TEARDOWN-bitnet.md`.
3. The kits: `distill/`, `speculative/`, `rag/`, `moe/`.
4. `smoke/SMOKE-RESULTS.md` — what actually ran on the build VM,
   verbatim, including the failures.

## Lane boundaries (convergence, no collisions)

- **grok-local** (`show/production/wielder/grok-local/`) owns the
  models, the serving kit, the PWA and the Virtual Seat rotation.
- **fabless-stack** (`show/production/tooling/fabless-stack/`) owns
  the engine/orchestration layer: llama.cpp, SkyPilot, WebLLM
  teardown, Petals verdict, tunnels.
- **fuel-stack (this folder)** owns the efficiency techniques that
  sit on top: distillation, speculative configs, the retrieval
  layer, the routing spec — and the map that ties all three lanes
  together. Where a sibling owns a piece, this folder cross-references
  it and carries their measured verdict; it never rebuilds it and
  never edits their files.

## Standing rules honoured here

- Licences verified at source and bucketed exactly (open source
  with the licence named / free proprietary / free-but-restricted /
  paid). An undeclared licence is reported as undeclared.
- Teachers are OPEN models only. No closed model's outputs are
  training data anywhere in this folder (enforced in code in
  `distill/`).
- Nothing rented, nothing bought. Downloads to the build VM: none,
  except the single sanctioned BitNet smoke model (workbench
  scratch under `~/workspace/fuel-stack-build/`, hash-gated before
  any use — its full transfer saga is recorded in
  `smoke/SMOKE-RESULTS.md` §6; seats pull models on-target via the
  grok-local hash-pinned pull pattern).
- Verify-then-state: every "proven" in this folder points at a
  recorded run in `smoke/`; everything else is labelled a first-run
  item with the exact check that will prove it.
