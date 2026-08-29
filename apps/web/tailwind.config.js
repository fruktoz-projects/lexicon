/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        papyrus: {
          canvas: '#D8C194', // Main backdrop sandstone/papyrus
          card: '#FFFFFF',   // Pure white for maximum contrast
          subtle: '#F2E8D5', // Inset / recessed container
          warm: '#FAF0CD',   // Highlight / accent surface
          border: '#C5A566', // Primary antique parchment border
          borderSubtle: '#D8C092', // Muted inner border
          ink: '#1C150D',    // Deep soot black text (primary)
          muted: '#7A6B55',  // Secondary/label text
        },
        brand: {
          DEFAULT: '#8B5E3C', // Terracotta warm brown primary CTA
          hover: '#6B4226',
          dark: '#5C3A1E',
          light: '#FAF0CD',
          subtle: '#F5E6D3',
        },
        zone: {
          everyday: '#8B5E3C',
          business: '#B8860B',
          it: '#4A6F8B',
          academic: '#2E7D5B',
        },
        status: {
          success: '#2E7D5B',
          successBg: '#E0F0E8',
          successBorder: '#6BB38A',
          warning: '#D4A843',
          warningBg: '#FAF0CD',
          warningBorder: '#D4A843',
          error: '#B83A3A',
          errorBg: '#FDE8E8',
          errorBorder: '#F8B4B4',
        },
      },
      fontFamily: {
        monument: ['"Cinzel"', 'Georgia', 'serif'],
        scribe: ['"Marcellus"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 20px rgba(45, 30, 12, 0.15), 0 2px 8px rgba(45, 30, 12, 0.08)',
        'card-hover': '0 12px 28px rgba(45, 30, 12, 0.22), 0 4px 12px rgba(45, 30, 12, 0.12)',
        subtle: '0 2px 6px rgba(45, 30, 12, 0.06)',
        inner: 'inset 0 2px 4px rgba(50, 35, 15, 0.08)',
      },
      borderRadius: {
        card: '18px',
        container: '14px',
      },
    },
  },
  plugins: [],
};
