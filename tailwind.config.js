/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // TVK primary theme colors
        black: '#000000',
        gold: '#E6C65B', // main gold
        goldDark: '#B68D40', // darker gold shade

        // Your existing brand palette
        brand: {
          dark: '#111111',
          gold: '#E6C65B',
          goldDark: '#B68D40',
          footerBlue: '#2A344E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};
