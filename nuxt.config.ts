// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  css: ["~/assets/app.css"],
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  app: {
    head: {
      title: "GearXChange", // default fallback title
      htmlAttrs: {
        lang: "en",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
});
