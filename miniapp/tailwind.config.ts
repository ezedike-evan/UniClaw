import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        claude: {
          DEFAULT: "#D97706",
          50: "#FFF7ED",
          100: "#FFEDD5",
          500: "#F97316",
          600: "#D97706",
          700: "#B45309",
        },
        unilag: {
          DEFAULT: "#003B8E",
          500: "#1D4ED8",
          700: "#003B8E",
        },
        surface: {
          light: "#FAFAF9",
          dark: "#0F0F0F",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-pulse": {
          "0%, 80%, 100%": { opacity: "0.3" },
          "40%": { opacity: "1" },
        },
        "logo-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(0.98)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out",
        "dot-pulse": "dot-pulse 1.4s ease-in-out infinite both",
        "logo-pulse": "logo-pulse 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
