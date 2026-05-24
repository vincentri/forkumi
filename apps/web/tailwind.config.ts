import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        roboto: ["var(--font-roboto)", "system-ui", "sans-serif"],
      },
      colors: {
        dark: "#1A1A1A",
        "off-white": "#F9F9F7",
        "border-subtle": "#E5E5E5",
        muted: "#666666",
        cream: "#f5f0eb",
        gold: "#c9a96e",
      },
      letterSpacing: { overline: "2px", btn: "1.5px" },
    },
  },
  plugins: [],
};

export default config;
