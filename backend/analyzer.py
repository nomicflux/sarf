from camel_tools.morphology.analyzer import Analyzer
from camel_tools.utils.charmap import CharMapper

bw2ar = CharMapper.builtin_mapper('bw2ar')

DIALECT_DB = {
    "msa": "calima-msa-r13",
    "egy": "calima-egy-r13",
    "gulf": "calima-glf-01",
}

FEATURE_KEYS = ("per", "asp", "vox", "mod", "gen", "num", "cas", "stt")


def create_analyzers() -> dict:
    return {dialect: Analyzer.builtin_analyzer(db) for dialect, db in DIALECT_DB.items()}


def clean_lemma(lex: str) -> str:
    return lex.split("_")[0]


def extract_features(raw: dict) -> dict:
    return {k: raw[k] for k in FEATURE_KEYS if k in raw and raw[k] != "na"}


def extract_affixes(bwtok: str) -> tuple:
    parts = bwtok.split("+")
    if len(parts) <= 1:
        return ([], [])
    if len(parts) == 2:
        return ([bw2ar(parts[0])], [])
    return ([bw2ar(parts[0])], [bw2ar(parts[-1])])


def format_analysis(raw: dict) -> dict:
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


def analyze_word(analyzers: dict, word: str, dialect: str) -> list:
    analyzer = analyzers.get(dialect, analyzers["msa"])
    return [format_analysis(r) for r in analyzer.analyze(word)]
