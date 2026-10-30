# Rhubarb lip-sync + Grease Pencil Onion Skin — researched controls

Sources checked 2026-10-28 via web search (not invented, not from the wiped
commit, which contained no such controls in the repo):

## OpenToonz / Rhubarb Lip Sync

- Rhubarb Lip Sync uses 6 basic mouth shapes + up to 3 extended shapes.
  Default extended set: GHX. Use `--extendedShapes GX` for only G and X,
  or `""` for only the 6 basic shapes.
- `--datUsePrestonBlair` (dat export only): maps alphabetic shapes to
  Preston Blair names for OpenToonz, which only supports Preston Blair names:
  A -> MBP, B -> etc, C -> E, D -> AI, E -> O, F -> U, G -> FV, H -> L, X -> rest.
  Caution from the docs: this mapping is applied at export, after animation.
  To control which shapes are used, use `--extendedShapes` with alphabetic names.
- `--datFrameRate` (dat export only): default 24.
- Always specify dialog text where possible: Rhubarb ignores dialog where it
  audibly differs from the recording, and benefits where it matches. Specifying
  text usually gives more reliable mouth animation even if not fully accurate.
- OpenToonz mouth level practice (from the lip-sync guide): a 10-frame level,
  Vector or Smart Raster recommended, drawings in this order: AI, E, O, U, FV,
  L, MBP, WQ (only phoneme ignored by Rhubarb), Etc. (C,D,G,K,N,R,S,TH,Y,Z),
  Rest (default when not speaking). Label each frame with a bright style
  used only for labels. Use onion skin to keep mouths positioned.
- Waveform scrub and Preferences path, and any optional OpenToonz lip-sync
  script, were named in the earlier handoff as "ready to append" but are NOT
  restated here with exact paths, because they were not verified in this
  search and are not in the repo. They remain to be verified against the
  OpenToonz build in use before being claimed as exact controls.
- Repo Rhubarb tooling that DOES exist (pre-force-push main):
  show/production/tooling/mouth-data/rhubarb_to_mouthdata.py + sample
  .json/.tsv/.dat. That converter is the wiring seat for these controls.

## Blender Grease Pencil Onion Skinning (Blender Manual)

- Main switch is in Viewport Overlays, but Grease Pencil onion skinning is
  PER-LAYER, toggled in the layer list.
- Mode: Keyframes (show keyframes in the Before/After range), Frames
  (show frames in the Before/After range), Selected (only manually selected
  keyframes in the Dope Sheet).
- Opacity: controls ghost frame opacity.
- Filter by Type: filters what type of frames to show in the range.
- Keyframes Before/After: how many frames or keyframes, depending on Mode,
  to show before and after the current frame.
- Custom Colors: Before color and After color for ghost frames.
- Display: View in Render (show onion skinning in final render, e.g. for a
  motion blur effect), Fade (ghost opacity decreases further from current
  frame), Show Start Frame / Loop (show first keyframe/frame as ghost when
  on the last frame, for loop animations). Naming varies slightly by Blender
  version (Loop vs Show Start Frame in 5.3 vs 4.x manuals).

## What this file is NOT

- It is not a claim that these controls are already in the repo notes file.
  They are not. They are ready to append, with sources above, once a clean
  repo base is chosen.

## Addendum 2026-10-28 — OpenToonz Auto Lip Sync path + waveform scrub (verified)

- OpenToonz Auto Lip Sync: File > Auto Lip Sync, provide the path to
  Rhubarb on the device, then right-click the mouth-shape column and
  choose "Apply Auto Lip Sync to Column". Rhubarb creates .dat switch
  data files understood by Moho and OpenToonz.
- Waveform scrub (OpenToonz Manual §14.11 Lip Synching, Release 1.5.0):
  examine the audio waveform in the scene column to spot word starts;
  scrub loaded audio clips with the current frame cursor in the
  Xsheet/Timeline frame ruler or in the Viewer framebar; drag the
  Xsheet/Timeline frame cursor forward/backward to scrub all audio
  levels whose Camera Stand toggle is active; drag the Viewer framebar
  cursor to scrub all audio columns whose Camera Stand toggle is active;
  Windows only: click and drag on the dashed strip on the audio level
  cells and the selected section plays back automatically.
- There is no separate "Preferences path" for Rhubarb in OpenToonz in
  this verified material: the path is supplied in the Auto Lip Sync
  dialog itself, not in a Preferences pane. Any earlier handoff naming
  a Preferences path was not verified and is NOT restated as exact.
- OpenToonz lip-sync manual method (non-auto): create mouth images,
  analyse audio, place mouth drawings by picking from the level strip
  or flipping through drawings with the Skeleton tool, check sync by
  scrubbing again while listening to the selected section (viewer shows
  the related frames).

## Addendum 2026-10-28 — Vocaloid 5 11 audio effects (NOT verified as a list)

- Yamaha V5 material says "11 kinds of audio effects" in the standard
  package, but the public sources checked in this pass do NOT give the
  exact 11 names for Vocaloid 5. A list found for Megpoid Talk
  (Compressor, RMS Compressor, DeEsser, Chorus, 2/6 Band EQ, Filter,
  PitchShift, PitchShiftRT, Delay, Reverb) is a DIFFERENT product and
  is NOT used as the V5 list here. The V5 effect names remain OWED
  pending the V5 manual / editor screenshot, and are not invented.
