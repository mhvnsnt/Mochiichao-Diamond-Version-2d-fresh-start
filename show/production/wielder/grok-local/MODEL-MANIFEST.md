# MODEL-MANIFEST — every model in the kit, verified at source

All facts below were read from the models' own Hugging Face
records (API + licence files) on 2026-10-28. Licence buckets are
exact: everything here is **Apache-2.0 open weights** — no
community licence, no non-commercial restriction, outputs are
yours to ship. Per-file sizes and sha256 for the served variants
are pinned in `serving/model_hashes.json`; `pull_model.py`
enforces them on the seat before anything serves.

## Server seats (vLLM)

### PRIMARY — Qwen3-30B-A3B-Instruct-2507 (MoE, ~3B active)

- Base: `Qwen/Qwen3-30B-A3B-Instruct-2507` — Apache-2.0
  (cardData + LICENSE file). 30.53B params; bf16 61,079,824,827 B;
  rev `0d7cf23991f47feeb3a57ecb4c9cee8ea4a17bfe`. Non-thinking
  instruct; Hermes-format tool calls (vLLM
  `--tool-call-parser hermes`); 256K native context.
- Served quant: `cyankiwi/Qwen3-30B-A3B-Instruct-2507-AWQ-4bit` —
  Apache-2.0, compressed-tensors W4A16, 18,105,930,006 B total,
  rev `8d3f99eda08b18a8090de5289ff02e6dc51d47e2`, 4 shards
  sha256-pinned in the manifest. Why this one: a 30B-class MoE
  with only ~3B active params is the fastest strong tool-caller
  that fits a 24 GB card at a useful 32K served context
  (KV ≈ 0.094 MB/token).
- Abliterated option: `huihui-ai/Huihui-Qwen3-30B-A3B-Instruct-
  2507-abliterated` — Apache-2.0, ungated, bf16 61,078,000,382 B,
  13 shards, rev `e2f73ec7e99ee316beb8069ca90e4c3cbef8aa0f`.
  bf16 does not fit 24 GB, so the kit quantizes it ON THE SERVER
  (`serving/quantize_awq.py`, llm-compressor) from the verified
  pull. Abliteration = fewer refusals, **including safety
  refusals** — the owner's call, the owner's responsibility;
  huihui's card carries the same warning, summarised in the
  runbook's limits section.
- Dead end, recorded: Qwen's official FP8 build of this model is
  ≈30.5 GB — it does **not** fit a 24 GB card. AWQ-4bit is the
  serving format, not a preference.

### FALLBACK — Qwen3-32B (dense)

- Base: `Qwen/Qwen3-32B` — Apache-2.0.
- Served quant: `Qwen/Qwen3-32B-AWQ` (Qwen official) —
  Apache-2.0, 19,336,904,398 B, rev
  `0499c3ac83fdef8810b907a23894ba91e95eddd8`, 4 shards
  sha256-pinned. Dense KV is heavy (≈0.5 MB/token), so the
  honest served context on 24 GB is 8K — that's why it's the
  fallback, not the primary.
- Abliterated option: `huihui-ai/Qwen3-32B-abliterated` —
  Apache-2.0, bf16 65,535,751,214 B, 14 shards, rev
  `7a754614e9172cd416b4652342084bea8b5c98b0`. **Gated "auto"**:
  a one-time usage-warning acceptance on the HF site plus an
  `HF_TOKEN` at pull time. Same on-server AWQ route.

### FREE-SEAT — Qwen3-14B-AWQ (one T4 16 GB)

- `Qwen/Qwen3-14B-AWQ` (Qwen official) — Apache-2.0. Two weight
  shards: 4,988,339,832 B (sha256 `668eb0f1…`) and
  4,988,350,408 B (sha256 `c3c1625d…`); all files
  9,992,683,140 B. Served at 16K context, fp16 + enforce-eager
  (T4 rules). The manifest does not pin an upstream revision
  for this one — integrity rests on the shard hashes, which
  the puller and the free-test notebook both verify.
- No abliterated 14B fits one T4 (the huihui 14B is bf16
  ≈28 GB) — stated gap, not a silent one. On the free seat the
  abliterated option would need the on-server quantize route
  run once on a bigger card and the resulting AWQ (~8 GB class)
  pulled down — possible, not packaged; ask and it gets built.

## Phone seat (WebLLM/MLC builds, in the app)

Chosen for the owner's actual phones — Motorola moto g stylus
5G - 2023 and Motorola edge 2024 (mid-range Snapdragon,
Adreno 710-class GPUs, 6–8 GB RAM). Sizes below are the HF
repos' measured stored totals (`usedStorage`), read 2026-10-28.

| Build | Base (licence) | Measured size | Repo sha | Role |
|---|---|---|---|---|
| `mlc-ai/Qwen3-1.7B-q4f16_1-MLC` | `Qwen/Qwen3-1.7B` (Apache-2.0, verified: licence tag + LICENSE file) | 979,424,190 B (~0.98 GB) | `80b3abcec6c3b3f5355dc0cc99cc4fb578f192bc` | **Default phone seat — both phones** |
| `mlc-ai/Qwen3-4B-q4f16_1-MLC` | `Qwen/Qwen3-4B` (Apache-2.0, verified the same way) | 2,274,342,846 B (~2.27 GB) | `a5c9fab855e3ccbdfed2e7e69683d75f30332161` | Bigger brain — 8 GB phone (edge 2024) only |

Both ungated. The MLC builds are the Qwen weights requantized
to q4f16 by the MLC project; WebLLM itself is Apache-2.0.

**Speed honesty:** expect roughly **8–20 tok/s** from the 1.7B
on that GPU class — an **estimate**, not a measurement. The
app displays the engine's own runtime stats after every reply;
the owner's first run on his phone is the measurement
(runbook, Phone Seat, first-run proof). The 4B will be slower
and can pressure a 6 GB phone's browser memory — that's why
it's the opt-in, not the default.

## Fit matrix

| Variant | 24 GB card | One T4 16 GB | Phone |
|---|---|---|---|
| primary AWQ (18.1 GB) | ✅ 32K ctx | ❌ | ❌ |
| fallback AWQ (19.3 GB) | ✅ 8K ctx (tight) | ❌ | ❌ |
| free-seat AWQ (10.0 GB) | ✅ | ✅ 16K ctx | ❌ |
| abliterated (after on-server AWQ) | ✅ 16K ctx | ❌ (14B route unpackaged) | ❌ |
| phone 1.7B MLC (0.98 GB) | — | — | ✅ both phones |
| phone 4B MLC (2.27 GB) | — | — | ⚠️ 8 GB phone only |
