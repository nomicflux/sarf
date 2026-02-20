import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Sarf — Arabic Morphology",
    permissions: ["activeTab", "storage"],
    host_permissions: [
      "http://oujda-nlp-team.net:8080/*",
      "http://oujda-nlp-team.net:8081/*",
    ],
  },
  vite: () => ({
    build: {
      target: "esnext",
    },
  }),
});
