#!/bin/bash
# smoke-cpu.sh — reproduce this package's CPU smoke for llama.cpp.
# Builds llama-cli + llama-server (CPU), downloads the tiny public test
# model (stories260K.gguf, 1,185,376 bytes, from ggml-org's own HF repo),
# runs a generation, boots the server, and calls its OpenAI-shaped endpoint.
# Recorded outputs from the original run: ../smoke/SMOKE-RESULTS.md.
set -euo pipefail

MODEL_URL="https://huggingface.co/ggml-org/models/resolve/main/tinyllamas/stories260K.gguf"
WORK="${1:-./llamacpp-smoke}"
mkdir -p "$WORK" && cd "$WORK"

[ -d llama.cpp ] || git clone --depth 1 https://github.com/ggml-org/llama.cpp
cmake -S llama.cpp -B llama.cpp/build -DCMAKE_BUILD_TYPE=Release -DLLAMA_CURL=OFF -DGGML_NATIVE=OFF
cmake --build llama.cpp/build -j"$(nproc)" --target llama-cli llama-server

[ -f stories260K.gguf ] || curl -sL -o stories260K.gguf "$MODEL_URL"

echo "=== generation ==="
./llama.cpp/build/bin/llama-cli -m stories260K.gguf -p "Once upon a time" -n 32 --seed 42

echo "=== server endpoint ==="
./llama.cpp/build/bin/llama-server -m stories260K.gguf --port 18080 &
SRV=$!
trap 'kill $SRV 2>/dev/null || true' EXIT
for i in $(seq 1 30); do curl -s http://127.0.0.1:18080/health >/dev/null && break || sleep 1; done
curl -s http://127.0.0.1:18080/v1/chat/completions -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Once upon a time"}],"max_tokens":16}'
echo
echo "SMOKE DONE"
