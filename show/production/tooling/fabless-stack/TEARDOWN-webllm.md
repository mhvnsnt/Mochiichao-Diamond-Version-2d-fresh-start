# TEARDOWN — WebLLM (browser inference: the seat is the phone itself)

*Verified at source 2026-10-28: github.com/mlc-ai/web-llm — licence read
from the repo: **Apache-2.0**. Companion project of MLC LLM (Apache TVM
Unity compiler stack). Repo state: active, npm package `@mlc-ai/web-llm`,
CDN import via esm.run also supported by the project.*

## What it is

WebLLM is a JavaScript engine that runs language models **inside the web
browser**, accelerated by **WebGPU**, with no server at all. The model is
compiled ahead of time into MLC format (weights quantized, typically
q4f16/q4f32) plus a WebAssembly/WebGPU model library; the browser
downloads both once and caches them (Cache API / IndexedDB / OPFS
backends), then generates locally. Its API surface is deliberately
OpenAI-shaped: `engine.chat.completions.create(...)` with streaming,
JSON mode, seeding and logit control — function calling is marked WIP
upstream, stated here so nobody plans tool-calling on it yet.

Model support (upstream prebuilt list, checked in the repo README):
Llama 3/2, Phi 3/2, Gemma, Mistral 7B class, Qwen2 (0.5B/1.5B/7B) and
Hermes variants — small-brain class, which matches the honest expectation
set for phone hardware (see `llamacpp/PHONE-ENGINE.md` for the native
side's hardware arithmetic; the same physics applies here).

## Platform reality (WebGPU), verified from multiple current sources

- WebGPU ships enabled by default in Chrome/Edge 113+; on **Android,
  Chrome 121+** is the working floor for WebLLM-class apps.
- Firefox added WebGPU in 141 (Windows) / 145 (Apple Silicon); Safari
  gained it with the 26 generation (macOS Tahoe / iOS 26).
- Consequence for the PWA: **feature-detect or fail honestly.** The
  integration spec below requires `navigator.gpu` detection and a
  plain-language fallback (route to the tunnelled seat) rather than a
  dead screen.
- Browser memory ceilings are the real wall: single WebGPU buffer limits
  (2–4 GB class) force weight sharding across buffers, which the MLC
  runtime already handles; practical phone models stay in the
  1B–8B-quantized class on 6–8 GB RAM phones, shared with the OS and the
  page itself.

## What it replaces in the proprietary chain

The server. Every other layer in this stack exists to get a request to a
GPU somewhere; WebLLM deletes the "somewhere" for the small-model tier.
In fabless terms: it's the one seat we don't borrow, rent, or rotate —
the chip is already bought and in the owner's pocket. The trade is brain
size and speed (roughly 70–80% of native speed in the same class, per
current practitioner measurements; treat as indicative, not a gate).

## Integration spec (what the grok-local PWA consumes)

The PWA's Mode B (on-device) implements against this contract; the
grok-local lane owns the PWA, this folder owns the spec:

1. **Engine load**: `CreateMLCEngine(modelId, { initProgressCallback })`
   from `@mlc-ai/web-llm` (npm) or the esm.run CDN build; run it in a
   **Web Worker** (`CreateWebWorkerMLCEngine`) so generation never
   freezes the chat UI. Progress callback drives the PWA's "downloading
   the brain" bar — first load is a real download (model-size bytes) and
   must be messaged as such; later loads come from cache.
2. **Model registry**: the PWA offers only models from WebLLM's
   `prebuiltAppConfig.model_list` unless a custom MLC compile is staged
   by us (a future item — compiling our fine-tuned model to MLC format
   is the join between the training kit and Mode B; flagged as a join,
   not wired here).
3. **Chat path**: OpenAI-shaped `chat.completions.create` with
   `stream: true`; the same message schema the PWA uses for the
   tunnelled seat (Mode A), so a conversation can move between seats.
4. **Capability gate**: on load — `navigator.gpu` present? model fits
   the device class? If either fails, Mode B hides itself and the PWA
   says why in plain words, per the owner's no-silent-fallback rule
   applied to features.
5. **Cache policy**: default Cache API backend; the PWA tells the owner
   the cached size and offers a clear-cache action (phone storage is
   the owner's, spent visibly).

## Walls / GAPs

- Function calling: upstream WIP — Mode B is a chat seat, not a tool
  seat, until that lands. Wielder tool work stays on served seats.
- iOS: Safari's WebGPU is new-generation only; older iPhones fall back
  to Mode A by the capability gate, honestly.
- Thermal/battery: sustained generation on a phone chip throttles;
  Mode B is a pocket seat, not a production seat.
- Custom (fine-tuned) models need an MLC compile step — documented join
  above, not yet wired.

## Status in this folder

SPEC LANDED (this document). The PWA code is grok-local's; the on-device
first-run proof is: owner's Android phone, Chrome current, open the PWA,
Mode B loads a 1–3B prebuilt model fully offline after first cache, one
streamed reply. That proof belongs to the grok-local lane's first-run
list; this spec is what it is checked against.
