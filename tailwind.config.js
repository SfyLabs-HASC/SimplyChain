// ===============================================
// FILE: tailwind.config.ts
// ===============================================
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0f',
        card: '#141418',
        primary: {
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#22d3ee',
          foreground: '#001014',
        },
        border: '#26262c',
        muted: {
          foreground: '#9ca3af',
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,0.2), 0 10px 40px rgba(124,58,237,0.25)'
      }
    },
  },
  plugins: [],
}