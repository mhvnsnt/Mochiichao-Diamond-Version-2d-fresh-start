# VERDICT — Meta AudioCraft / MusicGen vs the house ACE-Step seat

**Disposition: DO NOT WIRE AudioCraft for production. No install performed.**
The comparison below is the deliverable the brief asks for when a target
fills no shippable gap: a written verdict, with the licence split stated
exactly.

## The licence split (verified at source, 2026-10-28)

AudioCraft is two different grants wearing one name:

- **Code: MIT** (facebookresearch/audiocraft LICENSE).
- **Model weights: CC-BY-NC 4.0** — the MusicGen and MusicGen-Style model
  cards state it verbatim: *"Code is released under MIT, model weights are
  released under CC-BY-NC 4.0."*

CC-BY-NC is the house **free-but-restricted** bucket: non-commercial use only.
Music generated with the shipped weights cannot be used in a shipped,
monetized show or game. Under the licence-honesty law that ends the
production conversation before features are compared: **any AudioCraft output
is scratch-only, forever, unless Meta re-licenses the weights.**

The house seat, by contrast (verified 2026-10-27 by the staging pass, at
source): the staged **ACE-Step 1.5 XL Turbo** snapshot is **MIT** (HF model
card `license: mit`; ACE-Step-1.5 repo LICENSE is MIT), trained — per the
project's own statement — on licensed + royalty-free/public-domain +
synthetic MIDI-to-audio data. The earlier ACE-Step v1 line was Apache-2.0.
Either way: **commercial-clean, outputs ship.**

## Feature comparison (for the record)

| Capability | ACE-Step 1.5 XL Turbo (house) | MusicGen / AudioCraft |
|---|---|---|
| Text→music | Yes | Yes |
| Vocals + lyrics | **Yes** (song-form generation) | **No** (instrumental only) |
| Long-form | Minutes-scale songs | Short clips (typically ≤30 s generations, extendable by continuation) |
| Melody conditioning | Via repaint/edit/extend flows | **Yes** (musicgen-melody: whistle/hum → arrangement) — its one distinctive strength |
| Style conditioning | Tag/lyric editing | MusicGen-Style (style excerpt) |
| Editing existing audio | Repaint / extend / edit tabs | Continuation only |
| Speed class | Turbo: seconds for minutes of audio on a 4090-class seat | Autoregressive; slower per second of audio |
| Output licence | MIT-clean | **CC-BY-NC — cannot ship** |
| House state | Weights staged byte-verified (19,953,378,268 B); first generation still owed | Not staged; would need ~1.2–13 GB more weights for NC-scratch use |

## Is there ANY gap AudioCraft fills?

Named candidates, honestly graded:

1. **Melody-conditioned arrangement** (hum a tune → get an arrangement) is the
   one thing ACE-Step's flow does less directly. But the house already gets
   the *input* side of that workflow from this wave's Basic Pitch wiring
   (hum → MIDI), and the arrangement side can be driven from MIDI by the
   score/bed tooling — with shippable outputs. AudioCraft's version of the
   same trick produces NC-locked audio. **Not a shippable gap.**
2. **EnCodec** (AudioCraft's audio tokenizer) is MIT-*code* and occasionally
   useful as analysis tooling — but the house has no named consumer for raw
   audio tokens today (MuseTalk carries its own bundled stack). Wiring it
   speculatively would be a duplicate install for its own sake. **Rejected;
   revisit only if a named consumer appears.**
3. **MAGNeT** (AudioCraft's faster non-autoregressive model) — same weights
   licence problem. **Rejected on the same ground.**

## Bottom line

ACE-Step stays the single house music-generation seat. AudioCraft is
recorded here as **evaluated and rejected on licence**, not on quality: if
Meta ever re-releases the MusicGen weights under a commercial-clean licence,
the melody-conditioning row above is the reason to reopen this verdict.
Until then it is not installed, not staged, and no pipeline step may depend
on it.
