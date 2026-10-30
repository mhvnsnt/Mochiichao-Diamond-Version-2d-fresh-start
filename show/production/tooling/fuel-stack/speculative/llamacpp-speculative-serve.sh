#!/usr/bin/env bash
# llama.cpp speculative decoding — documented options for our seats.
# Flags verified against llama.cpp source (common/arg.cpp,
# common/speculative.cpp, docs/speculative.md), 2026-10-28.
# Spec types in this build: none, draft-simple, draft-eagle3,
# draft-mtp, draft-dflash, draft-dspark, ngram-simple, ngram-map-k,
# ngram-map-k4v, ngram-mod, ngram-cache.
set -euo pipefail

MODE="${1:-ngram}"
TARGET="${TARGET_GGUF:?set TARGET_GGUF to the target model .gguf}"
PORT="${PORT:-8080}"

case "$MODE" in
  ngram)
    # No draft weights at all: guesses continuations from the prompt's
    # own n-grams. Zero extra memory; helps most on repetitive,
    # code-like, or template-heavy output.
    exec llama-server -m "$TARGET" --port "$PORT" \
      --spec-type ngram-simple --spec-ngram-simple-size-n 4
    ;;
  draft)
    # Classic draft model: a small same-tokenizer model proposes,
    # the target verifies in one batch. Draft default: Qwen3-1.7B
    # GGUF (Apache-2.0 family, same tokenizer as our Qwen3 targets).
    DRAFT="${DRAFT_GGUF:?set DRAFT_GGUF to the draft model .gguf}"
    exec llama-server -m "$TARGET" -md "$DRAFT" --port "$PORT" \
      --spec-type draft-simple --spec-draft-n-max 5
    ;;
  eagle3)
    # EAGLE-3: a one-layer draft that reads the TARGET's hidden
    # states — highest acceptance per draft size, but the draft is
    # trained per-target. For Qwen3-30B-A3B use the MIT-licensed
    # checkpoint Tengyunw/qwen3_30b_moe_eagle3, converted first:
    #   python convert_hf_to_gguf.py Tengyunw/qwen3_30b_moe_eagle3 \
    #     --target-model-dir Qwen/Qwen3-30B-A3B-Instruct-2507 \
    #     --outtype bf16 --outfile Qwen3-a3B-eagle3.gguf
    DRAFT="${DRAFT_GGUF:?set DRAFT_GGUF to the converted EAGLE-3 .gguf}"
    exec llama-server -m "$TARGET" -md "$DRAFT" --port "$PORT" \
      --spec-type draft-eagle3 --spec-draft-n-max 3
    ;;
  *)
    echo "usage: $0 {ngram|draft|eagle3}" >&2; exit 2 ;;
esac
