/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: '#0f0f23',
          'bg-secondary': '#1a1a2e',
          'bg-accent': '#16213e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
        },
        accent: {
          primary: '#4f46e5',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        border: '#374151',
      },
      boxShadow: {
        'light': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'medium': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'heavy': '0 8px 16px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}