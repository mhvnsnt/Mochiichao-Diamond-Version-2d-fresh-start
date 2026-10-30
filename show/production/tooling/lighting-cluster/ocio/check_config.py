#!/usr/bin/env python3
"""Check the house OpenColorIO config against the colour discipline.

Loads config.ocio with the real OpenColorIO library and verifies:
  1. the config parses (profile v2) and exposes the house spaces/roles;
  2. LS-1/LS-2 protection is mechanical: the "Protected Identity - Data"
     colorspace is flagged data, and a processor converting a protected
     value through it returns the value unchanged (OCIO never transforms
     data), while the same value on a working path DOES move;
  3. the display path works (ACEScg -> "Show" view on the sRGB display);
  4. the environment Looks exist, run in ACEScg, and move an environment
     sample the way their keys say (night look cools, dusk look warms);
  5. neither Look can turn a neutral environment sample into anything
     near the quarantined accent red #a03436 (CS-2 spirit check).

Usage:  python3 check_config.py [path-to-config.ocio]
Exit:   0 = all checks pass, 1 = failure.
Requires: opencolorio (pip install opencolorio) - a tool install.
"""

import os
import sys

import PyOpenColorIO as ocio

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = "Protected Identity - Data"
ACCENT_RED = (0xA0 / 255.0, 0x34 / 255.0, 0x36 / 255.0)

results = []


def check(ok, label, detail=""):
    results.append(bool(ok))
    print(("PASS  " if ok else "FAIL  ") + label + ((" - " + detail) if detail else ""))


def apply(proc, rgb):
    return tuple(proc.getDefaultCPUProcessor().applyRGB(list(rgb)))


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "config.ocio")
    cfg = ocio.Config.CreateFromFile(path)
    check(cfg is not None, "config loads", path)
    names = [cs.getName() for cs in cfg.getColorSpaces()]
    for want in ("ACES2065-1", "ACEScg", "sRGB - Display", "sRGB - Texture", DATA):
        check(want in names, f"colorspace present: {want}")
    check(cfg.getRoleColorSpace("data") == DATA, "data role points at the protected space")
    check(cfg.getColorSpace(DATA).isData(), "protected space is flagged data (isdata)")

    # 2 - protection is mechanical.
    sample = (0.188, 0.439, 0.690)  # Dorowani deep blue #3070b0, display-referred triple
    p_data = cfg.getProcessor(DATA, DATA)
    out = apply(p_data, sample)
    check(all(abs(a - b) < 1e-6 for a, b in zip(out, sample)),
          "protected value passes through the data space unchanged", str(out))
    p_work = cfg.getProcessor("sRGB - Texture", "ACEScg")
    moved = apply(p_work, sample)
    check(any(abs(a - b) > 1e-3 for a, b in zip(moved, sample)),
          "same value on the working path does transform (contrast check)", str(moved))

    # 3 - display path.
    dt = ocio.DisplayViewTransform()
    dt.setSrc("ACEScg")
    dt.setDisplay("sRGB")
    dt.setView("Show")
    disp = apply(cfg.getProcessor(dt), (0.18, 0.18, 0.18))
    check(all(0.0 < c < 1.0 for c in disp), "Show view renders a mid-grey sample", str(disp))

    # 4 + 5 - looks behave as their keys say and respect the quarantine.
    env = (0.20, 0.25, 0.30)  # neutral-ish environment sample, ACEScg
    for view, label, expect in (
        ("Show - Gate Night Env Tint", "night look cools (B/R rises)", "cool"),
        ("Show - Gate Dusk Env Tint", "dusk look warms (R/B rises)", "warm"),
    ):
        dtv = ocio.DisplayViewTransform()
        dtv.setSrc("ACEScg")
        dtv.setDisplay("sRGB")
        dtv.setView(view)
        outv = apply(cfg.getProcessor(dtv), env)
        ratio_in = env[2] / max(env[0], 1e-6)
        if expect == "cool":
            ok = outv[2] / max(outv[0], 1e-6) > ratio_in
        else:
            ok = outv[0] / max(outv[2], 1e-6) > env[0] / max(env[2], 1e-6)
        check(ok, f"{view}: {label}", str(outv))
        dist = sum((a - b) ** 2 for a, b in zip(outv, ACCENT_RED)) ** 0.5
        check(dist > 0.25, f"{view}: output stays far from quarantined accent red",
              f"distance={dist:.3f}")

    look_names = list(cfg.getLookNames())
    check(sorted(look_names) == ["ENV - Cool Night Field", "ENV - Warm Dusk Field"],
          "exactly the two environment looks exist", ", ".join(look_names))

    print(f"\n{sum(results)}/{len(results)} checks passed")
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
