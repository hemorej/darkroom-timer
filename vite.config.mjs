import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Sourcemaps are only generated (and uploaded to Sentry, then deleted from
// dist/) when SENTRY_AUTH_TOKEN is present at build time, i.e. on the server.
const uploadSourcemaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

// https://vitejs.dev/config/
export default defineConfig({
  build: { sourcemap: uploadSourcemaps ? "hidden" : false },
  plugins: [
    vue(),
    ViteImageOptimizer(),
    viteCompression({ algorithm: "gzip" }),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
    visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true }),
    ...(uploadSourcemaps
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: { name: process.env.VITE_SENTRY_RELEASE },
            sourcemaps: { filesToDeleteAfterUpload: ["dist/**/*.map"] },
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
