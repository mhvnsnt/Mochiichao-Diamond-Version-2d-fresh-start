# speculative/ — speculative decoding options for our seats

*Plain version: while the big model writes one word at a time, a
cheap guesser proposes the next several words and the big model
checks them all in one pass — accepting the right ones for free.
Same output (the math guarantees it), fewer big-model passes.*

These are documented, ready-to-pass options for the two serving
engines this programme runs. They cross-reference the grok-local
serving kit (`show/production/wielder/grok-local/serving/`) — add
the flag/config to that seat's launch, don't fork the server.

## vLLM seats (grok-local primary / free-seat)

Pass any of these files' contents as `--speculative-config '<json>'`
to `vllm serve` (schema copied from vLLM's speculative-decoding
docs, verified 2026-10-28):

| File | Method | Extra weights | Best for |
|---|---|---|---|
| `vllm-ngram.json` | n-gram prompt lookup | **none** | Zero-cost first step; repetitive/template output |
| `vllm-draft-model.json` | draft model Qwen3-1.7B (Apache-2.0) | ~1–3.5 GB | Free-seat 14B target; same Qwen3 tokenizer family |
| `vllm-eagle3.json` | EAGLE-3 head for Qwen3-30B-A3B | ~1 GB head | Primary seat; highest acceptance per size |

**Licence caveat, stated plainly:** the EAGLE-3 checkpoint in
`vllm-eagle3.json` (AngelSlim/Qwen3-a3B_eagle3, the vLLM-format one)
declares **no licence on its model card** (checked 2026-10-28).
Treat it as local-evaluation-only until that is clarified. The
llama.cpp route below uses `Tengyunw/qwen3_30b_moe_eagle3`, whose
card declares **MIT** — prefer it where the choice is free.

## llama.cpp seats (owned computers / CPU / cluster)

`llamacpp-speculative-serve.sh {ngram|draft|eagle3}` — flags
verified against llama.cpp source: `--spec-type` accepts
`draft-simple, draft-eagle3, draft-mtp, draft-dflash, draft-dspark,
ngram-simple, ngram-map-k, ngram-map-k4v, ngram-mod, ngram-cache`;
draft model via `-md/--spec-draft-model`; depth via
`--spec-draft-n-max`.

## Honest trade-offs

- Gains are **latency** gains at low request rates. Under heavy
  batch load the verifier is already efficient and speculation can
  add nothing or slightly hurt (vLLM's own method table says the
  same). Our seats are single-user/low-QPS — the good case.
- Typical reported speedups: n-gram ~1.2–1.5× on repetitive text,
  draft-model ~1.5–2.5×, EAGLE-3 ~2–3× on chat — **vendor/paper
  numbers, not ours.** Our number is a first-run measurement: run
  the seat's smoke test with and without the config and record both
  tok/s in `../smoke/SMOKE-RESULTS.md`.
- The draft must share the target's tokenizer (or use vLLM's
  cross-vocabulary TLI mode, greedy-only). All drafts named here are
  Qwen3-family for Qwen3 targets.
- Losslessness: with the standard rejection sampler, vLLM documents
  speculative decoding as distribution-preserving (up to float
  noise). The lossy FLy verifier exists upstream and is **not**
  configured anywhere in this kit.
