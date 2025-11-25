/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#111111',       // Existing: The almost-black background
          gold: '#E6C65B',       // Existing: A base gold color
          goldDark: '#B68D40',   // Existing: Darker gold for gradients
          footerBlue: '#2A344E', // NEW: The specific dark blue for the footer
        },
        blue: {
          50: '#eff6ff',
          75: '#dbeafe',
          100: '#bfdbfe',
        },
        violet: {
          50: '#faf5ff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ensure you have a clean font
        zentry: ['Zentry', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}