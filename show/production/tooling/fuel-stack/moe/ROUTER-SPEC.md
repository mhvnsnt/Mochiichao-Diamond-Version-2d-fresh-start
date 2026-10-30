# ROUTER-SPEC — specialist routing for Wielder (design document)

Status: **SPEC** — written by the fuel-stack lane against Wielder's
real conventions (audited 2026-10-28 from the grok kit staging:
`wielder/brain.py`, `wielder/constitution.py`). Implementation
belongs to the Wielder lane; this package edits no wielder files.
Concept: `../TEARDOWN-sparse-by-design.md`.

## The idea, in Wielder's terms

Wielder already separates **profiles** (task shapes), **methods**
(deterministic procedures), and **seats** (model endpoints called
through `brain._SEAT_CALLS`). A specialist is a *seat + adapter*
pair: the same base model, wearing one LoRA. The router's whole job
is: given a run's profile/task-class, pick the specialist the
roster assigns — deterministically, with a record.

## Data shapes (extensions of what exists, nothing replaced)

**1. Specialist roster** — a new config table the Wielder lane adds
beside Wielder's existing config (same file family as
`wielder/config.py`'s `retrieval_top_k` pattern):

```json
{
  "specialists": [
    {
      "specialist_id": "grok-pattern-local",
      "seat": "grok-local",
      "adapter": null,
      "task_classes": ["pattern-draft", "first-pass"],
      "status": "active",
      "scorecard": null
    },
    {
      "specialist_id": "grok-pattern-student-v1",
      "seat": "grok-local",
      "adapter": {
        "uri": "warehouse://adapters/qwen3-4b-grok-pattern-gkd-v1",
        "sha256": "<pinned at staging time>",
        "base_model": "Qwen/Qwen3-4B-Instruct-2507"
      },
      "task_classes": ["pattern-draft"],
      "status": "candidate",
      "scorecard": "distill scorecard record ref (required before active)"
    }
  ]
}
```

**2. Seat-call extension** — `_SEAT_CALLS` entries gain ONE optional
key, following the existing entry anatomy (`kind`, `url`,
`default-model`, `model-env`, `key-env`):

```python
"grok-local": (kind, url, default-model, model-env, key-env,
               {"adapter_env": "WIELDER_LOCAL_ADAPTER"})  # optional
```

When a call carries a specialist, the seat request names the
adapter the same way both engines already accept it (vLLM: the
adapter's served name as the request `model`; llama.cpp: the
adapter loaded for the slot). `seat_status()` gains two report
fields — `adapter_loaded`, `adapter_sha256` (expected vs measured,
same honesty pattern as grok-local's pull_model hash check). An
adapter whose measured hash differs from the roster is NOT SERVED —
that is a NOT CONFIGURED-class failure, recorded, never papered
over.

**3. Router persona** — if a model is ever consulted on routing, it
is a named constant in `constitution.py` beside `CRITIC_PERSONA`
and `GROK_PATTERN_PERSONA`, inheriting `NODE_PROMPT_CONSTRAINTS`:

```
ROUTER_PERSONA (SPEC TEXT): "You propose a task class for the text
given. Reply with one class name from the roster's list and one
sentence of evidence. Your proposal is advisory: the deterministic
table decides, and your text is recorded either way."
```

## Routing order (deterministic first — the constitution way)

1. **Profile/method registry (existing, unchanged).** If the run's
   method names a specialist, that is the route. Full stop.
2. **Task-class table (this spec).** The run's declared task class
   maps through the roster: exactly one `active` specialist per
   (seat, task class) — roster validation refuses duplicates.
3. **Advisory classifier (optional).** Only when no class is
   declared: a small seat (the phone-size model is enough) proposes
   a class under ROUTER_PERSONA; the table then decides. The
   proposal and its evidence are written to the run record.
4. **Fallback.** No route → the seat's base model, no adapter. A
   missing specialist NEVER blocks a run and NEVER silently swaps
   in a different specialist.

## Hard rules (inherited, non-negotiable)

- **The router never touches the verifier.** The finish-gate
  verifier is not a seat and not a specialist; nothing in this spec
  can route work to it, from it, or around it.
- **Advisory means advisory.** Classifier text cannot change an
  outcome — same rule as `brain.advise()` and every seat.
- **Every route is recorded:** run id, task class, its source
  (registry / table / classifier / fallback), specialist id,
  adapter sha256. Unexplained routes are bugs by definition.
- **Promotion is earned:** a specialist becomes `active` only with
  a scorecard record on file (fuel-stack `distill/eval_scorecard.py`
  pattern) and the owner's call. `candidate` specialists serve
  shadow comparisons only.
- **Adapters are warehouse goods:** staged (GitHub/TeraBox),
  sha256-pinned in the roster, pulled on the seat with verification
  — the grok-local `pull_model.py` pattern, reused, not reinvented.

## First roster (as the pieces land)

| Specialist | Base / adapter | Source | Status |
|---|---|---|---|
| grok-pattern on the primary seat | Qwen3-30B-A3B, no adapter | grok-local seat | active (exists today) |
| grok-pattern student | Qwen3-4B + GKD adapter (item 3) | fuel-stack distill kit | candidate — first scorecard decides |
| phone pattern seat | Qwen3-1.7B MLC (mode B) | grok-local PWA | active (exists today) |
| per-character voice/dialogue adapters | per show pipeline | show lane | future roster entries, same schema |

## What the Wielder lane implements (checklist, not code)

- [ ] Roster table + validation (dup-route refusal, sha presence).
- [ ] `_SEAT_CALLS` optional adapter key + seat request plumbing.
- [ ] `seat_status()` adapter fields.
- [ ] Route recording in the run record.
- [ ] ROUTER_PERSONA constant (if/when step 3 is wanted).
- [ ] Tests in the existing suites' style (mocked transport): route
      by table, fallback on missing, hash-mismatch refusal,
      classifier-advisory-only (a malicious classifier output
      cannot change a table-decided route).
