# Mochiichao — CORRECTIVE locked run, v2 (2026-10-28).
# Runs parity/workflow-turbo-fixed.json (Wan 2.2 TI2V-5B + Turbo LoRA +
# non-scaled UMT5), parity/workflow-i2v-locked.json (native Wan 2.1
# VACE-1.3B, reference control ENGAGED) and its negative control, for ONE
# character: Dorowani, Water Orb charge (a non-avatar-slot action). Every
# output is gated by frame1_gate.py; a clip without its packet is not a
# result.
#
# v2 changes vs v1 (v1 result: preflight PASS both graphs, then the locked
# graph hit v1's own 2400 s wait limit — RuntimeError 'locked: timed out' —
# no clip, and the turbo phase never ran; see parity/PARITY-REPORT.md,
# 2026-10-28 entry):
#   (a) per-graph wait raised from 2400 s to 4 hours (GRAPH_TIMEOUT);
#   (b) progress capture: while a graph runs, the kernel polls ComfyUI's
#       /queue + /history state and the tail of the live comfy log and
#       flushes them into out/run-report.json every ~30 s — a timeout (or
#       a hard kill) still leaves a report of how far the graph got;
#   (c) phase order is TURBO FIRST, then LOCKED, then the negative
#       control, and every phase is failure-isolated: a phase that errors
#       or times out is recorded in the report and the next phase still
#       runs, so the run cannot return empty-handed; gates run on every
#       clip that exists;
#   (d) preflight strictness and gate thresholds are UNCHANGED from v1.
#
# Order of operations is the countermeasure set, not a suggestion:
#   1. stage weights from the attached datasets (byte sizes asserted);
#   2. PREFLIGHT both workflows + the hash-logged tight reference
#      (preflight.py; ABORT before server boot / GPU work on any failure);
#   3. TURBO graph first (fast seat; proves the pipeline end-to-end);
#   4. LOCKED graph; AUDIT the submitted graph via /history
#      (reference_image wire, VACE unet, trim wire must be in the graph
#      that actually ran — the audit result is recorded, and a failed
#      audit is a failed claim in the report, not a silent pass);
#   5. negative control: same locked graph, reference swapped to Wispkin —
#      frame 1 must follow the swapped reference, or the lock claim dies;
#   6. frame1_gate every clip; run-report.json carries hashes + timings
#      and is flushed to disk throughout the run, not only at the end.
import subprocess, sys, os, json, time, shutil, glob, hashlib, traceback
import urllib.request

WORK = '/kaggle/working'
OUT = f'{WORK}/out'
os.makedirs(OUT, exist_ok=True)
REPORT = {'kernel': 'marsfmmg/mochiichao-locked-run', 'kernel_version': 'v2', 'phases': {}}
REPORT_PATH = f'{OUT}/run-report.json'
GRAPH_TIMEOUT = 4 * 3600  # per-graph wait limit (v1: 2400 s — the v1 failure)
PROGRESS_EVERY = 30       # seconds between progress flushes while waiting
CURRENT_LOG = {'path': None}  # live comfy log of the running server

def log(*a): print(' '.join(str(x) for x in a), flush=True)
def sh(cmd, **kw):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, **kw)
    if r.stdout: log(r.stdout[-800:])
    if r.returncode != 0 and r.stderr: log('STDERR', r.stderr[-800:])
    return r
def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''): h.update(chunk)
    return h.hexdigest()
def find_input(name):
    hits = glob.glob(f'/kaggle/input/**/{name}', recursive=True)
    assert hits, f'job/dataset file missing under /kaggle/input: {name}'
    return hits[0]

# ---------- report / progress plumbing (v2) ----------
def flush_report():
    """Write run-report.json NOW (called throughout the run, not only in
    the finally block, so progress survives a phase timeout)."""
    try:
        with open(REPORT_PATH, 'w') as f:
            json.dump(REPORT, f, indent=1)
    except Exception as e:
        log('flush_report failed:', e)

def api_get(path):
    with urllib.request.urlopen(f'http://127.0.0.1:8188{path}', timeout=30) as r:
        return json.loads(r.read())

def tail_lines(path, n=40):
    if not path or not os.path.exists(path):
        return []
    try:
        with open(path, 'rb') as f:
            data = f.read()
        return data.decode('utf-8', errors='replace').splitlines()[-n:]
    except Exception:
        return []

def queue_state():
    try:
        q = api_get('/queue')
        running = q.get('queue_running') or []
        pending = q.get('queue_pending') or []
        return {'running_prompts': [item[1] for item in running if len(item) > 1],
                'running_count': len(running), 'pending_count': len(pending)}
    except Exception as e:
        return {'error': f'{type(e).__name__}: {e}'}

def record_progress(label, t0, entry=None):
    """Snapshot how far a graph has got into REPORT['progress'][label]
    and flush it to disk."""
    hist_status = None
    if entry:
        st = entry.get('status') or {}
        hist_status = {'status_str': st.get('status_str'), 'completed': st.get('completed')}
    REPORT.setdefault('progress', {})[label] = {
        'elapsed_s': round(time.time() - t0, 1),
        'timeout_s': GRAPH_TIMEOUT,
        'queue': queue_state(),
        'history_status': hist_status,
        'comfy_log_tail': tail_lines(CURRENT_LOG['path']),
        'updated_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }
    flush_report()

try:
    log(sh('nvidia-smi').stdout[:400])

    # ---------- stage job files ----------
    JOB = f'{WORK}/job'; os.makedirs(JOB, exist_ok=True)
    for name in ('workflow-i2v-locked.json', 'workflow-turbo-fixed.json', 'preflight.py',
                 'frame1_gate.py', 'likeness_gate.py', 'dorowani_start_tight.png',
                 'wispkin_start_tight.png', 'reference-manifest.json'):
        shutil.copy(find_input(name), f'{JOB}/{name}')
    MANIFEST = json.load(open(f'{JOB}/reference-manifest.json'))
    DORO_SHA = MANIFEST['dorowani_start_tight.png']
    WISP_SHA = MANIFEST['wispkin_start_tight.png']
    assert sha(f'{JOB}/dorowani_start_tight.png') == DORO_SHA, 'dorowani tight reference hash mismatch vs manifest'
    assert sha(f'{JOB}/wispkin_start_tight.png') == WISP_SHA, 'wispkin tight reference hash mismatch vs manifest'
    log('job staged; reference hashes match manifest')

    # ---------- ComfyUI ----------
    if not os.path.exists(f'{WORK}/ComfyUI'):
        assert sh(f'cd {WORK} && git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git').returncode == 0
    sh(f'{sys.executable} -m pip install -q -r {WORK}/ComfyUI/requirements.txt scipy')
    models = f'{WORK}/ComfyUI/models'
    def stage_model(name, sub, expect_size=None):
        src = find_input(name); dst = f'{models}/{sub}/{name}'
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst) or os.path.islink(dst): os.unlink(dst)
        os.symlink(src, dst)
        size = os.path.getsize(dst)
        log('staged', name, size)
        if expect_size: assert size == expect_size, f'{name} size {size} != expected {expect_size}'
        return dst
    # Native VACE seat (consistency-kit dataset).
    stage_model('wan2.1_vace_1.3B_fp16.safetensors', 'diffusion_models', 4309519800)
    stage_model('wan_2.1_vae.safetensors', 'vae')
    stage_model('umt5_xxl_fp8_e4m3fn_scaled.safetensors', 'text_encoders')  # native loader only

    # ---------- PREFLIGHT (before any GPU work) ----------
    pf = sh(f'{sys.executable} {JOB}/preflight.py --workflow {JOB}/workflow-i2v-locked.json --strict-vace '
            f'--reference {JOB}/dorowani_start_tight.png --expected-sha256 {DORO_SHA} '
            f'--out {OUT}/preflight-locked.json')
    assert pf.returncode == 0, 'PREFLIGHT ABORT (locked workflow) — see preflight-locked.json'
    pf2 = sh(f'{sys.executable} {JOB}/preflight.py --workflow {JOB}/workflow-turbo-fixed.json '
             f'--reference {JOB}/dorowani_start_tight.png --expected-sha256 {DORO_SHA} '
             f'--out {OUT}/preflight-turbo.json')
    assert pf2.returncode == 0, 'PREFLIGHT ABORT (turbo workflow) — see preflight-turbo.json'
    REPORT['phases']['preflight'] = 'PASS (locked strict-vace + turbo)'
    flush_report()
    log('PREFLIGHT PASS')

    # ---------- server management (v2: lazy, shared across phases) ----------
    shutil.copy(f'{JOB}/dorowani_start_tight.png', f'{WORK}/ComfyUI/input/dorowani_start_tight.png')
    shutil.copy(f'{JOB}/wispkin_start_tight.png', f'{WORK}/ComfyUI/input/wispkin_start_tight.png')
    SRV = {'proc': None}
    def get(path):
        with urllib.request.urlopen(f'http://127.0.0.1:8188{path}', timeout=30) as r: return json.loads(r.read())
    def start_server(logname):
        logpath = f'{WORK}/{logname}'
        proc = subprocess.Popen([sys.executable, 'main.py', '--listen', '127.0.0.1', '--port', '8188', '--disable-auto-launch'],
                                cwd=f'{WORK}/ComfyUI', stdout=open(logpath, 'w'), stderr=subprocess.STDOUT)
        SRV['proc'] = proc
        CURRENT_LOG['path'] = logpath
        for _ in range(120):
            try: get('/system_stats'); log('COMFYUI_UP', logname); return
            except Exception: time.sleep(5)
        raise RuntimeError(f'ComfyUI did not come up ({logname})')
    def stop_server():
        proc = SRV['proc']
        if proc is not None:
            proc.terminate()
            try: proc.wait(timeout=60)
            except Exception: proc.kill()
            SRV['proc'] = None
    def ensure_server(logname):
        if SRV['proc'] is None or SRV['proc'].poll() is not None:
            start_server(logname)

    def run_graph(wf, label):
        body = json.dumps({'prompt': wf, 'client_id': f'locked-run-{label}'}).encode()
        req = urllib.request.Request('http://127.0.0.1:8188/prompt', data=body, headers={'Content-Type': 'application/json'})
        pid = json.loads(urllib.request.urlopen(req).read())['prompt_id']
        t0 = time.time()
        last_flush = 0.0
        record_progress(label, t0)
        while time.time() - t0 < GRAPH_TIMEOUT:
            hist = get(f'/history/{pid}')
            entry = hist.get(pid)
            if entry and entry.get('status', {}).get('completed'):
                record_progress(label, t0, entry)
                return pid, time.time() - t0, entry
            if entry and entry.get('status', {}).get('status_str') == 'error':
                record_progress(label, t0, entry)
                raise RuntimeError(f'{label}: execution error: {json.dumps(entry.get("status"))[:600]}')
            if time.time() - last_flush >= PROGRESS_EVERY:
                record_progress(label, t0, entry)
                last_flush = time.time() - t0
            time.sleep(5)
        record_progress(label, t0)
        raise RuntimeError(f'{label}: timed out')

    def find_output(prefix):
        hits = sorted(glob.glob(f'{WORK}/ComfyUI/output/{prefix}*.mp4'))
        assert hits, f'no output for {prefix}'
        return hits[-1]

    def gate(clip, reference, species, tag):
        pkt = f'{OUT}/{tag}_frame1_gate.json'
        r = sh(f'{sys.executable} {JOB}/frame1_gate.py --clip {clip} --reference {reference} '
               f'--species {species} --likeness-gate {JOB}/likeness_gate.py '
               f'--scratch {WORK}/gate-scratch-{tag} --out {pkt}')
        d = json.load(open(pkt))
        log('GATE', tag, d['verdict'], d['fail_class'])
        return d

    # ---------- phase 1 (v2): TURBO-FIXED run FIRST (wrapper seat) ----------
    try:
        if not os.path.exists(f'{WORK}/ComfyUI/custom_nodes/ComfyUI-WanVideoWrapper'):
            assert sh(f'cd {WORK}/ComfyUI/custom_nodes && git clone --depth 1 https://github.com/kijai/ComfyUI-WanVideoWrapper.git').returncode == 0
            sh(f'{sys.executable} -m pip install -q -r {WORK}/ComfyUI/custom_nodes/ComfyUI-WanVideoWrapper/requirements.txt')
        stage_model('wan2.2_ti2v_5B_fp16.safetensors', 'diffusion_models')
        stage_model('wan2.2_vae.safetensors', 'vae')
        # Turbo LoRA filename differs across datasets; find by pattern.
        lora_hits = glob.glob('/kaggle/input/**/Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors', recursive=True)
        assert lora_hits, 'Turbo LoRA not found in attached datasets'
        dst = f'{models}/loras/Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors'
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(dst) or os.path.islink(dst): os.unlink(dst)
        os.symlink(lora_hits[0], dst); log('staged Turbo LoRA', os.path.getsize(dst))
        # Non-scaled UMT5: the fix file. Size-verify, then header-verify via preflight.
        from huggingface_hub import hf_hub_download
        p = hf_hub_download(repo_id='Kijai/WanVideo_comfy', filename='umt5-xxl-enc-fp8_e4m3fn.safetensors')
        t5_dst = f'{models}/text_encoders/umt5-xxl-enc-fp8_e4m3fn.safetensors'
        shutil.copy(p, t5_dst)
        size = os.path.getsize(t5_dst)
        assert size == 6731333792, f'non-scaled UMT5 size {size} != 6731333792'
        REPORT['phases']['umt5_stage'] = {'bytes': size, 'sha256': sha(t5_dst)}
        flush_report()
        pf3 = sh(f'{sys.executable} {JOB}/preflight.py --workflow {JOB}/workflow-turbo-fixed.json '
                 f'--reference {JOB}/dorowani_start_tight.png --expected-sha256 {DORO_SHA} '
                 f'--t5-file {t5_dst} --out {OUT}/preflight-turbo-t5file.json')
        assert pf3.returncode == 0, 'PREFLIGHT ABORT (turbo + actual T5 file)'
        # Boot (or restart) the server so the wrapper nodes load.
        if SRV['proc'] is not None:
            stop_server()
            start_server('comfy-turbo.log')
        else:
            start_server('comfy-turbo.log')
        wf_t = json.load(open(f'{JOB}/workflow-turbo-fixed.json'))
        pid, secs, hist = run_graph(wf_t, 'turbo')
        json.dump(hist, open(f'{OUT}/history-turbo.json', 'w'), indent=1)
        submitted = hist.get('prompt', [None, None, {}])[2] or {}
        lora_wire = submitted.get('3', {}).get('inputs', {}).get('lora')
        clip = find_output('turbo_fixed_dorowani')
        dst = f'{OUT}/turbo_fixed_dorowani.mp4'; shutil.copy(clip, dst)
        g = gate(dst, f'{JOB}/dorowani_start_tight.png', 'dorowani', 'turbo')
        REPORT['phases']['turbo'] = {'seconds': round(secs, 1), 'lora_wire_in_history': lora_wire,
                                     'clip': os.path.basename(dst), 'bytes': os.path.getsize(dst), 'sha256': sha(dst),
                                     'gate_verdict': g['verdict'], 'fail_class': g['fail_class'],
                                     'frame0_canon': g.get('canon_cutout_results', {}).get('0')}
        log('TURBO DONE', REPORT['phases']['turbo'])
    except Exception as e:
        REPORT['phases']['turbo'] = {'error': f'{type(e).__name__}: {e}'}
        log('TURBO PHASE FAILED (recorded, remaining phases still run):', e)
    flush_report()

    # ---------- phase 2 (v2): LOCKED run ----------
    try:
        ensure_server('comfy-locked.log')
        wf = json.load(open(f'{JOB}/workflow-i2v-locked.json'))
        pid, secs, hist = run_graph(wf, 'locked')
        submitted = hist.get('prompt', [None, None, {}])[2] or {}
        audit = {
            'node7_reference_image': submitted.get('7', {}).get('inputs', {}).get('reference_image'),
            'node1_unet': submitted.get('1', {}).get('inputs', {}).get('unet_name'),
            'node10_trim_amount': submitted.get('10', {}).get('inputs', {}).get('trim_amount'),
        }
        audit_ok = (audit['node7_reference_image'] == ['6', 0]
                    and audit['node1_unet'] == 'wan2.1_vace_1.3B_fp16.safetensors'
                    and audit['node10_trim_amount'] == ['7', 3])
        json.dump(hist, open(f'{OUT}/history-locked.json', 'w'), indent=1)
        clip = find_output('locked_i2v_dorowani')
        dst = f'{OUT}/locked_i2v_dorowani.mp4'; shutil.copy(clip, dst)
        g = gate(dst, f'{JOB}/dorowani_start_tight.png', 'dorowani', 'locked')
        REPORT['phases']['locked'] = {'seconds': round(secs, 1), 'history_audit': audit, 'audit_ok': audit_ok,
                                      'clip': os.path.basename(dst), 'bytes': os.path.getsize(dst), 'sha256': sha(dst),
                                      'gate_verdict': g['verdict'], 'fail_class': g['fail_class'],
                                      'frame0_canon': g.get('canon_cutout_results', {}).get('0')}
        if not audit_ok:
            REPORT['phases']['locked']['audit_failure'] = ('HISTORY AUDIT FAILED — the submitted graph that '
                                                          'actually ran does not carry the lock wires; the '
                                                          'likeness-lock claim for this clip is DEAD.')
            log('LOCKED HISTORY AUDIT FAILED (recorded):', audit)
        log('LOCKED DONE', REPORT['phases']['locked'])
    except Exception as e:
        REPORT['phases']['locked'] = {'error': f'{type(e).__name__}: {e}'}
        log('LOCKED PHASE FAILED (recorded, control still runs):', e)
    flush_report()

    # ---------- phase 3 (v2): negative control (reference swapped to Wispkin) ----------
    try:
        ensure_server('comfy-control.log')
        wf_c = json.load(open(f'{JOB}/workflow-i2v-locked.json'))
        wf_c['6']['inputs']['image'] = 'wispkin_start_tight.png'
        wf_c['13']['inputs']['filename_prefix'] = 'locked_control_wispkin'
        pid, secs, hist = run_graph(wf_c, 'control')
        json.dump(hist, open(f'{OUT}/history-control.json', 'w'), indent=1)
        clip = find_output('locked_control_wispkin')
        dst = f'{OUT}/locked_control_wispkin.mp4'; shutil.copy(clip, dst)
        g_w = gate(dst, f'{JOB}/wispkin_start_tight.png', 'wispkin', 'control_vs_wispkin')
        g_d = gate(dst, f'{JOB}/dorowani_start_tight.png', 'dorowani', 'control_vs_dorowani')
        # Control works iff frame 1 follows Wispkin (its fed reference) better
        # than Dorowani on the fed-reference SSIM.
        s_w = g_w.get('fed_reference_results', {}).get('0', {}).get('measurements', {}).get('ssim_union')
        s_d = g_d.get('fed_reference_results', {}).get('0', {}).get('measurements', {}).get('ssim_union')
        REPORT['phases']['negative_control'] = {'seconds': round(secs, 1), 'clip': os.path.basename(dst),
                                                'sha256': sha(dst), 'frame0_ssim_vs_wispkin_ref': s_w,
                                                'frame0_ssim_vs_dorowani_ref': s_d,
                                                'control_follows_reference': (s_w is not None and s_d is not None and s_w > s_d)}
        log('CONTROL DONE', REPORT['phases']['negative_control'])
    except Exception as e:
        REPORT['phases']['negative_control'] = {'error': f'{type(e).__name__}: {e}'}
        log('CONTROL PHASE FAILED (recorded):', e)
    flush_report()

    REPORT['status'] = 'DONE'
except Exception:
    REPORT['status'] = 'FAILED'
    REPORT['exception'] = traceback.format_exc()
    log('KERNEL_EXCEPTION\n', REPORT['exception'])
finally:
    flush_report()
    log('REPORT', json.dumps(REPORT)[:1500])
    log('LOCKED_RUN_KERNEL_DONE')
