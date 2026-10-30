#!/data/data/com.termux/files/usr/bin/sh
# mochii phone seat — start llama-server (Route A)
# Settings of record: transfer-manifest.json "server_settings".
#   HOST=0.0.0.0 sh start-server.sh   -> also serve the LAN (NO AUTH — your call, your network)
#   MODEL_FILE=Qwen3-1.7B-Q8_0.gguf sh start-server.sh  -> the quality alternate (if fetched)
set -eu
SEAT_DIR="$HOME/mochii-seat"
MODEL_FILE=${MODEL_FILE:-Qwen3-1.7B-Q4_K_M.gguf}
HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8080}
CTX=${CTX:-4096}
THREADS=${THREADS:-4}

[ -x "$SEAT_DIR/bin/llama-server" ] || { echo "engine not installed — run termux-setup.sh first."; exit 1; }
[ -f "$SEAT_DIR/models/$MODEL_FILE" ] || { echo "model $MODEL_FILE not found in $SEAT_DIR/models — run termux-setup.sh first."; exit 1; }

# Keep Android from sleeping the seat mid-conversation (Termux:API not required;
# termux-wake-lock ships with the base Termux app).
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock || true

export LD_LIBRARY_PATH="$SEAT_DIR/bin${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
echo "mochii seat starting on http://$HOST:$PORT  (model: $MODEL_FILE)"
echo "open that address in the phone browser. Ctrl+C stops it."
exec "$SEAT_DIR/bin/llama-server" \
  -m "$SEAT_DIR/models/$MODEL_FILE" \
  --host "$HOST" --port "$PORT" \
  -c "$CTX" -t "$THREADS"
