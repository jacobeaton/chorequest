/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#7C3AED',
          teal: '#0D9488',
          yellow: '#F59E0B',
          pink: '#EC4899',
        }
      },
      animation: {
        'bob': 'bob 2s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'blink': 'blink 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
        'flash': 'flash 0.3s ease-in-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px currentColor)' },
          '50%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        },
        floatUp: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-60px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-8px)' },
          '80%': { transform: 'translateX(8px)' },
        },
        flash: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
