# TEARDOWN — Framework + kernel layer: PyTorch, Triton, and NVIDIA's open/closed split

Part of the [Fabless Stack](FABLESS-STACK.md) (spans link 2's codegen, link 4's
kernels, and link 8's runtime edge). This is the layer every model we run is
written in. A fabless operator doesn't write SASS; they write PyTorch, and
increasingly they write kernels in Triton instead of CUDA C++.

## PyTorch — the framework everything sits on

- **What it is:** the dominant open ML framework: tensor library, autograd,
  `torch.distributed` (link 6), Inductor compiler (link 2), and the lingua
  franca every model release ships first. vLLM, DiffSynth/ComfyUI (the show
  pipeline), the LoRA training kits, and llama.cpp's model-conversion tools
  all assume it.
- **Licence:** BSD-3-Clause-style (the project's LICENSE is a BSD 3-Clause
  text; GitHub reports NOASSERTION because the file bundles third-party
  notices — the licence text itself is BSD).
- **Backends are the portability story:** CUDA (NVIDIA), ROCm/HIP (AMD), CPU,
  MPS (Apple), XPU (Intel) — the same model code moves seats by changing a
  device string, which is the software form of the fabless bet.

## Triton — the open kernel language

- **What it is:** a Python-embedded language + compiler (triton-lang/triton,
  originated at OpenAI) for writing GPU kernels at block level: you describe
  tiles and let the compiler handle threads, shared memory, and vectorization.
  It is how FlashAttention-class kernels and most new fused ops get written
  without CUDA C++. PyTorch Inductor emits Triton; vLLM ships Triton kernels;
  on AMD it compiles through ROCm, on NVIDIA through PTX (link 4).
- **Licence: MIT** (verified at source 2026-10-28), actively maintained.
- **Our kernel:** `triton/vector_add_kernel.py` — a real Triton kernel,
  written for Triton's documented CPU interpreter mode (`TRITON_INTERPRET=1`)
  on GPU-less machines; the same source compiles to real GPU code on a seat
  unchanged. **Execution status, corrected 2026-10-28:** the run on this VM
  did not complete (installs died on the 512 MB `/tmp`); see the correction
  in `smoke/SMOKE-RESULTS.md` §3 before citing this as run anywhere.

## NVIDIA's open pieces — honestly split

- **Open GPU kernel modules** (`NVIDIA/open-gpu-kernel-modules`): the real
  kernel-side driver, in the Linux kernel ecosystem since 2022, **dual
  MIT/GPLv2**, current line 615.78.08, Turing-and-newer. **The honest limit,
  stated in NVIDIA's own README:** the open module still requires the
  proprietary GSP firmware and the proprietary user-space driver libraries
  from the matching `.run` release. Open ≠ the whole driver.
- **TensorRT-LLM:** NVIDIA's LLM-serving optimizer for its own hardware. Its
  repo LICENSE file is Apache-2.0 (GitHub detects NOASSERTION), but it is
  built on the proprietary TensorRT runtime — bucket: **open-source wrapper
  over a proprietary core; not adopted.** vLLM covers the serving seat
  portably; TensorRT-LLM is catalogued so the option is on record with its
  real terms.

## The closed remainder (GAP, by design — named, never fetched)

- **GSP firmware, VBIOS, signed firmware blobs** — proprietary NVIDIA.
- **cuDNN / cuBLAS binary distributions** — free-but-restricted under the
  CUDA EULA (usable, not open; they arrive with the seat's CUDA install).
- **CUDA toolkit EULA pieces (NVCC driver chain)** — proprietary; see link 2.
- **SASS machine code** — undocumented; see link 4.

Cataloguing these precisely *is* the deliverable for the closed side: the map
shows exactly where our open stack ends and a vendor's property begins, so no
plan ever silently depends on owning a piece we only rent access to.

## Wiring status

- PyTorch/Triton are consumed through every other package (they are the
  substrate, installed per-seat by the serving/training configs).
- The Triton kernel in `triton/` is this package's artefact at this layer;
  its execution record — including the correction of an earlier claim —
  lives in `smoke/SMOKE-RESULTS.md` §3. Read it before citing a run.
