import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#FDF2F4',
          100: '#FBE4E8',
          200: '#F7CCD5',
          300: '#F0A4B3',
          400: '#E47087',
          500: '#D33D5E',
          600: '#B42244',
          700: '#8E1634',
          800: '#6E1129',
          900: '#540D20',
          950: '#340612',
        },
        cream: {
          50: '#FDFBF9',
          100: '#FAF6F2',
          200: '#F5ECE4',
          300: '#EFE2D6',
          400: '#E2CEBF',
        },
        charcoal: {
          900: '#1A1517',
          800: '#2C2528',
          700: '#40383C',
          600: '#5C5257',
          500: '#7B6F75',
          400: '#A499A0',
          300: '#CCC4C9',
          200: '#E6E0E3',
          100: '#F3EFF1',
        }
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(110, 17, 41, 0.06)',
        'soft-lg': '0 15px 35px -5px rgba(110, 17, 41, 0.10)',
        'burgundy-glow': '0 10px 25px -5px rgba(110, 17, 41, 0.35)',
        'gold-glow': '0 10px 25px -5px rgba(234, 179, 8, 0.35)',
        'rose-glow': '0 10px 25px -5px rgba(244, 63, 94, 0.25)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slide-up': 'fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.08)' },
        },
        rotateSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.82)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
};
export default config;
