import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Sarf — Arabic Morphology",
    permissions: ["storage", "offscreen"],
    host_permissions: [
      "http://oujda-nlp-team.net:8080/*",
      "http://oujda-nlp-team.net:8081/*",
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    },
  },
  vite: () => ({
    build: {
      target: "esnext",
    },
  }),
});
