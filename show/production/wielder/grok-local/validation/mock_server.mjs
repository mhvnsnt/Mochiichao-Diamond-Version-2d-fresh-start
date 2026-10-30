/*
 * Mock OpenAI-compatible endpoint for the PWA tests — Node stdlib.
 *
 * Implements just enough of the seat contract to exercise api.js
 * for real over HTTP:
 *   GET  /v1/models
 *   POST /v1/chat/completions   (JSON, SSE stream, and a tool-call
 *                                round for the weather question)
 *   GET  /datasets/:owner/:name/resolve/main/rendezvous.json
 *        (same path shape huggingface.co serves, so the PWA's
 *        rendezvous fetch runs unmodified against this host)
 */
"use strict";
import http from "http";

const RENDEZVOUS = {
  endpoint: "http://127.0.0.1:PORT/v1",
  model: "grok-local",
  seat: "mock-seat",
  status: "live",
  started_at: "2026-10-28T00:00:00Z",
  key_fingerprint: "", // filled by the test from api.js
};

function chatResponse(body) {
  const last = (body.messages || []).slice(-1)[0] || {};
  const hasTools = Array.isArray(body.tools) && body.tools.length > 0;
  if (hasTools && last.role === "user" &&
      /weather/i.test(last.content || "")) {
    return {
      id: "chatcmpl-mock-tool", object: "chat.completion",
      model: body.model,
      choices: [{
        index: 0,
        message: {
          role: "assistant", content: null,
          tool_calls: [{
            id: "call_mock_1", type: "function",
            function: {
              name: "get_weather",
              arguments: JSON.stringify({ location: "Testville" }),
            },
          }],
        },
        finish_reason: "tool_calls",
      }],
    };
  }
  if (last.role === "tool") {
    return {
      id: "chatcmpl-mock-final", object: "chat.completion",
      model: body.model,
      choices: [{
        index: 0,
        message: { role: "assistant",
                   content: "It is sunny in Testville (mock data)." },
        finish_reason: "stop",
      }],
    };
  }
  return {
    id: "chatcmpl-mock", object: "chat.completion", model: body.model,
    choices: [{
      index: 0,
      message: { role: "assistant",
                 content: "Mock seat answer: hello from the mock." },
      finish_reason: "stop",
    }],
  };
}

function sseChunks(body) {
  const pieces = ["Mock ", "seat ", "answer: ", "hello ", "from ",
                  "the ", "mock."];
  const out = pieces.map((p) => "data: " + JSON.stringify({
    id: "chatcmpl-mock", object: "chat.completion.chunk",
    model: body.model,
    choices: [{ index: 0, delta: { content: p },
                finish_reason: null }],
  }) + "\n\n");
  out.push("data: [DONE]\n\n");
  return out;
}

function makeServer(rendezvous) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/v1/models") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        object: "list",
        data: [{ id: "grok-local", object: "model" }],
      }));
      return;
    }
    if (url.pathname.endsWith("/resolve/main/rendezvous.json")) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(rendezvous));
      return;
    }
    if (url.pathname === "/v1/chat/completions" &&
        req.method === "POST") {
      let raw = "";
      req.on("data", (c) => { raw += c; });
      req.on("end", () => {
        const body = JSON.parse(raw || "{}");
        if (body.stream) {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          });
          for (const chunk of sseChunks(body)) res.write(chunk);
          res.end();
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(chatResponse(body)));
        }
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found: " + url.pathname }));
  });
}

export { makeServer, RENDEZVOUS };
