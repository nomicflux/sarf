use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn analyze_word(word: &str) -> String {
    format!("Analysis of: {word}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyze_word() {
        let result = analyze_word("test");
        assert_eq!(result, "Analysis of: test");
    }
}
