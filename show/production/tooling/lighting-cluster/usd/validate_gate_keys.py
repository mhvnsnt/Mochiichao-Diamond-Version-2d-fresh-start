#!/usr/bin/env python3
"""Validate the Garden Gate lighting keys expressed as OpenUSD data.

Opens gate_keys.usda (and, if present, the opinion layer
gate_keys_overrides.usda) with the real OpenUSD Python libraries
(usd-core) and checks the stage against rules drawn from
show/bible/LIGHTING-SYSTEM.md:

  LS-3  night keys carry a mandatory rim for dark-bodied cast
  LS-5  exactly one motivated key light per key
  LS-6  temperature tells the time (feel temperatures must order
        dusk < morning < day < night field)
  LS-7  every key declares the overlay shift model (data, not repaint)
  CS-2  the quarantined accent red (#a03436) appears in no key data

plus structural checks (all four Gate keys present, each with a
KeyLight / FillLight / RimLight, custom sheet fields populated) and a
composition check that the opinion layer overrides GATE-DUSK's rim
without touching the base file's value.

Usage:  python3 validate_gate_keys.py [path-to-usd-dir]
Exit:   0 = all checks pass, 1 = at least one failure.
Requires: usd-core (pip install usd-core) - a tool install, not a
pipeline dependency; the .usda files themselves are plain data.
"""

import os
import sys

from pxr import Usd, UsdLux

HERE = os.path.dirname(os.path.abspath(__file__))
BASE_FILE = "gate_keys.usda"
OVERRIDE_FILE = "gate_keys_overrides.usda"

EXPECTED_KEYS = {
    "GATE_MORNING": ("GATE-MORNING", "First Bell"),
    "GATE_DAY": ("GATE-DAY", "Keeper's Noon"),
    "GATE_DUSK": ("GATE-DUSK", "Last Errand"),
    "GATE_NIGHT": ("GATE-NIGHT", "Board Light"),
}
# LS-6 ordering of temperature *feel* for the Gate set.
TEMP_ORDER = ["GATE_DUSK", "GATE_MORNING", "GATE_DAY", "GATE_NIGHT"]
QUARANTINE_HEX = "a03436"  # CS-2: accent red, never produced by a key

results = []


def check(ok, label, detail=""):
    results.append((bool(ok), label, detail))
    print(("PASS  " if ok else "FAIL  ") + label + ((" - " + detail) if detail else ""))


def attr(prim, name):
    a = prim.GetAttribute("mochiichao:" + name)
    return a.Get() if a else None


def main():
    usd_dir = sys.argv[1] if len(sys.argv) > 1 else HERE
    base_path = os.path.join(usd_dir, BASE_FILE)
    stage = Usd.Stage.Open(base_path)
    check(stage is not None, "stage opens", base_path)
    if stage is None:
        return 1

    root = stage.GetDefaultPrim()
    check(root and root.GetName() == "GardenGateLightingKeys",
          "default prim is GardenGateLightingKeys")

    keys = {}
    for prim in root.GetChildren():
        keys[prim.GetName()] = prim
    check(sorted(keys) == sorted(EXPECTED_KEYS),
          "exactly the four Gate keys are present",
          ", ".join(sorted(keys)))

    for name, (token, display) in EXPECTED_KEYS.items():
        prim = keys.get(name)
        if prim is None:
            check(False, f"{name} present")
            continue
        check(attr(prim, "keyToken") == token, f"{name} key token", str(attr(prim, "keyToken")))
        check(attr(prim, "keyName") == display, f"{name} key name", str(attr(prim, "keyName")))
        for field in ("keySource", "fill", "rim", "gradeFamily"):
            check(bool(attr(prim, field)), f"{name} sheet field '{field}' populated")
        check(attr(prim, "shiftModel") == "overlay (LS-7)",
              f"{name} LS-7 overlay shift model declared")

        key_lights = [c for c in prim.GetChildren()
                      if attr(c, "isMotivatedKey") is True]
        check(len(key_lights) == 1, f"{name} LS-5 exactly one motivated key light",
              f"found {len(key_lights)}")
        for child, kind in (("KeyLight", None), ("FillLight", None), ("RimLight", None)):
            c = prim.GetChild(child)
            check(c is not None, f"{name} has {child}")
            if c is not None and kind is None:
                check(c.HasAPI(UsdLux.LightAPI), f"{name}/{child} is a UsdLux light")

    night = keys.get("GATE_NIGHT")
    if night is not None:
        check(attr(night, "rimMandatoryOnDarkCast") is True,
              "GATE_NIGHT LS-3 rim mandatory on dark cast")
        rim = night.GetChild("RimLight")
        check(rim is not None and UsdLux.LightAPI(rim).GetIntensityAttr().Get() > 0,
              "GATE_NIGHT rim light has positive intensity")

    temps = {n: attr(keys[n], "temperatureFeelK") for n in TEMP_ORDER if n in keys}
    ordered = [temps[n] for n in TEMP_ORDER if n in temps]
    check(len(ordered) == 4 and ordered == sorted(ordered),
          "LS-6 temperature-feel ordering (dusk < morning < day < night)",
          " -> ".join(str(t) for t in ordered))

    # CS-2 quarantine: the accent-red hex must appear in no authored value.
    offenders = []
    for prim in stage.Traverse():
        for a in prim.GetAttributes():
            v = a.Get()
            if isinstance(v, str) and QUARANTINE_HEX in v.lower():
                offenders.append(f"{prim.GetPath()}.{a.GetName()}")
    check(not offenders, "CS-2 accent-red quarantine holds in key data",
          "; ".join(offenders))

    # Composition: the opinion layer must win over the base for GATE_DUSK rim.
    override_path = os.path.join(usd_dir, OVERRIDE_FILE)
    if os.path.exists(override_path):
        base_stage = Usd.Stage.Open(base_path)
        base_rim = base_stage.GetPrimAtPath(
            "/GardenGateLightingKeys/GATE_DUSK/RimLight")
        base_val = UsdLux.LightAPI(base_rim).GetIntensityAttr().Get()
        over_stage = Usd.Stage.Open(override_path)
        over_rim = over_stage.GetPrimAtPath(
            "/GardenGateLightingKeys/GATE_DUSK/RimLight")
        over_val = UsdLux.LightAPI(over_rim).GetIntensityAttr().Get()
        check(abs(base_val - 1.6) < 1e-5 and abs(over_val - 2.1) < 1e-5
              and over_val != base_val,
              "opinion layer composes: GATE_DUSK rim overridden, base untouched",
              f"base={base_val} composed={over_val}")
    else:
        check(False, "opinion layer file present", override_path)

    failed = [r for r in results if not r[0]]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
