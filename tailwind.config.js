/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7F27',
          50: '#FFF7F0',
          100: '#FFEDD5',
          200: '#FFD9AA',
          300: '#FFC080',
          400: '#FFA855',
          500: '#FF7F27',
          600: '#E66F1F',
          700: '#CC5F17',
          800: '#B34F0F',
          900: '#993F07',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

