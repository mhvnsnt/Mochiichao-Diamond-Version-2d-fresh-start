#!/bin/bash
# build-apk.sh — hand-rolled Route C build: manifest + one Java file +
# the fabless engine set -> signed mochii-seat.apk, no Gradle, no Android
# Studio. The chain is the raw build-tools standard:
#   ecj (compile) -> d8 (dex) -> aapt2 (package) -> zip (add dex+libs)
#   -> zipalign -> apksigner (sign + verify)
#
# Inputs (env, with the defaults this pass used on the build VM):
#   JAVA_HOME   a JRE/JDK 17 (d8 + keytool + apksigner run on it)
#   ANDROID_SDK folder holding platforms/android-35 + build-tools/35.0.0
#   ECJ_JAR     Eclipse compiler jar (javac substitute; or set JAVAC=javac
#               to use a real JDK's compiler instead)
#   ENGINE_BIN  folder with the fabless build's bin/ (llama-cli, llama-server,
#               lib*.so) — see ../../fabless-stack/llamacpp/build-android.sh
#   LLSTRIP     llvm-strip from the NDK (libs are stripped for the APK only;
#               the Termux route ships the originals, hash-pinned)
#   KEYSTORE    signing keystore (default: ./mochii-seat-debug.keystore,
#               generated on first run — BACK IT UP: losing it means
#               uninstall-before-update on the handset, per SIDELOAD-RUNBOOK)
# Output: ./out/mochii-seat.apk + out/BUILD-LOG.txt
set -euo pipefail
cd "$(dirname "$0")"

: "${JAVA_HOME:?set JAVA_HOME to a JRE/JDK 17}"
: "${ANDROID_SDK:?set ANDROID_SDK to the SDK folder}"
export PATH="$JAVA_HOME/bin:$PATH"
BT="$ANDROID_SDK/build-tools/35.0.0"
ANDROID_JAR="$ANDROID_SDK/platforms/android-35/android.jar"
ENGINE_BIN="${ENGINE_BIN:?set ENGINE_BIN to the fabless build bin/ folder}"
LLSTRIP="${LLSTRIP:-llvm-strip}"
KEYSTORE="${KEYSTORE:-./mochii-seat-debug.keystore}"
KS_PASS="${KS_PASS:-mochii-debug}"
OUT=out
rm -rf "$OUT"; mkdir -p "$OUT/lib/arm64-v8a" "$OUT/classes" "$OUT/dex"
LOG="$OUT/BUILD-LOG.txt"; : > "$LOG"
step() { echo "== $*" | tee -a "$LOG"; }

step "keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KS_PASS" -keypass "$KS_PASS" \
    -alias mochii-seat-debug -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=Mochii Seat Debug, O=Mochii" >>"$LOG" 2>&1
  echo "generated $KEYSTORE — back it up (see header)" | tee -a "$LOG"
fi

step "compile (ecj${JAVAC:+ / javac})"
if [ -n "${JAVAC:-}" ]; then
  javac -source 8 -target 8 -cp "$ANDROID_JAR" -d "$OUT/classes" MainActivity.java >>"$LOG" 2>&1
else
  : "${ECJ_JAR:?set ECJ_JAR (or JAVAC=javac with a full JDK)}"
  java -jar "$ECJ_JAR" -8 -cp "$ANDROID_JAR" -d "$OUT/classes" MainActivity.java >>"$LOG" 2>&1
fi

step "dex (d8)"
"$BT/d8" --lib "$ANDROID_JAR" --output "$OUT/dex" $(find "$OUT/classes" -name '*.class') >>"$LOG" 2>&1

step "native libs (strip copies for the APK; originals stay hash-pinned for Termux)"
for f in libllama.so libggml.so libggml-base.so libggml-cpu.so libllama-common.so \
         libllama-server-impl.so libllama-cli-impl.so libmtmd.so; do
  cp "$ENGINE_BIN/$f" "$OUT/lib/arm64-v8a/$f"
  "$LLSTRIP" "$OUT/lib/arm64-v8a/$f" || echo "strip skipped for $f" >>"$LOG"
done
# The executables ride as lib*.so — the only form Android will extract from
# an APK into the executable nativeLibraryDir.
cp "$ENGINE_BIN/llama-server" "$OUT/lib/arm64-v8a/libllama-server-bin.so"
cp "$ENGINE_BIN/llama-cli"    "$OUT/lib/arm64-v8a/libllama-cli-bin.so"
"$LLSTRIP" "$OUT/lib/arm64-v8a/libllama-server-bin.so" || true
"$LLSTRIP" "$OUT/lib/arm64-v8a/libllama-cli-bin.so" || true
sha256sum "$OUT"/lib/arm64-v8a/* >>"$LOG"

step "package (aapt2 link)"
"$BT/aapt2" link -o "$OUT/unsigned.apk" -I "$ANDROID_JAR" \
  --manifest AndroidManifest.xml --min-sdk-version 28 --target-sdk-version 35 >>"$LOG" 2>&1

step "add dex + libs"
( cd "$OUT" && cp unsigned.apk withdex.apk && zip -q withdex.apk dex/classes.dex \
  && zip -q -0 withdex.apk lib/arm64-v8a/*.so )

step "align + sign + verify"
"$BT/zipalign" -f -p 4 "$OUT/withdex.apk" "$OUT/aligned.apk"
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-pass "pass:$KS_PASS" \
  --out "$OUT/mochii-seat.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify --verbose --print-certs "$OUT/mochii-seat.apk" | tee -a "$LOG"
"$BT/aapt2" dump badging "$OUT/mochii-seat.apk" | head -3 | tee -a "$LOG"
sha256sum "$OUT/mochii-seat.apk" | tee -a "$LOG"
step "DONE: $OUT/mochii-seat.apk"
