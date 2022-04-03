/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      gray: colors.gray,
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
      zinc: colors.zinc,
      neutral: colors.neutral,
      stone: colors.stone,
      amber: colors.amber,
      yellow: colors.yellow,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      funchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
      red: colors.red,
      orange: {
        100: '#ffecd9',
        200: '#ffd9b3',
        300: '#ffc58e',
        400: '#ffb268',
        500: '#ff9f42', // Basis
        600: '#cc7f35',
        700: '#995f28',
        800: '#66401a',
        900: '#33200d'
      },
      lime: {
        50: '#f4f9ec',
        100: '#e8f4d9',
        200: '#d1e8b2',
        300: '#bbdd8c',
        400: '#a4d165',
        500: '#8dc63f', // Basis
        600: '#719e32',
        700: '#557726',
        800: '#384f19',
        900: '#1c280d'
      },
      sky: {
        50: '#ebf4fc',
        100: '#d6e9fa',
        200: '#add3f5',
        300: '#85bdef',
        400: '#5ca7ea',
        500: '#3391e5', // Basis
        600: '#2974b7',
        700: '#1f5789',
        800: '#143a5c',
        900: '#0a1d2e'
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
      }
    }
  },
  plugins: []
}
