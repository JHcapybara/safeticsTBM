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
      fontSize: {
        xs:   ["12px",  { lineHeight: "14.4px" }],
        sm:   ["14px",  { lineHeight: "16.8px" }],
        base: ["16px",  { lineHeight: "19.2px" }],
        lg:   ["18px",  { lineHeight: "21.6px" }],
        xl:   ["20px",  { lineHeight: "24px"   }],
        "2xl":["24px",  { lineHeight: "28.8px" }],
        "3xl":["30px",  { lineHeight: "36px"   }],
        "4xl":["36px",  { lineHeight: "43.2px" }],
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
          "font-family": "Pretendard-Regular",
          "font-weight": "400",
        },
        ".font-medium": {
          "font-family": "Pretendard-Medium",
          "font-weight": "500",
        },
        ".font-semibold": {
          "font-family": "Pretendard-SemiBold",
          "font-weight": "600",
        },
        ".font-bold": {
          "font-family": "Pretendard-Bold",
          "font-weight": "700",
        },
      });
    }),
  ],
};
