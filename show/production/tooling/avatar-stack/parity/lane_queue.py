#!/usr/bin/env python3
"""lane_queue.py - multi-lane orchestration for the locked-run programme.

One job queue that distributes scene segments (job_format_v2, schema
"mochiichao-show/scene-job/v2" - see avatar-stack/freedom/job_format_v2.md)
across every verified free GPU lane in parallel. Lanes are interchangeable
capacity: each lane is spent only inside its own verified quota (lanes.json),
usage is ledgered in the open, and a lane failure requeues its segment onto
another lane instead of stalling the job.

Boundary: this module lives in avatar-stack/parity/ and meets the Wielder
lane ONLY through the job_format_v2 scene-job files. It never edits
show/production/wielder/.

Honesty rules wired in:
- A lane with "enabled": false in lanes.json is never assigned work.
- An executor that cannot actually drive its lane raises LaneNotDrivable
  with the reason recorded in lanes.json, and the queue marks the unit
  UNRUN on that lane - it never pretends a run happened.
- Cost estimates use the measured GPU-seconds-per-generated-frame of the
  reference lane once a measurement exists; before that they are labelled
  estimates in every report the queue emits.

Stdlib only. Entry points:
  plan      --job scene.json [--lanes lanes.json] [--defaults runner_defaults.json]
  simulate  --job scene.json   (dry-run executor; proves distribution/failover)
  report    --state queue-state.json
"""
import argparse, json, math, sys, time
from dataclasses import dataclass, field, asdict

SCHEMA = "mochiichao-show/scene-job/v2"

class LaneNotDrivable(Exception):
    pass

def snap_frames(duration_s, unique_fps):
    """Wan seat frame rule: generated frames are 4n+1."""
    raw = duration_s * unique_fps + 1
    n = math.ceil((raw - 1) / 4)
    return 4 * n + 1

@dataclass
class Unit:
    unit_id: str
    scene_id: str
    character: str
    segment_index: int
    action: str
    duration_s: float
    seed: int
    timing_mode: str = "2s"
    depends_on: str = None          # previous segment of the same character
    start_frame: str = None         # filled by chaining when depends_on finishes
    status: str = "queued"          # queued|assigned|done|failed
    lane: str = None
    attempts: list = field(default_factory=list)   # [{lane, outcome, detail}]
    gpu_s: float = None
    output_clip: str = None
    last_frame: str = None

@dataclass
class Lane:
    id: str
    provider: str
    label: str
    enabled: bool
    driver: str
    quota: dict
    unrun_reason: str = None
    used_gpu_s: float = 0.0

    def budget_s(self):
        """Weekly GPU-second budget when the verified quota is in hours.
        Credit-metered lanes return None: usage is still ledgered, and the
        report says plainly that no hour budget exists for that lane."""
        h = self.quota.get("gpu_hours_per_week")
        return float(h) * 3600.0 if h else None

    def remaining_s(self):
        b = self.budget_s()
        return None if b is None else b - self.used_gpu_s

def load_lanes(path):
    reg = json.load(open(path))
    assert reg["schema"] == "mochiichao-show/lane-registry/v1", reg["schema"]
    return [Lane(id=l["id"], provider=l["provider"], label=l["label"],
                 enabled=l["enabled"], driver=l["driver"], quota=l.get("quota", {}),
                 unrun_reason=l.get("unrun_reason")) for l in reg["lanes"]]

def load_defaults(path):
    d = json.load(open(path))
    assert d["schema"] == "mochiichao-show/runner-defaults/v1", d["schema"]
    return d

def expand_scene_job(job, defaults):
    """Scene job (job_format_v2) -> ordered work units with chain deps."""
    assert job.get("schema") == SCHEMA, f"not a job_format_v2 scene job: {job.get('schema')!r}"
    scene_id = job["scene_id"]
    timing = defaults["timing"]
    units = []
    for ch in job["characters"]:
        prev = None
        for i, seg in enumerate(ch["segments"]):
            uid = f"{scene_id}/{ch['character']}/seg{i+1}"
            u = Unit(unit_id=uid, scene_id=scene_id, character=ch["character"],
                     segment_index=i, action=seg["action"],
                     duration_s=float(seg["duration_s"]), seed=int(seg.get("seed", 0)),
                     timing_mode=seg.get("timing_mode", timing["default_mode"]),
                     depends_on=prev,
                     start_frame=seg.get("start_frame") or (None if prev else ch["cutout"]))
            units.append(u)
            prev = uid
    return units

def est_gpu_s(unit, defaults, gpu_s_per_frame):
    """Estimated GPU cost: proportional to generated frames at the unit's
    timing mode. gpu_s_per_frame comes from a measured reference run."""
    fps = defaults["timing"]["gen_fps_by_mode"][unit.timing_mode]
    return snap_frames(unit.duration_s, fps) * gpu_s_per_frame

class DryRunExecutor:
    """Deterministic simulator: proves queue behaviour in tests. NOT a run."""
    def __init__(self, gpu_s_per_frame=25.0, fail_lanes=()):
        self.gpu_s_per_frame = gpu_s_per_frame
        self.fail_lanes = set(fail_lanes)
    def run(self, unit, lane, defaults):
        if lane.id in self.fail_lanes:
            raise RuntimeError(f"simulated lane failure on {lane.id}")
        fps = defaults["timing"]["gen_fps_by_mode"][unit.timing_mode]
        gpu_s = snap_frames(unit.duration_s, fps) * self.gpu_s_per_frame
        return {"gpu_s": gpu_s,
                "output_clip": f"dryrun://{unit.unit_id}.mp4",
                "last_frame": f"dryrun://{unit.unit_id}.last.png"}

class KaggleKernelExecutor:
    """The real Kaggle path used by this programme: the v3 locked-run kernel
    (marsfmmg/mochiichao-locked-run) is pushed and run via the Kaggle CLI.
    Granularity is one kernel run per dispatch batch - stated plainly, not
    dressed up as per-segment streaming."""
    def __init__(self, kaggle_bin, kernel="marsfmmg/mochiichao-locked-run"):
        self.kaggle_bin = kaggle_bin
        self.kernel = kernel
    def run(self, unit, lane, defaults):
        raise LaneNotDrivable(
            "per-segment Kaggle dispatch goes through the v3 kernel batch run "
            "(push + harvest via the kaggle CLI, as done for the v3 measurement "
            "run); call dispatch_batch() for a whole assignment instead")

class ColabNotebookExecutor:
    """The real Colab path: the v3 locked-run runner
    (locked_run_kernel_v3.py) is notebook-native and lane-agnostic - run
    inside a signed-in Colab notebook session (verified 2026-10-29: Google
    OAuth as Mars FMMG, free-tier Tesla T4 assigned) via
    `%run locked_run_kernel_v3.py`. The runner auto-detects the Colab lane
    via /content (workdir /content/locked-run) and downloads weights from
    Hugging Face on non-Kaggle lanes. Granularity is one notebook session
    per dispatch batch (sessions capped ~12 h) - stated plainly, not
    dressed up as per-segment streaming. A notebook session is a live
    browser surface, so this module never pretends to drive it
    per-segment from here."""
    def run(self, unit, lane, defaults):
        raise LaneNotDrivable(
            "per-segment Colab dispatch goes through the v3 runner batch "
            "run (%run locked_run_kernel_v3.py inside a signed-in Colab "
            "notebook session; the runner auto-detects /content) - this "
            "queue assigns and ledgers the lane, the notebook session "
            "executes the batch")

class StubExecutor:
    """For lanes whose driver cannot be executed from here (browser OAuth,
    owner payment tap, or a structurally unusable quota). Fails loudly with
    the lanes.json reason so the queue records UNRUN, never a fake run."""
    def __init__(self, reason):
        self.reason = reason
    def run(self, unit, lane, defaults):
        raise LaneNotDrivable(self.reason or f"lane {lane.id} is not drivable")

def make_executor(lane, kaggle_bin=None):
    if lane.driver == "kaggle-cli":
        return KaggleKernelExecutor(kaggle_bin or "kaggle")
    if lane.driver == "notebook":
        return ColabNotebookExecutor()
    return StubExecutor(lane.unrun_reason)

class Queue:
    def __init__(self, units, lanes, defaults, gpu_s_per_frame=None):
        self.units = {u.unit_id: u for u in units}
        self.lanes = {l.id: l for l in lanes}
        self.defaults = defaults
        # None until a real measurement exists; reports must label estimates.
        self.gpu_s_per_frame = gpu_s_per_frame

    def ready(self):
        out = []
        for u in self.units.values():
            if u.status != "queued":
                continue
            if u.depends_on and self.units[u.depends_on].status != "done":
                continue
            out.append(u)
        return out

    def pick_lane(self, unit, exclude=()):
        cands = []
        for lane in self.lanes.values():
            if not lane.enabled or lane.id in exclude:
                continue
            rem = lane.remaining_s()
            if rem is not None and self.gpu_s_per_frame:
                if est_gpu_s(unit, self.defaults, self.gpu_s_per_frame) > rem:
                    continue
            cands.append(lane)
        if not cands:
            return None
        # Interchangeable capacity: spread load - least-used lane first.
        cands.sort(key=lambda l: l.used_gpu_s)
        return cands[0]

    def dispatch(self, executor_for):
        """Run until no unit can progress. executor_for(lane) -> executor.
        Returns the queue report dict."""
        progress = True
        while progress:
            progress = False
            for unit in self.ready():
                tried = {a["lane"] for a in unit.attempts if a["outcome"] != "done"}
                lane = self.pick_lane(unit, exclude=tried)
                if lane is None:
                    continue
                unit.status = "assigned"
                unit.lane = lane.id
                try:
                    res = executor_for(lane).run(unit, lane, self.defaults)
                except LaneNotDrivable as exc:
                    unit.attempts.append({"lane": lane.id, "outcome": "unrun",
                                          "detail": str(exc)})
                    unit.status = "queued"
                    unit.lane = None
                    continue
                except Exception as exc:  # a real lane failure: fail over
                    unit.attempts.append({"lane": lane.id, "outcome": "failed",
                                          "detail": f"{type(exc).__name__}: {exc}"})
                    unit.status = "queued"
                    unit.lane = None
                    progress = True   # retry on another lane
                    continue
                unit.gpu_s = float(res["gpu_s"])
                lane.used_gpu_s += unit.gpu_s
                unit.output_clip = res.get("output_clip")
                unit.last_frame = res.get("last_frame")
                unit.attempts.append({"lane": lane.id, "outcome": "done", "detail": ""})
                unit.status = "done"
                # Chaining: this segment's last frame starts the next segment.
                for other in self.units.values():
                    if other.depends_on == unit.unit_id:
                        other.start_frame = unit.last_frame
                progress = True
        return self.report()

    def report(self):
        lanes = []
        for lane in self.lanes.values():
            lanes.append({"lane": lane.id, "provider": lane.provider,
                          "label": lane.label, "enabled": lane.enabled,
                          "used_gpu_s": round(lane.used_gpu_s, 1),
                          "budget_gpu_s": lane.budget_s(),
                          "remaining_gpu_s": (None if lane.remaining_s() is None
                                              else round(lane.remaining_s(), 1)),
                          "unrun_reason": lane.unrun_reason})
        units = []
        for u in self.units.values():
            units.append({"unit": u.unit_id, "status": u.status, "lane": u.lane,
                          "timing_mode": u.timing_mode, "duration_s": u.duration_s,
                          "generated_frames": snap_frames(
                              u.duration_s,
                              self.defaults["timing"]["gen_fps_by_mode"][u.timing_mode]),
                          "gpu_s": u.gpu_s, "start_frame": u.start_frame,
                          "output_clip": u.output_clip, "attempts": u.attempts})
        stuck = [u["unit"] for u in units if u["status"] != "done"]
        return {"schema": "mochiichao-show/lane-queue-report/v1",
                "estimates_labelled": self.gpu_s_per_frame is None,
                "gpu_s_per_frame_source": ("measured reference run"
                                           if self.gpu_s_per_frame else
                                           "NONE - costs are unestimated until a measurement lands"),
                "lanes": lanes, "units": units, "unfinished_units": stuck}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["plan", "simulate", "report"])
    ap.add_argument("--job")
    ap.add_argument("--lanes", default="lanes.json")
    ap.add_argument("--defaults", default="runner_defaults.json")
    ap.add_argument("--state")
    ap.add_argument("--fail-lanes", default="", help="simulate: comma list of lanes that fail")
    ap.add_argument("--gpu-s-per-frame", type=float, default=None)
    a = ap.parse_args()
    lanes = load_lanes(a.lanes)
    defaults = load_defaults(a.defaults)
    if a.cmd == "report":
        print(json.dumps(json.load(open(a.state)), indent=1))
        return
    job = json.load(open(a.job))
    units = expand_scene_job(job, defaults)
    q = Queue(units, lanes, defaults, gpu_s_per_frame=a.gpu_s_per_frame)
    if a.cmd == "plan":
        for u in units:
            fps = defaults["timing"]["gen_fps_by_mode"][u.timing_mode]
            print(f"{u.unit_id}: {u.duration_s}s on {u.timing_mode} "
                  f"({fps} unique fps -> {snap_frames(u.duration_s, fps)} generated frames), "
                  f"depends_on={u.depends_on}")
        en = [l.id for l in lanes if l.enabled]
        print(f"enabled lanes: {en}")
        return
    fail = {s for s in a.fail_lanes.split(",") if s}
    sim = DryRunExecutor(fail_lanes=fail)
    rep = q.dispatch(lambda lane: sim)
    print(json.dumps(rep, indent=1))

if __name__ == "__main__":
    main()
