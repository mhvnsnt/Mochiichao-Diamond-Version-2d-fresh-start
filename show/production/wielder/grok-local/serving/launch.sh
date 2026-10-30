#!/usr/bin/env bash
# Launch the grok-local vLLM server (OpenAI-compatible) for one variant.
#
# Reads serve.env if present (copy serve.env.example, fill in the
# key), then starts vLLM in the foreground. deploy.sh runs this
# under nohup; the Kaggle free-test kernel mirrors these exact
# flags; docker-compose.yml passes the same arguments.
#
# Variant defaults (VRAM math in ../MODEL-MANIFEST.md):
#   primary   AWQ MoE 18.1 GB weights -> 32K context on a 24 GB card
#   fallback  AWQ dense 19.3 GB weights -> 8K context on a 24 GB card
#             (dense KV cache is ~0.5 MB/token; 8K is the honest fit)
#   free-seat AWQ 14B 10.0 GB weights -> 16K context on ONE 16 GB T4,
#             fp16 + enforce-eager (T4 is SM75: no bf16 datapath,
#             no FlashAttention-2 — vLLM picks a supported backend)
#   *-abliterated  serves the AWQ produced on-server by
#             quantize_awq.py from the *-abliterated-src weights
set -euo pipefail
cd "$(dirname "$0")"
[ -f serve.env ] && set -a && . ./serve.env && set +a

VARIANT="${MODEL_VARIANT:-primary}"
MODEL_DIR="${MODEL_DIR:-./models/$VARIANT}"
PORT="${PORT:-8000}"
SERVED_NAME="${SERVED_MODEL_NAME:-grok-local}"

case "$VARIANT" in
  primary)
    MAX_LEN="${MAX_MODEL_LEN:-32768}"; GPU_UTIL="${GPU_MEMORY_UTILIZATION:-0.95}"
    EXTRA=() ;;
  fallback)
    MAX_LEN="${MAX_MODEL_LEN:-8192}"; GPU_UTIL="${GPU_MEMORY_UTILIZATION:-0.95}"
    EXTRA=() ;;
  free-seat)
    MAX_LEN="${MAX_MODEL_LEN:-16384}"; GPU_UTIL="${GPU_MEMORY_UTILIZATION:-0.92}"
    EXTRA=(--dtype float16 --enforce-eager) ;;
  primary-abliterated|fallback-abliterated)
    MODEL_DIR="${MODEL_DIR:-./models/$VARIANT-awq}"
    MAX_LEN="${MAX_MODEL_LEN:-16384}"; GPU_UTIL="${GPU_MEMORY_UTILIZATION:-0.95}"
    EXTRA=() ;;
  custom)
    MAX_LEN="${MAX_MODEL_LEN:-16384}"; GPU_UTIL="${GPU_MEMORY_UTILIZATION:-0.95}"
    EXTRA=() ;;
  *)
    echo "[launch] unknown MODEL_VARIANT: $VARIANT" >&2; exit 2 ;;
esac

if [ ! -d "$MODEL_DIR" ]; then
  echo "[launch] model dir not found: $MODEL_DIR — run pull_model.py first" >&2
  exit 1
fi
if [ -z "${GROK_LOCAL_API_KEY:-}" ]; then
  echo "[launch] WARNING: GROK_LOCAL_API_KEY is not set — the endpoint" >&2
  echo "[launch] will answer ANYONE who can reach it. Set a key in" >&2
  echo "[launch] serve.env before exposing this server beyond localhost." >&2
fi

ARGS=(
  serve "$MODEL_DIR"
  --served-model-name "$SERVED_NAME"
  --host 0.0.0.0 --port "$PORT"
  --max-model-len "$MAX_LEN"
  --gpu-memory-utilization "$GPU_UTIL"
  --enable-auto-tool-choice
  --tool-call-parser hermes
  --allowed-origins "*" --allowed-methods "*" --allowed-headers "*"
)
[ -n "${GROK_LOCAL_API_KEY:-}" ] && ARGS+=(--api-key "$GROK_LOCAL_API_KEY")
ARGS+=("${EXTRA[@]}")

echo "[launch] variant=$VARIANT model=$MODEL_DIR name=$SERVED_NAME port=$PORT max_len=$MAX_LEN"
exec vllm "${ARGS[@]}"
