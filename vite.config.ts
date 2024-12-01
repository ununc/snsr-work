import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      includeAssets: ["icons/favicon.svg"],
      manifest: {
        name: "My PWA App",
        short_name: "SNSR",
        description: "송내 사랑의 교회 대학 청년부 웹 앱",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/android-chrome-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/icons/android-chrome-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/icons/apple-touch-icon.svg",
            sizes: "180x180",
            type: "image/svg+xml",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: false,
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        additionalManifestEntries: [
          {
            url: "/sw.js",
            revision: "1.0",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "https://hcsb.synology.me:6555/",
        changeOrigin: true,
        secure: false, // HTTPS를 사용하는 경우 SSL 인증서 검증 건너뛰기
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
