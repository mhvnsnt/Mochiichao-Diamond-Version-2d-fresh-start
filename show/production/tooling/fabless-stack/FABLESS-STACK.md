# THE FABLESS STACK — ten-link chain map

**What this is.** We operate the way NVIDIA does: fabless. NVIDIA designs chips
and owns the software stack; other people's machines (ASML's lithography,
TSMC's fabs, Micron's memory lines) do the physical building. This folder is
the same move for everything *we* need underneath a 4090-class workflow: for
each link of the real GPU industry chain, the industry-standard **code/gettable
equivalent** a fabless operator actually uses — verified at source, torn down,
wired into this repo, with honest GAP labels where the industry piece is
genuinely closed.

**Rules of the map** (standing laws): licence honesty — every label verified
against the piece's own LICENSE/repo before it was written here; buckets are
*open source (licence named)* / *free proprietary* / *free-but-restricted* /
*paid*. Verify-then-state — "wired" means read back or test-run, never
label-deep. "Reverse engineered 100%" = functional teardown as far as public
source/docs go; gaps labelled, never faked. All licences/sources verified
2026-10-28.

## The ten links

### 1. Chip design / blueprint → open GPU architectures
*Physical link:* NVIDIA's design office (the Ada blueprint). *Our equivalent:*
readable GPU designs + the SIMT programming model.
- **Vortex** (Georgia Tech RISC-V GPGPU, full RTL + simulator + FPGA targets,
  OpenCL/Vulkan/HIP) — **Apache-2.0**. **MIAOW** (AMD Southern-Islands RTL) —
  **BSD 3-Clause**. **Nyuzi** (clean-room graphics GPU) — **Apache-2.0**.
- Status: **catalogued as design-layer references** (HDL we can stage and
  study; research scale, not runnable products) —
  [TEARDOWN-open-gpu-designs.md](TEARDOWN-open-gpu-designs.md).
- GAP: all production GPU RTL (NVIDIA/AMD/Apple) — closed, no exceptions.

### 2. Lithography machine → compiler toolchain layer
*Physical link:* ASML's EUV machines — the sole-source printer of designs.
*Our equivalent:* the compilers that "print" models/kernels onto silicon.
- **LLVM** — **Apache-2.0 with LLVM exceptions** (underlies Clang, the Android
  NDK that builds our phone engine, Triton codegen, ROCm, Vortex's VOLT).
  **Apache TVM** — **Apache-2.0** (ML compiler; WebLLM's MLC engine is its
  offspring). **Triton compiler** — **MIT**. **PyTorch Inductor** — PyTorch
  licence (BSD-3-style).
- Status: **consumed everywhere; touched directly** in
  `llamacpp/build-android.sh` (NDK/LLVM cross-compile) —
  [TEARDOWN-compiler-toolchain.md](TEARDOWN-compiler-toolchain.md).
- GAP: NVCC/CUDA compiler chain (NVIDIA EULA) — used on NVIDIA seats, never
  depended on in our own code.

### 3. The fab → build/execution service layer
*Physical link:* TSMC's fabs — capacity you book, not build. *Our equivalent:*
session orchestration that books GPU capacity wherever it exists.
- **SkyPilot** — **Apache-2.0** — our primary: one YAML runs a job on any of
  20+ clouds (RunPod/Vast included). **Ray** — **Apache-2.0** — evaluated as
  the alternative; heavier than our scale needs (documented in the teardown).
  **Kaggle free sessions** are *not* SkyPilot-drivable (no backend exists) —
  they are run by the grok-local rotation (sibling package), cross-referenced,
  not duplicated.
- Status: **configs landed + parse-validated** (`skypilot/serve-vllm.yaml`,
  `skypilot/train-lora.yaml`); first run happens on the first provisioned
  seat — [TEARDOWN-skypilot.md](TEARDOWN-skypilot.md).

### 4. Transistors / raw substrate → open IRs & kernel primitives
*Physical link:* the silicon substrate. *Our equivalent:* the intermediate
languages every kernel is built from, and the kernels themselves.
- **SPIR-V** (Khronos) — **open standard, royalty-free**; **SPIRV-Tools** —
  **Apache-2.0**. **PTX** — NVIDIA's, documented but proprietary
  (free-but-restricted as a dependency). **Triton kernels** — **MIT**.
  **ggml kernels** (in llama.cpp) — **MIT**.
- Status: **kernel landed; execution is a first-run item** — a real Triton
  kernel (`triton/vector_add_kernel.py`) is in the package, written for
  Triton's documented CPU interpreter mode on GPU-less machines and for GPU
  seats unchanged; its run on this VM did not complete (pip installs killed
  by the 512 MB `/tmp` — see the correction in `smoke/SMOKE-RESULTS.md` §3,
  which also retracts an earlier smoke-proven claim for this item) —
  [TEARDOWN-spirv.md](TEARDOWN-spirv.md),
  [TEARDOWN-framework-kernels.md](TEARDOWN-framework-kernels.md).
- GAP: SASS machine code (undocumented); cuBLAS/cuDNN binaries (link 8 GAPs).

### 5. Memory chips → memory systems in code
*Physical link:* Micron/Samsung/SK hynix GDDR lines. *Our equivalent:* the
software that manages model memory — the link where code most literally
replaces a physical breakthrough.
- **vLLM + PagedAttention** — **Apache-2.0**: KV cache managed in paged
  blocks (OS-style virtual memory for attention state) — the memory-system
  breakthrough that made high-throughput serving practical. Plus prefix
  caching and continuous batching; **llama.cpp's** context/KV handling on the
  edge seats — **MIT**.
- Status: **seat-matrix templates landed** (`serving/README.md`); vLLM itself
  is first-run on a GPU seat (grok-local's Kaggle notebook is the proof path)
  — [TEARDOWN-vllm.md](TEARDOWN-vllm.md).

### 6. Interconnect (NVLink/PCIe) → collective communication in code
*Physical link:* NVLink/PCIe fabrics. *Our equivalent:* the libraries that
move data between GPUs so they act as one machine.
- **NCCL** — **Apache-2.0 for most of the project, some parts BSD** (its
  LICENSE.txt's own first statement; GitHub's detector says NOASSERTION —
  the file wins; corrected 2026-10-28 from an initial BSD-3 label — see the
  teardown's correction note). **RCCL** (AMD) — **BSD-3-Clause** (some MIT
  parts). **Gloo** (Meta) — **BSD 3-Clause**. **oneCCL** (Intel) —
  catalogued.
- Status: **selection rule wired** into the serving/training templates
  (NCCL on NVIDIA, RCCL on AMD, Gloo for CPU/mixed); first-run on the first
  multi-GPU seat — [TEARDOWN-interconnect.md](TEARDOWN-interconnect.md).
- GAP: NVLink/NVSwitch hardware + firmware — NVIDIA-only, used through NCCL
  when a seat provides it.

### 7. Board assembly → packaging standards (OCI/Docker images)
*Physical link:* ASUS/MSI/Gigabyte turning dies into cards. *Our equivalent:*
the assembled, plug-compatible package — a container image is the board.
- **OCI image/runtime specs** — **Apache-2.0**; **containerd** —
  **Apache-2.0**; **Docker Engine/Moby** — **Apache-2.0**; **Podman/Buildah**
  — **Apache-2.0**. Exception: **Docker Desktop** — proprietary,
  free-but-restricted (paid beyond small use); not depended on anywhere.
- Status: **documented as our assembly standard**; SkyPilot configs accept an
  image as the seat runtime (the literal plug to link 3); Kaggle seats stay
  dataset+notebook-shaped (platform constraint, named in the teardown) —
  [TEARDOWN-oci-packaging.md](TEARDOWN-oci-packaging.md).

### 8. Driver / firmware → the runtime layer
*Physical link:* the driver stack that makes a card usable. *Our equivalent:*
open runtimes for every seat class. (Closed firmware stays GAP — below.)
- **ROCm/HIP** (AMD's CUDA-equivalent) — per-component licences, predominantly
  **MIT** (rocBLAS MIT, rocSOLVER BSD-2-Clause): runs the same PyTorch/vLLM/
  Triton on AMD cards — [TEARDOWN-rocm.md](TEARDOWN-rocm.md).
- **OpenCL / Vulkan / WebGPU** — Khronos/W3C **open royalty-free standards**.
  **WebLLM** (browser runtime, TVM/MLC-compiled) — **Apache-2.0** —
  [TEARDOWN-webllm.md](TEARDOWN-webllm.md).
- **llama.cpp** — **MIT** — the CPU/phone runtime; flagship phone seat —
  [TEARDOWN-llamacpp.md](TEARDOWN-llamacpp.md), `llamacpp/PHONE-ENGINE.md`.
- **NVIDIA open GPU kernel modules** — **dual MIT/GPLv2**, real and in the
  Linux ecosystem — but NVIDIA's own README states they still require the
  proprietary GSP firmware + user-space driver (named GAP).
- **TensorRT-LLM** — LICENSE file Apache-2.0 over a proprietary TensorRT core:
  catalogued, **not adopted**.
- Status: llama.cpp **smoke-proven on CPU** and **cross-compiled for Android
  arm64** (see smoke record); ROCm/WebLLM are first-run items (no AMD GPU /
  no device browser on this VM).

### 9. The data center → scheduling / orchestration
*Physical link:* the hyperscale data center. *Our equivalent:* the scheduler
that decides what runs where.
- **Kubernetes** — **Apache-2.0** — *the* industry standard at data-center
  scale, documented here as the reference point; at our scale (a handful of
  borrowed seats) it is the wrong weight — **SkyPilot (link 3) is our pick**,
  and the grok-local **rotation engine** is the scheduler for free sessions
  specifically. If the fleet ever outgrows that, Kubernetes is the named
  graduation path, not a rewrite.
- Status: **documented decision, wired by reference** (SkyPilot configs are
  the operative artefact).

### 10. The rental market → capacity aggregation
*Physical link:* the market for GPU time. *Our equivalent:* assembling a
dependable fleet out of free tiers, sessions, and (owner-gated) rentals.
- **The rotation/rendezvous pattern** — implemented by the sibling grok-local
  package (session rotation, endpoint rendezvous, save-out discipline) and
  transported by **the tunnel layer**: **cloudflared** client **Apache-2.0**
  over a **free-proprietary** network (named tunnels free with account +
  domain; Quick Tunnels dev-only per Cloudflare's docs), **frp** —
  **Apache-2.0** — the fully-open alternative needing our own relay box.
- **Petals** (splitting one model across volunteer machines) — **MIT** —
  **EVALUATED-REJECTED** for free-session seats on measured grounds (session
  lifetimes vs swarm stability, NAT shape, its own published ~4–6 tok/s
  class) — [TEARDOWN-petals.md](TEARDOWN-petals.md).
- Status: **tunnel templates landed + parse-validated** (`tunnel/`); rotation
  itself is the sibling's landed work, cross-referenced —
  [TEARDOWN-tunnel.md](TEARDOWN-tunnel.md).

## The closed remainder (GAP row — named, never fetched, never cracked)

| Piece | Bucket | Why it's closed |
|---|---|---|
| CUDA EULA components (NVCC chain, driver user-space) | proprietary (seat-provided) | NVIDIA licence |
| cuDNN / cuBLAS binary distributions | free-but-restricted (CUDA EULA) | usable on seats, not open |
| GSP firmware, VBIOS, signed blobs | proprietary | signed firmware |
| Production GPU RTL (any vendor) | proprietary | link 1 GAP |
| TensorRT runtime (under TensorRT-LLM) | proprietary | NVIDIA licence |
| xAI Grok weights/internals | proprietary/paid | sibling package's GAP list |

## Proof ledger (verify-then-state)

- **Smoke-proven on this VM:** llama.cpp CPU build + tiny-model generation +
  OpenAI-endpoint server response; llama.cpp **Android arm64 cross-compile**
  (exit 0; `file`-verified aarch64 executables + libraries). Full outputs:
  `smoke/SMOKE-RESULTS.md`.
- **Config-validated (parsed, not run):** SkyPilot ×2, cloudflared, frp ×2,
  Wielder edge-seat JSON.
- **First-run items (need a seat/device or a fixed install path):** vLLM
  serving, ROCm anything, NCCL/RCCL multi-GPU, WebLLM on the owner's phone
  browser, the APK sideload, **and the Triton kernel run** (kernel landed;
  VM install path blocked by the `/tmp` pinch — correction in the smoke
  record §3).
- **Evaluated-rejected:** Petals for free-session seats (reasons in its
  teardown). **Documented-not-adopted:** Kubernetes (graduation path), Ray
  (alternative), TensorRT-LLM (proprietary core), Docker Desktop.

## Wiring into programmes (beyond this folder)

Cross-reference wiring only — sibling-owned files are never edited from here;
each row names where this folder's artefacts plug in.

| Link | Wielder | grok-local stack | Show pipeline (Wan/ComfyUI lane) |
|---|---|---|---|
| 1 Design | Seats execute this SIMT model; teardown is the reference when a Wielder job's kernel behaviour is questioned | — | Kernel/attention work assumes this model |
| 2 Compilers | All seat runtimes are LLVM-built | Serving images compiled via this layer | ComfyUI/PyTorch kernels compile through Triton/Inductor on every run |
| 3 Fab | `skypilot/` templates are Wielder's provisioning shape for non-Kaggle seats | Rotation covers Kaggle; SkyPilot covers cloud seats — complementary, configs cross-name each other | Future rented-seat show renders would launch from these templates |
| 4 Substrate/IR | Portable kernels = portable seats | vLLM kernels via Triton | Wan attention kernels: PyTorch → Triton → PTX on NVIDIA, SPIR-V/AMDGCN on ROCm |
| 5 Memory | Serving seats sized by the seat matrix | **PagedAttention is grok-local's serving core** (vLLM) | Wan video models are VRAM-bound on T4s — KV/block memory discipline is the same craft; seat sizing in the matrix applies to render seats too |
| 6 Interconnect | Multi-GPU jobs inherit the NCCL/RCCL/Gloo rule | vLLM tensor-parallel option names NCCL here | Future multi-GPU training (LoRA on 2 seats) inherits the rule via PyTorch defaults |
| 7 Packaging | Deploy artefacts follow OCI where the seat accepts images | Serving kit is the assembly instance | Kaggle job datasets are this link in dataset shape (named constraint) |
| 8 Runtime | Edge seat = llama.cpp config (`llamacpp/wielder-edge-seat.json`); phone seat = PHONE-ENGINE.md | WebLLM mode B in the PWA consumes `TEARDOWN-webllm.md`'s spec | ROCm door = the show's exit if a bought seat is AMD |
| 9 Scheduling | SkyPilot-as-pick documented; K8s = graduation path | Rotation engine = the free-session scheduler | Same graduation path if render fleet grows |
| 10 Capacity | Rendezvous endpoints consumed by Wielder seats | **Rotation + rendezvous is grok-local's core**; tunnel templates here are its transport | Remote render seats would reuse the same tunnel templates |
