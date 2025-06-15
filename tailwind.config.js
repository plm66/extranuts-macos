/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // macOS System Colors
        'macos-bg': 'rgba(30, 30, 30, 0.85)',
        'macos-sidebar': 'rgba(40, 40, 40, 0.95)',
        'macos-hover': 'rgba(60, 60, 60, 0.9)',
        'macos-border': 'rgba(255, 255, 255, 0.1)',
        'macos-text': 'rgba(255, 255, 255, 0.9)',
        'macos-text-secondary': 'rgba(255, 255, 255, 0.6)',
        
        // Category Colors (from color-palettes.html research)
        'category-personal': '#3B82F6',
        'category-work': '#F59E0B',
        'category-projects': '#8B5CF6',
        'category-ideas': '#EC4899',
        'category-research': '#06B6D4',
        'category-important': '#EF4444',
        'category-draft': '#F97316',
        'category-archive': '#6B7280',
        
        // Category Glassmorphism Variants (15% opacity backgrounds)
        'category-personal-glass': 'rgba(59, 130, 246, 0.15)',
        'category-work-glass': 'rgba(245, 158, 11, 0.15)',
        'category-projects-glass': 'rgba(139, 92, 246, 0.15)',
        'category-ideas-glass': 'rgba(236, 72, 153, 0.15)',
        'category-research-glass': 'rgba(6, 182, 212, 0.15)',
        'category-important-glass': 'rgba(239, 68, 68, 0.15)',
        'category-draft-glass': 'rgba(249, 115, 22, 0.15)',
        'category-archive-glass': 'rgba(107, 114, 128, 0.15)',
        
        // Category Border Variants (30% opacity borders)
        'category-personal-border': 'rgba(59, 130, 246, 0.3)',
        'category-work-border': 'rgba(245, 158, 11, 0.3)',
        'category-projects-border': 'rgba(139, 92, 246, 0.3)',
        'category-ideas-border': 'rgba(236, 72, 153, 0.3)',
        'category-research-border': 'rgba(6, 182, 212, 0.3)',
        'category-important-border': 'rgba(239, 68, 68, 0.3)',
        'category-draft-border': 'rgba(249, 115, 22, 0.3)',
        'category-archive-border': 'rgba(107, 114, 128, 0.3)',
        
        // Category Text Variants (lighter versions for readability)
        'category-personal-text': '#93C5FD',
        'category-work-text': '#FDE68A',
        'category-projects-text': '#C4B5FD',
        'category-ideas-text': '#F9A8D4',
        'category-research-text': '#67E8F9',
        'category-important-text': '#FCA5A5',
        'category-draft-text': '#FDBA74',
        'category-archive-text': '#D1D5DB',
      },
      backdropBlur: {
        'macos': '20px',
      },
    },
  },
  plugins: [],
}