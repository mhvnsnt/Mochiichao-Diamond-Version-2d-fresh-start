# TEARDOWN — Do less work: caching + retrieval (fuel-stack item 8)

*The cheapest compute is the compute you never do. Two industry
standards: (1) never re-read the same prompt twice — cache it;
(2) never make the model memorise what it can look up — retrieve it.
Together they are why a small owned brain, fed the right three
paragraphs, out-answers a giant answering from memory.*

## Part 1 — Caching (configuration, verified against our engines)

**Prefix / prompt caching.** A transformer's KV cache for a prompt
prefix depends only on that prefix. If every call starts with the
same long system text, the engine can compute it once and reuse it.

- **vLLM (our GPU seats):** `--enable-prefix-caching` on
  `vllm serve` (current vLLM enables Automatic Prefix Caching by
  default in its V1 engine; the explicit flag makes it certain
  across versions). Blocks are hashed and shared across requests.
- **llama.cpp (owned/CPU seats):** `--prompt-cache <file>` on
  llama-cli saves/restores a prompt's KV state to disk;
  llama-server adds slot state save/restore (`--slot-save-path`,
  per-slot endpoints) so a seat can resume a warmed context.
- **The wiring rule for Wielder seats (the part that's ours):**
  ORDER THE PROMPT prefix-first. Wielder's constitution block
  (`NODE_PROMPT_CONSTRAINTS` + the persona prompt) is identical on
  every call to a seat — it goes FIRST, the task second, and
  retrieved evidence LAST (see `rag/fuel_rag.py:context_block`,
  whose docstring encodes exactly this). Any layout that puts
  per-request text before the stable text silently defeats the
  cache. This is free speed on every seat call, forever.

**KV-cache compression.** The KV cache grows with context length;
quantizing it trades a little fidelity for a lot of room:
llama.cpp `-ctk q8_0 -ctv q8_0` (`--cache-type-k/-v`, verified in
`common/arg.cpp`) roughly halves KV memory vs fp16. The maths, for
any model: KV bytes/token = layers × KV-heads × head-dim × 2 (K and
V) × bytes-per-element — work it for your model before promising a
context length on a small seat.

**Answer caching (application level):** identical Wielder requests
(same profile, same evidence) recur across a long production day;
a seat-level memo keyed on the exact request hash is a config, not
a model feature — noted here as a Wielder-lane join, implemented
nowhere yet, claimed nowhere.

## Part 2 — Retrieval (the build: `rag/fuel_rag.py`)

A dependency-light RAG module, stdlib-only in its core path:

- **Embedders (pluggable, honest):** the built-in TF-IDF embedder
  (lexical, deterministic, zero downloads — this is what the
  package test runs) and an optional sentence-transformers path
  with licence-clean models: **BAAI/bge-small-en-v1.5 (MIT)** or
  **all-MiniLM-L6-v2 (Apache-2.0)**, 384-dim either way. A seat
  without the library gets a precise NOT CONFIGURED error — never a
  silent downgrade (Wielder house style, deliberately copied).
  Long-context option noted: nomic-embed-text-v1.5 (Apache-2.0,
  768-dim, 8K context) for document-heavy corpora.
- **Store:** one SQLite file (stdlib sqlite3); vectors sit beside
  their chunk text + source so provenance is never separated from
  content. Exact brute-force cosine search — the correct tool at
  programme scale. Documented accelerator if a corpus outgrows it:
  **sqlite-vec (dual MIT / Apache-2.0)**.
- **Safety rails copied from Wielder:** a vector-space guard refuses
  to query a store with a different embedder family than built it;
  retrieval is **advisory evidence only** — it feeds prompts, it
  never routes, scores, or issues verdicts; default depth is
  top-3, matching Wielder's `retrieval_top_k` (lost-in-the-middle
  countermeasure).
- **Callers:** Wielder seats (call `context_block()` on the advise
  path) and the grok-local PWA server mode (module import or the
  CLI: `fuel_rag.py ingest|ask|stats`). Join points are named in
  `rag/README.md`; the Wielder-side hook lands with the Wielder
  lane, this package changes no wielder files.

## Proof

**PROVEN ON THIS VM (CPU, no GPU, no downloads):** the shipped test
ingests six programme documents and answers six questions with the
correct document on top every time, plus persistence, guard, and
honest-failure checks — **12/12** (see smoke/SMOKE-RESULTS.md for
the verbatim run). The neural-embedder live proof is a first-run
item wherever sentence-transformers is installed; the lexical path
is proven, not promised.

## Status

**WIRED (module + CLI + test, self-contained) with named join
points** into Wielder and the PWA server mode. Caching side:
**configuration documented and wiring rule stated**; enabling the
flags lands in the grok-local seat launches (their files, their
lane — cross-referenced, not edited from here).
