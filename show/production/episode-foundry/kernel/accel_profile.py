#!/usr/bin/env python3
"""Episode Foundry — acceleration profile layer for the vace-local kernel.

OPTIONAL layer. With no env set, the profile is ``baseline`` and this
module changes NOTHING: ``apply_to_workflow`` returns the workflow
untouched and ``comfy_launch_flags`` returns ``[]``, so the proven
attempt-3 recipe (30 steps / CFG 5.0 / uni_pc / simple / shift 8.0,
FP16, pytorch attention) runs byte-for-byte as before.

Selection is by env, read by ``foundry_kernel.main()``:

  FOUNDRY_ACCEL            profile name (default ``baseline``):
                             baseline   — proven recipe, no changes
                             accel-lite — 25 steps + torch.compile
                             accel-a    — 20 steps + torch.compile
                                          (THE A/B accelerated arm, see
                                          accel/AB-PROTOCOL.md)
                             accel-b    — accel-a + core EasyCache node
                                          (cache arm; TEST-ON-PROOF)
  FOUNDRY_ACCEL_SAMPLER    optional sampler_name override applied by
                           any non-baseline profile (e.g. ``dpmpp_2m``;
                           TEST-ON-PROOF only — no Wan-VACE evidence it
                           converges in fewer steps; ``dpmpp_2m_sde``
                           is stochastic and is NOT used by any named
                           profile)
  FOUNDRY_ACCEL_FAST_FP16ACC=1
                           add ComfyUI ``--fast fp16_accumulation`` to
                           the launch flags (TEST-ON-PROOF: ComfyUI's
                           own help calls --fast "untested and
                           potentially quality deteriorating")
  FOUNDRY_ACCEL_HIGHVRAM=1 add ``--highvram`` to the launch flags
                           (TEST-ON-PROOF: may avoid model reload
                           between passes; OOM risk on the 14,912 MB
                           T4 is the operator's call per run)

What is deliberately NOT here (see accel/ACCEL-TEARDOWN.md for the
evidence behind each rejection):

  * No TeaCache node insertion. ali-vilab/TeaCache (Apache-2.0)
    supports Wan2.1 T2V/I2V; VACE support on the NATIVE ComfyUI
    graph is unproven, and caching across the VACE control branch
    is exactly the corruption risk the teardown flags. A transform
    whose node schema + VACE safety are both unverified is not
    wired. MagCache (Apache-2.0) is in the same state (official
    VACE support exists in its own framework; native-graph VACE
    unverified). EasyCache is wired instead because it is a
    ComfyUI CORE node whose vendor claim is model-agnostic
    day-0 support — and even it ships only in accel-b, behind
    the proof-cut A/B gate decision.
  * No step-distill LoRA / checkpoint swap. No LightX2V /
    Self-Forcing / CausVid artifact exists that is verified for
    the Wan 2.1 VACE-1.3B native graph (teardown §§1–2).
  * No attention swap. FlashAttention-2 is Ampere+ (sm80);
    SageAttention kernels fail on sm75 in the field evidence
    gathered; xformers is untested here. Every non-baseline
    profile instead PINS ``--use-pytorch-cross-attention``
    (SDPA — the backend the attempt-3 log already shows in use),
    so the A/B cannot silently drift attention backends.
  * No TF32 / FP8 flags: Turing has no TF32 or FP8 tensor-core
    path; setting them would be a no-op dressed as a win.

Workflow transforms (non-baseline profiles) touch ONLY:
  * node 11 (KSampler) scalar inputs: steps / sampler_name /
    scheduler — never its latent/model/conditioning links' sources
    beyond the model-patcher insertions below;
  * node 10 (ModelSamplingSD3).model link source, when compiling;
  * node 11 (KSampler).model link source, when EasyCache is on.
The VACE node's reference_image / control_video / control_masks
wiring, the TrimVideoLatent repair, prompts, seeds, and the gate
are never touched by this module.
"""
from __future__ import annotations

import copy
import os

BASELINE = {
    "name": "baseline",
    "steps": None,            # None = leave the workflow's value alone
    "sampler_name": None,
    "scheduler": None,
    "torch_compile": False,
    "easycache": None,
}

PROFILES: dict[str, dict] = {
    "baseline": dict(BASELINE),
    "accel-lite": {
        "name": "accel-lite", "steps": 25, "sampler_name": None,
        "scheduler": None, "torch_compile": True, "easycache": None,
    },
    "accel-a": {
        "name": "accel-a", "steps": 20, "sampler_name": None,
        "scheduler": None, "torch_compile": True, "easycache": None,
    },
    "accel-b": {
        "name": "accel-b", "steps": 20, "sampler_name": None,
        "scheduler": None, "torch_compile": True,
        # ComfyUI core EasyCache (workflow-example values recorded in
        # accel/ACCEL-TEARDOWN.md): start after 15% of sampling so the
        # early, motion/reference-defining steps always compute; stop
        # at 95% so the final refinement steps always compute.
        "easycache": {"reuse_threshold": 0.8, "start_percent": 0.15,
                      "end_percent": 0.95, "verbose": False},
    },
}

COMPILE_NODE_ID = "90"
EASYCACHE_NODE_ID = "91"


def get_profile(name: str | None = None) -> dict:
    """Resolve a profile by name (or FOUNDRY_ACCEL). Unknown names are
    a hard error — a typo must never silently run the baseline."""
    name = (name or os.environ.get("FOUNDRY_ACCEL") or "baseline").strip()
    if name not in PROFILES:
        raise ValueError(
            f"unknown FOUNDRY_ACCEL profile {name!r}; "
            f"known: {sorted(PROFILES)}")
    prof = copy.deepcopy(PROFILES[name])
    sampler = os.environ.get("FOUNDRY_ACCEL_SAMPLER")
    if sampler and prof["name"] != "baseline":
        prof["sampler_name"] = sampler
    return prof


def comfy_launch_flags(profile: str | dict | None = None) -> list[str]:
    """ComfyUI server flags for a profile. Baseline -> []."""
    prof = get_profile(profile["name"]) if isinstance(profile, dict) \
        else get_profile(profile)
    if prof["name"] == "baseline":
        return []
    flags = ["--use-pytorch-cross-attention"]
    if os.environ.get("FOUNDRY_ACCEL_FAST_FP16ACC") == "1":
        flags += ["--fast", "fp16_accumulation"]
    if os.environ.get("FOUNDRY_ACCEL_HIGHVRAM") == "1":
        flags += ["--highvram"]
    return flags


def apply_to_workflow(wf: dict, profile: str | dict | None = None) -> tuple[dict, list[str]]:
    """Apply a profile's workflow transforms. Returns (workflow, notes);
    notes are human-readable and the kernel appends them to the cut's
    recorded workflow_repairs, so every ledger entry states exactly
    which acceleration ran. Baseline returns the workflow UNCHANGED
    (same object content, empty notes)."""
    prof = get_profile(profile["name"]) if isinstance(profile, dict) \
        else get_profile(profile)
    if prof["name"] == "baseline":
        return wf, []
    notes: list[str] = [f"accel profile {prof['name']} applied"]
    ks = wf["11"]["inputs"]
    if prof["steps"] is not None:
        notes.append(f"KSampler steps {ks['steps']} -> {prof['steps']}")
        ks["steps"] = prof["steps"]
    if prof["sampler_name"]:
        notes.append(f"KSampler sampler_name {ks['sampler_name']} -> {prof['sampler_name']}")
        ks["sampler_name"] = prof["sampler_name"]
    if prof["scheduler"]:
        notes.append(f"KSampler scheduler {ks['scheduler']} -> {prof['scheduler']}")
        ks["scheduler"] = prof["scheduler"]
    if prof["torch_compile"]:
        if COMPILE_NODE_ID in wf:
            raise ValueError("workflow already has a node 90; refusing to overwrite")
        prev_model = wf["10"]["inputs"]["model"]
        wf[COMPILE_NODE_ID] = {
            "_meta": {"title": "TorchCompileModel (accel profile; inductor)"},
            "class_type": "TorchCompileModel",
            "inputs": {"model": prev_model, "backend": "inductor"},
        }
        wf["10"]["inputs"]["model"] = [COMPILE_NODE_ID, 0]
        notes.append("inserted TorchCompileModel (node 90, backend=inductor): "
                     "UNETLoader -> TorchCompileModel -> ModelSamplingSD3; "
                     "first pass pays compile time, later same-shape passes reuse it")
    if prof["easycache"]:
        if EASYCACHE_NODE_ID in wf:
            raise ValueError("workflow already has a node 91; refusing to overwrite")
        ec = prof["easycache"]
        prev_model = wf["11"]["inputs"]["model"]
        wf[EASYCACHE_NODE_ID] = {
            "_meta": {"title": "EasyCache (accel-b profile; TEST-ON-PROOF)"},
            "class_type": "EasyCache",
            "inputs": {"model": prev_model,
                       "reuse_threshold": ec["reuse_threshold"],
                       "start_percent": ec["start_percent"],
                       "end_percent": ec["end_percent"],
                       "verbose": ec["verbose"]},
        }
        wf["11"]["inputs"]["model"] = [EASYCACHE_NODE_ID, 0]
        notes.append(f"inserted EasyCache (node 91, reuse_threshold={ec['reuse_threshold']}, "
                     f"start_percent={ec['start_percent']}, end_percent={ec['end_percent']}): "
                     "ModelSamplingSD3 -> EasyCache -> KSampler")
    return wf, notes


def teacache_transform_available() -> tuple[bool, str]:
    """Deliberately unavailable — see module docstring. Kept as an
    explicit query so a future lane that verifies a native-graph
    TeaCache/MagCache node against the VACE control branch flips
    ONE place, with the verification recorded in the teardown."""
    return False, ("no cache node is verified for the native WanVaceToVideo "
                   "graph: ali-vilab TeaCache and MagCache both verify "
                   "Wan2.1 T2V/I2V (MagCache also VACE in its OWN "
                   "framework), neither verifies the native ComfyUI "
                   "VACE graph's control branch; EasyCache (core, "
                   "model-agnostic) is the wired cache arm instead")
