/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens defined per spec:
        day: {
          bg: '#E9EDF2',
          surface: '#E9EDF2',
          text: '#202B3D',
          muted: '#596579',
          accent: '#4361EE',
          border: '#D8DEE8',
        },
        night: {
          bg: '#171E2B',
          surface: '#1C2534',
          text: '#EDF2FA',
          muted: '#A8B4C7',
          accent: '#8298FF',
          border: '#2A3649',
        },
        status: {
          success: '#10B981', // green
          warning: '#F59E0B', // dark orange/amber
          danger: '#EF4444',  // red
          info: '#3B82F6',    // blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        // Day neumorphism tokens
        'neu-flat': '8px 8px 16px #c5c9ce, -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 10px #c9ced4, -4px -4px 10px #ffffff',
        'neu-card': '10px 10px 20px #c5c9ce, -10px -10px 20px #ffffff',
        'neu-card-hover': '12px 12px 24px #bcc0c5, -12px -12px 24px #ffffff',
        'neu-pressed': 'inset 4px 4px 8px #c5c9ce, inset -4px -4px 8px #ffffff',
        'neu-input': 'inset 3px 3px 6px #c5c9ce, inset -3px -3px 6px #ffffff',

        // Night neumorphism tokens
        'neu-dark-flat': '8px 8px 18px #111620, -8px -8px 18px #232e42',
        'neu-dark-sm': '4px 4px 10px #111620, -4px -4px 10px #232e42',
        'neu-dark-card': '10px 10px 22px #111620, -10px -10px 22px #232e42',
        'neu-dark-card-hover': '12px 12px 26px #0d121b, -12px -12px 26px #27344b',
        'neu-dark-pressed': 'inset 4px 4px 8px #111620, inset -4px -4px 8px #27344b',
        'neu-dark-input': 'inset 3px 3px 6px #111620, inset -3px -3px 6px #27344b',
      },
      borderRadius: {
        'card': '22px',
        'btn': '14px',
        'input': '14px',
      }
    },
  },
  plugins: [],
}

