function reportTiming(stage, ms) {
  chrome.runtime.sendMessage({ type: "timing", stage, ms });
}

async function initPyodide() {
  const start = performance.now();
  const pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/" });
  const ms = Math.round(performance.now() - start);
  reportTiming("pyodide_init", ms);
  console.log("Pyodide initialized in", ms, "ms");
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "init") initPyodide();
});

chrome.runtime.sendMessage({ type: "ready" });
