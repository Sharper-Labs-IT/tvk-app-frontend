/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // I extracted these approximate colors from your image
        brand: {
          dark: '#111111', // The almost-black background
          gold: '#E6C65B', // A base gold color
          goldDark: '#B68D40', // Darker gold for gradients
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ensure you have a clean font
      }
    },
  },
  plugins: [],
}