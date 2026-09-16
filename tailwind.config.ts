import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0D",
        "near-black": "#09090B",
        surface: "#141417",
        "surface-2": "#1B1B20",
        "surface-3": "#222228",
        "line-soft": "rgba(255, 255, 255, 0.08)",
        "electric-lime": "#CCFF00",
        "electric-lime-hover": "#B8E600",
        "electric-lime-glow": "rgba(204, 255, 0, 0.3)",
        "text-primary": "#F4F4F0",
        "text-secondary": "#A8A8AF",
        "text-muted": "#6B6B72",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-lime": "0 0 30px -5px rgba(204, 255, 0, 0.35)",
        "glow-lime-strong": "0 0 45px -8px rgba(204, 255, 0, 0.45)",
        "glow-violet": "0 0 40px -10px rgba(255, 255, 255, 0.06)",
        "card-subtle": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        lift: "0 24px 60px -28px rgba(0, 0, 0, 0.75)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.06)", opacity: "0.8" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        marquee: "marquee 45s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 9s ease-in-out 1.2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;