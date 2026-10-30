"""WIELDER MCP client — the other half of the tool protocol.

`wielder/mcp_server.py` exposes Wielder's tools to MCP clients. This
module makes Wielder an MCP *client*: it connects to external MCP
servers the owner has configured, discovers their tools, and registers
them into the same schema-validated tool layer the graph uses — so an
external tool is called with exactly the guarantees of a native one
(Pydantic-validated payload in, ToolResult out, ledger-logged by the
graph's step runner).

Configuration: `wielder/mcp-servers.json` in the package —
{"servers": [{"name": ..., "command": ..., "args": [...], "env": {...}}]}
(stdio transport; the official mcp python-sdk, MIT — the same pinned
package as the server side). Connecting spawns the configured command:
a server entry is owner configuration on Wielder's own ground, the same
trust class as a registered method's implementing script. Calls through
the graph additionally require the standing authorization class
`mcp-client` (wielder.authz) — a new connector class asks once, like
every other class.

Discovery is manager-invoked (CLI: `wielder mcp discover`); a server
that fails to start is recorded in LAST_DISCOVERY_ERRORS and skipped —
it never breaks the tool layer.
"""
from __future__ import annotations

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Any, Optional

from pydantic import BaseModel, Field, create_model

from . import authz
from . import constitution as C
from .schemas import ToolResult

CONFIG_NAME = "mcp-servers.json"
LAST_DISCOVERY_ERRORS: dict[str, str] = {}

_TYPE_MAP = {"string": str, "integer": int, "number": float,
             "boolean": bool, "array": list, "object": dict}


def config_path() -> Path:
    return C.WIELDER_HOME / CONFIG_NAME


def load_servers(path: Optional[Path] = None) -> list[dict]:
    p = Path(path) if path else config_path()
    if not p.exists():
        return []
    return list(json.loads(p.read_text()).get("servers", []))


def _server_by_name(name: str, path: Optional[Path] = None) -> dict:
    for s in load_servers(path):
        if s.get("name") == name:
            return s
    raise KeyError(f"no MCP server named {name!r} in {path or config_path()}")


def _params(server: dict):
    from mcp import StdioServerParameters
    env = dict(os.environ)
    env.update({str(k): str(v) for k, v in (server.get("env") or {}).items()})
    return StdioServerParameters(command=server["command"],
                                 args=list(server.get("args") or []), env=env)


async def _discover_async(server: dict) -> list[dict]:
    from mcp import ClientSession
    from mcp.client.stdio import stdio_client
    async with stdio_client(_params(server)) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            res = await session.list_tools()
            return [{"name": t.name, "description": t.description or "",
                     "input_schema": t.inputSchema or {}} for t in res.tools]


async def _call_async(server: dict, tool_name: str, arguments: dict) -> dict:
    from mcp import ClientSession
    from mcp.client.stdio import stdio_client
    async with stdio_client(_params(server)) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            res = await session.call_tool(tool_name, arguments)
            texts = [c.text for c in (res.content or []) if hasattr(c, "text")]
            return {"is_error": bool(getattr(res, "isError", False)),
                    "text": "\n".join(texts),
                    "structured": getattr(res, "structuredContent", None)}


def discover(server_name: str, path: Optional[Path] = None) -> list[dict]:
    """List one configured server's tools (spawns the server process)."""
    return asyncio.run(_discover_async(_server_by_name(server_name, path)))


def discover_all(path: Optional[Path] = None) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {}
    LAST_DISCOVERY_ERRORS.clear()
    for server in load_servers(path):
        try:
            out[server["name"]] = asyncio.run(_discover_async(server))
        except Exception as e:
            LAST_DISCOVERY_ERRORS[server["name"]] = f"{type(e).__name__}: {e}"
    return out


def call(server_name: str, tool_name: str, arguments: dict,
         path: Optional[Path] = None) -> ToolResult:
    """Call one tool on one configured server. Requires the standing
    authorization class `mcp-client` — the enforcement point is
    wielder.authz.require, exactly as for verifier runs."""
    authz.require("mcp-client", f"mcp call {server_name}/{tool_name}")
    server = _server_by_name(server_name, path)
    try:
        res = asyncio.run(_call_async(server, tool_name, arguments))
    except Exception as e:
        return ToolResult(tool=f"mcp__{server_name}__{tool_name}", ok=False,
                          result={"server": server_name, "tool": tool_name},
                          raw_output=f"{type(e).__name__}: {e}")
    result: dict[str, Any] = {"server": server_name, "tool": tool_name}
    if res["structured"] is not None:
        result["structured"] = res["structured"]
    return ToolResult(tool=f"mcp__{server_name}__{tool_name}",
                      ok=not res["is_error"], result=result,
                      raw_output=res["text"])


def _model_from_schema(model_name: str, schema: dict) -> type[BaseModel]:
    props = (schema or {}).get("properties") or {}
    required = set((schema or {}).get("required") or [])
    fields: dict[str, Any] = {}
    for fname, spec in props.items():
        t = _TYPE_MAP.get((spec or {}).get("type"), Any)
        if fname in required:
            fields[fname] = (t, Field(...))
        else:
            fields[fname] = (Optional[t], None)
    safe = re.sub(r"[^0-9A-Za-z_]", "_", model_name)
    return create_model(safe, **fields) if fields else create_model(safe)


def registry_entries(path: Optional[Path] = None) -> dict[str, tuple[type[BaseModel], Any]]:
    """Build tools.REGISTRY-shaped entries for every discovered external
    tool, named mcp__<server>__<tool>. Payloads validate against a
    Pydantic model generated from the server's own input schema."""
    entries: dict[str, tuple[type[BaseModel], Any]] = {}
    for server_name, found in discover_all(path).items():
        for tool in found:
            reg_name = f"mcp__{server_name}__{tool['name']}"
            try:
                model = _model_from_schema(reg_name, tool["input_schema"])
            except Exception as e:
                LAST_DISCOVERY_ERRORS[reg_name] = f"schema build failed: {e}"
                continue

            def _fn(p: BaseModel, _s: str = server_name, _t: str = tool["name"],
                    _path: Optional[Path] = path) -> ToolResult:
                return call(_s, _t, p.model_dump(exclude_unset=True), path=_path)

            entries[reg_name] = (model, _fn)
    return entries


def register_into_tools(path: Optional[Path] = None) -> list[str]:
    """Merge the external entries into wielder.tools.REGISTRY for this
    process. Returns the registered names (sorted)."""
    from . import tools
    entries = registry_entries(path)
    tools.REGISTRY.update(entries)
    return sorted(entries.keys())
