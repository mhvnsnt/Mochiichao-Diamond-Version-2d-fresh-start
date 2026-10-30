#!/data/data/com.termux/files/usr/bin/sh
# mochii phone seat — Termux setup (Route A)
#
# Run INSIDE Termux on the handset, from the copied kit folder:
#     sh termux-setup.sh
# What it does, in order:
#   1. sanity: arm64 phone, kit files present
#   2. verifies EVERY engine file's sha256 against transfer-manifest.json
#      (a mismatch is a hard stop that names the file — never a warning)
#   3. downloads the phone-seat GGUF (or uses a pre-copied one) and
#      verifies ITS sha256 the same way
#   4. lays out ~/mochii-seat/{bin,models} ready for start-server.sh
#
# Dry run (prints every step, touches nothing):  DRY_RUN=1 sh termux-setup.sh
# Pre-copied model instead of downloading:       MODEL_SRC=/path/to.gguf sh termux-setup.sh
set -eu

KIT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SEAT_DIR="$HOME/mochii-seat"
MANIFEST="$KIT_DIR/transfer-manifest.json"
MODEL_FILE="Qwen3-1.7B-Q4_K_M.gguf"
MODEL_URL="https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/main/Qwen3-1.7B-Q4_K_M.gguf"
MODEL_SHA256="b139949c5bd74937ad8ed8c8cf3d9ffb1e99c866c823204dc42c0d91fa181897"
MODEL_SIZE=1107409472
DRY_RUN=${DRY_RUN:-0}

say() { echo "[setup] $*"; }
run() { if [ "$DRY_RUN" = "1" ]; then echo "[dry-run] $*"; else eval "$*"; fi }

[ -f "$MANIFEST" ] || { say "ERROR: transfer-manifest.json not found next to this script."; exit 1; }

# --- 1. sanity -------------------------------------------------------------
ARCH=${ARCH_OVERRIDE:-$(uname -m)}   # ARCH_OVERRIDE exists for off-phone testing only
say "phone architecture: $ARCH"
if [ "$ARCH" != "aarch64" ]; then
  say "ERROR: this kit is arm64-only (aarch64). This phone reports $ARCH — stop and tell us."
  exit 1
fi

# Engine files are expected either in the kit root or in kit/bin/
BIN_SRC="$KIT_DIR"
[ -f "$KIT_DIR/bin/llama-server" ] && BIN_SRC="$KIT_DIR/bin"
[ -f "$BIN_SRC/llama-server" ] || { say "ERROR: llama-server not found in the kit folder ($KIT_DIR). Re-copy the whole kit."; exit 1; }

# sha256sum exists in Termux core utils; python3 is the fallback reader.
have_sha() { command -v sha256sum >/dev/null 2>&1; }
if ! have_sha && ! command -v python3 >/dev/null 2>&1; then
  say "Installing python (needed to read the manifest)…"
  run "pkg install -y python"
fi

# --- 2. verify engine hashes ----------------------------------------------
say "verifying engine files against transfer-manifest.json…"
if command -v python3 >/dev/null 2>&1 && [ "$DRY_RUN" != "1" ]; then
  python3 - "$MANIFEST" "$BIN_SRC" <<'PYEOF'
import json, hashlib, os, sys
manifest_path, bin_src = sys.argv[1], sys.argv[2]
data = json.load(open(manifest_path))
bad = 0
for f in data["engine"]["files"]:
    p = os.path.join(bin_src, f["name"])
    if not os.path.exists(p):
        print(f"[setup] MISSING: {f['name']}"); bad += 1; continue
    h = hashlib.sha256(open(p, "rb").read()).hexdigest()
    if h != f["sha256"]:
        print(f"[setup] HASH MISMATCH: {f['name']} (file is damaged — re-copy just this file)"); bad += 1
    else:
        print(f"[setup] ok: {f['name']}")
sys.exit(1 if bad else 0)
PYEOF
else
  # Fallback / dry-run: per-file sha256sum checks with the pinned values.
  check() { # name sha256
    if [ "$DRY_RUN" = "1" ]; then echo "[dry-run] verify $1  ($2)"; return 0; fi
    got=$(sha256sum "$BIN_SRC/$1" | cut -d' ' -f1)
    if [ "$got" != "$2" ]; then say "HASH MISMATCH: $1 (file is damaged — re-copy just this file)"; exit 1; fi
    say "ok: $1"
  }
  check llama-cli         12a68781bff2ec37a5ed83288d2ea2b8aab822f9489efae38041d4cb4d5dfc25
  check llama-server      536e51b1ec23254e49dd3e5923162d41d3de7a8d97de9911c26f992eec72d31e
  check libllama.so       462889cb9f4fba6a9e02e1c836a7a8dbbbbc3e62597792091dfd29cac34ccb72
  check libggml.so        29b062b2c543959c6bb21a57ab8d616b5d79c11636d9c11f4cb835af5aa38e59
  check libggml-base.so   7112fb494520b701d6b029ea744ed16093310d6442f6017fa33f6d3380b35122
  check libggml-cpu.so    76c38e4008a358f11d5f6d30d5be53ef3cc36ee3d889f8c4d330c7b70be8a6ba
  check libllama-common.so f48b7fe96a8d434777ac094d541cfa174901668f78c78fe6ad998ee84c21ad03
  check libllama-server-impl.so 3aec0f06139387eb60f1ef06faf85798a3fd7cc9fee4916fac02eb1c26bb343f
  check libllama-cli-impl.so    6ece938d5a74dd98690f7a11a0e2125a7b6d6511c25ff6b62605d059f73e5a39
  check libmtmd.so        b91b658494e3ec61d84bb96c7a38d1eca19f9e631b663bdebcb81bb4d0098760
fi
say "engine verified."

# --- 3. lay out the seat ----------------------------------------------------
run "mkdir -p '$SEAT_DIR/bin' '$SEAT_DIR/models'"
for f in llama-cli llama-server libllama.so libggml.so libggml-base.so libggml-cpu.so \
         libllama-common.so libllama-server-impl.so libllama-cli-impl.so libmtmd.so; do
  run "cp '$BIN_SRC/$f' '$SEAT_DIR/bin/$f'"
done
run "chmod +x '$SEAT_DIR/bin/llama-cli' '$SEAT_DIR/bin/llama-server'"

# --- 4. the model -----------------------------------------------------------
MODEL_DEST="$SEAT_DIR/models/$MODEL_FILE"
if [ -n "${MODEL_SRC:-}" ]; then
  say "using pre-copied model: $MODEL_SRC"
  run "cp '$MODEL_SRC' '$MODEL_DEST'"
elif [ -f "$MODEL_DEST" ]; then
  say "model already in place — verifying before reuse."
else
  if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
    say "Installing curl (needed to fetch the model)…"
    run "pkg install -y curl"
  fi
  say "downloading the model (~1.1 GB — stay on Wi-Fi)…"
  if command -v curl >/dev/null 2>&1; then
    run "curl -L --fail --retry 3 -o '$MODEL_DEST' '$MODEL_URL'"
  else
    run "wget -O '$MODEL_DEST' '$MODEL_URL'"
  fi
fi

if [ "$DRY_RUN" != "1" ]; then
  SZ=$(stat -c%s "$MODEL_DEST" 2>/dev/null || stat -f%z "$MODEL_DEST")
  if [ "$SZ" != "$MODEL_SIZE" ]; then
    say "ERROR: model size is $SZ, expected $MODEL_SIZE — the download is incomplete/damaged. Delete it and re-run."
    exit 1
  fi
  GOT=$(sha256sum "$MODEL_DEST" | cut -d' ' -f1)
  if [ "$GOT" != "$MODEL_SHA256" ]; then
    say "ERROR: model HASH MISMATCH — the file is damaged. Delete it and re-run."
    exit 1
  fi
  say "model verified: $MODEL_FILE"
fi

say "DONE. Start the brain with:  sh $KIT_DIR/start-server.sh"
say "Then open http://127.0.0.1:8080 in the phone browser."
