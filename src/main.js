import { createApp } from "vue";
import * as Sentry from "@sentry/vue";

import "@fontsource/spectral/latin-300.css";
import "@fontsource/spectral/latin-400.css";
import "@fontsource/spectral/latin-500.css";
import "@fontsource/spectral/latin-600.css";
import "@fontsource/spectral/latin-400-italic.css";
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";

import "../public/app.css";
import App from "./App.vue";

const app = createApp(App);

// Error monitoring only: no tracing, replay, or default PII. Disabled unless a
// DSN is baked in at build time (VITE_SENTRY_DSN), so dev and forks stay silent.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    app,
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    sendDefaultPii: false,
  });
}

app.mount("#app");
