import { defineConfig } from "wxt";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  manifest: {
    name: "Sarf — Arabic Morphology",
    permissions: ["activeTab", "storage"],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
    web_accessible_resources: [
      {
        resources: ["*.wasm"],
        matches: ["<all_urls>"],
      },
    ],
  },
  vite: () => ({
    plugins: [wasm(), topLevelAwait()],
    build: {
      target: "esnext",
    },
  }),
});
