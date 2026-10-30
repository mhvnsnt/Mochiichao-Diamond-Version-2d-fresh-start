# SMOKE-RESULTS — what actually ran, verbatim

Build VM facts (measured 2026-10-28): 2 cores, ~7 GB RAM, gcc +
cmake present, **clang absent** (checked: `which clang clang++`
empty), Python 3.12.3, numpy 1.26.4, PyYAML present,
sentence-transformers NOT installed. Scratch lives under
`~/workspace/fuel-stack-build/` (never /tmp — the pinch rule).

Rule for this file: nothing is written here that a run did not
produce. Vendor numbers are labelled vendor numbers in the
teardowns and never appear here as results.

---

## 1. RAG end-to-end test (item 8) — PASS 12/12

`rag/test_fuel_rag.py`, real pipeline (chunk → TF-IDF embed →
SQLite → retrieve → context block → reload → guard), no mocks in
the retrieval path. Verbatim outcome lines:

```
PASS  ingest: all sample docs present — {dorowani: 1, kaggle-budget: 1,
      phone-seat: 1, staging: 1, terabox-music: 1, wielder-rules: 1}
PASS  ingest: chunks >= documents — chunks=6
PASS  retrieve top-1: dorowani.md      — scores=[0.3148, 0.0515, 0.041]
PASS  retrieve top-1: kaggle-budget.md — scores=[0.3709, 0.0962, 0.0599]
PASS  retrieve top-1: staging.md       — scores=[0.3517, 0.1158, 0.1091]
PASS  retrieve top-1: wielder-rules.md — scores=[0.3703, 0.1641, 0.0847]
PASS  retrieve top-1: phone-seat.md    — scores=[0.4136, 0.1933, 0.1719]
PASS  retrieve top-1: terabox-music.md — scores=[0.3336, 0.153, 0.0978]
PASS  context block carries source tags
PASS  no-evidence query returns empty block, not a fabrication
PASS  persistence: store reopens and retrieves
PASS  embedder guard refuses mixed store
PASS  neural embedder fails honest when library absent (NOT CONFIGURED)

12/12 checks passed, exit 0
```

The neural embedder's LIVE proof remains a first-run item on any
seat with sentence-transformers installed — recorded here as not
run, not smoothed over.

## 2. Distillation kit validation (item 3) — PASS (local scope)

- `py_compile` OK: teacher_generate.py, prepare_distill_data.py,
  gkd_train.py, eval_scorecard.py, kaggle/distill_kernel.py.
- **Firewall fixture test:** a fixture whose bundled assistant
  response was planted as `BUNDLED RESPONSE MUST BE DISCARDED`
  produced a prompt pool with the string ABSENT and duplicates
  removed (3 rows in → 2 unique prompts out). The discard is code,
  not convention.
- `gkd_train.py --check` on distill_config.yaml + a provenance-
  stamped fixture: **CHECK PASSED** (teacher/student licences
  Apache-2.0 verified by the checker; GKD knobs in range; dataset
  provenance complete).
- `teacher_generate.py --dry-run`: plan printed, no seat called.
- `eval_scorecard.py --self-test` (two stub OpenAI-compatible
  servers on localhost, real HTTP path): **SELF-TEST PASSED** —
  teacher stub 3/3, deliberately-imperfect student stub 2/3 (fails
  the JSON case, as designed), exact-answer agreement 1/3. This
  proves the harness; it says nothing about any real model.
- `kaggle/kernel-metadata.json` parses; id
  `marsfmmg/fuel-stack-distill`, GPU on, private.
- NOT RUN (first-run items, stated in the kit): teacher generation
  against a live seat; any GKD training; a live scorecard.

## 3. Speculative config validation (item 4) — PASS (parse scope)

- All three vLLM JSONs parse as valid `speculative_config` objects
  with the exact key names from vLLM's current docs (method /
  model / num_speculative_tokens / prompt_lookup_min /
  prompt_lookup_max — copied from the docs' own examples,
  2026-10-28).
- `llamacpp-speculative-serve.sh`: `bash -n` clean; every flag it
  uses was grep-verified in llama.cpp source (`--spec-type` value
  list from `common/speculative.cpp`; `-md/--spec-draft-model` and
  `--spec-draft-n-max` from `common/arg.cpp`).
- NOT RUN: any speed measurement. First-run item: seat smoke test
  with/without each config, both tok/s recorded here when it happens.

## 4. Licence verification log (all items)

Verified at source 2026-10-28 (project licence page / repo licence
file / model card, as noted in the teardowns): TRL Apache-2.0 ·
LLaMA-Factory Apache-2.0 · axolotl Apache-2.0 · torchtune
BSD-3-Clause · OpenVINO Apache-2.0 · vLLM speculative methods per
docs · flash-attention BSD-3-Clause · all-MiniLM-L6-v2 Apache-2.0 ·
bge-small-en-v1.5 MIT · nomic-embed-text-v1.5 Apache-2.0 ·
sqlite-vec dual MIT/Apache-2.0 · Mixtral 8x7B Apache-2.0 ·
OLMoE-1B-7B Apache-2.0 · DeepSeek-V3 custom licence
(free-but-restricted bucket) · Grok-1 Apache-2.0 · UltraChat 200k
MIT · microsoft/BitNet MIT · bitnet-b1.58-2B-4T MIT (card) ·
Tengyunw/qwen3_30b_moe_eagle3 MIT (card) ·
AngelSlim/Qwen3-a3B_eagle3 **NO LICENCE DECLARED** (card checked;
kit treats it as evaluation-only).

## 5. RPC server run (item 5) — PASS

This package's llama.cpp build (programme source @ c3df4b7,
CPU-only, GGML_RPC=ON; the RPC server target in this version is
`ggml-rpc-server`) was started on this VM. Verbatim:

```
Starting RPC server v8.0.1
  endpoint       : 127.0.0.1:50052
  local cache    : n/a
Devices:
  CPU: AMD EPYC 9D25 126-Core Processor (7935 MiB, 7935 MiB free)
  transport      : TCP
```

It binds, enumerates its device for remote layer placement, and
stops cleanly. Item 5's mechanism is proven in running form.
`llama-cli --version` from the same build: `version: 0.8.0-dev`,
GNU 13.3.0, x86_64 — and its `--help` prints the speculative type
list quoted in item 4's kit, from the binary itself.

## 6. BitNet CPU smoke (item 11) — ENGINE PROVEN; GENERATION RUN
##    BLOCKED ON MODEL TRANSFER (recorded in full, nothing smoothed)

**What ran:** the engine side is fully proven — llama.cpp built
from source on this VM (above), native BitNet architecture present
in that source (`src/models/bitnet.cpp`), llama-cli executes.

**What did not run:** generation against the official model. The
model transfer defeated three methods on this VM, and the record
keeps all of it:

1. **Attempt 1 (curl with resume):** reached exactly the expected
   size — **1,187,801,280 bytes** — and then FAILED verification:
   local sha256 `f6db75fa7d6b8ac3…` ≠ Microsoft's published
   `4221b252fdd5fd25e15847adfeb5ee88886506ba50b8a34548374492884c2162`
   (from Hugging Face's file metadata). A byte-perfect-size,
   hash-wrong file: the resume had stitched corrupt bytes. **The
   hash check catching this is the verification chain working —
   the file was deleted, never run.**
2. **Attempt 2 (single-shot curl):** connection dropped at
   1,131,668,398 bytes (95%) — short file, discarded.
3. **Attempt 3 (huggingface_hub):** its Xet transfer stalled at
   0 bytes on this network and was abandoned.
4. **Attempt 4 (resume loop + parallel range assembly):** starved,
   not broken. Measured context: this VM's total ingress was
   ~855 KB/s SHARED across ~6 concurrent lane downloads observed
   in the process list (a 4.7 GB Ollama model pull, a ~200 MB
   PyTorch CPU wheel, JDK 17, Android command-line tools, FFmpeg,
   an 8-way segmented download). Long-lived background transfers
   on this VM also die when agent sessions cycle (observed twice).
   At record time the sequential stream held ~465 MB of
   1,187,801,280 bytes and was still crawling; a ModelScope mirror
   stream was slower still (~34 KB/s) and was cut.

**First-run item, exactly:** on any seat with a quiet pipe —
```
curl -L -o ggml-model-i2_s.gguf \
  https://huggingface.co/microsoft/BitNet-b1.58-2B-4T-gguf/resolve/main/ggml-model-i2_s.gguf
sha256sum ggml-model-i2_s.gguf
# MUST equal 4221b252fdd5fd25e15847adfeb5ee88886506ba50b8a34548374492884c2162
# and size MUST equal 1187801280 — do not run an unverified copy.
llama-cli -m ggml-model-i2_s.gguf -p "The capital of France is" -n 32 -t 2
# record: load result, generated text, llama_perf tok/s, this section.
```
Partial state on this VM (FINAL — checked after all streams
ended; nothing is still downloading and nothing will complete
unattended): `~/workspace/fuel-stack-build/bitnet/` —
`ggml-model-i2_s.gguf` frozen at 465,584,064 bytes (sequential
stream died), `part0.bin` 387,901,866 bytes (the frozen prefix),
and range parts part1-4 frozen at 78,317,127 / 74,906,867 /
74,818,221 / 78,836,771 bytes of ~199,969,854 each (those
connections dropped too). The partials are kept only as resume
stock for the first-run command above — any assembly from them
must still pass the size + sha256 gate before use, and in their
current state cannot.
