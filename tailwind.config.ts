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
    display: ["var(--font-display)", "system-ui", "sans-serif"],
    mono: ["var(--font-inter)", "monospace"],
  },
      letterSpacing: {
        tightest: "-0.045em",
        wider: "0.05em",
        widest: "0.1em",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      boxShadow: {
        "glow-lime": "0 0 30px -5px rgba(204, 255, 0, 0.35)",
        "glow-lime-strong": "0 0 45px -8px rgba(204, 255, 0, 0.45)",
        "glow-violet": "0 0 40px -10px rgba(255, 255, 255, 0.06)",
        "card-subtle": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        lift: "0 24px 60px -28px rgba(0, 0, 0, 0.75)",
        "inner-glow": "inset 0 0 60px -10px rgba(204, 255, 0, 0.1)",
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
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        marquee: "marquee 45s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 9s ease-in-out 1.2s infinite",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;