async function createOffscreen() {
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["WORKERS"],
      justification: "Run Pyodide for Arabic morphological analysis"
    });
  } catch (_) {}
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "timing") {
    console.log(`[${msg.stage}] ${msg.ms}ms`);
  }
  if (msg.type === "ready") {
    chrome.runtime.sendMessage({ type: "init" });
  }
});

chrome.runtime.onInstalled.addListener(() => createOffscreen());
