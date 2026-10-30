# TEARDOWN — OpenAI Whisper

## What it is

Whisper (openai/whisper) is OpenAI's open automatic speech recognition (ASR)
system: a Transformer encoder–decoder trained on 680k hours of weakly
supervised audio, released September 2022. One model family (tiny → large-v3,
plus large-v3-turbo) covers transcription and translation across 99 languages,
with word/segment timestamps in the reference implementation's outputs.

## Licence — verified at source, 2026-10-28

- **MIT — code AND weights.** Repo LICENSE is the MIT License covering the
  release; OpenAI's model cards repeat it. This is the unusually clean case:
  no separate weights licence, no non-commercial clause.
- Not to be confused with OpenAI's *hosted* transcription APIs (paid
  proprietary service) — this package wires only the self-hosted open model.
  Nothing leaves the machine.

## Mechanism (what matters for the pipeline)

- Audio is resampled to 16 kHz mono, converted to an 80-channel log-Mel
  spectrogram, and decoded in 30-second windows with language/task tokens.
- Outputs: plain text, segment timestamps, and (via the JSON writer) per-segment
  confidence-adjacent fields (avg log-probability, no-speech probability) —
  the QA-usable signals.
- Known failure mode, documented and relevant: on silence, music, or
  non-speech audio Whisper can *hallucinate* plausible text. Any house use
  must gate on the no-speech probability and never treat output on non-speech
  audio as content. (Our smoke includes a music-only control segment so the
  behaviour is on record, not discovered later.)

## Verdict — where Whisper sits in the voice pipe

**Whisper is a measurement tool, not a content tool.** Three wired uses:

1. **Casting QA** — transcribe casting samples and TTS renders; diff against
   the script line. A render that doesn't transcribe back to its line is a
   failed render, measurably — this closes the loop the voice-kit opened
   (render queue → renders → *checked* renders).
2. **Subtitle-ration timing** — show law: subtitles appear only at important
   moments, and creatures never get word-subtitles (cries only). For the human
   lines that DO earn subtitles, Whisper's timestamps place them; the ration
   decision stays with the script, not the recognizer. Whisper never runs as
   an automatic subtitler over an episode.
3. **Script-vs-performance audit on the Wizard Gang side** — the same QA seat
   serves the voice-pipe renders there (cross-reference, no code moved).

Explicit non-uses: no diarization claims (stock Whisper has none), no
emotion/prosody reading, no transcripts of creature cries (they are not
speech; a "transcript" of a cry would be the hallucination failure above).

## Wiring

- Install: workspace venv, `pip install openai-whisper` (+ CPU torch).
- House entry point: `tools/whisper_qa.py <in.wav> [--expect "line"]` —
  transcribes with the `base` model, prints text + segments + mean no-speech
  probability, and when `--expect` is given, a word-error-rate against the
  expected line.
- Smoke: SMOKE-RECORDS.md §3 (real casting sample,
  `~/workspace/voice-casting-samples/refs/mochiko-ref.wav`, plus a music-only
  control from the EP01 beds).
