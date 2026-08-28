/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#008d36',
          greenLight: '#3aaa35',
          dark: '#022c16',
          darker: '#011a0d',
          yellow: '#F59E0B',
          yellowDark: '#D97706',
        }
      }
    },
  },
  plugins: [],
}

