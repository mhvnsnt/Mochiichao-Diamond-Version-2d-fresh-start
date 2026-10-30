# TEST RECORD — lighting cluster local validation (2026-10-28)

All three data artefacts in this package were validated on this VM with
the real upstream Python libraries before landing. Tool installs (venv,
not staging): usd-core 26.11 (OpenUSD 26.11), opencolorio 2.6.0,
MaterialX 1.39.5, Python 3.12.3.

## 1. USD — usd/validate_gate_keys.py over usd/gate_keys.usda + usd/gate_keys_overrides.usda

Exit code 0.

```text
PASS  stage opens - stage/show/production/tooling/lighting-cluster/usd/gate_keys.usda
PASS  default prim is GardenGateLightingKeys
PASS  exactly the four Gate keys are present - GATE_DAY, GATE_DUSK, GATE_MORNING, GATE_NIGHT
PASS  GATE_MORNING key token - GATE-MORNING
PASS  GATE_MORNING key name - First Bell
PASS  GATE_MORNING sheet field 'keySource' populated
PASS  GATE_MORNING sheet field 'fill' populated
PASS  GATE_MORNING sheet field 'rim' populated
PASS  GATE_MORNING sheet field 'gradeFamily' populated
PASS  GATE_MORNING LS-7 overlay shift model declared
PASS  GATE_MORNING LS-5 exactly one motivated key light - found 1
PASS  GATE_MORNING has KeyLight
PASS  GATE_MORNING/KeyLight is a UsdLux light
PASS  GATE_MORNING has FillLight
PASS  GATE_MORNING/FillLight is a UsdLux light
PASS  GATE_MORNING has RimLight
PASS  GATE_MORNING/RimLight is a UsdLux light
PASS  GATE_DAY key token - GATE-DAY
PASS  GATE_DAY key name - Keeper's Noon
PASS  GATE_DAY sheet field 'keySource' populated
PASS  GATE_DAY sheet field 'fill' populated
PASS  GATE_DAY sheet field 'rim' populated
PASS  GATE_DAY sheet field 'gradeFamily' populated
PASS  GATE_DAY LS-7 overlay shift model declared
PASS  GATE_DAY LS-5 exactly one motivated key light - found 1
PASS  GATE_DAY has KeyLight
PASS  GATE_DAY/KeyLight is a UsdLux light
PASS  GATE_DAY has FillLight
PASS  GATE_DAY/FillLight is a UsdLux light
PASS  GATE_DAY has RimLight
PASS  GATE_DAY/RimLight is a UsdLux light
PASS  GATE_DUSK key token - GATE-DUSK
PASS  GATE_DUSK key name - Last Errand
PASS  GATE_DUSK sheet field 'keySource' populated
PASS  GATE_DUSK sheet field 'fill' populated
PASS  GATE_DUSK sheet field 'rim' populated
PASS  GATE_DUSK sheet field 'gradeFamily' populated
PASS  GATE_DUSK LS-7 overlay shift model declared
PASS  GATE_DUSK LS-5 exactly one motivated key light - found 1
PASS  GATE_DUSK has KeyLight
PASS  GATE_DUSK/KeyLight is a UsdLux light
PASS  GATE_DUSK has FillLight
PASS  GATE_DUSK/FillLight is a UsdLux light
PASS  GATE_DUSK has RimLight
PASS  GATE_DUSK/RimLight is a UsdLux light
PASS  GATE_NIGHT key token - GATE-NIGHT
PASS  GATE_NIGHT key name - Board Light
PASS  GATE_NIGHT sheet field 'keySource' populated
PASS  GATE_NIGHT sheet field 'fill' populated
PASS  GATE_NIGHT sheet field 'rim' populated
PASS  GATE_NIGHT sheet field 'gradeFamily' populated
PASS  GATE_NIGHT LS-7 overlay shift model declared
PASS  GATE_NIGHT LS-5 exactly one motivated key light - found 1
PASS  GATE_NIGHT has KeyLight
PASS  GATE_NIGHT/KeyLight is a UsdLux light
PASS  GATE_NIGHT has FillLight
PASS  GATE_NIGHT/FillLight is a UsdLux light
PASS  GATE_NIGHT has RimLight
PASS  GATE_NIGHT/RimLight is a UsdLux light
PASS  GATE_NIGHT LS-3 rim mandatory on dark cast
PASS  GATE_NIGHT rim light has positive intensity
PASS  LS-6 temperature-feel ordering (dusk < morning < day < night) - 3200.0 -> 4300.0 -> 5600.0 -> 6500.0
PASS  CS-2 accent-red quarantine holds in key data
PASS  opinion layer composes: GATE_DUSK rim overridden, base untouched - base=1.600000023841858 composed=2.0999999046325684

64/64 checks passed
```

## 2. OCIO — ocio/check_config.py over ocio/config.ocio

Exit code 0.

```text
PASS  config loads - stage/show/production/tooling/lighting-cluster/ocio/config.ocio
PASS  colorspace present: ACES2065-1
PASS  colorspace present: ACEScg
PASS  colorspace present: sRGB - Display
PASS  colorspace present: sRGB - Texture
PASS  colorspace present: Protected Identity - Data
PASS  data role points at the protected space
PASS  protected space is flagged data (isdata)
PASS  protected value passes through the data space unchanged - (0.18799999356269836, 0.4390000104904175, 0.6899999976158142)
PASS  same value on the working path does transform (contrast check) - (0.09359060227870941, 0.15622615814208984, 0.3957322835922241)
PASS  Show view renders a mid-grey sample - (0.35595229268074036, 0.35595256090164185, 0.35595250129699707)
PASS  Show - Gate Night Env Tint: night look cools (B/R rises) - (0.29405468702316284, 0.44664210081100464, 0.5477351546287537)
PASS  Show - Gate Night Env Tint: output stays far from quarantined accent red - distance=0.532
PASS  Show - Gate Dusk Env Tint: dusk look warms (R/B rises) - (0.40059223771095276, 0.4501785635948181, 0.4547482132911682)
PASS  Show - Gate Dusk Env Tint: output stays far from quarantined accent red - distance=0.414
PASS  exactly the two environment looks exist - ENV - Cool Night Field, ENV - Warm Dusk Field

16/16 checks passed
```

## 3. MaterialX — materialx/check_lustre.py over materialx/lustre_sheen.mtlx

Exit code 0.

```text
PASS  document is schema-valid MaterialX 1.39
PASS  LV-3 state instance present: lustre_day
PASS  lustre_day sheen_amount == 1.0 - got 1.0
PASS  material binding present: M_lustre_day
PASS  LV-3 state instance present: lustre_night
PASS  lustre_night sheen_amount == 0.35 - got 0.3499999940395355
PASS  material binding present: M_lustre_night
PASS  LV-3 state instance present: lustre_dark_forest
PASS  lustre_dark_forest sheen_amount == 0.0 - got 0.0
PASS  material binding present: M_lustre_dark_forest
PASS  nodegraph NG_lustre_look present
PASS  LV-1 locked base colour is Dorowani deep blue #3070b0 - (0.18799999356269836, 0.4390000104904175, 0.6899999976158142)
PASS  LV-4/CS-2 no colour in the file near quarantined accent red

13/13 checks passed
```

## What this does NOT prove

- That Natron loads this OCIO config inside a real shot comp — Natron
  2.5.0 is installed and verified on the VM and supports custom OCIO
  configs natively (verified at OpenColorIO's own documentation), but
  the first shot comp using the config is its first-run proof.
- That any renderer consumes the USD keys or the MaterialX look for a
  plate — for the 2D show these files are the data home of the house
  rules; consumption by the composite stage is by overlay parameters,
  per LIGHTING-SYSTEM.md section 9.
- Omniverse itself was not installed or run (it needs an NVIDIA RTX
  seat; see OMNIVERSE-TEARDOWN.md). Its functions are covered by the
  open pieces above, per the rebuild map.
