/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fcfcfc",
        surface: "#ffffff",
        "surface-2": "#f0f8fd",
        ink: "#0c3474",
        muted: "rgb(12 52 116 / 0.78)",
        line: "rgb(12 52 116 / 0.14)",
        accent: "#2e9cf4",
        soft: "#c4ecfc",
        sky: "#2e9cf4",
        navy: "#0c3474",
        ok: "#0d9488",
        risk: "#d97706",
        breach: "#dc2626",
      },
      fontFamily: {
        sans: ["Segoe UI", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 0 0 1px rgb(12 52 116 / 0.08), 0 20px 50px -24px rgb(12 52 116 / 0.35)",
      },
    },
  },
  plugins: [],
};