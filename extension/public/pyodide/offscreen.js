/* global loadPyodide, chrome */
let pyodide = null;
const loadedDialects = new Set();

const DIALECT_DB = {
  gulf: 'data/morphology-glf.db.gz',
  msa: 'data/morphology-msa.db.gz',
  egy: 'data/morphology-egy.db.gz',
};

async function fetchAndDecompress(url) {
  const response = await fetch(url);
  const ds = new DecompressionStream('gzip');
  const decompressed = response.body.pipeThrough(ds);
  const blob = await new Response(decompressed).blob();
  return new Uint8Array(await blob.arrayBuffer());
}

async function initPyodide_() {
  if (pyodide) return;
  pyodide = await loadPyodide({
    indexURL: './',
    env: { CAMELTOOLS_DATA: '/camel_data' },
  });
}

async function installPackages() {
  await pyodide.loadPackage([
    'micropip', 'packaging', 'six', 'cachetools', 'pyrsistent', 'tqdm',
    'requests', 'charset-normalizer', 'idna', 'urllib3', 'certifi',
  ]);
  await loadLocalWheels();
}

async function loadLocalWheels() {
  const wheels = [
    'docopt_ng-0.9.0-py3-none-any.whl',
    'muddler-0.1.3-py3-none-any.whl',
    'emoji-2.15.0-py3-none-any.whl',
    'camel_tools-1.5.7-py3-none-any.whl',
  ];
  pyodide.FS.mkdirTree('/wheels');
  for (const whl of wheels) {
    const url = chrome.runtime.getURL('pyodide/' + whl);
    const buf = await (await fetch(url)).arrayBuffer();
    pyodide.FS.writeFile('/wheels/' + whl, new Uint8Array(buf));
  }
  await pyodide.runPythonAsync(`
import micropip
await micropip.install('emfs:/wheels/docopt_ng-0.9.0-py3-none-any.whl')
await micropip.install('emfs:/wheels/emoji-2.15.0-py3-none-any.whl')
await micropip.install('emfs:/wheels/muddler-0.1.3-py3-none-any.whl', deps=False)
await micropip.install('emfs:/wheels/camel_tools-1.5.7-py3-none-any.whl', deps=False)
  `);
}

function writeCatalogue() {
  pyodide.FS.mkdirTree('/camel_data');
  const minCat = '{"version":"0.0.0","packages":{},"components":{}}';
  pyodide.FS.writeFile('/camel_data/catalogue.json', minCat);
}

async function loadDatabase(dialect) {
  if (loadedDialects.has(dialect)) return;
  const gzUrl = DIALECT_DB[dialect];
  if (!gzUrl) throw new Error('Unknown dialect: ' + dialect);

  writeCatalogue();
  const dbBytes = await fetchAndDecompress(gzUrl);
  const dbPath = '/data/morphology-' + dialect + '.db';
  pyodide.FS.mkdirTree('/data');
  pyodide.FS.writeFile(dbPath, dbBytes);

  pyodide.globals.set('_db_path', dbPath);
  pyodide.globals.set('_dialect', dialect);
  await pyodide.runPythonAsync(`
from camel_tools.morphology.database import MorphologyDB
from camel_tools.morphology.analyzer import Analyzer
db = MorphologyDB(_db_path)
analyzers[_dialect] = Analyzer(db)
  `);
  loadedDialects.add(dialect);
}

async function setupAnalysis() {
  await pyodide.runPythonAsync(`
from camel_tools.utils.charmap import CharMapper
import json
bw2ar = CharMapper.builtin_mapper('bw2ar')
analyzers = {}
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

def analyze_word_json(word, dialect):
    results = [format_analysis(r) for r in analyzers[dialect].analyze(word)]
    return json.dumps(results)
  `);
}

let initialized = false;
let initializing = null;

async function ensureInitialized() {
  if (initialized) return;
  if (initializing) return initializing;
  initializing = doInit().catch((e) => {
    initializing = null;
    throw e;
  });
  await initializing;
}

async function doInit() {
  await initPyodide_();
  await installPackages();
  await setupAnalysis();
  initialized = true;
}

async function analyzeWord(word, dialect) {
  await ensureInitialized();
  await loadDatabase(dialect);
  pyodide.globals.set('_word', word);
  pyodide.globals.set('_dialect', dialect);
  const result = await pyodide.runPythonAsync('analyze_word_json(_word, _dialect)');
  return { analyses: JSON.parse(result) };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'offscreen-analyze') {
    analyzeWord(msg.word, msg.dialect)
      .then(sendResponse)
      .catch((e) => {
        console.error('[offscreen] analyzeWord failed:', e);
        sendResponse({ error: e.message });
      });
    return true;
  }
});
