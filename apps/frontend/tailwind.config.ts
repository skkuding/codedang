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
          light: '#619CFB',
          strong: '#0760EF',
          heavy: '#0348B2'
        },
        background: {
          DEFAULT: '#FFF',
          alternative: '#FAFAFA'
        },
        line: {
          DEFAULT: '#D8D8D8',
          neutral: '#E1E1E1'
        },
        fill: {
          DEFAULT: '#F0F0F0',
          neutral: '#E5E5E5'
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
          },
          1: '#FED7DE',
          2: '#FFF5CC',
          3: '#D8F4DE',
          4: '#C4F6FF',
          5: '#E0D9FC'
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
  safelist: [
    // 기존 항목
    '!text-green-500',
    '!text-neutral-400',
    '!text-red-500',
    // primary 계열
    'bg-primary',
    'bg-primary-light',
    'bg-primary-strong',
    'bg-primary-heavy',
    // background 계열
    'bg-background',
    'bg-background-alternative',
    // line 계열
    'bg-line',
    'bg-line-neutral',
    // fill 계열
    'bg-fill',
    'bg-fill-neutral',
    // secondary, error
    'bg-secondary',
    'bg-error',
    // level (dark)
    'bg-level-dark-1',
    'bg-level-dark-2',
    'bg-level-dark-3',
    'bg-level-dark-4',
    'bg-level-dark-5',
    // level (light)
    'bg-level-light-1',
    'bg-level-light-2',
    'bg-level-light-3',
    'bg-level-light-4',
    'bg-level-light-5',
    // level (default)
    'bg-level-1',
    'bg-level-2',
    'bg-level-3',
    'bg-level-4',
    'bg-level-5'
  ]
} satisfies Config
