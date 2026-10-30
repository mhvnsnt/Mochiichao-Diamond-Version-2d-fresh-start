#!/usr/bin/env bash
# RunPod start — models on the network volume, ComfyUI headless on 8188.
set -euo pipefail
PACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export MODELS_DIR="${MODELS_DIR:-/workspace/models}"
export COMFY_ROOT="${COMFY_ROOT:-/opt/ComfyUI}"
mkdir -p "$MODELS_DIR" /workspace/output /workspace/input

# 1. Models: ship-clean set only. Add --fast-lane ONLY with the Turbo
#    LoRA licence recheck understood (see download_models.py header).
"$PACK_DIR/download_models.sh"

# 2. Point ComfyUI at the volume model dir without editing its tree:
#    extra_model_paths maps our volume folders onto ComfyUI model types.
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
# If MODELS_DIR was overridden, rewrite base_path to match.
sed -i "s|base_path: /workspace/models|base_path: ${MODELS_DIR}|" "$COMFY_ROOT/extra_model_paths.yaml"

# 3. ComfyUI headless. No --lowvram: the primary + locked graphs are
#    sized well under 24 GB (see workflows/CHANGES.md). GAP: unproven
#    on a real 4090 until the first gated run.
exec python3 "$COMFY_ROOT/main.py" --listen 0.0.0.0 --port 8188 \
     --input-directory /workspace/input --output-directory /workspace/output
