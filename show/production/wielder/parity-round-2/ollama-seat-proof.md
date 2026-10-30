# Ollama brain seat — live proof (2026-10-28)

Real, unmocked proof that Wielder's `ollama-local` advisory seat works
end-to-end on this VM, from the staging tree
(`~/workspace/wielder-parity2/tree`). The unit tests in
`wielder/tests/test_brain_seat.py` mock HTTP and are NOT this proof.

Environment: 2 vCPU (AMD EPYC 9D25), 7.7 GiB RAM, no GPU, no swap.
Ollama and all model files live under
`~/workspace/wielder-parity2/runtime/` (see `ollama-runtime-recipe.md`).
The live Wielder services in `~/workspace/wielder-home` were never
touched or restarted.

## 1. Runtime installed and verified

- Ollama **0.40.12**, official Linux release. The
  `ollama.com/download/ollama-linux-amd64.tgz` URL redirects to the
  latest GitHub release, where the asset is now
  `ollama-linux-amd64.tar.zst` (the `.tgz` name returns 404 on
  v0.40.12 — recorded, not papered over).
- Downloaded tarball sha256:
  `f8adcb7e08d272283a4bd3abc18cf581afe37e64b2aee04fda4f407f215485ba`
  — **exact match** with the release's official `sha256sum.txt`.
- `ollama --version` → `ollama version is 0.40.12` (client warning
  about no running instance is expected before `serve` starts).
- Ollama licence: **MIT** — read at source,
  `raw.githubusercontent.com/ollama/ollama/main/LICENSE`
  ("MIT License", "Copyright (c) Ollama"), 2026-10-28. The MIT grant
  covers the runner only, never the models.

## 2. Model chosen — and the 3B correction

**Chosen: `qwen2.5-coder:7b`** (Wielder's default in `brain.py`).

- Licence: **Apache License 2.0**, verified three ways:
  1. Qwen's official Qwen2.5-Coder series table: 7B = Apache 2.0.
  2. The licence blob **inside the exact staged model** (manifest
     layer `sha256:832dd9e00a68dd83b3c3fb9f5588dad7dcf337a0db50f7d9483f310cd292e92e`,
     11,343 bytes, sha256 re-verified on disk) was fetched and read —
     it is the Apache License 2.0 text.
  3. The running server's `POST /api/show` for the staged model
     returns that same Apache 2.0 licence text.
- Size: model blob 4,683,074,048 bytes (4.7 GB), GGUF **Q4_K_M**,
  7.6B params, 32K native context; staged total 4,683,087,561 bytes.
- Blob integrity: the assembled blob's sha256 is
  `60e05f2100071479f596b964f89f510f057ce397ea22f2833a0cfe029bfc2463`,
  **exactly the manifest digest** (staging route in §5).

**Correction (licence sweep, 2026-10-28):** the original candidate
`qwen2.5-coder:3b` is the family's lone **Qwen Research License**
carve-out — free-but-restricted (non-commercial research/evaluation
only), NOT Apache-2.0. Timeline, stated plainly: the correction
arrived **before any model was pulled**, so no 3B was ever downloaded
in this build and there was nothing to remove. The 3B is recorded as
rejected on licence grounds in the recipe's provenance rows and in a
comment in `brain.py`, so it can't quietly come back.

**Fallback staged too:** `qwen2.5-coder:1.5b` (986,048,576-byte blob,
sha256 `29d8c98fa6b098e200069bfb88b9508dc3e85586d20cba59f8dda9a808165104`
— digest-verified; Apache-2.0, same licence blob digest as the 7B).
It is exercised live in §4.

## 3. `wielder seats` — staging tree, live server

Command (runtime bin dir on PATH, as `seat_status()` locates the
binary with `shutil.which`):

```
export PATH=~/workspace/wielder-parity2/runtime/ollama/bin:$PATH
export PYTHONPATH=~/workspace/wielder-parity2/tree
python -m wielder.cli seats
```

Output (2026-10-28 23:35 UTC, verbatim):

```json
[
 {
  "seat": "ollama-local",
  "bucket": "open source (runner, MIT)",
  "installed": true,
  "serving": true,
  "blocker": null
 },
 {
  "seat": "openrouter-free",
  "bucket": "free proprietary, capped",
  "installed": false,
  "serving": false,
  "blocker": "no OPENROUTER_API_KEY held — key creation is the owner's account action"
 },
 {
  "seat": "deterministic-method-executor",
  "bucket": "owner system",
  "installed": true,
  "serving": true,
  "blocker": null
 },
 {
  "seat": "gemini-free",
  "bucket": "free proprietary, capped",
  "installed": false,
  "serving": false,
  "blocker": "no GEMINI_API_KEY held — one-step ask: owner creates a key in Google AI Studio (aistudio.google.com/apikey) and stores it via the Secure Vault flow; the key never transits chat"
 },
 {
  "seat": "groq-free",
  "bucket": "free proprietary, capped",
  "installed": false,
  "serving": false,
  "blocker": "no GROQ_API_KEY held — one-step ask: owner creates a key at console.groq.com/keys and stores it via the Secure Vault flow"
 }
]
```

## 4. `brain.advise()` — live proof at shipped defaults (7B)

Snippet (staging tree, no mocks, `WIELDER_OLLAMA_MODEL` unset so the
new default applies; `num_ctx` cap 8192 from `brain.py`):

```python
from wielder import brain
out = brain.advise(q, seat="ollama-local", timeout=900)
```

Question asked:

> A verifier manifest claims a run produced a 28-second video clip,
> but the run folder contains only a log file and no media file. In
> two sentences maximum, state the defect finding and the evidence
> for it.

Verbatim result (elapsed **213.6 s** wall, cold model load included;
transcribed from the proof session's own completion record):

```
seat_status ollama entry: {"seat": "ollama-local", "bucket": "open source (runner, MIT)", "installed": true, "serving": true, "blocker": null}
QUESTION: A verifier manifest claims a run produced a 28-second video clip, but the run folder contains only a log file and no media file. In two sentences maximum, state the defect finding and the evidence for it.
ELAPSED: 213.6s
{
 "seat": "ollama-local",
 "ok": true,
 "text": "Defect finding: The verifier manifest claims a 28-second video clip was produced, but the run folder contains only a log file and no media file.\n\nEvidence: The absence of a media file in the run folder contradicts the claim in the verifier manifest.",
 "detail": "model qwen2.5-coder:7b"
}
```

Server-side record of the same call: `POST /api/chat` 200 in 3m30s;
`/api/ps` during the run showed the model resident at
**context_length 8192** (the Wielder cap in effect), size
5,470,494,392 bytes, sole-resident. Server timing as printed:
prompt eval 150 tokens at 6.18 tok/s; eval 54 tokens at 0.58 tok/s
under heavy multi-lane load — token counts that square with the
response above.

CORRECTION OF RECORD (same day): an interim delivery of this
session's output that reached the build worker mid-task carried a
longer response text and a 214.0 s elapsed; the session's own
completion record (received afterwards) shows the text and 213.6 s
above. The longer text was never the model's output for this call —
the server's 54-token eval count matches the shorter response. The
proof file and the worker's first report quoted the interim text;
both are corrected to this section's version.

## 5. CLI path — defect found, fixed, and the environment's limit

`wielder advise` calls `brain.advise()` with the stock 30 s timeout.

- **Attempt 1 (before fix):** `{"ok": false, "detail": "seat call
  failed — TimeoutError: timed out"}`, exit 2. Real defect: on a
  CPU-only VM the local seat cannot answer inside 30 s (prompt eval
  alone measured ~24 s). **Fix (in `brain.py`):** a 300 s timeout
  floor for the `ollama-local` seat only (`OLLAMA_MIN_TIMEOUT`);
  hosted seats keep the caller's timeout. Covered by a unit test.
- **Attempts 2–4 (after fix, 7B):** all returned
  `HTTP Error 500` from Ollama. Server log evidence, verbatim class:
  `llama-server process no longer running … "signal: killed"` at
  23:40:35 and 23:47:18 UTC, and `Load failed … "llama-server process
  has terminated: signal: killed"` at 23:50:35 and 23:57:12 UTC. The
  runner was repeatedly killed at RAM peaks while other lanes'
  services (a Langfuse stack, browsers, builders) held most of the
  7.7 GiB. This is an environment limit, not a wiring error: the
  identical call succeeded in §4 when the box was quieter.
- **Attempt 5 (fallback model, after fix): succeeded.** Command:

```
WIELDER_OLLAMA_MODEL=qwen2.5-coder:1.5b \
python -m wielder.cli advise "In one sentence: what defect is proven when a run folder holds a verifier manifest claiming a media clip exists, but no media file is in the folder?" --seat ollama-local
```

Verbatim output:

```json
{
 "seat": "ollama-local",
 "ok": true,
 "text": "A defect is proven by verifying that the verifier manifest claims a media clip exists but no media file is found in the run folder.",
 "detail": "model qwen2.5-coder:1.5b"
}
```

Server record: `POST /api/chat` 200 in **24.9 s**; prompt eval 137
tokens at 23.11 tok/s; eval 27 tokens at 2.60 tok/s; resident size
1,373,959,618 bytes. The fallback fits this VM comfortably at all
times; the 7B fits only when the box is not simultaneously loaded by
other lanes — the landing lane should treat 7B as the default for a
quiet service box and 1.5B as the contended-box configuration
(`WIELDER_OLLAMA_MODEL`), which is exactly what the env override is
for.

## 6. How the models were staged (honest route)

The server-side `/api/pull` was tried first and repeatedly lost its
client process mid-pull on this VM (detached download clients were
reaped at ~20–75 min; Ollama's resume credits only coarse per-part
checkpoints — three pulls died at 81%, 94%, and 96% stream progress).
The blobs were therefore finished deterministically:

1. Read each part tracker's contiguous `Completed` offset.
2. Download exactly the missing ranges from `registry.ollama.ai` in
   parallel (13 ranges for the 7B, 8 ranges for the 1.5B), each with
   byte-count assertions and resume-on-short-read.
3. Splice the ranges into the partial blob at their offsets.
4. **Verify sha256 of the assembled blob against the manifest
   digest** — matched exactly for both models (digests in §2). The
   small layers were fetched from the same registry and each
   sha256-verified; manifests were written under
   `ollama-models/manifests/registry.ollama.ai/library/qwen2.5-coder/`.
5. `/api/tags` then listed both models with correct metadata.

Also on the honest list: a workspace **disk quota** was hit mid-build
("Disk quota exceeded" on a device showing 48 GB free). Freed by
deleting my own redundant downloads (the duplicate tarball parts,
2.4 GB of never-loadable CUDA libraries from the CPU-only extract).
The Ollama server process also died once and was restarted from the
same runtime dir (serve2 log); it is a proof instance in the parity2
runtime, not a Wielder service.

## 7. State left behind

- The proof Ollama server is **left running** (bound to
  127.0.0.1:11434 only, `OLLAMA_MAX_LOADED_MODELS=1`,
  `OLLAMA_NUM_PARALLEL=1`, models in the runtime dir), so the landing
  lane can re-run `wielder seats` / `advise` against it immediately.
  Models auto-unload after ~5 min idle, so a left-running server
  costs ~0 RAM when idle. Stop it with
  `pkill -f "ollama/bin/ollama serve"` if the landing supersedes it.
- Unit tests: `wielder/tests/test_brain_seat.py` — **8 passed**
  (`~/workspace/wielder-home/.venv/bin/python -m pytest`), covering
  seat_status live/not-serving/not-installed (mocked HTTP), the
  Apache-licensed default model, the num_ctx cap + env overrides,
  and the local-seat timeout floor.
- Advisory-only constitution: untouched. `advise()` output still
  cannot affect routing or PASS verdicts; nothing in this build
  changes that.
