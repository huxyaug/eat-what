/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#FF2442',
          darkred: '#e11635',
        },
        text: '#333333',
        bg: '#F8F8F8',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
