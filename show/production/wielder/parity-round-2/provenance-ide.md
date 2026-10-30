# Provenance — IDE-class capabilities (parity round 2, IDE lane) — DRAFT

Date: 2026-10-28. Status: draft rows for the coordinator to fold into
the landing PROVENANCE.md. All implementations below are native
Wielder code written for this lane; no third-party code was vendored
or copied. Patterns only, per the construction-kit rule.

Licence verification: the three donor projects' licences were read at
the licence file in the round-2 open-source sweep
(`research/sweep-oss.md`, checked 2026-10-28) — summaries below cite
that sweep's at-source reads.

| Wielder piece | Pattern donor | Donor licence (verified at source, 2026-10-28) | Bucket | What was taken | What was NOT taken |
|---|---|---|---|---|---|
| `wielder/edit_txn.py` — per-file edit payload as a unified diff, preview = the diff | Aider (`Aider-AI/aider`) — repo-map + unified-diff edit format | Apache-2.0 — LICENSE read at `raw.githubusercontent.com/Aider-AI/aider/main/LICENSE.txt` (sweep §4) | open source | The *idea/format*: edits expressed as unified diffs; a repo map as orientation before editing | No Aider code; Wielder's diff applier is a stdlib-only native implementation; no repo-map clone (retrieval side covered by `code_search.py`, below) |
| `wielder/edit_txn.py` — checkpoint before writing, preimage snapshot (bytes + sha256), byte-exact rollback, apply-failure auto-rollback | Cline (`cline/cline`) — checkpoint/rollback model | Apache-2.0 — LICENSE read at `raw.githubusercontent.com/cline/cline/main/LICENSE` (sweep §5) | open source | The *model*: snapshot state before a write set lands; restore on demand | No Cline code; Wielder checkpoints are plain files under `.wielder-checkpoints/` (or its own data dir), hash-verified in Wielder's evidence style — Cline's git/shadow-repo machinery was not adopted |
| `wielder/code_search.py` — workspace symbol index answering "where is X defined / who references X" | Continue (`continuedev/continue`) — codebase indexing | Apache-2.0 — LICENSE read at `raw.githubusercontent.com/continuedev/continue/main/LICENSE` (sweep §6) | open source | The *capability shape*: index the codebase once, answer retrieval queries from the index | No Continue code and **no embeddings**: Continue's index is embeddings-based; Wielder's is deterministic stdlib `ast` (definitions with file+line, Name/attribute/call references) plus a word-boundary text fallback for non-Python files — chosen because Wielder's repo_index is citation-grade and must be reproducible |
| `wielder/repo_index.py` (pre-existing, reused) | — | Wielder's own (owner's system) | owner | `code_search.py` reuses its `SKIP_DIRS` convention and complements its API-name surface with line-level definitions/references | — |

## Inventory note (what already existed, so the new pieces are honest)

- `wielder/repo_index.py`: path index (repo-wide), JSON registry keys,
  JSON/Pydantic schema names, public API dotted *names* — no line
  numbers, no references, no text/symbol search, no embeddings.
- `wielder/tools.py` before this lane: 8 tools (`hash_file`,
  `check_artifact`, `run_verifier`, `read_manifest`,
  `run_registered_script`, `retrieve`, `write_run_file` — run-dir
  only, `request_browser_job`). No general file read/edit/search
  tool, no multi-file edit, no checkpoint/rollback anywhere in the
  package.
- `wielder/evidence.py` / `report.py`: receipts are
  `{kind, ref, sha256, detail}` hash-bound items collected from tool
  results into the run packet — `edit_txn` receipts follow that shape
  (`kind: edit_txn_apply|edit_txn_rollback`, `ref: checkpoint:<id>`,
  per-file before/after sha256).

## New pieces (this lane)

| File | Kind | Wiring |
|---|---|---|
| `wielder/edit_txn.py` | new module | preview/apply/rollback/list/status API; checkpoints under `<workspace>/.wielder-checkpoints/`, or `constitution.DATA/checkpoints` when the workspace is Wielder itself |
| `wielder/code_search.py` | new module | `build_code_index` / `definitions` / `references` / `search_symbol`; stdlib only |
| `wielder/tools.py` | additive registration | `edit_txn_preview`, `edit_txn_apply`, `edit_txn_rollback`, `edit_txn_list`, `code_search`; apply/rollback gated by `authz.require("local-builds-renders", …)` — the same class as `run_verifier`/`run_registered_script`; preview/list/search are read-only like `hash_file`/`read_manifest` |
| `wielder/tests/test_edit_txn.py`, `wielder/tests/test_code_search.py` | new tests | hermetic tmp_path fixtures |
