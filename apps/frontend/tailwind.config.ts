/* eslint-disable @typescript-eslint/naming-convention */
import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      gridTemplateRows: {
        editor: '3rem minmax(0, 1fr)'
      },
      fontFamily: {
        sans: ['Pretendard Variable', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono]
      },
      colors: {
        primary: {
          DEFAULT: '#3581FA',
          light: '#5FA4F5',
          strong: '#0760EF',
          heavy: '#0348B2'
        },
        secondary: '#30D7AE',
        level: {
          text: {
            1: '#FF5777',
            2: '#FFAA33',
            3: '#35C759',
            4: '#00BDDE',
            5: '#8266F5'
          },
          bg: {
            1: '#FED7DE',
            2: '#FFF5CC',
            3: '#D8F4DE',
            4: '#C4F6FF',
            5: '#E0D9FC'
          }
        },
        error: '#FF3B2F'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [animate, typography, require('tailwind-scrollbar-hide')]
} satisfies Config
