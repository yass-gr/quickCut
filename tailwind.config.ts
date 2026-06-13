import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00ff41",
        "primary-container": "#00cc33",
        green2: "#5cff6a",
        yellow: "#facc15",
        gray: "#a3a3a3",
        card: "#101010",
        background: "#030803",
        surface: "#061206",
        "outline-variant": "#1b4d1b",
        "on-surface": "#d0ffd0",
      },
      fontFamily: {
        flick: ["Flick", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
