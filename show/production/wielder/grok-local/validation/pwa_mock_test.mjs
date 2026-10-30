/*
 * PWA wiring test — exercises pwa/api.js for real:
 *   - pure functions (payload builder, SSE parser, rendezvous
 *     parsing, WebGPU support gate, key fingerprint)
 *   - live HTTP against validation/mock_server.mjs (chat, SSE
 *     streaming reassembly, a full tool-call round, and the
 *     rendezvous read path with the huggingface.co path shape)
 *   - mode B: createWebLLMEngine against a stubbed web-llm module
 *     (progress events + streamed chat plumbing)
 *   - static checks on the shipped PWA files
 * Run: node pwa_mock_test.mjs   (transcript: pwa-mock-test.txt)
 */
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { makeServer, RENDEZVOUS } from "./mock_server.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const G = require(path.join(here, "..", "pwa", "api.js"));

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? "PASS " : "FAIL ") + name +
              (extra ? " — " + extra : ""));
  if (!cond) failures++;
}

/* ---------- pure functions ---------- */
const body = G.buildChatBody({
  model: "grok-local",
  messages: [{ role: "user", content: "hi" }],
  tools: [{ type: "function",
            function: { name: "get_weather",
                        parameters: { type: "object",
                                      properties: {} } } }],
});
check("buildChatBody shape",
      body.model === "grok-local" && body.stream === false &&
      body.tool_choice === "auto" && body.tools.length === 1);
check("chatUrl trims slashes",
      G.chatUrl("http://x/v1//") === "http://x/v1/chat/completions");
check("authHeaders with/without key",
      G.authHeaders("k").Authorization === "Bearer k" &&
      !("Authorization" in G.authHeaders(null)));
check("keyFingerprint stable + discriminating",
      G.keyFingerprint("secret-1") === G.keyFingerprint("secret-1") &&
      G.keyFingerprint("secret-1") !== G.keyFingerprint("secret-2") &&
      G.keyFingerprint("") === "");

let parsed = G.parseSSEChunk("", 'data: {"choices":[{"delta":');
parsed = G.parseSSEChunk(parsed.rest,
  '{"content":"Hel"}}]}\n\ndata: {"choices":[{"delta":' +
  '{"content":"lo"}}]}\n\ndata: [DONE]\n\n');
const texts = parsed.events.map((e) => G.deltaText(e)).join("");
check("parseSSEChunk across chunk boundary",
      texts === "Hello" &&
      parsed.events.some((e) => e.done === true),
      "reassembled: " + JSON.stringify(texts));

const rvOk = G.parseRendezvous({
  endpoint: "https://abc.trycloudflare.com/v1/", model: "grok-local",
  seat: "kaggle-free-test", status: "live",
  key_fingerprint: "deadbeef" });
check("parseRendezvous ok + trims slash",
      rvOk.ok && rvOk.endpoint === "https://abc.trycloudflare.com/v1" &&
      rvOk.keyFingerprint === "deadbeef");
check("parseRendezvous rejects junk",
      G.parseRendezvous({}).ok === false &&
      G.parseRendezvous(null).ok === false);
check("rendezvousUrl shape",
      G.rendezvousUrl("me/grok-local-rendezvous") ===
      "https://huggingface.co/datasets/me/grok-local-rendezvous" +
      "/resolve/main/rendezvous.json");

check("webgpuSupport: no gpu -> honest refusal",
      G.webgpuSupport({}).ok === false &&
      /WebGPU is not available/.test(G.webgpuSupport({}).reason));
check("webgpuSupport: gpu present -> ok",
      G.webgpuSupport({ gpu: {} }).ok === true);

/* ---------- live HTTP against the mock seat ---------- */
const KEY = "test-key-123";
RENDEZVOUS.key_fingerprint = G.keyFingerprint(KEY);
const server = makeServer(RENDEZVOUS);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const base = "http://127.0.0.1:" + port + "/v1";
RENDEZVOUS.endpoint = base;
console.log("mock seat listening at " + base);

// plain chat
let res = await fetch(G.chatUrl(base), {
  method: "POST", headers: G.authHeaders(KEY),
  body: JSON.stringify(G.buildChatBody({
    messages: [{ role: "user", content: "hello" }] })),
});
let data = await res.json();
check("live chat completion",
      res.ok && data.choices[0].message.content.includes("Mock seat"),
      data.choices[0].message.content);

// streaming, reassembled exactly the way app.js does it
res = await fetch(G.chatUrl(base), {
  method: "POST", headers: G.authHeaders(KEY),
  body: JSON.stringify(G.buildChatBody({
    messages: [{ role: "user", content: "hello" }], stream: true })),
});
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "", full = "";
for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  const p = G.parseSSEChunk(buffer,
    decoder.decode(value, { stream: true }));
  buffer = p.rest;
  for (const ev of p.events) full += G.deltaText(ev);
}
check("live SSE stream reassembly",
      full === "Mock seat answer: hello from the mock.",
      JSON.stringify(full));

// tool-call round: ask with tools -> tool_calls -> feed result -> final
const weatherTool = [{
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the weather for a place (mock).",
    parameters: { type: "object",
                  properties: { location: { type: "string" } },
                  required: ["location"] },
  },
}];
const msgs = [{ role: "user",
                content: "What is the weather in Testville?" }];
res = await fetch(G.chatUrl(base), {
  method: "POST", headers: G.authHeaders(KEY),
  body: JSON.stringify(G.buildChatBody({ messages: msgs,
                                         tools: weatherTool })),
});
data = await res.json();
const call = data.choices[0].message.tool_calls?.[0];
check("tool call emitted",
      !!call && call.function.name === "get_weather" &&
      JSON.parse(call.function.arguments).location === "Testville",
      JSON.stringify(call?.function));
msgs.push(data.choices[0].message);
msgs.push({ role: "tool", tool_call_id: call.id,
            content: JSON.stringify({ location: "Testville",
                                      conditions: "sunny" }) });
res = await fetch(G.chatUrl(base), {
  method: "POST", headers: G.authHeaders(KEY),
  body: JSON.stringify(G.buildChatBody({ messages: msgs,
                                         tools: weatherTool })),
});
data = await res.json();
check("tool result -> final answer",
      data.choices[0].message.content.includes("sunny in Testville"),
      data.choices[0].message.content);

// rendezvous read path (HF path shape, mock host)
const rv = await G.fetchRendezvous({
  datasetId: "me/grok-local-rendezvous", token: "hf_read_token",
  baseUrl: "http://127.0.0.1:" + port });
check("fetchRendezvous live",
      rv.ok && rv.endpoint === base && rv.seat === "mock-seat" &&
      rv.keyFingerprint === G.keyFingerprint(KEY),
      JSON.stringify(rv));
server.close();

/* ---------- mode B with a stubbed web-llm module ---------- */
const progressSeen = [];
let createdForModel = null;
const fakeModule = {
  async CreateMLCEngine(model, opts) {
    createdForModel = model;
    opts.initProgressCallback({ text: "loading weights", progress: 0.5 });
    return {
      runtimeStatsText: () => "decode: 14.2 tok/s (stub)",
      chat: { completions: { create: async (req) => {
        check("mode B request shape",
              req.stream === true && req.model === G.MODE_B_MODEL &&
              Array.isArray(req.messages));
        return (async function* () {
          yield { choices: [{ delta: { content: "On-" } }] };
          yield { choices: [{ delta: { content: "phone " } }] };
          yield { choices: [{ delta: { content: "answer." } }] };
        })();
      } } },
    };
  },
};
const engine = G.createWebLLMEngine({
  loadModule: async () => fakeModule });
await engine.init((p) => progressSeen.push(p));
let deltas = "";
const fullB = await engine.chat(
  [{ role: "user", content: "hi" }], (d) => { deltas += d; });
check("mode B engine init + progress",
      engine.ready && progressSeen.length === 1 &&
      progressSeen[0].progress === 0.5);
check("mode B streamed chat",
      fullB === "On-phone answer." && deltas === fullB,
      JSON.stringify(fullB));
check("mode B created for the default (1.7B) model",
      createdForModel === "Qwen3-1.7B-q4f16_1-MLC");
check("mode B stats readout delegates to the engine",
      engine.statsText().includes("14.2 tok/s"));

/* phone-seat model choice: measured sizes, deliberate ladder */
check("MODE_B_MODELS measured sizes (HF usedStorage)",
      G.MODE_B_MODELS.length === 2 &&
      G.MODE_B_MODELS[0].downloadBytes === 979424190 &&
      G.MODE_B_MODELS[1].downloadBytes === 2274342846);
check("modeBModel picks + falls back to the 1.7B",
      G.modeBModel("Qwen3-4B-q4f16_1-MLC").params === "4B" &&
      G.modeBModel("nonsense").id === G.MODE_B_MODEL);
const engine4b = G.createWebLLMEngine({
  loadModule: async () => fakeModule, model: "Qwen3-4B-q4f16_1-MLC" });
await engine4b.init(() => {});
check("mode B engine honors the 4B selection",
      createdForModel === "Qwen3-4B-q4f16_1-MLC");

/* ---------- static checks on the shipped files ---------- */
const pwaDir = path.join(here, "..", "pwa");
const manifest = JSON.parse(
  fs.readFileSync(path.join(pwaDir, "manifest.webmanifest"), "utf8"));
check("manifest parses, standalone + icons",
      manifest.display === "standalone" &&
      manifest.icons.length === 2);
for (const icon of manifest.icons) {
  const p = path.join(pwaDir, icon.src);
  const buf = fs.readFileSync(p);
  const size = parseInt(icon.sizes.split("x")[0], 10);
  const w = buf.readUInt32BE(16);
  check("icon " + icon.src + " real PNG, declared size",
        buf.subarray(0, 4).toString("hex") === "89504e47" &&
        w === size, w + "x" + buf.readUInt32BE(20));
}
const indexHtml = fs.readFileSync(path.join(pwaDir, "index.html"),
                                  "utf8");
check("index.html wires api.js + app.js + manifest",
      indexHtml.includes('src="api.js"') &&
      indexHtml.includes('src="app.js"') &&
      indexHtml.includes("manifest.webmanifest"));
const appJs = fs.readFileSync(path.join(pwaDir, "app.js"), "utf8");
check("app.js uses rendezvous + both modes",
      appJs.includes("fetchRendezvous") &&
      appJs.includes("chatSeat") && appJs.includes("chatPhone"));
check("index.html phone seat is first-class (picker + both ids)",
      indexHtml.includes('id="modeBModel"') &&
      indexHtml.includes("Qwen3-1.7B-q4f16_1-MLC") &&
      indexHtml.includes("Qwen3-4B-q4f16_1-MLC") &&
      indexHtml.indexOf('value="phone"') <
        indexHtml.indexOf('value="seat"'));
check("app.js wires the phone model picker + stats readout",
      appJs.includes("modeBModel") && appJs.includes("statsText") &&
      appJs.includes('store.get("mode", "phone")'));
const sw = fs.readFileSync(path.join(pwaDir, "sw.js"), "utf8");
check("sw.js caches shell only, skips cross-origin",
      sw.includes("icon-512.png") && sw.includes("url.origin"));

console.log(failures === 0
  ? "\nALL PWA CHECKS PASSED"
  : "\n" + failures + " PWA CHECK(S) FAILED");
process.exit(failures === 0 ? 0 : 1);
