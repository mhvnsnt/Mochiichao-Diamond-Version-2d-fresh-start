"""Agents-wave MCP tests (2026-10-28): the dependency-free protocol
core (wielder/mcp_protocol.py), the first-class Wielder MCP server
(wielder/mcp_wielder_server.py), the cross-harness schema export
(wielder/tool_schemas.py), and the model-card / verification module
(wielder/model_card.py).

Transports under test are REAL protocol messages throughout: the
loopback transport is a queue, and the stdio test spawns
`python -m wielder.mcp_wielder_server` as a subprocess and speaks
newline-delimited JSON-RPC to it — the same wire any MCP host
(Claude Code, Codex, Gemini CLI) would use. No network, no keys, no
third-party MCP server. The pre-existing SDK bridge
(wielder/mcp_client.py, wielder/mcp_server.py) is untouched by this
suite; its config file is only read, to prove the wave did not
disturb it.

Run: python -m pytest wielder/tests/test_mcp_wave.py -q
(from the package parent dir)
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pytest

from wielder import mcp_protocol as P


# ------------------------------------------------------------------
# A demo server core for the protocol unit tests
# ------------------------------------------------------------------

def demo_core() -> P.ServerCore:
    core = P.ServerCore("demo", "0.1")

    def echo(arguments):
        return P.ToolOutcome(text=f"echo:{arguments.get('text', '')}",
                             structured={"echo": arguments.get("text", "")})

    def boom(arguments):
        raise ValueError("kaboom")

    core.add_tool("echo", "Echo the text argument back.",
                  {"type": "object", "properties": {"text": {"type": "string"}},
                   "required": ["text"]}, echo)
    core.add_tool("boom", "Always raises.", {"type": "object"}, boom)
    core.add_resource("demo://readme", "Readme", "A demo resource.",
                      lambda uri: {"hello": "world"})
    core.add_prompt("greet", "Greet someone.",
                    [{"name": "who", "description": "Name", "required": True}],
                    lambda a: [{"role": "user", "content":
                                {"type": "text", "text": f"Say hello to {a['who']}."}}])
    return core


def req(req_id, method, params=None):
    return {"jsonrpc": "2.0", "id": req_id, "method": method, "params": params or {}}


def initialized_core() -> P.ServerCore:
    core = demo_core()
    core.handle(req(1, "initialize", {"protocolVersion": "2025-06-18",
                                      "capabilities": {}, "clientInfo": {"name": "t", "version": "0"}}))
    return core


# ------------------------------------------------------------------
# Protocol core: lifecycle + negotiation
# ------------------------------------------------------------------

def test_request_before_initialize_is_rejected():
    core = demo_core()
    resp = core.handle(req(1, "tools/list"))
    assert resp["error"]["code"] == P.SERVER_NOT_INITIALIZED


def test_initialize_echoes_a_supported_client_version():
    core = demo_core()
    resp = core.handle(req(1, "initialize", {"protocolVersion": "2024-11-05",
                                             "capabilities": {}, "clientInfo": {}}))
    assert resp["result"]["protocolVersion"] == "2024-11-05"
    assert resp["result"]["serverInfo"] == {"name": "demo", "version": "0.1"}
    assert set(resp["result"]["capabilities"]) == {"tools", "resources", "prompts"}


def test_initialize_with_unknown_version_answers_latest():
    core = demo_core()
    resp = core.handle(req(1, "initialize", {"protocolVersion": "1999-01-01",
                                             "capabilities": {}, "clientInfo": {}}))
    assert resp["result"]["protocolVersion"] == P.LATEST_PROTOCOL_VERSION


def test_notifications_get_no_response():
    core = initialized_core()
    assert core.handle({"jsonrpc": "2.0", "method": "notifications/initialized"}) is None
    assert core.handle({"jsonrpc": "2.0", "method": "notifications/cancelled",
                        "params": {"requestId": 9}}) is None


def test_ping_and_unknown_method():
    core = initialized_core()
    assert core.handle(req(2, "ping"))["result"] == {}
    resp = core.handle(req(3, "no/such-method"))
    assert resp["error"]["code"] == P.METHOD_NOT_FOUND


def test_parse_error_and_batch_rejection():
    core = initialized_core()
    resp = json.loads(core.handle_raw("{not json"))
    assert resp["error"]["code"] == P.PARSE_ERROR
    resp = core.handle([req(1, "ping")])
    assert resp["error"]["code"] == P.INVALID_REQUEST


# ------------------------------------------------------------------
# Protocol core: the three primitives
# ------------------------------------------------------------------

def test_tools_list_and_call():
    core = initialized_core()
    tools = core.handle(req(2, "tools/list"))["result"]["tools"]
    assert [t["name"] for t in tools] == ["echo", "boom"]
    assert tools[0]["inputSchema"]["required"] == ["text"]
    out = core.handle(req(3, "tools/call", {"name": "echo", "arguments": {"text": "hi"}}))["result"]
    assert out["isError"] is False
    assert out["content"] == [{"type": "text", "text": "echo:hi"}]
    assert out["structuredContent"] == {"echo": "hi"}


def test_tools_call_unknown_tool_is_invalid_params():
    core = initialized_core()
    resp = core.handle(req(2, "tools/call", {"name": "nope", "arguments": {}}))
    assert resp["error"]["code"] == P.INVALID_PARAMS


def test_tool_handler_exception_is_an_iserror_result_not_a_protocol_error():
    core = initialized_core()
    out = core.handle(req(2, "tools/call", {"name": "boom", "arguments": {}}))["result"]
    assert out["isError"] is True
    assert "kaboom" in out["content"][0]["text"]


def test_resources_list_and_read():
    core = initialized_core()
    resources = core.handle(req(2, "resources/list"))["result"]["resources"]
    assert resources[0]["uri"] == "demo://readme"
    contents = core.handle(req(3, "resources/read", {"uri": "demo://readme"}))["result"]["contents"]
    assert json.loads(contents[0]["text"]) == {"hello": "world"}
    resp = core.handle(req(4, "resources/read", {"uri": "demo://missing"}))
    assert resp["error"]["code"] == P.RESOURCE_NOT_FOUND


def test_prompts_list_get_and_missing_argument():
    core = initialized_core()
    prompts = core.handle(req(2, "prompts/list"))["result"]["prompts"]
    assert prompts[0]["name"] == "greet"
    got = core.handle(req(3, "prompts/get", {"name": "greet", "arguments": {"who": "Ada"}}))["result"]
    assert got["messages"][0]["content"]["text"] == "Say hello to Ada."
    resp = core.handle(req(4, "prompts/get", {"name": "greet", "arguments": {}}))
    assert resp["error"]["code"] == P.INVALID_PARAMS


# ------------------------------------------------------------------
# Client session over the loopback transport (real messages, queue wire)
# ------------------------------------------------------------------

def test_client_session_loopback_round_trip():
    session = P.ClientSession(P.LoopbackTransport(demo_core()), client_name="test-host")
    result = session.initialize("2025-11-25")
    assert result["serverInfo"]["name"] == "demo"
    assert session.negotiated_version == "2025-11-25"
    assert session.ping() == {}
    assert [t["name"] for t in session.list_tools()] == ["echo", "boom"]
    out = session.call_tool("echo", {"text": "loop"})
    assert out["structuredContent"] == {"echo": "loop"}
    contents = session.read_resource("demo://readme")
    assert json.loads(contents[0]["text"]) == {"hello": "world"}
    got = session.get_prompt("greet", {"who": "Grace"})
    assert "Grace" in got["messages"][0]["content"]["text"]
    with pytest.raises(P.MCPError) as ei:
        session.call_tool("missing-tool")
    assert ei.value.code == P.INVALID_PARAMS
    session.close()


# ------------------------------------------------------------------
# The Wielder server: real registry, in-process
# ------------------------------------------------------------------

def test_wielder_server_exposes_every_registry_tool():
    from wielder import mcp_wielder_server as S
    from wielder import tools
    core = S.build_server()
    assert sorted(core.tools) == sorted(tools.REGISTRY)
    assert set(core.resources) == {S.CONSTITUTION_URI, S.TOOLS_URI}
    assert "wielder_run_card" in core.prompts


def test_wielder_server_calls_real_tools(tmp_path):
    from wielder import mcp_wielder_server as S
    session = P.ClientSession(P.LoopbackTransport(S.build_server()))
    session.initialize()
    target = tmp_path / "artifact.bin"
    target.write_bytes(b"wielder-mcp-wave")
    out = session.call_tool("check_artifact", {"path": str(target)})
    structured = out["structuredContent"]
    assert structured["ok"] is True
    assert structured["result"]["exists_nonempty"] is True
    out = session.call_tool("hash_file", {"path": str(target)})
    assert out["structuredContent"]["result"]["sha256"] == \
        hashlib.sha256(b"wielder-mcp-wave").hexdigest()
    # an invalid payload is an isError tool result, not a crash
    out = session.call_tool("check_artifact", {"wrong_field": 1})
    assert out["isError"] is True
    session.close()


def test_wielder_server_resources_and_prompt():
    from wielder import mcp_wielder_server as S
    session = P.ClientSession(P.LoopbackTransport(S.build_server()))
    session.initialize()
    contents = session.read_resource(S.CONSTITUTION_URI)
    doc = json.loads(contents[0]["text"])
    assert "PLANNING" in doc["states"]
    assert doc["wip_limit"] >= 1
    contents = session.read_resource(S.TOOLS_URI)
    names = [t["name"] for t in json.loads(contents[0]["text"])["tools"]]
    assert "run_verifier" in names
    got = session.get_prompt("wielder_run_card", {"card_id": "42"})
    assert "42" in got["messages"][0]["content"]["text"]
    assert "verifier is the only pass issuer" in got["messages"][0]["content"]["text"]
    session.close()


# ------------------------------------------------------------------
# The Wielder server over real stdio (subprocess — the host wire)
# ------------------------------------------------------------------

def test_wielder_server_over_stdio_subprocess(tmp_path):
    package_parent = Path(__file__).resolve().parents[2]
    transport = P.StdioTransport(
        [sys.executable, "-m", "wielder.mcp_wielder_server"], cwd=str(package_parent))
    session = P.ClientSession(transport, client_name="pytest-host")
    try:
        result = session.initialize()
        assert result["serverInfo"]["name"] == "wielder-mcp"
        names = [t["name"] for t in session.list_tools()]
        assert "hash_file" in names and "run_verifier" in names
        target = tmp_path / "clip.mp4"
        target.write_bytes(b"\x00" * 64)
        out = session.call_tool("hash_file", {"path": str(target)})
        assert out["structuredContent"]["result"]["sha256"] == \
            hashlib.sha256(b"\x00" * 64).hexdigest()
    finally:
        session.close()


# ------------------------------------------------------------------
# Cross-harness schema export
# ------------------------------------------------------------------

def test_every_native_tool_has_a_written_description():
    from wielder import tool_schemas, tools
    for entry in tool_schemas.canonical_tools():
        assert entry["description"] != f"Wielder tool: {entry['name']}"
        assert entry["name"] in tools.REGISTRY


def test_four_dialects_carry_the_same_tools():
    from wielder import tool_schemas, tools
    names = sorted(tools.REGISTRY)
    assert [t["name"] for t in tool_schemas.to_mcp_tools()] == names
    assert [t["name"] for t in tool_schemas.to_anthropic_tools()] == names
    assert [f["function"]["name"] for f in tool_schemas.to_openai_functions()] == names
    assert [d["name"] for d in tool_schemas.to_gemini_declarations()] == names
    mcp_tool = tool_schemas.to_mcp_tools()[0]
    assert mcp_tool["inputSchema"]["type"] == "object"
    openai_fn = tool_schemas.to_openai_functions()[0]
    assert openai_fn["type"] == "function"
    assert "title" not in openai_fn["function"]["parameters"]


def test_gemini_parameters_stay_inside_the_gemini_subset():
    from wielder import tool_schemas
    banned = {"title", "additionalProperties", "$defs", "$ref", "default"}

    def walk(node):
        if isinstance(node, dict):
            assert not (set(node) & banned), f"gemini schema carries {set(node) & banned}"
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    for decl in tool_schemas.to_gemini_declarations():
        walk(decl["parameters"])


# ------------------------------------------------------------------
# Model cards + verification (model-seat layer)
# ------------------------------------------------------------------

def test_model_card_round_trip():
    from wielder import model_card as MC
    meta = {"license": "Apache-2.0", "base_model": "Qwen/Qwen3-30B-A3B-Instruct-2507",
            "library_name": "vllm", "pipeline_tag": "text-generation",
            "tags": ["wielder-seat", "awq", "moe"]}
    text = MC.render_model_card(meta, "# Seat card\n\nBody line.")
    parsed = MC.parse_model_card(text)
    assert parsed["meta"]["license"] == "Apache-2.0"
    assert parsed["meta"]["base_model"] == meta["base_model"]
    assert parsed["meta"]["tags"] == ["wielder-seat", "awq", "moe"]
    assert "Body line." in parsed["body"]


def test_model_card_refuses_no_licence():
    from wielder import model_card as MC
    with pytest.raises(ValueError):
        MC.render_model_card({"base_model": "x/y"})


def test_verify_model_files_against_pinned_table(tmp_path):
    from wielder import model_card as MC
    (tmp_path / "a.safetensors").write_bytes(b"A" * 128)
    (tmp_path / "config.json").write_text("{}")
    files = {"a.safetensors": {"size": 128,
                               "sha256": hashlib.sha256(b"A" * 128).hexdigest()},
             "config.json": {"size": 2}}
    report = MC.verify_model_files(files, tmp_path)
    assert report["ok"] is True
    (tmp_path / "a.safetensors").write_bytes(b"B" * 128)  # same size, wrong bytes
    report = MC.verify_model_files(files, tmp_path)
    assert report["ok"] is False
    assert any("sha256" in f for f in report["failures"])
    report = MC.verify_model_files({"ghost.bin": {"size": 1}}, tmp_path)
    assert report["ok"] is False
    assert any("missing" in f for f in report["failures"])


def test_verify_variant_reads_the_groklocal_manifest_shape(tmp_path):
    from wielder import model_card as MC
    (tmp_path / "w.bin").write_bytes(b"1234")
    manifest = {"variants": {"free-seat": {"repo": "x/y", "revision": "abc",
                                           "files": {"w.bin": {"size": 4}}}}}
    report = MC.verify_variant(manifest, "free-seat", tmp_path)
    assert report["ok"] is True and report["repo"] == "x/y"
    assert MC.verify_variant(manifest, "nope", tmp_path)["ok"] is False
    unpinned = {"variants": {"src": {"repo": "x/y", "revision": "abc", "files": None}}}
    assert MC.verify_variant(unpinned, "src", tmp_path)["ok"] is False


def test_hash_manifest_for_dir_records_real_hashes(tmp_path):
    from wielder import model_card as MC
    (tmp_path / "w.bin").write_bytes(b"1234")
    record = MC.hash_manifest_for_dir(tmp_path, ["w.bin"])
    assert record["files"]["w.bin"]["size"] == 4
    assert record["files"]["w.bin"]["sha256"] == hashlib.sha256(b"1234").hexdigest()
    assert record["total_bytes_all_files"] == 4


# ------------------------------------------------------------------
# The pre-existing SDK bridge is undisturbed
# ------------------------------------------------------------------

def test_existing_mcp_client_config_still_loads():
    from wielder import mcp_client
    assert mcp_client.load_servers() == []  # shipped config: empty by default
