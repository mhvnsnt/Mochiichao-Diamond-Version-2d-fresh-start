# OpenColorIO (ASWF / Academy) — teardown + pull-in

**What it is.** OpenColorIO (OCIO) is the film industry's colour
management standard: one config file that tells every tool in a
pipeline how colours move between working space, display and files —
so a grade decided in one room is the grade seen in every room.
Governed by the Academy Software Foundation (an Academy of Motion
Picture Arts and Sciences project). Current release: **v2.6.0**
(validated here with the matching Python package).

**Licence — OPEN SOURCE: BSD-3-Clause.** Bucket: open source,
BSD-3-Clause (LICENSE file in the OpenColorIO repo).

**Natron support — verified at OCIO's own documentation:** "Natron is
an open source 2D compositor that ships with native support for OCIO.
By default Natron uses the nuke-default config, but much like Nuke,
users can also point to custom configs and create OCIO colorspace
conversions within their node graph." Natron 2.5.0 (GPL-2.0) is
already installed and verified as this pipeline's composite seat
(`show/production/tooling/TOOLS-MANIFEST.md`), so the config below has
a real seat to plug into: set the OCIO environment variable / Natron's
OCIO config path to `ocio/config.ocio` and the graph's OCIO nodes pick
up the house spaces, views and looks. (First shot comp on it = the
first-run proof; see TEST-RECORD.md's limits.)

**The slot it fills.** `show/production/UNIFIED-PIPELINE.md` already
names the working-space plan — "linear/ACES via OpenColorIO in Natron
(32-bit float)" — but no config existed anywhere in the repo. This
package supplies it: `ocio/config.ocio`.

**What the config implements — as far as a config honestly can:**
- **Working space:** ACEScg scene-linear (AP1), scene reference
  ACES2065-1, display through the ACES 1.0 SDR video output transform
  to sRGB; sRGB texture input path. Built only from OCIO 2.6's own
  builtin transforms (exact style names probed against the installed
  library before writing).
- **LS-1/LS-2 protection, mechanically:** protected identity material
  (model-sheet fills, mask-white, ink, subtitle cards) is assigned the
  colorspace **"Protected Identity - Data"** (`isdata: true`). OCIO
  *never* transforms data — the checker proves a protected value
  (Dorowani deep blue #3070b0) passes through unchanged while the same
  value on the working path transforms. Protection is architectural:
  which colorspace a layer travels in. A config cannot mask layers —
  keeping protected layers on the data path stays a lighting-sheet
  gate item (LIGHTING-SYSTEM.md §8.2), and this config does not claim
  otherwise.
- **LS-2 environment colour, only as Looks:** two named looks in
  ACEScg CDL form — "ENV - Cool Night Field" (GATE-NIGHT class) and
  "ENV - Warm Dusk Field" (GATE-DUSK class) — exposed as display views
  so an environment layer can be previewed/graded with them. Looks
  apply to environment/atmosphere layers only; CS-2 spirit check: the
  checker verifies neither look can push a neutral environment sample
  anywhere near the quarantined accent red #a03436.
- **LS-7:** a shift = selecting a look on the environment layers;
  removing it returns the base exactly (nothing is baked).

**Validation.** `ocio/check_config.py` — **16/16 checks passed** with
the real library (config parses, roles/data flag correct, data
passthrough exact, display path renders, looks cool/warm in the right
directions, quarantine distances healthy). Full output in
TEST-RECORD.md. See also `ocio/README.md` for the composite-stage
plug-in note.
