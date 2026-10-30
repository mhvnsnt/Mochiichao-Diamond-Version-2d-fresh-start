# TEARDOWN — BitNet-class extreme compression (fuel-stack item 11)

*What it is, in plain language: normal quantization squeezes a
trained model's weights into fewer bits and loses a little accuracy
doing it. BitNet models are TRAINED from birth with weights that
only ever take three values — −1, 0, +1 ("1.58 bits" per weight,
because log2(3) ≈ 1.58). Multiplication by −1/0/+1 is just
negate/skip/copy, so the heavy maths of a neural net collapses into
additions: tiny memory, tiny energy, and — the surprise of the
research line — at enough training scale, quality competitive with
full-precision models of the same size. It is the extreme end of
item 1's compression curve: not a squeezed model, a model whose
native habitat is a CPU.*

## The verified facts (2026-10-28)

- **Repo/tooling:** `microsoft/BitNet` — **MIT**. Ships
  `bitnet.cpp`, the official inference framework (built on
  llama.cpp), with kernels for the ternary weight layout (TL1/TL2
  lookup-table kernels on ARM, I2_S on x86).
- **Reference model:** `microsoft/bitnet-b1.58-2B-4T` — **MIT** per
  its model card (`license: mit`). 2B parameters trained on 4T
  tokens. Official GGUF at `microsoft/BitNet-b1.58-2B-4T-gguf`:
  `ggml-model-i2_s.gguf` measures **1,187,801,280 bytes** (HTTP
  HEAD, 2026-10-28); the packed weights themselves are ≈0.4 GB —
  the GGUF is not bit-packed to the theoretical floor.
- **A correction this teardown owes the record:** the widely-quoted
  "0.4 GB / up to 6× faster" figures come from Microsoft's own
  materials (vendor-reported, and the footprint figure describes
  the packed non-embedding weights). Reported CPU speedups are
  2.37–6.17× on x86 CPUs and 1.37–5.07× on ARM per Microsoft's
  repo — real direction, marketing precision. This package's own
  measurement, if any, is in the smoke record and supersedes.
- **llama.cpp path:** the mainline engine carries a native BitNet
  architecture (`src/models/bitnet.cpp`, `LLM_ARCH_BITNET`, source
  verified in this programme's clone) and GGML defines the I2_S
  quant type — so the model can be attempted with bog-standard
  llama-cli, no bitnet.cpp build required.
- **bitnet.cpp's own route on this VM:** its documented setup
  (`setup_env.py`) expects a **clang** toolchain; this VM has gcc
  and cmake but NO clang (measured). That route is therefore a
  first-run item for a machine with clang, not silently substituted.

## The CPU smoke (this package, this VM)

Route chosen: official GGUF (the one sanctioned download — a smoke
artifact on the workbench, pulled per the task brief; the model
itself lives on Hugging Face and on seats via pull-on-target,
NOT staged from this VM) + the programme's own llama.cpp build
(CPU-only, same source the fabless lane verified).

**Result: the ENGINE half ran; the GENERATION half did not — and
the reason is recorded, not hidden.** llama.cpp built and runs on
this VM (llama-cli executes; the native BitNet arch is in the
source). The model file itself defeated four transfer attempts:
the first reached exactly the expected byte size and then FAILED
sha256 verification against Microsoft's published hash (a corrupt
resume stitch — caught by the hash gate and deleted, which is the
verification chain doing its job); later attempts were starved by
this VM's shared ~855 KB/s ingress, divided across ~6 concurrent
lane downloads, with background transfers dying at session cycles.
Full record, measurements, partial-state locations and the exact
one-command first-run completion: `smoke/SMOKE-RESULTS.md` §6.
The verdict below does not depend on this VM's tokens/sec — it
never did; it rests on the architecture's arithmetic and the
ecosystem's depth, both assessable without the run.

## Verdict for the phone seat

**EVALUATED — PROMISING, NOT ADOPTED (yet).** Reasoning:

- FOR: the arithmetic is the phone's friend — ternary weights mean
  the memory-bandwidth wall (the real phone bottleneck) drops ~8×
  vs fp16, and addition-only compute suits mobile CPUs. A 2B-class
  BitNet at ≈0.4–1.2 GB sits comfortably in a 6–8 GB phone, and
  Microsoft's stated roadmap explicitly targets mobile/edge, with
  community reports of NPU work starting (QNN-class backends are
  "coming", not shipped — unshipped means uncounted).
- AGAINST (today): the ecosystem is one reference model deep. Our
  phone seat already runs (WebLLM/MLC Qwen3, grok-local) with a
  general model the programme controls end-to-end; BitNet has no
  instruct ecosystem, no LoRA story for our specialists, and its
  official kernels are CPU-first while our phone path is GPU-first.
- THE DOOR LEFT OPEN: if a BitNet-class model at 3–4B with an
  instruct tune lands under MIT/Apache and the CPU smoke pattern in
  this package passes on the owner's phone, it becomes the
  always-available offline fallback seat — the seat that works when
  everything else is out of fuel. Re-check at each model release;
  the smoke harness (download → llama-cli → fixed prompts) is
  reusable as-is.
