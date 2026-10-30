# TRAINING — "train them well", on openly licensed data only

The tune teaches the chosen bases the Grok-pattern profile from
`../grok/PROFILE.md`: answer directly, call tools when a tool
answers better, never fake live access, correct a false premise
plainly. **No xAI/Grok output is trained on, scraped, or
distilled — ever.** Every source below is an independent,
openly licensed dataset, verified at source on 2026-10-28.

## Data (licences exact)

| Dataset | Licence | Size | Teaches |
|---|---|---|---|
| `glaiveai/glaive-function-calling-v2` | Apache-2.0, ungated | ~112,960 rows | Full tool rounds: call → observation → final answer |
| `Salesforce/xlam-function-calling-60k` | CC BY 4.0, gated "auto" (one acceptance click) | 60,000 rows | Precise single/multi tool calls from a query |
| `HuggingFaceTB/smoltalk` — **only** `smol-magpie-ultra` + `smol-constraints` | Apache-2.0 (the card's licence section: the new subsets are Apache-2.0; other bundled subsets keep their own licences, so the kit uses only these two) | subsampled | Direct, well-formed chat; instruction constraints |
| `grok_pattern_seeds.jsonl` (in this folder) | The owner's own text, written for this kit | 24 examples | The exact profile: direct style, honest no-live-access, premise pushback, legitimate dual-use answered helpfully |

`training/prepare_data.py` downloads and converts on the seat
(caps: glaive 25k, xlam 20k, smoltalk 15k, plus all seeds),
writes LLaMA-Factory ShareGPT JSONLs + `dataset_info.json`.
Its converters are unit-tested locally against fabricated rows
in each source's documented format
(`training/test_prepare_data.py`, 8 tests, all passing —
`validation/training-converters-test.txt`). The full
download+convert is **PROVEN-ON-FIRST-RUN**: success = the
three JSONLs exist with the counts the script prints and
LLaMA-Factory accepts the registration.

## Stack (licences exact)

- **LLaMA-Factory** (`hiyouga/LlamaFactory`) — Apache-2.0.
  Training framework; the configs below are its documented
  YAML schema.
- **bitsandbytes** 4-bit QLoRA quantization, as configured.
- **llm-compressor** (vllm-project) — Apache-2.0; the
  abliterated AWQ route (`serving/quantize_awq.py`), and the
  optional final quant for a merged tune.
- **vLLM** — Apache-2.0; serves the result (see `serving/`).

## Configs

- `training/train_primary_qlora.yaml` — QLoRA on
  `Qwen/Qwen3-30B-A3B-Instruct-2507`, one 24 GB card:
  4-bit base (~17 GB frozen), LoRA r16 on all linear layers,
  cutoff 2048, micro-batch 1 × grad-accum 16, gradient
  checkpointing, bf16, 2 epochs, lr 1e-4 cosine.
- `training/train_freeseat_14b.yaml` — QLoRA on
  `Qwen/Qwen3-14B` for one Kaggle T4 16 GB: same recipe,
  **fp16** (T4 has no bf16 datapath), cutoff 1024.

**OOM fallback ladder (in order, don't improvise):**
1. cutoff_len 2048 → 1024 (primary) — context is the biggest
   activation cost.
2. lora_rank 16 → 8.
3. gradient_accumulation_steps 16 → 32 (same effective batch,
   less parallel work).
4. Only then consider a smaller base.

Both configs are **PROVEN-ON-FIRST-RUN**: success = training
starts, loss decreases across the first logging steps, and a
checkpoint lands in `output_dir`. VRAM sizing above is
arithmetic from the model sizes, stated as such.

## After training: merge → (quantize) → serve

1. Merge the adapter into the base (LLaMA-Factory export, or
   `peft` merge) on the seat — the adapter alone is not a
   servable model for vLLM without the base beside it.
2. For the 24 GB / T4 seats, AWQ-quantize the merged model
   with the same recipe as `serving/quantize_awq.py`
   (W4A16, ignore `lm_head` + MoE router).
3. Serve it as `MODEL_VARIANT=custom` with `MODEL_DIR`
   pointing at the quant, and run `serving/smoke_test.py`
   before calling it done.
4. **Save the adapter + eval notes out of the session**
   (runbook, Operating model): adapters are small — they are
   the durable product of a training session, and they go to
   the warehouse (versioned Kaggle dataset and/or TeraBox
   with a hashed manifest), never just a dying session disk.

## What the tune cannot do

A LoRA tune teaches style and tool habits; it does not add
knowledge or frontier reasoning. The honest ceiling is in
the runbook's limits section.
