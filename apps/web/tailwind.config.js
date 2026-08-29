/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        papyrus: {
          50: '#FBF4E4',  // Light warm papyrus highlight
          100: '#F5EBD4', // Authentic Light Warm Brownish Papyrus Reed Card
          200: '#EAD9B8', // Inner sunken parchment box
          300: '#DCBE92', // Aged parchment ribbon
          400: '#BFA064', // Defined antique bronze-gold border
          500: '#967A42', // Deep aged edge
          600: '#755E2E',
          800: '#281E10',
          900: '#150E06',
          canvas: '#D8C194', // Deep Sandstone canvas background
        },
        hieroglyph: {
          DEFAULT: '#1A1208', // Deep carbon soot black ink
          muted: '#4D3B26',
          light: '#6E563A',
        },
        terracotta: {
          DEFAULT: '#B8542F', // Red ochre / wax seal CTA
          hover: '#9E4220',
          light: '#F8ECE5',
          dark: '#7A2C10',
        },
        nile: {
          DEFAULT: '#14747C', // Nile turquoise
          hover: '#0E585E',
          light: '#E6F4F5',
          dark: '#0A4347',
        },
        lapis: {
          DEFAULT: '#19498C', // Royal lapis lazuli
          hover: '#12376C',
          light: '#E8F0FA',
          dark: '#0C264D',
        },
        gold: {
          DEFAULT: '#C68E17', // Pharaoh gold leaf
          hover: '#A9750D',
          light: '#FAF0CD',
          dark: '#855904',
        },
        desert: {
          sand: '#D8C194',
          dune: '#C7AD7E',
        },
      },
      fontFamily: {
        monument: ['"Cinzel"', '"Marcellus"', 'Georgia', 'serif'],
        decorative: ['"Cinzel Decorative"', '"Cinzel"', 'serif'],
        scribe: ['"Marcellus"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 5px 20px -2px rgba(45, 30, 12, 0.2), 0 2px 7px rgba(45, 30, 12, 0.12), 0 0 0 1.5px #BFA064',
        'card-hover': '0 10px 30px -4px rgba(45, 30, 12, 0.3), 0 4px 10px rgba(45, 30, 12, 0.16), 0 0 0 2px #C68E17',
        cartouche: '0 0 0 2px #C68E17, 0 4px 14px rgba(198, 142, 23, 0.35)',
        seal: '0 4px 14px rgba(184, 84, 47, 0.4)',
        inner: 'inset 0 2px 5px rgba(50, 35, 15, 0.12)',
      },
      borderRadius: {
        cartouche: '9999px',
        scroll: '18px',
      },
    },
  },
  plugins: [],
};
