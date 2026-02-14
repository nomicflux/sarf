export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("Sarf content script loaded");
  },
});
