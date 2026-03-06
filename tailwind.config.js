/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        'bg-primary':  '#190019',
        'bg-card':     '#2B124C',
        'bg-elevated': '#522B5B',
        'bg-muted':    '#854F6C',
        'text-primary':'#FBE4D8',
        'text-soft':   '#DFB6B2',
        'text-muted':  '#854F6C',
        // Risk
        'risk-low':      '#22C55E',
        'risk-medium':   '#EAB308',
        'risk-high':     '#F97316',
        'risk-critical': '#EF4444',
        // AI
        'ai-bg':     '#1E0A3C',
        'ai-border': '#7C3AED',
        'ai-text':   '#C4B5FD',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card':     '0 4px 24px rgba(25, 0, 25, 0.6)',
        'elevated': '0 8px 40px rgba(25, 0, 25, 0.8)',
        'glow':     '0 0 20px rgba(133, 79, 108, 0.3)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease both',
        'fade-in':    'fadeIn 0.4s ease both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(133, 79, 108, 0)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(133, 79, 108, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
