const stats = { initMs: {}, wordLatencies: [] };
let offscreenReady = false;
let readyResolve = null;

async function ensureOffscreen() {
  if (offscreenReady) return;
  const waiting = new Promise(r => { readyResolve = r; });
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["WORKERS"],
      justification: "Run Pyodide for Arabic morphological analysis"
    });
  } catch (_) {}
  await waiting;
}

function handleAnalyze(msg, sendResponse) {
  ensureOffscreen().then(() => {
    chrome.runtime.sendMessage(
      { type: "analyze", word: msg.word },
      (response) => {
        if (response.initMs) Object.assign(stats.initMs, response.initMs);
        stats.wordLatencies.push(response.analysisMs);
        sendResponse(response);
      }
    );
  });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "analyze") {
    handleAnalyze(msg, sendResponse);
    return true;
  }
  if (msg.type === "ready") {
    offscreenReady = true;
    if (readyResolve) readyResolve();
  }
  if (msg.type === "get-stats") {
    sendResponse(stats);
  }
});
