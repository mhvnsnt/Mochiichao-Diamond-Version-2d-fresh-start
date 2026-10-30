# TEARDOWN — ROCm / HIP (the other silicon door: AMD's open CUDA substitute)

*Verified at source 2026-10-28: the ROCm platform (github.com/ROCm) and
AMD's own ROCm documentation. Licence position: the stack is open source
with **per-component licences, predominantly MIT** (rocBLAS MIT,
rocSOLVER BSD-2-Clause, HIP runtime MIT-class); there is no single
umbrella licence file, and this document does not invent one. ROCm's
current release line is the 7.x series with the TheRock build/release
system; AMD's docs describe ROCm 10.1.0 in the TheRock line (both lines
were live in sources checked 2026-10-28 — version pinning belongs to the
day hardware exists, not today).*

## What it is

ROCm is AMD's complete open software platform for GPU computing — the
industry's own answer to CUDA, built in the open:

| ROCm layer | CUDA-world analogue |
|---|---|
| `amdgpu` kernel driver (in the Linux kernel) | NVIDIA kernel driver (+ GSP firmware on their side) |
| ROCr (HSA runtime), HIP runtime | CUDA driver + runtime APIs |
| HIP-Clang / `hipcc` (LLVM-based) | `nvcc` |
| HIPIFY (automated CUDA→HIP source translation) | — (no NVIDIA equivalent; it exists to leave NVIDIA) |
| rocBLAS / hipBLAS, MIOpen / hipDNN, rocFFT, RCCL | cuBLAS, cuDNN, cuFFT, NCCL |
| ROCm profilers, AMD SMI | Nsight, nvidia-smi |

HIP is deliberately a near-dialect of CUDA: most CUDA source ports with
HIPIFY plus light edits, and the `hip*` libraries can compile against
*either* vendor's backend — which is why the big frameworks treat ROCm as
a build target, not a rewrite.

## What it means for our stack (compatibility notes)

Every layer we actually depend on already ships the AMD door:

- **PyTorch**: official ROCm wheels (`torch` built against ROCm) are a
  first-class install option on pytorch.org; same code, `cuda` device
  naming kept for compatibility.
- **vLLM**: supports AMD GPUs (ROCm) as a documented platform — same
  server, same OpenAI API.
- **llama.cpp**: HIP backend is in its supported-backend table (plus a
  Vulkan backend that runs on AMD without ROCm at all).
- **Triton**: has an AMD backend (kernels compile to AMDGCN as well as
  PTX) — the kernel layer is bilingual too.
- **SkyPilot**: provisions whatever the cloud sells, AMD instances
  included where offered.

So a future **bought seat could be AMD** (e.g. a 24 GB RX 7900 XTX-class
card — the consumer card with full official ROCm support, VRAM-matching
the RTX 4090) without changing our job files' shape: the seat variable
changes, the stack doesn't. Practitioner measurements put ROCm inference
at roughly 75–95% of CUDA on comparable cards depending on workload —
indicative only; our own first-run benchmark would be the gate.

## Honest limits

- **Maturity gap is real.** New features land CUDA-first (some attention
  kernels, FP8 paths, TensorRT-LLM obviously). ROCm is production-ready
  for PyTorch/vLLM-class work in 2026 (hyperscalers run it at scale),
  but expect more tuning friction per new model than the NVIDIA path.
- **Consumer-card support is narrower**: official support centres on
  specific SKUs (7900 XTX class on desktop; Instinct in the datacenter);
  lesser cards often work via community paths — "works" and "supported"
  are different words and this catalogue keeps them different.
- **Windows**: HIP SDK exists but the full AI stack is Linux-first.
  Our seats are Linux anyway.
- **No hardware on hand.** Every ROCm claim above is source-verified
  documentation, not a run. All ROCm proofs are **first-run items**:
  the first AMD seat (bought or rented) runs the standard first-run
  list — PyTorch device check, vLLM serve + smoke prompt, llama.cpp
  HIP generation, one Triton kernel — before any ROCm seat is called
  wired for production.

## Why it's in the catalogue at all

The fabless position only stays free if there's a second silicon door.
CUDA's moat is software habit, not physics; ROCm is the industry's
standing proof that the habit can be broken with open code. We don't
need it today — Kaggle/RunPod-class seats are NVIDIA — but the day a
card purchase is on the table, this teardown is what makes "AMD is
cheaper per GB" a real option instead of a trap.
