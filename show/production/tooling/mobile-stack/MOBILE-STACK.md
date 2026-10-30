# MOBILE-STACK — the phone seat's deployment layer: build → sign → install → run → accelerate → verify

**What this package is.** The fabless pass (PR #69) cross-compiled the
llama.cpp engine for Android and stopped at the handset's door: raw
ARM executables, no way onto the phone. This package is that missing
layer — the industry-standard mobile deployment stack, torn down and
wired, so the phone seat is a *deployable* seat: three install routes
(Termux, adb, APK), one model manifest shared with the browser seat,
an honest acceleration verdict per chip, and a verify-before-you-trust
chain of hashes from this repo to the handset screen.

**Companions (cross-reference only — this package edits no sibling
files):**
- Engine + phone-seat design: `../fabless-stack/llamacpp/PHONE-ENGINE.md`
  (PR #69) — llama.cpp (MIT), NDK r27c build, arm64-v8a / android-28.
- Model manifest of record: `../../wielder/grok-local/MODEL-MANIFEST.md`
  + `../../wielder/grok-local/serving/model_hashes.json` — the phone
  seat there is the MLC build; §5 below is how the two doors share one
  manifest discipline.
- The PWA the phone connects with: `../../wielder/grok-local/pwa/`.

**Licence law applied:** every item below was verified at source on
2026-10-28; buckets are exact. Two corrections to the dispatching
brief, recorded rather than smoothed over: **Termux is GPL-3.0-only**
(the brief said "GPL" — the app's own README + F-Droid record pin
GPL-3.0-only), and **F-Droid's licence is GPL-3.0-or-later** for both
client and server. Nothing else in the brief's licence lines was
wrong.

---

## 1. The vertical chain — ten links

| # | Link | What it is | Licence (verified at source) | Status |
|---|------|-----------|------------------------------|--------|
| 1 | **Termux** | Terminal + Linux package environment that runs native ELF binaries in its own sandbox — **no root**. Our `llama-server` runs inside it unchanged. | Open source — **GPL-3.0-only** (termux-app README; F-Droid listing). Termux package repos may not be re-hosted for other projects (their wiki FAQ) — we use them as a user, not a mirror. | **HAVE** — Route A kit built (`termux/`), first handset run pending |
| 2 | **Android SDK platform-tools + NDK** | `adb`/`fastboot` = the official deploy/debug bridge; the NDK = the cross-compile toolchain that already built the engine (r27c, fabless pass). | **Free proprietary** — Android SDK License Agreement (limited, royalty-free, non-sublicensable; §3.4 bars redistributing the SDK itself). Underlying AOSP/LLVM pieces keep their own open licences per §3.5. | **HAVE** — platform-tools r37.0.1 installed + checksum-verified on this VM for this pass; NDK r27c already staged |
| 3 | **APK signing + App Bundle tooling** | `apksigner` (build-tools) signs/verifies APKs; `bundletool` builds/inspects App Bundles (the Play publishing format) and generates device-specific APK sets from one bundle. | `apksigner`: part of the SDK → SDK licence above. **bundletool: open source — Apache-2.0** (google/bundletool LICENSE). | **HAVE** — build-tools 35.0.0 installed for this pass; shell APK signed with a local debug key (Route C) |
| 4 | **F-Droid** | The open app store: builds apps from source, signs with its own key, and — via `fdroidserver` — lets us run a **self-hosted repo**: our own app channel with signed index + update delivery, no Play account. | Open source — **GPL-3.0-or-later** (client and server). | **PARTIAL** — teardown + repo design in §6; standing up the hosted repo is a first-run item (needs a public host decision) |
| 5 | **MLC LLM / WebLLM** | The zero-install browser seat: the model runs in the phone's browser via WebGPU. Already wired by grok-local's PWA. | Open source — **Apache-2.0** (mlc-llm and web-llm). | **HAVE (sibling)** — deployment teardown in §5; this package changes nothing in grok-local |
| 6 | **ONNX Runtime Mobile + LiteRT** | The two standard portable on-device inference runtimes — the shape an eventual in-app (non-llama.cpp) inference seat would take. | ORT: open source — **MIT**. LiteRT (TFLite's successor): open source — **Apache-2.0** (google-ai-edge/LiteRT). | **GAP by design** — teardown in §7; not wired: our seat is GGUF/llama.cpp, and neither runtime eats GGUF. Recorded so the option is priced, not forgotten |
| 7 | **Hardware delegates** | NNAPI (the OS bridge — **deprecated in Android 15**), Qualcomm QNN (Hexagon NPU), MediaTek NeuroPilot (APU). | NNAPI: AOSP, Apache-2.0 (frozen). QNN: **free proprietary** (Qualcomm licence acceptance + account; runtime libs redistributable inside apps per that licence). NeuroPilot: **free proprietary** (MediaTek licence: limited, non-transferable; full SDK access is account/customer-gated). | **DOCUMENTED, NOT WIRED** — full teardown + per-phone verdicts in `DELEGATES-TEARDOWN.md`. Headline: CPU/GGUF is the proven class on both phones; no NPU path exists from our build |
| 8 | **Gradle + AndroidX** | The standard Android app build system + Google's app library set — the grown-up form of Route C when the shell outgrows hand-rolled packaging. | Open source — **Apache-2.0** (both). | **PARTIAL** — the shell in this package is built with the raw build-tools chain (aapt2 → javac → d8 → apksigner) so it has zero build-system dependency; the Gradle project layout is the documented next step in `apk-shell/README.md` |
| 9 | **scrcpy** | Mirrors + controls the phone screen over adb from the workstation — how the agent *watches and verifies* the handset during first-run proofs instead of flying blind. | Open source — **Apache-2.0** (Genymobile/scrcpy). | **HAVE (pattern)** — used by Route B's verify step; installed on demand on the workstation (`adb` is the only hard dependency) |
| 10 | **Emulator / AVD + test tooling** | Test-before-handset discipline: the shell APK's install/launch/smoke can be rehearsed in an emulator before touching the owner's phone. | Emulator: SDK licence (free proprietary). | **PARTIAL with honest limits** — an x86_64 emulator cannot run our arm64 native libs at phone speed (translation), and an ARM system image is not his silicon. The emulator rehearses *packaging*; **the handset proof stays the handset proof** (§8) |

## 2. The horizontal matrix — his two phones

| | moto g stylus 5G - 2023 | moto edge 2024 |
|---|---|---|
| Chip class | Snapdragon 6 Gen 1 (Adreno 710 GPU, Hexagon DSP) | Dimensity 7300 (APU 655) |
| RAM | 6–8 GB class | 8 GB class |
| Route A (Termux) | ✅ same kit | ✅ same kit |
| Route B (adb) | ✅ same kit | ✅ same kit |
| Route C (APK) | ✅ same APK (arm64-v8a) | ✅ same APK |
| Browser seat (WebLLM) | ✅ 1.7B default | ✅ 1.7B default; 4B opt-in (8 GB) |
| Native model (GGUF door) | Qwen3-1.7B Q4_K_M (1.11 GB) | same |
| NPU verdict | QNN exists for this silicon; **not reachable from our build** — CPU only | NeuroPilot exists for this silicon; **not reachable from our build** — CPU only |
| Expected class (estimate, PHONE-ENGINE) | 1.7B Q4 ≈ 10–20 tok/s CPU | same class |

One kit, one APK, one manifest — nothing is per-phone except the
delegate verdicts. That is deliberate: the deployment layer must not
fork by handset.

## 3. The three routes (full procedures: `SIDELOAD-RUNBOOK.md`)

- **Route A — Termux (no computer, no cable, no developer mode).**
  Install Termux (F-Droid build), copy the kit folder onto the phone
  any way he likes (USB, browser download, TeraBox), run one script.
  The script verifies every hash, fetches/verifies the model, and
  starts the server on `127.0.0.1:8080`. The PWA (or any browser tab)
  pointed at localhost is the chat window. **This is the 5-minute
  proof and the recommended first run.**
- **Route B — adb (the agent drives).** One-time owner taps:
  Developer Options on, USB debugging on, "Allow" on the RSA prompt.
  After that the agent pushes, installs, launches, screenshots
  (scrcpy) and reads logs itself — every later route uses this bridge
  for verification.
- **Route C — APK (the product form).** The signed shell APK
  (built from `apk-shell/`; artifact + signer recorded in its
  `BUILD-RECORD.md`): installs like any app, extracts the engine on first
  launch, starts `llama-server` as its own subprocess, and shows the
  server UI in a WebView — the PHONE-ENGINE route-(b) design, built.
  Updates later ride the F-Droid self-hosted repo (§6).

## 4. The transfer manifest — hashes are the contract

`termux/transfer-manifest.json` pins every byte that crosses to the
phone: the ten engine files from the fabless build (sha256 read from
the actual build output on this VM, 2026-10-28 — the two executables
are thin launchers; the weight is in `libllama-common.so` and the
`-impl` libraries, unstripped debug builds, ≈282 MB total) and the
phone-seat GGUF (§5). `termux-setup.sh` refuses to run anything whose
hash doesn't match — a mismatch is a hard stop, never a warning,
same discipline as grok-local's `pull_model.py`.

## 5. One manifest, two doors (MLC ↔ GGUF)

The phone seat has two doors into the **same base model**
(Qwen/Qwen3-1.7B, Apache-2.0):

| Door | Build | Pinned by | Size |
|------|-------|-----------|------|
| Browser (WebLLM/PWA) | `mlc-ai/Qwen3-1.7B-q4f16_1-MLC` @ `80b3abce…` | grok-local MODEL-MANIFEST (repo total 979,424,190 B) | ~0.98 GB |
| Native (Termux/APK) | `unsloth/Qwen3-1.7B-GGUF` → `Qwen3-1.7B-Q4_K_M.gguf` @ rev `d7f544ee…` | this package's transfer manifest (sha256 `b139949c…`, 1,107,409,472 B, LFS oid read from the HF API) | ~1.11 GB |

Same weights, two quantizations for two runtimes. The rule that keeps
them one seat: **the base model + licence live in grok-local's
manifest; each door pins its own artifact hash in its own manifest**
(this package for GGUF, grok-local for MLC), and neither door may
swap the base model without the other being updated in the same
landing. A Q8_0 official-Qwen GGUF (1,834,426,016 B, sha256
`061b54da…`, `Qwen/Qwen3-1.7B-GGUF` @ `90862c4b…`) is recorded in the
transfer manifest as the higher-quality alternate — it fits both
phones and is a config flip, not a rebuild.

## 6. Distribution without Play (F-Droid design)

For our own apps (the Route C shell and anything after it), the
Play-free channel, in order of increasing machinery:

1. **Direct APK** (today): install the signed APK from storage —
   one Android warning tap ("install unknown apps" per source app).
2. **Self-hosted F-Droid repo** (first-run item): `fdroidserver`
   (GPL-3.0-or-later) builds a signed index over a folder of our
   APKs; the owner adds the repo URL to his F-Droid client once and
   gets *updates* like an app store. Hosting = any static host
   (the repo's own GitHub Pages-class host or TeraBox-adjacent
   staging — a host decision, not a build problem). Signing key =
   one offline keystore, generated once, backed up with the repo's
   other keys; the repo fingerprint is the trust anchor.
3. **Reproducible builds** (the F-Droid main-repo bar): not needed
   for a self-hosted repo; noted so nobody promises it.

## 7. The portable runtimes (why they're a priced GAP, not a hole)

ONNX Runtime Mobile (MIT) and LiteRT (Apache-2.0) are what a
*conventional* ML feature (vision, audio, embeddings) would ship in.
Our phone seat is a GGUF language model, and llama.cpp is its
runtime — wiring ORT/LiteRT today would buy a second runtime that
runs none of our models. They are recorded here, licenced and
sized, as the standing answer when a non-LLM on-device model enters
the programme (e.g. a vision gate): ORT for PyTorch/ONNX-shaped
models and its QNN execution provider is also the only *documented*
bridge from a mainstream runtime to the Hexagon NPU (see
`DELEGATES-TEARDOWN.md`).

## 8. Verification discipline (test-before-handset, honestly bounded)

- Scripts: `bash -n` clean + a dry-run mode that prints every command
  without executing (recorded in `termux/TEST-RECORD.md`).
- APK: built and signature-verified on this VM (`apksigner verify
  --print-certs`), contents listed (`aapt2 dump badging`) — recorded
  in `apk-shell/BUILD-RECORD.md`.
- Emulator: **not** claimed as a phone substitute. No emulator run is
  recorded in this package, because an emulated install would prove
  packaging only and this VM's ARM translation would prove nothing
  about his Motorolas. The first *real* run is Route A or B on a
  handset, with the exact success lines named in the runbook.
- The handset proof remains the handset proof: model answers on the
  phone's own chip, airplane mode on. Nothing in this package
  upgrades an estimate to a measurement.

## 9. Where it plugs in

- **fabless-stack:** this package is link "board assembly → handset"
  made real — PHONE-ENGINE's sideload paragraph is now three
  executable routes. Cross-referenced, not edited.
- **grok-local:** the PWA gains its native sibling; both seats serve
  the same OpenAI-shaped endpoint on `127.0.0.1:8080`, so the PWA's
  server-seat mode and Wielder's `local_client.py` point at the
  phone unchanged.
- **Wielder:** the phone registers as the same `edge-llamacpp-local`
  seat PHONE-ENGINE named — reachable when the phone and the caller
  share a network (Route A/B/C all bind localhost by default;
  LAN exposure is an explicit flag in `start-server.sh`, off by
  default, because the server has no auth).

## 10. Proven vs first-run

**Proven on this VM (2026-10-28):** all ten licences at source; the
SDK pieces installed with Google's own checksums verified
(platform-tools r37.0.1, platform 35, build-tools 35.0.0); the
Termux kit's syntax + dry-run; the transfer manifest's engine hashes
read from the real build output; the model pins read from the HF
API (sizes + LFS sha256); the Route C APK built and
signature-verified (see `apk-shell/BUILD-RECORD.md`).
**First-run (handset):** Route A end-to-end, Route B end-to-end,
Route C install + first launch, tok/s measurement on both chips,
F-Droid self-hosted repo stand-up. The runbook names the exact
owner taps — everything else is ours.
