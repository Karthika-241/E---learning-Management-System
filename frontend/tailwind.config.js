/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12172B",
          light: "#1D2340",
          soft: "#2A3157",
        },
        paper: "#F7F7F4",
        ember: {
          DEFAULT: "#F2A93B",
          dark: "#D98F1F",
        },
        jade: {
          DEFAULT: "#1F9D8A",
          dark: "#167E6F",
          light: "#E4F5F2",
        },
        ash: "#6B7080",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,23,43,0.06), 0 8px 24px -12px rgba(18,23,43,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
