# TEARDOWN — Link 1: Chip design / blueprint → open GPU architectures

Part of the [Fabless Stack](FABLESS-STACK.md) ten-link chain map. In the physical
chain, this link is NVIDIA's design office: the GPU architecture itself (the Ada
Lovelace blueprint a 4090 is built from). A fabless operator cannot get NVIDIA's
blueprint — but the industry has open GPU *designs*: complete, readable hardware
source (HDL) for SIMT processors. What they give us is the design layer as
**study-grade reference**: how a GPU is actually laid out — warps, compute units,
memory hierarchy — which is exactly the mental model every other link in this
stack is programmed against. Honest status up front: these are design-layer
references, not runnable products for us. Nothing here renders a frame or serves
a token; the value is that the blueprint layer of the chain is *readable* in our
repo instead of being a black box.

## The pieces (all verified at source 2026-10-28)

### Vortex — the standard-bearer (Georgia Tech)

- **What it is:** a full-stack open-source RISC-V GPGPU: synthesizable RTL
  hardware (`hw/`), a C++ cycle-level simulator (simx), an RTL simulator path,
  and physical FPGA targets (Xilinx Alveo U50/U55C/U250/U280/V80, Altera Arria
  10 / Stratix 10), all driven by one driver script. It extends the base RISC-V
  ISA minimally for SIMT execution instead of inventing a new ISA — which is why
  its toolchain (VOLT, LLVM-based) stays close to the standard RISC-V ecosystem.
- **Specs from its README:** configurable cores/warps/threads; configurable ALU,
  FPU, LSU, SFU counts per core; a graphics fixed-function pipeline (rasterizer,
  texture units, output mergers); a hardware ray-tracing unit (BVH traversal);
  tensor cores with WGMMA and 2:4 structured sparsity; L1/L2/L3 caches optional.
  Software support: OpenCL 1.2, Vulkan, HIP. Scales to 32 cores on a Stratix 10
  at ~25.6 GFLOPS peak (200 MHz) — research scale, roughly five orders of
  magnitude below a 4090, which is precisely why this is a *design reference*
  and not a seat.
- **Licence: Apache-2.0** (repo LICENSE, GitHub-detected). **Status:** actively
  maintained — 6,174 commits, 7 releases, MICRO'21 paper (Tine et al.).
- **Why it matters to us:** it is the only open design whose *whole stack* is
  visible end-to-end — HDL → LLVM compiler → OpenCL/HIP runtime → driver — the
  same layers our software stack (links 2, 4, 8) implements in software. When a
  Wielder/show question is really "what does the hardware actually do with this
  kernel," Vortex's source is the readable answer.

### MIAOW — the first public GPU microarchitecture (UW–Madison)

- **What it is:** an open-source RTL implementation of AMD's Southern Islands
  GPGPU ISA, capable of running unmodified OpenCL applications; ASIC synthesis
  and floorplan completed by the authors; FPGA prototype demonstrated. The 2015
  paper (Balasubramanian et al.) was the first publicly disclosed description of
  a GPU microarchitecture in RTL form.
- **Licence: BSD 3-Clause** (per the open-hardware survey of record; repo:
  `VerticalResearchGroup/miaow`).
- **Honest caveats:** a 2015-era research design, not maintained as a product;
  because it implements AMD's ISA, commentators noted it inherits patent-footing
  questions a clean-room design avoids. Study reference only.

### Nyuzi — the clean-room graphics GPU (Jeff Bush)

- **What it is:** a fully functional GPGPU written in synthesizable SystemVerilog
  with its own custom ISA (Nyami), its own LLVM-based toolchain, test suites,
  benchmarks, and a software 3D rendering engine; demonstrated on FPGA rendering
  real scenes.
- **Licence: Apache-2.0** (author's own project description; one older wiki
  mirror says GPL/LGPL — the author's statement and the survey of record both
  say Apache-2.0; the repo LICENSE file is the final authority if ever vendored).
- **Status:** solo-maintained research project; performance ~¼ of a commercial
  embedded GPU per watt per contemporary write-ups. Study reference only.

### The design language: CUDA's programming model

The other half of link 1 is not HDL — it is the *model* every design is
programmed in: thread blocks, warps of 32 lanes, shared memory, SIMT divergence.
That model is NVIDIA's (CUDA itself: proprietary, see the GAP row in
FABLESS-STACK.md), but it is implemented openly on every other link: Triton's
block model (link 4), HIP's near-1:1 translation of it (link 8), SPIR-V's
execution model (link 4), and Vortex's ISA extensions (this link). We program
against the model through the open implementations; we do not need NVIDIA's
blueprint to use its shape.

## Wiring status

- **Catalogued, design-reference class.** No code from these repos is vendored:
  staging multi-hundred-MB HDL trees to run nothing would violate the
  reuse-first/size discipline; the repos are one `git clone` away and this doc
  pins exactly which pieces answer which questions (Vortex for full-stack,
  MIAOW for AMD-ISA microarchitecture, Nyuzi for a complete graphics pipeline).
- **Plugs into programmes:** Wielder's seats all execute this design model on
  other people's silicon; the show pipeline's kernel work (link 4) assumes this
  SIMT model. Cross-reference only — no sibling files touched.

## GAPs at this link

- NVIDIA/AMD/Apple production GPU RTL: closed, no exceptions. The 4090's actual
  blueprint is not gettable at any price — named GAP by design.
- Open designs are FPGA/research scale (tens of GFLOPS, not ~80 TFLOPS): the
  open blueprint layer teaches the design; it does not replace the silicon.
