let pyodide = null;
let initMs = {};

function timeMs(start) {
  return Math.round(performance.now() - start);
}

async function initPyodide_() {
  const start = performance.now();
  pyodide = await loadPyodide({
    indexURL: "./",
    env: { CAMELTOOLS_DATA: "/camel_data" }
  });
  initMs.pyodide = timeMs(start);
}

async function installPackages() {
  const start = performance.now();
  await pyodide.runPythonAsync(`
import micropip
await micropip.install('camel-tools', deps=False)
await micropip.install(['cachetools', 'emoji', 'six'])
  `);
  initMs.packages = timeMs(start);
}

async function writeCatalogue() {
  pyodide.FS.mkdirTree("/camel_data");
  const minCat = '{"version":"0.0.0","packages":{},"components":{}}';
  pyodide.FS.writeFile("/camel_data/catalogue.json", minCat);
}

async function loadDatabase() {
  const start = performance.now();
  writeCatalogue();
  const url = chrome.runtime.getURL("data/morphology.db");
  const text = await (await fetch(url)).text();
  pyodide.FS.mkdirTree("/data");
  pyodide.FS.writeFile("/data/morphology.db", text);
  await pyodide.runPythonAsync(`
from camel_tools.morphology.database import MorphologyDB
from camel_tools.morphology.analyzer import Analyzer
db = MorphologyDB('/data/morphology.db')
analyzer = Analyzer(db)
  `);
  initMs.dbLoad = timeMs(start);
}

async function setupAnalysis() {
  await pyodide.runPythonAsync(`
from camel_tools.utils.charmap import CharMapper
import json
bw2ar = CharMapper.builtin_mapper('bw2ar')
FEATURE_KEYS = ("per", "asp", "vox", "mod", "gen", "num", "cas", "stt")

def clean_lemma(lex):
    return lex.split("_")[0]

def extract_features(raw):
    return {k: raw[k] for k in FEATURE_KEYS if k in raw and raw[k] != "na"}

def extract_affixes(bwtok):
    parts = bwtok.split("+")
    if len(parts) <= 1:
        return ([], [])
    if len(parts) == 2:
        return ([bw2ar(parts[0])], [])
    return ([bw2ar(parts[0])], [bw2ar(parts[-1])])

def format_analysis(raw):
    prefixes, suffixes = extract_affixes(raw.get("bw", ""))
    return {
        "lemma": clean_lemma(raw.get("lex", "")),
        "root": raw.get("root", ""),
        "pos": raw.get("pos", ""),
        "gloss": raw.get("gloss", ""),
        "pattern": raw.get("pattern", ""),
        "diac": raw.get("diac", ""),
        "prefixes": prefixes,
        "suffixes": suffixes,
        "features": extract_features(raw),
    }

def analyze_word_json(word):
    results = [format_analysis(r) for r in analyzer.analyze(word)]
    return json.dumps(results)
  `);
}

async function ensureInitialized() {
  if (pyodide) return;
  await initPyodide_();
  await installPackages();
  await loadDatabase();
  await setupAnalysis();
}

async function analyzeWord(word) {
  await ensureInitialized();
  const start = performance.now();
  const escapedWord = word.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const json = await pyodide.runPythonAsync(`analyze_word_json("${escapedWord}")`);
  const analysisMs = timeMs(start);
  return { analyses: JSON.parse(json), analysisMs, initMs };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "analyze") {
    analyzeWord(msg.word).then(sendResponse);
    return true;
  }
});

chrome.runtime.sendMessage({ type: "ready" });
