# disk-guard — artifact-lifecycle disk/quota guard

**What it is.** A single-file, stdlib-only CLI (`disk_guard.py`) that keeps
this VM's local disk a workbench instead of a warehouse. It exists because
of a measured failure (2026-10-28): local pulls of Kaggle kernel output
dragged multi-GB files (a 6.9 GB base model riding inside a kernel's
output folder) into persistent workspace dirs, duplicate pulls of the
same output ran side by side, partial downloads were never reaped, and a
456 MB product download died at the finish with `OSError: [Errno 122]
Disk quota exceeded` — while `df` showed 48 GB free on the volume. A
per-user/project quota sits below the filesystem level, so `df` alone
cannot be trusted; the same quota error even blocked the keep-busy
checker's own log write.

**The standard it implements.** The artifact-lifecycle pattern used by CI
artifact stores, DVC-style ML artifact management, and Kaggle dataset
publishing: (1) check headroom before you fetch, (2) a local product file
is a *transit copy* — verify it, publish it to its durable home, confirm
the home, and only then evict the copy, (3) reap orphans conservatively,
by named classes, never by guesswork.

## Subcommands

All subcommands print human-readable lines and, as the **last line of
stdout, a JSON summary**.

| Command | What it does | Exit codes |
|---|---|---|
| `check <path> [--probe-bytes N]` | Headroom report: `df` free space **and** a canary write probe (write+fsync+delete, default 8 MB) in the target directory. A quota errno (EDQUOT/ENOSPC) from the probe = quota-blocked even when df shows space. | 0 healthy · 3 blocked |
| `preflight --expect-bytes N --path P [--probe-bytes N]` | The gate: expected bytes vs df free, plus the canary. Fail = exit 3 with the numbers (expected / free / shortfall). **Never start a pull that cannot finish.** | 0 GO · 3 NO-GO |
| `inventory --roots ... [--manifest M]` | Classify space under the roots: `product` (complete ≥1 MB files in pull dirs), `transit` (small fry in pull dirs), `junk` (partial-download units; pull-dir files byte-matching a manifest entry that records a durable home), `held` (protected: terabox-upload trees, dataset source folders), `unknown`. | 0 |
| `reap --roots ... [--manifest M] [--partial-max-age-hours H] [--apply]` | Orphan/partial reaper, **dry-run by default**; deletions only with `--apply`. Classes below. | 0 |
| `publish-evict --file F --sha256 H --dataset owner/slug [--manifest M]` | Verify-then-evict: sha256-verify `F` → publish to the Kaggle dataset (create/version) or confirm it already reports `ready` → optionally record the staged entry (with its dataset) in a manifest → **only then** delete the local copy. Hash mismatch = exit 4, publish/confirm failure = exit 5; in both cases the local copy stays. | 0 · 4 · 5 |

Kaggle CLI resolution: `$DISK_GUARD_KAGGLE_BIN`, else `kaggle` on PATH,
else `~/workspace/kaggle-cli-venv/bin/kaggle`.

### Reap classes (the ONLY things `--apply` can delete)

- **(a) Orphan partial units** — a `*.kaggle-partial` marker plus its
  sibling data file, when the marker is older than 2 hours, the sibling
  has not been written in the last 120 s, and neither file is open by a
  live process (best-effort `/proc/*/fd` scan). In-flight heuristic, all
  clauses must pass.
- **(b) Staged duplicates in pull dirs** — a file ≥1 MB inside a
  kernel-output pull dir that byte-matches (size + sha256) a manifest
  entry **that records a durable home** (`dataset` field, as written by
  `publish-evict`). A bare collection manifest verifies bytes but does
  not by itself make a pull-dir copy reapable.
- **(c) Duplicate pull dirs** — two pull dirs carrying the same relative
  file, where one copy is verified complete (manifest byte-match, or no
  partial marker when no manifest is given): reap the other copies that
  are partial, or byte-identical to the verified one. Verified copies are
  always kept; complete copies with *different* bytes are report-only.

Everything else is report-only. The reaper **never** touches: source
trees, repo checkouts, dataset source folders (any dir holding
`dataset-metadata.json`), anything under `~/workspace/terabox-upload/`
(held transit masters — a paused chain's resume source, reported as the
named class **held transit masters**), or any file/unit under 1 MB.

A "pull dir" is any directory under a scanned root whose name matches
`output|pull|lora-products` (case-insensitive) in a component below the
root: `run-output*`, `foundry-output*`, `kernel-output`, `lora-products`,
etc.

### Honest limits

- The canary proves *writability now*, not a quota amount: a quota can
  still bite mid-pull on a multi-GB transfer. Pair preflight with
  resumable pulls (the Kaggle CLI resumes `.kaggle-partial` state) and
  prefer the selective `--file-pattern` retrieval so only product files
  transit the disk at all.
- Pull-dir detection is name-based. A tool tree cloned *into* an output
  dir (e.g. a ComfyUI clone inside `foundry-output/`) is classified
  transit/product by location, not by nature — it is only ever reaped if
  it independently matches class (a), (b), or (c), which a clone does not.

## Wiring points (exact)

1. **kaggle-keep-busy cron — new step 0.** Before any `kaggle kernels
   output` pull in the check pass, run a headroom gate against the pull's
   target dir, sized from the kernel output inventory (file list first,
   sum the bytes of the files the selective `--file-pattern` will fetch):

   ```
   python3 show/production/tooling/disk-guard/disk_guard.py preflight \
       --expect-bytes <summed-bytes> --path <pull-target-dir>
   ```

   Exit 0 → pull as before. Exit 3 → run
   `disk_guard.py reap --roots ~/workspace/kaggle-check --manifest <collected-manifest> --apply`,
   then re-run preflight once. Still exit 3 → end the pass quietly with
   the numbers recorded in the state file (the next check retries); never
   start the pull.

2. **Kernel collect steps call `publish-evict`, not bare pulls.** When a
   collect produces a product file (LoRA, weights, finished media), the
   collect step ends with:

   ```
   python3 .../disk_guard.py publish-evict --file <product> \
       --sha256 <manifest-sha256> --dataset marsfmmg/<durable-dataset> \
       --manifest <staged-manifest.json>
   ```

   Products must not be left sitting in pull dirs: pull → verify →
   publish/confirm → evict, in that order, every time.

3. **Kernel-side companion rule (paired, kernel code).** Big downloads
   stay **out of `/kaggle/working` output scope**: base models and other
   multi-GB weights are attached as dataset mounts or kept in a cache
   outside the working folder (e.g. `HF_HOME` outside `/kaggle/working`),
   so a kernel's output folder contains only its products. This is the
   kernel-side half of the fix — it is what stops a 6.9 GB base model
   from riding home inside an output pull in the first place.

4. **Staging-law mechanization.** The staging law says local disk is a
   workbench, not a warehouse (GitHub for what fits, TeraBox/Kaggle
   datasets for the rest). disk-guard is that law's janitor: preflight is
   the door check, publish-evict is the conveyor to durable homes, and
   the reaper is the broom — conservative, class-based, and dry-run by
   default.

## Tests

`tests/test_disk_guard.py` (stdlib `unittest`, Kaggle CLI mocked by a
fake executable on PATH): canary catches a simulated quota failure while
df shows space; preflight exit 3 on impossible expectations; reap
classes (a)/(b)/(c) fire on fixtures and do not fire on the protected
classes (terabox-upload tree, dataset source folder, sub-1 MB units,
fresh or actively-written partials); publish-evict refuses on hash
mismatch and on dataset-check failure, and evicts only after a ready
confirmation. Run: `python3 -m unittest discover -s tests`.
