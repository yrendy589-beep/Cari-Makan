/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#241F1A",
        leaf: {
          DEFAULT: "#1F3A2E",
          light: "#2C4F3D",
          dark: "#142720",
        },
        cream: "#FBF6EF",
        paper: "#FFFDF8",
        chili: {
          DEFAULT: "#E0502B",
          dark: "#C43F1E",
        },
        gold: {
          DEFAULT: "#E8A53D",
          light: "#F2C572",
        },
        line: "#E5DCC9",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        ticket: "0 1px 0 rgba(36,31,26,0.04), 0 12px 24px -12px rgba(36,31,26,0.25)",
      },
    },
  },
  plugins: [],
};
