# mobile-stack — the phone seat's deployment layer

How the llama.cpp engine the fabless pass built (PR #69) gets
**onto the owner's phones** — and everything around that moment:
signing, distribution, acceleration verdicts, and verification.

## Read in this order

1. **`MOBILE-STACK.md`** — the ten-link map: the vertical chain
   (build → sign → install → run → accelerate → verify) and the
   horizontal matrix across both of the owner's Motorolas, every
   licence verified at source, every link graded
   HAVE / PARTIAL / GAP.
2. **`SIDELOAD-RUNBOOK.md`** — the three routes in plain words
   (Termux / adb / APK), with the owner's physical taps marked
   👉 and everything else named as ours.
3. **`DELEGATES-TEARDOWN.md`** — NNAPI / QNN / NeuroPilot, graded
   per chip. Headline: CPU is the proven class on both phones;
   no NPU claim is made anywhere in this programme.
4. **`termux/`** — the Route A kit: `termux-setup.sh` (hash-
   verifying installer), `start-server.sh`, `stop-server.sh`,
   `transfer-manifest.json` (every crossing byte, pinned),
   `TEST-RECORD.md` (what actually ran; handset items honestly
   still open).
5. **`apk-shell/`** — the Route C app: manifest, one Java file,
   hand-rolled build script, and the build record for the signed
   `mochii-seat.apk` produced on this VM.

## Cross-references (siblings — never edited from here)

- Engine + seat design: `../fabless-stack/llamacpp/PHONE-ENGINE.md`
- Model manifest of record + the browser door of the same seat:
  `../../wielder/grok-local/MODEL-MANIFEST.md`, its PWA, and its
  serving manifest.
- Wielder's client contract (the phone serves the same
  OpenAI-shaped endpoint): `../../wielder/grok-local/` serving kit.

## Status in one line

Deployment stack: **built and VM-verified** (kit tested, hashes
real, APK signed + cold-verified). Handset runs: **first-run** —
the runbook names the exact owner taps; nothing else is owed by
anyone but us.
