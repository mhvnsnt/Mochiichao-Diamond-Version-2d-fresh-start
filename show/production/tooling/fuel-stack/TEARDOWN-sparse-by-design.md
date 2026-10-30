# TEARDOWN — Sparse by design: MoE + specialist routing (item 9)

*What it is, in plain language: a normal model uses its whole brain
for every word. A Mixture-of-Experts model is a library of
specialist sub-brains ("experts") with a receptionist (the router)
who, for each word, wakes only the two-to-eight experts that word
needs. You carry the whole library in memory, but you only PAY —
in compute, time and battery — for the experts that fire. It is how
the industry gets a 30-billion-parameter model's knowledge at a
3-billion-parameter model's running cost. Our primary seat model is
already one.*

## How MoE works (the mechanics)

- Each transformer layer swaps its single feed-forward block for
  N expert blocks plus a small learned **router** (a gate). Per
  token, the router scores the experts and fires the top-k; the
  token's output is the weighted mix of those experts only.
- **The cost split is the whole point:** memory pays for ALL
  parameters (every expert must be resident or loadable); compute
  pays only for the ACTIVE ones. A 30B MoE at 3B active answers at
  roughly a 3B model's speed while knowing what a 30B model knows.
- Training keeps experts honest with load-balancing pressure so the
  router doesn't collapse onto a few favourites.
- Serving wrinkle: at high batch, many experts fire per step and
  the advantage narrows; at single-user latency (our seats' regime)
  it is close to free knowledge.

## Open MoE models, sized against our seats (verified 2026-10-28)

| Model | Licence | Total / active | Experts | Fits |
|---|---|---|---|---|
| **Qwen3-30B-A3B-Instruct-2507** | Apache-2.0 | 30.5B / ~3B | 128, top-8 | **OUR PRIMARY** (grok-local) — 24 GB seat at AWQ-4bit (~18 GB) |
| Qwen3-30B-A3B base family quant (MLC q4f16) | Apache-2.0 | 30.5B / ~3B | 128, top-8 | Free-seat experiments; base (non-instruct) is the edge-2024 stretch in grok-local's manifest |
| **OLMoE-1B-7B** | Apache-2.0 | ~7B / ~1B | 64, top-8 | Phone-class MoE / T4 roominess; AllenAI's fully-open entry (data ODC-By 1.0) |
| **Mixtral 8x7B** | Apache-2.0 | 46.7B / 12.9B | 8, top-2 | The classic; too heavy for our T4/24 GB seats at useful quants — catalogue |
| DeepSeek-V3 | **custom DeepSeek licence — free-but-restricted bucket** | 671B / 37B | 256, top-8 | Catalogue only; fits no seat we own |
| Grok-1 | Apache-2.0 | 314B / ~25% active | 8, top-2 | Catalogue colour: even xAI's own open release is an MoE. Base model, fits no seat |

## The second sparsity: specialist LoRA routing (our build-out)

MoE sparsifies INSIDE one model. The same trick works one level
up: instead of one giant fine-tune, keep a shelf of small **LoRA
specialists** (a show-dialogue adapter, a tool-call adapter, a
critic adapter, per-character voice adapters…) on one base model,
and route each task to the specialist that owns it. Adapters are
megabytes-to-a-gigabyte, hash-pinnable, stageable in the warehouse,
and each one is separately distilled (item 3), separately
scorecarded (distill/eval_scorecard.py), and separately replaceable.

Both serving engines support the shelf natively: vLLM serves many
LoRAs on one base (`--enable-lora`, per-request adapter selection);
llama.cpp loads adapters per slot/session. The missing piece is
the ROUTER — which specialist gets which task — specified for
Wielder in `moe/ROUTER-SPEC.md`, written against Wielder's real
conventions (audited from the grok kit): seats are `_SEAT_CALLS`
entries in `wielder/brain.py`, personas are named constants in
`wielder/constitution.py`, and model text stays advisory — so the
router is deterministic configuration first, with any learned
classifier demoted to an advisory proposer.

## Status

**TEARDOWN + ROUTER SPEC.** MoE itself needs no build — the
programme's primary model already is one, and its seat is the
grok-local lane's. The router spec is a design document for the
Wielder lane to implement (this package edits no wielder files);
its roster already has its first entries named: the distilled
Grok-pattern student (item 3) and the existing voice/show adapters
as they earn scorecards.
