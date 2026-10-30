#!/bin/bash
# build-android.sh — cross-compile the llama.cpp engine for Android arm64.
# Fabless Stack, phone seat (link 8 runtime / link 2 toolchain).
#
# This is the exact build run for this package's smoke record
# (see ../smoke/SMOKE-RESULTS.md). Re-runnable on any Linux box:
# it fetches nothing itself except via git; the NDK is a tool download
# (Google, ~664 MB) that the operator stages once.
#
#   1. Get the NDK:  https://dl.google.com/android/repository/android-ndk-r27c-linux.zip
#      unzip it, export ANDROID_NDK_HOME=<path>/android-ndk-r27c
#   2. Get the source: git clone https://github.com/ggml-org/llama.cpp
#   3. Run this script from the llama.cpp checkout.
#
# Products (build-android/bin/ + build-android/common/):
#   libllama.so, libggml*.so  -> drop into an APK under lib/arm64-v8a/
#   llama-cli, llama-server   -> Termux/no-shell route (see PHONE-ENGINE.md)
set -euo pipefail

: "${ANDROID_NDK_HOME:?export ANDROID_NDK_HOME to the unzipped NDK r27c}"

cmake -B build-android \
  -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_HOME/build/cmake/android.toolchain.cmake" \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-28 \
  -DCMAKE_BUILD_TYPE=Release \
  -DLLAMA_CURL=OFF \
  -DBUILD_SHARED_LIBS=ON

cmake --build build-android -j"$(nproc)" --target llama-cli llama-server

echo "=== artifacts ==="
find build-android \( -name "llama-cli" -o -name "llama-server" -o -name "libllama.so" \) \
  -exec file {} \;
