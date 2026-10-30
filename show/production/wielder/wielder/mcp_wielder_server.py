"""WIELDER over MCP — every registered tool a first-class MCP tool.

`wielder/mcp_server.py` (parity build) exposes the tool layer through
the official python-sdk as two generic meta-tools: one lists names,
one calls by name with a JSON string payload. That works, but it is
not the shape MCP hosts expect: Claude Code, Codex, Gemini CLI and
every other MCP host discover *individual* tools with their own
schemas and present them to the model directly.

This module is that shape, built on the dependency-free protocol
core (`wielder/mcp_protocol.py`):

- tools/list returns every entry of wielder.tools.REGISTRY as its own
  MCP tool, with the Pydantic payload model's JSON Schema as the
  inputSchema (rendered by wielder/tool_schemas.py, the same source
  the other harness dialects export from);
- tools/call validates and executes through tools.call_tool — the
  single execution entry point — so the guarantees are Wielder's own:
  schema validation before anything runs, authz classes enforced
  inside the tool implementations, scorer-owned writes denied
  structurally. A validation failure comes back as an isError tool
  result (the model sees it and can correct), never a crash;
- resources expose live, read-only Wielder state:
    wielder://constitution — the state machine and hard limits
    wielder://tools        — the registry with schemas (JSON mirror
                             of tools/list, for app-controlled use)
- prompts expose one governed-workflow template:
    wielder_run_card — the plan/execute/evaluate flow for a card,
    stated in the constitution's terms.

Run: python -m wielder.mcp_wielder_server   (stdio transport)
The module imports wielder.tools lazily (inside build_server) so the
protocol core — and this file's own help — never pays the tool
layer's import cost, and so a bare checkout can import it for tests
of the wiring shape with a stubbed registry.
"""
from __future__ import annotations

import json
from typing import Any, Callable, Optional

from . import mcp_protocol as P

SERVER_NAME = "wielder-mcp"
SERVER_VERSION = "1.0.0"

CONSTITUTION_URI = "wielder://constitution"
TOOLS_URI = "wielder://tools"


def _tool_handler(name: str, call_tool: Callable[[str, dict], Any]) -> Callable[[dict], P.ToolOutcome]:
    def handler(arguments: dict) -> P.ToolOutcome:
        try:
            res = call_tool(name, arguments or {})
        except Exception as e:
            # tools.call_tool raises on an invalid payload by design;
            # over MCP that is a tool error the model can react to.
            return P.ToolOutcome(text=f"payload rejected: {type(e).__name__}: {e}",
                                 is_error=True)
        payload = res.model_dump() if hasattr(res, "model_dump") else dict(res)
        return P.ToolOutcome(text=json.dumps(payload, default=str),
                             structured=payload,
                             is_error=not payload.get("ok", False))
    return handler


def build_server(registry: Optional[dict] = None, call_tool: Optional[Callable] = None,
                 constitution: Any = None) -> P.ServerCore:
    """Assemble the ServerCore. Arguments are injectable for tests;
    with none, the real wielder.tools registry and constitution are
    imported and used."""
    if registry is None or call_tool is None:
        from . import tools as _tools
        registry = registry if registry is not None else _tools.REGISTRY
        call_tool = call_tool if call_tool is not None else _tools.call_tool
    if constitution is None:
        from . import constitution as _C
        constitution = _C
    from . import tool_schemas

    core = P.ServerCore(SERVER_NAME, SERVER_VERSION)
    for entry in tool_schemas.canonical_tools(registry):
        core.add_tool(entry["name"], entry["description"], entry["input_schema"],
                      _tool_handler(entry["name"], call_tool))

    def constitution_doc(_uri: str) -> dict:
        return {"states": constitution.STATES,
                "legal_transitions": {k: sorted(v) for k, v in constitution.LEGAL_TRANSITIONS.items()},
                "retry_cap": constitution.RETRY_CAP,
                "wip_limit": constitution.WIP_LIMIT,
                "retrieval_top_k": constitution.RETRIEVAL_TOP_K,
                "scorer_owned_prefixes": constitution.SCORER_OWNED_PREFIXES,
                "note": "Hard limits are read from wielder.config by constitution.py; "
                        "this resource is a live read of that module, not a copy."}

    def tools_doc(_uri: str) -> dict:
        return {"tools": tool_schemas.to_mcp_tools(registry)}

    core.add_resource(CONSTITUTION_URI, "Wielder constitution",
                      "The state machine, hard limits and scorer-owned paths, read live from wielder/constitution.py.",
                      constitution_doc)
    core.add_resource(TOOLS_URI, "Wielder tool registry",
                      "Every registered tool with its JSON Schema — the resource-shaped mirror of tools/list.",
                      tools_doc)

    def run_card_prompt(arguments: dict) -> list:
        card = arguments.get("card_id", "<card-id>")
        text = (
            f"Run board card {card} through Wielder's governed flow. "
            "PLANNING: bind an Accepted method and file the discovery log "
            "(knowns, unknowns, files read) before any execution. "
            "EXECUTING: act only through the schema-validated tool layer. "
            "EVALUATING: the finish-gate verifier is the only pass issuer — "
            "cite its evidence manifest and the artifact hashes, never a "
            "self-assessment. On a blocker, PARK with the exact blocker "
            "named; do not route around it."
        )
        return [{"role": "user", "content": {"type": "text", "text": text}}]

    core.add_prompt("wielder_run_card",
                    "The governed plan/execute/evaluate flow for one board card, in the constitution's terms.",
                    [{"name": "card_id", "description": "Board card id to run", "required": True}],
                    run_card_prompt)
    return core


def main() -> None:
    P.serve_stdio(build_server())


if __name__ == "__main__":
    main()
