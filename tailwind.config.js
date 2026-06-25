/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#ff6b6b',
          500: '#ff4757',
          600: '#e8394a',
          700: '#c92f3f',
        },
      },
    },
  },
  plugins: [],
}
