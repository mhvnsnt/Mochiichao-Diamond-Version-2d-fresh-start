#!/usr/bin/env python3
"""Local unit exercise of the v2 kernel's report-writing path.
Extracts the REAL function definitions (flush_report, tail_lines,
queue_state, record_progress, run_graph) from mochiichao-locked-run.py by
AST — unmodified — and runs them against a stubbed ComfyUI + a fake clock:
  1. timeout path: progress must be flushed to run-report.json DURING the
     wait (queue state + comfy log tail included), and the final snapshot
     must be on disk when the timeout raises;
  2. completion path: run_graph returns (pid, secs, entry) and the
     progress record shows the completed history status.
No ComfyUI, no GPU, no network."""
import ast
import io
import json
import os
import sys
import tempfile
import time as real_time

_HERE = os.path.dirname(os.path.abspath(__file__))
KERNEL = next(
    os.path.join(_HERE, n)
    for n in ('mochiichao-locked-run.py', 'locked_run_kernel.py')
    if os.path.exists(os.path.join(_HERE, n))
)
WANT_FUNCS = {'flush_report', 'api_get', 'tail_lines', 'queue_state', 'record_progress', 'run_graph'}
WANT_ASSIGNS = {'GRAPH_TIMEOUT', 'PROGRESS_EVERY', 'CURRENT_LOG'}

src = open(KERNEL).read()
tree = ast.parse(src)
nodes = []
candidates = list(tree.body)
for node in tree.body:
    if isinstance(node, ast.Try):
        candidates.extend(node.body)  # kernel defines run_graph inside its try:
for node in candidates:
    if isinstance(node, ast.FunctionDef) and node.name in WANT_FUNCS:
        nodes.append(node)
    elif isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in WANT_ASSIGNS for t in node.targets):
        nodes.append(node)
found = {n.name for n in nodes if isinstance(n, ast.FunctionDef)}
assert found == WANT_FUNCS, f'missing functions: {WANT_FUNCS - found}'


class FakeClock:
    def __init__(self):
        self.t = 0.0
    def time(self):
        return self.t
    def sleep(self, s):
        self.t += s
    strftime = staticmethod(real_time.strftime)
    gmtime = staticmethod(real_time.gmtime)


class FakeResponse:
    def __init__(self, payload):
        self._data = json.dumps(payload).encode()
    def read(self):
        return self._data
    def __enter__(self):
        return self
    def __exit__(self, *a):
        return False


class FakeRequest:
    def __init__(self, url, data=None, headers=None):
        self.full_url = url


def make_urlopen(prompt_id='pid-123'):
    def urlopen(req, *a, **k):
        url = getattr(req, 'full_url', req)
        if isinstance(url, str) and url.endswith('/queue'):
            return FakeResponse({'queue_running': [[0, prompt_id]], 'queue_pending': []})
        return FakeResponse({'prompt_id': prompt_id})  # /prompt POST
    return urlopen


def build_ns(tmp, clock, history_script):
    ns = {
        'json': json, 'os': os, 'time': clock,
        'urllib': type('U', (), {'request': type('R', (), {
            'Request': FakeRequest, 'urlopen': staticmethod(make_urlopen())})}),
        'log': lambda *a: None,
        'REPORT': {'kernel': 'test', 'phases': {}},
        'REPORT_PATH': os.path.join(tmp, 'run-report.json'),
        'get': lambda path: history_script(),
    }
    code = compile(ast.Module(body=nodes, type_ignores=[]), KERNEL, 'exec')
    exec(code, ns)
    ns['GRAPH_TIMEOUT'] = 12   # fake seconds
    ns['PROGRESS_EVERY'] = 0   # flush every poll in the test
    return ns


def main():
    tmp = tempfile.mkdtemp(prefix='locked-run-v2-test-')
    logpath = os.path.join(tmp, 'comfy.log')
    with open(logpath, 'w') as f:
        f.write('boot line\nSENTINEL sampling 3/30\n')

    # ---- 1. timeout path ----
    clock = FakeClock()
    ns = build_ns(tmp, clock, lambda: {})  # history never completes
    ns['CURRENT_LOG']['path'] = logpath
    raised = None
    try:
        ns['run_graph']({'1': {}}, 'fake')
    except RuntimeError as e:
        raised = str(e)
    assert raised == 'fake: timed out', f'unexpected: {raised!r}'
    on_disk = json.load(open(ns['REPORT_PATH']))
    prog = on_disk['progress']['fake']
    assert prog['elapsed_s'] >= 12, prog
    assert prog['queue']['running_count'] == 1, prog['queue']
    assert any('SENTINEL' in line for line in prog['comfy_log_tail']), prog['comfy_log_tail']
    assert prog['timeout_s'] == 12
    print('PASS timeout path: progress flushed mid-wait, log tail + queue captured, final snapshot on disk')

    # ---- 2. completion path ----
    clock2 = FakeClock()
    calls = {'n': 0}
    entry = {'status': {'completed': True, 'status_str': 'success'}, 'outputs': {}}
    def script():
        calls['n'] += 1
        return {'pid-123': entry} if calls['n'] >= 2 else {}
    ns2 = build_ns(tmp, clock2, script)
    ns2['CURRENT_LOG']['path'] = logpath
    pid, secs, got = ns2['run_graph']({'1': {}}, 'fake2')
    assert pid == 'pid-123' and got is entry, (pid, got)
    prog2 = json.load(open(ns2['REPORT_PATH']))['progress']['fake2']
    assert prog2['history_status']['completed'] is True, prog2
    print('PASS completion path: run_graph returned the history entry; progress shows completed status')

    print('ALL TESTS PASSED')
    return 0


if __name__ == '__main__':
    sys.exit(main())
