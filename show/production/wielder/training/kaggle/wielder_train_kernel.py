# Wielder Train — Kaggle kernel script (fixed re-run of the failed
# 2026-10-28 SDXL LoRA job). Launch is Doro's step, through the browser;
# this file is the packaged, ready-to-run script.
#
# What is fixed versus the failed run, point by point against its log:
#   1. Trainer pin: the failed run's `git checkout cb70b9685899`
#      (a truncated hash) errored "pathspec did not match" and the run
#      silently continued on an unpinned HEAD. Here the checkout uses
#      the TAG v0.12.3 and HEAD is verified against the full pinned
#      commit; any mismatch aborts loudly (SystemExit) before setup.
#   2. Requirements: the failed run's pip install broke on upstream
#      requirements.txt line 58 (`-e .` resolved against the wrong
#      working directory), leaving ftfy uninstalled. Here pip installs
#      requirements-wielder.txt (that line removed by design, ftfy
#      pinned first-class), and the install's return code is checked —
#      a failed install aborts, it is never waved through.
#   3. Preflight as step 0: wielder_train/preflight.py imports every
#      dependency (ftfy first), verifies the trainer pin by file hash,
#      and verifies the dataset layout. PREFLIGHT_FAIL = kernel stops,
#      no GPU time spent.
#   4. Bookkeeping: per-character TRAIN_DONE <char> rc <n> lines, and a
#      final COLLECTED manifest (JSON) listing every produced
#      .safetensors with bytes + sha256, written to
#      /kaggle/working/out-collect/sdxl-lora-files.json.
#   5. Package staging (v1 of THIS kernel died here, 2026-10-28 12:10
#      CDT, before preflight): v1 assumed PKG was already present at
#      /kaggle/working/wielder-training, but a kernel's working dir
#      starts empty except its own code file — nothing ever staged the
#      package, so the requirements install hit "No such file or
#      directory" and the run aborted. Here main() stages the package
#      FIRST: if PKG already holds requirements-wielder.txt +
#      wielder_train/preflight.py it prints PKG_ALREADY_PRESENT, else
#      it searches /kaggle/input recursively for the attached package
#      dataset, copytrees it to PKG and prints PKG_STAGED <source>, and
#      aborts loudly if the package dataset is not attached.
#   6. Base model (same v1 gap class): v1 only looked in the HF cache,
#      which is empty in a fresh kernel. Here, if no Illustrious-XL
#      .safetensors is found in the HF cache or under /kaggle/input,
#      the file is downloaded from HF repo OnomaAIResearch/
#      Illustrious-XL-v2.0 (the .safetensors whose size matches the
#      verified 6938040674 bytes) and size-verified before use.
#
# Expected Kaggle setup (set by the launcher in the web UI):
#   Accelerator: GPU T4 x2 (one GPU is used by the recipe; fp16 SDXL)
#   Datasets attached: marsfmmg/mochiichao-likeness-datasets
#                      marsfmmg/mochiichao-wielder-training
#                      (this package: requirements + wielder_train +
#                      configs — staged automatically by step 5 above)
#   Base model: Illustrious-XL-v2.0 (OnomaAIResearch), 6938040674
#   bytes — found in the HF cache / attached input if present, else
#   downloaded from the HF repo by step 6 above (ILLUSTRIOUS_VERIFIED
#   6938040674, as the failed morning run verified).
import hashlib
import json
import os
import shutil
import subprocess
import sys

WORK = "/kaggle/working"
PKG = os.path.join(WORK, "wielder-training")   # this package, uploaded as a dataset/code file set
TRAINER = os.path.join(WORK, "sd-scripts")
PIN_TAG = "v0.12.3"
PIN_COMMIT = "cb70b96858477e716a2096292ab8aab433277f38"
DATA_SRC_GLOBS = [
    "/kaggle/input/datasets/marsfmmg/mochiichao-likeness-datasets",
    "/kaggle/input/mochiichao-likeness-datasets",
]
INPUT_ROOT = "/kaggle/input"
BASE_MODEL_REPO = "OnomaAIResearch/Illustrious-XL-v2.0"
# Exact file the failed 2026-10-28 morning run downloaded from this
# repo and verified at 6938040674 bytes (its own kernel script,
# likeness-stack/kaggle/sdxl-lora-train/mochiichao-sdxl-lora-train.py,
# hf_hub_download filename + ILLUSTRIOUS_VERIFIED log line).
BASE_MODEL_FILENAME = "Illustrious-XL-v2.0.safetensors"
BASE_MODEL_BYTES = 6938040674


def run(cmd, **kw):
    print("+ " + " ".join(cmd), flush=True)
    return subprocess.run(cmd, **kw).returncode


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def abort(msg):
    print("WIELDER_ABORT " + msg, flush=True)
    raise SystemExit(1)


def _pkg_complete(path):
    return (os.path.isfile(os.path.join(path, "requirements-wielder.txt"))
            and os.path.isfile(os.path.join(path, "wielder_train",
                                            "preflight.py")))


def stage_package(pkg=PKG, input_root=INPUT_ROOT):
    """Stage the wielder-training package into the working dir.

    A Kaggle kernel's working dir starts empty except its own code
    file, so the package must arrive as an attached dataset and be
    copied out of /kaggle/input. Aborts loudly if it is not attached.
    """
    if _pkg_complete(pkg):
        print(f"PKG_ALREADY_PRESENT {pkg}", flush=True)
        return pkg
    src = None
    if os.path.isdir(input_root):
        for root, _dirs, files in os.walk(input_root):
            if "requirements-wielder.txt" in files and _pkg_complete(root):
                src = root
                break
    if src is None:
        abort("wielder-training package dataset not attached")
    if os.path.isdir(pkg):
        shutil.rmtree(pkg)
    shutil.copytree(src, pkg, symlinks=False)
    print(f"PKG_STAGED {src}", flush=True)
    return pkg


def find_base_model(roots=None):
    """Return the path of an Illustrious-XL .safetensors under the HF
    cache or /kaggle/input, or None if there is none."""
    if roots is None:
        roots = [os.path.expanduser("~/.cache/huggingface/hub"), INPUT_ROOT]
    for base in roots:
        if not os.path.isdir(base):
            continue
        for root, _d, files in os.walk(base):
            for name in sorted(files):
                if name.startswith("Illustrious-XL") \
                        and name.endswith(".safetensors"):
                    return os.path.join(root, name)
    return None


def ensure_base_model(model_dir=None):
    """Return the verified Illustrious-XL path, downloading it from
    Hugging Face first if no copy exists locally. Size is verified
    against BASE_MODEL_BYTES; any mismatch aborts."""
    model = find_base_model()
    if model is None:
        if model_dir is None:
            model_dir = os.path.join(WORK, "base-model")
        os.makedirs(model_dir, exist_ok=True)
        try:
            from huggingface_hub import HfApi, hf_hub_download
        except ImportError:
            abort("huggingface_hub not installed — cannot download "
                  "Illustrious-XL base model")
        filename = None
        # First try the exact file the failed morning run verified.
        try:
            model = hf_hub_download(repo_id=BASE_MODEL_REPO,
                                    filename=BASE_MODEL_FILENAME,
                                    local_dir=model_dir)
            filename = BASE_MODEL_FILENAME
        except Exception as e:
            print(f"BASE_MODEL_EXACT_DOWNLOAD_FAILED {e}", flush=True)
            model = None
        if model is None:
            try:
                info = HfApi().model_info(BASE_MODEL_REPO,
                                          files_metadata=True)
                for sib in info.siblings:
                    if sib.rfilename.endswith(".safetensors") \
                            and getattr(sib, "size", None) \
                            == BASE_MODEL_BYTES:
                        filename = sib.rfilename
                        break
            except Exception as e:
                print(f"BASE_MODEL_LIST_FAILED {e}", flush=True)
        if filename is None:
            # Fallback: snapshot the repo's .safetensors files and take
            # the one whose size matches the verified byte count.
            try:
                from huggingface_hub import snapshot_download
                snap = snapshot_download(repo_id=BASE_MODEL_REPO,
                                         allow_patterns=["*.safetensors"],
                                         local_dir=model_dir)
            except Exception as e:
                abort(f"Illustrious-XL download failed: {e}")
            for root, _d, files in os.walk(snap):
                for name in sorted(files):
                    p = os.path.join(root, name)
                    if name.endswith(".safetensors") \
                            and os.path.getsize(p) == BASE_MODEL_BYTES:
                        model = p
                        break
                if model is not None:
                    break
            if model is None:
                abort("no .safetensors of verified size "
                      f"{BASE_MODEL_BYTES} in {BASE_MODEL_REPO}")
        elif model is None:
            # The API listing named a size-matching file; download it.
            try:
                model = hf_hub_download(repo_id=BASE_MODEL_REPO,
                                        filename=filename,
                                        local_dir=model_dir)
            except Exception as e:
                abort(f"Illustrious-XL download failed: {e}")
        print(f"ILLUSTRIOUS_DOWNLOADED {filename or model}", flush=True)
    if os.path.getsize(model) != BASE_MODEL_BYTES:
        abort(f"Illustrious-XL size {os.path.getsize(model)} "
              f"!= verified {BASE_MODEL_BYTES}: {model}")
    print(f"ILLUSTRIOUS_VERIFIED {os.path.getsize(model)} {model}",
          flush=True)
    return model


def main():
    log_lines = []

    # --- step -1: stage THIS package from its attached dataset ------
    # (NEW FIRST STEP: a fresh kernel's working dir is empty except its
    # own code file; v1 never staged the package and died on the
    # requirements path. This must run before anything reads PKG.)
    stage_package()

    # --- dataset staging (layout the failed run verified: 114 files) ---
    data_src = next((p for p in DATA_SRC_GLOBS if os.path.isdir(p)), None)
    if data_src is None:
        abort("likeness dataset not attached")
    data_dst = os.path.join(WORK, "data")
    if os.path.isdir(data_dst):
        shutil.rmtree(data_dst)
    shutil.copytree(data_src, data_dst, symlinks=False)
    print(f"DATASET_LAYOUT_EXTRACTED {data_src}", flush=True)

    # --- trainer at the verified pin ---
    if os.path.isdir(TRAINER):
        shutil.rmtree(TRAINER)
    if run(["git", "clone", "-q", "--branch", PIN_TAG,
            "https://github.com/kohya-ss/sd-scripts.git", TRAINER]) != 0:
        abort("trainer clone failed")
    head = subprocess.run(["git", "-C", TRAINER, "rev-parse", "HEAD"],
                          capture_output=True, text=True).stdout.strip()
    if head != PIN_COMMIT:
        abort(f"trainer HEAD {head} != pinned {PIN_COMMIT}")
    print(f"TRAINER_PIN_VERIFIED {head}", flush=True)

    # --- complete requirements, rc checked (the ftfy fix) ---
    req = os.path.join(PKG, "requirements-wielder.txt")
    if run([sys.executable, "-m", "pip", "install", "-q", "-r", req]) != 0:
        abort("requirements install failed")
    print("REQUIREMENTS_INSTALLED", flush=True)

    # --- base model: find it, or download it from HF, then verify ---
    # (v1 only looked in the HF cache, which a fresh kernel does not
    # have; ensure_base_model also searches /kaggle/input and downloads
    # the verified-size file from OnomaAIResearch/Illustrious-XL-v2.0.)
    model = ensure_base_model()

    # --- step 0: Wielder preflight (deps + pin hashes + dataset) ---
    pf = subprocess.run(
        [sys.executable, os.path.join(PKG, "wielder_train", "preflight.py"),
         "--trainer-dir", TRAINER, "--dataset-dir", data_dst])
    if pf.returncode != 0:
        abort("preflight failed — no GPU time spent")

    # --- train both characters with the owed recipe ---
    os.makedirs(os.path.join(WORK, "out"), exist_ok=True)
    results = {}
    for char in ("dorowani", "wispkin"):
        ds_cfg = os.path.join(WORK, f"dataset_{char}_sdxl.toml")
        # dataset toml from the package configs, image_dir already
        # points at /kaggle/working/data/<char>/sdxl
        shutil.copy(os.path.join(PKG, "configs", f"dataset_{char}_sdxl.toml"), ds_cfg)
        cmd = [
            sys.executable, os.path.join(TRAINER, "sdxl_train_network.py"),
            "--pretrained_model_name_or_path", model,
            "--dataset_config", ds_cfg,
            "--output_dir", os.path.join(WORK, "out", char),
            "--output_name", f"{char}_illustrious_lora",
            "--network_module", "networks.lora",
            "--network_dim", "32", "--network_alpha", "16",
            "--learning_rate", "1e-4", "--text_encoder_lr", "5e-5",
            "--optimizer_type", "adamw8bit",
            "--lr_scheduler", "cosine",
            "--mixed_precision", "fp16",
            "--gradient_checkpointing", "--cache_latents",
            "--save_every_n_epochs", "4",
            "--max_train_epochs", "12",
            "--seed", "42",
            "--save_model_as", "safetensors",
            "--min_snr_gamma", "5",
        ]
        rc = run(cmd, cwd=TRAINER)
        line = f"TRAIN_DONE {char} rc {rc}"
        print(line, flush=True)
        log_lines.append(line)
        results[char] = rc

    # --- collected manifest ---
    collected = {}
    out_root = os.path.join(WORK, "out")
    for root, _d, files in os.walk(out_root):
        for name in sorted(files):
            if name.endswith(".safetensors"):
                p = os.path.join(root, name)
                collected[os.path.relpath(p, out_root)] = {
                    "bytes": os.path.getsize(p), "sha256": sha256_of(p)}
    print("COLLECTED " + json.dumps(collected), flush=True)
    collect_dir = os.path.join(WORK, "out-collect")
    os.makedirs(collect_dir, exist_ok=True)
    with open(os.path.join(collect_dir, "sdxl-lora-files.json"), "w") as f:
        json.dump(collected, f, indent=2, sort_keys=True)
    if any(rc != 0 for rc in results.values()) or len(collected) < 2:
        abort(f"training incomplete: rc={results} collected={list(collected)}")
    print("WIELDER_TRAIN_KERNEL_DONE", flush=True)


if __name__ == "__main__":
    main()
