function reportTiming(stage, ms) {
  chrome.runtime.sendMessage({ type: "timing", stage, ms });
}

async function initPyodide() {
  const start = performance.now();
  const pyodide = await loadPyodide({ indexURL: "./" });
  const ms = Math.round(performance.now() - start);
  reportTiming("pyodide_init", ms);
  console.log("Pyodide initialized in", ms, "ms");
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "init") initPyodide();
});

chrome.runtime.sendMessage({ type: "ready" });
