# TEARDOWN — Spotify Basic Pitch

## What it is

Basic Pitch (spotify/basic-pitch) is Spotify Audio Intelligence Lab's
automatic music transcription model: audio in → MIDI notes out, with pitch
bends. It is deliberately *lightweight* (a small CNN, ~17K parameters in the
core model) and instrument-agnostic — one model handles piano, guitar, bass,
voice and mixed single-source material, polyphonically.

## Licence — verified at source, 2026-10-28

- **Apache-2.0** — open source. Repo README: "basic-pitch is Copyright 2022
  Spotify AB. This software is licensed under the Apache License, Version 2.0."
  Code and the shipped model weights travel under the same Apache-2.0 grant.
- House consequence: no restrictions on pipeline use or on the MIDI it
  produces.

## How it works (mechanism, from the repo/paper description)

- Input is down-mixed to mono and resampled to 22,050 Hz.
- The network predicts, per ~11 ms frame (≈86 frames/s), three things:
  note activations (which pitches sound), note onsets (which pitches start),
  and continuous pitch contours (where between semitones each pitch sits —
  this is what becomes MIDI pitch bend, capturing vibrato/slides).
- A note-event post-process turns those predictions into discrete notes
  (start, end, pitch, amplitude) written as a Standard MIDI File, optionally
  with a CSV of note events and an NPZ of raw model outputs.
- Note range A0–C8. It works best on one instrument/source at a time; dense
  full mixes transcribe noisily (documented behaviour, confirmed by our smoke
  design: we feed it a lead stem, not a full bed).

## Why it earns the seat

The show's music workflow has two audio sources that were previously dead
ends for the score lane: (1) human hums/demos and casting-room melody ideas,
(2) ACE-Step generated beds and vocal-lead stems — audio with no notation.
Basic Pitch is the bridge: melody → editable MIDI → the score system can
re-voice it, register it, and hand it to the bed builder as data instead of
as an untouchable audio blob. It is also the analysis half of cry work:
a creature cry rendered by the cry synth can be transcribed to check its
contour against the species spec.

## Wiring

- Install: workspace venv, `pip install basic-pitch` (pulls librosa,
  pretty_midi and an inference backend — ONNX/TFLite/CoreML per platform).
- House entry point: `tools/transcribe_midi.py <in.wav> <out_dir>` — writes
  `<name>.mid` + `<name>.csv` note events and prints the note count and
  pitch range.
- Smoke: SMOKE-RECORDS.md §2 (EP01 opening bed's vocal-lead material,
  transcribed; note events recorded verbatim).
