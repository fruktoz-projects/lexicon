/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',   // gray-50 — page background
        surface: '#FFFFFF',  // pure white — dominant card surface
        'surface-subtle': '#F1F5F9', // gray-100 — inset / recessed surfaces
        border: '#E5E7EB',   // gray-200 — primary borders
        'border-subtle': '#E5E7EB', // gray-200 — subtle borders / dividers
        ink: '#0F172A',      // slate-900 — primary text
        muted: '#64748B',    // slate-500 — secondary / label text
        accent: {
          DEFAULT: '#6D28D9', // violet-700 — primary CTA / brand
          hover: '#5B21B6',   // violet-800
          dark: '#5B21B8',    // violet-800 dark
          subtle: '#F5F3FF',  // violet-50
          soft: '#DDD6FE',    // violet-300
          text: '#F8FAFC',    // button text
        },
        zone: {
          everyday: '#0EA5E9', // sky-500
          business: '#7C3AED', // violet-600 = accent
          it: '#4F46E5',       // indigo-600
          academic: '#10B981', // emerald-500
        },
        status: {
          success: '#10B981',    // emerald-500
          successBg: '#DCFCE7',  // emerald-100
          successBorder: '#86EFAC', // emerald-300
          warning: '#F59E0B',    // amber-500
          warningBg: '#FFFBEB',  // amber-50
          warningBorder: '#FDE68A', // amber-300
          error: '#EF4444',      // red-500
          errorBg: '#FEE2E2',    // red-100
          errorBorder: '#FCA5A5', // red-300
        },
      },
      fontFamily: {
        monument: ['"Cinzel"', 'Georgia', 'serif'],
        scribe: ['"Marcellus"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 4px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 2px 8px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.10)',
        subtle: '0 2px 6px rgba(15, 23, 42, 0.04)',
        inner: 'inset 0 2px 4px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        card: '18px',
        container: '14px',
      },
    },
  },
  plugins: [],
};
