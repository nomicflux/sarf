function renderStats(stats) {
  const el = document.getElementById("stats");
  if (!stats.initMs?.pyodide && stats.wordLatencies.length === 0) return;
  let html = renderInitStats(stats.initMs);
  html += renderWordStats(stats.wordLatencies);
  el.innerHTML = html;
}

function renderInitStats(initMs) {
  if (!initMs?.pyodide) return "";
  return `<div class="section">
    <div><span class="label">Pyodide init:</span> <span class="value">${initMs.pyodide}ms</span></div>
    <div><span class="label">Package install:</span> <span class="value">${initMs.packages}ms</span></div>
    <div><span class="label">DB load:</span> <span class="value">${initMs.dbLoad}ms</span></div>
  </div>`;
}

function renderWordStats(latencies) {
  if (latencies.length === 0) return "";
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  return `<div class="section">
    <div><span class="label">Words analyzed:</span> <span class="value">${latencies.length}</span></div>
    <div><span class="label">Avg latency:</span> <span class="value">${avg}ms</span></div>
    <div><span class="label">Min/Max:</span> <span class="value">${min}/${max}ms</span></div>
  </div>`;
}

chrome.runtime.sendMessage({ type: "get-stats" }, renderStats);
