import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import defaultTheme from 'tailwindcss/defaultTheme'
import type { PluginAPI } from 'tailwindcss/types/config'

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
          dark: {
            1: '#35C759',
            2: '#3581FA',
            3: '#FF9500',
            4: '#6541F2',
            5: '#FF2C55'
          },
          light: {
            1: '#D8F4DE',
            2: '#D7E5FE',
            3: '#FEEACC',
            4: '#E0D9FC',
            5: '#FED7DE'
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
      },
      borderRadius: {
        'tab-button': '2.22px'
      }
    }
  },
  plugins: [
    animate,
    typography,
    function ({ addUtilities }: { addUtilities: PluginAPI['addUtilities'] }) {
      addUtilities({
        '.hide-spin-button': {
          appearance: 'textfield',
          '&::-webkit-inner-spin-button': {
            appearance: 'none'
          },
          '&::-webkit-outer-spin-button': {
            appearance: 'none'
          }
        }
      })
    }
  ],
  safelist: ['!text-green-500', '!text-neutral-400', '!text-red-500']
} satisfies Config
