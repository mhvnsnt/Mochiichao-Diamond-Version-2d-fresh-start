# DELEGATES-TEARDOWN — the acceleration layer, honestly graded per chip

**The question:** both of the owner's phones have AI silicon
(a Hexagon DSP in the Snapdragon, an APU in the Dimensity). Can
the phone seat use it? **The short answer, in writing so nobody
has to re-ask: not from anything we have built, and there is no
honest shortcut.** The seat we ship runs on CPU (NEON) — the class
PHONE-ENGINE already measured by estimate at 10–20 tok/s for the
1.7B. This file is the teardown of the three roads to the NPU,
what each would actually cost, and the verdict per phone.

All licence/terms facts verified at source, 2026-10-28.

## The three roads

### 1. NNAPI — the OS bridge (closed for new work)

- **What:** Android's Neural Networks API (8.1+, 2017) — the one
  OS-level bridge every framework used to reach vendor drivers.
- **Status:** **Deprecated in Android 15 (API 35).** AOSP's own
  release notes say so; the NDK headers annotate every symbol
  "NN API is deprecated. Users should migrate to TFlite [LiteRT]",
  and Google's migration guidance expects most future devices to
  serve NNAPI workloads on the **CPU backend**. The HAL/driver
  layer underneath is untouched — but no new work should target
  the API.
- **Licence:** AOSP — Apache-2.0.
- **For us:** llama.cpp doesn't speak NNAPI at all; TFLite's NNAPI
  delegate was the main consumer and is legacy. MediaTek has
  already said its next NeuroPilot (NP9) removes NNAPI support.
  **Verdict: dead end — do not wire.**

### 2. Qualcomm QNN / AI Engine Direct — the Snapdragon road

- **What:** Qualcomm's own SDK for the Hexagon NPU (HTP): model
  converters (ONNX/TFLite → QNN), context binaries, and runtime
  libraries (`libQnnHtp.so` + per-arch skel libraries) that apps
  bundle to run graphs on the DSP.
- **Terms (verified):** free download from the Qualcomm Developer
  Network / Qualcomm Software Center, but **free proprietary**:
  a Qualcomm account + accepting the AI Engine Direct licence
  agreement is required before the download unlocks, some SDK
  entitlements are additionally group-gated, and the SDK may not
  be redistributed — only the runtime libraries may ship inside
  an application, under Qualcomm's licence. Commercial terms ride
  on that same licence; it is not open source in any part.
- **Reachability:** real consumers exist — ONNX Runtime's **QNN
  execution provider** and ExecuTorch's Qualcomm backend both
  target HTP through this SDK; LiteRT has a QNN delegate path.
  All of them consume **compiled graphs** (ONNX/TFLite/ExecuTorch
  format), produced offline per chip generation.
- **For his Snapdragon 6 Gen 1:** the silicon qualifies (Hexagon
  DSP with HTP support in this class), the SDK path is real, and
  none of it touches GGUF. Reaching it means a *second model
  pipeline* (export Qwen3-1.7B to ONNX, quantize to QNN's int
  formats, compile per-device) plus accepting that LLM-on-HTP via
  these bridges is the least mature corner of each stack.
  llama.cpp's own experimental Hexagon backend exists upstream
  but is not in the build the fabless pass produced and is not
  production-graded.
- **Verdict (stylus 5G - 2023): NPU = documented option, NOT
  wired, NOT promised.** CPU is the seat. Revisit only if a
  measured CPU number disappoints *and* the programme accepts a
  second model pipeline + a proprietary SDK dependency.

### 3. MediaTek NeuroPilot — the Dimensity road

- **What:** MediaTek's AI SDK stack for its APU: TFLite with the
  **Neuron delegate** (third-party apps' documented entry point),
  offline model compilation to DLA format for peak performance,
  and the Neuron runtime (vendor-partition only — not available
  to ordinary apps).
- **Terms (verified):** **free proprietary** — MediaTek's licence
  is limited, non-exclusive, non-transferable, terminable, and
  bars reverse engineering of object code; redistribution is
  allowed only for components an application must incorporate.
  Access is tiered: Dimensity developer docs are public, but full
  SDK downloads and Android AI resources are gated behind
  MediaTek accounts, with some material restricted to direct
  customers (MOL accounts). NeuroPilot's own roadmap removes
  NNAPI support (NP9), leaving the TFLite/Neuron-delegate path as
  the app-facing road.
- **For his Dimensity 7300 (APU 655):** the delegate path targets
  quantized TFLite graphs — again, not GGUF, and generative-LLM
  support in NeuroPilot is showcased on flagship APUs, not
  documented as a 7300-class app capability.
- **Verdict (edge 2024): NPU = documented option, NOT wired, NOT
  promised.** Same reasoning as QNN, one notch further away
  (account gating + flagship-first LLM story).

## What *would* use the silicon today (for completeness)

The only acceleration our current artifacts could grow into
without a second model pipeline is **GPU**: llama.cpp's Vulkan
backend against the Adreno 710 / Mali-class GPUs. PHONE-ENGINE
already names it the future upgrade. It is a rebuild of the
engine with the Vulkan backend enabled + on-handset measurement —
a defined piece of future work, recorded here so it isn't
mistaken for an NPU claim. GPU ≠ NPU; the docs must never blur
them.

## Per-phone verdict table

| | moto g stylus 5G - 2023 (SD 6 Gen 1) | moto edge 2024 (Dimensity 7300) |
|---|---|---|
| Seat today | CPU/NEON via llama.cpp — **proven class** | CPU/NEON via llama.cpp — **proven class** |
| NNAPI | Deprecated OS-wide — no | Deprecated OS-wide — no |
| Vendor NPU SDK | QNN: real, proprietary, account-gated; needs a second (ONNX) model pipeline | NeuroPilot: real, proprietary, tier-gated; TFLite-graph shaped |
| GPU (Vulkan) | Adreno 710 — future llama.cpp rebuild | Mali-class — future llama.cpp rebuild |
| Recommendation | Ship CPU; measure; revisit only on evidence | Ship CPU; measure; revisit only on evidence |

**The standing rule this teardown sets:** no doc, manifest, or
report in this programme may claim NPU acceleration for the phone
seat unless a handset run with the delegate active is recorded in
`termux/TEST-RECORD.md`. Until then the honest sentence is the one
PHONE-ENGINE already carries: the GPU/NPU in these chips is not
used by this build.
