# TEST-RECORD — what was actually run, and what has not been

Discipline: nothing in this package is "proven" past the line
where it was actually executed. VM-side results below are from
2026-10-28, run against the real artifacts. Everything handset-
side is marked FIRST-RUN and stays that way until a handset run
is recorded here.

## VM-side (executed, recorded)

### Script syntax
```
$ bash -n termux-setup.sh   -> syntax OK
$ bash -n start-server.sh   -> syntax OK
$ bash -n stop-server.sh    -> syntax OK
```

### Arch guard (the kit refuses the wrong machine)
```
$ sh termux-setup.sh        (on this x86_64 VM)
[setup] phone architecture: x86_64
[setup] ERROR: this kit is arm64-only (aarch64). This phone reports x86_64 — stop and tell us.
```

### Dry run (ARCH_OVERRIDE=aarch64 DRY_RUN=1, scratch kit)
Prints, in order: the architecture line; all 10 per-file
`[dry-run] verify <name> (<sha256>)` lines with the manifest's
pins; `engine verified.`; every `cp`/`chmod` into
`~/mochii-seat/{bin,models}` as `[dry-run]` lines; the model
fetch as one `[dry-run] curl -L --fail --retry 3 -o
'…/mochii-seat/models/Qwen3-1.7B-Q4_K_M.gguf'
'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf'`;
and the closing start instructions. Nothing was written.

### Real hash verification (the script's own python path, scratch
kit assembled from the fabless build's actual bin/)
```
[setup] ok: llama-cli
[setup] ok: llama-server
[setup] ok: libllama.so
[setup] ok: libggml.so
[setup] ok: libggml-base.so
[setup] ok: libggml-cpu.so
[setup] ok: libllama-common.so
[setup] ok: libllama-server-impl.so
[setup] ok: libllama-cli-impl.so
[setup] ok: libmtmd.so
exit: 0
```
10/10 against the manifest — and the manifest's values came from
`sha256sum` of the build output itself, not from any document.

### Model pins
Read from the Hugging Face API (repo trees + LFS oids) on
2026-10-28. The 1.1 GB GGUF was **not** downloaded to this VM
(staging law — weights pull on the target; here the target is the
phone). Its sha256 rests on the LFS oid, which for LFS/Xet repos
is the content hash — the same mechanism grok-local's manifest
relies on for its server variants.

### APK
Built + signature-verified, then re-verified cold in a separate
session. Full record: `../apk-shell/BUILD-RECORD.md`.

### Toolchain
platform-tools r37.0.1 `adb --version` → 1.0.41 (runs);
aapt2 → 2.19-11948202 (runs); JRE 17.0.21 Temurin (runs);
keytool (runs); d8 via the build (produced classes.dex, 9,576 B).

## Handset-side (FIRST-RUN — nothing below has happened yet)

- [ ] Route A end-to-end on either phone (setup → verify → serve)
- [ ] Route A airplane-mode answer (the flagship proof)
- [ ] tok/s stats read off the phone — replaces the 10–20 tok/s
      estimate class in PHONE-ENGINE with a measurement
- [ ] Route B: `adb devices` clean after the owner's one-time
      taps; one scrcpy screenshot of the running seat
- [ ] Route C: `mochii-seat.apk` installs; first launch fetches +
      verifies the model in-app; server answers in the WebView
- [ ] Same checklist on the second phone

Exact procedures + success lines: `../SIDELOAD-RUNBOOK.md`.
When a box gets ticked, the result (with the phone model + the
tok/s number) gets written into this file — estimates never get
quietly upgraded.
