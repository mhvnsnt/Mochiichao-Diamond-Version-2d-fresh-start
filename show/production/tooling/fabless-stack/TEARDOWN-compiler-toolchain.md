# TEARDOWN — Link 2: Lithography machine → the compiler toolchain layer

Part of the [Fabless Stack](FABLESS-STACK.md) ten-link chain map. In the physical
chain, ASML's EUV lithography machines are the sole-source tools that print a
design onto silicon — ~$200M each, and nobody builds a competing one by hand.
In code, the equivalent sole-source-shaped layer is the **compiler toolchain**:
the machinery that prints our designs (models, kernels) onto whatever silicon
the seat has. The industry-standard version is open, and — exactly like ASML's
machines — almost nobody writes their own; everyone builds on it.

## LLVM — the machine tool everyone prints through

- **What it is:** the modular compiler infrastructure (IR, optimizers, code
  generators for every major CPU/GPU target) underneath Clang, Rust, Swift,
  Triton's codegen, PyTorch's Inductor (via generated code), ROCm's HIP
  compiler, Vortex's VOLT toolchain (link 1), and Android's NDK clang — the
  very toolchain that cross-compiles our phone engine in `llamacpp/`.
- **Licence: Apache-2.0 with LLVM exceptions** (the exception exists so compiled
  output isn't encumbered). Verified via llvm/llvm-project.
- **Status:** the definition of industry standard; every seat we will ever use
  runs code LLVM helped produce.

## Apache TVM — the ML-specialized printer

- **What it is:** a machine-learning compiler stack: takes a model graph
  (from PyTorch/ONNX etc.), optimizes it (operator fusion, layout, autotuning),
  and emits code for CPUs, GPUs, and accelerators — including Android/edge
  targets. It is also the parent project of **MLC-LLM**, the engine WebLLM
  (link 8's browser runtime) is built on: the browser seat's models are
  TVM-compiled to WebGPU/WASM.
- **Licence: Apache-2.0** (apache/tvm, Apache Software Foundation project).
- **Our use:** indirect but real — WebLLM's model library is TVM output. We do
  not currently run TVM directly; if a future seat needs a model compiled for
  an exotic target, TVM is the documented first reach, ahead of any hand-rolled
  converter.

## The ML compilers inside our daily stack

- **Triton's compiler** (MIT — link 4 teardown): Python-level kernels → PTX /
  AMDGCN / SPIR-V-class targets. This is the lithography step our own kernel
  work actually touches.
- **PyTorch Inductor / AOTAutograd** (PyTorch licence — link 4/6 teardown in
  TEARDOWN-framework-kernels.md): graph capture + codegen for whole models.
- **ggml's build** (link 8): plain CMake + the platform compiler — the phone
  engine's entire "lithography" is NDK clang (LLVM) plus CMake, which is the
  point: the standard tools suffice.

## Wiring status

- **Catalogued + consumed.** No vendoring: LLVM/TVM are platform-scale
  toolchains consumed through the pieces above them (NDK, Triton, WebLLM).
  The one place this package touches the layer directly is
  `llamacpp/build-android.sh`, which pins the NDK (LLVM clang) toolchain file
  and target flags.
- **Plugs into programmes:** every programme — Wielder seats, grok-local
  serving, the show pipeline — runs on LLVM-compiled runtimes; the show lane's
  ComfyUI/PyTorch stack compiles its kernels through this layer on every run.

## GAPs at this link

- **NVCC + the CUDA compiler driver chain** are NVIDIA's (proprietary, CUDA
  EULA): on NVIDIA seats our PyTorch/Triton builds pass through NVCC for some
  code paths. Named GAP; the open LLVM paths above are why it is a dependency
  of convenience on rented seats, not of architecture in our own code.
- No open tool prints *for a 4090 specifically* better than NVIDIA's own —
  accepted: we rent/print on their machine (link 10) while keeping our designs
  in the open layers.
