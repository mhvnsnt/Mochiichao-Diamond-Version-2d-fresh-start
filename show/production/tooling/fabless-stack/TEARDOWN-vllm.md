# TEARDOWN (compact) — vLLM (serving; link 5's headline, link 3's payload)

Part of the [Fabless Stack](FABLESS-STACK.md). **Licence: Apache-2.0**
(vllm-project/vllm, verified at source 2026-10-28; very actively maintained).
vLLM is the industry-standard open inference server for LLMs on real GPUs, and
it is already the grok-local package's serving pick — this doc is the fabless
side: what it is in the chain, and the seat-variable config templates. The
model/training side lives in `show/production/wielder/grok-local/`; cross-link,
no duplication.

## What it is in the chain

- **PagedAttention** (its founding paper's contribution) is link 5's headline:
  the KV cache — the memory a model uses to remember the conversation — is
  managed in fixed-size blocks with a page table, exactly like virtual memory
  in an OS, instead of one contiguous slab per request. Result: near-zero
  fragmentation waste, far more concurrent requests in the same VRAM. This is
  literally the memory-systems breakthrough of the stack: the code equivalent
  of the memory-chip link.
- Continuous batching, prefix caching, quantization support (AWQ/GPTQ/FP8),
  tensor parallelism over NCCL (link 6), and an **OpenAI-compatible server**
  (`vllm serve`) — the same API shape as llama.cpp's server, which is what
  makes seat choice a config variable across this whole stack.
- Backends: NVIDIA (CUDA) primary; AMD via ROCm/HIP (link 8); CPU and other
  accelerators supported at varying maturity.

## Seat-as-variable (the wiring)

`serving/` holds the templates: one OpenAI-shaped endpoint contract, three
seat fillings — free session (a T4-class card, small model, QLoRA-sized),
serverless, rented (4090-class). The Wielder/client side never changes; only
the endpoint from the rendezvous (link 10 / tunnel, link 8) and the model
size change. See `serving/README.md`.

## Honest limits

- Needs a real GPU seat for its purpose; on this VM it is config-validated,
  never run. First-run proof happens on the first GPU seat (grok-local's
  Kaggle notebook is that proof path).
- On a single 16 GB T4, vLLM serves small models only — the seat matrix says
  so in numbers rather than adjectives.
