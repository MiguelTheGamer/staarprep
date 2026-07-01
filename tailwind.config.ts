import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F2ED",
        surface: "#FDFCFA",
        navy: "#0D1B2A",
        red: "#C0392B",
        stone: "#8C8279",
        "stone-light": "#E8E3DC",
        success: "#1A7F4B",
        amber: "#B45309",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: { DEFAULT: "6px" },
    },
  },
  plugins: [],
};
export default config;
