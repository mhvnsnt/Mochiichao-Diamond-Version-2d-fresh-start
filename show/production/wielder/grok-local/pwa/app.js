/*
 * grok-local PWA — page wiring. All request/response logic lives in
 * api.js (window.GrokLocal); this file is DOM + state only.
 *
 * Seat discovery order on load (mode A):
 *   1. If a rendezvous dataset is configured, fetch it and adopt
 *      its endpoint (the running session publishes it; the address
 *      changes every session, the app follows it).
 *   2. Otherwise (or if that fails) use the endpoint typed by hand.
 * Mode B ignores endpoints entirely and runs on the phone.
 */
(function () {
  "use strict";
  const G = window.GrokLocal;
  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, d) {
      try { return localStorage.getItem("groklocal." + k) ?? d; }
      catch (e) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem("groklocal." + k, v); }
      catch (e) { /* private mode etc. — settings just won't stick */ }
    },
  };

  const els = {
    log: $("log"), banner: $("banner"), seatLabel: $("seatLabel"),
    settings: $("settings"), mode: $("mode"), modeNote: $("modeNote"),
    phoneFields: $("phoneFields"), modeBModel: $("modeBModel"),
    modeBNote: $("modeBNote"),
    seatFields: $("seatFields"), rvDataset: $("rvDataset"),
    rvToken: $("rvToken"), endpoint: $("endpoint"),
    apikey: $("apikey"), model: $("model"), input: $("input"),
    send: $("send"), composer: $("composer"),
  };

  const state = {
    messages: [{ role: "system", content: G.SYSTEM_PROMPT }],
    engineB: null,
    engineBModelId: null,
    busy: false,
  };

  function banner(text) {
    els.banner.textContent = text || "";
    els.banner.classList.toggle("show", !!text);
  }

  function addMsg(who, text, cls) {
    const div = document.createElement("div");
    div.className = "msg " + (cls || "");
    const w = document.createElement("div");
    w.className = "who"; w.textContent = who;
    const b = document.createElement("div");
    b.className = "body"; b.textContent = text;
    div.appendChild(w); div.appendChild(b);
    els.log.appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
    return b;
  }

  function seatText() {
    if (els.mode.value === "phone") {
      const m = G.modeBModel(els.modeBModel.value);
      return "phone seat: " + m.params + " on this phone's chip";
    }
    const ep = els.endpoint.value.trim();
    return ep ? "seat: " + ep : "no seat yet — open Settings";
  }
  function refreshSeatLabel() { els.seatLabel.textContent = seatText(); }

  function saveSettings() {
    store.set("mode", els.mode.value);
    store.set("modeBModel", els.modeBModel.value);
    store.set("rvDataset", els.rvDataset.value.trim());
    store.set("rvToken", els.rvToken.value);
    store.set("endpoint", els.endpoint.value.trim());
    store.set("apikey", els.apikey.value);
    store.set("model", els.model.value.trim() || G.DEFAULT_MODEL);
    refreshSeatLabel();
    syncModeUI();
  }

  function syncModeUI() {
    const phone = els.mode.value === "phone";
    els.seatFields.style.display = phone ? "none" : "block";
    els.phoneFields.style.display = phone ? "block" : "none";
    els.modeBNote.textContent = G.modeBModel(els.modeBModel.value).note;
    els.modeNote.textContent = phone
      ? "The flagship owned seat: the model lives on this phone " +
        "and answers with zero network after the one-time download."
      : "The seat is the vLLM server from the grok-local kit " +
        "(Kaggle free test drive, serverless, or a rented card — " +
        "same app, same chat).";
    refreshSeatLabel();
  }

  /* --- rendezvous: find the current seat without pasting ------- */
  async function applyRendezvous() {
    const dataset = els.rvDataset.value.trim();
    if (!dataset || els.mode.value !== "seat") return;
    try {
      const rv = await G.fetchRendezvous({
        datasetId: dataset, token: els.rvToken.value.trim() || null,
      });
      if (!rv.ok) { banner("Rendezvous: " + rv.reason +
        " — using the saved endpoint."); return; }
      if (rv.status !== "live") {
        banner("Rendezvous says the last seat is '" + rv.status +
          "' — start a session (runbook Step 0) or paste an address.");
        return;
      }
      const changed = rv.endpoint !== els.endpoint.value.trim();
      els.endpoint.value = rv.endpoint;
      if (rv.model) els.model.value = rv.model;
      if (rv.keyFingerprint &&
          G.keyFingerprint(els.apikey.value) &&
          rv.keyFingerprint !== G.keyFingerprint(els.apikey.value)) {
        banner("The seat's key changed since this phone last " +
          "connected — update the API key in Settings.");
      } else if (changed) {
        banner("Seat found via rendezvous: " + rv.endpoint);
      }
      saveSettings();
    } catch (e) {
      banner("Rendezvous unreachable (" + e.message +
        ") — using the saved endpoint.");
    }
  }

  /* --- mode A: the server seat --------------------------------- */
  async function chatSeat(userText, bodyEl) {
    const base = els.endpoint.value.trim();
    if (!base) throw new Error("No endpoint set — open Settings, " +
      "set a rendezvous or paste the seat address.");
    const headers = G.authHeaders(els.apikey.value || null);
    const messages = state.messages.slice();
    const post = (stream) => fetch(G.chatUrl(base), {
      method: "POST", headers,
      body: JSON.stringify(G.buildChatBody({
        model: els.model.value.trim() || G.DEFAULT_MODEL,
        messages, stream,
      })),
    });

    let res = await post(true);
    if (res.ok && res.body) {
      // Streaming path (SSE).
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", full = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const parsed = G.parseSSEChunk(
          buffer, decoder.decode(value, { stream: true }));
        buffer = parsed.rest;
        for (const ev of parsed.events) {
          const piece = G.deltaText(ev);
          if (piece) { full += piece; bodyEl.textContent = full; }
        }
      }
      if (full) return full;
      // Empty stream (some tunnels buffer/strip SSE — the
      // Cloudflare quick tunnel cannot stream): retry non-streamed.
    }
    res = await post(false);
    if (!res.ok) {
      throw new Error("Seat answered HTTP " + res.status +
        " — is the session still running? Free seats die with " +
        "their session; check the rendezvous / start a new one.");
    }
    const data = await res.json();
    const msg = ((data.choices || [])[0] || {}).message || {};
    return msg.content || "";
  }

  /* --- mode B: the phone seat ---------------------------------- */
  async function ensureEngineB(bodyEl) {
    const support = G.webgpuSupport(navigator);
    if (!support.ok) throw new Error(support.reason);
    const wanted = G.modeBModel(els.modeBModel.value).id;
    if (state.engineB && state.engineB.ready &&
        state.engineBModelId === wanted) return state.engineB;
    bodyEl.textContent = "Loading the on-phone model…";
    state.engineB = G.createWebLLMEngine({
      model: wanted,
      loadModule: () => import(
        "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.80/+esm"),
    });
    state.engineBModelId = wanted;
    await state.engineB.init((p) => {
      bodyEl.textContent = "Loading the on-phone model… " +
        (p.text || "") +
        (p.progress ? " (" + Math.round(p.progress * 100) + "%)" : "");
    });
    return state.engineB;
  }

  async function chatPhone(userText, bodyEl) {
    const engine = await ensureEngineB(bodyEl);
    bodyEl.textContent = "";
    const reply = await engine.chat(state.messages.slice(),
      (piece) => { bodyEl.textContent += piece; });
    const stats = engine.statsText();
    if (stats) banner("Phone seat — engine stats: " + stats);
    return reply;
  }

  /* --- send ----------------------------------------------------- */
  els.composer.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const text = els.input.value.trim();
    if (!text || state.busy) return;
    state.busy = true; els.send.disabled = true;
    els.input.value = "";
    state.messages.push({ role: "user", content: text });
    addMsg("you", text, "user");
    const bodyEl = addMsg("grok-local", "…", "");
    try {
      const reply = els.mode.value === "phone"
        ? await chatPhone(text, bodyEl)
        : await chatSeat(text, bodyEl);
      bodyEl.textContent = reply || "(empty reply)";
      state.messages.push({ role: "assistant", content: reply });
    } catch (e) {
      bodyEl.textContent = "Error: " + e.message;
      bodyEl.parentElement.classList.add("error");
      state.messages.pop(); // drop the unanswered user turn
    } finally {
      state.busy = false; els.send.disabled = false;
    }
  });

  /* --- boot ----------------------------------------------------- */
  function loadSettings() {
    els.mode.value = store.get("mode", "phone");
    els.modeBModel.value = store.get("modeBModel", G.MODE_B_MODEL);
    els.rvDataset.value = store.get("rvDataset", "");
    els.rvToken.value = store.get("rvToken", "");
    els.endpoint.value = store.get("endpoint", "");
    els.apikey.value = store.get("apikey", "");
    els.model.value = store.get("model", G.DEFAULT_MODEL);
    syncModeUI();
  }
  ["mode", "modeBModel", "rvDataset", "rvToken", "endpoint",
   "apikey", "model"]
    .forEach((id) => $(id).addEventListener("change", saveSettings));
  $("settingsBtn").addEventListener("click", () => {
    els.settings.classList.toggle("open");
    if (els.settings.classList.contains("open")) applyRendezvous();
  });
  loadSettings();
  applyRendezvous();
  addMsg("grok-local",
    "Ready. The phone seat runs a model on this phone's own chip " +
    "(offline after one download). The server seat chats with " +
    "your bigger vLLM seat. Open Settings to switch.",
    "");
})();
