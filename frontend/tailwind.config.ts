/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        aws: {
          orange: '#FF9900',
          blue:   '#232F3E',
          light:  '#37475A',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card:    '#161628',
          border:  '#1e1e3a',
          hover:   '#1a1a30',
        },
        accent: {
          purple: '#7c3aed',
          cyan:   '#06b6d4',
          green:  '#10b981',
          red:    '#ef4444',
          amber:  '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'timer-warn': 'timerWarn 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        timerWarn: {
          '0%, 100%': { color: '#ef4444' },
          '50%':      { color: '#ff6b6b' },
        },
      },
      boxShadow: {
        glow:    '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow-red':   '0 0 15px rgba(239, 68, 68, 0.3)',
        card:    '0 4px 24px rgba(0, 0, 0, 0.4)',
        float:   '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
