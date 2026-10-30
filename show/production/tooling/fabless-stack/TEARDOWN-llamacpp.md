# TEARDOWN — llama.cpp + GGUF (anywhere inference; flagship phone seat)

Part of the [Fabless Stack](FABLESS-STACK.md). **Licence: MIT** (ggml-org/llama.cpp,
verified at source 2026-10-28; build-numbered releases — b11962 on 2026-10-28 —
very actively maintained). This is the engine that runs a model on hardware that
has no datacenter GPU: plain CPUs, Apple silicon, Android phones, and CUDA/HIP/
Vulkan GPUs when present. In the chain it belongs to link 8 (runtime layer) and
is the flagship of the phone seat (see `llamacpp/PHONE-ENGINE.md`).

## What it actually is

- A C/C++ inference engine for Llama-family and many other architectures, built
  on the **ggml** tensor library. No Python, no framework dependency at runtime:
  one binary + one model file.
- **GGUF** is its model format: a single self-contained file carrying weights
  (quantized — Q4/Q5/Q8 etc.), tokenizer, and metadata. The format is part of
  the same MIT project; the whole ecosystem (Ollama and most local-LLM tools)
  standardized on it.
- Backends: CPU (with ARM NEON / x86 AVX paths), CUDA, HIP/ROCm, Vulkan,
  Metal, WebGPU builds exist in-tree. Same model file, every backend.
- `llama-server` exposes an **OpenAI-compatible HTTP API** — which is why it
  plugs straight into Wielder seats and OpenAI-shaped clients with only an
  endpoint change. `llama-cli` is the terminal front-end used in the smoke.

## Why it's our anywhere-engine

- Seat classes nothing else covers: the owner's phone (native arm64 build —
  see the Android build record in `smoke/SMOKE-RESULTS.md` and
  `llamacpp/build-android.sh`), a CPU-only VM (proven in this package's smoke),
  a laptop, a future edge box.
- Quantization is the enabling trick: a 1–3B model at Q4 is a 1–2 GB file that
  runs in a phone's RAM budget; quality loss vs fp16 is modest for chat-class
  work and is a *model choice*, not an engine limitation.

## Wiring in this package

- `llamacpp/build-android.sh` — the exact NDK cross-compile (arm64-v8a,
  android-28) that produced (or, on toolchain failure, will produce) the phone
  engine binary.
- `llamacpp/PHONE-ENGINE.md` — engine + GGUF + minimal shell → sideloadable APK,
  with the honest performance class for Snapdragon 6 Gen 1 / Dimensity 7300.
- `llamacpp/wielder-edge-seat.json` — the Wielder-facing seat config: an
  OpenAI-compatible endpoint on localhost/LAN served by `llama-server`.
- `smoke/` — CPU build + tiny-model generation + server-endpoint proof,
  recorded with real outputs.

## GAPs / honest limits

- No GPU on this VM: the CUDA/HIP/Vulkan backends are compile-time present but
  unproven here — first-run items on a real seat.
- Phone performance is a *class estimate* in PHONE-ENGINE.md (no device was
  available to measure); the binary's architecture and the build are proven,
  the tokens/sec on the owner's handset are not.
- llama.cpp tracks model architectures fast but not instantly: a brand-new
  architecture may lag its PyTorch release by days–weeks.
