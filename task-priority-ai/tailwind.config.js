/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f9f4',
          100: '#b3eee0',
          200: '#80e3cc',
          300: '#4dd8b8',
          400: '#1acda4',
          500: '#06BC83',
          600: '#059669',
          700: '#04704f',
          800: '#034a35',
          900: '#02241a',
        },
      },
    },
  },
  plugins: [],
}
