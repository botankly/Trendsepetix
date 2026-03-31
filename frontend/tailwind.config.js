/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6c5ce7",
        accent: "#00b894",
        dark: "#2d3436",
      }
    },
  },
  plugins: [],
}
