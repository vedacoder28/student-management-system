/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#e4e8f1', 100: '#c8cfe0', 200: '#8896b0',
          300: '#5a6a85', 400: '#3a4a65', 500: '#1e293b',
          600: '#182240', 700: '#131b2e', 800: '#0d1320', 900: '#080c14'
        },
        accent: {
          DEFAULT: '#00e5a0', light: '#33edb5',
          dark: '#00b880', dim: 'rgba(0,229,160,0.1)'
        },
        sky2: { DEFAULT: '#38bdf8', dim: 'rgba(56,189,248,0.1)' },
        amber2: { DEFAULT: '#f59e0b', dim: 'rgba(245,158,11,0.1)' },
        rose2: { DEFAULT: '#ef4444', dim: 'rgba(239,68,68,0.1)' },
        violet2: { DEFAULT: '#a78bfa', dim: 'rgba(167,139,250,0.1)' }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [],
}