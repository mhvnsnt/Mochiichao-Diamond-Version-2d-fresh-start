# SIDELOAD-RUNBOOK — getting the brain onto the phone, three ways

Plain words, exact steps. **Your part is small and it is marked
every time with 👉 OWNER TAP.** Everything not marked is ours —
commands we run, files we prepared, hashes we check. Do the routes
in order the first time: A proves the engine on your phone in
minutes, B lets us drive the phone from the desk afterwards, C is
the app you end up keeping.

What you're installing, in one breath: a pocket brain — the
llama.cpp engine plus the Qwen3-1.7B model (about 1.1 GB) — that
runs **on the phone's own chip**. No account, no server, works in
airplane mode once it's on there.

---

## ROUTE A — Termux (no computer, no cable, no settings surgery)

The 5-minute proof. Termux is a free, open-source terminal app
(GPL-3.0) that gives the phone a Linux-style command line. Our
engine runs inside it, untouched.

**Before:** phone on Wi-Fi (the model is ~1.1 GB), charger nearby.

1. 👉 **OWNER TAP — install Termux.** Install **F-Droid** first
   (from f-droid.org — Android will ask you to allow installs from
   your browser once; say yes), open F-Droid, install **Termux**.
   *Why F-Droid's build:* the Play Store build is years out of
   date. F-Droid's build and the GitHub build are both official —
   just never mix them later (different signatures; pick F-Droid
   and stay there).
2. 👉 **OWNER TAP — get the kit onto the phone.** We hand you a
   folder named `mochii-phone-kit` (from the repo / TeraBox / USB —
   any way you like). Put it in the phone's **Download** folder.
   It contains the engine files and the `termux/` scripts from this
   package — about 285 MB. (The model is *not* in it; the script
   fetches it in step 4 so its hash can be checked fresh.)
3. 👉 **OWNER TAP — three lines in Termux.** Open Termux and type
   (or paste) exactly:
   ```
   termux-setup-storage
   cp -r ~/storage/downloads/mochii-phone-kit/termux ~/mochii-kit
   cd ~/mochii-kit && sh termux-setup.sh
   ```
   `termux-setup-storage` pops one Android permission box —
   👉 **tap Allow** (that's how Termux can see the Download folder).
4. **Ours (automatic):** the script checks the phone is arm64,
   verifies **every engine file's hash** against
   `transfer-manifest.json` (a single mismatch stops it cold and
   says which file), downloads the model from Hugging Face,
   verifies **its** hash, and lays everything out in
   `~/mochii-seat/`.
5. 👉 **OWNER TAP — start it.** In Termux:
   ```
   sh ~/mochii-kit/start-server.sh
   ```
   Keep Termux open (or swipe it into a persistent notification —
   the script takes a wake-lock so the phone doesn't sleep it).
6. 👉 **OWNER TAP — talk to it.** Open the phone's browser (or the
   grok-local PWA) and go to **http://127.0.0.1:8080**. That's the
   brain's own chat page, served by the phone itself.
   **Success looks like:** the page loads, you type a sentence, the
   answer types itself out at reading speed, and a stats line shows
   tokens/sec. *That number is the first real measurement of this
   seat — it replaces every estimate in our docs.*
7. **Airplane-mode proof (the flagship test):** turn on airplane
   mode, ask it something new. It still answers. That's the whole
   point, proven.
8. **Stop it:** `sh ~/mochii-kit/stop-server.sh`, or just close
   Termux.

*If a hash fails:* don't re-run blindly — tell us the filename the
script printed. A failed hash means the copy is damaged; re-copying
that one file is the fix, and the script says which.

## ROUTE B — adb (you tap four things once; we drive everything after)

adb is Google's official bridge (free, part of the SDK). It lets
the workstation push files, install apps, start things, read logs,
and mirror the screen (scrcpy) — this is how *we* verify a phone
run instead of asking you to describe the screen.

**One-time owner taps (per phone):**

1. 👉 **Settings → About phone → tap "Build number" 7 times.**
   (Motorola may ask for your lock-screen PIN partway — that's
   Android, not us.) A toast says "You are now a developer."
2. 👉 **Settings → System → Developer options → turn ON
   "USB debugging".** (On some Motorola builds it's under
   Settings → System → Advanced → Developer options.)
3. 👉 **Plug the phone into the computer with a USB cable**, set
   the USB mode notification to **File transfer** if it asks.
4. 👉 **"Allow USB debugging?" box appears on the phone** — tick
   **"Always allow from this computer"** and tap **Allow**. This is
   the one security decision in the whole route: it trusts *this*
   computer's key. Only ever allow it for your own machine.

**Ours, after that (commands we run on the workstation):**

```
adb devices                       # phone shows as "device", not "unauthorized"
adb push mochii-phone-kit /sdcard/Download/        # the Route A kit, pushed for you
adb install mochii-seat.apk                        # Route C app, when built
adb shell am start -n ai.mochii.seat/.MainActivity # launch it
adb logcat -s MochiiSeat                           # watch its log live
scrcpy                                             # mirror + control the screen here
```

With B done once, every future phone test is: we push, we launch,
we watch the mirrored screen, you just hold the phone. To undo the
trust later: Developer options → "Revoke USB debugging
authorizations".

## ROUTE C — the APK (the keeper)

`mochii-seat.apk` (built from `apk-shell/` in this package, signed
with our debug key) wraps the same engine + server in a normal app:
tap the icon → it unpacks the engine (first launch only) → starts
the server → shows the chat page full-screen.

1. 👉 **OWNER TAP — install it.** Open the APK from wherever it
   sits (Download folder / Files app). Android asks once to let
   that app "install unknown apps" — 👉 allow it for this install.
   (Route B's `adb install` skips even this.)
2. 👉 **OWNER TAP — give it the model.** First launch shows one
   line of text: it needs the model file. Either it downloads it
   itself (~1.1 GB, hash-checked against the same manifest), or —
   fully offline — copy `Qwen3-1.7B-Q4_K_M.gguf` into the folder it
   names on screen (`Android/data/ai.mochii.seat/files/models/`)
   by USB. Then tap **Start**.
3. **Success looks like:** the chat page fills the screen and
   answers — same success lines as Route A step 6, minus Termux.

Honest limits of this shell, in writing: it's signed with a
**debug key** (fine for your own phones; the F-Droid-repo step in
MOBILE-STACK §6 is where a real release key enters), it holds the
server inside the app (close the app = server stops), and Android
may still battery-optimize it away on long idle — the runbook fix
(Settings → Apps → Mochii Seat → Battery → Unrestricted) is a
👉 owner tap if it ever bites.

## What we will NOT ask you to do

- No rooting, ever. No bootloader unlock. No "disable Play
  Protect" (a debug-signed personal APK doesn't need it, and if
  anything ever asks, stop and tell us).
- No typing long commands on the phone keyboard beyond Route A's
  three lines — everything long is a script we wrote or a command
  we run over adb.
- No account sign-ups for the phone seat. (Qualcomm/MediaTek SDK
  accounts exist in the delegate teardown as *documentation* —
  nobody needs one to run this seat.)

## First-run checklist (the proof we record)

- [ ] Route A: server answers at 127.0.0.1:8080 on the handset
- [ ] Route A: airplane-mode answer (the flagship proof)
- [ ] Route A: tok/s stats line read off the phone — both phones
- [ ] Route B: `adb devices` clean + one scrcpy screenshot of the
      running seat
- [ ] Route C: APK installs + first launch serves the chat page
- [ ] Results written back into `termux/TEST-RECORD.md` (handset
      section) — estimates replaced by measurements, per house law
