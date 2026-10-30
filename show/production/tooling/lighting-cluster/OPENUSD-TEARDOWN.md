# OpenUSD (Pixar) — teardown + pull-in

**What it is.** OpenUSD (Universal Scene Description) is Pixar's open
scene-description standard: a way to author, compose and exchange 3D
scene data — geometry, cameras, materials and **lights** — as layered,
composable files. It is the data backbone Omniverse is built on, and
the interchange format of the modern film/VFX pipeline. Governance:
Pixar (origin), stewarded with the Academy Software Foundation /
AOUSD ecosystem. Current integrations ship USD 25.x; the Python wheel
installed and validated here is **usd-core 26.11 (USD 0.26.11)**.

**Licence — OPEN SOURCE: Modified Apache 2.0.** The OpenUSD licence is
Apache License 2.0 with one change: Section 6 (Trademarks) is deleted
and replaced (Pixar's modification). Bucket: open source, Modified
Apache 2.0. (Historical note: pre-2024 releases were under Pixar's own
"TOST" licence; the project relicensed to the modified Apache text.)

**The ideas we take (construction kit):**
- **Layers + composition.** A stage is composed from ordered layers;
  stronger layers' *opinions* override weaker ones without editing
  them. This is LS-7 in file form: a colour shift is an opinion layer
  over base key data; delete the layer and the base returns exactly.
- **Lighting as data (UsdLux).** Lights are prims with typed inputs —
  intensity, colour, colour temperature (Kelvin, with
  `enableColorTemperature`), shape (Distant/Sphere/Dome/Rect…) — the
  same vocabulary our lighting sheets speak (key/fill/rim, temperature
  tells the time, LS-6).
- **Custom attributes as sheet fields.** A lighting sheet's prose
  fields (key source, fill description, rim duty, grade family) ride
  as namespaced attributes (`mochiichao:*`) on the key prim, so the
  data carries the sheet, not just the numbers.
- **References/payloads/variants** (not used in this first package):
  the mechanism by which one location's key set gets instanced across
  scenes and overridden per shot.

**What is wired here.**
- `usd/gate_keys.usda` — the Garden Gate key set from
  `show/bible/LIGHTING-SYSTEM.md` §3 as real USD: four keys
  (GATE-MORNING "First Bell", GATE-DAY "Keeper's Noon", GATE-DUSK
  "Last Errand", GATE-NIGHT "Board Light"), each with exactly one
  motivated key light (LS-5), a fill and a rim as UsdLux prims, the
  sheet fields as custom attributes, GATE-NIGHT's rim marked
  mandatory-on-dark-cast (LS-3), temperature *feel* values (LS-6 —
  labelled feel, not measurement; dusk's 3200K is the doc's own
  number), and the overlay shift model declared per key (LS-7).
- `usd/gate_keys_overrides.usda` — an opinion layer sublayering the
  base and strengthening GATE-DUSK's rim for one scene, base untouched.
- `usd/validate_gate_keys.py` — opens both files with the real library
  and checks the stage against the house rules (LS-3/5/6/7 + the CS-2
  accent-red quarantine over all authored values). **64/64 checks
  passed** on this VM; full output in TEST-RECORD.md.

**Honest limits.** Temperatures for morning/day/night-field are
encodings of the bible's words ("warm-neutral", "neutral daylight",
"cool field") as round Kelvin feels — marked as feel in the data.
Intensities are relative, not photometric; orientation encodes the
sheet's screen direction nominally. The package is the data home for
the keys; renders still happen in the composite stage, which reads
keys as overlay parameters (LIGHTING-SYSTEM.md §9). Extending to the
Pond/Green/Forest key sets is the same pattern; FOREST-NIGHT keeps its
owner-sign-off flag from the bible and is deliberately not encoded
yet.

Run it: `pip install usd-core` then
`python3 usd/validate_gate_keys.py`.
