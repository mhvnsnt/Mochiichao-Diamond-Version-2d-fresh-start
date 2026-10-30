#!/usr/bin/env bash
# Vast onstart — same pack, marketplace instance.
# Vast has NO fixed 4090 price (see INSTANCE-NOTES.md): the price of
# THIS instance is whatever the live listing said at launch. Nothing
# in this script assumes a price.
# Interruptible instances can be preempted: run_scene.py writes
# per-segment outputs + gate packets incrementally, so a preemption
# loses at most the segment in flight.
set -euo pipefail
PACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export MODELS_DIR="${MODELS_DIR:-/workspace/models}"
export COMFY_ROOT="${COMFY_ROOT:-/opt/ComfyUI}"
mkdir -p "$MODELS_DIR" /workspace/output /workspace/input

# Models: ship-clean set only. Add --fast-lane ONLY with the Turbo
# LoRA licence recheck understood (see download_models.py header).
"$PACK_DIR/download_models.sh"

cat > "$COMFY_ROOT/extra_model_paths.yaml" << 'YAMLCFG'
mochiichao_volume:
    base_path: /workspace/models
    diffusion_models: diffusion_models
    vae: vae
    text_encoders: text_encoders
    clip: text_encoders
    loras: loras
    unet: unet
YAMLCFG
sed -i "s|base_path: /workspace/models|base_path: ${MODELS_DIR}|" "$COMFY_ROOT/extra_model_paths.yaml"

exec python3 "$COMFY_ROOT/main.py" --listen 0.0.0.0 --port 8188 \
     --input-directory /workspace/input --output-directory /workspace/output
