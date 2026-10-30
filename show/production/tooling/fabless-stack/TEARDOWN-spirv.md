# TEARDOWN — Link 4: Transistors / raw substrate → open intermediate languages & kernel primitives

Part of the [Fabless Stack](FABLESS-STACK.md) ten-link chain map. In the physical
chain this link is the raw silicon everything is built from. In code, the
equivalent substrate is the **intermediate representation (IR)**: the binary
language every kernel is compiled *to* before a driver turns it into
machine code, plus the kernel primitives written against it. Whoever controls
the IR controls portability — which is why the industry's open IR matters more
to a fabless operator than any single chip.

## SPIR-V — the industry-standard open IR (Khronos Group)

- **What it is:** SPIR-V (Standard Portable Intermediate Representation) is a
  binary IR for compute and graphics kernels, created by the Khronos Group
  (evolved from SPIR for OpenCL, unified with Vulkan in 2015). Compilers emit
  SPIR-V once; each vendor's driver lowers it to its own hardware. It is the
  interchange format underneath Vulkan, OpenCL, and (through translation)
  WebGPU — and Microsoft has announced Direct3D will adopt SPIR-V as its
  interchange format in Shader Model 7.0, which tells you how completely it won.
- **Licence bucket: open standard, royalty-free** (Khronos ratified
  specification; anyone may implement it). The reference tooling —
  **SPIRV-Tools** (assembler, validator, optimizer, disassembler) and
  **SPIRV-Headers** — is **Apache-2.0** (KhronosGroup on GitHub).
- **Why it is the substrate:** it splits the compiler chain in half. Front-ends
  (GLSL/HLSL via glslang, Rust, SYCL, Triton's Vulkan path, ML compilers) never
  target hardware directly; drivers never parse source. For us: any kernel we
  can express in SPIR-V runs on NVIDIA, AMD, Intel, Qualcomm and Apple-silicon
  drivers without a per-vendor recompile — the same "design once, someone
  else's fab builds it" move as the whole fabless model, at the IR layer.

## PTX — NVIDIA's IR, documented but theirs

- **What it is:** PTX (Parallel Thread Execution) is NVIDIA's virtual ISA: CUDA
  compilers emit PTX, the driver JIT-compiles it to the actual SASS machine
  code of each GPU generation. It is thoroughly *documented* (the PTX ISA
  manual is public) — and it is NVIDIA's proprietary specification: usable only
  inside NVIDIA's toolchain, on NVIDIA hardware.
- **Licence bucket: free-but-restricted / proprietary spec.** We document it
  because Triton and PyTorch both emit PTX on NVIDIA seats (knowing the layer
  exists explains where a kernel "goes" on a 4090), but nothing in our stack
  should ever *depend* on PTX directly — SPIR-V and the framework layers above
  it are the portable surface.

## The kernel primitives written on the substrate

- **Triton kernels** (MIT — full teardown in
  [TEARDOWN-framework-kernels.md](TEARDOWN-framework-kernels.md)): the open
  kernel language that replaced hand-written CUDA across much of the industry;
  compiles to PTX on NVIDIA, to AMDGCN via ROCm on AMD, and has SPIR-V/Intel
  and CPU paths. Our runnable smoke kernel lives in `triton/`.
- **GGML's kernel set** (inside llama.cpp, MIT): the CPU/edge-side primitives —
  the same link, executed on the phone/CPU substrate instead of a GPU.
- **cuBLAS / cuDNN kernels:** NVIDIA's closed, hand-tuned libraries — named GAP
  (see FABLESS-STACK.md closed-remainder row). Their open counterparts are
  rocBLAS/rocSOLVER (link 8) and Triton-written kernels.

## Wiring status

- **Catalogued + consumed indirectly everywhere:** every GPU seat we use runs
  SPIR-V or PTX whether we look at it or not. Direct wiring from our side is
  the Triton smoke kernel (`triton/vector_add_kernel.py`) and the compiler
  chain in link 2 that emits these IRs.
- **Plugs into programmes:** the show pipeline's Wan/ComfyUI lane compiles its
  attention and sampling kernels through PyTorch → Triton/Inductor → PTX on
  NVIDIA seats (and would emit SPIR-V/AMDGCN on a ROCm seat, link 8) — this
  link is why that lane is portable across seat vendors at all.

## GAPs at this link

- SASS (the real per-generation machine code): undocumented, closed. PTX is as
  deep as NVIDIA lets anyone see. Named GAP.
- Production SPIR-V compilers for ML (e.g. IREE's full stack) exist and are
  Apache-2.0, but are not adopted here: our seats enter through PyTorch/Triton
  and llama.cpp, which already cover the IR layer for our workloads.
