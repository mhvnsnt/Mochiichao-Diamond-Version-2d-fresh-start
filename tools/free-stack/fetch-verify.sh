#!/usr/bin/env bash
# fetch-verify.sh — pull all 10 Harmony + free-stack tools from the two
# verified releases and check size + SHA-256. Binaries are NOT stored in
# this repo; they live on the releases. Already-verified binaries are NOT
# re-downloaded.
#
#   Harmony release:     harmony-equivalents-20261120 (id 452975939)
#   Free-stack release:  production-stack-free-20261120 (id 452720539)
#   Both on mhvnsnt/dream-girl.
#
# Tahoma2D 1.6.3 (best single Harmony equivalent) is NOT re-pulled here —
# it is already wired in dream-girl main tools/tahoma2d/ + release
# toolchain-dcc-v1. See tools/harmony/HARMONY-COMPARISON.md.
#
# Usage: ./fetch-verify.sh [dest-dir]   (default: ./tools-bin)
# Requires: gh (authenticated), sha256sum, stat. Exit non-zero on any
# size/hash mismatch.
# NOTE: the Contents API cannot set the exec bit — after checkout run
# `chmod +x tools/free-stack/fetch-verify.sh` once.
set -euo pipefail

REPO="mhvnsnt/dream-girl"
DEST="${1:-./tools-bin}"
mkdir -p "$DEST"

fail=0

# args: release asset-pattern expected-size expected-sha256
fetch_verify() {
  local release="$1" pattern="$2" size="$3" sha="$4"
  local file="$DEST/$pattern"
  # Douga's asset name carries a browser-download timestamp prefix; the
  # pattern below is a glob, so the on-disk name is resolved after download.
  if [ "$pattern" = '*douga-windows.zip' ]; then
    file="$(ls "$DEST"/*douga-windows.zip 2>/dev/null | head -n 1 || true)"
  fi
  if [ -n "${file:-}" ] && [ -f "$file" ]; then
    if [ "$(stat -c%s "$file")" = "$size" ] && \
       echo "$sha  $file" | sha256sum -c --quiet - 2>/dev/null; then
      echo "OK (cached, verified): $file"
      return 0
    fi
    echo "STALE/MISMATCH, re-downloading: $file"
    rm -f "$file"
  fi
  echo "Downloading $pattern from $release ..."
  gh release download "$release" --repo "$REPO" --pattern "$pattern" --dir "$DEST" --clobber
  if [ "$pattern" = '*douga-windows.zip' ]; then
    file="$(ls "$DEST"/*douga-windows.zip 2>/dev/null | head -n 1 || true)"
  fi
  if [ -z "${file:-}" ] || [ ! -f "$file" ]; then
    echo "FAIL: $pattern did not land in $DEST" >&2; fail=1; return 1
  fi
  local got_size got_sha
  got_size="$(stat -c%s "$file")"
  got_sha="$(sha256sum "$file" | awk '{print $1}')"
  if [ "$got_size" != "$size" ]; then
    echo "FAIL: $file size $got_size != expected $size" >&2; fail=1; return 1
  fi
  if [ "$got_sha" != "$sha" ]; then
    echo "FAIL: $file sha256 $got_sha != expected $sha" >&2; fail=1; return 1
  fi
  echo "OK (downloaded, verified): $file"
}

HARMONY_REL="harmony-equivalents-20261120"
FREE_REL="production-stack-free-20261120"

# --- Harmony stack (4) ---
fetch_verify "$HARMONY_REL" "SynfigStudio-1.5.5-linux64.appimage" 115539968 b85aabc26f690a0c150d2143c656c17f358b73abbedf8d01007f15a7a95740e9
fetch_verify "$HARMONY_REL" "glaxnimate-x86_64.AppImage" 182682816 e0f39cf67b79e80cdbbe8b3d858cab8a7b142e1c17f5944eb09af55fbc4a6347
fetch_verify "$HARMONY_REL" "enve.AppImage" 150658760 00b7081f0dfb8545c6eee31034407305cf63c630a002bd391fa1504eab01b1c0
fetch_verify "$HARMONY_REL" "Wick.Editor-1.19.0.AppImage" 216087317 92ff24c6f162e0144108d6dd47bf5f6d6ca6972d405c21b73c6da3a7d35f059b

# --- Free stack (6) ---
fetch_verify "$FREE_REL" "anicraft-0.2.1-linux-x86_64.AppImage" 19024376 352456384d1e82f373d836dcbcd9f1473b1603c5c9c7b185d763218470091b31
fetch_verify "$FREE_REL" "pencil2d-linux-amd64-v0.7.2.AppImage" 60471800 4034b036258b6a13d4540911ebce085f31ee18a9dacf438845ac71998d42ff91
fetch_verify "$FREE_REL" "Rigby2D_0.5.1_amd64.AppImage" 96979448 27afa7de71a43e2fe45f27e605176a62b9a559db4b7f5f00f3a105870bdbd6ee
fetch_verify "$FREE_REL" "Olive-8ac191ce-Linux-x86_64.AppImage" 154107880 30a6c0d18dfb4ff77addd06984348656fd69d153cfa913eb3cde56a60aa14160
fetch_verify "$FREE_REL" "kdenlive-26.08.3-x86_64.AppImage" 214346232 2c8322edfc86605e4c98a78a019310d9b4fc46bb8e94e6fe313dc7dd987e7671
fetch_verify "$FREE_REL" "*douga-windows.zip" 3766009 bf3bd41c5593736caf4b7d74ebcf4c00c52766691c3596f3d3c7b34a9ea0b774

if [ "$fail" -ne 0 ]; then
  echo "fetch-verify: FAILURES — see above" >&2
  exit 1
fi
echo "fetch-verify: all 10 tools present, size + SHA-256 verified in $DEST"
