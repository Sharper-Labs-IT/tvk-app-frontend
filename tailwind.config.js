/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // TVK primary theme colors (EXISTING)
        black: '#000000',
        gold: '#E6C65B', // main gold (EXISTING)
        goldDark: '#B68D40', // darker gold shade (EXISTING)

        // New Dark Theme Colors for Login/Auth Pages
        'tvk-dark': {
          DEFAULT: '#121212', // Page Background
          card: '#1E1E1E', // Card/Input Background
        },
        // New Gold/Orange Accent for Buttons and Highlights
        'tvk-accent-gold': {
          DEFAULT: '#F6A800',
          dark: '#D48F00',
        },

        // Your existing brand palette (EXISTING)
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

      // Custom gradient for the submit button
      backgroundImage: {
        'tvk-gradient':
          'linear-gradient(to right, var(--tw-colors-tvk-accent-gold-dark), var(--tw-colors-tvk-accent-gold-DEFAULT))',
        'tvk-gradient-hover':
          'linear-gradient(to right, var(--tw-colors-tvk-accent-gold-DEFAULT), #FFC43A)',
      },

      // Keyframes for the optional background glow animation
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.2' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
