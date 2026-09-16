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
        background: "#0F0529",
        "deep-violet": "#0F0529",
        "surface-dark": "#160B36",
        "surface-card": "#1B0F3D",
        "surface-border": "rgba(106, 13, 173, 0.25)",
        "surface-border-hover": "rgba(204, 255, 0, 0.4)",
        "ultra-violet": "#6A0DAD",
        "ultra-violet-glow": "rgba(106, 13, 173, 0.5)",
        "electric-lime": "#CCFF00",
        "electric-lime-hover": "#B8E600",
        "electric-lime-glow": "rgba(204, 255, 0, 0.3)",
        "text-primary": "#F5F3FA",
        "text-secondary": "#B8AFD1",
        "text-muted": "#7A7099",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-clash)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "glow-violet": "0 0 40px -10px rgba(106, 13, 173, 0.5)",
        "glow-lime": "0 0 30px -5px rgba(204, 255, 0, 0.35)",
        "card-subtle": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.5" },
          "50%": { transform: "scale(1.08)", opacity: "0.8" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        marquee: "marquee 35s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
