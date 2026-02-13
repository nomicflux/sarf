import init from "../../pkg/sarf_core";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    await init();
    console.log("Sarf WASM initialized");
  },
});
