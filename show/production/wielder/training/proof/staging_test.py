"""Staging regression test for the Wielder Train Kaggle kernel (v2).

Simulates the Kaggle layout in a workspace scratch dir:
  <sim>/input/mochiichao-wielder-training/wielder-training/...   (the
      attached package dataset, extracted from wielder-training-pkg.zip)
  <sim>/working/                                                  (empty,
      like a fresh kernel's working dir)

PATCHED mode: imports the patched kernel script and calls its own
stage_package() + find_base_model()/ensure_base_model() code paths
against the simulation. Expects PKG_STAGED to fire and the staged PKG
to hold requirements-wielder.txt + wielder_train/preflight.py.

ORIGINAL mode: replicates the v1 kernel's logic exactly — PKG is a
hard-coded path under the (empty) working dir, nothing stages it, and
the first read of PKG is the requirements install. Expects the same
"No such file or directory" failure the v1 run died on.

No pip installs, no training, no downloads are run. The model-check
positive case uses a SPARSE dummy file of exactly the verified
Illustrious byte size (created with truncate; it is not model data).
"""
import importlib.util
import os
import shutil
import subprocess
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
KERNEL = os.path.join(ROOT, "kaggle", "wielder_train_kernel.py")
ZIP = os.path.join(ROOT, "kaggle-dataset", "wielder-training-pkg.zip")
SIM = os.path.join(ROOT, "scratch", "staging-test-sim")
VERIFIED_BYTES = 6938040674


def load_kernel():
    spec = importlib.util.spec_from_file_location("wielder_kernel", KERNEL)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def build_sim():
    if os.path.isdir(SIM):
        shutil.rmtree(SIM)
    input_dir = os.path.join(SIM, "input", "mochiichao-wielder-training")
    os.makedirs(input_dir)
    with zipfile.ZipFile(ZIP) as z:
        z.extractall(input_dir)
    working = os.path.join(SIM, "working")
    os.makedirs(working)
    return input_dir, working


def patched():
    print("== PATCHED kernel logic ==")
    k = load_kernel()
    input_dir, working = build_sim()
    pkg = os.path.join(working, "wielder-training")
    print(f"sim input:   {input_dir}")
    print(f"sim working: {working} (empty: {os.listdir(working) == []})")
    # The kernel's own staging step, pointed at the simulation.
    k.stage_package(pkg=pkg, input_root=os.path.join(SIM, "input"))
    req = os.path.join(pkg, "requirements-wielder.txt")
    pf = os.path.join(pkg, "wielder_train", "preflight.py")
    assert os.path.isfile(req), "requirements-wielder.txt NOT staged"
    assert os.path.isfile(pf), "wielder_train/preflight.py NOT staged"
    print(f"STAGED_OK requirements-wielder.txt ({os.path.getsize(req)} B)")
    print(f"STAGED_OK wielder_train/preflight.py ({os.path.getsize(pf)} B)")
    # Idempotence: a second call must find the package already present.
    k.stage_package(pkg=pkg, input_root=os.path.join(SIM, "input"))
    # Negative: no package dataset attached -> loud abort, up front.
    empty_input = os.path.join(SIM, "input-empty")
    os.makedirs(empty_input)
    try:
        k.stage_package(pkg=os.path.join(working, "nowhere"),
                        input_root=empty_input)
        print("ERROR: staging did NOT abort with no dataset attached")
        return False
    except SystemExit as e:
        print(f"STAGING_ABORT_OK SystemExit({e.code}) with no dataset")
    # Model check, negative: nothing anywhere -> None (download branch).
    empty_hub = os.path.join(SIM, "hub-empty")
    os.makedirs(empty_hub)
    found = k.find_base_model(roots=[empty_hub, empty_input])
    print(f"MODEL_NONE_OK find_base_model(empty) -> {found}")
    assert found is None
    # Model check, positive: sparse dummy of exactly the verified size.
    cache_dir = os.path.join(SIM, "hub-fake")
    os.makedirs(cache_dir)
    dummy = os.path.join(cache_dir, "Illustrious-XL-v2.0-STABLE.safetensors")
    with open(dummy, "wb") as f:
        f.truncate(VERIFIED_BYTES)
    found = k.find_base_model(roots=[cache_dir, empty_input])
    assert found == dummy, f"find_base_model -> {found}"
    # ensure_base_model's local path is find_base_model + a getsize
    # check against VERIFIED_BYTES before it prints ILLUSTRIOUS_VERIFIED;
    # the download branch itself needs Kaggle/HF network and is not
    # exercised here.
    assert os.path.getsize(found) == VERIFIED_BYTES
    print(f"MODEL_FOUND_OK {found} size {os.path.getsize(found)} "
          f"== verified {VERIFIED_BYTES}")
    print("PATCHED_TEST_PASS")
    return True


def original():
    print("== ORIGINAL (v1) kernel logic ==")
    _input_dir, working = build_sim()
    # v1: PKG hard-coded under the working dir; no staging step exists.
    pkg = os.path.join(working, "wielder-training")
    req = os.path.join(pkg, "requirements-wielder.txt")
    print(f"v1 PKG: {pkg} (exists: {os.path.isdir(pkg)})")
    print(f"v1 first read of PKG: pip install -r {req}")
    # Use the proof venv's pip if present (the system pip stops on the
    # externally-managed-environment guard before it even opens -r).
    venv_py = os.path.join(ROOT, "scratch", "venv", "bin", "python")
    py = venv_py if os.path.isfile(venv_py) else sys.executable
    out = subprocess.run(
        [py, "-m", "pip", "install", "-q", "--dry-run", "-r", req],
        capture_output=True, text=True)
    rc = out.returncode
    print(f"v1 requirements install rc: {rc}")
    err_lines = [ln for ln in out.stderr.strip().splitlines() if ln.strip()]
    print(f"v1 error: {err_lines[0] if err_lines else '(none)'}")
    # v1 base model check: HF cache only — simulated empty cache.
    hub = os.path.join(SIM, "hub-empty-v1")
    os.makedirs(hub, exist_ok=True)
    model = None
    for root, _d, files in os.walk(hub):
        for name in files:
            if name.startswith("Illustrious-XL") \
                    and name.endswith(".safetensors"):
                model = os.path.join(root, name)
    print(f"v1 base model in (empty) HF cache: {model} "
          "-> v1 would abort 'not in HF cache'")
    ok = (rc != 0 and model is None)
    print("ORIGINAL_TEST_FAILS_AS_EXPECTED" if ok
          else "ERROR: v1 logic unexpectedly succeeded")
    return ok


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "patched"
    ok = patched() if mode == "patched" else original()
    sys.exit(0 if ok else 1)
