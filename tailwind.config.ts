import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          50: "#faf5fb",
          100: "#f3e5f6",
          400: "#a855c9",
          600: "#7e22a8",
          700: "#651a86",
          900: "#3b0f52",
        },
      },
    },
  },
  plugins: [],
};

export default config;
