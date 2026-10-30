#!/usr/bin/env python3
"""Build the grok-local fine-tune datasets (runs ON THE SERVER).

Downloads the openly licensed sources (licences verified at source,
see ../TRAINING.md), converts them to LLaMA-Factory ShareGPT format,
mixes in the owner's hand-written pattern seeds, and writes:

  data/grok_local_tools.jsonl   glaive + xlam (tool calling)
  data/grok_local_chat.jsonl    smoltalk subsets (direct chat)
  data/grok_local_seeds.jsonl   copy of grok_pattern_seeds.jsonl
  data/dataset_info.json        LLaMA-Factory registration

Nothing here trains on, scrapes, or distils xAI/Grok output — the
sources are independent, openly licensed datasets, and the seeds are
original text written for this kit.

The converters are pure functions and are unit-tested locally
(validation/training-converters-test.txt) against fabricated rows in
each source's documented format. Running the full download+convert
needs the `datasets` library and network on the seat:
PROVEN-ON-FIRST-RUN, success = the three JSONLs exist with the row
counts this script prints, and LLaMA-Factory accepts dataset_info.
"""
from __future__ import annotations

import argparse
import json
import os
import random
import re

HERE = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------------
# Converters (pure; unit-tested)
# ------------------------------------------------------------------

def glaive_chat_to_turns(chat: str) -> list[dict]:
    """glaive-function-calling-v2 stores a conversation as one
    string with USER:/ASSISTANT:/FUNCTION RESPONSE: markers.
    Assistant segments that are a bare JSON object with a "name"
    are tool calls."""
    parts = re.split(r"\n?(USER:|ASSISTANT:|FUNCTION RESPONSE:)\s*",
                     chat)
    turns: list[dict] = []
    role = None
    for piece in parts:
        if piece in ("USER:", "ASSISTANT:", "FUNCTION RESPONSE:"):
            role = {"USER:": "human", "ASSISTANT:": "gpt",
                    "FUNCTION RESPONSE:": "observation"}[piece]
            continue
        text = (piece or "").strip()
        if not text or role is None:
            continue
        if role == "gpt":
            call = _as_tool_call(text)
            if call is not None:
                turns.append({"from": "function_call",
                              "value": json.dumps(call)})
                continue
        turns.append({"from": role, "value": text})
    return turns


def _as_tool_call(text: str):
    t = text.strip()
    if not t.startswith("{"):
        return None
    try:
        obj = json.loads(t)
    except json.JSONDecodeError:
        return None
    if isinstance(obj, dict) and "name" in obj:
        return {"name": obj["name"],
                "arguments": obj.get("arguments", {})}
    return None


def glaive_row_to_example(row: dict) -> dict | None:
    turns = glaive_chat_to_turns(row.get("chat", ""))
    if len(turns) < 2:
        return None
    ex = {"conversations": turns}
    if row.get("system"):
        ex["system"] = row["system"]
    tools = row.get("tools")
    if tools:
        ex["tools"] = tools if isinstance(tools, str) \
            else json.dumps(tools)
    return ex


def xlam_row_to_example(row: dict) -> dict | None:
    """xlam-function-calling-60k: query + tools (JSON str) +
    answers (JSON str list of {name, arguments}). Teaches the call
    itself; glaive supplies the full rounds with observations."""
    query = (row.get("query") or "").strip()
    if not query:
        return None
    try:
        answers = json.loads(row.get("answers") or "[]")
    except json.JSONDecodeError:
        return None
    if not answers:
        return None
    turns = [{"from": "human", "value": query}]
    for ans in answers:
        turns.append({"from": "function_call", "value": json.dumps(
            {"name": ans["name"],
             "arguments": ans.get("arguments", {})})})
    ex = {"conversations": turns}
    tools = row.get("tools")
    if tools:
        ex["tools"] = tools if isinstance(tools, str) \
            else json.dumps(tools)
    return ex


_MESSAGE_ROLES = {"user": "human", "assistant": "gpt",
                  "system": "system"}


def messages_row_to_example(row: dict) -> dict | None:
    """smoltalk subsets carry OpenAI-style 'messages'. A leading
    system message becomes the example's system field."""
    msgs = row.get("messages") or []
    turns, system = [], None
    for m in msgs:
        role = _MESSAGE_ROLES.get(m.get("role", ""))
        content = (m.get("content") or "").strip()
        if role is None or not content:
            continue
        if role == "system" and not turns:
            system = content
            continue
        turns.append({"from": role, "value": content})
    if len(turns) < 2:
        return None
    ex = {"conversations": turns}
    if system:
        ex["system"] = system
    return ex


# ------------------------------------------------------------------
# LLaMA-Factory registration
# ------------------------------------------------------------------

_SHAREGPT = {
    "file_name": None,  # filled per entry
    "formatting": "sharegpt",
    "columns": {"messages": "conversations", "tools": "tools",
                "system": "system"},
    "tags": {"role_tag": "from", "content_tag": "value",
             "user_tag": "human", "assistant_tag": "gpt",
             "observation_tag": "observation",
             "function_tag": "function_call",
             "system_tag": "system"},
}


def dataset_info() -> dict:
    info = {}
    for name, fname in (("grok_local_tools", "grok_local_tools.jsonl"),
                        ("grok_local_chat", "grok_local_chat.jsonl"),
                        ("grok_local_seeds", "grok_local_seeds.jsonl")):
        entry = dict(_SHAREGPT)
        entry["file_name"] = fname
        info[name] = entry
    return info


# ------------------------------------------------------------------
# Download + build (server-side; needs `datasets`)
# ------------------------------------------------------------------

def _write_jsonl(path: str, rows: list[dict]) -> int:
    with open(path, "w") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return len(rows)


def build(out_dir: str, seed: int = 17,
          glaive_cap: int = 25000, xlam_cap: int = 20000,
          smol_cap: int = 15000) -> dict:
    from datasets import load_dataset  # lazy: converters stay testable

    os.makedirs(out_dir, exist_ok=True)
    rng = random.Random(seed)
    counts = {}

    tools_rows: list[dict] = []
    glaive = load_dataset("glaiveai/glaive-function-calling-v2",
                          split="train")
    idx = list(range(len(glaive)))
    rng.shuffle(idx)
    for i in idx[: glaive_cap * 2]:
        ex = glaive_row_to_example(glaive[i])
        if ex:
            tools_rows.append(ex)
        if len(tools_rows) >= glaive_cap:
            break
    counts["glaive"] = len(tools_rows)

    xlam = load_dataset("Salesforce/xlam-function-calling-60k",
                        split="train")
    xlam_count = 0
    for i in range(min(len(xlam), xlam_cap * 2)):
        ex = xlam_row_to_example(xlam[i])
        if ex:
            tools_rows.append(ex)
            xlam_count += 1
        if xlam_count >= xlam_cap:
            break
    counts["xlam"] = xlam_count
    rng.shuffle(tools_rows)
    counts["tools_total"] = _write_jsonl(
        os.path.join(out_dir, "grok_local_tools.jsonl"), tools_rows)

    chat_rows: list[dict] = []
    for config in ("smol-magpie-ultra", "smol-constraints"):
        smol = load_dataset("HuggingFaceTB/smoltalk", config,
                            split="train")
        n0 = len(chat_rows)
        for i in range(len(smol)):
            ex = messages_row_to_example(smol[i])
            if ex:
                chat_rows.append(ex)
            if len(chat_rows) - n0 >= smol_cap // 2:
                break
        counts[config] = len(chat_rows) - n0
    rng.shuffle(chat_rows)
    counts["chat_total"] = _write_jsonl(
        os.path.join(out_dir, "grok_local_chat.jsonl"), chat_rows)

    seeds_src = os.path.join(HERE, "grok_pattern_seeds.jsonl")
    with open(seeds_src) as f:
        seeds = [json.loads(line) for line in f if line.strip()]
    counts["seeds"] = _write_jsonl(
        os.path.join(out_dir, "grok_local_seeds.jsonl"), seeds)

    with open(os.path.join(out_dir, "dataset_info.json"), "w") as f:
        json.dump(dataset_info(), f, indent=2)
    return counts


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out", default=os.path.join(HERE, "data"))
    args = ap.parse_args()
    counts = build(args.out)
    print(json.dumps(counts, indent=2))
    print("[prepare] done — register data/ in the LLaMA-Factory "
          "working dir (dataset_info.json is written beside the "
          "JSONLs) and train with the configs in this folder.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
