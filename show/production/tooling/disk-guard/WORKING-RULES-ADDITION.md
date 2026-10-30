## Disk and quota discipline — disk-guard (addition, 2026-10-28)

Local disk is a workbench, not a warehouse, and its free space is checked,
never assumed — a per-user quota can block writes while `df` still shows
space. The tool of record is `show/production/tooling/disk-guard/disk_guard.py`:

- **Preflight before pulls.** No download, kernel-output pull, or collect
  starts without a headroom gate sized to the expected bytes
  (`preflight`, exit 3 = NO-GO). A pull that cannot finish is never started.
- **Verify → publish → confirm → evict.** A local product file is a transit
  copy. It is sha256-verified, published to its durable home (repo or
  dataset), the home is confirmed, and only then is the local copy evicted
  (`publish-evict`). An unverified file is never evicted, and products are
  never left sitting in pull directories.
- **Keep big downloads out of kernel output scope.** Weights a kernel
  downloads ride as dataset mounts or caches outside `/kaggle/working`, so
  output pulls carry products only.
- **Reap by class, dry-run first.** Orphaned partials and verified
  duplicates are reaped only by the reaper's named classes (`reap`,
  `--apply` to delete). Held transit masters (the TeraBox chain's resume
  source), dataset sources, and anything under 1 MB are never reaped.
