/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'macos-bg': 'rgba(30, 30, 30, 0.85)',
        'macos-sidebar': 'rgba(40, 40, 40, 0.95)',
        'macos-hover': 'rgba(60, 60, 60, 0.9)',
        'macos-border': 'rgba(255, 255, 255, 0.1)',
        'macos-text': 'rgba(255, 255, 255, 0.9)',
        'macos-text-secondary': 'rgba(255, 255, 255, 0.6)',
      },
      backdropBlur: {
        'macos': '20px',
      },
    },
  },
  plugins: [],
}