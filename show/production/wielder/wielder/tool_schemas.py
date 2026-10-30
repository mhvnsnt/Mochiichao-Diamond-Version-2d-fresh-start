"""Cross-harness tool-schema export — one registry, four dialects.

Every harness in the agents wave describes the same thing — a named
tool, a description, a JSON Schema for its arguments — in a different
envelope:

- MCP (Anthropic / Linux Foundation): {"name", "description", "inputSchema"}
- OpenAI function calling (Codex CLI + Agents SDK):
  {"type": "function", "function": {"name", "description", "parameters"}}
- Anthropic Messages tools: {"name", "description", "input_schema"}
- Gemini function declarations: {"name", "description", "parameters"}
  where parameters must be Gemini's restricted Schema subset (an
  OpenAPI-3.0-flavoured dialect: no "title", no "additionalProperties",
  no "$defs" — see _gemini_schema).

Wielder's tool layer (`wielder/tools.py`) already holds the single
source of truth: each registry entry pairs a Pydantic payload model
with its implementation, and `model_json_schema()` is the canonical
schema. This module renders that truth into each dialect so the same
Wielder tool can be offered to any harness — the MCP server
(`wielder/mcp_wielder_server.py`) consumes the MCP dialect from here.

Descriptions: tools.py's payload models carry no docstrings, so the
human descriptions live in DESCRIPTIONS below, written from the
implementations' actual behaviour. A registry entry with no
description here falls back to a generated line — and the test suite
asserts every native tool has a written one.
"""
from __future__ import annotations

import copy
from typing import Any, Optional

DESCRIPTIONS: dict[str, str] = {
    "hash_file": "SHA-256 and byte size of a file; reports exists=False instead of failing when the path is absent.",
    "check_artifact": "Whether an artifact path exists and is non-empty, with its byte size.",
    "run_verifier": "Run the finish-gate verifier for a target and report the evidence manifest it wrote. The verifier is the only pass issuer.",
    "read_manifest": "Read a target's finish-gate evidence manifest: verdict, owner-gate state, per-clause status, and the manifest's own SHA-256.",
    "run_registered_script": "Run one script named in an Accepted method record's implementing list, with schema-validated arguments.",
    "retrieve": "Top-k retrieval over Wielder's indexed memory (repo docs and research), returning the hit records.",
    "write_run_file": "Write a text file inside a run's own workdir (data/runs/<run_id>/); scorer-owned paths are denied structurally.",
    "request_browser_job": "Route a browser job to the manager's browser lane as a job packet. Returns a routing receipt only — not execution, not completion.",
}


def canonical_tools(registry: Optional[dict] = None) -> list[dict]:
    """The dialect-neutral rendering: [{name, description, input_schema}]
    straight from the registry's Pydantic models, sorted by name."""
    if registry is None:
        from . import tools as _tools
        registry = _tools.REGISTRY
    out = []
    for name in sorted(registry):
        model, _fn = registry[name]
        schema = model.model_json_schema()
        out.append({"name": name,
                    "description": DESCRIPTIONS.get(name, f"Wielder tool: {name}"),
                    "input_schema": schema})
    return out


# ---------------- MCP dialect ----------------

def to_mcp_tools(registry: Optional[dict] = None) -> list[dict]:
    return [{"name": t["name"], "description": t["description"],
             "inputSchema": t["input_schema"]} for t in canonical_tools(registry)]


# ---------------- OpenAI dialect (Codex / Agents SDK) ----------------

def to_openai_functions(registry: Optional[dict] = None) -> list[dict]:
    out = []
    for t in canonical_tools(registry):
        params = copy.deepcopy(t["input_schema"])
        params.pop("title", None)  # OpenAI's parser rejects unknown top keys less gracefully than MCP's
        out.append({"type": "function",
                    "function": {"name": t["name"], "description": t["description"],
                                 "parameters": params}})
    return out


# ---------------- Anthropic dialect ----------------

def to_anthropic_tools(registry: Optional[dict] = None) -> list[dict]:
    return [{"name": t["name"], "description": t["description"],
             "input_schema": t["input_schema"]} for t in canonical_tools(registry)]


# ---------------- Gemini dialect ----------------

_GEMINI_KEYS = {"type", "description", "properties", "required", "items",
                "enum", "format", "nullable", "minimum", "maximum", "minItems",
                "maxItems", "minLength", "maxLength", "propertyOrdering"}


def _gemini_schema(node: Any) -> Any:
    """Reduce a JSON Schema to Gemini's Schema subset: keep only the
    keys Gemini accepts, drop titles/defaults/$defs, and inline local
    $ref targets one level (Wielder's payload models are flat, so
    this covers the registry as it stands; a nested $defs schema
    keeps its properties but loses the shared-definition indirection,
    which is stated here rather than hidden)."""
    if isinstance(node, dict):
        out: dict[str, Any] = {}
        for key, value in node.items():
            if key == "$ref" and isinstance(value, str) and value.startswith("#/$defs/"):
                continue  # handled by the caller's defs merge; see below
            if key in _GEMINI_KEYS:
                out[key] = _gemini_schema(value)
        if node.get("type") == "object" and "properties" not in out:
            out["properties"] = {}
        return out
    if isinstance(node, list):
        return [_gemini_schema(v) for v in node]
    return node


def _inline_refs(node: Any, defs: dict) -> Any:
    """Replace local $ref pointers with their $defs targets (Gemini's
    Schema has no reference mechanism)."""
    if isinstance(node, dict):
        if set(node) == {"$ref"} and str(node["$ref"]).startswith("#/$defs/"):
            target = defs.get(str(node["$ref"]).split("/")[-1], {})
            return _inline_refs(copy.deepcopy(target), defs)
        return {k: _inline_refs(v, defs) for k, v in node.items()}
    if isinstance(node, list):
        return [_inline_refs(v, defs) for v in node]
    return node


def to_gemini_declarations(registry: Optional[dict] = None) -> list[dict]:
    out = []
    for t in canonical_tools(registry):
        schema = copy.deepcopy(t["input_schema"])
        defs = schema.pop("$defs", {})
        schema = _inline_refs(schema, defs) if defs else schema
        out.append({"name": t["name"], "description": t["description"],
                    "parameters": _gemini_schema(schema)})
    return out


DIALECTS = {
    "mcp": to_mcp_tools,
    "openai": to_openai_functions,
    "anthropic": to_anthropic_tools,
    "gemini": to_gemini_declarations,
}


def export(dialect: str, registry: Optional[dict] = None) -> list[dict]:
    if dialect not in DIALECTS:
        raise KeyError(f"unknown dialect {dialect!r}; known: {sorted(DIALECTS)}")
    return DIALECTS[dialect](registry)
