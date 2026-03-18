function getWordAtClick(event) {
  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (!range) return null;
  const node = range.startContainer;
  if (node.nodeType !== Node.TEXT_NODE) return null;
  return findArabicWordAt(node.textContent, range.startOffset);
}

function findArabicWordAt(text, offset) {
  const arabicRe = /[\u0600-\u06FF\u0750-\u077F]+/g;
  let m;
  while ((m = arabicRe.exec(text)) !== null) {
    if (offset >= m.index && offset <= m.index + m[0].length) return m[0];
  }
  return null;
}

let overlay = null;

function showOverlay(event, word, result) {
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "sarf-overlay";
    setOverlayStyle(overlay);
    document.body.appendChild(overlay);
  }
  overlay.style.left = event.pageX + 10 + "px";
  overlay.style.top = event.pageY + 10 + "px";
  overlay.innerHTML = formatOverlay(word, result);
  overlay.style.display = "block";
}

function setOverlayStyle(el) {
  Object.assign(el.style, {
    position: "absolute",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "14px",
    fontFamily: "monospace",
    zIndex: "999999",
    maxWidth: "400px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    direction: "rtl",
  });
}

function formatOverlay(word, result) {
  const timing = `<div style="color:#888;font-size:11px;direction:ltr">
    Round-trip: ${result.roundTripMs}ms | Analysis: ${result.analysisMs}ms
    ${result.initMs?.pyodide ? ` | Init: ${result.initMs.pyodide}ms` : ""}
  </div>`;
  const first = result.analyses[0];
  if (!first) return `<b>${word}</b><br>No analyses found${timing}`;
  const fields = `<b>${word}</b> → ${first.lemma}<br>
    Root: ${first.root} | POS: ${first.pos}<br>
    Gloss: ${first.gloss}<br>
    Pattern: ${first.pattern} | Diac: ${first.diac}<br>
    <span style="font-size:12px">${result.analyses.length} total analyses</span>`;
  return fields + timing;
}

document.addEventListener("click", async (event) => {
  const word = getWordAtClick(event);
  if (!word) {
    if (overlay) overlay.style.display = "none";
    return;
  }
  const start = performance.now();
  const response = await chrome.runtime.sendMessage({ type: "analyze", word });
  response.roundTripMs = Math.round(performance.now() - start);
  showOverlay(event, word, response);
});
