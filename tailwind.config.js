module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["stc"], // ✅ Only STC
      },
      fontWeight: {
        'normal': '400', // STC Regular
        'medium': '500', // STC Medium
        'semibold': '600', // STC Bold
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.font-stc-regular': {
          'font-family': '"stc"',
          'font-weight': '400',
        },
        '.font-stc-medium': {
          'font-family': '"stc"',
          'font-weight': '500',
        },
        '.font-stc-bold': {
          'font-family': '"stc"',
          'font-weight': '600',
        },
      })
    }
  ],
};
