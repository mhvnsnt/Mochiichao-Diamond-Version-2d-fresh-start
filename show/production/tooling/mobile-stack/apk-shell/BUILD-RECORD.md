# BUILD-RECORD — mochii-seat.apk, built and verified on this VM

**Date:** 2026-10-28. **Builder:** `build-apk.sh` (this folder), raw
build-tools chain — no Gradle, no Android Studio.

## The artifact

| | |
|---|---|
| File | `mochii-seat.apk` (build output; binaries are staged per the staging law, not committed to git — rebuild with `build-apk.sh`) |
| Size | 19,903,897 bytes (~19 MB) |
| sha256 | `50fb75284ad932fce4fd95b2485ef4d9bf045a4bb31dfac4aa2fe4d11ad01fd3` |
| Package | `ai.mochii.seat`, versionCode 1, versionName 0.1.0, minSdk 28, targetSdk 35 |
| Signature | APK Signature Scheme **v3 verified** (`apksigner verify`, re-run cold in a separate session after the build — PASS) |
| Signer | CN=Mochii Seat Debug, O=Mochii — RSA 2048, cert SHA-256 `46f02af7e6914dc09de0dd853cd31d5414bb918b65b278706aa9c62c54adf1e5` |
| Contents | compiled AndroidManifest.xml, resources.arsc, classes.dex (9,576 B), 10 native libs under `lib/arm64-v8a/` (stripped copies — hashes in the build log), META-INF signature set |

The native libs inside the APK are **stripped copies** of the fabless
build (282 MB of unstripped debug binaries → ~19 MB total APK). The
Termux route ships the originals; their hashes live in
`../termux/transfer-manifest.json`. Stripped-copy sha256s from this
build's log:

```
de7fe404a84262fdc391da42458bbc78ee1ac8fc6524f01856a6a4237617ff01  libggml-base.so
04e41b86ae6804d01451f0092af1104ccc717e7ac574066954a8c7a13cd325bd  libggml-cpu.so
d32b4bbebb1e5f880229c27c044f63373318077fd97c8ff7710374ece48e23a7  libggml.so
f2040b14ab4432176b14a39e6404a5a96991af5cce56e8fa0c66398b7d6f9e0e  libllama-cli-bin.so
433351506770d22fac0a2ac2fc91ad2b14ec9d51a54a7b6e33a313105f724c12  libllama-cli-impl.so
e866b13dc966d31e3b47eea885df8cc2c762317615b14310815b321a51b65482  libllama-common.so
9cf3dc75b011c8abfd8a2bbee3e089a5aab1b221af607805020aaa0ce579d709  libllama-server-bin.so
1fc0d098c608b71e0194476b628a79a58407d5f30e554c358c149d4c21079cab  libllama-server-impl.so
998a4f30af229052f73ebf0713c09c42ceb066957f275b35128a47b113176381  libllama.so
4ae10f2194886d8ebb2220d47833f8d5efd81615ea7d1b1f6505b499ee0567a9  libmtmd.so
```

## Toolchain provenance (every input checksum-verified before use)

| Input | Source | Checksum (verified) |
|---|---|---|
| platform-tools r37.0.1 (adb) | dl.google.com repository XML | sha1 `477254aa5f903c15cf51001717bdf347fb6b53e0` |
| platform android-35 | dl.google.com repository XML | sha1 `0bb560a90a7a2cbd0dd8348224d518b638fe7949` |
| build-tools 35.0.0 (aapt2 2.19, d8, apksigner, zipalign) | dl.google.com repository XML | sha1 `2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc` |
| Temurin JRE 17.0.21+9 | Adoptium API | sha256 `9f41bf88c7900c7097444a1bdeb84146ae692bc08842490ab098063c74bf9a8a` |
| ecj 3.33.0 (compiler) | Maven Central | sha1 `4041d27ffea3c9351e3121f9bfe94dea4723d583` (matches Maven's published .sha1) |
| Engine binaries | fabless pass build output (PR #69) | per-file sha256 in `../termux/transfer-manifest.json` |
| llvm-strip | NDK r27c (fabless pass staging) | — |

A note for the next agent, because it cost this pass real time:
this VM's filesystem handed several background download sessions a
divergent view — files "verified" inside those sessions were
truncated or stitched on re-read. Every artifact above was
therefore **re-verified cold in a separate session** before use,
and the downloads were rebuilt with an explicit-range parallel
fetcher (no `curl -C -` on ranges — it does not clamp to the range
end on resume). Trust only cold re-reads tonight.

## Keystore

`build-apk.sh` generated `mochii-seat-debug.keystore` (alias
`mochii-seat-debug`) on first run. It is **not** in git. Whoever
runs the first handset install must back that file up with the
repo's other keys: Android will refuse an "update" signed by a
different key, so losing it means uninstall + reinstall (the model
survives — it lives in the app's external files dir only until
uninstall; re-fetch is hash-checked, so recovery is boring, just
annoying).

## What is NOT proven by this record

The APK has never been installed on a handset. Install, first
launch (model fetch + hash check in-app), server start from
`nativeLibraryDir`, and the WebView chat are all **first-run**
items — the runbook's Route C checklist is where they get proven,
on the owner's Motorolas, with scrcpy watching (Route B).
