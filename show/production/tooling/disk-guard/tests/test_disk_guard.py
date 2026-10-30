#!/usr/bin/env python3
"""Tests for disk_guard.py.

Run:  python3 -m unittest discover -s tests -v
All fixtures are built under ~/workspace/disk-guard/scratch/ (never /tmp,
a tiny tmpfs on this machine). The Kaggle CLI is mocked with a fake
executable placed first on PATH.
"""

import errno
import hashlib
import json
import os
import subprocess
import sys
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve()
TOOL_DIR = HERE.parent.parent
SCRIPT = TOOL_DIR / "disk_guard.py"
SCRATCH_BASE = Path.home() / "workspace" / "disk-guard" / "scratch"

sys.path.insert(0, str(TOOL_DIR))
import disk_guard as dg  # noqa: E402

MB = 1024 * 1024


def write_bytes(path, size, fill=b"x"):
    path.parent.mkdir(parents=True, exist_ok=True)
    chunk = fill * (256 * 1024)
    remaining = size
    with open(path, "wb") as f:
        while remaining > 0:
            n = min(remaining, len(chunk))
            f.write(chunk[:n])
            remaining -= n
    return path


def sha256_of(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def run_cli(args, env_extra=None, path_prefix=None):
    env = dict(os.environ)
    if path_prefix is not None:
        # fake bin first (it must win the kaggle lookup) but keep the
        # system dirs so the fake's `#!/usr/bin/env python3` resolves
        env["PATH"] = path_prefix + os.pathsep + "/usr/bin" + os.pathsep + "/bin"
    env.pop("DISK_GUARD_KAGGLE_BIN", None)
    if env_extra:
        env.update(env_extra)
    proc = subprocess.run([sys.executable, str(SCRIPT)] + args,
                          capture_output=True, text=True, env=env, timeout=300)
    lines = proc.stdout.strip().splitlines()
    summary = json.loads(lines[-1]) if lines else {}
    return proc.returncode, summary, proc.stdout, proc.stderr


class FixtureCase(unittest.TestCase):
    def setUp(self):
        SCRATCH_BASE.mkdir(parents=True, exist_ok=True)
        self.root = Path(SCRATCH_BASE) / f"fx-{self.id().split('.')[-1]}-{os.getpid()}"
        if self.root.exists():
            import shutil
            shutil.rmtree(self.root)
        self.root.mkdir(parents=True)

    def tearDown(self):
        import shutil
        shutil.rmtree(self.root, ignore_errors=True)

    def age(self, path, seconds):
        old = time.time() - seconds
        os.utime(path, (old, old))


# ---------------------------------------------------------------------------
# canary probe / preflight
# ---------------------------------------------------------------------------

class TestCanary(unittest.TestCase):
    def test_canary_catches_simulated_quota_failure_while_df_shows_space(self):
        real_writer = dg._probe_write_file

        def quota_fail(probe_path, size):
            raise OSError(errno.EDQUOT, "Disk quota exceeded")

        dg._probe_write_file = quota_fail
        try:
            rep = dg.headroom_report(SCRATCH_BASE, probe_bytes=4096)
        finally:
            dg._probe_write_file = real_writer
        # df insists there is space (this machine has tens of GB free)...
        self.assertGreater(rep["df_free_bytes"], 1 * 1024 ** 3)
        # ...but the canary verdict is what counts.
        self.assertFalse(rep["canary"]["ok"])
        self.assertEqual(rep["canary"]["errno"], errno.EDQUOT)
        self.assertTrue(rep["quota_blocked"])

    def test_canary_ok_on_writable_dir(self):
        rep = dg.headroom_report(SCRATCH_BASE, probe_bytes=4096)
        self.assertTrue(rep["canary"]["ok"])
        self.assertFalse(rep["quota_blocked"])
        self.assertFalse((SCRATCH_BASE / dg.PROBE_NAME).exists())


class TestPreflight(FixtureCase):
    def test_preflight_fails_fast_when_expected_exceeds_headroom(self):
        rc, summary, _out, _err = run_cli(
            ["preflight", "--expect-bytes", str(10 ** 15), "--path", str(self.root),
             "--probe-bytes", "4096"])
        self.assertEqual(rc, 3)
        self.assertFalse(summary["go"])
        self.assertGreater(summary["shortfall_bytes"], 0)

    def test_preflight_passes_with_headroom(self):
        rc, summary, _out, _err = run_cli(
            ["preflight", "--expect-bytes", "1024", "--path", str(self.root),
             "--probe-bytes", "4096"])
        self.assertEqual(rc, 0)
        self.assertTrue(summary["go"])

    def test_check_exit_zero_on_healthy_dir(self):
        rc, summary, _out, _err = run_cli(
            ["check", str(self.root), "--probe-bytes", "4096"])
        self.assertEqual(rc, 0)
        self.assertTrue(summary["canary"]["ok"])


# ---------------------------------------------------------------------------
# reap class (a): orphan partials
# ---------------------------------------------------------------------------

class TestReapClassA(FixtureCase):
    def make_partial_unit(self, directory, size=2 * MB, marker_age_h=3, sibling_age_h=3):
        data = write_bytes(directory / "model.safetensors", size)
        marker = write_bytes(directory / "model.safetensors.kaggle-partial", 65, b"m")
        self.age(marker, marker_age_h * 3600)
        self.age(data, sibling_age_h * 3600)
        return data, marker

    def test_old_orphan_partial_fires_and_applies(self):
        data, marker = self.make_partial_unit(self.root / "run-output")
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root)])
        self.assertEqual(rc, 0)
        self.assertFalse(summary["applied"])
        self.assertEqual(summary["candidate_count"], 1)
        self.assertEqual(summary["candidates"][0]["class"], "a")
        self.assertTrue(data.exists())  # dry-run deletes nothing
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root), "--apply"])
        self.assertTrue(summary["applied"])
        self.assertFalse(data.exists())
        self.assertFalse(marker.exists())

    def test_fresh_partial_does_not_fire(self):
        self.make_partial_unit(self.root / "run-output", marker_age_h=0, sibling_age_h=0)
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root)])
        self.assertEqual(summary["candidate_count"], 0)

    def test_old_marker_but_sibling_being_written_does_not_fire(self):
        _data, marker = self.make_partial_unit(
            self.root / "run-output", marker_age_h=3, sibling_age_h=0)
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root)])
        self.assertEqual(summary["candidate_count"], 0)

    def test_small_partial_unit_does_not_fire(self):
        self.make_partial_unit(self.root / "run-output", size=100 * 1024)
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root)])
        self.assertEqual(summary["candidate_count"], 0)

    def test_terabox_upload_tree_is_protected(self):
        self.make_partial_unit(self.root / "terabox-upload" / "Mochiichao-Staging")
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root), "--apply"])
        self.assertEqual(summary["candidate_count"], 0)

    def test_dataset_source_folder_is_protected(self):
        d = self.root / "foundry-code-v2"
        (d).mkdir(parents=True)
        (d / "dataset-metadata.json").write_text('{"id": "marsfmmg/x"}')
        self.make_partial_unit(d)
        rc, summary, _o, _e = run_cli(["reap", "--roots", str(self.root), "--apply"])
        self.assertEqual(summary["candidate_count"], 0)


# ---------------------------------------------------------------------------
# reap class (b): pull-dir duplicates of staged artifacts
# ---------------------------------------------------------------------------

class TestReapClassB(FixtureCase):
    def setUp(self):
        super().setUp()
        self.payload = self.root / "run-output" / "base-model.safetensors"
        write_bytes(self.payload, 1_500_000, b"B")
        self.manifest = self.root / "collected.json"
        self.manifest.write_text(json.dumps({
            "base-model/base-model.safetensors": {
                "bytes": self.payload.stat().st_size,
                "sha256": sha256_of(self.payload),
                "dataset": "marsfmmg/mochiichao-wan22-consistency-kit",
            }}))

    def test_manifest_matched_pull_file_fires(self):
        other = write_bytes(self.root / "run-output" / "notes.bin", 1_200_000, b"N")
        rc, summary, _o, _e = run_cli(
            ["reap", "--roots", str(self.root), "--manifest", str(self.manifest)])
        paths = [c["path"] for c in summary["candidates"]]
        self.assertIn(str(self.payload), paths)
        self.assertNotIn(str(other), paths)
        cls = {c["path"]: c["class"] for c in summary["candidates"]}
        self.assertEqual(cls[str(self.payload)], "b")

    def test_same_bytes_outside_pull_dir_does_not_fire(self):
        outside = self.root / "model-cache"
        clone = write_bytes(outside / "base-model.safetensors", 1_500_000, b"B")
        rc, summary, _o, _e = run_cli(
            ["reap", "--roots", str(self.root), "--manifest", str(self.manifest)])
        paths = [c["path"] for c in summary["candidates"]]
        self.assertNotIn(str(clone), paths)


# ---------------------------------------------------------------------------
# reap class (c): duplicate pull dirs
# ---------------------------------------------------------------------------

class TestReapClassC(FixtureCase):
    def test_partial_duplicate_fires_verified_copy_kept(self):
        good = write_bytes(self.root / "run-output" / "model.safetensors", 2 * MB, b"G")
        bad_dir = self.root / "run-output-final"
        bad = write_bytes(bad_dir / "model.safetensors", 1 * MB, b"g")  # truncated
        write_bytes(bad_dir / "model.safetensors.kaggle-partial", 65, b"m")
        manifest = self.root / "m.json"
        manifest.write_text(json.dumps({"model.safetensors": {
            "bytes": good.stat().st_size, "sha256": sha256_of(good)}}))
        rc, summary, _o, _e = run_cli(
            ["reap", "--roots", str(self.root), "--manifest", str(manifest), "--apply"])
        paths = [c["path"] for c in summary["candidates"]]
        self.assertIn(str(bad), paths)
        self.assertNotIn(str(good), paths)
        self.assertTrue(good.exists())
        self.assertFalse(bad.exists())

    def test_both_copies_verified_no_fire(self):
        a = write_bytes(self.root / "run-output" / "model.safetensors", 2 * MB, b"G")
        b = write_bytes(self.root / "run-output-final" / "model.safetensors", 2 * MB, b"G")
        manifest = self.root / "m.json"
        manifest.write_text(json.dumps({"model.safetensors": {
            "bytes": a.stat().st_size, "sha256": sha256_of(a)}}))
        rc, summary, _o, _e = run_cli(
            ["reap", "--roots", str(self.root), "--manifest", str(manifest)])
        cls_c = [c for c in summary["candidates"] if c["class"] == "c"]
        self.assertEqual(cls_c, [])


# ---------------------------------------------------------------------------
# publish-evict with a mocked kaggle CLI
# ---------------------------------------------------------------------------

FAKE_KAGGLE = r'''#!/usr/bin/env python3
import os, sys
from pathlib import Path
mode = os.environ.get("FAKE_KAGGLE_MODE", "ready")
state = Path(os.environ["FAKE_KAGGLE_STATE"])
args = sys.argv[1:]
if args[:2] == ["datasets", "status"]:
    if mode == "ready" or state.exists():
        print("ready")
        sys.exit(0)
    print("error: not found")
    sys.exit(1)
if args[:2] == ["datasets", "create"]:
    if mode == "create":
        state.write_text("created")
        print("Dataset creation successful")
        sys.exit(0)
    print("error: create failed")
    sys.exit(1)
if args[:2] == ["datasets", "version"]:
    if mode == "create":
        state.write_text("versioned")
        sys.exit(0)
    sys.exit(1)
sys.exit(1)
'''


class TestPublishEvict(FixtureCase):
    def setUp(self):
        super().setUp()
        self.bin_dir = self.root / "fakebin"
        self.bin_dir.mkdir()
        fake = self.bin_dir / "kaggle"
        fake.write_text(FAKE_KAGGLE)
        fake.chmod(0o755)
        self.state = self.root / "fake-state"
        self.product = write_bytes(self.root / "pull" / "char_lora.safetensors", 1_200_000, b"L")
        self.sha = sha256_of(self.product)

    def run_pe(self, sha, mode, manifest=None):
        args = ["publish-evict", "--file", str(self.product), "--sha256", sha,
                "--dataset", "marsfmmg/mochiichao-sdxl-loras"]
        if manifest:
            args += ["--manifest", str(manifest)]
        return run_cli(args, env_extra={"FAKE_KAGGLE_MODE": mode,
                                        "FAKE_KAGGLE_STATE": str(self.state)},
                       path_prefix=str(self.bin_dir))

    def test_hash_mismatch_refuses_and_keeps_file(self):
        rc, summary, _o, _e = self.run_pe("0" * 64, "ready")
        self.assertEqual(rc, 4)
        self.assertFalse(summary["evicted"])
        self.assertTrue(self.product.exists())

    def test_dataset_check_failure_refuses_and_keeps_file(self):
        rc, summary, _o, _e = self.run_pe(self.sha, "fail")
        self.assertEqual(rc, 5)
        self.assertFalse(summary["evicted"])
        self.assertTrue(self.product.exists())

    def test_already_staged_evicts(self):
        rc, summary, _o, _e = self.run_pe(self.sha, "ready")
        self.assertEqual(rc, 0)
        self.assertTrue(summary["verified"])
        self.assertTrue(summary["dataset_ready"])
        self.assertTrue(summary["evicted"])
        self.assertFalse(self.product.exists())

    def test_publish_then_evict_records_manifest(self):
        manifest = self.root / "staged.json"
        rc, summary, _o, _e = self.run_pe(self.sha, "create", manifest=manifest)
        self.assertEqual(rc, 0)
        self.assertTrue(summary["published"])
        self.assertTrue(summary["evicted"])
        data = json.loads(manifest.read_text())
        entry = data["char_lora.safetensors"]
        self.assertEqual(entry["sha256"], self.sha)
        self.assertEqual(entry["dataset"], "marsfmmg/mochiichao-sdxl-loras")


# ---------------------------------------------------------------------------
# inventory classification smoke test
# ---------------------------------------------------------------------------

class TestInventory(FixtureCase):
    def test_inventory_classes(self):
        write_bytes(self.root / "run-output" / "product.safetensors", 2 * MB, b"P")
        write_bytes(self.root / "terabox-upload" / "part-aa", 2 * MB, b"T")
        write_bytes(self.root / "run-output" / "x.safetensors.kaggle-partial", 65, b"m")
        write_bytes(self.root / "random.txt", 100, b"r")
        rc, summary, _o, _e = run_cli(["inventory", "--roots", str(self.root)])
        self.assertEqual(rc, 0)
        classes = summary["classes"]
        self.assertEqual(classes["held"]["files"], 1)
        self.assertEqual(classes["product"]["files"], 1)
        self.assertEqual(classes["junk"]["files"], 1)
        self.assertEqual(classes["unknown"]["files"], 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
