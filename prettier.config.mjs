import sortImports from '@trivago/prettier-plugin-sort-imports'
import tailwindcss from 'prettier-plugin-tailwindcss'

export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  htmlWhitespaceSensitivity: 'ignore',
  plugins: [sortImports, tailwindcss],
  importOrderParserPlugins: [
    'typescript',
    'classProperties',
    'decorators-legacy'
  ],
  importOrder: [
    '^@nestjs(.*)$',
    '^@generated$',
    '<THIRD_PARTY_MODULES>',
    '^@libs/(.*)$',
    '^@admin/(.*)$',
    '^@client/(.*)$',
    '^[./]'
  ]
}
