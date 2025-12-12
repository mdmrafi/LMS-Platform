/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#25A7B3',
        secondary: '#357A8B',
        accent: '#727295'
      }
    },
  },
  plugins: [],
}
