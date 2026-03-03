from analyzer import clean_lemma, extract_features, extract_affixes, format_analysis


def test_clean_lemma_with_suffix():
    assert clean_lemma("كَتَبَ_1") == "كَتَبَ"


def test_clean_lemma_without_suffix():
    assert clean_lemma("كِتَاب") == "كِتَاب"


def test_extract_features_filters_na():
    raw = {"gen": "m", "num": "s", "cas": "na", "per": "na", "vox": "a"}
    result = extract_features(raw)
    assert result == {"gen": "m", "num": "s", "vox": "a"}


def test_extract_features_empty():
    assert extract_features({}) == {}


def test_extract_affixes_empty():
    prefixes, suffixes = extract_affixes("")
    assert prefixes == []
    assert suffixes == []


def test_extract_affixes_no_affixes():
    prefixes, suffixes = extract_affixes("kitAb")
    assert prefixes == []
    assert suffixes == []


def test_extract_affixes_prefix_only():
    prefixes, suffixes = extract_affixes("Al+kitAb")
    assert len(prefixes) == 1
    assert suffixes == []


def test_extract_affixes_both():
    prefixes, suffixes = extract_affixes("Al+kitAb+u")
    assert len(prefixes) == 1
    assert len(suffixes) == 1


def test_format_analysis():
    raw = {
        "lex": "كَتَبَ_1",
        "root": "k.t.b",
        "pos": "verb",
        "gloss": "write",
        "pattern": "FaEal",
        "diac": "كَتَبَ",
        "bw": "kitab",
        "gen": "m",
        "num": "s",
        "cas": "na",
    }
    result = format_analysis(raw)
    assert result["lemma"] == "كَتَبَ"
    assert result["root"] == "k.t.b"
    assert result["pos"] == "verb"
    assert result["gloss"] == "write"
    assert result["features"] == {"gen": "m", "num": "s"}
