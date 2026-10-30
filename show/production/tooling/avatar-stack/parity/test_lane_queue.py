#!/usr/bin/env python3
"""Tests for lane_queue.py - distribution, quota, failover, chaining.

Run: python3 test_lane_queue.py   (stdlib unittest, no GPU, no network)
"""
import json, os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lane_queue as q

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULTS = q.load_defaults(os.path.join(HERE, "runner_defaults.json"))

def lanes_json(tmp, specs):
    reg = {"schema": "mochiichao-show/lane-registry/v1",
           "lanes": [{"id": s[0], "provider": s[0], "label": "free tier",
                      "enabled": s[1], "driver": "stub",
                      "quota": ({"gpu_hours_per_week": s[2]} if len(s) > 2 and s[2] else {}),
                      "unrun_reason": "test stub"} for s in specs]}
    p = os.path.join(tmp, "lanes.json")
    json.dump(reg, open(p, "w"))
    return q.load_lanes(p)

JOB = {"schema": "mochiichao-show/scene-job/v2", "scene_id": "EP01-S01",
       "canvas": {"width": 1280, "height": 720}, "fps": 24,
       "background": {"clip": "gate_dawn.mp4", "note": "current"},
       "characters": [
           {"character": "dorowani", "cutout": "dorowani.png",
            "segments": [{"action": "walks to the gate", "duration_s": 3.0, "seed": 11},
                         {"action": "looks up", "duration_s": 2.0, "seed": 12}],
            "layer": {"x": 0.3, "y": 0.92, "scale": 0.5, "z_order": 1, "start_offset_s": 0.0}},
           {"character": "wispkin", "cutout": "wispkin.png",
            "segments": [{"action": "drifts in", "duration_s": 3.0, "seed": 21}],
            "layer": {"x": 0.6, "y": 0.92, "scale": 0.4, "z_order": 2, "start_offset_s": 0.0}}]}

import tempfile
TMP = tempfile.mkdtemp(prefix="laneq-test-", dir="/home/hatch/workspace/horsepower")

class TestExpand(unittest.TestCase):
    def test_units_and_chain_deps(self):
        units = q.expand_scene_job(JOB, DEFAULTS)
        self.assertEqual(len(units), 3)
        d2 = [u for u in units if u.unit_id.endswith("dorowani/seg2")][0]
        self.assertEqual(d2.depends_on, "EP01-S01/dorowani/seg1")
        d1 = [u for u in units if u.unit_id.endswith("dorowani/seg1")][0]
        self.assertEqual(d1.start_frame, "dorowani.png")   # seg1 starts from the cutout
        self.assertIsNone(d2.start_frame)                  # seg2 waits for chaining

    def test_snap_frames(self):
        self.assertEqual(q.snap_frames(3.0, 16), 49)   # the v2/v3 locked graph shape
        self.assertEqual(q.snap_frames(3.0, 12), 37)   # on-2s for a 3 s segment
        self.assertEqual(q.snap_frames(3.0, 8), 25)    # on-3s for a 3 s segment
        self.assertEqual(q.snap_frames(2.0, 12), 25)

class TestQueue(unittest.TestCase):
    def test_distribution_and_chaining(self):
        lanes = lanes_json(TMP, [("laneA", True), ("laneB", True)])
        queue = q.Queue(q.expand_scene_job(JOB, DEFAULTS), lanes, DEFAULTS)
        rep = queue.dispatch(lambda lane: q.DryRunExecutor())
        self.assertEqual(rep["unfinished_units"], [])
        used = {l["lane"]: l["used_gpu_s"] for l in rep["lanes"]}
        self.assertTrue(all(v > 0 for v in used.values()), used)  # both lanes got work
        seg2 = [u for u in rep["units"] if u["unit"].endswith("seg2")][0]
        self.assertIn("seg1", seg2["start_frame"])  # chained last frame of seg1

    def test_failover_moves_segment(self):
        lanes = lanes_json(TMP, [("laneA", True), ("laneB", True)])
        queue = q.Queue(q.expand_scene_job(JOB, DEFAULTS), lanes, DEFAULTS)
        rep = queue.dispatch(lambda lane: q.DryRunExecutor(fail_lanes={"laneA"}))
        self.assertEqual(rep["unfinished_units"], [])
        outcomes = {(a["lane"], a["outcome"]) for u in rep["units"] for a in u["attempts"]}
        self.assertIn(("laneA", "failed"), outcomes)   # failure recorded in the open
        self.assertTrue(all(u["lane"] == "laneB" for u in rep["units"] if u["status"] == "done"))

    def test_disabled_lane_never_assigned(self):
        lanes = lanes_json(TMP, [("off", False), ("on", True)])
        queue = q.Queue(q.expand_scene_job(JOB, DEFAULTS), lanes, DEFAULTS)
        rep = queue.dispatch(lambda lane: q.DryRunExecutor())
        self.assertEqual(rep["unfinished_units"], [])
        self.assertTrue(all(u["lane"] == "on" for u in rep["units"]))

    def test_quota_exhaustion_leaves_unit_queued(self):
        # 0.01 h/week = 36 s; one segment at 25 gpu-s/frame costs >> that.
        lanes = lanes_json(TMP, [("tiny", True, 0.01)])
        queue = q.Queue(q.expand_scene_job(JOB, DEFAULTS), lanes, DEFAULTS,
                        gpu_s_per_frame=25.0)
        rep = queue.dispatch(lambda lane: q.DryRunExecutor())
        self.assertEqual(len(rep["unfinished_units"]), 3)
        lane = rep["lanes"][0]
        self.assertLessEqual(lane["used_gpu_s"], 36.0 + 25.0 * 49)  # never silently overspent by more than one in-flight unit
        self.assertEqual(lane["used_gpu_s"], 0.0)  # est > budget -> nothing assigned

    def test_stub_lane_records_unrun_not_fake_done(self):
        lanes = lanes_json(TMP, [("stub", True)])
        queue = q.Queue(q.expand_scene_job(JOB, DEFAULTS), lanes, DEFAULTS)
        rep = queue.dispatch(lambda lane: q.make_executor(lane))
        self.assertEqual(len(rep["unfinished_units"]), 3)
        outcomes = {a["outcome"] for u in rep["units"] for a in u["attempts"]}
        self.assertEqual(outcomes, {"unrun"})

class TestRealRegistry(unittest.TestCase):
    """The shipped lanes.json: the 2026-10-29 verified lane states."""
    def setUp(self):
        self.lanes = q.load_lanes(os.path.join(HERE, "lanes.json"))
        self.by_id = {l.id: l for l in self.lanes}

    def test_enabled_lanes_are_kaggle_and_colab_only(self):
        enabled = {l.id for l in self.lanes if l.enabled}
        self.assertEqual(enabled, {"kaggle", "colab"})

    def test_colab_executor_is_the_notebook_batch_route(self):
        ex = q.make_executor(self.by_id["colab"])
        self.assertIsInstance(ex, q.ColabNotebookExecutor)
        unit = q.expand_scene_job(JOB, DEFAULTS)[0]
        with self.assertRaises(q.LaneNotDrivable) as ctx:
            ex.run(unit, self.by_id["colab"], DEFAULTS)
        self.assertIn("/content", str(ctx.exception))  # the v3 runner's Colab auto-detect

    def test_blocked_lanes_stay_disabled_with_reasons(self):
        for lid in ("modal", "lightning", "hf-zerogpu"):
            self.assertFalse(self.by_id[lid].enabled, lid)
            self.assertTrue(self.by_id[lid].unrun_reason, lid)

if __name__ == "__main__":
    unittest.main(verbosity=2)
