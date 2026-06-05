/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        accent: '#2C41FC',
        'text-primary': '#F1F1F3',
        'text-muted': '#8A8A90',
        'glass-surface': 'rgba(255, 255, 255, 0.06)',
        'border-subtle': 'rgba(255, 255, 255, 0.1)',
        'iphone-frame': '#111217',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'tight': '-0.025em',
      },
      borderRadius: {
        'iphone': '3rem',
        'dynamic-island': '1.25rem',
      },
      animation: {
        'shine': 'shine 2s ease-in-out infinite',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
    },
  },
  plugins: [],
}
