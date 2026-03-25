const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard-Regular", "system-ui", "sans-serif"],
      },
      colors: {
        tbm: {
          primary: "#0d9488",
          primaryDark: "#0f766e",
          surface: "#f8fafc",
          card: "#ffffff",
          muted: "#64748b",
          border: "#e2e8f0",
          danger: "#dc2626",
          warning: "#d97706",
        },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".font-normal": {
          fontFamily: "Pretendard-Regular",
          fontWeight: "400",
        },
        ".font-medium": {
          fontFamily: "Pretendard-Medium",
          fontWeight: "500",
        },
        ".font-semibold": {
          fontFamily: "Pretendard-SemiBold",
          fontWeight: "600",
        },
        ".font-bold": {
          fontFamily: "Pretendard-Bold",
          fontWeight: "700",
        },
      });
    }),
  ],
};
