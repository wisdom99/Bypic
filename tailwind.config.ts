import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FBF7F1",
          100: "#F5EFE5",
          200: "#EADFCC",
        },
        indigo: {
          50: "#EEF0F8",
          100: "#D7DBEE",
          400: "#5A66A3",
          500: "#3E4B8C",
          600: "#2D3870",
          700: "#1F2854",
          800: "#161D3E",
          900: "#0E1330",
        },
        terracotta: {
          50: "#FBEEE6",
          100: "#F4D4BF",
          400: "#D38967",
          500: "#C26841",
          600: "#A8512E",
          700: "#7E3A20",
        },
        charcoal: {
          50: "#F5F4F2",
          100: "#E5E3DF",
          400: "#6B6862",
          500: "#4A4843",
          700: "#2A2926",
          900: "#161513",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(20, 20, 20, 0.04), 0 8px 24px -8px rgba(20, 20, 20, 0.08)",
        ring: "0 0 0 1px rgba(20, 20, 20, 0.06)",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
