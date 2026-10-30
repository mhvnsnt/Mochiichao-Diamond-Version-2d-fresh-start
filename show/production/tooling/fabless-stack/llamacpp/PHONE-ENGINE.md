# PHONE-ENGINE — the flagship seat: a real LLM engine on the owner's own phone chip

**The claim, plainly:** the phone in the owner's pocket is a seat. This file is
how the llama.cpp engine (MIT) cross-compiled from this repo's build record
becomes a sideloadable Android app that runs a GGUF model **on the phone's own
chip** — no server, no account, no network. Companion pieces: the engine build
script (`build-android.sh`, same folder), the Wielder seat config
(`wielder-edge-seat.json`), and the grok-local PWA (sibling package) whose
WebLLM mode is the *browser* flavour of this same seat — this file owns the
**native** side, by cross-reference only.

## What was built (verify-then-state)

- Toolchain: Android NDK r27c (Google, free proprietary toolchain; the
  compiler itself is LLVM/Clang — link 2), fetched from dl.google.com,
  663,987,688 bytes, CRC-verified.
- Engine: llama.cpp (ggml-org, MIT) cross-compiled for **arm64-v8a,
  android-28** (Android 9+ — covers every current Motorola), CPU/NEON backend,
  shared libraries on. Products: `libllama.so` + `libggml*.so` (the app-embeddable
  form — built and verified: `file` reports ELF 64-bit ARM aarch64) and the
  `llama-cli` / `llama-server` executables (same toolchain path; their build
  status is recorded in `../smoke/SMOKE-RESULTS.md` §4 — not claimed beyond
  what is written there).
- The build is reproducible from `build-android.sh` alone on any Linux box.

## Engine + model + shell → an APK you can sideload

Three ingredients, one package:

1. **Engine (from this build):** `libllama.so` and the `libggml*.so` set go in
   the APK under `lib/arm64-v8a/`. (The `llama-cli`/`llama-server` executables
   are the no-app-shell route: push them + a GGUF to the phone and run under
   Termux — useful for a 5-minute proof before any app exists.)
2. **Model (GGUF):** one file, downloaded on first run or bundled in assets.
   Sane sizes for this hardware class: a 1–3B model at Q4_K_M ≈ 0.8–2.0 GB.
   Models are **not** in git (staging law) — the app fetches from the staged
   home, or the file is copied over USB for a fully offline install.
3. **Shell (minimal app):** any thin Android shell that (a) loads the native
   libs via JNI — llama.cpp's own `examples/llama.android` in the upstream
   repo is exactly this shell and is the documented starting point — or
   (b) runs `llama-server` as a subprocess and points a WebView at its
   OpenAI-shaped local endpoint. Route (b) is why the Wielder edge-seat
   config works unchanged on the phone: the app is a browser pointed at
   localhost.

Build the shell with the standard free toolchain (Android Studio / Gradle,
JDK) → `app-debug.apk` → install by sideloading (owner enables "install via
USB" / opens the APK on the device). No Play Store, no signing account needed
for personal sideload (debug signing suffices).

## Honest performance class — mid-range Motorola hardware

Target class: **Snapdragon 6 Gen 1 / Dimensity 7300, 6–8 GB RAM** (the owner's
Motorola class). No device was available to measure, so these are **class
estimates from the hardware's known CPU class, stated as ranges — not
measurements**:

- **1–1.5B models at Q4:** usable chat — roughly **10–20 tokens/sec**
  generation, prompt processing several× faster. This is the sweet spot.
- **3B at Q4:** roughly **5–10 tokens/sec** — readable-speed answers, fine for
  a Wielder brain doing short tool-calling turns; long generations feel slow.
- **7–8B at Q4:** fits in 8 GB (barely, ~4.5–5 GB weights) but ~2–4 tok/s —
  a demo, not a seat. On a 6 GB device, don't.
- Thermals: sustained generation heats the phone and throttles; expect the
  top of the range in the first minutes, the bottom after ~10 minutes.
- The GPU/NPU in these chips is **not** used by this build (CPU/NEON path) —
  llama.cpp's Vulkan backend on Android is the named future upgrade, not a
  claim made here.

## Where this plugs in

- **Wielder:** the phone becomes seat `edge-llamacpp-local` (config in this
  folder) whenever it's on the same network / running the shell — a brain
  seat that costs nothing and works offline.
- **grok-local PWA:** the PWA is the zero-install flavour; this native engine
  is the full-speed flavour. Same models (GGUF), same OpenAI-shaped client
  contract, two doors into the same seat.
