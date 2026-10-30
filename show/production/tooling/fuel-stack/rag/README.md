# rag/ — the retrieval layer (do less work)

A small module that fetches the right paragraphs into a seat's
prompt, so small owned models answer from evidence instead of
parameters. Teardown: `../TEARDOWN-caching-and-retrieval.md`.

## Use it

```bash
# build a store from a folder of .md/.txt
python3 fuel_rag.py --db programme.sqlite ingest ./docs
# fetch evidence for a question
python3 fuel_rag.py --db programme.sqlite ask "what colour are the fin cheeks?"
python3 fuel_rag.py --db programme.sqlite stats
```

```python
from fuel_rag import FuelRAG
rag = FuelRAG("programme.sqlite")                 # built-in embedder
block = rag.context_block("how many GPU hours a week?", k=3)
# prompt layout: [constitution/persona prefix][task][block]  <- order matters,
# the stable prefix stays cache-hot (teardown, part 1).
```

## The neural embedder (optional, on-seat)

```python
from fuel_rag import FuelRAG, SentenceTransformerEmbedder
rag = FuelRAG("programme-neural.sqlite",
              SentenceTransformerEmbedder("BAAI/bge-small-en-v1.5"))  # MIT
```
Needs `sentence-transformers` (Apache-2.0) installed ON THE SEAT;
weights download there on first use, never vendored here. All model
options are open-licence: bge-small-en-v1.5 (MIT), all-MiniLM-L6-v2
(Apache-2.0), nomic-embed-text-v1.5 (Apache-2.0, 8K context).
Without the library the constructor raises NOT CONFIGURED with the
fix named — it never silently falls back.

## Rules it lives under

- **Advisory only.** Retrieved text is evidence for a seat's prompt.
  It never routes tasks, never scores work, never issues a verdict.
- **One embedder per store.** The store records its embedder; a
  different family querying it is refused (vector-space guard).
- **Top-3 by default** (`FUEL_RAG_TOP_K`), matching Wielder's
  `retrieval_top_k` setting.
- **Provenance travels:** every hit carries its source file and
  chunk number into the prompt block.

## Join points (named, not yet edited from this lane)

- **Wielder seats:** the advise path (`wielder/brain.py:advise()`)
  is where a `context_block()` belongs — the Wielder lane wires it;
  this module is import-safe inside Wielder's stdlib-only runtime.
- **PWA server mode:** the grok-local server can import this module
  or shell to its CLI (`HOSTING.md` in grok-local names the server
  side). Phone mode B (WebLLM, on-device) does not use it — the
  phone seat's corpus story is a grok-local decision.

## Test

`python3 test_fuel_rag.py` — end-to-end on the shipped sample docs
(ingest → embed → store → retrieve → reload → guard → honest
failure). Last run: **12/12 PASS** on the build VM (verbatim output
in `../smoke/SMOKE-RESULTS.md`).
