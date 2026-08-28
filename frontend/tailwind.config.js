/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd3fe',
          300: '#93b4fd',
          400: '#608bfa',
          500: '#3b66f5',
          600: '#2547e9',
          700: '#1f38d4',
          800: '#2030ab',
          900: '#202f87',
        },
        navy: {
          50: '#f0f3fa',
          100: '#dde3f2',
          200: '#b8c4e2',
          300: '#8c9fcc',
          400: '#5b71a8',
          500: '#39497f',
          600: '#263461',
          700: '#1a2549',
          800: '#111a37',
          900: '#0a1128',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 24, 40, 0.04), 0 1px 3px 0 rgba(16, 24, 40, 0.06)',
        soft: '0 4px 24px -4px rgba(16, 24, 40, 0.08)',
        glow: '0 8px 30px -6px rgba(37, 71, 233, 0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2547e9 0%, #3b66f5 55%, #608bfa 100%)',
        'navy-gradient': 'linear-gradient(160deg, #0a1128 0%, #1a2549 55%, #263461 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        slideUp: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        scaleIn: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.8s infinite linear',
      },
    },
  },
  plugins: [],
}
