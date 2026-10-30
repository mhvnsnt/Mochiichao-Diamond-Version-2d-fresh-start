# POND — provenance (Work Package B, EP01 gap-fill, 2026-10-28)

Base for both grades: `EP01-PLATE-pond-day-v0-spec-still.png` (this folder,
registry §2) — md5 `40365a232823d32a916f1ba422a7a619`. That base is itself a
**provisional spec plate** (procedural, not canon painted art —
GAP-pond-canon stays open). Both outputs below are **DERIVED grades of a
provisional base** and are never to be presented as canon art.

Process for both: `grade_plates.py` (kept in this folder; Pillow + NumPy,
deterministic).

## Dawn still — DERIVED (the N1 / V3-002 plate)
- `EP01-PLATE-pond-dawn-v1-derived-still.png` — md5
  `527fbdcc7c89196b371dc3bb101efd69`, 1280×720.
- Key of record: POND-MORNING "Flat Water" (Lighting System §3: *open-sky
  key / fill: water bounce from below / white sparkle rim on wet edges /
  temp neutral-cool / grade Ocean family, lightest step*). Staging V3-002:
  "pond-day plate at dawn grade".
- Treatment: cool colour balance (B up, R down) → neutral-cool; overall
  lift → lightest Ocean step, flat open-sky key; extra cyan-leaning
  luminance lift on the lower (water) half → fill arriving from below;
  saturation ×0.92 → dawn-muted Ocean; highlight whitening → white sparkle
  read on wet edges at grade level.
- Measured (mean RGB): base 108.7/178.1/179.4 → dawn 127.2/202.9/214.1
  (brighter, cooler: B−R gap 70.7 → 86.9).

## Day finish still — DERIVED
- `EP01-PLATE-pond-day-v1-derived-still.png` — md5
  `c63c692d9af7e2ec980a6300a43d4fbe`, 1280×720.
- Key of record: POND-DAY "Ripple Key" (*sun + moving caustic bounce / fill
  water / bright broken caustic rim at the surface line / temp neutral /
  grade Ocean*).
- **Check against the provisional first:** the provisional still's
  temperature is already neutral (no warm/cool cast to correct), so the
  day finish does NOT move temperature. It differs from the key in two
  grade-level ways only: saturation sits muted for full Ocean, and the
  highlights carry no sparkle lift. Treatment: saturation ×1.10 → full
  Ocean; contrast ×1.05 about mid-grey → sun key separates from the water
  fill; highlight whitening → bright broken sparkle at the surface line,
  grade level only.
- Measured (mean RGB): base 108.7/178.1/179.4 → day finish
  103.0/182.9/184.5 (saturation/contrast up, temperature unchanged).
- **Limitation, stated plainly:** the *moving* caustic rim is the living
  plate's shimmer cycle (AMB-POND-SHIMMER-01, registry §2), not something a
  still grade can or should bake in.
