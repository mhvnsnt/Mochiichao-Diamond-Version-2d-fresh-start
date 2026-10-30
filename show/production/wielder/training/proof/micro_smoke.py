#!/usr/bin/env python3
"""Wielder Train — CPU micro-smoke.

Not a training run and not presented as one. It exercises the vendored
trainer's OWN LoRA code path (networks.lora.create_network ->
apply_to -> save_weights) on a tiny throwaway UNet, on CPU, and saves
the result through the trainer's own save_weights. If a real
.safetensors in the trainer's format lands on disk, the trainer core is
proven alive end-to-end at the code level; full SDXL training remains
a GPU-seat proof (Kaggle package).
"""
import hashlib
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "vendor", "sd-scripts"))

import torch
from diffusers import UNet2DConditionModel

from networks import lora as lora_module

OUT = os.path.join(os.path.dirname(__file__), "micro-smoke-lora.safetensors")


def main():
    unet = UNet2DConditionModel(
        sample_size=32,
        in_channels=4,
        out_channels=4,
        down_block_types=("DownBlock2D",),
        up_block_types=("UpBlock2D",),
        block_out_channels=(32,),
        layers_per_block=1,
        cross_attention_dim=16,
        norm_num_groups=8,
    )
    from transformers import CLIPTextConfig, CLIPTextModel
    text_encoder = CLIPTextModel(CLIPTextConfig(
        hidden_size=16, intermediate_size=32, num_hidden_layers=1,
        num_attention_heads=2, vocab_size=100,
    ))
    network = lora_module.create_network(
        multiplier=1.0,
        network_dim=32,       # the owed recipe's dim
        network_alpha=16,     # the owed recipe's alpha
        vae=None,
        text_encoder=text_encoder,
        unet=unet,
    )
    network.apply_to(text_encoder, unet, apply_text_encoder=True, apply_unet=True)
    n_modules = len(network.unet_loras)
    print(f"LORA_MODULES_CREATED {n_modules}")
    if n_modules == 0:
        print("SMOKE_FAIL no LoRA modules created")
        return 1
    network.save_weights(OUT, torch.float32, None)
    size = os.path.getsize(OUT)
    h = hashlib.sha256(open(OUT, "rb").read()).hexdigest()
    print(f"SMOKE_FILE {OUT} bytes={size} sha256={h}")

    # round-trip: the trainer-format file must load back via safetensors
    from safetensors import safe_open
    with safe_open(OUT, framework="pt") as f:
        keys = list(f.keys())
    print(f"SMOKE_TENSORS {len(keys)} first={keys[0] if keys else '-'}")
    if size == 0 or not keys:
        print("SMOKE_FAIL empty file")
        return 1
    print("SMOKE_PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
