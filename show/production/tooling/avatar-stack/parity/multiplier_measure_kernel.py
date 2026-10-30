# Mochiichao - multiplier measurement run (2026-10-28, HORSEPOWER PROGRAMME part F).
# Kaggle-only by design: it stages everything from the SAME four datasets the
# locked-run kernel uses (no embedded assets - this is a measurement harness,
# not the production runner; the production runner is locked_run_kernel_v3.py).
#
# It measures, on ONE lane/GPU in ONE session, back to back:
#   1. locked graph @49 frames  - the incumbent full-density cost (v2/v3 shape)
#   2. locked graph @37 frames  - on-2s timing (12 unique fps over the same
#                                 3.06 s span; the runner default)
#   3. locked graph @25 frames  - on-3s timing (8 unique fps, same span)
#   4. RIFE VFI x2 on the @37 output, using the repo's own workflow
#      (avatar-stack/freedom/rife_workflow.json, ckpt rife47.pth staged from
#      the consistency-kit dataset - mount verified via Kaggle API 2026-10-28)
# Every phase records wall seconds, output sha256 and ffprobe frame counts
# into out/measure-report.json. A phase that errors is recorded as an error
# with its traceback - never silently skipped.
import subprocess, sys, os, json, time, shutil, glob, hashlib, traceback
import urllib.request

WORK = '/kaggle/working'
OUT = f'{WORK}/out'
os.makedirs(OUT, exist_ok=True)
REPORT = {'kernel': 'marsfmmg/mochiichao-measure', 'lane': 'kaggle', 'phases': {}, 'timings': {}}
REPORT_PATH = f'{OUT}/measure-report.json'
COMFYUI_PIN = 'c7bd15c28213348d72042ba0675747f1ebbed95f'
VFI_PIN = '26545cc2dd95bc3d27f056016300673bdeee78f5'      # ComfyUI-Frame-Interpolation
VHS_PIN = '4d907bee61e92c2e65af3bd6383a4e4d356126d1'      # ComfyUI-VideoHelperSuite

def log(*a): print(' '.join(str(x) for x in a), flush=True)
def sh(cmd, **kw):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, **kw)
def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()
def flush_report():
    json.dump(REPORT, open(REPORT_PATH, 'w'), indent=1)
def find_input(name):
    hits = sorted(glob.glob(f'/kaggle/input/**/{name}', recursive=True))
    return hits[0] if hits else None
def clone_pinned(url, dest, pin):
    assert sh(f'git clone --depth 1 {url} {dest}').returncode == 0, f'clone failed: {url}'
    head = sh(f'git -C {dest} rev-parse HEAD').stdout.strip()
    if head != pin:
        assert sh(f'git -C {dest} fetch --depth 1 origin {pin}').returncode == 0
        assert sh(f'git -C {dest} checkout -q {pin}').returncode == 0
        head = pin
    log('pinned', os.path.basename(dest), head)
    return head
def probe(path):
    """ffprobe frame count / fps / duration; falls back to None fields."""
    info = {'path': path, 'bytes': os.path.getsize(path), 'sha256': sha(path)}
    fp = shutil.which('ffprobe')
    if fp:
        r = sh(f"{fp} -v error -select_streams v:0 -count_frames -show_entries "
               f"stream=nb_read_frames,r_frame_rate,duration -of json '{path}'")
        try:
            st = json.loads(r.stdout)['streams'][0]
            info['frames'] = int(st['nb_read_frames'])
            num, den = st['r_frame_rate'].split('/')
            info['fps'] = round(int(num) / max(int(den), 1), 3)
            info['duration_s'] = float(st['duration'])
        except Exception as e:
            info['probe_error'] = str(e)
    return info

try:
    T0 = time.time()
    try:
        log(sh('nvidia-smi').stdout[:400])
    except Exception as e:
        log('nvidia-smi unavailable:', e)

    # ---------- stage the locked job from the datasets ----------
    wf_src = find_input('workflow-i2v-locked.json')
    img_src = find_input('dorowani_start_tight.png')
    assert wf_src and img_src, 'locked job files not found in attached datasets'
    WF = json.load(open(wf_src))
    REPORT['staging'] = {'workflow': wf_src, 'start_image': img_src}

    # ---------- ComfyUI + node packs (pinned) ----------
    clone_pinned('https://github.com/comfyanonymous/ComfyUI.git', f'{WORK}/ComfyUI', COMFYUI_PIN)
    sh(f'{sys.executable} -m pip install -q -r {WORK}/ComfyUI/requirements.txt scipy')
    cn = f'{WORK}/ComfyUI/custom_nodes'
    clone_pinned('https://github.com/Fannovel16/ComfyUI-Frame-Interpolation.git',
                 f'{cn}/ComfyUI-Frame-Interpolation', VFI_PIN)
    clone_pinned('https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git',
                 f'{cn}/ComfyUI-VideoHelperSuite', VHS_PIN)
    sh(f'{sys.executable} -m pip install -q -r {cn}/ComfyUI-VideoHelperSuite/requirements.txt')
    inst = sh(f'cd {cn}/ComfyUI-Frame-Interpolation && {sys.executable} install.py')
    log('VFI install.py rc:', inst.returncode, (inst.stdout or '')[-300:], (inst.stderr or '')[-300:])
    REPORT['pins'] = {'comfyui': COMFYUI_PIN, 'frame_interpolation': VFI_PIN, 'videohelpersuite': VHS_PIN}

    models = f'{WORK}/ComfyUI/models'
    def stage_model(name, sub, expect_size=None):
        dst = f'{models}/{sub}/{name}'
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst) or os.path.islink(dst): os.unlink(dst)
        src = find_input(name)
        assert src, f'weight not found in datasets: {name}'
        os.symlink(src, dst)
        size = os.path.getsize(dst)
        log('staged', name, size)
        if expect_size: assert size == expect_size, f'{name} size {size} != {expect_size}'
    stage_model('wan2.1_vace_1.3B_fp16.safetensors', 'diffusion_models', 4309519800)
    stage_model('wan_2.1_vae.safetensors', 'vae')
    stage_model('umt5_xxl_fp8_e4m3fn_scaled.safetensors', 'text_encoders')

    # RIFE flownet: dataset mount -> the pack's vfi_models folder.
    rife_src = find_input('rife47.pth')
    assert rife_src, 'rife47.pth not found in attached datasets'
    vfi_dir = f'{cn}/ComfyUI-Frame-Interpolation'
    os.makedirs(f'{vfi_dir}/vfi_models', exist_ok=True)
    shutil.copy(rife_src, f'{vfi_dir}/vfi_models/rife47.pth')
    assert sha(f'{vfi_dir}/vfi_models/rife47.pth') == sha(rife_src), 'rife copy hash mismatch'
    REPORT['staging']['rife47'] = {'from': rife_src, 'to': f'{vfi_dir}/vfi_models/rife47.pth',
                                   'bytes': os.path.getsize(rife_src)}
    log('rife47 staged from', rife_src)

    shutil.copy(img_src, f'{WORK}/ComfyUI/input/dorowani_start_tight.png')
    REPORT['timings']['stage_s'] = round(time.time() - T0, 1)
    flush_report()

    # ---------- boot ----------
    def get(path):
        with urllib.request.urlopen(f'http://127.0.0.1:8188{path}', timeout=30) as r:
            return json.loads(r.read())
    t_boot = time.time()
    proc = subprocess.Popen([sys.executable, 'main.py', '--listen', '127.0.0.1', '--port', '8188',
                             '--disable-auto-launch'],
                            cwd=f'{WORK}/ComfyUI', stdout=open(f'{WORK}/server.log', 'w'),
                            stderr=subprocess.STDOUT)
    up = False
    for _ in range(120):
        try:
            get('/system_stats'); up = True; break
        except Exception: time.sleep(5)
    assert up, 'ComfyUI did not come up'
    REPORT['timings']['boot_s'] = round(time.time() - t_boot, 1)
    try:
        oi = get('/object_info')
        REPORT['nodes'] = {'RIFE VFI': 'RIFE VFI' in oi,
                           'VHS_LoadVideo': 'VHS_LoadVideo' in oi,
                           'WanVaceToVideo': 'WanVaceToVideo' in oi}
    except Exception as e:
        REPORT['nodes'] = {'error': str(e)}
    log('nodes:', REPORT['nodes'])
    flush_report()

    def run_graph(wf, label, timeout=4 * 3600):
        body = json.dumps({'prompt': wf, 'client_id': f'measure-{label}'}).encode()
        req = urllib.request.Request('http://127.0.0.1:8188/prompt', data=body,
                                     headers={'Content-Type': 'application/json'})
        pid = json.loads(urllib.request.urlopen(req).read())['prompt_id']
        t0 = time.time()
        while time.time() - t0 < timeout:
            hist = get(f'/history/{pid}')
            entry = hist.get(pid)
            if entry and entry.get('status', {}).get('completed'):
                return time.time() - t0, entry
            if entry and entry.get('status', {}).get('status_str') == 'error':
                raise RuntimeError(f'{label}: execution error: {json.dumps(entry.get("status"))[:800]}')
            time.sleep(5)
        raise RuntimeError(f'{label}: timed out')

    def find_output(prefix):
        hits = sorted(glob.glob(f'{WORK}/ComfyUI/output/{prefix}*.mp4'))
        assert hits, f'no output for {prefix}'
        return hits[-1]

    import copy
    results = {}
    # 1-3: locked graph at the three frame counts (same span, same seed/prompts)
    for frames in (49, 37, 25):
        label = f'locked_{frames}f'
        try:
            wf = copy.deepcopy(WF)
            wf['7']['inputs']['length'] = frames
            wf['13']['inputs']['filename_prefix'] = f'measure/{label}'
            secs, _ = run_graph(wf, label)
            out = find_output(f'measure/{label}')
            results[label] = {'seconds': round(secs, 1), **probe(out)}
            log('MEASURED', label, results[label])
        except Exception as e:
            results[label] = {'error': f'{type(e).__name__}: {e}',
                              'traceback': traceback.format_exc()[-1500:]}
            log('PHASE FAILED', label, results[label]['error'])
        REPORT['phases'][label] = results[label]
        flush_report()

    # 4: RIFE x2 on the on-2s (37f) output - the repo workflow, verbatim shape
    try:
        src37 = results['locked_37f']['path']
        shutil.copy(src37, f'{WORK}/ComfyUI/input/measure_in37.mp4')
        rife_wf = {
            '1': {'class_type': 'VHS_LoadVideo',
                  'inputs': {'custom_height': 0, 'custom_width': 0, 'force_rate': 0,
                             'format': 'AnimateDiff', 'frame_load_cap': 0,
                             'select_every_nth': 1, 'skip_first_frames': 0,
                             'video': 'measure_in37.mp4'}},
            '2': {'class_type': 'RIFE VFI',
                  'inputs': {'batch_size': 1, 'ckpt_name': 'rife47.pth',
                             'clear_cache_after_n_frames': 10, 'dtype': 'float32',
                             'ensemble': True, 'fast_mode': True, 'frames': ['1', 0],
                             'multiplier': 2, 'scale_factor': 1.0, 'torch_compile': False}},
            '3': {'class_type': 'VHS_VideoCombine',
                  'inputs': {'crf': 18, 'filename_prefix': 'measure/rife2x_37',
                             'format': 'video/h264-mp4', 'frame_rate': 32,
                             'images': ['2', 0], 'loop_count': 0, 'pingpong': False,
                             'pix_fmt': 'yuv420p', 'save_metadata': True,
                             'save_output': True, 'trim_to_audio': False}}}
        secs, _ = run_graph(rife_wf, 'rife2x_37')
        out = find_output('measure/rife2x_37')
        REPORT['phases']['rife2x_on_37f'] = {'seconds': round(secs, 1), **probe(out)}
        log('MEASURED rife2x_on_37f', REPORT['phases']['rife2x_on_37f'])
    except Exception as e:
        REPORT['phases']['rife2x_on_37f'] = {'error': f'{type(e).__name__}: {e}',
                                             'traceback': traceback.format_exc()[-1500:]}
        log('PHASE FAILED rife2x', REPORT['phases']['rife2x_on_37f']['error'])
    REPORT['timings']['total_s'] = round(time.time() - T0, 1)
    flush_report()
    log('MEASUREMENT RUN DONE', REPORT['timings'])
except Exception as e:
    REPORT['fatal'] = f'{type(e).__name__}: {e}'
    REPORT['traceback'] = traceback.format_exc()[-2000:]
    flush_report()
    log('FATAL', REPORT['fatal'])
