# TEARDOWN — Spotify Pedalboard

## What it is

Pedalboard (spotify/pedalboard) is Spotify's Python audio-effects and
processing library, released 2021 and actively maintained. It wraps the JUCE
audio framework (the C++ core behind much of the pro-audio plugin world) into a
scriptable Python API: load audio → run a chain of built-in plugins → render,
all offline, deterministically, from code.

## Licence — verified at source, 2026-10-28

- **GPL-3.0** — open source, copyleft. Repo README/LICENSE: "pedalboard is
  licensed under the GNU General Public License v3."
- Bundled pieces and their terms (from the same README): JUCE 6 core
  (dual-licensed GPLv3/commercial), VST3 SDK (GPLv3), Rubber Band time-stretch
  (dual commercial/GPLv2+), LAME MP3 encoder (LGPLv2, upgraded to GPLv3 for
  inclusion), libgsm (ISC), dr_wav (public domain).
- **House consequence:** Pedalboard is wired as a pipeline *tool* — scripts in
  this repo call it at production time. GPL obligations attach to distributing
  Pedalboard or derivatives of it, not to audio it processes. Nothing
  GPL-licensed is embedded in the game or show deliverables.

## What it does (the parts the pipeline uses)

- **I/O:** WAV/MP3/FLAC/OGG/AIFF read/write at arbitrary sample rates
  (`pedalboard.io.AudioFile`), plus raw-buffer processing.
- **Built-in plugin set** (JUCE-derived): Compressor, Limiter, Gain, Highpass/
  Lowpass filters, PeakFilter EQ, HighShelf/LowShelf, Chorus, Phaser, Delay,
  Reverb, Distortion, Clipping, NoiseGate, PitchShift, Resample, MP3/GSM
  compressors (bitrate-crush effects), Convolution (IR reverb).
- **Hosting:** can host external VST3/AU plugins (`load_plugin`) — the bridge
  to any pro plugin the owner later licenses, without changing pipeline code.
- **Time/pitch:** `pedalboard.time_stretch` (Rubber Band) for tempo-fitting
  beds and cries without pitch change.

## Why it earns the seat (vs what the house had)

The pipeline previously processed audio inside one-off tools (bed builder,
cry synth, TTS renders) with FFmpeg filters as the only shared effects layer.
FFmpeg filters are fine for loudness and fades; they are a poor seat for
*designed* chains (voice presence EQ → gentle compression → de-ess-style shelf
→ limiter) that must be versioned, repeated per character, and A/B'd.
Pedalboard chains are plain Python objects — they live in git, diff cleanly,
and run identically on every seat. The house chain for voice lines ships in
this package: `tools/pedalboard_chain.py`.

## Wiring

- Install: workspace venv, `pip install pedalboard` (see requirements.txt).
- House entry point: `tools/pedalboard_chain.py <in.wav> <out.wav>
  [--chain voice|bed]` — `voice` = HPF 80 Hz → presence PeakFilter +3 dB @
  3 kHz → Compressor (3:1, −18 dB) → Limiter (−1 dB ceiling);
  `bed` = gentle shelf + compressor glue → limiter.
- Smoke: SMOKE-RECORDS.md §1 (real EP01 audio, measured in/out loudness).
