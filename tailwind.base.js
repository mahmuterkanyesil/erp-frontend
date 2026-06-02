/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#137fec",
          dark: "#0f65bd",
          light: "#e8f3fd",
        },
        background: {
          light: "#f6f7f8",
          dark: "#101922",
        },
        surface: {
          light: "#ffffff",
          dark: "#1a2632",
        },
        "surface-elevated": {
          light: "#ffffff",
          dark: "#1e2936",
        },
        border: {
          light: "#e7edf3",
          dark: "#2a3b4d",
        },
        "text-main": {
          light: "#0d141b",
          dark: "#e2e8f0",
        },
        "text-secondary": {
          light: "#4c739a",
          dark: "#94a3b8",
        },
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        info: "#0369a1",
      },
      fontFamily: {
        display: ["Manrope", "Noto Sans Arabic", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
