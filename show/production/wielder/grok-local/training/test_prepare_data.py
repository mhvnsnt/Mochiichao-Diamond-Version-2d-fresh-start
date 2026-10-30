"""Unit tests for prepare_data.py's converters — fabricated rows in
each source's documented format (the real downloads happen on the
seat; the conversion logic is proven here).

Run: python3 -m pytest test_prepare_data.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import prepare_data as pd  # noqa: E402


def test_glaive_full_round():
    row = {
        "system": "You are a helpful assistant.",
        "chat": (
            "USER: What's the weather in Paris?\n"
            'ASSISTANT: {"name": "get_weather", "arguments": '
            '{"location": "Paris"}}\n'
            'FUNCTION RESPONSE: {"conditions": "rain"}\n'
            "ASSISTANT: It is raining in Paris."
        ),
        "tools": "[]",
    }
    ex = pd.glaive_row_to_example(row)
    assert ex is not None
    kinds = [t["from"] for t in ex["conversations"]]
    assert kinds == ["human", "function_call", "observation", "gpt"]
    call = json.loads(ex["conversations"][1]["value"])
    assert call["name"] == "get_weather"
    assert call["arguments"]["location"] == "Paris"
    assert ex["system"] == "You are a helpful assistant."


def test_glaive_plain_chat_stays_text():
    row = {"chat": "USER: Hi\nASSISTANT: Hello! How can I help?"}
    ex = pd.glaive_row_to_example(row)
    assert [t["from"] for t in ex["conversations"]] == ["human", "gpt"]


def test_glaive_junk_returns_none():
    assert pd.glaive_row_to_example({"chat": ""}) is None
    assert pd.glaive_row_to_example({}) is None


def test_xlam_row():
    row = {
        "query": "Weather in Rome?",
        "tools": json.dumps([{"name": "get_weather"}]),
        "answers": json.dumps(
            [{"name": "get_weather",
              "arguments": {"location": "Rome"}}]),
    }
    ex = pd.xlam_row_to_example(row)
    assert [t["from"] for t in ex["conversations"]] == [
        "human", "function_call"]
    call = json.loads(ex["conversations"][1]["value"])
    assert call["arguments"] == {"location": "Rome"}


def test_xlam_no_answers_returns_none():
    assert pd.xlam_row_to_example(
        {"query": "hi", "answers": "[]"}) is None


def test_messages_row_with_system():
    row = {"messages": [
        {"role": "system", "content": "Be direct."},
        {"role": "user", "content": "2+2?"},
        {"role": "assistant", "content": "4."},
    ]}
    ex = pd.messages_row_to_example(row)
    assert ex["system"] == "Be direct."
    assert [t["from"] for t in ex["conversations"]] == ["human", "gpt"]


def test_messages_row_too_short():
    assert pd.messages_row_to_example(
        {"messages": [{"role": "user", "content": "hi"}]}) is None


def test_dataset_info_shape():
    info = pd.dataset_info()
    assert set(info) == {"grok_local_tools", "grok_local_chat",
                         "grok_local_seeds"}
    for entry in info.values():
        assert entry["formatting"] == "sharegpt"
        assert entry["tags"]["function_tag"] == "function_call"
        assert entry["file_name"].endswith(".jsonl")
