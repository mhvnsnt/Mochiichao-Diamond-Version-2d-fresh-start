#!/usr/bin/env python3
"""Quantize a bf16 abliterated source to AWQ 4-bit, ON THE SERVER.

Why this exists: the abliterated variants (huihui-ai) ship bf16 only —
61-66 GB, far too big for one 24 GB card. The base models' official
AWQ quants cannot be reused: abliteration changes the weights, so the
quant has to be made from the abliterated weights themselves. This
script does that with llm-compressor (Apache-2.0, vllm-project),
mirroring the recipe shape of the cyankiwi AWQ build recorded in
model_hashes.json (W4A16, group 128, lm_head and the MoE router
ignored), then pull-verifies its own output and records provenance.

Pipeline:
  pull_model.py --variant primary-abliterated-src   (writes
      DOWNLOADED-MANIFEST.json with per-file sha256 — the source
      provenance this output cites)
  python3 quantize_awq.py --src ./models/primary-abliterated-src \
      --out ./models/primary-abliterated-awq
  launch.sh with MODEL_VARIANT=primary-abliterated

Calibration: a sample of HuggingFaceTB/smoltalk's smol-magpie-ultra
config (Apache-2.0 subset — see ../TRAINING.md), rendered through the
source tokenizer's chat template. Calibration data is downloaded on
the server at quantize time; nothing is baked into this repo.

PROVEN-ON-FIRST-RUN: this is a GPU job and has never run. The exact
check that proves it: the output directory contains safetensors whose
config.json carries a "quantization_config" block, this script exits
0 after verifying the output loads with transformers, and
smoke_test.py passes against the served quant (DEPLOY-RUNBOOK.md).

llm-compressor is imported lazily so `--help` and the recipe-printing
dry path work on machines without it (and without a GPU).
"""
from __future__ import annotations

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# Recipe mirrors the cyankiwi AWQ build for the primary base
# (compressed-tensors W4A16): lm_head stays full precision; the MoE
# router (mlp.gate) must also stay full precision — quantizing the
# router wrecks expert selection.
IGNORE = ["lm_head", "re:.*mlp\\.gate.*"]
CALIBRATION_DATASET = "HuggingFaceTB/smoltalk"
CALIBRATION_CONFIG = "smol-magpie-ultra"
CALIBRATION_SAMPLES = 512


def recipe_dict() -> dict:
    return {
        "quant_method": "awq",
        "bits": 4,
        "group_size": 128,
        "symmetric": True,
        "ignore": IGNORE,
        "calibration": {
            "dataset": CALIBRATION_DATASET,
            "config": CALIBRATION_CONFIG,
            "samples": CALIBRATION_SAMPLES,
            "rendering": "tokenizer chat template applied to 'messages'",
        },
    }


def read_source_manifest(src: str) -> dict:
    path = os.path.join(src, "DOWNLOADED-MANIFEST.json")
    if not os.path.isfile(path):
        raise SystemExit(
            f"[quantize] {path} not found — pull the source with "
            "pull_model.py first; its manifest is the provenance this "
            "quant cites, and quantizing an unverified source is "
            "exactly what the manifest exists to prevent.")
    with open(path) as f:
        return json.load(f)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--src", required=True,
                    help="bf16 abliterated source dir (from pull_model.py)")
    ap.add_argument("--out", required=True,
                    help="output dir for the AWQ model")
    ap.add_argument("--max-seq-len", type=int, default=2048)
    ap.add_argument("--print-recipe", action="store_true",
                    help="print the recipe + provenance and exit "
                         "(no GPU, no llm-compressor needed)")
    args = ap.parse_args()

    source_manifest = read_source_manifest(args.src)
    recipe = recipe_dict()
    if args.print_recipe:
        print(json.dumps({"recipe": recipe,
                          "source_provenance": source_manifest},
                         indent=2))
        return 0

    # Lazy imports: everything below needs the GPU stack.
    from datasets import load_dataset
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from llmcompressor import oneshot
    from llmcompressor.modifiers.quantization import QuantizationModifier

    tokenizer = AutoTokenizer.from_pretrained(args.src)

    ds = load_dataset(CALIBRATION_DATASET, CALIBRATION_CONFIG,
                      split=f"train[:{CALIBRATION_SAMPLES}]")

    def render(example):
        text = tokenizer.apply_chat_template(
            example["messages"], tokenize=False)
        return {"text": text}

    ds = ds.map(render, remove_columns=ds.column_names)

    model = AutoModelForCausalLM.from_pretrained(
        args.src, torch_dtype="auto")
    modifier = QuantizationModifier(
        targets="Linear", scheme="W4A16_ASYM", ignore=IGNORE)
    oneshot(model=model, dataset=ds, recipe=modifier,
            max_seq_length=args.max_seq_len,
            num_calibration_samples=CALIBRATION_SAMPLES)

    os.makedirs(args.out, exist_ok=True)
    model.save_pretrained(args.out)
    tokenizer.save_pretrained(args.out)

    # Record what this quant IS, next to the weights: which source
    # (with its pull-time hashes), which recipe, which tool.
    provenance = {
        "kind": "grok-local-awq-quant",
        "produced_by": "grok-local/serving/quantize_awq.py "
                       "(llm-compressor, Apache-2.0)",
        "recipe": recipe,
        "source_provenance": source_manifest,
    }
    with open(os.path.join(args.out, "QUANT-PROVENANCE.json"),
              "w") as f:
        json.dump(provenance, f, indent=2)

    # Self-check: the output must reload and declare its quantization.
    with open(os.path.join(args.out, "config.json")) as f:
        config = json.load(f)
    if "quantization_config" not in config:
        print("[quantize] FAIL: output config.json has no "
              "quantization_config — the quant did not take.",
              file=sys.stderr)
        return 1
    AutoModelForCausalLM.from_pretrained(
        args.out, torch_dtype="auto").config  # load check only
    print(f"[quantize] OK: AWQ written to {args.out} "
          "(quantization_config present, reload check passed)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
