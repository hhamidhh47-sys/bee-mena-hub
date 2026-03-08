import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org/,
            handler: "NetworkFirst",
            options: {
              cacheName: "weather-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
      manifest: {
        name: "نحّالي - إدارة المناحل",
        short_name: "نحّالي",
        description: "تطبيق شامل لإدارة المناحل وتربية النحل في منطقة الشرق الأوسط وشمال أفريقيا",
        theme_color: "#d4a020",
        background_color: "#fefdf5",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        dir: "rtl",
        lang: "ar",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
