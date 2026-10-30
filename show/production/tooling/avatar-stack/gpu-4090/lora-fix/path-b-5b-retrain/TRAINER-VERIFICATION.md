# Trainer verification — who can actually train a LoRA for Wan2.2 TI2V-5B?

Checked at source on **2026-10-28** (GitHub API + raw files from each repo's `main`).
Rule: a trainer counts as supporting TI2V-5B only if its own code/docs name that
exact model/task. "Supports Wan" is not enough — the existing 1.3B LoRAs exist
precisely because that distinction was missed once.

| Trainer | Licence | TI2V-5B LoRA status | Proof at source |
|---|---|---|---|
| **modelscope/DiffSynth-Studio** | Apache-2.0 (`LICENSE`) | **SUPPORTED — ships a named LoRA training script for this exact model** | `examples/wanvideo/model_training/lora/Wan2.2-TI2V-5B.sh` in the repo tree @ `e5a44c427769` (2026-10-27). Script trains on `Wan-AI/Wan2.2-TI2V-5B` (DiT + `models_t5_umt5-xxl-enc-bf16.pth` + `Wan2.2_VAE.pth`), `--lora_base_model dit --lora_target_modules "q,k,v,o,ffn.0,ffn.2" --lora_rank 32 --learning_rate 1e-4 --num_epochs 5 --extra_inputs "input_image"`, 480×832, 49 frames. Companion `model_training/validate_lora/Wan2.2-TI2V-5B.py` loads the result (`epoch-4.safetensors`) via `pipe.load_lora(pipe.dit, …, alpha=1)`. |
| **ostris/ai-toolkit** | MIT (`LICENSE`) | **SUPPORTED — dedicated model class + listed base model; no shipped example config for 5B** | `extensions_built_in/diffusion_models/wan22/wan22_5b_model.py` @ `b69b98314557` (2026-10-27): class `Wan225bModel`, `arch = "wan22_5b"`, `get_base_model_version()` returns `"wan_2.2_5b"`. README's supported-model list includes `Wan-AI/Wan2.2-TI2V-5B-Diffusers` (Wan 2.2 TI2V 5B). BUT `config/examples/` contains only `train_lora_wan22_14b_24gb.yaml` (plus Wan2.1 1.3B/14B examples) — no 5B example, so a 5B config must be adapted from the 14B one (see `aitoolkit/` in this package, adaptations marked). |
| **kohya-ss/musubi-tuner** | Apache-2.0 (README "License" section: "Other code is under the Apache License 2.0"; the `wan` directory follows Wan2.1's Apache-2.0) | **NOT SUPPORTED for TI2V-5B training (unchanged)** | @ `f8a1b03794a4` (2026-09-27 — same commit the repo's own LORA-MANIFEST checked). `docs/wan.md` lists `--task` choices: `t2v-1.3B, t2v-14B, i2v-14B, t2i-14B, t2v-1.3B-FC, t2v-14B-FC, i2v-14B-FC, t2v-A14B, i2v-A14B` — no `ti2v-5B`. `src/musubi_tuner/wan_train_network.py` sets `--task … choices=list(WAN_CONFIGS.keys())`, and `WAN_CONFIGS` in `src/musubi_tuner/wan/configs/__init__.py` has no `ti2v-5B` key (the string survives only in a leftover `SUPPORTED_SIZES` entry). The Wan2.2 VAE is mentioned in `docs/wan.md` only to warn it "is for 5B model, not compatible with 14B model". This is the trainer that produced the existing 1.3B LoRAs; it still cannot produce 5B ones. |
| **huggingface/diffusers** (training examples) | Apache-2.0 | **NOT SUPPORTED — no Wan training example exists** | Repo tree @ `51349f7ac2da` (2026-10-28): `examples/` contains `cogvideo/` (`train_cogvideox_lora.py`, `train_cogvideox_image_to_video_lora.py`) but no Wan training directory or script at all. Diffusers has Wan *inference* pipelines; it ships no Wan LoRA trainer. |
| **huggingface/finetrainers** | Apache-2.0 (`LICENSE`) | **NOT SUPPORTED for Wan2.2 / TI2V-5B (Wan2.1 only)** | `docs/models/wan.md` @ `684c0db37a97` (2026-09-23): "Supported checkpoints … tested with finetrainers" lists only Wan2.1 — `Wan2.1-T2V-1.3B`, `Wan2.1-T2V-14B`, `Wan2.1-I2V-14B-480P/720P`, `Wan2.1-FLF2V-14B-720P` (all `-Diffusers`). No Wan2.2 checkpoint is listed. |

## What this means

- The industry-standard fix is available today, from two independent trainers
  (DiffSynth-Studio and ai-toolkit). It does **not** require waiting for
  musubi-tuner.
- DiffSynth-Studio is the primary path in this package: it is the only trainer
  whose own repository ships a ready LoRA recipe for this exact model, so its
  hyperparameters below are *the trainer's*, not ours.
- ai-toolkit is the cross-check / stills path: it trains on images directly
  (`num_frames: 1`, per its own Wan2.2 14B example), which suits a dataset built
  from reference-pack stills without an intermediate clip-rendering step.

## Source URLs

- https://github.com/modelscope/DiffSynth-Studio/blob/main/examples/wanvideo/model_training/lora/Wan2.2-TI2V-5B.sh
- https://github.com/modelscope/DiffSynth-Studio/blob/main/examples/wanvideo/model_training/validate_lora/Wan2.2-TI2V-5B.py
- https://github.com/modelscope/DiffSynth-Studio/blob/main/examples/wanvideo/model_training/train.py
- https://github.com/modelscope/DiffSynth-Studio/blob/main/diffsynth/diffusion/parsers.py
- https://github.com/ostris/ai-toolkit/blob/main/extensions_built_in/diffusion_models/wan22/wan22_5b_model.py
- https://github.com/ostris/ai-toolkit/blob/main/config/examples/train_lora_wan22_14b_24gb.yaml
- https://github.com/ostris/ai-toolkit/blob/main/README.md
- https://github.com/kohya-ss/musubi-tuner/blob/main/docs/wan.md
- https://github.com/kohya-ss/musubi-tuner/blob/main/src/musubi_tuner/wan/configs/__init__.py
- https://github.com/kohya-ss/musubi-tuner/blob/main/src/musubi_tuner/wan_train_network.py
- https://github.com/huggingface/diffusers/tree/main/examples
- https://github.com/huggingface/finetrainers/blob/main/docs/models/wan.md
