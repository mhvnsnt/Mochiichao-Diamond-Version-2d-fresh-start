/*
 * grok-local PWA — pure request/response logic (no DOM in here).
 *
 * This file is the testable core of the chat app: app.js wires it to
 * the page; validation/pwa_mock_test.mjs exercises it in Node
 * against a local mock OpenAI endpoint. It is loaded as a plain
 * <script> in the browser (window.GrokLocal) and as a CommonJS
 * module in Node — no build step anywhere.
 *
 * Two modes:
 *   A "seat"  — talks to a grok-local vLLM endpoint (OpenAI API).
 *   B "phone" — WebLLM/WebGPU on the phone itself (mode B wrapper
 *               at the bottom; the engine loads lazily, only when
 *               the owner picks mode B).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.GrokLocal = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const DEFAULT_MODEL = "grok-local";

  // The Grok-pattern system prompt (from grok/PROFILE.md, our own
  // words): direct, honest about limits, tools when available.
  const SYSTEM_PROMPT = [
    "You are the owner's self-hosted assistant, running on their own",
    "open-weights seat. Answer directly and say the most useful true",
    "thing first. If you do not know, say so. You have no live access",
    "to the web, X, or any account unless a tool in this conversation",
    "gives it to you — never claim you checked something you did not.",
    "When a tool can answer better than memory, call it. If a",
    "question rests on a false premise, say so plainly and give the",
    "correct picture. Prefer a short complete answer over a long",
    "hedged one.",
  ].join(" ");

  function buildChatBody({ model, messages, stream, tools,
                           temperature } = {}) {
    const body = {
      model: model || DEFAULT_MODEL,
      messages: messages || [],
      stream: !!stream,
    };
    if (typeof temperature === "number") body.temperature = temperature;
    if (tools && tools.length) {
      body.tools = tools;
      body.tool_choice = "auto";
    }
    return body;
  }

  function chatUrl(base) {
    return String(base || "").replace(/\/+$/, "") + "/chat/completions";
  }

  function authHeaders(key) {
    const h = { "Content-Type": "application/json" };
    if (key) h["Authorization"] = "Bearer " + key;
    return h;
  }

  /*
   * SSE parsing: feed raw text chunks; returns the parsed events
   * plus the un-parsed remainder to prepend to the next chunk.
   * Events are the JSON payloads of `data:` lines; a literal
   * "[DONE]" yields { done: true }.
   */
  function parseSSEChunk(buffer, chunk) {
    const text = (buffer || "") + (chunk || "");
    const parts = text.split(/\r?\n\r?\n/);
    const rest = parts.pop();
    const events = [];
    for (const part of parts) {
      for (const line of part.split(/\r?\n/)) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") events.push({ done: true });
        else {
          try { events.push({ data: JSON.parse(data) }); }
          catch (e) { events.push({ error: "bad SSE JSON: " + data }); }
        }
      }
    }
    return { events, rest };
  }

  function deltaText(event) {
    if (!event || !event.data) return "";
    const choice = (event.data.choices || [])[0] || {};
    return (choice.delta && choice.delta.content) || "";
  }

  /*
   * Rendezvous: the current seat address, published by the running
   * session as one JSON file in a private Hugging Face dataset.
   * Shape (written by the free-test kernel):
   *   {endpoint, model, seat, status, started_at, key_fingerprint}
   * The rendezvous NEVER carries the API key. The fingerprint is a
   * change detector only (FNV-1a — not a security hash): it lets the
   * app warn "the seat's key changed" without storing anything
   * sensitive in the dataset.
   */
  function keyFingerprint(key) {
    if (!key) return "";
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  function rendezvousUrl(datasetId, baseUrl) {
    const base = (baseUrl || "https://huggingface.co").replace(/\/+$/, "");
    return base + "/datasets/" + datasetId +
      "/resolve/main/rendezvous.json";
  }

  async function fetchRendezvous({ datasetId, token, fetchImpl,
                                    baseUrl } = {}) {
    if (!datasetId) return { ok: false, reason: "no rendezvous set" };
    const doFetch = fetchImpl || fetch;
    const headers = {};
    if (token) headers["Authorization"] = "Bearer " + token;
    const res = await doFetch(rendezvousUrl(datasetId, baseUrl),
                              { headers });
    if (!res.ok) {
      return { ok: false, reason: "rendezvous HTTP " + res.status };
    }
    const data = await res.json();
    return parseRendezvous(data);
  }

  function parseRendezvous(data) {
    if (!data || typeof data.endpoint !== "string" ||
        !data.endpoint) {
      return { ok: false, reason: "rendezvous has no endpoint" };
    }
    return {
      ok: true,
      endpoint: data.endpoint.replace(/\/+$/, ""),
      model: data.model || DEFAULT_MODEL,
      seat: data.seat || "unknown seat",
      status: data.status || "live",
      startedAt: data.started_at || null,
      keyFingerprint: data.key_fingerprint || "",
    };
  }

  /*
   * Mode B — the PHONE SEAT, the flagship owned seat: the model
   * runs on the phone's own chip (WebLLM/WebGPU), no server, no
   * network after the one-time download. It is a mode of this
   * same app, not a separate product.
   *
   * Library: @mlc-ai/web-llm, Apache-2.0. Chosen for the owner's
   * actual phones (Motorola moto g stylus 5G - 2023 and Motorola
   * edge 2024 — mid-range Snapdragon/Adreno 710 class, 6-8 GB
   * RAM): the LARGEST Qwen3 MLC build that class honestly runs at
   * usable chat speed is the 1.7B q4f16 build (measured repo size
   * 979,424,190 bytes on HF). The 4B build (2,274,342,846 bytes)
   * is offered for the 8 GB phone with eyes open: slower, heavier,
   * and it can pressure a 6 GB phone's browser memory. Anything
   * bigger is not honest on this hardware. Weights derive from
   * Qwen/Qwen3-1.7B / Qwen/Qwen3-4B (Apache-2.0).
   * Expected speed on that GPU class: roughly 8-20 tok/s for the
   * 1.7B (ESTIMATE — proven on the owner's phone at first run; the
   * app surfaces the engine's own runtime stats after each reply).
   * WebGPU on Android: Chrome 121+, Android 12+, Qualcomm/ARM GPU
   * (web.dev, "WebGPU is now supported in major browsers") — both
   * of the owner's phones are in that class.
   */
  const MODE_B_MODELS = [
    {
      id: "Qwen3-1.7B-q4f16_1-MLC",
      label: "Qwen3 1.7B — the phone seat (both phones)",
      params: "1.7B",
      downloadBytes: 979424190,
      note: "Downloads ~0.98 GB once, then runs fully offline on " +
        "the phone's chip. Small brain: quick answers, drafts, " +
        "chat — not a substitute for the big seat's depth.",
    },
    {
      id: "Qwen3-4B-q4f16_1-MLC",
      label: "Qwen3 4B — bigger brain (8 GB phone only)",
      params: "4B",
      downloadBytes: 2274342846,
      note: "Downloads ~2.27 GB once. For the Motorola edge 2024 " +
        "(8 GB). Slower replies; on a 6 GB phone the browser may " +
        "kill the tab under memory pressure.",
    },
  ];
  const MODE_B_MODEL = MODE_B_MODELS[0].id;
  const MODE_B_MODEL_LABEL = MODE_B_MODELS[0].label;
  const MODE_B_DOWNLOAD_NOTE =
    "First use downloads the model once (~0.98 GB, measured) " +
    "into this phone's browser storage and caches it; after " +
    "that, chat works with zero network — airplane mode included.";

  function modeBModel(id) {
    return MODE_B_MODELS.find((m) => m.id === id) ||
      MODE_B_MODELS[0];
  }

  function webgpuSupport(nav) {
    const n = nav || (typeof navigator !== "undefined"
      ? navigator : null);
    if (!n) return { ok: false, reason: "no navigator (not a browser)" };
    if (!("gpu" in n) || !n.gpu) {
      return { ok: false,
               reason: "WebGPU is not available in this browser. " +
                 "Mode B needs Chrome 121+ on Android 12+ with a " +
                 "Qualcomm/ARM GPU (or a desktop Chrome/Edge)." };
    }
    return { ok: true };
  }

  /*
   * Wrap a web-llm module (injected, so tests can stub it) into the
   * same chat shape mode A uses. loadModule is an async function
   * returning the web-llm module; app.js passes a dynamic import of
   * the CDN build, tests pass a fake.
   */
  function createWebLLMEngine({ loadModule, model } = {}) {
    let engine = null;
    return {
      model: model || MODE_B_MODEL,
      async init(onProgress) {
        const webllm = await loadModule();
        engine = await webllm.CreateMLCEngine(this.model, {
          initProgressCallback: (report) => {
            if (onProgress) {
              onProgress({ text: report.text || "",
                           progress: report.progress || 0 });
            }
          },
        });
        return this;
      },
      async chat(messages, onDelta) {
        if (!engine) throw new Error("mode B engine not initialised");
        const stream = await engine.chat.completions.create({
          messages, stream: true, model: this.model,
        });
        let full = "";
        for await (const chunk of stream) {
          const piece =
            (((chunk.choices || [])[0] || {}).delta || {}).content
            || "";
          full += piece;
          if (onDelta && piece) onDelta(piece);
        }
        return full;
      },
      get ready() { return !!engine; },
      statsText() {
        // The engine's own numbers (web-llm runtimeStatsText) —
        // the first-run proof readout for the phone seat.
        try {
          return engine && engine.runtimeStatsText
            ? engine.runtimeStatsText() : "";
        } catch (e) { return ""; }
      },
    };
  }

  return {
    DEFAULT_MODEL, SYSTEM_PROMPT, MODE_B_MODEL, MODE_B_MODELS,
    MODE_B_MODEL_LABEL, MODE_B_DOWNLOAD_NOTE, modeBModel,
    buildChatBody, chatUrl, authHeaders,
    parseSSEChunk, deltaText, keyFingerprint, rendezvousUrl,
    fetchRendezvous, parseRendezvous, webgpuSupport,
    createWebLLMEngine,
  };
});
