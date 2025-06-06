import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app.vue",
    "./components/**/*.vue",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.ts",
    "./plugins/**/*.ts",
    "./server/api/**/*.ts",
    "./server/lib/**/*.ts",
  ],
  theme: {
    extend: {
      keyframes: {
        "scale-in": {
          from: { transform: "scale(0.9)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shake: {
          "0%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "scale-in": "scale-in 0.3s ease-out",
        shake: "shake 0.3s",
      },
    },
  },
};
export default config;
