"""MCP protocol core — the Model Context Protocol implemented from
the public specification (modelcontextprotocol.io), stdlib only.

Why this exists alongside `wielder/mcp_client.py` / `mcp_server.py`:
those two modules bridge Wielder to the official python-sdk (MIT,
pinned mcp==1.30.0 in requirements.txt) — the client discovers and
calls external servers through the SDK, and the server module exposes
two generic meta-tools through it. This module is the other half of
the protocol, owned outright:

- a JSON-RPC 2.0 message core implementing the MCP lifecycle
  (initialize handshake + version negotiation), the three server
  primitives (tools, resources, prompts), ping, and the spec's error
  codes — with no third-party dependency, so it runs anywhere Wielder
  runs, including the deterministic seat's bare environment;
- `ServerCore`: the protocol brain. `wielder/mcp_wielder_server.py`
  mounts Wielder's tool layer on it;
- `ClientSession`: a client host speaking to any MCP server over a
  transport (loopback for tests/embedding, stdio for real servers) —
  the transport-level complement to mcp_client.py's SDK bridge.

Protocol versions implemented: 2025-11-25, 2025-06-18, 2025-03-26,
2024-11-05 (the initialize-handshake revisions the reference SDKs and
servers in the wild speak). The 2026-07-28 stateless revision
(server/discover, per-request _meta, sampling deprecated) is tracked
as a GAP in ../agents-wave/TEARDOWN-MCP.md — not implemented here and
not claimed.

Framing: stdio transport is newline-delimited JSON, per spec. Batch
requests are not part of MCP and are rejected as invalid requests.
"""
from __future__ import annotations

import json
import queue
import subprocess
import sys
import threading
from typing import Any, Callable, Optional

# ------------------------------------------------------------------
# Protocol constants (MCP specification, lifecycle + JSON-RPC 2.0)
# ------------------------------------------------------------------

PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"]
LATEST_PROTOCOL_VERSION = PROTOCOL_VERSIONS[0]

PARSE_ERROR = -32700
INVALID_REQUEST = -32600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603
SERVER_NOT_INITIALIZED = -32002  # request before the initialize handshake
RESOURCE_NOT_FOUND = -32002      # resources/read on an unknown URI (spec)


class MCPError(RuntimeError):
    """A JSON-RPC error object surfaced to the client caller."""

    def __init__(self, code: int, message: str, data: Any = None):
        super().__init__(f"MCP error {code}: {message}")
        self.code = code
        self.message = message
        self.data = data


def _result(req_id: Any, result: Any) -> dict:
    return {"jsonrpc": "2.0", "id": req_id, "result": result}


def _error(req_id: Any, code: int, message: str, data: Any = None) -> dict:
    err: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        err["data"] = data
    return {"jsonrpc": "2.0", "id": req_id, "error": err}


# ------------------------------------------------------------------
# Server core
# ------------------------------------------------------------------

class ToolOutcome:
    """What a tool handler returns: content blocks for the model, an
    optional structured payload, and the MCP isError flag. A handler
    may also return a plain str (one text block) or a plain dict
    (structured payload + its JSON as the text block)."""

    def __init__(self, text: Optional[str] = None, structured: Any = None,
                 is_error: bool = False, content: Optional[list] = None):
        self.content = content
        if self.content is None:
            if text is None and structured is not None:
                text = json.dumps(structured, default=str)
            self.content = [{"type": "text", "text": text or ""}]
        self.structured = structured
        self.is_error = is_error

    def to_result(self) -> dict:
        out: dict[str, Any] = {"content": self.content, "isError": self.is_error}
        if self.structured is not None:
            out["structuredContent"] = self.structured
        return out


def _normalize_outcome(value: Any) -> ToolOutcome:
    if isinstance(value, ToolOutcome):
        return value
    if isinstance(value, str):
        return ToolOutcome(text=value)
    if isinstance(value, dict):
        return ToolOutcome(structured=value)
    return ToolOutcome(text=str(value))


class ServerCore:
    """The MCP server brain: registries for the three primitives and
    a pure handle() mapping one request dict to one response dict
    (or None for notifications). Transport-agnostic by design."""

    def __init__(self, name: str, version: str):
        self.server_info = {"name": name, "version": version}
        self.tools: dict[str, dict] = {}
        self.resources: dict[str, dict] = {}
        self.prompts: dict[str, dict] = {}
        self.initialized = False
        self.negotiated_version: Optional[str] = None
        self.client_info: dict = {}

    # ---- registration ----

    def add_tool(self, name: str, description: str, input_schema: dict,
                 handler: Callable[[dict], Any]) -> None:
        self.tools[name] = {"name": name, "description": description,
                            "inputSchema": input_schema or {"type": "object"},
                            "handler": handler}

    def add_resource(self, uri: str, name: str, description: str,
                     reader: Callable[[str], Any], mime_type: str = "application/json") -> None:
        self.resources[uri] = {"uri": uri, "name": name, "description": description,
                               "mimeType": mime_type, "reader": reader}

    def add_prompt(self, name: str, description: str, arguments: list,
                   renderer: Callable[[dict], list]) -> None:
        self.prompts[name] = {"name": name, "description": description,
                              "arguments": arguments, "renderer": renderer}

    # ---- message handling ----

    def handle_raw(self, raw: Any) -> Optional[str]:
        """One raw line/bytes in, one JSON line out (or None)."""
        try:
            msg = json.loads(raw) if isinstance(raw, (str, bytes)) else raw
        except Exception as e:
            return json.dumps(_error(None, PARSE_ERROR, f"parse error: {e}"))
        resp = self.handle(msg)
        return json.dumps(resp) if resp is not None else None

    def handle(self, msg: Any) -> Optional[dict]:
        if isinstance(msg, list):
            # MCP does not define batch requests (JSON-RPC batching was
            # removed from the protocol); reject the whole array.
            return _error(None, INVALID_REQUEST, "batch requests are not supported by MCP")
        if not isinstance(msg, dict) or msg.get("jsonrpc") != "2.0" or "method" not in msg:
            return _error(msg.get("id") if isinstance(msg, dict) else None,
                          INVALID_REQUEST, "not a JSON-RPC 2.0 request")
        method = msg["method"]
        params = msg.get("params") or {}
        is_notification = "id" not in msg
        if is_notification:
            # notifications/initialized completes the handshake; every
            # other notification is fire-and-forget by definition.
            return None
        req_id = msg["id"]
        if method == "initialize":
            return self._initialize(req_id, params)
        if not self.initialized:
            return _error(req_id, SERVER_NOT_INITIALIZED,
                          "server not initialized: the initialize handshake must come first")
        handler = {
            "ping": lambda: {},
            "tools/list": self._tools_list,
            "tools/call": lambda: self._tools_call(params),
            "resources/list": self._resources_list,
            "resources/read": lambda: self._resources_read(params),
            "resources/templates/list": lambda: {"resourceTemplates": []},
            "prompts/list": self._prompts_list,
            "prompts/get": lambda: self._prompts_get(params),
        }.get(method)
        if handler is None:
            return _error(req_id, METHOD_NOT_FOUND, f"method not found: {method}")
        try:
            return _result(req_id, handler())
        except MCPError as e:
            return _error(req_id, e.code, e.message, e.data)
        except Exception as e:  # a primitive handler failed mid-flight
            return _error(req_id, INTERNAL_ERROR, f"{type(e).__name__}: {e}")

    def _initialize(self, req_id: Any, params: dict) -> dict:
        requested = params.get("protocolVersion")
        # Spec: if the server supports the client's version it MUST
        # answer with it; otherwise it answers with its latest.
        negotiated = requested if requested in PROTOCOL_VERSIONS else LATEST_PROTOCOL_VERSION
        self.negotiated_version = negotiated
        self.client_info = params.get("clientInfo") or {}
        self.initialized = True
        caps: dict[str, Any] = {}
        if self.tools:
            caps["tools"] = {"listChanged": False}
        if self.resources:
            caps["resources"] = {"subscribe": False, "listChanged": False}
        if self.prompts:
            caps["prompts"] = {"listChanged": False}
        return _result(req_id, {"protocolVersion": negotiated,
                                "capabilities": caps,
                                "serverInfo": self.server_info})

    def _tools_list(self) -> dict:
        return {"tools": [{"name": t["name"], "description": t["description"],
                           "inputSchema": t["inputSchema"]}
                          for t in self.tools.values()]}

    def _tools_call(self, params: dict) -> dict:
        name = params.get("name")
        tool = self.tools.get(name)
        if tool is None:
            raise MCPError(INVALID_PARAMS, f"unknown tool: {name}")
        arguments = params.get("arguments") or {}
        try:
            outcome = _normalize_outcome(tool["handler"](arguments))
        except Exception as e:
            # Tool execution errors are RESULTS with isError, not
            # protocol errors — the model is meant to see and react.
            outcome = ToolOutcome(text=f"{type(e).__name__}: {e}", is_error=True)
        return outcome.to_result()

    def _resources_list(self) -> dict:
        return {"resources": [{"uri": r["uri"], "name": r["name"],
                               "description": r["description"], "mimeType": r["mimeType"]}
                              for r in self.resources.values()]}

    def _resources_read(self, params: dict) -> dict:
        uri = params.get("uri")
        res = self.resources.get(uri)
        if res is None:
            raise MCPError(RESOURCE_NOT_FOUND, f"resource not found: {uri}")
        value = res["reader"](uri)
        text = value if isinstance(value, str) else json.dumps(value, default=str)
        return {"contents": [{"uri": uri, "mimeType": res["mimeType"], "text": text}]}

    def _prompts_list(self) -> dict:
        return {"prompts": [{"name": p["name"], "description": p["description"],
                             "arguments": p["arguments"]} for p in self.prompts.values()]}

    def _prompts_get(self, params: dict) -> dict:
        name = params.get("name")
        prompt = self.prompts.get(name)
        if prompt is None:
            raise MCPError(INVALID_PARAMS, f"unknown prompt: {name}")
        arguments = params.get("arguments") or {}
        for spec in prompt["arguments"]:
            if spec.get("required") and spec["name"] not in arguments:
                raise MCPError(INVALID_PARAMS,
                               f"missing required prompt argument: {spec['name']}")
        messages = prompt["renderer"](arguments)
        return {"description": prompt["description"], "messages": messages}


# ------------------------------------------------------------------
# Client session + transports
# ------------------------------------------------------------------

class Transport:
    """Message transport contract: dicts in, dicts out."""

    def send(self, msg: dict) -> None: raise NotImplementedError

    def recv(self) -> dict: raise NotImplementedError

    def close(self) -> None: pass


class LoopbackTransport(Transport):
    """In-process transport: a ServerCore pumped on a daemon thread.
    This is the mock transport the test suite runs on — the protocol
    messages are real; only the wire is a queue."""

    def __init__(self, core: ServerCore):
        self._to_server: queue.Queue = queue.Queue()
        self._to_client: queue.Queue = queue.Queue()
        self._core = core
        self._thread = threading.Thread(target=self._pump, daemon=True)
        self._thread.start()

    def _pump(self) -> None:
        while True:
            msg = self._to_server.get()
            if msg is None:
                return
            resp = self._core.handle(msg)
            if resp is not None:
                self._to_client.put(resp)

    def send(self, msg: dict) -> None:
        self._to_server.put(msg)

    def recv(self) -> dict:
        return self._to_client.get()

    def close(self) -> None:
        self._to_server.put(None)


class StdioTransport(Transport):
    """Client side of the MCP stdio transport: spawn a server process,
    newline-delimited JSON over its stdin/stdout. Server stderr is
    inherited (spec: servers log to stderr, never to stdout)."""

    def __init__(self, command: list[str], cwd: Optional[str] = None,
                 env: Optional[dict] = None):
        self.proc = subprocess.Popen(command, stdin=subprocess.PIPE,
                                     stdout=subprocess.PIPE, text=True,
                                     cwd=cwd, env=env, bufsize=1)
        self._incoming: queue.Queue = queue.Queue()
        self._reader = threading.Thread(target=self._read_loop, daemon=True)
        self._reader.start()

    def _read_loop(self) -> None:
        assert self.proc.stdout is not None
        for line in self.proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                self._incoming.put(json.loads(line))
            except Exception:
                continue  # a non-JSON stdout line is a server bug; drop it

    def send(self, msg: dict) -> None:
        assert self.proc.stdin is not None
        self.proc.stdin.write(json.dumps(msg) + "\n")
        self.proc.stdin.flush()

    def recv(self) -> dict:
        return self._incoming.get()

    def close(self) -> None:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.terminate()
            self.proc.wait(timeout=5)
        except Exception:
            try:
                self.proc.kill()
            except Exception:
                pass


class ClientSession:
    """An MCP client host session over a Transport: performs the
    initialize handshake, then offers the primitive calls. Server
    notifications received while awaiting a response are stashed in
    .notifications, never mistaken for the response."""

    def __init__(self, transport: Transport, client_name: str = "wielder",
                 client_version: str = "1.0.0"):
        self.transport = transport
        self.client_info = {"name": client_name, "version": client_version}
        self._next_id = 1
        self.notifications: list[dict] = []
        self.server_result: Optional[dict] = None
        self.negotiated_version: Optional[str] = None

    def request(self, method: str, params: Optional[dict] = None) -> Any:
        req_id = self._next_id
        self._next_id += 1
        self.transport.send({"jsonrpc": "2.0", "id": req_id, "method": method,
                             "params": params or {}})
        while True:
            msg = self.transport.recv()
            if msg.get("id") != req_id:
                self.notifications.append(msg)  # a notification or stray frame
                continue
            if "error" in msg:
                err = msg["error"]
                raise MCPError(err.get("code", INTERNAL_ERROR),
                               err.get("message", "unknown error"), err.get("data"))
            return msg.get("result")

    def notify(self, method: str, params: Optional[dict] = None) -> None:
        self.transport.send({"jsonrpc": "2.0", "method": method, "params": params or {}})

    def initialize(self, protocol_version: str = LATEST_PROTOCOL_VERSION) -> dict:
        result = self.request("initialize", {
            "protocolVersion": protocol_version,
            "capabilities": {"roots": {"listChanged": False}},
            "clientInfo": self.client_info})
        negotiated = (result or {}).get("protocolVersion")
        if negotiated not in PROTOCOL_VERSIONS:
            raise MCPError(INVALID_REQUEST,
                           f"server negotiated a protocol version this host "
                           f"does not speak: {negotiated!r}")
        self.server_result = result
        self.negotiated_version = negotiated
        self.notify("notifications/initialized")
        return result

    def ping(self) -> dict:
        return self.request("ping")

    def list_tools(self) -> list:
        return (self.request("tools/list") or {}).get("tools", [])

    def call_tool(self, name: str, arguments: Optional[dict] = None) -> dict:
        return self.request("tools/call", {"name": name, "arguments": arguments or {}})

    def list_resources(self) -> list:
        return (self.request("resources/list") or {}).get("resources", [])

    def read_resource(self, uri: str) -> list:
        return (self.request("resources/read", {"uri": uri}) or {}).get("contents", [])

    def list_prompts(self) -> list:
        return (self.request("prompts/list") or {}).get("prompts", [])

    def get_prompt(self, name: str, arguments: Optional[dict] = None) -> dict:
        return self.request("prompts/get", {"name": name, "arguments": arguments or {}})

    def close(self) -> None:
        self.transport.close()


def serve_stdio(core: ServerCore, instream=None, outstream=None) -> None:
    """Server side of the stdio transport: read newline-delimited
    JSON-RPC from stdin, write responses to stdout, nothing else —
    stdout is the protocol channel; diagnostics belong on stderr."""
    instream = instream or sys.stdin
    outstream = outstream or sys.stdout
    for line in instream:
        line = line.strip()
        if not line:
            continue
        out = core.handle_raw(line)
        if out is not None:
            outstream.write(out + "\n")
            outstream.flush()
