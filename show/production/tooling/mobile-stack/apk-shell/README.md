# apk-shell — the Route C app

A minimal Android shell that turns the fabless pass's raw engine
into an installable app: **one Activity, zero dependencies** (no
AndroidX, no Gradle), built with the raw build-tools chain so the
whole build is auditable in one script.

## Files

- `AndroidManifest.xml` — package `ai.mochii.seat`, minSdk 28 /
  targetSdk 35, INTERNET + WAKE_LOCK, `extractNativeLibs=true`
  (load-bearing — see the manifest's own comment).
- `MainActivity.java` — model fetch + sha256 verify (pin shared
  with `../termux/transfer-manifest.json`), server subprocess
  launch from `nativeLibraryDir`, WebView onto
  `http://127.0.0.1:8080`.
- `build-apk.sh` — ecj → d8 → aapt2 → zip → zipalign → apksigner,
  with every input taken from env vars so the build is portable.
- `BUILD-RECORD.md` — the 2026-10-28 build: artifact hash, signer,
  toolchain checksums, and what remains first-run.

## The one trick worth knowing

Android will only execute binaries from an app's **native library
directory**, and it only unpacks files named `lib*.so` there. So
the `llama-server` executable rides in the APK as
`lib/arm64-v8a/libllama-server-bin.so`; its real libraries keep
their real names beside it. This is the standard pattern for
shipping a native daemon inside an APK — PHONE-ENGINE's route (b),
built.

## Known v1 limits (in writing)

- Debug-key signing (the F-Droid self-hosted repo step in
  `../MOBILE-STACK.md` §6 is where a release key + update channel
  enter).
- Server lives and dies with the app process — no foreground
  service yet, so Android may reclaim it on long idle.
- Model downloads over plain HTTPS from Hugging Face on first
  launch; the USB-copy path is the offline alternative.

## Next step when the shell grows

Gradle + AndroidX (both Apache-2.0) become worth their weight
when the shell gains a second screen, a foreground service, or
settings. Until then the hand-rolled chain is the more honest
artifact: five tools, one script, no dependency tree.
