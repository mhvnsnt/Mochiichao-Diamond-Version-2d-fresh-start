# Ollama local brain seat — runtime recipe (parity round 2)

Reproduces the local advisory seat proven 2026-10-28
(see `ollama-seat-proof.md` in this folder for the live transcript).
Everything lives under `~/workspace/wielder-parity2/runtime/` —
nothing system-wide, nothing in `/tmp`, and the live Wielder services
in `~/workspace/wielder-home` are never touched by this recipe.

## What runs

- **Runner:** Ollama **0.40.12** (official Linux release), CPU-only.
- **Model:** `qwen2.5-coder:7b` — GGUF Q4_K_M, 7.6B params, blob
  4,683,074,048 bytes (4.7 GB), 32K native context, run with
  `num_ctx` capped at **8192** by Wielder's advise path.
- **Seat contract:** Wielder `brain.py` → `POST http://127.0.0.1:11434/api/chat`,
  seat name `ollama-local`. Advisory only — LLM output never affects
  routing or PASS verdicts (constitution unchanged).

## Install (workspace-resident)

```bash
RUNTIME=~/workspace/wielder-parity2/runtime
mkdir -p $RUNTIME/ollama $RUNTIME/ollama-models $RUNTIME/logs

# 1. Official tarball. NOTE (2026-10-28): https://ollama.com/download/ollama-linux-amd64.tgz
#    redirects to the latest GitHub release, where the asset is now named
#    ollama-linux-amd64.tar.zst (the .tgz name 404s on v0.40.12).
curl -L -o $RUNTIME/ollama-linux-amd64.tar.zst \
  https://github.com/ollama/ollama/releases/download/v0.40.12/ollama-linux-amd64.tar.zst
# verify against the release's own sha256sum.txt:
#   ollama-linux-amd64.tar.zst  f8adcb7e08d272283a4bd3abc18cf581afe37e64b2aee04fda4f407f215485ba
sha256sum $RUNTIME/ollama-linux-amd64.tar.zst

# 2. Extract. The VM has no zstd binary; a workspace venv with the
#    `zstandard` wheel does it (tarfile over a streaming decompressor):
$RUNTIME/tools-venv/bin/python - <<'EOF'
import zstandard, tarfile
dctx = zstandard.ZstdDecompressor()
with open('ollama-linux-amd64.tar.zst','rb') as fh:
    with dctx.stream_reader(fh) as reader:
        with tarfile.open(fileobj=reader, mode='r|') as tf:
            tf.extractall('ollama')
EOF
# (tools-venv: python -m venv tools-venv && tools-venv/bin/pip install zstandard,
#  with PIP_CACHE_DIR and TMPDIR pointed inside $RUNTIME.)

# 3. CPU-only size trim (optional, saves 2.4 GB of the 2.5 GB extract):
#    the tarball bundles CUDA libraries this VM can never load.
rm -rf $RUNTIME/ollama/lib/ollama/cuda_v12 $RUNTIME/ollama/lib/ollama/cuda_v13
$RUNTIME/ollama/bin/ollama --version   # -> ollama version 0.40.12
```

## Model pull

Normal path (server does it; resumable, but see the staging note):

```bash
curl -sN http://127.0.0.1:11434/api/pull -d '{"model":"qwen2.5-coder:7b"}'
# or: OLLAMA_HOST=127.0.0.1:11434 $RUNTIME/ollama/bin/ollama pull qwen2.5-coder:7b
```

Staging note from the proof run (honest record): on this VM, detached
download clients were repeatedly reaped mid-pull and Ollama's resume
only credits coarse per-part checkpoints, so the proof's blob was
finished by downloading the missing part-ranges directly from
`registry.ollama.ai` in parallel, splicing them into the partial blob,
and verifying the assembled file against the manifest digest
**sha256:60e05f2100071479f596b964f89f510f057ce397ea22f2833a0cfe029bfc2463 — matched exactly**.
The small layers (config/system/template/license) were fetched from
the same registry and the manifest written to
`ollama-models/manifests/registry.ollama.ai/library/qwen2.5-coder/7b`.
A landing/service-refresh on a healthy session should try the normal
pull first; the manual route is the fallback and is digest-verified
either way.

## Start the server (proof instance)

```bash
cd $RUNTIME
OLLAMA_HOST=127.0.0.1:11434 \
OLLAMA_MODELS=$RUNTIME/ollama-models \
OLLAMA_NUM_PARALLEL=1 \
OLLAMA_MAX_LOADED_MODELS=1 \
nohup $RUNTIME/ollama/bin/ollama serve > $RUNTIME/logs/ollama-serve.log 2>&1 &
curl -s http://127.0.0.1:11434/api/tags   # lists qwen2.5-coder:7b
```

Environment notes:

- `OLLAMA_MAX_LOADED_MODELS=1` + `OLLAMA_NUM_PARALLEL=1` keep the 7B
  **sole-resident** — required on this 8 GB VM (measured resident size
  5,470,494,392 bytes at `num_ctx` 8192; the box had ~630 MB free at
  proof time with the model loaded — it fits, with no headroom for a
  second model).
- The model unloads after ~5 min idle (Ollama default keep-alive);
  a cold call then pays ~95 s of model load.

## Wielder-side wiring (staging tree `wielder/brain.py`)

- Default model is now `qwen2.5-coder:7b` (`OLLAMA_DEFAULT_MODEL`);
  override per-run with env **`WIELDER_OLLAMA_MODEL`** (fallback size
  if RAM pressure bites: `qwen2.5-coder:1.5b`, also Apache-2.0).
- The Ollama request carries `"options": {"num_ctx": 8192}`
  (`WIELDER_OLLAMA_NUM_CTX` overrides) — the cap that keeps the KV
  cache inside the RAM budget.
- The local seat has a **300 s timeout floor** (`OLLAMA_MIN_TIMEOUT`)
  in `advise()` — measured inference for one advisory answer on this
  VM was ~115 s, so the stock 30 s default made the seat unusable via
  the CLI. Hosted seats keep the caller's timeout.
- `seat_status()` finds the binary via `shutil.which("ollama")`, so
  Wielder must run with the runtime bin dir on PATH:

```bash
export PATH=$RUNTIME/ollama/bin:$PATH
export PYTHONPATH=~/workspace/wielder-parity2/tree
python -m wielder.cli seats     # ollama-local: installed true, serving true, blocker null
python -m wielder.cli advise "your question" --seat ollama-local
```

For the landed service refresh: same env (PATH + the OLLAMA_* vars
above) belongs on the Ollama proof-instance process only — Wielder's
own service needs only PATH (for `seat_status`) and, optionally,
`WIELDER_OLLAMA_MODEL` / `WIELDER_OLLAMA_NUM_CTX` / `WIELDER_ADVISORY=1`.

## Measured performance on this VM (2026-10-28, 2 vCPU / 7.7 GB)

- Cold `/api/chat` round trip via `brain.advise()`: **214 s** total
  (model load ~95 s; prompt eval 150 tokens at 6.18 tok/s; generation
  per server timing 0.58 tok/s under heavy multi-lane load — treat
  speed as "minutes per answer", this seat is for occasional advisory
  calls, not interactive chat).
- Verdicts/routing never consume this output (advisory only).

## Provenance rows (draft, for the landing manifest)

| Component | Bucket | Licence | Verified from |
|---|---|---|---|
| Ollama runner 0.40.12 | open source | **MIT** (Copyright (c) Ollama) | `raw.githubusercontent.com/ollama/ollama/main/LICENSE`, read 2026-10-28; tarball sha256 `f8adcb7e…85ba` matches the release's official `sha256sum.txt` |
| qwen2.5-coder:7b weights (Q4_K_M GGUF) | open source / open weights | **Apache License 2.0** | The licence blob **inside the exact staged model** (manifest layer digest `sha256:832dd9e0…e92e`, 11,343 bytes) was fetched and read: it is the Apache License 2.0 text; the staged server's `/api/show` returns the same licence. Also matches Qwen's official series table (7B = Apache 2.0). |
| qwen2.5-coder:3b weights | free-but-restricted — **NOT USED** | Qwen Research License (non-commercial research/evaluation only; commercial use needs a separate licence from Alibaba Cloud) | Qwen's official Qwen2.5-Coder series table (3B = "Qwen Research", the family's lone carve-out) + the licence blob text for the 3B tag on the Ollama registry. Removed from candidacy by the licence sweep; never pulled in this build. |
| zstandard (extraction helper, tools-venv only) | open source | BSD-3-Clause (python-zstandard) | Used only to unpack the tarball; not part of the seat runtime. |

Licence honesty note: Ollama's MIT covers the runner code only —
never the models. Each model carries its own licence, which is why
the 7B's licence was read from its own staged blob, not inherited.

## Addendum (2026-10-28, after the proof run)

- **Both models are staged** in the proof runtime: `qwen2.5-coder:7b`
  (default) and `qwen2.5-coder:1.5b` (fallback, blob 986,048,576 B,
  sha256 `29d8c98fa6b098e200069bfb88b9508dc3e85586d20cba59f8dda9a808165104`,
  digest-verified the same way; its system/template/license layers are
  the identical digests as the 7B's). Select with
  `WIELDER_OLLAMA_MODEL=qwen2.5-coder:1.5b`.
- **CLI reality check:** `wielder advise` at the 7B succeeded via the
  Python path but was defeated three times via the CLI by the
  llama-server runner being SIGKILLed at RAM peaks while other lanes
  held the box (server-log evidence in the proof file §5). At the
  1.5B the same CLI call completed in 24.9 s end-to-end. Landing
  guidance: on a contended box, run the seat as 1.5B; on the service
  box (Wielder services + this seat), 7B is the default — and give
  the box swap or keep other heavy stacks off it, because the 7B
  load peak (weights mmap + 8192-ctx KV ≈ 0.94 GB + buffers) is what
  the kills tracked.
- The proof server instance was **left running** (localhost only) —
  see proof file §7 for how to stop it.
