#!/usr/bin/env bash
# download_models.sh — thin wrapper over download_models.py (same folder).
# Usage: download_models.sh [--fast-lane]
#   --fast-lane also fetches the Turbo LoRA, which carries the
#   RECHECK_BEFORE_COMMERCIAL_SHIP licence flag (see download_models.py).
# Env: MODELS_DIR (default /workspace/models). Fails loud (set -e + the
# python script's non-zero exit on any failed fetch / size mismatch).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export MODELS_DIR="${MODELS_DIR:-/workspace/models}"
exec python3 "$HERE/download_models.py" --models-dir "$MODELS_DIR" "$@"
