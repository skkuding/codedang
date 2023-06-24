module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  htmlWhitespaceSensitivity: 'ignore',
  plugins: [
    require('@trivago/prettier-plugin-sort-imports'),
    require('prettier-plugin-tailwindcss')
  ],
  importOrderParserPlugins: [
    'typescript',
    'classProperties',
    'decorators-legacy'
  ],
  importOrder: [
    '^@nestjs(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@libs/(.*)$',
    '^@admin/(.*)$',
    '^@client/(.*)$',
    '^[./]'
  ]
}
