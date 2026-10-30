# TEARDOWN — Speculative decoding (fuel-stack item 4)

*What it is, in plain language: a big model writing text is like a
professor writing one word, pausing, writing the next. Speculative
decoding hires a fast intern to sketch the next few words; the
professor then checks the whole sketch in the time one word used to
take, keeps the words that are right, and corrects the first wrong
one. Because the check is mathematically exact (rejection sampling),
the final text is the same text the professor would have written
alone — just produced in fewer passes. Speed without a smaller
brain: the purest multiplicative fuel trick there is.*

## The variants (all verified at source, 2026-10-28)

**vLLM (Apache-2.0)** — configured via `--speculative-config` JSON.
Methods in current docs: `draft_model`, `ngram`, `suffix` (needs the
Arctic Inference plugin), `medusa`, `eagle`, `eagle3`, `mtp`,
`dflash`. Common keys: `method`, `model`, `num_speculative_tokens`,
`draft_tensor_parallel_size`, `max_model_len`. vLLM documents the
standard sampler as lossless (the lossy FLy verifier is opt-in and
unused here). Known limit: pipeline parallelism doesn't compose
with speculation (vllm ≤0.15.0 note).

**llama.cpp (MIT)** — in `llama-server`, spec types from source
(`common/speculative.cpp`): `draft-simple`, `draft-eagle3`,
`draft-mtp`, `draft-dflash`, `draft-dspark`, `ngram-simple`,
`ngram-map-k`, `ngram-map-k4v`, `ngram-mod`, `ngram-cache`. Draft
via `-md/--spec-draft-model`, depth via `--spec-draft-n-max`. An
implementation with a draft model can be mixed with one without
(e.g. draft + n-gram together).

## Which draft for which seat (our stack)

| Seat / target | Config | Draft | Extra cost |
|---|---|---|---|
| Any seat, day one | `vllm-ngram.json` / `--spec-type ngram-simple` | none — prompt n-grams | 0 bytes |
| Free T4 seat, Qwen3-14B target | `vllm-draft-model.json` | Qwen3-1.7B (Apache-2.0, same tokenizer) | ~1–3.5 GB |
| 24 GB primary, Qwen3-30B-A3B | `vllm-eagle3.json` | EAGLE-3 head (see licence caveat) | ~1 GB |
| llama.cpp owned seats, Qwen3-30B-A3B | script `eagle3` mode | Tengyunw/qwen3_30b_moe_eagle3 (**MIT**), converted with `--target-model-dir` | ~1 GB |
| Distilled students (item 3) | draft = the student itself | A distilled 1.7B/4B student is a near-perfect draft for its teacher — the two items compound | already owned |

That last row is the strategic one: **distillation manufactures
draft models.** A student distilled from the primary teacher
accepts at unusually high rates as its draft, so items 3 and 4
multiply each other.

## Honest trade-offs

- Helps **latency at low QPS** (our seats' regime); can be neutral
  or negative under heavy batching.
- Speedup depends on acceptance rate, which depends on how
  predictable the text is: structured/tool-call output (Wielder's
  bread and butter) accepts well; open creative prose less so.
- Draft memory is real memory: on a full 16 GB T4, a 3.5 GB draft
  can cost more (in KV-cache room) than it earns. Start with n-gram
  (free), measure, then add a draft.
- All speedup figures in the README are literature numbers. Ours is
  a first-run measurement, recorded in the smoke log.

## Status

**KIT-READY — configs verified against both engines' source/docs;
speed proof is a first-run item** (seat smoke test ± config, both
tok/s numbers recorded). Files: `speculative/`.
