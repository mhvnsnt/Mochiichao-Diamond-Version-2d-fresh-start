#!/usr/bin/env bash
# TI2V-5B LoRA training for dorowani — DiffSynth-Studio, adapted from the trainer's OWN recipe:
#   DiffSynth-Studio examples/wanvideo/model_training/lora/Wan2.2-TI2V-5B.sh (@ e5a44c4)
# Changed vs the official script ONLY: dataset paths (ours, built from the reference
# pack — see ../DATASET-SPEC.md), output path, and dataset_repeat (see note below).
# All training hyperparameters are the trainer's documented ones for this model.
set -euo pipefail
cd "$(dirname "$0")/../../.."   # -> DiffSynth-Studio repo root (clone it there / adjust to your checkout)

# NOTE on dataset_repeat: the official example uses 100 with its tiny example
# dataset. Our set is 24-36 clips (DATASET-SPEC.md), so repeat is set to 20
# (each clip seen 20 x 5 epochs = 100 passes) to keep total optimisation in the
# same range without 12,000 clip-passes. This is the one deliberate deviation,
# flagged here and in the report.
accelerate launch examples/wanvideo/model_training/train.py \
  --dataset_base_path data/mochiichao/dorowani \
  --dataset_metadata_path data/mochiichao/dorowani/metadata.csv \
  --height 480 \
  --width 832 \
  --num_frames 49 \
  --dataset_repeat 20 \
  --model_id_with_origin_paths "Wan-AI/Wan2.2-TI2V-5B:diffusion_pytorch_model*.safetensors,Wan-AI/Wan2.2-TI2V-5B:models_t5_umt5-xxl-enc-bf16.pth,Wan-AI/Wan2.2-TI2V-5B:Wan2.2_VAE.pth" \
  --learning_rate 1e-4 \
  --num_epochs 5 \
  --remove_prefix_in_ckpt "pipe.dit." \
  --output_path "./models/train/dorowani_ti2v5b_lora" \
  --lora_base_model "dit" \
  --lora_target_modules "q,k,v,o,ffn.0,ffn.2" \
  --lora_rank 32 \
  --extra_inputs "input_image"
# Output: models/train/dorowani_ti2v5b_lora/epoch-4.safetensors (5 epochs, 0-indexed —
# same naming as the trainer's validate_lora/Wan2.2-TI2V-5B.py, which loads epoch-4).
# --remove_prefix_in_ckpt "pipe.dit." (from the official script) strips the pipe
# prefix so the file loads as a standard Wan LoRA in the scene workflows.
