/* eslint-disable @typescript-eslint/naming-convention */
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      current: colors.current,
      default: '#212529',
      yellow: '#f3ec53',
      green: {
        DEFAULT: '#8dc63f',
        dark: '#2d4e00'
      },
      gray: {
        light: '#f1f3f6',
        DEFAULT: '#cdcdcd',
        dark: '#7c7a7b'
      },
      blue: {
        DEFAULT: '#2279fd',
        dark: '#002d71'
      },
      red: '#ff6663',
      text: {
        title: '#7c7a7b',
        subtitle: '#173747',
        DEFAULT: '#212529'
      },
      slate: {
        50: '#eceff0',
        100: '#dadfe2',
        200: '#b5bfc4',
        300: '#8f9fa7',
        400: '#6a7f89',
        500: '#455f6c',
        600: '#2e4b59',
        700: '#173747', // Basis (Problem.vue)
        800: '#122c39',
        900: '#0e212b'
      },
      level: {
        1: '#CC99C9',
        2: '#9EC1CF',
        3: '#A1F2C2',
        4: '#B8FF81',
        5: '#F3EC53',
        6: '#FEB144',
        7: '#FF6663'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Noto Sans KR', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono]
      },
      spacing: {
        page: '156px',
        'page-sm': '80px'
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: ''
            },
            'code::after': {
              content: ''
            },
            'blockquote p:last-of-type::after': {
              content: ''
            },
            'blockquote p:first-of-type::before': {
              content: ''
            }
          }
        }
      }
    }
  },
  plugins: [forms, typography]
} satisfies Config
