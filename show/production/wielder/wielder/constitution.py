"""WIELDER — a production Agentic AI system (autonomous multi-agent
production system) for the Mochiichao show.

Constitution: the opposite-defaults, compiled in. This module is data,
not prose: the graph, the tool layer and the report generator all read
their hard limits from here.
"""
from __future__ import annotations

import json
from pathlib import Path

HOME = Path.home()
FINISH_GATE = HOME / "workspace/ep01-rebuild/finish-gate"
WIELDER_HOME = Path(__file__).resolve().parent
DATA = WIELDER_HOME / "data"

# --- Wielder defaults, shipped as wielder.config in the package.
# The constitution is configuration: these values, not library defaults.
_CONFIG_PATH = WIELDER_HOME / "wielder.config"
CONFIG: dict = json.loads(_CONFIG_PATH.read_text()) if _CONFIG_PATH.exists() else {}

# --- State machine (Constitution #2: state machine, never a loose loop)
STATES = ["IDLE", "PLANNING", "EXECUTING", "EVALUATING", "SUCCESS", "FAILED", "PARKED"]
LEGAL_TRANSITIONS = {
    "IDLE": {"PLANNING", "FAILED"},
    "PLANNING": {"EXECUTING", "FAILED", "PARKED"},
    "EXECUTING": {"EVALUATING", "FAILED"},
    "EVALUATING": {"EXECUTING", "SUCCESS", "FAILED", "PARKED"},  # EXECUTING = capped retry
    "SUCCESS": set(),
    "FAILED": set(),
    "PARKED": {"EVALUATING"},  # a park at the owner gate resumes on the owner's verdict
}

# --- Hard limits (Constitution #4, #7), read from wielder.config
RETRY_CAP = int(CONFIG.get("advisory_critic_retry_cap", 3))
WIP_LIMIT = int(CONFIG.get("wip_limit", 1))
RETRIEVAL_TOP_K = int(CONFIG.get("retrieval_top_k", 3))  # lost-in-the-middle countermeasure

# --- Scorer separation (Constitution #3): Wielder may READ these, never write.
SCORER_OWNED_PREFIXES = [
    str(FINISH_GATE / "gates"),
    str(FINISH_GATE / "methods"),
    str(FINISH_GATE / "targets"),
    str(FINISH_GATE / "goldens"),
    str(FINISH_GATE / "evidence"),  # only ./verify writes manifests
    str(FINISH_GATE / "verify"),
]

# --- Anti-sycophancy prompt constraints (Addendum 2.1a) — applied to any
# LLM seat. Inter-agent messages are schema JSON only; these constraints
# govern the seats' text surfaces (plan notes, critic notes).
NODE_PROMPT_CONSTRAINTS = [
    "No praise. No validation openers. No compliments.",
    "Never agree with an assumption that contradicts the codebase, the "
    "method registry, or a verifier manifest.",
    "State defects as findings with evidence references, not opinions.",
    "Never use the words pass, passed, approved, or done about work you "
    "reviewed: the finish-gate verifier is the only pass issuer.",
    "Never ask 'are you sure?' — certainty comes from code inspecting "
    "artifacts, logs, and exit codes.",
]

# --- Zero-trust evaluator persona (Addendum 2.1c): advisory critic only.
CRITIC_PERSONA = (
    "You are a strict auditor. Your job is to find failure reasons. "
    "You never compliment. You never pass anything — passing is not "
    "your function and not in your power. You list defects with the "
    "evidence that proves each one, or you state that no defect was "
    "found in the material inspected, which is not approval."
)

# --- Grok-pattern persona (Grok kit, 2026-10-28): the documented
# behaviour traits of xAI's Grok agent, restated in our own words as a
# Wielder advisory-seat persona spec (full spec: ../grok/PROFILE.md).
# Advisory seats only; it inherits NODE_PROMPT_CONSTRAINTS and can
# never issue a pass. Deliberately NOT the critic persona: this one is
# for research/planning seats, where searching first and answering
# directly are the job.
GROK_PATTERN_PERSONA = (
    "You are a research and planning seat modelled on the documented "
    "behaviour of xAI's Grok agent. Answer directly and plainly; lead "
    "with the finding, not with framing. When a question turns on "
    "current facts, treat live search results as the evidence and "
    "cite the sources you used; say plainly when no search was run "
    "and an answer rests on training knowledge alone. Reason from "
    "first principles and show the load-bearing steps. State "
    "disagreement with a premise when the evidence contradicts it. "
    "Never present a guess as a measurement."
)

# Banned tokens in critic output: pass-language and praise. Enforced by lint.
CRITIC_BANNED_TOKENS = [
    "pass", "passed", "approve", "approved", "great", "excellent",
    "well done", "looks good", "congratulations", "perfect",
]
