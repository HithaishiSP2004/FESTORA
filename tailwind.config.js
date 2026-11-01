/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFCF9',
          100: '#FAF8F5',
          200: '#F4EFE6',
          300: '#EAE1D0',
          400: '#DDD0BA',
          500: '#CFC0A4',
        },
        forest: {
          950: '#0A1710',
          900: '#0F2418',
          800: '#163323',
          700: '#1F4731',
          600: '#2A5C41',
          500: '#3A7857',
          400: '#529671',
          300: '#7AB593',
          100: '#D2E8DC',
          50: '#EBF4EF',
        },
        gold: {
          50: '#FBF8EF',
          100: '#F6EED9',
          200: '#EEDDB4',
          300: '#E4CA88',
          400: '#D8B26E',
          500: '#C5A059',
          600: '#A88340',
          700: '#8C6D34',
          800: '#6C5329',
          900: '#4E3A1A',
        },
        charcoal: {
          900: '#171B19',
          800: '#222725',
          700: '#343B38',
          600: '#4D5652',
          500: '#6E7873',
          400: '#9AA39F',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-editorial': '0 4px 20px -2px rgba(22, 51, 35, 0.05), 0 2px 6px -1px rgba(22, 51, 35, 0.03)',
        'elevated-editorial': '0 20px 40px -8px rgba(22, 51, 35, 0.08), 0 8px 16px -4px rgba(22, 51, 35, 0.04)',
        'gold-glow': '0 0 25px -4px rgba(197, 160, 89, 0.25)',
      }
    },
  },
  plugins: [],
}

