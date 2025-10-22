/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        // Primary: Dark Teal (from logo background)
        teal: {
          50: '#f0f9f9',
          100: '#d9f0f0',
          200: '#b3e0e0',
          300: '#7ac9c9',
          400: '#4aacac',
          500: '#2d8f8f',
          600: '#247373',
          700: '#1e5c5c',
          800: '#1a4848',
          900: '#163838',
          950: '#0d2424',
        },
        // Accent: Gold/Beige (from logo elements)
        gold: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e9ddc9',
          300: '#dcc5a3',
          400: '#d0af82',
          500: '#c59a6b',
          600: '#b8885f',
          700: '#997050',
          800: '#7b5c45',
          900: '#644c39',
          950: '#35281e',
        },
        // Keep emerald as alias for backward compatibility
        emerald: {
          50: '#f0f9f9',
          100: '#d9f0f0',
          200: '#b3e0e0',
          300: '#7ac9c9',
          400: '#4aacac',
          500: '#2d8f8f',
          600: '#247373',
          700: '#1e5c5c',
          800: '#1a4848',
          900: '#163838',
          950: '#0d2424',
        },
      },
    },
  },
  plugins: [],
}
