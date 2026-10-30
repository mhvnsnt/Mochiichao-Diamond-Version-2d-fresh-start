"""prepare_distill_data.py — build the distillation prompt pool.

Reads the audited sources in dataset_sources.json, extracts PROMPTS
ONLY (bundled responses are discarded by design — our teacher writes
every response), dedupes, caps, splits train/eval, and writes:

  data/prompts.jsonl   {"prompt", "source"} lines for teacher_generate.py
  data/eval.jsonl      the held-out slice (same format)

Refusals are enforced, not just documented: any source whose status
is not APPROVED aborts the run. Stdlib only.

Usage:
  python3 prepare_distill_data.py --config distill_config.yaml \
      --ultrachat path/to/ultrachat_train_sft.jsonl \
      [--seeds path/to/grok_pattern_seeds.jsonl] \
      [--extra-prompts mine.jsonl ...] --outdir data
UltraChat rows may be HF messages format ({"messages": [...]}) or
{"prompt": ...}; only the first user turn is taken either way.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import sys
from pathlib import Path


def die(msg: str) -> None:
    print(f"REFUSED — {msg}", file=sys.stderr)
    sys.exit(2)


def first_user_turn(row: dict) -> str | None:
    if isinstance(row.get("prompt"), str) and row["prompt"].strip():
        return row["prompt"].strip()
    msgs = row.get("messages") or row.get("conversations")
    if isinstance(msgs, list):
        for m in msgs:
            role = m.get("role") or m.get("from")
            if role in ("user", "human"):
                text = (m.get("content") or m.get("value") or "").strip()
                if text:
                    return text
    return None


def load_prompts(path: Path, source: str) -> list[dict]:
    out = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            p = first_user_turn(row)
            if p:
                out.append({"prompt": p, "source": source})
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--manifest", default=str(Path(__file__).with_name("dataset_sources.json")))
    ap.add_argument("--ultrachat", help="path to an UltraChat 200k split (.jsonl)")
    ap.add_argument("--seeds", help="path to grok-local grok_pattern_seeds.jsonl")
    ap.add_argument("--extra-prompts", nargs="*", default=[])
    ap.add_argument("--outdir", default="data")
    ap.add_argument("--max-prompts", type=int, default=20000)
    ap.add_argument("--eval-fraction", type=float, default=0.02)
    ap.add_argument("--max-chars", type=int, default=6000, help="prompt length cap")
    ap.add_argument("--seed", type=int, default=17)
    args = ap.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    bad = [s["id"] for s in manifest["sources"] if s["status"] not in
           ("APPROVED", "REJECTED", "REJECTED-AS-IS")]
    if bad:
        die(f"manifest has sources with unrecognised status: {bad}")
    print("Data policy:", manifest["policy"][:110], "...")
    for s in manifest["sources"]:
        print(f"  [{s['status']}] {s['id']} ({s['licence']})")

    pool: list[dict] = []
    if args.ultrachat:
        pool += load_prompts(Path(args.ultrachat), "ultrachat_200k:prompts-only")
    if args.seeds:
        pool += load_prompts(Path(args.seeds), "grok-local-seeds")
    for extra in args.extra_prompts:
        pool += load_prompts(Path(extra), f"owner:{Path(extra).name}")
    if not pool:
        die("no prompts loaded — pass --ultrachat and/or --seeds/--extra-prompts")

    seen: set[str] = set()
    deduped: list[dict] = []
    for item in pool:
        if len(item["prompt"]) > args.max_chars:
            continue
        key = hashlib.sha256(" ".join(item["prompt"].lower().split()).encode()).hexdigest()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)

    rng = random.Random(args.seed)
    rng.shuffle(deduped)
    deduped = deduped[: args.max_prompts]
    n_eval = max(10, int(len(deduped) * args.eval_fraction))
    eval_rows, train_rows = deduped[:n_eval], deduped[n_eval:]

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    for name, rows in (("prompts.jsonl", train_rows), ("eval.jsonl", eval_rows)):
        with (outdir / name).open("w", encoding="utf-8") as f:
            for r in rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"prompts: {len(pool)} loaded -> {len(deduped)} unique kept; "
          f"train {len(train_rows)}, eval {len(eval_rows)} -> {outdir}/")
    print("NOTE: no responses exist yet — teacher_generate.py writes every "
          "response from the open teacher. Bundled dataset responses were "
          "never read past the first user turn.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
