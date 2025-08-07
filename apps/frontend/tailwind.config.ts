import typography from '@tailwindcss/typography'
import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './libs/**/*.{ts,tsx}'
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
        color: {
          commmon: {
            100: '#FFF',
            0: '#000'
          },
          neutral: {
            99: '#FAFAFA',
            95: '#E5E5E5',
            90: '#C4C4C4',
            80: '#B0B0B0',
            70: '#9B9B9B',
            60: '#8A8A8A',
            50: '#737373',
            40: '#5C5C5C',
            30: '#474747',
            20: '#2A2A2A',
            15: '#1C1C1C',
            10: '#171717',
            5: '#0F0F0F'
          },
          red: {
            95: '#FFECEA',
            90: '#FFD8D6',
            80: '#FFB2AD',
            70: '#FF8B85',
            60: '#FF645C',
            50: '#FF3B2F',
            40: '#F50D00',
            30: '#B80901',
            20: '#7B0700',
            10: '#3D0300',
            5: '#1F0200'
          },
          orange: {
            95: '#FFF4E5',
            90: '#FEEACC',
            80: '#FFD599',
            70: '#FFBF65',
            60: '#FFAA33',
            50: '#FF9500',
            40: '#CC7702',
            30: '#995901',
            20: '#663C00',
            10: '#331E00',
            5: '#1A0F00'
          },
          yellow: {
            95: '#FFFAE5',
            90: '#FFF5CC',
            80: '#FFEB99',
            70: '#FFE066',
            60: '#FED732',
            50: '#FFCC02',
            40: '#CCA300',
            30: '#997A00',
            20: '#665201',
            10: '#332900',
            5: '#1A1400'
          },
          lime: {
            95: '#EDFEE1',
            90: '#DBFEC2',
            80: '#BBFD8C',
            70: '#98FC51',
            60: '#73FA13',
            50: '#58CF05',
            40: '#46A504',
            30: '#367D02',
            20: '#245502',
            10: '#122801',
            5: '#081400'
          },
          green: {
            95: '#EBFAEF',
            90: '#D8F4DE',
            80: '#AFEABC',
            70: '#86DF9C',
            60: '#59D478',
            50: '#35C759',
            40: '#289E47',
            30: '#1F7936',
            20: '#165124',
            10: '#0B2812',
            5: '#051409'
          },
          cyan: {
            95: '#DEFAFF',
            90: '#C4F6FF',
            80: '#8AEDFF',
            70: '#57DFF7',
            60: '#28D0ED',
            50: '#00BDDE',
            40: '#0098B2',
            30: '#006F82',
            20: '#004854',
            10: '#00252B',
            5: '#001114'
          },
          blue: {
            95: '#EAF3FF',
            90: '#D7E5FE',
            80: '#AFCDFD',
            70: '#88B4FC',
            60: '#619CFB',
            50: '#3581FA',
            40: '#0760EF',
            30: '#0348B2',
            20: '#033077',
            10: '#01183C',
            5: '#010C1E'
          },
          violet: {
            95: '#F0ECFF',
            90: '#E0D9FC',
            80: '#C2B2FA',
            70: '#A28CF7',
            60: '#8266F5',
            50: '#6541F2',
            40: '#3B10E5',
            30: '#2C0CAC',
            20: '#1E0873',
            10: '#0F0439',
            5: '#07021D'
          },
          pink: {
            95: '#FFEBEE',
            90: '#FED7DE',
            80: '#FFADBD',
            70: '#FF8098',
            60: '#FF5777',
            50: '#FF2C55',
            40: '#F0002E',
            30: '#B30122',
            20: '#7A0017',
            10: '#3D000C',
            5: '#1F0006'
          }
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
    {
      handler: ({ addUtilities }) => {
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
    }
  ]
} satisfies Config
