#!/usr/bin/env bash
# One-command deploy of the grok-local seat on a fresh GPU pod
# (RunPod / Vast / any Linux box with one NVIDIA card).
#
#   ./deploy.sh                 # primary variant, port from serve.env
#   MODEL_VARIANT=free-seat ./deploy.sh
#   MODEL_VARIANT=primary-abliterated ./deploy.sh
#
# Steps: hardware/disk checks -> venv with pinned vLLM -> pull the
# weights HERE (on the server, hash-verified by pull_model.py) ->
# quantize if the variant is an abliterated source -> launch under
# nohup -> wait for /health -> run the built-in smoke test -> print
# the endpoint summary. Nothing here rents or provisions anything:
# the pod must already exist (DEPLOY-RUNBOOK.md covers that choice).
#
# PROVEN-ON-FIRST-RUN: steps that need a real GPU (vLLM boot, smoke
# against a live model) can only pass on the pod itself; the runbook
# names the exact success lines. Everything checkable without a GPU
# (syntax, config parse, path checks) is validated in
# ../validation/deploy-dry-run.txt.
set -euo pipefail
cd "$(dirname "$0")"
[ -f serve.env ] && set -a && . ./serve.env && set +a

VARIANT="${MODEL_VARIANT:-primary}"
PORT="${PORT:-8000}"
VENV="${VENV_DIR:-./.venv}"
MODELS_DIR="./models"
mkdir -p "$MODELS_DIR" logs

echo "== [1/6] hardware and disk checks =="
if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "[deploy] nvidia-smi not found — this seat needs an NVIDIA GPU." >&2
  exit 1
fi
nvidia-smi --query-gpu=name,memory.total --format=csv
GPU_MB="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -1)"
case "$VARIANT" in
  free-seat) NEED_MB=15000 ;;
  *)         NEED_MB=23000 ;;
esac
if [ "$GPU_MB" -lt "$NEED_MB" ]; then
  echo "[deploy] GPU has ${GPU_MB} MB; variant '$VARIANT' needs ~${NEED_MB} MB." >&2
  echo "[deploy] free-seat fits one 16 GB T4; primary/fallback need a 24 GB card." >&2
  exit 1
fi
AVAIL_GB="$(df -BG --output=avail . | tail -1 | tr -dc '0-9')"
if [ "$AVAIL_GB" -lt 80 ]; then
  echo "[deploy] only ${AVAIL_GB} GB free here; the pull + quant workspace needs ~80 GB." >&2
  exit 1
fi
echo "[deploy] GPU ${GPU_MB} MB, ${AVAIL_GB} GB disk free — OK"

echo "== [2/6] python environment (vllm==0.8.5, pinned) =="
if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
fi
"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet "vllm==0.8.5"
"$VENV/bin/python" -c "import vllm; print('[deploy] vllm', vllm.__version__)"

echo "== [3/6] pull weights on this server (hash-verified) =="
SRC_VARIANT="$VARIANT"; QUANTIZE=0
case "$VARIANT" in
  primary-abliterated) SRC_VARIANT="primary-abliterated-src"; QUANTIZE=1 ;;
  fallback-abliterated) SRC_VARIANT="fallback-abliterated-src"; QUANTIZE=1 ;;
esac
"$VENV/bin/python" pull_model.py --variant "$SRC_VARIANT" \
  --out "$MODELS_DIR/$SRC_VARIANT"

if [ "$QUANTIZE" = "1" ]; then
  echo "== [4/6] quantize abliterated source to AWQ (on-server) =="
  "$VENV/bin/pip" install --quiet llmcompressor datasets
  "$VENV/bin/python" quantize_awq.py \
    --src "$MODELS_DIR/$SRC_VARIANT" --out "$MODELS_DIR/$VARIANT-awq"
else
  echo "== [4/6] no quantization step for variant '$VARIANT' =="
fi

echo "== [5/6] launch server =="
export MODEL_VARIANT="$VARIANT" PORT="$PORT"
export PATH="$VENV/bin:$PATH"
nohup ./launch.sh > "logs/server.log" 2>&1 &
echo "[deploy] server starting (pid $!), log: logs/server.log"

echo "== [6/6] wait for health, then smoke test =="
HEALTH="http://127.0.0.1:$PORT/health"
for i in $(seq 1 120); do
  if curl -fsS "$HEALTH" >/dev/null 2>&1; then break; fi
  if [ "$i" = "120" ]; then
    echo "[deploy] server did not become healthy in 10 minutes." >&2
    echo "[deploy] last log lines:" >&2; tail -20 logs/server.log >&2
    exit 1
  fi
  sleep 5
done
echo "[deploy] health OK"
"$VENV/bin/python" smoke_test.py --base "http://127.0.0.1:$PORT/v1" \
  ${GROK_LOCAL_API_KEY:+--key "$GROK_LOCAL_API_KEY"}

echo
echo "================ ENDPOINT SUMMARY ================"
echo "variant:        $VARIANT"
echo "local endpoint: http://127.0.0.1:$PORT/v1"
if [ -n "${RUNPOD_POD_ID:-}" ]; then
  echo "public proxy:   https://${RUNPOD_POD_ID}-${PORT}.proxy.runpod.net/v1"
  echo "                (RunPod pods: also open port $PORT as a public"
  echo "                 HTTP port in the pod config for direct access)"
fi
echo "api key:        ${GROK_LOCAL_API_KEY:+set in serve.env (not printed)}${GROK_LOCAL_API_KEY:-NOT SET — endpoint is open to anyone who can reach it}"
echo "stop billing:   terminate the pod (runbook); local stop: pkill -f 'vllm serve'"
echo "==================================================="
