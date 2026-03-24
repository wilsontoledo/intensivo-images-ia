import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#020617",
        foreground: "#e2e8f0",
        border: "#1e293b",
        muted: "#94a3b8",
        accent: "#38bdf8",
        surface: "#0f172a",
        surfaceElevated: "#111c35",
      },
      boxShadow: {
        panel: "0 14px 40px rgba(2, 6, 23, 0.24)",
      },
    },
  },
};

export default config;
