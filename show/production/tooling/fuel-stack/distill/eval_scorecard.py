"""eval_scorecard.py — teacher-vs-student scorecard, grok-local style.

Follows the programme's validation order: programmatic checks FIRST
(deterministic contains / word-cap / JSON-shape checks on a fixed
prompt set), agreement with the teacher second. The scorecard is a
RECORD, never a verdict — in Wielder's terms it informs; the
finish-gate verifier alone issues passes, and this harness is not it.

Usage (live):
  python3 eval_scorecard.py \
      --teacher-url http://127.0.0.1:8000/v1 --teacher-model <teacher> \
      --student-url http://127.0.0.1:8001/v1 --student-model <student> \
      --prompts eval_prompts.jsonl --out scorecard.json

Usage (harness self-test, no GPU): --self-test spins two stub
OpenAI-compatible servers on localhost (one always right, one
sometimes wrong) and proves the harness end-to-end. It proves the
HARNESS, not any model — the record says so.
"""
from __future__ import annotations

import argparse
import json
import sys
import threading
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path


def call(base_url: str, model: str, prompt: str, timeout: float = 300.0) -> str:
    body = json.dumps({"model": model,
                       "messages": [{"role": "user", "content": prompt}],
                       "temperature": 0.0, "max_tokens": 512}).encode()
    req = urllib.request.Request(base_url.rstrip("/") + "/chat/completions",
                                 data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())["choices"][0]["message"]["content"]


def run_checks(answer: str, checks: dict) -> list[str]:
    fails = []
    for needle in checks.get("contains", []):
        if needle.lower() not in answer.lower():
            fails.append(f"missing {needle!r}")
    for needle in checks.get("not_contains", []):
        if needle.lower() in answer.lower():
            fails.append(f"forbidden {needle!r} present")
    cap = checks.get("max_words")
    if cap and len(answer.split()) > cap:
        fails.append(f"{len(answer.split())} words > cap {cap}")
    if checks.get("must_be_json"):
        try:
            json.loads(answer.strip().strip("`"))
        except Exception:
            fails.append("not valid JSON")
    return fails


def score(url: str, model: str, cases: list[dict]) -> list[dict]:
    out = []
    for c in cases:
        try:
            ans = call(url, model, c["prompt"])
            fails = run_checks(ans, c.get("checks", {}))
        except Exception as e:
            ans, fails = "", [f"endpoint error: {e}"]
        out.append({"id": c["id"], "passed": not fails, "failures": fails,
                    "answer": ans})
    return out


def build_report(teacher_rows, student_rows, meta: dict) -> dict:
    agree = sum(1 for t, s in zip(teacher_rows, student_rows)
                if (t["answer"].strip().lower() == s["answer"].strip().lower()))
    return {
        **meta,
        "teacher": {"passed": sum(r["passed"] for r in teacher_rows),
                    "total": len(teacher_rows), "rows": teacher_rows},
        "student": {"passed": sum(r["passed"] for r in student_rows),
                    "total": len(student_rows), "rows": student_rows},
        "exact_answer_agreement": f"{agree}/{len(teacher_rows)}",
        "note": ("RECORD ONLY — a scorecard informs; it never issues a "
                 "pass. Promotion of a student is the owner's call on "
                 "this record plus live use."),
    }


# --- self-test stubs ---------------------------------------------------------

STUB_ANSWERS = {
    "teacher": {
        "capital": "The capital of France is Paris.",
        "json": '{"move": "Water Orb", "user": "Dorowani"}',
        "cheeks": "Dorowani's fin cheeks are red.",
        "default": "Paris. Red. Water Orb.",
    },
    "student": {  # deliberately imperfect: fails the JSON case
        "capital": "The capital of France is Paris.",
        "json": "The move is Water Orb, used by Dorowani.",
        "cheeks": "His fin cheeks are red.",
        "default": "Paris. Red. Water Orb.",
    },
}


def _stub_handler(kind: str):
    class H(BaseHTTPRequestHandler):
        def log_message(self, *a):  # silence
            pass

        def do_POST(self):
            length = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(length) or b"{}")
            prompt = req["messages"][0]["content"].lower()
            table = STUB_ANSWERS[kind]
            key = ("capital" if "capital of france" in prompt else
                   "json" if "json" in prompt else
                   "cheeks" if "cheeks" in prompt else "default")
            body = json.dumps({"choices": [{"message": {
                "role": "assistant", "content": table[key]}}]}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
    return H


SELF_TEST_CASES = [
    {"id": "st-capital", "prompt": "What is the capital of France?",
     "checks": {"contains": ["Paris"], "max_words": 12}},
    {"id": "st-json", "prompt": "Reply with JSON only: the move Water Orb and its user Dorowani.",
     "checks": {"must_be_json": True, "contains": ["Water Orb"]}},
    {"id": "st-cheeks", "prompt": "What colour are Dorowani's fin cheeks?",
     "checks": {"contains": ["red"], "not_contains": ["orange"]}},
]


def self_test() -> int:
    servers = []
    urls = {}
    for kind, port in (("teacher", 18231), ("student", 18232)):
        srv = HTTPServer(("127.0.0.1", port), _stub_handler(kind))
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        servers.append(srv)
        urls[kind] = f"http://127.0.0.1:{port}/v1"
    try:
        t = score(urls["teacher"], "stub-teacher", SELF_TEST_CASES)
        s = score(urls["student"], "stub-student", SELF_TEST_CASES)
        rep = build_report(t, s, {"mode": "SELF-TEST with stub endpoints — "
                                  "proves the harness, not any model"})
        print(json.dumps({k: rep[k] for k in
                          ("teacher", "student", "exact_answer_agreement")},
                         indent=2)[:1200])
        ok = (rep["teacher"]["passed"] == 3 and rep["student"]["passed"] == 2
              and rep["student"]["rows"][1]["passed"] is False)
        print("SELF-TEST", "PASSED — harness scores, discriminates and records "
              "as designed" if ok else "FAILED — see record above")
        return 0 if ok else 1
    finally:
        for srv in servers:
            srv.shutdown()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--prompts", default=str(Path(__file__).with_name("eval_prompts.jsonl")))
    ap.add_argument("--teacher-url"); ap.add_argument("--teacher-model")
    ap.add_argument("--student-url"); ap.add_argument("--student-model")
    ap.add_argument("--out", default="scorecard.json")
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        return self_test()
    if not all([args.teacher_url, args.teacher_model, args.student_url, args.student_model]):
        print("REFUSED — name both endpoints and models, or use --self-test.",
              file=sys.stderr)
        return 2
    cases = [json.loads(l) for l in Path(args.prompts).read_text(encoding="utf-8").splitlines() if l.strip()]
    t = score(args.teacher_url, args.teacher_model, cases)
    s = score(args.student_url, args.student_model, cases)
    rep = build_report(t, s, {"mode": "live",
                              "teacher_model": args.teacher_model,
                              "student_model": args.student_model,
                              "prompts": args.prompts})
    Path(args.out).write_text(json.dumps(rep, indent=2), encoding="utf-8")
    print(f"teacher {rep['teacher']['passed']}/{rep['teacher']['total']}  "
          f"student {rep['student']['passed']}/{rep['student']['total']}  "
          f"agreement {rep['exact_answer_agreement']}  -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
