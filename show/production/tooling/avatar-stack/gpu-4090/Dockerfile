# gpu-4090 production image — ComfyUI + ffmpeg + python deps.
#
# PIN STATUS (honest): the two research files and the repo files this
# pack is built from do NOT pin a CUDA base image, a ComfyUI release,
# or a PyTorch version. The tags below are a STARTING PIN chosen for
# one requirement only — the RTX 4090 is compute capability sm_89
# (Ada), so the base must be a CUDA 12.x image with sm_89 support —
# and they are flagged UNVERIFIED in BUILD-REPORT.md until the first
# image build + 4090 run confirms them.
#
# Models are NOT baked into this image (staging law: weights live on
# the persistent volume, fetched at start by download_models.sh).

FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    COMFY_ROOT=/opt/ComfyUI \
    MODELS_DIR=/workspace/models \
    HF_HOME=/workspace/hf-cache

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv git curl ca-certificates \
      ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# ComfyUI (GPL-3.0, per repo backends.json) and the two custom-node
# packs the repo's real graphs actually use:
#  - kijai ComfyUI-WanVideoWrapper — provides every WanVideo* node in
#    workflows/workflow-turbo-fixed.json (and is the documented
#    Phantom-Wan adapter upstream).
#  - city96 ComfyUI-GGUF — the GGUF loader named on the QuantStack
#    A14B card (eval tier only; not needed by the primary graphs).
# GAP: clone URLs follow the owner/project names given in the source
# files; no source in the pack inputs pins a commit. First build must
# record the resolved commit SHAs into BUILD-REPORT's successor.
RUN git clone https://github.com/comfyanonymous/ComfyUI.git ${COMFY_ROOT} \
    && git clone https://github.com/kijai/ComfyUI-WanVideoWrapper.git ${COMFY_ROOT}/custom_nodes/ComfyUI-WanVideoWrapper \
    && git clone https://github.com/city96/ComfyUI-GGUF.git ${COMFY_ROOT}/custom_nodes/ComfyUI-GGUF

# Python deps: ComfyUI's own requirements + the libraries the repo's
# gate/composite tools import (Pillow, numpy — see likeness_gate.py,
# frame1_gate.py, scene_composite.py in avatar-stack/) + HF tooling
# for download_models.sh (hf_hub_download / HfApi.list_repo_files,
# the same calls repo fetch_consistency_models.py makes).
RUN pip3 install --no-cache-dir torch torchvision torchaudio \
      --index-url https://download.pytorch.org/whl/cu124 \
    && pip3 install --no-cache-dir -r ${COMFY_ROOT}/requirements.txt \
    && pip3 install --no-cache-dir -r ${COMFY_ROOT}/custom_nodes/ComfyUI-WanVideoWrapper/requirements.txt \
    && pip3 install --no-cache-dir pillow numpy huggingface_hub

WORKDIR /workspace
EXPOSE 8188
CMD ["bash", "-lc", "echo 'Use runpod/start.sh or vast/onstart.sh as the container start command — see gpu-4090/README.md' && sleep infinity"]
