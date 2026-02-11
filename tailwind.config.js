/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3ED6C4",
        primaryDark: "#17A696",
        background: "#0F1115",
        card: "#1A1D23",
        text: "#FFFFFF",
        textMuted: "#9FA5B4",
        danger: "#FF5252",
        success: "#4CAF50",
      },
    },
  },
  plugins: [],
}

