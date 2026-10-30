# SMOKE RECORDS — music & voice wave (verbatim run outputs)

Environment for all smokes: this VM (CPU-only), workspace venv at
`~/workspace/music-wave-build/venv` (Python 3.12.3), TMPDIR on workspace
disk. Torch 2.14.1 / numpy 2.5.4 / scipy 1.18.1 are provided to the wave
venv from the Wielder venv's site-packages via a `.pth` bridge (read-only;
the Wielder environment was not modified) after the proxy proved too slow
to re-download the CPU torch wheel inside this session — noted here so the
record shows exactly what ran where. Tool versions: pedalboard 0.9.26.

## §1 Pedalboard — WIRED, smoked on real show audio (2026-10-28)

Inputs (real files, cited):
- Voice chain: `~/workspace/voice-casting-samples/mochiko/candidate-1.wav`
  (24 kHz mono, 1.925 s casting sample) staged as `voice_in.wav`.
- Bed chain: first 30 s of `~/workspace/ep01-finish/audio/EP01-V3-OP.wav`
  (48 kHz stereo finished OP bed) staged as `op30.wav`.

Run output (verbatim):

```
$ pedalboard_chain.py voice_in.wav voice_out.wav --chain voice
chain=voice sr=24000 frames=46200
in : peak=0.2810 rms=0.0518
out: peak=0.5241 rms=0.0822
wrote voice_out.wav

$ pedalboard_chain.py op30.wav op30_bed.wav --chain bed
chain=bed sr=48000 frames=1441792
in : peak=0.8913 rms=0.1518
out: peak=0.9150 rms=0.1815
wrote op30_bed.wav
```

Loudness measured with FFmpeg loudnorm analysis (input_i / input_tp):

| File | LUFS-I | True peak |
|---|---|---|
| voice_in.wav | −24.28 | −10.93 dBTP |
| voice_out.wav | **−20.08** | **−5.50 dBTP** |
| op30.wav | −13.60 | −1.00 dBTP |
| op30_bed.wav | **−12.18** | **−0.75 dBTP** |

Reading: the voice chain lifts a quiet casting line by +4.2 LU
(presence EQ + compression working as designed; ceiling respected —
out peak 0.5241, well under the −1 dB limiter threshold, because the input
was quiet). **Measured caveat:** the bed chain's output true peak is
−0.75 dBTP, above the house −1 dBTP ceiling — Pedalboard's limiter is a
sample-peak limiter, not a true-peak limiter. House rule confirmed by
measurement: Pedalboard chains are a *sweetening* stage; the FFmpeg
loudnorm spine (−14 LUFS / −1 dBTP) remains the final stage of every
deliverable. The chain does not replace it.

## §2 Basic Pitch — WIRED, smoked on real show audio (2026-10-28)

Input (real file, cited): `~/workspace/ep01-finish/assets/audio/vocal-lead.wav`
— the 41.1 s vocal-lead mixer stem the EP01 beds were arranged from
(BEDS.md). First 30 s staged as `vocal_lead30.wav`. Backend: ONNX
(onnxruntime 1.31.1) with basic-pitch 0.4.0 — the package's declared
TensorFlow extra is not required when the ONNX backend is present
(verified by this run; TF not installed).

Run output (verbatim, warnings trimmed):

```
$ transcribe_midi.py vocal_lead30.wav bp_out/
  Creating note events...
  🌸 Saved to bp_out/vocal_lead30_basic_pitch.csv
notes=59 pitch_min=59 pitch_max=74 duration_s=29.80
wrote bp_out/vocal_lead30_basic_pitch.mid
BP_SMOKE_RC=0
```

Outputs: `vocal_lead30_basic_pitch.mid` (4,630 B) +
`vocal_lead30_basic_pitch.csv` (6,177 B, 59 note events). First CSV rows
(start, end, pitch, velocity, pitch-bend series — bends present, as the
teardown describes):

```
start_time_s,end_time_s,pitch_midi,velocity,pitch_bend
29.05452789115646,29.797566439909296,64,89,-3,1,1,1,...
28.613348752834465,28.833938321995465,64,54,0,0,0,0,...
28.17216961451247,28.5088589569161,62,87,-2,1,1,1,...
27.986409977324264,28.17216961451247,61,91,1,1,1,1,...
27.49750702947846,27.729706575963718,61,94,-1,1,1,1,...
```

Reading: 59 notes across MIDI 59–74 (B3–D5) from a sung lead stem — the
melody is now editable MIDI data in the score lane's hands, which is the
seat this tool was wired for. Install battle scars, for the record: pip's
default resolution backtracks basic-pitch to 0.2.6 (which pins numpy<1.24
and cannot build on Python 3.12); the working route is the pinned set in
requirements.txt with the ONNX backend. A transient sandbox
"Disk quota exceeded" (Errno 122) killed two install attempts mid-run and
then cleared — retries succeeded unchanged.

## §3 Whisper — WIRED, smoked on real casting audio + a non-speech control (2026-10-28)

Tool: openai-whisper 20250625, model `base` (145,262,807 B;
sha256 `ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e`
— verified against the hash embedded in the installed whisper package's
model URL table; Whisper's own first download failed its SHA check on
this VM's proxy and was replaced by a range-chunk-assembled copy that
passed the same gate). CPU run (FP32 fallback warning, as logged).

Inputs (real files, cited):
- Speech: `~/workspace/voice-casting-samples/refs/mochiko-ref.wav`
  (24 kHz mono, 6.675 s casting reference) staged as `speech_in.wav`.
- Control: first 20 s of `~/workspace/ep01-finish/audio/EP01-V3-N1.wav`
  (dawn bed — room tone, events and creature cries, NO human speech)
  staged as `control_nonspeech.wav`.

Run output — speech (verbatim, from `whisper_smoke.log`):

```
$ whisper_qa.py speech_in.wav --model base
language=en segments=1
[  0.00-  6.50] no_speech=0.215 :: Good morning, Garden. The gate is open, the pond is calm, and everybody gets breakfast before anything else.
mean_no_speech_prob=0.215
text: Good morning, Garden. The gate is open, the pond is calm, and everybody gets breakfast before anything else.
```

Run output — control (verbatim, from `whisper_control.log`):

```
$ whisper_qa.py control_nonspeech.wav --model base
language=en segments=3
[  0.84-  2.06] no_speech=0.574 :: DREAM
[  8.12-  8.76] no_speech=0.574 :: Ah
[ 14.00- 24.00] no_speech=0.574 :: Uro
mean_no_speech_prob=0.574
text: DREAM Ah Uro
CONTROL_RC=0
```

Reading: on real speech the base model returns one clean segment
covering the full line at low no-speech probability (0.215) — usable
for casting/TTS QA against the scripted line. On the non-speech control
it does the documented Whisper thing: it **hallucinates text**
("DREAM", "Ah", "Uro") out of room tone and cries — and note the third
segment is even timestamped past the end of the 20 s file (14.00–24.00)
as recorded in the log. The defence is measured, not hoped: the
control's mean no_speech_prob is 0.574 vs 0.215 for real speech, so the
house QA gate treats high no-speech segments as *no speech present* and
never lets a Whisper transcript become subtitles on its own. This is
exactly why Whisper sits in the pipe as a measurement tool under the
subtitle-ration law, not as an auto-subtitler — and why creature cries
are never transcribed (they are sound, not words; see
TEARDOWN-whisper.md).
