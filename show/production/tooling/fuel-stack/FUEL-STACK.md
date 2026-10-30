# FUEL-STACK — the map: ten ways to make your own fuel (+1 evaluated)

*Owner's doctrine (Jamar, 2026-10-28): if the fuel station closed
forever, people would reverse-engineer how fuel is made and make
their own. Fuel = GPU compute-hours. Every entry below is an
industry-standard technique that PRODUCES usable compute without a
4090-class card or a cloud account — what it is in plain words, the
standard implementation, its licence verified at source, which lane
owns it, and its honest status in this programme.*

**Status words used below (same everywhere in this folder):**
`WIRED` = built and proven by a recorded run · `KIT-READY` =
complete, validated locally, GPU/device proof is a named first-run
item · `MAP` = mapped + cross-referenced to the owning lane's work
and verdict · `SPEC` = design document, implementation lane named ·
`EVALUATED-REJECTED` = looked at hard, refused, reason recorded.

**How the ten compound:** compression (1) shrinks every model;
engines (2) squeeze the silicon; distillation (3) manufactures
small brains — which become speculative decoding's (4) best drafts
and the router's (9) specialists; splitting (5) and capacity
assembly (10) stretch what seats exist; CPU (6) and on-device (7)
seats need no GPU at all; caching + retrieval (8) deletes work
outright. No single item replaces a 4090. All ten together are the
fuel refinery.

---

## 1. COMPRESSION — the same brain in a fraction of the memory · MAP + decision table

**Plain:** quantization rewrites each weight in fewer bits (16 → 4
is typical): the model file shrinks ~4×, memory traffic shrinks
with it, and on memory-bound hardware smaller is FASTER, not just
cheaper. Quality loss at 4-bit with modern methods is small and
measurable, not guessed.

**Standard implementations:** GGUF quant family (Q4_K_M, Q8_0…)
via llama.cpp tooling (**MIT**); AWQ (**MIT**, the activation-aware
method behind our served quants — served by vLLM's compressed
runtime); GPTQ (the older method — superseded in our stack by AWQ;
named so nobody reaches for it by habit). **Owners:** fabless
(GGUF/llama.cpp), grok-local (model manifest + AWQ serving).
**Status: MAP** — engines proven by the owning lanes (llama.cpp
smoke-proven on CPU by fabless; AWQ seats are grok-local's kits).
This lane's deliverable is the decision table:

| Seat | Format | Why |
|---|---|---|
| Phone (WebLLM mode B) | MLC q4f16_1 builds | The PWA's engine eats MLC format; grok-local manifest owns the picks (1.7B both phones, 4B on the 8 GB phone) |
| Phone (native, fabless PHONE-ENGINE) | GGUF Q4_K_M | llama.cpp arm64 build; 1–3B class for the owner's Motorola hardware class |
| Free T4 seat (vLLM) | AWQ-4bit, fp16 compute | Fits 16 GB with KV room; fp16 because Turing's fast attention paths are fp16 (measured by this programme's Path A runs) |
| Free T4 seat (llama.cpp) | GGUF Q8_0 / Q4_K_M | CPU-offload experiments + RPC nodes |
| 24 GB owned seat | AWQ-4bit primary; FP8 where a dense model fits | AWQ at ~18 GB leaves KV headroom on the 30B-A3B primary |
| CPU-only seat | GGUF Q4_K_M; I2_S for BitNet-class | See items 6 and 11 |
| Training (QLoRA) | NF4 4-bit base + bf16/fp16 adapters | bitsandbytes via the lanes' training kits; T4 = fp16, never bf16 |

## 2. EFFICIENT ENGINES — more work from the same silicon · MAP

**Plain:** the same model runs at wildly different speeds depending
on the engine's kernels — the fused attention, the matmul paths,
the memory layout. Engines are where "the same hardware" stops
being the same hardware.

**Implementations + verdicts (owner: fabless — their records in
`../fabless-stack/`):**
- **llama.cpp (MIT)** — the CPU/edge reference engine. **SMOKE-PROVEN
  by fabless on this VM** (built from source, ran the project test
  model, served an OpenAI-compatible API). Also cross-compiled for
  Android arm64 by fabless (binaries ELF-verified; `PHONE-ENGINE.md`).
- **vLLM (Apache-2.0)** — the GPU serving engine (continuous
  batching, PagedAttention). Runnable kit is grok-local's serving/;
  fabless holds config templates.
- **FlashAttention-class kernels** — flash-attention repo
  **BSD-3-Clause**; in practice our seats consume attention through
  vLLM/PyTorch SDPA. **Measured programme verdict (Path A harvest,
  this programme's own T4 runs):** on Turing (T4), bf16 SDPA falls
  back to the dense math path — a single 9.08 GiB scores tensor at
  our scene shape — while fp16 gets the memory-efficient kernel.
  Rule written into every kit in this folder: **T4 = fp16, always.**
- **Triton (MIT)** — kernel language under PyTorch/vLLM;
  fabless smoke-proved the interpreter path on this VM.
- **PyTorch (BSD-3-Clause-style)** — catalogued by fabless as the
  training substrate (the distill kit's TRL stack rides on it).

**Status: MAP** — verdicts are the fabless lane's measured ones,
carried here, not re-derived.

## 3. DISTILLATION — train a small student on a big OPEN teacher · KIT-READY (this lane's build)

**Plain:** the teacher answers thousands of questions once; the
student trains on those answers (weak form) or on the teacher's
full probability distributions while generating its own attempts
(strong form — GKD). A weekend of teacher time becomes a small,
owned, permanent brain. **This is the refinery's main still.**

**Kit:** `distill/` — data pipeline with the licence firewall
ENFORCED in code (prompts from MIT-licensed UltraChat + our own
seeds; bundled responses discarded unread; every training response
generated by our open teacher and provenance-stamped; closed-model
output datasets refused in `dataset_sources.json`), teacher
generator, TRL GKD trainer wrapper (**TRL Apache-2.0**; alternates
audited: LLaMA-Factory **Apache-2.0**, axolotl **Apache-2.0**,
torchtune **BSD-3-Clause**), teacher/student scorecard in the
grok-local validation style, and a Kaggle 2×T4 job spec (teacher
14B on GPU 1, student 4B on GPU 0). Teacher chain: Qwen3-30B-A3B
(Apache-2.0) on the 24 GB seat; Qwen3-14B on Kaggle. Student:
Qwen3-4B (Apache-2.0).

**Local validation (recorded in smoke/):** all scripts compile;
the data firewall is fixture-proven (a bundled response planted in
the fixture cannot leak); the config checker passes on licences +
provenance; the scorecard harness passes its stub-endpoint
self-test (teacher 3/3, imperfect student 2/3 — it discriminates).
**Status: KIT-READY — the GPU training run is the first-run item.**

## 4. SPECULATIVE DECODING — a cheap guesser, an exact checker · KIT-READY (this lane's build)

**Plain:** a small draft proposes several tokens; the big model
verifies them in ONE pass and keeps the right ones. Same output
(rejection sampling is exact), fewer big-model passes — a pure
speed multiplier that stacks with everything else here.

**Kit:** `speculative/` — vLLM `--speculative-config` files
(schema copied from vLLM's docs, verified 2026-10-28): **n-gram**
(zero extra weights — enable first, everywhere), **draft-model**
(Qwen3-1.7B, Apache-2.0, for the 14B free-seat target), **EAGLE-3**
(for the 30B-A3B primary; its vLLM-format checkpoint declares NO
licence on its card — evaluation-only until clarified, stated in
the kit), plus a llama.cpp serve script (spec types verified in
source: draft-simple / draft-eagle3 / draft-mtp / draft-dflash /
ngram-*; the llama.cpp EAGLE-3 route uses the **MIT**-declared
Tengyunw checkpoint for our exact target). Cross-references
grok-local's server — these are options ON that seat, not a fork.

**Honest shape:** literature gains ~1.2–1.5× (n-gram) to ~2–3×
(EAGLE-3) at low QPS — our regime; near zero under heavy batching.
A distilled student (item 3) is the highest-acceptance draft its
own teacher can have: items 3+4 multiply. **Status: KIT-READY —
speed proof is a first-run measurement on a live seat.**

## 5. SPLITTING ACROSS OWNED DEVICES — several small seats, one model · MAP (one verdict REJECTED)

**Plain:** if no single device fits the model, spread its layers
across devices you own and let them pass activations down the line.

- **llama.cpp RPC — VERIFIED REAL (this lane's source check).** Not
  a gap and not a rumour: current llama.cpp ships a ggml RPC backend
  (`ggml/src/ggml-rpc/`, `tools/rpc/rpc-server.cpp`; the client side
  registers remote servers as compute devices — `add_rpc_devices()`
  in `common/arg.cpp`). Run `ggml-rpc-server` on each owned machine,
  point llama-cli/llama-server at the set, and the model splits by
  layers across the LAN. This package's own VM build compiled with
  `GGML_RPC=ON`, and the resulting server was run here: it binds a
  TCP endpoint and offers its local device for layer placement
  (record in `smoke/SMOKE-RESULTS.md`). **Verdict: the documented option for an owned-device
  cluster** (two owned computers on one network). It is NOT a
  free-session tool — Kaggle/Colab sessions can't take inbound
  connections between each other (same wall as Petals, below).
- **Petals (MIT)** — volunteer-swarm sharding. **EVALUATED-REJECTED
  by fabless for free-session seats** on measured grounds (session
  lifetimes vs swarm stability, no inbound networking, per-token
  internet latency, slow release cadence; revisit trigger recorded
  in their teardown). This map carries their verdict; the piece is
  not rebuilt here.

**Status: MAP** — RPC verified at source + documented; Petals
rejected with the owning lane's reasons.

## 6. CPU-ONLY INFERENCE, done well · MAP + decision rules

**Plain:** a modern CPU with good kernels runs small models at
chat speed with no GPU at all — the seat that can never be taken
away. Engine owner: fabless (llama.cpp, smoke-proven on this VM's
CPU). **OpenVINO (Apache-2.0)** is the Intel-side alternative —
catalogued; our seats are not Intel-NPU seats, so llama.cpp is the
default and OpenVINO is the named fallback for Intel hardware.

**This lane's deliverable — the CPU-seat decision rules:**
1. Model ≤ ~4B at Q4_K_M (or BitNet-class, item 11): CPU-first is a
   real seat, not a apology. Above that, CPU is batch/offline only.
2. Batch-1 interactive work (Wielder tool-calling turns, short
   answers) is the CPU seat's home turf; long generations are not.
3. Embeddings + retrieval (item 8) always run on CPU — they are
   built for it.
4. Threads = physical cores; leave one core for the OS on a
   machine that also serves. (This VM: 2 cores — smoke-scale only.)
5. If a seat has ANY GPU (even the phone's), the GPU path wins for
   ≥7B; CPU keeps the small-model and fallback roles.

**Status: MAP + rules** — engine proven by fabless; the rules above
are the stack's standing guidance.

## 7. ON-DEVICE ACCELERATORS — the phone's own GPU/NPU · MAP

**Plain:** the phone chip is a real seat. The tricks are the
runtimes that can actually address a mobile GPU/NPU from code we
control. Owners: grok-local (PWA + model picks) and fabless
(native engine).

**Per-phone verdicts (the owner's actual hardware — Motorola
moto g stylus 5G - 2023 and Motorola edge 2024, mid-range 6–8 GB
class), as landed by the owning lanes:**
- **WebLLM / MLC (Apache-2.0) via WebGPU — the browser route:**
  WIRED in grok-local's PWA (mode B). Default model Qwen3-1.7B
  q4f16_1 (~0.98 GB) on BOTH phones; Qwen3-4B (~2.27 GB) opt-in on
  the 8 GB phone only. Speed 8–20 tok/s is grok-local's stated
  ESTIMATE until the owner's first run measures it.
- **Native llama.cpp (MIT) — the app route:** fabless
  cross-compiled the engine for arm64-v8a (binaries verified);
  `PHONE-ENGINE.md` gives the APK-shell path. Their class estimates
  for this hardware: 1–1.5B at Q4 ≈ 10–20 tok/s, 3B at Q4 ≈
  5–10 tok/s — ESTIMATES, no device measured yet.
- **LiteRT / AI Edge (Apache-2.0) and Qualcomm QNN (vendor SDK,
  closed-leaning terms): EVALUATED-NOT-ADOPTED.** The WebGPU and
  NEON-CPU paths already cover this seat with open tooling; adding
  a vendor NPU stack buys unmeasured speed at the price of a
  closed dependency. Revisit if a measured workload demands it.

**Status: MAP** — two working routes owned by the sibling lanes;
first-run proof on the owner's actual phones is theirs to record.

## 8. DO LESS WORK — caching + retrieval · WIRED (this lane's build)

**Plain:** never recompute what you can reuse, never memorise what
you can look up. Full teardown: `TEARDOWN-caching-and-retrieval.md`.

- **Caching (configuration):** vLLM prefix caching
  (`--enable-prefix-caching`; on by default in current vLLM, flag
  makes it certain) + llama.cpp prompt/slot state
  (`--prompt-cache`, `--slot-save-path`, KV quant `-ctk q8_0`)
  — flags verified against both engines. **The wiring rule is
  ours:** Wielder prompts are ordered stable-prefix-first
  (constitution + persona), task second, retrieved evidence LAST,
  so the shared prefix stays cache-hot on every call.
- **Retrieval (the build):** `rag/fuel_rag.py` — stdlib-only RAG
  module + CLI: pluggable embedders (built-in TF-IDF, proven;
  optional sentence-transformers path with MIT/Apache embedders —
  bge-small-en-v1.5 **MIT**, all-MiniLM-L6-v2 **Apache-2.0**),
  SQLite store with an embedder-mismatch guard, top-3 default
  matching Wielder's `retrieval_top_k`, advisory-only by design.
  Callable by Wielder seats (advise path) and the PWA server mode;
  join points named in `rag/README.md`, wielder files untouched
  from this lane.

**Proof: PROVEN ON THIS VM — the end-to-end test passes 12/12**
(ingest → embed → store → retrieve → reload → guard → honest
failure), verbatim in `smoke/SMOKE-RESULTS.md`. **Status: WIRED**
(module + CLI + test); neural-embedder live proof is a first-run
item on any seat that installs the library.

## 9. SPARSE BY DESIGN — MoE + specialist LoRA routing · TEARDOWN + SPEC

**Plain:** pay compute only for what fires. Inside a model, that's
Mixture-of-Experts; across a programme, that's a shelf of small
LoRA specialists with a router — instead of one giant brain doing
every job. Teardown: `TEARDOWN-sparse-by-design.md`.

- **MoE (already ours):** the primary seat model Qwen3-30B-A3B IS
  an MoE (128 experts, top-8 per token, ~3B active of 30.5B —
  Apache-2.0). Other open MoEs sized in the teardown: OLMoE-1B-7B
  (Apache-2.0, phone-class), Mixtral 8x7B (Apache-2.0, catalogue),
  DeepSeek-V3 (**custom licence — free-but-restricted bucket**,
  catalogue only), Grok-1 (Apache-2.0, catalogue colour).
- **Router spec (this lane's deliverable):** `moe/ROUTER-SPEC.md` —
  specialist roster schema, the `_SEAT_CALLS` adapter extension,
  `seat_status()` hash reporting, deterministic-first routing
  (registry → task-class table → advisory classifier → base-model
  fallback), route recording, and the constitution's hard rules
  carried over verbatim (router never touches the verifier;
  classifier text is advisory; promotion needs a scorecard + the
  owner's call). Written against Wielder's real conventions from
  the grok kit audit; implementation is the Wielder lane's.

**Status: SPEC** — MoE needs no build (it is the primary model);
the router awaits its lane's implementation, with its first
candidate specialist already named (the item-3 student).

## 10. CAPACITY ASSEMBLY — orchestration + rotation · MAP

**Plain:** none of the above matters if starting a seat is a
chore. Capacity assembly is the machinery that treats every seat —
owned computers, the phone, free sessions — as one pool: launch
anywhere, find the seat, save out before it dies.

- **SkyPilot (Apache-2.0)** — multi-cloud/anywhere launcher.
  **Owner: fabless — WIRED as configs** (serve + train YAMLs, seat
  as a variable; a live launch is their first-run proof).
- **Virtual Seat rotation + rendezvous** — **owner: grok-local:**
  free sessions are fuel with a lifetime; their engine starts
  seats, publishes the live address to a rendezvous file, and the
  PWA follows it; save-out checklists and the ~30 GPU hr/week
  shared budget ledger live in their DEPLOY-RUNBOOK (show work has
  priority — the ledger is a programme rule, not a suggestion).

**Status: MAP** — both pieces are the owning lanes' work, carried
here with their statuses; nothing rebuilt.

## 11. EXTREME COMPRESSION — BitNet-class ternary models · EVALUATED

**Plain:** models TRAINED with weights that are only −1, 0 or +1 —
multiplication becomes addition, memory drops toward ~0.4 GB for a
2B brain, and CPUs (including phone CPUs) become first-class seats.
Teardown: `TEARDOWN-bitnet.md`.

- **Verified at source:** `microsoft/BitNet` repo **MIT**;
  reference model `microsoft/bitnet-b1.58-2B-4T` **MIT** (card);
  official GGUF `ggml-model-i2_s.gguf` = 1,187,801,280 bytes
  (measured). llama.cpp carries a native BitNet architecture in
  mainline source. bitnet.cpp's own setup needs clang — absent on
  this VM (gcc/cmake only), so the smoke used the llama.cpp route.
- **CPU smoke: ENGINE PROVEN, GENERATION BLOCKED ON TRANSFER.**
  Our llama.cpp build runs on this VM and carries the native
  BitNet arch — but the model file itself never arrived intact:
  attempt 1 reached the exact expected size and FAILED sha256
  verification against Microsoft's hash (corrupt resume stitch;
  caught and deleted — the hash gate working), later attempts were
  starved by this VM's shared ingress across ~6 lane downloads.
  Full record + the exact first-run completion command:
  `smoke/SMOKE-RESULTS.md` §6. (Microsoft's published speedups —
  up to ~6× x86 — are vendor-reported and are NOT our numbers.)
- **Phone verdict: PROMISING, NOT ADOPTED.** The arithmetic is the
  phone's friend and the door is left open with a reusable smoke
  harness; today the ecosystem is one reference model deep, with
  no instruct ecosystem and no LoRA story for our specialists, and
  our phone seat already runs on open tooling we control. Re-check
  at each BitNet-class release; a 3–4B instruct-tuned MIT/Apache
  entry that passes the phone smoke becomes the offline fallback
  seat.

**Status: EVALUATED** — teardown + real CPU smoke + verdict.

---

## The first live fuel run (recommended)

**Run the distillation job** (`distill/kaggle/` — Kaggle 2×T4,
inside the shared weekly budget, show work keeps priority). It is
the one run that manufactures a PERMANENT asset: a Grok-pattern
student (Qwen3-4B + GKD adapter) with a teacher-vs-student
scorecard. It simultaneously: proves item 3 end-to-end, produces
item 4's highest-acceptance draft (the student, for its teacher),
and files item 9's first candidate specialist. Zero-cost companions
on the same day, no GPU needed to prepare: add `vllm-ngram.json` +
`--enable-prefix-caching` to the next grok-local seat launch and
record the before/after smoke numbers.

## Gaps stated plainly

- No GPU run of anything in this folder has happened yet — items 3
  and 4 are kit-ready, not proven, and say so in their own files.
- The vLLM-format EAGLE-3 checkpoint for our primary declares no
  licence (2026-10-28); the MIT llama.cpp-route checkpoint is the
  clean alternative, conversion step included in the kit.
- Phone speeds everywhere in this map are class estimates from the
  owning lanes until the owner's first on-device run measures them.
- Answer-level caching (item 8) is a named Wielder-lane join, not
  built here.
- BitNet's official bitnet.cpp route (clang) and any NPU path are
  unproven; the llama.cpp CPU route's engine is proven on this VM
  but its generation smoke awaits an intact model transfer
  (item 11 — the hash gate caught the first "complete" copy).
