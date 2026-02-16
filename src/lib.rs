use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[derive(serde::Serialize, serde::Deserialize)]
struct AnalysisResult {
    original: String,
    prefixes: Vec<String>,
    stem: String,
    suffixes: Vec<String>,
    root: Option<String>,
    pattern: Option<String>,
    is_particle: bool,
}

fn is_particle(word: &str) -> bool {
    matches!(
        word,
        "في" | "على" | "من" | "إلى" | "عن" | "مع" | "حتى"
        | "أو" | "أم" | "لكن" | "بل" | "ثم"
        | "هو" | "هي" | "هم" | "هن" | "أنت" | "أنتم" | "أنتن" | "أنا" | "نحن" | "أنتِ"
        | "هذا" | "هذه" | "ذلك" | "تلك" | "هؤلاء"
        | "الذي" | "التي" | "الذين" | "اللذان" | "اللتان" | "اللواتي"
    )
}

fn strip_conjunctions(word: &str) -> (Vec<String>, String) {
    let chars: Vec<char> = word.chars().collect();
    if chars.len() >= 3 && chars[0] == 'و' {
        (vec!["و".to_string()], chars[1..].iter().collect())
    } else if chars.len() >= 3 && chars[0] == 'ف' {
        (vec!["ف".to_string()], chars[1..].iter().collect())
    } else {
        (vec![], word.to_string())
    }
}

fn strip_preposition(word: &str) -> (Vec<String>, String) {
    let chars: Vec<char> = word.chars().collect();
    if chars.len() >= 4 && chars[0] == 'ب' {
        (vec!["ب".to_string()], chars[1..].iter().collect())
    } else if chars.len() >= 5 && chars[0] == 'ك' {
        (vec!["ك".to_string()], chars[1..].iter().collect())
    } else if chars.len() >= 4 && chars[0] == 'ل' {
        (vec!["ل".to_string()], chars[1..].iter().collect())
    } else {
        (vec![], word.to_string())
    }
}

fn strip_article(word: &str) -> (Vec<String>, String) {
    let chars: Vec<char> = word.chars().collect();
    if chars.len() >= 4 && chars[0] == 'ا' && chars[1] == 'ل' {
        (vec!["ال".to_string()], chars[2..].iter().collect())
    } else if chars.len() >= 3 && chars[0] == 'ل' {
        (vec!["ال".to_string()], chars[1..].iter().collect())
    } else {
        (vec![], word.to_string())
    }
}

fn strip_prefixes(word: &str) -> (Vec<String>, String) {
    let (mut prefixes, rem) = strip_conjunctions(word);
    let (prep, rem) = strip_preposition(&rem);
    prefixes.extend(prep);
    let (art, rem) = strip_article(&rem);
    prefixes.extend(art);
    (prefixes, rem)
}

fn strip_pronoun_suffixes(stem: &str) -> (String, Vec<String>) {
    let chars: Vec<char> = stem.chars().collect();
    let pronouns = ["هما", "هم", "هن", "كم", "كن", "نا", "ها", "ه", "ك", "ي"];
    for p in pronouns {
        let p_chars: Vec<char> = p.chars().collect();
        if chars.len() > p_chars.len() + 1 && chars.ends_with(&p_chars) {
            return (chars[..chars.len() - p_chars.len()].iter().collect(), vec![p.to_string()]);
        }
    }
    (stem.to_string(), vec![])
}

fn strip_number_gender(stem: &str) -> (String, Vec<String>) {
    let chars: Vec<char> = stem.chars().collect();
    let endings = ["ون", "ين", "ات", "ان", "ة"];
    for e in endings {
        let e_chars: Vec<char> = e.chars().collect();
        if chars.len() > e_chars.len() + 1 && chars.ends_with(&e_chars) {
            return (chars[..chars.len() - e_chars.len()].iter().collect(), vec![e.to_string()]);
        }
    }
    (stem.to_string(), vec![])
}

fn strip_suffixes(stem: &str) -> (String, Vec<String>) {
    let (rem, mut suffixes) = strip_pronoun_suffixes(stem);
    let (rem, gender) = strip_number_gender(&rem);
    suffixes.extend(gender);
    (rem, suffixes)
}

#[wasm_bindgen]
pub fn analyze_word(word: &str) -> String {
    let result = if is_particle(word) {
        AnalysisResult {
            original: word.to_string(),
            prefixes: vec![],
            stem: word.to_string(),
            suffixes: vec![],
            root: None,
            pattern: None,
            is_particle: true,
        }
    } else {
        let (prefixes, rem) = strip_prefixes(word);
        let (stem, suffixes) = strip_suffixes(&rem);
        AnalysisResult {
            original: word.to_string(),
            prefixes,
            stem,
            suffixes,
            root: None,
            pattern: None,
            is_particle: false,
        }
    };
    serde_json::to_string(&result).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_particle_prepositions() {
        assert!(is_particle("في"));
        assert!(is_particle("على"));
        assert!(is_particle("من"));
    }

    #[test]
    fn test_is_particle_pronouns() {
        assert!(is_particle("هو"));
        assert!(is_particle("هذا"));
    }

    #[test]
    fn test_is_particle_false() {
        assert!(!is_particle("كتاب"));
        assert!(!is_particle("مدرسة"));
    }

    #[test]
    fn test_strip_prefixes_single() {
        let (prefixes, stem) = strip_prefixes("بالكتاب");
        assert_eq!(prefixes, vec!["ب", "ال"]);
        assert_eq!(stem, "كتاب");
    }

    #[test]
    fn test_strip_prefixes_conjunction() {
        let (prefixes, stem) = strip_prefixes("والمدرسة");
        assert_eq!(prefixes, vec!["و", "ال"]);
        assert_eq!(stem, "مدرسة");
    }

    #[test]
    fn test_strip_prefixes_lam_article() {
        let (prefixes, stem) = strip_prefixes("للمعلم");
        assert_eq!(prefixes, vec!["ل", "ال"]);
        assert_eq!(stem, "معلم");
    }

    #[test]
    fn test_strip_prefixes_combined() {
        let (prefixes, stem) = strip_prefixes("وبالكتاب");
        assert_eq!(prefixes, vec!["و", "ب", "ال"]);
        assert_eq!(stem, "كتاب");
    }

    #[test]
    fn test_strip_prefixes_none() {
        let (prefixes, stem) = strip_prefixes("كتاب");
        assert_eq!(prefixes.len(), 0);
        assert_eq!(stem, "كتاب");
    }

    #[test]
    fn test_strip_suffixes_pronoun() {
        let (stem, suffixes) = strip_suffixes("كتابها");
        assert_eq!(stem, "كتاب");
        assert_eq!(suffixes, vec!["ها"]);
    }

    #[test]
    fn test_strip_suffixes_plural() {
        let (stem, suffixes) = strip_suffixes("معلمون");
        assert_eq!(stem, "معلم");
        assert_eq!(suffixes, vec!["ون"]);
    }

    #[test]
    fn test_strip_suffixes_feminine_plural() {
        let (stem, suffixes) = strip_suffixes("طالبات");
        assert_eq!(stem, "طالب");
        assert_eq!(suffixes, vec!["ات"]);
    }

    #[test]
    fn test_strip_suffixes_none() {
        let (stem, suffixes) = strip_suffixes("كتاب");
        assert_eq!(stem, "كتاب");
        assert_eq!(suffixes.len(), 0);
    }

    #[test]
    fn test_analyze_word_full() {
        let json = analyze_word("بالكتاب");
        let result: AnalysisResult = serde_json::from_str(&json).unwrap();
        assert_eq!(result.prefixes, vec!["ب", "ال"]);
        assert_eq!(result.stem, "كتاب");
    }

    #[test]
    fn test_analyze_word_particle() {
        let json = analyze_word("في");
        let result: AnalysisResult = serde_json::from_str(&json).unwrap();
        assert!(result.is_particle);
        assert_eq!(result.stem, "في");
    }
}
