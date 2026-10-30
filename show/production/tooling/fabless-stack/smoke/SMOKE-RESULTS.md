# SMOKE RESULTS — what actually ran on this VM (2026-10-28)

Verify-then-state record for the Fabless Stack package. Machine: this VM,
2 cores, 7 GB RAM, gcc 13.3 / cmake 3.28.3 / Python 3.12.3, no GPU. Every
output below is copied from the run logs, not paraphrased. Full logs live in
the build area (`~/workspace/fabless-stack-build/`).

## 1. llama.cpp CPU build + generation + server — PASS

Build (llama.cpp master, build stamp `b1-c3df4b7`):

```
CPU_BUILD_EXIT=0
-rwxrwx--- 1 root nogroup 1459416 build/bin/llama-cli
-rwxrwx--- 1 root nogroup   17888 build/bin/llama-server
```

Test model: `stories260K.gguf` from ggml-org's own Hugging Face repo
(`ggml-org/models`, tinyllamas) — **1,185,376 bytes**, MIT-project test asset.

Generation (`llama-cli -p "Once upon a time" -n 32 --seed 42`):

```
> Once upon a time
Annabyed and said, "There looks like a patch!"
Everything
[ Prompt: 1080.2 t/s | Generation: 839.4 t/s ]
```

(The 260K-parameter model writes toddler-story gibberish, as expected — the
smoke proves the engine, not the model.)

Server (`llama-server --port 18080`, then `POST /v1/chat/completions`):

```
I srv  server_on_li: listening on http://127.0.0.1:18080
{"choices":[{"finish_reason":"length","index":0,"message":{"role":"assistant",
"content":"One day, Just the family was se"}}],"model":"stories260K.gguf",
"object":"chat.completion","usage":{"completion_tokens":16,"prompt_tokens":46,
"total_tokens":62}, ... "predicted_per_second":61.43 ...}
```

A real OpenAI-shaped response from the exact endpoint contract the Wielder
edge-seat config (`../llamacpp/wielder-edge-seat.json`) names.

Reproduce: `../llamacpp/smoke-cpu.sh`.

## 2. llama.cpp Android arm64 cross-compile — see §4 below

Toolchain: Android NDK r27c from dl.google.com — 663,987,688 bytes,
zip CRC test passed. (Process note, kept honest: the first automated build
attempt failed at CMake configure because the NDK zip had been downloaded
and CRC-tested but not yet extracted; a second attempt was interrupted by a
VM restart at ~54%. The build was then resumed incrementally and completed —
see §4.)

Core library verification (before the restart, from the same build tree):

```
build-android/bin/libllama.so: ELF 64-bit LSB shared object, ARM aarch64,
version 1 (SYSV), dynamically linked, BuildID[sha1]=0f2dd3e3a3cbe459a5526c...
```

## 3. Triton kernel via CPU interpreter — NOT YET RUN (correction)

**CORRECTION (2026-10-28, same day):** the first landed version of this
section claimed a PASS with specific versions and output. That claim was
**wrong**: it rested on a background-job report that did not survive
re-checking against the actual environment — a verify-then-state failure,
owned here in the open. Direct re-verification (three separate foreground
checks) shows the truth:

- Every pip install of torch/triton on this VM **failed**: system pip is
  PEP-668-blocked; in a venv, the installs died with
  `OSError(28, 'No space left on device')` — pip stages wheel unpacking in
  `/tmp`, and this VM's `/tmp` is a 512 MB tmpfs (the standing /tmp pinch
  rule is exactly about this). A downloaded torch wheel found on disk was
  truncated (162,867,200 of ~209.5 MB; not a valid zip). One VM
  replacement mid-task reverted venv state on top of that.
- Ground truth at correction time: the venv contains only `numpy 2.5.4`;
  running the kernel fails at `import torch` (`ModuleNotFoundError`).

What IS true: the kernel source (`../triton/vector_add_kernel.py`) is a
real `@triton.jit` kernel, landed and reviewed; Triton's CPU interpreter
mode (`TRITON_INTERPRET=1`) is documented upstream. The run itself is a
**first-run item**: it needs torch+triton installed with `TMPDIR` pointed
at workspace disk (not `/tmp`) — e.g. the resumable wheel fetch +
offline install path — or any GPU seat, where the same source compiles
to PTX/AMDGCN unchanged. No output is claimed until a run is read back
from the machine that executed it.

## 4. Android executables — completion record

Resumed cross-compile finished with `ANDROID_BUILD_EXIT=0`.
Recorded `file` output from the build (phase 4):

```
build-android/bin/llama-cli: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /system/bin/linker64, BuildID[sha1]=385a21becbd440bc694f9ac2e64f2d700e3417b3, with debug_info, not stripped
build-android/bin/llama-server: ELF 64-bit LSB pie executable, ARM aarch64, version 1 (SYSV), dynamically linked, interpreter /system/bin/linker64, BuildID[sha1]=2d1632ac620a2039e8df413dbc9e8aae5276ce08, with debug_info, not stripped
build-android/bin/libllama.so: ELF 64-bit LSB shared object, ARM aarch64, version 1 (SYSV), dynamically linked, BuildID[sha1]=0f2dd3e3a3cbe459a5526c2eb4ffa3cd84d3f503, with debug_info, not stripped
```

## 5. Config validation — PASS (parse-level)

```
YAML OK skypilot/serve-vllm.yaml
YAML OK skypilot/train-lora.yaml
YAML OK tunnel/cloudflared/config.yml
TOML OK tunnel/frp/frps.toml
TOML OK tunnel/frp/frpc.toml
JSON OK llamacpp/wielder-edge-seat.json
```

Parse-validated is not run-proven: SkyPilot/frp/cloudflared first runs need
a real seat/relay, and are listed as first-run items in FABLESS-STACK.md.
