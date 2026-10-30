# Key reverse-engineered full stack — staging manifest (clean landing)

Owner instruction 2026-10-28: key reverse-engineering full-stack software
and tools and different industry-standard things that we can wire up and
stage them, make sure they land cleanly.

Staging location (this folder, not main):
- `staged/` mirrors repo paths exactly, so a clean PR can be built from it
  without re-mapping paths: `staged/docs/...` and
  `staged/show/production/tooling/music-wave/...`
- Top-level files in this folder (INDEX, notes, expansion, research) are
  the source copies. `staged/` is a copy, not a second source. Edit the
  top-level copy, then re-copy to `staged/`.

## Clean-landing rules (non-negotiable, from standing rules)

1. Additions only. No file is deleted, no full file is overwritten with a
   placeholder. Append, never replace. Any diff deleting >20 lines must
   be intentional and called out in the PR body.
2. No force-push, no direct push to main. PR only, with the six-section
   instruction-gate body (owner quote, specified method, actual method,
   deviations, proof, self-check).
3. Sync to latest main BEFORE starting and again BEFORE committing.
   If main is an orphan single-file commit (as 93114e0d is now), STOP:
   do not land into it. Restoring the full repo tree is an owner decision.
4. No binaries, no installers, no serials, no keys, no patchers in any
   staged file. Paid / proprietary tools are METHOD REFERENCES ONLY.
5. Verify by playing / running, not by code inspection alone. A chain
   script must compile; a doc must be read back from the branch after
   the commit; a PR must be checked for mergeable state and file counts.
6. No V6 ranges in V5 sections, no invented parameters, no invented
   canon. Gaps are named, not filled with guesses.

## Key stack, by stage, with staging status

### 1. Storyboard / animatic
- Blender Grease Pencil + OpenTimelineIO (OTIO) — STAGED (docs, research)
- Onion Skinning: per-layer, Modes Keyframes/Frames/Selected, Opacity,
  Filter by Type, Before/After, Custom Colors, Fade, View in Render,
  Show Start Frame/Loop — STAGED (research file, Blender Manual)

### 2. Modeling / rigging
- Blender + RyModel, Tissue, LoopTools/BSurfaces, Instant Meshes —
  REFERENCED in full-stack studio summary; staging in ep1-farm opensource
  pulls (prior lane), not re-pulled here
- Rigify / CloudRig for NEW bodies only; Alisa/Cape rigs unchanged —
  STANDING RULE, not a staged file here
- MPFB2/MakeHuman + MakeClothes, MustardUI, Cloth Lab, FreeSewing,
  Seams — prior lane staging, referenced not re-pulled

### 3. Animation / mocap
- Rokoko retarget, CMU mocap (pull clips on demand, data terms),
  pose libraries — REFERENCED, prior lane
- OpenToonz multiplane (16 FLD default, sky 48 FLD example), linked
  palettes, timing 24 fps on threes, visemes 8-12 — STAGED (notes file)

### 4. Cutout / generative / composite
- Wan / VACE-first likeness lock, no IP-Adapter on Wan stack —
  STAGED (notes file)
- CutOut, Kavij isnet-anime, rembg, ComfyUI nodes — STAGED (notes file)
- Satsuei composite order: plate, character layers, composite shadows
  (never baked), effects, grade — STAGED (notes file)
- DaVinci Resolve free / Fusion composite stage — STAGED (notes file)
- Rhubarb Lip Sync: 6 basic + up to 3 extended (default GHX),
  --datUsePrestonBlair mapping, --datFrameRate 24, mouth level order
  AI/E/O/U/FV/L/MBP/WQ/Etc/Rest — STAGED (research file)
  Repo converter: mouth-data/rhubarb_to_mouthdata.py (pre-force-push)

### 5. Lighting / rendering / pipeline standards
- Poly Haven / ambientCG HDRIs, one locked OCIO/ACES config —
  REFERENCED, prior lane
- Cycles GPU: Kaggle main, Colab T4 second, local CPU fallback —
  STANDING RULE
- OpenUSD, OpenColorIO, OpenImageIO, MaterialX, OpenEXR, OpenVDB,
  OTIO, Alembic — industry standards, REFERENCED
- Render farm: Flamenco, OpenCue — REFERENCED, prior lane
- Blender write-block / FIFO-stdout render pipeline — issue-fixing
  pull, REFERENCED

### 6. Audio / music / voice (Mochi Chao repo, this thread)
- Vocaloid 5 + Avanna (method only, owned install NOT staged) —
  STAGED (notes file + vocal doc + expansion file)
  Install order, CHA reversed, Yameii ranges, VEL, VSTi, no double-formant
- Digital Fairy / Yameii chain, Deko dual-bus, 20-module DSP targets —
  STAGED (notes file + vocal doc)
- Pedalboard (GPL-3.0), Basic Pitch (Apache-2.0, NewTone replacement),
  Whisper (MIT, QA only), Chatterbox/Kokoro voice renders —
  STAGED (music-wave tools + teardowns)
- Digital Fairy Pedalboard chain (HPF 150 Hz, presence, comp, 60 ms
  slapback human bus, limiter -1 dB) — STAGED (tools/digital_fairy_chain.py)
  Formant/OTT/Soothe/vocoder/YIN tuner — OWED, custom builds, named in file
- House loudness spine: FFmpeg loudnorm -14 LUFS / -1 dBTP — STANDING,
  NOT changed by -7 to -9 LUFS mastering benchmark
- Sample rate: 44.1 kHz internal, 48 kHz bug fixed 5.6.2+ — STAGED
- Cape Jones exception: owner voices ALL Cape lines himself, never
  synthesized — STANDING, restated in expansion file

### 7. Delivery
- Game: GLB. Show: MP4. Music: WAV stems + loudnorm spine.
- Mochi Chao game live site (Netlify) — checked in this thread, no
  version label, empty-roster new game, inconclusive build age from UI
  alone. Not staged here, not claimed as current.

## What is OWED (not staged, not claimed)

- Custom DSP code: ZDF SVF EQ, true cepstral/LPC formant warping,
  LR4 OTT, 2048-STFT Soothe, Bark vocoder, split-band 808, Haas/all-pass
  widener, YIN/pYIN + TD-PSOLA tuner.
- Exact V5 numeric ranges beyond the landed Yameii set; exact names of
  the 11 V5 audio effects; exact FL Studio VST3 vs VST2 behaviour in
  the user's FL version; live Vocaloid session re-measurement.
- OpenToonz Preferences path / waveform scrub / optional lip-sync script
  exact paths (named in handoff, unverified, not restated as exact).
- Full repo-tree restore on main (orphan 93114e0d). Owner decision.
- 2.64 GB Vocaloid 5 installer: owned, NOT staged, NOT downloaded here.

## Verification (this staging, 2026-10-28)

- `staged/` file list and byte counts were checked after copying.
- No staged file contains a serial, key, patcher, or installer binary.
- No staged file is a placeholder. The notes file is 23,836 bytes.
- Chain script compiles (py_compile, __pycache__ removed after check).
