"""teacher_generate.py — Phase A: offline teacher generations.

Calls an OpenAI-compatible teacher seat (the grok-local vLLM seat
serving an OPEN teacher — default Qwen3-30B-A3B-Instruct-2507,
Apache-2.0) for every prompt in data/prompts.jsonl and writes
chat-format training rows with full provenance:

  {"messages": [{"role": "user", ...}, {"role": "assistant", ...}],
   "provenance": {"teacher": <served model id>, "prompt_source": ...,
                  "generated_by": "fuel-stack teacher_generate.py"}}

The provenance block is the licence firewall made visible: every
training response in this programme can be traced to the open
teacher that wrote it. Stdlib only (urllib), resumable: prompts
already present in the output are skipped.

Config comes from distill_config.yaml's generation + teacher blocks
when PyYAML is available; every value also has a CLI override.

Usage:
  TEACHER_BASE_URL=http://127.0.0.1:8000/v1 TEACHER_MODEL=<served-name> \
  python3 teacher_generate.py --prompts data/prompts.jsonl \
      --out data/generations.jsonl [--limit 500] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def chat(base_url: str, model: str, prompt: str, temperature: float,
         top_p: float, max_tokens: int, timeout: float = 300.0) -> str:
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature, "top_p": top_p,
        "max_tokens": max_tokens,
    }).encode()
    req = urllib.request.Request(base_url.rstrip("/") + "/chat/completions",
                                 data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    key = os.environ.get("TEACHER_API_KEY")
    if key:
        req.add_header("Authorization", f"Bearer {key}")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        payload = json.loads(resp.read().decode())
    return payload["choices"][0]["message"]["content"]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--prompts", default="data/prompts.jsonl")
    ap.add_argument("--out", default="data/generations.jsonl")
    ap.add_argument("--base-url", default=os.environ.get("TEACHER_BASE_URL"))
    ap.add_argument("--model", default=os.environ.get("TEACHER_MODEL"))
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--top-p", type=float, default=0.95)
    ap.add_argument("--max-new-tokens", type=int, default=1024)
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--limit", type=int, default=0, help="0 = all prompts")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the plan and exit without calling the seat")
    args = ap.parse_args()

    rows = [json.loads(l) for l in Path(args.prompts).read_text(encoding="utf-8").splitlines() if l.strip()]
    done_keys: set[str] = set()
    out_path = Path(args.out)
    if out_path.exists():
        for l in out_path.read_text(encoding="utf-8").splitlines():
            if l.strip():
                r = json.loads(l)
                done_keys.add(r["messages"][0]["content"])
    todo = [r for r in rows if r["prompt"] not in done_keys]
    if args.limit:
        todo = todo[: args.limit]

    plan = (f"teacher seat: {args.base_url} model={args.model}\n"
            f"prompts total={len(rows)} already generated={len(done_keys)} "
            f"to generate={len(todo)} (temp={args.temperature}, "
            f"max_new_tokens={args.max_new_tokens}, concurrency={args.concurrency})")
    print(plan)
    if args.dry_run:
        print("DRY RUN — no seat called.")
        return 0
    if not args.base_url or not args.model:
        print("REFUSED — TEACHER_BASE_URL and TEACHER_MODEL must name the "
              "open-teacher seat (see distill_config.yaml).", file=sys.stderr)
        return 2

    failures = 0

    def job(row: dict) -> str | None:
        nonlocal failures
        try:
            text = chat(args.base_url, args.model, row["prompt"],
                        args.temperature, args.top_p, args.max_new_tokens)
        except Exception as e:  # seat errors are recorded, never faked past
            failures += 1
            print(f"  ERROR prompt from {row.get('source')}: {e}", file=sys.stderr)
            return None
        return json.dumps({
            "messages": [{"role": "user", "content": row["prompt"]},
                         {"role": "assistant", "content": text}],
            "provenance": {"teacher": args.model,
                           "prompt_source": row.get("source", "unknown"),
                           "generated_by": "fuel-stack teacher_generate.py"},
        }, ensure_ascii=False)

    t0 = time.time()
    written = 0
    with out_path.open("a", encoding="utf-8") as f, \
            ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        for line in ex.map(job, todo):
            if line:
                f.write(line + "\n")
                written += 1
    print(f"wrote {written} generations ({failures} failures) in "
          f"{time.time() - t0:.1f}s -> {out_path}")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
