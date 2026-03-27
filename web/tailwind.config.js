/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff8ed',
          100: '#ffeecc',
          200: '#ffd98a',
          300: '#ffc248',
          400: '#ffa71b',
          500: '#f98a08',
          600: '#dd6603',
          700: '#b74607',
          800: '#94360d',
          900: '#792d0e',
        },
      },
    },
  },
  plugins: [],
};

