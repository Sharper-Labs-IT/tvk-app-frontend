/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#1E1E1E",
          accent: "#F2C94C",
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        }
      },
    },
    plugins: [],
  }  