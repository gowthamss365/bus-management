/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transit: {
          dark: '#0f172a',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          light: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
