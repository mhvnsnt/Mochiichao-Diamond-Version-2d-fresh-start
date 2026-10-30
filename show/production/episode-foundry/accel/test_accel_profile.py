#!/usr/bin/env python3
"""Self-test for kernel/accel_profile.py (run 2026-10-28: PASS).

Asserts the three properties the A/B depends on:
  1. baseline profile leaves the proven workflow byte-identical and
     adds no launch flags;
  2. accel-a / accel-lite / accel-b change ONLY KSampler scalars and
     model-patcher links — the WanVaceToVideo node's reference /
     control / mask wiring is untouched;
  3. an accelerated graph still passes the kernel's own preflight.

Run: python3 accel/test_accel_profile.py  (from episode-foundry/)
"""
import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve()
sys.path.insert(0, str(HERE.parent.parent / "kernel"))

import accel_profile as ap  # noqa: E402
import foundry_kernel as fk  # noqa: E402

CUT = {"cut_id": "V3-078", "characters": ["Wispkin"],
       "beat": "floats up", "duration_s": 10}


def main() -> None:
    wf0, _ = fk.build_workflow(CUT, "r.png", "c.mp4", "m.mp4", "pfx", 42)
    assert wf0["11"]["inputs"]["steps"] == 30 and "90" not in wf0 and "91" not in wf0
    assert ap.comfy_launch_flags("baseline") == []
    wf_b, notes = ap.apply_to_workflow(copy.deepcopy(wf0), "baseline")
    assert notes == [] and wf_b == wf0

    wf_a, _ = ap.apply_to_workflow(copy.deepcopy(wf0), "accel-a")
    assert wf_a["11"]["inputs"]["steps"] == 20
    assert wf_a["90"]["class_type"] == "TorchCompileModel"
    assert wf_a["90"]["inputs"]["model"] == ["1", 0]
    assert wf_a["10"]["inputs"]["model"] == ["90", 0]
    assert wf_a["9"] == wf0["9"] and wf_a["11"]["inputs"]["latent_image"] == ["9", 2]
    assert ap.comfy_launch_flags("accel-a") == ["--use-pytorch-cross-attention"]

    wf_c, _ = ap.apply_to_workflow(copy.deepcopy(wf0), "accel-b")
    assert wf_c["91"]["class_type"] == "EasyCache"
    assert wf_c["91"]["inputs"]["model"] == ["10", 0]
    assert wf_c["11"]["inputs"]["model"] == ["91", 0]
    assert wf_c["9"] == wf0["9"]

    wf_l, _ = ap.apply_to_workflow(copy.deepcopy(wf0), "accel-lite")
    assert wf_l["11"]["inputs"]["steps"] == 25

    try:
        ap.get_profile("bogus")
        raise SystemExit("bogus profile accepted")
    except ValueError:
        pass

    fk.ACCEL_MODULE = ap
    fk.ACCEL_PROFILE_NAME = "accel-a"
    wf_k, repairs = fk.build_workflow(CUT, "r.png", "c.mp4", "m.mp4", "pfx", 42)
    assert wf_k["11"]["inputs"]["steps"] == 20 and "90" in wf_k
    assert any("accel profile" in r for r in repairs)

    from PIL import Image
    ref = HERE.parent / "_selftest_ref.png"
    Image.new("RGBA", (64, 64), (255, 0, 0, 255)).save(ref)
    try:
        pf = fk.preflight_cut(wf_k, ref, None)
        assert pf["verdict"] == "PASS", pf["failures"]
    finally:
        ref.unlink()
    print("test_accel_profile: ALL PASS")


if __name__ == "__main__":
    main()
