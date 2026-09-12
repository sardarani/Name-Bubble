/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        waterRipple: {
          '0%': { transform: 'scale(0.2)', opacity: '0.85' },
          '50%': { opacity: '0.5' },
          '100%': { transform: 'scale(3.0)', opacity: '0' },
        },
      },
      animation: {
        'ripple-1': 'waterRipple 5s cubic-bezier(0.1, 0.8, 0.3, 1) 0s infinite',
        'ripple-2': 'waterRipple 5s cubic-bezier(0.1, 0.8, 0.3, 1) 1.25s infinite',
        'ripple-3': 'waterRipple 5s cubic-bezier(0.1, 0.8, 0.3, 1) 2.5s infinite',
        'ripple-4': 'waterRipple 5s cubic-bezier(0.1, 0.8, 0.3, 1) 3.75s infinite',
      },
    },
  },
  plugins: [],
}

