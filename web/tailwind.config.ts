import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0c0c0c',
        surface: '#141414',
        'surface-elevated': '#1c1c1c',
        'surface-hover': '#242424',
        border: '#2a2a2a',
        'border-accent': '#3d3d3d',
        'text-primary': '#f0f0f0',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        accent: {
          DEFAULT: '#d4a574',
          hover: '#e6b885',
          muted: '#d4a57433',
        },
        success: '#7cb87c',
        warning: '#e6c84c',
        danger: '#d96c6c',
        'output-a': '#6b9ac4',
        'output-b': '#c47dbe',
      },
      fontFamily: {
        sans: ['Source Sans 3', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'subheading': ['1.25rem', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'glow': '0 0 20px -5px var(--accent-muted)',
        'glow-lg': '0 0 40px -10px var(--accent-muted)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config