# GREEN — provenance (Work Package B, EP01 gap-fill, 2026-10-28)

Base: `EP01-PLATE-green-day-v0-spec-still.png` (this folder, registry §4) —
md5 `2439b9676a98d84a9cf0c72d8e699c9c`. That base is itself a **provisional
spec plate** (procedural, not canon painted art — GAP-green-canon stays
open). The output below is a **DERIVED grade of a provisional base** and is
never to be presented as canon art.

Process: `grade_plates.py green` (kept in this folder; Pillow + NumPy,
deterministic, dapple seed 20261028).

## Day finish still — DERIVED
- `EP01-PLATE-green-day-v1-derived-still.png` — md5
  `1c9d73ae1157ce46006c2a53ddd3f1c3`, 1280×720.
- Key of record: GREEN-DAY "Canopy Dapple" (Lighting System §3: *sun
  through canopy — dappled, broken key / green atmosphere bounce,
  atmosphere only / leaf-edge yellow-green rim / temp warm-neutral / grade
  Signature Day with Ocean-green lean*).
- **Check against the provisional first:** the provisional still is
  uniform flat light — measured and viewed, it has NO dapple pattern at
  all — so it differs from the key and a finish was produced (not a
  status-only change).
- Treatment:
  1. dapple layer — deterministic soft light patches (seeded blobs,
     gaussian-blurred) multiplying luminance 0.90–1.10 → the broken canopy
     key as a light layer (Lighting L7: shifts are layers, never
     repaints);
  2. warm-neutral balance in highlights → warm-neutral temperature;
  3. yellow-green lift on the brightest values → leaf-edge rim read at
     grade level;
  4. saturation ×1.05 → the Green keeps the fullest saturation in the
     show (Colour System: saturation is the Green's mood dial).
- Measured (mean RGB): base 108.8/169.6/114.6 → finish 109.2/172.0/111.7,
  with the dapple layer adding local luminance variation the flat base
  lacked (viewed and confirmed 2026-10-28).
