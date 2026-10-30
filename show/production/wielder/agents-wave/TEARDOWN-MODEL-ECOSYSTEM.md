# TEARDOWN — Meta Llama Stack + the Hugging Face ecosystem

*Agents wave, 2026-10-28. Sources: the llama-stack project
(llamastack/llama-stack; PyPI `llama-stack` 0.7.3), huggingface.co
documentation and `huggingface_hub` (Apache-2.0), and Wielder's own
grok-local package on main. Licences verified at source 2026-10-28.*

## Llama Stack

**Licence bucket: open source — MIT** (code; PyPI metadata and repo
agree). Meta's answer to fragmentation: one unified API surface
over the building blocks of an AI application — **Inference, Agents,
Tools, RAG (datasets/knowledge), Safety (shields), Evals, Post-
training, Telemetry** — with a plugin architecture: each API has
multiple *providers* (local, on-prem, cloud, mobile), and verified
*distributions* package a provider set that is known to compose.
Clients exist for Python/TypeScript/iOS/Android. The design lesson
is the API/provider split: application code names the capability;
the distribution decides whose implementation serves it.

**Mapping to Wielder:** Wielder's seat layer is the same instinct at
studio scale — `brain.py` measures seats (`seat_status`) behind one
`advise()` call shape, and the grok-local kit made the *endpoint*
the only variable when a seat moves (Kaggle test seat → serverless
→ pod, same client). Wielder does not adopt the Llama Stack server
(one more always-on service on a single VM buys nothing the seat
layer lacks) — recorded as a decision: **distribution/provider
conventions adopted, runtime not adopted.** Llama *model weights*
are a separate bucket — the Llama Community License is
**free-but-restricted** (custom licence: commercial use under a
700M-MAU ceiling, attribution + naming conditions), never "open
source"; Wielder's local seats run Apache-2.0 Qwen3 weights
(grok-local) and MIT-runner Ollama, so no Llama-licence surface
exists in the tree today, and the label discipline matters if that
ever changes.

## Hugging Face ecosystem conventions

**Licence buckets:** `huggingface_hub` library **Apache-2.0**; the
Hub itself is a **free proprietary** hosted service (free tier) —
and per-model licences vary and are the load-bearing labels.

The conventions that matter to a model-seat layer:

- **The model card** — `README.md` in every repo: YAML frontmatter
  (`license`, `base_model`, `library_name`, `pipeline_tag`,
  `language`, `tags`, `datasets`, `metrics`) over markdown stating
  purpose, training, limits. It is the ecosystem's unit of honesty:
  the licence is machine-readable, at the top, before any weights
  move.
- **Revision pinning + hash verification** — every file resolves at
  a commit revision; LFS objects carry SHA-256 oids; a download is
  verifiable byte-for-byte against the repo's own metadata.
- **Safetensors** as the default weight format (no pickle code
  execution), with the index JSON sharding convention.
- **Dataset cards** — the same frontmatter discipline for data
  (the wave's training lane already works this way: the grok-local
  training kit's data provenance is recorded in TRAINING.md).

## What Wielder already had, and the convergence

`grok-local/serving/pull_model.py` + `model_hashes.json` already
implement the verification half to a high standard: pull on the
seat, stream to `.part`, rename only when complete, verify size +
pinned SHA-256 per file, hard-fail on any mismatch; for unpinned
sources, record a DOWNLOADED-MANIFEST of computed hashes as the
provenance. Hash-verify-before-serve was **HAVE**, and this wave
does not duplicate it.

The GAP was the card half: Wielder's seats had manifests, gates and
runbooks, but nothing that *describes a seat model in the format
the ecosystem reads* — no frontmatter, no machine-readable licence
on the model itself.

## Wired now

**`wielder/model_card.py`** (stdlib only, tested in
`wielder/tests/test_mcp_wave.py`):

- `render_model_card(meta, body)` — emits HF-format frontmatter +
  body. Refuses to render without `meta["license"]`: the honesty
  law as code — an unlabelled model is an unshipped model.
- `parse_model_card(text)` — reads the flat frontmatter subset
  (scalars + lists); fields outside the subset are reported in
  `unparsed_fields`, never guessed at.
- `verify_model_files(files, root)` / `verify_variant(manifest,
  variant, root)` — the pull_model.py pinned standard ({size,
  sha256?} per file, hard verdict) as a pure check over a directory
  already on disk, accepting the grok-local manifest shape
  unchanged — one standard, two call sites (download time in
  grok-local, seat-audit time in Wielder).
- `hash_manifest_for_dir(root, relpaths)` — the DOWNLOADED-MANIFEST
  recording half, for models whose upstream pins no hashes.

Follow-up left visible (not done here, not hidden): grok-local's
four seats (MODEL-MANIFEST.md) predate cards; rendering a card per
seat from that manifest is a small next step for the grok-local
lane, using this module.

## GAPs

- **Llama Stack runtime** — not adopted (decision above); a seat
  that one day needs its Agents/RAG API shape would revisit this.
- **Hub upload/publish flow** — Wielder consumes models; it does
  not publish to the Hub, so no upload wiring exists. The owner's
  warehouse is GitHub/TeraBox/Kaggle datasets (staging law).
- **Dataset cards for Wielder's training data** — the training lane
  records provenance in its own docs; HF-format dataset cards are
  not yet emitted. Same follow-up class as the seat cards.
- Closed/hosted surfaces (Hub's private-model internals, Meta's
  hosted Llama API) — documented behaviour only.
